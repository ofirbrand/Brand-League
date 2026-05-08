// Generate PWA icons from public/logo.svg using sharp.
// Run: node scripts/generate-icons.mjs

import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const svgPath = resolve(root, "public/logo.svg");

async function render(size, outName, padding = 0) {
  const svg = await readFile(svgPath);
  const inner = size - padding * 2;
  const inset = await sharp(svg)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Solid navy background canvas to keep maskable icons inside the safe zone.
  const out = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 10, g: 22, b: 40, alpha: 1 },
    },
  })
    .composite([{ input: inset, top: padding, left: padding }])
    .png()
    .toBuffer();

  await writeFile(resolve(root, "public", outName), out);
  console.log(`Wrote public/${outName} (${size}×${size})`);
}

await render(192, "icon-192.png", 24);
await render(512, "icon-512.png", 64);
await render(180, "apple-touch-icon.png", 18);
