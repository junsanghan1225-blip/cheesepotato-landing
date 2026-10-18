#!/usr/bin/env node
/* CI 검사 — docs/weave.json (이야기 만들기: 접속사 카드 · 이야기, 운영자 2026-10-18)
   접속사: id · 한국어 · 역할 · 뜻(en) · 쓰임 · 예 2개(그 접속사가 들어 있어야 한다) · 팁.
   이야기: 문장 4~6개(ko · en) · 문장 사이마다 gap 1개(정답 접속사 · 보기 4개 · 이유) · 쓰기(prompt · cues · 최소 문장 · 최소 접속사).
   gap 검사: 정답이 접속사 목록에 있음 · 보기 4개가 서로 다른 접속사이고 오답에 정답과 같은 역할이 없음(있으면 두 보기가 다 맞는 문제가 된다 — 차례 접속사만 예외) ·
             gap.role 이 정답 접속사의 역할 · 문장이 이미 접속사로 시작하지 않음. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildPred } from './weave-pred.mjs';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'docs/weave.json');
if (!fs.existsSync(FILE)) { console.log('이야기 만들기 검사 — 파일 없음(통과)'); process.exit(0); }
const D = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const KIND_STEPS = { intro: ['who', 'where', 'do', 'like', 'why', 'wish'], explain: ['point', 'reason', 'example', 'how', 'result', 'recap'], tell: ['when', 'who', 'do', 'feel', 'end'] };
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
  /* 이음 사다리 판(운영자 2026-10-18 「설명 · 소개가 어렵고 말이 끊긴다」, 계획 docs/plans/weave-fluency.md) — kind 가 있는 이야기만 아래를 더 본다 */
  if (s.kind !== undefined) {
    const steps = KIND_STEPS[s.kind];
    if (!steps) bad.push(`${at}: kind 는 ${Object.keys(KIND_STEPS).join(' · ')} 중 하나`);
    (s.sentences || []).forEach((x, i) => {
      const xt = `${at} 문장 ${i + 1}`;
      if (!Array.isArray(x.key) || x.key.length < 1 || x.key.length > 3) bad.push(`${xt}: key 는 낱말 1~3개`);
      else for (const k of x.key) if (!x.ko.includes(k)) bad.push(`${xt}: key 「${k}」 가 문장에 그대로 없다 — ${x.ko}`);
      if (steps && !steps.includes(x.step)) bad.push(`${xt}: step 은 ${steps.join(' · ')} 중 하나(지금 ${x.step})`);
    });
    if (steps && s.sentences?.[0]?.step !== steps[0]) bad.push(`${at}: 첫 문장의 step 은 ${steps[0]}`);
    const lk = s.links;
    if (!Array.isArray(lk) || lk.length < 2 || lk.length > 3) bad.push(`${at}: links(이어 한 문장으로)는 2~3개`);
    else {
      const froms = new Set();
      lk.forEach((l, i) => {
        const lt = `${at} links ${i + 1}`;
        if (!Number.isInteger(l.from) || l.from < 0 || l.from > n - 2 || froms.has(l.from)) bad.push(`${lt}: from 은 0~${n - 2} 의 서로 다른 숫자(문장 from 과 from+1 을 잇는다)`); froms.add(l.from);
        if (!bi(l.hint) || !bi(l.why)) bad.push(`${lt}: hint · why 는 ko · en`);
        if (!Array.isArray(l.opts) || l.opts.length !== 4 || new Set(l.opts).size !== 4 || !l.opts.includes(l.ans)) return bad.push(`${lt}: 보기는 서로 다른 4개이고 정답(ans)이 들어 있어야 한다`);
        for (const o of l.opts) if (!/[.?!]$/.test(o) || /[.?!]./.test(o)) bad.push(`${lt}: 보기는 마침표가 맨 끝에 하나뿐인 한 문장이어야 한다 — ${o}`);
        const a = s.sentences?.[l.from]?.key?.[0];   // 정답은 두 문장의 핵심어를 다 담아야 한다(문장을 새로 쓰지 않는다)
        const b = s.sentences?.[l.from + 1]?.key?.[0];
        if (a && b && !(l.ans.includes(a) && l.ans.includes(b))) bad.push(`${lt}: 정답에 두 문장의 핵심어(${a} · ${b})가 다 들어 있어야 한다 — ${l.ans}`);
      });
    }
  }
  const w = s.write;
  if (!w || !bi(w.prompt) || !Array.isArray(w.cues) || w.cues.length < 2 || !(w.minSentences >= 3 && w.minSentences <= 6) || !(w.minConnectors >= 2 && w.minConnectors <= n - 1)) bad.push(`${at}: write 는 prompt(ko · en) · cues 2개 이상 · minSentences 3~6 · minConnectors 2~${n - 1}`);
}
/* 문장 열차 과제(운영자 2026-10-18 「다 한 번에 쓰게 · 로직이 너무 쉽다 · 다 비슷하다」, 계획 docs/plans/weave-fluency.md 7)
   mode: write(상황 퀘스트) · continue(이어 쓰기) · fix(고쳐 쓰기) · translate(영어 → 한 문장) · speak(즉석 말하기).
   핵심 검사: **모범 답이 자기 조건을 모두 채워야** 한다(화면의 인식기와 같은 weave-link.js 로) · 고쳐 쓰기의 처음 글은 조건을 **못 채워야** 한다(진짜 고칠 거리) */
