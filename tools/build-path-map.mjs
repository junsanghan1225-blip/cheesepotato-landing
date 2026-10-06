#!/usr/bin/env node
/* 학습 길(기초 · 중급 · 고급)의 「걸음」마다 붙일 문법 — 레슨 → 문법 id 짝(운영자 결정 2026-10-06:
   「문법으로 풀고 밑에는 코스로 연습」, 한 걸음 = 문법 → 코스 레슨 → 단어).

   만드는 법
   1. 기계 짝: 레슨 본문(한국어)에서 grammar-mark 로 문법 꼴을 찾는다. 조사(을/를 · 은/는)처럼 거의 모든
      레슨에 나오는 것은 뜻이 없으니 「드물수록 무겁게」(tf-idf) 세고, 레슨 수의 25% 넘게 나오는 꼴은 뺀다.
      코스 단계보다 높은 문법은 붙이지 않는다(기초 레슨에 고급 문법 X). 두 번 이상 나온 것 중 위에서 둘.
   2. 사람 짝: docs/path-map.json 이 있으면 그 레슨은 그것을 그대로 쓴다(안티 · Claude 검토). [] 면 「문법 없음」.
   → path-map.js: export const PATH_GRAMMAR = { 레슨 id: [문법 id, …] }

   node tools/build-path-map.mjs          만들기
   node tools/build-path-map.mjs --check  path-map.js 가 지금 자료와 같은지만 본다(CI) */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { COURSES } = await import(join(ROOT, 'courses.js'));
const { SB_CATS } = await import(join(ROOT, 'sentences.js'));
const { grammarMarkRe } = await import(join(ROOT, 'grammar-mark.js'));

const TIER = { beginner: 0, intermediate: 1, advanced: 2 };
const COURSE_TIER = (c) => (c.level === 'Advanced' ? 2 : c.level === 'Intermediate' ? 1 : 0);
const pts = SB_CATS.flatMap((c) => c.points)
  .map((p) => ({ id: p.id, tier: TIER[p.lv] ?? 1, re: grammarMarkRe(p.name) }))
  .filter((p) => p.re);

/* 레슨 속 한국어만 모은다 — 영어 설명(en) · 검색용(seo)은 뺀다 */
const koText = (o) => {
  const out = [];
  const walk = (v) => {
    if (typeof v === 'string') { if (/[가-힣]/.test(v)) out.push(v); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== 'en' && k !== 'seo') walk(x);
  };
  walk(o);
  return out.join('\n');
};
const count = (re, s) => { re.lastIndex = 0; let n = 0; for (const m of s.matchAll(re)) if (m[0]) n++; return n; };

const lessons = COURSES.flatMap((c) => c.lessons.map((l) => ({ c, l, text: koText(l.blocks) })));
const df = new Map();
for (const { text } of lessons) for (const p of pts) if (count(p.re, text)) df.set(p.id, (df.get(p.id) || 0) + 1);

const manual = existsSync(join(ROOT, 'docs/path-map.json'))
  ? JSON.parse(readFileSync(join(ROOT, 'docs/path-map.json'), 'utf8')) : {};
const ids = new Set(pts.map((p) => p.id).concat(SB_CATS.flatMap((c) => c.points.map((p) => p.id))));
const lessonIds = new Set(lessons.map((x) => x.l.id));
const bad = [];
for (const [lid, g] of Object.entries(manual)) {
  if (lid.startsWith('_')) continue;
  if (!lessonIds.has(lid)) bad.push(`docs/path-map.json: 없는 레슨 ${lid}`);
  if (!Array.isArray(g)) bad.push(`docs/path-map.json: ${lid} 는 [문법 id …] 여야 한다`);
  else for (const id of g) if (!ids.has(id)) bad.push(`docs/path-map.json: ${lid} 의 없는 문법 ${id}`);
}
if (bad.length) { console.error(bad.join('\n')); process.exit(1); }

const out = {};
let auto = 0, hand = 0;
for (const { c, l, text } of lessons) {
  if (Array.isArray(manual[l.id])) { if (manual[l.id].length) out[l.id] = manual[l.id]; hand++; continue; }
  const ct = COURSE_TIER(c);
  const hit = pts
    .filter((p) => p.tier <= ct && (df.get(p.id) || 0) < lessons.length * 0.25)
    .map((p) => { const n = count(p.re, text); return { id: p.id, n, w: n * Math.log(lessons.length / (df.get(p.id) || 1)) * (p.tier === ct ? 1.5 : 1) }; })
    .filter((x) => x.n >= 2)
    .sort((a, b) => b.w - a.w)
    .slice(0, 2)
    .map((x) => x.id);
  if (hit.length) { out[l.id] = hit; auto++; }
}

const js = `/* 학습 길 — 레슨마다 붙일 문법(생성물, 손으로 고치지 말 것).
 *   고칠 때: docs/path-map.json(사람 짝) 또는 tools/build-path-map.mjs 를 고치고 다시 돌린다.
 *   레슨 ${lessons.length}개 중 ${Object.keys(out).length}개에 문법 — 기계 ${auto} · 사람 ${hand}.
 */
export const PATH_GRAMMAR = ${JSON.stringify(out)};
`;
const file = join(ROOT, 'path-map.js');
if (process.argv.includes('--check')) {
  const now = existsSync(file) ? readFileSync(file, 'utf8') : '';
  if (now !== js) { console.error('path-map.js 가 낡았다 — node tools/build-path-map.mjs 를 돌릴 것'); process.exit(1); }
  console.log(`path-map: 이상 없음 — 레슨 ${Object.keys(out).length}/${lessons.length}`);
} else {
  writeFileSync(file, js);
  console.log(`path-map.js — 레슨 ${Object.keys(out).length}/${lessons.length} (기계 ${auto} · 사람 ${hand})`);
}
