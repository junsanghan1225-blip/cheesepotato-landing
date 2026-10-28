// Kindle 전용 새 책(KDP 오리지널) ePub · 표지 · 복붙표 만들기 — 운영자 2026-10-28 「Kindle 전용 ePub 만들어줘」.
//   node tools/build-kdp-original.mjs <책 id> [--out 폴더] [--ver v1.0]
// 원본: docs/kdp-orig/<책 id>.json(안티 · Claude 검토). 지금은 kdp-short-stories-1 한 권(파일 이름 short-stories.json).
// 규칙(KDP 가 상호작용형 책을 내렸다 → docs/plans/kdp-original.md): Kindle 안에서 읽기만으로 끝난다 — QR · 웹 안내 · 쓰기 줄 없음,
// 이해 문제는 정답을 바로 아래에, ISBN 없음(ASIN), 글 중심이라 파일이 작다(전송료 MB 당 0.15달러).
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { esc as hesc, copyPage } from './lib/copy-page.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const bookId = args.find((a) => !a.startsWith('--') && a !== opt('--out') && a !== opt('--ver')) || 'short-stories';
const outDir = path.resolve(opt('--out', path.join(ROOT, 'books-out')));
const VER = opt('--ver', 'v1.0');
const B = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/kdp-orig/${bookId}.json`), 'utf8'));
const stories = B.stories;
if (!stories?.length) { console.error('이야기가 없다'); process.exit(1); }

const TITLE = 'Korean Short Stories for Beginners';
const SUB = `${stories.length} Easy Bilingual Stories (A1–A2) with Vocabulary and Comprehension Questions`;
const AUTHOR = 'Junsang';
const x = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ko = (s) => `<span lang="ko" xml:lang="ko">${x(s)}</span>`;
const pad = (n) => String(n).padStart(2, '0');
const uuid = 'urn:uuid:' + [8, 4, 4, 4, 12].map((n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('')).join('-');

fs.rmSync(outDir, { recursive: true, force: true });
const src = path.join(outDir, 'epub-src'), OEBPS = path.join(src, 'OEBPS');
fs.mkdirSync(path.join(src, 'META-INF'), { recursive: true });
fs.mkdirSync(OEBPS, { recursive: true });
const W = (f, t) => fs.writeFileSync(path.join(OEBPS, f), t);
const page = (title, body, cls = '') => `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en"><head><meta charset="utf-8"/><title>${x(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body${cls ? ` class="${cls}"` : ''}>${body}</body></html>`;

/* ── 표지(JPEG 1600×2560) — 글자만, 평평한 색. 글꼴은 저장소의 Pretendard ── */
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
const mime = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/cover.html') { r.writeHead(200, { 'content-type': 'text/html' }); r.end(coverHtml); return; }
  fs.readFile(path.join(ROOT, u), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': mime[path.extname(u)] || 'application/octet-stream' }); r.end(d); });
}).listen(0);
const BG = '#1F3A5F', INK = '#F5EFE0', GOLD = '#E3C277';
var coverHtml = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/vendor/pretendard.css"><style>
html,body{margin:0}body{width:1600px;height:2560px;background:${BG};color:${INK};font-family:'Pretendard Variable','Pretendard',sans-serif;position:relative;overflow:hidden}
.fr{position:absolute;inset:70px;border:4px solid ${INK}}.top{position:absolute;left:150px;right:150px;top:150px;display:flex;justify-content:space-between;font-size:38px;letter-spacing:.2em;font-weight:700}
.rule{position:absolute;left:150px;right:150px;top:250px;border-top:3px solid ${INK}}
.k{position:absolute;left:150px;top:520px;font-size:230px;font-weight:900;color:${GOLD};line-height:1.05}.k small{display:block;font-size:110px;color:${INK};font-weight:700;margin-bottom:30px}
.t{position:absolute;left:150px;right:150px;top:1330px;font-size:112px;font-weight:800;line-height:1.12}.s{position:absolute;left:150px;right:150px;top:1720px;font-size:54px;line-height:1.4;opacity:.9}
.b{position:absolute;left:150px;top:2050px;width:520px;padding:34px 40px;background:${INK};color:${BG};font-size:60px;font-weight:900}.b span{display:block;font-size:34px;font-weight:600;margin-top:6px}
.au{position:absolute;left:150px;right:150px;bottom:150px;border-top:3px solid ${INK};padding-top:38px;font-size:48px;font-weight:700}</style>
<div class="fr"></div><div class="top"><span>BILINGUAL READER</span><span>한영 대역</span></div><div class="rule"></div>
<div class="k"><small>한국어</small>짧은<br>이야기</div>
<div class="t">${x(TITLE)}</div><div class="s">${stories.length} easy stories · Korean and English side by side · vocabulary · questions with answers</div>
<div class="b">A1–A2<span>Beginner</span></div><div class="au">${x(AUTHOR)}</div>`;
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1600, height: 2560 } });
await pg.goto(`http://localhost:${srv.address().port}/cover.html`, { waitUntil: 'networkidle' });
await pg.evaluate(() => document.fonts.ready);
const coverPng = path.join(outDir, 'cover.png');
await pg.screenshot({ path: coverPng });
await browser.close(); srv.close();
const coverJpg = path.join(outDir, 'cover.jpg');
execFileSync('convert', [coverPng, '-quality', '88', '-strip', coverJpg]);
fs.copyFileSync(coverJpg, path.join(OEBPS, 'cover.jpg'));

