# cheesepotato-landing

everykoreans.com. 빌드 단계가 없는 정적 사이트다 — `main` 에 밀면 1~2분 뒤
GitHub Pages 가 올린다.

로컬에서 보려면:

```bash
npx --yes http-server . -p 5500
```

---

## 올리기 전에

```bash
node tools/build-grammar.mjs      # 글에서 찾아낼 문법 (예문 이름을 고쳤으면 반드시)
node tools/build-pages.mjs        # 검색용 정적 쪽 (예문 자료를 고쳤으면 반드시)
node tools/stamp.mjs              # 캐시 자국을 새로 찍는다 (자료·코드를 고쳤으면 반드시)
node tools/check-data.mjs         # 자료 전체 크로스체크
node tools/check-courses.mjs      # 코스·레슨 (레슨을 고쳤거나 더했으면 반드시)
node tools/check-honorific.mjs    # 존댓말 활용 (hon: true 코스를 고쳤거나 더했으면 반드시)
node tools/check-sentences.mjs    # 예문 표현
node tools/check-topik.mjs        # TOPIK I
node tools/check-topik2.mjs docs/topik2-all50.json   # TOPIK II
node tools/check-glossary.mjs     # 낱말 뜻풀이
node tools/check-blog.mjs         # 블로그 글 (글을 더했거나 고쳤으면 반드시)
node tools/check-style.mjs docs/topik2-round2.json     # 출제·문법 (새 문항을 받았을 때)
node tools/check-newwords.mjs docs/topik2-round2.json  # 처음 보는 낱말 (사람이 눈으로)
node --check app.js && node --check app.module.js
```

`stamp.mjs` 를 빼먹으면 **고쳐서 올려도 사용자에게는 한동안 예전 화면이
나온다.** 실제로 겪었다 — 주소 라우팅을 고쳐 올렸는데 「그대로인데?」 하는
일이 났고, 코드는 멀쩡했고 브라우저가 예전 파일을 쥐고 있던 것이었다.

찍혔는지만 보고 싶으면:

```bash
node tools/stamp.mjs --check      # 낡았으면 종료 코드 1
```

---

## 자국(`?v=…`)이 하는 일

GitHub Pages 는 캐시 머리글을 우리가 못 정한다. `app.js` 를 그냥 부르면
배포한 뒤에도 브라우저가 한동안 예전 파일을 쓴다. 주소 뒤에 내용에서 뽑은
`?v=` 를 붙이면 내용이 바뀔 때만 주소가 바뀌므로, 바뀐 것만 새로 받는다.

**모듈이 부르는 파일까지 함께 찍는다.** `app.module.js` 만 찍으면 그 안의
`import './sentences.js'` 는 예전 주소 그대로라 새 코드가 예전 자료를 읽는
어정쩡한 상태가 된다. 그쪽이 더 나쁘다 — 코드가 새것이라 오류도 안 난다.

자국은 날짜나 회차가 아니라 **파일 내용**에서 뽑는다. 날짜로 찍으면 안 바뀐
파일까지 새로 받게 되고, 손으로 올리는 값이면 잊어버린다.

---

## 생성물 — 손으로 고치지 말 것

| 파일 | 만드는 것 | 원본 |
|---|---|---|
| `topik2.js` | `tools/build-topik2.mjs` | `docs/topik2-all50.json` |
| `sentence/` · `compare/` · `course/` · `lesson/` · `topik-writing/` · `topik-reading/` · `topik-listening/` · `blog/`(`rss.xml` 포함) · `sitemap.xml` | `tools/build-pages.mjs` | `sentences*.js` · `courses*.js` · `topik-writing.js` · `topik.js` · `topik2.js` · `topik-listening.js` · `blog.js` |
| `glossary.js` · `glossary-<말>.js` | `tools/build-glossary.mjs` | `docs/glossary.json` (+ `glossary-krdict.json`) |
| `grammar.js` | `tools/build-grammar.mjs` | `sentences.js` 의 문법 이름 |
| `docs/glossary-krdict.json` | `tools/build-krdict-glossary.mjs` | 국립국어원 내려받기 자료 |
| `favicon-32.png` · `icon-180.png` | `tools/build-icons.py` | `logo.png` |
| `privacy.html` | `tools/build-privacy.js` | 앱 저장소의 `docs/privacy-policy.md` |
| `vendor/` | `tools/vendor.mjs` | 바깥 라이브러리 |

---

## 검색에 걸리게 하는 것

