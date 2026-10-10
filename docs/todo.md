# 할 일 판

> 한 곳에서 본다. 끝나면 줄을 지우지 말고 「끝난 것」으로 옮긴다(날짜). Claude 는 대화를 시작할 때 이 파일을 먼저 본다.
> 안티 일은 여기 적지 않는다 → `docs/antigravity/STATUS.md`. 정한 것은 → `docs/decisions.md`.
> 마지막 정리: 2026-10-10.

## 🙋 운영자
| # | 할 일 | 왜 / 어디 |
|---|---|---|
| 1 | 확인용 앱을 폰에서 보기(로그인 · 단어장 · 「한국어」 탭 · 카드 공부) → 「앱 PR 머지해줘」 | 앱 PR cheesepotatoapp#8 (별점 · 바로 고치기) |
| 2 | 정식 앱 빌드 올리기 + Play Console 데이터 보안 「비정상 종료 로그 · 진단」 체크 | 앱 `docs/ota-updates.md` · `docs/data-safety.md` |
| 3 | PRD ⚠ 7개 정하기 | `docs/prd.md` 10항 |
| 4 | Polar 에서 지금 유료 사용자 수 알려 주기 | PRD 기준선 |
| 5 | 쿠키 동의 단추 글 고르기(지금 「OK · No thanks」 / 「Accept all · Essential only」) | PRD ⚠ 7 |
| 6 | 소개 영상 원본 보내기 · 이름(June / Junsang) 정하기 | 고화질 · 썸네일 다시 |
| 7 | 매주 일요일: 숫자 넷(방문 · 가입 · 결제 · 다시 온 사람) + Clarity CSV | 숫자 판 `/funnel.html` |
| 8 | 알림 메일 켜기 · 쇼츠 자동 올리기 설정 | `docs/ops/reminders.md` · `docs/ops/shorts-auto.md` |
| 9 | 앱 PR #1(홍보 자료 안내) 넣을지 | cheesepotatoapp#1 |

## 🤖 Claude
| # | 할 일 | 언제 |
|---|---|---|
| 1 | 낱말 뜻 vi · ja 2묶음 검토해 넣기 | 「안티가 올렸어」 또는 운영자가 시키면 |
| 2 | 사전 쪽에 vi · ja 뜻 줄 · 설명 붙이기(`tools/build-pages.mjs`) | 낱말 뜻 몇 묶음 들어온 뒤, 운영자 OK |
| 3 | 앱 PR #8 머지 | 「앱 PR 머지해줘」 |
| 4 | 원본 영상 → 고화질 · 소리 · 썸네일 | 원본 받으면 |
| 5 | Clarity: 유럽 방문자가 한 사람으로 묶이는지 확인 | 다음 주 CSV |
| 6 | PRD ⚠ 채워 확정 | 운영자 답 받으면 |
| 7 | 앱 개인정보 문서(`cheesepotatoapp/docs/privacy-policy.md`)와 사이트 `privacy.html` 맞추기(Polar 줄 등 어긋남) | 운영자 OK |

## ✅ 끝난 것
- 2026-10-10 쿠키 동의 줄(#286) · 안티 결과 vi · ja 1묶음 + 중국어 3묶음(#285) · PRD 초안 · 작업 체계 정리 · 효율 도구(preflight · ag-status · check-docs) · CLAUDE.md 표준 순서
- 2026-10-09 앱 오류 알림(cheesepotatoapp#7, SQL 돌림) · 개인정보 오류 기록 고지(#284) · 로드맵(#283)
