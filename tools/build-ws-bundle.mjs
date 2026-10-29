// 문법 학습지 묶음 PDF — 단계(초급 · 중급 · 고급)마다 한 권(운영자 2026-10-29 「학습지 번들로 · grammar 학습지 초급 중급 고급으로 나눠서」).
//   node tools/build-ws-bundle.mjs <beginner|intermediate|advanced> [--out 폴더] [--ver v1.0]
// 원본은 build-worksheets.mjs 가 만든 worksheet/<id>.html(무료) · worksheet/pro/<id>.html(전체)의 설명 · 연습 · 정답 쪽을 그대로 모은다 — 사이트 학습지와 같은 글.
// 짜임: 표지 → 쓰는 법 · 이용 안내 → 차례 → 학습지(설명 + 연습, 갈래 순) → 정답 모음(맨 뒤, 학생 인쇄본과 떼어 쓰라고).
// 파는 파일이라 저장소에 올리지 않는다(books-out/). 가격 · Polar 상품은 운영자가 정한다.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const LEVEL = args.find((a) => !a.startsWith('--') && a !== opt('--out') && a !== opt('--ver'));
const LV = { beginner: ['초급', 'Beginner', '01'], intermediate: ['중급', 'Intermediate', '02'], advanced: ['고급', 'Advanced', '03'] };
if (!LV[LEVEL]) { console.error('쓰는 법: node tools/build-ws-bundle.mjs <beginner|intermediate|advanced> [--out 폴더] [--ver v1.0]'); process.exit(1); }
const outDir = path.resolve(opt('--out', path.join(ROOT, 'books-out')));
const VER = opt('--ver', 'v1.0');
const [lvKo, lvEn, no] = LV[LEVEL];
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const list = JSON.parse(fs.readFileSync(path.join(ROOT, 'worksheet/list.json'), 'utf8')).filter((x) => x.l === LEVEL);
if (!list.length) { console.error('이 단계의 학습지가 없다 — 먼저 node tools/build-worksheets.mjs'); process.exit(1); }
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const CSS = /<style>([\s\S]*?)<\/style>/.exec(read(`worksheet/pro/${list.find((x) => !x.f).id}.html`))[1];
const sections = (h) => [...h.matchAll(/<section class="ws-p[^"]*">[\s\S]*?<\/section>/g)].map((m) => m[0]);

const front = [], keys = [], body = [];
const cats = [];
for (const x of list) {
  const file = fs.existsSync(path.join(ROOT, `worksheet/pro/${x.id}.html`)) ? `worksheet/pro/${x.id}.html` : `worksheet/${x.id}.html`;
  const s = sections(read(file));
  if (s.length < 3 || /ws-lock/.test(s[1])) throw new Error(`${x.id}: 전체 쪽(설명 · 연습 · 정답)이 아니다 — ${file}`);
  body.push(s[0], s[1]);
  keys.push(s[2]);
  let c = cats.find((k) => k.c === x.c); if (!c) cats.push(c = { c: x.c, ce: x.ce, items: [] });
  c.items.push(x);
}
const n = list.length;
const coverHtml = `<section class="ws-p bd-cover"><div class="bd-top"><span>CHEESEPOTATO</span><span>EVERYKOREANS</span></div>
<p class="bd-k">문법 학습지 묶음</p><h1>Korean Grammar Worksheets<br><small>${lvEn} · ${lvKo}</small></h1>
<p class="bd-s">${n} printable grammar worksheets — explanation, examples, practice, and a separate answer-key section. 설명 · 예문 · 연습 · 정답 모음.</p>
<p class="bd-by">에브리코리안즈 · Everykoreans</p></section>`;
const howHtml = `<section class="ws-p"><h1>How to use · 쓰는 법</h1>
<p>Each worksheet is two pages: <b>① the explanation</b> (meaning, form, examples) and <b>② the practice</b> (change the word, fill in the blank, copy, write in Korean, your own sentences). All answers are in the <b>Answer keys</b> section at the back, so you can print the student pages without them.</p>
<p>워크시트는 한 장이 두 쪽이에요: <b>① 설명</b>(뜻 · 형태 · 예문) <b>② 연습</b>(바꿔 쓰기 · 빈칸 · 따라 쓰기 · 한국어로 쓰기 · 내 문장). 정답은 모두 맨 뒤 「정답 모음」에 있어서, 학생에게 줄 쪽만 따로 인쇄할 수 있어요.</p>
<h2>Tips · 쓰는 법 제안</h2>
<ul class="ws-ex"><li>Print on A4. Do one worksheet at a time, then check with the key. · A4로 인쇄하고, 한 장씩 풀고 정답을 확인해요.</li>
<li>The last practice box (My own sentences) is free writing — check that the grammar form and the meaning fit. · 마지막 「내 문장」은 자유 쓰기예요. 문법 모양과 뜻이 맞는지만 보세요.</li>
<li>Teachers: print the student pages for the class and keep the answer keys for yourself. · 선생님: 학생용 쪽만 반 인쇄, 정답 모음은 따로 보관하세요.</li></ul>
<h2>About the questions · 문제에 대해</h2>
<p>All practice questions are original, written for CheesePotato — they are <b>not</b> past exam questions. This bundle is an independent study aid and is not operated, endorsed or certified by any exam organisation. · 모든 문제는 치즈감자가 만든 창작 문항이며 기출이 아니에요. 이 자료는 독립 학습 자료예요.</p>
<h2>License · 이용 안내</h2>
<p>© Everykoreans (에브리코리안즈). Print for your own study or your own class. Please do not resell, share or post the file. · 개인 학습 · 본인 수업용으로 인쇄해 쓰세요. 파일의 재판매 · 공유 · 게시는 하지 말아 주세요.</p></section>`;
const tocHtml = `<section class="ws-p"><h1>Contents · 차례 <small>${n}</small></h1>${cats.map((c) => `<h2>${esc(c.c)} · ${esc(c.ce || '')}</h2><p class="bd-toc">${c.items.map((x) => esc(x.n)).join(' &nbsp;·&nbsp; ')}</p>`).join('')}</section>`;
const keysHead = `<section class="ws-p"><h1>Answer keys · 정답 모음</h1><p>${n} answer keys, in the same order as the worksheets. · 학습지와 같은 차례예요.</p></section>`;
const EXTRA = `.bd-cover{display:flex;flex-direction:column;min-height:260mm}.bd-top{display:flex;justify-content:space-between;font-size:12px;letter-spacing:.2em;font-weight:700;border-bottom:2px solid #1B1512;padding-bottom:8px}
.bd-k{margin-top:70mm!important;font-size:22px!important;font-weight:800;color:#E1682B}.bd-cover h1{font-size:48px!important;line-height:1.15;margin:6px 0 14px}.bd-cover h1 small{display:block;font-size:30px;font-weight:700;margin-top:12px}
.bd-s{font-size:16px!important;line-height:1.6;max-width:150mm}.bd-by{margin-top:auto!important;border-top:2px solid #1B1512;padding-top:10px;font-size:18px!important;font-weight:700}
.bd-toc{font-size:12.5px!important;line-height:1.9}body{background:#fff}.ws-p{border:0;border-radius:0;padding:0;margin:0;break-after:page}.hd,.ft{display:none}`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="/vendor/pretendard.css"><link rel="stylesheet" href="/page.css"><style>${CSS}\n${EXTRA}</style></head>
<body><main class="ws-doc" style="max-width:none">${coverHtml}${howHtml}${tocHtml}${body.join('\n')}${keysHead}${keys.join('\n')}</main></body></html>`;

const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/__bundle.html') { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(html); return; }
  const mime = { '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.png': 'image/png' };
  fs.readFile(path.join(ROOT, u), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': mime[path.extname(u)] || 'application/octet-stream' }); r.end(d); });
}).listen(0);
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
const browser = await chromium.launch();
const pg = await browser.newPage();
await pg.goto(`http://localhost:${srv.address().port}/__bundle.html`, { waitUntil: 'networkidle' });
await pg.evaluate(() => document.fonts.ready);
fs.mkdirSync(outDir, { recursive: true });
const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const file = path.join(outDir, `에브리코리안즈_학습지묶음_${no}_문법학습지${lvKo}_본문_${VER}_${date}.pdf`);
await pg.pdf({
  path: file, format: 'A4', printBackground: true, displayHeaderFooter: true,
  margin: { top: '12mm', bottom: '16mm', left: '12mm', right: '12mm' },
  headerTemplate: '<span></span>',
  footerTemplate: `<div style="width:100%;font-size:8px;color:#8a7f72;padding:0 12mm;display:flex;justify-content:space-between;font-family:sans-serif"><span>© Everykoreans · Korean Grammar Worksheets — ${lvEn} · For your own study or class. Do not resell or share.</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
});
await browser.close(); srv.close();
const pages = (fs.readFileSync(file).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`${lvKo}(${lvEn}) 묶음 — 학습지 ${n}장 · ${pages}쪽 · ${(fs.statSync(file).size / 1048576).toFixed(1)}MB → ${file}`);
