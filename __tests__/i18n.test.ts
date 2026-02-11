/**
 * i18n functionality tests
 * Tests for internationalization implementation in QR-Fox
 */

import fs from "fs";
import path from "path";

// Use process.cwd() since tests are run from project root
const projectRoot = process.cwd();

interface LocaleMessage {
  message: string;
  description?: string;
}

type LocaleMessages = Record<string, LocaleMessage>;

describe("i18n Functionality", () => {
  describe("Locale Files", () => {
    it("should have a _locales directory", () => {
      const localesDir = path.join(projectRoot, "src/_locales");
      expect(fs.existsSync(localesDir)).toBe(true);
    });

    it("should have at least English locale", () => {
      const enPath = path.join(
        projectRoot,
        "src/_locales",
        "en",
        "messages.json",
      );
      expect(fs.existsSync(enPath)).toBe(true);
    });

    it("should have valid JSON in all locale files", () => {
      const localesDir = path.join(projectRoot, "src/_locales");
      const locales = fs.readdirSync(localesDir);

      for (const locale of locales) {
        const messagesPath = path.join(localesDir, locale, "messages.json");
        const content = fs.readFileSync(messagesPath, "utf-8");

        expect(() => JSON.parse(content)).not.toThrow();
      }
    });

    it("should have consistent message keys across locales", () => {
      const localesDir = path.join(projectRoot, "src/_locales");
      const locales = fs.readdirSync(localesDir);
      const allKeys: Record<string, string[]> = {};

      for (const locale of locales) {
        const messagesPath = path.join(localesDir, locale, "messages.json");
        const content = fs.readFileSync(messagesPath, "utf-8");
        const messages: LocaleMessages = JSON.parse(content);
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
      const enPath = path.join(
        projectRoot,
        "src/_locales",
        "en",
        "messages.json",
      );
      const content = fs.readFileSync(enPath, "utf-8");
      const messages: LocaleMessages = JSON.parse(content);

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
      const enPath = path.join(
        projectRoot,
        "src/_locales",
        "en",
        "messages.json",
      );
      const content = fs.readFileSync(enPath, "utf-8");
      const messages: LocaleMessages = JSON.parse(content);

      for (const key of Object.keys(messages)) {
        expect(/^[a-z][a-zA-Z0-9]*$/.test(key)).toBe(true);
      }
    });
  });

  describe("Message Usage", () => {
    it("should have messages for all manifest keys", () => {
      const manifestPath = path.join(projectRoot, "src/manifest.json");
      const manifestContent = fs.readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestContent);

      const manifestMessageKeys = new Set<string>();

      const extractMessageKeys = (value: unknown) => {
        if (typeof value === "string") {
          const matches = value.match(/__MSG_([a-zA-Z0-9_]+)__/g);
          if (matches) {
            for (const match of matches) {
              const key = match.replace("__MSG_", "").replace("__", "");
              manifestMessageKeys.add(key);
            }
          }
        } else if (typeof value === "object" && value !== null) {
          for (const nestedValue of Object.values(
            value as Record<string, unknown>,
          )) {
            extractMessageKeys(nestedValue);
          }
        }
      };

      extractMessageKeys(manifest);

      const enPath = path.join(
        projectRoot,
        "src/_locales",
        "en",
        "messages.json",
      );
      const content = fs.readFileSync(enPath, "utf-8");
      const messages: LocaleMessages = JSON.parse(content);
      const messageKeys = Object.keys(messages);

      const missingKeys = [...manifestMessageKeys].filter(
        (k) => !messageKeys.includes(k),
      );
      expect(missingKeys).toEqual([]);
    });
  });

  describe("chrome.i18n API", () => {
    it("should mock getMessage correctly", () => {
      const message = global.chrome.i18n.getMessage("extensionName");
      expect(message).toBe("QR-Fox");
    });

    it("should mock getUILanguage correctly", () => {
      const lang = global.chrome.i18n.getUILanguage();
      expect(lang).toBe("en");
    });

    it("should return fallback for missing keys", () => {
      const message = global.chrome.i18n.getMessage("nonexistent");
      expect(message).toBe("[Missing: nonexistent]");
    });

    it("should have key for each user-facing string", () => {
      const requiredKeys = [
        "extensionName",
        "extensionDescription",
        "actionTitle",
        "commandDescription",
        "popupTitle",
        "uiCopyButton",
        "uiDownloadButton",
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

      const enPath = path.join(
        projectRoot,
        "src/_locales",
        "en",
        "messages.json",
      );
      const content = fs.readFileSync(enPath, "utf-8");
      const messages: LocaleMessages = JSON.parse(content);
      const messageKeys = Object.keys(messages);

      for (const key of requiredKeys) {
        expect(messageKeys).toContain(key);
      }
    });
  });

  describe("Message Content", () => {
    it("should have non-empty messages", () => {
      const enPath = path.join(
        projectRoot,
        "src/_locales",
        "en",
        "messages.json",
      );
      const content = fs.readFileSync(enPath, "utf-8");
      const messages: LocaleMessages = JSON.parse(content);

      for (const [, value] of Object.entries(messages)) {
        expect(value.message.trim().length).toBeGreaterThan(0);
      }
    });

    it("should have reasonable message length", () => {
      const enPath = path.join(
        projectRoot,
        "src/_locales",
        "en",
        "messages.json",
      );
      const content = fs.readFileSync(enPath, "utf-8");
      const messages: LocaleMessages = JSON.parse(content);

      for (const [, value] of Object.entries(messages)) {
        // Messages should be less than 500 characters
        expect(value.message.length).toBeLessThan(500);
      }
    });

    it("English messages should be properly capitalized", () => {
      const enPath = path.join(
        projectRoot,
        "src/_locales",
        "en",
        "messages.json",
      );
      const content = fs.readFileSync(enPath, "utf-8");
      const messages: LocaleMessages = JSON.parse(content);

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
      const localesDir = path.join(projectRoot, "src/_locales");
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
      const localesDir = path.join(projectRoot, "src/_locales");
      const locales = fs.readdirSync(localesDir);

      expect(locales.length).toBeGreaterThan(1);

      for (const locale of locales) {
        const messagesPath = path.join(localesDir, locale, "messages.json");
        const content = fs.readFileSync(messagesPath, "utf-8");
        const messages: LocaleMessages = JSON.parse(content);
        expect(Object.keys(messages).length).toBeGreaterThan(0);
      }
    });
  });
});
