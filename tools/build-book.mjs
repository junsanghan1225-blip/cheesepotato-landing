#!/usr/bin/env node
/* 책 틀 — 우리 학습지 자료로 인쇄용 책 PDF 를 찍는다(운영자 2026-10-17 「정말 책처럼 — 표지 디자인부터 속지 · 목차까지」, 계획 docs/plans/books.md).
   node tools/build-book.mjs <책 id> [--out 폴더] [--review]   docs/books/<id>.json + docs/worksheets/*.json → <out>/<id>/interior.pdf · cover-spread.pdf · front-cover.png
   - interior.pdf : 속표지 · 판권면 · 머리말 · 쓰는 법 · 목차 · 단원 · 정답 · 찾아보기 · 메모(총 쪽수가 짝수가 되게). B5 182×257mm, 안쪽 여백이 넓은 좌우 쪽.
   - cover-spread.pdf : 뒤표지 + 책등 + 앞표지 한 장(재단 여유 3mm). 책등 너비는 쪽수 × 종이 두께로 계산(인쇄소가 정해 주는 값으로 다시 계산할 것).
   - --theme classic : 「수학의 정석」풍 판(운영자 2026-10-17 「수학의 정석처럼 깔끔하게」) — 남색 한 가지 · 핵심 정리 / 참고 / 연습 이름표 · 단원은 쪽 맨 위에서 바로 시작(빈 표지 쪽 없음). 결과는 <out>/<id>-classic/.
   - --digital : 파는 PDF 판 — 판권면의 출판사 신고번호 · ISBN · 발행일 자리표시를 빼고 「디지털판」으로 적는다. 앞표지를 첫 쪽으로 붙이는 것은 scratch 병합(pdf-lib) 단계.
   - --review : 검수본(interior-review.pdf) + 같은 내용의 글 판 review-text.md(다른 AI · 사람이 읽고 검사하기 쉽게 — 출처 · 블록 종류 · 정답 포함) — 쪽 위에 「REVIEW COPY」, 칸마다 빨간 출처 표시(학습지 id · §번호 — 「고칠 곳」을 말하면 바로 원본을 찾는다) + 맨 끝 검수 체크표. 운영자 2026-10-17 「검수는 내가 다 한다」.
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
/* --digital : 파는 PDF(전자책) — 종이책 자리표시(출판사 신고번호 · ISBN · 발행일 · 바코드)를 빼고 「디지털판」으로 적는다(운영자 2026-10-18 「책 PDF 최종」). */
const DIGITAL = args.includes('--digital');
const outDir = path.resolve(ROOT, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'books-out');
if (!bookId) { console.error('사용: node tools/build-book.mjs <책 id> [--out 폴더]   (책 틀: docs/books/<id>.json)'); process.exit(1); }