/* ── 스타일 — 전자잉크에서도 읽히게 검정 · 회색뿐 ── */
W('style.css', `body{margin:5%;line-height:1.55}h1,h2,h3{page-break-after:avoid;break-after:avoid}h1{font-size:1.6em;margin:.4em 0}h2{font-size:1.3em;margin:1.2em 0 .3em;border-bottom:1px solid #000}h3{font-size:1.05em;margin:1.2em 0 .3em}
.lv{font-size:.8em;border:1px solid #000;padding:0 .4em;margin-right:.4em}.sub{color:#444;margin:0 0 1em}
p.ko{font-size:1.15em;margin:.7em 0 0}p.en{margin:.05em 0 .5em;color:#444;font-size:.92em}
table{border-collapse:collapse;width:100%;font-size:.95em}td{border-bottom:1px solid #999;padding:.25em .3em;vertical-align:top}td:first-child{width:38%;font-weight:bold}
.q{margin:.6em 0 0}.a{margin:.05em 0 .5em 1.2em;color:#444}.c{text-align:center}.small{font-size:.85em;color:#444}.pb{page-break-before:always;break-before:page}
nav ol{list-style:none;padding-left:0}nav li{margin:.2em 0}`);

/* ── 앞부분 ── */
const files = []; // { id, file, title, type? }
const add = (id, title, body, cls = '', ep = '') => { const file = `${id}.xhtml`; W(file, page(title, ep ? `<section epub:type="${ep}">${body}</section>` : body, cls)); files.push({ id, file, title }); };
W('cover.xhtml', page('Cover', `<div class="c"><img src="cover.jpg" alt="${x(TITLE)} — cover" style="max-width:100%;max-height:100%"/></div>`, ''));
add('title', 'Title page', `<div class="c"><h1 style="margin-top:3em">${x(TITLE)}</h1><p class="sub">${x(SUB)}</p><p>${x(AUTHOR)}</p></div>`);
add('copyright', 'Copyright', `<p><b>${x(TITLE)}</b></p><p>${x(SUB)}</p><p>Author: ${x(AUTHOR)}</p><p>Digital edition · Kindle · ${new Date().getFullYear()}</p><p class="small">© Everykoreans. All rights reserved. All stories, sentences and questions were written for this book. Names, places and events are fictional. No part of this book may be reproduced without written permission, except for brief quotations in reviews.</p>`);
add('how', 'How to use this book', `<h1>How to use this book</h1>
<p>Each story is told line by line: first the Korean sentence, then the English meaning right below it.</p>
<ol><li>Read the Korean line slowly, then read the English.</li><li>Read the story again and cover the English with your finger. Can you follow it?</li><li>Look at the word list after the story. These words appear in that story.</li><li>Answer the three questions in your head. The answer is shown right below each question.</li><li>Come back to the same story a few days later and read it once more.</li></ol>
<p><b>Levels.</b> Stories 1–15 are <b>A1</b> (very short sentences, everyday words). Stories 16–${stories.length} are <b>A2</b> (longer sentences, reasons and time order). You do not have to read in order.</p>
<p class="small">Everything you need is inside this book. Korean text uses your device's Korean font; if Korean letters look like empty boxes, install or enable Korean on your Kindle.</p>`);
const toc = stories.map((s) => `<li><a href="s${pad(s.no)}.xhtml">${s.no}. ${x(s.title.en)} · ${ko(s.title.ko)} <span class="small">(${x(s.level)})</span></a></li>`).join('');
add('contents', 'Contents', `<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>${toc}<li><a href="wordlist.xhtml">Word list · all stories</a></li><li><a href="author.xhtml">About the author</a></li></ol></nav>`);

