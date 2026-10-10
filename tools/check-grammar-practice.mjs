#!/usr/bin/env node
/* 문법 「블록으로 맞추기」 연습 문장 검사 — docs/grammar-practice.json (안티 그래비티가 쓰고 Claude 가 검토, 지시서 docs/antigravity/antigravity-grammar-practice-task.md)
 *
 *   node tools/check-grammar-practice.mjs
 *
 * 모양: { "33-1": [ { "ko": "…", "en": "…" }, … ], … } — 표현마다 다섯.
 * 막는 것: 없는 표현 id · 다섯이 아님 · 영어 없음 · 3~10어절이 아님 · 따옴표 · 괄호 · 「A:」 꼴(블록이 깨진다) ·
 *          화면에 이미 나오는 예문 · 대화 · 쓰임 보기와 같은 문장 · 표현 안에서 겹치는 문장 · 「운영자 확인」 note 남음.
 * 파일이 없으면 「아직 없음」으로 통과한다(안티 결과가 오기 전). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'docs/grammar-practice.json');
if (!fs.existsSync(FILE)) { console.log('docs/grammar-practice.json 아직 없음 — 문제 없음'); process.exit(0); }
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const { SB_CATS, SB_MORE, SB_SEED } = await imp('sentences.js');
const { GRAMMAR_USAGE } = await imp('grammar-usage.js');
const PTS = new Map(SB_CATS.flatMap((c) => c.points).map((p) => [p.id, p]));

let data;
try { data = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { console.error('JSON 이 깨졌다: ' + e.message); process.exit(1); }
const err = [];
for (const [id, list] of Object.entries(data)) {
  if (id.startsWith('_')) continue;
  const p = PTS.get(id);
  if (!p) { err.push(`${id}: 없는 표현 id`); continue; }
  if (!Array.isArray(list) || list.length !== 5) { err.push(`${id} ${p.name}: 다섯 문장이어야 한다(${list?.length ?? 0})`); continue; }
  const shown = new Set([p.ex, (SB_MORE[id] || [])[3], ...(p.dlg || []).map((l) => String(l).replace(/^\s*[AB]\s*:\s*/, '')),
    ...(GRAMMAR_USAGE[id] || []).map((u) => u[0]), ...(SB_SEED?.[id] || []).map((r) => r[1])].map((x) => String(x || '').trim()));
  const seen = new Set();
  list.forEach((x, i) => {
    const at = `${id} ${p.name} #${i + 1}`, ko = String(x?.ko || '').trim(), en = String(x?.en || '').trim();
    if (!ko) { err.push(`${at}: ko 가 비었다`); return; }
    if (!en) err.push(`${at}: en(영어 뜻)이 없다`);
    const n = ko.split(/\s+/).length;
    if (n < 3 || n > 10) err.push(`${at}: ${n}어절 — 3~10어절이어야 한다: ${ko}`);
    if (/["“”'‘’「」()（）\[\]]|^[AB]\s*:/.test(ko)) err.push(`${at}: 따옴표 · 괄호 · 「A:」는 쓰지 않는다: ${ko}`);
    if (!/[.?!]$/.test(ko)) err.push(`${at}: 문장 부호(. ? !)로 끝나야 한다: ${ko}`);
    if (shown.has(ko)) err.push(`${at}: 화면에 이미 나오는 문장이다: ${ko}`);
    if (seen.has(ko)) err.push(`${at}: 같은 문장이 두 번: ${ko}`);
    if (x?.note) err.push(`${at}: note 가 남아 있다(운영자 확인) — ${x.note}`);
    seen.add(ko);
  });
}
if (err.length) { console.error(`고쳐야 할 것 ${err.length}개`); err.forEach((e) => console.error('  ✗ ' + e)); process.exit(1); }
const n = Object.keys(data).filter((k) => !k.startsWith('_')).length;
console.log(`문법 연습 문장 ${n}개 표현 · ${n * 5}문장 — 문제 없음`);
