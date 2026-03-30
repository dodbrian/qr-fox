/**
 * Test setup file
 * Mocks browser APIs like chrome.i18n and chrome.tabs
 */

import { vi } from "vitest";

// Mock chrome API
globalThis.chrome = {
  i18n: {
    getMessage: vi.fn((messageKey: string) => {
      const messages: Record<string, string> = {
        extensionName: "QR-Fox",
        extensionDescription:
          "Shows a QR-code of the current page (PNG, copy & download).",
        actionTitle: "Show QR-code",
        commandDescription: "Open QR-code popup",
        popupTitle: "QR Code",
        uiCopyButton: "Copy",
        uiDownloadButton: "Download",
        successCopyMessage: "QR code copied to clipboard",
        errorCopyFailed: "Failed to copy QR code to clipboard",
        errorDownloadFailed: "Failed to download QR code",
        errorNoActiveTab: "No active tab found",
        errorMissingUrl: "URL parameter is missing",
        errorQRGeneration: "QR generation failed",
        errorQRContainer: "QR container element not found",
        errorSVGParsing: "Failed to parse generated SVG",
        errorSVGDimensions: "Invalid SVG dimensions",
        errorCanvasContext: "Failed to get canvas context",
        errorSVGConversion: "SVG to PNG conversion failed",
        errorPopupInit: "Unable to display QR code",
        defaultPageTitle: "qr-code",
      };
      return messages[messageKey] || `[Missing: ${messageKey}]`;
    }),
    getUILanguage: vi.fn(() => "en"),
  },
  tabs: {
    query: vi.fn(),
  },
  action: {
    openPopup: vi.fn(),
  },
  commands: {
    onCommand: {
      addListener: vi.fn(),
    },
  },
};

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    write: vi.fn(),
  },
});

// Mock OffscreenCanvas
global.OffscreenCanvas = class {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getContext(): CanvasRenderingContext2D {
    return {
      fillStyle: "",
      fillRect: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
    } as unknown as CanvasRenderingContext2D;
  }

  convertToBlob(): Promise<Blob> {
    return Promise.resolve(new Blob([""], { type: "image/png" }));
  }
} as unknown as typeof OffscreenCanvas;

// Mock URL API for blob
global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

// Mock DOMParser
global.DOMParser = class {
  parseFromString(): Document {
    const doc = {
      documentElement: {
        tagName: "svg",
        getAttribute: vi.fn((attr: string) => {
          if (attr === "width" || attr === "height") return "200";
          return null;
        }),
      },
    };
    return doc as unknown as Document;
  }
} as unknown as typeof DOMParser;
