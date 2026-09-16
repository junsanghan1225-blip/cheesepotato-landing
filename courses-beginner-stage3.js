/* ══════════════════════════════════════════════════════════════
   초급 3단계 — 이어 말하기
   ──────────────────────────────────────────────────────────────
   설계는 docs/curriculum-beginner.md §3, §4 (3단계) 에 있다.
   이 단계가 끝나면 학습자는 **두 문장을 잇고 이유를 댄다.**

   ── 설명은 영어, 예문은 한국어 ──────────────────────────────
   초급 학습자의 인지 부하를 줄이기 위해 설명과 힌트는 영어로,
   연습 문장과 선택지는 자연스러운 한국어로 작성한다.

   ── 코스 구성 ───────────────────────────────────────────────
   - bg-13: -고 와 -지만 (2강)
   - bg-14: 이유의 두 갈래: -아/어서 vs -(으)니까 (3강)
   - bg-15: -(으)면 · -(으)면서 · -거나 (3강)
   - bg-16: -는데 / -(으)ㄴ데 (3강)
   ══════════════════════════════════════════════════════════════ */

export const BEGINNER_STAGE3_COURSES = [

/* ═══════════════════════════════════════════════════════════════
   bg-13 — -고 와 -지만
   두 문장을 하나로 잇기. 어간에 그대로 붙는 가장 쉬운 연결 어미 둘.
   시제는 마지막 동사에만 붙인다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-13',
  emoji: '🔗',
  title: { ko:'-고 와 -지만', en:'Linking Clauses: -고 & -지만' },
  tagline: { ko:'두 문장을 하나로 잇기 — 나열과 대조', en:'Join two sentences with and & but.' },
  blurb: { ko:'짧은 문장 두 개를 하나로 이어 말하는 법을 배웁니다. 어간에 그대로 붙는 -고와 -지만으로 말을 자연스럽게 연결하세요.',
           en:'Move beyond short one-clause sentences. Learn how to connect actions and contrast facts smoothly with -고 (and) and -지만 (but).' },
  level: 'Beginner',
  needs: 'bg-irr-02',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-13-01',
    title: { ko:'1강. 나열과 순서: -고', en:'Lesson 1. Listing & Sequence: -고' },
    minutes: 6,
    blocks: [
      { t:'text', md:'Up to now, you spoke in single clauses: *“I ate. I watched a movie.”*\n\nTo connect two actions or descriptions with **“and”**, simply attach **-고** directly to the verb or adjective stem. No vowel harmony, no batchim exceptions!' },

      { t:'table', head:['Verb / Adjective','Stem','With -고 (and)'], rows:[
        ['먹다 (to eat)','먹-','**먹고** (eat and...)'],
        ['가다 (to go)','가-','**가고** (go and...)'],
        ['크다 (to be big)','크-','**크고** (big and...)'],
        ['조용하다 (to be quiet)','조용하-','**조용하고** (quiet and...)'],
      ]},

      { t:'note', md:'**The Golden Rule of Tense with -고**:\n\nWhen telling a story in the past, **only conjugate the very last verb into past tense!**\n\n❌ 밥을 **먹었고** 영화를 **봤어요**.\n⭕ 밥을 **먹고** 영화를 **봤어요**. *(I ate a meal and watched a movie.)*' },

      { t:'chars', wide:true, items:[
        { ch:'방이 넓고 깨끗해요.', tip:'The room is spacious and clean. (넓다 + -고)' },
        { ch:'밥을 먹고 커피를 마셨어요.', tip:'I ate food and drank coffee. (먹다 + -고)' },
        { ch:'저는 한국어를 공부하고 친구를 만나요.', tip:'I study Korean and meet my friend. (공부하다 + -고)' },
      ]},

      { t:'choice', q:'How do you combine “방이 넓다 (room is big)” and “깨끗하다 (clean)” with “and”?',
        options:['넓고 깨끗해요','넓아서 깨끗해요','넓지만 깨끗해요','넓으면 깨끗해요'], answer:0,
        why:'Simply attach -고 to the stem 넓-: 넓- + -고 = 넓고.' },

      { t:'cloze', sentence:'저는 어제 책을 [읽고] 잤어요.', answer:'읽고',
        options:['읽고','읽었고','읽어서','읽지만'],
        meaning:'I read a book and went to bed yesterday.',
        why:'Remember: tense only goes on the final verb (잤어요), so the connector is simply 읽고.' },

      { t:'order', q:'Put in order: "I ate breakfast and went to school."',
        tokens:['아침을','먹고','학교에','갔어요.'], answer:['아침을','먹고','학교에','갔어요.'] },

      { t:'correct', wrong:'어제 밥을 먹었고 영화를 봤어요.',
        answers:['어제 밥을 먹고 영화를 봤어요.','어제 밥을 먹고 영화를 봤어요'],
        hint:'Do not put -었- on both verbs! Only the last verb carries the tense.',
        why:'In a sentence joined by -고, past tense -았/었- only goes on the final verb: 밥을 먹고 영화를 봤어요.' },

      { t:'translate', q:'The room is clean and quiet.',
        answers:['방이 깨끗하고 조용해요.','방이 깨끗하고 조용해요'],
        hint:'깨끗하다 + -고, 조용하다' },

      { t:'speak', say:'저는 한국어를 공부하고 친구를 만나요.', q:'Listen and read aloud:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-13-02',
    title: { ko:'2강. 두 사실의 대조: -지만', en:'Lesson 2. Contrasting Facts: -지만' },
    minutes: 6,
    blocks: [
      { t:'text', md:'To link two opposing clauses with **“but”** or **“however”**, attach **-지만** directly to the stem.\n\nJust like **-고**, there are no irregular vowel changes: simply glue **-지만** straight onto the stem.' },

      { t:'table', head:['Word','Stem','With -지만 (but)'], rows:[
        ['비싸다 (expensive)','비싸-','**비싸지만** (expensive, but...)'],
        ['맛있다 (delicious)','맛있-','**맛있지만** (delicious, but...)'],
        ['어렵다 (difficult)','어렵-','**어렵지만** (difficult, but...)'],
        ['작다 (small)','작-','**작지만** (small, but...)'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'비싸지만 맛있어요.', tip:'It is expensive, but delicious.' },
        { ch:'작지만 아늑해요.', tip:'It is small, but cozy.' },
        { ch:'한국어는 어렵지만 재미있어요.', tip:'Korean is difficult, but fun.' },
      ]},

      { t:'choice', q:'How do you say "This bag is expensive, but pretty"? (비싸다 = expensive, 예쁘다 = pretty)',
        options:['비싸지만 예뻐요','비싸고 예뻐요','비싸서 예뻐요','비싸면 예뻐요'], answer:0,
        why:'-지만 means “but / however”: 비싸- + -지만 = 비싸지만.' },

      { t:'cloze', sentence:'한국 음식은 [맵지만] 맛있어요.', answer:'맵지만',
        options:['맵지만','맵고','매워서','매우면'],
        meaning:'Korean food is spicy, but delicious.',
        why:'맵다 + -지만 = 맵지만 (It is spicy, but delicious).' },

      { t:'order', q:'Put in order: "Korean is difficult, but really fun."',
        tokens:['한국어는','어렵지만','정말','재미있어요.'], answer:['한국어는','어렵지만','정말','재미있어요.'] },

      { t:'correct', wrong:'날씨가 춥고 그렇지만 밖에서 놀았어요.',
        answers:['날씨가 춥지만 밖에서 놀았어요.','날씨가 춥지만 밖에서 놀았어요'],
        hint:'Attach -지만 directly to 춥다 stem: 춥- + -지만',
        why:'Simply attach -지만 directly to the verb stem: 춥지만.' },

      { t:'translate', q:'It is expensive, but delicious.',
        answers:['비싸지만 맛있어요.','비싸지만 맛있어요'],
        hint:'비싸다 + -지만, 맛있다' },

      { t:'speak', say:'한국어는 어렵지만 재미있어요.', q:'Read aloud naturally:' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-14 — 이유의 두 갈래: -아/어서 vs -(으)니까
   -아/어서(자연스러운 인과)와 -(으)니까(판단·명령)를 배우고,
   초급 최다 빈출 오류인 "명령·청유 앞에는 -아/어서 금지"를 정복한다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-14',
  emoji: '💡',
  title: { ko:'이유의 두 갈래: -아/어서 vs -(으)니까', en:'Two Ways to Give Reasons: -아/어서 vs -(으)니까' },
  tagline: { ko:'이유를 말하고 명령·청유의 차이를 정복하기', en:'Give reasons, make excuses, and master the golden rule.' },
  blurb: { ko:'한국어로 이유를 말하는 두 가지 큰 길을 배웁니다. 자연스러운 인과관계의 -아/어서와 판단·명령의 -(으)니까, 그리고 초급자가 가장 많이 틀리는 핵심 규칙을 훈련합니다.',
           en:'Master Korean’s two main reason connectors. Learn when to use -아/어서 vs -(으)니까, and conquer the #1 rule that trips up beginner learners.' },
  level: 'Beginner',
  needs: 'bg-13',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-14-01',
    title: { ko:'1강. 자연스러운 원인과 결과: -아/어서', en:'Lesson 1. Natural Cause & Result: -아/어서' },
    minutes: 7,
    blocks: [
      { t:'text', md:'When explaining a natural reason like *“I was hungry, so I ate”* or *“It rained, so the ground is wet”*, Korean uses **-아/어서**.\n\nThe vowel harmony rule is the same one you know from **-아요/-어요**:\n- Stem ends in **ㅏ, ㅗ** → **-아서**\n- Other vowels → **-어서**\n- **하다** verbs → **해서**' },

      { t:'table', head:['Verb / Adjective','Conjugation','Meaning'], rows:[
        ['배고프다 (hungry)','**배고파서**','Because I was hungry...'],
        ['비가 오다 (to rain)','**비가 와서**','Because it rained...'],
        ['늦다 (to be late)','**늦어서**','Because I was late...'],
        ['바쁘다 (busy)','**바빠서**','Because I was busy...'],
        ['공부하다 (to study)','**공부해서**','Because I studied...'],
      ]},

      { t:'note', md:'**CRITICAL RULE**: Never conjugate past tense before **-아/어서**!\n\n❌ 어제 비가 **왔어서**...\n⭕ 어제 비가 **와서**...\n\nThe past tense is already conveyed at the end of the sentence: *어제 비가 와서 집에 **있었어요**.*' },

      { t:'chars', wide:true, items:[
        { ch:'배가 고파서 밥을 먹었어요.', tip:'I was hungry, so I ate food.' },
        { ch:'비가 와서 집에 있었어요.', tip:'It rained, so I stayed home.' },
        { ch:'감기에 걸려서 병원에 갔어요.', tip:'I caught a cold, so I went to the hospital.' },
      ]},

      { t:'choice', q:'Which sentence correctly says "I was busy yesterday, so I couldn\'t go"?',
        options:['어제 바빠서 못 갔어요.','어제 바빴어서 못 갔어요.','어제 바쁘고 못 갔어요.','어제 바쁜 후에 못 갔어요.'], answer:0,
        why:'Never put past tense -았/었- before -아/어서: 바빠서 못 갔어요 is correct.' },

      { t:'cloze', sentence:'어제 늦게 [자서] 오늘 피곤해요.', answer:'자서',
        options:['자서','잤어서','자고','자니까'],
        meaning:'I slept late yesterday, so I am tired today.',
        why:'자다 + -아서 = 자서. Do not add past tense inside the connector.' },

      { t:'correct', wrong:'어제 비가 왔어서 우산을 샀어요.',
        answers:['어제 비가 와서 우산을 샀어요.','어제 비가 와서 우산을 샀어요'],
        hint:'Remove -았- before -어서: 오- + -아서 = 와서',
        why:'Never use past tense before -아/어서: 비가 와서 우산을 샀어요.' },

      { t:'translate', q:'I was hungry, so I ate bread.',
        answers:['배가 고파서 빵을 먹었어요.','배가 고파서 빵을 먹었어요'],
        hint:'배가 고프다 → 배가 고파서, 빵을 먹다' },

      { t:'speak', say:'배가 고파서 밥을 먹었어요.', q:'Read aloud with clear pronunciation:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-14-02',
    title: { ko:'2강. 내 생각과 판단의 근거: -(으)니까', en:'Lesson 2. Subjective Reason & Basis: -(으)니까' },
    minutes: 6,
    blocks: [
      { t:'text', md:'**-(으)니까** expresses a reason based on personal judgment, discovery, or when suggesting an action: *“Since / Because...”*\n\nAttachment rule based on batchim:\n- Stem has batchim → **-으니까** *(먹다 → 먹으니까)*\n- Stem has no batchim → **-니까** *(가다 → 가니까)*' },

      { t:'table', head:['Word','Batchim?','With -(으)니까'], rows:[
        ['가다 (to go)','No batchim','**가니까** (since I go...)'],
        ['먹다 (to eat)','Has batchim','**먹으니까** (since I eat...)'],
        ['바쁘다 (busy)','No batchim','**바쁘니까** (since I am busy...)'],
        ['좋다 (good)','Has batchim','**좋으니까** (since it is good...)'],
      ]},

      { t:'note', md:'Unlike **-아/어서**, past tense **CAN** be used before **-(으)니까**!\n\n⭕ 밥을 **먹었으니까** 출발합시다. *(Since we ate, let’s depart.)*' },

      { t:'chars', wide:true, items:[
        { ch:'지금 바쁘니까 나중에 이야기해요.', tip:'Since I am busy right now, let’s talk later.' },
        { ch:'날씨가 좋으니까 기분이 좋아요.', tip:'Since the weather is nice, I feel great.' },
        { ch:'밥을 먹었으니까 산책해요.', tip:'Since we ate, let’s take a walk.' },
      ]},

      { t:'choice', q:'How do you attach -(으)니까 to 없다 (to not have)?',
        options:['없으니까','없니까','없어서','없으면'], answer:0,
        why:'없다 has a batchim (ㅄ), so it takes -으니까: 없- + -으니까 = 없으니까.' },

      { t:'cloze', sentence:'지금 [바쁘니까] 나중에 다시 전화해 주세요.', answer:'바쁘니까',
        options:['바쁘니까','바빠서','바쁘고','바쁘지만'],
        meaning:'Since I am busy now, please call me back later.',
        why:'With requests like -해 주세요, -(으)니까 must be used.' },

      { t:'order', q:'Put in order: "Since there is no time, let\'s depart quickly."',
        tokens:['시간이','없으니까','빨리','출발해요.'], answer:['시간이','없으니까','빨리','출발해요.'] },

      { t:'translate', q:'Since it is cold today, put on a coat.',
        answers:['오늘 추우니까 코트를 입으세요.','오늘 날씨가 추우니까 코트를 입으세요.','오늘 추우니까 코트를 입으세요'],
        hint:'춥다 (ㅂ irregular) → 추우니까, 코트를 입으세요' },

      { t:'speak', say:'지금 바쁘니까 나중에 전화해 주세요.', q:'Read aloud:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-14-03',
    title: { ko:'3강. 결정적 대조: 명령·청유 앞에는 -(으)니까만 온다', en:'Lesson 3. The Big Rule: Commands & Suggestions' },
    minutes: 7,
    blocks: [
      { t:'text', md:'This is **the most tested grammar rule in beginner Korean**:\n\nWhen the second clause is a **command** (*-(으)세요*) or a **suggestion** (*-(으)ㅂ시다 / -(으)ㄹ까요?*):\n\n❌ You CANNOT use **-아/어서**!\n⭕ You MUST use **-(으)니까**!' },

      { t:'table', head:['Meaning','Wrong (-아/어서)','Correct (-(으)니까)'], rows:[
        ['Because it rains, take an umbrella','비가 **와서** 우산 쓰세요 ❌','비가 **오니까** 우산 쓰세요 ⭕'],
        ['Because it is hot, let\'s turn on A/C','더**워서** 에어컨 켭시다 ❌','더**우니까** 에어컨 켭시다 ⭕'],
        ['Because weather is nice, shall we go?','날씨가 좋**아서** 갈까요? ❌','날씨가 좋**으니까** 갈까요? ⭕'],
      ]},

      { t:'note', md:'**Formal Written Reasons (-기 때문에)**:\nIn formal speeches or writing, you also see **-기 때문에** (for nouns: **때문에**):\n\n- 비 **때문에** 늦었어요. *(Late because of rain.)*\n- 비가 오**기 때문에** 길이 막혀요. *(Traffic is heavy because it rains.)*\nLike -아/어서, it is also not used with commands or suggestions.' },

      { t:'choice', q:'Which sentence is grammatically correct?',
        options:['날씨가 좋으니까 공원에 갈까요?','날씨가 좋아서 공원에 갈까요?','날씨가 좋아서 공원에 가세요.','날씨가 좋아서 산책합시다.'], answer:0,
        why:'Suggestions like -갈까요? and commands like -세요 can never follow -아/어서. They require -(으)니까!' },

      { t:'cloze', sentence:'더우니까 에어컨을 [켜세요].', answer:'켜세요',
        options:['켜세요','켜서','켜고','켜지만'],
        meaning:'Since it is hot, please turn on the air conditioner.',
        why:'-(으)니까 naturally leads into the imperative command 켜세요 (please turn on).' },

      { t:'correct', wrong:'날씨가 추워서 따뜻하게 입으세요.',
        answers:['날씨가 추우니까 따뜻하게 입으세요.','날씨가 추우니까 따뜻하게 입으세요'],
        hint:'You cannot use -어서 with command -세요! Change 추워서 to 추우니까.',
        why:'Commands (-세요) cannot follow -아/어서: 날씨가 추우니까 따뜻하게 입으세요.' },

      { t:'build', q:'Build: "Because it is raining, please take an umbrella."',
        answers:['비가 오니까 우산을 가져가세요.','비가 오니까 우산을 가져가세요'],
        bank:['비가','오니까','와서','우산을','가져가세요.','가져갔어요.'],
        must:['오니까','우산을'] },

      { t:'translate', q:'Since it is hot, please turn on the air conditioner.',
        answers:['더우니까 에어컨을 켜세요.','더우니까 에어컨을 켜세요'],
        hint:'더우니까, 에어컨을 켜세요' },

      { t:'speak', say:'더우니까 에어컨을 켜세요.', q:'Read aloud:' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-15 — -(으)면 · -(으)면서 · -거나
   조건(-(으)면), 동시 동작(-(으)면서), 선택(-거나).
   -(으)면에서 처음 만나는 ㄹ 불규칙 탈락(살다 → 살면)을 정복한다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-15',
  emoji: '🌿',
  title: { ko:'-(으)면 · -(으)면서 · -거나', en:'Conditions, While & Either/Or: -(으)면, -(으)면서, -거나' },
  tagline: { ko:'조건과 동시 동작, 선택으로 표현 넓히기', en:'If, while, and either/or in daily speech.' },
  blurb: { ko:'"만약 ~하면", "~하면서", "이걸 하거나 저걸 해요"처럼 현실에서 가장 자주 쓰이는 연결 어미 셋을 배웁니다. -(으)면에서 처음 만나는 ㄹ 불규칙 탈락까지 정복합니다.',
           en:'Express conditions (if), simultaneous actions (while doing), and choices between actions (either... or). Also master the essential ㄹ-drop rule when -(으) is attached.' },
  level: 'Beginner',
  needs: 'bg-14',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-15-01',
    title: { ko:'1강. 조건: -(으)면 과 ㄹ 탈락의 시작', en:'Lesson 1. If & When: -(으)면 and the ㄹ Rule' },
    minutes: 7,
    blocks: [
      { t:'text', md:'To say **“if”** or **“when”** a condition is met, attach **-(으)면** to the verb or adjective stem:\n- Stem with batchim → **-으면** *(먹다 → 먹으면)*\n- Stem without batchim → **-면** *(가다 → 가면)*' },

      { t:'note', md:'**The ㄹ Batchim Exception**:\n\nVerbs ending in **ㄹ** behave as if they have **NO batchim**! They attach **-면** directly without 으:\n\n- 살다 (to live) → **살면** *(NOT 살으면 ❌)*\n- 만들다 (to make) → **만들면** *(NOT 만들으면 ❌)*\n- 알다 (to know) → **알면** *(NOT 알으면 ❌)*' },

      { t:'table', head:['Verb / Adjective','Type','With -(으)면'], rows:[
        ['가다 (to go)','No batchim','**가면** (if you go)'],
        ['먹다 (to eat)','Has batchim','**먹으면** (if you eat)'],
        ['살다 (to live)','ㄹ batchim','**살면** (if you live)'],
        ['만들다 (to make)','ㄹ batchim','**만들면** (if you make)'],
        ['있다 (to have)','Has batchim','**있으면** (if you have)'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'시간이 있으면 같이 밥 먹어요.', tip:'If you have time, let’s eat together.' },
        { ch:'한국에 살면 한국어가 빨리 늘어요.', tip:'If you live in Korea, your Korean improves quickly.' },
        { ch:'모르면 물어보세요.', tip:'If you do not know, please ask.' },
      ]},

      { t:'choice', q:'How do you conjugate 살다 (to live) with -(으)면 (if)?',
        options:['살면','살으면','살아서','살니까'], answer:0,
        why:'Verbs ending in ㄹ take -면 directly without 으: 살- + -면 = 살면.' },

      { t:'cloze', sentence:'주말에 시간이 [있으면] 같이 영화 봐요.', answer:'있으면',
        options:['있으면','있고','있어서','있지만'],
        meaning:'If you have time this weekend, let’s watch a movie together.',
        why:'있다 + -으면 = 있으면 (If you have time).' },

      { t:'correct', wrong:'한국에서 살으면 한국말을 잘해요.',
        answers:['한국에서 살면 한국말을 잘해요.','한국에서 살면 한국말을 잘해요'],
        hint:'ㄹ batchim verbs attach -면 directly: 살- + -면 = 살면',
        why:'Never say 살으면! Verbs ending in ㄹ drop the 으 and become 살면.' },

      { t:'translate', q:'If you have time tomorrow, let\'s meet.',
        answers:['내일 시간 있으면 만나요.','내일 시간이 있으면 만나요.','내일 시간 있으면 만납시다.','내일 시간이 있으면 만나요'],
        hint:'내일, 시간(이) 있다 → 있으면, 만나요' },

      { t:'speak', say:'시간이 있으면 같이 밥 먹어요.', q:'Read aloud naturally:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-15-02',
    title: { ko:'2강. 동시 동작: -(으)면서', en:'Lesson 2. Doing Two Things at Once: -(으)면서' },
    minutes: 6,
    blocks: [
      { t:'text', md:'When one person does **two actions at the same time**, link them with **-(으)면서** (*“while doing...”*):\n- Stem without batchim / ending in ㄹ → **-면서** *(가면서, 만들면서)*\n- Stem with batchim → **-으면서** *(먹으면서, 읽으면서)*' },

      { t:'table', head:['Word','With -(으)면서','Example'], rows:[
        ['음악을 듣다','**들으면서** *(ㄷ irregular!)*','음악을 들으면서 공부해요'],
        ['커피를 마시다','**마시면서**','커피를 마시면서 이야기해요'],
        ['밥을 먹다','**먹으면서**','밥을 먹으면서 TV를 봐요'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'음악을 들으면서 공부해요.', tip:'I study while listening to music.' },
        { ch:'커피를 마시면서 이야기해요.', tip:'We talk while drinking coffee.' },
        { ch:'밥을 먹으면서 TV를 봐요.', tip:'I watch TV while eating food.' },
      ]},

      { t:'choice', q:'How do you say "while listening" with 듣다 (ㄷ irregular)?',
        options:['들으면서','듣으면서','듣면서','들면서'], answer:0,
        why:'Remember from Stage 2: ㄷ irregular becomes ㄹ before a vowel! 듣다 → 들으면서.' },

      { t:'cloze', sentence:'친구와 커피를 [마시면서] 이야기했어요.', answer:'마시면서',
        options:['마시면서','마시고','마셔서','마시면'],
        meaning:'I talked with my friend while drinking coffee.',
        why:'마시다 has no batchim, so it attaches -면서: 마시면서.' },

      { t:'order', q:'Put in order: "I clean my room while listening to music."',
        tokens:['음악을','들으면서','방을','청소해요.'], answer:['음악을','들으면서','방을','청소해요.'] },

      { t:'translate', q:'I listen to music while studying.',
        answers:['공부하면서 음악을 들어요.','음악을 들으면서 공부해요.','공부하면서 음악을 들어요','음악을 들으면서 공부해요'],
        hint:'공부하다 → 공부하면서, 음악을 들어요' },

      { t:'speak', say:'음악을 들으면서 청소해요.', q:'Read aloud:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-15-03',
    title: { ko:'3강. 선택: -거나', en:'Lesson 3. Either / Or: -거나' },
    minutes: 6,
    blocks: [
      { t:'text', md:'To express an **“either / or”** choice between two **verbs or adjectives**, attach **-거나** directly to the stem.\n\n- 주말에 영화를 **보거나** 운동해요. *(On weekends, I watch movies or exercise.)*\n\n**Noun vs Verb “Or”**:\n- Noun + **(이)나**: 커피**나** 차 *(Coffee or tea)*\n- Verb + **-거나**: 마시**거나** 쉬어요 *(Drink or rest)*' },

      { t:'pair', q:'Match nouns with (이)나 and verbs with -거나:', pairs:[
        ['커피나 차', 'Coffee or tea (Noun)'],
        ['먹거나 마셔요', 'Eat or drink (Verb)'],
        ['주말에 쉬거나 놀아요', 'Rest or play (Verb)'],
        ['토요일이나 일요일', 'Saturday or Sunday (Noun)'],
      ]},

      { t:'cloze', sentence:'주말에는 집에서 [쉬거나] 책을 읽어요.', answer:'쉬거나',
        options:['쉬거나','쉬고','쉬어서','쉬지만'],
        meaning:'On weekends, I rest at home or read books.',
        why:'쉬다 (verb) + -거나 = 쉬거나 (rest or...).' },

      { t:'correct', wrong:'주말에 영화를 보나 운동해요.',
        answers:['주말에 영화를 보거나 운동해요.','주말에 영화를 보거나 운동해요'],
        hint:'For verbs, use -거나, not -(이)나 (which is for nouns)!',
        why:'Verbs take -거나 for choices: 보- + -거나 = 보거나.' },

      { t:'translate', q:'On weekends, I rest at home or meet friends.',
        answers:['주말에 집에서 쉬거나 친구를 만나요.','주말에는 집에서 쉬거나 친구를 만나요.','주말에 집에서 쉬거나 친구를 만나요'],
        hint:'주말에, 집에서 쉬다 → 쉬거나, 친구를 만나요' },

      { t:'speak', say:'주말에 집에서 쉬거나 친구를 만나요.', q:'Read aloud clearly:' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-16 — -는데 / -(으)ㄴ데
   한국어 구어 최다 빈출 어미. 초급에서는 "배경 제시(말머리 놓기)"
   하나에 집중하여 질문과 권유를 부드럽게 꺼내는 법을 훈련한다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-16',
  emoji: '🎭',
  title: { ko:'-는데 / -(으)ㄴ데', en:'Setting the Stage: -는데 / -(으)ㄴ데' },
  tagline: { ko:'자연스러운 대화의 시작 — 말머리 놓기', en:'The Korean secret to soft, natural conversation.' },
  blurb: { ko:'한국인이 말할 때 가장 많이 쓰는 연결 어미입니다. 본론이나 질문을 꺼내기 전에 부드럽게 배경을 까는 법을 배웁니다. 초급에서는 가장 유용한 "배경 제시" 하나에 집중합니다.',
           en:'The single most frequently used clause connector in spoken Korean. Learn how native speakers soften their speech and set the background before asking questions or making requests.' },
  level: 'Beginner',
  needs: 'bg-15',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-16-01',
    title: { ko:'1강. 동사의 배경 깔기: -는데', en:'Lesson 1. Background for Verbs: -는데' },
    minutes: 7,
    blocks: [
      { t:'text', md:'Have you noticed native speakers starting sentences with *“…-는데”* before asking a question or making an offer?\n\n- *“지금 마트에 가**는데**, 뭐 필요해요?”* (I am heading to the supermarket, do you need anything?)\n\nFor **all verbs in the present tense**, simply attach **-는데** directly to the stem regardless of batchim! *(Verbs ending in ㄹ drop the ㄹ: 살다 → 사는데)*' },

      { t:'table', head:['Verb','Stem','With -는데','Meaning / Use'], rows:[
        ['가다 (to go)','가-','**가는데**','I am going, so/and...'],
        ['먹다 (to eat)','먹-','**먹는데**','I am eating, so/and...'],
        ['비가 오다 (to rain)','오-','**오는데**','It is raining, so/and...'],
        ['살다 (to live)','살- (ㄹ drop)','**사는데**','I live there, so/and...'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'지금 마트에 가는데, 뭐 필요해요?', tip:'I’m going to the supermarket now, do you need anything?' },
        { ch:'밖에 비가 오는데, 우산 있어요?', tip:'It’s raining outside, do you have an umbrella?' },
        { ch:'지금 점심 먹는데, 같이 먹을래요?', tip:'I’m eating lunch right now, want to join?' },
      ]},

      { t:'choice', q:'Attach the background connector -는데 to 마시다 (to drink):',
        options:['마시는데','마신데','마셔서','마시면'], answer:0,
        why:'All action verbs take -는데: 마시- + -는데 = 마시는데.' },

      { t:'cloze', sentence:'밖에 비가 [오는데], 우산 있어요?', answer:'오는데',
        options:['오는데','와서','오고','오지만'],
        meaning:'It is raining outside, do you have an umbrella?',
        why:'비가 오는데 sets the background before asking the question 우산 있어요?.' },

      { t:'order', q:'Put in order: "I\'m going to the cafe right now, do you want to come along?"',
        tokens:['지금','카페에','가는데,','같이','갈래요?'], answer:['지금','카페에','가는데,','같이','갈래요?'] },

      { t:'translate', q:'I am going to the supermarket right now, do you need anything?',
        answers:['지금 마트에 가는데 뭐 필요해요?','지금 마트에 가는데, 뭐 필요해요?','지금 마트에 가는데 뭐 필요해요'],
        hint:'지금, 마트에 가다 → 가는데, 뭐 필요해요?' },

      { t:'speak', say:'지금 마트에 가는데, 뭐 필요해요?', q:'Read aloud with friendly intonation:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-16-02',
    title: { ko:'2강. 형용사와 명사의 배경: -(으)ㄴ데 / 인데', en:'Lesson 2. Background for Adjectives & Nouns' },
    minutes: 7,
    blocks: [
      { t:'text', md:'While verbs take **-는데**, adjectives and nouns have slightly different endings:\n\n1. **Adjectives** take **-(으)ㄴ데**:\n- No batchim → **-ㄴ데** *(바쁘다 → 바쁜데, 예쁘다 → 예쁜데)*\n- Has batchim → **-은데** *(좋다 → 좋은데, 작다 → 작은데)*\n- **ㅂ irregular** → **-운데** *(춥다 → 추운데, 덥다 → 더운데)*\n\n2. **Nouns** take **인데** *(학생인데, 일요일인데)*\n3. **있다 / 없다** take **-는데** *(있는데, 없는데)*' },

      { t:'table', head:['Word','Category','With Connector'], rows:[
        ['좋다 (good)','Adjective with batchim','**좋은데** (It is good, so...)'],
        ['바쁘다 (busy)','Adjective without batchim','**바쁜데** (I am busy, but/so...)'],
        ['춥다 (cold)','ㅂ irregular adjective','**추운데** (It is cold, so...)'],
        ['학생 (student)','Noun','**학생인데** (I am a student, and...)'],
        ['시간이 있다','있다 verb form','**있는데** (I have time, so...)'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'오늘 날씨가 정말 좋은데, 산책할까요?', tip:'The weather is really nice today, shall we take a walk?' },
        { ch:'지금 조금 바쁜데, 10분 뒤에 만나요.', tip:'I’m a bit busy right now, let’s meet in 10 minutes.' },
        { ch:'내일 일요일인데, 뭐 해요?', tip:'Tomorrow is Sunday, what are you doing?' },
      ]},

      { t:'choice', q:'How do you attach the background connector to 덥다 (ㅂ irregular)?',
        options:['더운데','덥은데','덥는데','더운'], answer:0,
        why:'덥다 is a ㅂ irregular adjective! ㅂ changes to 우, so 덥- + -(으)ㄴ데 = 더운데.' },

      { t:'cloze', sentence:'오늘 날씨가 정말 [좋은데], 나갈까요?', answer:'좋은데',
        options:['좋은데','좋는데','좋아서','좋으면'],
        meaning:'The weather is really nice today, shall we go out?',
        why:'좋다 is an adjective with batchim, so it takes -은데: 좋은데.' },

      { t:'correct', wrong:'오늘 날씨가 덥는데 에어컨을 켜요.',
        answers:['오늘 날씨가 더운데 에어컨을 켜요.','오늘 날씨가 더운데 에어컨을 켜요'],
        hint:'덥다 is an adjective with ㅂ irregular: 덥다 → 더운데 (not 덥는데)!',
        why:'Adjective 덥다 becomes 더운데: 오늘 날씨가 더운데 에어컨을 켜요.' },

      { t:'translate', q:'The weather is really good today, shall we take a walk?',
        answers:['오늘 날씨가 정말 좋은데, 산책할까요?','오늘 날씨가 좋은데 산책할까요?','오늘 날씨가 정말 좋은데 산책할까요?','오늘 날씨가 정말 좋은데, 산책할까요'],
        hint:'오늘 날씨가 정말 좋다 → 좋은데, 산책할까요?' },

      { t:'speak', say:'오늘 날씨가 정말 좋은데, 산책할까요?', q:'Read aloud:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-16-03',
    title: { ko:'3강. 대화가 부드러워지는 마법', en:'Lesson 3. Natural Conversational Flow' },
    minutes: 7,
    blocks: [
      { t:'text', md:'In Korean culture, direct refusals (*“I can’t go”*) can sound harsh. **-는데 / -(으)ㄴ데** is the native speaker’s magic key to softening their speech:\n\n- *“가고 싶**은데**, 오늘은 약속이 있어요.”* (I want to go, but I have plans today.)\n\nIt cushions the refusal and gives context before stating the conflict.' },

      { t:'table', head:['Direct / Blunt','Softened with -는데','Why it feels natural'], rows:[
        ['안 가요 (I won\'t go)','가고 싶**은데**, 약속이 있어요','Softens refusal with desire'],
        ['밥 먹어요 (Eat food)','점심 먹고 싶**은데**, 같이 갈래요?','Gentle suggestion with background'],
        ['돈 없어요 (No money)','시간은 많**은데**, 돈이 없어요','Contrasts facts gently'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'가고 싶은데, 오늘은 약속이 있어요.', tip:'I want to go, but I have plans today.' },
        { ch:'점심을 먹고 싶은데, 같이 갈래요?', tip:'I want to eat lunch, do you want to go together?' },
        { ch:'시간은 많은데, 돈이 없어요.', tip:'I have plenty of time, but no money.' },
      ]},

      { t:'choice', q:'Which sentence sounds the most polite and natural for declining an invitation?',
        options:['가고 싶은데, 오늘은 못 가요.','안 가요.','가고 싶어서 오늘은 못 가요.','가고 싶으면 오늘은 못 가요.'], answer:0,
        why:'-는데 softens the refusal by explaining your feeling before the obstacle.' },

      { t:'cloze', sentence:'점심을 먹고 [싶은데], 같이 갈래요?', answer:'싶은데',
        options:['싶은데','싶는데','싶어서','싶으면'],
        meaning:'I want to have lunch, do you want to go together?',
        why:'-고 싶다 is an adjective form, so it takes -은데: 싶- + -은데 = 싶은데.' },

      { t:'build', q:'Build: "I want to buy clothes, where should I go?"',
        answers:['옷을 사고 싶은데 어디로 갈까요?','옷을 사고 싶은데, 어디로 갈까요?'],
        bank:['옷을','사고','싶은데,','어디로','갈까요?','샀어요.'],
        must:['사고','싶은데'] },

      { t:'translate', q:'I want to have lunch, do you want to go together?',
        answers:['점심을 먹고 싶은데 같이 갈래요?','점심을 먹고 싶은데, 같이 갈래요?','점심을 먹고 싶은데 같이 갈래요'],
        hint:'점심을 먹고 싶다 → 먹고 싶은데, 같이 갈래요?' },

      { t:'speak', say:'점심을 먹고 싶은데, 같이 갈래요?', q:'Read aloud with natural emotion:' },
    ],
  },

  ],
},

];
