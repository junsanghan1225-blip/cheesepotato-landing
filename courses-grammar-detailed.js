/*
 * 세분화된 한국어 문법 교육과정 — 초급 / 중급 / 고급
 *
 * 기존 courses-grammar.js (문법 Core 8강좌) 다음 단계로,
 * 미묘한 뉘앙스 차이를 구분하는 Cloze 문제 세트로 구성한다.
 *
 * [스키마 호환 규칙 — 기존 배우기 엔진 그대로 재사용하기 위함]
 *   1. 텍스트 블록:  { t:'text', md:'### 💡 규칙 설명...' }
 *   2. Cloze 블록:  { t:'cloze', sentence:"앞 문장 [정답] 뒷 문장", answer:"정답",
 *                     meaning:"영문 번역 (선택)", options:[정답 + 오답 3개], keys: options 와 동일,
 *                     why:"왜 이 정답이 맞는지 해설" }
 *   3. Speak 블록:  { t:'speak', say:"직접 읽을 문장", rom:"로마자", q:"가이드" }
 */

export const DETAILED_GRAMMAR_COURSES = [

  // ════════════════════════════════════════════════
  // 🟢 BEGINNER (초급) — 5강좌
  // ════════════════════════════════════════════════
  {
    id: 'bg-d-01',
    emoji: '🇰🇷',
    title: '초급 세밀: -아요 / -어요 바르게 쓰기',
    tagline: '모음에 따라 달라지는 어미 자동 구분',
    blurb: '하다·먹다·가다 동사의 모음(ㅏ/ㅗ vs 그 외)을 보고 -아요 / -어요를 정확히 고르는 8문제 훈련입니다.',
    level: 'Beginner',
    needs: 'grammar-core',
    lessons: [
      {
        id: 'bg-d-01-01',
        title: '1강. ㅏ/ㅗ 동사 뒤에는 -아요',
        minutes: 4,
        blocks: [
          { t:'text', md:'### 💡 -아요 / -어요 핵심 규칙\n1. **동사 어간 마지막 모음이 ㅏ 또는 ㅗ** 이면 → **-아요**\n2. 그 외 모든 모음 (ㅓ, ㅜ, ㅡ, ㅣ 등) 이면 → **-어요**\n3. `하다` 동사는 예외적으로 `해요` 로 불규칙 변화합니다.' },

          { t:'cloze', sentence:'오늘 학교에 [가요].', answer:'가요',
            meaning:'I go to school today.',
            options:['갔어요','가요','가아요','가고 싶어요'],
            keys:['가요','갔어요','가아요','가고 싶어요'],
            why:'어간 가 의 모음이 ㅏ 라 -아요 를 붙이는데, 가 + 아요 는 **가아요** 가 아니라 **가요** 로 줄어듭니다. 같은 모음이 겹치면 하나로 합쳐져요.' },

          { t:'cloze', sentence:'어제 친구를 [만났어요].', answer:'만났어요',
            meaning:'I met a friend yesterday.',
            options:['만나요','만났어요','만나았어요','만날 거예요'],
            keys:['만났어요','만나요','만나았어요','만날 거예요'],
            why:'“어제” 라서 지난 일입니다. 만나 + 았어요 는 **만나았어요** 가 아니라 **만났어요** 로 줄어들어요.' },

          { t:'cloze', sentence:'주말에 게임을 [해요].', answer:'해요',
            meaning:'I play games on weekends.',
            options:['했어요','할 거예요','해요','하고 싶어요'],
            keys:['해요','했어요','할 거예요','하고 싶어요'],
            why:'하다 는 규칙을 따르지 않고 늘 **해요** 가 됩니다. 나머지 셋도 다 쓰는 말이지만 각각 지난 일 · 앞일 · 바람이에요.' },

          { t:'speak', say:'나는 오늘 친구를 만나고 영화를 봐요.', rom:'na-neun o-neul chin-gu-reul man-na-go yeong-hwa-reul bwa-yo',
            q:'자연스러운 리듬으로 한 번 읽어 보세요.' },
        ],
      },
      {
        id: 'bg-d-01-02',
        title: '2강. 그 외 모음은 전부 -어요',
        minutes: 4,
        blocks: [
          { t:'text', md:'### 💡 -어요를 쓰는 대표 동사\n- 먹다 (ㅓ) → 먹어요\n- 배우다 (ㅜ) → 배워요\n- 읽다 (ㅣ) → 읽어요\n- 기다리다 (ㅣ) → 기다려요\n모음 ㅏ/ㅗ 가 **아니라면** 전부 -어요 라고 생각하면 됩니다!' },

          { t:'cloze', sentence:'점심으로 김밥을 [먹어요].', answer:'먹어요',
            meaning:'I eat kimbap for lunch.',
            options:['먹아요','먹어요','먹었어요','먹을 거예요'],
            keys:['먹어요','먹아요','먹었어요','먹을 거예요'],
            why:'어간 먹 의 모음은 ㅓ 이므로 -어요 입니다. **먹아요** 는 ㅏ/ㅗ 일 때 쓰는 어미를 잘못 붙인 형태예요.' },

          { t:'cloze', sentence:'한국어를 열심히 [배워요].', answer:'배워요',
            meaning:'I study Korean hard.',
            options:['배우어요','배워요','배웠어요','배우고 싶어요'],
            keys:['배워요','배우어요','배웠어요','배우고 싶어요'],
            why:'어간 배우 의 모음은 ㅜ 라 -어요 를 붙이는데, 우 + 어 는 **워** 로 합쳐집니다. **배우어요** 는 줄이지 않은 형태라 실제로는 쓰지 않아요.' },

          { t:'cloze', sentence:'책을 조용히 [읽어요].', answer:'읽어요',
            meaning:'I read a book quietly.',
            options:['읽아요','읽었어요','읽어요','읽을 거예요'],
            keys:['읽어요','읽아요','읽었어요','읽을 거예요'],
            why:'어간 읽 의 모음은 **ㅣ** 입니다. ㅏ/ㅗ 가 아니므로 -어요 를 붙여 읽어요 가 돼요.' },

          { t:'cloze', sentence:'버스를 30분 동안 [기다려요].', answer:'기다려요',
            meaning:'I wait for the bus for 30 minutes.',
            options:['기다리어요','기다려요','기다렸어요','기다릴 거예요'],
            keys:['기다려요','기다리어요','기다렸어요','기다릴 거예요'],
            why:'끝 리 의 모음 ㅣ 에 어요 가 붙어 **려** 로 줄어듭니다. **기다리어요** 는 줄이기 전 모습이라 말할 때는 쓰지 않아요.' },

          { t:'speak', say:'나는 매일 학교에서 한국어를 배우고 책을 읽어요.', q:'-어요 동사 3개를 자연스럽게 연결해 보세요.' },
        ],
      },
    ],
  },

  {
    id: 'bg-d-02',
    emoji: '🕒',
    title: '초급 세밀: -고 싶다 / -을 거예요 뉘앙스 구분',
    tagline: '단순 희망 vs 확정된 미래 계획',
    blurb: '하고 싶은 막연한 소원 vs 내일 반드시 할 계획. 두 표현을 언제 써야 하는지 문맥으로 구분하는 훈련입니다.',
    level: 'Beginner',
    needs: 'bg-d-01',
    lessons: [
      /* ── 1강 ──────────────────────────────────────────────
         한 표현을 끝까지 붙든다. 규칙 한 덩어리 던지고 바로 문제로 가면
         맞히기는 해도 남지 않는다. 뜻 → 만드는 법 두 단계 → 표 → 예문 →
         함정 순서로 가고, 문제는 그다음이다. */
      {
        id: 'bg-d-02-01',
        title: '1강. 마음속 바람 -고 싶다',
        minutes: 5,
        blocks: [
          { t:'text', h:'무슨 말을 하는 표현인가',
            md:'**-고 싶다** 는 내 **마음속 바람**을 말합니다.\n\n일정표에 적힌 일이 아니라, 아직 정해지지 않았지만 하고 싶은 일이에요. 그래서 “언젠가”, “나중에”, “한 번쯤” 같은 말과 잘 붙습니다.' },

          { t:'text', h:'1단계 — 사전형에서 다를 뗀다',
            md:'가**다** → 가\n먹**다** → 먹\n\n남은 앞부분이 **어간**입니다. 한국어의 모든 어미는 여기에 붙어요.' },

          { t:'text', h:'2단계 — 어간에 고 싶어요를 붙인다',
            md:'가 + **고 싶어요** → 가고 싶어요\n먹 + **고 싶어요** → 먹고 싶어요\n\n받침이 있든 없든 모양이 하나도 안 바뀝니다. 초급 표현 중에 제일 쉬운 축에 드는 이유예요.' },

          { t:'table',
            head:['사전형','어간','-고 싶어요'],
            rows:[
              ['가다 — to go','가','가**고 싶어요**'],
              ['먹다 — to eat','먹','먹**고 싶어요**'],
              ['보다 — to watch','보','보**고 싶어요**'],
              ['살다 — to live','살','살**고 싶어요**'],
              ['공부하다 — to study','공부하','공부하**고 싶어요**'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'언젠가 제주도에 가고 싶어요.', tip:'I want to go to Jeju someday. — 날짜는 안 정했다' },
            { ch:'따뜻한 국물이 먹고 싶어요.', tip:'I feel like having something warm and soupy.' },
            { ch:'그 영화 꼭 보고 싶어요.', tip:'I really want to see that film.' },
            { ch:'한국에서 한 달쯤 살고 싶어요.', tip:'I want to live in Korea for about a month.' },
            { ch:'저는 한국어를 더 잘하고 싶어요.', tip:'I want to get better at Korean.' },
          ]},

          { t:'note', md:'**남의 바람에는 못 씁니다.** 내가 아니라 다른 사람이 원할 때는 **-고 싶어하다** 로 바뀝니다.\n\n동생이 가고 싶**어해요**. (○)\n동생이 가고 싶어요. (✕)\n\n한국어는 남의 속마음을 단정해 말하지 않습니다. 그래서 어미를 하나 더 씌워 “그렇게 보인다”로 물러서요.' },

          { t:'text', h:'쓰는 자리와 안 쓰는 자리',
            md:'**쓴다** — 아직 안 정했는데 마음이 그쪽으로 갈 때.\n오늘 좀 쉬**고 싶어요**.\n\n**안 쓴다** — 이미 정해진 일을 알릴 때. 그때는 -(으)ㄹ 거예요 입니다.\n세 시에 출발하고 싶어요. (✕ 약속이 잡혔는데 바람처럼 들린다)\n세 시에 출발**할 거예요**. (○)\n\n**안 쓴다** — 남의 마음을 말할 때. -고 싶어하다 로 갑니다.' },

          /* 보기는 전부 실제로 쓰는 말로 둔다. 없는 말을 섞으면 뜻을 안 보고
             생김새만 보고 고르게 된다 — 그건 문법 공부가 아니라 오타 찾기다.
             넷 다 맞는 말이되 뜻이 다르면, 고르려고 뜻을 읽어야 한다. */
          { t:'cloze', sentence:'나중에 세계 여행을 [가고 싶어요].', answer:'가고 싶어요',
            meaning:'I want to travel the world someday.',
            options:['갈 거예요','가고 싶어요','가려고 해요','가기로 했어요'],
            keys:['가고 싶어요','갈 거예요','가려고 해요','가기로 했어요'],
            why:'넷 다 쓰는 말입니다. **갈 거예요** 는 일정이 잡혔다, **가려고 해요** 는 마음을 먹었다, **가기로 했어요** 는 정해서 약속했다는 뜻이에요. “나중에” 는 아무것도 안 정한 상태라 바람 쪽입니다.' },

          { t:'cloze', sentence:'오늘 저녁에는 피자를 [먹고 싶어요].', answer:'먹고 싶어요',
            meaning:'I feel like eating pizza tonight.',
            options:['먹을 거예요','먹으려고 해요','먹고 싶어요','먹기로 했어요'],
            keys:['먹고 싶어요','먹을 거예요','먹으려고 해요','먹기로 했어요'],
            why:'주문을 넣었으면 **먹을 거예요**, 가족과 정했으면 **먹기로 했어요** 입니다. 여기서는 “피자가 당긴다” 는 마음뿐이라 -고 싶어요.' },

          /* 고르기만 하면 읽을 줄만 알게 된다. 한 번은 손으로 써 봐야 한다. */
          { t:'type', q:'배우다 (to learn) — “한국 요리를 ___ .” 바람으로 바꿔 쓰세요.',
            answer:'배우고 싶어요',
            keys:['배우고 싶어요','배울 거예요','배우려고 해요','배우기로 했어요'],
            why:'어간 배우 에 고 싶어요 를 그대로 붙입니다. 받침을 따지지 않아요.' },

          { t:'choice', q:'동생도 같이 가기를 바라고 있어요. 알맞은 것은?',
            options:['동생도 가고 싶어요','동생도 가고 싶어해요','동생도 가려고 해요'], answer:1,
            why:'**가려고 해요** 도 맞는 말이지만 “가기로 마음먹었다” 는 뜻이라 바람과 다릅니다. 남의 바람을 말할 때는 -고 싶어하다 입니다.' },

          { t:'speak', say:'저는 언젠가 제주도에 가서 한 달쯤 살고 싶어요.',
            q:'바람을 말하는 문장이라 끝을 조금 부드럽게 놓아 보세요.' },
        ],
      },

      /* ── 2강 ────────────────────────────────────────────── */
      {
        id: 'bg-d-02-02',
        title: '2강. 정해진 일정 -(으)ㄹ 거예요',
        minutes: 5,
        blocks: [
          { t:'text', h:'무슨 말을 하는 표현인가',
            md:'**-(으)ㄹ 거예요** 는 **이미 정해 둔 일**을 말합니다.\n\n마음이 아니라 일정입니다. 표를 끊었거나, 약속을 잡았거나, 하기로 마음을 굳힌 일이에요. “내일”, “다음 주”, “세 시에” 처럼 때를 가리키는 말과 붙습니다.' },

          { t:'text', h:'1단계 — 어간에 받침이 있는지 본다',
            md:'만나**다** → 만나 … 받침 **없음**\n읽**다** → 읽 … 받침 **있음** (ㄱ)\n\n이 한 가지만 보면 다음 단계가 정해집니다.' },

          { t:'text', h:'2단계 — 받침이 있으면 을, 없으면 ㄹ',
            md:'받침 없음 → 어간 + **ㄹ 거예요**\n만나 + ㄹ 거예요 → 만날 거예요\n\n받침 있음 → 어간 + **을 거예요**\n읽 + 을 거예요 → 읽을 거예요' },

          { t:'table',
            head:['사전형','어간','받침','-(으)ㄹ 거예요'],
            rows:[
              ['만나다 — to meet','만나','없음','만나**ㄹ** → 만날 거예요'],
              ['보다 — to watch','보','없음','보**ㄹ** → 볼 거예요'],
              ['읽다 — to read','읽','있음 (ㄱ)','읽**을** 거예요'],
              ['먹다 — to eat','먹','있음 (ㄱ)','먹**을** 거예요'],
              ['살다 — to live','살','받침이 ㄹ','살 거예요'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'내일 오전 열 시에 친구를 만날 거예요.', tip:'I am meeting a friend at 10 tomorrow. — 약속이 잡혔다' },
            { ch:'이번 주말에는 집에서 영화를 볼 거예요.', tip:'I am going to watch films at home this weekend.' },
            { ch:'올해는 책을 오십 권 읽을 거예요.', tip:'I am going to read fifty books this year.' },
            { ch:'점심은 학교 앞에서 먹을 거예요.', tip:'I will eat lunch in front of the school.' },
            { ch:'다음 달부터 서울에서 살 거예요.', tip:'I am going to live in Seoul from next month.' },
          ]},

          { t:'note', md:'**어간 받침이 ㄹ 이면 을을 또 붙이지 않습니다.**\n\n살다 → 살 거예요 (○) / 살을 거예요 (✕)\n만들다 → 만들 거예요 (○)\n\n이미 ㄹ 이 있으니 그대로 두는 것입니다.' },

          { t:'text', h:'쓰는 자리와 안 쓰는 자리',
            md:'**쓴다** — 때가 정해졌거나, 표를 끊었거나, 이미 마음을 굳혔을 때.\n다음 주에 이사**할 거예요**.\n\n**안 쓴다** — 아직 아무것도 안 정했을 때. 그때는 -고 싶어요 입니다.\n\n**곁들여 알아 둘 것** — **-(으)려고 해요** 는 “그럴 생각이다”, **-기로 했어요** 는 “그렇게 정했다” 입니다. 셋 다 앞일을 말하지만 굳기의 정도가 다릅니다.' },

          { t:'cloze', sentence:'내일 오전 10시에 친구를 [만날 거예요].', answer:'만날 거예요',
            meaning:'I am going to meet a friend tomorrow at 10 AM.',
            options:['만나고 싶어요','만날 거예요','만나려고 해요','만났어요'],
            keys:['만날 거예요','만나고 싶어요','만나려고 해요','만났어요'],
            why:'**만났어요** 는 지난 일, **만나고 싶어요** 는 바람, **만나려고 해요** 는 생각 중입니다. “내일 10시” 로 약속이 잡혔으니 -ㄹ 거예요.' },

          { t:'cloze', sentence:'다음 달부터 서울에서 [살 거예요].', answer:'살 거예요',
            meaning:'I am going to live in Seoul from next month.',
            options:['살고 싶어요','살 거예요','살려고 해요','살았어요'],
            keys:['살 거예요','살고 싶어요','살려고 해요','살았어요'],
            why:'“다음 달부터” 라고 때를 못 박았습니다. 어간 살 의 받침이 이미 ㄹ 이라 을 을 더 붙이지 않고 살 거예요 입니다.' },

          /* 받침 규칙은 고르기로 안 익는다. 어간을 보고 직접 만들어 봐야 한다. */
          { t:'type', q:'읽다 (to read) — “올해는 책을 오십 권 ___ .” 받침을 보고 만들어 쓰세요.',
            answer:'읽을 거예요',
            keys:['읽을 거예요','읽고 싶어요','읽으려고 해요','읽었어요'],
            why:'읽 은 받침 ㄱ 이 있으므로 을 거예요 를 붙입니다. 받침이 없었다면 ㄹ 거예요 였어요.' },

          { t:'pair', q:'사전형과 -(으)ㄹ 거예요 형태를 짝지어 보세요.',
            pairs:[
              ['만나다 (받침 없음)','만날 거예요'],
              ['읽다 (받침 ㄱ)','읽을 거예요'],
              ['살다 (받침 ㄹ)','살 거예요'],
              ['먹다 (받침 ㄱ)','먹을 거예요'],
            ]},

          { t:'order', q:'“내일 친구를 만날 거예요.” 를 만들어 보세요.',
            tokens:['내일','친구를','만날 거예요'], answer:['내일','친구를','만날 거예요'] },

          { t:'speak', say:'다음 주 월요일에 서울역에서 기차를 타고 부산에 갈 거예요.',
            q:'정해진 일정이라 또박또박 끊어 읽어 보세요.' },
        ],
      },

      /* ── 3강 ──────────────────────────────────────────────
         코스 이름이 “뉘앙스 구분” 인데 정작 둘을 나란히 놓고 고르는 자리가
         없었다. 따로 배우면 각각은 알아도 갈림길에서 멈춘다. */
      {
        id: 'bg-d-02-03',
        title: '3강. 둘 중 무엇을 쓸까',
        minutes: 4,
        blocks: [
          { t:'text', h:'갈림길은 하나뿐이다',
            md:'**정해졌나, 아직인가.**\n\n표를 끊었으면 -(으)ㄹ 거예요, 아직 마음뿐이면 -고 싶어요. 문장 안의 때를 가리키는 말이 거의 항상 답을 알려 줍니다.' },

          { t:'table',
            head:['문장 속 단서','고르는 표현','보기'],
            rows:[
              ['언젠가 · 나중에 · 한 번쯤','-고 싶어요','언젠가 가**고 싶어요**'],
              ['내일 · 다음 주 · 세 시에','-(으)ㄹ 거예요','내일 **갈 거예요**'],
              ['표를 샀어요 · 약속했어요','-(으)ㄹ 거예요','벌써 **갈 거예요**'],
              ['그냥 마음이 그래요','-고 싶어요','그냥 쉬**고 싶어요**'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'언젠가 유럽에 가고 싶어요.', tip:'Someday I want to go to Europe. — 계획 없음' },
            { ch:'다음 달에 유럽에 갈 거예요.', tip:'I am going to Europe next month. — 표를 끊었다' },
            { ch:'한국 음식을 배우고 싶어요.', tip:'I want to learn Korean cooking. — 바람' },
            { ch:'토요일에 요리 수업에 갈 거예요.', tip:'I am going to a cooking class on Saturday. — 등록했다' },
          ]},

          { t:'note', md:'**둘 다 자연스러운 자리도 있습니다.**\n\n“주말에 쉬고 싶어요” 와 “주말에 쉴 거예요” 는 둘 다 맞습니다. 앞은 바람이고 뒤는 선언이에요. 틀린 것이 아니라 **말하는 사람의 태도**가 다른 것입니다.' },

          { t:'cloze', sentence:'아직 아무것도 안 정했지만 언젠가 유럽에 [가고 싶어요].', answer:'가고 싶어요',
            meaning:'Nothing is decided yet, but someday I want to go to Europe.',
            options:['갈 거예요','가고 싶어요','갔을 거예요','가고 싶어해요'],
            keys:['가고 싶어요','갈 거예요','갔을 거예요','가고 싶어해요'],
            why:'“아직 아무것도 안 정했지만” 이 단서입니다. 일정이 없으니 바람 쪽이에요.' },

          { t:'cloze', sentence:'비행기표를 벌써 샀어요. 다음 달에 유럽에 [갈 거예요].', answer:'갈 거예요',
            meaning:'I already bought the ticket. I am going to Europe next month.',
            options:['가고 싶어요','갈 거예요','가고 싶어해요','가는 거예요'],
            keys:['갈 거예요','가고 싶어요','가고 싶어해요','가는 거예요'],
            why:'표를 샀고 달까지 정해졌습니다. 마음이 아니라 일정이므로 -ㄹ 거예요.' },

          { t:'cloze', sentence:'친구가 한국에 유학을 [가고 싶어해요].', answer:'가고 싶어해요',
            meaning:'My friend wants to go study in Korea.',
            options:['가고 싶어요','갈 거예요','가고 싶어해요','가고 싶습니다'],
            keys:['가고 싶어해요','가고 싶어요','갈 거예요','가고 싶습니다'],
            why:'주어가 친구입니다. 남의 바람이므로 -고 싶어하다 로 물러서서 말합니다.' },

          { t:'pair', q:'상황과 표현을 짝지어 보세요.',
            pairs:[
              ['아직 정하지 않은 바람','-고 싶어요'],
              ['날짜까지 잡힌 일정','-(으)ㄹ 거예요'],
              ['다른 사람의 바람','-고 싶어해요'],
            ]},

          { t:'speak', say:'지금은 그냥 가고 싶은 마음이지만, 돈을 모으면 내년에는 꼭 갈 거예요.',
            q:'앞은 바람, 뒤는 계획입니다. 두 어미가 한 문장에 같이 나옵니다.' },
        ],
      },
    ],
  },

  {
    id: 'bg-d-03',
    emoji: '🙇',
    title: { ko:'초급 세밀: 존댓말 -(으)시- 사람에 맞게 바꾸기', en:'Beginner detail: honorific -(으)시-, matched to the person' },
    tagline: { ko:'같은 문장도 누구 얘기냐에 따라 통째로 달라진다', en:'The same sentence changes completely depending on who it’s about' },
    blurb: { ko:'“집에 가요”가 할머니 얘기가 되면 “할머니께서 집에 가세요”로 바뀝니다. 동사에 -(으)시-를 붙이는 규칙부터 드시다·계시다처럼 통째로 바뀌는 낱말까지, 기본 문장을 사람에 맞게 고치는 훈련입니다.',
           en:'“집에 가요” becomes “할머니께서 집에 가세요” when it’s about your grandmother. From the rule for attaching -(으)시- to verbs, to words that change completely — like 드시다 (eat) and 계시다 (be) — this trains you to reshape a basic sentence to fit the person you’re talking about.' },
    level: 'Beginner',
    needs: 'bg-04',
    hon: true,   // 존댓말 검사기(tools/check-honorific.mjs)가 이 표시로 코스를 골라 낸다
    lessons: [
      /* ── 1강 ──────────────────────────────────────────────
         규칙 먼저: 받침 있고 없고로 -세요/-으세요 가 갈린다.
         블록 속 글(h/md/q/why/head 등)은 cTx() 를 안 거치는 순수 문자열이라
         언어를 못 바꾼다(app.module.js readBlock·exBlock 확인) — 그래서
         영어로 적는다. 배우는 한국어 문장·답·보기는 그대로 한국어로 둔다. */
      {
        id: 'bg-d-03-01',
        title: { ko:'1강. 웃어른이 주어면 -(으)세요', en:'1. When an elder is the subject: -(으)세요' },
        minutes: 5,
        blocks: [
          /* 한눈에 보는 표를 맨 위에 둔다. 아래 걸음마다 나오는 규칙을
             먼저 요약으로 보여 주고, 그다음 하나씩 풀어서 설명한다 —
             전체 지도를 먼저 주면 이후 설명이 「그 표의 몇 번째 줄」로
             바로 붙는다. */
          { t:'table', h:'The honorific rules at a glance',
            head:['What changes','The rule, with examples'],
            rows:[
              ['Verbs/adjectives with no batchim','stem + -세요  (가다→가**세요**, 오다→오**세요**, 바쁘다→바쁘**세요**)'],
              ['Verbs/adjectives with a batchim','stem + -으세요  (앉다→앉**으세요**, 읽다→읽**으세요**)'],
              ['Stems ending in ㄹ','ㄹ drops, then + -세요  (살다→사**세요**, 만들다→만드**세요**)'],
              ['Verbs that change completely','먹다·마시다→드시다, 자다→주무시다, 있다(사람)→계시다, 말하다→말씀하시다, 아프다→편찮으시다'],
              ['Nouns that change completely','이름→성함, 나이→연세, 집→댁, 생일→생신, 밥→진지'],
              ['Particles','이/가→께서,  에게/한테→께'],
            ]},

          { t:'text', h:'What this expression does',
            md:'When the **subject of the sentence is someone senior to you** (grandmother, teacher, boss, a customer), you add **-(으)시-** to the verb or adjective to honor that person.\n\n저는 집에 가요. (about me — unchanged)\n\n할머니께서 집에 가**세요**. (about Grandma — honored)' },

          { t:'text', h:'How to build it — check the stem’s batchim',
            md:'가**다** → 가 … **no** batchim → attach **-세요** → 가세요\n\n앉**다** → 앉 … **has** a batchim (ㄴ) → attach **-으세요** → 앉으세요\n\nThat one check decides everything else. The top two rows of the table above are exactly this rule.' },

          { t:'table',
            head:['Dictionary form','Batchim','-(으)세요'],
            rows:[
              ['가다 — to go','none','가**세요**'],
              ['오다 — to come','none','오**세요**'],
              ['바쁘다 — to be busy','none','바쁘**세요**'],
              ['앉다 — to sit','yes (ㄴ)','앉**으세요**'],
              ['읽다 — to read','yes (ㄱ)','읽**으세요**'],
              ['살다 — to live','ㄹ (drops)','사**세요**'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'할머니께서 지금 집에 가세요.', tip:'Grandma is going home now. — the honorific form of 저는 집에 가요' },
            { ch:'사장님이 다음 주에 미국에서 오세요.', tip:'The boss is coming from the US next week.' },
            { ch:'선생님께서 공원 벤치에 앉으세요.', tip:'The teacher is sitting on the park bench.' },
            { ch:'할아버지께서 요즘 많이 바쁘세요.', tip:'Grandpa has been very busy lately.' },
          ]},

          { t:'note', md:'**Honoring yourself sounds odd.** -(으)시- is only used when the subject of the sentence is someone senior to you.\n\n저는 지금 가세요. (✕ — this honors “me”)\n\n저는 지금 가요. (○)\n\nIt’s also not usually used for friends or people your age or younger.' },

          { t:'cloze', sentence:'할머니께서 공원 벤치에 [앉으세요].', answer:'앉으세요',
            meaning:'Grandma is sitting on the park bench.',
            options:['앉아요','앉으세요','앉았어요','앉을 거예요'],
            keys:['앉으세요','앉아요','앉았어요','앉을 거예요'],
            why:'The subject is 할머니 (Grandma), someone senior. 앉다 has the batchim ㄴ, so it takes -으세요.' },

          { t:'cloze', sentence:'사장님이 다음 주에 미국에서 [오세요].', answer:'오세요',
            meaning:'The boss is coming from the US next week.',
            options:['와요','오세요','왔어요','올 거예요'],
            keys:['오세요','와요','왔어요','올 거예요'],
            why:'The subject is 사장님 (the boss), and 오다 has no batchim, so -세요 attaches directly.' },

          { t:'type', q:'바쁘다 (to be busy) — “선생님께서 요즘 많이 ___.”',
            answer:'바쁘세요',
            keys:['바쁘세요','바빠요','바빴어요','바쁠 거예요'],
            why:'바쁘다 has no batchim, so -세요 attaches directly to the stem 바쁘.' },

          { t:'choice', q:'Which of these can correctly use -(으)세요?',
            options:['저는 지금 가세요','친구가 지금 가세요','할머니께서 지금 가세요'], answer:2,
            why:'-(으)시- is only used when the subject of the sentence is someone senior to you — not for yourself or a friend.' },

          { t:'order', q:'Put together “할머니께서 공원 벤치에 앉으세요.”',
            tokens:['할머니께서','공원 벤치에','앉으세요'], answer:['할머니께서','공원 벤치에','앉으세요'] },

          { t:'speak', say:'할머니께서 지금 신문을 읽으세요.',
            q:'When talking about someone senior, read -으세요 with a soft, gentle tone.' },
        ],
      },

      /* ── 2강 ──────────────────────────────────────────────
         규칙으로 안 되는 낱말들 — 통째로 바뀐다. */
      {
        id: 'bg-d-03-02',
        title: { ko:'2강. 통째로 바뀌는 낱말 — 드시다·계시다', en:'2. Words that change completely — 드시다, 계시다' },
        minutes: 5,
        blocks: [
          { t:'text', h:'What this expression does',
            md:'A handful of words don’t take -(으)시- at all — instead, they **change into a completely different word**. Some are verbs, some are nouns.' },

          { t:'table',
            head:['Plain','Honorific','Meaning'],
            rows:[
              ['먹다 · 마시다','드시다','eat / drink'],
              ['자다','주무시다','sleep'],
              ['있다 (사람)','계시다','be (a person is)'],
              ['말하다','말씀하시다','say, speak'],
              ['아프다','편찮으시다','be sick'],
              ['이름','성함','name'],
              ['나이','연세','age'],
              ['집','댁','house, home'],
              ['생일','생신','birthday'],
              ['밥 · 식사','진지','meal'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'할아버지께서 진지를 드세요.', tip:'Grandpa is eating a meal. — the honorific form of 저는 밥을 먹어요' },
            { ch:'할머니께서 방에서 주무세요.', tip:'Grandma is sleeping in her room.' },
            { ch:'선생님, 성함이 어떻게 되세요?', tip:'Teacher, what is your name? — more polite than 이름이 뭐예요?' },
            { ch:'할머니께서 지금 댁에 계세요.', tip:'Grandma is at home right now.' },
          ]},

          { t:'note', md:'**있다 splits into two.** When it means a person “exists,” use **계시다**. When it means “to have” something like time or money, keep the regular -(으)시- and use **있으시다**.\n\n할머니께서 방에 계세요. (○ — existence)\n\n선생님, 시간 있으세요? (○ — possession)\n\n선생님, 시간 계세요? (✕)' },

          { t:'cloze', sentence:'할아버지께서 방에서 [주무세요].', answer:'주무세요',
            meaning:'Grandpa is sleeping in his room.',
            options:['자요','자세요','주무세요','주무셨어요'],
            keys:['주무세요','자요','자세요','주무셨어요'],
            why:'The honorific of 자다 changes completely to 주무시다. You don’t just attach -세요 to 자다, as in 자세요.' },

          { t:'cloze', sentence:'할머니께서 지금 방에 [계세요].', answer:'계세요',
            meaning:'Grandma is in her room right now.',
            options:['있어요','있으세요','계세요','계셨어요'],
            keys:['계세요','있어요','있으세요','계셨어요'],
            why:'This means a person is present, so it becomes 계시다. 있으세요 is for things you have, like time or objects.' },

          { t:'cloze', sentence:'선생님, [성함]이 어떻게 되세요?', answer:'성함',
            meaning:'Teacher, what is your name?',
            options:['이름','성함','연세','댁'],
            keys:['성함','이름','연세','댁'],
            why:'When asking someone senior their name, use 성함 instead of 이름.' },

          { t:'type', q:'아프다 (honorific) — “할머니, 어디 ___?” (use the honorific of 아프다)',
            answer:'편찮으세요',
            keys:['편찮으세요','아프세요','아팠어요','편찮았어요'],
            why:'The honorific of 아프다 changes completely to 편찮다, which has the batchim ㅎ, so it takes -으세요.' },

          { t:'pair', q:'Match each plain word with its honorific form.',
            pairs:[
              ['먹다 · 마시다','드시다'],
              ['자다','주무시다'],
              ['있다 (사람)','계시다'],
              ['이름','성함'],
            ]},

          { t:'speak', say:'할머니, 요즘 어떠세요? 진지는 잘 드세요?',
            q:'These two honorific words often appear together in a greeting.' },
        ],
      },

      /* ── 3강 ──────────────────────────────────────────────
         실전: 기본 문장을 놓고 누구 얘기인지에 맞춰 통째로 바꿔 쓴다.
         고르기만 하면 읽을 줄만 알게 된다. build 블록으로 직접 만들어 본다. */
      {
        id: 'bg-d-03-03',
        title: { ko:'3강. 같은 문장, 다른 사람 — 바꿔 써 보기', en:'3. Same sentence, different person — rewrite it' },
        minutes: 5,
        blocks: [
          { t:'text', h:'In real use, you rewrite the whole sentence',
            md:'When you actually speak, first decide **who this is about**, then change **both the verb and the words** to match. Changing only one sounds off.' },

          { t:'table',
            head:['Basic sentence','When it’s about someone senior'],
            rows:[
              ['집에 가요.','할머니께서 집에 가세요.'],
              ['밥을 먹어요.','할아버지께서 진지를 드세요.'],
              ['이름이 뭐예요?','성함이 어떻게 되세요?'],
              ['지금 집에 있어요.','지금 댁에 계세요.'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'할머니께서 집에 가세요.', tip:'Plain: 집에 가요. — change the subject to 할머니 and attach -세요 to 가다' },
            { ch:'할아버지께서 진지를 드세요.', tip:'Plain: 밥을 먹어요. — both 밥→진지 and 먹다→드시다 change' },
            { ch:'사장님, 연세가 어떻게 되세요?', tip:'Plain: 나이가 몇 살이에요? — 나이 changes completely to 연세' },
          ]},

          { t:'note', md:'**Both parts need to change to sound natural.** If you only change the verb, as in “할아버지께서 밥을 드세요,” and leave the noun as is, you get a half-honored sentence. If a word changes completely, change that first.' },

          { t:'cloze', sentence:'사장님께서 지금 사무실에 [계세요].', answer:'계세요',
            meaning:'The boss is in the office right now.',
            options:['있어요','있으세요','계세요','가세요'],
            keys:['계세요','있어요','있으세요','가세요'],
            why:'This means a person is present, so it becomes 계시다.' },

          { t:'cloze', sentence:'할머니, [댁]이 어디세요?', answer:'댁',
            meaning:'Grandma, where is your home?',
            options:['집','댁','방','나라'],
            keys:['댁','집','방','나라'],
            why:'When talking about a senior person’s home, use 댁 instead of 집.' },

          { t:'build', q:'Rewrite the basic sentence “집에 가요” as if it’s about your grandmother.',
            answers:['할머니께서 집에 가세요.','할머니가 집에 가세요.'],
            bank:['할머니께서','할머니가','집에','가세요','가요'],
            must:['가세요'],
            hint:'가다 has no batchim, so 가 + 세요' },

          { t:'build', q:'Rewrite the basic sentence “밥을 먹어요” as if it’s about your grandfather.',
            answers:['할아버지께서 진지를 드세요.','할아버지가 진지를 드세요.'],
            bank:['할아버지께서','할아버지가','진지를','드세요','밥을','먹어요'],
            must:['진지'],
            hint:'밥 becomes 진지, and 먹다 changes completely to 드시다' },

          { t:'speak', say:'할머니, 요즘 어떻게 지내세요? 건강은 괜찮으세요?',
            q:'This is a phrase people actually use to ask how someone senior is doing.' },
        ],
      },
    ],
  },

  {
    id: 'bg-d-04',
    emoji: '🎩',
    title: { ko:'초급 세밀: 존댓말 넓히기 — 과거·격식체·묻고 권하기', en:'Beginner detail: broadening honorifics — past, formal, asking and offering' },
    tagline: { ko:'세요 하나로는 못 담는 존댓말 표현들', en:'Honorific forms -(으)세요 alone can’t cover' },
    blurb: { ko:'지나간 일은 -(으)셨어요, 뉴스·발표 같은 자리는 -(으)십니다, 묻고 권할 때는 -(으)실래요·-(으)시겠어요까지. -(으)세요 다음 단계로 존댓말 표현을 단계별로 넓힙니다.',
           en:'Something that already happened takes -(으)셨어요. News and announcements take -(으)십니다. Asking or offering takes -(으)실래요 or -(으)시겠어요. This broadens honorific expressions step by step, past -(으)세요.' },
    level: 'Beginner',
    needs: 'bg-d-03',
    hon: true,
    lessons: [
      /* ── 1강 ──────────────────────────────────────────────
         -(으)세요의 과거. 세요→셨어요만 바꾸면 되는 걸 먼저 보여 준다. */
      {
        id: 'bg-d-04-01',
        title: { ko:'1강. 지나간 일은 -(으)셨어요', en:'1. Something that already happened: -(으)셨어요' },
        minutes: 5,
        blocks: [
          { t:'table', h:'The -(으)셨어요 rules at a glance',
            head:['What changes','The rule, with examples'],
            rows:[
              ['Verbs/adjectives with no batchim','stem + -셨어요  (가다→가**셨어요**, 오다→오**셨어요**, 바쁘다→바쁘**셨어요**)'],
              ['Verbs/adjectives with a batchim','stem + -으셨어요  (앉다→앉**으셨어요**, 읽다→읽**으셨어요**)'],
              ['Stems ending in ㄹ','ㄹ drops, then + -셨어요  (살다→사**셨어요**, 만들다→만드**셨어요**)'],
              ['Words that already change completely also take the past this way','드시다→드**셨어요**, 계시다→계**셨어요**, 주무시다→주무**셨어요**, 편찮으시다→편찮으**셨어요**'],
            ]},

          { t:'text', h:'What this expression does',
            md:'**-(으)셨어요** is the past tense of -(으)세요. Use it when something the honored person did already happened.\n\n할머니께서 어제 집에 가**세요**. (✕ — sounds like something happening now)\n\n할머니께서 어제 집에 가**셨어요**. (○ — something that happened yesterday)' },

          { t:'text', h:'How to build it — just swap 세요 for 셨어요',
            md:'The rule for building -(으)세요 stays the same — you only swap the final **세요** for **셨어요**.\n\n가세요 → 가**셨어요**\n\n앉으세요 → 앉**으셨어요**\n\n드세요 → 드**셨어요** (드시다 changes the same way)' },

          { t:'table',
            head:['Dictionary form','Past honorific'],
            rows:[
              ['가다 — to go','가**셨어요**'],
              ['읽다 — to read','읽**으셨어요**'],
              ['살다 — to live','사**셨어요**'],
              ['드시다 — to eat (hon.)','드**셨어요**'],
              ['편찮으시다 — to be sick (hon.)','편찮으**셨어요**'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'할머니께서 어제 병원에 가셨어요.', tip:'Grandma went to the hospital yesterday.' },
            { ch:'할아버지께서 아까 진지를 드셨어요.', tip:'Grandpa ate a meal a while ago.' },
            { ch:'선생님께서 지난주에 편찮으셨어요.', tip:'The teacher was sick last week.' },
          ]},

          { t:'note', md:'**Mixing up 세요 and 셨어요 changes the tense.** If there’s a word for a past time like “yesterday,” “a while ago,” or “last week,” it must be 셨어요.\n\n어제 오세요. (✕ — sounds like a command to come now, even though it says “yesterday”)\n\n어제 오**셨어요**. (○)' },

          { t:'cloze', sentence:'할머니께서 어제 병원에 [가셨어요].', answer:'가셨어요',
            meaning:'Grandma went to the hospital yesterday.',
            options:['가세요','가셨어요','가실 거예요','가고 계세요'],
            keys:['가셨어요','가세요','가실 거예요','가고 계세요'],
            why:'There’s a past-time word, “어제” (yesterday), so the past honorific -셨어요 is used.' },

          { t:'cloze', sentence:'할아버지께서 아까 진지를 [드셨어요].', answer:'드셨어요',
            meaning:'Grandpa ate a meal a while ago.',
            options:['드세요','드셨어요','드실 거예요','드시겠어요'],
            keys:['드셨어요','드세요','드실 거예요','드시겠어요'],
            why:'“아까” means “a little while ago” — already past. 드시다 takes 셨어요 the same way.' },

          { t:'type', q:'읽다 — “할머니께서 지난주에 이 책을 다 ___.” Write the past honorific form.',
            answer:'읽으셨어요',
            keys:['읽으셨어요','읽으세요','읽으실 거예요','읽었어요'],
            why:'There’s a batchim ㄱ, so -으셨어요 attaches.' },

          { t:'choice', q:'Which one sounds natural after “어제” (yesterday)?',
            options:['할머니께서 어제 집에 가세요','할머니께서 어제 집에 가셨어요','할머니께서 어제 집에 가실 거예요'], answer:1,
            why:'“어제” is a past time word, so the past honorific -셨어요 is correct.' },

          { t:'order', q:'Put together “할아버지께서 아까 진지를 드셨어요.”',
            tokens:['할아버지께서','아까','진지를','드셨어요'], answer:['할아버지께서','아까','진지를','드셨어요'] },

          { t:'speak', say:'할머니께서 어제 오랜만에 친구를 만나셨어요.',
            q:'This is about the past, so make the 셨어요 clear as you read it.' },
        ],
      },

      /* ── 2강 ──────────────────────────────────────────────
         격식체 존댓말. -습니다/-ㅂ니다(격식) 와 -시-(존댓말)는 다른 축이라는
         것부터 짚는다 — 그래야 사물존댓말(포장이세요? 류)도 자리를 잡는다. */
      {
        id: 'bg-d-04-02',
        title: { ko:'2강. 뉴스·발표 자리는 -(으)십니다', en:'2. News and announcements: -(으)십니다' },
        minutes: 5,
        blocks: [
          { t:'table', h:'The -(으)십니다 rules at a glance',
            head:['What changes','The rule, with examples'],
            rows:[
              ['Verbs/adjectives with no batchim','stem + -십니다  (가다→가**십니다**, 오다→오**십니다**)'],
              ['Verbs/adjectives with a batchim','stem + -으십니다  (앉다→앉**으십니다**, 읽다→읽**으십니다**)'],
              ['Stems ending in ㄹ','ㄹ drops, then + -십니다  (살다→사**십니다**, 만들다→만드**십니다**)'],
              ['Questions use -까 instead','가십니다 → 가**십니까**?  /  읽으십니다 → 읽으**십니까**?'],
              ['Words that already change completely still work the same way','드시다→드**십니다**, 계시다→계**십니다**, 주무시다→주무**십니다**'],
            ]},

          { t:'text', h:'What this expression does',
            md:'**-(으)십니다** is an honorific used in **more formal settings** than -(으)세요 — news, presentations, announcements, a company’s official occasions.\n\n할머니께서 집에 가**세요**. (everyday conversation)\n\n사장님께서 지금 도착하**십니다**. (a company announcement)' },

          { t:'note', md:'**-습니다/-ㅂ니다 is formal, but it isn’t honorific.** For it to be honorific, -시- has to be there too.\n\n오늘 회의를 시작합니다. (formal: yes, honorific: no — the subject can be anyone)\n\n사장님께서 회의를 시작하**십니다**. (formal: yes, honorific: yes — the subject is someone senior)' },

          { t:'table',
            head:['Dictionary form','-(으)십니다'],
            rows:[
              ['가다 — to go','가**십니다**'],
              ['앉다 — to sit','앉**으십니다**'],
              ['살다 — to live','사**십니다**'],
              ['드시다 — to eat (hon.)','드**십니다**'],
              ['계시다 — to be (hon.)','계**십니다**'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'사장님께서 지금 회의실에 계십니다.', tip:'The boss is in the meeting room right now. — a formal announcement' },
            { ch:'잠시 후 부장님께서 도착하십니다.', tip:'The department head will arrive shortly.' },
            { ch:'손님, 무엇을 드십니까?', tip:'Sir/Ma’am, what would you like to eat? — formal register, as at a restaurant' },
          ]},

          { t:'note', md:'**-시- doesn’t attach to things that aren’t people.** Attaching it to an object produces what’s often called “object honorification” — a mistake, even though it’s common.\n\n주문하신 커피 나오**셨습니다**. (✕ — the coffee isn’t a person)\n\n주문하신 커피 나왔습니다. (○)' },

          { t:'cloze', sentence:'잠시 후 부장님께서 [도착하십니다].', answer:'도착하십니다',
            meaning:'The department head will arrive shortly.',
            options:['도착합니다','도착하십니다','도착하세요','도착하셨습니다'],
            keys:['도착하십니다','도착합니다','도착하세요','도착하셨습니다'],
            why:'The subject is 부장님 (someone senior), and this is a formal setting like an announcement, so -십니다 is correct. 도착합니다 isn’t honorific — it works for any subject.' },

          { t:'cloze', sentence:'손님, 무엇을 [드십니까]?', answer:'드십니까',
            meaning:'What would you like to eat, sir/ma’am?',
            options:['먹습니까','드십니까','드세요','드셨습니까'],
            keys:['드십니까','먹습니까','드세요','드셨습니까'],
            why:'This is a question in a formal setting like a restaurant, so the question form -십니까 is used.' },

          { t:'type', q:'앉다 — “이쪽으로 ___.” (announcing to a meeting room, in the formal honorific)',
            answer:'앉으십니다',
            keys:['앉으십니다','앉으세요','앉습니다','앉으셨습니다'],
            why:'There’s a batchim ㄴ, so -으십니다 attaches.' },

          { t:'choice', q:'Which sentence wrongly attaches an honorific to an object?',
            options:['사장님께서 지금 오십니다','이 상품은 품절이십니다','손님, 이쪽으로 앉으십니다'], answer:1,
            why:'“이 상품은 품절이십니다” attaches -시- to a product (an object), which is incorrect. “품절입니다” is correct.' },

          { t:'order', q:'Put together “잠시 후 부장님께서 도착하십니다.”',
            tokens:['잠시 후','부장님께서','도착하십니다'], answer:['잠시 후','부장님께서','도착하십니다'] },

          { t:'speak', say:'손님 여러분, 잠시 후 열차가 도착합니다. 사장님께서는 지금 회의실에 계십니다.',
            q:'The first sentence isn’t honorific (a train), the second is (the boss). Bring out that difference as you read.' },
        ],
      },

      /* ── 3강 ──────────────────────────────────────────────
         묻고 권하는 자리. 세 표현의 정중도 차이를 나란히 놓는다. */
      {
        id: 'bg-d-04-03',
        title: { ko:'3강. 묻고 권할 때 — 실래요·시겠어요·실 거예요', en:'3. Asking and offering — 실래요, 시겠어요, 실 거예요' },
        minutes: 5,
        blocks: [
          { t:'table', h:'Honorific offers, questions, and plans at a glance',
            head:['Expression','Meaning and use','Example'],
            rows:[
              ['-(으)세요?','asking plainly','어디 가**세요**?'],
              ['-(으)실래요?','offering casually, or asking their preference','같이 가**실래요**?'],
              ['-(으)시겠어요?','offering or asking more politely (restaurants, service)','무엇을 드**시겠어요**?'],
              ['-(으)실 거예요?','asking about a future plan','내일 오**실 거예요**?'],
            ]},

          { t:'text', h:'What this expression does',
            md:'Besides -(으)세요?, there are several other ways to ask or offer something to someone senior. You pick one based on the setting.\n\nCasually, among friends → -(으)실래요?\n\nPolitely, as at a restaurant or in service → -(으)시겠어요?\n\nWhen asking about a plan → -(으)실 거예요?' },

          { t:'table',
            head:['Dictionary form','-(으)실래요?'],
            rows:[
              ['가다 — to go','가**실래요**?'],
              ['앉다 — to sit','앉**으실래요**?'],
              ['드시다 — to eat (hon.)','드**실래요**?'],
            ]},

          { t:'table',
            head:['Dictionary form','-(으)시겠어요?'],
            rows:[
              ['가다 — to go','가**시겠어요**?'],
              ['드시다 — to eat (hon.)','드**시겠어요**?'],
              ['기다리다 — to wait','기다리**시겠어요**?'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'커피 한 잔 하실래요?', tip:'Would you like a cup of coffee? — a casual offer' },
            { ch:'손님, 무엇을 드시겠어요?', tip:'Sir/Ma’am, what would you like? — a polite offer (restaurant)' },
            { ch:'내일 이 자리에 다시 오실 거예요?', tip:'Will you come back here tomorrow? — asking about a plan' },
          ]},

          { t:'note', md:'**-(으)실래요? asks their preference; -(으)시겠어요? is a notch more polite than that.** With a senior person you don’t know well, or a customer, -(으)시겠어요? is the safer choice.\n\n할머니, 이거 드**실래요**? (someone you’re close to)\n\n손님, 이거 드**시겠어요**? (someone you’re meeting for the first time)' },

          { t:'cloze', sentence:'손님, 무엇을 [드시겠어요]?', answer:'드시겠어요',
            meaning:'What would you like, sir/ma’am?',
            options:['드실래요','드시겠어요','드세요','드셨어요'],
            keys:['드시겠어요','드실래요','드세요','드셨어요'],
            why:'Offering politely to a customer you’re meeting for the first time calls for -시겠어요. -실래요 is for people you’re closer to.' },

          { t:'cloze', sentence:'할머니, 커피 한 잔 [하실래요]?', answer:'하실래요',
            meaning:'Grandma, would you like a cup of coffee?',
            options:['하세요','하실래요','하시겠어요','하셨어요'],
            keys:['하실래요','하세요','하시겠어요','하셨어요'],
            why:'This is a casual offer to a grandmother you’re close to, so -실래요 is natural.' },

          { t:'type', q:'가다 — “내일 그 모임에 ___?” Write the honorific for asking about a plan.',
            answer:'가실 거예요',
            keys:['가실 거예요','가세요','가셨어요','가십니다'],
            why:'This is asking about a future plan, so -실 거예요 is used.' },

          { t:'choice', q:'What’s the most natural way to offer food to a customer you’re meeting for the first time?',
            options:['뭐 먹을래요?','무엇을 드실래요?','무엇을 드시겠어요?'], answer:2,
            why:'-시겠어요 is the most polite for someone you’re meeting for the first time. 드실래요 is for a somewhat closer relationship.' },

          { t:'order', q:'Put together “손님, 무엇을 드시겠어요?”',
            tokens:['손님,','무엇을','드시겠어요?'], answer:['손님,','무엇을','드시겠어요?'] },

          { t:'speak', say:'차 한 잔 하실래요? 아니면 커피가 더 좋으세요?',
            q:'This is an offer, so read it with a soft, rising tone.' },
        ],
      },

      /* ── 4강 ──────────────────────────────────────────────
         종합. bg-d-03 의 build 방식을 그대로 이어받아 어미까지 함께
         고르게 한다 — 낱말만 바꾸던 것에서 어미까지 바꾸는 것으로 확장. */
      {
        id: 'bg-d-04-04',
        title: { ko:'4강. 종합 실전 — 때와 자리에 맞게 골라 쓰기', en:'4. Putting it together — pick the right form for the moment' },
        minutes: 5,
        blocks: [
          { t:'table', h:'The honorific endings covered so far',
            head:['Situation','Ending','Example'],
            rows:[
              ['Everyday conversation, right now','-(으)세요','할머니께서 집에 가**세요**.'],
              ['Everyday conversation, already happened','-(으)셨어요','할머니께서 어제 가**셨어요**.'],
              ['A formal setting, right now','-(으)십니다','사장님께서 지금 오**십니다**.'],
              ['Offering casually','-(으)실래요?','같이 가**실래요**?'],
              ['Offering politely','-(으)시겠어요?','무엇을 드**시겠어요**?'],
              ['Asking about a plan','-(으)실 거예요?','내일 오**실 거예요**?'],
            ]},

          { t:'text', h:'Three questions decide the ending',
            md:'**① Who is this about?** — If it’s someone senior, -(으)시- goes in.\n\n**② When?** — Right now, keep it as is; already happened, add -셨-.\n\n**③ Where, and how formal?** — Everyday conversation: -어요. A formal setting: -ㅂ니다. Offering or asking: -실래요/-시겠어요/-실 거예요.' },

          { t:'chars', wide:true, items:[
            { ch:'할머니께서 어제 병원에 다녀오셨어요.', tip:'everyday conversation + already happened = -셨어요' },
            { ch:'사장님께서 지금 회의실에 계십니다.', tip:'a formal setting + right now = -십니다' },
            { ch:'이거 좀 드셔 보실래요?', tip:'a casual offer = -실래요' },
          ]},

          { t:'note', md:'**Changing only one part sounds off.** Always check both the word that changes completely (밥→진지, 먹다→드시다) and the ending (-세요/-셨어요/-십니다) together.\n\n할아버지께서 밥을 드**셨어요**. (✕ — the noun wasn’t changed)\n\n할아버지께서 진지를 드**셨어요**. (○)' },

          { t:'cloze', sentence:'사장님께서 지금 사무실에 [계십니다].', answer:'계십니다',
            meaning:'The boss is in the office right now (formal).',
            options:['계세요','계십니다','계셨어요','계실 거예요'],
            keys:['계십니다','계세요','계셨어요','계실 거예요'],
            why:'Assuming a formal setting like news or an announcement, -십니다 is correct.' },

          { t:'cloze', sentence:'할머니, 이거 좀 [드셔 보실래요]?', answer:'드셔 보실래요',
            meaning:'Grandma, would you like to try this?',
            options:['드셔 보세요','드셔 보실래요','드셔 보셨어요','드셔 보십니다'],
            keys:['드셔 보실래요','드셔 보세요','드셔 보셨어요','드셔 보십니다'],
            why:'This is a casual offer, so -실래요 is natural.' },

          { t:'build', q:'Rewrite the basic sentence “어제 밥을 먹었어요” as if it’s about your grandfather, in the past honorific.',
            answers:['할아버지께서 어제 진지를 드셨어요.','할아버지께서 어제 진지를 드셨습니다.'],
            bank:['할아버지께서','어제','진지를','드셨어요','밥을','먹었어요'],
            must:['진지','드셨'],
            hint:'밥 becomes 진지, 먹다 changes completely to 드시다, and since it already happened yesterday, use -셨어요' },

          { t:'build', q:'Rewrite the basic sentence “회의에 가요” as if it’s about the boss, as a formal announcement.',
            answers:['사장님께서 회의에 가십니다.','사장님이 회의에 가십니다.'],
            bank:['사장님께서','사장님이','회의에','가십니다','가요'],
            must:['가십니다'],
            hint:'This is a formal setting like a company announcement, so use -십니다' },

          { t:'choice', q:'Which of these doesn’t fit its situation?',
            options:['뉴스: 대통령께서 오늘 발표를 하십니다.','편의점 손님에게: 이 상품은 품절이세요.','친구 할머니께: 진지 드셨어요?'], answer:1,
            why:'This attaches -시- to a product (an object) — object honorification. “품절입니다” is correct.' },

          { t:'order', q:'Put together “할머니께서 어제 병원에 다녀오셨어요.”',
            tokens:['할머니께서','어제','병원에','다녀오셨어요.'], answer:['할머니께서','어제','병원에','다녀오셨어요.'] },

          { t:'speak', say:'할머니, 어제 병원에 다녀오셨어요? 오늘은 좀 어떠세요?',
            q:'Two honorifics come one after another here — asking about the past, then the present.' },
        ],
      },
    ],
  },

  {
    id: 'bg-d-05',
    emoji: '🙏',
    title: { ko:'초급 세밀: 존댓말 마무리 — 명령·청유·겸양', en:'Beginner detail: finishing the honorifics — commands, suggestions, humility' },
    tagline: { ko:'지시하고 함께 하자 하고, 나를 낮추는 마지막 조각들', en:'Directing, proposing together, and lowering yourself — the last pieces' },
    blurb: { ko:'방송·서비스의 격식 명령 -(으)십시오, 여럿에게 함께 하자는 -(으)십시다, 그리고 드리다·여쭙다·뵙다·모시다처럼 나를 낮춰 상대를 높이는 겸양 표현까지 — 존댓말 시리즈를 마무리합니다.',
           en:'The formal command -(으)십시오 used in announcements and service, the formal suggestion -(으)십시다 for addressing a group, and humble expressions like 드리다, 여쭙다, 뵙다, and 모시다 that lower yourself to honor someone else. This wraps up the honorific series.' },
    level: 'Beginner',
    needs: 'bg-d-04',
    hon: true,
    lessons: [
      /* ── 1강 ──────────────────────────────────────────────
         격식 명령. -(으)세요보다 세다는 것, 그래서 가족에겐 안 쓴다는
         것부터 짚는다 — 규칙만 배우면 아무 데나 갖다 쓰게 된다. */
      {
        id: 'bg-d-05-01',
        title: { ko:'1강. 방송·서비스의 격식 명령 -(으)십시오', en:'1. The formal command in announcements and service: -(으)십시오' },
        minutes: 5,
        blocks: [
          { t:'table', h:'The -(으)십시오 rules at a glance',
            head:['What changes','The rule, with examples'],
            rows:[
              ['Verbs with no batchim','stem + -십시오  (가다→가**십시오**, 오다→오**십시오**)'],
              ['Verbs with a batchim','stem + -으십시오  (앉다→앉**으십시오**, 읽다→읽**으십시오**)'],
              ['Stems ending in ㄹ','ㄹ drops, then + -십시오  (살다→사**십시오**, 만들다→만드**십시오**)'],
              ['Words that already change completely work the same way','드시다→드**십시오**, 계시다→계**십시오**'],
            ]},

          { t:'text', h:'What this expression does',
            md:'**-(으)십시오** is a stronger, more formal **command or instruction** than -(으)세요. It’s common in announcements, signs, and service settings.\n\n이쪽으로 앉으**세요**. (everyday conversation)\n\n이쪽으로 앉**으십시오**. (an announcement, or a service setting)' },

          { t:'table',
            head:['Dictionary form','-(으)십시오'],
            rows:[
              ['가다 — to go','가**십시오**'],
              ['앉다 — to sit','앉**으십시오**'],
              ['기다리다 — to wait','기다리**십시오**'],
              ['드시다 — to eat (hon.)','드**십시오**'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'안전벨트를 착용하십시오.', tip:'Please fasten your seatbelt. — an announcement' },
            { ch:'잠시만 기다리십시오.', tip:'Please wait a moment. — a service setting' },
            { ch:'이쪽으로 들어오십시오.', tip:'Please come in this way.' },
          ]},

          { t:'note', md:'**It’s direct, so it’s rarely used with people you’re close to.** With family or friends, -아/어 주세요 sounds more natural.\n\n엄마, 여기 앉으십시오. (✕ — much too stiff)\n\n엄마, 여기 앉으**세요**. (○)' },

          { t:'cloze', sentence:'안전벨트를 [착용하십시오].', answer:'착용하십시오',
            meaning:'Please fasten your seatbelt.',
            options:['착용하세요','착용하십시오','착용하셨습니다','착용할 거예요'],
            keys:['착용하십시오','착용하세요','착용하셨습니다','착용할 거예요'],
            why:'This is a formal setting like an announcement, so -십시오 is natural.' },

          { t:'cloze', sentence:'잠시만 [기다리십시오].', answer:'기다리십시오',
            meaning:'Please wait a moment.',
            options:['기다리세요','기다리십시오','기다리셨어요','기다릴래요'],
            keys:['기다리십시오','기다리세요','기다리셨어요','기다릴래요'],
            why:'This is a polite request in a service setting, so -십시오 is correct.' },

          { t:'type', q:'앉다 — “이쪽으로 ___.” (write it with -십시오, as in an announcement)',
            answer:'앉으십시오',
            keys:['앉으십시오','앉으세요','앉으셨습니다','앉을 거예요'],
            why:'There’s a batchim ㄴ, so -으십시오 attaches.' },

          { t:'choice', q:'Which sounds more natural for a casual request to family?',
            options:['엄마, 여기 앉으십시오.','엄마, 여기 앉으세요.'], answer:1,
            why:'-십시오 fits settings like announcements or service. -세요 is natural with family.' },

          { t:'order', q:'Put together “잠시만 기다리십시오.”',
            tokens:['잠시만','기다리십시오.'], answer:['잠시만','기다리십시오.'] },

          { t:'speak', say:'승객 여러분, 곧 출발합니다. 안전벨트를 착용하십시오.',
            q:'Read it clearly, the way an announcement sounds.' },
        ],
      },

      /* ── 2강 ──────────────────────────────────────────────
         격식 청유. 문화적으로 조심할 자리라는 것까지 짚는다. */
      {
        id: 'bg-d-05-02',
        title: { ko:'2강. 여럿에게 함께 하자는 -(으)십시다', en:'2. Proposing something to a group: -(으)십시다' },
        minutes: 5,
        blocks: [
          { t:'table', h:'The -(으)십시다 rules at a glance',
            head:['What changes','The rule, with examples'],
            rows:[
              ['Verbs with no batchim','stem + -십시다  (가다→가**십시다**, 시작하다→시작하**십시다**)'],
              ['Verbs with a batchim','stem + -으십시다  (앉다→앉**으십시다**, 찍다→찍**으십시다**)'],
              ['Stems ending in ㄹ','ㄹ drops, then + -십시다  (살다→사**십시다**, 만들다→만드**십시다**)'],
            ]},

          { t:'text', h:'What this expression does',
            md:'**-(으)십시다** is the honorific of “let’s -합시다.” It’s used to formally propose doing something together in front of a group.\n\n같이 가**요**. (among friends)\n\n다 같이 사진을 찍**으십시다**. (a gathering or event)' },

          { t:'table',
            head:['Dictionary form','-(으)십시다'],
            rows:[
              ['시작하다 — to start','시작하**십시다**'],
              ['찍다 — to take (a photo)','찍**으십시다**'],
              ['일어나다 — to stand up','일어나**십시다**'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'이제 회의를 시작하십시다.', tip:'Let’s begin the meeting now. — the meeting’s chair speaking' },
            { ch:'다 같이 사진을 찍으십시다.', tip:'Let’s all take a picture together.' },
            { ch:'모두 자리에서 일어나십시다.', tip:'Let’s all stand up. — an event host speaking' },
          ]},

          { t:'note', md:'**Be careful using this with just one senior person.** -(으)십시다 leads the other person into an action together, so it sounds natural when someone with a role (a host, a chair) says it to a group. For a single senior person, -(으)실까요? is softer.\n\n할머니, 같이 가십시다. (△ — feels like directing someone senior)\n\n할머니, 같이 가**실까요**? (○ — much softer)' },

          { t:'cloze', sentence:'이제 회의를 [시작하십시다].', answer:'시작하십시다',
            meaning:'Let’s begin the meeting now.',
            options:['시작해요','시작하십시다','시작하세요','시작하셨습니다'],
            keys:['시작하십시다','시작해요','시작하세요','시작하셨습니다'],
            why:'The person leading the meeting is formally proposing this to the group, so -십시다 is correct.' },

          { t:'cloze', sentence:'모두 자리에서 [일어나십시다].', answer:'일어나십시다',
            meaning:'Let’s all stand up.',
            options:['일어나요','일어나십시다','일어나세요','일어나셨어요'],
            keys:['일어나십시다','일어나요','일어나세요','일어나셨어요'],
            why:'This is leading a group at an event to do something together, so it’s -십시다.' },

          { t:'type', q:'찍다 — “다 같이 사진을 ___.” Write the honorific for proposing an action.',
            answer:'찍으십시다',
            keys:['찍으십시다','찍어요','찍으세요','찍으셨어요'],
            why:'There’s a batchim ㄱ, so -으십시다 attaches.' },

          { t:'choice', q:'Which is softer when kindly proposing something to a single grandmother?',
            options:['할머니, 같이 가십시다.','할머니, 같이 가실까요?'], answer:1,
            why:'-십시다 feels like leading someone. For one senior person, -(으)실까요? is softer.' },

          { t:'order', q:'Put together “이제 회의를 시작하십시다.”',
            tokens:['이제','회의를','시작하십시다.'], answer:['이제','회의를','시작하십시다.'] },

          { t:'speak', say:'자, 그럼 다 같이 박수를 치십시다!',
            q:'Read it energetically, like an event host.' },
        ],
      },

      /* ── 3강 ──────────────────────────────────────────────
         겸양 — 지금까지와 다른 축. 주체를 높이는 게 아니라 나를 낮춘다.
         드시다류(불규칙 존댓말 어간)와 짝을 지어 구분해 준다. */
      {
        id: 'bg-d-05-03',
        title: { ko:'3강. 나를 낮추는 겸양 — 드리다·여쭙다·뵙다·모시다', en:'3. Humble words that lower yourself — 드리다, 여쭙다, 뵙다, 모시다' },
        minutes: 5,
        blocks: [
          { t:'table', h:'Humble expressions at a glance',
            head:['What changes','Example'],
            rows:[
              ['A word that lowers yourself','저는, 저희 (humble forms of 나, 우리)'],
              ['주다, when giving to someone senior','드리다 — 선물을 드려요'],
              ['묻다, when asking someone senior','여쭙다·여쭈다 — 여쭤볼게요'],
              ['보다, when seeing someone senior','뵙다 — 내일 뵙겠습니다'],
              ['데리고 가다, when accompanying someone senior','모시다 — 할머니를 모시고 가요'],
            ]},

          { t:'text', h:'What this expression does',
            md:'-(으)시-, which you’ve learned so far, honors **the subject of the sentence** (someone senior). Humble expressions do the opposite: they **lower yourself, the speaker**, to indirectly honor the other person.\n\n할머니께서 저에게 선물을 **주세요**. (the subject is 할머니 — subject honorification)\n\n제가 할머니께 선물을 **드려요**. (the subject is “I,” but since the receiver is 할머니, a humble word is used)' },

          { t:'table',
            head:['Plain','Humble','Meaning'],
            rows:[
              ['나','저','I (humble)'],
              ['우리','저희','we (humble)'],
              ['주다','드리다','give (to someone honored)'],
              ['묻다','여쭙다 · 여쭈다','ask (someone honored)'],
              ['보다 · 만나다','뵙다','see/meet (someone honored)'],
              ['데리고 가다','모시다','accompany, take along (someone honored)'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'제가 저희 부모님을 소개해 드릴게요.', tip:'Let me introduce my parents. — both 저희 and 드리다 are humble forms' },
            { ch:'선생님께 여쭤보고 다시 연락드릴게요.', tip:'I’ll ask the teacher and get back to you.' },
            { ch:'내일 오후에 뵙겠습니다.', tip:'I will see you tomorrow afternoon. — a polite greeting' },
            { ch:'할머니를 모시고 병원에 다녀왔어요.', tip:'I took Grandma to the hospital.' },
          ]},

          { t:'note', md:'**They honor different people.** -(으)시- honors the subject of the sentence; humble expressions honor the person on the receiving end (the object) or the listener.\n\n제가 할머니를 모시고 가세요. (✕ — the subject is “I,” but -세요 was attached)\n\n제가 할머니를 모시고 **가요**. (○ — 모시다 is already a humble word, so -시- isn’t added again)' },

          { t:'cloze', sentence:'선생님, 제가 짐을 [들어 드릴게요].', answer:'들어 드릴게요',
            meaning:'Teacher, let me carry your bag for you.',
            options:['들어 줄게요','들어 드릴게요','들어 주세요','들어 드리세요'],
            keys:['들어 드릴게요','들어 줄게요','들어 주세요','들어 드리세요'],
            why:'This is done for someone senior, so 드리다 is used instead of 주다.' },

          { t:'cloze', sentence:'내일 오후 두 시에 [뵙겠습니다].', answer:'뵙겠습니다',
            meaning:'I will see you tomorrow at 2pm.',
            options:['보겠습니다','뵙겠습니다','볼게요','뵈세요'],
            keys:['뵙겠습니다','보겠습니다','볼게요','뵈세요'],
            why:'This means meeting someone senior, so 뵙다 is used instead of 보다.' },

          { t:'type', q:'묻다 (humble) — “잠시 후에 다시 ___.” (use 여쭙다)',
            answer:'여쭤볼게요',
            keys:['여쭤볼게요','물어볼게요','여쭙습니다','물으세요'],
            why:'This is asking someone senior, so 여쭙다 is used.' },

          { t:'choice', q:'Which one uses a humble expression correctly?',
            options:['제가 할머니께 선물을 주세요.','제가 할머니께 선물을 드려요.','할머니께서 저에게 선물을 드려요.'], answer:1,
            why:'I am giving something to someone senior, so 드리다 is correct. The first sentence wrongly attaches -세요 to “I” (the subject); the third has 할머니 giving, which should instead be -세요, not 드리다.' },

          { t:'order', q:'Put together “선생님께 여쭤보고 다시 연락드릴게요.”',
            tokens:['선생님께','여쭤보고','다시','연락드릴게요.'], answer:['선생님께','여쭤보고','다시','연락드릴게요.'] },

          { t:'speak', say:'제가 할머니를 모시고 병원에 다녀오겠습니다.',
            q:'Both 모시다 and -겠습니다 are polite here. Read it clearly.' },
        ],
      },

      /* ── 4강 ──────────────────────────────────────────────
         존댓말 시리즈 전체(bg-d-03~05) 종합. build 로 어미까지 골라
         만들게 한다. */
      {
        id: 'bg-d-05-04',
        title: { ko:'4강. 존댓말 종합 실전', en:'4. Honorifics, put together' },
        minutes: 5,
        blocks: [
          { t:'table', h:'The whole honorific map',
            head:['Situation','Expression','Example'],
            rows:[
              ['Everyday conversation, right now','-(으)세요','가**세요**'],
              ['Everyday conversation, already happened','-(으)셨어요','가**셨어요**'],
              ['A formal setting, right now','-(으)십니다','가**십니다**'],
              ['A formal command or instruction','-(으)십시오','가**십시오**'],
              ['A formal proposal to a group','-(으)십시다','가**십시다**'],
              ['Offering casually','-(으)실래요?','가**실래요**?'],
              ['Offering politely','-(으)시겠어요?','가**시겠어요**?'],
              ['Lowering yourself to honor someone else','humble expressions','드리다·여쭙다·뵙다·모시다'],
            ]},

          { t:'text', h:'Four questions are all you need',
            md:'**① Who is this about?** — If the subject is someone senior, -(으)시- goes in.\n\n**② When?** — Right now, keep it as is; already happened, add -셨-.\n\n**③ How formal is the setting?** — Everyday conversation: -어요. An announcement or service setting: -ㅂ니다/-십시오.\n\n**④ What am I doing for someone senior?** — Giving, asking, or meeting them calls for a humble expression (드리다, 여쭙다, 뵙다).' },

          { t:'chars', wide:true, items:[
            { ch:'할머니, 제가 짐을 들어 드릴게요.', tip:'humble (드리다) — what I’m doing is for Grandma' },
            { ch:'손님 여러분, 곧 문이 닫힙니다. 안전선 밖으로 나와 주십시오.', tip:'a formal instruction (-십시오)' },
            { ch:'자, 다 같이 시작해 보십시다.', tip:'a proposal (-십시다)' },
          ]},

          { t:'note', md:'**Subject honorification and humble expressions can appear in the same sentence.** If the subject is someone senior, use -시-. If I’m doing something for someone senior, use a humble word.\n\n제가 할머니를 모시고 병원에 **가요**. (the humble word 모시다 — I don’t also add -시-)\n\n할머니께서 병원에 **가세요**. (the subject is 할머니 — here it does take -시-)' },

          { t:'cloze', sentence:'할머니, 제가 짐을 [들어 드릴게요].', answer:'들어 드릴게요',
            meaning:'Grandma, let me carry your bag.',
            options:['들어 줄게요','들어 드릴게요','들어 드세요','들어 가세요'],
            keys:['들어 드릴게요','들어 줄게요','들어 드세요','들어 가세요'],
            why:'This is done for someone senior, so 드리다 is used.' },

          { t:'cloze', sentence:'승객 여러분, 안전벨트를 [착용하십시오].', answer:'착용하십시오',
            meaning:'Passengers, please fasten your seatbelts.',
            options:['착용하세요','착용하십시오','착용하셨습니다','착용하실래요'],
            keys:['착용하십시오','착용하세요','착용하셨습니다','착용하실래요'],
            why:'This is a formal setting like an announcement, so -십시오 is correct.' },

          { t:'build', q:'Rewrite the basic sentence “같이 사진 찍어요” as an event host proposing it to the group.',
            answers:['다 같이 사진을 찍으십시다.','같이 사진을 찍으십시다.'],
            bank:['다','같이','사진을','찍으십시다','찍어요'],
            must:['찍으십시다'],
            hint:'This is someone leading an event, so use -으십시다' },

          { t:'build', q:'Rewrite the basic sentence “선생님께 물어볼게요” using a humble expression.',
            answers:['선생님께 여쭤볼게요.','선생님께 여쭈어볼게요.'],
            bank:['선생님께','여쭤볼게요','여쭈어볼게요','물어볼게요'],
            must:['여쭤'],
            hint:'This is asking someone senior, so use 여쭙다 instead of 묻다' },

          { t:'choice', q:'Which one doesn’t fit?',
            options:['할머니를 모시고 병원에 다녀왔어요.','제가 할머니께 선물을 주세요.','선생님께 여쭤보고 다시 연락드릴게요.'], answer:1,
            why:'The subject is “I,” but -세요 was attached. Since this is given to someone senior, “선물을 드려요” is correct.' },

          { t:'order', q:'Put together “할머니, 제가 짐을 들어 드릴게요.”',
            tokens:['할머니,','제가','짐을','들어 드릴게요.'], answer:['할머니,','제가','짐을','들어 드릴게요.'] },

          { t:'speak', say:'제가 할머니를 모시고 병원에 다녀오겠습니다. 조심히 다녀오십시오.',
            q:'A humble word (모시다) and a formal command (-십시오) appear one after another here.' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════
  // 🟡 INTERMEDIATE (중급) — 4강좌 (핵심 요청 -느라고 / -는 바람에 포함!)
  // ════════════════════════════════════════════════
  {
    id: 'im-02-02',
    emoji: '😵',
    title: '중급 02-02: 집중으로 인한 부정결과 (-느라고)',
    tagline: '하느라 다른 게 밀렸을 때만!',
    blurb: '드라마를 보느라 숙제를 못 했어요. 내가 한 행위에 **집중하느라** 다른 일을 놓친 부정적 결과. 주체는 항상 "나".',
    level: 'Intermediate',
    needs: 'bg-d-02',
    lessons: [
      {
        id: 'im-02-02-01',
        title: '1강. -느라고의 3가지 핵심 조건',
        minutes: 4,
        blocks: [
          { t:'text', md:'### 💡 -느라고 핵심 규칙 3가지\n1. **앞뒤 문장 주체가 동일**: 무조건 "내가 A 하느라 내가 B 를 못했다"\n2. **의도적 집중**: 내가 스스로 시간을 쏟은 행위 (공부, 게임, 드라마, 운동...)\n3. **뒷 문장은 무조건 부정적 결과**: "늦었다 / 못했다 / 까먹었다 / 아프다" 등\n✅ 맞는 예: 어제 시험 공부를 하느라 잠을 못 잤어요\n❌ 틀린 예: (갑자기 비가 오느라) — 비는 내 의지가 아니라 돌발상황이므로 바람에!' },

          { t:'cloze', sentence:'어제 시험 공부를 [하느라고] 잠을 한 시간밖에 못 잤어요.', answer:'하느라고',
            meaning:'I was so focused on studying for the exam yesterday that I only slept one hour.',
            options:['하느라고','하는 바람에','하니까','하지만'],
            keys:['하느라고','하는 바람에','하니까','하지만'],
            why:'시험 공부라는 행위에 "내가" 스스로 집중한 결과 잠을 못 자는 부정적 결과 → -느라고.' },

          { t:'cloze', sentence:'밤새도록 게임을 [하느라고] 오늘 학교에 늦었어요.', answer:'하느라고',
            meaning:'I played games all night long so I was late to school today.',
            options:['하느라고','하는 바람에','해서','하거나'],
            keys:['하느라고','하는 바람에','해서','하거나'],
            why:'밤새도록 게임한 것은 내가 스스로 한 의도적 집중. 그래서 늦었다는 부정결과 → -느라고.' },

          { t:'cloze', sentence:'친구랑 카페에서 수다를 [떨느라고] 숙제를 깜빡했어요.', answer:'떨느라고',
            meaning:'I was so busy chatting with my friend at a café that I forgot my homework.',
            options:['떨느라고','떠는 바람에','떨고','떨어서'],
            keys:['떨느라고','떠는 바람에','떨고','떨어서'],
            why:'수다를 떤 건 내가 친구와 함께 시간을 보낸 집중 행위 → 숙제 깜빡한 부정결과 → -느라고.' },

          { t:'speak', say:'드라마를 10시간이나 보느라고 약속 시간에 한 시간이나 늦었어요.', q:'후회하는 톤으로 자연스럽게 말해 보세요.' },
        ],
      },
      {
        id: "im-02-02-02", title: "2강. 꼴 만들기", minutes: 4,
        blocks: [
          {"t":"text","h":"-느라고 형태 결합 규칙","md":"**-느라고**는 동사 어간에 결합하며, **받침 유무에 상관없이** 그대로 붙입니다.\n\n단, **ㄹ 받침**으로 끝나는 동사는 **ㄹ이 탈락**합니다. 이때 떨어지는 것은 **ㄹ 하나뿐**이고 음절이 통째로 사라지지는 않습니다."},
          {"t":"table","head":["사전형","어간","-느라고"],"rows":[["먹다 — to eat","먹","먹**느라고**"],["보다 — to watch","보","보**느라고**"],["살다 — to live (ㄹ 탈락)","살 → 사","사**느라고**"],["만들다 — to make (ㄹ 탈락)","만들 → 만드","만드**느라고**"]]},
          {"t":"note","md":"**ㄹ 이 떨어질 뿐 음절은 남습니다.** 만들다는 어간이 **만들** 이라 ㄹ 만 빠져 **만드** 가 됩니다.\n\n만드느라고 (○)\n만느라고 (✕)\n\n형용사(바쁘다, 아프다)에는 원칙적으로 **-느라고**를 붙이지 않고, 과거형 **-았/었-** 뒤에도 쓰지 않습니다."},
          {"t":"chars","wide":true,"items":[{"ch":"손님을 맞이하느라고 하루 종일 바빴어요.","tip":"I was busy all day receiving guests."},{"ch":"케이크를 만드느라고 앞치마가 더러워졌어요.","tip":"My apron got dirty while making a cake. — 만들다 → 만드느라고"},{"ch":"창가에서 눈을 구경하느라고 국이 다 식었어요.","tip":"The soup went cold while I was watching the snow."}]},
          {"t":"cloze","sentence":"요즘 이사를 [하느라고] 정신이 하나도 없어요.","answer":"하느라고","meaning":"I'm all over the place lately because I'm moving.","options":["하느라고","했느라고","하여느라고","한느라고"],"keys":["하느라고","했느라고","하여느라고","한느라고"],"why":"동사 어간 **하-** 뒤에 시제를 넣지 않고 바로 **-느라고** 를 붙입니다. **했느라고** 처럼 과거를 끼워 넣으면 안 됩니다."},
          {"t":"choice","q":"「만들다」에 -느라고 를 바르게 붙인 것은?","options":["만들느라고","만드느라고","만느라고"],"answer":1,"why":"어간 **만들** 에서 **ㄹ 만** 떨어져 **만드** 가 됩니다. **만느라고** 는 음절을 통째로 날린 꼴이라 없는 말이고, **만들느라고** 는 ㄹ 을 안 떨어뜨린 꼴입니다."},
          {"t":"type","q":"놀다 (to play) — 「어제 늦게까지 ___ 숙제를 다 못 했어요.」 알맞은 꼴로 바꿔 쓰세요.","answer":"노느라고","keys":["노느라고","놀느라고","놀았느라고"],"why":"**놀** 은 한 음절이라 ㄹ 이 떨어지면 **노** 만 남습니다. 그래서 **노느라고** 입니다."},
          {"t":"pair","q":"사전형과 올바른 -느라고 꼴을 짝지어 보세요.","pairs":[["찾다 (받침 있음)","찾느라고"],["쉬다 (받침 없음)","쉬느라고"],["팔다 (ㄹ 받침)","파느라고"],["만들다 (ㄹ 받침·두 음절)","만드느라고"]]},
          {"t":"order","q":"문장을 차례대로 맞춰 보세요.","tokens":["서류를","찾느라고","서랍을","다 뒤졌어요."],"answer":["서류를","찾느라고","서랍을","다 뒤졌어요."]},
          {"t":"speak","say":"밀린 업무를 처리하느라고 퇴근이 늦어졌어요.","q":"지친 느낌을 살려 말해 보세요."},
        ],
      },
      {
        id: "im-02-02-03", title: "3강. 헷갈리는 짝과 가르기", minutes: 5,
        blocks: [
          {"t":"text","h":"-느라고 와 -는 바람에 가르기","md":"둘 다 나쁜 결과에 쓰지만 **원인이 다릅니다.**\n\n* **-느라고** — 내가 스스로 시간과 정신을 쏟은 행위. 주체가 나입니다.\n* **-는 바람에** — 내가 어쩌지 못하는 갑작스러운 일. 주체가 내가 아니어도 됩니다."},
          {"t":"table","head":["구분","-느라고","-는 바람에"],"rows":[["원인","내가 어떤 일에 집중함","뜻밖의 사건이나 바깥 상황"],["주체","앞뒤가 같아야 함 (나)","제한 없음 (비·기계·남)"],["맞는 예","운전**하느라고** 전화를 못 받았어요","비가 오**는 바람에** 옷이 젖었어요"],["안 되는 예","비가 오느라고 (✕)","공부하는 바람에 (어색)"]]},
          {"t":"chars","wide":true,"items":[{"ch":"늦잠을 자느라고 버스를 놓쳤어요.","tip":"I missed the bus because I overslept. — 자는 것은 내 행위"},{"ch":"갑자기 사고가 나는 바람에 길이 막혔어요.","tip":"The road was blocked because an accident happened. — 내 뜻과 무관"}]},
          {"t":"choice","q":"다음 가운데 알맞은 문장은?","options":["바람이 심하게 부느라고 창문이 깨졌어요.","바람이 심하게 부는 바람에 창문이 깨졌어요.","창문이 깨지느라고 바람이 심하게 불었어요."],"answer":1,"why":"바람이 부는 것은 내 의지가 아니라 바깥에서 벌어진 일이라 **-는 바람에** 입니다. 첫째는 주체가 내가 아니라서 안 되고, 셋째는 원인과 결과가 뒤집혔습니다."},
          {"t":"cloze","sentence":"발표 자료를 [준비하느라고] 밤을 꼬박 새웠어요.","answer":"준비하느라고","meaning":"I stayed up all night preparing the presentation.","options":["준비하느라고","준비하는 바람에","준비하니까","준비하지만"],"keys":["준비하느라고","준비하는 바람에","준비하니까","준비하지만"],"why":"자료 준비는 내가 스스로 시간을 쏟은 일이라 **-느라고** 입니다. **-는 바람에** 는 뜻밖의 사건에 쓰므로 여기에는 어색합니다."},
          {"t":"type","q":"지하철이 고장 나다 — 「지하철이 ___ 약속에 늦었어요.」 빈칸을 채우세요.","answer":"고장 나는 바람에","keys":["고장 나는 바람에","고장 나느라고","고장 나서"],"why":"지하철 고장은 내가 한 일이 아니라 갑자기 벌어진 일이라 **-는 바람에** 입니다."},
          {"t":"order","q":"문장을 차례대로 맞춰 보세요.","tokens":["손님 응대를","하느라고","점심을","못 먹었어요."],"answer":["손님 응대를","하느라고","점심을","못 먹었어요."]},
          {"t":"pair","q":"상황에 어울리는 문법을 이어 보세요.","pairs":[["내가 딴 일에 빠져 있었다","-느라고"],["갑자기 비가 내렸다","-는 바람에"],["내가 서류를 들여다보고 있었다","-느라고"],["앞차가 갑자기 멈췄다","-는 바람에"]]},
          {"t":"note","md":"💡 **가르는 한 가지 물음** — 「그 일을 한 사람이 나인가?」\n\n비가 오다, 지하철이 늦다, 컴퓨터가 꺼지다처럼 **주어가 내가 아닌 일**에는 **-느라고** 를 쓸 수 없습니다."},
          {"t":"speak","say":"영화에 집중하느라고 찌개가 타는 줄도 몰랐어요.","q":"아쉬운 표정을 지으며 또박또박 말해 보세요."},
        ],
      },
      {
        id: "im-02-02-04", title: "4강. 실제 상황에서 쓰기", minutes: 5,
        blocks: [
          {"t":"text","h":"늦었을 때 사정을 말하기","md":"회사나 집에서 **늦었거나 못 끝냈을 때**, 무엇에 매달려 있었는지를 -느라고 로 말합니다.\n\n변명처럼 들리지 않으려면 뒤에 **미안한 마음**을 같이 붙이는 것이 좋습니다."},
          {"t":"chars","wide":true,"items":[{"ch":"죄송합니다. 보고서를 쓰느라고 메일을 이제야 봤습니다.","tip":"Sorry — I was writing a report, so I only just saw your email. — 회사"},{"ch":"아기 밥을 챙겨 주느라고 전화를 못 받았어요.","tip":"I was feeding the baby, so I missed your call. — 집"},{"ch":"짐을 나르느라고 답장이 늦었어요.","tip":"I was carrying boxes, so I replied late. — 이사"}]},
          {"t":"cloze","sentence":"거래처와 통화를 [하느라고] 회의에 조금 늦었습니다.","answer":"하느라고","meaning":"I was on a call with a client, so I was a little late to the meeting.","options":["하느라고","하는 바람에","하니까","하자마자"],"keys":["하느라고","하는 바람에","하니까","하자마자"],"why":"통화는 내가 붙들고 있던 일이라 **-느라고** 입니다. **-하니까** 는 이유를 대되 미안한 마음이 안 실리고, **-하자마자** 는 곧바로 이어진 일에 씁니다."},
          {"t":"choice","q":"가게에서 손님이 「주문한 음식 언제 나와요?」라고 물었습니다. 알맞은 대답은?","options":["주문이 밀리느라고 음식이 늦어졌습니다.","앞 주문을 처리하느라고 조금 늦어졌습니다. 죄송합니다.","비가 오는 바람에 음식을 만드느라고 늦었습니다."],"answer":1,"why":"앞 주문을 처리한 것은 **내가 한 일**이고 앞뒤 주체가 같아 알맞습니다. **주문이 밀리다** 는 내 행위가 아니라 -느라고 와 안 맞고, 셋째는 비와 요리가 이어지지 않습니다."},
          {"t":"type","q":"집안일을 하다 (to do housework) — 「___ 연락을 못 했어요.」 빈칸을 채우세요.","answer":"집안일을 하느라고","keys":["집안일을 하느라고","집안일 하느라고","집안일을 했느라고"],"why":"집안일에 시간을 쏟은 것이 원인이라 **집안일을 하느라고** 입니다. **했느라고** 처럼 과거를 끼워 넣지 않습니다."},
          {"t":"order","q":"상사에게 늦은 사정을 말하는 문장을 만들어 보세요.","tokens":["자료를","검토하느라고","보고가","늦어졌습니다."],"answer":["자료를","검토하느라고","보고가","늦어졌습니다."]},
          {"t":"pair","q":"상황과 어울리는 말을 짝지어 보세요.","pairs":[["약속에 늦었을 때","옷을 골라 입느라고 늦었어요."],["연락을 못 받았을 때","운전을 하느라고 전화를 못 봤어요."],["기한을 넘겼을 때","다른 일을 처리하느라고 늦어졌어요."]]},
          {"t":"note","md":"**-느라고** 뒤에는 주로 **못 했다 · 늦었다 · 깜빡했다 · 바빴다** 처럼 미안함이 담긴 결과가 옵니다.\n\n반대로 좋은 결과에는 안 씁니다. 「공부하느라고 시험을 잘 봤어요」는 어색하고, 이때는 「공부해서 시험을 잘 봤어요」 입니다."},
          {"t":"speak","say":"죄송합니다. 다른 업무를 처리하느라고 메일 확인이 늦었습니다.","q":"직장에서 정중하게 사과하는 톤으로 말해 보세요."},
        ],
      },
    ],
  },

  {
    id: 'im-02-03',
    emoji: '🌧️',
    title: '중급 02-03: 돌발 상황 부정결과 (-는 바람에)',
    tagline: '예상치 못한 일이 터졌을 때!',
    blurb: '갑자기 비가 오는 바람에 옷이 젖었어요. 내 의지와 상관없는 **예상 밖 돌발사건**으로 생긴 부정적 결과에만 씁니다.',
    level: 'Intermediate',
    needs: 'im-02-02',
    lessons: [
      {
        id: 'im-02-03-01',
        title: '1강. -는 바람에 vs -느라고 100% 구분법',
        minutes: 4,
        blocks: [
          { t:'text', md:'### 💡 -는 바람에 핵심 + 느라고와 비교\n| 구분 | -느라고 | -는 바람에 |\n|---|---|---|\n| 원인 | **내가 스스로 한 의도적 행위** | **내 뜻과 상관없는 돌발사건** (날씨·사고·기계오류·남의 행동) |\n| 주체 | 앞뒤 주체가 같아야 함 | 앞뒤 주체가 **달라도 됨** |\n| 공통 | 둘 다 뒷 문장은 **무조건 부정적 결과** |\n✅ 비가 오느라고 ❌ (비는 내 행위 아님) → 비가 오**는 바람에** ✅\n✅ 시험공부 하는 바람에 ❌ (시험공부는 내 행위) → 시험공부 **하느라고** ✅' },

          { t:'cloze', sentence:'갑자기 비가 [오는 바람에] 옷이 다 젖었어요.', answer:'오는 바람에',
            meaning:'It suddenly started raining, unexpectedly, and all my clothes got wet.',
            options:['오는 바람에','오느라고','오기 때문에','오거든'],
            keys:['오는 바람에','오느라고','오기 때문에','오거든'],
            why:'비가 오는 것은 내 의지와 상관없는 예상 밖 돌발 상황 → -는 바람에.' },

          { t:'cloze', sentence:'지하철이 [고장 나는 바람에] 회의에 20분 늦었어요.', answer:'고장 나는 바람에',
            meaning:'The subway broke down completely out of the blue, and I was 20 min late.',
            options:['고장 나는 바람에','고장 나서','고장 났는데','고장 나니까'],
            keys:['고장 나는 바람에','고장 나서','고장 났는데','고장 나니까'],
            why:'넷 다 문법적으로 들어갈 수 있지만, **고장 나는 바람에** 는 예상 밖 사고 때문에 생긴 **부정적 결과**를 가장 또렷하게 드러냅니다. 회의 지각처럼 억울한 결과와 잘 붙어요.' },

          { t:'cloze', sentence:'동생이 갑자기 내 노트북을 [떨어뜨리는 바람에] 파일이 다 날아갔어요.', answer:'떨어뜨리는 바람에',
            meaning:'My little sibling suddenly dropped my laptop, and all my files were lost.',
            options:['떨어뜨리는 바람에','떨어뜨리느라고','떨어뜨리고','떨어뜨리니까'],
            keys:['떨어뜨리는 바람에','떨어뜨리느라고','떨어뜨리고','떨어뜨리니까'],
            why:'동생의 행동은 내가 의도한 게 아니라 예상치 못한 남의 행동 → -는 바람에.' },

          { t:'cloze', sentence:'컴퓨터가 [꺼지는 바람에] 저장 안 한 문서가 다 사라졌어요.', answer:'꺼지는 바람에',
            meaning:'The computer turned off out of nowhere and all my unsaved docs vanished.',
            options:['꺼지는 바람에','꺼져서','꺼졌는데','꺼지니까'],
            keys:['꺼지는 바람에','꺼져서','꺼졌는데','꺼지니까'],
            why:'기계가 갑자기 꺼진 것은 내가 의도한 일이 아닌 **돌발 사고**입니다. 그 사고 때문에 문서가 날아가는 억울한 결과가 이어져 -는 바람에 가 가장 자연스럽습니다.' },

          { t:'speak', say:'어제 급하게 뛰어가다가 넘어지는 바람에 바지가 찢어졌어요.', q:'어이없다는 톤으로 말해보세요!' },
        ],
      },
      {
        id: "im-02-03-02", title: "2강. 꼴 만들기", minutes: 4,
        blocks: [
          {"t":"text","h":"-는 바람에 형태 결합 규칙","md":"**-는 바람에**는 동사 어간 뒤에 붙으며, **받침 유무와 상관없이** 언제나 **-는 바람에** 를 씁니다.\n\n단, **ㄹ 받침** 동사는 **ㄹ이 탈락**합니다. 이때도 떨어지는 것은 **ㄹ 하나뿐** 이라 음절은 남습니다."},
          {"t":"table","head":["사전형","어간","-는 바람에"],"rows":[["오다 — to come","오","오**는 바람에**"],["늦다 — to be late","늦","늦**는 바람에**"],["밀리다 — to be delayed","밀리","밀리**는 바람에**"],["불다 — to blow (ㄹ 탈락)","불 → 부","부**는 바람에**"],["만들다 — to make (ㄹ 탈락)","만들 → 만드","만드**는 바람에**"]]},
          {"t":"note","md":"**과거형 -았/었- 뒤에는 쓰지 않습니다.** 이미 지난 일이라도 어간에 **-는 바람에** 를 바로 붙입니다.\n\n비가 오**는 바람에** 젖었어요 (○)\n비가 왔**는 바람에** 젖었어요 (✕)\n\n그리고 **동사에만** 붙습니다. 아프다·바쁘다 같은 형용사에는 쓰지 않고, 그때는 **-아/어서** 를 씁니다."},
          {"t":"chars","wide":true,"items":[{"ch":"갑자기 손님이 오는 바람에 저녁을 늦게 먹었어요.","tip":"Guests came without warning, so I ate dinner late."},{"ch":"바람이 세게 부는 바람에 간판이 떨어졌어요.","tip":"The sign fell because the wind blew hard. — 불다 → 부는 바람에"},{"ch":"동생이 문을 세게 닫는 바람에 아기가 깼어요.","tip":"My brother slammed the door, so the baby woke up."}]},
          {"t":"cloze","sentence":"컵을 [떨어뜨리는 바람에] 바닥이 온통 물바다가 됐어요.","answer":"떨어뜨리는 바람에","meaning":"I dropped the cup, so the floor was flooded.","options":["떨어뜨리는 바람에","떨어뜨렸는 바람에","떨어뜨린 바람에","떨어뜨리던 바람에"],"keys":["떨어뜨리는 바람에","떨어뜨렸는 바람에","떨어뜨린 바람에","떨어뜨리던 바람에"],"why":"이미 지난 일이라도 과거 어미를 넣지 않고 어간 **떨어뜨리-** 에 **-는 바람에** 를 바로 붙입니다. **떨어뜨렸는 바람에** 는 없는 꼴입니다."},
          {"t":"choice","q":"「불다」(to blow)에 -는 바람에 를 바르게 붙인 것은?","options":["불는 바람에","부는 바람에","불었는 바람에"],"answer":1,"why":"어간 **불-** 에서 ㄹ 이 떨어져 **부-** 가 되므로 **부는 바람에** 입니다. **불는 바람에** 는 ㄹ 을 안 떨어뜨린 꼴이고, **불었는 바람에** 는 과거를 끼워 넣은 꼴이라 둘 다 안 됩니다."},
          {"t":"type","q":"놓치다 (to miss) — 「버스를 ___ 약속 시간에 늦었어요.」 알맞은 꼴로 쓰세요.","answer":"놓치는 바람에","keys":["놓치는 바람에","놓쳤는 바람에","놓치느라고"],"why":"어간 **놓치-** 에 **-는 바람에** 를 그대로 붙입니다. 버스를 놓친 것은 내가 노린 일이 아니라 **-느라고** 와는 맞지 않습니다."},
          {"t":"pair","q":"사전형과 올바른 -는 바람에 꼴을 짝지어 보세요.","pairs":[["쏟다 (받침 있음)","쏟는 바람에"],["넘어지다 (받침 없음)","넘어지는 바람에"],["만들다 (ㄹ 받침·두 음절)","만드는 바람에"],["열다 (ㄹ 받침·한 음절)","여는 바람에"]]},
          {"t":"order","q":"문장을 차례대로 맞춰 보세요.","tokens":["전화가","끊어지는 바람에","내용을","못 들었어요."],"answer":["전화가","끊어지는 바람에","내용을","못 들었어요."]},
          {"t":"speak","say":"바람이 세게 부는 바람에 우산이 뒤집혔어요.","q":"황당했던 그때를 떠올리며 말해 보세요."},
        ],
      },
      {
        id: "im-02-03-03", title: "3강. 헷갈리는 짝과 가르기", minutes: 5,
        blocks: [
          {"t":"text","h":"-는 바람에 와 -아/어서 가르기","md":"둘 다 원인과 결과를 잇지만 쓰임이 다릅니다.\n\n* **-는 바람에** — 뜻밖의 돌발 상황. 뒤에는 **나쁜 결과만** 옵니다.\n* **-아/어서** — 흔한 이유. 뒤에 좋은 일도 나쁜 일도 옵니다."},
          {"t":"table","head":["구분","-는 바람에","-아/어서"],"rows":[["상황","갑작스럽고 뜻밖의 일","여느 이유, 자연스러운 차례"],["결과","**나쁜 결과만** (손해·차질)","좋은 것·나쁜 것 다 됨"],["맞는 예","비가 오**는 바람에** 행사가 취소됐어요","비가 와**서** 우산을 썼어요"],["안 되는 예","친구를 만나는 바람에 기분이 좋았어요 (✕)","친구를 만나서 기분이 좋았어요 (○)"]]},
          {"t":"chars","wide":true,"items":[{"ch":"오랜만에 친구를 만나서 기분이 참 좋았어요.","tip":"I felt great seeing an old friend. — 좋은 결과라 -아/어서"},{"ch":"길이 막히는 바람에 비행기를 놓쳤어요.","tip":"Traffic was backed up, so I missed my flight. — 뜻밖의 차질이라 -는 바람에"}]},
          {"t":"choice","q":"다음 가운데 어색한 문장은?","options":["선물을 받는 바람에 기분이 정말 좋았어요.","갑자기 정전이 되는 바람에 일을 못 했어요.","날씨가 너무 추워서 외투를 입었어요."],"answer":0,"why":"**기분이 좋았다** 는 좋은 결과라 **-는 바람에** 와 안 어울립니다. 이때는 **선물을 받아서 기분이 좋았어요** 입니다."},
          {"t":"cloze","sentence":"알람이 안 [울리는 바람에] 아침부터 허둥지둥했어요.","answer":"울리는 바람에","meaning":"The alarm didn't go off, so I was in a rush all morning.","options":["울리는 바람에","울리느라고","울리지만","울리더니"],"keys":["울리는 바람에","울리느라고","울리지만","울리더니"],"why":"알람이 안 울린 것은 내가 한 일이 아니라 기계가 벌인 일이고, 뒤에 허둥댔다는 나쁜 결과가 옵니다. **울리느라고** 는 내가 집중한 일에 쓰므로 알람에는 못 씁니다."},
          {"t":"type","q":"지갑을 잃어버리다 — 「지갑을 ___ 카드를 다 정지시켰어요.」 빈칸을 채우세요.","answer":"잃어버리는 바람에","keys":["잃어버리는 바람에","잃어버려서","잃어버리느라고"],"why":"지갑을 잃은 것은 뜻밖의 일이고 카드를 정지시킨 것은 그 때문에 생긴 번거로운 일이라 **잃어버리는 바람에** 가 어울립니다."},
          {"t":"order","q":"문장을 차례대로 맞춰 보세요.","tokens":["택시가","안 잡히는 바람에","걸어서","왔어요."],"answer":["택시가","안 잡히는 바람에","걸어서","왔어요."]},
          {"t":"pair","q":"결과의 성격에 맞는 이음말을 짝지어 보세요.","pairs":[["갑작스러운 사고로 일이 꼬였다","-는 바람에"],["좋은 일이 생겼다","-아/어서"],["내가 딴 일에 매달려 시간이 갔다","-느라고"]]},
          {"t":"note","md":"💡 **뒤에 시키는 말이 못 옵니다.** -는 바람에 는 이미 벌어진 일을 전하는 말이라, 뒤에 **-세요**(명령)나 **-읍시다**(권유)를 붙이지 못합니다.\n\n비가 오는 바람에 우산을 쓰세요 (✕)\n비가 오니까 우산을 쓰세요 (○)"},
          {"t":"speak","say":"갑자기 서류가 사라지는 바람에 한참을 찾았어요.","q":"당황했던 마음을 나타내며 말해 보세요."},
        ],
      },
      {
        id: "im-02-03-04", title: "4강. 실제 상황에서 쓰기", minutes: 5,
        blocks: [
          {"t":"text","h":"어쩔 수 없었다고 말하기","md":"약속에 늦거나 일을 못 끝냈을 때, **내가 일부러 그런 것이 아니라 어쩔 수 없는 일이 벌어졌다** 는 것을 -는 바람에 로 밝힙니다.\n\n그래서 사과와 같이 쓰면 변명이 아니라 사정 설명으로 들립니다."},
          {"t":"chars","wide":true,"items":[{"ch":"신호등이 고장 나는 바람에 길이 온통 뒤엉켰어요.","tip":"The traffic lights broke down and the road was a mess."},{"ch":"아이가 우유를 쏟는 바람에 식탁을 다시 닦았어요.","tip":"My child spilled the milk, so I wiped the table again. — 집"},{"ch":"인쇄기가 종이를 씹는 바람에 자료가 한 부 모자랐어요.","tip":"The printer jammed, so we were one copy short. — 회사"}]},
          {"t":"cloze","sentence":"갑자기 엘리베이터가 [멈추는 바람에] 안에 갇혀서 늦었습니다.","answer":"멈추는 바람에","meaning":"The elevator suddenly stopped and I was stuck inside, so I was late.","options":["멈추는 바람에","멈추느라고","멈추니까","멈추면서"],"keys":["멈추는 바람에","멈추느라고","멈추니까","멈추면서"],"why":"엘리베이터가 멈춘 것은 뜻밖의 일이고 갇혀서 늦었다는 나쁜 결과가 이어집니다. **멈추느라고** 는 내가 한 일에 쓰므로 기계에는 못 씁니다."},
          {"t":"cloze","sentence":"앞사람이 갑자기 [서는 바람에] 하마터면 부딪칠 뻔했어요.","answer":"서는 바람에","meaning":"The person in front stopped suddenly and I almost bumped into them.","options":["서는 바람에","섰는 바람에","서느라고","선 바람에"],"keys":["서는 바람에","섰는 바람에","서느라고","선 바람에"],"why":"어간 **서-** 에 **-는 바람에** 를 바로 붙입니다. 지난 일이라고 **섰는 바람에** 로 쓰지 않습니다."},
          {"t":"choice","q":"식당에서 옆 자리 손님이 음료를 쏟아 옷에 튀었습니다. 점원이 할 말로 알맞은 것은?","options":["손님이 치는 바람에 접시가 깨졌으니 돈을 더 내세요.","옆 자리에서 음료를 엎지르는 바람에 옷에 튀셨죠? 정말 죄송합니다.","바람이 세게 부느라고 음식이 늦게 나왔습니다."],"answer":1,"why":"남이 벌인 뜻밖의 일로 손님이 피해를 본 상황이라 **-는 바람에** 가 맞습니다. 첫째는 뒤에 **내세요** 라는 시키는 말이 와서 안 되고, 셋째는 바람 부는 것에 **-느라고** 를 써서 틀렸습니다."},
          {"t":"type","q":"빙판길에서 미끄러지다 — 「___ 다리를 다쳤어요.」 문장을 채우세요.","answer":"빙판길에서 미끄러지는 바람에","keys":["빙판길에서 미끄러지는 바람에","미끄러지는 바람에"],"why":"빙판에서 미끄러진 것은 갑작스러운 사고이고 다쳤다는 나쁜 결과가 따라오므로 **-는 바람에** 입니다."},
          {"t":"order","q":"상사에게 늦은 사정을 말하는 문장을 만들어 보세요.","tokens":["버스 사고가","나는 바람에","출근이","늦었습니다."],"answer":["버스 사고가","나는 바람에","출근이","늦었습니다."]},
          {"t":"pair","q":"뜻밖의 일과 그 결과를 이어 보세요.","pairs":[["인터넷이 끊어지는 바람에","결제를 못 끝냈어요."],["갑자기 소나기가 내리는 바람에","우비를 급하게 샀어요."],["카드를 집에 두고 나오는 바람에","현금으로 계산했어요."]]},
          {"t":"note","md":"일상 대화에서 **-는 바람에** 를 쓰면 **일부러 그런 것이 아니라 어쩔 수 없었다** 는 뜻이 함께 전해집니다.\n\n다만 자꾸 쓰면 남 탓으로 들릴 수 있으니, 사과와 같이 쓰는 것이 좋습니다."},
          {"t":"speak","say":"갑자기 인쇄기가 고장 나는 바람에 회의 자료를 못 뽑았습니다.","q":"곤란한 상황을 설명하듯 정중히 말해 보세요."},
        ],
      },
    ],
  },

  {
    id: 'im-03-01',
    emoji: '🤔',
    title: '중급 03-01: 추측의 단계 (-ㄹ 것 같다 / -나 보다 / -겠군요)',
    tagline: '약한 추측 → 관찰 추측 → 강한 확신 추측',
    blurb: '비 올 것 같아요 (50%) / 비가 오나 봐요 (70% · 창문 보고) / 비가 오겠군요 (95% · 소리 들림). 단계별 뉘앙스 차이를 Cloze로 완벽 구분!',
    level: 'Intermediate',
    needs: 'im-02-03',
    lessons: [
      {
        id: 'im-03-01-01',
        title: '1강. 추측 강도 3단계 맵',
        minutes: 4,
        blocks: [
          { t:'text', md:'### 💡 추측 강도 레벨 업\n1. **Level 1. -ㄹ/을 것 같다 (50~60%)** — 단순 내 생각 "그럴 것 같은데?" 아무 근거 없이 막연하게 추측\n2. **Level 2. -나 보다 / -는가 보다 (70~80%)** — **눈으로 본 것/직접 관찰**한 근거가 있는 추측. "밖을 보니 우산 쓰는 사람 많네? 비가 오나 보다"\n3. **Level 3. -겠군요 / -겠네요 (90~95%)** — 소리·냄새·상황 종합적으로 **거의 확신**하는 추측. "비 소리가 들려! 비가 오겠군요"' },

          { t:'cloze', sentence:'내일 날씨가 [좋을 것 같아요]. — 그럼 등산 가자!', answer:'좋을 것 같아요',
            meaning:'I think the weather will be nice tomorrow. — Then let\'s go hiking!',
            options:['좋을 것 같아요','좋나 보네요','좋겠군요','좋고 싶어요'],
            keys:['좋을 것 같아요','좋나 보네요','좋겠군요','좋고 싶어요'],
            why:'내일은 미래라 아직 관찰한 근거가 없음. 단순 기상 예보 생각하는 막연 추측 → Level 1.' },

          { t:'cloze', sentence:'밖에 사람들이 전부 우산을 써. 비가 [오나 봐요].', answer:'오나 봐요',
            meaning:'Everyone outside has umbrellas up. I guess it must be raining.',
            options:['오나 봐요','올 것 같아요','오겠군요','올래요'],
            keys:['오나 봐요','올 것 같아요','오겠군요','올래요'],
            why:'사람들이 우산 쓴 것을 **눈으로 직접 보고** 내린 추측 → Level 2 관찰 추측 -나 보다.' },

          { t:'cloze', sentence:'창문 두드리는 소리가 나! 비가 [오겠군요].', answer:'오겠군요',
            meaning:'I hear tapping on the window! It must definitely be raining out there.',
            options:['오겠군요','올 것 같아요','오나 봐요','오래요'],
            keys:['오겠군요','올 것 같아요','오나 봐요','오래요'],
            why:'비 소리라는 **명확한 청각적 증거**로 거의 100% 확신하는 추측 → Level 3 -겠군요.' },

          { t:'speak', say:'저 사람이 주머니를 계속 만지는 걸 보니까 핸드폰을 잃어버렸나 봐요.', q:'관찰 추측은 "어? 저 사람 보니까~" 하는 수근거리는 톤으로.' },
        ],
      },
      {
        id: "im-03-01-02", title: "2강. 꼴 만들기", minutes: 4,
        blocks: [
          {"t":"text","h":"추측 표현의 결합 규칙","md":"세 표현은 **품사**와 **받침**에 따라 붙는 모양이 다릅니다.\n\n* **-(으)ㄹ 것 같다** — 받침이 없으면 **-ㄹ**, 있으면 **-을**\n* **-나 보다 / -(으)ㄴ가 보다** — 동사는 **-나 보다**, 형용사는 **-(으)ㄴ가 보다**\n* **-겠군요** — 품사를 가리지 않고 어간에 그대로"},
          {"t":"table","head":["사전형","-(으)ㄹ 것 같아요","-나 봐요 / -(으)ㄴ가 봐요","-겠군요"],"rows":[["오다 — to come (동사)","올 것 같아요","오**나 봐요**","오**겠군요**"],["먹다 — to eat (동사)","먹**을 것 같아요**","먹**나 봐요**","먹**겠군요**"],["바쁘다 — to be busy (형용사)","바쁠 것 같아요","바쁜**가 봐요**","바쁘**겠군요**"],["적다 — to be few (형용사)","적**을 것 같아요**","적은**가 봐요**","적**겠군요**"]]},
          {"t":"note","md":"**-나 보다 와 -(으)ㄴ가 보다 가 품사로 갈립니다.**\n\n동사는 **-나 봐요** — 먹다 → 먹나 봐요, 오다 → 오나 봐요\n형용사는 **-(으)ㄴ가 봐요** — 바쁘다 → 바쁜가 봐요, 적다 → 적은가 봐요\n\n다만 **있다·없다** 는 형용사처럼 보여도 **-나 봐요** 를 씁니다 — 없나 봐요 (○), 없은가 봐요 (✕).\n\n**-겠군요** 는 품사를 가리지 않고 어간에 바로 붙습니다."},
          {"t":"chars","wide":true,"items":[{"ch":"손님이 많이 올 것 같아요.","tip":"I think a lot of guests will come. — 근거 없는 짐작"},{"ch":"식당에 줄이 긴 걸 보니 맛있는가 봐요.","tip":"Judging by the long line, the food must be good. — 형용사 → -(으)ㄴ가 봐요"},{"ch":"하루 종일 걸으셨으니 다리가 아프겠군요.","tip":"You walked all day, so your legs must ache. — 듣고 공감"}]},
          {"t":"cloze","sentence":"길이 많이 [막힐 것 같아요]. 조금 서두릅시다.","answer":"막힐 것 같아요","meaning":"I think the roads will be jammed. Let us hurry a little.","options":["막힐 것 같아요","막히나 봐요","막히겠군요","막히고 싶어요"],"keys":["막힐 것 같아요","막히나 봐요","막히겠군요","막히고 싶어요"],"why":"아직 나가 보지 않고 막연히 짐작하는 자리라 **-(으)ㄹ 것 같다** 입니다. **막히나 봐요** 는 눈으로 보고 말할 때 씁니다."},
          {"t":"choice","q":"형용사 「바쁘다」에 관찰 추측을 바르게 붙인 것은?","options":["바쁘나 봐요","바쁜가 봐요","바쁘을 것 같아요"],"answer":1,"why":"형용사 뒤에는 **-(으)ㄴ가 봐요** 가 붙어 **바쁜가 봐요** 입니다. **바쁘나 봐요** 는 동사에 쓰는 꼴이고, **바쁘을** 은 받침이 없는데 **-을** 을 붙인 없는 꼴입니다."},
          {"t":"type","q":"힘들다 (to be hard) — 「오늘 하루 종일 일했으니 정말 ___ .」 거의 확신하는 추측으로 쓰세요.","answer":"힘들겠군요","keys":["힘들겠군요","힘든가 봐요","힘들 것 같아요"],"why":"하루 종일 일했다는 사정을 듣고 거의 틀림없다고 여길 때는 **-겠군요** 입니다. 어간 **힘들-** 에 그대로 붙습니다."},
          {"t":"pair","q":"사전형과 올바른 -나 봐요 / -(으)ㄴ가 봐요 꼴을 짝지어 보세요.","pairs":[["읽다 (동사)","읽나 봐요"],["춥다 (ㅂ 불규칙 형용사)","추운가 봐요"],["없다 (있다·없다)","없나 봐요"],["작다 (형용사)","작은가 봐요"]]},
          {"t":"order","q":"문장을 차례대로 맞춰 보세요.","tokens":["날씨가","많이","추울 것 같아요."],"answer":["날씨가","많이","추울 것 같아요."]},
          {"t":"speak","say":"불이 꺼져 있는 걸 보니 벌써 퇴근했나 봐요.","q":"눈으로 본 것을 두고 조심스레 말하듯 낮은 톤으로 말해 보세요."},
        ],
      },
      {
        id: "im-03-01-03", title: "3강. 헷갈리는 짝과 가르기", minutes: 5,
        blocks: [
          {"t":"text","h":"-나 보다 와 -겠군요 가르기","md":"둘 다 근거가 있는 추측이지만 **근거가 어디서 왔는지**가 다릅니다.\n\n* **-나 보다** — 눈으로 본 것만 놓고 미루어 짐작. 확신은 중간쯤.\n* **-겠군요** — 사정을 듣고 앞뒤를 맞춰 거의 틀림없다고 여김. 공감이 함께 실립니다."},
          {"t":"table","head":["구분","-나 보다","-겠군요"],"rows":[["근거","눈에 보이는 것 하나","들은 사정과 앞뒤 상황"],["확신","그래 보인다 정도","틀림없다"],["보기","불이 켜진 걸 보니 **있나 봐요**","밤을 새우셨다니 **피곤하시겠군요**"],["말맛","혼잣말처럼 짐작","상대의 사정에 맞장구"]]},
          {"t":"chars","wide":true,"items":[{"ch":"저기 사람들이 모여 있는 걸 보니 무슨 일이 생겼나 봐요.","tip":"Seeing the crowd, something must have happened. — 눈으로 본 근거"},{"ch":"어제 밤새워 일하셨다고요? 정말 피곤하시겠군요!","tip":"You worked all night? You must be exhausted. — 듣고 공감"}]},
          {"t":"choice","q":"동료가 「오늘 아침부터 한 끼도 못 먹었어요」라고 합니다. 사정을 듣고 공감하는 말로 알맞은 것은?","options":["정말 배가 고플 것 같아요.","정말 배가 고픈가 봐요.","정말 배가 고프겠군요!"],"answer":2,"why":"사정을 직접 듣고 거의 틀림없다고 여기며 맞장구칠 때는 **-겠군요** 입니다. **고플 것 같아요** 는 근거 없이 짐작하는 말이고, **고픈가 봐요** 는 눈으로 보고 미루어 짐작하는 말이라 이미 들은 자리에는 약합니다."},
          {"t":"cloze","sentence":"가방을 들고 서 있는 걸 보니 지금 [나가나 봐요].","answer":"나가나 봐요","meaning":"With a bag in hand, they must be heading out now.","options":["나가나 봐요","나가겠군요","나갈 것 같아요","나가고 싶어요"],"keys":["나가나 봐요","나가겠군요","나갈 것 같아요","나가고 싶어요"],"why":"가방을 들고 선 모습을 **눈으로 보고** 미루어 짐작하는 자리라 **-나 봐요** 입니다."},
          {"t":"type","q":"기쁘다 — 「원하던 회사에 합격했다니 정말 ___ !」 사정을 듣고 깊이 공감하는 꼴로 쓰세요.","answer":"기쁘겠군요","keys":["기쁘겠군요","기쁜가 봐요","기쁠 것 같아요"],"why":"합격 소식을 듣고 그 마음을 헤아려 맞장구치는 자리라 **-겠군요** 입니다."},
          {"t":"order","q":"문장을 차례대로 맞춰 보세요.","tokens":["밖에서","환호성이","들리는 걸 보니","골을 넣었나 봐요."],"answer":["밖에서","환호성이","들리는 걸 보니","골을 넣었나 봐요."]},
          {"t":"pair","q":"자리에 맞는 추측 표현을 짝지어 보세요.","pairs":[["아무 근거 없이 앞일을 짐작할 때","-(으)ㄹ 것 같다"],["눈앞의 모습을 보고 미루어 말할 때","-나 보다"],["사정을 듣고 확실하게 공감할 때","-겠군요"]]},
          {"t":"note","md":"💡 **한 가지 물음으로 가릅니다** — 「무엇을 근거로 삼았나?」\n\n눈으로 본 것 하나면 **-나 봐요**, 사정을 듣고 앞뒤를 맞췄으면 **-겠군요**, 아무 근거가 없으면 **-(으)ㄹ 것 같아요** 입니다."},
          {"t":"speak","say":"주말에도 나와서 일하셨다니 많이 지치셨겠군요.","q":"상대의 수고를 헤아리며 정중히 말해 보세요."},
        ],
      },
      {
        id: "im-03-01-04", title: "4강. 실제 상황에서 쓰기", minutes: 5,
        blocks: [
          {"t":"text","h":"짐작하고 맞장구치기","md":"회사·가게·집에서 눈에 보이는 것을 두고 짐작하거나, 상대의 이야기를 듣고 맞장구칩니다.\n\n**근거가 무엇이냐**에 따라 어미를 고르면 말이 자연스러워집니다."},
          {"t":"chars","wide":true,"items":[{"ch":"팀장님 표정이 안 좋으신 걸 보니 회의가 어려웠나 봐요.","tip":"Judging by the manager's face, the meeting must have been rough. — 회사에서 본 것"},{"ch":"손님, 먼 길 오시느라 고생 많으셨겠군요.","tip":"You must have had a long trip here. — 듣고 공감"},{"ch":"하늘이 흐린 걸 보니 곧 비가 올 것 같아요.","tip":"With the sky this grey, I think it will rain soon. — 앞일 짐작"}]},
          {"t":"cloze","sentence":"A: 저 손님 아까부터 메뉴판만 보고 계세요. B: 아직 못 [정하셨나 봐요].","answer":"정하셨나 봐요","meaning":"A: That guest has been staring at the menu for a while. B: They must not have decided yet.","options":["정하셨나 봐요","정하시겠군요","정하실 것 같아요","정하고 싶어요"],"keys":["정하셨나 봐요","정하시겠군요","정하실 것 같아요","정하고 싶어요"],"why":"메뉴판만 보고 있는 **모습을 눈으로 보고** 미루어 짐작하는 자리라 **-나 봐요** 입니다."},
          {"t":"choice","q":"이웃이 「어제 집 열쇠를 잃어버려서 한참 고생했어요」라고 합니다. 알맞은 맞장구는?","options":["열쇠를 잃어버릴 것 같아요.","정말 당황하셨겠군요!","당황하나 봐요."],"answer":1,"why":"이미 겪은 일을 듣고 그 마음을 헤아리는 자리라 **-겠군요** 입니다. 첫째는 앞일을 짐작하는 말이라 지난 일에 안 맞고, 셋째는 눈앞에서 당황하는 모습을 볼 때 쓰는 말입니다."},
          {"t":"type","q":"복잡하다 — 「주말이라 도로가 많이 ___ .」 아직 나가 보기 전에 막연히 짐작하는 꼴로 쓰세요.","answer":"복잡할 것 같아요","keys":["복잡할 것 같아요","복잡한가 봐요","복잡하겠군요"],"why":"아직 길에 나가지 않아 본 것도 들은 것도 없는 자리라 **-(으)ㄹ 것 같다** 입니다."},
          {"t":"order","q":"회사에서 나눌 만한 말을 맞춰 보세요.","tokens":["전화 통화가","길어지는 걸 보니","바쁜 일이","생겼나 봐요."],"answer":["전화 통화가","길어지는 걸 보니","바쁜 일이","생겼나 봐요."]},
          {"t":"pair","q":"자리와 어울리는 말을 짝지어 보세요.","pairs":[["비구름이 몰려오는 하늘을 볼 때","곧 비가 올 것 같아요."],["옆집에서 고기 냄새가 날 때","저녁으로 고기를 구우시나 봐요."],["하루 종일 이삿짐을 날랐다는 말을 들었을 때","몸살이 나시겠군요."]]},
          {"t":"note","md":"**-겠군요** 는 상대의 사정을 헤아리는 말이라 맞장구로 아주 쓸모 있습니다.\n\n다만 눈앞에서 본 것에 쓰면 지나치게 단정하는 느낌이 들 수 있으니, 그때는 **-나 봐요** 가 부드럽습니다."},
          {"t":"speak","say":"하루 종일 서서 일하셨으니 다리가 많이 아프시겠군요.","q":"상대의 피로를 걱정해 주는 부드러운 톤으로 말해 보세요."},
        ],
      },
    ],
  },

  {
    id: 'im-03-02',
    emoji: '🎭',
    title: '중급 03-02: 반응 표현 (-다니! / -잖아 / -네요 vs -군요)',
    tagline: '놀람 · 상기 · 새로 알게 됐을 때 뉘앙스',
    blurb: '결혼했다니! (최초 충격) / 결혼했잖아! (상기시킴) / 결혼했네요~ (감상) / 결혼했군요! (새로 깨달음). 4가지 반응형 어미를 문맥으로 완벽 구분!',
    level: 'Intermediate',
    needs: 'im-03-01',
    lessons: [
      {
        id: 'im-03-02-01',
        title: '1강. 듣고 놀랐을 때 써야 할 딱 1가지',
        minutes: 4,
        blocks: [
          { t:'text', md:'### 💡 반응형 어미 4종 완벽 가이드\n| 어미 | 뉘앙스 | 언제 써? |\n|---|---|---|\n| -다니! (놀람) | 😱 충격·경악·믿을 수 없음 | 상대방의 말을 **처음 듣고 입이 떡 벌어질 때** |\n| -잖아! (상기) | 😤 뭘 잊고 있냐고 일깨워 줄 때 | 상대방이 이미 알고 있었는데 잊고 있을 때 "잖아 우리가 약속했잖아!" |\n| -네요 (감상) | 😌 자기 혼자 감탄하는 느낌 | 자기가 직접 보고 느낀 개인적 감상. "오늘 날씨 좋네요~" |\n| -군요 (깨달음) | 💡 아하! 이제 알겠다 | 방금 상황 보고 **새로운 사실을 깨달았을 때** |' },

          { t:'cloze', sentence:'A: 저 다음 달에 결혼해요! B: [결혼하신다니]! 너무 놀라워요.', answer:'결혼하신다니',
            meaning:'A: I am getting married next month! B: WHAT?! Married?! That is so shocking!',
            options:['결혼하신다니','결혼하시잖아','결혼하시네요','결혼하시는군요'],
            keys:['결혼하신다니','결혼하시잖아','결혼하시네요','결혼하시는군요'],
            why:'상대방의 발표를 **처음 듣고 충격받는 반응**이라 **결혼하신다니** 가 맞습니다. **결혼하시잖아** 는 이미 알던 사실을 상기시키는 말이고, **결혼하시네요 / 하시는군요** 는 놀람보다 감상이나 새 깨달음 쪽으로 기웁니다.' },

          { t:'cloze', sentence:'야 우리 오늘 영화 보기로 약속했[잖아]! 어디야?!', answer:'잖아',
            meaning:'Hey! We PROMISED we were going to watch a movie today! Where are you?!',
            options:['잖아','다니','네요','군요'],
            keys:['잖아','다니','네요','군요'],
            why:'상대방이 잊고 있는 **기존 약속을 상기시키면서** 따지는 말 → -잖아!' },

          { t:'cloze', sentence:'와, 오늘 경치가 정말 멋지[네요].', answer:'네요',
            meaning:'Wow, the scenery today is really beautiful~ (personal sentiment)',
            options:['네요','군요','잖아요','다니요'],
            keys:['네요','군요','잖아요','다니요'],
            why:'내가 직접 본 풍경에 대해 **혼자 감탄하는 개인적 감상** → -네요' },

          { t:'cloze', sentence:'A: 저는 고기를 안 먹어요. B: 아! 그러시[군요]! 그럼 채소 메뉴로 시킬게요.', answer:'군요',
            meaning:'A: I do not eat meat. B: Oh! I see now! I will order a veggie menu then.',
            options:['군요','네요','잖아요','다니요'],
            keys:['군요','네요','잖아요','다니요'],
            why:'상대방 말을 듣고 **"아 그렇구나" 하고 방금 새로 깨달은 사실** → -군요' },

          { t:'speak', say:'와! 1등 하셨다니! 정말 대단하시네요! 저는 꼴찌 할 줄 알았군요.', q:'다니 → 네요 → 군요 3가지 어미가 다 들어있어요. 실제 감정 살려서!' },
        ],
      },
      {
        id: "im-03-02-02", title: "2강. 꼴 만들기", minutes: 4,
        blocks: [
          {"t":"text","h":"반응 어미의 결합 규칙","md":"반응 어미는 **품사**에 따라 붙는 모양이 달라집니다.\n\n* **-다니** — 동사는 **-ㄴ다니 / -는다니**, 형용사는 **-다니**\n* **-잖아 · -네요** — 동사·형용사 어간에 그대로\n* **-군요** — 동사는 **-는군요**, 형용사는 **-군요**"},
          {"t":"table","head":["사전형","-다니 (놀람)","-잖아 (상기)","-네요 (감상)","-군요 (깨달음)"],"rows":[["가다 — to go","간**다니**","가**잖아**","가**네요**","가**는군요**"],["먹다 — to eat","먹는**다니**","먹**잖아**","먹**네요**","먹**는군요**"],["크다 — to be big","크**다니**","크**잖아**","크**네요**","크**군요**"],["바쁘다 — to be busy","바쁘**다니**","바쁘**잖아**","바쁘**네요**","바쁘**군요**"]]},
          {"t":"note","md":"**-군요 에서 동사와 형용사가 갈립니다.**\n\n동사는 **-는군요** — 먹다 → 먹는군요, 읽다 → 읽는군요\n형용사는 **-군요** — 바쁘다 → 바쁘군요, 예쁘다 → 예쁘군요\n\n형용사에 **-는** 을 넣어 **예쁘는군요** 라고 하면 안 됩니다."},
          {"t":"chars","wide":true,"items":[{"ch":"이렇게 빨리 떠난다니 정말 아쉬워요.","tip":"I'm sad you are leaving so soon. — 동사 떠나다 → 떠난다니"},{"ch":"생각보다 사무실이 정말 넓군요!","tip":"The office is bigger than I expected. — 형용사 넓다 → 넓군요"},{"ch":"주말마다 도서관에 다니는군요!","tip":"So you go to the library every weekend. — 동사 다니다 → 다니는군요"}]},
          {"t":"cloze","sentence":"벌써 퇴근 시간을 [기다리는군요]!","answer":"기다리는군요","meaning":"So you are already waiting for the end of the workday!","options":["기다리는군요","기다리군요","기다리다니요","기다리잖아요"],"keys":["기다리는군요","기다리군요","기다리다니요","기다리잖아요"],"why":"**기다리다** 는 동사이므로 방금 알아챈 일을 말할 때 **-는군요** 가 붙어 **기다리는군요** 가 됩니다. **기다리군요** 는 형용사에 쓰는 꼴이라 안 됩니다."},
          {"t":"choice","q":"형용사 「예쁘다」에 방금 알아챘을 때 쓰는 어미를 바르게 붙인 것은?","options":["예쁘는군요","예쁘군요","예쁜다니"],"answer":1,"why":"형용사 뒤에는 **-는** 없이 바로 **-군요** 가 붙어 **예쁘군요** 입니다. **예쁜다니** 는 동사에 쓰는 **-ㄴ다니** 를 형용사에 잘못 붙인 꼴입니다."},
          {"t":"type","q":"합격하다 (to pass) — 「시험에 ___ 정말 축하해요!」 들은 소식에 놀라는 꼴로 바꾸세요.","answer":"합격했다니","keys":["합격했다니","합격하잖아","합격했네요"],"why":"이미 벌어진 일을 듣고 놀랄 때는 과거 어미 뒤에 붙여 **합격했다니** 라고 합니다."},
          {"t":"pair","q":"동사 사전형과 올바른 -는군요 꼴을 짝지어 보세요.","pairs":[["읽다 (to read)","읽는군요"],["만들다 (to make · ㄹ 탈락)","만드는군요"],["웃다 (to laugh)","웃는군요"],["바쁘다 (형용사)","바쁘군요"]]},
          {"t":"order","q":"문장을 차례대로 맞춰 보세요.","tokens":["이렇게","맛있는","음식을","만들었다니!"],"answer":["이렇게","맛있는","음식을","만들었다니!"]},
          {"t":"speak","say":"혼자서 이 많은 일을 다 끝냈다니 정말 대단하네요!","q":"놀람과 감탄을 함께 담아 밝게 말해 보세요."},
        ],
      },
      {
        id: "im-03-02-03", title: "3강. 헷갈리는 짝과 가르기", minutes: 5,
        blocks: [
          {"t":"text","h":"-네요 와 -군요 가르기","md":"둘 다 새로 안 것을 말하지만 **어떻게 알았는지** 가 다릅니다.\n\n* **-네요** — 내가 직접 보고 겪은 순간의 느낌.\n* **-군요** — 남의 말이나 상황을 통해 머리로 알아챈 것."},
          {"t":"table","head":["구분","-네요","-군요"],"rows":[["어떻게 알았나","직접 보고 듣고 느껴서","말을 듣거나 상황을 보고 알아채서"],["말맛","혼잣말 같은 부드러운 감탄","아하 하고 고개를 끄덕이는 납득"],["보기","직접 맛보고 「정말 맛있**네요**!」","말을 듣고 「아, 그래서 늦었**군요**!」"],["어울리는 자리","눈앞의 날씨·맛·풍경","설명을 듣고 사정을 알았을 때"]]},
          {"t":"chars","wide":true,"items":[{"ch":"오늘 바람이 불어서 제법 쌀쌀하네요.","tip":"It is quite chilly today with this wind. — 직접 느낀 감상"},{"ch":"출장 일정이 다음 주로 미뤄졌군요.","tip":"So the trip has been pushed to next week. — 듣고 알아챔"}]},
          {"t":"choice","q":"동료가 「저 오늘 야근해요」라고 합니다. 그 말을 듣고 사정을 알아챈 반응으로 알맞은 것은?","options":["오늘 일이 정말 많군요!","오늘 일이 정말 많잖아!","오늘 일이 정말 많다니!"],"answer":0,"why":"남의 말을 통해 사정을 알아채고 고개를 끄덕일 때는 **-군요** 입니다. **-잖아** 는 상대가 잊은 것을 일깨울 때, **-다니** 는 크게 놀랐을 때 씁니다."},
          {"t":"cloze","sentence":"A: 이 커피는 설탕이 안 들어갔어요. B: 아, 그래서 달지 [않군요]!","answer":"않군요","meaning":"A: This coffee has no sugar in it. B: Ah, that is why it is not sweet.","options":["않군요","않네요","않잖아","않다니"],"keys":["않군요","않네요","않잖아","않다니"],"why":"까닭을 듣고 나서야 **아 그래서 그렇구나** 하고 알아챈 자리라 **-군요** 입니다. **않네요** 는 마시면서 바로 느꼈을 때 씁니다."},
          {"t":"type","q":"가깝다 — 「창밖을 내다보니 지하철역이 정말 ___ .」 그 자리에서 느낀 감상으로 채우세요.","answer":"가깝네요","keys":["가깝네요","가깝군요","가깝잖아"],"why":"직접 눈으로 보고 느낀 것이라 **-네요** 입니다. **가깝군요** 는 남의 말을 듣고 알아챘을 때 어울립니다."},
          {"t":"order","q":"설명을 듣고 알아챈 문장을 맞춰 보세요.","tokens":["아,","그런","깊은","뜻이","있었군요!"],"answer":["아,","그런","깊은","뜻이","있었군요!"]},
          {"t":"pair","q":"자리에 맞는 반응 어미를 짝지어 보세요.","pairs":[["상대가 잊은 것을 일깨울 때","-잖아"],["소식을 처음 듣고 크게 놀랐을 때","-다니"],["직접 겪으며 감탄할 때","-네요"],["설명을 듣고 사정을 알아챘을 때","-군요"]]},
          {"t":"note","md":"💡 **한 가지 물음으로 가릅니다** — 「내가 겪은 것인가, 들은 것인가?」\n\n몸으로 겪었으면 **-네요**, 듣거나 보고 머리로 알아챘으면 **-군요** 입니다."},
          {"t":"speak","say":"말씀을 듣고 보니 정말 일리가 있군요.","q":"고개를 끄덕이며 납득하는 톤으로 말해 보세요."},
        ],
      },
      {
        id: "im-03-02-04", title: "4강. 실제 상황에서 쓰기", minutes: 5,
        blocks: [
          {"t":"text","h":"자리에 맞는 반응 고르기","md":"회사·가게·이웃과의 대화에서 놀람·상기·깨달음·감상을 가려 씁니다.\n\n같은 소식에도 **어떤 어미를 쓰느냐**에 따라 반가움으로도, 따지는 말로도 들립니다."},
          {"t":"chars","wide":true,"items":[{"ch":"손님, 이쪽 자리가 볕이 잘 들어서 훨씬 따뜻하네요.","tip":"This seat gets more sun, so it is much warmer. — 가게에서 느낀 감상"},{"ch":"김 대리, 오늘까지 서류 내야 한다고 미리 말했잖아!","tip":"I told you the papers were due today! — 잊은 것을 일깨움"},{"ch":"주말마다 산에 다니시는군요!","tip":"So you go hiking every weekend. — 듣고 알아챔"}]},
          {"t":"cloze","sentence":"A: 손님, 차가운 커피 나왔습니다. B: 어? 저 따뜻한 걸로 [시켰잖아요]!","answer":"시켰잖아요","meaning":"A: Here is your iced coffee. B: What? I ordered a hot one!","options":["시켰잖아요","시켰다니요","시켰네요","시켰군요"],"keys":["시켰잖아요","시켰다니요","시켰네요","시켰군요"],"why":"내가 이미 말했는데 상대가 잊은 것을 일깨우는 자리라 **-잖아요** 입니다. **시켰군요** 는 남이 시킨 것을 내가 알아챘을 때 쓰는 말이라 여기서는 뜻이 뒤집힙니다."},
          {"t":"choice","q":"이웃이 「저희 내일 이사해요」라고 인사합니다. 놀람과 아쉬움을 담은 반응으로 알맞은 것은?","options":["갑자기 이사를 가신다니 정말 아쉽네요!","갑자기 이사를 가시잖아 정말 아쉽네요!","갑자기 이사를 가시는군요, 제가 그럴 줄 알았어요!"],"answer":0,"why":"뜻밖의 소식을 처음 듣고 놀랄 때는 **-다니** 가 맞습니다. **-잖아** 는 상대가 이미 아는 것을 일깨우는 말이라 어긋나고, 셋째는 알아챘다는 **-군요** 뒤에 「그럴 줄 알았다」가 붙어 놀람이 사라집니다."},
          {"t":"type","q":"모르다 — 「부장님도 이 사실을 전혀 ___ !」 방금 알고 놀라는 꼴로 쓰세요.","answer":"모르셨다니","keys":["모르셨다니","모르셨잖아","모르시네요"],"why":"높임 **-시-** 와 과거 **-었-**, 그리고 놀람의 **-다니** 가 이어져 **모르셨다니** 가 됩니다."},
          {"t":"order","q":"동료와 나누는 말을 맞춰 보세요.","tokens":["벌써","올해","마지막","달이라니","믿기지 않아요."],"answer":["벌써","올해","마지막","달이라니","믿기지 않아요."]},
          {"t":"pair","q":"자리와 그 자리에 어울리는 말을 짝지어 보세요.","pairs":[["친구와 만난 곳이 마음에 들 때","여기 분위기가 생각보다 정말 좋네!"],["팀장이 잊은 회의를 일깨울 때","팀장님, 10분 뒤에 회의 있잖아요."],["동료의 뜻밖의 취미를 알았을 때","주말마다 산에 오르시는군요!"],["오래 준비한 일이 잘 풀렸다는 소식에","한 번에 붙으셨다니 정말 대단해요!"]]},
          {"t":"note","md":"**-잖아요** 는 조심해서 씁니다. 상대가 잊은 것을 일깨우는 말이라, 윗사람에게 자주 쓰면 따지는 것처럼 들릴 수 있습니다.\n\n같은 뜻이라도 「10분 뒤에 회의 있습니다」가 부드럽습니다."},
          {"t":"speak","say":"벌써 퇴근 시간이라니 오늘 하루가 정말 빠르네요!","q":"놀람과 감탄이 자연스럽게 이어지도록 말해 보세요."},
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════
  // 🔴 ADVANCED (고급) — 2강좌
  // ════════════════════════════════════════════════
  {
    id: 'ad-01-01',
    emoji: '📚',
    title: '고급 01-01: 관형절의 미묘한 차이 (-는 / -던 / -ㄹ)',
    tagline: '현재진행 · 과거습관 · 미래예정의 시간 뉘앙스',
    blurb: '"내가 만나는 사람 / 만났던 사람 / 만날 사람" — 시제가 아니라 **화자가 바라보는 시간 관점** 차이! 실제 뉴스 기사 문장으로 고급 수준 Cloze 훈련.',
    level: 'Advanced',
    needs: 'im-03-02',
    lessons: [
      {
        id: 'ad-01-01-01',
        title: '1강. 관형절의 3형식 시간 뉘앙스',
        minutes: 4,
        blocks: [
          { t:'text', md:'### 💡 관형절의 V + ㄴ/는/던/ㄹ\n| 형태 | 시간 관점 | 뉘앙스 |\n|---|---|---|\n| **-는** | **현재 반복·진행·사실** | 평범한 일반적 사실. (매일 만나는 친구) |\n| **-던** | **과거 회고·습관·지금과 다름** | 옛날에 자주 했었는데 지금은 아닐 수도. 추억이 느껴지는 어미. (예전에 자주 만나던 친구) |\n| **-(으)ㄹ** | **미래 예정·가능성** | 앞으로 할 일. (내일 만날 친구) |\n\n⚠️ 주의! 단순 과거 "했었다"는 **-ㄴ** 을 써요. (어제 만난 친구)' },

          { t:'cloze', sentence:'우리 회사에서 매일 점심을 같이 [먹는] 대리는 정말 친절해요.', answer:'먹는',
            meaning:'The assistant manager I eat lunch with every single day at our company is super kind.',
            options:['먹는','먹던','먹을','먹은'],
            keys:['먹는','먹던','먹을','먹은'],
            why:'"매일" 이라는 현재 반복 단서가 있으므로 **먹는 대리**가 맞습니다. **먹던** 은 예전 습관, **먹을** 은 미래 예정, **먹은** 은 한 번 끝난 과거 쪽으로 읽힙니다.' },

          { t:'cloze', sentence:'대학 시절 매일 밤을 같이 [새던] 친구들은 지금 다 해외에 살아요.', answer:'새던',
            meaning:'The friends I used to pull all-nighters with daily back in college all live abroad now.',
            options:['새던','새는','샐','샌'],
            keys:['새던','새는','샐','샌'],
            why:'대학 시절이라는 옛 배경과 지금은 끝난 습관이 같이 나와 **새던 친구들**이 맞습니다. **새는** 은 현재 반복, **샐** 은 미래, **샌** 은 단발 과거에 더 가깝습니다.' },

          { t:'cloze', sentence:'이번 주 금요일 3시에 [만날] 예정인 고객은 일본에서 오신 대표님이세요.', answer:'만날',
            meaning:'The client we are scheduled to meet at 3 PM this coming Friday is a CEO coming from Japan.',
            options:['만날','만나는','만났던','만난'],
            keys:['만날','만나는','만났던','만난'],
            why:'이번 주 금요일은 명백한 미래 예정 → -(으)ㄹ → 만날' },

          { t:'cloze', sentence:'어제 지하철에서 [만난] 사람이 지금 회사 새 팀장님이래요.', answer:'만난',
            meaning:'The person I ran into yesterday on the subway is apparently our new team leader now.',
            options:['만난','만나는','만났던','만날'],
            keys:['만난','만나는','만났던','만날'],
            why:'어제 라는 **단 한 번의 구체적인 과거**는 습관 아님! 단순 완료 → -ㄴ' },

          { t:'speak', say:'예전에 자주 가던 카페가 있었는데, 지금은 내가 매일 가는 카페보다 훨씬 맛있었어. 다음 달에 갈 거리에 새로 생겼다던데 거기 꼭 가볼까.', q:'던 → 는 → 던 → ㄹ 4가지가 다 섞인 고급 표현!' },
        ],
      },
      {
        id: "ad-01-01-02", title: "2강. 꼴 만들기", minutes: 4,
        blocks: [
          {"t":"text","h":"동사의 관형사형 어미 결합 규칙","md":"관형절을 만들 때 동사 어간 뒤에 **-는**(현재), **-던**(과거 회고), **-(으)ㄹ**(미래 예정)을 붙입니다.\n\n어간의 받침과 **ㄹ 탈락**에 주의해서 붙여야 합니다."},
          {"t":"table","head":["사전형","현재 -는","과거 회고 -던","미래 예정 -(으)ㄹ"],"rows":[["살다 — to live (ㄹ)","사**는**","살**던**","살"],["만들다 — to make (ㄹ)","만드**는**","만들**던**","만들"],["읽다 — to read (받침)","읽**는**","읽**던**","읽**을**"],["보내다 — to send (받침 없음)","보내**는**","보내**던**","보낼"]]},
          {"t":"note","md":"**ㄹ 받침 동사는 어미마다 달리 움직입니다.**\n\n**-는** 앞에서는 ㄹ 이 떨어집니다 — 살다 → 사는, 만들다 → 만드는\n**-던** 앞에서는 ㄹ 이 남습니다 — 살다 → 살던, 만들다 → 만들던\n**-(으)ㄹ** 앞에서는 어간 그대로입니다 — 살다 → 살, 만들다 → 만들\n\n같은 동사인데 어미에 따라 셋이 다 다르므로 표를 눈에 익혀 두세요."},
          {"t":"chars","wide":true,"items":[{"ch":"우리가 자주 다니던 식당이 문을 닫았어요.","tip":"The restaurant we used to go to has closed. — 과거 회고 -던"},{"ch":"내일 발표할 자료를 다시 검토해 주세요.","tip":"Please review the material we will present tomorrow. — 미래 예정 -(으)ㄹ"},{"ch":"지금 진행하는 일이 끝나면 알려 드릴게요.","tip":"I will let you know when the work in progress is done. — 현재 -는"}]},
          {"t":"cloze","sentence":"지금 서울에 [사는] 친구한테서 연락이 왔어요.","answer":"사는","meaning":"I heard from a friend who lives in Seoul now.","options":["사는","살는","살던","살"],"keys":["사는","살는","살던","살"],"why":"**살다** 에 현재 관형사형 **-는** 이 붙으면 ㄹ 이 떨어져 **사는** 이 됩니다. **살는** 은 ㄹ 을 안 떨어뜨린 없는 꼴이고, **살던** 은 지금이 아니라 지난 일을 가리킵니다."},
          {"t":"choice","q":"「만들다」에 미래 예정의 관형사형 어미를 바르게 붙인 것은?","options":["만드는","만들던","만들"],"answer":2,"why":"ㄹ 받침 동사는 **-(으)ㄹ** 앞에서 어간이 그대로 남아 **만들** 이 됩니다. **만드는** 은 현재, **만들던** 은 과거 회고입니다."},
          {"t":"type","q":"듣다 (to listen) — 「예전에 자주 ___ 음악을 들으니 옛날 생각이 나요.」 과거 회고 꼴로 쓰세요.","answer":"듣던","keys":["듣던","듣는","들을"],"why":"**-던** 은 자음으로 시작해서 ㄷ 불규칙이 일어나지 않습니다. 그래서 **듣던** 입니다. 미래 **들을** 은 모음 앞이라 ㄷ 이 ㄹ 로 바뀝니다."},
          {"t":"pair","q":"사전형과 미래 예정 관형사형을 이어 보세요.","pairs":[["맡다 (to take charge)","맡을"],["추진하다 (to push forward)","추진할"],["열다 (to open · ㄹ)","열"],["걷다 (to walk · ㄷ 불규칙)","걸을"]]},
          {"t":"order","q":"문장을 차례대로 맞춰 보세요.","tokens":["다음 주에","진행할","프로젝트를","준비하고 있어요."],"answer":["다음 주에","진행할","프로젝트를","준비하고 있어요."]},
          {"t":"speak","say":"우리가 함께 근무하던 시절이 그리워요.","q":"추억을 떠올리는 부드러운 톤으로 말해 보세요."},
        ],
      },
      {
        id: "ad-01-01-03", title: "3강. 헷갈리는 짝과 가르기", minutes: 5,
        blocks: [
          {"t":"text","h":"-던 과 -았/었던 가르기","md":"둘 다 지난 일을 돌아보지만 **끝났는지 여부**가 다릅니다.\n\n* **-던** — 하다가 만 일, 되풀이하던 일. 아직 이어질 수도 있습니다.\n* **-았/었던** — 완전히 끝나 지금과 끊어진 일."},
          {"t":"table","head":["구분","-던","-았/었던"],"rows":[["성격","하던 중이거나 되풀이하던 일","다 끝나 지금과 끊어진 일"],["지금은","이어질 수도 있음","확실히 다름"],["보기","마시**던** 커피 (아직 남아 있음)","마셨**던** 커피 (다 마셨음)"],["보기","다니**던** 회사 (다닐 수도 있음)","다녔**던** 회사 (지금은 그만둠)"]]},
          {"t":"chars","wide":true,"items":[{"ch":"내가 읽던 책이 어디로 갔지?","tip":"Where is the book I was in the middle of reading? — 아직 다 안 읽음"},{"ch":"지난해 거래했던 회사들과 다시 연락을 시작했어요.","tip":"We got back in touch with companies we dealt with last year. — 한동안 끊겼던 사이"}]},
          {"t":"choice","q":"「지금은 확실히 끊어진 지난 관계」를 가장 잘 나타낸 문장은?","options":["여기가 제가 자주 가던 카페예요.","여기가 제가 예전에 자주 갔던 카페예요.","여기가 제가 앞으로 갈 카페예요."],"answer":1,"why":"**갔던** 은 지난날 다니다가 지금은 끊긴 것을 또렷이 보입니다. **가던** 은 아직 다닐 수도 있다는 여지를 남기고, **갈** 은 앞일입니다."},
          {"t":"cloze","sentence":"한때 크게 유행[했던] 물건들이 요즘은 잘 안 팔려요.","answer":"했던","meaning":"Things that were once very popular hardly sell these days.","options":["했던","하는","할","하느라"],"keys":["했던","하는","할","하느라"],"why":"**한때** 는 지나가고 끝났다는 말이라 **했던** 이 맞습니다. **하는** 은 지금도 유행한다는 뜻이 되어 뒷말과 어긋납니다."},
          {"t":"type","q":"입다 (to wear) — 「아침까지 ___ 옷이 어디 갔지?」 아직 정리가 안 끝난 상황으로 쓰세요.","answer":"입던","keys":["입던","입었던","입을"],"why":"아침까지 걸치고 있다가 벗어 둔, 아직 매듭짓지 않은 일이라 **입던** 입니다. **입었던** 은 오래전에 입고 지금은 안 입는 옷이라는 느낌이 됩니다."},
          {"t":"order","q":"문장을 차례대로 맞춰 보세요.","tokens":["학생 시절에","주로","사용했던","컴퓨터예요."],"answer":["학생 시절에","주로","사용했던","컴퓨터예요."]},
          {"t":"pair","q":"뜻에 맞는 꼴을 짝지어 보세요.","pairs":[["먹다 만 음식","먹던 음식"],["예전에 먹고 지금은 안 먹는 음식","먹었던 음식"],["앞으로 먹을 음식","먹을 음식"],["지금 먹고 있는 음식","먹는 음식"]]},
          {"t":"note","md":"💡 **한 가지 물음으로 가릅니다** — 「그 일이 지금도 이어질 수 있나?」\n\n이어질 수 있으면 **-던**, 확실히 끝났으면 **-았/었던** 입니다."},
          {"t":"speak","say":"어제 쓰던 보고서를 마저 써서 제출했어요.","q":"이어서 마무리했다는 느낌을 살려 말해 보세요."},
        ],
      },
      {
        id: "ad-01-01-04", title: "4강. 실제 상황에서 쓰기", minutes: 5,
        blocks: [
          {"t":"text","h":"업무 문서와 보도문에서 쓰기","md":"보고서·공문·보도문에서는 **언제의 일인지**를 관형절 하나로 가릅니다.\n\n문장 안의 때를 가리키는 말(지금·기존에·다음 달)을 먼저 찾으면 어느 어미를 쓸지 바로 정해집니다."},
          {"t":"chars","wide":true,"items":[{"ch":"보도자료: 정부가 추진하는 새 정책을 두고 논의가 이어지고 있습니다.","tip":"Press release: Debate continues over the new policy the government is pushing. — 현재 -는"},{"ch":"공문: 다음 달 열릴 학술 대회에 많은 참여를 바랍니다.","tip":"Notice: We hope for wide participation in next month's conference. — 미래 -(으)ㄹ"},{"ch":"회의록: 지난 분기에 다루었던 안건은 마무리되었습니다.","tip":"Minutes: The item taken up last quarter has been wrapped up. — 끝난 일 -았/었던"}]},
          {"t":"cloze","sentence":"(사내 공지) 그동안 [사용하던] 시스템은 다음 주부터 멈춥니다.","answer":"사용하던","meaning":"[Notice] The system we have been using will stop from next week.","options":["사용하던","사용할","사용되는","사용하여"],"keys":["사용하던","사용할","사용되는","사용하여"],"why":"**그동안** 써 오다가 이제 멈춘다는 흐름이라 **사용하던** 입니다. **사용할** 은 앞으로 쓸 것이라는 뜻이 되어 뒷말과 어긋납니다."},
          {"t":"cloze","sentence":"(업무 메일) 지난주에 [보내 주신] 자료를 잘 받았습니다.","answer":"보내 주신","meaning":"[Email] I received the material you sent last week.","options":["보내 주신","보내 주시는","보내 주실","보내 주시던"],"keys":["보내 주신","보내 주시는","보내 주실","보내 주시던"],"why":"**지난주에** 한 번 끝난 일이라 **-(으)ㄴ** 을 쓴 **보내 주신** 입니다. **보내 주시던** 은 여러 번 보내던 일을 돌아보는 말이라 한 번 받은 자료에는 안 맞습니다."},
          {"t":"choice","q":"업무 메일에서 「내일 찾아갈 거래처」를 가리킬 때 알맞은 문장은?","options":["내일 방문하는 거래처 담당자께 연락드렸습니다.","내일 방문할 거래처 담당자께 연락드렸습니다.","내일 방문했던 거래처 담당자께 연락드렸습니다."],"answer":1,"why":"**내일** 은 아직 오지 않은 때라 **방문할** 이 맞습니다. **방문했던** 은 지난 일이라 내일과 어긋나고, **방문하는** 은 늘 다니는 곳이라는 뜻으로 읽힙니다."},
          {"t":"type","q":"논의하다 (to discuss) — 「현재 ___ 안건에 대해 의견을 주세요.」 지금 하고 있는 일로 쓰세요.","answer":"논의하는","keys":["논의하는","논의할","논의하던"],"why":"**현재** 이어지고 있는 일이라 현재 관형사형 **논의하는** 입니다."},
          {"t":"order","q":"보도문에 어울리게 차례를 맞춰 보세요.","tokens":["전 세계가","주목하는","새로운 기술이","공개되었습니다."],"answer":["전 세계가","주목하는","새로운 기술이","공개되었습니다."]},
          {"t":"pair","q":"업무 상황과 알맞은 관형절을 짝지어 보세요.","pairs":[["지금 이어지고 있는 일","담당하는 프로젝트"],["예전에 맡았다가 끝난 일","담당했던 프로젝트"],["다음 분기에 시작할 일","담당할 프로젝트"],["맡아 오다가 넘겨준 일","담당하던 프로젝트"]]},
          {"t":"note","md":"문장 안의 **때를 가리키는 말**을 먼저 찾으세요. 지금·현재 → **-는**, 그동안·예전에 → **-던 / -았던**, 내일·다음 달 → **-(으)ㄹ**.\n\n이 단서만 잡으면 어미는 저절로 정해집니다."},
          {"t":"speak","say":"지난 분기에 검토했던 안건을 다시 확인해 보겠습니다.","q":"신중하고 격식 있는 어조로 말해 보세요."},
        ],
      },
    ],
  },

  {
    id: 'ad-02-01',
    emoji: '🎯',
    title: '고급 02-01: 격식·비격식 화법 4단계 매칭',
    tagline: '해요체 / 합쇼체 / 해라체 / 하오체 4화법 완벽 구분',
    blurb: '사내 회의 / 친구 술자리 / 신문 사설 / 옛 드라마 대사. 상황에 맞는 화법을 고르는 것은 한국어 실력 최종 단계! 4지선다 고급 Cloze 8문제.',
    level: 'Advanced',
    needs: 'ad-01-01',
    lessons: [
      {
        id: 'ad-02-01-01',
        title: '1강. 화법 4종과 적절한 사용 상황',
        minutes: 4,
        blocks: [
          { t:'text', md:'### 💡 격식도 4단계 화법 매칭표\n| 레벨 | 화법 | 끝말 | 언제 써? |\n|---|---|---|---|\n| Lv1 친절·평범 | **해요체** | -아요/어요/해요 | 일상 대부분 · 가게 · 직장 상사 이외 대인 관계 |\n| Lv2 가장 격식 | **합쇼체** | -ㅂ니다/습니다 | 신문·방송·보고서·회의 공식석상 |\n| Lv3 반말 | **해라체** | -아/어/해 · -ㄴ다 | 친구 사이 · 가족 · 끼리끼리 문자 · 일기 |\n| Lv4 옛날 어른 | **하오체** | -오/소 · -시오 | 요즘은 거의 안 쓰나 옛 드라마·관공서 키오스크에서 종종 출현 |' },

          { t:'cloze', sentence:'(사내 회의록) 금일 제 3차 정기 이사회는 서면으로 [진행되었습니다].', answer:'진행되었습니다',
            meaning:'[Company Minutes] The 3rd regular board meeting today was conducted in writing.',
            options:['진행되었습니다','진행되었어요','진행되었다','진행되었소'],
            keys:['진행되었습니다','진행되었어요','진행되었다','진행되었소'],
            why:'회의록은 가장 격식이 높은 공식 문서라 **진행되었습니다** 같은 합쇼체가 맞습니다. 나머지는 일상체, 기사체, 옛말투라 회의록 문장과 결이 다릅니다.' },

          { t:'cloze', sentence:'(단톡방) A: 야 술 한잔 [할래]? B: 좋아! 저녁 7시에 봐!', answer:'할래',
            meaning:'[Kakao chat] A: Hey wanna grab a drink? B: Hell yeah! See u 7 PM!',
            options:['할래','할래요','하시겠습니까','하시오'],
            keys:['할래','할래요','하시겠습니까','하시오'],
            why:'친구들 단톡방에서는 가장 자연스러운 반말 권유형이 **할래?** 입니다. **할래요** 는 톤이 반쯤 높아지고, **하시겠습니까 / 하시오** 는 상황에 비해 지나치게 격식적입니다.' },

          { t:'cloze', sentence:'편의점 점원: 네, 주문하신 메뉴 총 5천 원 되[어요].', answer:'어요',
            meaning:'Clerk: Yes, your total order comes to 5,000 won.',
            options:['어요','습니다','라','시오'],
            keys:['어요','습니다','라','시오'],
            why:'편의점 알바와 고객은 일상적 친절한 관계. 표준 해요체 -어요.' },

          { t:'cloze', sentence:'(사극 드라마 임금님 말씀) 감히 신하가 이런 말을 [하시오]? 용서가 안 되오.', answer:'하시오',
            meaning:'[Historical Drama King Speech] DARE YOU, SUBJECT, UTTER SUCH WORDS? I CANNOT FORGIVE THEE.',
            options:['하시오','하시는군요','하는데','해'],
            keys:['하시오','하시는군요','하는데','해'],
            why:'사극 임금의 말투는 **하시오 / 되오** 같은 하오체가 핵심입니다. **하시는군요** 는 깨달음, **하는데** 는 연결, **해** 는 반말이라 문맥과 전혀 맞지 않습니다.' },

          { t:'speak', say:'[친구한테] 어제 회의 때 사장님이 내 의견 들어주시고 아주 좋다고 하셨는데, 완전 신이 났어. 내일 기분 좋게 출근할 것 같다!', q:'해요체와 해라체(-났어 · 같다)가 자연스럽게 섞인 실제 말투로 연습!' },
        ],
      },
      {
        id: "ad-02-01-02", title: "2강. 꼴 만들기", minutes: 4,
        blocks: [
          {"t":"text","h":"네 화법의 종결어미 꼴","md":"화법마다 문장을 맺는 어미가 다릅니다. 어간의 **받침**과 **ㄹ 탈락**에 따라 꼴이 갈리니 표로 익혀 두세요."},
          {"t":"table","head":["사전형","해요체","합쇼체","해라체","하오체"],"rows":[["가다 — to go","가요","갑니다","간다","가오"],["먹다 — to eat","먹어요","먹습니다","먹는다","먹소"],["만들다 — to make (ㄹ)","만들어요","만듭니다","만든다","만드오"],["좋다 — to be good (형용사)","좋아요","좋습니다","좋다","좋소"]]},
          {"t":"note","md":"**해라체에서 동사와 형용사가 갈립니다.**\n\n동사는 받침에 따라 **-ㄴ다 / -는다** — 가다 → 간다, 먹다 → 먹는다\n형용사는 어간에 **-다** 를 그대로 — 좋다 → 좋다, 춥다 → 춥다\n\n그리고 ㄹ 받침 동사는 **-ㅂ니다 · -ㄴ다** 앞에서 ㄹ 이 떨어집니다 — 만들다 → 만듭니다 · 만든다."},
          {"t":"chars","wide":true,"items":[{"ch":"모두 자리에 앉아 주십시오.","tip":"Everyone please be seated. — 합쇼체 명령형 -십시오"},{"ch":"이곳은 외부인 출입을 금하오.","tip":"Outsiders are not admitted here. — 하오체 평서형 -오"},{"ch":"내일까지 서류를 제출하시오.","tip":"Submit the documents by tomorrow. — 하오체 명령형 -시오"}]},
          {"t":"cloze","sentence":"신문 기사: 정부는 새로운 정책을 발표했[다].","answer":"다","meaning":"Newspaper: The government announced a new policy.","options":["다","습니다","어요","소"],"keys":["다","습니다","어요","소"],"why":"신문과 사설은 읽는 사람을 앞에 두지 않고 사실만 적는 자리라 해라체 **-다** 를 씁니다. **습니다** 는 듣는 사람이 앞에 있을 때 쓰는 말입니다."},
          {"t":"choice","q":"「읽다」를 합쇼체 평서형으로 바르게 바꾼 것은?","options":["읽어요","읽습니다","읽는다"],"answer":1,"why":"어간 **읽-** 에 받침이 있으므로 **-습니다** 가 붙어 **읽습니다** 가 됩니다. **읽어요** 는 해요체, **읽는다** 는 해라체입니다."},
          {"t":"type","q":"오다 (to come) — 손님을 맞이하는 하오체 **명령형** 으로 「어서 ___ .」 를 채우세요.","answer":"오시오","keys":["오시오","오오","옵니다"],"why":"하오체 명령형은 **-(으)시오** 라서 **오시오** 입니다. **오오** 는 같은 하오체라도 평서형이라 「내일 다시 오오」처럼 씁니다."},
          {"t":"pair","q":"사전형과 합쇼체 꼴을 짝지어 보세요.","pairs":[["듣다 (to listen)","듣습니다"],["돕다 (to help)","돕습니다"],["살다 (to live · ㄹ 탈락)","삽니다"],["만들다 (to make · ㄹ 탈락)","만듭니다"]]},
          {"t":"order","q":"해라체 문장을 차례대로 맞춰 보세요.","tokens":["오늘","날씨가","정말","춥다."],"answer":["오늘","날씨가","정말","춥다."]},
          {"t":"speak","say":"새로운 사업을 무사히 마쳤습니다.","q":"공식 보고나 발표 자리의 격식 있는 톤으로 말해 보세요."},
        ],
      },
      {
        id: "ad-02-01-03", title: "3강. 헷갈리는 짝과 가르기", minutes: 5,
        blocks: [
          {"t":"text","h":"해라체와 합쇼체 가르기","md":"둘 다 격식 있는 자리에 쓰지만 **듣는 사람이 앞에 있는지**로 갈립니다.\n\n* **해라체** — 신문·책·논문. 읽는 사람이 정해져 있지 않은 글.\n* **합쇼체** — 뉴스 진행·발표·회의. 듣는 사람을 눈앞에 두고 하는 말."},
          {"t":"table","head":["자리","화법","보기"],"rows":[["신문 기사와 사설","해라체","늘고 **있다**, 발표했**다**"],["뉴스 진행과 발표","합쇼체","늘고 **있습니다**, 발표했**습니다**"],["회사에서 나누는 말","해요체","늘고 **있어요**, 발표했**어요**"],["안내문과 표지판","하오체·해라체","출입을 금하**오**, 쓰레기를 버리지 **마라**"]]},
          {"t":"chars","wide":true,"items":[{"ch":"뉴스: 기상청은 내일 비가 내릴 것으로 내다봤습니다.","tip":"News: The weather service expects rain tomorrow. — 합쇼체"},{"ch":"신문: 최근 물가가 빠르게 오르고 있다.","tip":"Newspaper: Prices have been rising fast. — 해라체"}]},
          {"t":"choice","q":"논문이나 책의 맺음말에 쓸 어미로 알맞은 것은?","options":["이 문제는 앞으로도 연구가 필요합니다.","이 문제는 앞으로도 연구가 필요하다.","이 문제는 앞으로도 연구가 필요해요."],"answer":1,"why":"글로 남기는 자리에는 해라체 **-다** 를 씁니다. **필요합니다** 는 듣는 사람 앞에서 말할 때, **필요해요** 는 일상 대화에서 씁니다."},
          {"t":"cloze","sentence":"(회사 발표) 오늘 말씀드릴 차례는 다음과 [같습니다].","answer":"같습니다","meaning":"[Presentation] Today's agenda is as follows.","options":["같습니다","같다","같아","같소"],"keys":["같습니다","같다","같아","같소"],"why":"듣는 사람을 앞에 두고 하는 발표라 합쇼체 **같습니다** 입니다. **같다** 는 글에 쓰는 해라체라 발표에서는 반말처럼 들립니다."},
          {"t":"type","q":"(공공 안내문) 「박물관 안에서는 정숙을 ___ .」 하오체 명령형으로 채우세요.","answer":"유지하시오","keys":["유지하시오","유지합니다","유지하라"],"why":"안내문과 경고문에는 하오체 명령형 **-(으)시오** 가 자주 쓰입니다. **유지하라** 는 해라체 명령형이라 더 딱딱하고 위압적으로 들립니다."},
          {"t":"order","q":"뉴스 진행자의 말을 차례대로 맞춰 보세요.","tokens":["다음","소식을","전해","드리겠습니다."],"answer":["다음","소식을","전해","드리겠습니다."]},
          {"t":"pair","q":"자리와 어울리는 종결 어미를 짝지어 보세요.","pairs":[["뉴스 진행자의 말","-습니다 / -ㅂ니다"],["책과 신문의 서술","-ㄴ다 / -다"],["관공서 안내문과 표지판","-시오 / -소"],["회사 동료와 나누는 말","-아요 / -어요"]]},
          {"t":"note","md":"💡 **회의에서 해라체를 쓰면 안 됩니다.** 「이번 안건은 다음으로 미룬다」처럼 말하면 듣는 사람에게 반말로 대하는 느낌을 줍니다. 사람을 앞에 두고 말할 때는 **-습니다** 입니다."},
          {"t":"speak","say":"전문가들은 이번 경제 상황을 밝게 내다봤다.","q":"신문 기사를 읽듯 단정한 톤으로 말해 보세요."},
        ],
      },
      {
        id: "ad-02-01-04", title: "4강. 실제 상황에서 쓰기", minutes: 5,
        blocks: [
          {"t":"text","h":"자리에 맞는 화법 고르기","md":"같은 말이라도 **누구에게, 어디에서** 하느냐에 따라 맺음이 달라집니다.\n\n사내 보고·동료와의 대화·책 서술·옛 사극 대사를 놓고 알맞은 화법을 골라 봅니다."},
          {"t":"chars","wide":true,"items":[{"ch":"사내 보고: 이번 분기 매출이 지난달보다 15% 늘었습니다.","tip":"Report: Sales rose 15% from last month. — 합쇼체"},{"ch":"사극 대사: 이보시오, 거기 아무도 없소?","tip":"Historical drama: Hello there, is anyone about? — 하오체"},{"ch":"책 서술: 사람은 누구나 행복을 원한다.","tip":"Book: Everyone wants to be happy. — 해라체"}]},
          {"t":"cloze","sentence":"(상사와 점심) 과장님, 오늘 점심에 김치찌개 [드실래요]?","answer":"드실래요","meaning":"[Lunch with a manager] Sir, shall we have kimchi stew for lunch?","options":["드실래요","드십시오","드셔라","드시오"],"keys":["드실래요","드십시오","드셔라","드시오"],"why":"윗사람이라도 밥 먹으러 가자는 자리라 해요체 **드실래요** 가 알맞습니다. **드십시오** 는 너무 딱딱하고, **드셔라** 는 아랫사람에게 쓰는 말입니다."},
          {"t":"choice","q":"공식 이사회에서 서류 검토를 부탁할 때 알맞은 말은?","options":["이 서류 좀 확인해 봐.","이 서류를 검토해 주시기 바랍니다.","이 서류를 검토해 주시오."],"answer":1,"why":"공식 회의에는 합쇼체 **-기 바랍니다** 가 맞습니다. 첫째는 반말이고, 셋째의 **주시오** 는 하오체라 요즘 회의에서는 옛말처럼 들립니다."},
          {"t":"type","q":"(책 서술) 「사람은 누구나 행복을 ___ .」 책 문체로 고쳐 쓰세요. (원하다)","answer":"원한다","keys":["원한다","원합니다","원해요"],"why":"책의 서술문에는 해라체를 씁니다. **원하-** 는 받침이 없으므로 **-ㄴ다** 가 붙어 **원한다** 입니다."},
          {"t":"order","q":"사내 방송 안내 문장을 맞춰 보세요.","tokens":["잠시 후","안전 교육이","시작될","예정입니다."],"answer":["잠시 후","안전 교육이","시작될","예정입니다."]},
          {"t":"pair","q":"자리와 그 자리에 쓸 말을 짝지어 보세요.","pairs":[["사내 결재 보고","안건을 서면으로 접수했습니다."],["친구 사이 대화","내일 영화 볼 시간 돼?"],["옛 사극 대사","길 좀 물읍시다."],["신문 사설","물가가 빠르게 오르고 있다."]]},
          {"t":"note","md":"자리에 안 맞는 화법은 오해를 부릅니다. 너무 낮추면 무례해 보이고, 너무 높이면 거리를 두는 느낌을 줍니다.\n\n**듣는 사람이 누구인지** 와 **말인지 글인지** 를 먼저 가르면 화법은 저절로 정해집니다."},
          {"t":"speak","say":"오늘 전해 드릴 안내 사항은 이상입니다.","q":"사내 방송을 마치는 톤으로 또렷하게 말해 보세요."},
        ],
      },
    ],
  },

];
