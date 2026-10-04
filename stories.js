/* 동화책 — 감자와 치즈가 나오는 짧은 이야기(운영자 결정 2026-10-03).
   배우기 › 동화책(#learn/stories)이 읽는다. app.module.js bkDraw.

   ── 저작권: 이 파일에서 가장 중요한 것 ─────────────────────
   **전부 새로 지은 이야기여야 한다.** 이미 있는 동화 · 전래동화 · 그림책 · 만화 · 영화 · 노래의
   줄거리 · 인물 · 문장 · 제목을 옮기거나 「조금 바꿔」 쓰지 않는다(흥부와 놀부 · 토끼와 거북이 ·
   신데렐라 · 뽀로로 같은 것 모두). 등장인물은 치즈감자의 감자 · 치즈와 이야기마다 새로 지은 이웃뿐.
   그림은 넣지 않는다 — 인물 얼굴은 levels.js 의 우리 그림(감자 · 치즈)만 쓴다.
   tools/check-stories.mjs 가 이름난 작품 · 인물 이름을 막는다(완벽하지 않다 — 검토가 먼저다).

   ── 밭 ───────────────────────────────────────────────────
   id     한 번 정하면 안 바꾼다(읽은 기록이 이 id 로 묶인다).
   lv     감자 레벨(1 = 입문 · 2 = 초급 · 3 = 초급 위). 문장 길이 · 문법을 그 레벨에 맞춘다.
   pages  [{ who, ko, en }] — 한 쪽에 한두 문장. who 는 그 쪽에서 말하는 이:
          'potato' 감자 · 'cheese' 치즈 · 'n' 해설(그 밖의 인물이 말해도 'n', 대사는 「이름: "…"」 꼴).
   words  이 이야기의 낱말 [{ ko, en }] — 본문에 실제로 나오는 꼴(또는 그 기본형).
   quiz   이해 확인 [{ q: { ko, en }, options: [한국어 넷], answer }] — answer 는 0부터. */

