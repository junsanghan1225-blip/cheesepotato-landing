/* ══════════════════════════════════════════════════════════════
   초급 6단계 — 다듬기
   ──────────────────────────────────────────────────────────────
   설계는 docs/curriculum-beginner.md §3, §4 (6단계) 에 있다.
   bg-27 은 이 커리큘럼 전체의 **클라이맥스**다.

   ── 설명은 영어, 예문은 한국어 ──────────────────────────────
   초급 학습자의 인지 부하를 줄이기 위해 설명과 힌트는 영어로,
   연습 문장과 선택지는 자연스러운 한국어로 작성한다.

   ── 코스 구성 ───────────────────────────────────────────────
   - bg-27: 열쇠 하나였다 — -(으)ㄴ / -는 / -(으)ㄹ (3강)
   ══════════════════════════════════════════════════════════════ */

export const BEGINNER_STAGE6_COURSES = [

/* ═══════════════════════════════════════════════════════════════
   bg-27 — 열쇠 하나였다 — -(으)ㄴ / -는 / -(으)ㄹ
   2~5단계에서 덩어리로 써 온 수많은 문법들의 진짜 정체(관형형)를
   밝히고, 세상의 모든 명사를 수식하는 자유를 손에 쥔다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-27',
  emoji: '🗝️',
  title: { ko:'열쇠 하나였다 — -(으)ㄴ / -는 / -(으)ㄹ', en:'The Master Key: -(으)ㄴ / -는 / -(으)ㄹ' },
  tagline: { ko:'수많은 문법을 꿰뚫는 단 하나의 열쇠', en:'The single master key that connects everything you’ve learned.' },
  blurb: { ko:'2~5단계에서 덩어리로 외워 썼던 수많은 표현들이 사실은 모두 단 하나의 규칙(관형형)이었습니다. 동사와 형용사가 명사를 꾸미는 원리를 깨닫고, 원하는 문장을 자유자재로 조립해 봅니다.',
           en:'The countless grammar chunks you memorized across Stages 2–5 actually sprang from a single elegant rule: noun modifiers (관형형). Discover the secret connecting them all and learn to build relative clauses freely.' },
  level: 'Beginner',
  needs: 'bg-26',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-27-01',
    title: { ko:'1강. 이름 붙이기: 관형형의 발견', en:'Lesson 1. Naming the Key: The Noun-Modifying Form' },
    minutes: 7,
    blocks: [
      { t:'text', md:'Remember **비가 온 것 같아요 / 오는 것 같아요 / 올 것 같아요** back in Stage 5?\n\nWe promised that the secret behind those three different verb shapes would be revealed here in Stage 6. **Here is the secret you have been waiting for!**\n\nIn English, when you want an action to describe a noun, you put words behind it: *“the book [that I bought]”* or *“the music [that I listen to]”*.\n\nIn Korean, verbs do something much more direct and elegant: they transform their ending and sit **directly in front of the noun**, acting like a descriptive modifier!\n\nThis form is called the **Noun-Modifying Form** (in Korean grammar: **관형형 / Gwanhyeong-hyeong**).' },

      { t:'note', md:'**Why is this called the Master Key?**\n\nBecause once a verb or adjective puts on this modifying shape, it can describe **any noun that follows it**—and as you will discover in the very next lesson, this single key is the hidden foundation underneath almost every major pattern you’ve learned so far!' },

      { t:'table', head:['Tense (시제)','Modifier Attached to Verb','Verb: 가다 (to go)','Verb: 먹다 (to eat)','Example Phrase'], rows:[
        ['과거 (Past)','**-(으)ㄴ**','**간** (went / that went)','**먹은** (ate / that ate)','어제 **간** 카페 (cafe I went to)'],
        ['현재 (Present)','**-는**','**가는** (goes / that goes)','**먹는** (eats / that eats)','자주 **가는** 카페 (cafe I often go to)'],
        ['미래/추측 (Future)','**-(으)ㄹ**','**갈** (will go / to go)','**먹을** (will eat / to eat)','내일 **갈** 카페 (cafe I will go to)'],
      ]},

      { t:'text', md:'**What about Adjectives (형용사)?**\n\nAdjectives already describe an existing state or quality, so their **present** state naturally takes **-(으)ㄴ** (exactly as you already know from everyday phrases!):\n\n- **좋다** (good) → **좋은** 날씨 (good weather)\n- **작다** (small) → **작은** 가방 (a small bag)\n- **예쁘다** (pretty) → **예쁜** 옷 (pretty clothes)\n- **바쁘다** (busy) → **바쁜** 사람 (a busy person)\n- **맵다** (spicy, ㅂ irreg) → **매운** 음식 (spicy food)' },

      { t:'chars', wide:true, items:[
        { ch:'어제 먹은 음식', tip:'The food I ate yesterday (Past: 먹다 + -은)' },
        { ch:'지금 듣는 노래', tip:'The song I am listening to right now (Present: 듣다 + -는)' },
        { ch:'내일 만날 친구', tip:'The friend I will meet tomorrow (Future: 만나다 + -ㄹ)' },
      ]},

      { t:'choice', q:'Which phrase means "the coffee I drank yesterday" from 마시다 (to drink)?',
        options:['어제 마신 커피','어제 마시는 커피','어제 마실 커피','어제 마셨 커피'], answer:0,
        why:'For a past action modifying a noun, attach -(으)ㄴ: 마시- + -ㄴ = 마신 커피. (마시는 is present, 마실 is future, and 마셨 cannot directly modify a noun).' },

      { t:'choice', q:'You look at your screen right now. How do you describe "the video I am watching right now" from 보다?',
        options:['지금 보는 영상','지금 본 영상','지금 볼 영상','지금 봐는 영상'], answer:0,
        why:'An ongoing present action modifying a noun takes -는: 보- + -는 = 지금 보는 영상. (본 is past "watched", 볼 is future "will watch").' },

      { t:'cloze', sentence:'어제 친구하고 [본] 영화가 정말 재미있었어요.', answer:'본',
        options:['본','보는','볼','봤는'],
        meaning:'The movie I watched with my friend yesterday was really fun.',
        why:'A completed past action modifying a noun takes -(으)ㄴ: 보- + -ㄴ = 본 영화.' },

      { t:'pair', q:'Match each tense with the modifier form for the verb 읽다 (to read):', pairs:[
        ['Past: Book I read', '어제 읽은 책'],
        ['Present: Book I am reading', '지금 읽는 책'],
        ['Future: Book I will read', '내일 읽을 책'],
      ]},

      { t:'order', q:'Put in order: "I have a person I will meet tomorrow."',
        tokens:['내일','만날','사람이','있어요.'], answer:['내일','만날','사람이','있어요.'] },

      { t:'correct', wrong:'어제 산는 옷이 아주 마음에 들어요.',
        answers:['어제 산 옷이 아주 마음에 들어요.','어제 산 옷이 아주 마음에 들어요'],
        hint:'For a completed past action modifying a noun, use -(으)ㄴ: 사다 → 어제 산 옷',
        why:'Past modifier for 사다 is 산 (사- + -ㄴ): 어제 산 옷이 아주 마음에 들어요.' },

      { t:'translate', q:'The food I ate yesterday was really delicious.',
        answers:['어제 먹은 음식이 정말 맛있었어요.','어제 먹은 음식이 정말 맛있었어요'],
        must:['먹은','음식이'],
        hint:'어제, 먹다 → 먹은 음식, 정말 맛있었어요' },

      { t:'speak', say:'어제 본 영화가 정말 재미있었어요.', q:'Read aloud noticing the past modifier 본:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-27-02',
    title: { ko:'2강. 이게 다 같은 조각이었다: 8개 문법의 정체', en:'Lesson 2. The Grand Reveal: It Was the Same Piece All Along' },
    minutes: 8,
    blocks: [
      { t:'text', md:'Take a deep breath and look back at your journey from Stage 2 through Stage 5. You learned so many essential Korean expressions:\n\n- **-(으)ㄹ 거예요** *(Future: I will do)*\n- **-(으)ㄹ 때** *(Time: When I do)*\n- **-(으)ㄹ 수 있다** *(Ability: I can do)*\n- **-(으)ㄹ까요** *(Question / Suggestion: Shall we?)*\n- **-(으)ㄹ게요** *(Promise / Intention: I will)*\n- **-(으)ㄴ 후에** *(Sequence: After doing)*\n- **-(으)ㄴ 적이 있다** *(Experience: I have done)*\n- **-는 것 같다** *(Conjecture: It seems like)*\n\nDid it feel like Korean was an endless sea of separate, complicated endings to memorize? **Prepare to see the entire language in a completely new light.**' },

      { t:'note', md:'**You did NOT memorize 8 different grammar rules.**\n\nEvery single one of those expressions is just the **Noun-Modifying Form** snapping directly onto a noun!\n\n- `때` is literally a noun meaning **“time / moment”**.\n- `수` is a noun meaning **“way / ability / means”**.\n- `후(後)` is a noun meaning **“after / following”**.\n- `적` is a noun meaning **“past instance / occasion”**.\n- `것` is a noun meaning **“thing / fact / appearance”** (and `거예요` is just `것이에요` spoken quickly!).' },

      { t:'table', head:['Grammar Pattern','Modifier Piece','Noun / Ending Behind It','What It Literally Means'], rows:[
        ['**-(으)ㄹ 거예요** (Future)','**-(으)ㄹ** (future modifier)','**것** (thing) + **이에요** (is)','“It is a thing that will happen”'],
        ['**-(으)ㄹ 때** (When)','**-(으)ㄹ** (future/contingent modifier)','**때** (time / moment)','“At the time of doing”'],
        ['**-(으)ㄹ 수 있다** (Can)','**-(으)ㄹ** (potential modifier)','**수** (way / means) + **있다** (exists)','“A way to do it exists”'],
        ['**-(으)ㄹ까요** (Shall we?)','**-(으)ㄹ** (future modifier)','**까** (question) + **요** (polite)','“Will it happen? / Shall we?”'],
        ['**-(으)ㄹ게요** (I will)','**-(으)ㄹ** (future modifier)','**게요** (promise ending)','“I promise that I will do”'],
        ['**-(으)ㄴ 후에** (After)','**-(으)ㄴ** (past modifier)','**후** (after) + **에** (at)','“At the time after having done”'],
        ['**-(으)ㄴ 적이 있다** (Experience)','**-(으)ㄴ** (past modifier)','**적** (past occasion) + **이 있다** (exists)','“A past instance of doing exists”'],
        ['**-는 것 같다** (Conjecture)','**-는** (present modifier)','**것** (appearance) + **같다** (is alike)','“It is like the thing happening”'],
      ]},

      { t:'text', md:'Look at that table again. **Everything connects!**\n\n- When you said *“갈 거예요”*, you were literally saying **[to go + thing + is]**.\n- When you said *“먹을 때”*, you were saying **[to eat + time]**.\n- When you said *“한국에 간 적이 있어요”*, you were saying **[to Korea + gone + occasion + exists]**.\n\nKorean isn’t a chaotic web of random endings. It is a breathtakingly logical set of **LEGO blocks** built on the noun-modifying system!' },

      { t:'chars', wide:true, items:[
        { ch:'갈 거예요 = 갈 (modifier) + 것 (thing) + 이에요', tip:'Future: literally "it is a going-thing"' },
        { ch:'먹을 때 = 먹을 (modifier) + 때 (time)', tip:'Time: literally "eating-time"' },
        { ch:'간 적이 있어요 = 간 (modifier) + 적 (occasion) + 이 있어요', tip:'Experience: literally "gone-occasion exists"' },
        { ch:'오는 것 같아요 = 오는 (modifier) + 것 (appearance) + 같아요', tip:'Conjecture: literally "resembles coming-thing"' },
      ]},

      { t:'choice', q:'In the sentence "한국에 간 적이 있어요" (I have been to Korea), what is "간"?',
        options:['Past modifier of 가다 (가- + -ㄴ) modifying the noun 적','Present modifier of 가다 modifying the verb 있어요','A completely irregular standalone connector','An imperative verb command meaning "Go!"'], answer:0,
        why:'간 is the past modifier of 가다 (가- + -ㄴ) modifying the noun 적 (past occasion): "a past occasion of having gone exists".' },

      { t:'choice', q:'What noun is literally hiding inside the future expression "갈 거예요" (I will go)?',
        options:['것 (thing / fact: 갈 것이에요 → 갈 거예요)','때 (time: 갈 때)','수 (ability / way: 갈 수)','적 (experience: 갈 적)'], answer:0,
        why:'거예요 is a spoken contraction of 것 (thing/fact) + 이에요 (is). 갈 거예요 literally means "it is a thing to go".' },

      { t:'choice', q:'Why does "밥을 먹은 후에" mean "AFTER eating a meal"?',
        options:['Because past modifier -(으)ㄴ attaches to 먹다 before 후 (after)','Because -은 후에 is an irregular future marker','Because 후 is a verb meaning "to eat quickly"','Because -은 is an imperative ending'], answer:0,
        why:'먹은 is the past modifier of 먹다 (completed action) modifying 후 (after): "at the time after having eaten".' },

      { t:'cloze', sentence:'수업이 [끝난 후에] 같이 점심 먹을까요?', answer:'끝난 후에',
        options:['끝난 후에','끝나는 후에','끝날 후에','끝나서 후에'],
        meaning:'After class ends, shall we eat lunch together?',
        why:'Past modifier -(으)ㄴ attaches to 끝나다 before 후에: 끝난 후에.' },

      { t:'order', q:'Put in order: "I have the ability to read Korean."',
        tokens:['한국어를','읽을','수','있어요.'], answer:['한국어를','읽을','수','있어요.'] },

      { t:'correct', wrong:'시간이 있는 때 같이 커피 마셔요.',
        answers:['시간이 있을 때 같이 커피 마셔요.','시간이 있을 때 같이 커피 마셔요'],
        hint:'The modifier used with 때 (when) is -(으)ㄹ: 있다 → 있을 때',
        why:'The time pattern for "~할 때" uses the prospective modifier -(으)ㄹ: 시간이 있을 때.' },

      { t:'translate', q:'It seems to be raining right now.',
        answers:['지금 비가 오는 것 같아요.','지금 비 오는 것 같아요.','지금 비가 오는 것 같아요'],
        must:['오는','것','같아요'],
        hint:'지금, 비가 오다 → 오는 것 같아요' },

      { t:'speak', say:'수업이 끝난 후에 같이 점심 먹을까요?', q:'Read aloud naturally, recognizing both -ㄴ 후에 and -(으)ㄹ까요:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-27-03',
    title: { ko:'3강. 이제 직접 만든다: 세상 모든 명사 꾸미기', en:'Lesson 3. Creating Your Own: Modifying Any Noun Freely' },
    minutes: 8,
    blocks: [
      { t:'text', md:'Up until today, you only saw noun modifiers trapped inside fixed formulas: *거예요, 때, 수 있다, 것 같다, 후에*.\n\n**Now you are completely free.**\n\nYou know how to turn any verb into a past **-(으)ㄴ**, present **-는**, or future **-(으)ㄹ** modifier. That means **you can place them in front of ANY noun in the entire Korean language!**\n\nLook at how you can build real-world relative clauses:\n\n- **과거 (Past)**: *“제가 어제 **산** 책”* *(The book I bought yesterday)*\n- **현재 (Present)**: *“지금 **먹는** 음식”* *(The food I am eating right now)*\n- **미래 (Future)**: *“내일 **갈** 곳”* *(The place I will go tomorrow)*' },

      { t:'note', md:'**Feel the leap in your fluency!**\n\nBefore today, to express two related thoughts, you had to say two choppy sentences:\n*“어제 책을 샀어요. 그 책이 재미있어요.”* *(I bought a book yesterday. That book is fun.)*\n\nNow, you can combine them into a single, elegant sentence:\n*“**어제 산 책이** 재미있어요!”* *(The book I bought yesterday is fun!)*\n\nThis is the single biggest turning point from survival-phrase Korean into true conversational fluency.' },

      { t:'table', head:['Time / Tense','Modifier Formula','Verb','Modified Noun Phrase','English Meaning'], rows:[
        ['과거 (Past)','**-(으)ㄴ + 명사**','사다 (to buy)','어제 **산** 책','The book I bought yesterday'],
        ['과거 (Past)','**-(으)ㄴ + 명사**','만나다 (to meet)','어제 **만난** 사람','The person I met yesterday'],
        ['현재 (Present)','**-는 + 명사**','먹다 (to eat)','지금 **먹는** 음식','The food I am eating now'],
        ['현재 (Present)','**-는 + 명사**','듣다 (to listen)','자주 **듣는** 노래','The song I often listen to'],
        ['미래 (Future)','**-(으)ㄹ + 명사**','가다 (to go)','내일 **갈** 곳','The place I will go tomorrow'],
        ['미래 (Future)','**-(으)ㄹ + 명사**','보다 (to watch)','주말에 **볼** 영화','The movie I will watch on the weekend'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'제가 어제 산 책이에요.', tip:'This is the book I bought yesterday.' },
        { ch:'지금 듣는 노래가 뭐예요?', tip:'What is the song you are listening to right now?' },
        { ch:'내일 만날 사람이 있어요.', tip:'I have a person to meet tomorrow.' },
        { ch:'내가 좋아하는 음식은 떡볶이예요.', tip:'The food that I like the most is tteokbokki.' },
      ]},

      { t:'choice', q:'How do you say "The movie I watched yesterday was interesting"?',
        options:['어제 본 영화가 재미있었어요.','어제 보는 영화가 재미있었어요.','어제 볼 영화가 재미있었어요.','어제 봤 영화가 재미있었어요.'], answer:0,
        why:'Modifying a noun with a completed past action (어제) takes -(으)ㄴ: 보- + -ㄴ = 본 영화. (보는 is present, 볼 is future, and 봤 cannot directly modify a noun).' },

      { t:'choice', q:'You see a friend listening to music with headphones. How do you ask: "What is the song you are listening to right now?"',
        options:['지금 듣는 노래가 뭐예요?','지금 들은 노래가 뭐예요?','지금 들을 노래가 뭐예요?','지금 들어 노래가 뭐예요?'], answer:0,
        why:'An ongoing present action modifying a noun takes -는: 듣- + -는 = 듣는 노래. (들은 is past, 들을 is future).' },

      { t:'choice', q:'How do you say "I have a place I will go tomorrow"?',
        options:['내일 갈 곳이 있어요.','내일 가는 곳이 있어요.','내일 간 곳이 있어요.','내일 가서 곳이 있어요.'], answer:0,
        why:'A future destination modifying 곳 (place) takes -(으)ㄹ: 가- + -ㄹ = 갈 곳. (가는 is present, 간 is past).' },

      { t:'cloze', sentence:'내가 가장 [좋아하는 음식]은 떡볶이예요.', answer:'좋아하는 음식',
        options:['좋아하는 음식','좋아한 음식','좋아할 음식','좋아서 음식'],
        meaning:'The food that I like the most is tteokbokki.',
        why:'General present preference modifying 음식 takes -는: 좋아하- + -는 = 좋아하는 음식.' },

      { t:'order', q:'Put in order: "This is the coffee I drink every morning."',
        tokens:['이건','제가','매일','마시는','커피예요.'], answer:['이건','제가','매일','마시는','커피예요.'] },

      { t:'build', q:'Build the phrase: "the book I bought yesterday"',
        answers:['어제 산 책'],
        bank:['어제','산','책','사는','살','옷'],
        must:['산','책'],
        hint:'어제, 사다 → 산 책',
        why:'Past modifier for 사다 is 산 (사- + -ㄴ) modifying 책: 어제 산 책.' },

      { t:'build', q:'Build the sentence: "What is the place we will go tomorrow?"',
        answers:['내일 갈 곳이 어디예요?','내일 갈 곳이 어디예요'],
        bank:['내일','갈','곳이','어디예요?','가는','간','사람이'],
        must:['갈','곳이'],
        hint:'내일, 가다 → 갈 곳, 어디예요?',
        why:'Future modifier for 가다 is 갈 (가- + -ㄹ) modifying 곳: 내일 갈 곳이 어디예요?' },

      { t:'correct', wrong:'지금 내가 읽은 책이 정말 재미있어요.',
        answers:['지금 내가 읽는 책이 정말 재미있어요.','지금 내가 읽는 책이 정말 재미있어요'],
        hint:'For an action happening right now (지금), use present modifier -는: 읽는 책',
        why:'Present action modifying a noun takes -는: 지금 내가 읽는 책이 정말 재미있어요.' },

      { t:'correct', wrong:'어제 만나는 사람이 제 친구예요.',
        answers:['어제 만난 사람이 제 친구예요.','어제 만난 사람이 제 친구예요'],
        hint:'For someone you met yesterday (어제), use past modifier -(으)ㄴ: 만난 사람',
        why:'Past action modifying a noun uses -(으)ㄴ: 어제 만난 사람이 제 친구예요.' },

      { t:'translate', q:'The coffee I drank yesterday was really delicious.',
        answers:['어제 마신 커피가 정말 맛있었어요.','어제 마신 커피가 정말 맛있었어요'],
        must:['마신','커피가'],
        hint:'어제, 마시다 → 마신 커피, 정말 맛있었어요',
        why:'Past modifier is 마신: 어제 마신 커피가 정말 맛있었어요.' },

      { t:'translate', q:'What is the song you are listening to right now?',
        answers:['지금 듣는 노래가 뭐예요?','지금 듣는 노래가 뭐예요','지금 듣는 음악이 뭐예요?','지금 듣는 음악이 뭐예요'],
        must:['지금','듣는'],
        hint:'지금, 듣다 → 듣는 노래/음악, 뭐예요?',
        why:'Present modifier is 듣는: 지금 듣는 노래가 뭐예요?' },

      { t:'speak', say:'제가 어제 산 책이 정말 재미있어요.', q:'Read aloud with confidence, using your brand-new relative clause:' },
    ],
  },

  ],
},

];
