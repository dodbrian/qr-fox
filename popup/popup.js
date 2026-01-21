(async () => {
  try {
    // ----- Retrieve URL and page title from query string -----
    const qs = new URLSearchParams(location.search);
    const url = qs.get("url") || "";
    const title = qs.get("title") || "qr-code";

    // ----- Validate URL input -----
    if (!url) {
      throw new Error("URL parameter is missing");
    }

    // ----- Display URL in input field -----
    const urlInput = document.getElementById("url-display");
    if (urlInput) {
      urlInput.value = url;
    }

    // ----- Close button functionality -----
    const closeBtn = document.getElementById("close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        window.close();
      });
    }

    // ----- Dark‑mode detection -----
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // ----- Generate SVG QR -----
    const { generateQR } = await import("./qr-generator.js");
    let svgString;
    try {
      svgString = generateQR(url, { dark: isDark });
    } catch (error) {
      throw new Error(`QR generation failed: ${error.message}`);
    }

    // ----- Display SVG in popup -----
    const qrContainer = document.getElementById("qr");
    if (!qrContainer) {
      throw new Error("QR container element not found");
    }

    // Clear container using removeChild for safety
    while (qrContainer.firstChild) {
      qrContainer.removeChild(qrContainer.firstChild);
    }

    const svgParser = new DOMParser();
    const doc = svgParser.parseFromString(svgString, "image/svg+xml");

    // Check for parsing errors
    if (doc.documentElement.tagName === "parsererror") {
      throw new Error("Failed to parse generated SVG");
    }

    const svgElement = doc.documentElement;
    qrContainer.appendChild(svgElement);

    // ----- Convert SVG → PNG using OffscreenCanvas -----
    let pngBlob;
    try {
      const w = parseInt(svgElement.getAttribute("width"), 10);
      const h = parseInt(svgElement.getAttribute("height"), 10);

      if (!w || !h || w <= 0 || h <= 0) {
        throw new Error("Invalid SVG dimensions");
      }

      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get canvas context");
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
        `SVG to PNG conversion failed: ${conversionError.message}`,
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
        alert("QR image copied to clipboard");
      } catch (clipboardError) {
        console.error("Clipboard copy failed:", clipboardError);
        alert("Failed to copy to clipboard");
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
        alert("Failed to download QR image");
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
      errorP.textContent = `Error: ${error.message}`;
      qrContainer.appendChild(errorP);
    }
  }
})();
