# docs — 어디에 무엇이 있나

| 무엇 | 어디 |
|---|---|
| **무엇을 · 누구에게 · 왜** | `prd.md`(사이트) · `prd-books.md`(책 출판) |
| **언제 · 숫자** | `roadmap.md` |
| **정한 것 (한 줄씩)** | `decisions.md` |
| **갈래별 지금 상태** | `status.md` |
| **할 일 판** (운영자 · Claude) | `todo.md` |
| 안티 그래비티(다른 AI) 지시서 · 진행표 | `antigravity/` — 진행은 `antigravity/STATUS.md` |
| 운영자가 따라 하는 순서(결제 · 알림 · 검색 등록 · 녹음 …) | `ops/` — 아래 「ops 안내」 |
| 갈래별 설계 · 계획(단어 · 레벨 · 문법 · 쓰기 …) | `plans/` |
| 지난 계획(PRD · 로드맵으로 바뀜, 지우지 않음) | `archive/` |
| 자료 원본(`*.json`, `i18n/`, `vocab/`, `round2/`) | 이 폴더 바로 아래 — 도구가 읽으므로 옮기지 않는다 |

새 문서를 만들 때: 운영자 순서면 `ops/`, 설계면 `plans/`, 안티 지시서면 `antigravity/antigravity-<일>-task.md`.

## ops 안내 (운영자가 따라 하는 순서, 주제별)
| 주제 | 파일 |
|---|---|
| 📚 책 · 출판 | `publishing-week1.md`(이번 주 순서 · 예스24 칸 채우기) · `book-listings.md`(판매처에 붙일 글) · `kdp-upload.md`(아마존 KDP 올리기) · `shop-launch.md`(상점) · `polar-api.md`(Polar 상품 자동 올리기) · `tiers.md`(무료 · Pro · 책 구분) · `topik-niied-reply-2026-10-21.md`(TOPIK 이름 문의 답) |
| 💳 결제 · 구독 | `billing-setup.md` · `downloads-gate.md` |
| 📊 숫자 · 검색 | `analytics-api-setup.md` · `analytics-baseline-2026-10-18.md` · `funnel.md` · `search-console.md` |
| 🎙️ 자동으로 올리기 | `podcast-auto.md` · `shorts-auto.md` · `insta-auto.md` · `reminders.md` |
| 🎓 수업 · 반 | `class-homework.md` · `teacher-pilot.md` · `lectures.md` |
| 🛠️ 설정 · 도구 | `ai-writing-setup.md` · `recording.md` · `tts-windows.md` · `storage-guide.md` · `ios-launch.md` · `reviews-ask.md` |

`antigravity/` 안의 `*-notes.md` 는 안티가 지시서를 따르다 남긴 메모(의심스러운 것 목록)다 — 확인한 뒤 지우지 않고 둔다.
