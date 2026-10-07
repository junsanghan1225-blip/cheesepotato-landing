/* 레벨테스트 문제 검사.  node tools/check-leveltest.mjs
   계단식 판정은 한 레벨을 두세 번 물어야 경계를 찾는다. 문제 모양이 틀리거나
   레벨마다 수가 모자라면 판정이 흔들린다 — 그걸 여기서 막는다.
   (「정답이 둘인 문제」는 기계가 못 가린다. 사람이 눈으로 볼 것.) */
import { LT_CUSTOM_OVERALL } from '../leveltest-overall.js';
import { LT_CUSTOM_WRITING } from '../leveltest-writing.js';
import { SB_CATS } from '../sentences.js';
/* 문법 꼬리표 g — 결과지 「다시 볼 것」이 틀린 문제를 그 문법 쪽(#learn/sentence/<id>)에 잇는다(2026-10-05). 있으면 진짜 id 여야 한다. */
const GIDS = new Set(SB_CATS.flatMap((c) => c.points.map((p) => p.id)));

const SETS = [
  /* need — 레벨마다 이만큼은 있어야 다시 봐도 다른 문제가 나온다(운영자 결정 2026-10-05: 30). 모자라면 짚기만 한다. */
  { name: '전체 · 문법(overall)', items: LT_CUSTOM_OVERALL, levels: [0, 1, 2, 3, 4, 5, 6, 7], need: 30 },
  { name: '쓰기(writing)', items: LT_CUSTOM_WRITING, levels: [2, 3, 4, 5, 6, 7], need: 30 },
];
/* 문제 종류(운영자 2026-10-07 「다 문법만 나온다」) — 없으면 grammar. 레벨테스트가 바로 앞 두 문제와 다른 종류를 먼저 낸다. */
const TYPES = new Set(['grammar', 'vocab', 'reply', 'situation', 'meaning', 'connect', 'read', 'wrong', 'honor', 'conj']);
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
    if (x.t != null && !TYPES.has(x.t)) bad.push(`${at}: t 「${x.t}」 는 정해진 종류가 아니다`);
    if (x.g != null && !GIDS.has(String(x.g))) bad.push(`${at}: g 「${x.g}」 는 예문 만들기에 없는 문법 id 다`);
    if (JSON.stringify(x).includes('\\\\n')) bad.push(`${at}: 줄바꿈 대신 「\\n」 두 글자가 있다`);
    const key = (x.passage || '') + '|' + x.q;
    if (seen.has(key)) bad.push(`${at}: 같은 문제가 또 있다`);
    seen.add(key);
    count[x.lv] = (count[x.lv] || 0) + 1;
  });
  const row = levels.map((L) => `L${L} ${count[L] || 0}`).join(' · ');
  const noG = items.filter((x) => x.g == null && x.lv > 0).length;
  console.log(`${name} ${items.length}문제 — ${row} · 문법 꼬리표 없음 ${noG}`);
  const kinds = {};
  items.forEach((x) => { kinds[x.t || 'grammar'] = (kinds[x.t || 'grammar'] || 0) + 1; });
  console.log(`  종류: ${Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(' · ')}`);
  const short = levels.filter((L) => (count[L] || 0) < need);
  if (short.length) note.push(`${name}: 레벨마다 ${need}문제 밑 — ${short.map((L) => `L${L}(${count[L] || 0})`).join(' ')}`);
}
if (note.length) { console.log('\n짚어 둘 것'); for (const n of note) console.log('  ·', n); }
if (bad.length) { console.error(`\n고쳐야 할 것 ${bad.length}개`); for (const b of bad) console.error('  ✗', b); process.exit(1); }
console.log('\n이상 없음');
