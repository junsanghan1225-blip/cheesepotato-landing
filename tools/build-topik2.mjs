/* docs/topik2-all50.json → topik2.js
 *
 *   node tools/build-topik2.mjs
 *
 * 사람이 검토한 자료는 docs/topik2-all50.json 이고, 화면이 읽는 것은
 * topik2.js 다. **topik2.js 는 손으로 고치지 않는다** — 고칠 일이 있으면
 * JSON 을 고치고 이것을 다시 돌린다.
 *
 * 굳이 갈라 둔 까닭 — JSON 은 check-topik2 가 보는 자리이고, 브라우저는
 * import assertion 없이 JSON 을 못 읽는다. 이 사이트는 빌드 단계가 없으므로
 * 자료를 .js 로 내어 두어야 esm 으로 그냥 불러올 수 있다.
 *
 * 자료 모양도 여기서 맞춘다. TOPIK II 자료는 난이도를 level 로 적었는데
 * 화면과 TOPIK I 은 grade 로 읽는다. 이름이 둘이면 화면 쪽에서 exam 마다
 * 다른 칸을 봐야 하므로 여기서 grade 로 옮긴다.
 */
import { readFileSync, writeFileSync } from 'node:fs';

/* 설계표. docs/topik2-blueprint.md 의 표와 같아야 한다.
   [시작, 끝, type, genre, 한글 이름, 영어 이름, 묶음] */
const BLUEPRINT = [
  [1, 2, 'blank', '서술문', '빈칸에 알맞은 말', 'Fill in the blank'],
  [3, 4, 'paraphrase', '서술문', '비슷한 말 고르기', 'Pick the closest meaning'],
  [5, 8, 'theme', '광고', '무엇에 대한 글', 'What the text is about'],
  [9, 12, 'detail', '실용문', '일치하는 내용', 'Which matches'],
  [13, 15, 'order', '설명문', '순서 배열', 'Put in order'],
  [16, 18, 'blank', '설명문', '빈칸에 알맞은 말', 'Fill in the blank'],
  [19, 19, 'blank', '설명문', '빈칸에 알맞은 말', 'Fill in the blank', '19-20'],
  [20, 20, 'main', '설명문', '중심 내용', 'Main idea', '19-20'],
  [21, 21, 'blank', '서술문', '빈칸에 알맞은 말', 'Fill in the blank', '21-22'],
  [22, 22, 'detail', '서술문', '일치하는 내용', 'Which matches', '21-22'],
  [23, 23, 'feeling', '수필', '인물의 심정', 'How the character feels', '23-24'],
  [24, 24, 'detail', '수필', '일치하는 내용', 'Which matches', '23-24'],
  [25, 27, 'headline', '신문기사', '기사 제목 풀이', 'Explaining a headline'],
  [28, 31, 'blank', '설명문', '빈칸에 알맞은 말', 'Fill in the blank'],
  [32, 34, 'detail', '설명문', '일치하는 내용', 'Which matches'],
  [35, 38, 'main', '설명문', '중심 내용', 'Main idea'],
  [39, 41, 'insert', '설명문', '문장이 들어갈 자리', 'Where the sentence goes'],
  [42, 42, 'feeling', '소설', '인물의 심정', 'How the character feels', '42-43'],
  [43, 43, 'detail', '소설', '일치하는 내용', 'Which matches', '42-43'],
  [44, 44, 'blank', '설명문', '빈칸에 알맞은 말', 'Fill in the blank', '44-45'],
  [45, 45, 'main', '설명문', '중심 내용', 'Main idea', '44-45'],
  [46, 46, 'attitude', '논설문', '필자의 태도', "The writer's stance", '46-47'],
  [47, 47, 'detail', '논설문', '일치하는 내용', 'Which matches', '46-47'],
  [48, 48, 'intent', '논설문', '글을 쓴 목적', 'Why it was written', '48-50'],
  [49, 49, 'blank', '논설문', '빈칸에 알맞은 말', 'Fill in the blank', '48-50'],
  [50, 50, 'detail', '논설문', '일치하는 내용', 'Which matches', '48-50'],
];

/* 회차 파일을 모두 읽어 합친다. 자리(slot)는 회차가 달라도 그대로라 한
   자리에 여러 벌이 쌓이고, 모의고사는 자리마다 그 가운데 하나씩 뽑는다.
   ROUNDS 에 이름만 더하면 회차가 는다 — 없는 파일은 조용히 건너뛴다. */
