# 안티 그래비티 작업 지시 — KDP 이야기 책의 영어 번역 다듬기

> 이 파일과 `AGENTS.md` 를 같이 붙여 넣는다. 첫 줄: 「AGENTS.md 를 먼저 읽고, 이 지시문대로만 해. 이번 묶음은 **이야기 N편 (번호 a~b)** 의 **영어만** 다듬는 일이야.」
> 브랜치: `ag/kdp-polish-N` (main 에서 새로). 한 묶음 = 10편(1~10 · 11~20 · 21~30 · 31~40). 계획: `docs/plans/kdp-original.md`. 운영자 2026-10-28.
> 대상: `docs/kdp-orig/short-stories.json`(Amazon Kindle 책 「Korean Short Stories for Beginners」). **한국어 · 구조는 건드리지 않고 영어만** 자연스럽게 고친다.

## 왜
영어가 한국어를 말 그대로 옮겨서 어색한 곳이 있다(예: 「Holding the box filled with devotion, her steps walking out were light」, 「went on appointment time」). 독자는 영어권 한국어 학습자다. **영어만 읽어도 자연스러운 이야기**여야 책 평점이 오른다.

## 무엇을 고치나 (이 칸의 영어만)
- `title.en` · `lines[].en` · `vocab[].en` · `check[].q` · `check[].a`.
- **`ko` 는 한 글자도 바꾸지 않는다.** `no` · `level` · 줄 수 · 낱말 수 · 문제 수 · 순서도 그대로.

## 고치는 법
1. **뜻은 그대로, 영어는 자연스럽게.** 한국어에 없는 내용을 더하거나 빼지 않는다. 한 줄 = 영어 한 문장(한국어 한 줄과 1:1).
2. **시제를 통일**한다. 한국어가 「-했어요 · -해요」 어느 쪽이든 이야기는 **과거 시제**로 일관하게(대화 · 일반 사실은 현재 가능). 한 이야기 안에서 시제가 섞이지 않게.
3. **주어를 분명히.** 한국어가 주어를 생략해도 영어는 이름(Minsu · Jisu · Hana)이나 he / she / they 를 쓴다. 한 이야기 안에서 같은 사람은 같은 대명사. 이름은 영어 이름 표기를 바꾸지 않는다.
4. **직역투를 없앤다.** 예: 「heart pounded」 → 「his heart raced」, 「heart felt deeply touched」 → 「felt deeply moved」, 「walked out with a light heart」 그대로 OK. 영어 사용자가 실제로 쓰는 말로. 단 어려운 영어 낱말은 피한다(독자는 초급).
5. **길이는 한국어 한 줄과 비슷하게.** 한 줄을 두 문장으로 쪼개지 않는다.
6. **낱말(`vocab[].en`)**: 뜻 1~2개, 가장 흔한 뜻 먼저(예: `to pick up`). 설명문 쓰지 않는다.
7. **이해 문제(`check`)**: 질문은 완전한 영어 문장, 답은 **본문에 있는 내용으로 한 문장**. 질문에 나오는 인물 · 사물이 이야기 본문에 실제로 있어야 한다.
8. 고유한 사실을 지어내지 않는다 — 실제 기관 · 인물 · 가격 · 전화번호 · 법 · 제도를 넣지 않는다(이야기는 전부 창작).

## 검사 (올리기 전에 꼭)
```
node tools/check-kdp-polish.mjs
```
`main` 과 비교해 **ko · 구조가 바뀌었는지**, 줄 · 낱말 · 문제 수가 같은지, 영어 칸이 비지 않았는지 본다. 통과해야 한다.

## 올리기
- 커밋: `docs/kdp-orig/short-stories.json` 만. 메시지: `KDP 번역 다듬기 N묶음 — a~b번`. 푸시까지 해야 끝(PR 은 만들지 않는다). Claude 가 검토해 넣는다.
