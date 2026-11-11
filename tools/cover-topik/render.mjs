// TOPIK 책 새 앞표지(2026-11-11 운영자 「이걸로 최종」 — 쓰기 51~52 v2.8)를 300dpi PNG 로 찍는다.
//   node tools/cover-topik/render.mjs writing-51-52 [나갈 파일.png]
// 표지 HTML 은 이 폴더의 <id>.html(380×537 화면 = 182×257mm). 글꼴은 /vendor/pretendard.css 라 저장소 뿌리를 웹 서버로 연다.
// 아직 책 공장(build-book) 표지에 들어가기 전의 「앞표지 그림」만 만든다 — 책등 · 뒤표지는 build-book 에 옮길 때.
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');   // build-book 과 같은 자리
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const id = process.argv[2] || 'writing-51-52';
const out = process.argv[3] || `cover-${id}.png`;
const type = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': type[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const port = srv.address().port;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 380, height: 537 }, deviceScaleFactor: 2150 / 380 });   // 182mm 를 300dpi 로 = 2150px
await p.goto(`http://localhost:${port}/tools/cover-topik/${id}.html`);
await p.waitForTimeout(1500);
await (await p.$('.cv')).screenshot({ path: out });
await b.close(); srv.close();
console.log('→', out);
