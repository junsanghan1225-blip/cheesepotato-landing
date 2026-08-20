/* 시험 지문에 나오는 낱말을 자주 나온 차례로 뽑는다.
 *
 *   node tools/glossary-words.mjs [개수]
 *
 * 뜻풀이를 채울 차례를 정하는 데 쓴다. 학습자가 어떤 낱말을 모를지는 알 수
 * 없지만, **우리 지문에 없는 낱말은 눌릴 일이 없다.** 그러니 채울 곳은
 * 여기서 나온 것뿐이고, 자주 나오는 것부터 채우면 같은 품으로 더 많이 닿는다.
 *
 * 이미 docs/glossary.json 에 있는 것은 뺀다 — 두 번 시키지 않기 위해서다.
 *
 * 조사는 떼고 센다. 「아침」「아침을」「아침에」를 따로 세면 목록이 세 배로
 * 불어나는데 뜻은 하나다. 다만 용언(먹었어요 → 먹다)까지는 손대지 않는다.
 * 규칙으로 되는 일이 아니라, 어설프게 자르면 없는 말이 만들어진다.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TOPIK_READING } from '../topik.js';
import { TOPIK2_READING } from '../topik2.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const want = Number(process.argv[2]) || 300;

/* 문제지의 상투어. 지문이 아니라 문제를 싸는 말이라 뜻풀이를 붙여도
   학습자가 단어장에 담을 일이 없다. */
const BOILER = new Set([
  '것을', '고르십시오', '가장', '알맞은', '다음', '다음을', '글의', '들어갈',
  '말로', '내용과', '무엇', '무엇에', '대한', '것', '것이', '것은',
  '중심', '내용', '순서대로', '나열한', '밑줄', '부분', '의미가', '비슷한',
  '주제로', '관계있는', '같은', '심정으로', '태도로', '읽고', '물음에',
  '답하십시오', '알', '수', '있는',
]);

/* 조사. 긴 것부터 떼야 「에서」가 「에」+「서」로 잘리지 않는다. */
const JOSA = ['으로부터', '에서부터', '이라고', '라고는', '에게서', '한테서', '으로는', '까지도',
  '에서는', '에서도', '이라는', '라는', '으로', '에게', '한테', '까지', '부터', '보다', '처럼',
  '마다', '조차', '밖에', '뿐만', '이나', '나마', '든지', '라도', '이란', '에는', '에도', '에서',
  '와는', '과는', '으론', '들이', '들을', '들은', '들의',
  '은', '는', '이', '가', '을', '를', '의', '에', '도', '만', '과', '와', '로', '야', '아', '여'];

const strip = (w) => {
  for (const j of JOSA) {
    if (w.length > j.length + 1 && w.endsWith(j)) return w.slice(0, -j.length);
  }
  return w;
};

let known = new Set();
try {
  known = new Set(JSON.parse(readFileSync(join(ROOT, 'docs/glossary.json'), 'utf8'))
    .flatMap((e) => [e.ko, ...(e.alt || [])]));
} catch (e) { /* 아직 없으면 전부가 후보다 */ }

const freq = new Map();
const where = new Map();   // 처음 만난 문장. 뜻을 고를 때 맥락이 있어야 한다.

for (const q of [...TOPIK_READING, ...TOPIK2_READING]) {
  const text = [q.passage, q.sentence, ...(q.options || [])].filter(Boolean).join('\n');
  for (const raw of text.split(/\s+/)) {
    const w = strip(raw.replace(/[^가-힣]/g, ''));
    if (w.length < 2 || BOILER.has(w) || known.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
    if (!where.has(w)) {
      const line = text.split('\n').find((l) => l.includes(raw)) || '';
      where.set(w, line.trim().slice(0, 90));
    }
  }
}

const rows = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, want);
console.error(`후보 ${freq.size}개 가운데 위에서 ${rows.length}개 — 이미 채운 것 ${known.size}개는 뺐다.`);
rows.forEach(([w, n]) => console.log(`${w}\t${n}\t${where.get(w)}`));
