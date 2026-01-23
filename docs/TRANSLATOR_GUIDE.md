# QR-Fox Translator Guide

This guide is intended for translators and those managing translations for the QR-Fox Firefox WebExtension.

## Overview

QR-Fox uses Firefox's standard internationalization (i18n) framework for supporting multiple languages. All user-facing strings are stored in locale-specific JSON files within the `_locales` directory.

## Directory Structure

```
_locales/
├── en/
│   └── messages.json      # English strings (baseline)
├── de/
│   └── messages.json      # German
├── es/
│   └── messages.json      # Spanish
├── fr/
│   └── messages.json      # French
├── ja/
│   └── messages.json      # Japanese
├── ru/
│   └── messages.json      # Russian
└── uk/
    └── messages.json      # Ukrainian
```

## Message File Format

Each `messages.json` file follows this structure:

```json
{
  "messageKey": {
    "message": "The localized text shown to users",
    "description": "Context for translators explaining the purpose of this string"
  }
}
```

### Example

```json
{
  "uiCopyButton": {
    "message": "Copy",
    "description": "Button label for copying QR code to clipboard"
  },
  "errorCopyFailed": {
    "message": "Failed to copy QR code to clipboard",
    "description": "Error message when clipboard operation fails"
  }
}
```

## Message Keys

Message keys follow these conventions:

- **Format**: camelCase (e.g., `errorCopyFailed`, `uiDownloadButton`)
- **Prefixes** (optional but recommended for organization):
  - `ui*` — User interface elements (buttons, labels, titles)
  - `error*` — Error messages
  - `success*` — Success messages
  - `action*` — Browser action/commands
  - `extension*` — Extension metadata

## Translation Guidelines

### 1. Maintain UI Consistency

- Keep button labels concise (typically 1-3 words)
- Use consistent terminology throughout the translation
- Match the tone of the original English messages

### 2. Text Length Considerations

**Important**: Some languages require more space than English. Consider:

- Button text should fit in approximately **150px width** on desktop
- Error messages should fit in approximately **300px width**
- If text is too long, consider abbreviations or rewording

Examples:

- English: "Failed to copy QR code to clipboard" (50 characters)
- German: "QR-Code konnte nicht in die Zwischenablage kopiert werden" (59 characters) ✓
- German (alternative): "Fehler beim Kopieren" (21 characters) - too vague

### 3. Terminology

Some technical terms may need to remain in English or be discussed:

- **"QR code"** — Often kept as "QR-Code" with local spelling conventions
- **"Copy"** — Understand as copying to clipboard
- **"Download"** — Saving the image file locally
- **"Clipboard"** — The system's copy/paste buffer

### 4. Cultural Adaptation

- Respect local conventions for capitalization
- Use culturally appropriate expressions
- Be mindful of date/time format conventions (if applicable)

## Message Categories

### High Priority (Critical for User Experience)

These must be translated accurately as they appear in the main UI:

- `extensionName` — "QR-Fox"
- `extensionDescription` — Brief description in extension stores
- `popupTitle` — Title shown in the popup window
- `uiCopyButton` — Button label for copy action
- `uiDownloadButton` — Button label for download action
- `successCopyMessage` — Confirmation when copy succeeds
- `errorCopyFailed` — Error when copy fails
- `errorDownloadFailed` — Error when download fails
- `actionTitle` — Tooltip shown in browser toolbar

### Medium Priority

These are important but appear less frequently:

- `commandDescription` — Keyboard shortcut description
- Error messages (generic UI errors)

### Low Priority

These are developer-focused and typically left in English:

- `defaultPageTitle` — Default filename when page title unavailable
- Error messages that reference technical issues

## How to Translate

### Step 1: Identify Missing Translations

Check if the language already exists in `_locales/`:

```bash
ls _locales/
```

If your language code is not listed, create a new directory:

```bash
mkdir _locales/xx
```

