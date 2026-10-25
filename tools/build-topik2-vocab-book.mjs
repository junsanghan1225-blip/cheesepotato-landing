#!/usr/bin/env node
/* TOPIK II 단어장 책(1,000개)의 책 틀(docs/books/topik2-vocab-1000.json)을 만든다 — 운영자 2026-10-25 「TOPIK II 단어장도 책도 만들어줘」(크기: 자주 나오는 1,000개 한 권).
   낱말 = vocab/data/topik2.json 에서 급(3~6) 오름차순 · 많이 나오는 순(freq)으로 1,000개 → 20개씩 50단원. 뜻 · 예문은 그 자료 그대로(새로 짓지 않는다).
   연습은 자료에서 자동으로: 뜻 쓰기 10 · 한국어 쓰기 10 · 빈칸(예문에 낱말이 그대로 있는 것만, 최대 5) · 내 문장 2.
   node tools/build-topik2-vocab-book.mjs [권: 1 | 2]  →  node tools/build-book.mjs topik2-vocab-1000 | topik2-vocab-2000 [--digital|--review]
   1권 = 많이 나오는 순 1~1,000번째 · 2권 = 1,001~2,000번째(운영자 2026-10-25 「다음 책도 같은 걸로 시리즈로 · 2번째 책도 단어장 TOPIK II」).
   지은이 · 소개 · 표지 색 같은 틀은 조사 워크북(docs/books/particles-workbook.json)과 같은 값을 쓴다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const base = rd('docs/books/particles-workbook.json');
const all = rd('vocab/data/topik2.json');

const VOL = Number(process.argv[2] || 1);
const CFG = {
  1: { id: 'topik2-vocab-1000', prefix: 'tv', offset: 0, range: '1~1,000', rangeEn: '1-1,000', mascot: ['cheese', 5] },
  2: { id: 'topik2-vocab-2000', prefix: 'tw', offset: 1000, range: '1,001~2,000', rangeEn: '1,001-2,000', mascot: ['cheese', 6] },
  /* 3권(운영자 2026-10-25 「급수별 3권」): 1 · 2권에 없는 3급 낱말. 우리 자료에서 나온 횟수가 거의 0이라 「자주 나오는 순」이 아니라 급 · 주제로 묶는다 */
  3: { id: 'topik2-vocab-lv3', prefix: 'tx', n: 940, lv3: true, range: '3급 940개', rangeEn: 'level 3, 940 words', mascot: ['cheese', 3] },
}[VOL];
if (!CFG) throw new Error('권은 1 또는 2');
const N_WORDS = CFG.n || 1000, PER = 20;
/* 1,000개: 많이 나오는 순으로 뽑은 뒤, 책 안에서는 급 → 많이 나오는 순 */
const picked = [...all].sort((a, b) => (b.freq - a.freq) || a.head.localeCompare(b.head, 'ko')).filter((w, i) => !CFG.lv3 || (i >= 2000 && w.level === 3 && w.examples.length >= 2)).slice(CFG.lv3 ? 0 : CFG.offset, CFG.lv3 ? N_WORDS : CFG.offset + N_WORDS)
  .sort((a, b) => (a.level - b.level) || String(a.topics?.[0] || '~').localeCompare(String(b.topics?.[0] || '~')) || (b.freq - a.freq) || a.head.localeCompare(b.head, 'ko'));
if (picked.length < N_WORDS) throw new Error(`낱말이 ${picked.length}개뿐`);

const POS = { 명사: 'noun', 동사: 'verb', 형용사: 'adjective', 부사: 'adverb', 관형사: 'determiner', '의존 명사': 'bound noun', 수사: 'numeral', 대명사: 'pronoun', 감탄사: 'interjection', 조사: 'particle' };
/* 빈출도 감자 1~5: 시리즈 모든 권이 같은 눈금(우리 TOPIK II 낱말 목록에서 나오는 횟수 freq: 30 이상 5개 · 12 이상 4개 · 6 이상 3개 · 3 이상 2개 · 그 아래 1개).
   1권은 2~5개, 2권은 1~2개가 많다. 한 단원 안에 여러 단계가 섞이도록 단원은 주제로 묶는다 */
const fq = (f) => (f <= 0 ? 0 : f >= 30 ? 5 : f >= 12 ? 4 : f >= 6 ? 3 : f >= 3 ? 2 : 1);
const first = (en) => String(en).split(';')[0].trim();
const pick = (arr, f) => arr.filter((_, i) => f(i));
const LV_KO = { 3: '3급', 4: '4급', 5: '5급', 6: '6급' };

