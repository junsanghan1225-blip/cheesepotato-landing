# 파일 저장소 고르기 — Supabase · Cloudflare R2 · AWS S3

녹음 파일(`assets/audio/`)이 지금 **174MB**다. 「단어」 섹션을 키우면(`docs/plans/vocab-plan.md`) 낱말 · 예문 소리가 늘어
**1GB 가까이** 간다. 지금은 GitHub Pages 가 사이트와 함께 이 파일들을 내주는데, GitHub Pages 는
**사이트 1GB · 한 달 전송 100GB 정도를 권장 한도**로 둔다. 그래서 소리 파일만 바깥 저장소로 옮길 곳을 고른다.

> 요금 · 한도는 바뀐다. 아래 값은 대략이다 — **가입 전에 각 회사의 요금 쪽을 한 번 확인**할 것.

## 한눈에

| | **Supabase Storage** | **Cloudflare R2** | **AWS S3** |
|---|---|---|---|
| 새로 가입 | **필요 없음**(이미 쓰는 중) | 필요 | 필요 |
| 사이트 코드 준비 | **됨**(CSP 에 이미 주소가 있음) | 주소 한 줄 + CSP 한 줄 | 주소 한 줄 + CSP 한 줄 |
| 전송 요금(사람들이 소리를 들을 때) | 무료 요금제는 한 달 몇 GB 안팎, 넘으면 유료 요금제($25/월~) | **전송 요금이 없다** | GB 당 요금이 붙는다 |
| 보관 요금 | 무료 1GB 안팎, 유료 요금제에 100GB | 10GB 까지 무료 안팎, 그 뒤 싸다 | 싸다 |
| 설정 난이도 | **쉬움** | 보통 — 제대로 쓰려면 도메인(DNS)을 Cloudflare 로 옮겨 `audio.everykoreans.com` 을 만든다 | 어려움 — 메뉴가 많고 잘못 열면 요금 폭탄 |
| 한 줄 평 | 지금 규모에 가장 쉬움 | 듣는 사람이 많아지면 가장 쌈 | 우리에겐 과함 |

## 추천

1. **지금 → Supabase Storage.** 가입도 새 설정도 필요 없고, 사이트는 이미 그 주소를 허용한다. 지금 방문자 수면
   무료 한도 안에서 충분하다. 할 일은 `docs/antigravity/handoff-antigravity.md` 2번(공개 버킷 `audio` → 같은 경로로 올리기 →
   `app.js` 한 줄)이다.
2. **나중 → Cloudflare R2.** Supabase 대시보드의 사용량(Usage)에서 **전송량이 무료 한도에 자주 닿기 시작하면**
   옮긴다. 소리는 듣는 만큼 전송량이 늘어서, 사람이 많아지면 「전송 요금 없음」이 가장 큰 차이가 된다.
   옮기는 일은 다시 올리고 주소 한 줄 바꾸는 것이다.
3. **AWS 는 쓰지 않는다.** 할 수 있는 것은 많지만 우리에게 필요한 것(파일 보관 · 내주기)에 비해 설정이 복잡하고,
   전송 요금이 붙는다.

## 운영자가 고른 것: **Supabase Storage** (2026-09-28)

**Supabase 는 파일 이름에 한글을 안 받는다**(영문 · 숫자 · 일부 기호만). 우리 녹음은 `dict/먹다.mp3` 처럼 한글
이름이 많아서, 올릴 때 이름을 바꾸고 사이트도 같은 규칙으로 찾는다 — 규칙은 `audio-key.js` 한 곳에 있다.
(`dict/먹다.mp3` → `dict/!EB!A8!B9!EB!8B!A4.mp3`)

**옮기는 순서**
1. **운영자** — Supabase → Storage → **New bucket** → 이름 `audio`, **Public bucket 켬** → Create.
2. **운영자 컴퓨터**(저장소 폴더, PowerShell):
   ```powershell
   git pull origin main
   node tools/upload-audio.mjs --dry                 # 몇 개 · 몇 MB 인지 (열쇠 없이)
   $env:SUPABASE_SERVICE_KEY = "…"                  # Project Settings → API → service_role. 대화에 붙이지 말 것
   node tools/upload-audio.mjs                       # 올린다. 끊기면 다시 돌리면 이어서
   ```
   끝에 나오는 주소를 브라우저로 열어 소리가 나면 된다.
3. **Claude** — `audio-key.js` 의 `AUDIO_REMOTE` 에 주소를 넣고 머지. 사이트는 **바깥 → 사이트 사본 → 브라우저
   목소리** 차례로 찾으므로, 빠진 파일이 있어도 소리가 끊기지 않는다.
4. 한두 주 지켜본 뒤 문제가 없으면 `assets/audio/` 를 저장소에서 지우는 것을 운영자와 정한다.

## 옮길 때 지킬 것 (어느 쪽이든)

- 경로 구조는 그대로(`dict/…`, `read/…`, `listen/…`, `eps/…`, `travel/…`), 이름만 `audio-key.js` 규칙으로.
  올린 뒤 하나를 브라우저로 직접 열어 소리가 나는지 본다.
- **저장소 열쇠(service key · API key)는 대화 · 코드에 적지 않는다.** 올리는 일은 운영자 컴퓨터에서.
- 사이트에서 사전 · 읽기 · 듣기 · 여행 소리가 다 나는 것을 확인한 **뒤에야** `assets/audio/` 를 저장소에서 지운다.
  (지워도 git 기록에는 남는다 — 저장소 크기까지 줄이는 것은 급하지 않다.)
- 녹음소(`record.html`)의 ZIP 은 계속 저장소 경로(`assets/audio/…`) 모양이다. 옮긴 뒤에는 ZIP 을 받은 Claude 가
  바깥 저장소에 올리는 순서로 바뀐다 — 그때 `docs/ops/recording.md` 를 고친다.
