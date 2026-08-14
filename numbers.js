/* 숫자 읽기 게임 — 읽기 엔진과 문제 만들기.
   게임 › 숫자 읽기 가 읽는다.

   한국어 숫자의 진짜 어려움은 하나·둘·셋을 외우는 것이 아니라 **어느 쪽
   체계를 쓰는지 순간에 가르는 것**이다. 시는 순우리말(세 시)인데 분은
   한자어(삼십 분)이고, 개·명·마리는 순우리말인데 원·층·년은 한자어다.
   그래서 문제는 늘 2지선다로 내고, **오답 보기는 그럴 법한 착각으로
   만든다** — 체계를 바꿔 읽은 것, 불규칙을 규칙대로 읽은 것, 만 단위를
   영어처럼 천 단위로 끊은 것. 아무 답이나 섞으면 틀려도 배우는 게 없다.

   이 파일은 화면을 모른다. 문제를 만들어 주기만 하므로 node 로 그냥
   돌려 검사할 수 있다 — `node tools/check-numbers.mjs`.
   **읽기가 틀리면 학습자에게 틀린 것을 가르치게 되므로** 손대면 반드시
   검사기를 돌린다. */

/* ── 한자어 수 (일 이 삼…) ───────────────────────────────── */
const S_DIGIT = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const S_UNIT = ['', '십', '백', '천'];

function sinoUnder10000(n) {
  if (!n) return '';
  let out = '';
  const s = String(n).padStart(4, '0');
  for (let i = 0; i < 4; i++) {
    const d = +s[i];
    if (!d) continue;
    const u = S_UNIT[3 - i];
    // 십·백·천 앞의 1은 적지 않는다. 십이지 일십이 아니다.
    out += (d === 1 && u) ? u : S_DIGIT[d] + u;
  }
  return out;
}

/* 만 단위로 끊는다. 영어는 천 단위(thousand, million)로 끊으므로 여기가
   영어권 학습자에게 가장 어려운 자리다. 10,000 은 십천이 아니라 만이다. */
export function sino(n) {
  if (n === 0) return '영';
  const eok = Math.floor(n / 100000000);
  const man = Math.floor((n % 100000000) / 10000);
  const rest = n % 10000;
  const parts = [];
  if (eok) parts.push(sinoUnder10000(eok) + '억');
  // 만 앞의 1은 생략하지만(만), 억 앞의 1은 살린다(일억).
  if (man) parts.push((man === 1 ? '' : sinoUnder10000(man)) + '만');
  if (rest) parts.push(sinoUnder10000(rest));
  return parts.join(' ');
}

/* ── 순우리말 수 (하나 둘 셋…) ───────────────────────────── */
const N_ONES = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
const N_TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
// 단위 앞에서 모양이 바뀌는 것들. 두 잔이지 둘 잔이 아니다.
const N_ATTR = { 하나: '한', 둘: '두', 셋: '세', 넷: '네', 스물: '스무' };

/* attr=true 면 단위 명사 앞에 붙는 꼴(한·두·세·네·스무)로 준다. */
export function native(n, attr) {
  if (n < 1 || n > 99) return null;
  const t = Math.floor(n / 10), o = n % 10;
  if (!attr) return N_TENS[t] + N_ONES[o];
  if (o === 0) return N_ATTR[N_TENS[t]] || N_TENS[t];
  return N_TENS[t] + (N_ATTR[N_ONES[o]] || N_ONES[o]);
}

/* ── 단위 명사 ────────────────────────────────────────────
   어느 수를 쓰는지가 단위마다 정해져 있고, 외우는 수밖에 없다. */
