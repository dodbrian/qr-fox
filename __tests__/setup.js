/**
 * Jest test setup file
 * Mocks browser APIs like chrome.i18n and chrome.tabs
 */

// Mock chrome API
global.chrome = {
  i18n: {
    getMessage: jest.fn((messageKey) => {
      const messages = {
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
    getUILanguage: jest.fn(() => "en"),
  },
  tabs: {
    query: jest.fn(),
  },
  action: {
    openPopup: jest.fn(),
  },
  commands: {
    onCommand: {
      addListener: jest.fn(),
    },
  },
};

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    write: jest.fn(),
  },
});

// Mock OffscreenCanvas
global.OffscreenCanvas = class {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  getContext() {
    return {
      fillStyle: "",
      fillRect: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
    };
  }

  convertToBlob() {
    return Promise.resolve(new Blob([""], { type: "image/png" }));
  }
};

// Mock URL API for blob
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

// Mock DOMParser
global.DOMParser = class {
  parseFromString(svg, type) {
    const doc = {
      documentElement: {
        tagName: "svg",
        getAttribute: jest.fn((attr) => {
          if (attr === "width" || attr === "height") return "200";
          return null;
        }),
      },
    };
    return doc;
  }
};
