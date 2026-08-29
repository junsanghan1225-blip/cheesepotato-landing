/* 회화 연습 — 상황극 대본으로 말해보는 자리.

   읽기(reading.js)가 "읽고 자기 말로 써보기"라면, 이건 "듣고(또는 읽고)
   자기 말로 대답해보기"다. NPC 가 한 마디 하면 학습자가 그 자리에서
   대답을 만들어야 한다 — 보기 넷 중 고르는 게 아니라 직접 꺼내는 연습.

   ── 채점은 reading.js 와 같은 철학, 같은 두 겹 ──────────────────
   ① **내용/표현 점수** (누구나, 로그인 없이, 바로)
      turn 마다 accept 배열로 "이런 표현이 들어가면 인정" 을 정해 두고,
      학습자가 쓴 답에서 몇 개나 짚었는지로 점수를 낸다. reading.js 의
      keys 와 완전히 같은 모양(k 는 동의어 묶음, why 는 이게 뭘 재는지) —
      한 파일에서 배운 채점 방식을 그대로 재사용한다.

      **accept 배열은 이 파일을 쓰는 사람이 직접 채운다.** Gemini 로
      대사·모범답안 초안을 뽑더라도 accept 만큼은 사람이 검수해서
      넣는다 — reading.js 의 check-reading.mjs 가 짚는 문제(자기 답 안에
      없는 말을 키로 넣거나, 너무 흔한 한 글자를 키로 넣는 것)를 여기서도
      똑같이 피해야 하기 때문이다.

   ② **AI 첨삭** (로그인 + 할당량, 나중에 붙일 자리)
      진짜 맥락 판단은 여기서. 이 스키마는 그 자리를 위해 따로 필드를
      두지 않는다 — AI 피드백은 저장된 데이터가 아니라 그때그때 만드는
      것이라서, model/accept 만 있으면 프롬프트를 만들 수 있다.

   ── id 규칙 ─────────────────────────────────────────────────
   시나리오 id:  cv-{분류}-{급수 앞글자}-{번호}   예) cv-cafe-b-01
   턴(turn) id:   {시나리오 id}-{턴 번호, 1부터}   예) cv-cafe-b-01-1

   턴 id 는 진도 기록과 오디오 파일 이름 둘 다에 쓰인다. reading.js 와
   같은 이유로 **번호를 바꾸면 안 된다** — 바꾸면 그 턴에 쌓인 학습
   기록과 오디오가 고아가 된다. 대사를 고칠 땐 같은 turn id 안에서
   text 만 바꾸고, 턴을 통째로 지울 땐 지우지 말고 순서만 유지한 채
   비워두거나 뒤에 새 턴을 붙인다.

   ── 분류(category) ─────────────────────────────────────────
   지금까지 쓰는 값 (필요하면 자유롭게 늘린다 — 고정 목록이 아니다):
     cafe        카페·편의점에서 주문/계산
     store       옷가게·마트 등에서 쇼핑
     restaurant  식당에서 주문/요청
     transit     길 묻기·대중교통
     hospital    병원·약국
     phone       전화 통화
     work        직장·학교 (지각, 부탁, 보고 등)
     social      친구·소셜 (약속 잡기, 안부, 사과)
     service     관공서·은행·택배 등 행정

   ── 급수(lv) / 문체(register) ──────────────────────────────
   lv 는 sentences.js·reading.js 와 같은 값 — 'beginner' | 'intermediate'
   | 'advanced'. 갈래가 아니라 시나리오 하나하나가 급수를 가진다(같은
   category 안에 여러 급수가 섞이는 게 정상).

   register 는 상대에 따라 실제로 달라지는 문체를 명시한다. topik-writing.js
   의 register 를 셋으로 늘렸다 — 회화에는 해요체가 압도적으로 많이
   나와서 formal/plain 둘로는 못 가른다.
     'formal'  합쇼체 (-습니다/-습니까) — 면접, 발표, 격식 있는 전화
     'polite'  해요체 (-아요/-어요) — 카페·가게·병원 등 일상 존대, 기본값
     'plain'   반말 (-아/-어) — 친구·또래 사이

   ── 오디오 ──────────────────────────────────────────────────
   assets/audio/convo/{턴 id}.mp3  예) assets/audio/convo/cv-cafe-b-01-1.mp3
   read.js/write.js 의 .rd-say 듣기 버튼과 같은 방식으로 붙일 것 —
   파일이 없으면 버튼을 안 그리거나 숨기고, 있는 것만 노출한다.

   ── 분기 ────────────────────────────────────────────────────
   onMiss 는 딱 한 단계만 허용한다 — 학습자 답이 accept 어디에도 안
   걸리면 NPC 가 그 turn 안에서 한 번 더 유도하는 말 한 마디. 그 이상의
   대화 트리(성공/실패마다 갈라지는 여러 갈래)는 만들지 않는다 — 대본을
   짜기도, 채점하기도, 나중에 유지보수하기도 기하급수적으로 어려워진다.
   실패해도 다음 turn 은 그냥 이어간다(막다른 길을 만들지 않는다).

   ── 배열 모양 ───────────────────────────────────────────────
   CONVO 는 평평한 배열이다(reading.js 처럼 두 축 중첩이 아니라
   sentences.js 처럼) — category 와 lv 가 둘 다 항목 필드라서 화면에서
   "카페 · 초급만" 처럼 둘을 따로 걸러 써야 하기 때문이다.

   쓰기: node tools/check-convo.mjs (아직 없음 — 스키마 확정 후에 만든다) */

