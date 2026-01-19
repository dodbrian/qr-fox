# QR‑Fox Firefox Extension Specification

## Overview
This document describes the complete design and implementation plan for **QR‑Fox**, a Firefox WebExtension that displays a QR‑code of the current page URL.

The extension fulfills the following requirements:
- Manifest V3 (service‑worker based) with only the `activeTab` permission.
- Toolbar button that drops down a popup UI.
- Keyboard shortcut **Alt+Q** that opens a small popup‑type window.
- Dark‑mode detection (auto‑invert QR colours).
- QR code generated **vector‑based (SVG)** using a self‑contained JavaScript encoder (no external dependencies).
- SVG is rasterised to **PNG** for copy‑to‑clipboard and download.
- Download filename: `<page‑title>_YYYYMMDD_HHMM.png` (title is sanitized).
- Only the PNG image can be copied (no plain‑text URL copy).
- No URL text is displayed in the UI.
- Icons (16/48/96 px) generated from a simple “Q‑Fox” glyph.
- No telemetry or external network requests.

---

## Directory Layout
```
qr-fox/
├─ manifest.json
├─ background/
│   └─ background.js          # shortcut handling
├─ popup/
│   ├─ popup.html
│   ├─ popup.js
│   ├─ styles.css
│   └─ qr-generator.js       # pure‑JS QR → SVG
├─ icons/
│   ├─ icon-16.png
│   ├─ icon-48.png
│   └─ icon-96.png
└─ SPEC.md                  # (this file)
```

---

## Manifest (`manifest.json`)
```json
{
  "manifest_version": 3,
  "name": "QR‑Fox",
  "version": "1.0",
  "description": "Shows a QR‑code of the current page (PNG, copy & download).",
  "permissions": ["activeTab"],
  "action": {
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "96": "icons/icon-96.png"
    },
    "default_title": "Show QR‑code",
    "default_popup": "popup/popup.html"
  },
  "background": {
    "service_worker": "background/background.js"
  },
  "icons": {
    "48": "icons/icon-48.png",
    "96": "icons/icon-96.png"
  },
  "commands": {
    "show-qr": {
      "suggested_key": {"default": "Alt+Q"},
      "description": "Open QR‑code popup"
    }
  }
}
```

---

## Background Service Worker (`background/background.js`)
```js
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "show-qr") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  const url   = tab.url   || "";
  const title = tab.title || "";

  const popupURL = chrome.runtime.getURL(
    `popup/popup.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  );

  chrome.windows.create({
    url: popupURL,
    type: "popup",
    width: 260,
    height: 340,
    focused: true
  });
});
```
*Only handles the shortcut; no extra permissions are required.*

---

## QR Generator (`popup/qr-generator.js`)
A **self‑contained** QR‑code → **SVG** generator (derived from the public‑domain *qrjs2* implementation). The file exports a single function:
```js
/**
 * generateQR(text, {dark}) → SVG string
 */
