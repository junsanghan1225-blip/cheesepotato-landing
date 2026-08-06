# 🎵 오디오 에셋 폴더 (assets/audio/)

단어 / 문장 MP3 오디오 파일이 위치하는 폴더입니다.

## 사용법
- 파일명 예: `안녕하세요.mp3`, `치즈감자.mp3`, `나는_아메리카노를_두_잔_주세요.mp3`
- 공백이나 특수문자는 되도록 언더스코어(`_`)로 치환하여 저장해 주세요. (엔진 내부 `audioSlug` 함수가 자동으로 언더스코어로 치환해서 탐색합니다)

## 재생 우선순위 (Fallback 구조)
1. **1순위**: 이 폴더(`assets/audio/`) 또는 `window.__AUDIO_BASE__` 에 지정된 Supabase Storage Public URL 에서 MP3 파일을 먼저 찾아 `Audio` 객체로 재생합니다.
2. **2순위 (자동 폴백)**: MP3 파일이 없거나 / 로딩에 실패할 경우, 기존 **브라우저 내장 Web Speech API (TTS)** 로 부드럽게 전환되어 발음이 재생됩니다.
   - 파일이 없어도 절대 에러가 발생하지 않으니 안심하세요!

## Supabase Storage 연동 (옵션)
고품질 음성을 클라우드에서 관리하고 싶다면:
1. Supabase 프로젝트에 `audio` 버킷을 **Public** 으로 생성
2. `index.html` 최상단 `<head>` 태그 안에 아래 스크립트 주입:
   ```html
   <script>window.__AUDIO_BASE__ = 'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/audio/';</script>
   ```
3. 이제 MP3 파일을 로컬 `assets/audio/` 대신 Supabase 버킷에 올리면 전 세계 어디서나 고음질로 재생됩니다!

## 디버깅 Tip
- 브라우저 DevTools → Network 탭 → `Media` 필터링하면 어떤 MP3 파일이 (혹은 404로 폴백되는지) 즉시 확인 가능합니다.
