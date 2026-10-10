# 할 일 판

> 한 곳에서 본다. 끝나면 줄을 지우지 말고 「끝난 것」으로 옮긴다(날짜). Claude 는 대화를 시작할 때 이 파일을 먼저 본다.
> 안티 일은 여기 적지 않는다 → `docs/antigravity/STATUS.md`. 정한 것은 → `docs/decisions.md`.
> 마지막 정리: 2026-10-10.

## 🙋 운영자 — 급한 순서
### 🔥 이번 주 (몇 분씩)
| # | 할 일 | 어디 · 어떻게 |
|---|---|---|
| 1 | Search Console 「색인 생성 요청」 셋 — `/korean-name/` · `/korean-age/` · `/for-teachers.html` + Sitemaps 에 `sitemap.xml` 다시 제출 | URL 검사 칸에 주소 → 맨 위 상자의 「색인 생성 요청」 |
| 2 | 선생님 5명에게 메시지 보내기 → 메일 오면 반 화면 「선생님 계정」에 올리기 | `docs/ops/teacher-pilot.md`(그대로 복사할 글) |
| 3 | 다음 TOPIK 시험 날짜(공식 공지) 알려 주기 | 받으면 D-30 부트캠프를 만든다(`docs/plans/topik-exam-wave.md`) |
| 5 | 이름 도장 그림(Claude 가 만든 셋 중 하나)을 인스타 스토리에 + 링크 스티커 `everykoreans.com/korean-name` | 첫 공유 예시 |
| 4 | Search Console 에 `/my/eps-topik/` · `/korean-zodiac/` · `/korean-proverb/` 색인 요청 | 머지 뒤 |

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
| 1 | 낱말 뜻 vi · ja 6묶음(topik2 3,001~) 검토해 넣기 | 「안티가 올렸어」 |
| 2 | 사전 쪽에 vi · ja 뜻 줄 · 설명 붙이기(`tools/build-pages.mjs`) | 낱말 뜻 몇 묶음 들어온 뒤, 운영자 OK |
| 3 | 앱 PR #8 머지 | 「앱 PR 머지해줘」 |
| 4 | 원본 영상 → 고화질 · 소리 · 썸네일 | 원본 받으면 |
| 5 | Clarity: 유럽 방문자가 한 사람으로 묶이는지 확인 | 다음 주 CSV |
| 6 | PRD ⚠ 채워 확정 | 운영자 답 받으면 |
| 7 | 앱 개인정보 문서(`cheesepotatoapp/docs/privacy-policy.md`)와 사이트 `privacy.html` 맞추기(Polar 줄 등 어긋남) | 운영자 OK |

## ✅ 끝난 것
- 2026-10-10 쿠키 동의 줄(#286) · 안티 결과 vi · ja 1묶음 + 중국어 3묶음(#285) · PRD 초안 · 작업 체계 정리 · 효율 도구(preflight · ag-status · check-docs) · CLAUDE.md 표준 순서 · TOPIK 예상 급수 · 무료 도구 쪽 둘 · 소개 쪽 · 믿음 한 줄 · 이름 도장 · 선생님 쪽 · 미얀마어 EPS 초안 · 검색 자료 반영(#290) · 「1:1 수업 1,700회+」 확인(머지로) · 미얀마어 EPS 쪽 열기 · 이름 도장 모양 넷 + 사이드바 「만들기」(#293) · 중국어 화면 끝 · 메뉴에 켬 · 낱말 뜻 vi · ja 2 ~ 5묶음
- 2026-10-09 앱 오류 알림(cheesepotatoapp#7, SQL 돌림) · 개인정보 오류 기록 고지(#284) · 로드맵(#283)
