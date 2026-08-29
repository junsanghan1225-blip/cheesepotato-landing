#!/usr/bin/env node
/* 회화 연습 시나리오 검사기.

   여기서 재는 것은 세 가지다.

   ① **모양** — id 규칙, 필수 필드, turn id 가 시나리오 id 에 맞물리는지.
   ② **accept 가 채워졌는지** — convo-merge.mjs 로 막 받아온 것은 전부
      비어 있는 게 정상이다(경고만 낸다). 사람이 채운 뒤에는 이 검사가
      reading.js 의 keys 와 같은 기준으로 본다 — k 가 두 글자 이상인지,
      model 에 실제로 나오는 말인지, 같은 turn 안에서 겹치지 않는지.
   ③ **문체 일관성** — register 가 formal 인데 대사에 반말 종결(-아/-어.)이
      섞이는 것처럼 뻔히 어긋나는 것만 얕게 잡는다(완전한 문법 검사는 아니다).

   쓰기: node tools/check-convo.mjs */

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { CONVO } = await import(pathToFileURL(path.join(ROOT, 'convo.js')).href);

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const REGISTERS = ['formal', 'polite', 'plain'];

const bad = [], warn = [];
const ids = new Map();
let emptyAccept = 0, totalTurns = 0;

for (const [i, c] of CONVO.entries()) {
  const at = `#${i + 1}(${c.id ?? '?'})`;
  const need = ['id', 'category', 'title', 'en', 'lv', 'register', 'roleUser', 'roleOther', 'setting', 'vocab', 'turns'];
  for (const f of need) if (c[f] == null) { bad.push(`${at} ${f} 가 없다`); }
  if (need.some((f) => c[f] == null)) continue;

  if (ids.has(c.id)) bad.push(`${at} id 가 ${ids.get(c.id)} 와 겹친다`);
  else ids.set(c.id, at);

  if (!/^cv-[a-z]+-[bia]-\d{2,3}$/.test(c.id)) bad.push(`${at} id 모양이 cv-cafe-b-01 꼴이 아니다`);
  if (!LEVELS.includes(c.lv)) bad.push(`${at} lv 가 ${LEVELS.join('|')} 중 하나가 아니다`);
  else if (!c.id.includes(`-${c.lv[0]}-`)) warn.push(`${at} id 의 급수 글자가 lv(${c.lv})와 안 맞는 듯하다`);
  if (!REGISTERS.includes(c.register)) bad.push(`${at} register 가 ${REGISTERS.join('|')} 중 하나가 아니다`);
  if (!c.id.startsWith(`cv-${c.category}-`)) warn.push(`${at} id 가 category(${c.category})로 시작하지 않는다`);

  if (!Array.isArray(c.vocab) || !c.vocab.length) warn.push(`${at} vocab 이 비었다`);
  c.vocab?.forEach((w) => {
    if (!Array.isArray(w) || w.length !== 2) return bad.push(`${at} vocab 항목이 [한국어, 영어] 꼴이 아니다`);
  });

  if (!Array.isArray(c.turns) || !c.turns.length) { bad.push(`${at} turns 가 비었다`); continue; }

  c.turns.forEach((t, ti) => {
    totalTurns++;
    const tAt = `${at} turn${ti + 1}(${t.id ?? '?'})`;
    const tNeed = ['id', 'npc', 'userPrompt', 'model'];
    for (const f of tNeed) if (t[f] == null) bad.push(`${tAt} ${f} 가 없다`);
    if (!t.npc?.text || !t.npc?.en) bad.push(`${tAt} npc.text/en 이 없다`);

    const wantId = `${c.id}-${ti + 1}`;
    if (t.id !== wantId) bad.push(`${tAt} turn id 가 ${wantId} 이어야 한다`);

    if (t.onMiss != null && (!t.onMiss.text || !t.onMiss.en)) bad.push(`${tAt} onMiss.text/en 이 없다`);

    if (!Array.isArray(t.accept)) { bad.push(`${tAt} accept 가 배열이 아니다`); return; }
    if (!t.accept.length) { emptyAccept++; return; }

    /* 채워진 accept 를 reading.js 와 비슷한 기준으로 보되, 그룹 단위는
       아니다 — reading.js 는 한 모범 답안이 keys 를 전부 짚어야 하지만,
       회화는 turn 마다 서로 다른 정답 갈래(예: 따뜻한 것/차가운 것)가
       accept 안에 나란히 있고 model 은 그중 하나만 보여준다. 그래서
       "그룹마다 model 에 있어야 한다"가 아니라 "적어도 한 그룹은 model 에
       있어야 한다"로 본다 — model 이 accept 어디와도 안 맞으면 모범
       답이 채점 기준 밖에 있다는 뜻이라 그건 진짜 문제다. */
    const seen = new Set();
    let anyHitsModel = false;
    t.accept.forEach((g, gi) => {
      if (!Array.isArray(g.k) || !g.k.length) return bad.push(`${tAt} accept[${gi}].k 가 비었다`);
      if (!g.why) warn.push(`${tAt} accept[${gi}] 에 why 가 없다`);
      if (g.k.some((k) => t.model.includes(k))) anyHitsModel = true;
      g.k.forEach((k) => {
        if (k.length < 2) warn.push(`${tAt} accept[${gi}].k 의 "${k}" 가 한 글자다 — 너무 흔해서 점수를 못 가른다`);
        if (seen.has(k)) bad.push(`${tAt} "${k}" 가 accept 안에서 두 번 쓰였다`);
        seen.add(k);
      });
    });
    if (!anyHitsModel) warn.push(`${tAt} accept 의 어떤 그룹도 model 과 안 맞는다 — model: "${t.model}"`);
  });

  if (c.outro != null && (!c.outro.text || !c.outro.en)) bad.push(`${at} outro.text/en 이 없다`);

  /* 문체 일관성 — 뻔히 어긋나는 것만. formal 인데 반말 종결이 있거나,
     plain 인데 -습니다/-요 로 끝나면 잡는다. 완전한 문법 검사가 아니라
     눈으로 볼 것(warn)으로만 낸다. */
  const allText = [c.setting, ...c.turns.flatMap((t) => [t.npc.text, t.userPrompt, t.model])].join(' ');
  if (c.register === 'formal' && /[가-힣][아어]\.(?!\S)/.test(allText)) {
    warn.push(`${at} register 가 formal 인데 반말 종결로 보이는 문장이 있다 — 눈으로 확인할 것`);
  }
  if (c.register === 'plain' && /(습니다|습니까|해요|어요|아요)[.?!]/.test(allText)) {
    warn.push(`${at} register 가 plain 인데 존댓말 종결로 보이는 문장이 있다 — 눈으로 확인할 것`);
  }
}

/* ── 알림 ─────────────────────────────────────────────────── */
const byCat = new Map();
for (const c of CONVO) {
  const key = `${c.category}/${c.lv}`;
  byCat.set(key, (byCat.get(key) ?? 0) + 1);
}
[...byCat.entries()].sort().forEach(([k, n]) => console.log(`${k.padEnd(24)} ${n}개`));
console.log(`합계 ${CONVO.length}개 시나리오 · ${totalTurns}턴`);
if (emptyAccept) console.log(`(그중 accept 가 아직 안 채워진 turn ${emptyAccept}개 — merge 직후엔 정상)`);

console.log(`\n■ 고쳐야 할 것 ${bad.length}건`);
bad.forEach((x) => console.log('  ' + x));
console.log(`\n□ 눈으로 볼 것 ${warn.length}건`);
warn.forEach((x) => console.log('  ' + x));
console.log(bad.length ? '\n손봐야 한다.' : '\n이상 없음');
process.exit(bad.length ? 1 : 0);
