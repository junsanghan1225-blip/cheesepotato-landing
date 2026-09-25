# 안티 그래비티 작업 지시 — 여행 가이드 영어 글 늘리기

> 이 파일 전체를 안티 그래비티에 붙여 넣는다.

## 왜 다시 하나

지난번(`blog-en-longer` 브랜치)에 이 글만 **늘린 게 아니라 통째로 새로 썼다.** 원래 있던 38개
블록이 하나도 안 남았고, 이 글에서 가장 중요한 것이 빠졌다.

- 「쉬운 말 · 보통 말 · 정확한 말」 **3단계 말하기** 설명
- 상황마다 붙은 **대화(dlg)** 와 **예문(ex)**
- 사이트의 여행 도구로 가는 링크 — **`/travel-guide.html`(포켓 팜플렛 PDF)** 과 **`/record-travel.html`(녹음 스튜디오)**

그래서 그 한 편은 사이트에 넣지 않았다. 이번에는 **원래 글을 그대로 두고 덧붙인다.**

| id | 지금 | 목표 |
|---|---:|---|
| `travel-korean-survival-guide-english` | 522낱말 | **900~1,200낱말** |

## 순서

```bash
git checkout main && git pull origin main
git checkout -b blog-en-travel

# 지금 글 (이것이 바탕이다)
node -e "import('./blog.js').then(m=>console.log(JSON.stringify(m.BLOG_POSTS.find(p=>p.id==='travel-korean-survival-guide-english'),null,1)))" > /tmp/now.json

# 블록 모양 · gram id 목록 · 걸어도 되는 주소 목록
node tools/blog-prompt.mjs --en beginner "travel Korean" > /tmp/rules.txt
```

`/tmp/now.json` 을 **복사해서** `/tmp/got.json` 을 만들고, 거기에 **더하기만** 한다.

## 반드시 지킬 것

1. **원래 블록 38개를 하나도 지우거나 고치지 않는다.** 순서도 그대로. 새 블록은 원래 블록
   **사이나 뒤에 끼워 넣는다.** (소제목 `h` 아래에 설명·예문을 더 붙이는 식)
2. 아래 네 가지는 **꼭 남아 있어야 한다** — 검사 명령이 본다.
   - `{ t:'link', href:'/travel-guide.html' … }`
   - `{ t:'link', href:'/record-travel.html' … }`
   - `{ t:'gram', id:'30-1' … }`
   - 「3-Tier Approach」 소제목과 그 아래 목록
3. **`title` 은 바꾸지 않는다** — 「43 Essential Phrases」가 글 속 구문 수와 맞다. 구문을 더 넣으면
   제목 숫자도 **실제로 센 수**로 고치고, 첫 문단의 「43」도 같이 고친다.
4. 한국어 예문은 **맞는 것만.** 자신 없는 문장은 넣지 않는다. 존댓말(-요/-습니다)로 쓴다 —
   여행자가 처음 보는 사람에게 쓰는 말이다.

## 덧붙이기 좋은 것

- **숙소(체크인·체크아웃·짐 맡기기)** — 원래 글에 없는 상황이다. 새 소제목 하나.
- 상황마다 **자주 하는 실수** 한두 개 (틀린 말 → 고친 말, `ex`)
- **발음 팁** — 「감사합니다」를 [감사함니다]로 읽는 것처럼 글자와 소리가 다른 곳
- **FAQ** 3~4개 — 검색어 그대로 묻는 문장. 예: "Do I need to speak Korean to travel in Seoul?",
  "Is English widely spoken in Korea?", "What is the most useful Korean phrase for travelers?"
- 마지막 「Practice Tools」 소제목 앞에 **짧은 정리 목록**(꼭 외울 다섯 마디)

## 다 쓰면 검사

```bash
# 1) 원래 블록이 다 남아 있는지 — 「빠진 블록 0」이어야 한다
node -e "
const a=require('/tmp/now.json'), b=require('/tmp/got.json'), S=JSON.stringify;
const have=new Set(b.blocks.map(S)); const lost=a.blocks.filter(x=>!have.has(S(x)));
console.log('원래', a.blocks.length, '→ 새', b.blocks.length, '· 빠진 블록', lost.length);
lost.forEach(x=>console.log('  빠짐:', S(x).slice(0,100)));
for (const h of ['/travel-guide.html','/record-travel.html']) if(!b.blocks.some(x=>x.href===h)) console.log('  링크 빠짐:', h);
process.exit(lost.length?1:0)"

# 2) 바꿔 넣고 검사
node tools/blog-merge.mjs /tmp/got.json --replace --dry
node tools/blog-merge.mjs /tmp/got.json --replace
node tools/check-blog.mjs          # 「고쳐야 할 것」 0 · 이 글이 800 밑 목록에서 빠졌는지
node tools/build-pages.mjs && node tools/stamp.mjs && node tools/stamp.mjs --check
```

**1번에서 「빠진 블록」이 하나라도 나오면 멈추고 고친다.** 그것이 지난번에 틀린 자리다.

```bash
git add -A && git commit -m "blog(en): extend travel-korean-survival-guide-english (522 → N words)"
git push -u origin blog-en-travel
```

## 하지 말 것

- `blog.js` 를 손으로 고치지 않는다 — `blog-merge.mjs --replace` 로만.
- 다른 글은 건드리지 않는다. 한국어 짝 글(`travel-korean-survival-guide`)도.
- `tools/` 밑의 도구를 고치지 않는다. 지난번 브랜치는 도구를 따로 고쳐서 main 과 충돌했다.
- **`stamp.mjs --check` 를 건너뛰지 않는다.** 지난 두 작업 모두 자국이 빠져 있었다.

PR 설명에 **전 → 후 낱말 수**와 **1번 검사 결과**(원래 38 → 새 N, 빠진 블록 0)를 적는다.
