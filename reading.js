/* 읽기 연습 — 읽고, 이해한 것을 자기 말로 써 보는 자리.

   왜 「고르기」가 아니라 「쓰기」인가 — TOPIK 유형 연습은 보기 넷에서
   고른다. 그건 이해했는지를 재기에는 좋지만, 이해한 것을 **꺼내는**
   연습은 안 된다. 읽고 고개를 끄덕이는 것과 읽은 것을 남에게 말해 주는
   것은 다른 일이고, 뒤쪽이 훨씬 어렵고 훨씬 오래 남는다.

   ── 두 축으로 나눈다 ────────────────────────────────────────
   길이(short · long)와 급수(beginner · intermediate · advanced)를 따로
   둔다. 길이가 급수를 따라 늘어나게 짜면 「쉬운 글을 길게 읽어 보고
   싶다」와 「어려운 글을 짧게 한 편만」이 둘 다 막힌다. 실제로 읽기
   훈련에서 이 둘은 다른 근육이다 — 긴 글은 흐름을 잡는 힘을, 짧은 글은
   한 문장씩 정확히 읽는 힘을 기른다.

     short   3~5문장 · 60~200자   짬이 날 때 한 편
     long    8~12문장 · 280~520자  흐름을 따라가는 연습

   ── 채점 ────────────────────────────────────────────────────
   두 겹이고, 이름을 정확히 부른다.

   ① **내용 점수** (누구나, 로그인 없이, 바로)
      지문마다 「짚어야 할 것」을 정해 두고, 학습자가 쓴 글에서 그것을
      몇 개나 짚었는지로 100점 만점을 낸다. 같은 뜻의 다른 말도 함께
      적어 두어(k 가 배열인 까닭) 「지하철」을 「전철」로 써도 인정한다.

      이것은 맥락을 재는 것이 **아니다**. 이해했으면 그 내용이 글에
      나온다는 상관을 이용한 근사치다. 그래서 화면에서도 「맥락 점수」가
      아니라 「내용 점수」라고 부르고, 놓친 항목이 무엇인지 같이 보여
      준다 — 숫자보다 그쪽이 배울 거리다.

   ② **AI 첨삭** (로그인 + 할당량)
      진짜 맥락 판단은 여기서 한다. 발음 시험의 score-pronunciation 과
      같은 자리에 둔다. 돈이 드는 길은 늘 덤이어야 한다 — 그래야 남의
      서버가 죽어도 화면이 멀쩡하고, 로그인 안 한 사람도 쓸 수 있다.

   ── 자료 모양 ───────────────────────────────────────────────
     id       지문 하나의 이름. 진도를 이것으로 적으므로 한번 붙이면
              바꾸지 않는다 (바꾸면 학습자 기록이 끊긴다).
     title    목록에 뜨는 이름
     passage  읽을 글
     en       그 글의 영어 뜻. 다 쓰고 나서 「내가 맞게 읽었나」를
              대조하는 자리다. 미리 보여 주면 읽기 연습이 아니게 되니
              화면에서는 답을 낸 뒤에만 편다.
     question 무엇을 쓰라는 것인지
     model    모범 답안. 정답이 아니라 「이 정도면 됐다」의 본보기다.
     keys     짚어야 할 것. k 는 인정하는 말들(같은 뜻의 다른 말도 함께),
              why 는 그것이 왜 짚을 거리인지. 점수는 이 배열로 낸다.
     words    지문에서 막힐 만한 낱말과 뜻. 사전을 따로 켜지 않게 한다.

   치수와 규칙은 tools/check-reading.mjs 가 지킨다.
   더 만들 때는 tools/reading-prompt.mjs 로 지시문을 뽑는다. */

