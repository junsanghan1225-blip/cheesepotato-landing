/*
 * 자료 전체 무결성 검사기 — 파일을 가로질러 보는 것들
 *
 * 갈래별 검사기(check-topik, check-courses, check-sentences, check-numbers)는
 * 각자 자기 파일만 본다. 파일을 가로지르는 사고는 그 넷이 다 통과해도 남는다.
 * 실제로 겪은 것들만 넣었다.
 *
 * 실행: node tools/check-data.mjs
 *
 *   1) 자료에 마크다운 굵게(**)가 남음 — 예문 게시판은 esc() 만 해서 별표가
 *      그대로 찍힌다. 예전에 21군데가 그렇게 나갔다
 *   2) id 충돌 — TOPIK 문항 id 와 레슨 id 가 겹치면 진도 기록이 섞인다
 *   3) 눈에 안 보이는 글자(제로폭·방향 지정)가 섞임 — 붙여넣기로 딸려 온다
 *   4) 한글 자리에 한자가 섞임 — 예전에 「直접」이 있었다
 *   5) 같은 단계에서 예문 갈래 번호가 겹침 — 배지에 같은 번호가 둘 보인다
 */
import { TOPIK_READING } from '../topik.js';
import { SB_CATS } from '../sentences.js';
const SB_POINTS = SB_CATS.flatMap((c) => c.points || []);
import { COURSES } from '../courses.js';

const bad = [];
const warn = [];

/* 1) 데이터에 마크다운 굵게가 남았나 — sb-fact-v 는 esc() 만 해서 별표가 그대로 찍힌다 */
const starRe = /\*\*/;
SB_POINTS.forEach((p) => {
  ['ko', 'en', 'gloss', 'form'].forEach((k) => {
    if (typeof p[k] === 'string' && starRe.test(p[k])) bad.push(`예문 ${p.id}.${k} 에 ** 가 남아 있다`);
  });
});
TOPIK_READING.forEach((q) => {
  [q.passage, q.question, q.why, ...(q.options || [])].forEach((v) => {
    if (typeof v === 'string' && starRe.test(v)) bad.push(`${q.id} 에 ** 가 남아 있다`);
  });
});

/* 2) id 충돌 — 서로 다른 갈래끼리도 겹치면 안 된다 */
const ids = new Map();
const note = (kind, id) => {
  const k = String(id);
  if (ids.has(k)) bad.push(`id "${k}" 가 ${ids.get(k)} 와 ${kind} 양쪽에 있다`);
  else ids.set(k, kind);
};
TOPIK_READING.forEach((q) => note('TOPIK', q.id));
COURSES.forEach((c) => c.lessons.forEach((l) => note('레슨', l.id)));

/* 3) 눈에 안 보이는 이상한 글자 */
const ODD = /[​-‏‪-‮﻿ ]/;
const scan = (label, v) => { if (typeof v === 'string' && ODD.test(v)) warn.push(`${label} 에 보이지 않는 글자가 있다`); };
TOPIK_READING.forEach((q) => { scan(q.id, q.passage); scan(q.id, q.why); (q.options||[]).forEach((o)=>scan(q.id,o)); });
SB_POINTS.forEach((p) => Object.entries(p).forEach(([k,v]) => scan(`예문 ${p.id}.${k}`, v)));

/* 4) 한자가 섞였나 — 예전에 「直접」이 있었다 */
const HANJA = /[一-鿿]/;
TOPIK_READING.forEach((q) => {
  [q.passage, q.why, ...(q.options||[])].forEach((v) => {
    if (typeof v === 'string' && HANJA.test(v)) bad.push(`${q.id} 에 한자가 섞였다: ${v.match(HANJA)[0]}`);
  });
});
SB_POINTS.forEach((p) => Object.entries(p).forEach(([k,v]) => {
  if (typeof v === 'string' && HANJA.test(v)) bad.push(`예문 ${p.id}.${k} 에 한자: ${v.match(HANJA)[0]}`);
}));

/* 5) 예문 갈래 번호 중복.
   단계는 갈래가 아니라 표현마다 붙는다(p.lv). 갈래의 단계는 그 안의
   표현들이 정한다. 화면은 갈래 배지에 c.no ?? c.id 를 찍으므로,
   **같은 단계 안에서** 그 번호가 겹치면 학습자 눈에 같은 번호가 둘 보인다. */
const tier = (p) => (['beginner','intermediate','advanced'].includes(p.lv) ? p.lv : 'intermediate');
const nos = new Map();
SB_CATS.forEach((c) => {
  const lvs = [...new Set((c.points || []).map(tier))];
  if (lvs.length > 1) warn.push(`예문 갈래 ${c.id} 안에 단계가 섞였다: ${lvs.join(', ')}`);
  const key = `${lvs[0] ?? '?'}-${c.no ?? c.id}`;
  if (nos.has(key)) warn.push(`같은 단계에서 갈래 번호가 겹친다 ${key} (${nos.get(key)}, ${c.id})`);
  else nos.set(key, c.id);
});

console.log(`TOPIK ${TOPIK_READING.length} · 예문 표현 ${SB_POINTS.length} · 코스 ${COURSES.length} · 레슨 ${COURSES.reduce((a,c)=>a+c.lessons.length,0)}`);
console.log(`\n짚어 둘 것 ${warn.length}건`); warn.forEach(w=>console.log('  · '+w));
console.log(`고쳐야 할 것 ${bad.length}건`); bad.forEach(e=>console.log('  ✗ '+e));
if (bad.length) process.exit(1);
console.log('\n이상 없음');
