#!/usr/bin/env node
/* 「단어」 섹션의 낱말 자료 **씨앗**을 만든다 — vocab/data/topik1.json
 *
 *   node tools/vocab-seed.mjs
 *
 * TOPIK I 필수 = **국립국어원 표준 교육과정 어휘 1 · 2급**(docs/vocab/std-2017.json, 공공누리 1유형)
 *              + 우리 자료(TOPIK I 문항 · 초급 코스 · EPS)에 자주 나오는데 그 목록에 없는 낱말
 *                (docs/vocab/topik1-candidates.json — 사람 이름 · 외래어 · 줄임말 같은 것).
 * 표준 목록에서 3급 이상인 낱말은 우리 초급 자료에 나와도 여기 넣지 않는다(TOPIK II 몫).
 * 순서는 **우리 자료에 자주 나오는 것 먼저**, 같으면 표준 목록 순서.
 *
 * 씨앗은 우리가 가진 것만 채운 C급이다: 표제어 · 품사 · 급수 · 영어 뜻(사전에 있으면) · 길잡이말 ·
 * 예문 하나(사전 예문이 있으면). 나머지는 안 그래비티가 500개씩 채워 B · A급으로 올린다
 * (docs/antigravity-vocab-task.md). 모양은 docs/vocab-schema.md, 검사는 tools/check-vocab.mjs.
 *
 * **이미 사람이 채운 자료를 덮지 않는다.** 파일이 있으면 표제어가 같은 줄은 그대로 두고,
 * 새로 들어올 낱말만 뒤에 더한다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const { EXAMPLES } = await load('glossary-examples.js');
const { GLOSSARY } = await load('glossary.js');
const cand = read('docs/vocab/topik1-candidates.json');
const std = read('docs/vocab/std-2017.json');

const gloss = new Map();
for (const v of Object.values(GLOSSARY)) if (!gloss.has(v.head)) gloss.set(v.head, v);
const stdBy = new Map(std.words.map(([h, g, p, hint], i) => [h, { g, p, hint, i }]));
const freq = new Map(cand.words.map((c) => [c.head, c]));

/* 뽑기 */
/* 빈도로 뽑은 「우리 자료에서 더한 낱말」 중 낱말이 아닌 것 — 다시 돌려도 들어오지 않게.
   우리 사전이 활용형 조각을 다른 낱말로 잘못 짚은 것(에다 ← 에다가 · 타 ← 타요 · 작고 ← 작고),
   문항 속 사람 이름, 문법 용어, TOPIK I 에 맞지 않는 낱말. (2026-09-28, 1 · 2묶음 검토) */
const SKIP = new Set(('에다 지 민수 뚜언 지현 링링 누 외다 기로 보 찍 탄 만난 문어체 격식체 노 신어 의문사 고치 놀 분만 ' +
  '살기 이랑 타 쉬 관형형 높임 래요 마 살지다 시제 앵커 윗잇몸 작고 탕 혀끝 혀뿌리 가도 깨달음 믿기다 주무 청유 최다 ' +
  '맞이 보이 분과 사도 신기 일층 드릴 개씩 분씩 시민극장 시민회관 낫 도색 임의 작 항 거저 아야 순우리말 감탄하다 ' +
  '정중히 플래시').split(' '));
const pick = new Map();
for (const [h, s] of stdBy) if (s.g === 1 || s.g === 2) pick.set(h, { h, level: s.g, std: s.g });
for (const c of cand.words) {
  if (pick.has(c.head) || c.pos === '품사 없음' || SKIP.has(c.head)) continue;       // 어미 조각은 낱말이 아니다
  const s = stdBy.get(c.head);
  if (s && s.g >= 3) continue;                                   // 표준에서 3급 이상 — TOPIK II 몫
  pick.set(c.head, { h: c.head, level: c.level, std: null });
}
const order = [...pick.values()].sort((a, b) =>
  (freq.get(b.h)?.t1 || 0) - (freq.get(a.h)?.t1 || 0) ||
  (stdBy.get(a.h)?.i ?? 1e9) - (stdBy.get(b.h)?.i ?? 1e9));

const OUT = path.join(ROOT, 'vocab/data/topik1.json');
const had = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : [];
const have = new Set(had.map((w) => w.head));

const fresh = order.filter((x) => !have.has(x.h)).map((x) => {
  const g = gloss.get(x.h) || {};
  const s = stdBy.get(x.h);
  const ex = EXAMPLES[x.h];
  const w = {
    id: x.h,
    head: x.h,
    pos: g.pos || s?.p || '',
    level: x.level,
    freq: freq.get(x.h)?.t1 || 0,
    purposes: ['topik1'],
    topics: [],
    en: g.en || '',
    examples: ex?.ex ? [{ ko: ex.ex, en: ex.en || '' }] : [],
    rel: {},
    grade: 'C',
    src: [...(g.en ? ['krdict'] : []), ...(x.std ? ['std2017'] : []), 'cheesepotato'],
  };
  if (x.std) w.std = x.std;               // 표준 교육과정 급수(있으면)
  if (s?.hint) w.hint = s.hint;           // 길잡이말 — 예문 쓸 때 쓰는 짝말
  return w;
});

const all = [...had, ...fresh];
fs.mkdirSync(path.dirname(OUT), { recursive: true });
/* 한 줄에 낱말 하나 — 안 그래비티가 고친 곳이 git 차이에서 줄 단위로 또렷이 보이게. */
fs.writeFileSync(OUT, '[\n' + all.map((w) => ' ' + JSON.stringify(w)).join(',\n') + '\n]\n');
const nStd = all.filter((w) => w.std).length;
console.log(`vocab/data/topik1.json — 있던 ${had.length} + 새로 ${fresh.length} = ${all.length}개 ` +
  `(표준 1·2급 ${nStd} · 우리 자료에서 더한 것 ${all.length - nStd} · 영어 뜻 없음 ${all.filter((w) => !w.en).length})`);
