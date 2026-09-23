# 안티 그래비티 작업 지시 — 영어 블로그 글 늘리기

> 이 파일 전체를 안티 그래비티에 붙여 넣는다.

## 왜

영어 글 11편 가운데 **10편이 800낱말이 안 된다** (266~601낱말). 같은 검색어로 구글
윗자리에 오는 글은 대개 천 단어 안팎이라, 짧은 글은 영어 검색에서 밀린다.
새 글을 쓰는 게 아니라 **이미 있는 글을 늘려서 바꿔 넣는다** — 주소와 한국어 짝(hreflang)은
그대로 둔다.

지금 몇 낱말인지는:

```bash
node tools/check-blog.mjs      # 「짚어 둘 것」에 800 밑인 영어 글이 나온다
```

## 할 글 (짧은 것부터)

| id | 지금 | 수준 |
|---|---:|---|
| `an-vs-mot-english` | 266 | beginner |
| `why-in-korean-aseo-nikka-english` | 294 | beginner |
| `seyo-family-english` | 297 | beginner |
| `topik-writing-54-structure-english` | 322 | advanced |
| `when-to-use-banmal-english` | 373 | beginner |
| `topik-6-for-free-english` | 391 | intermediate |
| `which-topik-level-do-you-need-english` | 402 | beginner |
| `travel-korean-survival-guide-english` | 522 | beginner |
| `eun-neun-vs-i-ga-english` | 536 | beginner |
| `read-hangul-in-a-morning-english` | 601 | beginner |

**목표: 한 편에 900~1,300낱말.** 한 번에 **한 편씩** 한다 — 여러 편을 한꺼번에 쓰면 뒤로 갈수록
짧아지고 말투가 흔들린다.

## 한 편을 늘리는 순서

```bash
git checkout main && git pull origin main
git checkout -b blog-en-longer            # 처음 한 번만
```

**1) 지금 글과 규칙을 본다.**

```bash
# 지금 글 (JSON)
node -e "import('./blog.js').then(m=>console.log(JSON.stringify(m.BLOG_POSTS.find(p=>p.id==='an-vs-mot-english'),null,1)))" > /tmp/now.json

# 글 쓰는 규칙 + 걸어도 되는 문법 id · 주소 목록 (새 글용 지시문이지만 규칙은 같다)
node tools/blog-prompt.mjs --en beginner "안 vs 못" > /tmp/rules.txt
```

`/tmp/rules.txt` 의 **블록 모양 · `gram` id 목록 · 걸어도 되는 주소 목록을 그대로 따른다.**
목록에 없는 id 나 주소를 쓰면 `build-pages.mjs` 가 멈추거나 죽은 링크가 실린다.
단, `/tmp/rules.txt` 의 **분량(「한국어로 1,200~2,000자」·「블록 18~30개」)은 새 한국어 글 기준이라
따르지 않는다** — 이 작업의 분량은 위의 **900~1,300낱말**이다(블록은 30개를 넘어도 된다).

**2) 늘린 글을 `/tmp/got.json` 에 쓴다.** `/tmp/now.json` 을 바탕으로:

- **있는 내용은 지키고 덧붙인다.** 이미 맞는 설명을 새로 쓰지 않는다.
- 덧붙이기 좋은 것:
  - **자주 하는 실수** — 틀린 문장과 고친 문장 (`ex` 블록)
  - **짧은 대화** — 실제 상황에서 어떻게 쓰나 (`dlg` 블록)
  - **비슷한 표현과의 차이** — 표나 목록으로
  - **스스로 확인해 볼 문제 3~5개** — 답은 바로 아래 `note` 에
  - **FAQ** — 소제목(`h`) + 짧은 답. 검색어 그대로 묻는 문장이 좋다
    (예: "Is 못 more polite than 안?")
  - 관련 문법 쪽(`gram`), 코스·TOPIK 연습 쪽(`link`)으로 가는 길
- `title` 과 `excerpt` 는 더 나은 검색어가 있으면 고쳐도 된다. **`id` · `lang` · `alt` · `date` · `tags`
  는 적어도 도구가 원래 것으로 되돌린다** — 주소와 짝이 깨지지 않게.
- **예문 한국어는 반드시 맞아야 한다.** 조금이라도 자신 없는 문장은 넣지 않는다.
  문법 뜻풀이는 지어내지 말고 `gram` 블록으로 사이트의 설명을 건다.

**3) 바꿔 넣고 검사한다.**

```bash
node tools/blog-merge.mjs /tmp/got.json --replace --dry   # 찍어만 본다
node tools/blog-merge.mjs /tmp/got.json --replace         # 진짜로 바꾼다
node tools/check-blog.mjs                                 # 「고쳐야 할 것」 0 · 이 글이 800 밑 목록에서 빠졌는지
node tools/build-pages.mjs && node tools/stamp.mjs && node tools/stamp.mjs --check
git add -A && git commit -m "blog(en): expand an-vs-mot-english (266 → N words)"
```

**글 하나 = 커밋 하나.** 다음 글로 넘어간다.

## 하지 말 것

- `blog.js` 를 손으로 고치지 않는다 — `blog-merge.mjs --replace` 로만.
- `blog/` 밑의 html 을 손으로 고치지 않는다 — `build-pages.mjs` 가 만든다.
- 한국어 짝 글(`alt` 가 가리키는 한국어 글)은 건드리지 않는다.
- **`check-blog.mjs` · `stamp.mjs` 를 건너뛰지 않는다.** 지난 작업들에서 두 번 건너뛰어서
  낡은 화면이 나가거나 CI 가 빨갛게 떴다.

## 끝낼 때

```bash
git push -u origin blog-en-longer
```

PR 설명에 글마다 **전 → 후 낱말 수**를 적는다 (`check-blog.mjs` 가 800 밑만 보여 주므로,
다 늘렸으면 그 목록이 비어 있어야 한다).
