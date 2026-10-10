# 윈도우에서 소리 굽기 — 처음부터 끝까지

## 먼저 알아 둘 것

**굽는 것은 선생님 컴퓨터에서 합니다.** 제가 일하는 클라우드 컨테이너는
api.elevenlabs.io 에 못 닿고 ffmpeg 도 없습니다. 그리고 그게 더 낫습니다 —
API 열쇠가 대화 기록에 안 남으니까요.

**굽는 코드는 아직 진짜 API 를 한 번도 안 불러 봤습니다.** 목록 뽑기와
계산은 확인했지만, 실제 요청이 오가는 것은 선생님이 처음 돌리는 순간이
처음입니다. 그래서 **5번 「한 개만 구워 보기」를 건너뛰지 마세요.** 뭔가
틀렸으면 12자에서 알게 됩니다. 1,425자를 다 태우고 알게 되는 것보다 낫죠.

---

## 1. 준비물

### Node.js

<https://nodejs.org> 에서 **LTS** 를 받아 설치. 다 누르고 넘어가면 됩니다.

확인 — **PowerShell** 을 새로 열고:

```powershell
node -v
```

`v20.x.x` 나 `v22.x.x` 가 나오면 됩니다.

### git

<https://git-scm.com/download/win> 에서 받아 설치.

```powershell
git --version
```

### ffmpeg — **지금은 필요 없습니다**

글자 카드는 한 사람이 읽는 것이라 이어 붙일 게 없습니다. 듣기와 대화를
구울 때(9번) 필요하니 그때 깔면 됩니다.

---

## 2. 저장소 받기

```powershell
cd ~\Documents
git clone https://github.com/junsanghan1225-blip/cheesepotato-landing.git
cd cheesepotato-landing
```

이미 받아 두셨으면:

```powershell
cd ~\Documents\cheesepotato-landing
git pull origin main
```

> **앞으로 모든 명령은 이 폴더 안에서 돌립니다.** 소리 파일이
> `assets\audio\` 로 들어가는데 그 경로가 여기 기준이라, 다른 데서 돌리면
> 엉뚱한 자리에 쌓입니다.

---

## 3. 열쇠 넣기

PowerShell 은 `export` 가 아니라 `$env:` 를 씁니다.

```powershell
$env:ELEVEN_API_KEY = "sk_여기에_선생님_열쇠"
```

확인:

```powershell
echo $env:ELEVEN_API_KEY
```

> 이 방식은 **지금 연 PowerShell 창에서만** 삽니다. 창을 닫으면 사라져요.
> 매번 넣기 싫으면 `setx ELEVEN_API_KEY "sk_..."` 를 한 번 돌리고
> **PowerShell 을 새로 열면** 계속 남습니다.

열쇠는 ElevenLabs 사이트 → 오른쪽 위 프로필 → **API Keys** 에 있습니다.

---

## 4. 목소리 id 찾기

목소리는 만드셨지만 **id 는 화면에 잘 안 보입니다.** 이걸로 뽑습니다:

```powershell
node tools\tts-build.mjs --voices
```

이렇게 나옵니다:

```
목소리 12개

  ★ 내 목소리                  aB3xY9kLmNpQrStUvWxY
    cloned · male
    Rachel                     21m00Tcm4TlvDq8ikWAM
    premade · female
  ...
```

**★ 이 직접 만드신 목소리입니다.** 그 오른쪽 긴 문자열이 id 예요.

이 명령은 **글자를 하나도 안 씁니다.** 열쇠가 맞는지도 여기서 같이
확인됩니다 — 401 이 나오면 열쇠가 틀린 겁니다.

두 개를 넣습니다:

```powershell
$env:ELEVEN_VOICE_M = "aB3xY9kLmNpQrStUvWxY"   # ★ 선생님 목소리
$env:ELEVEN_VOICE_W = "21m00Tcm4TlvDq8ikWAM"   # 아무 한국어 여자 목소리
```

> 여자 목소리는 지금 안 쓰이지만(글자 카드는 전부 선생님 목소리),
> 듣기를 구울 때 없으면 도구가 멈춥니다. 미리 넣어 두세요.

---

## 5. **한 개만 구워 보기** ← 여기가 제일 중요

먼저 목록을 만듭니다:

```powershell
node tools\tts-manifest.mjs --only course --write tts\course.jsonl
```

```
구울 소리
  course      154개     1425자
  ...
  목록을 tts\course.jsonl 에 썼다 (154줄, UTF-8).
```

**한 개만** 구워 봅니다:

```powershell
node tools\tts-build.mjs --in tts\course.jsonl --limit 1
```

물어봅니다:

```
목록 154개 · 이미 구운 것 0개 · 구울 것 1개
  API 부름 1번 · 글자 12자 · 이어 붙일 것 0개

구울까? 크레딧은 되돌릴 수 없다. [y/N]
```

`y` 엔터.

```
[1/1] 저는_한국_사람이에요.mp3  ✓

