#!/usr/bin/env node
/* 책 PDF 최종 검수 자동 검사 — 출판사의 교정 · 인쇄 전 점검(프리플라이트)을 도구로(운영자 2026-10-31 「출판사가 하는 방식을 도구로 · 공장처럼」).
   node tools/check-book-pdf.mjs <책 id> <interior.pdf> [--krw 13,900]      FAIL 이 있으면 종료 코드 1.
   사람이 눈으로 보는 검수(그림 · 문장)는 이 도구가 대신하지 않는다 — 기계로 잡히는 것(판형 · 글꼴 · 제목 · 정가 · 번호 · 목차 · 링크 · 넘침 · 빈 쪽 · 금지 글자)만. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export function checkBookPdf(id, pdf, { krw = '' } = {}) {
  const B = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8'));
  const sh = (c, a) => execFileSync(c, a, { maxBuffer: 1 << 28 }).toString();
  const res = [];   // [상태, 이름, 설명]
  const ok = (n, d = '') => res.push(['PASS', n, d]), warn = (n, d) => res.push(['WARN', n, d]), bad = (n, d) => res.push(['FAIL', n, d]);
  const info = sh('pdfinfo', [pdf]);
  const pages = Number(/Pages:\s+(\d+)/.exec(info)[1]);
  const pageTxt = (p) => sh('pdftotext', ['-f', String(p), '-l', String(p), '-layout', pdf, '-']);
  const all = sh('pdftotext', [pdf, '-']);
  const per = Array.from({ length: pages }, (_, i) => pageTxt(i + 1));

  // 1 판형
  const m = /Page size:\s+([\d.]+) x ([\d.]+) pts/.exec(info);
  const want = [B.trim.w * 72 / 25.4, B.trim.h * 72 / 25.4];
  if (m && Math.abs(m[1] - want[0]) < 2 && Math.abs(m[2] - want[1]) < 2) ok('판형', `${B.trim.w}×${B.trim.h}mm`); else bad('판형', `PDF ${m ? m[1] + '×' + m[2] : '?'}pt, 책 틀 ${want.map((x) => x.toFixed(0)).join('×')}pt`);
  // 2 제목 정보
  const title = (/Title:\s+(.*)/.exec(info) || [])[1] || '';
  if (title.includes(B.title.ko.slice(0, 6))) ok('PDF 제목 정보', title.slice(0, 40)); else bad('PDF 제목 정보', `「${title}」 — 책 제목이어야 한다`);
  // 3 글꼴 내장
  const noEmb = sh('pdffonts', [pdf]).split('\n').slice(2).filter((l) => l.trim() && !/\byes\s+(yes|no)\s+(yes|no)\s+\d+/.test(l));
  if (!noEmb.length) ok('글꼴 내장'); else bad('글꼴 내장', `내장 안 된 글꼴 ${noEmb.length}개: ${noEmb[0].slice(0, 50)}`);
  // 4 금지 글자
  const forb = ['undefined', 'NaN', '[object', 'continued', 'TODO', 'localhost', '—', 'Practice in pencil', 'App score'].filter((w) => all.includes(w));
  if (!forb.length) ok('금지 글자 없음'); else bad('금지 글자', forb.join(', '));
  const boxes = (all.match(/☐/g) || []).length;
  if (!boxes) ok('체크 칸(☐) 없음'); else warn('체크 칸(☐)', `${boxes}개 — 전자책에는 보통 뺀다`);
  // 5 ISBN · 정가 · 발행일
  const isbn = B.isbn.replace(/-/g, ''), hasIsbn = all.replace(/-/g, '').includes(isbn);
  if (hasIsbn) ok('ISBN', B.isbn); else bad('ISBN', `${B.isbn} 이(가) 판권쪽에 없다`);
  if (krw) { if (all.includes(`${krw}원`)) ok('정가', `${krw}원`); else bad('정가', `${krw}원 이(가) 판권쪽 · 뒷표지에 없다`); }
  if (/발행\s*20\d\d\.\d\d\.\d\d/.test(all)) ok('발행일', (/발행\s*(20\d\d\.\d\d\.\d\d)/.exec(all) || [])[1]); else warn('발행일', '판권쪽에 발행일이 없다');
  // 6 TOPIK 면책
  if (/TOPIK/i.test(B.title.en + B.title.ko)) { if (all.includes('국립국제교육원')) ok('TOPIK 면책 문구'); else bad('TOPIK 면책 문구', '「국립국제교육원 …」 문구가 없다'); }
  // 7 목차 쪽 번호 ↔ 실제
  const toc = /Answer Key\s+정답\s+(\d+)/.exec(per.slice(0, 12).join('\n'));   // 목차는 줄 맞춤(-layout) 글에서 읽는다
  if (toc) { const real = per.findIndex((t, i) => i > 8 && /^\s*Answer Key\s*$/m.test(t)) + 1; if (real && Number(toc[1]) === real) ok('목차 쪽 번호', `정답 ${real}쪽`); else bad('목차 쪽 번호', `목차 ${toc[1]}쪽 ↔ 실제 ${real || '못 찾음'}쪽`); } else warn('목차 쪽 번호', '정답 줄을 못 찾음');
  // 8 QR · 주소가 실제 있는 쪽인지
  const urls = [...new Set((all.match(/everykoreans\.com\/[A-Za-z0-9_./-]+/g) || []))].map((u) => u.replace('everykoreans.com/', '').replace(/\/$/, ''));
  const miss = urls.filter((d) => d && !['', '.html'].includes(d) && !(fs.existsSync(path.join(ROOT, d)) || fs.existsSync(path.join(ROOT, d + '.html'))));
  if (!miss.length) ok('QR · 주소', `${urls.length}개 모두 있음`); else bad('QR · 주소', `없는 쪽 ${miss.length}개: ${miss.slice(0, 3).join(', ')}`);
  // 9 빈 쪽
  const blank = per.map((t, i) => [i + 1, t.replace(/\s/g, '').length]).filter(([p, n]) => n < 60 && p < pages - 1);
  if (!blank.length) ok('빈 쪽 없음'); else warn('거의 빈 쪽', blank.map(([p, n]) => `${p}(${n}자)`).join(' ') + ' — 표지 · 구분 쪽이면 괜찮다');
  // 10 쓰기 책: 점검 상자가 문제와 다른 쪽으로 넘어갔는지
  if (B.front === '5354') { const sp = per.map((t, i) => [i + 1, t]).filter(([, t]) => t.includes('몇 자') && !/실전 문제\s+\d/.test(t)).map(([p]) => p); if (!sp.length) ok('문제 쪽 넘침 없음'); else bad('문제 쪽 넘침', `점검 상자만 따로 있는 쪽: ${sp.join(', ')}`); }
  // 11 크기
  const mb = fs.statSync(pdf).size / 1048576;
  if (mb < 40) ok('파일 크기', `${mb.toFixed(1)}MB`); else warn('파일 크기', `${mb.toFixed(1)}MB — 예스24 업로드 한도 확인`);
  return { pages, mb, res, failed: res.filter((r) => r[0] === 'FAIL').length, warned: res.filter((r) => r[0] === 'WARN').length };
}
export const reportMd = (id, r) => `# 최종 검수 자동 검사 — ${id}\n\n쪽수 ${r.pages} · ${r.mb.toFixed(1)}MB · FAIL ${r.failed} · WARN ${r.warned}\n\n| 결과 | 항목 | 내용 |\n|---|---|---|\n${r.res.map(([s, n, d]) => `| ${s} | ${n} | ${d} |`).join('\n')}\n\n※ 그림 · 문장은 사람이 눈으로 본다(운영자 검수).\n`;

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [id, pdf] = process.argv.slice(2);
  const i = process.argv.indexOf('--krw'), krw = i > 0 ? process.argv[i + 1] : '';
  if (!id || !pdf) { console.error('쓰는 법: node tools/check-book-pdf.mjs <책 id> <interior.pdf> [--krw 13,900]'); process.exit(1); }
  const r = checkBookPdf(id, path.resolve(pdf), { krw });
  for (const [s, n, d] of r.res) console.log(`${s.padEnd(4)} ${n}${d ? ' — ' + d : ''}`);
  console.log(`\n${id}: ${r.pages}쪽 · FAIL ${r.failed} · WARN ${r.warned}`);
  process.exit(r.failed ? 1 : 0);
}
