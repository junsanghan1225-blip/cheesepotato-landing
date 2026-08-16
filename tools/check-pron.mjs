#!/usr/bin/env node
/* 발음 레벨 테스트 지문 검사기.

   왜 필요한가 — 이 지문은 사람이 읽고 브라우저가 받아 적은 뒤 자모
   편집거리로 점수를 낸다(app.js 의 accuracyDetail). 그래서 지문에
   숫자나 로마자가 한 글자라도 섞이면, 학습자가 아무리 정확히 읽어도
   인식기는 「십오」라고 적고 지문은 「15」라서 통째로 틀린 게 된다.
   발음을 재야 할 자리에서 표기법을 재게 되는 것이다.

   길이도 같은 이유로 재야 한다. 점수는 (1 - 어긋난자모 / 전체자모) 라서
   지문이 짧을수록 실수 하나가 크게 깎인다. 한 단계 안에서 길이가
   들쭉날쭉하면 무작위로 뽑는 순간 운으로 레벨이 갈린다.

   기준값은 지어낸 게 아니라 처음부터 있던 스물네 개를 재서 잡았다.

   쓰기: node tools/check-pron.mjs */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ── app.js 에서 PT_SETS 를 꺼낸다 ───────────────────────────── */
const src = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const a = src.indexOf('const PT_SETS');
const b = src.indexOf('const PT_LV_NAME');
if (a < 0 || b < 0) throw new Error('app.js 에서 PT_SETS 를 못 찾았다');
const SETS = {};
for (const m of src.slice(a, b).matchAll(/(easy|normal|hard):\s*\[([\s\S]*?)\n\s*\],/g)) {
  SETS[m[1]] = [...m[2].matchAll(/'([^']*)'/g)].map((x) => x[1]);
}

/* ── 한글 다루기 ─────────────────────────────────────────────── */
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ',
  'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const CHO_OF = (ch) => { const c = ch.charCodeAt(0) - 0xAC00; return c >= 0 && c <= 11171 ? Math.floor(c / 588) : -1; };
