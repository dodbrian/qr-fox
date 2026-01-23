#!/usr/bin/env node

/**
 * Validates i18n implementation in the QR-Fox extension.
 * Checks for:
 * 1. All message keys used in code exist in locale files
 * 2. No hardcoded strings in source code
 * 3. All locale files have consistent message keys
 * 4. Valid JSON syntax in message files
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(path.dirname(__dirname));

const LOCALES_DIR = path.join(projectRoot, "_locales");
const SRC_DIRS = [
  path.join(projectRoot, "popup"),
  path.join(projectRoot, "background"),
];

interface LocalesMap {
  [locale: string]: string[];
}

interface HardcodedIssue {
  file: string;
  line: number;
  content: string;
}

/**
 * Load all message keys from locale files.
 * @returns Map of locale to message keys
 */
function loadLocaleMessages(): LocalesMap {
  const locales: LocalesMap = {};
  const localeDirs = fs.readdirSync(LOCALES_DIR);

  for (const locale of localeDirs) {
    const messagesPath = path.join(LOCALES_DIR, locale, "messages.json");
    try {
      const content = fs.readFileSync(messagesPath, "utf-8");
      const messages = JSON.parse(content);
      locales[locale] = Object.keys(messages);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `✗ Failed to parse ${locale}/messages.json: ${errorMessage}`,
      );
      process.exit(1);
    }
  }

  return locales;
}

/**
 * Extract chrome.i18n.getMessage() calls, data-i18n attributes, and manifest __MSG_* syntax.
 * @returns Set of message keys used in code
 */
