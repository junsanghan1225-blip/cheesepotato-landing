/* 인스타그램 — 날짜마다 무엇을 올릴지 고르고 캡션을 만든다. 편집기(insta.html)와 도구(tools/insta-cards.mjs)가 함께 쓴다.
   운영자 결정(2026-10-01): 하루 세 게시물. 2026-10-02 바꿈: 주제별 단어(5개씩) 2개 + 문법 소개 1개.
   날마다 고르는 것은 날짜로 정해진다(같은 날은 늘 같은 것). 첫날(2026-10-02)부터 안 겹치게 차례로 간다.
   지어낸 말 없음 — 낱말 · 예문 · 문법은 사이트에 실린 그대로. */

export const START = Date.UTC(2026, 9, 2);   // 첫 게시일 — 이날이 0번째
export const todayKst = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
export const POS_EN = { 명사: 'noun', 동사: 'verb', 형용사: 'adjective', 부사: 'adverb', 대명사: 'pronoun', '의존 명사': 'bound noun',
  수사: 'number', 관형사: 'determiner', 감탄사: 'interjection' };
export const LV = { beginner: '초급 · Beginner', intermediate: '중급 · Intermediate', advanced: '고급 · Advanced' };
/* 해시태그 — 세 게시물 모두 같은 묶음(운영자: 「통일되게」). 편집기에서 고치면 그 브라우저에서는 그 묶음을 쓴다 */
/* 2026-10-02 운영자 결정: 11개 → 5개. 요즘 인스타는 해시태그보다 캡션 낱말로 찾아 주고, 많이 달면 오히려 덜 퍼진다는 안내가 많다 */
export const HASHTAGS = '#learnkorean #studykorean #koreanlanguage #한국어공부 #topik';
export const LINK = 'https://everykoreans.com/?utm_source=instagram&utm_medium=social&utm_campaign=daily';

