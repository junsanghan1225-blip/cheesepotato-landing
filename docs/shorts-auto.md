# 쇼츠 공장 — 찍기 → 대기열 → 자동 올리기 (2026-10-05)

운영자는 **찍기만** 한다. 표지 · 제목 · 설명 · 올리기는 정해진 틀대로 자동이다.

```
쇼츠 촬영소(/shorts.html)  ──「대기열에 올리기」──▶  Supabase(영상 · 표지 + 표 shorts_queue)
                                                         │  하루 두 번(12:07 · 19:07)
                                                         ▼
                                GitHub 액션 shorts-post ──▶ 유튜브 쇼츠 · 인스타 릴스 · 틱톡
```

- 표지는 A 시험지(운영자 결정 2026-10-05)가 기본. B 색판 · C 도전장도 고를 수 있다(`shorts-cover.js`).
- 영상 첫 1초 = 표지. 같은 그림을 cover.jpg 로 올려 유튜브 · 인스타 표지로 쓴다.
- 액션이 영상을 표준 mp4(H.264 · AAC · 30fps)로 바꿔서 올린다. 다 올리면 저장 칸에서 파일을 지운다.
- 한 곳이 실패해도 다른 곳은 올린다. 실패한 곳은 다음 차례에 다시(세 번까지).

## 0. 처음 한 번 — Supabase

1. Supabase → **SQL Editor** → `db/add_shorts.sql` 내용을 붙여 넣고 **Run**.
2. Supabase → Project Settings → **API Keys** → `service_role`(secret) 키 복사 →
   GitHub 저장소 → Settings → Secrets and variables → Actions → **New repository secret** → 이름 `SUPABASE_SERVICE_KEY`.
   (이 키는 채팅 · 코드 어디에도 붙여 넣지 않는다.)
3. Variables 탭 → `SHORTS_AUTO` = `on`.
4. 시험: 촬영소에서 한 편 찍고 「대기열에 올리기」 → Actions → shorts-post → Run workflow → what `dry`.
   초록 ✓ 이면 받기 · 바꾸기까지 된다.

> Supabase 무료 판은 저장 1GB · 파일 하나 50MB 다. 대기열에 30편쯤 쌓여도 괜찮다(1분 영상 ≈ 20MB, 올리면 지운다).

## 1. 인스타 릴스 — 가장 쉬움

인스타 자동 올리기의 `IG_TOKEN` 을 그대로 쓴다. Variables 에 `SHORTS_IG` = `on` 만 넣으면 끝.

## 2. 유튜브 쇼츠

1. [Google Cloud 콘솔](https://console.cloud.google.com) → 프로젝트(CheesePotato123) → **YouTube Data API v3** → **사용**.
2. 왼쪽 메뉴 **Google 인증 플랫폼**(OAuth 동의 화면) → 시작하기 → 앱 이름 「치즈감자」 · 지원 메일 → 대상 **외부** → 만들기.
3. **대상(Audience)** → 게시 상태를 **프로덕션으로 푸시**.
   (「테스트」로 두면 연결이 **7일마다 끊긴다**. 확인 안 된 앱 경고가 떠도 내 채널에 올리는 데는 괜찮다.)
4. **클라이언트** → 클라이언트 만들기 → 유형 **웹 애플리케이션** →
   승인된 리디렉션 URI 에 `https://everykoreans.com/connect.html` → 만들기.
5. 나온 **클라이언트 ID** · **클라이언트 보안 비밀번호**를 GitHub Secrets 에 `YT_CLIENT_ID` · `YT_CLIENT_SECRET` 으로.
6. 연결: `https://everykoreans.com/connect.html` → 클라이언트 ID 넣고 「구글로 연결」 → 치즈감자 유튜브 채널 고르기 → 허용 →
   돌아온 쪽의 코드 복사 → Actions → shorts-post → Run workflow → what `connect-yt`, code 붙여 넣기 → 초록 ✓.
7. Variables `SHORTS_YT` = `on`.

**심사:** 구글이 이 앱을 검사(audit)하기 전에는 API 로 올린 영상이 **비공개**로 잠긴다.
그동안은 유튜브 스튜디오에서 공개로 바꿔 주면 된다. 심사는 Google Cloud → YouTube Data API → 「할당량 · 감사 신청」 양식으로 신청한다.
통과하면 Variables `YT_PRIVACY` = `public`. 기본 한도로는 하루 몇 편(대략 6편)까지 올릴 수 있다.
표지(썸네일)는 채널이 **전화번호 인증**돼 있어야 들어간다(안 되면 영상만 올라간다).

## 3. 틱톡

1. [TikTok for Developers](https://developers.tiktok.com) → 로그인 → **Manage apps** → **Connect an app**(앱 만들기).
2. 앱 정보: 이름 「치즈감자」, 아이콘(로고), 분류 Education, 웹사이트 `https://everykoreans.com`,
   약관 `https://everykoreans.com/terms.html`, 개인정보 `https://everykoreans.com/privacy.html`.
3. Products 에 **Login Kit** · **Content Posting API** 추가 → Login Kit 의 Redirect URI 에 `https://everykoreans.com/connect.html`.
   Scopes: `user.info.basic` · `video.upload` · `video.publish`.
4. **Client key** · **Client secret** → GitHub Secrets 에 `TT_CLIENT_KEY` · `TT_CLIENT_SECRET`.
5. 연결: connect.html → Client key 넣고 「틱톡으로 연결」 → 허용 → 코드 복사 → Run workflow → what `connect-tt`.
6. Variables `SHORTS_TT` = `on`.

**심사 전:** 영상이 틱톡 앱의 **초안함(받은 편지함 알림)**으로 간다 → 앱에서 열고 → 촬영소 「5. 대기열」의 **글 복사**로 설명을 붙여 넣고 → 게시.
틱톡 앱이 심사 전이라 영상 공개 범위가 「나만 보기」로 묶일 수 있다.
**심사 뒤:** Variables `TT_MODE` = `direct`, `TT_PRIVACY` = `PUBLIC_TO_EVERYONE` → 바로 게시된다.
(틱톡 심사 조건 · 화면 규칙은 자주 바뀐다 — 신청할 때 틱톡 안내를 따른다.)

## 매일 하는 일

1. 촬영소에서 문제 고르기 → **R** → 형광펜 · 펜으로 풀이 → **A** 정답 · **W** 풀이 → **R**.
   - **문법**: 맨 위 「✏️ 문법 소개」 → 문법 고르기 → **R** → **→ / Space** 로 한 장씩 넘기며 설명(표지 → 뜻 → 모양 → 예문 → 주의 → 대화 → 직접 해 보기) → **R**.
     장마다 형광펜 자국이 따로 남는다. 슬라이드는 `shorts-grammar.js` 가 사이트 문법 자료 290개로 만든다.
2. 확인 칸에서 들어 보고 **📤 대기열에 올리기**(저절로 다음 문제로).
3. 끝. 「5. 대기열」에서 ▶️ 📷 🎵 가 ✅ 로 바뀌는지 본다. ⚠️ 가 세 번이면 ⏭️(건너뜀) — Actions 의 빨간 실행을 열어 까닭을 본다.

## 열쇠가 끊겼을 때

- 유튜브 「구글 열쇠 새로 받기 실패」 → 2-6 연결만 다시.
- 틱톡 「틱톡 열쇠 새로 받기 실패」 → 3-5 연결만 다시.
- 인스타 → docs/insta-auto.md 「토큰 새로 넣기」.
