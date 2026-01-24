# AGENTS.md

**QR‑Fox**: Firefox WebExtension that displays a QR‑code for the current page URL. Built with TypeScript, HTML, and CSS – no external runtime dependencies.

## Build / Lint / Test Commands

Requires **Node.js 20+**. Install dependencies with `npm install`.

| Command                      | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `npm run build`              | Build complete extension in `dist/` folder.         |
| `npm run build:scripts`      | Compile build scripts and tests to `build/` folder. |
| `npm run build:watch`        | Watch TypeScript files and auto-compile on changes. |
| `npm run format`             | Format all files with Prettier.                     |
| `npm run format:check`       | Check formatting without modifying files.           |
| `npm run lint`               | Check TypeScript and JavaScript for style & bugs.   |
| `npm test`                   | Run Jest test suite (compiles TypeScript first).    |
| `npm test -- -t "<pattern>"` | Run tests matching Jest regex pattern.              |
| `npm run test:watch`         | Re-run tests on file changes.                       |
| `npm run test:coverage`      | Generate coverage report.                           |
| `npm run validate`           | Run format check, lint, test, and i18n validation.  |
| `npm run start`              | Build and launch Firefox with extension.            |
| `npm run pkg`                | Validate, build, and create `.xpi` package.         |

## Code Style Guidelines

- **Indentation**: 2 spaces, no tabs (Prettier enforced).
- **Line length**: ≤ 100 characters (Prettier enforced).
- **Quotes**: Single quotes for strings (Prettier enforced).
- **Semicolons**: Never use; rely on Automatic Semicolon Insertion.
- **Trailing commas**: Use in multiline arrays/objects (Prettier enforced).
- **Newline at EOF**: Always required. UTF-8 encoding.
- **Operators**: Use strict equality (`===`, `!==`) and equality checks (`eqeqeq`).
- **Const/Let**: Use `const` by default, `let` when reassignment needed. No `var`.

## Imports & Modules

- Use ES-modules (`import`/`export`). All files are modules.
- Import relative to the file location (no absolute URLs).
- Group imports: built-ins → third-party (none) → internal files.

```ts
// Internal imports
import { generateQR } from "./qr-generator.js";
```

## Naming Conventions

- **Variables/functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case` (`qr-generator.ts`)
- **HTML IDs/CSS classes**: `kebab-case` (`copy-png`)

## Types & TypeScript

### Type Annotations

Use TypeScript for type safety. All exported functions must have explicit type annotations:

```ts
interface QROptions {
  dark?: boolean
}

/**
 * Generate a QR-code SVG.
 * @param text - The text to encode.
 * @param options - Rendering options.
 * @returns SVG markup.
 */
export function generateQR(text: string, options: QROptions = {}): string { … }
```

### JSDoc with TypeScript

Include JSDoc comments with TypeScript types for better IDE support:

```ts
/**
 * Fetch the current tab URL from Chrome API.
 * @returns The current page URL or undefined if unavailable.
 */
async function getCurrentTabUrl(): Promise<string | undefined> { … }
```

### Interfaces and Types

Define interfaces for complex data structures:

```ts
interface TabInfo {
  url: string;
  title: string;
  id: number;
}

interface MessageRequest {
  action: string;
  data?: unknown;
}
```

Use `/** */` style JSDoc comments, not `//`.

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

- Tests in `__tests__/` directory at root using Jest (files must end in `.test.ts` or `.test.js`).
- Test setup file at `__tests__/setup.ts` mocks browser APIs: `chrome.i18n`, `chrome.tabs`, `chrome.action`, etc.
- Mock `chrome.tabs.query` for popup/UI tests; mock `chrome.i18n.getMessage` for i18n tests.
- Prefer snapshot testing for generated SVG and complex output.
- Name tests descriptively: `should generate SVG with dark mode enabled`.
- Always test error cases: empty input, missing params, invalid URLs, missing locales.
- Run single test: `npm test -- -t "test name"` (matches Jest regex pattern).

## Commits & PRs

**Format**: `<type>(<scope>): <subject>`

- **Types**: `feat` (new feature), `fix` (bug fix), `style` (formatting), `docs` (documentation), `test` (tests), `chore` (tooling)
- **Scope**: `popup`, `background`, `i18n`, `qr`, etc. (optional but recommended)
- **Subject**: Present tense, imperative, ≤ 72 characters, no period
- **Body**: Include summary, rationale, and any side-effects (multi-line commits encouraged)

## Repository Rules & Gotchas

- **Source files**: Write `.ts` files in `src/background/`, `src/popup/`, `scripts/`, or `__tests__/`. Never commit `.js` files.
- **Compiled files**: `dist/` contains compiled extension output; `build/` contains compiled scripts and tests. Never commit compiled files (covered by `.gitignore`).
- **Manifest**: `src/manifest.json` points to files relative to `dist/` folder (e.g., `popup/popup.js`).
- **Permissions**: Keep manifest permissions minimal—use `activeTab` permission only.
- **Query params**: URL-encode popup query params (`url`, `title`) when building chrome extension URLs.
- **SVG safety**: Never inject unsanitized user input or URLs into SVG generation.
- **i18n**: All UI text must use `chrome.i18n.getMessage()`. Add entries to `_locales/en/messages.json`.
- **Never commit**: `node_modules/`, `web-ext-artifacts/`, `*.xpi`, `dist/`, `build/`, `.env`, or IDE files.
- **Before completing**: Run `npm run validate` locally (formatting, linting, tests, i18n checks).

## TypeScript Configuration

- **Compilation target**: ES2020 with ES modules.
- **Type checking**: Strict mode enabled (`strict: true`).
- **Module resolution**: Node.js style.
- **Source maps**: Enabled for Firefox DevTools debugging.
- **Browser APIs**: Use `@types/chrome` for accurate type definitions.

## Module Declaration

When declaring types for external modules or augmenting existing types:

```ts
// Module augmentation for Chrome API
declare namespace chrome.runtime {
  interface Message {
    action: string;
    data?: unknown;
  }
}
```
