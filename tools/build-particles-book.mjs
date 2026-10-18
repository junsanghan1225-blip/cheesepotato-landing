#!/usr/bin/env node
/* 한국어 조사 워크북의 책 틀(docs/books/particles-workbook.json)을 만든다 — 운영자 2026-10-18 「Particles 책도 만들자」.
   조사 20개 단원은 사이트 자료 그대로: sentences.js(이름 · 뜻) · grammar-en.js(영어 뜻 · 모양 · 주의) · docs/grammar-sentences.json(문장 30개씩).
   「헷갈리는 조사 가르기」 단원과 종합 연습은 손으로 쓴 docs/particles/contrast.json.
   node tools/build-particles-book.mjs  →  node tools/build-book.mjs particles-workbook [--digital|--review] */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const { SB_CATS } = await imp('sentences.js');
const { GRAMMAR_EN } = await imp('grammar-en.js');
const PTS = Object.fromEntries(SB_CATS.flatMap((c) => c.points).map((p) => [p.id, p]));
const SENT = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/grammar-sentences.json'), 'utf8'));
const CT = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/particles/contrast.json'), 'utf8'));

/* 단원 = 조사 문법 id → 문장에서 빈칸으로 만들 꼴(긴 것 먼저) */
const FORMS = {
  '26-1': ['이', '가'], '26-2': ['은', '는'], '26-3': ['을', '를'], '26-5': ['의'],
  '26-6': ['에'], '26-7': ['에'], '26-8': ['에서'], '26-9': ['에서', '부터'], '26-10': ['에게', '한테'],
  '26-4': ['이랑', '랑', '하고', '와', '과'], '26-11': ['도'], '26-12': ['만'], '26-13': ['밖에'],
  '26-15': ['이나', '나'], '26-16': ['이나', '나'],
  '26-14': ['으로', '로'], '26-17': ['쯤'], '26-18': ['처럼', '같이'], '26-19': ['보다'], '26-20': ['마다'],
};
const PART_UNITS = [
  { en: 'Core markers', ko: '기본 조사', ids: ['26-1', '26-2', '26-3', '26-5'] },
  { en: 'Place, time & direction', ko: '장소 · 시간 · 방향', ids: ['26-6', '26-7', '26-8', '26-9', '26-10'] },
  { en: 'Together, also & only', ko: '함께 · 도 · 만', ids: ['26-4', '26-11', '26-12', '26-13', '26-15', '26-16'] },
  { en: 'Ways, amounts & comparing', ko: '수단 · 어림 · 견주기', ids: ['26-14', '26-17', '26-18', '26-19', '26-20'] },
];
/* 「공부하고」처럼 하다 동사의 -하고 는 조사 「하고」가 아니다 */
const HADA = /(공부|운동|요리|생각|전화|사랑|노래|청소|쇼핑|샤워|식사|시작|준비|여행|연습|숙제|산책|주문|운전|사용|이야기|예약|일|말|정리|설명|질문|대답|출발|도착|확인|걱정)하고/;
const HINT = { '26-4': '와/과 · 하고 · (이)랑', '26-9': '에서 / 부터', '26-15': '(이)나', '26-16': '(이)나', '26-14': '(으)로', '26-1': '이/가', '26-2': '은/는', '26-3': '을/를', '26-10': '에게 / 한테' };
const hint = (forms, id) => HINT[id] || forms.join(' / ');

function blank(id, ko) {
  const forms = FORMS[id];
  const re = new RegExp(`(?<=[가-힣])(${forms.join('|')})(?=[\\s.,!?]|$)`, 'g');
  const ms = [...ko.matchAll(re)];
  if (ms.length !== 1) return null;
  if (id === '26-4' && HADA.test(ko)) return null;
  const m = ms[0];
  let a = m[0];
  if (id === '26-4') {   // 셋은 뜻이 같다 — 받침에 맞는 꼴을 모두 정답으로
    const prev = ko[m.index - 1], jong = (prev.charCodeAt(0) - 0xac00) % 28;
    a = jong ? '과 / 이랑 / 하고' : '와 / 랑 / 하고';
  }
  return { q: ko.slice(0, m.index) + '___' + ko.slice(m.index + m[0].length), a };
}
const stripQ = (s) => String(s || '').replace(/[「」]/g, '');

