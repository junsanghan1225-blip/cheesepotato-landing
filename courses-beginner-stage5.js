/* ══════════════════════════════════════════════════════════════
   초급 5단계 — 마음을 담기
   ──────────────────────────────────────────────────────────────
   설계는 docs/curriculum-beginner.md §3, §4 (5단계) 에 있다.
   이 단계가 끝나면 학습자는 **하고 싶은 것·해 본 것·그럴 것 같은 것을 말한다.**

   ── 설명은 영어, 예문은 한국어 ──────────────────────────────
   초급 학습자의 인지 부하를 줄이기 위해 설명과 힌트는 영어로,
   연습 문장과 선택지는 자연스러운 한국어로 작성한다.

   ── 코스 구성 ───────────────────────────────────────────────
   - bg-22: 해 봤어요 (-아/어 보다, -(으)ㄴ 적이 있다/없다) (3강)
   - bg-23: 하려고 가요 (-(으)러 가다, -(으)려고, -기로 하다) (3강)
   - bg-24: 그런 것 같아요 (-(으)ㄴ/-는/-(으)ㄹ 것 같다) (3강)
   - bg-25: 이러면 좋겠어요 (-는 게 좋겠다, -았/었으면 좋겠다) (2강)
   - bg-26: -게 되다 · -게 (상황 변화, 부사형) (2강)
   ══════════════════════════════════════════════════════════════ */

