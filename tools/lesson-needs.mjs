#!/usr/bin/env node
/* 레슨마다 필요한 새 블록 — 코스 종류 · 제목 · 이미 있는 블록을 보고 「이 레슨에는 무엇을 몇 개 더」를 정한다.
   → docs/lesson-blocks/_needs.json (안티 그래비티가 이 표대로 쓴다, 지시 docs/antigravity/antigravity-lesson-blocks-task.md)
   운영자 2026-10-15 「레슨별로 학습에 필요한 블럭 개별화」. 규칙은 docs/plans/course-blocks.md 「레슨 유형별 처방」.
   이미 docs/lesson-blocks/<코스>.json 에 쓴 레슨은 「done」으로 표시한다.
   node tools/lesson-needs.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { COURSES } = await import(pathToFileURL(path.join(ROOT, 'courses.js')).href);
const DIR = path.join(ROOT, 'docs/lesson-blocks');
const done = {};
for (const f of fs.existsSync(DIR) ? fs.readdirSync(DIR) : []) if (/^[^_].*\.json$/.test(f)) done[f.replace('.json', '')] = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));

const kind = (c) => c.id === 'hangul' ? 'hangul' : /^(im|ad)-/.test(c.id) ? 'nuance' : 'beginner';   // 한글 · 중고급 뉘앙스 · 초급(첫 마디 · 문장 뼈대 · 초급 문법)
const need = (c, l) => {
  const have = {}; for (const b of l.blocks || []) have[b.t] = (have[b.t] || 0) + 1;
  const title = `${l.title?.ko || ''} ${l.title?.en || ''}`;
  const vs = /\bvs\b|차이|비교/i.test(title);
  const n = [];
  const k = kind(c);
  if (k === 'hangul') {
    n.push({ t: 'listen', n: 2, why: '소리 구분 — 비슷한 소리(예: ㅂ / ㅍ · ㅓ / ㅗ) 듣고 고르기. 이 레슨의 글자로' });
  } else if (k === 'beginner') {
    n.push({ t: 'vocab', n: 1, why: '이 레슨에서 쓰는 낱말 카드 4~6개(영어 뜻, 예문 한 줄)' });
    n.push({ t: 'dictate', n: 1, why: '이 레슨 문형의 짧은 문장 하나 듣고 받아쓰기' });
    n.push({ t: 'write', n: 1, why: '배운 문형으로 내 문장 하나 쓰기(must 에 문형 조각)' });
    if (!have.correct) n.push({ t: 'correct', n: 1, why: '이 레슨 문형에서 흔한 실수 한 문장 고치기' });
    if (vs) n.push({ t: 'compare', n: 1, why: '제목에 비교가 있다 — 나란히 비교' });
  } else {
    n.push({ t: 'compare', n: 1, why: '뉘앙스 차이가 이 레슨의 핵심 — 둘을 나란히 비교(a · b 에 뜻풀이와 예문)' });
    n.push({ t: 'correct', n: 1, why: '두 문법을 바꿔 쓴 틀린 문장 고치기' });
    n.push({ t: 'vocab', n: 1, why: '이 레슨 예문의 핵심 낱말 카드 4~6개' });
    n.push({ t: 'dictate', n: 1, why: '이 레슨의 대표 문장 듣고 받아쓰기' });
    n.push({ t: 'write', n: 1, why: '배운 문법으로 내 문장 하나 쓰기' });
  }
  return { id: l.id, title: l.title, kind: k, have, need: n, done: !!done[c.id]?.[l.id] };
};
const out = COURSES.map((c) => ({ course: c.id, title: c.title, lessons: c.lessons.map((l) => need(c, l)) }));
fs.writeFileSync(path.join(DIR, '_needs.json'), JSON.stringify(out, null, 1) + '\n');
const todo = out.flatMap((c) => c.lessons).filter((l) => !l.done);
const cnt = (f) => out.flatMap((c) => c.lessons).filter(f).length;
const blocks = todo.reduce((a, l) => a + l.need.reduce((x, y) => x + y.n, 0), 0);
console.log(`레슨 ${out.flatMap((c) => c.lessons).length}개 중 쓸 것 ${todo.length}개(한글 ${cnt((l) => l.kind === 'hangul' && !l.done)} · 초급 ${cnt((l) => l.kind === 'beginner' && !l.done)} · 중고급 ${cnt((l) => l.kind === 'nuance' && !l.done)}), 새 블록 약 ${blocks}개 → docs/lesson-blocks/_needs.json`);