function extractMessageKeysFromSource(): Set<string> {
  const messageKeys = new Set<string>();
  const messageKeyRegex = /chrome\.i18n\.getMessage\(\s*["']([^"']+)["']\s*\)/g;
  const dataI18nRegex = /data-i18n=["']([^"']+)["']/g;
  const manifestI18nRegex = /__MSG_([a-zA-Z0-9_]+)__/g;

  for (const srcDir of SRC_DIRS) {
    if (!fs.existsSync(srcDir)) continue;

    const files = fs.readdirSync(srcDir);

    // Process JS/TS files
    files
      .filter((f) => f.endsWith(".js") || f.endsWith(".ts"))
      .forEach((file) => {
        const filePath = path.join(srcDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        let match;

        while ((match = messageKeyRegex.exec(content)) !== null) {
          messageKeys.add(match[1]);
        }
      });
  }

  // Also check HTML files for data-i18n attributes
  const popupHtmlPath = path.join(projectRoot, "popup", "popup.html");
  if (fs.existsSync(popupHtmlPath)) {
    const htmlContent = fs.readFileSync(popupHtmlPath, "utf-8");
    let match;

    while ((match = dataI18nRegex.exec(htmlContent)) !== null) {
      messageKeys.add(match[1]);
    }
  }

  // Check manifest.json for __MSG_* syntax
  const manifestPath = path.join(projectRoot, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifestContent = fs.readFileSync(manifestPath, "utf-8");
    let match;

    while ((match = manifestI18nRegex.exec(manifestContent)) !== null) {
      messageKeys.add(match[1]);
    }
  }

  return messageKeys;
}

/**
 * Check for hardcoded user-facing strings in source code.
 * @returns Array of potential hardcoded strings with locations
 */
function checkForHardcodedStrings(): HardcodedIssue[] {
  const issues: HardcodedIssue[] = [];

  for (const srcDir of SRC_DIRS) {
    if (!fs.existsSync(srcDir)) continue;

    const jsFiles = fs
      .readdirSync(srcDir)
      .filter((f) => f.endsWith(".js") || f.endsWith(".ts"));

    for (const file of jsFiles) {
      const filePath = path.join(srcDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, lineNum) => {
        // Check for alert, console.log, or textContent assignments with literal strings
        if (
          /alert\(\s*["']/.test(line) ||
          (/\.textContent\s*=\s*["']/.test(line) && !line.includes("data-i18n"))
        ) {
          // Skip if it's inside a comment
          if (!line.trim().startsWith("//")) {
            issues.push({
              file: filePath,
              line: lineNum + 1,
              content: line.trim(),
            });
          }
        }
      });
    }
  }

  return issues;
}

/**
 * Validate locale consistency.
 * @param locales - Map of locales to message keys
 * @returns Array of consistency issues
 */
function validateLocaleConsistency(locales: LocalesMap): string[] {
  const issues: string[] = [];
  const localeList = Object.keys(locales);

  if (localeList.length === 0) {
    return issues;
  }

  const baseLocale = "en";
  if (!locales[baseLocale]) {
    issues.push(`Base locale "${baseLocale}" not found`);
    return issues;
  }

  const baseKeys = new Set(locales[baseLocale]);

  for (const locale of localeList) {
    if (locale === baseLocale) continue;

    const localeKeys = new Set(locales[locale]);
    const missing = [...baseKeys].filter((k) => !localeKeys.has(k));
    const extra = [...localeKeys].filter((k) => !baseKeys.has(k));

    if (missing.length > 0) {
      issues.push(`${locale}: Missing keys: ${missing.join(", ")}`);
    }

    if (extra.length > 0) {
      issues.push(`${locale}: Extra keys: ${extra.join(", ")}`);
    }
  }

  return issues;
}

/**
 * Main validation function.
 */
function validateI18n(): void {
  console.log("Validating i18n implementation...\n");

  let hasErrors = false;

  // Load locales
  console.log("1. Loading locale files...");
  const locales = loadLocaleMessages();
  console.log(`   ✓ Found ${Object.keys(locales).length} locales\n`);

  // Check consistency
  console.log("2. Checking locale consistency...");
  const consistencyIssues = validateLocaleConsistency(locales);
  if (consistencyIssues.length > 0) {
    console.error("   ✗ Consistency issues found:");
    consistencyIssues.forEach((issue) => console.error(`     - ${issue}`));
    hasErrors = true;
  } else {
    console.log("   ✓ All locales have consistent message keys\n");
  }

  // Extract used keys
  console.log("3. Checking message key usage...");
  const usedKeys = extractMessageKeysFromSource();
  const baseLocaleKeys = new Set(locales.en || []);

  const unusedKeys = [...baseLocaleKeys].filter((k) => !usedKeys.has(k));
  const missingKeys = [...usedKeys].filter((k) => !baseLocaleKeys.has(k));

  if (missingKeys.length > 0) {
    console.error(
      `   ✗ ${missingKeys.length} message keys used but not defined:`,
    );
    missingKeys.forEach((k) => console.error(`     - ${k}`));
    hasErrors = true;
  }

  if (unusedKeys.length > 0) {
    console.warn(
      `   ⚠ ${unusedKeys.length} message keys defined but not used:`,
    );
    unusedKeys.forEach((k) => console.warn(`     - ${k}`));
  }

  if (missingKeys.length === 0 && unusedKeys.length === 0) {
    console.log("   ✓ All message keys are properly used\n");
  }

  // Check for hardcoded strings
  console.log("4. Checking for hardcoded strings...");
  const hardcodedIssues = checkForHardcodedStrings();
  if (hardcodedIssues.length > 0) {
    console.warn(
      `   ⚠ ${hardcodedIssues.length} potential hardcoded strings found:`,
    );
    hardcodedIssues.forEach((issue) => {
      console.warn(`     - ${issue.file}:${issue.line}: ${issue.content}`);
    });
  } else {
    console.log("   ✓ No hardcoded strings detected\n");
  }

  // Summary
  console.log("─".repeat(50));
  if (hasErrors) {
    console.error("\n✗ Validation failed!");
    process.exit(1);
  } else {
    console.log("\n✓ i18n validation successful!");
    process.exit(0);
  }
}

validateI18n();
