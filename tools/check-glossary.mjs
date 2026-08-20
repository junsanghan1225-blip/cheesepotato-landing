/* 뜻풀이 사전을 본다.
 *
 *   node tools/check-glossary.mjs
 *
 * 여기 적힌 뜻이 그대로 학습자의 단어장에 들어간다. 틀린 뜻은 빈 칸보다
 * 나쁘다 — 빈 칸은 채우면 되지만 틀린 뜻은 외우고 나서야 안다. 기계가 볼 수
 * 있는 것(빠짐·겹침·모양)은 기계가 보고, 사람은 「이 뜻이 맞나」에만 눈을 쓴다.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TOPIK_READING } from '../topik.js';
import { TOPIK2_READING } from '../topik2.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rows = JSON.parse(readFileSync(join(ROOT, 'docs/glossary.json'), 'utf8'));

const bad = [];
const note = [];
const seen = new Map();   // 꼴 → 표제어

for (const e of rows) {
  const at = (m) => bad.push(`${e.ko ?? '?'} — ${m}`);
  if (!e.ko) { bad.push('ko(표제어)가 없는 줄이 있다'); continue; }
  if (!/^[가-힣]+$/.test(e.ko)) at('표제어에 한글이 아닌 것이 섞였다');
  if (!e.en) at('en 이 없다 — 영어는 모든 낱말에 있어야 한다 (다른 말이 없을 때 대신 나간다)');

  for (const [k, v] of Object.entries(e)) {
    if (k === 'ko' || k === 'alt') continue;
    if (typeof v !== 'string' || !v.trim()) at(`${k} 가 비었다`);
    else if (v.length > 60) note.push(`${e.ko} — ${k} 뜻이 길다(${v.length}자). 단어장 한 줄에 안 들어간다`);
    /* 뜻에 한국어를 적어 두면 영어 칸인데 한국어가 나간다. ko 칸은 예외다. */
    if (k === 'en' && /[가-힣]/.test(String(v))) at('en 에 한글이 섞였다');
  }

  for (const key of [e.ko, ...(e.alt || [])]) {
    if (!/^[가-힣]+$/.test(key)) { at(`활용형 「${key}」에 한글이 아닌 것이 섞였다`); continue; }
    /* 같은 꼴이 두 표제어에 붙으면 어느 뜻이 나갈지 우리도 모른다.
       「사다」와 「살다」가 둘 다 「삽니다」를 갖는 것이 실제로 그렇다 —
       하나로 정하거나, 뜻을 합쳐 한 줄로 적어야 한다. */
    if (seen.has(key) && seen.get(key) !== e.ko) {
      bad.push(`「${key}」가 「${seen.get(key)}」와 「${e.ko}」 두 곳에 있다 — 어느 뜻이 나갈지 정할 수 없다`);
    }
    seen.set(key, e.ko);
  }
}

/* 지문에 없는 낱말은 눌릴 일이 없다. 틀린 것은 아니지만 품이 헛간 것이라
   짚어만 둔다. */
const corpus = new Set();
const tally = new Map();
for (const q of [...TOPIK_READING, ...TOPIK2_READING]) {
  const text = [q.passage, q.sentence, ...(q.options || [])].filter(Boolean).join(' ');
  text.split(/\s+/).forEach((w) => {
    const k = w.replace(/[^가-힣]/g, '');
    if (!k) return;
    corpus.add(k);
    tally.set(k, (tally.get(k) ?? 0) + 1);
  });
}
const unused = rows.filter((e) => ![e.ko, ...(e.alt || [])].some((k) => corpus.has(k)));
if (unused.length) {
  note.push(`지문에 한 번도 안 나오는 표제어 ${unused.length}개: ` +
    unused.slice(0, 12).map((e) => e.ko).join(', ') + (unused.length > 12 ? ' …' : ''));
}

/* 얼마나 덮고 있나. 이 숫자가 이 사전의 쓸모다.

   가짓수로만 세면 실제보다 낮게 나온다 — 4천 가지 가운데 한 번씩만 나오는
   말이 태반인데, 학습자가 마주치는 것은 자주 나오는 쪽이다. 그래서 나온
   횟수로도 함께 센다. 「눌렀을 때 뜻이 따라올 확률」에 가까운 것은 이쪽이다. */
const covered = [...corpus].filter((w) => seen.has(w));
const total = [...tally.values()].reduce((a, b) => a + b, 0);
const hit = [...tally.entries()].filter(([w]) => seen.has(w)).reduce((a, [, n]) => a + n, 0);
console.log(`표제어 ${rows.length}개 · 찾을 수 있는 꼴 ${seen.size}개`);
console.log(`지문의 낱말 ${corpus.size}가지 가운데 ${covered.length}가지 (${Math.round((covered.length / corpus.size) * 100)}%)`);
console.log(`나온 횟수로 세면 ${total}번 가운데 ${hit}번 (${Math.round((hit / total) * 100)}%)`);

if (note.length) {
  console.log('\n짚어 둘 것');
  note.forEach((m) => console.log('  · ' + m));
}
if (bad.length) {
  console.log('\n고쳐야 할 것');
  bad.forEach((m) => console.log('  ✗ ' + m));
  process.exit(1);
}
console.log('\n이상 없음');
