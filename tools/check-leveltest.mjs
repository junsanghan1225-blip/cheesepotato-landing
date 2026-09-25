/* 레벨테스트 문제 검사.  node tools/check-leveltest.mjs
   계단식 판정은 한 레벨을 두세 번 물어야 경계를 찾는다. 문제 모양이 틀리거나
   레벨마다 수가 모자라면 판정이 흔들린다 — 그걸 여기서 막는다.
   (「정답이 둘인 문제」는 기계가 못 가린다. 사람이 눈으로 볼 것.) */
import { LT_CUSTOM_OVERALL } from '../leveltest-overall.js';
import { LT_CUSTOM_WRITING } from '../leveltest-writing.js';

const SETS = [
  { name: '전체(overall)', items: LT_CUSTOM_OVERALL, levels: [0, 1, 2, 3, 4, 5, 6, 7], need: 8 },
  { name: '쓰기(writing)', items: LT_CUSTOM_WRITING, levels: [2, 3, 4, 5, 6, 7], need: 6 },
];
const bad = [], note = [];
for (const { name, items, levels, need } of SETS) {
  const seen = new Set(), count = {};
  items.forEach((x, i) => {
    const at = `${name} ${i + 1}번째(${String(x.q || '').slice(0, 20)}…)`;
    if (!Number.isInteger(x.lv) || x.lv < 0 || x.lv > 7) bad.push(`${at}: lv 가 0~7 정수가 아니다 (${x.lv})`);
    if (!x.q) bad.push(`${at}: q 가 없다`);
    if (!Array.isArray(x.options) || x.options.length !== 4) bad.push(`${at}: 보기가 4개가 아니다`);
    else if (new Set(x.options).size !== 4) bad.push(`${at}: 보기가 겹친다`);
    if (!(Number.isInteger(x.answer) && x.answer >= 0 && x.answer < 4)) bad.push(`${at}: answer 가 0~3 이 아니다`);
    if (!x.why) bad.push(`${at}: why 가 없다`);
    if (JSON.stringify(x).includes('\\\\n')) bad.push(`${at}: 줄바꿈 대신 「\\n」 두 글자가 있다`);
    const key = (x.passage || '') + '|' + x.q;
    if (seen.has(key)) bad.push(`${at}: 같은 문제가 또 있다`);
    seen.add(key);
    count[x.lv] = (count[x.lv] || 0) + 1;
  });
  const row = levels.map((L) => `L${L} ${count[L] || 0}`).join(' · ');
  console.log(`${name} ${items.length}문제 — ${row}`);
  const short = levels.filter((L) => (count[L] || 0) < need);
  if (short.length) note.push(`${name}: 레벨마다 ${need}문제 밑 — ${short.map((L) => `L${L}(${count[L] || 0})`).join(' ')}`);
}
if (note.length) { console.log('\n짚어 둘 것'); for (const n of note) console.log('  ·', n); }
if (bad.length) { console.error(`\n고쳐야 할 것 ${bad.length}개`); for (const b of bad) console.error('  ✗', b); process.exit(1); }
console.log('\n이상 없음');
