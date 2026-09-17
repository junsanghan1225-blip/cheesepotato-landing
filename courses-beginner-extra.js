/* ══════════════════════════════════════════════════════════════
   초급 추가 코스 — 필수 실용 표현
   ──────────────────────────────────────────────────────────────
   docs/curriculum-beginner.md §8 에 제안된 "초급에 꼭 필요한 것"
   문법 목록 110개에는 없지만, 실제 일상생활과 물건 구매·소통에
   절대 빠질 수 없는 단위명사와 의문사를 체계적으로 다룬다.

   ── 코스 구성 ───────────────────────────────────────────────
   - bg-35: 단위명사와 몇 (3강)
   ══════════════════════════════════════════════════════════════ */

export const BEGINNER_EXTRA_COURSES = [

/* ═══════════════════════════════════════════════════════════════
   bg-35 — 단위명사와 몇
   순우리말 숫자의 축약형(하나→한, 둘→두, 셋→세, 넷→네, 스물→스무)과
   사물(개), 사람/동물(명/분, 마리), 음료/책/나이(잔, 병, 권, 살)
   및 의문사 '몇'의 실전 활용법을 마스터합니다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-35',
  emoji: '🔢',
  title: { ko:'단위명사와 몇', en:'Counter Nouns & How Many' },
  tagline: { ko:'물건을 사고 주문할 때 반드시 필요한 한국어 수 세기 비결', en:'Essential counters and number contraction rules for shopping and ordering.' },
  blurb: { ko:'순우리말 숫자의 축약형(하나→한, 둘→두, 셋→세, 넷→네, 스물→스무)과 범용 사물 단위(개), 사람과 동물(명/분, 마리), 음료와 책·나이(잔, 병, 권, 살) 및 의문사 "몇"의 실전 활용법을 마스터합니다.',
           en:'Master Native Korean counter contractions (한, 두, 세, 네, 스무), universal counters (개), people and animals (명/분, 마리), drinks, books, and age (잔, 병, 권, 살), and asking quantities with "몇".' },
  level: 'Beginner',
  needs: 'bg-34',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-35-01',
    title: { ko:'1강. 순우리말 수 축약형 + 개: 사물 세기와 몇', en:'Lesson 1. Number Contractions & 개: Counting Objects & "How Many"' },
    minutes: 7,
    blocks: [
      { t:'text', md:'In Korean, counting items requires special **counter nouns** paired with **Native Korean numbers** (*하나, 둘, 셋, 넷, 다섯...*).\n\n**⚡ THE CRITICAL CONTRACTION RULE**:\nThe first four numbers change form right before a counter noun:\n\n- **하나 (1)** → **한 개** *(one item)*\n- **둘 (2)** → **두 개** *(two items)*\n- **셋 (3)** → **세 개** *(three items)*\n- **넷 (4)** → **네 개** *(four items)*\n- *(From 5 onward, numbers do NOT change: 다섯 개, 여섯 개, 일곱 개, 여덟 개, 아홉 개, 열 개!)*\n\n**개** is the universal counter for items, fruits, snacks, and general objects!' },

      { t:'note', md:'**The Magic Question Word: 몇 (How many / Some)**\n\nWhenever you want to ask *"How many?"* or say *"a few"*, place **몇** directly before the counter noun:\n\n- **몇 개** = *How many items?*\n  - *“사과 **몇 개** 있어요?”* *(How many apples do you have?)*\n  - *“사과 **두 개** 주세요.”* *(Please give me two apples.)*\n- **몇** is always paired directly with a counter noun!' },

      { t:'table', head:['Number','Standalone Form','Contraction before 개','Example with Noun'], rows:[
        ['1','하나 (hana)','**한 개**','사과 **한 개** (one apple)'],
        ['2','둘 (dul)','**두 개**','빵 **두 개** (two loaves of bread)'],
        ['3','셋 (set)','**세 개**','지우개 **세 개** (three erasers)'],
        ['4','넷 (net)','**네 개**','의자 **네 개** (four chairs)'],
        ['5','다섯 (daseot)','**다섯 개** (no change)','달걀 **다섯 개** (five eggs)'],
        ['?','몇 (how many)','**몇 개**','사과 **몇 개** 드릴까요?'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'사과 한 개 주세요.', tip:'Please give me one apple. (하나 → 한 개)' },
        { ch:'빵 두 개 샀어요.', tip:'I bought two breads. (둘 → 두 개)' },
        { ch:'사과 몇 개 드릴까요?', tip:'How many apples shall I give you? (몇 개)' },
      ]},

      { t:'choice', q:'You are at a grocery store and want to buy two apples. Which phrasing is grammatically correct?',
        options:['사과 두 개 주세요.','사과 둘 개 주세요.','사과 이 개 주세요.','사과 두 명 주세요.'], answer:0,
        why:'Before counter nouns, 둘 contracts to 두 (사과 두 개 주세요). 둘 개 is uncontracted, 이 is Sino-Korean, and 명 is for people.' },

      { t:'choice', q:'How do you ask a fruit vendor: "How many apples are there?"',
        options:['사과가 몇 개 있어요?','사과가 얼마 개 있어요?','사과가 무엇 개 있어요?','사과가 어디 개 있어요?'], answer:0,
        why:'To ask "how many items", use the interrogative modifier 몇 before the counter 개: 몇 개 있어요?' },

      { t:'choice', q:'How does the Native Korean number 셋 (3) change when attached to the counter noun 개?',
        options:['세 개','셋 개','삼 개','셋의 개'], answer:0,
        why:'셋 drops its final ㅅ to contract into 세 before a counter: 세 개.' },

      { t:'cloze', sentence:'가게에서 맛있는 빵 [두 개]를 샀어요.', answer:'두 개',
        options:['두 개','둘 개','이 개','두 명'],
        meaning:'I bought two loaves of delicious bread at the store.',
        why:'둘 contracts to 두 before the item counter 개: 두 개.' },

      { t:'order', q:'Put in order: "Please give me three fresh apples."',
        tokens:['신선한','사과','세','개','주세요.'], answer:['신선한','사과','세','개','주세요.'] },

      { t:'pair', q:'Match the English quantity with the contracted Korean counter phrase:', pairs:[
        ['One item', '한 개'],
        ['Two items', '두 개'],
        ['Three items', '세 개'],
        ['Four items', '네 개'],
      ]},

      { t:'correct', wrong:'축약형 누락 오류: 사과 하나 개 주세요.',
        answers:['사과 한 개 주세요.','사과 한 개 주세요'],
        hint:'Before a counter noun like 개, 하나 contracts to 한: 사과 한 개.',
        why:'하나 contracts to 한 before counters: 사과 한 개 주세요.' },

      { t:'translate', q:'Ordering: "Please give me three apples."',
        answers:['사과 세 개 주세요.','사과 세 개 주세요'],
        must:['사과','세','개','주세요'],
        hint:'사과 + 셋(세) + 개 + 주세요' },

      { t:'speak', say:'시장 가서 신선한 사과 세 개를 샀어요.', q:'Read aloud naturally focusing on the contracted number pronunciation 세 개:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-35-02',
    title: { ko:'2강. 사람과 동물: 명/분, 마리', en:'Lesson 2. People & Animals: 명 / 분 & 마리' },
    minutes: 7,
    blocks: [
      { t:'text', md:'When counting living beings, Korean uses specialized counters instead of **개**:\n\n1. **명 (General People Counter)**:\n   - Used for friends, students, coworkers, family, and people in general:\n   - *“학생 **세 명**”* *(three students)*\n   - *“친구 **네 명**”* *(four friends)*\n   - *“몇 **명**이에요?”* *(How many people are there?)*\n\n2. **분 (Honorific People Counter)**:\n   - The polite/honorific version of **명**! Used for honored elders, teachers, and guests/customers:\n   - *“선생님 **한 분**”* *(one teacher)*\n   - *“손님 **두 분**”* *(two valued guests)*\n   - *“몇 **분** 오세요?”* *(How many esteemed guests are coming?)*\n\n3. **마리 (Animal Counter)**:\n   - Used for all animals, pets, birds, and fish:\n   - *“강아지 **한 마리**”* *(one puppy)*\n   - *“고양이 **두 마리**”* *(two cats)*' },

      { t:'note', md:'**Restaurant Manners: 몇 분 vs. 몇 명**\n\nWhen you enter a restaurant in Korea, the host will greet you respectfully:\n- Host: *“어서 오세요! **몇 분**이세요?”* *(Welcome! How many in your party?)*\n\nWhen answering for yourself and your group, use the humble/neutral **명** (you never honor yourself with 분!):\n- You: *“**두 명**이에요.”* *(Two people, please.)*\n- Host to coworkers: *“손님 **두 분** 들어오십니다!”* *(Two guests entering!)*' },

      { t:'table', head:['Category','Counter','Used For','Example'], rows:[
        ['General People','**명**','Students, friends, general','친구 **두 명** (two friends)'],
        ['Honored People','**분**','Elders, teachers, customers','손님 **두 분** (two guests)'],
        ['Animals / Pets','**마리**','Dogs, cats, birds, fish','강아지 **한 마리** (one puppy)'],
        ['Question','**몇 명 / 몇 분**','Asking count of people','모두 **몇 명**이에요?'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'식당에서: 몇 분이세요?', tip:'How many in your party? (Host polite: 분)' },
        { ch:'친구 두 명을 만났어요.', tip:'I met two friends. (General people: 명)' },
        { ch:'귀여운 고양이 두 마리가 있어요.', tip:'There are two cute cats. (Animals: 마리)' },
      ]},

      { t:'choice', q:'A restaurant host greets your group politely at the door. What is the standard respectful question for party size?',
        options:['몇 분이세요?','몇 개이세요?','몇 살이세요?','몇 마리이세요?'], answer:0,
        why:'Hosts use the honorific counter 분 when addressing customers: 몇 분이세요? (개 is for objects, 살 is for age, 마리 is for animals).' },

      { t:'choice', q:'How do you state: "I raise one cute puppy at home"?',
        options:['집에서 귀여운 강아지 한 마리를 키워요.','집에서 귀여운 강아지 한 개를 키워요.','집에서 귀여운 강아지 한 명을 키워요.','집에서 귀여운 강아지 한 권을 키워요.'], answer:0,
        why:'Animals are counted with 마리: 강아지 한 마리를 키워요.' },

      { t:'choice', q:'The restaurant host asks: "몇 분이세요?" How do you naturally answer for you and your friend?',
        options:['두 명이에요.','두 분이에요.','두 개예요.','두 마리예요.'], answer:0,
        why:'When speaking about yourself or your own party, use the neutral counter 명: 두 명이에요. (You should not honor yourself with 분).' },

      { t:'cloze', sentence:'우리 집에는 고양이 [두 마리]가 함께 살고 있어요.', answer:'두 마리',
        options:['두 마리','둘 마리','두 명','두 개'],
        meaning:'In our home, two cats are living together.',
        why:'Cats are animals counted with 마리, and 둘 contracts to 두: 두 마리.' },

      { t:'order', q:'Put in order: "Our family is four people in total."',
        tokens:['우리','가족은','모두','네','명이에요.'], answer:['우리','가족은','모두','네','명이에요.'] },

      { t:'pair', q:'Match each noun with its proper counter noun:', pairs:[
        ['학생 (students)', '세 명'],
        ['선생님 (teacher)', '한 분'],
        ['손님 (guests)', '두 분'],
        ['강아지 (puppy)', '한 마리'],
      ]},

      { t:'correct', wrong:'단위 오류: 집에 귀여운 고양이 두 개를 키워요.',
        answers:['집에 귀여운 고양이 두 마리를 키워요.','집에 귀여운 고양이 두 마리를 키워요'],
        hint:'Animals like cats must be counted using 마리, not 개: 두 마리.',
        why:'Animals take the counter 마리: 고양이 두 마리를 키워요.' },

      { t:'translate', q:'People: "Two students are studying in the classroom."',
        answers:['교실에서 학생 두 명이 공부해요.','교실에서 학생 두 명이 공부해요','교실에 학생 두 명이 공부해요.','교실에 학생 두 명이 공부해요'],
        must:['학생','두','명이'],
        hint:'학생 + 둘(두) + 명 + 이 + 공부해요' },

      { t:'speak', say:'저희 집에 귀여운 강아지 한 마리가 있어요.', q:'Read aloud warmly sharing about your pet:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-35-03',
    title: { ko:'3강. 음료·책·나이: 잔, 병, 권, 살과 실전 종합', en:'Lesson 3. Drinks, Books, & Age: 잔, 병, 권, 살 & Practical Scenarios' },
    minutes: 8,
    blocks: [
      { t:'text', md:'Let’s master the final set of high-frequency counters used constantly in cafes, bookstores, and self-introductions:\n\n1. **잔 (Cups / Glasses)**:\n   - For coffee, tea, or water served in cups or glasses:\n   - *“아메리카노 **두 잔** 주세요.”* *(Two cups of Americano, please.)*\n   - *“물 **한 잔** 마셨어요.”* *(I drank a glass of water.)*\n\n2. **병 (Bottles)**:\n   - For liquids in glass or plastic bottles:\n   - *“생수 **한 병**”* *(one bottle of spring water)*\n   - *“콜라 **두 병**”* *(two bottles of cola)*\n\n3. **권 (Volumes / Books)**:\n   - For bound reading materials like books and notebooks:\n   - *“한국어 책 **세 권**”* *(three Korean books)*\n\n4. **살 (Age in Years)**:\n   - Used with Native Korean numbers to state age (*스물다섯 살이에요*).' },

      { t:'note', md:'**⚡ CRITICAL AGE EXCEPTION: 스물 → 스무 살!**\n\nWhen stating the age **20**, the number **스물** drops its final **ㄹ** to become **스무**:\n- **스무 살** *(20 years old — NOT 스물 살!)*\n- *“저는 올해 **스무 살**이에요.”* *(I am 20 years old this year.)*\n- Question: *“**몇 살**이에요?”* *(How old are you?)*' },

      { t:'table', head:['Item Type','Counter','Contracted Example','English Meaning'], rows:[
        ['Coffee / Tea','**잔 (jan)**','커피 **두 잔**','two cups of coffee'],
        ['Bottled Drinks','**병 (byeong)**','생수 **한 병**','one bottle of water'],
        ['Books / Notebooks','**권 (gwon)**','책 **세 권**','three books'],
        ['Age (Years)','**살 (sal)**','스물다섯 **살**','25 years old'],
        ['Age 20 (Special)','**살 (sal)**','**스무 살** *(not 스물)*','20 years old'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'아메리카노 두 잔 주세요.', tip:'Two cups of Americano, please. (Cafe order: 잔)' },
        { ch:'편의점에서 생수 한 병을 샀어요.', tip:'Bought a bottle of water at store. (병)' },
        { ch:'저는 올해 스무 살이에요.', tip:'I am 20 years old this year. (Age 20: 스무 살)' },
      ]},

      { t:'choice', q:'You are at a cafe counter ordering beverages. How do you say: "Please give me two cups of iced coffee"?',
        options:['아이스 커피 두 잔 주세요.','아이스 커피 둘 잔 주세요.','아이스 커피 두 개 주세요.','아이스 커피 두 병 주세요.'], answer:0,
        why:'Cups of coffee take the beverage counter 잔 with contracted 둘 → 두: 아이스 커피 두 잔 주세요.' },

      { t:'choice', q:'How do you correctly state the age 20 in Korean?',
        options:['스무 살이에요.','스물 살이에요.','이십 살이에요.','이십 개예요.'], answer:0,
        why:'The number 스물 drops its final ㄹ before the age counter 살: 스무 살 (never 스물 살).' },

      { t:'choice', q:'At a bookstore, you want to purchase three Korean textbooks. Which counter is correct for books?',
        options:['한국어 책 세 권을 샀어요.','한국어 책 세 잔을 샀어요.','한국어 책 세 장을 샀어요.','한국어 책 세 병을 샀어요.'], answer:0,
        why:'Bound books and volumes use the counter 권: 한국어 책 세 권을 샀어요.' },

      { t:'cloze', sentence:'카페에서 따뜻한 아메리카노 [두 잔]을 주문했어요.', answer:'두 잔',
        options:['두 잔','둘 잔','두 병','두 권'],
        meaning:'I ordered two cups of hot Americano at the cafe.',
        why:'Coffee in cups takes the counter 잔 with contraction 두: 두 잔.' },

      { t:'order', q:'Put in order: "Please give me one cup of warm coffee."',
        tokens:['따뜻한','커피','한','잔','주세요.'], answer:['따뜻한','커피','한','잔','주세요.'] },

      { t:'pair', q:'Match each item with its designated Korean counter:', pairs:[
        ['Coffee (2 cups)', '커피 두 잔'],
        ['Water (1 bottle)', '물 한 병'],
        ['Book (3 books)', '책 세 권'],
        ['Age (20 years old)', '스무 살'],
      ]},

      { t:'correct', wrong:'나이 20세 오류: 저는 올해 스물 살이에요.',
        answers:['저는 올해 스무 살이에요.','저는 올해 스무 살이에요'],
        hint:'스물 drops its final ㄹ before the counter 살: 스무 살.',
        why:'스물 drops ㄹ before the counter 살: 스무 살이에요.' },

      { t:'translate', q:'Cafe order: "Please give me two cups of coffee."',
        answers:['커피 두 잔 주세요.','커피 두 잔 주세요'],
        must:['커피','두','잔','주세요'],
        hint:'커피 + 둘(두) + 잔 + 주세요' },

      { t:'translate', q:'Bookstore: "I bought two Korean books."',
        answers:['한국어 책 두 권을 샀어요.','한국어 책 두 권을 샀어요'],
        must:['한국어','책','두','권을','샀어요'],
        hint:'한국어 책 + 둘(두) + 권을 + 샀어요' },

      { t:'speak', say:'카페에서 아이스 아메리카노 두 잔을 주문했어요.', q:'Read aloud naturally as if ordering clearly at a busy cafe counter:' },
    ],
  },

  ],
},


/* ═══════════════════════════════════════════════════════════════
   bg-36 — 의문사 10개
   사물·사람·장소(뭐, 누구, 어디), 때·까닭·방법(언제, 왜, 어떻게),
   가격과 미묘한 한정 의문사 4종(얼마, 무슨, 어떤, 어느)의
   뉘앙스 구분을 완벽하게 마스터합니다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-36',
  emoji: '❓',
  title: { ko:'의문사 10개', en:'10 Essential Question Words' },
  tagline: { ko:'원하는 것을 정확히 묻고 답하는 한국어 10대 핵심 의문사 완벽 정복', en:'Master the 10 essential Korean question words to ask and answer anything.' },
  blurb: { ko:'사물·사람·장소의 기본 셋(뭐, 누구, 어디)부터 시간·이유·방법(언제, 왜, 어떻게), 그리고 가격(얼마)과 초급 학습자가 가장 헷갈려하는 종류·성질·선택 의문사(무슨, 어떤, 어느)의 실전 뉘앙스 차이를 체계적으로 정복합니다.',
           en:'Master the 10 core Korean question words: foundational nouns (뭐, 누구, 어디), circumstances and reasons (언제, 왜, 어떻게), and nuanced determiners (얼마, 무슨, 어떤, 어느).' },
  level: 'Beginner',
  needs: 'bg-35',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-36-01',
    title: { ko:'1강. 뭐·누구·어디: 가장 기본적인 세 의문사', en:'Lesson 1. 뭐 · 누구 · 어디: Things, People, & Places' },
    minutes: 7,
    blocks: [
      { t:'text', md:'Asking questions is the fastest way to start real conversations in Korean! Let’s master the three most fundamental question words that stand in for objects, people, and places:\n\n1. **뭐 (What)**:\n   - A natural everyday contraction of **무엇** (*what*):\n   - *“이거 **뭐**예요?”* *(What is this?)*\n   - *“점심에 **뭐** 먹을래요?”* *(What do you want to eat for lunch?)*\n   - *(When paired with the object particle 을/를, 무엇을 often contracts to 뭘: “**뭘** 마실래요?”)*\n\n2. **누구 (Who)**:\n   - Used to ask about a person’s identity:\n   - *“저 사람 **누구**예요?”* *(Who is that person?)*\n   - *“주말에 **누구**를 만났어요?”* *(Whom did you meet over the weekend?)*\n\n3. **어디 (Where)**:\n   - Used to ask about places, locations, and destinations:\n   - *“화장실이 **어디**예요?”* *(Where is the restroom?)*\n   - *“지금 **어디**에 가요?”* *(Where are you going right now?)*\n   - *“**어디**에서 살아요?”* *(Where do you live?)*' },

      { t:'note', md:'**⚡ CRITICAL GRAMMAR RULE: 누구 + 가 = 누가!**\n\nWhen the subject particle **-가** attaches to **누구** (*who*), it **NEVER** stays as *누구가*. Instead, it always contracts into **누가**:\n\n- **누가** 왔어요? *(Who came? — NOT 누구가!)*\n- **누가** 한국어를 가르쳐요? *(Who teaches Korean?)*\n- *Rule of thumb: As a topic/object use 누구 (누구는, 누구를), but as a subject use **누가**!*' },

      { t:'table', head:['Question Word','Meaning','Subject / Object Form','Example Question'], rows:[
        ['**뭐 (무엇)**','What','**뭘 (무엇을)**','이거 **뭐**예요? / 점심에 **뭘** 먹어요?'],
        ['**누구**','Who','**누가 (누구+가)**','저 사람 **누구**예요? / 지금 **누가** 왔어요?'],
        ['**어디**','Where','**어디에 / 어디에서**','화장실이 **어디**예요? / **어디**에 가요?'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'이거 뭐예요?', tip:'What is this? (뭐 = what)' },
        { ch:'지금 누가 왔어요?', tip:'Who came just now? (누구 + 가 = 누가)' },
        { ch:'화장실이 어디예요?', tip:'Where is the restroom? (어디 = where)' },
      ]},

      { t:'choice', q:'You hear a knock on your door and want to ask: "Who came / Who is it?" Which subject form of 누구 is grammatically correct?',
        options:['지금 누가 왔어요?','지금 누구가 왔어요?','지금 누구는 왔어요?','지금 누고가 왔어요?'], answer:0,
        why:'When the subject particle 가 attaches to 누구, it must contract into 누가: 지금 누가 왔어요? (누구가 is ungrammatical).' },

      { t:'choice', q:'You point to an unfamiliar Korean dish on the menu and ask the waiter: "What is this?"',
        options:['이거 뭐예요?','이거 어디예요?','이거 누구예요?','이거 언제예요?'], answer:0,
        why:'To ask "what" something is, use 뭐: 이거 뭐예요? (어디 is where, 누구 is who, 언제 is when).' },

      { t:'choice', q:'You need to find the subway station in a new city. How do you politely ask a passerby: "Where is the subway station?"',
        options:['지하철역이 어디예요?','지하철역이 누구예요?','지하철역이 뭐예요?','지하철역이 왜예요?'], answer:0,
        why:'어디 asks for a location or destination: 지하철역이 어디예요?' },

      { t:'cloze', sentence:'점심시간에 친구하고 [뭐] 먹을 거예요?', answer:'뭐',
        options:['뭐','누구','어디','언제'],
        meaning:'What are you going to eat with your friend during lunchtime?',
        why:'To ask "what" item/food will be eaten, use 뭐: 뭐 먹을 거예요?' },

      { t:'order', q:'Put in order: "Excuse me, where is the restroom?"',
        tokens:['실례지만','화장실이','어디예요?'], answer:['실례지만','화장실이','어디예요?'] },

      { t:'pair', q:'Match each English question concept with its correct Korean question form:', pairs:[
        ['What is this?', '이거 뭐예요?'],
        ['Who is that?', '저 사람 누구예요?'],
        ['Who came? (Subject)', '누가 왔어요?'],
        ['Where is it?', '어디예요?'],
      ]},

      { t:'correct', wrong:'주격 조사 오류: 문 밖에 지금 누구가 서 있어요.',
        answers:['문 밖에 지금 누가 서 있어요.','문 밖에 지금 누가 서 있어요'],
        hint:'누구 + 가 always contracts into 누가.',
        why:'When the subject particle 가 attaches to 누구, it must contract into 누가: 문 밖에 지금 누가 서 있어요.' },

      { t:'translate', q:'Ordering: "What will you drink?"',
        answers:['뭐 마실래요?','뭐 마실래요'],
        must:['뭐','마실래요'],
        hint:'뭐 + 마실래요?' },

      { t:'speak', say:'저 사람 누구예요? 우리 한국어 선생님이에요.', q:'Read aloud naturally asking who someone is and answering warmly:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-36-02',
    title: { ko:'2강. 언제·왜·어떻게: 때, 까닭, 방법 묻기', en:'Lesson 2. 언제 · 왜 · 어떻게: Time, Reasons, & Methods' },
    minutes: 7,
    blocks: [
      { t:'text', md:'Now let’s explore the three words that ask about circumstances, reasons, and procedures:\n\n1. **언제 (When)**:\n   - Inquires about time, dates, or days:\n   - *“생일이 **언제**예요?”* *(When is your birthday?)*\n   - *“**언제** 한국에 왔어요?”* *(When did you come to Korea?)*\n   - *(Notice: 언제 already holds temporal meaning, so you do NOT add the particle 에 to it — just say **언제**, never 언제에!)*\n\n2. **왜 (Why)**:\n   - Asks for reasons and motives:\n   - *“**왜** 한국어를 배워요?”* *(Why do you study Korean?)*\n   - Natural responses use reason connectors you already mastered: **-아/어서**, **-(으)니까**, or **-기 때문에**! (*“한국 노래가 좋아서 배워요.”*)\n\n3. **어떻게 (How / In what way)**:\n   - Inquires about methods, means of transportation, or procedures:\n   - *“회사에 **어떻게** 가요?”* *(How do you go to work?)*\n   - Natural responses pair with the means particle **(으)로** (learned in bg-31!): *“지하철**로** 가요.”* *(I go by subway.)*' },

      { t:'note', md:'**Two Common Friendly Social Idioms with 어떻게**\n\nBeyond asking for physical directions or transportation, **어떻게** is constantly used in daily conversational greetings:\n- *“요즘 **어떻게** 지내요?”* *(How have you been doing lately?)*\n- *“이 문제에 대해 **어떻게** 생각해요?”* *(How/what do you think about this issue?)*' },

      { t:'table', head:['Question Word','Meaning','Typical Answer Pattern','Dialogue Example'], rows:[
        ['**언제**','When','Time / Date (금요일에, 내일)','생일이 **언제**예요? — 내일이에요.'],
        ['**왜**','Why','Reason (-아/어서, -(으)니까)','**왜** 늦었어요? — 차가 막혀서 늦었어요.'],
        ['**어떻게**','How (Method)','Means ((으)로, 걸어서)','학교에 **어떻게** 가요? — 지하철로 가요.'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'생일이 언제예요?', tip:'When is your birthday? (언제 = when)' },
        { ch:'왜 한국어를 배워요?', tip:'Why do you learn Korean? (왜 = why)' },
        { ch:'학교에 어떻게 가요?', tip:'How do you go to school? (어떻게 = how)' },
      ]},

      { t:'choice', q:'Your friend arrives late to a meeting. How do you ask for the reason: "Why are you late?"',
        options:['왜 늦었어요?','언제 늦었어요?','어디 늦었어요?','어떻게 늦었어요?'], answer:0,
        why:'왜 asks for reasons and causes: 왜 늦었어요? (언제 is when, 어디 is where, 어떻게 is how).' },

      { t:'choice', q:'A friend asks you: "회사에 어떻게 가요?" How do you answer naturally using the means particle (으)로?',
        options:['지하철로 가요.','지하철에 가요.','지하철을 가요.','지하철에서 가요.'], answer:0,
        why:'Questions with 어떻게 (how/by what means) pair naturally with the means/instrument particle (으)로: 지하철로 가요.' },

      { t:'choice', q:'How do you ask about the schedule: "When does the Korean class start?"',
        options:['수업이 언제 시작해요?','수업이 왜 시작해요?','수업이 누구 시작해요?','수업이 어디 시작해요?'], answer:0,
        why:'언제 asks for timing or schedule: 수업이 언제 시작해요? (Do not add 에 to 언제).' },

      { t:'cloze', sentence:'한국에는 [언제] 여행을 갈 거예요?', answer:'언제',
        options:['언제','어디','누구','왜'],
        meaning:'When are you going to go on a trip to Korea?',
        why:'To ask about the timing or date of a planned trip, use 언제: 언제 여행을 갈 거예요?' },

      { t:'order', q:'Put in order: "Why did you come to Korea?"',
        tokens:['한국에','왜','오셨어요?'], answer:['한국에','왜','오셨어요?'] },

      { t:'pair', q:'Match each question word with its primary conversational function:', pairs:[
        ['언제', 'Timing / Schedule (When)'],
        ['왜', 'Reason / Motive (Why)'],
        ['어떻게', 'Method / Means (How)'],
        ['지하철로', 'Means reply to 어떻게'],
      ]},

      { t:'correct', wrong:'조사 중복 오류: 친구 생일이 언제에 있어요?',
        answers:['친구 생일이 언제예요?','친구 생일이 언제예요','친구 생일이 언제 있어요?','친구 생일이 언제 있어요'],
        hint:'언제 already has temporal meaning; do not attach 에 directly to it: 생일이 언제예요?',
        why:'언제 does not take the particle 에: 친구 생일이 언제예요? (or 언제 있어요?).' },

      { t:'translate', q:'Commuting: "How do you go to school?"',
        answers:['학교에 어떻게 가요?','학교에 어떻게 가요'],
        must:['학교에','어떻게','가요'],
        hint:'학교에 + 어떻게 + 가요?' },

      { t:'speak', say:'회사에 어떻게 가요? 저는 매일 지하철로 출근해요.', q:'Read aloud naturally inquiring about transportation and answering:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-36-03',
    title: { ko:'3강. 얼마·무슨·어떤·어느: 헷갈리는 의문사 대조', en:'Lesson 3. 얼마 · 무슨 · 어떤 · 어느: Nuanced Determiners' },
    minutes: 8,
    blocks: [
      { t:'text', md:'Now let’s master the final cluster of question words: **얼마** (*price/amount*) and the three tricky determiners **무슨 vs. 어떤 vs. 어느**:\n\n1. **얼마 (Price / Amount / Quantity)**:\n   - Directly asks for cost or amount:\n   - *“이거 **얼마**예요?”* *(How much is this?)*\n   - *“시간이 **얼마나** 걸려요?”* *(How much time does it take?)*\n\n2. **무슨 + Noun (Category / Broad Open What)**:\n   - Inquires about a broad category or type without any limited pre-set choices:\n   - Frequent collocations: **무슨 음식** *(what food)*, **무슨 일** *(what matter/issue)*, **무슨 색깔** *(what color)*, **무슨 음악** *(what music)*:\n   - *“**무슨** 음식을 좋아해요?”* *(What food do you like?)*\n\n3. **어떤 + Noun (Characteristics / Traits / Nature)**:\n   - Focuses on the qualities, personality, appearance, or feelings of a noun:\n   - Frequent collocations: **어떤 사람** *(what kind of person)*, **어떤 느낌** *(what kind of feeling)*, **어떤 스타일** *(what style)*:\n   - *“민수 씨는 **어떤** 사람이에요?”* *(What kind of person is Minsu? — He is kind!)*\n\n4. **어느 + Noun (Which — from a Defined / Limited Set)**:\n   - Used when selecting from a specific, limited set of candidates (countries, specific items, directions):\n   - Frequent collocations: **어느 나라** *(which country — among the nations)*, **어느 것** *(which one)*, **어느 쪽** *(which direction)*:\n   - *“**어느** 나라에서 오셨어요?”* *(Which country did you come from?)*' },

      { t:'note', md:'**⚡ THE QUICK DECISION MATRIX: 무슨 vs. 어떤 vs. 어느**\n\n- **무슨 + N**: Open Category! (*무슨 음식, 무슨 음악, 무슨 일*)\n- **어떤 + N**: Personality & Quality! (*어떤 사람, 어떤 느낌, 어떤 옷*)\n- **어느 + N**: Selection from choices! (*어느 나라, 어느 것, 어느 쪽*)' },

      { t:'table', head:['Question Word','Role / Meaning','Typical Collocations','Example Sentence'], rows:[
        ['**얼마**','Price / Amount','얼마예요, 얼마나','이 커피 **얼마**예요? (How much is this?)'],
        ['**무슨**','What kind (Open category)','무슨 음식, 무슨 일, 무슨 색','**무슨** 음식을 제일 좋아해요?'],
        ['**어떤**','What kind (Traits & nature)','어떤 사람, 어떤 스타일, 어떤 느낌','민수 씨는 **어떤** 사람이에요?'],
        ['**어느**','Which (From defined choices)','어느 나라, 어느 것, 어느 계절','**어느** 나라에서 오셨어요?'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'이 티셔츠 얼마예요?', tip:'How much is this T-shirt? (얼마 = price)' },
        { ch:'무슨 음식을 좋아해요?', tip:'What food do you like? (무슨 = category)' },
        { ch:'민수 씨는 어떤 사람이에요?', tip:'What kind of person is Minsu? (어떤 = trait)' },
        { ch:'어느 나라에서 오셨어요?', tip:'Which country did you come from? (어느 = which)' },
      ]},

      { t:'choice', q:'You meet a new friend from overseas and want to ask: "Which country did you come from?" Which question determiner is proper?',
        options:['어느 나라에서 왔어요?','무슨 나라에서 왔어요?','어떤 나라에서 왔어요?','얼마 나라에서 왔어요?'], answer:0,
        why:'When selecting from a defined set of existing entities like countries, use 어느: 어느 나라에서 왔어요? (무슨 is for open categories, 어떤 is for traits, 얼마 is for price).' },

      { t:'choice', q:'You want to ask a friend about their favorite food categories in general: "What kind of food do you like?"',
        options:['무슨 음식을 좋아해요?','어느 음식을 좋아해요?','얼마 음식을 좋아해요?','누구 음식을 좋아해요?'], answer:0,
        why:'To ask about general categories of items without a limited list, use 무슨: 무슨 음식을 좋아해요?' },

      { t:'choice', q:'You are asking about a new colleague’s personality and character traits: "What kind of person is he?"',
        options:['어떤 사람이에요?','무슨 사람이에요?','어느 사람이에요?','얼마 사람이에요?'], answer:0,
        why:'To ask about personal qualities, traits, or nature, 어떤 is the natural choice: 어떤 사람이에요?' },

      { t:'cloze', sentence:'가게에서 물건 가격을 물어봤어요: "이거 [얼마]예요?"', answer:'얼마',
        options:['얼마','무슨','어떤','어느'],
        meaning:'I asked for the price of the item at the store: "How much is this?"',
        why:'To ask for price, use 얼마: 얼마예요?' },

      { t:'order', q:'Put in order: "What kind of movie do you want to see today?"',
        tokens:['오늘','무슨','영화를','보고','싶어요?'], answer:['오늘','무슨','영화를','보고','싶어요?'] },

      { t:'pair', q:'Match each question phrase with its communicative focus:', pairs:[
        ['이거 얼마예요?', 'Asking price (How much)'],
        ['무슨 음식', 'Open category (What food)'],
        ['어떤 사람', 'Personality / Trait (What kind of person)'],
        ['어느 나라', 'Selection from set (Which country)'],
      ]},

      { t:'correct', wrong:'의문사 오용: 친구에게 무슨 나라에서 왔어요 하고 물었어요.',
        answers:['친구에게 어느 나라에서 왔어요 하고 물었어요.','친구에게 어느 나라에서 왔어요 하고 물었어요'],
        hint:'Choosing from world nations requires 어느: 어느 나라.',
        why:'Selecting from existing countries requires the selection determiner 어느: 어느 나라에서 왔어요?' },

      { t:'translate', q:'Shopping: "Excuse me, how much is this apple?"',
        answers:['이 사과 얼마예요?','이 사과 얼마예요'],
        must:['사과','얼마예요'],
        hint:'이 사과 + 얼마예요?' },

      { t:'translate', q:'Preferences: "What food do you like?"',
        answers:['무슨 음식을 좋아해요?','무슨 음식을 좋아해요'],
        must:['무슨','음식을','좋아해요'],
        hint:'무슨 + 음식을 + 좋아해요?' },

      { t:'speak', say:'어느 나라에서 오셨어요? 저는 한국에서 왔어요.', q:'Read aloud naturally inquiring about nationality and stating origin:' },
    ],
  },

  ],
},
];
