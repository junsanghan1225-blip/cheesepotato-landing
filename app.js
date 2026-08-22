/* 치즈감자 — 화면 동작 (모듈이 아닌 쪽)

   예전에는 index.html 안에 그대로 박혀 있었다. 밖으로 뺀 이유는 CSP 다 —
   인라인 스크립트가 한 줄이라도 남아 있으면 script-src 에
   'unsafe-inline' 을 열어 둬야 하고, 그러면 남이 우리 페이지에 <script>
   를 심었을 때 CSP 가 그걸 못 막는다. 파일로 빼 두면 'self' 만 열면 된다.

   고전 스크립트라 여기서 만든 const · function 은 전역에 남는다.
   아래 app.module.js 가 ptShow · applyLang 같은 것을 그냥 부르는 게
   그래서 된다. 인라인이었을 때와 규칙이 똑같으니 동작도 그대로다. */

/* ── 첫 화면에서 갈래로 바로 ───────────────────────────────────
   예전 첫 화면에는 기울어지는 단어 카드와 대시보드 그림이 있었다. 판이
   단어장에서 한국어 학습으로 옮겨 가면서 그 구역이 통째로 빠졌고, 그것을
   움직이던 코드(tilt·swipe·dash)도 같이 뺐다.

   **DOM 이 없는데 코드가 남으면 이 파일 전체가 죽는다.** getElementById 가
   null 을 주고 그다음 addEventListener 에서 멈추는데, 그러면 아래에 있는
   발음 레벨 테스트와 글자 크기 조절까지 통째로 안 붙는다. 구역을 지울
   때 여기를 같이 지워야 하는 이유다.

   cpOpen 은 app.module.js 가 만든다. 이 파일이 먼저 실행되지만 사람이
   누를 때는 이미 와 있으므로, 붙이는 자리만 여기 두면 된다. 그래도 아직
   안 온 순간에 눌릴 수 있으니 헤더 단추를 대신 누르는 길을 남겨 둔다. */
function goLearn(sub) {
  if (window.cpOpen) return window.cpOpen('learn', sub);
  document.getElementById('learnBtn').click();
}
document.getElementById('heroLearnBtn').addEventListener('click', () => goLearn());
document.getElementById('heroTopikBtn').addEventListener('click', () => goLearn('topik'));
/* 첫 화면 카드도 눌리는 자리다. 방문 기록을 보면 사람들이 오는 곳은
   레딧이고, 앱을 받으러 온 것이 아니라 **여기서 한국어를 해 보려고**
   온다. 눌러 본 사람은 「해 보고 싶다」고 말한 것이니 그 자리로 보낸다. */
document.getElementById('heroCardBtn').addEventListener('click', () => goLearn());

/* 「무엇을 배우나」 여섯 장. data-go 에 적힌 자리로 보낸다.
   낱말 사전은 배우기 갈래가 아니라 자료마당(library) 안에 있다. */
const WAY_GO = {
  learn:    () => goLearn(),
  topik:    () => goLearn('topik'),
  sentence: () => goLearn('sentence'),
  reading:  () => goLearn('reading'),
  games:    () => window.cpOpen && window.cpOpen('games'),
  glossary: () => window.cpOpen && window.cpOpen('library'),
};
document.querySelectorAll('.way[data-go]').forEach((b) => {
  b.addEventListener('click', () => { const f = WAY_GO[b.dataset.go]; if (f) f(); });
});

// 스크롤 리빌: 아래 요소들이 스크롤에 맞춰 3D로 떠오름 (히어로는 제외)
const revealTargets = [
  ['.way', 'reveal', null],
  ['.faq-i', 'reveal', null],
  ['.dl-section', 'reveal-deep', 0]
];
revealTargets.forEach(([sel, cls, delay]) => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add(cls);
    el.style.setProperty('--d', (delay !== null ? delay : i * 0.1) + 's');
  });
});
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.reveal, .reveal-deep').forEach(el => io.observe(el));

/* ── 발음 레벨 테스트 ─────────────────────────────────────────
   브라우저에 내장된 음성 인식을 쓴다. 서버도 API 키도 없어서
   아무리 퍼져도 비용이 0이고 멈출 일이 없다.

   채점은 "들린 글자"와 "읽어야 할 글자"를 자모 단위로 비교한다.
   음절 단위로 세면 받침 하나 틀린 것과 글자를 통째로 틀린 것이
   같은 점수가 되어 버린다. */

/* 지문 풀 — 난이도 세 단계.
   무작위로 하나만 뽑으므로, 한 단계 안에서 난이도가 고르지 않으면
   운으로 레벨이 갈린다. 그래서 단계 안에서는 길이와 받침·연음 부담을
   서로 비슷하게 맞췄다. 단계 사이에만 차이를 둔다.

   쉬움   — 한 문장, 12~18자. 받침이 홑받침이고 연음이 거의 없다.
   보통   — 두 문장, 35자 안팎. 처음부터 있던 지문들이다.
   어려움 — 두 문장, 45~55자. 겹받침(값·넋·맑은·읽던·앉은),
            구개음화(굳이·같이), 경음화, ㅎ 약화가 한 지문에 여러 번 나온다.

   점수 계산은 세 단계가 똑같다. 단계별로 기준을 다르게 하면 90점이
   무슨 뜻인지 알 수 없게 되고, 앱과 웹이 같은 계산식을 쓴다는 약속도
   깨진다. 어려운 지문에서 나온 점수라는 건 결과 화면에 단계를 적어
   알린다. */
