/* ══════════════════════════════════════════════════════════════
   초급 1단계 — 문장이 되게
   ──────────────────────────────────────────────────────────────
   설계는 docs/curriculum-beginner.md 에 있다. 여기는 내용만 둔다.

   이 단계가 끝나면 학습자는 **자기를 소개하고, 무엇이 어디 있는지
   말하고, 아니라고 말할 수 있다.** 문법 항목 수가 아니라 이것이 목표다.

   ── 설명은 영어, 예문은 한국어 ──────────────────────────────
   초급 학습자는 "동사 어간 마지막 모음이 ㅏ 또는 ㅗ 이면" 을 못 읽는다.
   그 문장을 읽을 수 있으면 이 레슨이 필요 없다. 그래서 md/q/why/tip 은
   영어로 쓰고, 학습자가 **만들어야 할 말**만 한국어로 둔다.

   ── 선지 규칙 (docs/handoff-distractors.md §6) ──────────────
   1. 넷 다 실제로 있을 법한 형태여야 한다. 지어낸 말을 넣으면 뜻이
      아니라 생김새를 보고 고르게 된다.
   2. 크기를 맞춘다. 맨몸 어미와 완성된 말을 섞지 않는다.
   3. why 는 나머지 셋이 각각 무엇인지 말해 준다. 틀린 보기를 고른
      순간이 제일 잘 배우는 자리다.

   ── cloze 주의 ─────────────────────────────────────────────
   sentence 의 대괄호는 **정확히 한 쌍**, 그 안의 글자는 answer 와
   같아야 한다. 상황 설명은 괄호 () 로 쓴다. 검사기가 막는다.
   ══════════════════════════════════════════════════════════════ */

