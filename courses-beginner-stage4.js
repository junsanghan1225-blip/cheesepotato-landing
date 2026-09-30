/* ══════════════════════════════════════════════════════════════
   초급 4단계 — 상대에게
   ──────────────────────────────────────────────────────────────
   설계는 docs/curriculum-beginner.md §3, §4 (4단계) 에 있다.
   이 단계가 끝나면 학습자는 **부탁하고, 되는지 묻고, 같이 하자고 한다.**

   ── 설명은 영어, 예문은 한국어 ──────────────────────────────
   초급 학습자의 인지 부하를 줄이기 위해 설명과 힌트는 영어로,
   연습 문장과 선택지는 자연스러운 한국어로 작성한다.

   ── 코스 구성 ───────────────────────────────────────────────
   - bg-17: -(으)세요 와 -아/어 주세요 (2강)
   - bg-18: 되나요? 해야 하나요? (-아/어도 되다, -아/어야 되다/하다) (3강)
   - bg-19: 하지 마세요 (-지 마세요) (1강)
   - bg-20: 할 수 있어요 / 없어요 (-(으)ㄹ 수 있다/없다) (2강)
   - bg-21: 같이 할까요 (-(으)ㄹ까요, -(으)ㅂ시다, -(으)ㄹ게요, -(으)ㄹ래요) (3강)
   ══════════════════════════════════════════════════════════════ */

