# 안티 그래비티에 넘길 일

크레딧이 많이 드는 반복 작업만 모았다. 순서대로 하면 된다.

---

## 1. 영어 블로그 글 늘리기 (개선안 5번)

문법 설명 영어(`docs/grammar-en.json`)는 **290/290 다 채워져 있다.** 남은
병목은 블로그다 — 20편 중 영어 글이 3편뿐이라 영어 검색에 거의 안 걸린다.

**한 판에 글 하나.** 아래 순서로 한 편씩.

```bash
node tools/blog-prompt.mjs --en beginner "Korean particles 은/는 vs 이/가" > /tmp/p.txt
# /tmp/p.txt 를 통째로 붙여 넣고, 받은 JSON 을 /tmp/got.json 로 저장
node tools/blog-merge.mjs /tmp/got.json
node tools/check-blog.mjs
node tools/build-pages.mjs && node tools/stamp.mjs
```

### 먼저 쓸 것 — 이미 있는 한국어 글의 영어 짝

짝으로 묶으면(`alt`) `hreflang` 이 붙는다. 양쪽 글에 서로의 id 를 `alt` 로
적어야 한다(한쪽만 걸면 `check-blog.mjs` 가 막는다).

| 한국어 글 id | 영어 글 주제 |
|---|---|
| `read-hangul-in-a-morning` | Read Hangul in one morning |
| `which-topik-level-do-you-need` | Which TOPIK level do you need? |
| `topik-6-for-free` | How to reach TOPIK level 6 for free |
| `when-to-use-banmal` | When to use banmal (casual Korean) |
| `why-in-korean-aseo-nikka` | Saying "because" in Korean: -아서 vs -니까 |
| `an-vs-mot` | 안 vs 못: two ways to say "not" |
| `seyo-family` | -세요 and its family |
| `topik-writing-54-structure` | TOPIK writing Q54: how to structure the essay |

---

## 2. 음성 파일을 git 밖으로 (개선안 7번)

`assets/audio/` 가 174MB 다(dict 113MB · read 30MB · write 7MB …).
코드는 준비해 두었다 — **모든 음성 주소가 `AUDIO_BASE` 하나를 지난다**
(`app.module.js`, 기본값 `assets/audio/`). 옮기는 일은 이렇다.

1. Supabase 에 공개 버킷 `audio` 를 만든다.
2. `assets/audio/` 밑을 **같은 경로 그대로** 올린다
   (`dict/…`, `read/…`, `listen/…`, `travel/…` …). 파일 이름에 한글이 있으니
   올린 뒤 하나를 브라우저로 직접 열어 확인할 것.
3. `app.js` 맨 앞에 한 줄:
   `window.__AUDIO_BASE__ = 'https://tjgoevtvobvmlyefgxel.supabase.co/storage/v1/object/public/audio/';`
   (CSP 의 `media-src` 에 이미 이 주소가 있다.)
4. 사전·읽기·듣기·여행에서 소리가 나는지 본 뒤에 `assets/audio/` 를 저장소에서
   지운다. 지워도 git 기록에는 남으므로, 저장소 크기까지 줄이려면 따로
   `git filter-repo` 가 필요하다(급하지 않다 — 더 커지지 않게 막는 게 먼저).

### 안 하기로 한 것 — `app.module.js` 쪼개기

664KB 지만 gzip 으로 210KB 이고, 자료 파일은 이미 필요할 때만 불러온다.
쪼개면 `stamp.mjs` 대상과 import 순서를 전부 다시 맞춰야 하는데 얻는 것에
비해 깨질 자리가 많다. 첫 화면이 실제로 느리다는 숫자(Clarity)가 나오면
그때 다시 본다.
