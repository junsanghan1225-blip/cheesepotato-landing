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
    title: { ko:'초급 세밀: -아요 / -어요 바르게 쓰기', en:'Conjugation: -아요 / -어요' },
    tagline: { ko:'모음에 따라 달라지는 어미 자동 구분', en:'The vowel harmony rule that shapes everyday verbs.' },
    blurb: { ko:'하다·먹다·가다 동사의 모음(ㅏ/ㅗ vs 그 외)을 보고 -아요 / -어요를 정확히 고르는 훈련입니다.',
             en:'Look at the last vowel of the stem — ㅏ/ㅗ vs. everything else — and pick between -아요 and -어요.' },
    level: 'Beginner',
    needs: 'bg-06',
    lessons: [
      {
        id: 'bg-d-01-01',
        title: { ko:'1강. ㅏ/ㅗ 동사 뒤에는 -아요', en:'Lesson 1. ㅏ and ㅗ verbs take -아요' },
        minutes: 4,
        blocks: [
          { t:'text', md:'### 💡 The Core Rule for -아요 / -어요\n1. If the **last vowel of the verb stem is ㅏ or ㅗ** → **-아요**\n2. For **all other vowels** (ㅓ, ㅜ, ㅡ, ㅣ, etc.) → **-어요**\n3. `하다` verbs are the special exception: they always become **해요**.' },

          { t:'cloze', sentence:'오늘 학교에 [가요].', answer:'가요',
            meaning:'I go to school today.',
            options:['갔어요','가요','가아요','가고 싶어요'],
            keys:['가요','갔어요','가아요','가고 싶어요'],
            why:'The stem 가 ends in ㅏ, so it takes -아요. But 가 + 아요 contracts into **가요** rather than 가아요 — identical vowels merge.' },

          { t:'cloze', sentence:'어제 친구를 [만났어요].', answer:'만났어요',
            meaning:'I met a friend yesterday.',
            options:['만나요','만났어요','만나았어요','만날 거예요'],
            keys:['만났어요','만나요','만나았어요','만날 거예요'],
            why:'“어제” means yesterday (past tense). 만나 + 았어요 contracts into **만났어요** instead of 만나았어요.' },

          { t:'cloze', sentence:'주말에 게임을 [해요].', answer:'해요',
            meaning:'I play games on weekends.',
            options:['했어요','할 거예요','해요','하고 싶어요'],
            keys:['해요','했어요','할 거예요','하고 싶어요'],
            why:'하다 is irregular and always becomes **해요**. The other three mean past (했어요), future (할 거예요), and desire (하고 싶어요).' },

          { t:'speak', say:'나는 오늘 친구를 만나고 영화를 봐요.', rom:'na-neun o-neul chin-gu-reul man-na-go yeong-hwa-reul bwa-yo',
            q:'Read out loud in a natural rhythm: “I meet a friend and watch a movie today.”' },
        ],
      },
      {
        id: 'bg-d-01-02',
        title: { ko:'2강. 그 외 모음은 전부 -어요', en:'Lesson 2. All other vowels take -어요' },
        minutes: 4,
        blocks: [
          { t:'text', md:'### 💡 Verbs That Take -어요\n- 먹다 (ㅓ) → **먹어요**\n- 배우다 (ㅜ) → **배워요**\n- 읽다 (ㅣ) → **읽어요**\n- 기다리다 (ㅣ) → **기다려요**\n\nIf the last vowel is **not ㅏ or ㅗ**, it takes **-어요**.' },

          { t:'cloze', sentence:'점심으로 김밥을 [먹어요].', answer:'먹어요',
            meaning:'I eat kimbap for lunch.',
            options:['먹아요','먹어요','먹었어요','먹을 거예요'],
            keys:['먹어요','먹아요','먹었어요','먹을 거예요'],
            why:'The stem 먹 has the vowel ㅓ, so it takes -어요 → **먹어요**. 먹아요 wrongly applies the ㅏ/ㅗ ending.' },

          { t:'cloze', sentence:'한국어를 열심히 [배워요].', answer:'배워요',
            meaning:'I study Korean hard.',
            options:['배우어요','배워요','배웠어요','배우고 싶어요'],
            keys:['배워요','배우어요','배웠어요','배우고 싶어요'],
            why:'The stem 배우 has ㅜ, so with -어요, ㅜ + 어 merges into **워** → **배워요**.' },

          { t:'cloze', sentence:'책을 조용히 [읽어요].', answer:'읽어요',
            meaning:'I read a book quietly.',
            options:['읽아요','읽었어요','읽어요','읽을 거예요'],
            keys:['읽어요','읽아요','읽었어요','읽을 거예요'],
            why:'The stem 읽 has the vowel **ㅣ**. Since it is not ㅏ or ㅗ, -어요 attaches to make **읽어요**.' },

          { t:'cloze', sentence:'버스를 30분 동안 [기다려요].', answer:'기다려요',
            meaning:'I wait for the bus for 30 minutes.',
            options:['기다리어요','기다려요','기다렸어요','기다릴 거예요'],
            keys:['기다려요','기다리어요','기다렸어요','기다릴 거예요'],
            why:'기다리 ends in ㅣ. Combined with 어요, ㅣ + 어 contracts into **여** → **기다려요**.' },

          { t:'speak', say:'나는 매일 학교에서 한국어를 배우고 책을 읽어요.', rom:'na-neun mae-il hak-gyo-e-seo han-gug-eo-reul bae-u-go chaeg-eul ilg-eo-yo',
            q:'Read out loud connecting the three -어요 verbs naturally.' },
        ],
      },
    ],
  },

  {
    id: 'bg-d-02',
    emoji: '🕒',
    title: { ko:'초급 세밀: -고 싶다 / -(으)ㄹ 거예요 뉘앙스', en:'Nuance: -고 싶다 vs. -(으)ㄹ 거예요' },
    tagline: { ko:'단순 희망 vs 확정된 미래 계획', en:'Wishes vs. confirmed future plans.' },
    blurb: { ko:'하고 싶은 막연한 소원 vs 내일 반드시 할 계획. 두 표현을 언제 써야 하는지 문맥으로 구분하는 훈련입니다.',
             en:'A wish in your heart vs. a scheduled plan. Learn to pick the right one from context clues.' },
    level: 'Beginner',
    needs: 'bg-10',
    lessons: [
      /* ── 1강 ──────────────────────────────────────────────
         한 표현을 끝까지 붙든다. 뜻 → 만드는 법 두 단계 → 표 → 예문 → 함정 순서. */
      {
        id: 'bg-d-02-01',
        title: { ko:'1강. 마음속 바람 -고 싶다', en:'Lesson 1. A wish in your heart: -고 싶다' },
        minutes: 5,
        blocks: [
          { t:'text', h:'What does this express?',
            md:'**-고 싶다** expresses a **wish in your heart**.\n\nNot a locked calendar event, but something you want to do: “I want to…” It pairs naturally with words like “someday” (언젠가), “later” (나중에), or “sometime” (한 번쯤).' },

          { t:'text', h:'Step 1 — Drop 다 from the dictionary form',
            md:'가**다** → 가\n먹**다** → 먹\n\nThe part left behind is the **stem**. Every Korean ending attaches here.' },

          { t:'text', h:'Step 2 — Attach -고 싶어요 to the stem',
            md:'가 + **고 싶어요** → 가고 싶어요\n먹 + **고 싶어요** → 먹고 싶어요\n\nNo vowel harmony, no 받침 rules: it never changes shape. That makes it one of the friendliest patterns in Korean.' },

          { t:'table',
            head:['Dictionary','Stem','-고 싶어요'],
            rows:[
              ['가다 — to go','가','가**고 싶어요**'],
              ['먹다 — to eat','먹','먹**고 싶어요**'],
              ['보다 — to watch','보','보**고 싶어요**'],
              ['살다 — to live','살','살**고 싶어요**'],
              ['공부하다 — to study','공부하','공부하**고 싶어요**'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'언젠가 제주도에 가고 싶어요.', tip:'I want to go to Jeju someday. — no date set yet' },
            { ch:'따뜻한 국물이 먹고 싶어요.', tip:'I feel like having something warm and soupy.' },
            { ch:'그 영화 꼭 보고 싶어요.', tip:'I really want to see that film.' },
            { ch:'한국에서 한 달쯤 살고 싶어요.', tip:'I want to live in Korea for about a month.' },
            { ch:'저는 한국어를 더 잘하고 싶어요.', tip:'I want to get better at Korean.' },
          ]},

          { t:'note', md:'**Do not use this for other people’s wishes.** When someone else wants to do something, use **-고 싶어하다**:\n\n동생이 가고 싶**어해요**. (○)\n동생이 가고 싶어요. (✕)\n\nKorean avoids stating another person’s inner feelings directly — it steps back and says “they appear to want to”.' },

          { t:'text', h:'When to use and when not to use',
            md:'**Use it** — when you haven’t decided, but your heart leans that way:\n오늘 좀 쉬**고 싶어요**. (I want to rest today.)\n\n**Don’t use it** — for confirmed schedules. That’s -(으)ㄹ 거예요:\n세 시에 출발하고 싶어요. (✕ Sounds like a wish when you already have an appointment)\n세 시에 출발**할 거예요**. (○ I am going to leave at 3.)\n\n**Don’t use it** — for other people’s minds. Switch to -고 싶어하다.' },

          { t:'cloze', sentence:'나중에 세계 여행을 [가고 싶어요].', answer:'가고 싶어요',
            meaning:'I want to travel the world someday.',
            options:['갈 거예요','가고 싶어요','가려고 해요','가기로 했어요'],
            keys:['가고 싶어요','갈 거예요','가려고 해요','가기로 했어요'],
            why:'“나중에” (someday / later) shows nothing is fixed yet — it is purely a wish, so **가고 싶어요**. 갈 거예요 means a plan is set, 가려고 해요 means intending to, and 가기로 했어요 means scheduled/decided.' },

          { t:'cloze', sentence:'오늘 저녁에는 피자를 [먹고 싶어요].', answer:'먹고 싶어요',
            meaning:'I feel like eating pizza tonight.',
            options:['먹을 거예요','먹으려고 해요','먹고 싶어요','먹기로 했어요'],
            keys:['먹고 싶어요','먹을 거예요','먹으려고 해요','먹기로 했어요'],
            why:'If you already ordered it, you would say **먹을 거예요**. Here it’s just a craving in your mind, so **먹고 싶어요**.' },

          { t:'type', q:'배우다 (to learn) — “한국 요리를 ___ .” Make it a wish: “I want to learn…”',
            answer:'배우고 싶어요',
            keys:['배우고 싶어요','배울 거예요','배우려고 해요','배우기로 했어요'],
            why:'Attach -고 싶어요 directly to the stem 배우. No stem change needed.' },

          { t:'choice', q:'Your younger sibling also wants to go. Which one is correct?',
            options:['동생도 가고 싶어요','동생도 가고 싶어해요','동생도 가려고 해요'], answer:1,
            why:'When talking about someone else’s wish, use **-고 싶어하다** → 가고 싶어해요.' },

          { t:'speak', say:'저는 언젠가 제주도에 가서 한 달쯤 살고 싶어요.', rom:'jeo-neun eon-jen-ga je-ju-do-e ga-seo han dal-jjeum sal-go sip-eo-yo',
            q:'Read out loud warmly: “Someday I want to go to Jeju and live there for about a month.”' },
        ],
      },

      /* ── 2강 ────────────────────────────────────────────── */
      {
        id: 'bg-d-02-02',
        title: { ko:'2강. 정해진 일정 -(으)ㄹ 거예요', en:'Lesson 2. Scheduled plans: -(으)ㄹ 거예요' },
        minutes: 5,
        blocks: [
          { t:'text', h:'What does this express?',
            md:'**-(으)ㄹ 거예요** expresses a **scheduled or confirmed plan**.\n\nNot just a wish, but a locked plan: you bought the ticket, made the appointment, or firmly resolved to do it. It pairs with specific time words like “tomorrow” (내일), “next week” (다음 주), or “at 3:00” (세 시에).' },

          { t:'text', h:'Step 1 — Check for a final consonant (받침)',
            md:'만나**다** → 만나 … **no 받침**\n읽**다** → 읽 … **has 받침** (ㄱ)\n\nThis single check determines everything.' },

          { t:'text', h:'Step 2 — No 받침 → -ㄹ 거예요 / Has 받침 → -을 거예요',
            md:'No 받침 → stem + **ㄹ 거예요**\n만나 + ㄹ 거예요 → **만날 거예요**\n\nHas 받침 → stem + **을 거예요**\n읽 + 을 거예요 → **읽을 거예요**' },

          { t:'table',
            head:['Dictionary','Stem','받침','-(으)ㄹ 거예요'],
            rows:[
              ['만나다 — to meet','만나라','none','만나**ㄹ** → 만날 거예요'],
              ['보다 — to watch','보','none','보**ㄹ** → 볼 거예요'],
              ['읽다 — to read','읽','has ㄱ','읽**을** 거예요'],
              ['먹다 — to eat','먹','has ㄱ','먹**을** 거예요'],
              ['살다 — to live','살','ends in ㄹ','살 거예요 (ㄹ stays as is)'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'내일 오전 열 시에 친구를 만날 거예요.', tip:'I am meeting a friend at 10 tomorrow. — appointment made' },
            { ch:'이번 주말에는 집에서 영화를 볼 거예요.', tip:'I am going to watch films at home this weekend.' },
            { ch:'올해는 책을 오십 권 읽을 거예요.', tip:'I am going to read fifty books this year.' },
            { ch:'점심은 학교 앞에서 먹을 거예요.', tip:'I will eat lunch in front of the school.' },
            { ch:'다음 달부터 서울에서 살 거예요.', tip:'I am going to live in Seoul from next month.' },
          ]},

          { t:'note', md:'**If the stem already ends in ㄹ, do not add 을.**\n\n살다 → 살 거예요 (○) / 살을 거예요 (✕)\n만들다 → 만들 거예요 (○)\n\nBecause ㄹ is already there, leave it as is.' },

          { t:'text', h:'When to use and when not to use',
            md:'**Use it** — when the time is set, tickets are booked, or the plan is firm:\n다음 주에 이사**할 거예요**.\n\n**Don’t use it** — when nothing is decided yet. Use -고 싶어요 instead.\n\n**Related patterns** — **-(으)려고 해요** means “planning/thinking of”, and **-기로 했어요** means “decided on”. All three look ahead, but with different levels of firmness.' },

          { t:'cloze', sentence:'내일 오전 10시에 친구를 [만날 거예요].', answer:'만날 거예요',
            meaning:'I am going to meet a friend tomorrow at 10 AM.',
            options:['만나고 싶어요','만날 거예요','만나려고 해요','만났어요'],
            keys:['만날 거예요','만나고 싶어요','만나려고 해요','만났어요'],
            why:'“내일 10시” (tomorrow at 10) sets an exact appointment → **만날 거예요**. 만났어요 is past tense, 만나고 싶어요 is just a wish, and 만나려고 해요 means thinking of it.' },

          { t:'cloze', sentence:'다음 달부터 서울에서 [살 거예요].', answer:'살 거예요',
            meaning:'I am going to live in Seoul from next month.',
            options:['살고 싶어요','살 거예요','살려고 해요','살았어요'],
            keys:['살 거예요','살고 싶어요','살려고 해요','살았어요'],
            why:'“다음 달부터” (from next month) sets a specific timeline. The stem 살 already ends in ㄹ, so it attaches directly: **살 거예요**.' },

          { t:'type', q:'읽다 (to read) — “올해는 책을 오십 권 ___ .” Conjugate into -(으)ㄹ 거예요.',
            answer:'읽을 거예요',
            keys:['읽을 거예요','읽고 싶어요','읽으려고 해요','읽었어요'],
            why:'읽 has a 받침 (ㄱ), so attach **을 거예요** → 읽을 거예요.' },

          { t:'pair', q:'Match each dictionary verb with its -(으)ㄹ 거예요 form.',
            pairs:[
              ['만나다 (no 받침)','만날 거예요'],
              ['읽다 (받침 ㄱ)','읽을 거예요'],
              ['살다 (받침 ㄹ)','살 거예요'],
              ['먹다 (받침 ㄱ)','먹을 거예요'],
            ]},

          { t:'order', q:'Build “I am going to meet a friend tomorrow.”',
            tokens:['내일','친구를','만날 거예요'], answer:['내일','친구를','만날 거예요'] },

          { t:'speak', say:'다음 주 월요일에 서울역에서 기차를 타고 부산에 갈 거예요.', rom:'da-eum ju wol-yo-il-e seoul-yeog-e-seo gi-cha-reul ta-go bu-san-e gal geo-ye-yo',
            q:'Say it out loud with clear pacing: “Next Monday, I am taking the train from Seoul Station to Busan.”' },
        ],
      },

      /* ── 3강 ────────────────────────────────────────────── */
      {
        id: 'bg-d-02-03',
        title: { ko:'3강. 둘 중 무엇을 쓸까', en:'Lesson 3. Choosing between the two' },
        minutes: 4,
        blocks: [
          { t:'text', h:'The single deciding question',
            md:'**Is it decided, or still just in your heart?**\n\nIf the ticket is bought or appointment booked, use **-(으)ㄹ 거예요**. If it’s still just a wish, use **-고 싶어요**. The time word in the sentence almost always gives away the answer.' },

          { t:'table',
            head:['Clue in sentence','Chosen pattern','Example'],
            rows:[
              ['언젠가 · 나중에 · 한 번쯤 (someday)','-고 싶어요','언젠가 가**고 싶어요**'],
              ['내일 · 다음 주 · 세 시에 (specific time)','-(으)ㄹ 거예요','내일 **갈 거예요**'],
              ['표를 샀어요 · 약속했어요 (booked)','-(으)ㄹ 거예요','벌써 **갈 거예요**'],
              ['그냥 마음이 그래요 (just feel like it)','-고 싶어요','그냥 쉬**고 싶어요**'],
            ]},

          { t:'chars', wide:true, items:[
            { ch:'언젠가 유럽에 가고 싶어요.', tip:'Someday I want to go to Europe. — no fixed plan' },
            { ch:'다음 달에 유럽에 갈 거예요.', tip:'I am going to Europe next month. — ticket purchased' },
            { ch:'한국 음식을 배우고 싶어요.', tip:'I want to learn Korean cooking. — wish' },
            { ch:'토요일에 요리 수업에 갈 거예요.', tip:'I am going to a cooking class on Saturday. — registered' },
          ]},

          { t:'note', md:'**Sometimes both are completely natural.**\n\n“주말에 쉬고 싶어요” and “주말에 쉴 거예요” are both valid. The first is a wish (“I want to rest”), and the second is a decision (“I am going to rest”). It’s about **the speaker’s attitude**.' },

          { t:'cloze', sentence:'아직 아무것도 안 정했지만 언젠가 유럽에 [가고 싶어요].', answer:'가고 싶어요',
            meaning:'Nothing is decided yet, but someday I want to go to Europe.',
            options:['갈 거예요','가고 싶어요','갔을 거예요','가고 싶어해요'],
            keys:['가고 싶어요','갈 거예요','갔을 거예요','가고 싶어해요'],
            why:'“아직 아무것도 안 정했지만” (nothing is decided yet) is the clue — with no set schedule, it is a wish: **가고 싶어요**.' },

          { t:'cloze', sentence:'비행기표를 벌써 샀어요. 다음 달에 유럽에 [갈 거예요].', answer:'갈 거예요',
            meaning:'I already bought the ticket. I am going to Europe next month.',
            options:['가고 싶어요','갈 거예요','가고 싶어해요','가는 거예요'],
            keys:['갈 거예요','가고 싶어요','가고 싶어해요','가는 거예요'],
            why:'The ticket is bought and month is set. It is a scheduled plan, so **갈 거예요**.' },

          { t:'cloze', sentence:'친구가 한국에 유학을 [가고 싶어해요].', answer:'가고 싶어해요',
            meaning:'My friend wants to go study in Korea.',
            options:['가고 싶어요','갈 거예요','가고 싶어해요','가고 싶습니다'],
            keys:['가고 싶어해요','가고 싶어요','갈 거예요','가고 싶습니다'],
            why:'The subject is a friend (third person). For someone else’s desire, use **-고 싶어하다**.' },

          { t:'pair', q:'Match each situation with the matching expression.',
            pairs:[
              ['An undecided wish','-고 싶어요'],
              ['A scheduled plan with a date','-(으)ㄹ 거예요'],
              ['Another person’s wish','-고 싶어해요'],
            ]},

          { t:'speak', say:'지금은 그냥 가고 싶은 마음이지만, 돈을 모으면 내년에는 꼭 갈 거예요.', rom:'ji-geum-eun geu-nyang ga-go sip-eun ma-eum-i-ji-man, don-eul mo-eu-myeon nae-nyeon-e-neun kkok gal geo-ye-yo',
            q:'First half is a wish, second half is a firm plan: “Right now it is just a wish, but when I save money, I will definitely go next year.”' },
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
    needs: 'bg-irr-02',
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

  // ════════════════════════════════════════════════
  // 🟡 중급 갈래 코스 (docs/curriculum-upper.md) — 예문 만들기 갈래 하나 = 코스 하나
  // ════════════════════════════════════════════════
  {
    id: 'im-c48',
    emoji: '🔮',
    title: { ko: '중급 48: 추측과 예상', en: 'Intermediate 48: Guessing and expecting' },
    tagline: { ko: '보이는 것 · 미루어 짐작하는 것 · 걱정하는 것', en: 'What you see, what you infer, what you worry about' },
    blurb: { ko: '-아/어 보이다, -(으)ㄴ/는 모양이다, -(으)ㄹ 텐데 … 눈으로 본 인상인지, 흔적을 보고 미루어 짐작하는지에 따라 말이 갈립니다.',
             en: 'Looks like, seems that, must be… Korean picks a different ending depending on whether you saw it yourself or are inferring from clues.' },
    level: 'Intermediate',
    needs: 'im-03-02',
    lessons: [
      {
        id: 'im-c48-01',
        title: { ko: '1강. 보이는 대로 vs 미루어 짐작 (-아/어 보이다 · -는 모양이다)', en: 'Lesson 1. What you see vs what you infer' },
        minutes: 5,
        blocks: [
          { t:'text', md:'### 두 가지 「~인 것 같다」\n\n**-아/어 보이다** — 지금 **눈으로 본 인상**을 그대로 말합니다.\n> 오늘 좀 피곤해 **보여요**. (얼굴을 보고)\n\n**-(으)ㄴ/는 모양이다** — 눈앞의 **흔적**을 보고 **미루어 짐작**합니다. 주로 남의 일에 씁니다.\n> 불이 꺼진 걸 보니 아무도 없는 **모양이에요**. (불 꺼진 것 → 사람이 없다고 짐작)\n\n가르는 질문 하나: **그 모습을 직접 보고 있나, 아니면 다른 단서로 추리하나?**' },
          { t:'cloze', sentence:'새로 산 가방이 정말 [비싸 보여요].', answer:'비싸 보여요',
            meaning:'Your new bag looks really expensive.',
            options:['비싸 보여요','비싼 모양이에요','비쌀 텐데요','비싸거든요'],
            keys:['비싸 보여요','비싼 모양이에요','비쌀 텐데요','비싸거든요'],
            why:'가방을 **눈으로 보고** 받은 인상이므로 -아/어 보이다.' },
          { t:'cloze', sentence:'민수 씨가 계속 하품을 하네요. 어젯밤에 잠을 못 [잔 모양이에요].', answer:'잔 모양이에요',
            meaning:'Minsu keeps yawning. He must not have slept last night.',
            options:['잔 모양이에요','자 보여요','자거든요','잘 텐데요'],
            keys:['잔 모양이에요','자 보여요','자거든요','잘 텐데요'],
            why:'잠을 못 잔 것은 직접 본 게 아니라 **하품이라는 단서**로 짐작한 것 → -(으)ㄴ 모양이다. 지난 일이라 「잔」.' },
          { t:'cloze', sentence:'길에 우산 쓴 사람이 많은 걸 보니 비가 [오는 모양이에요].', answer:'오는 모양이에요',
            meaning:'Lots of people have umbrellas — it must be raining.',
            options:['오는 모양이에요','와 보여요','올걸요','오거든요'],
            keys:['오는 모양이에요','와 보여요','올걸요','오거든요'],
            why:'「-(으)ㄴ/는 걸 보니」 뒤에는 짐작을 붙이는 게 자연스럽습니다. 지금 일이라 「오는」.' },
          { t:'choice', q:'친구 얼굴이 빨개요. 직접 보면서 하는 말로 알맞은 것은?',
            options:['얼굴이 빨개 보여요. 괜찮아요?','얼굴이 빨간 모양이에요. 괜찮아요?','얼굴이 빨갈걸요. 괜찮아요?'], answer:0,
            why:'눈앞의 친구에게 **보이는 대로** 말할 때는 -아/어 보이다. 「모양이다」는 단서로 추리할 때라 눈앞의 상대에게는 어색합니다.' },
          { t:'note', md:'**자주 하는 실수** — 「-는 모양이다」를 **나 자신**에게 쓰지 않습니다.\n\n❌ 제가 배가 고픈 모양이에요.\n✅ 배가 고파요. / (남을 보고) 배가 고픈 모양이에요.\n\n내 상태는 짐작할 필요가 없으니까요.' },
          { t:'speak', say:'가게에 사람이 많은 걸 보니 여기 음식이 맛있는 모양이에요.', q:'줄 선 가게 앞에서 친구에게 말하듯 자연스럽게 말해 보세요.' },
        ],
      },
      {
        id: "im-c48-02", title: "2강. 짐작과 의도를 담은 연결 (-ㄹ 텐데 · -ㄹ 테니까)", minutes: 4,
        blocks: [
          {"t":"text","h":"걱정하며 권하는 말, 근거를 대며 시키는 말","md":"**-(으)ㄹ 텐데** 는 앞 상황을 **짐작하면서 걱정하거나 배경으로 깔 때** 씁니다.\\n> 배고플 텐데 어서 밥부터 드세요.\\n\\n**-(으)ㄹ 테니까** 는 내가 **할 일을 약속하거나 확신하는 이유**를 대며 상대에게 제안·부탁할 때 씁니다.\\n> 제가 준비할 테니까 편하게 오세요."},
          {"t":"table","head":["어간 받침","사전형","-(으)ㄹ 텐데","-(으)ㄹ 테니까"],"rows":[["없음","가다 — to go","갈 텐데","갈 테니까"],["있음","먹다 — to eat","먹을 텐데","먹을 테니까"],["ㄹ 받침","만들다 — to make","만들 텐데","만들 테니까"],["ㅂ 불규칙","돕다 — to help","도울 텐데","도울 테니까"]]},
          {"t":"chars","wide":true,"items":[{"ch":"많이 바쁘실 텐데 와 주셔서 감사합니다.","tip":"You must be busy, thank you for coming."},{"ch":"길이 막힐 테니까 지하철을 타고 가세요.","tip":"Traffic will be heavy, so please take the subway."},{"ch":"제가 청소할 테니까 너는 빨래를 해 줄래?","tip":"I will clean up, so could you do the laundry?"}]},
          {"t":"cloze","sentence":"피곤할 [텐데] 일찍 들어가서 쉬세요.","answer":"텐데","meaning":"You must be tired, so go home early and rest.","options":["텐데","테니까","거예요","거든요"],"keys":["텐데","테니까","거예요","거든요"],"why":"상대의 피곤함을 짐작하고 걱정하며 권하는 상황이므로 **-(으)ㄹ 텐데**가 어울립니다."},
          {"t":"choice","q":"내가 할 일을 맡아서 약속하며 상대에게 부탁할 때 알맞은 것은?","options":["제가 짐을 들 테니까 앞장서세요.","제가 짐을 들 텐데 앞장서세요.","제가 짐을 들 모양인데 앞장서세요."],"answer":0,"why":"말하는 사람의 의지나 할 일을 조건으로 걸 때는 **-(으)ㄹ 테니까**를 씁니다."},
          {"t":"type","q":"춥다 — 「밖이 ___ 따뜻하게 입고 나가세요.」 알맞은 형태로 쓰세요.","answer":"추울 테니까","keys":["추울 테니까","추울 텐데","춥겠으니까"],"why":"ㅂ 불규칙(추우-) 뒤에 이유와 제안을 연결하는 **-ㄹ 테니까**가 붙어 **추울 테니까**가 됩니다."},
          {"t":"order","q":"「제가 예약할 테니까 걱정하지 마세요.」 를 순서대로 만들어 보세요.","tokens":["제가","예약할 테니까","걱정하지 마세요."],"answer":["제가","예약할 테니까","걱정하지 마세요."]},
          {"t":"note","md":"**구분하기 팁**\\n\\n- **-(으)ㄹ 텐데**: 뒤에 주로 **위로, 배려, 걱정**이 이어집니다.\\n- **-(으)ㄹ 테니까**: 뒤에 주로 **명령(-(으)세요), 청유(-(으)ㅂ시다)**가 이어집니다."},
          {"t":"speak","say":"제가 커피를 살 테니까 지수 씨는 자리 좀 맡아 주세요.","q":"내가 커피를 사겠다는 약속을 자연스럽게 건네 보세요."},
        ],
      },
      {
        id: "im-c48-03", title: "3강. 헷갈리는 짐작 표현 가르기 (-ㄹ걸요 · -ㄹ지도 몰라요)", minutes: 4,
        blocks: [
          {"t":"text","h":"가벼운 반박과 불확실한 가능성","md":"**-(으)ㄹ걸요** 는 상대의 생각과 달리 아마 그럴 거라고 **가볍게 짐작하며 말할 때** 씁니다. 끝을 살짝 올립니다.\\n> 지금쯤이면 부산에 도착했을걸요.\\n\\n**-(으)ㄹ지도 모르다** 는 확실하진 않지만 **그럴 가능성도 배제할 수 없을 때** 씁니다.\\n> 오후에 소나기가 올지도 몰라요."},
          {"t":"table","head":["표현","확신의 정도","자주 함께 쓰는 말","예문"],"rows":[["-(으)ㄹ걸요","비교적 높음 (가벼운 짐작)","아마, 벌써, 아직","지금 가면 문 닫았을걸요."],["-(으)ㄹ지도 몰라요","반반 (낮은 가능성)","혹시, 어쩌면","길이 막힐지도 몰라요."],["-(으)ㄴ/는 줄 몰랐다","예상 밖의 사실 발견","전혀, 이렇게","이렇게 매울 줄 몰랐어요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"민우 씨는 이미 퇴근했을걸요.","tip":"Minwoo probably went home already."},{"ch":"혹시 늦을지도 모르니까 먼저 출발하세요.","tip":"I might be late, so please go ahead first."},{"ch":"그 사람이 한국 사람인 줄 몰랐어요.","tip":"I did not know they were Korean."}]},
          {"t":"cloze","sentence":"저 식당은 월요일마다 쉬니까 오늘 문을 안 [열었을걸요].","answer":"열었을걸요","meaning":"That restaurant is closed on Mondays, so it is probably not open today.","options":["열었을걸요","열었을 텐데요","열 줄 몰랐어요","열어 보였어요"],"keys":["열었을걸요","열었을 텐데요","열 줄 몰랐어요","열어 보였어요"],"why":"자신의 짐작을 근거로 상대에게 가볍게 알려 줄 때는 **-(으)ㄹ걸요**가 자연스럽습니다."},
          {"t":"choice","q":"비가 올 확률이 조금 있어서 우산을 챙기라고 권하려 합니다. 알맞은 것은?","options":["비가 올지도 모르니까 우산 챙기세요.","비가 올걸요 우산 챙기세요.","비가 올 줄 몰라서 우산 챙기세요."],"answer":0,"why":"일어날 가능성이 있어 대비하게 할 때는 **-(으)ㄹ지도 모르다**가 알맞습니다."},
          {"t":"type","q":"오다 — 「혹시 손님이 일찍 ___ 미리 정리해 둡시다.」 알맞은 형태로 쓰세요.","answer":"올지도 모르니까","keys":["올지도 모르니까","올지도 몰라서","올걸요"],"why":"가능성을 나타내는 **-ㄹ지도 모르다**에 이유 연결 어미 **-(으)니까**를 합쳐 씁니다."},
          {"t":"order","q":"「저도 이렇게 복잡할 줄 몰랐어요.」 를 순서대로 배열해 보세요.","tokens":["저도","이렇게","복잡할 줄","몰랐어요."],"answer":["저도","이렇게","복잡할 줄","몰랐어요."]},
          {"t":"note","md":"**주의할 점**\\n\\n**-(으)ㄹ걸요** (추측)와 **-(으)ㄹ걸 그랬어요** (후회)는 모양이 비슷하지만 완전히 다릅니다.\\n- 살걸요? = 아마 샀을 텐데요?\\n- 살걸 그랬어요 = (안 사서) 살 걸 하고 후회해요."},
          {"t":"speak","say":"그 영화는 인기가 많아서 벌써 매진되었을걸요.","q":"친구에게 확신 섞인 짐작을 전하듯 가볍게 말해 보세요."},
        ],
      },
      {
        id: "im-c48-04", title: "4강. 실전 대화에서 추측과 배려 꺼내 쓰기", minutes: 5,
        blocks: [
          {"t":"text","h":"배려와 추측을 자연스럽게 엮기","md":"한국어에서 짐작 표현은 상대방의 부담을 덜어 주는 **배려의 완곡어법**으로 자주 쓰입니다.\\n\\n상대의 상황을 미루어 짐작해 주면 대화가 한층 부드러워집니다."},
          {"t":"chars","wide":true,"items":[{"ch":"먼 길 오시느라 힘드셨을 텐데 잠깐 앉으세요.","tip":"It must have been a tiring journey, please have a seat."},{"ch":"회의 자료는 제가 출력할 테니까 과장님은 확인만 해 주세요.","tip":"I will print the meeting materials, so please just review them."},{"ch":"날씨가 쌀쌀한 걸 보니 겨울이 성큼 다가온 모양이에요.","tip":"Seeing the chilly weather, winter seems to have arrived."}]},
          {"t":"cloze","sentence":"많이 피곤하셨을 [텐데] 쉬지도 못하고 도와주셔서 감사해요.","answer":"텐데","meaning":"You must have been exhausted, thank you for helping without resting.","options":["텐데","테니까","걸요","모양이에요"],"keys":["텐데","테니까","걸요","모양이에요"],"why":"상대방의 힘든 상황을 짐작하고 감사를 표하는 배경에는 **-(으)ㄹ 텐데**가 적절합니다."},
          {"t":"choice","q":"직장 동료와 역할을 나누어 일할 때 가장 알맞은 말은?","options":["제가 발표를 준비할 테니까 자료 조사를 부탁드려도 될까요?","제가 발표를 준비할 텐데 자료 조사를 부탁드려도 될까요?","제가 발표를 준비했을걸요 자료 조사를 부탁드려도 될까요?"],"answer":0,"why":"자신의 역할을 명확히 제시하면서 협조를 구할 때는 **-(으)ㄹ 테니까**를 씁니다."},
          {"t":"cloze","sentence":"비행기 표가 벌써 다 [매진되었을지도 몰라요]. 서둘러 예약합시다.","answer":"매진되었을지도 몰라요","meaning":"Tickets might already be sold out. Let us hurry and book.","options":["매진되었을지도 몰라요","매진되었을 테니까요","매진되어 보여요","매진된 줄 알았어요"],"keys":["매진되었을지도 몰라요","매진되었을 테니까요","매진되어 보여요","매진된 줄 알았어요"],"why":"표가 매진되었을 가능성이 있으니 서두르자고 할 때는 **-(으)ㄹ지도 모르다**가 자연스럽습니다."},
          {"t":"type","q":"끝나다 — 「지금 가면 행사가 벌써 ___ .」 가벼운 짐작을 나타내는 형태로 쓰세요.","answer":"끝났을걸요","keys":["끝났을걸요","끝났을 텐데요","끝날걸요"],"why":"이미 끝났을 것이라는 과거 사실에 대한 가벼운 짐작이므로 과거형 **-았/었을걸요**를 씁니다."},
          {"t":"order","q":"「길이 미끄러울 테니까 조심해서 걸으세요.」 를 순서대로 만들어 보세요.","tokens":["길이","미끄러울 테니까","조심해서","걸으세요."],"answer":["길이","미끄러울 테니까","조심해서","걸으세요."]},
          {"t":"note","md":"**실전 팁**\\n직장에서 상대방에게 부탁하거나 권할 때 **-(으)ㄹ 텐데**로 상대의 입장을 먼저 헤아려 준 뒤 말을 꺼내면 훨씬 공손하게 들립니다."},
          {"t":"speak","say":"갑자기 찾아와서 당황하셨을 텐데 반갑게 맞아 주셔서 고마워요.","q":"상대의 입장을 먼저 배려하며 고마운 마음을 전해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c49',
    emoji: '⚖️',
    title: { ko: '중급 49: 대조를 나타낼 때', en: 'Intermediate 49: Expressing Contrast' },
    tagline: { ko: '인정하면서 뒤집기 · 나란히 견주기 · 그런데도', en: 'Conceding then contrasting, comparing side-by-side, yet still' },
    blurb: { ko: '-기는 하지만, -(으)ㄴ/는 반면에, -(으)ㄴ/는데도 … 앞말을 인정하며 단서를 달거나 두 대상을 나란히 견줄 때 씁니다.', en: 'While it is true that, on the other hand, even though… used to contrast two facets or acknowledge a fact before introducing a twist.' },
    level: 'Intermediate',
    needs: 'im-c48',
    lessons: [
      {
        id: "im-c49-01", title: "1강. 일단 인정하고 뒤집기 (-기는 하지만)", minutes: 4,
        blocks: [
          {"t":"text","h":"한발 물러서며 덧붙이는 대조","md":"**-기는 하지만** 은 상대의 말이나 앞의 사실을 **일단 인정하고 나서, 다른 면을 덧붙일 때** 씁니다.\\n> 비싸**기는 하지만** 품질은 좋아요.\\n\\n단순히 반대를 말하는 「-지만」보다 훨씬 부드럽고 설득력 있게 들립니다. 같은 용언을 반복해 **-기는 -지만** 형태로도 자주 씁니다.\\n> 먹**기는 먹었지만** 배가 안 차요."},
          {"t":"table","head":["구분","사전형","-기는 하지만","과거 (-기는 했지만)"],"rows":[["동사 (받침 없음)","가다 — to go","가기는 하지만","가기는 했지만"],["동사 (받침 있음)","먹다 — to eat","먹기는 하지만","먹기는 했지만"],["형용사","비싸다 — to be expensive","비싸기는 하지만","비싸기는 했지만"],["형용사 (받침 있음)","작다 — to be small","작기는 하지만","작기는 했지만"]]},
          {"t":"chars","wide":true,"items":[{"ch":"일이 힘들기는 하지만 보람이 있어요.","tip":"The work is hard, but it is rewarding."},{"ch":"한국어가 어렵기는 하지만 정말 재미있어요.","tip":"Korean is difficult, but it is really interesting."},{"ch":"듣기는 들었지만 잘 이해하지 못했어요.","tip":"I heard it, but I did not understand well."}]},
          {"t":"cloze","sentence":"월세가 조금 [비싸기는 하지만] 회사에서 가까워서 좋아요.","answer":"비싸기는 하지만","meaning":"The rent is a bit expensive, but I like it because it is close to the company.","options":["비싸기는 하지만","비싼 반면에","비싼데도","비쌀 텐데"],"keys":["비싸기는 하지만","비싼 반면에","비싼데도","비쌀 텐데"],"why":"비싸다는 점을 인정하면서 가까워서 좋다는 긍정적인 면을 덧붙일 때 **-기는 하지만**이 가장 자연스럽습니다."},
          {"t":"choice","q":"상대방의 의견에 공감하며 조심스럽게 다른 생각을 말할 때 알맞은 것은?","options":["좋은 생각이기는 하지만 예산이 좀 부족해요.","좋은 생각인 반면에 예산이 좀 부족해요.","좋은 생각인데도 예산이 좀 부족해요."],"answer":0,"why":"앞의 제안을 인정하면서 현실적인 문제를 덧붙일 때는 **-기는 하지만**을 씁니다."},
          {"t":"type","q":"맛있다 — 「음식이 ___ 양이 너무 적어요.」 일단 인정하고 덧붙이는 형태로 쓰세요.","answer":"맛있기는 하지만","keys":["맛있기는 하지만","맛있기는 한데","맛있지만"],"why":"형용사 어간 '맛있-' 뒤에 **-기는 하지만**을 붙여 씁니다."},
          {"t":"order","q":"「시간이 걸리기는 하지만 꼼꼼하게 해 볼게요.」 를 순서대로 만들어 보세요.","tokens":["시간이","걸리기는 하지만","꼼꼼하게","해 볼게요."],"answer":["시간이","걸리기는 하지만","꼼꼼하게","해 볼게요."]},
          {"t":"note","md":"**말할 때의 줄임꼴**\\n\\n구어 대화에서는 **-기는 하지만** 대신 **-기는 한데** 또는 줄여서 **-긴 한데**를 정말 많이 씁니다.\\n> 좋**긴 한데** 좀 비싸요."},
          {"t":"speak","say":"그 옷이 예쁘기는 하지만 저한테는 조금 작아요.","q":"예쁜 점을 인정하되 작다는 아쉬움을 부드럽게 표현해 보세요."},
        ],
      },
      {
        id: "im-c49-02", title: "2강. 두 모습을 나란히 견주기 (-(으)ㄴ/는 반면에)", minutes: 4,
        blocks: [
          {"t":"text","h":"장점과 단점, 두 대상을 나란히","md":"**-(으)ㄴ/는 반면에** 는 한쪽은 이런 반면 다른 쪽은 정반대라고 **두 가지 사실을 나란히 대비할 때** 씁니다.\\n> 형은 조용한 **반면에** 동생은 활발해요.\\n\\n동사에는 **-는 반면에**, 형용사에는 **-(으)ㄴ 반면에**가 붙습니다."},
          {"t":"table","head":["품사","사전형","연결 형태"],"rows":[["동사 (현재)","일하다 — to work","일하**는 반면에**"],["동사 (과거)","벌다 — to earn","벌**어들인 반면에**"],["형용사 (받침 없음)","크다 — to be big","크**ㄴ 반면에** (큰 반면에)"],["형용사 (받침 있음)","적다 — to be few/little","적**은 반면에**"]]},
          {"t":"chars","wide":true,"items":[{"ch":"이 스마트폰은 성능이 뛰어난 반면에 가격이 비싸요.","tip":"This smartphone has great performance, whereas it is expensive."},{"ch":"낮에는 따뜻한 반면에 밤에는 기온이 뚝 떨어져요.","tip":"While it is warm during the day, temperature drops sharply at night."},{"ch":"지하철은 빠른 반면에 출퇴근 시간에는 너무 복잡해요.","tip":"The subway is fast, but on the other hand it is very crowded during rush hour."}]},
          {"t":"cloze","sentence":"그 직업은 월급이 [적은 반면에] 시간적 여유가 많아요.","answer":"적은 반면에","meaning":"That job has low pay, whereas there is plenty of free time.","options":["적은 반면에","적기는 하지만","적은데도","적을 테니까"],"keys":["적은 반면에","적기는 하지만","적은데도","적을 테니까"],"why":"월급의 단점과 시간의 장점을 나란히 견주어 대비하므로 **-(으)ㄴ 반면에**가 적절합니다."},
          {"t":"choice","q":"두 사람의 성격을 나란히 비교하여 설명할 때 가장 알맞은 것은?","options":["민우는 말을 잘하는 반면에 유진이는 경청을 잘해요.","민우는 말을 잘하기는 하지만 유진이는 경청을 잘해요.","민우는 말을 잘하는데도 유진이는 경청을 잘해요."],"answer":0,"why":"두 사람의 서로 다른 특성을 나란히 대비할 때는 **-(으)ㄴ/는 반면에**가 가장 잘 어울립니다."},
          {"t":"type","q":"편하다 — 「도심은 교통이 ___ 공기가 안 좋아요.」 나란히 대비하는 형태로 쓰세요.","answer":"편한 반면에","keys":["편한 반면에","편리한 반면에","편하기는 하지만"],"why":"형용사 '편하다'에 받침이 없으므로 **-ㄴ 반면에**가 붙어 **편한 반면에**가 됩니다."},
          {"t":"order","q":"「장점이 많은 반면에 단점도 적지 않습니다.」 를 순서대로 만들어 보세요.","tokens":["장점이","많은 반면에","단점도","적지 않습니다."],"answer":["장점이","많은 반면에","단점도","적지 않습니다."]},
          {"t":"note","md":"**조사 '에' 생략**\\n\\n글이나 말에서 '에'를 빼고 **-(으)ㄴ/는 반면** 으로 쓰기도 합니다.\\n> 가격이 저렴한 **반면**, 배송이 느려요."},
          {"t":"speak","say":"온라인 쇼핑은 편리한 반면에 실물을 직접 볼 수 없어요.","q":"장점과 단점을 차분히 비교하듯 말해 보세요."},
        ],
      },
      {
        id: "im-c49-03", title: "3강. 기대와 어긋난 결과 (-(으)ㄴ/는데도)", minutes: 4,
        blocks: [
          {"t":"text","h":"분명히 그랬는데도 예상 밖의 일","md":"**-(으)ㄴ/는데도** 는 앞의 상황이 일어났음에도 불구하고 **기대나 상식과 다른 뜻밖의 결과가 나올 때** 씁니다.\\n> 약을 먹**었는데도** 열이 내리지 않아요.\\n\\n가정을 전제로 하는 「-아/어도」와 달리, **이미 실제로 벌어진 사실**을 놓고 말합니다."},
          {"t":"table","head":["품사 및 시제","사전형","연결 형태"],"rows":[["동사 현재","공부하다 — to study","공부하**는데도**"],["동사/형용사 과거","자다 — to sleep","잤**는데도**"],["형용사 현재","춥다 — to be cold","추**운데도** (ㅂ 불규칙)"],["형용사 현재","바쁘다 — to be busy","바**쁜데도**"]]},
          {"t":"chars","wide":true,"items":[{"ch":"주말인데도 도서관에 사람이 정말 많네요.","tip":"Even though it is the weekend, the library is very crowded."},{"ch":"어젯밤에 푹 잤는데도 여전히 피곤해요.","tip":"Even though I slept well last night, I am still tired."},{"ch":"열심히 연습했는데도 무대에서 실수를 했어요.","tip":"Even though I practiced hard, I made a mistake on stage."}]},
          {"t":"cloze","sentence":"난방을 [켰는데도] 방 안이 여전히 썰렁해요.","answer":"켰는데도","meaning":"Even though I turned on the heating, the room is still chilly.","options":["켰는데도","켜기는 하지만","켜는 반면에","켜야만"],"keys":["켰는데도","켜기는 하지만","켜는 반면에","켜야만"],"why":"난방을 켰으면 따뜻해야 하는데 기대와 달리 썰렁한 상태이므로 과거형 **-았/었는데도**가 알맞습니다."},
          {"t":"choice","q":"실제로 노력했으나 뜻밖의 안 좋은 결과가 나왔을 때 알맞은 문장은?","options":["다이어트를 열심히 하는데도 살이 안 빠져요.","다이어트를 열심히 하는 반면에 살이 안 빠져요.","다이어트를 열심히 하기는 하지만 살이 안 빠져요."],"answer":0,"why":"원인과 어긋나는 뜻밖의 결과를 강조할 때는 **-(으)ㄴ/는데도**를 씁니다."},
          {"t":"type","q":"비싸다 — 「가격이 ___ 손님이 끊이지 않아요.」 기대와 다른 사실을 연결하세요.","answer":"비싼데도","keys":["비싼데도","비싼데도 불구하고","비싼데"],"why":"형용사 '비싸다'에 받침이 없으므로 현재형 **-ㄴ데도**가 붙어 **비싼데도**가 됩니다."},
          {"t":"order","q":"「시간이 늦었는데도 아무도 집에 가지 않아요.」 를 순서대로 만들어 보세요.","tokens":["시간이","늦었는데도","아무도","집에 가지 않아요."],"answer":["시간이","늦었는데도","아무도","집에 가지 않아요."]},
          {"t":"note","md":"**강조하는 말**\\n\\n앞에 **그렇게, 아무리, 여전히, 아직도** 같은 부사를 함께 쓰면 뜻밖의 결과에 대한 아쉬움이나 놀라움이 더 커집니다.\\n> **아무리** 설명했**는데도** 이해를 못 해요."},
          {"t":"speak","say":"출발 시간이 다 되었는데도 친구가 아직 안 왔어요.","q":"시간이 다 되었는데 왜 안 오지 하는 답답한 마음을 담아 말해 보세요."},
        ],
      },
      {
        id: "im-c49-04", title: "4강. 실전에서 대조 표현 골라 쓰기", minutes: 5,
        blocks: [
          {"t":"text","h":"세 표현을 한눈에 가르기","md":"- **-기는 하지만**: 상대 말을 받아서 **인정하고 덧붙일 때** (대화의 완충재)\\n- **-(으)ㄴ/는 반면에**: 두 면이나 대상을 **나란히 견줄 때** (장단점, 성격 비교)\\n- **-(으)ㄴ/는데도**: 상식이나 기대와 **어긋난 결과에 놀라거나 아쉬울 때**"},
          {"t":"chars","wide":true,"items":[{"ch":"동네가 조용하기는 하지만 편의 시설이 조금 부족해요.","tip":"The neighborhood is quiet, but it lacks convenience facilities a bit."},{"ch":"형은 외향적인 반면에 동생은 조용하고 차분해요.","tip":"The older brother is extroverted, whereas the younger is quiet and calm."},{"ch":"자주 청소하는데도 먼지가 금방 쌓이네요.","tip":"Even though I clean often, dust piles up quickly."}]},
          {"t":"cloze","sentence":"이 카메라는 가벼워서 휴대하기 [좋기는 하지만] 배터리가 빨리 닳아요.","answer":"좋기는 하지만","meaning":"This camera is light and convenient to carry, but the battery drains fast.","options":["좋기는 하지만","좋은 반면에","좋은데도","좋을 테니까"],"keys":["좋기는 하지만","좋은 반면에","좋은데도","좋을 테니까"],"why":"가볍고 좋다는 장점을 먼저 긍정하며 아쉬운 점을 덧붙이므로 **-기는 하지만**이 가장 자연스럽습니다."},
          {"t":"choice","q":"회의에서 신제품의 장점과 위험 요소를 객관적으로 보고할 때 가장 적절한 표현은?","options":["수익성이 높은 반면에 초기 투자 비용이 큽니다.","수익성이 높기는 하지만 초기 투자 비용이 큽니다.","수익성이 높은데도 초기 투자 비용이 큽니다."],"answer":0,"why":"보고서나 업무 회의에서 두 지표를 객관적으로 나란히 대비할 때는 **-(으)ㄴ/는 반면에**가 가장 격식 있고 정확합니다."},
          {"t":"cloze","sentence":"분명히 주소를 제대로 [적었는데도] 택배가 엉뚱한 곳으로 갔어요.","answer":"적었는데도","meaning":"Even though I clearly wrote the right address, the package went to the wrong place.","options":["적었는데도","적기는 하지만","적는 반면에","적을걸요"],"keys":["적었는데도","적기는 하지만","적는 반면에","적을걸요"],"why":"제대로 적었음에도 불구하고 엉뚱한 곳으로 배송된 뜻밖의 실패 상황이므로 **-았/었는데도**입니다."},
          {"t":"type","q":"가깝다 — 「회사가 집에서 ___ 자주 지각을 해요.」 상식과 반대되는 결과를 연결하세요.","answer":"가까운데도","keys":["가까운데도","가까운데도 불구하고","가깝기는 하지만"],"why":"ㅂ 불규칙 형용사(가까우-) 뒤에 뜻밖의 결과를 잇는 **-ㄴ데도**가 붙어 **가까운데도**가 됩니다."},
          {"t":"order","q":"「비가 많이 오는데도 축구 경기를 계속 진행했어요.」 를 순서대로 만들어 보세요.","tokens":["비가 많이","오는데도","축구 경기를","계속 진행했어요."],"answer":["비가 많이","오는데도","축구 경기를","계속 진행했어요."]},
          {"t":"note","md":"**대화 매너 한 줄**\\n\\n상대 의견에 바로 \"아닌데요\" 하고 반박하기보다, **\"맞는 말씀이기는 하지만...\"** 하고 말을 시작하면 훨씬 성숙하고 원만한 대화가 됩니다."},
          {"t":"speak","say":"선생님 설명이 쉽기는 하지만 직접 문제를 풀어 보면 아직 헷갈려요.","q":"이해는 되지만 혼자 풀 땐 어렵다는 속마음을 자연스럽게 이야기해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c50',
    emoji: '✍️',
    title: { ko: '중급 50: 서술체와 반말체', en: 'Intermediate 50: Narrative and Informal Forms' },
    tagline: { ko: '글로 쓰는 문체 · 친구와 나누는 편한 대화', en: 'Writing style for print, informal chat with friends' },
    blurb: { ko: '신문·소설·보고서에 쓰는 서술체(-(느)ㄴ다)와 친한 친구에게 쓰는 반말체(해체)의 규칙을 익히고 격식에 맞게 구별합니다.', en: 'Master the plain narrative style (-(느)ㄴ다) for articles/essays and the casual style (해체) for close friends.' },
    level: 'Intermediate',
    needs: 'im-c49',
    lessons: [
      {
        id: "im-c50-01", title: "1강. 글말투 서술체 만들기 (-(느)ㄴ다 · -다)", minutes: 4,
        blocks: [
          {"t":"text","h":"신문·일기·보고서에 쓰는 객관적인 말투","md":"**서술체(한다체)** 는 특정 청자를 정하지 않고 사실을 객관적으로 서술할 때 쓰는 **글말투**입니다.\\n\\n신문 기사, 책, 보고서, 일기, 시험 답안(TOPIK 쓰기)에서 기본으로 쓰입니다.\\n> 정부가 새 정책을 **발표했다**.\\n> 오늘은 하루 종일 비가 **내린다**."},
          {"t":"table","head":["품사 및 받침","사전형","현재 서술형","과거 서술형"],"rows":[["동사 (받침 없음)","가다 — to go","간다","갔다"],["동사 (받침 있음)","먹다 — to eat","먹는다","먹었다"],["동사 (ㄹ 받침)","만들다 — to make","만든다","만들었다"],["형용사 (전체)","예쁘다 / 좋다","예쁘다 / 좋다","예뻤다 / 좋았다"]]},
          {"t":"chars","wide":true,"items":[{"ch":"연구팀이 새로운 치료법을 발견했다.","tip":"The research team discovered a new treatment."},{"ch":"현대인은 바쁜 일상 속에서 많은 스트레스를 받는다.","tip":"Modern people experience a lot of stress in busy daily life."},{"ch":"이 지역은 사계절 내내 풍경이 아름답다.","tip":"This region has beautiful scenery throughout all four seasons."}]},
          {"t":"cloze","sentence":"매일 아침 많은 사람들이 지하철을 [이용한다].","answer":"이용한다","meaning":"Many people use the subway every morning.","options":["이용한다","이용하다","이용해요","이용합니다"],"keys":["이용한다","이용하다","이용해요","이용합니다"],"why":"동사 '이용하다'의 어간(이용하-)에 받침이 없으므로 현재 서술형은 **-ㄴ다**가 붙어 **이용한다**가 됩니다."},
          {"t":"choice","q":"형용사의 현재 시제를 서술체(글말투)로 올바르게 쓴 문장은?","options":["요즘 날씨가 참 따뜻하다.","요즘 날씨가 참 따뜻한다.","요즘 날씨가 참 따뜻는다."],"answer":0,"why":"형용사는 현재 시제 서술체에서 어미를 바꾸지 않고 사전형 그대로 **-다**를 씁니다."},
          {"t":"type","q":"읽다 (to read) — 「학생들이 도서관에서 책을 ___ .」 현재 서술체로 바꾸어 쓰세요.","answer":"읽는다","keys":["읽는다","읽었다","읽다"],"why":"동사 '읽다'는 어간에 받침(ㄺ)이 있으므로 **-는다**가 붙어 **읽는다**가 됩니다."},
          {"t":"order","q":"「한국의 가을 하늘은 높고 푸르다.」 를 순서대로 만들어 보세요.","tokens":["한국의","가을 하늘은","높고","푸르다."],"answer":["한국의","가을 하늘은","높고","푸르다."]},
          {"t":"note","md":"**핵심 규칙 하나**\\n- **동사**: 받침 없으면 **-ㄴ다**, 받침 있으면 **-는다** (간다, 먹는다)\\n- **형용사**: 사전형 그대로 **-다** (크다, 작다)\\n- 형용사에 '-는다'를 붙이면 틀립니다 (❌ 행복한다 → ⭕ 행복하다)."},
          {"t":"speak","say":"스마트폰의 보급으로 사람들의 생활 방식이 크게 바뀌었다.","q":"신문 기사의 한 줄을 낭독하듯 차분하고 단호한 톤으로 읽어 보세요."},
        ],
      },
      {
        id: "im-c50-02", title: "2강. 친구 사이 반말체 익히기 (해요체에서 '요' 떼기)", minutes: 4,
        blocks: [
          {"t":"text","h":"친한 친구와 손아랫사람에게 쓰는 편한 말투","md":"**반말체(해체)** 는 나이가 같은 동갑내기 친구나 친한 후배, 가족 사이에서 편하게 주고받는 대화체입니다.\\n\\n가장 기본적인 원칙은 평소 쓰던 **해요체에서 '요'를 떼어내는 것**입니다.\\n> 밥 먹었어요? → 밥 **먹었어**?\\n> 어디 가요? → 어디 **가**?"},
          {"t":"table","head":["문장 종류","해요체","반말체 (해체)"],"rows":[["평서문/의문문","지금 집에 가요.","지금 집에 **가**."],["명사 서술 (받침 없음)","친구예요.","친구**야**."],["명사 서술 (받침 있음)","학생이에요.","학생**이야**."],["함께 하자고 권할 때","같이 가요 / 갑시다.","같이 **가자**."]]},
          {"t":"chars","wide":true,"items":[{"ch":"너 지금 어디야? 나 벌써 도착했어.","tip":"Where are you now? I arrived already."},{"ch":"오늘 저녁에 치킨 먹자!","tip":"Let's eat chicken for dinner tonight!"},{"ch":"이거 진짜 재미있다, 너도 한번 읽어 봐.","tip":"This is really interesting, you read it too."}]},
          {"t":"cloze","sentence":"주말에 심심하면 우리 집에 [놀러 와].","answer":"놀러 와","meaning":"If you are bored on the weekend, come over to my place.","options":["놀러 와","놀러 와요","놀러 오세요","놀러 오자"],"keys":["놀러 와","놀러 와요","놀러 오세요","놀러 오자"],"why":"친구에게 권하거나 부탁할 때는 '놀러 와요'에서 '요'를 뗀 **놀러 와**를 씁니다."},
          {"t":"choice","q":"친구에게 '내가 도와줄게'라고 반말로 편하게 말하려 합니다. 알맞은 것은?","options":["내가 도와줄게, 걱정 마.","제가 도와줄게요, 걱정 마세요.","너가 도와줄게, 걱정 마."],"answer":0,"why":"반말체에서는 일인칭 대명사도 '저' 대신 **나/내가**를 씁니다."},
          {"t":"type","q":"영화 보다 — 「주말에 같이 ___ !」 친구에게 함께 하자고 권하는 반말(청유형)로 쓰세요.","answer":"영화 보자","keys":["영화 보자","영화 봐","영화 보자고"],"why":"반말에서 함께 하자는 청유형은 어간에 **-자**를 붙여 **영화 보자**가 됩니다."},
          {"t":"order","q":"「내일 몇 시에 만날 거야?」 를 순서대로 만들어 보세요.","tokens":["내일","몇 시에","만날","거야?"],"answer":["내일","몇 시에","만날","거야?"]},
          {"t":"note","md":"**호칭도 함께 바뀝니다**\\n\\n- 저 / 제가 → **나 / 내가**\\n- 저의 / 제 → **내**\\n- 저희 → **우리**\\n- 당신 / 상대방 이름+씨 → **너 / 이름+아/야** (예: 민수야, 수진아)"},
          {"t":"speak","say":"오늘 날씨 정말 좋다. 우리 한강에 자전거 타러 갈래?","q":"친구에게 기분 좋게 나들이를 제안하듯 편안한 어조로 말해 보세요."},
        ],
      },
      {
        id: "im-c50-03", title: "3강. 서술체와 반말체 가르기 (글 vs 말)", minutes: 4,
        blocks: [
          {"t":"text","h":"글에서 쓰는 말투와 입으로 내는 반말","md":"학습자들이 가장 많이 하는 실수 중 하나가 **서술체(-(느)ㄴ다)** 와 **반말체(-아/어)** 를 헷갈리는 것입니다.\\n\\n- **서술체(한다체)**: 책, 신문, 보고서, 일기 등 **글로 쓰는 말투**입니다. 대화에서 쓰면 혼잣말이나 차가운 느낌을 줍니다.\\n- **반말체(해체)**: 친구와 실제로 **입으로 대화할 때** 쓰는 말투입니다."},
          {"t":"table","head":["상황","서술체 (글)","반말체 (대화)"],"rows":[["밥을 먹었는지 물을 때","밥을 먹었는가?","밥 먹었어?"],["지금 간다고 말할 때","지금 간다. (혼잣말 느낌)","나 지금 가."],["같이 가자고 할 때","함께 간다. (설명)","같이 가자!"],["오늘 춥다고 할 때","오늘 날씨가 춥다.","오늘 날씨 진짜 춥다 / 추워."]]},
          {"t":"chars","wide":true,"items":[{"ch":"일기: 오늘은 오랜만에 옛 친구를 만났다.","tip":"Diary: Today I met an old friend after a long time."},{"ch":"대화: 야, 우리 진짜 오랜만에 만났다, 그치?","tip":"Chat: Hey, we really haven't met in ages, right?"},{"ch":"보고서: 온라인 쇼핑 이용률이 매년 증가하고 있다.","tip":"Report: Online shopping usage rate is increasing every year."}]},
          {"t":"cloze","sentence":"친구와 카카오톡을 할 때: 「지금 퇴근하는 [중이야]. 너는?」","answer":"중이야","meaning":"Chatting on KakaoTalk: I am on my way home from work now. How about you?","options":["중이야","중이다","중입니다","중이냐"],"keys":["중이야","중이다","중입니다","중이냐"],"why":"친구와의 일상 모바일 메신저 대화에서는 친근한 반말체 **-(이)야**를 씁니다. '중이다'는 글말투라 어색합니다."},
          {"t":"choice","q":"한국어능력시험(TOPIK) 쓰기 54번 에세이를 작성할 때 알맞은 문체는?","options":["환경 보호는 미래 세대를 위해 반드시 필요하다.","환경 보호는 미래 세대를 위해 반드시 필요해요.","환경 보호는 미래 세대를 위해 반드시 필요해."],"answer":0,"why":"공식 시험의 작문이나 논술문에는 항상 객관적인 서술체 **-다 / -(느)ㄴ다**를 써야 합니다."},
          {"t":"type","q":"하다 — 「신문 기사: 한국 대표팀이 결승전에 진출___ .」 과거 서술체로 쓰세요.","answer":"했다","keys":["했다","하였다","했어"],"why":"신문 기사의 과거 사실 서술은 서술체 **-았다/었다**를 써서 **했다**가 됩니다."},
          {"t":"order","q":"「친구야, 오늘 저녁에 시간 있어?」 를 순서대로 만들어 보세요.","tokens":["친구야,","오늘","저녁에","시간 있어?"],"answer":["친구야,","오늘","저녁에","시간 있어?"]},
          {"t":"note","md":"**주의점**\\n처음 만난 사람이나 공적인 자리, 나이가 더 많은 사람에게 반말체를 쓰면 큰 결례가 됩니다. 반말은 서로 말을 놓기로 합의한 뒤에 써야 안전합니다."},
          {"t":"speak","say":"일기장에 쓰듯: 오늘은 참 보람차고 행복한 하루였다.","q":"자신의 일기장에 하루를 정리하듯 담담하게 소리 내어 읽어 보세요."},
        ],
      },
      {
        id: "im-c50-04", title: "4강. 실전 상황에서 말투 전환하기", minutes: 5,
        blocks: [
          {"t":"text","h":"해요체, 반말체, 서술체를 자유자재로 넘나들기","md":"상황과 대상에 맞춰 말투의 옷을 갈아입는 연습을 합니다.\\n\\n- **존댓말(해요체)**: 처음 만난 사람, 직장 동료, 손윗사람\\n- **반말(해체)**: 동갑 친구, 어린아이, 친한 후배\\n- **서술체(한다체)**: 블로그 포스팅, 독후감, 일기, 격식 있는 글"},
          {"t":"chars","wide":true,"items":[{"ch":"해요체: 오늘 너무 피곤해서 먼저 들어갈게요.","tip":"Polite: I am so tired today, so I will head home first."},{"ch":"반말체: 나 오늘 너무 피곤해서 먼저 갈게.","tip":"Casual: I am so tired today, heading out first."},{"ch":"서술체: 과도한 업무로 인해 현대인의 피로도가 증가했다.","tip":"Narrative: Due to excessive work, modern people's fatigue has increased."}]},
          {"t":"cloze","sentence":"친구에게 보낼 때: 「이번 주말에 약속 [취소됐어].」","answer":"취소됐어","meaning":"To a friend: The plan for this weekend was cancelled.","options":["취소됐어","취소됐다","취소되었습니다","취소돼요"],"keys":["취소됐어","취소됐다","취소되었습니다","취소돼요"],"why":"친구와의 일상 대화이므로 '취소되었어요'에서 요를 뗀 반말 과거형 **취소됐어**가 가장 자연스럽습니다."},
          {"t":"choice","q":"블로그나 일기에 혼잣말로 감상을 적을 때 가장 어울리는 문장은?","options":["오늘 본 영화는 생각보다 훨씬 감동적이었다.","오늘 본 영화는 생각보다 훨씬 감동적이었어요.","오늘 본 영화는 생각보다 훨씬 감동적이었어."],"answer":0,"why":"글로 남기는 감상문이나 일기에는 서술체 **-(으)ㄴ/었다**를 쓰는 것이 가장 깔끔하고 문학적입니다."},
          {"t":"cloze","sentence":"뉴스 보도: 「전문가들은 이번 조치가 큰 효과를 거둘 것으로 [전망한다].」","answer":"전망한다","meaning":"News report: Experts predict this measure will have a major effect.","options":["전망한다","전망해요","전망해","전망하자"],"keys":["전망한다","전망해요","전망해","전망하자"],"why":"기사나 보도문에서는 동사 어간에 **-ㄴ다**를 붙인 서술체 **전망한다**를 씁니다."},
          {"t":"type","q":"알다 — 「친구에게: 「나도 그 소식 이미 ___ .」 반말 과거형으로 쓰세요.","answer":"알고 있었어","keys":["알고 있었어","알았어","알았지"],"why":"이미 알고 있던 진행 상황을 친구에게 반말로 전하므로 **알고 있었어** 또는 **알았어**가 됩니다."},
          {"t":"order","q":"「우리 내일 수업 끝나고 도서관에서 만나자.」 를 순서대로 만들어 보세요.","tokens":["우리","내일 수업 끝나고","도서관에서","만나자."],"answer":["우리","내일 수업 끝나고","도서관에서","만나자."]},
          {"t":"note","md":"**말투 전환 꿀팁**\\n외국인 학습자가 한국인 친구와 친해질 때 \"우리 말 놓을까?\"(Shall we drop honorifics?)라는 제안을 받으면, 그때부터 편하게 반말을 쓰면 됩니다."},
          {"t":"speak","say":"민수야, 시험 끝나면 우리 다 같이 맛있는 거 먹으러 가자!","q":"친구에게 밝고 신나게 제안하듯 활기찬 목소리로 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c51',
    emoji: '💡',
    title: { ko: '중급 51: 이유를 나타낼 때 (심화)', en: 'Intermediate 51: Expressing Reasons in Nuance' },
    tagline: { ko: '새 정보 알리기 · 상기시키기 · 탓과 걱정', en: 'Informing new reasons, reminding, blaming, and worrying' },
    blurb: { ko: '-거든요, -잖아요, -(으)ㄴ/는 탓에, -고 해서, -(으)ㄹ까 봐 … 상대가 아는지 모르는지, 원인을 탓하거나 걱정하는 뉘앙스에 따라 이유 표현을 섬세하게 골라 씁니다.', en: 'Choose between -거든요 (new info), -잖아요 (shared info), -(으)ㄴ/는 탓에 (blaming), -고 해서 (giving one of many reasons), and -(으)ㄹ까 봐 (fear/worry).' },
    level: 'Intermediate',
    needs: 'im-c50',
    lessons: [
      {
        id: "im-c51-01", title: "1강. 상대가 모르는 이유 vs 이미 아는 이유 (-거든요 vs -잖아요)", minutes: 4,
        blocks: [
          {"t":"text","h":"정보의 차이에 따라 갈리는 두 표현","md":"대화에서 이유를 댈 때 상대방이 그 사실을 **알고 있는지 모르는지**에 따라 말이 완전히 달라집니다.\\n\\n- **-거든요**: 상대방이 **모르는 새로운 이유**를 친절하게 알려 줄 때 씁니다.\\n> 오늘 일찍 가야 해요. 약속이 있**거든요**.\\n\\n- **-잖아요**: 상대방도 **이미 알고 있는 사실을 상기시키거나 가볍게 확인할 때** 씁니다.\\n> 우리 어제 이야기했**잖아요**."},
          {"t":"table","head":["상황","듣는 사람의 상태","알맞은 어미","예문"],"rows":[["약속 못 가는 이유 알리기","상대가 이유를 모름","-거든요","급한 일이 생겼거든요."],["어제 정한 메뉴 기억시키기","상대도 이미 알고 있음","-잖아요","어제 피자 먹기로 했잖아요."],["왜 바쁜지 설명할 때","상대가 내 스케줄 모름","-거든요","내일이 시험이거든요."],["눈앞의 상황 짚기","둘 다 눈앞에서 보고 있음","-잖아요","여기 사람 많잖아요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"죄송해요, 배가 아파서 먼저 일어날게요. 어제 찬 걸 많이 먹었거든요.","tip":"Sorry, my stomach hurts so I will leave first. I ate too much cold food yesterday."},{"ch":"민수 씨한테 물어보세요. 민수 씨가 그 분야 전문가잖아요.","tip":"Ask Minsu. As you know, Minsu is an expert in that field."},{"ch":"그 식당은 월요일마다 쉬잖아요. 다른 곳으로 가요.","tip":"That restaurant is closed on Mondays (as we know). Let's go somewhere else."}]},
          {"t":"cloze","sentence":"A: 「오늘 왜 이렇게 기분이 좋아 보여요?」 B: 「새로 산 옷이 드디어 [도착했거든요].」","answer":"도착했거든요","meaning":"A: Why do you look so happy today? B: Because the new clothes I ordered finally arrived.","options":["도착했거든요","도착했잖아요","도착한 탓에요","도착할까 봐요"],"keys":["도착했거든요","도착했잖아요","도착한 탓에요","도착할까 봐요"],"why":"질문한 상대방은 옷이 도착했다는 사실을 아직 모르므로, 새로운 정보를 알려 주는 **-거든요**가 알맞습니다."},
          {"t":"choice","q":"친구도 이미 알고 있는 약속 장소를 다시 떠올려 주며 말할 때 알맞은 것은?","options":["우리 세 시에 시청 앞 시계탑에서 만나기로 했잖아.","우리 세 시에 시청 앞 시계탑에서 만나기로 했거든.","우리 세 시에 시청 앞 시계탑에서 만난 탓이잖아."],"answer":0,"why":"서로 이미 합의하고 알고 있는 사실을 상기시킬 때는 **-잖아요 (반말: -잖아)**를 씁니다."},
          {"t":"type","q":"바쁘다 — 「A: 왜 전화를 안 받았어요? B: 회의 중이라 너무 ___ .」 상대가 모르는 이유를 말하세요.","answer":"바빴거든요","keys":["바빴거든요","바빴잖아요","바쁘거든요"],"why":"전화를 못 받은 과거의 상황과 이유를 새롭게 설명하므로 과거형 **-았/었거든요**를 써서 **바빴거든요**가 됩니다."},
          {"t":"order","q":"「제가 매운 음식을 잘 못 먹거든요.」 를 순서대로 만들어 보세요.","tokens":["제가","매운 음식을","잘 못","먹거든요."],"answer":["제가","매운 음식을","잘 못","먹거든요."]},
          {"t":"note","md":"**주의할 점**\\n상대방이 전혀 모르는 사실인데 **-잖아요**를 쓰면 \"왜 그것도 몰라?\" 하고 따지는 듯한 인상을 줄 수 있으니 조심해야 합니다."},
          {"t":"speak","say":"오늘 저녁은 집에서 먹을게요. 냉장고에 찌개가 남아 있거든요.","q":"상대방에게 이유를 부드럽게 전달하듯 친절한 어조로 말해 보세요."},
        ],
      },
      {
        id: "im-c51-02", title: "2강. 원인을 탓할 때와 걱정해서 대비할 때 (-(으)ㄴ/는 탓에 vs -(으)ㄹ까 봐)", minutes: 4,
        blocks: [
          {"t":"text","h":"부정적 결과의 책임 짚기, 그리고 불안감에 미리 챙기기","md":"- **-(으)ㄴ/는 탓에**: 나쁜 결과의 원인을 **부정적으로 탓하거나 핑계 삼아 원망할 때** 씁니다. 좋은 일에는 쓸 수 없습니다.\\n> 스마트폰을 오래 본 **탓에** 눈이 아파요.\\n\\n- **-(으)ㄹ까 봐**: 안 좋은 일이 벌어질까 봐 **걱정·불안해서 미리 무언가를 할 때** 씁니다.\\n> 비가 **올까 봐** 우산을 챙겼어요."},
          {"t":"table","head":["구분","의미의 핵심","결과의 성격","예문"],"rows":[["-(으)ㄴ/는 탓에","원인에 대한 부정적 귀인","이미 일어난 부정적 결과","감기에 걸린 탓에 결석했다."],["-(으)ㄹ까 봐","미래 일에 대한 걱정과 불안","앞으로의 일에 대한 대비","시험에 떨어질까 봐 밤새 공부했다."],["-(으)ㄴ 덕분에","긍정적인 도움과 은혜","이미 일어난 긍정적 결과","선생님 덕분에 합격했어요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"어젯밤 늦게 잔 탓에 아침에 늦잠을 잤어요.","tip":"Because I went to bed late last night, I overslept this morning."},{"ch":"지각할까 봐 아침도 못 먹고 뛰어나왔어요.","tip":"Fearing that I might be late, I ran out without eating breakfast."},{"ch":"날씨가 갑자기 추워진 탓에 감기 환자가 늘었다.","tip":"Due to the sudden drop in temperature, cold patients increased."}]},
          {"t":"cloze","sentence":"길이 [막힐까 봐] 지하철을 타고 갔어요.","answer":"막힐까 봐","meaning":"Worried that the roads might be blocked, I took the subway.","options":["막힐까 봐","막힌 탓에","막히거든요","막히잖아요"],"keys":["막힐까 봐","막힌 탓에","막히거든요","막히잖아요"],"why":"도로가 막힐 것을 미리 걱정하여 지하철을 선택했으므로 걱정과 대비를 나타내는 **-(으)ㄹ까 봐**가 맞습니다."},
          {"t":"choice","q":"부정적인 결과의 원인을 분명하게 지적할 때 가장 알맞은 것은?","options":["폭설이 내린 탓에 비행기가 결항되었습니다.","폭설이 내릴까 봐 비행기가 결항되었습니다.","폭설이 내린 덕분에 비행기가 결항되었습니다."],"answer":0,"why":"폭설이라는 부정적 원인으로 결항이라는 안 좋은 결과가 벌어졌으므로 **-(으)ㄴ 탓에**를 씁니다."},
          {"t":"type","q":"잊어버리다 — 「비밀번호를 ___ 수첩에 적어 두었어요.」 걱정하여 대비하는 형태로 쓰세요.","answer":"잊어버릴까 봐","keys":["잊어버릴까 봐","잊을까 봐","잊어버릴까 봐서"],"why":"잊어버릴 가능성을 염려하여 미리 수첩에 적어 둔 것이므로 **-(으)ㄹ까 봐**를 씁니다."},
          {"t":"order","q":"「무리하게 운동을 한 탓에 허리를 다쳤어요.」 를 순서대로 만들어 보세요.","tokens":["무리하게","운동을 한 탓에","허리를","다쳤어요."],"answer":["무리하게","운동을 한 탓에","허리를","다쳤어요."]},
          {"t":"note","md":"**탓 vs 덕분**\\n결과가 나쁘면 **탓에**, 결과가 좋으면 **덕분에**를 씁니다.\\n- ❌ 친구가 도와준 탓에 합격했어요.\\n- ⭕ 친구가 도와준 **덕분에** 합격했어요."},
          {"t":"speak","say":"약속 시간에 늦을까 봐 택시를 타고 부랴부랴 달려왔어요.","q":"마음이 조마조마했던 상황을 실감 나게 전하듯 말해 보세요."},
        ],
      },
      {
        id: "im-c51-03", title: "3강. 여러 이유 중 하나 슬쩍 대기 (-고 해서)", minutes: 4,
        blocks: [
          {"t":"text","h":"부담 없이 가볍게 이유를 둘러댈 때","md":"**-고 해서** 는 그 밖에도 여러 가지 이유가 있지만, **그중 대표적인 하나를 넌지시 들며 말할 때** 씁니다.\\n> 날씨도 좋**고 해서** 산책하러 나왔어요.\\n\\n이유를 일일이 구구절절 다 대지 않고 가볍게 둘러대거나 제안할 때 아주 자주 쓰는 자연스러운 한국어 표현입니다."},
          {"t":"table","head":["결합 방식","사전형","-고 해서 형태","자주 함께 쓰는 조사"],"rows":[["동사 어간","쉬다 — to rest","쉬고 해서","집에서 좀 쉬기도 하고 해서"],["형용사 어간","심심하다 — to be bored","심심하고 해서","심심하기도 하고 해서"],["받침 있는 형용사","춥다 — to be cold","춥고 해서","날씨도 춥고 해서"],["과거 시제","먹다 — to eat","먹고 싶기도 하고 해서","달콤한 게 당기기도 하고 해서"]]},
          {"t":"chars","wide":true,"items":[{"ch":"주말에 심심하기도 하고 해서 혼자 영화 보러 갔어요.","tip":"Among other things, I was bored on the weekend, so I went to watch a movie alone."},{"ch":"기분 전환도 할 겸 바람도 쐬고 해서 드라이브 나왔어요.","tip":"To refresh myself and catch some air among other reasons, I came out for a drive."},{"ch":"요즘 피곤하기도 하고 해서 일찍 자려고요.","tip":"I am also tired these days, so I am going to bed early."}]},
          {"t":"cloze","sentence":"집에 반찬도 없고 [해서] 오늘은 밖에서 사 먹었어요.","answer":"해서","meaning":"There were no side dishes at home among other reasons, so I ate out today.","options":["해서","탓에","볼까 봐","잖아요"],"keys":["해서","탓에","볼까 봐","잖아요"],"why":"반찬이 없다는 이유를 대표로 슬쩍 들며 외식한 이유를 설명하므로 **-고 해서**가 알맞습니다."},
          {"t":"choice","q":"친구에게 가벼운 마음으로 차 한잔하자고 권할 때 가장 알맞은 것은?","options":["오랜만에 얼굴도 보고 해서 연락했어.","오랜만에 얼굴을 본 탓에 연락했어.","오랜만에 얼굴을 볼까 봐 연락했어."],"answer":0,"why":"연락한 여러 이유 중 하나로 얼굴을 보고 싶다는 점을 다정하게 들 때는 **-고 해서**를 씁니다."},
          {"t":"type","q":"좋다 — 「날씨도 ___ 밖에서 점심을 먹을까요?」 대표적인 이유를 가볍게 연결하세요.","answer":"좋고 해서","keys":["좋고 해서","좋기도 하고 해서","좋아서"],"why":"형용사 어간 '좋-' 뒤에 대표 이유를 잇는 **-고 해서**를 붙여 **좋고 해서**가 됩니다."},
          {"t":"order","q":"「답답하기도 하고 해서 바람 좀 쐬러 나왔어요.」 를 순서대로 만들어 보세요.","tokens":["답답하기도","하고 해서","바람 좀","쐬러 나왔어요."],"answer":["답답하기도","하고 해서","바람 좀","쐬러 나왔어요."]},
          {"t":"note","md":"**더 자연스러운 팁**\\n앞에 **'-도'** 나 **'-기도 하고'** 를 함께 쓰면 \"다른 이유도 더 있지만\"이라는 뉘앙스가 한층 더 살아납니다.\\n> 배**도** 고프**고 해서** 빵 하나 샀어요."},
          {"t":"speak","say":"오랜만에 친구도 만나고 해서 맛있는 저녁을 먹으러 가요.","q":"기분 좋은 핑계를 대며 친구와 즐겁게 외출하듯 이야기해 보세요."},
        ],
      },
      {
        id: "im-c51-04", title: "4강. 실전 대화에서 정중하게 이유 대기", minutes: 5,
        blocks: [
          {"t":"text","h":"배려와 상황에 맞는 고급 이유 표현 정리","md":"상황에 따라 알맞은 이유 표현을 골라 쓰는 실전 연습입니다.\\n\\n- **-거든요**: 내 사정을 새로 설명할 때\\n- **-잖아요**: 공감대를 형성하거나 상기시킬 때\\n- **-(으)ㄴ/는 탓에**: 문제를 빚어낸 원인을 분석할 때\\n- **-(으)ㄹ까 봐**: 걱정하여 사전 조치를 취했을 때\\n- **-고 해서**: 부드럽고 가볍게 둘러댈 때"},
          {"t":"chars","wide":true,"items":[{"ch":"죄송하지만 오늘은 먼저 가 볼게요. 가족 모임이 있거든요.","tip":"Excuse me, but I will head home first today. I have a family gathering."},{"ch":"서류가 늦게 도착한 탓에 결재가 지연되었습니다.","tip":"Because the documents arrived late, the approval was delayed."},{"ch":"비가 쏟아질까 봐 미리 창문을 다 닫아 두었어요.","tip":"Fearing it might pour rain, I closed all windows in advance."}]},
          {"t":"cloze","sentence":"회의 시간에 중요한 내용을 [놓칠까 봐] 녹음을 해 두었습니다.","answer":"놓칠까 봐","meaning":"Worried that I might miss important points during the meeting, I recorded it.","options":["놓칠까 봐","놓친 탓에","놓치거든요","놓치잖아요"],"keys":["놓칠까 봐","놓친 탓에","놓치거든요","놓치잖아요"],"why":"놓치는 일이 발생할까 봐 걱정하여 녹음이라는 사전 조치를 했으므로 **-(으)ㄹ까 봐**입니다."},
          {"t":"choice","q":"직장에서 팀원에게 친근하게 지난 회의 결정을 다시 짚어 줄 때 알맞은 말은?","options":["우리 지난주에 디자인 수정하기로 결정했잖아요.","우리 지난주에 디자인 수정하기로 결정했거든요.","우리 지난주에 디자인 수정하기로 결정한 탓이에요."],"answer":0,"why":"팀원 모두가 이미 공유하고 있는 결정 사항을 되짚어 줄 때는 **-잖아요**가 가장 적합합니다."},
          {"t":"cloze","sentence":"몸살 기운도 [있고 해서] 오늘은 일찍 퇴근하겠습니다.","answer":"있고 해서","meaning":"I have some body aches among other things, so I will leave work early today.","options":["있고 해서","있는 탓에","있을까 봐","있잖아요"],"keys":["있고 해서","있는 탓에","있을까 봐","있잖아요"],"why":"몸살 기운을 하나의 사유로 가볍고 완곡하게 제시하며 조퇴를 양해 구하므로 **-고 해서**가 자연스럽습니다."},
          {"t":"type","q":"취소되다 — 「A: 약속 장소에 왜 안 갔어요? B: 갑자기 약속이 ___ .」 상대가 모르는 사정을 설명하세요.","answer":"취소되었거든요","keys":["취소되었거든요","취소됐거든요","취소되었잖아요"],"why":"상대방이 모르는 과거의 취소 사정을 새로 전달하므로 **취소되었거든요** 또는 **취소됐거든요**가 맞습니다."},
          {"t":"order","q":"「서두른 탓에 지갑을 집에 두고 나왔어요.」 를 순서대로 만들어 보세요.","tokens":["서두른 탓에","지갑을 집에","두고","나왔어요."],"answer":["서두른 탓에","지갑을 집에","두고","나왔어요."]},
          {"t":"note","md":"**정중한 핑계 대기**\\n직장에서 거절하거나 양해를 구할 때 \"안 돼요\" 대신 **\"선약이 있거든요\"** 또는 **\"몸도 좀 안 좋고 해서요\"** 처럼 완곡한 이유 표현을 붙이면 대인 관계가 한결 원만해집니다."},
          {"t":"speak","say":"제가 내일 출장이 잡혀 있어서 오늘 보고서를 미리 끝내 두려고 하거든요.","q":"동료에게 내 상황을 차분하게 설명하듯 자연스러운 톤으로 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c52',
    emoji: '💬',
    title: { ko: '중급 52: 다른 사람의 말을 인용할 때', en: 'Intermediate 52: Reacting to Reported Speech' },
    tagline: { ko: '되묻기 · 소문 확인 · 뜻밖의 놀람', en: 'Double-checking, confirming rumors, unexpected shock' },
    blurb: { ko: '-다고요?, -다고 하던데, -다면서요?, -다니요? … 들은 말에 대해 놀라 되묻거나, 소식을 확인하고, 들은 정보를 바탕으로 제안할 때 씁니다.', en: 'Double-check with -다고요?, suggest based on hearsay with -다고 하던데, confirm good news with -다면서요?, and express disbelief with -다니요?.' },
    level: 'Intermediate',
    needs: 'im-c51',
    lessons: [
      {
        id: "im-c52-01", title: "1강. 확인하고 되묻기 (-다고요?)", minutes: 4,
        blocks: [
          {"t":"text","h":"방금 들은 말이 믿기지 않거나 다시 확인할 때","md":"**-다고요?** 는 상대방의 말을 잘 못 들어서 **다시 확인하거나, 믿기지 않아서 놀라 되물을 때** 씁니다.\\n> 내일 온**다고요**? 다음 주가 아니고요?\\n\\n상대방의 문장 종류(평서문, 의문문, 청유문, 명령문)에 따라 뒤에 붙는 인용 형태가 달라집니다."},
          {"t":"table","head":["원래 들은 말","되물을 때 형태","예문"],"rows":[["평서문 (지금 가요)","-ㄴ/는다고요?","지금 떠난다고요?"],["의문문 (어디 가요?)","-냐고요?","제가 어디 가냐고요? 집에요."],["청유문 (같이 가요)","-자고요?","지금 바로 출발하자고요?"],["명령문 (빨리 가세요)","-(으)라고요?","저보고 먼저 가라고요?"]]},
          {"t":"chars","wide":true,"items":[{"ch":"네? 다음 주에 시험을 본다고요?","tip":"What? You say we are taking an exam next week?"},{"ch":"방금 저한테 뭐라고 하셨다고요?","tip":"What did you say to me just now?"},{"ch":"지금 당장 회의를 시작하자고요?","tip":"You mean let's start the meeting right this minute?"}]},
          {"t":"cloze","sentence":"A: 「오늘 회식 취소되었어요.」 B: 「네? 회식이 [취소되었다고요]?」","answer":"취소되었다고요","meaning":"A: Today's dinner gathering got cancelled. B: What? The dinner got cancelled?","options":["취소되었다고요","취소되었자고요","취소되었냐고요","취소되었다니요"],"keys":["취소되었다고요","취소되었자고요","취소되었냐고요","취소되었다니요"],"why":"상대방의 평서문 정보를 듣고 놀라며 그대로 되묻고 있으므로 **-다고요?**가 맞습니다."},
          {"t":"choice","q":"상대가 \"내일까지 서류를 제출하세요\"라고 한 명령을 되물을 때 알맞은 것은?","options":["내일까지 제출하라고요?","내일까지 제출하자고요?","내일까지 제출하냐고요?"],"answer":0,"why":"명령 표현(-(으)세요)을 되물을 때는 **-(으)라고요?**를 씁니다."},
          {"t":"type","q":"먹다 — 「상대: 같이 점심 먹읍시다! 나: 지금 점심을 ___ ?」 청유형을 되묻는 말로 쓰세요.","answer":"먹자고요","keys":["먹자고요","먹자고요?","먹으라고요"],"why":"함께 하자는 청유형에 대해 되물을 때는 **-자고요?**를 씁니다."},
          {"t":"order","q":"「저보고 내일 아침 일찍 출근하라고요?」 를 순서대로 만들어 보세요.","tokens":["저보고","내일 아침 일찍","출근하라고요?"],"answer":["저보고","내일 아침 일찍","출근하라고요?"]},
          {"t":"note","md":"**내 말을 다시 강조할 때**\\n되묻는 것 외에도, 내 말을 상대가 못 알아들었을 때 \"제가 말씀드렸**잖아요**\" 대신 **\"제 말은 이렇다고요\"** 하고 주장을 재강조할 때도 씁니다."},
          {"t":"speak","say":"네? 가격이 두 배나 올랐다고요? 정말이에요?","q":"믿기지 않는 가격에 깜짝 놀란 목소리로 되물어 보세요."},
        ],
      },
      {
        id: "im-c52-02", title: "2강. 들은 말을 바탕으로 제안하기 (-다고 하던데 · -다던데)", minutes: 4,
        blocks: [
          {"t":"text","h":"소문을 배경으로 깔고 질문이나 권유 이어가기","md":"**-다고 하던데** 는 다른 사람에게 들은 이야기나 평판을 화제로 꺼내며, **뒤에 질문·제안·의견을 이어 붙일 때** 씁니다.\\n> 그 식당 음식이 맛있**다고 하던데** 같이 가 볼까요?\\n\\n일상 구어에서는 줄여서 **-다던데**로 아주 많이 씁니다.\\n> 오늘 비 온**다던데** 우산 챙겼어?"},
          {"t":"table","head":["품사","사전형","기본형 (-다고 하던데)","줄임형 (-다던데)"],"rows":[["동사 (받침 없음)","가다 — to go","간다고 하던데","간다던데"],["동사 (받침 있음)","먹다 — to eat","먹는다고 하던데","먹는다던데"],["형용사","좋다 — to be good","좋다고 하던데","좋다던데"],["명사","휴일 — holiday","휴일이라고 하던데","휴일이라던데"]]},
          {"t":"chars","wide":true,"items":[{"ch":"이번 주말에 날씨가 춥다고 하던데 따뜻하게 입으세요.","tip":"I heard the weather will be cold this weekend, please dress warmly."},{"ch":"새로 나온 영화가 참 재미있다던데 주말에 보러 갈래요?","tip":"I heard the new movie is really fun, shall we go watch it this weekend?"},{"ch":"그 가게는 예약해야 들어갈 수 있다던데 미리 전화해 볼까요?","tip":"I heard you need a reservation to enter that place, shall we call ahead?"}]},
          {"t":"cloze","sentence":"지수 씨가 다음 주에 [휴가라던데] 업무 분담을 미리 해 둘까요?","answer":"휴가라던데","meaning":"I heard Jisu is on vacation next week, shall we divide the work in advance?","options":["휴가라던데","휴가라면서요","휴가라니요","휴가라고요"],"keys":["휴가라던데","휴가라면서요","휴가라니요","휴가라고요"],"why":"들은 정보를 배경으로 깔고 '업무 분담을 미리 할까요?'라는 제안으로 이어지므로 **-(이)라던데**가 알맞습니다."},
          {"t":"choice","q":"친구에게 들은 소문을 전하며 함께 가자고 제안할 때 알맞은 것은?","options":["홍대에 분위기 좋은 카페가 생겼다던데 같이 갈래?","홍대에 분위기 좋은 카페가 생겼다면서 같이 갈래?","홍대에 분위기 좋은 카페가 생겼다니 같이 갈래?"],"answer":0,"why":"들은 풍문을 근거로 권유를 이어갈 때는 **-다던데 (-다고 하던데)**를 씁니다."},
          {"t":"type","q":"많다 — 「저 식당은 항상 손님이 ___ 줄을 서야 할지도 몰라요.」 들은 말을 배경으로 쓰세요.","answer":"많다고 하던데","keys":["많다고 하던데","많다던데"],"why":"형용사 '많다' 뒤에 들은 사실을 전하는 **-다고 하던데** 또는 줄임말 **많다던데**를 씁니다."},
          {"t":"order","q":"「오늘 오후부터 비가 온다던데 우산 챙기셨어요?」 를 순서대로 만들어 보세요.","tokens":["오늘 오후부터","비가 온다던데","우산","챙기셨어요?"],"answer":["오늘 오후부터","비가 온다던데","우산","챙기셨어요?"]},
          {"t":"note","md":"**과거의 회상 '더'**\\n'-다고 하던데'의 '더'는 과거에 남에게 직접 들었던 기억을 되살려 전하는 뉘앙스를 담고 있습니다."},
          {"t":"speak","say":"그 서점에 가면 찾기 힘든 책도 다 있다던데 한번 들러 볼까요?","q":"친구에게 흥미로운 소식을 전하며 제안하듯 가볍게 말해 보세요."},
        ],
      },
      {
        id: "im-c52-03", title: "3강. 소식 확인과 뜻밖의 놀람 (-다면서요? vs -다니요?)", minutes: 4,
        blocks: [
          {"t":"text","h":"소식을 확인하며 축하하기 vs 믿을 수 없어 충격받기","md":"- **-다면서요?**: 들은 소문이나 소식이 **맞는지 상대에게 확인하며 반갑게 물을 때** 씁니다.\\n> 다음 달에 결혼하신**다면서요**? 정말 축하드려요!\\n\\n- **-다니요?**: 들은 내용이 **너무 뜻밖이거나 충격적이어서 믿기지 않을 때** 씁니다.\\n> 회사를 그만두신**다니요**? 갑자기 무슨 일이에요?"},
          {"t":"table","head":["표현","감정 톤","주요 상황","예문"],"rows":[["-다면서요?","반가움, 축하, 가벼운 호기심","승진, 합격, 이사 등 좋은 소식 확인","시험에 합격하셨다면서요?"],["-다니요?","당황, 충격, 부정, 반박","갑작스러운 퇴사, 취소, 오해","제가 거짓말을 했다니요!"]]},
          {"t":"chars","wide":true,"items":[{"ch":"이번에 대리로 승진하셨다면서요? 축하드립니다!","tip":"I heard you got promoted to assistant manager, congratulations!"},{"ch":"열심히 준비한 프로젝트가 무산되다니요? 믿을 수 없어요.","tip":"The project we prepared so hard got scrapped? Unbelievable!"},{"ch":"한국어 말하기 대회에서 일등을 했다면서요?","tip":"I heard you won first prize in the Korean speaking contest!"}]},
          {"t":"cloze","sentence":"A: 「저 다음 주에 한국을 떠나요.」 B: 「네? 갑자기 [떠나신다니요]?」","answer":"떠나신다니요","meaning":"A: I am leaving Korea next week. B: What? Leaving so suddenly?","options":["떠나신다니요","떠나신다면서요","떠나신다던데","떠나신다고요"],"keys":["떠나신다니요","떠나신다면서요","떠나신다던데","떠나신다고요"],"why":"예상치 못한 작별 소식에 크게 놀라고 아쉬워하며 충격을 나타내므로 **-다니요?**가 가장 어울립니다."},
          {"t":"choice","q":"친구의 기쁜 취업 소식을 듣고 축하 인사를 건넬 때 알맞은 것은?","options":["원하던 회사에 합격했다면서? 정말 축하해!","원하던 회사에 합격했다니? 정말 축하해!","원하던 회사에 합격했다던데 정말 축하해!"],"answer":0,"why":"들은 좋은 소식을 확인하며 축하할 때는 반말 **-다면서? (존댓말: -다면서요?)**를 씁니다."},
          {"t":"type","q":"취소되다 — 「공연이 갑자기 ___ ! 표를 얼마나 힘들게 구했는데!」 충격과 당황을 담아 쓰세요.","answer":"취소되다니요","keys":["취소되다니요","취소됐다니요","취소되었다니요"],"why":"갑작스러운 공연 취소에 대한 깊은 당황과 불만을 드러내므로 **-다니요?**를 붙여 **취소되다니요**가 됩니다."},
          {"t":"order","q":"「새집으로 이사하셨다면서요? 집들이는 언제 해요?」 를 순서대로 만들어 보세요.","tokens":["새집으로","이사하셨다면서요?","집들이는","언제 해요?"],"answer":["새집으로","이사하셨다면서요?","집들이는","언제 해요?"]},
          {"t":"note","md":"**명사와의 결합**\\n- 명사 받침 있음: **-이라면서요? / -이라니요?** (선생님이라니요?)\\n- 명사 받침 없음: **-라면서요? / -라니요?** (의사라니요?)"},
          {"t":"speak","say":"장학금을 받으셨다면서요? 정말 대단하세요, 축하드려요!","q":"진심으로 기뻐하고 축하해 주는 환한 목소리로 말해 보세요."},
        ],
      },
      {
        id: "im-c52-04", title: "4강. 실전 대화에서 인용 반응 꺼내 쓰기", minutes: 5,
        blocks: [
          {"t":"text","h":"대화에 생동감을 불어넣는 간접 인용 4총사 총정리","md":"상대방의 말이나 풍문에 알맞은 반응을 꺼내어 자연스럽게 대화를 이어 갑니다.\\n\\n- **-다고요?**: 잘 못 들어서 다시 묻거나 놀라 재확인\\n- **-다고 하던데**: 소문을 화제로 올리며 제안·질문하기\\n- **-다면서요?**: 알고 있는 좋은 소식 확인하며 축하하기\\n- **-다니요?**: 황당하거나 뜻밖의 일에 충격과 반박 표하기"},
          {"t":"chars","wide":true,"items":[{"ch":"오늘 비가 많이 온다고 하던데 장화 신고 출근할까요?","tip":"I heard it will rain a lot today, shall I wear rain boots to work?"},{"ch":"벌써 퇴근하신다고요? 일이 다 끝났어요?","tip":"Leaving already? Is your work all done?"},{"ch":"제가 실수를 했다니요? 확인해 보겠습니다.","tip":"I made a mistake? Let me check that."}]},
          {"t":"cloze","sentence":"과장님, 이번 주말에 [골프 치러 가신다면서요]? 재미있게 다녀오세요!","answer":"골프 치러 가신다면서요","meaning":"Manager, I heard you are going golfing this weekend? Have a great time!","options":["골프 치러 가신다면서요","골프 치러 가신다니요","골프 치러 가신다고요","골프 치러 가신다던데"],"keys":["골프 치러 가신다면서요","골프 치러 가신다니요","골프 치러 가신다고요","골프 치러 가신다던데"],"why":"상사의 즐거운 주말 계획을 확인하며 좋은 시간 보내시라고 인사하므로 **-다면서요?**가 가장 어울립니다."},
          {"t":"choice","q":"회의 준비 도중 동료에게 들은 내용을 전하며 협조를 요청할 때 알맞은 것은?","options":["부장님께서 자료를 오늘까지 원하신다던데 같이 검토해 줄래?","부장님께서 자료를 오늘까지 원하신다니요 같이 검토해 줄래?","부장님께서 자료를 오늘까지 원하신다면서 같이 검토해 줄래?"],"answer":0,"why":"상사의 요구 사항을 배경 정보로 제시하며 검토를 부탁할 때는 **-다던데 (-다고 하던데)**가 자연스럽습니다."},
          {"t":"cloze","sentence":"네? 프로젝트 마감이 내일 [아침이라고요]? 다음 주가 아니고요?","answer":"아침이라고요","meaning":"What? The deadline is tomorrow morning? Not next week?","options":["아침이라고요","아침이라면서요","아침이라니요","아침이라던데"],"keys":["아침이라고요","아침이라면서요","아침이라니요","아침이라던데"],"why":"마감 시한을 듣고 믿기지 않아 즉시 재확인하는 상황이므로 명사 뒤에 **-(이)라고요?**가 맞습니다."},
          {"t":"type","q":"포기하다 — 「그렇게 열심히 해 놓고 이제 와서 ___ ! 안 돼요!」 당황과 만류를 담아 쓰세요.","answer":"포기한다니요","keys":["포기한다니요","포기하다니요"],"why":"상대의 포기 선언에 크게 놀라며 말릴 때 쓰는 표현이므로 **포기한다니요**가 됩니다."},
          {"t":"order","q":"「주말에 서울 근교로 단풍 구경 가신다면서요?」 를 순서대로 만들어 보세요.","tokens":["주말에","서울 근교로","단풍 구경","가신다면서요?"],"answer":["주말에","서울 근교로","단풍 구경","가신다면서요?"]},
          {"t":"note","md":"**대화의 윤활유**\\n남의 말을 듣고 단순히 \"네\"라고만 하기보다 **\"~하신다면서요?\"**나 **\"~라던데요!\"**처럼 호응해 주면 상대방은 자신의 말을 경청하고 있다는 느낌을 받습니다."},
          {"t":"speak","say":"그 드라마가 요즘 시청률 일위라던데 결말이 어떻게 될지 궁금하네요.","q":"요즘 화제가 되는 드라마 이야기를 나누듯 흥미진진한 표정으로 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c53',
    emoji: '🎯',
    title: { ko: '중급 53: 결심과 의도를 나타낼 때', en: 'Intermediate 53: Resolution and Intent' },
    tagline: { ko: '마음먹은 생각 · 마침 그 순간 · 일석이조', en: 'Tentative plans, right at that moment, two birds with one stone' },
    blurb: { ko: '-(으)ㄹ까 하다, -고자, -(으)려던 참이다, -(으)ㄹ 겸, -아/어야지요 … 아직 망설이는 생각부터 마침 하려던 순간, 공식적 목표와 다짐까지 의도의 강도를 세밀하게 조절합니다.', en: 'Control degrees of intent: tentative plans (-(으)ㄹ까 하다), formal aims (-고자), coincidental timing (-(으)려던 참이다), dual purposes (-(으)ㄹ 겸), and resolutions (-아/어야지요).' },
    level: 'Intermediate',
    needs: 'im-c52',
    lessons: [
      {
        id: "im-c53-01", title: "1강. 망설이는 계획과 공식적인 목적 (-(으)ㄹ까 하다 vs -고자)", minutes: 4,
        blocks: [
          {"t":"text","h":"사적인 가벼운 고려와 공적인 굳은 목적","md":"- **-(으)ㄹ까 하다**: 아직 확정하지 않고 속으로 **그럴까 생각 중일 때** 씁니다. 가볍고 부담 없는 의도입니다.\\n> 주말에 서점에 **갈까 해요**.\\n\\n- **-고자**: 공식적인 자리, 연설문, 공문에서 **~하려는 목적으로**를 나타내는 매우 격식 있는 표현입니다.\\n> 의견을 여쭙**고자** 이 자리에 섰습니다."},
          {"t":"table","head":["표현","확정 정도 및 격식","주요 쓰임새","예문"],"rows":[["-(으)ㄹ까 하다","낮음 (미정·고려 중)","일상 대화, 사적인 계획","올해는 수영을 배울까 해요."],["-고자 하다","높음 (공식적 의도)","발표, 보고서, 개회사","신제품의 특징을 설명하고자 합니다."],["-(으)려고 하다","중간 (일반적 의도)","일반 회화 및 작문","내일 친구를 만나려고 해요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"퇴근하고 친구들과 맛있는 저녁을 먹을까 해요.","tip":"I am thinking of eating a nice dinner with friends after work."},{"ch":"지역 사회 발전에 기여하고자 본 재단을 설립하였습니다.","tip":"In order to contribute to regional development, we established this foundation."},{"ch":"이번 주말에는 집에서 푹 쉬면서 밀린 잠을 잘까 해요.","tip":"This weekend, I am thinking of catching up on sleep while resting at home."}]},
          {"t":"cloze","sentence":"발표를 시작하며: 「오늘 회의에서는 내년도 사업 계획을 [설명드리고자] 합니다.」","answer":"설명드리고자","meaning":"Opening the presentation: In today's meeting, I would like to explain next year's business plans.","options":["설명드리고자","설명드릴까","설명드리려던","설명드려야지요"],"keys":["설명드리고자","설명드릴까","설명드리려던","설명드려야지요"],"why":"공식 프레젠테이션이나 회의에서 정중하게 발표 목적을 밝힐 때는 격식체인 **-고자**를 씁니다."},
          {"t":"choice","q":"휴가 때 특별히 정해진 건 없지만 제주도에 갈까 고민 중일 때 알맞은 문장은?","options":["이번 휴가에는 제주도나 다녀올까 해요.","이번 휴가에는 제주도나 다녀오고자 해요.","이번 휴가에는 제주도나 다녀와야지요."],"answer":0,"why":"마음속으로 가볍게 고려 중인 미확정 계획은 **-(으)ㄹ까 하다**가 가장 잘 어울립니다."},
          {"t":"type","q":"시작하다 — 「건강을 위해서 매일 아침 조깅을 ___ .」 가벼운 결심과 고려를 나타내세요.","answer":"시작할까 해요","keys":["시작할까 해요","시작할까 합니다","시작할까 해"],"why":"아직 확정은 아니지만 마음속으로 시작해 볼까 생각하는 상태이므로 **-(으)ㄹ까 하다**를 씁니다."},
          {"t":"order","q":"「새로운 소식을 전해 드리고자 펜을 들었습니다.」 를 순서대로 만들어 보세요.","tokens":["새로운 소식을","전해 드리고자","펜을","들었습니다."],"answer":["새로운 소식을","전해 드리고자","펜을","들었습니다."]},
          {"t":"note","md":"**격식의 차이**\\n친구와의 일상 대화에서 '-고자'를 쓰면 너무 딱딱하고 어색합니다. 친구 사이에는 **-(으)려고**나 **-(으)ㄹ까 해**를 쓰세요."},
          {"t":"speak","say":"주말에 날씨가 좋으면 오랜만에 등산이나 한번 갈까 해요.","q":"가볍게 여가를 고민하듯 편안한 어조로 말해 보세요."},
        ],
      },
      {
        id: "im-c53-02", title: "2강. 딱 맞춘 타이밍과 일석이조 (-(으)려던 참이다 · -(으)ㄹ 겸)", minutes: 4,
        blocks: [
          {"t":"text","h":"마침 그 순간의 행동과 두 마리 토끼 잡기","md":"- **-(으)려던 참이다**: 상대방이 무언가를 제안하거나 물어왔을 때, **마침 바로 그 행동을 하려던 순간이었다고 맞받아칠 때** 씁니다.\\n> 안 그래도 지금 전화하**려던 참이었어요**.\\n\\n- **-(으)ㄹ 겸**: 하나의 행동으로 **두 가지 이상의 목적을 함께 달성하려 할 때** 씁니다.\\n> 친구도 만**날 겸** 바람도 쐴 겸 서울에 왔어요."},
          {"t":"table","head":["표현","상황 짝꿍 어휘","문장 형태","예문"],"rows":[["-(으)려던 참이다","마침, 막, 안 그래도","마침 ~하려던 참이다","막 나가려던 참이었어요."],["-(으)ㄹ 겸","겸사겸사, 도, 그리고","A-ㄹ 겸 B-ㄹ 겸","책도 살 겸 구경도 할 겸 서점에 가요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"마침 배가 고파서 라면을 끓이려던 참이었어요.","tip":"Coincidentally I was hungry and just about to cook ramen."},{"ch":"한국어 공부도 할 겸 여행도 할 겸 서울에 왔어요.","tip":"To study Korean and travel at the same time, I came to Seoul."},{"ch":"안 그래도 지수 씨한테 그 일로 상의하려던 참이었어요.","tip":"Even without you saying, I was just about to consult Jisu about that matter."}]},
          {"t":"cloze","sentence":"A: 「커피 한잔하러 갈래요?」 B: 「좋아요, 저도 막 [일어나려던 참이었어요].」","answer":"일어나려던 참이었어요","meaning":"A: Want to go grab a coffee? B: Sounds great, I was just about to get up too.","options":["일어나려던 참이었어요","일어날까 했어요","일어나고자 했어요","일어나야지요"],"keys":["일어나려던 참이었어요","일어날까 했어요","일어나고자 했어요","일어나야지요"],"why":"상대의 커피 제안 타이밍에 딱 맞추어 마침 자리에서 일어나려던 순간임을 나타내므로 **-(으)려던 참이다**가 맞습니다."},
          {"t":"choice","q":"출장 가는 길에 친척 집도 방문하는 일석이조의 목적을 표현할 때 알맞은 것은?","options":["출장도 갈 겸 친척 집에도 들를 겸 기차를 탔어요.","출장도 가려던 참에 친척 집에도 가고자 해요.","출장도 갈까 해서 친척 집에 가야지요."],"answer":0,"why":"두 가지 목적을 나란히 아우를 때는 **-(으)ㄹ 겸 -(으)ㄹ 겸**을 씁니다."},
          {"t":"type","q":"출력하다 — 「상사: 보고서 다 됐나? 나: 네, 지금 막 ___ .」 마침 하려던 행동으로 답하세요.","answer":"출력하려던 참이었습니다","keys":["출력하려던 참이었습니다","출력하려던 참이었어요","출력하려던 참입니다"],"why":"상사의 질문 타이밍에 맞추어 바로 출력하려던 순간이었음을 알리므로 **-(으)려던 참이었습니다**가 됩니다."},
          {"t":"order","q":"「운동도 할 겸 기분 전환도 할 겸 산책하러 나왔어요.」 를 순서대로 만들어 보세요.","tokens":["운동도 할 겸","기분 전환도","할 겸 산책하러","나왔어요."],"answer":["운동도 할 겸","기분 전환도","할 겸 산책하러","나왔어요."]},
          {"t":"note","md":"**대화의 매끄러움**\\n상대방이 먼저 연락했을 때 **\"안 그래도 연락하려던 참이었는데!\"** 하고 맞장구치면, 상대방에게 깊은 호감과 친밀감을 줄 수 있습니다."},
          {"t":"speak","say":"안 그래도 지금 민우 씨한테 전화해서 물어보려던 참이었어요.","q":"마침 타이밍이 딱 맞았다는 반가움을 담아 말해 보세요."},
        ],
      },
      {
        id: "im-c53-03", title: "3강. 스스로 다짐하고 타이르기 (-아/어야지요 · -아/어야지)", minutes: 4,
        blocks: [
          {"t":"text","h":"당연한 도리와 스스로를 향한 채찍질","md":"**-아/어야지요 (반말: -아/어야지)** 는 두 가지 상황에서 씁니다.\\n\\n1. **스스로에 대한 결심과 다짐**: \"내일부터는 게으름 피우지 말고 일찍 일어**나야지**.\"\\n2. **상대방을 타이르거나 도리를 말할 때**: \"한번 약속했으면 지켜**야지요**.\""},
          {"t":"table","head":["용법","대상","말투 분위기","예문"],"rows":[["스스로 다짐","나 자신","의지, 결심, 반성","새해에는 담배를 꼭 끊어야지."],["상대 타이름","상대방","도리 일깨우기, 가벼운 훈계","어른을 보면 먼저 인사해야지요."],["상대 위로/격려","상대방","당연한 순리 공감","힘든 일 있으면 서로 도와야지요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"젊었을 때 열심히 일해서 미래를 준비해야지요.","tip":"One should work hard in youth to prepare for the future."},{"ch":"내일부터는 야식 먹지 말고 건강 챙겨야지.","tip":"Starting tomorrow, I must not eat late-night snacks and take care of health."},{"ch":"이웃끼리 곤란한 일이 있으면 서로 돕고 살아야지요.","tip":"Neighbors should help each other when in trouble."}]},
          {"t":"cloze","sentence":"A: 「오늘 너무 피곤해서 운동 가기 싫다.」 B: 「그래도 건강을 위해 꾸준히 [운동해야지].」","answer":"운동해야지","meaning":"A: I am so tired today, I don't feel like working out. B: Still, you should work out steadily for your health.","options":["운동해야지","운동할까 해","운동하고자 해","운동하려던 참이야"],"keys":["운동해야지","운동할까 해","운동하고자 해","운동하려던 참이야"],"why":"친구에게 마땅히 해야 할 도리와 건강 관리의 필요성을 다정하게 타이르므로 반말 **-아/어야지**가 맞습니다."},
          {"t":"choice","q":"스스로 반성하며 오늘 할 일을 미루지 않겠다고 굳게 결심할 때 알맞은 문장은?","options":["오늘 할 일은 오늘 안에 끝내야지.","오늘 할 일은 오늘 안에 끝낼까 해.","오늘 할 일은 오늘 안에 끝내려던 참이야."],"answer":0,"why":"스스로에 대한 굳은 다짐과 채찍질을 혼잣말로 표현할 때는 **-아/어야지**를 씁니다."},
          {"t":"type","q":"참다 — 「화가 나도 어른 앞에서는 한번 더 ___ .」 당연한 도리를 타이르는 말로 쓰세요.","answer":"참아야지요","keys":["참아야지요","참아야죠","참아야지"],"why":"어간 '참-' 뒤에 양성모음 어미 **-아야지요**를 붙여 **참아야지요**가 됩니다."},
          {"t":"order","q":"「약속 시간에 늦었으면 먼저 사과부터 해야지요.」 를 순서대로 만들어 보세요.","tokens":["약속 시간에","늦었으면","먼저 사과부터","해야지요."],"answer":["약속 시간에","늦었으면","먼저 사과부터","해야지요."]},
          {"t":"note","md":"**말할 때의 줄임꼴**\\n구어 대화에서는 **-아/어야지요**를 부드럽게 줄여서 **-아/어야죠**로 아주 흔히 씁니다.\\n> 제가 도와드려**야죠**!"},
          {"t":"speak","say":"어려운 일이 생기면 언제든 연락하세요, 서로 돕고 살아야지요.","q":"따뜻하게 위로와 격려의 마음을 건네듯 훈훈한 톤으로 말해 보세요."},
        ],
      },
      {
        id: "im-c53-04", title: "4강. 실전 대화에서 나의 의도 똑똑하게 표현하기", minutes: 5,
        blocks: [
          {"t":"text","h":"상황에 꼭 맞는 의도 표현 꺼내기","md":"결심과 의도를 나타내는 다섯 표현을 상황에 맞게 골라 씁니다.\\n\\n- **-(으)ㄹ까 하다**: 아직 망설이며 가볍게 고려할 때\\n- **-고자 하다**: 공적인 자리에서 목적을 천명할 때\\n- **-(으)려던 참이다**: 마침 딱 그 순간 상대가 제안했을 때\\n- **-(으)ㄹ 겸**: 두 가지 목적을 한꺼번에 챙길 때\\n- **-아/어야지요**: 스스로 결심하거나 도리를 권할 때"},
          {"t":"chars","wide":true,"items":[{"ch":"주말에 시간이 나면 미술관에 다녀올까 해요.","tip":"If I have time this weekend, I am thinking of visiting an art museum."},{"ch":"안 그래도 지금 막 커피 사러 가려던 참이었는데 같이 갈래요?","tip":"Coincidentally I was just about to go buy coffee, want to come along?"},{"ch":"친구 집들이도 갈 겸 서울 구경도 할 겸 다녀왔어요.","tip":"I went both to attend a friend's housewarming and to tour Seoul."}]},
          {"t":"cloze","sentence":"회의 서두: 「본 프로젝트의 성공적인 추진을 위해 몇 가지 제안을 [드리고자] 합니다.」","answer":"드리고자","meaning":"Meeting opening: I would like to offer a few suggestions for the successful drive of this project.","options":["드리고자","드릴까","드리려던","드려야지요"],"keys":["드리고자","드릴까","드리려던","드려야지요"],"why":"공식 비즈니스 회의에서 발표 목적을 격식 있게 밝히므로 **-고자**가 가장 적합합니다."},
          {"t":"choice","q":"동료가 \"점심 먹으러 가실래요?\"라고 물었을 때 마침 딱 나가려던 순간이었음을 알리는 답은?","options":["네, 안 그래도 지금 막 나가려던 참이었어요.","네, 안 그래도 지금 막 나가고자 했어요.","네, 안 그래도 지금 막 나가야지요."],"answer":0,"why":"상대방의 제안 타이밍과 내 행동 계획이 일치하는 순간에는 **-(으)려던 참이다**를 씁니다."},
          {"t":"cloze","sentence":"오랜만에 바람도 [쐴 겸] 드라이브하러 교외로 나왔어요.","answer":"쐴 겸","meaning":"To catch some fresh air among other things, I came out to the suburbs for a drive.","options":["쐴 겸","쐬고자","쐬려던 참에","쐬어야지요"],"keys":["쐴 겸","쐬고자","쐬려던 참에","쐬어야지요"],"why":"드라이브를 나온 복합적인 목적 중 하나로 바람 쐬기를 언급하므로 **-(으)ㄹ 겸**이 맞습니다."},
          {"t":"type","q":"배우다 — 「새해에는 기타를 한번 ___ .」 가벼운 미확정 계획을 표현하세요.","answer":"배워 볼까 해요","keys":["배워 볼까 해요","배울까 해요","배워 볼까 합니다"],"why":"시도해 볼까 생각 중인 결심을 부드럽게 나타내므로 **배워 볼까 해요** 또는 **배울까 해요**가 됩니다."},
          {"t":"order","q":"「맡은 일은 끝까지 책임지고 마무리해야지요.」 를 순서대로 만들어 보세요.","tokens":["맡은 일은","끝까지 책임지고","마무리해야지요."],"answer":["맡은 일은","끝까지 책임지고","마무리해야지요."]},
          {"t":"note","md":"**뉘앙스 선택의 힘**\\n\"할 거예요\"만 쓰기보다 \"~할까 해요\"(유연한 태도), \"~하려던 참이에요\"(완벽한 호응), \"~하고자 합니다\"(신뢰감)를 골라 쓸 때 한국어 실력이 한 단계 도약합니다."},
          {"t":"speak","say":"안 그래도 지수 씨한테 고마운 마음을 전하려던 참이었는데 먼저 연락 줘서 고마워요.","q":"고마움과 반가움이 듬뿍 묻어나는 목소리로 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c54',
    emoji: '👍',
    title: { ko: '중급 54: 추천하고 조언할 때', en: 'Intermediate 54: Recommending and Advising' },
    tagline: { ko: '해 볼 만한 추천 · 부드러운 지시 · 넌지시 조언', en: 'Worth trying recommendations, polite directives, gentle suggestions' },
    blurb: { ko: '-(으)ㄹ 만하다, -도록 하다, -지 그래요? … 가치 있는 것을 추천하고, 업무상 공손하게 지시하며, 상대에게 부드럽게 권유나 아쉬움을 전합니다.', en: 'Recommend worthy experiences (-(으)ㄹ 만하다), issue polite directives (-도록 하다), and make gentle suggestions or express mild regret (-지 그래요? / -지 그랬어요).' },
    level: 'Intermediate',
    needs: 'im-c53',
    lessons: [
      {
        id: "im-c54-01", title: "1강. 충분히 가치 있는 추천 (-(으)ㄹ 만하다)", minutes: 4,
        blocks: [
          {"t":"text","h":"그럴 만한 가치가 있거나 그런대로 괜찮을 때","md":"**-(으)ㄹ 만하다** 는 두 가지 뉘앙스로 쓰입니다.\\n\\n1. **추천의 가치**: 시도해 볼 만한 값어치가 충분히 있을 때\\n> 그 영화는 정말 한번 **볼 만해요**.\\n2. **허용·감내의 정도**: 아주 만족스럽지는 않지만 그런대로 괜찮거나 참을 수 있을 때\\n> 이 음식은 매콤하지만 먹을 만해요."},
          {"t":"table","head":["어간 받침","사전형","-(으)ㄹ 만하다","의미"],"rows":[["받침 없음","가다 — to go","갈 만하다","방문해 볼 가치가 있다"],["받침 있음","먹다 — to eat","먹을 만하다","맛이 그런대로 괜찮다"],["받침 있음","믿다 — to trust","믿을 만하다","신뢰할 가치가 충분하다"],["받침 있음","참다 — to endure","참을 만하다","견딜 수 있는 수준이다"]]},
          {"t":"chars","wide":true,"items":[{"ch":"경주에는 주말에 역사 여행으로 가 볼 만한 곳이 많아요.","tip":"In Gyeongju, there are many places worth visiting for a history trip on the weekend."},{"ch":"주변에 믿을 만한 중개사가 있으면 소개해 주세요.","tip":"If you know a trustworthy broker nearby, please introduce them."},{"ch":"처음에는 아팠는데 지금은 참을 만해요.","tip":"It hurt at first, but now it is bearable."}]},
          {"t":"cloze","sentence":"이 소설은 스토리가 탄탄해서 시간 날 때 꼭 한번 [읽을 만해요].","answer":"읽을 만해요","meaning":"This novel has a solid story, so it is really worth reading when you have time.","options":["읽을 만해요","읽도록 해요","읽지 그래요","읽어야지요"],"keys":["읽을 만해요","읽도록 해요","읽지 그래요","읽어야지요"],"why":"작품의 가치를 인정하며 상대에게 추천하는 문맥이므로 **-(으)ㄹ 만하다**가 알맞습니다."},
          {"t":"choice","q":"식당 음식이 최고는 아니지만 그럭저럭 먹을 수 있다고 말할 때 알맞은 것은?","options":["아주 맛있지는 않지만 그래도 먹을 만해요.","아주 맛있지는 않지만 그래도 먹도록 해요.","아주 맛있지는 않지만 그래도 먹지 그래요."],"answer":0,"why":"그런대로 괜찮다는 허용이나 감내를 나타낼 때 **먹을 만해요**를 씁니다."},
          {"t":"type","q":"믿다 — 「김 대리님은 성실해서 일을 맡길 때 정말 ___ 사람이에요.」 가치와 신뢰를 나타내세요.","answer":"믿을 만한","keys":["믿을 만한","믿을만한"],"why":"명사 '사람'을 수식하는 관형사형 어미 **-(으)ㄹ 만한**이 붙어 **믿을 만한**이 됩니다."},
          {"t":"order","q":"「서울 근교에 가족과 함께 갈 만한 곳이 어디 있을까요?」 를 순서대로 만들어 보세요.","tokens":["서울 근교에","가족과 함께","갈 만한 곳이","어디 있을까요?"],"answer":["서울 근교에","가족과 함께","갈 만한 곳이","어디 있을까요?"]},
          {"t":"note","md":"**관형사형 쓰임**\\n뒤에 명사가 올 때는 **'-(으)ㄹ 만한 + 명사'** 로 씁니다.\\n> 볼 만한 영화, 살 만한 물건, 묵을 만한 숙소"},
          {"t":"speak","say":"그 드라마는 영상미가 뛰어나서 한 번쯤 챙겨 볼 만해요.","q":"좋아하는 콘텐츠를 친구에게 기분 좋게 추천하듯 말해 보세요."},
        ],
      },
      {
        id: "im-c54-02", title: "2강. 부드러운 지시와 공지 (-도록 하다)", minutes: 4,
        blocks: [
          {"t":"text","h":"공적인 자리의 정중한 지시와 다짐","md":"**-도록 하다** 는 상대방에게 무언가를 **지시하거나 권고할 때 부드럽고 격식 있게 전달하는 표현**입니다.\\n\\n주로 직장, 학교, 공지문에서 쓰이며 단순한 명령어인 「-(으)세요」보다 절차와 규칙의 뉘앙스를 담습니다.\\n> 보고서는 금요일 오후까지 제출**하도록 하세요**."},
          {"t":"table","head":["문장 유형","어미 형태","쓰이는 상황","예문"],"rows":[["지시 / 명령","-도록 하세요","상사나 관리자의 공적인 지시","외출 시 문을 잠그도록 하세요."],["청유 / 제안","-도록 합시다","팀 전체가 함께 지킬 규칙","회의 시간을 잘 지키도록 합시다."],["본인 다짐","-도록 하겠습니다","상사의 지시에 대한 공손한 답","앞으로 더 주의하도록 하겠습니다."]]},
          {"t":"chars","wide":true,"items":[{"ch":"퇴근 전에는 반드시 컴퓨터 전원을 끄도록 하세요.","tip":"Please make sure to turn off the computer power before leaving work."},{"ch":"이번 프로젝트가 차질 없이 진행되도록 다 함께 노력합시다.","tip":"Let us all work hard together so that this project proceeds without a hitch."},{"ch":"지적해 주신 사항은 즉시 수정하도록 하겠습니다.","tip":"I will make sure to correct the pointed out issues immediately."}]},
          {"t":"cloze","sentence":"사내 공지: 「직원 여러분께서는 다음 주 월요일까지 건강검진을 [신청하도록 하세요].」","answer":"신청하도록 하세요","meaning":"Company notice: All employees, please make sure to apply for the health checkup by next Monday.","options":["신청하도록 하세요","신청할 만하세요","신청하지 그래요","신청해야지요"],"keys":["신청하도록 하세요","신청할 만하세요","신청하지 그래요","신청해야지요"],"why":"공식 공지문에서 규정이나 절차를 정중하게 지시하므로 **-도록 하세요**가 격식에 맞습니다."},
          {"t":"choice","q":"회의에서 상사의 피드백을 수용하여 성실히 고치겠다고 공손히 답할 때 알맞은 것은?","options":["말씀하신 부분은 내일까지 보완하도록 하겠습니다.","말씀하신 부분은 내일까지 보완할 만하겠습니다.","말씀하신 부분은 내일까지 보완하지 그러겠습니다."],"answer":0,"why":"자신의 성실한 실행 다짐을 업무상 격식 있게 밝힐 때는 **-도록 하겠습니다**를 씁니다."},
          {"t":"type","q":"확인하다 — 「팀원 여러분, 행사 일정표를 다시 한번 꼼꼼히 ___ .」 함께 지키자는 청유형으로 쓰세요.","answer":"확인하도록 합시다","keys":["확인하도록 합시다","확인하도록 하세요","확인합시다"],"why":"팀원들에게 함께 하자는 권고이므로 **-도록 합시다**가 알맞습니다."},
          {"t":"order","q":"「다음 주 회의 준비에 차질이 없도록 미리 점검해 두세요.」 를 순서대로 만들어 보세요.","tokens":["다음 주 회의 준비에","차질이 없도록","미리","점검해 두세요."],"answer":["다음 주 회의 준비에","차질이 없도록","미리","점검해 두세요."]},
          {"t":"note","md":"**격식의 품격**\\n직장에서 부하 직원에게 단순 명령인 \"해!\"나 \"하세요\" 대신 **\"~하도록 하세요\"**를 쓰면 정중하면서도 권위가 자연스럽게 실립니다."},
          {"t":"speak","say":"궁금한 점이 있으시면 언제든지 담당자에게 문의하도록 하세요.","q":"안내 데스크에서 방문객에게 공손히 안내하듯 정중하게 말해 보세요."},
        ],
      },
      {
        id: "im-c54-03", title: "3강. 넌지시 권하고 아쉬워하기 (-지 그래요? vs -지 그랬어요)", minutes: 4,
        blocks: [
          {"t":"text","h":"부담 없는 넌지시 권유, 그리고 진작 그러지 않은 아쉬움","md":"- **-지 그래요?**: 상대방에게 직접 명령하거나 강요하지 않고, **\"이렇게 해 보는 건 어때요?\" 하고 넌지시 권유할 때** 씁니다.\\n> 머리가 아프면 약을 먹고 좀 쉬**지 그래요**?\\n\\n- **-지 그랬어요**: 이미 지나간 일에 대해 **\"진작 그렇게 하지 그랬어\" 하고 아쉬움이나 가벼운 질책을 나타낼 때** 씁니다.\\n> 왜 혼자 끙끙 앓았어요? 진작 나한테 말하**지 그랬어요**."},
          {"t":"table","head":["시제 및 어미","의미의 핵심","상황","예문"],"rows":[["현재: -지 그래요?","부드러운 권유와 조언","상대가 힘들어하거나 고민할 때","날씨도 좋은데 산책이라도 하지 그래요?"],["과거: -지 그랬어요","과거 선택에 대한 아쉬움과 안타까움","이미 나쁜 결과를 겪은 뒤","그렇게 힘들었으면 진작 병원에 가지 그랬어요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"방이 어두운데 불을 켜지 그래요?","tip":"The room is dark, why don't you turn on the light?"},{"ch":"주말에 집에만 있지 말고 친구들이라도 만나지 그래요?","tip":"Instead of staying home on the weekend, why not meet some friends?"},{"ch":"버스가 안 오면 진작 택시를 타지 그랬어요.","tip":"If the bus wasn't coming, you should have taken a taxi sooner."}]},
          {"t":"cloze","sentence":"A: 「오늘 몸살 기운이 있어서 힘들어요.」 B: 「그럼 오늘은 야근하지 말고 일찍 [퇴근하지 그래요]?」","answer":"퇴근하지 그래요","meaning":"A: I feel like I have a body ache today, it's tough. B: Then why don't you leave work early instead of working overtime today?","options":["퇴근하지 그래요","퇴근하지 그랬어요","퇴근하도록 하세요","퇴근할 만해요"],"keys":["퇴근하지 그래요","퇴근하지 그랬어요","퇴근하도록 하세요","퇴근할 만해요"],"why":"지금 아파하는 상대에게 조기 퇴근을 부드럽게 권유하고 있으므로 현재형 **-지 그래요?**가 적절합니다."},
          {"t":"choice","q":"친구가 늦잠을 자서 중요한 시험에 지각했을 때 안타까워하며 건넬 말은?","options":["어젯밤에 알람을 맞춰 두고 자지 그랬어.","어젯밤에 알람을 맞춰 두고 자지 그래?","어젯밤에 알람을 맞춰 두고 잘 만했어."],"answer":0,"why":"이미 벌어진 과거의 아쉬운 일에 대해 반말로 안타까움을 표하므로 **-지 그랬어**를 씁니다."},
          {"t":"type","q":"물어보다 — 「모르는 게 있으면 혼자 끙끙 앓지 말고 저한테 ___ ?」 넌지시 권유하는 말로 쓰세요.","answer":"물어보지 그래요","keys":["물어보지 그래요","물어보지 그래요?","물어보지 그래"],"why":"상대에게 나에게 물어보라고 부드럽게 제안하는 현재 조언이므로 **-지 그래요?**가 됩니다."},
          {"t":"order","q":"「혼자 들기 무거우면 저한테 도와 달라고 하지 그랬어요.」 를 순서대로 만들어 보세요.","tokens":["혼자 들기 무거우면","저한테","도와 달라고","하지 그랬어요."],"answer":["혼자 들기 무거우면","저한테","도와 달라고","하지 그랬어요."]},
          {"t":"note","md":"**말투의 뉘앙스**\\n'-지 그랬어요'를 너무 차갑게 말하면 남 탓을 하는 핀잔처럼 들릴 수 있으니, 안타까워하는 따뜻한 어조로 말해야 합니다."},
          {"t":"speak","say":"그렇게 어려운 부탁이었으면 처음부터 솔직하게 거절하지 그랬어요.","q":"상대의 입장을 안타까워하는 부드러운 목소리로 말해 보세요."},
        ],
      },
      {
        id: "im-c54-04", title: "4강. 실전 상황에서 따뜻하게 조언하기", minutes: 5,
        blocks: [
          {"t":"text","h":"부담 주지 않고 자연스럽게 권하는 실전 기술","md":"상황에 어울리는 추천과 조언 표현을 능숙하게 골라 씁니다.\\n\\n- **-(으)ㄹ 만하다**: \"이거 정말 해 볼 만해요\" (경험 추천)\\n- **-도록 하다**: \"제출하도록 하세요\" (공적 절차 지시)\\n- **-지 그래요?**: \"잠깐 쉬지 그래요?\" (넌지시 완곡한 권유)\\n- **-지 그랬어요**: \"진작 말하지 그랬어요\" (따뜻한 아쉬움)"},
          {"t":"chars","wide":true,"items":[{"ch":"이번 주말에 특별한 계획 없으시면 미술 전시회에 한번 가 볼 만해요.","tip":"If you have no special plans this weekend, an art exhibition is worth visiting."},{"ch":"혼자 고민하지 말고 멘토 선배에게 조언을 구해 보지 그래요?","tip":"Instead of worrying alone, why not seek advice from a senior mentor?"},{"ch":"자료에 오타가 없는지 인쇄 전에 다시 한번 확인하도록 하세요.","tip":"Please make sure to check again for typos before printing."}]},
          {"t":"cloze","sentence":"제주도 서쪽 해안 도로는 일몰 풍경이 아름다워서 드라이브 [코스로 갈 만해요].","answer":"코스로 갈 만해요","meaning":"The western coastal road of Jeju is beautiful at sunset, so it is worth taking as a driving course.","options":["코스로 갈 만해요","코스로 가도록 하세요","코스로 가지 그래요","코스로 가야지요"],"keys":["코스로 갈 만해요","코스로 가도록 하세요","코스로 가지 그래요","코스로 가야지요"],"why":"풍경의 가치를 칭찬하며 멋진 코스로 여행자에게 추천하므로 **-(으)ㄹ 만하다**가 가장 어울립니다."},
          {"t":"choice","q":"지쳐 있는 동료에게 점심시간을 활용해 산책을 권할 때 가장 부드러운 말은?","options":["바람도 쐴 겸 회사 앞 공원에 잠깐 다녀오지 그래요?","바람도 쐴 겸 회사 앞 공원에 잠깐 다녀오도록 하세요.","바람도 쐴 겸 회사 앞 공원에 잠깐 다녀와야지요."],"answer":0,"why":"동료에게 완곡하고 부드럽게 권유를 건넬 때는 **-지 그래요?**가 가장 부담 없습니다."},
          {"t":"cloze","sentence":"상사에게: 「지적해 주신 문제점은 이번 주 안으로 [개선하도록 하겠습니다].」","answer":"개선하도록 하겠습니다","meaning":"To a superior: I will make sure to improve the pointed out issues within this week.","options":["개선하도록 하겠습니다","개선할 만하겠습니다","개선하지 그랬습니다","개선하려던 참입니다"],"keys":["개선하도록 하겠습니다","개선할 만하겠습니다","개선하지 그랬습니다","개선하려던 참입니다"],"why":"상사의 피드백에 대해 책임감을 가지고 개선하겠다는 공적 다짐이므로 **-도록 하겠습니다**입니다."},
          {"t":"type","q":"전화하다 — 「A: 친구가 안 와서 한참 기다렸어요. B: 그렇게 안 오면 먼저 ___ .」 안타까운 아쉬움을 표현하세요.","answer":"전화해 보지 그랬어요","keys":["전화해 보지 그랬어요","전화하지 그랬어요","전화해 보지 그랬어"],"why":"과거에 그러지 않은 선택에 대한 아쉬움을 안타깝게 나타내므로 **-지 그랬어요**를 씁니다."},
          {"t":"order","q":"「새로 나온 메뉴가 가격 대비 꽤 먹을 만하더라고요.」 를 순서대로 만들어 보세요.","tokens":["새로 나온 메뉴가","가격 대비","꽤 먹을 만하더라고요."],"answer":["새로 나온 메뉴가","가격 대비","꽤 먹을 만하더라고요."]},
          {"t":"note","md":"**조언의 미덕**\\n한국어에서 조언할 때는 \"이렇게 하세요\"라고 직설적으로 말하기보다 **\"~지 그래요?\"**나 **\"~해 볼 만해요\"**처럼 여지를 남겨 주는 것이 듣는 사람에 대한 예의입니다."},
          {"t":"speak","say":"그 책이 요즘 베스트셀러라던데 이번 기회에 한번 읽어 보지 그래요?","q":"친구에게 좋은 책을 다정하게 권유하듯 부드럽게 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c55',
    emoji: '🎞️',
    title: { ko: '중급 55: 회상을 나타낼 때', en: 'Intermediate 55: Expressing Recollection' },
    tagline: { ko: '추억과 미완료 · 직접 겪은 소감 · 여운 남기기', en: 'Memories and unfinished actions, firsthand impressions, lingering nuance' },
    blurb: { ko: '-던, -더라고요, -던데요 … 과거에 자주 하거나 하다 만 일을 꾸미고, 직접 눈으로 확인한 사실을 생생하고 부드럽게 전합니다.', en: 'Recollect repeated/unfinished past actions (-던), share firsthand discoveries (-더라고요), and offer gentle observations inviting response (-던데요).' },
    level: 'Intermediate',
    needs: 'im-c54',
    lessons: [
      {
        id: "im-c55-01", title: "1강. 과거의 기억을 수식하기 (-던 vs -(으)ㄴ)", minutes: 4,
        blocks: [
          {"t":"text","h":"완료된 일과 되풀이했거나 하다 만 일","md":"명사를 과거의 일로 꾸밀 때 두 표현이 갈립니다.\\n\\n- **-(으)ㄴ**: 과거에 **한 번 완료되어 끝난 일**\\n> 어제 **읽은** 책 (다 읽었음)\\n- **-던**: 과거에 **지속적으로 반복했거나, 하다가 도중에 중단된 일**\\n> 어릴 때 자주 **놀던** 골목길 (반복)\\n> 아까 마시**던** 커피 (아직 덜 마셨음)"},
          {"t":"table","head":["구분","사전형","-(으)ㄴ (완료)","-던 (반복/미완료)"],"rows":[["동사 (받침 없음)","가다 — to go","간 곳 (방문 완료)","자주 가던 곳 (단골)"],["동사 (받침 있음)","읽다 — to read","읽은 책 (다 읽음)","읽던 책 (읽는 도중)"],["동사 (받침 있음)","입다 — to wear","입은 옷 (착용 완료)","입던 옷 (평소 입던 헌 옷)"],["형용사 (전체)","맑다 — to be clear","맑은 날 (현재)","맑던 하늘 (과거엔 맑았음)"]]},
          {"t":"chars","wide":true,"items":[{"ch":"테이블 위에 마시던 커피는 버리지 마세요.","tip":"Please do not throw away the coffee I was drinking on the table."},{"ch":"여기가 제가 초등학생 때 매일 다니던 길이에요.","tip":"This is the street I used to walk along every day when I was an elementary student."},{"ch":"맑던 하늘이 갑자기 흐려지더니 비가 오네요.","tip":"The sky that used to be clear suddenly became overcast and it is raining."}]},
          {"t":"cloze","sentence":"책상 위에 [읽던] 책을 그대로 두고 나왔어요.","answer":"읽던","meaning":"I left the house leaving the book I was in the middle of reading on the desk.","options":["읽던","읽은","읽을","읽는"],"keys":["읽던","읽은","읽을","읽는"],"why":"다 읽은 책이 아니라 도중에 읽다 만 상태로 두고 나온 것이므로 미완료를 뜻하는 **-던**이 맞습니다."},
          {"t":"choice","q":"과거 학창 시절에 자주 다니던 분식집을 회상할 때 가장 알맞은 것은?","options":["여기가 고등학교 때 자주 가던 분식집이에요.","여기가 고등학교 때 자주 간 분식집이에요.","여기가 고등학교 때 자주 갈 분식집이에요."],"answer":0,"why":"과거에 습관처럼 자주 되풀이했던 장소를 회상하므로 **가던**이 자연스럽습니다."},
          {"t":"type","q":"살다 — 「이 동네는 제가 태어나서 십 년 동안 ___ 곳이에요.」 과거의 지속을 나타내세요.","answer":"살던","keys":["살던","살았던"],"why":"ㄹ 받침 탈락과 함께 과거 회상 어미 **-던**이 붙어 **살던**이 됩니다."},
          {"t":"order","q":"「제가 대학교 다닐 때 입던 옷이 아직도 맞네요.」 를 순서대로 만들어 보세요.","tokens":["제가 대학교","다닐 때","입던 옷이","아직도 맞네요."],"answer":["제가 대학교","다닐 때","입던 옷이","아직도 맞네요."]},
          {"t":"note","md":"**-았/었던과의 차이**\\n- **-던**: 과거에 반복되었거나 최근까지 이어지던 일\\n- **-았/었던**: 과거에 있었으나 지금은 완전히 끝난 먼 기억\\n> 예전에 사귀**었던** 사람 (지금은 헤어짐)"},
          {"t":"speak","say":"어릴 때 부모님과 함께 살던 고향 마을에 오랜만에 가 보고 싶어요.","q":"어린 시절의 아련한 추억을 떠올리듯 따뜻하게 말해 보세요."},
        ],
      },
      {
        id: "im-c55-02", title: "2강. 직접 겪은 일 생생하게 전하기 (-더라고요)", minutes: 4,
        blocks: [
          {"t":"text","h":"직접 보고 겪은 새로운 발견을 전달할 때","md":"**-더라고요** 는 말하는 사람이 **과거에 직접 경험하거나 눈으로 보아 알게 된 사실을 상대방에게 생생하게 전할 때** 씁니다.\\n> 주말에 가 보니까 사람이 정말 **많더라고요**.\\n\\n남에게서 들은 말이 아니라 **화자 본인의 직접 체험**이어야 합니다."},
          {"t":"table","head":["결합 형태","사전형","-더라고요","의미"],"rows":[["동사 현재","잘하다 — to do well","잘하더라고요","직접 보니 잘하더라는 사실"],["동사 과거","출발하다 — to depart","출발했더라고요","가 보니 이미 떠났다는 사실"],["형용사","맛있다 — to be delicious","맛있더라고요","먹어 보니 맛있었다는 소감"],["명사","의사 — doctor","의사더라고요","알고 보니 의사더라는 발견"]]},
          {"t":"chars","wide":true,"items":[{"ch":"어제 그 영화 봤는데 생각보다 훨씬 감동적이더라고요.","tip":"I watched that movie yesterday and it was much more touching than I thought."},{"ch":"새로 개업한 식당에 가 봤는데 밑반찬이 정갈하더라고요.","tip":"I went to the newly opened restaurant and the side dishes were neat."},{"ch":"아침 일찍 갔는데도 벌써 줄이 길게 늘어서 있더라고요.","tip":"Even though I went early in the morning, a long line was already formed."}]},
          {"t":"cloze","sentence":"직접 입어 보니까 원단도 부드럽고 핏이 아주 [예쁘더라고요].","answer":"예쁘더라고요","meaning":"When I tried it on in person, the fabric was soft and the fit was really pretty.","options":["예쁘더라고요","예쁘던데요","예쁠 만해요","예쁘도록 해요"],"keys":["예쁘더라고요","예쁘던데요","예쁠 만해요","예쁘도록 해요"],"why":"자신이 직접 입어 보고 확인한 인상과 사실을 생생히 증언하듯 전하므로 **-더라고요**가 맞습니다."},
          {"t":"choice","q":"직접 가 본 여행지에 대해 친구에게 후기를 들려줄 때 가장 자연스러운 것은?","options":["바닷물이 투명하고 경치가 정말 아름답더라고요.","바닷물이 투명하고 경치가 정말 아름답도록 하세요.","바닷물이 투명하고 경치가 정말 아름답지 그랬어요."],"answer":0,"why":"자신의 직접 관찰 경험을 공유할 때는 **-더라고요**를 씁니다."},
          {"t":"type","q":"친절하다 — 「상담 직원에게 문의해 보니까 아주 ___ .」 직접 겪은 소감을 쓰세요.","answer":"친절하더라고요","keys":["친절하더라고요","친절하더군요","친절하던데요"],"why":"체험을 통해 알게 된 사실을 전달하므로 형용사 어간 뒤에 **-더라고요**를 붙여 **친절하더라고요**가 됩니다."},
          {"t":"order","q":"「퇴근 시간에 지하철을 타니까 사람이 정말 많더라고요.」 를 순서대로 만들어 보세요.","tokens":["퇴근 시간에","지하철을 타니까","사람이 정말","많더라고요."],"answer":["퇴근 시간에","지하철을 타니까","사람이 정말","많더라고요."]},
          {"t":"note","md":"**주의할 점**\\n말하는 사람 자신의 주관적 감정에는 잘 쓰지 않습니다.\\n- ❌ 제가 어제 참 슬프더라고요.\\n- ⭕ (친구가 우는 걸 보고) 친구가 참 슬퍼하더라고요."},
          {"t":"speak","say":"그 집 김치찌개가 국물도 진하고 고기도 듬뿍 들어 있더라고요.","q":"맛있는 식당을 친구에게 신나서 자랑하듯 말해 보세요."},
        ],
      },
      {
        id: "im-c55-03", title: "3강. 여운을 남기며 반응 기다리기 (-던데요)", minutes: 4,
        blocks: [
          {"t":"text","h":"목격한 사실을 알리며 상대의 반응을 유도할 때","md":"**-던데요** 는 자신이 직접 보거나 겪은 사실을 전하면서, **말끝에 여운을 남겨 상대방의 반응이나 대답을 자연스럽게 기다릴 때** 씁니다.\\n> 아까 보니까 사무실에 불이 켜져 있**던데요**?\\n\\n「-더라고요」가 단호하게 정보를 전하는 느낌이라면, 「-던데요」는 말끝을 열어 두어 대화를 부드럽게 이어 주는 효과가 있습니다."},
          {"t":"table","head":["표현","말투의 종결감","대화 유도","예문"],"rows":[["-더라고요","자기 경험의 확실한 전달","정보 공유 중심","그 친구 한국어 아주 잘하더라고요."],["-던데요","말끝을 부드럽게 열어 둠","상대방의 반응이나 확인 유도","그 친구 한국어 아주 잘하던데요?"]]},
          {"t":"chars","wide":true,"items":[{"ch":"민수 씨 아까 통화하면서 밖으로 나가던데요.","tip":"I saw Minsu walking outside while on the phone earlier."},{"ch":"어제 날씨 예보를 보니까 내일 비 온다던데요.","tip":"Looking at yesterday's weather forecast, they said it would rain tomorrow."},{"ch":"그 식당 점심시간에는 예약 안 하면 자리 없던데요.","tip":"At lunchtime in that restaurant, there were no seats unless reserved."}]},
          {"t":"cloze","sentence":"A: 「오늘 김 과장님 기분 어때 보여요?」 B: 「아침에 보니까 표정이 아주 [밝으시던데요].」","answer":"밝으시던데요","meaning":"A: How does Manager Kim's mood look today? B: Seeing him in the morning, his expression was very bright.","options":["밝으시던데요","밝으시도록 해요","밝으실 만해요","밝으셔야지요"],"keys":["밝으시던데요","밝으시도록 해요","밝으실 만해요","밝으셔야지요"],"why":"과거 아침에 목격한 상대의 상태를 질문자에게 여운을 남기며 전하므로 **-던데요**가 어울립니다."},
          {"t":"choice","q":"동료가 찾는 서류의 위치를 목격한 대로 알려 줄 때 가장 자연스러운 것은?","options":["그 서류 아까 복사기 옆에 놓여 있던데요.","그 서류 아까 복사기 옆에 놓이도록 하세요.","그 서류 아까 복사기 옆에 놓이지 그랬어요."],"answer":0,"why":"자신이 목격한 과거의 상황을 부드럽게 짚어 줄 때는 **-던데요**를 씁니다."},
          {"t":"type","q":"재미있다 — 「어제 그 연극 봤는데 배우들 연기가 정말 ___ .」 목격한 소감을 쓰세요.","answer":"재미있던데요","keys":["재미있던데요","재밌던데요","재미있더라고요"],"why":"직접 관람한 연극의 감상을 상대에게 부드럽게 건네므로 **재미있던데요**가 됩니다."},
          {"t":"order","q":"「밖에 나가 보니까 바람이 꽤 쌀쌀하던데요.」 를 순서대로 만들어 보세요.","tokens":["밖에","나가 보니까","바람이 꽤","쌀쌀하던데요."],"answer":["밖에","나가 보니까","바람이 꽤","쌀쌀하던데요."]},
          {"t":"note","md":"**반말 표현**\\n친구 사이에서는 요를 떼고 **'-던데'** 로 씁니다.\\n> 아까 보니까 문 닫았**던데**?"},
          {"t":"speak","say":"수진 씨 오늘 예쁜 원피스 입고 출근하셨던데요.","q":"동료의 멋진 모습을 떠올리며 흐뭇하게 전하듯 말해 보세요."},
        ],
      },
      {
        id: "im-c55-04", title: "4강. 실전 대화에서 과거 경험 나누기", minutes: 5,
        blocks: [
          {"t":"text","h":"회상 3총사로 풍성해지는 대화","md":"과거의 기억을 상대와 나누는 실전 기술입니다.\\n\\n- **-던**: 예전에 자주 하거나 하다 만 일 수식 (추억, 단골)\\n- **-더라고요**: 내 체험을 확신을 가지고 생생하게 전달 (후기, 리뷰)\\n- **-던데요**: 목격한 상황을 전하며 대화 이어가기 (목격담, 완곡한 정보)"},
          {"t":"chars","wide":true,"items":[{"ch":"어릴 때 살던 동네에 가 보니까 빌딩이 많이 들어섰더라고요.","tip":"When I went to the neighborhood I used to live in as a child, lots of buildings had gone up."},{"ch":"아까 회의실 지나가다 보니까 아직 회의 중이시던데요.","tip":"Passing by the meeting room earlier, they were still in the meeting."},{"ch":"매일 마시던 커피를 끊으니까 밤에 잠이 훨씬 잘 오더라고요.","tip":"Quitting the coffee I used to drink daily, sleep comes much better at night."}]},
          {"t":"cloze","sentence":"신혼여행 때 [묵었던] 호텔이 이번에 리모델링을 했대요.","answer":"묵었던","meaning":"The hotel we stayed at during our honeymoon has reportedly been remodeled.","options":["묵었던","묵을","묵는","묵던"],"keys":["묵었던","묵을","묵는","묵던"],"why":"과거 신혼여행이라는 특정 시점에 완료되었던 먼 과거의 일화이므로 **-았/었던**이 맞습니다."},
          {"t":"choice","q":"주말에 다녀온 캠핑장의 시설에 대해 묻는 친구에게 솔직한 체험담을 건넬 때 알맞은 것은?","options":["시설도 깨끗하고 온수도 잘 나오더라고요.","시설도 깨끗하고 온수도 잘 나오도록 하세요.","시설도 깨끗하고 온수도 잘 나오지 그랬어요."],"answer":0,"why":"자신의 실제 캠핑 체험을 생생하고 분명하게 전달하므로 **-더라고요**를 씁니다."},
          {"t":"cloze","sentence":"A: 「오늘 은행 대기 줄이 길까요?」 B: 「아까 지나오면서 보니까 손님이 별로 [없던데요].」","answer":"없던데요","meaning":"A: Will the bank queue be long today? B: Passing by earlier, there weren't many customers.","options":["없던데요","없도록 해요","없을 만해요","없어야지요"],"keys":["없던데요","없도록 해요","없을 만해요","없어야지요"],"why":"자신이 방금 전 목격한 은행 모습을 알려 주며 안심시키는 맥락이므로 **-던데요**입니다."},
          {"t":"type","q":"입다 — 「작년에 자주 ___ 겨울 코트가 어디 갔지?」 자주 입었던 과거의 옷을 수식하세요.","answer":"입던","keys":["입던","입었던"],"why":"작년에 지속적으로 반복해서 착용했던 옷이므로 회상 관형사형 **입던**이 됩니다."},
          {"t":"order","q":"「새로 나온 전자기기를 써 보니까 배터리가 오래가더라고요.」 를 순서대로 만들어 보세요.","tokens":["새로 나온","전자기기를 써 보니까","배터리가","오래가더라고요."],"answer":["새로 나온","전자기기를 써 보니까","배터리가","오래가더라고요."]},
          {"t":"note","md":"**이야기꾼이 되는 법**\\n단순히 \"좋았어요\"라고 끝내지 않고 **\"직접 해 보니까 정말 재미있더라고요!\"**라고 회상 표현을 덧붙이면 대화가 훨씬 입체적이고 흥미로워집니다."},
          {"t":"speak","say":"오랜만에 모교를 찾아가 보니까 예전에 공부하던 도서관이 그대로 있더라고요.","q":"모교를 방문한 반가움과 감회를 실어 부드럽게 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c56',
    emoji: '🚪',
    title: { ko: '중급 56: 피동을 나타낼 때', en: 'Intermediate 56: Passive Expressions' },
    tagline: { ko: '저절로 열리는 문 · 되어진 상황 · 상황의 변화', en: 'Doors opening on their own, situations formed, changing states' },
    blurb: { ko: '단어 피동(-이/히/리/기-), -아/어지다, -게 되다 … 행동을 당하거나 저절로 일어나는 상황, 환경의 변화로 그렇게 된 결과를 자연스럽게 표현합니다.', en: 'Express passive states with lexical passives (-이/히/리/기-), resultant states (-아/어지다), and circumstantial changes (-게 되다).' },
    level: 'Intermediate',
    needs: 'im-c55',
    lessons: [
      {
        id: "im-c56-01", title: "1강. 행동을 당하거나 저절로 될 때 (단어 피동 -이/히/리/기-)", minutes: 4,
        blocks: [
          {"t":"text","h":"능동에서 피동으로: 목적어가 주어로","md":"**피동** 은 주어가 다른 힘이나 대상에 의해 **어떤 행동을 당하거나, 어떤 현상이 저절로 일어남**을 나타냅니다.\\n> 바람에 문이 **열렸어요**.\\n> 저 멀리 남산타워가 **보여요**.\\n\\n동사에 따라 붙는 접미사(-이-, -히-, -리-, -기-)가 정해져 있어 짝을 맞추어 익혀야 합니다."},
          {"t":"table","head":["접미사","능동사","피동사","예문"],"rows":[["-이-","보다 / 쓰다 / 놓다","보이다 / 쓰이다 / 놓이다","글씨가 잘 안 보여요."],["-히-","닫다 / 읽다 / 잡다","닫히다 / 읽히다 / 잡히다","도둑이 경찰에게 잡혔어요."],["-리-","열다 / 듣다 / 풀다","열리다 / 들리다 / 풀리다","어려운 문제가 드디어 풀렸어요."],["-기-","끊다 / 안다 / 쫓다","끊기다 / 안기다 / 쫓기다","전화가 갑자기 끊겼어요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"창문이 바람에 저절로 닫혔어요.","tip":"The window closed on its own in the wind."},{"ch":"밖에서 이상한 소리가 들려요.","tip":"A strange noise is heard from outside."},{"ch":"아이가 엄마 품에 폭 안겼어요.","tip":"The child was embraced warmly in mom's arms."}]},
          {"t":"cloze","sentence":"바람이 너무 세게 불어서 방문이 쾅 하고 [닫혔어요].","answer":"닫혔어요","meaning":"Because the wind blew so hard, the room door slammed shut.","options":["닫혔어요","닫았어요","닫아졌어요","닫게 됐어요"],"keys":["닫혔어요","닫았어요","닫아졌어요","닫게 됐어요"],"why":"문이 주어가 되어 바람에 의해 닫히는 동작을 당했으므로 '닫다'의 피동사 **닫혔어요**가 맞습니다."},
          {"t":"choice","q":"능동문 「경찰이 범인을 잡았다」를 피동문으로 바르게 전환한 것은?","options":["범인이 경찰에게 잡혔다.","범인이 경찰에게 잡았다.","범인을 경찰에게 잡혔다."],"answer":0,"why":"능동의 목적어(범인을)가 주어(범인이)로 바뀌고, 주어(경찰이)는 부사어(경찰에게)로, 동사는 피동사(잡혔다)가 됩니다."},
          {"t":"type","q":"열다 — 「버스가 멈추자 앞문이 스르륵 ___ .」 피동 과거형으로 쓰세요.","answer":"열렸어요","keys":["열렸어요","열렸다","열리었어요"],"why":"'열다'의 피동사는 '열리다'이며 과거형은 **열렸어요**가 됩니다."},
          {"t":"order","q":"「저 멀리 안개 속에서 산봉우리가 보여요.」 를 순서대로 만들어 보세요.","tokens":["저 멀리","안개 속에서","산봉우리가","보여요."],"answer":["저 멀리","안개 속에서","산봉우리가","보여요."]},
          {"t":"note","md":"**조사 변화에 주목하세요**\\n- 능동문: 제가(주어) 문을(목적어) 열었어요.\\n- 피동문: 문이(주어) 바람에(원인) **열렸어요**.\\n피동사 앞에는 '을/를' 대신 **'이/가'** 가 옵니다."},
          {"t":"speak","say":"안개가 걷히니까 건너편 바다 풍경이 한눈에 환하게 보여요.","q":"가슴이 탁 트이는 경치를 감상하듯 상쾌한 톤으로 말해 보세요."},
        ],
      },
      {
        id: "im-c56-02", title: "2강. 저절로 그렇게 되어진 상황 (-아/어지다)", minutes: 4,
        blocks: [
          {"t":"text","h":"누가 했는지보다 그렇게 된 상태에 주목할 때","md":"**-아/어지다** 는 동사 뒤에 붙어 **누가 했는지를 밝히지 않고, 결과적으로 그렇게 만들어진 상태**를 나타냅니다.\\n> 이 책은 전 세계 30개국 언어로 **번역되었어요**.\\n\\n형용사에 붙으면 '상태의 변화(따뜻해지다)'를 뜻하지만, **동사에 붙으면 피동**의 의미가 됩니다."},
          {"t":"table","head":["어간 모음","사전형","-아/어지다 형태","예문"],"rows":[["양성 모음 (ㅏ, ㅗ)","삼키다 / 작아지다","삼켜지다","알약이 잘 안 삼켜져요."],["음성 모음 (ㅓ, ㅜ 등)","만들다 / 쓰다","만들어지다 / 써지다","이 도자기는 흙으로 만들어졌어요."],["하다 동사","정하다 / 취소하다","정해지다 / 취소되다","회의 날짜가 다음 주로 정해졌어요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"새 펜이라 그런지 글씨가 아주 부드럽게 잘 써져요.","tip":"Maybe because it is a new pen, writing flows very smoothly."},{"ch":"사정이 생겨서 오늘 약속이 다음 주로 미뤄졌어요.","tip":"Due to circumstances, today's appointment was postponed to next week."},{"ch":"사건의 진실이 드디어 세상에 밝혀졌습니다.","tip":"The truth of the incident was finally revealed to the world."}]},
          {"t":"cloze","sentence":"이 공원은 시민들의 휴식을 위해 아름답게 [조성되었어요].","answer":"조성되었어요","meaning":"This park was beautifully created for citizens' rest.","options":["조성되었어요","조성하도록 했어요","조성할 만해요","조성지 그랬어요"],"keys":["조성되었어요","조성됐어요","조성되어졌어요"],"why":"공원이 조성된 결과 상태를 나타내므로 하다 동사의 피동형인 **-되다 / -어지다**가 적절합니다."},
          {"t":"choice","q":"잘못된 이중 피동 표현을 바르게 고친 문장은?","options":["창문에 메모가 쓰여 있다.","창문에 메모가 쓰여져 있다.","창문에 메모를 쓰여지다."],"answer":0,"why":"'쓰이다' 자체가 이미 피동이므로 다시 '-어지다'를 붙인 '쓰여지다'는 불필요한 이중 피동입니다. **쓰여 있다** 또는 **써져 있다**가 바릅니다."},
          {"t":"type","q":"만들다 — 「이 영화는 실화를 바탕으로 ___ .」 과거 피동형으로 쓰세요.","answer":"만들어졌어요","keys":["만들어졌어요","만들어졌다","만들어졌습니다"],"why":"동사 '만들다'에 피동 어미 **-어지다**의 과거형이 결합하여 **만들어졌어요**가 됩니다."},
          {"t":"order","q":"「다음 달 워크숍 일정이 최종적으로 확정되었습니다.」 를 순서대로 만들어 보세요.","tokens":["다음 달 워크숍","일정이","최종적으로","확정되었습니다."],"answer":["다음 달 워크숍","일정이","최종적으로","확정되었습니다."]},
          {"t":"note","md":"**이중 피동 피하기**\\n이미 접미사(-이/히/리/기-)가 들어간 피동사에 '-아/어지다'를 겹쳐 쓰지 마세요.\\n- ❌ 닫혀지다 → ⭕ **닫히다**\\n- ❌ 열려지다 → ⭕ **열리다**\\n- ❌ 잊혀지다 → ⭕ **잊히다**"},
          {"t":"speak","say":"그 노래를 들으면 옛날 추억이 눈앞에 그림처럼 그려져요.","q":"마음속에 자연스럽게 떠오르는 감성을 담아 말해 보세요."},
        ],
      },
      {
        id: "im-c56-03", title: "3강. 환경과 상황의 변화로 그렇게 됨 (-게 되다)", minutes: 4,
        blocks: [
          {"t":"text","h":"내 의지보다 상황과 인연으로 흘러간 결과","md":"**-게 되다** 는 주어의 직접적인 의지라기보다, **외부의 환경, 규칙, 상황 변화에 의해 그런 결과에 이르게 되었음**을 나타냅니다.\\n> 회사 발령으로 부산에서 일하**게 됐어요**.\\n\\n자신의 성과나 결정을 지나치게 자랑하지 않고 겸손하고 완곡하게 전할 때도 자주 쓰입니다."},
          {"t":"table","head":["원래 계획 / 계기","동사","-게 되다","뉘앙스"],"rows":[["회사 인사 발령","가다","가게 되다","상황에 따라 발령남"],["우연한 만남","알다","알게 되다","자연스럽게 알게 됨"],["팀장 승진","맡다","맡게 되다","조직의 결정으로 맡음"],["장학금 선정","받다","받게 되다","결과적으로 받게 됨"]]},
          {"t":"chars","wide":true,"items":[{"ch":"다음 달부터 본사 기획팀에서 근무하게 되었습니다.","tip":"I have come to work in the headquarters planning team from next month."},{"ch":"우연한 기회에 한국 전통 음악을 접하게 됐어요.","tip":"By coincidence, I came across traditional Korean music."},{"ch":"선생님 덕분에 한국어에 큰 흥미를 갖게 되었어요.","tip":"Thanks to my teacher, I came to take great interest in Korean."}]},
          {"t":"cloze","sentence":"친구의 소개로 지금의 아내를 [만나게 되었어요].","answer":"만나게 되었어요","meaning":"Through a friend's introduction, I came to meet my current wife.","options":["만나게 되었어요","만나도록 했어요","만날 만했어요","만나지 그랬어요"],"keys":["만나게 되었어요","만나게 됐어요","만나게 되었지요"],"why":"소개라는 외부의 인연과 계기를 통해 만남으로 이어진 과정을 부드럽게 회고하므로 **-게 되다**가 맞습니다."},
          {"t":"choice","q":"새로운 직책을 맡게 된 소식을 팀원들에게 겸손하고 정중하게 알릴 때 알맞은 것은?","options":["이번에 프로젝트 총괄을 맡게 되었습니다.","이번에 프로젝트 총괄을 맡도록 하세요.","이번에 프로젝트 총괄을 맡지 그랬어요."],"answer":0,"why":"공식 직책 부임 소식을 겸양을 갖추어 전할 때는 **-게 되었습니다**를 씁니다."},
          {"t":"type","q":"살다 — 「부모님 직장 때문에 어릴 때 외국에서 몇 년 동안 ___ .」 환경적 결과를 쓰세요.","answer":"살게 되었어요","keys":["살게 되었어요","살게 됐어요","살게 되었습니다"],"why":"부모님 직장이라는 외적 요인으로 거주하게 된 결과이므로 **살게 되었어요**가 됩니다."},
          {"t":"order","q":"「이야기를 나누다 보니 서로 고향 친구라는 것을 알게 되었어요.」 를 순서대로 만들어 보세요.","tokens":["이야기를 나누다 보니","서로 고향 친구라는 것을","알게 되었어요."],"answer":["이야기를 나누다 보니","서로 고향 친구라는 것을","알게 되었어요."]},
          {"t":"note","md":"**말할 때의 줄임꼴**\\n구어 대화에서는 '되었어요'를 축약하여 **'-게 됐어요'** 로 훨씬 자주 발음하고 표기합니다."},
          {"t":"speak","say":"장학생으로 선발되어 다음 학기 등록금을 지원받게 되었습니다.","q":"기쁜 소식을 겸손하고 감사한 마음을 담아 전해 보세요."},
        ],
      },
      {
        id: "im-c56-04", title: "4강. 실전 대화에서 피동문 자연스럽게 쓰기", minutes: 5,
        blocks: [
          {"t":"text","h":"능동보다 피동이 더 부드러운 한국어","md":"한국어에서는 직설적으로 남의 행동을 지적하기보다 피동을 써서 상황을 객관화하면 훨씬 공손하게 들립니다.\\n\\n- **단어 피동 (-이/히/리/기-)**: 구체적인 사물의 동작이나 감각 (보이다, 들리다, 열리다)\\n- **-아/어지다**: 결과적 상태나 조성 (만들어지다, 취소되다)\\n- **-게 되다**: 사람의 처지와 인연, 상황 변화 (가게 되다, 알게 되다)"},
          {"t":"chars","wide":true,"items":[{"ch":"지하철 출입문이 닫힙니다. 안전선 밖으로 물러서 주시기 바랍니다.","tip":"Subway doors are closing. Please step behind the yellow line."},{"ch":"갑작스러운 폭설로 비행기 운항이 전면 취소되었습니다.","tip":"Due to sudden heavy snow, flight operations have been entirely cancelled."},{"ch":"좋은 기회로 이번 학기에 인턴십을 진행하게 되었어요.","tip":"Through a good opportunity, I have come to do an internship this semester."}]},
          {"t":"cloze","sentence":"전화 통화 도중: 「지하라서 그런지 목소리가 잘 안 [들려요].」","answer":"들려요","meaning":"During a phone call: Maybe because it's underground, I can't hear your voice well.","options":["들려요","들어요","들어져요","듣게 돼요"],"keys":["들려요","들어요","들어져요","듣게 돼요"],"why":"소리가 귀에 들어오는 지각 현상을 나타내므로 '듣다'의 피동사 **들려요**가 맞습니다."},
          {"t":"choice","q":"비즈니스 이메일에서 계약 체결 소식을 공식적으로 알릴 때 가장 품격 있는 문장은?","options":["양사의 협력 계약이 성공적으로 체결되었습니다.","양사의 협력 계약을 성공적으로 체결하도록 하세요.","양사의 협력 계약을 성공적으로 체결하지 그랬어요."],"answer":0,"why":"공식 비즈니스 문서에서 결과적 완료 상태를 격식 있게 보고할 때는 피동형 **체결되었습니다**를 씁니다."},
          {"t":"cloze","sentence":"사정이 생겨서 오늘 회의는 다음 주 수요일로 [연기되었습니다].","answer":"연기되었습니다","meaning":"Due to circumstances, today's meeting has been postponed to next Wednesday.","options":["연기되었습니다","연기하도록 했습니다","연기할 만했습니다","연기하지 그랬습니다"],"keys":["연기되었습니다","연기됐습니다","연기되었어요"],"why":"회의 일정이 불가피하게 미뤄진 상황을 객관적으로 안내하므로 피동형 **연기되었습니다**가 맞습니다."},
          {"t":"type","q":"바꾸다 — 「스마트폰 운영체제가 업데이트되면서 설정 화면이 완전히 ___ .」 피동 과거형으로 쓰세요.","answer":"바뀌었어요","keys":["바뀌었어요","바뀌었다","바뀌었습니다"],"why":"'바꾸다'의 피동사는 '바뀌다'이며 과거형은 **바뀌었어요**가 됩니다."},
          {"t":"order","q":"「회사 방침이 바뀌어서 재택근무를 하게 되었습니다.」 를 순서대로 만들어 보세요.","tokens":["회사 방침이","바뀌어서","재택근무를","하게 되었습니다."],"answer":["회사 방침이","바뀌어서","재택근무를","하게 되었습니다."]},
          {"t":"note","md":"**완곡한 배려의 말하기**\\n\"네 목소리가 안 들려\"라고 상대를 탓하는 대신, **\"목소리가 잘 안 들려요\"**(피동)라고 하면 전파나 기계 탓으로 돌려 상대의 마음을 상하지 않게 합니다."},
          {"t":"speak","say":"주변이 너무 시끄러워서 상대방 목소리가 잘 안 들리네요.","q":"주변 소음 때문에 잘 안 들린다는 상황을 차분하게 양해 구하듯 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c57',
    emoji: '👶',
    title: { ko: '중급 57: 사동을 나타낼 때', en: 'Intermediate 57: Causative Expressions' },
    tagline: { ko: '남에게 시키기 · 밥 먹이고 옷 입히기 · 배려와 부탁', en: 'Making someone do something, feeding and dressing, care and requests' },
    blurb: { ko: '단어 사동(-이/히/리/기/우/추-), -게 하다 … 남에게 어떤 행동을 하게 하거나 시키는 사동의 원리와 다양한 활용법을 익힙니다.', en: 'Master causative structures with lexical causatives (-이/히/리/기/우/추-) and periphrastic causatives (-게 하다).' },
    level: 'Intermediate',
    needs: 'im-c56',
    lessons: [
      {
        id: "im-c57-01", title: "1강. 남에게 시키고 하게 만들기 (단어 사동 -이/히/리/기-)", minutes: 4,
        blocks: [
          {"t":"text","h":"주어가 남에게 어떤 행동을 하도록 만들 때","md":"**사동** 은 주어가 직접 행동하는 것이 아니라, **남에게 그 행동을 하도록 시키거나 만드는 표현**입니다.\\n> 엄마가 아이에게 밥을 **먹여요** (먹다 + 이).\\n> 아빠가 아이에게 신발을 **신기지요** (신다 + 기).\\n\\n동사 어간 뒤에 접미사 **-이-, -히-, -리-, -기-** 가 붙어 새로운 사동사를 만듭니다."},
          {"t":"table","head":["접미사","기본 동사","사동사","문장 예시"],"rows":[["-이-","보다 / 먹다 / 속다","보이다 / 먹이다 / 속이다","아이에게 약을 먹였어요."],["-히-","앉다 / 입다 / 눕다","앉히다 / 입히다 / 눕히다","의자에 아이를 앉혔어요."],["-리-","알다 / 울다 / 날다","알리다 / 울리다 / 날리다","좋은 소식을 친구에게 알렸어요."],["-기-","웃다 / 신다 / 빗다","웃기다 / 신기다 / 빗기다","재미있는 이야기로 친구를 웃겼어요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"언니가 동생에게 예쁜 코트를 입혀 주었어요.","tip":"Older sister dressed her younger sibling in a pretty coat."},{"ch":"양파를 썰다가 매워서 눈물을 흘렸어요.","tip":"While chopping onions, it was pungent so I shed tears."},{"ch":"새로운 사실을 모든 팀원에게 신속하게 알렸습니다.","tip":"I swiftly informed all team members of the new facts."}]},
          {"t":"cloze","sentence":"외출하기 전에 아이에게 따뜻한 옷을 [입혔어요].","answer":"입혔어요","meaning":"Before going out, I dressed the child in warm clothes.","options":["입혔어요","입었어요","입어질 거예요","입게 됐어요"],"keys":["입혔어요","입었어요","입어질 거예요","입게 됐어요"],"why":"주어가 아이에게 옷을 입도록 행동을 시켰으므로 '입다'의 사동사 **입혔어요**가 맞습니다."},
          {"t":"choice","q":"기본형 「친구가 웃다」를 사동문으로 바르게 바꾼 것은?","options":["내가 친구를 웃겼다.","내가 친구를 웃었다.","내가 친구에게 웃기었다."],"answer":0,"why":"'웃다'의 사동사는 '웃기다'이며, 주어 '내가'가 목적어 '친구를' 웃게 만든 것이므로 **내가 친구를 웃겼다**가 됩니다."},
          {"t":"type","q":"앉다 — 「선생님이 학생을 앞자리에 ___ .」 사동 과거형으로 쓰세요.","answer":"앉혔어요","keys":["앉혔어요","앉혔다","앉히었어요"],"why":"'앉다'의 사동사는 '앉히다'이며 과거형은 **앉혔어요**가 됩니다."},
          {"t":"order","q":"「새로운 소식을 가족들에게 가장 먼저 알렸어요.」 를 순서대로 만들어 보세요.","tokens":["새로운 소식을","가족들에게","가장 먼저","알렸어요."],"answer":["새로운 소식을","가족들에게","가장 먼저","알렸어요."]},
          {"t":"note","md":"**사동문의 문장 구조**\\n주어 + **대상에게(또는 를)** + 목적어(을/를) + **사동사**\\n> 의사 선생님이(주어) 환자에게(대상) 약을(목적어) **먹였어요**."},
          {"t":"speak","say":"부모님께 안부 전화를 드려서 제 근황을 자세히 알려 드렸어요.","q":"부모님께 다정하게 소식을 전하듯 효심 어린 목소리로 말해 보세요."},
        ],
      },
      {
        id: "im-c57-02", title: "2강. 특수 단어 사동 (-우/구/추-)", minutes: 4,
        blocks: [
          {"t":"text","h":"자다, 타다, 서다를 남에게 시킬 때","md":"일부 동사들은 -이/히/리/기- 대신 **-우-, -구-, -추-** 라는 특별한 접미사가 붙어 사동사를 이룹니다.\\n\\n육아, 운전, 일정 조율 등 일상 대화에서 가장 자주 쓰이는 핵심 어휘들입니다.\\n> 자다 → **재우다** (아이를 재우다)\\n> 타다 → **태우다** (차에 손님을 태우다)\\n> 서다 → **세우다** (차를 길가에 세우다)"},
          {"t":"table","head":["사동 접미사","기본 동사","사동사","예문"],"rows":[["-우-","자다 / 타다 / 서다 / 깨다","재우다 / 태우다 / 세우다 / 깨우다","아이를 침대에 눕혀 재웠어요."],["-구-","돋다","돋구다 / 돋우다","식욕을 돋우는 맛있는 냄새"],["-추-","늦다 / 낮다 / 맞다","늦추다 / 낮추다 / 맞추다","회의 시간을 한 시간 늦췄어요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"아침 일찍 출근하는 남편을 깨웠어요.","tip":"I woke up my husband who goes to work early in the morning."},{"ch":"지하철역까지 제 차로 태워다 드릴게요.","tip":"I will give you a ride to the subway station in my car."},{"ch":"볼륨이 너무 크니까 소리 좀 낮춰 줄래?","tip":"The volume is too loud, could you turn it down a bit?"}]},
          {"t":"cloze","sentence":"친구가 늦잠을 잘까 봐 아침 일곱 시에 전화로 [깨워 주었어요].","answer":"깨워 주었어요","meaning":"Worried that my friend might oversleep, I woke them up by phone at 7 AM.","options":["깨워 주었어요","일어나 주었어요","깨게 되었어요","자 주었어요"],"keys":["깨워 주었어요","깨워 줬어요","깨워주었어요"],"why":"자고 있는 사람을 일어나도록 만든 행동이므로 '깨다'의 사동사 '깨우다'를 쓴 **깨워 주었어요**가 맞습니다."},
          {"t":"choice","q":"차가 없는 동료를 목적지까지 차에 실어 데려다줄 때 알맞은 말은?","options":["가는 길인데 제 차에 타실래요? 태워 드릴게요.","가는 길인데 제 차에 타실래요? 타 드릴게요.","가는 길인데 제 차에 타실래요? 서 드릴게요."],"answer":0,"why":"남을 차에 타게 하여 데려다주는 행동은 '타다'의 사동사인 **태우다 (태워 드리다)**를 씁니다."},
          {"t":"type","q":"늦다 — 「일정이 겹쳐서 약속 시간을 세 시로 ___ .」 사동 과거형으로 쓰세요.","answer":"늦췄어요","keys":["늦췄어요","늦추었어요","늦췄습니다"],"why":"'늦다'에 사동 접미사 '-추-'가 붙어 '늦추다'가 되고, 과거형은 **늦췄어요**가 됩니다."},
          {"t":"order","q":"「잠투정하는 아기를 품에 안고 간신히 재웠어요.」 를 순서대로 만들어 보세요.","tokens":["잠투정하는 아기를","품에 안고","간신히","재웠어요."],"answer":["잠투정하는 아기를","품에 안고","간신히","재웠어요."]},
          {"t":"note","md":"**차 태워 줄게!**\\n한국에서 친구끼리 차로 데려다줄 때 **\"내가 집까지 태워 줄게!\"**라는 표현을 정말 많이 씁니다. 반드시 기억해 두세요."},
          {"t":"speak","say":"집에 가는 방향이 같은데 제 차로 역까지 태워다 드릴까요?","q":"동료에게 친절하게 카풀을 제안하듯 상냥한 목소리로 말해 보세요."},
        ],
      },
      {
        id: "im-c57-03", title: "3강. 간접적으로 시키거나 허락하기 (-게 하다)", minutes: 4,
        blocks: [
          {"t":"text","h":"직접 손을 대지 않고 시키거나 허락할 때","md":"**-게 하다** 는 어떤 대상에게 **그 행동을 하도록 지시하거나 환경을 만들어 주거나 허락할 때** 씁니다.\\n> 부모님은 아이가 스스로 방 청소를 **하게 했어요**.\\n\\n- **단어 사동 (직접적)**: 옷을 입히다 (직접 손으로 입혀 줌)\\n- **-게 하다 (간접적)**: 옷을 입게 하다 (스스로 입도록 시키거나 지도함)"},
          {"t":"table","head":["구분","단어 사동 (직접)","-게 하다 (간접)","상황 차이"],"rows":[["밥 먹기","아이에게 밥을 먹이다","아이에게 밥을 먹게 하다","직접 숟가락으로 떠먹임 vs 스스로 먹도록 유도함"],["옷 입기","아이에게 옷을 입히다","아이에게 옷을 입게 하다","직접 옷을 입혀 줌 vs 스스로 입도록 지시함"],["단어 사동 없는 동사","(없음)","직원들을 쉬게 하다","모든 동사·형용사에 자유롭게 결합 가능"]]},
          {"t":"chars","wide":true,"items":[{"ch":"오래 기다리게 해서 정말 죄송합니다.","tip":"I am truly sorry for making you wait so long."},{"ch":"선생님은 학생들이 자유롭게 토론하게 하셨어요.","tip":"The teacher had the students discuss freely."},{"ch":"그 소식은 모든 국민을 기쁘게 만들었습니다.","tip":"That news made the whole nation glad."}]},
          {"t":"cloze","sentence":"약속 장소에 늦게 도착해서 친구를 30분이나 [기다리게 했어요].","answer":"기다리게 했어요","meaning":"Arriving late at the meeting place, I made my friend wait for 30 minutes.","options":["기다리게 했어요","기다리도록 봤어요","기다릴 만했어요","기다리지 그랬어요"],"keys":["기다리게 했어요","기다리게 하였어요","기다리게 했습니다"],"why":"'기다리다'는 단어 사동사가 없으므로 간접 사동형인 **-게 하다**를 써서 **기다리게 했어요**가 맞습니다."},
          {"t":"choice","q":"사동사와 피동사의 모양이 같은 '보이다' 중 사동사로 쓰인 문장은?","options":["선생님께 숙제 공책을 보여 드렸어요.","저 멀리 남산타워가 깨끗하게 보여요.","글씨가 작아서 눈에 잘 안 보여요."],"answer":0,"why":"공책을 남에게 보게 만든 행동이므로 사동사입니다. 나머지는 눈에 저절로 보이는 피동사입니다."},
          {"t":"type","q":"쉬다 — 「주말에는 직원들이 마음 편히 ___ 합시다.」 간접 사동 청유형으로 쓰세요.","answer":"쉬게","keys":["쉬게","쉬게끔"],"why":"직원들이 스스로 쉴 수 있도록 환경을 조성하자는 의미이므로 **쉬게 (쉬게 합시다)**가 됩니다."},
          {"t":"order","q":"「걱정하게 만들어서 정말 죄송하고 감사합니다.」 를 순서대로 만들어 보세요.","tokens":["걱정하게 만들어서","정말 죄송하고","감사합니다."],"answer":["걱정하게 만들어서","정말 죄송하고","감사합니다."]},
          {"t":"note","md":"**사과의 필수 표현**\\n한국인들이 일상에서 사과할 때 가장 많이 쓰는 두 마디:\\n- \"오래 **기다리게 해서** 죄송해요.\"\\n- \"마음 쓰이고 **걱정하게 해서** 미안해요.\""},
          {"t":"speak","say":"연락이 늦어져서 걱정하게 해 드려 정말 죄송합니다.","q":"진심 어린 사과의 마음을 담아 정중하고 차분하게 말해 보세요."},
        ],
      },
      {
        id: "im-c57-04", title: "4강. 실전 대화에서 사동 표현 꺼내 쓰기", minutes: 5,
        blocks: [
          {"t":"text","h":"배려와 감사, 사과의 마음을 전하는 사동법","md":"사동 표현은 남을 배려하거나 미안한 마음을 표현할 때 결정적인 역할을 합니다.\\n\\n- **단어 사동**: 직접적인 도움 (먹이다, 입히다, 태우다, 깨우다)\\n- **-게 하다**: 기다림, 걱정, 허락 (기다리게 하다, 걱정하게 하다)"},
          {"t":"chars","wide":true,"items":[{"ch":"차 시간이 촉박한데 역까지 좀 태워다 주실 수 있나요?","tip":"Time is tight for the train, could you give me a ride to the station?"},{"ch":"늦어서 오래 기다리게 해 드렸지요? 정말 죄송합니다.","tip":"I made you wait long because I was late, didn't I? Truly sorry."},{"ch":"아이들 밥 먹이고 낮잠 재우느라 정신이 하나도 없었어요.","tip":"I had no time to breathe while feeding the kids and putting them down for a nap."}]},
          {"t":"cloze","sentence":"비가 많이 오는데 버스 정류장까지 제 우산으로 [씌워 드릴게요].","answer":"씌워 드릴게요","meaning":"It is raining heavily, let me cover you with my umbrella to the bus stop.","options":["씌워 드릴게요","써 드릴게요","쓰게 할게요","씌울 만해요"],"keys":["씌워 드릴게요","씌워줄게요","씌워드릴게요"],"why":"남에게 우산을 쓰게 해 주는 직접 사동 행동이므로 '쓰다'의 사동사 '씌우다'를 쓴 **씌워 드릴게요**가 맞습니다."},
          {"t":"choice","q":"약속 시간에 늦어 상대를 기다리게 했을 때 가장 자연스러운 사과 인사는?","options":["차가 막혀서 많이 기다리게 했지요? 미안해요.","차가 막혀서 많이 기다리도록 했지요? 미안해요.","차가 막혀서 많이 기다리지 그랬어요? 미안해요."],"answer":0,"why":"상대방을 기다리게 만든 자신의 행동에 대해 미안함을 표하므로 **기다리게 했지요?**가 자연스럽습니다."},
          {"t":"cloze","sentence":"모임 장소를 찾기 힘드실까 봐 지도 링크를 문자로 [보내 드렸어요].","answer":"보내 드렸어요","meaning":"Worried that you might find it hard to find the meeting place, I sent you the map link by text.","options":["보내 드렸어요","보이게 했어요","보내도록 했어요","보낼 만했어요"],"keys":["보내 드렸어요","보내드렸어요","보냈어요"],"why":"사동적 배려와 함께 상대방을 위해 문자를 발송한 정중한 행위이므로 **보내 드렸어요**입니다."},
          {"t":"type","q":"울다 — 「장난감을 빼앗아서 동생을 ___ 안 돼요!」 사동형으로 쓰세요.","answer":"울리면","keys":["울리면","울리게 하면","울려서"],"why":"'울다'의 사동사는 '울리다'이며 조건 연결 어미가 결합하여 **울리면**이 됩니다."},
          {"t":"order","q":"「급한 사정이 생겨서 회의 시간을 한 시간 늦췄습니다.」 를 순서대로 만들어 보세요.","tokens":["급한 사정이 생겨서","회의 시간을","한 시간","늦췄습니다."],"answer":["급한 사정이 생겨서","회의 시간을","한 시간","늦췄습니다."]},
          {"t":"note","md":"**사동 표현의 마법**\\n남을 차에 태워 주거나, 맛있는 음식을 먹이고, 사과할 때 사동사를 능숙하게 쓰면 한국인 원어민과 같은 깊은 유대감을 형성할 수 있습니다."},
          {"t":"speak","say":"선생님, 바쁘실 텐데 귀한 시간 내서 가르쳐 주셔서 감사드립니다.","q":"감사의 마음을 담아 존경 어린 어조로 정중하게 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c58',
    emoji: '🔑',
    title: { ko: '중급 58: 조건을 나타낼 때', en: 'Intermediate 58: Expressing Conditions' },
    tagline: { ko: '필수 전제 조건 · 비로소 가능 · 그때 연락해', en: 'Essential prerequisites, only then possible, let me know when' },
    blurb: { ko: '-아/어야, -거든 … 그것 없이는 안 되는 필수 조건(-아/어야)과 어떤 상황이 발생했을 때의 조건부 지시(-거든)를 가려 씁니다.', en: 'Express essential conditions without which results cannot occur (-아/어야) and conditional requests (-거든).' },
    level: 'Intermediate',
    needs: 'im-c57',
    lessons: [
      {
        id: "im-c58-01", title: "1강. 이것 없이는 안 된다 (필수 조건 -아/어야)", minutes: 4,
        blocks: [
          {"t":"text","h":"앞의 조건이 충족되어야만 비로소 가능한 일","md":"**-아/어야** 는 단순한 가정이 아니라, **앞의 조건이 반드시 갖추어져야만 비로소 뒤의 일이 일어날 수 있음**을 나타냅니다.\\n> 예약을 **해야** 들어갈 수 있어요.\\n> 약을 **먹어야** 빨리 낫지요.\\n\\n일반 가정인 「-(으)면」보다 훨씬 엄격하고 필수적인 전제 조건을 뜻합니다."},
          {"t":"table","head":["어간 모음","사전형","-아/어야 형태","뒤에 자주 오는 말"],"rows":[["양성 모음 (ㅏ, ㅗ)","가다 / 보다","가야 / 봐야","비로소 ~할 수 있다"],["음성 모음 (ㅓ, ㅜ 등)","먹다 / 읽다","먹어야 / 읽어야","비로소 알 수 있다"],["하다 동사","노력하다 / 예약하다","노력해야 / 예약해야","성공할 수 있다 / 입장 가능"],["형용사","따뜻하다 / 건강하다","따뜻해야 / 건강해야","좋다 / 일할 수 있다"]]},
          {"t":"chars","wide":true,"items":[{"ch":"직접 눈으로 확인해야 믿을 수 있을 것 같아요.","tip":"Only by confirming with my own eyes will I be able to believe it."},{"ch":"몸이 건강해야 무엇이든 도전할 수 있습니다.","tip":"Only when you are physically healthy can you challenge anything."},{"ch":"신분증이 있어야 본인 확인이 가능합니다.","tip":"Only with an ID card is identity verification possible."}]},
          {"t":"cloze","sentence":"한국에서 운전하려면 운전면허증이 [있어야] 해요.","answer":"있어야","meaning":"In order to drive in Korea, you must have a driver's license.","options":["있어야","있으면","있거든","있도록"],"keys":["있어야","있으면","있거든","있도록"],"why":"운전을 위한 필수불가결한 전제 조건과 의무를 나타내므로 **-아/어야**가 맞습니다."},
          {"t":"choice","q":"\"열심히 노력하지 않으면 성공할 수 없다\"는 필수 조건을 바르게 표현한 문장은?","options":["꾸준히 노력해야 좋은 결실을 맺을 수 있어요.","꾸준히 노력하거든 좋은 결실을 맺을 수 있어요.","꾸준히 노력하도록 좋은 결실을 맺을 수 있어요."],"answer":0,"why":"성공을 위한 절대적인 필수 조건을 강조할 때는 **-아/어야**를 씁니다."},
          {"t":"type","q":"듣다 — 「상대방의 설명을 끝까지 ___ 상황을 판단할 수 있어요.」 ㄷ 불규칙 필수 조건을 쓰세요.","answer":"들어야","keys":["들어야","들어야만"],"why":"'듣다'의 ㄷ 불규칙 모음 어미 결합은 '들-'이 되므로 **들어야**가 됩니다."},
          {"t":"order","q":"「미리 티켓을 예매해야 공연을 관람할 수 있습니다.」 를 순서대로 만들어 보세요.","tokens":["미리 티켓을","예매해야","공연을","관람할 수 있습니다."],"answer":["미리 티켓을","예매해야","공연을","관람할 수 있습니다."]},
          {"t":"note","md":"**강조하는 '만'**\\n조건을 더욱 엄격하게 강조하고 싶을 때는 뒤에 **'만'** 을 덧붙여 **-아/어야만** 으로 씁니다.\\n> 비밀번호를 정확히 입력해**야만** 열립니다."},
          {"t":"speak","say":"기초가 튼튼해야 실력이 흔들리지 않고 쑥쑥 늘 수 있어요.","q":"기초의 중요성을 확신에 찬 목소리로 강조하듯 말해 보세요."},
        ],
      },
      {
        id: "im-c58-02", title: "2강. 그렇게 되거든 연락해 (-거든)", minutes: 4,
        blocks: [
          {"t":"text","h":"만약 그 상황이 닥치면 이렇게 해라","md":"**-거든** 은 문장 중간에 쓰여 **\"만약 그렇게 되면 / 그 일이 벌어지거든\"** 이라는 가정을 나타냅니다.\\n\\n가장 중요한 특징은 뒷문장에 항상 **명령(-(으)세요), 청유(-(으)ㅂ시다), 약속(-(으)ㄹ게요)** 같은 상대방을 향한 요청이 온다는 점입니다.\\n> 집에 도착하**거든** 바로 전화하세요.\\n> 궁금한 점이 생기**거든** 언제든 물어봐."},
          {"t":"table","head":["조건 (-거든)","뒷문장 호응","예문"],"rows":[["도착하다","명령: -(으)세요 / -아/어라","도착하거든 바로 연락해라."],["시간이 나다","청유: -(으)ㅂ시다 / -자","시간이 나거든 차 한잔하자."],["마음에 들다","의도/약속: -(으)ㄹ게요","마음에 들거든 제가 사 드릴게요."],["바쁘다","명령: -지 마세요","바쁘거든 무리하지 마세요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"회의가 끝나거든 서류를 제 책상 위에 올려두세요.","tip":"When the meeting is over, please put the documents on my desk."},{"ch":"혹시 도움이 필요하거든 주저하지 말고 말씀해 주세요.","tip":"If you happen to need help, please tell me without hesitation."},{"ch":"서울에 올라오거든 꼭 우리 집에 한번 놀러 오렴.","tip":"If you come up to Seoul, make sure to visit our house."}]},
          {"t":"cloze","sentence":"공항에 [도착하거든] 짐부터 찾고 전화해 주세요.","answer":"도착하거든","meaning":"When you arrive at the airport, find your luggage first and give me a call.","options":["도착하거든","도착해야","도착하도록","도착하느라고"],"keys":["도착하거든","도착하면","도착하거든은"],"why":"도착이라는 미래 상황이 일어나면 전화하라는 명령·요청이 뒤따르므로 **-거든**이 가장 자연스럽습니다."},
          {"t":"choice","q":"이유를 나타내는 종결 어미 「-거든요」와 조건을 나타내는 연결 어미 「-거든」을 바르게 가른 문장은?","options":["준비가 다 끝나거든 출발합시다.","제가 지금 조금 바쁘거든.","시간이 나거든 영화를 봤어요."],"answer":0,"why":"문장 연결 어미 '-거든'은 뒤에 명령·청유문(출발합시다)이 올 때 올바른 조건문이 됩니다."},
          {"t":"type","q":"마음에 들다 — 「이 옷이 ___ 말씀하세요, 선물로 드릴게요.」 조건 연결형으로 쓰세요.","answer":"마음에 들거든","keys":["마음에 들거든","맘에 들거든"],"why":"가정 조건 뒤에 '선물로 드릴게요'라는 약속·의도가 오므로 **마음에 들거든**이 됩니다."},
          {"t":"order","q":"「일이 잘 해결되거든 기쁜 소식 꼭 전해 주세요.」 를 순서대로 만들어 보세요.","tokens":["일이 잘","해결되거든","기쁜 소식","꼭 전해 주세요."],"answer":["일이 잘","해결되거든","기쁜 소식","꼭 전해 주세요."]},
          {"t":"note","md":"**두 가지 '거든' 구별하기**\\n- 문장 끝: \"약속이 있**거든요**.\" (이유 설명)\\n- 문장 중간: \"도착하**거든** 전화해.\" (가정 조건 + 요청)"},
          {"t":"speak","say":"한국에 여행 오시거든 서울 맛집들을 제가 다 소개해 드릴게요.","q":"반가운 손님을 맞이할 약속을 건네듯 환한 목소리로 말해 보세요."},
        ],
      },
      {
        id: "im-c58-03", title: "3강. 조건 삼총사 가르기 (-(으)면 vs -아/어야 vs -거든)", minutes: 4,
        blocks: [
          {"t":"text","h":"조건의 강도와 뒷문장의 제한","md":"세 표현은 모두 '조건'을 나타내지만 쓰임새가 뚜렷이 다릅니다.\\n\\n- **-(으)면**: 가장 일반적인 가정 (뒤에 평서문, 명령문, 의문문 모두 가능)\\n> 비가 오**면** 우산을 써요.\\n- **-아/어야**: 뒤의 결과를 위한 **유일하고 필수적인 조건**\\n> 돈이 있**어야** 살 수 있어요 (없으면 못 산다).\\n- **-거든**: 뒤에 **명령이나 청유**가 오는 조건부 지시\\n> 일 끝나**거든** 밥 먹으러 가자."},
          {"t":"table","head":["조건 어미","조건의 성격","뒷문장 제약","대표 예문"],"rows":[["-(으)면","일반적인 가정·조건","제약 없음","시간이 있으면 책을 읽어요."],["-아/어야","필수 불가결한 전제","주로 가능·불가능 표현","열심히 공부해야 합격할 수 있어요."],["-거든","상황 발생 시의 지시","명령/청유/약속 위주","집에 가거든 손부터 씻어라."]]},
          {"t":"chars","wide":true,"items":[{"ch":"날씨가 좋으면 한강에 갈 거예요.","tip":"If the weather is nice, I will go to the Han River."},{"ch":"비자를 받아야 출국할 수 있어요.","tip":"Only by receiving a visa can you leave the country."},{"ch":"퇴근하거든 시원한 맥주 한잔하자.","tip":"When you get off work, let's have a cool beer."}]},
          {"t":"cloze","sentence":"외국인 등록증이 [있어야] 은행 통장을 만들 수 있습니다.","answer":"있어야","meaning":"Only with an alien registration card can you open a bank account.","options":["있어야","있거든","있으면","있도록"],"keys":["있어야","있으면","있거든","있도록"],"why":"외국인 등록증 없이는 통장 개설이 불가능하다는 엄격한 필수 전제이므로 **-아/어야**가 가장 알맞습니다."},
          {"t":"choice","q":"친구에게 일이 끝난 뒤 약속 장소로 오라고 가볍게 지시할 때 가장 자연스러운 표현은?","options":["수업 끝나거든 카페로 바로 와.","수업 끝나야 카페로 바로 와.","수업 끝나도록 카페로 바로 와."],"answer":0,"why":"가정 상황 뒤에 명령문(바로 와)이 이어질 때 조건부 지시를 부드럽게 나타내는 것은 **-거든**입니다."},
          {"t":"type","q":"보다 — 「이 영화는 영화관에 가서 대형 스크린으로 ___ 제맛이에요.」 필수 조건을 쓰세요.","answer":"봐야","keys":["봐야","보아야","봐야만"],"why":"영화관에서 봐야만 비로소 참맛을 느낄 수 있다는 필수 조건이므로 **봐야**가 됩니다."},
          {"t":"order","q":"「건강을 잃고 나서야 비로소 건강의 소중함을 깨달았어요.」 를 순서대로 만들어 보세요.","tokens":["건강을 잃고 나서야","비로소 건강의","소중함을","깨달았어요."],"answer":["건강을 잃고 나서야","비로소 건강의","소중함을","깨달았어요."]},
          {"t":"note","md":"**-고 나서야 비로소**\\n'-고 나서야'는 과거에 어떤 뼈아픈 일을 겪은 뒤에야 비로소 깨닫거나 알게 되었음을 한탄할 때 아주 자주 쓰는 숙어적 표현입니다."},
          {"t":"speak","say":"주말에 시간이 나거든 미뤄 둔 청소부터 말끔히 끝내도록 합시다.","q":"함께 할 일을 힘차게 제안하듯 밝고 명확하게 말해 보세요."},
        ],
      },
      {
        id: "im-c58-04", title: "4강. 실전 대화에서 조건 똑똑하게 걸기", minutes: 5,
        blocks: [
          {"t":"text","h":"상황에 꼭 맞는 완벽한 조건문 구사하기","md":"공적인 절차 안내부터 사적인 약속까지 상황에 맞추어 조건을 정확히 전달합니다.\\n\\n- **-아/어야**: 절차의 필수 요건 안내 (규정, 법률, 자격)\\n- **-거든**: 일정이나 상황 변화에 따른 행동 요청 (약속, 부탁)\\n- **-(으)면**: 일상적인 가정과 예측"},
          {"t":"chars","wide":true,"items":[{"ch":"소방 시설 점검을 통과해야 영업 허가가 나옵니다.","tip":"Only by passing the fire facility inspection will a business license be issued."},{"ch":"회의 자료가 완성되거든 팀장님께 먼저 보고해 주세요.","tip":"When the meeting materials are completed, please report to the manager first."},{"ch":"어려운 일이 생기거든 언제든 제게 도움을 청하세요.","tip":"If difficult matters arise, feel free to ask me for help anytime."}]},
          {"t":"cloze","sentence":"충분한 수면을 [취해야] 낮 동안 집중력을 유지할 수 있어요.","answer":"취해야","meaning":"Only by getting sufficient sleep can you maintain concentration during the day.","options":["취해야","취하거든","취하도록","취할 만해요"],"keys":["취해야","취해야만","취하면"],"why":"집중력 유지를 위한 결정적 필수 조건이므로 **-아/어야**가 맞습니다."},
          {"t":"choice","q":"고객센터 안내 방송에서 접수 완료 후 절차를 안내할 때 알맞은 말은?","options":["접수가 정상적으로 완료되거든 확인 문자를 발송해 드리겠습니다.","접수가 정상적으로 완료되어야 확인 문자를 발송하지 그래요.","접수가 정상적으로 완료되도록 확인 문자를 발송할 만해요."],"answer":0,"why":"미래에 접수가 완료되는 시점에 맞추어 문자 발송을 약속하므로 **-거든**이 알맞습니다."},
          {"t":"cloze","sentence":"사전 예약을 [해야만] 박물관 특별 전시를 관람하실 수 있습니다.","answer":"해야만","meaning":"Only by making advance reservations can you view the special museum exhibition.","options":["해야만","하거든","하도록","하지 그래요"],"keys":["해야만","해야","하셔야만"],"why":"사전 예약이 유일한 관람 허용 조건임을 단호하게 안내하므로 강조 보조사 '만'이 붙은 **해야만**이 적절합니다."},
          {"t":"type","q":"도착하다 — 「주문하신 택배가 ___ 상자를 열어 내용물을 확인해 주세요.」 조건부 요청으로 쓰세요.","answer":"도착하거든","keys":["도착하거든","도착하면"],"why":"택배 도착이라는 미래 사건 발생 시 확인하라는 권고 요청이 이어지므로 **도착하거든**이 됩니다."},
          {"t":"order","q":"「서로에 대한 신뢰가 있어야 건강한 관계를 유지할 수 있어요.」 를 순서대로 만들어 보세요.","tokens":["서로에 대한","신뢰가 있어야","건강한 관계를","유지할 수 있어요."],"answer":["서로에 대한","신뢰가 있어야","건강한 관계를","유지할 수 있어요."]},
          {"t":"note","md":"**정확한 소통의 비결**\\n꼭 필요한 조건일 때는 **\"-아/어야\"**, 상대에게 행동을 부탁할 때는 **\"-거든\"**을 가려 쓰면 대화의 모호함이 사라지고 명확해집니다."},
          {"t":"speak","say":"결과가 나오거든 너무 걱정하지 마시고 차분하게 다음 단계를 준비하세요.","q":"상대방을 다독이며 안심시켜 주듯 온화한 어조로 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c59',
    emoji: '➕',
    title: { ko: '중급 59: 덧붙일 때', en: 'Intermediate 59: Adding Information' },
    tagline: { ko: '뿐만 아니라 · 엎친 데 덮친 격 · 최소한의 것조차', en: 'Not only but also, on top of that, even the bare minimum' },
    blurb: { ko: '-(으)ㄹ 뿐만 아니라, -(으)ㄴ/는 데다가, 조차, 만 해도 … 앞의 사실에 새로운 사실을 얹고, 겹친 상황이나 극단적 예시를 들어 강조합니다.', en: 'Add reinforcing points with -(으)ㄹ 뿐만 아니라, stack compounding factors with -(으)ㄴ/는 데다가, express extreme exclusions with 조차, and cite prominent examples with 만 해도.' },
    level: 'Intermediate',
    needs: 'im-c58',
    lessons: [
      {
        id: "im-c59-01", title: "1강. 이것만이 아니라 저것도 (-(으)ㄹ 뿐만 아니라)", minutes: 4,
        blocks: [
          {"t":"text","h":"앞의 사실에 그치지 않고 다른 사실을 덧붙일 때","md":"**-(으)ㄹ 뿐만 아니라** 는 앞의 사실에 더하여 **뒤의 사실까지 포함하여 함께 강조할 때** 씁니다.\\n> 값이 쌀 **뿐만 아니라** 맛도 좋아요.\\n> 한국어**뿐만 아니라** 영어도 유창해요.\\n\\n중요한 원칙: **앞뒤의 방향이 같아야** 합니다. 긍정적인 내용 뒤에는 긍정적인 내용, 부정적인 내용 뒤에는 부정적인 내용이 옵니다."},
          {"t":"table","head":["품사 및 받침","사전형","-(으)ㄹ 뿐만 아니라","예문"],"rows":[["동사 (받침 없음)","가르치다","가르칠 뿐만 아니라","공부뿐만 아니라 운동도 잘해요."],["동사 (받침 있음)","읽다","읽을 뿐만 아니라","책을 많이 읽을 뿐만 아니라 글도 잘 써요."],["형용사 (받침 없음)","친절하다","친절할 뿐만 아니라","외모가 예쁠 뿐만 아니라 마음씨도 고와요."],["형용사 (받침 있음)","맛있다","맛있을 뿐만 아니라","가격이 저렴할 뿐만 아니라 양도 푸짐해요."],["명사 (전체)","외국어","외국어뿐만 아니라","한국 학생뿐만 아니라 유학생도 많아요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"이 스마트폰은 디자인이 세련되었을 뿐만 아니라 성능도 우수해요.","tip":"This smartphone not only has a sleek design but also excellent performance."},{"ch":"공기가 맑을 뿐만 아니라 물도 깨끗해서 살기 좋아요.","tip":"Not only is the air fresh, but the water is clean too, making it great to live in."},{"ch":"그 식당은 맛이 없을 뿐만 아니라 위생 상태도 엉망이에요.","tip":"That restaurant is not only not delicious, but its hygiene is also a mess."}]},
          {"t":"cloze","sentence":"그 직원은 성실할 [뿐만 아니라] 대인 관계도 아주 원만해요.","answer":"뿐만 아니라","meaning":"That employee is not only diligent, but also has very smooth interpersonal relationships.","options":["뿐만 아니라","는 데다가","조차","만 해도"],"keys":["뿐만 아니라","는 데다가","조차","만 해도"],"why":"성실하다는 장점에 대인 관계가 좋다는 장점을 대등하게 덧붙여 칭찬하므로 **-(으)ㄹ 뿐만 아니라**가 가장 알맞습니다."},
          {"t":"choice","q":"방향성이 일치하도록 자연스럽게 쓴 문장은?","options":["이 옷은 디자인이 예쁠 뿐만 아니라 가격도 합리적이에요.","이 옷은 디자인이 예쁠 뿐만 아니라 가격이 너무 비싸요.","이 옷은 디자인이 촌스러울 뿐만 아니라 원단이 최고급이에요."],"answer":0,"why":"-(으)ㄹ 뿐만 아니라 앞뒤는 같은 긍정(예쁘다 + 합리적이다)이나 같은 부정이어야 자연스럽습니다."},
          {"t":"type","q":"노래하다 — 「그 가수는 ___ 직접 작곡도 해요.」 능력을 덧붙이는 형태로 쓰세요.","answer":"노래할 뿐만 아니라","keys":["노래할 뿐만 아니라","노래할 뿐만아니라","노래를 잘할 뿐만 아니라"],"why":"동사 '노래하다'에 받침이 없으므로 **-ㄹ 뿐만 아니라**가 붙어 **노래할 뿐만 아니라**가 됩니다."},
          {"t":"order","q":"「한국어 실력뿐만 아니라 문화에 대한 이해도 깊어요.」 를 순서대로 만들어 보세요.","tokens":["한국어 실력뿐만 아니라","문화에 대한","이해도","깊어요."],"answer":["한국어 실력뿐만 아니라","문화에 대한","이해도","깊어요."]},
          {"t":"note","md":"**조사 '-도'와의 찰떡궁합**\\n뒷문장에는 주로 **'~도'** 가 함께 따라옵니다.\\n> 머리가 좋을 뿐만 아니라 운동**도** 잘해요."},
          {"t":"speak","say":"그 영화는 영상이 아름다울 뿐만 아니라 음악도 마음에 깊은 감동을 줘요.","q":"영화의 매력을 진심 어린 칭찬을 담아 또박또박 말해 보세요."},
        ],
      },
      {
        id: "im-c59-02", title: "2강. 엎친 데 덮친 격 (-(으)ㄴ/는 데다가)", minutes: 4,
        blocks: [
          {"t":"text","h":"한 가지 상황에 다른 상황까지 중복되어 겹칠 때","md":"**-(으)ㄴ/는 데다가** 는 이미 있는 상황 위에 **또 다른 상황이 겹쳐서 그 정도가 한층 더 심해짐**을 나타냅니다.\\n> 비가 오**는 데다가** 바람까지 세게 불어요.\\n> 날씨가 추**운 데다가** 눈까지 내려서 길이 꽁꽁 얼었어요.\\n\\n뒷문장에 주로 조사 **'까지'** 나 **'조차'**, **'도'** 가 잘 호응합니다."},
          {"t":"table","head":["품사 및 시제","사전형","-(으)ㄴ/는 데다가","예문"],"rows":[["동사 현재","오다 / 불다","오는 데다가 / 부는 데다가","비가 오는 데다가 바람까지 불어요."],["동사 과거","다치다","다친 데다가","허리를 다친 데다가 감기까지 걸렸어요."],["형용사 현재","춥다 / 어둡다","추운 데다가 / 어두운 데다가","길이 좁은 데다가 어둡기까지 해요."],["명사","주말","주말인 데다가","주말인 데다가 세일 기간이라 붐벼요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"잠을 못 잔 데다가 하루 종일 서 있어서 다리가 아파요.","tip":"On top of not being able to sleep, I stood all day so my legs hurt."},{"ch":"방이 좁은 데다가 창문도 없어서 너무 답답해요.","tip":"On top of the room being small, there are no windows so it is stifling."},{"ch":"주말인 데다가 날씨까지 화창해서 나들이 차량이 많네요.","tip":"It being the weekend on top of the sunny weather, there are many outing cars."}]},
          {"t":"cloze","sentence":"눈이 [내리는 데다가] 기온까지 뚝 떨어져서 도로가 얼어붙었어요.","answer":"내리는 데다가","meaning":"On top of it snowing, the temperature dropped sharply so roads froze.","options":["내리는 데다가","내릴 뿐만 아니라","내리기조차","내릴 만해도"],"keys":["내리는 데다가","내리는 데다","내린 데다가"],"why":"눈이 내리는 악조건에 기온 하강까지 겹쳐 도로 결빙이라는 상황이 심화되었으므로 **-는 데다가**가 가장 생생합니다."},
          {"t":"choice","q":"출근길에 여러 악조건이 중복되어 고생했음을 전할 때 알맞은 것은?","options":["지하철이 고장 난 데다가 버스까지 파업을 해서 지각했어요.","지하철이 고장 날 뿐만 아니라 버스까지 파업을 해서 지각했어요.","지하철이 고장 난 조차 버스까지 파업을 해서 지각했어요."],"answer":0,"why":"이미 벌어진 문제 상황 위에 또 다른 문제가 겹치는 설상가상을 나타낼 때는 **-(으)ㄴ/는 데다가**가 가장 어울립니다."},
          {"t":"type","q":"복잡하다 — 「주말에는 손님이 ___ 직원도 부족해서 주문이 늦어요.」 겹치는 상황을 쓰세요.","answer":"복잡한 데다가","keys":["복잡한 데다가","복잡한 데다"],"why":"형용사 '복잡하다'에 받침이 없으므로 **-ㄴ 데다가**가 결합하여 **복잡한 데다가**가 됩니다."},
          {"t":"order","q":"「월급이 적은 데다가 업무량까지 많아서 이직을 결심했어요.」 를 순서대로 만들어 보세요.","tokens":["월급이 적은 데다가","업무량까지 많아서","이직을","결심했어요."],"answer":["월급이 적은 데다가","업무량까지 많아서","이직을","결심했어요."]},
          {"t":"note","md":"**금상첨화 vs 설상가상**\\n이 표현은 나쁜 일뿐 아니라 좋은 일이 겹칠 때도 씁니다.\\n> 성격이 좋은 데다가 유머 감각까지 뛰어나요 (금상첨화)."},
          {"t":"speak","say":"감기에 심하게 걸린 데다가 몸살 기운까지 겹쳐서 오늘은 푹 쉬어야겠어요.","q":"몸이 무겁고 힘든 상태를 전하듯 나직한 어조로 말해 보세요."},
        ],
      },
      {
        id: "im-c59-03", title: "3강. 가장 기본적인 것마저 (조차 vs 만 해도)", minutes: 4,
        blocks: [
          {"t":"text","h":"최소한의 것마저 불가능할 때, 대표적인 예 하나만 들 때","md":"- **조차**: \"이것마저도/가장 쉬운 것마저도\"라는 뜻으로, **상식적인 최소한의 기준조차 미치지 못함을 강조할 때** 씁니다. 뒤에는 거의 항상 **부정 서술어**가 옵니다.\\n> 너무 아파서 물**조차** 못 마셨어요.\\n\\n- **만 해도**: \"그것 하나만 들어도 충분하다\"라는 뜻으로, **대표적인 단 하나의 구체적 예를 들어 전체를 증명할 때** 씁니다.\\n> 작년**만 해도** 이러지 않았는데 물가가 너무 올랐어요."},
          {"t":"table","head":["조사","의미의 핵심","뒤에 오는 서술어","예문"],"rows":[["조차","최소한의 기초 기준 미달","부정문 (못, 안, 없다, 모르다)","그 사람 이름조차 몰라요."],["만 해도","전체를 대변하는 대표 사례","긍정/부정 모두 가능","우리 동네만 해도 카페가 열 곳이에요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"얼마나 피곤했는지 옷조차 갈아입지 못하고 잠들었어요.","tip":"I was so tired that I fell asleep without even being able to change clothes."},{"ch":"제일 친한 친구의 전화번호조차 외우지 못해요.","tip":"I cannot even memorize my best friend's phone number."},{"ch":"사과만 해도 지난주보다 가격이 훨씬 비싸졌어요.","tip":"Taking apples alone, the price has become much more expensive than last week."}]},
          {"t":"cloze","sentence":"너무 충격을 받아서 아무 말[조차] 나오지 않았어요.","answer":"조차","meaning":"I was so shocked that not even a word could come out.","options":["조차","만 해도","뿐만 아니라","는 데다가"],"keys":["조차","조차도","마저"],"why":"말이라는 가장 기본적인 것마저 나오지 않는 극단적 부정 상황을 강조하므로 **조차**가 맞습니다."},
          {"t":"choice","q":"최근 스마트폰 기술이 얼마나 빠르게 발전했는지 대표적인 예시를 들 때 알맞은 것은?","options":["카메라 성능만 해도 전문가용 카메라 못지않아요.","카메라 성능조차 전문가용 카메라 못지않아요.","카메라 성능뿐만 아니라 전문가용 카메라 못지않아요."],"answer":0,"why":"전체 스마트폰 기술 중 '카메라 성능'이라는 대표적인 예를 들어 증명하고 있으므로 **만 해도**가 맞습니다."},
          {"t":"type","q":"숨쉬다 — 「황사가 너무 심해서 밖에서는 ___ 힘들어요.」 극단적 최소한의 불가능을 쓰세요.","answer":"숨조차 쉬기","keys":["숨조차 쉬기","숨조차 쉬기조차","숨쉬기조차"],"why":"'숨'이라는 기본 명사 뒤에 '조차'를 붙여 **숨조차 쉬기** 또는 **숨쉬기조차**가 됩니다."},
          {"t":"order","q":"「십 년 전만 해도 이 동네는 논과 밭이었어요.」 를 순서대로 만들어 보세요.","tokens":["십 년 전만 해도","이 동네는","논과","밭이었어요."],"answer":["십 년 전만 해도","이 동네는","논과","밭이었어요."]},
          {"t":"note","md":"**조차의 짝꿍 '마저'**\\n'조차'와 '마저'는 비슷하지만, **'조차'는 상식 밖의 극단적 최소치**, **'마저'는 마지막 남은 하나까지** 잃었을 때 잘 씁니다.\\n> 마지막 희망**마저** 사라졌다."},
          {"t":"speak","say":"요즘 물가가 너무 올라서 당장 배춧값만 해도 작년의 두 배나 돼요.","q":"장바구니 물가에 깜짝 놀란 소비자의 심정으로 실감 나게 말해 보세요."},
        ],
      },
      {
        id: "im-c59-04", title: "4강. 실전 대화에서 풍부하게 덧붙여 말하기", minutes: 5,
        blocks: [
          {"t":"text","h":"설득력 있고 풍부한 한국어 표현의 완성","md":"네 가지 덧붙이기 표현을 능숙하게 구사하면 글과 말이 한층 더 생생해집니다.\\n\\n- **-(으)ㄹ 뿐만 아니라**: 장점/단점을 대등하게 추가할 때\\n- **-(으)ㄴ/는 데다가**: 상황이 누적되어 겹쳐질 때\\n- **조차**: 상식적인 기본마저 안 된다고 강조할 때\\n- **만 해도**: 단 하나의 대표 사례를 들어 증명할 때"},
          {"t":"chars","wide":true,"items":[{"ch":"그 식당은 음식이 맛있을 뿐만 아니라 사장님도 매우 친절해요.","tip":"That restaurant is not only delicious, but the owner is also very kind."},{"ch":"주말인 데다가 날씨까지 쌀쌀해서 집 밖으로 한 발짝도 안 나갔어요.","tip":"On top of being the weekend the weather was chilly, so I didn't step outside at all."},{"ch":"이 문제는 너무 어려워서 수학 선생님조차 고개를 갸웃하셨어요.","tip":"This problem was so hard that even the math teacher tilted their head."}]},
          {"t":"cloze","sentence":"신제품은 기능이 다양할 [뿐만 아니라] 무게도 매우 가볍습니다.","answer":"뿐만 아니라","meaning":"The new product not only has diverse features, but its weight is also very light.","options":["뿐만 아니라","는 데다가","조차","만 해도"],"keys":["뿐만 아니라","는 데다가","조차","만 해도"],"why":"제품의 장점을 정연하게 병렬하여 설명하므로 **-(으)ㄹ 뿐만 아니라**가 격식에 어울립니다."},
          {"t":"choice","q":"몸살감기에 걸려 목소리도 안 나오는 고통을 호소할 때 가장 알맞은 것은?","options":["목이 너무 부어서 말조차 하기 힘들어요.","목이 너무 부어서 말만 해도 힘들어요.","목이 너무 부어서 말할 뿐만 아니라 힘들어요."],"answer":0,"why":"말을 하는 최소한의 행위조차 어렵다는 극단적 한계를 호소하므로 **조차**를 씁니다."},
          {"t":"cloze","sentence":"저희 회사[만 해도] 최근 유연 근무제를 도입하는 부서가 늘었어요.","answer":"만 해도","meaning":"Taking our company alone, departments introducing flexible work hours have increased recently.","options":["만 해도","조차","뿐만 아니라","는 데다가"],"keys":["만 해도","만하더라도"],"why":"유연 근무제 확산이라는 사회 현상의 대표적인 사례 하나로 '우리 회사'를 예시하고 있으므로 **만 해도**입니다."},
          {"t":"type","q":"비싸다 — 「임대료가 ___ 손님 발길도 끊겨서 가게 문을 닫았어요.」 겹친 악재를 쓰세요.","answer":"비싼 데다가","keys":["비싼 데다가","비싼 데다"],"why":"비싼 임대료라는 문제에 손님 감소까지 겹쳤으므로 형용사 어간에 **-ㄴ 데다가**가 붙어 **비싼 데다가**가 됩니다."},
          {"t":"order","q":"「그 소설은 재미있을 뿐만 아니라 삶의 교훈도 담고 있어요.」 를 순서대로 만들어 보세요.","tokens":["그 소설은","재미있을 뿐만 아니라","삶의 교훈도","담고 있어요."],"answer":["그 소설은","재미있을 뿐만 아니라","삶의 교훈도","담고 있어요."]},
          {"t":"note","md":"**풍부한 표현의 힘**\\n\"좋아요, 그리고 이것도 좋아요\" 대신 **\"~할 뿐만 아니라 ~도 우수해요\"**를 쓰면 어휘의 세련미가 배가됩니다."},
          {"t":"speak","say":"그 가수는 가창력이 뛰어날 뿐만 아니라 무대 매너도 정말 훌륭하더라고요.","q":"팬으로서 가수를 열정적으로 칭찬하듯 감탄 어린 어조로 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c60',
    emoji: '🚶',
    title: { ko: '중급 60: 도중을 나타낼 때', en: 'Intermediate 60: Mid-Action and Transitions' },
    tagline: { ko: '오가는 길에 · 하던 중에 바뀜 · 완료 후 전환', en: 'On the way, interrupted actions, transitions after completion' },
    blurb: { ko: '-는 길에, -다가 … 이동하는 도중에 용무를 보거나, 한창 하던 행동이 중단·전환되는 상황을 매끄럽게 연결합니다.', en: 'Express actions taken en route (-는 길에) and mid-action interruptions or transitions (-다가).' },
    level: 'Intermediate',
    needs: 'im-c59',
    lessons: [
      {
        id: "im-c60-01", title: "1강. 이동하는 경로의 도중 (-는 길에)", minutes: 4,
        blocks: [
          {"t":"text","h":"어디론가 오고 가는 여정의 중간에 다른 일을 할 때","md":"**-는 길에** 는 목적지로 가거나 출발지로 돌아오는 **이동 경로의 도중에 다른 용무를 보거나 사람을 만날 때** 씁니다.\\n> 퇴근하**는 길에** 마트에 들러 장을 봤어요.\\n> 출근하**는 길에** 우연히 옛 친구를 만났어요.\\n\\n가장 중요한 제약: **오고 가는 이동 동사**(가다, 오다, 나가다, 들어오다, 출퇴근하다)에만 결합합니다."},
          {"t":"table","head":["이동 동사","결합 형태 (-는 길에)","상황 예시"],"rows":[["가다 / 오다","가는 길에 / 오는 길에","집에 오는 길에 빵 좀 사 올게."],["출근하다 / 퇴근하다","출근하는 길에 / 퇴근하는 길에","퇴근하는 길에 세탁소에 들렀어요."],["들어가다 / 나오다","들어가는 길에 / 나오는 길에","집에 들어가는 길에 쓰레기 버렸어."],["일반 동사 (결합 불가)","먹다, 자다, 읽다 (사용 불가)","❌ 밥 먹는 길에 (어색함)"]]},
          {"t":"chars","wide":true,"items":[{"ch":"학교에서 돌아오는 길에 서점에 들렀어요.","tip":"On my way back from school, I stopped by a bookstore."},{"ch":"커피 사러 나가는 길인데 뭐 마시고 싶은 거 있어요?","tip":"I am on my way out to buy coffee, is there anything you want to drink?"},{"ch":"출근하는 길에 지하철에서 커피를 쏟을 뻔했어요.","tip":"On my way to work, I almost spilled my coffee on the subway."}]},
          {"t":"cloze","sentence":"집에 [들어가는 길에] 편의점에 들러서 우유 하나 사 갈게.","answer":"들어가는 길에","meaning":"On my way entering home, I will stop by a convenience store and buy some milk.","options":["들어가는 길에","들어가다가","들어갈 뿐만 아니라","들어가야"],"keys":["들어가는 길에","가는 길에","오는 길에"],"why":"집으로 귀가하는 물리적 이동 여정 중에 편의점에 들른다는 문맥이므로 **-는 길에**가 가장 적합합니다."},
          {"t":"choice","q":"문법적으로 올바른 문장은?","options":["우체국에 가는 길에 이 편지 좀 부쳐 줄래?","점심을 먹는 길에 친구를 만났어요.","책을 읽는 길에 잠이 들었어요."],"answer":0,"why":"'-는 길에'는 오직 가다/오다 계열의 이동 동사에만 붙습니다. '먹는 길에', '읽는 길에'는 쓸 수 없습니다."},
          {"t":"type","q":"퇴근하다 — 「___ 길에 붕어빵을 사 왔어요.」 이동 도중을 나타내세요.","answer":"퇴근하는","keys":["퇴근하는","집에 가는","퇴근하는 길에"],"why":"동사 '퇴근하다'의 관형사형 어미 **-는**이 '길에' 앞에 붙어 **퇴근하는**이 됩니다."},
          {"t":"order","q":"「회사에서 나오는 길에 갑자기 소나기가 쏟아졌어요.」 를 순서대로 만들어 보세요.","tokens":["회사에서","나오는 길에","갑자기 소나기가","쏟아졌어요."],"answer":["회사에서","나오는 길에","갑자기 소나기가","쏟아졌어요."]},
          {"t":"note","md":"**'오시는 길에'의 배려**\\n손님이나 친구가 우리 집에 올 때 **\"오시는 길에 조심해서 오세요\"**라고 덕담을 건네면 따뜻한 인상을 줍니다."},
          {"t":"speak","say":"집에 가는 길에 마트에 들러서 오늘 저녁 찬거리 좀 사 가지고 갈게요.","q":"가족에게 다정하게 퇴근 소식을 전하듯 자연스럽게 말해 보세요."},
        ],
      },
      {
        id: "im-c60-02", title: "2강. 하던 행동의 중단과 전환 (-다가)", minutes: 4,
        blocks: [
          {"t":"text","h":"한창 하던 일을 멈추거나 다른 일로 바뀔 때","md":"**-다가** 는 주어가 어떤 행동을 계속 진행하던 도중에, **그 행동을 중단하고 다른 행동으로 바꾸거나 뜻밖의 사건이 발생했을 때** 씁니다.\\n> 계단을 내려가**다가** 발목을 삐끗했어요.\\n> 공부하**다가** 너무 졸려서 잠깐 눈을 붙였어요.\\n\\n앞뒤 문장의 **주어가 반드시 같아야** 합니다."},
          {"t":"table","head":["사전형","어간 + -다가","발생한 사건/전환","완성 문장"],"rows":[["뛰어가다","뛰어가다가","넘어졌다","뛰어가다가 돌부리에 걸려 넘어졌어요."],["운전하다","운전하다가","전화를 받았다","운전하다가 안전한 곳에 차를 세웠어요."],["텔레비전을 보다","보다가","껐다","보던 방송이 재미없어서 보다가 껐어요."],["비가 오다 (날씨)","오다가","그쳤다","아침에 비가 오다가 오후에 맑게 개었어요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"공부하다가 집중이 안 돼서 산책을 다녀왔어요.","tip":"While studying concentration lapsed, so I went for a walk."},{"ch":"길을 걷다가 문득 옛날 생각이 났어요.","tip":"While walking on the street, old memories suddenly came to mind."},{"ch":"말씀을 나누시다가 갑자기 자리를 뜨셨어요.","tip":"While talking, they suddenly left their seat."}]},
          {"t":"cloze","sentence":"빙판길을 조심조심 [걸어가다가] 미끄러질 뻔했어요.","answer":"걸어가다가","meaning":"While walking carefully on the icy road, I almost slipped.","options":["걸어가다가","걸어가는 길에","걸어갈 뿐만 아니라","걸어가야"],"keys":["걸어가다가","걸어가다","가다가"],"why":"걷는 도중에 미끄러질 뻔한 돌발 사건이 발생했으므로 행동 진행 중단을 뜻하는 **-다가**가 맞습니다."},
          {"t":"choice","q":"앞뒤 주어가 일치하여 올바르게 연결된 문장은?","options":["민수는 책을 읽다가 졸려서 잠이 들었다.","민수는 책을 읽다가 영희가 방에 들어왔다.","비가 오다가 철수가 우산을 폈다."],"answer":0,"why":"'-다가'는 한 주어가 하던 일을 멈추고 다른 행동/상태로 넘어갈 때 쓰므로 앞뒤 주어가 일치해야 자연스럽습니다."},
          {"t":"type","q":"듣다 — 「음악을 ___ 감동해서 눈물이 핑 돌았어요.」 ㄷ 불규칙 도중 전환을 쓰세요.","answer":"듣다가","keys":["듣다가","듣다가도"],"why":"동사 '듣다'의 어간 '듣-' 뒤에 자음 어미 **-다가**가 바로 결합하여 **듣다가**가 됩니다."},
          {"t":"order","q":"「이야기를 나누다가 시간 가는 줄 몰랐어요.」 를 순서대로 만들어 보세요.","tokens":["이야기를","나누다가","시간 가는 줄","몰랐어요."],"answer":["이야기를","나누다가","시간 가는 줄","몰랐어요."]},
          {"t":"note","md":"**말끝의 '가' 생략**\\n구어 대화에서는 '가'를 줄이고 **'-다'** 로도 많이 씁니다.\\n> 뛰어가**다** 넘어졌어."},
          {"t":"speak","say":"시험공부를 밤새 하다가 새벽녘에 깜빡 잠이 들어 버렸어요.","q":"피곤해서 졸았던 경험을 실감 나게 하품 섞인 어조로 말해 보세요."},
        ],
      },
      {
        id: "im-c60-03", title: "3강. 하던 중(-다가) vs 다 하고 나서(-았/었다가)", minutes: 4,
        blocks: [
          {"t":"text","h":"도중에 끊겼는가, 완전히 끝난 뒤에 바뀌었는가","md":"학습자들이 가장 많이 헷갈려 하는 미묘한 차이입니다.\\n\\n- **-다가 (미완료·도중)**: 행동을 **한창 하던 도중에** 다른 일로 전환\\n> 옷을 입**다가** 단추가 떨어졌어요 (입는 중에 떨어짐).\\n\\n- **-았/었다가 (완료 후 반대 행동)**: 앞의 행동을 **완전히 끝낸 뒤에**, 다시 반대 행동이나 다른 행동으로 전환\\n> 옷을 샀**다가** 마음에 안 들어서 환불했어요 (구매 완료 후 환불)."},
          {"t":"table","head":["구분","형태","의미의 핵심","대표 예문"],"rows":[["진행 도중 중단","-다가","행동 미완료 상태에서 사고/중단","숙제하다가 전화받았어요."],["완료 후 전환","-았/었다가","행동 완료 후 취소나 반대 동작","불을 켰다가 눈부셔서 껐어요."],["장소 도착 후","-았/었다가","도착했다가 바로 다시 돌아옴","서점에 들렀다가 바로 나왔어요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"창문을 열었다가 찬바람이 들어와서 다시 닫았어요.","tip":"I opened the window, but cold wind came in so I closed it again."},{"ch":"밥을 먹다가 혀를 세게 깨물었어요.","tip":"While eating, I bit my tongue hard."},{"ch":"예약했다가 일정이 생겨서 취소했습니다.","tip":"I booked, but then cancelled because a schedule came up."}]},
          {"t":"cloze","sentence":"신발을 [신었다가] 사이즈가 작아서 다시 벗었어요.","answer":"신었다가","meaning":"I put on the shoes, but because the size was small, I took them off again.","options":["신었다가","신다가","신는 길에","신어야"],"keys":["신었다가","신었다가도","신어봤다가"],"why":"신발을 일단 완전히 신어 본 뒤(완료), 사이즈가 안 맞아 벗는 반대 동작으로 이어졌으므로 과거형 **-았/었다가**가 맞습니다."},
          {"t":"choice","q":"행동이 완전히 완료되기 전 '도중에' 일어난 일임을 나타내는 문장은?","options":["횡단보도를 건너다가 초록불이 깜빡거렸어요.","횡단보도를 건넜다가 물건을 두고 와서 되돌아갔어요.","횡단보도를 건너는 길에 편의점에 들어갔어요."],"answer":0,"why":"길을 건너는 도중에 신호등이 바뀐 것이므로 진행 중단을 뜻하는 **-다가**가 맞습니다."},
          {"t":"type","q":"켜다 — 「더워서 에어컨을 ___ 추워서 다시 껐어요.」 완료 후 반대 행동을 쓰세요.","answer":"켰다가","keys":["켰다가","켜두었다가","틀었다가"],"why":"에어컨을 일단 켰다가 다시 끄는 반대 동작이 이어지므로 **켰다가**가 됩니다."},
          {"t":"order","q":"「백화점에 갔다가 사람이 너무 많아서 그냥 돌아왔어요.」 를 순서대로 만들어 보세요.","tokens":["백화점에 갔다가","사람이 너무 많아서","그냥","돌아왔어요."],"answer":["백화점에 갔다가","사람이 너무 많아서","그냥","돌아왔어요."]},
          {"t":"note","md":"**반대 동작의 짝꿍들**\\n- 탔다가 내리다\\n- 샀다가 환불하다\\n- 올렸다가 내리다\\n- 붙였다가 떼다"},
          {"t":"speak","say":"안경을 책상 위에 두었다가 어디 뒀는지 깜빡 잊어버렸네요.","q":"안경을 찾아 두리번거리듯 멋쩍은 웃음과 함께 말해 보세요."},
        ],
      },
      {
        id: "im-c60-04", title: "4강. 실전 대화에서 일상의 전환 자연스럽게 말하기", minutes: 5,
        blocks: [
          {"t":"text","h":"하루 일과 속 일어나는 수많은 전환과 우연","md":"도중과 전환 표현을 통해 하루 일과를 드라마틱하고 풍성하게 이야기합니다.\\n\\n- **-는 길에**: 오가는 도중의 심부름과 만남 (퇴근길, 등굣길)\\n- **-다가**: 하던 일의 도중 중단이나 돌발 사건\\n- **-았/었다가**: 일단 했다가 취소하거나 되돌린 일"},
          {"t":"chars","wide":true,"items":[{"ch":"퇴근하는 길에 집 앞 빵집에서 갓 구운 식빵을 사 왔어요.","tip":"On my way home from work, I bought freshly baked bread from the bakery."},{"ch":"주말에 집안일 하다가 허리를 삐끗해서 한의원에 다녀왔어요.","tip":"While doing chores on the weekend, I strained my back and visited a clinic."},{"ch":"영화를 예매했다가 갑자기 야근이 잡혀서 취소했어요.","tip":"I booked a movie, but cancelled it because overtime suddenly came up."}]},
          {"t":"cloze","sentence":"A: 「이 과자 어디서 샀어?」 B: 「시내 [나갔다 오는 길에] 유명한 가게에서 사 왔지.」","answer":"나갔다 오는 길에","meaning":"A: Where did you buy these snacks? B: On my way back from going downtown, I bought them at a famous shop.","options":["나갔다 오는 길에","나갔다 오다가","나갔다 올 뿐만 아니라","나갔다 와야"],"keys":["나갔다 오는 길에","오는 길에","가는 길에"],"why":"시내에 갔다가 돌아오는 이동 경로 중에 과자를 사 왔으므로 **-는 길에**가 가장 적합합니다."},
          {"t":"choice","q":"친구에게 이동 중에 가벼운 심부름을 부탁할 때 가장 자연스러운 표현은?","options":["편의점 가는 길에 생수 한 병만 사다 줄래?","편의점 가다가 생수 한 병만 사다 줄래?","편의점 가야 생수 한 병만 사다 줄래?"],"answer":0,"why":"편의점으로 이동하는 길을 활용해 심부름을 부탁하므로 **가는 길에**가 가장 다정하고 자연스럽습니다."},
          {"t":"cloze","sentence":"전화를 [받다가] 배터리가 다 닳아서 통화가 뚝 끊겼어요.","answer":"받다가","meaning":"While talking on the phone, the battery ran out and the call abruptly got cut off.","options":["받다가","받는 길에","받아야","받을 뿐만 아니라"],"keys":["받다가","하고 있다가","받던 중에"],"why":"통화를 나누는 도중에 배터리 방전으로 중단되었으므로 행동 지속 중단을 뜻하는 **-다가**입니다."},
          {"t":"type","q":"출근하다 — 「___ 길에 지하철에서 우연히 고등학교 동창을 만났어요.」 알맞은 형태로 쓰세요.","answer":"출근하는","keys":["출근하는","출근하는 길에"],"why":"직장으로 이동하는 도중을 의미하므로 **출근하는**이 됩니다."},
          {"t":"order","q":"「요리하다가 손가락을 살짝 베여서 밴드를 붙였어요.」 를 순서대로 만들어 보세요.","tokens":["요리하다가","손가락을 살짝","베여서","밴드를 붙였어요."],"answer":["요리하다가","손가락을 살짝","베여서","밴드를 붙였어요."]},
          {"t":"note","md":"**대화의 생생한 현장감**\\n\"빵 샀어\"보다 **\"집에 오는 길에 빵 샀어\"**, \"다쳤어\"보다 **\"뛰어가다 넘어졌어\"**처럼 도중 표현을 곁들이면 훨씬 흥미진진한 대화가 됩니다."},
          {"t":"speak","say":"퇴근하는 길에 지하철역 앞에서 붕어빵을 파는 걸 보고 그냥 지나칠 수 없더라고요.","q":"추운 겨울날 따뜻한 간식을 사 들고 가는 흐뭇한 표정으로 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c61',
    emoji: '📏',
    title: { ko: '중급 61: 정도를 나타낼 때', en: 'Intermediate 61: Expressing Degree' },
    tagline: { ko: '눈물 날 정도 · 주먹만 한 크기 · 노력한 만큼', en: 'To tears, fist-sized, as much as you worked' },
    blurb: { ko: '-(으)ㄹ 정도로, 만 하다, -(으)ㄴ/는/(으)ㄹ 만큼 … 실감 나는 과장(-(으)ㄹ 정도로), 크기 견주기(만 하다), 노력과 비례하는 분량(만큼)을 생생하게 표현합니다.', en: 'Express dramatic degree (-(으)ㄹ 정도로), compare sizes (만 하다), and describe proportionate amounts (-(으)ㄴ/는/(으)ㄹ 만큼).' },
    level: 'Intermediate',
    needs: 'im-c60',
    lessons: [
      {
        id: "im-c61-01", title: "1강. 눈물 날 정도로 실감 나게 (-(으)ㄹ 정도로)", minutes: 4,
        blocks: [
          {"t":"text","h":"생생한 묘사와 극적인 강조","md":"**-(으)ㄹ 정도로** 는 어떤 상태나 행동의 정도가 **어느 수준에 도달했는지를 실감 나게 비교하거나 과장하여 묘사할 때** 씁니다.\\n> 눈물이 날 **정도로** 매워요.\\n> 화장실 갈 시간도 없을 **정도로** 바빴어요.\\n\\n문장 끝에서 **-(으)ㄹ 정도이다 / 정도예요** 로 서술어로도 아주 많이 쓰입니다."},
          {"t":"table","head":["품사 및 받침","사전형","-(으)ㄹ 정도로","서술형 (-(으)ㄹ 정도이다)"],"rows":[["동사 (받침 없음)","서다 / 울다","설 정도로 / 울 정도로","눈물이 핑 돌 정도예요"],["동사 (받침 있음)","먹다 / 숨쉬다","먹을 정도로 / 숨쉴 정도로","숨이 턱 막힐 정도예요"],["형용사 (받침 없음)","바쁘다 / 아프다","바쁠 정도로 / 아플 정도로","말도 못 할 정도예요"],["형용사 (받침 있음)","춥다 / 좁다","추울 정도로 / 좁을 정도로","발이 꽁꽁 얼 정도예요"]]},
          {"t":"chars","wide":true,"items":[{"ch":"배가 찢어질 정도로 배부르게 잘 먹었습니다.","tip":"I ate so full to the extent that my stomach might burst."},{"ch":"앞이 제대로 안 보일 정도로 폭우가 쏟아졌어요.","tip":"Heavy rain poured to the extent that I couldn't see ahead properly."},{"ch":"너무 졸려서 서서 잘 정도로 피곤했어요.","tip":"I was so tired to the point of sleeping while standing."}]},
          {"t":"cloze","sentence":"손이 꽁꽁 [얼 정도로] 바깥 날씨가 매섭게 추워요.","answer":"얼 정도로","meaning":"The outside weather is fiercely cold to the extent that hands freeze solid.","options":["얼 정도로","얼 만하게","얼 만큼만","얼 뿐만 아니라"],"keys":["얼 정도로","얼정도","얼 정도로도"],"why":"추위의 극심한 정도를 손이 얼 것 같다는 감각으로 실감 나게 표현하므로 **-(으)ㄹ 정도로**가 가장 어울립니다."},
          {"t":"choice","q":"업무량이 너무 많아 극심하게 바빴음을 과장하여 전할 때 알맞은 것은?","options":["숨 쉴 틈도 없을 정도로 눈코 뜰 새 없이 바빴어요.","숨 쉴 틈도 없을 만하게 눈코 뜰 새 없이 바빴어요.","숨 쉴 틈도 없도록 눈코 뜰 새 없이 바빴어요."],"answer":0,"why":"상태의 극단적인 정도를 생생하게 묘사할 때는 **-(으)ㄹ 정도로**를 씁니다."},
          {"t":"type","q":"웃다 — 「배가 아플 ___ 재미있게 웃었어요.」 정도를 나타내는 형태로 쓰세요.","answer":"정도로","keys":["정도로","정도까지","정도여서"],"why":"배가 아플 만큼 크게 웃었다는 정도의 한계를 잇는 **정도로**가 됩니다."},
          {"t":"order","q":"「혼자서는 다 들지 못할 정도로 짐이 무거웠어요.」 를 순서대로 만들어 보세요.","tokens":["혼자서는","다 들지 못할 정도로","짐이","무거웠어요."],"answer":["혼자서는","다 들지 못할 정도로","짐이","무거웠어요."]},
          {"t":"note","md":"**과장의 매력**\\n\"정말 매워요\"보다 **\"눈물이 쏙 빠질 정도로 매워요!\"**라고 하면 듣는 사람이 그 매운맛을 머릿속에 그대로 그리게 됩니다."},
          {"t":"speak","say":"그 가수의 콘서트는 목이 쉴 정도로 열광적인 분위기였어요.","q":"뜨거운 콘서트장의 열기를 생생하게 떠올리며 감탄조로 말해 보세요."},
        ],
      },
      {
        id: "im-c61-02", title: "2강. 주먹만 한 크기, 집채만 한 파도 (명사 + 만 하다)", minutes: 4,
        blocks: [
          {"t":"text","h":"사물의 크기나 분량을 친숙한 물건에 빗댈 때","md":"**명사 + 만 하다** 는 어떤 대상의 크기, 부피, 분량, 키 등이 **기준이 되는 명사와 엇비슷한 정도임을 나타낼 때** 씁니다.\\n> 수박이 아기 머리**만 해요**.\\n> 내 주먹**만 한** 사과.\\n\\n관형사형인 **'명사 + 만 한 + 명사'** 꼴로도 아주 자주 쓰입니다."},
          {"t":"table","head":["비교 기준 명사","만 하다 결합","관형사형","자주 쓰는 관용 표현"],"rows":[["주먹 (fist)","주먹만 하다","주먹만 한 돌","주먹만 한 얼굴 (매우 작음)"],["손바닥 (palm)","손바닥만 하다","손바닥만 한 방","손바닥만 한 마당 (좁음)"],["집채 (house)","집채만 하다","집채만 한 파도","집채만 한 바위 (거대함)"],["쥐꼬리 (rat tail)","쥐꼬리만 하다","쥐꼬리만 한 월급","쥐꼬리만 한 돈 (아주 적음)"]]},
          {"t":"chars","wide":true,"items":[{"ch":"얼굴이 얼마나 작은지 주먹만 하더라고요.","tip":"Her face is so small that it is barely the size of a fist."},{"ch":"바다에서 집채만 한 거대한 파도가 몰려왔어요.","tip":"A giant wave as huge as a house rolled in from the sea."},{"ch":"원룸 방 크기가 손바닥만 해서 짐 둘 곳이 없어요.","tip":"The studio room size is like a palm, so there's no space for luggage."}]},
          {"t":"cloze","sentence":"시골 마당에서 [어린아이만 한] 커다란 개를 키우고 있어요.","answer":"어린아이만 한","meaning":"In the countryside yard, they are raising a big dog the size of a young child.","options":["어린아이만 한","어린아이 정도로","어린아이만큼","어린아이뿐만 아니라"],"keys":["어린아이만 한","어린아이만한"],"why":"뒤에 오는 명사 '개'의 체구와 크기를 어린아이에 빗대어 수식하므로 관형사형 **명사 + 만 한**이 맞습니다."},
          {"t":"choice","q":"매우 좁은 공간을 실감 나게 비유한 관용적 표현은?","options":["방이 손바닥만 해서 침대 하나 놓기도 벅차요.","방이 손바닥 정도로 해서 침대 하나 놓기도 벅차요.","방이 손바닥만큼 해서 침대 하나 놓기도 벅차요."],"answer":0,"why":"공간이나 방이 매우 좁음을 빗댈 때 쓰는 대표적인 한국어 관용 표현은 **손바닥만 하다**입니다."},
          {"t":"type","q":"주먹 — 「우박이 ___ 크기로 하늘에서 쏟아졌어요.」 크기 비교 형태를 쓰세요.","answer":"주먹만 한","keys":["주먹만 한","주먹만한","주먹만"],"why":"명사 '주먹' 뒤에 크기 수식형 **만 한**이 붙어 **주먹만 한**이 됩니다."},
          {"t":"order","q":"「저 산꼭대기에서 집채만 한 바위가 굴러떨어졌어요.」 를 순서대로 만들어 보세요.","tokens":["저 산꼭대기에서","집채만 한","바위가","굴러떨어졌어요."],"answer":["저 산꼭대기에서","집채만 한","바위가","굴러떨어졌어요."]},
          {"t":"note","md":"**'-(으)ㄹ 만하다'와 구별하세요!**\\n- 동사 뒤: 먹**을 만하다** (가치·추천)\\n- 명사 뒤: 주먹**만 하다** (크기·비슷함)"},
          {"t":"speak","say":"시장 골목에서 갓 잡은 팔뚝만 한 싱싱한 생선을 샀어요.","q":"물고기의 크기를 손짓하듯 실감 나게 감탄하며 말해 보세요."},
        ],
      },
      {
        id: "im-c61-03", title: "3강. 뿌린 대로 거둔다 (-(으)ㄴ/는/(으)ㄹ 만큼)", minutes: 4,
        blocks: [
          {"t":"text","h":"노력에 비례하는 결과, 감당할 수 있는 분량","md":"**만큼** 은 앞의 행동이나 상태와 **걸맞은 분량, 한도, 비례의 관계**를 나타냅니다.\\n\\n1. **인과와 비례**: \"뿌린 대로 거둔다\"\\n> 노력**한 만큼** 좋은 결과가 나와요.\\n2. **분량과 한도**: \"허용되는 양\"\\n> 드실 수 있**는 만큼만** 담아 가세요."},
          {"t":"table","head":["시제 및 품사","사전형","결합 형태","예문"],"rows":[["과거 (동사)","노력하다","노력한 만큼","노력한 만큼 보람이 커요."],["현재 (동사)","사랑하다 / 주다","사랑하는 만큼 / 주는 만큼","사랑하는 만큼 아껴 주세요."],["미래/가능 (동사)","먹다 / 담다","먹을 만큼 / 담을 만큼","먹을 만큼만 덜어 드세요."],["형용사 (전체)","바쁘다 / 넓다","바쁜 만큼 / 넓은 만큼","책임이 무거운 만큼 보수가 높아요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"시간을 투자한 만큼 실력이 눈에 띄게 늘었어요.","tip":"As much as I invested time, my skills visibly improved."},{"ch":"뷔페에서는 먹을 수 있는 만큼만 접시에 담으세요.","tip":"At the buffet, please take on your plate only as much as you can eat."},{"ch":"기대가 컸던 만큼 실망도 그만큼 컸습니다.","tip":"Just as expectations were big, disappointment was that big as well."}]},
          {"t":"cloze","sentence":"흘린 [땀방울만큼] 값진 성공을 거둘 수 있습니다.","answer":"땀방울만큼","meaning":"As much as the sweat drops shed, you can achieve valuable success.","options":["땀방울만큼","땀방울만하게","땀방울조차","땀방울뿐만 아니라"],"keys":["땀방울만큼","땀만큼","노력만큼"],"why":"흘린 노력의 양에 걸맞게 비례하여 성공한다는 인과를 나타내므로 **명사 + 만큼**이 맞습니다."},
          {"t":"choice","q":"자신이 먹을 수 있는 분량만큼만 덜어가라는 안내 문구로 알맞은 것은?","options":["드실 만큼만 적당히 가져가시기 바랍니다.","드실 정도로만 적당히 가져가시기 바랍니다.","드실 만하게만 적당히 가져가시기 바랍니다."],"answer":0,"why":"감당할 수 있는 분량과 한도를 뜻할 때는 **-(으)ㄹ 만큼**을 씁니다."},
          {"t":"type","q":"노력하다 — 「자신이 ___ 결실을 맺는 법이에요.」 과거 비례를 나타내세요.","answer":"노력한 만큼","keys":["노력한 만큼","노력한만큼"],"why":"과거에 쏟아부은 노력의 양에 비례하므로 관형사 과거형 **노력한 만큼**이 됩니다."},
          {"t":"order","q":"「제가 도울 수 있는 만큼 최선을 다해 도와드릴게요.」 를 순서대로 만들어 보세요.","tokens":["제가 도울 수 있는","만큼","최선을 다해","도와드릴게요."],"answer":["제가 도울 수 있는","만큼","최선을 다해","도와드릴게요."]},
          {"t":"note","md":"**-(으)ㄹ 정도로 vs -(으)ㄹ 만큼**\\n- **-(으)ㄹ 정도로**: 극적인 '과장과 강도' (죽을 정도로 힘들다)\\n- **-(으)ㄹ 만큼**: 균형 잡힌 '비례와 분량' (한 만큼 받다)"},
          {"t":"speak","say":"우리가 함께 고생한 만큼 오늘 결과가 더욱 뜻깊고 값지네요.","q":"함께 땀 흘린 팀원들을 격려하듯 따뜻하고 뿌듯한 어조로 말해 보세요."},
        ],
      },
      {
        id: "im-c61-04", title: "4강. 실전 대화에서 정도를 생생하게 묘사하기", minutes: 5,
        blocks: [
          {"t":"text","h":"풍부한 비유로 대화의 맛 살리기","md":"정도를 나타내는 세 가지 표현을 적재적소에 꺼내어 표현력을 극대화합니다.\\n\\n- **-(으)ㄹ 정도로**: 눈물 날 정도, 숨 막힐 정도 (실감 나는 과장)\\n- **만 하다**: 주먹만 하다, 손바닥만 하다 (직관적인 크기 묘사)\\n- **만큼**: 노력한 만큼, 먹을 만큼 (비례와 분량)"},
          {"t":"chars","wide":true,"items":[{"ch":"얼마나 웃었는지 배가 당길 정도로 웃었어요.","tip":"I laughed so much to the extent that my stomach cramped."},{"ch":"오늘 아침 시장에서 팔뚝만 한 대왕 갈치를 보았어요.","tip":"This morning at the market, I saw a giant hairtail the size of an arm."},{"ch":"고민한 만큼 아주 훌륭한 아이디어가 나왔네요.","tip":"As much as you deliberated, a truly wonderful idea came out."}]},
          {"t":"cloze","sentence":"신발이 발에 꼭 맞아서 날아갈 [것 같을 정도로] 가볍고 편해요.","answer":"것 같을 정도로","meaning":"The shoes fit so snugly that they are light and comfortable to the extent of feeling like flying.","options":["것 같을 정도로","것만 하게","것만큼만","것뿐만 아니라"],"keys":["것 같을 정도로","것 같을정도","것같을 정도로"],"why":"날아갈 것만 같다는 생생한 과장을 통해 신발의 편안한 정도를 극대화하므로 **-(으)ㄹ 정도로**가 맞습니다."},
          {"t":"choice","q":"우체국 상자의 크기를 친숙한 대상에 빗대어 설명할 때 가장 알맞은 것은?","options":["상자 크기가 전자레인지 만해요.","상자 크기가 전자레인지 정도로 해요.","상자 크기가 전자레인지 만큼만 해요."],"answer":0,"why":"사물의 부피나 크기를 직관적으로 견줄 때는 **명사 + 만 하다**를 씁니다."},
          {"t":"cloze","sentence":"준비 기간이 [길었던 만큼] 완성도 높은 전시회가 될 것입니다.","answer":"길었던 만큼","meaning":"Just as the preparation period was long, it will be an exhibition of high perfection.","options":["길었던 만큼","길 만하게","길 조차","길 뿐만 아니라"],"keys":["길었던 만큼","길었던만큼","긴 만큼"],"why":"오랜 준비 기간이라는 투입에 비례하여 완성도가 높을 것이라는 인과적 균형을 뜻하므로 **-(으)ㄴ 만큼**입니다."},
          {"t":"type","q":"지치다 — 「손가락 하나 까딱할 수 없을 ___ 힘든 하루였어요.」 정도의 과장을 쓰세요.","answer":"정도로","keys":["정도로","정도여서","정도까지"],"why":"손가락조차 움직일 수 없을 만큼 극단적인 피로 수준을 강조하므로 **정도로**가 됩니다."},
          {"t":"order","q":"「오늘 흘린 땀방울만큼 내일의 성공이 가까워집니다.」 를 순서대로 만들어 보세요.","tokens":["오늘 흘린","땀방울만큼","내일의 성공이","가까워집니다."],"answer":["오늘 흘린","땀방울만큼","내일의 성공이","가까워집니다."]},
          {"t":"note","md":"**한국어 묘사의 비결**\\n추상적으로 \"힘들다\", \"크다\", \"맛있다\"만 말하기보다 **\"눈물 날 정도로\"**, **\"얼굴만 한\"**, **\"기대한 만큼\"**을 곁들이면 한국인 원어민 같은 생생한 표현력을 갖추게 됩니다."},
          {"t":"speak","say":"그 드라마는 대사 한마디 한마디가 가슴을 울릴 정도로 깊은 여운이 남더라고요.","q":"작품의 감동을 온 마음으로 느끼듯 깊고 진중한 어조로 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c62',
    emoji: '🎯',
    title: { ko: '중급 62: 선택을 나타낼 때', en: 'Intermediate 62: Expressing Choice' },
    tagline: { ko: '아무거나 · 영화나 · 물이라도 · -든지 · -는 대신에', en: 'Anything, a movie or so, at least water, whether or, instead of' },
    blurb: { ko: '아무나/아무거나/아무 데나, (이)나, (이)라도, -든지 -든지, -(으)ㄴ/는 대신에로 상황과 뉘앙스에 맞게 선택하고 절충하는 표현을 익힙니다.', en: 'Learn to express free choice, compromised choices, polite offers, indifferent options, and trade-offs.' },
    level: 'Intermediate',
    needs: 'im-c61',
    lessons: [
      {
        id: "im-c62-01", title: "1강. 무엇이든 상관없을 때 (아무나 / 아무거나 / 아무 데나)", minutes: 4,
        blocks: [
          {"t":"text","h":"조건 없이 무엇이든 상관없음을 나타낼 때","md":"**아무나 / 아무거나 / 아무 데나** 는 특별히 정해진 것 없이 무엇이든, 누구든, 어느 자리든 **상관없음**을 나타냅니다.\\n\\n- **아무나**: 사람 (누구든 상관없이)\\n- **아무거나**: 사물 (무엇이든 상관없이)\\n- **아무 데나**: 장소/위치 (어디든 상관없이)\\n\\n⚠️ **주의**: 부정문에서는 조사 **-도** 가 붙어 전체를 부정합니다.\\n> **아무도** 안 왔어요. (nobody)\\n> **아무것도** 안 먹었어요. (nothing)\\n> **아무 데도** 안 가요. (nowhere)"},
          {"t":"table","head":["구분","긍정문 (무관·선택)","부정문 (전체 부정)","예문"],"rows":[["사람","아무나 (anyone)","아무도 (nobody)","아무나 풀 수 있는 쉬운 문제예요."],["사물","아무거나 (anything)","아무것도 (nothing)","배고프니까 아무거나 다 좋아요."],["장소","아무 데나 (anywhere)","아무 데도 (nowhere)","편한 자리에 아무 데나 앉으세요."],["때/시간","아무 때나 (anytime)","아무 때도 (거의 안 씀)","궁금한 점이 있으면 아무 때나 물어보세요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"저는 가리는 음식이 없어서 아무거나 다 잘 먹어요.","tip":"I am not picky about food, so I eat anything well."},{"ch":"편하신 빈자리에 아무 데나 앉으시면 됩니다.","tip":"You can sit anywhere in an empty seat that is comfortable."},{"ch":"회의실 문을 열어 보았지만 안에는 아무도 없었어요.","tip":"I opened the meeting room door, but there was nobody inside."}]},
          {"t":"cloze","sentence":"시간이 촉박하니 점심은 식당에 가서 [아무거나] 빨리 나오는 걸로 먹읍시다.","answer":"아무거나","meaning":"Since time is tight, let's go to the restaurant and eat anything that comes out quickly.","options":["아무거나","아무것도","아무나","아무도"],"keys":["아무거나","아무 거나"],"why":"사물(음식 메뉴)에 대해 특별한 구별 없이 무엇이든 상관없음을 나타내므로 **아무거나**가 알맞습니다."},
          {"t":"choice","q":"부정문에서 '아무도'를 올바르게 사용한 문장은?","options":["주말 아침이라 사무실에 아무도 출근하지 않았어요.","주말 아침이라 사무실에 아무나 출근하지 않았어요.","주말 아침이라 사무실에 아무 데나 출근하지 않았어요."],"answer":0,"why":"사람을 대상으로 전체를 부정하는 서술어가 올 때는 **아무도 + 부정 서술어** 꼴을 씁니다."},
          {"t":"type","q":"장소 선택 — 「짐이 무거우니 바닥 ___ 편하게 내려놓으세요.」 괄호에 알맞은 말을 쓰세요.","answer":"아무 데나","keys":["아무 데나","아무데나","아무 데에나"],"why":"정해진 곳 없이 어디든 상관없이 놓으라는 뜻이므로 **아무 데나**가 됩니다."},
          {"t":"order","q":"「궁금한 점이 생기면 언제든 아무 때나 편하게 연락해 주세요.」 를 순서대로 만들어 보세요.","tokens":["궁금한 점이 생기면","언제든","아무 때나","편하게 연락해 주세요."],"answer":["궁금한 점이 생기면","언제든","아무 때나","편하게 연락해 주세요."]},
          {"t":"note","md":"**아무나 vs 누구나 구별하기**\\n- **누구나**: 모든 사람 (예외 없이 모두 가능: \"누구나 참여할 수 있습니다\")\\n- **아무나**: 자격이나 기준 없이 아무 사람 (함부로 대하는 뉘앙스 가능: \"아무나 들어오면 안 돼요\")"},
          {"t":"speak","say":"저는 가리는 음식이 없으니까 메뉴는 아무거나 네가 먹고 싶은 걸로 시켜.","q":"상대방의 의견을 편안하게 존중하듯 시원시원하고 부드러운 어조로 말해 보세요."},
        ],
      },
      {
        id: "im-c62-02", title: "2강. 아쉬운 차선책과 배려의 권유 ((이)나 vs (이)라도)", minutes: 4,
        blocks: [
          {"t":"text","h":"차선책과 완곡한 배려의 선택","md":"가장 만족스럽지는 않지만 대안을 선택할 때 **(이)나** 와 **(이)라도** 를 씁니다.\\n\\n1. **(이)나 (아쉬운 선택/차선책)**\\n> 제일 마음에 드는 건 아니지만 아쉬운 대로 그거라도 하자는 뉘앙스입니다.\\n> 심심한데 집에서 **영화나** 볼까요?\\n\\n2. **(이)라도 (배려와 최소한의 양보)**\\n> 최선은 아니지만 그거라도 괜찮다는 뜻으로, 상대를 배려하거나 정중히 권할 때 많이 씁니다.\\n> 목이 마르실 텐데 **시원한 물이라도** 한 잔 드릴까요?"},
          {"t":"table","head":["받침 유무","(이)나 (차선책)","(이)라도 (배려/최소한)","뉘앙스 차이"],"rows":[["받침 있음","밥이나 / 라면이나","밥이라도 / 라면이라도","(이)나는 본인의 아쉬운 선택, (이)라도는 양보와 권유"],["받침 없음","커피나 / 영화나","커피라도 / 영화라도","(이)라도가 훨씬 공손하고 상대를 생각하는 느낌"],["부사/시간 뒤","잠깐이나 (어색)","잠깐이라도 / 조금이라도","(이)라도는 부사나 수량 뒤에 붙어 '최소한'을 강조"]]},
          {"t":"chars","wide":true,"items":[{"ch":"주말에 특별한 계획이 없으면 집에서 청소나 해야겠어요.","tip":"If there are no special weekend plans, I should just do some cleaning at home."},{"ch":"먼 길 오시느라 지치셨을 텐데 잠깐이라도 앉아서 쉬세요.","tip":"You must be tired from coming a long way, so please sit and rest even for a short while."},{"ch":"약속이 취소되었으니 서점에 들러서 책이나 한 권 사서 읽죠.","tip":"Since the appointment was cancelled, let's stop by the bookstore, buy a book, and read."}]},
          {"t":"cloze","sentence":"손님이 오셨는데 마침 음료가 다 떨어져서 시원한 [냉수라도] 한잔 대접했습니다.","answer":"냉수라도","meaning":"A guest came but beverages just ran out, so I served at least a cup of cold water.","options":["냉수라도","냉수이나","냉수나마나","냉수든지"],"keys":["냉수라도","물이라도","냉수라도 한잔"],"why":"비록 좋은 음료는 아니지만 최소한의 대안으로 정성껏 권하고 대접하는 것이므로 **(이)라도**가 알맞습니다."},
          {"t":"choice","q":"할 일이 없어 아쉬운 대로 차선책을 선택하는 말로 가장 어울리는 것은?","options":["비도 오고 심심한데 집에서 텔레비전이나 봐야겠어요.","비도 오고 심심한데 집에서 텔레비전이라도 봐야겠어요.","비도 오고 심심한데 집에서 텔레비전 대신에 봐야겠어요."],"answer":0,"why":"특별히 대단한 일은 아니지만 마땅한 대안이 없어 아쉬운 대로 고를 때는 **(이)나**를 씁니다."},
          {"t":"type","q":"라면 — 「냉장고에 밥이 없으니 점심으로 간단히 ___ 끓여 먹자.」 차선책 조사를 쓰세요.","answer":"라면이나","keys":["라면이나"],"why":"받침 있는 명사 '라면' 뒤에 차선책을 나타내는 조사 **-이나**가 붙어 **라면이나**가 됩니다."},
          {"t":"order","q":"「바쁘시더라도 식사라도 거르지 말고 꼭 챙겨 드세요.」 를 순서대로 만들어 보세요.","tokens":["바쁘시더라도","식사라도 거르지 말고","꼭","챙겨 드세요."],"answer":["바쁘시더라도","식사라도 거르지 말고","꼭","챙겨 드세요."]},
          {"t":"note","md":"**말맛의 미묘한 차이**\\n- **\"밥이나 먹자\"**: 특별한 약속 없으니 대충 밥이라도 먹자는 무심한 뉘앙스\\n- **\"밥이라도 먹자\"**: 굶지 말고 최소한 밥은 챙겨 먹자는 걱정과 배려의 뉘앙스"},
          {"t":"speak","say":"오늘 하루 정말 고생 많으셨으니 시원한 맥주라도 한 잔 하시면서 피로를 푸세요.","q":"지친 동료를 진심으로 위로하고 챙겨 주듯 따뜻하고 다정한 어조로 말해 보세요."},
        ],
      },
      {
        id: "im-c62-03", title: "3강. 무엇을 골라도 상관없을 때와 맞바꿈 (-든지 -든지 / -(으)ㄴ/는 대신에)", minutes: 4,
        blocks: [
          {"t":"text","h":"어느 쪽이든 상관없는 선택과 대체의 맞바꿈","md":"둘 이상의 대안 중에서 무엇이든 무관함을 나타낼 때는 **-든지 -든지**, 하나를 양보하고 다른 것으로 대체할 때는 **-(으)ㄴ/는 대신에** 를 씁니다.\\n\\n1. **-든지 -든지**: 어느 쪽을 선택해도 무관함\\n> 구어에서는 흔히 **-든 -든** 으로 줄여서 말합니다.\\n> 가**든지** 말**든지** 네 마음대로 해.\\n\\n2. **-(으)ㄴ/는 대신에**: 대체와 보상의 맞바꿈\\n> 어떤 행동을 하지 않고 다른 것으로 대신하거나, 한쪽의 단점을 다른 쪽의 장점으로 메울 때 씁니다.\\n> 커피를 마시**는 대신에** 따뜻한 허브차를 마셔요.\\n> 월급이 적**은 대신에** 근무 시간이 자유로워요."},
          {"t":"table","head":["문법","품사 및 시제","결합 형태","예문"],"rows":[["-든지 -든지","동사 / 형용사","가든지 오든지 / 크든지 작든지","비가 오든지 눈이 오든지 출발할 거예요."],["-든지 -든지","명사","밥이든지 빵이든지 (밥이든 빵이든)","산이든 바다든 어디든 좋아요."],["-(으)ㄴ/는 대신에","동사 (대체)","먹는 대신에 / 쉬는 대신에","주말에 일하는 대신에 평일에 하루 쉬어요."],["-(으)ㄴ/는 대신에","형용사 (보상/대조)","비싼 대신에 / 작은 대신에","방이 좁은 대신에 보증금이 저렴해요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"주말에 산으로 가든지 바다로 가든지 네가 원하는 곳으로 가자.","tip":"Whether we go to the mountain or the sea on the weekend, let's go where you want."},{"ch":"이 카메라는 가격이 비싼 대신에 화질이 정말 뛰어납니다.","tip":"While this camera has an expensive price, the picture quality is truly outstanding in return."},{"ch":"설탕이 많이 든 탄산음료를 마시는 대신에 물을 자주 마시려고 해요.","tip":"Instead of drinking sugar-heavy soda, I try to drink water frequently."}]},
          {"t":"cloze","sentence":"이 원룸은 역에서 조금 먼 [대신에] 방이 넓고 월세가 아주 쌉니다.","answer":"대신에","meaning":"This studio is a bit far from the station, but instead the room is spacious and monthly rent is very cheap.","options":["대신에","덕분에","탓에","바람에"],"keys":["대신에","대신"],"why":"역에서 멀다는 단점이 있는 반면 월세가 싸고 넓다는 장점으로 보상·맞바꿈되므로 **-(으)ㄴ 대신에**가 알맞습니다."},
          {"t":"choice","q":"다음 중 맞춤법이 올바른 문장은?","options":["밥을 먹든지 빵을 먹든지 네가 원하는 걸로 골라.","밥을 먹던지 빵을 먹던지 네가 원하는 걸로 골라.","밥을 먹든지 빵을 먹던지 네가 원하는 걸로 골라."],"answer":0,"why":"선택과 무관함을 나타낼 때는 **-든지**를 쓰며, 과거를 회상할 때 쓰는 **-던지**와 철저히 구별해야 합니다."},
          {"t":"type","q":"오다 — 「그 사람이 ___ 안 오든 우리는 예정대로 회의를 시작합시다.」 무관한 선택 어미를 쓰세요.","answer":"오든지","keys":["오든지","오든"],"why":"동사 어간 '오-' 뒤에 선택의 어미가 붙어 **오든지**(줄여서 **오든**)가 됩니다."},
          {"t":"order","q":"「제가 저녁을 사는 대신에 커피는 네가 사 주면 좋겠어.」 를 순서대로 만들어 보세요.","tokens":["제가 저녁을","사는 대신에","커피는 네가","사 주면 좋겠어."],"answer":["제가 저녁을","사는 대신에","커피는 네가","사 주면 좋겠어."]},
          {"t":"note","md":"**-든지 vs -던지 헷갈리지 마세요!**\\n- **-든지**: 선택과 무관 (\"가**든지** 말**든지** 상관없어\")\\n- **-던지**: 과거의 회상과 감탄 (\"어제 날씨가 얼마나 춥**던지** 깜짝 놀랐어\")"},
          {"t":"speak","say":"제가 오늘 일을 도와드리는 대신에 다음 주 발표 준비할 때 좀 도와주세요.","q":"서로 돕고 조율하는 비즈니스 파트너처럼 신뢰감 있고 부드러운 어조로 말해 보세요."},
        ],
      },
      {
        id: "im-c62-04", title: "4강. 실전 대화에서 선택과 절충 자유자재로 쓰기", minutes: 5,
        blocks: [
          {"t":"text","h":"상황에 맞는 최선의 선택과 완곡한 절충","md":"배운 선택 표현들을 대화 상황에 맞춰 적절하게 골라 쓰는 연습을 합니다.\\n\\n- **아무거나 / 아무 데나**: 취향에 구애받지 않고 전적으로 맡길 때\\n- **(이)나**: 딱히 계획이 없어 아쉬운 대로 가볍게 제안할 때\\n- **(이)라도**: 상대를 배려하여 부담 없이 최소한의 제안을 건넬 때\\n- **-든지 -든지**: 어떤 대안이든 흔쾌히 수용할 때\\n- **-(으)ㄴ/는 대신에**: 장단점을 견주거나 상호 절충할 때"},
          {"t":"chars","wide":true,"items":[{"ch":"주말에 산으로 가든지 바다로 가든지 다 좋으니까 바람이나 쐬러 가요.","tip":"Whether we go to mountains or the sea, everything is good, so let's just go get some fresh air."},{"ch":"목이 마르면 냉장고에 있는 보리차라도 꺼내서 편하게 마셔.","tip":"If you are thirsty, take out at least the barley tea in the fridge and drink comfortably."},{"ch":"이번 학기에는 강의를 적게 듣는 대신에 어학연수 준비에 집중하기로 했어요.","tip":"This semester, instead of taking fewer lectures, I decided to focus on language study prep."}]},
          {"t":"cloze","sentence":"점심시간이 30분밖에 안 남았으니 편의점에서 [삼각김밥이나] 사서 대충 때우자.","answer":"삼각김밥이나","meaning":"Since only 30 minutes are left for lunchtime, let's just buy triangle kimbap at the convenience store and make do.","options":["삼각김밥이나","삼각김밥이라도","삼각김밥대신에","삼각김밥든지"],"keys":["삼각김밥이나","김밥이나"],"why":"시간이 부족하여 아쉬운 대로 간단한 대안을 선택하는 것이므로 **(이)나**가 알맞습니다."},
          {"t":"choice","q":"상대방의 의견을 전적으로 따르겠다고 말하는 자연스러운 답변은?","options":["저는 무엇이든 상관없으니까 아무거나 네가 먹고 싶은 걸로 골라.","저는 무엇이든 상관없으니까 아무것도 네가 먹고 싶은 걸로 골라.","저는 무엇이든 상관없으니까 아무도 네가 먹고 싶은 걸로 골라."],"answer":0,"why":"사물(음식)에 대해 특별히 가리지 않고 상대의 선택에 맡길 때는 **아무거나**를 씁니다."},
          {"t":"cloze","sentence":"직접 찾아가서 인사드리는 [대신에] 정성을 담은 감사 편지를 써서 보냈습니다.","answer":"대신에","meaning":"Instead of visiting and greeting in person, I wrote and sent a thank-you letter filled with sincerity.","options":["대신에","때문에","덕분에","위해서"],"keys":["대신에","대신"],"why":"직접 찾아가는 행동을 하지 않고 다른 행동(편지 쓰기)으로 대체하였으므로 **동사 + -는 대신에**가 맞습니다."},
          {"t":"type","q":"듣다 — 「음악을 ___ 책을 읽든지 네가 집중하기 편한 방식으로 해.」 괄호에 알맞은 형태를 쓰세요.","answer":"듣든지","keys":["듣든지","듣든"],"why":"동사 '듣다' 어간 뒤에 무관함을 나타내는 선택 어미 **-든지**가 결합하여 **듣든지**가 됩니다."},
          {"t":"order","q":"「시간이 없으니 잠깐이라도 얼굴이라도 보고 가시면 좋겠습니다.」 를 순서대로 만들어 보세요.","tokens":["시간이 없으니","잠깐이라도","얼굴이라도 보고","가시면 좋겠습니다."],"answer":["시간이 없으니","잠깐이라도","얼굴이라도 보고","가시면 좋겠습니다."]},
          {"t":"note","md":"**한국인의 소통 습관**\\n한국어에서는 상대에게 배려를 표현할 때 \"냉수 한 잔 마셔요\"보다 **\"냉수라도 한 잔 마셔요\"**처럼 **(이)라도**를 쓰면, 비록 차린 것은 소박하지만 마음을 쓴다는 따뜻한 정이 전해집니다."},
          {"t":"speak","say":"오늘 저녁에 특별한 일 없으시면 퇴근길에 저랑 맥주나 한잔하러 가실래요?","q":"동료에게 부담 없이 가벼운 마음으로 제안하듯 편안하고 친근한 어조로 말해 보세요."},
        ],
      },
    ],
  },
  {
    id: 'im-c63',
    emoji: '⏱️',
    title: { ko: '중급 63: 시간과 순서를 나타낼 때', en: 'Intermediate 63: Expressing Time and Sequence' },
    tagline: { ko: '3년 만에 · 싸 가지고 · 샀다가 취소 · 먹고서', en: 'After 3 years, pack and bring, bought then returned, after eating' },
    blurb: { ko: '만에, -아/어 가지고, -았/었다가, -고서로 시간의 경과, 동작의 상태 유지와 연속, 상황의 반전과 완료의 순서를 명확하게 표현합니다.', en: 'Express elapsed time (만에), sequential state (-아/어 가지고), reversal after completion (-았/었다가), and strict sequence (-고서).' },
    level: 'Intermediate',
    needs: 'im-c62',
    lessons: [
      {
        id: "im-c63-01", title: "1강. 얼마 만인가요? 시간의 경과 (기간 + 만에)", minutes: 4,
        blocks: [
          {"t":"text","h":"일정한 시간이 흐른 뒤 어떤 일이 일어남을 나타낼 때","md":"**기간 + 만에** 는 어떤 일이 있고 나서 그만큼의 시간이 흐른 뒤에 다음 일이 일어남을 나타냅니다.\\n\\n- **얼마 만에**: 얼마의 시간이 흐른 뒤\\n> 이게 **얼마 만에** 만나는 거지?\\n- **기간 + 만에**: 그 기간이 지난 시점에\\n> 바빠서 못 가다가 **3년 만에** 고향에 다녀왔어요.\\n> 시험공부를 시작한 지 **한 달 만에** 합격증을 받았습니다.\\n\\n⚠️ **'동안'과의 차이**: '동안'은 그 시간 **내내 지속됨**을 뜻하고, '만에'는 그 시간이 **다 지나고 나서 비로소 발생함**을 뜻합니다."},
          {"t":"table","head":["표현","문법적 성격","의미와 뉘앙스","예문"],"rows":[["기간 + 만에","시간의 경과 (시점)","그 시간이 흐른 뒤에 비로소 일어남","10년 만에 옛 친구를 다시 만났어요."],["기간 + 동안","시간의 지속 (구간)","그 시간 내내 계속해서 지속됨","10년 동안 이 회사에서 일했어요."],["얼마 만에","의문/감탄","오랜만에 만났을 때 반가움의 질문","이게 도대체 얼마 만이에요?"]]},
          {"t":"chars","wide":true,"items":[{"ch":"바빠서 고향에 못 가다가 무려 5년 만에 다녀왔어요.","tip":"I couldn't visit hometown being busy, but visited after a full 5 years."},{"ch":"열심히 노력한 끝에 3일 만에 프로젝트를 끝마쳤습니다.","tip":"After working hard, I finished the project in just 3 days."},{"ch":"정말 오랜만이네요! 이게 도대체 몇 년 만인가요?","tip":"It's truly been a long time! How many years has it been after all?"}]},
          {"t":"cloze","sentence":"외국 유학을 떠난 지 무려 [10년 만에] 한국 땅을 다시 밟았습니다.","answer":"10년 만에","meaning":"After a full 10 years since leaving to study abroad, I stepped on Korean soil again.","options":["10년 만에","10년 동안","10년 전에","10년 때에"],"keys":["10년 만에","십 년 만에","십년 만에"],"why":"10년이라는 긴 세월이 흐른 뒤에 마침내 한국에 돌아왔다는 경과 시점을 뜻하므로 **기간 + 만에**가 알맞습니다."},
          {"t":"choice","q":"'동안'과 '만에'의 쓰임이 올바른 문장은?","options":["5년 만에 고향에 돌아왔고, 고향에서 3일 동안 머물렀어요.","5년 동안 고향에 돌아왔고, 고향에서 3일 만에 머물렀어요.","5년 전에 고향에 돌아왔고, 고향에서 3일 만에 머물렀어요."],"answer":0,"why":"5년의 세월이 지나서 돌아온 것은 경과의 **만에**, 3일 내내 머무른 것은 지속의 **동안**입니다."},
          {"t":"type","q":"얼마 — 「이게 ___ 만이에요? 정말 오랜만이에요!」 괄호에 알맞은 말을 쓰세요.","answer":"얼마","keys":["얼마"],"why":"시간의 경과를 나타내는 의문 조사 '만에' 앞에는 **얼마**가 결합하여 **얼마 만에**가 됩니다."},
          {"t":"order","q":"「밤낮으로 집중해서 일주일 만에 번역 작업을 모두 끝냈어요.」 를 순서대로 만들어 보세요.","tokens":["밤낮으로 집중해서","일주일 만에","번역 작업을","모두 끝냈어요."],"answer":["밤낮으로 집중해서","일주일 만에","번역 작업을","모두 끝냈어요."]},
          {"t":"note","md":"**띄어쓰기 주의: '오랜만' vs '몇 년 만'**\\n- **오랜만**: '오래간만'의 줄임말로 한 단어이므로 붙여 씁니다.\\n- **기간 + 만**: 시간이나 횟수를 나타내는 의존명사이므로 앞말과 띄어 씁니다 (예: **3년 v 만에**, **이틀 v 만에**)."},
          {"t":"speak","say":"정말 반가워요! 우리가 졸업하고 나서 거의 삼 년 만에 다시 만나는 거네요.","q":"오랜만에 만난 친구를 향한 반가움과 벅찬 감정을 담아 활기차게 말해 보세요."},
        ],
      },
      {
        id: "im-c63-02", title: "2강. 일상 구어의 만능 연결 (-아/어 가지고)", minutes: 4,
        blocks: [
          {"t":"text","h":"앞의 상태를 유지하며 이어가거나 구어에서 이유를 나타낼 때","md":"**-아/어 가지고** 는 한국인이 일상 대화(말)에서 가장 흔하게 쓰는 연결 표현 중 하나입니다.\\n\\n1. **수단과 순서 (원래 용법)**: 앞의 행동을 마친 상태로 다음 행동을 함\\n> 과일을 **깎아 가지고** 방으로 들어왔어요.\\n> 도시락을 **싸 가지고** 공원에 소풍을 갔습니다.\\n\\n2. **이유와 원인 (구어 확장)**: '-아서/어서' 대신 대화에서 이유를 설명할 때\\n> 어제 비가 너무 많이 **와 가지고** 약속이 취소됐어.\\n> 길이 **막혀 가지고** 약속 시간에 조금 늦었습니다.\\n\\n💡 **말맛 팁**: 일상 구어에서는 흔히 줄여서 **-아/어 갖고** 로 발음합니다. 공식적인 보고서나 글에는 쓰지 않습니다."},
          {"t":"table","head":["모음 종류","기본형","결합 형태 (-아/어 가지고)","구어 줄임말 (-아/어 갖고)"],"rows":[["양성 모음 (ㅏ, ㅗ)","싸다 / 모으다","싸 가지고 / 모아 가지고","싸 갖고 / 모아 갖고"],["음성 모음 (ㅓ, ㅜ 등)","챙기다 / 만들다","챙겨 가지고 / 만들어 가지고","챙겨 갖고 / 만들어 갖고"],["하다 동사","준비하다 / 연락하다","준비해 가지고 / 연락해 가지고","준비해 갖고 / 연락해 갖고"],["이유 용법 (형용사)","바쁘다 / 춥다","바빠 가지고 / 추워 가지고","바빠 갖고 / 추워 갖고"]]},
          {"t":"chars","wide":true,"items":[{"ch":"주말에 먹으려고 집에서 반찬을 넉넉히 만들어 가지고 왔어요.","tip":"To eat on the weekend, I made generous side dishes at home and brought them."},{"ch":"어제는 날씨가 너무 추워 가지고 하루 종일 집에만 있었어요.","tip":"Yesterday the weather was so cold, so I stayed only at home all day long."},{"ch":"퇴근하면서 필요한 서류를 미리 챙겨 가지고 나왔습니다.","tip":"While leaving work, I packed the necessary documents in advance and stepped out."}]},
          {"t":"cloze","sentence":"친구가 추천해 준 책을 서점에서 [사 가지고] 카페로 갔어요.","answer":"사 가지고","meaning":"I bought the book recommended by a friend at the bookstore and went to the cafe with it.","options":["사 가지고","사 만에","사고서야","사든지"],"keys":["사 가지고","사 갖고","사가지고"],"why":"책을 구매한 뒤 그 상태(책을 손에 쥐고)로 카페로 이동하는 동작의 연결이므로 **-아/어 가지고**가 알맞습니다."},
          {"t":"choice","q":"'-아/어 가지고'의 구어체 줄임말로 올바른 것은?","options":["도시락을 싸 갖고 소풍을 갔어요.","도시락을 싸 거나 소풍을 갔어요.","도시락을 싸 건만 소풍을 갔어요."],"answer":0,"why":"대화에서 '-아/어 가지고'는 흔히 **-아/어 갖고**로 줄여 말합니다."},
          {"t":"type","q":"늦다 — 「차가 막혀서 조금 ___ 죄송합니다.」 구어 이유 표현을 쓰세요.","answer":"늦어 가지고","keys":["늦어 가지고","늦어가지고","늦어 갖고","늦어갖고"],"why":"동사 '늦다' 뒤에 음성모음 어미가 결합하여 **늦어 가지고**(줄여서 **늦어 갖고**)가 됩니다."},
          {"t":"order","q":"「집에서 맛있는 커피를 내려 가지고 텀블러에 담아 왔어요.」 를 순서대로 만들어 보세요.","tokens":["집에서 맛있는","커피를 내려 가지고","텀블러에","담아 왔어요."],"answer":["집에서 맛있는","커피를 내려 가지고","텀블러에","담아 왔어요."]},
          {"t":"note","md":"**격식체(글) vs 비격식체(말)**\\n- **말할 때(구어)**: \"늦어 가지고 못 갔어요\", \"사 가지고 왔어요\" (자연스럽고 생생함)\\n- **글쓸 때(문어)**: \"늦어서 못 갔습니다\", \"구입하여 왔습니다\" ('-가지고'는 글에서는 자제)"},
          {"t":"speak","say":"오늘 아침에 지하철 고장으로 연착되어 가지고 출근 시간이 좀 늦어졌어요.","q":"상황을 친절하게 설명하듯 자연스럽고 구어체다운 편안한 어조로 말해 보세요."},
        ],
      },
      {
        id: "im-c63-03", title: "3강. 동작의 반전과 선행 완료 (-았/었다가 vs -고서)", minutes: 4,
        blocks: [
          {"t":"text","h":"완료 후의 반전과 엄격한 선후 관계","md":"동작의 전후 순서를 나타낼 때 **-았/었다가** 와 **-고서** 는 전혀 다른 드라마를 만듭니다.\\n\\n1. **-았/었다가 (동작의 반전과 전환)**\\n> 앞의 동작을 일단 완료했다가, 그 상태가 **정반대로 뒤집히거나 의외의 다른 행동**으로 바뀜\\n> 불을 **켰다가** 너무 밝아서 다시 **껐어요**.\\n> 외출하러 **나갔다가** 비가 쏟아져서 도로 **들어왔습니다**.\\n\\n2. **-고서 (철저한 선행 완료)**\\n> 단순히 '-고'보다 **앞 행동을 완전히 끝내고 나서** 다음 행동으로 넘어감을 명확히 강조\\n> 손을 깨끗이 **씻고서** 식사를 시작하세요."},
          {"t":"table","head":["문법","결합 방식","핵심 뉘앙스","대표적인 반대 쌍 / 완료 예문"],"rows":[["-았/었다가","V + 았/었다가","완료 후 취소, 반전, 되돌림","열었다가 닫다, 샀다가 환불하다, 탔다가 내리다"],["-고서","V + 고서","앞 동작의 완벽한 종료 후 다음 일","밥을 다 먹고서 약을 먹다, 생각하고서 답하다"],["-고서야","V + 고서야","그 일이 끝나고 나서야 비로소 (강조)","직접 겪어 보고서야 그 심정을 이해했어요."]]},
          {"t":"chars","wide":true,"items":[{"ch":"백화점에서 예쁜 옷을 샀다가 사이즈가 안 맞아서 환불했어요.","tip":"I bought pretty clothes at the department store, then refunded because size didn't fit."},{"ch":"문을 열었다가 바깥바람이 너무 차가워서 도로 닫았습니다.","tip":"I opened the door, then closed it back because outside wind was too cold."},{"ch":"선생님께서는 학생들의 의견을 다 듣고서 차분하게 대답하셨어요.","tip":"The teacher listened to all students' opinions completely, and then answered calmly."}]},
          {"t":"cloze","sentence":"외출하려고 코트를 [입었다가] 생각보다 날씨가 따뜻해서 다시 벗었습니다.","answer":"입었다가","meaning":"I put on my coat to go out, but took it off again because the weather was warmer than thought.","options":["입었다가","입고서","입는 대신에","입든지"],"keys":["입었다가","입었 다가"],"why":"코트를 완전히 입었다가 다시 벗는 반대 행동으로 되돌렸으므로 **-았/었다가**가 알맞습니다."},
          {"t":"choice","q":"앞의 동작을 확실히 끝마친 뒤에 다음 일을 해야 함을 당부하는 문장은?","options":["설명서를 꼼꼼히 다 읽고서 기계를 조작하십시오.","설명서를 꼼꼼히 다 읽었다가 기계를 조작하십시오.","설명서를 꼼꼼히 다 읽어 가지고 기계를 조작하십시오."],"answer":0,"why":"선행 동작의 확실한 완료와 철저한 순서를 지시할 때는 **-고서**가 가장 정확합니다."},
          {"t":"type","q":"타다 — 「버스를 잘못 ___ 지하철역에서 다시 내려 반대편으로 갔어요.」 반전 어미를 쓰세요.","answer":"탔다가","keys":["탔다가","탔 다가"],"why":"버스를 탔다가 잘못 타서 다시 내리는 반대 전환이 일어나므로 **탔다가**가 됩니다."},
          {"t":"order","q":"「식사를 모두 마치고서 따뜻한 후식 차를 천천히 마셨습니다.」 를 순서대로 만들어 보세요.","tokens":["식사를 모두","마치고서","따뜻한 후식 차를","천천히 마셨습니다."],"answer":["식사를 모두","마치고서","따뜻한 후식 차를","천천히 마셨습니다."]},
          {"t":"note","md":"**-았/었다가 vs -다가 구별하기**\\n- **-다가**: 행동을 하던 도중에 중단하고 다른 일로 바뀜 (\"학교에 가다가 친구를 만났어요\")\\n- **-았/었다가**: 행동을 일단 완료한 상태에서 반대 동작으로 전환됨 (\"학교에 갔다가 바로 돌아왔어요\")"},
          {"t":"speak","say":"창문을 활짝 열었다가 미세먼지가 심하다는 뉴스를 보고 얼른 다시 닫았어요.","q":"의외의 소식을 듣고 황급히 행동을 바꾼 상황을 실감 나게 말해 보세요."},
        ],
      },
      {
        id: "im-c63-04", title: "4강. 실전 대화에서 시간과 전후 관계 생생하게 연결하기", minutes: 5,
        blocks: [
          {"t":"text","h":"시간의 흐름을 물 흐르듯 유연하게 표현하기","md":"시간 경과와 전후 순서 표현 4가지를 상황에 맞춰 입체적으로 활용합니다.\\n\\n- **기간 + 만에**: 손꼽아 기다리던 재회나 마침내 이룬 성과\\n- **-아/어 가지고**: 구어에서 찰떡같은 행동 연쇄와 편안한 이유 제시\\n- **-았/었다가**: 일상의 크고 작은 반전과 방향 전환\\n- **-고서**: 실수를 막기 위한 확실한 선후 절차"},
          {"t":"chars","wide":true,"items":[{"ch":"5년 만에 만난 동창들과 밤늦게까지 밀린 이야기를 나눴어요.","tip":"I shared backlogged stories with schoolmates met after 5 years until late night."},{"ch":"주말에 고향 집에 들러 가지고 부모님 농사일을 좀 도와드렸어요.","tip":"I stopped by hometown house on the weekend and helped parents with farm work."},{"ch":"신발을 주문했다가 발볼이 좁아서 한 치수 큰 것으로 교환했어요.","tip":"I ordered shoes, then exchanged for one size bigger because the foot width was narrow."}]},
          {"t":"cloze","sentence":"포기하지 않고 끈기 있게 도전한 결과 [3년 만에] 꿈꾸던 자격증을 땄습니다.","answer":"3년 만에","meaning":"As a result of challenging persistently without giving up, I obtained the dream certificate after 3 years.","options":["3년 만에","3년 동안","3년 대신에","3년이라도"],"keys":["3년 만에","삼 년 만에","삼년 만에"],"why":"3년의 시간이 경과한 시점에 마침내 자격증을 취득한 결실을 뜻하므로 **기간 + 만에**가 맞습니다."},
          {"t":"choice","q":"실수를 방지하기 위해 순서를 강조하여 지시하는 문장으로 가장 어울리는 것은?","options":["계약서 조항을 꼼꼼히 확인하고서 서명해 주시기 바랍니다.","계약서 조항을 꼼꼼히 확인했다가 서명해 주시기 바랍니다.","계약서 조항을 꼼꼼히 확인해 가지고 서명해 주시기 바랍니다."],"answer":0,"why":"공식 문서 작성 시 선행 확인의 철저한 완료 후 서명을 요구하므로 **-고서**가 격식과 명확성에 부합합니다."},
          {"t":"cloze","sentence":"친구가 생일 선물로 예쁜 머그잔을 [사 가지고] 집으로 찾아왔어요.","answer":"사 가지고","meaning":"A friend bought a pretty mug cup as a birthday gift and came visiting to my house with it.","options":["사 가지고","사 만에","사고서야","사더니"],"keys":["사 가지고","사 갖고","사가지고"],"why":"선물을 사서 손에 든 상태로 찾아온 구어적 연결이므로 **-아/어 가지고**가 알맞습니다."},
          {"t":"type","q":"예약하다 — 「비행기 표를 ___ 개인 사정이 생겨서 아쉽게 취소했어요.」 행동의 반전을 쓰세요.","answer":"예약했다가","keys":["예약했다가","예약했 다가"],"why":"예약을 마쳤다가 다시 취소하는 반대 전환이 일어나므로 **예약했다가**가 됩니다."},
          {"t":"order","q":"「이게 몇 년 만인지 정말 반갑고 눈물이 날 지경이에요.」 를 순서대로 만들어 보세요.","tokens":["이게 몇 년 만인지","정말 반갑고","눈물이 날","지경이에요."],"answer":["이게 몇 년 만인지","정말 반갑고","눈물이 날","지경이에요."]},
          {"t":"note","md":"**한국어 스토리텔링의 힘**\\n\"오랜만에 만났다\", \"샀다가 바꿨다\", \"싸 가지고 갔다\"처럼 시간과 순서의 연결 표현을 다양하게 구사하면 듣는 사람이 마치 현장에 있는 것처럼 사건의 흐름을 선명하게 따라오게 됩니다."},
          {"t":"speak","say":"우리가 거의 십 년 만에 만났는데, 이대로 헤어지기는 아쉬우니 차라도 한잔 더 마시고 가요.","q":"오랜만의 만남을 아쉬워하며 붙잡는 따뜻하고 정겨운 마음으로 말해 보세요."},
        ],
      },
    ],
  },

];
