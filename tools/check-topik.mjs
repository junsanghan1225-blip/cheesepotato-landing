/*
 * TOPIK I 읽기 연습문제 검사기
 *
 * 이 저장소는 푸시하면 1~2분 뒤 everykoreans.com 에 그대로 나간다.
 * 문제는 AI 가 만들고 사람이 손보므로, 눈으로 스무 개를 보면 스물한 번째부터
 * 놓친다. 기계가 잡을 수 있는 것은 기계가 잡는다.
 *
 * 실행: node tools/check-topik.mjs
 *
 * 잡아내는 것
 *   - id 중복 — 진도가 id 로 묶여서 남의 문제에 기록이 붙는다
 *   - slot 이 청사진에 없거나, 그 자리의 유형·갈래와 안 맞음
 *   - 짝 지문(49~56, 59~70)인데 짝이 없거나 지문이 서로 다름
 *   - answer 가 보기 범위 밖 · 보기가 4개가 아님 · 보기 중복
 *   - passage / question / why 가 빔
 *   - **정답 자리 쏠림** — AI 는 정답을 앞쪽에 몰아넣는 버릇이 있고,
 *     그러면 학습자가 내용 대신 자리를 외운다
 *   - 같은 자리가 세 번 넘게 잇달아 나옴
 *   - 지문 중복 — 같은 지문이 두 문제에 쓰이면 두 번째는 읽지 않고 푼다
 *     (짝 지문은 빼고 본다. 거기는 같은 것이 맞다)
 *   - theme 유형인데 보기가 낱말이 아님
 *   - order 유형인데 조각이 넷이 아니거나 보기가 배열 꼴이 아님
 *   - nomatch 인데 발문이 「같은 것」을 묻고 있음 — 그러면 정답이 셋이 된다
 *   - 급수를 넘는 문법 — 1급 문제에 -는데가 들어가면 1급이 못 푸는 1급 문제가 된다
 *   - 정답 낱말이 지문에 그대로 있음(theme) — 읽지 않고 맞힌다
 *
 * 그리고 **온전한 한 회(31~70, 40문항)를 몇 회분 만들 수 있는지** 센다.
 * 유형별 합계로는 알 수 없다 — 마흔 자리 하나하나가 다 차야 한 회다.
 */
import { TOPIK_READING, TOPIK_SLOTS, TOPIK_BLUEPRINT } from '../topik.js';

const errs = [];
const warns = [];
const SLOT_OF = new Map(TOPIK_SLOTS.map((s) => [s.n, s]));
const TYPES = new Set(TOPIK_BLUEPRINT.map((b) => b.type));
const GENRES = new Set(TOPIK_BLUEPRINT.map((b) => b.genre));

/* 급수를 넘는 문법. 1급 문제에 이게 보이면 짚어 준다.
   지문·보기 어디에 있든 학습자는 읽어야 하므로 다 본다. */
const OVER_G1 = ['는데', '니까', '으면 ', '면 ', '어서 ', '아서 ', '려고', '으러', '러 가', '수 있', '수 없', 'ㄹ 것입', '을 것입'];

const seenId = new Map();
const seenPassage = new Map();
const tally = [0, 0, 0, 0];
const byGrade = {};
const pairs = new Map();
let run = 0, prev = null;

