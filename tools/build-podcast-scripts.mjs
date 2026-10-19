#!/usr/bin/env node
// 팟캐스트 대본(한 편 = 관용 표현 하나) → docs/podcast/ep*.md — 표현 · 예문 · 대화는 사이트 표현 자료(expressions.js)에서 그대로 가져온다(운영자 2026-10-19 「한 가지 표현만 · 관용 표현 위주」).
//   node tools/build-podcast-scripts.mjs            아래 PLAN 의 순서대로 ep01~ 을 다시 쓴다(이미 녹음한 편의 대본이 바뀌지 않게, 대본을 손으로 고쳤다면 이 도구를 다시 돌리지 않는다)
// 팁 한 줄(영어)만 손으로 썼다 — 나머지는 자료 그대로. 만든 뒤 node tools/build-podcast.mjs 로 올리기 쪽 목록을 갱신한다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { EXPR } = await import(pathToFileURL(path.join(ROOT, 'expressions.js')).href);
const by = new Map(EXPR.map((x) => [x.id, x]));

/* 순서 · 영어 팁(사이트 자료의 한국어 설명 · 예문에 맞춰 쓴 한 줄) */
const PLAN = [
  ['xi-005', 'You use it to praise someone you can trust with a secret.'],
  ['xi-006', 'This one is a criticism, so be careful who you say it about. It is the opposite of 입이 무겁다.'],
  ['xi-016', 'It describes envy of someone else’s success — and yes, it can also mean a real stomachache. Context tells you which.'],
  ['xi-093', 'A friendly thing to suggest when someone is stressed or has worked too long.'],
  ['xi-022', 'Often used as a warning — “한눈팔지 마!” means “Don’t get distracted!”'],
  ['xi-113', 'Use it when something worrying turned out fine.'],
  ['xi-115', 'Add a word before it, like “굳게 마음을 먹다” or “독하게 마음먹다,” to show how firm the decision is.'],
  ['xi-119', 'A great way to encourage a friend before something scary — “용기를 내 봐요!”'],
  ['xi-118', 'It works for people, but also for places and old things you have used for a long time.'],
  ['xi-110', 'Perfect for busy days and deadlines.'],
];
const dir = path.join(ROOT, 'docs/podcast');
for (const f of fs.readdirSync(dir)) if (/^ep\d+.*\.md$/.test(f)) fs.unlinkSync(path.join(dir, f));

PLAN.forEach(([id, tip], i) => {
  const x = by.get(id); if (!x) throw new Error(`${id} 가 표현 자료에 없어요`);
  const n = String(i + 1).padStart(2, '0');
  const gloss = x.en.split(';')[0].trim();
  const ex = x.ex.slice(0, 2);
  const md = `# 에피소드 ${n} — ${x.h}

**유튜브 · 스포티파이 제목:** Korean Idiom: ${x.h} — ${gloss} (3 min)
**설명:** Learn the Korean expression ${x.h} — ${x.en}. The meaning, two example sentences and a short dialogue. More at everykoreans.com (Words › Expressions).

---
## 인트로 (15초)
안녕하세요! 저는 [이름]입니다. Hi, I'm [이름]. Today's Korean expression is one idiom: "${x.h}."

## ① ${x.h}
- 뜻: **${x.en}.** 한국어로는 「${x.m}」.
${ex.map((e, k) => `- 예문 ${k + 1} (천천히): "${e[0]}"\n  → ${e[1]}`).join('\n')}
- 대화:
${(x.dl || []).map((d) => `  - ${d[0]}: ${d[1]}`).join('\n')}
- 팁: ${tip}

## 따라 말하기 (30초) — 천천히, 세 번
${x.h}. (3초 쉬고) ${x.h}. (3초 쉬고) ${x.h}.

## 마무리 (15초)
That was "${x.h}." You can find it with more examples on everykoreans.com — Words, then Expressions. 다음에 또 만나요!
`;
  fs.writeFileSync(path.join(dir, `ep${n}-${id}.md`), md);
});
console.log(`팟캐스트 대본 ${PLAN.length}편(한 편 = 표현 하나) → docs/podcast/`);
