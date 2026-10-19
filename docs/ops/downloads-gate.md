# 낱말 · 문법 내려받기 문 (B — 진짜로 막기) · 2026-10-19

로그인해야 받는 CSV · Anki 파일은 **사이트에 두지 않는다.** Supabase 비공개 저장 칸 `downloads-private` 에만 있고,
로그인한 사람이 `/download/?f=…` 에서 임시 주소(60초)를 받아 내려받는다. 로그인하지 않으면 받을 수 없다.

- 로그인 없이 받는 것(맛보기): TOPIK 1 · 2급 낱말 파일 4개(`downloads/`) — `tools/build-downloads.mjs` 의 `FREE`.
- 로그인해야 받는 것: 3~6급 · TOPIK I 전체 · II 전체 · 전체 · 문법 290개(CSV · Anki) — `private-downloads/`(저장소에 안 둠).
- 낱말 원자료 자체(`vocab/data`)는 사이트 학습 화면이 쓰므로 공개다 — 막는 것은 **내려받기용 묶음 파일**이다. 이 문서가 막지 못하는 것: 학습 화면의 자료를 직접 긁어 가는 일.
- 저장소가 공개라면 **예전 커밋 기록에 옛 파일이 남아 있다**(되돌릴 수 없음). 앞으로 새로 만든 파일부터 막힌다.

## 처음 한 번 (운영자)
1. Supabase → **SQL Editor** → `db/add_downloads.sql` 붙여 넣고 **Run**.
2. (이 PR 을 main 에 합친 뒤) GitHub → Actions → **downloads-sync** → **Run workflow** → 초록 ✓ 이면 비공개 저장 칸에 파일 16개가 올라간 것.
   (`SUPABASE_SERVICE_KEY` 는 쇼츠 공장에서 넣은 것을 같이 쓴다.)
3. 시험: 로그인한 브라우저로 `https://everykoreans.com/topik-vocabulary-list/` → 3급 「CSV 🔒」 → 다운로드가 시작되면 성공.
   로그아웃한 창에서는 「Sign in to download」가 떠야 한다.

## 자료가 바뀌면
- 낱말 · 문법 자료가 main 에 들어가면 `downloads-sync` 가 저절로 다시 굽고 올린다(`vocab/data/**` · `sentences*.js` · `grammar-en.js` 가 바뀔 때).
- 어느 파일을 맛보기로 둘지는 `tools/build-downloads.mjs` 의 `FREE` 에서 고친다.
- 합치고 액션을 돌리기 **전까지는** 로그인해도 3급 이상 파일이 받아지지 않는다(저장 칸이 비어 있어서) — 합친 직후 액션을 돌리면 몇 분이다.
