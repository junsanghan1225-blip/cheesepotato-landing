# 안티 그래비티 작업 지시 — 레슨별 새 블록 (코스 몇 개씩 한 묶음)

> 이 파일과 `AGENTS.md` 를 같이 붙여 넣는다. 첫 줄: 「AGENTS.md 를 먼저 읽고, 이 지시문대로만 해. 이번 묶음은 **<코스 id 목록>** 이야.」
> 브랜치: `ag/lesson-blocks-N` (main 에서 새로). 운영자 결정 2026-10-15. 큰 그림은 `docs/plans/course-blocks.md`.

## 무엇을
레슨마다 **필요한 새 블록**을 쓴다(종류: vocab · dictate · write · compare · correct · listen · conj · passage · expand · cando). 무엇을 몇 개 쓸지는 `docs/lesson-blocks/_needs.json` 에 레슨마다 정해져 있다(`need` 칸, `done:true` 는 건너뜀).
결과는 **코스 하나당 파일 하나**: `docs/lesson-blocks/<코스 id>.json`
```json
{ "<레슨 id>": [ { "t": "vocab", … }, { "t": "dictate", … }, { "t": "write", … } ] }
```
- 원래 레슨 블록(`courses*.js`)은 **고치지 않는다**. 레슨 id 도.
- 레슨이 뭘 가르치는지 먼저 본다: `node tools/show-lesson.mjs <레슨 id | 코스 id>` (지금 블록이 글로 나온다). 새 블록은 **그 레슨의 문법 · 낱말 · 예문 그대로** — 레슨에 없는 문법 · 낱말을 갑자기 들이지 않는다.

## 블록 모양 (자세히는 `courses.js` 맨 위 설명)
- `vocab` — `{ "t":"vocab", "h":"Words for this lesson", "items":[{ "ko":"학생", "en":"student", "ex":"저는 학생이에요." }, …] }` 3~8개. ko 는 사전 꼴이 아니라 **레슨에 나온 꼴 그대로**(예문 속 낱말). en 은 짧은 영어 뜻.
- `dictate` — `{ "t":"dictate", "say":"저는 학생이에요", "answers":["저는 학생이에요"], "hint":"…", "why":"…" }` 들려줄 문장이 `say`. 초급은 12음절 안쪽. 띄어쓰기만 다른 답은 화면이 알려 주니 `answers` 에는 **맞는 쓰기**만(띄어쓰기 변형 · 합당한 어순 변형 몇 개). 구두점 안 넣는다.
- `write` — `{ "t":"write", "q":"Write one sentence about …", "must":["어제"], "sample":"어제 영화를 봤어요.", "why":"…" }` 정답이 하나가 아닌 문제. `must` 는 글에 **그대로 들어 있어야 할 조각**(문형의 일부, 한두 개) — 채점은 「포함」이라 활용형 때문에 못 맞힐 조각은 쓰지 않는다. `sample` 은 모범 한 문장.
- `compare` — `{ "t":"compare", "h":"…", "a":{ "h":"-아서", "d":"뜻풀이 한 줄", "ex":["비가 와**서** 집에 있어요. — …"] }, "b":{ … }, "tip":"고르는 기준 한 줄" }` a · b 는 **이 레슨이 다루는 두 문법**. 예문의 핵심 부분은 `**…**` 로 굵게. 예문 뒤 영어 뜻은 ` — ` 로 붙인다.
- `correct` — `{ "t":"correct", "q":"Fix the mistake.", "wrong":"비가 와서 우산을 쓰세요.", "answers":["비가 오니까 우산을 쓰세요."], "hint":"…", "why":"…" }` **한 곳만** 틀린 문장. `answers` 는 맞는 고침을 빠짐없이.
- `listen` — `{ "t":"listen", "say":"가", "q":"Which did you hear?", "options":["가","카","까"], "answer":0 }` 한글 레슨의 소리 구분. 비슷한 소리끼리, 보기 3~4개, `answer` 는 인덱스(보기는 화면이 섞는다).
- `conj` — 활용 표 채우기. `{ "t":"conj", "h":"Fill the forms", "forms":["present","past","future"], "verbs":[{ "v":"먹다", "pos":"동사", "en":"to eat" }, …] }` verbs 3~5개(이 레슨에 나온 동사 · 형용사 **사전 꼴**), forms 는 `present` · `past` · `future` · `and`(-고) · `mod`(꾸미는 꼴) 중 이 레슨에 맞는 둘 이상. **정답은 쓰지 않는다** — 빌드 도구가 활용을 계산해 채우고, 도구가 모르는 낱말이면 오류를 알려 준다(그 낱말을 다른 것으로).
- `passage` — 짧은 글. `{ "t":"passage", "h":"Read a little", "ko":["줄1","줄2","줄3"], "en":["line 1","line 2","line 3"] }` 2~5줄. **바로 뒤에 이해 문제 `choice` 2개**를 붙인다(참 · 거짓도 `choice` 로, 보기 `["Yes","No"]`). 글은 이 레슨의 문법 · 낱말로, 글 속에서 쓰이는 모습이 보이게.
- `expand` — 문장 늘리기. `{ "t":"expand", "base":{ "tokens":["저는","학생이에요."], "en":"I am a student." }, "steps":[ { "tokens":["저는","한국어","학생이에요."], "en":"I am a Korean-language student." }, … ] }` steps 2~4개, **단계마다 글자 수가 늘어야** 한다(조각을 하나씩 얹음). `tokens` 는 맞는 어순 그대로의 조각(화면이 섞어 준다). 어절이 아니라 의미 덩어리 단위여도 된다.
- `cando` — 이제 할 수 있어요 자기 점검. `{ "t":"cando", "items":["I can say …", "I can …"] }` 2~4줄, 영어로 「I can …」, 이 레슨의 목표.
- 블록 자리를 바꾸고 싶으면 블록에 `"at": 번호`(원래 레슨 안에서의 자리). 없으면 읽는 블록(compare · vocab)은 첫 문제 앞, 푸는 블록은 끝.

