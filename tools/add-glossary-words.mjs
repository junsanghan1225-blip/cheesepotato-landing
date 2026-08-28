/* Gemini 가 지은 새 표제어를 docs/glossary.json 에 넣는다.
 *
 *   node tools/add-glossary-words.mjs 받은것.json
 *   node tools/add-glossary-words.mjs 받은것.json --dry   넣지 않고 보기만
 *
 * add-glossary-examples.mjs 와 같은 자리다 — 손으로 배열에 이어 붙이던
 * 것을 도구로 옮겼다. 여기서는 "모양"만 본다(표제어가 한글인지·영어
 * 뜻이 있는지·활용형이 다른 표제어와 안 겹치는지). "쌓인 전체가 고르게
 * 좋은가"는 지금처럼 check-glossary.mjs 몫이다.
 *
 * docs/glossary.json 은 예문 파일과 달리 **표제어 가나다순이 아니라
 * 받은 순서 그대로** 쌓여 있다(322개, 세션마다 이어 붙인 기록). 여기서도
 * 그 관례를 따라 끝에 이어 붙인다 — 정렬해 버리면 다음 diff 가 파일
 * 전체를 흔든다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs/glossary.json');

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith('--'));
const DRY = args.includes('--dry');

if (!src) {
  console.error('쓰는 법: node tools/add-glossary-words.mjs 받은것.json [--dry]');
  process.exit(1);
}
if (!existsSync(src)) { console.error(`파일이 없다: ${src}`); process.exit(1); }

/* Gemini 가 ```json 울타리나 인사말을 앞에 붙여 보낼 때가 있다. 벗겨
   준다 — 그걸 지우려고 파일을 열었다가 다른 데를 건드리는 것이 더
   위험하다. */
let raw = readFileSync(src, 'utf8').trim();
raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
const a = raw.indexOf('['), b = raw.lastIndexOf(']');
if (a < 0 || b < 0) { console.error('JSON 배열을 못 찾았다. [ 로 시작해 ] 로 끝나야 한다.'); process.exit(1); }

let items;
try { items = JSON.parse(raw.slice(a, b + 1)); }
catch (e) {
  console.error('JSON 이 깨졌다: ' + e.message);
  console.error('Gemini 에게 「설명 없이 JSON 배열만」이라고 다시 시켜라.');
  process.exit(1);
}
if (!Array.isArray(items) || !items.length) { console.error('배열이 비었다.'); process.exit(1); }

let cur = [];
try { cur = JSON.parse(readFileSync(OUT, 'utf8')); } catch (e) { /* 처음이면 빈 것으로 시작 */ }

const HANGUL_ONLY = /^[가-힣]+$/;
const byKo = new Map(cur.map((e, i) => [e.ko, i]));
/* 표제어와 활용형을 한 자리에서 본다 — 「삽니다」가 「사다」의 alt 이면서
   「살다」의 alt 일 수는 없다(어느 뜻이 나갈지 못 정한다). */
const knownForms = new Map();   // 꼴 → 그 꼴을 쓰는 표제어
for (const e of cur) {
  knownForms.set(e.ko, e.ko);
  for (const alt of e.alt || []) knownForms.set(alt, e.ko);
}

const bad = [];
const warn = [];
const seenInBatch = new Set();
const next = cur.map((e) => ({ ...e }));
let added = 0, updated = 0;

items.forEach((it, i) => {
  const at = `${i + 1}번째(${it?.ko || '표제어 없음'})`;
  const ko = String(it?.ko || '').trim();
  const en = String(it?.en || '').trim();
  const alt = Array.isArray(it?.alt) ? it.alt.map((x) => String(x).trim()).filter(Boolean) : [];

  if (!ko) { bad.push(`${at}: ko(표제어)가 없다`); return; }
  if (!HANGUL_ONLY.test(ko)) { bad.push(`${at}: 표제어 "${ko}" 에 한글이 아닌 것이 섞였다`); return; }
  if (seenInBatch.has(ko)) { bad.push(`${at}: 받은 것 안에서 표제어가 겹친다`); return; }
  seenInBatch.add(ko);

  if (!en) { bad.push(`${at}: en(영어 뜻)이 없다`); return; }
  if (en.length > 60) bad.push(`${at}: 영어 뜻이 60자를 넘는다(${en.length}자)`);
  if (/[가-힣]/.test(en)) bad.push(`${at}: 영어 뜻에 한글이 섞였다 — "${en}"`);
  if (en.split(';').length > 3) bad.push(`${at}: 뜻이 세 개를 넘는다(";" 로 두 개까지만) — "${en}"`);

  for (const w of alt) {
    if (!HANGUL_ONLY.test(w)) { bad.push(`${at}: 활용형 "${w}" 에 한글이 아닌 것이 섞였다`); return; }
  }

  /* 이미 있는 표제어면 손보는 것이고, 새 표제어면 더하는 것이다. */
  const existingIdx = byKo.get(ko);
  if (existingIdx != null) {
    const before = next[existingIdx];
    next[existingIdx] = { ...before, ...it, ko, en, ...(alt.length ? { alt } : {}) };
    updated++;
  } else {
    /* 딴 표제어가 이미 쓰고 있는 꼴과 겹치면 어느 뜻으로 나갈지 못 정한다.
       자기 자신(방금 이 배치에서 만든 표제어)과 겹치는 것은 정상이라 뺀다. */
    const clash = [ko, ...alt].find((w) => knownForms.has(w) && knownForms.get(w) !== ko);
    if (clash) {
      bad.push(`${at}: "${clash}" 는 이미 "${knownForms.get(clash)}" 의 꼴이다 — 양쪽에서 겹치는 꼴을 빼라`);
      return;
    }
    const entry = { ko, en };
    if (alt.length) entry.alt = alt;
    for (const [k, v] of Object.entries(it)) {
      if (['ko', 'en', 'alt'].includes(k)) continue;
      entry[k] = v;
    }
    next.push(entry);
    knownForms.set(ko, ko);
    alt.forEach((w) => knownForms.set(w, ko));
    added++;
  }
});

if (bad.length) {
  console.error(`넣지 않았다. 고쳐야 할 것 ${bad.length}개\n`);
  bad.forEach((x) => console.error('  ✗ ' + x));
  process.exit(1);
}
if (warn.length) {
  console.log(`짚어 볼 것 ${warn.length}개 (넣기는 한다 — 사람이 눈으로 한 번 봐라)`);
  warn.forEach((x) => console.log('  · ' + x));
  console.log('');
}

console.log(`새로 ${added}개 · 이미 있던 것 고침 ${updated}개`);

if (DRY) { console.log('\n--dry 라 파일을 안 건드렸다.'); process.exit(0); }

writeFileSync(OUT, JSON.stringify(next, null, 1) + '\n', 'utf8');
console.log(`docs/glossary.json — 표제어 ${next.length}개`);
console.log('다음: node tools/build-glossary.mjs && node tools/check-glossary.mjs && node tools/stamp.mjs');
