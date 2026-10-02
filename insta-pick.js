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
export const HASHTAGS = '#한국어 #한국어공부 #learnkorean #studykorean #koreanlanguage #koreanvocabulary #koreangrammar #topik #korean #치즈감자 #everykoreans';
export const LINK = 'https://everykoreans.com/?utm_source=instagram&utm_medium=social&utm_campaign=daily';

/* 고정된 씨앗으로 섞은 차례 — 날짜 n 이면 n 번째를 쓴다(다 돌면 처음으로) */
function shuffled(list, seed) {
  const a = list.slice(); let h = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* 주제 — 낱말 사전의 작은 주제 가운데 그 주제가 첫째인 낱말이 10개 넘는 것. 뜻이 추상적인 갈래(기본 동사 · 정도 · 의견 …)는 뺀다 */
const SKIP_TOPIC = /^(function\/|concepts\/(degree|change)|talk\/opinions|feelings\/attitude)/;

export function makePicker({ VOCAB, VOCAB_TOPICS, SB_CATS, SB_MORE, GRAMMAR_EN, GRAMMAR_WORDS }) {
  const TOPICS = shuffled(VOCAB_TOPICS.flatMap((g) => g.subs.map((t) => ({ ...t, key: `${g.id}/${t.id}` })))
    .filter((t) => !SKIP_TOPIC.test(t.key))
    .map((t) => ({ ...t, words: shuffled(VOCAB.filter((w) => w.t[0] === t.key && w.x?.length && !/\s/.test(w.h)), 11) }))
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
    return { topics, grams: [GRAMS[n % GRAMS.length]] };
  }
  /* 직접 고를 때 — 주제의 다섯 낱말(앞에서부터, 쪽 번호로 넘김) */
  const topicWords = (t, page = 0) => Array.from({ length: 5 }, (_, i) => t.words[(page * 5 + i) % t.words.length]);
  return { TOPICS, GRAMS, ALL_GRAMS, day, topicWords, more: (p) => SB_MORE[p.id] || [], en: (p) => GRAMMAR_EN[p.id] || {},
    gw: (p) => GRAMMAR_WORDS[p.id] || [] };
}

/* 낱말 — 짧은 영어 뜻, 가장 짧은 예문 */
export const wordEn = (w) => w.s || w.e.split(';')[0];
export const wordEx = (w) => w.x.slice().sort((a, b) => a[0].length - b[0].length)[0];

export function wordsCaption(t, ws, romanize) {
  return `주제별 단어 · ${t.ko} (${t.en})\n\n` +
    ws.map((w, i) => `${i + 1}. ${w.h} (${romanize(w.h) || ''}) — ${wordEn(w)}\n   ${wordEx(w)[0]}\n   ${wordEx(w)[1]}`).join('\n') +
    `\n\n💾 저장해 두고 외워 보세요 · Save this post!\n더 많은 단어 · 발음 → 프로필 링크 · More words — link in bio.`;
}

export function grammarCaption(p, pick) {
  const en = pick.en(p), more = pick.more(p), words = pick.gw(p);
  return `오늘의 문법 · ${p.name}\n${p.desc}\n${en.desc || ''}\n\n` + [p.ex, more[3]].filter(Boolean).slice(0, 2).map((x) => `• ${x}`).join('\n') +
    `\n\n같이 쓰는 말: ${words.slice(0, 3).map((x) => x[0]).join(' · ')}\n\n` +
    `✍️ 더 많은 예문 · 연습 → 프로필 링크 · More examples — link in bio.`;
}