export const STORIES = [
  {
    id: 'sb-01', lv: 1,
    title: { ko: '비 오는 날의 우산', en: 'The Umbrella on a Rainy Day' },
    blurb: { ko: '빵을 사러 가야 하는데 우산이 없어요.', en: 'Potato needs bread, but there is no umbrella.' },
    pages: [
      { who: 'n',      ko: '아침에 비가 와요. 감자는 창밖을 봐요.', en: 'It is raining in the morning. Potato looks out the window.' },
      { who: 'potato', ko: '"아, 빵이 없어요. 빵집에 가야 해요."', en: '"Oh, there is no bread. I have to go to the bakery."' },
      { who: 'n',      ko: '감자는 우산을 찾아요. 그런데 우산이 없어요.', en: 'Potato looks for an umbrella. But there is no umbrella.' },
      { who: 'n',      ko: '그때 문이 열려요. 치즈가 노란 우산을 들고 서 있어요.', en: 'Just then the door opens. Cheese is standing there with a yellow umbrella.' },
      { who: 'cheese', ko: '"같이 가요! 제 우산은 커요."', en: '"Let’s go together! My umbrella is big."' },
      { who: 'n',      ko: '감자와 치즈는 우산 하나를 같이 쓰고 빵집에 가요.', en: 'Potato and Cheese share one umbrella and walk to the bakery.' },
      { who: 'potato', ko: '"치즈 씨, 고마워요. 빵은 제가 살게요!"', en: '"Thank you, Cheese. I’ll buy the bread!"' },
    ],
    words: [
      { ko: '비', en: 'rain' }, { ko: '우산', en: 'umbrella' }, { ko: '빵집', en: 'bakery' },
      { ko: '찾다', en: 'to look for' }, { ko: '같이', en: 'together' }, { ko: '고맙다', en: 'to be thankful' },
    ],
    quiz: [
      { q: { ko: '감자는 왜 밖에 나가요?', en: 'Why does Potato go out?' },
        options: ['빵을 사려고', '비를 보려고', '우산을 사려고', '치즈를 찾으려고'], answer: 0 },
      { q: { ko: '노란 우산은 누구의 우산이에요?', en: 'Whose is the yellow umbrella?' },
        options: ['감자', '빵집 사장님', '치즈', '감자의 엄마'], answer: 2 },
    ],
  },
  {
    id: 'sb-02', lv: 1,
    title: { ko: '치즈의 새 모자', en: "Cheese's New Hat" },
    blurb: { ko: '치즈가 시장에서 초록색 모자를 샀어요.', en: 'Cheese bought a green hat at the market.' },
    pages: [
      { who: 'n',      ko: '오늘 날씨가 조금 쌀쌀해요. 치즈는 시장에 가요.', en: 'The weather is a bit chilly today. Cheese goes to the market.' },
      { who: 'n',      ko: '모자 가게에 예쁜 모자가 많아요. 치즈는 초록색 털모자를 골라요.', en: 'There are many pretty hats at the hat shop. Cheese picks a green knit hat.' },
      { who: 'n',      ko: '치즈가 모자를 쓰고 감자의 집에 가요.', en: "Cheese puts on the hat and goes to Potato's house." },
      { who: 'potato', ko: '"어? 치즈 씨, 머리에 브로콜리가 있어요!"', en: '"Huh? Cheese, there’s broccoli on your head!"' },
      { who: 'cheese', ko: '"아니에요. 이건 제 새 모자예요."', en: '"No, it’s not. This is my new hat."' },
      { who: 'potato', ko: '"정말 귀여워요! 치즈 씨한테 잘 어울려요."', en: '"It is really cute! It suits you so well, Cheese."' },
      { who: 'n',      ko: '두 친구는 함께 웃으며 산책을 가요.', en: 'The two friends laugh together and go for a walk.' },
    ],
    words: [
      { ko: '쌀쌀하다', en: 'to be chilly' }, { ko: '모자', en: 'hat' }, { ko: '고르다', en: 'to choose, pick' },
      { ko: '귀엽다', en: 'to be cute' }, { ko: '어울리다', en: 'to suit' }, { ko: '산책', en: 'walk, stroll' },
    ],
    quiz: [
      { q: { ko: '치즈는 무슨 색 모자를 샀어요?', en: 'What color hat did Cheese buy?' },
        options: ['노란색', '초록색', '파란색', '빨간색'], answer: 1 },
      { q: { ko: '감자는 모자를 보고 무엇 같다고 했어요?', en: 'What did Potato say the hat looked like?' },
        options: ['사과', '나무', '브로콜리', '우산'], answer: 2 },
    ],
  },
  {
    id: 'sb-03', lv: 1,
    title: { ko: '조용한 도서관', en: 'The Quiet Library' },
    blurb: { ko: '감자와 치즈가 동네 도서관에 가요.', en: 'Potato and Cheese go to the neighborhood library.' },
    pages: [
      { who: 'n',      ko: '오후에 감자와 치즈는 동네 도서관에 가요.', en: 'In the afternoon, Potato and Cheese go to the neighborhood library.' },
      { who: 'n',      ko: '도서관 안은 아주 조용해요. 사람들이 책을 읽어요.', en: 'Inside the library is very quiet. People are reading books.' },
      { who: 'potato', ko: '"치즈 씨, 저는 그림책을 볼래요."', en: '"Cheese, I want to look at a picture book."' },
      { who: 'cheese', ko: '"좋아요. 저는 요리책을 찾을게요."', en: '"Sounds good. I will look for a cookbook."' },
      { who: 'n',      ko: '잠시 뒤에 감자가 치즈를 봐요. 치즈가 책상에서 자요.', en: 'A moment later, Potato looks at Cheese. Cheese is sleeping at the desk.' },
      { who: 'potato', ko: '"치즈 씨, 여기서 자면 안 돼요. 일어나세요."', en: '"Cheese, you cannot sleep here. Please wake up."' },
      { who: 'n',      ko: '치즈가 눈을 비벼요. 두 친구는 작게 웃어요.', en: 'Cheese rubs sleepy eyes. The two friends laugh quietly.' },
    ],
    words: [
      { ko: '조용하다', en: 'to be quiet' }, { ko: '그림책', en: 'picture book' }, { ko: '요리책', en: 'cookbook' },
      { ko: '잠시', en: 'a moment' }, { ko: '일어나다', en: 'to wake up' }, { ko: '비비다', en: 'to rub' },
    ],
    quiz: [
      { q: { ko: '감자는 도서관에서 무슨 책을 봐요?', en: 'What book does Potato look at in the library?' },
        options: ['그림책', '만화책', '요리책', '신문'], answer: 0 },
      { q: { ko: '치즈는 책상에서 무엇을 했어요?', en: 'What did Cheese do at the desk?' },
        options: ['노래했어요', '그림을 그렸어요', '밥을 먹었어요', '잠을 잤어요'], answer: 3 },
    ],
  },
  {
    id: 'sb-04', lv: 1,
    title: { ko: '초록색 버스', en: 'The Green Bus' },
    blurb: { ko: '버스 정류장에서 버스를 기다려요.', en: 'Waiting for the bus at the bus stop.' },
    pages: [
      { who: 'n',      ko: '감자와 치즈는 버스 정류장에 서 있어요.', en: 'Potato and Cheese are standing at the bus stop.' },
      { who: 'potato', ko: '"치즈 씨, 우리 버스가 언제 와요?"', en: '"Cheese, when is our bus coming?"' },
      { who: 'cheese', ko: '"조금만 기다려요. 곧 올 거예요."', en: '"Let’s wait a little. It will come soon."' },
      { who: 'n',      ko: '자동차가 많이 지나가요. 두 친구는 노란 차를 세어요.', en: 'Many cars pass by. The two friends count yellow cars.' },
      { who: 'potato', ko: '"하나, 둘, 셋, 넷, 다섯!"', en: '"One, two, three, four, five!"' },
      { who: 'cheese', ko: '"아, 저기 초록색 버스가 와요!"', en: '"Ah, over there the green bus is coming!"' },
      { who: 'n',      ko: '감자와 치즈는 반갑게 버스에 올라요.', en: 'Potato and Cheese happily get on the bus.' },
    ],
    words: [
      { ko: '정류장', en: 'bus stop' }, { ko: '기다리다', en: 'to wait' }, { ko: '지나가다', en: 'to pass by' },
      { ko: '세다', en: 'to count' }, { ko: '초록색', en: 'green color' }, { ko: '반갑다', en: 'to be glad' },
    ],
    quiz: [
      { q: { ko: '두 친구는 기다리면서 무슨 색 차를 세었어요?', en: 'What color cars did the two friends count while waiting?' },
        options: ['빨간 차', '검은 차', '하얀 차', '노란 차'], answer: 3 },
      { q: { ko: '두 사람이 탄 버스는 무슨 색이에요?', en: 'What color is the bus that the two people boarded?' },
        options: ['초록색', '파란색', '노란색', '주황색'], answer: 0 },
    ],
  },
  {
    id: 'sb-05', lv: 1,
    title: { ko: '따뜻한 붕어빵', en: 'Warm Fish-Shaped Bread' },
    blurb: { ko: '추운 저녁에 달콤한 붕어빵을 사요.', en: 'Buying sweet fish-shaped bread on a cold evening.' },
    pages: [
      { who: 'n',      ko: '겨울 저녁이에요. 바람이 불고 날씨가 추워요.', en: 'It is a winter evening. The wind blows and the weather is cold.' },
      { who: 'n',      ko: '길모퉁이에서 달콤하고 고소한 냄새가 나요.', en: 'A sweet and savory smell comes from the street corner.' },
      { who: 'potato', ko: '"치즈 씨, 저기 붕어빵 가게가 있어요!"', en: '"Cheese, there is a fish bread stand over there!"' },
      { who: 'cheese', ko: '"와, 맛있겠어요! 팥 붕어빵을 먹어요."', en: '"Wow, that looks delicious! Let’s eat red bean fish bread."' },
      { who: 'n',      ko: '감자는 천 원을 내고 붕어빵 두 개를 받아요.', en: 'Potato pays one thousand won and gets two fish breads.' },
      { who: 'cheese', ko: '"앗, 너무 뜨거워요! 호호 불어서 먹어야 해요."', en: '"Ouch, it is so hot! I have to blow on it to eat."' },
      { who: 'n',      ko: '두 친구는 따뜻한 붕어빵을 먹으며 집으로 걸어가요.', en: 'The two friends eat the warm fish bread and walk home.' },
    ],
    words: [
      { ko: '겨울', en: 'winter' }, { ko: '바람', en: 'wind' }, { ko: '냄새', en: 'smell, aroma' },
      { ko: '팥', en: 'red bean' }, { ko: '뜨겁다', en: 'to be hot' }, { ko: '걸어가다', en: 'to walk' },
    ],
    quiz: [
      { q: { ko: '감자는 붕어빵을 몇 개 샀어요?', en: 'How many fish breads did Potato buy?' },
        options: ['한 개', '두 개', '세 개', '네 개'], answer: 1 },
      { q: { ko: '붕어빵 안에는 무엇이 들어 있어요?', en: 'What is inside the fish bread?' },
        options: ['치즈', '감자', '팥', '초콜릿'], answer: 2 },
    ],
  },
  {
    id: 'sb-06', lv: 2,
    title: { ko: '옆집 할머니의 감나무', en: 'The Persimmon Tree of the Grandmother Next Door' },
    blurb: { ko: '가을에 옆집 할머니의 감 따기를 도와드려요.', en: 'Helping the neighbor grandmother pick persimmons in autumn.' },
    pages: [
      { who: 'n',      ko: '가을이 되어서 옆집 마당의 감나무에 주황색 감이 가득 열렸어요.', en: 'Autumn came, and the persimmon tree in the neighbor’s yard was full of orange persimmons.' },
      { who: 'n',      ko: '옆집 할머니가 마당에서 긴 장대를 들고 서 계셨어요.', en: 'The grandmother next door was standing in the yard holding a long pole.' },
      { who: 'potato', ko: '"할머니, 높은 곳에 있는 감이 안 닿으세요? 저희가 도와드릴게요."', en: '"Grandmother, can’t you reach the persimmons up high? We will help you."' },
      { who: 'cheese', ko: '"제가 상자를 잡고 있을 테니 감을 여기에 담으세요."', en: '"I will hold the box, so please put the persimmons in here."' },
      { who: 'n',      ko: '감자와 치즈는 할머니와 함께 잘 익은 감을 조심조심 땄어요.', en: 'Potato and Cheese carefully picked ripe persimmons together with the grandmother.' },
      { who: 'n',      ko: '할머니가 활짝 웃으며 말해요. "도와줘서 정말 고마워요. 이 감을 가져가서 맛있게 먹어요."', en: 'The grandmother smiled brightly and said: "Thank you so much for helping. Take these persimmons and enjoy them."' },
      { who: 'n',      ko: '두 친구는 달콤한 감을 한 바구니 들고 기쁘게 돌아왔어요.', en: 'The two friends came back happily carrying a basket of sweet persimmons.' },
    ],
    words: [
      { ko: '가을', en: 'autumn' }, { ko: '마당', en: 'yard' }, { ko: '장대', en: 'pole' },
      { ko: '담다', en: 'to put in' }, { ko: '익다', en: 'to ripen' }, { ko: '바구니', en: 'basket' },
    ],
    quiz: [
      { q: { ko: '할머니 마당에는 무슨 나무가 있었어요?', en: 'What tree was in the grandmother’s yard?' },
        options: ['감나무', '사과나무', '복숭아나무', '단풍나무'], answer: 0 },
      { q: { ko: '치즈는 감을 딸 때 무엇을 잡고 있었어요?', en: 'What was Cheese holding while picking persimmons?' },
        options: ['사다리', '우산', '장대', '상자'], answer: 3 },
    ],
  },
  {
    id: 'sb-07', lv: 2,
    title: { ko: '시장의 반찬 가게', en: 'The Market Side Dish Shop' },
    blurb: { ko: '저녁에 먹을 맛있는 반찬을 사러 가요.', en: 'Going to buy delicious side dishes for dinner.' },
    pages: [
      { who: 'n',      ko: '저녁 시간이 다 되었는데 냉장고에 반찬이 하나도 없었어요.', en: 'It was dinner time, but there were no side dishes in the refrigerator.' },
      { who: 'cheese', ko: '"감자 씨, 우리 전통시장에 있는 반찬 가게에 가요."', en: '"Potato, let’s go to the side dish shop in the traditional market."' },
      { who: 'n',      ko: '반찬 가게에는 김치, 멸치볶음, 계란말이가 줄지어 놓여 있었어요.', en: 'At the side dish shop, kimchi, stir-fried anchovies, and rolled omelet were lined up.' },
      { who: 'n',      ko: '가게 사장님이 이쑤시개에 계란말이를 꽂아 주셨어요. "방금 만들었으니 맛보세요."', en: 'The shop owner handed over rolled omelet on a toothpick: "I just made it, give it a taste."' },
      { who: 'potato', ko: '"정말 부드럽고 맛있어요! 계란말이랑 멸치볶음 주세요."', en: '"It is really soft and delicious! Please give us rolled omelet and stir-fried anchovies."' },
      { who: 'n',      ko: '치즈가 반찬 통을 가방에 넣고 두 사람은 집으로 향했어요.', en: 'Cheese put the side dish containers in the bag, and the two headed home.' },
      { who: 'n',      ko: '감자가 지은 따뜻한 밥에 맛있는 반찬을 얹어서 배부르게 먹었어요.', en: 'They put the tasty side dishes on the warm rice Potato had cooked and ate until they were full.' },
    ],
    words: [
      { ko: '냉장고', en: 'refrigerator' }, { ko: '전통시장', en: 'traditional market' }, { ko: '반찬', en: 'side dish' },
      { ko: '맛보다', en: 'to taste' }, { ko: '부드럽다', en: 'to be soft' }, { ko: '배부르다', en: 'to be full' },
    ],
    quiz: [
      { q: { ko: '가게 사장님이 맛보라고 준 반찬은 무엇이에요?', en: 'What side dish did the shop owner offer to taste?' },
        options: ['계란말이', '멸치볶음', '김치', '두부조림'], answer: 0 },
      { q: { ko: '두 사람은 반찬을 몇 가지 샀어요?', en: 'How many side dishes did the two buy for dinner?' },
        options: ['한 가지', '두 가지', '세 가지', '네 가지'], answer: 1 },
    ],
  },
  {
    id: 'sb-08', lv: 2,
    title: { ko: '공원의 작은 고양이', en: 'The Little Cat in the Park' },
    blurb: { ko: '공원 벤치 밑에서 작은 고양이를 만났어요.', en: 'Met a little cat under the park bench.' },
    pages: [
      { who: 'n',      ko: '따뜻한 햇살이 비치는 주말 오후였어요. 감자와 치즈는 공원을 걸었어요.', en: 'It was a weekend afternoon with warm sunshine. Potato and Cheese walked in the park.' },
      { who: 'n',      ko: '벤치 밑에서 조그만 하얀 고양이가 "야옹" 하고 울었어요.', en: 'Under the bench, a tiny white cat meowed.' },
      { who: 'potato', ko: '"치즈 씨, 저기 보세요. 목줄에 방울이 달려 있어요."', en: '"Cheese, look over there. A bell is hanging on its collar."' },
      { who: 'cheese', ko: '"목줄이 있는 것을 보니 집을 잃어버린 고양이 같아요."', en: '"Seeing that it has a collar, it seems like a lost cat."' },
      { who: 'n',      ko: '감자는 손수건을 펴서 고양이 앞에 앉았고, 치즈는 작은 종이컵에 물을 담아 주었어요.', en: 'Potato spread a handkerchief and sat in front of the cat, and Cheese offered water in a small paper cup.' },
      { who: 'n',      ko: '잠시 후 한 아이가 울면서 공원으로 뛰어왔어요. "나비야, 어디 갔었어!"', en: 'A moment later, a child ran into the park crying: "Nabi, where were you!"' },
      { who: 'cheese', ko: '"여기 벤치 밑에 있어요! 다치지 않았어요."', en: '"It is here under the bench! It is not hurt."' },
      { who: 'n',      ko: '아이와 부모님이 감자와 치즈에게 연신 고개를 숙이며 고마워했어요.', en: 'The child and parents bowed repeatedly to Potato and Cheese, thanking them warmly.' },
    ],
    words: [
      { ko: '햇살', en: 'sunshine' }, { ko: '벤치', en: 'bench' }, { ko: '방울', en: 'bell' },
      { ko: '목줄', en: 'collar, leash' }, { ko: '손수건', en: 'handkerchief' }, { ko: '다치다', en: 'to get hurt' },
    ],
    quiz: [
      { q: { ko: '고양이는 처음에 어디에 있었어요?', en: 'Where was the cat at first?' },
        options: ['나무 위', '풀밭 속', '그네 옆', '벤치 밑'], answer: 3 },
      { q: { ko: '고양이의 목줄에는 무엇이 달려 있었어요?', en: 'What was hanging on the cat’s collar?' },
        options: ['이름표', '열쇠', '방울', '리본'], answer: 2 },
    ],
  },
  {
    id: 'sb-09', lv: 2,
    title: { ko: '깜짝 생일 파티', en: 'The Surprise Birthday Party' },
    blurb: { ko: '치즈의 생일에 감자가 몰래 케이크를 준비해요.', en: 'Potato secretly prepares a cake for Cheese’s birthday.' },
    pages: [
      { who: 'n',      ko: '오늘은 치즈의 생일이었어요. 하지만 치즈는 회사 일 때문에 늦게까지 일했어요.', en: 'Today was Cheese’s birthday. But Cheese worked late because of company work.' },
      { who: 'n',      ko: '감자는 치즈가 모르게 동네 빵집에 들러 딸기 케이크를 샀어요.', en: 'Potato stopped by the neighborhood bakery without Cheese knowing and bought a strawberry cake.' },
      { who: 'potato', ko: '"치즈 씨가 오면 깜짝 놀라게 해 줘야지!"', en: '"When Cheese comes, I will surprise Cheese!"' },
      { who: 'n',      ko: '감자는 식탁 위에 알록달록한 고깔모자와 케이크를 올려놓았어요.', en: 'Potato placed a colorful party hat and the cake on the dining table.' },
      { who: 'n',      ko: '밤이 깊어 현관문 도어록 소리가 났어요. 감자는 불을 끄고 촛불을 켰어요.', en: 'Deep into the night, the front door lock sounded. Potato turned off the lights and lit a candle.' },
      { who: 'cheese', ko: '"집이 왜 이렇게 캄캄하지? 감자 씨, 계세요?"', en: '"Why is the house so dark? Potato, are you there?"' },
      { who: 'potato', ko: '"생일 축하해요, 치즈 씨! 촛불을 불어 보세요."', en: '"Happy birthday, Cheese! Blow out the candle."' },
      { who: 'n',      ko: '치즈는 피곤함도 잊은 채 환하게 웃으며 소원을 빌었어요.', en: 'Cheese smiled brightly, forgetting all fatigue, and made a wish.' },
    ],
    words: [
      { ko: '빵집', en: 'bakery' }, { ko: '식탁', en: 'dining table' }, { ko: '촛불', en: 'candlelight' },
      { ko: '캄캄하다', en: 'to be dark' }, { ko: '피곤하다', en: 'to be tired' }, { ko: '소원', en: 'wish' },
    ],
    quiz: [
      { q: { ko: '감자가 빵집에서 사 온 케이크는 무슨 케이크예요?', en: 'What cake did Potato buy at the bakery?' },
        options: ['초코 케이크', '치즈 케이크', '딸기 케이크', '사과 케이크'], answer: 2 },
      { q: { ko: '현관문 소리가 났을 때 감자는 무엇을 켰어요?', en: 'What did Potato light when the front door sounded?' },
        options: ['텔레비전', '촛불', '형광등', '컴퓨터'], answer: 1 },
    ],
  },
  {
    id: 'sb-10', lv: 3,
    title: { ko: '토요일의 벼룩시장', en: 'The Saturday Flea Market' },
    blurb: { ko: '동네 공원에서 열린 벼룩시장에 물건을 가지고 가요.', en: 'Taking items to the flea market held at the neighborhood park.' },
    pages: [
      { who: 'n',      ko: '맑은 토요일 아침, 동네 공원 잔디밭에서 주민들이 참여하는 벼룩시장이 열렸습니다.', en: 'On a clear Saturday morning, a flea market joined by local residents opened on the park lawn.' },
      { who: 'n',      ko: '감자는 집에서 깨끗하게 닦아 둔 유리컵을, 치즈는 직접 만든 천 책갈피를 챙겨 나왔습니다.', en: 'Potato brought clean glass cups from home, and Cheese brought handmade cloth bookmarks.' },
      { who: 'cheese', ko: '"손수 만든 책갈피를 좋아해 줄 사람이 있을지 조금 걱정돼요."', en: '"I am a little worried whether anyone will like my handmade bookmarks."' },
      { who: 'potato', ko: '"색깔이 아주 고와서 분명히 인기가 많을 거예요. 걱정하지 마세요."', en: '"The colors are so lovely that they will definitely be popular. Do not worry."' },
      { who: 'n',      ko: '자리를 펴자마자 이웃집 아주머니가 다가와 감자의 유리컵을 보며 반가워했습니다. "마침 화채 그릇으로 쓸 예쁜 컵이 필요했어요."', en: 'As soon as they set up, a neighbor came over and admired Potato’s cups: "I happened to need pretty cups for fruit punch."' },
      { who: 'n',      ko: '책을 든 한 학생도 치즈의 책갈피를 여러 개 고르며 정성이 가득 담겼다고 칭찬했습니다.', en: 'A student holding a book also picked several of Cheese’s bookmarks, praising how much care went into them.' },
      { who: 'potato', ko: '"돈을 많이 벌지는 못했지만, 이웃들과 따뜻한 이야기를 나눌 수 있어서 정말 보람찼어요."', en: '"We didn’t earn a lot of money, but it was truly rewarding to share warm conversations with neighbors."' },
      { who: 'n',      ko: '두 친구는 남은 짐을 정리하며 다음 달 벼룩시장에도 꼭 다시 참여하기로 약속했습니다.', en: 'Packing up the remaining items, the two friends promised to participate again in next month’s flea market.' },
    ],
    words: [
      { ko: '벼룩시장', en: 'flea market' }, { ko: '잔디밭', en: 'lawn, grassy field' }, { ko: '유리컵', en: 'glass cup' },
      { ko: '책갈피', en: 'bookmark' }, { ko: '정성', en: 'care, devotion' }, { ko: '보람차다', en: 'to be rewarding' },
    ],
    quiz: [
      { q: { ko: '치즈가 벼룩시장에 직접 만들어 가져간 물건은 무엇입니까?', en: 'What item did Cheese make and bring to the flea market?' },
        options: ['천 책갈피', '유리컵', '그림책', '꽃바구니'], answer: 0 },
      { q: { ko: '이웃집 아주머니는 유리컵을 무엇으로 쓰려고 샀습니까?', en: 'What did the neighbor woman buy the glass cups for?' },
        options: ['커피 잔', '물병', '화분', '화채 그릇'], answer: 3 },
    ],
  },
  {
    id: 'sb-11', lv: 3,
    title: { ko: '첫눈 오는 날의 작은 눈사람', en: 'The Little Snowman on the Day of First Snow' },
    blurb: { ko: '온 세상이 하얗게 변한 날, 언덕길을 걸어요.', en: 'Walking up the hill on a day when the whole world turned white.' },
    pages: [
      { who: 'n',      ko: '창문을 열자 밤새 내린 첫눈으로 온 동네의 지붕과 골목길이 하얗게 덮여 있었습니다.', en: 'When opening the window, all the roofs and alleys of the neighborhood were covered in white from the first snow that fell overnight.' },
      { who: 'potato', ko: '"치즈 씨, 밖을 보세요! 눈이 소복하게 쌓였어요. 우리 동네 뒷산 언덕에 올라가 봐요."', en: '"Cheese, look outside! Snow has piled up softly. Let’s go up the hill behind our neighborhood."' },
      { who: 'cheese', ko: '"길이 미끄러우니까 두꺼운 털장갑을 끼고 따뜻한 목도리를 두르고 나가요."', en: '"The road is slippery, so let’s put on thick mittens and wrap a warm scarf before going out."' },
      { who: 'n',      ko: '두 친구는 뽀드득뽀드득 눈을 밟으며 언덕 정상에 있는 정자로 천천히 걸어 올라갔습니다.', en: 'The two friends stepped crunchily on the snow and slowly walked up to the pavilion at the top of the hill.' },
      { who: 'potato', ko: '"여기에 우리를 닮은 눈사람을 만들어 볼까요? 치즈 씨는 세모난 치즈 모양 눈사람을 만들어 보세요."', en: '"Shall we build snowmen that look like us here? Cheese, try making a triangle cheese-shaped one."' },
      { who: 'n',      ko: '감자는 둥글둥글한 감자 모양 눈사람을, 치즈는 세모난 치즈 모양 눈사람을 빚고 작은 나뭇가지로 얼굴을 장식했습니다.', en: 'Potato shaped a round potato snowman and Cheese a triangle cheese snowman, and they decorated the faces with small twigs.' },
      { who: 'cheese', ko: '"어머, 나란히 서 있는 모습이 꼭 우리 둘 같아요. 정말 다정해 보여요."', en: '"Oh my, standing side by side they look just like the two of us. They look so sweet."' },
      { who: 'n',      ko: '차가운 겨울바람 속에서도 두 친구의 마음은 모락모락 김이 나는 찻잔처럼 훈훈했습니다.', en: 'Even in the cold winter wind, the two friends’ hearts were warm like a steaming teacup.' },
    ],
    words: [
      { ko: '첫눈', en: 'first snow' }, { ko: '소복하다', en: 'to be piled high' }, { ko: '미끄럽다', en: 'to be slippery' },
      { ko: '밟다', en: 'to step on' }, { ko: '장식하다', en: 'to decorate' }, { ko: '훈훈하다', en: 'to be warm-hearted' },
    ],
    quiz: [
      { q: { ko: '두 친구는 어디로 걸어 올라갔습니까?', en: 'Where did the two friends walk up to?' },
        options: ['도서관 옥상', '지하철역 출구', '언덕 정상의 정자', '전통시장 입구'], answer: 2 },
      { q: { ko: '두 사람이 정자에서 만든 것은 무엇입니까?', en: 'What did the two people make at the pavilion?' },
        options: ['얼음 썰매', '두 개의 작은 눈사람', '따뜻한 모닥불', '눈으로 만든 성'], answer: 1 },
    ],
  },
];