const bonusUnits = {};
/* QR 보너스(게임) 자료: 낱말 카드 20 · 퀴즈 6 · 빈칸 6. 빈칸 문장은 책에 안 실린 둘째 예문, 나머지는 뜻 → 한국어 쓰기 */
function bonusFor(ws, id, usedInBook) {
  const fst = (w) => first(w.en);
  const quiz = [];
  const others = (w) => ws.filter((x) => x !== w && fst(x) !== fst(w));
  [0, 3, 6, 9, 12, 15].forEach((k, n) => {
    const w = ws[k % ws.length], ds = others(w), pickD = [1, 2, 3].map((t) => ds[(k + t * 5 + n) % ds.length]);
    const reverse = n % 2 === 1;
    const opts = reverse ? [w.head, ...pickD.map((x) => x.head)] : [fst(w), ...pickD.map((x) => fst(x))];
    const at = (n + 1) % 4; const arr = [...opts.slice(1)]; arr.splice(at, 0, opts[0]);
    quiz.push({ q: reverse ? `Which Korean word means "${fst(w)}"?` : `What does ${w.head} mean?`, opts: arr, a: at, why: `${w.head} means ${w.en}. ${w.examples[1].ko} (${w.examples[1].en})` });
  });
  const fill = [];
  for (const w of ws.filter((x) => !usedInBook.includes(x))) {
    if (fill.length >= 3) break;
    if (['명사', '부사'].includes(w.pos) && w.head.length >= 2 && w.examples[1] && w.examples[1].ko.split(w.head).length === 2) fill.push({ q: w.examples[1].ko.replace(w.head, '___'), en: w.examples[1].en, a: [w.head] });
  }
  for (const w of ws.filter((x) => !fill.some((f) => f.a[0] === x.head))) {
    if (fill.length >= 6) break;
    if (ws.filter((x) => fst(x) === fst(w)).length === 1) fill.push({ q: `"${fst(w)}" in Korean: ___`, en: w.en, a: [w.head] });
  }
  return { cards: ws.map((w) => ({ ko: w.head, en: `${w.en} (${POS[w.pos] || w.pos})` })), quiz, fill };
}
/* 헷갈리는 낱말(유의어 · 동음이의어 · 비슷한 말) — 안티가 쓴 docs/vocab-book/topik2-vocab-1000.notes.json 이 있으면 단원 끝에 표로 붙인다(지시 docs/antigravity/antigravity-vocab-notes-task.md) */
const NOTES_F = path.join(ROOT, `docs/vocab-book/${CFG.id}.notes.json`);
const NOTES = fs.existsSync(NOTES_F) ? JSON.parse(fs.readFileSync(NOTES_F, 'utf8')) : {};
const KIND = { synonym: 'Similar · 비슷한 말', homonym: 'Same spelling · 동음이의어', contrast: 'Do not mix up · 헷갈림', antonym: 'Opposites · 반대말' };
const inline = {};
const unitsOf = [];
for (let u = 0; u < N_WORDS / PER; u++) {
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
  const mine = [ws[3], ws[12]].filter(Boolean);
  secs.push({ type: 'practice', title: { en: 'Your turn', ko: '내 문장 쓰기' }, hint: 'Use each word in a true sentence about your own life. Say it aloud.', items: mine.map((w) => ({ q: `Write a sentence with ${w.head}. →`, a: '(Your own sentence · 내 문장)' })) });
  inline[id] = {
    id, title: { en: `Words ${no} · ${lvEn}`, ko: `낱말 ${no} · ${lvKo}` },
    sub: CFG.lv3 ? { en: `${PER} level-3 words grouped by topic, with an example sentence for each.`, ko: `주제로 묶은 3급 낱말 ${PER}개와 예문` } : { en: `${PER} words that appear often in TOPIK II, with an example sentence for each.`, ko: `TOPIK II 에 자주 나오는 낱말 ${PER}개와 예문` },
    sections: secs,
  };
  unitsOf.push({ id, lv: ws[0].level });
  bonusUnits[id] = bonusFor(ws, id, secs.find((x) => x.type === 'checkup') ? clozeW : []);
}

