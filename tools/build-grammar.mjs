/* 문법 이름을 글에서 찾아낼 수 있는 꼴로 굽는다 — 생성물, 손으로 고치지 말 것.
 *
 *   node tools/build-grammar.mjs            굽고 요약만
 *   node tools/build-grammar.mjs --report   읽기 지문에서 무엇이 걸리는지 전부
 *
 * ── 왜 이 도구가 있나 ────────────────────────────────────────
 * 예문 만들기에 문법 290개가 이름과 설명까지 갖춰 쌓여 있다. 그런데 읽기
 * 연습에서 「-는 바람에」를 처음 본 사람은 **그것이 문법인 줄도 모른다.**
 * 낱말이면 사전을 찾겠는데 어미는 찾을 데가 없다. 그래서 글 위에서 바로
 * 짚어 주고, 눌러서 그 문법 쪽으로 건너가게 한다.
 *
 * 이름은 사람이 읽으라고 적힌 것이라(「A/V-(으)ㄴ/는데 ①」) 그대로는 글에서
 * 못 찾는다. 여기서 그것을 찾을 수 있는 꼴로 옮긴다.
 *
 * ── 안 굽는 것 ───────────────────────────────────────────────
 * 이름이 꼴이 아니라 **설명**인 것이 있다 — 「숫자 (한자어·순우리말)」,
 * 「'ㅂ' 불규칙」, 「직접 인용」, 「하오체」. 글에서 찾을 수 있는 자국이
 * 없으므로 아예 안 굽는다. 억지로 만들면 엉뚱한 데 밑줄이 그어진다.
 *
 * 토씨와 한 글자 어미(-고, -기, -게, N도, N만)도 뺀다. 틀려서가 아니라
 * **너무 많이 맞아서**다. 지문의 반이 밑줄이면 짚어 준 것이 아니다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SB_CATS } from '../sentences.js';
import { READING } from '../reading.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ── 글자만 보고는 못 가르는 것 ──────────────────────────────
 * 읽기 지문 54편에 실제로 대 보고 **틀린 자리에 밑줄이 그어진 것**만
 * 적었다. 짐작으로 뺀 것은 하나도 없다. 뒤의 괄호가 그때 걸린 자리다.
 *
 * 다시 넣고 싶으면 지문에 대 보고 넣어라 — node tools/build-grammar.mjs
 * --report 가 어디에 걸리는지 다 보여 준다.
 */
const BLIND = {
  '5-3':   '「만들」 「현대인들」의 복수 「들」과 못 가른다',
  '28-10': '「회사까지는 지하철」처럼 토씨 「는」 + 낱말 「지」에 걸린다',
  '63-2':  '「컵을 가지고 다니면」의 「가지다」와 못 가른다',
  '60-2':  '「게다가」에 걸린다',
  '2-1':   '「풍경을 보고」의 「보다」와 못 가른다',
  '19-3':  '「일을 다 마치고」에 걸린다',
  '7-1':   '「저는 한 달 전부터」에 걸린다',
  '63-1':  '「오랜만에」처럼 낱말 안에 걸린다',
  '4-10':  '「바로 여기에 있습니다」의 「여기 + 에」에 걸린다',
};

/* ── 맞지만 안 짚는 것 ───────────────────────────────────────
 * 「-습니다」는 지문 54편에서 274번 걸렸다. 문장마다 하나씩이다. 다 밑줄을
 * 그으면 글이 아니라 밑줄이 된다. 토씨 「이/가」 「은/는」 「을/를」도 같다.
 *
 * 틀려서가 아니라 **첫 시간에 배우는 것**이라서 뺀다. 이 기능은 「모르는
 * 문법」을 짚어 주자는 것이지 아는 것을 세어 주자는 것이 아니다.
 */
const TOO_BASIC = new Set([
  '24-1', '24-2', '24-3',           // -습니다 · -아/어요 · -았/었어요 (문장마다 하나씩)
  '25-2', '25-3',                   // 안 · 못
  '26-1', '26-2', '26-3', '26-5',   // 이/가 은/는 을/를 의 (이름씨마다 하나씩)
  '26-6', '26-7',                   // 에 (자리·때)
]);
/* 처음에는 토씨를 통째로 뺐다가 되돌렸다. 초급 지문 열여덟 편 가운데
   여섯 편에 밑줄이 하나도 안 남았기 때문이다 — 초급 글은 바로 그 토씨로
   쓰여 있다. 「에서」와 「에」의 차이, 「(으)로」, 「쯤」은 초급이 실제로
   헷갈리는 것이라 남겼다. 뺀 것은 **뜻을 따로 배울 것이 없는** 자리
   토씨(이/가·은/는·을/를·의)와 문장 끝맺음뿐이다. */

