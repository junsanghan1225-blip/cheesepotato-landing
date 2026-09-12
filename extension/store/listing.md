# 웹 스토어 등록물

개발자 대시보드에 그대로 옮겨 붙이는 글이다. 그림은
`node tools/build-store-shots.mjs` 가 굽는다(`shots/ko` · `shots/en`).

스토어는 칸마다 글자 수를 센다. 아래에 센 값을 적어 두었으니, 고칠 때
넘지 않는지 보고 고칠 것 — 넘으면 저장할 때 잘려 나간다.

---

## 이름 · Name

`manifest.json` 이 정한다(`_locales/`). 스토어가 그걸 그대로 쓴다. 45자까지.

| 말 | 이름 | 자 |
|---|---|---|
| ko | 치즈감자 — 한국어 사전·문법 | 17 |
| en | Cheesepotato — Korean dictionary & grammar | 42 |

## 짧은 설명 · Summary — 132자까지

목록에서 이름 밑에 붙는 한 줄이다. **여기서 다 말해야 한다** — 자세한
설명까지 내려가는 사람은 열에 하나다.

**ko** (62자)

> 아무 쪽에서나 한국어를 끌면 낱말 뜻과 예문, 그 문장에 든 문법을 보여 줍니다. 인터넷 없이, 회원가입 없이.

**en** (121자)

> Select Korean on any page to see the word's meaning, an example and the grammar inside the sentence. Offline, no sign-up.

---

## 자세한 설명 · Detailed description

### ko

```
한국어로 된 기사나 댓글을 읽다가 모르는 말이 나오면, 읽던 자리를 잃고
사전으로 건너갔다가 돌아옵니다. 그 사이에 무슨 이야기였는지 잊습니다.

치즈감자는 읽던 쪽 위에서 답을 내줍니다.

■ 끌면 뜻이 뜬다
아무 쪽에서나 한국어를 끌면 낱말 뜻·품사·예문이 그 자리에 뜹니다.
사전에 적힌 꼴을 몰라도 됩니다 — 「먹었습니다」를 끌어도 「먹다」로,
「집에서」를 끌어도 「집」으로 찾아 줍니다. 토씨와 어미를 떼어 사전에
있는 꼴로 되돌리되, 떼어 낸 결과가 사전에 실제로 있을 때만 인정합니다.
지어내지 않습니다.

■ 낱말만이 아니라 문법도
학습자가 정말 걸려 넘어지는 것은 낱말이 아니라 「-는 바람에」, 「-더라고요」
같은 어미입니다. 낱말이면 눌러서 사전을 보겠지만 어미는 눌러 볼 데가
없습니다. 치즈감자는 낱말 하나만 끌어도 그 낱말이 든 문장을 함께 보고,
아는 문법이 있으면 무엇인지 알려 줍니다.

Alt+G 를 누르면 그 쪽에 있는 아는 문법 197개에 한꺼번에 밑줄이 그어집니다.
밑줄을 누르면 무슨 문법인지 나옵니다.

■ 새 탭마다 표현 한 장
새 탭을 열면 문법 표현 290개 가운데 하나가 뜻풀이·예문·형태·주의할 점·
대화문과 함께 뜹니다. 그날 안에는 같은 카드가 뜹니다 — 열 때마다 바뀌면
읽지 않고 넘기게 되기 때문입니다. 초급·중급·고급 가운데 볼 급수를 고를 수
있고, 낱말 카드로 바꾸거나 아예 끌 수도 있습니다.

■ 담아 두면 때가 되어 돌아온다
읽다가 만난 낱말을 「＋」로 담아 두면 1일 · 3일 · 7일 · 16일 · 35일 · 90일
간격으로 돌아옵니다. 뜻을 먼저 떠올려 본 다음에 맞춰 봅니다 — 낱말과 뜻을
나란히 놓고 「알아요」를 누르는 것은 복습이 아니라 읽기입니다. 모르는 것은
그날 안에 한 번 더 만납니다.

담은 낱말은 TSV 로 복사해 안키나 스프레드시트로 옮길 수 있습니다.

■ 뜻풀이 11개 말
영어 · 일본어 · 중국어 · 베트남어 · 러시아어 · 스페인어 · 프랑스어 ·
아랍어 · 몽골어 · 인도네시아어 가운데 고릅니다. 고른 말에 그 낱말의 뜻이
없으면 영어로 물러서고, 영어에도 없으면 빈 칸으로 둡니다. 틀린 뜻을
내주느니 빈 칸을 내줍니다 — 빈 칸은 채우면 되지만 틀린 뜻은 외우고 나서야
압니다.

■ 인터넷을 안 씁니다
사전 4,209 표제어, 예문 4,207개, 문법 197개가 익스텐션 안에 들어 있습니다.
비행기 안에서도, 인터넷이 끊겨도 그대로 됩니다.

그래서 무엇을 찾았는지가 아무 데도 안 갑니다. 서버에 안 보내고, 계정도
로그인도 없고, 광고도 추적도 없습니다. 담은 낱말은 이 컴퓨터 안에만
있습니다.

(딱 하나, 설정에서 발음을 「사이트 녹음」으로 바꾸면 그때만
everykoreans.com 에서 소리 파일을 받아 옵니다. 기본값은 기기 목소리라
아무것도 안 받습니다. 녹음을 켜더라도 어느 쪽을 읽다가 눌렀는지는
보내지 않습니다.)

■ 무엇으로 만들었나
everykoreans.com(치즈감자)의 자료를 그대로 씁니다. 코스 21개 · 레슨 82개 ·
문법 표현 290개 · TOPIK 연습 문항 512개가 있는 무료 한국어 학습
사이트입니다. 말풍선에서 「표현 보기」나 「사전에서 보기」를 누르면 그
낱말, 그 표현의 쪽으로 바로 이어집니다.

낱말 뜻풀이 일부는 국립국어원 「한국어기초사전」에서 왔습니다
(CC BY-SA 2.0 KR).

■ 단축키
Alt+K  치즈감자 열기
Alt+G  이 쪽의 아는 문법에 밑줄 (한 번 더 누르면 지움)
바꾸려면 chrome://extensions/shortcuts

■ 알아 두실 것
새 탭을 바꿉니다. 설정에서 카드를 끌 수 있지만, 크롬은 원래 새 탭으로
되돌리는 길을 익스텐션에 열어 주지 않습니다 — 완전히 되돌리려면
chrome://extensions 에서 이 익스텐션을 끄셔야 합니다.

크롬 116 이상이 필요합니다.
```

