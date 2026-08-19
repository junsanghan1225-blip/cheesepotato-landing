/* TOPIK II 문항을 받아 모양과 규칙을 본다.
 *
 *   node tools/check-topik2.mjs <파일.json>
 *
 * Gemini 가 만든 것을 사람이 눈으로 다 보기는 어렵다. 기계가 볼 수 있는 것은
 * 기계가 먼저 보고, 사람은 「정답이 정말 하나인가」에만 눈을 쓰게 한다.
 *
 * 정답 쏠림을 잡는 것이 이 도구의 큰 몫이다 — 만들다 보면 답을 자꾸 첫째
 * 자리에 두게 되는데, 그러면 지문을 안 읽고 ①만 찍어도 맞는 시험이 된다.
 */
import { readFileSync } from 'node:fs';

const TYPES = new Set([
  'theme', 'blank', 'nomatch', 'detail', 'order', 'main', 'insert', 'intent',
  'paraphrase', 'headline', 'feeling', 'attitude',
]);
const GENRES = new Set([
  '서술문', '실용문', '수필', '설명문', '매체담화',
  '광고', '도표', '신문기사', '논설문', '소설',
]);
/* 문항 번호가 어느 급수 구간인지. docs/topik2-blueprint.md 의 표와 같아야 한다. */
const levelOf = (slot) => (slot <= 12 ? 3 : slot <= 24 ? 4 : slot <= 41 ? 5 : 6);

const file = process.argv[2];
if (!file) { console.error('쓰기: node tools/check-topik2.mjs <파일.json>'); process.exit(2); }

let rows;
try {
  rows = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error('JSON 을 못 읽었다:', e.message);
  process.exit(2);
}
if (!Array.isArray(rows)) { console.error('배열이 아니다.'); process.exit(2); }

const bad = [];   // 고쳐야 넘어갈 수 없는 것
const note = [];  // 사람이 한 번 봐야 하는 것
const at = (q, msg) => bad.push(`${q.id ?? '?'} (slot ${q.slot ?? '?'}) — ${msg}`);

const ids = new Set();
const slots = new Map();

for (const q of rows) {
  if (!q.id) { bad.push('id 가 없는 문항이 있다'); continue; }
  if (ids.has(q.id)) at(q, 'id 가 겹친다');
  ids.add(q.id);

  if (q.exam !== 'II') at(q, `exam 이 "II" 가 아니다 (${q.exam})`);
  if (!Number.isInteger(q.slot) || q.slot < 1 || q.slot > 50) at(q, `slot 이 1~50 이 아니다 (${q.slot})`);
  else {
    if (!slots.has(q.slot)) slots.set(q.slot, []);
    slots.get(q.slot).push(q.id);
    if (q.level !== levelOf(q.slot)) at(q, `level 이 ${levelOf(q.slot)} 이어야 한다 (${q.level})`);
  }

  if (!TYPES.has(q.type)) at(q, `모르는 type (${q.type})`);
  if (!GENRES.has(q.genre)) at(q, `모르는 genre (${q.genre})`);
  if (!q.topic) at(q, 'topic 이 없다');
  if (!q.passage) at(q, 'passage 가 없다');
  if (!q.question) at(q, 'question 이 없다');
  if (!q.why) at(q, 'why 가 없다');

  if (!Array.isArray(q.options) || q.options.length !== 4) at(q, '선택지가 넷이 아니다');
  else {
    if (new Set(q.options).size !== 4) at(q, '선택지에 같은 것이 있다');
    if (q.options.some((o) => /^[①②③④]|^\s*[1-4][.)]/.test(String(o))))
      at(q, '선택지에 번호를 붙였다 — 번호는 화면이 붙인다');
  }
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3)
    at(q, `answer 가 0~3 이 아니다 (${q.answer})`);

  /* 해설이 선택지를 번호로 가리키면 안 된다. 화면에는 ①②③④ 로 나오는데
     0부터 세는 속내를 그대로 적으면 「0번」이 무엇인지 아무도 모른다. */
  if (/\b[0-9]\s*번/.test(String(q.why)))
    at(q, 'why 가 선택지를 번호로 가리킨다 — 내용을 그대로 적을 것');

  if (q.type === 'insert') {
    if (!q.sentence) at(q, 'insert 인데 sentence 가 없다');
    for (const m of ['㉠', '㉡', '㉢', '㉣'])
      if (!String(q.passage).includes(m)) at(q, `insert 인데 지문에 ${m} 이 없다`);
  }
  if (q.type === 'paraphrase' || q.type === 'feeling') {
    if (!q.mark) at(q, `${q.type} 인데 mark 가 없다`);
    else if (!String(q.passage).includes(q.mark))
      at(q, `mark 「${q.mark}」 가 지문에 글자 그대로 없다`);
  }
  if (q.type === 'blank' && !/\(\s*[\s　]*\)/.test(String(q.passage)))
    at(q, 'blank 인데 지문에 빈칸 괄호가 없다');

  /* 빈칸은 전각 공백으로 자리를 만든다. 실제 시험지가 그렇고, 반각 공백은
     글꼴에 따라 폭이 들쭉날쭉해 빈칸이 빈칸처럼 안 보인다. */
  if (String(q.passage).includes('(    )') || String(q.question).includes('(    )'))
    note.push(`${q.id} — 빈칸이 반각 공백이다. (　　　　) 로 바꿀 것`);

  /* 마크다운은 자료에 쓰지 않는다. 화면이 esc() 로만 지나가므로 별표가
     별표째로 나오고, 묶인 문항끼리 지문이 달라지는 원인이 되기도 한다. */
  if (/\*\*|__|~~/.test(String(q.passage)))
    at(q, '지문에 마크다운 강조가 섞였다 — 밑줄은 mark 칸이 맡는다');

  /* 만들다 흘린 영어 부스러기. 「( check  )에 들어갈 말」 같은 것이 실제로
     나왔다. TV·KTX 처럼 대문자로 쓰는 말은 지문에 정상으로 나오므로
     소문자만 본다. */
  for (const [k, v] of [['question', q.question], ['passage', q.passage]]) {
    const m = String(v ?? '').match(/[a-z]{3,}/);
    if (m) note.push(`${q.id} — ${k} 에 영어 「${m[0]}」 가 섞였다. 만들다 흘린 것인지 볼 것`);
  }

  if (typeof q.passage === 'string' && q.passage !== q.passage.trim())
    note.push(`${q.id} — 지문 앞뒤에 공백이 붙었다`);
}

