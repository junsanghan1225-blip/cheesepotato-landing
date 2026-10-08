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
- 자세한 설명은 `README.md`, 분야별 문서는 `docs/`.

## 2. 운영자와 일하는 법

- **한국어로, 쉬운 말로, 결론 먼저.** 운영자는 개발자가 아니다. 파일 이름 · 함수 이름보다 「무엇이 바뀌고
  무엇을 하면 되는지」를 말한다. 운영자가 직접 할 일은 번호를 매겨 단계별로.
- **크레딧을 아낀다.** 문항 · 글 · 번역처럼 양이 많은 콘텐츠는 **안티 그래비티**(다른 AI)에게 맡긴다 —
  Claude 는 지시문(`docs/antigravity-*.md`)을 쓰고, 올라온 결과를 검토해 넣는다.
  작은 수정 여러 번보다 한 번에 묶는다. 화면 확인(Playwright 스크린샷)은 꼭 필요한 곳만.
- **시킨 것만 한다.** 요청 밖의 개선은 하지 말고 「이런 것도 있다」고 한 줄로 제안만 한다.
  요청이 두 가지로 읽히면 짐작하지 말고 먼저 묻는다.
- 운영자가 「머지해줘」라고 하면: 브랜치 → 검사 → 커밋 → 푸시 → PR → **CI 초록불 확인** → squash 머지.
  「머지해줘」가 없으면 PR 까지만 하고 멈춘다.
- 결과는 정직하게. 확인 못 한 것은 「확인 못 했다」고 말한다. 추측을 사실처럼 말하지 않는다.

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
  | `sentence/` `course/` `lesson/` `topik-*/` `eps-topik/` `dictionary/` `topik1-words/` `topik2-words/` `korean-word-for/` `blog/` `compare/` `sitemap*.xml` `wotd.js` | 자료 `*.js` · `blog.js` · `vocab-topik1.js` → `node tools/build-pages.mjs` |
  | `pricing.html` `terms.html` `refund.html` | `node tools/build-legal.mjs` |
  | `record/*.json` | `node tools/record-list.mjs` |
  | `search-index.js`(첫 화면 검색 칸 색인) | 낱말 · 사전 · 문법 · 코스 · 쓰기 · 블로그 자료 → `node tools/build-search.mjs`(build-pages 가 끝에 같이 부른다) |
  | `db/add_qa_seeds.sql`(묻고 답하기 씨앗 질문) | `docs/qa-seeds.json` → `node tools/build-qa-seeds-sql.mjs` |
  | `grammar-words.js`(문법 「같이 알면 좋은 단어」) | `docs/grammar-words.json`(안티 그래비티 · Claude 검토) → `node tools/build-grammar-words.mjs` |
  | `grammar-usage.js`(문법 「쓰임 보기」 + 「블록으로 맞추기」 연습 문장) | 우리 자료(TOPIK · 읽기 · 낱말 예문) · `grammar-mark.js` · `docs/grammar-practice.json`(안티 · Claude 검토, 검사 `check-grammar-practice`) → `node tools/build-grammar-usage.mjs` |
  | `grammar-drill.js`(문법 「바꾸기」 문항) | 문법 이름(`sentences*.js`) · `tools/ko-conj.mjs` attach · `docs/grammar-drill-extra.json`(자동이 안 되는 것, 안티 · Claude 검토) → `node tools/build-grammar-drill.mjs` |
  | `path-map.js`(학습 길 — 레슨마다 붙일 문법) | `courses.js` · 문법 자료 · `docs/path-map.json`(사람이 고친 짝, 있으면 우선) → `node tools/build-path-map.mjs` |
  | `translate.js`(번역 연습 — 영어 → 한국어 한 줄씩) | `docs/translate.json`(안티 · Claude 검토, 지시 `docs/antigravity-translate-task.md`) → `node tools/build-translate.mjs` |
  | `grammar-pairs.js`(헷갈리는 문법 비교 · 퀴즈) | `docs/grammar-pairs.json`(안티 · Claude 검토, 지시 `docs/antigravity-grammar-fill-task.md`) → `node tools/build-grammar-pairs.mjs` |
  | `topik-refs/`(낱말 → 우리 TOPIK 문항의 쓰임 문장, 단어 한 장 「TOPIK에서」 탭) | `topik.js` · `topik2.js` · `topik-listening.js` · `topik-writing.js` · `vocab/data/*.json` → `node tools/build-topik-refs.mjs` |
  | `docs/i18n/strings.json`(화면 글자 목록) · `i18n-<언어>.js`(화면 번역 사전) | 코드의 t() · index.html data-en → `node tools/i18n-extract.mjs`; `docs/i18n/<언어>.json`(안티 번역) → `node tools/build-i18n.mjs`(검사 `check-i18n`) |
  | `expressions.js`(「단어」 표현 탭 — 사자성어 · 속담 · 관용 표현) | `vocab/data/expressions.json`(안티 · Claude 검토, 검사 `check-expressions`) → `node tools/build-expressions.mjs` |
  | `vocab-topik1.js` · `vocab-topik2.js` · `vocab-topik2-ex/`(TOPIK II 예문 조각, 500개씩) | `vocab/data/topik1.json` · `topik2.json`(B급 이상만) → `node tools/build-vocab.mjs` |
