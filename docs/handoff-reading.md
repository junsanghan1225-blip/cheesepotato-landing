# 이어서 하는 사람에게 — 읽기 연습

이 문서는 다른 도구(Gemini Code 등)로 이어서 작업할 때 읽는 것이다.
**자료와 도구는 다 놓았고, 화면이 없다.** 그 화면을 만드는 일이 남았다.

---

## 0. 이 저장소가 무엇인지

- **`junsanghan1225-blip/cheesepotato-landing`** — everykoreans.com 의 전부.
  `main` 에 밀면 GitHub Pages 가 1~2분 안에 띄운다. 서버는 없다.
- 한 장짜리 사이트다. 주소의 `#` 뒤만 바뀐다(`#learn`, `#num`, `#test` …).
- 빌드 단계가 없다. 파일을 고쳐 밀면 그게 곧 배포다.
  **그래서 문법이 하나라도 틀리면 사이트가 하얗게 뜬다.** 밀기 전에
  반드시 아래 검사기와 회귀를 돌려라.

### 파일 지도

| 파일 | 무엇 |
|---|---|
| `index.html` (225KB) | 화면 뼈대와 CSS 전부. 인라인 스크립트는 **하나도 없다**(CSP 때문) |
| `app.js` (47KB) | 고전 스크립트. 첫 화면 움직임, 발음 시험, 언어 바꾸기, 옆 메뉴 |
| `app.module.js` (262KB) | 모듈. Supabase, 단어장, 코스, TOPIK, 숫자, 게임, 자료마당 |
| `analytics.js` | Microsoft Clarity |
| `topik.js` | TOPIK 읽기 209문제 |
| `courses*.js` | 코스 12개 · 레슨 57개 |
| `sentences.js` | 예문 만들기 290표현 · 씨앗 글 576개 |
| `numbers.js` | 숫자 읽기 생성기 |
| `reading.js` | **읽기 연습 — 이번에 새로 놓은 것** |
| `vendor/` | supabase-js · xlsx · Pretendard · Press Start 2P (손대지 말 것, `tools/vendor.mjs` 가 만든다) |

### 반드시 지킬 것

1. **인라인 스크립트를 절대 넣지 마라.** `<script>…</script>` 도, `onclick=` 도.
   CSP 가 `script-src 'self'` 라 브라우저가 실행을 거부한다. 자바스크립트는
   `app.js` 나 `app.module.js` 에 넣고 `addEventListener` 로 붙인다.
2. **바깥 주소를 새로 부르지 마라.** CDN, 폰트, 이미지 전부. CSP 가 막는다.
   필요하면 `tools/vendor.mjs` 로 저장소에 들여온다.
3. **id 를 바꾸지 마라.** 레슨 id · TOPIK 문항 id · 읽기 지문 id 는 학습자
   진도의 열쇠다. 바꾸면 남의 기록이 끊긴다.
4. 주석은 **왜** 를 적는다. 무엇을 하는지는 코드가 말한다. 이 저장소의
   기존 주석을 몇 개 읽어 보고 그 결에 맞춰라.

### 돌려야 하는 것

```bash
node tools/check-reading.mjs     # 읽기 지문
node tools/check-topik.mjs       # TOPIK
node tools/check-courses.mjs     # 코스·레슨
node tools/check-sentences.mjs   # 예문
node tools/check-seeds.mjs       # 씨앗 글
node tools/check-numbers.mjs     # 숫자
node tools/check-pron.mjs        # 발음 지문
node tools/check-data.mjs        # 전체
```

브라우저 회귀는 저장소 밖(작업 폴더)에 있다. 없으면 최소한 이건 해라 —
로컬에서 띄우고(`npx http-server -p 5501`) 화면을 하나씩 열어 **콘솔에
오류가 0인지** 본다. 특히 `Refused to …`(CSP 위반)가 뜨면 안 된다.

---

## 1. 읽기 연습 — 지금까지 된 것

### 자료 (`reading.js`)

```js
READING = {
  short: { beginner: [...], intermediate: [...], advanced: [...] },
  long:  { beginner: [...], intermediate: [...], advanced: [...] },
}
```

**길이와 급수가 따로다.** 쉬운 글을 길게 읽고 싶은 사람과 어려운 글을 짧게
한 편만 보고 싶은 사람이 둘 다 있어서다.

