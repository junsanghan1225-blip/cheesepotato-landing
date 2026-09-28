#!/usr/bin/env node
/* 「단어」 섹션의 낱말 자료 **씨앗**을 만든다 — vocab/data/topik1.json
 *
 *   node tools/vocab-seed.mjs            후보(docs/vocab/topik1-candidates.json)로 씨앗을 새로 만든다
 *
 * 씨앗은 우리가 이미 가진 것만 채운 C급 자료다: 표제어 · 품사 · 영어 뜻(사전) · 급수 초안 · 빈도 ·
 * 예문 하나(사전 예문이 있으면). 주제 · 쉬운 영어 뜻 · 예문 더 · 관계어는 안 그래비티가 500개씩 채워
 * B · A급으로 올린다(docs/vocab-plan.md 6층 1단계). 모양 설명은 docs/vocab-schema.md, 검사는
 * tools/check-vocab.mjs.
 *
 * **이미 사람이 채운 자료를 덮지 않는다.** vocab/data/topik1.json 이 있으면 표제어가 같은 줄은
 * 그대로 두고, 새 후보만 뒤에 더한다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const { EXAMPLES } = await load('glossary-examples.js');
const cand = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/vocab/topik1-candidates.json'), 'utf8'));

const OUT = path.join(ROOT, 'vocab/data/topik1.json');
const had = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : [];
const have = new Set(had.map((w) => w.head));

/* 사전에 섞여 든 어미 조각(았으면 · 었으면 …, 품사 「품사 없음」)은 낱말이 아니다 — 뺀다. */
const fresh = cand.words.filter((c) => !have.has(c.head) && c.pos !== '품사 없음').map((c) => {
  const ex = EXAMPLES[c.head];
  return {
    id: c.head,
    head: c.head,
    pos: c.pos || '',
    level: c.level,
    freq: c.t1,
    purposes: ['topik1'],
    topics: [],
    en: c.en || '',
    examples: ex?.ex ? [{ ko: ex.ex, en: ex.en || '' }] : [],
    rel: {},
    grade: 'C',
    src: ['krdict', 'cheesepotato'],
  };
});

const all = [...had, ...fresh];
fs.mkdirSync(path.dirname(OUT), { recursive: true });
/* 한 줄에 낱말 하나 — 안 그래비티가 고친 곳이 git 차이에서 줄 단위로 또렷이 보이게. */
fs.writeFileSync(OUT, '[\n' + all.map((w) => ' ' + JSON.stringify(w)).join(',\n') + '\n]\n');
console.log(`vocab/data/topik1.json — 있던 ${had.length} + 새로 ${fresh.length} = ${all.length}개`);
