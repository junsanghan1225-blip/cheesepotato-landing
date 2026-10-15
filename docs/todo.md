# 할 일 판

> 한 곳에서 본다. 끝나면 줄을 지우지 말고 「끝난 것」으로 옮긴다(날짜). Claude 는 대화를 시작할 때 이 파일을 먼저 본다.
> 안티 일은 여기 적지 않는다 → `docs/antigravity/STATUS.md`. 정한 것은 → `docs/decisions.md`.
> 마지막 정리: 2026-10-11.

## 🙋 운영자 — 급한 순서
### 🔥 이번 주 (몇 분씩)
| # | 할 일 | 어디 · 어떻게 |
|---|---|---|
| 1 | Search Console 「색인 생성 요청」 — 새 쪽 열두 개 + `/topik-grammar-list/` + Sitemaps 에 `sitemap.xml` 다시 제출. 주소: `/korean-name/` `/korean-age/` `/for-teachers.html` `/my/eps-topik/` `/korean-zodiac/` `/korean-proverb/` `/my-korean-name/` `/korean-birthday/` `/korean-word-today/` `/hangul-worksheet/` **`/en/topik-writing/` `/en/topik-reading/` `/en/topik-listening/`** | URL 검사 칸에 주소 → 맨 위 상자의 「색인 생성 요청」 |
| 2 | 선생님 5명에게 메시지 보내기 → 메일 오면 반 화면 「선생님 계정」에 올리기 | `docs/ops/teacher-pilot.md`(그대로 복사할 글) |
| 3 | 다음 TOPIK 시험 날짜(공식 공지) 알려 주기 | 받으면 D-30 부트캠프를 만든다(`docs/plans/topik-exam-wave.md`) |
| 5 | 만들기 도구 그림(이름 도장 · 띠 카드 · 포춘쿠키 · 생일 카드)을 인스타 스토리에 + 링크 스티커 | 첫 공유 예시 — 도구 쪽에서 만들어 저장 |
| 4 | **머지 대기 PR #303**(도우미 검색 + AI 채팅 · 영어 TOPIK 쪽 · 사전의 TOPIK 칸) → 「머지해줘」 | 머지하면 1~2분 뒤 올라감 |


### 📱 앱
| # | 할 일 | 어디 |
|---|---|---|
| 6 | 확인용 앱을 폰에서 보기 → 「앱 PR 머지해줘」 | 앱 PR cheesepotatoapp#8 (별점 · 바로 고치기) |
| 7 | 정식 앱 빌드 올리기 + Play Console 데이터 보안 「비정상 종료 로그 · 진단」 체크 | 앱 `docs/ota-updates.md` · `docs/data-safety.md` |
| 8 | 앱 PR #1(홍보 자료 안내) 넣을지 | cheesepotatoapp#1 |
| 9 | **앱 재설계 1단계를 폰에서 보기** — 오늘 · 공부 · 레슨 화면이 폰에서 잘 되는지(터치 · 키보드 · 소리). 확인용 APK 새로 빌드 또는 `eas update --channel preview --environment production` | 앱 브랜치 `claude/app-native-learn` · 앱 저장소의 native-redesign 문서 |
| 10 | **앱 정리 브랜치 확인** — `claude/app-refactor`(색 상수 · 공용 부품 · 자료 받기 · 게임 공용 화면 정리, 화면 변화 없음). 폰에서 지금 앱 확인이 끝난 뒤 `eas update` 로 올려도 되는지 말씀 | 앱 저장소 브랜치 |

### ⚙️ 한 번만 하면 계속 도는 것
| # | 할 일 | 어디 |
|---|---|---|
| 9 | 쇼츠 자동 올리기 켜기 — SQL 한 번 · Secrets `SUPABASE_SERVICE_KEY` · Variables `SHORTS_AUTO=on` · `SHORTS_IG=on` | `docs/ops/shorts-auto.md` 0 · 1 |
| 10 | 매일 공부 알림 메일 켜기 | `docs/ops/reminders.md` |