/* 이름이 꼴이 아니라 설명인 것. 이 말이 들어 있으면 안 굽는다. */
const PROSE = ['불규칙', '인용', '관형형', '피동', '사동', '숫자', '날짜', '요일',
               '시간', '하오체', '하게체', '서술체', '반말체', '단어 부정'];

/* 받침이 든 자리를 나타내는 표. 여기서는 한 글자로만 적어 두고, 화면에서
   grammar-find.js 가 그 받침이 든 글자를 전부 펼친다 — 받침 하나에 글자가
   399개라, 여기에 펼쳐 적으면 파일이 통째로 부풀어 오른다. */
const JONG = { 'ㄴ': 'Ⓝ', 'ㄹ': 'Ⓡ', 'ㅁ': 'Ⓜ', 'ㅂ': 'Ⓑ' };

/* 앞에 말이 온다는 표시. 찾을 때는 한글 한 글자로 두되 **밑줄에는 안
   넣는다** — 「일어납니다」에 밑줄을 「어납니다」부터 그으면 낱말이 잘린
   자리에서 시작해 무엇을 짚었는지 알 수 없다. */
const HEAD = 'Ⓗ';

/* 「-아/어」는 앞 글자와 녹아 붙는다 — 「가+아서」가 「가서」, 「하+아서」가
   「해서」다. 글자로는 종잡을 수 없어 **앞 글자 아무거나**로 열어 둔다.
   대신 뒤에 오는 자국과 띄어쓰기로 가려낸다. */
const MERGE = 'Ⓐ';

/* 「-았/었」은 녹아도 자국이 남는다 — 「갔」 「먹었」 「했」 「봤」이 모두
   받침 ㅆ 이다. 아무 글자로 열어 두면 「게다가」가 「-았/었다가」로 걸린다.
   실제로 그랬다. */
const PAST = 'Ⓢ';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* 이름 한 줄 → 글에서 찾을 수 있는 꼴 여럿. 못 옮기면 빈 배열. */
function compile(name) {
  let s = name.replace(/[①②③④⑤]/g, '').trim();
  /* 뜻을 밝힌 괄호는 뗀다. (으) (스) (느) (이) 는 꼴의 일부라 남긴다. */
  s = s.replace(/\(([^)]*)\)/g, (m, in_) => (['으', '스', '느', '이'].includes(in_) ? m : ' '));
  s = s.replace(/\s+/g, ' ').trim();
  if (!s || PROSE.some((w) => name.includes(w))) return [];

  /* 「있다·없다」처럼 마지막 낱말만 갈리는 것. 앞은 함께 쓰고 뒤만 나눈다. */
  let alts = [];
  for (const part of s.split(',').map((x) => x.trim()).filter(Boolean)) {
    const dot = part.lastIndexOf('·');
    if (dot < 0) { alts.push(part); continue; }
    const head = part.slice(0, dot);
    const sp = head.lastIndexOf(' ');
    const keep = sp < 0 ? '' : head.slice(0, sp + 1);
    alts.push(head, keep + part.slice(dot + 1));
  }

  const out = [];
  for (const a of alts) {
    const r = one(a);
    if (r) out.push(r);
  }
  return [...new Set(out)];
}

