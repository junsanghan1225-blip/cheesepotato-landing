#!/usr/bin/env node
/* 학습지 틀 — docs/worksheets/<id>.json → /<id>-worksheet/index.html (인쇄용 A4 학습지 + 정답지) + /worksheets/index.html(목록).
   운영자 2026-10-14 「이런 학습지 많이 만들자」 — 수사 학습지(손으로 쓴 쪽)와 같은 모양을 자료 한 파일로 찍어 낸다.
   자료를 늘리는 일은 안티 그래비티 · Claude 가 JSON 만 쓰면 된다(지시 docs/antigravity/antigravity-worksheets-task.md, 검사 check-sheets).
   JSON 모양은 docs/worksheets/_schema.md. 인쇄 단추는 numbers-worksheet.js(id nwPrint · nwAns)를 같이 쓴다.
   node tools/build-sheets.mjs          만들기
   node tools/build-sheets.mjs --check  모양 검사 + 쪽이 자료와 같은지(CI) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'docs/worksheets');
const CHECK = process.argv.includes('--check');
const esc = (x) => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const blank = '<span class="nw-line"></span>';
/* 문제 줄 — 글 속에 「___」가 있으면 그 자리에 빈칸(끝의 「→」는 뺀다), 없으면 끝에 빈칸 */
const qLine = (q) => q.includes('___') ? esc(q.replace(/\s*→\s*$/, '')).replace('___', blank) : `${esc(q)} ${blank}`;
const bad = [];

