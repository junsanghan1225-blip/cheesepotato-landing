#!/usr/bin/env node
/* 학습지 틀 — docs/worksheets/<id>.json → /<id>-worksheet/index.html (인쇄용 A4 학습지 + 정답지) + /worksheets/index.html(목록)
   + /shop/index.html(상점 — docs/shop.json).
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
  const wsFile = `<meta name="ws-file" content="${esc('Cheesepotato_' + (w.level === 'all' ? 'All' : w.level) + '_' + w.title.en.replace(/[^0-9A-Za-z]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40))}">\n`;
  return head(`${w.title.en} (Free PDF)`, w.desc.en, url, ld + wsFile) + `<h1>${esc(w.title.en)}</h1>
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

/* ── 상점(/shop/) — 1인 출판사 온라인 서점(운영자 2026-10-17 「상점 페이지부터」 · 「1인 출판 온라인 서점 페이지」) ──
   자료는 docs/shop.json, 책 계획은 docs/plans/books.md. 학습지 쪽은 무료 그대로 두고, 파는 것은 인쇄용 PDF(학습지 + 정답지 · 묶음)와 앞으로 낼 책.
   결제는 이미 쓰는 Polar 의 「한 번 사는 상품 + 파일 다운로드」— 링크(buy.polar.sh)가 없는 상품은 「준비 중」으로만 보인다.
   파는 파일(PDF)은 공개 저장소에 두지 않는다(누구나 받아 갈 수 있으니) — Polar 상품에 올린다.
   책 표지는 그림 파일 없이 CSS 로 그린다(제목 · 시리즈 색 · 급) — 진짜 표지가 나오면 cover 칸에 그림 경로를 넣는다. */
