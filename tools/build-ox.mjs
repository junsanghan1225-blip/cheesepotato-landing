#!/usr/bin/env node
// 햄스터 OX 퀴즈(/ox/) 문항 — 운영자 2026-11-09 「OX 퀴즈 · 문제 형식은 매우 다양하게, 단어 뜻만 묻는 건 싫어」.
//   node tools/build-ox.mjs   → ox-questions.js (생성물, 손으로 고치지 않는다)
// 사실을 새로 쓰지 않는다 — 우리 자료에서 정답이 정해지는 것만, 또는 아래 RULES(표준 규칙 몇 줄)로 만든다.
//   meaning  낱말 뜻(vocab-topik1.js 짧은 뜻)          X: 다른 주제 · 뜻 단어가 안 겹치는 낱말의 뜻
//   pos      품사(vocab-topik1.js p)                   X: 다른 품사(뜻이 둘 이상인 낱말은 뺀다)
//   grammar  문법 고르기(grammar-pairs.js quiz)        X: 짝의 다른 문법
//   expr     속담 · 관용 표현 · 사자성어 뜻(expressions.js m)   X: 다른 갈래 표현의 뜻(두 글자 이상 낱말이 안 겹치는 것)
//   hanja    사자성어 한 글자 뜻(expressions.js he)     X: 같은 사자성어의 다른 글자 뜻
//   number   숫자 읽기(시각 · 개수 · 나이 · 달) — 고유어/한자어 규칙
//   honor    높임말 짝(먹다 → 드시다 …)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { VOCAB } = await import(path.join(ROOT, 'vocab-topik1.js'));
const { GRAMMAR_PAIRS } = await import(path.join(ROOT, 'grammar-pairs.js'));
const { EXPR } = await import(path.join(ROOT, 'expressions.js'));

let seed = 20261109;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pickOne = (a) => a[Math.floor(rnd() * a.length)];
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const coin = () => rnd() < 0.5;
const Q = { meaning: [], pos: [], grammar: [], expr: [], hanja: [], number: [], honor: [] };
/* 받침이 있으면 「은」, 없으면 「는」 — 영어 뒤에는 조사를 붙이지 않게 문장을 「=」 · 「→」 꼴로 쓴다 */
const eun = (w) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return c >= 0 && c < 11172 && c % 28 ? `${w}은` : `${w}는`; };

