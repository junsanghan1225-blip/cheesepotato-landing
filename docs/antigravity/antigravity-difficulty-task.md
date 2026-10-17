# 안티 그래비티 작업 지시 — TOPIK 문항 난이도 매기기 (쉬움 · 보통 · 어려움)

> 이 파일과 `AGENTS.md` 를 같이 붙여 넣는다. 첫 줄: 「AGENTS.md 를 먼저 읽고, 이 지시문대로만 해. 이번 묶음은 **○○** 야.」
> 운영자 2026-10-17 「유형별 문제에 난이도를 보여주자 · 난이도는 안티한테」. 문항 글은 **고치지 않는다.** 난이도 숫자만 적는다.

## 무엇을
우리 TOPIK 연습 문항(전부 창작)마다 **난이도 1 · 2 · 3**(1 = 쉬움 · 2 = 보통 · 3 = 어려움)을 매긴다. 같은 **유형 · 같은 급 안에서 견주는 상대 난이도**다(2급 문제가 1급 문제보다 항상 어렵다는 뜻이 아니다 — 같은 급 · 같은 유형 안에서 쉬운 쪽 / 어려운 쪽).

## 묶음 (한 번에 하나)
| 묶음 | 문항 수 | 결과 파일 | 브랜치 |
|---|---|---|---|
| `writing`(TOPIK II 쓰기 51~54) | 200 | `docs/difficulty/writing.json` | `ag/difficulty-writing` |
| `listening`(듣기 I · II) | 165 | `docs/difficulty/listening.json` | `ag/difficulty-listening` |
| `reading-i`(읽기 I) | 400 | `docs/difficulty/reading-i.json` | `ag/difficulty-reading-i` |
| `reading-ii-a`(읽기 II 앞 305) | 305 | `docs/difficulty/reading-ii-a.json` | `ag/difficulty-reading-ii-a` |
| `reading-ii-b`(읽기 II 뒤 300) | 300 | `docs/difficulty/reading-ii-b.json` | `ag/difficulty-reading-ii-b` |
순서: writing → listening → reading-i → reading-ii-a → reading-ii-b.

## 하는 법
1. `git pull` 로 main 을 받고 브랜치를 만든다.
2. `node tools/difficulty-list.mjs <묶음>` — 문항을 한 줄씩(id · 번호 · 유형 · 급 · 글 앞부분) 보여 준다. 글 전체가 필요하면 원본 자료 파일(`topik-writing.js` · `topik.js` · `topik2.js` · `topik-listening.js`)에서 그 id 를 찾아 읽는다.
3. 문항마다 난이도를 매겨 `docs/difficulty/<묶음>.json` 에 `{ "문항 id": 1 | 2 | 3 }` 으로 적는다(키는 id 그대로, 값은 숫자).
4. `node tools/difficulty-list.mjs <묶음> --check` 가 「N/N 매김」으로 끝나면(빠진 것 · 없는 id 없음) 커밋한다.

## 매기는 눈금
- **읽기**: 지문 길이 · 어휘 수준(TOPIK 급에 비해 어려운 낱말 수) · 문장 구조(길게 이어진 문장 · 피동 · 인용) · 정답을 찾기 위해 필요한 단계(바로 보임 / 연결해야 함 / 추론해야 함) · 오답 보기가 얼마나 비슷한가.
- **듣기**: 대화 길이 · 말의 빠르기가 느껴지는 압축 정도 · 어휘 · 정답에 필요한 단서 수(하나 / 둘 이상을 합쳐야 함) · 오답 보기가 대화 속 낱말을 그대로 써서 속이는가.
- **쓰기**: 51 · 52 = 빈칸 앞뒤 문맥에서 필요한 문법 · 어휘의 어려움과 문체 맞추기 / 53 = 자료 항목 수 · 증감 표현의 어려움 / 54 = 주제의 추상성 · 요구 과제 수 · 필요한 논리 구조.
- 분포는 대략 **쉬움 25% · 보통 50% · 어려움 25%** 를 목표로 하되, 문항이 그렇지 않으면 억지로 맞추지 않는다.
- 한 유형 안에서 전부 같은 숫자로 찍지 않는다(그러면 보여 줄 의미가 없다).

## 꼭 지킬 것
- 문항 · 정답 · 해설 **글을 고치지 않는다.** 이 일은 숫자만이다. 오류를 발견하면 `docs/difficulty/<묶음>-notes.md` 에 id 와 한 줄로만 적는다(고치지 않는다).
- 실제 TOPIK 기출과 비슷한 문항이라고 판단되면 notes 에 id 를 적는다(기출 아님을 지켜야 한다).
- 생각나는 대로가 아니라 위 눈금으로 — 같은 눈금을 끝까지 쓴다.

## 올리기
- 커밋 메시지: `난이도 — <묶음> N개`. 브랜치를 푸시한다(PR 은 만들지 않는다 — Claude 가 검토해 넣는다).
- 끝나면 한 줄로 알린다: 「<브랜치> · N개 · 쉬움/보통/어려움 몇 개 · <커밋 앞 7자리> 올림」.
