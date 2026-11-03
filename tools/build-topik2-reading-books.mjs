/* TOPIK II 읽기 유형별 4권 책 틀 만들기 — node tools/build-topik2-reading-books.mjs  (운영자 2026-10-31 「읽기 유형별 4권 좋아 그대로 진행」)
   자료: topik2.js(TOPIK2_READING 605문항, 전부 창작 · 기출 아님). 유형으로 4권: ① 어휘 · 문법(빈칸 · 비슷한 말) ② 주제 · 제목 · 중심 생각 ③ 내용 일치 ④ 순서 · 문장 넣기 · 심정 · 태도 · 글쓴이 의도.
   한 권 = 연습 회(10문항 안팎) 여러 개 + 회마다 답안지 + 맨 뒤 정답 · 풀이. 회 안에서는 급(3→6) 순으로 쉬운 것부터, 소재가 겹치지 않게 섞는다. 풀이 방법 쪽(유형마다)은 TOPIK I 모의고사 책의 TYPE_INFO 를 재사용하고 없는 유형 넷은 아래에 쓴다.
   결과: docs/books/topik2-reading-1..4.json (손으로 고치지 않는다). 책 만들기: node tools/build-book.mjs topik2-reading-N */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOPIK2_READING } from '../topik2.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/books/topik2-vocab-1000.json'), 'utf8'));
