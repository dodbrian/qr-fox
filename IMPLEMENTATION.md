# Version Management Implementation Guide

This document provides implementation instructions for setting up automated version management using `release-it` with semantic versioning.

## Overview

- **Tool**: `release-it` with `@release-it/conventional-changelog` plugin
- **Trigger**: Manual GitHub Actions `workflow_dispatch` (package job)
- **Files to sync**: `package.json`, `src/manifest.json`, `amo-metadata.json`
- **Version logic**: Semantic versioning based on conventional commits

---

## Step 1: Install Dependencies

Install `release-it` and the conventional-changelog plugin:

```bash
npm install --save-dev release-it @release-it/conventional-changelog
```

---

## Step 2: Create `scripts/sync-version.mjs`

Create a script to synchronize the version from `package.json` to other files:

```javascript
/**
 * Synchronize version from package.json to src/manifest.json and amo-metadata.json
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, "..");

/**
 * Read and parse a JSON file
 */
function readJson(filePath) {
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * Write JSON to a file
 */
function writeJson(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/**
 * Main version sync function
 */
export function syncVersion() {
  // Read version from package.json (semver format: 1.0.0)
  const pkg = readJson(join(ROOT_DIR, "package.json"));
  const semverVersion = pkg.version;

  // Convert semver to manifest version (drop pre-release, build metadata)
  // Firefox add-ons use simple version format: 1.0, 1.1.2, etc.
  const manifestVersion = semverVersion.split("-")[0].split("+")[0];

  // Update src/manifest.json
  const manifest = readJson(join(ROOT_DIR, "src", "manifest.json"));
  manifest.version = manifestVersion;
  writeJson(join(ROOT_DIR, "src", "manifest.json"), manifest);

  // Update amo-metadata.json
  const amo = readJson(join(ROOT_DIR, "amo-metadata.json"));
  amo.version.number = manifestVersion;
  writeJson(join(ROOT_DIR, "amo-metadata.json"), amo);

  console.log(
    `Version synchronized: ${semverVersion} (package.json) → ${manifestVersion} (manifest/amo)`,
  );
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncVersion();
}
```

Add the script to `package.json`:

```json
"scripts": {
  "sync-version": "node scripts/sync-version.mjs",
  ...
}
```

---

## Step 3: Create `.release-it.json`

Create configuration file in project root:

```json
{
  "git": {
    "commitMessage": "chore: release ${version}",
    "tagName": "v${version}",
    "pushRepo": "origin"
  },
  "npm": {
    "publish": false
  },
  "github": {
    "release": true,
    "releaseName": "v${version}",
    "preRelease": false,
    "assets": ["web-ext-artifacts/*.xpi"]
  },
  "plugins": {
    "@release-it/conventional-changelog": {
      "infile": "CHANGELOG.md",
      "preset": "conventionalcommits",
      "types": [
        {
          "type": "feat",
          "section": "Features"
        },
        {
          "type": "fix",
          "section": "Bug Fixes"
        },
        {
          "type": "chore",
          "hidden": true
        },
        {
          "type": "docs",
          "hidden": true
        },
        {
          "type": "style",
          "hidden": true
        },
        {
          "type": "refactor",
          "hidden": true
        },
        {
          "type": "test",
          "hidden": true
        }
      ]
    }
  },
  "hooks": {
    "after:bump": "npm run sync-version"
  }
}
```

---

## Step 4: Update `.github/workflows/ci.yml`

Modify the `package` job to use release-it:

```yaml
package:
  runs-on: ubuntu-latest
  needs: test
  if: github.ref == 'refs/heads/main' && github.event_name == 'workflow_dispatch'

  permissions:
    contents: write

  steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
        token: ${{ secrets.GITHUB_TOKEN }}

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "22"
        cache: "npm"

    - name: Install dependencies
      run: npm ci

    - name: Configure Git
      run: |
        git config --global user.name "github-actions[bot]"
        git config --global user.email "github-actions[bot]@users.noreply.github.com"

    - name: Release with version bump
      run: npx release-it --ci --no-npm.publish
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    - name: Validate and build
      run: npm run validate && npm run test && npm run build

    - name: Create .xpi package
      run: web-ext build

    - name: Upload to GitHub Release
      uses: softprops/action-gh-release@v2
      with:
        files: web-ext-artifacts/*.xpi
        tag_name: v${{ steps.release-it.outputs.version }}
        generate_release_notes: true
```

---

## Step 5: Add `.github/workflows/release.yml` (Alternative Approach)

For a cleaner separation, create a dedicated release workflow:

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      version-bump:
        description: "Version bump type"
        required: true
        default: "patch"
        type: choice
        options:
          - patch
          - minor
          - major
          - none

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Configure Git
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"

      - name: Release with version bump
        run: npx release-it --ci --no-npm.publish ${{ github.event.inputs.version-bump != 'none' && github.event.inputs.version-bump || '' }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Create package
        run: npm run pkg

      - name: Upload to GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: web-ext-artifacts/*.xpi
          tag_name: ${{ steps.release-it.outputs.tag }}
          generate_release_notes: true
```

---

## Step 6: Testing

Test the setup locally:

```bash
# Do a dry run to see what would happen
npx release-it --dry-run

# Do an actual release (minor bump)
npx release-it --minor

# Test version sync script
npm run sync-version
```

---

## Conventional Commits Reference

- `feat:` → minor version bump (1.0.0 → 1.1.0)
- `fix:` → patch version bump (1.0.0 → 1.0.1)
- `feat(scope)!:` or `BREAKING CHANGE:` → major version bump (1.0.0 → 2.0.0)
- `chore:`, `docs:`, `test:`, `style:`, `refactor:` → no version bump

---

## Notes

- The GITHUB_TOKEN secret is automatically provided by GitHub Actions
- `fetch-depth: 0` ensures full git history for changelog generation
- The version format conversion handles semver → manifest version (e.g., 1.0.0-beta.1 → 1.0.0)
- Update `.gitignore` if needed (should already be done for node_modules, web-ext-artifacts, etc.)
