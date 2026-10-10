# 지금 상태 — 갈래별 기록

> CLAUDE.md 에 있던 「5. 지금 상태」를 그대로 옮겼다(2026-10-10, 운영자 「작업 구조 향상」). 일을 시작하기 전에 그 갈래 줄을 여기서 찾아 읽는다.
> 새 결정은 **`docs/decisions.md` 에 한 줄** + 여기 그 갈래 줄을 고친다. 할 일은 `docs/todo.md`, 안티 진행은 `docs/antigravity/STATUS.md`.
> 갈래마다 `## 번호. 이름` — 찾을 때는 그 제목으로 grep 한다(예: `grep -n "^## .*반" docs/status.md`).

**차례** — 1. PRD · 2. 로드맵 · 3. 진행 중인 큰 일: 「단어」 섹션 · 4. 레벨 계획 · 5. 일반 / TOPIK 두 길 · 감자 / 치즈 레벨 · 6. 반 · 숙제 · 7. 강의 영상 · 8. 학습 길 · 목적별 메뉴 · 9. 레벨테스트 결과 리포트 · 10. 번역 연습 · 문법 학습지 · 11. 단어 — 잘게 나눈 주제 · 단어 한 장 새 화면 · 표현 자료 · 12. 콘텐츠 늘리기 · 13. 레벨테스트 문제 종류 · 14. 화면 언어 · 15. 단어 감자 · 16. 초성 퀴즈 · 오늘의 감자들 · 17. 블로그 주간 정리 · 18. 선생님 · 1:1 수업 · 19. 요금제 나누기 · 20. Pro 매력 묶음 · 21. AI 한도 · 운영 쪽 · 인스타 · 그 밖 · 22. 앱 · 검색 엔진 · 측정 · 23. TOPIK 예상 급수 · 24. 무료 도구 · 소개 · 믿음 한 줄 · 25. 키우기 판돈

## 1. PRD
- **PRD**(2026-10-10 초안): `docs/prd.md` — 무엇을 · 누구에게 · 왜, 범위 · 요금제 · 핵심 흐름 · 하지 않는 것. ⚠ 는 운영자가 정할 것.

## 2. 로드맵
- **로드맵**(운영자와 탑다운으로 합의 2026-10-09): `docs/roadmap.md` — 현황 · 90일 목표 · 네 갈래(유입 · 전환 · 머무름 · 기관) · 2주 할 일 · 매주 숫자 넷 · 앱 현황. **새 일을 시작하기 전에 먼저 읽는다.**


## 3. 진행 중인 큰 일: 「단어」 섹션
- **진행 중인 큰 일: 「단어」 섹션** — 계획은 `docs/plans/vocab-plan.md`(1~7층, 운영자와 합의). TOPIK I 자료 1,930개(B급) 끝,
  **2단계(화면 `#words` · `words.js` · 내 단어장 연동) 끝, 3단계(낱말 쪽 보강 · `/topik1-words/`) · 4단계(받아쓰기 · 짝 맞추기 · 시험 · `/korean-word-for/`) 끝** — 지금 **5단계(자료 확장)**: TOPIK II 씨앗 8,183개(`vocab/data/topik2.json`, `tools/vocab-seed-topik2.mjs`),
  안 그래비티가 500개씩 채운다(`docs/antigravity/antigravity-vocab-topik2-task.md`) — 들어오면 검토. **17묶음까지 모두 끝(8,183개 전부 B급, 2026-10-01)**(올라오면 커밋이 있는지 먼저 본다).

## 4. 레벨 계획
- **레벨 계획**(`docs/plans/level-plan.md`): 1 ~ 5층 합의 끝, 6 · 7층 초안 — 레벨업 화면은 운영자 스케치를 받아 만든다.
  화면 구성(배치)은 운영자가 직접 보고 방향을 준다 — 그 전에는 배치를 크게 바꾸지 않는다.
  자료를 고치면 `node tools/vocab-level.mjs && node tools/build-vocab.mjs && node tools/build-pages.mjs`(낱말마다 우리 레벨 `lv` 감자 L1~L7 — 2026-10-05 운영자 요청, 기준은 도구 맨 위). 활용 · 로마자는 `tools/ko-conj.mjs`(정답표 `check-conj`). 외우기 기록은 `settings.vocab`, 담은 낱말은 `words`(+ `vocab_id` · `source`).
  이 계획에 없는 것은 하지 않고 「다음에」 칸에 적는다. 녹음 파일을 옮길 곳은 `docs/ops/storage-guide.md`
  (추천: 지금 Supabase Storage → 전송량이 늘면 Cloudflare R2, AWS 는 안 씀).


## 5. 일반 / TOPIK 두 길 · 감자 / 치즈 레벨
- **일반 / TOPIK 두 길 · 감자 / 치즈 레벨**(운영자 결정 2026-09-29): 레벨테스트 목표가 「TOPIK 준비」면 TOPIK 학생(치즈 0~6급,
  첫 화면 · 머리띠가 TOPIK 먼저, 단어는 TOPIK I/II 필수), 그 밖 · 테스트 전은 일반(감자 L0~L7, 코스 먼저, 단어는 일반 한국어).
  아이콘은 `levels.js`(`myLevelBadge`), 나누기는 `app.module.js` `siteTrack` · `applyTrack`. **EPS 는 따로 선 갈래**(첫 화면 · 옆 메뉴 「한국 취업」,
  나중에 따로 묶어 판다 — 지금은 무료). 숨기는 메뉴는 없고 차례만 바꾼다.


