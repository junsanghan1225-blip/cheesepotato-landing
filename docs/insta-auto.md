# 인스타 자동 올리기 — 운영자용 안내

하루 네 번(한국 시간 **09:07 단어 1 · 13:07 오늘의 TOPIK · 18:07 문법 · 23:07 단어 2**, 안 돌면 1시간 뒤 한 번 더), GitHub 이 편집기(`/insta.html`)와 같은 모양으로
그날 게시물을 만들어 **@chesse_p_otato** 에 여러 장 게시물로 올린다. 코드: `tools/insta-post.mjs`, `.github/workflows/insta-post.yml`.

- 이미지는 사이트와 따로 **`insta-media` 가지**에 쌓인다(인스타가 공개 주소에서 가져가야 해서). 사이트에는 아무것도 안 쓴다.
- 같은 게시물을 두 번 올리지 않는다(올리면 `posted.json` 을 남기고, 있으면 건너뛴다).
- 주제 · 문법은 날짜로 정해진 기본 차례를 쓴다. 편집기에서 그날 것만 바꾼 것은 자동 올리기에 안 들어간다(그 브라우저에만 있어서).

## 처음 한 번 (운영자)

메타 개발자 앱(cheesepotatoeverykoreans) · 권한 · 인스타 테스터 연결은 2026-10-02 끝냈다.

1. **토큰 만들기** — developers.facebook.com → 내 앱 → cheesepotatoeverykoreans → 이용 사례 → Instagram 맞춤 설정 →
   「2. 액세스 토큰 생성」 → chesse_p_otato 줄의 **「토큰 생성」** → 로그인 · 허용 → 나온 긴 글자를 **복사**(어디에도 붙여 넣지 말고 바로 3번으로).
2. **GitHub 열기** — github.com/junsanghan1225-blip/cheesepotato-landing → **Settings** → 왼쪽 **Secrets and variables** → **Actions**.
3. **토큰 넣기** — **Secrets** 탭 → **New repository secret** → Name: `IG_TOKEN` → Secret: 복사한 토큰 → **Add secret**.
   (Claude 에게 보내지 않는다. 넣은 뒤에는 GitHub 도 다시 보여 주지 않는다.)
4. **모양 넘기기(선택)** — `/insta.html` → 「자동 올리기용 틀 받기」 → 내려받은 `insta-template.json` 을 Claude 에게 준다
   (비밀 아님). Claude 가 `docs/insta-template.json` 으로 넣는다. 안 주면 기본 모양으로 그린다.
5. **시험** — 저장소 위 **Actions** → 왼쪽 **insta-post** → **Run workflow** → slot `0`, dry `yes` → 초록불이면
   `insta-media` 가지에 이미지가 생긴다. 이어서 dry 를 **`no`** 로 한 번 더 → 인스타에 실제로 올라갔는지 본다.
6. **켜기** — 2번 화면의 **Variables** 탭 → **New repository variable** → Name: `INSTA_AUTO`, Value: `on`.
   그다음부터 매일 저절로 올라간다. **끄기**: 그 변수를 지우거나 `off` 로.

## 토큰 새로 넣기 (약 50일마다)

인스타 토큰은 60일쯤 지나면 끝난다. 끝나면 그 시간 작업이 빨갛게 실패하고 GitHub 이 메일을 보낸다
(「열쇠(토큰)가 끝났거나 틀렸어요」). 위 **1번 → 3번**을 다시 하면 된다(같은 이름 `IG_TOKEN` 을 눌러 **Update**).
달력에 50일 뒤를 적어 두면 끊기지 않는다.

## 안 될 때

| 보이는 말 | 할 일 |
|---|---|
| IG_TOKEN 이 없어요 | 3번을 한다 |
| 열쇠(토큰)가 끝났거나 틀렸어요 | 「토큰 새로 넣기」 |
| 인스타가 이미지를 못 받았어요 | Claude 에게 그 화면을 보낸다(이미지 주소 문제) |
| 인스타 API 오류 … permission | 메타 앱의 `instagram_business_content_publish` 가 「테스트 준비 완료」인지 본다 |

메타 규칙(권한 · 하루 올리기 개수 · API 판 `v23.0`)은 바뀔 수 있다 — 바뀌면 `tools/insta-post.mjs` 의 `GRAPH` 를 올린다.