const PT_SETS = {
  easy: [
    '오늘 날씨가 참 좋아요.',
    '저는 물을 자주 마셔요.',
    '학교에 같이 가요.',
    '밥을 맛있게 먹었어요.',
    '친구를 기다리고 있어요.',
    '이 책은 정말 재미있어요.',
    '내일 아침에 만나요.',
    '커피 한 잔 주세요.',
    '공원에서 산책을 해요.',
    '바람이 시원하게 불어요.',
    '집에서 음악을 들어요.',
    '따뜻한 우유를 마셔요.',
    '버스가 빠르게 지나가요.',
    '도서관에서 공부를 해요.',
    '사진을 예쁘게 찍어요.',
    '가방에 물건을 넣어요.',
    '친구가 미소를 지어요.',
    '하늘에 구름이 떠 있어요.',
    '가족과 저녁을 먹어요.',
    '신발을 깨끗하게 빨아요.',
    '방을 깔끔하게 치워요.',
    '노래를 즐겁게 불러요.',
    '편지를 정성껏 써요.',
    '가게에서 사과를 사요.',
    '지하철을 타고 가요.',
    '창문을 크게 열어요.',
    '나무 아래에서 쉬어요.',
    '꽃이 아름답게 피어요.',
    '마당에서 강아지와 놀아요.',
    '아침 일찍 일어나요.',
    '시장에 사람이 모여 있어요.',
    '자전거를 신나게 타요.',
    '옷을 단정하게 입어요.',
    '선물을 받고 기뻐해요.',
    '주말에 영화를 봐요.',
    '손을 깨끗이 씻어요.',
    '새가 하늘을 날아가요.',
    '전화를 반갑게 받아요.',
    '바다에서 수영을 해요.',
    '식당에서 음식을 기다려요.',
    '빵집에서 식빵을 사요.',
    '동생이 그림을 그려요.',
    '운동장에서 공을 차요.',
    '가을 산이 참 예뻐요.',
    '산책로를 천천히 걸어요.',
    '아침에 차를 한 잔 마셔요.',
    '머리를 매일 아침 감아요.',
    '마음이 아주 편안해요.',
    '친구가 집으로 와요.',
    '비가 조용히 내려요.',
    '소파에 누워서 쉬어요.',
    '컴퓨터로 일을 해요.',
    '마트에서 채소를 사요.',
    '책상 위에 연필이 있어요.',
    '아이들이 웃고 있어요.',
    '저녁에 동생과 이야기해요.',
    '계절이 다시 바뀌어요.',
    '오늘 하루도 수고했어요.',
  ],
  normal: [
    '오늘은 아침부터 비가 내렸습니다. 우산을 챙기지 않아서 그냥 뛰어갔어요.',
    '주말에 친구들과 바다에 다녀왔습니다. 파도 소리를 들으니 마음이 편해졌어요.',
    '새로 문을 연 식당에 갔습니다. 김치찌개가 얼큰해서 국물까지 다 먹었어요.',
    '지하철에서 책을 읽는 사람을 봤습니다. 요즘 보기 드문 모습이라 반가웠어요.',
    '봄이 되니 꽃들이 한꺼번에 피었습니다. 길을 걷는 것만으로도 기분이 좋아졌어요.',
    '밤늦게까지 공부하다가 잠들었습니다. 아침에 일어나니 목이 뻐근하고 눈이 아팠어요.',
    '오랜만에 시장에 들렀습니다. 값을 깎아 주셔서 생각보다 많이 사 왔어요.',
    '창문을 열었더니 바람이 들어왔습니다. 낙엽 밟는 소리가 유난히 크게 들렸어요.',
    '공원에 가서 천천히 산책을 했습니다. 시원한 바람이 불어서 머리가 맑아졌어요.',
    '오랜만에 도서관에서 책을 읽었습니다. 재미있는 내용이 많아서 시간 가는 줄 몰랐어요.',
    '아침 일찍 일어나서 운동을 했습니다. 몸이 한결 가볍고 기분이 아주 좋아졌어요.',
    '따뜻한 커피를 한 잔 마셨습니다. 은은한 향이 퍼져서 마음이 참 편안해졌어요.',
    '집 근처 공원에 꽃이 많이 피었습니다. 알록달록한 모습을 보니 절로 미소가 나왔어요.',
    '친구와 함께 맛있는 점심을 먹었습니다. 이야기를 나누며 즐거운 시간을 보냈어요.',
    '퇴근길에 버스를 놓쳐서 한참 기다렸습니다. 다음 버스가 금방 와서 다행이었어요.',
    '오후에 갑자기 하늘이 어두워졌습니다. 금방이라도 소나기가 내릴 것 같아서 서둘렀어요.',
    '어제 저녁에는 가족과 밥을 먹었습니다. 다 같이 모여서 이야기하니 마음이 따뜻해졌어요.',
    '주말에 집을 깨끗하게 청소했습니다. 먼지를 털어내니 집안이 아주 깔끔해졌어요.',
    '근처 마트에 가서 장을 보았습니다. 신선한 과일과 채소를 가득 담아서 돌아왔어요.',
    '저녁을 먹고 마당에서 쉬었습니다. 하늘을 바라보니 달과 별이 밝게 빛났어요.',
    '오래된 음악을 다시 찾아 들었습니다. 옛날 생각이 나서 가슴이 뭉클하고 반가웠어요.',
    '시장에서 따뜻한 붕어빵을 샀습니다. 추운 날씨에 바로 먹으니 정말 맛있었어요.',
    '공원의 벤치에 앉아서 잠시 쉬었습니다. 바람 소리와 새 소리가 듣기 편했어요.',
    '새로 산 옷을 입고 밖으로 나갔습니다. 색깔이 마음에 들어서 계속 기분이 좋았어요.',
    '친구에게 편지를 정성스럽게 썼습니다. 고마운 마음을 전할 수 있어서 뿌듯했어요.',
    '아침에 구름이 많아서 우산을 가져갔습니다. 하지만 다행히 비는 내리지 않았어요.',
    '집에서 영화를 한 편 감상했습니다. 내용이 아주 감동적이어서 눈물이 조금 났어요.',
    '오랜만에 자전거를 신나게 탔습니다. 시원한 바람을 맞으며 강변을 달렸어요.',
    '버스를 타고 창밖 풍경을 바라보았습니다. 나뭇잎이 초록색으로 짙어져서 예뻤어요.',
    '가게에서 예쁜 컵을 하나 골랐습니다. 집에서 자주 쓰게 될 것 같아 마음에 들었어요.',
    '어제는 하루 종일 바쁘게 움직였습니다. 집에 돌아오니 피곤해서 일찍 잠이 들었어요.',
    '식당에서 따뜻한 국수를 주문했습니다. 국물이 깔끔하고 면발이 아주 쫄깃했어요.',
    '아침에 새가 창문 앞에서 노래했습니다. 맑은 소리를 들으며 기분 좋게 일어났어요.',
    '주말에 친구들과 운동장에서 공을 찼습니다. 땀을 뻘뻘 흘리고 나니 몸이 가벼워졌어요.',
    '퇴근하고 집에 와서 손부터 씻었습니다. 따뜻한 물로 씻으니 피로가 풀리는 듯했어요.',
    '작은 화분에 예쁜 식물을 심었습니다. 매일 정성껏 물을 주면서 잘 키워 볼 거예요.',
    '도서관에서 필요한 자료를 찾아보았습니다. 원하던 정보를 찾을 수 있어서 다행이었어요.',
    '길을 걷다가 귀여운 강아지를 만났습니다. 꼬리를 흔들며 다가오는 모습이 참 귀여웠어요.',
    '시원한 수박을 잘라서 나누어 먹었습니다. 달콤한 즙이 입안에 가득 차서 상쾌했어요.',
    '서점에 가서 좋아하는 작가의 책을 샀습니다. 어서 집으로 가서 읽고 싶어졌어요.',
    '저녁 시간에 가족들과 산책을 나갔습니다. 밤바람이 시원해서 걷기 딱 좋았어요.',
    '방 안의 가구 위치를 바꾸어 보았습니다. 방이 훨씬 넓어 보여서 아주 마음에 들어요.',
    '향긋한 차를 마시며 책을 펼쳤습니다. 조용한 분위기 속에서 편안하게 읽었어요.',
    '날씨가 좋아서 빨래를 햇빛에 말렸습니다. 옷이 바짝 말라서 보송보송하고 좋았어요.',
    '동생이 그린 그림을 보았습니다. 알록달록한 색감이 아주 인상적이고 예뻤어요.',
    '아침 일찍 물을 한 잔 마셨습니다. 정신이 번쩍 들어서 하루를 힘차게 시작했어요.',
    '버스 정류장에서 친구를 기다렸습니다. 오랜만에 만나서 나눌 이야기가 많았어요.',
    '비가 그치고 하늘에 무지개가 떴습니다. 신기해서 한참 동안 바라보고 서 있었어요.',
    '집 근처 산길을 천천히 걸어 올라갔습니다. 공기가 맑아서 숨을 깊게 쉬었어요.',
    '뜨끈한 욕조에 몸을 담그고 쉬었습니다. 하루 동안 쌓인 피로가 다 날아가는 듯했어요.',
    '저녁으로 노릇하게 구운 생선을 먹었습니다. 고소한 맛이 입안에 퍼져서 맛있었어요.',
    '컴퓨터 앞에 앉아 편지를 적었습니다. 오랜 친구에게 안부를 물을 수 있어서 좋았어요.',
    '공원 의자에 앉아 하늘을 보았습니다. 흰 구름이 천천히 흘러가는 모습이 시원했어요.',
    '빵집에서 달콤한 빵을 하나 골랐습니다. 상자를 열자마자 고소한 냄새가 진하게 났어요.',
    '퇴근길 거리에 노란 조명이 켜졌습니다. 은은한 불빛 덕분에 골목이 예쁘게 보였어요.',
    '아침에 계란 요리를 만들어서 먹었습니다. 든든하게 배를 채우고 집을 나섰어요.',
    '주말이라 느긋하게 침대에서 쉬었습니다. 바쁜 일상에서 벗어나니 정말 행복했어요.',
    '친구와 카페에서 만나 차를 마셨습니다. 웃으며 이야기하다 보니 시간이 금방 갔어요.',
  ],
  hard: [
    '옷을 갈아입고 밖에 나갔더니 햇빛이 눈부셨습니다. 얇은 외투로는 조금 추웠지만 걷기에는 좋았어요.',
    '맑은 날에 넓은 들판을 한참 걸었습니다. 흙냄새와 풀 향기가 섞여 코끝을 간질였어요.',
    '값을 치르고 나오는데 갑자기 소나기가 쏟아졌습니다. 우산 없이 뛰다 보니 옷이 흠뻑 젖었어요.',
    '읽던 책을 덮고 창밖을 내다봤습니다. 낯선 골목에서 낙엽 밟는 소리가 또렷하게 들려왔어요.',
    '앉은 자리에서 꼼짝도 못 하고 발표를 들었습니다. 어려운 낱말이 많아 끝까지 집중하기가 힘들었어요.',
    '굳이 서두르지 않아도 괜찮다고 하셨습니다. 같이 앉아서 이야기를 나누다 보니 마음이 놓였어요.',
    '싫증 내지 않고 꾸준히 연습했더니 실력이 늘었습니다. 짧은 문장부터 또박또박 읽는 게 도움이 됐어요.',
    '넋 놓고 있다가 약속 시간을 놓쳤습니다. 헐레벌떡 뛰어갔지만 이미 다들 떠난 뒤였어요.',
    '넓은 바다를 보며 걷고 싶어서 길을 나섰습니다. 오솔길을 지나니 해돋이가 아름답게 펼쳐졌어요.',
    '책상 위에 놓인 색연필을 모두 정리했습니다. 짧은 연필부터 필통에 차곡차곡 넣어 보았어요.',
    '한여름에 넓은 숲길을 걸으니 땀이 많이 났습니다. 시원한 나무 그늘 아래에 앉아서 쉬었어요.',
    '갓 깎은 사과를 접시에 담아 식탁에 올렸습니다. 얇은 조각을 입에 넣으니 단맛이 퍼졌어요.',
    '바람에 날려 온 나뭇잎을 유심히 살폈습니다. 붉은 빛깔이 참 고와서 오래도록 들여다보았어요.',
    '따뜻하게 끓인 물을 컵에 가득 채워 마셨습니다. 속이 편안해지고 피로가 말끔하게 풀렸어요.',
    '굳이 어렵게 생각하지 않고 차분히 문제를 풀었습니다. 막히던 부분이 순식간에 다 해결되었어요.',
    '마당에 눈이 높게 쌓여서 풍경이 밝아졌습니다. 신발을 신고 밖으로 나가 발자국을 남겼어요.',
    '젊은 시절부터 간직하던 사진집을 꺼냈습니다. 옛날 추억이 생각나 혼자 미소를 지었어요.',
    '삶은 계란과 옥수수를 바구니에 담았습니다. 음식이 식기 전에 친구와 함께 맛있게 먹었어요.',
    '볕이 좋은 날에 옷장에서 이불을 꺼내 널었습니다. 밝은 햇살이 창문으로 듬뿍 들어왔어요.',
    '학교 수업이 끝나고 도서관으로 향했습니다. 재미있는 그림책을 많이 발견해서 기분이 좋았어요.',
    '오랫동안 닫혀 있던 문을 살며시 열었습니다. 먼지가 날렸지만 방 안이 훤하게 밝아졌어요.',
    '넓은 공원에서 강아지와 함께 달렸습니다. 흙길을 밟으며 신나게 노니 시간 가는 줄 몰랐어요.',
    '책장에 있던 옛날 노트의 먼지를 털어냈습니다. 가득 적힌 글들을 읽다 보니 웃음이 나왔어요.',
    '창턱에 팔을 얹고 내리는 눈을 한참 지켜보았습니다. 하얀 꽃잎처럼 떨어지는 모습이 아름다웠어요.',
    '시장에서 사 온 담요를 방바닥에 넓게 펼쳤습니다. 감촉이 부드러워 잠이 솔솔 올 것 같았어요.',
    '어려운 단어가 많아 사전의 뜻을 읽어 보았습니다. 몇 번 반복해 쓰다 보니 금방 이해가 됐어요.',
    '맑은 개울물에 손을 넣었더니 생각보다 차가웠습니다. 물소리를 들으며 바위에 잠깐 앉아 쉬었어요.',
    '노트북을 켜고 짧은 글을 적기 시작했습니다. 생각이 금방 정리되어서 차분하게 다 썼어요.',
    '아침 일찍 식당에 앉아서 뜨거운 국밥을 먹었습니다. 배가 든든하게 차오르니 하루가 활기찼어요.',
    '친구가 준 선물의 포장지를 조심히 벗겼습니다. 생각지도 않던 물건이 나와서 웃음이 터졌어요.',
    '밝은 달빛 아래에서 산책을 즐겼습니다. 조용한 밤거리를 걷다 보니 마음이 아주 평화로웠어요.',
    '추운 날씨에 얇은 장갑만 끼고 한참을 걸었습니다. 집으로 들어오니 따뜻해서 참 좋았어요.',
    '비에 젖은 옷을 벗어 걸고 난로 앞에 앉았습니다. 뜨거운 차를 마시니 몸이 금세 풀렸어요.',
    '젊은 작가의 소설을 한 권 사 왔습니다. 첫 장부터 재미있어서 단숨에 끝까지 읽었어요.',
    '소파에 가만히 앉아 옛날 음악을 들었습니다. 낯익은 멜로디가 흘러나와 기분이 참 좋았어요.',
    '바람이 심하게 불어서 창문을 꽉 닫았습니다. 집 안이 조용해져서 앉은 자리에서 쉬었어요.',
    '자전거를 타고 가파른 언덕길을 올랐습니다. 바람을 맞으며 짧은 내리막을 달리니 짜릿했어요.',
    '작은 화분에 물을 주며 시든 잎을 훑어 냈습니다. 향긋한 냄새가 거실 가득 은은하게 퍼졌어요.',
    '맑은 공기를 마시며 등산로를 따라 걸었습니다. 넓은 정상에 올라서니 가슴이 뻥 뚫렸어요.',
    '부엌에 있던 유리컵을 맑게 닦아 두었습니다. 햇빛을 받으니 반짝거려 보기에도 깔끔했어요.',
    '거실에 넓은 자리를 잡고 앉아 그림을 그렸습니다. 알록달록하게 칠하다 보니 아주 신났어요.',
    '손을 씻고 얇은 수건으로 물기를 꼼꼼히 닦았습니다. 피부가 보송해지면서 아주 상쾌했어요.',
    '친구와 약속한 장소로 짧은 골목을 지나 걸어갔습니다. 멀리서 반갑게 인사하는 모습이 보였어요.',
    '오후가 되자 따가운 햇살이 짧아지고 옅어졌습니다. 바람이 불어서 산책하기에 딱 좋았어요.',
    '오랫동안 비어 있던 집을 깔끔하게 치웠습니다. 구석의 흙먼지까지 닦아내니 아주 깨끗해졌어요.',
    '시장에서 산 떡을 접시에 나눠 담았습니다. 각자의 몫을 앞에 두니 군침이 절로 돌았어요.',
    '따뜻한 햇살을 받으며 마당에 의자를 놓았습니다. 앉아서 음료를 마시니 무척 여유로웠어요.',
    '비가 그친 뒤 길가에 웅덩이가 넓게 생겼습니다. 나뭇잎이 떠 있는 모습을 재미있게 봤어요.',
    '공원의 작은 식물원에서 새로운 꽃을 발견했습니다. 색깔이 화려하고 굵은 줄기가 특이했어요.',
    '아침에 따뜻한 밥과 삶은 나물을 그릇에 담았습니다. 정성껏 만든 반찬과 먹으니 맛있었어요.',
    '손잡이를 잡아당겨 방문을 활짝 열었습니다. 밝은 햇살과 시원한 바람이 한꺼번에 들어왔어요.',
    '산길을 오르다 굵은 돌 하나를 주워 보았습니다. 겉면이 매끄럽고 둥글어서 주머니에 넣었어요.',
    '어두웠던 방에 스탠드 불빛을 밝게 켰습니다. 아늑한 분위기가 만들어져 마음이 놓였어요.',
    '동생과 같이 마당에서 공놀이를 했습니다. 굵은 땀방울이 맺힐 만큼 신나게 뛰었어요.',
    '책을 읽다가 마음에 드는 구절을 따로 적었습니다. 깊은 뜻을 새겨 보니 마음이 따뜻해졌어요.',
    '추운 겨울날 따뜻한 방에서 담요를 덮었습니다. 귤을 까 먹으며 짧은 겨울 오후를 보냈어요.',
    '길을 가다 예쁜 가게를 발견하고 들어가 보았습니다. 특이하고 작은 소품이 많이 진열되어 있었어요.',
    '수업이 시작되기 전에 교실에 일찍 도착했습니다. 책상을 정리하고 앉은 채로 조용히 기다렸어요.',
  ],
};