화면 전환을 전부 해시(`#learn/sentence/23-1`)로 하므로 **크롤러에게 이
사이트는 `index.html` 한 쪽이다.** 해시 뒤는 서버로 가지도 않아서, 표현
290개를 쌓아 두고도 검색에는 한 글자도 안 걸렸다.

그래서 `tools/build-pages.mjs` 가 표현마다 진짜 주소를 가진 정적 쪽을 뽑는다.

```
/sentence/            표현 290개를 한 번에 거는 목록 (크롤러의 들머리)
/sentence/23-1.html   표현 하나 — 뜻·형태·주의할 점·예문·대화문
```

그 쪽에서 앱 화면(`/#learn/sentence/23-1`)으로 보낸다. **검색은 정적 쪽이
받고, 연습은 앱이 맡는다.**

- 쪽마다 CSS 를 박아 넣는다. 따로 빼면 `stamp.mjs` 의 자국 대상이 290개로
  불어나고, 검색에서 들어온 첫 화면이 한 번에 안 그려진다.
- 글꼴도 `vendor/pretendard` 를 안 부른다. 처음 들어온 사람에게 웹폰트
  수백 KB 를 물리는 것보다 기기 글꼴로 즉시 읽히는 편이 낫다.
- **`hreflang` 은 안 건다.** 언어를 주소가 아니라 화면에서 가르므로 영어 쪽
  주소가 따로 없다. 없는 주소를 적으면 구글이 그 줄을 통째로 버린다. 영어
  주소를 따로 낼 때 함께 붙일 것.
- 예문 자료를 고쳤으면 `build-pages.mjs` 를 다시 돌린다. 안 돌리면 지운
  표현의 쪽이 남아 **앱에 없는 것이 검색에 걸린다.**

---

## 낱말 뜻풀이

시험을 풀다 모르는 낱말을 눌러 단어장에 담을 때, 뜻 칸이 늘 비어 있었다.
빈 칸을 스무 개 받아 놓고 하나씩 채우는 사람은 없다.

**번역기를 부르지 않고 사전을 들고 다닌다.** 번역기에는 열쇠가 있어야 하는데
이 사이트는 정적이라 열쇠를 둘 데가 없다 — 코드에 넣으면 그대로 공개된다.
대신 **우리 지문에 나오는 낱말**만 미리 적어 둔다. 지문에 없는 말은 눌릴 일이
없으니 온 세상 낱말을 담을 까닭도 없다.

- 뜻은 단어장 설정의 **모국어**를 따라간다. 그 말이 사전에 없으면 영어로
  물러서고, 영어도 없으면 **빈 칸으로 둔다.** 지어내 채우면 학습자가 그 틀린
  뜻을 외운다 — 빈 칸은 채우면 되지만 틀린 뜻은 외우고 나서야 안다.
- 활용형을 `alt` 로 함께 적어 둔다. 「먹었습니다」를 눌러도 「먹다」로 담긴다.
  활용형이 그대로 쌓이면 단어장이 같은 말로 열 줄이 된다.
- `alt` 로 다 못 적는다. 사전은 「먹다」로 적혀 있는데 지문은 언제나
  「먹었습니다」다. **`gloss-find.js` 가 토씨와 어미를 떼어** 사전에 있는 꼴로
  되돌린다. 뗀 결과가 **사전에 실제로 있을 때만** 인정하고, **덜 뗀 쪽이
  이긴다** — 「가지고」는 「가지다」에서 멈추지 「가다」까지 가지 않는다.
  화면과 검사기가 이 파일 하나를 같이 쓴다.
- `only: true` 는 「사전이 이 낱말에 단 뜻은 딴말이다」는 표시다. 사전의
  「이」는 louse(이[蟲])고 「씨」는 seed(씨앗)다. 우리 지문에서는 「이 상자」의
  이, 「민수 씨」의 씨다. 영어 표는 우리 것이 이기지만 이 표시가 없으면
  **언어팩에서 「しらみ」가 그대로 나간다.**
- 담기 전에 결과 화면에서 뜻을 고칠 수 있다. **손으로 적은 뜻은 낱말을
  다듬어도 안 지워진다** — 지워지면 다듬는 일 자체를 안 하게 된다.