/* 1. 낱말 뜻 */
{
  const toks = (s) => new Set(s.toLowerCase().replace(/\(.*?\)/g, ' ').split(/[^a-z]+/).filter((w) => w.length > 2 && !['the', 'and', 'for', 'some'].includes(w)));
  const pool = VOCAB.filter((v) => v.l === 1 && ['명사', '동사', '형용사', '부사'].includes(v.p) && v.s && v.s.length <= 22 && /^[가-힣]+$/.test(v.h) && !/[;,]/.test(v.s) && !/^[A-Z]/.test(v.s) && (v.t || []).length);
  const top = (v) => String(v.t[0]).split('/')[0], used = new Set();
  for (const w of shuffle(pool).slice(0, 160)) {
    if (coin()) { Q.meaning.push({ k: 'meaning', q: `「${w.h}」 = “${w.s}”`, a: 1, e: `맞아요. 「${w.h}」 = ${w.s}` }); continue; }
    const wt = toks(w.s), cand = pool.filter((o) => o !== w && o.p === w.p && top(o) !== top(w) && !used.has(o.s) && ![...toks(o.s)].some((t) => wt.has(t)));
    if (!cand.length) continue;
    const o = pickOne(cand); used.add(o.s);
    Q.meaning.push({ k: 'meaning', q: `「${w.h}」 = “${o.s}”`, a: 0, e: `「${w.h}」 = ${w.s} · “${o.s}”는 「${o.h}」` });
  }
}
/* 2. 품사 — 같은 낱말이 여러 품사로 실린 것은 뺀다 */
{
  const POS = ['명사', '동사', '형용사', '부사'], cnt = new Map();
  VOCAB.forEach((v) => cnt.set(v.h, (cnt.get(v.h) || 0) + 1));
  const pool = VOCAB.filter((v) => v.l === 1 && POS.includes(v.p) && cnt.get(v.h) === 1 && /^[가-힣]+$/.test(v.h) && v.h.length >= 2);
  for (const w of shuffle(pool).slice(0, 70)) {
    const ok = coin(), said = ok ? w.p : pickOne(POS.filter((p) => p !== w.p));
    Q.pos.push({ k: 'pos', q: `「${w.h}」(${w.s})\n${said}예요.`, a: ok ? 1 : 0, e: `「${w.h}」(${w.s}) — ${w.p}` });
  }
}
/* 3. 문법 고르기 — 짝(A vs B) 퀴즈의 빈칸에 들어갈 문법 */
{
  for (const p of GRAMMAR_PAIRS) {
    const [A, B] = String(p.title.ko).split(/\s+vs\s+/);
    if (!A || !B) continue;
    for (const z of p.quiz || []) {
      const right = z.ans === 'a' ? A : B, wrong = z.ans === 'a' ? B : A, ok = coin();
      Q.grammar.push({ k: 'grammar', q: `${z.q}\n빈칸 → 「${ok ? right : wrong}」`, a: ok ? 1 : 0, e: `「${z.ok}」 · ${z.why}` });
    }
  }
}
/* 4. 속담 · 관용 표현 · 사자성어 뜻 */
{
  const ko2 = (s) => new Set((s.match(/[가-힣]{2,}/g) || []).filter((w) => !['하는', '하여', '있는', '없는', '것을', '것이', '때문', '어떤', '자기', '사람', '아주', '매우', '서로'].includes(w)));
  const used = new Set();
  for (const x of shuffle(EXPR.filter((e) => e.m && e.h.length <= 18)).slice(0, 120)) {
    if (coin()) { Q.expr.push({ k: 'expr', q: `「${x.h}」\n뜻: “${x.m}”`, a: 1, e: `맞아요. ${x.en ? `영어로는 ${x.en}` : ''}`.trim() }); continue; }
    const xt = ko2(x.m), cand = EXPR.filter((o) => o !== x && o.ty !== x.ty && o.m && !used.has(o.id) && ![...ko2(o.m)].some((t) => xt.has(t)));
    if (!cand.length) continue;
    const o = pickOne(cand); used.add(o.id);
    Q.expr.push({ k: 'expr', q: `「${x.h}」\n뜻: “${o.m}”`, a: 0, e: `맞는 뜻: “${x.m}”` });
  }
}
/* 5. 사자성어 한 글자 뜻(한 일 · 돌 석 …) — 같은 사자성어 안에서 */
{
  for (const x of shuffle(EXPR.filter((e) => e.ty === 'idiom4' && Array.isArray(e.he) && e.he.length === 4 && e.h.length === 4)).slice(0, 60)) {
    const i = Math.floor(rnd() * 4), ch = x.h[i], mean = (k) => String(x.he[k]).replace(new RegExp(`\\s*${x.h[k]}$`), '').trim();
    if (new Set(x.h).size < 4) continue;   // 같은 글자가 두 번 나오면 헷갈리니 뺀다
    const ok = coin(), j = ok ? i : pickOne([0, 1, 2, 3].filter((k) => k !== i && mean(k) !== mean(i)));
    if (j == null) continue;
    Q.hanja.push({ k: 'hanja', q: `「${x.h}」(${x.hj})\n「${ch}」 = “${mean(j)}”`, a: ok ? 1 : 0, e: `「${ch}」 = ${x.he[i]} · ${x.he.join(' · ')}` });
  }
}
/* 6. 숫자 읽기 — 시각의 「시」와 개수 · 나이는 고유어, 「분」 · 달은 한자어(표준 규칙) */
{
  const NAT = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두'];
  const SINO = (n) => { const d = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']; const t = Math.floor(n / 10), o = n % 10; return `${t ? (t > 1 ? d[t] : '') + '십' : ''}${d[o]}` || '영'; };
  const MONTH = ['일월', '이월', '삼월', '사월', '오월', '유월', '칠월', '팔월', '구월', '시월', '십일월', '십이월'];
  const WRONGM = { 6: '육월', 10: '십월' };
  for (let k = 0; k < 14; k++) {   // 시각
    const h = 1 + Math.floor(rnd() * 12), m = [5, 10, 15, 20, 25, 30, 40, 45, 50][Math.floor(rnd() * 9)], ok = coin();
    const right = `${NAT[h]} 시 ${SINO(m)} 분`, wrong = coin() ? `${SINO(h)} 시 ${SINO(m)} 분` : `${NAT[h]} 시 ${m <= 12 ? NAT[m].replace(/^한$/, '하나') : SINO(m)} 분`;
    if (!ok && wrong === right) continue;
    Q.number.push({ k: 'number', q: `${h}:${String(m).padStart(2, '0')} → 「${ok ? right : wrong}」`, a: ok ? 1 : 0, e: `「${right}」 — 시는 고유어(한 · 두 · 세), 분은 한자어(일 · 이 · 삼)` });
  }
  const things = [['사과', '개'], ['학생', '명'], ['책', '권'], ['커피', '잔'], ['고양이', '마리'], ['종이', '장']];
  for (let k = 0; k < 12; k++) {   // 개수
    const [n, c] = pickOne(things), x = 1 + Math.floor(rnd() * 9), ok = coin();
    const right = `${n} ${NAT[x]} ${c}`, wrong = `${n} ${SINO(x)} ${c}`;
    Q.number.push({ k: 'number', q: `${n} ${x}${c} → 「${ok ? right : wrong}」`, a: ok ? 1 : 0, e: `「${right}」 — 개수를 셀 때는 고유어(한 · 두 · 세 …)` });
  }
  for (const [age, right, wrong] of [[20, '스무 살', '스물 살'], [20, '스무 살', '이십 살'], [21, '스물한 살', '이십일 살'], [11, '열한 살', '십일 살'], [12, '열두 살', '열둘 살'], [13, '열세 살', '십삼 살']]) {
    const ok = coin();
    Q.number.push({ k: 'number', q: `${age}살 → 「${ok ? right : wrong}」`, a: ok ? 1 : 0, e: `「${right}」 — 나이 「살」 앞은 고유어` });
  }
  for (const mo of [6, 10, 6, 10, 3, 12]) {
    const ok = coin(), right = MONTH[mo - 1], wrong = WRONGM[mo] || `${SINO(mo)}달`;
    Q.number.push({ k: 'number', q: `${mo}월 → 「${ok ? right : wrong}」`, a: ok ? 1 : 0, e: `「${right}」${mo === 6 || mo === 10 ? ' — 6월 · 10월은 소리가 바뀌어 「유월 · 시월」' : ''}` });
  }
}
/* 7. 높임말 짝(표준) */
{
  const H = [['먹다', '드시다'], ['자다', '주무시다'], ['있다(사람이)', '계시다'], ['말하다', '말씀하시다'], ['아프다', '편찮으시다'], ['집', '댁'], ['나이', '연세'], ['이름', '성함'], ['밥', '진지'], ['생일', '생신'], ['주다(윗사람에게)', '드리다'], ['묻다(윗사람에게)', '여쭙다']];
  for (const [a, b] of H) {
    for (const ok of [true, false]) {
      const said = ok ? b : pickOne(H.filter((x) => x[1] !== b))[1];
      Q.honor.push({ k: 'honor', q: `「${a}」의 높임말 → 「${said}」`, a: ok ? 1 : 0, e: `「${a}」 → 「${b}」` });
    }
  }
}

const all = Object.values(Q).flat();
const head = `/* 생성물 — 손으로 고치지 않는다. 원본 vocab-topik1.js · grammar-pairs.js · expressions.js + 숫자 · 높임말 규칙 → node tools/build-ox.mjs
   k 갈래 · q 문제(「」 안이 강조) · a 정답(1 = O, 0 = X) · e 풀이. */\n`;
fs.writeFileSync(path.join(ROOT, 'ox-questions.js'), `${head}export const OX = ${JSON.stringify(all)};\n`);
console.log(`OX 퀴즈 문항 ${all.length}개 — ${Object.entries(Q).map(([k, v]) => `${k} ${v.length}`).join(' · ')} (O ${all.filter((q) => q.a).length} · X ${all.filter((q) => !q.a).length}) → ox-questions.js`);
