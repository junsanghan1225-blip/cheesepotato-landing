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


/* 유형별 풀이 방법 + 필요한 단어(운영자 2026-10-26 「풀이 방법 밑에 필요한 단어까지 · 문항마다 아니고 유형별로」).
   유형 이름 · 번호는 위 자료의 type 에서 센다(번호가 바뀌면 같이 바뀐다). 단어는 그 유형에서 자주 쓰이는 말만 · 쉽게. */
const TYPE_INFO = {
  theme: { ko: '주제 고르기', en: 'Choose the topic', ask: ['무엇에 대한 이야기입니까?', 'What is the text about?'],
    steps: [['글에서 되풀이되는 낱말이나 내용을 찾아요.', 'Find the words or ideas that repeat.'], ['그 낱말들을 한마디로 묶어 보세요. 수영 · 축구 → 운동.', 'Put them under one word. swimming + soccer → exercise.'], ['보기에서 그 한마디를 고르고, 글에 한 번만 나온 낱말에는 속지 않아요.', 'Pick that word. Do not be fooled by a word that appears only once.']],
    words: [['직업', 'job'], ['취미', 'hobby'], ['장소', 'place'], ['가족', 'family'], ['음식', 'food'], ['계절', 'season'], ['날씨', 'weather'], ['나이', 'age'], ['시간', 'time'], ['운동', 'exercise'], ['쇼핑', 'shopping'], ['나라', 'country']],
    trap: ['보기의 낱말이 글에 그대로 나왔다고 정답은 아니에요. 글 전체를 묶는 말을 고르세요.', 'A word from the text is not always the answer. Choose the word that covers the whole text.'] },
  blank: { ko: '빈칸 채우기', en: 'Fill in the blank', ask: ['(  )에 들어갈 말로 가장 알맞은 것을 고르십시오.', 'Choose the best word or form for the blank.'],
    steps: [['빈칸 앞과 뒤 문장을 먼저 읽고 뜻을 잡아요.', 'Read the sentences before and after the blank.'], ['빈칸 바로 뒤의 말(합니다 · 에 · 을)과 자연스럽게 이어지는 꼴을 찾아요.', 'Check what comes right after the blank. The form must fit it.'], ['낱말 문제는 앞뒤 뜻에 어울리는 것, 문법 문제는 연결 말(그래서 · 하지만)에 맞는 것을 골라요.', 'For a word question pick the meaning that fits. For a grammar question follow the connector.']],
    words: [['그래서', 'so'], ['그리고', 'and'], ['그런데', 'but, by the way'], ['하지만', 'however'], ['-아/어서', 'because; and then'], ['-(으)니까', 'because'], ['-지만', 'but'], ['-(으)려고', 'in order to'], ['-(으)면서', 'while doing'], ['-기로 하다', 'to decide to'], ['-(으)ㄹ 것이다', 'will'], ['-아/어야 하다', 'must']],
    trap: ['보기가 같은 낱말의 여러 꼴이면 뜻이 아니라 문법 문제예요. 빈칸 뒤를 꼭 보세요.', 'If all options are forms of one word, it is a grammar question. Look at what follows the blank.'] },
  nomatch: { ko: '안내문 읽기 · 맞지 않는 것', en: 'Notices: what does not match', ask: ['다음을 읽고 맞지 않는 것을 고르십시오.', 'Choose the one that does NOT match the notice.'],
    steps: [['안내문의 시간 · 날짜 · 요일 · 값 · 장소에 밑줄을 쳐요.', 'Underline the time, date, day, price and place.'], ['보기를 하나씩 안내문과 맞춰 봐요.', 'Check each option against the notice, one by one.'], ['「맞지 않는 것」을 찾는 문제예요. 안내문과 다른 보기가 정답이에요.', 'You are looking for the wrong one. The option that differs is the answer.']],
    words: [['기간', 'period'], ['일시', 'date and time'], ['장소', 'place'], ['대상', 'who it is for'], ['회비', 'membership fee'], ['무료', 'free'], ['신청', 'application'], ['접수', 'registration'], ['문의', 'inquiry'], ['휴관일', 'closed day'], ['영업시간', 'business hours'], ['준비물', 'things to bring'], ['할인', 'discount'], ['선착순', 'first come, first served']],
    trap: ['오전 · 오후와 숫자(열 시 · 두 시 · 삼 일)를 바꿔 말한 보기가 많아요. 숫자를 꼭 다시 확인하세요.', 'Options often change a number or a.m./p.m. Check the numbers again.'] },
  detail: { ko: '내용 일치', en: 'Same as the text', ask: ['다음 글의 내용과 같은 것을 고르십시오.', 'Choose the one that matches the text.'],
    steps: [['보기의 중요한 낱말에 표시해요.', 'Mark the key words in each option.'], ['글에서 그 낱말을 찾아 같은지 비교해요.', 'Find them in the text and compare.'], ['반대말 · 숫자 · 때(어제 · 오늘)를 바꾼 보기는 버려요.', 'Drop options that change an opposite, a number or the time (yesterday, today).']],
    words: [['전혀', 'not at all'], ['모두', 'all'], ['만', 'only'], ['처음', 'first time'], ['아직', 'not yet'], ['이미', 'already'], ['먼저', 'first'], ['나중에', 'later'], ['항상', 'always'], ['가끔', 'sometimes'], ['거의', 'almost'], ['함께', 'together']],
    trap: ['「전혀 · 모두 · 항상 · 만」처럼 센 말이 든 보기는 글과 다른 경우가 많아요.', 'Options with strong words like never, all, always or only are often wrong.'] },
  main: { ko: '중심 생각 찾기', en: 'Find the main idea', ask: ['다음 글의 중심 생각으로 가장 알맞은 것을 고르십시오.', 'Choose the main idea.'],
    steps: [['글 전체를 한 번 읽고 어떤 이야기인지 잡아요.', 'Read the whole text once.'], ['마지막 문장과 「그래서 · 하지만」 뒤의 문장을 보세요. 하고 싶은 말이 거기 있어요.', 'Look at the last sentence and the sentence after so / however. The point is there.'], ['글에 나온 사실 하나만 말하는 보기는 버리고, 글쓴이가 하고 싶은 말을 고르세요.', 'Drop options that give only one fact. Pick what the writer wants to say.']],
    words: [['중요하다', 'to be important'], ['필요하다', 'to be necessary'], ['-는 것이 좋다', 'it is good to'], ['-아/어야 하다', 'must; should'], ['그래서', 'so'], ['하지만', 'however'], ['따라서', 'therefore'], ['결국', 'in the end'], ['특히', 'especially'], ['습관', 'habit'], ['건강', 'health']],
    trap: ['글에 있는 말을 그대로 쓴 보기라도 사실 하나일 뿐이면 중심 생각이 아니에요.', 'An option copied from the text can still be just one fact, not the main idea.'] },
  order: { ko: '순서 맞추기', en: 'Put the sentences in order', ask: ['다음을 순서대로 맞게 배열한 것을 고르십시오.', 'Choose the correct order.'],
    steps: [['첫 문장을 먼저 정해요. 처음 상황을 알리고, 「그 · 이 · 그래서」가 없는 문장이에요.', 'Find the first sentence: it sets the scene and has no that / this / so.'], ['「그래서 · 그다음 · 그 후」와 「이 · 그」가 가리키는 말을 보고 이어요.', 'Link sentences by so / next / after that and by what this / that points to.'], ['시간 순서(준비 → 하기 → 끝)로 읽어 보고, 보기 순서와 맞춰요.', 'Read in time order (prepare → do → finish) and match an option.']],
    words: [['먼저', 'first'], ['그다음', 'next'], ['그 후', 'after that'], ['마지막으로', 'finally'], ['그리고', 'and'], ['그래서', 'so'], ['그런데', 'but, by the way'], ['드디어', 'at last'], ['그때', 'at that time'], ['-기 전에', 'before doing'], ['-(으)ㄴ 후에', 'after doing']],
    trap: ['「그래서 · 그런데」로 시작하는 문장은 첫 문장이 될 수 없어요.', 'A sentence that begins with so or but cannot be the first.'] },
  insert: { ko: '문장 넣기', en: 'Where does the sentence go?', ask: ['다음 문장이 들어갈 곳으로 가장 알맞은 것을 고르십시오.', 'Choose where the given sentence fits.'],
    steps: [['<보기> 문장을 읽고, 「그때 · 그래서 · 이렇게」 같은 연결 말을 찾아요.', 'Read the given sentence and find its connector: then / so / like this.'], ['글의 ㄱ ~ ㄹ 앞뒤 문장을 읽어요.', 'Read the sentences before and after each marked spot.'], ['넣었을 때 앞뒤 이야기가 자연스럽게 이어지는 곳을 골라요.', 'Choose the spot where the story flows naturally.']],
    words: [['그때', 'at that time'], ['그래서', 'so'], ['이렇게', 'like this'], ['그렇게', 'like that'], ['그 뒤부터', 'from then on'], ['처음에는', 'at first'], ['그런데', 'but, by the way'], ['또', 'again; also'], ['그제야', 'only then'], ['덕분에', 'thanks to']],
    trap: ['「그렇게 · 이렇게」가 있는 문장은 바로 앞에 그 일이 먼저 나와야 해요.', 'A sentence with so / like this needs the event it refers to just before it.'] },
  intent: { ko: '글을 쓴 이유', en: 'Why was it written?', ask: ['이 글을 쓴 이유로 가장 알맞은 것을 고르십시오.', 'Choose the writer\'s purpose.'],
    steps: [['글의 종류(안내문 · 광고 · 메일)와 제목을 먼저 봐요.', 'Check the kind of text (notice, ad, e-mail) and the title.'], ['「-아/어 주시기 바랍니다 · -고자 합니다」 같은 부탁 · 안내 표현을 찾아요.', 'Find request or notice phrases such as please … / we would like to …'], ['그 표현이 가리키는 일(알림 · 부탁 · 모집 · 초대)을 보기에서 고르세요.', 'Pick the option that names the act: informing, asking, recruiting, inviting.']],
    words: [['안내', 'notice, guide'], ['부탁', 'request'], ['요청', 'request'], ['신청', 'application'], ['모집', 'recruitment'], ['초대', 'invitation'], ['사과', 'apology'], ['감사', 'thanks'], ['알리다', 'to inform'], ['-아/어 주시기 바랍니다', 'please (formal)'], ['-(으)려고', 'in order to (end of options)']],
    trap: ['글에 나온 낱말이 많은 보기보다, 글 전체의 목적에 맞는 보기가 정답이에요.', 'The answer is the purpose of the whole text, not the option with the most words from it.'] },
};
const ORDER = ['theme', 'blank', 'nomatch', 'detail', 'main', 'order', 'insert', 'intent'];
const nosOf = {};
for (const q of TOPIK_READING) (nosOf[q.type] ||= new Set()).add(q.slot);
const rangeOf = (set) => { const a = [...set].sort((x, y) => x - y); const out = []; for (let i = 0; i < a.length;) { let j = i; while (j + 1 < a.length && a[j + 1] === a[j] + 1) j++; out.push(j > i ? `${a[i]}~${a[j]}` : `${a[i]}`); i = j + 1; } return out.join(', '); };
const methods = ORDER.map((t) => { const m = TYPE_INFO[t]; if (!m || !nosOf[t]) throw new Error(`유형 ${t} 자료 없음`); return { type: t, nos: rangeOf(nosOf[t]), count: nosOf[t].size, name: { ko: m.ko, en: m.en }, ask: { ko: m.ask[0], en: m.ask[1] }, steps: m.steps.map(([ko, en]) => ({ ko, en })), words: m.words.map(([ko, en]) => ({ ko, en })), trap: { ko: m.trap[0], en: m.trap[1] } }; });
for (const q of TOPIK_READING) if (!TYPE_INFO[q.type]) throw new Error(`설명이 없는 유형 ${q.type}`);

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
    en: ['Ten full practice tests for the TOPIK I reading section: questions 31 to 70, 40 questions each, 400 in all.', 'Every question is newly written for this book in the format of the real test. None is a past exam question.', 'Before the tests, one page per question type shows how to solve it and the words you need. Each test has an answer sheet. At the back you will find the answer key with a short explanation for every question, so you can see why an answer is right and why the others are not.'],
    ko: ['TOPIK I 읽기 31~70번을 연습하는 실전 모의고사 10회입니다. 한 회에 40문항, 모두 400문항입니다.', '모든 문제는 실제 시험의 형식에 맞춰 이 책을 위해 새로 쓴 것입니다. 기출 문제가 아닙니다.', '시험 앞에 유형별 풀이 방법과 필요한 단어를 한 쪽씩 실었습니다. 회마다 답안지가 있고, 책 뒤에는 문항마다 짧은 풀이가 붙은 정답 쪽이 있습니다. 왜 그 답이 맞고 다른 답은 틀린지 확인해 보세요.'],
  },
  howto: {
    en: ['Set a timer and solve a whole test in one sitting. Check the official notice for the real time limit.', 'Mark your answers on the answer sheet at the end of the test.', 'Check with the answer key and read the explanation of every question you missed.', 'Write your score in the table and take the next test a few days later.'],
    ko: ['시간을 정해 한 회를 한 번에 풀어 보세요. 실제 시험 시간은 공식 안내를 확인하세요.', '풀고 나면 회 끝의 답안지에 답을 표시합니다.', '정답 쪽으로 맞춰 보고, 틀린 문항은 풀이를 꼭 읽습니다.', '점수를 표에 적고, 며칠 뒤 다음 회를 풉니다.'],
  },
  parts: [{ title: { en: 'Practice tests', ko: '실전 모의고사' }, units: unitIds }],
  methods, noGuide: true, noIndex: true, noQr: true, unitCount: N_TESTS, coverAccent: '읽기',
  coverLevel: { code: 'TOPIK I', name: '1~2급', bg: '#12704F', bg2: '#0B4A33', mascot: ['cheese', 2], title: ['TOPIK I', '읽기', '실전 모의고사 10회'], sub: '새로 만든 문제 400개 · 풀이 포함' },
  back: { items: [['10 tests · 모의고사 10회', 'Questions 31-70, 40 each · 31~70번, 회마다 40문항'], ['400 original questions · 새로 만든 문제 400개', 'In the real test format; not past papers · 실제 시험 형식, 기출 아님'], ['Answer sheet and explanations · 답안지와 풀이', 'Every question explained · 모든 문항에 짧은 풀이']], for: 'For TOPIK I test takers · TOPIK I 응시 준비에', price: '정가 9.9달러' },
  inline,
};
book.sub.ko = book.coverLevel.sub;   // 표지 부제목 = 책 부제목 = ISBN 신청서 부제목(tools/check-isbn.mjs)
fs.writeFileSync(path.join(ROOT, 'docs/books/topik1-reading-mock.json'), JSON.stringify(book, null, 1) + '\n');
console.log(`TOPIK I 읽기 모의고사: ${N_TESTS}회 × 40문항 · 1급 글 수 회별 ${g1Info.join('/')} · 비용 ${best.toFixed(1)} → docs/books/topik1-reading-mock.json`);
