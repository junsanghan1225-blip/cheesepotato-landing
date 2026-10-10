# CLAUDE.md — 치즈감자(everykoreans.com) 작업 약속

이 저장소에서 일하는 Claude 가 **맨 먼저 읽는 파일**이다. 여기 적힌 것은 운영자와 이미 정한 약속이다.
모르는 것이 생기면 짐작하지 말고 물어본다.

## 1. 무엇인가

- **everykoreans.com** — 한국어 학습 사이트(치즈감자). 운영자: 에브리코리안즈(개인사업자).
- **빌드 없는 정적 사이트.** `main` 에 머지하면 1~2분 뒤 GitHub Pages 가 올린다.
- 화면의 중심: `index.html`(마크업 · CSP) · `app.js`(메뉴 · 첫 화면) · `app.module.js`(거의 모든 화면) ·
  `app-views.css`. 자료는 `*.js`(courses · sentences · topik · eps · glossary …).
- 서버: **Supabase**(프로젝트 ref `tjgoevtvobvmlyefgxel`) — 로그인 · 표 · Edge Functions(`supabase/functions/`).
  결제: **Polar**(`billing.js`, 웹훅 `supabase/functions/polar-webhook` — 2026-10-03 Paddle 거절 → Polar 승인). AI 쓰기 채점: `grade-writing`(Gemini).
- 분석: GTM `GTM-K4Z87SVS` · GA4 `G-4KF487RTZT` · Clarity(`analytics.js`). 이 id 들은 비밀이 아니다.
- 자세한 설명은 `README.md`, 문서 지도는 `docs/README.md`. 앱(안드로이드)은 따로 저장소 `cheesepotatoapp`.

## 2. 운영자와 일하는 법

- **한국어로, 쉬운 말로, 결론 먼저.** 운영자는 개발자가 아니다. 파일 이름 · 함수 이름보다 「무엇이 바뀌고
  무엇을 하면 되는지」를 말한다. 운영자가 직접 할 일은 번호를 매겨 단계별로.
- **크레딧을 아낀다.** 문항 · 글 · 번역처럼 양이 많은 콘텐츠는 **안티 그래비티**(다른 AI)에게 맡긴다 —
  Claude 는 지시문(`docs/antigravity/antigravity-*.md`)을 쓰고, 올라온 결과를 검토해 넣는다.
  작은 수정 여러 번보다 한 번에 묶는다. 화면 확인(Playwright 스크린샷)은 꼭 필요한 곳만.
- **시킨 것만 한다.** 요청 밖의 개선은 하지 말고 「이런 것도 있다」고 한 줄로 제안만 한다.
  요청이 두 가지로 읽히면 짐작하지 말고 먼저 묻는다.
- 결과는 정직하게. 확인 못 한 것은 「확인 못 했다」고 말한다. 추측을 사실처럼 말하지 않는다.

### 운영자의 짧은 말 → 정해진 순서 (매번 다시 생각하지 않는다)
| 운영자 말 | Claude 가 하는 것 |
|---|---|
| 「머지해줘」 | `node tools/preflight.mjs` → 커밋 · 푸시 → PR → CI 초록불 → squash 머지(`expectedHeadSha`) → 작업 브랜치를 새 main 으로 다시 세움(`git checkout -B <브랜치> origin/main && git merge -s ours origin/<브랜치>` → 푸시). 「머지해줘」가 없으면 PR 까지만. |
| 「안티가 올렸어」 | `node tools/ag-status.mjs` → 🆕 인 브랜치만 → 그 지시서의 「지킬 것」대로 검토(다른 칸 안 바뀜 · 사실 · 기출) → 고칠 것은 고쳐 넣음 → 생성 도구 · 자국 → PR → `docs/antigravity/STATUS.md` 고침. 🆕 가 없으면 「아직 안 올라왔다」고 바로 말한다. |
| 「SQL 돌렸어」 · 「배포했어」 · 「설정했어」 | `docs/todo.md` 운영자 줄을 「끝난 것」으로 → 그다음 단계를 말한다. |
| Clarity CSV · 숫자 판 캡처 | 나라 · 기기 · 입구 · 머문 시간 · 한 사람이 여러 번인지(유럽 — 쿠키 동의 전) 를 보고 이상한 것 · 고칠 것 1~3개. 숫자는 숫자 판이 기준. |
| 「앱 …」 | 앱 저장소 `/home/user/cheesepotatoapp`(없으면 add_repo) — 그 저장소 `AGENTS.md` 먼저. 앱 저장소엔 CI 가 없으니 `npx tsc --noEmit` 으로 확인. |
| 새 기능 · 화면 요청 | `docs/prd.md` 범위 안인지 → 두 가지로 읽히면 묻기 → 만들기 → 390 · 1280 확인 → PR. |