export function loadSheets() {
  return fs.readdirSync(SRC).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()
    .map((f) => ({ file: f, ...JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')) }));
}
const sheets = loadSheets();

/* ── 모양 검사 ── */
const ids = new Set();
for (const w of sheets) {
  const at = `${w.file}`;
  if (!/^[a-z0-9-]+$/.test(w.id || '')) bad.push(`${at}: id 는 영문 소문자 · 숫자 · -`);
  if (w.file !== `${w.id}.json`) bad.push(`${at}: 파일 이름은 <id>.json`);
  if (ids.has(w.id)) bad.push(`${at}: id 가 겹친다`); ids.add(w.id);
  for (const k of ['title', 'sub']) if (!w[k]?.en || !w[k]?.ko) bad.push(`${at}: ${k}.en · ${k}.ko`);
  if (!w.desc?.en || w.desc.en.length > 300) bad.push(`${at}: desc.en(300자 이내)`);
  if (!['A1', 'A2', 'B1', 'B2', 'all'].includes(w.level)) bad.push(`${at}: level 은 A1 A2 B1 B2 all`);
  if (!Array.isArray(w.sections) || !w.sections.length) bad.push(`${at}: sections`);
  let practice = 0;
  for (const [i, s] of (w.sections || []).entries()) {
    const sa = `${at} sections[${i}]`;
    if (!s.title?.en) bad.push(`${sa}: title.en`);
    if (s.type === 'table') {
      if (!Array.isArray(s.cols) || !s.cols.length) bad.push(`${sa}: cols`);
      if (!Array.isArray(s.rows) || !s.rows.length || s.rows.some((r) => !Array.isArray(r) || r.length !== s.cols.length)) bad.push(`${sa}: 줄마다 칸 수가 cols 와 같아야 한다`);
    } else if (s.type === 'practice') {
      practice++;
      if (!Array.isArray(s.items) || s.items.length < 3 || s.items.length > 12) bad.push(`${sa}: items 3~12개`);
      if ((s.items || []).some((x) => !x.q || !x.a)) bad.push(`${sa}: 문제마다 q · a`);
    } else if (s.type !== 'text') bad.push(`${sa}: type 은 table · text · practice`);
    if (s.type === 'text' && !s.text) bad.push(`${sa}: text`);
  }
  if (!practice) bad.push(`${at}: 연습(practice)이 하나는 있어야 한다`);
  if (!Array.isArray(w.howto) || !w.howto.length) bad.push(`${at}: howto`);
  if (!w.koSummary) bad.push(`${at}: koSummary`);
}

/* ── 쪽 만들기 ── */
const CSS = fs.readFileSync(path.join(ROOT, 'numbers-worksheet/index.html'), 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];
const head = (title, desc, url, extra = '') => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} | CheesePotato</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="https://everykoreans.com${url}">
<!-- 생성물 — 손으로 고치지 말 것. docs/worksheets/*.json 을 고치고 node tools/build-sheets.mjs -->
<script src="/gtm.js" async></script>
<script src="/analytics.js" defer></script>
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="https://everykoreans.com${url}">
<meta property="og:image" content="https://everykoreans.com/logo-256.png">
<link rel="stylesheet" href="/vendor/pretendard.css">
<link rel="stylesheet" href="/page.css">
<script src="/numbers-worksheet.js" defer></script>
<style>${CSS}</style>
${extra}</head>
<body>
<header class="hd"><div class="hd-in">
  <a href="/"><img src="/logo.png" alt=""><span>치즈감자 CheesePotato</span></a>
</div></header>
<main>
`;
const foot = `</main>
</body>
</html>
`;
const table = (s) => `    <div class="nw-tw"><table class="nw-t${s.cols.length === 4 ? ' nw-c' : ''}"><tr>${s.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>` +
  s.rows.map((r) => `<tr>${r.map((c, i) => `<td class="${i === 0 ? 'k' : 'l'}">${esc(c)}</td>`).join('')}</tr>`).join('') + '</table></div>\n';
function sheetPage(w) {
  let n = 0, pn = 0;
  const work = w.sections.map((s) => {
    n++;
    const h = `    <div class="nw-h3">${n} · ${esc(s.title.en)}${s.title.ko ? ` · ${esc(s.title.ko)}` : ''}</div>\n`;
    if (s.type === 'table') return h + table(s) + (s.note ? `    <p class="nw-sub">${esc(s.note)}</p>\n` : '');
    if (s.type === 'text') return h + `    <p class="nw-sub">${esc(s.text)}</p>\n`;
    pn++;
    return h + (s.hint ? `    <p class="nw-sub">${esc(s.hint)}</p>\n` : '') + `    <ol class="nw-q" style="padding:0">${s.items.map((x, i) => `<li>${i + 1}. ${qLine(x.q)}</li>`).join('')}</ol>\n`;
  }).join('\n');
  let pi = 0;
  const ans = w.sections.filter((s) => s.type === 'practice').map((s) =>
    `    <div class="nw-h3">${esc(s.title.en)}</div>\n    <ol class="nw-q" style="padding:0">${s.items.map((x, i) => `<li>${i + 1}. ${esc(x.a)}</li>`).join('')}</ol>\n`).join('');
  const url = `/${w.id}-worksheet/`;
  const ld = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'LearningResource', name: w.title.en, url: `https://everykoreans.com${url}`, inLanguage: ['en', 'ko'], isAccessibleForFree: true, educationalLevel: w.level, learningResourceType: 'Worksheet' })}</script>\n`;
  return head(`${w.title.en} (Free PDF)`, w.desc.en, url, ld) + `<h1>${esc(w.title.en)}</h1>
<p>${esc(w.title.ko)} · ${esc(w.sub.en)} · print, save as PDF or Word · Free</p>
<div class="box">
  <div class="nw-bar no-print"><div class="nw-row"><span>Worksheet</span><button class="nw-b dark" id="nwPrint" type="button">Print / PDF</button><button class="nw-b" id="nwDocx" type="button">Word</button></div><div class="nw-row"><span>Answer key</span><button class="nw-b dark" id="nwAns" type="button">Print / PDF</button><button class="nw-b" id="nwAnsDocx" type="button">Word</button></div></div>
  <div class="nw-paper nw-work">
    <div class="nw-top"><span>Name: ______________________</span><span>Date: ____________</span></div>
    <div class="nw-h">${esc(w.title.en)} · ${esc(w.title.ko)}</div>
    <p class="nw-sub">${esc(w.sub.en)}. ${esc(w.sub.ko)}</p>
${work}
    <div class="nw-foot">Free Korean lessons · everykoreans.com · 치즈감자 CheesePotato</div>
  </div>
  <div class="nw-paper nw-ans">
    <div class="nw-top"><span>Answer key · 정답</span><span>${esc(w.title.en)}</span></div>
${ans}    <div class="nw-foot">Free Korean lessons · everykoreans.com · 치즈감자 CheesePotato</div>
  </div>
</div>
<div class="no-print">
<h2>How to use it</h2>
<ul>
${w.howto.map((x) => `  <li>${esc(x)}</li>`).join('\n')}
</ul>
<h2>한국어</h2>
<p>${esc(w.koSummary)}</p>
<div class="next">
  <h3>Keep learning Korean</h3>
  <p>Free lessons, practice and games — start where you are.</p>
  <div class="btns">
    <a class="btn main" href="/?utm_source=tool&amp;utm_medium=worksheet_${w.id}#learn/path/basic">Start learning — free →</a>
    <a class="btn sub" href="/worksheets/">More worksheets</a>
  </div>
</div>
<p class="ft">Made by a Korean teacher · <a href="/about.html">About</a> · <a href="/worksheets/">All worksheets</a> · <a href="/numbers-worksheet/">Numbers worksheet</a> · <a href="/for-teachers.html">For teachers</a></p>
</div>
` + foot;
}
const hand = [
  ['/numbers-worksheet/', 'Korean numbers & counters', '수사 · 세는 말', 'all'],
  ['/hangul-worksheet/', 'Hangul name tracing', '내 이름 따라 쓰기', 'A1'],
  ['/worksheet/', 'Grammar worksheets', '문법 학습지', 'all'],
];
function hubPage() {
  const rows = [...hand.map(([u, en, ko, lv]) => [u, en, ko, lv, '']), ...sheets.map((w) => [`/${w.id}-worksheet/`, w.title.en, w.title.ko, w.level, w.desc.en])];
  return head('Free Korean Worksheets (Printable PDF)', 'Free printable Korean worksheets: numbers and counters, dates, hangul, grammar and more — each with an answer key. Print or save as PDF.', '/worksheets/') +
`<h1>Free Korean worksheets</h1>
<p>학습지 모음 · print, save as PDF or Word · every worksheet has an answer key</p>
<div class="box">
${rows.map(([u, en, ko, lv, d]) => `  <p><a class="btn sub" href="${u}"><b>${esc(en)}</b> · ${esc(ko)}${lv ? ` · ${esc(lv)}` : ''}</a>${d ? `<br><small>${esc(d)}</small>` : ''}</p>`).join('\n')}
</div>
<div class="next">
  <h3>Want a worksheet we do not have yet?</h3>
  <p>Teachers: tell us the topic — new worksheets are added every week.</p>
  <div class="btns"><a class="btn sub" href="/for-teachers.html">For teachers — free class tools</a></div>
</div>
<p class="ft">Made by a Korean teacher · <a href="/about.html">About</a> · <a href="/for-teachers.html">For teachers</a></p>
` + foot;
}

if (bad.length) { console.error('학습지 자료에 문제가 있다:\n  - ' + bad.join('\n  - ')); process.exit(1); }
const out = new Map(sheets.map((w) => [`${w.id}-worksheet/index.html`, sheetPage(w)]));
out.set('worksheets/index.html', hubPage());
/* 자료실(#library)이 한 번에 펼쳐 보여 주는 목록 — 손으로 쓴 쪽 + 만든 쪽 */
out.set('worksheets/list.json', JSON.stringify([...hand.map(([u, en, ko, lv]) => ({ u, en, ko, lv })), ...sheets.map((w) => ({ u: `/${w.id}-worksheet/`, en: w.title.en, ko: w.title.ko, lv: w.level }))]) + '\n');
let diff = 0;
for (const [f, body] of out) {
  const p = path.join(ROOT, f);
  if (CHECK) { if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== body) { console.error(`${f} 가 자료와 다르다 — node tools/build-sheets.mjs`); diff++; } continue; }
  fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body);
}
if (CHECK) { if (diff) process.exit(1); console.log(`학습지 검사 — 통과 (${sheets.length}편 + 목록)`); }
else console.log(`학습지 — ${sheets.length}편 + 목록 → <id>-worksheet/ · worksheets/`);
