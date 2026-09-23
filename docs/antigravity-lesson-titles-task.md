# 안티 그래비티 작업 지시 — 중·고급 레슨 제목 영어로

> 이 파일 전체를 안티 그래비티에 붙여 넣는다.

## 왜

중·고급 레슨 **191개의 제목이 한국어뿐**이다. 사이트 기본 화면은 영어라서, 영어로
보는 학습자에게도 레슨 목록이 「2강. 짐작과 의도를 담은 연결 (-ㄹ 텐데 · -ㄹ 테니까)」로
나온다. 코스 제목에는 이미 영어가 있다. **레슨 제목만** 옮긴다 — 레슨 본문은
중급 이상 학습자용이라 한국어로 둔다.

## 순서

```bash
git checkout main && git pull origin main
git checkout -b lesson-titles-en

node tools/lesson-titles.mjs dump > /tmp/titles.json
```

`/tmp/titles.json` 은 `{ "레슨 id": "한국어 제목", … }` 이다. **같은 id 로** 영어 제목을
적은 JSON 을 만들어 `/tmp/en.json` 에 저장한다 (한 번에 50개씩 나눠도 된다).

```json
{
  "im-c48-02": "Lesson 2. Guessing with intent (-(으)ㄹ 텐데 · -(으)ㄹ 테니까)",
  "im-c48-03": "Lesson 3. Telling guesses apart (-(으)ㄹ걸요 · -(으)ㄹ지도 몰라요)"
}
```

```bash
node tools/lesson-titles.mjs apply /tmp/en.json   # 문제가 있으면 아무것도 안 바꾸고 멈춘다
node tools/check-courses.mjs                      # 반드시. 「문제 없음」 이어야 한다
node tools/build-pages.mjs && node tools/stamp.mjs && node tools/stamp.mjs --check
git add -A && git commit -m "courses: English lesson titles (N)"
```

50개씩 했으면 `dump` 부터 다시 — 이미 붙인 것은 목록에서 빠진다. `dump` 가
「영어가 없는 레슨 0개」라고 할 때까지.

## 제목 쓰는 법

- **`Lesson N.` 으로 시작한다.** 한국어의 「N강.」 자리다.
- **문법 이름은 한국어 그대로 괄호 안에 둔다.** `(-(으)ㄹ 텐데)` 를 영어로 옮기지 않는다 —
  학습자가 외울 것이 바로 그것이다.
- 괄호 밖 설명만 영어로. 짧게, **90자 이하**.
- 뜻을 옮긴다. 낱말을 옮기지 않는다: 「헷갈리는 짐작 표현 가르기」 →
  `Telling similar guesses apart`, 「실제 상황에서 쓰기」 → `Using it in real situations`.
- 같은 코스의 1~4강은 말투를 맞춘다.

도구가 막는 것: 없는 id, 빈 제목, **괄호·낫표 밖의 한글**, 90자 초과.

## 하지 말 것

- `courses-grammar-detailed.js` 를 **손으로 고치지 않는다.** 3천 줄이 넘어서 괄호 하나로
  통째로 깨진다. 제목은 `lesson-titles.mjs` 로만 바꾼다.
- 레슨 본문(text · note · 문제)은 건드리지 않는다.
- `check-courses.mjs` 를 건너뛰지 않는다. **지난 두 번 모두 이걸 안 돌려서 줄바꿈이 깨진
  채 올라왔다** — 검사기가 CI 에서 막으니 PR 이 빨갛게 뜬다.

## 끝낼 때

```bash
git push -u origin lesson-titles-en
```

PR 설명에 붙인 개수를 적는다.