- **검사:** 올리기 전에 CI 와 같은 검사를 돌린다(`.github/workflows/check.yml` 의 목록).
  `node --check app.js && node --check app.module.js`, `node tools/check-*.mjs`.
  첫 쪽 · `llms.txt` 의 숫자(문항 수 등)가 바뀌면 `check-geo` 가 알려 준다.
- **말투:** 코드 주석은 주변처럼 한국어로, 「왜」를 적는다. 사용자에게 보이는 글은 `t('한국어', 'English')` 로 둘 다.
- **화면 확인:** 화면을 바꾸면 폭 390px(폰)과 1280px(PC)에서 가로 스크롤 · JS 오류가 없는지 본다.

## 5. 지금 상태 (2026-09-28)

- **진행 중인 큰 일: 「단어」 섹션** — 계획은 `docs/vocab-plan.md`(1~7층, 운영자와 합의). TOPIK I 자료 1,930개(B급) 끝,
  **2단계(화면 `#words` · `words.js` · 내 단어장 연동) 끝, 3단계(낱말 쪽 보강 · `/topik1-words/`) · 4단계(받아쓰기 · 짝 맞추기 · 시험 · `/korean-word-for/`) 끝** — 지금 **5단계(자료 확장)**: TOPIK II 씨앗 8,183개(`vocab/data/topik2.json`, `tools/vocab-seed-topik2.mjs`),
  안 그래비티가 500개씩 채운다(`docs/antigravity-vocab-topik2-task.md`) — 들어오면 검토. **17묶음까지 모두 끝(8,183개 전부 B급, 2026-10-01)**(올라오면 커밋이 있는지 먼저 본다).
- **레벨 계획**(`docs/level-plan.md`): 1 ~ 5층 합의 끝, 6 · 7층 초안 — 레벨업 화면은 운영자 스케치를 받아 만든다.
  화면 구성(배치)은 운영자가 직접 보고 방향을 준다 — 그 전에는 배치를 크게 바꾸지 않는다.
  자료를 고치면 `node tools/vocab-level.mjs && node tools/build-vocab.mjs && node tools/build-pages.mjs`(낱말마다 우리 레벨 `lv` 감자 L1~L7 — 2026-10-05 운영자 요청, 기준은 도구 맨 위). 활용 · 로마자는 `tools/ko-conj.mjs`(정답표 `check-conj`). 외우기 기록은 `settings.vocab`, 담은 낱말은 `words`(+ `vocab_id` · `source`).
  이 계획에 없는 것은 하지 않고 「다음에」 칸에 적는다. 녹음 파일을 옮길 곳은 `docs/storage-guide.md`
  (추천: 지금 Supabase Storage → 전송량이 늘면 Cloudflare R2, AWS 는 안 씀).

- **일반 / TOPIK 두 길 · 감자 / 치즈 레벨**(운영자 결정 2026-09-29): 레벨테스트 목표가 「TOPIK 준비」면 TOPIK 학생(치즈 0~6급,
  첫 화면 · 머리띠가 TOPIK 먼저, 단어는 TOPIK I/II 필수), 그 밖 · 테스트 전은 일반(감자 L0~L7, 코스 먼저, 단어는 일반 한국어).
  아이콘은 `levels.js`(`myLevelBadge`), 나누기는 `app.module.js` `siteTrack` · `applyTrack`. **EPS 는 따로 선 갈래**(첫 화면 · 옆 메뉴 「한국 취업」,
  나중에 따로 묶어 판다 — 지금은 무료). 숨기는 메뉴는 없고 차례만 바꾼다.

