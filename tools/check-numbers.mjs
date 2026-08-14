/*
 * 숫자 읽기 엔진 검사기
 *
 * 이 저장소는 푸시하면 1~2분 뒤 everykoreans.com 에 그대로 나간다.
 * 숫자 게임은 문제를 그때그때 만들어 내므로 사람이 미리 다 볼 수가 없다.
 * 읽기가 하나 틀리면 **학습자에게 틀린 것을 가르치고**, 게다가 정답으로
 * 채점까지 한다. 그래서 손으로 확인한 표와 맞춰 본다.
 *
 * 실행: node tools/check-numbers.mjs
 *
 * 잡아내는 것
 *   - 한자어·순우리말 읽기가 손으로 확인한 표와 다름
 *   - 단위 앞 꼴(한·두·세·네·스무)이 안 바뀜
 *   - 만들어진 문제의 두 보기가 같음 — 무엇을 골라도 정답이 된다
 *   - 정답·오답·설명 중 빈 것
 *   - 한 단계가 문제를 채우지 못함
 */
import { sino, native, makeRound, NUM_LEVELS } from '../numbers.js';

const errs = [];
const eq = (got, want, label) => { if (got !== want) errs.push(`${label} — 나온 값 "${got}", 맞는 값 "${want}"`); };

/* ── 한자어. 만 단위로 끊는 자리를 촘촘히 본다 ── */
[
  [0, '영'], [1, '일'], [7, '칠'], [10, '십'], [11, '십일'], [16, '십육'], [20, '이십'],
  [99, '구십구'], [100, '백'], [101, '백일'], [110, '백십'], [365, '삼백육십오'],
  [1000, '천'], [1500, '천오백'], [9900, '구천구백'],
  [10000, '만'], [10001, '만 일'], [15000, '만 오천'], [23000, '이만 삼천'],
  [30000, '삼만'], [100000, '십만'], [120000, '십이만'], [250000, '이십오만'],
  [1000000, '백만'], [1200000, '백이십만'], [3500000, '삼백오십만'],
  [10000000, '천만'], [100000000, '일억'], [250000000, '이억 오천만'],
].forEach(([n, want]) => eq(sino(n), want, `sino(${n})`));

/* ── 순우리말. 그냥 꼴 ── */
[
  [1, '하나'], [2, '둘'], [3, '셋'], [4, '넷'], [5, '다섯'], [10, '열'],
  [11, '열하나'], [15, '열다섯'], [20, '스물'], [21, '스물하나'],
  [30, '서른'], [40, '마흔'], [50, '쉰'], [60, '예순'], [70, '일흔'], [80, '여든'], [90, '아흔'], [99, '아흔아홉'],
].forEach(([n, want]) => eq(native(n, false), want, `native(${n})`));

/* ── 순우리말. 단위 앞 꼴 — 여기가 가장 자주 틀리는 자리다 ── */
[
  [1, '한'], [2, '두'], [3, '세'], [4, '네'], [5, '다섯'], [10, '열'],
  [11, '열한'], [12, '열두'], [13, '열세'], [14, '열네'], [15, '열다섯'],
  [20, '스무'], [21, '스물한'], [22, '스물두'], [23, '스물세'], [24, '스물네'],
  [30, '서른'], [31, '서른한'], [40, '마흔'], [99, '아흔아홉'],
].forEach(([n, want]) => eq(native(n, true), want, `native(${n}, 단위 앞)`));

// 범위 밖은 null 이어야 한다. 순우리말은 아흔아홉까지만 쓴다.
[0, 100, 150].forEach((n) => {
  if (native(n, true) !== null) errs.push(`native(${n}) — 범위 밖인데 "${native(n, true)}" 가 나왔다`);
});

/* ── 만들어진 문제 ── */
let made = 0;
for (const lv of NUM_LEVELS) {
  const round = makeRound(lv, 12);
  if (round.length !== 12) errs.push(`${lv} — 12문제를 못 채웠다 (${round.length}개)`);
  for (const q of round) {
    made++;
    const where = `${lv} / "${q.ask}"`;
    if (!q.ask?.trim()) errs.push(`${where} — 문제가 비었다`);
    if (!q.answer?.trim()) errs.push(`${where} — 정답이 비었다`);
    if (!q.wrong?.trim()) errs.push(`${where} — 오답 보기가 비었다`);
    if (!q.why?.trim()) errs.push(`${where} — 설명이 비었다`);
    if (q.answer === q.wrong) errs.push(`${where} — 보기 둘이 같다. 무엇을 골라도 정답이 된다`);
    if (/undefined|null|NaN/.test(q.ask + q.answer + q.wrong + q.why)) {
      errs.push(`${where} — 빈 값이 글자로 새어 나왔다: ${q.answer} / ${q.wrong}`);
    }
  }
}

/* 한 판을 여러 번 만들어 본다. 무작위라 한 번만 보면 드문 갈래를 놓친다. */
for (let i = 0; i < 300; i++) {
  for (const lv of NUM_LEVELS) {
    for (const q of makeRound(lv, 12)) {
      made++;
      if (q.answer === q.wrong) errs.push(`${lv} / "${q.ask}" — 보기 둘이 같다`);
      if (/undefined|NaN/.test(q.answer + q.wrong)) errs.push(`${lv} / "${q.ask}" — 빈 값이 샜다: ${q.answer} / ${q.wrong}`);
    }
  }
}

console.log(`읽기 대조 ${
  [/* sino */ 27, /* native */ 18, /* attr */ 20].reduce((a, b) => a + b, 0)
}가지 · 만들어 본 문제 ${made.toLocaleString('en-US')}개`);

if (errs.length) {
  const seen = new Set();
  const uniq = errs.filter((e) => !seen.has(e) && seen.add(e));
  console.log(`\n고쳐야 할 것 ${uniq.length}건 (같은 것은 한 번만)`);
  uniq.slice(0, 30).forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('\n이상 없음');
