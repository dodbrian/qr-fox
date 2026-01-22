/**
 * i18n functionality tests
 * Tests for internationalization implementation in QR-Fox
 */

const fs = require("fs");
const path = require("path");

const projectRoot = path.dirname(__dirname);

describe("i18n Functionality", () => {
  describe("Locale Files", () => {
    it("should have a _locales directory", () => {
      const localesDir = path.join(projectRoot, "_locales");
      expect(fs.existsSync(localesDir)).toBe(true);
    });

    it("should have at least English locale", () => {
      const enPath = path.join(projectRoot, "_locales", "en", "messages.json");
      expect(fs.existsSync(enPath)).toBe(true);
    });

    it("should have valid JSON in all locale files", () => {
      const localesDir = path.join(projectRoot, "_locales");
      const locales = fs.readdirSync(localesDir);

      for (const locale of locales) {
        const messagesPath = path.join(localesDir, locale, "messages.json");
        const content = fs.readFileSync(messagesPath, "utf-8");

        expect(() => JSON.parse(content)).not.toThrow();
      }
    });

    it("should have consistent message keys across locales", () => {
      const localesDir = path.join(projectRoot, "_locales");
      const locales = fs.readdirSync(localesDir);
      const allKeys = {};

      for (const locale of locales) {
        const messagesPath = path.join(localesDir, locale, "messages.json");
        const content = fs.readFileSync(messagesPath, "utf-8");
        const messages = JSON.parse(content);
        allKeys[locale] = Object.keys(messages).sort();
      }

      // Compare all locales to English
      expect(allKeys.en).toBeDefined();
      const enKeys = new Set(allKeys.en);
      for (const locale of locales) {
        if (locale === "en") continue;
        const localeKeys = new Set(allKeys[locale]);

        // Check no missing keys
        const missing = [...enKeys].filter((k) => !localeKeys.has(k));
        expect(missing).toEqual([]);

        // Check no extra keys
        const extra = [...localeKeys].filter((k) => !enKeys.has(k));
        expect(extra).toEqual([]);
      }
    });
  });

  describe("Message Format", () => {
    it("should have required message and description fields", () => {
      const enPath = path.join(projectRoot, "_locales", "en", "messages.json");
      const content = fs.readFileSync(enPath, "utf-8");
      const messages = JSON.parse(content);

      for (const [, value] of Object.entries(messages)) {
        expect(value).toHaveProperty("message");
        expect(typeof value.message).toBe("string");
        expect(value.message.length).toBeGreaterThan(0);

        // Description is recommended but not strictly required
        if (value.description) {
          expect(typeof value.description).toBe("string");
        }
      }
    });

    it("should have valid key naming convention (camelCase)", () => {
      const enPath = path.join(projectRoot, "_locales", "en", "messages.json");
      const content = fs.readFileSync(enPath, "utf-8");
      const messages = JSON.parse(content);

      for (const key of Object.keys(messages)) {
        expect(/^[a-z][a-zA-Z0-9]*$/.test(key)).toBe(true);
      }
    });
  });

  describe("chrome.i18n API", () => {
    it("should mock getMessage correctly", () => {
      const message = chrome.i18n.getMessage("extensionName");
      expect(message).toBe("QR-Fox");
    });

    it("should mock getUILanguage correctly", () => {
      const lang = chrome.i18n.getUILanguage();
      expect(lang).toBe("en");
    });

    it("should return fallback for missing keys", () => {
      const message = chrome.i18n.getMessage("nonexistent");
      expect(message).toBe("[Missing: nonexistent]");
    });

    it("should have key for each user-facing string", () => {
      const requiredKeys = [
        "extensionName",
        "extensionDescription",
        "actionTitle",
        "popupTitle",
        "uiCopyButton",
        "uiDownloadButton",
        "successCopyMessage",
        "errorCopyFailed",
        "errorDownloadFailed",
        "errorNoActiveTab",
        "errorMissingUrl",
        "errorQRGeneration",
        "errorQRContainer",
        "errorSVGParsing",
        "errorSVGDimensions",
        "errorCanvasContext",
        "errorSVGConversion",
        "errorPopupInit",
        "defaultPageTitle",
      ];

      const enPath = path.join(projectRoot, "_locales", "en", "messages.json");
      const content = fs.readFileSync(enPath, "utf-8");
      const messages = JSON.parse(content);
      const messageKeys = Object.keys(messages);

      for (const key of requiredKeys) {
        expect(messageKeys).toContain(key);
      }
    });
  });

  describe("Message Content", () => {
    it("should have non-empty messages", () => {
      const enPath = path.join(projectRoot, "_locales", "en", "messages.json");
      const content = fs.readFileSync(enPath, "utf-8");
      const messages = JSON.parse(content);

      for (const [, value] of Object.entries(messages)) {
        expect(value.message.trim().length).toBeGreaterThan(0);
      }
    });

    it("should have reasonable message length", () => {
      const enPath = path.join(projectRoot, "_locales", "en", "messages.json");
      const content = fs.readFileSync(enPath, "utf-8");
      const messages = JSON.parse(content);

      for (const [, value] of Object.entries(messages)) {
        // Messages should be less than 500 characters
        expect(value.message.length).toBeLessThan(500);
      }
    });

    it("English messages should be properly capitalized", () => {
      const enPath = path.join(projectRoot, "_locales", "en", "messages.json");
      const content = fs.readFileSync(enPath, "utf-8");
      const messages = JSON.parse(content);

      // Check that messages start with capital letter
      const messageEntries = Object.entries(messages);
      for (const [key, value] of messageEntries) {
        // Skip messages that start with lowercase (like filenames)
        if (!["defaultPageTitle"].includes(key)) {
          const firstChar = value.message.charAt(0);
          const isCapitalized = firstChar === firstChar.toUpperCase();
          expect(isCapitalized).toBe(true);
        }
      }
    });
  });

  describe("Locale Coverage", () => {
    it("should support primary languages", () => {
      const localesDir = path.join(projectRoot, "_locales");
      const locales = fs.readdirSync(localesDir);
      const requiredLocales = ["en"];
      const recommendedLocales = ["de", "es", "fr"];

      for (const locale of requiredLocales) {
        expect(locales).toContain(locale);
      }

      // Check that recommended locales are present
      const presentRecommended = recommendedLocales.filter((l) =>
        locales.includes(l),
      );
      expect(presentRecommended.length).toBeGreaterThan(0);
    });

    it("should have translations for all locales", () => {
      const localesDir = path.join(projectRoot, "_locales");
      const locales = fs.readdirSync(localesDir);

      expect(locales.length).toBeGreaterThan(1);

      for (const locale of locales) {
        const messagesPath = path.join(localesDir, locale, "messages.json");
        const content = fs.readFileSync(messagesPath, "utf-8");
        const messages = JSON.parse(content);
        expect(Object.keys(messages).length).toBeGreaterThan(0);
      }
    });
  });
});