export const READING = {
  /* ══ 짧은 글 ═══════════════════════════════════════════════ */
  short: {
    beginner: [
      {
        id: 'rs-b-01',
        title: '하루 일과',
        passage: '저는 아침 일곱 시에 일어납니다. 밥을 먹고 여덟 시에 집에서 나갑니다. 회사까지는 지하철로 삼십 분쯤 걸립니다. 저녁에는 집에서 한국 드라마를 봅니다.',
        en: 'I get up at seven in the morning. I eat, and I leave the house at eight. It takes about thirty minutes to get to work by subway. In the evening I watch Korean dramas at home.',
        question: '이 사람이 하루를 어떻게 보내는지 두세 문장으로 써 보세요.',
        model: '이 사람은 아침 일곱 시에 일어납니다. 여덟 시에 집을 나가서 지하철로 회사에 갑니다. 저녁에는 집에서 한국 드라마를 봅니다.',
        keys: [
          { k: ['일곱', '7시', '아침'], why: '몇 시에 일어나는지' },
          { k: ['지하철', '전철'], why: '회사에 어떻게 가는지' },
          { k: ['드라마'], why: '저녁에 무엇을 하는지' },
        ],
        words: [['일어나다', 'to get up'], ['나가다', 'to go out'], ['걸리다', 'to take (time)']],
      },
      {
        id: 'rs-b-02',
        title: '어제 간 식당',
        passage: '어제 친구와 새로 생긴 식당에 갔습니다. 그 식당은 우리 집에서 가깝습니다. 저는 비빔밥을 먹고 친구는 김치찌개를 먹었습니다. 음식이 맛있어서 다음에 또 가고 싶습니다.',
        en: 'Yesterday I went to a newly opened restaurant with a friend. The restaurant is close to our house. I had bibimbap and my friend had kimchi stew. The food was good, so I want to go again next time.',
        question: '어제 무슨 일이 있었는지 두세 문장으로 써 보세요.',
        model: '어제 친구와 집 근처에 새로 생긴 식당에 갔습니다. 저는 비빔밥을 먹고 친구는 김치찌개를 먹었습니다. 음식이 맛있어서 또 가고 싶습니다.',
        keys: [
          { k: ['식당'], why: '어디에 갔는지' },
          { k: ['비빔밥', '김치찌개'], why: '무엇을 먹었는지' },
          { k: ['맛있', '또 가', '다시'], why: '먹어 보니 어땠는지' },
        ],
        words: [['생기다', 'to open, to come to be'], ['가깝다', 'to be close'], ['또', 'again']],
      },
      {
        id: 'rs-b-03',
        title: '주말의 장보기',
        passage: '저는 토요일에 친구와 같이 마트에 갔습니다. 마트에서 사과와 우유, 그리고 빵을 샀습니다. 사람이 많아서 계산할 때 시간이 조금 걸렸습니다. 장을 보고 나서 카페에서 시원한 커피를 마셨습니다.',
        en: 'I went to the supermarket with my friend on Saturday. I bought apples, milk, and bread at the supermarket. Because there were many people, it took a little time to check out. After grocery shopping, we drank cold coffee at a cafe.',
        question: '이 사람이 토요일에 무엇을 했는지 두세 문장으로 써 보세요.',
        model: '이 사람은 토요일에 친구와 마트에 가서 사과, 우유, 빵을 샀습니다. 계산을 한 후에 카페에서 시원한 커피를 마셨습니다.',
        keys: [
          { k: ['토요일', '주말'], why: '언제 마트에 갔는지' },
          { k: ['친구'], why: '누구와 같이 갔는지' },
          { k: ['마트', '슈퍼'], why: '어디에 갔는지' },
          { k: ['커피', '음료수'], why: '장이 끝난 후 무엇을 마셨는지' },
        ],
        words: [['장보기', 'grocery shopping'], ['계산하다', 'to pay, to check out'], ['시원하다', 'to be cool, refreshing']],
      },
      {
        id: 'rs-b-04',
        title: '생일 선물',
        passage: '지난주에 제 생일이었습니다. 친구가 저에게 예쁜 옷을 선물했습니다. 옷의 색깔이 아주 마음에 들었습니다. 저는 어제 그 옷을 입고 학교에 갔습니다.',
        en: 'Last week was my birthday. A friend gave me pretty clothes as a present. I liked the color of the clothes very much. Yesterday I wore those clothes and went to school.',
        question: '친구에게 어떤 선물을 받고 무엇을 했는지 두세 문장으로 써 보세요.',
        model: '생일에 친구에게 예쁜 옷을 선물 받았습니다. 옷 색깔이 마음에 들어서 어제 그 옷을 입고 학교에 갔습니다.',
        keys: [
          { k: ['생일'], why: '어떤 날이었는지' },
          { k: ['선물', '받았', '받은'], why: '친구에게 무엇을 받았는지' },
          { k: ['학교', '등교'], why: '그 옷을 입고 어디에 갔는지' },
        ],
        words: [['선물하다', 'to give a present'], ['색깔', 'color'], ['입다', 'to wear']],
      },
      {
        id: 'rs-b-05',
        title: '도서관에서의 공부',
        passage: '저는 어제 시험이 있어서 도서관에 갔습니다. 도서관은 넓고 아주 조용했습니다. 세 시간 동안 열심히 공부를 했습니다. 시험을 잘 볼 수 있으면 좋겠습니다.',
        en: 'I had an exam yesterday, so I went to the library. The library was spacious and very quiet. I studied hard for three hours. I hope I can do well on the exam.',
        question: '이 사람이 도서관에서 무엇을 했는지 두세 문장으로 써 보세요.',
        model: '이 사람은 시험 공부를 하려고 도서관에 갔습니다. 조용한 도서관에서 세 시간 동안 공부를 했습니다.',
        keys: [
          { k: ['시험'], why: '무슨 이유로 도서관에 갔는지' },
          { k: ['도서관', '열람실'], why: '어디에서 공부했는지' },
          { k: ['세 시간', '3시간'], why: '얼마나 오래 공부했는지' },
        ],
        words: [['넓다', 'to be spacious, wide'], ['조용하다', 'to be quiet'], ['열심히', 'hard, diligently']],
      },
      {
        id: 'rs-b-06',
        title: '공원 산책',
        passage: '오늘 날씨가 아주 따뜻했습니다. 그래서 동생과 함께 집 근처 공원에 갔습니다. 공원에서 자전거를 타고 사진도 찍었습니다. 날씨가 좋아서 기분이 정말 좋았습니다.',
        en: 'The weather was very warm today. So I went to a park near my house with my younger sibling. We rode bicycles and took photos in the park. Because the weather was nice, I felt really good.',
        question: '오늘 공원에서 누구와 무엇을 했는지 두세 문장으로 써 보세요.',
        model: '오늘 날씨가 따뜻해서 동생과 공원에 갔습니다. 공원에서 자전거를 타고 사진을 찍으면서 시간을 보냈습니다.',
        keys: [
          { k: ['동생', '형제'], why: '누구와 공원에 갔는지' },
          { k: ['자전거'], why: '공원에서 무엇을 탔는지' },
          { k: ['사진'], why: '공원에서 무엇을 찍었는지' },
        ],
        words: [['따뜻하다', 'to be warm'], ['근처', 'near, neighborhood'], ['타다', 'to ride'], ['찍다', 'to take (a photo)']],
      },
      {
        id: 'rs-b-07',
        title: '감기와 병원',
        passage: '아침에 일어났을 때 머리가 아프고 열이 났습니다. 그래서 오전 일찍 병원에 갔습니다. 의사 선생님을 만나고 약국에서 약을 샀습니다. 집에서 약을 먹고 많이 쉬었습니다.',
        en: 'When I woke up in the morning, I had a headache and a fever. So I went to the hospital early in the morning. I met the doctor and bought medicine at the pharmacy. I took the medicine at home and rested a lot.',
        question: '이 사람이 왜 병원에 갔고 돌아와서 무엇을 했는지 두세 문장으로 써 보세요.',
        model: '아침에 머리가 아프고 열이 나서 병원에 갔습니다. 의사 선생님을 만나고 약국에서 약을 샀습니다. 집에 돌아와 약을 먹고 쉬었습니다.',
        keys: [
          { k: ['머리', '두통'], why: '어디가 아팠는지' },
          { k: ['병원'], why: '어디에 갔는지' },
          { k: ['약국', '약방'], why: '어디에서 약을 샀는지' },
          { k: ['쉬었', '쉬고', '휴식'], why: '집에 돌아와서 무엇을 했는지' },
        ],
        words: [['아프다', 'to be sick, hurt'], ['약국', 'pharmacy'], ['쉬다', 'to rest']],
      },
      {
        id: 'rs-b-08',
        title: '요리하기',
        passage: '저녁에 가족들과 김치찌개를 만들어 먹었습니다. 먼저 마트에서 돼지고기와 두부를 샀습니다. 요리는 조금 어려웠지만 재미있었습니다. 가족들이 맛있게 먹어서 기뻤습니다.',
        en: 'In the evening, I made and ate kimchi stew with my family. First, I bought pork and tofu at the supermarket. Cooking was a little difficult, but it was fun. I was glad because my family enjoyed eating it.',
        question: '저녁에 무슨 요리를 만들었고 기분이 어땠는지 두세 문장으로 써 보세요.',
        model: '저녁에 가족들과 함께 김치찌개를 만들었습니다. 마트에서 돼지고기와 두부를 사서 요리를 했습니다. 조금 어려웠지만 가족들이 맛있게 먹어서 기뻤습니다.',
        keys: [
          { k: ['찌개'], why: '무슨 음식을 만들었는지' },
          { k: ['고기'], why: '무슨 재료를 샀는지' },
          { k: ['가족들', '식구들'], why: '누구와 함께 먹었는지' },
        ],
        words: [['만들다', 'to make, to cook'], ['돼지고기', 'pork'], ['어렵다', 'to be difficult']],
      },
      {
        id: 'rs-b-09',
        title: '청소와 정리',
        passage: '일요일 오전에 방을 청소했습니다. 먼지를 털고 청소기를 돌렸습니다. 책상 위에 있는 책들도 깨끗하게 정리했습니다. 깨끗해진 방을 보니 기분이 아주 좋았습니다.',
        en: 'I cleaned my room on Sunday morning. I dusted and ran the vacuum cleaner. I also neatly organized the books on the desk. Seeing the clean room made me feel very good.',
        question: '이 사람이 일요일 오전에 무엇을 했는지 두세 문장으로 써 보세요.',
        model: '일요일 오전에 방 청소를 했습니다. 청소기를 돌리고 책상의 책을 정리하니 방이 깨끗해졌습니다.',
        keys: [
          { k: ['일요일', '주말'], why: '언제 청소를 했는지' },
          { k: ['청소기', '진공'], why: '무엇으로 방을 치웠는지' },
          { k: ['책상'], why: '어디에 있는 책을 정리했는지' },
        ],
        words: [['청소하다', 'to clean'], ['돌리다', 'to run, turn (a machine)'], ['정리하다', 'to organize, tidy up']],
      },
      {
        id: 'rs-b-10',
        title: '새 옷 사기',
        passage: '지난 주말에 옷가게에 갔습니다. 요즘 날씨가 추워져서 따뜻한 바지를 사고 싶었습니다. 마음에 드는 검은색 바지를 골라서 돈을 냈습니다. 새 옷을 입고 나갈 생각을 하니 설렜습니다.',
        en: 'Last weekend, I went to a clothing store. Since the weather got cold these days, I wanted to buy warm pants. I chose black pants that I liked and paid for them. I was excited to think about going out in my new clothes.',
        question: '옷가게에서 무엇을 왜 샀는지 두세 문장으로 써 보세요.',
        model: '날씨가 추워져서 옷가게에 갔습니다. 거기에서 마음에 드는 따뜻한 검은색 바지를 샀습니다.',
        keys: [
          { k: ['추워져서', '추워서'], why: '날씨가 어떠해서 옷을 사려고 했는지' },
          { k: ['바지'], why: '무슨 옷을 샀는지' },
          { k: ['검은색', '검정'], why: '어떤 색깔을 골랐는지' },
        ],
        words: [['추워지다', 'to get cold'], ['고르다', 'to choose, select'], ['설레다', 'to be excited, thrilled']],
      },
    ],
    intermediate: [
      {
        id: 'rs-i-01',
        title: '아침에 휴대폰을 보는 습관',
        passage: '아침에 일어나자마자 휴대폰을 보는 사람이 많습니다. 그런데 이 습관이 하루의 기분을 정한다는 연구가 있습니다. 전문가들은 일어난 뒤 삼십 분 동안은 화면을 보지 말라고 권합니다. 대신 물을 마시거나 창문을 열고 바깥 공기를 마시는 편이 낫다고 합니다.',
        en: 'Many people look at their phone the moment they wake up. But there is research saying this habit sets the mood for the whole day. Experts recommend not looking at a screen for the first thirty minutes after waking. Instead, they say it is better to drink water, or open a window and breathe the outside air.',
        question: '전문가들이 무엇을 권하는지, 그리고 대신 무엇을 하라고 하는지 두세 문장으로 써 보세요.',
        model: '전문가들은 아침에 일어난 뒤 삼십 분 동안 화면을 보지 말라고 권합니다. 이 습관이 하루의 기분을 정하기 때문입니다. 대신 물을 마시거나 창문을 열어 바깥 공기를 마시는 편이 좋다고 합니다.',
        keys: [
          { k: ['삼십 분', '30분', '화면', '휴대폰'], why: '무엇을 얼마 동안 하지 말라고 하는지' },
          { k: ['기분', '하루'], why: '왜 그렇게 하라고 하는지' },
          { k: ['물을', '창문', '공기'], why: '대신 무엇을 하라고 하는지' },
        ],
        words: [['-자마자', 'as soon as'], ['권하다', 'to recommend'], ['낫다', 'to be better']],
      },
      {
        id: 'rs-i-02',
        title: '도시의 속도',
        passage: '작은 도시에서 자란 사람이 큰 도시로 옮기면 처음에는 모든 것이 빠르게 느껴집니다. 걷는 속도부터 다르고 가게 문이 닫히는 시간도 늦습니다. 그런데 몇 달이 지나면 그 속도에 익숙해져서, 오히려 고향에 갔을 때 답답함을 느끼기도 합니다. 사람은 자기가 사는 곳의 속도를 몸으로 배우는 것 같습니다.',
        en: 'When someone raised in a small city moves to a big one, at first everything feels fast. Even the walking speed is different, and shops close later. But after a few months you get used to that speed, and you may even feel stifled when you go back to your hometown. It seems people learn the speed of the place they live in with their body.',
        question: '글쓴이가 하고 싶은 말이 무엇인지 두세 문장으로 정리해 보세요.',
        model: '작은 도시에서 큰 도시로 옮기면 처음에는 모든 것이 빠르게 느껴집니다. 그런데 몇 달이 지나면 익숙해져서 오히려 고향이 답답하게 느껴지기도 합니다. 사람은 자기가 사는 곳의 속도를 몸으로 배운다는 말입니다.',
        keys: [
          { k: ['속도', '빠르'], why: '글을 꿰는 낱말' },
          { k: ['익숙', '답답'], why: '몇 달 뒤에 무엇이 달라지는지' },
          { k: ['몸으로', '배운다', '배우'], why: '글쓴이가 내린 결론' },
        ],
        words: [['옮기다', 'to move'], ['익숙해지다', 'to get used to'], ['답답하다', 'to feel stifled']],
      },
      {
        id: 'rs-i-03',
        title: '충분한 수면의 중요성',
        passage: '바쁜 현대인들은 잠을 줄여서 공부하거나 일하는 경우가 많습니다. 그렇지만 잠이 부족하면 집중력이 떨어져서 오랫동안 일하더라도 효과가 오르지 않습니다. 전문가들은 하루에 적어도 일곱 시간 이상 깊은 잠을 자야 뇌가 충분히 쉰다고 말합니다. 제대로 쉬어야 다음 날 더 높은 능률로 일할 수 있습니다.',
        en: 'Busy modern people often cut down on sleep to study or work. However, if you lack sleep, your concentration drops, so even if you work for a long time, it is not effective. Experts say that you need to get at least seven hours of deep sleep a day for your brain to rest sufficiently. Only when you rest properly can you work with higher efficiency the next day.',
        question: '글쓴이가 수면에 대해 무엇을 강조하고 있는지 두세 문장으로 써 보세요.',
        model: '잠이 부족하면 집중력이 떨어져서 일을 오래 해도 효과가 오르지 않습니다. 따라서 뇌를 충분히 쉬게 하려면 하루에 적어도 일곱 시간 이상 자는 것이 중요합니다. 그래야 다음 날 더 높은 능률로 일할 수 있기 때문입니다.',
        keys: [
          { k: ['집중력', '효과'], why: '잠이 부족할 때 어떤 문제가 생기는지' },
          { k: ['일곱 시간', '7시간'], why: '하루에 최소 얼마나 자야 하는지' },
          { k: ['능률', '효율'], why: '제대로 쉬면 다음 날 어떻게 되는지' },
        ],
        words: [['줄이다', 'to reduce, to cut down'], ['적어도', 'at least'], ['능률', 'efficiency']],
      },
      {
        id: 'rs-i-04',
        title: '식후 짧은 산책',
        passage: '식사를 마친 후 바로 자리에 앉거나 누우면 소화가 잘되지 않습니다. 소화기관이 원활하게 움직이려면 식후에 십 분 정도 가볍게 걷는 편이 좋습니다. 가벼운 산책은 혈당이 갑자기 올라가는 것을 막아 주기도 합니다. 건강을 위해 식사 직후에는 잠깐이라도 움직이는 습관을 만드는 것이 바람직합니다.',
        en: 'If you sit or lie down immediately after a meal, digestion does not go well. For digestive organs to work smoothly, it is better to walk lightly for about ten minutes after eating. A light walk also prevents blood sugar from rising suddenly. For your health, it is desirable to form a habit of moving around even for a short while right after meals.',
        question: '식사 후에 왜 가볍게 걸어야 하는지 두세 문장으로 정리해 보세요.',
        model: '식사를 하고 바로 앉거나 누우면 소화가 잘되지 않습니다. 식후에 십 분 정도 가볍게 걸으면 소화가 잘될 뿐만 아니라 혈당이 갑자기 올라가는 것도 막아 줍니다. 그래서 식사 직후에 잠깐이라도 산책하는 습관이 필요합니다.',
        keys: [
          { k: ['소화'], why: '식후 산책이 무엇에 도움이 되는지' },
          { k: ['십 분', '10분'], why: '식후에 얼마나 걸어야 하는지' },
          { k: ['혈당'], why: '산책이 무엇을 막아 주는지' },
        ],
        words: [['소화기관', 'digestive organs'], ['원활하다', 'to be smooth, fluid'], ['바람직하다', 'to be desirable']],
      },
      {
        id: 'rs-i-05',
        title: '메모하는 습관',
        passage: '많은 사람들이 자신의 기억력을 믿고 중요한 일을 머릿속으로만 기억하려고 합니다. 하지만 시간이 지날수록 기억은 희미해지기 때문에 금방 잊어버리곤 합니다. 아무리 작은 일이라도 수첩에 바로 적어 두면 실수를 훨씬 줄일 수 있습니다. 기록하는 습관은 업무와 일상의 정확성을 높여 줍니다.',
        en: 'Many people trust their memory and try to keep important things in mind only mentally. However, as time passes, memories fade, so people often forget quickly. No matter how small a task is, if you write it down immediately in a notebook, you can reduce mistakes significantly. The habit of taking notes improves accuracy in work and daily life.',
        question: '메모를 해야 하는 이유와 효과를 두세 문장으로 정리해 보세요.',
        model: '사람들은 중요한 일을 머리로만 기억하려 하지만 시간이 지나면 금방 잊어버립니다. 아무리 작은 일이라도 수첩에 바로 메모하면 실수를 줄일 수 있습니다. 이렇게 기록하는 습관은 업무나 일상의 정확성을 높여 줍니다.',
        keys: [
          { k: ['기억'], why: '시간이 지나면 어떻게 되는지' },
          { k: ['수첩', '메모장'], why: '어디에 적어 두어야 하는지' },
          { k: ['실수', '잘못'], why: '메모를 하면 무엇을 줄일 수 있는지' },
        ],
        words: [['희미하다', 'to be faint, dim'], ['기록하다', 'to record, note down'], ['정확성', 'accuracy, correctness']],
      },
      {
        id: 'rs-i-06',
        title: '올바른 물 마시기',
        passage: '목이 마를 때 한꺼번에 많은 물을 마시는 사람들이 있습니다. 그러나 한 번에 너무 많은 물을 마시면 몸에 잘 흡수되지 않고 그대로 배출됩니다. 물은 한두 머그잔씩 나누어서 자주 마시는 편이 몸에 훨씬 이롭습니다. 조금씩 자주 마셔야 체내 수분이 균형 있게 유지됩니다.',
        en: 'Some people drink a lot of water all at once when they are thirsty. However, if you drink too much water at one time, it is not absorbed well into the body and is discharged as is. Drinking water frequently, one or two mugs at a time, is much more beneficial for the body. Sipping little by little often keeps the body water balanced.',
        question: '물을 올바르게 마시는 방법과 그 이유를 두세 문장으로 써 보세요.',
        model: '물을 한 번에 많이 마시면 몸에 잘 흡수되지 않고 그대로 배출됩니다. 따라서 물은 한두 머그잔씩 나누어서 자주 마시는 편이 좋습니다. 이렇게 조금씩 자주 마셔야 체내 수분이 균형 있게 유지됩니다.',
        keys: [
          { k: ['흡수'], why: '한 번에 물을 많이 마시면 왜 안 되는지' },
          { k: ['머그잔', '나누어', '한두'], why: '물을 어떤 단위로 나누어 마셔야 하는지' },
          { k: ['수분', '균형'], why: '조금씩 자주 마시면 무엇이 유지되는지' },
        ],
        words: [['한꺼번에', 'all at once'], ['배출되다', 'to be discharged, excreted'], ['이롭다', 'to be beneficial']],
      },
      {
        id: 'rs-i-07',
        title: '칭찬의 힘',
        passage: '상대방의 잘못을 지적하여 고치게 하려는 사람이 많습니다. 그러나 비판을 들으면 사람은 방어적인 태도를 취하기 쉬워 오히려 행동을 바꾸지 않습니다. 반면에 작은 잘한 일이라도 찾아서 칭찬해 주면 스스로 더 나아지려고 노력하게 됩니다. 사람의 행동을 변화시키는 데에는 비판보다 칭찬이 훨씬 효과적입니다.',
        en: 'Many people try to correct others by pointing out their mistakes. However, when hearing criticism, people tend to take a defensive stance and rather do not change their behavior. On the other hand, if you find even a small good thing and praise them, they will try to improve on their own. Praise is much more effective than criticism in changing human behavior.',
        question: '사람의 행동을 변화시키려면 비판보다 칭찬을 해야 하는 이유를 두세 문장으로 써 보세요.',
        model: '사람은 비판을 받으면 방어적으로 변하여 행동을 잘 바꾸지 않습니다. 하지만 잘한 일을 찾아 칭찬해 주면 스스로 더 노력하게 됩니다. 그래서 상대방을 변화시키려면 비판보다 칭찬을 해 주는 것이 효과적입니다.',
        keys: [
          { k: ['비판', '지적'], why: '어떤 말을 들으면 방어적인 태도를 취하는지' },
          { k: ['칭찬'], why: '무엇을 해 주면 스스로 노력하게 되는지' },
          { k: ['변화', '바꾸'], why: '칭찬이 무엇에 훨씬 효과적인지' },
        ],
        words: [['지적하다', 'to point out'], ['방어적', 'defensive'], ['효과적', 'effective']],
      },
      {
        id: 'rs-i-08',
        title: '스트레칭의 효과',
        passage: '오랫동안 같은 자세로 앉아서 일하면 근육이 굳고 통증이 생기기 쉽습니다. 한 시간마다 자리에서 일어나 몸을 뻗어 주는 스트레칭을 하면 피로가 잘 풀립니다. 스트레칭은 혈액순환을 돕고 긴장된 근육을 완화해 주는 효과가 있습니다. 건강한 목과 허리를 유지하려면 자주 몸을 풀어 주어야 합니다.',
        en: 'If you sit and work in the same posture for a long time, your muscles easily stiffen and cause pain. Doing stretches by standing up and extending your body every hour relieves fatigue well. Stretching has the effect of aiding blood circulation and relaxing tense muscles. To maintain a healthy neck and back, you must stretch your body often.',
        question: '왜 주기적으로 스트레칭을 해야 하는지 두세 문장으로 정리해 보세요.',
        model: '같은 자세로 오래 앉아 있으면 근육이 굳고 통증이 발생합니다. 한 시간마다 스트레칭을 하면 혈액순환이 좋아지고 긴장된 근육이 풀립니다. 따라서 목과 허리 건강을 위해 자주 몸을 움직여 주는 것이 좋습니다.',
        keys: [
          { k: ['통증', '아픔'], why: '오래 앉아 있으면 무엇이 생기기 쉬운지' },
          { k: ['한 시간', '1시간'], why: '얼마나 자주 일어나서 스트레칭을 해야 하는지' },
          { k: ['순환'], why: '스트레칭이 무엇을 돕는지' },
        ],
        words: [['통증', 'pain, ache'], ['혈액순환', 'blood circulation'], ['완화하다', 'to relieve, ease']],
      },
      {
        id: 'rs-i-09',
        title: '전자책과 종이책',
        passage: '요즘은 가볍고 휴대하기 편한 전자책을 읽는 사람이 늘고 있습니다. 하지만 종이책은 책장을 넘기는 느낌과 종이 향기 덕분에 내용에 더 몰입하게 해 줍니다. 또한 화면의 빛이 없어서 오랫동안 읽어도 눈이 피로하지 않습니다. 깊이 있는 독서를 원한다면 종이책을 읽는 편이 더 좋습니다.',
        en: 'These days, more people are reading e-books that are light and convenient to carry. However, paper books help you become more immersed in the content thanks to the feeling of turning pages and the scent of paper. Also, because there is no screen light, your eyes do not get tired even if you read for a long time. If you want in-depth reading, it is better to read paper books.',
        question: '글쓴이가 왜 종이책을 권하는지 그 장점을 두세 문장으로 써 보세요.',
        model: '전자책은 휴대하기 편하지만, 종이책은 책장을 넘기는 느낌 덕분에 내용에 더 몰입할 수 있습니다. 또한 화면 빛이 없어 눈이 쉽게 피로해지지 않습니다. 그래서 깊이 있게 독서할 때는 종이책이 더 좋습니다.',
        keys: [
          { k: ['전자책'], why: '요즘 사람들이 편하게 생각해서 많이 읽는 것' },
          { k: ['몰입', '집중'], why: '종이책이 내용에 어떻게 해 주는지' },
          { k: ['피로', '피곤'], why: '종이책을 읽으면 눈이 어떻게 되지 않는지' },
        ],
        words: [['휴대하다', 'to carry, bring along'], ['몰입하다', 'to be immersed, absorbed'], ['독서', 'reading']],
      },
      {
        id: 'rs-i-10',
        title: '재사용 컵 사용',
        passage: '일회용 컵은 쓰기 편리하지만 많은 쓰레기를 만들어 환경을 더럽힙니다. 텀블러 같은 재사용 컵을 가지고 다니면 쓰레기를 크게 줄일 수 있습니다. 게다가 많은 카페에서 개인 컵을 가져오는 손님에게 가격 할인 혜택도 제공합니다. 환경도 보호하고 돈도 아낄 수 있으니 텀블러를 쓰는 것이 좋습니다.',
        en: 'Disposable cups are convenient to use, but they generate a lot of waste and pollute the environment. Carrying a reusable cup like a tumbler can greatly reduce waste. In addition, many cafes offer price discounts to customers who bring their own cups. It is good to use a tumbler because you can protect the environment and save money.',
        question: '텀블러를 사용하는 것의 장점을 두세 문장으로 정리해 보세요.',
        model: '일회용 컵은 쓰레기를 많이 발생시키지만 텀블러를 쓰면 쓰레기를 줄일 수 있습니다. 또한 많은 카페에서 개인 컵 이용자에게 가격을 할인해 줍니다. 따라서 텀블러를 사용하면 환경을 보호하고 비용도 아낄 수 있습니다.',
        keys: [
          { k: ['일회용'], why: '어떤 컵이 쓰레기를 많이 만드는지' },
          { k: ['텀블러', '재사용'], why: '쓰레기를 줄이기 위해 무슨 컵을 써야 하는지' },
          { k: ['할인', '깎아'], why: '카페에서 개인 컵을 쓰면 어떤 혜택이 있는지' },
        ],
        words: [['일회용', 'disposable, single-use'], ['텀블러', 'tumbler, reusable cup'], ['혜택', 'benefit, discount']],
      },
    ],
    advanced: [
      {
        id: 'rs-a-01',
        title: '실수의 가치',
        passage: '많은 이들이 성공을 위해서는 실수를 피해야 한다고 생각합니다. 그러나 완벽만을 추구하다 보면 새로운 도전 자체를 머뭇거리게 마련입니다. 실수는 단순한 실패가 아니라 무엇이 잘못되었는지 알려주는 귀중한 배움의 기회입니다. 실수를 두려워하지 않고 받아들일 때 비로소 진정한 성장이 이루어지는 셈입니다.',
        en: 'Many people think that one must avoid mistakes in order to succeed. However, pursuing only perfection naturally makes one hesitate to take on new challenges. A mistake is not a mere failure, but a valuable learning opportunity that shows what went wrong. Real growth is achieved only when we accept mistakes without fear.',
        question: '글쓴이의 주장을 정리하고, 실수를 바라보는 시각에 대해 자신의 생각을 써 보세요.',
        model: '글쓴이는 성공을 위해 실수를 무조건 피하기보다 배움의 기회로 받아들여야 한다고 주장합니다. 완벽만을 추구하면 도전을 머뭇거리지만, 실수를 두려워하지 않을 때 진정한 성장이 이루어지기 때문입니다.',
        keys: [
          { k: ['실수'], why: '무엇을 피하지 말고 받아들여야 하는지' },
          { k: ['도전', '시도'], why: '완벽만을 추구할 때 무엇을 머뭇거리게 되는지' },
          { k: ['성장', '발전'], why: '실수를 두려워하지 않을 때 무엇이 이루어지는지' },
        ],
        words: [['추구하다', 'to pursue, to seek'], ['머뭇거리다', 'to hesitate'], ['비로소', 'at last, only then']],
      },
      {
        id: 'rs-a-02',
        title: '침묵의 대화',
        passage: '우리는 대화에서 끊임없이 말을 이어가야 소통이 잘된다고 믿곤 합니다. 하지만 적절한 침묵은 상대방의 이야기를 깊이 음미하고 생각할 여유를 준다는 점에서 중요합니다. 어색함을 피하려고 의미 없는 말을 쏟아내는 것은 진정한 소통이라기보다 소음에 지나지 않습니다. 때로는 말보다 깊은 침묵이 서로의 마음을 더 가깝게 이어 줍니다.',
        en: 'We tend to believe that communication goes well only when we keep talking continuously in a conversation. However, appropriate silence is important in that it offers room to deeply savor and reflect on the words of the other person. Pouring out meaningless words just to avoid awkwardness is nothing more than noise rather than true communication. Sometimes, deep silence brings hearts closer together than words do.',
        question: '글쓴이가 침묵에 대해 어떻게 평가하는지 정리하고, 이에 대한 자신의 생각을 써 보세요.',
        model: '글쓴이는 끊임없이 말하는 것보다 적절한 침묵이 진정한 소통에 도움이 된다고 말합니다. 의미 없는 말은 소음에 지나지 않으며, 때로는 깊은 침묵이 상대의 말을 음미하고 마음을 이어 주기 때문입니다.',
        keys: [
          { k: ['침묵'], why: '글쓴이가 소통에서 중요하게 보는 요소' },
          { k: ['소음', '잡음'], why: '어색함을 피하려 쏟아내는 말을 무엇에 비유했는지' },
          { k: ['음미', '생각할'], why: '적절한 침묵이 상대방의 이야기를 어떻게 하게 돕는지' },
        ],
        words: [['끊임없이', 'constantly, continuously'], ['음미하다', 'to savor, to appreciate'], ['쏟아내다', 'to pour out']],
      },
      {
        id: 'rs-a-03',
        title: '속도와 방향',
        passage: '현대 사회는 무조건 남들보다 빠르게 목표에 도달하는 것을 미덕으로 여깁니다. 그러나 올바른 방향 설정이 없는 빠른 속도는 길을 잃게 만들 뿐입니다. 자신이 어디로 가고 있는지 모른 채 달리기만 해서는 목적지에 도착하기는커녕 방황에 빠지기 마련입니다. 지금 우리에게 필요한 것은 더 빠른 속도가 아니라 삶의 방향을 점검하는 일입니다.',
        en: 'Modern society regards reaching goals faster than others as a virtue. However, high speed without the right direction merely causes one to get lost. Running without knowing where you are going leads to wandering rather than reaching your destination. What we need now is not faster speed, but checking the direction of our lives.',
        question: '글쓴이가 속도와 방향에 대해 어떤 주장을 하는지 정리하고, 자신의 생각을 써 보세요.',
        model: '글쓴이는 빠른 속도보다 올바른 방향을 점검하는 것이 더 중요하다고 주장합니다. 방향 없이 달리기만 해서는 목적지에 도달하기는커녕 길을 잃고 방황하기 마련이기 때문입니다.',
        keys: [
          { k: ['방향', '목표점'], why: '속도보다 먼저 점검해야 하는 요소' },
          { k: ['방황', '길을 잃'], why: '방향 없이 달리기만 할 때 일어나는 결과' },
          { k: ['점검', '확인'], why: '지금 우리에게 진정으로 필요한 행위' },
        ],
        words: [['미덕', 'virtue'], ['도달하다', 'to reach, to arrive'], ['방황', 'wandering']],
      },
      {
        id: 'rs-a-04',
        title: '불편함의 재발견',
        passage: '편리함만을 추구하는 현대 기술은 우리의 삶을 쾌적하게 만들어 준 듯 보입니다. 그렇지만 모든 것이 쉬워질수록 우리는 작은 불편함조차 견디지 못하는 약한 존재가 되고 맙니다. 약간의 불편을 감수하고 직접 신체를 움직이는 것은 단순한 수고가 아니라 삶의 활력을 되찾는 과정입니다. 편리함에 길들여지기보다 가끔은 불편함을 선택할 줄 아는 지혜가 필요합니다.',
        en: 'Modern technology pursuing only convenience seems to have made our lives comfortable. However, as everything becomes easier, we become weak beings unable to tolerate even minor inconveniences. Enduring a little inconvenience and moving our bodies directly is not mere trouble, but a process of regaining vitality. Rather than becoming accustomed to convenience, we need the wisdom to occasionally choose inconvenience.',
        question: '불편함이 지닌 긍정적 가치에 대한 글쓴이의 주장을 정리하고, 자신의 생각을 써 보세요.',
        model: '글쓴이는 편리함에만 길들여지기보다 가끔은 불편함을 선택할 줄 알아야 한다고 주장합니다. 약간의 불편을 감수하고 직접 움직이는 것은 삶의 활력을 되찾아 주기 때문입니다.',
        keys: [
          { k: ['편리함', '편의'], why: '현대 기술이 추구하지만 사람을 약하게 만드는 것' },
          { k: ['불편'], why: '삶의 활력을 위해 때로 선택해야 하는 것' },
          { k: ['활력', '에너지'], why: '직접 움직임으로써 되찾을 수 있는 것' },
        ],
        words: [['쾌적하다', 'to be pleasant, comfortable'], ['수고', 'trouble, effort'], ['길들여지다', 'to become accustomed to, tamed']],
      },
      {
        id: 'rs-a-05',
        title: '타인과의 비교',
        passage: '남들과 자신을 비교하며 우월감이나 열등감을 느끼는 이들이 많습니다. 그러나 타인의 겉모습과 나의 내면을 비교하는 것은 불공정한 평가일 뿐 아니라 자신을 피폐하게 만들 따름입니다. 경쟁의 대상을 남이 아닌 어제의 자신으로 돌릴 때 비로소 지속적인 발전이 가능해집니다. 진정한 성장은 남을 넘어서는 것이 아니라 어제보다 나은 자신이 되는 것입니다.',
        en: 'Many people feel a sense of superiority or inferiority by comparing themselves with others. However, comparing the exterior of someone else with the interior of oneself is not only an unfair evaluation, but also merely makes oneself exhausted. Only when we turn the object of competition from others to our past selves does continuous improvement become possible. True growth is not surpassing others, but becoming a better self than yesterday.',
        question: '글쓴이가 말하는 진정한 성장의 의미를 정리하고, 이에 대한 자신의 생각을 써 보세요.',
        model: '글쓴이는 남과 자신을 비교하는 것은 자신을 피폐하게 만들 뿐이라고 말합니다. 진정한 성장이란 남을 넘어서는 것이 아니라, 경쟁 대상을 어제의 자신으로 삼아 더 나은 사람이 되는 것입니다.',
        keys: [
          { k: ['비교'], why: '자신을 피폐하게 만드는 잘못된 태도' },
          { k: ['어제의', '과거의'], why: '경쟁의 대상으로 삼아야 하는 진정한 대상' },
          { k: ['성장', '발전'], why: '어제보다 나은 자신이 되는 것의 의미' },
        ],
        words: [['열등감', 'inferiority complex'], ['피폐하다', 'to be exhausted, impoverished'], ['지속적', 'continuous, lasting']],
      },
      {
        id: 'rs-a-06',
        title: '고독의 시간',
        passage: '홀로 있는 시간을 외로움과 구분하지 못하고 두려워하는 경향이 있습니다. 그러나 고독은 타인의 시선에서 벗어나 온전히 자신과 대화할 수 있는 귀중한 기회라는 점에서 가치가 있습니다. 혼자만의 시간을 견디지 못하는 사람은 스스로를 깊이 이해하기는커녕 타인에게 의존하게 마련입니다. 자신만의 고독을 즐길 줄 아는 사람만이 타인과도 건강한 관계를 맺을 수 있습니다.',
        en: 'There is a tendency to fear time spent alone without distinguishing it from loneliness. However, solitude is valuable in that it is a precious opportunity to break free from the gaze of others and fully converse with oneself. A person who cannot endure time alone, far from deeply understanding themselves, is bound to depend on others. Only those who know how to enjoy their own solitude can build healthy relationships with others.',
        question: '고독에 대한 글쓴이의 주장을 정리하고, 혼자만의 시간에 관한 자신의 생각을 써 보세요.',
        model: '글쓴이는 홀로 있는 고독의 시간이 자신과 온전히 대화할 수 있는 귀중한 기회라고 주장합니다. 혼자만의 시간을 즐길 수 있어야 타인에게 의존하지 않고 건강한 관계를 맺을 수 있기 때문입니다.',
        keys: [
          { k: ['고독', '혼자'], why: '외로움과 구분되어 자신과 대화하게 하는 시간' },
          { k: ['의존', '기대게'], why: '혼자만의 시간을 견디지 못할 때 타인에게 하게 되는 행동' },
          { k: ['건강한', '올바른'], why: '고독을 즐길 줄 아는 사람이 맺을 수 있는 타인과의 관계' },
        ],
        words: [['구분하다', 'to distinguish, to divide'], ['온전히', 'fully, entirely'], ['의존하다', 'to depend on, to rely on']],
      },
      {
        id: 'rs-a-07',
        title: '질문의 힘',
        passage: '정답을 빠르게 찾아내는 능력만이 인재의 조건으로 여겨지던 시대가 있었습니다. 하지만 이미 유통되는 지식을 암기하는 것은 컴퓨터보다 못할 수밖에 없습니다. 이제는 당연해 보이는 현상에 의문을 제기하고 정교한 질문을 던지는 능력이 더욱 중요한 셈입니다. 좋은 질문이야말로 새로운 관점을 열어 주고 숨겨진 문제를 발견하게 만드는 열쇠입니다.',
        en: 'There was a time when only the ability to quickly find correct answers was considered a condition for talent. However, memorizing already circulated knowledge cannot but be inferior to computers. Now, the ability to question seemingly obvious phenomena and pose sophisticated questions is even more important. Good questions are the key that opens new perspectives and reveals hidden problems.',
        question: '글쓴이가 현대 사회에서 질문하는 능력을 강조하는 이유를 정리하고, 자신의 생각을 써 보세요.',
        model: '지식을 단순히 암기하는 것은 의미가 없으며, 당연한 것에 의문을 품고 정교한 질문을 던지는 능력이 중요합니다. 좋은 질문이야말로 새로운 관점을 열고 문제를 발견하게 만드는 열쇠이기 때문입니다.',
        keys: [
          { k: ['암기', '외우는'], why: '컴퓨터보다 못할 수밖에 없는 지식 습득 방식' },
          { k: ['질문', '의문'], why: '당연한 현상에 대해 던져야 하는 중요한 능력' },
          { k: ['관점', '시각'], why: '좋은 질문이 열어 주는 새로운 요소' },
        ],
        words: [['유통되다', 'to circulate, to be distributed'], ['정교하다', 'to be sophisticated, exquisite'], ['관점', 'perspective, viewpoint']],
      },
      {
        id: 'rs-a-08',
        title: '전통의 재해석',
        passage: '전통문화는 과거의 모습을 그대로 보존할 때만 가치가 있다고 믿는 이들이 있습니다. 그러나 변화하는 시대에 맞추어 변형되지 않는 전통은 박물관의 유물에 지나지 않습니다. 옛것의 본질을 지키되 현대적 감각으로 재해석할 때 비로소 생명력을 얻게 되는 법입니다. 전통은 고정된 유산이 아니라 끊임없이 재창조되어야 할 살아 있는 유산입니다.',
        en: 'Some believe that traditional culture is valuable only when preserved as it was in the past. However, tradition that is not transformed to fit changing times is nothing more than a museum artifact. Only when keeping the essence of the old while reinterpreting it with a modern sense does it gain vitality. Tradition is not a fixed heritage, but a living heritage that must be constantly recreated.',
        question: '글쓴이가 밝힌 전통의 진정한 가치와 계승 방법에 대해 정리하고, 자신의 생각을 써 보세요.',
        model: '전통을 과거 모습 그대로 보존하기만 해서는 유물에 지나지 않습니다. 옛것의 본질을 지키면서 현대적 감각으로 재해석하고 끊임없이 재창조할 때 전통이 비로소 살아 있는 유산이 됩니다.',
        keys: [
          { k: ['유물', '골동품'], why: '변형되지 않는 전통을 비유한 말' },
          { k: ['재해석', '재창조'], why: '전통이 생명력을 얻기 위해 필요한 현대적 시도' },
          { k: ['유산', '문화'], why: '전통을 바라보는 바람직한 관점' },
        ],
        words: [['보존하다', 'to preserve, to conserve'], ['유물', 'artifact, relic'], ['재해석', 'reinterpretation']],
      },
    ],
  },

  /* ══ 긴 글 ═════════════════════════════════════════════════ */
  long: {
    beginner: [
      {
        id: 'rl-b-01',
        title: '제주도 여행 이야기',
        passage: '저는 지난주에 가족들과 함께 제주도로 여행을 다녀왔습니다. 비행기를 타고 한 시간쯤 가서 제주도에 도착했습니다. 첫날에는 유명한 바다에 가서 아름다운 풍경을 보고 사진도 많이 찍었습니다. 점심에는 맛있는 생선 구이와 해물탕을 먹었습니다. 둘째 날에는 높고 큰 산에 올라갔습니다. 날씨가 아주 좋아서 산 위에서 바다와 마을이 잘 보였습니다. 산을 내려온 후에는 기념품 가게에 들러서 귀여운 인형과 상큼한 귤을 샀습니다. 저녁에는 호텔 근처 시장에서 맛있는 음식을 사고 구경을 했습니다. 이번 여행은 조금 힘들었지만 정말 재미있었습니다. 다음에 기회가 있으면 제주도에 다시 가고 싶습니다.',
        en: 'Last week, I went on a trip to Jeju Island with my family. We took an airplane and arrived in Jeju Island after about an hour. On the first day, we went to a famous beach, looked at the beautiful scenery, and took many photos. For lunch, we ate delicious grilled fish and seafood stew. On the second day, we climbed a tall and big mountain. The weather was very nice, so we could see the sea and the town well from the top of the mountain. After coming down from the mountain, we stopped by a souvenir shop and bought cute dolls and refreshing tangerines. In the evening, we bought delicious food at the market near the hotel and looked around. This trip was a little tiring, but it was really fun. If I have a chance next time, I want to go to Jeju Island again.',
        question: '이 사람이 제주도 여행에서 무엇을 했고 무엇을 샀는지 두세 문장으로 써 보세요.',
        model: '이 사람은 지난주에 가족과 제주도로 여행을 갔습니다. 첫날에는 바다를 구경하고 생선 요리를 먹었으며, 둘째 날에는 산에 올라간 후에 귤과 인형을 샀습니다. 시장도 구경하며 재미있는 시간을 보냈습니다.',
        keys: [
          { k: ['제주'], why: '어디로 여행을 갔는지' },
          { k: ['바다', '해변'], why: '첫날 어디에서 풍경을 보았는지' },
          { k: ['산에', '산을'], why: '둘째 날 어디에 올라갔는지' },
          { k: ['귤을', '인형'], why: '기념품 가게에서 무엇을 샀는지' },
        ],
        words: [['풍경', 'scenery, view'], ['기념품', 'souvenir'], ['상큼하다', 'to be refreshing, tangy']],
      },
      {
        id: 'rl-b-02',
        title: '이사하는 날',
        passage: '저는 어제 새로운 집으로 이사를 했습니다. 아침 일찍부터 이사 센터 사람들이 와서 짐을 싸기 시작했습니다. 상자가 많아서 짐을 옮기는 데 시간이 많이 걸렸습니다. 오후 두 시쯤에 새 집에 도착해서 상자를 열고 물건들을 정리했습니다. 친구 한 명이 찾아와서 제 방 정리를 도와주었습니다. 우리는 일을 다 끝내고 나서 짜장면과 군만두를 시켜 먹었습니다. 힘들게 일한 후에 먹어서 정말 맛있었습니다. 저녁에는 따뜻한 물로 샤워를 하고 새 침대에 누웠습니다. 집이 깨끗하고 넓어서 기분이 아주 좋았습니다. 앞으로 이 집에서 행복하게 살고 싶습니다.',
        en: 'Yesterday, I moved to a new house. Early in the morning, workers from the moving company came and started packing the luggage. Because there were many boxes, it took a lot of time to move the items. Around two in the afternoon, we arrived at the new house, opened the boxes, and organized the items. A friend came by and helped me organize my room. After we finished all the work, we ordered and ate black bean noodles and fried dumplings. Because we ate after working hard, it was really delicious. In the evening, I took a warm shower and lay down on the new bed. Because the house was clean and spacious, I felt very good. I want to live happily in this house in the future.',
        question: '이 사람이 어제 이사를 하면서 무엇을 했고 저녁에 어땠는지 두세 문장으로 써 보세요.',
        model: '이 사람은 어제 새로운 집으로 이사를 했습니다. 친구와 함께 짐을 정리한 후에 짜장면을 먹었습니다. 새 집이 넓고 깨끗해서 기분이 좋았습니다.',
        keys: [
          { k: ['이사'], why: '어제 무슨 일을 했는지' },
          { k: ['친구'], why: '누가 와서 정리를 도와주었는지' },
          { k: ['짜장면', '자장면'], why: '일을 끝내고 무엇을 먹었는지' },
          { k: ['깨끗', '넓고', '넓어'], why: '새 집이 어떠했는지' },
        ],
        words: [['이사하다', 'to move (house)'], ['옮기다', 'to move, to carry'], ['정리하다', 'to organize, tidy up']],
      },
      {
        id: 'rl-b-03',
        title: '한국어 말하기 대회',
        passage: '지난 금요일에 우리 학교에서 한국어 말하기 대회가 열렸습니다. 저는 한 달 전부터 이 대회를 위해 열심히 연습했습니다. 발표 원고를 쓰고 한국인 선생님에게 보여 드렸습니다. 선생님께서 이상한 문장을 바르게 고쳐 주셨습니다. 대회 날이 되어서 강당으로 갔을 때 사람이 정말 많았습니다. 제 이름이 불리고 무대에 올라갔을 때 너무 떨렸습니다. 하지만 준비한 이야기를 천천히 큰 소리로 발표했습니다. 대회가 끝난 후에 저는 상을 받았습니다. 노력을 많이 해서 좋은 결과를 얻을 수 있었습니다. 정말 기쁘고 보람찬 하루였습니다.',
        en: 'Last Friday, a Korean speaking contest was held at our school. I practiced hard for this contest starting a month ago. I wrote a speech script and showed it to my Korean teacher. The teacher corrected the awkward sentences for me. When the day of the contest arrived and I went to the auditorium, there were really many people. When my name was called and I went up on the stage, I was so nervous. However, I presented the story I prepared slowly and in a loud voice. After the contest ended, I received an award. Because I made a lot of effort, I was able to get a good result. It was a really happy and rewarding day.',
        question: '이 사람이 말하기 대회를 어떻게 준비했고 어떤 결과를 얻었는지 두세 문장으로 써 보세요.',
        model: '이 사람은 한 달 전부터 말하기 대회를 열심히 준비했습니다. 원고를 써서 선생님께 도움을 받았고 무대에서 잘 발표했습니다. 그 결과 대회에서 상을 받을 수 있었습니다.',
        keys: [
          { k: ['말하기', '스피치'], why: '무슨 대회에 참가했는지' },
          { k: ['선생님', '강사'], why: '누가 원고를 고쳐 주었는지' },
          { k: ['발표', '말했'], why: '무대 위에서 준비한 이야기를 어떻게 했는지' },
          { k: ['상을', '상장'], why: '대회가 끝난 후에 무엇을 받았는지' },
        ],
        words: [['대회', 'contest, competition'], ['원고', 'manuscript, script'], ['보람차다', 'to be rewarding, fruitful']],
      },
      {
        id: 'rl-b-04',
        title: '요리 교실 체험',
        passage: '저는 이번 주말에 문화센터에서 열리는 요리 교실에 갔습니다. 한국 요리를 배우고 싶어서 한 달 전에 신청했습니다. 오늘 만든 요리는 잡채와 불고기였습니다. 먼저 선생님께서 요리하는 방법을 친절하게 설명해 주셨습니다. 그리고 우리는 준비된 야채와 고기를 칼로 잘랐습니다. 팬에 고기와 야채를 넣고 함께 볶았습니다. 간장으로 간을 맞추니까 아주 좋은 냄새가 났습니다. 제가 직접 만든 요리를 먹어 보니 정말 맛있었습니다. 집에 돌아와서 부모님께 요리 사진을 보여 드렸습니다. 다음 주에도 요리 교실에 가서 새로운 요리를 배우고 싶습니다.',
        en: 'This weekend, I went to a cooking class held at the culture center. I registered a month ago because I wanted to learn Korean cooking. The dishes we made today were japchae and bulgogi. First, the teacher kindly explained how to cook. Then we cut the prepared vegetables and meat with a knife. We put the meat and vegetables in a pan and stir-fried them together. When we seasoned it with soy sauce, it smelled really good. When I tried the dish I made myself, it was truly delicious. After returning home, I showed the photos of the dish to my parents. I want to go to the cooking class again next week and learn new dishes.',
        question: '이 사람이 요리 교실에서 어떤 요리를 어떻게 만들었는지 두세 문장으로 써 보세요.',
        model: '이 사람은 문화센터 요리 교실에 가서 잡채와 불고기를 만들었습니다. 선생님의 설명을 듣고 고기와 야채를 잘라서 함께 볶았습니다. 직접 만든 음식이 아주 맛있었습니다.',
        keys: [
          { k: ['요리 교실', '쿠킹 클래스'], why: '어디에 갔는지' },
          { k: ['불고기', '잡채'], why: '무슨 요리를 만들었는지' },
          { k: ['야채', '채소'], why: '고기와 함께 무엇을 잘라서 볶았는지' },
          { k: ['맛있', '맛이'], why: '직접 만든 요리의 맛이 어땠는지' },
        ],
        words: [['문화센터', 'culture center'], ['볶다', 'to stir-fry'], ['맞추다', 'to adjust, to season']],
      },
      {
        id: 'rl-b-05',
        title: '강아지 보호소 봉사활동',
        passage: '저는 일요일 아침에 친구들과 유기견 보호소에 가서 봉사활동을 했습니다. 보호소에는 주인을 잃어버린 강아지들이 많이 있었습니다. 우리는 먼저 강아지들이 사는 집을 깨끗하게 청소했습니다. 그리고 강아지들에게 따뜻한 밥과 물을 주었습니다. 점심시간이 지나고 나서 강아지들과 함께 근처 산책로를 걸었습니다. 강아지들이 신나게 달리며 기뻐하는 모습을 보니 마음이 따뜻해졌습니다. 처음에는 냄새도 나고 일이 조금 힘들었지만 보람을 느꼈습니다. 일을 다 마치고 강아지들과 인사를 한 후에 집으로 돌아왔습니다. 앞으로도 주말마다 보호소에 가서 강아지들을 도와주고 싶습니다.',
        en: 'On Sunday morning, I went to an abandoned dog shelter with my friends and did volunteer work. In the shelter, there were many dogs that had lost their owners. We first cleaned the houses where the dogs lived. Then we gave warm food and water to the dogs. After lunch time passed, we walked along a nearby trail with the dogs. Seeing the dogs running excitedly and being happy made my heart warm. At first, it smelled and the work was a bit hard, but I felt it was rewarding. After finishing all the work and saying goodbye to the dogs, I returned home. In the future, I want to go to the shelter every weekend and help the dogs.',
        question: '이 사람이 일요일에 유기견 보호소에서 무슨 봉사활동을 했는지 두세 문장으로 써 보세요.',
        model: '이 사람은 친구들과 함께 유기견 보호소에서 봉사활동을 했습니다. 강아지들의 집을 청소하고 밥을 준 후에 함께 산책을 했습니다. 일이 조금 힘들었지만 마음이 따뜻해지는 보람찬 시간이었습니다.',
        keys: [
          { k: ['보호소', '유기견'], why: '어디에서 봉사활동을 했는지' },
          { k: ['청소', '치웠'], why: '강아지 집을 어떻게 했는지' },
          { k: ['산책을', '걷기'], why: '점심 후에 강아지들과 무엇을 했는지' },
          { k: ['따뜻', '훈훈'], why: '강아지들을 보며 마음이 어떠했는지' },
        ],
        words: [['보호소', 'shelter'], ['봉사활동', 'volunteer work'], ['신나다', 'to be excited, thrilled']],
      },
      {
        id: 'rl-b-06',
        title: '할머니 댁 방문',
        passage: '이번 방학에 저는 시골에 계신 할머니 댁에 갔습니다. 서울역에서 기차를 타고 두 시간 동안 달려서 작은 시골 마을에 도착했습니다. 할머니께서는 반갑게 저를 맞아 주시고 따뜻하게 안아 주셨습니다. 할머니 집 뒤에는 작은 밭이 있어서 여러 가지 채소가 자라고 있었습니다. 저는 할머니를 도와서 밭에서 신선한 고추와 토마토를 땄습니다. 저녁에는 할머니께서 직접 만드신 맛있는 반찬으로 저녁을 먹었습니다. 시골의 밤은 차 소리가 안 나고 아주 조용했습니다. 하늘을 보니까 반짝이는 별들이 많이 보였습니다. 이번 방학 동안 할머니 댁에서 즐거운 추억을 많이 만들었습니다.',
        en: 'During this vacation, I went to the house of my grandmother in the countryside. I took a train from Seoul Station and traveled for two hours to arrive at a small countryside village. Grandmother welcomed me warmly and gave me a warm hug. Behind the house of my grandmother, there was a small garden, so various vegetables were growing. I helped grandmother and picked fresh chili peppers and tomatoes from the garden. In the evening, I ate dinner with delicious side dishes that grandmother made herself. The countryside night had no car sounds and was very quiet. When I looked at the sky, I saw many sparkling stars. During this vacation, I made many pleasant memories at the house of my grandmother.',
        question: '이 사람이 시골 할머니 댁에서 무엇을 했는지 두세 문장으로 써 보세요.',
        model: '이 사람은 방학에 기차를 타고 시골 할머니 댁에 갔습니다. 밭에서 고추와 토마토를 따며 할머니 일을 도와드렸습니다. 밤에는 조용한 하늘에서 많은 별을 보며 즐거운 추억을 만들었습니다.',
        keys: [
          { k: ['할머니'], why: '누구의 집에 방문했는지' },
          { k: ['기차를', '열차'], why: '무엇을 타고 시골에 갔는지' },
          { k: ['토마토', '고추'], why: '밭에서 무엇을 땄는지' },
          { k: ['별들이', '별을'], why: '시골 밤하늘에서 무엇을 보았는지' },
        ],
        words: [['시골', 'countryside'], ['신선하다', 'to be fresh'], ['추억', 'memory']],
      },
      {
        id: 'rl-b-07',
        title: '벼룩시장 구경',
        passage: '지난 주말에 동네 공원에서 열린 벼룩시장에 갔습니다. 벼룩시장에는 사람들이 쓰지 않는 옷, 책, 장난감들이 많이 있었습니다. 물건 값이 아주 싸서 부담 없이 구경할 수 있었습니다. 저는 예전부터 읽고 싶었던 소설책 두 권을 골랐습니다. 물건을 파는 아저씨가 친절하게 가격을 조금 깎아 주셨습니다. 책을 사고 나서 옆에 있는 작은 음악 공연도 감상했습니다. 사람들이 신나게 노래를 부르고 악기를 연주했습니다. 오래된 물건을 싸게 사고 좋은 음악도 들을 수 있어서 좋았습니다. 다음에도 벼룩시장이 열리면 친구들과 다시 방문할 생각입니다.',
        en: 'Last weekend, I went to a flea market held at the neighborhood park. At the flea market, there were many clothes, books, and toys that people did not use. The prices of items were very cheap, so I could look around without burden. I picked two novels that I had wanted to read for a long time. The man who sold the items kindly gave me a slight discount. After buying the books, I also enjoyed a small music performance nearby. People sang songs excitedly and played instruments. It was nice because I could buy old items cheaply and listen to good music. When a flea market opens next time, I plan to visit again with my friends.',
        question: '이 사람이 벼룩시장에서 무엇을 했고 무엇을 샀는지 두세 문장으로 써 보세요.',
        model: '이 사람은 동네 공원 벼룩시장에 가서 구경을 했습니다. 거기에서 읽고 싶었던 소설책 두 권을 싸게 샀습니다. 책을 산 후에는 음악 공연도 감상하며 좋은 시간을 보냈습니다.',
        keys: [
          { k: ['벼룩시장', '플리마켓'], why: '어디에 갔는지' },
          { k: ['소설책', '책을'], why: '거기에서 무엇을 샀는지' },
          { k: ['깎아', '할인', '싸게'], why: '아저씨가 가격을 어떻게 해 주었는지' },
          { k: ['음악', '공연'], why: '책을 산 후에 무엇을 감상했는지' },
        ],
        words: [['벼룩시장', 'flea market'], ['부담', 'burden, pressure'], ['깎다', 'to discount, to cut (price)']],
      },
      {
        id: 'rl-b-08',
        title: '도서관에서의 하루',
        passage: '저는 오늘 아침 일찍 집 근처에 있는 도서관에 갔습니다. 다음 주에 한국어 시험이 있어서 공부를 해야 했습니다. 도서관 사물함에 가방을 넣고 이 층 열람실로 올라갔습니다. 오전 동안 단어장과 문법 책을 보면서 열심히 공부했습니다. 점심시간에는 도서관 지하 식당에서 저렴하고 맛있는 돈가스를 먹었습니다. 밥을 먹은 후에 도서관 정원을 잠시 걸으면서 머리를 식혔습니다. 오후에는 필요한 책을 몇 권 찾아서 읽고 메모했습니다. 오랜만에 스마트폰을 안 보고 공부에만 집중할 수 있었습니다. 오늘 할 일을 다 끝내서 아주 보람이 있었습니다. 집으로 돌아오는 길에 하늘을 보니 석양이 아름다웠습니다.',
        en: 'This morning, I went early to the library near my house. Because I have a Korean language exam next week, I had to study. I put my bag in the library locker and went up to the reading room on the second floor. During the morning, I studied hard while looking at a vocabulary notebook and a grammar book. During lunchtime, I ate delicious and inexpensive pork cutlet at the library basement cafeteria. After eating, I walked around the library garden for a while to clear my head. In the afternoon, I found a few necessary books, read them, and took notes. For the first time in a long time, I was able to focus only on studying without looking at my smartphone. Because I finished all the work to do today, it was very rewarding. On the way back home, when I looked at the sky, the sunset was beautiful.',
        question: '이 사람이 오늘 도서관에서 어떻게 하루를 보냈는지 두세 문장으로 써 보세요.',
        model: '이 사람은 시험 공부를 하기 위해 아침 일찍 도서관에 갔습니다. 오전에 공부를 하고 지하 식당에서 돈가스를 먹은 뒤 정원을 산책했습니다. 오후에도 필요한 책을 읽으며 보람찬 하루를 보냈습니다.',
        keys: [
          { k: ['도서관', '열람실'], why: '어디에 가서 공부했는지' },
          { k: ['시험', '한국어'], why: '무엇 때문에 공부해야 했는지' },
          { k: ['돈가스', '돈까스'], why: '점심에 무엇을 먹었는지' },
          { k: ['정원', '마당'], why: '점심을 먹고 어디를 산책했는지' },
        ],
        words: [['열람실', 'reading room'], ['저렴하다', 'to be inexpensive, cheap'], ['석양', 'sunset']],
      },
    ],
    intermediate: [
      {
        id: 'rl-i-01',
        title: '주말 휴식과 회복',
        passage: '평일에 바쁘게 일한 사람들은 주말이 되면 집에서 온종일 아무것도 하지 않고 쉬려고 합니다. 지친 몸과 마음을 달래기 위해 집 안에서만 누워 지내는 편이 좋다고 생각하기 때문입니다. 하지만 전문가들은 주말에 지나치게 누워만 있으면 오히려 월요일에 더 피곤해질 수 있다고 경고합니다. 몸을 거의 움직이지 않으면 혈액순환이 느려지고 뇌로 가는 산소량도 줄어들기 때문입니다. 그래서 주말에는 집에만 머물기보다 가벼운 산책이나 운동을 하는 편이 훨씬 낫습니다. 삼십 분 정도의 가벼운 야외 활동은 기분을 전환시키고 수면의 질도 높여 줍니다. 이러한 적절한 활동이 피로를 풀고 다음 주를 건강하게 준비하도록 돕습니다.',
        en: 'People who work busy during weekdays try to stay home and do nothing all day when the weekend comes. This is because they think lying down inside the house is better to soothe their exhausted bodies and minds. However, experts warn that lying down excessively on weekends can actually make you feel more tired on Monday. This is because moving your body hardly at all slows down blood circulation and decreases the amount of oxygen going to the brain. Therefore, rather than staying only at home, it is much better to take a light walk or exercise on weekends. About thirty minutes of light outdoor activity changes your mood and improves sleep quality as well. Such appropriate activity helps relieve fatigue and prepares you to start the next week healthily.',
        question: '주말에 집에서 누워만 있는 것보다 왜 가벼운 운동을 해야 하는지 두세 문장으로 정리해 보세요.',
        model: '주말에 지나치게 누워만 있으면 혈액순환이 느려져 월요일에 더 피곤해질 수 있습니다. 반면에 가벼운 산책이나 운동을 하면 기분이 전환되고 피로를 효과적으로 풀 수 있습니다. 따라서 주말에는 가벼운 야외 활동을 통해 다음 주를 준비하는 편이 낫습니다.',
        keys: [
          { k: ['누워'], why: '주말에 피해야 할 행동' },
          { k: ['혈액순환', '산소량'], why: '움직이지 않을 때 신체에 일어나는 변화' },
          { k: ['산책', '야외 활동', '운동'], why: '주말에 피로를 풀기 위해 권장하는 활동' },
          { k: ['피로를', '피곤'], why: '적절한 활동을 통해 풀어야 하는 것' },
        ],
        words: [['달래다', 'to soothe, to calm'], ['지나치게', 'excessively, too much'], ['전환시키다', 'to refresh, to change']],
      },
      {
        id: 'rl-i-02',
        title: '올바른 채소 섭취법',
        passage: '많은 사람들이 건강을 위해 생채소를 샐러드로 즐겨 먹는 편입니다. 가열하지 않고 먹어야 채소 속의 영양소가 파괴되지 않는다고 믿기 때문입니다. 그러나 모든 채소를 생으로 먹는 것이 항상 최고는 아니라고 합니다. 당근이나 토마토 같은 채소는 기름과 함께 살짝 볶거나 익혀 먹을 때 영양소 흡수율이 더 높아집니다. 반면에 비타민이 풍부한 시금치나 브로콜리는 너무 오래 삶으면 영양소가 물로 빠져나가기 쉽습니다. 따라서 채소의 종류에 따라 적절한 조리 방법을 선택하는 것이 중요합니다. 올바른 요리법을 알고 먹어야 채소가 가진 좋은 성분을 몸속에 제대로 전달할 수 있습니다.',
        en: 'Many people enjoy eating raw vegetables as salads for their health. This is because they believe that eating them without heating prevents nutrients in vegetables from being destroyed. However, it is said that eating all vegetables raw is not always the best. Vegetables such as carrots or tomatoes have higher nutrient absorption rates when lightly fried or cooked with oil. On the other hand, spinach or broccoli, which are rich in vitamins, easily lose nutrients into the water if boiled for too long. Therefore, it is important to select an appropriate cooking method depending on the type of vegetable. Knowing and eating with the right cooking method allows the good ingredients in vegetables to be properly delivered into the body.',
        question: '글쓴이가 왜 채소의 종류에 맞게 조리법을 선택해야 한다고 말하는지 두세 문장으로 정리해 보세요.',
        model: '채소를 무조건 생으로 먹는 것이 항상 최고는 아닙니다. 당근이나 토마토는 기름에 익혀 먹어야 영양소 흡수율이 높아지고, 시금치는 너무 삶으면 영양소가 빠져나갑니다. 따라서 좋은 성분을 제대로 섭취하려면 채소에 맞는 조리법을 선택해야 합니다.',
        keys: [
          { k: ['생으로', '생채소'], why: '사람들이 흔히 채소를 먹는 방식' },
          { k: ['익혀', '볶거나'], why: '당근이나 토마토의 영양 흡수율을 높이는 조리법' },
          { k: ['조리', '요리법'], why: '채소의 종류에 따라 다르게 선택해야 하는 것' },
          { k: ['영양소', '성분'], why: '바른 조리법을 통해 몸에 전달하고자 하는 것' },
        ],
        words: [['가열하다', 'to heat, to warm up'], ['파괴되다', 'to be destroyed'], ['흡수율', 'absorption rate']],
      },
      {
        id: 'rl-i-03',
        title: '종이 영수증 받지 않기',
        passage: '물건을 사고 계산할 때 습관적으로 종이 영수증을 받는 사람이 많습니다. 대부분의 사람들은 영수증을 주머니에 넣었다가 집에 돌아가서 그대로 버리곤 합니다. 이렇게 버려지는 종이 영수증은 엄청난 양의 쓰레기를 만들고 환경을 오염시킵니다. 게다가 영수증을 만드는 과정에서 많은 나무와 물이 소비되기 때문에 자원 낭비도 심각합니다. 최근에는 스마트폰 앱을 통해 전자 영수증을 발급받는 서비스가 잘 마련되어 있습니다. 모바일 영수증을 이용하면 구매 내역도 쉽게 확인할 수 있고 환경 보호에도 동참할 수 있습니다. 작은 습관을 바꾸는 것만으로도 지구 환경을 지키는 데 큰 도움이 됩니다.',
        en: 'When buying items and paying, many people habitually receive paper receipts. Most people put the receipts in their pockets and throw them away as they are after returning home. Paper receipts discarded like this create a tremendous amount of waste and pollute the environment. In addition, resource waste is serious because a lot of trees and water are consumed during the process of making receipts. Recently, services to receive electronic receipts through smartphone apps are well provided. Using mobile receipts allows you to easily check purchase history and participate in environmental protection. Just changing a small habit is a great help in protecting the environment of the earth.',
        question: '종이 영수증 대신 전자 영수증을 사용하는 것이 왜 좋은지 두세 문장으로 정리해 보세요.',
        model: '버려지는 종이 영수증은 환경 오염과 자원 낭비를 불러일으킵니다. 스마트폰으로 전자 영수증을 이용하면 구매 내역을 확인하기 편할 뿐만 아니라 쓰레기도 줄일 수 있습니다. 따라서 모바일 영수증을 사용하는 습관이 환경 보호에 도움이 됩니다.',
        keys: [
          { k: ['종이'], why: '쓰레기와 환경 오염을 일으키는 원인' },
          { k: ['전자 영수증', '모바일 영수증'], why: '대신 사용하도록 권장하는 것' },
          { k: ['내역'], why: '스마트폰 앱을 통해 쉽게 확인할 수 있는 것' },
          { k: ['환경 보호', '환경을'], why: '작은 습관 변화를 통해 실천할 수 있는 일' },
        ],
        words: [['습관적으로', 'habitually'], ['소비되다', 'to be consumed'], ['발급받다', 'to be issued']],
      },
      {
        id: 'rl-i-04',
        title: '올바른 환기 습관',
        passage: '날씨가 춥거나 미세먼지가 많은 날에는 창문을 꼭 닫고 생활하기 쉽습니다. 집 안의 공기가 오염될까 봐 환기를 전혀 하지 않는 경우가 많기 때문입니다. 그러나 창문을 오랫동안 닫아 두면 실내 이산화탄소 농도가 높아져 오염된 공기가 안에 갇히게 됩니다. 오염된 실내 공기를 오래 마시면 두통이 생기거나 집중력이 떨어질 수 있습니다. 그래서 미세먼지가 있더라도 하루에 적어도 두 번 이상은 짧게 환기를 시켜야 합니다. 환기할 때는 집 안의 창문을 여러 개 동시에 열어서 공기가 통하게 만드는 편이 좋습니다. 십 분 정도의 짧은 환기만으로도 실내 공기를 쾌적하게 유지할 수 있습니다.',
        en: 'On cold days or days with high fine dust, it is easy to live with windows tightly closed. This is because in many cases, people do not ventilate at all for fear that the air inside the house will be polluted. However, keeping windows closed for a long time increases indoor carbon dioxide levels, trapping polluted air inside. Breathing polluted indoor air for a long time can cause headaches or decrease concentration. So even if there is fine dust, you should ventilate briefly at least twice a day. When ventilating, it is better to open several windows in the house simultaneously to let the air pass through. Just ten minutes of short ventilation can keep indoor air pleasant.',
        question: '왜 춥거나 미세먼지가 있는 날에도 실내 환기를 해야 하는지 두세 문장으로 정리해 보세요.',
        model: '창문을 오랫동안 닫아 두면 실내에 오염된 공기가 갇혀 두통이나 집중력 저하를 일으킬 수 있습니다. 미세먼지가 있는 날에도 하루에 두 번 이상 창문을 열어 공기를 통하게 해주어야 합니다. 짧은 환기만으로도 실내 공기를 쾌적하게 유지할 수 있기 때문입니다.',
        keys: [
          { k: ['오염된 공기', '이산화탄소'], why: '창문을 닫아 두었을 때 실내에 생기는 문제' },
          { k: ['두통', '집중력'], why: '오염된 공기를 오래 마실 때 몸에 생기는 증상' },
          { k: ['환기', '창문을'], why: '하루에 두 번 이상 해야 하는 행동' },
          { k: ['쾌적', '깨끗'], why: '환기를 통해 실내 공기를 어떤 상태로 유지하는지' },
        ],
        words: [['환기', 'ventilation'], ['갇히다', 'to be trapped, confined'], ['동시에', 'simultaneously']],
      },
      {
        id: 'rl-i-05',
        title: '스마트폰과 눈 건강',
        passage: '잠들기 직전까지 침대에서 스마트폰을 보는 사람들이 점점 늘어나고 있습니다. 어두운 방 안에서 밝은 화면을 오래 집중해서 보면 눈의 피로가 급격히 쌓입니다. 어둠 속에서 화면의 빛에 자극을 받으면 눈이 건조해지고 시력이 급격히 떨어질 수 있습니다. 또한 화면에서 나오는 빛은 뇌를 자극하여 잠드는 것을 방해하고 수면 장애를 일으킵니다. 건강한 눈과 깊은 잠을 지키기 위해서는 잠들기 한 시간 전부터 화면을 보지 않아야 합니다. 침대 옆에 스마트폰을 두지 않는 작은 실천이 눈의 피로를 줄여 줍니다. 어두운 곳에서는 스마트폰을 멀리하는 습관을 기르는 것이 꼭 필요합니다.',
        en: 'The number of people watching smartphones in bed right before falling asleep is gradually increasing. Looking at a bright screen attentively in a dark room for a long time builds up eye fatigue rapidly. Getting stimulated by the light from the screen in the dark can dry your eyes and make your eyesight drop rapidly. Also, the light coming out of the screen stimulates the brain, disturbing sleep and causing sleep disorders. To protect healthy eyes and deep sleep, you should not look at screens starting an hour before falling asleep. The small practice of not placing a smartphone next to the bed reduces eye fatigue. It is absolutely necessary to cultivate the habit of keeping smartphones away in dark places.',
        question: '어두운 곳에서 스마트폰을 보는 습관이 왜 나쁜지 두세 문장으로 정리해 보세요.',
        model: '어두운 방에서 스마트폰을 오래 보면 눈이 건조해지고 시력이 떨어질 수 있습니다. 또한 화면의 빛이 뇌를 자극해 수면 장애를 일으켜 깊은 잠을 자지 못하게 만듭니다. 따라서 잠들기 한 시간 전에는 스마트폰을 보지 않는 습관을 가져야 합니다.',
        keys: [
          { k: ['피로가', '건조해지고'], why: '어두운 화면을 집중해서 볼 때 눈에 생기는 이상' },
          { k: ['수면 장애', '잠드는'], why: '화면의 빛이 뇌를 자극하여 일으키는 문제' },
          { k: ['한 시간 전', '1시간 전'], why: '언제부터 스마트폰 화면을 보지 말아야 하는지' },
          { k: ['시력', '눈 건강'], why: '스마트폰을 멀리하여 지켜야 하는 것' },
        ],
        words: [['급격히', 'rapidly, sharply'], ['자극', 'stimulation'], ['방해하다', 'to disturb, hinder']],
      },
      {
        id: 'rl-i-06',
        title: '걸으면서 생각하기',
        passage: '복잡한 문제로 고민이 생길 때 책상 앞에만 가만히 앉아 있는 경우가 많습니다. 생각에 집중하려고 노력하지만 오히려 머리가 더 복잡해지고 좋은 아이디어가 떠오르지 않습니다. 그럴 때는 자리에서 일어나 밖으로 나가 천천히 걷는 편이 훨씬 도움이 됩니다. 걸으면서 몸을 움직이면 뇌로 공급되는 혈류량이 늘어나 생각이 명확해집니다. 실제로 유명한 학자나 작가들도 어려운 생각이 막힐 때마다 산책을 즐겼다고 합니다. 걸을 때 주변 환경이 계속 바뀌면서 뇌에 새로운 자극을 주기 때문에 창의적인 생각이 잘 납니다. 문제가 잘 풀리지 않을 때는 가만히 있지 말고 밖으로 나가는 습관을 만들어 보세요.',
        en: 'When worried about complex problems, people often sit still in front of desks. They try to focus on thinking, but rather their minds become more complex and good ideas do not come up. In that case, getting up from the seat and walking slowly outside is much more helpful. Moving your body while walking increases the blood flow supplied to the brain, making thoughts clear. In fact, famous scholars or writers are said to have enjoyed walks whenever they got stuck with difficult thoughts. Because the surrounding environment keeps changing while walking, it gives new stimulation to the brain, producing creative thoughts well. When problems do not solve well, try making a habit of going outside instead of staying still.',
        question: '고민이 많을 때 앉아 있는 것보다 밖에서 걷는 것이 왜 좋은지 두세 문장으로 정리해 보세요.',
        model: '책상에 앉아만 있으면 생각이 복잡해지고 아이디어가 잘 나오지 않습니다. 밖으로 나가 걸으면 뇌로 가는 혈류량이 늘어나고 새로운 자극을 받아 창의적인 생각이 떠오릅니다. 따라서 문제 해결이 힘들 때는 가벼운 산책을 하는 것이 좋습니다.',
        keys: [
          { k: ['책상', '앉아'], why: '아이디어가 떠오르지 않을 때 보통 머물러 있는 장소' },
          { k: ['혈류량', '혈액'], why: '걸을 때 뇌로 공급되어 늘어나는 것' },
          { k: ['창의적인', '새로운 생각'], why: '주변 환경의 자극을 통해 뇌에서 얻을 수 있는 생각' },
          { k: ['걸으면', '산책'], why: '고민 해결을 위해 행동으로 옮겨야 하는 것' },
        ],
        words: [['혈류량', 'blood flow volume'], ['명확해지다', 'to become clear'], ['창의적', 'creative']],
      },
      {
        id: 'rl-i-07',
        title: '천천히 씹어 먹는 습관',
        passage: '바쁜 일상 속에서 식사를 아주 빠르게 마치는 현대인들이 점점 많아지고 있습니다. 음식물을 제대로 씹지 않고 빨리 삼키면 위장에 큰 부담을 주어 소화 불량이 생깁니다. 또한 뇌가 배부름을 느끼기도 전에 너무 많은 음식을 먹게 되어 과식하기 쉽습니다. 뇌는 식사를 시작한 지 이십 분 정도가 지나야 배가 부르다는 신호를 느낍니다. 따라서 식사할 때는 음식물을 적어도 삼십 번 이상 천천히 씹어 먹는 습관이 필요합니다. 음식을 오래 씹으면 침이 많이 나와 소화를 돕고 체중 조절에도 큰 도움이 됩니다. 여유 있게 식사하는 습관이 소화 기관과 건강을 지켜 줍니다.',
        en: 'More and more modern people are finishing meals very quickly in their busy daily lives. Swallowing food quickly without chewing properly puts a heavy burden on the stomach, causing indigestion. Also, it is easy to overeat because you end up eating too much food before the brain feels full. The brain perceives the signal that it is full only after about twenty minutes have passed since starting a meal. Therefore, when eating, a habit of chewing food slowly at least thirty times or more is necessary. Chewing food for a long time produces a lot of saliva, aiding digestion and being a great help for weight control. A habit of eating with composure protects digestive organs and health.',
        question: '음식을 천천히 오랫동안 씹어 먹어야 하는 이유를 두세 문장으로 정리해 보세요.',
        model: '음식을 급하게 삼키면 소화 불량이 생기고 배부름을 느끼기 전에 과식하기 쉽습니다. 뇌는 식사 후 이십 분이 지나야 배부름을 느끼므로 삼십 번 이상 천천히 씹어 먹어야 합니다. 천천히 먹어야 침이 잘 나오고 체중 조절에도 도움이 됩니다.',
        keys: [
          { k: ['소화 불량', '위장'], why: '음식을 너무 빨리 먹을 때 위장에 나타나는 증상' },
          { k: ['과식', '폭식'], why: '배부름을 느끼기 전에 생기기 쉬운 일' },
          { k: ['이십 분', '20분'], why: '뇌가 배부름을 인식하는 데 걸리는 시간' },
          { k: ['체중 조절', '다이어트'], why: '천천히 씹어 먹었을 때 얻는 건강상의 이점' },
        ],
        words: [['삼키다', 'to swallow'], ['소화 불량', 'indigestion'], ['체중 조절', 'weight control']],
      },
      {
        id: 'rl-i-08',
        title: '웃음의 신체적 효과',
        passage: '기분이 좋을 때 자연스럽게 나오는 웃음은 단순히 감정을 표현하는 것에 그치지 않습니다. 우리가 크게 웃을 때 몸속에서는 다양한 긍정적인 신체 변화가 동시에 일어납니다. 웃는 동안 숨을 크게 쉬게 되어 뇌와 몸속으로 신선한 산소가 듬뿍 공급됩니다. 또한 웃음은 스트레스 호르몬을 줄여 주고 면역력을 높여 주어 질병을 예방합니다. 특별히 즐거운 일이 없더라도 일부러 크게 웃는 것만으로도 비슷한 건강 효과를 얻을 수 있습니다. 억지로 웃는 표정을 지어도 뇌는 진짜 즐거운 것으로 착각하여 좋은 호르몬을 내보내기 때문입니다. 매일 자주 웃는 습관을 만들면 마음뿐만 아니라 몸도 건강해집니다.',
        en: 'Laughter that comes out naturally when in a good mood does not stop at merely expressing emotions. When we laugh out loud, various positive physical changes occur simultaneously in our bodies. While laughing, taking deep breaths supplies plenty of fresh oxygen into the brain and body. Also, laughter reduces stress hormones and raises immunity, preventing diseases. Even if there is no particularly joyful event, just laughing out loud intentionally can yield similar health benefits. This is because even if you force a smiling expression, the brain mistakes it as real joy and releases good hormones. Making a habit of laughing often every day makes not only your mind but also your body healthy.',
        question: '웃음이 몸에 가져오는 유익한 효과와 그 이유를 두세 문장으로 정리해 보세요.',
        model: '크게 웃으면 몸속에 신선한 산소가 공급되고 스트레스 호르몬이 줄어 면역력이 올라갑니다. 또한 일부러 억지로 웃더라도 뇌는 진짜 즐거운 것으로 착각하여 좋은 호르몬을 내보냅니다. 따라서 자주 웃는 습관은 신체 건강에 큰 도움을 줍니다.',
        keys: [
          { k: ['산소'], why: '웃을 때 몸과 뇌에 공급되는 것' },
          { k: ['면역'], why: '웃음이 스트레스를 줄여 높여 주는 것' },
          { k: ['일부러', '억지로'], why: '즐거운 일이 없을 때 웃는 방식' },
          { k: ['착각'], why: '억지 웃음에도 뇌가 반응하는 방식' },
        ],
        words: [['면역력', 'immunity'], ['일부러', 'intentionally'], ['착각하다', 'to mistake, delude oneself']],
      },
    ],
    advanced: [
      {
        id: 'rl-a-01',
        title: '종이책은 왜 안 사라졌나',
        passage: '종이책이 사라질 것이라는 말은 전자책이 나온 뒤로 줄곧 있었습니다. 그러나 이십 년이 지난 지금도 종이책은 팔리고 있고, 어떤 나라에서는 오히려 판매가 늘었습니다. 이를 두고 사람들이 옛것을 못 버려서라고 설명하는 이들이 있습니다. 하지만 그 설명은 절반만 맞습니다. 종이책은 읽는 도구이면서 동시에 자리를 차지하는 물건입니다. 책장에 꽂힌 책은 내가 무엇을 읽었는지, 무엇을 읽으려 했는지를 눈에 보이게 남깁니다. 전자책에는 그 자리가 없습니다. 화면 안의 책은 열지 않으면 없는 것과 같습니다. 결국 두 매체는 겨루는 것이 아니라 서로 다른 일을 하고 있는 셈입니다.',
        en: 'People have been saying paper books would disappear ever since e-books arrived. Yet twenty years on, paper books still sell, and in some countries sales have actually risen. Some explain this by saying people simply cannot let go of old things. But that explanation is only half right. A paper book is both a tool for reading and an object that takes up space. A book on a shelf leaves a visible record of what you have read and what you meant to read. An e-book has no such place. A book inside a screen might as well not exist unless you open it. In the end the two media are not competing — they are doing different jobs.',
        question: '글쓴이의 주장을 정리하고, 그 주장에 동의하는지 자기 생각을 네 문장 정도로 써 보세요.',
        model: '글쓴이는 종이책과 전자책이 겨루는 사이가 아니라 서로 다른 일을 한다고 주장합니다. 종이책은 읽는 도구일 뿐 아니라 자리를 차지하는 물건이어서, 무엇을 읽었고 무엇을 읽으려 했는지를 눈에 보이게 남긴다는 것입니다. 반면 전자책에는 그런 자리가 없어 열지 않으면 없는 것과 같다고 봅니다. 저는 이 주장에 대체로 동의하지만, 자리를 차지하지 않는 점이 오히려 전자책의 장점이 되는 때도 있다고 생각합니다.',
        keys: [
          { k: ['겨루', '경쟁', '다른 일', '역할'], why: '글쓴이가 내린 결론' },
          { k: ['자리', '책장', '물건'], why: '종이책의 특징으로 든 것' },
          { k: ['전자책'], why: '무엇과 견주고 있는지' },
          { k: ['생각', '저는', '동의'], why: '자기 의견을 밝혔는지' },
        ],
        words: [['줄곧', 'all along'], ['차지하다', 'to take up (space)'], ['매체', 'medium'], ['셈이다', 'it amounts to']],
      },
      {
        id: 'rl-a-02',
        title: '나무는 장식이 아니다',
        passage: '도시에 나무를 심는 일은 오랫동안 미관의 문제로 다뤄졌습니다. 예산을 짤 때도 도로나 상하수도보다 뒤로 밀리기 일쑤였습니다. 그러나 최근 몇 해의 여름을 겪으며 이 생각은 빠르게 바뀌고 있습니다. 나무 그늘이 있는 거리와 없는 거리의 한낮 기온이 십 도 가까이 벌어진다는 측정 결과가 나왔기 때문입니다. 나무는 장식이 아니라 기반 시설이라는 말이 이제야 설득력을 얻고 있습니다. 다만 나무는 심는다고 곧바로 그늘이 되지 않습니다. 지금 심는 나무가 제 몫을 하려면 이십 년이 걸립니다. 그 사이의 여름을 어떻게 견딜지도 같이 이야기해야 합니다.',
        en: 'Planting trees in a city was long treated as a matter of appearance. When budgets were drawn up, trees regularly came after roads and water mains. But after the summers of the last few years, that view is changing fast. Measurements showed that a street with tree shade can be nearly ten degrees cooler at midday than one without. The claim that trees are infrastructure rather than decoration is only now gaining force. Still, a tree does not become shade the moment it is planted. A tree planted now needs twenty years to do its part. How we get through the summers in between has to be part of the conversation too.',
        question: '글쓴이가 무엇을 문제로 보는지 정리하고, 마지막에 말한 「그 사이의 여름」에 대해 자기 생각을 네 문장 정도로 써 보세요.',
        model: '글쓴이는 도시의 나무가 오랫동안 미관의 문제로만 다뤄져 예산에서 뒤로 밀려 왔다고 지적합니다. 그러나 나무 그늘이 있는 거리와 없는 거리의 한낮 기온이 십 도 가까이 벌어진다는 결과가 나오면서, 나무를 기반 시설로 보아야 한다는 말이 힘을 얻고 있다고 합니다. 다만 지금 심는 나무가 제 몫을 하려면 이십 년이 걸린다는 점도 함께 짚습니다. 저는 그 사이의 여름을 위해 그늘막처럼 바로 세울 수 있는 시설을 같이 늘려야 한다고 생각합니다.',
        keys: [
          { k: ['기반 시설', '장식', '미관'], why: '나무를 무엇으로 보아야 한다는 것인지' },
          { k: ['기온', '십 도', '그늘'], why: '생각이 바뀐 근거' },
          { k: ['이십 년', '시간', '기다'], why: '글쓴이가 덧붙인 한계' },
          { k: ['생각', '저는'], why: '자기 의견을 밝혔는지' },
        ],
        words: [['미관', 'appearance, looks'], ['일쑤', 'often, as a rule'], ['기반 시설', 'infrastructure'], ['몫', 'ones part, share']],
      },
      {
        id: 'rl-a-03',
        title: '효율성의 역설',
        passage: '기술의 발달로 작업 시간이 단축되면 인간은 더 많은 여유를 누릴 수 있다고 사람들은 믿어 왔습니다. 하지만 일상의 현실을 돌아보면 이는 환상에 지나지 않는다는 사실을 깨닫게 됩니다. 효율적인 도구가 도입될수록 사회는 이전보다 훨씬 더 많은 과업을 동일한 시간 내에 요구하기 때문입니다. 업무 처리 속도가 빨라지면서 빈자리가 생기기는커녕 더 빽빽한 일정으로 채워지는 셈입니다. 결과적으로 기술 혁신은 우리에게 한가한 여유를 가져다주기는커녕 더 높은 긴장감과 피로를 안겨 주었습니다. 진정한 휴식은 기술적 효율에서 절로 오는 것이 아니라 일의 절대적인 양을 스스로 제한할 때 비로소 가능해집니다.',
        en: 'People have believed that as technology advances and reduces task times, humans will be able to enjoy more leisure. However, looking back at daily reality, we realize this is nothing more than an illusion. This is because as more efficient tools are introduced, society demands far more tasks within the same amount of time than before. Far from creating free space as work processing speeds increase, schedules are filled with even tighter itineraries. Consequently, far from bringing us relaxed leisure, technological innovation has brought us higher tension and fatigue. True rest does not come automatically from technological efficiency, but becomes possible only when we voluntarily limit the absolute amount of work.',
        question: '글쓴이의 주장을 정리하고, 효율성과 여유에 대한 자기 생각을 네 문장 정도로 써 보세요.',
        model: '글쓴이는 기술 효율성이 늘어난다고 해서 여유가 생기는 것은 아니라고 주장합니다. 도구가 발전할수록 사회는 더 많은 일을 요구하므로, 진정한 휴식은 일의 양을 스스로 제한할 때 가능해진다는 것입니다. 저는 이 주장에 동의하며, 여유는 기술이 주는 것이 아니라 스스로 선택해야 하는 가치라고 생각합니다. 따라서 일의 우선순위를 정해 휴식 시간을 적극적으로 확보하는 자세가 필요합니다.',
        keys: [
          { k: ['효율', '기술'], why: '글쓴이가 문제 삼은 기존의 믿음' },
          { k: ['여유', '휴식'], why: '기술 발전만으로는 얻을 수 없는 것' },
          { k: ['제한', '줄여야'], why: '진정한 휴식을 얻기 위해 해야 하는 일' },
          { k: ['생각', '동의', '저는'], why: '자기 의견을 밝혔는지' },
        ],
        words: [['단축되다', 'to be shortened'], ['과업', 'task, duty'], ['제한하다', 'to limit, restrict']],
      },
      {
        id: 'rl-a-04',
        title: '실패할 권리와 교육',
        passage: '오늘날의 교육은 학생들에게 오답을 피하고 시행착오를 최소화하는 정답 찾기만을 강요하는 경향이 있습니다. 빠른 성공만을 강조하다 보니 안전한 길만 선택하도록 이끄는 셈입니다. 하지만 시행착오를 겪어 보지 못한 사람은 예측 못한 문제에 부딪혔을 때 쉽게 무너지기 마련입니다. 실수는 단순한 손실이 아니라 어디가 약한지 알려 주는 소중한 정보이자 창의적 도약의 출발점입니다. 실패를 받아들이지 않는 환경에서는 타성에 젖은 모방만 나올 뿐 새로운 혁신을 기대하기 어렵습니다. 교육이 주어야 할 진정한 가치는 완벽함이 아니라 실패해도 다시 일어설 수 있는 경험과 용기입니다.',
        en: 'Education today tends to force students only to find correct answers, avoiding wrong ones and minimizing trial and error. Emphasizing only quick success, it guides them to choose only safe paths. However, people who have not experienced trial and error are bound to collapse easily when faced with unexpected problems. A mistake is not a mere loss, but valuable information showing where one is weak, and a starting point for a creative leap. In an environment that does not accept failure, only imitation soaked in inertia arises, making it hard to expect new innovation. The true value education should give is not perfection, but the experience and courage to stand up again even after failing.',
        question: '글쓴이의 주장을 정리하고, 실패를 대하는 교육 방향에 대한 자기 생각을 네 문장 정도로 써 보세요.',
        model: '글쓴이는 성공만 강조하고 실패를 피하게 만드는 교육 방식을 비판합니다. 시행착오와 실수는 자산이 되므로 교육은 완벽함 대신 다시 일어설 용기를 주어야 한다는 주장입니다. 저는 이러한 관점에 깊이 공감하며 실패를 두려워하는 태도가 도전을 막는다고 봅니다. 감당할 수 있는 범위의 실수를 받아들이는 사회적 분위기가 만들어져야 성장이 이어질 것입니다.',
        keys: [
          { k: ['시행착오', '실수', '오답'], why: '글쓴이가 교육에서 필요하다고 본 요소' },
          { k: ['완벽함', '정답'], why: '기존 교육이 지나치게 강요해 온 것' },
          { k: ['용기', '경험'], why: '교육이 진정으로 주어야 할 가치' },
          { k: ['생각', '공감', '저는'], why: '자기 의견을 밝혔는지' },
        ],
        words: [['시행착오', 'trial and error'], ['도약', 'leap'], ['타성', 'inertia, habit']],
      },
      {
        id: 'rl-a-06',
        title: '전통과 유행',
        passage: '유행이 고유한 전통을 무너뜨리고 문화의 깊이를 얕게 만든다고 걱정하는 목소리가 높습니다. 하지만 전통이라는 이유만으로 과거의 모습을 그대로 지키려는 태도는 문화를 박제하는 것에 지나지 않습니다. 역사를 돌이켜보면 오늘날 전통이라 불리는 것들도 그 시절에는 파격적이고 새로운 유행이었던 경우가 많습니다. 끊임없이 바뀌는 사람들의 취향과 만나지 않는 문화는 생명력을 잃고 잊히기 마련입니다. 옛것의 정신을 살리되 오늘의 감각과 끊임없이 섞이는 과정을 거쳐야 비로소 전통이 앞으로 이어지는 셈입니다. 진정한 전통 보존은 멈춰 서서 지키는 것이 아니라 끊임없이 다시 읽어 내는 데 있습니다.',
        en: 'Voices of concern are loud, saying that trends break down unique traditions and make culture shallow. However, the attitude of keeping the forms of the past simply because they are tradition is no more than stuffing culture. Looking back at history, many things called tradition today were radical and new trends in their own time. Culture that does not meet the constantly changing tastes of people naturally loses vitality and is forgotten. Only by reviving the spirit of the old while constantly mixing with the senses of today does tradition carry forward. True preservation of tradition lies not in standing still and guarding it, but in reading it anew again and again.',
        question: '글쓴이의 주장을 정리하고, 전통을 보존하고 발전시키는 방법에 대해 자기 생각을 네 문장 정도로 써 보세요.',
        model: '글쓴이는 전통을 모습 그대로 보존하기보다 오늘의 유행과 만나 끊임없이 다시 읽어 내야 한다고 주장합니다. 과거에 머물러 있는 문화는 생명력을 잃지만, 시대와 함께 숨 쉴 때 비로소 앞으로 이어지기 때문입니다. 저는 이 주장에 공감하며 변화를 두려워하지 않는 열린 태도가 전통을 살린다고 생각합니다. 사람들에게 외면받는 유산보다 삶 속에서 계속 쓰이는 문화가 값집니다.',
        keys: [
          { k: ['전통', '옛것'], why: '글쓴이가 이야기하는 문화적 대상' },
          { k: ['유행', '오늘의 감각'], why: '전통과 만나야 하는 요소' },
          { k: ['다시 읽어', '보존'], why: '진정한 전통 보존에 필요한 과정' },
          { k: ['생각', '공감', '저는'], why: '자기 의견을 밝혔는지' },
        ],
        words: [['고유하다', 'to be unique, inherent'], ['박제하다', 'to stuff, to freeze in time'], ['파격적', 'unconventional, radical']],
      },
      {
        id: 'rl-a-07',
        title: '익명성의 두 얼굴',
        passage: '온라인 공간의 익명성은 무책임한 비난과 혐오 표현을 낳는 뿌리로 지목되곤 합니다. 이런 부작용을 없애기 위해 모든 인터넷 활동에 실명제를 들여와야 한다는 주장까지 나옵니다. 그러나 익명성을 나쁘게 쓰는 몇몇의 행태 때문에 그 좋은 값어치 전체를 부정해서는 안 됩니다. 익명성은 힘없는 사람이나 소수자가 눈치를 보지 않고 소신껏 목소리를 낼 수 있는 안전한 울타리가 되어 주기 때문입니다. 표현의 자유를 움츠러들게 하는 성급한 규제는 비판이 오가는 자리를 마비시키는 결과를 낳기 마련입니다. 문제의 핵심은 익명성 자체를 없애는 것이 아니라 남에게 해를 끼치는 불법 행위만을 가려내어 벌하는 데 있습니다.',
        en: 'Anonymity in online space is often pointed to as the root of irresponsible criticism and hate speech. To remove these side effects, arguments even arise that a real-name system should be introduced for all internet activity. However, the whole of its value should not be denied because of the conduct of a few who abuse anonymity. This is because anonymity becomes a safe fence letting the powerless and minorities speak their minds without watching others. Hasty regulation that makes freedom of expression shrink naturally paralyses the space where criticism is exchanged. The heart of the issue lies not in removing anonymity itself, but in sorting out and punishing only the illegal acts that harm others.',
        question: '글쓴이의 주장을 정리하고, 인터넷 익명성과 표현의 자유에 대한 자기 생각을 네 문장 정도로 써 보세요.',
        model: '글쓴이는 익명성의 부작용 때문에 이를 다 막으면 힘없는 사람의 목소리와 표현의 자유가 움츠러든다고 주장합니다. 따라서 익명성 자체를 없애기보다 불법 행위만을 가려내어 규제해야 한다는 것입니다. 저는 이러한 분석에 대체로 동의하며 무조건적인 규제는 오가는 소통을 막는다고 봅니다. 올바른 인터넷 예절을 가르치고 가해자를 실제로 벌하는 쪽이 바람직합니다.',
        keys: [
          { k: ['익명'], why: '글쓴이가 옹호하는 것' },
          { k: ['표현의 자유', '목소리'], why: '익명성을 통해 지켜지는 값어치' },
          { k: ['불법 행위', '벌하', '규제'], why: '익명성을 다 없애는 대신 가려내야 할 대상' },
          { k: ['생각', '동의', '저는'], why: '자기 의견을 밝혔는지' },
        ],
        words: [['지목되다', 'to be pointed out'], ['소신껏', 'according to ones belief'], ['움츠러들다', 'to shrink back']],
      },
      {
        id: 'rl-a-09',
        title: '소유와 경험',
        passage: '넉넉한 삶을 누리기 위해 더 많은 물건을 가지려 애쓰는 이들이 많습니다. 집이나 자동차 같은 자산을 쌓을수록 마음이 놓이고 행복해질 것이라 믿기 때문입니다. 하지만 물건이 주는 만족은 산 직후에 잠깐 솟았다가 금방 사라지기 마련입니다. 반면에 새로운 배움이나 여행처럼 몸으로 겪는 경험은 시간이 흐를수록 기억 속에서 깊은 값어치를 드러냅니다. 물건은 가지는 순간부터 값이 떨어지기 시작하지만, 경험은 삶의 지혜가 되어 사람을 넉넉하게 만들어 줍니다. 물질을 모으는 데 매달리기보다 여러 경험을 쌓는 데 삶의 자원을 써야 하는 까닭이 바로 여기에 있습니다.',
        en: 'Many people strive to own more things in order to live an ample life. This is because they believe that piling up assets such as a house or a car will put their minds at ease and make them happy. However, the satisfaction things give rises briefly right after the purchase and fades quickly. By contrast, experiences undergone with the body, such as new learning or travel, reveal deep value in memory as time passes. Things begin to lose value from the moment you own them, while experience becomes the wisdom of a life and makes a person richer. This is exactly why we should spend the resources of our lives on gathering varied experiences rather than clinging to collecting goods.',
        question: '글쓴이의 주장을 정리하고, 소유와 경험 가운데 무엇에 값을 둘 것인지 자기 생각을 네 문장 정도로 써 보세요.',
        model: '글쓴이는 물건을 가지는 행복은 잠깐이지만 경험은 사람을 넉넉하게 해 준다고 주장합니다. 따라서 물질을 모으기보다 여러 경험에 자원을 써야 한다는 것입니다. 저는 이 주장에 찬성하며 인생의 값어치는 가진 물건의 양으로 잴 수 없다고 봅니다. 시간이 지나도 변하지 않는 것을 남기려면 경험에 값을 두고 살아야 합니다.',
        keys: [
          { k: ['소유', '물건', '물질'], why: '잠깐의 만족만 주는 것' },
          { k: ['경험', '배움', '여행'], why: '시간이 흐를수록 값어치를 드러내는 것' },
          { k: ['자원', '쌓는'], why: '여러 경험을 위해 써야 하는 것' },
          { k: ['생각', '찬성', '저는'], why: '자기 의견을 밝혔는지' },
        ],
        words: [['넉넉하다', 'to be ample, plentiful'], ['드러내다', 'to reveal, show'], ['매달리다', 'to cling to']],
      },
      {
        id: 'rl-a-10',
        title: '느림의 값어치',
        passage: '매 순간 남들보다 한발 앞서야만 살아남는다는 조급함이 오늘을 덮고 있습니다. 속도 경쟁에서 뒤처지면 낙오자가 된다는 두려움 때문에 쉬지 않고 달려가는 셈입니다. 하지만 적절한 쉼표가 없는 질주는 머지않아 큰 탈진을 부르고 방향 감각을 잃게 만들기 마련입니다. 잠시 속도를 줄이고 느리게 걸을 때 비로소 둘레의 풍경이 눈에 들어오고 자신을 돌아볼 여유가 생깁니다. 속도가 목적이 되어 버린 삶은 주객이 뒤바뀐 가짜 삶에 지나지 않습니다. 한 걸음 물러서서 속도를 조절할 줄 아는 용기를 가질 때 삶의 몫을 되찾고 길을 잃지 않을 수 있습니다.',
        en: 'A restlessness that one must be a step ahead of others every moment to survive covers our days. Out of fear of becoming a straggler if left behind in the race of speed, people run without resting. However, a dash without proper rests before long brings a great burnout and makes one lose all sense of direction. Only when you slow down for a while and walk slowly do the surroundings come into view and room to look at yourself appear. A life in which speed has become the purpose is no more than a false life with first and last reversed. Only when you have the courage to step back and control your pace can you take back your share of your life and avoid losing your way.',
        question: '글쓴이의 주장을 정리하고, 속도와 느림에 대한 자기 생각을 네 문장 정도로 써 보세요.',
        model: '글쓴이는 끊임없는 속도 경쟁이 탈진을 부르고 삶의 방향을 잃게 만든다고 말합니다. 속도를 조절하고 느림을 고를 때 비로소 자신을 돌아보고 삶의 몫을 되찾을 수 있다는 주장입니다. 저는 이러한 지적에 깊이 공감하며 늘 바쁘게 사는 것이 미덕은 아니라고 느낍니다. 때로는 일부러 속도를 줄이고 지금에 마음을 두는 시간이 인생을 넉넉하게 만듭니다.',
        keys: [
          { k: ['속도', '경쟁', '질주'], why: '탈진과 방향 상실을 부르는 것' },
          { k: ['느리게', '느림', '쉼표'], why: '자신을 돌아보기 위해 필요한 태도' },
          { k: ['몫을', '조절'], why: '속도를 줄임으로써 되찾게 되는 것' },
          { k: ['생각', '공감', '저는'], why: '자기 의견을 밝혔는지' },
        ],
        words: [['조급함', 'impatience'], ['낙오자', 'straggler'], ['질주', 'a dash, sprint']],
      },
      {
        id: 'rl-a-05',
        title: '공간과 인격',
        passage: '공간을 그저 살고 일하기 위한 실용적 도구에 지나지 않는다고 생각하는 이들이 많습니다. 그러나 사람이 공간을 만들지만 거꾸로 그 공간이 사람의 사고방식을 만든다는 점을 놓쳐서는 안 됩니다. 천장이 높고 탁 트인 곳에서는 길게 내다보는 생각이 잘 자라는 반면, 답답하고 사방이 막힌 곳에서는 안목이 좁아지기 마련입니다. 우리가 날마다 머무는 자리의 빛과 동선과 풍경은 모르는 사이에 감정과 인격까지 다시 빚어냅니다. 따라서 좋은 건축과 공간 배치는 사치가 아니라 사람의 정신 건강을 위한 꼭 필요한 투자입니다. 비좁고 단조로운 환경에서 개성 있는 사람이 나오기를 바라는 것은 앞뒤가 맞지 않습니다.',
        en: 'Many people think space is nothing more than a practical tool for living and working. However, one should not miss the point that while people make spaces, those spaces in turn shape how people think. In places with high ceilings and open views, long-range thinking grows well, whereas in cramped and enclosed places, your outlook naturally narrows. The light, movement paths, and scenery of the places where we stay every day reshape even our emotions and character without our noticing. Therefore, good architecture and spatial arrangement are not a luxury, but a necessary investment for mental health. Expecting distinctive people to emerge from cramped and monotonous environments does not add up.',
        question: '글쓴이의 주장을 정리하고, 공간이 사람에게 미치는 영향에 대해 자기 생각을 네 문장 정도로 써 보세요.',
        model: '글쓴이는 공간이 단순한 도구가 아니라 사람의 사고와 인격을 만드는 요소라고 주장합니다. 탁 트인 공간은 창의적 생각을 돕는 반면 단조로운 공간은 안목을 좁히므로 좋은 공간에 투자해야 한다는 것입니다. 저는 이에 동의하며 공부나 일하는 자리의 질이 성과를 좌우함을 느껴 왔습니다. 따라서 환경을 고치려는 노력이 삶의 질을 바꾸는 첫걸음이라고 믿습니다.',
        keys: [
          { k: ['공간', '장소', '건축'], why: '글쓴이가 중요성을 강조하는 대상' },
          { k: ['사고방식', '인격', '감정'], why: '공간이 만들고 다시 빚어내는 것' },
          { k: ['투자', '배치'], why: '정신 건강을 위해 공간에 해야 할 일' },
          { k: ['생각', '동의', '저는'], why: '자기 의견을 밝혔는지' },
        ],
        words: [['놓치다', 'to miss, overlook'], ['동선', 'movement path'], ['단조롭다', 'to be monotonous']],
      },
      {
        id: 'rl-a-08',
        title: '전문가에 기대는 마음',
        passage: '복잡한 세상에서 우리는 모든 판단을 그 분야의 전문가에게 맡기는 경향이 있습니다. 전문성이 높은 사람의 의견을 따르는 것이 시행착오를 줄이는 합리적인 선택처럼 보이기 때문입니다. 그러나 전문가의 견해 역시 특정한 이론이나 자리에 갇힌 한쪽의 시각일 수 있음을 경계해야 합니다. 권위에 지나치게 기대다 보면 스스로 따져 보는 힘을 잃기 마련입니다. 나아가 자기 삶을 정하는 몫마저 남에게 넘겨주는 결과를 낳게 됩니다. 아무리 뛰어난 전문가의 말이라도 스스로 확인하고 자기 기준에서 다시 판단하는 태도가 필요합니다.',
        en: 'In a complex world, we tend to leave every judgment to experts in the relevant field. This is because following the opinion of someone with high expertise looks like a reasonable choice that reduces trial and error. However, we must beware that an expert view too may be one side, trapped in a particular theory or position. Leaning too heavily on authority naturally costs us the power to weigh things ourselves. Further, it ends up handing even the share of deciding our own lives to someone else. However outstanding an expert words, an attitude of checking for oneself and judging again by your own standard is needed.',
        question: '글쓴이의 주장을 정리하고, 전문가의 의견을 받아들이는 올바른 자세에 대한 자기 생각을 네 문장 정도로 써 보세요.',
        model: '글쓴이는 전문가의 견해 역시 한쪽으로 치우칠 수 있으므로 지나치게 기대지 말아야 한다고 주장합니다. 남에게 판단을 맡기면 스스로 따져 보는 힘을 잃으므로 확인하고 스스로 결정하는 태도가 필요하다는 것입니다. 저는 이 의견에 깊이 공감하며 판단의 책임을 밖으로 미뤄서는 안 된다고 생각합니다. 정보는 참고하되 자기 기준에 따라 마지막 결정을 내리는 자세가 중요합니다.',
        keys: [
          { k: ['전문가', '권위'], why: '눈감고 기대서는 안 되는 대상' },
          { k: ['따져', '확인', '스스로'], why: '의견을 받아들일 때 가져야 할 태도' },
          { k: ['판단', '결정'], why: '남에게 넘기지 말고 스스로 쥐어야 하는 것' },
          { k: ['생각', '공감', '저는'], why: '자기 의견을 밝혔는지' },
        ],
        words: [['맡기다', 'to entrust, leave to'], ['견해', 'view, opinion'], ['경계하다', 'to be wary of']],
      },
    ],
  },
};
