#!/usr/bin/env node
/* TOPIK I 필수 단어장 한 권(docs/books/topik1-vocab.json)을 만든다 — 운영자 2026-10-26 「토픽 필수 단어장은 하나에 다 넣자」.
   1 · 2권 생성기(tools/build-topik1-vocab-book.mjs)가 만든 단원(ta-01~48 · tb-01~49)을 그대로 이어 붙인다 — 낱말 순서 · 단원 번호가 같아서
   안티가 쓴 유의어 메모(docs/vocab-book/topik1-vocab-1 · -2.notes.json)가 그대로 맞는다. 낱말 번호는 1~1,931 로 이어진다.
   node tools/build-topik1-vocab-all.mjs  →  node tools/build-book.mjs topik1-vocab [--digital|--review]
   중간 파일(topik1-vocab-1 · -2 의 책 틀 · 보너스)은 만든 뒤 지운다(책은 한 권이라 ISBN 도 하나). */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (f) => path.join(ROOT, f);
const PRICE = '9.9';   // ⚠ 제안값(536쪽 한 권). 운영자가 정하면 고친다 — ISBN 신청서 · 상점 · 판권지와 같아야 한다
for (const v of [1, 2]) execFileSync('node', [P('tools/build-topik1-vocab-book.mjs'), String(v)], { stdio: 'ignore' });
const a = JSON.parse(fs.readFileSync(P('docs/books/topik1-vocab-1.json'), 'utf8'));
const b = JSON.parse(fs.readFileSync(P('docs/books/topik1-vocab-2.json'), 'utf8'));
const ba = JSON.parse(fs.readFileSync(P('docs/bonus/topik1-vocab-1.json'), 'utf8'));
const bb = JSON.parse(fs.readFileSync(P('docs/bonus/topik1-vocab-2.json'), 'utf8'));
const inline = { ...a.inline, ...b.inline };
const ids = [...Object.keys(a.inline), ...Object.keys(b.inline)];
const lvOf = (id) => Number(inline[id].sections[0].entries[0].lv);
const parts = [1, 2].map((l) => ({ title: { en: `Level ${l} words`, ko: `${l}급 낱말` }, units: ids.filter((id) => lvOf(id) === l) })).filter((p) => p.units.length);
const N = ids.reduce((s, id) => s + inline[id].sections[0].entries.length, 0), U = ids.length;
const book = {
  ...a,
  _note: '책 한 권의 틀: tools/build-topik1-vocab-all.mjs 가 만든다(손으로 고치지 않는다). node tools/build-book.mjs topik1-vocab. 낱말 · 뜻 · 예문은 vocab/data/topik1.json.',
  id: 'topik1-vocab',
  title: { en: 'TOPIK I Essential Vocabulary', ko: 'TOPIK I 필수 단어장' },
  sub: { en: `All ${N.toLocaleString('en-US')} TOPIK I words in ${U} units, with example sentences, checkups and writing practice.`, ko: `TOPIK I 필수 낱말 ${N.toLocaleString('en-US')}개` },
  preface: {
    en: [`This book holds every word of the TOPIK I word list on everykoreans.com: ${N.toLocaleString('en-US')} words, all of level 1 and level 2. Each unit has up to 20 words with part of speech, an English meaning and an example sentence. The cheese marks the level and the potato marks how often the word shows up in our TOPIK texts.`,
      'Read the table aloud, then cover the English and test yourself. Write your answers on the lines, check the answer key at the back, and come back a few days later.',
      `You do not have to memorize ${N.toLocaleString('en-US')} words in one go. One unit a day is a calm pace: ${U} units, about ${Math.round(U / 7)} weeks.`],
    ko: [`이 책은 everykoreans.com 의 TOPIK I 낱말 목록 전체, 1급 · 2급 낱말 ${N.toLocaleString('en-US')}개를 한 권에 담았습니다. 단원마다 낱말 20개 이하: 품사 · 영어 뜻 · 예문. 치즈는 급수, 감자는 우리 TOPIK 글에 나오는 정도입니다.`,
      '표를 소리 내 읽고, 영어를 가리고 스스로 확인하세요. 답은 줄 위에 쓰고, 뒤쪽 정답으로 확인한 뒤 며칠 뒤에 다시 풀어 보세요.',
      `${N.toLocaleString('en-US')}개를 한 번에 외울 필요는 없습니다. 하루 한 단원이면 ${U}단원, 약 ${Math.round(U / 7)}주입니다.`],
  },
  inline, bonusUnits: ids, parts, unitCount: U,
  back: { items: [[`${U} units · ${U}개 단원`, `All ${N.toLocaleString('en-US')} TOPIK I words · TOPIK I 낱말 ${N.toLocaleString('en-US')}개 전부`], a.back.items[1], a.back.items[2]], for: a.back.for, price: `정가 ${PRICE}달러` },
  /* 표지색 · 큰 글씨(운영자 2026-10-26 「표지 색 또 바꾸자 · 1,931낱말을 빼고 TOPIK 단어장 크게」): 표지만 청록, 속지는 TOPIK I 초록 그대로. 표지 부제목은 ISBN 신청서 부제목(「TOPIK I 필수 낱말 1,931개」)과 같아야 해서 작은 글씨로 남긴다 */
  coverLevel: { ...a.coverLevel, bg: '#0E6F8C', bg2: '#08495E', mascot: ['cheese', 2], title: ['TOPIK I', '필수 단어장', ''], sub: `TOPIK I 필수 낱말 ${N.toLocaleString('en-US')}개` },
  innerLevel: { bg: '#12704F', bg2: '#0B4A33' },
};
book.sub.ko = book.coverLevel.sub;   // 표지 부제목 = 책 부제목 = ISBN 신청서 부제목(tools/check-isbn.mjs)
book.isbn = '979-11-222407-0-2'; book.isbnPrice = '9.9달러';   // 2026-10-28 승인(바코드 EPS 받음 — 공식 PDF 는 아직)
fs.writeFileSync(P('docs/books/topik1-vocab.json'), JSON.stringify(book, null, 1) + '\n');
fs.writeFileSync(P('docs/bonus/topik1-vocab.json'), JSON.stringify({ _note: '책 QR 보너스 연습(게임) — tools/build-topik1-vocab-all.mjs 가 단어장 자료에서 만든다(손으로 고치지 않는다)', book: 'topik1-vocab', game: true, maxCards: 20, units: { ...ba.units, ...bb.units } }, null, 1) + '\n');
for (const f of ['docs/books/topik1-vocab-1.json', 'docs/books/topik1-vocab-2.json', 'docs/bonus/topik1-vocab-1.json', 'docs/bonus/topik1-vocab-2.json']) fs.rmSync(P(f), { force: true });
for (const d of ['bonus/topik1-vocab-1', 'bonus/topik1-vocab-2']) fs.rmSync(P(d), { recursive: true, force: true });
console.log(`TOPIK I 필수 단어장 한 권: ${N}개 · ${U}단원 · 부 ${parts.map((p) => p.units.length).join('/')} → docs/books/topik1-vocab.json`);
