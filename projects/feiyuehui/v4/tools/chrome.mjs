// Shared by render.mjs and the checks: serve the repo root (node_modules is shared) and drive headless Chrome on the
// GPU. One MIME map and one launch recipe, so every tool loads the film exactly as the renderer does.
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2',
  '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.bin': 'application/octet-stream' };

// → { url(query), close() }: a static server on a free port, rooted at the repo
export async function serveFilm() {
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(p).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return {
    url: (q) => `http://127.0.0.1:${server.address().port}/projects/feiyuehui/v4/index.html?${new URLSearchParams(q)}`,
    close: () => server.close(),
  };
}

export const launchChrome = () => chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding', '--disable-gpu-watchdog', '--disable-features=CalculateNativeWinOcclusion'],
});