### 일이 끝날 때마다 기록 (한 번에)
- 정한 것 → `docs/decisions.md` 맨 아래 한 줄. 갈래가 바뀌면 → `docs/status.md` 그 갈래 줄.
- 할 일 → `docs/todo.md`(새로 생긴 운영자 할 일은 여기에 — 채팅에만 두지 않는다). 안티 → `docs/antigravity/STATUS.md`.
- 기록은 그 일의 PR 에 같이 넣는다(따로 PR 을 만들지 않는다).

## 3. 운영자가 시키기 전에는 절대 하지 않는 것

- **결제 켜기** — `billing.js` 의 `ON` 을 `true` 로 바꾸는 것. 바꾸는 순간 실제 결제가 열리고
  TOPIK 모의고사 2회차부터 잠긴다. (2026-10-04 운영자 「결제 켜줘」로 `true` — 끄는 것도 운영자가 시킬 때만)
- **비밀 값을 묻거나 적는 것** — Polar access token · 웹훅 secret(`POLAR_WEBHOOK_SECRET`), Supabase service key,
  Gemini key. 이것들은 운영자가 Supabase Secrets 에 직접 넣는다. 채팅 · 코드 · 커밋 어디에도 적지 않는다.
  (브라우저용 공개 값 — Polar 결제 링크 `buy.polar.sh/polar_cl_…`, Supabase anon key — 은 괜찮다.)
- **Supabase 에 직접 손대는 것** — SQL 은 `db/*.sql` 파일로 쓰고, 운영자가 SQL Editor 에서 돌린다.
  함수는 파일로 쓰고, 운영자가 대시보드에서 배포한다. 이미 있는 표(`ai_usage` 등)를 지우거나 바꾸지 않는다.
- **되돌릴 수 없는 일** — 파일 · 브랜치 삭제, `main` 에 직접 푸시, force push(자기 브랜치의 이미 머지된
  기록을 새 main 으로 다시 세울 때만 `--force-with-lease`), 녹음 파일(`assets/audio/`) 지우기.
- **사실을 지어내는 것** — 기관 · 전화번호 · 법 · 제도 · 요율, 실제 TOPIK/EPS 기출 문항. 문항은 전부 창작이고
  「기출 아님」을 지킨다.
- 커밋 · PR · 코드에 **모델 이름을 적는 것.**

## 4. 코드를 고칠 때의 규칙

- **자국(stamp):** 코드 · 자료 · CSS 를 고치면 반드시 `node tools/stamp.mjs && node tools/stamp.mjs --check`.
  빼먹으면 사용자 브라우저에 예전 파일이 남는다. **새 `.js` 파일을 불러오면 `tools/stamp.mjs` 의 `ASSETS`
  에도 넣는다.** 다른 브랜치(안티 그래비티)를 받을 때는 main 기준으로 자국을 다시 찍는다.
- **CSP:** `index.html` 에 인라인 `<script>` 를 넣지 않는다(CSP 에 unsafe-inline 이 없다). 새 외부 주소가
  필요하면 CSP 에 넣는다.
- **생성물은 손으로 고치지 않는다** — 원본을 고치고 도구를 돌린다.
  | 생성물 | 원본 → 도구 |
  |---|---|
  | `vi/` `ja/`(언어별 첫 쪽) `sentence/` `course/` `lesson/` `topik-*/` `eps-topik/` `dictionary/` `topik1-words/` `topik2-words/` `korean-word-for/` `blog/` `compare/` `sitemap*.xml` `wotd.js` | 자료 `*.js` · `blog.js` · `vocab-topik1.js` → `node tools/build-pages.mjs` |
  | `pricing.html` `terms.html` `refund.html` | `node tools/build-legal.mjs` |
  | `record/*.json` | `node tools/record-list.mjs` |
  | `search-index.js`(첫 화면 검색 칸 색인) | 낱말 · 사전 · 문법 · 코스 · 쓰기 · 블로그 자료 → `node tools/build-search.mjs`(build-pages 가 끝에 같이 부른다) |
  | `db/add_qa_seeds.sql`(묻고 답하기 씨앗 질문) | `docs/qa-seeds.json` → `node tools/build-qa-seeds-sql.mjs` |
  | `grammar-words.js`(문법 「같이 알면 좋은 단어」) | `docs/grammar-words.json`(안티 그래비티 · Claude 검토) → `node tools/build-grammar-words.mjs` |
  | `grammar-usage.js`(문법 「쓰임 보기」 + 「블록으로 맞추기」 연습 문장) | 우리 자료(TOPIK · 읽기 · 낱말 예문) · `grammar-mark.js` · `docs/grammar-practice.json`(안티 · Claude 검토, 검사 `check-grammar-practice`) → `node tools/build-grammar-usage.mjs` |
  | `grammar-drill.js`(문법 「바꾸기」 문항) | 문법 이름(`sentences*.js`) · `tools/ko-conj.mjs` attach · `docs/grammar-drill-extra.json`(자동이 안 되는 것, 안티 · Claude 검토) → `node tools/build-grammar-drill.mjs` |
  | `path-map.js`(학습 길 — 레슨마다 붙일 문법) | `courses.js` · 문법 자료 · `docs/path-map.json`(사람이 고친 짝, 있으면 우선) → `node tools/build-path-map.mjs` |
  | `translate.js`(번역 연습 — 영어 → 한국어 한 줄씩) | `docs/translate.json`(안티 · Claude 검토, 지시 `docs/antigravity/antigravity-translate-task.md`) → `node tools/build-translate.mjs` |
  | `grammar-pairs.js`(헷갈리는 문법 비교 · 퀴즈) | `docs/grammar-pairs.json`(안티 · Claude 검토, 지시 `docs/antigravity/antigravity-grammar-fill-task.md`) → `node tools/build-grammar-pairs.mjs` |
  | `topik-refs/`(낱말 → 우리 TOPIK 문항의 쓰임 문장, 단어 한 장 「TOPIK에서」 탭) | `topik.js` · `topik2.js` · `topik-listening.js` · `topik-writing.js` · `vocab/data/*.json` → `node tools/build-topik-refs.mjs` |
  | `docs/i18n/strings.json`(화면 글자 목록) · `i18n-<언어>.js`(화면 번역 사전) | 코드의 t() · index.html data-en → `node tools/i18n-extract.mjs`; `docs/i18n/<언어>.json`(안티 번역) → `node tools/build-i18n.mjs`(검사 `check-i18n`) |
  | `expressions.js`(「단어」 표현 탭 — 사자성어 · 속담 · 관용 표현) | `vocab/data/expressions.json`(안티 · Claude 검토, 검사 `check-expressions`) → `node tools/build-expressions.mjs` |
  | `vocab-topik1.js` · `vocab-topik2.js` · `vocab-topik2-ex/`(TOPIK II 예문 조각, 500개씩) | `vocab/data/topik1.json` · `topik2.json`(B급 이상만) → `node tools/build-vocab.mjs` |