- 지금 얼마나 덮는지는 `node tools/check-glossary.mjs` 가 말해 준다.
  가짓수보다 **나온 횟수**로 센 쪽을 보면 된다. 학습자가 마주치는 것은
  자주 나오는 낱말이다. 지금은 가짓수 87% · 횟수 93% 다.
  `build-glossary.mjs` 를 먼저 돌려야 한다 — 검사기가 구운 `glossary.js` 를
  읽는다.

  한때 이 숫자가 99% 였다. 앞머리 한 글자만 맞아도 닿은 것으로 세고 있었고,
  화면은 그때 정확히 일치하는 것만 찾아서 **실제로는 47%** 였다. 지금은
  검사기가 화면과 같은 `gloss-find.js` 를 불러 쓴다. **재는 쪽과 하는 쪽이
  갈라지면 숫자가 일을 안 하고 위로를 한다.**

다국어 뜻풀이는 국립국어원 「한국어기초사전」에서 가져온다. **CC BY-SA 2.0 KR
이라 상업적으로 써도 되지만 출처를 밝혀야 하고, 거기서 나온 자료는 같은
라이선스로 열어 두어야 한다.** 그래서 우리가 쓴 뜻풀이와 파일부터 갈라 둔다 —
한 파일에 섞으면 어디까지가 CC BY-SA 인지 말할 수 없게 된다.
자세한 것은 `docs/glossary-license.md`.

내려받은 자료는 1GB 가까이 된다. 그대로 저장소에 넣지 말고
`tools/build-krdict-glossary.mjs` 로 **우리 지문에 나오는 낱말만** 뽑는다.

```bash
node tools/build-krdict-glossary.mjs ~/Downloads/krdict
```

영어 뜻풀이를 손으로 더 채우려면 `docs/glossary-gemini-prompt.md` 를 따른다.

---

## 블로그

글은 `blog.js` 에 있고 `blog/` 밑은 생성물이다. 배열 순서가 화면 순서다 —
최신이 앞이고, 앞뒤 글 이동도 이 순서를 따른다.

### 본문은 HTML 이 아니라 블록이다

예전에는 `body` 에 HTML 문자열을 넣었다. 손으로 쓸 때는 됐는데 **모델에게
글을 받기 시작하니 안 됐다.** 태그 하나가 안 닫히면 쪽 전체가 무너지고,
무엇보다 모델이 문법 뜻풀이를 그럴듯하게 지어냈다 — 우리에게는 손으로
다듬은 뜻풀이가 이미 290개 있는데.

그래서 본문을 **블록 배열**로 받는다.

```js
blocks: [
  { t: 'p',    text: '문단. 꾸밈은 **굵게** 하나뿐이다' },
  { t: 'h',    text: '소제목' },
  { t: 'quote', lines: ['예문 한 줄', '또 한 줄'] },
  { t: 'list', items: ['…', '…'], ordered: false },
  { t: 'ex',   ko: '늦어서 죄송합니다.', en: 'Sorry for being late.' },
  { t: 'dlg',  lines: ['A: …', 'B: …'] },
  { t: 'gram', id: '32-2', note: '왜 지금 이걸 보라는지' },
  { t: 'link', href: '/compare/32.html', title: '…', note: '…' },
  { t: 'note', title: '자주 하는 실수', text: '…' },
  { t: 'img',  src: '/assets/blog/….jpg', alt: '무엇이 찍혀 있는지', cap: '…' },
]
```

글자는 전부 `esc()` 를 지난다. 모델이 `<script>` 를 적어 보내도 글자로만
남는다. 손으로 쓴 예전 글의 `body` 도 그대로 받는다 — 둘 다 굽는다.

**`gram` 은 id 만 받는다.** 표현 이름과 뜻풀이는 `sentences.js` 에서 꺼내
붙이고, `note` 에는 「왜 지금 보라는지」만 적는다. 모델은 *어느* 표현을 걸지만
정하고, 그 표현이 *무슨 뜻인지*는 우리 자료가 말한다. 없는 id 면
`build-pages.mjs` 가 굽다가 멈춘다 — 조용히 넘기면 글에 죽은 링크가 실린다.

### 글 하나 더 받기

```bash
node tools/blog-prompt.mjs beginner "이유를 말하는 세 가지" > /tmp/p.txt
# /tmp/p.txt 를 통째로 Gemini 에 붙여 넣고, 받은 JSON 을 /tmp/got.json 로 저장
node tools/blog-merge.mjs /tmp/got.json      # --dry 를 붙이면 찍어만 본다
node tools/check-blog.mjs
node tools/build-pages.mjs && node tools/stamp.mjs
```

