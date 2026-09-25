/* EPS-TOPIK 연습 문항(eps.js) 검사.   node tools/check-eps.mjs
   docs/antigravity-eps-task.md 의 규칙을 기계로 본다. CI 도 돈다. */
import { EPS_ITEMS, EPS_TYPES, EPS_TOPICS } from '../eps.js';

const err = [], warn = [];
const ids = new Set(), qs = new Map();
const HANGUL = /[가-힣]/;
for (const it of EPS_ITEMS) {
  const at = it.id ?? '(id 없음)';
  const pre = it.sec === 'reading' ? 'eps-r-' : it.sec === 'listening' ? 'eps-l-' : null;
  if (!pre) { err.push(`${at} — sec 는 reading · listening`); continue; }
  if (!new RegExp(`^${pre}\\d{3}$`).test(it.id ?? '')) err.push(`${at} — id 는 ${pre}001 모양`);
  if (ids.has(it.id)) err.push(`${at} — id 가 겹친다`);
  ids.add(it.id);
  if (!EPS_TYPES[it.sec][it.type]) err.push(`${at} — type ${it.type} 은 ${it.sec} 에 없다 (${Object.keys(EPS_TYPES[it.sec]).join(' · ')})`);
  if (!EPS_TOPICS.includes(it.topic)) err.push(`${at} — topic 은 ${EPS_TOPICS.join(' · ')}`);
  if (!it.question || !HANGUL.test(it.question)) err.push(`${at} — question 이 비었다`);
  if (!Array.isArray(it.options) || it.options.length !== 4) err.push(`${at} — options 는 꼭 넷`);
  else {
    if (new Set(it.options.map((o) => String(o).trim())).size !== 4) err.push(`${at} — 보기가 겹친다`);
    if (it.options.some((o) => !String(o).trim())) err.push(`${at} — 빈 보기가 있다`);
  }
  if (!(Number.isInteger(it.answer) && it.answer >= 0 && it.answer <= 3)) err.push(`${at} — answer 는 0~3`);
  if (!it.why || !HANGUL.test(it.why)) err.push(`${at} — why(한국어 해설)가 없다`);
  if (!it.why_en || HANGUL.test(it.why_en.replace(/「[^」]*」|'[^']*'|"[^"]*"/g, ''))) err.push(`${at} — why_en(영어 해설)이 없거나 따옴표 밖에 한글이 있다`);
  if (it.sec === 'listening') {
    if (!Array.isArray(it.script) || !it.script.length) err.push(`${at} — 듣기는 script 가 있어야`);
    if (it.passage) err.push(`${at} — 듣기에 passage 를 두지 않는다(보이면 읽기가 된다)`);
  } else if (it.script) err.push(`${at} — 읽기에 script 를 두지 않는다`);
  if ((it.type === 'vocab' || it.type === 'pic') && !it.pic) err.push(`${at} — 그림 문항은 pic(이모지)이 있어야`);
  if (JSON.stringify(it).includes('\\\\n')) err.push(`${at} — 글자 그대로의 \\n`);
  const key = `${it.sec}|${it.question}|${(it.passage ?? '') + (it.script ?? []).join('')}|${it.pic ?? ''}`;
  if (qs.has(key)) err.push(`${at} — ${qs.get(key)} 와 같은 문항`);
  qs.set(key, it.id);
}
const n = (sec) => EPS_ITEMS.filter((x) => x.sec === sec).length;
const pos = [0, 0, 0, 0]; EPS_ITEMS.forEach((x) => { if (x.answer >= 0 && x.answer <= 3) pos[x.answer]++; });
if (EPS_ITEMS.length >= 20 && Math.max(...pos) > EPS_ITEMS.length * 0.4) warn.push(`정답 자리가 한쪽으로 몰렸다 (①${pos[0]} ②${pos[1]} ③${pos[2]} ④${pos[3]})`);
console.log(`EPS ${EPS_ITEMS.length}문항 — 읽기 ${n('reading')} · 듣기 ${n('listening')}`);
if (warn.length) console.log(`\n짚어 둘 것\n  · ` + warn.join('\n  · '));
if (err.length) { console.error(`\n고쳐야 할 것 ${err.length}건\n  ✗ ` + err.join('\n  ✗ ')); process.exit(1); }
console.log('\n이상 없음');