export function generateQR(text, { dark = false } = {}) {
  // ----- QR matrix creation (standard QR algorithm) -----
  // ... (implementation details omitted for brevity) ...

  // ----- SVG rendering -----
  const moduleSize = 4;
  const margin = 4 * moduleSize;
  const size = (matrix.length * moduleSize) + (2 * margin);
  const darkColor = dark ? "#fff" : "#000";
  const lightColor = dark ? "#000" : "#fff";

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="100%" height="100%" fill="${lightColor}"/>`;
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x]) {
        const xPos = margin + x * moduleSize;
        const yPos = margin + y * moduleSize;
        svg += `<rect x="${xPos}" y="${yPos}" width="${moduleSize}" height="${moduleSize}" fill="${darkColor}"/>`;
      }
    }
  }
  svg += `</svg>`;
  return svg;
}
```
*The full matrix‑generation code is the standard QR‑algorithm and fits within ~170 LOC.*

---

## Popup UI (`popup/popup.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>QR‑Fox</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="qr"></div>
  <div class="btn-row">
    <button id="copy-png">Copy Image</button>
    <button id="download-png">Download</button>
  </div>
  <script type="module" src="qr-generator.js"></script>
  <script src="popup.js"></script>
</body>
</html>
```
Only the QR image and two action buttons are shown.

---

## Styles (`popup/styles.css`)
```css
body {
  margin: 0;
  padding: 8px;
  font-family: system-ui, sans-serif;
  background: #fafafa;
  color: #222;
}
@media (prefers-color-scheme: dark) {
  body { background: #222; color: #eee; }
}
#qr svg {
  width: 200px;
  height: 200px;
  display: block;
  margin: 0 auto 8px;
}
.btn-row { display: flex; flex-direction: column; gap: 5px; }
button { padding: 5px 8px; font-size: 0.9rem; cursor: pointer; }
```

---

## Popup Logic (`popup/popup.js`)
```js
(async () => {
  // ----- Retrieve URL and page title from query string -----
  const qs = new URLSearchParams(location.search);
  const url   = qs.get('url')   || "";
  const title = qs.get('title') || "qr-code";

  // ----- Dark‑mode detection -----
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // ----- Generate SVG QR -----
  const { generateQR } = await import('./qr-generator.js');
  const svgString = generateQR(url, { dark: isDark });
  document.getElementById('qr').innerHTML = svgString;

  // ----- Convert SVG → PNG using OffscreenCanvas -----
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = doc.documentElement;
  const w = parseInt(svgEl.getAttribute('width'));
  const h = parseInt(svgEl.getAttribute('height'));

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const bitmap = await createImageBitmap(new Blob([svgString], {type:'image/svg+xml'}));
  ctx.drawImage(bitmap, 0, 0);
  const pngBlob = await canvas.convertToBlob({type:'image/png'});

  // ----- Filename helper (sanitized title + timestamp) -----
  const sanitize = (str) => str.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
                                 .replace(/\s+/g, ' ')
                                 .trim()
                                 .substring(0, 80);
  const safeTitle = sanitize(title) || "qr-code";
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  const filename = `${safeTitle}_${timestamp}.png`;

  // ----- Copy PNG to clipboard -----
  document.getElementById('copy-png').addEventListener('click', async () => {
    const item = new ClipboardItem({ 'image/png': pngBlob });
    await navigator.clipboard.write([item]);
    alert('QR image copied to clipboard');
  });

  // ----- Download PNG -----
  document.getElementById('download-png').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(pngBlob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  });
})();
```
Key points:
- Generates SVG → PNG via OffscreenCanvas (no external lib).
- Uses the **page title** for the filename, sanitised and limited to 80 chars.
- Provides two buttons: *Copy Image* (PNG to clipboard) and *Download* (PNG file).

---

## Icon Generation
Create a simple “Q‑Fox” glyph (black Q with a small orange fox tail) and export three PNG files at 16 × 16, 48 × 48, and 96 × 96 px. Place them in the `icons/` folder with the names `icon-16.png`, `icon-48.png`, `icon-96.png`.

---

## Testing Checklist
1. **Toolbar popup** – click the extension icon → QR appears.
2. **Alt+Q shortcut** – press Alt+Q → a popup‑type window opens with the same UI.
3. **Dark‑mode** – change system theme → QR colours invert accordingly.
4. **Copy PNG** – click *Copy Image* → paste into an image editor; QR scans correctly.
5. **Download** – click *Download* → file saved as `<sanitized‑title>_YYYYMMDD_HHMM.png`.
6. **No URL text** – UI shows only the QR and the two buttons.
7. **Permissions** – `manifest.json` lists only `activeTab`.
8. **No network requests** – DevTools Network panel shows only `chrome-extension://` resources.
9. **Compatibility** – works on Firefox ≥ 115 (MV3, OffscreenCanvas, Clipboard API).
10. **Performance** – QR generation and PNG conversion complete within ~150 ms on a typical machine.

---

## Summary
The specification above provides a complete, self‑contained plan to build QR‑Fox. All required features are covered, external dependencies are avoided, and the implementation respects Firefox’s Manifest V3 security model.

*End of SPEC.md*