#!/usr/bin/env node
/* 책 틀 — 우리 학습지 자료로 인쇄용 책 PDF 를 찍는다(운영자 2026-10-17 「정말 책처럼 — 표지 디자인부터 속지 · 목차까지」, 계획 docs/plans/books.md).
   node tools/build-book.mjs <책 id> [--out 폴더] [--review]   docs/books/<id>.json + docs/worksheets/*.json → <out>/<id>/interior.pdf · cover-spread.pdf · front-cover.png
   - interior.pdf : 속표지 · 판권면 · 머리말 · 쓰는 법 · 목차 · 단원 · 정답 · 찾아보기 · 메모(총 쪽수가 짝수가 되게). B5 182×257mm, 안쪽 여백이 넓은 좌우 쪽.
   - cover-spread.pdf : 뒤표지 + 책등 + 앞표지 한 장(재단 여유 3mm). 책등 너비는 쪽수 × 종이 두께로 계산(인쇄소가 정해 주는 값으로 다시 계산할 것).
   - --theme classic : 「수학의 정석」풍 판(운영자 2026-10-17 「수학의 정석처럼 깔끔하게」) — 남색 한 가지 · 핵심 정리 / 참고 / 연습 이름표 · 단원은 쪽 맨 위에서 바로 시작(빈 표지 쪽 없음). 결과는 <out>/<id>-classic/.
   - --review : 검수본(interior-review.pdf) — 쪽 위에 「REVIEW COPY」, 칸마다 빨간 출처 표시(학습지 id · §번호 — 「고칠 곳」을 말하면 바로 원본을 찾는다) + 맨 끝 검수 체크표. 운영자 2026-10-17 「검수는 내가 다 한다」.
   - 목차의 쪽 번호는 블록(속표지 · 각 단원 …)을 따로 찍어 쪽수를 세어 더한 값이다(PDF 안의 /Type /Page 수).
   만든 PDF 는 파는 파일이라 저장소에 두지 않는다(out 기본값 books-out/ 은 .gitignore). 문장은 전부 우리 학습지(창작) — 기출 아님.
   브라우저는 smoke.mjs 처럼 PLAYWRIGHT_PATH · CHROMIUM_PATH 로 바꿀 수 있다. */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const args = process.argv.slice(2);
const bookId = args.find((a) => !a.startsWith('--'));
const REVIEW = args.includes('--review');
const outDir = path.resolve(ROOT, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'books-out');
if (!bookId) { console.error('사용: node tools/build-book.mjs <책 id> [--out 폴더]   (책 틀: docs/books/<id>.json)'); process.exit(1); }

