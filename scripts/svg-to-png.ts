// scripts/svg-to-png.ts
// Simple utility to generate PNGs (16, 32, 48, 64, 96 px)
// from every SVG found in the assets/ folder.
//
// Usage: npx ts-node scripts/svg-to-png.ts
// (npm script can be added later if desired)

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, basename, extname, resolve } from "path";
import sharp from "sharp";

// sizes we want to produce
const SIZES = [16, 32, 64, 48, 96] as const;
// folder that contains the source SVGs
const ASSETS_DIR = resolve("assets");
// folder where generated PNGs will be placed
const ICONS_DIR = resolve("src", "icons");

async function processSvg(filePath: string) {
  const name = basename(filePath, extname(filePath));
  const svgData = await readFile(filePath);

  for (const size of SIZES) {
    const png = await sharp(svgData)
      .resize({ width: size, height: size, fit: "contain" })
      .png()
      .toBuffer();
    const out = join(ICONS_DIR, `${name}-${size}.png`);
    await writeFile(out, png);
  }
}

async function main() {
  try {
    const files = await readdir(ASSETS_DIR);
    const svgs = files.filter((f) => extname(f).toLowerCase() === ".svg");
    if (svgs.length === 0) {
      console.log("No SVG files found in assets/");
      return;
    }

    // Ensure icons directory exists
    await mkdir(ICONS_DIR, { recursive: true });

    for (const svg of svgs) {
      const fullPath = join(ASSETS_DIR, svg);
      console.log(`Processing ${svg} …`);
      await processSvg(fullPath);
    }
    console.log("✅ PNG generation complete.");
  } catch (err) {
    console.error("Error during PNG generation:", err);
    process.exit(1);
  }
}

main();
