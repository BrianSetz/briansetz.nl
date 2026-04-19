// Minimal static file server used by Playwright to serve _site/.
// Emulates GitHub Pages: directory URLs resolve to index.html; unknown
// paths return 404.html with status 404.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..', '_site');
const PORT = Number(process.env.PORT) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.pdf':  'application/pdf',
};

async function resolvePath(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.(\/|\\|$))+/, '');
  const abs = join(ROOT, safe);
  if (!abs.startsWith(ROOT + sep) && abs !== ROOT) return null;
  try {
    const s = await stat(abs);
    return s.isDirectory() ? join(abs, 'index.html') : abs;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const filePath = await resolvePath(req.url || '/');
  if (filePath) {
    try {
      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
      res.end(body);
      return;
    } catch { /* fall through to 404 */ }
  }
  try {
    const body = await readFile(join(ROOT, '404.html'));
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404');
  }
});

server.listen(PORT, () => {
  console.log(`Static server: http://localhost:${PORT} (root: ${ROOT})`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.close(() => process.exit(0)));
}
