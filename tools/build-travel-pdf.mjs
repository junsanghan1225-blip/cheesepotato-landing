// 여행 포켓 가이드의 상황별 A4 PDF 를 미리 만든다(운영자 2026-11-11 「이렇게 말고 나눠주라고 각각」 · 「A4가 아닌데」 — 브라우저 인쇄는 용지를 Letter 로 잡는 곳이 있어서, 받아서 바로 인쇄하는 A4 파일을 따로 둔다).
//   node tools/build-travel-pdf.mjs
//   → assets/travel/korean-travel-pocket-guide-<상황id>-<standard|all-tiers>.pdf  (7개 상황 × 보통 · 3단계 비교, 한 장씩). travel-data.js · travel-guide.html 을 고치면 다시 돌린다.
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { TRAVEL_CATEGORIES } = await import(path.join(ROOT, 'travel-data.js'));
const type = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': type[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const port = srv.address().port;
fs.mkdirSync(path.join(ROOT, 'assets/travel'), { recursive: true });
for (const old of fs.readdirSync(path.join(ROOT, 'assets/travel'))) if (/^korean-travel-pocket-guide-.*\.pdf$/.test(old)) fs.rmSync(path.join(ROOT, 'assets/travel', old));   // 옛 묶음 PDF 가 남지 않게
const b = await chromium.launch();
for (const c of [...TRAVEL_CATEGORIES, { id: 'all', out: 'full' }]) for (const [lvl, name] of [['std', 'standard'], ['all', 'all-tiers']]) {
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  await p.goto(`http://localhost:${port}/travel-guide.html?cat=${c.id}&lvl=${lvl}`);
  await p.waitForSelector('#tgBody .tg-sec');
  await p.emulateMedia({ media: 'print' });
  const f = path.join(ROOT, `assets/travel/korean-travel-pocket-guide-${c.out || c.id}-${name}.pdf`);
  await p.pdf({ path: f, format: 'A4', preferCSSPageSize: true, printBackground: true });
  console.log('→', path.relative(ROOT, f), (fs.statSync(f).size / 1024).toFixed(0) + 'KB');
  await p.close();
}
await b.close(); srv.close();
