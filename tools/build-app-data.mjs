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
const { GRAMMAR_EN } = await import(pathToFileURL(path.join(ROOT, 'grammar-en.js')).href);
const points = new Map(SB_CATS.flatMap((c) => c.points).map((p) => [p.id, p]));
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

const paths = Object.fromEntries(Object.entries(PATHS).map(([k, p]) => [k, { ko: p.ko, en: p.en, courses: pathCourses(p.lvs) }]));
const manifest = { schema: 1, paths, courses, grammarPairs, topik, writing, mock: mockMeta, vocab, games };
manifest.v = crypto.createHash('sha1').update(JSON.stringify(manifest)).digest('hex').slice(0, 8);
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
const nL = courses.reduce((a, c) => a + c.lessons.length, 0);
console.log(`앱 자료 — 코스 ${courses.length}개 · 레슨 ${nL}개 · 길 ${Object.keys(paths).join('/')}(${Object.values(paths).map((p) => p.courses.length).join('/')}코스) + 문법 비교 ${grammarPairs.n}짝·퀴즈 ${grammarPairs.q}문제 + TOPIK ${Object.values(topik).reduce((a, x) => a + x.n, 0)}문항 + 쓰기 ${writing.n}문항 + 낱말 ${vocab.n} + 게임(워들 ${games.potdle}낱말) → app-data/ (v ${manifest.v}, 길에 안 든 코스 ${courses.filter((c) => !used.has(c.id)).length}개)`);
