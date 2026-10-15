/* 앱(cheesepotatoapp)이 읽는 학습 자료 — 코스 · 레슨을 JSON 으로 내보낸다(2026-10-12 운영자 「앱을 웹뷰 말고 앱에서 구현」).
   앱은 이 파일을 everykoreans.com/app-data/ 에서 받아 폰에 저장해 둔다 → 자료를 앱에 복사해 두지 않으니 웹에서 고치면 앱도 바뀐다(앱 새로 올릴 필요 없음).
   - manifest.json : 길(basic · mid · adv) 순서 · 코스 목록(제목 · 이모지 · 레슨 id · 분) · v(내용이 바뀌면 바뀌는 값)
   - lessons/<코스 id>.json : 그 코스의 레슨들(블록 포함)
   - grammar-pairs.json : 헷갈리는 문법 비교 퀴즈(문법 이름 · 뜻 포함)
   - topik-<reading|listening>-<I|II>.json : TOPIK 연습 문항 + 유형 목록(blueprint)
   길 순서는 app.module.js 의 MY_LEVEL_COURSES · PATHS 와 같다 — 거기서 읽어 오니 웹에서 순서를 바꾸면 따라온다.
   원본은 courses*.js. 이 폴더는 생성물이라 손으로 고치지 않는다(node tools/build-app-data.mjs). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'app-data');
const { COURSES } = await import(pathToFileURL(path.join(ROOT, 'courses.js')).href);

/* app.module.js 의 MY_LEVEL_COURSES 를 그대로 읽는다(길 순서의 원본) */
const src = fs.readFileSync(path.join(ROOT, 'app.module.js'), 'utf8');
const m = src.match(/const MY_LEVEL_COURSES = (\{[\s\S]*?\n\});/);
if (!m) throw new Error('app.module.js 에서 MY_LEVEL_COURSES 를 못 찾았다');
const MY_LEVEL_COURSES = new Function(`return ${m[1]}`)();
const byId = new Map(COURSES.map((c) => [c.id, c]));
const levelCourses = (L) => {
  const ids = MY_LEVEL_COURSES[L];
  if (ids) return ids.map((id) => byId.get(id)).filter(Boolean);
  const want = L === 6 ? 'Intermediate' : 'Advanced';
  return COURSES.filter((c) => c.level === want && c.lessons.length);
};
const pathCourses = (lvs) => { const seen = new Set(), out = []; for (const L of lvs) for (const c of levelCourses(L)) if (!seen.has(c.id)) { seen.add(c.id); out.push(c.id); } return out; };
const PATHS = {
  basic: { lvs: [0, 1, 2, 3, 4, 5], ko: '기초부터', en: 'From the basics' },
  mid: { lvs: [6], ko: '중급부터', en: 'Intermediate' },
  adv: { lvs: [7], ko: '고급부터', en: 'Advanced' },
};

