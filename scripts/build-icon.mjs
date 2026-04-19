import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const srcPng = path.join(root, 'public', 'leetcultivator-logo.png');
const destIco = path.join(root, 'public', 'icon.ico');

const icoBuffer = await pngToIco(srcPng);
fs.writeFileSync(destIco, icoBuffer);
console.log(`[build-icon] Written: ${destIco} (${icoBuffer.length} bytes)`);