const ROUNDS = ['topik2-all50.json', 'topik2-round2.json', 'topik2-round3.json', 'topik2-round4.json'];
const rows = [];
const loaded = [];
for (const name of ROUNDS) {
  let text;
  try { text = readFileSync(new URL(`../docs/${name}`, import.meta.url), 'utf8'); }
  catch (e) { continue; }
  const part = JSON.parse(text);
  rows.push(...part);
  loaded.push(`${name} ${part.length}문항`);
}
if (!rows.length) { console.error('읽을 회차 파일이 없다.'); process.exit(1); }

/* id 가 겹치면 뒤의 것이 앞의 것을 조용히 가린다. 회차를 더할 때 id 를
   이어 매기는 것을 잊는 것이 제일 흔한 실수라 여기서 멈춘다. */
const dup = rows.map((q) => q.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dup.length) {
  console.error(`id 가 겹친다: ${[...new Set(dup)].join(', ')}`);
  console.error('회차마다 id 를 이어서 매길 것 — 2회차는 t2-051 부터다.');
  process.exit(1);
}

/* 화면이 읽는 차례대로 칸을 세운다. 없는 칸은 넣지 않는다 —
   sentence 와 mark 는 그 유형에만 붙는다. */
const KEYS = ['id', 'exam', 'grade', 'slot', 'type', 'genre', 'pair', 'topic',
              'sentence', 'mark', 'passage', 'question', 'options', 'answer', 'why'];

const out = rows
  .slice()
  .sort((a, b) => a.slot - b.slot || String(a.id).localeCompare(b.id))
  .map((q) => {
    const o = { ...q, grade: q.level };
    delete o.level;
    const kept = {};
    for (const k of KEYS) if (o[k] !== undefined && o[k] !== null) kept[k] = o[k];
    return kept;
  });

const bp = BLUEPRINT.map(([from, to, type, genre, ko, en, pair]) => {
  const o = { from, to, type, genre, ko, en };
  if (pair) o.pair = pair;
  return o;
});

/* 설계표가 덮는 자리와 자료가 가진 자리가 어긋나면 여기서 멈춘다.
   어긋난 채로 내보내면 화면에서 「모의고사 준비 중」이 되어, 왜 안 뜨는지
   찾느라 한참 걸린다. */
const want = new Set();
bp.forEach((b) => { for (let n = b.from; n <= b.to; n++) want.add(n); });
const have = new Set(out.map((q) => q.slot));
const missing = [...want].filter((n) => !have.has(n));
if (missing.length) {
  console.error(`설계표가 덮는 자리 가운데 자료가 없는 곳: ${missing.join(', ')}`);
  process.exit(1);
}

const j = (v) => JSON.stringify(v, null, 1).replace(/\n/g, '\n  ');
const body = `/* TOPIK II 읽기 — 생성물. 손으로 고치지 말 것.
 *
 *   고칠 때: docs/topik2-all50.json 을 고치고
 *            node tools/build-topik2.mjs 를 다시 돌린다.
 *
 * 자리는 1~50 번이다. TOPIK I 은 31~70 번이라 번호가 겹치므로(31~50)
 * exam 칸으로 가른다.
 *
 * 급수(grade 3~6)는 우리가 붙인 난이도 구간이다. 실제 TOPIK II 의 3~6급은
 * 총점으로 갈리고 문항마다 정해져 있지 않다. 화면에도 「3급 문제」가 아니라
 * 「3급 수준」으로 적어야 한다.
 */

export const TOPIK2_BLUEPRINT = ${j(bp)};

export const TOPIK2_SLOTS = TOPIK2_BLUEPRINT.flatMap((b) => {
  const rows = [];
  for (let n = b.from; n <= b.to; n++) rows.push({ ...b, n });
  return rows;
});

export const TOPIK2_READING = ${j(out)};
`;

writeFileSync(new URL('../topik2.js', import.meta.url), body);
const byType = {};
out.forEach((q) => { byType[q.type] = (byType[q.type] ?? 0) + 1; });
console.log(`읽은 회차: ${loaded.join(' · ')}`);
console.log(`topik2.js — 문항 ${out.length} · 자리 ${want.size} · 유형 ${Object.keys(byType).length}`);
console.log(Object.entries(byType).map(([k, v]) => `${k} ${v}`).join(' · '));