const PT_LV_NAME = {
  easy:   { ko:'쉬움',   en:'Easy'   },
  normal: { ko:'보통',   en:'Normal' },
  hard:   { ko:'어려움', en:'Hard'   },
};

let ptLevel = 'normal';        // 지금 고른 단계
let ptPickedLevel = 'normal';  // 방금 읽은 지문이 나온 단계 (결과 화면용)
const PT = () => PT_SETS[ptLevel] || PT_SETS.normal;

/* 지금 화면이 영어인지. ptLang 을 직접 보지 않는 이유는 그게 이 아래에서
   선언되기 때문이다 — 저장된 단계를 불러오는 코드가 먼저 도는데 거기서
   ptLang 을 읽으면 TDZ 로 스크립트 전체가 죽는다. <html lang> 은
   applyLang 이 늘 맞춰 두므로 언제 읽어도 안전하다. */
const ptIsEn = () => document.documentElement.lang === 'en';
/* 안내 문구는 data-en 으로 못 붙인다 — 상황에 따라 자바스크립트가 바꿔
   쓰는 자리라서다. 영어 화면인데 여기만 한국어로 남아 있었다. */
const ptT = (ko, en) => (ptIsEn() ? en : ko);

const PT_LV = [
  { min:90, n:'원어민 수준', s:'거의 그대로 전달됩니다. 발음으로 막힐 일은 없겠어요.' },
  { min:75, n:'상급',       s:'잘 전달됩니다. 긴 문장에서 조금씩 흐려지는 정도예요.' },
  { min:60, n:'중급',       s:'대체로 알아듣습니다. 받침과 연음을 다듬으면 확 올라가요.' },
  { min:40, n:'초급',       s:'짧은 구절은 잘 됩니다. 천천히 끊어 읽는 연습을 해보세요.' },
  { min:0,  n:'입문',       s:'지금부터 소리 내어 읽는 연습을 시작하면 됩니다.' },
];

const ptId = id => document.getElementById(id);
let ptText = '', ptHeardAll = '', ptRec = null, ptRunning = false;

/* 한글 음절을 초성·중성·종성으로 쪼갠다.
   "감"과 "간"은 자모로 보면 셋 중 하나만 다른데,
   음절로 세면 통째로 틀린 게 되어 점수가 과하게 깎인다. */
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('');
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function toJamo(s) {
  const out = [];
  for (const ch of s) {
    const code = ch.charCodeAt(0) - 0xAC00;
    if (code >= 0 && code <= 11171) {
      out.push(CHO[Math.floor(code / 588)], JUNG[Math.floor((code % 588) / 28)]);
      const j = JONG[code % 28];
      if (j) out.push(j);
    } else out.push(ch);
  }
  return out;
}

