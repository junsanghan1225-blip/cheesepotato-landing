# 안티 그래비티 작업 — 문법 표현마다 「같이 알면 좋은 단어」 (1묶음: 초급 112개)

> 배경: `docs/grammar-plan.md` 4 — 문법은 늘 같이 다니는 말과 한 덩어리로 외울 때 빨리 쓴다.
> 문법 쪽(사이트 「문법」 섹션)에 표현마다 낱말 3~5개와 짧은 예를 붙인다. Claude 가 검토해 화면에 넣는다.

## 할 일

1. `main` 에서 새 브랜치: `git checkout -b grammar-words-b1 origin/main`
2. `sentences.js` 의 `SB_CATS` 에서 **`lv: 'beginner'` 인 표현 112개**를 차례대로 본다(`id` · `name` · `desc` · `ex`).
   `SB_MORE[id]` 의 둘째 칸(자주 함께 쓰는 말)이 있으면 참고한다.
3. 표현마다 **같이 자주 쓰는 낱말 3~5개**를 고르고, 낱말마다 그 문법과 함께 쓴 **짧은 예 하나**와 영어 뜻을 단다.
4. 결과를 `docs/grammar-words.json` 한 파일에 쓴다(아래 모양). 표현 112개 모두.
5. 검사: `node -e "JSON.parse(require('fs').readFileSync('docs/grammar-words.json','utf8'))" && echo ok`
6. `git add docs/grammar-words.json && git commit -m "grammar words: beginner 112" && git push -u origin grammar-words-b1`

PR 은 열지 않는다 — Claude 가 검토하고 연다. **`git push` 까지 꼭 한다.**

## 파일 모양

```json
{
  "28-6": {
    "words": [
      ["음악을 듣다", "음악을 들으면서 공부해요.", "listen to music"],
      ["걷다", "걸으면서 이야기해요.", "walk"],
      ["운전하다", "운전하면서 전화하면 안 돼요.", "drive"]
    ],
    "note": ""
  }
}
```

- 열쇠는 표현의 `id` 그대로(`"28-6"`). 칸은 `[낱말 또는 짧은 덩어리, 그 문법을 쓴 예, 영어]`.
- 예는 **15자 안팎의 짧은 한 문장**, 해요체. 그 표현이 실제로 들어가야 한다(「-(으)면서」면 「…면서」).
- 낱말은 **TOPIK I 수준의 흔한 말**을 먼저 고른다. 사이트의 `vocab-topik1.js` 에 있는 말이면 더 좋다.
- 확실하지 않으면 그 표현은 `"words": []` 로 두고 `"note"` 에 까닭을 적는다. 억지로 채우지 않는다.

## 반드시 지킬 것

- **다른 파일을 고치지 않는다** — `sentences*.js` · 도구(`tools/`) · 화면 파일 모두. 새 파일 `docs/grammar-words.json` 하나만.
- 예는 전부 새로 쓴다. 교재 · 기출 · 다른 사이트의 문장을 옮기지 않는다. 사람 이름 · 상표 · 실제 기관을 넣지 않는다.
- 한자를 쓰지 않는다.
- 그 문법을 **틀리게 쓴 예를 넣지 않는다** — 받침(먹으면서 · 가면서), 불규칙(들으면서 · 도우면서 · 사니까)을 꼭 맞춘다.
- 뜻이 어색한 짝을 넣지 않는다(「-아/어 있다」에 「먹다」 같은 것).
- **파일을 CRLF 로 저장하지 않는다**(LF 그대로). UTF-8.

## 검토 기록

(Claude 가 받은 뒤 적는다.)