/* 고정된 씨앗으로 섞은 차례 — 날짜 n 이면 n 번째를 쓴다(다 돌면 처음으로) */
function shuffled(list, seed) {
  const a = list.slice(); let h = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* 주제 — 낱말 사전의 작은 주제 가운데 그 주제가 첫째인 낱말이 10개 넘는 것. 뜻이 추상적인 갈래(기본 동사 · 정도 · 의견 …)는 뺀다 */
const SKIP_TOPIC = /^(function\/|concepts\/(degree|change)|talk\/opinions|feelings\/attitude)/;

/* 한 게시물의 다섯 낱말이 서로 이어지게(운영자: 「뜬금없다」 2026-10-03) — 같은 주제 안에서도 둘째 갈래(예: 재료 + 요리 = 양념)와
   품사가 같은 것끼리 붙여 세운다. 큰 무리부터 앞에 — 다섯 칸이 한 무리로 차기 쉽다. 무리 안의 차례는 섞은 그대로. */
function related(words) {
  const by = new Map();
  for (const w of words) { const k = `${w.t[1] || ''}|${w.p}`; if (!by.has(k)) by.set(k, []); by.get(k).push(w); }
  return [...by.values()].sort((a, b) => b.length - a.length).flat();
}

export function makePicker({ VOCAB, VOCAB_TOPICS, SB_CATS, SB_MORE, GRAMMAR_EN, GRAMMAR_WORDS, TOPIK_READING = [] }) {
  /* 오늘의 TOPIK — 하루 한 문제(운영자 요청 2026-10-03). TOPIK I 읽기 가운데 한 장에 들어가는 짧은 것만(지문 180자 · 보기 30자 안),
     1급 수준 먼저. 순서 맞추기 · 문장 넣기처럼 한 장에 안 맞는 유형은 뺀다. 문항은 전부 사이트 창작(기출 아님). */
  const quizOk = (q) => q.options?.length === 4 && !['order', 'insert'].includes(q.type) && (q.passage || '').length <= 180 && q.options.every((o) => String(o).length <= 30);
  const QUIZ = [...shuffled(TOPIK_READING.filter((q) => q.grade === 1 && quizOk(q)), 31), ...shuffled(TOPIK_READING.filter((q) => q.grade === 2 && quizOk(q)), 37)];
  const TOPICS = shuffled(VOCAB_TOPICS.flatMap((g) => g.subs.map((t) => ({ ...t, key: `${g.id}/${t.id}` })))
    .filter((t) => !SKIP_TOPIC.test(t.key))
    .map((t) => ({ ...t, words: related(shuffled(VOCAB.filter((w) => w.t[0] === t.key && w.x?.length && !/\s/.test(w.h)), 11)) }))
    .filter((t) => t.words.length >= 10), 11);
  /* 초급이 먼저 오게(인스타 보는 사람 대부분이 입문 · 초급) */
  const ok = (p) => GRAMMAR_WORDS[p.id]?.length && GRAMMAR_EN[p.id];
  const POINTS = SB_CATS.flatMap((c) => c.points);
  const GRAMS = [...shuffled(POINTS.filter((p) => p.lv === 'beginner' && ok(p)), 22),
    ...shuffled(POINTS.filter((p) => p.lv === 'intermediate' && ok(p)), 23)];
  const ALL_GRAMS = POINTS.filter(ok);

  const dayN = (day) => { const [y, m, d] = day.split('-').map(Number); return Math.max(0, Math.round((Date.UTC(y, m - 1, d) - START) / 86400e3)); };
  /* 그날의 세 게시물 — 주제는 하루 둘씩 차례로(k = 2n, 2n+1), 한 바퀴 돌면 그 주제의 다음 다섯 낱말. 문법은 하루 하나 */
  function day(dayStr) {
    const n = dayN(dayStr);
    const topics = [0, 1].map((i) => {
      const k = 2 * n + i, t = TOPICS[k % TOPICS.length], r = Math.floor(k / TOPICS.length) * 5;
      return { topic: t, words: Array.from({ length: 5 }, (_, j) => t.words[(r + j) % t.words.length]) };
    });
    return { topics, grams: [GRAMS[n % GRAMS.length]], quiz: QUIZ.length ? QUIZ[n % QUIZ.length] : null };
  }
  /* 직접 고를 때 — 주제의 다섯 낱말(앞에서부터, 쪽 번호로 넘김) */
  const topicWords = (t, page = 0) => Array.from({ length: 5 }, (_, i) => t.words[(page * 5 + i) % t.words.length]);
  return { TOPICS, GRAMS, ALL_GRAMS, QUIZ, day, topicWords, more: (p) => SB_MORE[p.id] || [], en: (p) => GRAMMAR_EN[p.id] || {},
    gw: (p) => GRAMMAR_WORDS[p.id] || [] };
}

/* 낱말 — 짧은 영어 뜻, 가장 짧은 예문.
   짧은 뜻(s)은 「person (hon) / min」처럼 다른 뜻이 섞여 있을 때가 있다 — 긴 뜻(e)에 없는 쪽은 빼고, 예문과 같은 뜻만 남긴다(운영자 지적 2026-10-02). */
export const wordEn = (w) => {
  if (!w.s) return String(w.e || '').split(';')[0];
  const all = String(w.e || '').toLowerCase(), parts = w.s.split(' / ');
  const keep = parts.filter((p) => all.includes(p.replace(/\(.*?\)/g, '').replace(/^to /, '').trim().toLowerCase()));
  return keep.length && keep.length < parts.length ? keep.join(' / ') : w.s;
};
export const wordEx = (w) => w.x.slice().sort((a, b) => a[0].length - b[0].length)[0];

/* 캡션 — 짧게(운영자: 「정신 사납다」 2026-10-02). 첫 줄은 영어 검색어(인스타는 첫 줄만 보이고, 캡션 낱말로 찾아 준다).
   예문은 넘기는 장에 있으므로 캡션에는 안 넣는다 — 넘겨 보게 하는 편이 낫다. 끝에 댓글 질문 하나. */
export function wordsCaption(t, ws, romanize) {
  return `Korean words: ${t.en} 🇰🇷\n${t.ko} — 한국어 단어 5개\n\n` +
    ws.map((w, i) => `${i + 1}. ${w.h} (${romanize(w.h) || ''}) — ${wordEn(w)}`).join('\n') +
    `\n\n👉 넘겨서 예문 보기 · Swipe for examples` +
    `\n💬 이 중 한 단어로 문장을 만들어 댓글로! · Make a sentence in the comments 👇` +
    `\n💾 저장해 두고 외우기 · Save for later — more words, link in bio`;
}

export function grammarCaption(p, pick) {
  const en = pick.en(p);
  return `Korean grammar: ${p.name} ✍️\n오늘의 문법 · ${p.name}\n\n${p.desc}\n${en.desc || ''}`.trimEnd() +
    (p.ex ? `\n\n예) ${p.ex}` : '') +
    `\n\n👉 넘겨서 예문 더 보기 · Swipe for more examples` +
    `\n💬 이 문법으로 내 문장을 만들어 댓글로! · Write your own sentence in the comments 👇` +
    `\n💾 저장해 두고 복습하기 · Save for later — more grammar, link in bio`;
}

/* 오늘의 TOPIK 캡션 — 문제와 보기를 캡션에도 적는다(넘기기 전에 댓글로 답하게) */
export const CIRCLED = ['①', '②', '③', '④'];
export function quizCaption(q) {
  return `Daily TOPIK practice ✍️ TOPIK I · 연습 문제(기출 아님)\n\n` +
    (q.passage ? `${q.passage}\n\n` : '') +
    `Q. ${q.question}\n${q.options.map((o, i) => `${CIRCLED[i]} ${o}`).join('  ')}` +
    `\n\n💬 정답 번호를 댓글로! · Comment your answer (1–4) 👇` +
    `\n👉 넘기면 정답과 풀이 · Swipe for the answer` +
    `\n💾 더 많은 TOPIK 연습 → link in bio`;
}