/* 부 = 급. 단원 첫 낱말의 급으로 가른다 */
const partNames = { 3: { en: 'Level 3 words', ko: '3급 낱말' }, 4: { en: 'Level 4 words', ko: '4급 낱말' }, 5: { en: 'Level 5 words', ko: '5급 낱말' }, 6: { en: 'Level 6 words', ko: '6급 낱말' } };
const parts = CFG.lv3 ? [0, 1, 2, 3].map((k) => { const ids = unitsOf.slice(k * 12, k * 12 + 12).map((x) => x.id); const a = k * 12 * PER + 1, b = Math.min((k * 12 + ids.length) * PER, N_WORDS); return { title: { en: `Words ${a}-${b}`, ko: `낱말 ${a}~${b}` }, units: ids }; }).filter((p) => p.units.length) : [3, 4, 5, 6].map((l) => ({ title: partNames[l], units: unitsOf.filter((x) => x.lv === l).map((x) => x.id) })).filter((p) => p.units.length);

const book = {
  _note: `책 한 권의 틀: tools/build-topik2-vocab-book.mjs ${VOL} 이 만든다(손으로 고치지 않는다). node tools/build-book.mjs ${CFG.id}. 낱말 · 뜻 · 예문은 vocab/data/topik2.json. 지은이 · 신고번호 · ISBN · 정가 · 발행일은 비어 있는 자리.`,
  id: CFG.id, edition: 'Draft proof · 시안', theme: 'classic', color: '#6B3FA0', tint: '#F3EEFA',
  series: base.series,
  title: { en: `TOPIK II Vocabulary Workbook ${VOL}`, ko: `TOPIK II 단어장 워크북 ${VOL}` },
  sub: CFG.lv3 ? { en: `${N_WORDS} level-3 words that are not in Books 1 and 2, 20 per unit, with example sentences and writing practice.`, ko: `1 · 2권에 없는 TOPIK II 3급 낱말 ${N_WORDS}개 · 20개씩 ${N_WORDS / PER}단원 · 예문과 쓰기 연습` } : { en: `Words ${CFG.rangeEn} by how often they appear in TOPIK II, 20 per unit, with example sentences and writing practice.`, ko: `TOPIK II 에 자주 나오는 순 ${CFG.range}번째 낱말 · 20개씩 50단원 · 예문과 쓰기 연습` },
  levelTag: 'VOCAB', level: 'TOPIK II', trim: base.trim,
  author: base.author, authorAbout: base.authorAbout, publisher: base.publisher, web: base.web,
  preface: {
    en: [VOL === 3 ? 'This is the third book of the series: the level-3 words of the TOPIK II word list on everykoreans.com that are not in Book 1 or Book 2. Most of them did not show up in our TOPIK II texts yet, so their potato marks are empty. Each unit has 20 words grouped by topic, an example sentence for each, and short writing practice.' : VOL === 1 ? 'These are the 1,000 words that appear most often in the TOPIK II word list we use on everykoreans.com, arranged from level 3 to level 6. Each unit has 20 words, an example sentence for each, and short writing practice.' : 'This is the second book of the series: the words ranked 1,001 to 2,000 by how often they appear in the TOPIK II word list we use on everykoreans.com, arranged from level 3 to level 6. Book 1 has the 1,000 most frequent words. Each unit has 20 words, an example sentence for each, and short writing practice.',
      'Read the table aloud, then cover the English and test yourself. Write your answers on the lines, check the answer key at the back, and come back a few days later.',
      `You do not have to memorize ${N_WORDS.toLocaleString('en-US')} words in one go. One unit a day is a calm pace: ${N_WORDS / PER} units, about ${['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][Math.round(N_WORDS / PER / 7)]} weeks.`],
    ko: [VOL === 3 ? '이 책은 시리즈의 세 번째 책입니다. everykoreans.com 의 TOPIK II 낱말 목록 가운데 1권과 2권에 없는 3급 낱말을 모았습니다. 대부분은 우리 TOPIK II 자료에서 아직 나온 적이 없어서 감자 표시가 비어 있습니다. 단원마다 주제로 묶은 낱말 20개와 낱말마다 예문 하나, 짧은 쓰기 연습이 있습니다.' : VOL === 1 ? '이 책은 everykoreans.com 의 TOPIK II 낱말 목록에서 가장 자주 나오는 낱말 1,000개를 3급부터 6급까지 차례로 모은 것입니다. 단원마다 낱말 20개와 낱말마다 예문 하나, 짧은 쓰기 연습이 있습니다.' : '이 책은 시리즈의 두 번째 책입니다. everykoreans.com 의 TOPIK II 낱말 목록에서 자주 나오는 순으로 1,001번째부터 2,000번째까지의 낱말을 3급부터 6급까지 차례로 모았습니다. 가장 자주 나오는 1,000개는 1권에 있습니다. 단원마다 낱말 20개와 낱말마다 예문 하나, 짧은 쓰기 연습이 있습니다.',
      '표를 소리 내 읽고, 영어를 가리고 스스로 확인하세요. 답은 줄 위에 쓰고, 뒤쪽 정답으로 확인한 뒤 며칠 뒤에 다시 풀어 보세요.',
      `${N_WORDS.toLocaleString('en-US')}개를 한 번에 외울 필요는 없습니다. 하루 한 단원이면 ${N_WORDS / PER}단원, 약 ${Math.round(N_WORDS / PER / 7)}주입니다.`],
  },
  howto: {
    en: ['Read each word and its example sentence aloud.', 'Cover the English column with a card and test yourself, then cover the Korean.', 'Write your answers on the lines. Use pencil: you will want to do the page again.', 'Check the Answer Key at the back, mark the words you missed, and try them again after 1, 3 and 7 days.', 'Look up any word in the Index. It tells you which unit it appears in.', 'Free lessons, games and more worksheets: everykoreans.com'],
    ko: ['낱말과 예문을 소리 내 읽으세요.', '카드로 영어 칸을 가리고 스스로 확인한 뒤, 이번엔 한국어 칸을 가려 보세요.', '답은 줄 위에 직접 쓰세요. 다시 풀고 싶어지니 연필을 쓰세요.', '뒤쪽 정답을 확인하고, 틀린 낱말에 표시한 뒤 1일, 3일, 7일 뒤에 다시 풀어 보세요.', '모르는 낱말은 찾아보기에서 찾으세요. 어느 단원에 있는지 알려 줍니다.', '무료 레슨 · 게임 · 학습지: everykoreans.com'],
  },
  bonusUnits: unitsOf.map((x) => x.id),
  back: { items: [[`${N_WORDS / PER} units · ${N_WORDS / PER}개 단원`, CFG.lv3 ? `${N_WORDS} level-3 words not in Books 1 and 2 · 1 · 2권에 없는 3급 낱말 ${N_WORDS}개` : `TOPIK II words ${CFG.rangeEn}, level 3 to 6 · 3급부터 6급까지 ${CFG.range}번째 낱말`], ['Example, checkup &amp; look-alike words · 예문 · 단원 점검 · 헷갈리는 낱말', 'Cheese = level, potato = frequency · 치즈는 급수, 감자는 빈출도'], ['Scan the QR for a match game · QR 로 짝 맞추기 게임', 'Practice the same 20 words on your phone · 같은 낱말 20개를 폰으로']], for: CFG.lv3 ? 'For TOPIK II learners aiming at level 3 and beyond · TOPIK II 3급 이상 준비에' : 'For TOPIK II learners, level 3 to 6 · TOPIK II 3~6급 준비에', price: '정가 6.9달러' },
  parts, noGuide: true, inline, blocks: {}, unitCount: N_WORDS / PER,
  coverAccent: '단어장',
  coverLevel: { code: 'TOPIK II', name: CFG.lv3 ? '3급' : '3~6급', bg: '#4B2A85', bg2: '#32195E', mascot: CFG.mascot, title: ['TOPIK II', '단어장', `워크북 ${VOL}`], sub: CFG.lv3 ? `1 · 2권에 없는 3급 낱말 ${N_WORDS}개` : `자주 나오는 낱말 ${CFG.range}` },
  reviewer: base.reviewer, authorBio: base.authorBio,
};
fs.writeFileSync(path.join(ROOT, `docs/books/${CFG.id}.json`), JSON.stringify(book, null, 1) + '\n');
fs.writeFileSync(path.join(ROOT, `docs/bonus/${CFG.id}.json`), JSON.stringify({ _note: '책 QR 보너스 연습(게임) — tools/build-topik2-vocab-book.mjs 가 단어장 자료에서 만든다(손으로 고치지 않는다)', book: CFG.id, game: true, maxCards: 20, units: bonusUnits }, null, 1) + '\n');
console.log(`TOPIK II 단어장: ${N_WORDS}개 · ${N_WORDS / PER}단원 · 부 ${parts.map((p) => p.units.length).join('/')} → docs/books/${CFG.id}.json`);
