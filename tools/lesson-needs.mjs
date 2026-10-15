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

const kind = (c) => c.id === 'hangul' ? 'hangul' : /^(im|ad)-/.test(c.id) ? 'nuance' : /^bg-d-/.test(c.id) ? 'dialog' : /^bg-irr/.test(c.id) ? 'irregular' : 'beginner';   // 한글 · 중고급 뉘앙스 · 대화 · 불규칙 · 초급(첫 마디 · 문장 뼈대 · 초급 문법) — 대화 · 불규칙은 레슨 대격변 5단계
const need = (c, l) => {
  const have = {}; for (const b of l.blocks || []) have[b.t] = (have[b.t] || 0) + 1;
  const title = `${l.title?.ko || ''} ${l.title?.en || ''}`;
  const vs = /\bvs\b|차이|비교/i.test(title);
  const n = [];
  const k = kind(c);
  if (k === 'hangul') {
    n.push({ t: 'listen', n: 2, why: '소리 구분 — 비슷한 소리(예: ㅂ / ㅍ · ㅓ / ㅗ) 듣고 고르기. 이 레슨의 글자로' });
    n.push({ t: 'cando', n: 1, why: '이제 할 수 있어요 — 이 레슨 목표 2~3줄(영어)' });
  } else if (k === 'dialog') {
    n.push({ t: 'passage', n: 1, why: '짧은 대화 3~4줄(두 사람이 번갈아 말하는 줄, 이 레슨 장면 · 문형으로) + 바로 뒤에 이해 문제 choice 2개(누가 무엇을 · 어디서 …)' });
    n.push({ t: 'vocab', n: 1, why: '이 장면에서 쓰는 낱말 카드 4~6개(영어 뜻, 예문 한 줄)' });
    n.push({ t: 'dictate', n: 1, why: '대화 속 한 마디 듣고 받아쓰기(상대에게 하는 말 한 문장)' });
    n.push({ t: 'write', n: 1, why: '대화에 답하기 — 장면을 주고 내 한마디 쓰기(must 에 이 레슨 문형 조각)' });
    n.push({ t: 'cando', n: 1, why: '이제 할 수 있어요 — 이 장면에서 할 수 있는 말 2~3줄(영어)' });
  } else if (k === 'irregular') {
    n.push({ t: 'conj', n: 2, why: '불규칙 활용 표 — 이 레슨의 불규칙 낱말 3~5개씩 두 표(verbs, forms 는 present · past · future · and · mod 중). 정답은 도구가 채운다' });
    n.push({ t: 'correct', n: 2, why: '규칙처럼 잘못 활용한 문장 고치기(예: 「덥어요」→「더워요」) — 한 곳만 틀리게' });
    n.push({ t: 'vocab', n: 1, why: '이 레슨의 불규칙 낱말 카드 4~6개' });
    n.push({ t: 'dictate', n: 1, why: '불규칙 활용이 들어간 짧은 문장 듣고 받아쓰기' });
    n.push({ t: 'write', n: 1, why: '배운 불규칙 낱말로 내 문장 하나 쓰기' });
    n.push({ t: 'cando', n: 1, why: '이제 할 수 있어요 — 이 레슨 목표 2~3줄(영어)' });
  } else if (k === 'beginner') {
    n.push({ t: 'vocab', n: 1, why: '이 레슨에서 쓰는 낱말 카드 4~6개(영어 뜻, 예문 한 줄)' });
    n.push({ t: 'dictate', n: 1, why: '이 레슨 문형의 짧은 문장 하나 듣고 받아쓰기' });
    n.push({ t: 'write', n: 1, why: '배운 문형으로 내 문장 하나 쓰기(must 에 문형 조각)' });
    if (!have.correct) n.push({ t: 'correct', n: 1, why: '이 레슨 문형에서 흔한 실수 한 문장 고치기' });
    if (vs) n.push({ t: 'compare', n: 1, why: '제목에 비교가 있다 — 나란히 비교' });
    n.push({ t: 'conj', n: 1, why: '활용 표 — 이 레슨 낱말 중 동사 · 형용사 3~5개(verbs), forms 는 present · past · future 중 이 레슨에 맞는 것. 정답은 도구가 채운다' });
    n.push({ t: 'expand', n: 1, why: '문장 늘리기 — 이 레슨 문형의 짧은 문장에서 조각을 한 개씩 얹어 2~3단계로 길게' });
    n.push({ t: 'passage', n: 1, why: '짧은 글 2~4줄(이 레슨 문법 · 낱말로) + 바로 뒤에 이해 문제 choice 2개' });
    n.push({ t: 'cando', n: 1, why: '이제 할 수 있어요 — 이 레슨 목표 2~3줄(영어)' });
  } else {
    n.push({ t: 'compare', n: 1, why: '뉘앙스 차이가 이 레슨의 핵심 — 둘을 나란히 비교(a · b 에 뜻풀이와 예문)' });
    n.push({ t: 'correct', n: 1, why: '두 문법을 바꿔 쓴 틀린 문장 고치기' });
    n.push({ t: 'vocab', n: 1, why: '이 레슨 예문의 핵심 낱말 카드 4~6개' });
    n.push({ t: 'dictate', n: 1, why: '이 레슨의 대표 문장 듣고 받아쓰기' });
    n.push({ t: 'write', n: 1, why: '배운 문법으로 내 문장 하나 쓰기' });
    n.push({ t: 'expand', n: 1, why: '문장 늘리기 — 이 레슨 문법의 짧은 문장에서 조각을 얹어 2~3단계로 길게' });
    n.push({ t: 'passage', n: 1, why: '짧은 글 3~4줄(이 레슨 문법이 글 속에서 쓰이게) + 바로 뒤에 이해 문제 choice 2개' });
    n.push({ t: 'cando', n: 1, why: '이제 할 수 있어요 — 이 레슨 목표 2~3줄(영어)' });
  }
  return { id: l.id, title: l.title, kind: k, have, need: n, done: !!done[c.id]?.[l.id] };
};
const out = COURSES.map((c) => ({ course: c.id, title: c.title, lessons: c.lessons.map((l) => need(c, l)) }));
fs.writeFileSync(path.join(DIR, '_needs.json'), JSON.stringify(out, null, 1) + '\n');
const todo = out.flatMap((c) => c.lessons).filter((l) => !l.done);
const cnt = (f) => out.flatMap((c) => c.lessons).filter(f).length;
const blocks = todo.reduce((a, l) => a + l.need.reduce((x, y) => x + y.n, 0), 0);
console.log(`레슨 ${out.flatMap((c) => c.lessons).length}개 중 쓸 것 ${todo.length}개(한글 ${cnt((l) => l.kind === 'hangul' && !l.done)} · 초급 ${cnt((l) => l.kind === 'beginner' && !l.done)} · 중고급 ${cnt((l) => l.kind === 'nuance' && !l.done)}), 새 블록 약 ${blocks}개 → docs/lesson-blocks/_needs.json`);
