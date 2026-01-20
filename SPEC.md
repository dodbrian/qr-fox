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

---

## Background Service Worker (`background/background.js`)
*Only handles the shortcut; no extra permissions are required.*

---

## QR Generator (`popup/qr-generator.js`)
A **self‑contained** QR‑code → **SVG** generator (derived from the public‑domain *qrjs2* implementation). The file exports a single function:
*The full matrix‑generation code is the standard QR‑algorithm and fits within ~170 LOC.*

---

## Popup UI (`popup/popup.html`)
Only the QR image and two action buttons are shown.

---

## Styles (`popup/styles.css`)

---

## Popup Logic (`popup/popup.js`)
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