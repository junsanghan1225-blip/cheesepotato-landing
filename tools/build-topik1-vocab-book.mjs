#!/usr/bin/env node
/* TOPIK I 필수 단어장 책의 책 틀(docs/books/topik1-vocab-1.json · -2.json)을 만든다 — 운영자 2026-10-26 「TOPIK I 필수 단어장 · 문법 워크북 고급까지 · Korean Idiom까지 쭉 이어서」.
   낱말 = vocab/data/topik1.json 1,931개를 급(1 → 2) · 많이 나오는 순(freq)으로 줄 세워 1권 1~960번째 · 2권 961~1,931번째(971개, 마지막 단원은 11개).
   책 안에서는 급 → 주제 → 많이 나오는 순, 20개씩 단원. 뜻 · 예문은 그 자료 그대로(새로 짓지 않는다). 연습은 TOPIK II 단어장과 같은 틀(뜻 쓰기 · 한국어 쓰기 · 단원 점검 · 내 문장 · QR 게임).
   node tools/build-topik1-vocab-book.mjs [권: 1 | 2]  →  node tools/build-book.mjs topik1-vocab-1 | topik1-vocab-2 [--digital|--review]
   지은이 · 소개 · 판형은 조사 워크북(docs/books/particles-workbook.json)과 같은 값을 쓴다. 색은 TOPIK I 시리즈(모의고사 책)와 같은 초록. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const base = rd('docs/books/particles-workbook.json');
const all = rd('vocab/data/topik1.json');

const VOL = Number(process.argv[2] || 1);
const CFG = {
  1: { id: 'topik1-vocab-1', prefix: 'ta', offset: 0, n: 960, range: '1~960', rangeEn: '1-960', mascot: ['cheese', 1] },
  2: { id: 'topik1-vocab-2', prefix: 'tb', offset: 960, n: 971, range: '961~1,931', rangeEn: '961-1,931', mascot: ['cheese', 2] },
}[VOL];
if (!CFG) throw new Error('권은 1 또는 2');
const N_WORDS = CFG.n, PER = 20, UNITS = Math.ceil(N_WORDS / PER);
/* 급(1 → 2) · 많이 나오는 순으로 줄 세워 권 몫을 자른 뒤, 책 안에서는 급 → 주제 → 많이 나오는 순 */
const picked = [...all].sort((a, b) => (a.level - b.level) || (b.freq - a.freq) || a.head.localeCompare(b.head, 'ko')).slice(CFG.offset, CFG.offset + N_WORDS)
  .sort((a, b) => (a.level - b.level) || String(a.topics?.[0] || '~').localeCompare(String(b.topics?.[0] || '~')) || (b.freq - a.freq) || a.head.localeCompare(b.head, 'ko'));
if (picked.length < N_WORDS) throw new Error(`낱말이 ${picked.length}개뿐`);

const POS = { 명사: 'noun', 동사: 'verb', 형용사: 'adjective', 부사: 'adverb', 관형사: 'determiner', '의존 명사': 'bound noun', 수사: 'numeral', 대명사: 'pronoun', 감탄사: 'interjection', 조사: 'particle' };
/* 빈출도 감자 1~5: TOPIK II 단어장과 같은 눈금(우리 TOPIK 낱말 목록에서 나오는 횟수 freq: 30 이상 5개 · 12 이상 4개 · 6 이상 3개 · 3 이상 2개 · 그 아래 1개).
   1권은 2~5개, 2권은 1~2개가 많다. 한 단원 안에 여러 단계가 섞이도록 단원은 주제로 묶는다 */
const fq = (f) => (f <= 0 ? 0 : f >= 30 ? 5 : f >= 12 ? 4 : f >= 6 ? 3 : f >= 3 ? 2 : 1);
const first = (en) => String(en).split(';')[0].trim();
const pick = (arr, f) => arr.filter((_, i) => f(i));
const LV_KO = { 1: '1급', 2: '2급' };

