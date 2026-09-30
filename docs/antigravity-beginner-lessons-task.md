# 안티 그래비티 작업 지시 — 초급 레슨 채우기 (L2 · L3 코스를 코스마다 4강까지)

> 이 파일과 `AGENTS.md` 를 같이 붙여 넣는다. 첫 줄: 「AGENTS.md 를 먼저 읽고, 이 지시문대로만 해.」

**왜:** 초급(L2 · L3)은 코스마다 레슨이 1 ~ 3강뿐이라, 「오늘의 레슨」이 금방 떨어지고 승급 기준(레슨 80%)도 금방 찬다.
코스마다 **4강**까지 채운다(`docs/level-plan.md` 6층 ① — 운영자가 정한 첫 순서). 모두 22강이다.

```bash
git checkout main && git pull origin main
git checkout -b beginner-lessons
node tools/course-prompt.mjs        # 채울 코스 목록 — 「강 n / 4」
```

## 코스 하나를 채우는 순서 — **L2 코스부터**(bg-05 · bg-06 · bg-d-01 · bg-07 · bg-08 · bg-09 · bg-irr-01), 그다음 L3

**1) 지시문을 뽑는다.**

```bash
node tools/course-prompt.mjs bg-05 > /tmp/p.txt
```

`/tmp/p.txt` 를 **그대로** 따라 레슨을 JSON 배열로 만들고 `/tmp/got.json` 에 저장한다.
- 초급은 **설명을 영어로** 쓴다(지시문에 적혀 있다 — 이미 있는 레슨처럼). 예문 · 보기는 한국어.
- 레슨 id 는 지시문의 것을 **한 글자도 바꾸지 않는다.**
- 문법 뜻과 예문은 `sentences.js` 의 그 문법 항목(desc · ex · more)과 어긋나지 않게 — 새 뜻을 지어내지 않는다.

**2) 붙이고 검사한다.**

```bash
node tools/course-merge.mjs bg-05 /tmp/got.json
node tools/check-courses.mjs          # 「문제 없음」 이어야 한다
node tools/build-courses-lite.mjs && node tools/build-pages.mjs && node tools/stamp.mjs
git add -A && git commit -m "course: bg-05 to 4 lessons"
```

**코스 하나 = 커밋 하나.** 다음 코스로 넘어간다. 「이미 4강 — 더 채울 것 없음」이 나오면 건너뛴다.

## 반드시 지킬 것

- 이미 있는 레슨을 **고치거나 지우지 않는다**(진도가 id 로 묶여 있다).
- `course-merge.mjs` 가 「못 붙임」으로 멈추면 JSON 을 고쳐 다시 붙인다. 파일을 손으로 고치지 않는다.
- `check-courses.mjs` 가 멈추면 고치고 다시 돌린다. **검사기 · 도구(`tools/`)를 고치지 않는다.**
- 한자를 쓰지 않는다. 사람 이름은 흔한 것만.

## 끝낼 때 (몇 개를 했든)

```bash
node tools/stamp.mjs --check
node tools/check-geo.mjs     # 레슨 수가 늘어 첫 쪽 숫자가 걸리면 index.html · llms.txt · tools/build-legal.mjs 를 검사기가 말하는 값으로 바꾸고 node tools/build-legal.mjs
git push -u origin beginner-lessons
```

PR 은 열지 않는다 — Claude 가 검토하고 연다. **`git push` 까지 꼭 한다.** 한 번에 다 못 하면 **L2 앞쪽부터** 하고 멈춘다.

## 검토 기록

- **2026-09-30 · 2차** (bg-06-04 · bg-07-03~04 · bg-08-03~04 · bg-09-04 · bg-irr-01-03~04 · bg-d-01-03~04, 레슨 348 → 358):
  정답이 둘이 되는 보기 8개를 바꿨다 — 과거형(이야기했어요 · 걸었어요 · 줬어요 · 들었어요) · 미래형은 문장에
  그대로 들어가 맞는 말이 되고, 「동생이」 · 「문을 달아요」 · 「마시어요」 · 「운동하여요」도 틀린 말이 아니다.
  `courses-beginner-stage1.js` 가 CRLF 로 올라와 LF 로 되돌렸다. **다음부터: 오답 보기에 시제만 다른 꼴을 넣지 않는다.**
