/* TOPIK I 읽기 실전 모의고사 10회 책 틀 만들기 — node tools/build-topik1-mock-book.mjs
   자료: topik.js(TOPIK_READING 400문항 = 시험 번호 31~70 마다 10개 · 해설 why · 짝 지문 pair).
   10회분으로 나눌 때: 번호(31~70)마다 한 문항씩, 짝 지문(49-50 …)은 같이 움직이게, 회마다 1급 · 2급 글 수와 정답 번호(①~④) 분포가 고르게 되도록
   정해진 씨앗으로 섞는다(같은 자료면 언제나 같은 결과). 결과: docs/books/topik1-reading-mock.json
   문항은 전부 창작이고 기출이 아니다(topik.js 머리글). 손으로 고치지 않는다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOPIK_READING } from '../topik.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const N_TESTS = 10;
const bySlot = {};
for (const q of TOPIK_READING) (bySlot[q.slot] ||= []).push(q);

/* 묶음: 짝 지문은 한 묶음(번호 둘), 나머지는 번호 하나 */
const groups = []; const seen = new Set();
for (let s = 31; s <= 70; s++) {
  if (seen.has(s)) continue;
  const p = bySlot[s][0].pair;
  const slots = p ? p.split('-').map(Number) : [s];
  slots.forEach((x) => seen.add(x));
  groups.push(slots);
}
for (const g of groups) for (const s of g) if (bySlot[s].length !== N_TESTS) throw new Error(`번호 ${s} 문항이 ${bySlot[s].length}개`);
/* 한 묶음의 k 번째 문항들(번호마다)이 같은 짝이어야 한다 */
for (const g of groups) if (g.length === 2) for (let k = 0; k < N_TESTS; k++) if (bySlot[g[0]][k].passage !== bySlot[g[1]][k].passage) throw new Error(`짝 지문이 다르다 ${g} ${k}`);

/* 씨앗 고정 난수 */
let seed = 20261026; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const perm = groups.map(() => [...Array(N_TESTS).keys()]);
const itemOf = (gi, t) => groups[gi].map((s) => bySlot[s][perm[gi][t]]);
const cost = () => {
  let c = 0; const g1 = [], ans = [];
  for (let t = 0; t < N_TESTS; t++) {
    let a = 0; const cnt = [0, 0, 0, 0];
    for (let gi = 0; gi < groups.length; gi++) for (const q of itemOf(gi, t)) { if (q.grade === 1) a++; cnt[q.answer]++; }
    g1.push(a); ans.push(cnt);
  }
  const mean = g1.reduce((x, y) => x + y, 0) / N_TESTS;
  c += g1.reduce((x, y) => x + (y - mean) ** 2, 0) * 3;
  for (const cnt of ans) c += cnt.reduce((x, y) => x + (y - 10) ** 2, 0);
  /* 같은 소재(topic)가 한 회에 두 번 나오는 것 */
  for (let t = 0; t < N_TESTS; t++) { const tp = new Map(); for (let gi = 0; gi < groups.length; gi++) for (const q of itemOf(gi, t)) tp.set(q.topic, (tp.get(q.topic) || 0) + 1); for (const n of tp.values()) if (n > 1) c += (n - 1) * 0.6; }
  return c;
};
let best = cost();
for (let it = 0; it < 60000; it++) {
  const gi = Math.floor(rnd() * groups.length), a = Math.floor(rnd() * N_TESTS), b = Math.floor(rnd() * N_TESTS);
  if (a === b) continue;
  [perm[gi][a], perm[gi][b]] = [perm[gi][b], perm[gi][a]];
  const c = cost();
  if (c <= best) best = c; else [perm[gi][a], perm[gi][b]] = [perm[gi][b], perm[gi][a]];
}

