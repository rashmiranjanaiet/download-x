import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const binDir = path.join(rootDir, 'server', 'bin');
const fileName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const targetPath = path.join(binDir, fileName);
const downloadUrl =
  process.platform === 'win32'
    ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
    : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

console.log(`Downloading ${fileName} from ${downloadUrl}`);

await fs.mkdir(binDir, { recursive: true });

const response = await fetch(downloadUrl, { redirect: 'follow' });

if (!response.ok) {
  throw new Error(`Failed to download yt-dlp: ${response.status} ${response.statusText}`);
}

const buffer = Buffer.from(await response.arrayBuffer());
await fs.writeFile(targetPath, buffer);

if (process.platform !== 'win32') {
  await fs.chmod(targetPath, 0o755);
}

console.log(`Saved ${fileName} to ${targetPath}`);
