# 안티 그래비티 작업 지시 — 낱말 뜻풀이 채우기

> 이 파일 전체를 안티 그래비티에 그대로 붙여 넣는다.

---

## 너의 일

`everykoreans.com` 저장소(`cheesepotato-landing`)에서, 읽기 지문에 나오는데
**사전에 뜻이 없는 낱말**의 영어 뜻풀이를 채운다.

지금 학습자가 지문에서 낱말을 누르면 **4번에 1번은 뜻이 안 나온다.**
TOPIK II 읽기 지문을 600개 넘게 들이면서 사전이 못 따라갔다.

| | 지금 | 목표 |
|---|---:|---:|
| 나온 횟수로 센 비율 | 77% | **90% 이상** |
| 가짓수로 센 비율 | 57% | (신경 쓰지 않는다) |

숫자는 `node tools/check-glossary.mjs` 출력의 「나온 횟수로 세면 … (NN%)」 줄이다.
**나온 횟수가 기준이다** — 학습자가 실제로 마주치는 것은 자주 나오는 낱말이다.

---

## 작업 순서 (한 묶음 = 200개, 목표에 닿을 때까지 반복)

```bash
git checkout main && git pull origin main
git checkout -b glossary-fill            # 처음 한 번만

# 1. 채울 차례를 뽑는다 (자주 나오는 순, 이미 있는 것은 빠진다)
node tools/glossary-words.mjs 200 > /tmp/words.tsv

# 2. /tmp/words.tsv 를 보고 아래 「규칙」대로 JSON 을 만든다 → /tmp/got.json

# 3. 넣기 전에 검사기로 훑는다. 경고가 나오면 그 줄을 고치거나 뺀다
node tools/add-glossary-words.mjs /tmp/got.json --dry

# 4. 문제 없으면 넣고 굽는다
node tools/add-glossary-words.mjs /tmp/got.json
node tools/build-glossary.mjs
node tools/check-glossary.mjs            # 비율이 올랐는지 확인
node tools/stamp.mjs

# 5. 묶음마다 커밋한다
git add -A && git commit -m "glossary: +N words (coverage NN%)"
```

목표(90%)에 닿으면 멈추고, 아래 「끝낼 때」를 한다.

`/tmp/words.tsv` 는 탭으로 나뉜 세 칸이다: `낱말`, `나온 횟수`, `처음 나온 문장`.

---

## 규칙 — JSON 만들기

**JSON 배열 하나.** 줄 하나의 모양:

```json
{ "ko": "표제어", "en": "English gloss", "alt": ["활용형", "활용형"] }
```

### `ko` — 사전에 실리는 꼴
- 활용형이면 기본형으로: 「중단되었다」→ `중단되다`, 「떠올라」→ `떠오르다`.
- 조사가 붙었으면 뗀다: 「주말에」→ `주말`.
- 한글만. 숫자·괄호·공백 금지.

### `en` — 영어 뜻 (반드시 있어야 한다)
- 짧게. 두세 낱말, **60자 이하.**
- 뜻이 여럿이면 `;` 로 **두 개까지만**: `eye; snow`.
- 동사·형용사는 `to …`: `to eat`, `to be good` (형용사도 `to be …`).
- 한글을 섞지 않는다.
- **예문의 쓰임에 맞는 뜻을 앞에.** 「시장에서 옷을 샀다」면 `market` 이지 `mayor` 가 아니다.

### `alt` — 지문에 실제로 나온 활용형
- `/tmp/words.tsv` 에 보이는 꼴만. **있을 법한 꼴을 지어내지 않는다.**
- 한 활용형이 두 표제어에 갈 수 있으면(「삽니다」= 사다/살다) **양쪽 다 빼다.**
- 없으면 칸을 뺀다.

### 반드시 뺄 것
1. **확신이 없는 낱말.** 틀린 뜻은 학습자가 외워 버린다. 빈 칸이 틀린 뜻보다 낫다.
2. **사람 이름·지명·기관 이름.** 민수, 지현, 인주시, ○○센터 …
3. **문제지 말.** 고르십시오, 알맞은, 것을 …
4. **순서 문제의 보기 조각.** `다나가라`, `나가다라`, `가나라다` 처럼 (가)(나)(다)(라)를 이어 붙인 것.
5. **낱말이 잘려 나온 조각.** `스스`(← 스스로) 처럼 예문을 보면 더 긴 낱말의 일부인 것.
   이런 건 온전한 낱말(`스스로`)이 이미 사전에 있는지 보고, 없으면 온전한 꼴로 넣는다.

### 보기

받은 줄:
```
이상	36	만 19세 이상 신체 건강한 성인이라면 누구나 참여할 수 있습니다.
하천	36	하천 정화와 재활용 캠페인에 앞장설 청소년을 모집합니다.
다나가라	34	(다)-(나)-(가)-(라)
중단되었다	10	공사가 중단되었다.
```

만들 것:
```json
[
  { "ko": "이상", "en": "or more; above" },
  { "ko": "하천", "en": "river; stream" },
  { "ko": "중단되다", "en": "to be stopped", "alt": ["중단되었다"] }
]
```
`다나가라`는 순서 문제 보기라 뺐다.

---

## 하지 말 것

- `glossary.js`, `glossary-<말>.js` 를 **손으로 고치지 않는다.** 생성물이다 —
  원본은 `docs/glossary.json` 이고 `add-glossary-words.mjs` 로만 넣는다.
- `docs/glossary-krdict.json` 은 건드리지 않는다 (국립국어원 자료, 라이선스가 다르다).
- 영어 말고 다른 말(`ja`, `vi` …)은 이번에 넣지 않는다. 영어만.
- `main` 에 바로 밀지 않는다. 브랜치에서 작업한다.

---

## 끝낼 때

아래가 전부 통과해야 한다 (GitHub Actions 도 같은 것을 돌린다):

```bash
node tools/stamp.mjs --check
node tools/check-glossary.mjs
node tools/check-geo.mjs          # 첫 쪽의 「낱말 N개」 숫자가 늘어서 걸릴 수 있다
node tools/check-data.mjs
```

`check-geo.mjs` 가 「낱말」 숫자가 다르다고 하면 `index.html` 과 `llms.txt` 의
낱말 수(지금 5,358)를 검사기가 말하는 실제 값으로 **전부** 바꾼다
(meta description · JSON-LD · FAQ · 본문 · `llms.txt`). 다시 돌려서 「문제 없음」을 본다.

그다음 `git push -u origin glossary-fill` 하고 PR 을 연다. PR 설명에 적을 것:
- 넣은 낱말 수
- 비율 변화 (예: 77% → 91%)
- 확신이 없어서 뺀 낱말 중 자주 나오는 것 10개 (사람이 나중에 볼 수 있게)