const B = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${bookId}.json`), 'utf8'));
const THEME = args.includes('--theme') ? args[args.indexOf('--theme') + 1] : (B.theme || 'brand');
const CLASSIC = THEME === 'classic';
const sheet = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, `docs/worksheets/${id}.json`), 'utf8'));
const esc = (x) => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cssStr = (x) => '"' + String(x).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
const HAN = /[가-힣]/;
const T = B.trim, W = T.w, H = T.h;
const ACC = CLASSIC ? '#1F3A68' : B.color, TINT = CLASSIC ? '#EEF2F8' : B.tint;

/* ── 단원 모으기 ── */
const parts = B.parts.map((p, pi) => ({ ...p, no: pi + 1, sheets: p.units.map((id) => sheet(id)) }));
const units = []; // 책 전체 차례(1부터)
for (const p of parts) for (const s of p.sheets) units.push({ ...s, no: units.length + 1, part: p });
const unitCss = (u) => `u${u.no}`;

/* ── 쪽 틀(CSS) ── */
const CSS = `
@font-face{font-family:'Pretendard Variable';font-weight:45 920;src:local('Pretendard Variable')}
@page{size:${W}mm ${H}mm;margin:22mm 17mm 24mm 22mm}
@page:left{margin:22mm 22mm 24mm 17mm;
  @top-left{content:${cssStr(B.title.en.toUpperCase())};font:600 6.8pt 'Pretendard Variable';letter-spacing:.12em;color:#9a9288;vertical-align:bottom;padding-bottom:5mm}
  @bottom-left{content:counter(page);font:700 8.5pt 'Pretendard Variable';color:${ACC};vertical-align:top;padding-top:6mm}}
@page:right{
  @bottom-right{content:counter(page);font:700 8.5pt 'Pretendard Variable';color:${ACC};vertical-align:top;padding-top:6mm}}
@page plain{@top-left{content:none}@top-right{content:none}@bottom-left{content:none}@bottom-right{content:none}}
@page plain:left{margin:22mm 22mm 24mm 17mm}
@page plain:right{margin:22mm 17mm 24mm 22mm}
@page part{margin:0;@top-left{content:none}@top-right{content:none}@bottom-left{content:none}@bottom-right{content:none}}
${units.map((u) => `@page ${unitCss(u)}:right{@top-right{content:${cssStr(`UNIT ${String(u.no).padStart(2, '0')}  ·  ${u.title.en.toUpperCase()}`)};font:600 6.8pt 'Pretendard Variable';letter-spacing:.12em;color:#9a9288;vertical-align:bottom;padding-bottom:5mm}}
@page ${unitCss(u)}:left{@top-left{content:${cssStr(B.title.en.toUpperCase())}}}`).join('\n')}
@page unitopen{margin:0;@top-left{content:none}@top-right{content:none}@bottom-left{content:none}@bottom-right{content:none}}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font:400 9.6pt/1.55 'Pretendard Variable',sans-serif;color:#1d1a17;word-break:keep-all}
.blk{break-before:page}.blk:first-child{break-before:auto}
h1,h2,h3,h4{font-weight:800;letter-spacing:-.01em}
.plain{page:plain}
/* 속표지 · 판권 */
.tp{height:${H - 46}mm;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:6mm}
.tp .ser{font-size:8pt;font-weight:800;letter-spacing:.3em;color:${ACC}}
.tp h1{font-size:30pt;line-height:1.2}.tp h2{font-size:14pt;font-weight:600;color:#6d655c}
.tp .rule{width:18mm;height:.8mm;background:${ACC}}.tp .by{font-size:11pt;font-weight:700}.tp .pub{font-size:8.5pt;color:#8a8278;letter-spacing:.1em}
.cr{font-size:8pt;line-height:1.7;color:#4a443d;display:flex;flex-direction:column;justify-content:flex-end;height:${H - 46}mm}
.cr h4{font-size:9.5pt;margin-bottom:2mm;color:#1d1a17}.cr p{margin-bottom:2.2mm}.cr dl{display:grid;grid-template-columns:24mm 1fr;gap:.6mm 3mm;margin:3mm 0 4mm}.cr dt{color:#8a8278}.cr .ph{color:#b0a89c}
/* 머리말 · 쓰는 법 */
.pf h2{font-size:20pt;margin-bottom:1mm}.pf .k{font-size:11pt;color:#6d655c;margin-bottom:7mm}
.pf p{margin-bottom:3.4mm;font-size:10pt;line-height:1.7}.pf p.en{color:#1d1a17}.pf p.ko{color:#4a443d;font-size:9.6pt;margin-bottom:5mm}
.pf .au{margin-top:8mm;padding-top:4mm;border-top:.3mm solid #d8d0c4;font-size:8.8pt;color:#4a443d}
.how ol{margin-top:6mm;list-style:none;counter-reset:h}.how li{counter-increment:h;display:grid;grid-template-columns:9mm 1fr;gap:3mm;padding:3.4mm 0;border-top:.25mm solid #e6dfd4}
.how li:before{content:counter(h);width:7mm;height:7mm;border-radius:50%;background:${ACC};color:#fff;font-weight:800;font-size:9pt;display:flex;align-items:center;justify-content:center}
.how li b{display:block;font-weight:600}.how li span{display:block;color:#6d655c;font-size:8.8pt}
/* 목차 */
.toc h2{font-size:20pt;margin-bottom:4mm}.toc .pt{margin:3.6mm 0 1mm;font-size:9pt;font-weight:800;color:${ACC};letter-spacing:.06em;display:flex;gap:2mm}
.toc .ln{display:flex;align-items:baseline;gap:2mm;padding:.45mm 0;font-size:9.3pt;line-height:1.35}.toc .ln .n{width:7mm;font-weight:800;color:#9a9288}.toc .ln .t{flex:0 1 auto}.toc .ln .t small{color:#8a8278;margin-left:2mm}
.toc .ln .d{flex:1;border-bottom:.35mm dotted #b9b0a3;transform:translateY(-1mm)}.toc .ln .p{font-weight:700;font-variant-numeric:tabular-nums}
.toc .ex{margin-top:2mm}
/* 부 표지 */
.pd{page:part;height:${H}mm;width:${W}mm;background:${ACC};color:#fff;position:relative;overflow:hidden;padding:60mm 22mm 0}
.pd:before{content:'';position:absolute;right:-40mm;bottom:-40mm;width:150mm;height:150mm;border-radius:50%;background:rgba(255,255,255,.12)}
.pd:after{content:'';position:absolute;right:30mm;bottom:50mm;width:40mm;height:40mm;border-radius:50%;background:rgba(255,255,255,.14)}
.pd .no{font-size:10pt;font-weight:800;letter-spacing:.3em;opacity:.85}.pd .big{font-size:150pt;font-weight:900;line-height:.9;margin:6mm 0 4mm;opacity:.95;letter-spacing:-.04em}
.pd h2{font-size:28pt;line-height:1.25}.pd h3{font-size:14pt;font-weight:500;opacity:.92;margin-top:3mm}
.pd .list{position:relative;z-index:1;margin-top:14mm;font-size:9.4pt;line-height:1.9;opacity:.95}
/* 단원 첫 쪽 */
.uo{page:unitopen;height:${H}mm;width:${W}mm;position:relative;overflow:hidden;background:#fff}
.uo .band{position:absolute;left:0;top:0;width:100%;height:96mm;background:${ACC}}
.uo .band:after{content:'';position:absolute;right:-18mm;top:-18mm;width:70mm;height:70mm;border-radius:50%;background:rgba(255,255,255,.14)}
.uo .no{position:absolute;left:22mm;top:30mm;color:#fff;font-size:66pt;font-weight:900;letter-spacing:-.03em;line-height:1}
.uo .pn{position:absolute;left:22mm;top:15mm;color:#fff;font-size:7.8pt;font-weight:800;letter-spacing:.22em;opacity:.9}
.uo .ttl{position:absolute;left:22mm;right:20mm;top:114mm}
.uo h2{font-size:26pt;line-height:1.25}.uo h3{font-size:13.5pt;font-weight:600;color:#6d655c;margin-top:2mm;line-height:1.4}
.uo .sub{margin-top:6mm;font-size:10pt;color:#4a443d;line-height:1.65}.uo .sub small{display:block;margin-top:1.5mm;color:#8a8278;font-size:9pt}
.uo .in{position:absolute;left:22mm;right:20mm;bottom:30mm;border-top:.4mm solid #1d1a17;padding-top:4mm}
.uo .in b{font-size:7.8pt;letter-spacing:.2em;color:${ACC}}.uo .in ol{margin-top:2mm;list-style:none;font-size:9.4pt;line-height:1.85}.uo .in li small{color:#8a8278;margin-left:2mm}
/* 본문 */
.sec{margin:0 0 6mm}.sec>h3{font-size:12.5pt;display:flex;align-items:baseline;gap:2.5mm;margin-bottom:2.6mm;break-after:avoid}
.sec>h3 small{font-size:9.4pt;font-weight:500;color:#8a8278}
.sec>h3:before{content:'';width:2mm;height:2mm;background:${ACC};border-radius:50%;transform:translateY(-.2mm);flex:none}
.hint{font-size:8.6pt;color:#6d655c;font-style:italic;margin:-1mm 0 2.4mm}
table{width:100%;border-collapse:collapse;font-size:9pt;break-inside:auto}tr{break-inside:avoid}
th{background:${ACC};color:#fff;font-weight:700;font-size:8pt;letter-spacing:.04em;text-align:left;padding:2mm 3mm}
td{padding:2mm 3mm;border-bottom:.25mm solid #e6dfd4;vertical-align:top;line-height:1.4}tbody tr:nth-child(even) td,tr:nth-child(even) td{background:#faf6f0}
td:first-child{font-weight:800;font-size:10.4pt;color:#1d1a17}td.tip{color:#8a8278;font-style:italic;font-size:8.4pt}
.note{margin-top:2.6mm;padding:2.4mm 3.6mm;border-left:1.1mm solid ${ACC};background:${TINT};font-size:8.7pt;line-height:1.55;color:#3d372f}
.note b{color:${ACC}}
.pr{list-style:none;counter-reset:q}.pr li{counter-increment:q;display:flex;align-items:flex-end;gap:2.6mm;padding:1.2mm 0;min-height:8.6mm;break-inside:avoid;font-size:9.8pt}
.pr li:before{content:counter(q);flex:none;width:5.6mm;height:5.6mm;border-radius:50%;border:.3mm solid ${ACC};color:${ACC};font-size:7.8pt;font-weight:800;display:flex;align-items:center;justify-content:center;margin-bottom:1mm}
.pr .q{flex:0 1 auto;font-weight:600;line-height:1.35;padding-bottom:.6mm}.pr .ln{flex:1;min-width:26mm;border-bottom:.3mm solid #9a9288;height:5mm}
.pr .bl{display:inline-block;width:24mm;border-bottom:.3mm solid #9a9288;margin:0 1mm;transform:translateY(.6mm)}
/* 정답 · 찾아보기 · 메모 */
.ak h2,.ix h2{font-size:20pt;margin-bottom:1mm}.ak .k,.ix .k{font-size:10.5pt;color:#6d655c;margin-bottom:6mm}
.ak .u{break-inside:avoid;margin-bottom:4.5mm}.ak .u h4{font-size:9pt;display:flex;gap:2mm;align-items:baseline;padding-bottom:1mm;border-bottom:.35mm solid ${ACC};margin-bottom:1.6mm}.ak .u h4 span{color:${ACC}}.ak .u h4 small{font-weight:500;color:#8a8278}
.ak .a{font-size:7.9pt;line-height:1.5;color:#2c2722}.ak .a b{color:${ACC};margin-right:1mm}.ak .set{margin-bottom:1mm}
.ix .cols{column-count:3;column-gap:6mm;font-size:7.8pt;line-height:1.4}.ix .ini{break-after:avoid;margin:2.4mm 0 1mm;font-size:10pt;font-weight:900;color:${ACC};break-inside:avoid}
.ix .e{break-inside:avoid;padding:.35mm 0;border-bottom:.15mm solid #eee7dc}.ix .e b{font-weight:800}.ix .e span{color:#6d655c}.ix .e i{font-style:normal;float:right;color:${ACC};font-weight:700;font-size:7pt}
.src{break-after:avoid;display:block;font:600 6.4pt 'Pretendard Variable';color:#c0392b;letter-spacing:.04em;margin-bottom:1mm}
.rv h2{font-size:18pt;margin-bottom:1mm}.rv .k{font-size:9.5pt;color:#6d655c;margin-bottom:5mm}.rv table td{padding:1.6mm 2mm;font-weight:500;font-size:8.2pt}.rv th{font-size:7pt;padding:1.6mm 2mm}.rv td.c{width:12mm;text-align:center;color:#bbb}
.memo h2{font-size:14pt;margin-bottom:6mm;color:${ACC}}.memo .rule{height:8mm;border-bottom:.25mm solid #d8d0c4}
`;

/* ── 블록 만들기 ── */
const pair = (o, cls = '') => `<p class="en${cls}">${esc(o.en)}</p>`;
const LAB = { table: '핵심 정리', text: '참고', practice: '연습' };
let secNo = '';
const secLabel = (s) => `<h3>${CLASSIC ? `<em class="lab">${LAB[s.type]} ${secNo}</em>` : ''}<span>${esc(s.title.en)}</span>${s.title.ko ? `<small>${esc(s.title.ko)}</small>` : ''}</h3>`;
const qLine = (q) => q.includes('___')
  ? `<span class="q">${esc(q.replace(/\s*→\s*$/, '')).replace(/___/g, '<span class="bl"></span>')}</span><span class="ln" style="visibility:hidden;min-width:0"></span>`
  : `<span class="q">${esc(q)}</span><span class="ln"></span>`;

function titlePage() {
  return `<div class="blk plain"><div class="tp"><span class="ser">${esc(B.series.en)}</span><h1>${esc(B.title.ko)}</h1><h2>${esc(B.title.en)}</h2><div class="rule"></div><span class="by">${esc(B.author.ko)} · ${esc(B.author.en)}</span><span class="pub">${esc(B.publisher.en.toUpperCase())}</span></div></div>`;
}
function copyrightPage() {
  return `<div class="blk plain"><div class="cr">
<h4>${esc(B.title.ko)} · ${esc(B.title.en)}</h4>
<p>${esc(B.sub.en)}<br>${esc(B.sub.ko)}</p>
<dl><dt>Author · 지은이</dt><dd>${esc(B.author.ko)} (${esc(B.author.en)})</dd>
<dt>Publisher · 펴낸곳</dt><dd>${esc(B.publisher.ko)} · ${esc(B.publisher.en)}</dd>
<dt>Publisher no.</dt><dd class="ph">출판사 신고번호 — 신고 후 기재</dd>
<dt>ISBN</dt><dd class="ph">발급 후 기재 · to be assigned</dd>
<dt>Edition · 판</dt><dd>${esc(B.edition)}</dd>
<dt>Printed · 발행일</dt><dd class="ph">○○○○년 ○월 ○일</dd>
<dt>Web</dt><dd>${esc(B.web)}</dd></dl>
<p>All sentences, tables and exercises in this book were written for it. They are original practice material.<br>이 책의 낱말 · 문장 · 연습은 모두 이 책을 위해 새로 쓴 것입니다.</p>
<p>© ${esc(B.publisher.en)}. All rights reserved. No part of this book may be reproduced without written permission, except for brief quotations in reviews or for classroom use by the purchaser.<br>저작권법에 따라 보호받는 책으로, 무단 복제와 전재를 금합니다.</p>
<p>Typeset in Pretendard (SIL Open Font License 1.1).</p>
</div></div>`;
}
function prefacePage() {
  return `<div class="blk plain"><div class="pf"><h2>Preface</h2><div class="k">머리말</div>
${B.preface.en.map((t, i) => `<p class="en">${esc(t)}</p><p class="ko">${esc(B.preface.ko[i])}</p>`).join('')}
<div class="au"><b>${esc(B.author.en)}</b> — ${esc(B.authorAbout.en)}<br>${esc(B.authorAbout.ko)}</div></div></div>`;
}
function howPage() {
  return `<div class="blk plain"><div class="pf how"><h2>How to use this book</h2><div class="k">이 책 쓰는 법</div><ol>${B.howto.en.map((t, i) => `<li><div><b>${esc(t)}</b><span>${esc(B.howto.ko[i])}</span></div></li>`).join('')}</ol></div></div>`;
}
function tocPage(starts) {
  let h = `<div class="blk plain"><div class="toc"><h2>Contents · 목차</h2>`;
  const ln = (n, en, ko, p) => `<div class="ln"><span class="n">${n}</span><span class="t">${esc(en)}<small>${esc(ko)}</small></span><span class="d"></span><span class="p">${p ?? '··'}</span></div>`;
  h += ln('', 'Preface · How to use this book', '머리말 · 쓰는 법', starts?.preface);
  for (const p of parts) {
    h += `<div class="pt">PART ${p.no} · ${esc(p.title.en.toUpperCase())} <span style="color:#9a9288;font-weight:500">${esc(p.title.ko)}</span></div>`;
    for (const s of p.sheets) { const u = units.find((x) => x.id === s.id); h += ln(String(u.no).padStart(2, '0'), s.title.en, s.title.ko, starts?.unit[u.no]); }
  }
  h += `<div class="pt ex">BACK MATTER · <span style="color:#9a9288;font-weight:500">부록</span></div>`;
  h += ln('', 'Answer Key', '정답', starts?.answers) + ln('', 'Index', '찾아보기', starts?.index) + ln('', 'Notes', '메모', starts?.memo);
  return h + '</div></div>';
}
function partPage(p) {
  return `<div class="blk pd"><div class="no">PART ${p.no}</div><div class="big">${String(p.no).padStart(2, '0')}</div><h2>${esc(p.title.ko)}</h2><h3>${esc(p.title.en)}</h3>
<div class="list">${p.sheets.map((s) => { const u = units.find((x) => x.id === s.id); return `Unit ${String(u.no).padStart(2, '0')} &nbsp; ${esc(s.title.en)}`; }).join('<br>')}</div></div>`;
}
function unitBlock(u) {
  const secs = u.sections;
  const open = `<div class="blk uo ${unitCss(u)}" style="page:unitopen"><div class="band"></div><div class="pn">PART ${u.part.no} · ${esc(u.part.title.en.toUpperCase())}</div><div class="no">UNIT ${String(u.no).padStart(2, '0')}</div>
<div class="ttl"><h2>${esc(u.title.ko)}</h2><h3>${esc(u.title.en)}</h3><p class="sub">${esc(u.sub.en)}<small>${esc(u.sub.ko)}</small></p></div>
<div class="in"><b>IN THIS UNIT · 이 단원에서</b><ol>${secs.map((s) => `<li>${esc(s.title.en)}${s.title.ko ? `<small>${esc(s.title.ko)}</small>` : ''}</li>`).join('')}</ol></div></div>`;
  if (CLASSIC) {
    const head = `<div class="uh"><div class="un">UNIT ${String(u.no).padStart(2, '0')} &nbsp;·&nbsp; PART ${u.part.no} ${esc(u.part.title.en.toUpperCase())}</div><div class="ut"><h2>${esc(u.title.ko)}</h2><h3>${esc(u.title.en)}</h3></div></div><p class="us">${esc(u.sub.en)}<small>${esc(u.sub.ko)}</small></p>`;
    u._head = head;
  }
  const sr = (i) => (REVIEW ? `<span class="src">${esc(u.id)} · §${i + 1} · ${esc(secs[i].type)}</span>` : '');
  const body = secs.map((s, si) => {
    secNo = `${u.no}-${si + 1}`;
    if (s.type === 'table') {
      const tipCols = s.cols.map((c) => /reading|tip|sound|pronunc/i.test(c));
      return `<div class="sec"${s.rows.length <= 8 ? ' style="break-inside:avoid"' : ''}>${sr(si)}${secLabel(s)}<table><thead><tr>${s.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${s.rows.map((r) => `<tr>${r.map((c, i) => `<td${tipCols[i] ? ' class="tip"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>${s.note ? `<div class="note">${esc(s.note)}</div>` : ''}</div>`;
    }
    if (s.type === 'text') return `<div class="sec">${sr(si)}${secLabel(s)}<div class="note">${esc(s.text)}</div></div>`;
    return `<div class="sec">${sr(si)}${secLabel(s)}${s.hint ? `<div class="hint">${esc(s.hint)}</div>` : ''}<ol class="pr">${s.items.map((x) => `<li>${qLine(x.q)}</li>`).join('')}</ol></div>`;
  }).join('\n');
  if (CLASSIC) return `<div class="blk ${unitCss(u)}" style="page:${unitCss(u)}">${u._head}${body}</div>`;
  return open + `<div class="blk ${unitCss(u)}" style="page:${unitCss(u)}">${body}</div>`;
}
function answersBlock() {
  let h = `<div class="blk plain ak"><h2>Answer Key</h2><div class="k">정답</div>`;
  for (const u of units) {
    h += `<div class="u"><h4><span>UNIT ${String(u.no).padStart(2, '0')}</span>${esc(u.title.en)}<small>${esc(u.title.ko)}</small></h4>`;
    for (const s of u.sections.filter((x) => x.type === 'practice')) {
      h += `<div class="set a"><b>${esc(s.title.en.split(/\s[—–-]\s/)[0])}</b> ${s.items.map((x, i) => `${i + 1}) ${esc(x.a)}`).join(' &nbsp;·&nbsp; ')}</div>`;
    }
    h += '</div>';
  }
  return h + '</div>';
}
/* 찾아보기 — 표의 한국어 낱말(첫 낱말 칸)과 뜻을 모아 가나다 순으로. 「읽기 팁」 칸은 뺀다. */
const INI = ['ㄱ', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅂ', 'ㅅ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const ini = (w) => INI[Math.floor((w.charCodeAt(0) - 0xac00) / 588)];
function indexEntries() {
  const map = new Map();
  for (const u of units) for (const s of u.sections.filter((x) => x.type === 'table')) {
    const skip = s.cols.map((c) => /reading|tip|sound|pronunc|example|sentence|usage|situation|collocat|note|expression/i.test(c));
    for (const r of s.rows) r.forEach((cell, i) => {
      const w = String(cell).trim();
      if (skip[i] || !HAN.test(w) || w.length > 12 || /[()·=+→.?!,]/.test(w) || !HAN.test(w[0]) || w.split(/\s+/).length > 2 || /(?:요|니다|까)$/.test(w) && w.includes(' ')) return;
      const nonHan = (c) => c != null && !HAN.test(c) && c.length <= 38 && c !== '—';
      const gloss = nonHan(r[i - 1]) ? r[i - 1] : nonHan(r[i + 1]) ? r[i + 1] : '';
      const e = map.get(w) || { w, gloss: '', units: new Set() };
      if (!e.gloss && gloss) e.gloss = gloss;
      e.units.add(u.no); map.set(w, e);
    });
  }
  return [...map.values()].sort((a, b) => a.w.localeCompare(b.w, 'ko'));
}
function indexBlock(entries) {
  let h = `<div class="blk plain ix"><h2>Index</h2><div class="k">찾아보기 — Korean words in this book and the unit they appear in</div><div class="cols">`;
  let cur = '';
  for (const e of entries) {
    const c = ini(e.w);
    if (c !== cur) { cur = c; h += `<div class="ini">${c}</div>`; }
    h += `<div class="e"><i>${[...e.units].sort((a, b) => a - b).join(', ')}</i><b>${esc(e.w)}</b>${e.gloss ? ` <span>${esc(e.gloss)}</span>` : ''}</div>`;
  }
  return h + '</div></div>';
}
const reviewSheet = () => `<div class="blk plain rv"><h2>Review checklist · 검수 체크표</h2><div class="k">한 단원씩 훑고 ○ / ✕ 를 적으세요. 고칠 곳은 빨간 출처(예: greetings-self-introduction · §2)와 번호로 알려 주시면 됩니다.</div><table><thead><tr><th>Unit</th><th>사실 Facts</th><th>오타 Typos</th><th>번역 English</th><th>난이도 Level</th><th>정답 Answers</th><th>메모 Notes</th></tr></thead><tbody>${units.map((u) => `<tr><td>${String(u.no).padStart(2, '0')} ${esc(u.title.en)}</td><td class="c">☐</td><td class="c">☐</td><td class="c">☐</td><td class="c">☐</td><td class="c">☐</td><td></td></tr>`).join('')}</tbody></table></div>`;
const memoBlock = (n) => Array.from({ length: n }, () => `<div class="blk plain memo"><h2>Notes · 메모</h2>${'<div class="rule"></div>'.repeat(22)}</div>`).join('');

/* ── 쪽 찍기 ── */
const reviewTop = REVIEW ? `@page:left{@top-center{content:"REVIEW COPY · 검수본";font:800 6.8pt 'Pretendard Variable';letter-spacing:.2em;color:#c0392b;vertical-align:bottom;padding-bottom:5mm;white-space:nowrap}}@page:right{@top-center{content:"REVIEW COPY · 검수본";font:800 6.8pt 'Pretendard Variable';letter-spacing:.2em;color:#c0392b;vertical-align:bottom;padding-bottom:5mm}}` : '';
const CLASSIC_CSS = `
body{font-size:9.4pt;line-height:1.6;color:#111}
/* 정석풍 — 남색 한 가지 · 면 채우기 없이 선과 글자만(운영자 「더 깔끔하게 수학의 정석처럼」) */
.sec{margin:0 0 7mm}
.sec>h3{display:grid;grid-template-columns:auto 1fr;column-gap:3.2mm;align-items:baseline;border-bottom:.35mm solid ${ACC};padding-bottom:1.4mm;margin-bottom:3mm;font-size:11.5pt}
.sec>h3:before{display:none}
.lab{grid-row:1/3;align-self:start;font-style:normal;border:.3mm solid ${ACC};color:${ACC};font-size:7.4pt;font-weight:800;letter-spacing:.04em;padding:.7mm 2.6mm;border-radius:0;line-height:1.5;white-space:nowrap}
.sec>h3 span{grid-column:2}.sec>h3 small{grid-column:2;margin:0;font-size:8.4pt;color:#5a6780;font-weight:500}.sec>h3:not(:has(.lab)) span{grid-column:1/3}
table{border-top:.45mm solid ${ACC};border-bottom:.45mm solid ${ACC}}
th{background:transparent;color:${ACC};border:0;border-bottom:.25mm solid ${ACC};font-size:7.8pt;font-weight:800;letter-spacing:.02em;padding:1.8mm 3mm}
tbody tr:nth-child(even) td,tr:nth-child(even) td{background:transparent}td{border-bottom:.15mm solid #cfd6e2;padding:1.7mm 3mm}tr:last-child td{border-bottom:0}td:first-child{color:${ACC}}td.tip{color:#6b7a92}
.note{border:0;border-left:.9mm solid ${ACC};background:transparent;color:#111;padding:1.2mm 0 1.2mm 3.6mm;margin-top:3mm}.note b{color:${ACC}}
.pr li{border-bottom:0;min-height:8.4mm}.pr li:before{content:counter(q) '.';border:0;border-radius:0;background:transparent;color:${ACC};width:6mm;height:auto;font-size:9pt;font-weight:800;justify-content:flex-start;margin:0}
.pr .ln{border-bottom:.2mm solid #8e9ab0}.pr .bl{border-bottom:.2mm solid #8e9ab0}
.uh{display:block;padding-bottom:3mm;border-bottom:.35mm solid ${ACC};margin-bottom:1.2mm;position:relative}
.uh:after{content:'';position:absolute;left:0;right:0;bottom:-1.6mm;border-bottom:1.1mm solid ${ACC}}
.uh .un{display:block;width:auto;height:auto;background:transparent;color:${ACC};font-size:8pt;font-weight:800;letter-spacing:.3em;margin-bottom:2mm}
.uh .ut small{display:none}.uh .ut h2{font-size:23pt;line-height:1.2;font-weight:800;color:#111}.uh .ut h3{font-size:11pt;font-weight:500;color:#5a6780;margin-top:1mm}
.us{margin:6mm 0 7mm;font-size:9.2pt;color:#2a3550;padding:0;border:0}.us small{display:block;margin-top:.8mm;color:#6b7a92;font-size:8.4pt}
.pd{background:#fff !important;color:#111 !important;padding:70mm 24mm 0 !important}.pd:before,.pd:after{display:none !important}
.pd .no{color:${ACC};opacity:1}.pd .big{color:${ACC};opacity:1;font-size:96pt;font-weight:800;margin:4mm 0 5mm}.pd h2{color:#111;font-size:26pt;padding-bottom:4mm;border-bottom:1.1mm solid ${ACC}}.pd h3{color:#5a6780;opacity:1}.pd .list{color:#2a3550;opacity:1;margin-top:8mm}
.toc .pt,.ak .u h4 span,.ix .ini,.memo h2{color:${ACC}}.how li:before{background:${ACC}}
.ak .u h4{border-bottom-color:${ACC}}.tp .rule{background:${ACC}}
`;
const shell = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="/vendor/pretendard.css"><style>${CSS}${CLASSIC ? CLASSIC_CSS : ''}${reviewTop}</style></head><body>${body}</body></html>`;
let pages = new Map();
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (u === '/__book.html') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(pages.get('cur')); }
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  const mt = { '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.js': 'text/javascript' }[path.extname(f)] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': mt }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}`;
const { chromium } = await import(PW);
const browser = await chromium.launch({ executablePath: CHROMIUM });
const pg = await browser.newPage();
async function pdf(html, opts = {}) {
  pages.set('cur', shell(html));
  await pg.goto(`${BASE}/__book.html`, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  return pg.pdf({ preferCSSPageSize: true, printBackground: true, ...opts });
}
const countPages = (buf) => (buf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) || []).length;

const entries = indexEntries();
const blocks = [
  ['title', titlePage()], ['copyright', copyrightPage()], ['preface', prefacePage()], ['how', howPage()], ['toc', tocPage(null)],
  ...parts.flatMap((p) => [[`part${p.no}`, partPage(p)], ...p.sheets.map((s) => { const u = units.find((x) => x.id === s.id); return [`unit${u.no}`, unitBlock(u)]; })]),
  ['answers', answersBlock()], ['index', indexBlock(entries)],
];
const counts = {};
for (const [k, html] of blocks) counts[k] = countPages(await pdf(html));
let total = Object.values(counts).reduce((a, b) => a + b, 0);
const memoPages = (total + 1) % 2 === 0 ? 1 : 2;   // 메모 쪽은 1~2쪽 — 총 쪽수는 짝수(인쇄 · 제본)
blocks.push(['memo', memoBlock(memoPages)]); counts.memo = memoPages; total += memoPages;
/* 시작 쪽 = 앞 블록 쪽수의 합 + 1 */
let at = 1; const start = {};
for (const [k] of blocks) { start[k] = at; at += counts[k]; }
const starts = { preface: start.preface, unit: Object.fromEntries(units.map((u) => [u.no, start[`unit${u.no}`] + 1])), answers: start.answers, index: start.index, memo: start.memo };
// 단원 첫 쪽(표지 쪽)은 목차에 그 단원의 첫 쪽으로 적는다 — unit 블록은 첫 쪽이 단원 표지이므로 start 그대로가 맞다
for (const u of units) starts.unit[u.no] = start[`unit${u.no}`];
const final = blocks.map(([k, html]) => (k === 'toc' ? tocPage(starts) : html)).join('\n') + (REVIEW ? reviewSheet() : '');

const dir = path.join(outDir, bookId + (THEME !== (B.theme || 'brand') ? `-${THEME}` : ''));
fs.mkdirSync(dir, { recursive: true });
const interior = await pdf(final);
const realTotal = countPages(interior) - (REVIEW ? countPages(await pdf(reviewSheet())) : 0);
fs.writeFileSync(path.join(dir, REVIEW ? 'interior-review.pdf' : 'interior.pdf'), interior);

/* ── 표지(뒤 + 책등 + 앞) ── */
const spine = Math.round((Math.ceil(realTotal / 2) * T.paperMm + 0.6) * 10) / 10;
const CW = 2 * W + spine + 2 * T.bleed, CH = H + 2 * T.bleed;
const coverCss = `@page{size:${CW}mm ${CH}mm;margin:0}*{box-sizing:border-box;margin:0;padding:0}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{width:${CW}mm;height:${CH}mm;font-family:'Pretendard Variable',sans-serif;position:relative;overflow:hidden;word-break:keep-all}
.back{position:absolute;left:0;top:0;width:${W + T.bleed}mm;height:${CH}mm;background:${TINT};padding:${T.bleed + 22}mm 18mm ${T.bleed + 18}mm ${T.bleed + 18}mm;color:#1d1a17}
.spine{position:absolute;left:${W + T.bleed}mm;top:0;width:${spine}mm;height:${CH}mm;background:${ACC};color:#fff;display:flex;align-items:center;justify-content:space-between;flex-direction:column;padding:${T.bleed + 10}mm 0}
.spine .t{writing-mode:vertical-rl;font-weight:800;font-size:${Math.min(13, Math.max(8, spine * 1.15))}pt;letter-spacing:.04em;white-space:nowrap}.spine .t small{font-weight:500;font-size:.62em;opacity:.9;margin-top:4mm}
.spine .p{writing-mode:vertical-rl;font-size:6.5pt;letter-spacing:.25em;font-weight:700;opacity:.9}
.front{position:absolute;left:${W + T.bleed + spine}mm;top:0;width:${W + T.bleed}mm;height:${CH}mm;background:${ACC};color:#fff;overflow:hidden;padding:${T.bleed + 20}mm ${T.bleed + 18}mm ${T.bleed + 16}mm 20mm}
.front .g{position:absolute;right:-8mm;top:34mm;width:130mm;font-size:92pt;font-weight:900;line-height:.98;letter-spacing:.04em;color:rgba(255,255,255,.13);word-break:break-all;text-align:right}
.front .c1{position:absolute;right:-46mm;bottom:-46mm;width:150mm;height:150mm;border-radius:50%;background:rgba(255,255,255,.14)}
.front .c2{position:absolute;right:34mm;bottom:58mm;width:30mm;height:30mm;border-radius:50%;background:rgba(255,255,255,.18)}
.front .z{position:relative;z-index:1;height:100%;display:flex;flex-direction:column}
.front .ser{font-size:8.6pt;font-weight:800;letter-spacing:.3em;opacity:.92}
.front h1{font-size:44pt;line-height:1.14;margin-top:20mm;font-weight:900;letter-spacing:-.02em}
.front h2{font-size:15pt;line-height:1.35;margin-top:7mm;font-weight:600;opacity:.95;max-width:110mm}
.front .rule{width:20mm;height:1mm;background:#fff;margin-top:9mm;opacity:.9}
.front .sub{margin-top:5mm;font-size:10pt;line-height:1.6;opacity:.92;max-width:105mm}
.front .lv{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between}
.front .badge{background:#fff;color:${ACC};font-weight:900;font-size:13pt;padding:2.4mm 6mm;border-radius:99px;letter-spacing:.04em}
.front .by{text-align:right;font-size:9.6pt;line-height:1.5}.front .by b{display:block;font-size:12pt}.front .by span{opacity:.88;letter-spacing:.1em;font-size:7.6pt}
.back .ser{font-size:7.6pt;font-weight:800;letter-spacing:.28em;color:${ACC}}
.back h3{font-size:19pt;line-height:1.3;margin-top:8mm;font-weight:900}.back h4{font-size:10.5pt;font-weight:600;color:#6d655c;margin-top:3mm;line-height:1.45}
.back p{margin-top:7mm;font-size:9.6pt;line-height:1.7;color:#3d372f}
.back ul{margin-top:6mm;list-style:none;font-size:9.4pt;line-height:1.55}.back li{padding:2mm 0 2mm 7mm;position:relative;border-top:.25mm solid #e6d9c8}.back li:before{content:'';position:absolute;left:0;top:3.6mm;width:3mm;height:3mm;border-radius:50%;background:${ACC}}
.back li small{display:block;color:#8a8278;font-size:8.4pt}
.back .pts{margin-top:7mm;font-size:8.8pt;line-height:1.5}.back .pts div{padding:1.4mm 0;border-top:.25mm solid #e6d9c8}.back .pts b{color:${ACC};margin-right:2mm;letter-spacing:.06em;font-size:7.6pt}.back .pts span{color:#8a8278;margin-left:2mm}
.back .for{margin-top:6mm;font-size:8.8pt;color:#6d655c;line-height:1.6}
.back .bar{position:absolute;right:${T.bleed + 18}mm;bottom:${T.bleed + 14}mm;width:62mm;height:34mm;background:#fff;border:.3mm dashed #c9bfae;display:flex;align-items:center;justify-content:center;text-align:center;font-size:7.4pt;color:#a49a8a;line-height:1.5}
.back .pr{position:absolute;left:${T.bleed + 18}mm;bottom:${T.bleed + 14}mm;font-size:8.4pt;color:#6d655c;line-height:1.6}.back .pr b{font-size:9.8pt;color:#1d1a17}
`;
const { potatoLevel, cheeseLevel } = await import(path.join(ROOT, 'levels.js'));
const classicCover = CLASSIC ? `.front{background:#1F3A68}.front .g,.front .c1,.front .c2{display:none}.front .z:before{content:'';position:absolute;left:0;right:0;top:0;height:1px}
.front .ser{color:#D9B35B;letter-spacing:.34em}.front h1{font-weight:800;margin-top:26mm;font-size:42pt;letter-spacing:-.01em}.front h2{color:#C5D1E6;font-weight:500}.front .rule{background:#D9B35B;height:.8mm;width:26mm}.front .sub{color:#C5D1E6}
.front .badge{background:transparent;color:#D9B35B;border:.6mm solid #D9B35B;border-radius:1.5mm;padding:2mm 5mm}.front .mk{position:absolute;right:${T.bleed + 18}mm;top:${T.bleed + 66}mm;display:flex;gap:2mm;opacity:.95}.front .mk i{display:block;width:26mm;height:26mm}.front .mk svg{width:100%;height:100%}
.back{background:#F4F6FA}.mk2{position:absolute;left:${T.bleed + 18}mm;bottom:${T.bleed + 38}mm;display:flex;gap:2mm}.mk2 i{display:block;width:16mm;height:16mm}.mk2 svg{width:100%;height:100%}` : '';
const coverHtml = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/vendor/pretendard.css"><style>${coverCss}${classicCover}</style></head><body>
<div class="back"><div class="ser">${esc(B.series.en)} · ${esc(B.level)}</div>
<h3>${esc(B.sub.ko)}</h3><h4>${esc(B.sub.en)}</h4>
<p>${esc(B.preface.ko[0])}</p>
<ul><li>${units.length} units · ${units.length}개 단원<small>Hangul to everyday conversation · 한글부터 생활 표현까지</small></li><li>4 practice sets per unit · 단원마다 연습 4묶음<small>Write in the book · 책에 바로 쓰기</small></li><li>Answer key &amp; index · 정답과 찾아보기<small>Check yourself, look up any word · 스스로 확인하고 낱말 찾기</small></li></ul>
<div class="pts">${parts.map((p) => `<div><b>PART ${p.no}</b> ${esc(p.title.ko)} <span>${esc(p.title.en)}</span></div>`).join('')}</div>
<div class="for">For complete beginners and A1 classes · 완전 초급과 A1 수업에<br>${esc(B.web)}</div>
<div class="pr"><b>정가 ○○,○○○원</b> (예정)<br>${esc(B.publisher.ko)} · ${esc(B.publisher.en)}</div>
${CLASSIC ? `<div class="mk2"><i>${potatoLevel(3).icon}</i><i>${cheeseLevel(2).icon}</i></div>` : ''}<div class="bar">ISBN barcode<br>발급 후 이 자리에 · 40×25mm 이상</div></div>
<div class="spine"><div class="t">${esc(B.title.ko)} <small>${esc(B.title.en)}</small></div><div class="p">${esc(B.publisher.en.toUpperCase())}</div></div>
<div class="front"><div class="g">ㄱㄴㄷ ㄹㅁㅂ ㅅㅇㅈ ㅊㅋㅌ ㅍㅎ 가나 다라</div><div class="c1"></div><div class="c2"></div>
<div class="z"><div class="ser">${esc(B.series.en)}</div><h1>${esc(B.title.ko)}</h1><h2>${esc(B.title.en)}</h2><div class="rule"></div><p class="sub">${esc(B.sub.en)}</p>
<div class="lv"><span class="badge">${esc(B.level)} · BEGINNER</span><div class="by"><b>${esc(B.author.ko)} · ${esc(B.author.en)}</b><span>${esc(B.publisher.en.toUpperCase())}</span></div></div></div></div>
</body></html>`;
pages.set('cur', coverHtml);
await pg.goto(`${BASE}/__book.html`, { waitUntil: 'networkidle' });
await pg.evaluate(() => document.fonts.ready);
fs.writeFileSync(path.join(dir, 'cover-spread.pdf'), await pg.pdf({ preferCSSPageSize: true, printBackground: true }));
const front = await pg.$('.front');
await pg.setViewportSize({ width: Math.ceil(CW * 3.78), height: Math.ceil(CH * 3.78) });
await front.screenshot({ path: path.join(dir, 'front-cover.png') });
await browser.close(); server.close();

console.log(`책 ${bookId}: 속지 ${realTotal}쪽(계산 ${total}쪽) · 단원 ${units.length} · 찾아보기 ${entries.length}개 · 책등 ${spine}mm(종이 ${T.paperMm}mm/장 가정) → ${path.relative(ROOT, dir)}/`);
if (REVIEW) console.log('검수본: interior-review.pdf(맨 끝에 검수 체크표)');
if (realTotal !== total) console.warn(`⚠ 블록별 쪽수 합(${total})과 한 번에 찍은 쪽수(${realTotal})가 다르다 — 목차 쪽 번호를 확인할 것`);
