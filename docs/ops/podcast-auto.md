# 팟캐스트 자동 올리기 — 녹음 → 유튜브 · 스포티파이 (2026-10-19)

운영자는 **녹음 파일만 올린다.** 표지 · 제목 · 설명 · 유튜브 올리기 · 스포티파이 방송 목록은 정해진 틀대로 자동이다.

```
녹음 파일(mp3 · m4a) ──▶ /podcast.html (운영자 전용) ──▶ Supabase(소리 · 표지 + 표 podcast_queue)
                                                              │  30분마다 액션 podcast-post
                                                              ▼
                              유튜브(소리 + 표지로 만든 영상, 자막) · 방송 목록 feed.xml ──▶ 스포티파이가 읽어 감
```

- 에피소드 목록 · 제목 · 설명은 대본(`docs/podcast/ep*.md`)에서 온다 → `node tools/build-podcast.mjs` → `podcast-episodes.json`. 대본을 고치면 다시 돌린다.
- 유튜브는 소리만 올릴 수 없어서 **표지 그림 + 소리**로 영상을 만들어 올린다(ffmpeg, 액션 안에서).
- 유튜브 열쇠는 **쇼츠 공장과 같은 것**이다(`docs/ops/shorts-auto.md` 2번이 끝나 있어야 한다). 따로 연결하지 않는다.
- 자막: 기본은 **유튜브 자동 자막**(영상이 올라가면 유튜브가 저절로 단다 — 틀린 곳은 유튜브 스튜디오에서 고친다).
  직접 자막을 만들고 싶으면 Variables `PODCAST_SRT` = `on`(Whisper — ⚠ 아직 시험 전).

## 0. 처음 한 번
1. Supabase → **SQL Editor** → `db/add_podcast.sql` 붙여 넣고 **Run**(쇼츠용 `db/add_shorts.sql` 을 이미 돌렸어야 한다 — 같은 운영자 확인 함수를 쓴다).
2. GitHub → Settings → Secrets and variables → Actions → **Variables** → `PODCAST_AUTO` = `on`.
   (`SUPABASE_SERVICE_KEY` · `YT_CLIENT_ID` · `YT_CLIENT_SECRET` 은 쇼츠 공장에서 이미 넣은 것을 같이 쓴다. `YT_PRIVACY` 도 같은 값 — 구글 심사 전에는 비공개로 올라간다.)
3. 시험: 아래 「매번」으로 짧은 파일 하나 올리고 → Actions → podcast-post → **Run workflow** → what `dry`(영상 만들기까지만). 초록 ✓ 이면 what `post` 로 올려 본다.

## 1. 스포티파이 — 한 번만
1. `https://everykoreans.com/podcast.html` 맨 아래 **방송 목록 주소**(`…/podcast/feed.xml`)를 복사한다.
2. [Spotify for Creators](https://creators.spotify.com) → 새 방송 → **이미 방송이 있어요 / RSS 가져오기** → 위 주소 붙여 넣기 → 메일 확인 코드 입력 → 완료.
3. 이후 새 에피소드는 방송 목록에 저절로 들어가고, 스포티파이가 알아서 가져간다(몇 시간 걸릴 수 있다).
- 방송 표지는 `podcast-cover.jpg`(1400×1400, 흰 바탕 · 표현 3개 작게 — 운영자 2026-10-19 확정, 사이트에 올라가 있음)를 쓴다. 편별 표지는 올리기 쪽(`podcast.js` cover)이 같은 틀로 저절로 만든다. 이름 · 소개는 `tools/podcast-post.mjs` 의 `feed()` 에서 고친다.
- 스포티파이의 대본(자막) 기능 · 조건은 **확인하지 못했다** — 스포티파이 안내를 보고 필요하면 알려 주기.

## 매번 (녹음 올리기)
1. 폰이나 PC 로 대본을 읽으며 녹음 → mp3 또는 m4a 로 저장.
2. `https://everykoreans.com/podcast.html`(운영자 계정으로 로그인된 브라우저) → 에피소드 고르기 → 파일 고르기 → 들어 보기 → **📤 대기열에 올리기**.
3. 끝. 30분 안에 유튜브에 올라가고(처음엔 비공개), 대기열의 유튜브 칸이 ⏳ → ✅ 로 바뀐다. ⚠️ 가 세 번이면 ⏭️(건너뜀) — Actions 의 빨간 실행을 열어 까닭을 본다.

## 알아 둘 것
- 이 흐름은 **여기서 실제 유튜브 · 스포티파이로 시험하지 못했다**(feed.xml 만들기는 가짜 자료로 확인). 첫 한 편을 올릴 때 Claude 와 같이 보며 고친다.
- Supabase 무료 판은 저장 1GB · 파일 하나 50MB. 6분 mp3 ≈ 6MB 라 150편쯤은 괜찮다. 소리 파일은 스포티파이가 계속 가져가야 해서 **지우지 않는다**.
- 소리 파일 주소는 공개지만 이름을 짐작하기 어렵다. 표는 운영자 메일만 읽는다.
