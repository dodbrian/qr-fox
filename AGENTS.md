# AGENTS.md

## 📦 Project Overview
This repository contains the source code for **QR‑Fox**, a Firefox WebExtension that displays a QR‑code for the current page URL.  The extension is built with plain JavaScript, HTML and CSS – no external runtime dependencies.

---

## 🛠️ Build / Lint / Test Commands
> The commands assume that **Node.js 20+** and the **WebExtension CLI (web-ext)** are installed globally.  If you prefer a local installation, add them to `devDependencies` and prefix the commands with `npx`.

| Task | Command | Description |
|------|---------|-------------|
| **Install tooling** | `npm i -g web-ext eslint prettier` | Global install of the required CLI tools. |
| **Lint the extension** | `web-ext lint` | Runs Mozilla's built‑in lint rules for manifest, JS, HTML and CSS. |
| **Run prettier** | `prettier --write "**/*.{js,html,css,json}"` | Enforces consistent formatting across all source files. |
| **Run ESLint** | `eslint "**/*.js"` | Checks JavaScript for style & potential bugs. |
| **Build (package)** | `web-ext build` | Creates a signed `.xpi` package placed in `web-ext-artifacts/`. |
| **Run locally** | `web-ext run` | Launches Firefox with the temporary extension loaded for manual testing. |
| **Run unit tests** | `npm test` | Executes the test suite (Jest). |
| **Run a single test** | `npm test -- -t "<test name pattern>"` | Runs only the matching test(s). |
| **Watch mode** | `npm run test:watch` | Re‑run tests on file changes (Jest `--watch`). |

### Suggested `package.json` scripts (add if you create a `package.json`)
```json
{
  "scripts": {
    "lint": "web-ext lint && eslint '**/*.js'",
    "format": "prettier --write '**/*.{js,html,css,json}'",
    "build": "web-ext build",
    "run": "web-ext run",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---

## 🧭 Code Style Guidelines
The guidelines below are meant for **any agent** (human or AI) that edits the repository.  They are deliberately strict to keep the codebase tiny, readable and maintainable.

### 1️⃣ General Formatting
- **Indentation**: 2 spaces, no tabs.
- **Line length**: ≤ 100 characters.
- **Trailing commas**: Always use in arrays/objects when multiline.
- **Quotes**: Use single quotes for strings (`'text'`).
- **Semicolons**: **Never** use; rely on automatic ASI.
- **File ending**: Newline at EOF.
- **Encoding**: UTF‑8 without BOM.

### 2️⃣ Imports & Module System
- Use **ES‑modules** (`import` / `export`).  All files are executed as modules (`type="module"` in HTML or `*.mjs`).
- **Absolute URLs** are not allowed; import relative to the file location.
- Keep imports **grouped**: built‑in modules → third‑party (none) → internal files; separate groups with a blank line.
```js
// Built‑ins / browser APIs (none needed)

// Internal imports
import { generateQR } from './qr-generator.js';
```

### 3️⃣ Naming Conventions
- **Variables / functions**: `camelCase`.
- **Constants** that are true compile‑time constants: `UPPER_SNAKE_CASE`.
- **Classes / constructors**: `PascalCase` (not used in this project but documented for future expansion).
- **File names**: kebab‑case (`qr-generator.js`).
- **HTML IDs**: kebab‑case (`qr`, `copy-png`).
- **CSS classes**: kebab‑case.

### 4️⃣ Types & JSDoc
- The project is **plain JavaScript**; however, each exported function must have a JSDoc comment describing its parameters and return type.
```js
/**
 * Generate a QR‑code SVG.
 * @param {string} text - The text to encode.
 * @param {{dark?:boolean}} [options] - Rendering options.
 * @returns {string} SVG markup.
 */
export function generateQR(text, { dark = false } = {}) { … }
```
- Use `/** ... */` style, not `//`.

### 5️⃣ Error handling & Defensive Coding
- **Never** swallow errors silently.  Use `try/catch` only when you can recover or provide a useful UI message.
- All async work should be awaited; unhandled promise rejections are fatal in extension context.
- Validate external inputs (e.g., URL parameters) before use.
```js
const url = qs.get('url') || '';
if (!url) {
  console.error('Missing URL parameter');
  return;
}
```
- When interacting with browser APIs, always check for their existence (e.g., `chrome.tabs?.query`).

### 6️⃣ DOM Manipulation
- Prefer **`document.getElementById`** or **`querySelector`** with a scoped container reference.
- Never inject raw strings into `innerHTML` unless you have full control (as with the generated SVG).
- Remove event listeners when not needed (not required for this simple UI, but keep in mind for future components).

### 7️⃣ CSS Guidelines
- Use **CSS custom properties** for theme colours if you ever extend dark‑mode handling.
- Keep selectors **specificity low** – target IDs only when necessary.
- Order of rules: layout → typography → component styles → utilities.
- No external CSS frameworks; keep the file under 150 lines.

### 8️⃣ Testing Practices
- Tests live in `__tests__/` and use **Jest** (or `web-ext`‑compatible headless Firefox for integration tests).
- Test **pure functions** (`generateQR`) with snapshot testing of the SVG string.
- UI tests should mock `chrome.tabs` and verify that the popup creates the expected URL and DOM elements.
- Name tests descriptively: `should generate SVG with dark mode enabled`.

### 9️⃣ Commit / PR Style (for agents that create PRs)
- **Commit message**: *<type>(<scope>): <subject>*
  - Types: `feat`, `fix`, `style`, `docs`, `test`, `chore`.
  - Subject written in **present tense**, ≤ 72 characters.
- PR title mirrors the commit title.
- PR description includes:
  1. Summary of the change.
  2. Rationale (why the change is needed).
  3. Any side‑effects or migration steps.

---

## 📂 Repository‑Specific Rules
- No **`.cursor/`** or **`.github/copilot‑instructions.md`** files are present, so there are no additional custom rules to enforce.
- All new source files must be added under the appropriate existing folder (`background/`, `popup/`, `icons/`).
- Keep the extension **manifest‑only** permissions (`activeTab`).  Adding new permissions requires a security review.

---

## 📄 How Agents Should Use This File
1. **Read** the guidelines before making any modification.
2. **Run** the prescribed lint/format commands locally to verify compliance.
3. **Update** the `package.json` scripts if you add new tooling.
4. **Document** any deviation from the rules in the PR description.
5. **Never** commit generated files (e.g., `node_modules/`, `*.xpi`) – they are build artefacts.

---

*This file is intentionally verbose to give autonomous agents a complete picture of the expected workflow, style and quality standards.*