/* 편집 거리. 지문이 짧아 단순 DP로 충분하다.

   지문 앞뒤로 덧붙은 말은 세지 않는다. 지문은 처음부터 끝까지 다 맞춰야
   하지만, 읽기 전의 "음…", 다 읽고 나온 "휴~", 더듬다가 다시 읽어서 통째로
   한 번 더 들어간 것까지 벌하지는 않는다. 그 학생은 지문을 읽은 것이다.

   고치기 전에는 지문을 두 번 읽으면 0점이었다. 편집거리가 지문 자모 수와
   똑같아져서(74/74) 1-1 이 되기 때문인데, 정작 화면의 "다르게 들린 곳" 은
   32글자를 전부 맞다고 칠했다. 점수와 화면이 정면으로 어긋났다.

   d[i][0] 을 i 대신 0 으로 두면 said 의 앞부분을 공짜로 건너뛰고,
   마지막 열의 최솟값을 답으로 삼으면 뒷부분을 공짜로 버린다. 가운데에
   빠뜨리거나 덧붙인 것은 그대로 값을 치른다. 아래 diffHtml 도 같은 규칙으로
   되짚는다 — 규칙이 다르면 또 어긋난다. */
function editDist(a, b) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let best = prev[n];
  for (let i = 1; i <= m; i++) {
    const cur = [0];
    for (let j = 1; j <= n; j++) {
      cur[j] = a[i-1] === b[j-1] ? prev[j-1] : 1 + Math.min(prev[j-1], prev[j], cur[j-1]);
    }
    prev = cur;
    if (prev[n] < best) best = prev[n];
  }
  return best;
}

/* 띄어쓰기와 문장부호는 뺀다. 음성 인식이 붙였다 뗐다 하는 게 제각각이라
   그것 때문에 점수가 흔들리면 발음을 재는 게 아니게 된다.

   NFC 로 맞추는 이유: toJamo 는 '가'(U+AC00) 같은 완성형만 쪼갠다. 인식기가
   분해형(NFD)으로 주면 글자가 이미 ㄱ+ㅏ 로 갈라져 있는데, 그 낱자는
   U+1100 계열이고 CHO/JUNG/JONG 표는 U+3131 계열(호환 자모)이라 하나도
   안 맞는다. 실측했다 — 만점짜리 발음이 0점이 된다. 지금 크롬은 완성형을
   주므로 이 줄은 아무것도 바꾸지 않지만, 브라우저·OS 조합에 달린 일이라
   안 걸린다고 안전한 게 아니다. */
