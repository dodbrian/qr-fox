# QR-Fox Internationalization Plan

## Overview

This document outlines the strategy for implementing internationalization (i18n) in the QR-Fox Firefox WebExtension to support multiple languages and provide a consistent user experience across different locales.

## Current State Analysis

### Issues Identified

- **Mixed languages**: German UI text with English error messages
- **No i18n framework**: All strings are hardcoded throughout the codebase
- **Language inconsistency**: HTML `lang="en"` but contains German content
- **Maintenance burden**: Translations require code changes

### Current User-Facing Strings

#### Manifest Metadata

```json
{
  "name": "QR-Fox",
  "description": "Shows a QR-code of the current page (PNG, copy & download).",
  "default_title": "Show QR-code"
}
```

#### HTML UI Elements (Currently in German)

```html
<h1>QR-Code scannen</h1>
<!-- Should be: "Scan a QR Code" -->
<button id="copy-png">Kopieren</button>
<!-- Should be: "Copy" -->
<button id="download-png">Herunterladen</button>
<!-- Should be: "Download" -->
```

#### JavaScript User Messages

- Success: `"QR image copied to clipboard"`
- Errors: `"Failed to copy to clipboard"`, `"Failed to download QR image"`
- Development: `"No active tab found"`, `"URL parameter is missing"`

## Implementation Strategy

### Phase 1: Language Normalization

**Objective**: Establish English as the primary language baseline

#### Tasks

1. **Convert German UI to English**
   - Update `popup.html` with English text
   - Fix HTML `lang="en"` attribute consistency
   - Ensure all user-facing text is in English

2. **String Standardization**
   - Review all error messages for consistency
   - Establish tone and style guidelines for English text
   - Document any cultural considerations

### Phase 2: Firefox i18n Framework Implementation

**Objective**: Implement Firefox's standard internationalization system

#### Technical Implementation

1. **Manifest Updates**

   ```json
   {
     "default_locale": "en",
     "name": "__MSG_extensionName__",
     "description": "__MSG_extensionDescription__"
   }
   ```

2. **Directory Structure**

   ```
   _locales/
   ├── en/
   │   └── messages.json
   └── de/
       └── messages.json
   ```

3. **Message Files Format**

   ```json
   {
     "extensionName": {
       "message": "QR-Fox",
       "description": "Name of the extension"
     },
     "copyButton": {
       "message": "Copy",
       "description": "Button label for copying QR code"
     }
   }
   ```

4. **Code Updates**
   - Replace hardcoded strings with `chrome.i18n.getMessage()`
   - Update HTML to use `data-i18n` attributes or dynamic injection
   - Use `__MSG_key__` placeholders in manifest.json

### Phase 3: Multi-Language Support

**Objective**: Add support for additional languages

#### Priority Languages

1. **German (de)** - Restore German support for existing users
2. **Spanish (es)** - Large user base
3. **French (fr)** - Significant Firefox user base
4. **Japanese (ja)** - Important market
5. **Additional languages** based on user analytics

#### Implementation Tasks

1. **Create Translation Files**
   - Set up `_locales/[language_code]/messages.json`
   - Work with native speakers for quality translations
   - Consider cultural context and UI constraints

2. **Testing**
   - Test UI layout with different text lengths
   - Verify all languages work correctly
   - Check for text overflow in buttons/labels

### Phase 4: Build Process & Tooling

**Objective**: Integrate i18n into the development workflow

#### Tooling Requirements

1. **Validation**
   - Ensure all message keys are used in code
   - Validate JSON syntax for all locale files
   - Check for missing translations

2. **Testing**
   - Add Jest tests for i18n functionality
   - Mock `chrome.i18n.getMessage()` in unit tests
   - Integration tests for different locales

3. **Development Workflow**
   - Update ESLint rules to catch hardcoded strings
   - Add Prettier formatting for JSON message files
   - Documentation for translators

## String Categories & Priorities

### High Priority (User-Facing)