const mockSrc = fs.readFileSync(path.join(ROOT, 'tools/build-topik1-mock-book.mjs'), 'utf8');
const mt = /const TYPE_INFO = (\{[\s\S]*?\n\});\n/.exec(mockSrc);
const TYPE_INFO = new Function(`return ${mt[1]}`)();
Object.assign(TYPE_INFO, {
  paraphrase: { ko: '비슷한 말 고르기', en: 'Pick the closest meaning', ask: ['밑줄 친 부분과 의미가 비슷한 것을 고르십시오.', 'Choose the one closest in meaning to the underlined part.'],
    steps: [
      ['밑줄 친 표현이 들어간 문장을 끝까지 읽고, 그 문장의 뜻을 쉬운 말로 바꿔 말해 봐요.', 'Read the whole sentence with the underlined part and say its meaning in easy words.'],
      ['밑줄 친 표현만 따로 풀어 봐요. 문법이면 「뜻 + 때 · 이유 · 조건」을, 낱말이면 비슷한 말을 떠올려요.', 'Explain the underlined part alone: for grammar, its meaning (time, reason, condition); for a word, a synonym.'],
      ['보기를 하나씩 밑줄 자리에 넣어 읽어요. 문장의 뜻이 그대로이면 정답 후보예요.', 'Put each option in place of the underlined part. If the meaning stays the same, it is a candidate.'],
      ['뜻이 반대이거나 시간 · 이유가 바뀌면 버려요(-더니 · -다가 · -(으)ㄴ 덕분에 …).', 'Drop options that reverse the meaning or change the time or reason.'],
    ],
    words: [['-(으)ㄹ 뿐만 아니라', 'not only … but also'], ['-는 바람에', 'because of (bad result)'], ['-(으)ㄴ 덕분에', 'thanks to'], ['-자마자', 'as soon as'], ['-(으)ㄹ 만하다', 'worth doing'], ['-기 마련이다', 'is bound to'], ['-(으)ㄴ/는 편이다', 'tend to be']],
    trap: ['모양이 비슷한 문법이라도 뜻(원인 · 결과 · 시간)이 다르면 오답이에요.', 'Grammar that looks alike can still differ in meaning: cause, result or time.'] },
  headline: { ko: '제목 고르기', en: 'Pick the headline', ask: ['다음 글(신문 기사 제목)의 내용을 가장 잘 설명한 것을 고르십시오.', 'Choose the explanation that best fits the headline.'],
    steps: [
      ['제목의 핵심 낱말(명사 · 동사)에 동그라미를 쳐요. 조사와 어미는 줄여서 읽어요.', 'Circle the key nouns and verbs. Headlines drop particles and endings, so add them back.'],
      ['줄여 쓴 말을 풀어 써요: 「가격 ↑」 = 값이 올랐다, 「~ 눈길」 = 관심을 끌다.', 'Expand the shortened phrase: "price ↑" = the price went up; "~ 눈길" = attracts attention.'],
      ['보기를 하나씩 읽고 제목과 같은 내용인지 봐요. 늘었다 · 줄었다 · 높아졌다 같은 방향 낱말에 특히 주의해요.', 'Read each option and compare. Watch direction words: up, down, higher, lower.'],
      ['제목에 없는 내용을 덧붙인 보기는 버려요.', 'Drop options that add what the headline does not say.'],
    ],
    words: [['증가', 'increase'], ['감소', 'decrease'], ['인기', 'popularity'], ['확대', 'expansion'], ['개최', 'holding (an event)'], ['출시', 'release'], ['눈길을 끌다', 'to catch the eye'], ['관심이 높아지다', 'interest rises']],
    trap: ['방향 낱말(늘다 ↔ 줄다)이 반대인 보기가 많아요. 제목의 방향을 먼저 확인하세요.', 'Many wrong options reverse the direction (up vs down). Check the direction in the headline first.'] },
  feeling: { ko: '밑줄 친 부분의 심정', en: "The writer's feeling", ask: ['밑줄 친 부분에 나타난 ‘나’의 심정으로 가장 알맞은 것을 고르십시오.', 'Choose the feeling of "I" shown in the underlined part.'],
    steps: [
      ['밑줄 친 문장의 앞뒤를 읽고 무슨 일이 있었는지 한 줄로 말해요.', 'Read around the underlined part and say what happened in one line.'],
      ['그 일을 겪은 ‘나’의 행동을 찾아요: 한숨을 쉬다 · 웃음이 나다 · 가슴이 뛰다 · 눈물이 나다.', 'Find what "I" did: sighed, smiled, heart raced, cried.'],
      ['행동 → 감정으로 바꿔요: 한숨 = 걱정 · 아쉬움, 가슴이 뛰다 = 설렘 · 긴장.', 'Turn action into feeling: sigh = worry or regret; racing heart = excitement or nerves.'],
      ['보기 네 개의 감정 낱말 중 일의 결과(좋은 일 · 나쁜 일)에 맞는 것만 남겨요.', 'Keep the feeling that matches the outcome (good or bad).'],
    ],
    words: [['설레다', 'to be excited'], ['긴장되다', 'to be nervous'], ['아쉽다', 'to feel regret'], ['안도하다', 'to feel relieved'], ['당황스럽다', 'to be flustered'], ['뿌듯하다', 'to feel proud'], ['서운하다', 'to feel hurt'], ['걱정스럽다', 'to be worried']],
    trap: ['글에 감정 낱말이 직접 나오지 않을 때가 많아요. 행동에서 감정을 읽으세요.', 'The feeling word is often not in the text. Read it from the action.'] },
  attitude: { ko: '글쓴이의 태도', en: "The writer's attitude", ask: ['이 글에 나타난 필자의 태도로 가장 알맞은 것을 고르십시오.', "Choose the writer's attitude."],
    steps: [
      ['글 끝의 문장 끝(어미)을 보세요: -아/어야 한다(주장) · -ㄹ 것이다(전망) · -기 어렵다(비판).', 'Look at the sentence endings: should (claim), will (forecast), is hard (criticism).'],
      ['글쓴이가 찬성 · 반대 · 걱정 · 기대 중 어느 쪽인지 평가하는 말을 찾아요(문제이다 · 바람직하다).', 'Find evaluation words: problem, desirable, worrying.'],
      ['보기의 태도 낱말(비판하다 · 우려하다 · 기대하다 · 설명하다)을 글의 표현과 맞춰 봐요.', 'Match the option verbs (criticize, worry, expect, explain) to the text.'],
    ],
    words: [['비판하다', 'to criticize'], ['우려하다', 'to be concerned'], ['기대하다', 'to expect'], ['강조하다', 'to emphasize'], ['주장하다', 'to claim'], ['설명하다', 'to explain'], ['바람직하다', 'desirable']],
    trap: ['사실만 전하는 글에 감정 태도를 붙인 보기는 오답일 때가 많아요.', 'An option that adds emotion to a purely factual text is usually wrong.'] },
});
const ORDER_ALL = ['blank', 'paraphrase', 'theme', 'headline', 'main', 'detail', 'order', 'insert', 'feeling', 'attitude', 'intent'];
for (const t of ORDER_ALL) if (!TYPE_INFO[t]) throw new Error(`설명이 없는 유형 ${t}`);