### en

```
When you hit a word you don't know in a Korean article or comment thread, you
leave your place, go to a dictionary, and come back — by which time you have
lost the thread of what you were reading.

Cheesepotato answers on the page you are already on.

■ Select it, see it
Select Korean anywhere and the meaning, part of speech and an example appear
right there. You do not need to know the dictionary form: select 먹었습니다 and
it finds 먹다; select 집에서 and it finds 집. Particles and endings are stripped
back to the dictionary form — but only when the result is actually in the
dictionary. Nothing is invented.

■ Not just words — the grammar
What really trips learners up is not vocabulary but endings like -는 바람에 or
-더라고요. You can click a word to look it up; there is nowhere to click on an
ending. Cheesepotato reads the whole sentence around whatever you selected and
tells you which grammar is in it.

Press Alt+G and every one of the 197 known grammar patterns on the page is
underlined at once. Click an underline to see what it is.

■ A card in every new tab
Each new tab shows one of 290 grammar points, with its meaning, an example, its
form, what to watch out for, and a short dialogue. It stays the same all day —
a card that changes every time gets skipped, not read. Choose which levels you
want (beginner, intermediate, advanced), switch to vocabulary cards, or turn
the cards off.

■ Save a word and it comes back
Press ＋ on a word you met while reading and it returns after 1, 3, 7, 16, 35
and 90 days. You recall the meaning first and then check — putting the word and
its meaning side by side and pressing "I knew it" is reading, not reviewing.
Words you miss come back again the same day.

Your saved words copy out as TSV, straight into Anki or a spreadsheet.

■ Meanings in 11 languages
English, Japanese, Chinese, Vietnamese, Russian, Spanish, French, Arabic,
Mongolian and Indonesian. If a word has no meaning in the language you picked
it falls back to English, and if there is none there either it is left blank.
A blank can be filled in later; a wrong meaning you only discover after you
have memorised it.

■ It does not use the internet
4,209 dictionary entries, 4,207 examples and 197 grammar patterns all live
inside the extension. It works on a plane and it works when your connection
drops.

Which means what you look up goes nowhere. Nothing is sent to a server. There
is no account, no sign-in, no ads and no tracking. Your saved words stay on
this computer.

(One exception: if you switch pronunciation to "site recordings" in the
settings, each play fetches an audio file from everykoreans.com. The default
is your device's voice, which fetches nothing. Even with recordings on, the
page you were reading is never sent.)

■ Where it comes from
It carries the material from everykoreans.com (Cheesepotato), a free Korean
learning site with 21 courses, 82 lessons, 290 grammar points and 512 TOPIK
practice questions. "Read the page" and "Dictionary" in the bubble take you
straight to that word or that grammar point on the site.

Some word meanings come from the Korean Basic Dictionary of the National
Institute of Korean Language (CC BY-SA 2.0 KR).

■ Keyboard
Alt+K  Open Cheesepotato
Alt+G  Underline known grammar on this page (press again to clear)
Change them at chrome://extensions/shortcuts

■ Worth knowing
This replaces your new tab page. You can turn the cards off in the settings,
but Chrome gives extensions no way to hand the real new tab back — to get it
back you have to disable the extension in chrome://extensions.

Requires Chrome 116 or newer.
```

