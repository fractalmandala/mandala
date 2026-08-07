import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const srcDir = '/Users/amrit/fractals/apps/fractalengine/static/icontheme-allicon';
const dstDir = '/Users/amrit/fractals/apps/fractalengine/static/icontheme-current';

if (!existsSync(dstDir)) {
  mkdirSync(dstDir, { recursive: true });
}

const files = readdirSync(srcDir).filter(f => f.endsWith('.svg'));

let count = 0;
for (const file of files) {
  const srcPath = join(srcDir, file);
  const dstPath = join(dstDir, file);
  let content = readFileSync(srcPath, 'utf-8');
  // Replace fill="#..." (any hex color) with fill="currentColor"
  content = content.replace(/fill="\s*#[0-9a-fA-F]+"/g, 'fill="currentColor"');
  writeFileSync(dstPath, content, 'utf-8');
  count++;
}

console.log(`Done. Processed ${count} SVG files -> ${dstDir}`);