function unit(id) {
  const p = PTS[id], en = GRAMMAR_EN[id] || {}, S = SENT[id];
  const used = new Set();
  const take = (lv, from, n, ok = () => true) => { const out = []; for (let i = 0; i < S.length && out.length < n; i++) { const s = S[i]; if (s.lv === lv && !used.has(i) && i >= from && ok(s)) { used.add(i); out.push(s); } } return out; };
  const ex = [...take(1, 0, 3), ...take(2, 0, 2), ...take(3, 0, 1)];
  const fill = [...take(1, 0, 3, (s) => blank(id, s.ko)), ...take(2, 0, 3, (s) => blank(id, s.ko)), ...take(3, 0, 2, (s) => blank(id, s.ko))];
  const tr = take(1, 0, 3);
  const showForm = FORMS[id].join(' · ');
  const sections = [
    { type: 'text', title: { en: 'Meaning', ko: '뜻' }, text: `${stripQ(en.desc)}\n${p.desc}` },
    { type: 'text', title: { en: 'Form', ko: '모양' }, text: `${stripQ(en.form)}` },
    { type: 'table', title: { en: 'Examples', ko: '예문' }, cols: ['Particle · 조사', 'Example · 예', 'English'], rows: ex.map((s) => [(new RegExp(`(?<=[가-힣])(${FORMS[id].join('|')})(?=[\\s.,!?]|$)`).exec(s.ko) || [showForm])[0], s.ko, s.en]) },
    { type: 'text', title: { en: 'Watch out', ko: '조심할 것' }, text: stripQ(en.care) },
    { type: 'practice', title: { en: `Fill in the particle · ${hint(FORMS[id], id)}`, ko: '조사 채우기' }, items: fill.map((s) => { const b = blank(id, s.ko); return { q: `${b.q}  (${s.en})`, a: b.a }; }) },
    { type: 'practice', title: { en: 'Say it in Korean', ko: '한국어로 말하기' }, hint: 'Model answers are in the Answer Key.', items: tr.map((s) => ({ q: s.en, a: s.ko })) },
  ];
  return { id: `pt-${id}`, title: { en: p.name.replace(/^N/, '').trim() ? `${p.name}` : p.name, ko: p.name }, sub: { en: stripQ(en.desc).split(/(?<=\.)\s/)[0], ko: p.desc.split(/(?<=[.다요])\s/)[0] }, sections };
}
const contrast = (c) => ({ id: c.id, title: c.title, sub: c.sub, sections: [
  { type: 'text', title: { en: 'The difference', ko: '차이' }, text: `${c.intro.en}\n${c.intro.ko}` },
  { type: 'table', title: { en: 'Side by side', ko: '나란히 보기' }, cols: c.table.cols, rows: c.table.rows },
  { type: 'text', title: { en: 'Watch out', ko: '조심할 것' }, text: `${c.warn.en}\n${c.warn.ko}` },
  { type: 'practice', title: { en: 'Choose the particle', ko: '조사 고르기' }, items: c.items.map(([q, a]) => ({ q, a })) },
] });
const review = (r) => ({ id: r.id, title: r.title, sub: { en: 'Mixed practice — every particle in the book.', ko: '섞어서 풀기' }, sections: [{ type: 'practice', title: { en: 'Fill in the particle', ko: '조사 채우기' }, items: r.items.map(([q, a]) => ({ q, a })) }] });

const inline = {}, blocks = {};
const parts = PART_UNITS.map((pt) => ({ title: { en: pt.en, ko: pt.ko }, units: pt.ids.map((id) => { const u = unit(id); inline[u.id] = u; blocks[`${u.id}:1`] = 'ref'; blocks[`${u.id}:2`] = 'tip'; blocks[`${u.id}:3`] = 'ref'; blocks[`${u.id}:4`] = 'warn'; return u.id; }) }));
parts.push({ title: { en: 'Choose the right particle', ko: '헷갈리는 조사 가르기' }, units: CT.units.map((c) => { const u = contrast(c); inline[u.id] = u; blocks[`${u.id}:1`] = 'ref'; blocks[`${u.id}:2`] = 'ref'; blocks[`${u.id}:3`] = 'warn'; return u.id; }) });
parts.push({ title: { en: 'Review tests', ko: '종합 연습' }, units: CT.reviews.map((r) => { const u = review(r); inline[u.id] = u; return u.id; }) });

const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/books/elementary-grammar-workbook.json'), 'utf8'));
const book = {
  _note: '책 한 권의 틀 — tools/build-particles-book.mjs 가 만든다(손으로 고치지 않는다). node tools/build-book.mjs particles-workbook. 지은이 · 펴낸이 · 신고번호 · ISBN · 정가 · 발행일은 비어 있는 자리.',
  id: 'particles-workbook', edition: 'Draft proof · 시안', theme: 'classic', color: '#2F8F6B', tint: '#EEF8F3',
  series: base.series, title: { en: 'Korean Particles Workbook', ko: '한국어 조사 워크북' },
  sub: { en: '20 particles, how to choose between them, and 600 sentences to learn from.', ko: '조사 20개 · 헷갈리는 조사 가르기 · 문장으로 익히기' },
  level: 'A1–A2', trim: base.trim, author: base.author, authorAbout: base.authorAbout, publisher: base.publisher, web: base.web,
  preface: { en: ['Particles are the small words that glue Korean together: they tell you who does what, where, when and with whom. Get them right and your sentences sound natural; get them wrong and even simple ideas are hard to follow.', 'Each unit takes one particle: its meaning, its form, six examples, the trap to avoid, and practice. The “Choose the right particle” part then puts the look-alikes side by side — 은/는 vs 이/가, 에 vs 에서, and more — and the review tests mix everything.'], ko: ['조사는 한국어를 이어 붙이는 작은 말입니다. 누가 무엇을 어디서 언제 누구와 하는지를 알려 줍니다. 조사를 맞게 쓰면 문장이 자연스럽고, 틀리면 쉬운 말도 알아듣기 어렵습니다.', '단원마다 조사 하나씩 — 뜻 · 모양 · 예문 여섯 개 · 조심할 것 · 연습입니다. 「헷갈리는 조사 가르기」에서 비슷한 조사를 나란히 놓고 고르는 연습을 하고, 종합 연습에서 모두 섞어 풀어 봅니다.'] },
  howto: base.howto, parts, blocks, inline,
};
fs.writeFileSync(path.join(ROOT, 'docs/books/particles-workbook.json'), JSON.stringify(book, null, 1) + '\n');
const nq = Object.values(inline).reduce((n, u) => n + u.sections.filter((s) => s.type === 'practice').reduce((m, s) => m + s.items.length, 0), 0);
console.log(`조사 책 틀 → docs/books/particles-workbook.json (단원 ${Object.keys(inline).length}개 · 연습 문항 ${nq}개)`);