/* ── 이야기 40편 ── */
for (const s of stories) {
  const lines = s.lines.map((l) => `<p class="ko">${ko(l.ko)}</p><p class="en">${x(l.en)}</p>`).join('');
  const vocab = `<table>${s.vocab.map((v) => `<tr><td>${ko(v.ko)}</td><td>${x(v.en)}</td></tr>`).join('')}</table>`;
  const qa = s.check.map((c, i) => `<p class="q"><b>${i + 1}.</b> ${x(c.q)}</p><p class="a">→ ${x(c.a)}</p>`).join('');
  add(`s${pad(s.no)}`, `${s.no}. ${s.title.en}`, `<h1>${s.no}. ${ko(s.title.ko)}</h1><p class="sub"><span class="lv">${x(s.level)}</span>${x(s.title.en)}</p>${lines}<h3>Words in this story</h3>${vocab}<h3>Check yourself</h3>${qa}`, 'pb');
}

/* ── 낱말 모음(이야기 순서) ── */
const seen = new Set(), rows = [];
for (const s of stories) for (const v of s.vocab) { if (seen.has(v.ko)) continue; seen.add(v.ko); rows.push(`<tr><td>${ko(v.ko)}</td><td>${x(v.en)} <span class="small">· story ${s.no}</span></td></tr>`); }
add('wordlist', 'Word list', `<h1>Word list</h1><p class="small">${rows.length} words, in the order they first appear.</p><table>${rows.join('')}</table>`, 'pb');
add('author', 'About the author', `<h1>About the author</h1><p>Junsang is a Korean teacher. In about two years he has taught around 100 students for more than 1,700 hours, mostly from Europe and the United States. He writes simple, original Korean practice material for learners.</p><p>Thank you for reading. If this book helped you, a short review on Amazon helps other learners find it.</p>`, 'pb');

