#!/usr/bin/env node
/* TOPIK II 단어장 책(1,000개)의 책 틀(docs/books/topik2-vocab-1000.json)을 만든다 — 운영자 2026-10-25 「TOPIK II 단어장도 책도 만들어줘」(크기: 자주 나오는 1,000개 한 권).
   낱말 = vocab/data/topik2.json 에서 급(3~6) 오름차순 · 많이 나오는 순(freq)으로 1,000개 → 20개씩 50단원. 뜻 · 예문은 그 자료 그대로(새로 짓지 않는다).
   연습은 자료에서 자동으로: 뜻 쓰기 10 · 한국어 쓰기 10 · 빈칸(예문에 낱말이 그대로 있는 것만, 최대 5) · 내 문장 2.
   node tools/build-topik2-vocab-book.mjs  →  node tools/build-book.mjs topik2-vocab-1000 [--digital|--review]
   지은이 · 소개 · 표지 색 같은 틀은 조사 워크북(docs/books/particles-workbook.json)과 같은 값을 쓴다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const base = rd('docs/books/particles-workbook.json');
const all = rd('vocab/data/topik2.json');

const N_WORDS = 1000, PER = 20;
/* 1,000개: 많이 나오는 순으로 뽑은 뒤, 책 안에서는 급 → 많이 나오는 순 */
const picked = [...all].sort((a, b) => (b.freq - a.freq) || a.head.localeCompare(b.head, 'ko')).slice(0, N_WORDS)
  .sort((a, b) => (a.level - b.level) || (b.freq - a.freq) || a.head.localeCompare(b.head, 'ko'));
if (picked.length < N_WORDS) throw new Error(`낱말이 ${picked.length}개뿐`);

const POS = { 명사: 'noun', 동사: 'verb', 형용사: 'adjective', 부사: 'adverb', 관형사: 'determiner', '의존 명사': 'bound noun', 수사: 'numeral', 대명사: 'pronoun', 감탄사: 'interjection', 조사: 'particle' };
const first = (en) => String(en).split(';')[0].trim();
const pick = (arr, f) => arr.filter((_, i) => f(i));
const LV_KO = { 3: '3급', 4: '4급', 5: '5급', 6: '6급' };

const inline = {};
const unitsOf = [];
for (let u = 0; u < N_WORDS / PER; u++) {
  const ws = picked.slice(u * PER, u * PER + PER);
  const no = u + 1, id = `tv-${String(no).padStart(2, '0')}`;
  const lvs = [...new Set(ws.map((w) => w.level))];
  const lvKo = lvs.map((l) => LV_KO[l]).join('·'), lvEn = lvs.map((l) => `Level ${l}`).join(' / ');
  const exOf = (w) => (w.examples && w.examples[0]) || null;
  const secs = [];
  secs.push({ type: 'table', title: { en: 'Words', ko: '낱말' }, cols: ['Korean · 한국어', 'English · 뜻'], rows: ws.map((w) => [w.head, `${w.en}  (${POS[w.pos] || w.pos})`]) });
  secs.push({ type: 'table', title: { en: 'In a sentence', ko: '문장 속에서' }, cols: ['Example · 예문', 'English'], rows: ws.map((w) => { const e = exOf(w); return [e.ko, e.en]; }) });
  const firsts = ws.map((w) => first(w.en));
  const uniq = (i) => firsts.filter((x) => x === firsts[i]).length === 1;
  secs.push({ type: 'practice', title: { en: 'Meaning check', ko: '뜻 쓰기' }, hint: 'Write the English meaning. Cover the table first.', items: pick(ws, (i) => i % 2 === 0).map((w) => ({ q: `${w.head} →`, a: w.en })) });
  secs.push({ type: 'practice', title: { en: 'Korean check', ko: '한국어 쓰기' }, hint: 'Write the Korean word. Cover the table first.', items: ws.map((w, i) => ({ w, i })).filter(({ i }) => i % 2 === 1).map(({ w, i }) => ({ q: `${uniq(i) ? firsts[i] : w.en} →`, a: w.head })) });
  const cloze = [];
  for (const w of ws) {
    const e = exOf(w); if (!e || w.head.length < 2 || !['명사', '부사'].includes(w.pos)) continue;
    if (e.ko.split(w.head).length !== 2) continue;
    cloze.push({ q: `${e.ko.replace(w.head, '___')}  (${e.en})`, a: w.head });
    if (cloze.length === 5) break;
  }
  if (cloze.length >= 3) secs.push({ type: 'practice', title: { en: 'Fill in the blank', ko: '빈칸 채우기' }, hint: 'Write the missing word from this unit.', items: cloze });
  const mine = [ws[3], ws[12]].filter(Boolean);
  secs.push({ type: 'practice', title: { en: 'Your turn', ko: '내 문장 쓰기' }, hint: 'Use each word in a true sentence about your own life. Say it aloud.', items: mine.map((w) => ({ q: `Write a sentence with ${w.head}. →`, a: '(Your own sentence · 내 문장)' })) });
  inline[id] = {
    id, title: { en: `Words ${no} · ${lvEn}`, ko: `낱말 ${no} · ${lvKo}` },
    sub: { en: `${PER} words that appear often in TOPIK II, with an example sentence for each.`, ko: `TOPIK II 에 자주 나오는 낱말 ${PER}개와 예문` },
    sections: secs,
  };
  unitsOf.push({ id, lv: ws[0].level });
}