- `short` 3~5문장 · 60~200자
- `long` 8~12문장 · 280~520자

지문 한 편의 모양:

| 칸 | 무엇 |
|---|---|
| `id` | `rs-b-01` 꼴. **바꾸지 말 것** — 진도의 열쇠 |
| `title` | 목록에 뜨는 이름 |
| `passage` | 읽을 글 |
| `en` | 지문을 통째로 옮긴 영어. **요약이 아니다** |
| `question` | 무엇을 쓰라는 것인지 |
| `model` | 모범 답안 |
| `keys` | `[{ k: ['지하철','전철'], why: '회사에 어떻게 가는지' }, …]` |
| `words` | `[['걸리다','to take (time)'], …]` |

지금 **씨앗 6편**만 있다(모양을 정하려고 손으로 쓴 것).
`short.beginner` 2 · `short.intermediate` 2 · `long.advanced` 2.

### 도구

```bash
# 지시문 뽑기 — 칸마다 따로. 마지막 숫자는 편수(기본 8)
node tools/reading-prompt.mjs short beginner 8

# 받은 JSON 넣기
node tools/reading-merge.mjs short beginner 받은것.json

# 치수와 채점 가능 여부 확인
node tools/check-reading.mjs
```

---

## 2. 남은 일 — 화면 만들기

### 어디에 붙이나

`app.module.js` 의 `LEARN_SECTIONS` 에 네 번째 갈래로 넣는다. 지금 셋이다
(`courses` · `topik` · `sentence`). 각 갈래는 `pane` 에 적힌 id 의 `<div>` 를
연다 — 읽기는 `rdWrap` 으로 새로 만든다.

```js
{
  id: 'reading', emoji: '📝', ready: true, pane: 'rdWrap',
  lv:    { ko: '읽기',  en: 'READING' },
  title: { ko: '읽고 써 보기', en: 'Read and write back' },
  tag:   { ko: '읽은 것을 자기 말로 다시', en: 'Say it back in your own words' },
  blurb: { ko: '…', en: '…' },
}
```

`index.html` 의 `sbWrap` 옆에 `rdWrap` 을 만든다. 세그먼트 고르개는 코스의
`#lcLevel` 이나 발음의 `.pt-lv` 를 그대로 베껴라 — 이미 있는 모양이다.

### 화면 흐름 (사장님이 정한 것)

1. **길이 고르기** — 짧은 글 / 긴 글
2. **급수 고르기** — 초급 / 중급 / 고급
3. 그 칸의 지문이 카드로 죽 나온다 (제목 + 첫 줄 조금)
4. 카드를 누르면 **그 카드 바로 아래가 펼쳐진다.** 새 화면으로 넘어가지
   않는다. 지문 전문 + 낱말 풀이 + 질문 + **쓰기 칸**이 거기 생긴다.
5. 쓰고 「확인」을 누르면 **바로 아래에** 결과가 붙는다.
   - **내용 점수** (아래 계산법)
   - 짚은 것 ✓ / 놓친 것 ✗ — `keys[].why` 를 그대로 보여 준다
   - 모범 답안
   - **영어 대조** — `en` 을 편다. 답을 내기 전에는 절대 보이면 안 된다
   - (로그인했으면) 「AI 첨삭 받기」 단추

### 내용 점수 계산법

```js
/* keys 의 각 항목마다, 학습자 글에 k 중 하나라도 있으면 그 항목을
   짚은 것으로 친다. 띄어쓰기는 지우고 견준다 — 「지하철로」와
   「지하철 로」를 다르게 셀 이유가 없다. */
const flat = (s) => String(s).replace(/\s+/g, '');
const hit  = (answer, key) => key.k.some((w) => flat(answer).includes(flat(w)));
const score = Math.round(keys.filter((k) => hit(answer, k)).length / keys.length * 100);
```

**화면에서 이걸 「맥락 점수」라고 부르지 마라.** 이건 맥락을 재는 게 아니라,
이해했으면 그 내용이 글에 나온다는 상관을 쓴 근사치다. **「내용 점수」**라고
부르고, 놓친 항목이 무엇인지 같이 보여 준다 — 숫자보다 그쪽이 배울 거리다.