/* 운영자 2026-11-02 「유형 1 · 2 이렇게 나누는 것보다 1~15번 …번호로」: 읽기 4권을 시험 번호(slot) 구간으로 나눈다. 번호마다 문항 수가 달라(1~4번 4개씩 · 5~31번 19개씩 · 32~50번 4개씩) 쪽 수가 고르게 되도록 1~15 · 16~24 · 25~31 · 32~50 */
/* 권장 풀이 시간(운영자 2026-11-02 「읽기 4권에도 권장 시간」): 실제 TOPIK II 읽기 50문항 70분 = 문항당 평균 84초 — 회의 문항 수에 비례한 평균값이라 「권장」으로만 쓴다 */
// 같은 번호면 「25~25」 대신 「25」
const rng = (chunk, sep) => { const lo = Math.min(...chunk.map((q) => q.slot)), hi = Math.max(...chunk.map((q) => q.slot)); return lo === hi ? `${lo}` : `${lo}${sep}${hi}`; };
const EXAMPLES = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/examples/reading-examples.json'), 'utf8'));   // 따로 만든 예시 + 단계별 풀이 · 팁(운영자 2026-11-02)
const recMin = (n) => Math.max(1, Math.round(n * 84 / 60));
const BOOKS = [
  { n: 1, from: 1, to: 15, bg: '#2E9E9E', bg2: '#1C6B6B', mascot: 3, ink: '#2E9E9E' },
  { n: 2, from: 16, to: 24, bg: '#7C1D1D', bg2: '#521212', mascot: 4, ink: '#7C1D1D' },
  { n: 3, from: 25, to: 45, bg: '#9E2E8B', bg2: '#6B1C5D', mascot: 5, ink: '#9E2E8B' },
  { n: 4, from: 46, to: 50, bg: '#455F11', bg2: '#2D3F0A', mascot: 6, ink: '#455F11' },
];
const rangeOf = (set) => { const a = [...set].sort((x, y) => x - y); const out = []; for (let i = 0; i < a.length;) { let j = i; while (j + 1 < a.length && a[j + 1] === a[j] + 1) j++; out.push(j > i ? `${a[i]}~${a[j]}` : `${a[i]}`); i = j + 1; } return out.join(', '); };
let seed = 20261101; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const circ = '①②③④';