## 꼭 지킬 것 (검토에서 되돌려 보내는 것)
1. **기출 아님** — 전부 창작. 실제 TOPIK · EPS 문항을 옮기지 않는다.
2. **정답이 하나로 정해지게**(`correct` · `dictate` · `listen`). 맞는 답이 둘이면 둘 다 `answers` 에. `write` 만 정답이 열려 있다.
3. 설명 · 질문(`q` · `hint` · `why` · 영어 뜻)은 **영어**, 한국어 문장은 한국어. 레슨 수준에 맞는 쉬운 영어.
4. 한국어 문장은 **자연스럽고 맞는 문장**. 한글 레슨의 `listen` 은 실제로 소리가 구별되는 글자끼리.
5. 한 레슨에 같은 문장을 블록마다 되풀이하지 않는다. 레슨의 원래 문제와 같은 문장도 피한다.
6. `_needs.json` 의 `need` 에 없는 블록을 만들지 않고, 있는 것을 빼지도 않는다(수는 `n`). `passage` 의 이해 문제 `choice` 2개는 `need` 수와 별도로 더한다.
7. `expand` 는 **조각을 얹을수록 자연스러운 한국어**여야 한다(어색한 중간 문장 금지). `cando` 는 레슨이 실제로 다룬 것만.

## 올리기
- 검사: `node tools/build-lesson-blocks.mjs` — 모양이 틀리면 어디가 틀렸는지 알려 준다. 통과하면 `lesson-extra/` 가 만들어진다.
- 커밋: `docs/lesson-blocks/<코스 id>.json` 들 + `lesson-extra/` . 메시지: `레슨 블록 N묶음 — <코스 id …> (레슨 X개 · 블록 Y개)`