## 6. 반 · 숙제
- **반 · 숙제**(운영자 결정 2026-10-02): 반은 **운영자만** 만든다 · 학생은 **반 링크(`#learn/class/join/코드`) · 코드**로 들어온다 ·
  첫 판 숙제는 **코스 레슨 · 단어 세션(횟수) · 문법 바꿔 쓰기**. 화면 `#learn/class`(`app.module.js` clsDraw), 표 `db/add_classes.sql`
  (운영자가 SQL Editor 에서 돌린다). 「했음」은 finishLesson · words.js 세션 끝 · 바꿔 쓰기 끝에서 `clsMark` → 서버 `cls_mark`.
  다음에(운영자와 정할 것): TOPIK 쓰기 · 읽기 숙제, 다른 선생님에게 열기(`cls_is_admin` 하나), 첫 화면에 「숙제 N개」.
  **선생님 계정 · 진도 리포트**(운영자 결정 2026-10-06 — 기관 · 대학 파트너십 준비): 운영자가 반 화면 「선생님 계정」에 메일을 올리면 그 사람도 반을 만든다(`db/add_class_teachers.sql`, cls_is_admin = 운영자 + class_teachers). 반마다 「📊 진도 리포트」(학생 × 숙제 표, CSV 받기).
  **반 학생은 Pro 무료**(운영자 결정 2026-10-06): 보관하지 않은 반의 학생이면 Pro — 서버 `is_pro()`(`db/add_class_pro.sql`, 운영자가 SQL Editor 에서) · 화면 `billing.js` isPro(classPro). 반을 나가거나 보관하면 다시 무료.
  **QR · 첫 화면 숙제 · 학생별 진도**(운영자 요청 2026-10-07): 반 카드 「📱 QR」(`qrcode-lib.js`, MIT) — 찍고 로그인만 하면 이름 안 묻고 바로 들어옴 · 반 학생은 첫 화면 맨 위 숙제 카드(`clsHomeRender`) · 진도 리포트에 학생별 카드(`clsStuHtml`) · 「반에서 빼기」 · 개인정보 안내 한 줄(`clsPrivacy`). **반은 숙제 · 복습용으로만 — 수업 · 결제를 사이트로 데려오지 않는다**(Preply 규정, 운영자 결정). 반 학생에게는 선생님 쪽(teacher.html · WhatsApp) 링크를 숨긴다(`clsBodyMark`, body.cls-in). 구글 캘린더 일정은 만들었다가 뺐다(표는 남김, `db/add_class_calendar.sql` 머리글). 운영자 순서 `docs/ops/class-homework.md`.
  **학생 관리 · 레벨 배정 · 학생별 숙제**(운영자 요청 2026-10-07 「레벨은 선생님이 지정 — 레벨테스트 없이 바로」 · 「학생이 느껴도 전문적」): 표 `db/add_class_students.sql`(class_student 레벨 · 한마디 / class_student_note 선생님 메모 / class_hw_target 학생별 숙제). 선생님 「학생 관리」 탭에서 저장 → 학생 기기의 cp_level 이 그 레벨로(`clsApplyLevel`, by:'teacher'). 학생 「내 반」 패널 `clsStudentPanel`(첫 화면 · 반 화면 같이). QR 은 카드 틀 없이 QR 만. 학생 패널은 XP · 별 없이(운영자 「XP 는 빼고 — 해야 한다는 느낌만」) 「오늘 할 일」 카드(.td-*)와 같은 틀(「UI 통일」): 지금 할 숙제(치즈 큰 단추, 늦으면 빨강) · 진행 막대 · 체크 줄.
  **선생님 편의**(운영자 2026-10-07 「다른 플랫폼처럼」 — 넷 다): 「오늘 챙길 학생」(`clsCareHtml` 기한 지남 · 3일 기록 없음 · 막 끝낸 것) · 숙제 묶음(목록에 담기) · 「다시 내기」 · 매주 반복(N주 치 한 번에) · 숙제 코멘트(`db/add_class_feedback.sql`, 학생 끝낸 숙제에 💬) · 학생 리포트 PDF(`clsStuPrint`). 반 이름 바꾸기. 숙제 고르기는 검색 한 칸(`clsCatalog` · `clsPickResults` — 레슨 · 문법 · TOPIK 쓰기 · 읽기 · 단어, 종류 칩 · 최근 숙제 · Enter 로 맨 위 고르기 · 단어 횟수 −/+).


## 7. 강의 영상
- **강의 영상**(운영자 결정 2026-10-03): 유튜브 「일부 공개」 + 사이트 `#learn/lectures`(`app.module.js` lecDraw, 표 `db/add_lectures.sql`).
  운영자만 「강의 올리기」(유튜브 링크 + 제목). 플레이어는 youtube-nocookie(CSP frame-src · img-src i.ytimg.com). 운영자 순서 `docs/ops/lectures.md`.


