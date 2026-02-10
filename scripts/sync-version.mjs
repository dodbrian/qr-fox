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

  // Validate version uses full semver format (MAJOR.MINOR.PATCH)
  if (!semverVersion.match(/^\d+\.\d+\.\d+(-|\+|$)/)) {
    throw new Error(
      `Invalid semver format: ${semverVersion}. Must use MAJOR.MINOR.PATCH format (e.g., 1.0.0)`,
    );
  }

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