/* ── 목차 · OPF · 컨테이너 ── */
W('nav.xhtml', page('Contents', `<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>${files.filter((f) => !['title', 'copyright'].includes(f.id)).map((f) => `<li><a href="${f.file}">${x(f.title)}</a></li>`).join('')}</ol></nav><nav epub:type="landmarks" hidden="hidden"><ol><li><a epub:type="cover" href="cover.xhtml">Cover</a></li><li><a epub:type="bodymatter" href="s01.xhtml">Start of book</a></li></ol></nav>`));
const items = [`<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`, `<item id="css" href="style.css" media-type="text/css"/>`, `<item id="cover-img" href="cover.jpg" media-type="image/jpeg" properties="cover-image"/>`, `<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>`, ...files.map((f) => `<item id="${f.id}" href="${f.file}" media-type="application/xhtml+xml"/>`)];
const spine = ['cover', ...files.map((f) => f.id)].map((id) => `<itemref idref="${id}"/>`);
W('content.opf', `<?xml version="1.0" encoding="utf-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bid" xml:lang="en"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="bid">${uuid}</dc:identifier><dc:title>${x(TITLE)}</dc:title><dc:creator>${x(AUTHOR)}</dc:creator><dc:language>en</dc:language><dc:language>ko</dc:language><dc:subject>Foreign Language Study</dc:subject><dc:description>${x(SUB)}</dc:description><meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta><meta name="cover" content="cover-img"/></metadata><manifest>${items.join('')}</manifest><spine>${spine.join('')}</spine></package>`);
fs.writeFileSync(path.join(src, 'META-INF/container.xml'), `<?xml version="1.0"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
fs.writeFileSync(path.join(src, 'mimetype'), 'application/epub+zip');
const epub = path.join(outDir, `${bookId}.epub`);
execFileSync('zip', ['-X0', epub, 'mimetype'], { cwd: src, stdio: 'ignore' });
execFileSync('zip', ['-Xr9', epub, 'META-INF', 'OEBPS'], { cwd: src, stdio: 'ignore' });
const mb = (fs.statSync(epub).size / 1048576).toFixed(2);

/* ── 복붙표(KDP 칸) ── */
const L = {
  keywords: ['Korean short stories for beginners', 'bilingual Korean English stories', 'learn Korean reading practice', 'Korean graded reader A1 A2', 'Korean parallel text', 'Korean vocabulary in context', 'easy Korean stories'],
  desc: [`<p><b>Read real Korean from your very first weeks.</b> ${stories.length} short original stories, told line by line: the Korean sentence first, the English meaning right below it.</p>`,
    `<p>Each story comes with:</p><ul><li>a short word list for the words in that story</li><li>three comprehension questions, with the answer shown right below each one</li><li>a level mark: A1 (very short sentences) or A2 (longer sentences, reasons and time order)</li></ul>`,
    `<p>Topics are everyday life: the market, school, work, food, weather, travel, family, friends, hobbies, the doctor and small mistakes. A combined word list at the end collects every word from the book.</p>`,
    `<p>Everything works inside the Kindle app or device. No audio files, websites or printing needed. Written by a Korean teacher. All stories are original and the characters are fictional.</p>`].join('\n'),
};
const f = (label, val, mode = 'text') => `<div class="f"><div class="fh"><b>${hesc(label)}</b><button type="button" data-c>복사</button></div>${mode === 'code' ? `<pre>${hesc(val)}</pre>` : `<div class="v">${hesc(val)}</div>`}</div>`;
const html = copyPage({ title: 'KDP 칸 채우기 — Kindle 오리지널', width: 860, h2: [34, 14], css: 'pre{white-space:pre-wrap;word-break:break-word;margin:4px 0 0;font:13px/1.5 ui-monospace,monospace}.v{margin-top:4px}', body:
  `<h1>KDP 칸 채우기 — ${hesc(TITLE)}</h1><p class="n">Kindle 전용 새 책(ISBN 없음 · ASIN) · KDP Select 등록 권장 · 가격 4.99달러 근처 제안(2.99~9.99달러가 70% 구간, 최종은 운영자 결정) · 책 원고는 ePub, 표지는 JPEG 한 장.</p>` +
  [f('Book title', TITLE), f('Subtitle', SUB), f('Author', AUTHOR), f('Description (HTML — 「HTML」 편집 모드로 붙여 넣기)', L.desc, 'code'), ...L.keywords.map((k, i) => f(`Keyword ${i + 1}`, k)), f('Language', 'English'), f('Categories (화면에서 고르기)', 'Foreign Language Study > Korean (1순위) · Reference / Education 계열 하나 더'), f('List price (USD)', '4.99'), f('AI 사용 표시', '사실대로 답하기(이 책의 글은 AI 도움으로 쓰고 사람이 검토했다면 「AI 생성 글 있음」)')].join('\n') });
fs.writeFileSync(path.join(outDir, 'kdp-copy.html'), html);
console.log(`${bookId}: ePub ${files.length + 1}개 장 · ${stories.length}편 · ${mb}MB → ${epub}`);
