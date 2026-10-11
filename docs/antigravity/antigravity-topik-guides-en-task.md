# 안티 그래비티 작업 지시 — 영어 TOPIK 가이드 글 10편 (새 글)

> 이 파일 전체를 안티 그래비티에 붙여 넣는다. 브랜치 `blog-en-topik` · 묶음 2(5편씩).

## 왜
구글 검색에서 우리 TOPIK 쪽은 클릭률이 높은데(19~26%) 노출이 너무 적다. 영어로 「how to / what is / difference」를 묻는 사람이 들어올 **글(블로그)** 이 없다.
**새 영어 글 10편**을 쓴다. 한국어 짝 글은 없다(`alt` 없음).

## 쓸 글 (id 는 `-english` 로 끝낸다 — 기존 영어 글과 같은 규칙)
| id | 제목(영어, 검색어 그대로) | 수준 |
|---|---|---|
| `topik-i-vs-topik-ii-english` | TOPIK I vs TOPIK II: Which One Should You Take? | beginner |
| `topik-levels-explained-english` | TOPIK Levels 1–6 Explained: What Each Level Means | beginner |
| `how-to-study-for-topik-i-english` | How to Study for TOPIK I (A 3-Month Plan) | beginner |
| `topik-reading-tips-english` | TOPIK Reading Tips: How to Finish on Time | intermediate |
| `topik-listening-tips-english` | TOPIK Listening Tips: What to Do While You Hear the Audio | intermediate |
| `topik-writing-51-52-english` | TOPIK Writing Questions 51 and 52: How to Fill In the Blanks | intermediate |
| `topik-writing-53-english` | TOPIK Writing Question 53: Describing a Graph in Korean | advanced |
| `topik-vocabulary-how-many-words-english` | How Many Words Do You Need for Each TOPIK Level? | beginner |
| `topik-mistakes-to-avoid-english` | 8 Common TOPIK Mistakes (and How to Avoid Them) | intermediate |
| `topik-free-practice-english` | Free TOPIK Practice Online: What to Use at Each Level | beginner |

## 순서 (기존 영어 글 작업과 같다)
```bash
git checkout main && git pull origin main && git checkout -b blog-en-topik
node tools/blog-prompt.mjs --en beginner "TOPIK I vs TOPIK II" > /tmp/rules.txt   # 글마다 수준 · 주제를 바꿔 다시
```
`/tmp/rules.txt` 의 **블록 모양 · `gram` id 목록 · 걸어도 되는 주소 목록을 그대로 따른다.** 목록에 없는 id · 주소는 쓰지 않는다.
글은 `/tmp/got.json` 에 쓰고:
```bash
node tools/blog-merge.mjs /tmp/got.json --dry     # 찍어만 본다
node tools/blog-merge.mjs /tmp/got.json           # 넣는다(새 글)
node tools/check-blog.mjs                         # 「고쳐야 할 것」 0
node tools/build-pages.mjs && node tools/stamp.mjs && node tools/stamp.mjs --check
git add -A && git commit -m "blog(en): topik guides N–M"
```
**글 하나씩** 쓴다(여러 편을 한꺼번에 쓰면 뒤로 갈수록 짧아진다). 한 편 **900~1,300낱말**.

## 안에 꼭 넣을 것
- 첫 문단에서 검색한 질문에 **바로 답** 한다(2~3문장).
- 소제목(`h`) 4~7개 · 표나 목록 1개 이상 · **FAQ 3~5개**(질문 문장 그대로).
- 우리 사이트로 가는 길: TOPIK 연습(`/en/topik-reading/` · `/en/topik-listening/` · `/en/topik-writing/`) · 낱말 목록(`/topik1-words/` · `/topik2-words/` · **`/topik-vocabulary-list/`**) · 문법 `gram` 블록. 규칙 목록에 있는 것만.
- 한국어 예문은 반드시 맞는 문장만. 자신 없으면 넣지 않는다.

## 지킬 것 (사실)
1. **시험 일정 · 접수 방법 · 응시료 · 합격 점수(커트라인) · 점수 범위 · 문항 수 · 시험 시간 같은 숫자는 쓰지 않는다.** 바뀌고 틀리면 해롭다. 대신 「공식 TOPIK 사이트(topik.go.kr)에서 확인하세요」라고 쓴다.
2. 급수의 **뜻**(1급은 어느 정도 말하나)은 일반적으로 알려진 수준만 쉽게 쓰고, 정확한 어휘 수 · 시간은 쓰지 않는다. 「대략」「보통」으로 말한다.
3. **실제 TOPIK 기출 문항을 옮기지 않는다.** 예시는 모두 창작이고 「our own practice example, not from a past exam」이라고 쓴다.
4. 다른 학원 · 사이트 · 책 이름을 비교하지 않는다.
5. 약속하는 말(「this will get you Level 6」)을 쓰지 않는다.

## 하지 말 것
- `blog.js` · `blog/` 를 손으로 고치지 않는다. `tools/` 를 고치지 않는다.
- `check-blog.mjs` · `stamp.mjs` 를 건너뛰지 않는다.

## 끝낼 때
`git push -u origin blog-en-topik` — PR 설명에 글마다 낱말 수를 적는다.