그리고 놓친 항목 옆에 이 뜻의 말을 반드시 적어라:
「다르게 썼다면 틀린 게 아닙니다. 아래 모범 답안과 견줘 보세요.」
같은 뜻을 다른 말로 쓴 학습자를 틀렸다고 하면 안 된다.

### AI 첨삭 (진짜 맥락 판단)

발음 시험이 쓰는 구조를 그대로 베껴라. `app.module.js` 의 `window.ptAiGuess`
를 보면 다 나온다 — 로그인 확인 → `fetch(SB_URL + '/functions/v1/…')` →
429면 할당량 초과 화면 → 15초 타임아웃 → 실패하면 **조용히 접는다**(점수는
이미 화면에 있으니까).

엣지 함수 `score-reading` 은 아직 없다. Supabase 쪽에 새로 만들어야 한다.
받는 것: `{ passage, question, model, answer }`. 주는 것:
`{ verdict: '한 줄 총평', score: 0~100, points: [{ ok: true, text: '…' }] }`.

**돈이 드는 길은 늘 덤이어야 한다.** 로그인 안 한 사람도, clarity·supabase 가
죽어도 내용 점수는 나와야 한다.

### 진도

`lesson_progress` 테이블을 쓴다. 코스가 쓰는 방식을 보고 맞춰라.
`lesson_id` 자리에 읽기 지문 `id` 를 넣으면 된다.

---

## 3. 콘텐츠 채우기

지금 6편뿐이다. 칸마다 최소 6편, 넉넉하게는 10편씩 = 60편쯤 필요하다.

```bash
for len in short long; do
  for lv in beginner intermediate advanced; do
    node tools/reading-prompt.mjs $len $lv 8
  done
done
```

여섯 개의 지시문을 Gemini 에 **한 판에 하나씩** 넣는다. 한꺼번에 시키면
길이 기준을 섞는다(발음 지문에서 실제로 그랬다).

받은 JSON 을 `reading-merge` 로 넣고 `check-reading` 을 돌린다.
**검사기가 잡는 것 말고 사람이 봐야 하는 것**이 늘 있다 — 발음 지문
150편에서 44편을 손봐야 했다. 특히 이런 것:

- 없는 말 (「빠나요」, 「기분이 얹어졌어요」)
- 서류 말투 (구입했습니다 → 샀습니다, 정숙해져서 → 조용해져서)
- 말이 안 되는 조합 (「옷을 깨끗하게 입어요」)
- 같은 낱말이 여러 편에 몰리는 것

---

## 4. 이 저장소에 남은 보안 숙제 (사장님이 Supabase SQL 에서 실행)

```sql
-- 관리자 이메일이 박힌 중복 DELETE 정책. Postgres 는 정책을 OR 로 합치니
-- 나중에 is_admin() 쪽만 고쳐도 이메일 경로가 살아 있다.
drop policy "resources delete own or admin" on resources;

-- is_admin() 이 어느 테이블을 읽는지 확인. 그 테이블에 사용자 UPDATE 정책이
-- 있으면 본인이 스스로를 관리자로 올릴 수 있다.
select prosrc from pg_proc where proname = 'is_admin';

-- 정책 0개짜리 유령 테이블. 안 쓰면 지운다.
select count(*) from "Cheespotato table for voca";
```

`app.module.js` 의 `ADMIN_EMAIL` 도 언젠가 걷어내고 `is_admin()` 하나로
모아야 한다.

---

## 5. 최근에 한 일 (다시 하지 말 것)

| 커밋 | 무엇 |
|---|---|
| `44c1f1e` | esm.sh · jsdelivr · 구글 폰트를 `vendor/` 로 들여오고 CSP 를 걺. 인라인 스크립트를 파일로 뺌 |
| `e8243ed` `e53de49` | 발음 지문 24 → 174편 |
| `ce078c7` | TOPIK 풀며 모르는 낱말을 눌러 표시 → 결과 화면에서 단어장에 담기 |
| `b3c56b7` | 폰 머리띠에 이름표(☰ 가 클릭 1위였던 까닭), 죽은 클릭 16 → 5 |
| `47a7a87` | 읽기 연습 자료 모양과 도구 (이 문서) |
