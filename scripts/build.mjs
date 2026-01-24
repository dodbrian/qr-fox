#!/usr/bin/env node
import { cp, mkdir, rm } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

async function build() {
  console.log("🧹 Cleaning dist/ directory...");
  await rm("dist", { recursive: true, force: true });
  await mkdir("dist", { recursive: true });

  console.log("📦 Compiling TypeScript extension code...");
  await execAsync("tsc");

  console.log("📄 Copying static assets...");
  // Copy HTML
  await mkdir("dist/popup", { recursive: true });
  await cp("src/popup/popup.html", "dist/popup/popup.html");

  // Copy CSS
  await cp("src/popup/styles.css", "dist/popup/styles.css");

  // Copy icons
  await cp("src/icons", "dist/icons", { recursive: true });

  // Copy locales
  await cp("src/_locales", "dist/_locales", { recursive: true });

  // Copy manifest
  await cp("src/manifest.json", "dist/manifest.json");

  console.log("✅ Build complete! Extension ready in dist/");
}

async function buildScripts() {
  console.log("🔧 Compiling build scripts and tests...");
  await execAsync("tsc -p tsconfig.build.json");
  console.log("✅ Scripts compiled to build/");
}

// Check if running with --scripts flag
const scriptsOnly = process.argv.includes("--scripts");

if (scriptsOnly) {
  buildScripts().catch(console.error);
} else {
  build().catch(console.error);
}
