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
  **QR · 첫 화면 숙제 · 구글 캘린더 · 학생별 진도**(운영자 요청 2026-10-07): 반 카드 「📱 QR」(`qrcode-lib.js`, MIT) — 찍고 로그인만 하면 이름 안 묻고 바로 들어옴 · 반 학생은 첫 화면 맨 위 숙제 카드(`clsHomeRender`) · 수업 일정은 반마다 구글 캘린더 iCal 비공개 주소(`db/add_class_calendar.sql`, 선생님만 봄) → 함수 `class-schedule` 이 다음 수업들만 학생에게 · 진도 리포트에 학생별 카드(`clsStuHtml`). 운영자 순서 `docs/class-calendar.md`.

- **강의 영상**(운영자 결정 2026-10-03): 유튜브 「일부 공개」 + 사이트 `#learn/lectures`(`app.module.js` lecDraw, 표 `db/add_lectures.sql`).
  운영자만 「강의 올리기」(유튜브 링크 + 제목). 플레이어는 youtube-nocookie(CSP frame-src · img-src i.ytimg.com). 운영자 순서 `docs/lectures.md`.

- **학습 길 · 목적별 메뉴**(운영자 결정 2026-10-06): 「섹션이 너무 많아 독이 된다 — 한 흐름으로」. 첫 화면 = 길 넷(기초 · 중급 · 고급 · TOPIK),
  나머지는 「더 보기」로 접음. 길 하나 = 걸음 줄(코스 레슨 차례 — 기초 L0~L5 · 중급 L6 · 고급 L7, `MY_LEVEL_COURSES`), 한 걸음 = **문법 → 코스 레슨 → 단어**
  (`app.module.js` pathDraw, 주소 `#learn/path/<길>/<레슨>`). 레슨이 끝나면 「다음 걸음 →」. 옆 메뉴는 🥔 한국어 배우기 · 🧀 TOPIK 준비 · 내 공부 · 더 보기(TOPIK 학생은 TOPIK 이 위).
  레슨-문법 짝은 기계(`tools/build-path-map.mjs`) — 사람 검토는 `docs/path-map.json` 에.
  안티 결과 들어옴(2026-10-06): 짝 401개(#230) · 문법 채우기(비교 42쌍 · 바꿔 쓰기 95개 · 연습 문장) · 번역 45편 — Claude 검토해 넣음.
  번역 고급은 모범 답 하나만(대체 답이 영어와 뜻이 멀어서) — 나머지는 「제 답도 맞아요」로.
  인스타 @cheese_p_otato — 첫 화면 맨 아래 · `teacher.html` · Organization sameAs.
- **레벨테스트 결과 리포트**(운영자 요청 2026-10-06 「로그인해도 결과가 안 나온다 — Pro 든 아니든 결과는 리포트로」): `#learn/report`(app.module.js lrDraw) — 이 기기 결과(`cp_lt_hist`) + 계정 결과(`lt_results`), 영역별 막대 · 지난번과 견주기 · 맞는 길 · PDF. 입구: 테스트 끝 「결과 리포트로 보기」 · 옆 메뉴 「내 공부」 · 설정. 가입하러 갔다 돌아오면 리포트로 바로. 누구나 무료.
- **번역 연습 · 문법 학습지**(운영자 요청 2026-10-06): 새 섹션 `#learn/translate`(app.module.js trDraw) — 짧은 글을 한 줄씩 영어 → 한국어, 초급 · 중급 · 고급,
  답은 여러 개(띄어쓰기 · 문장부호 무시), 다르면 모범 답 + 「제 답도 맞아요」. 글 45편(초급 20 · 중급 15 · 고급 10, 안티 · Claude 검토).
  문법 쪽 「📄 학습지 PDF」(sbWsPrint) — 설명 · 예문 · 빈칸 · 바꿔 쓰기 · 직접 쓰기 · 내 메모 + 정답 쪽, 여행 학습지와 같은 틀(.ws). 지금은 무료.
- **단어 블록 쌓기**(운영자 요청 2026-10-06 「단어를 외우기 위해 최적화된 게임」): 게임 `#blocks`(`word-blocks.js`, 열 때만 받음) — 낱말 블록이 떨어지고 뜻 셋 중 고르기, 틀리면 쌓이고 블록 3개 뒤 다시(한 번 걸러 한 번), 다시 맞히면 쌓인 것도 사라짐. 쉬움 · 보통 · 어려움 = 감자 L1~2 · L3~5 · L6~7. 끝나면 틀린 낱말 「단어장에 담기」(source 'blocks'). 로그인 없이 된다.

- **블로그 주간 정리**(운영자 결정 2026-10-03): 매일 자동 글은 안 한다(검색에 「대량 자동 생성」으로 보일 수 있다). 일요일 20:07
  `.github/workflows/blog-weekly.yml` 이 `tools/blog-weekly.mjs` 로 그 주 인스타 낱말 · 문법 · TOPIK 을 묶어 **초안 PR** 을 연다.
  글 안의 `<!-- 운영자 한마디 -->` 를 운영자 말로 채운 뒤 머지(비어 있으면 check-blog 가 막는다). PR 을 열려면 저장소 설정
  「Allow GitHub Actions to create and approve pull requests」(운영자가 켠다).

- **선생님 · 1:1 수업**(운영자 결정 2026-10-03): `/teacher.html`(손으로 쓴 쪽, 스크립트 없음) — 신청은 **Preply**(큰 단추) · **WhatsApp**(문의).
  링크는 강의 화면 위 · 맨 아래 줄에. 사진은 아직 없음(로고). TOPIK 듣기 120 지시서 `docs/antigravity-topik-listening-task.md` — 소리는 **기계 목소리 먼저**(운영자 결정).
- 결제: **켜짐(2026-10-04, 운영자 「결제 켜줘」)** — Polar(2026-10-03 승인, Paddle 은 거절). 코드는 Polar 로 옮김(결제 링크 · polar-webhook · 약관 쪽). 운영자가 docs/billing-setup.md 1~5
  (함수 배포 · 웹훅 · secret · Success URL)를 마치고 「결제 켜줘」 → `ON = true`,
  FAQ · `llms.txt` 의 「가입하면 모의고사 여러 회차」 문구를 「1회차 무료 · 전 회차 Pro」로 고치고, 실제 결제로 시험.
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
