#!/usr/bin/env node
// OX 퀴즈 문항(/ox/)을 만든다 — 운영자 2026-11-09 「메타버스처럼 실시간 OX 퀴즈 · 캐릭터는 햄스터」 1단계.
//   node tools/build-ox.mjs   → ox-questions.js (생성물, 손으로 고치지 않는다)
// 문항은 우리 TOPIK I 낱말 자료(vocab-topik1.js 의 짧은 뜻 s)에서 자동으로 만든다 — 사실을 새로 쓰지 않는다.
//   O 문항: 「낱말」 = 그 낱말의 뜻
//   X 문항: 「낱말」 = 다른 갈래(주제)의, 뜻 단어가 하나도 겹치지 않는 낱말의 뜻 — 비슷한 말을 잘못 X 로 만들지 않게
// 순서는 고정 씨앗으로 섞는다(같은 자료면 같은 결과).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { VOCAB } = await import(path.join(ROOT, 'vocab-topik1.js'));

let seed = 20261109;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const toks = (s) => new Set(s.toLowerCase().replace(/\(.*?\)/g, ' ').split(/[^a-z]+/).filter((w) => w.length > 2 && !['the', 'and', 'for', 'some'].includes(w)));
const POS = new Set(['명사', '동사', '형용사', '부사']);
const pool = VOCAB.filter((v) => v.l === 1 && POS.has(v.p) && v.s && v.s.length <= 22 && /^[가-힣]+$/.test(v.h) && !/[;,]/.test(v.s) && (v.t || []).length);
const top = (v) => String(v.t[0]).split('/')[0];

/* 같은 낱말이 두 번 나오지 않게 한 번씩만 쓴다 */
const words = [...pool].sort(() => rnd() - 0.5);
const out = [], usedM = new Set();   // 틀린 뜻은 한 번씩만(같은 보기가 되풀이되지 않게)
for (let i = 0; i < words.length && out.length < 400; i++) {
  const w = words[i], isO = out.length % 2 === 0 ? rnd() < 0.55 : rnd() < 0.45;
  if (isO) { out.push({ w: w.h, m: w.s, a: 1 }); continue; }
  const wt = toks(w.s);
  const cand = pool.filter((o) => o !== w && o.p === w.p && top(o) !== top(w) && !usedM.has(o.s) && ![...toks(o.s)].some((t) => wt.has(t)));
  if (!cand.length) continue;
  const other = cand[Math.floor(rnd() * cand.length)]; usedM.add(other.s);
  out.push({ w: w.h, m: other.s, r: w.s, a: 0 });
}

const head = `/* 생성물 — 손으로 고치지 않는다. 원본 vocab-topik1.js(짧은 뜻) → node tools/build-ox.mjs
   w 낱말 · m 문항에 쓴 뜻 · a 정답(1 = O, 0 = X) · r X 문항이면 맞는 뜻. */\n`;
fs.writeFileSync(path.join(ROOT, 'ox-questions.js'), `${head}export const OX = ${JSON.stringify(out)};\n`);
console.log(`OX 퀴즈 문항 ${out.length}개(O ${out.filter((q) => q.a).length} · X ${out.filter((q) => !q.a).length}) → ox-questions.js`);