## 8. 학습 길 · 목적별 메뉴
- **학습 길 · 목적별 메뉴**(운영자 결정 2026-10-06): 「섹션이 너무 많아 독이 된다 — 한 흐름으로」. 첫 화면 = 길 넷(기초 · 중급 · 고급 · TOPIK),
  나머지는 「더 보기」로 접음. 길 하나 = 걸음 줄(코스 레슨 차례 — 기초 L0~L5 · 중급 L6 · 고급 L7, `MY_LEVEL_COURSES`), 한 걸음 = **문법 → 코스 레슨 → 단어**
  (`app.module.js` pathDraw, 주소 `#learn/path/<길>/<레슨>`). 레슨이 끝나면 「다음 걸음 →」. 옆 메뉴는 🥔 한국어 배우기 · 🧀 TOPIK 준비 · 내 공부 · 더 보기(TOPIK 학생은 TOPIK 이 위).
  레슨-문법 짝은 기계(`tools/build-path-map.mjs`) — 사람 검토는 `docs/path-map.json` 에.
  안티 결과 들어옴(2026-10-06): 짝 401개(#230) · 문법 채우기(비교 42쌍 · 바꿔 쓰기 95개 · 연습 문장) · 번역 45편 — Claude 검토해 넣음.
  번역 고급은 모범 답 하나만(대체 답이 영어와 뜻이 멀어서) — 나머지는 「제 답도 맞아요」로.
  **첫 화면 위쪽 「맞는 순서로」**(운영자 2026-10-08 「톡투미인코리안처럼」): 처음 온 사람에게 한 문장 + 큰 단추 하나(heroLevelTestBtn 「내 레벨 찾고 시작하기」) + 「길 둘러보기」 + 오른쪽 길 카드 넷(.hs-card, data-go = 길 넷). 오늘의 추천 카드는 뺐다(TOPIK 1문제 · 번역 배너는 아래 그대로).
  **길 카드**(운영자 2026-10-08 「부트캠프 카드처럼 · 우리 색으로」): 레벨 딱지(감자 L0~L5 · L6 · L7 · 치즈 1~6급) · STEP · 이런 분께 · 기간(레슨 분을 더해 하루 15분으로 어림) · 진도 — `pathCardsHtml`(PATH_META), 첫 화면은 `hmPathCards` 가 정적인 문을 바꿔 그린다. 색은 크림 → 복숭아 → 주황 → 치즈(히어로 카드와 같음).
  **첫 화면 「내 길」 카드**(운영자 2026-10-07 「길을 골랐는데 길 넷이 계속 뜬다」): 길이 정해진 학생(html[data-path])은 길 넷을 접고 카드 하나(`hmMyPathRender` — 진도 · 다음 걸음 · 이어서 · 「다른 길 보기」). 다음 걸음은 `pathNext` — 내 레벨 시작 코스(LT_LEVELS start)부터(「오늘의 계획」과 같은 레슨).
  **오늘 공부 — 한 흐름**(운영자 2026-10-07 「이 버튼 저 버튼 누르지 않게」): 「오늘 할 일」 큰 단추 = 「오늘 공부 시작」(data-td=daily) → 칸을 차례로, 한 칸 끝(tdMark)마다 아래 「다음 → 계속」(`dailyAfter`, #dailySheet), 다 끝나면 보상 「오늘의 감자들」. 켜짐은 탭 하나(sessionStorage cp-daily-on). 흐름 중에는 갈래 안내 창을 안 띄운다. 레벨테스트 끝 「▶ 오늘 공부 바로 시작」(#ltDailyGo). 옆 메뉴 = 오늘 공부 · 한국어 배우기 · TOPIK · 단어 · 더 보기(문법 · 번역 · TOPIK 연습 · 내 공부는 「더 보기」 안). 레벨이 있는 학생은 첫 화면 기능 여덟 칸을 숨긴다.
  **매일 공부 알림 메일**(운영자 2026-10-07 「트래픽 — 다시 오게」): 설정 「📧 매일 공부 알림 메일」(기본 꺼짐) · 「오늘 공부」 끝 「내일 알림 받기」 → 표 `db/add_reminders.sql`(reminder_prefs) → 함수 `supabase/functions/daily-reminder`(Resend, 그날 공부했으면 안 보냄, 「그만 받기」 링크) ← `.github/workflows/daily-reminder.yml` 매시 5분(Variables REMINDER_AUTO=on). 운영자 순서 `docs/ops/reminders.md`. 사전 쪽 검색 제목은 「가게 (gage) meaning — "shop" in Korean | Cheesepotato」(2026-10-07).
  **TOPIK 모음 쪽(쓰기 · 읽기 · 듣기, build-pages twHub · trHub · tlHub)**(운영자 2026-10-08 「ChatGPT 로 많이 들어온다 — 어필 · 정리」): 얻는 것 넷(`hubWhy`) → 큰 단추 둘(`hubCtas` — 바로 연습 · 3분 레벨테스트) → 유형 카드마다 6~10개만, 나머지는 「모두 보기」로 접기(`chipList`) → 「함께 쓰면 좋은 것」(`hubNext`).
  **로그인 문**(운영자 2026-10-08 「다 무료로 풀면 안 되니까」): ① 기록이 남는 것(오늘 공부 · 단어 외우기 세션 · 복습 · 오답 노트 · 내 노트)은 처음 쓴 날만 그냥, 둘째 날부터 로그인(`gateRecords`, 처음 날 cp_gate_first) ② TOPIK 유형 연습(읽기 · 듣기)은 로그인 없이 하루 10문항(`gateTopikCount`, cp_gate_tq) · 모의고사는 1회차도 로그인(`gateMock`, 미리 보기는 그대로). 코스 · 문법 · 사전 · 정적 문항 쪽 · 게임은 그대로 무료 · 로그인 없이. 안내는 아래 창(#dailySheet).
  **숫자 판**(운영자 2026-10-08 「수익 — 누가 어디서 떠나는지」): 단계(visit · learn · lt_done · signup · topik · mock · pro_view · checkout · paid)를 기기 하나 · 하루 한 줄씩 `funnel_events`(`db/add_funnel.sql`, 운영자가 SQL Editor 에서) — `app.module.js` FN_STEP · fnStep(track() 안에서, 들어온 곳 src = chatgpt · google · instagram …). 판은 `/funnel.html`(funnel.js, 운영자만 — `admin_funnel()`). 순서 `docs/ops/funnel.md`.
  인스타 @cheese_p_otato — 첫 화면 맨 아래 · `teacher.html` · Organization sameAs.

## 9. 레벨테스트 결과 리포트
- **레벨테스트 결과 리포트**(운영자 요청 2026-10-06 「로그인해도 결과가 안 나온다 — Pro 든 아니든 결과는 리포트로」): `#learn/report`(app.module.js lrDraw) — 이 기기 결과(`cp_lt_hist`) + 계정 결과(`lt_results`), 영역별 막대 · 지난번과 견주기 · 맞는 길 · PDF. 입구: 테스트 끝 「결과 리포트로 보기」 · 옆 메뉴 「내 공부」 · 설정. 가입하러 갔다 돌아오면 리포트로 바로. 누구나 무료.

## 10. 번역 연습 · 문법 학습지
- **번역 연습 · 문법 학습지**(운영자 요청 2026-10-06): 새 섹션 `#learn/translate`(app.module.js trDraw) — 짧은 글을 한 줄씩 영어 → 한국어, 초급 · 중급 · 고급,
  답은 여러 개(띄어쓰기 · 문장부호 무시), 다르면 모범 답 + 「제 답도 맞아요」. 글 45편(초급 20 · 중급 15 · 고급 10, 안티 · Claude 검토).
  문법 쪽 「📄 학습지 PDF」(sbWsPrint) — 설명 · 예문 · 빈칸 · 바꿔 쓰기 · 직접 쓰기 · 내 메모 + 정답 쪽, 여행 학습지와 같은 틀(.ws). 지금은 무료.

## 11. 단어 — 잘게 나눈 주제 · 단어 한 장 새 화면 · 표현 자료
- **단어 — 잘게 나눈 주제 · 단어 한 장 새 화면 · 표현 자료**(운영자 요청 2026-10-07): `vocab/taxonomy.json` 에 작은 주제 71칸 더함(모두 166, 옛 칸은 그대로 — 감정 기쁨/슬픔/화 … · 학용품 · 전자기기 · 정치 …). 낱말 1만 개에 새 칸 붙이기는 안티(`docs/antigravity/antigravity-vocab-retag-task.md`, 1,000개 × 11묶음, `topics` 만 더하기).
  사자성어 · 속담 · 관용 표현 각 150 은 안티(`docs/antigravity/antigravity-expressions-task.md` → `vocab/data/expressions.json`, 검사 `check-expressions`) — 화면은 「단어」 「표현」 탭(`words.js` drawExpr · drawExprOne · 퀴즈 10문제, 주소 `#words/expr` · `#words/expr/<id>`, 운영자 2026-10-07). 속담 · 관용 표현은 들어오면 `build-expressions` 만 다시.
  단어 한 장(`words.js` drawWord): 탭 뜻 · 여러 뜻(사전 뜻풀이) · 어원 · 한자(같은 한자 낱말, 자료 `j`) · 관련 말 · AI 질문(ask-korean, `wdAskAI`) + 아래 고정 「발음 연습(window.ptWith) · 다음 낱말」. 주제 화면에 작은 주제 칩 · 「둘러보기」에 주제 찾기, 주소 `#words/topic/feelings~joy`.
  반 숙제 「단어 · 주제」(ref = 주제 id) — 그 주제 세션만 센다(`db/update_cls_mark_vocab.sql`, 운영자가 SQL Editor 에서).

## 12. 콘텐츠 늘리기
- **콘텐츠 늘리기**(운영자 결정 2026-10-07 — 「콘텐츠를 뽑을 때」): 안티 지시서 — TOPIK 고르게(`docs/antigravity/antigravity-topik-balance-task.md`, 읽기 번호마다 10 · 듣기 6, 8묶음 — mock-more 를 대신함) · 레벨별 짧은 이야기(`docs/antigravity/antigravity-stories-more-task.md`, L1~L7 레벨마다 10편, 3묶음) · 실생활 대화 장면(`docs/antigravity/antigravity-convo-more-task.md`, 31 → 150, 4묶음) · 표현 450 · 주제 다시 붙이기. **들어온 것(2026-10-07)**: TOPIK 고르게 1(읽기 I 31~48 → 번호마다 10, 65문항 — 정답 자리 ④가 8/65 로 적음, 다음 묶음에 「④ 를 더」) · 2(읽기 I 49~70, 126문항, 정답 자리 31·30·30·35 — TOPIK I 읽기 400, 문항 모두 1,370) · 이야기 1(sb-12~30, L1~3 각 10편) · 2(sb-31~50, L4 · L5 각 10편, 동네 · 직장 생활 갈등 풀기) · 대화 1(34장면, 실제 은행 이름 · 요율 3곳 일반 표현으로 고침) · 사자성어 149(박빙지세 뺌 — 드문 말) · 주제 다시 붙이기 1 · 2(TOPIK I 1,931개 끝). **TOPIK 쓰기 해설 영상은 운영자가 직접 강의**(Claude 는 만들지 않는다).

## 13. 레벨테스트 문제 종류
- **레벨테스트 문제 종류**(운영자 요청 2026-10-07 「다 문법만 나온다」): 문제마다 종류 `t`(grammar · vocab · reply · situation · meaning · connect · read · wrong · honor · conj(접속사, 운영자 「그런데 · 근데도」), 없으면 grammar) — 계단식 출제(`ltAdaptNext`)가 바로 앞 두 문제와 다른 종류를 먼저 낸다. 문법이 아닌 문제 L1~L7 각 27 은 안티(`docs/antigravity/antigravity-leveltest-variety-task.md`, 3묶음, 검사 `check-leveltest` 가 종류 수를 보여 줌). **3묶음 모두 들어옴(2026-10-08, 428문제 — L1~L7 모두 종류 아홉).** 문제 앞 질문은 줄임(운영자 (나) 2026-10-08): TOPIK 준비 / 그냥 배우기 → (TOPIK 이면 시험 날짜) → 문제 언어 → 간단 / 분석 — 목적 · 하루 몇 분 · 내 수준 어림은 뺐다(`ltSteps`).

## 14. 화면 언어
- **화면 언어**(운영자 결정 2026-10-07): 한국어 · 영어 + **베트남어 · 일본어 먼저**(운영자 2026-10-07 — 분석상 중국 방문은 머문 시간 0초라 봇으로 보임) → 중국어 · 미얀마어 · 우즈베크어. 번역이 다 들어오기 전에는 메뉴에 안 보인다(LANGS 넷째 값 1 로 켬, 미리 보기 `?i18n=all`). 머리띠 언어 단추 = 메뉴(`app.js` LANGS · cpLangChoose). 번역 언어는 영어 화면을 바탕으로 `window.cpTr(영어)` 가 사전에서 바꾼다(없으면 영어). 학습 자료(문항 · 낱말 · 예문)는 번역하지 않는다. 번역은 안티(`docs/antigravity/antigravity-i18n-vi-task.md` · `-ja-` · `-zh-`). 새 언어 = LANGS · I18N_URL · stamp ASSETS 에 한 줄씩. 글자 뽑기(`i18n-extract`)는 t() · data-en 에 더해 자료 객체의 짝 이름(ko/en · subKo/subEn · dKo/dEn)도 모은다 — 그런 글을 `isEn() ? o.en : o.ko` 로 고르는 자리는 `window.cpTr(o.en)` 으로 감싼다(2026-10-08). 베트남어 6묶음 · 일본어 6묶음까지 들어옴(2026-10-08) — 그 뒤 글자 뽑기가 목록 짝(ko: [..], en: [..] — 안내 단계)까지 읽게 되어 남은 55줄은 안티 푸시가 두 번 안 와서 Claude 가 직접 번역(운영자 (나) 2026-10-09) — **베트남어 · 일본어 켬(2026-10-09, 둘 다 2,455/2,455)**. 앞으로 새 화면 글은 몇 줄이면 Claude 가 바로, 많으면 안티. **검색용 언어별 쪽**(운영자 2026-10-09 「글로벌하게 검색에 뜨려면」): `/vi/` · `/ja/` 정적 쪽(build-pages `localeHome` — 글은 번역 사전에서 영어 열쇠로, 없으면 굽기 멈춤) · index.html 과 서로 hreflang(en · ko · vi · ja · x-default) · 앱은 `?lang=<언어>` 로 그 말로 연다(브라우저 말이 켠 언어면 그것부터). 언어별 TOPIK 모음 쪽 `/vi/topik-writing/` · `-reading/` · `-listening/`(· ja 같음) — build-pages `localeHub`(HUB_L 표에 제목 · 소개 · 단추, 유형 · 문항 목록은 한국어 모음 쪽과 같은 것), 한국어 모음 쪽과 서로 hreflang(2026-10-09). 글자 뽑기는 TOPIK · EPS 자료의 유형 이름 짝도 읽는다. 사전 쪽 뜻 베트남어 · 일본어는 `docs/antigravity/antigravity-vocab-tr-task.md`(낱말에 `tr: { vi, ja }`, 11묶음 — 들어오면 사전 쪽에 붙인다). IndexNow(`tools/indexnow.mjs` · 액션 indexnow — main 에 바뀐 .html 을 Bing 등에 저절로 알림, 사이트맵에 있는 주소만, 열쇠 파일은 맨 위 `8d5ef….txt` — 지우지 않는다) · 검색 엔진 등록 순서 `docs/ops/search-console.md`(Search Console · Bing — 확인 meta 한 줄을 받으면 index.html 에). build-i18n 은 자리 표시 틀을 고정 글자가 많은 것부터 늘어놓는다(넓은 「{0} of {1}」이 긴 문장을 가로채던 것).

## 15. 단어 감자
- **단어 감자**(게임 `#blocks`, `word-blocks.js` — 운영자 2026-10-07 「사과 게임처럼 — 사과 말고 감자로」, 블록 쌓기를 바꿈): 감자밭(폰 4×6 · PC 6×5)에 낱말 감자(갈색) · 뜻 감자(노랑), 짝 둘만 든 네모로 묶으면 터짐(사이에 다른 감자가 끼면 안 됨) · 2분 · 판 비우면 +10초 · 틀린 짝 −3초 · 콤보 배수 · 힌트 3 · 섞기(−5초, 막히면 저절로) · 효과음 · 등급 S~C · 틀린 낱말 「단어장에 담기」(source 'blocks'). 쉬움 · 보통 · 어려움 = 감자 L1~2 · L3~5 · L6~7. 로그인 없이 된다. 「단어」 첫 화면 맨 위 큰 카드(`words.js` potHero, 운영자 「메인으로」) · 게임 줄 첫째 · 게임 화면 첫째.

## 16. 초성 퀴즈 · 오늘의 감자들
- **초성 퀴즈 · 오늘의 감자들**(운영자 2026-10-07 「초성 퀴즈 좋다 · 오늘의 감자들도」): 게임 `#chosung`(`chosung.js` — 초성 보고 한국어로 쓰기, 10문제 × 20초, 힌트 뜻 → 첫 글자, 같은 초성의 우리 낱말이면 정답) · `#potdle`(`potdle.js` — 한글 워들, 두 글자 · 자모 5개(겹모음 · 겹받침은 둘로), 감자 L1~L4, 하루 한 낱말(한국 자정, 1호 = 2026-10-08, 낱말 목록이 바뀌면 그날 낱말도 바뀐다), 🥔🧀⬜ 공유 · 연습 판 · 💡 뜻 보기). 게임 화면 · 옆 메뉴 · 「단어」 게임 줄에 있다. 로그인 없이 된다.


## 17. 블로그 주간 정리
- **블로그 주간 정리**(운영자 결정 2026-10-03): 매일 자동 글은 안 한다(검색에 「대량 자동 생성」으로 보일 수 있다). 일요일 20:07
  `.github/workflows/blog-weekly.yml` 이 `tools/blog-weekly.mjs` 로 그 주 인스타 낱말 · 문법 · TOPIK 을 묶어 **초안 PR** 을 연다.
  글 안의 `<!-- 운영자 한마디 -->` 를 운영자 말로 채운 뒤 머지(비어 있으면 check-blog 가 막는다). PR 을 열려면 저장소 설정
  「Allow GitHub Actions to create and approve pull requests」(운영자가 켠다).


## 18. 선생님 · 1:1 수업
- **선생님 · 1:1 수업**(운영자 결정 2026-10-03): `/teacher.html`(손으로 쓴 쪽, 스크립트 없음) — 신청은 **Preply**(큰 단추) · **WhatsApp**(문의).
  링크는 강의 화면 위 · 맨 아래 줄에. 사진은 아직 없음(로고). TOPIK 듣기 120 지시서 `docs/antigravity/antigravity-topik-listening-task.md` — 소리는 **기계 목소리 먼저**(운영자 결정).
- 결제: **켜짐(2026-10-04, 운영자 「결제 켜줘」)** — Polar(2026-10-03 승인, Paddle 은 거절). 코드는 Polar 로 옮김(결제 링크 · polar-webhook · 약관 쪽). 운영자가 docs/ops/billing-setup.md 1~5
  (함수 배포 · 웹훅 · secret · Success URL)를 마치고 「결제 켜줘」 → `ON = true`,
  FAQ · `llms.txt` 의 「가입하면 모의고사 여러 회차」 문구를 「1회차 무료 · 전 회차 Pro」로 고치고, 실제 결제로 시험.

## 19. 요금제 나누기
- **요금제 나누기**(운영자 2026-10-08 「TOPIK 시험 패스와 한 달씩 꾸준히 공부하는 학생을 정확히 나누자 · 레벨테스트 뒤 자연스럽게 구독까지」): 가격 화면 카드마다 「이런 분께」, 학생 길에 맞는 카드에 「추천」(TOPIK 학생 → 시험 패스, 그 밖 → Pro — `proOpen(from, pick)` · `proPick`). 레벨테스트 끝 상자(`ltProHtml`)도 길에 맞게: TOPIK → 시험 패스(시험까지 N일), 일반 → Pro 7일 무료.

## 20. Pro 매력 묶음
- **Pro 매력 묶음**(운영자 결정 2026-10-04): 7일 무료 체험(월 · 연) · 출시 할인 LAUNCH30(1년 30% · 선착 100) · **시험 패스 3개월 $15**(한 번 결제, 표 status 'pass') ·
  잠긴 모의고사 3문제 미리 보기 · PDF 인쇄본 3회부터 Pro · 무료 횟수 끝나면 체험 권유. 운영자 할 일은 docs/ops/billing-setup.md 맨 아래.

## 21. AI 한도 · 판매자 정보 · 녹음 · 운영 쪽 · 인스타 · 그 밖
- AI 쓰기 채점 한도: **무료 하루 2번 · Pro 하루 30번**(운영자 결정, 그대로 유지).
- 가격 쪽 「AI 발음 진단 · 한국어 도우미 Pro 더 많이」 — 운영자 결정 (가) 한도 올리기(2026-10-03): **무료 20 · Pro 100**.
  발음(`score-pronunciation`)은 앱 저장소 cheesepotatoapp#3 로 바꿈(운영자가 대시보드에서 배포). **도우미(`ask-korean`)는 코드가 어느 저장소에도 없어**
  → 운영자가 코드를 줘서 cheesepotatoapp#4 로 넣음(무료 20 · Pro 100, 둘 다 운영자가 배포함).
- 판매자 정보(대표자 · 통신판매업 신고번호 · 주소)는 운영자가 알려 주면 `tools/build-legal.mjs` 의 `SELLER` 에.
- 녹음: 운영자가 녹음소(`/record.html`)로 직접 녹음 → ZIP 을 구글 드라이브에 올리면 Claude 가 받아 넣는다
  (`docs/ops/recording.md`). 녹음을 넣은 뒤 `node tools/record-list.mjs`.
- 묻고 답하기 씨앗 질문 30개: 안티 초안 → Claude 검토 끝(2026-10-02, `docs/qa-seeds.json`). **운영자가 읽고 고친 뒤**
  `node tools/build-qa-seeds-sql.mjs` → 운영자가 `db/add_qa_seeds.sql` 을 SQL Editor 에서 돌린다.
- 운영 쪽(검색에 안 걸림): 녹음소 `/record.html`, 인스타 편집기 `/insta.html`, 콘텐츠 현황 `/stats.html`, **쇼츠 공장**(2026-10-05): 촬영소 `/shorts.html`(TOPIK 읽기 · 듣기 · 쓰기(모의고사 회차 차례, `shorts-topik.js`) · 문법 소개 7장 `shorts-grammar.js` 세로 영상, 듣기는 운영자가 대본을 읽음 · 형광펜 · 펜 · 태블릿 · 표지 A 시험지 기본) → 대기열(`db/add_shorts.sql`) → 액션 `shorts-post.yml` 이 하루 한 번 릴스 · 틱톡 1개 · 유튜브 되는 만큼(비공개로 쌓기). 연결 쪽 `/connect.html`, 운영자 순서 `docs/ops/shorts-auto.md`.
- 인스타: 하루 단어 2 · 문법 1(운영자 결정 2026-10-02) + **오늘의 TOPIK 한 문제**(13:07, 2026-10-03 · TOPIK I 읽기 창작 문항 · 「기출 아님」 표시). 낱말 다섯은 둘째 갈래 · 품사가 같은 것끼리(`insta-pick.js` related). TOPIK 은 스토리(9:16)로도, 모든 게시물은 **스레드**로도(Secrets `THREADS_TOKEN` 을 넣으면 — 순서는 `docs/ops/insta-auto.md`). **자동 올리기** `.github/workflows/insta-post.yml` + `tools/insta-post.mjs`
  (이미지는 `insta-media` 가지, 열쇠는 운영자가 넣는 Secrets `IG_TOKEN`, 켜기는 Variables `INSTA_AUTO=on`) — 운영자 순서는 `docs/ops/insta-auto.md`.
- TOPIK 쓰기 200문항(번호마다 50) — 2026-10-02 검토해 넣음. 회화 연습 장면 31개(2026-10-02 30개 검토해 넣음, `convo-merge.mjs --keep-accept`). 안티 그래비티에게 넘긴 일: **문법 블록 연습 문장 205개 표현 × 5**(`docs/antigravity/antigravity-grammar-practice-task.md`, 브랜치 `grammar-practice`) · **레벨테스트 문제 은행 레벨마다 30 + 문법 꼬리표 g**(`docs/antigravity/antigravity-leveltest-bank-task.md`, 브랜치 `leveltest-bank`) — 2026-10-05, 오면 검토. 쓰기 보강 · 실물 문서 10편 · 진짜 말 10편은 2026-09-28 #114 로 이미 들어갔다
  (안티 브랜치가 main 보다 「앞서」 보이는 것은 squash 머지 때문 — 내용은 main 에 있다). 검토할 때: 도구(`tools/`)를 고쳤는지, 자국이 낡았는지, 「운영자 확인」 note 가 남았는지 본다.

## 22. 앱 · 검색 엔진 · 측정 (2026-10-09 ~ 10)
- **앱**(저장소 cheesepotatoapp, 플레이 프로덕션): 오류 알림 `app_errors`(이름 없이, #7 머지 · SQL 돌림) · 별점 요청 · 빌드 없이 바로 고치기(EAS Update) · 확인용 빌드 `--profile check`(#8, 운영자 폰 확인 기다림). 대상 SDK 36(RN 0.81 기본). 순서는 앱 `docs/ota-updates.md`.
- **검색 엔진**: 구글 · Bing · Yandex(확인 파일 `yandex_d43c6634bde6dcde.html`) · 네이버(meta) 등록 끝 · IndexNow(열쇠 `8d5ef….txt`) — 확인 파일 · 태그 · 열쇠는 **지우지 않는다**. 순서 `docs/ops/search-console.md`.
- **측정**: 숫자 판 `/funnel.html`(기준) · Clarity — 유럽 방문자는 쿠키 동의 줄(`analytics.js`, 2026-10-10) 뒤에만 쿠키, 그 전 자료는 한 사람이 여러 번으로 잡혔다(독일 1 → 46, 이탈리아 학생 1 → 15).
- **개인정보**: `privacy.html` 은 손으로 고친다 — 앱 저장소 `docs/privacy-policy.md` 로 다시 구우면 Polar 등 사이트 쪽 줄이 빠진다(두 문서 맞추기는 todo).

## 23. TOPIK 예상 급수
- **예상 급수**(운영자 2026-10-10 「241해줘」 — 산타토익처럼 「예상 점수가 늘 보이고 오르는 게 보이게」): `app.module.js` predNow · predHtml · predLine.
  새로 재지 않고 기록 셋 중 가장 최근 것 — 레벨테스트 어림(cp_level.est) · 모의고사 정답률 · 유형 연습 최근 문항(20문항 넘으면). 정답률 × 만점(I 200 · II 300), 5점 단위.
  보이는 곳: TOPIK 화면 맨 위 카드(약한 유형 풀기 단추) · 첫 화면 「내 길」(TOPIK) 한 줄 · 레벨테스트 끝(일반 길도 「TOPIK 으로 치면」, ltEstimateGeneral).
  하루 한 줄 기록 cp_pred_hist → 「N일 전 → 지금」 · 작은 선. **「우리 문제로 본 어림 — 실제 TOPIK 점수 아님」을 늘 적는다.** 숫자는 무료(운영자 2026-10-10 「일단 무료로 두자」).
- **틀린 문제 해설 밑 「이 문제에 나온 것」**(산타토익 5, 2026-10-10): `tqLearnPaint` — 지문 · 보기에서 문법(grammarMarkRe, 「N…」 조사 빼고 셋까지) · 낱말(glossFind → 표제어, 흔한 말 빼고 여섯까지) 칩. 틀렸을 때만, TOPIK 읽기 연습만(듣기는 아직).
- 예상 급수 카드는 한눈에(운영자 「UI 더 깔끔하게」): 윗줄 급수 · 점수 · 오름 딱지(▲ 85점 · 10일), 막대 하나(급수만), 아랫줄 「다음 급수까지」 + 약한 유형 단추, 작은 글 한 줄.

## 24. 무료 도구 · 소개 · 믿음 한 줄
- **무료 도구 쪽**(운영자 2026-10-10 「트래픽 A」, 손으로 쓴 쪽 + `page.css`): `/korean-name/`(`korean-name.js` — 흔한 이름 표(영어 · 베트남어) → 일본어 로마자 규칙 → 소리 규칙 어림, 어림이면 화면에 적음, 글자마다 로마자) · `/korean-age/`(`korean-age.js` — 만 나이(2023-06-28부터 법 · 행정) · 연 나이 · 세는 나이 · 「스물다섯 살 / 25세」 · 띠). 끝에 레벨테스트 · 한글 길로 잇는 단추. 사이트맵 `sitemap-main.xml`(build-pages 의 urls.push).
- **소개 쪽** `/about.html`: 만든 사람(한국어 선생님 · 1:1 수업 1,700회+ — 운영자 소개 영상의 말) · 숫자(레슨 401 · 문법 290 · TOPIK 창작 1,370 · 낱말 1만+) · 원칙(창작 · 맞는 순서 · AI · 무료는 무료 · 광고 없음) · 연락. 선생님 이름은 아직 안 씀.
- **믿음 한 줄**: 첫 화면 큰 단추 밑(`.hero-trust`, about 으로) · 가격 쪽(build-legal). 숫자가 바뀌면 about · 첫 화면 · build-legal 셋을 같이 고친다. 맨 아래 줄에 소개 · 두 도구 링크.
- **이름 도장 그림**(판돈 4): /korean-name/ 에서 이름을 넣으면 빨간 도장 + 이름 + 로마자 + 사이트 주소가 든 스토리 크기 그림(1080×1920, `korean-name.js` sealBlob) — 「저장 / 공유」(폰은 공유 창, PC 는 내려받기).

## 25. 키우기 판돈 (운영자 2026-10-10 「4 1 2 해줘 3번도」)
- **1 선생님 데려오기**: 안내 쪽 `/for-teachers.html`(선생님 무료 · 반 학생 Pro 무료 · 수업 · 결제는 선생님 플랫폼) · 운영자 순서와 보낼 메시지 `docs/ops/teacher-pilot.md`. 반은 운영자가 「선생님 계정」을 열어 줘야 만들 수 있다 — 신청은 메일.
- **2 TOPIK 시험 날 파도**: 계획만 `docs/plans/topik-exam-wave.md` — 다음 시험 날짜(운영자, 공식 공지)를 받으면 D-30 부트캠프 · D-7 · 시험 다음 날 쓰기 54 주제 풀이(원문 안 옮김).
- **3 미얀마어 EPS**: `/my/eps-topik/` **초안**(미얀마어는 Claude — 운영자가 읽고 고친 뒤 연다, 그 전까지 noindex · 사이트맵 없음). 연습 화면 자체는 아직 영 · 한.
- **검색 자료 2026-10-10(3개월)**: 노출 10일 단위 2.8천 → 2만 → 8만, 평균 9~10위. 노출의 67%가 한국의 「○○ 뜻」 검색(우리 손님 아님 — 쫓지 않는다). 클릭률 TOPIK 쓰기 17% · 문법 1.9% · 사전 · 「in Korean」 0.2%.
  → 사전 · 「in Korean」(nextStep) · 문법 쪽 끝에 TOPIK 쓰기 모음 링크(utm_source=dict · wordfor · grammar), 생성 쪽 제목 끝 「| CheesePotato」(블로그 한국어 쪽만 「치즈감자 블로그」). 문법 제목은 한국어 먼저 그대로.

