#!/usr/bin/env node
/* 회화 연습 시나리오를 더 만들기 위한 지시문을 뽑는다.

   쓰기: node tools/convo-prompt.mjs cafe beginner
         node tools/convo-prompt.mjs phone advanced formal 5

   분류(category) 하나 · 급수(lv) 하나 · 문체(register, 생략하면 polite) 를
   한 판에 하나씩만 시킨다. reading-prompt.mjs 와 같은 이유 — 여러 칸을
   섞어 시키면 모델이 급수와 문체 기준을 섞는다.

   accept(인정 답변 패턴)는 여기서 시키지 않는다. convo.js 머리말대로
   그건 사람이 직접 채우는 자리다 — 받아온 걸 convo-merge.mjs 에 넣으면
   turn 마다 빈 accept: [] 를 자동으로 달아 준다. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { CONVO } = await import(pathToFileURL(path.join(ROOT, 'convo.js')).href);

const [CAT, LV, REG_ARG, N_ARG] = process.argv.slice(2);
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const REGISTERS = ['formal', 'polite', 'plain'];
const REGISTER = REGISTERS.includes(REG_ARG) ? REG_ARG : 'polite';
/* REG_ARG 가 register 가 아니라 개수로 쓰였을 수도 있다(문체 생략한 경우). */
const N_RAW = REGISTERS.includes(REG_ARG) ? N_ARG : REG_ARG;
const HOW_MANY = Math.max(1, Math.min(10, parseInt(N_RAW, 10) || 5));

if (!CAT || !LEVELS.includes(LV)) {
  console.error('쓰기: node tools/convo-prompt.mjs 분류 beginner|intermediate|advanced [formal|polite|plain] [개수]');
  process.exit(1);
}

/* 급수가 올라갈수록 턴이 늘어난다 — 초급은 짧고 단순한 교환, 고급은
   상황이 꼬이거나(불평, 협상, 거절) 되묻는 말이 섞인다. */
const TURNS = { beginner: 3, intermediate: 4, advanced: 5 };

const CAT_HINT = {
  cafe: '카페·편의점에서 주문하거나 계산하는 상황.',
  store: '옷가게·마트·서점 등에서 물건을 고르거나 사는 상황.',
  restaurant: '식당에서 주문하거나 요청·불만을 말하는 상황.',
  transit: '길을 묻거나 버스·지하철·택시를 이용하는 상황.',
  hospital: '병원·약국에서 증상을 말하거나 안내를 받는 상황.',
  phone: '전화로 예약·문의·약속을 정하는 상황.',
  work: '직장이나 학교에서 지각·부탁·보고를 하는 상황.',
  social: '친구·지인과 약속을 잡거나 안부·사과를 나누는 상황.',
  service: '관공서·은행·택배 등 행정 업무를 보는 상황.',
}[CAT] ?? `"${CAT}" 분류에 맞는 상황.`;

const LEVEL = {
  beginner: `**초급 (TOPIK 1~2급 정도)**

* 문장이 짧고 낱말이 쉽다 — 집·물건·시간·장소처럼 눈에 보이는 것 위주.
* 문법은 기본만 — -고 싶다, -을 수 있다, -아/어 주세요, -을게요 정도.
* 상황이 한 번에 하나만 꼬인다(예: 메뉴가 없다 → 다른 걸 고른다). 두 가지
  문제가 겹치게 하지 마라.`,

  intermediate: `**중급 (TOPIK 3~4급 정도)**

* 이유를 대거나 되묻는 문장이 섞인다 — -는데, -기 때문에, -을까요,
  -어야 하는데 정도까지.
  상대가 한 번은 되묻거나 조건을 붙인다(예: "포장은 안 되는데 괜찮으세요?").`,

  advanced: `**고급 (TOPIK 5~6급 정도)**

* 협상·거절·불만·정정처럼 뜻을 조율해야 하는 상황을 넣는다.
* -는 셈 치고, -기는 하지만, -을 수밖에 없다, -았더라면 같은 표현도 써도 된다.
* 상대가 처음 요청을 그대로 안 들어주고 대안을 제시하거나 이유를 설명한다.`,
}[LV];

const REGISTER_DESC = {
  formal: '**합쇼체** (-습니다/-습니까). 면접·발표·격식 있는 전화 등 아주 예의를 갖추는 자리.',
  polite: '**해요체** (-아요/-어요). 카페·가게·병원 등 낯선 사람과의 일상적인 존댓말.',
  plain: '**반말** (-아/-어). 친구·또래 사이. 존댓말을 섞지 마라.',
}[REGISTER];

const have = CONVO.filter((c) => c.category === CAT && c.lv === LV);
const sample = have[0] ?? CONVO[0];
const idHead = `cv-${CAT}-${LV[0]}-`;
const existingNos = CONVO.filter((c) => c.id.startsWith(idHead))
  .map((c) => parseInt(c.id.slice(idHead.length), 10)).filter(Number.isFinite);
