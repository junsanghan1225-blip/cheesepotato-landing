# 안티 그래비티 작업 지시 — TOPIK I 낱말 채우기 (500개 한 묶음)

> 이 파일과 `AGENTS.md` 를 같이 붙여 넣는다. 첫 줄: 「AGENTS.md 를 먼저 읽고, 이 지시문대로만 해.」

## 왜
치즈감자에 「단어」 섹션을 만든다(`docs/vocab-plan.md`). 첫 대상은 TOPIK I 필수 낱말이다.
`vocab/data/topik1.json` 에 **씨앗 1,998개**가 있다 — 국립국어원 표준 교육과정 어휘 1 · 2급(1,781)과 우리 자료에서 더한
217개. 표제어 · 급수 · (있으면) 사전 영어 뜻 · 길잡이말(`hint`)만 있는 **C급**이다.
이것을 학습자가 바로 외울 수 있는 **B급**으로 올린다. 모양은 `docs/vocab-schema.md`.

## 이번 묶음: 파일의 **앞 500개**(1~500번째 줄)
파일은 우리 자료에 자주 나오는 순서로 서 있다. 앞에서부터 500개만 한다. 501번째부터는 다음 묶음이다(모두 4묶음).

낱말마다:
1. **pos** — 비었으면 채운다(명사 · 동사 · 형용사 · 부사 · 대명사 · 수사 · 관형사 · 감탄사 · 의존 명사).
   **en** — 비었으면 채운다(사전식 짧은 영어 뜻, 예: `to eat; to have a meal`). 채워져 있으면 고치지 않는다.
2. **topics** — `vocab/taxonomy.json` 에서 **1~3개**, 「대분류/소분류」 꼴(예: `food/dishes`).
   맞는 칸이 없으면 억지로 넣지 말고 가장 가까운 것 하나 + PR 설명에 「새 칸이 필요한 낱말」로 적는다.
   taxonomy 파일은 고치지 않는다.
3. **purposes** — `topik1` 은 그대로 두고, 맞으면 더한다: `intro`(첫 300개 수준의 아주 기초) ·
   `eps`(직장 · 안전 · 생활) · `life` · `travel` · `work` · `medical`.
4. **en_simple** — 학습자용 쉬운 영어 뜻 1~4단어(`to eat` · `friend` · `because of`). `en` 은 고치지 않는다.
5. **examples** — **두 개**로 맞춘다(이미 하나 있으면 하나 더).
   - 초급 문법만(-아요/어요 · -았/었어요 · -고 · -아서 · -(으)ㄹ 거예요 수준), 8~18글자 안팎.
   - 표제어가 문장에 들어가야 한다(활용형이면 된다). 검사기가 본다.
   - `en` 번역을 반드시 단다. 기존 예문의 번역이 비었으면 채운다.
   - `hint`(길잡이말, 예: 「가게에 가다」)가 있으면 그 짝말을 살려 쓴다 — 표준 교육과정이 권하는 쓰임이다.
   - 새로 쓴다 — 드라마 · 노래 · 기출 문장을 옮기지 않는다.
6. **rel** — 확실한 것만: `syn`(비슷한 말) · `ant`(반대말) · `hon`(높임말, 예: 먹다 → 드시다). 모르면 비운다.
7. **grade** — 위를 다 채웠으면 `"B"` 로 바꾼다.
8. **level** — 2급 낱말이 1급으로 적혀 있으면 2 로 고친다(자신 있을 때만). 3급 이상이라고 보이면
   고치지 말고 PR 설명의 「급수가 이상한 낱말」에 적는다.

**손대지 않는 것:** `id` · `head` · `freq` · `src` · `std` · `hint` · 채워진 `en`, 그리고 501번째 줄부터.
낱말이 아닌 것(어미 조각 · 사람 이름 「민수」 같은)이 보이면 지우지 말고 PR 설명에 적는다.

## 순서
```bash
git checkout main && git pull origin main
git checkout -b vocab-topik1-b1
# vocab/data/topik1.json 의 1~500번째 줄을 채운다 — 한 줄에 낱말 하나 모양을 지킨다
node tools/check-vocab.mjs        # 「고쳐야 할 것」 0 · B급 500
git add vocab/data/topik1.json
git commit -m "vocab: TOPIK I batch 1 (1–500) to grade B"
git pull origin main
node tools/stamp.mjs && node tools/stamp.mjs --check
git push -u origin vocab-topik1-b1
```
**`git push` 까지 해야 끝이다** — 올리지 않으면 운영자와 Claude 가 볼 수 없다.

## PR 설명에 적을 것
- B급이 된 수, `check-vocab` 결과(짚어 둘 것 수)
- 새 주제 칸이 필요한 낱말 · 급수가 이상한 낱말 · 낱말이 아닌 줄
