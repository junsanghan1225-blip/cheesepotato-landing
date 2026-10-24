# 안티 그래비티 작업 지시 — 책 QR 보너스 연습 (첫걸음 워크북)

> 이 파일과 `AGENTS.md` 를 같이 붙여 넣는다. 첫 줄: 「AGENTS.md 를 먼저 읽고, 이 지시문대로만 해. 이번 묶음은 **<단원 id 몇 개>** 이야.」
> 운영자 2026-10-23 「QR 들어갔을 때 채울 수 있는 콘텐츠가 필요해」(책 밖 보너스). 책의 QR 을 찍으면 단원마다 **낱말 카드 · 퀴즈 · 빈칸 쓰기**가 열린다. 책 안의 연습과 겹치지 않는 **새 문항**이어야 한다.

## 무엇을
- 결과 파일: **`docs/bonus/first-steps-workbook.json`** 한 파일(묶음마다 이어서 더한다, 이미 있는 단원은 건드리지 않는다). 브랜치 `ag/bonus-N`.
- 단원 목록(`units` 의 키): 아래 「아직 없는 단원」 `22`개. 시범은 `greetings-self-introduction`(이미 있음, 모양 · 난이도 참고).
- 모양(단원 하나):

```json
"단원id": {
  "cards": [ { "ko": "처음 뵙겠습니다", "en": "How do you do? (very formal, first meeting)" } ],
  "quiz":  [ { "q": "영어 질문", "opts": ["보기1", "보기2", "보기3", "보기4"], "a": 1, "why": "영어 한두 문장 풀이" } ],
  "fill":  [ { "q": "만나서 ___.", "en": "Nice to meet you.", "a": ["반갑습니다"] } ]
}
```
- 개수: `cards` 8개(6~12), `quiz` 5개(4~8, 보기 3~4개), `fill` 5개(4~8). `a`(quiz)는 정답 보기의 번호(0부터). `fill.a` 는 **글 배열**(허용하는 답이 둘 이상이면 모두).

## 규칙 (꼭 지킬 것)
1. **책 안 연습과 겹치지 않게.** `docs/worksheets/<단원>.json` 의 연습 문항 · 예문과 같은 문장을 쓰지 않는다(검사가 막는다). 낱말 하나가 겹치는 것은 괜찮다.
2. **그 단원까지 배운 낱말 · 문법 안에서.** 책 순서는 `docs/books/first-steps-workbook.json` 의 `parts`. 새 낱말(카드)은 그 단원 주제와 맞는 것.
3. **한국어는 자연스럽고 정확하게.** 의심되면 그 문항은 빼고 `docs/antigravity/bonus-notes.md` 에 단원 id 와 한 줄로 적는다.
4. 퀴즈는 정답이 **하나**만 맞는 문제. 틀린 보기도 그럴듯해야 하고, 풀이(`why`)는 왜 맞는지 한두 문장.
5. 빈칸 `fill.q` 에 `___` 가 **하나**. 정답은 한글로 칠 수 있는 짧은 말(한두 낱말). 영어 뜻(`en`)은 꼭.
6. 줄표(—)를 쓰지 않는다. 실제 TOPIK · EPS 기출 문장을 쓰지 않는다(전부 창작).
7. 다른 파일 · 이미 있는 단원을 고치지 않는다.

## 하는 법
1. `git pull` 로 main 을 받고 브랜치를 만든다.
2. `docs/bonus/first-steps-workbook.json` 의 `units` 에 단원을 더한다.
3. `node tools/check-bonus.mjs` 가 **OK** 인지 본다(개수 · 보기 번호 · 풀이 · 책 안 문장 겹침 · 줄표).
4. `node tools/build-bonus.mjs` 로 쪽이 만들어지는지 본다. 그다음 **JSON 파일만** 커밋한다(`bonus/` 폴더는 Claude 가 만든다).
- 커밋 메시지: `첫걸음 보너스 연습 — <단원 id 범위> N단원`. 브랜치를 푸시한다(PR 은 만들지 않는다). 끝나면 한 줄: 「<브랜치> · N단원 · 건너뜀 K · <커밋 앞 7자리> 올림」.

## 아직 없는 단원 (16개)
- `polite-present`
- `basic-verbs-adjectives`
- `numbers-counters`
- `days-months-dates`
- `family-terms`
- `location-places-exist`
- `colors-shapes-opposites`
- `house-rooms-furniture`
- `school-classroom`
- `food-ordering-taste`
- `shopping-prices-clothes`
- `directions-transportation`
- `weather-seasons-temperature`
- `hobbies-leisure-sports`
- `health-hospital`
- `negation-tenses`

## Claude 가 검토할 것
한국어가 맞는가 · 퀴즈 정답이 하나뿐인가 · 책 문항과 겹치지 않는가 · 풀이가 맞는가 · 배우지 않은 말이 나오지 않는가.
