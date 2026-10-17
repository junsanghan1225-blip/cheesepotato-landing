/* 한 장 요약본(핸드아웃) 만들기 — 시험 전날 보는 짧은 자료. 책 틀(build-book)과 따로, A4 몇 쪽짜리 PDF 한 개.
   사용: node tools/build-handout.mjs topik2-writing-eve [--out 폴더]   → <폴더>/<파일이름>.pdf
   내용은 docs/handouts/<id>.json(제목 · 쪽마다 블록). 예문은 우리 창작 문항(topik-writing.js)에서 id 로 가져온다 — 기출 아님. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const id = process.argv[2];
const outDir = path.resolve(ROOT, process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'books-out');
const H = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/handouts/${id}.json`), 'utf8'));
const { TW_ITEMS } = await import(pathToFileURL(path.join(ROOT, 'topik-writing.js')).href);
const item = (i) => TW_ITEMS.find((x) => x.id === i);
const esc = (x) => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nl = (x) => esc(x).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n+/g, '<br>');

const block = (b) => {
  if (b.t === 'h') return `<h2>${esc(b.ko)}<small>${esc(b.en || '')}</small></h2>`;
  if (b.t === 'p') return `<p class="${b.cls || ''}">${nl(b.text)}</p>`;
  if (b.t === 'list') return `<ul class="${b.cls || ''}">${b.items.map((x) => `<li>${nl(x)}</li>`).join('')}</ul>`;
  if (b.t === 'steps') return `<ol class="steps">${b.items.map((x) => `<li>${nl(x)}</li>`).join('')}</ol>`;
  if (b.t === 'table') return `<table><thead><tr>${b.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${nl(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  if (b.t === 'box') return `<div class="box ${b.kind || 'tip'}"><b>${esc(b.title)}</b>${b.text ? `<div>${nl(b.text)}</div>` : ''}${b.items ? `<ul>${b.items.map((x) => `<li>${nl(x)}</li>`).join('')}</ul>` : ''}</div>`;
  if (b.t === 'ex') { /* 우리 창작 문항에서 예시 가져오기 */
    const x = item(b.item); if (!x) throw new Error('없는 문항 ' + b.item);
    if (x.blanks) return `<div class="ex"><div class="exh">예시 · ${esc(x.title)} <i>${esc(x.id)}</i></div><p>${esc(x.passage)}</p>${x.blanks.map((k) => `<div class="ans"><b>${esc(k.mark)}</b> ${k.answers.slice(0, 2).map(esc).join(' / ')}</div>`).join('')}</div>`;
    return `<div class="ex"><div class="exh">예시 · ${esc(x.title)} <i>${esc(x.id)}</i></div>${b.showData && x.data ? `<ul class="data">${x.data.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}<p class="mdl">${nl(b.model === false ? '' : x.model)}</p></div>`;
  }
  throw new Error('모르는 블록 ' + b.t);
};
const pages = H.pages.map((p, i) => `<section class="pg"><header><span>${esc(H.series)}</span><span>${esc(H.title)}</span></header>${p.map(block).join('')}<footer>${i + 1} / ${H.pages.length} · ${esc(H.footer)}</footer></section>`).join('');
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:'Pretendard','Noto Sans CJK KR','Noto Sans KR','Malgun Gothic',sans-serif;color:#17202e;font-size:10.2pt;line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{position:relative;width:210mm;height:297mm;padding:15mm 15mm 16mm;page-break-after:always;overflow:hidden}.pg:last-child{page-break-after:auto}
header{display:flex;justify-content:space-between;font-size:7.8pt;letter-spacing:.06em;color:#6b7893;border-bottom:.3mm solid #1f3a68;padding-bottom:2mm;margin-bottom:5mm}
footer{position:absolute;left:15mm;right:15mm;bottom:8mm;text-align:center;font-size:7.6pt;color:#8a93a6}
h1{font-size:20pt;margin:2mm 0 1mm;color:#1f3a68}h1+p{margin:0 0 4mm;color:#5a6780}
h2{font-size:12.2pt;margin:4.2mm 0 1.8mm;color:#1f3a68;border-left:1.1mm solid #1f3a68;padding-left:2.4mm}h2 small{font-weight:500;font-size:8pt;color:#8a93a6;margin-left:2mm}
p{margin:0 0 2mm}ul,ol{margin:0 0 2mm;padding-left:5mm}li{margin:.4mm 0}
table{width:100%;border-collapse:collapse;margin:1mm 0 2.6mm;font-size:9.2pt}th{background:#eef2f8;color:#1f3a68;text-align:left;padding:1.4mm 2mm;border:.25mm solid #c5cfdf}td{padding:1.3mm 2mm;border:.25mm solid #d6dce8;vertical-align:top}
.box{border:.35mm solid #1f3a68;border-radius:1.6mm;padding:2.2mm 3mm;margin:2mm 0 2.6mm;background:#f7f9fd}.box>b{display:block;color:#1f3a68;font-size:9.6pt;margin-bottom:.8mm}.box ul{margin:0;padding-left:4.5mm}
.box.warn{border-color:#b0452b;background:#fdf6f3}.box.warn>b{color:#b0452b}
.ex{border:.25mm dashed #9aa7bf;padding:2.2mm 3mm;margin:2mm 0 2.6mm;border-radius:1.6mm}.exh{font-weight:700;font-size:9pt;color:#1f3a68;margin-bottom:1mm}.exh i{font-style:normal;color:#9aa7bf;font-weight:500;font-size:7.4pt;margin-left:2mm}
.ans{margin:.6mm 0;color:#1f3a68}.mdl{font-size:9.4pt;line-height:1.7}.data{margin:0 0 1.4mm 4mm;font-size:8.8pt;color:#44506a}
.small{font-size:8.4pt;color:#5a6780}.steps li{margin:.8mm 0}
</style></head><body>${pages}</body></html>`;
fs.mkdirSync(outDir, { recursive: true });
const { chromium } = await import(PW);
const browser = await chromium.launch({ executablePath: CHROMIUM });
const pg = await browser.newPage();
await pg.setContent(html, { waitUntil: 'load' });
const file = path.join(outDir, `${H.file}.pdf`);
await pg.pdf({ path: file, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log(`핸드아웃 ${id}: ${H.pages.length}쪽 → ${file}`);