- **검사:** 올리기 전에 **`node tools/preflight.mjs` 한 줄** — 자국 찍기 · 확인, 문법, CI(`check.yml`)의 검사 전부를 같은 차례로.
  첫 쪽 · `llms.txt` 의 숫자(문항 수 등)가 바뀌면 `check-geo` 가, 없는 문서 경로는 `check-docs` 가 알려 준다.
- **말투:** 코드 주석은 주변처럼 한국어로, 「왜」를 적는다. 사용자에게 보이는 글은 `t('한국어', 'English')` 로 둘 다.
- **화면 확인:** 화면을 바꾸면 폭 390px(폰)과 1280px(PC)에서 가로 스크롤 · JS 오류가 없는지 본다.

## 5. 어디를 보나 (2026-10-10 운영자 「작업 구조 향상」 — 문서 3층)

대화를 시작하면 **`docs/todo.md` → 그 일의 갈래 줄(`docs/status.md`)** 순서로 본다. 지도는 `docs/README.md`.
| 무엇 | 어디 |
|---|---|
| 무엇을 · 누구에게 · 왜 | `docs/prd.md` (⚠ = 운영자가 정할 것) |
| 언제 · 숫자 | `docs/roadmap.md` — **새 일을 시작하기 전에 먼저 읽는다** |
| 정한 것 한 줄씩 | `docs/decisions.md` — 운영자가 무엇을 정하면 **맨 아래 한 줄** 더한다 |
| 갈래별 지금 상태(단어 · 레벨 · 반 · 길 · 언어 · 결제 …) | `docs/status.md` — 그 갈래 일을 하면 그 줄을 고친다 |
| 할 일 판(운영자 · Claude) | `docs/todo.md` — 끝나면 「끝난 것」으로 |
| 안티 진행 | `docs/antigravity/STATUS.md` — 「안티가 올렸어」면 이 표부터, 넣으면 표를 고친다 |
| 운영자 순서 · 갈래 계획 · 지난 계획 | `docs/ops/` · `docs/plans/` · `docs/archive/` |

꼭 기억할 지금 사실(자세한 것은 status):
- 결제 **켜짐**(2026-10-04, Polar) — Pro 월 $4.99 · 연 $39 · 시험 패스 $15. AI 한도: 쓰기 채점 무료 2 / Pro 30, 발음 · 도우미 무료 20 / Pro 100.
- 두 길: TOPIK 학생(치즈 0~6급) · 일반(감자 L0~L7). EPS 는 따로 선 갈래(지금 무료).
- 반은 숙제 · 복습용만 — 수업 · 결제를 사이트로 데려오지 않는다(Preply). 반 학생은 Pro 무료.
- 화면 말: 한 · 영 · 베트남 · 일본(켬), 중국어 번역 중. 학습 자료는 번역하지 않는다.
- 앱(cheesepotatoapp, 안드로이드 플레이 출시) — 앱 일은 그 저장소 `AGENTS.md` 먼저.