### 🧭 정하기 · 알려 주기
| # | 할 일 | 어디 |
|---|---|---|
| 11a | **우리만의 것 후보**(① 선생님이 본 실수 · ② 한국어 붙여 넣기 · ③ 소리 나는 대로 · ④ AI + 선생님 한 줄 · ⑤ 살아 보는 한국어) 중 고르기 | `docs/plans/unique-edge.md` |
| 11c | 안티에게 「영어 TOPIK 가이드 글 1묶음」(`antigravity-topik-guides-en-task.md`) 주기 — 낱말 · 문법 내려받기 쪽(`/topik-vocabulary-list/`)은 만들어 둠. 머지 뒤 Search Console 에서 그 주소 색인 요청 | 안티 / 검색 콘솔 |
| 11e | **이번 주 학생 5명에게 반 QR 보내기** — 순서 · 메시지: `docs/ops/teacher-pilot.md` 맨 아래 「운영자 본인 학생에게」. Preply 학생은 정규 수업 시작 뒤에만 | 운영자 |
| 11f | **발음 표시 눈으로 확인** — 머지 뒤 사전 쪽(예: `/dictionary/혈액형.html`) 아무거나 10개를 열어 「Pronounced […]」가 맞는지 봐 주세요. 틀린 것이 있으면 낱말만 알려 주시면 규칙을 고쳐요 | 운영자 |
| 11g | **알림 메일 실제로 받아 보기** — 설정에서 「매일 공부 알림 메일」을 켜고(확인 창 → 확인) 시각을 지금 시각으로 → 다음 정각 5분쯤 메일이 오는지, 스팸함 확인, 맨 아래 「그만 받기」가 되는지 | 운영자 |
| 11h | **도우미 이어 묻기 시험** — 로그인하고 도우미에 낱말을 묻고 「예문 하나 더」로 이어 물어 보기 | 운영자 |
| 11i | **새 메일(cheesepotato@everykoreans.com)로 바꿀 곳 — 사이트 밖**: 앱 저장소(cheesepotatoapp)의 문의 주소 · 플레이스토어 개발자 연락처 · Polar · Resend 계정 메일 · Search Console · Clarity · Supabase 알림. (사이트 쪽은 Claude 가 바꿈) | 운영자 · 앱 때 |
| 11 | Polar 에서 지금 유료 사용자 수 | PRD 기준선 |
| 12 | PRD ⚠ 남은 것(90일 숫자 · 부트캠프 · 기관 요금 · EPS 시기 · 언어 · iOS) | `docs/prd.md` 10항 |
| 13 | 쿠키 동의 단추 글(지금 「OK · No thanks」 / 「Accept all · Essential only」) | |
| 14 | 소개 영상 원본 보내기 · 이름(June / Junsang) 정하기 | 고화질 · 썸네일 다시 |

### 🔁 매주 일요일
| 15 | 숫자 넷(방문 · 가입 · 결제 · 다시 온 사람) + Clarity CSV · 2주마다 Search Console 내보내기 | 숫자 판 `/funnel.html` |
|---|---|---|

| 11 | **내일 맨 먼저(순서대로)** ① 웹 PR #323 · #322 「머지해줘」 ② 앱 `git pull` → `git log -1 --oneline` 이 `68d1070` 이상 ③ `npx eas-cli update --channel preview --environment production --message "문법 3칸"` ④ 폰에서 설정 맨 아래 「화면 버전」 = 「문법 · 3칸 할당」 확인 ⑤ 새 화면 훑기: 오늘(3칸) · 더보기 → 사전 · 문법 · 레슨 끝 XP | 앱 브랜치 `claude/app-native-learn` |

## 🤖 Claude

- **앱 남은 순서(2026-10-12 운영자 「1번2번3번」)**: 문법·3칸 할당은 끝. 남음 → ① 오답 노트(틀린 레슨·TOPIK 문제 모아 다시 풀기) ② 레벨 테스트 ③ 우리 반 숙제 ④ 번역 연습 · 회화 · 이야기 ⑤ 발음 AI · 도우미 AI · Pro 화면 ⑥ 문법의 「바꾸기」 · 「블록 맞추기」 연습 ⑦ 옛 화면(단어장 · 카메라 · 옛 홈) 새 디자인. 한 번에 하나, 앱은 `npx tsc --noEmit`.