/* 제목이 {ko, en} 이 아니라 글자 하나로 적힌 코스 · 레슨이 있다(웹은 cTx 가 그대로 보여 준다) — 앱이 빈칸으로 보지 않게 두 칸으로 맞춘다 */
const L2 = (v) => (typeof v === 'string' ? { ko: v, en: v } : { ko: v?.ko || v?.en || '', en: v?.en || v?.ko || '' });

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'lessons'), { recursive: true });
const used = new Set(Object.values(PATHS).flatMap((p) => pathCourses(p.lvs)));
const courses = [];
for (const c of COURSES) {
  if (!c.lessons.length) continue;
  const body = JSON.stringify(c.lessons.map((l) => ({ ...l, title: L2(l.title) })));
  fs.writeFileSync(path.join(OUT, 'lessons', `${c.id}.json`), body);
  courses.push({
    id: c.id, emoji: c.emoji, title: L2(c.title), tagline: L2(c.tagline), level: c.level,
    h: crypto.createHash('sha1').update(body).digest('hex').slice(0, 8),   // 앱이 폰에 저장해 둔 것이 낡았는지 보는 값
    lessons: c.lessons.map((l) => ({ id: l.id, title: L2(l.title), minutes: l.minutes || 7, n: l.blocks.length })),
  });
}
/* 헷갈리는 문법 비교 퀴즈 — 앱 「문법 비교」 화면. 두 문법의 이름 · 뜻을 같이 담아 앱이 다른 자료를 안 찾게 한다. */
const { GRAMMAR_PAIRS } = await import(pathToFileURL(path.join(ROOT, 'grammar-pairs.js')).href);
const { SB_CATS } = await import(pathToFileURL(path.join(ROOT, 'sentences.js')).href);
const points = new Map(SB_CATS.flatMap((c) => c.points).map((p) => [p.id, p]));
const { GRAMMAR_EN } = await import(pathToFileURL(path.join(ROOT, 'grammar-en.js')).href);
const side = (id) => { const p = points.get(id); if (!p) throw new Error(`문법 ${id} 을(를) 못 찾았다`); return { id, name: p.name, desc: p.desc, descEn: GRAMMAR_EN[id]?.desc || '' }; };
const pairs = GRAMMAR_PAIRS.map((x) => ({ id: x.id, title: x.title, gist: x.gist, diff: x.diff, ex: x.ex, a: side(x.a), b: side(x.b), quiz: x.quiz }));
const pairsBody = JSON.stringify(pairs);
fs.writeFileSync(path.join(OUT, 'grammar-pairs.json'), pairsBody);
const grammarPairs = { h: crypto.createHash('sha1').update(pairsBody).digest('hex').slice(0, 8), n: pairs.length, q: pairs.reduce((a, x) => a + x.quiz.length, 0) };
/* TOPIK 연습(읽기 · 듣기, I · II) — 앱 「TOPIK」 탭. 문항은 전부 창작(기출 아님). 쓰기 · 모의고사는 아직 웹 화면으로. */
const T1 = await import(pathToFileURL(path.join(ROOT, 'topik.js')).href);
const T2 = await import(pathToFileURL(path.join(ROOT, 'topik2.js')).href);
const TL = await import(pathToFileURL(path.join(ROOT, 'topik-listening.js')).href);
const topikFiles = {
  'reading-I': { blueprint: T1.TOPIK_BLUEPRINT, items: T1.TOPIK_READING },
  'reading-II': { blueprint: T2.TOPIK2_BLUEPRINT, items: T2.TOPIK2_READING },
  'listening-I': { blueprint: TL.TOPIKL_BLUEPRINT, items: TL.TOPIKL_ITEMS },
  'listening-II': { blueprint: TL.TOPIKL2_BLUEPRINT, items: TL.TOPIKL2_ITEMS },
};
const topik = {};
for (const [k, v] of Object.entries(topikFiles)) {
  const body = JSON.stringify(v);
  fs.writeFileSync(path.join(OUT, `topik-${k}.json`), body);
  topik[k] = { h: crypto.createHash('sha1').update(body).digest('hex').slice(0, 8), n: v.items.length };
}
/* 쓰기(51~54번) — 51 · 52 는 빈칸 문장 쓰기(모범답과 견주기), 53 · 54 는 AI 채점(서버 함수 grade-writing 이 채점 기준 · 예시를 따로 들고 있다 —
   앱에는 문제 · 자료 · 조건 · 모범답안만 보낸다). */
const { TW_ITEMS, TW_QS } = await import(pathToFileURL(path.join(ROOT, 'topik-writing.js')).href);
const writingItems = TW_ITEMS.map((x) => ({ id: x.id, q: x.q, lv: x.lv, register: x.register, title: x.title, passage: x.passage, cond: x.cond,
  ...(x.blanks ? { blanks: x.blanks.map((b) => ({ mark: b.mark, answers: b.answers, point: b.point })) } : {}),
  ...(x.data ? { data: x.data } : {}), ...(x.tasks ? { tasks: x.tasks } : {}), ...(x.min ? { min: x.min, max: x.max } : {}), ...(x.model ? { model: x.model } : {}) }));
