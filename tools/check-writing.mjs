/* TOPIK 쓰기 문항(topik-writing.js) 검사.
     node tools/check-writing.mjs
   안티 그래비티가 문항을 늘릴 때(docs/antigravity-topik-writing-more-task.md) 돌린다. CI 도 돈다.
   AI 채점(grade-writing)이 이 칸들을 그대로 채점 기준으로 쓰므로, 빠지거나 틀리면 채점이 틀린다. */
import { TW_ITEMS } from '../topik-writing.js';

const err = [], warn = [];
const ids = new Set();
const HANGUL = /[가-힣]/;
const cnt = (s) => String(s ?? '').replace(/[\r\n]/g, '').length;
for (const it of TW_ITEMS) {
  const at = it.id ?? '(id 없음)';
  if (!/^w5[1-4]-\d+$/.test(it.id ?? '')) err.push(`${at} — id 는 w51-1 모양`);
  if (ids.has(it.id)) err.push(`${at} — id 가 겹친다`);
  ids.add(it.id);
  if (![51, 52, 53, 54].includes(it.q)) err.push(`${at} — q 는 51~54`);
  if (it.id && Number(it.id.slice(1, 3)) !== it.q) err.push(`${at} — id 의 번호와 q 가 다르다`);
  if (!['formal', 'plain', 'polite'].includes(it.register)) err.push(`${at} — register 는 formal · plain · polite`);
  for (const k of ['title', 'passage', 'cond']) if (!it[k] || !HANGUL.test(it[k])) err.push(`${at} — ${k} 가 비었다`);
  if (!Array.isArray(it.deduct) || it.deduct.length < 2) err.push(`${at} — deduct(흔한 감점)가 둘 이상 있어야 한다`);
  if (/\\n/.test(JSON.stringify(it).replace(/\\\\n/g, ''))) { /* JSON 안의 줄바꿈은 정상 */ }
  if (JSON.stringify(it).includes('\\\\n')) err.push(`${at} — 글자 그대로의 \\n 이 들어갔다(줄바꿈이 아니라 역슬래시+n)`);

  if (it.q === 51 || it.q === 52) {
    if (!Array.isArray(it.blanks) || it.blanks.length !== 2) { err.push(`${at} — 51·52 는 blanks 가 둘`); continue; }
    it.blanks.forEach((b, i) => {
      if (b.mark !== ['㉠', '㉡'][i]) err.push(`${at} — blanks[${i}].mark 는 ${['㉠', '㉡'][i]}`);
      if (!it.passage.includes(`( ${b.mark} )`)) err.push(`${at} — 지문에 「( ${b.mark} )」 자리가 없다`);
      if (!Array.isArray(b.answers) || b.answers.length < 2) err.push(`${at} — ${b.mark} 모범답안이 둘 이상`);
      if (!b.point) err.push(`${at} — ${b.mark} point 가 없다`);
    });
  } else {
    const [lo, hi] = it.q === 53 ? [200, 300] : [600, 700];
    if (it.min !== lo || it.max !== hi) err.push(`${at} — ${it.q}번 분량은 min ${lo} · max ${hi}`);
    if (!Array.isArray(it.tasks) || it.tasks.length < 2) err.push(`${at} — tasks(세부 과제)가 둘 이상`);
    if (it.q === 53 && (!Array.isArray(it.data) || it.data.length < 3)) err.push(`${at} — 53번은 data(자료)가 셋 이상`);
    for (const k of ['content', 'structure', 'language']) if (!it.points?.[k]) err.push(`${at} — points.${k} 가 없다`);
    const n = cnt(it.model);
    if (!it.model) err.push(`${at} — model(모범답안)이 없다`);
    else if (n < lo || n > hi) err.push(`${at} — 모범답안이 ${n}자 (${lo}~${hi} 이어야)`);
    const max = it.q === 53 ? 30 : 50;
    const sm = it.samples ?? [];
    if (!sm.length) warn.push(`${at} — samples(상·중·하 예시 답안)가 없다 — AI 채점이 눈높이를 못 맞춘다`);
    else if (sm.length < 3) warn.push(`${at} — samples 가 ${sm.map((x) => x.level).join("·")} 뿐이다 — 상·중·하 셋을 채울 것`);
    const levels = sm.map((s) => s.level).join('');
    if (sm.length >= 3 && levels !== '상중하') err.push(`${at} — samples 는 상 · 중 · 하 차례`);
    sm.forEach((s) => {
      if (!(s.total >= 0 && s.total <= max)) err.push(`${at} — 예시 ${s.level} 점수 ${s.total} 가 0~${max} 밖`);
      if (!s.text || !s.why) err.push(`${at} — 예시 ${s.level} 에 text · why 가 있어야`);
    });
    if (sm.length >= 3 && !(sm[0].total > sm[1].total && sm[1].total > sm[2].total)) err.push(`${at} — 예시 점수가 상 > 중 > 하 가 아니다`);
    if (it.register === 'plain' && /습니다|해요[.\s]/.test(it.model ?? '')) warn.push(`${at} — -(느)ㄴ다체 문항인데 모범답안에 -습니다/-해요가 보인다`);
  }
}
const by = {}; for (const it of TW_ITEMS) by[it.q] = (by[it.q] || 0) + 1;
console.log(`쓰기 ${TW_ITEMS.length}문항 — ${[51, 52, 53, 54].map((q) => `${q}번 ${by[q] || 0}`).join(' · ')}`);
if (warn.length) console.log(`\n짚어 둘 것 ${warn.length}건\n  · ` + warn.join('\n  · '));
if (err.length) { console.error(`\n고쳐야 할 것 ${err.length}건\n  ✗ ` + err.join('\n  ✗ ')); process.exit(1); }
console.log('\n이상 없음');
