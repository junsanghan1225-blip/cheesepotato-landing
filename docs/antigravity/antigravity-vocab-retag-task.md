# 안티 그래비티 작업 지시 — 낱말 주제 다시 붙이기 (1,000개 한 묶음)

> 이 파일과 `AGENTS.md` 를 같이 붙여 넣는다. 첫 줄: 「AGENTS.md 를 먼저 읽고, 이 지시문대로만 해. 이번은 **N묶음**이야.」
> (N 은 운영자가 적는다 — 1 ~ 11. 브랜치 이름: `vocab-retag`)

## 왜
운영자 요청(2026-10-07): 「감정 · 신체 · 학용품 · 정치 · 전자기기처럼 **주제를 잘게** 나눠 줘 — 매핑은 철저하게」.
`vocab/taxonomy.json` 에 **작은 주제 71칸을 새로 더했다**(옛 95칸은 그대로 → 모두 166칸). 지금 낱말은 옛 칸에만 붙어 있어서
「말 · 의견」(1,496개) · 「태도」(950개)처럼 너무 큰 칸이 있다. 낱말마다 **새 칸을 더 붙여** 학생 · 선생님이 작은 주제로 찾게 한다.

## 새로 생긴 칸(이번에 붙일 것)
`vocab/taxonomy.json` 에서 2026-10-07 에 더해진 칸들 — 예:
- 감정: `feelings/joy` 기쁨 · `feelings/sadness` 슬픔 · `feelings/anger` 화 · `feelings/fear` 걱정 · 두려움 · `feelings/love` 사랑 · 그리움 · `feelings/shame` 부끄러움 · `feelings/calm` 편안함 · `feelings/desire` 바람 · 의지
- 몸: `body/face` · `body/inside` · `body/movement` · `body/senses` · `body/beauty`
- 학교: `school/supplies` 학용품 · `school/classroom` · `school/grades` · `school/academic`
- 사회: `society/politics` 정치 · 선거 · `society/justice` 법 · 재판 · 범죄 · `society/welfare` · `society/population` · `society/global` · `society/military`
- 과학 · 기술: `tech/devices` 전자기기 · `tech/internet` · `tech/computer` · `tech/ai-future` · `tech/energy`
- 그 밖: 음식(과일 · 채소 · 고기 · 간식 · 주방 · 한식) · 집(가전 · 욕실 · 이사) · 일상(잠 · 식사 · 액세서리 · 달력 · 우편) · 교통(운전 · 사고 · 대중교통) · 일(회의 · 사업 · 서비스) · 말(찬반 · 설명 · 생각 · 사과/감사 · 다툼) · 여가(음악 · 영화 · 게임 · 야외 · 독서 · 미술) · 자연(재해 · 바다/산 · 곤충 · 우주) · 문화(종교 · 역사 · 한류) · 개념(순서 · 양 · 원인 · 비교) · 사람(친구 · 연애 · 결혼)
전체 목록은 **반드시 `vocab/taxonomy.json` 에서 읽는다**(id 를 지어내지 않는다).

## 이번 묶음: 파일 차례대로 1,000개
- 1묶음 = `vocab/data/topik1.json` 1~1,000번째, 2묶음 = 1,001번째~끝(931개)
- 3묶음부터 `vocab/data/topik2.json` — 3묶음 = 1~1,000번째, 4묶음 = 1,001~2,000 … 11묶음 = 8,001~끝

## 낱말마다 할 일 — `topics` 배열만
1. 지금 있는 `topics` 는 **그대로 둔다**(지우지도 순서를 바꾸지도 않는다).
2. 새 칸 중 **이 낱말의 뜻(`en`)에 딱 맞는 것**을 **0~2개** 뒤에 더한다. 맞는 것이 없으면 더하지 않는다(많은 낱말이 0개다 — 그게 맞다).
   - 예: 연필 → `school/supplies` · 노트북 → `tech/devices`, `tech/computer` · 선거 → `society/politics` · 서운하다 → `feelings/sadness` · 어깨 → (이미 body/parts — 더할 것 없음) · 눈썹 → `body/face`
   - 같은 소리의 다른 낱말에 주의 — **자료의 `en` 을 보고** 붙인다(눈 = eye 면 body/face, snow 면 nature …).
3. 다른 칸(`head` · `pos` · `level` · `en` · `examples` · `rel` · `hanja` · `src` · `grade` · `lv` …)은 **한 글자도** 바꾸지 않는다.
4. `vocab-topik1.js` · `vocab-topik2.js` 를 만들지 않는다(`build-vocab` 을 돌리지 않는다) — Claude 가 main 기준으로 굽는다.

## 올리기
- 검사: `node tools/check-vocab.mjs`(새 칸 id 가 taxonomy 에 있는지 본다)
- 커밋에는 `vocab/data/topik1.json` 또는 `topik2.json` 하나만. 한 묶음씩 올린다.
- 커밋 메시지: `낱말 주제 다시 붙이기 N묶음 (topik?.json a~b번째, 더한 칸 X개)`
