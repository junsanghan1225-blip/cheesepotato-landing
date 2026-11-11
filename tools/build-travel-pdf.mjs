// 여행 포켓 가이드의 A4 PDF 를 미리 만든다(운영자 2026-11-11 「A4가 아닌데」 — 브라우저 인쇄는 용지를 Letter 로 잡는 곳이 있어서, 받아서 바로 인쇄하는 A4 파일을 따로 둔다).
//   node tools/build-travel-pdf.mjs          → assets/travel/korean-travel-pocket-guide-<쉬움|보통|정확|전체>.pdf (travel-data.js 를 고치면 다시 돌린다)
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const type = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': type[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const port = srv.address().port;
const b = await chromium.launch();
const OUT = [['easy', 'easy'], ['std', 'standard'], ['pro', 'formal'], ['all', 'all-tiers']];
for (const [lvl, name] of OUT) {
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  await p.goto(`http://localhost:${port}/travel-guide.html`);
  await p.waitForSelector('#tgBody .tg-sec');
  await p.click(`#tgLv [data-lvl="${lvl}"]`);
  await p.emulateMedia({ media: 'print' });
  const f = path.join(ROOT, `assets/travel/korean-travel-pocket-guide-${name}.pdf`);
  await p.pdf({ path: f, format: 'A4', preferCSSPageSize: true, printBackground: true });
  console.log('→', path.relative(ROOT, f), (fs.statSync(f).size / 1024).toFixed(0) + 'KB');
  await p.close();
}
await b.close(); srv.close();
