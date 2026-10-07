# 안티 그래비티 지시서 — TOPIK 문항 고르게 채우기(읽기 번호마다 10 · 듣기 번호마다 6)

> 이 파일과 `AGENTS.md` 를 같이 붙여 넣는다. 첫 줄: 「AGENTS.md 를 먼저 읽고, 이 지시문대로만 해. 이번은 **N묶음**이야.」
> 브랜치: `topik-balance` (main 에서 새로). 이 지시서가 `docs/antigravity-topik-mock-more-task.md`(4 → 8회분)를 **대신한다**.

## 왜
운영자(2026-10-07): 「TOPIK 읽기 문항 수가 너무 불균형 — 다 맞추고, 이제 듣기도 만들 때」.
지금(2026-10-07 센 것) 번호(slot)마다 가진 문항 수가 들쭉날쭉하다 — 모의고사 회차는 **가장 적은 번호 수**만큼만 나온다.
- 읽기 I(`topik.js` TOPIK_READING, 209개): 31~33 · 49~56 · 59~70 은 **4개**, 34~37 · 42 는 6, 38~41 · 43~45 · 57~58 은 7, 46~48 은 8.
- 읽기 II(`topik2.js` TOPIK2_READING, 605개): 5~31 은 **19개**인데 1~4 · 32~50 은 **4개**.
- 듣기 I(`topik-listening.js`, 86개): 번호마다 2~4.
- 듣기 II(79개): 4~20 은 2~4, **21~50(긴 담화)은 0~1**.
목표: **읽기는 번호마다 10개**, **듣기는 번호마다 6개**(그림 자리 듣기 I 15 · 16, 듣기 II 1 · 2 · 3 은 빼고) → 모의고사 읽기 10회분 · 듣기 6회분.

## 묶음(한 번에 하나씩 올린다)
| 묶음 | 파일 | 할 것 | 대략 |
|---|---|---|---|
| 1 | `topik.js` | 읽기 I 31~48 번을 **10개씩** | 70 |
| 2 | `topik.js` | 읽기 I 49~70 번을 **10개씩**(짝 지문은 짝으로) | 121 |
| 3 | `topik2.js` | 읽기 II 1~4 · 32~41 번을 **10개씩** | 84 |
| 4 | `topik2.js` | 읽기 II 42~50 번을 **10개씩**(짝 지문은 짝으로) | 54 |
| 5 | JSON → `tools/add-listening.mjs` | 듣기 I 모든 번호를 **6개씩** | 82 |
| 6 | JSON → `tools/add-listening.mjs` | 듣기 II 4~20 번을 **6개씩** | 46 |
| 7 | JSON → `tools/add-listening.mjs` | 듣기 II 21~36 번(긴 담화, 짝)을 **6개씩** | 85 |
| 8 | JSON → `tools/add-listening.mjs` | 듣기 II 37~50 번(긴 담화, 짝)을 **6개씩** | 72 |
**시작 전에 그 묶음 번호의 지금 수를 직접 센다**(누가 그 사이 넣었을 수 있다) — 「10(또는 6) − 지금 수」만큼만 더한다. 이미 넘은 번호는 건드리지 않는다.

## 지킬 것 — 읽기(1~4묶음)
- `docs/antigravity-topik-mock-more-task.md` 의 「지킬 것」 그대로: 같은 번호 기존 문항과 **같은 모양 · 같은 type · genre**, id 는 파일 규칙대로 이어서, 짝 번호는 같은 지문 · `pair`, 정답 자리 고루, `why` 1~2문장.
- 확인: `node tools/check-topik.mjs` · `node tools/check-topik2.mjs`. 커밋은 `topik.js` 또는 `topik2.js` 하나만.

## 지킬 것 — 듣기(5~8묶음)
- `docs/antigravity-topik-listening-task.md` 의 「꼭 지킬 것」 · 「밭」 그대로(who 한 줄도 틀리지 않기 · 짝은 script 글자까지 같게 · 그림 자리 없음 · 보기를 번호로 가리키지 않기).
- id 는 **새 번호대**: TOPIK I `lI-201` ~, TOPIK II `lII-201` ~. pair 는 `lI-p31` ~, `lII-p31` ~.
- 긴 담화(TOPIK II 21~50)는 실제 시험처럼 **대담 · 강연 · 다큐 · 토론**을 고루 — 300~450자 대본, 사람 둘이면 `m` · `w` 를 번갈아.
- JSON 은 `docs/listening-balance-N.json` 으로 저장 → `node tools/add-listening.mjs docs/listening-balance-N.json` → `node tools/check-listening.mjs` 통과 → `topik-listening.js` 와 그 JSON 을 커밋.

## 공통
- **기출 아님**: 실제 TOPIK 문항 · 대본을 옮기거나 살짝 바꾸지 않는다. 기관 · 통계 · 법 · 제도 · 연구 결과를 사실처럼 쓰지 않는다.
- 도구(`tools/`) · 다른 파일은 고치지 않는다. 자국(stamp)은 Claude 가 main 기준으로 다시 찍는다.
- 커밋 메시지: `TOPIK 고르게 N묶음 — 읽기|듣기 X~Y번 Z개`