const NATIVE_UNITS = [
  { u: '개', ko: '개', ex: ['사과', '빵', '지우개', '컵'] },
  { u: '명', ko: '명', ex: ['학생', '손님', '친구'] },
  { u: '마리', ko: '마리', ex: ['고양이', '강아지', '물고기'] },
  { u: '잔', ko: '잔', ex: ['커피', '물', '주스'] },
  { u: '권', ko: '권', ex: ['책', '공책'] },
  { u: '장', ko: '장', ex: ['종이', '표', '사진'] },
  { u: '병', ko: '병', ex: ['물', '주스', '우유'] },
  { u: '대', ko: '대', ex: ['자동차', '컴퓨터', '자전거'] },
  { u: '켤레', ko: '켤레', ex: ['신발', '양말'] },
  { u: '그릇', ko: '그릇', ex: ['밥', '국수'] },
  { u: '송이', ko: '송이', ex: ['장미', '꽃'] },
  { u: '벌', ko: '벌', ex: ['옷', '정장'] },
];
/* 단위마다 있을 법한 범위를 둔다. 안 두면 44학년 같은 문제가 나오고,
   학습자는 문법이 아니라 문제가 이상하다는 데 마음을 뺏긴다. */
const SINO_UNITS = [
  { u: '층', max: 30 },
  { u: '년', max: 50 },
  { u: '분', max: 59 },
  { u: '초', max: 59 },
  { u: '인분', max: 6 },
  { u: '학년', max: 6 },
  { u: '쪽', max: 99 },
];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const between = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

/* ── 문제 만들기 ──────────────────────────────────────────
   { ask, answer, wrong, why } 를 돌려준다. 화면은 answer 와 wrong 을
   섞어 두 개의 버튼으로 내고, 틀리면 why 를 한 줄 보여 준다. */

// 개수 — 순우리말 + 단위 앞 꼴. 오답은 한자어로 읽은 것.
function qCount(max) {
  const c = pick(NATIVE_UNITS);
  const n = between(1, max);
  const noun = pick(c.ex);
  return {
    ask: `${noun} ${n}${c.u}`,
    answer: `${noun} ${native(n, true)} ${c.u}`,
    wrong: `${noun} ${sino(n)} ${c.u}`,
    // 조사(은/는, 이/가)는 앞말 받침에 따라 달라진다. 화살표로 두면 어느
    // 수가 와도 어색해지지 않는다.
    why: `개수를 세는 「${c.u}」 앞에는 순우리말 수를 씁니다 — ${sino(n)} → ${native(n, true)}.`,
  };
}

// 단위 앞에서 모양이 바뀌는 1·2·3·4·20. 오답은 안 바꾼 것.
function qAttr() {
  const c = pick(NATIVE_UNITS);
  const n = pick([1, 2, 3, 4, 20]);
  const noun = pick(c.ex);
  return {
    ask: `${noun} ${n}${c.u}`,
    answer: `${noun} ${native(n, true)} ${c.u}`,
    wrong: `${noun} ${native(n, false)} ${c.u}`,
    why: `단위 앞에서 모양이 바뀝니다 — ${native(n, false)} → ${native(n, true)}.`,
  };
}

// 한자어 단위. 오답은 순우리말로 읽은 것.
function qSinoUnit(max) {
  const c = pick(SINO_UNITS);
  const n = between(1, Math.min(max, c.max));
  return {
    ask: `${n}${c.u}`,
    answer: `${sino(n)} ${c.u}`,
    wrong: `${native(n, true)} ${c.u}`,
    why: `「${c.u}」 앞에는 한자어 수(일·이·삼…)를 씁니다.`,
  };
}

// 시각. 시는 순우리말, 분은 한자어 — 한 문장 안에서 갈린다.
function qClock() {
  const h = between(1, 12);
  const m = pick([5, 10, 15, 20, 25, 30, 40, 45, 50]);
  const right = `${native(h, true)} 시 ${sino(m)} 분`;
  // 시를 틀리게 낼지 분을 틀리게 낼지 번갈아 낸다. 한쪽만 내면 그쪽만 는다.
  const breakHour = Math.random() < 0.5;
  return {
    ask: `${h}시 ${m}분`,
    answer: right,
    wrong: breakHour ? `${sino(h)} 시 ${sino(m)} 분` : `${native(h, true)} 시 ${native(m, true)} 분`,
    why: '시는 순우리말(한 시·두 시), 분은 한자어(십 분·삼십 분)로 읽습니다.',
  };
}

