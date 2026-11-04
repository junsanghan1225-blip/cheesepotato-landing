#!/usr/bin/env node
/* 조사 블록 자료(docs/books/<책>.blocks.json) 검사 — 블록을 합친 글 = ko, 역할 이름, 개수, 정답 하나, 줄표, 겹치는 문장.
   쓰는 법: node tools/check-particles-blocks.mjs [책 id=particles-workbook] */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2] || 'particles-workbook';
const book = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${id}.json`), 'utf8'));
const f = path.join(ROOT, `docs/books/${id}.blocks.json`);
if (!fs.existsSync(f)) { console.log('blocks 파일 없음 — 건너뜀'); process.exit(0); }
const D = JSON.parse(fs.readFileSync(f, 'utf8'));
const ROLES = new Set(['주어 말', '주제 말', '목적어 말', '장소', '때', '사람', '도구', '이유', '수 · 양', '서술어', '부사', '감탄', '이어 주는 말', '나', '말', '주어 조사', '주제 조사', '목적 조사', '장소 조사', '방향 조사', '함께 조사', '도구 조사', '비교 조사', '조사']);
const units = new Set(book.parts.flatMap((p) => p.units));
const err = []; let n = 0;
const join = (bl) => bl.map((b, i) => (b.p != null ? b.p : (i ? ' ' : '') + b.t)).join('').replace(/^\s+/, '');
const chk = (u, w, bl, ko) => {
  bl.forEach((b, i) => { if ((b.t == null) === (b.p == null)) err.push(`${u} ${w}[${i}]: t 와 p 중 하나만`); if (!ROLES.has(b.role)) err.push(`${u} ${w}[${i}]: 역할 「${b.role}」 목록에 없다`); if (b.p != null && b.role.indexOf('조사') < 0) err.push(`${u} ${w}[${i}]: 조사 블록의 역할은 …조사`); if (b.p != null && (i === 0 || bl[i - 1].p != null)) err.push(`${u} ${w}[${i}]: 조사 블록 앞에는 낱말 블록`); });
  const got = join(bl), want = ko.replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim(); if (got !== want) err.push(`${u} ${w}: 합친 글 「${got}」 ≠ ko 「${want}」`);
};
for (const [u, d] of Object.entries(D)) {
  if (u.startsWith('_')) continue; n++;
  if (!units.has(u)) { err.push(`${u}: 책에 없는 단원`); continue; }
  if (!(d.cards?.length >= 4 && d.cards.length <= 5)) err.push(`${u}: cards 4~5장`);
  d.cards?.forEach((c, i) => { if (!/\{[^}]+\}/.test(c.ko)) err.push(`${u} cards[${i}]: {조사} 표시 없음`); if (!c.tag?.ko || !c.tag?.en || !c.when || !c.en) err.push(`${u} cards[${i}]: tag/when/en`); });
  if (d.split?.length !== 4) err.push(`${u}: split 4개`);
  d.split?.forEach((r, i) => { if (!(r.blocks?.length >= 3 && r.blocks.length <= 7)) err.push(`${u} split[${i}]: 블록 3~7개`); if (!r.blocks?.some((b) => b.p != null)) err.push(`${u} split[${i}]: 조사 블록 없음`); chk(u, `split[${i}]`, r.blocks || [], r.ko || ''); });
  if (d.choose?.length !== 4) err.push(`${u}: choose 4개`);
  d.choose?.forEach((q, i) => { if (!/_{3}/.test(q.q)) err.push(`${u} choose[${i}]: ___ 없음`); if (!(q.opts?.length >= 2 && q.opts.length <= 4)) err.push(`${u} choose[${i}]: 보기 2~4`); if (!Number.isInteger(q.answer) || q.answer < 1 || q.answer > (q.opts?.length || 0)) err.push(`${u} choose[${i}]: answer 번호`); if (new Set(q.opts).size !== q.opts?.length) err.push(`${u} choose[${i}]: 보기 중복`); if (!q.why || !q.en) err.push(`${u} choose[${i}]: why/en`); });
  if (d.fill?.length !== 3) err.push(`${u}: fill 3개`);
  d.fill?.forEach((q, i) => { const bl = q.blocks || []; if (bl.filter((b) => b.blank).length !== 1) err.push(`${u} fill[${i}]: 비운 블록 하나`); chk(u, `fill[${i}]`, bl, q.ko || ''); if (d.pool && !d.pool.includes(bl.find((b) => b.blank)?.p)) err.push(`${u} fill[${i}]: 정답이 pool 에 없다`); });
  if (d.pool?.length !== 4) err.push(`${u}: pool 4개`);
  const all = [...(d.cards || []).map((c) => c.ko.replace(/[{}]/g, '').split('\n')).flat(), ...(d.split || []).map((r) => r.ko), ...(d.fill || []).map((q) => q.ko)];
  const dup = all.filter((x, i) => all.indexOf(x) !== i); if (dup.length) err.push(`${u}: 겹치는 문장 ${dup.join(' | ')}`);
  if (/—/.test(JSON.stringify(d))) err.push(`${u}: 줄표(—) 금지`);
}
if (err.length) { console.error(err.map((e) => '✘ ' + e).join('\n')); console.error(`\n조사 블록 검사 실패 ${err.length}건`); process.exit(1); }
console.log(`조사 블록 ${n}단원 · 문제 없음`);