const nextNo = (existingNos.length ? Math.max(...existingNos) : 0) + 1;

console.log(`너는 한국어 회화 교재를 만드는 사람이다. 한국어를 배우는 외국인이
**상황극 대사를 따라가며 자기 대답을 직접 만들어보는** 연습 시나리오를 만든다.

객관식이 아니다. NPC 가 한 마디를 하면 학습자가 그 자리에서 자기 말로
대답한다. 그래서 NPC 대사는 학습자가 "무슨 말을 해야 하는지" 뻔히 알
수 있게 상황을 분명히 몰아줘야 한다 — 애매하게 말하면 학습자가 무슨
대답을 해야 할지 못 정한다.

## accept 는 시키지 않는다

인정 답변 패턴(accept)은 사람이 직접 채운다. 너는 그 자리를 만들지
마라 — 결과에 accept 필드를 넣지 마라(넣어도 버려진다).

## 이번에 만들 것 — "${CAT}" · ${LV === 'beginner' ? '초급' : LV === 'intermediate' ? '중급' : '고급'} · ${HOW_MANY}개

### 상황
${CAT_HINT}

### 급수
${LEVEL}

### 문체 (register)
이번 판은 전부 **${REGISTER}** 로 통일한다. ${REGISTER_DESC}
NPC 대사도 학습자에게 요구하는 대답도 이 문체를 벗어나면 안 된다.

### 턴 수
시나리오마다 turns 는 정확히 **${TURNS[LV]}개**. NPC 대사 → 학습자 대답
요청이 한 세트다(사용자 대답 자체는 만들지 않는다 — model 에 예시 하나만
적는다).

### 모든 시나리오에 공통으로

1. roleUser/roleOther 는 그 상황에 맞는 역할 이름(예: 손님/점원, 환자/약사).
2. setting 은 한두 문장으로 상황을 학습자에게 설명한다("당신은 ~하려고
   합니다" 식).
3. vocab 은 이 시나리오에서 막힐 만한 낱말 3~5개와 영어 뜻. 사전형(-다)
   으로 적어라. 반드시 대사 안에 실제로 나오는 말이어야 한다.
4. 각 turn 의:
   - npc.text/en — NPC 대사와 그 영어 번역
   - userPrompt — 학습자에게 "무엇을 말해야 하는지" 한국어로 지시
   - model — 자연스러운 모범 답 하나 (accept 없이도 이것만으로 사람이
     검수할 수 있어야 한다)
   - tip — 이 turn 에 관련된 짧은 표현 팁 한 줄, 없으면 null
   - onMiss — 학습자가 엉뚱한 대답을 했을 때 NPC 가 한 번 더 유도하는
     말 한 마디(text/en). 마지막 turn 이면 null 이어도 된다.
5. outro — 마지막 turn 다음에 오는 NPC 의 마무리 대사(text/en). 없으면 null.
6. 대사 안에 따옴표(" ')를 쓰지 마라. 필요하면 「 」를 써라.
7. ${HOW_MANY}개의 상황·소재가 서로 겹치지 않게 해라(같은 카페라도 주문하는
   메뉴나 문제 상황을 다르게).

## 지금 있는 것 — 이 짜임을 그대로 맞춰라 (accept 는 무시하고 나머지만 참고)

\`\`\`json
${JSON.stringify(sample, null, 2)}
\`\`\`
${have.length > 1 ? `\n이 칸에는 이미 ${have.length}개가 있다. 소재가 겹치지 않게 해라 — ${have.map((c) => c.title).join(' · ')}\n` : ''}
## 내놓는 방법

JSON 배열 하나로만 답해라. 설명·머리말·번호를 붙이지 마라. accept 필드는
넣지 마라(넣어도 무시한다). id 는 \`${idHead}${String(nextNo).padStart(2, '0')}\` 부터
하나씩 올리고, turn id 는 \`시나리오id-턴번호(1부터)\` 로 붙여라.

\`\`\`json
[
  {
    "id": "${idHead}${String(nextNo).padStart(2, '0')}",
    "category": "${CAT}", "title": "…", "en": "…", "lv": "${LV}", "register": "${REGISTER}",
    "roleUser": "…", "roleOther": "…", "setting": "…",
    "vocab": [["…다", "…"]],
    "grammarRefs": [],
    "turns": [
      { "id": "${idHead}${String(nextNo).padStart(2, '0')}-1",
        "npc": { "text": "…", "en": "…" }, "userPrompt": "…",
        "model": "…", "tip": null, "onMiss": { "text": "…", "en": "…" } }
    ],
    "outro": { "text": "…", "en": "…" }
  }
]
\`\`\`

정확히 **${HOW_MANY}개**를 담아라.`);