export const CONVO = [
  {
    id: 'cv-cafe-b-01',
    category: 'cafe',
    title: '카페에서 주문하기',
    en: 'Ordering at a cafe',
    lv: 'beginner',
    register: 'polite',
    roleUser: '손님',
    roleOther: '점원',
    setting: '당신은 카페에 들어가서 커피를 주문하려고 합니다.',
    vocab: [
      ['아메리카노', 'Americano'],
      ['따뜻하다', 'to be warm/hot'],
      ['포장하다', 'to pack/take out'],
      ['드시다', 'to eat/drink (honorific)'],
    ],
    grammarRefs: [],
    turns: [
      {
        id: 'cv-cafe-b-01-1',
        npc: { text: '어서 오세요! 주문 도와드릴까요?', en: 'Welcome! May I take your order?' },
        userPrompt: '무엇을 마시고 싶은지 말해 보세요.',
        accept: [
          { k: ['아메리카노'], why: '음료 이름을 말했는지' },
          { k: ['주세요', '주문할게요', '할게요'], why: '주문하는 말투로 끝맺었는지' },
        ],
        model: '아메리카노 한 잔 주세요.',
        tip: '「명사 + 주세요」로 원하는 것을 정중하게 요청할 수 있다.',
        onMiss: { text: '음료 이름을 말씀해 주시겠어요?', en: 'Could you tell me the name of the drink?' },
      },
      {
        id: 'cv-cafe-b-01-2',
        npc: { text: '네, 따뜻한 걸로 드릴까요, 차가운 걸로 드릴까요?', en: 'Would you like it hot or iced?' },
        userPrompt: '따뜻한 것과 차가운 것 중에서 골라 대답해 보세요.',
        accept: [
          { k: ['따뜻한', '뜨거운', '핫'], why: '따뜻한 것을 선택했는지' },
          { k: ['차가운', '아이스', '시원한'], why: '차가운 것을 선택했는지' },
        ],
        model: '따뜻한 걸로 주세요.',
        tip: null,
        onMiss: { text: '따뜻한 거요, 차가운 거요?', en: 'Hot, or cold?' },
      },
      {
        id: 'cv-cafe-b-01-3',
        npc: { text: '알겠습니다. 여기서 드시고 가세요, 포장이세요?', en: 'Got it. For here, or to go?' },
        userPrompt: '매장에서 마실지 포장할지 말해 보세요.',
        accept: [
          { k: ['먹고', '마시고', '여기서'], why: '매장 이용을 선택했는지' },
          { k: ['포장', '테이크아웃', '가져'], why: '포장을 선택했는지' },
        ],
        model: '포장이요.',
        tip: null,
        onMiss: { text: '여기서 드시는지, 포장인지만 말씀해 주세요.', en: 'Just let me know: for here, or to go.' },
      },
    ],
    outro: { text: '네, 잠시만 기다려 주세요!', en: 'Okay, please wait a moment!' },
  },
];