- **Learn by course 대대적 수정**(운영자가 2026-10-13 에 말해 줌 · 2026-10-15 방향 「레슨 방식 개별화: 종류별 틀 + 학생별 맞춤」 — 계획서 `docs/plans/lesson-redesign.md`, 운영자 확인 대기) — 이때 같이: 레슨 마지막 「짝 맞추기(Match)」 블록이 너무 쉬움(난이도 올리기), 코스 구조 전체. 먼저 운영자 설명을 듣고 시작.
| # | 할 일 | 언제 |
|---|---|---|
| 1 | 낱말 뜻 vi · ja **11묶음 끝**(10,189개) → 사전 쪽 · 도우미 · 낱말 한 장에 보여 주기 | 이 PR 이후 |
| 2 | 사전 쪽에 vi · ja 뜻 줄 · 설명 붙이기(`tools/build-pages.mjs`) | 낱말 뜻 몇 묶음 들어온 뒤, 운영자 OK |
| 3 | 앱 PR #8 머지 | 「앱 PR 머지해줘」 |
| 4 | 원본 영상 → 고화질 · 소리 · 썸네일 | 원본 받으면 |
| 5 | Clarity: 유럽 방문자가 한 사람으로 묶이는지 확인 | 다음 주 CSV |
| 6 | PRD ⚠ 채워 확정 | 운영자 답 받으면 |
| 7 | (2026-10-15 사이트 `privacy.html` 에 「쓰기 답안 공유」 단락을 손으로 넣음 — `tools/build-privacy.js` 는 옛 경로를 가리켜 다시 돌리면 덮어쓰니 돌리지 않는다) 앱 개인정보 문서(`cheesepotatoapp/docs/privacy-policy.md`)와 사이트 `privacy.html` 맞추기(Polar 줄 등 어긋남) | 운영자 OK |

| 8 | **TOPIK 노출 다음 단계**: ① 영어 TOPIK 가이드 글(9편 들어옴 · 1편 보류) ② 낱말 목록 쪽 ✅ ③ 문법 목록 쪽 ✅(2026-10-15 `/topik-grammar-list/`) — 머지 뒤 Search Console 색인 요청 필요 | 운영자 |

## ✅ 끝난 것
- 2026-10-15 SQL `db/add_writing_share.sql`(TOPIK 쓰기 답안 공유 — 표 2개 · 신고) 운영자가 돌림. 다음: 53·54 를 AI 채점 → 「내 답안을…」 체크 → 올리기 → 「다른 학생 답안 보기」 눈으로 확인(운영자)
- 2026-10-14 SQL `db/add_class_submit.sql`(숙제 제출 · 사진 저장소) · `db/add_teacher_requests.sql`(선생님 신청) 돌림 — 다음: 머지 뒤 선생님 · 학생 계정으로 흐름 눈으로 확인
- 2026-10-12 안티 「한국 이름 2묶음」 시킴 → 119개 넣음(11b)
- 2026-10-12 `ask-helper` 배포 · 알림 메일(Resend 인증 · Secrets · SQL · `daily-reminder` 배포 · GitHub 설정 · 시험 성공) 설정 끝(11d)
- 2026-10-11 (머지 대기 #303) 도우미를 검색 + AI 채팅으로 · 입력칸 아래 알약 · 영어로 찾기 · 사이트 안내 / TOPIK 노출: 영어 TOPIK 쪽 셋(`/en/topik-*/`) · 사전 5,227쪽에 「TOPIK 문항에서」 칸 · 우리만의 것 후보 문서
- 2026-10-11 SQL `db/add_classes_more_kinds.sql` 돌림(숙제 종류 10가지 · 번역 포함)
- 2026-10-10 쿠키 동의 줄(#286) · 안티 결과 vi · ja 1묶음 + 중국어 3묶음(#285) · PRD 초안 · 작업 체계 정리 · 효율 도구(preflight · ag-status · check-docs) · CLAUDE.md 표준 순서 · TOPIK 예상 급수 · 무료 도구 쪽 둘 · 소개 쪽 · 믿음 한 줄 · 이름 도장 · 선생님 쪽 · 미얀마어 EPS 초안 · 검색 자료 반영(#290) · 「1:1 수업 1,700회+」 확인(머지로) · 미얀마어 EPS 쪽 열기 · 이름 도장 모양 넷 + 사이드바 「만들기」(#293) · 중국어 화면 끝 · 메뉴에 켬 · 낱말 뜻 vi · ja 2 ~ 8묶음
- 2026-10-09 앱 오류 알림(cheesepotatoapp#7, SQL 돌림) · 개인정보 오류 기록 고지(#284) · 로드맵(#283)
- (운영자 · 앱) 앱 새 레슨 블록 — 앱 저장소 브랜치 `claude/app-native-learn`(커밋 「앱: 레슨 새 블록 8종」 + 「레슨 나가기 확인 · 이어하기 · 틀린 문제 다시 풀기 · 오답 노트 아직이에요」 2741b91)을 받아 `npx.cmd eas-cli update --branch preview --message "레슨 새 블록 · 이어하기"` 으로 올린다. 웹이 먼저 올라가 있어야(lesson-extra) 새 블록이 뜬다. 폰에서 「첫 마디 · 저는 ~예요」 레슨을 열어 낱말 카드 · 짧은 글 · 받아쓰기 · 내 문장 쓰기 · 문장 늘리기 · 자기 점검이 나오는지 확인(활용 표는 「문장 뼈대 · 어제와 내일」).
