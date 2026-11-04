#!/usr/bin/env node
/* 조사 블록 자료(docs/books/<책>.blocks.json) 검사 — 블록을 합친 글 = ko, 역할 이름, 개수, 정답 하나, 줄표, 겹치는 문장.
   단원 종류별(pt-* 조사 하나 · ct-* 비교 · rv-* 종합)로 모양이 다르다. 지시 docs/antigravity/antigravity-particles-blocks-task.md · …-ct-rv-task.md
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
const norm = (x) => String(x).replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim();
/* 낱말 블록(t) 사이는 띄고, 조사 블록(p)은 앞 낱말에 붙인다. fix 의 틀린 블록은 right 로 바꿔 합친다 */
const join = (bl) => bl.map((b, i) => (b.p != null ? (b.wrong ? b.right : b.p) : (i ? ' ' : '') + b.t)).join('').replace(/^\s+/, '');
const chk = (u, w, bl, ko) => {
  bl.forEach((b, i) => { if ((b.t == null) === (b.p == null)) err.push(`${u} ${w}[${i}]: t 와 p 중 하나만`); if (!ROLES.has(b.role)) err.push(`${u} ${w}[${i}]: 역할 「${b.role}」 목록에 없다`); if (b.p != null && b.role.indexOf('조사') < 0) err.push(`${u} ${w}[${i}]: 조사 블록의 역할은 …조사`); if (b.p != null && (i === 0 || bl[i - 1].p != null)) err.push(`${u} ${w}[${i}]: 조사 블록 앞에는 낱말 블록`); });
  const got = join(bl), want = norm(ko); if (got !== want) err.push(`${u} ${w}: 합친 글 「${got}」 ≠ ko 「${want}」`);
};
const opt = (u, w, q) => { if (!(q.opts?.length >= 2 && q.opts.length <= 4)) err.push(`${u} ${w}: 보기 2~4`); if (!Number.isInteger(q.answer) || q.answer < 1 || q.answer > (q.opts?.length || 0)) err.push(`${u} ${w}: answer 번호`); if (new Set(q.opts).size !== q.opts?.length) err.push(`${u} ${w}: 보기 중복`); if (!q.why) err.push(`${u} ${w}: why`); };
const fillChk = (u, w, q, pool, max) => { const bl = q.blocks || []; const nb = bl.filter((b) => b.blank).length; if (nb < 1 || nb > max) err.push(`${u} ${w}: 비운 블록 1~${max}개`); chk(u, w, bl, q.ko || ''); bl.filter((b) => b.blank).forEach((b) => { if (pool && !pool.includes(b.p)) err.push(`${u} ${w}: 정답 「${b.p}」 이 pool 에 없다`); }); };
const dupes = (u, all) => { const dup = all.filter((x, i) => all.indexOf(x) !== i); if (dup.length) err.push(`${u}: 겹치는 문장 ${dup.join(' | ')}`); };