const JONG_OF = (ch) => { const c = ch.charCodeAt(0) - 0xAC00; return c >= 0 && c <= 11171 ? JONG[c % 28] : null; };
/* 채점기와 똑같이 지운다. 여기서 다르게 세면 검사가 거짓말을 한다. */
const clean = (s) => s.normalize('NFC').replace(/[\s.,!?~·"'…]/g, '');
const jamoLen = (s) => [...clean(s)].reduce((n, ch) => {
  const c = ch.charCodeAt(0) - 0xAC00;
  return n + (c >= 0 && c <= 11171 ? (JONG[c % 28] ? 3 : 2) : 1);
}, 0);

const DOUBLE = new Set(['ㄳ', 'ㄵ', 'ㄶ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅄ']);
const doubleCount = (s) => [...clean(s)].filter((ch) => DOUBLE.has(JONG_OF(ch))).length;

/* 연음 — 받침 있는 글자 바로 뒤에 ㅇ 으로 시작하는 글자가 올 때.
   띄어쓰기를 지운 뒤에 세면 「밥 을」처럼 띄어 쓴 것도 잡힌다. */
const CHO_IEUNG = 11;
const linkCount = (s) => {
  const c = clean(s);
  let n = 0;
  for (let i = 0; i + 1 < c.length; i++) {
    if (JONG_OF(c[i]) && CHO_OF(c[i + 1]) === CHO_IEUNG) n++;
  }
  return n;
};

/* ── 단계별 기준. 처음 스물네 개를 재서 잡은 값에 여유를 뒀다 ── */
const RULE = {
  easy:   { 자: [10, 16],  자모: [15, 30],  문장: 1, 겹받침: [0, 0], 연음: [0, 3] },
  normal: { 자: [38, 48],  자모: [66, 88],  문장: 2, 겹받침: [0, 2], 연음: [0, 9] },
  hard:   { 자: [45, 58],  자모: [85, 110], 문장: 2, 겹받침: [1, 6], 연음: [0, 11] },
};
/* 한 단계 안에서 무작위로 하나를 뽑으므로, 단계마다 충분히 있기만 하면
   되고 단계끼리 수가 같을 필요는 없다. 너무 적으면 같은 지문이 자꾸
   나온다 — 그 선만 본다. */
const 적어도 = 20;

const bad = [], warn = [];
const seen = new Map();

for (const [lv, rule] of Object.entries(RULE)) {
  const arr = SETS[lv];
  if (!arr) { bad.push(`${lv}: 지문 묶음이 없다`); continue; }
  if (arr.length < 적어도) warn.push(`${lv}: ${arr.length}개뿐 — ${적어도}개는 넘겨야 같은 지문이 덜 겹친다`);

  arr.forEach((s, i) => {
    const at = `${lv}#${i + 1}`;
    const short = s.length > 34 ? s.slice(0, 34) + '…' : s;

    /* 1. 한글과 허용한 문장부호 말고는 아무것도 없어야 한다 */
    const junk = [...s].filter((ch) => !/[가-힣\s.,!?~·]/.test(ch));
    if (junk.length) bad.push(`${at} 한글 아닌 글자 「${[...new Set(junk)].join('')}」 — ${short}`);

    /* 2. 길이 */
    if (s.length < rule.자[0] || s.length > rule.자[1]) {
      bad.push(`${at} ${s.length}자 — ${rule.자[0]}~${rule.자[1]}자여야 한다: ${short}`);
    }
    const j = jamoLen(s);
    if (j < rule.자모[0] || j > rule.자모[1]) {
      bad.push(`${at} 자모 ${j}개 — ${rule.자모[0]}~${rule.자모[1]}개여야 한다: ${short}`);
    }

    /* 3. 문장 수 */
    const sent = (s.match(/[.!?]/g) || []).length;
    if (sent !== rule.문장) bad.push(`${at} 문장 ${sent}개 — ${rule.문장}개여야 한다: ${short}`);
    if (!/[.!?]$/.test(s.trim())) bad.push(`${at} 문장부호로 안 끝난다: ${short}`);

    /* 4. 겹받침 — 어려움의 존재 이유이고, 쉬움에는 있으면 안 된다 */
    const d = doubleCount(s);
    if (d < rule.겹받침[0]) bad.push(`${at} 겹받침 ${d}개 — 어려움은 하나는 있어야 한다: ${short}`);
    if (d > rule.겹받침[1]) bad.push(`${at} 겹받침 ${d}개 — ${lv}에는 ${rule.겹받침[1]}개까지: ${short}`);

    /* 5. 연음 */
    const l = linkCount(s);
    if (l > rule.연음[1]) warn.push(`${at} 연음 ${l}군데 — ${lv}치고 많다: ${short}`);

    /* 6. 말투. 반말이 섞이면 읽는 사람이 톤을 못 잡는다 */
    if (/(?:[가-힣])(?:다|야|지|어|아|네)\s*[.!?]/.test(s) && !/(?:요|다|까)\s*[.!?]/.test(s)) {
      warn.push(`${at} 반말로 끝나는 듯: ${short}`);
    }
    if (lv === 'easy' && !/요\s*[.!?]$/.test(s)) warn.push(`${at} 쉬움은 해요체로 끝내는 게 좋다: ${short}`);
    if (lv !== 'easy') {
      if (!/니다\s*[.!?]/.test(s)) warn.push(`${at} 첫 문장이 -습니다 가 아니다: ${short}`);
      if (!/요\s*[.!?]$/.test(s)) warn.push(`${at} 끝 문장이 해요체가 아니다: ${short}`);
    }

    /* 7. 겹치는 지문. 무작위로 하나 뽑는 화면이라 같은 게 두 번 있으면
          그만큼 다른 지문이 안 나온다. */
    const key = clean(s);
    if (seen.has(key)) bad.push(`${at} ${seen.get(key)} 와 같은 지문: ${short}`);
    else seen.set(key, at);
  });
}

/* ── 알림 ───────────────────────────────────────────────────── */
for (const [lv, arr] of Object.entries(SETS)) {
  const L = arr.map((s) => s.length), J = arr.map(jamoLen);
  const av = (x) => Math.round(x.reduce((p, q) => p + q, 0) / x.length);
  console.log(`${lv.padEnd(7)} ${String(arr.length).padStart(3)}개 · ` +
    `${Math.min(...L)}~${Math.max(...L)}자(평균 ${av(L)}) · ` +
    `자모 ${Math.min(...J)}~${Math.max(...J)}(평균 ${av(J)}) · ` +
    `겹받침 든 지문 ${arr.filter((s) => doubleCount(s)).length}개`);
}

console.log(`\n■ 고쳐야 할 것 ${bad.length}건`);
bad.forEach((x) => console.log('  ' + x));
console.log(`\n□ 눈으로 볼 것 ${warn.length}건`);
warn.forEach((x) => console.log('  ' + x));
console.log(bad.length ? '\n손봐야 한다.' : '\n이상 없음');
process.exit(bad.length ? 1 : 0);
