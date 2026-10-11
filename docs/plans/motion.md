# 움직임(애니메이션) — transitions.dev 에서 필요한 것만

> 운영자 2026-10-12: 「https://github.com/Jakubantalik/transitions.dev — 우리 사이트에 필요한 것만 쏙쏙 빼서」.

## 라이선스(읽은 것)
- 저장소 `LICENSE`: **무료 움직임(`transitions/` · `skills/`)은 개인 · 상업 프로젝트에서 복사 · 고쳐 쓰기 · 사용자에게 내보내기 모두 허용.** 금지는 라이브러리 자체를 되파는 것(경쟁 제품으로 다시 묶어 내기).
- **Pro 움직임은 유료**(Pro · Business 플랜) — 쓰지 않는다. 무료 목록은 `cli/free-manifest.json`.
- 쓸 때는 © 주석(`Jakub Antalik / Transitions.dev`)을 CSS 에 남긴다(지금 `app-views.css` 맨 아래에 있음).

## 이미 넣은 것(2026-10-12)
| 움직임 | 어디에 | 비고 |
|---|---|---|
| Error state shake | 틀린 보기 단추(`.ex-opt.wrong` · `.qz-choice.wrong`) | 280ms 좌우 흔들림 |
| Modal open | 가입 직후 동의 창 | 가운데서 .96 → 1 로 커지며 열림 |

## 다음 후보(필요하면 하나씩)
| 움직임 | 쓸 곳 | 이유 |
|---|---|---|
| Success check(체크 그리기) | 레슨 · 오늘 할 일 완료 | 「했다」가 눈에 보임 |
| Toast open/close | `gameToast` | 지금은 뚝 나타남 |
| Tabs sliding | TOPIK 판 · 내 단어 탭 | 어느 탭인지 한눈에 |
| Number pop-in | 연속 일수 · 점수 | 숫자가 바뀌는 순간 |
| Skeleton reveal | 느린 목록(단어 · 사전) 불러올 때 | 빈 화면 대신 |
| Menu dropdown | 언어 · 더보기 메뉴 | 눌린 곳에서 펼쳐짐 |

## 지킬 것
- 움직임 줄이기(`prefers-reduced-motion`)를 켠 사람에게는 끈다 — 모든 움직임에 같은 규칙을 둔다.
- 한 화면에 움직임이 둘 넘으면 정신없다 — 오늘 할 일 정리와 같은 방향(눈이 갈 곳을 줄이기)으로 고른다.
- 새 움직임을 넣을 때는 이 표에 한 줄 더하고 `node tools/stamp.mjs` 를 돌린다.