const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/books/topik2-vocab-1000.json'), 'utf8'));
const inline = {}; const unitIds = [];
let g1Info = [];
for (let t = 0; t < N_TESTS; t++) {
  const id = `tr-${String(t + 1).padStart(2, '0')}`; unitIds.push(id);
  const items = groups.flatMap((g, gi) => itemOf(gi, t)).sort((x, y) => x.slot - y.slot).map((q) => ({
    no: q.slot, id: q.id, type: q.type, genre: q.genre, grade: q.grade, passage: q.passage, question: q.question, options: q.options, answer: q.answer, why: q.why, ...(q.pair ? { pair: q.pair } : {}), ...(q.sentence ? { sentence: q.sentence } : {}),
  }));
  g1Info.push(items.filter((x) => x.grade === 1).length);
  inline[id] = { id, title: { en: `Practice Test ${t + 1}`, ko: `모의고사 ${t + 1}회` }, sub: { en: 'Questions 31 to 70 in the real test format.', ko: '31~70번, 실제 시험 형식' }, sections: [{ type: 'mcq', title: { en: 'Questions 31–70', ko: '31~70번' }, items }, { type: 'omr', title: { en: 'Answer sheet', ko: '답안지' }, from: 31, to: 70 }] };
}
const book = {
  _note: '책 한 권의 틀: tools/build-topik1-mock-book.mjs 가 만든다(손으로 고치지 않는다). node tools/build-book.mjs topik1-reading-mock. 문항은 topik.js(전부 창작, 기출 아님).',
  id: 'topik1-reading-mock', published: '2026.11.10', edition: 'Draft proof · 시안', theme: 'classic', color: '#12704F', tint: '#E8F3EE',
  series: { en: 'TOPIK SERIES', ko: 'TOPIK 시리즈' },
  title: { en: 'TOPIK I Reading: 10 Practice Tests', ko: 'TOPIK I 읽기 실전 모의고사 10회' },
  sub: { en: '400 original questions in the real test format, with explanations.', ko: '새로 만든 문제 400개 · 풀이 포함' },
  levelTag: 'READING', level: 'TOPIK I', trim: base.trim, author: base.author, authorAbout: base.authorAbout, publisher: base.publisher, web: base.web,
  reviewer: base.reviewer, authorBio: base.authorBio,
  preface: {
    en: ['Ten full practice tests for the TOPIK I reading section: questions 31 to 70, 40 questions each, 400 in all.', 'Every question is newly written for this book in the format of the real test. None is a past exam question.', 'Each test has an answer sheet. At the back you will find the answer key with a short explanation for every question, so you can see why an answer is right and why the others are not.'],
    ko: ['TOPIK I 읽기 31~70번을 연습하는 실전 모의고사 10회입니다. 한 회에 40문항, 모두 400문항입니다.', '모든 문제는 실제 시험의 형식에 맞춰 이 책을 위해 새로 쓴 것입니다. 기출 문제가 아닙니다.', '회마다 답안지가 있고, 책 뒤에는 문항마다 짧은 풀이가 붙은 정답 쪽이 있습니다. 왜 그 답이 맞고 다른 답은 틀린지 확인해 보세요.'],
  },
  howto: {
    en: ['Set a timer and solve a whole test in one sitting. Check the official notice for the real time limit.', 'Mark your answers on the answer sheet at the end of the test.', 'Check with the answer key and read the explanation of every question you missed.', 'Write your score in the table and take the next test a few days later.'],
    ko: ['시간을 정해 한 회를 한 번에 풀어 보세요. 실제 시험 시간은 공식 안내를 확인하세요.', '풀고 나면 회 끝의 답안지에 답을 표시합니다.', '정답 쪽으로 맞춰 보고, 틀린 문항은 풀이를 꼭 읽습니다.', '점수를 표에 적고, 며칠 뒤 다음 회를 풉니다.'],
  },
  parts: [{ title: { en: 'Practice tests', ko: '실전 모의고사' }, units: unitIds }],
  noGuide: true, noIndex: true, noQr: true, unitCount: N_TESTS, coverAccent: '읽기',
  coverLevel: { code: 'TOPIK I', name: '1~2급', bg: '#12704F', bg2: '#0B4A33', mascot: ['cheese', 2], title: ['TOPIK I', '읽기', '실전 모의고사 10회'], sub: '새로 만든 문제 400개 · 풀이 포함' },
  back: { items: [['10 tests · 모의고사 10회', 'Questions 31-70, 40 each · 31~70번, 회마다 40문항'], ['400 original questions · 새로 만든 문제 400개', 'In the real test format; not past papers · 실제 시험 형식, 기출 아님'], ['Answer sheet and explanations · 답안지와 풀이', 'Every question explained · 모든 문항에 짧은 풀이']], for: 'For TOPIK I test takers · TOPIK I 응시 준비에', price: '정가 9.9달러' },
  inline,
};
book.sub.ko = book.coverLevel.sub;   // 표지 부제목 = 책 부제목 = ISBN 신청서 부제목(tools/check-isbn.mjs)
fs.writeFileSync(path.join(ROOT, 'docs/books/topik1-reading-mock.json'), JSON.stringify(book, null, 1) + '\n');
console.log(`TOPIK I 읽기 모의고사: ${N_TESTS}회 × 40문항 · 1급 글 수 회별 ${g1Info.join('/')} · 비용 ${best.toFixed(1)} → docs/books/topik1-reading-mock.json`);
