# AGENTS.md

**QR‑Fox**: Firefox WebExtension that displays a QR‑code for the current page URL. Built with plain JavaScript, HTML, and CSS – no external runtime dependencies.

## Build / Lint / Test Commands
Requires **Node.js 20+**, **web-ext**, **eslint**, and **prettier** installed globally (or use `npx` to run locally).

| Command | Description |
|---------|-------------|
| `web-ext lint` | Lint manifest, JS, HTML, CSS. |
| `prettier --write "**/*.{js,html,css,json}"` | Format all source files. |
| `eslint "**/*.js"` | Check JavaScript for style & bugs. |
| `web-ext build` | Create `.xpi` package in `web-ext-artifacts/`. |
| `web-ext run` | Launch Firefox with extension loaded. |
| `npm test` | Run Jest test suite. |
| `npm test -- -t "<pattern>"` | Run a single test by pattern. |
| `npm run test:watch` | Re-run tests on file changes. |

## Code Style Guidelines

- **Indentation**: 2 spaces, no tabs.
- **Line length**: ≤ 100 characters.
- **Quotes**: Single quotes for strings.
- **Semicolons**: Never use; rely on ASI.
- **Trailing commas**: Use in multiline arrays/objects.
- **Newline at EOF**. UTF-8 encoding.

## Imports & Modules
- Use ES-modules (`import`/`export`). All files are modules.
- Import relative to the file location (no absolute URLs).
- Group imports: built-ins → third-party (none) → internal files.

```js
// Internal imports
import { generateQR } from './qr-generator.js'
```

## Naming Conventions
- **Variables/functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case` (`qr-generator.js`)
- **HTML IDs/CSS classes**: `kebab-case` (`copy-png`)

## Types & JSDoc
Each exported function must have JSDoc describing parameters and return type:

```js
/**
 * Generate a QR-code SVG.
 * @param {string} text - The text to encode.
 * @param {{dark?:boolean}} [options] - Rendering options.
 * @returns {string} SVG markup.
 */
export function generateQR(text, { dark = false } = {}) { … }
```

Use `/** */` style, not `//`.

## Error Handling
- Never swallow errors silently.
- All async work must be awaited (promise rejections are fatal).
- Validate external inputs before use.
- Check browser API existence (e.g., `chrome.tabs?.query`).

## DOM & CSS
- Use `document.getElementById` or `querySelector`.
- Parse SVG with `DOMParser` before inserting.
- Never inject unsanitized strings into `innerHTML`.
- Keep CSS specificity low; no external frameworks.

## Testing
- Tests in `__tests__/` using Jest.
- Test pure functions with snapshot testing.
- Mock `chrome.tabs.query` for UI tests.
- Name tests descriptively: `should generate SVG with dark mode enabled`.
- Test error cases: empty input, missing params, invalid URLs.

## Commits & PRs
**Format**: `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `style`, `docs`, `test`, `chore`
- Subject: present tense, ≤ 72 characters
- Include: summary, rationale, side-effects

## Repository Rules
- New files go in `background/`, `popup/`, or `icons/`.
- Keep manifest permissions minimal (`activeTab` only).
- URL-encode popup query params (`url`, `title`).
- Never use unsanitized input in SVG generation.
- Never commit: `node_modules/`, `web-ext-artifacts/`, `*.xpi`.
- Test locally with `web-ext run` before marking complete.
