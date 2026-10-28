#!/usr/bin/env node
/* 「필수 관용 표현」 책의 책 틀(docs/books/korean-idioms.json)과 QR 보너스(docs/bonus/korean-idioms.json)를 만든다 — 운영자 2026-10-26 「필수 관용 표현까지 하자」.
   표현 = vocab/data/expressions.json 449개(관용구 150 · 속담 150 · 사자성어 149). 뜻 · 직역 · 영어 대응 · 예문 두 개는 그 자료 그대로(새로 짓지 않는다).
   책은 세 부(관용구 → 속담 → 사자성어), 부마다 급 → 주제 순으로 15개씩 단원(ex-01 ~ ex-30). 연습: 단원 점검(뜻 짝짓기 5 + 대화 빈칸 3~4) · 뜻 쓰기 · (속담) 속담 이어 쓰기 · 내 문장 · QR 게임.
   점검 빈칸 문장은 책에 안 실린 대화(dialog)에서 가져와 예문과 겹치지 않게 한다.
   node tools/build-idioms-book.mjs  →  node tools/build-book.mjs korean-idioms [--digital|--review]
   지은이 · 소개 · 판형은 조사 워크북(docs/books/particles-workbook.json)과 같은 값. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const base = rd('docs/books/particles-workbook.json');
const all = rd('vocab/data/expressions.json');
const ID = 'korean-idioms', PER = 15, PRICE = '9.9';   // ⚠ 정가는 제안값(운영자가 정하면 고친다 — ISBN 신청서 · 상점 · 판권지와 같아야 한다)
const dash = (t) => String(t).replace(/\s*[—–]\s*/g, ', ');   // 줄표는 쓰지 않는다(쉼표로)
const kor = (t) => (String(t).match(/[가-힣]+/g) || []).join('');
const first = (en) => String(en).split(';')[0].trim();
const TYPES = [
  { t: 'idiom', pos: 'idiom', ko: '관용구', en: 'Idioms and Set Phrases', unit: 'Idioms and Set Phrases', ex: '발이 넓다', cols: 2, cloze: 'Fill in the blank with the right idiom. Put it in the right form (change the ending).', clozeKo: '대화의 빈칸에 알맞은 관용구를 상자에서 골라 알맞은 형태(어미)로 바꿔 쓰세요.' },
  { t: 'proverb', pos: 'proverb', ko: '속담', en: 'Proverbs', unit: 'Proverbs', ex: '가는 말이 고와야 오는 말이 곱다', cols: 1, cloze: 'Fill in the blank with the right proverb. Put it in the right form (change the ending if needed).', clozeKo: '대화의 빈칸에 알맞은 속담을 상자에서 골라 알맞은 형태(어미)로 바꿔 쓰세요.' },
  { t: 'idiom4', pos: 'four-character idiom', ko: '사자성어', en: 'Four-Character Idioms', unit: 'Four-Character Idioms', ex: '일석이조', cols: 2, cloze: 'Fill in the blank with the right four-character idiom.', clozeKo: '대화의 빈칸에 알맞은 사자성어를 상자에서 골라 쓰세요.' },
];
const sortKey = (a, b) => (a.lv - b.lv) || String(a.topics?.[0] || '~').localeCompare(String(b.topics?.[0] || '~')) || a.head.localeCompare(b.head, 'ko');
/* 대화 줄에서 표현(또는 어간)이 한 번 나오는 줄 하나. 어간 = 끝의 「다」를 뗀 것(발이 넓다 → 발이 넓) */
const stemOf = (h) => (h.endsWith('다') ? h.slice(0, -1) : h);
const blankLine = (x) => {
  for (const [, line] of x.dialog || []) {
    for (const k of [x.head, stemOf(x.head)]) {
      if (k.length < 2 || line.split(k).length !== 2) continue;
      const exact = k === x.head, i = line.indexOf(k);
      /* 활용한 모양(어간 + 어미)은 어절 끝까지를 통째로 빈칸으로 둔다 — 어미가 빈칸 뒤에 남아 정답과 겹치지 않게(안티 검수 2026-10-26) */
      let end = i + k.length;
      if (!exact) while (end < line.length && !/[\s.,!?]/.test(line[end])) end++;
      return { q: line.slice(0, i) + '___' + line.slice(end), line, k, exact, surface: line.slice(i, end) };
    }
  }
  return null;
};
const ansOf = (x, b) => (b.exact ? [b.k] : [...new Set([b.surface, x.head, b.k])]);   // 보너스 빈칸: 활용한 모양 · 기본형 · 어간 모두 정답

