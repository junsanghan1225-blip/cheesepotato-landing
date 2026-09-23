# 안티 그래비티 작업 지시 — 레벨별 콘텐츠 채우기

> 이 파일 전체를 안티 그래비티에 붙여 넣는다. 일은 두 가지이고, **A 를 먼저** 한다.

레벨은 8단계다 (`app.module.js` 의 `LT_LEVELS`).

| 레벨 | 이름 | 코스 | TOPIK |
|---|---|---|---|
| L0 | 한글 전 | hangul | — |
| L1 | 입문 | first-words · grammar-core | — |
| L2 | 초급 1 | Stage 1 (bg-05 …) | 1급 |
| L3 | 초급 2 | Stage 2 (bg-10 …) | 1급 |
| L4 | 초급 3 | Stage 3–4 (bg-13 …) | 2급 |
| L5 | 초급 4 | Stage 5–6 (bg-22 …) | 2급 |
| L6 | 중급 | im-* | 3–4급 |
| L7 | 고급 | ad-* | 5–6급 |

시작 전에 한 번:

```bash
git checkout main && git pull origin main
```

---

## A. 레벨테스트 문제 채우기 (먼저, 작다)

`leveltest-overall.js` 의 `LT_CUSTOM_OVERALL`. 지금 레벨마다 몇 문제인지:

```bash
node -e "import('./leveltest-overall.js').then(m=>{const c={};for(const q of m.LT_CUSTOM_OVERALL)c[q.lv]=(c[q.lv]||0)+1;console.log(c)})"
```

**목표: 레벨마다 8문제.** 계단식 테스트는 한 레벨을 두세 번 물어야 경계를 찾는다.
문제가 적은 레벨은 같은 문제가 매번 나온다.

```bash
git checkout -b leveltest-pool
```

### 문제 모양

```js
{ lv: 4, q: '내일 비가 ___ 우산을 가져가세요.', options: ['오면', '와서', '오니까', '오지만'], answer: 0,
  why: '조건을 말할 때는 「-(으)면」을 써요.' },
```

- `options` 는 꼭 4개, `answer` 는 정답 자리(0부터). 보기는 화면에서 섞이므로 정답을 늘 0에 둬도 된다.
- `why` 는 한 줄, 학습자에게 보이는 말투(-요)로.
- 파일 안에서 **같은 레벨끼리 모아 둔다** (주석 `// ── L4 …` 아래).

### 레벨마다 무엇을 묻나

| 레벨 | 묻는 것 | 보기 |
|---|---|---|
| L0 | 한글 낱말을 소리 내어 읽기 | 로마자 4개 (`ba-na-na` …) |
| L1 | 이에요/예요 · 은/는 · 인사말 · 아주 흔한 낱말 뜻 | |
| L2 | Stage 1: 조사 을/를·이/가·에·에서, 안/못, 현재 -아요/어요 | |
| L3 | Stage 2: 과거 -았/었, -고 있다, -기 전에/-(으)ㄴ 후에, 불규칙 ㄷ·ㅂ | |
| L4 | Stage 3–4: -아서/-니까, -(으)면, -는데, -아/어 주다, -아야 하다, -(으)ㄹ 수 있다 | |
| L5 | Stage 5–6: -아/어 본 적이 있다, -(으)러, -(으)ㄹ 것 같다, 높임말, 관형형 | |
| L6 | 중급: `docs/curriculum-upper.md` 의 L6 문법 (-느라고, -는 바람에, -(으)ㄹ 텐데 …) | |
| L7 | 고급: 같은 문서 L7 문법, 신문·논설 어휘 | |

### 반드시 지킬 것

1. **정답이 하나뿐이어야 한다.** 오답 보기도 문법적으로는 맞는 문장이면 안 된다
   (예: 「오니까」도 말이 되면 그 문제는 버린다).
2. **그 레벨 문법으로만 풀려야 한다.** L3 문제에 L5 낱말이 끼면 L3 학생이 문법이 아니라
   낱말 때문에 틀린다.
