# 안티 그래비티 작업 지시 — TOPIK 쓰기 보강

> 이 파일 전체를 안티 그래비티에 붙여 넣는다.

## 왜

TOPIK 쓰기 53·54번에는 **AI 채점**(`supabase/functions/grade-writing`)이 붙어 있다. AI 는 문항의
`points`(채점 포인트) · `model`(모범답안) · `samples`(점수를 매긴 예시 답안)를 **그대로 채점 기준으로
쓴다.** 이 칸이 틀리면 학생이 받는 점수가 틀린다 — 그래서 이번 일은 **양보다 정확성**이다.

지금: 58문항 — 51번 20 · 52번 17 · 53번 11 · 54번 10.

## 할 일 — 세 단계, 단계마다 커밋 하나

### 1단계 — 이미 있는 54번 고치기 (가장 먼저, 가장 중요)

`node tools/check-writing.mjs` 를 돌리면 「짚어 둘 것」이 30건 나온다. 전부 없앤다.

- **w54-1 ~ w54-10 의 예시 답안마다 `scores` 를 넣는다.** 53번 문항(`w53-1`)처럼
  `scores: { content, structure, language }`. 54번 배점은 **내용 및 과제 수행 12 · 글의 전개 구조 12 ·
  언어 사용 26**(합 50). 세 칸을 더한 값이 **지금 적힌 `total` 과 정확히 같아야** 한다 — 검사기가 센다.
  `total` 을 바꾸지 말고, 그 `total` 이 왜 나왔는지 `why` 를 읽고 세 칸으로 나눈다.
- **w54-2 · w54-3 에 빠진 「하」 예시 답안을 채운다**(상 · 중 · 하 차례, 상 > 중 > 하).

```bash
git checkout main && git pull origin main
git checkout -b topik-writing-more
# … 고친 뒤
node tools/check-writing.mjs      # 「짚어 둘 것」 0건 · 「이상 없음」
git commit -am "topik writing: scores for Q54 samples, 하 samples for w54-2/3"
```

### 2단계 — 53 · 54번을 30개씩 (새로 53번 19 · 54번 20)

### 3단계 — 51 · 52번을 30개씩 (새로 51번 10 · 52번 13)

`topik-writing.js` 의 `TW_ITEMS` 에 더한다. **같은 번호끼리 모아서**, id 는 그 번호의 다음 수
(`w53-12`, `w53-13` …). 모양은 이미 있는 문항을 그대로 따른다 — `w51-1` · `w52-1` · `w53-1` · `w54-1`
을 먼저 읽는다. 2단계를 53번 · 54번 두 커밋으로 나눠도 된다.

## 번호마다 반드시 있어야 하는 것

**51 · 52번** — `blanks` 둘(`㉠` · `㉡`), 지문에 `( ㉠ )` · `( ㉡ )` 자리, 빈칸마다 `answers` 2~3개와 `point`.
51번은 실용문(안내 · 초대 · 문의 · 공지, `register: 'formal'`), 52번은 설명문(`register: 'plain'`).
빈칸의 정답은 **앞뒤 문장만 보고 하나로 좁혀져야** 한다. 여러 답이 되면 `answers` 에 다 넣는다.

**53번** — 표 · 그래프 설명 200~300자.
- `data` 셋 이상(조사 기관 · 대상 · 수치 변화 · 원인/전망), `tasks` 셋, `min: 200, max: 300`, `register: 'plain'`
- `points` 셋(content · structure · language), `deduct` 셋 이상
- `model` **200~300자**(띄어쓰기 포함, 검사기가 센다), `-(느)ㄴ다체`
- `samples` 상 · 중 · 하 셋. 배점 **7 · 7 · 16**(합 30)

**54번** — 논술 600~700자. 53번과 같고, `data` 대신 `tasks` 셋, `min: 600, max: 700`.
배점 **12 · 12 · 26**(합 50).

## 예시 답안(samples) — 가장 중요

AI 는 이 셋을 보고 **점수의 눈높이**를 맞춘다.

