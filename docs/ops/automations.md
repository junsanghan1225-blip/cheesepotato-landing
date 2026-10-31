# 자동화 · 연결 현황 (Claude 가 「할 수 있나 · 이미 있나」 답하기 전에 먼저 보는 곳)

새 자동화를 만들거나 연결하면 여기에 한 줄 더한다. 비밀 값(토큰)은 적지 않고 **이름과 둔 곳**만 적는다.

| 무엇 | 어떻게 | 열쇠(이름 · 둔 곳) | 켜기 | 자세히 |
|---|---|---|---|---|
| 인스타 하루 4번 올리기 | `tools/insta-post.mjs` · `.github/workflows/insta-post.yml` | `IG_TOKEN` · GitHub Secrets | 변수 `INSTA_AUTO=on` | `docs/ops/insta-auto.md` |
| 인스타 스토리 · 스레드(그날 게시물 겸) | 같은 도구 `story` · `threads` | `IG_TOKEN` · `THREADS_TOKEN` · GitHub Secrets | 인스타와 같이 | 같은 문서 「스토리 · 스레드」 |
| 쓰레드 책 홍보 글 7개(하루 1개, KST 21:07) | `tools/threads-promo.mjs` · `.github/workflows/threads-promo.yml` · 그림 `assets/promo/` | `THREADS_TOKEN` | 기본 켜짐(끄기: 변수 `THREADS_PROMO=off`) | 같은 문서 「책 홍보 쓰레드 글」 |
| 쓰레드 선생님 홍보 글 3개(1 · 3 · 6번, KST 21:37) | `tools/threads-promo.mjs --set teachers` · 같은 워크플로 | `THREADS_TOKEN` | 기본 켜짐(끄기: `THREADS_PROMO=off`) | 원본 `docs/ops/teacher-posts.json` — 쓰레드가 적힌 글 중 영어 본문 있는 것만. 5번(짧은 한국어)은 인스타 스토리용이라 자동에서 뺌 |
| 정확한 시간에 깨우기 | cron-job.org → GitHub | GitHub 세부 토큰 | — | `docs/ops/insta-auto.md` |
| Polar 상품 · 결제 링크 · 감사 쪽 주소 | `tools/polar-publish.mjs` · `polar-bundle.mjs` · `polar-links.mjs` | Polar 토큰 · 환경 시크릿(Node 에 `NODE_USE_ENV_PROXY=1`) | 명령 | `docs/ops/polar-api.md` |
| 블로그 · 팟캐스트 · 쇼츠 · 분석 · 알림 | `.github/workflows/` 의 blog-* · podcast-post · shorts-post · analytics-daily · daily-reminder · downloads-sync · indexnow | 각 workflow 머리말 참고 | 각 workflow | 각 workflow 머리말 |
| 이메일 모으기 · 책 리뷰 | `subscribe.js` · `reviews.js` → Supabase(공개 키, 넣기만 가능) | 없음(공개 anon 키) | 켜짐 | `docs/db/` · `docs/ops/reviews.md` |
| 책 공장(책 PDF · 최종 검수 자동 검사 · 표지 · zip) | `node tools/book-factory.mjs <책 id>` · `--all` / 검사만 `tools/check-book-pdf.mjs` · 장부 `docs/ops/book-ledger.json` | 없음 | 켜짐(손으로 돌림) | `docs/plans/books.md` 8 |

**없는 것(2026-10-27 기준)**: KDP · 예스24 · 쿠팡 올리기(운영자가 화면에서 직접 — 올리기 API 없음) · 구매자별 워터마크.