export const BEGINNER_STAGE4_COURSES = [

/* ═══════════════════════════════════════════════════════════════
   bg-17 — -(으)세요 와 -아/어 주세요
   높임 명령과 부탁. -(으)세요의 두 얼굴(명령과 존칭 서술)을 짚고,
   상대방의 수고를 구하는 -아/어 주세요와의 차이를 익힌다.
   ㄹ 탈락(살다 → 사세요, 만들다 → 만드세요)을 자연스럽게 복습.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-17',
  emoji: '🙏',
  title: { ko:'-(으)세요 와 -아/어 주세요', en:'Polite Commands & Requests: -(으)세요 & -아/어 주세요' },
  tagline: { ko:'예의 바르게 권하고 부탁하기', en:'Ask politely, command gently, and request help.' },
  blurb: { ko:'상대방에게 정중하게 권하거나 부탁하는 법을 배웁니다. -(으)세요의 두 얼굴(명령과 존칭 서술)과, 상대방의 수고를 구하는 -아/어 주세요의 차이를 익힙니다.',
           en:'Master polite imperatives and favors. Learn why -(으)세요 is both a polite command and an honorific statement, and when to ask for a favor with -아/어 주세요.' },
  level: 'Beginner',
  needs: 'bg-16',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-17-01',
    title: { ko:'1강. 두 가지 얼굴: -(으)세요 (명령과 존칭)', en:'Lesson 1. The Two Faces of -(으)세요: Command & Honorific' },
    minutes: 7,
    blocks: [
      { t:'text', md:'When you want to tell someone politely *“Please do this”*, attach **-(으)세요** to the verb stem:\n- Stem without batchim → **-세요** *(가다 → 가세요)*\n- Stem with batchim → **-으세요** *(앉다 → 앉으세요)*\n\n**Remember the ㄹ rule from Stage 3?**\nStems ending in **ㄹ** drop the ㄹ: **만들다 → 만드세요**, **살다 → 사세요**!' },

      { t:'note', md:'**The Two Faces of -(으)세요**:\n\nMost textbooks only teach this as a command, but in real Korean it has a second huge job:\n\n1. **Polite command**: 여기 앉으세요. *(Please sit here.)*\n2. **Honorific statement or question**: Describing what a respected elder or teacher does!\n   - 선생님, 어디 **가세요**? *(Teacher, where are you going? — Not a command, just a respectful question!)*\n   - 아버지는 지금 책을 **읽으세요**. *(Father is reading a book.)*' },

      { t:'table', head:['Verb','With -(으)세요','Meaning'], rows:[
        ['가다 (to go)','**가세요**','Please go / Where are you going?'],
        ['앉다 (to sit)','**앉으세요**','Please sit down'],
        ['읽다 (to read)','**읽으세요**','Please read / (Elder) reads'],
        ['만들다 (ㄹ drop)','**만드세요**','Please make / (Elder) makes'],
        ['살다 (ㄹ drop)','**사세요**','Please live / (Elder) lives'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'여기 편하게 앉으세요.', tip:'Please sit down here comfortably.' },
        { ch:'맛있게 드세요.', tip:'Please enjoy your meal. (Honorific for 먹다)' },
        { ch:'선생님, 지금 어디 가세요?', tip:'Teacher, where are you going? (Respectful question)' },
      ]},

      { t:'choice', q:'How do you attach -(으)세요 to 만들다 (to make)?',
        options:['만드세요','만들으세요','만들세요','만드으세요'], answer:0,
        why:'Remember the ㄹ rule: ㄹ drops before -(으)! 만들다 → 만드세요 (not 만들으세요).' },

      { t:'choice', q:'In the sentence "선생님, 지금 어디 가세요?", what does 가세요 mean?',
        options:['A polite question: "Where are you going?"','A command: "Go somewhere!"','A past action: "Where did you go?"','A refusal: "Don\'t go."'], answer:0,
        why:'-(으)세요 is not only for commands! When asking an elder or teacher, it politely asks about their action.' },

      { t:'cloze', sentence:'여기 편하게 [앉으세요].', answer:'앉으세요',
        options:['앉으세요','앉아 주세요','앉고','앉으면'],
        meaning:'Please sit here comfortably.',
        why:'앉다 has a batchim, so it attaches -으세요: 앉- + -으세요 = 앉으세요.' },

      { t:'correct', wrong:'집에서 맛있는 김치를 만들으세요.',
        answers:['집에서 맛있는 김치를 만드세요.','집에서 맛있는 김치를 만드세요'],
        hint:'Verbs ending in ㄹ drop the ㄹ before -(으)세요: 만들다 → 만드세요',
        why:'ㄹ drops before -(으)세요: 만들다 becomes 만드세요.' },

      { t:'translate', q:'Please sit here.',
        answers:['여기 앉으세요.','여기에 앉으세요.','여기 앉으세요','여기에 앉으세요'],
        hint:'여기(에), 앉다 → 앉으세요' },

      { t:'speak', say:'여기 편하게 앉으세요.', q:'Read aloud politely:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-17-02',
    title: { ko:'2강. 내게 베풀어 주는 부탁: -아/어 주세요', en:'Lesson 2. Asking a Favor: -아/어 주세요' },
    minutes: 6,
    blocks: [
      { t:'text', md:'What is the difference between **앉으세요** and **앉아 주세요**?\n\n- **-(으)세요** is a gentle directive: *“Please do X (for yourself or for courtesy).”*\n- **-아/어 주세요** asks someone to do something **as a favor for you**: *“Please do X for my sake.”*\n\nConjugation follows the familiar vowel harmony of **-아/어서**:\n- ㅏ, ㅗ → **-아 주세요** *(보다 → 봐 주세요, 돕다 → 도와주세요)*\n- Rest → **-어 주세요** *(기다리다 → 기다려 주세요, 가르치다 → 가르쳐 주세요)*\n- 하다 → **해 주세요** *(도와주세요, 전화해 주세요)*' },

      { t:'table', head:['Plain Command (-(으)세요)','Favor Request (-아/어 주세요)','Nuance Difference'], rows:[
        ['기다리세요 (Please wait)','**기다려 주세요**','Please wait for me / do me the favor of waiting'],
        ['보세요 (Please look)','**봐 주세요**','Please look at this for me'],
        ['가르치세요 (Please teach)','**가르쳐 주세요**','Please teach me'],
        ['도우세요 (rare)','**도와주세요**','Please help me! (돕다 is ㅂ irregular)'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'잠깐만 기다려 주세요.', tip:'Please wait for a moment (for me).' },
        { ch:'다시 한번 말해 주세요.', tip:'Please say that once more for me.' },
        { ch:'한국어를 가르쳐 주세요.', tip:'Please teach me Korean.' },
      ]},

      { t:'choice', q:'How do you ask "Please help me!" using 돕다 (ㅂ irregular)?',
        options:['도와주세요','돕아 주세요','도워주세요','돕으세요'], answer:0,
        why:'돕다 is a ㅂ irregular verb: ㅂ turns to 와 before a vowel: 도와주세요!' },

      { t:'cloze', sentence:'잠깐만 [기다려 주세요].', answer:'기다려 주세요',
        options:['기다려 주세요','기다리세요','기다려서','기다리면'],
        meaning:'Please wait for a moment.',
        why:'When asking someone to wait for you as a favor, 기다려 주세요 is the natural choice.' },

      { t:'correct', wrong:'다시 한번 말하아 주세요.',
        answers:['다시 한번 말해 주세요.','다시 한번 말해 주세요'],
        hint:'하다 verbs conjugate to 해 주세요: 말하다 → 말해 주세요',
        why:'하다 becomes 해 주세요: 다시 한번 말해 주세요.' },

      { t:'translate', q:'Please teach me Korean.',
        answers:['한국어를 가르쳐 주세요.','한국어 가르쳐 주세요.','한국어를 가르쳐 주세요'],
        hint:'한국어(를), 가르치다 → 가르쳐 주세요' },

      { t:'speak', say:'잠깐만 기다려 주세요.', q:'Read aloud naturally:' },
    ],
  },

  {
    id: "bg-17-03", title: {"ko":"3강. 불규칙 동사로 부탁하기 (-아/어 주세요)","en":"Lesson 3. Making Requests with Irregular Verbs (-아/어 주세요)"}, minutes: 5,
    blocks: [
      {"t":"text","h":"How Irregular Verb Stems Combine with -아/어 주세요","md":"To ask someone to do something for you politely, attach **-아/어 주세요** to the verb. Because it starts with **-아/어**, stem vowel rules and irregulars follow the same familiar patterns as **-아요/-어요**!\n\n- **ㅏ / ㅗ vowels:** attach **-아 주세요** (닫다 → **닫아 주세요**, 보다 → **봐 주세요**).\n- **Other vowels:** attach **-어 주세요** (읽다 → **읽어 주세요**, 쓰다 → **써 주세요**).\n- **하다 verbs:** become **-해 주세요** (말하다 → **말해 주세요**).\n- **ㄷ irregular:** ㄷ changes to ㄹ (듣다 → **들어 주세요**).\n- **ㅂ irregular:** ㅂ changes to 우 (돕다 → **도와주세요**)."},
      {"t":"table","head":["Dictionary Verb","Present (-아요/어요)","Polite Request (-아/어 주세요)","English Meaning"],"rows":[["돕다 (ㅂ irregular)","도와요","도와주세요","Please help me"],["듣다 (ㄷ irregular)","들어요","들어 주세요","Please listen to me"],["부르다 (르 irregular)","불러요","불러 주세요","Please call (a taxi / my name)"],["만들다 (ㄹ stem)","만들어요","만들어 주세요","Please make it for me"],["열다 (to open)","열어요","열어 주세요","Please open (the door)"]]},
      {"t":"note","md":"**도와주세요** is one compound word (no space) meaning “Please help!”, whereas most other verbs keep a space: **열어 주세요**, **들어 주세요**."},
      {"t":"chars","wide":true,"items":[{"ch":"선생님, 택시 좀 불러 주세요.","tip":"Teacher, please call a taxi for me. (부르다 → 불러 주세요)"},{"ch":"제 이야기를 끝까지 들어 주세요.","tip":"Please listen to my story until the end. (듣다 → 들어 주세요)"},{"ch":"너무 무거운데 저 좀 도와주세요.","tip":"This is so heavy, please help me. (돕다 → 도와주세요)"}]},
      {"t":"choice","q":"How do you politely ask someone to listen using ‘듣다’ (to listen)?","options":["들어 주세요","듣어 주세요","듣아 주세요"],"answer":0,"why":"듣다 changes ㄷ to ㄹ before vowel endings: 들 + 어 주세요 → **들어 주세요**."},
      {"t":"choice","q":"How do you ask someone to call a taxi using ‘부르다’ (to call)?","options":["택시 좀 불러 주세요","택시 좀 부르어 주세요","택시 좀 불어 주세요"],"answer":0,"why":"부르다 is a 르-irregular verb: 부르 + 어 주세요 → **불러 주세요**."},
      {"t":"pair","q":"Match each base verb with its correct polite request form.","pairs":[["닫다 (to close)","닫아 주세요"],["쓰다 (to write)","써 주세요"],["돕다 (to help)","도와주세요"],["가르치다 (to teach)","가르쳐 주세요"]]},
      {"t":"cloze","sentence":"날씨가 더운데 에어컨 좀 [틀어 주세요].","answer":"틀어 주세요","meaning":"The weather is hot, please turn on the air conditioner.","options":["틀어 주세요","틀아 주세요","틀고 주세요","틀개 주세요"],"keys":["틀어 주세요","틀아 주세요","틀고 주세요","틀개 주세요"],"why":"틀다 has vowel ㅡ (not ㅏ/ㅗ), so it attaches -어 주세요: 틀 + 어 주세요 → **틀어 주세요**."},
      {"t":"type","q":"Conjugate 만들다 (to make) into a polite request for me: 「한국 음식을 ___ .」","answer":"만들어 주세요","keys":["만들어 주세요","만들아 주세요","만들고 주세요"],"why":"만들다 attaches -어 주세요: 만들 + 어 주세요 → **만들어 주세요**."},
      {"t":"speak","say":"길을 잘 모르겠는데 지도 좀 보여 주세요.","rom":"gil-eul jal mo-reu-gess-neun-de ji-do jom bo-yeo ju-se-yo","q":"Say it aloud politely asking to see a map."},
    ],
  },
  {
    id: "bg-17-04", title: {"ko":"4강. 누구를 위한 행동인가: -(으)세요 vs -아/어 주세요","en":"Lesson 4. For Whom Is the Action: -(으)세요 vs -아/어 주세요"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Beneficiary Makes the Difference: For Them vs For Me","md":"Both endings make polite sentences, but they have completely different purposes:\n\n- **-(으)세요 (Do it for yourself / General directive):**\n  - You are instructing or recommending the listener to do something for their own benefit:\n  - 맛있게 **드세요** (Enjoy your meal / Eat well).\n  - 편하게 **앉으세요** (Please take a comfortable seat).\n- **-아/어 주세요 (Do it as a favor for me / Request):**\n  - You are asking the listener to perform an action that **benefits you**:\n  - 저 좀 **도와주세요** (Please help me).\n  - 문 좀 **닫아 주세요** (Please close the door for me)."},
      {"t":"table","head":["Verb","Directive / Honorific (-(으)세요)","Favor for Me (-아/어 주세요)","Contrast"],"rows":[["앉다 (to sit)","앉으세요 (Please take a seat)","앉아 주세요 (Please sit down for me)","Beneficiary"],["보다 (to look)","보세요 (Look over there)","봐 주세요 (Please take a look at my work)","For you vs For me"],["쓰다 (to write)","쓰세요 (Please write here)","써 주세요 (Please write it for me)","Who writes"],["기다리다 (to wait)","기다리세요 (Please wait)","기다려 주세요 (Please wait for me)","Instruction vs Favor"]]},
      {"t":"note","md":"When asking a taxi driver to go to a destination, say **서울역으로 가 주세요** (favor for me), NOT 서울역으로 가세요 (which sounds like ordering the driver to go there alone!)."},
      {"t":"chars","wide":true,"items":[{"ch":"손님, 여기 편하게 앉으세요.","tip":"Customer, please sit here comfortably. (Directive for listener's comfort)"},{"ch":"회의 시작하니까 모두 자리에 앉아 주세요.","tip":"The meeting is starting, so please take your seats. (Favor requested by speaker)"},{"ch":"사진 한 장만 찍어 주세요.","tip":"Please take a photo for me. (Favor benefiting speaker)"}]},
      {"t":"choice","q":"You are in a taxi and want the driver to take you to the airport. What do you say?","options":["공항으로 가 주세요","공항으로 가세요","공항으로 가고 있어요"],"answer":0,"why":"Taking you to the airport is a service/favor done for you, so use -아/어 주세요: **가 주세요**."},
      {"t":"choice","q":"You invite a guest into your living room and want them to sit down comfortably. What do you say?","options":["편하게 앉으세요","편하게 앉아 주세요","편하게 앉고 있어요"],"answer":0,"why":"Telling a guest to sit comfortably for their own comfort is an honorable directive: **앉으세요**."},
      {"t":"pair","q":"Match each situation to the most natural phrase.","pairs":[["Telling a customer to wait","잠깐만 기다리세요"],["Asking a friend to wait for you","조금만 기다려 주세요"],["Ordering food at a restaurant","비빔밥 하나 주세요"],["Offering food to a guest","맛있게 드세요"]]},
      {"t":"cloze","sentence":"날씨가 추우니까 문 좀 [닫아 주세요].","answer":"닫아 주세요","meaning":"Since it is cold, please close the door for me.","options":["닫아 주세요","닫으세요","닫아 주개요","닫고 주세요"],"keys":["닫아 주세요","닫으세요","닫아 주개요","닫고 주세요"],"why":"Asking someone to close the door for the room's comfort is a favor request: **닫아 주세요**."},
      {"t":"type","q":"Politely ask someone to teach you Korean (as a favor for you): 「제게 한국어를 ___ .」","answer":"가르쳐 주세요","keys":["가르쳐 주세요","가르치세요","가르쳐 주개요"],"why":"Asking someone to teach you as a favor takes -아/어 주세요: 가르치다 → **가르쳐 주세요**."},
      {"t":"speak","say":"기사님, 명동역 3번 출구 앞에서 세워 주세요.","rom":"gi-sa-nim, myeong-dong-yeog sam-beon chul-gu ap-e-seo se-wo ju-se-yo","q":"Say it aloud politely asking a driver to stop at a location."},
    ],
  },
  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-18 — 되나요? 해야 하나요?
   -아/어도 되다(허락 구하기)와 -아/어야 되다/하다(의무 말하기).
   한국 일상생활에서 가장 많이 쓰이는 두 표현의 차이를 마스터한다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-18',
  emoji: '🚦',
  title: { ko:'되나요? 해야 하나요?', en:'Permission & Obligation: -아/어도 되다 & -아/어야 되다' },
  tagline: { ko:'허락 구하기와 의무 말하기', en:'May I? and You must: permission vs obligation.' },
  blurb: { ko:'"여기 앉아도 돼요?"(허락)와 "지금 가야 돼요"(의무)를 배웁니다. 한국 생활에서 가장 중요한 두 표현의 규칙과 실전 뉘앙스를 마스터합니다.',
           en:'Essential expressions for daily life in Korea. Learn how to ask for permission (-아/어도 되다) and express necessity or obligation (-아/어야 되다/하다).' },
  level: 'Beginner',
  needs: 'bg-17',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-18-01',
    title: { ko:'1강. 허락 구하기: -아/어도 되다', en:'Lesson 1. Asking Permission: -아/어도 되다' },
    minutes: 7,
    blocks: [
      { t:'text', md:'To ask for permission (*“May I do this? / Is it okay if I...?”*), attach **-아/어도 돼요?** to the verb stem:\n- Stem ends in **ㅏ, ㅗ** → **-아도 돼요?** *(앉다 → 앉아도 돼요?)*\n- Other vowels → **-어도 돼요?** *(먹다 → 먹어도 돼요?)*\n- **하다** verbs → **해도 돼요?** *(시작하다 → 시작해도 돼요?)*' },

      { t:'table', head:['Verb','Asking Permission','Meaning'], rows:[
        ['앉다 (to sit)','**앉아도 돼요?**','May I sit here?'],
        ['들어가다 (to enter)','**들어가도 돼요?**','May I come in?'],
        ['먹다 (to eat)','**먹어도 돼요?**','May I eat this?'],
        ['사진을 찍다 (take photo)','**사진을 찍어도 돼요?**','May I take photos?'],
        ['하다 (to do)','**해도 돼요?**','May I do it?'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'여기 앉아도 돼요?', tip:'May I sit here?' },
        { ch:'사진 찍어도 돼요?', tip:'May I take a picture?' },
        { ch:'지금 들어가도 돼요?', tip:'May I come in now?' },
      ]},

      { t:'choice', q:'How do you ask "May I take pictures here?" (사진을 찍다 = take photos)',
        options:['사진 찍어도 돼요?','사진 찍어야 돼요?','사진 찍으면 돼요?','사진 찍고 돼요?'], answer:0,
        why:'-아/어도 돼요 asks for permission: 찍- + -어도 돼요? = 사진 찍어도 돼요?' },

      { t:'cloze', sentence:'여기 [앉아도 돼요]?', answer:'앉아도 돼요',
        options:['앉아도 돼요','앉아야 돼요','앉으면 돼요','앉고 돼요'],
        meaning:'May I sit here?',
        why:'앉다 has vowel ㅏ, so it takes -아도 돼요: 앉아도 돼요? (May I sit here?).' },

      { t:'order', q:'Put in order: "May I take a picture here?"',
        tokens:['여기서','사진을','찍어도','돼요?'], answer:['여기서','사진을','찍어도','돼요?'] },

      { t:'correct', wrong:'여기 앉어도 돼요?',
        answers:['여기 앉아도 돼요?','여기 앉아도 돼요'],
        hint:'앉다 has vowel ㅏ, so use -아도 돼요: 앉- + -아도 돼요?',
        why:'앉다 has vowel ㅏ, so it attaches -아도: 여기 앉아도 돼요?' },

      { t:'translate', q:'May I enter now?',
        answers:['지금 들어가도 돼요?','지금 들어가도 돼요'],
        hint:'지금, 들어가다 → 들어가도 돼요?' },

      { t:'speak', say:'여기 앉아도 돼요?', q:'Read aloud naturally:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-18-02',
    title: { ko:'2강. 의무와 당위: -아/어야 되다 / 하다', en:'Lesson 2. Obligation & Must: -아/어야 되다 / 하다' },
    minutes: 7,
    blocks: [
      { t:'text', md:'To say that you **“must”** or **“have to”** do something, attach **-아/어야 되다** (or **-아/어야 하다**):\n\nIn daily spoken Korean, **-아/어야 돼요** is used in almost every sentence about obligations:\n- ㅏ, ㅗ → **-아야 돼요** *(가다 → 가야 돼요)*\n- Other vowels → **-어야 돼요** *(먹다 → 먹어야 돼요)*\n- 하다 → **해야 돼요** *(공부하다 → 공부해야 돼요)*' },

      { t:'table', head:['Verb','Stem','Obligation (-아/어야 돼요)'], rows:[
        ['가다 (to go)','가-','**가야 돼요** (I have to go)'],
        ['먹다 (to eat)','먹-','**먹어야 돼요** (I have to eat)'],
        ['일어나다 (to wake up)','일어나-','**일어나야 돼요** (I have to wake up)'],
        ['공부하다 (to study)','공부하-','**공부해야 돼요** (I have to study)'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'내일 일찍 일어나야 돼요.', tip:'I have to wake up early tomorrow.' },
        { ch:'지금 병원에 가야 돼요.', tip:'I have to go to the hospital right now.' },
        { ch:'한국어를 열심히 공부해야 돼요.', tip:'I have to study Korean hard.' },
      ]},

      { t:'choice', q:'How do you say "I have to wake up early tomorrow"? (일찍 일어나다 = wake up early)',
        options:['일찍 일어나야 돼요','일찍 일어나도 돼요','일찍 일어나면 돼요','일찍 일어나고 돼요'], answer:0,
        why:'-아/어야 돼요 expresses obligation: 일어나- + -아야 돼요 = 일어나야 돼요.' },

      { t:'cloze', sentence:'지금 약속이 있어서 [가야 돼요].', answer:'가야 돼요',
        options:['가야 돼요','가도 돼요','가면 돼요','가고 돼요'],
        meaning:'I have an appointment now, so I have to go.',
        why:'가야 돼요 expresses that you must leave.' },

      { t:'order', q:'Put in order: "I have to wake up early tomorrow."',
        tokens:['내일','일찍','일어나야','돼요.'], answer:['내일','일찍','일어나야','돼요.'] },

      { t:'correct', wrong:'오늘 도서관에서 공부하야 돼요.',
        answers:['오늘 도서관에서 공부해야 돼요.', '오늘 도서관에서 공부해야 돼요'],
        hint:'하다 verbs become 해야 돼요: 공부하다 → 공부해야 돼요',
        why:'하다 conjugates to 해야 돼요: 공부해야 돼요.' },

      { t:'translate', q:'I have to go now.',
        answers:['지금 가야 돼요.','지금 가야 해요.','지금 가야 돼요'],
        hint:'지금, 가다 → 가야 돼요' },

      { t:'speak', say:'내일 일찍 일어나야 돼요.', q:'Read aloud with clear pronunciation:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-18-03',
    title: { ko:'3강. 실전 대조: 허락 vs 의무', en:'Lesson 3. Permission vs Obligation in Dialogue' },
    minutes: 7,
    blocks: [
      { t:'text', md:'Notice the single-letter difference that completely changes the meaning:\n\n- **-아/어도 돼요?** *(May I? — Asking permission)*\n- **-아/어야 돼요?** *(Must I? — Asking about obligation)*\n\nMixing up **도** and **야** changes “May I leave?” into “Do I have to leave?”' },

      { t:'table', head:['Korean Sentence','Grammar','English Meaning'], rows:[
        ['여기 앉**아도** 돼요?','-아/어도 되다','**May I** sit here? (Permission)'],
        ['지금 가**야** 돼요.','-아/어야 되다','I **must** go now. (Obligation)'],
        ['신발을 벗**어야** 돼요?','-아/어야 되다','**Do I have to** take off my shoes?'],
        ['먼저 먹**어도** 돼요.','-아/어도 되다','You **may** eat first. (Granting permission)'],
      ]},

      { t:'pair', q:'Match permission (-도 돼요) and obligation (-야 돼요):', pairs:[
        ['앉아도 돼요?', 'May I sit? (Permission)'],
        ['가야 돼요', 'I have to go (Obligation)'],
        ['먹어도 돼요?', 'May I eat? (Permission)'],
        ['일어나야 돼요', 'I must wake up (Obligation)'],
      ]},

      { t:'choice', q:'A: "내일 시험이 있어서..." How should this sentence logically end?',
        options:['공부해야 돼요.','공부해도 돼요.','공부하면 돼요.','공부하러 돼요.'], answer:0,
        why:'Because of an exam tomorrow, obligation is required: 공부해야 돼요 (I have to study).' },

      { t:'cloze', sentence:'A: 지금 나갈 수 있어요? B: 아니요, 숙제를 [해야 돼요].', answer:'해야 돼요',
        options:['해야 돼요','해도 돼요','하고 돼요','하면 돼요'],
        meaning:'A: Can you go out now? B: No, I have to do homework.',
        why:'Doing homework is an obligation that prevents going out, so 해야 돼요 is required.' },

      { t:'correct', wrong:'여기서 신발을 벗어도 해야 돼요.',
        answers:['여기서 신발을 벗어야 돼요.', '여기서 신발을 벗어야 돼요'],
        hint:'For obligation, attach -어야 돼요 directly to 벗다: 벗- + -어야 돼요',
        why:'Do not mix -어도 and 해야! The obligation form is 신발을 벗어야 돼요.' },

      { t:'translate', q:'Do I have to go to the hospital right now?',
        answers:['지금 병원에 가야 돼요?','지금 병원에 가야 해요?','지금 병원에 가야 돼요'],
        hint:'지금, 병원에 가다 → 가야 돼요?' },

      { t:'speak', say:'지금 가야 돼요? 네, 약속이 있어요.', q:'Read aloud with natural intonation:' },
    ],
  },

  {
    id: "bg-18-04", title: {"ko":"4강. 실전 대화: 규칙 묻기·양해 구하기와 마감 지키기","en":"Lesson 4. Real-Life Conversation: Asking Rules, Permissions, and Deadlines"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Navigating Real-Life Situations with Permission and Obligation","md":"In daily life in Korea—at schools, cafes, offices, or public places—you will constantly use **-아/어도 돼요?** to ask if something is permitted and **-아/어야 돼요** to confirm what you must do:\n\n- **Checking rules / Asking permission:**\n  - 여기서 사진을 찍**어도 돼요?** (May I take photos here?)\n  - 이 음식을 먹**어도 돼요?** (May I eat this food?)\n- **Confirming deadlines / Requirements:**\n  - 보고서를 언제까지 내**야 돼요?** (By when do I have to submit the report?)\n  - 계산은 먼저 해**야 돼요.** (You have to pay in advance.)"},
      {"t":"table","head":["Place / Situation","Question (-아/어도 돼요?)","Answer / Rule (-아/어야 돼요)"],"rows":[["Museum / Gallery","사진을 찍어도 돼요?","플래시 없이 찍어야 돼요"],["Restaurant","카드로 계산해도 돼요?","카드로 결제하셔도 돼요"],["Classroom / Office","질문해도 돼요?","끝나고 질문하셔야 돼요"],["Library","음료를 마셔도 돼요?","음료는 밖에서 드셔야 돼요"]]},
      {"t":"note","md":"Both **-아/어야 되다** and **-아/어야 하다** mean “must / have to”. In spoken Korean, **되다** is used far more often, while **하다** is common in formal writing and public notices."},
      {"t":"chars","wide":true,"items":[{"ch":"실례지만 여기서 사진을 찍어도 돼요?","tip":"Excuse me, may I take photos here? (-아/어도 돼요 asking permission)"},{"ch":"과제를 내일까지 제출해야 돼요.","tip":"I have to submit the assignment by tomorrow. (-아/어야 돼요 obligation)"},{"ch":"이 버스를 타려면 교통카드를 찍어야 돼요.","tip":"To ride this bus, you must tap your transit card. (Requirement)"}]},
      {"t":"choice","q":"You are at a cafe and want to ask if you may charge your phone here. Which question is natural?","options":["여기서 휴대폰을 충전해도 돼요?","여기서 휴대폰을 충전해야 돼요?","여기서 휴대폰을 충전하고 돼요?"],"answer":0,"why":"Asking permission (“May I...?”) uses -아/어도 되다: 충전하다 → **충전해도 돼요?**."},
      {"t":"choice","q":"A student asks about a homework deadline: 「언제까지 숙제를 내야 돼요?」. Which answer correctly explains the obligation?","options":["내일 수업 전까지 내야 돼요","내일 수업 전까지 내도 돼요","내일 수업 전까지 내고 돼요"],"answer":0,"why":"Explaining an obligation/requirement (“You must submit...”) uses -아/어야 되다: **내야 돼요**."},
      {"t":"pair","q":"Match each phrase to its practical communicative function.","pairs":[["들어가도 돼요?","Asking permission to enter"],["신발을 벗어야 돼요","Explaining obligation: must take off shoes"],["앉아도 돼요?","Asking permission to sit down"],["조용히 해야 돼요","Explaining obligation: must be quiet"]]},
      {"t":"cloze","sentence":"해외여행을 가려면 여권이 꼭 [있어야 돼요].","answer":"있어야 돼요","meaning":"To travel abroad, you must have a passport.","options":["있어야 돼요","있어도 돼요","있고야 돼요","있개야 돼요"],"keys":["있어야 돼요","있어도 돼요","있고야 돼요","있개야 돼요"],"why":"To express absolute necessity (“must have”), use -아/어야 되다: 있다 + -어야 되다 → **있어야 돼요**."},
      {"t":"type","q":"Conjugate 돕다 (to help) into the obligation form: 「어려운 사람을 ___ .」","answer":"도와야 돼요","keys":["도와야 돼요","돕아야 돼요","도와야 에요"],"why":"돕다 changes ㅂ to 오 before 아: 도우- + -아야 되다 → **도와야 돼요**."},
      {"t":"speak","say":"실례지만 저기 빈자리에 앉아도 될까요?","rom":"sil-lye-ji-man jeo-gi bin-ja-ri-e anj-a-do doel-kka-yo","q":"Say it aloud politely asking if you may sit in an empty seat."},
    ],
  },
  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-19 — 하지 마세요
   금지와 만류 (-지 마세요). 어간에 그대로 직결되는 가장 쉬운 규칙.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-19',
  emoji: '🚫',
  title: { ko:'하지 마세요', en:'Prohibition: -지 마세요' },
  tagline: { ko:'하지 말라고 정중히 부탁하기', en:'Please do not: gentle and clear prohibitions.' },
  blurb: { ko:'상대방에게 "하지 마세요"라고 정중하게 금지하거나 만류하는 법을 배웁니다. 어간에 모음 변화 없이 직결되는 쉬운 규칙입니다.',
           en:'Politely tell someone not to do something. Attach -지 마세요 straight onto any verb stem without vowel harmony or batchim rules.' },
  level: 'Beginner',
  needs: 'bg-18',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-19-01',
    title: { ko:'1강. 정중한 금지: -지 마세요', en:'Lesson 1. Polite Prohibition: -지 마세요' },
    minutes: 6,
    blocks: [
      { t:'text', md:'To politely say **“Please do not do X”**, attach **-지 마세요** directly to the verb stem.\n\nThere are no vowel harmony changes and no batchim exceptions! Simply take the stem and add **-지 마세요**.' },

      { t:'table', head:['Verb','Stem','Prohibition (-지 마세요)'], rows:[
        ['가다 (to go)','가-','**가지 마세요** (Please don\'t go)'],
        ['먹다 (to eat)','먹-','**먹지 마세요** (Please don\'t eat)'],
        ['보다 (to look)','보-','**보지 마세요** (Please don\'t look)'],
        ['걱정하다 (to worry)','걱정하-','**걱정하지 마세요** (Please don\'t worry)'],
        ['담배를 피우다 (to smoke)','피우-','**피우지 마세요** (Please don\'t smoke)'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'걱정하지 마세요.', tip:'Please don’t worry. (Extremely frequent expression!)' },
        { ch:'가지 마세요.', tip:'Please don’t go.' },
        { ch:'여기서 사진을 찍지 마세요.', tip:'Please don’t take photos here.' },
      ]},

      { t:'choice', q:'How do you tell a friend "Please don\'t worry" warmly? (걱정하다 = to worry)',
        options:['걱정하지 마세요','걱정안하세요','걱정못하세요','걱정하면 안 돼요'], answer:0,
        why:'Attach -지 마세요 directly to the stem: 걱정하- + -지 마세요 = 걱정하지 마세요.' },

      { t:'cloze', sentence:'너무 슬퍼[하지 마세요]. 괜찮아요.', answer:'하지 마세요',
        options:['하지 마세요','하세요','해서 마세요','하고 마세요'],
        meaning:'Please don’t be too sad. It is okay.',
        why:'슬퍼하다 + -지 마세요 = 슬퍼하지 마세요 (Please don’t be sad).' },

      { t:'order', q:'Put in order: "Please do not take pictures here."',
        tokens:['여기서','사진을','찍지','마세요.'], answer:['여기서','사진을','찍지','마세요.'] },

      { t:'correct', wrong:'오늘 날씨가 추우니까 밖에 가 마세요.',
        answers:['오늘 날씨가 추우니까 밖에 가지 마세요.','오늘 날씨가 추우니까 밖에 가지 마세요'],
        hint:'Attach -지 마세요 to 가다: 가- + -지 마세요 = 가지 마세요',
        why:'The negative imperative ending is -지 마세요: 밖에 가지 마세요.' },

      { t:'translate', q:'Please don\'t worry. Everything is okay.',
        answers:['걱정하지 마세요. 다 괜찮아요.','걱정하지 마세요. 괜찮아요.','걱정하지 마세요. 다 괜찮아요'],
        hint:'걱정하다 → 걱정하지 마세요, 다 괜찮아요' },

      { t:'speak', say:'걱정하지 마세요. 다 괜찮아요.', q:'Read aloud warmly:' },
    ],
  },

  {
    id: "bg-19-02", title: {"ko":"2강. 모든 어간에 바로 붙이기: 받침과 불규칙","en":"Lesson 2. Direct Attachment: Batchim and Irregular Verb Stems"}, minutes: 5,
    blocks: [
      {"t":"text","h":"No Stem Changes: -지 마세요 Attaches Directly","md":"Good news! **-지 마세요** is one of the easiest grammar points in Korean because **it attaches directly to any verb stem** without changing it:\n\n- **Consonant (받침) or Vowel:** No difference! Just drop **다** and add **-지 마세요**.\n  - 가다 → 가**지 마세요**\n  - 먹다 → 먹**지 마세요**\n- **Irregular verbs:** Keep their basic dictionary stem! No irregular changes occur before **-지**:\n  - 돕다 (ㅂ irregular) → 돕**지 마세요**\n  - 듣다 (ㄷ irregular) → 듣**지 마세요**\n  - 울다 (ㄹ stem) → 울**지 마세요**\n  - 만들다 (ㄹ stem) → 만들**지 마세요**"},
      {"t":"table","head":["Dictionary Verb","Stem","Negative Imperative (-지 마세요)","English Meaning"],"rows":[["보다 (to look)","보","보지 마세요","Please do not look"],["만지다 (to touch)","만지","만지지 마세요","Please do not touch"],["듣다 (ㄷ irregular)","듣","듣지 마세요","Please do not listen"],["울다 (ㄹ stem)","울","울지 마세요","Please do not cry"],["포기하다 (to give up)","포기하","포기하지 마세요","Please do not give up"]]},
      {"t":"note","md":"Remember: Never change the ㄷ to ㄹ or ㅂ to 우 before -지! It is always **듣지 마세요** (not 들지 마세요) and **돕지 마세요** (not 도우지 마세요)."},
      {"t":"chars","wide":true,"items":[{"ch":"전시물을 손으로 만지지 마세요.","tip":"Please do not touch the exhibits with your hands. (만지다 → 만지지 마세요)"},{"ch":"슬퍼하지 말고 울지 마세요.","tip":"Do not be sad, and please do not cry. (울다 → 울지 마세요)"},{"ch":"끝까지 포기하지 마세요!","tip":"Please do not give up until the end! (포기하다 → 포기하지 마세요)"}]},
      {"t":"choice","q":"How do you tell someone not to cry using ‘울다’ (to cry)?","options":["울지 마세요","우지 마세요","울이지 마세요"],"answer":0,"why":"-지 마세요 attaches directly to the stem 울- without dropping ㄹ: **울지 마세요**."},
      {"t":"choice","q":"How do you tell someone not to touch using ‘만지다’ (to touch)?","options":["만지지 마세요","만지 마세요","만지이지 마세요"],"answer":0,"why":"Attach -지 마세요 directly to the stem 만지-: **만지지 마세요**."},
      {"t":"pair","q":"Match each verb with its negative imperative (-지 마세요) form.","pairs":[["먹다","먹지 마세요"],["듣다","듣지 마세요"],["열다","열지 마세요"],["건너다","건너지 마세요"]]},
      {"t":"cloze","sentence":"위험하니까 도로를 [건너지 마세요].","answer":"건너지 마세요","meaning":"Because it is dangerous, please do not cross the road.","options":["건너지 마세요","건너 마세요","건너개 마세요","건너고 마세요"],"keys":["건너지 마세요","건너 마세요","건너개 마세요","건너고 마세요"],"why":"Attach -지 마세요 to stem 건너-: **건너지 마세요**."},
      {"t":"type","q":"Attach -지 마세요 to 듣다 (to listen): 「나쁜 소문은 ___ .」","answer":"듣지 마세요","keys":["듣지 마세요","들지 마세요","듣이지 마세요"],"why":"Keep the base stem 듣- without irregular change: **듣지 마세요**."},
      {"t":"speak","say":"절대로 희망을 버리거나 포기하지 마세요.","rom":"jeol-dae-ro hui-mang-eul beo-ri-geo-na po-gi-ha-ji ma-se-yo","q":"Say it aloud encouraging someone: “Never discard hope or give up.”"},
    ],
  },
  {
    id: "bg-19-03", title: {"ko":"3강. 금지의 세 단계: 하지 마세요 vs 하면 안 돼요","en":"Lesson 3. Degrees of Prohibition: -지 마세요 vs -(으)면 안 돼요"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Polite Request Not to Act vs Strict Rule Prohibition","md":"How do you say “don't” in Korean? It depends on whether you are making a polite request or stating an objective rule:\n\n- **-지 마세요 (Polite negative request / advice):**\n  - “Please don't...”\n  - Focuses on asking the listener not to do something.\n  - 예: 너무 무리하**지 마세요** (Please don't overwork yourself).\n- **-(으)면 안 돼요 (Rule / Absolute prohibition):**\n  - “You must not... / It is against the rules”\n  - States that something is strictly prohibited or unacceptable by law, rules, or morality.\n  - 예: 여기서 담배를 피우**면 안 돼요** (You must not smoke here / Smoking is forbidden)."},
      {"t":"table","head":["Context","Polite Advice (-지 마세요)","Strict Prohibition (-(으)면 안 돼요)"],"rows":[["Health / Well-being","늦게 자지 마세요","늦게 자면 안 돼요"],["Public law / Rule","사진 찍지 마세요","사진 찍으면 안 돼요"],["Safety warning","뛰지 마세요","뛰면 안 돼요"],["Kind reassurance","걱정하지 마세요","걱정하면 안 돼요 (Too forceful)"]]},
      {"t":"note","md":"Notice that for comforting someone, **걱정하지 마세요** (Don't worry) is natural and caring. Saying 걱정하면 안 돼요 sounds harsh, like commanding their feelings!"},
      {"t":"chars","wide":true,"items":[{"ch":"도서관 안에서는 통화하면 안 돼요.","tip":"You must not talk on the phone inside the library. (-(으)면 안 돼요 rule)"},{"ch":"감기 걸렸을 때는 찬물을 마시지 마세요.","tip":"When you have a cold, please do not drink cold water. (-지 마세요 advice)"},{"ch":"시험 중에는 옆 사람과 이야기하면 안 됩니다.","tip":"During the exam, talking with others is strictly forbidden."}]},
      {"t":"choice","q":"A sign in an art museum strictly prohibits photography. What does the rule state?","options":["여기서 사진을 촬영하면 안 됩니다","여기서 사진을 촬영하세요","여기서 사진을 촬영하고 싶어요"],"answer":0,"why":"Public regulations and rules express prohibition with -(으)면 안 되다: **촬영하면 안 됩니다**."},
      {"t":"choice","q":"A friend is feeling anxious about an interview. How do you comfort them warmly?","options":["너무 걱정하지 마세요, 잘할 거예요","너무 걱정해야 돼요","너무 걱정하고 있어요"],"answer":0,"why":"To comfort someone warmly, say **걱정하지 마세요** (Please don't worry)."},
      {"t":"pair","q":"Match each situation with the appropriate prohibition nuance.","pairs":[["Official rule: No parking","주차하면 안 돼요"],["Kindly advising a sick friend","무리하지 마세요"],["Warning: Do not open door","문을 열면 안 돼요"],["Reassuring someone worried","걱정하지 마세요"]]},
      {"t":"cloze","sentence":"극장 안에서는 전화를 [받으면 안 돼요].","answer":"받으면 안 돼요","meaning":"Inside the theater, you must not answer phone calls.","options":["받으면 안 돼요","받지 마세요","받고 안 돼요","받개 안 돼요"],"keys":["받으면 안 돼요","받지 마세요","받고 안 돼요","받개 안 돼요"],"why":"To state a standard public rule (“must not answer”), use -(으)면 안 돼요: **받으면 안 돼요**."},
      {"t":"type","q":"Conjugate 들어가다 into the rule prohibition: 「관계자 외에는 ___ .」","answer":"들어가면 안 돼요","keys":["들어가면 안 돼요","들어가면 안 되요","들어가지면 안 돼요"],"why":"Attach -면 안 돼요 to stem 들어가-: **들어가면 안 돼요**."},
      {"t":"speak","say":"시험 볼 때는 스마트폰을 사용하면 안 돼요.","rom":"si-heom bol ttae-neun seu-ma-teu-pon-eul sa-yong-ha-myeon an dwae-yo","q":"Say it aloud stating a strict exam rule clearly."},
    ],
  },
  {
    id: "bg-19-04", title: {"ko":"4강. 실전 대화: 공공장소 안내문과 따뜻한 위로","en":"Lesson 4. Real-Life Conversation: Public Signs and Warm Reassurance"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Everyday Signs, Notices, and Encouragement","md":"In Korea, you will see and hear **-지 마세요** constantly in two distinct situations:\n\n1. **Public Signs & Etiquette Notices:**\n   - 지하철에서: **뛰지 마세요** (Please do not run on the platform / escalator).\n   - 병원에서: **음식을 드시지 마세요** (Please do not eat food before checkup).\n   - 카페에서: **외부 음식을 반입하지 마세요** (Please do not bring outside food).\n2. **Warm Reassurance & Encouragement:**\n   - **걱정하지 마세요** (Please don't worry).\n   - **부담 갖지 마세요** (Please don't feel burdened).\n   - **포기하지 마세요** (Please don't give up)."},
      {"t":"table","head":["Place / Situation","Korean Sign / Phrase","English Meaning"],"rows":[["Subway escalator","손잡이를 놓지 마세요","Please do not let go of the handrail"],["Hospital lobby","큰 소리로 통화하지 마세요","Please do not talk loudly on the phone"],["Comforting a friend","자책하지 마세요","Please do not blame yourself"],["Encouraging a student","틀리는 것을 두려워하지 마세요","Do not be afraid of making mistakes"]]},
      {"t":"note","md":"When adding honorific **-(으)시-** to negative commands, attach it to the stem *before* **-지 마세요**: 드시다 → **드시지 마세요**, 앉으시다 → **앉으시지 마세요**."},
      {"t":"chars","wide":true,"items":[{"ch":"에스컬레이터에서는 걷거나 뛰지 마세요.","tip":"Please do not walk or run on the escalator. (Public safety notice)"},{"ch":"실수해도 괜찮으니까 너무 걱정하지 마세요.","tip":"It’s okay to make mistakes, so please don't worry too much. (Warm comfort)"},{"ch":"어려워도 절대 포기하지 마세요!","tip":"Even if it is difficult, please never give up! (Encouragement)"}]},
      {"t":"choice","q":"You see a safety warning on the subway platform. Which sentence tells passengers not to run?","options":["승강장에서 뛰지 마세요","승강장에서 뛰세요","승강장에서 뛰고 있어요"],"answer":0,"why":"Safety notices asking passengers not to run use -지 마세요: **뛰지 마세요**."},
      {"t":"choice","q":"A classmate is nervous before a presentation. What is the warmest thing to say?","options":["긴장하지 마세요, 잘할 수 있어요","긴장하면 안 돼요","긴장하고 싶어요"],"answer":0,"why":"To comfort someone warmly, say **긴장하지 마세요** (Please don't be nervous)."},
      {"t":"pair","q":"Match each sign with its correct location.","pairs":[["사진을 찍지 마세요","Art gallery"],["큰 소리로 떠들지 마세요","Quiet library study room"],["손잡이를 꼭 잡으세요","Subway escalator"],["담배를 피우지 마세요","Non-smoking building"]]},
      {"t":"cloze","sentence":"다 잘될 테니까 너무 [염려하지 마세요].","answer":"염려하지 마세요","meaning":"Everything will turn out well, so please don't worry too much.","options":["염려하지 마세요","염려하세요","염려하고 마세요","염려개 마세요"],"keys":["염려하지 마세요","염려하세요","염려하고 마세요","염려개 마세요"],"why":"To reassure someone kindly: 염려하다 + -지 마세요 → **염려하지 마세요**."},
      {"t":"type","q":"Tell someone kindly: “Please don't overwork” using 무리하다: 「건강을 위해 너무 ___ .」","answer":"무리하지 마세요","keys":["무리하지 마세요","무리하지 마새요","무리하개 마세요"],"why":"Attach -지 마세요 to 무리하-: **무리하지 마세요**."},
      {"t":"speak","say":"괜찮아요, 실수해도 되니까 너무 부담 갖지 마세요.","rom":"gwaen-chanh-a-yo, sil-su-hae-do doe-ni-kka neo-mu bu-dam gat-ji ma-se-yo","q":"Say it aloud warmly comforting a coworker."},
    ],
  },
  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-20 — 할 수 있어요 / 없어요
   능력(배운 기술)과 상황적 가능성(상황이 허락함).
   -(으)ㄹ 수 있다/없다를 두 레슨으로 나누어 정복한다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-20',
  emoji: '💪',
  title: { ko:'할 수 있어요 / 없어요', en:'Ability & Possibility: -(으)ㄹ 수 있다 / 없다' },
  tagline: { ko:'능력과 가능 말하기 — 할 수 있는 것과 없는 것', en:'Express what you can and cannot do.' },
  blurb: { ko:'"한국어 할 수 있어요", "수영할 수 없어요"처럼 능력과 상황적 가능성을 말하는 법을 배웁니다. ㄹ 불규칙 탈락과 미래 관형형 조각의 결합을 미리 맛봅니다.',
           en:'Talk about abilities (skills you have) and possibilities (what circumstances permit). Learn the versatile -(으)ㄹ 수 있다 / 없다.' },
  level: 'Beginner',
  needs: 'bg-19',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-20-01',
    title: { ko:'1강. 능력: 배운 기술과 할 줄 아는 것', en:'Lesson 1. Personal Ability: Can & Cannot' },
    minutes: 7,
    blocks: [
      { t:'text', md:'To say **“I can do X”** or **“I cannot do X”**, attach **-(으)ㄹ 수 있어요 / 없어요**:\n- Stem without batchim → **-ㄹ 수 있어요** *(하다 → 할 수 있어요)*\n- Stem with batchim → **-을 수 있어요** *(먹다 → 먹을 수 있어요)*\n\n**ㄹ Stems**: Stems ending in **ㄹ** simply attach **수 있어요** directly! *(만들다 → 만들 수 있어요)*' },

      { t:'table', head:['Verb','Can (할 수 있어요)','Cannot (할 수 없어요)'], rows:[
        ['하다 (to do)','**할 수 있어요**','**할 수 없어요**'],
        ['먹다 (to eat)','**먹을 수 있어요**','**먹을 수 없어요**'],
        ['수영하다 (to swim)','**수영할 수 있어요**','**수영할 수 없어요**'],
        ['만들다 (ㄹ stem)','**만들 수 있어요**','**만들 수 없어요**'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'한국어를 조금 할 수 있어요.', tip:'I can speak a little Korean.' },
        { ch:'수영을 할 수 있어요.', tip:'I can swim.' },
        { ch:'매운 음식을 먹을 수 없어요.', tip:'I cannot eat spicy food.' },
      ]},

      { t:'choice', q:'How do you say "I can make kimchi" with 만들다 (to make)?',
        options:['김치를 만들 수 있어요','김치를 만들을 수 있어요','김치를 만드 수 있어요','김치를 만들고 있어요'], answer:0,
        why:'Verbs ending in ㄹ attach 수 있어요 directly: 만들- + 수 있어요 = 만들 수 있어요.' },

      { t:'cloze', sentence:'저는 한국어를 조금 [할 수 있어요].', answer:'할 수 있어요',
        options:['할 수 있어요','할 수 없어요','하고 있어요','하면 돼요'],
        meaning:'I can speak a little Korean.',
        why:'하다 + -ㄹ 수 있어요 = 할 수 있어요 (I can do).' },

      { t:'order', q:'Put in order: "I can swim."',
        tokens:['저는','수영을','할','수','있어요.'], answer:['저는','수영을','할','수','있어요.'] },

      { t:'correct', wrong:'저는 매운 음식을 먹을 수 안 있어요.',
        answers:['저는 매운 음식을 먹을 수 없어요.', '저는 매운 음식을 먹을 수 없어요'],
        hint:'The negative of 있다 is 없다: 먹을 수 없어요',
        why:'The negative of -(으)ㄹ 수 있다 is -(으)ㄹ 수 없다: 먹을 수 없어요.' },

      { t:'translate', q:'I can speak a little Korean.',
        answers:['한국어를 조금 할 수 있어요.','한국어 조금 할 수 있어요.','한국어를 조금 할 수 있어요'],
        hint:'한국어(를), 조금, 하다 → 할 수 있어요' },

      { t:'speak', say:'저는 한국어를 조금 할 수 있어요.', q:'Read aloud with confidence:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-20-02',
    title: { ko:'2강. 상황적 가능성: 되는 상황과 안 되는 상황', en:'Lesson 2. Situational Possibility' },
    minutes: 6,
    blocks: [
      { t:'text', md:'Beyond personal abilities, **-(으)ㄹ 수 있다 / 없다** is used when **circumstances allow or prevent** an action:\n\n- *“오늘은 바빠서 갈 수 없어요.”* (I can\'t go today because I\'m busy — not about leg ability, but schedule!)\n- *“여기서 사진을 찍을 수 있어요?”* (Can we take photos here? — asking about rules)' },

      { t:'table', head:['Situation','Sentence','Meaning'], rows:[
        ['Schedule conflict','오늘은 바빠서 **갈 수 없어요**','Can\'t go because busy'],
        ['Asking permission/rule','여기서 사진을 **찍을 수 있어요?**','Can we take photos here?'],
        ['Payment method','카드로 **결제할 수 있어요?**','Can I pay by credit card?'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'내일 만날 수 있어요?', tip:'Can we meet tomorrow?' },
        { ch:'오늘은 바빠서 갈 수 없어요.', tip:'I’m busy today, so I can’t go.' },
        { ch:'여기서 카드로 결제할 수 있어요?', tip:'Can I pay by card here?' },
      ]},

      { t:'choice', q:'How do you ask a friend "Can we meet tomorrow?"',
        options:['내일 만날 수 있어요?','내일 만날 수 없어요?','내일 만나야 돼요?','내일 만나고 있어요?'], answer:0,
        why:'만나다 + -ㄹ 수 있어요? asks if meeting is possible: 만날 수 있어요?' },

      { t:'cloze', sentence:'오늘은 일이 많아서 [갈 수 없어요].', answer:'갈 수 없어요',
        options:['갈 수 없어요','갈 수 있어요','가고 싶어요','가야 돼요'],
        meaning:'I have a lot of work today, so I cannot go.',
        why:'Because of work, the situation prevents going: 갈 수 없어요.' },

      { t:'order', q:'Put in order: "Can we meet tomorrow afternoon?"',
        tokens:['내일','오후에','만날','수','있어요?'], answer:['내일','오후에','만날','수','있어요?'] },

      { t:'translate', q:'I am busy today, so I cannot meet.',
        answers:['오늘 바빠서 만날 수 없어요.','오늘은 바빠서 만날 수 없어요.','오늘 바빠서 만날 수 없어요'],
        hint:'오늘 바빠서, 만나다 → 만날 수 없어요' },

      { t:'speak', say:'오늘은 바빠서 갈 수 없어요.', q:'Read aloud:' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-21 — 같이 할까요
   넷을 한 코스 안에 각각 다른 강으로 나눈다:
   - 1강: 묻기(-(으)ㄹ까요) & 하자(-(으)ㅂ시다)
   - 2강: 내가 할게(-(으)ㄹ게요) — 상대에 대한 약속
   - 3강: 나 할래(-(으)ㄹ래요) — 개인의 의사와 부드러운 권유
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-21',
  emoji: '🤝',
  title: { ko:'같이 할까요: 묻기·제안·약속·의사', en:'Together & Intentions: -(으)ㄹ까요, -(으)ㅂ시다, -(으)ㄹ게요, -(으)ㄹ래요' },
  tagline: { ko:'묻기, 같이 하기, 내가 하기, 나 할래 가려 쓰기', en:'Suggest, agree, promise, and express personal will.' },
  blurb: { ko:'형태는 비슷하지만 화자의 의도가 완전히 다른 넷을 배웁니다. 상대의 의견 묻기(-(으)ㄹ까요), 청유(-(으)ㅂ시다), 상대 앞에서의 약속(-(으)ㄹ게요), 개인의 의사(-(으)ㄹ래요)를 강별로 가려 씁니다.',
           en:'Four endings that share similar forms but express completely different intentions: asking opinions (-(으)ㄹ까요), suggesting (-(으)ㅂ시다), making a promise to the listener (-(으)ㄹ게요), and casual preferences (-(으)ㄹ래요).' },
  level: 'Beginner',
  needs: 'bg-20',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'bg-21-01',
    title: { ko:'1강. 의견 묻기와 제안: -(으)ㄹ까요? 와 -(으)ㅂ시다', en:'Lesson 1. Asking & Suggesting: -(으)ㄹ까요? & -(으)ㅂ시다' },
    minutes: 7,
    blocks: [
      { t:'text', md:'When suggesting an activity together, Korean has two natural tools:\n\n1. **-(으)ㄹ까요?** = *“Shall we...?”* (Asking the listener\'s opinion)\n   - 가다 → **갈까요?** *(Shall we go?)*\n   - 먹다 → **먹을까요?** *(Shall we eat?)*\n\n2. **-(으)ㅂ시다** = *“Let\'s...!”* (Polite, slightly formal suggestion)\n   - 가다 → **갑시다** *(Let\'s go!)*\n   - 시작하다 → **시작합시다** *(Let\'s begin!)*' },

      { t:'note', md:'**Usage Note on -(으)ㅂ시다**:\n-(으)ㅂ시다 is polite but sounds direct. To elders or superiors, do not say -(으)ㅂ시다; instead use the gentler **-(으)ㄹ까요?** or **-아/어요**.' },

      { t:'table', head:['Verb','Shall we? (-(으)ㄹ까요?)','Let\'s! (-(으)ㅂ시다)'], rows:[
        ['가다 (to go)','**갈까요?**','**갑시다**'],
        ['먹다 (to eat)','**먹을까요?**','**먹읍시다**'],
        ['마시다 (to drink)','**마실까요?**','**마십시다**'],
        ['시작하다 (to start)','**시작할까요?**','**시작합시다**'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'오늘 점심에 뭐 먹을까요?', tip:'What shall we eat for lunch today?' },
        { ch:'같이 커피 마실까요?', tip:'Shall we grab coffee together?' },
        { ch:'시간이 됐어요. 출발합시다!', tip:'Time is up. Let’s depart!' },
      ]},

      { t:'choice', q:'How do you suggest "Shall we drink coffee together?" politely?',
        options:['같이 커피 마실까요?','같이 커피 마실게요','같이 커피 마셨어요','같이 커피 마시세요'], answer:0,
        why:'-(으)ㄹ까요? asks the listener\'s opinion: 마시- + -ㄹ까요? = 마실까요?' },

      { t:'cloze', sentence:'시간이 다 됐어요. 이제 [시작합시다].', answer:'시작합시다',
        options:['시작합시다','시작할까요','시작하세요','시작했어요'],
        meaning:'Time is up. Let’s begin now.',
        why:'시작하다 + -(으)ㅂ시다 = 시작합시다 (Let’s begin).' },

      { t:'order', q:'Put in order: "What shall we eat for lunch today?"',
        tokens:['오늘','점심에','뭐','먹을까요?'], answer:['오늘','점심에','뭐','먹을까요?'] },

      { t:'correct', wrong:'날씨가 좋으니까 산책을 하읍시다.',
        answers:['날씨가 좋으니까 산책을 합시다.','날씨가 좋으니까 산책합시다.','날씨가 좋으니까 산책을 합시다'],
        hint:'하다 verbs attach -ㅂ시다: 산책하다 → 산책합시다',
        why:'하다 attaches -ㅂ시다 directly to 하-: 산책합시다.' },

      { t:'translate', q:'What shall we eat for lunch today?',
        answers:['오늘 점심에 뭐 먹을까요?','오늘 점심 뭐 먹을까요?','오늘 점심에 뭐 먹을까요'],
        hint:'오늘 점심(에), 뭐, 먹다 → 먹을까요?' },

      { t:'speak', say:'오늘 점심에 뭐 먹을까요?', q:'Read aloud with friendly intonation:' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'bg-21-02',
    title: { ko:'2강. 상대에게 하는 약속: -(으)ㄹ게요', en:'Lesson 2. A Promise to the Listener: -(으)ㄹ게요' },
    minutes: 7,
    blocks: [
      { t:'text', md:'**-(으)ㄹ게요** means *“I will (do that for you / take care of it)”*.\n\nCrucial rule: **It is strictly FIRST PERSON ("I") and represents a promise directly to the listener!**\n\nCompare:\n- **-(으)ㄹ 거예요**: A neutral statement of a future plan. *(내일 친구를 만날 거예요 = I will meet a friend tomorrow.)*\n- **-(으)ㄹ게요**: A promise or volunteer made to the listener right now. *(제가 도와줄게요 = I will help you!)*' },

      { t:'table', head:['Situation','-(으)ㄹ게요 (Promise)','Meaning'], rows:[
        ['Volunteering','제가 **할게요**!','I will do it!'],
        ['Promising to call','내일 다시 **전화할게요**','I will call you back tomorrow'],
        ['Heading over','10분 뒤에 **갈게요**','I will be there in 10 minutes'],
        ['Paying the bill','제가 **살게요**','It\'s on me / I\'ll buy it!'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'제가 할게요. 걱정하지 마세요.', tip:'I will do it. Don’t worry.' },
        { ch:'내일 다시 전화할게요.', tip:'I’ll call you again tomorrow.' },
        { ch:'나중에 연락할게요.', tip:'I’ll get in touch with you later.' },
      ]},

      { t:'choice', q:'When a friend asks "Who will order food?", how do you volunteer "I will do it!"?',
        options:['제가 할게요.','제가 할까요?','제가 합시다.','제가 하세요.'], answer:0,
        why:'-(으)ㄹ게요 is used when volunteering or promising an action: 제가 할게요.' },

      { t:'cloze', sentence:'지금 바쁘니까 [나중에 전화할게요].', answer:'나중에 전화할게요',
        options:['나중에 전화할게요','나중에 전화하세요','나중에 전화할까요','나중에 전화합시다'],
        meaning:'Since I am busy right now, I will call you later.',
        why:'The speaker is making a promise to call the listener later: 전화할게요.' },

      { t:'correct', wrong:'내일 친구가 올게요.',
        answers:['내일 친구가 올 거예요.','내일 친구가 올 거예요'],
        hint:'-(으)ㄹ게요 can ONLY be used for "I" (first person), never for third person (친구)!',
        why:'-(으)ㄹ게요 is strictly for the speaker (I). For a third person, use -ㄹ 거예요: 내일 친구가 올 거예요.' },

      { t:'translate', q:'I will call you tomorrow.',
        answers:['내일 전화할게요.','내일 다시 전화할게요.','내일 전화할게요'],
        hint:'내일, 전화하다 → 전화할게요' },

      { t:'speak', say:'제가 할게요. 걱정하지 마세요.', q:'Read aloud with reassurance:' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'bg-21-03',
    title: { ko:'3강. 개인의 의사와 부드러운 권유: -(으)ㄹ래요', en:'Lesson 3. Personal Will & Gentle Asking: -(으)ㄹ래요' },
    minutes: 7,
    blocks: [
      { t:'text', md:'**-(으)ㄹ래요** has two very common everyday uses in spoken Korean:\n\n1. **Statement (I)**: *“I want to / I’ll have...”* (Expressing personal preference)\n   - 저는 비빔밥 **먹을래요**. *(I want to have bibimbap.)*\n   - 저는 집에서 **쉴래요**. *(I\'d rather rest at home.)*\n\n2. **Question (You)**: *“Do you want to...? / Would you like to...?”* (A warm, casual invitation)\n   - 같이 커피 **마실래요?** *(Do you want to grab coffee together?)*\n   - 내일 영화 **볼래요?** *(Want to watch a movie tomorrow?)*' },

      { t:'table', head:['Ending','Speaker\'s Intention','Example'], rows:[
        ['-(으)ㄹ까요?','Asking opinion / "Shall we?"','커피 **마실까요?**'],
        ['-(으)ㅂ시다','Formal suggestion / "Let\'s"','커피 **마십시다**'],
        ['-(으)ㄹ게요','Speaker\'s promise / "I will"','커피 **살게요** (I\'ll buy)'],
        ['-(으)ㄹ래요','Personal preference / invitation','커피 **마실래요?** (Want coffee?)'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'같이 커피 마실래요?', tip:'Would you like to grab coffee together?' },
        { ch:'저는 비빔밥 먹을래요.', tip:'I want to eat bibimbap.' },
        { ch:'주말에 같이 영화 볼래요?', tip:'Want to watch a movie together this weekend?' },
      ]},

      { t:'choice', q:'At a restaurant, how do you state your personal choice "I\'ll have bibimbap"?',
        options:['저는 비빔밥 먹을래요.','저는 비빔밥 먹을까요?','저는 비빔밥 먹읍시다.','저는 비빔밥 먹으세요.'], answer:0,
        why:'-(으)ㄹ래요 expresses personal preference/will: 저는 비빔밥 먹을래요.' },

      { t:'cloze', sentence:'오늘 저녁에 [같이 밥 먹을래요]?', answer:'같이 밥 먹을래요',
        options:['같이 밥 먹을래요','같이 밥 먹을게요','같이 밥 먹으세요','같이 밥 먹었어요'],
        meaning:'Do you want to have dinner together tonight?',
        why:'-(으)ㄹ래요? is a warm, casual invitation to the listener: 같이 밥 먹을래요?' },

      { t:'order', q:'Put in order: "Do you want to watch a movie together on the weekend?"',
        tokens:['주말에','같이','영화','볼래요?'], answer:['주말에','같이','영화','볼래요?'] },

      { t:'translate', q:'Do you want to drink coffee together?',
        answers:['같이 커피 마실래요?','같이 커피 마실래요'],
        hint:'같이, 커피를 마시다 → 마실래요?' },

      { t:'speak', say:'같이 커피 마실래요? 좋아요.', q:'Read aloud naturally:' },
    ],
  },

  ],
},

];
