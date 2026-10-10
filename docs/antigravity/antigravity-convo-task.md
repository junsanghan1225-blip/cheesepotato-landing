# 안티 그래비티 작업 — 「회화 연습」 장면 30개

> 배경: 콘텐츠 현황(`/stats.html`)에서 보니 회화 연습 장면이 **1개(카페 주문)** 뿐이다.
> 사이트 「회화 연습」 화면(#learn/convo)은 NPC 가 한 마디 하면 학습자가 **직접 대답을 써서** 말해 보는 곳이다(보기 고르기가 아니다).
> 자료 모양 · 규칙은 `convo.js` 맨 위 머리말에 다 있다 — **먼저 꼭 읽는다.** Claude 가 검토해 `convo.js` 에 넣는다.

## 할 일

1. **꼭 새로 받은 main 에서**: `git fetch origin && git checkout -b convo-scenes origin/main`
2. `convo.js` 머리말과 이미 있는 장면 `cv-cafe-b-01` 을 읽는다(모양을 그대로 따른다).
3. 새 파일 **`docs/convo-scenes.json` 하나만** 만든다 — 장면 30개를 담은 **배열**(아래 모양).
4. 검사: `node -e "const a=JSON.parse(require('fs').readFileSync('docs/convo-scenes.json','utf8'));console.log(a.length, a.reduce((n,c)=>n+c.turns.length,0))"` → `30 …`
5. `git add docs/convo-scenes.json && git commit -m "convo: 30 scenes" && git push -u origin convo-scenes`

PR 은 열지 않는다 — Claude 가 검토하고 연다. **`git push` 까지 꼭 한다.** `convo.js` 는 고치지 않는다(Claude 가 넣는다).

## 무엇을 몇 개

| category | 장면 | 개수 | 예 |
|---|---|---|---|
| `cafe` | 카페 · 편의점 | 3 | 음료 바꾸기(사이즈 · 얼음), 편의점 계산(봉투 · 영수증), 자리 묻기 |
| `restaurant` | 식당 | 4 | 자리 · 인원, 주문 · 맵기 조절, 반찬 · 물 더 달라기, 계산(따로 · 같이) |
| `store` | 가게 · 마트 | 3 | 옷 사이즈 · 입어 보기, 교환 · 환불 부탁, 마트에서 물건 위치 묻기 |
| `transit` | 길 · 교통 | 4 | 길 묻기, 택시 목적지 말하기, 버스 갈아타기 묻기, 지하철 표 · 충전 |
| `hospital` | 병원 · 약국 | 3 | 증상 말하기, 약국에서 약 사기 · 먹는 법, 예약 시간 바꾸기 |
| `phone` | 전화 | 3 | 식당 예약 전화, 배달 주문 전화, 약속 시간 바꾸는 전화 |
| `social` | 친구 · 모임 | 5 | 처음 만나 자기소개, 약속 잡기, 늦어서 사과, 생일 축하 · 선물, 취미 이야기 |
| `work` | 학교 · 일터 | 3 | 선생님께 질문 · 부탁, 지각 · 결석 알리기, 동료에게 도움 부탁 |
| `service` | 은행 · 택배 · 집 | 2 | 택배 맡기기 · 찾기, 집주인에게 고장 알리기 |

- **급수(lv)**: 초급 `beginner` 14 · 중급 `intermediate` 10 · 고급 `advanced` 6. 같은 category 안에서 섞여도 된다.
- **문체(register)**: 대부분 `polite`(해요체). `social` 중 2개는 `plain`(반말, 친구 사이), 고급 중 2~3개는 `formal`(합쇼체 — 면접 · 격식 있는 전화 같은 곳).
- **턴(turns)**: 장면마다 **3~5턴**.

## 파일 모양 (convo.js 의 CONVO 한 칸과 똑같다)

```json
[
  {
    "id": "cv-restaurant-b-01",
    "category": "restaurant",
    "title": "식당에서 자리 잡기",
    "en": "Getting a table at a restaurant",
    "lv": "beginner",
    "register": "polite",
    "roleUser": "손님",
    "roleOther": "직원",
    "setting": "당신은 친구와 둘이서 식당에 들어갔습니다.",
    "vocab": [["몇 분", "how many people (honorific)"], ["자리", "seat, table"], ["창가", "by the window"]],
    "grammarRefs": [],
    "turns": [
      {
        "id": "cv-restaurant-b-01-1",
        "npc": { "text": "어서 오세요. 몇 분이세요?", "en": "Welcome. How many people?" },
        "userPrompt": "두 명이라고 말해 보세요.",
        "accept": [
          { "k": ["두 명", "두 사람", "둘이"], "why": "인원을 말했는지" },
          { "k": ["이에요", "예요", "입니다"], "why": "문장으로 끝맺었는지" }
        ],
        "model": "두 명이에요.",
        "tip": "사람 수는 「한 명 · 두 명 · 세 명」처럼 고유어 숫자 + 명으로 말해요.",
        "onMiss": { "text": "몇 분이 오셨어요?", "en": "How many of you are there?" }
      }
    ],
    "outro": { "text": "이쪽으로 오세요!", "en": "Right this way!" }
  }
]
```

- **id**: `cv-{category}-{급수 앞글자 b/i/a}-{두 자리 번호}`. `cv-cafe-b-01` 은 이미 있으니 카페 초급은 `cv-cafe-b-02` 부터.
  턴 id 는 `{장면 id}-{1부터 번호}`. 30개 안에서 id 가 겹치지 않게.
- **npc**: NPC 한 마디(`text` 한국어, `en` 영어). **userPrompt**: 학습자가 무엇을 말해야 하는지 한 줄(한국어).
- **model**: 모범 대답 한 문장(그 장면의 register 로).
- **accept**: 「이 말이 들어가면 인정」 묶음 2~3개. 묶음마다 `k`(같은 뜻 말 여러 개)와 `why`(이 묶음이 무엇을 재는지).
  - `k` 의 말은 **두 글자 이상**(「네」「핫」 같은 한 글자 ✗).
  - **묶음 하나 이상은 model 안에 그대로 나오는 말**이어야 한다.
  - 한 턴 안에서 같은 말을 두 묶음에 넣지 않는다.
- **tip**: 그 턴에서 배울 표현 한 줄(없으면 `null`). **onMiss**: 대답이 안 맞을 때 NPC 가 한 번 더 이끄는 말(`text` · `en`), 필요 없으면 `null`.
- **vocab**: `[한국어, 영어]` 짝 3~5개. **grammarRefs**: `[]` 그대로 둔다. **outro**: 마지막 인사(`text` · `en`) 또는 `null`.

## 반드시 지킬 것

- **다른 파일을 고치지 않는다** — 새 파일 `docs/convo-scenes.json` 하나만. `convo.js` · 도구 · 화면 · 자국 모두 건드리지 않는다.
- **사실을 지어내지 않는다** — 실제 가게 · 브랜드 · 은행 · 회사 · 기관 이름, 전화번호, 주소, 가격 제도 · 법 · 요금 규정을 넣지 않는다.
  가격이 필요하면 「사천오백 원」처럼 흔한 금액만. 약 이름 대신 「감기약 · 소화제 · 진통제」.
- 사람 이름을 넣지 않는다(「손님 · 직원 · 친구 · 선생님」으로).
- 대사는 **그 register 에 맞게** — `polite` 는 해요체, `plain` 은 반말, `formal` 은 합쇼체. 한 장면 안에서 섞지 않는다(직원의 「-(으)시겠어요?」 같은 높임은 괜찮다).
- 맞춤법 · 띄어쓰기 · 받침 · 불규칙을 맞춘다. 실제 한국에서 그 자리에서 쓰는 자연스러운 말로.
- 교재 · 다른 사이트 · 드라마 대본을 옮기지 않는다. 전부 새로 쓴다. 한자를 쓰지 않는다.
- 값 안에 홑따옴표(`'`) · 역슬래시(`\`)를 쓰지 않는다(넣는 도구가 막는다). 따옴표가 필요하면 「 」.
- **파일은 UTF-8, LF**(CRLF 로 저장하지 않는다).

## 검토 기록

- **2026-10-02 · 30장면 · 92턴** (`convo-scenes`): 파일 하나만 · 갈래 · 급수 · 문체 개수가 지시 그대로 · id 겹침 없음 — 잘 지켰다. 말은 대체로 자연스럽다.
  고친 것 — **사람 이름**(김민수 ×2 · 마이클 → ○○), **실제처럼 보이는 기관 · 가게 이름**(서울병원 · 국립박물관 · 한국기획 · 바삭치킨 → 병원 · 박물관 · 거래처 · 치킨집),
  **제도 · 관습 단정**(「편의점 봉투는 유상」, 「반찬 리필은 대부분 무료」 → 누그러뜨림), **모범 대답이 스스로 못 맞히는 accept 묶음 12곳**(모범 대답의 말을 더함).
  넣는 길: `node tools/convo-merge.mjs docs/convo-scenes.json --keep-accept`(검토한 accept 를 그대로 — 이번에 더한 길). `check-convo` 「이상 없음」.
