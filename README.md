# QR-Fox

[![CI](https://github.com/dodbrian/qr-fox/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/dodbrian/qr-fox/actions/workflows/ci.yml)

A lightweight Firefox WebExtension that generates QR codes for the current page URL. Built with TypeScript, HTML, and CSS with zero runtime dependencies.

## Features

- **One-click QR code generation** for any webpage
- **Keyboard shortcut** (Alt+Q) for quick access
- **Copy to clipboard** as PNG image
- **Download QR code** as PNG file
- **Zero external dependencies** at runtime
- **Privacy-focused** - all processing happens locally, no data leaves your browser
- **Minimal permissions** - only uses `activeTab` permission

## Screenshot

![QR-Fox Extension Popup](docs/screenshot.png)

## Installation

### Quick Install (Recommended)

[![Get the Add-on](docs/get-the-addon-178x60px.dad84b42.png)](https://addons.mozilla.org/en-US/firefox/addon/qr-fox/)

Click the badge above to visit the official Firefox Add-ons page and install QR-Fox directly in your browser.

## Build Instructions

The following instructions explain how to build an exact copy of the QR-Fox add-on from source code.

### Operating System and Build Environment Requirements

- **Operating System**: Windows, macOS, or Linux (x64 or ARM64)
- **Build Environment**: Command line terminal (bash, zsh, PowerShell, or Command Prompt)

### Required Programs

To build QR-Fox, you must install the following programs:

#### Node.js and npm

QR-Fox requires **Node.js version 22 or later** to build. npm is included with Node.js.

**Installation:**

- **Download Node.js**: Visit https://nodejs.org/ and download the LTS version (22.x or later)
- **Verify installation**:
  ```bash
  node --version
  npm --version
  ```

Expected output (minimum):

- Node.js: v22.0.0 or higher
- npm: 10.0.0 or higher

### Step-by-Step Build Instructions

1. **Clone the source code repository**:

   ```bash
   git clone https://github.com/dodbrian/qr-fox.git
   cd qr-fox
   ```

2. **Install build dependencies**:

   ```bash
   npm install
   ```

3. **Run the build script**:

   ```bash
   npm run build
   ```

   This executes all necessary technical steps:
   - Compiles TypeScript source files to JavaScript
   - Copies static files (icons, HTML, CSS, locales)
   - Generates the complete extension in the `dist/` directory

   The `dist/` directory will contain an exact copy of the add-on ready for installation, including:
   - `manifest.json` - Extension configuration
   - `background/` - Background script
   - `popup/` - Popup UI and QR generation logic
   - `icons/` - Extension icons
   - `_locales/` - Internationalization files

4. **(Optional) Create installable package**:

   ```bash
   npm run pkg
   ```

   This command performs validation, testing, builds the extension, and packages it as a `.xpi` file in `web-ext-artifacts/`:
   - Runs all quality checks (format, lint, i18n validation)
   - Executes the test suite
   - Compiles the extension
   - Creates a `.xpi` package ready for Firefox installation

   Note: The `.xpi` package is created locally and must be signed through Mozilla's signing service before it can be distributed on addons.mozilla.org.

5. **(Optional) Run full validation**:

   ```bash
   npm run validate
   ```

   This runs all quality checks without creating a package:
   - Code formatting check
   - TypeScript and JavaScript linting
   - Test suite execution
   - i18n translation validation

### Installing the Built Extension

**Option 1: Load unpacked extension (for testing)**

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to the `dist/` directory
4. Select `manifest.json`
5. The extension will load and be available for testing

**Option 2: Install signed package**

1. Navigate to the `web-ext-artifacts/` directory after running `npm run pkg`
2. Open the `.xpi` file in Firefox (double-click or drag into Firefox window)
3. Follow the Firefox installation prompts

### Build Scripts Reference

| Script           | Command                | Description                                  |
| ---------------- | ---------------------- | -------------------------------------------- |
| Build extension  | `npm run build`        | Compile TypeScript and copy files to `dist/` |
| Build tests      | `npm run build:tests`  | Compile TypeScript scripts and tests         |
| Format code      | `npm run format`       | Format all files with Prettier               |
| Check format     | `npm run format:check` | Verify formatting without modifying files    |
| Lint code        | `npm run lint`         | Check TypeScript and JavaScript for style    |
| Run tests        | `npm test`             | Execute Jest test suite                      |
| Run validation   | `npm run validate`     | Run all checks (format, lint, test, i18n)    |
| Build and launch | `npm run start`        | Build and launch Firefox with extension      |
| Create package   | `npm run pkg`          | Validate and create signed `.xpi` package    |

### Build Output

- **`dist/`** - Compiled extension ready for loading in Firefox
- **`build/`** - Compiled TypeScript files (internal build directory)
- **`web-ext-artifacts/`** - Signed `.xpi` packages (generated by `npm run pkg`)

### Troubleshooting Build Issues

If the build fails:

1. Verify Node.js version: `node --version` (must be 22+)
2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```
3. Ensure you have sufficient disk space and write permissions

## Usage

1. **Click the toolbar icon** or press **Alt+Q** on any webpage
2. A popup displays the QR code for the current URL
3. **Copy** the QR code as PNG to clipboard
4. **Download** the QR code as a PNG file

## Development

### Project Structure

```
qr-fox/
├── src/                 # Source code
│   ├── background/      # Background service worker
│   ├── popup/           # Popup UI and QR generation
│   ├── icons/           # Extension icons (SVG/PNG)
│   ├── _locales/        # Internationalization (i18n)
│   └── manifest.json    # Extension manifest
├── __tests__/           # Jest test suite
├── scripts/             # Build and utility scripts
├── assets/              # Asset files (images, etc.)
├── docs/                # Documentation and assets
├── dist/                # Compiled extension (generated)
└── .github/             # GitHub workflows (CI/CD)
```

### Tech Stack

- **TypeScript** - Type-safe development with strict mode
- **ES Modules** - Modern JavaScript module system
- **Jest** - Testing framework
- **ESLint** - Code quality and style enforcement
- **Prettier** - Code formatting
- **web-ext** - Firefox extension development and packaging

For a complete list of all available build commands, see the [Build Scripts Reference](#build-scripts-reference) section in the Build Instructions.

## Helpful Resources

For developers interested in extending or contributing to QR-Fox, here are some valuable resources:

- [Mozilla Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/) - Resources for extension development, publishing, and managing your extensions on addons.mozilla.org
- [Mozilla WebExtensions Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) - Comprehensive guides and references for building Firefox extensions with the WebExtensions API
- [Extension Signing and Distribution Overview](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/) - Details about Firefox's extension signing process and distribution options
- [Add-ons Server API v4 Signing Documentation](https://mozilla.github.io/addons-server/topics/api/v4_frozen/signing.html) - Technical documentation for the API used to programmatically sign Firefox extensions

## Contributing

### Quick Guidelines

- Follow TypeScript strict mode
- Add tests for new features
- Run `npm run validate` before committing
- Use conventional commit format: `<type>(<scope>): <subject>`

## License

MIT License - see LICENSE file for details

## Attributions

QR code icon sourced from [Freepik](https://www.freepik.com)

## Browser Compatibility

- Firefox 115+
- Manifest V3

## Privacy

QR-Fox processes all data locally in your browser. No information is transmitted to external servers. The extension only requests `activeTab` permission to read the current page URL.