`blog-prompt.mjs` 는 **그 급수까지의 표현 id 목록과 걸어도 되는 주소 목록을
지시문 안에 통째로 넣는다.** 말로 「있는 것만 걸어라」라고 해 봐야 모델은
`/blog/tags/grammar` 같은 있을 법한 주소를 아주 잘 지어낸다. 목록을 주면
지어낼 자리가 없다.

한 판에 글 하나만 시킨다. 두세 편을 한 번에 시키면 뒤로 갈수록 짧아지고
말투가 흔들린다 — 읽기 지문에서 이미 겪은 일이다.

`blog-merge.mjs` 는 **막을 것만** 본다(id 겹침·홑따옴표·모르는 블록). 나머지는
넣은 뒤 `check-blog.mjs` 가 한자리에서 본다 — 두 군데서 같은 것을 보면
한쪽만 고치게 된다.

### 사진

`assets/blog/` 에 둔다. **모델에게 사진을 시키지 않는다** — 남의 사진을 쓸
수 없기 때문이다. 지시문은 사진이 있으면 좋겠는 자리에 「사진 자리」라는
`note` 를 남기게 하고, 사람이 보고 채우거나 지운다. 크기·출처·`alt` 규칙은
`assets/blog/00-README.txt` 에 있다.

`check-blog.mjs` 가 파일이 실제로 있는지, `alt` 가 있는지(「사진」 같은 건
`alt` 가 아니다), 300KB 를 넘는지 본다.

### 시각 표시

목록과 글 머리에 「4일 전」으로 뜨는데, **구울 때가 아니라 보는 사람
브라우저에서** 바꾼다. 정적 파일이라 구울 때 계산해 박으면 다음 날부터
거짓이 된다. 스크립트가 안 돌면 진짜 날짜가 그대로 남는다.

---

## 글 속의 문법

낱말을 모르면 눌러서 사전을 보는데 **어미는 눌러 볼 데가 없었다.**
「-는 바람에」를 처음 본 사람은 그것이 한 덩어리인 줄도 모르고, 「바람」을
사전에서 찾다가 「wind」를 보고 더 헷갈린다.

예문 만들기에 그 설명이 **290개나 쌓여 있는데** 읽는 사람이 거기로 갈 길이
없었다. 그래서 읽기 연습 지문에서 아는 문법에 밑줄을 긋고, 누르면 말풍선으로
무엇인지 띄우고, 거기 단추로 그 문법 쪽(`#learn/sentence/51-4`)으로 바로
건너가게 했다.

```bash
node tools/build-grammar.mjs            # grammar.js 를 굽는다
node tools/build-grammar.mjs --report   # 지문 어디에 걸리는지 전부 본다
```

문법 이름(`sentences.js` 의 `name`)은 사람이 읽으라고 적힌 것이라
(「A/V-(으)ㄴ/는데 ①」) 그대로는 글에서 못 찾는다. `build-grammar.mjs` 가 그것을
찾을 수 있는 꼴로 옮긴다 — `(으)ㄴ` 은 받침으로 붙거나 「은」이 되고, 「-았/었」은
녹아 붙어도 받침 ㅆ 을 남기고(갔·먹었·했·봤), 「-아/어」는 종잡을 수 없어
**받침 없고 홀소리가 ㅏㅐㅓㅕㅘㅙㅝ인 글자**로 좁혀 둔다.

**안 짚는 것이 셋 있다. 셋 다 지문 54편에 실제로 대 보고 정했다.**

- **이름이 꼴이 아닌 것** — 「'ㅂ' 불규칙」 「직접 인용」 「하오체」. 글에서
  찾을 자국이 없다.
- **글자만 보고 못 가르는 것** — `BLIND`. 「-(으)ㄴ들」은 「만들」 「현대인들」에,
  「-았/었다가」는 「게다가」에, 「-아/어 보다」는 「비판보다」에 걸렸다. 걸린
  자리를 그대로 적어 두었으니, 되살리고 싶으면 `--report` 로 대 보고 되살려라.
- **너무 자주 나오는 것** — `TOO_BASIC`. 「-습니다」는 54편에서 274번 걸린다.
  문장마다 하나씩이다. 다 밑줄을 그으면 글이 아니라 밑줄이 된다. 자리 토씨
  (이/가·은/는·을/를·의)도 같다.

토씨를 한때 통째로 뺐다가 되돌렸다 — 초급 지문 열여덟 편 가운데 **여섯 편에
밑줄이 하나도 안 남았기** 때문이다. 초급 글이 바로 그 토씨로 쓰여 있다.
「에서」와 「에」의 차이, 「에게」, 「보다」는 초급이 실제로 헷갈리는 것이라
남겼다. 지금은 한 편에 4.0군데, 밑줄이 하나도 없는 지문은 54편 중 2편이다.