- **반 · 숙제**(운영자 결정 2026-10-02): 반은 **운영자만** 만든다 · 학생은 **반 링크(`#learn/class/join/코드`) · 코드**로 들어온다 ·
  첫 판 숙제는 **코스 레슨 · 단어 세션(횟수) · 문법 바꿔 쓰기**. 화면 `#learn/class`(`app.module.js` clsDraw), 표 `db/add_classes.sql`
  (운영자가 SQL Editor 에서 돌린다). 「했음」은 finishLesson · words.js 세션 끝 · 바꿔 쓰기 끝에서 `clsMark` → 서버 `cls_mark`.
  다음에(운영자와 정할 것): TOPIK 쓰기 · 읽기 숙제, 다른 선생님에게 열기(`cls_is_admin` 하나), 첫 화면에 「숙제 N개」.
  **선생님 계정 · 진도 리포트**(운영자 결정 2026-10-06 — 기관 · 대학 파트너십 준비): 운영자가 반 화면 「선생님 계정」에 메일을 올리면 그 사람도 반을 만든다(`db/add_class_teachers.sql`, cls_is_admin = 운영자 + class_teachers). 반마다 「📊 진도 리포트」(학생 × 숙제 표, CSV 받기).
  **반 학생은 Pro 무료**(운영자 결정 2026-10-06): 보관하지 않은 반의 학생이면 Pro — 서버 `is_pro()`(`db/add_class_pro.sql`, 운영자가 SQL Editor 에서) · 화면 `billing.js` isPro(classPro). 반을 나가거나 보관하면 다시 무료.
  **QR · 첫 화면 숙제 · 학생별 진도**(운영자 요청 2026-10-07): 반 카드 「📱 QR」(`qrcode-lib.js`, MIT) — 찍고 로그인만 하면 이름 안 묻고 바로 들어옴 · 반 학생은 첫 화면 맨 위 숙제 카드(`clsHomeRender`) · 진도 리포트에 학생별 카드(`clsStuHtml`) · 「반에서 빼기」 · 개인정보 안내 한 줄(`clsPrivacy`). **반은 숙제 · 복습용으로만 — 수업 · 결제를 사이트로 데려오지 않는다**(Preply 규정, 운영자 결정). 반 학생에게는 선생님 쪽(teacher.html · WhatsApp) 링크를 숨긴다(`clsBodyMark`, body.cls-in). 구글 캘린더 일정은 만들었다가 뺐다(표는 남김, `db/add_class_calendar.sql` 머리글). 운영자 순서 `docs/class-homework.md`.
  **학생 관리 · 레벨 배정 · 학생별 숙제**(운영자 요청 2026-10-07 「레벨은 선생님이 지정 — 레벨테스트 없이 바로」 · 「학생이 느껴도 전문적」): 표 `db/add_class_students.sql`(class_student 레벨 · 한마디 / class_student_note 선생님 메모 / class_hw_target 학생별 숙제). 선생님 「학생 관리」 탭에서 저장 → 학생 기기의 cp_level 이 그 레벨로(`clsApplyLevel`, by:'teacher'). 학생 「내 반」 패널 `clsStudentPanel`(첫 화면 · 반 화면 같이). QR 은 카드 틀 없이 QR 만. 학생 패널은 XP · 별 없이(운영자 「XP 는 빼고 — 해야 한다는 느낌만」) 「오늘 할 일」 카드(.td-*)와 같은 틀(「UI 통일」): 지금 할 숙제(치즈 큰 단추, 늦으면 빨강) · 진행 막대 · 체크 줄.
  **선생님 편의**(운영자 2026-10-07 「다른 플랫폼처럼」 — 넷 다): 「오늘 챙길 학생」(`clsCareHtml` 기한 지남 · 3일 기록 없음 · 막 끝낸 것) · 숙제 묶음(목록에 담기) · 「다시 내기」 · 매주 반복(N주 치 한 번에) · 숙제 코멘트(`db/add_class_feedback.sql`, 학생 끝낸 숙제에 💬) · 학생 리포트 PDF(`clsStuPrint`). 반 이름 바꾸기. 숙제 고르기는 검색 한 칸(`clsCatalog` · `clsPickResults` — 레슨 · 문법 · TOPIK 쓰기 · 읽기 · 단어, 종류 칩 · 최근 숙제 · Enter 로 맨 위 고르기 · 단어 횟수 −/+).

