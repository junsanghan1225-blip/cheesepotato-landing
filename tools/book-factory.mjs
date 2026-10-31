#!/usr/bin/env node
/* 책 공장 — 책 한 권을 같은 순서로 찍어 낸다(운영자 2026-10-31 「공장처럼 일정하게」).
   node tools/book-factory.mjs <책 id> [--krw 13,900] [--out 폴더]      한 권
   node tools/book-factory.mjs --all [--out 폴더]   (--skip-build: 이미 만든 PDF 로 검사 · 포장만)                        장부(docs/ops/book-ledger.json)의 모든 책
   순서: ① 책 PDF 만들기(예스24판) → ② 최종 검수 자동 검사(tools/check-book-pdf.mjs) → ③ 표지 1500px JPG → ④ ISBN 이름으로 모아 zip → ⑤ 검수 보고서 · 장부 갱신.
   FAIL 이 있으면 zip 을 만들지 않고 멈춘다(고쳐서 다시). 결과물은 저장소에 올리지 않는다(books-out/factory/). */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkBookPdf, reportMd } from './check-book-pdf.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const LEDGER = path.join(ROOT, 'docs/ops/book-ledger.json');
const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
const OUT = path.resolve(opt('--out', path.join(ROOT, 'books-out/factory')));
const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

function make(id, krwArg) {
  const L = ledger.books[id]; if (!L) throw new Error(`장부에 없는 책: ${id}`);
  const krw = krwArg || L.krw; if (!krw) throw new Error(`${id}: 정가(krw)가 없다`);
  const B = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8'));
  const isbn = B.isbn.replace(/-/g, ''), dir = path.join(OUT, id); fs.mkdirSync(dir, { recursive: true });
  console.log(`\n■ ${id} (${B.title.ko}) — 정가 ${krw}원`);
  const book = path.join(dir, id), pdf = path.join(book, 'interior.pdf');
  if (args.includes('--skip-build') && fs.existsSync(pdf)) console.log('① 이미 만든 PDF 를 쓴다(--skip-build)');
  else { console.log('① 책 PDF 만들기…'); execFileSync('node', [path.join(ROOT, 'tools/build-book.mjs'), id, '--digital', '--yes24', '--krw', krw, '--out', dir], { stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 1 << 28 }); }
  console.log('② 최종 검수 자동 검사…');
  const r = checkBookPdf(id, pdf, { krw });
  for (const [s, n, d] of r.res) if (s !== 'PASS') console.log(`   ${s} ${n} — ${d}`);
  fs.writeFileSync(path.join(dir, '검수보고서.md'), reportMd(id, r));
  L.qa = r.failed ? 'FAIL' : r.warned ? `통과(주의 ${r.warned})` : '통과'; L.pages = r.pages; L.date = date;
  if (r.failed) { fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 1) + '\n'); throw new Error(`${id}: 검사 FAIL ${r.failed}개 — 고친 뒤 다시 돌린다(${path.join(dir, '검수보고서.md')})`); }
  console.log('③ 표지 · 파일 모으기…');
  const pack = path.join(dir, 'files'); fs.rmSync(pack, { recursive: true, force: true }); fs.mkdirSync(pack, { recursive: true });
  fs.copyFileSync(pdf, path.join(pack, `${isbn}.pdf`));
  execFileSync('convert', [path.join(book, 'front-cover-hires.jpg'), '-resize', '1500x', '-quality', '90', path.join(pack, `${isbn}_cover.jpg`)]);
  L.ver = (L.ver || 0) + 1;
  const name = `에브리코리안즈_예스24_${B.title.ko.replace(/[\s·:~]/g, '')}_v${L.ver}_${date}.zip`;
  console.log('④ zip…');
  const zip = path.join(dir, name); fs.rmSync(zip, { force: true });
  execFileSync('zip', ['-q', '-j', zip, path.join(pack, `${isbn}.pdf`), path.join(pack, `${isbn}_cover.jpg`)]);
  fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 1) + '\n');
  console.log(`✔ ${name} · ${r.pages}쪽 · ${(fs.statSync(zip).size / 1048576).toFixed(1)}MB · 검사 ${L.qa}`);
  return { id, zip, qa: L.qa };
}

const ids = args.includes('--all') ? Object.keys(ledger.books) : [args.find((a) => !a.startsWith('--') && a !== opt('--krw') && a !== opt('--out'))].filter(Boolean);
if (!ids.length) { console.error('쓰는 법: node tools/book-factory.mjs <책 id> [--krw 13,900]  |  --all'); process.exit(1); }
const done = [], failed = [];
for (const id of ids) { try { done.push(make(id, ids.length === 1 ? opt('--krw') : '')); } catch (e) { console.error(`✘ ${e.message}`); failed.push(id); } }
console.log(`\n=== 공장 결과: 완성 ${done.length}권 · 막힘 ${failed.length}권${failed.length ? ' (' + failed.join(', ') + ')' : ''} ===`);
process.exit(failed.length ? 1 : 0);
