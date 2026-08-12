/* ══════════════════════════════════════════════════════════════
   문법 커리큘럼
   ──────────────────────────────────────────────────────────────
   블록 종류와 규칙은 courses.js 머리말과 같다. 여기서는 문법만 다룬다.
   파일을 나눈 이유는 courses.js 가 이미 550줄이고, 문법은 계속 늘어날
   예정이라 한 파일에 두면 고칠 곳을 찾기 어려워지기 때문이다.

   ── 손대기 전에 ────────────────────────────────────────────
   lesson.id 는 진도(lesson_progress)의 열쇠다. **바꾸면 그 레슨을
   끝낸 사람의 기록이 사라진다.** 순서를 바꾸는 건 괜찮고, id 는 두어라.
   여기 id 는 전부 `gr-` 로 시작한다 — 기존 hangul-*, fw-* 와 겹치지 않는다.

   ── 원본 ───────────────────────────────────────────────────
   classroom-web/src/lib/content/ 의 한국어 문법 커리큘럼에서 옮겨 왔다.
   그쪽은 한국어로 설명하고 여기는 영어로 설명한다 — 이 사이트를 쓰는
   사람은 한국어를 배우러 온 외국인이라, 설명까지 한국어면 읽지 못한다.
   ══════════════════════════════════════════════════════════════ */