### 설명의 영어

`sentences.js` 의 설명은 **한국어뿐이다.** 한국어를 배우러 온 사람에게 한국어로
설명하면 설명이 또 하나의 숙제가 된다. 영어는 `sentences.js` 에 섞지 않고
`docs/grammar-en.json` 에 따로 두고 `id` 로 맞춰 붙인다 — 그 파일은 손으로 오래
다듬은 자료라, 번역을 한 줄씩 끼워 넣다가 다른 줄을 건드리면 되돌릴 데가 없다.

옮기는 칸은 셋이다. `desc`(뜻·쓰임) · `form`(형태) · `care`(주의할 점).
예문과 「자주 함께 쓰는 말」은 한국어 그대로 둔다 — 옮길 것이 아니라 배울
것이다.

```bash
node tools/grammar-words.mjs 40 > /tmp/batch.txt   # 아직 안 옮긴 것 40개
# docs/grammar-gemini-prompt.md 뒤에 붙여 보내고, 받은 JSON 을 붙인다
node tools/build-grammar.mjs && node tools/stamp.mjs
```

`build-grammar.mjs` 가 빠진 칸·겹친 id·**낫표 밖에 남은 한글**을 짚어 준다
(실제로 이 검사가 「켜다↔끄다」를 잡았다). 채운 것은 다음 묶음에서 저절로
빠지므로 어디까지 했는지 따로 적어 둘 것이 없다.

**안 옮긴 것은 한국어로 물러선다.** 지어내 채우면 배우는 사람이 그 틀린 설명을
그대로 외운다. 지금은 읽기 지문에 실제로 나오는 39개가 채워져 있다 —
말풍선은 영어로 나가고, 나머지 251개는 예문 만들기 상세에서 아직 한국어다.

---

## 화면과 주소

한 페이지 안에서 화면을 갈아 끼우고, 주소(해시)에 어디인지 남긴다.
새로고침해도 그 자리에 있어야 하기 때문이다.

```
#                       홈
#wordbook #account #library #dashboard #test
#games #claw #match #quiz #num
#learn                  배우기 (갈래 고르기)
#learn/topik            배우기 › TOPIK 유형 연습
#learn/courses          배우기 › 코스로 배우기
#learn/reading          배우기 › 읽기 연습
#learn/sentence         배우기 › 예문 만들기
#learn/sentence/23-1    그 안의 표현 하나
```

**화면을 새로 만들면 주소도 같이 준다.** `app.js` 의 `VIEW_SLUG` 에 한 줄,
`app.module.js` 의 `open()` 에 한 줄이다. 안 주면 새로고침했을 때 홈으로
튕긴다.

모의고사를 푸는 중에는 화면을 떠나기 전에 `cpBlockLeave` 가 묻는다.
70분짜리가 뒤로 가기 한 번에 사라지지 않게 하려는 것이다.

---

## 갈래 사용법 안내

배우기 갈래를 **처음 열었을 때 한 번만** 뜬다. 글은 `app.module.js` 의
`GUIDES` 에 갈래별로 한국어·영어 두 벌이 있다.

들어올 때마다 띄우지 않는 이유 — 세 번째 방문쯤이면 읽지 않고 닫는 단추가
되고, 그러면 정작 처음 온 사람도 그렇게 배운다. 대신 갈래 제목 옆 `?` 로
언제든 다시 연다.

- 걸음은 **셋까지**. 넷을 넘으면 첫 화면에 스크롤이 생기는데, 안내를
  스크롤해 가며 읽는 사람은 없다. 걸음이 아닌 경고는 `warn` 에 따로 적는다.
- 남이 보낸 주소로 표현 하나를 콕 집어 들어왔을 때는 안 뜬다
  (`openSection(id, quiet)`). 그 표현을 보러 온 사람 앞을 안내가 가로막으면
  안내가 아니라 문지기가 된다.
- 「봤다」는 **닫을 때** 적는다. 열자마자 적으면 띄워 놓고 새로고침한 사람이
  안내를 영영 못 본다.
- 갈래를 새로 만들면 `GUIDES` 에 한 줄 넣는다. 없으면 `?` 가 숨고 안내도
  안 뜬다 — 조용히 넘어가므로 깨지지는 않는다.