// 나이. 스무 살이 특히 자주 틀린다.
function qAge() {
  const n = pick([1, 2, 3, 4, 5, 7, 10, 15, 19, 20, 21, 25, 30, 40, 50]);
  return {
    ask: `${n}살`,
    answer: `${native(n, true)} 살`,
    wrong: `${sino(n)} 세`,
    why: `나이를 「살」로 셀 때는 순우리말입니다. 한자어로 셀 때는 「살」이 아니라 「세」를 씁니다(${sino(n)} 세).`,
  };
}

/* 자릿수를 하나 옮겨 읽은 오답. 큰 수에서 학습자가 실제로 하는 실수는
   엉뚱한 글자를 쓰는 것이 아니라 **자릿수를 놓치는 것**이다 — 100,000 을
   만이나 백만으로 읽는 식이다. 그래서 오답도 늘 말이 되는 한국어로 낸다.
   억지로 만든 비문은 보자마자 걸러져서 문제가 되지 않는다. */
function orderShift(n) {
  const cands = [];
  if (n * 10 <= 999999999) cands.push(n * 10);
  if (Math.floor(n / 10) >= 1) cands.push(Math.floor(n / 10));
  return sino(cands.length ? pick(cands) : n * 10);
}

// 값. 만 단위가 영어권 학습자에게 가장 어렵다.
function qMoney(big) {
  const n = big
    ? pick([10000, 15000, 23000, 50000, 100000, 250000, 1000000, 3500000])
    : pick([100, 500, 800, 1000, 1500, 2000, 3500, 7000, 9900]);
  // 10,000 만은 영어 그대로 십천(ten thousand)이라 읽는 실수가 워낙 잦아 따로 낸다.
  const wrong = (n === 10000 && Math.random() < 0.5) ? '십천' : orderShift(n);
  return {
    ask: `${n.toLocaleString('en-US')}원`,
    answer: `${sino(n)} 원`,
    wrong: `${wrong} 원`,
    why: '값은 한자어로 읽고, 한국어는 만 단위로 끊습니다. 10,000 은 십천이 아니라 「만」이에요.',
  };
}

// 큰 수. 만·억 단위로 끊는 연습만 따로 낸다.
function qBig() {
  const n = pick([10000, 30000, 120000, 500000, 1200000, 10000000, 100000000, 250000000]);
  const wrong = (n === 10000 && Math.random() < 0.5) ? '십천' : orderShift(n);
  return {
    ask: n.toLocaleString('en-US'),
    answer: sino(n),
    wrong,
    why: '한국어는 만 단위로 끊습니다. 10,000=만, 100,000=십만, 100,000,000=일억이에요.',
  };
}

/* 날짜. 6월은 유월, 10월은 시월 — 규칙대로 읽으면 틀린다.
   그 둘이 이 갈래에서 배울 거의 전부라 자주 나오게 기울여 뽑는다. */
function qMonth() {
  const m = pick([6, 6, 6, 10, 10, 10, 1, 2, 3, 4, 5, 7, 8, 9, 11, 12]);
  const SPECIAL = { 6: '유월', 10: '시월' };
  const right = SPECIAL[m] || `${sino(m)}월`;
  return {
    ask: `${m}월`,
    answer: right,
    wrong: SPECIAL[m] ? `${sino(m)}월` : `${native(m, true)}월`,
    why: SPECIAL[m]
      ? `6월은 육월이 아니라 「유월」, 10월은 십월이 아니라 「시월」입니다.`
      : '달 이름은 한자어로 읽습니다.',
  };
}

