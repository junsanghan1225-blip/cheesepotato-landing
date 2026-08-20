/* 뜻풀이 사전을 화면이 읽을 모양으로 굽는다 — 생성물, 손으로 고치지 말 것.
 *
 *   node tools/build-glossary.mjs
 *
 * 원본이 둘이다. **섞지 않고 갈라 둔 채로 읽는다.**
 *
 *   docs/glossary.json         우리가 직접 쓴 것 — 우리 저작물
 *   docs/glossary-krdict.json  국립국어원 한국어기초사전 — CC BY-SA 2.0 KR
 *
 * 왜 갈라 두나. 한 파일에 섞으면 어디까지가 CC BY-SA 인지 아무도 말할 수
 * 없게 되고, 그러면 우리 것까지 딸려 열린다. 자세한 것은
 * docs/glossary-license.md.
 *
 * ── 왜 언어마다 파일을 따로 내나 ──────────────────────────────
 * 사전에는 열 나라 말이 들어 있다. 한 파일에 다 담으면 4.5MB 가 되고, 그것을
 * **모든 방문자가 내려받게 된다** — 아랍어 뜻풀이를 영어 쓰는 사람에게까지
 * 물리는 셈이다.
 *
 * 그래서 늘 쓰는 영어만 glossary.js 에 담고, 나머지 아홉 말은 파일을 따로
 * 내어 **그 말을 고른 사람만** 받게 한다. 한 말이 120~230KB 다.
 *
 * 영어를 늘 담는 까닭 — 고른 말에 뜻이 없을 때 물러설 자리가 있어야 한다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));

/* 화면에서 고를 수 있는 말. 사전이 가진 말과 겹치는 것만 낸다. */
const OTHER = ['ja', 'zh', 'vi', 'ru', 'es', 'fr', 'ar', 'mn', 'id'];

/* ── 사전에서 걸러 내는 것 ───────────────────────────────────
 * 사전을 통째로 들이면 학습자에게 **뜻이 아닌 것**이 뜻인 척 나간다.
 * 실제로 재 보고 걸린 것이 셋이었다.
 *
 *   1. 어미·조사·접사      「-ㄴ가」의 뜻은 「-n-ga」다. 낱말이 아니다.
 *   2. 로마자만 적힌 풀이   「것」의 영어가 「-n geot」, 「문」이 「-mun」이다.
 *                          읽는 법이지 뜻이 아니다.
 *   3. 「해당 없음」 자리표  「(no equivalent expression)」. 열 나라 말마다 있다.
 *
 * 셋 다 빈 칸보다 나쁘다. 빈 칸은 학습자가 채우지만, 「-mun」은 뜻인 줄 알고
 * 그대로 외운다.
 */
const POS_SKIP = new Set(['어미', '조사', '접사']);

/* 괄호로만 이루어진 풀이는 자리표다 — 「(무대응어휘)」 「(нет эквивалента)」. */
const isBlank = (s) => !s || /^\s*[(（].*[)）]\s*$/.test(s);

/* 로마자 표기법. 뜻풀이 자리에 읽는 법이 적힌 줄을 가려내려고 쓴다. */
const CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const JUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
/* 받침 28 자리. 한 자리라도 어긋나면 뒤가 통째로 밀려 엉뚱한 소리가 난다 —
   실제로 ㅇ(ng)을 빠뜨려 「싶다」가 「sipda」인 줄 모르고 그대로 내보냈다. */
const JONG = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'p', 'l', 'l', 'p', 'l',
              'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
const roman = (w) => [...w].map((ch) => {
  const n = ch.charCodeAt(0) - 0xac00;
  if (n < 0 || n >= 11172) return '';
  return CHO[Math.floor(n / 588)] + JUNG[Math.floor((n % 588) / 28)] + JONG[n % 28];
}).join('');

/* 뜻풀이가 사실은 읽는 법인가. 글자만 남기고 견준다 — 「-n geot」은 「geot」에
   군더더기 한 자가 붙은 것뿐이다. 길이를 재서 진짜 영어 낱말은 안 걸리게 한다
   («house» 안에 «jip» 이 없듯이, 겹쳐도 길이가 크게 다르면 뜻이다). */
function isRoman(ko, en) {
  const r = roman(ko);
  const e = String(en).toLowerCase().replace(/[^a-z]/g, '');
  return !!r && e.includes(r) && e.length <= r.length + 3;
}

/* ── 1. 우리가 쓴 것 ─────────────────────────────────────────── */
const mine = read('docs/glossary.json');
const table = {};
/* 「사전이 이 낱말로 고른 뜻은 딴말이다」고 손으로 못 박은 것.
 *
 *   이 → 「louse(이[蟲])」  씨 → 「seed(씨앗)」  수 → 「male(수컷)」
 *
 * 다 사전에 있는 진짜 뜻이지만, 우리 지문에서 그 낱말은 「이 상자」의 이,
 * 「민수 씨」의 씨, 「-ㄹ 수 있다」의 수다. 영어 표에서는 우리 것이 이미
 * 이기지만 **언어팩까지 막지 않으면** 일본어를 고른 사람에게는 「しらみ」가
 * 그대로 나간다. 그래서 열 나라 말에서 함께 뺀다.
 */