export const GRAMMAR_COURSES = [

/* ═══════════════════════════════════════════════════════════════
   문법의 뼈대
   시제 → 부정 → 조사 → 연결. 이 순서가 아니면 뒤에서 막힌다.
   조사를 모르면 예문을 읽을 수 없고, 활용을 모르면 조사를 붙일 데가 없다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'grammar-core',
  emoji: '뼈',
  title: 'Building Sentences',
  tagline: 'The machinery behind every Korean sentence.',
  blurb: 'You can say a few phrases. Now learn how they are built — so you can make your own instead of repeating ones you memorised. Tenses, negation, particles, and joining clauses.',
  lv: 'bg',
  level: 'After First Words',
  // needs 를 일부러 비워 둔다. 순서상으로는 First Words 다음이지만, 이미
  // 말을 좀 하는 사람이 문법만 보러 오는 경우가 많다. 그런 사람에게
  // 자물쇠를 보여 주면 그냥 나간다. 순서는 level 문구로만 알려 준다.
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'gr-01',
    title: 'Verbs bend at the end',
    minutes: 7,
    blocks: [
      { t:'text', md:'Every Korean verb and adjective in the dictionary ends in **다**: 가다 (go), 먹다 (eat), 예쁘다 (pretty).' },
      { t:'text', md:'Nobody says 다 out loud. You chop it off, keep the front part — the **stem** — and glue a new ending on. That is the whole system.' },

      { t:'table',
        head:['Dictionary','Stem','Polite present'],
        rows:[
          ['가다 — to go','가','가**요**'],
          ['먹다 — to eat','먹','먹**어요**'],
          ['하다 — to do','하','**해요**'],
        ]},

      { t:'text', h:'Which ending — 아요 or 어요?',
        md:'Look at the **last vowel of the stem**. If it is ㅏ or ㅗ, use 아요. Everything else takes 어요. And 하다 is irregular in a friendly way: it always becomes 해요.' },

      { t:'chars', items:[
        { ch:'가요', rom:'ga-yo', tip:'가 + 아요. Two ㅏ sounds collapse into one — you never say 가아요.' },
        { ch:'먹어요', rom:'meo-geo-yo', tip:'먹 + 어요. The stem vowel is ㅓ, so 어요.' },
        { ch:'해요', rom:'hae-yo', tip:'하다 → 해요. Memorise this one; it turns up constantly.' },
      ]},

      { t:'note', md:'**Adjectives conjugate too.** In English you need “is” — *it is pretty*. In Korean 예쁘다 becomes 예뻐요 and that is already a full sentence. No “to be” needed.' },

      { t:'choice', q:'공부하다 means “to study”. How do you say it politely?',
        options:['공부하요','공부해요','공부아요'], answer:1,
        why:'Anything ending in 하다 becomes 해요. 공부하다 → 공부해요.' },

      { t:'choice', q:'The stem of 먹다 is…',
        options:['먹다','먹','다'], answer:1,
        why:'Chop off 다, keep 먹. Every ending attaches to that.' },

      { t:'type', q:'Type the polite present form of 가다.',
        answer:'가요', keys:['가요','가아요','가어요','해요'],
        why:'가 + 아요 contracts to 가요. You never say 가아요 — the two ㅏ merge.' },

      { t:'speak', say:'저는 매일 공부해요', rom:'jeo-neun mae-il gong-bu-hae-yo', q:'“I study every day.”' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'gr-02',
    title: 'Yesterday and tomorrow',
    minutes: 7,
    blocks: [
      { t:'text', md:'Past tense uses the same ㅏ/ㅗ rule you just learned. Slot **았/었** in before 어요.' },

      { t:'table',
        head:['Present','Past','Meaning'],
        rows:[
          ['가요','갔어요','went'],
          ['먹어요','먹었어요','ate'],
          ['해요','했어요','did'],
        ]},

      { t:'note', md:'**갔어요, not 가았어요.** When the stem already ends in ㅏ, the two merge. Korean hates repeating the same vowel twice in a row.' },

      { t:'text', h:'The future: -(으)ㄹ 거예요',
        md:'For plans and predictions. If the stem ends in a vowel, add **ㄹ 거예요**. If it ends in a consonant, add **을 거예요**.' },

      { t:'chars', items:[
        { ch:'갈 거예요', rom:'gal geo-ye-yo', tip:'가 has no final consonant → ㄹ 거예요.' },
        { ch:'먹을 거예요', rom:'meo-geul geo-ye-yo', tip:'먹 ends in ㄱ → 을 거예요.' },
      ]},

      { t:'choice', q:'“I ate bread.” (빵 = bread)',
        options:['빵을 먹어요','빵을 먹었어요','빵을 먹을 거예요'], answer:1,
        why:'먹 + 었어요 = 먹었어요, past.' },

      { t:'choice', q:'읽다 means “to read”. How do you say “I will read”?',
        options:['읽ㄹ 거예요','읽을 거예요','읽 거예요'], answer:1,
        why:'읽 ends in a consonant, so 을 거예요.' },

      { t:'order', q:'Build “I will go to Seoul tomorrow.”  (내일 = tomorrow, 서울에 = to Seoul)',
        tokens:['내일','서울에','갈 거예요'], answer:['내일','서울에','갈 거예요'] },

      { t:'speak', say:'어제 친구를 만났어요', rom:'eo-je chin-gu-reul man-na-sseo-yo', q:'“I met a friend yesterday.”' },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'gr-03',
    title: 'Two more registers',
    minutes: 6,
    blocks: [
      { t:'text', md:'해요 is the everyday polite form and it will carry you almost anywhere. But you will hear two others constantly, so you should recognise them.' },

      { t:'text', h:'-(스)ㅂ니다 — the formal one',
        md:'News anchors, job interviews, army, announcements, presentations. Vowel stem takes **ㅂ니다**, consonant stem takes **습니다**.' },

      { t:'table',
        head:['Stem','Formal','Everyday'],
        rows:[
          ['가','갑니다','가요'],
          ['먹','먹습니다','먹어요'],
          ['감사하','감사합니다','고마워요'],
        ]},

      { t:'note', md:'You already know one: **감사합니다**. That is the formal form of 감사하다. Now you can see the machinery inside a phrase you had memorised whole.' },

      { t:'text', h:'-고 있다 — happening right now',
        md:'The equivalent of English *-ing*. Blessedly simple: it attaches to the bare stem with no vowel rules at all.' },

      { t:'chars', items:[
        { ch:'먹고 있어요', rom:'meok-go i-sseo-yo', tip:'I am eating (right now).' },
        { ch:'자고 있어요', rom:'ja-go i-sseo-yo', tip:'He is sleeping.' },
      ]},

      { t:'choice', q:'You are giving a presentation at work. Which fits best?',
        options:['시작해요','시작합니다'], answer:1,
        why:'Formal setting → -(스)ㅂ니다. 시작합니다 = “I will begin.”' },

      { t:'type', q:'“I am reading a book.”  책을 ___ 있어요  (읽다 = to read)',
        answer:'읽고', keys:['읽고','읽어','읽을','읽는'],
        why:'Stem + 고 있어요. No vowel rule to worry about.' },

      { t:'speak', say:'지금 밥을 먹고 있어요', rom:'ji-geum ba-beul meok-go i-sseo-yo', q:'“I am eating right now.”' },
    ],
  },

  /* ── 4 ─────────────────────────────────────────────────── */
  {
    id: 'gr-04',
    title: 'Saying no: 안 and 못',
    minutes: 6,
    blocks: [
      { t:'text', md:'Korean has two different “not”, and picking the wrong one changes what you are saying about yourself.' },

      { t:'table',
        head:['','Means','Example'],
        rows:[
          ['**안**','I choose not to','안 가요 — I am not going'],
          ['**못**','I cannot','못 가요 — I cannot go'],
        ]},

      { t:'note', md:'**This distinction matters socially.** “안 갔어요” about a friend’s wedding sounds like you could not be bothered. “못 갔어요” says something prevented you. Same event, very different message.' },

      { t:'text', h:'The 하다 trap',
        md:'With [noun + 하다] verbs, 안 goes **inside**, between the noun and 하다. 공부 안 해요 — not 안 공부해요.' },

      { t:'choice', q:'You broke your leg. “I can’t exercise.” (운동하다)',
        options:['운동 안 해요','운동 못 해요'], answer:1,
        why:'A broken leg is not a choice — 못.' },

      { t:'choice', q:'Which is correct Korean?',
        options:['안 공부해요','공부 안 해요'], answer:1,
        why:'[Noun + 하다] verbs split, and 안 sits in the gap.' },

      { t:'text', h:'The long forms',
        md:'-지 않다 and -지 못하다 mean the same as 안 and 못, but sound a little more written. 가지 않아요 = 안 가요.' },

      { t:'order', q:'Build “I don’t drink coffee.”  (커피를 = coffee)',
        tokens:['저는','커피를','안','마셔요'], answer:['저는','커피를','안','마셔요'] },

      { t:'speak', say:'저는 매운 음식을 못 먹어요', rom:'jeo-neun mae-un eum-si-geul mot meo-geo-yo', q:'“I can’t eat spicy food.”' },
    ],
  },

  /* ── 5 ─────────────────────────────────────────────────── */
  {
    id: 'gr-05',
    title: 'The three particles that do the work',
    minutes: 8,
    blocks: [
      { t:'text', md:'English tells you who did what by **word order**. Korean tells you with little tags glued to each noun. That is why Korean word order can shuffle and the sentence still makes sense.' },

      { t:'table',
        head:['Particle','Marks','After vowel / consonant'],
        rows:[
          ['**이 / 가**','the subject — who does it','친구**가** / 눈**이**'],
          ['**은 / 는**','the topic — “as for…”','저**는** / 학생**은**'],
          ['**을 / 를**','the object — what it happens to','영화**를** / 책**을**'],
        ]},

      { t:'note', md:'The pattern repeats everywhere: **the form with the extra vowel goes after a consonant.** 이, 은, 을 follow consonants. 가, 는, 를 follow vowels. It is purely about keeping words easy to say.' },

      { t:'text', h:'이/가 vs 은/는 — the one everyone struggles with',
        md:'Rough rule that gets you far: 은/는 introduces or contrasts (**“as for me…”**), 이/가 points at who specifically did something. Native speakers feel this rather than think it, and so will you, eventually.' },

      { t:'chars', items:[
        { ch:'저는 학생이에요', rom:'jeo-neun hak-saeng-i-e-yo', tip:'As for me, I am a student. Introducing yourself.' },
        { ch:'제가 했어요', rom:'je-ga hae-sseo-yo', tip:'*I* did it. Answering “who did this?”' },
      ]},

      { t:'choice', q:'“동생” ends in a consonant. Which subject particle?',
        options:['동생가','동생이'], answer:1,
        why:'Consonant → 이.' },

      { t:'choice', q:'“I watch a movie.”  영화 ___ 봐요',
        options:['을','를'], answer:1,
        why:'영화 ends in a vowel → 를.' },

      { t:'pair', q:'Match each noun with the object particle it takes.',
        pairs:[['책','을'],['커피','를'],['빵','을'],['영화','를']] },

      { t:'order', q:'Build “I read a book.”',
        tokens:['저는','책을','읽어요'], answer:['저는','책을','읽어요'] },

      { t:'speak', say:'제가 커피를 마셔요', rom:'je-ga keo-pi-reul ma-syeo-yo', q:'“I drink coffee.”' },
    ],
  },

  /* ── 6 ─────────────────────────────────────────────────── */
  {
    id: 'gr-06',
    title: 'Where things are, where things happen',
    minutes: 7,
    blocks: [
      { t:'text', md:'Two particles both translate as “at”, and choosing wrong is the most common mistake learners make for months. The rule is short.' },

      { t:'table',
        head:['Particle','Use it for','Example'],
        rows:[
          ['**에**','existing somewhere, or going somewhere','집**에** 있어요 · 학교**에** 가요'],
          ['**에서**','*doing* something somewhere','도서관**에서** 공부해요'],
        ]},

      { t:'note', md:'**Test yourself with the verb.** 있다/없다/가다/오다 → 에. Any action verb — eat, study, work, meet → 에서. 집에 있어요 (I am at home) but 집에서 쉬어요 (I rest at home).' },

      { t:'text', h:'에 also does time',
        md:'세 시**에** (at 3), 주말**에** (on the weekend). But **never** with 어제, 오늘, 내일, 지금. 내일에 만나요 is wrong — just 내일 만나요.' },

      { t:'text', h:'People take 에게 / 한테',
        md:'Not 에. 친구**한테** 전화했어요 — I called my friend. 한테 is what you say out loud; 에게 is what you write.' },

      { t:'choice', q:'“I study at the library.”  도서관 ___ 공부해요',
        options:['에','에서'], answer:1,
        why:'공부하다 is an action → 에서.' },

      { t:'choice', q:'Which sentence is wrong?',
        options:['세 시에 만나요','내일에 만나요'], answer:1,
        why:'어제 / 오늘 / 내일 / 지금 never take 에.' },

      { t:'type', q:'“I gave a present to my younger sibling.”  동생___ 선물을 줬어요',
        answer:'한테', keys:['한테','에서','에','를'],
        why:'A person receiving something → 에게/한테.' },

      { t:'speak', say:'저는 카페에서 일해요', rom:'jeo-neun ka-pe-e-seo il-hae-yo', q:'“I work at a cafe.”' },
    ],
  },

  /* ── 7 ─────────────────────────────────────────────────── */
  {
    id: 'gr-07',
    title: 'Also, only, than, every',
    minutes: 7,
    blocks: [
      { t:'text', md:'These five short particles replace whole English words. They attach straight to the noun.' },

      { t:'table',
        head:['Particle','Means','Example'],
        rows:[
          ['**도**','also, too','저**도** 가요 — I am going too'],
          ['**만**','only','하나**만** 주세요 — just one, please'],
          ['**밖에**','only (and it is not enough)','천 원**밖에** 없어요'],
          ['**보다**','than','어제**보다** 따뜻해요'],
          ['**마다**','every','아침**마다** 운동해요'],
        ]},

      { t:'note', md:'**밖에 always needs a negative after it.** 천 원밖에 없어요 — “I only have 1,000 won” and it is not enough. Saying 천 원밖에 있어요 is broken Korean. 만 has no such rule.' },

      { t:'text', h:'도 replaces, it does not stack',
        md:'도 takes the place of 이/가 and 을/를 rather than joining them. 저**도** — never 저는도 or 저가도.' },

      { t:'choice', q:'“I only have 1,000 won.” — which is correct?',
        options:['천 원밖에 있어요','천 원밖에 없어요'], answer:1,
        why:'밖에 must be followed by a negative.' },

      { t:'choice', q:'“Today is warmer than yesterday.”  오늘이 어제___ 따뜻해요',
        options:['마다','보다'], answer:1,
        why:'보다 = than. 마다 = every.' },

      { t:'pair', q:'Match the particle to its meaning.',
        pairs:[['도','also'],['만','only'],['보다','than'],['마다','every']] },

      { t:'speak', say:'저도 커피만 마셔요', rom:'jeo-do keo-pi-man ma-syeo-yo', q:'“I drink only coffee too.”' },
    ],
  },

  /* ── 8 ─────────────────────────────────────────────────── */
  {
    id: 'gr-08',
    title: 'Joining two sentences',
    minutes: 8,
    blocks: [
      { t:'text', md:'English joins sentences with separate words — *and, but, so*. Korean prefers to bend the first verb and glue the halves together. This is what makes speech sound fluent rather than chopped.' },

      { t:'table',
        head:['Ending','Means','Example'],
        rows:[
          ['**-고**','and','싸**고** 맛있어요 — cheap and tasty'],
          ['**-지만**','but','어렵**지만** 재미있어요'],
          ['**-아/어서**','so, because','아파**서** 못 갔어요'],
          ['**-(으)니까**','because (with a request after)','추우**니까** 창문을 닫으세요'],
        ]},

      { t:'note', md:'**-아/어서 cannot be followed by a command.** “비가 와서 우산을 가져가세요” is wrong, even though it looks reasonable. Use -(으)니까 whenever the second half tells someone to do something. This one shows up in every exam.' },

      { t:'text', h:'-고 vs -아/어서 for sequences',
        md:'밥을 먹**고** 갔어요 — I ate, then left. Two separate events. 시장에 가**서** 샀어요 — I went to the market **and bought it there**. The second half carries on from the first.' },

      { t:'choice', q:'Which is wrong?',
        options:['비가 오니까 우산을 가져가세요','비가 와서 우산을 가져가세요'], answer:1,
        why:'A command after -아/어서 is not allowed. -(으)니까 is the fix.' },

      { t:'choice', q:'“Korean is difficult but fun.”  한국어는 어렵___ 재미있어요',
        options:['고','지만'], answer:1,
        why:'The two halves contrast → -지만.' },

      { t:'type', q:'“I ate and then went.”  밥을 ___ 갔어요',
        answer:'먹고', keys:['먹고','먹어서','먹지만','먹으니까'],
        why:'Two separate actions in order → -고.' },

      { t:'order', q:'Build “It rained, so I stayed home.”  (비가 와서 = it rained so)',
        tokens:['비가 와서','집에','있었어요'], answer:['비가 와서','집에','있었어요'] },

      { t:'speak', say:'한국어는 어렵지만 재미있어요', rom:'han-gu-geo-neun eo-ryeop-ji-man jae-mi-i-sseo-yo', q:'“Korean is hard, but fun.”' },
    ],
  },

  ],
},

];
