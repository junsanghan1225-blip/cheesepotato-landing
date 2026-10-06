#!/usr/bin/env node
/* 번역 연습(영어 → 한국어, 한 줄씩) — docs/translate.json → translate.js (운영자 요청 2026-10-06).
   글 한 편(set) = 같은 장면의 줄 4~10개. 줄마다 영어 en · 맞는 한국어 ko[](여럿 — 첫째가 모범 답) · 힌트 hint · 문법 g(있으면).
   단계 tier: beginner · intermediate · advanced.
   node tools/build-translate.mjs          만들기
   node tools/build-translate.mjs --check  모양 검사 + translate.js 가 원본과 같은지(CI) */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(readFileSync(join(ROOT, 'docs/translate.json'), 'utf8'));
const { SB_CATS } = await import(join(ROOT, 'sentences.js'));
const gids = new Set(SB_CATS.flatMap((c) => c.points.map((p) => p.id)));
const TIERS = ['beginner', 'intermediate', 'advanced'];
const bad = [], ids = new Set();
for (const [i, s] of (src.sets || []).entries()) {
  const at = `sets[${i}] ${s?.id || ''}`;
  if (!s?.id || !/^[a-z0-9-]+$/.test(s.id)) bad.push(`${at}: id 는 영문 소문자 · 숫자 · -`);
  if (ids.has(s.id)) bad.push(`${at}: id 가 겹친다`); ids.add(s.id);
  if (!TIERS.includes(s.tier)) bad.push(`${at}: tier 는 ${TIERS.join(' · ')}`);
  if (!s.title?.ko || !s.title?.en) bad.push(`${at}: title.ko · title.en`);
  if (!Array.isArray(s.lines) || s.lines.length < 4 || s.lines.length > 10) bad.push(`${at}: 줄은 4~10개`);
  for (const [j, l] of (s.lines || []).entries()) {
    const lt = `${at} 줄 ${j + 1}`;
    if (!l.en || /[가-힣]/.test(l.en)) bad.push(`${lt}: en 은 영어만`);
    if (!Array.isArray(l.ko) || !l.ko.length || l.ko.some((k) => !/[가-힣]/.test(k) || /[A-Za-z]{3,}/.test(k))) bad.push(`${lt}: ko 는 한국어 답 1개 이상(영어 섞지 않기)`);
    if (l.g && !gids.has(l.g)) bad.push(`${lt}: 없는 문법 id ${l.g}`);
    for (const k of Object.keys(l)) if (!['en', 'ko', 'hint', 'g', 'note'].includes(k)) bad.push(`${lt}: 모르는 칸 ${k}`);
    if (l.note) bad.push(`${lt}: note(운영자 확인)가 남아 있다 — 확인하고 지울 것`);
  }
}
if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
const sets = src.sets.map(({ id, tier, title, lines }) => ({ id, tier, title, lines: lines.map(({ en, ko, hint, g }) => ({ en, ko, ...(hint ? { hint } : {}), ...(g ? { g } : {}) })) }));
const n = sets.reduce((a, s) => a + s.lines.length, 0);
const js = `/* 번역 연습(영어 → 한국어) — 생성물, 손으로 고치지 말 것.
 *   고칠 때: docs/translate.json 을 고치고 node tools/build-translate.mjs. 문장은 전부 창작.
 *   글 ${sets.length}편 · 줄 ${n}개.
 */
export const TRANSLATE_SETS = ${JSON.stringify(sets)};
`;
const file = join(ROOT, 'translate.js');
if (process.argv.includes('--check')) {
  if ((existsSync(file) ? readFileSync(file, 'utf8') : '') !== js) { console.error('translate.js 가 낡았다 — node tools/build-translate.mjs'); process.exit(1); }
  console.log(`translate: 이상 없음 — 글 ${sets.length}편 · 줄 ${n}개`);
} else { writeFileSync(file, js); console.log(`translate.js — 글 ${sets.length}편 · 줄 ${n}개`); }
