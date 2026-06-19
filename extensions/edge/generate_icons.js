import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sourcePath = 'f:\\dco.ink\\packages\\web\\public\\favicon.png';
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

const sizes = [16, 48, 128];

async function generate() {
  for (const size of sizes) {
    await sharp(sourcePath)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png from favicon`);
  }
}

generate().catch(console.error);