const writingBody = JSON.stringify({ qs: TW_QS, items: writingItems });
fs.writeFileSync(path.join(OUT, 'topik-writing.json'), writingBody);
const writing = { h: crypto.createHash('sha1').update(writingBody).digest('hex').slice(0, 8), n: writingItems.length };

/* TOPIK 읽기 모의고사 — 자리(slot) 목록 + 시간(웹 TQ_EXAMS.mockSec 와 같다: I 60분 · II 70분). 앱이 웹과 같은 방법으로 회차를 뽑는다. */
const mock = { I: { min: 60, slots: T1.TOPIK_SLOTS }, II: { min: 70, slots: T2.TOPIK2_SLOTS } };
fs.writeFileSync(path.join(OUT, 'topik-mock.json'), JSON.stringify(mock));
const mockMeta = { h: crypto.createHash('sha1').update(JSON.stringify(mock)).digest('hex').slice(0, 8) };

/* 낱말 — 게임 · 단어 퀴즈가 같이 쓴다. [낱말, 품사, 감자 레벨(1~7), 뜻]. TOPIK I(1,931) + II(8,258). */
const V1 = await import(pathToFileURL(path.join(ROOT, 'vocab-topik1.js')).href);
const V2 = await import(pathToFileURL(path.join(ROOT, 'vocab-topik2.js')).href);
const meanOf = (w) => (w.s || w.e || '').split(/[;/(]/)[0].trim();
const vocabRows = [...V1.VOCAB, ...V2.VOCAB].map((w) => [w.h, w.p || '', w.v || 1, meanOf(w)]).filter((r) => r[0] && r[3]);
const vocabBody = JSON.stringify(vocabRows);
fs.writeFileSync(path.join(OUT, 'vocab.json'), vocabBody);

/* 감자 워들 — 웹 potdle.js 와 같은 규칙(두 글자 · 자모 5개 · 감자 L1~L4)으로 거르고 같은 순서로 섞어 날짜 번호로 집게 한다(웹 · 앱이 같은 날 같은 낱말) */
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', VOW = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const JT = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const SPLIT = { ㅘ: 'ㅗㅏ', ㅙ: 'ㅗㅐ', ㅚ: 'ㅗㅣ', ㅝ: 'ㅜㅓ', ㅞ: 'ㅜㅔ', ㅟ: 'ㅜㅣ', ㅢ: 'ㅡㅣ', ㄳ: 'ㄱㅅ', ㄵ: 'ㄴㅈ', ㄶ: 'ㄴㅎ', ㄺ: 'ㄹㄱ', ㄻ: 'ㄹㅁ', ㄼ: 'ㄹㅂ', ㄽ: 'ㄹㅅ', ㄾ: 'ㄹㅌ', ㄿ: 'ㄹㅍ', ㅀ: 'ㄹㅎ', ㅄ: 'ㅂㅅ' };
const jamoOf = (s) => [...s].flatMap((ch) => { const c = ch.charCodeAt(0) - 0xac00; if (c < 0 || c >= 11172) return [ch]; return [CHO[Math.floor(c / 588)], VOW[Math.floor((c % 588) / 28)], JT[c % 28]].filter(Boolean).flatMap((j) => [...(SPLIT[j] || j)]); });
const pdSrc = fs.readFileSync(path.join(ROOT, 'potdle.js'), 'utf8');
if (!pdSrc.includes('let s = 20261008;') || !pdSrc.includes('const a = [...list].sort((x, y) => (x.h < y.h ? -1 : 1));')) throw new Error('potdle.js 의 섞는 방법이 바뀌었다 — build-app-data.mjs 의 potdle 부분도 같이 고친다');
const seeded = (list) => { let s = 20261008; const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; const a = [...list].sort((x, y) => (x.h < y.h ? -1 : 1)); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const seenP = new Set();
const potdle = seeded(V1.VOCAB.filter((w) => /^[가-힣]{2}$/.test(w.h) && w.v >= 1 && w.v <= 4 && meanOf(w) && jamoOf(w.h).length === 5 && !seenP.has(w.h) && seenP.add(w.h))).map((w) => [w.h, meanOf(w)]);

/* 숫자 읽기 — 웹 numbers.js 의 makeRound 로 레벨마다 문제를 넉넉히 뽑아 둔다(앱이 그중에서 고른다) */
const NUM = await import(pathToFileURL(path.join(ROOT, 'numbers.js')).href);
const numbers = {};
for (const lv of NUM.NUM_LEVELS) { const seen = new Set(); const out = []; for (let k = 0; k < 40 && out.length < 150; k++) for (const q of NUM.makeRound(lv, 20)) if (!seen.has(q.ask + q.answer)) { seen.add(q.ask + q.answer); out.push(q); } numbers[lv] = out; }
const gamesBody = JSON.stringify({ potdle, numbers });
fs.writeFileSync(path.join(OUT, 'games.json'), gamesBody);
const games = { h: crypto.createHash('sha1').update(gamesBody).digest('hex').slice(0, 8), potdle: potdle.length, numbers: Object.fromEntries(Object.entries(numbers).map(([k, v]) => [k, v.length])) };
const vocab = { h: crypto.createHash('sha1').update(vocabBody).digest('hex').slice(0, 8), n: vocabRows.length };

/* 앱 새 화면의 번역 사전 — English 문장 → vi · ja · zh. 앱의 화면 글자 목록(docs/i18n/app-strings.json, 앱 저장소 tools/extract-ui-strings.cjs 가 뽑아 옴)을 기준으로,
   앱 전용 번역(docs/i18n/app-<언어>.json)을 먼저, 없으면 웹 화면 번역(docs/i18n/<언어>.json)을 쓴다. 번역이 없는 문장은 앱에서 English 로 보인다. */
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch { return null; } };
const uiStrings = readJson('docs/i18n/app-strings.json') || [];
const ui = {};
for (const lang of ['vi', 'ja', 'zh']) {
  const web = readJson(`docs/i18n/${lang}.json`) || {}, appd = readJson(`docs/i18n/app-${lang}.json`) || {};
  const dict = {};
  for (const { en } of uiStrings) { const v = appd[en] ?? web[en]; if (v) dict[en] = v; }
  const body = JSON.stringify(dict);
  fs.writeFileSync(path.join(OUT, `ui-${lang}.json`), body);
  ui[lang] = { h: crypto.createHash('sha1').update(body).digest('hex').slice(0, 8), n: Object.keys(dict).length, total: uiStrings.length };
}

/* 사전 — 앱 「더보기 → 사전」. 낱말(국립국어원 뜻풀이 7,970) · 품사 · 영어 뜻 · 베트남어 · 일본어 · 중국어 뜻 · 예문.
   한 줄 = [낱말, 품사, 영어, 베트남어, 일본어, 중국어, 예문(한국어), 예문(영어)] — 없는 칸은 빈 글자. 뜻 갈래(국립국어원 풀이)는 따로(dict-senses.json) 열 때 받는다. */
const GL = await import(pathToFileURL(path.join(ROOT, 'glossary.js')).href);
const gl = async (f) => (await import(pathToFileURL(path.join(ROOT, f)).href)).G;
const GVI = await gl('glossary-vi.js'), GJA = await gl('glossary-ja.js'), GZH = await gl('glossary-zh.js');
const { EXAMPLES } = await import(pathToFileURL(path.join(ROOT, 'glossary-examples.js')).href);
const { SENSES } = await import(pathToFileURL(path.join(ROOT, 'glossary-senses.js')).href);
const dictHeads = new Map(); for (const w of Object.values(GL.GLOSSARY)) if (!dictHeads.has(w.head)) dictHeads.set(w.head, w);
const dictRows = [...dictHeads.values()].map((w) => { const ex = EXAMPLES[w.head]; return [w.head, w.pos || '', w.en || '', GVI[w.head] || '', GJA[w.head] || '', GZH[w.head] || '', ex?.ex || '', ex?.en || '']; });
const dictBody = JSON.stringify(dictRows);
fs.writeFileSync(path.join(OUT, 'dict.json'), dictBody);
const sensesBody = JSON.stringify(SENSES);
fs.writeFileSync(path.join(OUT, 'dict-senses.json'), sensesBody);
const dict = { h: crypto.createHash('sha1').update(dictBody).digest('hex').slice(0, 8), n: dictRows.length, hs: crypto.createHash('sha1').update(sensesBody).digest('hex').slice(0, 8) };

/* 문법 — 앱 「더보기 → 문법」. 갈래(73) 안에 문법 290개: 이름 · 뜻 · 대표 예문 · 더 알기 · 대화 · 영어 설명 · 쓰임 예문. */
const SBM = await import(pathToFileURL(path.join(ROOT, 'sentences.js')).href);
const { GRAMMAR_USAGE } = await import(pathToFileURL(path.join(ROOT, 'grammar-usage.js')).href);
const gcats = SBM.SB_CATS.map((c) => ({
  id: c.id, ko: c.ko, en: c.en,
  points: c.points.map((p) => { const en = GRAMMAR_EN[p.id] || {}; return {
    id: p.id, lv: p.lv, name: p.name, desc: p.desc, ex: p.ex || '',
    more: p.more || SBM.SB_MORE?.[p.id] || [], dlg: p.dlg || [],
    en: en.desc ? { desc: en.desc, form: en.form || '', care: en.care || '' } : null,
    use: (GRAMMAR_USAGE[p.id] || []).slice(0, 6),
  }; }),
}));
const grammarBody = JSON.stringify(gcats);
fs.writeFileSync(path.join(OUT, 'grammar.json'), grammarBody);
const grammar = { h: crypto.createHash('sha1').update(grammarBody).digest('hex').slice(0, 8), n: gcats.reduce((a, c) => a + c.points.length, 0) };

/* 레슨 ↔ 문법 짝(레슨 대격변 — 앱의 약점 지도 꼬리표 `g:<문법 id>`). 웹 path-map.js 와 같은 자료. */
const { PATH_GRAMMAR } = await import(pathToFileURL(path.join(ROOT, 'path-map.js')).href);
const pathGrammarBody = JSON.stringify(PATH_GRAMMAR);
fs.writeFileSync(path.join(OUT, 'path-grammar.json'), pathGrammarBody);
const pathGrammar = { h: crypto.createHash('sha1').update(pathGrammarBody).digest('hex').slice(0, 8), n: Object.keys(PATH_GRAMMAR).length };

/* 레벨 테스트 — 앱 「공부 → 레벨 테스트」. 웹 「전체」 목적의 문제 풀(429문항, 레벨 0~7)과 레벨표.
   레벨표는 app.module.js 의 LT_LEVELS 와 같다(바뀌면 여기도 — check-app-data 가 코스 id 가 실제 있는지 본다).
   한 줄 = [레벨, 종류, 문제(지문 포함), 보기, 정답 번호, 풀이]. */
const { LT_CUSTOM_OVERALL } = await import(pathToFileURL(path.join(ROOT, 'leveltest-overall.js')).href);
const ltLevels = [
  { lv: 0, ko: '한글 전', en: 'Pre-Hangul', topik: '', start: 'hangul', next: 'first-words' },
  { lv: 1, ko: '입문', en: 'Starter', topik: '', start: 'first-words', next: 'grammar-core' },
  { lv: 2, ko: '초급 1', en: 'Beginner 1', topik: 'TOPIK 1', start: 'bg-05', next: 'bg-10' },
  { lv: 3, ko: '초급 2', en: 'Beginner 2', topik: 'TOPIK 1', start: 'bg-10', next: 'bg-13' },
  { lv: 4, ko: '초급 3', en: 'Beginner 3', topik: 'TOPIK 2', start: 'bg-13', next: 'bg-17' },
  { lv: 5, ko: '초급 4', en: 'Beginner 4', topik: 'TOPIK 2', start: 'bg-22', next: 'bg-27' },
  { lv: 6, ko: '중급', en: 'Intermediate', topik: 'TOPIK 3–4', start: 'im-02-02', next: 'im-03-01' },
  { lv: 7, ko: '고급', en: 'Advanced', topik: 'TOPIK 5–6', start: 'ad-01-01', next: 'ad-02-01' },
];
const ltBody = JSON.stringify({ levels: ltLevels, pool: LT_CUSTOM_OVERALL.filter((x) => x.lv != null).map((x) => [x.lv, x.t || (x.g ? 'grammar' : 'grammar'), x.passage ? `${x.passage}\n\n${x.q}` : x.q, x.options, x.answer, x.why || '']) });
fs.writeFileSync(path.join(OUT, 'leveltest.json'), ltBody);
const leveltest = { h: crypto.createHash('sha1').update(ltBody).digest('hex').slice(0, 8), n: JSON.parse(ltBody).pool.length };

/* 번역 연습 · 회화 · 동화책 — 앱 「공부」. 웹 translate.js · convo.js · stories.js 를 그대로(자료 한 벌). */
const { TRANSLATE_SETS } = await import(pathToFileURL(path.join(ROOT, 'translate.js')).href);
const { CONVO } = await import(pathToFileURL(path.join(ROOT, 'convo.js')).href);
const { STORIES } = await import(pathToFileURL(path.join(ROOT, 'stories.js')).href);
const mk = (name, data) => { const body = JSON.stringify(data); fs.writeFileSync(path.join(OUT, `${name}.json`), body); return { h: crypto.createHash('sha1').update(body).digest('hex').slice(0, 8), n: data.length }; };
const translate = mk('translate', TRANSLATE_SETS);
const convo = mk('convo', CONVO);
const stories = mk('stories', STORIES);

const paths = Object.fromEntries(Object.entries(PATHS).map(([k, p]) => [k, { ko: p.ko, en: p.en, courses: pathCourses(p.lvs) }]));
const manifest = { schema: 1, paths, courses, grammarPairs, topik, writing, mock: mockMeta, vocab, games, ui, dict, grammar, pathGrammar, leveltest, translate, convo, stories };
manifest.v = crypto.createHash('sha1').update(JSON.stringify(manifest)).digest('hex').slice(0, 8);
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
const nL = courses.reduce((a, c) => a + c.lessons.length, 0);
console.log(`앱 자료 — 코스 ${courses.length}개 · 레슨 ${nL}개 · 길 ${Object.keys(paths).join('/')}(${Object.values(paths).map((p) => p.courses.length).join('/')}코스) + 문법 비교 ${grammarPairs.n}짝·퀴즈 ${grammarPairs.q}문제 + TOPIK ${Object.values(topik).reduce((a, x) => a + x.n, 0)}문항 + 쓰기 ${writing.n}문항 + 낱말 ${vocab.n} + 게임(워들 ${games.potdle}낱말) + 앱 번역 vi/ja/zh ${ui.vi.n}/${ui.vi.total} + 사전 ${dict.n} + 문법 ${grammar.n} + 레벨테스트 ${leveltest.n} + 번역 ${translate.n}편 · 회화 ${convo.n} · 동화 ${stories.n} → app-data/ (v ${manifest.v}, 길에 안 든 코스 ${courses.filter((c) => !used.has(c.id)).length}개)`);