const book = { units: {}, order: [] };
const bonus = {};
const parts = [];
let n0 = 0, unitNo = 0;
for (const T of TYPES) {
  const items = all.filter((x) => x.type === T.t).sort(sortKey);
  const unitIds = [];
  for (let i = 0; i < items.length; i += PER) {
    const ws = items.slice(i, i + PER);
    const id = `ex-${String(++unitNo).padStart(2, '0')}`; unitIds.push(id);
    const lvs = [...new Set(ws.map((w) => Math.min(w.lv, 6)))].sort();   // 자료의 급은 3~7(7 하나) — TOPIK 은 6급까지라 6으로 묶는다
    const exo = (e) => ({ ko: e[0], en: dash(e[1]) });
    const secs = [{ type: 'vocab', title: { en: 'Expressions', ko: '표현' }, from: n0, rowH: 38,
      entries: ws.map((w) => ({ ko: w.head, hanja: w.hanja || '', pos: T.pos, en: dash(w.en), km: w.meaning, lit: dash(w.literal), eq: w.en_equiv && w.en_equiv.toLowerCase() !== w.en.toLowerCase() ? w.en_equiv : '', lv: Math.min(w.lv, 6), ex: exo(w.examples[0]), ex2: exo(w.examples[1]) })) }];
    n0 += ws.length;
    /* 단원 점검: 뜻 짝짓기 5 + 대화 빈칸 3~4 */
    const mean = (w) => first(w.en);
    const firsts = ws.map(mean);
    const cl = ws.map((w) => ({ w, b: blankLine(w) })).filter((x) => x.b).slice(0, 4);
    const clW = cl.map((x) => x.w);
    const rest = ws.filter((w) => !clW.includes(w) && mean(w).length <= 36 && firsts.filter((f) => f === mean(w)).length === 1);
    const matchW = rest.slice(0, 5);
    const decoy = rest.find((w) => !matchW.includes(w)) || ws.find((w) => !matchW.includes(w) && !clW.includes(w) && mean(w).length <= 36);
    const rot = (arr, k) => arr.map((_, j) => arr[(j + k) % arr.length]);
    if (matchW.length === 5 && cl.length >= 3 && decoy) {
      const mOpts = rot([...matchW, decoy], (unitNo * 2 + 1) % 6);
      const cBank = rot(clW, (unitNo + 1) % clW.length);
      secs.push({ type: 'checkup', title: { en: 'Unit Checkup', ko: '단원 점검' },
        match: { inst: { en: 'Match each expression with its meaning. Write the letter on the line.', ko: '표현과 뜻을 짝지어 알맞은 글자를 쓰세요.' }, words: matchW.map((w) => w.head), options: mOpts.map(mean), answer: matchW.map((w) => 'abcdef'[mOpts.indexOf(w)]) },
        cloze: { inst: { en: T.cloze, ko: T.clozeKo }, cols: T.cols, items: cl.map((x) => ({ q: x.b.q, en: '', a: x.b.exact ? x.w.head : `${x.w.head} (${x.b.surface})` })), bank: cBank.map((w) => w.head) } });
    } else console.log(`⚠ ${id}: 점검 문항 부족(짝 ${matchW.length} · 빈칸 ${cl.length})`);
    secs.push({ type: 'practice', title: { en: 'Write the meaning', ko: '뜻 쓰기' }, hint: 'Cover the list first, then write the English meaning.', items: ws.filter((_, j) => j % 4 === 0).map((w) => ({ q: `${w.head} →`, a: dash(w.en) })) });
    if (T.t === 'proverb') {
      const half = (h) => { const p = h.split(' '); const k = Math.ceil(p.length / 2); return [p.slice(0, k).join(' '), p.slice(k).join(' ')]; };
      secs.push({ type: 'practice', title: { en: 'Finish the proverb', ko: '속담 이어 쓰기' }, hint: 'Look at the first half and write the rest. Then check the list.', items: ws.filter((w, j) => j % 4 === 2 && w.head.split(' ').length >= 3).map((w) => { const [a, b] = half(w.head); return { q: `${a} ___ →`, a: b }; }) });
    }
    const OK = ws.filter((w) => w.tone !== 'casual');
    secs.push({ type: 'practice', title: { en: 'Your turn', ko: '내 문장 쓰기' }, hint: 'Use each expression in a true sentence about your own life. Say it aloud.', items: [OK[3], OK[11]].filter(Boolean).map((w) => ({ q: `Write a sentence with ${w.head}. →`, a: '(Your own sentence · 내 문장)' })) });
    book.units[id] = { id, title: { en: `${T.unit} ${unitIds.length}${lvs.length ? ` · Level ${lvs.join(' / ')}` : ''}`, ko: `${T.ko} ${unitIds.length}` }, sub: { en: `Up to ${PER} expressions, each with two example sentences.`, ko: `${T.ko} ${PER}개 이하와 예문 둘` }, sections: secs };
    book.order.push(id);

    /* QR 보너스(게임): 카드 · 퀴즈 6 · 빈칸(대화에서) */
    const pool = all.filter((x) => x.type === T.t && !ws.includes(x));
    const dpick = (w, k) => { const out = []; for (let t = 0; out.length < 3 && t < 400; t++) { const x = pool[(k * 7 + t * 13 + w.head.length) % pool.length]; if (!out.some((y) => first(y.en) === first(x.en) || y.head === x.head) && first(x.en) !== first(w.en)) out.push(x); } return out; };
    const quiz = [0, 2, 4, 6, 8, 10].map((k, nq) => {
      const w = ws[k % ws.length], ds = dpick(w, k + nq), rev = nq % 2 === 1;
      const opts = rev ? [w.head, ...ds.map((x) => x.head)] : [first(w.en), ...ds.map((x) => first(x.en))];
      const at = (nq + 1) % 4; const arr = opts.slice(1); arr.splice(at, 0, opts[0]);
      return { q: rev ? `Which ${T.pos} means "${first(w.en)}"?` : `What does ${w.head} mean?`, opts: arr, a: at, why: dash(`${w.head} means ${w.en}. ${w.examples[0][0]} (${w.examples[0][1]})`) };
    });
    const corpus = kor(JSON.stringify(book.units[id]));
    const fresh = (b) => kor(b.q.replace('___', '')).length < 5 || !corpus.includes(kor(b.q.replace('___', '')));
    const fill = [];
    for (const w of ws) { if (fill.length >= 6) break; const b = blankLine(w); if (b && fresh(b) && !clW.includes(w)) fill.push({ q: b.q, en: first(w.en), a: ansOf(w, b) }); }
    for (const w of ws) { if (fill.length >= 4) break; const b = blankLine(w); if (b && fresh(b) && !fill.some((f) => f.a.includes(b.k))) fill.push({ q: b.q, en: first(w.en), a: ansOf(w, b) }); }
    /* 대화에서 가져올 빈칸이 모자라면 영어 뜻 → 한국어 쓰기로 채운다(띄어쓰기는 채점에서 무시된다) */
    for (const w of ws) { if (fill.length >= 4) break; if (!fill.some((f) => f.a.includes(w.head) || f.a.includes(stemOf(w.head)))) fill.push({ q: `"${dash(first(w.en))}" in Korean (${T.pos}): ___`, en: dash(w.en), a: [w.head] }); }
    bonus[id] = { cards: ws.map((w) => ({ ko: w.head, en: dash(`${first(w.en)} (${T.pos})`) })), quiz, fill };
  }
  parts.push({ title: { en: `${T.en} (${items.length})`, ko: `${T.ko} (${items.length}개)` }, units: unitIds });
}
const N = all.length, U = unitNo;
const KP = base.preface;
const out = {
  _note: '책 한 권의 틀: tools/build-idioms-book.mjs 가 만든다(손으로 고치지 않는다). node tools/build-book.mjs korean-idioms. 표현 · 뜻 · 예문은 vocab/data/expressions.json.',
  id: ID, edition: 'Draft proof · 시안', theme: 'classic', color: '#8E2F5A', tint: '#F6EAF0',
  series: { en: 'KOREAN WORKBOOK SERIES', ko: '한국어 워크북 시리즈' },
  title: { en: 'Essential Korean Idioms', ko: '필수 관용 표현' },
  sub: { en: `${N} idioms, proverbs and four-character idioms with examples, checkups and writing practice.`, ko: `관용구 · 속담 · 사자성어 ${N}개` },
  levelTag: 'IDIOMS', level: 'TOPIK II', trim: base.trim, cheeseBase: 2, cheeseMax: 4,
  author: base.author, authorAbout: base.authorAbout, publisher: base.publisher, web: base.web,
  preface: {
    en: [`This book collects ${N} expressions that Korean speakers use all the time and that are useful for TOPIK II reading and writing: 150 idioms, 150 proverbs and 149 four-character idioms. Each one has its meaning in English and Korean, a literal translation, a similar English saying when there is one, and two example sentences. The cheese marks the level.`,
      'Idioms often do not mean what their words say, so learn each one together with its example. Part 1 also includes very common set phrases (연어), such as 시간을 내다, that you need to use together as a unit. Read the example aloud, then cover the meaning and test yourself. Write your answers on the lines, check the answer key at the back, and come back a few days later.',
      `You do not have to memorize ${N} expressions in one go. One unit a day is a calm pace: ${U} units, about ${Math.round(U / 7)} weeks.`],
    ko: [`이 책은 한국어 화자가 일상에서 자주 쓰고 TOPIK II 읽기 · 쓰기에 도움이 되는 표현 ${N}개를 담았습니다: 관용구 150 · 속담 150 · 사자성어 149. 표현마다 영어 · 한국어 뜻, 직역, 비슷한 영어 속담(있을 때), 예문 둘이 있습니다. 치즈는 급수입니다.`,
      '관용 표현은 낱말 뜻을 더해도 뜻이 나오지 않는 것이 많으니 예문과 함께 익히세요. 1부에는 「시간을 내다」처럼 늘 붙어 다니는 연어도 함께 넣었습니다. 예문을 소리 내 읽고, 뜻을 가리고 스스로 확인하세요. 답은 줄 위에 쓰고, 뒤쪽 정답으로 확인한 뒤 며칠 뒤에 다시 풀어 보세요.',
      `${N}개를 한 번에 외울 필요는 없습니다. 하루 한 단원이면 ${U}단원, 약 ${Math.round(U / 7)}주입니다.`],
  },
  howto: {
    en: ['Read each expression and its two examples aloud.', 'Cover the meaning with a card and test yourself.', 'Do the Unit Checkup in pencil: match the meanings, then fill the dialog blanks.', 'Check the Answer Key at the back, mark what you missed, and try again after 1, 3 and 7 days.', 'Scan the QR code at the start of a unit for a free word game with the same expressions.', 'Free practice and more books: everykoreans.com'],
    ko: ['표현과 예문 둘을 소리 내 읽으세요.', '카드로 뜻을 가리고 스스로 확인하세요.', '단원 점검은 연필로: 뜻을 짝짓고 대화의 빈칸을 채우세요.', '뒤쪽 정답을 확인하고, 틀린 표현에 표시한 뒤 1일, 3일, 7일 뒤에 다시 해 보세요.', '단원 처음의 QR 을 찍으면 같은 표현의 무료 게임이 열립니다.', '무료 연습 · 더 많은 책: everykoreans.com'],
  },
  bonusUnits: book.order,
  back: { items: [[`${U} units · ${U}개 단원`, `${N} expressions · 표현 ${N}개`], ['Meaning, literal translation, two examples · 뜻 · 직역 · 예문 둘', 'Cover, write, check · 가리고 쓰고 확인하기'], ['Idioms · 관용구 150 / Proverbs · 속담 150 / Four-character idioms · 사자성어 149', 'Cheese = level · 치즈 = 급수']], for: 'For TOPIK II learners and anyone who wants to sound natural · TOPIK II 준비와 자연스러운 한국어에', price: `정가 ${PRICE}달러` },
  parts, noGuide: true, inline: book.units, blocks: {}, unitCount: U,
  coverAccent: '관용 표현',
  coverLevel: { code: 'IDIOMS', name: '3~6급', bg: '#8E2F5A', bg2: '#5E1B3B', mascot: ['cheese', 4], title: ['Korean Idioms', '필수 관용 표현', '속담 · 사자성어'], sub: `관용구 · 속담 · 사자성어 ${N}개` },
  reviewer: base.reviewer, authorBio: base.authorBio,
};
out.published = '2026.11.10';   // ISBN 신청서 발행일 = 판권지 발행(tools/check-isbn.mjs)
out.sub.ko = out.coverLevel.sub;   // 표지 부제목 = 책 부제목 = ISBN 신청서 부제목
out.isbn = '979-11-222407-9-5'; out.isbnPrice = '9.9달러';   // 2026-10-28 승인(바코드 EPS 받음 — 공식 PDF 는 아직)
fs.writeFileSync(path.join(ROOT, `docs/books/${ID}.json`), JSON.stringify(out, null, 1) + '\n');
fs.writeFileSync(path.join(ROOT, `docs/bonus/${ID}.json`), JSON.stringify({ _note: '책 QR 보너스 연습(게임) — tools/build-idioms-book.mjs 가 표현 자료에서 만든다(손으로 고치지 않는다)', book: ID, game: true, maxCards: 15, units: bonus }, null, 1) + '\n');
console.log(`필수 관용 표현: ${N}개 · ${U}단원 · 부 ${parts.map((p) => p.units.length).join('/')} → docs/books/${ID}.json`);
