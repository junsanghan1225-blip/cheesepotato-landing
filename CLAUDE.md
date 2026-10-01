# CLAUDE.md — 치즈감자(everykoreans.com) 작업 약속

이 저장소에서 일하는 Claude 가 **맨 먼저 읽는 파일**이다. 여기 적힌 것은 운영자와 이미 정한 약속이다.
모르는 것이 생기면 짐작하지 말고 물어본다.

## 1. 무엇인가

- **everykoreans.com** — 한국어 학습 사이트(치즈감자). 운영자: 에브리코리안즈(개인사업자).
- **빌드 없는 정적 사이트.** `main` 에 머지하면 1~2분 뒤 GitHub Pages 가 올린다.
- 화면의 중심: `index.html`(마크업 · CSP) · `app.js`(메뉴 · 첫 화면) · `app.module.js`(거의 모든 화면) ·
  `app-views.css`. 자료는 `*.js`(courses · sentences · topik · eps · glossary …).
- 서버: **Supabase**(프로젝트 ref `tjgoevtvobvmlyefgxel`) — 로그인 · 표 · Edge Functions(`supabase/functions/`).
  결제: **Paddle**(`billing.js`, 웹훅 `supabase/functions/paddle-webhook`). AI 쓰기 채점: `grade-writing`(Gemini).
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

- **결제 켜기** — `billing.js` 의 `ENV` 를 `'production'` 으로 바꾸는 것. 바꾸는 순간 실제 결제가 열리고
  TOPIK 모의고사 2회차부터 잠긴다. (지금: `'sandbox'`, Paddle 도메인 승인 대기 중)
- **비밀 값을 묻거나 적는 것** — Paddle API key, 웹훅 secret(`pdl_ntfset_…`), Supabase service key,
  Gemini key. 이것들은 운영자가 Supabase Secrets 에 직접 넣는다. 채팅 · 코드 · 커밋 어디에도 적지 않는다.
  (브라우저용 공개 값 — Paddle client token `live_…`, 가격 id `pri_…`, Supabase anon key — 은 괜찮다.)
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
  | `db/add_qa_seeds.sql`(묻고 답하기 씨앗 질문) | `docs/qa-seeds.json` → `node tools/build-qa-seeds-sql.mjs` |
  | `grammar-words.js`(문법 「같이 알면 좋은 단어」) | `docs/grammar-words.json`(안티 그래비티 · Claude 검토) → `node tools/build-grammar-words.mjs` |
  | `grammar-usage.js`(문법 「쓰임 보기」) | 우리 자료(TOPIK · 읽기 · 낱말 예문) · `grammar-mark.js` → `node tools/build-grammar-usage.mjs` |
  | `grammar-drill.js`(문법 「바꾸기」 문항) | 문법 이름(`sentences*.js`) · `tools/ko-conj.mjs` attach → `node tools/build-grammar-drill.mjs` |
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
  자료를 고치면 `node tools/build-vocab.mjs && node tools/build-pages.mjs`. 활용 · 로마자는 `tools/ko-conj.mjs`(정답표 `check-conj`). 외우기 기록은 `settings.vocab`, 담은 낱말은 `words`(+ `vocab_id` · `source`).
  이 계획에 없는 것은 하지 않고 「다음에」 칸에 적는다. 녹음 파일을 옮길 곳은 `docs/storage-guide.md`
  (추천: 지금 Supabase Storage → 전송량이 늘면 Cloudflare R2, AWS 는 안 씀).

- **일반 / TOPIK 두 길 · 감자 / 치즈 레벨**(운영자 결정 2026-09-29): 레벨테스트 목표가 「TOPIK 준비」면 TOPIK 학생(치즈 0~6급,
  첫 화면 · 머리띠가 TOPIK 먼저, 단어는 TOPIK I/II 필수), 그 밖 · 테스트 전은 일반(감자 L0~L7, 코스 먼저, 단어는 일반 한국어).
  아이콘은 `levels.js`(`myLevelBadge`), 나누기는 `app.module.js` `siteTrack` · `applyTrack`. **EPS 는 따로 선 갈래**(첫 화면 · 옆 메뉴 「한국 취업」,
  나중에 따로 묶어 판다 — 지금은 무료). 숨기는 메뉴는 없고 차례만 바꾼다.

- **잊지 말 것 — 학생 개별 섹션 · 숙제**(운영자, 2026-09-29): 학생마다 숙제 · 할당량을 주고 받아 관리(단어 세션 · TOPIK · 코스 · 문법 ·
  쓰기 모두). **「단어」 섹션을 다 만든 뒤에** 운영자에게 먼저 꺼내고, 누가 내는지(운영자 · 선생님 반 · 학생 스스로)부터 정한다.
  (`docs/vocab-plan.md` 「다음에」)

- 결제: 준비 끝, **Paddle 도메인 승인 대기**. 승인되면 운영자가 「승인됐어」라고 한다 → `ENV` 전환,
  FAQ · `llms.txt` 의 「가입하면 모의고사 여러 회차」 문구를 「1회차 무료 · 전 회차 Pro」로 고치고, 실제 결제로 시험.
- AI 쓰기 채점 한도: **무료 하루 2번 · Pro 하루 30번**(운영자 결정, 그대로 유지).
- **결정 대기:** 가격 쪽의 「AI 발음 진단 · 한국어 도우미 Pro 더 많이」 — 그 기능은 **앱 저장소**에 있고 아직
  Pro 를 가르지 않는다. (가) 앱 저장소에서 한도를 올리거나 (나) 그 줄을 뺀다. 결제 켜기 전에 꼭 정한다.
- 판매자 정보(대표자 · 통신판매업 신고번호 · 주소)는 운영자가 알려 주면 `tools/build-legal.mjs` 의 `SELLER` 에.
- 녹음: 운영자가 녹음소(`/record.html`)로 직접 녹음 → ZIP 을 구글 드라이브에 올리면 Claude 가 받아 넣는다
  (`docs/recording.md`). 녹음을 넣은 뒤 `node tools/record-list.mjs`.
- 묻고 답하기 씨앗 질문 30개: 안티 초안 → Claude 검토 끝(2026-10-02, `docs/qa-seeds.json`). **운영자가 읽고 고친 뒤**
  `node tools/build-qa-seeds-sql.mjs` → 운영자가 `db/add_qa_seeds.sql` 을 SQL Editor 에서 돌린다.
- 운영 쪽(검색에 안 걸림): 녹음소 `/record.html`, 인스타 편집기 `/insta.html`, 콘텐츠 현황 `/stats.html`.
- TOPIK 쓰기 200문항(번호마다 50) — 2026-10-02 검토해 넣음. 안티 그래비티에게 넘긴 일(올라오면 검토): **회화 연습 장면 30개**(`docs/antigravity-convo-task.md`, 브랜치 `convo-scenes` → `docs/convo-scenes.json`).
  넣을 때 `tools/convo-merge.mjs` 는 accept 를 비우므로, 검토한 accept 를 살려 넣는다(그 도구에 그대로 두는 길을 더하거나 손으로 붙인다). 쓰기 보강 · 실물 문서 10편 · 진짜 말 10편은 2026-09-28 #114 로 이미 들어갔다
  (안티 브랜치가 main 보다 「앞서」 보이는 것은 squash 머지 때문 — 내용은 main 에 있다). 검토할 때: 도구(`tools/`)를 고쳤는지, 자국이 낡았는지, 「운영자 확인」 note 가 남았는지 본다.
