# 낱말 자료의 모양 — `vocab/data/*.json`

「단어」 섹션(`docs/vocab-plan.md`)의 원본 자료. 파일마다 **배열**이고, **한 줄에 낱말 하나**다(고친 곳이 git
차이에서 줄 단위로 보이게). 검사: `node tools/check-vocab.mjs` — 「고쳐야 할 것」이 있으면 CI 가 빨개진다.

```json
{
  "id": "먹다",                 // 겹치면 안 됨. 같은 꼴의 다른 낱말은 "배#2" 처럼
  "head": "먹다",               // 표제어(사전형)
  "pos": "동사",                // 명사 · 대명사 · 수사 · 동사 · 형용사 · 부사 · 관형사 · 감탄사 · 의존 명사 …
  "level": 1,                   // TOPIK 급수 1~6
  "freq": 412,                  // 우리 자료 등장 점수(도구가 채움, 손대지 않음)
  "purposes": ["topik1"],       // vocab/taxonomy.json 의 purposes id
  "topics": ["food/dishes"],    // 「대분류/소분류」 — vocab/taxonomy.json 의 topics
  "en": "to eat",               // 사전 영어 뜻(국립국어원)
  "en_simple": "eat food",      // 쉬운 영어 뜻 — A급 필수, 학습자가 한눈에
  "examples": [                 // 쉬운 것 → 어려운 것. 표제어(또는 활용형)가 들어 있어야
    { "ko": "아침에 밥을 먹어요.", "en": "I eat breakfast in the morning." }
  ],
  "rel": {                      // 있을 때만
    "syn": ["식사하다"], "ant": [], "hon": "드시다", "hanja": []
  },
  "pron": "[먹따]",             // 소리가 글자와 다를 때만 (도구가 채울 예정)
  "hanja": "",                  // 한자어면
  "grade": "C",                 // C 씨앗 → B → A
  "src": ["krdict", "cheesepotato"]
}
```

## 등급
| | 채울 것 |
|---|---|
| **C** 씨앗 | id · head · pos · level · purposes · en (예문은 있으면) |
| **B** | + topics 하나 이상 · examples 하나 이상(en 번역 포함) |
| **A** | + examples 둘 이상 · en_simple |

## 지키는 것
- **id 는 한 번 정하면 바꾸지 않는다** — 학생 기록 · 주소가 id 에 붙는다.
- 예문은 **새로 쓴다**(드라마 · 노래 · 기출 문장을 옮기지 않는다). 초급 낱말의 예문은 초급 문법으로.
- 영어 뜻은 **학습자가 쓰는 말**로 짧게. 사전식 설명을 늘어놓지 않는다.
- `freq` · `src` 는 도구가 채운다 — 손대지 않는다.
- 분류(topics · purposes)를 새로 만들어야 하면 **taxonomy 에 먼저 더하고**(운영자 확인), 그다음 쓴다.

## 파일
| 파일 | 무엇 | 만드는 것 |
|---|---|---|
| `vocab/taxonomy.json` | 목적 10 · 주제 17 × 약 80 (초안) | 사람 |
| `vocab/data/topik1.json` | TOPIK I 필수 후보 | 씨앗: `node tools/vocab-seed.mjs` → 안 그래비티가 채움 |
| `docs/vocab/topik1-candidates.json` | 후보 초안(빈도) | `node tools/vocab-draft.mjs` |