const bonusUnits = {};
/* QR 보너스(게임) 자료: 낱말 카드 20 · 퀴즈 6 · 빈칸 6. 빈칸 문장은 책에 안 실린 둘째 예문, 나머지는 뜻 → 한국어 쓰기 */
function bonusFor(ws, id, usedInBook) {
  const fst = (w) => first(w.en);
  const quiz = [];
  const others = (w) => ws.filter((x) => x !== w && fst(x) !== fst(w));
  [0, 3, 6, 9, 12, 15].forEach((k, n) => {
    const w = ws[k % ws.length], ds = others(w), pickD = [];
    /* 마지막 단원은 낱말이 11개뿐이라 (k + t*5) 로 건너뛰면 같은 보기가 겹친다 — 겹치지 않을 때까지 한 칸씩 민다 */
    for (let t = 1, j = (k + n) % ds.length; pickD.length < 3 && t < 200; t++, j = (j + 5) % ds.length) { const x = ds[j]; if (!pickD.some((y) => fst(y) === fst(x) || y.head === x.head)) pickD.push(x); else j = (j + 1) % ds.length; }
    const reverse = n % 2 === 1;
    const opts = reverse ? [w.head, ...pickD.map((x) => x.head)] : [fst(w), ...pickD.map((x) => fst(x))];
    const at = (n + 1) % 4; const arr = [...opts.slice(1)]; arr.splice(at, 0, opts[0]);
    quiz.push({ q: reverse ? `Which Korean word means "${fst(w)}"?` : `What does ${w.head} mean?`, opts: arr, a: at, why: `${w.head} means ${w.en}. ${w.examples[1].ko} (${w.examples[1].en})` });
  });
  const fill = [];
  /* 빈칸 문장에서 ___ 를 뺀 글이 같은 단원의 다른 예문 안에 그대로 들어 있으면(check-bonus 겹침 금지) 건너뛴다 */
  const kor = (t) => (String(t).match(/[가-힣]+/g) || []).join('');
  const clash = (w) => { const k = kor(w.examples[1].ko.replace(w.head, '')); return k.length >= 5 && ws.some((x) => x !== w && x.examples.some((e) => kor(e.ko).includes(k))); };
  for (const w of ws.filter((x) => !usedInBook.includes(x))) {
    if (fill.length >= 3) break;
    if (['명사', '부사'].includes(w.pos) && w.head.length >= 2 && w.examples[1] && w.examples[1].ko.split(w.head).length === 2 && !clash(w)) fill.push({ q: w.examples[1].ko.replace(w.head, '___'), en: w.examples[1].en, a: [w.head] });
  }
  for (const w of ws.filter((x) => !fill.some((f) => f.a[0] === x.head))) {
    if (fill.length >= 6) break;
    if (ws.filter((x) => fst(x) === fst(w)).length === 1) fill.push({ q: `"${fst(w)}" in Korean: ___`, en: w.en, a: [w.head] });
  }
  return { cards: ws.map((w) => ({ ko: w.head, en: `${w.en} (${POS[w.pos] || w.pos})` })), quiz, fill };
}
/* 헷갈리는 낱말(유의어 · 동음이의어 · 비슷한 말) — 안티가 쓴 docs/vocab-book/topik2-vocab-1000.notes.json 이 있으면 단원 끝에 표로 붙인다(지시 docs/antigravity/antigravity-vocab-notes-task.md) */
const NOTES_F = path.join(ROOT, `docs/vocab-book/${CFG.id}.notes.json`);
const NOTES_RAW = fs.existsSync(NOTES_F) ? JSON.parse(fs.readFileSync(NOTES_F, 'utf8')) : {};
/* 메모가 적힌 단원에 그 낱말이 하나도 없으면(4권처럼 단원이 어긋난 경우) 낱말이 모인 단원으로 옮긴다. 짝 낱말만 다른 단원에 있는 메모는 그대로 둔다 */
const NOTE_UNIT = {};
for (let u = 0; u < UNITS; u++) for (const w of picked.slice(u * PER, u * PER + PER)) (NOTE_UNIT[w.head] ||= new Set()).add(`${CFG.prefix}-${String(u + 1).padStart(2, '0')}`);
const NOTES = {};
let notesDropped = 0, notesMoved = 0;
for (const [key, arr] of Object.entries(NOTES_RAW)) for (const n of arr || []) {
  const sets = [...new Set(n.words)].map((x) => NOTE_UNIT[x] || new Set());
  let to = sets.some((st) => st.has(key)) ? key : null;
  if (!to) {
    const all = [...(sets[0] || [])].find((id) => sets.every((st) => st.has(id)));
    to = all || [...(sets[0] || [])][0] || null;
    if (to) notesMoved++;
  }
  if (to) (NOTES[to] ||= []).push(n); else notesDropped++;
}
if (notesMoved) console.log(`헷갈리는 낱말 메모 ${notesMoved}개를 낱말이 있는 단원으로 옮겼다`);
if (notesDropped) console.log(`⚠ 헷갈리는 낱말 메모 ${notesDropped}개는 책에 없는 낱말이라 뺐다`);
const KIND = { synonym: 'Similar · 비슷한 말', homonym: 'Same spelling · 동음이의어', contrast: 'Do not mix up · 헷갈림', antonym: 'Opposites · 반대말' };
const AVOID = new Set(['누다', '살인']);
const inline = {};
const unitsOf = [];
for (let u = 0; u < UNITS; u++) {
  const ws = picked.slice(u * PER, u * PER + PER);
  const no = u + 1, id = `${CFG.prefix}-${String(no).padStart(2, '0')}`;
  const lvs = [...new Set(ws.map((w) => w.level))];
  const lvKo = lvs.map((l) => LV_KO[l]).join('·'), lvEn = lvs.map((l) => `Level ${l}`).join(' / ');
  const exOf = (w) => (w.examples && w.examples[0]) || null;
  const secs = [];
  secs.push({ type: 'vocab', title: { en: 'Words', ko: '낱말' }, from: CFG.offset + u * PER, entries: ws.map((w) => ({ ko: w.head, pos: POS[w.pos] || w.pos, en: w.en, ex: exOf(w), lv: w.level, fq: fq(w.freq) })) });
  const firsts = ws.map((w) => first(w.en));
  /* 단원 점검(Checkup): 짝짓기 5 + 빈칸 4(낱말 상자). 빈칸 문장은 책에 실린 첫 예문이 아니라 둘째 예문 */
  const clozeW = ws.filter((w) => ['명사', '부사'].includes(w.pos) && w.head.length >= 2 && w.examples[1] && w.examples[1].ko.split(w.head).length === 2).slice(0, 4);
  const rest = ws.filter((w) => !clozeW.includes(w) && firsts.filter((x) => x === first(w.en)).length === 1);
  const matchW = [...rest.filter((w) => w.pos !== '명사'), ...rest.filter((w) => w.pos === '명사')].slice(0, 5);
  const decoy = rest.find((w) => !matchW.includes(w)) || ws.find((w) => !matchW.includes(w) && !clozeW.includes(w));
  const mean = (w) => first(w.en);
  const rot = (arr, k) => arr.map((_, i) => arr[(i + k) % arr.length]);
  const mOpts = rot([...matchW, decoy], (u * 2 + 1) % 6);
  const cBank = rot(clozeW, (u + 1) % Math.max(clozeW.length, 1));
  if (matchW.length === 5 && clozeW.length >= 3) secs.push({ type: 'checkup', title: { en: 'Unit Checkup', ko: '단원 점검' },
    match: { words: matchW.map((w) => w.head), options: mOpts.map((w) => mean(w)), answer: matchW.map((w) => 'abcdef'[mOpts.indexOf(w)]) },
    cloze: { items: clozeW.map((w) => ({ q: w.examples[1].ko.replace(w.head, '___'), en: w.examples[1].en, a: w.head })), bank: cBank.map((w) => w.head) } });
  if (Array.isArray(NOTES[id]) && NOTES[id].length) secs.push({ type: 'compare', noIndex: true, title: { en: 'Look-alike words', ko: '헷갈리는 낱말' }, items: NOTES[id] });
  const uniq = (i) => firsts.filter((x) => x === firsts[i]).length === 1;
  secs.push({ type: 'practice', title: { en: 'Write the meaning', ko: '뜻 쓰기' }, hint: 'Cover the word list first, then write the English meaning.', items: pick(ws, (i) => i % 4 === 0).map((w) => ({ q: `${w.head} →`, a: w.en })) });
  secs.push({ type: 'practice', title: { en: 'Write the Korean', ko: '한국어 쓰기' }, hint: 'Cover the word list first, then write the Korean word.', items: ws.map((w, i) => ({ w, i })).filter(({ i }) => i % 4 === 2).map(({ w, i }) => ({ q: `${uniq(i) ? firsts[i] : w.en} →`, a: w.head })) });
  const OK = ws.filter((w) => !AVOID.has(w.head));   // 「내 문장 쓰기」에 어울리지 않는 낱말은 건너뛴다
  const mine = [OK[3], OK[12]].filter(Boolean);
  secs.push({ type: 'practice', title: { en: 'Your turn', ko: '내 문장 쓰기' }, hint: 'Use each word in a true sentence about your own life. Say it aloud.', items: mine.map((w) => ({ q: `Write a sentence with ${w.head}. →`, a: '(Your own sentence · 내 문장)' })) });
  inline[id] = {
    id, title: { en: `Words ${no} · ${lvEn}`, ko: `낱말 ${no} · ${lvKo}` },
    sub: { en: `Up to ${PER} essential TOPIK I words, with an example sentence for each.`, ko: `TOPIK I 필수 낱말 ${PER}개와 예문` },
    sections: secs,
  };
  unitsOf.push({ id, lv: ws[0].level });
  bonusUnits[id] = bonusFor(ws, id, secs.find((x) => x.type === 'checkup') ? clozeW : []);
}