const { analyze, buildForms, evalReq } = await import(pathToFileURL(path.join(ROOT, 'weave-link.js')).href);
const PRED = buildPred(), FORMS = buildForms(PRED), MODES = ['write', 'continue', 'fix', 'translate', 'speak'], qseen = new Set();
const allOk = (req, text) => evalReq(req, analyze(text, FORMS), text).every((c) => c.ok);
const failing = (req, text) => evalReq(req, analyze(text, FORMS), text).filter((c) => !c.ok).map((c) => c.ko).join(' · ');
for (const q of D.quests || []) {
  const at = `과제 ${q.id}`;
  if (!/^[a-z0-9-]+$/.test(q.id || '') || qseen.has(q.id)) bad.push(`${at}: id 는 영문 소문자 · 숫자 · - 이고 겹치면 안 된다`); qseen.add(q.id);
  if (!MODES.includes(q.mode) || !(q.lv >= 1 && q.lv <= 5) || !q.icon || !bi(q.title) || !bi(q.situation)) { bad.push(`${at}: mode(${MODES.join('/')}) · lv 1~5 · icon · title · situation(ko · en)`); continue; }
  if (!q.req || typeof q.req !== 'object' || !bi(q.model)) { bad.push(`${at}: req · model(ko · en)`); continue; }
  if (!allOk(q.req, q.model.ko)) bad.push(`${at}: 모범 답이 자기 조건을 못 채운다 — ${failing(q.req, q.model.ko)} — ${q.model.ko}`);
  if (q.mode === 'continue') {
    if (!q.start || q.req.keep !== q.start.trim() || !q.model.ko.startsWith(q.req.keep)) bad.push(`${at}: continue 는 start 가 있고 req.keep 과 같고 모범 답이 그것으로 시작해야 한다`);
  }
  if (q.mode === 'fix') {
    if (!q.start) bad.push(`${at}: fix 는 고칠 글(start)이 있어야 한다`);
    else if (allOk(q.req, q.start)) bad.push(`${at}: 고칠 글이 이미 조건을 다 채운다(고칠 거리가 없다) — ${q.start}`);
  }
  if (q.mode === 'translate' && (typeof q.meaning !== 'string' || !q.meaning.trim() || !Array.isArray(q.hints) || q.hints.length < 3)) bad.push(`${at}: translate 는 meaning(영어)과 hints 3개 이상`);
  if (q.mode === 'speak' && !(q.timer >= 20 && q.timer <= 90)) bad.push(`${at}: speak 는 timer 20~90 초`);
  if (q.bonus) {
    if (!q.bonus.req || !q.bonus.model) bad.push(`${at}: bonus 는 req · model`);
    else { const both = { ...q.req, ...q.bonus.req }; if (!allOk(both, q.bonus.model)) bad.push(`${at}: 보너스 모범 답이 조건을 못 채운다 — ${failing(both, q.bonus.model)} — ${q.bonus.model}`); }
  }
}
if (bad.length) { console.error(`이야기 만들기 자료에 문제가 있다 (${bad.length}곳):\n  - ${bad.slice(0, 60).join('\n  - ')}`); process.exit(1); }
console.log(`이야기 만들기 검사 — 통과 (접속사 ${CON.size}개 · 이야기 ${(D.stories || []).length}편 · 문장 열차 과제 ${(D.quests || []).length}개)`);
