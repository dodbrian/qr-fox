#!/usr/bin/env node

/**
 * Validates JSON schema for all locale message files.
 * Ensures each message file follows the Firefox Extension i18n format:
 * {
 *   "messageKey": {
 *     "message": "The message text",
 *     "description": "Context for translators"
 *   }
 * }
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);
const LOCALES_DIR = path.join(projectRoot, "_locales");

interface MessageEntry {
  message?: string;
  description?: string;
  placeholders?: Record<string, unknown>;
  [key: string]: unknown;
}

interface MessageFile {
  [key: string]: MessageEntry;
}

/**
 * Validate a single message file schema.
 * @param filePath - Path to messages.json file
 * @param locale - Locale code for error messages
 * @returns Array of validation errors
 */
function validateMessageFile(filePath: string, locale: string): string[] {
  const errors: string[] = [];

  // Check file exists
  if (!fs.existsSync(filePath)) {
    errors.push(`File not found: ${filePath}`);
    return errors;
  }

  // Parse JSON
  let messages: MessageFile;
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    messages = JSON.parse(content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Invalid JSON in ${locale}/messages.json: ${errorMessage}`);
    return errors;
  }

  // Validate root structure is an object
  if (typeof messages !== "object" || Array.isArray(messages)) {
    errors.push(`${locale}/messages.json: Root must be an object`);
    return errors;
  }

  // Validate each message entry
  for (const [key, value] of Object.entries(messages)) {
    // Check key format (camelCase with optional prefix)
    if (!/^[a-z][a-zA-Z0-9]*$/.test(key)) {
      errors.push(
        `${locale}/messages.json: Invalid key format "${key}" (must be camelCase)`,
      );
    }

    // Check value is an object
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      errors.push(
        `${locale}/messages.json: Key "${key}" must have an object value`,
      );
      continue;
    }

    // Check for required "message" field
    if (!("message" in value)) {
      errors.push(
        `${locale}/messages.json: Key "${key}" missing "message" field`,
      );
    } else if (typeof value.message !== "string") {
      errors.push(
        `${locale}/messages.json: Key "${key}" "message" must be a string`,
      );
    } else if (value.message.trim().length === 0) {
      errors.push(
        `${locale}/messages.json: Key "${key}" "message" cannot be empty`,
      );
    }

    // Check for recommended "description" field
    if (!("description" in value)) {
      errors.push(
        `${locale}/messages.json: Key "${key}" missing "description" field (recommended for translators)`,
      );
    } else if (typeof value.description !== "string") {
      errors.push(
        `${locale}/messages.json: Key "${key}" "description" must be a string`,
      );
    }

    // Warn about unexpected fields
    const validFields = new Set(["message", "description", "placeholders"]);
    for (const field of Object.keys(value)) {
      if (!validFields.has(field)) {
        console.warn(
          `  ⚠ ${locale}/messages.json: Unexpected field "${field}" in key "${key}"`,
        );
      }
    }
  }

  return errors;
}

/**
 * Main validation function.
 */
function validateAllLocales(): void {
  console.log("Validating locale message files...\n");

  if (!fs.existsSync(LOCALES_DIR)) {
    console.error(`✗ Locales directory not found: ${LOCALES_DIR}`);
    process.exit(1);
  }

  const localeDirs = fs.readdirSync(LOCALES_DIR);
  let totalErrors = 0;

  for (const locale of localeDirs) {
    const messagesPath = path.join(LOCALES_DIR, locale, "messages.json");
    console.log(`Validating ${locale}...`);

    const errors = validateMessageFile(messagesPath, locale);

    if (errors.length === 0) {
      console.log(`  ✓ ${locale} is valid\n`);
    } else {
      errors.forEach((error) => console.error(`  ✗ ${error}`));
      console.log();
      totalErrors += errors.length;
    }
  }

  console.log("─".repeat(50));

  if (totalErrors > 0) {
    console.error(`\n✗ Found ${totalErrors} validation error(s)!`);
    process.exit(1);
  } else {
    console.log("\n✓ All locale files are valid!");
    process.exit(0);
  }
}

validateAllLocales();