---

## 카테고리 · 언어

- 카테고리: **교육 (Education)**
- 언어: 한국어, English (`_locales/` 에 있는 둘)

---

## 개인정보 · 권한 소명

스토어는 권한마다 「왜 필요한지」를 따로 묻는다. 안 적으면 심사가 멈춘다.

### 한 가지 목적 (Single purpose)

> 웹 쪽에 있는 한국어 글의 낱말 뜻과 문법을 그 자리에서 보여 주고, 담아 둔
> 낱말을 복습하게 하는 한국어 학습 도구입니다.
>
> A Korean learning tool: it shows the meaning and grammar of Korean text on
> the page you are reading, and reviews the words you save.

### 권한

| 권한 | 왜 |
|---|---|
| `storage` | 설정과 단어장을 이 기기에 둡니다. 서버에 안 보냅니다. |
| `contextMenus` | 끌어 놓기를 꺼 둔 사람이 오른쪽 단추로 찾을 수 있게 합니다. |
| 모든 사이트에서 읽기 (`<all_urls>` content script) | 한국어는 아무 쪽에나 있습니다. 끌어 놓은 글을 읽어 뜻을 띄우려면 그 쪽에 들어가야 합니다. **끌어 놓은 글만** 보고, 쪽의 내용을 모으거나 밖으로 보내지 않습니다. 찾기는 전부 기기 안에서 일어납니다. |

`host_permissions` 는 없다. 바깥으로 나가는 요청이 기본 설정에 아예 없어서다.

### 자료 취급 (Data usage) — 모두 「아니오」

- 개인 식별 정보를 모으지 않습니다.
- 건강·금융·인증 정보를 모으지 않습니다.
- 개인적인 통신 내용이나 사용 기록을 모으지 않습니다.
- 제3자에게 팔거나 넘기지 않습니다.
- 한 가지 목적과 무관한 용도로 쓰지 않습니다.
- 신용 평가나 대출에 쓰지 않습니다.

### 개인정보 처리방침 주소

https://everykoreans.com/privacy.html

이 쪽은 익스텐션을 함께 다룬다. 원본은 앱 저장소
(`junsanghan1225-blip/cheesepotatoapp`)의 `docs/privacy-policy.md` 이고,
`tools/build-privacy.js` 가 그걸로 `privacy.html` 을 굽는다.

익스텐션에 관해 적혀 있는 자리 — 심사에서 볼 곳이다.

| 절 | 무엇이 적혀 있나 |
|---|---|
| 1. 개요 | 앱·웹과 달리 계정이 없고 서버로 보내는 것이 없다 |
| 2. 수집하는 항목 | **아무것도 수집하지 않는다.** 브라우저 안에 두는 것(설정·단어장)과, 인터넷을 쓰는 단 하나의 경우(사이트 녹음) |
| 3. 이용 목적 | 모으는 것이 없으므로 쓸 것도 없다 |
| 4. 제3자 처리 위탁 | Supabase·Gemini·구글 로그인 어느 것도 안 쓴다 |
| 5. 보관 및 파기 | 삭제하면 크롬이 저장소를 통째로 지운다 |
| 6. 이용자의 권리 | TSV 로 가져가기, 다 지우기 |
| 7. 접근 권한 | 권한 셋의 용도와, `host_permissions` 가 없다는 것 |
| 8. 안전성 | 서버에 붙지 않으므로 오갈 자료가 없다. 바깥 코드를 받아 실행하지 않는다 |
| 9. 아동 | 나이와 무관하게 아무것도 모으지 않는다 |

방침을 고칠 때는 **원본을 고치고 다시 구울 것.** `privacy.html` 을 손으로
고치면 다음에 구울 때 지워진다.

```bash
# 앱 저장소를 옆에 받아 두었거나, 자리를 직접 주면 된다
CHEESEPOTATO_APP=../cheesepotatoapp node tools/build-privacy.js
```

---

## 그림

`node tools/build-store-shots.mjs` → `shots/<말>/*.png`, 1280×800 다섯 장.
저장소에는 안 넣는다(`.gitignore`) — 도구로 언제든 다시 나온다.

| 파일 | 무엇을 보이나 |
|---|---|
| `1-select` | 글에서 낱말을 끌어 뜻·예문·문법이 한 말풍선에 |
| `2-grammar` | Alt+G 로 그은 밑줄과, 눌렀을 때 나오는 문법 |
| `3-newtab` | 새 탭 표현 카드 |
| `4-review` | 간격 반복 복습 |
| `5-offline` | 설정 — 뜻풀이 말과 「인터넷을 안 쓴다」 |

스토어는 알파가 없는 PNG 를 받는다. 틀에 바탕색을 깔아 두어 그대로 맞는다.