/* 부 = 급. 단원 첫 낱말의 급으로 가른다 */
const partNames = { 1: { en: 'Level 1 words', ko: '1급 낱말' }, 2: { en: 'Level 2 words', ko: '2급 낱말' } };
const parts = [1, 2].map((l) => ({ title: partNames[l], units: unitsOf.filter((x) => x.lv === l).map((x) => x.id) })).filter((p) => p.units.length);
const LAST = N_WORDS - (UNITS - 1) * PER;

const book = {
  _note: `책 한 권의 틀: tools/build-topik1-vocab-book.mjs ${VOL} 이 만든다(손으로 고치지 않는다). node tools/build-book.mjs ${CFG.id}. 낱말 · 뜻 · 예문은 vocab/data/topik1.json. 지은이 · 신고번호 · ISBN · 정가 · 발행일은 비어 있는 자리.`,
  id: CFG.id, edition: 'Draft proof · 시안', theme: 'classic', color: '#12704F', tint: '#E8F3EE',
  series: { en: 'TOPIK SERIES', ko: 'TOPIK 시리즈' },
  title: { en: `TOPIK I Essential Vocabulary ${VOL}`, ko: `TOPIK I 필수 단어장 ${VOL}` },
  sub: { en: `Words ${CFG.rangeEn} of the TOPIK I word list, ${UNITS} units with example sentences, checkups and writing practice.`, ko: `TOPIK I 필수 낱말 ${CFG.range}` },
  levelTag: 'VOCAB', level: 'TOPIK I', trim: base.trim, cheeseBase: 0,
  author: base.author, authorAbout: base.authorAbout, publisher: base.publisher, web: base.web,
  preface: {
    en: [VOL === 1 ? 'This is the first of two books with the essential words of TOPIK I, taken from the TOPIK I word list on everykoreans.com: all 858 level-1 words and the most frequent level-2 words, 960 in all. Each unit has up to 20 words with part of speech, an English meaning and an example sentence. The cheese marks the level and the potato marks how often the word shows up in our TOPIK texts.' : 'This is the second of two books with the essential words of TOPIK I: the rest of the level-2 words of the TOPIK I word list on everykoreans.com, 971 words in 49 units. Each unit has up to 20 words with part of speech, an English meaning and an example sentence. The cheese marks the level and the potato marks how often the word shows up in our TOPIK texts.',
      'Read the table aloud, then cover the English and test yourself. Write your answers on the lines, check the answer key at the back, and come back a few days later.',
      `You do not have to memorize ${N_WORDS.toLocaleString('en-US')} words in one go. One unit a day is a calm pace: ${UNITS} units, about ${Math.round(UNITS / 7)} weeks.`],
    ko: [VOL === 1 ? '이 책은 TOPIK I 필수 낱말 두 권 가운데 첫 권입니다. everykoreans.com 의 TOPIK I 낱말 목록에서 1급 낱말 858개 전부와, 2급 낱말 가운데 많이 나오는 것을 더해 모두 960개를 담았습니다. 단원마다 낱말 20개 이하: 품사 · 영어 뜻 · 예문. 치즈는 급수, 감자는 우리 TOPIK 글에 나오는 정도입니다.' : '이 책은 TOPIK I 필수 낱말 두 권 가운데 둘째 권입니다. everykoreans.com 의 TOPIK I 낱말 목록에서 남은 2급 낱말 971개를 49단원에 담았습니다. 단원마다 낱말 20개 이하: 품사 · 영어 뜻 · 예문. 치즈는 급수, 감자는 우리 TOPIK 글에 나오는 정도입니다.',
      '표를 소리 내 읽고, 영어를 가리고 스스로 확인하세요. 답은 줄 위에 쓰고, 뒤쪽 정답으로 확인한 뒤 며칠 뒤에 다시 풀어 보세요.',
      `${N_WORDS.toLocaleString('en-US')}개를 한 번에 외울 필요는 없습니다. 하루 한 단원이면 ${UNITS}단원, 약 ${Math.round(UNITS / 7)}주입니다.`],
  },
  howto: {
    en: ['Read each word and its example sentence aloud.', 'Cover the English column with a card and test yourself, then cover the Korean.', 'Write your answers on the lines. Use pencil: you will want to do the page again.', 'Check the Answer Key at the back, mark the words you missed, and try them again after 1, 3 and 7 days.', 'Scan the QR code at the start of a unit for a free word game with the same words.', 'Free practice and more books: everykoreans.com'],
    ko: ['낱말과 예문을 소리 내 읽으세요.', '카드로 영어 칸을 가리고 스스로 확인한 뒤, 이번엔 한국어 칸을 가려 보세요.', '답은 줄 위에 직접 쓰세요. 다시 풀고 싶어지니 연필을 쓰세요.', '뒤쪽 정답을 확인하고, 틀린 낱말에 표시한 뒤 1일, 3일, 7일 뒤에 다시 해 보세요.', '단원 처음의 QR 을 찍으면 같은 낱말의 무료 게임이 열립니다.', '무료 연습 · 더 많은 책: everykoreans.com'],
  },
  bonusUnits: unitsOf.map((x) => x.id),
  back: { items: [[`${UNITS} units · ${UNITS}개 단원`, `TOPIK I words ${CFG.rangeEn} · TOPIK I 낱말 ${CFG.range}번째`], ['Example, checkup & writing practice · 예문 · 점검 · 쓰기 연습', 'Cover, write, check · 가리고 쓰고 확인하기'], ['Cheese = level, potato = how often · 치즈 = 급수, 감자 = 빈출도', 'Same scale in every book of the series · 시리즈 모든 권이 같은 눈금']], for: 'For TOPIK I learners · TOPIK I 준비에', price: '정가 6.9달러' },
  parts, noGuide: true, inline, blocks: {}, unitCount: UNITS,
  coverAccent: '단어장',
  coverLevel: { code: 'TOPIK I', name: VOL === 1 ? '1~2급' : '2급', bg: '#12704F', bg2: '#0B4A33', mascot: CFG.mascot, title: ['TOPIK I', '필수 단어장', `${VOL}권`], sub: `TOPIK I 필수 낱말 ${CFG.range}` },
  reviewer: base.reviewer, authorBio: base.authorBio,
};
book.published = '2026.11.10';   // ISBN 신청서 발행일 = 판권지 발행(tools/check-isbn.mjs)
book.sub.ko = book.coverLevel.sub;   // 표지 부제목 = 책 부제목 = ISBN 신청서 부제목
fs.writeFileSync(path.join(ROOT, `docs/books/${CFG.id}.json`), JSON.stringify(book, null, 1) + '\n');
fs.mkdirSync(path.join(ROOT, 'docs/bonus'), { recursive: true });
fs.writeFileSync(path.join(ROOT, `docs/bonus/${CFG.id}.json`), JSON.stringify({ _note: '책 QR 보너스 연습(게임) — tools/build-topik1-vocab-book.mjs 가 단어장 자료에서 만든다(손으로 고치지 않는다)', book: CFG.id, game: true, maxCards: 20, units: bonusUnits }, null, 1) + '\n');
console.log(`TOPIK I 필수 단어장 ${VOL}권: ${N_WORDS}개 · ${UNITS}단원(마지막 ${LAST}개) · 부 ${parts.map((p) => p.units.length).join('/')} → docs/books/${CFG.id}.json`);
