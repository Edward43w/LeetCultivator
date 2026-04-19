import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return;

  // Find rcedit-x64.exe from electron-builder's cache
  const cacheDir = path.join(
    process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local'),
    'electron-builder', 'Cache', 'winCodeSign'
  );

  let rceditPath = null;
  if (fs.existsSync(cacheDir)) {
    for (const dir of fs.readdirSync(cacheDir)) {
      const candidate = path.join(cacheDir, dir, 'rcedit-x64.exe');
      if (fs.existsSync(candidate)) {
        rceditPath = candidate;
        break;
      }
    }
  }

  if (!rceditPath) {
    console.warn('[afterPack] rcedit-x64.exe not found in cache, skipping icon embedding');
    return;
  }

  const icoPath = path.join(__dirname, '..', 'public', 'icon.ico');
  const productName = context.packager.appInfo.productName;
  const appExe = path.join(context.appOutDir, `${productName}.exe`);

  if (!fs.existsSync(appExe)) {
    console.warn(`[afterPack] App exe not found: ${appExe}`);
    return;
  }

  console.log(`[afterPack] Embedding icon into ${productName}.exe`);
  execFileSync(rceditPath, [appExe, '--set-icon', icoPath]);
  console.log('[afterPack] Icon embedded successfully');
}
