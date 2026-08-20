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
| `privacy.html` | `tools/build-privacy.js` | 앱 저장소의 `docs/privacy-policy.md` |
| `vendor/` | `tools/vendor.mjs` | 바깥 라이브러리 |

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
