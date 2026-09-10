#!/usr/bin/env node
/* 블로그 글 하나를 더 쓰기 위한 지시문을 뽑는다.

   쓰기: node tools/blog-prompt.mjs beginner "은/는과 이/가"
         node tools/blog-prompt.mjs intermediate "-는 바람에 와 -느라고"
         node tools/blog-prompt.mjs advanced "TOPIK 쓰기 54번 짜임"

   뽑은 것을 통째로 Gemini 에 붙여 넣고, 받은 JSON 을 파일로 저장한 뒤
     node tools/blog-merge.mjs 받은것.json
     node tools/check-blog.mjs
     node tools/build-pages.mjs && node tools/stamp.mjs
   순서로 넣는다.

   한 판에 글 하나만 시킨다. 두세 편을 한 번에 시키면 뒤로 갈수록 짧아지고
   말투가 흔들린다 — 읽기 지문에서 이미 겪은 일이다(reading-prompt.mjs).

   **모델에게 문법 설명을 시키지 않는다.** 표현의 뜻풀이는 우리에게 이미
   290개가 있다. 모델은 「어느 표현을 걸지」와 「왜 그걸 보라는지」만 정하고,
   뜻은 굽는 자리에서 sentences.js 에서 꺼내 붙인다. 그래서 아래 목록에 있는
   id 만 쓰게 하고, 없는 id 는 build-pages.mjs 가 굽다가 멈춘다. */

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { SB_CATS } = await import(pathToFileURL(path.join(ROOT, 'sentences.js')).href);
const { BLOG_POSTS } = await import(pathToFileURL(path.join(ROOT, 'blog.js')).href);

const [LV, ...rest] = process.argv.slice(2);
const TOPIC = rest.join(' ').trim();
const LV_KO = { beginner: '초급', intermediate: '중급', advanced: '고급' };

if (!LV_KO[LV] || !TOPIC) {
  console.error('쓰기: node tools/blog-prompt.mjs beginner|intermediate|advanced "글 주제"');
  process.exit(1);
}

/* 그 급수와 그 아래 급수의 표현만 보여 준다. 초급 글에 고급 표현을 걸면
   읽던 사람이 갑자기 못 읽는 쪽으로 떨어진다. */
const ORDER = ['beginner', 'intermediate', 'advanced'];
const upto = ORDER.slice(0, ORDER.indexOf(LV) + 1);
const points = [];
for (const cat of SB_CATS) {
  for (const p of cat.points) {
    if (upto.includes(p.lv || 'intermediate')) points.push(`${p.id}\t${p.name}\t${p.desc}`);
  }
}

/* 걸어도 되는 다른 쪽. 여기 없는 주소는 쓰지 말라고 못 박는다 — 모델은
   /blog/tags/grammar 처럼 있을 법한 주소를 아주 잘 지어낸다. */
const LINKS = [
  ['/course/', '코스 목록 — 코스 21개·레슨 82개'],
  ['/course/hangul.html', 'Read Korean — 한글 읽기 코스'],
  ['/course/first-words.html', 'First Words — 인사·주문·길찾기'],
  ['/course/grammar-core.html', 'Building Sentences — 시제·부정·조사'],
  ['/sentence/', '문법 표현 목록 290개'],
  ['/compare/', '헷갈리는 표현 견주기 73갈래'],
  ['/topik-reading/', 'TOPIK 읽기 연습 문항'],
  ['/topik-listening/', 'TOPIK 듣기 연습 문항'],
  ['/topik-writing/', 'TOPIK 쓰기 연습 문항'],
];

const today = new Date().toISOString().slice(0, 10);
const tags = [...new Set(BLOG_POSTS.flatMap((p) => p.tags || []))];