| | 53번 total | 54번 total | 모습 |
|---|---|---|---|
| 상 | 26~29 | 44~49 | 과제를 다 채우고, 문단 · 연결이 자연스럽고, 문체가 한결같다. **분량을 채운다** |
| 중 | 17~22 | 28~35 | 과제는 거의 채웠지만 문단을 안 나누거나, 어휘가 단순하거나, 문체가 한두 번 섞인다 |
| 하 | 8~14 | 12~22 | 분량이 모자라거나, 과제를 빠뜨리거나, 해요체로 쓰거나, 문법 오류가 잦다 |

- 모든 예시에 `level` · `total` · `scores{content, structure, language}` · `text` · `why`.
  **`scores` 를 더하면 `total`**, 칸마다 배점을 넘지 않는다.
- 「중」 · 「하」는 **실제 학습자가 쓸 법한 실수**(조사 빠뜨림 · -습니다 섞임 · 같은 말 되풀이 · 과제 하나
  빠뜨림)를 넣는다. 일부러 엉터리로 쓰지 않는다.
- `why` 에 글자 수를 적으면(「132자로 분량 미달」) **실제 글자 수와 맞아야** 한다 — 검사기가 센다.
- `why` 는 **어느 영역에서 왜 깎였는지**를 한두 문장으로. 「언어 사용에서 합니다체가 섞여 크게 깎였다」처럼.

## 주제와 내용

- **기출 문제를 옮기지 않는다.** 실제 TOPIK 에 나온 주제 · 자료 · 질문을 그대로 쓰지 않는다. 형식과 난이도만
  따르고 내용은 새로 쓴다.
- 53번: 통계 · 설문(전기차 · 온라인 수업 · 외국인 관광객 · 반려동물 · 재택근무 · 배달 음식 · 중고 거래 …).
  이미 있는 주제와 겹치지 않게(`node -e "import('./topik-writing.js').then(m=>m.TW_ITEMS.filter(x=>x.q===53).forEach(x=>console.log(x.title)))"`
  로 먼저 본다). 수치는 **그럴듯하되 지어낸 것**, 기관은 가상(「한국통계연구원」처럼) — 실제 기관 이름을 쓰지 않는다.
  수치끼리 앞뒤가 맞아야 한다(비율 합 · 증감폭 계산).
- 54번: 사회 · 교육 · 기술 · 환경 · 직업(인공지능과 일자리 · 칭찬의 효과 · 조기 교육 · 소비 습관 …).
  질문 셋은 「의미/중요성 → 문제/원인 → 해결/노력」 흐름. 한쪽 입장을 강요하는 주제(정치 · 종교)는 피한다.

## 다 쓰면

```bash
node tools/check-writing.mjs     # 「고쳐야 할 것」 0 · 「짚어 둘 것」 0
node tools/check-courses.mjs && node tools/check-geo.mjs
node tools/build-pages.mjs       # topik-writing/ 쪽과 AI 채점용 items.json 이 새로 생긴다
git pull origin main             # 올리기 직전에 main 을 한 번 더 받는다
node tools/stamp.mjs && node tools/stamp.mjs --check
git add -A && git commit -m "topik writing: …"
git push -u origin topik-writing-more
```

- `check-geo` 가 멈추면 **첫 쪽 · llms.txt 의 쓰기 문항 수**가 옛 값이라는 뜻이다 — 검사기가 말하는 값으로
  `index.html` 과 `llms.txt` 의 숫자만 고친다(「TOPIK 쓰기 58」 → 새 수, 「TOPIK 문항 917」 → 새 합).
- **stamp 는 반드시 마지막에, main 을 받은 뒤에** 돌린다. 예전에 main 보다 뒤처진 자국을 올려서 사이트에 예전
  파일이 나온 적이 있다.

## 하지 말 것

- `tools/` 의 도구를 고치지 않는다. 검사기를 통과시키려고 검사기를 바꾸지 않는다 — 막히면 문항을 고친다.
- 이미 있는 문항의 id 를 바꾸지 않는다(학생 기록이 id 에 붙어 있다). 1단계에서 `total` 도 바꾸지 않는다.
- `app.module.js` 를 고치지 않는다. `index.html` · `llms.txt` 는 숫자만.
- `stamp.mjs --check` 를 건너뛰지 않는다.

PR 설명에 단계별로 한 일, 번호별 전 → 후 수, `check-writing` 결과를 적는다.
