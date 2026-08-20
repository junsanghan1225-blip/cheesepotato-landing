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
import { GLOSSARY } from '../glossary.js';
import { glossFind } from '../gloss-find.js';

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
    /* only 는 뜻이 아니라 표시다 — 「사전이 이 낱말에 단 뜻은 딴말이니
       언어팩에서도 빼라」는 뜻. build-glossary.mjs 를 볼 것. */
    if (k === 'only') { if (v !== true) at('only 는 true 로만 적는다'); continue; }
    if (typeof v !== 'string' || !v.trim()) at(`${k} 가 비었다`);
    else if (v.length > 60) note.push(`${e.ko} — ${k} 뜻이 길다(${v.length}자). 단어장 한 줄에 안 들어간다`);
    /* 뜻에 한국어를 적어 두면 영어 칸인데 한국어가 나간다.
       괄호 안은 뺀다 — 「(in -ㄹ 수 있다) can」처럼 **어느 자리에 쓰는
       말인지** 밝히려면 그 꼴을 한글로 적는 수밖에 없다. 「수」의 뜻을
       한국어 없이 적으면 무슨 말인지 알 수 없는 줄이 된다. */
    if (k === 'en' && /[가-힣]/.test(String(v).replace(/\([^)]*\)/g, ''))) at('en 에 한글이 섞였다 (괄호 밖)');
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
    /* (가)(나)(다)(라) 는 문단 번호다. 화면도 이것은 안 집는다(TQ_MARKER).
       여기서 안 빼면 「다」가 스무 번 나오는 낱말로 잡혀 목록 맨 위에 앉는다. */
    if (/^([(（[［〔<〈【{][0-9A-Za-z가-힣][)）\]］〕>〉】}][-–—→,\s]*)+$/.test(w)) return;
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
/* **화면이 실제로 하는 대로 센다.** 여기가 한 번 크게 틀렸던 자리다.
   앞머리만 맞아도 닿은 것으로 세었더니 99% 가 나왔는데, 화면은 그때
   정확히 일치하는 것만 찾고 있어서 실제로는 47% 였다. 그래서 지금은
   화면과 같은 gloss-find.js 를 그대로 불러 쓴다 — 재는 쪽과 하는 쪽이
   갈라지면 숫자가 위로를 하지 일을 하지 않는다. */
const inDict = (k) => Object.prototype.hasOwnProperty.call(GLOSSARY, k);
const reach = (w) => !!glossFind(inDict, w);

const covered = [...corpus].filter(reach);
const total = [...tally.values()].reduce((a, b) => a + b, 0);
const hit = [...tally.entries()].filter(([w]) => reach(w)).reduce((a, [, n]) => a + n, 0);
console.log(`우리가 쓴 표제어 ${rows.length}개 · 찾을 수 있는 꼴 ${Object.keys(GLOSSARY).length}개`);
console.log(`지문의 낱말 ${corpus.size}가지 가운데 ${covered.length}가지 (${Math.round((covered.length / corpus.size) * 100)}%)`);
console.log(`나온 횟수로 세면 ${total}번 가운데 ${hit}번 (${Math.round((hit / total) * 100)}%)`);

/* 못 찾는 것을 자주 나오는 차례로 보여 준다. 다음에 무엇을 적을지 정하는
   자리다 — 한 번 나오는 말 천 개보다 스무 번 나오는 말 하나가 낫다. */
const miss = [...tally.entries()].filter(([w]) => !reach(w)).sort((a, b) => b[1] - a[1]);
if (miss.length) {
  note.push(`못 찾는 것 ${miss.length}가지 가운데 자주 나오는 것: ` +
    miss.slice(0, 15).map(([w, n]) => `${w}(${n})`).join(' · '));
}

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