function qDay() {
  const d = between(1, 30);
  return {
    ask: `${d}일`,
    answer: `${sino(d)}일`,
    wrong: `${native(d, true)}일`,
    why: '날짜의 「일」 앞에는 한자어 수를 씁니다.',
  };
}

// 개월 ↔ 달. 같은 뜻인데 쓰는 수가 다르다.
function qMonthSpan() {
  const n = between(1, 11);
  const useGaewol = Math.random() < 0.5;
  return useGaewol
    ? { ask: `${n}개월`, answer: `${sino(n)} 개월`, wrong: `${native(n, true)} 개월`,
        why: '「개월」은 한자어(삼 개월), 「달」은 순우리말(세 달)입니다. 뜻은 같아요.' }
    : { ask: `${n}달`, answer: `${native(n, true)} 달`, wrong: `${sino(n)} 달`,
        why: '「달」은 순우리말(세 달), 「개월」은 한자어(삼 개월)입니다. 뜻은 같아요.' };
}

// 시간(기간) ↔ 분. 세 시간 삼십 분.
function qDuration() {
  const h = between(1, 9);
  const m = pick([10, 15, 20, 30, 40, 50]);
  return {
    ask: `${h}시간 ${m}분`,
    answer: `${native(h, true)} 시간 ${sino(m)} 분`,
    wrong: `${sino(h)} 시간 ${sino(m)} 분`,
    why: '「시간」은 순우리말(세 시간), 「분」은 한자어(삼십 분)입니다.',
  };
}

// 횟수의 번 ↔ 번호의 번. 같은 글자인데 읽는 수가 다르다.
function qBun() {
  const n = between(1, 9);
  const isCount = Math.random() < 0.5;
  return isCount
    ? { ask: `${n}번 갔어요`, answer: `${native(n, true)} 번 갔어요`, wrong: `${sino(n)} 번 갔어요`,
        why: '횟수를 셀 때의 「번」은 순우리말입니다(세 번 갔어요). 번호일 때는 한자어예요(삼 번 버스).' }
    : { ask: `${n}번 버스`, answer: `${sino(n)} 번 버스`, wrong: `${native(n, true)} 번 버스`,
        why: '번호를 가리키는 「번」은 한자어입니다(삼 번 버스). 횟수일 때는 순우리말이에요(세 번 갔어요).' };
}

/* 단계마다 어떤 문제를 낼지. 같은 갈래만 이어 나오면 규칙을 배우는 게
   아니라 그 화면을 외우게 되므로 섞어서 낸다. */
const PLANS = {
  beginner: [
    () => qCount(10), () => qCount(10), () => qAttr(),
    () => qClock(), () => qSinoUnit(60), () => qMoney(false), () => qAge(),
  ],
  intermediate: [
    () => qCount(30), () => qAttr(), () => qClock(), () => qClock(),
    () => qSinoUnit(99), () => qAge(), () => qMoney(true),
    () => qMonth(), () => qDay(), () => qDuration(),
  ],
  advanced: [
    () => qBig(), () => qBig(), () => qMonthSpan(), () => qBun(),
    () => qMonth(), () => qDuration(), () => qMoney(true),
    () => qCount(99), () => qSinoUnit(99), () => qClock(),
  ],
};

export const NUM_LEVELS = Object.keys(PLANS);

/* 한 판치 문제. 같은 문제가 잇달아 나오지 않게만 거른다 — 완전히 겹치지
   않게 하려면 문제 수를 못 채우는 단계가 생긴다. */
export function makeRound(level, count) {
  const plan = PLANS[level] || PLANS.beginner;
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const q = pick(plan)();
    if (!q || q.answer === q.wrong) continue;              // 보기 둘이 같으면 답이 둘이다
    if (out.length && out[out.length - 1].ask === q.ask) continue;
    out.push(q);
  }
  return out;
}