/* 꼴 하나를 옮긴다. 옮길 수 없으면 빈 문자열. */
function one(a) {
  let src = '';
  let core = 0;          // 자국이 되는 글자 수 — 너무 짧으면 안 쓴다
  let i = 0;
  /* 앞머리의 품사 표시(A/V- · V- · N)는 「여기 앞에 말이 온다」는 뜻이다.
     찾을 때는 「한글 한 글자」로 바꿔 둔다 — 그래야 「그리고」의 「고」처럼
     낱말 안에 든 것이 안 걸린다. */
  const head = a.match(/^(A\/V|V\/A|A|V|N)\s*-?\s*/);
  if (head) { src += 'Ⓗ'; i = head[0].length; }

  while (i < a.length) {
    const rest = a.slice(i);

    /* (으)ㄴ · (으)ㄹ · (으)ㅁ — 받침으로 붙거나 「으」를 끼워 붙는다 */
    let m = rest.match(/^\(으\)([ㄴㄹㅁ])/);
    if (m) { src += `(?:으${m[1] === 'ㄴ' ? '은' : m[1] === 'ㄹ' ? '을' : '음'}|${JONG[m[1]]})`.replace(/으(은|을|음)/, '$1'); i += m[0].length; core++; continue; }
    /* (스)ㅂ니다 · (느)ㄴ다 */
    m = rest.match(/^\(스\)ㅂ/);
    if (m) { src += '(?:습|Ⓑ)'; i += m[0].length; core++; continue; }
    m = rest.match(/^\(느\)ㄴ/);
    if (m) { src += '(?:는|Ⓝ)'; i += m[0].length; core++; continue; }
    /* 홀로 선 받침 — 「-(으)ㄴ」의 (으) 없이 쓰인 자리 */
    m = rest.match(/^[ㄴㄹㅁㅂ]/);
    if (m) { src += JONG[m[0]]; i += 1; core++; continue; }
    /* (으) · (이) — 있어도 되고 없어도 된다 */
    m = rest.match(/^\((으|이)\)/);
    if (m) { src += `${m[1]}?`; i += m[0].length; continue; }

    /* 갈리는 자리. 「아/어」 「았/었」은 앞 글자와 녹으므로 따로 다룬다. */
    m = rest.match(/^았\/었/);
    if (m) { src += PAST; i += m[0].length; core++; continue; }
    m = rest.match(/^아\/어/);
    if (m) { src += MERGE; i += m[0].length; continue; }
    m = rest.match(/^([가-힣]{1,3})\/([가-힣]{1,3})/);
    if (m) { src += `(?:${esc(m[1])}|${esc(m[2])})`; i += m[0].length; core += m[1].length; continue; }

    const ch = a[i];
    /* 이름에 띄어쓰기가 있으면 글에도 있어야 한다. 없어도 된다고 두었더니
       「V-아/어 보다」가 「비판보다」 「어제보다」에 걸렸다 — 견줌의 토씨
       「보다」다. 띄어쓰기 하나가 그 둘을 가른다. */
    if (ch === ' ') { src += '\\s+'; i++; continue; }
    if (ch === '-') { i++; continue; }
    if (/^[가-힣]$/.test(ch)) { src += esc(ch); core++; i++; continue; }
    /* 옮길 줄 모르는 글자가 섞였다. 지어내지 않고 통째로 버린다. */
    return '';
  }

  /* 자국이 한 글자뿐이면 안 쓴다. 「-고」 「-기」 「N도」가 여기서 걸러진다 —
     지문의 반이 밑줄이 되면 짚어 준 것이 아니라 지운 것이 된다. */
  if (core < 2) return '';
  return src;
}

/* ── 굽는다 ────────────────────────────────────────────────── */
const rows = [];
const skipped = [];
for (const g of SB_CATS) {
  for (const p of g.points || []) {
    if (BLIND[p.id]) { skipped.push(`${p.id} ${p.name} — ${BLIND[p.id]}`); continue; }
    if (TOO_BASIC.has(p.id)) { skipped.push(`${p.id} ${p.name} — 너무 자주 나온다`); continue; }
    const res = compile(p.name);
    if (!res.length) { skipped.push(`${p.id} ${p.name}`); continue; }
    rows.push({ id: p.id, name: p.name, lv: p.lv, desc: p.desc, re: res });
  }
}

/* 긴 것이 먼저 걸려야 한다 — 「-(으)ㄴ/는데」가 「-는 데」를 이기게. */
rows.sort((a, b) => Math.max(...b.re.map((x) => x.length)) - Math.max(...a.re.map((x) => x.length)));

writeFileSync(join(ROOT, 'grammar.js'),
`/* 글에서 찾아낼 문법 — 생성물. 손으로 고치지 말 것.
 *
 *   고칠 때: sentences.js 의 문법 이름을 고치고
 *            node tools/build-grammar.mjs 를 다시 돌린다.
 *
 * 문법 ${rows.length}개. 예문 만들기의 ${rows.length + skipped.length}개 가운데
 * ${skipped.length}개는 이름이 꼴이 아니라 설명이거나(「'ㅂ' 불규칙」) 너무
 * 짧아서(「-고」) 안 담았다 — 까닭은 tools/build-grammar.mjs 머리말에.
 *
 * re 안의 Ⓝ Ⓡ Ⓜ Ⓑ 는 그 받침이 든 글자 전부, Ⓐ 는 앞 글자와 녹아 붙는
 * 자리다. grammar-find.js 가 펼친다.
 */
export const GRAMMAR = ${JSON.stringify(rows)};
`);

/* ── 영어 설명 ─────────────────────────────────────────────
 * sentences.js 의 설명은 한국어뿐이다. 한국어를 배우러 온 사람에게 한국어로
 * 설명하면 설명이 또 하나의 숙제가 된다.
 *
 * 영어는 sentences.js 에 섞지 않고 docs/grammar-en.json 에 따로 둔다 —
 * 그 파일은 손으로 오래 다듬은 자료라, 번역을 한 줄씩 끼워 넣다가 다른
 * 줄을 건드리면 되돌릴 데가 없다. 여기서 id 로 맞춰 붙인다.
 *
 * 채우는 길은 docs/grammar-gemini-prompt.md 에.
 */
