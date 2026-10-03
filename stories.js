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
];
