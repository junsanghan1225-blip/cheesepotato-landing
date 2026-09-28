#!/usr/bin/env node
/* 「단어」 섹션 0단계 — TOPIK I 필수 낱말 **후보**를 우리 자료에서 뽑는다 (docs/vocab-plan.md 6층).
 *
 *   node tools/vocab-draft.mjs            → docs/vocab/topik1-candidates.json + 요약
 *
 * 남의 목록을 베끼지 않고 **우리 자료에서 실제로 쓰인 빈도**로 고른다.
 *   TOPIK I 쪽  = TOPIK I 읽기 · 듣기 문항, 초급(과 그 앞) 코스, EPS 문항
 *   TOPIK II 쪽 = TOPIK II 읽기 · 듣기 문항, 중급 · 고급 코스
 * 지문 속 꼴(먹었어요 · 집에서)은 gloss-find.js 로 표제어(먹다 · 집)로 되돌려 센다.
 * TOPIK I 쪽에 자주 나오고 TOPIK II 쪽에 치우치지 않은 낱말이 앞에 선다.
 *
 * 결과는 **초안**이다. 안티 그래비티가 다듬고 운영자가 무작위로 본다. 사전(glossary)에 아직 없는
 * 꼴은 따로 모아 「사전에 더할 후보」로 적는다 — TOPIK I 지문에 나오는데 사전에 없는 낱말이다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);

const { GLOSSARY } = await load('glossary.js');
const { glossFind } = await load('gloss-find.js');
const { TOPIK_READING } = await load('topik.js');
const { TOPIK2_READING } = await load('topik2.js');
const { TOPIKL_ITEMS, TOPIKL2_ITEMS } = await load('topik-listening.js');
const { COURSES } = await load('courses-lite.js');
const { EPS_ITEMS } = await load('eps.js');

const inDict = (k) => Object.prototype.hasOwnProperty.call(GLOSSARY, k);

/* 객체 속 글을 전부 긁어 한글 덩어리로. 해설(why) · 물음(question · q) · 갈래 이름(genre · type)은 뺀다 —
   「알맞은 것을 고르십시오」 같은 시험 지시문이 세어져 「알맞다」가 앞에 서는 일을 막는다. */
const SKIP = new Set(['id', 'why', 'why_en', 'en', 'rom', 'tip', 'emoji', 'icon', 'audio', 'img',
                      'question', 'q', 'genre', 'type', 'topic', 'cond', 'title', 'h']);
function texts(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) texts(x, out);
  return out;
}
const tokens = (v) => texts(v).join(' ').match(/[가-힣]+/g) || [];

const EARLY = new Set(['Start here', 'After Hangul', 'After First Words', 'Beginner']);
const SOURCES = {
  topik1:   [...TOPIK_READING, ...TOPIKL_ITEMS],
  course1:  COURSES.filter((c) => EARLY.has(c.level)),
  eps:      EPS_ITEMS,
  topik2:   [...TOPIK2_READING, ...TOPIKL2_ITEMS],
  course2:  COURSES.filter((c) => !EARLY.has(c.level)),
};

const count = {};          // head → { topik1, course1, eps, topik2, course2 }
const miss = {};           // 사전에 없는 꼴 → { n, src }
for (const [src, list] of Object.entries(SOURCES)) {
  for (const tok of tokens(list)) {
    if (tok.length < 1) continue;
    const head = glossFind(inDict, tok);
    const h = head ? GLOSSARY[head]?.head || head : '';
    if (!h) {
      if (src === 'topik1' || src === 'course1' || src === 'eps') {
        const m = (miss[tok] ||= { n: 0, src: new Set() });
        m.n++; m.src.add(src);
      }
      continue;
    }
    const c = (count[h] ||= { topik1: 0, course1: 0, eps: 0, topik2: 0, course2: 0 });
    c[src]++;
  }
}

/* 점수: TOPIK I 문항 3 · 초급 코스 2 · EPS 1. TOPIK II 쪽에만 몰린 낱말은 뒤로. */
const byHead = new Map();
for (const v of Object.values(GLOSSARY)) if (!byHead.has(v.head)) byHead.set(v.head, v);
const rows = Object.entries(count).map(([head, c]) => {
  const t1 = c.topik1 * 3 + c.course1 * 2 + c.eps;
  const t2 = c.topik2 + c.course2;
  const g = byHead.get(head) || {};
  return { head, pos: g.pos || '', en: g.en || '', t1, t2, ...c,
           level: c.topik1 > 0 || c.course1 > 0 ? 1 : 2 };   // 1 = 1급 쪽 초안, 2 = 2급 쪽 초안
}).filter((r) => r.t1 >= 2 && r.t1 >= r.t2 * 0.6)
  .sort((a, b) => b.t1 - a.t1 || a.head.localeCompare(b.head, 'ko'));

const missing = Object.entries(miss).filter(([f, m]) => m.n >= 3 && f.length >= 2)
  .map(([form, m]) => ({ form, n: m.n, src: [...m.src] }))
  .sort((a, b) => b.n - a.n).slice(0, 400);

fs.mkdirSync(path.join(ROOT, 'docs', 'vocab'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'vocab', 'topik1-candidates.json'), JSON.stringify({
  _about: 'TOPIK I 필수 낱말 후보 — 초안. tools/vocab-draft.mjs 가 우리 자료의 등장 빈도로 뽑았다. 손으로 고치지 말고 도구를 다시 돌린다.',
  _score: 't1 = TOPIK I 문항×3 + 초급 코스×2 + EPS×1, t2 = TOPIK II 문항 + 중·고급 코스. t1 ≥ 2 이고 t1 ≥ t2×0.6 인 것',
  count: rows.length,
  words: rows,
  missing_from_dictionary: missing,
}, null, 1) + '\n');

const pos = {}; rows.forEach((r) => { pos[r.pos || '?'] = (pos[r.pos || '?'] || 0) + 1; });
console.log(`TOPIK I 필수 후보 ${rows.length}개 (사전 표제어 ${byHead.size}개 중)`);
console.log('품사: ' + Object.entries(pos).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' · '));
console.log('앞 40: ' + rows.slice(0, 40).map((r) => r.head).join(' '));
console.log(`사전에 없는데 TOPIK I 쪽에 3번 이상 나온 꼴 ${missing.length}개 — 앞 30: ` + missing.slice(0, 30).map((m) => m.form).join(' '));
console.log('→ docs/vocab/topik1-candidates.json');
