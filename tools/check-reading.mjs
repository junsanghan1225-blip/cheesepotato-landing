#!/usr/bin/env node
/* 읽기 연습 지문 검사기.

   여기서 재는 것은 두 가지다.

   ① **치수** — 짧은 글과 긴 글이 이름값을 하는지. 길이가 뒤섞이면
      학습자가 「짧은 글」을 골랐는데 열 줄이 나오는 일이 생긴다.

   ② **채점이 될 수 있는 모양인지** — 이게 더 중요하다. 점수는 keys 로
      낸다. 그런데 keys 의 k 가 지문이나 모범 답안에 아예 없는 말이면
      아무도 그 항목을 못 맞춘다. 반대로 k 가 너무 흔한 한 글자면 아무나
      다 맞춘다. 둘 다 점수를 거짓말로 만든다.

   쓰기: node tools/check-reading.mjs */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { READING } = await import(pathToFileURL(path.join(ROOT, 'reading.js')).href);

/* 처음 스물넷을 재서 잡은 값이 아니라, 사람이 읽기 편한 분량으로 정했다.
   짧은 글은 짬이 날 때 한 편, 긴 글은 자리를 잡고 한 편. */
const BAND = {
  short: { 자: [60, 200], 문장: [3, 5], 답문장: [2, 4], keys: [3, 4] },
  /* 문장 수 아래끝을 6으로 둔다. 긴 글의 잣대는 글자 수이고, 한 문장을
     길게 쓰는 글은 300자를 여섯 문장으로도 채운다 — 실제로 받아 보니
     대부분 일곱 문장이었다. 문장 수로 조이면 멀쩡한 글을 억지로
     토막 내게 된다. */
  long:  { 자: [280, 520], 문장: [6, 12], 답문장: [3, 6], keys: [3, 5] },
};
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const 적어도 = 6;   // 한 칸에 이만큼은 있어야 같은 글이 자꾸 안 나온다

const bad = [], warn = [];
const ids = new Map();
const sentences = (s) => (String(s).match(/[.!?]/g) || []).length;