export const BEGINNER_STAGE5_COURSES = [

/* ═══════════════════════════════════════════════════════════════
   bg-22 — 해 봤어요
   -아/어 보다(시도·경험)와 -(으)ㄴ 적이 있다/없다(경험 유무).
   새로운 시도와 인생의 경험을 말하는 법을 익힌다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-22',
  emoji: '🎒',
  title: { ko:'해 봤어요', en:'Experiences: -아/어 보다 & -(으)ㄴ 적이 있다' },
  tagline: { ko:'해 본 일과 경험 이야기하기', en:'Try something new and talk about life experiences.' },
  blurb: { ko:'"김치 먹어 봤어요?", "한국에 가 본 적이 있어요"처럼 새로운 시도(-아/어 보다)와 과거의 경험 유무(-(으)ㄴ 적이 있다/없다)를 말하는 법을 배웁니다.',
           en:'Talk about trying new things (-아/어 보다) and life experiences (-(으)ㄴ 적이 있다/없다). Learn how to discuss what you have or have never experienced.' },
  level: 'Beginner',
  needs: 'bg-21',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-22-01',
    title: { ko:'1강. 새로운 시도: -아/어 보다', en:'Lesson 1. Trying Something: -아/어 보다' },
    minutes: 7,
    blocks: [
      { t:'text', md:'In Korean, **-아/어 보다** literally means *“to do and see”* → **“to try doing something”**.\n\n- In invitations or recommendations: *“Give it a try!”* *(먹어 보세요 = Please try eating it)*\n- In the past tense: *“I have tried it”* *(먹어 봤어요 = I tried eating it)*\n\nConjugation follows vowel harmony:\n- Stem in **ㅏ, ㅗ** → **-아 보다** *(가다 → 가 보다)*\n- Other vowels → **-어 보다** *(먹다 → 먹어 보다, 입다 → 입어 보다)*\n- **하다** verbs → **해 보다** *(공부하다 → 공부해 보다)*' },

      { t:'table', head:['Verb','Present / Imperative','Past (Tried it)'], rows:[
        ['먹다 (to eat)','**먹어 보세요** (Try eating it)','**먹어 봤어요** (I tried it)'],
        ['입다 (to wear)','**입어 보세요** (Try it on)','**입어 봤어요** (I tried it on)'],
        ['가다 (to go)','**가 보세요** (Give it a visit)','**가 봤어요** (I’ve been there)'],
        ['하다 (to do)','**해 보세요** (Try doing it)','**해 봤어요** (I tried doing it)'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'한국 음식 먹어 봤어요?', tip:'Have you tried Korean food?' },
        { ch:'이 옷 한번 입어 보세요.', tip:'Please try on these clothes.' },
        { ch:'제주도에 가 봤어요.', tip:'I have been to Jeju Island.' },
      ]},

      { t:'choice', q:'How do you ask "Have you tried eating kimchi?"',
        options:['김치 먹어 봤어요?','김치 먹고 봤어요?','김치 먹으면 봤어요?','김치 먹어서 봤어요?'], answer:0,
        why:'-아/어 보다 means "to try doing": 먹- + -어 봤어요? = 먹어 봤어요?' },

      { t:'cloze', sentence:'이 신발이 아주 예뻐요. 한번 [신어 보세요].', answer:'신어 보세요',
        options:['신어 보세요','신고 보세요','신으면 보세요','신어서 보세요'],
        meaning:'These shoes are very pretty. Please try them on.',
        why:'신다 (to put on shoes) + -어 보세요 = 신어 보세요 (Please try them on).' },

      { t:'order', q:'Put in order: "I want to try going to Korea once."',
        tokens:['한국에','한번','가','보고','싶어요.'], answer:['한국에','한번','가','보고','싶어요.'] },

      { t:'correct', wrong:'불고기를 맛하아 봤어요.',
        answers:['불고기를 먹어 봤어요.','불고기 먹어 봤어요.','불고기를 먹어 봤어요'],
        hint:'Use 먹다 + -어 봤어요: 먹어 봤어요',
        why:'To say you tried eating food, use 먹어 봤어요: 불고기를 먹어 봤어요.' },

      { t:'translate', q:'Have you tried eating Korean food?',
        answers:['한국 음식 먹어 봤어요?','한국 음식을 먹어 봤어요?','한국 음식 먹어 봤어요'],
        hint:'한국 음식(을), 먹다 → 먹어 봤어요?' },

      { t:'speak', say:'한국 음식 먹어 봤어요? 정말 맛있어요.', q:'Read aloud naturally:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-22-02',
    title: { ko:'2강. 인생의 경험: -(으)ㄴ 적이 있다 / 없다', en:'Lesson 2. Life Experience: -(으)ㄴ 적이 있다 / 없다' },
    minutes: 7,
    blocks: [
      { t:'text', md:'While **-아/어 봤어요** talks about casually trying something, **-(으)ㄴ 적이 있다 / 없다** refers to whether an event has ever happened in your life (*“I have had the experience of...”* or *“I have never...”*):\n\n- Stem without batchim → **-ㄴ 적이 있다/없다** *(가다 → 간 적이 있어요)*\n- Stem with batchim → **-은 적이 있다/없다** *(먹다 → 먹은 적이 있어요)*\n\n**The ㄹ Rule**: Stems ending in **ㄹ** drop the ㄹ: **살다 → 산 적이 있어요**, **만들다 → 만든 적이 있어요**!' },

      { t:'table', head:['Verb','Have experience (있다)','Never experienced (없다)'], rows:[
        ['가다 (to go)','**간 적이 있어요**','**간 적이 없어요**'],
        ['먹다 (to eat)','**먹은 적이 있어요**','**먹은 적이 없어요**'],
        ['만나다 (to meet)','**만난 적이 있어요**','**만난 적이 없어요**'],
        ['살다 (ㄹ drop)','**산 적이 있어요**','**산 적이 없어요**'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'저는 서울에 간 적이 있어요.', tip:'I have been to Seoul before.' },
        { ch:'스키를 탄 적이 없어요.', tip:'I have never ridden skis before.' },
        { ch:'한복을 입은 적이 있어요.', tip:'I have worn a Hanbok before.' },
      ]},

      { t:'choice', q:'How do you say "I have never ridden a horse"? (말을 타다 = ride a horse)',
        options:['말을 탄 적이 없어요','말을 탄 적이 있어요','말을 탈 적이 없어요','말을 타고 없어요'], answer:0,
        why:'타다 has no batchim, so attach -ㄴ 적이 없어요: 탄 적이 없어요.' },

      { t:'cloze', sentence:'저는 서울에 [간 적이 있어요].', answer:'간 적이 있어요',
        options:['간 적이 있어요','간 적이 없어요','가고 있어요','가야 돼요'],
        meaning:'I have been to Seoul before.',
        why:'가다 + -ㄴ 적이 있어요 = 간 적이 있어요 (I have had the experience of going).' },

      { t:'order', q:'Put in order: "I have never skied."',
        tokens:['저는','스키를','탄','적이','없어요.'], answer:['저는','스키를','탄','적이','없어요.'] },

      { t:'correct', wrong:'한국에서 살은 적이 있어요.',
        answers:['한국에서 산 적이 있어요.','한국에서 산 적이 있어요'],
        hint:'ㄹ batchim verbs drop the ㄹ: 살다 → 산 적이 있어요',
        why:'Verbs ending in ㄹ drop the ㄹ: 살다 becomes 산 적이 있어요.' },

      { t:'translate', q:'I have never eaten spicy food.',
        answers:['매운 음식을 먹은 적이 없어요.','매운 음식 먹은 적이 없어요.','매운 음식을 먹은 적이 없어요'],
        hint:'매운 음식(을), 먹다 → 먹은 적이 없어요' },

      { t:'speak', say:'저는 서울에 간 적이 있어요.', q:'Read aloud clearly:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-22-03',
    title: { ko:'3강. 실전 대화: -아/어 본 적이 있어요', en:'Lesson 3. Putting It Together: -아/어 본 적이 있어요' },
    minutes: 7,
    blocks: [
      { t:'text', md:'In real daily conversation, native speakers combine both patterns into **-아/어 본 적이 있다 / 없다** (*“Have you ever tried doing...”*):\n\n- **가 본 적이 있어요?** *(Have you ever been there?)*\n- **먹어 본 적이 없어요.** *(I have never tried eating that.)*\n\nIt sounds softer and more natural than either pattern alone!' },

      { t:'table', head:['Question','Positive Answer','Negative Answer'], rows:[
        ['제주도에 **가 본 적이 있어요?**','네, **가 봤어요.**','아니요, **가 본 적이 없어요.**'],
        ['김치 **먹어 본 적이 있어요?**','네, **먹어 봤어요.**','아니요, **한 번도 안 먹어 봤어요.**'],
        ['한복 **입어 본 적이 있어요?**','네, **입어 봤어요.**','아니요, **입어 본 적이 없어요.**'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'제주도에 가 본 적이 있어요?', tip:'Have you ever been to Jeju Island?' },
        { ch:'한 번도 먹어 본 적이 없어요.', tip:'I have never even once tried eating it.' },
        { ch:'한국 영화를 본 적이 있어요.', tip:'I have watched a Korean movie before.' },
      ]},

      { t:'choice', q:'A: "제주도에 가 본 적이 있어요?" How do you answer "No, I have never been there"?',
        options:['아니요, 가 본 적이 없어요.','아니요, 가 본 적이 있어요.','아니요, 가고 있어요.','아니요, 가야 돼요.'], answer:0,
        why:'To express never having experienced it, use 가 본 적이 없어요.' },

      { t:'cloze', sentence:'저는 한국 드라마를 [본 적이 있어요].', answer:'본 적이 있어요',
        options:['본 적이 있어요','본 적이 없어요','보고 있어요','봐야 돼요'],
        meaning:'I have watched Korean dramas before.',
        why:'보다 + -ㄴ 적이 있어요 = 본 적이 있어요.' },

      { t:'correct', wrong:'한 번도 김치를 먹아 본 적이 없어요.',
        answers:['한 번도 김치를 먹어 본 적이 없어요.','한 번도 김치를 먹어 본 적이 없어요'],
        hint:'먹다 takes -어 보다: 먹어 본 적이 없어요',
        why:'먹다 conjugates with -어: 먹어 본 적이 없어요.' },

      { t:'translate', q:'Have you ever been to Jeju Island?',
        answers:['제주도에 가 본 적이 있어요?','제주도에 가 본 적 있어요?','제주도에 가 본 적이 있어요'],
        hint:'제주도에, 가 보다 → 가 본 적이 있어요?' },

      { t:'speak', say:'제주도에 가 본 적이 있어요? 네, 가 봤어요.', q:'Read aloud naturally:' },
    ],
  },

  {
    id: "bg-22-04", title: {"ko":"4강. 한번 해 보세요: 권유와 추천","en":"Lesson 4. Recommending Experiences: -아/어 보세요"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Recommending an Experience: -아/어 보세요","md":"Now that you can talk about your own experiences with **-아/어 봤어요**, how do you recommend that someone else try something?\n\nAttach **-아/어 보세요** (*“Please try doing...”* or *“Why don't you try...”*):\n\n- Bright vowels (ㅏ, ㅗ) → **-아 보세요** *(가다 → 가 보세요)*\n- Dark vowels (others) → **-어 보세요** *(먹다 → 먹어 보세요, 읽다 → 읽어 보세요)*\n- 하다 verbs → **해 보세요** *(공부하다 → 공부해 보세요)*\n\nIt is often paired with **한번** (*once / give it a try*) or **꼭** (*definitely*)!"},
      {"t":"table","head":["Verb","-아/어 봤어요 (Experience)","-아/어 보세요 (Recommendation)"],"rows":[["먹다 (to eat)","먹어 봤어요 (I tried it)","먹어 보세요 (Please try it)"],["가다 (to go)","가 봤어요 (I've been there)","가 보세요 (Please go / visit)"],["입다 (to wear)","입어 봤어요 (I've worn it)","입어 보세요 (Please try it on)"],["듣다 (ㄷ irregular)","들어 봤어요 (I've heard it)","들어 보세요 (Please listen to it)"]]},
      {"t":"chars","wide":true,"items":[{"ch":"이 노래 한번 들어 보세요.","tip":"Please give this song a listen."},{"ch":"한국에 가면 제주도에 꼭 가 보세요.","tip":"If you go to Korea, definitely visit Jeju Island."},{"ch":"이 옷 한번 입어 보세요.","tip":"Please try on these clothes."}]},
      {"t":"choice","q":"Your friend hasn't tried Korean bibimbap yet. How do you warmly say: \"Try eating it once\"?","options":["한번 먹어 보세요.","한번 먹지 마세요.","한번 먹고 싶어요.","한번 먹고 있어요."],"answer":0,"why":"To recommend trying something to someone else, use -아/어 보세요. 먹다 takes -어 보세요 → 먹어 보세요."},
      {"t":"cloze","sentence":"이 책이 정말 재미있어요. 한번 [읽어 보세요].","answer":"읽어 보세요","meaning":"This book is really fun. Please try reading it once.","options":["읽어 보세요","읽지 마세요","읽은 적이 있어요","읽고 싶어요"],"keys":["읽어 보세요","읽지 마세요","읽은 적이 있어요","읽고 싶어요"],"why":"When suggesting someone try an activity, use -아/어 보세요. 읽다 + -어 보세요 = 읽어 보세요."},
      {"t":"type","q":"듣다 (to listen) — Recommend to your friend: 「이 노래 한번 ___ . (Please try listening)」","answer":"들어 보세요","keys":["들어 보세요","들어 봤어요","듣고 싶어요","듣지 마세요"],"why":"듣다 is a ㄷ-irregular verb: ㄷ changes to ㄹ before a vowel, so 듣다 + -어 보세요 becomes 들어 보세요."},
      {"t":"order","q":"Put the words in order: \"Definitely go to Jeju Island.\"","tokens":["제주도에","꼭","가 보세요."],"answer":["제주도에","꼭","가 보세요."]},
      {"t":"choice","q":"Which sentence is asking someone politely to try on shoes at a shoe store?","options":["사이즈가 맞는지 한번 신어 보세요.","사이즈가 맞는지 한번 신은 적이 있어요.","사이즈가 맞는지 한번 신지 마세요.","사이즈가 맞는지 한번 신고 있어요."],"answer":0,"why":"신다 (to put on footwear) becomes 신어 보세요 when recommending a customer or friend try them on."},
      {"t":"speak","say":"한국에 오면 부산에 꼭 가 보세요.","q":"Say aloud with a warm, recommending tone:"},
    ],
  },
  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-23 — 하려고 가요
   -(으)러 가다/오다(이동 목적), -(으)려고(일반 의도), -기로 하다(결심).
   이동 동사에만 붙는 -(으)러와 모든 동사에 붙는 -(으)려고를 구분한다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-23',
  emoji: '🎯',
  title: { ko:'하려고 가요: 목적과 결심', en:'Purpose & Intentions: -(으)러, -(으)려고, -기로 하다' },
  tagline: { ko:'무엇을 하러 가는지, 무엇을 결심했는지 말하기', en:'Express purpose, intentions, and firm decisions.' },
  blurb: { ko:'"밥 먹으러 가요"(목적), "한국어를 배우려고 공부해요"(의도), "매일 운동하기로 했어요"(결심)를 배웁니다. 이동 동사에만 붙는 -(으)러와 모든 동사에 붙는 -(으)려고의 차이를 명확히 구분합니다.',
           en:'Express why you go somewhere (-(으)러 가다), your broader intentions (-(으)려고), and firm decisions (-기로 하다). Master the critical difference between -(으)러 and -(으)려고.' },
  level: 'Beginner',
  needs: 'bg-22',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-23-01',
    title: { ko:'1강. 이동의 목적: -(으)러 가다 / 오다', en:'Lesson 1. Movement with a Purpose: -(으)러 가다 / 오다' },
    minutes: 7,
    blocks: [
      { t:'text', md:'To explain **why you are going or coming somewhere**, attach **-(으)러**:\n- Stem without batchim / ending in ㄹ → **-러 가다/오다** *(보다 → 보러 가요, 놀다 → 놀러 가요)*\n- Stem with batchim → **-으러 가다/오다** *(먹다 → 먹으러 가요)*\n\n**CRITICAL RESTRICTION**: The verb at the end of the sentence **MUST be a movement verb** like **가다** (to go), **오다** (to come), or **다니다** (to commute/attend)!' },

      { t:'table', head:['Purpose','Movement Verb','Full Sentence'], rows:[
        ['점심 먹다 (eat lunch)','가요','점심 **먹으러 가요** (Going to eat lunch)'],
        ['친구 만나다 (meet friend)','왔어요','친구 **만나러 왔어요** (Came to meet a friend)'],
        ['한국어 배우다 (learn Korean)','다녀요','한국어 **배우러 다녀요** (Attending class to learn)'],
        ['놀다 (play / hang out)','가요','친구 집에 **놀러 가요** (Going over to hang out)'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'점심 먹으러 가요.', tip:'I’m heading out to eat lunch.' },
        { ch:'친구 만나러 왔어요.', tip:'I came here to meet a friend.' },
        { ch:'한국어 배우러 학원에 다녀요.', tip:'I attend an academy to learn Korean.' },
      ]},

      { t:'choice', q:'Why is "책을 읽으러 도서관에 갔어요" correct, but "책을 읽으러 도서관에서 앉았어요" wrong?',
        options:['-(으)러 can ONLY be followed by movement verbs like 가다/오다/다니다','-(으)러 can only be used with food','-(으)러 can only be used in the morning','-(으)러 cannot be used with books'], answer:0,
        why:'-(으)러 expresses movement purpose, so the main verb must be a movement verb like 가다/오다/다니다.' },

      { t:'cloze', sentence:'친구를 [만나러] 카페에 가요.', answer:'만나러',
        options:['만나러','만나려고','만나서','만나면'],
        meaning:'I am going to the cafe to meet a friend.',
        why:'Because the destination verb is 가요, 만나러 가요 is the direct, natural pattern.' },

      { t:'order', q:'Put in order: "I went to the restaurant to eat lunch."',
        tokens:['점심을','먹으러','식당에','갔어요.'], answer:['점심을','먹으러','식당에','갔어요.'] },

      { t:'correct', wrong:'주말에 친구와 놀으러 가요.',
        answers:['주말에 친구와 놀러 가요.','주말에 친구와 놀러 가요'],
        hint:'Verbs ending in ㄹ take -러 directly: 놀- + -러 = 놀러',
        why:'놀다 ends in ㄹ, so it attaches -러 directly without 으: 놀러 가요.' },

      { t:'translate', q:'I am going to the restaurant to eat lunch.',
        answers:['점심을 먹으러 식당에 가요.','점심 먹으러 식당에 가요.','점심을 먹으러 식당에 가요'],
        hint:'점심(을), 먹다 → 먹으러, 식당에 가요' },

      { t:'speak', say:'점심 먹으러 식당에 가요.', q:'Read aloud:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-23-02',
    title: { ko:'2강. 넓은 의도: -(으)려고 & -(으)려고 하다', en:'Lesson 2. Broader Intention: -(으)려고 & -(으)려고 하다' },
    minutes: 7,
    blocks: [
      { t:'text', md:'What if your main action is **NOT** a movement verb? *(“I bought a gift to give to my friend”)*\n\nFor general intentions with **ANY action verb**, use **-(으)려고**:\n- *“친구에게 주**려고** 선물을 샀어요.”* (Bought a gift in order to give it — 샀어요 is not a movement verb!)\n\nAnd when combined with **하다**, **-(으)려고 하다** means **“I plan to / I intend to...”**:\n- *“새 컴퓨터를 사**려고 해요**.”* (I plan to buy a new computer.)' },

      { t:'table', head:['Verb','Intentional Action (-(으)려고)','Planning to (-(으)려고 하다)'], rows:[
        ['사다 (to buy)','선물 **사려고** 돈을 모았어요','새 가방을 **사려고 해요**'],
        ['배우다 (to learn)','한국어 **배우려고** 공부해요','태권도를 **배우려고 해요**'],
        ['쉬다 (to rest)','집에서 **쉬려고** 일찍 퇴근했어요','주말에 **쉬려고 해요**'],
        ['만들다 (ㄹ stem)','케이크 **만들려고** 장을 봤어요','김치를 **만들려고 해요**'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'친구에게 주려고 선물을 샀어요.', tip:'I bought a present to give to my friend.' },
        { ch:'한국어를 배우려고 한국에 왔어요.', tip:'I came to Korea to learn Korean.' },
        { ch:'새 컴퓨터를 사려고 해요.', tip:'I am planning to buy a new computer.' },
      ]},

      { t:'choice', q:'Which sentence correctly says "I bought a present to give to my friend"?',
        options:['친구에게 주려고 선물을 샀어요.','친구에게 주러 선물을 샀어요.','친구에게 주면 선물을 샀어요.','친구에게 주어서 선물을 샀어요.'], answer:0,
        why:'Because 샀어요 is not a movement verb (like 가다/오다), you cannot use -러. You must use -(으)려고!' },

      { t:'cloze', sentence:'이번 주말에는 집에서 [쉬려고 해요].', answer:'쉬려고 해요',
        options:['쉬려고 해요','쉬러 가요','쉬어야 돼요','쉬고 있어요'],
        meaning:'This weekend, I plan to rest at home.',
        why:'쉬려고 해요 expresses an intention or plan to rest.' },

      { t:'order', q:'Put in order: "I bought a gift to give to my friend."',
        tokens:['친구에게','주려고','선물을','샀어요.'], answer:['친구에게','주려고','선물을','샀어요.'] },

      { t:'correct', wrong:'한국 친구를 사귀러 한국어를 열심히 공부해요.',
        answers:['한국 친구를 사귀려고 한국어를 열심히 공부해요.','한국 친구를 사귀려고 한국어를 열심히 공부해요'],
        hint:'공부하다 is not a movement verb! Use -(으)려고: 사귀려고',
        why:'공부하다 is not a movement verb, so you cannot use -러. Use 사귀려고.' },

      { t:'translate', q:'I plan to buy a new computer.',
        answers:['새 컴퓨터를 사려고 해요.','새 컴퓨터 사려고 해요.','새 컴퓨터를 사려고 해요'],
        hint:'새 컴퓨터(를), 사다 → 사려고 해요' },

      { t:'speak', say:'친구에게 주려고 선물을 샀어요.', q:'Read aloud naturally:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-23-03',
    title: { ko:'3강. 굳은 결심: -기로 하다', en:'Lesson 3. Firm Decision: -기로 하다' },
    minutes: 7,
    blocks: [
      { t:'text', md:'When you make up your mind or agree with someone on a plan, use **-기로 하다** (*“decided to do”*).\n\nSince decisions happen in the past, it is almost always said as **-기로 했어요**:\n\n- *“내일부터 매일 운동하**기로 했어요**.”* (I decided to work out every day starting tomorrow.)\n- *“주말에 친구를 만나**기로 했어요**.”* (I promised/decided to meet a friend on the weekend.)\n\nAttach **-기로 하다** directly to the verb stem without any batchim changes!' },

      { t:'table', head:['Verb','Decision (-기로 했어요)','Meaning'], rows:[
        ['만나다 (to meet)','**만나기로 했어요**','Decided / promised to meet'],
        ['가다 (to go)','**가기로 했어요**','Decided to go'],
        ['운동하다 (to exercise)','**운동하기로 했어요**','Decided to work out'],
        ['담배를 끊다 (to quit)','**끊기로 했어요**','Decided to quit smoking'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'내일부터 운동하기로 했어요.', tip:'I decided to exercise starting tomorrow.' },
        { ch:'주말에 친구를 만나기로 했어요.', tip:'I decided to meet my friend this weekend.' },
        { ch:'한국어를 열심히 공부하기로 했어요.', tip:'I decided to study Korean diligently.' },
      ]},

      { t:'choice', q:'How do you say "We decided to meet at 2 PM tomorrow"? (내일 오후 2시에 만나다)',
        options:['내일 오후 2시에 만나기로 했어요','내일 오후 2시에 만나려고 해요','내일 오후 2시에 만나러 가요','내일 오후 2시에 만나면 돼요'], answer:0,
        why:'-기로 했어요 expresses an agreed decision or resolution: 만나기로 했어요.' },

      { t:'cloze', sentence:'건강을 위해서 매일 [운동하기로 했어요].', answer:'운동하기로 했어요',
        options:['운동하기로 했어요','운동하려고 해요','운동하러 가요','운동해야 돼요'],
        meaning:'For my health, I decided to exercise every day.',
        why:'운동하기로 했어요 represents a firm personal decision.' },

      { t:'order', q:'Put in order: "We decided to watch a movie on the weekend."',
        tokens:['주말에','친구와','영화를','보기로','했어요.'], answer:['주말에','친구와','영화를','보기로','했어요.'] },

      { t:'correct', wrong:'내일부터 일찍 일어나고로 했어요.',
        answers:['내일부터 일찍 일어나기로 했어요.','내일부터 일찍 일어나기로 했어요'],
        hint:'Attach -기로 했어요: 일어나- + -기로 했어요 = 일어나기로 했어요',
        why:'Attach -기로 directly to the stem: 일어나기로 했어요.' },

      { t:'translate', q:'We decided to meet at 2 o\'clock tomorrow.',
        answers:['내일 2시에 만나기로 했어요.','내일 두 시에 만나기로 했어요.','내일 2시에 만나기로 했어요'],
        hint:'내일 2시에, 만나다 → 만나기로 했어요' },

      { t:'speak', say:'내일부터 매일 운동하기로 했어요.', q:'Read aloud with determination:' },
    ],
  },

  {
    id: "bg-23-04", title: {"ko":"4강. 세 가지 표현 가르기: -(으)러 vs -(으)려고 vs -기로 하다","en":"Lesson 4. Comparing Purpose: -(으)러 vs -(으)려고 vs -기로 하다"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Purpose vs Intention vs Decision","md":"In the previous lessons, you learned three expressions expressing purpose and future plans. How do you choose between them?\n\n1. **-(으)러 가다 / 오다** — **Only with movement verbs** (*to go/come in order to...*).\n   - 도서관에 공부하**러 가요**. (O)\n   - 공부하**러** 책을 샀어요. (X — 사다 is not movement!)\n\n2. **-(으)려고** — **General intention with any action** (*in order to, intending to...*).\n   - 공부하**려고** 책을 샀어요. (O)\n\n3. **-기로 했어요** — **A firm decision or promise** (*decided to...*).\n   - 주말에 친구를 만나**기로 했어요**."},
      {"t":"table","head":["Pattern","Meaning","Crucial Rule"],"rows":[["-(으)러 가다/오다","Going/coming to do something","**Only** pairs with movement verbs (가다, 오다, 다니다)"],["-(으)려고 하다","Intending / planning to do","Pairs with **any** action verb (책을 사다, 돈을 모으다)"],["-기로 하다","Decided / promised to do","Focuses on the **resolution or appointment**"]]},
      {"t":"chars","wide":true,"items":[{"ch":"친구를 만나러 카페에 가요.","tip":"I am going to a café to meet a friend. (Movement)"},{"ch":"한국에 가려고 돈을 모으고 있어요.","tip":"I am saving money intending to go to Korea. (General action)"},{"ch":"내일부터 아침 일찍 운동하기로 했어요.","tip":"I decided to exercise early in the morning starting tomorrow. (Decision)"}]},
      {"t":"choice","q":"Why is 「책을 읽으러 도서관에서 책을 빌렸어요」 incorrect in natural Korean?","options":["-(으)러 can only be followed by movement verbs like 가다 or 오다.","-(으)러 can only be used with food and eating.","-(으)러 cannot be attached to verbs ending in consonant.","-(으)러 is only used in formal written Korean."],"answer":0,"why":"-(으)러 is strictly used with movement verbs like 가다, 오다, and 다니다. For other actions, use -(으)려고: 「책을 읽으려고 빌렸어요」."},
      {"t":"cloze","sentence":"친구에게 선물[하려고] 예쁜 모자를 샀어요.","answer":"하려고","meaning":"I bought a pretty hat intending to gift it to a friend.","options":["하려고","할수록","하면서","하자마자"],"keys":["하려고","할수록","하면서","하자마자"],"why":"The main verb is 샀어요 (bought), not a movement verb, so use -(으)려고 to express purpose."},
      {"t":"type","q":"가다 (to go) — Complete the decision: 「내년 봄에 한국에 ___ . (decided to go)」","answer":"가기로 했어요","keys":["가기로 했어요","가려고 해요","가러 가요","가면 돼요"],"why":"To state a firm decision or resolution, attach -기로 했어요 to the verb stem 가-."},
      {"t":"choice","q":"Choose the natural sentence for going to a restaurant to eat lunch:","options":["점심을 먹으러 식당에 가요.","점심을 먹고 식당에 가요.","점심을 먹으러 밥을 지어요.","점심을 먹으러 요리를 해요."],"answer":0,"why":"먹으러 가요 correctly combines the purpose 먹다 with the movement verb 가다."},
      {"t":"order","q":"Put the words in order: \"I am studying hard to pass the exam.\"","tokens":["시험에","붙으려고","열심히","공부해요."],"answer":["시험에","붙으려고","열심히","공부해요."]},
      {"t":"speak","say":"한국 친구와 이야기하려고 한국어를 배워요.","q":"Read aloud clearly:"},
    ],
  },
  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-24 — 그런 것 같아요
   추측과 완곡한 생각 표현. 시제에 따라 세 가지로 갈리는 형태를
   표로 직관적으로 익히고, 6단계 관형형 클라이맥스의 여운을 남긴다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-24',
  emoji: '💭',
  title: { ko:'그런 것 같아요', en:'Conjectures: It Seems Like... (-것 같다)' },
  tagline: { ko:'부드러운 추측과 생각 말하기', en:'Soft conjectures, polite impressions, and guesses.' },
  blurb: { ko:'"비가 오는 것 같아요", "좋은 것 같아요", "내일 비가 올 것 같아요"처럼 내 생각이나 추측을 부드럽게 말하는 법을 배웁니다. 시제에 따라 달라지는 세 가지 형태를 익힙니다.',
           en:'Master Korean’s favorite softening expression: “It seems like... / I think...”. Express gentle thoughts and observations across past, present, and future.' },
  level: 'Beginner',
  needs: 'bg-23',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-24-01',
    title: { ko:'1강. 현재의 관찰: 형용사와 동사의 모양', en:'Lesson 1. Present Impressions: Adjectives vs Verbs' },
    minutes: 7,
    blocks: [
      { t:'text', md:'In Korean, stating facts too directly (*“This is bad”*, *“It is hot”*) can sound blunt. Native speakers constantly use **-것 같아요** (*“It seems like... / I feel that...”*) to soften their speech.\n\nIn the present tense, adjectives and verbs take slightly different shapes:\n\n1. **Adjectives** take **-(으)ㄴ 것 같아요**:\n- No batchim → **-ㄴ 것 같아요** *(바쁘다 → 바쁜 것 같아요)*\n- Has batchim → **-은 것 같아요** *(좋다 → 좋은 것 같아요)*\n- **ㅂ irregular** → **-운 것 같아요** *(덥다 → 더운 것 같아요, 춥다 → 추운 것 같아요)*\n\n2. **Action Verbs** take **-는 것 같아요**:\n- *“창밖을 보니까 비가 오**는 것 같아요**.”* (Looking outside, it seems to be raining.)' },

      { t:'table', head:['Type','Word','Present Impression (-것 같아요)'], rows:[
        ['Adjective','좋다 (good)','**좋은 것 같아요** (It seems good)'],
        ['Adjective','바쁘다 (busy)','**바쁜 것 같아요** (They seem busy)'],
        ['Adjective (ㅂ irreg)','덥다 (hot)','**더운 것 같아요** (It feels hot)'],
        ['Action Verb','비가 오다 (rain)','**비가 오는 것 같아요** (Seems to be raining)'],
        ['Action Verb','먹다 (eat)','**잘 먹는 것 같아요** (Seems to eat well)'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'오늘 날씨가 조금 더운 것 같아요.', tip:'I think the weather is a bit hot today.' },
        { ch:'창밖을 보니까 비가 오는 것 같아요.', tip:'Looking outside, it seems like it’s raining.' },
        { ch:'이 음식이 정말 맛있는 것 같아요.', tip:'I think this food is really delicious.' },
      ]},

      { t:'choice', q:'How do you say "It seems hot today" with 덥다 (ㅂ irregular)?',
        options:['더운 것 같아요','덥는 것 같아요','덥은 것 같아요','더울 것 같아요'], answer:0,
        why:'덥다 is a ㅂ-irregular adjective: 덥- changes into 더운 것 같아요.' },

      { t:'cloze', sentence:'창밖을 보니까 지금 비가 [오는 것 같아요].', answer:'오는 것 같아요',
        options:['오는 것 같아요','온 것 같아요','올 것 같아요','오면 것 같아요'],
        meaning:'Looking out the window, it seems to be raining right now.',
        why:'Action verbs in the present take -는 것 같아요: 오- + -는 것 같아요 = 오는 것 같아요.' },

      { t:'order', q:'Put in order: "I think the weather is a bit hot today."',
        tokens:['오늘','날씨가','조금','더운','것','같아요.'], answer:['오늘','날씨가','조금','더운','것','같아요.'] },

      { t:'correct', wrong:'지금 친구가 집에 오은 것 같아요.',
        answers:['지금 친구가 집에 오는 것 같아요.','지금 친구가 집에 오는 것 같아요'],
        hint:'Action verbs take -는 것 같아요: 오- + -는 것 같아요 = 오는 것 같아요',
        why:'Verbs take -는 것 같아요: 지금 친구가 집에 오는 것 같아요.' },

      { t:'translate', q:'It seems to be raining right now.',
        answers:['지금 비가 오는 것 같아요.','지금 비 오는 것 같아요.','지금 비가 오는 것 같아요'],
        hint:'지금, 비가 오다 → 오는 것 같아요' },

      { t:'speak', say:'창밖을 보니까 비가 오는 것 같아요.', q:'Read aloud naturally:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-24-02',
    title: { ko:'2강. 미래와 추측: -(으)ㄹ 것 같다', en:'Lesson 2. Future & General Guesses: -(으)ㄹ 것 같다' },
    minutes: 7,
    blocks: [
      { t:'text', md:'When predicting what **will happen** or guessing an outcome, use **-(으)ㄹ 것 같아요** (*“I think it will... / It seems like it will...”*):\n- Stem without batchim → **-ㄹ 것 같아요** *(비가 오다 → 비가 올 것 같아요)*\n- Stem with batchim → **-을 것 같아요** *(맛있다 → 맛있을 것 같아요)*\n\n**Notice the contrast**:\n- **비가 오는 것 같아요**: Looking out the window right now, raindrops are falling. *(Present observation)*\n- **비가 올 것 같아요**: Looking at dark clouds or the forecast, you predict rain will come. *(Future guess)*' },

      { t:'table', head:['Word','Future Guess (-(으)ㄹ 것 같아요)','English Meaning'], rows:[
        ['오다 (to come / rain)','**올 것 같아요**','I think it will rain'],
        ['맛있다 (delicious)','**맛있을 것 같아요**','I think it will be delicious (looking at menu)'],
        ['바쁘다 (busy)','**바쁠 것 같아요**','I think I will be busy tomorrow'],
        ['어렵다 (ㅂ irreg)','**어려울 것 같아요**','I guess the test will be difficult'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'내일 비가 올 것 같아요.', tip:'I think it will rain tomorrow.' },
        { ch:'이 케이크 정말 맛있을 것 같아요.', tip:'This cake looks like it will be so delicious!' },
        { ch:'내일 시험이 어려울 것 같아요.', tip:'I think tomorrow’s exam will be difficult.' },
      ]},

      { t:'choice', q:'Looking at a menu photo, how do you guess "I think this will be delicious"?',
        options:['맛있을 것 같아요','맛있는 것 같아요','맛있은 것 같아요','맛있었 것 같아요'], answer:0,
        why:'Predicting before tasting takes -(으)ㄹ 것 같아요: 맛있을 것 같아요.' },

      { t:'cloze', sentence:'하늘이 흐려요. 곧 비가 [올 것 같아요].', answer:'올 것 같아요',
        options:['올 것 같아요','오는 것 같아요','온 것 같아요','오고 같아요'],
        meaning:'The sky is overcast. It seems like it will rain soon.',
        why:'Predicting an upcoming event takes -ㄹ 것 같아요: 올 것 같아요.' },

      { t:'order', q:'Put in order: "I think the weather will be really good tomorrow."',
        tokens:['내일','날씨가','정말','좋을','것','같아요.'], answer:['내일','날씨가','정말','좋을','것','같아요.'] },

      { t:'correct', wrong:'내일 시험이 어렵는 것 같아요.',
        answers:['내일 시험이 어려울 것 같아요.','내일 시험이 어려울 것 같아요'],
        hint:'Predicting tomorrow takes -(으)ㄹ 것 같다 with ㅂ irregular: 어려울 것 같아요',
        why:'Future guess for ㅂ-irregular 어렵다 is 어려울 것 같아요.' },

      { t:'translate', q:'I think it will rain tomorrow.',
        answers:['내일 비가 올 것 같아요.','내일 비 올 것 같아요.','내일 비가 올 것 같아요'],
        hint:'내일, 비가 오다 → 올 것 같아요' },

      { t:'speak', say:'하늘이 흐려서 곧 비가 올 것 같아요.', q:'Read aloud:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-24-03',
    title: { ko:'3강. 시간의 세 갈래: 과거·현재·미래', en:'Lesson 3. The Three Tenses of Observation' },
    minutes: 7,
    blocks: [
      { t:'text', md:'Look at how the ending before **것 같아요** shifts depending on the time of the event:\n\n- **Past observation**: You see puddles on the ground → *“비가 **온 것 같아요**.”* (It seems it rained.)\n- **Present observation**: You see raindrops falling right now → *“비가 **오는 것 같아요**.”* (It seems to be raining.)\n- **Future prediction**: You check tomorrow’s weather app → *“비가 **올 것 같아요**.”* (I think it will rain.)' },

      { t:'table', head:['Tense','Connector Form','Example Sentence','Situation'], rows:[
        ['Past (과거)','**-(으)ㄴ 것 같다**','비가 **온 것 같아요**','Looking at wet puddles on the ground'],
        ['Present (현재)','**-는 것 같다**','비가 **오는 것 같아요**','Watching rain falling right now'],
        ['Future (미래/추측)','**-(으)ㄹ 것 같다**','비가 **올 것 같아요**','Checking tomorrow’s weather forecast'],
      ]},

      { t:'note', md:'**Why do these three have different shapes?**\n\nNotice that the small piece attached to the verb changes depending on time:\n\n- 과거: **-(으)ㄴ**\n- 현재: **-는**\n- 미래: **-(으)ㄹ**\n\nWhy do these exact three shapes exist across Korean? **You will discover the astonishing secret behind this in the very next stage!** For now, simply remember how each tense sounds.' },

      { t:'chars', wide:true, items:[
        { ch:'어제 비가 온 것 같아요.', tip:'It seems it rained yesterday. (Past observation)' },
        { ch:'지금 비가 오는 것 같아요.', tip:'It seems to be raining right now. (Present observation)' },
        { ch:'내일 비가 올 것 같아요.', tip:'I think it will rain tomorrow. (Future prediction)' },
      ]},

      { t:'choice', q:'You see wet ground outside in the morning. Which sentence matches: "It seems it rained (earlier)"?',
        options:['비가 온 것 같아요.','비가 오는 것 같아요.','비가 올 것 같아요.','비가 오면 것 같아요.'], answer:0,
        why:'For a past action that left evidence, use -(으)ㄴ 것 같아요: 비가 온 것 같아요.' },

      { t:'choice', q:'You see dark clouds gathering in the afternoon. Which sentence matches: "I think it will rain (soon)"?',
        options:['비가 올 것 같아요.','비가 오는 것 같아요.','비가 온 것 같아요.','비가 오고 같아요.'], answer:0,
        why:'For an anticipated future event, use -(으)ㄹ 것 같아요: 비가 올 것 같아요.' },

      { t:'cloze', sentence:'바닥이 다 젖었어요. 아까 비가 [온 것 같아요].', answer:'온 것 같아요',
        options:['온 것 같아요','오는 것 같아요','올 것 같아요','왔는 것 같아요'],
        meaning:'The ground is all wet. It seems it rained earlier.',
        why:'Evidence of a completed past action takes -(으)ㄴ 것 같아요: 온 것 같아요.' },

      { t:'correct', wrong:'아까 친구가 벌써 집에 갈 것 같아요.',
        answers:['아까 친구가 벌써 집에 간 것 같아요.','아까 친구가 벌써 집에 간 것 같아요'],
        hint:'For an action that already happened earlier (아까), use 간 것 같아요: 가- + -ㄴ 것 같아요',
        why:'Past observation uses -(으)ㄴ 것 같아요: 아까 친구가 벌써 집에 간 것 같아요.' },

      { t:'translate', q:'It seems to have rained earlier.',
        answers:['아까 비가 온 것 같아요.','아까 비 온 것 같아요.','아까 비가 온 것 같아요'],
        hint:'아까, 비가 오다 → 온 것 같아요' },

      { t:'speak', say:'바닥이 젖은 걸 보니까 비가 온 것 같아요.', q:'Read aloud naturally:' },
    ],
  },

  {
    id: "bg-24-04", title: {"ko":"4강. 실전 대화: 부드럽게 의견 말하기","en":"Lesson 4. Softening Your Opinions in Conversation"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Softening Opinions with 것 같아요","md":"In Korean culture, directly stating an opinion or fact (like **너무 매워요** or **재미없어요**) can sometimes sound blunt or harsh.\n\nNative speakers often use **-(으)ㄴ/는 것 같다** to soften their opinions, making their speech sound polite, modest, and considerate:\n\n- **조금 비싼 것 같아요.** *(I think it's a bit expensive — softer than 비싸요)*\n- **이 옷이 더 잘 어울리는 것 같아요.** *(I think this outfit suits you better)*\n- **민수 씨가 지금 바쁜 것 같아요.** *(Minsu seems busy right now)*\n\nPair it with **조금** (*a little*) or **제 생각에는** (*in my opinion*)!"},
      {"t":"table","head":["Direct (Can sound blunt)","Softened with 것 같아요 (Polite)","Nuance"],"rows":[["너무 매워요.","너무 **매운 것 같아요.**","I think it is a bit too spicy."],["이게 더 좋아요.","이게 더 **좋은 것 같아요.**","I feel this one might be better."],["도서관에 사람이 많아요.","사람이 **많은 것 같아요.**","It looks like there are a lot of people."],["민수 씨가 안 와요.","민수 씨가 **안 올 것 같아요.**","I don't think Minsu will make it."]]},
      {"t":"chars","wide":true,"items":[{"ch":"제 생각에는 이 색이 더 예쁜 것 같아요.","tip":"In my opinion, I think this color is prettier."},{"ch":"사이즈가 조금 작은 것 같아요.","tip":"I think the size is a little bit small."},{"ch":"영화가 곧 시작할 것 같아요.","tip":"It seems the movie will start soon."}]},
      {"t":"choice","q":"Your coworker asks how the new office chair is. How do you politely soften the negative critique: \"I think it is a bit uncomfortable\"? (불편하다 = uncomfortable)","options":["조금 불편한 것 같아요.","조금 불편하지 마세요.","조금 불편하면 안 돼요.","조금 불편하러 가요."],"answer":0,"why":"불편하다 is an adjective ending in a vowel, so attach -ㄴ 것 같아요 → 불편한 것 같아요 to politely soften the opinion."},
      {"t":"cloze","sentence":"제 생각에는 이 식당 음식이 정말 [맛있는 것 같아요].","answer":"맛있는 것 같아요","meaning":"In my opinion, I think the food at this restaurant is really delicious.","options":["맛있는 것 같아요","맛있지 마세요","맛있으러 가요","맛있으면 안 돼요"],"keys":["맛있는 것 같아요","맛있지 마세요","맛있으러 가요","맛있으면 안 돼요"],"why":"맛있다 takes -는 것 같아요 because of 있다: 맛있는 것 같아요."},
      {"t":"type","q":"좋다 (to be good) — Soften your opinion: 「이 방법이 더 ___ . (I think it is better)」","answer":"좋은 것 같아요","keys":["좋은 것 같아요","좋을 것 같아요","좋는 것 같아요","좋기로 했어요"],"why":"좋다 is an adjective ending in a consonant (받침 ㅎ), so attach -은 것 같아요: 좋은 것 같아요."},
      {"t":"choice","q":"Which sentence sounds like a considerate and polite impression when trying on shoes?","options":["신발이 발에 딱 맞는 것 같아요.","신발이 발에 딱 맞으러 가요.","신발이 발에 딱 맞지 마세요.","신발이 발에 딱 맞으면 안 돼요."],"answer":0,"why":"맞다 (to fit) takes -는 것 같아요: 딱 맞는 것 같아요 (It seems to fit just right)."},
      {"t":"order","q":"Put the words in order: \"In my opinion, this dress is prettier.\"","tokens":["제 생각에는","이 옷이","더 예쁜","것 같아요."],"answer":["제 생각에는","이 옷이","더 예쁜","것 같아요."]},
      {"t":"speak","say":"제 생각에는 내일 날씨가 아주 좋을 것 같아요.","q":"Say aloud gently and politely:"},
    ],
  },
  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-25 — 이러면 좋겠어요
   -는 게 좋겠다(부드러운 조언·권유)와 -았/었으면 좋겠다(바람·소원).
   상대에게 부담을 주지 않고 권유하는 법과 내 소원을 말하는 법.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-25',
  emoji: '🌈',
  title: { ko:'이러면 좋겠어요', en:'Suggestions & Wishes: -는 게 좋겠다 & -았/었으면 좋겠다' },
  tagline: { ko:'조언하기와 간절한 바람 말하기', en:'Give gentle advice and express your deepest wishes.' },
  blurb: { ko:'"따뜻하게 입는 게 좋겠어요"(부드러운 조언)와 "날씨가 좋았으면 좋겠어요"(바람과 소원)를 배웁니다. 상대에게 부담을 주지 않고 권유하는 법과 내 바람을 표현하는 법을 익힙니다.',
           en:'Give gentle advice without being pushy (-는 게 좋겠다) and express personal hopes or wishes (-았/었으면 좋겠다). Two warm, indispensable conversational tools.' },
  level: 'Beginner',
  needs: 'bg-24',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-25-01',
    title: { ko:'1강. 부드러운 권유: -는 게 좋겠다 / 좋아요', en:'Lesson 1. Gentle Advice: -는 게 좋겠다 / 좋아요' },
    minutes: 7,
    blocks: [
      { t:'text', md:'When giving advice, a direct imperative (*“Go to the doctor!”* = 병원에 가세요!) can sometimes sound demanding.\n\nTo offer caring, gentle advice (*“It would be best to... / You had better...”*), native speakers use **-는 게 좋겠다** (or **-는 게 좋아요**):\n\n- *“감기에 걸렸을 때는 푹 쉬**는 게 좋아요**.”* (When you catch a cold, it’s best to get plenty of rest.)\n\nAttach **-는 게 좋겠다 / 좋아요** directly to any action verb stem!' },

      { t:'table', head:['Direct Directive','Gentle Advice (-는 게 좋아요)','Why it feels softer'], rows:[
        ['병원에 가세요!','병원에 **가는 게 좋겠어요**','Recommends instead of commanding'],
        ['따뜻하게 입으세요!','따뜻하게 **입는 게 좋아요**','Friendly, caring suggestion'],
        ['집에서 쉬세요!','집에서 **쉬는 게 좋겠어요**','Gentle recommendation'],
        ['우산 챙기세요!','우산을 **가져가는 게 좋아요**','Helpful reminder'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'오늘은 집에서 쉬는 게 좋겠어요.', tip:'It would be best to rest at home today.' },
        { ch:'따뜻한 물을 마시는 게 좋아요.', tip:'It’s good to drink warm water.' },
        { ch:'우산을 가져가는 게 좋겠어요.', tip:'It would be good to bring an umbrella.' },
      ]},

      { t:'choice', q:'When a friend has a bad cold, which sentence sounds the warmest and most caring?',
        options:['오늘은 푹 쉬는 게 좋겠어요.','오늘은 푹 쉬어야 돼요.','오늘은 푹 쉬지 마세요.','오늘은 푹 쉬면 돼요.'], answer:0,
        why:'-는 게 좋겠어요 offers warm, non-demanding advice: 오늘은 푹 쉬는 게 좋겠어요.' },

      { t:'cloze', sentence:'날씨가 추우니까 따뜻하게 [입는 게 좋아요].', answer:'입는 게 좋아요',
        options:['입는 게 좋아요','입은 게 좋아요','입을 게 좋아요','입고 게 좋아요'],
        meaning:'Because it is cold, it is good to dress warmly.',
        why:'Action verbs take -는 게 좋아요: 입- + -는 게 좋아요 = 입는 게 좋아요.' },

      { t:'order', q:'Put in order: "It would be best to get plenty of rest at home today."',
        tokens:['오늘은','집에서','푹','쉬는','게','좋겠어요.'], answer:['오늘은','집에서','푹','쉬는','게','좋겠어요.'] },

      { t:'correct', wrong:'감기에 걸렸으니까 병원에 가은 게 좋겠어요.',
        answers:['감기에 걸렸으니까 병원에 가는 게 좋겠어요.','감기에 걸렸으니까 병원에 가는 게 좋겠어요'],
        hint:'Action verbs take -는 게: 가- + -는 게 = 가는 게',
        why:'Action verbs attach -는 게: 병원에 가는 게 좋겠어요.' },

      { t:'translate', q:'It would be good to rest at home today.',
        answers:['오늘은 집에서 쉬는 게 좋겠어요.','오늘 집에서 쉬는 게 좋겠어요.','오늘은 집에서 쉬는 게 좋아요.'],
        hint:'오늘은, 집에서 쉬다 → 쉬는 게 좋겠어요' },

      { t:'speak', say:'감기 걸렸을 때는 따뜻한 물을 마시는 게 좋아요.', q:'Read aloud with a caring tone:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-25-02',
    title: { ko:'2강. 간절한 바람: -았/었으면 좋겠다', en:'Lesson 2. Wishes & Hopes: -았/었으면 좋겠다' },
    minutes: 7,
    blocks: [
      { t:'text', md:'To express a personal hope or wish (*“I wish that... / I hope that...”*), attach **-았/었으면 좋겠다**:\n\n- *“주말에 날씨가 좋**았으면 좋겠어요**.”* (I hope the weather is nice this weekend.)\n- *“빨리 나**았으면 좋겠어요**.”* (I hope you get well soon!)\n\nIt combines the past tense marker **-았/었-** with the conditional **-으면** (*“If it happened, it would be good”*).' },

      { t:'table', head:['Base Word','Wish Form (-았/었으면 좋겠어요)','Meaning'], rows:[
        ['좋다 (good)','**좋았으면 좋겠어요**','I hope it is good'],
        ['낫다 (recover — ㅅ drop)','**나았으면 좋겠어요**','I hope you get well soon'],
        ['돈이 많다 (have money)','**많았으면 좋겠어요**','I wish I had a lot of money'],
        ['한국에 가다 (go to Korea)','**갔으면 좋겠어요**','I hope to go to Korea'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'주말에 날씨가 좋았으면 좋겠어요.', tip:'I hope the weather is nice on the weekend.' },
        { ch:'빨리 나았으면 좋겠어요.', tip:'I hope you recover quickly!' },
        { ch:'시험에 합격했으면 좋겠어요.', tip:'I hope I pass the exam.' },
      ]},

      { t:'choice', q:'How do you warmly tell a sick friend "I hope you recover soon!"? (빨리 낫다 = recover quickly)',
        options:['빨리 나았으면 좋겠어요.','빨리 나으면 좋겠어요.','빨리 낫는 게 좋겠어요.','빨리 나을 것 같아요.'], answer:0,
        why:'낫다 is a ㅅ-irregular verb (ㅅ drops before vowel): 낫- + -았으면 = 나았으면 좋겠어요.' },

      { t:'cloze', sentence:'이번 주말에는 날씨가 [좋았으면 좋겠어요].', answer:'좋았으면 좋겠어요',
        options:['좋았으면 좋겠어요','좋으면 좋겠어요','좋은 게 좋겠어요','좋을 것 같아요'],
        meaning:'I hope the weather is nice this weekend.',
        why:'좋다 + -았으면 좋겠어요 = 좋았으면 좋겠어요 (I hope it is nice).' },

      { t:'order', q:'Put in order: "I hope the weather is good this weekend."',
        tokens:['이번','주말에','날씨가','좋았으면','좋겠어요.'], answer:['이번','주말에','날씨가','좋았으면','좋겠어요.'] },

      { t:'correct', wrong:'내일 비가 안 오면 좋겠어요.',
        answers:['내일 비가 안 왔으면 좋겠어요.','내일 비가 안 왔으면 좋겠어요'],
        hint:'The wish pattern requires past -았/었-: 오- + -았으면 = 왔으면',
        why:'The wish pattern requires -았/었으면: 비가 안 왔으면 좋겠어요.' },

      { t:'translate', q:'I hope you get well soon.',
        answers:['빨리 나았으면 좋겠어요.','빨리 나았으면 좋겠어요'],
        hint:'빨리, 낫다 (ㅅ irregular) → 나았으면 좋겠어요' },

      { t:'speak', say:'이번 주말에는 날씨가 좋았으면 좋겠어요.', q:'Read aloud with hopeful emotion:' },
    ],
  },

  {
    id: "bg-25-03", title: {"ko":"3강. 꼴 만들기: 받침과 불규칙","en":"Lesson 3. Conjugation & Irregulars: -았/었으면 좋겠다"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Conjugating Wishes & Hopes","md":"To express a hope or wish (*“I hope that...”* or *“I wish...”*), attach **-았/었으면 좋겠어요** to verb and adjective stems. Even though it looks like past tense (**-았/었-**), it expresses a **future wish**!\n\n- Bright vowels (ㅏ, ㅗ) → **-았으면 좋겠어요** *(가다 → 갔으면, 좋다 → 좋았으면)*\n- Dark vowels (others) → **-었으면 좋겠어요** *(먹다 → 먹었으면, 쉬다 → 쉬었으면)*\n- 하다 verbs → **했으면 좋겠어요** *(합격하다 → 합격했으면)*\n\nBe mindful of irregular verbs: ㄷ becomes ㄹ (**듣다 → 들었으면**), and ㅅ drops before a vowel (**낫다 → 나았으면**)!"},
      {"t":"table","head":["Base Form","Vowel Pattern","-았/었으면 좋겠어요"],"rows":[["오다 (to come)","Bright (ㅗ)","비가 안 **왔으면 좋겠어요**"],["쉬다 (to rest)","Dark (ㅟ)","집에서 **쉬었으면 좋겠어요**"],["듣다 (ㄷ irregular)","ㄷ → ㄹ","좋은 소식을 **들었으면 좋겠어요**"],["낫다 (ㅅ irregular)","ㅅ drops","감기가 빨리 **나았으면 좋겠어요**"]]},
      {"t":"chars","wide":true,"items":[{"ch":"빨리 방학이 왔으면 좋겠어요.","tip":"I hope vacation comes soon."},{"ch":"주말에 비가 안 오고 맑았으면 좋겠어요.","tip":"I hope it doesn't rain and is clear on the weekend."},{"ch":"감기가 빨리 나았으면 좋겠어요.","tip":"I hope your cold gets better quickly."}]},
      {"t":"choice","q":"Your friend caught a cold. How do you warmly say: \"I hope you get better quickly!\"? (낫다 = to recover from illness)","options":["빨리 나았으면 좋겠어요.","빨리 낫지 마세요.","빨리 낫으러 가요.","빨리 나으면 안 돼요."],"answer":0,"why":"낫다 is a ㅅ-irregular verb where ㅅ drops before a vowel: 낫- + -았으면 좋겠어요 = 나았으면 좋겠어요."},
      {"t":"cloze","sentence":"이번 주말에는 날씨가 [좋았으면 좋겠어요].","answer":"좋았으면 좋겠어요","meaning":"I hope the weather is nice this weekend.","options":["좋았으면 좋겠어요","좋지 마세요","좋으러 가요","좋으면 안 돼요"],"keys":["좋았으면 좋겠어요","좋지 마세요","좋으러 가요","좋으면 안 돼요"],"why":"좋다 ends in bright vowel ㅗ, so attach -았으면 좋겠어요: 좋았으면 좋겠어요."},
      {"t":"type","q":"듣다 (to hear/listen) — Form the wish: 「내일 시험에서 좋은 소식을 ___ . (hope to hear)」","answer":"들었으면 좋겠어요","keys":["들었으면 좋겠어요","듣는 게 좋아요","듣지 마세요","들으면 안 돼요"],"why":"듣다 is a ㄷ-irregular verb where ㄷ changes to ㄹ: 듣- + -었으면 = 들었으면 좋겠어요."},
      {"t":"order","q":"Put the words in order: \"I hope my cold gets better quickly.\"","tokens":["감기가","빨리","나았으면","좋겠어요."],"answer":["감기가","빨리","나았으면","좋겠어요."]},
      {"t":"choice","q":"Which sentence expresses a wish for exam success?","options":["이번 시험에 꼭 합격했으면 좋겠어요.","이번 시험에 꼭 합격하지 마세요.","이번 시험에 꼭 합격하면 안 돼요.","이번 시험에 꼭 합격하러 가요."],"answer":0,"why":"합격하다 + -했으면 좋겠어요 = 합격했으면 좋겠어요 expresses a hopeful wish to pass the exam."},
      {"t":"speak","say":"우리 가족 모두 건강했으면 좋겠어요.","q":"Read aloud with sincere emotion:"},
    ],
  },
  {
    id: "bg-25-04", title: {"ko":"4강. 헷갈리는 짝과 가르기: 권유 vs 바람 vs 의무","en":"Lesson 4. Choosing Tone: Advice vs Wishes vs Obligation"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Advice (-는 게 좋다) vs Wishes (-았/었으면 좋겠다)","md":"Both patterns include **좋다**, but their functions are completely different!\n\n1. **-는 게 좋아요 / 좋겠어요** — **Gentle Advice or Recommendation** (*“It would be best to...”* or *“You should...”*).\n   - 감기에 걸렸으면 따뜻한 차를 마시**는 게 좋아요**.\n\n2. **-았/었으면 좋겠어요** — **Personal Wish or Hope** (*“I hope that...”* or *“I wish...”*).\n   - 주말에 비가 안 **왔으면 좋겠어요**.\n\n3. **-아야/어야 해요** — **Firm Obligation or Duty** (*“Must / Have to...”*).\n   - 비행기 표를 오늘 예약**해야 해요**."},
      {"t":"table","head":["Pattern","Meaning","When to Use"],"rows":[["-는 게 좋아요","It's best to... / You should","Giving gentle advice to a friend or coworker"],["-았/었으면 좋겠어요","I hope that... / I wish","Expressing personal hopes about the future/weather"],["-아야/어야 해요","Must / Have to","Stating rules, deadlines, or essential obligations"]]},
      {"t":"chars","wide":true,"items":[{"ch":"머리가 아프면 약을 먹는 게 좋아요.","tip":"If your head hurts, it's best to take medicine. (Advice)"},{"ch":"내일 시험 결과가 잘 나왔으면 좋겠어요.","tip":"I hope the exam results come out well tomorrow. (Wish)"},{"ch":"내일까지 과제를 내야 해요.","tip":"I must submit the assignment by tomorrow. (Obligation)"}]},
      {"t":"choice","q":"Your friend is coughing badly. Which sentence offers gentle, caring advice to go see a doctor?","options":["병원에 가 보는 게 좋아요.","병원에 가지 마세요.","병원에 가면 안 돼요.","병원에 가고 있어요."],"answer":0,"why":"-는 게 좋아요 gives thoughtful, polite advice: 병원에 가 보는 게 좋아요 (It would be good to visit a clinic)."},
      {"t":"cloze","sentence":"피곤할 때는 무리하지 말고 일찍 [자는 게 좋아요].","answer":"자는 게 좋아요","meaning":"When tired, it's best not to push yourself and sleep early.","options":["자는 게 좋아요","자지 마세요","자는 게 좋해요","자러 가요"],"keys":["자는 게 좋아요","자지 마세요","자는 게 좋해요","자러 가요"],"why":"When recommending a helpful action to someone, use -는 게 좋아요."},
      {"t":"type","q":"쉬다 (to rest) — Offer caring advice: 「몸이 안 좋으면 집에서 ___ . (better to rest)」","answer":"쉬는 게 좋아요","keys":["쉬는 게 좋아요","쉬었으면 좋겠어요","쉬지 마세요","쉬면 안 돼요"],"why":"Attach -는 게 좋아요 to the verb stem 쉬- to advise resting: 쉬는 게 좋아요."},
      {"t":"choice","q":"Which sentence expresses a hopeful wish about tomorrow's weather?","options":["내일은 날씨가 따뜻했으면 좋겠어요.","내일은 날씨가 따뜻한 게 좋아요.","내일은 날씨가 따뜻해야 돼요.","내일은 날씨가 따뜻하러 가요."],"answer":0,"why":"For uncontrollable future events like weather, use the wish pattern -았/었으면 좋겠어요: 따뜻했으면 좋겠어요."},
      {"t":"order","q":"Put the words in order: \"When you have a fever, it's best to drink warm water.\"","tokens":["열이 날 때는","따뜻한 물을","마시는 게","좋아요."],"answer":["열이 날 때는","따뜻한 물을","마시는 게","좋아요."]},
      {"t":"speak","say":"스트레스 받을 때는 좋아하는 음악을 듣는 게 좋아요.","q":"Read aloud smoothly:"},
    ],
  },
  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-26 — -게 되다 · -게
   -게 되다(상황의 변화: 그렇게 되었다)와 -게(부사형: ~하게).
   외부 상황에 의해 변화한 상태와 형용사를 부사로 바꾸는 원리.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-26',
  emoji: '🌱',
  title: { ko:'-게 되다 · -게', en:'Becoming & Manner: -게 되다 & -게' },
  tagline: { ko:'상황의 변화와 형용사를 부사로 만들기', en:'How situations change, and turning adjectives into adverbs.' },
  blurb: { ko:'"한국 회사에서 일하게 됐어요"(상황 변화)와 "맛있게 드세요"(부사형)를 배웁니다. 내 의지와 상관없이 자연스럽게 변한 상황을 표현하는 법과 일상에서 가장 흔한 인사말의 구조를 이해합니다.',
           en:'Express changes in circumstances (-게 되다: “ended up doing / came to be”) and turn adjectives into natural adverbs (-게: “in a ~ manner”).' },
  level: 'Beginner',
  needs: 'bg-25',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-26-01',
    title: { ko:'1강. 상황의 변화: -게 되다', en:'Lesson 1. Changes in Situation: -게 되다' },
    minutes: 7,
    blocks: [
      { t:'text', md:'When describing how a situation **changed due to circumstances, outside events, or time**, use **-게 되다** (*“turned out that... / came to do... / ended up doing...”*):\n\n- *“한국 회사에서 일하**게 됐어요**.”* (I ended up working at a Korean company.)\n- *“한국 친구 덕분에 김치를 좋아하**게 됐어요**.”* (Thanks to my Korean friend, I came to like kimchi.)\n\nUnlike pure personal decisions (*-기로 했어요*), **-게 되다** emphasizes the result of changing circumstances.' },

      { t:'table', head:['Verb Stem','With -게 되다','Meaning'], rows:[
        ['알다 (to know)','**알게 됐어요**','Came to know / Found out'],
        ['일하다 (to work)','**일하게 됐어요**','Ended up working'],
        ['좋아하다 (to like)','**좋아하게 됐어요**','Came to like'],
        ['이사하다 (to move)','**이사하게 됐어요**','It turned out I am moving'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'한국 회사에서 일하게 됐어요.', tip:'I ended up working at a Korean company.' },
        { ch:'한국 음식을 좋아하게 됐어요.', tip:'I came to like Korean food.' },
        { ch:'다음 달에 이사하게 됐어요.', tip:'It turned out I’m moving next month.' },
      ]},

      { t:'choice', q:'When announcing "I ended up getting a job at a Korean company", what is the most natural form?',
        options:['한국 회사에 취직하게 됐어요.','한국 회사에 취직하려고 해요.','한국 회사에 취직해야 돼요.','한국 회사에 취직하면 돼요.'], answer:0,
        why:'-게 됐어요 expresses that circumstances led to this new outcome: 취직하게 됐어요.' },

      { t:'cloze', sentence:'친구 덕분에 한국 문화를 [알게 됐어요].', answer:'알게 됐어요',
        options:['알게 됐어요','알아야 돼요','알려고 해요','알고 있어요'],
        meaning:'Thanks to my friend, I came to know about Korean culture.',
        why:'알다 + -게 됐어요 = 알게 됐어요 (came to know).' },

      { t:'order', q:'Put in order: "It turned out I am moving to Korea next month."',
        tokens:['다음','달에','한국으로','이사하게','됐어요.'], answer:['다음','달에','한국으로','이사하게','됐어요.'] },

      { t:'correct', wrong:'친구의 소개로 그 사람을 알아게 됐어요.',
        answers:['친구의 소개로 그 사람을 알게 됐어요.','친구의 소개로 그 사람을 알게 됐어요'],
        hint:'Attach -게 되다 directly to the stem 알다: 알- + -게 = 알게',
        why:'Attach -게 directly without vowel changes: 알게 됐어요.' },

      { t:'translate', q:'I ended up working at a Korean company.',
        answers:['한국 회사에서 일하게 됐어요.','한국 회사에서 일하게 되었어요.','한국 회사에서 일하게 됐어요'],
        hint:'한국 회사에서, 일하다 → 일하게 됐어요' },

      { t:'speak', say:'한국 회사에서 일하게 됐어요.', q:'Read aloud with excitement:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-26-02',
    title: { ko:'2강. 부사형 만들기: -게', en:'Lesson 2. In a ~ Manner: Adverbial -게' },
    minutes: 7,
    blocks: [
      { t:'text', md:'Have you wondered why Koreans say **맛있게 드세요** instead of 맛있다?\n\nAttaching **-게** to an adjective stem turns it into an **adverb** (*“-ly / in a ~ manner”*):\n- **맛있다** (delicious) → **맛있게** (deliciously / enjoyably)\n- **따뜻하다** (warm) → **따뜻하게** (warmly)\n- **예쁘다** (pretty) → **예쁘게** (prettily / nicely)\n- **재미있다** (fun) → **재미있게** (enjoyably / with fun)\n\nSimply take the stem and add **-게**!' },

      { t:'table', head:['Adjective','Adverb with -게','Common Daily Phrase'], rows:[
        ['맛있다 (delicious)','**맛있게**','**맛있게 드세요!** (Enjoy your meal!)'],
        ['따뜻하다 (warm)','**따뜻하게**','**따뜻하게 입으세요** (Dress warmly)'],
        ['재미있다 (fun)','**재미있게**','**재미있게 노세요!** (Have fun!)'],
        ['예쁘다 (pretty)','**예쁘게**','사진을 **예쁘게 찍어 주세요** (Take it nicely)'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'맛있게 드세요!', tip:'Enjoy your meal! (Literally: Eat deliciously!)' },
        { ch:'날씨가 추우니까 따뜻하게 입으세요.', tip:'Dress warmly because it’s cold.' },
        { ch:'주말 재미있게 보내세요!', tip:'Have a wonderful weekend!' },
      ]},

      { t:'choice', q:'Before eating together, how do you politely tell someone "Enjoy your meal"?',
        options:['맛있게 드세요.','맛있는 드세요.','맛있어서 드세요.','맛있으면 드세요.'], answer:0,
        why:'맛있게 modifies 드세요: 맛있게 드세요! (Eat deliciously / Enjoy your meal!).' },

      { t:'cloze', sentence:'날씨가 추우니까 옷을 [따뜻하게] 입으세요.', answer:'따뜻하게',
        options:['따뜻하게','따뜻한','따뜻해서','따뜻하면'],
        meaning:'Because the weather is cold, please dress warmly.',
        why:'따뜻하다 + -게 = 따뜻하게 (warmly).' },

      { t:'pair', q:'Match adjectives with their adverb forms:', pairs:[
        ['맛있다', '맛있게 (deliciously)'],
        ['따뜻하다', '따뜻하게 (warmly)'],
        ['재미있다', '재미있게 (with fun)'],
        ['예쁘다', '예쁘게 (nicely / prettily)'],
      ]},

      { t:'correct', wrong:'음식을 맛있는 드세요.',
        answers:['음식을 맛있게 드세요.','음식을 맛있게 드세요'],
        hint:'Change 맛있다 into an adverb modifying 드세요: 맛있- + -게 = 맛있게',
        why:'Adverb form is 맛있게: 음식을 맛있게 드세요.' },

      { t:'translate', q:'Please dress warmly because it is cold.',
        answers:['추우니까 따뜻하게 입으세요.','날씨가 추우니까 따뜻하게 입으세요.','추우니까 따뜻하게 입으세요'],
        hint:'추우니까, 따뜻하게 입으세요' },

      { t:'speak', say:'날씨가 추우니까 따뜻하게 입으세요.', q:'Read aloud with warmth:' },
    ],
  },

  {
    id: "bg-26-03", title: {"ko":"3강. 꼴 만들기: 부사 만들기 -게 와 관용 표현","en":"Lesson 3. Forming Adverbs with -게 & Common Idioms"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Turning Descriptive Words into Adverbs (-게)","md":"Attaching **-게** to an adjective stem transforms it into an adverb meaning *“-ly”* or *“in a ... way”*:\n\n- **크다 → 크게** *(loudly / largely)*: 음악을 **크게** 틀었어요.\n- **쉽다 → 쉽게** *(easily)*: 시험문제를 **쉽게** 풀었어요.\n- **예쁘다 → 예쁘게** *(prettily / nicely)*: 머리를 **예쁘게** 잘랐어요.\n\nNotice that **-게** attaches directly to the adjective stem without changing based on batchim! However, a few common adjectives have irregular or independent adverb twins: **많다 → 많이**, **빠르다 → 빨리**, **깨끗하다 → 깨끗이**."},
      {"t":"table","head":["Adjective","Adverb with -게","Example in Context"],"rows":[["크다 (big / loud)","**크게** (loudly)","목소리를 **크게** 내세요"],["쉽다 (easy)","**쉽게** (easily)","설명을 **쉽게** 해 주세요"],["맛있다 (delicious)","**맛있게** (deliciously)","점심 **맛있게** 드세요"],["편하다 (comfortable)","**편하게** (comfortably)","소파에 **편하게** 앉으세요"]]},
      {"t":"chars","wide":true,"items":[{"ch":"잘 안 들리니까 조금 더 크게 말씀해 주세요.","tip":"I can't hear well, so please speak a little louder."},{"ch":"선생님이 문법을 쉽게 설명해 주셨어요.","tip":"The teacher explained the grammar easily for us."},{"ch":"여기 편하게 앉아서 기다리세요.","tip":"Please sit comfortably here and wait."}]},
      {"t":"choice","q":"How do you politely ask a speaker at a lecture: \"Please speak a little louder\"? (크다 = loud/big)","options":["조금 더 크게 말씀해 주세요.","조금 더 큰 말씀해 주세요.","조금 더 크지 마세요.","조금 더 크면 안 돼요."],"answer":0,"why":"크다 becomes the adverb 크게 when modifying the action verb 말씀해 주세요: 크게 말씀해 주세요."},
      {"t":"cloze","sentence":"처음 배우는 사람도 [쉽게] 이해할 수 있어요.","answer":"쉽게","meaning":"Even beginners can easily understand.","options":["쉽게","쉬운","쉬워서","쉬우면"],"keys":["쉽게","쉬운","쉬워서","쉬우면"],"why":"쉽다 + -게 = 쉽게 (easily), modifying the verb 이해하다."},
      {"t":"type","q":"편하다 (to be comfortable) — Complete the sentence: 「여기 ___ 앉으세요. (comfortably)」","answer":"편하게","keys":["편하게","편한","편해서","편하기로"],"why":"Attach -게 directly to the stem 편하- to form the adverb 편하게."},
      {"t":"choice","q":"Which sentence uses the adverb form -게 naturally?","options":["머리를 짧게 잘랐어요.","머리를 짧은 잘랐어요.","머리를 짧아서 잘랐어요.","머리를 짧으면 잘랐어요."],"answer":0,"why":"짧다 (short) takes -게 to become the adverb 짧게 (cut my hair short)."},
      {"t":"order","q":"Put the words in order: \"Please sit comfortably and drink tea.\"","tokens":["소파에","편하게","앉아서","차를 드세요."],"answer":["소파에","편하게","앉아서","차를 드세요."]},
      {"t":"speak","say":"목소리가 작아서 안 들려요. 조금만 더 크게 말해 주세요.","q":"Read aloud clearly:"},
    ],
  },
  {
    id: "bg-26-04", title: {"ko":"4강. 헷갈리는 짝과 가르기: -게 되다 vs -기로 하다","en":"Lesson 4. Circumstance vs Decision: -게 되다 vs -기로 하다"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Circumstance (-게 되다) vs Personal Decision (-기로 하다)","md":"Both expressions talk about changes in situation or future actions, but who decided it?\n\n1. **-게 되다** — **Circumstance / External change** (*“Turned out that...”*, *“Came to...”*).\n   - The result happened naturally, unexpectedly, or due to external factors (like company orders or luck).\n   - 회사 발령으로 부산에 살**게 됐어요**. *(I ended up living in Busan due to company relocation)*\n\n2. **-기로 하다** — **Personal resolution / Mutual appointment** (*“Decided to...”*).\n   - The speaker actively chose to do this action.\n   - 부산으로 이사 가**기로 했어요**. *(I personally decided to move to Busan)*"},
      {"t":"table","head":["Expression","Focus","Example"],"rows":[["-게 되다","External circumstances / Not purely personal choice","갑자기 출장을 **가게 됐어요** (sent on business trip)"],["-기로 하다","Active personal choice or appointment","주말에 친구를 **만나기로 했어요** (agreed to meet)"],["-아/어지다","Change of quality or state (for adjectives)","날씨가 많이 **따뜻해졌어요** (weather became warm)"]]},
      {"t":"chars","wide":true,"items":[{"ch":"한국 대학교로 유학을 가게 되었어요.","tip":"I ended up going to study abroad at a Korean university."},{"ch":"친구의 소개로 그 사람을 알게 되었어요.","tip":"I came to know that person through a friend's introduction."},{"ch":"건강을 위해 매일 조깅을 하기로 했어요.","tip":"I decided to go jogging every day for my health."}]},
      {"t":"choice","q":"Your company ordered you to relocate to the overseas branch. Which sentence appropriately reflects that this was an assigned company situation?","options":["다음 달부터 해외 지사에서 일하게 되었어요.","다음 달부터 해외 지사에서 일하지 마세요.","다음 달부터 해외 지사에서 일하면 안 돼요.","다음 달부터 해외 지사에서 일하고 있어요."],"answer":0,"why":"-게 되다 emphasizes that the event was brought about by circumstances outside purely personal choice: 일하게 되었어요."},
      {"t":"cloze","sentence":"친구 덕분에 좋은 책을 [알게 되었어요].","answer":"알게 되었어요","meaning":"Thanks to my friend, I came to know about a great book.","options":["알게 되었어요","알지 마세요","알아야 돼요","알려고 해요"],"keys":["알게 되었어요","알지 마세요","알아야 돼요","알려고 해요"],"why":"알게 되다 expresses coming to know something over time or through circumstance."},
      {"t":"type","q":"살다 (to live) — Express that you ended up living in Seoul: 「회사 일 때문에 서울에서 ___ . (came to live)」","answer":"살게 되었어요","keys":["살게 되었어요","살기로 했어요","살아야 돼요","살지 마세요"],"why":"Attach -게 되다 to the stem 살- → 살게 되다 (past polite: 살게 되었어요 / 살게 됐어요)."},
      {"t":"choice","q":"A: \"그 노래는 어떻게 알았어요?\" How do you naturally explain: \"I happened to hear it at a café\"? (듣다 = to hear)","options":["카페에서 우연히 듣게 되었어요.","카페에서 우연히 듣기로 했어요.","카페에서 우연히 듣지 마세요.","카페에서 우연히 들으면 안 돼요."],"answer":0,"why":"우연히 (by chance) perfectly pairs with -게 되었어요 to describe a natural occurrence: 듣게 되었어요."},
      {"t":"order","q":"Put the words in order: \"I ended up moving to Seoul because of work.\"","tokens":["회사 일 때문에","서울로","이사하게","되었어요."],"answer":["회사 일 때문에","서울로","이사하게","되었어요."]},
      {"t":"speak","say":"좋은 기회가 생겨서 한국에서 일하게 되었어요.","q":"Read aloud smoothly:"},
    ],
  },
  ],
},

];
