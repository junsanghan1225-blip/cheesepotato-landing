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
node tools/build-pages.mjs        # 검색용 정적 쪽 (예문 자료를 고쳤으면 반드시)
node tools/stamp.mjs              # 캐시 자국을 새로 찍는다 (자료·코드를 고쳤으면 반드시)
node tools/check-data.mjs         # 자료 전체 크로스체크
node tools/check-sentences.mjs    # 예문 표현
node tools/check-topik.mjs        # TOPIK I
node tools/check-topik2.mjs docs/topik2-all50.json   # TOPIK II
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
| `sentence/` · `sitemap.xml` | `tools/build-pages.mjs` | `sentences*.js` |
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