구움 1개 (이어 붙임 0) · 실패 0개
```

**✓ 가 떴으면 통과입니다.** 이제 나머지를 태워도 됩니다.

### ✗ 가 떴다면

에러 줄에 ElevenLabs 가 뭐라 했는지 그대로 찍힙니다. 흔한 것:

| 나온 것 | 뜻 | 할 일 |
|---|---|---|
| `401` | 열쇠가 틀림 | 3번 다시 |
| `404` | 목소리 id 가 틀림 | 4번 다시 |
| `422` | 요청 모양이 안 맞음 | **그 줄을 저한테 그대로 보내 주세요** |
| `429` | 크레딧 없음 / 너무 빠름 | ElevenLabs 에서 잔량 확인 |

422 는 제 코드 쪽 문제일 수 있습니다. 메시지를 보내 주시면 고칩니다.

---

## 6. 들어 보기

```powershell
start assets\audio\저는_한국_사람이에요.mp3
```

**선생님 목소리인가요?** 자연스럽나요?

- 목소리가 다른 사람 → `ELEVEN_VOICE_M` 이 잘못된 id
- 목소리는 맞는데 어색 → 그냥 진행하세요. 154개 다 들어 보고 나서
  판단하는 게 낫습니다.

---

## 7. 글자 카드 전부 굽기

```powershell
node tools\tts-build.mjs --in tts\course.jsonl
```

`y` 엔터. **154개, 1,425자, 5~10분.**

이미 구운 1개는 건너뜁니다 — 돈이 두 번 안 나갑니다.

```
[1/153] 제_친구는_의사예요.mp3  ✓
[2/153] 이거는_커피예요.mp3  ✓
...
구움 153개 · 실패 0개
```

---

## 8. 들어 보고 이상한 것 바꾸기

**특히 낱자를 들어 보세요.** TTS 가 가장 못하는 자리입니다.

```powershell
start assets\audio\ㄱ.mp3
start assets\audio\ㄴ.mp3
start assets\audio\ㅏ.mp3
```

- 「ㄱ」이 **「그」** 로 들리면 좋습니다
- 「기역」이라고 읽거나 뭉개면 **직접 녹음해서 바꾸세요**

직접 녹음하는 법: 휴대폰 녹음기로 「그」 하고 녹음 → mp3 로 저장 →
`assets\audio\ㄱ.mp3` 를 그 파일로 덮어쓰기. **파일 이름만 같으면 됩니다.**

낱자 39개면 10분입니다. 한글을 처음 배우는 사람이 **가장 먼저 듣는
소리**라 여기만큼은 손으로 하는 값어치가 있습니다.

---

## 9. 올리기

```powershell
node tools\stamp.mjs
git add assets\audio
git commit -m "글자 카드 소리 154개 (선생님 목소리)"
git push origin main
```

> `stamp.mjs` 를 꼭 돌리세요. 브라우저가 예전 것을 계속 쓰지 않게 자국을
> 새로 찍는 겁니다.

몇 분 뒤 <https://junsanghan1225-blip.github.io/cheesepotato-landing/> 에서
코스 › 한글 배우기 로 들어가 글자 카드를 눌러 보세요. **선생님 목소리가
나와야 합니다.**

---

## 10. 그 다음 — 듣기 (여기서 ffmpeg 필요)

듣기는 남녀가 주고받아서 조각을 이어 붙여야 합니다.

```powershell
winget install Gyan.FFmpeg
```

**PowerShell 을 새로 열고** (경로가 새로 잡혀야 합니다):

```powershell
cd ~\Documents\cheesepotato-landing
$env:ELEVEN_API_KEY = "sk_..."
$env:ELEVEN_VOICE_M = "..."
$env:ELEVEN_VOICE_W = "..."
ffmpeg -version          # 나오면 준비 끝

node tools\tts-manifest.mjs --only listen --write tts\listen.jsonl
node tools\tts-build.mjs --in tts\listen.jsonl --limit 1
```

한 개가 되면 나머지:

```powershell
node tools\tts-build.mjs --in tts\listen.jsonl
```

**37개, 2,967자.** 다 구우면 사이트에서 TOPIK › 듣기 가 진짜 목소리로
돌아갑니다. 지금은 브라우저 로봇 목소리로 돌고 있어요.

들어 볼 때 하나만 보세요 — **남자와 여자가 실제로 갈려 들리는가.**
안 갈리면 「여자는 무엇을 합니까」 문항을 풀 방법이 없습니다.

---

## 11. 나머지 (여유 되면)

```powershell
node tools\tts-manifest.mjs --write tts\all.jsonl
node tools\tts-build.mjs --in tts\all.jsonl --dry     # 남은 양 확인
node tools\tts-build.mjs --in tts\all.jsonl
```

예문 289 · 대화 290 · 읽기 54 · 쓰기 16 이 남습니다. 30분~1시간.

전부 합쳐 **34,657자로 Creator 한 달치(100,000자)의 35%** 입니다.
다 굽고 나면 **구독을 끊으셔도 됩니다.** 파일은 저장소에 남습니다.

---

## 막히면

어느 단계에서 무슨 글자가 나왔는지 그대로 보내 주세요. 특히 `✗` 줄은
ElevenLabs 가 보낸 말이 그대로 찍히니 그걸 보면 원인이 바로 나옵니다.
