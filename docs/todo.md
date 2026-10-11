# 할 일 판

> 한 곳에서 본다. 끝나면 줄을 지우지 말고 「끝난 것」으로 옮긴다(날짜). Claude 는 대화를 시작할 때 이 파일을 먼저 본다.
> 안티 일은 여기 적지 않는다 → `docs/antigravity/STATUS.md`. 정한 것은 → `docs/decisions.md`.
> 마지막 정리: 2026-10-11.

## 🙋 운영자 — 급한 순서
### 🔥 이번 주 (몇 분씩)
| # | 할 일 | 어디 · 어떻게 |
|---|---|---|
| 1 | Search Console 「색인 생성 요청」 — 새 쪽 열두 개 + Sitemaps 에 `sitemap.xml` 다시 제출. 주소: `/korean-name/` `/korean-age/` `/for-teachers.html` `/my/eps-topik/` `/korean-zodiac/` `/korean-proverb/` `/my-korean-name/` `/korean-birthday/` `/korean-word-today/` `/hangul-worksheet/` **`/en/topik-writing/` `/en/topik-reading/` `/en/topik-listening/`** | URL 검사 칸에 주소 → 맨 위 상자의 「색인 생성 요청」 |
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

### ⚙️ 한 번만 하면 계속 도는 것
| # | 할 일 | 어디 |
|---|---|---|
| 9 | 쇼츠 자동 올리기 켜기 — SQL 한 번 · Secrets `SUPABASE_SERVICE_KEY` · Variables `SHORTS_AUTO=on` · `SHORTS_IG=on` | `docs/ops/shorts-auto.md` 0 · 1 |
| 10 | 매일 공부 알림 메일 켜기 | `docs/ops/reminders.md` |

### 🧭 정하기 · 알려 주기
| # | 할 일 | 어디 |
|---|---|---|
| 11a | **우리만의 것 후보**(① 선생님이 본 실수 · ② 한국어 붙여 넣기 · ③ 소리 나는 대로 · ④ AI + 선생님 한 줄 · ⑤ 살아 보는 한국어) 중 고르기 | `docs/plans/unique-edge.md` |
| 11b | 안티에게 「한국 이름 늘리기」 1묶음 시키기 | `docs/antigravity/STATUS.md` |
| 11c | TOPIK 노출 더 늘리기 — 다음 단계 고르기: 영어 TOPIK 가이드 글(안티) · TOPIK 낱말 목록 내려받기 쪽 · TOPIK 문법 목록 쪽 | 아래 Claude 줄 |
| 11 | Polar 에서 지금 유료 사용자 수 | PRD 기준선 |
| 12 | PRD ⚠ 남은 것(90일 숫자 · 부트캠프 · 기관 요금 · EPS 시기 · 언어 · iOS) | `docs/prd.md` 10항 |
| 13 | 쿠키 동의 단추 글(지금 「OK · No thanks」 / 「Accept all · Essential only」) | |
| 14 | 소개 영상 원본 보내기 · 이름(June / Junsang) 정하기 | 고화질 · 썸네일 다시 |

### 🔁 매주 일요일
| 15 | 숫자 넷(방문 · 가입 · 결제 · 다시 온 사람) + Clarity CSV · 2주마다 Search Console 내보내기 | 숫자 판 `/funnel.html` |
|---|---|---|


## 🤖 Claude
| # | 할 일 | 언제 |
|---|---|---|
| 1 | 낱말 뜻 vi · ja **11묶음 끝**(10,189개) → 사전 쪽 · 도우미 · 낱말 한 장에 보여 주기 | 이 PR 이후 |
| 2 | 사전 쪽에 vi · ja 뜻 줄 · 설명 붙이기(`tools/build-pages.mjs`) | 낱말 뜻 몇 묶음 들어온 뒤, 운영자 OK |
| 3 | 앱 PR #8 머지 | 「앱 PR 머지해줘」 |
| 4 | 원본 영상 → 고화질 · 소리 · 썸네일 | 원본 받으면 |
| 5 | Clarity: 유럽 방문자가 한 사람으로 묶이는지 확인 | 다음 주 CSV |
| 6 | PRD ⚠ 채워 확정 | 운영자 답 받으면 |
| 7 | 앱 개인정보 문서(`cheesepotatoapp/docs/privacy-policy.md`)와 사이트 `privacy.html` 맞추기(Polar 줄 등 어긋남) | 운영자 OK |

| 8 | **TOPIK 노출 다음 단계**(운영자 고르면): ① 영어 TOPIK 가이드 글 10편(안티 지시서) ② 「TOPIK 낱말 목록 · Anki 내려받기」 쪽 ③ 「TOPIK 문법 목록」 쪽 | 운영자 OK |

## ✅ 끝난 것
- 2026-10-11 (머지 대기 #303) 도우미를 검색 + AI 채팅으로 · 입력칸 아래 알약 · 영어로 찾기 · 사이트 안내 / TOPIK 노출: 영어 TOPIK 쪽 셋(`/en/topik-*/`) · 사전 5,227쪽에 「TOPIK 문항에서」 칸 · 우리만의 것 후보 문서
- 2026-10-11 SQL `db/add_classes_more_kinds.sql` 돌림(숙제 종류 10가지 · 번역 포함)
- 2026-10-10 쿠키 동의 줄(#286) · 안티 결과 vi · ja 1묶음 + 중국어 3묶음(#285) · PRD 초안 · 작업 체계 정리 · 효율 도구(preflight · ag-status · check-docs) · CLAUDE.md 표준 순서 · TOPIK 예상 급수 · 무료 도구 쪽 둘 · 소개 쪽 · 믿음 한 줄 · 이름 도장 · 선생님 쪽 · 미얀마어 EPS 초안 · 검색 자료 반영(#290) · 「1:1 수업 1,700회+」 확인(머지로) · 미얀마어 EPS 쪽 열기 · 이름 도장 모양 넷 + 사이드바 「만들기」(#293) · 중국어 화면 끝 · 메뉴에 켬 · 낱말 뜻 vi · ja 2 ~ 8묶음
- 2026-10-09 앱 오류 알림(cheesepotatoapp#7, SQL 돌림) · 개인정보 오류 기록 고지(#284) · 로드맵(#283)