for (const B of BOOKS) {
  const all = TOPIK2_READING.filter((q) => q.slot >= B.from && q.slot <= B.to);
  B.types = ORDER_ALL.filter((t) => all.some((q) => q.type === t));
  B.name = { ko: `${B.from}~${B.to}번`, en: `Questions ${B.from}–${B.to}` };
  B.sub = { ko: '시험 번호 순서대로 연습', en: 'practice in exam-number order' };   // 표지 글을 줄이려고 짧게(운영자 2026-11-02)
  /* 급(3~6)이 앞에서 뒤로 올라가되, 한 회에는 소재 · 유형이 겹치지 않게: 급 → 유형 번갈아, 같은 소재는 멀리 */
  const sorted = [...all].sort((a, b) => (a.slot - b.slot) || (a.grade - b.grade) || (rnd() - 0.5));   // 시험 번호 순서 → 같은 번호 안에서는 급(3→6) 순
  const order = sorted;   // 번호 순서 그대로
  const answerCount = [0, 0, 0, 0]; all.forEach((q) => answerCount[q.answer]++);
  const inline = {}, unitIds = [];
  const methodBefore = {};   // 유형 풀이 방법 쪽을 그 유형의 첫 문제 회 앞에 넣는다(운영자 2026-11-03 「풀이 방법 → 유형별 문제 → 다음 풀이 방법」)
  const sets = [];
  for (const t of B.types) { const qs = order.filter((q) => q.type === t).sort((a, b) => (a.grade - b.grade) || (a.slot - b.slot));   // 유형마다: 풀이 방법 → 연습문제(쉬운 5문항) → 실전문제(나머지, 10문항 안팎씩)
    const pr = qs.slice(0, 5), rest = qs.slice(5).sort((a, b) => (a.slot - b.slot) || (a.grade - b.grade));
    sets.push({ t, k: 0, chunk: pr });
    if (rest.length) { const lim = ['blank', 'paraphrase', 'theme', 'headline'].includes(t) ? 10 : ['order', 'insert'].includes(t) ? 5 : 7; const n = Math.ceil(rest.length / lim), sz = Math.ceil(rest.length / n); for (let k = 0; k < n; k++) sets.push({ t, k: k + 1, chunk: rest.slice(k * sz, k * sz + sz) }); } }
  for (let u = 0; u < sets.length; u++) {
    const { t: stype, k: setNo, chunk } = sets[u]; if (!chunk.length) break;
    const id = `r${B.n}-${String(u + 1).padStart(2, '0')}`; unitIds.push(id); if (setNo === 0) methodBefore[id] = stype;
    const items = chunk.map((q, k) => ({ no: k + 1, id: q.id, type: q.type, genre: q.genre, grade: q.grade, passage: q.passage, question: q.question, options: q.options, answer: q.answer, why: q.why, ...(q.sentence ? { sentence: q.sentence } : {}) }));
    inline[id] = { id, title: setNo ? { en: `${TYPE_INFO[stype].en} · Test set ${setNo}`, ko: `${TYPE_INFO[stype].ko} 실전문제 ${setNo}회` } : { en: `${TYPE_INFO[stype].en} · Warm-up`, ko: `${TYPE_INFO[stype].ko} 연습문제` }, sub: { en: `${chunk.length} questions · exam no. ${rng(chunk, '–')} · about ${recMin(chunk.length)} min`, ko: `${chunk.length}문항 · 시험 ${rng(chunk, '~')}번 · 권장 약 ${recMin(chunk.length)}분` }, sections: [{ type: 'mcq', title: { en: `Questions 1–${chunk.length}`, ko: `1~${chunk.length}번` }, items }, { type: 'selfcheck', title: { en: 'Self check', ko: '스스로 점검' }, compact: true, rec: recMin(chunk.length), total: chunk.length, from: 1, no: u + 1, unitWord: '문제', noEn: 'Set No.', key: items.map((q) => q.answer) }] };
  }
  const exampleOf = (t) => all.filter((q) => q.type === t && (t !== 'insert' || q.sentence)).sort((a, b) => a.passage.length - b.passage.length)[0];
  const methods = B.types.filter((t) => all.some((q) => q.type === t)).map((t) => { const m = TYPE_INFO[t]; const ex = exampleOf(t); const ofType = all.filter((q) => q.type === t);
    return { type: t, nos: rangeOf(new Set(ofType.map((q) => q.slot))), count: ofType.length, name: { ko: m.ko, en: m.en }, ask: { ko: m.ask[0], en: m.ask[1] }, steps: m.steps.map(([ko, en, sub]) => ({ ko, en, ...(sub ? { sub: sub.map(([k, e]) => ({ ko: k, en: e })) } : {}) })), words: m.words.map(([ko, en]) => ({ ko, en })), trap: { ko: m.trap[0], en: m.trap[1] },
      example: EXAMPLES['II:' + t] ? { ...EXAMPLES['II:' + t] } : { id: ex.id, no: ex.slot, question: ex.question, passage: ex.passage, ...(ex.sentence ? { sentence: ex.sentence } : {}), options: ex.options, answer: ex.answer, why: ex.why } }; });
  const N = all.length, kt = B.name.ko, et = B.name.en;
  const book = {
    _note: `책 한 권의 틀: tools/build-topik2-reading-books.mjs 가 만든다(손으로 고치지 않는다). node tools/build-book.mjs topik2-reading-${B.n}. 문항은 topik2.js(전부 창작, 기출 아님).`,
    id: `topik2-reading-${B.n}`, published: '2026.11.10', edition: 'Draft proof · 시안', theme: 'classic', color: B.ink, tint: '#F4F4F2',
    series: { en: 'TOPIK SERIES', ko: 'TOPIK 시리즈' },
    title: { en: `TOPIK II Reading: Questions ${B.from}–${B.to}`, ko: `TOPIK II 읽기 ${B.from}~${B.to}번` },
    sub: { en: `${N} original questions: ${B.sub.en.toLowerCase()}, with explanations.`, ko: `새로 만든 문제 ${N}개 · ${B.sub.ko}` },
    levelTag: 'READING', level: 'TOPIK II', trim: base.trim, author: base.author, authorAbout: base.authorAbout, publisher: base.publisher, web: base.web, reviewer: base.reviewer, authorBio: base.authorBio,
    preface: {
      en: [`${N} questions for TOPIK II reading questions ${B.from} to ${B.to}, in exam-number order: ${B.sub.en}. Work through the numbers until the pattern becomes automatic.`, 'Every question is newly written for this book in the style of the real test. None is a past exam question.', 'Each question type opens with its solving steps and the words you need, then warm-up questions and test sets for that type follow. Each set ends with a self-check, and the answer key at the back explains every question.'],
      ko: [`TOPIK II 읽기 ${B.from}~${B.to}번에 해당하는 ${N}문항입니다. 시험 번호 순서대로 풀며 번호마다 달라지는 유형의 풀이 순서를 익힙니다.`, '모든 문제는 실제 시험의 형식에 맞춰 이 책을 위해 새로 쓴 것이고, 기출 문제가 아닙니다.', '유형마다 풀이 방법과 필요한 낱말이 먼저 나오고, 그 뒤에 연습문제(쉬운 5문항)와 실전문제가 이어집니다. 회마다 스스로 점검이 있고, 뒤쪽 정답에서 모든 문항의 풀이를 확인합니다.'] },
    howto: { en: ['At the start of each type, read the method and word pages first.', 'Solve one set at a time within its recommended time (about 1 min 24 s per question) and mark your answers in the book.', 'Check the answer key and read the explanation of every question you missed.', 'Redo the missed questions after a few days.'], ko: ['새 유형이 시작될 때마다 풀이 방법과 필요한 낱말 쪽을 먼저 읽습니다.', '유형별 문제를 한 회씩, 회 첫 쪽의 권장 시간(문항당 평균 1분 24초)에 맞춰 풀고 답안지에 표시합니다.', '정답을 확인하고, 틀린 문항의 풀이를 꼭 읽습니다.', '며칠 뒤 틀린 문항을 다시 풉니다.'] },
    parts: [{ title: { en: 'Questions by type', ko: '유형별 문제' }, units: unitIds }],
    methods, methodBefore, noGuide: true, noIndex: true, noQr: true, unitCount: unitIds.length, coverAccent: '읽기',
    coverLevel: { code: 'TOPIK II', name: '3~6급', bg: B.bg, bg2: B.bg2, mascot: ['cheese', B.mascot], pastel: true, title: ['TOPIK II', '읽기', `${B.from}~${B.to}번`], sub: `새로 만든 문제 ${N}개 · ${B.sub.ko}` },
    back: { items: [[`${unitIds.length} sets · 유형별 문제 ${unitIds.length}회`, `${N} questions for exam no. ${B.from}–${B.to} · 시험 ${B.from}~${B.to}번 ${N}문항`], [`${N} original questions · 새로 만든 문제 ${N}개`, 'In the real test style; not past papers · 실제 시험 형식, 기출 아님'], ['Answer sheet and explanations · 답안지와 풀이', 'Every question explained · 모든 문항에 짧은 풀이']], for: 'For TOPIK II test takers · TOPIK II 응시 준비에', price: '정가 9.9달러' },
    inline,
  };
  book.sub.ko = book.coverLevel.sub;
  fs.writeFileSync(path.join(ROOT, `docs/books/topik2-reading-${B.n}.json`), JSON.stringify(book, null, 1) + '\n');
  console.log(`topik2-reading-${B.n}: ${kt} · ${N}문항 · ${unitIds.length}회 · 정답 분포 ${answerCount.join('/')} → docs/books/topik2-reading-${B.n}.json`);
}
