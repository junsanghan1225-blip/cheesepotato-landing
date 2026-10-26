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
    steps: [
      ['지문을 끝까지 읽으며 구체적인 낱말 둘 이상에 밑줄을 쳐요.', 'Read to the end and underline two or more concrete words.'],
      ['밑줄 친 낱말들의 공통점을 생각해요. 「이 낱말들은 모두 ( )이다」.', 'Ask what they have in common: "these words are all kinds of ___".', [['수영 · 축구 → 운동', 'swimming + soccer → exercise'], ['우체국 · 은행 → 장소', 'post office + bank → place']]],
      ['보기 네 개를 하나씩 위 문장의 ( )에 넣어 봐요.', 'Put each of the four options into that blank.'],
      ['낱말 하나만 설명하는 보기는 버려요. 밑줄 친 낱말을 모두 묶는 보기만 남겨요.', 'Drop options that fit only one word. Keep the one that covers all of them.'],
      ['남은 보기가 둘이면, 지문 전체를 포함하는 더 넓은 말을 골라요.', 'If two remain, choose the wider word that covers the whole text.'],
    ],
    words: [['직업', 'job'], ['취미', 'hobby'], ['장소', 'place'], ['가족', 'family'], ['음식', 'food'], ['계절', 'season'], ['날씨', 'weather'], ['나이', 'age'], ['시간', 'time'], ['운동', 'exercise'], ['쇼핑', 'shopping'], ['나라', 'country']],
    trap: ['보기의 낱말이 글에 그대로 나왔다고 정답은 아니에요. 글 전체를 묶는 말을 고르세요.', 'A word from the text is not always the answer. Choose the word that covers the whole text.'] },
  blank: { ko: '빈칸 채우기', en: 'Fill in the blank', ask: ['(  )에 들어갈 말로 가장 알맞은 것을 고르십시오.', 'Choose the best word or form for the blank.'],
    steps: [
      ['빈칸 앞 문장과 뒤 문장을 읽고, 무슨 상황인지 한 줄로 말해 봐요.', 'Read the sentences before and after the blank and say the situation in one line.'],
      ['보기 네 개를 봐요. 같은 낱말의 다른 꼴인가요, 서로 다른 낱말인가요?', 'Look at the four options. Are they forms of one word, or different words?', [['같은 낱말의 다른 꼴 → 문법 문제: 3단계로', 'forms of one word → grammar question: go to step 3'], ['서로 다른 낱말 → 낱말 문제: 4단계로', 'different words → word question: go to step 4']]],
      ['[문법] 빈칸 앞의 때와 문장 끝을 보고 꼴을 정해요.', '[Grammar] Choose the form from the time word and the sentence ending.', [['어제 · 지난주 → -았/었-', 'yesterday, last week → past -았/었-'], ['내일 · 계획 → -겠- · -(으)ㄹ 거예요 · -기로 했습니다', 'tomorrow, plan → future forms'], ['질문 → -ㅂ니까? · -(으)ㄹ까요?  제안 → -ㅂ시다', 'question → -ㅂ니까? / -(으)ㄹ까요?; suggestion → -ㅂ시다']]],
      ['[낱말] 보기를 하나씩 빈칸에 넣고 소리 내어 읽어요. 앞뒤 뜻과 어울리는 것만 남겨요.', '[Word] Put each option in the blank and read it aloud. Keep the one that fits the meaning.'],
      ['연결 말을 확인해요. 그래서 = 앞이 이유, 하지만 · 그런데 = 앞과 반대.', 'Check the connector: so = the reason came first; however = the opposite.'],
      ['고른 답을 넣어 문장 전체를 한 번 더 읽어 보고, 어색하면 다시 골라요.', 'Read the whole sentence once more with your answer. If it sounds odd, choose again.'],
    ],
    words: [['그래서', 'so'], ['그리고', 'and'], ['그런데', 'but, by the way'], ['하지만', 'however'], ['-아/어서', 'because; and then'], ['-(으)니까', 'because'], ['-지만', 'but'], ['-(으)려고', 'in order to'], ['-(으)면서', 'while doing'], ['-기로 하다', 'to decide to'], ['-(으)ㄹ 것이다', 'will'], ['-아/어야 하다', 'must']],
    trap: ['보기가 같은 낱말의 여러 꼴이면 뜻이 아니라 문법 문제예요. 빈칸 바로 뒤를 꼭 보세요.', 'If all options are forms of one word, it is a grammar question. Look at what follows the blank.'] },
  nomatch: { ko: '안내문 읽기 · 맞지 않는 것', en: 'Notices: what does not match', ask: ['다음을 읽고 맞지 않는 것을 고르십시오.', 'Choose the one that does NOT match the notice.'],
    steps: [
      ['문제 끝의 「맞지 않는 것」을 동그라미 쳐요. 정답은 안내문과 다른 보기 하나예요.', 'Circle "does not match". The answer is the one option that differs from the notice.'],
      ['안내문을 항목별로 읽어요. 기간 · 시간 · 요일 · 장소 · 값 · 대상에 밑줄을 쳐요.', 'Read the notice item by item. Underline period, time, day, place, price and who it is for.'],
      ['보기를 하나씩 읽고 안내문의 어느 항목 이야기인지 찾아요.', 'Take each option and find which item of the notice it talks about.'],
      ['숫자를 같은 모양으로 바꿔 비교해요.', 'Convert numbers into the same form before comparing.', [['10:00 = 오전 열 시 · 18:00 = 오후 여섯 시', '10:00 = 10 a.m., 18:00 = 6 p.m.'], ['열흘 = 10일 · 삼 일 = 3일 · 시월 한 달 = 10월 1일~31일', 'ten days = 10 days; October = Oct 1–31']]],
      ['안내문과 다르거나 안내문에 없는 내용이 있는 보기 하나가 정답이에요.', 'The option that differs from the notice, or adds something not in it, is the answer.'],
      ['나머지 세 개가 안내문과 맞는지 한 번 더 확인해요(검산).', 'Check that the other three really match (double-check).'],
    ],
    words: [['기간', 'period'], ['일시', 'date and time'], ['장소', 'place'], ['대상', 'who it is for'], ['회비', 'membership fee'], ['무료', 'free'], ['신청', 'application'], ['접수', 'registration'], ['문의', 'inquiry'], ['휴관일', 'closed day'], ['영업시간', 'business hours'], ['준비물', 'things to bring'], ['할인', 'discount'], ['선착순', 'first come, first served']],
    trap: ['오전 · 오후와 숫자(열 시 · 두 시 · 삼 일)를 바꿔 말한 보기가 많아요. 숫자를 꼭 다시 확인하세요.', 'Options often change a number or a.m./p.m. Check the numbers again.'] },
  detail: { ko: '내용 일치', en: 'Same as the text', ask: ['다음 글의 내용과 같은 것을 고르십시오.', 'Choose the one that matches the text.'],
    steps: [
      ['문제 끝의 「같은 것」을 확인해요. 지문과 같은 보기 하나가 정답이에요.', 'Check "same as". One option matches the text.'],
      ['지문을 문장별로 읽으며 누가 · 언제 · 어디서 · 무엇을 · 숫자에 표시해요.', 'Read sentence by sentence and mark who, when, where, what and the numbers.'],
      ['보기를 하나씩 읽고, 같은 내용이 나오는 지문 문장을 찾아요.', 'For each option, find the sentence in the text that says the same thing.'],
      ['아래 다섯 가지를 비교해요. 하나라도 다르면 그 보기는 버려요.', 'Compare these five. If any differ, drop the option.', [['누가(주어)', 'who (subject)'], ['언제(때: 어제 · 오늘 · 매일)', 'when (yesterday, today, every day)'], ['했다 / 안 했다(부정)', 'did / did not (negation)'], ['반대말(싸다 ↔ 비싸다)', 'opposites (cheap ↔ expensive)'], ['숫자 · 횟수', 'numbers and counts']]],
      ['「전혀 · 모두 · 항상 · 만」 같은 센 말이 든 보기는 특히 의심해요.', 'Be suspicious of options with strong words such as never, all, always, only.'],
      ['남은 보기 하나가 정답이에요. 지문 문장과 나란히 놓고 한 번 더 확인해요.', 'The remaining option is the answer. Check it once more against the sentence.'],
    ],
    words: [['전혀', 'not at all'], ['모두', 'all'], ['만', 'only'], ['처음', 'first time'], ['아직', 'not yet'], ['이미', 'already'], ['먼저', 'first'], ['나중에', 'later'], ['항상', 'always'], ['가끔', 'sometimes'], ['거의', 'almost'], ['함께', 'together']],
    trap: ['「전혀 · 모두 · 항상 · 만」처럼 센 말이 든 보기는 글과 다른 경우가 많아요.', 'Options with strong words like never, all, always or only are often wrong.'] },
  main: { ko: '중심 생각 찾기', en: 'Find the main idea', ask: ['다음 글의 중심 생각으로 가장 알맞은 것을 고르십시오.', 'Choose the main idea.'],
    steps: [
      ['지문을 한 번 읽고, 문장마다 핵심을 한 줄로 줄여 봐요.', 'Read once and shrink each sentence to one key point.'],
      ['같은 말이 되풀이되면 그것이 글의 주제예요.', 'A word that repeats is the topic of the text.'],
      ['마지막 문장과 「그래서 · 하지만 · 따라서」 뒤의 문장을 봐요. 글쓴이가 하고 싶은 말이 거기 있어요.', 'Read the last sentence and any sentence after so / however / therefore. The writer\'s point is there.'],
      ['보기를 하나씩 걸러요.', 'Filter the options.', [['지문의 사실 하나만 말한다 → ✗', 'states only one fact → ✗'], ['지문에 없는 내용이다 → ✗', 'is not in the text → ✗'], ['글쓴이의 주장 · 권유(-는 것이 좋다, -아/어야 한다)를 담았다 → ○', 'contains the writer\'s advice or claim → ○']]],
      ['고른 보기가 글 전체를 대표하는지 마지막으로 확인해요.', 'Finally, check that your choice stands for the whole text.'],
    ],
    words: [['중요하다', 'to be important'], ['필요하다', 'to be necessary'], ['-는 것이 좋다', 'it is good to'], ['-아/어야 하다', 'must; should'], ['그래서', 'so'], ['하지만', 'however'], ['따라서', 'therefore'], ['결국', 'in the end'], ['특히', 'especially'], ['습관', 'habit'], ['건강', 'health']],
    trap: ['글에 있는 말을 그대로 쓴 보기라도 사실 하나일 뿐이면 중심 생각이 아니에요.', 'An option copied from the text can still be just one fact, not the main idea.'] },
  order: { ko: '순서 맞추기', en: 'Put the sentences in order', ask: ['다음을 순서대로 맞게 배열한 것을 고르십시오.', 'Choose the correct order.'],
    steps: [
      ['(가)~(라)를 읽고, 문장마다 무슨 일인지 한 줄로 줄여요.', 'Read (가)~(라) and shrink each to one line.'],
      ['첫 문장을 찾아요. 처음 상황을 알리는 문장이고, 앞 내용을 가리키는 말(그 · 이 · 그래서 · 그런데)로 시작하지 않아요.', 'Find the first sentence: it sets the scene and does not start with that / this / so / but.'],
      ['마지막 문장을 찾아요. 결과나 느낌으로 끝나는 문장이에요(~했습니다, 기분이 좋았습니다).', 'Find the last sentence: it ends with a result or a feeling.'],
      ['가운데 두 문장은 시간 순서와 연결 말로 정해요.', 'Order the middle two by time order and connectors.', [['준비 → 하기 → 끝', 'prepare → do → finish'], ['그래서 · 그 후 · 그다음은 앞 문장 뒤에', 'so / after that / next come after the sentence they refer to'], ['「그」 · 「이」가 가리키는 말이 먼저 나와야 해요', 'the thing that "that/this" refers to must come first']]],
      ['보기 네 개에서 첫 문장이 다른 것을 지우고, 남은 것 중 마지막 문장이 다른 것을 지워요.', 'Cross out options with a different first sentence, then those with a different last sentence.'],
      ['고른 순서로 처음부터 한 번 읽어 보고 자연스러운지 확인해요.', 'Read in your order from the top to check that it flows.'],
    ],
    words: [['먼저', 'first'], ['그다음', 'next'], ['그 후', 'after that'], ['마지막으로', 'finally'], ['그리고', 'and'], ['그래서', 'so'], ['그런데', 'but, by the way'], ['드디어', 'at last'], ['그때', 'at that time'], ['-기 전에', 'before doing'], ['-(으)ㄴ 후에', 'after doing']],
    trap: ['「그래서 · 그런데」로 시작하는 문장은 첫 문장이 될 수 없어요.', 'A sentence that begins with so or but cannot be the first.'] },
  insert: { ko: '문장 넣기', en: 'Where does the sentence go?', ask: ['다음 문장이 들어갈 곳으로 가장 알맞은 것을 고르십시오.', 'Choose where the given sentence fits.'],
    steps: [
      ['<보기> 문장을 읽고 뜻을 말해 봐요. 「그때 · 그래서 · 이렇게 · 그 뒤부터」 같은 연결 말에 동그라미를 쳐요.', 'Read the given sentence. Circle its connector: then / so / like this / from then on.'],
      ['그 연결 말이 가리키는 내용이 먼저 나와야 해요. 그 내용이 어느 문장인지 찾아요.', 'What the connector points to must come first. Find that sentence.'],
      ['㉠~㉣ 자리에 문장을 하나씩 넣어서, 앞 문장 → 보기 문장 → 뒤 문장 순으로 읽어 봐요.', 'Try the sentence at each spot: read previous → given → next.'],
      ['뜻이 이어지는지 확인해요.', 'Check the meaning flows.', [['원인 → 결과: 보기가 결과라면 원인 뒤', 'cause → result: if it is the result, put it after the cause'], ['앞뒤가 반대되는 이야기가 아닌지', 'the sentences before and after must not contradict']]],
      ['둘 이상이 자연스러우면, 연결 말 단서가 더 강한 곳을 골라요.', 'If two spots work, choose the one with the stronger connector clue.'],
    ],
    words: [['그때', 'at that time'], ['그래서', 'so'], ['이렇게', 'like this'], ['그렇게', 'like that'], ['그 뒤부터', 'from then on'], ['처음에는', 'at first'], ['그런데', 'but, by the way'], ['또', 'again; also'], ['그제야', 'only then'], ['덕분에', 'thanks to']],
    trap: ['「그렇게 · 이렇게」가 있는 문장은 바로 앞에 그 일이 먼저 나와야 해요.', 'A sentence with like that / like this needs the event it refers to just before it.'] },
  intent: { ko: '글을 쓴 이유', en: 'Why was it written?', ask: ['이 글을 쓴 이유로 가장 알맞은 것을 고르십시오.', 'Choose the writer\'s purpose.'],
    steps: [
      ['글의 종류를 확인해요. 안내문 · 광고 · 메일 · 메모 중 무엇인가요? 제목과 첫 문장을 봐요.', 'Identify the kind of text: notice, ad, e-mail or note. Look at the title and first sentence.'],
      ['누가 누구에게 쓰는 글인지 찾아요(예: 관리실 → 주민, 학생 → 선생님).', 'Find who writes to whom (e.g. office → residents, student → teacher).'],
      ['글쓴이가 바라는 것이 담긴 표현을 찾아요.', 'Find the phrase that shows what the writer wants.', [['-아/어 주시기 바랍니다 · -아/어 주세요 → 부탁', 'please do … → request'], ['-고자 합니다 · 안내드립니다 → 알림 · 모집합니다 · 초대합니다 → 모집 · 초대', 'we would like to … / we inform you → notice; recruit, invite']]],
      ['그 행동의 이름이 곧 쓴 이유예요: 알리려고 · 부탁하려고 · 모집하려고 · 초대하려고.', 'The name of that act is the reason: to inform, ask, recruit or invite.'],
      ['보기 중 글 전체의 목적에 맞는 것을 골라요. 글의 일부만 말하는 보기는 버려요.', 'Choose the option that fits the purpose of the whole text. Drop ones that cover only a part.'],
    ],
    words: [['안내', 'notice, guide'], ['부탁', 'request'], ['요청', 'request'], ['신청', 'application'], ['모집', 'recruitment'], ['초대', 'invitation'], ['사과', 'apology'], ['감사', 'thanks'], ['알리다', 'to inform'], ['-아/어 주시기 바랍니다', 'please (formal)'], ['-(으)려고', 'in order to (end of options)']],
    trap: ['글에 나온 낱말이 많은 보기보다, 글 전체의 목적에 맞는 보기가 정답이에요.', 'The answer is the purpose of the whole text, not the option with the most words from it.'] },
};
const ORDER = ['theme', 'blank', 'nomatch', 'detail', 'main', 'order', 'insert', 'intent'];
const nosOf = {};
for (const q of TOPIK_READING) (nosOf[q.type] ||= new Set()).add(q.slot);
const rangeOf = (set) => { const a = [...set].sort((x, y) => x - y); const out = []; for (let i = 0; i < a.length;) { let j = i; while (j + 1 < a.length && a[j + 1] === a[j] + 1) j++; out.push(j > i ? `${a[i]}~${a[j]}` : `${a[i]}`); i = j + 1; } return out.join(', '); };
/* 예시: 유형마다 지문이 가장 짧은 문항 하나(짝 지문 · 문장 넣기는 보기 문장이 있는 것) — 풀이 방법을 그대로 따라 풀어 보이는 용도 */
const exampleOf = (t) => { const c = TOPIK_READING.filter((q) => q.type === t && (t !== 'insert' || q.sentence)).sort((a, b) => a.passage.length - b.passage.length)[0]; return c; };
const testNoOf = {}; // 문항 id → 모의고사 회차 (아래에서 채운다)
const methods = ORDER.map((t) => { const m = TYPE_INFO[t]; if (!m || !nosOf[t]) throw new Error(`유형 ${t} 자료 없음`); const ex = exampleOf(t);
  return { type: t, nos: rangeOf(nosOf[t]), count: nosOf[t].size, name: { ko: m.ko, en: m.en }, ask: { ko: m.ask[0], en: m.ask[1] }, steps: m.steps.map(([ko, en, sub]) => ({ ko, en, ...(sub ? { sub: sub.map(([k, e]) => ({ ko: k, en: e })) } : {}) })), words: m.words.map(([ko, en]) => ({ ko, en })), trap: { ko: m.trap[0], en: m.trap[1] },
    example: { id: ex.id, no: ex.slot, question: ex.question, passage: ex.passage, ...(ex.sentence ? { sentence: ex.sentence } : {}), options: ex.options, answer: ex.answer, why: ex.why } }; });
