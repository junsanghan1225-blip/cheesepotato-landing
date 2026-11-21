# 안티 그래비티 작업 지시 — 사이트 공통 메뉴줄(머리글) 하나로 맞추기

> 이 파일과 `AGENTS.md` 를 같이 붙여 넣는다. 첫 줄: 「AGENTS.md 를 먼저 읽고, 이 지시문대로만 해.」
> 운영자 2026-11-21 「기본 틀부터 하나씩 · 안티랑도 작업해서 브랜치에 올리고 비교해서 나은 걸 고른다」. Claude 도 같은 일을 따로 하고 있다 — **서로의 브랜치를 보지 말고** `main` 에서 새로 시작한다.
> 브랜치: **`ag/web-header`** (main 에서 만든다). 배경은 아래 「왜」가 전부다(진단 문서는 Claude 브랜치에만 있다).

## 왜
지금 메뉴줄이 세 가지다.
1. 첫 화면(`index.html` 의 `site-hd`, 앱) — 검색 · 로그인 · 어두운 모드 · 언어 · 메뉴
2. 만든 쪽(사전 · 문법 · TOPIK 쓰기 · 블로그 …, `tools/build-pages.mjs` 의 `HEADER`) — 치즈감자 · TOPIK · 단어 · 무료로 배우기
3. 상점 · 책 · 학습지 · 단어 목록 · 약관 · 소개 쪽(`page.css` 를 쓰는 쪽) — **로고만**. 책 쪽에서 다른 곳으로 갈 길이 없다.
높이(57 · 61 · 65px) · 안쪽 폭 · 글꼴(시스템 글꼴 / Pretendard)도 쪽마다 다르다.

## 무엇을 — 2 · 3 을 하나의 메뉴줄로 (1 첫 화면은 건드리지 않는다)
- **한 곳에서 만든다**: 새 모듈 하나(예: `tools/lib/` 아래)가 머리글 HTML 과 CSS 를 내고, 쪽을 만드는 도구가 모두 그것을 부른다. 같은 HTML 을 도구마다 복사해 두지 않는다.
- **칸**: 왼쪽 로고(`/logo-256.png` + 「치즈감자」, 첫 화면으로) · 오른쪽 링크 넷 **TOPIK**(`/#learn/topik`) · **단어**(`/#words`) · **책**(`/shop/`) · **학습지**(`/worksheets/`) · 끝에 진한 단추 **무료로 배우기**(`/#learn`).
  - 쪽 말이 영어(`<html lang="en">` 등 한국어가 아닌 쪽)면 TOPIK · Words · Books · Worksheets · Start free.
  - 지금 쪽이 속한 칸은 표시(밑줄 등, `aria-current="page"`): TOPIK 쓰기 · 읽기 · 듣기 · EPS → TOPIK / 사전 · 단어 목록 · 「Korean word for」 → 단어 / `/shop/` → 책 / 학습지 → 학습지.
- **폭 · 높이**: 안쪽 최대 폭 1120px + 좌우 여백 PC 40 · 폰 20(로고 시작선이 첫 화면과 같아야 한다: 1280 폭에서 x=80, 390 폭에서 x=20). 높이 PC 약 64 · 폰 약 56(첫 화면 머리글과 같게).
- **폰(≤600px)**: 로고 · 「무료로 배우기」 · 메뉴 단추. 메뉴를 누르면 네 링크가 펼쳐진다. **인라인 `<script>` 금지(CSP)** — `<details>` 처럼 스크립트 없이 열리는 방법이거나, 외부 `.js` 파일이면 `tools/stamp.mjs` 의 `ASSETS` 에 넣는다.
- **글꼴**: Pretendard 먼저. **색**: 그 쪽에 있는 변수(`--bg` `--ink` `--ink-2`/`--ink2` `--line`)를 쓰고 없으면 같은 값으로 — 어두운 모드에서도 읽혀야 한다.
- 위에 붙어 있게(sticky). 인쇄할 때는 숨긴다.

## 어디를 바꾸나
- 도구(생성물은 손으로 고치지 않는다 — 도구를 고치고 돌린다): `tools/build-pages.mjs` · `tools/build-sheets.mjs`(상점 · 책 · 학습지) · `tools/build-worksheets.mjs` · `tools/build-downloads.mjs` · `tools/build-legal.mjs` · `tools/build-bonus.mjs`
- 손으로 쓴 쪽(도구가 없다 — 머리글 부분만 바꾼다): `about.html` `for-teachers.html` `privacy.html` `notices.html` `teacher.html` `my/eps-topik/index.html` `korean-name/` `korean-age/` `korean-birthday/` `korean-proverb/` `korean-word-today/` `korean-zodiac/` `my-korean-name/` `numbers-worksheet/` `hangul-worksheet/` (모두 `index.html`)
- 바꾸지 않는 것: `index.html`(첫 화면) · `app.js` · `app.module.js` · `app-views.css` · `insta.html` · 본문 · 바닥글 · 다른 디자인.

## 지킬 것
1. 디자인 약속 「선생님의 워크북」(CLAUDE.md §4): 종이 바탕 · 검정 잉크 · 얇은 줄 · 작은 모서리(5 · 8 · 10 · 12px). 이모지 아이콘 · 큰 그림자 · 그라데이션 · 알약 모양 금지.
2. 도구를 고친 뒤 모두 다시 돌린다: `node tools/build-sheets.mjs` · `build-legal` · `build-bonus` · `build-downloads` · `node tools/build-pages.mjs`.
3. `node tools/stamp.mjs && node tools/stamp.mjs --check` → `node tools/preflight.mjs` 통과 → `node tools/smoke.mjs` 오류 0.
4. 폭 390 · 1280 에서 가로 스크롤 · JS 오류 0. 머리글이 쪽마다 하나만 있어야 한다(옛 머리글이 남지 않게: `grep -rl '<header class="hd"' --include=*.html .` 이 `worksheet/pro/` 말고는 비어야 한다).

## 다 하면
- 브랜치 `ag/web-header` 에 커밋 · 푸시(main 에 머지하지 않는다).
- 채팅에 남길 것: ① 바꾼 도구 · 파일 목록 ② 아래 네 곳의 머리글 캡처(폭 390 메뉴 연 것 하나 포함, 1280) — `/topik-writing/` · `/shop/particles-workbook/` · `/dictionary/참기름.html` · `/worksheets/` ③ preflight · smoke 결과 ④ 고민한 점 · 다르게 한 점.