/* 지문 하나를 나눠 쓰는 자리는 지문이 글자까지 같아야 한다. */
const byPair = new Map();
rows.filter((q) => q.pair).forEach((q) => {
  if (!byPair.has(q.pair)) byPair.set(q.pair, []);
  byPair.get(q.pair).push(q);
});
byPair.forEach((list, name) => {
  const [a, b] = [name.split('-')[0], name.split('-')[1]].map(Number);
  const want = b - a + 1;
  if (list.length !== want) bad.push(`pair ${name} — ${want}문항이어야 하는데 ${list.length}개다`);
  const p = new Set(list.map((q) => String(q.passage).replace(/\s+/g, '')));
  if (p.size > 1) bad.push(`pair ${name} — 묶인 문항의 지문이 서로 다르다`);
});

slots.forEach((list, n) => {
  if (list.length > 1) note.push(`slot ${n} 에 ${list.length}문항 (${list.join(', ')}) — 같은 자리 여러 벌은 정상`);
});

/* 정답 쏠림. 12문항이면 자리마다 3개가 고른 것이다. */
const dist = [0, 0, 0, 0];
rows.forEach((q) => { if (Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3) dist[q.answer]++; });
const most = Math.max(...dist);
const share = rows.length ? most / rows.length : 0;

console.log(`문항 ${rows.length}개`);
console.log(`정답 자리 ①${dist[0]} ②${dist[1]} ③${dist[2]} ④${dist[3]}`);
const byType = {};
rows.forEach((q) => { byType[q.type] = (byType[q.type] ?? 0) + 1; });
console.log('유형 ' + Object.entries(byType).map(([k, v]) => `${k} ${v}`).join(' · '));

if (share > 0.4 && rows.length >= 8) {
  bad.push(`정답이 한 자리에 쏠렸다 — ${rows.length}개 중 ${most}개가 같은 자리(${Math.round(share * 100)}%). ` +
           '지문을 안 읽고 찍어도 맞는 시험이 된다. 선택지 차례를 섞을 것');
}
/* 한 자리가 아예 비는 것도 쏠림만큼 나쁘다. 「④ 는 답이 아니다」를 배우면
   네 갈래가 셋으로 줄어든다. */
const empty = dist.map((n, i) => (n === 0 ? i : -1)).filter((i) => i >= 0);
if (empty.length && rows.length >= 8) {
  bad.push(`정답이 한 번도 안 나온 자리가 있다 — ${empty.map((i) => '①②③④'[i]).join(' ')}. ` +
           '네 자리에 고르게 흩을 것');
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