for (const q of TOPIK_READING) if (!TYPE_INFO[q.type]) throw new Error(`설명이 없는 유형 ${q.type}`);

/* 정답 쪽의 근거 + 선지별 이유(docs/mock/explain.txt): 문항 id | 근거 | ①~④ 이유 */
const EXPL = {};
const EF = path.join(ROOT, 'docs/mock/explain.txt');
if (fs.existsSync(EF)) for (const ln of fs.readFileSync(EF, 'utf8').split('\n')) { if (!ln.trim() || ln.startsWith('#')) continue; const [id, ev, ...rs] = ln.split('|').map((x) => x.trim()); EXPL[id] = { ev, rs }; }
const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/books/topik2-vocab-1000.json'), 'utf8'));
const inline = {}; const unitIds = [];
let g1Info = [];
for (let t = 0; t < N_TESTS; t++) {
  const id = `tr-${String(t + 1).padStart(2, '0')}`; unitIds.push(id);
  const items = groups.flatMap((g, gi) => itemOf(gi, t)).sort((x, y) => x.slot - y.slot).map((q) => ({
    no: q.slot, id: q.id, type: q.type, genre: q.genre, grade: q.grade, passage: q.passage, question: q.question, options: q.options, answer: q.answer, why: q.why, ...(q.pair ? { pair: q.pair } : {}), ...(q.sentence ? { sentence: q.sentence } : {}), ...(EXPL[q.id] ? { ev: EXPL[q.id].ev, rs: EXPL[q.id].rs } : {}),
  }));
  g1Info.push(items.filter((x) => x.grade === 1).length);
  inline[id] = { id, title: { en: `Practice Test ${t + 1}`, ko: `모의고사 ${t + 1}회` }, sub: { en: 'Questions 31 to 70 in the real test format.', ko: '31~70번, 실제 시험 형식' }, sections: [{ type: 'mcq', title: { en: 'Questions 31–70', ko: '31~70번' }, items }, { type: 'omr', title: { en: 'Answer sheet', ko: '답안지' }, from: 31, to: 70 }] };
}
for (const m of methods) { for (const [uid, u] of Object.entries(inline)) { const it = u.sections[0].items.find((x) => x.id === m.example.id); if (it) { m.example.test = Number(uid.slice(3)); m.example.no = it.no; } } }
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
console.log(`근거 · 선지 이유 ${Object.keys(EXPL).length}/${TOPIK_READING.length}문항`);
console.log(`TOPIK I 읽기 모의고사: ${N_TESTS}회 × 40문항 · 1급 글 수 회별 ${g1Info.join('/')} · 비용 ${best.toFixed(1)} → docs/books/topik1-reading-mock.json`);