export const BEGINNER_STAGE1_COURSES = [

/* ═══════════════════════════════════════════════════════════════
   bg-05 — 이에요 / 예요
   첫 코스를 "저는 ~이에요" 로 여는 이유: 학습자가 배운 날 바로 쓸 수
   있는 말이고, 받침 규칙을 여기서 한 번 익히면 이/가·은/는·을/를 이
   전부 같은 규칙이라 뒤가 거저 풀린다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-05',
  emoji: '🙋',
  title: 'Am, Is, Are — 이에요 / 예요',
  tagline: 'Say who you are and what something is.',
  blurb: 'Korean has no separate word for “is”. You glue an ending onto the noun. Learn which ending goes where and you can already introduce yourself, name things, and say what something is not.',
  lv: 'bg',
  level: 'Beginner',
  needs: 'first-words',
  lessons: [

  {
    id: 'bg-05-01',
    title: 'Lesson 1. 저는 학생이에요',
    minutes: 6,
    blocks: [
      { t:'text', md:'English needs a separate word — *I **am** a student*. Korean does not. The ending goes **onto the noun itself**.\n\n저는 학생**이에요**.  — I am a student.' },

      { t:'text', h:'Which ending? Look at the last letter of the noun', md:'If the noun ends in a **consonant** (a 받침), use **-이에요**.\nIf it ends in a **vowel**, use **-예요**.' },

      { t:'table', head:['Noun','Ends in','You say'], rows:[
        ['학생','consonant ㅇ','학생**이에요**'],
        ['선생님','consonant ㅁ','선생님**이에요**'],
        ['의사','vowel ㅏ','의사**예요**'],
        ['가수','vowel ㅜ','가수**예요**'],
      ]},

      { t:'note', md:'You will meet this shape again and again: **the form with the extra 이 goes after a consonant.** 이에요/예요 · 이/가 · 은/는 · 을/를 all split the same way. Get the feel once here and the rest come almost free.' },

      { t:'chars', wide:true, items:[
        { ch:'저는 한국 사람이에요.', tip:'I am Korean. 사람 ends in ㅁ, a consonant → 이에요' },
        { ch:'제 친구는 의사예요.', tip:'My friend is a doctor. 의사 ends in ㅏ, a vowel → 예요' },
        { ch:'이거는 커피예요.', tip:'This is coffee.' },
      ]},

      { t:'choice', q:'Only one of these follows the rule. Which?',
        options:['의사이에요','가수이에요','커피예요','선생님예요'], answer:2,
        why:'커피 ends in the vowel ㅣ → **예요**. The other three break the rule: 의사 and 가수 end in vowels so they need **예요**, and 선생님 ends in ㅁ so it needs **이에요**.' },

      { t:'cloze', sentence:'저는 학생[이에요].', answer:'이에요',
        meaning:'I am a student.',
        options:['이에요','예요'],
        keys:['이에요','예요'],
        why:'학생 ends in ㅇ, a consonant, so it takes the longer **이에요**.' },

      { t:'cloze', sentence:'제 동생은 가수[예요].', answer:'예요',
        meaning:'My younger sibling is a singer.',
        options:['이에요','예요'],
        keys:['예요','이에요'],
        why:'가수 ends in the vowel ㅜ, so the 이 drops and you get **예요**.' },

      { t:'type', q:'“I am a teacher.”  저는 선생님___',
        answer:'이에요', keys:['이에요','예요'],
        why:'선생님 ends in ㅁ → 이에요.' },

      { t:'speak', say:'저는 학생이에요.', q:'Say it out loud.' },
    ],
  },

  {
    id: 'bg-05-02',
    title: 'Lesson 2. 학생이 아니에요',
    minutes: 6,
    blocks: [
      { t:'text', md:'To say something is **not** so, you do not negate 이에요. You swap in a different word entirely: **아니에요**.\n\n저는 학생이 **아니에요**.  — I am not a student.' },

      { t:'text', h:'One thing surprises everyone here', md:'The noun before 아니에요 takes **이/가**, not 은/는.\n\n저는 의사**가** 아니에요.  (○)\n저는 의사**는** 아니에요.  (△ — possible, but it means “*a doctor*, I am not — though maybe something else”)' },

      { t:'table', head:['Noun','Ends in','You say'], rows:[
        ['학생','consonant','학생**이** 아니에요'],
        ['의사','vowel','의사**가** 아니에요'],
      ]},

      { t:'note', md:'Same split as yesterday: **이** after a consonant, **가** after a vowel. Notice 아니에요 itself never changes — only the particle in front of it does.' },

      { t:'chars', wide:true, items:[
        { ch:'저는 일본 사람이 아니에요.', tip:'I am not Japanese. 사람 + 이' },
        { ch:'이거는 커피가 아니에요.', tip:'This is not coffee. 커피 + 가' },
        { ch:'제 친구는 가수가 아니에요.', tip:'My friend is not a singer.' },
      ]},

      { t:'choice', q:'“이거는 물___ 아니에요.”  (물 = water, ends in ㄹ)',
        options:['물이','물가','물은','물을'], answer:0,
        why:'아니에요 takes **이/가**, and 물 ends in a consonant → **물이**. 물은 is the topic particle and 물을 is the object particle — neither belongs in front of 아니에요.' },

      { t:'cloze', sentence:'저는 의사[가] 아니에요.', answer:'가',
        meaning:'I am not a doctor.',
        options:['가','이','는','를'],
        keys:['가','이','는','를'],
        why:'아니에요 wants **이/가**, and 의사 ends in a vowel → **가**. **이** is the same particle for consonant-final nouns, **는** marks a topic, **를** marks an object.' },

      { t:'pair', q:'Match each noun with the particle it takes before 아니에요.',
        pairs:[['학생','이'],['커피','가'],['선생님','이'],['의사','가']] },

      { t:'order', q:'Build “This is not coffee.”',
        tokens:['이거는','커피가','아니에요'], answer:['이거는','커피가','아니에요'] },

      { t:'speak', say:'저는 학생이 아니에요.', q:'Say it out loud.' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-06 — 있어요 / 없어요, 에 · 에서
   2강이 이 단계의 고비다. 영어 in/at 하나에 에와 에서가 둘 다 걸려서
   끝까지 틀린다. 규칙을 외우게 하지 말고 **동사를 보라**고 가르친다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-06',
  emoji: '📍',
  title: 'There Is, There Isn’t — 있어요 / 없어요',
  tagline: 'Say what exists, what you have, and where it all is.',
  blurb: 'Two words carry an enormous amount of everyday Korean: 있어요 and 없어요. They cover *there is*, *I have*, and *is located*. Along the way you meet 에 and 에서 — the pair that English speakers get wrong the longest.',
  lv: 'bg',
  level: 'Beginner',
  needs: 'bg-05',
  lessons: [

  {
    id: 'bg-06-01',
    title: 'Lesson 1. 있어요 / 없어요',
    minutes: 6,
    blocks: [
      { t:'text', md:'**있어요** = it exists / there is / I have.\n**없어요** = it does not exist / there is none / I don’t have.\n\nOne pair of words, three English translations. Korean does not separate *having* from *existing*.' },

      { t:'chars', wide:true, items:[
        { ch:'시간 있어요?', tip:'Do you have time? — literally “time exists?”' },
        { ch:'돈이 없어요.', tip:'I have no money.' },
        { ch:'화장실이 어디에 있어요?', tip:'Where is the bathroom?' },
      ]},

      { t:'note', md:'**없어요 is not 안 + 있어요.** Korean has a separate word for the negative here, and 안 있어요 is simply not said. Learn the pair together as one item.' },

      { t:'text', h:'The thing that exists takes 이/가', md:'돈**이** 없어요.  ·  시간**이** 있어요.\n\nSame consonant/vowel split you already know.' },

      { t:'choice', q:'“I have no money.” — 돈 ends in ㄴ, a consonant.',
        options:['돈이 없어요','돈가 없어요','돈이 안 있어요','돈을 없어요'], answer:0,
        why:'돈 ends in a consonant → **이**. 돈가 uses the vowel form; 안 있어요 is not said in Korean — the negative word is 없어요; 을 marks an object, but 없어요 takes a subject.' },

      { t:'cloze', sentence:'오늘은 시간이 [없어요].', answer:'없어요',
        meaning:'I don’t have time today.',
        options:['없어요','있어요'],
        keys:['없어요','있어요'],
        why:'없어요 is the “there is none / I don’t have” half of the pair.' },

      { t:'type', q:'“Do you have time?”  시간 ___?',
        answer:'있어요', keys:['있어요','없어요'],
        why:'있어요 with a rising intonation is the question. Korean does not reorder words to ask.' },

      { t:'speak', say:'화장실이 어디에 있어요?', q:'Ask where the bathroom is.' },
    ],
  },

  {
    id: 'bg-06-02',
    title: 'Lesson 2. 에 or 에서? Look at the verb',
    minutes: 7,
    blocks: [
      { t:'text', md:'English uses *at* for both of these:\n\nI am **at** home.  ·  I study **at** home.\n\nKorean does not. It uses **에** for the first and **에서** for the second — and the choice is decided by **the verb**, not by the place.' },

      { t:'table', head:['Use','When','Example'], rows:[
        ['**에**','the place where something **is**','집**에** 있어요 — I am at home'],
        ['**에서**','the place where something **happens**','집**에서** 공부해요 — I study at home'],
      ]},

      { t:'note', md:'The test that always works: **ask what the verb is doing.**\n\n있다 · 없다 · 살다 · 가다 · 오다 → the place is a **location or destination** → **에**\nanything you *do* (먹다, 공부하다, 일하다, 만나다) → the place is a **stage for the action** → **에서**' },

      { t:'chars', wide:true, items:[
        { ch:'저는 집에 있어요.', tip:'I am at home. 있다 → 에' },
        { ch:'저는 집에서 공부해요.', tip:'I study at home. 공부하다 → 에서' },
        { ch:'학교에 가요.', tip:'I go to school. 가다 is a destination → 에' },
        { ch:'학교에서 친구를 만나요.', tip:'I meet a friend at school. 만나다 → 에서' },
      ]},

      { t:'choice', q:'“I eat at the restaurant.”  식당___ 먹어요',
        options:['식당에서','식당에','식당은','식당이'], answer:0,
        why:'먹다 is an action, so the restaurant is where it **happens** → **에서**. **에** would be for being or going there (식당에 가요); **은** marks a topic and **이** a subject.' },

      { t:'cloze', sentence:'저는 지금 집[에] 있어요.', answer:'에',
        meaning:'I am at home right now.',
        options:['에','에서','은','으로'],
        keys:['에','에서','은','으로'],
        why:'있다 asks *where something is*, so it takes **에**. **에서** would be for an action done there, **은** marks a topic, **으로** means toward or by means of.' },

      { t:'cloze', sentence:'매일 회사[에서] 일해요.', answer:'에서',
        meaning:'I work at the company every day.',
        options:['에서','에','까지','도'],
        keys:['에서','에','까지','도'],
        why:'일하다 is something you **do**, so the place is a stage → **에서**. **에** marks location or destination, **까지** means “up to”, **도** means “also”.' },

      { t:'pair', q:'Match each verb with the particle its place takes.',
        pairs:[['있다','에'],['공부하다','에서'],['가다','에'],['만나다','에서']] },

      { t:'speak', say:'저는 집에서 공부해요.', q:'Say it out loud.' },
    ],
  },

  {
    id: 'bg-06-03',
    title: 'Lesson 3. 에 for time',
    minutes: 5,
    blocks: [
      { t:'text', md:'The same **에** also marks **when** something happens.\n\n세 시**에** 만나요.  — Let’s meet at three.\n월요일**에** 가요.  — I go on Monday.' },

      { t:'note', md:'**A few time words refuse 에.** 오늘 · 어제 · 내일 · 지금 · 매일 take no particle at all.\n\n내일 만나요.  (○)\n내일에 만나요.  (✗)\n\nThere is no rule to derive here — these are simply the common ones, and they are common enough that you will absorb them fast.' },

      { t:'chars', wide:true, items:[
        { ch:'아침에 커피를 마셔요.', tip:'I drink coffee in the morning.' },
        { ch:'주말에 뭐 해요?', tip:'What do you do on the weekend?' },
        { ch:'내일 학교에 가요.', tip:'I go to school tomorrow. 내일 takes no 에 — but 학교 does.' },
      ]},

      { t:'choice', q:'Which sentence is wrong?',
        options:['일요일에 쉬어요','아침에 운동해요','내일에 만나요','세 시에 가요'], answer:2,
        why:'내일 is one of the time words that take **no particle** — 내일 만나요. 일요일, 아침 and 세 시 all take **에** normally.' },

      { t:'cloze', sentence:'우리 일곱 시[에] 만나요.', answer:'에',
        meaning:'Let’s meet at seven.',
        options:['에','에서','부터','까지'],
        keys:['에','에서','부터','까지'],
        why:'A clock time takes **에**. **에서** is for places where actions happen, **부터** means “from”, **까지** means “until”.' },

      { t:'speak', say:'주말에 뭐 해요?', q:'Ask what someone does on the weekend.' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-07 — 하다 동사와 억양
   2강이 이 단계에서 학습자가 가장 크게 트이는 자리다. 평서·의문·청유가
   -아/어요 하나로 같고 억양만 다르다는 것. 목록에는 16·17·18 로 따로
   적혀 있지만 한 레슨에서 같이 봐야 "같다" 는 사실이 뜻을 갖는다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-07',
  emoji: '🎵',
  title: '하다 Verbs, and One Ending for Three Jobs',
  tagline: 'The biggest verb family, and why 해요 is a statement, a question and an invitation.',
  blurb: 'Hundreds of Korean verbs are just a noun plus 하다 — so learning one pattern unlocks all of them at once. Then comes the discovery that surprises everyone: the same 해요 does three different jobs, and only your voice tells them apart.',
  lv: 'bg',
  level: 'Beginner',
  needs: 'bg-d-01',
  lessons: [

  {
    id: 'bg-07-01',
    title: 'Lesson 1. 공부하다 → 공부해요',
    minutes: 6,
    blocks: [
      { t:'text', md:'You already know 하다 → **해요**. The payoff is bigger than one verb: **a huge share of Korean verbs are just a noun with 하다 stuck on the end.**' },

      { t:'table', head:['Noun','+ 하다','해요 form'], rows:[
        ['공부 (study)','공부하다','공부**해요**'],
        ['일 (work)','일하다','일**해요**'],
        ['운동 (exercise)','운동하다','운동**해요**'],
        ['요리 (cooking)','요리하다','요리**해요**'],
        ['전화 (phone call)','전화하다','전화**해요**'],
      ]},

      { t:'note', md:'This means **every new 하다 noun you learn is a free verb.** Learn the noun 청소 (cleaning) and you can immediately say 청소해요. No conjugation to work out — the 하다 half always becomes 해요.' },

      { t:'chars', wide:true, items:[
        { ch:'저는 매일 운동해요.', tip:'I exercise every day.' },
        { ch:'카페에서 공부해요.', tip:'I study at the cafe. Note 에서 — studying is an action.' },
        { ch:'친구한테 전화해요.', tip:'I call my friend.' },
      ]},

      { t:'choice', q:'“I cook at home.”',
        options:['집에서 요리해요','집에 요리해요','집에서 요리하요','집에서 요리에요'], answer:0,
        why:'요리하다 is an action so the place takes **에서**, and 하다 becomes **해요**. 요리하요 is the mistake of conjugating 하다 regularly — it never does that. 요리에요 confuses the noun ending 이에요/예요 with a verb.' },

      { t:'cloze', sentence:'저는 은행에서 [일해요].', answer:'일해요',
        meaning:'I work at a bank.',
        options:['일해요','일하요','일이에요','일에요'],
        keys:['일해요','일하요','일이에요','일에요'],
        why:'하다 always turns into **해요**. 일하요 applies the regular rule, which 하다 refuses. 일이에요 means “it is work” — a noun sentence, not an action.' },

      { t:'type', q:'“I study every day.”  저는 매일 ___',
        answer:'공부해요', keys:['공부해요','공부하요','공부이에요'],
        why:'공부 + 하다 → 공부해요.' },

      { t:'speak', say:'저는 카페에서 공부해요.', q:'Say it out loud.' },
    ],
  },

  {
    id: 'bg-07-02',
    title: 'Lesson 2. One form, three meanings',
    minutes: 6,
    blocks: [
      { t:'text', md:'Here is something English speakers find hard to believe at first.\n\n커피 마셔요.\n\nThat one sentence can mean **three different things**, and nothing in the writing tells you which. Only the voice does.' },

      { t:'table', head:['You mean','How you say it','English'], rows:[
        ['a statement','커피 마셔요. *(falling)*','I drink coffee.'],
        ['a question','커피 마셔요? *(rising)*','Do you drink coffee?'],
        ['an invitation','커피 마셔요! *(bright, to someone)*','Let’s have coffee.'],
      ]},

      { t:'note', md:'**Korean does not reorder words to ask a question.** English flips *you are* into *are you*. Korean leaves the sentence exactly as it is and lifts the end of it. This is why Korean questions feel so easy once you notice it — there is nothing extra to learn.' },

      { t:'chars', wide:true, items:[
        { ch:'같이 밥 먹어요.', tip:'Falling: “I eat with them.” Bright and toward someone: “Let’s eat together.”' },
        { ch:'어디 가요?', tip:'Where are you going? — rising at the end.' },
        { ch:'내일 만나요.', tip:'Statement, or the everyday way to say “See you tomorrow.”' },
      ]},

      { t:'choice', q:'Your friend says “주말에 영화 봐요!” warmly while looking at you. What is it?',
        options:['An invitation — let’s watch a movie','A statement about their own weekend','A question about your weekend','A command telling you to watch'], answer:0,
        why:'Said brightly toward you, the plain 해요 form is the everyday way to suggest doing something together. Falling and about themselves it would be a statement; rising it would be a question. A direct command would normally use **-(으)세요** — 보세요.' },

      { t:'cloze', sentence:'(친구에게) 우리 같이 밥 [먹어요].', answer:'먹어요',
        meaning:'(to a friend) Let’s eat together.',
        options:['먹어요','먹어요?','먹이에요','먹다'],
        keys:['먹어요','먹어요?','먹이에요','먹다'],
        why:'The invitation uses the same plain **먹어요**. With a question mark it becomes a question; 먹이에요 wrongly attaches the noun ending; 먹다 is the dictionary form, which is not used to speak to someone.' },

      { t:'order', q:'Build “Where are you going?”',
        tokens:['어디','가요'], answer:['어디','가요'] },

      { t:'speak', say:'우리 같이 밥 먹어요.', q:'Say it as an invitation — bright, ending lifted a little.' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-08 — 을/를 과 은/는 첫걸음
   **여기서 이/가 와 은/는 을 대조하지 않는다.** 그건 bg-04 의 일이고
   초급 뒤쪽이다. 지금 대조하면 문장 하나 만들 때마다 멈춘다.
   여기서는 은/는 을 "저는~" 의 그 조사로만 쓰게 한다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-08',
  emoji: '🏷️',
  title: 'Two Tags: 을/를 and 은/는',
  tagline: 'Mark what you act on, and what you are talking about.',
  blurb: 'Korean word order can move around because little tags say what each noun is doing. Two of them get you through most sentences: 을/를 for the thing you act on, and 은/는 for the thing you are talking about.',
  lv: 'bg',
  level: 'Beginner',
  needs: 'bg-07',
  lessons: [

  {
    id: 'bg-08-01',
    title: 'Lesson 1. 을 / 를 — the thing you act on',
    minutes: 6,
    blocks: [
      { t:'text', md:'When a verb acts **on** something, that something gets tagged with **을** or **를**.\n\n커피**를** 마셔요.  — I drink coffee.\n밥**을** 먹어요.  — I eat rice.' },

      { t:'text', h:'Same split as always', md:'**을** after a consonant  ·  **를** after a vowel' },

      { t:'table', head:['Noun','Ends in','With the tag'], rows:[
        ['밥','consonant ㅂ','밥**을**'],
        ['책','consonant ㄱ','책**을**'],
        ['커피','vowel ㅣ','커피**를**'],
        ['영화','vowel ㅏ','영화**를**'],
      ]},

      { t:'note', md:'**Only verbs that act on something take 을/를.** 가다, 있다, 자다 do not act on anything — nothing gets the tag. 학교를 가요 is something you will hear, but 학교**에** 가요 is the form to learn: going has a destination, not an object.' },

      { t:'chars', wide:true, items:[
        { ch:'매일 책을 읽어요.', tip:'I read a book every day.' },
        { ch:'저는 영화를 봐요.', tip:'I watch a movie.' },
        { ch:'친구를 만나요.', tip:'I meet a friend. In Korean the friend is acted on — so 를, not 에게.' },
      ]},

      { t:'choice', q:'“I eat rice.”  밥 ends in ㅂ, a consonant.',
        options:['밥을 먹어요','밥를 먹어요','밥이 먹어요','밥에 먹어요'], answer:0,
        why:'A consonant takes **을**. 밥를 uses the vowel form; 밥이 marks it as the subject, which would mean the rice is doing the eating; 밥에 would mark a place or time.' },

      { t:'cloze', sentence:'저는 커피[를] 마셔요.', answer:'를',
        meaning:'I drink coffee.',
        options:['를','을','가','에'],
        keys:['를','을','가','에'],
        why:'커피 ends in a vowel → **를**. **을** is the same tag after a consonant, **가** marks a subject, **에** marks place or time.' },

      { t:'pair', q:'Match each noun with the object tag it takes.',
        pairs:[['밥','을'],['커피','를'],['책','을'],['영화','를']] },

      { t:'order', q:'Build “I watch a movie.”',
        tokens:['저는','영화를','봐요'], answer:['저는','영화를','봐요'] },

      { t:'speak', say:'저는 매일 책을 읽어요.', q:'Say it out loud.' },
    ],
  },

  {
    id: 'bg-08-02',
    title: 'Lesson 2. 은 / 는 — what you are talking about',
    minutes: 6,
    blocks: [
      { t:'text', md:'You have been using this since your first sentence:\n\n**저는** 학생이에요.\n\n**은/는** puts a noun up front and says: *this is what I am talking about.* English often reaches for “as for…”.\n\n저**는** 커피를 마셔요.  — **As for me**, I drink coffee.' },

      { t:'text', h:'Same split, one more time', md:'**은** after a consonant  ·  **는** after a vowel\n\n선생님**은**  ·  저**는**' },

      { t:'note', md:'**Do not worry yet about 은/는 versus 이/가.** That comparison is real, and it has a whole course of its own later. Right now one habit carries you a long way: **use 은/는 on the person or thing your sentence is about, usually at the very front.**' },

      { t:'chars', wide:true, items:[
        { ch:'저는 한국 사람이에요.', tip:'As for me, I am Korean.' },
        { ch:'제 동생은 학생이에요.', tip:'My younger sibling is a student.' },
        { ch:'오늘은 시간이 없어요.', tip:'Today, I have no time. 은/는 can mark time too — “as for today”.' },
      ]},

      { t:'text', h:'It also does contrast', md:'Put 은/는 on two things and the sentence sets them against each other.\n\n커피**는** 좋아해요. 그런데 차**는** 안 좋아해요.\n— I like coffee. But tea, I don’t.' },

      { t:'choice', q:'“My friend is a doctor.”  친구 ends in ㅜ, a vowel.',
        options:['제 친구는 의사예요','제 친구은 의사예요','제 친구를 의사예요','제 친구에 의사예요'], answer:0,
        why:'A vowel takes **는**. 친구은 uses the consonant form; **를** marks something acted on, and 이에요 does not act on anything; **에** marks place or time.' },

      { t:'cloze', sentence:'오늘[은] 시간이 없어요.', answer:'은',
        meaning:'Today I have no time.',
        options:['은','는','을','에'],
        keys:['은','는','을','에'],
        why:'오늘 ends in a consonant → **은**, setting today apart from other days. **는** is the vowel form, **을** marks an object, **에** marks time — but 오늘 is one of the words that refuses 에.' },

      { t:'order', q:'Build “As for me, I drink coffee.”',
        tokens:['저는','커피를','마셔요'], answer:['저는','커피를','마셔요'] },

      { t:'speak', say:'저는 커피를 좋아해요.', q:'Say it out loud.' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-09 — 안 과 못
   각각 한 강씩 하고 3강에서 붙인다(설계 원칙 ④). 처음부터 대조하면
   둘 다 안 남는다. 짧은 형(안/못)을 먼저 주는 이유는 말할 때 그게
   먼저 나오기 때문이다 — 긴 형은 곁들여 보여만 준다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-09',
  emoji: '🚫',
  title: 'Saying No — 안 and 못',
  tagline: 'Don’t, and can’t. Korean keeps them apart.',
  blurb: 'English says “I don’t” for both choosing not to and being unable to. Korean does not. 안 is about will, 못 is about ability — and picking the wrong one changes what you are telling people about yourself.',
  lv: 'bg',
  level: 'Beginner',
  needs: 'bg-08',
  lessons: [

  {
    id: 'bg-09-01',
    title: 'Lesson 1. 안 — I don’t',
    minutes: 5,
    blocks: [
      { t:'text', md:'Put **안** directly in front of the verb.\n\n저는 커피를 **안** 마셔요.  — I don’t drink coffee.' },

      { t:'note', md:'**하다 verbs split.** 공부하다 does not become 안 공부해요 — the 안 goes **inside**, right before 하다:\n\n공부**를 안 해요**  or  공부 **안 해요**  (○)\n**안** 공부해요  (✗)\n\nThis catches everyone once. After that it feels natural, because 공부 is really a noun.' },

      { t:'chars', wide:true, items:[
        { ch:'저는 술을 안 마셔요.', tip:'I don’t drink alcohol.' },
        { ch:'오늘은 학교에 안 가요.', tip:'I’m not going to school today.' },
        { ch:'주말에는 일 안 해요.', tip:'I don’t work on weekends. Note the split in 일하다.' },
      ]},

      { t:'text', h:'There is a longer form too', md:'**-지 않아요** means the same thing and sounds a little more formal or written.\n\n안 마셔요  =  마시**지 않아요**\n\nLearn to recognise it now; 안 is what you will actually say.' },

      { t:'choice', q:'“I don’t exercise.”  (운동하다)',
        options:['운동 안 해요','안 운동해요','운동을 안이에요','운동하지 안아요'], answer:0,
        why:'하다 verbs split, so **안** sits right before 해요. 안 운동해요 puts it outside, which 하다 verbs refuse. 운동을 안이에요 mixes in the noun ending; the long form is written 운동하지 **않**아요, not 안아요.' },

      { t:'cloze', sentence:'저는 커피를 [안] 마셔요.', answer:'안',
        meaning:'I don’t drink coffee.',
        options:['안','못','잘','다'],
        keys:['안','못','잘','다'],
        why:'**안** says you choose not to. **못** would say you are unable to, **잘** means “well”, **다** means “all”.' },

      { t:'speak', say:'저는 술을 안 마셔요.', q:'Say it out loud.' },
    ],
  },

  {
    id: 'bg-09-02',
    title: 'Lesson 2. 못 — I can’t',
    minutes: 5,
    blocks: [
      { t:'text', md:'**못** goes in the same slot as 안, but means something different: **I am unable to.**\n\n저는 수영을 **못** 해요.  — I can’t swim.\n\nNot a choice. A limit — no skill, no time, no permission, something in the way.' },

      { t:'note', md:'**못 splits in 하다 verbs too**, exactly like 안:\n\n수영 **못 해요**  (○)  ·  **못** 수영해요  (✗)' },

      { t:'chars', wide:true, items:[
        { ch:'저는 매운 음식을 못 먹어요.', tip:'I can’t eat spicy food.' },
        { ch:'오늘은 바빠서 못 가요.', tip:'I’m busy today so I can’t go.' },
        { ch:'한국어를 아직 잘 못 해요.', tip:'I still can’t speak Korean well.' },
      ]},

      { t:'text', h:'The longer form', md:'**-지 못해요** matches 못 the way -지 않아요 matches 안.\n\n못 가요  =  가**지 못해요**' },

      { t:'cloze', sentence:'저는 매운 음식을 [못] 먹어요.', answer:'못',
        meaning:'I can’t eat spicy food.',
        options:['못','안','잘','또'],
        keys:['못','안','잘','또'],
        why:'Spicy food defeating you is an inability → **못**. **안** would mean you simply choose not to, **잘** means “well”, **또** means “again”.' },

      { t:'type', q:'“I can’t swim.”  저는 수영을 ___ 해요',
        answer:'못', keys:['못','안','잘'],
        why:'Not knowing how is an inability → 못.' },

      { t:'speak', say:'저는 매운 음식을 못 먹어요.', q:'Say it out loud.' },
    ],
  },

  {
    id: 'bg-09-03',
    title: 'Lesson 3. 안 or 못 — will, or ability',
    minutes: 6,
    blocks: [
      { t:'text', md:'Now put them side by side. Same sentence, one word different, and you have said two very different things about yourself.\n\n술을 **안** 마셔요.  — I don’t drink. *(my choice)*\n술을 **못** 마셔요.  — I can’t drink. *(my body won’t let me)*' },

      { t:'table', head:['','안','못'], rows:[
        ['means','choose not to','unable to'],
        ['about','will','ability or circumstance'],
        ['고기를 …','안 먹어요 — I’m vegetarian','못 먹어요 — it makes me ill'],
      ]},

      { t:'note', md:'**This matters socially.** Turning down food with 안 먹어요 says you did not want it. 못 먹어요 says you cannot have it. Koreans hear the difference immediately, and the second one is the polite way out of a dish you must refuse.' },

      { t:'choice', q:'You are allergic to peanuts. Someone offers you some. What do you say?',
        options:['땅콩을 못 먹어요','땅콩을 안 먹어요','땅콩을 잘 먹어요','땅콩을 다 먹어요'], answer:0,
        why:'An allergy is a limit, not a preference → **못**. 안 먹어요 would sound like you simply don’t care for them, 잘 먹어요 says you eat them well, and 다 먹어요 says you ate them all.' },

      { t:'cloze', sentence:'오늘은 바빠서 [못] 가요.', answer:'못',
        meaning:'I’m busy today, so I can’t go.',
        options:['못','안','잘','더'],
        keys:['못','안','잘','더'],
        why:'Being busy is a circumstance stopping you → **못**. **안** would mean you decided not to go, **잘** means “well”, **더** means “more”.' },

      { t:'cloze', sentence:'저는 채식해서 고기를 [안] 먹어요.', answer:'안',
        meaning:'I’m vegetarian, so I don’t eat meat.',
        options:['안','못','아직','벌써'],
        keys:['안','못','아직','벌써'],
        why:'Being vegetarian is a choice → **안**. **못** would suggest something prevents you, **아직** means “not yet”, **벌써** means “already”.' },

      { t:'speak', say:'저는 술을 못 마셔요.', q:'Say it out loud.' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-irr-01 — 모양이 바뀌는 동사 ①
   목차에서 가장 크게 옮긴 부분이다. 문법서는 불규칙을 맨 뒤(Unit 24)에
   두지만, 아프다·바쁘다·덥다·춥다·맵다는 초급 첫 달 단어다. -아/어요 를
   배운 바로 다음에 부딪히므로 여기 둔다. 근거는 curriculum-beginner.md §5.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-irr-01',
  emoji: '🔀',
  title: 'Verbs That Change Shape ①',
  tagline: 'ㅡ and ㅂ — the two you meet in your first month.',
  blurb: 'Most textbooks park irregular verbs at the very end. That is too late: 아프다, 바쁘다, 덥다 and 맵다 are first-month words, and you will need them the week after you learn -아/어요. Here are the two patterns that cover them.',
  lv: 'bg',
  level: 'Beginner',
  needs: 'bg-d-01',
  lessons: [

  {
    id: 'bg-irr-01-01',
    title: 'Lesson 1. ㅡ drops out',
    minutes: 6,
    blocks: [
      { t:'text', md:'Some stems end in **ㅡ**, a vowel so weak it simply gets out of the way.\n\n아프다 → 아프 + 아요 → **아파요**\n\nThe ㅡ vanishes, and the ending attaches to what is left.' },

      { t:'text', h:'Which ending, once ㅡ is gone?', md:'Look at the vowel **before** the ㅡ.\n\n아프 → the vowel before ㅡ is **ㅏ** → 아요 → **아파요**\n예쁘 → the vowel before ㅡ is **ㅖ** → 어요 → **예뻐요**\n\nIf there is no vowel before it at all, use **어요**: 쓰다 → **써요**.' },

      { t:'table', head:['Dictionary','Meaning','해요 form'], rows:[
        ['아프다','to hurt','**아파요**'],
        ['바쁘다','to be busy','**바빠요**'],
        ['배고프다','to be hungry','**배고파요**'],
        ['예쁘다','to be pretty','**예뻐요**'],
        ['쓰다','to write / use','**써요**'],
      ]},

      { t:'note', md:'**Every stem ending in ㅡ does this — there are no exceptions.** That makes it the friendliest pattern in Korean. Notice how much you can already say: 아파요, 바빠요, 배고파요 are three of the most common sentences in daily life.' },

      { t:'chars', wide:true, items:[
        { ch:'머리가 아파요.', tip:'I have a headache. 아프다 → 아파요' },
        { ch:'요즘 정말 바빠요.', tip:'I’m really busy these days.' },
        { ch:'저 지금 배고파요.', tip:'I’m hungry right now.' },
      ]},

      { t:'choice', q:'바쁘다 → ?  (the vowel before ㅡ is ㅏ)',
        options:['바빠요','바뻐요','바쁘어요','바쁘아요'], answer:0,
        why:'ㅡ drops and ㅏ decides the ending → **바빠요**. 바뻐요 picks the wrong ending; 바쁘어요 and 바쁘아요 leave the ㅡ in place, which never happens.' },

      { t:'cloze', sentence:'머리가 [아파요].', answer:'아파요',
        meaning:'My head hurts.',
        options:['아파요','아프어요','아퍼요','아프아요'],
        keys:['아파요','아프어요','아퍼요','아프아요'],
        why:'ㅡ drops, and the ㅏ in 아 pulls **아요** → 아파요. The other three either keep the ㅡ or choose the wrong ending.' },

      { t:'type', q:'“I’m hungry.”  저 지금 ___  (배고프다)',
        answer:'배고파요', keys:['배고파요','배고퍼요','배고프어요'],
        why:'ㅡ drops; the vowel before it is ㅗ, so 아요 → 배고파요.' },

      { t:'speak', say:'요즘 정말 바빠요.', q:'Say it out loud.' },
    ],
  },

  {
    id: 'bg-irr-01-02',
    title: 'Lesson 2. ㅂ turns into 우',
    minutes: 6,
    blocks: [
      { t:'text', md:'A batch of adjectives end in **ㅂ**. Before a vowel ending, that ㅂ becomes **우**.\n\n덥다 → 더 + **우** + 어요 → **더워요**\n\nThese are weather-and-taste words, which is exactly what beginners talk about.' },

      { t:'table', head:['Dictionary','Meaning','해요 form'], rows:[
        ['덥다','to be hot','**더워요**'],
        ['춥다','to be cold','**추워요**'],
        ['맵다','to be spicy','**매워요**'],
        ['어렵다','to be difficult','**어려워요**'],
        ['쉽다','to be easy','**쉬워요**'],
        ['맛있다','to be tasty','맛있어요 — *regular, no change*'],
      ]},

      { t:'note', md:'**Not every ㅂ stem changes.** 입다 (to wear) and 좁다 (to be narrow) are regular: 입어요, 좁아요. There is no way to tell by looking — you learn which ones change as you meet them. The good news is that the irregular ones are mostly adjectives, and the common ones fit on the list above.' },

      { t:'chars', wide:true, items:[
        { ch:'오늘 너무 더워요.', tip:'It’s so hot today.' },
        { ch:'이 음식 좀 매워요.', tip:'This food is a bit spicy.' },
        { ch:'한국어가 어려워요.', tip:'Korean is difficult.' },
      ]},

      { t:'choice', q:'춥다 → ?',
        options:['추워요','춥어요','추어요','춥아요'], answer:0,
        why:'ㅂ becomes 우, then 어요 attaches → **추워요**. 춥어요 and 춥아요 leave the ㅂ in place; 추어요 drops it without putting 우 there.' },

      { t:'cloze', sentence:'이 음식이 너무 [매워요].', answer:'매워요',
        meaning:'This food is too spicy.',
        options:['매워요','맵어요','매어요','맵아요'],
        keys:['매워요','맵어요','매어요','맵아요'],
        why:'맵다 is one of the changing ones: ㅂ → 우 → **매워요**. The others keep the ㅂ or lose it without the 우.' },

      { t:'choice', q:'One of these verbs does **not** change its ㅂ. Which?',
        options:['입다','덥다','맵다','어렵다'], answer:0,
        why:'입다 is regular — 입어요. 덥다, 맵다 and 어렵다 all turn the ㅂ into 우: 더워요, 매워요, 어려워요.' },

      { t:'type', q:'“It’s cold today.”  오늘 ___  (춥다)',
        answer:'추워요', keys:['추워요','춥어요','추어요'],
        why:'ㅂ → 우, then 어요 → 추워요.' },

      { t:'speak', say:'오늘 너무 더워요.', q:'Say it out loud.' },
    ],
  },

  ],
},

];