/* 부 = 급. 단원 첫 낱말의 급으로 가른다 */
const partNames = { 3: { en: 'Level 3 words', ko: '3급 낱말' }, 4: { en: 'Level 4 words', ko: '4급 낱말' }, 5: { en: 'Level 5 words', ko: '5급 낱말' }, 6: { en: 'Level 6 words', ko: '6급 낱말' } };
const parts = [3, 4, 5, 6].map((l) => ({ title: partNames[l], units: unitsOf.filter((x) => x.lv === l).map((x) => x.id) })).filter((p) => p.units.length);

const book = {
  _note: '책 한 권의 틀: tools/build-topik2-vocab-book.mjs 가 만든다(손으로 고치지 않는다). node tools/build-book.mjs topik2-vocab-1000. 낱말 · 뜻 · 예문은 vocab/data/topik2.json. 지은이 · 신고번호 · ISBN · 정가 · 발행일은 비어 있는 자리.',
  id: 'topik2-vocab-1000', edition: 'Draft proof · 시안', theme: 'classic', color: '#6B3FA0', tint: '#F3EEFA',
  series: base.series,
  title: { en: 'TOPIK II Vocabulary Workbook · 1,000 Words', ko: 'TOPIK II 단어장 워크북 1,000' },
  sub: { en: '1,000 words that appear often in TOPIK II, 20 per unit, with example sentences and writing practice.', ko: 'TOPIK II 에 자주 나오는 낱말 1,000개 · 20개씩 50단원 · 예문과 쓰기 연습' },
  levelTag: 'VOCAB', level: 'TOPIK II', trim: base.trim,
  author: base.author, authorAbout: base.authorAbout, publisher: base.publisher, web: base.web,
  preface: {
    en: ['These are the 1,000 words that appear most often in the TOPIK II word list we use on everykoreans.com, arranged from level 3 to level 6. Each unit has 20 words, an example sentence for each, and short writing practice.',
      'Read the table aloud, then cover the English and test yourself. Write your answers on the lines, check the answer key at the back, and come back a few days later.',
      'You do not have to memorize 1,000 words in one go. One unit a day is a calm pace: 50 units, about seven weeks.'],
    ko: ['이 책은 everykoreans.com 의 TOPIK II 낱말 목록에서 가장 자주 나오는 낱말 1,000개를 3급부터 6급까지 차례로 모은 것입니다. 단원마다 낱말 20개와 낱말마다 예문 하나, 짧은 쓰기 연습이 있습니다.',
      '표를 소리 내 읽고, 영어를 가리고 스스로 확인하세요. 답은 줄 위에 쓰고, 뒤쪽 정답으로 확인한 뒤 며칠 뒤에 다시 풀어 보세요.',
      '1,000개를 한 번에 외울 필요는 없습니다. 하루 한 단원이면 50단원, 약 7주입니다.'],
  },
  howto: {
    en: ['Read each word and its example sentence aloud.', 'Cover the English column with a card and test yourself, then cover the Korean.', 'Write your answers on the lines. Use pencil: you will want to do the page again.', 'Check the Answer Key at the back, mark the words you missed, and try them again after 1, 3 and 7 days.', 'Look up any word in the Index. It tells you which unit it appears in.', 'Free lessons, games and more worksheets: everykoreans.com'],
    ko: ['낱말과 예문을 소리 내 읽으세요.', '카드로 영어 칸을 가리고 스스로 확인한 뒤, 이번엔 한국어 칸을 가려 보세요.', '답은 줄 위에 직접 쓰세요. 다시 풀고 싶어지니 연필을 쓰세요.', '뒤쪽 정답을 확인하고, 틀린 낱말에 표시한 뒤 1일, 3일, 7일 뒤에 다시 풀어 보세요.', '모르는 낱말은 찾아보기에서 찾으세요. 어느 단원에 있는지 알려 줍니다.', '무료 레슨 · 게임 · 학습지: everykoreans.com'],
  },
  parts, noGuide: true, inline, blocks: {}, unitCount: N_WORDS / PER,
  coverAccent: '단어장',
  coverLevel: { code: 'TOPIK II', name: '3~6급', bg: '#4B2A85', bg2: '#32195E', mascot: ['cheese', 5], title: ['TOPIK II', '단어장', '워크북 1,000'], sub: '자주 나오는 낱말 1,000개' },
  reviewer: base.reviewer, authorBio: base.authorBio,
};
fs.writeFileSync(path.join(ROOT, 'docs/books/topik2-vocab-1000.json'), JSON.stringify(book, null, 1) + '\n');
console.log(`TOPIK II 단어장: ${N_WORDS}개 · ${N_WORDS / PER}단원 · 부 ${parts.map((p) => p.units.length).join('/')} → docs/books/topik2-vocab-1000.json`);