- **강의 영상**(운영자 결정 2026-10-03): 유튜브 「일부 공개」 + 사이트 `#learn/lectures`(`app.module.js` lecDraw, 표 `db/add_lectures.sql`).
  운영자만 「강의 올리기」(유튜브 링크 + 제목). 플레이어는 youtube-nocookie(CSP frame-src · img-src i.ytimg.com). 운영자 순서 `docs/lectures.md`.

- **학습 길 · 목적별 메뉴**(운영자 결정 2026-10-06): 「섹션이 너무 많아 독이 된다 — 한 흐름으로」. 첫 화면 = 길 넷(기초 · 중급 · 고급 · TOPIK),
  나머지는 「더 보기」로 접음. 길 하나 = 걸음 줄(코스 레슨 차례 — 기초 L0~L5 · 중급 L6 · 고급 L7, `MY_LEVEL_COURSES`), 한 걸음 = **문법 → 코스 레슨 → 단어**
  (`app.module.js` pathDraw, 주소 `#learn/path/<길>/<레슨>`). 레슨이 끝나면 「다음 걸음 →」. 옆 메뉴는 🥔 한국어 배우기 · 🧀 TOPIK 준비 · 내 공부 · 더 보기(TOPIK 학생은 TOPIK 이 위).
  레슨-문법 짝은 기계(`tools/build-path-map.mjs`) — 사람 검토는 `docs/path-map.json` 에.
  안티 결과 들어옴(2026-10-06): 짝 401개(#230) · 문법 채우기(비교 42쌍 · 바꿔 쓰기 95개 · 연습 문장) · 번역 45편 — Claude 검토해 넣음.
  번역 고급은 모범 답 하나만(대체 답이 영어와 뜻이 멀어서) — 나머지는 「제 답도 맞아요」로.
  **첫 화면 「내 길」 카드**(운영자 2026-10-07 「길을 골랐는데 길 넷이 계속 뜬다」): 길이 정해진 학생(html[data-path])은 길 넷을 접고 카드 하나(`hmMyPathRender` — 진도 · 다음 걸음 · 이어서 · 「다른 길 보기」). 다음 걸음은 `pathNext` — 내 레벨 시작 코스(LT_LEVELS start)부터(「오늘의 계획」과 같은 레슨).
  **오늘 공부 — 한 흐름**(운영자 2026-10-07 「이 버튼 저 버튼 누르지 않게」): 「오늘 할 일」 큰 단추 = 「오늘 공부 시작」(data-td=daily) → 칸을 차례로, 한 칸 끝(tdMark)마다 아래 「다음 → 계속」(`dailyAfter`, #dailySheet), 다 끝나면 보상 「오늘의 감자들」. 켜짐은 탭 하나(sessionStorage cp-daily-on). 흐름 중에는 갈래 안내 창을 안 띄운다. 레벨테스트 끝 「▶ 오늘 공부 바로 시작」(#ltDailyGo). 옆 메뉴 = 오늘 공부 · 한국어 배우기 · TOPIK · 단어 · 더 보기(문법 · 번역 · TOPIK 연습 · 내 공부는 「더 보기」 안). 레벨이 있는 학생은 첫 화면 기능 여덟 칸을 숨긴다.
  **매일 공부 알림 메일**(운영자 2026-10-07 「트래픽 — 다시 오게」): 설정 「📧 매일 공부 알림 메일」(기본 꺼짐) · 「오늘 공부」 끝 「내일 알림 받기」 → 표 `db/add_reminders.sql`(reminder_prefs) → 함수 `supabase/functions/daily-reminder`(Resend, 그날 공부했으면 안 보냄, 「그만 받기」 링크) ← `.github/workflows/daily-reminder.yml` 매시 5분(Variables REMINDER_AUTO=on). 운영자 순서 `docs/reminders.md`. 사전 쪽 검색 제목은 「가게 (gage) meaning — "shop" in Korean | Cheesepotato」(2026-10-07).
  **TOPIK 모음 쪽(쓰기 · 읽기 · 듣기, build-pages twHub · trHub · tlHub)**(운영자 2026-10-08 「ChatGPT 로 많이 들어온다 — 어필 · 정리」): 얻는 것 넷(`hubWhy`) → 큰 단추 둘(`hubCtas` — 바로 연습 · 3분 레벨테스트) → 유형 카드마다 6~10개만, 나머지는 「모두 보기」로 접기(`chipList`) → 「함께 쓰면 좋은 것」(`hubNext`).
  **로그인 문**(운영자 2026-10-08 「다 무료로 풀면 안 되니까」): ① 기록이 남는 것(오늘 공부 · 단어 외우기 세션 · 복습 · 오답 노트 · 내 노트)은 처음 쓴 날만 그냥, 둘째 날부터 로그인(`gateRecords`, 처음 날 cp_gate_first) ② TOPIK 유형 연습(읽기 · 듣기)은 로그인 없이 하루 10문항(`gateTopikCount`, cp_gate_tq) · 모의고사는 1회차도 로그인(`gateMock`, 미리 보기는 그대로). 코스 · 문법 · 사전 · 정적 문항 쪽 · 게임은 그대로 무료 · 로그인 없이. 안내는 아래 창(#dailySheet).
  **숫자 판**(운영자 2026-10-08 「수익 — 누가 어디서 떠나는지」): 단계(visit · learn · lt_done · signup · topik · mock · pro_view · checkout · paid)를 기기 하나 · 하루 한 줄씩 `funnel_events`(`db/add_funnel.sql`, 운영자가 SQL Editor 에서) — `app.module.js` FN_STEP · fnStep(track() 안에서, 들어온 곳 src = chatgpt · google · instagram …). 판은 `/funnel.html`(funnel.js, 운영자만 — `admin_funnel()`). 순서 `docs/funnel.md`.
  인스타 @cheese_p_otato — 첫 화면 맨 아래 · `teacher.html` · Organization sameAs.
- **레벨테스트 결과 리포트**(운영자 요청 2026-10-06 「로그인해도 결과가 안 나온다 — Pro 든 아니든 결과는 리포트로」): `#learn/report`(app.module.js lrDraw) — 이 기기 결과(`cp_lt_hist`) + 계정 결과(`lt_results`), 영역별 막대 · 지난번과 견주기 · 맞는 길 · PDF. 입구: 테스트 끝 「결과 리포트로 보기」 · 옆 메뉴 「내 공부」 · 설정. 가입하러 갔다 돌아오면 리포트로 바로. 누구나 무료.
- **번역 연습 · 문법 학습지**(운영자 요청 2026-10-06): 새 섹션 `#learn/translate`(app.module.js trDraw) — 짧은 글을 한 줄씩 영어 → 한국어, 초급 · 중급 · 고급,
  답은 여러 개(띄어쓰기 · 문장부호 무시), 다르면 모범 답 + 「제 답도 맞아요」. 글 45편(초급 20 · 중급 15 · 고급 10, 안티 · Claude 검토).
  문법 쪽 「📄 학습지 PDF」(sbWsPrint) — 설명 · 예문 · 빈칸 · 바꿔 쓰기 · 직접 쓰기 · 내 메모 + 정답 쪽, 여행 학습지와 같은 틀(.ws). 지금은 무료.
- **단어 — 잘게 나눈 주제 · 단어 한 장 새 화면 · 표현 자료**(운영자 요청 2026-10-07): `vocab/taxonomy.json` 에 작은 주제 71칸 더함(모두 166, 옛 칸은 그대로 — 감정 기쁨/슬픔/화 … · 학용품 · 전자기기 · 정치 …). 낱말 1만 개에 새 칸 붙이기는 안티(`docs/antigravity-vocab-retag-task.md`, 1,000개 × 11묶음, `topics` 만 더하기).
  사자성어 · 속담 · 관용 표현 각 150 은 안티(`docs/antigravity-expressions-task.md` → `vocab/data/expressions.json`, 검사 `check-expressions`) — 화면은 「단어」 「표현」 탭(`words.js` drawExpr · drawExprOne · 퀴즈 10문제, 주소 `#words/expr` · `#words/expr/<id>`, 운영자 2026-10-07). 속담 · 관용 표현은 들어오면 `build-expressions` 만 다시.
  단어 한 장(`words.js` drawWord): 탭 뜻 · 여러 뜻(사전 뜻풀이) · 어원 · 한자(같은 한자 낱말, 자료 `j`) · 관련 말 · AI 질문(ask-korean, `wdAskAI`) + 아래 고정 「발음 연습(window.ptWith) · 다음 낱말」. 주제 화면에 작은 주제 칩 · 「둘러보기」에 주제 찾기, 주소 `#words/topic/feelings~joy`.
  반 숙제 「단어 · 주제」(ref = 주제 id) — 그 주제 세션만 센다(`db/update_cls_mark_vocab.sql`, 운영자가 SQL Editor 에서).
- **콘텐츠 늘리기**(운영자 결정 2026-10-07 — 「콘텐츠를 뽑을 때」): 안티 지시서 — TOPIK 고르게(`docs/antigravity-topik-balance-task.md`, 읽기 번호마다 10 · 듣기 6, 8묶음 — mock-more 를 대신함) · 레벨별 짧은 이야기(`docs/antigravity-stories-more-task.md`, L1~L7 레벨마다 10편, 3묶음) · 실생활 대화 장면(`docs/antigravity-convo-more-task.md`, 31 → 150, 4묶음) · 표현 450 · 주제 다시 붙이기. **들어온 것(2026-10-07)**: TOPIK 고르게 1(읽기 I 31~48 → 번호마다 10, 65문항 — 정답 자리 ④가 8/65 로 적음, 다음 묶음에 「④ 를 더」) · 2(읽기 I 49~70, 126문항, 정답 자리 31·30·30·35 — TOPIK I 읽기 400, 문항 모두 1,370) · 이야기 1(sb-12~30, L1~3 각 10편) · 2(sb-31~50, L4 · L5 각 10편, 동네 · 직장 생활 갈등 풀기) · 대화 1(34장면, 실제 은행 이름 · 요율 3곳 일반 표현으로 고침) · 사자성어 149(박빙지세 뺌 — 드문 말) · 주제 다시 붙이기 1 · 2(TOPIK I 1,931개 끝). **TOPIK 쓰기 해설 영상은 운영자가 직접 강의**(Claude 는 만들지 않는다).
- **레벨테스트 문제 종류**(운영자 요청 2026-10-07 「다 문법만 나온다」): 문제마다 종류 `t`(grammar · vocab · reply · situation · meaning · connect · read · wrong · honor · conj(접속사, 운영자 「그런데 · 근데도」), 없으면 grammar) — 계단식 출제(`ltAdaptNext`)가 바로 앞 두 문제와 다른 종류를 먼저 낸다. 문법이 아닌 문제 L1~L7 각 27 은 안티(`docs/antigravity-leveltest-variety-task.md`, 3묶음, 검사 `check-leveltest` 가 종류 수를 보여 줌). **3묶음 모두 들어옴(2026-10-08, 428문제 — L1~L7 모두 종류 아홉).** 문제 앞 질문은 줄임(운영자 (나) 2026-10-08): TOPIK 준비 / 그냥 배우기 → (TOPIK 이면 시험 날짜) → 문제 언어 → 간단 / 분석 — 목적 · 하루 몇 분 · 내 수준 어림은 뺐다(`ltSteps`).
- **화면 언어**(운영자 결정 2026-10-07): 한국어 · 영어 + **베트남어 · 일본어 먼저**(운영자 2026-10-07 — 분석상 중국 방문은 머문 시간 0초라 봇으로 보임) → 중국어 · 미얀마어 · 우즈베크어. 번역이 다 들어오기 전에는 메뉴에 안 보인다(LANGS 넷째 값 1 로 켬, 미리 보기 `?i18n=all`). 머리띠 언어 단추 = 메뉴(`app.js` LANGS · cpLangChoose). 번역 언어는 영어 화면을 바탕으로 `window.cpTr(영어)` 가 사전에서 바꾼다(없으면 영어). 학습 자료(문항 · 낱말 · 예문)는 번역하지 않는다. 번역은 안티(`docs/antigravity-i18n-vi-task.md` · `-ja-` · `-zh-`). 새 언어 = LANGS · I18N_URL · stamp ASSETS 에 한 줄씩. 글자 뽑기(`i18n-extract`)는 t() · data-en 에 더해 자료 객체의 짝 이름(ko/en · subKo/subEn · dKo/dEn)도 모은다 — 그런 글을 `isEn() ? o.en : o.ko` 로 고르는 자리는 `window.cpTr(o.en)` 으로 감싼다(2026-10-08). 베트남어 5묶음까지 들어옴, 6묶음(남은 약 290)이 오면 켠다.
- **단어 감자**(게임 `#blocks`, `word-blocks.js` — 운영자 2026-10-07 「사과 게임처럼 — 사과 말고 감자로」, 블록 쌓기를 바꿈): 감자밭(폰 4×6 · PC 6×5)에 낱말 감자(갈색) · 뜻 감자(노랑), 짝 둘만 든 네모로 묶으면 터짐(사이에 다른 감자가 끼면 안 됨) · 2분 · 판 비우면 +10초 · 틀린 짝 −3초 · 콤보 배수 · 힌트 3 · 섞기(−5초, 막히면 저절로) · 효과음 · 등급 S~C · 틀린 낱말 「단어장에 담기」(source 'blocks'). 쉬움 · 보통 · 어려움 = 감자 L1~2 · L3~5 · L6~7. 로그인 없이 된다. 「단어」 첫 화면 맨 위 큰 카드(`words.js` potHero, 운영자 「메인으로」) · 게임 줄 첫째 · 게임 화면 첫째.
- **초성 퀴즈 · 오늘의 감자들**(운영자 2026-10-07 「초성 퀴즈 좋다 · 오늘의 감자들도」): 게임 `#chosung`(`chosung.js` — 초성 보고 한국어로 쓰기, 10문제 × 20초, 힌트 뜻 → 첫 글자, 같은 초성의 우리 낱말이면 정답) · `#potdle`(`potdle.js` — 한글 워들, 두 글자 · 자모 5개(겹모음 · 겹받침은 둘로), 감자 L1~L4, 하루 한 낱말(한국 자정, 1호 = 2026-10-08, 낱말 목록이 바뀌면 그날 낱말도 바뀐다), 🥔🧀⬜ 공유 · 연습 판 · 💡 뜻 보기). 게임 화면 · 옆 메뉴 · 「단어」 게임 줄에 있다. 로그인 없이 된다.

- **블로그 주간 정리**(운영자 결정 2026-10-03): 매일 자동 글은 안 한다(검색에 「대량 자동 생성」으로 보일 수 있다). 일요일 20:07
  `.github/workflows/blog-weekly.yml` 이 `tools/blog-weekly.mjs` 로 그 주 인스타 낱말 · 문법 · TOPIK 을 묶어 **초안 PR** 을 연다.
  글 안의 `<!-- 운영자 한마디 -->` 를 운영자 말로 채운 뒤 머지(비어 있으면 check-blog 가 막는다). PR 을 열려면 저장소 설정
  「Allow GitHub Actions to create and approve pull requests」(운영자가 켠다).

- **선생님 · 1:1 수업**(운영자 결정 2026-10-03): `/teacher.html`(손으로 쓴 쪽, 스크립트 없음) — 신청은 **Preply**(큰 단추) · **WhatsApp**(문의).
  링크는 강의 화면 위 · 맨 아래 줄에. 사진은 아직 없음(로고). TOPIK 듣기 120 지시서 `docs/antigravity-topik-listening-task.md` — 소리는 **기계 목소리 먼저**(운영자 결정).
- 결제: **켜짐(2026-10-04, 운영자 「결제 켜줘」)** — Polar(2026-10-03 승인, Paddle 은 거절). 코드는 Polar 로 옮김(결제 링크 · polar-webhook · 약관 쪽). 운영자가 docs/billing-setup.md 1~5
  (함수 배포 · 웹훅 · secret · Success URL)를 마치고 「결제 켜줘」 → `ON = true`,
  FAQ · `llms.txt` 의 「가입하면 모의고사 여러 회차」 문구를 「1회차 무료 · 전 회차 Pro」로 고치고, 실제 결제로 시험.
- **요금제 나누기**(운영자 2026-10-08 「TOPIK 시험 패스와 한 달씩 꾸준히 공부하는 학생을 정확히 나누자 · 레벨테스트 뒤 자연스럽게 구독까지」): 가격 화면 카드마다 「이런 분께」, 학생 길에 맞는 카드에 「추천」(TOPIK 학생 → 시험 패스, 그 밖 → Pro — `proOpen(from, pick)` · `proPick`). 레벨테스트 끝 상자(`ltProHtml`)도 길에 맞게: TOPIK → 시험 패스(시험까지 N일), 일반 → Pro 7일 무료.
- **Pro 매력 묶음**(운영자 결정 2026-10-04): 7일 무료 체험(월 · 연) · 출시 할인 LAUNCH30(1년 30% · 선착 100) · **시험 패스 3개월 $15**(한 번 결제, 표 status 'pass') ·
  잠긴 모의고사 3문제 미리 보기 · PDF 인쇄본 3회부터 Pro · 무료 횟수 끝나면 체험 권유. 운영자 할 일은 docs/billing-setup.md 맨 아래.
- AI 쓰기 채점 한도: **무료 하루 2번 · Pro 하루 30번**(운영자 결정, 그대로 유지).
- 가격 쪽 「AI 발음 진단 · 한국어 도우미 Pro 더 많이」 — 운영자 결정 (가) 한도 올리기(2026-10-03): **무료 20 · Pro 100**.
  발음(`score-pronunciation`)은 앱 저장소 cheesepotatoapp#3 로 바꿈(운영자가 대시보드에서 배포). **도우미(`ask-korean`)는 코드가 어느 저장소에도 없어**
  → 운영자가 코드를 줘서 cheesepotatoapp#4 로 넣음(무료 20 · Pro 100, 둘 다 운영자가 배포함).
- 판매자 정보(대표자 · 통신판매업 신고번호 · 주소)는 운영자가 알려 주면 `tools/build-legal.mjs` 의 `SELLER` 에.
- 녹음: 운영자가 녹음소(`/record.html`)로 직접 녹음 → ZIP 을 구글 드라이브에 올리면 Claude 가 받아 넣는다
  (`docs/recording.md`). 녹음을 넣은 뒤 `node tools/record-list.mjs`.
- 묻고 답하기 씨앗 질문 30개: 안티 초안 → Claude 검토 끝(2026-10-02, `docs/qa-seeds.json`). **운영자가 읽고 고친 뒤**
  `node tools/build-qa-seeds-sql.mjs` → 운영자가 `db/add_qa_seeds.sql` 을 SQL Editor 에서 돌린다.
- 운영 쪽(검색에 안 걸림): 녹음소 `/record.html`, 인스타 편집기 `/insta.html`, 콘텐츠 현황 `/stats.html`, **쇼츠 공장**(2026-10-05): 촬영소 `/shorts.html`(TOPIK 읽기 · 듣기 · 쓰기(모의고사 회차 차례, `shorts-topik.js`) · 문법 소개 7장 `shorts-grammar.js` 세로 영상, 듣기는 운영자가 대본을 읽음 · 형광펜 · 펜 · 태블릿 · 표지 A 시험지 기본) → 대기열(`db/add_shorts.sql`) → 액션 `shorts-post.yml` 이 하루 한 번 릴스 · 틱톡 1개 · 유튜브 되는 만큼(비공개로 쌓기). 연결 쪽 `/connect.html`, 운영자 순서 `docs/shorts-auto.md`.
- 인스타: 하루 단어 2 · 문법 1(운영자 결정 2026-10-02) + **오늘의 TOPIK 한 문제**(13:07, 2026-10-03 · TOPIK I 읽기 창작 문항 · 「기출 아님」 표시). 낱말 다섯은 둘째 갈래 · 품사가 같은 것끼리(`insta-pick.js` related). TOPIK 은 스토리(9:16)로도, 모든 게시물은 **스레드**로도(Secrets `THREADS_TOKEN` 을 넣으면 — 순서는 `docs/insta-auto.md`). **자동 올리기** `.github/workflows/insta-post.yml` + `tools/insta-post.mjs`
  (이미지는 `insta-media` 가지, 열쇠는 운영자가 넣는 Secrets `IG_TOKEN`, 켜기는 Variables `INSTA_AUTO=on`) — 운영자 순서는 `docs/insta-auto.md`.
- TOPIK 쓰기 200문항(번호마다 50) — 2026-10-02 검토해 넣음. 회화 연습 장면 31개(2026-10-02 30개 검토해 넣음, `convo-merge.mjs --keep-accept`). 안티 그래비티에게 넘긴 일: **문법 블록 연습 문장 205개 표현 × 5**(`docs/antigravity-grammar-practice-task.md`, 브랜치 `grammar-practice`) · **레벨테스트 문제 은행 레벨마다 30 + 문법 꼬리표 g**(`docs/antigravity-leveltest-bank-task.md`, 브랜치 `leveltest-bank`) — 2026-10-05, 오면 검토. 쓰기 보강 · 실물 문서 10편 · 진짜 말 10편은 2026-09-28 #114 로 이미 들어갔다
  (안티 브랜치가 main 보다 「앞서」 보이는 것은 squash 머지 때문 — 내용은 main 에 있다). 검토할 때: 도구(`tools/`)를 고쳤는지, 자국이 낡았는지, 「운영자 확인」 note 가 남았는지 본다.
