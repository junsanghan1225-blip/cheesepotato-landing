치즈감자 고품질 MP3 오디오 저장소
================================

[파일 넣는 법 2가지 (둘 중 하나만 따라하면 됨)]

1) 코스 데이터에서 직접 audio 필드로 지정 (추천)
   courses.js 나 courses-grammar.js 블록에:
   { t:'cloze', sentence:'나는 [사과]를 먹어요', audio:'나는_사과를_먹어요.mp3', ... }
   → 이 파일 안에 '나는_사과를_먹어요.mp3' 을 넣으면 그 파일이 우선 재생됩니다.

2) 파일명을 audioSlug 규칙에 맞춰 자동 매칭 (audio 필드 없을 때 Fallback)
   아래 audioSlug() 함수 규칙으로 자동 변환된 파일명과 일치하면 자동 로드:
   - 한글·영어·숫자는 유지, 그 외(공백·물음표·쉼표 등)는 언더바(_)로 치환
   - 앞뒤 언더바 제거, 최대 64자
   예:
   '안녕하세요'            → '안녕하세요.mp3'
   '얼마예요?'             → '얼마예요.mp3' (물음표 → _ 로 치환 후 뒤 _ 제거)
   '나는 [사과]를 먹어요'   → '나는_사과_를_먹어요.mp3'
   'Hello, world!'         → 'Hello_world.mp3'
   (파일명 생성기: 브라우저 콘솔에서 audioSlug('원하는 문장') + '.mp3' 로 확인 가능)

[Supabase Storage 와 연동하는 법 (프로덕션 배포시)]
1. Supabase 대시보드 → Storage → 새 공개 버킷 생성: 'audio' (반드시 Public!)
2. 버킷 안에 여기있는 MP3 파일들을 그대로 업로드
3. index.html 최상단 <script> 태그를 열어 아래 줄을 추가:
   <script>window.__AUDIO_BASE__ = 'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/audio/';</script>
   → AUDIO_BASE 상수가 자동으로 이 주소를 우선 사용합니다.
   (로컬 개발할 때는 window.__AUDIO_BASE__ 가 없어서 자동으로 assets/audio/ 로 Fallback)

[테스트 방법]
- 이 폴더안의 더미 파일들은 비어있으므로 재생하면 자동으로 Web Speech API로 넘어갑니다.
- 실제 고품질 MP3 파일을 같은 이름으로 덮어쓰면 그 순간부터 MP3가 우선 재생됩니다.
- 브라우저 DevTools → Network 탭 → Filter: Media 로 보면 MP3 로딩 여부 실시간 확인 가능.
