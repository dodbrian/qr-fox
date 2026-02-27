/**
 * QR code scanner tests to verify generated QR codes are readable
 */
import { generateQR } from "../src/popup/qr-generator";
import jsQR from "jsqr";

/**
 * Parse SVG and extract QR code matrix as image data for jsQR scanning.
 * @param svgString - The SVG string to parse.
 * @returns Image data object or null if parsing fails.
 */
function svgToImageData(
  svgString: string,
): { data: Uint8ClampedArray; width: number; height: number } | null {
  const widthMatch = svgString.match(/width="(\d+)"/);
  const heightMatch = svgString.match(/height="(\d+)"/);
  if (!widthMatch || !heightMatch) return null;

  const width = parseInt(widthMatch[1], 10);
  const height = parseInt(heightMatch[1], 10);

  const rectRegex =
    /<rect\s+x="(\d+)"\s+y="(\d+)"\s+width="(\d+)"\s+height="(\d+)"\s+fill="([^"]+)"\/>/g;

  const pixels = new Uint8ClampedArray(width * height * 4);

  // Initialize with white background
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 255;
    pixels[i + 1] = 255;
    pixels[i + 2] = 255;
    pixels[i + 3] = 255;
  }

  let match;
  while ((match = rectRegex.exec(svgString)) !== null) {
    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);
    const w = parseInt(match[3], 10);
    const fill = match[5];

    // Skip white/transparent fills (background)
    if (fill === "#fff" || fill === "#00000000") continue;

    // Black module - moduleSize is always 8
    const moduleSize = 8;
    for (let py = y; py < y + moduleSize && py < height; py++) {
      for (let px = x; px < x + w && px < width; px++) {
        const idx = (py * width + px) * 4;
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 255;
      }
    }
  }

  return { data: pixels, width, height };
}

describe("QR Code Scanner", () => {
  // Test URLs from bug reports
  const bugReportUrls = [
    "https://storage.googleapis.com/istories/stories/2024/07/17/kopii-amerikanskikh-bespilotnikov-dlya-rossii/index.html",
    "https://www.barnimerland.de/de/bewegbar/wasser/anbieter/artikel-stand-up-paddle-verleih-werbellinkanal.html",
    "https://meduza.io/news/2026/02/27/v-metro-berlina-poyavilis-plakaty-na-russkom-ey-imey-hot-kaplyu-uvazheniya-mudak-sdelay-telefon-potishe-nikto-ne-znaet-kto-eto-sdelal",
  ];

  bugReportUrls.forEach((url) => {
    it(`should generate scannable QR code for: ${url.substring(0, 50)}...`, () => {
      const svg = generateQR(url);
      const imageData = svgToImageData(svg);

      expect(imageData).not.toBeNull();
      if (!imageData) return;

      const result = jsQR(imageData.data, imageData.width, imageData.height);

      expect(result).not.toBeNull();
      expect(result?.data).toBe(url);
    });
  });

  it("should scan a simple URL", () => {
    const url = "https://example.com";
    const svg = generateQR(url);
    const imageData = svgToImageData(svg);

    expect(imageData).not.toBeNull();
    if (!imageData) return;

    const result = jsQR(imageData.data, imageData.width, imageData.height);
    expect(result).not.toBeNull();
    expect(result?.data).toBe(url);
  });

  it("should scan QR codes of various sizes", () => {
    const testCases = [
      "A", // Shortest possible
      "Hello World", // Simple text
      "https://example.com/path?query=value&foo=bar", // URL with params
      "The quick brown fox jumps over the lazy dog. 1234567890", // Longer text
    ];

    for (const text of testCases) {
      const svg = generateQR(text);
      const imageData = svgToImageData(svg);

      expect(imageData).not.toBeNull();
      if (!imageData) continue;

      const result = jsQR(imageData.data, imageData.width, imageData.height);
      expect(result).not.toBeNull();
      expect(result?.data).toBe(text);
    }
  });
});
