# 안티 그래비티 작업 지시 — 「교과서 말 vs 진짜 말」 10편

> 이 파일 전체를 안티 그래비티에 붙여 넣는다.

## 왜

사이트에 오는 사람은 레딧에서 많이 온다. 그들이 가장 궁금해하는 것은 문법표가 아니라 **「한국 사람은
실제로 이렇게 말해?」**다. 교과서의 「안녕하십니까」와 실제 카톡의 「ㅎㅇ」 사이가 이 시리즈의 자리다.
공유가 잘 되고, 검색에 많이 걸리고, 치즈(🧀)와 감자(🥔)의 대화로 보여 주기 좋다.

## 만들 것 — 영어 글 10편 (`lang: 'en'`)

| id | 주제 |
|---|---|
| `korean-titles-unni-oppa-sunbae-english` | 호칭 — 언니 · 오빠 · 누나 · 형 · 선배 · 사장님 · 이모님 · 쌤. 누가 누구에게 |
| `kakaotalk-korean-texting-english` | 카톡 말투 — ㅋㅋ와 ㅎㅎ, ㅠㅠ, 마침표를 찍으면 화나 보이는 이유, 「네」와 「넹」 「네넹」 |
| `korean-texting-abbreviations-english` | 줄임말 — ㄱㅅ · ㅇㅋ · ㄹㅇ · ㅈㅅ · 헐 · 갑분싸 … 언제 쓰면 안 되나까지 |
| `when-to-use-banmal-vs-jondaetmal-english` | 존댓말 경계 — 동갑 첫 만남 · 회사 동료 · 편의점 직원 · 「말 편하게 하세요」 |
| `lets-eat-sometime-korean-english` | 「밥 한번 먹어요」는 약속이 아니다 — 인사처럼 쓰는 말들 |
| `gwaenchanayo-meanings-english` | 「괜찮아요」의 여러 뜻 — 좋다 · 됐다(거절) · 신경 쓰지 마 |
| `korean-reactions-heol-daebak-english` | 맞장구 — 아~ 진짜? · 헐 · 대박 · 그니까 · 맞아맞아 |
| `how-to-say-no-in-korean-english` | 부드럽게 거절하기 — 「좀 어려울 것 같아요」 「다음에 꼭!」 |
| `korean-apologies-strength-english` | 사과의 세기 — 미안 · 미안해요 · 죄송해요 · 죄송합니다 · 송구합니다 |
| `textbook-vs-real-korean-english` | 교과서 말 vs 진짜 말 20쌍 — 시리즈의 입구 글. 앞 9편으로 링크 |

글 하나의 짜임(700~1,000낱말):
1. 한 장면으로 시작 — 「You text a Korean coworker 네. and they ask if you're angry.」
2. **교과서 말 vs 진짜 말** 을 `ex` 로 나란히(한국어 + 영어 뜻)
3. **치즈와 감자의 대화(`dlg`) 두 개 이상** — 같은 상황의 「어색한 말」과 「자연스러운 말」
4. 「언제 쓰면 안 되나」를 반드시 — `note` 하나(`"title": "Careful"`)
5. 문법 카드 `gram` 하나 이상, 시리즈 안의 다른 글로 `link`(이미 올라간 글만)

`tags: ['Real Korean', 'English']` — 이 두 갈래만.

## 말이 진짜여야 한다 — 가장 중요

- **실제로 20~30대 한국 사람이 쓰는 말만.** 유행이 지난 말(「안습」 「지못미」 같은)은 「old-fashioned now」
  라고 밝히거나 뺀다. 확실하지 않은 말은 넣지 않는다.
- 욕 · 비하 · 성적인 말은 넣지 않는다. 「씨」 「놈」처럼 오해를 부르는 말은 설명만 하고 권하지 않는다.
- 지역 · 세대 · 성별로 달라지는 것은 그렇다고 적는다(「Mostly used by women in their 20s」처럼).
- **운영자(한국어 원어민)가 볼 곳에 표시한다** — 자연스러운지 자신 없는 문장 옆에 `note` 를
  `"title": "운영자 확인"` 으로. 운영자가 보고 지운다. 이 시리즈는 운영자 확인을 거쳐야 올라간다.
- 대화의 A(치즈)와 B(감자)는 둘 다 한국 사람일 수도, 한 쪽이 학습자일 수도 있다 — 학습자 쪽은 교과서 말을
  쓰다가 고쳐 받는 모습이 좋다.

## 순서

```bash
git checkout main && git pull origin main
git checkout -b blog-real-korean
node tools/blog-prompt.mjs --en beginner "texting in Korean" > /tmp/rules.txt
```

글 하나마다 `/tmp/<id>.json` → `node tools/blog-merge.mjs /tmp/<id>.json` → `node tools/check-blog.mjs`.
**글 하나 = 커밋 하나.** 입구 글(`textbook-vs-real-korean-english`)은 **맨 마지막에** — 앞 글들로 링크한다.

다 쓰면:

```bash
node tools/build-pages.mjs
git pull origin main
node tools/stamp.mjs && node tools/stamp.mjs --check
git push -u origin blog-real-korean
```

## 하지 말 것

- `tools/` 를 고치지 않는다. 검사에 막히면 글을 고친다.
- 이미 있는 글을 고치지 않는다(`when-to-use-banmal` 은 한국어 글이 이미 있다 — 영어 글은 따로 새로 쓴다).
- 드라마 · 노래 가사 · 웹툰 대사를 옮기지 않는다(저작권). 대화는 전부 새로 쓴다.
- `stamp.mjs --check` 를 건너뛰지 않는다.

PR 설명에 글마다 낱말 수와 「운영자 확인」 note 가 붙은 곳을 적는다.
