# 안티 그래비티 작업 지시 — 조사 워크북 「생각해 보는 칸」 더하기

> 이 파일과 `AGENTS.md` 를 같이 붙여 넣는다. 첫 줄: 「AGENTS.md 를 먼저 읽고, 이 지시문대로만 해. 이번 묶음은 **<단원 id 앞부분 · 예: pt-26-1~pt-26-8>** 이야.」
> 운영자 2026-10-22 「조사 워크북에 고민할 여지가 있는 요소를 더 추가」. 지금 단원은 「채우기 · 틀린 곳 고치기 · 말하기 · 내 문장」이라 답이 하나로 딱 떨어진다. 여기에 **답이 둘 가능하거나, 왜 그런지 설명해야 하는 칸**을 단원마다 더해 학습자가 멈춰서 생각하게 한다.

## 무엇을
- 지금 상태: `node tools/think-list.mjs particles-workbook --todo` — 아직 칸이 없는 단원(id · 제목 · 이미 있는 칸 · 「Watch out」 · 표 앞 3줄). 범위를 줄이려면 끝에 앞부분을 붙인다: `… --todo pt-26-1`.
- 결과 파일: **`docs/books/particles-workbook.think.json`** 한 파일(묶음마다 이어서 더한다). 브랜치 `ag/particles-think-N`. 이미 있는 키(`pt-26-1`)는 시범이니 건드리지 않는다.
- 모양: 키 = 단원 id, 값 = **칸 배열**. 칸은 `practice` 하나 이상.

```json
"pt-26-1": [ { "type": "practice",
  "title": { "en": "Think it through · Which fits better?", "ko": "생각해 보기 · 어느 쪽이 더 맞을까요?" },
  "hint": "Sometimes more than one is possible. Choose, then say why.",
  "items": [
    { "q": "누가 학생이에요?  (Who is the student?)   (a) 저는 학생이에요.   (b) 제가 학생이에요.",
      "a": "(b) 제가 학생이에요. The question asks who, so the answer, the new information, takes 이/가." } ] } ]
```

## 단원 종류별로 만들 칸
| 단원 | 칸 제목(en / ko) | 문제 수 | 문제 모양 |
|---|---|---|---|
| `pt-26-*` (조사 하나씩, 20개) | `Think it through · …` / `생각해 보기 · …` | 4 | ① 두 문장 중 더 자연스러운 것 고르고 이유 ② 「둘 다 맞다. 뜻은 어떻게 다를까?」 ③ 틀린 문장 하나를 찾고 왜 틀렸는지 ④ 「왜 이 조사일까?」 한 줄 설명 |
| `ct-*` (헷갈리는 조사 가르기, 8개) | `Explain the difference · …` / `차이를 설명해 보세요` | 5 | 같은 문장에 조사만 바꿔 놓고 **뜻이 어떻게 달라지나**, 또는 상황을 주고 어느 조사를 왜 고르나 |
| `rv-*` (복습 시험, 6개) | `Trap round · …` / `함정 라운드` | 5 | 처음 떠오르는 답이 **틀리는** 문장(ㄹ 받침 + 으로, 에게/한테 vs 에, 의문사 뒤 이/가, 에서 vs 에 …) |
| `pt-guide` | 만들지 않는다 | | |

## 규칙 (꼭 지킬 것)
1. **답이 사실이어야 한다.** 한국어가 자연스러운지 스스로 두 번 확인한다. 의심스러우면 그 문제는 빼고 `docs/antigravity/particles-think-notes.md` 에 단원 id 와 한 줄로만 적는다.
2. **`a`(답)는 결론부터 한두 문장**: `(b) …` · `이: …` · `Both are correct. …`. 설명은 영어, 한국어 예문은 그대로. 답이 둘 가능하면 둘 다 적고 뜻 차이를 말한다.
3. 문제 글(`q`)은 한국어 문장 + 괄호 영어 뜻. 빈칸은 `___`. 선택지는 `(a) … (b) …` 로 한 줄에.
4. **그 단원까지 배운 조사 · 낱말 안에서만** 쓴다(책 순서: `pt-guide → pt-26-1 …` 은 `docs/books/particles-workbook.json` 의 `parts` 순서). A1~A2 낱말. 단원 id 의 조사를 중심에 둔다.
5. 문장은 전부 새로 만든다. **실제 TOPIK · EPS 기출 문장을 쓰지 않는다.**
6. 줄표(—)를 쓰지 않는다(쉼표 · 쌍점으로). 한 문제 `q` + `a` 합쳐 280자 안쪽.
7. 칸의 `title` 은 영어 · 한국어 둘 다, `hint` 는 영어 한 줄(없어도 된다).
8. 다른 파일 · 다른 단원 · 이미 있는 칸을 고치지 않는다.

## 하는 법
1. `git pull` 로 main 을 받고 브랜치를 만든다.
2. `node tools/think-list.mjs particles-workbook --todo pt-26-1` 처럼 한 묶음(단원 8~12개)을 본다.
3. `docs/books/particles-workbook.think.json` 에 키를 더한다(있는 키는 건드리지 않는다).
4. `node tools/build-book.mjs particles-workbook --digital` 이 에러 없이 끝나는지 본다(문제 3~8개 · 줄표 · 없는 단원 id 는 여기서 막힌다). 그 다음 JSON 만 커밋한다(`books-out/` 은 올리지 않는다).

## 올리기
- 커밋 메시지: `조사 워크북 생각해 보는 칸 — <단원 id 범위> N단원`. 브랜치를 푸시한다(PR 은 만들지 않는다 — Claude 가 검토해 넣는다).
- 끝나면 한 줄로 알린다: 「<브랜치> · N단원 · 건너뜀 K · <커밋 앞 7자리> 올림」.

## Claude 가 검토할 것
- 답이 정말 맞는가(조사 규칙 · 자연스러움) · 둘 다 가능한 문제를 하나로 못 박지 않았나 · 배우지 않은 말이 나오지 않나 · 줄표 · 기출 아님 · 쪽수 증가(단원당 약 1쪽).