3. 사람 이름은 흔한 것(민수·지현)만.

끝나면:

```bash
node tools/stamp.mjs && node tools/stamp.mjs --check
git add -A && git commit -m "leveltest: fill to 8 questions per level"
git push -u origin leveltest-pool
```

PR 을 열고 설명에 레벨별 문제 수를 적는다.

---

## B. 중급·고급 코스 만들기 (크다, 코스 하나씩)

계획표는 `docs/curriculum-upper.md` 다. L6 중급 26개, L7 고급 22개.
**`im-c48` 은 1강까지 이미 있다.** 모양은 그것을 그대로 따른다
(`courses-grammar-detailed.js` 맨 끝).

```bash
git checkout main && git pull origin main
git checkout -b upper-courses
```

### 코스 하나를 만드는 순서

**1) 껍데기를 더한다.** `courses-grammar-detailed.js` 의 맨 끝 `];` 바로 위에,
계획표의 다음 줄을 코스 객체로 만든다. `lessons: []` 로 둔다.

```js
{
  id: 'im-c49',                                // 계획표의 코스 id
  emoji: '⚖️',
  title:   { ko: '중급 49: 대조와 반대', en: 'Intermediate 49: Contrast' },
  tagline: { ko: '한 줄 소개', en: 'one line' },
  blurb:   { ko: '계획표의 문법을 이름으로 적는다 (-기는 하지만, -(으)ㄴ/는 반면에 …)', en: '…' },
  level: 'Intermediate',                       // 고급은 'Advanced'
  needs: 'im-c48',                             // 계획표의 needs
  lessons: [],
},
```

`blurb.ko` 에 **다룰 문법을 이름 그대로** 적는다. 다음 단계의 지시문이 이것을 보고 레슨을 짠다.

**2) 지시문을 뽑아 레슨 4강을 받는다.**

```bash
node tools/course-prompt.mjs im-c49 > /tmp/p.txt
```

`/tmp/p.txt` 를 그대로 따라 레슨 4강을 JSON 배열로 만들고 `/tmp/got.json` 에 저장한다.
문법 뜻과 예문은 **`sentences.js` 의 그 문법 항목(desc · ex · more)을 기준으로** 쓴다 —
새로 지어내지 않는다.

**3) 붙이고 검사한다.**

```bash
node tools/course-merge.mjs im-c49 /tmp/got.json
node tools/check-courses.mjs          # 「문제 없음」 이어야 한다
node tools/build-pages.mjs && node tools/stamp.mjs
git add -A && git commit -m "course: im-c49 (4 lessons)"
```

**코스 하나 = 커밋 하나.** 다음 코스로 넘어간다.

### 반드시 지킬 것

- **레슨이 없는 껍데기를 커밋하지 않는다.** 빈 코스가 사이트에 그대로 뜬다.
- 계획표에 「일부 있음」 인 갈래(51번)는 이미 있는 코스(im-02-02 -느라고 · im-02-03 -는 바람에)와
  **겹치는 문법을 빼고** 쓴다.
- 레슨 id 는 `코스id-01` … `-04`. 이미 있는 id 를 다시 쓰면 `course-merge.mjs` 가 막는다.
- `check-courses.mjs` 가 멈추면 고치고 다시 돌린다. 경고를 지우려고 검사기를 고치지 않는다.

### 끝낼 때 (몇 개를 했든)

```bash
node tools/stamp.mjs --check
node tools/check-geo.mjs     # 코스·레슨 수가 늘어 첫 쪽 숫자가 걸리면 index.html · llms.txt 를 검사기가 말하는 값으로 바꾼다
git push -u origin upper-courses
```

PR 설명에 만든 코스 id 목록과 레슨 수를 적는다. 한 번에 다 못 하면 **L6 앞쪽부터** 하고 멈춘다 —
L6 학생이 L7 학생보다 훨씬 많다.