let mineEn = [];
try { mineEn = JSON.parse(readFileSync(join(ROOT, 'docs/grammar-en.json'), 'utf8')); } catch (e) { /* 없으면 한국어로 */ }

const ids = new Set();
for (const g of SB_CATS) for (const p of g.points || []) ids.add(p.id);

const enTable = {};
const enBad = [];
for (const e of mineEn) {
  if (!ids.has(e.id)) { enBad.push(`${e.id} — 예문 만들기에 없는 id 다`); continue; }
  if (enTable[e.id]) { enBad.push(`${e.id} — 두 번 적혔다`); continue; }
  const row = {};
  for (const k of ['desc', 'form', 'care']) {
    const v = String(e[k] ?? '').trim();
    if (!v) continue;
    /* 「형태」 칸에는 한국어 꼴이 그대로 들어간다 — 「N + 이에요」의 이에요는
       번역할 것이 아니다. 설명말만 영어면 된다. desc·care 는 통째로 영어라야
       한다. 한글이 남아 있으면 옮기다 만 것이다.

       낫표(「」) 안은 가리키는 꼴이고 대괄호([]) 안은 소리 나는 대로다
       (「-ㄹ 거예요」를 [-ㄹ 꺼에요]로 읽는다). 둘 다 옮길 것이 아니라 배울
       것이라 검사에서 뺀다. */
    if (k !== 'form' && /[가-힣]/.test(v.replace(/[「」][^「」]*[「」]|\[[^\]]*\]/g, ''))) {
      enBad.push(`${e.id} ${k} — 「」 밖에 한글이 남았다: ${v.slice(0, 40)}`);
      continue;
    }
    row[k] = v;
  }
  if (!row.desc) { enBad.push(`${e.id} — desc 가 없다`); continue; }
  /* 말풍선은 지문 위에 겹쳐 뜬다. 설명이 길면 짚어 주려던 글을 덮는다. */
  if (row.desc.length > 160) enBad.push(`${e.id} desc — ${row.desc.length}자다. 160자를 넘으면 말풍선이 글을 덮는다`);
  enTable[e.id] = row;
}

writeFileSync(join(ROOT, 'grammar-en.js'),
`/* 문법 설명의 영어 — 생성물. 손으로 고치지 말 것.
 *
 *   고칠 때: docs/grammar-en.json 을 고치고
 *            node tools/build-grammar.mjs 를 다시 돌린다.
 *
 * ${Object.keys(enTable).length} / ${ids.size} 개. 없는 것은 화면이 한국어로 물러선다 —
 * 지어내 채우면 배우는 사람이 그 틀린 설명을 그대로 외운다.
 */
export const GRAMMAR_EN = ${JSON.stringify(enTable)};
`);

/* ── 읽기 지문에서 무엇이 걸리는지 ─────────────────────────── */
const { grammarScan } = await import('../grammar-find.js');
const texts = [];
for (const L of Object.values(READING)) for (const lv of Object.values(L)) for (const r of lv) texts.push([r.id, r.passage]);

let marks = 0;
const byId = new Map();
const lines = [];
for (const [id, text] of texts) {
  const hits = grammarScan(text, rows);
  marks += hits.length;
  for (const h of hits) {
    byId.set(h.id, (byId.get(h.id) ?? 0) + 1);
    lines.push(`${id}  「${text.slice(h.from, h.to)}」  ← ${h.id} ${h.name}` +
      `\n      …${text.slice(Math.max(0, h.from - 16), Math.min(text.length, h.to + 16))}…`);
  }
}

console.log(`문법 ${rows.length}개를 구웠다 (안 담은 것 ${skipped.length}개).`);
console.log(`영어 설명 ${Object.keys(enTable).length}/${ids.size}개.` +
  (enBad.length ? '' : ' 이상 없음.'));
if (enBad.length) {
  console.log('\n영어 설명에서 고쳐야 할 것');
  enBad.forEach((m) => console.log('  ✗ ' + m));
}
console.log(`읽기 지문 ${texts.length}편에서 ${marks}군데가 걸린다 — 한 편에 ${(marks / texts.length).toFixed(1)}군데.`);
console.log(`서로 다른 문법 ${byId.size}가지.`);
console.log('\n자주 걸리는 차례:');
console.log('  ' + [...byId].sort((a, b) => b[1] - a[1])
  .map(([id, n]) => `${id}(${n})`).join(' · '));
if (process.argv.includes('--report')) {
  console.log('\n── 걸린 자리 ──────────────────────────────');
  lines.forEach((l) => console.log(l));
  console.log('\n── 안 담은 것 ─────────────────────────────');
  skipped.forEach((l) => console.log('  ' + l));
}