const B = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${bookId}.json`), 'utf8'));
const THEME = args.includes('--theme') ? args[args.indexOf('--theme') + 1] : (B.theme || 'brand');
const CLASSIC = THEME === 'classic';
/* 문제은행 단원 「w51:2」 = TOPIK II 쓰기 51번의 2번째 10문항(topik-writing.js). 학습지 JSON 대신 이 자리에서 단원 모양으로 만든다. */
const BANKQ = { 51: ['Practical Text Completion', '실용문 완성', 'Fill each blank with one sentence that fits the text and its style.', '각 빈칸에 지문의 문체에 맞는 한 문장을 써요'], 52: ['Explanatory Text Completion', '설명문 완성', 'Fill each blank with one sentence in the -(느)ㄴ다 style.', '각 빈칸에 -(느)ㄴ다체로 한 문장을 써요'], 53: ['Describing Data', '자료 설명하기', 'Write 200–300 characters describing the data.', '자료를 보고 200~300자로 써요'], 54: ['Argumentative Essay', '논술', 'Write 600–700 characters giving your own view.', '자신의 생각을 600~700자로 써요'] };
const TWM = B.needTW || B.parts.some((p) => p.units.some((u) => /^(w\d\d:|g\d\d-)/.test(u))) ? await import(path.join(ROOT, 'topik-writing.js')) : null;
const TW = TWM ? TWM.TW_ITEMS : [];
const bankSheet = (id) => {
  const [, q, n] = id.match(/^w(\d\d):(\d+)$/).map(Number); const L = BANKQ[q]; const chunk = TW.filter((x) => x.q === q).slice((n - 1) * 10, n * 10);
  return { id, title: { en: `Q${q} · ${L[0]} · Set ${n}`, ko: `${q}번 · ${L[1]} · ${n}세트` }, sub: { en: L[2], ko: L[3] },
    sections: chunk.map((x, i) => ({ type: 'writing', raw: x, title: { en: `${(n - 1) * 10 + i + 1}. ${x.title}`, ko: '' }, items: [{ q: x.title, a: x.blanks ? x.blanks.map((b) => `${b.mark} ${b.answers[0]}`).join(' ') : x.model }] })) };
};
/* 유형 묶음 「g51-recruit」 = B.groups 에 적은 문항 id 들(유형별로 나눈 책, 운영자 2026-10-18 「유형별로 나누고 유형마다 안내를」) */
const grpNo = {};   // 유형 묶음 안 문제 번호는 책 순서대로 이어서(51번 1~50) — 계획표 · 정답과 같은 번호
const groupSheet = (id) => {
  const g = B.groups[id]; grpNo[g.q] = grpNo[g.q] || 0;
  return { id, title: g.title, sub: g.sub, sections: g.items.map((iid, i) => { const x = TW.find((t) => t.id === iid); if (!x) throw new Error('없는 문항 ' + iid);
    return { type: 'writing', raw: x, title: { en: `${++grpNo[g.q]}. ${x.title}`, ko: '' }, items: [{ q: x.title, a: x.blanks ? x.blanks.map((b) => `${b.mark} ${b.answers[0]}`).join(' ') : x.model }] }; }) };
};
const partQ = (p) => { for (const u of p.units) { const m = /^w(\d\d):/.exec(u) || /^g(\d\d)-/.exec(u); if (m) return Number(m[1]); } return NaN; };
const sheet = (id) => B.inline?.[id] ? B.inline[id] : /^g\d\d-/.test(id) ? groupSheet(id) : /^w\d\d:\d+$/.test(id) ? bankSheet(id) : JSON.parse(fs.readFileSync(path.join(ROOT, `docs/worksheets/${id}.json`), 'utf8'));
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
  @top-left{content:${cssStr(B.title.en.toUpperCase())};white-space:nowrap;font:600 6.8pt 'Pretendard Variable';letter-spacing:.12em;color:#9a9288;vertical-align:bottom;padding-bottom:5mm}
  @bottom-left{content:counter(page);font:700 8.5pt 'Pretendard Variable';color:${ACC};vertical-align:top;padding-top:6mm}}
@page:right{
  @bottom-right{content:counter(page);font:700 8.5pt 'Pretendard Variable';color:${ACC};vertical-align:top;padding-top:6mm}}
@page plain{@top-left{content:none}@top-right{content:none}@bottom-left{content:none}@bottom-right{content:none}}
@page plain:left{margin:22mm 22mm 24mm 17mm}
@page plain:right{margin:22mm 17mm 24mm 22mm}
@page part{margin:0;@top-left{content:none}@top-right{content:none}@bottom-left{content:none}@bottom-right{content:none}}
${units.map((u) => `@page ${unitCss(u)}:right{@top-right{content:${cssStr(`UNIT ${String(u.no).padStart(2, '0')}  ·  ${u.title.ko}`)};white-space:nowrap;font:600 6.8pt 'Pretendard Variable';letter-spacing:.1em;color:#9a9288;vertical-align:bottom;padding-bottom:5mm}}
@page ${unitCss(u)}:left{@top-left{content:${cssStr(B.title.en.toUpperCase())};white-space:nowrap}}`).join('\n')}
@page unitopen{margin:0;@top-left{content:none}@top-right{content:none}@bottom-left{content:none}@bottom-right{content:none}}
/* ㉠ ㉡ 는 글꼴에 없어 그림 글자(이모지)로 떨어진다 — 동그라미 글자로 직접 그린다 */
.cm{display:inline-block;width:1.2em;height:1.2em;vertical-align:-.2em;margin:0 .12em}
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
const LAB = { flow: '글의 틀', table: '핵심 정리', text: '참고', practice: '연습', writing: '문제', example: '예시' };
/* 정석풍 블록 — 핵심 정리 · 참고 · 연습 + 팁(TIP) · 주의(WARNING) · 더 알아보기(MORE). 표 끝 설명과 글 칸이 어느 블록인지는 책 틀의 blocks(「단원id:칸번호」)에서 — 없으면 표 설명은 TIP, 글 칸은 참고. */
const BLK = { tip: ['TIP', '팁'], warn: ['WARNING', '주의'], more: ['MORE', '더 알아보기'], pattern: ['PATTERN', '문형'] };
const kindOf = (u, si, s) => (B.blocks || {})[`${u.id}:${si + 1}`] || (s.type === 'table' ? 'tip' : 'ref');
/* 문형 블록 — 갈아 끼우는 자리(점선 상자)와 고정 부분(굵은 글자 + 밑줄)을 한눈에. 책 틀의 patterns(「단원id:칸번호」)에 칸마다 [글자, s(자리) | f(고정)] 로 적는다. */
const BIC = { tip: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>', warn: '<svg viewBox="0 0 24 24"><path d="M12 3 2.5 20h19L12 3z"/><path d="M12 10v4M12 17.2v.1"/></svg>', more: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>', pattern: '<svg viewBox="0 0 24 24"><path d="M8 4H5v16h3M16 4h3v16h-3M10 12h4"/></svg>' };
/* 블록 모양(시안 2 — 이름표가 테두리에 걸친 칸): 아이콘 + 이름 + 한글 이름이 위 테두리에 걸리고, 종류마다 선 색이 다르다(팁 파랑 · 주의 빨강 · 더 알아보기 회청 점선 · 문형 남색) */
const legend = (kind) => `<div class="lg">${BIC[kind]}${BLK[kind][0]}<small>${BLK[kind][1]}</small></div>`;
const underlineHl = (text, hl) => { let h = esc(text); for (const w of hl || []) h = h.replace(esc(w), `<u class="hl">${esc(w)}</u>`); return h; };
const patHtml = (rows) => `<div class="bx pattern">${legend('pattern')}<div class="pp">${rows.map((r) => `<div class="pt1"><div class="fl">${r.p.map(([t, k], i) => `${i ? '<i class="lk">+</i>' : ''}<span class="nd ${k === 's' ? 'sl' : 'fx'}">${esc(t)}</span>`).join('')}<span class="mn">→&nbsp; ${esc(r.en)}</span></div>${r.ex ? `<div class="eg"><b>e.g.</b> ${underlineHl(r.ex, r.hl)}${r.exEn ? ` <span>(${esc(r.exEn)})</span>` : ''}</div>` : ''}</div>`).join('')}</div></div>`;
const blockHtml = (u, si, s, text) => { const k = kindOf(u, si, s); const pat = (B.patterns || {})[`${u.id}:${si + 1}`]; return k === 'pattern' && pat ? patHtml(pat) : boxHtml(k === 'pattern' ? 'tip' : k, text); };
const boxHtml = (kind, text) => `<div class="bx ${kind}">${legend(kind)}<div class="tt">${esc(text)}</div></div>`;
let secNo = '';
const secLabel = (s, lab) => `<h3>${CLASSIC ? `<em class="lab">${lab || LAB[s.type]} ${secNo}</em>` : ''}<span>${esc(s.title.en)}</span>${s.title.ko ? `<small>${esc(s.title.ko)}</small>` : ''}</h3>`;
const qLine = (q) => q.includes('___')
  ? `<span class="q">${esc(q.replace(/\s*→\s*$/, '')).replace(/___/g, '<span class="bl"></span>')}</span><span class="ln" style="visibility:hidden;min-width:0"></span>`
  : `<span class="q">${esc(q)}</span><span class="ln"></span>`;

function titlePage() {
  return `<div class="blk plain"><div class="tp"><span class="ser">${esc(B.series.en)}</span><h1>${esc(B.title.ko)}</h1><h2>${esc(B.title.en)}</h2><div class="rule"></div><span class="by">${esc(B.author.ko)} · ${esc(B.author.en)}</span><span class="pub">${esc(B.publisher.en.toUpperCase())}</span></div></div>`;
}
/* 출판사 신고(2026-10-20, 경기도 수원시 영통구청 — 운영자 「출판사 신고확인증」). 주소는 판권면에 적지 않는다(신고 주소가 집 주소라서 공개하지 않는다) */
const PUBLISHER_NO = '제 2026-000158 호 (Reg. no. 2026-000158 · Suwon Yeongtong-gu, Gyeonggi-do)';
function copyrightPage() {
  return `<div class="blk plain"><div class="cr">
<h4>${esc(B.title.ko)} · ${esc(B.title.en)}</h4>
<p>${esc(B.sub.en)}<br>${esc(B.sub.ko)}</p>
<dl><dt>Author · 지은이</dt><dd>${esc(B.author.ko)} (${esc(B.author.en)})</dd>
<dt>Publisher · 펴낸곳</dt><dd>${esc(B.publisher.ko)} · ${esc(B.publisher.en)}</dd>
<dt>Publisher reg. no. · 출판사 신고번호</dt><dd>${PUBLISHER_NO}</dd>
${DIGITAL ? `<dt>Format · 형태</dt><dd>Digital edition (PDF) · 디지털판(PDF) — print it at home or at a print shop · 집이나 인쇄소에서 인쇄해 쓰세요</dd>
<dt>Edition · 판</dt><dd>${esc(B.digitalEdition || 'First digital edition · 디지털판 초판')}</dd>
<dt>Published · 발행</dt><dd>${new Date().toISOString().slice(0, 7).replace('-', '.')}</dd>` : `<dt>ISBN</dt><dd class="ph">발급 후 기재 · to be assigned</dd>
<dt>Edition · 판</dt><dd>${esc(B.edition)}</dd>
<dt>Printed · 발행일</dt><dd class="ph">○○○○년 ○월 ○일</dd>`}
<dt>Web</dt><dd>${esc(B.web)}</dd></dl>
<p>All sentences, tables and exercises in this book were written for it. They are original practice material.<br>이 책의 낱말 · 문장 · 연습은 모두 이 책을 위해 새로 쓴 것입니다.</p>
<p>© ${esc(B.publisher.en)}. All rights reserved. No part of this book may be reproduced without written permission, except for brief quotations in reviews or for classroom use by the purchaser.<br>저작권법에 따라 보호받는 책으로, 무단 복제와 전재를 금합니다.</p>
<p>TOPIK is the name of an exam run by the National Institute for International Education (NIIED). This book is an independent study aid; it is not operated, endorsed or certified by NIIED or the TOPIK Center, and its questions are original — not past exam papers.<br>TOPIK 은 국립국제교육원의 시험 이름입니다. 이 책은 독자적으로 만든 학습서이며 국립국제교육원 · 한국어능력시험센터가 운영 · 제휴 · 인증하지 않았습니다. 문항은 모두 새로 만든 것으로 기출이 아닙니다.</p>
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
const GUIDE = [
  ['table', '핵심 정리 · Key Points', '읽고 소리 내 말하고 따라 쓰는 표. 단원의 뼈대입니다.', 'Tables to read aloud, copy and revisit — the backbone of each unit.'],
  ['ref', '참고 · Note', '규칙이 어떻게 움직이는지 풀어 쓴 설명입니다.', 'A short explanation of how the pattern works.'],
  ['practice', '연습 · Practice', '줄 위에 직접 쓰고, 뒤쪽 정답으로 확인합니다.', 'Write on the line, then check the Answer Key at the back.'],
  ['tip', 'TIP · 팁', '더 자연스럽게 말하는 요령, 알아 두면 편한 규칙.', 'A handy shortcut or a more natural way to say it.'],
  ['warn', 'WARNING · 주의', '자주 하는 실수와 예외. 틀리기 쉬운 곳은 꼭 읽으세요.', 'Common mistakes and exceptions — read these before you practise.'],
  ['pattern', 'PATTERN · 문형', '자주 쓰는 문장 틀. 점선 상자 자리에 내 낱말을 갈아 끼우세요.', 'A sentence frame. Swap your own word into the dashed slot.'],
  ['more', 'MORE · 더 알아보기', '소리 변화, 유래 같은 덧붙임. 지금 몰라도 괜찮고, 궁금할 때 읽으세요.', 'Sound changes, origins and extras. Optional — read when curious.'],
];
function guidePage() {
  const mini = (k) => {
    if (k === 'table') return `<div class="sec"><h3><em class="lab">핵심 정리 1-1</em><span>Key words</span></h3><table><thead><tr><th>Korean</th><th>English</th></tr></thead><tbody><tr><td>안녕하세요</td><td>Hello</td></tr><tr><td>감사합니다</td><td>Thank you</td></tr></tbody></table></div>`;
    if (k === 'ref') return `<div class="sec"><h3><em class="lab">참고 1-3</em><span>How it works</span></h3><div class="note">Explains why the pattern behaves the way it does.</div></div>`;
    if (k === 'practice') return `<div class="sec"><h3><em class="lab">연습 1-4</em><span>Practice A</span></h3><ol class="pr" style="--qw:40%"><li><span class="q">가 + ㄴ →</span><span class="ln"></span></li><li><span class="q">나 + ㅁ →</span><span class="ln"></span></li></ol></div>`;
    if (k === 'pattern') return patHtml([{ p: [['Place', 's'], ['이/가', 'f'], ['어디예요?', 'f']], en: 'Where is [place]?' }]);
    return boxHtml(k, { tip: 'Short, useful, and often what native speakers really say.', warn: 'The mistake learners make most often — and how to avoid it.', more: 'Extra background you can skip on the first read.' }[k]);
  };
  return `<div class="blk plain gd"><h2>How this book is organized</h2><div class="k">이 책의 구성 — 블록 읽는 법</div>${GUIDE.map(([k, t, ko, en]) => `<div class="row"><div class="mini">${mini(k)}</div><div class="d"><b>${t}</b>${en}<small>${ko}</small></div></div>`).join('')}
<p style="margin-top:2.4mm;font-size:8.2pt;color:#2a3550;line-height:1.5"><b>번호 읽는 법 · Numbering</b> — 「핵심 정리 5-2」 = 5단원의 두 번째 칸. “Key Points 5-2” is the second block of Unit 5. 정답과 찾아보기는 책 뒤쪽에 있습니다 · The Answer Key and Index are at the back.</p></div>`;
}
function tocPage(starts) {
  let h = `<div class="blk plain"><div class="toc"><h2>Contents · 목차</h2>`;
  const ln = (n, en, ko, p) => `<div class="ln"><span class="n">${n}</span><span class="t">${esc(en)}<small>${esc(ko)}</small></span><span class="d"></span><span class="p">${p ?? '··'}</span></div>`;
  h += ln('', 'Preface · How to use this book', '머리말 · 쓰는 법', starts?.preface);
  if (!B.noGuide) h += ln('', 'How this book is organized', '이 책의 구성 · 블록 읽는 법', starts?.guide);
  if (FRONT_LIST.length) { h += `<div class="pt">BEFORE YOU START · <span style="color:#9a9288;font-weight:500">시작하기 전에</span></div>`; for (const [k, en, ko] of FRONT_LIST) h += ln('', en, ko, starts?.front?.[k]); }
  for (const p of parts) {
    h += `<div class="pt">PART ${p.no} · ${esc(p.title.en.toUpperCase())} <span style="color:#9a9288;font-weight:500">${esc(p.title.ko)}</span></div>`;
    for (const s of p.sheets) { const u = units.find((x) => x.id === s.id); h += ln(String(u.no).padStart(2, '0'), s.title.en, s.title.ko, starts?.unit[u.no]); }
  }
  h += `<div class="pt ex">BACK MATTER · <span style="color:#9a9288;font-weight:500">부록</span></div>`;
  h += ln('', 'Answer Key', '정답', starts?.answers) + (B.noIndex ? '' : ln('', 'Index', '찾아보기', starts?.index)) + ln('', 'Notes', '메모', starts?.memo);
  return h + '</div></div>';
}
/* 문제은행 책 — 번호마다 「풀이 방법」 쪽(topik-writing.js 의 TW_GUIDE): 무엇을 묻는지 · 풀이 순서 · 표현 · 자주 하는 실수 */
function qGuidePage(p) {
  const q = partQ(p); const g = TWM?.TW_GUIDE?.[q]; if (!g) return '';
  const pt = TWM.TW_QS.find((x) => x.q === q)?.pt;
  const both = (o) => `${esc(o.en)} <small>· ${esc(o.ko)}</small>`;
  return `<div class="blk plain gd"><h2>How to solve Question ${q}</h2><div class="k">${q}번 풀이 방법</div>
<div class="chips"><span class="chip"><b>${esc(g.time.ko)}</b>${esc(g.time.en)}</span>${pt ? `<span class="chip"><b>${pt}점</b>${pt} points</span>` : ''}</div>
<div class="bx tip">${legend('tip')}<div class="tt">${esc(g.what.en)}<br><small style="color:#5a6780">${esc(g.what.ko)}</small></div></div>
<h3 class="gh">Steps · 풀이 순서</h3>
<div class="stp">${g.steps.map((x, i) => `<div class="st"><i>${i + 1}</i><div><b>${esc(x.en)}</b><small>${esc(x.ko)}</small></div></div>`).join('')}</div>
<h3 class="gh">Useful expressions · 쓸 수 있는 표현</h3>
<table><thead><tr><th>Use · 쓰임</th><th>Expressions · 표현</th></tr></thead><tbody>${g.phrases.map((x) => `<tr><td>${both(x)}</td><td>${esc(x.ex)}</td></tr>`).join('')}</tbody></table>
<div class="bx warn">${legend('warn')}<ul class="mk">${g.mistakes.map((x) => `<li>${esc(x.en)}<small>${esc(x.ko)}</small></li>`).join('')}</ul></div></div>`;
}
/* 쓰기 책 보강(docs/writing-book/extras.json) — 번호마다 「채점 기준」 쪽 + 「예시 풀이」 쪽. 문항 글 · 모범답안 · 상중하 답안은 topik-writing.js 에서 그대로. */
const EXTRAS = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/writing-book/extras.json'), 'utf8')); } catch { return {}; } })();
const bi = (o) => `${esc(o.en)}<br><small style="color:#5a6780">${esc(o.ko)}</small>`;
function qScorePage(p) {
  const q = partQ(p); const e = EXTRAS[q]; if (!e) return '';
  const pt = TWM.TW_QS.find((x) => x.q === q)?.pt;
  const smp = TWM.TW_ITEMS.find((x) => x.id === e.worked?.item)?.samples || [];
  const AREA = { content: '내용', structure: '구성', language: '언어' };
  const ladder = smp.length ? `<h3 class="gh">Sample scores · 예시 답안 점수 <small style="font-weight:500;color:#5a6780">(${esc(e.worked.item)})</small></h3><div class="lad">${smp.map((sm) => `<div class="rw"><b>${esc(sm.level)}</b><div class="bar"><span style="width:${Math.round(sm.total / pt * 100)}%"></span></div><em>${sm.total}<small>/${pt}</small></em></div><div class="why">${Object.entries(sm.scores || {}).map(([k, v]) => `${AREA[k] || k} ${v}`).join(' · ')} — ${esc(sm.why)}</div>`).join('')}</div>` : '';
  return `<div class="blk plain gd"><h2>How Question ${q} is scored</h2><div class="k">${q}번 채점 기준</div>
<div class="total"><div class="big">${pt}<small>pts · 점</small></div><p>${esc(e.scoring.en)}<small>${esc(e.scoring.ko)}</small></p></div>
<div class="sc3" style="--n:${e.criteria.length}">${e.criteria.map((c) => `<div class="sc"><h4>${esc(c.k.en)}<small>${esc(c.k.ko)}</small></h4><div class="hi"><i>✓</i><div>${bi(c.hi)}</div></div><div class="lo"><i>✗</i><div>${bi(c.lo)}</div></div></div>`).join('')}</div>${ladder}</div>`;
}
function qWorkedPage(p) {
  const q = partQ(p); const e = EXTRAS[q]?.worked; if (!e) return '';
  const x = TWM.TW_ITEMS.find((i) => i.id === e.item); if (!x) throw new Error('없는 문항 ' + e.item);
  const task = x.blanks ? `<div class="wp">${esc(x.passage)}</div>` : `<div class="wp">${esc(x.passage)}</div>${x.data ? `<ul class="wd">${x.data.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}`;
  const ans = x.blanks ? x.blanks.map((b) => `<div class="wl"><b>${esc(b.mark)}</b><span class="wans">${b.answers.slice(0, 2).map(esc).join(' &nbsp;/&nbsp; ')}</span></div>`).join('')
    : `<div class="wp" style="white-space:pre-line">${esc(x.model)}</div>`;
  const an = (e.analysis || []).map((a) => `<li>${bi(a)}</li>`).join('')
    || (x.samples || []).map((sm) => `<li><b>${esc(sm.level)} · ${sm.total}점</b> — ${esc(sm.why)}</li>`).join('');
  const h3 = (t) => `<h3 style="font-size:10.4pt;margin:3mm 0 1.4mm;color:#1f3a68">${t}</h3>`;
  const stepsHtml = `${h3('Step by step · 풀이 순서')}<ol style="margin:0 0 2mm;padding-left:5mm;font-size:9.4pt;line-height:1.55">${e.steps.map((st) => `<li>${bi(st)}</li>`).join('')}</ol>`;
  const ansHtml = `${h3('Model answer · 모범답안')}${ans}${an ? `${h3('Answer analysis · 답안 분석')}<ul style="margin:0;padding-left:5mm;font-size:9.2pt;line-height:1.55">${an}</ul>` : ''}`;
  const head = `<h2>Worked example · Question ${q}</h2><div class="k">${q}번 예시 풀이 — ${esc(x.title)}</div>`;
  /* 53 · 54번은 모범답안이 길어 한 쪽에 안 들어간다 — 문제 · 풀이 순서 / 모범답안 · 분석으로 두 쪽 */
  return x.blanks ? `<div class="blk plain gd">${head}${task}${stepsHtml}${ansHtml}</div>`
    : `<div class="blk plain gd">${head}${task}${stepsHtml}</div><div class="blk plain gd"><h2>Worked example · Question ${q} <small style="font-weight:500;color:#5a6780">(continued · 이어서)</small></h2>${ansHtml}</div>`;
}
/* ── 쓰기 책 앞부분(B.front = "5152" | "5354") — 시험 소개 · 계획표 · 원고지 · 말→글 · 자가 점검표 + QR(운영자 2026-10-18 「앞에 넣어줘 · 예쁘게」). 자료 docs/writing-book/front.json · qr.json */
const FRONT = B.front ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/writing-book/front.json'), 'utf8')) : null;
const QRS = B.front ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/writing-book/qr.json'), 'utf8'))[B.front] : null;
const bi2 = (o) => `${esc(o.en)}<small>${esc(o.ko)}</small>`;
const qrBox = () => `<div class="qrb"><div class="qr">${QRS.svg}</div><div><b>Practice online · free AI scoring</b><small>스마트폰으로 찍으면 무료 쓰기 연습 · AI 채점 쪽으로 갑니다</small><span>everykoreans.com/topik-writing</span></div></div>`;
const fmHead = (en, ko) => `<h2>${esc(en)}</h2><div class="k">${esc(ko)}</div>`;
function fmExam() {
  const f = FRONT.exam; const seg = [['51', 4], ['52', 4], ['53', 12], ['54', 25], ['✓', 5]];
  return `<div class="blk plain gd fm">${fmHead(f.title.en, f.title.ko)}
<p class="lead">${bi2(f.intro)}</p>
<table><thead><tr><th>Q</th><th>Task · 유형</th><th>Points · 배점</th><th>Length · 분량</th><th>Time · 권장(분)</th></tr></thead><tbody>${f.rows.map((r) => `<tr><td><b>${r[0]}</b></td><td>${esc(r[1])}</td><td>${r[2]}</td><td>${esc(r[3])}</td><td>${r[4]}</td></tr>`).join('')}</tbody></table>
<h3 class="gh">50 minutes · 50분 쓰는 순서</h3>
<div class="tbar">${seg.map(([k, m]) => `<span style="flex:${m}"><b>${k}</b>${m}′</span>`).join('')}</div>
<p class="note2">${bi2(f.timeNote)}</p>
<div class="bx tip">${legend('tip')}<div class="tt">${f.areas.map((a) => `${esc(a.en)}<br><small style="color:#5a6780">${esc(a.ko)}</small>`).join('<br>')}</div></div>
${qrBox()}</div>`;
}
function fmPlan() {
  const pl = FRONT.plan[B.front]; const out = [];
  for (let i = 0; i < pl.weeks.length; i += 4) {
    const grp = pl.weeks.slice(i, i + 4);
    out.push(`<div class="blk plain gd fm">${i === 0 ? fmHead(pl.title.en, pl.title.ko) + `<p class="lead">${bi2(pl.sub)}</p>` : fmHead(pl.title.en + ' (cont.)', pl.title.ko + ' (이어서)')}
<div class="wk">${grp.map((w, j) => `<div class="wc2 c${(i + j) % 4}"><h4>${bi2(w.t)}</h4>${w.d.map((d, k) => `<div class="dy"><i></i><b>D${k + 1}</b><span>${esc(d)}</span></div>`).join('')}</div>`).join('')}</div>${i === 0 ? '' : ''}</div>`);
  }
  return out.join('\n');
}
const goji = (text, cols) => {
  const ch = [...text]; const cells = [];
  for (let i = 0; i < ch.length; i++) { const c = ch[i]; if (/\d/.test(c)) { let d = c; if (/\d/.test(ch[i + 1] || '')) d += ch[++i]; cells.push(d); } else cells.push(c); }
  const flat = ['']; 
  for (const c of cells) {
    if (c === ' ') { if (flat.length % cols === 0) continue; flat.push(''); continue; }
    if ((c === '.' || c === ',') && flat.length % cols === 0) { flat[flat.length - 1] += c; continue; }
    flat.push(c);
  }
  while (flat.length % cols) flat.push('');
  return `<div class="gj" style="--c:${cols}">${flat.map((c) => `<i${/^\d\d$/.test(c) ? ' class="dd"' : ''}>${esc(c)}</i>`).join('')}</div>`;
};
function fmGoji() {
  const f = FRONT.wongoji;
  return `<div class="blk plain gd fm">${fmHead(f.title.en, f.title.ko)}
<ol class="rl">${f.rules.map(([r]) => `<li>${bi2(r)}</li>`).join('')}</ol>
<h3 class="gh">Example · 예시</h3>${goji(f.sample, f.cols)}
<p class="note2">${esc(f.sample)}</p>
<div class="bx more">${legend('more')}<div class="tt">${esc(f.caution.en)}<br><small style="color:#5a6780">${esc(f.caution.ko)}</small></div></div></div>`;
}
function fmWritten() {
  const f = FRONT.written; const tb = (rows, l, r) => `<table><thead><tr><th>${l}</th><th>${r}</th></tr></thead><tbody>${rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td class="to"><b>${esc(b)}</b></td></tr>`).join('')}</tbody></table>`;
  return `<div class="blk plain gd fm">${fmHead(f.title.en, f.title.ko)}<p class="lead">${bi2(f.intro)}</p>
<div class="two"><div><h3 class="gh">Words · 낱말</h3>${tb(f.words, 'Spoken · 말', 'Written · 글')}</div><div><h3 class="gh">Endings · 문장 끝</h3>${tb(f.ends, 'Spoken · 말', 'Written · 글')}</div></div>
<div class="bx tip">${legend('tip')}<div class="tt">${esc(f.note.en)}<br><small style="color:#5a6780">${esc(f.note.ko)}</small></div></div></div>`;
}
function fmCheck() {
  const g = FRONT.check[B.front].groups;
  return `<div class="blk plain gd fm">${fmHead('Self-check · Before you hand in', '자가 점검표 · 내기 전에')}
<div class="ck">${g.map(([k, items]) => `<div class="cg"><h4>${bi2(k)}</h4>${items.map((it) => `<div class="ci"><i></i><span>${esc(it.en)}<small>${esc(it.ko)}</small></span></div>`).join('')}</div>`).join('')}</div>
<h3 class="gh">Score log · 점수 기록</h3>
<table class="lg2"><thead><tr><th>Date · 날짜</th><th>Q · 문제</th><th>Score · 점수</th><th>What to fix · 고칠 것</th></tr></thead><tbody>${Array.from({ length: 6 }, () => '<tr><td></td><td></td><td></td><td></td></tr>').join('')}</tbody></table>
${qrBox()}</div>`;
}
const FRONT_LIST = B.front ? [['fm1', 'Exam overview', '시험 소개', fmExam], ['fm2', FRONT.plan[B.front].title.en, FRONT.plan[B.front].title.ko, fmPlan], ['fm3', 'Answer grid (원고지)', '원고지 쓰기법', fmGoji], ['fm4', 'Spoken → written', '말 → 글 바꾸기 표', fmWritten], ['fm5', 'Self-check', '자가 점검표', fmCheck]] : [];

function partPage(p) {
  return `<div class="blk pd"><div class="no">PART ${p.no}</div><div class="big">${String(p.no).padStart(2, '0')}</div><h2>${esc(p.title.ko)}</h2><h3>${esc(p.title.en)}</h3>
<div class="list">${p.sheets.map((s) => { const u = units.find((x) => x.id === s.id); return `Unit ${String(u.no).padStart(2, '0')} &nbsp; ${esc(s.title.en)}`; }).join('<br>')}</div></div>`;
}
/* 한 장 요약 · 풀이 쪽의 「예시」 — 우리 창작 문항(topik-writing.js)의 지문 + 모범답안 */
function exampleHtml(s) {
  const x = TWM.TW_ITEMS.find((i) => i.id === s.item); if (!x) throw new Error('없는 문항 ' + s.item);
  if (x.blanks) return `<div class="wp">${esc(x.passage)}</div>${x.blanks.map((b) => `<div class="wl"><b>${esc(b.mark)}</b><span class="wans">${b.answers.slice(0, 2).map(esc).join(' &nbsp;/&nbsp; ')}</span></div>`).join('')}`;
  return `${s.showData && x.data ? `<ul class="wd">${x.data.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}<div class="wp" style="white-space:pre-line">${esc(x.model)}</div>`;
}
const wlines = (n, per = 30) => `<div class="wg">${Array.from({ length: n }, (_, i) => `<div class="wr">${(i + 1) % 5 === 0 ? `<i>${(i + 1) * per}</i>` : ''}</div>`).join('')}</div>`;
function writingHtml(x) {
  const cond = x.cond ? `<div class="wc">${esc(x.cond)}</div>` : '';
  if (x.q <= 52) return `<div class="wp">${esc(x.passage)}</div>${cond}${x.blanks.map((b) => `<div class="wl"><b>${esc(b.mark)}</b><span class="wln"></span></div>`).join('')}`;
  const data = x.data ? `<ul class="wd">${x.data.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '';
  return `<div class="wp">${esc(x.passage)}</div>${data}<ol class="wt">${x.tasks.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>${cond}${wlines(Math.ceil(x.max / 30))}`;
}
const qw = (items) => { const m = Math.max(...items.filter((x) => !x.q.includes('___')).map((x) => [...x.q].length), 0); return m <= 12 ? '34%' : m <= 22 ? '48%' : m <= 34 ? '60%' : '72%'; };
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
      return `<div class="sec"${s.rows.length <= 8 ? ' style="break-inside:avoid"' : ''}>${sr(si)}${secLabel(s)}<table><thead><tr>${s.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${s.rows.map((r) => `<tr>${r.map((c, i) => `<td${tipCols[i] ? ' class="tip"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>${s.note ? (CLASSIC ? blockHtml(u, si, s, s.note) : `<div class="note">${esc(s.note)}</div>`) : ''}</div>`;
    }
    if (s.type === 'text') {
      const k = CLASSIC ? kindOf(u, si, s) : 'ref';
      if (k !== 'ref') return `<div class="sec">${sr(si)}${secLabel(s, BLK[k][1])}${blockHtml(u, si, s, s.text)}</div>`;
      return `<div class="sec">${sr(si)}${secLabel(s)}<div class="note">${esc(s.text)}</div></div>`;
    }
    if (s.type === 'flow') return `<div class="sec">${sr(si)}${secLabel(s)}<div class="flow">${s.steps.map((st) => `<div class="fs${st.blank ? ' bl' : ''}"><b>${esc(st.ko)}</b><span>${esc(st.en)}</span></div>`).join('<i class="ar">→</i>')}</div></div>`;
    if (s.type === 'example') return `<div class="sec">${sr(si)}${secLabel(s)}${exampleHtml(s)}</div>`;
    if (s.type === 'writing') return `<div class="sec wq">${sr(si)}${secLabel(s)}${writingHtml(s.raw)}</div>`;
    return `<div class="sec"${s.items.length <= 8 ? ' style="break-inside:avoid"' : ''}>${sr(si)}${secLabel(s)}${s.hint ? `<div class="hint">${esc(s.hint)}</div>` : ''}<ol class="pr" style="--qw:${qw(s.items)}">${s.items.map((x) => `<li${x.q.includes('___') ? ' class="fill"' : ''}>${qLine(x.q)}</li>`).join('')}</ol></div>`;
  }).join('\n');
  if (CLASSIC) return `<div class="blk ${unitCss(u)}" style="page:${unitCss(u)}">${u._head}${body}</div>`;
  return open + `<div class="blk ${unitCss(u)}" style="page:${unitCss(u)}">${body}</div>`;
}
function answersBlock() {
  let h = `<div class="blk plain ak"><h2>Answer Key</h2><div class="k">정답</div>`;
  for (const u of units) {
    h += `<div class="u"><h4><span>UNIT ${String(u.no).padStart(2, '0')}</span>${esc(u.title.en)}<small>${esc(u.title.ko)}</small></h4>`;
    for (const s of u.sections.filter((x) => x.type === 'writing')) {
      const x = s.raw;
      if (x.q <= 52) h += `<div class="set a wa"><b>${esc(s.title.en)}</b> ${x.blanks.map((b) => `${esc(b.mark)} ${b.answers.map(esc).join(' / ')}`).join(' &nbsp;·&nbsp; ')}<small>${x.blanks.map((b) => esc(b.point)).join(' ')}</small><small class="dd">감점 · ${x.deduct.map(esc).join(' · ')}</small></div>`;
      else h += `<div class="set a wa"><b>${esc(s.title.en)}</b><p class="mdl">${esc(x.model).replace(/\n+/g, ' ¶ ')}</p><small>채점 · ${Object.entries(x.points).map(([k, v]) => `${{ content: '내용', structure: '구성', language: '언어' }[k] || k}: ${esc(v)}`).join(' / ')}</small>${(x.samples || []).map((m) => `<small class="sm"><i>${esc(m.level)} ${m.total}점</i> ${esc(m.text).replace(/\n+/g, ' ¶ ')} — ${esc(m.why)}</small>`).join('')}<small class="dd">감점 · ${(x.deduct || []).map(esc).join(' · ')}</small></div>`;
    }
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
const reviewTop = REVIEW ? `@page:left{@bottom-center{content:"REVIEW COPY · 검수본";white-space:nowrap;font:800 6.4pt 'Pretendard Variable';letter-spacing:.2em;color:#c0392b;vertical-align:top;padding-top:6mm}}@page:right{@bottom-center{content:"REVIEW COPY · 검수본";white-space:nowrap;font:800 6.4pt 'Pretendard Variable';letter-spacing:.2em;color:#c0392b;vertical-align:top;padding-top:6mm}}` : '';
const CLASSIC_CSS = `
.bx .tt{white-space:pre-line}.wans{flex:1;font-size:9.6pt;color:#1f3a68;padding-bottom:.6mm;border-bottom:.25mm solid #c5cfdf}
.wp{border:.25mm solid #b9c3d6;background:#f6f8fc;padding:3mm 3.6mm;font-size:9.6pt;line-height:1.8;margin:1mm 0 2mm}.wc{font-size:8pt;color:#5a6780;margin:0 0 1.6mm}
.wl{display:flex;align-items:flex-end;gap:2.4mm;margin:2.4mm 0}.wl b{color:${ACC};font-size:11pt}.wln{flex:1;border-bottom:.25mm solid #8e9ab0;height:7mm}
.wd{margin:0 0 2mm 5mm;padding:0;font-size:9pt;line-height:1.55;color:#2a3550}.wt{margin:0 0 2mm 6mm;padding:0;font-size:9pt;line-height:1.55}
.wg{margin-top:2mm}.wr{position:relative;border-bottom:.22mm solid #8e9ab0;height:8mm}.wr i{position:absolute;right:0;top:1mm;font-size:6.4pt;color:#8a93a6;font-style:normal}
.wq{break-inside:avoid}.wa{font-size:8.2pt;line-height:1.55;border-top:.2mm solid #d6dce8;padding-top:1.4mm;margin-top:1.4mm}.wa small{display:block;font-size:7.2pt;color:#5a6780}.wa .sm i{font-style:normal;font-weight:800;color:${ACC};margin-right:1.4mm}.wa .mdl{margin:.6mm 0 1mm}.wa .dd{color:#9a6a50}

body{font-size:9.4pt;line-height:1.6;color:#111}
/* 정석풍 — 남색 한 가지 · 면 채우기 없이 선과 글자만(운영자 「더 깔끔하게 수학의 정석처럼」) */
.sec{margin:0 0 5.5mm}
.sec>h3{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:3mm;row-gap:.2mm;align-items:center;border-bottom:.35mm solid ${ACC};padding-bottom:1.1mm;margin-bottom:2.4mm;font-size:11.2pt;line-height:1.3}
.sec>h3:before{display:none}
.lab{grid-row:1;align-self:center;font-style:normal;border:.3mm solid ${ACC};color:${ACC};font-size:7.4pt;font-weight:800;letter-spacing:.04em;padding:.7mm 2.6mm;border-radius:0;line-height:1.5;white-space:nowrap}
.sec>h3 span{grid-column:2;grid-row:1}.sec>h3 small{grid-column:2;grid-row:2;margin:0;font-size:8.2pt;line-height:1.25;color:#5a6780;font-weight:500}.sec>h3:not(:has(.lab)) span{grid-column:1/3}
table{border-top:0;border-bottom:.4mm solid ${ACC};font-size:8.6pt}
th{background:transparent;color:${ACC};border:0;border-bottom:.25mm solid ${ACC};font-size:7.6pt;font-weight:800;letter-spacing:.02em;padding:1mm 3mm 1.2mm;line-height:1.2;vertical-align:bottom}
tbody tr:nth-child(even) td,tr:nth-child(even) td{background:transparent}td{border-bottom:.15mm solid #cfd6e2;padding:1.05mm 3mm;line-height:1.3;font-size:8.6pt}td:first-child{font-size:8.9pt;font-weight:700}tr:last-child td{border-bottom:0}td:first-child{color:${ACC}}td.tip{color:#6b7a92}
.bx{--c:#2F5DA8;position:relative;border:.3mm solid var(--c);border-radius:1.6mm;padding:3.6mm 3.6mm 2.4mm;margin-top:5.2mm;background:#fff;font-size:8.6pt;line-height:1.5;color:#111;break-inside:avoid}
.bx.warn{--c:#B3322D}.bx.more{--c:#5B6B86;border-style:dashed}.bx.pattern{--c:${ACC}}.bx.tip{--c:#2F5DA8}
.bx .lg{position:absolute;left:3mm;top:-2.1mm;background:#fff;padding:0 1.8mm;display:flex;align-items:center;gap:1.2mm;font-size:6.8pt;font-weight:800;letter-spacing:.12em;color:var(--c);line-height:1.2}
.bx .lg svg{width:3.3mm;height:3.3mm;stroke:var(--c);fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.bx .lg small{font-weight:600;letter-spacing:0;color:#6b7a92;font-size:6.8pt}
.flow{display:flex;align-items:stretch;gap:1.2mm;margin-top:2mm}.flow .fs{flex:1;border:.3mm solid ${ACC};border-radius:1.6mm;padding:2.4mm 1.8mm;text-align:center;background:#fff;display:flex;flex-direction:column;gap:.8mm;justify-content:center}.flow .fs b{font-size:8.8pt;color:${ACC}}.flow .fs span{font-size:7pt;color:#5a6780;line-height:1.3}.flow .fs.bl{background:${TINT};border-style:dashed}.flow .ar{align-self:center;color:${ACC};font-style:normal;font-weight:800;font-size:10pt}
.gd .chips{display:flex;gap:2mm;margin:1mm 0 3mm}.gd .chip{display:inline-flex;align-items:baseline;gap:1.6mm;border:.3mm solid ${ACC};border-radius:5mm;padding:.9mm 3.2mm;font-size:7.6pt;color:#5a6780}.gd .chip b{font-size:9.4pt;color:${ACC}}
.gd h3.gh{font-size:10.4pt;margin:3.2mm 0 1.2mm;color:${ACC}}
.stp{display:flex;flex-direction:column;gap:1.1mm}.stp .st{display:flex;gap:3mm;align-items:flex-start;border:.25mm solid #d6dce8;border-radius:1.6mm;padding:1.2mm 3mm;background:#fff}.stp .st i{flex:none;width:6mm;height:6mm;border-radius:50%;background:${ACC};color:#fff;font:800 8.4pt/6mm 'Pretendard Variable';text-align:center;font-style:normal}.stp .st b{display:block;font-size:9pt;font-weight:600;line-height:1.4}.stp .st small{display:block;font-size:7.8pt;color:#5a6780;margin-top:.4mm}
.bx .mk{list-style:none;display:flex;flex-direction:column;gap:1.6mm}.bx .mk li{font-size:8.8pt;line-height:1.4;padding-left:4.2mm;position:relative}.bx .mk li:before{content:"✗";position:absolute;left:0;color:#B3322D;font-weight:800}.bx .mk small{display:block;font-size:7.8pt;color:#5a6780}
.gd .total{display:flex;gap:5mm;align-items:center;margin:1mm 0 4mm;padding:3mm 4mm;background:${TINT};border-radius:2mm}.gd .total .big{font:800 26pt/1 'Pretendard Variable';color:${ACC};white-space:nowrap}.gd .total .big small{font-size:8pt;font-weight:600;margin-left:1.2mm;color:#5a6780}.gd .total p{font-size:9pt;line-height:1.45}.gd .total p small{display:block;font-size:7.8pt;color:#5a6780;margin-top:.6mm}
.sc3{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:2.4mm}.sc{border:.3mm solid ${ACC};border-radius:1.8mm;overflow:hidden;background:#fff}.sc h4{background:${ACC};color:#fff;padding:1.8mm 2.4mm;font-size:9pt}.sc h4 small{display:block;font-size:7.4pt;font-weight:500;opacity:.8}.sc .hi,.sc .lo{display:flex;gap:1.8mm;padding:2.2mm 2.4mm;font-size:8.2pt;line-height:1.4}.sc .hi{background:#eef6ef}.sc .lo{background:#fbefee;border-top:.2mm solid #fff}.sc i{flex:none;font-style:normal;font-weight:800}.sc .hi i{color:#2e7d4f}.sc .lo i{color:#B3322D}.sc small{font-size:7.2pt}
.lad .rw{display:flex;align-items:center;gap:2.4mm;margin-top:2.2mm}.lad .rw b{width:7mm;font-size:9.4pt;color:${ACC}}.lad .bar{flex:1;height:3.4mm;background:#e8ecf3;border-radius:2mm;overflow:hidden}.lad .bar span{display:block;height:100%;background:${ACC}}.lad em{font:800 11pt "Pretendard Variable";font-style:normal;width:21mm;white-space:nowrap;text-align:right}.lad em small{font-size:7.4pt;font-weight:500;color:#5a6780}.lad .why{font-size:8pt;color:#44506a;line-height:1.4;margin:.6mm 0 0 9.4mm}
.fm .lead{font-size:9.4pt;line-height:1.5;margin:1mm 0 3mm}.fm .lead small{display:block;font-size:8pt;color:#5a6780}.fm .note2{font-size:8pt;color:#5a6780;margin:1.2mm 0 3mm}.fm .note2 small{display:block}
.tbar{display:flex;gap:.8mm;margin-top:1.6mm}.tbar span{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2mm 0;border-radius:1.4mm;background:${ACC};color:#fff;font-size:8pt;min-width:9mm}.tbar span:nth-child(odd){opacity:.86}.tbar span:last-child{background:#7a8aa6}.tbar b{font-size:10pt}
.qrb{display:flex;gap:4mm;align-items:center;margin-top:5mm;padding:3mm 4mm;border:.3mm solid ${ACC};border-radius:2mm;background:${TINT}}.qrb .qr svg{width:22mm;height:22mm;display:block}.qrb b{display:block;font-size:10pt;color:${ACC}}.qrb small{display:block;font-size:8pt;color:#44506a;margin:.8mm 0}.qrb span{font-size:8pt;font-weight:700;color:${ACC}}
.wk{display:grid;grid-template-columns:1fr 1fr;gap:3.2mm;margin-top:2mm}.wc2{border-radius:2mm;overflow:hidden;border:.3mm solid var(--wc,#1F3A68);background:#fff}.wc2 h4{background:var(--wc,#1F3A68);color:#fff;padding:2mm 2.6mm;font-size:8.6pt;line-height:1.3}.wc2 h4 small{display:block;font-size:7.2pt;font-weight:500;opacity:.85}.wc2 .dy{display:flex;align-items:center;gap:1.8mm;padding:1.8mm 2.4mm;border-top:.2mm solid #e3e8f0;font-size:8pt}.wc2 .dy i{flex:none;width:3.6mm;height:3.6mm;border:.35mm solid var(--wc,#1F3A68);border-radius:.8mm}.wc2 .dy b{flex:none;width:6mm;color:var(--wc,#1F3A68);font-size:7.6pt}.wc2.c0{--wc:#1F3A68}.wc2.c1{--wc:#2a7a6a}.wc2.c2{--wc:#a8641e}.wc2.c3{--wc:#7a3d8a}
.rl{padding-left:5mm;display:flex;flex-direction:column;gap:2mm;font-size:9pt;line-height:1.45}.rl li::marker{color:${ACC};font-weight:800}.rl small{display:block;font-size:7.8pt;color:#5a6780}
.gj{display:grid;grid-template-columns:repeat(var(--c),10mm);width:max-content;border-left:.25mm solid #7a8aa6;border-top:.25mm solid #7a8aa6;margin:1.6mm 0}.gj i{width:10mm;height:10mm;border-right:.25mm solid #7a8aa6;border-bottom:.25mm solid #7a8aa6;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:12pt;color:#111}.gj i.dd{font-size:10pt;letter-spacing:-.2mm}
.two{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-bottom:3mm}.two table{font-size:8.2pt}.two td.to b{color:${ACC}}
.ck{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.ck .cg{border:.3mm solid #d0d8e6;border-radius:1.8mm;padding:2.2mm 2.8mm;background:#fff}.ck .cg h4{font-size:9pt;color:${ACC};margin-bottom:1.4mm}.ck h4 small{font-size:7.4pt;color:#5a6780;font-weight:500;margin-left:1mm}.ck .ci{display:flex;gap:2mm;padding:.9mm 0;font-size:8pt;line-height:1.35}.ck .ci i{flex:none;width:3.4mm;height:3.4mm;margin-top:.5mm;border:.35mm solid ${ACC};border-radius:.8mm}.ck .ci small{display:block;font-size:7.2pt;color:#5a6780}
.lg2 td{height:7.2mm}
.bx .pp{display:flex;flex-direction:column;gap:2.2mm}.pt1 .fl{display:flex;align-items:center;flex-wrap:wrap;gap:0}
.nd{display:inline-flex;align-items:center;padding:1.2mm 2.8mm;border-radius:1.3mm;font-weight:800}.nd.sl{border:.3mm dashed ${ACC};background:#F1F4FA;color:${ACC};font-size:8pt}.nd.fx{background:${ACC};color:#fff;font-size:9.6pt}
.lk{font-style:normal;width:4mm;text-align:center;color:#9aa6bb;font-weight:800}.mn{margin-left:3mm;font-size:8.4pt;color:#2a3550}
.eg{margin-top:1.2mm;padding:1.4mm 2.6mm;background:#FAFBFD;border:.2mm solid #E3E8F1;border-radius:1.2mm;font-size:8.4pt;color:#222}.eg b{color:${ACC};font-size:6.8pt;letter-spacing:.1em;margin-right:1.6mm}.eg span{color:#6b7a92}u.hl{text-decoration:none;border-bottom:.45mm dashed ${ACC};font-weight:700}
.gd h2{font-size:19pt;margin-bottom:.6mm}.gd .k{font-size:10pt;color:#5a6780;margin-bottom:3mm}.gd .row{display:grid;grid-template-columns:72mm 1fr;gap:6mm;padding:1.1mm 0 1.4mm;border-top:.2mm solid #cfd6e2;align-items:start;break-inside:avoid}.gd .row:first-of-type{border-top:.4mm solid ${ACC}}.gd .row .d b{display:block;font-size:9.6pt;margin-bottom:.8mm}.gd .row .d{font-size:8.6pt;line-height:1.5;color:#2a3550}.gd .row .d small{display:block;color:#6b7a92;font-size:8pt;margin-top:.6mm}.gd .mini{font-size:7.8pt}.gd .mini .sec>h3{margin-bottom:1.4mm;font-size:9pt}.gd .mini table{font-size:7.6pt}.gd .mini .bx{margin-top:3.4mm;padding:3mm 3mm 1.4mm;font-size:7.4pt;line-height:1.4}.gd .mini .nd{padding:.8mm 2.2mm}.gd .mini .sec{margin:0}.gd .mini .note{margin-top:0;font-size:7.8pt}.gd .mini .nd.fx{font-size:8.6pt}.gd .mini .pr li{min-height:6mm}
.note{break-inside:avoid;border:0;border-left:.9mm solid ${ACC};background:transparent;color:#111;padding:.8mm 0 .8mm 3.2mm;margin-top:2.4mm;line-height:1.5}.note b{color:${ACC}}
.pr li{border-bottom:0;min-height:8.4mm}.pr li:before{content:counter(q) '.';border:0;border-radius:0;background:transparent;color:${ACC};width:6mm;height:auto;font-size:9pt;font-weight:800;justify-content:flex-start;margin:0}
.pr li{display:grid;grid-template-columns:6mm var(--qw,48%) 1fr;column-gap:3mm;align-items:end;padding:1mm 0}.pr li.fill{grid-template-columns:6mm 1fr}.pr li.fill .ln{display:none}
.pr .q{font-weight:500;line-height:1.45;padding-bottom:.4mm}.pr .ln{flex:none;min-width:0;height:4.8mm;border-bottom:.2mm solid #8e9ab0;margin:0}.pr .bl{border-bottom:.2mm solid #8e9ab0}
.uh{display:block;padding-bottom:3mm;border-bottom:.35mm solid ${ACC};margin-bottom:1.2mm;position:relative}
.uh:after{content:'';position:absolute;left:0;right:0;bottom:-1.6mm;border-bottom:1.1mm solid ${ACC}}
.uh .un{display:block;width:auto;height:auto;background:transparent;color:${ACC};font-size:7.6pt;font-weight:800;letter-spacing:.24em;margin-bottom:1.4mm;line-height:1.2}
.uh .ut small{display:none}.uh .ut h2{font-size:23pt;line-height:1.2;font-weight:800;color:#111}.uh .ut h3{font-size:11pt;font-weight:500;color:#5a6780;margin-top:1mm}
.us{margin:4.6mm 0 5mm;font-size:9.2pt;color:#2a3550;padding:0;border:0}.us small{display:block;margin-top:.8mm;color:#6b7a92;font-size:8.4pt}
.pd{background:#fff !important;color:#111 !important;padding:70mm 24mm 0 !important}.pd:before,.pd:after{display:none !important}
.pd .no{color:${ACC};opacity:1}.pd .big{color:${ACC};opacity:1;font-size:96pt;font-weight:800;margin:4mm 0 5mm}.pd h2{color:#111;font-size:26pt;padding-bottom:4mm;border-bottom:1.1mm solid ${ACC}}.pd h3{color:#5a6780;opacity:1}.pd .list{color:#2a3550;opacity:1;margin-top:8mm}
.toc .pt,.ak .u h4 span,.ix .ini,.memo h2{color:${ACC}}.how li:before{background:${ACC}}
.ak .u h4{border-bottom-color:${ACC}}.tp .rule{background:${ACC}}
`;
/* ㉠ ㉡ ㉢ — 글꼴에 없는 글자라 동그라미 + 자음을 선으로 직접 그린다(글꼴 자음은 칸 안에서 위 · 아래로 쏠려 보였다 — 운영자 2026-10-18 「위치가 이상하다」) */
const CMP = { '㉠': 'M6.6 6.4H13.6V13.6', '㉡': 'M6.6 6.4V13.6H13.6', '㉢': 'M13.6 6.4H6.6V13.6H13.6' };
const CM = Object.fromEntries(Object.entries(CMP).map(([k, d]) => [k, `<svg class="cm" viewBox="0 0 20 20" aria-label="${k}"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="miter"/></svg>`]));
const shell = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="/vendor/pretendard.css"><style>${CSS}${CLASSIC ? CLASSIC_CSS : ''}${reviewTop}</style></head><body>${body.replace(/[㉠㉡㉢]/g, (c) => CM[c])}</body></html>`;
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
const blocks = B.compact ? parts.flatMap((p) => p.sheets.map((sh) => { const u = units.find((x) => x.id === sh.id); return [`unit${u.no}`, unitBlock(u)]; })) : [
  ['title', titlePage()], ['copyright', copyrightPage()], ['preface', prefacePage()], ['how', howPage()], ...(B.noGuide ? [] : [['guide', guidePage()]]), ['toc', tocPage(null)], ...FRONT_LIST.map(([k, , , fn]) => [k, fn()]),
  ...parts.flatMap((p) => [[`part${p.no}`, partPage(p)], ...(TWM ? [[`qguide${p.no}`, qGuidePage(p)], [`qscore${p.no}`, qScorePage(p)], [`qworked${p.no}`, qWorkedPage(p)]] : []), ...p.sheets.map((s) => { const u = units.find((x) => x.id === s.id); return [`unit${u.no}`, unitBlock(u)]; })]),
  ['answers', answersBlock()], ...(B.noIndex ? [] : [['index', indexBlock(entries)]]),
];
const counts = {};
for (const [k, html] of blocks) counts[k] = countPages(await pdf(html));
let total = Object.values(counts).reduce((a, b) => a + b, 0);
const memoPages = (total + 1) % 2 === 0 ? 1 : 2;   // 메모 쪽은 1~2쪽 — 총 쪽수는 짝수(인쇄 · 제본)
if (!B.compact) { blocks.push(['memo', memoBlock(memoPages)]); counts.memo = memoPages; total += memoPages; }
/* 시작 쪽 = 앞 블록 쪽수의 합 + 1 */
let at = 1; const start = {};
for (const [k] of blocks) { start[k] = at; at += counts[k]; }
const starts = { front: Object.fromEntries(FRONT_LIST.map(([k]) => [k, start[k]])), preface: start.preface, guide: start.guide, unit: Object.fromEntries(units.map((u) => [u.no, start[`unit${u.no}`] + 1])), answers: start.answers, index: start.index, memo: start.memo };
// 단원 첫 쪽(표지 쪽)은 목차에 그 단원의 첫 쪽으로 적는다 — unit 블록은 첫 쪽이 단원 표지이므로 start 그대로가 맞다
for (const u of units) starts.unit[u.no] = start[`unit${u.no}`];
const final = blocks.map(([k, html]) => (k === 'toc' ? tocPage(starts) : html)).join('\n') + (REVIEW ? reviewSheet() : '');

const dir = path.join(outDir, bookId + (THEME !== (B.theme || 'brand') ? `-${THEME}` : ''));
fs.mkdirSync(dir, { recursive: true });
const interior = await pdf(final);
const realTotal = countPages(interior) - (REVIEW ? countPages(await pdf(reviewSheet())) : 0);
fs.writeFileSync(path.join(dir, REVIEW ? 'interior-review.pdf' : 'interior.pdf'), interior);
/* 한 장 요약(compact) — 표지 · 판권면 · 목차 없이 단원 쪽만. 업무 형식 이름(B.file)으로도 한 부 둔다. */
if (B.compact && !REVIEW) { fs.writeFileSync(path.join(dir, `${B.file || bookId}.pdf`), interior); await browser.close(); server.close(); console.log(`요약 ${bookId}: ${countPages(interior)}쪽 → ${path.join(dir, `${B.file || bookId}.pdf`)}`); process.exit(0); }
if (REVIEW) {
  /* 글 판 — 단원 · 칸마다 출처(학습지id · §번호) · 블록 종류 · 표 · 설명 · 연습(정답 포함) */
  const md = [`# ${B.title.en} · ${B.title.ko} — review text`, '', `단원 ${units.length} · 출처 표기 = 「학습지id · §칸번호」`, ''];
  for (const u of units) {
    md.push(`## Unit ${String(u.no).padStart(2, '0')} · ${u.title.en} · ${u.title.ko}  [${u.id}]`, `> ${u.sub.en} / ${u.sub.ko}`, '');
    u.sections.forEach((x, i) => {
      const k = CLASSIC && x.type !== 'practice' && x.type !== 'table' ? (kindOf(u, i, x) === 'ref' ? 'note' : kindOf(u, i, x)) : x.type;
      md.push(`### §${i + 1} · ${x.type} · ${x.title.en}${x.title.ko ? ` / ${x.title.ko}` : ''}   (${u.id} · §${i + 1})`);
      if (x.type === 'table') { md.push(`| ${x.cols.join(' | ')} |`, `|${x.cols.map(() => '---').join('|')}|`, ...x.rows.map((r) => `| ${r.join(' | ')} |`)); if (x.note) md.push('', `[${kindOf(u, i, x)}] ${x.note}`); }
      else if (x.type === 'text') md.push(`[${k}] ${x.text}`);
      else if (x.type === 'flow') md.push(x.steps.map((st) => `${st.ko} (${st.en})`).join(' → '));
      else if (x.items) { if (x.hint) md.push(`(hint) ${x.hint}`); x.items.forEach((q, n) => md.push(`${n + 1}. ${q.q}  →  **${q.a}**`)); }
      const pat = (B.patterns || {})[`${u.id}:${i + 1}`];
      if (pat) md.push('', '[pattern] ' + pat.map((r) => r.p.map(([t, kk]) => (kk === 's' ? `[${t}]` : t)).join(' + ') + ` → ${r.en}${r.ex ? ` · e.g. ${r.ex}${r.exEn ? ` (${r.exEn})` : ''}` : ''}`).join(' | '));
      md.push('');
    });
  }
  if (B.front) {   // 앞부분 · 유형 풀이 · 채점 기준 · 예시 풀이도 검수 글에 — 단원에 안 들어 있는 글(Argon 검수용)
    const bl = (o) => (o && o.en ? `${o.en} / ${o.ko}` : String(o));
    const f = FRONT; const pl = f.plan[B.front];
    md.push('## Front matter · 앞부분', '', '### 시험 소개 (front.exam)', bl(f.exam.intro), ...f.exam.rows.map((r) => `- Q${r[0]} · ${r[1]} · ${r[2]}점 · ${r[3]} · 권장 ${r[4]}분`), ...f.exam.areas.map(bl), '',
      `### ${bl(pl.title)} (front.plan)`, bl(pl.sub), ...pl.weeks.map((w) => `- ${bl(w.t)}: ${w.d.join(' | ')}`), '',
      '### 원고지 쓰기법 (front.wongoji)', ...f.wongoji.rules.map(([r], n) => `${n + 1}. ${bl(r)}`), `예시 문장: ${f.wongoji.sample}`, bl(f.wongoji.caution), '',
      '### 말 → 글 바꾸기 표 (front.written)', bl(f.written.intro), '| 말 | 글 |', '|---|---|', ...f.written.words.concat(f.written.ends).map(([a, b]) => `| ${a} | ${b} |`), bl(f.written.note), '',
      '### 자가 점검표 (front.check)', ...f.check[B.front].groups.flatMap(([k, its]) => [`- ${bl(k)}`, ...its.map((it) => `  - ${bl(it)}`)]), '');
    for (const p of parts) {
      const q = partQ(p); const g = TWM.TW_GUIDE[q]; const e = EXTRAS[q];
      md.push(`## Q${q} 풀이 방법 · 채점 기준 · 예시 풀이`, '', `### ${q}번 풀이 방법 (TW_GUIDE)`, `${g.time.ko} · ${bl(g.what)}`, ...g.steps.map((x, n) => `${n + 1}. ${bl(x)}`), '표현:', ...g.phrases.map((x) => `- ${bl(x)}: ${x.ex}`), '자주 하는 실수:', ...g.mistakes.map((x) => `- ${bl(x)}`), '');
      if (e) md.push(`### ${q}번 채점 기준 (extras.${q})`, bl(e.scoring), ...e.criteria.map((c) => `- ${bl(c.k)} · 높은 점수: ${bl(c.hi)} · 감점: ${bl(c.lo)}`), '', `### ${q}번 예시 풀이 (extras.${q}.worked · 문항 ${e.worked.item})`, ...e.worked.steps.map((x, n) => `${n + 1}. ${bl(x)}`), ...(e.worked.analysis || []).map((x) => `- 분석: ${bl(x)}`), '');
    }
  }
  fs.writeFileSync(path.join(dir, 'review-text.md'), md.join('\n'));
}

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
<div class="lv"><span class="badge">${esc(B.level)} · ${esc(B.levelTag || "BEGINNER")}</span><div class="by"><b>${esc(B.author.ko)} · ${esc(B.author.en)}</b><span>${esc(B.publisher.en.toUpperCase())}</span></div></div></div></div>
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