const SHOP = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop.json'), 'utf8'));
const POLAR = /^https:\/\/buy\.polar\.sh\/[A-Za-z0-9_-]+$/;
for (const p of SHOP.packs) {
  if (!/^[a-z0-9-]+$/.test(p.id) || !p.title?.en || !p.title?.ko || !/^\d+\.\d{2}$/.test(p.price)) bad.push(`docs/shop.json ${p.id}: id · title · price(0.00)`);
  if (p.polar && !POLAR.test(p.polar)) bad.push(`docs/shop.json ${p.id}: polar 는 https://buy.polar.sh/… 링크`);
}
for (const [id, u] of Object.entries(SHOP.singles || {})) {
  if (!sheets.some((w) => w.id === id)) bad.push(`docs/shop.json singles: 없는 학습지 ${id}`);
  if (u && !POLAR.test(u)) bad.push(`docs/shop.json singles.${id}: polar 는 https://buy.polar.sh/… 링크`);
}
for (const k of SHOP.books) {
  if (!/^[a-z0-9-]+$/.test(k.id) || !k.title?.en || !k.title?.ko || !k.about?.en || !/^#[0-9A-Fa-f]{6}$/.test(k.color || '')) bad.push(`docs/shop.json 책 ${k.id}: id · title · about · color(#RRGGBB)`);
  if (k.polar && !POLAR.test(k.polar)) bad.push(`docs/shop.json 책 ${k.id}: polar 는 https://buy.polar.sh/… 링크`);
}
const pub = SHOP.publisher;
const packSheets = (p) => sheets.filter((w) => p.level === 'all' || w.level === p.level);
/* 책 목차 — 워크북은 그 급 학습지 제목이 곧 단원(자료에서 바로), 나머지는 shop.json 의 toc */
const bookToc = (k) => k.sheets ? sheets.filter((w) => w.level === k.sheets).map((w, i) => ({ en: `Unit ${i + 1}. ${w.title.en}`, ko: w.title.ko, u: `/${w.id}-worksheet/` })) : (k.toc || []);
const buy = (url, price, label) => url
  ? `<a class="btn main" href="${esc(url)}" rel="noopener">${esc(label)} · $${esc(price)}</a>`
  : `<span class="btn sub shop-soon" aria-disabled="true">Coming soon · 준비 중</span>`;
const cover = (k, big) => k.coverImg ? `<div class="bk-cover bk-img${big ? ' big' : ''}"><img src="${esc(k.coverImg)}" alt="${esc(k.title.ko)} — ${esc(k.title.en)}" width="700" height="995"${big ? '' : ' loading="lazy"'}></div>` : `<div class="bk-cover${big ? ' big' : ''}" style="--c:${esc(k.color)}"><span class="bk-ser">${esc(k.series === 'topik' ? 'TOPIK SERIES' : 'WORKBOOK SERIES')}</span><b>${esc(k.title.ko)}</b><i>${esc(k.title.en)}</i><span class="bk-lv">${esc(k.level)}</span><span class="bk-pub">${esc(pub.en)}</span></div>`;
const STATUS = { planned: ['Coming soon', '출간 예정'], on: ['Available', '판매 중'] };
const SHOP_CSS = `<style>
.shop-hero{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:6px 0 14px;border-bottom:2px solid var(--ink);margin-bottom:8px}
.shop-hero b{font-size:15px;letter-spacing:.5px}.shop-hero small{color:var(--ink-3)}
.shop-nav{display:flex;gap:14px;flex-wrap:wrap;font-size:14px;font-weight:700;margin:10px 0 4px}.shop-nav a{color:var(--ink);text-decoration:none}
.bk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:22px 18px;margin:18px 0}
.bk-item{text-decoration:none;color:var(--ink)}.bk-item:hover .bk-cover{transform:translateY(-3px)}
.bk-item h3{font-size:15px;margin:10px 0 2px;line-height:1.35}.bk-item p{margin:0;font-size:13px;color:var(--ink-3)}
.bk-badge{display:inline-block;font-size:11px;font-weight:800;padding:2px 8px;border-radius:99px;background:var(--tint);margin-top:6px}
.bk-cover{position:relative;aspect-ratio:182/257;border-radius:3px 8px 8px 3px;background:var(--c);color:#fff;padding:16px 14px 14px 20px;display:flex;flex-direction:column;box-shadow:inset 6px 0 0 rgba(0,0,0,.18),0 10px 22px rgba(0,0,0,.18);transition:transform .2s;overflow:hidden}
.bk-cover:after{content:'';position:absolute;right:-30%;bottom:-18%;width:90%;aspect-ratio:1;border-radius:50%;background:rgba(255,255,255,.12)}
.bk-cover.bk-img{padding:0;background:none;overflow:hidden}.bk-cover.bk-img:after{display:none}.bk-cover.bk-img img{display:block;width:100%;height:100%;object-fit:cover}
.pg-head{background:var(--tint);border-radius:16px;padding:20px 22px;margin:22px 0}.pg-head h2{border:0;padding:0;margin:0 0 6px;font-size:22px;line-height:1.35;word-break:keep-all}.pg-head p{margin:6px 0 0}
.pg-feat{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:14px 0}.pg-feat div{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px}.pg-feat b{display:block;font-size:15px;margin:6px 0 4px}.pg-feat span{font-size:13px;color:var(--ink-3);line-height:1.55}.pg-feat i{font-style:normal;font-size:24px}
.pg-toc{border:1px solid var(--line);border-radius:14px;overflow:hidden;margin:12px 0}.pg-toc h3{margin:0;padding:10px 16px;background:var(--tint);font-size:14px}.pg-toc div{display:flex;justify-content:space-between;gap:10px;padding:8px 16px;border-top:1px solid var(--line);font-size:14px}.pg-toc em{font-style:normal;color:var(--ink-3);white-space:nowrap}
.pg-pv{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0}.pg-pv a{display:block;text-decoration:none;color:var(--ink);font-size:12px}.pg-pv img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.08)}.pg-pv span{display:block;margin-top:4px}
.lb{display:none;position:fixed;inset:0;z-index:50;background:rgba(10,12,18,.88);align-items:center;justify-content:center;padding:16px}.lb:target{display:flex}.lb img{max-width:100%;max-height:calc(100vh - 80px);border-radius:6px;background:#fff}.lb .lbn{position:absolute;bottom:14px;left:0;right:0;display:flex;justify-content:center;gap:10px}.lb .lbn a{color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:99px;padding:8px 16px;text-decoration:none;font-size:14px}.lb .lbx{position:absolute;top:10px;right:14px;color:#fff;font-size:30px;text-decoration:none;line-height:1}
.pg-author{display:flex;gap:14px;align-items:flex-start;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;margin:12px 0}.pg-author b{font-size:17px}.pg-author p{margin:4px 0 0}
.pg-faq details{border-top:1px solid var(--line);padding:10px 0}.pg-faq summary{cursor:pointer;font-weight:700}.pg-faq p{margin:8px 0 0}
@media (max-width:700px){.pg-feat{grid-template-columns:1fr}.pg-pv{grid-template-columns:repeat(2,1fr)}.pg-head h2{font-size:19px}}
.bk-ser{font-size:9px;font-weight:800;letter-spacing:1.5px;opacity:.85}
.bk-cover b{font-size:19px;line-height:1.25;margin-top:12px;word-break:keep-all}
.bk-cover i{font-style:normal;font-size:11px;opacity:.9;margin-top:6px;line-height:1.35}
.bk-lv{margin-top:auto;align-self:flex-start;font-size:11px;font-weight:800;background:#fff;color:var(--c);padding:3px 9px;border-radius:99px;position:relative;z-index:1}
.bk-pub{font-size:9px;opacity:.85;margin-top:8px;position:relative;z-index:1}
.bk-cover.big{width:240px;flex:none}.bk-cover.big b{font-size:28px}.bk-cover.big i{font-size:14px}.bk-cover.big .bk-ser,.bk-cover.big .bk-pub{font-size:11px}.bk-cover.big .bk-lv{font-size:13px}
.bk-detail{display:flex;gap:28px;align-items:flex-start;margin:18px 0}
.bk-info{flex:1;min-width:0}.bk-info h1{margin:4px 0 2px}.bk-ko{color:var(--ink-3);margin:0 0 10px}
.bk-spec{width:100%;min-width:0 !important;table-layout:fixed;border-collapse:collapse;font-size:14px;margin:14px 0}.bk-spec td{overflow-wrap:anywhere}.bk-spec th{text-align:left;color:var(--ink-3);font-weight:600;width:96px;padding:6px 0}.bk-spec td{padding:6px 0}
.bk-toc{counter-reset:none;padding-left:0;list-style:none}.bk-toc li{padding:9px 0;border-top:1px solid var(--line)}.bk-toc small{display:block;color:var(--ink-3)}
.shop-card{display:flex;gap:20px;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:20px;margin:18px 0}
.shop-pk{flex:0 0 110px;height:150px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;background:#C4551C}
.shop-pk.lv-A2{background:#2F6FDB}.shop-pk.lv-all{background:#1F1F1F}.shop-pk b{font-size:40px;line-height:1}.shop-pk small{opacity:.85;margin-top:6px}
.shop-body{flex:1;min-width:0}.shop-body h3{margin:0}.shop-price{font-size:22px;font-weight:800;margin:10px 0}.shop-price small{font-size:13px;font-weight:500;color:var(--ink-3)}
.shop-soon{opacity:.6;cursor:default}
.shop-body details{margin-top:12px}.shop-body ul{margin:8px 0 0;padding-left:18px;columns:2;font-size:14px}
.shop-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line)}.shop-row:first-child{border-top:0}
.shop-lv{font-size:12px;font-weight:800;color:var(--ink-3);width:28px}.shop-t{flex:1;min-width:0}.shop-t small{display:block;color:var(--ink-3)}
.shop-row .btn{min-height:40px;padding:8px 14px;font-size:14px;white-space:nowrap}
@media (max-width:600px){.bk-info{width:100%}.bk-info h1{font-size:26px;overflow-wrap:anywhere}.shop-hero .btn{display:none}.bk-spec th{width:84px}.bk-grid{grid-template-columns:repeat(2,1fr);gap:18px 14px}.bk-detail{flex-direction:column}.bk-cover.big{width:200px;align-self:center}.shop-card{flex-direction:column}.shop-pk{flex:none;width:100%;height:96px;flex-direction:row;gap:10px}.shop-body ul{columns:1}}
</style>
`;
const shopHead = () => `<div class="shop-hero"><span><b>${esc(pub.en.toUpperCase())}</b><br><small>${esc(pub.ko)} · Korean books &amp; worksheets by a Korean teacher</small></span><a class="btn sub" href="/worksheets/">Free worksheets</a></div>
<nav class="shop-nav"><a href="/shop/#books">Books · 책</a><a href="/shop/#packs">Worksheet packs · 묶음</a><a href="/shop/#singles">Single sheets · 낱장</a></nav>`;
const shopFoot = `<div class="next">
  <h3>How buying works</h3>
  <p>Payment is handled by Polar, our payment partner. Digital files download right after paying and arrive by email. Printed books will be sold through bookstores when published. See <a href="/refund.html">refunds</a> · <a href="/terms.html">terms</a>.</p>
</div>
<p class="ft">${esc(pub.en)} · ${esc(pub.ko)} · <a href="/about.html">About</a> · <a href="/worksheets/">Free worksheets</a></p>
`;
function shopPage() {
  const books = SHOP.books.map((k) => `<a class="bk-item" href="/shop/${k.id}/">${cover(k)}<h3>${esc(k.title.en)}</h3><p>${esc(k.title.ko)}</p><span class="bk-badge">${esc(STATUS[k.status]?.[0] || k.status)} · ${esc(STATUS[k.status]?.[1] || '')}</span></a>`).join('\n');
  const packs = SHOP.packs.map((p) => {
    const ws = packSheets(p);
    return `<div class="shop-card"><div class="shop-pk lv-${esc(p.level)}"><b>${ws.length}</b><small>${esc(p.level === 'all' ? 'A1–A2' : p.level)} · PDF</small></div>
  <div class="shop-body"><h3>${esc(p.title.en)}</h3><p class="bk-ko">${esc(p.title.ko)}</p><p>${esc(p.sub.en)}</p>
    <p class="shop-price">$${esc(p.price)} <small>· ${ws.length} sheets + answer keys · PDF download</small></p>
    ${buy(p.polar, p.price, 'Buy the pack')}
    <details><summary>What is inside (${ws.length})</summary><ul>${ws.map((w) => `<li><a href="/${w.id}-worksheet/">${esc(w.title.en)}</a> · ${esc(w.title.ko)}</li>`).join('')}</ul></details></div></div>`;
  }).join('\n');
  const singles = sheets.map((w) => `  <div class="shop-row"><span class="shop-lv">${esc(w.level)}</span><span class="shop-t"><a href="/${w.id}-worksheet/">${esc(w.title.en)}</a><small>${esc(w.title.ko)}</small></span>${buy(SHOP.singles?.[w.id], SHOP.singlePrice, 'PDF')}</div>`).join('\n');
  return head(`${pub.en} — Korean Books & Worksheet Shop`, 'Korean workbooks, TOPIK practice books and printable worksheet PDFs with answer keys — made by a Korean teacher.', '/shop/', SHOP_CSS) +
`${shopHead()}
<h1 id="books">Books</h1>
<p>책 · original Korean workbooks and TOPIK practice books. TOPIK questions are newly written in the official format — not past papers.</p>
<div class="bk-grid">
${books}
</div>
<h2 id="packs">Worksheet packs · 학습지 묶음</h2>
<p>Every worksheet stays free to use on the site — the packs are clean print-ready PDFs you keep.</p>
${packs}
<h2 id="singles">Single worksheets · 낱장</h2>
<p>$${esc(SHOP.singlePrice)} each · 학습지 한 장(정답지 포함) PDF</p>
<div class="box">
${singles}
</div>
${shopFoot}` + foot;
}
/* Yes24 식 책 쪽(운영자 2026-10-18 「판매페이지 · 미리보기 · 책소개」) — shop.json 책에 page 가 있으면 소개 · 특징 · 미리보기 · 저자 · 책 정보 · 자주 묻는 질문을 더 보여 준다. 미리보기 그림은 assets/books/<id>/pv-N.jpg, 크게 보기는 CSS :target(스크립트 없음). */
const bi3 = (o) => `${esc(o.en)}<br><small class="bk-ko">${esc(o.ko)}</small>`;
function richBody(k) {
  const g = k.page; const n = g.previews.length;
  const pv = g.previews.map((c, i) => `<a href="#pv${i + 1}"><img src="/assets/books/${esc(k.id)}/pv-${i + 1}.jpg" alt="${esc(c[0])} — ${esc(c[1])}" loading="lazy" width="749" height="1058"><span>${esc(c[0])} · ${esc(c[1])}</span></a>`).join('');
  const lb = g.previews.map((c, i) => `<div class="lb" id="pv${i + 1}"><a class="lbx" href="#preview" aria-label="Close">×</a><img src="/assets/books/${esc(k.id)}/pv-${i + 1}.jpg" alt="${esc(c[0])}" width="749" height="1058"><div class="lbn"><a href="#pv${i === 0 ? n : i}">‹ Prev</a><a href="#pv${i + 2 > n ? 1 : i + 2}">Next ›</a></div></div>`).join('');
  return `<div class="pg-head"><h2>${esc(g.headline.ko)}</h2><p><b>${esc(g.headline.en)}</b></p><p>${esc(g.lead.en)}<br><span class="bk-ko">${esc(g.lead.ko)}</span></p></div>
<h2>Features · 이 책의 특징</h2>
<div class="pg-feat">${g.features.map((f) => `<div><i>${f.ic}</i><b>${esc(f.t.en)} <span style="font-weight:500;color:var(--ink-3)">· ${esc(f.t.ko)}</span></b><span>${esc(f.d.en)}<br>${esc(f.d.ko)}</span></div>`).join('')}</div>
@@SPLIT@@<h2 id="preview">Preview · 미리보기</h2>
<p class="bk-ko">${esc(g.previewNote.en)} · ${esc(g.previewNote.ko)}</p>
<div class="pg-pv">${pv}</div>${lb}
<h2>Author · 지은이</h2>
<div class="pg-author"><div><b>${esc(g.author.name.ko)} · ${esc(g.author.name.en)}</b><p>${esc(g.author.bio.en)}</p><p class="bk-ko">${esc(g.author.bio.ko)}</p></div></div>
<h2>Book details · 책 정보</h2>
<table class="bk-spec">${g.specs.map(([a, b]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</table>
<h2>FAQ · 자주 묻는 질문</h2>
<div class="pg-faq">${g.faq.map(([q, a]) => `<details><summary>${esc(q.en)} · ${esc(q.ko)}</summary><p>${esc(a.en)}</p><p class="bk-ko">${esc(a.ko)}</p></details>`).join('')}</div>`;
}
const tocRich = (k) => k.page.contents.map((c) => `<div class="pg-toc"><h3>${esc(c.part.en)} · ${esc(c.part.ko)}</h3>${c.items.map(([t, p]) => `<div><span>${esc(t)}</span><em>${esc(p)}</em></div>`).join('')}</div>`).join('') + '<p class="bk-ko">쪽 번호는 책에 인쇄된 번호입니다 · Page numbers are those printed in the book.</p>';
function bookPage(k) {
  const toc = bookToc(k);
  const st = STATUS[k.status] || [k.status, ''];
  return head(`${k.title.en} — ${pub.en}`, `${k.sub.en} ${st[0]}.`, `/shop/${k.id}/`, SHOP_CSS) +
`${shopHead()}
<div class="bk-detail">
${cover(k, true)}
<div class="bk-info">
  <span class="bk-badge">${esc(st[0])} · ${esc(st[1])}</span>
  <h1>${esc(k.title.en)}</h1>
  <p class="bk-ko">${esc(k.title.ko)}</p>
  <p><b>${esc(k.sub.en)}</b><br>${esc(k.sub.ko)}</p>
  <table class="bk-spec">
    <tr><th>Level · 급</th><td>${esc(k.level)}</td></tr>
    <tr><th>Size · 판형</th><td>${esc(k.trim || '')}</td></tr>
    <tr><th>Pages · 쪽수</th><td>${esc(k.pages || '')}</td></tr>
    <tr><th>Publisher</th><td>${esc(pub.en)} · ${esc(pub.ko)}</td></tr>
    ${k.page ? '<tr><th>Format · 형태</th><td>PDF · digital edition · 디지털판</td></tr>' : `<tr><th>ISBN</th><td>${esc(k.isbn || 'To be assigned · 출간 때 붙음')}</td></tr>`}
  </table>
  ${buy(k.polar, k.price || '', 'Buy')}
</div>
</div>
${k.page ? richBody(k).split('@@SPLIT@@')[0] : `<h2>About this book · 책 소개</h2>
<p>${esc(k.about.en)}</p>
<p class="bk-ko">${esc(k.about.ko)}</p>`}
<h2>Who it is for · 이런 분께</h2>
<ul>${k.for.en.map((x, i) => `<li>${esc(x)} <small class="bk-ko">· ${esc(k.for.ko[i] || '')}</small></li>`).join('')}</ul>
<h2>Contents · 목차</h2>
${k.page?.contents ? tocRich(k) : ''}<ol class="bk-toc"${k.page?.contents ? ' hidden' : ''}>${toc.map((t) => `<li>${t.u ? `<a href="${t.u}">${esc(t.en)}</a>` : esc(t.en)}<small>${esc(t.ko)}</small></li>`).join('')}</ol>
${k.sheets ? '<p>Each unit is based on a free worksheet on this site — open any unit above to try it now.</p>' : ''}
${k.page ? richBody(k).split('@@SPLIT@@')[1] : ''}
<p><a class="btn sub" href="/shop/">← All books</a></p>
${shopFoot}` + foot;
}

if (bad.length) { console.error('학습지 자료에 문제가 있다:\n  - ' + bad.join('\n  - ')); process.exit(1); }
const out = new Map(sheets.map((w) => [`${w.id}-worksheet/index.html`, sheetPage(w)]));
out.set('worksheets/index.html', hubPage());
out.set('shop/index.html', shopPage());
for (const k of SHOP.books) out.set(`shop/${k.id}/index.html`, bookPage(k));
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
