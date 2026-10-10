// 사자성어 · 속담 · 관용 표현 자료(vocab/data/expressions.json) 검사 — docs/antigravity/antigravity-expressions-task.md 의 모양.
// 안티 그래비티가 올린 묶음을 Claude 가 넣기 전에, CI 에서도 돈다. 빈 배열이면 통과.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const X = read('vocab/data/expressions.json');
const TAX = read('vocab/taxonomy.json');
const TOPICS = new Set(TAX.topics.flatMap((t) => t.subs.map((s) => `${t.id}/${s.id}`)));
const HEADS = new Set([...read('vocab/data/topik1.json'), ...read('vocab/data/topik2.json')].map((w) => w.head));
const SIT = new Set(['praise', 'advice', 'warning', 'comfort', 'criticism', 'effort', 'luck', 'relationship', 'money', 'work', 'study', 'time', 'speech', 'emotion', 'situation', 'news']);
const PRE = { idiom4: 'x4-', proverb: 'xp-', idiom: 'xi-' };
const err = [];
const ids = new Set(), heads = new Set();
X.forEach((x, i) => {
  const at = `${i + 1}번째(${x.id || '?'} ${x.head || ''})`;
  const bad = (m) => err.push(`${at}: ${m}`);
  if (!PRE[x.type]) bad(`type 은 idiom4 · proverb · idiom`);
  if (!/^x[4pi]-\d{3}$/.test(x.id || '') || (PRE[x.type] && !x.id.startsWith(PRE[x.type]))) bad('id 모양(x4-001 · xp-001 · xi-001)');
  if (ids.has(x.id)) bad('id 겹침'); ids.add(x.id);
  if (!x.head) bad('head 비었음'); if (heads.has(x.head)) bad('head 겹침'); heads.add(x.head);
  if (x.type === 'idiom4') {
    if ([...(x.head || '')].length !== 4) bad('사자성어는 네 글자');
    if ([...(x.hanja || '')].length !== 4) bad('hanja 네 글자');
    if (!Array.isArray(x.hanja_each) || x.hanja_each.length !== 4) bad('hanja_each 네 개');
  } else if (x.hanja) bad('속담 · 관용 표현은 hanja 비움');
  for (const k of ['literal', 'meaning', 'en']) if (!String(x[k] || '').trim()) bad(`${k} 비었음`);
  if (!(x.lv >= 3 && x.lv <= 7)) bad('lv 는 3~7');
  if (typeof x.topik !== 'boolean') bad('topik 은 true/false');
  if (!Array.isArray(x.topics) || !x.topics.length || x.topics.length > 3) bad('topics 1~3개');
  for (const t of x.topics || []) if (!TOPICS.has(t)) bad(`없는 주제 ${t}`);
  if (!Array.isArray(x.situations) || !x.situations.length || x.situations.length > 3) bad('situations 1~3개');
  for (const s of x.situations || []) if (!SIT.has(s)) bad(`없는 상황 ${s}`);
  if (!['formal', 'neutral', 'casual'].includes(x.tone)) bad('tone 은 formal · neutral · casual');
  if (!Array.isArray(x.examples) || x.examples.length !== 2 || x.examples.some((e) => !Array.isArray(e) || !e[0] || !e[1])) bad('examples 2개 [한국어, 영어]');
  for (const w of x.words || []) if (!HEADS.has(w)) bad(`words 의 「${w}」 는 낱말 자료에 없음`);
  if (x.rel && (!Array.isArray(x.rel.syn) || !Array.isArray(x.rel.ant))) bad('rel 은 { syn: [], ant: [] }');
});
if (err.length) { console.error(`표현 자료 문제 ${err.length}곳\n` + err.slice(0, 60).join('\n')); process.exit(1); }
const by = (t) => X.filter((x) => x.type === t).length;
console.log(`표현 ${X.length}개 — 사자성어 ${by('idiom4')} · 속담 ${by('proverb')} · 관용 ${by('idiom')} — 맞다.`);
