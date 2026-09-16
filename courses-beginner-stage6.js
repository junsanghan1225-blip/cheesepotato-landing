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
   - bg-28: 격식 -ㅂ/습니다 (2강)
   - bg-29: 높임 -(으)시- · 께 · 께서 (3강)
   - bg-30: 반응 -네요 · -군요 · -지요 (3강)
   - bg-31: 남은 조사 ① 사람과 방향 (3강)
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

/* ═══════════════════════════════════════════════════════════════
   bg-28 — 격식 -ㅂ/습니다
   공적인 자리, 발표, 뉴스, 안내 방송에서 쓰이는 격식체(합쇼체).
   -ㅂ/습니다(평서), -ㅂ/습니까(의문), -(으)십시오(명령).
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-28',
  emoji: '🎙️',
  title: { ko:'격식 -ㅂ/습니다', en:'Formal Register: -ㅂ/습니다' },
  tagline: { ko:'공적인 자리와 공식 방송에서의 격식 있는 한국어', en:'Polite formal speech for announcements, news, and presentations.' },
  blurb: { ko:'학습자가 익혀 온 일상적 해요체(-아/어요)를 넘어, 뉴스·발표·면접·안내 방송 등 공적인 자리에서 쓰이는 격식체(합쇼체)의 평서문(-ㅂ/습니다), 의문문(-ㅂ/습니까), 명령문(-(으)십시오)을 배웁니다.',
           en:'Beyond everyday conversation (-아/어요), discover the formal register (합쇼체) used in news, presentations, interviews, and public broadcasts: statements (-ㅂ/습니다), questions (-ㅂ/습니까), and formal commands (-(으)십시오).' },
  level: 'Beginner',
  needs: 'bg-27',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-28-01',
    title: { ko:'1강. 언제 쓰는지부터: -ㅂ/습니다 와 -ㅂ/습니까?', en:'Lesson 1. Setting the Stage: Formal Statements & Questions' },
    minutes: 7,
    blocks: [
      { t:'text', md:'Throughout Stages 1 through 5, you learned **해요체** (*-아/어요*). It is warm, natural, and standard for everyday conversation.\n\nNow, meet **합쇼체 (격식체 / Formal Register)**: **-ㅂ니다 / -습니다**.\n\n**Is 격식체 "more polite" than 해요체?**\n**Not at all!** They are not higher or lower in politeness. **They belong to completely different settings**:\n\n- **격식체 (Formal Register)**: Used in public, official, impersonal settings — TV news, presentations, job interviews, the military, airport and subway announcements, and business meetings.\n- **해요체 (Informal Polite)**: Used in daily, personal settings — talking with coworkers, restaurant staff, friends, and casual polite chats.' },

      { t:'note', md:'**How to Conjugate -ㅂ/습니다 (Statements) & -ㅂ/습니까? (Questions)**\n\nThe rule is completely determined by whether the stem ends in a vowel or a consonant (batchim):\n\n- **Stem without batchim** → **-ㅂ니다** / **-ㅂ니까?** *(가다 → 갑니다 / 갑니까?)*\n- **Stem with batchim** → **-습니다** / **-습니까?** *(먹다 → 먹습니다 / 먹습니까?)*\n- **ㄹ irregular** → drop `ㄹ` and add **-ㅂ니다** *(살다 → 삽니다, 만들다 → 만듭니다)*\n- **Noun + 이에요/예요** → **-(이)ㅂ니다** *(학생입니다, 의사입니다)*' },

      { t:'table', head:['Type','Word','Statement (-ㅂ/습니다)','Question (-ㅂ/습니까?)','English Meaning'], rows:[
        ['No batchim','가다 (to go)','**갑니다**','**갑니까?**','Goes / Does [one] go?'],
        ['No batchim','하다 (to do)','**합니다**','**합니까?**','Does / Does [one] do?'],
        ['With batchim','먹다 (to eat)','**먹습니다**','**먹습니까?**','Eats / Does [one] eat?'],
        ['With batchim','좋다 (good)','**좋습니다**','**좋습니까?**','Good / Is it good?'],
        ['ㄹ irregular','살다 (to live)','**삽니다**','**삽니까?**','Lives / Does [one] live?'],
        ['Noun','학생 (student)','**학생입니다**','**학생입니까?**','Am/is student / Is [one] a student?'],
      ]},

      { t:'note', md:'**Pronunciation Tip: -ㅂ니다 sounds like [ㅁ니다]!**\n\nWhen `ㅂ` comes directly before `ㄴ`, it nasalizes into an [m] sound. That’s why **갑니다** is pronounced as [감니다], and **합니다** is pronounced as [함니다]!' },

      { t:'chars', wide:true, items:[
        { ch:'처음 뵙겠습니다. 만나서 반갑습니다.', tip:'Nice to meet you for the first time. (Formal interview / meeting)' },
        { ch:'지금 뉴스를 시작하겠습니다.', tip:'We will now begin the news broadcast.' },
        { ch:'질문이 있습니까?', tip:'Do you have any questions? (Formal presentation Q&A)' },
      ]},

      { t:'choice', q:'Which setting is MOST appropriate for using 격식체 (-ㅂ/습니다) rather than 해요체 (-아/어요)?',
        options:['A formal job interview or business presentation','Ordering an iced americano at a neighborhood cafe','Chatting casually over lunch with a coworker','Sending a quick text message to a friend'], answer:0,
        why:'격식체 (-ㅂ/습니다) is used in public, formal situations like interviews and presentations. Cafes, casual lunches, and text chats use conversational 해요체 (-아/어요).' },

      { t:'choice', q:'How do you say "I am a university student" in the formal register?',
        options:['대학생입니다.','대학생이에요.','대학생이야.','대학생입니까.'], answer:0,
        why:'In the formal register, Noun + -입니다: 대학생입니다. (대학생이에요 is conversational 해요체, 대학생이야 is casual 반말, and 입니까 is a question).' },

      { t:'choice', q:'In a presentation Q&A, how do you formally ask: "Do you have any questions?" from 있다?',
        options:['질문이 있습니까?','질문이 있어요?','질문이 있습니까.','질문이 있나요?'], answer:0,
        why:'For stems with batchim, the formal question ending is -습니까?: 질문이 있습니까? (있어요? is conversational, 있습니까. lacks a question mark).' },

      { t:'cloze', sentence:'처음 뵙겠습니다. 만나서 [반갑습니다].', answer:'반갑습니다',
        options:['반갑습니다','반갑어요','반가워요','반갑니다'],
        meaning:'Nice to meet you for the first time. (Standard formal greeting)',
        why:'반갑다 has batchim ㅂ, which retains its consonant before -습니다: 반갑- + -습니다 = 반갑습니다.' },

      { t:'order', q:'Put in order: "I like Korean food." (Formal statement)',
        tokens:['저는','한국','음식을','좋아합니다.'], answer:['저는','한국','음식을','좋아합니다.'] },

      { t:'pair', q:'Match the informal polite (해요체) form with its formal (합쇼체) equivalent:', pairs:[
        ['가요', '갑니다'],
        ['먹어요', '먹습니다'],
        ['해요', '합니다'],
        ['학생이에요', '학생입니다'],
      ]},

      { t:'correct', wrong:'저는 서울에 살습니다.',
        answers:['저는 서울에 삽니다.','저는 서울에 삽니다'],
        hint:'For ㄹ-stem verbs like 살다, the ㄹ drops before -ㅂ니다: 살다 → 삽니다',
        why:'ㄹ irregular: 살다 drops ㄹ when meeting -ㅂ니다, becoming 삽니다: 저는 서울에 삽니다.' },

      { t:'translate', q:'Translate to formal Korean (-ㅂ/습니다): "We will start the presentation now."',
        answers:['지금 발표를 시작하겠습니다.','지금 발표를 시작하겠습니다'],
        hint:'지금, 발표를 시작하다 → 시작하겠습니다' },

      { t:'speak', say:'처음 뵙겠습니다. 만나서 반갑습니다.', q:'Read aloud with crisp, polite formal pronunciation [반갑씀니다]:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-28-02',
    title: { ko:'2강. -(으)십시오 와 해요체 ↔ 격식체 전환', en:'Lesson 2. Formal Commands & Register Switching' },
    minutes: 8,
    blocks: [
      { t:'text', md:'In daily life, you learned to make requests or give polite directions with **-(으)세요** (*“여기에 앉으세요”*).\n\nIn public transit, airport broadcasts, official signs, and formal service, you will encounter the **formal imperative: -(으)십시오**:\n\n- **Stem without batchim** → **-십시오** *(타다 → 타십시오 = Please board)*\n- **Stem with batchim** → **-으십시오** *(앉다 → 앉으십시오 = Please take a seat)*\n- **Formal Prohibition** → **-지 마십시오** *(사진을 찍지 마십시오 = Please do not take photos)*' },

      { t:'table', head:['Situation / Usage','Conversational (-아/어요 / -세요)','Formal Public (-ㅂ/습니다 / -(으)십시오)'], rows:[
        ['Introduce oneself','저는 마이클이에요.','**저는 마이클입니다.**'],
        ['Ask destination','어디에 가요?','**어디에 갑니까?**'],
        ['Compliment food','정말 맛있어요.','**정말 맛있습니다.**'],
        ['Tell someone to sit','여기에 앉으세요.','**자리에 앉으십시오.**'],
        ['Prohibit entering','들어오지 마세요.','**들어오지 마십시오.**'],
      ]},

      { t:'note', md:'**Mastering the Switch!**\n\nA fluent Korean speaker knows when to flip the switch between conversational warmth (**해요체**) and public dignity (**격식체**).\n\n- Presenting slides to an audience: *“오늘 발표를 시작하겠습니다.”* (Formal)\n- Chatting with attendees during coffee break: *“커피 드시면서 이야기해요.”* (Conversational)' },

      { t:'chars', wide:true, items:[
        { ch:'출입문이 닫힙니다. 뒤로 물러서 주십시오.', tip:'Subway announcement: The doors are closing. Please step back.' },
        { ch:'좌석에 앉아 주십시오.', tip:'Flight broadcast: Please be seated.' },
        { ch:'박물관 안에서는 사진을 찍지 마십시오.', tip:'Museum sign: Please do not take photographs inside the museum.' },
      ]},

      { t:'choice', q:'You hear a subway announcement: "The doors are closing. Please step back." Which command form is used?',
        options:['뒤로 물러서십시오.','뒤로 물러서세요.','뒤로 물러서요.','뒤로 물러서라.'], answer:0,
        why:'Official public transit announcements use the formal command -(으)십시오: 뒤로 물러서십시오. (-세요 is conversational polite, -라 is plain non-honorific).' },

      { t:'choice', q:'How would a museum sign formally say "Please do not touch"?',
        options:['만지지 마십시오.','만지지 마세요.','만지지 않아요.','만지지 못해요.'], answer:0,
        why:'Formal public prohibitions use -지 마십시오: 만지지 마십시오. (-지 마세요 is conversational polite).' },

      { t:'choice', q:'How do you convert the conversational question "한국 음식을 좋아해요?" into the formal register?',
        options:['한국 음식을 좋아합니까?','한국 음식을 좋아합니다.','한국 음식을 좋아하세요?','한국 음식을 좋아하십시오?'], answer:0,
        why:'A question in the formal register ends with -ㅂ니까?: 한국 음식을 좋아합니까? (좋아합니다 is a statement, 좋아하세요 is conversational polite).' },

      { t:'cloze', sentence:'안내 방송: "잠시 후 비행기가 착륙합니다. 자리에 [앉으십시오]."', answer:'앉으십시오',
        options:['앉으십시오','앉으세요','앉아십시오','앉읍니다'],
        meaning:'Announcement: "The airplane will land shortly. Please be seated."',
        why:'Formal command for a verb with batchim (앉다) takes -으십시오: 앉- + -으십시오 = 앉으십시오.' },

      { t:'order', q:'Put in order: "Please do not take photos inside the library." (Formal notice)',
        tokens:['도서관에서는','사진을','찍지','마십시오.'], answer:['도서관에서는','사진을','찍지','마십시오.'] },

      { t:'pair', q:'Match the conversational sentence with its formal counterpart:', pairs:[
        ['어제 친구를 만났어요.', '어제 친구를 만났습니다.'],
        ['지금 어디에 가요?', '지금 어디에 갑니까?'],
        ['여기에 이름을 쓰세요.', '여기에 이름을 쓰십시오.'],
        ['사진을 찍지 마세요.', '사진을 찍지 마십시오.'],
      ]},

      { t:'correct', wrong:'안내 방송: 자리에 앉으세요.',
        answers:['안내 방송: 자리에 앉으십시오.','안내 방송: 자리에 앉으십시오'],
        hint:'Public official announcements use -(으)십시오 instead of -세요: 앉다 → 앉으십시오',
        why:'Public announcements use the formal imperative -(으)십시오: 자리에 앉으십시오.' },

      { t:'correct', wrong:'뉴스 앵커: 날씨가 아주 좋아요.',
        answers:['뉴스 앵커: 날씨가 아주 좋습니다.','뉴스 앵커: 날씨가 아주 좋습니다'],
        hint:'News anchors speak in formal register -ㅂ/습니다: 좋다 → 좋습니다',
        why:'News broadcasts use formal -습니다: 날씨가 아주 좋습니다.' },

      { t:'translate', q:'Convert into formal register: "저는 미국 사람이에요." (I am American.)',
        answers:['저는 미국 사람입니다.','저는 미국 사람입니다'],
        hint:'저는 미국 사람 + 입니다' },

      { t:'translate', q:'Formal public notice: "Please do not enter." (들어오다 + -지 말다)',
        answers:['들어오지 마십시오.','들어오지 마십시오'],
        hint:'들어오다 → 들어오지 마십시오' },

      { t:'speak', say:'출입문이 닫힙니다. 뒤로 물러서 주십시오.', q:'Read aloud like a subway announcer with clear, crisp formal tone:' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-29 — 높임 -(으)시- · 께 · 께서
   주체를 정중히 높이는 선어말어미 -(으)시-와
   높임 조사 께(에게)·께서(이/가)의 조화로운 결합.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-29',
  emoji: '🙇',
  title: { ko:'높임 -(으)시- · 께 · 께서', en:'Honorifics: -(으)시- · 께 · 께서' },
  tagline: { ko:'주어와 대상을 정중하게 예우하는 한국어', en:'Honoring the subject and recipient with graceful precision.' },
  blurb: { ko:'-(으)세요의 진짜 정체인 주체 높임 어미 -(으)시-를 밝히고, 높임 조사 께(에게)와 께서(이/가)를 함께 익혀 웃어른이나 고객, 상사를 공손하게 예우하는 문장을 완성합니다.',
           en:'Discover the secret behind -(으)세요: the subject honorific infix -(으)시-. Master the honorific particles 께 (to/for) and 께서 (subject marker) to speak with natural respect in family, school, and work settings.' },
  level: 'Beginner',
  needs: 'bg-28',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-29-01',
    title: { ko:'1강. "앉으세요"의 진짜 정체: -(으)시-', en:'Lesson 1. The Secret of -(으)세요: The Infix -(으)시-' },
    minutes: 7,
    blocks: [
      { t:'text', md:'Remember back in Stage 4 (`bg-17`) when you learned **-(으)세요**? We noticed that while it is often used as a polite request (*“Please sit down”*), it also appears in statements like *“선생님이 가세요”* (*The teacher is going*).\n\n**Here is the secret you have been waiting for:**\n\n**-(으)세요** is actually made of two distinct parts:\n**-(으)시-** *(honorific infix honoring the subject)* + **-어요** *(conversational polite ending)*!\n\n- *가- + -시- + -어요 → 가셔요 → **가세요***\n- *앉- + -으시- + -어요 → 앉으셔요 → **앉으세요***' },

      { t:'note', md:'**When do you attach -(으)시-?**\n\nWhenever the **SUBJECT of the sentence** (the person performing the action) is someone you honor or respect:\n- Grandparents, parents, teachers, bosses, older relatives, customers, and guests.\n\n**Golden Rule**: You **NEVER** use `-(으)시-` on yourself! (*“제가 가세요”* ❌)' },

      { t:'table', head:['Verb / Adjective','Stem End','Honorific Present (-(으)세요)','Formal Honorific (-(으)십니다)','Example Sentence'], rows:[
        ['가다 (to go)','No batchim','**가세요**','**가십니다**','선생님이 학교에 **가세요**.'],
        ['오다 (to come)','No batchim','**오세요**','**오십니다**','할머니가 집에 **오세요**.'],
        ['읽다 (to read)','With batchim','**읽으세요**','**읽으십니다**','어머니가 신문을 **읽으세요**.'],
        ['닫다 (to close)','With batchim','**닫으세요**','**닫으십니다**','아버지가 문을 **닫으세요**.'],
        ['좋다 (good)','With batchim','**좋으세요**','**좋으십니다**','기분이 **좋으세요**?'],
        ['바쁘다 (busy)','No batchim','**바쁘세요**','**바쁘십니다**','요즘 많이 **바쁘세요**?'],
      ]},

      { t:'note', md:'**Connecting to Stage 6 (bg-28)!**\n\nNotice how in the formal register (`-ㅂ/습니다`), `-(으)시-` neatly snaps in: `-(으)시- + -ㅂ니다` → **-(으)십니다** (question: **-(으)십니까?**).\n\n- *“사장님이 지금 회의를 **하십니다**.”* (The CEO is in a meeting right now.)' },

      { t:'chars', wide:true, items:[
        { ch:'선생님이 교실에 오세요.', tip:'The teacher comes into the classroom.' },
        { ch:'어머니가 책을 읽으세요.', tip:'Mother is reading a book.' },
        { ch:'사장님이 지금 회의를 하십니다.', tip:'The CEO is conducting a meeting right now. (Formal)' },
      ]},

      { t:'choice', q:'Which sentence correctly honors the teacher as the subject reading a book?',
        options:['선생님이 책을 읽으세요.','선생님이 책을 읽어요.','선생님이 책을 읽으십시오.','선생님이 책을 읽었어요?'], answer:0,
        why:'When the subject is an honored person like a teacher, use -(으)세요: 읽- + -으세요 = 읽으세요. (읽어요 does not honor the teacher, and 읽으십시오 is an imperative command to the listener).' },

      { t:'choice', q:'Can you attach -(으)시- to describe your own action? For example: "제가 내일 집에 가세요."',
        options:['No, never honor yourself; say 제가 가요 or 제가 갑니다.','Yes, it makes you sound exceptionally polite to elders.','Yes, but only if you are speaking to younger people.','No, you must replace it with 제가 가십시오.'], answer:0,
        why:'-(으)시- honors the person performing the action. You never elevate yourself in Korean; always say 제가 가요 or 제가 갑니다.' },

      { t:'choice', q:'How do you ask your professor formally: "Are you busy tomorrow?" using 바쁘다?',
        options:['내일 바쁘십니까?','내일 바쁩니까?','내일 바쁘세요?','내일 바쁩니까요?'], answer:0,
        why:'Formal honorific question: 바쁘- + -시- + -ㅂ니까? = 바쁘십니까? (바쁩니까 lacks the subject honorific -(으)시-, and 바쁘세요 is conversational informal polite).' },

      { t:'cloze', sentence:'어머니께서 거실에서 책을 [읽으세요].', answer:'읽으세요',
        options:['읽으세요','읽어요','읽으십시오','읽으시어요'],
        meaning:'Mother is reading a book in the living room.',
        why:'읽다 has batchim, so attach -으세요: 읽- + -으세요 = 읽으세요.' },

      { t:'order', q:'Put in order: "The CEO is holding a meeting right now." (Formal register)',
        tokens:['사장님이','지금','회의를','하십니다.'], answer:['사장님이','지금','회의를','하십니다.'] },

      { t:'pair', q:'Match the plain verb form with its subject-honorific form:', pairs:[
        ['가요 (goes)', '가세요'],
        ['읽어요 (reads)', '읽으세요'],
        ['해요 (does)', '하세요'],
        ['닫아요 (closes)', '닫으세요'],
      ]},

      { t:'correct', wrong:'제가 내일 도서관에 가세요.',
        answers:['제가 내일 도서관에 가요.','제가 내일 도서관에 가요','제가 내일 도서관에 갑니다.','제가 내일 도서관에 갑니다'],
        hint:'Never use -(으)세요 on yourself! Use 가요 or 갑니다: 제가 내일 도서관에 가요.',
        why:'You cannot honor yourself with -(으)시-. Use 가요 or 갑니다: 제가 내일 도서관에 가요.' },

      { t:'translate', q:'The teacher comes to the classroom.',
        answers:['선생님이 교실에 오세요.','선생님이 교실에 오세요'],
        hint:'선생님이, 교실에 오다 → 오세요' },

      { t:'speak', say:'어머니께서 거실에서 책을 읽으세요.', q:'Read aloud naturally honoring mother with -으세요:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-29-02',
    title: { ko:'2강. 께 와 께서: 조사도 높아진다', en:'Lesson 2. Honorific Particles: 께 and 께서' },
    minutes: 8,
    blocks: [
      { t:'text', md:'In Korean, when you honor someone, you don’t just change the verb ending. **The small particles attached to them upgrade to VIP status as well!**\n\n- **께서**: Replaces **이/가** (subject marker) for honored subjects.\n  - *친구**가** 왔어요* → *할머니**께서** 오셨어요*\n  - If you want to mark the topic (like **은/는**), you use **께서는**! (*“선생님**께서는** 친절하세요”*)\n\n- **께**: Replaces **에게 / 한테** (*“to / for someone”*) when addressing or giving to an honored recipient.\n  - *친구**한테** 줬어요* → *선생님**께** 드렸어요*' },

      { t:'table', head:['Role','Everyday Particle','Honorific Particle','Example Sentence'], rows:[
        ['Subject (주어)','**이 / 가**','**께서**','할머니**께서** 오세요. (Grandmother is coming.)'],
        ['Topic (주제)','**은 / 는**','**께서는**','선생님**께서는** 바쁘세요. (The teacher is busy.)'],
        ['Recipient (받는 사람)','**에게 / 한테**','**께**','부모님**께** 편지를 드렸어요. (Wrote letter to parents.)'],
        ['Asking (질문)','**한테 물어봐요**','**께 여쭤봐요**','교수님**께** 여쭤보세요. (Ask the professor.)'],
      ]},

      { t:'note', md:'**CRITICAL RULE: Harmonic Agreement (짝 맞추기)!**\n\nA very common learner mistake is using `께서` on the subject, but forgetting `-(으)시-` on the verb:\n\n- *할머니께서 집에 와요.* ❌ *(Feels mismatched and incomplete!)*\n- *할머니께서 집에 **오세요**.* ⭕\n\n**께서 and -(으)시- move as an inseparable pair!** Whenever you write `께서`, make sure the verb wears its honorific `-(으)시-`!' },

      { t:'chars', wide:true, items:[
        { ch:'할머니께서 집에 오세요.', tip:'Grandmother is coming home. (께서 + 오세요)' },
        { ch:'선생님께 선물을 드렸어요.', tip:'I gave a gift to the teacher. (께 = to teacher)' },
        { ch:'아버지께서 신문을 읽으세요.', tip:'Father is reading the newspaper. (께서 + 읽으세요)' },
      ]},

      { t:'choice', q:'Which particle correctly replaces 한테/에게 when writing a letter "to my parents"?',
        options:['부모님께 편지를 썼어요.','부모님께서 편지를 썼어요.','부모님이 편지를 썼어요.','부모님한테서 편지를 썼어요.'], answer:0,
        why:'The honorific equivalent of 에게/한테 (to an honored recipient) is 께: 부모님께 편지를 썼어요. (께서 is a subject marker).' },

      { t:'choice', q:'Which sentence exhibits correct harmonic agreement between subject particle and verb?',
        options:['할머니께서 오세요.','할머니께서 와요.','할머니가 오세요만.','할머니께 오셨어요.'], answer:0,
        why:'께서 and the honorific verb ending -(으)세요 must match as a pair: 할머니께서 오세요. (할머니께서 와요 has an unhonored verb).' },

      { t:'choice', q:'How do you say "The professor is kind" using the honorific topic marker?',
        options:['교수님께서는 친절하세요.','교수님께는 친절해요.','교수님께서 친절해요.','교수님이 친절하네요.'], answer:0,
        why:'The honorific topic marker is 께서는 paired with 친절하세요: 교수님께서는 친절하세요.' },

      { t:'cloze', sentence:'내일 스승의 날이라서 선생님[께] 카네이션을 드릴 거예요.', answer:'께',
        options:['께','께서','한테서','에게서'],
        meaning:'Tomorrow is Teacher’s Day, so I will give a carnation to the teacher.',
        why:'Giving to an honored recipient uses the honorific dative particle 께: 선생님께.' },

      { t:'order', q:'Put in order: "Father is reading a book in the living room."',
        tokens:['아버지께서','거실에서','책을','읽으세요.'], answer:['아버지께서','거실에서','책을','읽으세요.'] },

      { t:'pair', q:'Match everyday particle expressions with their honorific counterparts:', pairs:[
        ['친구가 와요', '할머니께서 오세요'],
        ['친구한테 줘요', '선생님께 드려요'],
        ['선생님은 바빠요', '선생님께서는 바쁘세요'],
        ['엄마가 읽어요', '어머니께서 읽으세요'],
      ]},

      { t:'correct', wrong:'선생님께서 교실에 와요.',
        answers:['선생님께서 교실에 오세요.','선생님께서 교실에 오세요','선생님께서 교실에 오십니다.','선생님께서 교실에 오십니다'],
        hint:'께서 must pair with -(으)시- on the verb! Change 와요 to 오세요.',
        why:'Harmonic agreement: 께서 pairs with an honorific verb ending: 선생님께서 교실에 오세요.' },

      { t:'translate', q:'I gave a gift to my grandmother.',
        answers:['할머니께 선물을 드렸어요.','할머니께 선물을 드렸어요'],
        hint:'할머니께, 선물, 드리다 → 드렸어요' },

      { t:'speak', say:'선생님께 감사 편지를 드렸어요.', q:'Read aloud with polite respect towards your teacher:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-29-03',
    title: { ko:'3강. 종합: -(으)시- · 께서 · 께 한 번에 쓰기', en:'Lesson 3. Integration: Harmonizing All Honorifics in Real Life' },
    minutes: 8,
    blocks: [
      { t:'text', md:'Now that you know the three pillars of honorific grammar:\n\n1. **-(으)시-**: Verb infix that honors the subject performing the action.\n2. **께서**: Upgraded subject particle (*이/가*).\n3. **께**: Upgraded recipient particle (*에게/한테*).\n\nLet’s put all three together in real-world scenarios: **at home with family, at school with professors, and at work!**' },

      { t:'table', head:['Context','Korean Sentence','Breakdown of Honorifics','English Meaning'], rows:[
        ['Family','어머니**께서** 할머니**께** 전화를 하세요.','어머니께서 (Subject) + 할머니께 (Recipient) + 하세요 (Verb)','Mother is calling grandmother.'],
        ['School','학생들이 교수님**께** 질문을 드려요.','교수님께 (Recipient) + 드려요 (Humble action)','Students ask questions to the professor.'],
        ['Workplace','부장님**께서** 팀원들에게 설명**하세요**.','부장님께서 (Subject) + 팀원들에게 + 설명하세요 (Verb)','The manager explains to the team members.'],
        ['Hospitality','손님**께서** 직원**에게** 메뉴를 물어보세요.','손님께서 (Customer) + 물어보세요 (Verb)','The guest asks the staff for the menu.'],
      ]},

      { t:'note', md:'**Notice Who Gives and Who Receives!**\n\nWhen **Mother (respected)** calls **Grandmother (even more respected)**:\n*“어머니**께서** 할머니**께** 전화를 하세요.”*\n\n- Mother is the subject doing the call → **어머니께서**\n- Grandmother is the recipient receiving the call → **할머니께**\n- The verb honors mother’s action → **하세요**\n\nEverything snaps together with crystalline clarity!' },

      { t:'chars', wide:true, items:[
        { ch:'어머니께서 할머니께 전화를 하세요.', tip:'Mother is calling grandmother. (께서 + 께 + -세요)' },
        { ch:'선생님께서 학생들에게 책을 읽어 주세요.', tip:'The teacher reads a book for the students. (께서 + -세요)' },
        { ch:'부장님께서 저희에게 말씀하십니다.', tip:'The department head speaks to us. (Formal workplace)' },
      ]},

      { t:'choice', q:'In the sentence "어머니께서 할머니께 선물을 드렸어요", why is 께 used for 할머니?',
        options:['Because grandmother is the respected recipient receiving the gift','Because grandmother is the subject performing the action','Because mother is giving something to herself','Because 께 is a casual particle for immediate family'], answer:0,
        why:'할머니 is the honored recipient receiving the gift, so the honorific dative particle 께 is used.' },

      { t:'choice', q:'Which sentence naturally combines 께서 and -(으)세요 in a workplace setting?',
        options:['사장님께서 지금 회의실에 들어가세요.','사장님께서 지금 회의실에 들어가요.','사장님이 지금 회의실에 들어가라.','사장님께 지금 회의실에 들어가세요.'], answer:0,
        why:'사장님 is honored as the subject with 께서, and the verb takes -세요: 사장님께서 지금 회의실에 들어가세요.' },

      { t:'choice', q:'You want to say "The teacher explains to the students." Which sentence is correct?',
        options:['선생님께서 학생들에게 설명하세요.','선생님이 학생들께 설명해요.','선생님께 학생들이 설명하세요.','선생님께서 학생들에게 설명해라.'], answer:0,
        why:'The teacher is the respected subject (선생님께서), students are ordinary recipients (학생들에게), and the teacher’s action is honored (설명하세요).' },

      { t:'cloze', sentence:'어머니[께서] 할머니께 안부 전화를 하세요.', answer:'께서',
        options:['께서','께','한테','에서'],
        meaning:'Mother is making a greeting call to grandmother.',
        why:'Mother is the respected subject making the phone call: 어머니께서.' },

      { t:'order', q:'Put in order: "Mother is calling grandmother on the phone."',
        tokens:['어머니께서','할머니께','전화를','하세요.'], answer:['어머니께서','할머니께','전화를','하세요.'] },

      { t:'build', q:'Build the sentence: "Father is reading a book in the living room."',
        answers:['아버지께서 거실에서 책을 읽으세요.','아버지께서 거실에서 책을 읽으세요'],
        bank:['아버지께서','거실에서','책을','읽으세요.','읽어요.','아버지가','할머니께'],
        must:['아버지께서','읽으세요'],
        hint:'아버지께서, 거실에서 책을 읽으세요',
        why:'Subject honorific 께서 pairs with 읽으세요: 아버지께서 거실에서 책을 읽으세요.' },

      { t:'correct', wrong:'어머니가 할머니에게 전화를 해요.',
        answers:['어머니께서 할머니께 전화를 하세요.','어머니께서 할머니께 전화를 하세요'],
        hint:'Upgrade all three: 어머니가 → 어머니께서, 할머니에게 → 할머니께, 해요 → 하세요.',
        why:'Honorific agreement: 어머니께서 할머니께 전화를 하세요.' },

      { t:'correct', wrong:'선생님께서 교실에서 책을 읽어요.',
        answers:['선생님께서 교실에서 책을 읽으세요.','선생님께서 교실에서 책을 읽으세요'],
        hint:'께서 requires an honorific verb: 읽다 → 읽으세요',
        why:'Harmonic agreement: 선생님께서 교실에서 책을 읽으세요.' },

      { t:'translate', q:'Mother is calling grandmother.',
        answers:['어머니께서 할머니께 전화를 하세요.','어머니께서 할머니께 전화를 하세요'],
        must:['어머니께서','할머니께','전화를'],
        hint:'어머니께서, 할머니께, 전화를 하세요',
        why:'Both subject (께서) and recipient (께) are honored: 어머니께서 할머니께 전화를 하세요.' },

      { t:'translate', q:'The teacher reads a book for the students.',
        answers:['선생님께서 학생들에게 책을 읽어 주세요.','선생님께서 학생들에게 책을 읽어 주세요'],
        must:['선생님께서','읽어','주세요'],
        hint:'선생님께서, 학생들에게, 읽어 주세요',
        why:'Teacher is honored subject (선생님께서 + 읽어 주세요), students are general recipients (학생들에게).' },

      { t:'speak', say:'어머니께서 할머니께 안부 전화를 하세요.', q:'Read aloud naturally with warm, respectful intonation:' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-30 — 반응 -네요 · -군요 · -지요
   감탄(-네요), 깨달음(-군요), 확인(-지요/-죠)의
   미묘한 뉘앙스를 가려 쓰는 한국어 반응 표현 마스터.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-30',
  emoji: '💡',
  title: { ko:'반응 -네요 · -군요 · -지요', en:'Reactions: -네요 · -군요 · -지요' },
  tagline: { ko:'감탄·깨달음·확인의 뉘앙스를 담아내는 반응 어미', en:'Exclamations, realizations, and seeking confirmation.' },
  blurb: { ko:'직접 겪고 감탄할 때(-네요), 새로 알게 된 사실에 깨달음을 나타낼 때(-군요), 상대방에게 이미 아는 사실을 확인할 때(-지요/-죠) 쓰이는 세 가지 핵심 반응 어미의 미묘한 뉘앙스를 마스터합니다.',
           en:'Master the subtle nuances of Korean reaction endings: spontaneous exclamation from personal experience (-네요), realization upon learning new information (-군요), and seeking agreement or confirmation (-지요/-죠).' },
  level: 'Beginner',
  needs: 'bg-29',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-30-01',
    title: { ko:'1강. -네요: 지금 막 느낀 것에 대한 감탄', en:'Lesson 1. -네요: Spontaneous Direct Exclamation' },
    minutes: 7,
    blocks: [
      { t:'text', md:'Have you noticed Koreans saying **맛있네요!**, **춥네요!**, or **예쁘네요!** in the moment?\n\n**-네요** is used when you **directly experience or perceive something right now**, and make an immediate, spontaneous exclamation!\n\n- Taking a sip of hot coffee: *“이 커피 정말 **맛있네요**!”* *(Wow, this coffee is really delicious!)*\n- Stepping outside into the winter chill: *“오늘 진짜 **춥네요**.”* *(Brr, it’s really cold today!)*\n- Seeing a friend’s new outfit: *“옷이 정말 **예쁘네요**!”* *(Your outfit looks so lovely!)*\n\nIt shares your genuine, live feeling with the listener in a warm, polite tone.' },

      { t:'note', md:'**Ultra-Simple Conjugation!**\n\nUnlike many endings you’ve learned, **-네요** never changes based on batchim or vowel harmony! Simply take the stem and attach **-네요**:\n\n- **가다** → **가네요** *(They are going!)*\n- **먹다** → **먹네요** *(You eat so well!)*\n- **크다** → **크네요** *(It’s so big!)*\n- **작다** → **작네요** *(It’s quite small!)*\n- **Past tense**: stem + **-았/었네요** *(어제 비가 많이 왔네요 = It really rained a lot yesterday!)*\n- **Noun**: Noun + **-(이)네요** *(벌써 금요일이네요 = It’s already Friday!)*' },

      { t:'table', head:['Type','Word','Real-Time Reaction with -네요','English Meaning'], rows:[
        ['Adjective','맛있다 (delicious)','**정말 맛있네요!**','Wow, it’s really delicious!'],
        ['Adjective','춥다 (cold, ㅂ irreg)','**오늘 진짜 춥네요.**','Brr, it’s really cold today.'],
        ['Verb','잘하다 (to do well)','**한국어 정말 잘하시네요!**','Wow, you speak Korean so well!'],
        ['Past','오다 (to come / rain)','**비가 많이 왔네요.**','Oh, it rained a lot!'],
        ['Noun','금요일 (Friday)','**벌써 금요일이네요!**','Oh, it’s already Friday!'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'이 커피 정말 맛있네요!', tip:'Wow, this coffee is really delicious! (Direct taste)' },
        { ch:'오늘 바람이 많이 부네요.', tip:'It’s so windy today. (Feeling the breeze outside)' },
        { ch:'벌써 주말이네요!', tip:'It’s already the weekend! (Looking at calendar)' },
      ]},

      { t:'choice', q:'You take a bite of food at a restaurant and are pleasantly surprised. How do you react in the moment?',
        options:['이 음식 정말 맛있네요!','이 음식 정말 맛있지요?','이 음식 정말 맛있군요.','이 음식 정말 맛있으세요.'], answer:0,
        why:'-네요 expresses a spontaneous live exclamation from direct personal experience: 맛있네요! (-지요 asks for agreement, -군요 expresses reasoned realization, and 맛있으세요 honors the listener).' },

      { t:'choice', q:'You step out the front door and feel freezing wind on your face. What is the most natural reaction?',
        options:['오늘 날씨가 정말 춥네요.','오늘 날씨가 정말 춥죠?','오늘 날씨가 정말 추웠군요.','오늘 날씨가 정말 춥겠습니다.'], answer:0,
        why:'Reacting spontaneously to immediate sensory input takes -네요: 오늘 날씨가 정말 춥네요.' },

      { t:'choice', q:'You see a friend wearing a brand-new jacket. How do you compliment them warmly?',
        options:['새 옷이 정말 예쁘네요!','새 옷이 정말 예쁘군요?','새 옷이 정말 예쁩니까.','새 옷이 정말 예쁘죠?'], answer:0,
        why:'Complimenting something you directly see with pleasant surprise takes -네요: 새 옷이 정말 예쁘네요!' },

      { t:'cloze', sentence:'달력을 보니까 벌써 [금요일이네요]!', answer:'금요일이네요',
        options:['금요일이네요','금요일이군요','금요일이죠','금요일이에요'],
        meaning:'Looking at the calendar, wow, it’s already Friday!',
        why:'Noun with batchim takes -이네요 for a spontaneous realization: 금요일이네요!' },

      { t:'order', q:'Put in order: "Wow, you speak Korean really well!"',
        tokens:['한국어를','정말','잘하시네요!'], answer:['한국어를','정말','잘하시네요!'] },

      { t:'pair', q:'Match situations with the natural -네요 reaction:', pairs:[
        ['Tasting delicious pizza', '정말 맛있네요!'],
        ['Feeling winter wind outside', '날씨가 참 춥네요.'],
        ['Looking at clock at 11 PM', '벌써 시간이 늦었네요.'],
        ['Hearing good Korean speech', '한국어 정말 잘하시네요!'],
      ]},

      { t:'correct', wrong:'커피를 마시고: 이 커피가 참 맛있는네요!',
        answers:['이 커피가 참 맛있네요!','이 커피가 참 맛있네요'],
        hint:'Simply attach -네요 directly to the stem 맛있-: 맛있네요!',
        why:'-네요 attaches directly to the stem: 이 커피가 참 맛있네요!' },

      { t:'translate', q:'React upon tasting: "This coffee is really delicious!"',
        answers:['이 커피 정말 맛있네요!','이 커피 정말 맛있네요'],
        hint:'이 커피, 정말, 맛있다 → 맛있네요!' },

      { t:'speak', say:'이 커피 정말 향도 좋고 맛있네요!', q:'Read aloud with spontaneous delight:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-30-02',
    title: { ko:'2강. -군요: 새로 알게 된 사실에 대한 깨달음', en:'Lesson 2. -군요: Realization & Acknowledging New Info' },
    minutes: 7,
    blocks: [
      { t:'text', md:'In Lesson 1, you learned **-네요** for direct sensory surprise (*“Brr, it’s cold!”*).\n\nNow meet **-군요**: used when you **learn a new fact or hear information**, and acknowledge it with realization: *“Ah, I see! / So that\'s how it is!”*\n\n- A colleague mentions they are taking the day off: *“아, 오늘 휴가**시군요**.”* *(Ah, so you\'re on vacation today!)*\n- A friend mentions they’ve lived in Seoul for 10 years: *“서울에 오래 사셨**군요**.”* *(Ah, so you’ve lived in Seoul a long time!)*\n\nWhile `-네요` is an outward, bubbly exclamation, **`-군요` feels a bit more reflective, gentle, and dignified**, often spoken like a calm acknowledgement: *“아, 그렇군요!”* *(Ah, I see!)*' },

      { t:'note', md:'**What about -는군요?**\n\nYou might occasionally notice `-는군요` on action verbs in the present tense (*가다 → 가는군요, 먹다 → 먹는군요*).\n\n**Don\'t worry about memorizing a separate rule!** It means the exact same thing as `-군요` on adjectives (*크다 → 크군요*). Simply recognize both as the same realization marker!' },

      { t:'table', head:['Situation','Sentence with -군요','Source of Info','English Meaning'], rows:[
        ['Hearing news','**아, 그렇군요!**','Listener explanation','Ah, I see! (Got it!)'],
        ['Hearing a plan','내일 부산에 **가시는군요**.','Coworker’s itinerary','Ah, so you’re going to Busan tomorrow.'],
        ['Looking at weather app','오늘 서울이 **영하 10도군요**.','Checking forecast','Ah, so it’s -10°C today in Seoul.'],
        ['Seeing time on clock','벌써 시간이 이렇게 **됐군요**.','Checking clock quietly','Ah, the time has gotten so late.'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'아, 그렇군요! 몰랐어요.', tip:'Ah, I see! I didn’t know that. (Universal response)' },
        { ch:'한국에 오래 사셨군요.', tip:'Ah, so you’ve lived in Korea for a long time. (Hearing background)' },
        { ch:'오늘 정말 바쁘시군요.', tip:'Ah, I see you are very busy today. (Hearing someone’s schedule)' },
      ]},

      { t:'choice', q:'Your colleague explains why the office is quiet: "Today is a company holiday." How do you naturally acknowledge this new information?',
        options:['아, 오늘 회사 휴일이군요!','아, 오늘 회사 휴일이죠?','아, 오늘 회사 휴일이네요?','아, 오늘 회사 휴일이십시오.'], answer:0,
        why:'Acknowledging newly learned information calmly takes -군요: 아, 오늘 회사 휴일이군요! (-죠 asks for confirmation, -네요 is sensory exclamation).' },

      { t:'choice', q:'A friend tells you: "I learned Korean at Seoul National University for two years." What is the best realization response?',
        options:['한국어를 열심히 공부하셨군요.','한국어를 열심히 공부하셨지요?','한국어를 열심히 공부하세요.','한국어를 열심히 공부하셨습니까?'], answer:0,
        why:'Realizing and acknowledging their past effort based on their story takes -군요: 한국어를 열심히 공부하셨군요.' },

      { t:'choice', q:'What is the main nuance difference between -네요 and -군요?',
        options:['-네요 is live direct sensory reaction, while -군요 is realization upon hearing or discovering new facts','-네요 is for questions, while -군요 is only for formal news broadcasts','-네요 is casual banmal, while -군요 is an imperative command','-네요 is past tense, while -군요 is future tense'], answer:0,
        why:'-네요 expresses direct live sensory surprise, whereas -군요 expresses reasoned realization or acknowledging new information.' },

      { t:'cloze', sentence:'이야기를 듣고: "아, 그런 사정이 [있었군요]."', answer:'있었군요',
        options:['있었군요','있었지요','있었네요','있으셨습니까'],
        meaning:'After listening: "Ah, so that kind of situation existed, I see."',
        why:'Reflecting upon hearing someone\'s explanation takes -았/었군요: 있었군요.' },

      { t:'order', q:'Put in order: "Ah, so you lived in Korea for a long time!"',
        tokens:['아,','한국에','오래','사셨군요!'], answer:['아,','한국에','오래','사셨군요!'] },

      { t:'pair', q:'Match the everyday reaction phrase with its nuanced meaning:', pairs:[
        ['아, 그렇군요!', 'Ah, I see! (Acknowledging info)'],
        ['정말 맛있네요!', 'Wow, delicious! (Direct taste)'],
        ['오늘 많이 바쁘시군요.', 'Ah, you’re busy today. (Hearing schedule)'],
        ['바람이 정말 차네요.', 'The wind is so chilly! (Feeling air)'],
      ]},

      { t:'correct', wrong:'상대방 설명을 듣고: 아, 정말 그렇네요?',
        answers:['아, 정말 그렇군요!','아, 정말 그렇군요'],
        hint:'When calmly acknowledging someone’s explanation, use 그렇군요: 그렇다 → 그렇군요',
        why:'Acknowledging explanation uses 그렇군요: 아, 정말 그렇군요!' },

      { t:'translate', q:'Response to explanation: "Ah, so that’s how it is! (I see!)"',
        answers:['아, 그렇군요!','아, 그렇군요'],
        hint:'아, 그렇다 → 그렇군요' },

      { t:'speak', say:'아, 그런 사정이 있었군요. 몰랐어요.', q:'Read aloud with thoughtful, understanding intonation:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-30-03',
    title: { ko:'3강. -지요(-죠): 이미 아는 걸 확인하기', en:'Lesson 3. -지요 (-죠): Seeking Agreement & Confirmation' },
    minutes: 8,
    blocks: [
      { t:'text', md:'In Lessons 1 and 2, you learned `-네요` (sensory surprise) and `-군요` (new realization).\n\nWhat if you **already know the fact**, and you simply want to **confirm it with the listener or seek their agreement** (*“Right?”, “Isn’t it?”, “You know, don’t you?”*)?\n\nThat is the realm of **-지요** (contracted into **-죠** in speech)!\n\n- Walking in pleasant sunshine together: *“오늘 날씨 참 좋**죠**?”* *(The weather is really nice today, right?)*\n- Checking tomorrow’s schedule: *“내일 회의 2시**지요**?”* *(Tomorrow’s meeting is at 2 PM, right?)*\n- Answering in agreement: *“네, 그렇**지요**!”* *(Yes, exactly / of course!)*' },

      { t:'table', head:['Ending','Core Nuance','When to Use','Example Sentence'], rows:[
        ['**-네요**','Direct Exclamation','Experiencing something in real time','오늘 날씨가 참 **춥네요**! (Brr, so cold!)'],
        ['**-군요**','New Realization','Learning info or discovering a fact','서울이 영하 10도**군요**. (Ah, so it’s -10°C.)'],
        ['**-지요 (-죠)**','Confirmation / Agreement','Believing listener already agrees','오늘 날씨 참 **춥죠**? (It’s cold, isn’t it?)'],
      ]},

      { t:'note', md:'**Everyday Contraction: -지요 → -죠**\n\nIn spoken Korean, **-지요** is almost always contracted to **-죠**:\n\n- *좋지요? → **좋죠?***\n- *맞지요? → **맞죠?*** *(That’s right, isn’t it?)*\n- *맛있지요? → **맛있죠?***\n- *그렇지요? → **그렇죠?***\n\nBoth forms are completely polite and natural!' },

      { t:'chars', wide:true, items:[
        { ch:'오늘 날씨가 정말 좋지요?', tip:'The weather is so nice today, isn’t it? (Seeking agreement)' },
        { ch:'한국어 공부 재미있죠?', tip:'Studying Korean is fun, right? (Expecting agreement)' },
        { ch:'네, 맞아요. 그렇습니다.', tip:'Yes, that’s right. (Affirmative confirmation)' },
      ]},

      { t:'choice', q:'You and a coworker are eating a delicious lunch together. You want to ask for their agreement: "Delicious, isn\'t it?"',
        options:['이 식당 음식 맛있죠?','이 식당 음식 맛있군요?','이 식당 음식 맛있네요?','이 식당 음식 맛있으세요?'], answer:0,
        why:'-죠 (-지요) seeks agreement on something you expect the listener to share: 맛있죠? (-네요 is a personal exclamation, -군요 is new realization).' },

      { t:'choice', q:'You want to double-check with a classmate: "Tomorrow’s exam is at 10 AM, right?"',
        options:['내일 시험이 10시지요?','내일 시험이 10시네요!','내일 시험이 10시군요.','내일 시험이 10시십시오.'], answer:0,
        why:'Double-checking known information takes -지요 / -죠: 10시지요?' },

      { t:'choice', q:'Look at the three sentences about a movie. Which one expresses: "The movie was fun, wasn\'t it?" (seeking agreement)',
        options:['영화 재미있었죠?','영화 재미있었네요!','영화 재미있었군요.','영화 재미있으세요.'], answer:0,
        why:'Seeking agreement uses past -았/었죠?: 영화 재미있었죠?' },

      { t:'cloze', sentence:'날씨가 참 맑아요. "오늘 하늘이 정말 [푸르죠]?"', answer:'푸르죠',
        options:['푸르죠','푸르네요','푸르군요','푸르세요'],
        meaning:'The weather is so clear. "The sky is so blue today, isn\'t it?"',
        why:'Seeking agreement from the listener takes -죠: 푸르- + -죠 = 푸르죠?' },

      { t:'order', q:'Put in order: "Studying Korean is fun, isn\'t it?"',
        tokens:['한국어','공부','정말','재미있죠?'], answer:['한국어','공부','정말','재미있죠?'] },

      { t:'pair', q:'Match each intention with the appropriate reaction ending:', pairs:[
        ['Direct personal surprise', '-네요 (맛있네요!)'],
        ['Learning new information', '-군요 (그렇군요!)'],
        ['Seeking confirmation/agreement', '-지요 / -죠 (좋죠?)'],
        ['Formal public statement', '-습니다 (감사합니다)'],
      ]},

      { t:'correct', wrong:'친구에게 동의를 구할 때: 오늘 날씨 정말 좋네요?',
        answers:['오늘 날씨 정말 좋지요?','오늘 날씨 정말 좋지요','오늘 날씨 정말 좋죠?','오늘 날씨 정말 좋죠'],
        hint:'When seeking agreement from the listener ("isn\'t it?"), use -지요? or -죠?: 좋지요?',
        why:'Seeking agreement takes -지요? / -죠?: 오늘 날씨 정말 좋지요?' },

      { t:'correct', wrong:'약속 시간을 재확인할 때: 내일 2시에 만나는군요?',
        answers:['내일 2시에 만나지요?','내일 2시에 만나지요','내일 2시에 만나죠?','내일 2시에 만나죠'],
        hint:'To confirm a planned schedule with someone ("right?"), use 만나지요? or 만나죠?',
        why:'Confirming an existing fact takes -지요 / -죠: 내일 2시에 만나지요?' },

      { t:'translate', q:'Seeking agreement: "The weather is really nice today, isn\'t it?"',
        answers:['오늘 날씨 정말 좋지요?','오늘 날씨 정말 좋지요','오늘 날씨 정말 좋죠?','오늘 날씨 정말 좋죠'],
        must:['오늘','날씨','정말'],
        hint:'오늘 날씨 정말 좋다 → 좋지요? / 좋죠?' },

      { t:'translate', q:'Confirming schedule: "Tomorrow\'s meeting is at 2 PM, right?"',
        answers:['내일 회의가 2시지요?','내일 회의가 2시지요','내일 회의가 2시죠?','내일 회의가 2시죠'],
        must:['내일','회의가','2시'],
        hint:'내일 회의가 2시 + 지요? / 죠?' },

      { t:'speak', say:'오늘 날씨가 참 따뜻하고 좋지요?', q:'Read aloud seeking agreement with a warm smile:' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-31 — 남은 조사 ① 사람과 방향
   사람을 향하는 방향(에게/한테, 에게서/한테서)과
   장소 방향·수단·도구·변화를 나타내는 (으)로 조사의 완벽 정복.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-31',
  emoji: '👥',
  title: { ko:'남은 조사 ① 사람과 방향', en:'Particles ①: People & Direction' },
  tagline: { ko:'사람을 향할 때와 방향·도구를 가리킬 때 쓰는 필수 조사', en:'Essential particles for giving/receiving with people and indicating direction or tools.' },
  blurb: { ko:'사람에게 주고받는 방향(에게/한테 vs 에게서/한테서)과 이동 방향·교통수단·도구·변화를 나타내는 (으)로 조사의 문어체/구어체 구분 및 ㄹ 받침 예외 규칙을 완벽하게 익힙니다.',
           en:'Master interpersonal direction particles (에게/한테 vs. 에게서/한테서) and the versatile (으)로 particle for destination, means/transport, and transformation, including the critical ㄹ-batchim exception.' },
  level: 'Beginner',
  needs: 'bg-30',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-31-01',
    title: { ko:'1강. 에게 와 한테: 사람에게', en:'Lesson 1. 에게 & 한테: Giving / Towards People' },
    minutes: 7,
    blocks: [
      { t:'text', md:'In course `bg-29`, you learned that when doing something for an honored elder (like parents or teachers), you use the honorific particle **께** (*선생님께 편지를 드렸어요*).\n\nNow, what about friends, coworkers, siblings, and ordinary people?\n\nYou use **에게** or **한테** (*“to / towards someone”*)!\n\n- Giving a gift: *“친구**한테** 선물을 줬어요.”* *(I gave a gift to my friend.)*\n- Sending a message: *“동생**에게** 문자를 보냈어요.”* *(I sent a text to my younger sibling.)*\n\nBoth mean **exactly the same thing** grammatically. The only difference is **style and register**!' },

      { t:'note', md:'**Written vs. Spoken Register:**\n\n- **에게**: **Written / Formal register (문어체)**. Common in literature, news articles, formal business emails, and official notices.\n- **한테**: **Everyday Spoken register (구어체)**. What native speakers use 99% of the time in daily conversation with friends, family, and colleagues!\n\nBoth attach directly to the person noun without any batchim changes:\n- **친구** + 한테 = **친구한테**\n- **동생** + 에게 = **동생에게**\n- **민수** + 한테 = **민수한테**' },

      { t:'table', head:['Recipient','Particle','Style / Context','Example Sentence'], rows:[
        ['Honored Elder (선생님)','**께**','Honorific (높임)','선생님**께** 여쭤보세요.'],
        ['Friend / Peer (문어체)','**에게**','Formal / Written','친구**에게** 편지를 씁니다.'],
        ['Friend / Peer (구어체)','**한테**','Spoken / Everyday','친구**한테** 카톡 보냈어.'],
        ['Younger (동생)','**한테 / 에게**','Neutral / Casual','동생**한테** 용돈을 줬어요.'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'친구한테 선물을 줬어요.', tip:'I gave a gift to a friend. (Spoken, natural)' },
        { ch:'동생에게 문자를 보냈어요.', tip:'I sent a text to my sibling. (Written/formal)' },
        { ch:'누구한테 전화했어요?', tip:'Who did you call? (Everyday question)' },
      ]},

      { t:'choice', q:'You are chatting casually with a friend and want to say: "I gave a present to Minsoo." Which sentence sounds most natural in everyday speech?',
        options:['민수한테 선물을 줬어요.','민수에게 선물을 주셨어요.','민수께 선물을 드렸어요.','민수를 선물을 줬어요.'], answer:0,
        why:'한테 is the standard everyday spoken particle for peers (민수한테 선물을 줬어요). 께 is reserved for honored elders, and 에게 is formal written style.' },

      { t:'choice', q:'How do 에게 and 한테 differ in Korean?',
        options:['They share the exact same meaning, but 에게 is formal/written while 한테 is everyday spoken','에게 is only used for past tense, while 한테 is for present tense','에게 is for animals, while 한테 is only for human superiors','에게 requires a batchim, while 한테 attaches after vowels'], answer:0,
        why:'Both mean "to (a person)", but 에게 is formal/written while 한테 is natural spoken Korean.' },

      { t:'choice', q:'Choose the correct pair of particles to fill in the blanks respectfully and naturally: "부모님(__) 선물을 드리고, 동생(__) 간식을 줬어요."',
        options:['께 / 한테','한테 / 께','에게 / 께서','한테서 / 께'], answer:0,
        why:'Parents are honored elders requiring 께, while younger sibling takes casual 한테 (or 에게): 부모님께 / 동생한테.' },

      { t:'cloze', sentence:'방과 후에 친구[한테] 전화를 걸었어요.', answer:'한테',
        options:['한테','한테서','으로','에서'],
        meaning:'After school, I made a phone call to my friend.',
        why:'Calling "to" a person in everyday speech takes 한테 (or 에게).' },

      { t:'order', q:'Put in order: "I gave a birthday present to my friend."',
        tokens:['친구한테','생일','선물을','줬어요.'], answer:['친구한테','생일','선물을','줬어요.'] },

      { t:'pair', q:'Match the recipient with the most fitting particle:', pairs:[
        ['To grandmother (honorific)', '할머니께'],
        ['To a friend (everyday spoken)', '친구한테'],
        ['To readers (formal written)', '독자에게'],
        ['To my younger brother', '남동생한테'],
      ]},

      { t:'correct', wrong:'친구와 대화할 때: 선생님한테 이 책을 드려요.',
        answers:['선생님께 이 책을 드려요.','선생님께 이 책을 드려요'],
        hint:'For honored elders like teachers, replace 한테 with the honorific particle 께.',
        why:'Teachers require the honorific particle 께: 선생님께 이 책을 드려요.' },

      { t:'translate', q:'Spoken: "I gave a present to my friend."',
        answers:['친구한테 선물을 줬어요.','친구한테 선물을 줬어요','친구에게 선물을 줬어요.','친구에게 선물을 줬어요'],
        must:['선물을','줬어요'],
        hint:'친구 + 한테 / 에게 + 선물을 줬어요' },

      { t:'speak', say:'생일에 친구한테 멋진 선물을 줬어요.', q:'Read aloud naturally as if sharing a story with a friend:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-31-02',
    title: { ko:'2강. 에게서 와 한테서: 사람에게서(받다)', en:'Lesson 2. 에게서 & 한테서: From People (Source)' },
    minutes: 7,
    blocks: [
      { t:'text', md:'In Lesson 1, you learned how to direct actions **TOWARDS** someone using **에게 / 한테** (*giving, sending, calling*).\n\nNow, what happens when you **RECEIVE** something **FROM** someone?\n\nYou add **-서** to create **에게서** and **한테서** (*“from someone”*)!\n\n- Receiving a gift: *“친구**한테서** 선물을 받았어요.”* *(I received a gift from a friend.)*\n- Hearing news: *“민수**한테서** 소식을 들었어요.”* *(I heard the news from Minsoo.)*\n\nThe same register rule applies:\n- **에게서**: Written / formal style\n- **한테서**: Everyday spoken style' },

      { t:'note', md:'**Direction Contrast: TO vs. FROM**\n\nAlways pay attention to the main verb!\n\n1. **GIVING / SENDING / TOWARDS (에게 / 한테)**:\n   - *주다 (to give), 보내다 (to send), 전화하다 (to call), 가르치다 (to teach)*\n   - 동생**한테** 주다 = give **to** sibling\n\n2. **RECEIVING / LEARNING / FROM (에게서 / 한테서)**:\n   - *받다 (to receive), 듣다 (to hear), 배우다 (to learn), 빌리다 (to borrow)*\n   - 동생**한테서** 받다 = receive **from** sibling\n\n*(Tip: In rapid daily conversation, Koreans often shorten 한테서 to just 한테 when the verb already means receiving like 받다, but 한테서 is the precise, unambiguous standard form!)*' },

      { t:'table', head:['Type','Particle','Key Verbs','Example Sentence'], rows:[
        ['**TO (Recipient)**','**에게 / 한테**','주다, 보내다, 쓰다','친구**한테** 선물을 줬어요.'],
        ['**FROM (Source)**','**에게서 / 한테서**','받다, 듣다, 배우다','친구**한테서** 선물을 받았어요.'],
        ['**FROM (Honorific)**','**께로부터 / 께**','받다, 듣다, 물려받다','선생님**께** 가르침을 받았어요.'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'친구한테서 선물을 받았어요.', tip:'I received a present from a friend. (Receiving)' },
        { ch:'민수한테서 그 이야기를 들었어요.', tip:'I heard that story from Minsoo. (Hearing info)' },
        { ch:'누구한테서 한국어를 배웠어요?', tip:'Who did you learn Korean from? (Learning source)' },
      ]},

      { t:'choice', q:'Complete the sentence: "I borrowed this book from a friend yesterday." (어제 친구(__) 이 책을 빌렸어요.)',
        options:['한테서','한테','으로','에서'], answer:0,
        why:'Borrowing or receiving something from a person takes 한테서 (or 에게서): 친구한테서 빌렸어요.' },

      { t:'choice', q:'Compare the two sentences:\n1. 친구한테 편지를 보냈어요.\n2. 친구한테서 편지를 받았어요.\nWhat is the difference?',
        options:['Sentence 1 is sending TO a friend; Sentence 2 is receiving FROM a friend','Sentence 1 is past tense; Sentence 2 is present tense','Sentence 1 is honorific; Sentence 2 is casual banmal','Sentence 1 means with a friend; Sentence 2 means against a friend'], answer:0,
        why:'-한테 indicates the recipient (sent to), whereas -한테서 indicates the source (received from).' },

      { t:'choice', q:'Which verb pairs naturally with 에게서 / 한테서 (from a person)?',
        options:['소식을 들었어요 (heard news)','문자를 보냈어요 (sent text)','선물을 주었어요 (gave gift)','인사를 드렸어요 (greeted)'], answer:0,
        why:'Hearing information, receiving, borrowing, and learning originate from a source: 소식을 들었어요.' },

      { t:'cloze', sentence:'지난주에 친구[한테서] 반가운 편지를 받았어요.', answer:'한테서',
        options:['한테서','한테','에게','으로'],
        meaning:'Last week, I received a welcome letter from a friend.',
        why:'Receiving from a person takes the source particle 한테서 (or 에게서).' },

      { t:'order', q:'Put in order: "I heard that story from Minsoo."',
        tokens:['민수한테서','그','이야기를','들었어요.'], answer:['민수한테서','그','이야기를','들었어요.'] },

      { t:'pair', q:'Match the particle with its directional meaning and verb:', pairs:[
        ['Giving TO a friend', '친구한테 주다'],
        ['Receiving FROM a friend', '친구한테서 받다'],
        ['Giving TO teacher (honor)', '선생님께 드리다'],
        ['Arriving AT school', '학교에 도착하다'],
      ]},

      { t:'correct', wrong:'선물을 받은 상황: 친구한테 선물을 받았어요. (명확하게 구분할 때)',
        answers:['친구한테서 선물을 받았어요.','친구한테서 선물을 받았어요','친구에게서 선물을 받았어요.','친구에게서 선물을 받았어요'],
        hint:'To make the source "from" completely explicit, attach -서 to 한테: 한테서.',
        why:'The source marker for persons is 한테서 / 에게서: 친구한테서 선물을 받았어요.' },

      { t:'translate', q:'Spoken: "I received a letter from my friend."',
        answers:['친구한테서 편지를 받았어요.','친구한테서 편지를 받았어요','친구에게서 편지를 받았어요.','친구에게서 편지를 받았어요'],
        must:['편지를','받았어요'],
        hint:'친구 + 한테서 / 에게서 + 편지를 받았어요' },

      { t:'speak', say:'어제 친구한테서 반가운 연락을 받았어요.', q:'Read aloud warmly sharing good news:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-31-03',
    title: { ko:'3강. 으로: 방향과 수단', en:'Lesson 3. (으)로: Direction, Means, & Transformation' },
    minutes: 8,
    blocks: [
      { t:'text', md:'The versatile particle **-(으)로** is one of the most useful tools in Korean. It fulfills **three major functions**:\n\n1. **Direction (“toward”)**:\n   - *“오른쪽**으로** 가세요.”* *(Please go toward the right.)*\n   - *“집**으로** 돌아가요.”* *(I am heading toward home.)*\n   *(Unlike **에**, which pinpoints the exact static destination, **(으)로** emphasizes heading in that direction.)*\n\n2. **Means / Tool / Transportation (“by / with / using”)**:\n   - *“버스**로** 가요.”* *(I go by bus.)*\n   - *“연필**로** 써요.”* *(I write with a pencil.)*\n   - *“한국어**로** 말해요.”* *(I speak in Korean.)*\n\n3. **Transformation / Result (“into”)**:\n   - *“물이 얼음**으로** 변해요.”* *(Water turns into ice.)*' },

      { t:'note', md:'**Conjugation: The Crucial ㄹ-Batchim Exception!**\n\n- **No Batchim (Vowel ending)** → **-로**\n  - 학교 → **학교로** *(toward school)*\n  - 버스 → **버스로** *(by bus)*\n  - 뒤 → **뒤로** *(to the back)*\n\n- **With Batchim (Consonant ending)** → **-으로**\n  - 손 → **손으로** *(with hands)*\n  - 오른쪽 → **오른쪽으로** *(to the right)*\n  - 젓가락 → **젓가락으로** *(with chopsticks)*\n\n- **⚡ THE EXCEPTION: Words ending in ㄹ batchim take -로!**\n  - Pronouncing `ㄹ + 으` is awkward, so `ㄹ` behaves just like a vowel!\n  - 지하철 + 로 → **지하철로** (❌ 지하철으로)\n  - 연필 + 로 → **연필로** (❌ 연필으로)\n  - 서울 + 로 → **서울로** (❌ 서울으로)' },

      { t:'table', head:['Category','Word Type','Base Word','With (으)로','Meaning'], rows:[
        ['Transport / Tool','Vowel Ending','버스 (bus)','**버스로**','by bus'],
        ['Transport / Tool','Normal Batchim','손 (hand)','**손으로**','with one’s hands'],
        ['Transport / Tool','**ㄹ Batchim**','지하철 (subway)','**지하철로** *(not 지하철으로)*','by subway'],
        ['Tool / Writing','**ㄹ Batchim**','연필 (pencil)','**연필로** *(not 연필으로)*','with a pencil'],
        ['Direction','Normal Batchim','오른쪽 (right)','**오른쪽으로**','to the right'],
        ['Direction','**ㄹ Batchim**','서울 (Seoul)','**서울로** *(not 서울으로)*','towards Seoul'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'오른쪽으로 가세요.', tip:'Please go to the right. (Direction)' },
        { ch:'지하철로 출근해요.', tip:'I commute by subway. (ㄹ-batchim means)' },
        { ch:'한국어로 말해 보세요.', tip:'Try speaking in Korean. (Language as tool)' },
      ]},

      { t:'choice', q:'How do you combine 지하철 (subway) with -(으)로 to say "by subway"?',
        options:['지하철로','지하철으로','지하철에','지하철에게'], answer:0,
        why:'Nouns ending in ㄹ batchim take -로 (not -으로): 지하철로!' },

      { t:'choice', q:'You are writing a letter and want to say: "I wrote it with a pencil." Which form is correct for 연필 (pencil)?',
        options:['연필로 썼어요.','연필으로 썼어요.','연필에게 썼어요.','연필을 썼어요.'], answer:0,
        why:'연필 ends in ㄹ batchim, so it takes -로 without 으: 연필로 썼어요.' },

      { t:'choice', q:'Giving directions on the street: "Please go to the right." What is the correct Korean expression?',
        options:['오른쪽으로 가세요.','오른쪽로 가세요.','오른쪽에 가세요.','오른쪽에게 가세요.'], answer:0,
        why:'오른쪽 ends in consonant ㄱ, so it takes -으로: 오른쪽으로 가세요.' },

      { t:'cloze', sentence:'회사에 버스나 [지하철로] 출근해요.', answer:'지하철로',
        options:['지하철로','지하철으로','지하철에','지하철에서'],
        meaning:'I commute to work by bus or by subway.',
        why:'Transportation method for a word ending in ㄹ takes -로: 지하철로.' },

      { t:'order', q:'Put in order: "Please go straight ahead."',
        tokens:['앞으로','똑바로','가세요.'], answer:['앞으로','똑바로','가세요.'] },

      { t:'pair', q:'Match each noun with its correctly attached -(으)로 form:', pairs:[
        ['지하철 (ㄹ batchim)', '지하철로'],
        ['연필 (ㄹ batchim)', '연필로'],
        ['오른쪽 (consonant)', '오른쪽으로'],
        ['버스 (vowel)', '버스로'],
      ]},

      { t:'correct', wrong:'ㄹ 받침 오류: 서울으로 이사했어요.',
        answers:['서울로 이사했어요.','서울로 이사했어요'],
        hint:'Nouns ending with the batchim ㄹ take -로, not -으로: 서울로.',
        why:'ㄹ batchim nouns take -로: 서울로 이사했어요.' },

      { t:'translate', q:'Direction: "Please go to the right."',
        answers:['오른쪽으로 가세요.','오른쪽으로 가세요'],
        must:['오른쪽으로','가세요'],
        hint:'오른쪽 + 으로 + 가세요' },

      { t:'translate', q:'Means: "I eat noodles with chopsticks."',
        answers:['젓가락으로 라면을 먹어요.','젓가락으로 라면을 먹어요','젓가락으로 면을 먹어요.','젓가락으로 면을 먹어요'],
        must:['젓가락으로','먹어요'],
        hint:'젓가락 + 으로 + 라면을 / 면을 + 먹어요' },

      { t:'speak', say:'저는 매일 아침에 지하철로 출근해요.', q:'Read aloud naturally focusing on the smooth pronunciation of 지하철로:' },
    ],
  },

  ],
},

];
