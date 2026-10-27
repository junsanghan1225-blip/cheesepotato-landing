// 책 한 권의 무료 샘플 PDF 를 만든다(운영자 2026-10-27 「책마다 무료 샘플 단원 PDF」).
// 완성본 PDF(파는 파일 — 저장소에 없음)의 앞쪽 몇 쪽(표지 · 머리말 · 목차 · 앞 단원)을 잘라 붙이고, 맨 끝에 「샘플 끝 · 전체 책 안내」 쪽을 더한다.
// 샘플은 누구나 받는 파일이라 assets/books/<id>/sample.pdf 로 저장소에 둔다.
//   node tools/make-sample.mjs <책 id> --pdf <완성본.pdf> --end <샘플로 쓸 마지막 쪽 번호(표지가 1쪽)>
// 어느 쪽에서 자를지는 단원 경계에서(단원 중간에서 끊지 않는다) — 완성본에서 `pdftotext -f N -l N` 으로 「UNIT 03」 같은 머리글이 처음 나오는 쪽 바로 앞.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const a = process.argv.slice(2);
const opt = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : null; };
const id = a.find((x) => !x.startsWith('--') && x !== opt('--pdf') && x !== opt('--end'));
const pdf = opt('--pdf');
const end = Number(opt('--end'));
if (!id || !pdf || !(end >= 3)) { console.error('쓰는 법: node tools/make-sample.mjs <책 id> --pdf <완성본.pdf> --end <마지막 쪽>'); process.exit(1); }

const shop = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/shop.json'), 'utf8'));
const book = shop.books.find((b) => b.id === id);
if (!book) { console.error(`docs/shop.json 에 「${id}」 이(가) 없다`); process.exit(1); }
const total = Number(/Pages:\s+(\d+)/.exec(execFileSync('pdfinfo', [pdf], { encoding: 'utf8' }))[1]);
if (end >= total) { console.error(`--end ${end} 가 전체 쪽수(${total})보다 크거나 같다`); process.exit(1); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sample-'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const color = book.color || '#E8642C';
const html = `<!doctype html><meta charset="utf-8"><style>
@page{size:182mm 257mm;margin:0}*{box-sizing:border-box}html,body{margin:0}
body{width:182mm;height:257mm;font-family:Pretendard,'Noto Sans KR','Noto Sans CJK KR',system-ui,sans-serif;color:#1B1512;background:#FFF8EE;display:flex;flex-direction:column;justify-content:center;padding:0 22mm}
.k{font-size:11pt;font-weight:800;letter-spacing:.14em;color:${color}}h1{font-size:30pt;line-height:1.2;margin:8mm 0 4mm}h2{font-size:15pt;margin:0 0 12mm;font-weight:600;color:#6B5844}
p{font-size:13pt;line-height:1.6;margin:0 0 5mm}.u{display:inline-block;margin-top:6mm;padding:4mm 7mm;background:${color};color:#fff;border-radius:3mm;font-weight:800;font-size:15pt}
.f{margin-top:14mm;font-size:10pt;color:#8C7A66}</style>
<div class="k">FREE SAMPLE · 무료 샘플</div>
<h1>${esc(book.title.en)}</h1><h2>${esc(book.title.ko)}</h2>
<p>You have reached the end of the free sample. It shows the cover, the front matter and the first units exactly as they are in the book.</p>
<p>샘플은 여기까지예요. 표지 · 머리말 · 앞 단원이 실제 책과 똑같이 들어 있습니다.</p>
<p>The full PDF includes every unit and the answer key. It is instant download after payment.</p>
<div class="u">everykoreans.com/shop/${esc(id)}/</div>
<div class="f">© ${esc(shop.publisher.en)} · ${esc(shop.publisher.ko)}</div>`;
fs.writeFileSync(path.join(tmp, 'end.html'), html);
const PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs';
const { chromium } = await import(PW);
const br = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const pg = await br.newPage();
await pg.goto('file://' + path.join(tmp, 'end.html'));
await pg.pdf({ path: path.join(tmp, 'end.pdf'), width: '182mm', height: '257mm', printBackground: true });
await br.close();

const out = path.join(ROOT, `assets/books/${id}/sample.pdf`);
fs.mkdirSync(path.dirname(out), { recursive: true });
/* 쪽을 잘라 붙이면서 안 쓰는 글꼴 · 그림을 버린다(pdfseparate 로 자르면 쪽마다 자원이 통째로 남아 10MB 가 넘는다) — PyMuPDF */
execFileSync('python3', ['-W', 'ignore', '-c', `
import sys, fitz
src, endpdf, out, n = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
d = fitz.open(src); d.select(list(range(n)))
e = fitz.open(endpdf); d.insert_pdf(e)
d.set_metadata({'title': sys.argv[5], 'author': sys.argv[6], 'subject': 'Free sample'})
d.save(out, garbage=4, deflate=True, clean=True)
`, pdf, path.join(tmp, 'end.pdf'), out, String(end), `${book.title.en} — free sample`, shop.publisher.en]);
fs.rmSync(tmp, { recursive: true, force: true });
/* 책 쪽 · 학습지 쪽이 샘플 상자를 보이도록 docs/shop.json 에 적는다(샘플 쪽수 = 잘라 온 쪽 + 안내 쪽) */
book.sample = { pages: end + 1 };
fs.writeFileSync(path.join(ROOT, 'docs/shop.json'), JSON.stringify(shop, null, 1) + '\n');
console.log(`${id}: 샘플 ${end}쪽 + 안내 1쪽 (전체 ${total}쪽 중) → assets/books/${id}/sample.pdf (${(fs.statSync(out).size / 1048576).toFixed(1)}MB)`);