const clean = s => (s || '').normalize('NFC').replace(/[\s.,!?~·"'…]/g, '');

/* 점수와 함께 "자모 몇 개 중 몇 개가 어긋났는지" 를 같이 낸다.
   87점이라는 숫자만으로는 얼마나 틀린 건지 알 수가 없다. 74개 중 9개라고
   적어 주면 학생이 스스로 가늠한다 — 이 화면의 원칙이 계속 그거였다. */
function accuracyDetail(said, target) {
  const a = toJamo(clean(said)), b = toJamo(clean(target));
  if (!b.length) return { score: 0, off: 0, total: 0 };
  const off = editDist(a, b);
  return { score: Math.max(0, Math.round((1 - off / b.length) * 100)), off, total: b.length };
}

function accuracy(said, target) {
  return accuracyDetail(said, target).score;
}

/* 어느 글자가 어긋났는지 되짚는다.
   비교는 공백을 뺀 글자끼리 하되, 화면에는 원래 지문 그대로
   띄어쓰기와 마침표를 살려 보여준다. 공백을 지운 채로 뿌리면
   한 덩어리가 되어 줄바꿈이 안 되고 옆으로 잘려나간다.

   editDist 와 같은 규칙으로 센다 — 앞뒤로 덧붙은 말은 세지 않는다.
   여기만 예전처럼 끝(d[m][n])에서 되짚으면 점수와 표시가 또 어긋난다. */
function diffHtml(said, target) {
  const A = [...clean(said)], B = [...clean(target)];
  const m = A.length, n = B.length;
  const d = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (j === 0 ? 0 : i === 0 ? j : 0)));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = A[i-1] === B[j-1] ? d[i-1][j-1]
        : 1 + Math.min(d[i-1][j-1], d[i-1][j], d[i][j-1]);

  const mark = new Array(n).fill(false);   // 지문 글자: true = 맞음
  const extra = new Array(m).fill(false);  // 들린 글자: true = 값을 치른 덧붙임
  /* 마지막 열에서 가장 싼 줄이 지문과 제일 잘 맞는 자리다. 거기서 되짚는다.
     값이 같으면 늦은 줄(<=)을 고른다. 이른 줄을 고르면 들린 말의 뒷부분을
     공짜로 버리는 쪽을 택하는데, 지문 마지막 글자 바로 앞에 뭘 덧붙였을 때
     그게 표시를 한 칸 밀어 버린다 — 실측: '마셔요' 를 '마셔하요' 로 읽으면
     덧붙인 '하' 대신 제대로 읽은 '요' 가 빨갛게 칠해졌다. 값이 같으므로
     점수는 어느 쪽이든 똑같고, 화면만 맞는 쪽으로 고르는 것이다. */
  let i = 0;
  for (let k = 1; k <= m; k++) if (d[k][n] <= d[i][n]) i = k;
  let j = n;
  /* 값이 같은 길이 여럿일 때 무엇을 먼저 고르냐가 화면을 바꾼다.
     "덧붙임" 을 "바뀜" 보다 먼저 본다. 안 그러면 지문에 없는 말을 끼워 넣었을 때
     그걸 지문 글자에 억지로 맞춰 버린다 — 실측: 지문 '학교에 같이 가요' 를
     '어어 학교에 아무말 같이 가요 음음' 으로 읽으면 값이 같은 두 길이 생기는데,
     바뀜을 먼저 고르면 제대로 읽은 '학교에' 가 빨갛게 칠해지고 정작 덧붙인
     '아무말' 은 표시가 안 됐다. 학생에게 안 틀린 걸 틀렸다고 하는 셈이다.
     덧붙임을 먼저 보면 '학교에' 는 맞다고 남고 '아무말' 이 표시된다.
     이 가지는 최적 경로일 때만 잡히므로(값이 딱 맞아야 한다) 진짜로 발음이
     바뀐 경우까지 덧붙임으로 넘기지는 않는다. */
  while (i > 0 && j > 0) {
    if (A[i-1] === B[j-1] && d[i][j] === d[i-1][j-1]) { mark[j-1] = true; i--; j--; }
    else if (d[i][j] === d[i-1][j] + 1) { extra[i-1] = true; i--; }   // 덧붙임
    else if (d[i][j] === d[i-1][j-1] + 1) { i--; j--; }               // 바뀜
    else { j--; }                                                      // 빠뜨림
  }

  /* 원문을 훑으며 공백·문장부호는 그대로 두고 글자에만 표시를 붙인다.
     여기서도 NFC 로 맞춰야 한다 — clean() 이 정규화한 뒤 센 표시(mark/extra)를
     정규화 안 한 원문에 붙이면 글자 수가 달라져 표시가 한 칸씩 밀린다. */
  const targetN = (target || '').normalize('NFC');
  const saidN = (said || '').normalize('NFC');
  let k = 0;
  const html = [...targetN].map(ch => {
    if (/[\s.,!?~·"'…]/.test(ch)) return ch;
    const ok = mark[k++];
    return `<span class="${ok ? 'ok' : 'no'}">${ch}</span>`;
  }).join('');

  /* 들린 말 쪽에도 표시를 붙인다.
     지문 가운데에 없는 말을 끼워 넣으면 점수는 깎이는데 위 표시는 지문
     글자만 칠하므로 화면이 전부 초록으로 남는다 — 무작위 변형 2000개 중
     253개가 그랬다. 깎인 자리를 볼 데가 없으면 점수를 믿을 수 없다.
     앞뒤로 덧붙은 말은 값을 안 치르므로 여기서도 칠하지 않는다.

     지문은 우리가 쓴 글이라 그냥 넣지만, 들린 말은 인식기가 준 것이라
     꺾쇠와 앰퍼샌드를 반드시 막는다. */
  const eb = c => c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c;
  let h = 0;
  const heardHtml = [...saidN].map(ch => {
    if (/[\s.,!?~·"'…]/.test(ch)) return eb(ch);
    const ex = extra[h++];
    return ex ? `<span class="add">${eb(ch)}</span>` : eb(ch);
  }).join('');

  const wrong = mark.filter(v => !v).length;
  return { html, heardHtml, wrong, added: extra.filter(Boolean).length, total: n };
}

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

function ptPick() {
  // 방금 읽은 지문은 피한다. 다시 눌렀는데 같은 글이 나오면 맥이 빠진다.
  const pool = PT();
  let next = ptText;
  while (next === ptText && pool.length > 1) next = pool[Math.floor(Math.random() * pool.length)];
  ptText = next || pool[0];
  ptPickedLevel = ptLevel;
  ptId('ptTarget').textContent = ptText;
  ptHeardAll = '';
  ptFinals = [];
  ptId('ptLive').textContent = '';
  ptId('ptLiveWrap').classList.add('hidden');
  ptId('ptMic').classList.remove('rec');
  ptId('ptMic').disabled = false;
  // 영어 화면에서 지문을 바꾸면 안내만 한국어로 돌아가 있었다.
  ptId('ptHint').textContent = ptIsEn()
    ? 'Tap the mic and start reading'
    : '마이크를 누르고 읽기 시작하세요';
}

/* 말이 끊기면 저절로 끝낸다.
   다 읽고 나서 마이크를 다시 누르러 가는 게 번거롭고, 누르는 걸 잊으면
   마이크가 계속 켜져 있다.

   2.5초로 잡은 이유: 지문이 두 문장이라 중간에 쉼이 생기는데, 보통
   문장 사이 쉼은 1초 안쪽이다. 너무 짧게 잡으면 읽는 도중에 끊긴다. */
const PT_SILENCE_MS = 2500;
/* 권한만 허용하고 아무 말도 안 한 경우. 마이크를 켠 채로 두지 않는다.

   9초였는데 20초로 늘렸다. 학생이 마이크를 누른 뒤 지문을 읽고, 무슨 뜻인지
   가늠하고, 숨을 고르고 나서 소리를 낸다. 한국어를 배우는 사람에게 두 문장은
   9초 안에 읽기 시작할 수 있는 글이 아니다.

   게다가 안드로이드 크롬은 5초쯤 조용하면 스스로 no-speech 를 내고 끝낸다.
   예전에는 그 순간 바로 "소리가 안 들렸어요" 가 떴다 — 학생이 이제 막
   읽으려던 참인데. 이제 아래 onend 가 다시 켜므로, 끝낼지 말지는 이 시계가
   정한다. 그래서 이 값이 곧 "읽기 시작할 때까지 기다려 주는 시간" 이다. */
const PT_NOSPEECH_MS = 20000;

/* 마지막 방패. 침묵 시계가 어떤 이유로든 안 먹어도 마이크는 반드시 꺼진다.
   실제로 학생 두 명이 이걸로 막혔다 — 인식기가 같은 말을 되보내는 바람에
   글자가 계속 "늘어나" 침묵 시계가 영영 다시 감겼고, 마이크가 켜진 채로
   화면이 글자로 뒤덮였다. 아래 onresult 가 그 원인을 없앴지만, 원인을
   고쳤다고 방패를 안 두면 다음 브라우저에서 같은 일이 또 난다.

   지문 길이에 맞춰 늘린다. 어려움 단계는 글이 길어 천천히 읽으면
   1분 가까이 걸린다. 여유를 크게 잡는 이유는 이게 평소에 쓰이는 시계가
   아니라 사고가 났을 때만 도는 시계이기 때문이다. */
const ptMaxMs = () => Math.min(90000, 25000 + ptText.length * 800);

/* 인식된 글자 길이 상한. 35자 지문을 읽는데 그 세 배가 넘게 들렸다면
   이미 발음을 재는 상황이 아니다. 더 들어봐야 점수는 0에서 안 움직이고
   화면과 AI 요청만 뚱뚱해진다. */
const ptMaxChars = () => ptText.length * 3 + 30;

let ptSilenceTimer = null;
let ptMaxTimer = null;
let ptRetryTimer = null;
let ptLastText = '';
let ptFinals = [];       // 이번 회차에서 확정된 결과 (아래 onresult 참고)
let ptCommitted = '';    // 지난 회차들에서 넘겨받은 말
let ptAborted = false;   // 채점하지 말고 그냥 끄라는 표시
let ptStopping = false;  // 우리가 끄는 중이다 = 다시 켜지 말 것
let ptHintLocked = false; // 안내에 이미 까닭을 적었다 = 덮어쓰지 말 것
let ptStarted = false;   // 소리를 잡기 시작한 적이 있다 (회차마다가 아니라 한 번)

function ptArmSilence(ms) {
  clearTimeout(ptSilenceTimer);
  ptSilenceTimer = setTimeout(() => { if (ptRunning) ptStop(); }, ms);
}

/* 조각을 이어 붙이되, 앞 조각이 "자라난 것" 이면 갈아 끼운다.

   모바일 크롬·사파리는 중간 결과를 한 칸에서 갈아 끼우지 않고 새 칸에 쌓아
   보낸다. 실제로 이렇게 온다:

       주말에
       주말에 친구들과
       주말에 친구들과 바다에
       주말에 친구들과 바다에 다녀왔습니다

   이건 네 마디가 아니라 **한 마디가 자라는 중**이다. 그대로 이으면
   "주말에 주말에 친구들과 주말에 친구들과 바다에 …" 로 눈덩이가 된다.
   학생 화면에 나온 게 그거다. 데스크톱은 한 칸을 갈아 끼우므로 안 보였다.

   앞 조각을 통째로 품고 있으면 자란 것으로 보고 갈아 끼운다. 띄어쓰기는
   빼고 견준다 — 인식기가 띄어쓰기를 붙였다 뗐다 하는 게 제각각이라
   "주말에친구들과" 와 "주말에 친구들과" 를 다른 말로 보면 안 걸러진다.
   서로 품지 않는 조각(두 문장처럼)은 그대로 이어 붙는다. */
function ptJoin(parts) {
  const bare = (s) => s.replace(/\s+/g, '');
  const out = [];
  for (const raw of parts) {
    const p = (raw || '').trim();
    if (!p) continue;
    const i = out.length - 1;
    if (i >= 0) {
      if (bare(p).startsWith(bare(out[i]))) { out[i] = p; continue; }  // 자랐다
      if (bare(out[i]).startsWith(bare(p))) continue;                  // 되풀이
    }
    out.push(p);
  }
  return out.join(' ');
}

/* 이번 회차에서 확정된 말을 넘겨 담는다.
   다시 켜면 결과 번호가 0부터 다시 시작하므로, 여기서 안 옮기면
   다음 회차가 앞 문장을 덮어써 버린다. */
function ptCommit() {
  const seg = ptJoin(ptFinals);
  ptFinals = [];
  if (!seg) return;
  // 끄고 켜는 사이에 앞 회차 것을 다시 보내는 인식기가 있다. ptJoin 이 거른다.
  ptCommitted = ptJoin([ptCommitted, seg]);
}

/* abort = true 면 끄기만 하고 채점하지 않는다.
   지문을 바꾸거나 화면을 떠날 때 쓴다. 안 그러면 "다른 지문으로" 를
   눌렀는데 방금 끊긴 녹음이 결과 화면을 띄워 버린다. */
function ptStop(abort) {
  ptStopping = true;   // 이 뒤에 오는 onend 는 다시 켜지 않는다
  clearTimeout(ptSilenceTimer);
  clearTimeout(ptMaxTimer);
  clearTimeout(ptRetryTimer);
  if (abort) ptAborted = true;
  if (ptRec) { try { ptRec.stop(); } catch (e) {} }
}

/* 진짜로 끝났을 때 하는 일. onend 에서 두 갈래(다시 켜기 / 끝내기)로
   갈리므로 끝내는 쪽을 따로 뺐다. */
function ptEnd() {
  clearTimeout(ptSilenceTimer);
  clearTimeout(ptMaxTimer);
  clearTimeout(ptRetryTimer);
  ptRunning = false;
  ptRec = null;
  ptId('ptMic').classList.remove('rec');
  ptId('ptMic').setAttribute('aria-label', '녹음 시작');
  // 지문을 바꾸거나 화면을 떠나면서 끈 것이다. 채점하지 않는다.
  if (ptAborted) { ptAborted = false; return; }
  const said = ptHeardAll.trim();
  if (said) ptFinish(said);
  // 권한 거부처럼 까닭이 분명한 경우엔 그 안내를 남긴다. 예전에는 여기서
  // "소리가 안 들렸어요" 로 덮어써서, 학생이 왜 안 되는지 알 수가 없었다.
  else if (!ptHintLocked) ptId('ptHint').textContent = ptT(
    '소리가 안 들렸어요. 다시 눌러주세요.',
    'Nothing came through. Tap again.');
}

function ptListen() {
  if (ptRunning) { ptStop(); return; }   // 두 번째 누름 = 끝내기
  ptRunning = true;
  ptHeardAll = '';
  ptLastText = '';
  ptFinals = [];
  ptCommitted = '';
  ptAborted = false;
  ptStopping = false;
  ptHintLocked = false;
  ptStarted = false;

  const rec = new SR();
  ptRec = rec;
  rec.lang = 'ko-KR';
  /* 지문이 두 문장이라 중간 쉼에서 끊기면 안 된다. 이어서 듣게 한다.
     다만 이건 데스크톱에서만 지켜진다 — 모바일은 아래 onend 가 다시 켠다. */
  rec.continuous = true;
  rec.interimResults = true;

  ptId('ptMic').classList.add('rec');
  ptId('ptMic').setAttribute('aria-label', '녹음 끝내기');
  ptId('ptHint').textContent = ptT(
    '듣고 있어요 — 다 읽고 잠시 기다리면 저절로 끝나요',
    'Listening — pause when you finish and it stops on its own');
  ptId('ptLiveWrap').classList.remove('hidden');

  /* 결과는 "이어붙이지" 않고 번호 칸에 덮어쓴다.

     예전에는 e.resultIndex 부터 훑으며 확정된 조각을 ptHeardAll 에 +=
     했다. 안드로이드 크롬은 continuous 로 들을 때 이미 확정된 결과를
     resultIndex 0 부터 통째로 다시 보내는 일이 있는데, 그러면 매번
     지금까지 나온 걸 전부 다시 붙여서 같은 말이 눈덩이처럼 불어난다.
     게다가 글자가 계속 늘어나니 아래 침묵 시계가 영영 다시 감겨
     마이크가 꺼지지도 않았다. 학생들이 겪은 게 이거다.

     번호 칸(ptFinals[i])에 넣으면 같은 결과가 몇 번을 다시 와도 제자리에
     덮어써서 결과가 같다. 0번부터 매번 다시 훑는 이유도 같다 —
     인식기가 resultIndex 를 어떻게 주든 상관없이 답이 하나로 정해진다.
     레슨의 말하기 문제(.ex-mic)도 처음부터 이 방식이었다.

     칸에 넣는 것만으로는 모자란다. 모바일은 자라나는 중간 결과를 **서로 다른
     칸에** 쌓아 보내기 때문에, 칸마다 제자리에 잘 들어가 있어도 이어 붙이면
     눈덩이가 된다. 그래서 이을 때 ptJoin 이 자란 조각을 갈아 끼운다. */
  rec.onresult = (e) => {
    const interims = [];
    for (let i = 0; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) ptFinals[i] = r[0].transcript;
      else { ptFinals[i] = ''; interims.push(r[0].transcript); }
    }
    // 지난 회차에서 넘겨받은 말이 앞에 붙는다 (아래 onend 참고).
    ptHeardAll = ptJoin([ptCommitted, ptJoin(ptFinals)]);
    const now = ptJoin([ptHeardAll, ptJoin(interims)]);
    ptId('ptLive').textContent = now;

    // 지문 길이의 세 배가 넘게 들렸으면 더 들을 이유가 없다.
    if (now.length > ptMaxChars()) { ptStop(); return; }

    // 글자가 실제로 늘었을 때만 시계를 되돌린다. 브라우저에 따라
    // 같은 중간 결과를 계속 다시 보내는데, 그것까지 세면 말을 멈춰도
    // 영영 안 끝난다.
    if (now && now !== ptLastText) {
      ptLastText = now;
      ptArmSilence(PT_SILENCE_MS);
    }
  };

  rec.onerror = (e) => {
    /* 다시 켜 봐야 소용없는 오류다. 여기서 안 막으면 아래 onend 가 다시
       켜고, 또 같은 오류가 나고, 끝없이 돈다 — 권한을 거부한 학생의
       화면에서 그 고리가 계속 돌게 된다. */
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') {
      ptStopping = true;
    }

    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      ptId('ptHint').textContent = ptT(
        '마이크 권한이 필요해요. 주소창 옆에서 허용해주세요.',
        'Microphone access is needed. Allow it next to the address bar.');
      ptHintLocked = true;
    } else if (e.error === 'audio-capture') {
      ptId('ptHint').textContent = ptT(
        '마이크를 찾지 못했어요.',
        'No microphone was found.');
      ptHintLocked = true;
    } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
      ptId('ptHint').textContent = ptT(
        '잘 못 들었어요. 다시 눌러주세요.',
        'That did not come through. Tap again.');
      ptHintLocked = true;
    }
  };

  /* 소리를 실제로 잡기 시작한 순간. 여기서 "아무 말도 안 함" 시계를 건다.
     start() 직후에 걸면 모바일에서 마이크 권한 창이 떠 있는 동안 그 시계가
     돌아간다 — 처음 오는 학생이 "허용" 을 못 누르는 사이에 끊겼다.

     딱 한 번만 건다. 아래 onend 가 다시 켜면 onstart 도 다시 오는데, 그때마다
     다시 걸면 시계가 매번 처음으로 돌아가 영영 안 울린다. 그러면 아무 말도
     안 한 학생의 마이크가 마지막 방패(약 53초)까지 켜져 있게 된다. */
  rec.onstart = () => {
    if (ptStarted) return;
    ptStarted = true;
    ptArmSilence(PT_NOSPEECH_MS);
    ptId('ptHint').textContent = ptT(
      '듣고 있어요 — 천천히 읽기 시작하세요',
      'Listening — start reading whenever you are ready');
  };

  rec.onend = () => {
    ptCommit();

    /* 모바일에서 continuous 는 지켜지지 않는다. 안드로이드 크롬도 iOS
       사파리도 첫 쉼에서 인식을 끝내 버린다. 지문이 두 문장이라 학생이
       문장 사이에서 숨을 쉬면 딱 거기서 잘렸다 — 앞 문장만 읽은 셈이 되어
       50점이 나온다. 끝내라고 한 적이 없으면 다시 켠다. 언제 끝낼지는
       침묵 시계(2.5초)와 마지막 방패가 정한다. 그 둘은 계속 돌고 있다. */
    if (ptRunning && !ptStopping) {
      try { rec.start(); return; } catch (e) {}
      // 엔진이 아직 정리 중이면 잠깐 뒤에 한 번만 더 해 본다.
      ptRetryTimer = setTimeout(() => {
        if (!ptRunning || ptStopping) return;
        try { rec.start(); } catch (e) { ptEnd(); }
      }, 300);
      return;
    }

    ptEnd();
  };

  try {
    rec.start();
    // 위 시계와 별개로 도는 마지막 방패. 여기서는 되감지 않는다.
    clearTimeout(ptMaxTimer);
    ptMaxTimer = setTimeout(() => { if (ptRunning) ptStop(); }, ptMaxMs());
  } catch (err) {
    ptRunning = false;
    clearTimeout(ptSilenceTimer);
    clearTimeout(ptMaxTimer);
    ptId('ptHint').textContent = ptT('다시 눌러주세요.', 'Tap again.');
  }
}