console.log(`너는 한국어 학습 사이트 「치즈감자」의 블로그에 글을 쓴다.
읽는 사람은 **한국어를 배우다 어딘가에서 막힌 사람**이다. 한국어를 읽을 줄은
알지만 아직 서툰 사람도 있고, 한국 사람도 있다. 글은 한국어로 쓴다.

## 이번에 쓸 글

* 주제: **${TOPIC}**
* 급수: **${LV_KO[LV]}** — 이 급수의 학습자가 읽고 바로 쓸 수 있어야 한다.

## 말투와 태도 — 이게 제일 중요하다

이 블로그는 광고를 쓰지 않는다. 「최고의」, 「완벽한」, 「지금 바로」 같은 말을
쓰지 마라. 느낌표도 쓰지 마라. 아래 넷은 반드시 지킨다.

1. **사이트에 실제로 있는 것만 적는다.** 없는 기능을 있다고 하지 마라.
2. **연습 문항은 기출이 아니라 창작이다.** TOPIK 이야기를 하면 그때마다 밝혀라.
3. **자주 바뀌는 제도**(접수 일정·비자 요건·급수 커트라인)는 숫자를 옮겨
   적지 말고 「공식 안내에서 확인하라」고 보내라. 틀린 숫자를 믿고 준비하는
   사람이 생긴다.
4. **없는 쪽은 걸지 마라.** 아래에 준 문법 id 와 주소 말고는 쓰지 마라.

문장은 「-습니다」체로 쓴다. 한 문단은 세 문장 안쪽으로 짧게 끊어라.
「~할 수 있습니다」 같은 뭉뚱그린 말 대신 **무엇이 어떻게 되는지**를 적어라.

## 짜임

글 하나는 블록 배열이다. 아래 종류만 쓴다. 다른 종류를 지어내지 마라.
**HTML 태그를 쓰지 마라** — 글자는 그대로 글자로 나간다. 굵게 하고 싶으면
\`**이렇게**\` 로 감싼다. 그것 말고 다른 꾸밈은 없다.

| 블록 | 모양 | 쓸 자리 |
|---|---|---|
| 문단 | \`{"t":"p","text":"…"}\` | 본문 |
| 소제목 | \`{"t":"h","text":"…"}\` | 3~5개. 소제목만 훑어도 글의 뼈대가 보여야 한다 |
| 인용 | \`{"t":"quote","lines":["…","…"]}\` | 예문 두어 줄을 나란히 보일 때 |
| 목록 | \`{"t":"list","items":["…"],"ordered":false}\` | 정리할 때 |
| 예문 | \`{"t":"ex","ko":"한국어 문장","en":"English"}\` | 문장 하나를 뜻과 함께 보일 때 |
| 대화문 | \`{"t":"dlg","lines":["A: …","B: …"]}\` | 실제로 오가는 말을 보일 때. A·B 만 |
| **문법 카드** | \`{"t":"gram","id":"26-2","note":"왜 이걸 보라는지 한 줄"}\` | **아래 목록의 id 만** |
| 주소 카드 | \`{"t":"link","href":"/course/hangul.html","title":"…","note":"…"}\` | **아래 목록의 주소만** |
| 짚어 둘 것 | \`{"t":"note","title":"…","text":"…"}\` | 본문에서 한 발 뺀 이야기 |
| 사진 | \`{"t":"img","src":"/assets/blog/….jpg","alt":"…","cap":"…"}\` | **사진은 네가 넣지 마라** — 아래를 읽어라 |

### 문법 카드에 대하여 — 이 글의 핵심이다

이 블로그의 글은 **읽다가 그 문법 쪽으로 들어갈 수 있어야** 한다.
글 하나에 문법 카드를 **2~4개** 넣어라.

\`note\` 에는 **왜 지금 이걸 보라는지**만 한 줄로 적어라.
표현이 무슨 뜻인지는 적지 마라 — 뜻풀이는 우리 자료에서 자동으로 붙는다.
네가 쓴 뜻풀이는 버려진다. (좋은 note: 「대조로 쓰는 자리를 예문으로 보면
빨리 붙습니다」 / 나쁜 note: 「-는 바람에는 원인을 나타내는 표현입니다」)

### 사진에 대하여

**\`img\` 블록을 만들지 마라.** 사진은 사람이 직접 찍거나 만들어서 넣는다.
남의 사진을 쓸 수 없기 때문이다. 대신 사진이 있으면 좋겠는 자리가 있으면
그 자리에 \`{"t":"note","title":"사진 자리","text":"여기에 …가 있으면 좋겠다"}\`
를 넣어라. 사람이 보고 채우거나 지운다.

## 쓸 수 있는 문법 표현 — 여기 있는 id 만 쓴다 (${points.length}개)

\`\`\`
${points.join('\n')}
\`\`\`

## 걸 수 있는 주소 — 여기 있는 것만 쓴다

\`\`\`
${LINKS.map(([h, t]) => `${h}\t${t}`).join('\n')}
\`\`\`

## 이미 올린 글 — 주제가 겹치지 않게

${BLOG_POSTS.map((p) => `* ${p.title} (${(p.tags || []).join('·')})`).join('\n')}

이미 쓰는 갈래: ${tags.join(' · ')}
새 갈래를 만들기보다 이 중에서 골라라 — 갈래가 갈리면 「같은 갈래의 글」이
서로를 못 찾는다.

## 내놓는 방법

JSON 객체 **하나**로만 답해라. 설명·머리말을 붙이지 마라.

\`\`\`json
{
  "id": "영문-소문자-하이픈-slug",
  "title": "글 제목 (한국어, 40자 안쪽)",
  "date": "${today}",
  "updated": "${today}",
  "tags": ["갈래", "갈래"],
  "excerpt": "목록과 검색 결과에 뜰 두세 줄 요약 (80~150자)",
  "blocks": [
    { "t": "p", "text": "…" },
    { "t": "h", "text": "…" },
    { "t": "gram", "id": "26-2", "note": "…" }
  ]
}
\`\`\`

* \`id\` 는 주소가 된다. 소문자·숫자·하이픈만. 한 번 올리면 못 바꾸니
  주제를 잘 담은 것으로. 위에 이미 있는 것과 겹치면 안 된다.
* \`tags\` 는 2개.
* 블록은 **18~30개**. 첫 블록은 반드시 \`p\` 다 — 소제목으로 시작하지 마라.
* 글 전체가 한국어로 1,200~2,000자쯤 되게. 읽는 데 3~4분 걸리는 분량이다.`);