Where `xx` is your [language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

### Step 2: Create/Update messages.json

Copy the English file as a template:

```bash
cp _locales/en/messages.json _locales/xx/messages.json
```

Then edit `_locales/xx/messages.json`:

```json
{
  "extensionName": {
    "message": "QR-Fox",
    "description": "Name of the extension"
  },
  "uiCopyButton": {
    "message": "Copiar",
    "description": "Button label for copying QR code to clipboard"
  }
}
```

### Step 3: Validation

Run validation to ensure your translation is properly formatted:

```bash
node scripts/validate-locales-schema.js
```

This checks for:

- Valid JSON syntax
- Required fields (`message`, `description`)
- Proper key naming conventions

### Step 4: Testing

To test your translation:

1. Build the extension:

   ```bash
   npm run build
   ```

2. Load the extension in Firefox with your language set:
   - Open Firefox Developer Edition or set your locale
   - Load the unpacked extension from `web-ext-artifacts/`
   - Verify that strings appear correctly

3. Check for text overflow:
   - Ensure buttons don't overflow
   - Verify error messages display properly
   - Test on different screen sizes

## Quality Checklist

Before submitting a translation, verify:

- [ ] All message keys from English are translated
- [ ] No message keys are missing or extra
- [ ] JSON is valid (runs without syntax errors)
- [ ] No typos or grammatical errors
- [ ] Text doesn't overflow UI elements
- [ ] Button labels are concise (ideally 1-3 words)
- [ ] Error messages are clear and helpful
- [ ] Terminology is consistent throughout
- [ ] Capitalization follows locale conventions
- [ ] Special characters are properly encoded

## Tools & Validation

### Manual Validation

Run the i18n validation script:

```bash
node scripts/validate-i18n.js
node scripts/validate-locales-schema.js
```

### Testing with Jest

Run the test suite:

```bash
npm test
```

This validates:

- All locales have consistent keys
- Messages have proper format
- No hardcoded strings in code
- JSON syntax is valid

### Integration with Build Process

The build process automatically validates:

```bash
npm run validate
```

This runs:

1. Code formatting check
2. ESLint analysis
3. Web-ext lint for manifest
4. Jest tests
5. i18n validation

## Adding New Strings

When adding new strings to the application:

1. **Add to English first** (`_locales/en/messages.json`)
2. **Add the message key to all other locales** (`_locales/[locale]/messages.json`)
3. **Update all translations simultaneously** — Don't leave some locales behind
4. **Update code** to use the new key with `chrome.i18n.getMessage("newKey")`
5. **Run validation** to ensure everything is consistent

Example workflow:

```json
// Add to all _locales/*/messages.json files:
{
  "newFeatureMessage": {
    "message": "Your translation here",
    "description": "Brief description of where/how this appears"
  }
}
```

## Common Issues & Solutions

### Problem: Text overflows buttons

**Solution**: Use shorter text or abbreviations

- ❌ "Click here to download the QR code image"
- ✓ "Download"

### Problem: Characters not displaying

**Solution**: Ensure UTF-8 encoding

- Save files as UTF-8 without BOM
- Use proper Unicode escape sequences if needed

### Problem: Grammar inconsistency

**Solution**: Maintain consistent tone

- Use the same verb tense (present tense preferred)
- Keep terminology consistent
- Match formality level with English

### Problem: Plural forms

**Solution**: Keep messages simple

- Avoid complex plural rules
- Use neutral phrasing (e.g., "items" instead of item/items)
- Firefox i18n doesn't support pluralization syntax

## Getting Help

If you have questions about translation or find issues:

1. **Check existing translations** — Review similar strings in your language
2. **Review Firefox i18n docs** — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization
3. **Open an issue** — Report any problems with the translation process

## Submitting Translations

To contribute a translation:

1. Fork the repository
2. Create a feature branch: `git checkout -b translate/xx`
3. Add/update `_locales/xx/messages.json`
4. Run validation: `npm run validate`
5. Create a pull request with:
   - Language name and code in title
   - List of all translated messages
   - Any notes about terminology or cultural adaptations

## Maintenance & Updates

Translations are maintained through:

- **Version control** — Changes tracked in Git
- **Continuous validation** — Automated checks on every commit
- **Community review** — Pull request review process
- **Regular audits** — Periodic checks for consistency and quality

## Resources

- **Mozilla i18n Guide**: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization
- **Language Codes**: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
- **Firefox Add-ons Hub**: https://addons.mozilla.org/

---

**Last Updated**: January 2026

For more information about QR-Fox development, see the main [README.md](./README.md) and [AGENTS.md](./AGENTS.md).
