#!/usr/bin/env node
/* 안티가 올린 TOPIK II 읽기 문항(docs/topik2-roundN.json)을 합치기 전에 더 꼼꼼히 거르는 도구(운영자 2026-11-02 「문항수가 많기 때문에 검수과정 더 꼼꼼히」).
   node tools/review-topik2-round.mjs docs/topik2-round6.json [--sheet 검수표.md]
   check-topik2 가 보는 모양 · 쏠림 말고 「이미 있는 문항과 같은가 · 번호마다 쏠렸나 · 정답이 눈에 띄는가」를 본다.
   끝에 사람이 읽을 검수표(--sheet)를 만든다: 걸린 문항 전부 + 번호마다 무작위 표본(기본 20%). 정답이 정말 하나인가는 사람 · 별도 풀이(눈검수)가 한다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--') && a !== args[args.indexOf('--sheet') + 1]);
const sheet = args.includes('--sheet') ? args[args.indexOf('--sheet') + 1] : '';
if (!file) { console.error('쓰는 법: node tools/review-topik2-round.mjs docs/topik2-roundN.json [--sheet 검수표.md]'); process.exit(2); }
const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
const old = [];
for (const f of ['topik2-all50.json', 'topik2-round2.json', 'topik2-round3.json', 'topik2-round4.json', 'topik2-round5.json', ...fs.readdirSync(path.join(ROOT, 'docs')).filter((x) => /^topik2-round\d+[a-z]?\.json$/.test(x) && path.join(ROOT, 'docs', x) !== path.resolve(file))]) {
  const p = path.join(ROOT, 'docs', f); if (f !== path.basename(file) && fs.existsSync(p) && !old.some((o) => o.__f === f)) { const a = JSON.parse(fs.readFileSync(p, 'utf8')); a.forEach((q) => { q.__f = f; }); old.push(...a); }
}
const flags = new Map(); const flag = (q, why) => { if (!flags.has(q.id)) flags.set(q.id, []); flags.get(q.id).push(why); };
const norm = (s) => String(s).replace(/[\s　\n.,!?()'"「」·\-~]/g, '');
const sh = (s) => { const t = norm(s), set = new Set(); for (let i = 0; i + 4 <= t.length; i++) set.add(t.slice(i, i + 4)); return set; };
const jac = (a, b) => { let i = 0; a.forEach((x) => { if (b.has(x)) i++; }); return i / (a.size + b.size - i || 1); };
const oldSh = old.map((q) => ({ q, s: sh(q.passage + q.question) }));
const mine = rows.map((q) => ({ q, s: sh(q.passage + q.question) }));
/* 1) 이미 있는 문항 · 이번 파일 안 문항과 너무 닮음(같은 지문을 쓰는 짝은 제외) */
mine.forEach((m, i) => {
  for (const o of oldSh) { if (m.q.pair && m.q.pair === o.q.pair && m.q.passage === o.q.passage) continue; const j = jac(m.s, o.s); if (j >= 0.6) flag(m.q, `기존 ${o.q.id}(${o.q.__f})와 ${Math.round(j * 100)}% 같다`); }
  for (let k = 0; k < i; k++) { const o = mine[k]; if (m.q.pair && m.q.pair === o.q.pair) continue; const j = jac(m.s, o.s); if (j >= 0.6) flag(m.q, `이 파일의 ${o.q.id}와 ${Math.round(j * 100)}% 같다`); }
});
/* 2) 같은 번호 안 주제 겹침(기존 포함) */
const topics = new Map(); old.concat(rows).forEach((q) => { const k = q.slot + '|' + String(q.topic).replace(/\s/g, ''); if (!topics.has(k)) topics.set(k, []); topics.get(k).push(q); });
rows.forEach((q) => { const l = topics.get(q.slot + '|' + String(q.topic).replace(/\s/g, '')); const same = l.filter((x) => x.id !== q.id && !(q.pair && x.pair === q.pair)); if (same.length) flag(q, `같은 번호에 같은 주제 「${q.topic}」 ${same.length}개(${same.slice(0, 2).map((x) => x.id).join(', ')})`); });
/* 3) 정답이 눈에 띄는 모양: 가장 긴 보기가 정답 · 보기끼리 글자 겹침 · 정답만 구체적 */
rows.forEach((q) => { if (!Array.isArray(q.options)) return; const L = q.options.map((o) => String(o).length), mx = Math.max(...L);
  if (L[q.answer] === mx && L.filter((x) => x === mx).length === 1 && mx >= 1.4 * (L.reduce((a, b) => a + b, 0) - mx) / 3 && !['order', 'insert'].includes(q.type)) flag(q, '정답이 가장 긴 보기(길이로 맞출 수 있다)');
  if (q.type !== 'order' && q.type !== 'insert') { const a = String(q.options[q.answer]); if (a.length >= 4 && q.options.filter((o, i) => i !== q.answer && String(o).includes(a.slice(0, 3))).length === 3) flag(q, '오답 셋이 정답과 앞부분이 같다(구별 어려움)'); }
  if (!String(q.why).includes(String(q.options[q.answer]).replace(/^[(（].*?[)）]\s*/, '').slice(0, 4)) && !['order', 'insert'].includes(q.type)) flag(q, '해설에 정답 보기 내용이 안 나온다');
});
/* 4) 번호별 정답 분포 · 지문 길이(같은 번호 기존 문항과 비교) */
const bySlot = new Map(); rows.forEach((q) => { if (!bySlot.has(q.slot)) bySlot.set(q.slot, []); bySlot.get(q.slot).push(q); });
const lines = [];
for (const [slot, list] of [...bySlot].sort((a, b) => a[0] - b[0])) {
  const dist = [0, 0, 0, 0]; list.forEach((q) => dist[q.answer]++);
  const mxd = Math.max(...dist) / list.length; if (list.length >= 8 && mxd > 0.4) list.forEach((q) => { if (dist.indexOf(Math.max(...dist)) === q.answer) flag(q, `slot ${slot} 정답이 한 자리에 ${Math.round(mxd * 100)}% 몰렸다`); });
  const ref = old.filter((q) => q.slot === slot).map((q) => String(q.passage).length); const avg = ref.length ? ref.reduce((a, b) => a + b, 0) / ref.length : 0;
  if (avg) list.forEach((q) => { const l = String(q.passage).length; if (l < avg * 0.5 || l > avg * 1.8) flag(q, `지문 길이 ${l}자(같은 번호 평균 ${Math.round(avg)}자와 차이 큼)`); });
  const gr = {}; list.forEach((q) => gr[q.level] = (gr[q.level] || 0) + 1);
  lines.push(`slot ${slot}: ${list.length}문항 · 정답 ①${dist[0]} ②${dist[1]} ③${dist[2]} ④${dist[3]} · 지문 평균 ${Math.round(list.reduce((a, q) => a + String(q.passage).length, 0) / list.length)}자(기존 ${Math.round(avg)}자)`);
}
/* 5) check-topik2 도 같이 */
let base = '통과';
try { execFileSync('node', [path.join(ROOT, 'tools/check-topik2.mjs'), file], { stdio: 'pipe' }); } catch (e) { base = '실패 — ' + String(e.stdout || e.message).split('\n').slice(0, 6).join(' | '); }
console.log('check-topik2:', base); console.log(lines.join('\n'));
console.log(`\n걸린 문항 ${flags.size}개 / ${rows.length}개`);
[...flags].slice(0, 40).forEach(([id, w]) => console.log(' ·', id, w.join(' / ')));
if (flags.size > 40) console.log(` … 외 ${flags.size - 40}개(--sheet 로 전부)`);
if (sheet) {
  /* 검수표: 걸린 문항 전부 + 번호마다 무작위 표본 20%(재현되게 씨앗 고정) */
  let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const pick = new Set(flags.keys()); bySlot.forEach((l) => { l.filter(() => rnd() < 0.2).forEach((q) => pick.add(q.id)); });
  const out = ['# 검수표 — ' + path.basename(file), '', `전체 ${rows.length}문항 중 ${pick.size}문항(걸린 ${flags.size} + 번호마다 20% 표본). 각 문항: ① 정답이 정말 하나인가 ② 오답이 정말 틀렸는가 ③ 해설이 맞는가 ④ 사실 · 기출 · 실존 이름 없는가 ⑤ 한국어가 자연스러운가. 문제 있으면 id 옆에 적는다.`, ''];
  rows.filter((q) => pick.has(q.id)).forEach((q) => { out.push(`## ${q.id} · slot ${q.slot} · ${q.type} · ${q.topic}${flags.has(q.id) ? '  ⚠ ' + flags.get(q.id).join(' / ') : ''}`, '', '지문:', '```', q.passage, '```', `문제: ${q.question}`, ...(q.sentence ? [`주어진 문장: ${q.sentence}`] : []), ...q.options.map((o, i) => `${'①②③④'[i]} ${o}${i === q.answer ? '  ← 정답' : ''}`), `해설: ${q.why}`, '', '검수: [ ] 이상 없음  [ ] 고칠 것: ', ''); });
  fs.writeFileSync(sheet, out.join('\n')); console.log('검수표 →', sheet, `(${pick.size}문항)`);
}
