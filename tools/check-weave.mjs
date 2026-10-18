#!/usr/bin/env node
/* CI 검사 — docs/weave.json (이야기 만들기: 접속사 카드 · 이야기, 운영자 2026-10-18)
   접속사: id · 한국어 · 역할 · 뜻(en) · 쓰임 · 예 2개(그 접속사가 들어 있어야 한다) · 팁.
   이야기: 문장 4~6개(ko · en) · 문장 사이마다 gap 1개(정답 접속사 · 보기 4개 · 이유) · 쓰기(prompt · cues · 최소 문장 · 최소 접속사).
   gap 검사: 정답이 접속사 목록에 있음 · 보기 4개가 서로 다른 접속사이고 오답에 정답과 같은 역할이 없음(있으면 두 보기가 다 맞는 문제가 된다 — 차례 접속사만 예외) ·
             gap.role 이 정답 접속사의 역할 · 문장이 이미 접속사로 시작하지 않음. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'docs/weave.json');
if (!fs.existsSync(FILE)) { console.log('이야기 만들기 검사 — 파일 없음(통과)'); process.exit(0); }
const D = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const bad = [], TIERS = ['beginner', 'intermediate', 'advanced'], ROLES = Object.keys(D.roles || {});
const bi = (o) => o && typeof o.ko === 'string' && o.ko.trim() && typeof o.en === 'string' && o.en.trim();
const CON = new Map();
for (const c of D.connectors || []) {
  const at = `접속사 ${c.id}`;
  if (!/^[a-z-]+$/.test(c.id || '')) bad.push(`${at}: id 는 영문 소문자 · -`);
  if (CON.has(c.id)) bad.push(`${at}: id 가 겹친다`); CON.set(c.id, c);
  if (!c.ko || !ROLES.includes(c.role) || !TIERS.includes(c.lv) || !c.en) bad.push(`${at}: ko · role(${ROLES.join('/')}) · lv · en`);
  if (!bi(c.use) || !bi(c.tip)) bad.push(`${at}: use · tip 은 ko · en 둘 다`);
  if (!Array.isArray(c.ex) || c.ex.length < 2 || !c.ex.every(bi)) bad.push(`${at}: 예(ex)는 ko · en 이 있는 것 2개 이상`);
  else for (const e of c.ex) if (!e.ko.includes(c.ko)) bad.push(`${at}: 예문에 「${c.ko}」 가 없다 — ${e.ko}`);
}
const seenT = new Set();
for (const s of D.stories || []) {
  const at = `이야기 ${s.id}`;
  if (!/^[a-z0-9-]+$/.test(s.id || '') || seenT.has(s.id)) bad.push(`${at}: id 는 영문 소문자 · 숫자 · - 이고 겹치면 안 된다`); seenT.add(s.id);
  if (!TIERS.includes(s.tier) || !bi(s.title)) bad.push(`${at}: tier · title(ko · en)`);
  const n = (s.sentences || []).length;
  if (n < 4 || n > 6) bad.push(`${at}: 문장은 4~6개 (지금 ${n})`);
  (s.sentences || []).forEach((x, i) => {
    if (!bi(x)) return bad.push(`${at} 문장 ${i + 1}: ko · en`);
    if (!/[.?!]$/.test(x.ko.trim())) bad.push(`${at} 문장 ${i + 1}: 문장 끝에 . ? !`);
    for (const c of CON.values()) if (i > 0 && x.ko.trim().startsWith(c.ko)) bad.push(`${at} 문장 ${i + 1}: 접속사로 시작하면 안 된다(접속사는 gap 에서 고른다) — ${x.ko}`);
  });
  if (!Array.isArray(s.gaps) || s.gaps.length !== n - 1) { bad.push(`${at}: gap 은 문장 수 - 1 = ${n - 1}개`); continue; }
  s.gaps.forEach((g, i) => {
    const gt = `${at} gap ${i + 1}`;
    const a = CON.get(g.ans);
    if (!a) return bad.push(`${gt}: 정답 접속사 id 가 없다 — ${g.ans}`);
    if (!Array.isArray(g.opts) || g.opts.length !== 4 || new Set(g.opts).size !== 4 || !g.opts.includes(g.ans)) return bad.push(`${gt}: 보기는 서로 다른 4개이고 정답이 들어 있어야 한다`);
    const roles = g.opts.map((o) => CON.get(o)?.role);
    if (roles.some((r) => !r)) bad.push(`${gt}: 보기에 없는 접속사 id`);
    else if (a.role !== 'order' && g.opts.some((o) => o !== g.ans && CON.get(o).role === a.role)) bad.push(`${gt}: 정답과 같은 역할(${a.role})의 보기가 오답에 있다 — 같은 뜻의 보기가 둘이면 정답이 둘이 된다 (${g.opts.join(' · ')})`);   // 차례(먼저 · 그다음에 · 마지막으로)는 자리로 가르니 예외
    if (g.role !== a.role) bad.push(`${gt}: role(${g.role}) 이 정답 접속사의 역할(${a.role})과 다르다`);
    if (!bi(g.why)) bad.push(`${gt}: why 는 ko · en`);
  });
  const w = s.write;
  if (!w || !bi(w.prompt) || !Array.isArray(w.cues) || w.cues.length < 2 || !(w.minSentences >= 3 && w.minSentences <= 6) || !(w.minConnectors >= 2 && w.minConnectors <= n - 1)) bad.push(`${at}: write 는 prompt(ko · en) · cues 2개 이상 · minSentences 3~6 · minConnectors 2~${n - 1}`);
}
if (bad.length) { console.error(`이야기 만들기 자료에 문제가 있다 (${bad.length}곳):\n  - ${bad.slice(0, 60).join('\n  - ')}`); process.exit(1); }
console.log(`이야기 만들기 검사 — 통과 (접속사 ${CON.size}개 · 이야기 ${(D.stories || []).length}편)`);
