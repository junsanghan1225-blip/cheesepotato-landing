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
    ],
    advanced: [],
  },

  /* ══ 긴 글 ═════════════════════════════════════════════════ */
  long: {
    beginner: [],
    intermediate: [],
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
    ],
  },
};
