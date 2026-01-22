/**
 * Initialize i18n by populating text content for elements with data-i18n attribute.
 * Retrieves localized strings from the Chrome i18n API and updates DOM elements.
 * Also sets the document lang attribute to the current UI language.
 * @returns {void}
 */
function initializeI18n() {
  // Set document language to current UI language
  const uiLanguage = chrome.i18n.getUILanguage();
  document.documentElement.lang = uiLanguage;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const messageKey = element.getAttribute("data-i18n");
    const message = chrome.i18n.getMessage(messageKey);
    if (message) {
      element.textContent = message;
    } else {
      console.warn(`Missing i18n key: "${messageKey}"`);
    }
  });
}

(async () => {
  try {
    // ----- Initialize i18n -----
    initializeI18n();

    // ----- Retrieve URL and page title from active tab -----
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab) {
      throw new Error(chrome.i18n.getMessage("errorNoActiveTab"));
    }

    const url = tab.url || "";
    const title = tab.title || chrome.i18n.getMessage("defaultPageTitle");

    // ----- Validate URL input -----
    if (!url) {
      throw new Error(chrome.i18n.getMessage("errorMissingUrl"));
    }

    // ----- Display URL in input field -----
    const urlInput = document.getElementById("url-display");
    if (urlInput) {
      urlInput.value = url;
      // Automatically select the URL text
      urlInput.select();
    }

    // ----- Dark‑mode detection -----
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // ----- Generate SVG QR -----
    const { generateQR } = await import("./qr-generator.js");
    let svgString;
    try {
      svgString = generateQR(url, { dark: isDark });
    } catch (error) {
      throw new Error(
        `${chrome.i18n.getMessage("errorQRGeneration")}: ${error.message}`,
      );
    }

    // ----- Display SVG in popup -----
    const qrContainer = document.getElementById("qr");
    if (!qrContainer) {
      throw new Error(chrome.i18n.getMessage("errorQRContainer"));
    }

    // Clear container using removeChild for safety
    while (qrContainer.firstChild) {
      qrContainer.removeChild(qrContainer.firstChild);
    }

    const svgParser = new DOMParser();
    const doc = svgParser.parseFromString(svgString, "image/svg+xml");

    // Check for parsing errors
    if (doc.documentElement.tagName === "parsererror") {
      throw new Error(chrome.i18n.getMessage("errorSVGParsing"));
    }

    const svgElement = doc.documentElement;
    qrContainer.appendChild(svgElement);

    // ----- Convert SVG → PNG using OffscreenCanvas -----
    let pngBlob;
    try {
      const w = parseInt(svgElement.getAttribute("width"), 10);
      const h = parseInt(svgElement.getAttribute("height"), 10);

      if (!w || !h || w <= 0 || h <= 0) {
        throw new Error(chrome.i18n.getMessage("errorSVGDimensions"));
      }

      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error(chrome.i18n.getMessage("errorCanvasContext"));
      }

      // Draw background
      ctx.fillStyle = isDark ? "#000" : "#fff";
      ctx.fillRect(0, 0, w, h);

      // Parse and draw SVG rects directly (more reliable than createImageBitmap)
      const rects = svgString.match(/<rect[^>]*>/g) || [];
      ctx.fillStyle = isDark ? "#fff" : "#000";
      for (const rect of rects) {
        // Skip background rect (it has width/height as percentages)
        if (rect.includes('width="100%"')) {
          continue;
        }
        const x = parseInt(rect.match(/x="([^"]*)"/)?.[1] || "0", 10);
        const y = parseInt(rect.match(/y="([^"]*)"/)?.[1] || "0", 10);
        const rectWidth = parseInt(
          rect.match(/width="([^"]*)"/)?.[1] || "1",
          10,
        );
        const rectHeight = parseInt(
          rect.match(/height="([^"]*)"/)?.[1] || "1",
          10,
        );
        ctx.fillRect(x, y, rectWidth, rectHeight);
      }

      pngBlob = await canvas.convertToBlob({ type: "image/png" });
    } catch (conversionError) {
      throw new Error(
        `${chrome.i18n.getMessage("errorSVGConversion")}: ${conversionError.message}`,
      );
    }

    // ----- Filename helper (sanitized title + timestamp) -----
    const sanitizeFilename = (str) =>
      str
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 80);

    const safeTitle = sanitizeFilename(title) || "qr-code";
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    const filename = `${safeTitle}_${timestamp}.png`;

    // ----- Copy PNG to clipboard -----
    document.getElementById("copy-png").addEventListener("click", async () => {
      try {
        const item = new ClipboardItem({ "image/png": pngBlob });
        await navigator.clipboard.write([item]);
        alert(chrome.i18n.getMessage("successCopyMessage"));
      } catch (clipboardError) {
        console.error("Clipboard copy failed:", clipboardError);
        alert(chrome.i18n.getMessage("errorCopyFailed"));
      }
    });

    // ----- Download PNG -----
    document.getElementById("download-png").addEventListener("click", () => {
      try {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(pngBlob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      } catch (downloadError) {
        console.error("Download failed:", downloadError);
        alert(chrome.i18n.getMessage("errorDownloadFailed"));
      }
    });
  } catch (error) {
    console.error("Popup initialization failed:", error);
    const qrContainer = document.getElementById("qr");
    if (qrContainer) {
      const errorP = document.createElement("p");
      errorP.style.color = "red";
      errorP.style.margin = "10px";
      errorP.style.fontSize = "12px";
      errorP.textContent = `${chrome.i18n.getMessage("errorPopupInit")}: ${error.message}`;
      qrContainer.appendChild(errorP);
    }
  }
})();