- Extension name and description
- Button labels ("Copy", "Download")
- Success messages ("QR image copied to clipboard")
- Error messages shown to users
- Page title in popup

### Medium Priority

- Development error messages (consider leaving in English)
- File naming conventions
- Browser action tooltips

### Low Priority

- Internal code comments
- Function and variable names
- Debug console output

## Technical Specifications

### Firefox Extension i18n API Usage

```javascript
// Get localized string
const localizedString = chrome.i18n.getMessage("messageKey");

// Get current locale
const currentLocale = chrome.i18n.getUILanguage();

// Use in HTML
element.textContent = chrome.i18n.getMessage("buttonLabel");
```

### Message Key Naming Convention

- Use `camelCase` for message keys
- Prefix groups for organization: `ui_*`, `error_*`, `success_*`
- Keep keys descriptive but concise

### Examples

```javascript
// Instead of: button.textContent = 'Copy';
button.textContent = chrome.i18n.getMessage("uiCopyButton");

// Instead of: alert('Failed to copy to clipboard');
alert(chrome.i18n.getMessage("errorCopyFailed"));
```

## Quality Assurance

### Translation Guidelines

1. **Maintain UI consistency** across languages
2. **Consider text length** - ensure buttons don't overflow
3. **Preserve functionality** - technical terms may need to stay in English
4. **Cultural adaptation** - consider local conventions and preferences

### Testing Checklist

- [ ] All languages display correctly
- [ ] No text overflow in UI elements
- [ ] Error messages are appropriate for each locale
- [ ] Extension works correctly with different Firefox language settings
- [ ] Build process validates all locale files

## Maintenance Strategy

### Adding New Languages

1. Create `_locales/[language_code]/messages.json`
2. Translate all message keys
3. Test UI with new language
4. Update documentation

### Updating Strings

1. Add new keys to all locale files simultaneously
2. Update English strings first (baseline)
3. Coordinate with translators for other languages
4. Test all affected languages

### Tools & Automation

- Consider using translation management tools for large-scale updates
- Set up automated checks for missing translations
- Use version control to track translation changes

## Timeline & Milestones

### Phase 1: Language Normalization (Week 1)

- Convert all German text to English
- Fix language inconsistencies
- Review and standardize all strings

### Phase 2: i18n Framework (Week 2-3)

- Implement `_locales/` structure
- Update manifest.json
- Replace hardcoded strings with i18n calls
- Set up English locale file

### Phase 3: Multi-Language Support (Week 4-6)

- Add German locale
- Implement additional priority languages
- Comprehensive testing across locales

### Phase 4: Build Integration (Week 7-8)

- Update build tools and validation
- Add automated tests
- Document processes for translators

## Risks & Considerations

### Technical Risks

- **Text expansion**: Some languages may require more space than English
- **Right-to-left languages**: May need additional UI considerations
- **Character encoding**: Ensure proper UTF-8 handling

### Maintenance Risks

- **Translation drift**: Languages may become inconsistent over time
- **Missing translations**: New features may not be translated promptly
- **Quality control**: Ensuring translation quality across all languages

### Mitigation Strategies

- Design flexible UI that accommodates text length variations
- Establish clear translation review processes
- Set up automated checks for missing translations
- Plan for regular translation reviews and updates

## Success Metrics

- **User satisfaction**: Positive feedback from non-English users
- **Adoption rates**: Usage growth in non-English speaking regions
- **Translation completeness**: All languages have 100% translated strings
- **Maintainability**: Easy process for adding new languages and updating translations

## Resources

### Firefox Extension Documentation

- [Internationalization (i18n) - MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-on_SDK/API/l10n)
- [Chrome Extension i18n API](https://developer.chrome.com/docs/extensions/reference/i18n/)

### Translation Tools

- Mozilla's Pontoon (for community translations)
- Crowdin, Lokalise, or similar platforms
- Professional translation services for critical markets

This plan provides a comprehensive roadmap for implementing internationalization in QR-Fox while maintaining code quality and user experience standards.
