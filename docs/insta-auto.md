# 인스타 자동 올리기 — 운영자용 안내

하루 네 번(한국 시간 **09:07 단어 1 · 13:07 오늘의 TOPIK · 18:07 문법 · 23:07 단어 2** — 15분마다 「시간이 지났는데 안 올린 것」을 보고 올린다, 3시간 넘게 밀리면 그날 몫은 건너뜀), GitHub 이 편집기(`/insta.html`)와 같은 모양으로
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

## 스토리 · 스레드 (2026-10-03)

- **스토리**: 13:07 「오늘의 TOPIK」을 올릴 때 그 문제 1장을 세로(9:16) 스토리로도 올린다(`story.jpg`). 같은 `IG_TOKEN` 을 쓴다.
  메타가 스토리 게시를 막으면 그 칸만 노랗게 넘어가고 피드 게시물은 그대로 올라간다.
- **스레드**: 같은 그림 · 줄인 글(500자 안, 해시태그 하나)을 스레드에도 올린다. **`THREADS_TOKEN` 을 넣기 전에는 건너뛴다.**

### 스레드 켜기 (운영자, 한 번)

1. developers.facebook.com → 내 앱 → cheesepotatoeverykoreans → 왼쪽 **이용 사례** → **「이용 사례 추가」** →
   **「Threads API에 액세스」**(Access the Threads API) → 추가.
2. 그 이용 사례의 **권한**에서 `threads_basic` · `threads_content_publish` 가 「테스트 준비 완료」인지 본다(아니면 「추가」).
3. **앱 역할 → 역할 → 「Threads 테스터 추가」** 에 스레드 계정(인스타와 같은 아이디) → 스레드 앱 **설정 → 계정 → 웹사이트 권한 → 초대** 에서 수락.
4. 이용 사례의 **설정**에서 「액세스 토큰 생성」(User Token Generator) → 그 계정 옆 **토큰 생성** → 복사.
5. GitHub → Settings → Secrets and variables → Actions → **New repository secret** → Name `THREADS_TOKEN` → 붙여 넣기.
   (Claude 에게 보내지 않는다.) 다음 예약부터 스레드에도 올라간다. 이 열쇠도 약 60일마다 새로 넣는다.

## 정확한 시간에 깨우기 — cron-job.org (2026-10-03)

GitHub 의 예약 실행(15분마다)은 붐비면 몇 시간씩 건너뛴다(10월 3일 04:11 ~ 13:18 에 한 번도 안 돌았다).
그래서 무료 예약 사이트 **cron-job.org** 가 하루 네 번 정해진 시간에 GitHub 에 「지금 올려」를 보낸다.
15분 확인은 예비로 그대로 둔다 — 같은 게시물은 두 번 올라가지 않는다(`posted.json`).

### 1. GitHub 열쇠 만들기 (운영자, 한 번)

1. github.com 오른쪽 위 내 사진 → **Settings** → 왼쪽 맨 아래 **Developer settings** →
   **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Token name `cron-job insta` · Expiration **1년**(달력에 적어 둔다) ·
   Repository access **Only select repositories** → `cheesepotato-landing`.
3. **Permissions → Repository permissions → Actions → Read and write**. 다른 것은 건드리지 않는다.
4. **Generate token** → 나온 `github_pat_…` 를 복사(cron-job.org 에만 넣는다. Claude 에게 보내지 않는다).

### 2. cron-job.org 에 네 개 만들기

cron-job.org 가입(무료) → **Dashboard → Create cronjob**. 네 개 모두 아래처럼, **시간과 slot 만** 다르게.

| 제목 | 시간(Asia/Seoul) | 본문의 slot |
|---|---|---|
| insta 단어 1 | 09:07 | `0` |
| insta TOPIK | 13:07 | `3` |
| insta 문법 | 18:07 | `2` |
| insta 단어 2 | 23:07 | `1` |

- **COMMON** 탭
  - URL: `https://api.github.com/repos/junsanghan1225-blip/cheesepotato-landing/actions/workflows/insta-post.yml/dispatches`
  - Execution schedule: **Custom** → Days of month · Days of week · Months 는 **모두(Every)**, Hours 는 위 표의 시, Minutes 는 `7`.
  - 시간대(Time zone)가 **Asia/Seoul** 인지 본다(계정 설정 또는 이 화면 아래).
- **ADVANCED** 탭
  - Request method: **POST**
  - Headers 에 세 줄:
    - `Authorization` : `Bearer github_pat_…`(복사한 열쇠)
    - `Accept` : `application/vnd.github+json`
    - `Content-Type` : `application/json`
  - Request body: `{"ref":"main","inputs":{"slot":"0","dry":"no"}}` ← slot 숫자만 표대로 바꾼다.
- **CREATE** 로 저장.

### 3. 시험 (한 번)

아무 하나를 열어 body 의 `"dry":"no"` 를 잠깐 `"dry":"yes"` 로 → **TEST RUN** → 결과가 **204** 면 성공
(GitHub → Actions → insta-post 에 새 실행이 생기고, 인스타에는 안 올라간다). 확인한 뒤 `"no"` 로 되돌려 저장.

| 결과 | 뜻 |
|---|---|
| 204 | 성공 |
| 401 | 열쇠가 틀렸거나 끝났다 → 1번을 다시 하고 네 개의 Authorization 을 바꾼다 |
| 403 · 404 | 열쇠의 권한(Actions: Read and write) · 저장소 선택을 다시 본다 |
| 422 | body 모양이 틀렸다 → 위 줄을 그대로 다시 붙여 넣는다 |