TOPIK_READING.forEach((q, i) => {
  const at = `${q.id}`;

  if (seenId.has(q.id)) errs.push(`${at} — id 중복 (먼저 나온 자리 ${seenId.get(q.id)})`);
  else seenId.set(q.id, i);

  /* ── 청사진과 맞는가 ── */
  const slot = SLOT_OF.get(q.slot);
  if (!slot) {
    errs.push(`${at} — slot ${q.slot} 은 청사진(31~70)에 없다`);
  } else {
    if (slot.type !== q.type) errs.push(`${at} — ${q.slot}번 자리는 ${slot.type} 인데 이 문제는 ${q.type} 이다`);
    if (slot.genre !== q.genre) errs.push(`${at} — ${q.slot}번 자리는 ${slot.genre} 인데 이 문제는 ${q.genre} 이다`);
    if (slot.pair && !q.pair) {
      errs.push(`${at} — ${q.slot}번은 지문을 나눠 쓰는 자리인데 pair 가 없다`);
    }
    if (!slot.pair && q.pair) {
      errs.push(`${at} — ${q.slot}번은 짝 자리가 아닌데 pair 가 붙어 있다`);
    }
  }
  if (q.pair) {
    if (!pairs.has(q.pair)) pairs.set(q.pair, []);
    pairs.get(q.pair).push(q);
  }
  if (!TYPES.has(q.type)) errs.push(`${at} — 모르는 type "${q.type}"`);
  if (!GENRES.has(q.genre)) errs.push(`${at} — 모르는 genre "${q.genre}"`);
  if (![1, 2, 3, 4, 5, 6].includes(q.grade)) errs.push(`${at} — grade 가 1~6 이 아니다 (${q.grade})`);
  byGrade[q.grade] = (byGrade[q.grade] || 0) + 1;

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errs.push(`${at} — 보기가 4개가 아니다 (${q.options?.length})`);
  } else {
    if (new Set(q.options).size !== 4) errs.push(`${at} — 보기 중에 같은 것이 있다`);
    if (q.options.some((o) => !String(o).trim())) errs.push(`${at} — 빈 보기가 있다`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) {
      errs.push(`${at} — answer 가 0~3 이 아니다 (${q.answer})`);
    } else {
      tally[q.answer]++;
      run = (q.answer === prev) ? run + 1 : 1;
      if (run > 3) errs.push(`${at} — 정답 자리 ${q.answer} 가 네 번 넘게 잇달아 나온다`);
      prev = q.answer;
    }
    // 보기 길이가 한쪽만 유난히 길면 읽지 않고 그것을 찍는다.
    const lens = q.options.map((o) => String(o).length);
    const max = Math.max(...lens), min = Math.min(...lens);
    if (max > 12 && max > min * 2.2) warns.push(`${at} — 보기 길이 차가 크다 (${min}~${max}자)`);
  }

  if (!q.question?.trim()) errs.push(`${at} — 발문이 비었다`);
  if (!q.why?.trim()) errs.push(`${at} — 해설(why)이 비었다`);
  if (q.type !== 'blank' && !q.passage?.trim()) errs.push(`${at} — 지문이 비었다`);

  /* 짝 지문은 두 문제가 같은 글을 쓰는 것이 맞다. 그 밖에는 중복이 사고다. */
  if (q.passage?.trim() && !q.pair) {
    const key = q.passage.replace(/\s+/g, '');
    if (seenPassage.has(key)) errs.push(`${at} — 지문이 ${seenPassage.get(key)} 와 같다`);
    else seenPassage.set(key, q.id);
  }

  if (q.type === 'blank' && !/\(\s*\)/.test(q.passage || '')) {
    errs.push(`${at} — blank 인데 지문에 빈칸 ( ) 이 없다`);
  }

  /* 실용문 자리는 「맞지 않는 것」을 묻는다. 발문이 뒤집히면 정답이 셋이 된다. */
  if (q.type === 'nomatch' && !/맞지 않는|같지 않은|다른 것/.test(q.question || '')) {
    errs.push(`${at} — nomatch 인데 발문이 「아닌 것」을 묻지 않는다: "${q.question}"`);
  }
  if (q.type === 'detail' && /맞지 않는|다른 것/.test(q.question || '')) {
    errs.push(`${at} — detail 인데 발문이 「아닌 것」을 묻고 있다`);
  }

  if (q.type === 'theme') {
    // 보기는 낱말이어야 한다. 문장이면 유형이 무너진다.
    q.options?.forEach((o) => {
      if (/[.?!]|습니다|입니다|어요|아요/.test(String(o))) {
        errs.push(`${at} — theme 인데 보기가 문장이다: "${o}"`);
      }
    });
    // 정답 낱말이 지문에 그대로 있으면 읽지 않고 맞힌다.
    const ans = String(q.options?.[q.answer] ?? '');
    if (ans && (q.passage || '').includes(ans)) {
      warns.push(`${at} — 정답 낱말 "${ans}" 이 지문에 그대로 있다. 읽지 않고 맞힐 수 있다`);
    }
  }

  if (q.type === 'order') {
    const parts = (q.passage || '').split('\n').filter((x) => x.trim());
    if (parts.length !== 4) errs.push(`${at} — order 인데 조각이 4개가 아니다 (${parts.length})`);
    ['(가)', '(나)', '(다)', '(라)'].forEach((m) => {
      if (!(q.passage || '').includes(m)) errs.push(`${at} — order 인데 지문에 ${m} 가 없다`);
    });
    q.options?.forEach((o) => {
      if (!/^\(.\)(-\(.\)){3}$/.test(String(o).replace(/\s/g, ''))) {
        errs.push(`${at} — order 보기가 배열 꼴이 아니다: "${o}"`);
      }
    });
  }

  if (q.type === 'insert') {
    // 지문에 넣을 자리 표시가 넷 있어야 고를 수 있다.
    ['㉠', '㉡', '㉢', '㉣'].forEach((m) => {
      if (!(q.passage || '').includes(m)) errs.push(`${at} — insert 인데 지문에 ${m} 자리가 없다`);
    });
    if (!q.sentence?.trim()) errs.push(`${at} — insert 인데 넣을 문장(sentence)이 없다`);
  }

  if (q.grade === 1) {
    /* 발문은 우리가 정해 둔 붙박이 글이라 보지 않는다. 그리고 「입니까」
       「습니까」의 니까는 1급 의문형이지 -(으)니까가 아니므로 먼저 걷어낸다. */
    const all = [q.passage, ...(q.options || [])].join(' ')
      .replace(/([습ㅂ입])니까/g, '$1니다');
    const hit = OVER_G1.filter((g) => all.includes(g));
    if (hit.length) warns.push(`${at} — 1급인데 위 급수 문법이 보인다: ${hit.join(', ')}`);
  }
});