const only = new Set(mine.filter((e) => e.only).map((e) => e.ko));
for (const e of mine) {
  const val = {};
  for (const [k, v] of Object.entries(e)) {
    if (k === 'ko' || k === 'alt' || k === 'only') continue;
    val[k] = v;
  }
  /* 표제어와 활용형을 한 표에 넣는다. 찾는 쪽은 무엇이 표제어인지 모르므로
     어느 꼴로 눌러도 한 번에 닿아야 한다. */
  for (const key of [e.ko, ...(e.alt || [])]) {
    if (!table[key]) table[key] = { head: e.ko, ...val };
  }
}
const mineKeys = new Set(Object.keys(table));

/* ── 2. 사전에서 온 것 ───────────────────────────────────────── */
let krdict = { words: [] };
try { krdict = read('docs/glossary-krdict.json'); } catch (e) { /* 아직 없으면 우리 것만 */ }

const packs = Object.fromEntries(OTHER.map((L) => [L, {}]));
let fromDict = 0;
const dropped = { pos: 0, roman: 0, blank: 0, only: 0 };

for (const w of krdict.words || []) {
  if (POS_SKIP.has(w.pos)) { dropped.pos++; continue; }
  if (only.has(w.ko)) { dropped.only++; continue; }
  /* 자리표는 뜻이 아니다. 자리표뿐인 줄은 없는 셈 친다 — 그래야 다음 뜻으로
     넘어간다. 「시」의 첫 뜻이 「(no equivalent expression)」이라고 해서 그
     낱말에 뜻이 없는 것은 아니다. */
  const first = (L) => (w.defs.find((d) => d.t && !isBlank(d.t[L])) || {}).t?.[L] || '';

  /* 우리가 쓴 것이 이긴다. 학습자를 보고 고른 말이고 활용형까지 달려 있다. */
  if (!mineKeys.has(w.ko)) {
    const en = first('en');
    if (!en) dropped.blank++;
    else if (isRoman(w.ko, en)) dropped.roman++;
    else { table[w.ko] = { head: w.ko, en }; fromDict++; }
  }
  /* 다른 말은 우리 것이 있든 없든 담는다 — 우리 것에는 영어뿐이라
     일본어를 고른 사람에게 내줄 것이 없다. */
  for (const L of OTHER) {
    const v = first(L);
    if (v) packs[L][w.ko] = v;
  }
}

/* ── 3. 내보낸다 ────────────────────────────────────────────── */
const CREDIT = krdict.words?.length
  ? ` *\n * 뜻풀이 일부는 국립국어원 「한국어기초사전」(https://krdict.korean.go.kr)에서\n` +
    ` * 왔다. CC BY-SA 2.0 KR — https://creativecommons.org/licenses/by-sa/2.0/kr/\n`
  : '';

const j = (v) => JSON.stringify(v);

writeFileSync(join(ROOT, 'glossary.js'),
`/* 낱말 뜻풀이 — 생성물. 손으로 고치지 말 것.
 *
 *   고칠 때: docs/glossary.json 을 고치고
 *            node tools/build-glossary.mjs 를 다시 돌린다.
${CREDIT} *
 * 찾을 수 있는 꼴 ${Object.keys(table).length}개 (우리가 쓴 것 ${mineKeys.size} · 사전에서 ${fromDict}).
 * 여기 담긴 말은 **영어뿐이다.** 다른 말은 GLOSS_LANGS 를 따라 그 말을 고른
 * 사람만 따로 받는다 — 열 나라 말을 다 담으면 4.5MB 를 모두에게 물린다.
 *
 * head 는 표제어다. 「먹었습니다」로 찾아도 단어장에는 「먹다」로 담기게
 * 하려고 같이 넣는다 — 활용형이 그대로 쌓이면 같은 말이 열 번 들어간다.
 */
export const GLOSSARY = ${j(table)};

/* 말 → 그 말이 든 파일. 화면이 필요할 때만 불러온다.
   문자열을 그대로 적어 두어야 tools/stamp.mjs 가 자국을 찍는다. */
export const GLOSS_LANGS = {
${OTHER.map((L) => `  ${L}: './glossary-${L}.js',`).join('\n')}
};
`);

for (const L of OTHER) {
  writeFileSync(join(ROOT, `glossary-${L}.js`),
`/* ${L} 뜻풀이 — 생성물. 손으로 고치지 말 것.
 *
 * 국립국어원 「한국어기초사전」 https://krdict.korean.go.kr
 * CC BY-SA 2.0 KR https://creativecommons.org/licenses/by-sa/2.0/kr/
 *
 * 낱말 ${Object.keys(packs[L]).length}개. 단어장 모국어를 ${L} 로 둔 사람만 받는다.
 */
export const G = ${j(packs[L])};
`);
}

const kb = (f) => (readFileSync(join(ROOT, f)).length / 1024).toFixed(0);
console.log(`glossary.js — 찾을 수 있는 꼴 ${Object.keys(table).length}개 (${kb('glossary.js')}KB)`);
console.log(`  우리가 쓴 것 ${mineKeys.size} · 사전에서 온 것 ${fromDict}`);
console.log(`  걸러 낸 것 — 어미·조사·접사 ${dropped.pos} · 읽는 법만 적힌 것 ${dropped.roman} · 영어가 없는 것 ${dropped.blank} · 우리가 딴말로 못 박은 것 ${dropped.only}`);
console.log('언어팩 ' + OTHER.map((L) => `${L} ${Object.keys(packs[L]).length}개(${kb(`glossary-${L}.js`)}KB)`).join(' · '));
