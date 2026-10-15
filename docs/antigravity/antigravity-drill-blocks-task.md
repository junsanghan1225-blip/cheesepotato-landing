# 안티 그래비티 작업 지시 — 집중 훈련 추가 문제 (문법 30개쯤 한 묶음)

> 이 파일과 `AGENTS.md` 를 같이 붙여 넣는다. 첫 줄: 「AGENTS.md 를 먼저 읽고, 이 지시문대로만 해. 이번 묶음은 **<문법 id 목록>** 이야.」
> 브랜치: `ag/drill-blocks-N` (main 에서 새로). 운영자 2026-10-15 레슨 대격변 5단계. 큰 그림은 `docs/plans/lesson-redesign.md` 방향 D.

## 왜
학생이 레슨을 풀며 어떤 문법에서 약한 것으로 드러나면 **「집중 훈련 · 8문제」**가 그 문법의 문제만 뽑아 풀린다. 그런데 문법에 따라 레슨의 문제가 8개 밑이라 같은 문제가 되풀이된다. 모자란 만큼 **그 문법의 연습 문제**를 더한다.

## 무엇을 (할 문법 고르기)
- 먼저 레슨 블록 묶음(`antigravity-lesson-blocks-task.md`)이 많이 들어온 뒤에 한다(그래야 모자란 곳이 정확하다).
- `node tools/drill-needs.mjs --todo` — 「문법 id · 지금 풀 문제 수 · 붙은 레슨 수 · 이름」. **레슨이 붙은 것(2번째 칸 아래 3번째 칸이 0레슨이 아닌 것)만** 한다(레슨이 없는 문법은 약점으로 잡히지 않는다). 모자란 수(`8 − 지금 수`) **이상**을 쓴다(넉넉히, 한 문법 최대 12개).
- 문법 하나가 뭘 가르치는지: `node tools/show-grammar.mjs <id>` (이름 · 뜻 · 예문 · 대화).

## 결과 모양
`docs/drill-blocks/<묶음 이름>.json` 하나에:
```json
{ "27-2": [
  { "t": "choice", "q": "Choose the sentence that means “I rest or read.”", "options": ["쉬거나 읽어요", "쉬고 읽어요", "쉬어서 읽어요"], "answer": 0, "why": "…" },
  { "t": "cloze", "sentence": "주말에는 영화를 [보거나] 책을 읽어요.", "answer": "보거나", "options": ["보거나", "보고", "봐서"], "why": "…" },
  { "t": "correct", "q": "Fix the mistake.", "wrong": "커피를 마시거나 차를 마시고 싶어요 .", "answers": ["…"], "hint": "…", "why": "…" },
  { "t": "build", "q": "Say: “Do you want tea or coffee?”", "answers": ["차나 커피를 마실래요?"], "hint": "…" }
] }
```
- 종류는 **`choice` · `cloze` · `correct` · `build` · `dictate`** 만(레슨 블록 모양과 같다 — `antigravity-lesson-blocks-task.md` 「블록 모양」). `at` 은 쓰지 않는다.
- 한 문법에 **종류를 섞는다**(choice 만 12개는 안 된다). 쉬운 것부터 어려운 것까지(그 문법의 단계에 맞게).

## 꼭 지킬 것
1. **그 문법의 꼴 · 뜻을 실제로 묻는다**(검토에서 하나씩 본다). 짝으로 쓰는 문법(N에서 N까지 …)은 짝이 다 있게.
2. **정답이 하나로 정해지게**(`choice` 의 헷갈리는 보기는 그럴듯하되 틀린 것, `correct` 는 한 곳만 틀리게). 맞는 답이 둘이면 둘 다 `answers`.
3. 질문 · 힌트 · 풀이(`q` · `hint` · `why`)와 영어 뜻은 **영어**, 한국어 문장은 **자연스럽고 맞는 한국어**. 영어 줄임말 따옴표를 빼먹지 않는다(Let's · don't · it's).
4. **기출 아님** — 전부 창작. 실제 TOPIK · EPS 문항을 옮기지 않는다. 사실(기관 · 법 · 요율)을 지어내지 않는다.
5. 레슨의 원래 문제나 `docs/grammar-sentences.json` 의 문장과 **같은 문장을 쓰지 않는다**. 한 문법 안에서도 겹치지 않는다.
6. 문법 id 가 틀리면 검사가 막는다(`sentences*.js` 의 id).

## 올리기
- 검사: `node tools/build-drill-blocks.mjs` — 모양이 틀리면 어디가 틀렸는지 알려 준다. 통과하면 `drill-extra.json` 이 만들어진다.
- 커밋: `docs/drill-blocks/<묶음>.json` · `drill-extra.json`. 메시지: `집중 훈련 문제 N묶음 — <문법 id 범위> (X개 문법 · Y문제)`
