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

];
