/* 사전 화면의 "여러 뜻풀이" 자료를 굽는다 — 생성물, 손으로 고치지 말 것.
 *
 *   node tools/build-glossary-senses.mjs
 *
 * glossary.js(GLOSSARY)는 낱말 하나에 뜻 하나만 담는다 — 지문에서 낱말을
 * 눌렀을 때 빨리 보여 줄 짧은 뜻풀이 용도라 그걸로 충분했다. 그런데
 * docs/glossary-krdict.json(국립국어원 한국어기초사전)에는 애초에 한
 * 표제어에 뜻이 여럿(평균 1.78개, 절반 가까이가 2개 이상) 들어 있었는데
 * glossary.js 를 구울 때 첫 번째만 남기고 버렸다.
 *
 * 국어사전 화면(#dictionary)에서 "뜻풀이 더 보기"로 펼쳐 보여 주려고 그
 * 버려진 나머지 뜻을 따로 굽는다. glossary.js 처럼 늘 받는 자리에 넣지
 * 않고 국어사전 화면을 열 때만 따로 받는다 — 평소엔 안 쓰는 509KB 를
 * 첫 화면 모두에게 물릴 까닭이 없다.
 *
 * 거르는 기준은 build-glossary.mjs 와 같다(그 파일의 주석 참고) —
 * 「(no equivalent)」같은 자리표, 「-n-ga」같은 로마자 읽는 법은 뜻이
 * 아니므로 뺀다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));

const isBlank = (s) => !s || /^\s*[(（].*[)）]\s*$/.test(s);

const CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const JUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
const JONG = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'p', 'l', 'l', 'p', 'l',
              'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
const roman = (w) => [...w].map((ch) => {
  const n = ch.charCodeAt(0) - 0xac00;
  if (n < 0 || n >= 11172) return '';
  return CHO[Math.floor(n / 588)] + JUNG[Math.floor((n % 588) / 28)] + JONG[n % 28];
}).join('');
function isRoman(ko, en) {
  const r = roman(ko);
  const e = String(en).toLowerCase().replace(/[^a-z]/g, '');
  return !!r && e.includes(r) && e.length <= r.length + 3;
}

const krdict = read('docs/glossary-krdict.json');

/* 표제어 하나에 여러 항목(동음이의어)이 딸릴 수 있다 — 그 항목들의 defs
   를 전부 한 줄로 모은다. 화면은 "몇 번째 항목인가"를 몰라도 되고,
   순서대로 번호만 매기면 된다. */
const byHead = new Map();
for (const w of krdict.words) {
  if (!byHead.has(w.ko)) byHead.set(w.ko, []);
  for (const d of w.defs || []) byHead.get(w.ko).push(d);
}

const out = {};
let kept = 0, dropped = 0;
byHead.forEach((defs, head) => {
  const senses = [];
  defs.forEach((d) => {
    const ko = (d.ko || '').trim();
    const en = (d.t && d.t.en || '').trim();
    if (isBlank(ko)) return;
    if (en && !isBlank(en) && !isRoman(head, en)) senses.push([ko, en]);
    else senses.push([ko, '']);   // 한국어 뜻만이라도 남긴다 — 영어가 없다고 통째로 버리면 절반을 잃는다
    kept++;
  });
  /* 한 뜻뿐이면 "더 보기"에 새로 보여 줄 것이 없다 — 카드에 이미 그
     하나가 나가 있다. */
  if (senses.length > 1) out[head] = senses;
  dropped += defs.length - senses.length;
});

const body = `/* 국어사전 화면의 "뜻풀이 더 보기" 자료 — 생성물. 손으로 고치지 말 것.
 *
 *   고칠 때: docs/glossary-krdict.json 이 바뀌면
 *            node tools/build-glossary-senses.mjs 를 다시 돌린다.
 *
 * 뜻이 둘 이상인 표제어 ${Object.keys(out).length}개만 담았다 — 하나뿐인 낱말은
 * glossary.js 의 뜻으로 이미 충분하다. 칸은 [한국어 뜻, 영어 뜻] 이고
 * 영어가 없으면 빈 문자열이다(국립국어원 자료에 대응하는 영어가 없는
 * 경우다 — 지어내지 않고 빈 채로 둔다).
 *
 * 국어사전 화면(#dictionary)이 열릴 때만 따로 받는다. glossary.js 처럼
 * 늘 받는 자리에는 넣지 않는다.
 */
export const SENSES = ${JSON.stringify(out)};
`;

writeFileSync(join(ROOT, 'glossary-senses.js'), body);
console.log(`glossary-senses.js — 표제어 ${Object.keys(out).length}개 · 뜻 ${kept}개(뜻풀이 없어 뺀 것 ${dropped}개)`);