for (const [len, band] of Object.entries(BAND)) {
  const group = READING[len];
  if (!group) { bad.push(`${len}: 묶음이 없다`); continue; }
  for (const lv of LEVELS) {
    const arr = group[lv];
    if (!Array.isArray(arr)) { bad.push(`${len}.${lv}: 배열이 아니다`); continue; }
    if (arr.length < 적어도) warn.push(`${len}.${lv}: ${arr.length}편뿐 — ${적어도}편은 있어야 한다`);

    arr.forEach((r, i) => {
      const at = `${len}.${lv}#${i + 1}(${r.id ?? '?'})`;
      const need = ['id', 'title', 'passage', 'en', 'question', 'model', 'keys', 'words'];
      for (const f of need) if (!r[f]) return bad.push(`${at} ${f} 가 없다`);

      /* id 는 진도를 적는 열쇠다. 겹치면 두 지문이 한 기록을 나눠 갖는다. */
      if (ids.has(r.id)) bad.push(`${at} id 가 ${ids.get(r.id)} 와 겹친다`);
      else ids.set(r.id, at);
      if (!/^r[sl]-[bia]-\d{2,3}$/.test(r.id)) bad.push(`${at} id 모양이 rs-b-01 꼴이 아니다`);
      const wantHead = `r${len[0]}-${lv[0]}-`;
      if (!r.id.startsWith(wantHead)) bad.push(`${at} id 가 ${wantHead} 로 시작해야 한다`);

      /* 치수 */
      const n = r.passage.length;
      if (n < band.자[0] || n > band.자[1]) bad.push(`${at} 지문 ${n}자 — ${band.자[0]}~${band.자[1]}자여야 한다`);
      const s = sentences(r.passage);
      if (s < band.문장[0] || s > band.문장[1]) bad.push(`${at} 지문 ${s}문장 — ${band.문장[0]}~${band.문장[1]}문장이어야 한다`);
      const m = sentences(r.model);
      if (m < band.답문장[0] || m > band.답문장[1]) bad.push(`${at} 모범 답안 ${m}문장 — ${band.답문장[0]}~${band.답문장[1]}문장이어야 한다`);

      /* 영어 대조는 지문 전체를 옮긴 것이어야 한다. 한 줄 요약이 오면
         「내가 맞게 읽었나」를 대조할 수가 없다. */
      if (!/[A-Za-z]/.test(r.en)) bad.push(`${at} en 이 영어가 아니다`);
      if (/[가-힣]/.test(r.en)) bad.push(`${at} en 에 한글이 섞였다`);
      if (r.en.length < n * 0.8) warn.push(`${at} en 이 지문보다 많이 짧다 (${r.en.length}자 vs 지문 ${n}자) — 요약이 아니라 옮긴 글이어야 한다`);
      if (sentences(r.en) < s - 1) warn.push(`${at} en 이 ${sentences(r.en)}문장 — 지문은 ${s}문장이다`);

      /* 채점이 될 수 있는 모양인지 */
      if (!Array.isArray(r.keys)) return bad.push(`${at} keys 가 배열이 아니다`);
      if (r.keys.length < band.keys[0] || r.keys.length > band.keys[1]) {
        bad.push(`${at} 짚을 거리 ${r.keys.length}개 — ${band.keys[0]}~${band.keys[1]}개여야 한다`);
      }
      const seenK = new Set();
      r.keys.forEach((key, j) => {
        const where = `${at} 짚을거리${j + 1}`;
        if (!Array.isArray(key?.k) || !key.k.length) return bad.push(`${where} k 가 빈 배열이다`);
        if (!key.why) return bad.push(`${where} why 가 없다`);
        for (const w of key.k) {
          /* 한 글자짜리는 아무 글에나 들어 있어서 점수를 못 가른다 */
          if (w.replace(/\s/g, '').length < 2) bad.push(`${where} 「${w}」는 너무 짧다 — 두 글자 이상`);
          if (seenK.has(w)) bad.push(`${where} 「${w}」가 다른 항목에도 있다 — 한 낱말이 두 점을 준다`);
          seenK.add(w);
          /* 활용형을 통째로 넣으면 그 꼴로 쓴 사람만 맞춘다. 「몰입하게」를
             기준에 두면 「몰입할 수 있습니다」라고 제대로 쓴 학습자가
             0점을 받는다. 어간만 남겨야 한다. */
          if (/(습니다|했습니다|합니다|하게|해서|하지|였습니다|됩니다)$/.test(w)) {
            bad.push(`${where} 「${w}」는 활용형이다 — 어간만 남겨라(그 꼴로 쓴 사람만 맞춘다)`);
          }
        }
        /* 한 항목 안에서 한 낱말이 다른 낱말을 품고 있으면 짧은 쪽만 있으면
           된다. 「기억력」과 「기억」을 같이 두는 것은 아무 일도 안 한다. */
        for (const a of key.k) for (const b of key.k) {
          if (a !== b && a.includes(b)) warn.push(`${where} 「${a}」가 「${b}」를 품는다 — 짧은 쪽만 남겨도 된다`);
        }
        /* 하나도 안 나오는 말로 점수를 매기면 아무도 못 맞춘다.
           지문과 모범 답안을 합쳐 보고 하나라도 있으면 통과. */
        const hay = r.passage + ' ' + r.model + ' ' + r.question;
        if (!key.k.some((w) => hay.includes(w))) {
          bad.push(`${where} 「${key.k.join('/')}」가 지문·모범답안 어디에도 없다 — 아무도 못 맞춘다`);
        }
        /* 모범 답안은 만점이어야 한다. 본보기가 제 점수를 못 받으면
           학습자에게 보여 줄 낯이 없다. */
        if (!key.k.some((w) => r.model.includes(w))) {
          warn.push(`${where} 모범 답안에 「${key.k.join('/')}」가 없다 — 본보기가 만점이 아니게 된다`);
        }
      });

      /* 낱말 풀이 */
      if (!Array.isArray(r.words) || !r.words.length) bad.push(`${at} words 가 비었다`);
      else r.words.forEach((w, j) => {
        if (!Array.isArray(w) || w.length !== 2) return bad.push(`${at} 낱말${j + 1} 이 [낱말, 뜻] 꼴이 아니다`);
        if (!/[가-힣]/.test(w[0])) bad.push(`${at} 낱말${j + 1} 「${w[0]}」에 한글이 없다`);
        if (!/[A-Za-z]/.test(w[1])) bad.push(`${at} 낱말${j + 1} 뜻 「${w[1]}」이 영어가 아니다`);
        /* 첫 음절만 본다. 「나가다」는 지문에서 「나갑니다」로 나오는데
           ㅂ 불규칙이라 둘째 음절이 통째로 달라진다 — 두 음절로 견주면
           멀쩡한 낱말이 다 걸린다. 여기서 잡고 싶은 것은 지문과 아무
           상관없는 말이 낱말 풀이에 섞인 경우다. */
        const head = w[0].replace(/^-/, '')[0];
        if (head && !r.passage.includes(head)) {
          warn.push(`${at} 낱말 「${w[0]}」이 지문에 안 보인다`);
        }
      });

      /* 물음이 물음이어야 한다 */
      if (!/(보세요|보십시오|써|정리)/.test(r.question)) warn.push(`${at} question 이 쓰라는 말로 안 끝난다`);
    });
  }
}

/* ── 알림 ─────────────────────────────────────────────────── */
let total = 0;
for (const len of Object.keys(BAND)) {
  const row = LEVELS.map((lv) => {
    const arr = READING[len]?.[lv] ?? [];
    total += arr.length;
    const L = arr.map((r) => r.passage.length);
    return `${lv.slice(0, 3)} ${String(arr.length).padStart(2)}편${L.length ? `(${Math.min(...L)}~${Math.max(...L)}자)` : ''}`;
  });
  console.log(`${len.padEnd(6)} ${row.join(' · ')}`);
}
console.log(`합계 ${total}편`);

console.log(`\n■ 고쳐야 할 것 ${bad.length}건`);
bad.forEach((x) => console.log('  ' + x));
console.log(`\n□ 눈으로 볼 것 ${warn.length}건`);
warn.forEach((x) => console.log('  ' + x));
console.log(bad.length ? '\n손봐야 한다.' : '\n이상 없음');
process.exit(bad.length ? 1 : 0);