function ptFinish(said) {
  // 상한을 넘은 건 이미 발음 자료가 아니다. 화면과 AI 요청이 그만큼
  // 커지지 않게 여기서 한 번 더 자른다.
  said = said.slice(0, ptMaxChars());

  const { score, off, total } = accuracyDetail(said, ptText);
  const lv = PT_LV.find(l => score >= l.min);
  ptId('ptPlay').classList.add('hidden');
  ptId('ptDone').classList.remove('hidden');
  ptId('ptFinal').textContent = score;
  ptId('ptLevelName').textContent = lv.n;
  ptId('ptVerdict').textContent = lv.s;

  /* 어느 단계 지문이었는지 남긴다. 점수 기준은 세 단계가 같으므로
     이 표시가 없으면 90점이 쉬움에서 나온 건지 어려움에서 나온 건지
     알 수 없다. data-ko/en 을 같이 심어 두면 나중에 언어를 바꿔도
     applyLang 이 알아서 따라온다. */
  const tag = ptId('ptLvTag');
  const nm = PT_LV_NAME[ptPickedLevel] || PT_LV_NAME.normal;
  tag.dataset.ko = nm.ko;
  tag.dataset.en = nm.en;
  tag.textContent = ptIsEn() ? nm.en : nm.ko;

  // 87점이 얼마나 틀린 건지는 숫자만으로 알 수 없다. 센 것을 그대로 적는다.
  const cnt = ptId('ptCount');
  cnt.dataset.ko = `자모 ${total}개 중 ${off}개 어긋남`;
  cnt.dataset.en = `${off} of ${total} letter parts off`;
  cnt.textContent = ptIsEn() ? cnt.dataset.en : cnt.dataset.ko;

  const df = diffHtml(said, ptText);
  ptId('ptDiff').innerHTML = df.html;
  // 지문에 없는데 들린 말은 여기에 표시된다. 깎인 점수의 나머지 반쪽이다.
  ptId('ptHeard').innerHTML = df.heardHtml;

  // AI 짐작은 아래 모듈 스크립트가 맡는다. 없거나 실패하면 그냥 넘어간다 —
  // 점수와 글자 표시는 여기서 이미 다 그렸으므로 화면이 비지 않는다.
  if (window.ptAiGuess) window.ptAiGuess(ptText, said, score);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

ptId('ptStart').addEventListener('click', () => {
  if (!SR) {
    ptId('ptCover').classList.add('hidden');
    ptId('ptUnsupported').classList.remove('hidden');
    return;
  }
  ptId('ptCover').classList.add('hidden');
  ptId('ptPlay').classList.remove('hidden');
  ptPick();
});

ptId('ptMic').addEventListener('click', ptListen);
// 듣던 중에 눌렀다면 채점하지 않고 끈다. 지문을 바꾸겠다는 뜻이지
// 방금 읽은 걸 매겨 달라는 뜻이 아니다.
ptId('ptSkip').addEventListener('click', () => { ptStop(true); ptPick(); });
ptId('ptAgain').addEventListener('click', () => {
  ptId('ptDone').classList.add('hidden');
  ptId('ptPlay').classList.remove('hidden');
  ptPick();
});

/* ── 난이도 (쉬움 · 보통 · 어려움) ──────────────────────
   토글이 두 군데(시작 화면·읽기 화면)에 있다. 학생이 지문을 받기 전에도,
   읽다가 어렵다 싶을 때도 바꿀 수 있어야 하는데, 한 곳에만 두면 둘 중
   하나가 불편해진다. 대신 값은 한 곳(ptLevel)에만 두고 두 토글을 거기에
   맞춘다 — 화면마다 따로 기억하면 서로 달라져서 어느 게 맞는지 모른다. */
const PT_LV_DESC = {
  easy:   { ko:'한 문장, 12~18자. 받침이 단순하고 연음이 거의 없어요.',
            en:'One short sentence. Simple endings, almost no liaison.' },
  normal: { ko:'두 문장, 35자 안팎. 기본 지문이에요.',
            en:'Two sentences, about 35 characters. The default.' },
  hard:   { ko:'두 문장, 45~55자. 겹받침과 연음이 여러 번 나와요.',
            en:'Two long sentences. Consonant clusters and liaison throughout.' },
};

function ptSetLevel(lv) {
  if (!PT_SETS[lv]) return;
  ptLevel = lv;
  document.querySelectorAll('.pt-lv input[type=radio]')
    .forEach(r => { r.checked = (r.value === lv); });
  // 설명은 data-ko/en 을 같이 심어 둔다. 언어를 바꾸면 applyLang 이 따라온다.
  const d = ptId('ptLvDesc'), t = PT_LV_DESC[lv];
  if (d && t) {
    d.dataset.ko = t.ko;
    d.dataset.en = t.en;
    d.textContent = ptIsEn() ? t.en : t.ko;
  }
  try { localStorage.setItem('ptLevel', lv); } catch (e) {}
}

document.querySelectorAll('.pt-lv').forEach(seg => {
  seg.addEventListener('change', (e) => {
    const r = e.target.closest('input[type=radio]');
    if (!r) return;
    ptSetLevel(r.value);
    // 읽는 중에 바꿨으면 그 단계 지문을 바로 내준다. 바꿔 놓고 예전
    // 지문이 그대로 있으면 안 바뀐 줄 안다. 듣던 것은 채점 없이 끈다.
    if (!ptId('ptPlay').classList.contains('hidden')) { ptStop(true); ptPick(); }
  });
});

// 한 번 고른 단계는 기억한다. 매번 다시 고르게 하지 않는다.
(function initPtLevel() {
  let saved = null;
  try { saved = localStorage.getItem('ptLevel'); } catch (e) {}
  ptSetLevel(PT_SETS[saved] ? saved : 'normal');
})();

ptId('ptShare').addEventListener('click', async () => {
  const score = ptId('ptFinal').textContent;
  const name = ptId('ptLevelName').textContent;
  // 어느 단계 지문이었는지 같이 적는다. 세 단계가 같은 기준으로 채점되니
  // 이게 빠지면 받은 사람이 점수만 보고 서로 비교하게 된다.
  const diff = (PT_LV_NAME[ptPickedLevel] || PT_LV_NAME.normal).ko;
  const text = `한국어 발음 테스트 ${score}점 — ${name} (${diff} 지문)\n${location.href}`;
  try {
    if (navigator.share) await navigator.share({ text });
    else {
      await navigator.clipboard.writeText(text);
      ptId('ptShare').textContent = '복사했어요';
      setTimeout(() => { ptId('ptShare').textContent = '결과 공유하기'; }, 1600);
    }
  } catch (e) { /* 공유창을 닫은 것뿐이라 아무것도 하지 않는다 */ }
});


// 홈 ↔ 테스트 전환. 히어로 버튼과 ☰ 가 같은 길로 들어와야
// 한쪽만 고치고 다른 쪽이 죽는 일이 없다.
function ptShow(toTest) {
  // 화면을 벗어나면 듣던 것을 멈춘다. 안 그러면 홈에서도 마이크가 살아 있다.
  // 채점은 하지 않는다 — 나가는 길에 결과 화면이 뜨면 홈으로 못 간다.
  if (ptRunning) ptStop(true);
  ptId('homeView').classList.toggle('hidden', toTest);
  ptId('testView').classList.toggle('hidden', !toTest);
  // 나머지 화면도 같이 닫는다. 안 닫으면 홈 위에 겹쳐 남는다.
  ptId('wordbookView').classList.add('hidden');
  ptId('authView').classList.add('hidden');
  ptId('libraryView').classList.add('hidden');
  ptId('dashView').classList.add('hidden');
  ptId('gamesView').classList.add('hidden');
  ptId('clawView').classList.add('hidden');
  ptId('matchView').classList.add('hidden');
  ptId('quizView').classList.add('hidden');
  ptId('numView').classList.add('hidden');
  ptId('learnView').classList.add('hidden');
  ptId('lessonView').classList.add('hidden');
  ptId('learnBtn')?.classList.remove('on');
  if (window.lsLeave) window.lsLeave();   // 레슨 안에서 듣던 것 정리
  ptId('wbBtn').classList.remove('on');
  ptId('authBtn').classList.remove('on');
  ptId('libBtn').classList.remove('on');
  ptId('dashBtn').classList.remove('on');
  ptId('gameBtn').classList.remove('on');
  // 집게나 퀴즈 시계가 돌고 있었다면 멈춘다. 아래 모듈 스크립트가
  // 나중에 실행되므로 있으면 부르는 식으로만 손댄다.
  if (window.clawStop) window.clawStop();
  if (window.qzStop) window.qzStop();
  const b = ptId('navBtn');
  // 아이콘은 🎙 로 둔다. 헤더에 있을 때는 ✕ 로 바꿔 "누르면 닫힌다" 를
  // 알렸지만, 메뉴 안에서는 고르는 순간 메뉴가 닫혀 그 ✕ 를 볼 일이
  // 없다. 다시 열었을 때만 보여 어색하다. 옆 항목들과 똑같이 .on 으로
  // 지금 여기라는 것만 보인다.
  b.classList.toggle('on', toTest);
  b.setAttribute('aria-label', toTest ? '홈으로' : '발음 테스트 열기');
  window.scrollTo({ top: 0, behavior: 'auto' });
  // 주소에 남긴다. 아래 cpMark 는 이 함수보다 뒤에 정의되지만, 화면 전환은
  // 사람이 눌러야 일어나므로 그때는 이미 있다.
  window.cpMark?.(toTest ? 'test' : 'home');
}
/* ── 주소와 화면 ──────────────────────────────────────────────
   화면 열 개를 한 페이지에서 갈아 끼운다. 주소가 하나뿐이면 브라우저는
   화면이 바뀐 것을 모른다. 그래서 이런 일이 있었다.

   - 뒤로가기가 앞 화면이 아니라 **사이트 밖**으로 나갔다. 폰에서는 뒤로
     스와이프 한 번에 사이트가 닫힌다.
   - 새로고침하면 어디에 있었든 늘 홈이었다.
   - 배우기를 남에게 링크로 보낼 수도, 즐겨찾기에 둘 수도 없었다.

   해시만 pushState 로 바꾼다. 경로(/learn)를 쓰면 GitHub Pages 가
   새로고침 때 404 를 낸다 — 정적 호스팅에는 그 주소에 해당하는 파일이 없다.

   **모르는 자리표는 건드리지 않는다.** 헤더와 메뉴의 다운로드가 #download 를
   그대로 쓰고 있어서(그쪽은 화면을 바꾸지 않고 굴러 내려가기만 한다),
   아무 해시나 받아 open() 에 넘기면 맞는 화면이 하나도 없어 전부 닫히고
   빈 페이지가 된다. */
const SLUG_VIEW = {
  wordbook: 'wordbook', account: 'account', library: 'library', dashboard: 'dashboard',
  learn: 'learn', test: 'test', games: 'games',
  // 게임 한 판과 레슨은 도중부터 열 수 없다. 주소로 들어오면 한 단계 위를 연다.
  claw: 'games', match: 'games', quiz: 'games', num: 'num', lesson: 'learn',
};

/* ══ 글자 크기 ═══════════════════════════════════════════════════
   잘 안 보이는 학습자를 위한 것이다. 이 판은 px 로 짜여 있어 rem 을
   바꿔도 안 커지므로, :root 에 zoom 을 걸어 브라우저가 그 배율로 다시
   배치하게 한다 — 글자만 커지고 칸이 안 커지면 글이 넘쳐 더 못 읽는다.

   app.js 는 모듈보다 먼저 도므로 여기 둔다. 저장해 둔 배율을 첫 그림
   전에 걸어야 화면이 한 번 작게 그려졌다 커지는 일이 없다. */
const TXT_KEY = 'cp_txt_scale';
const TXT_STEPS = [1, 1.15, 1.3, 1.5];

function txtRead() {
  try {
    const v = parseFloat(localStorage.getItem(TXT_KEY));
    return TXT_STEPS.includes(v) ? v : 1;
  } catch (e) { return 1; }
}
function txtApply(v) {
  /* 1 배면 아예 지운다. zoom:1 을 걸어 두면 브라우저에 따라 자잘한
     반올림 차이가 남는다. */
  document.documentElement.style.zoom = v === 1 ? '' : String(v);
  const i = TXT_STEPS.indexOf(v);
  const dn = document.getElementById('txtDown');
  const up = document.getElementById('txtUp');
  if (dn) dn.disabled = i <= 0;
  if (up) up.disabled = i >= TXT_STEPS.length - 1;
}
/* 저장한 값을 먼저 건다. 단추가 아직 없어도 배율은 걸린다. */
txtApply(txtRead());

function txtStep(dir) {
  const i = TXT_STEPS.indexOf(txtRead());
  const next = TXT_STEPS[Math.min(TXT_STEPS.length - 1, Math.max(0, i + dir))];
  try { localStorage.setItem(TXT_KEY, String(next)); } catch (e) {}
  txtApply(next);
}
document.getElementById('txtDown')?.addEventListener('click', () => txtStep(-1));
document.getElementById('txtUp')?.addEventListener('click', () => txtStep(1));

const VIEW_SLUG = {
  home: '', test: 'test', wordbook: 'wordbook', account: 'account',
  library: 'library', dashboard: 'dashboard', games: 'games',
  claw: 'claw', match: 'match', quiz: 'quiz', num: 'num', learn: 'learn', lesson: 'lesson',
};
let routeBusy = false;
/* 마지막으로 주소에 남긴 자리. 떠나기를 막았을 때 되돌릴 곳이다. */
let lastSlug = '';

/* 화면이 바뀔 때마다 주소에 남긴다. open() 과 ptShow() 가 둘 다 여기를 거친다.
   sub 는 그 화면 안에서 더 들어간 자리다 — 배우기의 갈래(#learn/topik)나
   예문 표현 하나(#learn/sentence/23-1) 같은 것.

   sub 가 없으면 여태처럼 화면 이름만 남긴다. 화면 안으로 들어갔는데 주소가
   그대로면 새로고침했을 때 갈래 목록으로 튕긴다 — 실제로 그랬다. */
window.cpMark = function (view, sub) {
  if (routeBusy) return;                 // 주소를 읽고 여는 중이면 다시 안 쓴다
  const base = VIEW_SLUG[view] ?? '';
  const slug = sub ? `${base}/${sub}` : base;
  if (location.hash.replace(/^#/, '') === slug) { lastSlug = slug; return; }   // 같은 자리면 히스토리를 안 늘린다
  lastSlug = slug;
  history.pushState(null, '', slug ? '#' + slug : location.pathname + location.search);
};

/* 라우터가 화면을 몰고 있는 중인가. 모듈 쪽 나가기 확인이 두 번 뜨지 않게
   하려고 알려 준다 — 라우터가 이미 물어봤으면 다시 묻지 않는다. */
window.cpRouteBusy = () => routeBusy;

/* 주소를 보고 화면을 연다. 뒤로/앞으로와 첫 접속이 이 길로 들어온다. */
function cpApply(slug) {
  /* 첫 토막이 화면 이름이고 나머지가 그 안에서 들어간 자리다. */
  const cut = String(slug).indexOf('/');
  const head = cut < 0 ? slug : slug.slice(0, cut);
  const sub = cut < 0 ? '' : slug.slice(cut + 1);
  if (head && !SLUG_VIEW[head]) return;  // #download 같은 남의 자리표는 그대로 둔다
  const view = SLUG_VIEW[head] || 'home';
  /* 떠나면 안 되는 것이 돌고 있으면(모의고사) 먼저 묻는다. 「머문다」를
     고르면 주소를 되돌리고 화면은 손대지 않는다. */
  if (slug !== lastSlug && window.cpBlockLeave && window.cpBlockLeave()) {
    history.pushState(null, '', lastSlug ? '#' + lastSlug : location.pathname + location.search);
    return;
  }
  routeBusy = true;
  try {
    if (view === 'test') ptShow(true);
    // 모듈이 아직 안 돌았으면 open() 이 없다. 그때는 홈이 안전하다.
    else if (view === 'home' || !window.cpOpen) ptShow(false);
    else window.cpOpen(view, sub);
    lastSlug = slug;
  } finally { routeBusy = false; }
}
window.addEventListener('popstate', () => cpApply(location.hash.replace(/^#/, '')));

/* 첫 화면. **주소에 화면이 적혀 있을 때만** 손댄다 — 안 적혀 있으면
   로그인하고 돌아온 흐름 같은 것이 정한 화면을 그대로 두어야 한다.
   모듈이 다 돌고 나서 불린다(그래야 cpOpen 이 있다). */
window.cpStart = function () {
  const slug = location.hash.replace(/^#/, '');
  const head = slug.split('/')[0];
  if (head && SLUG_VIEW[head]) cpApply(slug);
};

ptId('navBtn').addEventListener('click', () => {
  ptShow(ptId('testView').classList.contains('hidden'));
});
ptId('heroTestBtn').addEventListener('click', () => ptShow(true));

/* 한국어 / English
   원문(한국어)은 그대로 두고 data-en 에 영어를 달아 뒀다.
   영어를 못 붙인 곳은 자동으로 한국어가 남아 화면이 비지 않는다. */
let ptLang = 'ko';
function applyLang(lang) {
  ptLang = lang;
  document.querySelectorAll('[data-en]').forEach(el => {
    // 첫 전환 때 한국어 원문을 보관해 둔다. 안 그러면 되돌릴 수 없다.
    if (el.dataset.ko === undefined) el.dataset.ko = el.innerHTML;
    el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.ko;
  });
  /* 눈에 보이는 이름표가 없는 칸(찾기 상자, 갈래 고르기)은 aria-label 로만
     이름이 붙는다. 그건 innerHTML 이 아니라서 위 반복이 못 건드린다 —
     따로 바꿔 주지 않으면 영어 화면에서 화면 낭독기만 한국어로 읽는다. */
  document.querySelectorAll('[data-en-aria]').forEach(el => {
    if (el.dataset.koAria === undefined) el.dataset.koAria = el.getAttribute('aria-label') || '';
    el.setAttribute('aria-label', lang === 'en' ? el.dataset.enAria : el.dataset.koAria);
  });
  document.documentElement.lang = lang;
  const b = ptId('langBtn');
  b.textContent = lang === 'en' ? 'KO' : 'EN';
  b.setAttribute('aria-label', lang === 'en' ? '한국어로 보기' : 'Switch to English');
  // 지문은 한국어 발음을 재는 것이라 번역하지 않는다. 안내 문구만 바꾼다.
  ptId('ptHint').textContent = ptRunning
    ? (lang === 'en' ? 'Listening — pause when you finish and it stops on its own'
                     : '듣고 있어요 — 다 읽고 잠시 기다리면 저절로 끝나요')
    : (lang === 'en' ? 'Tap the mic and start reading'
                     : '마이크를 누르고 읽기 시작하세요');
}
ptId('langBtn').addEventListener('click', () => {
  const next = ptLang === 'ko' ? 'en' : 'ko';
  applyLang(next);
  try { localStorage.setItem('lang', next); } catch (e) {}
});

/* 기본은 영어다.
   이 사이트는 한국어를 **모르는** 사람에게 한국어를 가르친다. 한글을
   못 읽는 사람에게 한국어 화면을 내밀면 첫 화면에서 나간다.
   한 번 고른 언어는 기억해 두어 다음에 다시 고르게 하지 않는다. */
(function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  // 저장된 것이 없으면 브라우저 언어를 본다. 한국어 사용자에게까지
  // 영어를 들이밀 이유는 없다.
  const guess = (navigator.language || '').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  applyLang(saved || guess);
})();

/* ── 사이드 메뉴 ─────────────────────────────────────────────
   여닫는 길이 여럿(☰ · 스크림 · ✕ · Esc)이라 한 곳에 모아 둔다.
   상태를 각자 토글하면 스크림만 남거나 ☰ 모양만 안 돌아오는 일이
   생긴다. 여기 아래 모듈 스크립트에서 부를 일은 없다 — 스크림이
   헤더를 덮고 있어 메뉴가 열린 동안에는 다른 길이 없다. */
const sideNav = ptId('sideNav');
const menuBtn = ptId('menuBtn');

function setMenu(open) {
  /* **aria-hidden 을 걸기 전에 포커스를 먼저 빼낸다.**
     서랍 안의 항목을 누르면 그 단추가 포커스를 쥔 채로 남는데, 그대로
     조상에 aria-hidden 을 걸면 브라우저가 거부하고 콘솔에 경고를 낸다.
     화면 낭독기를 쓰는 사람이 「안 보이는 것」에 갇히는 것을 막는 규칙이라
     우회할 일이 아니다 — 포커스를 열었던 ☰ 로 돌려보낸다. 키보드로 메뉴를
     쓰던 사람도 닫고 나면 원래 있던 자리로 돌아온다.

     visibility:hidden 이 탭은 이미 막고 있지만 그건 전이가 끝난 뒤의
     이야기다. 닫는 0.38초 동안에는 아직 보이는 상태라 포커스가 살아 있다. */
  if (!open && sideNav.contains(document.activeElement)) menuBtn.focus();

  sideNav.classList.toggle('on', open);
  ptId('navScrim').classList.toggle('on', open);
  menuBtn.classList.toggle('open', open);
  document.body.classList.toggle('nav-open', open);
  sideNav.setAttribute('aria-hidden', open ? 'false' : 'true');
  menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');

  /* 열 때는 반대로 서랍 안으로 넣어 준다. 안 그러면 키보드 사용자는
     메뉴를 열어 놓고도 탭을 여러 번 눌러야 서랍에 닿는다. */
  if (open) ptId('sideClose').focus();
}

menuBtn.addEventListener('click', () => setMenu(!sideNav.classList.contains('on')));
ptId('navScrim').addEventListener('click', () => setMenu(false));
ptId('sideClose').addEventListener('click', () => setMenu(false));
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* 메뉴에서 무언가를 고르면 닫힌다. 각 버튼의 원래 동작은 그대로 두고
   닫기만 얹었다 — 항목이 늘어도 여기는 안 고쳐도 된다. */
ptId('sideList').addEventListener('click', (e) => {
  const link = e.target.closest('.nav-link');
  if (!link) return;
  /* data-nav-to 가 달린 항목은 제 손잡이가 없다. 헤더의 같은 단추를
     대신 눌러 준다 — 그쪽이 무엇을 하든 여기도 똑같이 한다. */
  const to = link.dataset.navTo;
  setMenu(false);
  if (to) ptId(to)?.click();
});
ptId('sideCta').addEventListener('click', () => setMenu(false));