function checkPt(u, d) {
  if (!(d.cards?.length >= 4 && d.cards.length <= 5)) err.push(`${u}: cards 4~5장`);
  d.cards?.forEach((c, i) => { if (!/\{[^}]+\}/.test(c.ko)) err.push(`${u} cards[${i}]: {조사} 표시 없음`); if (!c.tag?.ko || !c.tag?.en || !c.when || !c.en) err.push(`${u} cards[${i}]: tag/when/en`); });
  if (d.split?.length !== 4) err.push(`${u}: split 4개`);
  d.split?.forEach((r, i) => { if (!(r.blocks?.length >= 3 && r.blocks.length <= 7)) err.push(`${u} split[${i}]: 블록 3~7개`); if (!r.blocks?.some((b) => b.p != null)) err.push(`${u} split[${i}]: 조사 블록 없음`); chk(u, `split[${i}]`, r.blocks || [], r.ko || ''); });
  if (d.choose?.length !== 4) err.push(`${u}: choose 4개`);
  d.choose?.forEach((q, i) => { if (!/_{3}/.test(q.q)) err.push(`${u} choose[${i}]: ___ 없음`); opt(u, `choose[${i}]`, q); if (!q.en) err.push(`${u} choose[${i}]: en`); });
  if (d.fill?.length !== 3) err.push(`${u}: fill 3개`);
  d.fill?.forEach((q, i) => fillChk(u, `fill[${i}]`, q, d.pool, 1));
  if (d.pool?.length !== 4) err.push(`${u}: pool 4개`);
  dupes(u, [...(d.cards || []).map((c) => c.ko.replace(/[{}]/g, '').split('\n')).flat(), ...(d.split || []).map((r) => r.ko), ...(d.fill || []).map((q) => q.ko)]);
}
function checkCt(u, d) {
  if (d.compare?.length !== 3) err.push(`${u}: compare 3개`);
  d.compare?.forEach((c, i) => {
    if (!c.title?.ko) err.push(`${u} compare[${i}]: title.ko`);
    if (!(c.sides?.length >= 2 && c.sides.length <= 3)) err.push(`${u} compare[${i}]: sides 2~3개`);
    c.sides?.forEach((sd, j) => { const w = `compare[${i}].sides[${j}]`; if (!sd.label || !sd.chip || !sd.mean || !sd.en) err.push(`${u} ${w}: label/chip/mean/en`); if (!sd.blocks?.some((b) => b.p != null)) err.push(`${u} ${w}: 조사 블록 없음`); chk(u, w, sd.blocks || [], sd.ko || ''); });
  });
  if (!d.rule?.ko || !d.rule?.en) err.push(`${u}: rule.ko/en`);
  if (d.situations?.length !== 4) err.push(`${u}: situations 4개`);
  d.situations?.forEach((q, i) => { if (!q.ctx || !q.q) err.push(`${u} situations[${i}]: ctx/q`); opt(u, `situations[${i}]`, q); });
  if (d.fill2?.length !== 2) err.push(`${u}: fill2 2개`);
  d.fill2?.forEach((q, i) => fillChk(u, `fill2[${i}]`, q, d.pool, 2));
  if (!d.fill2?.some((q) => q.blocks?.filter((b) => b.blank).length === 2)) err.push(`${u}: fill2 에 비운 블록 2개짜리가 하나는 있어야 한다`);
  if (d.pool?.length !== 4) err.push(`${u}: pool 4개`);
  if (!d.explain?.q || !d.explain?.en) err.push(`${u}: explain.q/en`); else opt(u, 'explain', d.explain);
  dupes(u, [...(d.compare || []).flatMap((c) => (c.sides || []).map((sd) => sd.ko)), ...(d.fill2 || []).map((q) => q.ko)]);
}
function checkRv(u, d) {
  if (d.choose?.length !== 6) err.push(`${u}: choose 6개`);
  d.choose?.forEach((q, i) => { if (!/_{3}/.test(q.q)) err.push(`${u} choose[${i}]: ___ 없음`); opt(u, `choose[${i}]`, q); if (!q.en) err.push(`${u} choose[${i}]: en`); });
  if (d.fix?.length !== 4) err.push(`${u}: fix 4개`);
  d.fix?.forEach((q, i) => { const w = d.fix[i].blocks?.filter((b) => b.wrong) || []; if (w.length !== 1) err.push(`${u} fix[${i}]: wrong 블록 하나`); w.forEach((b) => { if (b.p == null || !b.right || b.right === b.p) err.push(`${u} fix[${i}]: right 가 없거나 틀린 글자와 같다`); }); if (!q.en) err.push(`${u} fix[${i}]: en`); chk(u, `fix[${i}]`, q.blocks || [], q.ko || ''); });
  if (d.fill?.length !== 4) err.push(`${u}: fill 4개`);
  d.fill?.forEach((q, i) => fillChk(u, `fill[${i}]`, q, d.pool, 2));
  if (d.pool?.length !== 4) err.push(`${u}: pool 4개`);
  /* 한 조사가 고르기 정답 · 고쳐 쓰기 정답 · 채우기 정답 합쳐 4번을 넘지 않게 */
  const cnt = {}; const add = (g) => { cnt[g] = (cnt[g] || 0) + 1; };
  d.choose?.forEach((q) => String(q.opts?.[q.answer - 1] ?? '').split(' · ').forEach(add));
  d.fix?.forEach((q) => q.blocks?.filter((b) => b.wrong).forEach((b) => add(b.right)));
  d.fill?.forEach((q) => q.blocks?.filter((b) => b.blank).forEach((b) => add(b.p)));
  for (const [g, c] of Object.entries(cnt)) if (c > 4) err.push(`${u}: 조사 「${g}」 정답이 ${c}번(4번 이하)`);
  dupes(u, [...(d.choose || []).map((q) => q.q), ...(d.fix || []).map((q) => q.ko), ...(d.fill || []).map((q) => q.ko)]);
}
for (const [u, d] of Object.entries(D)) {
  if (u.startsWith('_')) continue; n++;
  if (!units.has(u)) { err.push(`${u}: 책에 없는 단원`); continue; }
  if (u.startsWith('ct-')) checkCt(u, d); else if (u.startsWith('rv-')) checkRv(u, d); else checkPt(u, d);
  if (/—/.test(JSON.stringify(d))) err.push(`${u}: 줄표(—) 금지`);
}
if (err.length) { console.error(err.map((e) => '✘ ' + e).join('\n')); console.error(`\n조사 블록 검사 실패 ${err.length}건`); process.exit(1); }
console.log(`조사 블록 ${n}단원 · 문제 없음`);
