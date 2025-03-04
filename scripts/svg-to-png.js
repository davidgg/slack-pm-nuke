#!/usr/bin/env node

/**
 * SVG to PNG Converter for Slack PM Nuke
 *
 * This script converts SVG icons to PNG files for use in the Chrome extension.
 * It requires the 'sharp' library for image processing.
 *
 * Usage:
 *   npm install sharp
 *   node svg-to-png.js
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Paths
const SRC_ICONS_DIR = path.join(__dirname, "../src/icons");
const DIST_ICONS_DIR = path.join(__dirname, "../dist/images");
const CHROME_STORE_DIR = path.join(__dirname, "../chrome-store");

// Ensure the output directories exist
if (!fs.existsSync(DIST_ICONS_DIR)) {
  fs.mkdirSync(DIST_ICONS_DIR, { recursive: true });
}

if (!fs.existsSync(CHROME_STORE_DIR)) {
  fs.mkdirSync(CHROME_STORE_DIR, { recursive: true });
}

// Icon sizes for extension
const ICON_SIZES = [16, 48, 128];

// Convert SVG to PNG
async function convertSvgToPng(svgPath, outputPath, size) {
  try {
    await sharp(svgPath).resize(size, size).png().toFile(outputPath);

    console.log(`✅ Created: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error converting ${svgPath} to PNG:`, error);
  }
}

// Main function
async function main() {
  console.log("🚀 Starting SVG to PNG conversion...");

  // Main icon path
  const mainIconPath = path.join(SRC_ICONS_DIR, "icon.svg");
  const storeIconPath = path.join(SRC_ICONS_DIR, "store-icon.svg");

  if (!fs.existsSync(mainIconPath)) {
    console.error(`❌ Main icon not found: ${mainIconPath}`);
    return;
  }

  // Convert extension icons (all sizes from the same source)
  for (const size of ICON_SIZES) {
    const outputPath = path.join(DIST_ICONS_DIR, `icon${size}.png`);
    await convertSvgToPng(mainIconPath, outputPath, size);
  }

  // Convert Chrome Store icon if it exists
  if (fs.existsSync(storeIconPath)) {
    const storeOutputPath = path.join(CHROME_STORE_DIR, "store-icon.png");
    await convertSvgToPng(storeIconPath, storeOutputPath, 128);
  } else {
    console.log(`ℹ️ Chrome Store icon not found, using main icon instead`);
    // Use the main icon for the Chrome Store if store-icon.svg doesn't exist
    const storeOutputPath = path.join(CHROME_STORE_DIR, "store-icon.png");
    await convertSvgToPng(mainIconPath, storeOutputPath, 128);
  }

  console.log("✨ Conversion complete!");
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error("❌ An error occurred:", error);
  process.exit(1);
});