/* 짝 지문 — 둘이 짝이고 지문이 글자까지 같아야 한다. */
pairs.forEach((list, key) => {
  if (list.length !== 2) {
    errs.push(`짝 ${key} — 문항이 ${list.length}개다 (둘이어야 한다: ${list.map((q) => q.id).join(', ')})`);
    return;
  }
  const [a, b] = list;
  if ((a.passage || '').replace(/\s+/g, '') !== (b.passage || '').replace(/\s+/g, '')) {
    errs.push(`짝 ${key} — ${a.id} 와 ${b.id} 의 지문이 다르다. 한 지문을 나눠 써야 한다`);
  }
});

/* 정답 자리 쏠림. 넷이 고르지 않으면 학습자가 자리를 외운다. */
const n = TOPIK_READING.length;
const want = n / 4;
tally.forEach((c, i) => {
  if (n >= 12 && (c < want * 0.6 || c > want * 1.6)) {
    errs.push(`정답 자리 ${i} 이 ${c}개다 (${n}문제면 ${Math.round(want)}개 안팎이어야 한다)`);
  }
});

/* ── 온전한 한 회를 몇 회분 만들 수 있나 ──────────────────────── */
const have = {};
TOPIK_READING.forEach((q) => { have[q.slot] = (have[q.slot] || 0) + 1; });
const rounds = Math.min(...TOPIK_SLOTS.map((s) => have[s.n] || 0));
const empty = TOPIK_SLOTS.filter((s) => !have[s.n]);

console.log(`문제 ${n}개 · 급수 ${Object.entries(byGrade).map(([g, c]) => `${g}급 ${c}`).join(' / ')}`);
const types = {};
TOPIK_READING.forEach((q) => { types[q.type] = (types[q.type] || 0) + 1; });
console.log(`유형 ${Object.entries(types).map(([t, c]) => `${t} ${c}`).join(' · ')}`);
console.log(`정답 자리 0:${tally[0]} 1:${tally[1]} 2:${tally[2]} 3:${tally[3]}`);
console.log(`\n청사진 자리 ${TOPIK_SLOTS.length - empty.length} / ${TOPIK_SLOTS.length} 채움 · 온전한 회차 ${rounds}회분`);
if (empty.length) {
  const byKind = new Map();
  empty.forEach((s) => {
    const k = `${s.ko} · ${s.genre}`;
    if (!byKind.has(k)) byKind.set(k, []);
    byKind.get(k).push(s.n);
  });
  console.log('아직 빈 자리');
  byKind.forEach((ns, k) => console.log(`  · ${k.padEnd(24)} ${ns.join(', ')}번  (${ns.length}자리)`));
}

if (warns.length) {
  console.log(`\n짚어 둘 것 ${warns.length}건`);
  warns.forEach((w) => console.log('  · ' + w));
}
if (errs.length) {
  console.log(`\n고쳐야 할 것 ${errs.length}건`);
  errs.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('\n이상 없음');
