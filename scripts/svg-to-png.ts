// scripts/svg-to-png.ts
// Simple utility to generate light and dark PNGs (16, 32, 64 px)
// from every SVG found in the assets/ folder.
//
// Usage: npx ts-node scripts/svg-to-png.ts
// (npm script can be added later if desired)

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join, basename, extname, resolve } from "path";
import sharp from "sharp";

// sizes we want to produce
const SIZES = [16, 32, 64] as const;
// folder that contains the source SVGs
const ASSETS_DIR = resolve("assets");
// folder where generated PNGs will be placed
const ICONS_DIR = resolve("src", "icons");

/**
 * Invert the colors of an RGBA buffer.
 * For PNG output we just invert each channel; the alpha channel stays unchanged.
 */
function invertColors(buffer: Buffer): Buffer {
  const inverted = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i += 4) {
    // R, G, B channels
    inverted[i] = 255 - buffer[i];
    inverted[i + 1] = 255 - buffer[i + 1];
    inverted[i + 2] = 255 - buffer[i + 2];
    // Alpha channel stays the same
    inverted[i + 3] = buffer[i + 3];
  }
  return inverted;
}

async function processSvg(filePath: string) {
  const name = basename(filePath, extname(filePath));
  const svgData = await readFile(filePath);

  for (const size of SIZES) {
    // ----- Light version (original colors) -----
    const lightPng = await sharp(svgData)
      .resize({ width: size, height: size, fit: "contain" })
      .png()
      .toBuffer();
    const lightOut = join(ICONS_DIR, `${name}-${size}-light.png`);
    await writeFile(lightOut, lightPng);

    // ----- Dark version (colors inverted) -----
    // Render to raw RGBA, invert, then encode back to PNG
    const raw = await sharp(svgData)
      .resize({ width: size, height: size, fit: "contain" })
      .raw()
      .ensureAlpha()
      .toBuffer();
    const inverted = invertColors(raw);
    const darkPng = await sharp(inverted, {
      raw: { width: size, height: size, channels: 4 },
    })
      .png()
      .toBuffer();
    const darkOut = join(ICONS_DIR, `${name}-${size}-dark.png`);
    await writeFile(darkOut, darkPng);
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
