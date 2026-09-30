/* ══════════════════════════════════════════════════════════════
   초급 2단계 — 시간을 얹기
   ──────────────────────────────────────────────────────────────
   설계는 docs/curriculum-beginner.md §3, §4 (2단계) 에 있다.
   이 단계가 끝나면 학습자는 **어제 한 일과 내일 할 일을 말할 수 있다.**

   ── 설명은 영어, 예문은 한국어 ──────────────────────────────
   초급 학습자의 인지 부하를 줄이기 위해 설명과 힌트는 영어로,
   연습 문장과 선택지는 자연스러운 한국어로 작성한다.

   ── 코스 구성 ───────────────────────────────────────────────
   - bg-10: 과거 시제 -았/었- (2강)
   - bg-11: 진행 -고 있다 (1강)
   - bg-12: 시간을 말하는 자리: -기 전에/-(으)ㄴ 후에, -(으)ㄹ 때, -(으)ㄴ 지 (3강)
   - bg-irr-02: 불규칙 ②: ㄷ 불규칙 (듣다·걷다) & 르 불규칙 (모르다·빠르다) (2강)
   ══════════════════════════════════════════════════════════════ */

export const BEGINNER_STAGE2_COURSES = [

/* ═══════════════════════════════════════════════════════════════
   bg-10 — 과거 시제 -았/었-
   1강에서 과거 모음 규칙이 현재와 같다는 것을 짚는다.
   -아요/-어요를 뗀 사람은 -았/었-을 거저 얻는다. (curriculum §4)
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-10',
  emoji: '⏪',
  title: { ko:'과거 시제: -았/었-', en:'Past Tense: -았/었-' },
  tagline: { ko:'어제 한 일 말하기 — 현재형과 같은 모음 규칙', en:'The same vowel rule as present, just in the past.' },
  blurb: { ko:'-아요/-어요를 익힌 사람은 과거형을 거저 얻습니다. 어제 한 일, 지난 주말에 있었던 일을 말하는 2강 훈련입니다.',
           en:'If you know -아요/-어요, past tense is free: the vowel rule is identical. Talk about yesterday and what happened in two focused lessons.' },
  level: 'Beginner',
  needs: 'bg-irr-01',
  lessons: [

  {
    id: 'bg-10-01',
    title: { ko:'1강. 과거 모음 규칙은 현재와 같다', en:'Lesson 1. The past tense vowel rule is the same' },
    minutes: 6,
    blocks: [
      { t:'text', md:'Good news: **Korean past tense has no new rules to memorize.**\n\nIf a verb took **-아요**, its past is **-았어요**.\nIf it took **-어요**, its past is **-었어요**.\nAnd **하다** verbs? Just like **해요**, they become **했어요**.' },

      { t:'table', head:['Dictionary','Present (해요)','Past (했어요)'], rows:[
        ['가다 (to go)','가요','**갔어요**'],
        ['보다 (to see)','봐요','**봤어요**'],
        ['먹다 (to eat)','먹어요','**먹었어요**'],
        ['읽다 (to read)','읽어요','**읽었어요**'],
        ['공부하다 (to study)','공부해요','**공부했어요**'],
      ]},

      { t:'note', md:'Notice the pattern: **you simply slip -ㅆ- underneath the vowel of the present tense.**\n\n가요 → 갔어요  ·  봐요 → 봤어요  ·  해요 → 했어요\n\nEvery single verb you learned in Stage 1 is now a past tense verb you can already say.' },

      { t:'chars', wide:true, items:[
        { ch:'어제 친구를 만났어요.', tip:'I met a friend yesterday. 만나다 → 만났어요' },
        { ch:'주말에 영화를 봤어요.', tip:'I watched a movie on the weekend. 보다 → 봤어요' },
        { ch:'어제 밥을 맛있게 먹었어요.', tip:'I ate a delicious meal yesterday. 먹다 → 먹었어요' },
      ]},

      { t:'choice', q:'사다 (to buy) takes -아요 (사요). How do you say “I bought it” in the past?',
        options:['샀어요','사았어요','사었어요','사했어요'], answer:0,
        why:'사 + 았어요 merges into **샀어요**. Just like 가요 becomes 갔어요.' },

      { t:'cloze', sentence:'어제 집에서 책을 [읽었어요].', answer:'읽었어요',
        meaning:'I read a book at home yesterday.',
        options:['읽었어요','읽았어요','읽해요','읽을 거예요'],
        keys:['읽었어요','읽았어요','읽해요','읽을 거예요'],
        why:'읽 has vowel ㅣ, so it takes -었어요 → **읽었어요**. 읽았어요 uses the wrong vowel; 읽을 거예요 is future tense.' },

      { t:'cloze', sentence:'주말에 집에서 푹 [쉬었어요].', answer:'쉬었어요',
        meaning:'I rested well at home over the weekend.',
        options:['쉬었어요','쉬았어요','쉬고 싶어요','쉬어요'],
        keys:['쉬었어요','쉬았어요','쉬고 싶어요','쉬어요'],
        why:'쉬다 has vowel ㅟ (not ㅏ or ㅗ), so it takes -었어요 → **쉬었어요**.' },

      { t:'cloze', sentence:'어제 도서관에서 한국어를 [공부했어요].', answer:'공부했어요',
        meaning:'I studied Korean at the library yesterday.',
        options:['공부했어요','공부하었어요','공부했어요?','공부하고 있어요'],
        keys:['공부했어요','공부하었어요','공부했어요?','공부하고 있어요'],
        why:'All 하다 verbs become **했어요** in the past tense.' },

      { t:'pair', q:'Match each present tense with its past tense form.',
        pairs:[['가요','갔어요'],['먹어요','먹었어요'],['봐요','봤어요'],['운동해요','운동했어요']] },

      { t:'build', q:'Write it yourself: **“I met a friend yesterday.”**  (yesterday = 어제, friend = 친구)',
        answers:['어제 친구를 만났어요','어제 친구 만났어요','저는 어제 친구를 만났어요'],
        bank:['어제','친구를','만났어요','만나요','저는'],
        must:['만났어요'],
        hint:'Start with 어제 (takes no particle). Then 친구 with 를, and the past of 만나다.',
        why:'어제 친구를 만났어요. 어제 is a time word that refuses 에.' },

      { t:'speak', say:'어제 친구를 만났어요.', rom:'eo-je chin-gu-reul man-nass-eo-yo',
        q:'Say it out loud: “I met a friend yesterday.”' },
    ],
  },

  {
    id: 'bg-10-02',
    title: { ko:'2강. 어제 뭐 했어요? — 어제 한 일 말하기', en:'Lesson 2. What did you do yesterday?' },
    minutes: 6,
    blocks: [
      { t:'text', md:'Asking questions in the past tense uses the same magic trick you learned in Stage 1: **keep the word order and raise your intonation.**\n\n어제 뭐 **했어요?**  *(rising)* — What did you do yesterday?\n어제 친구 **만났어요.**  *(falling)* — I met a friend yesterday.' },

      { t:'chars', wide:true, items:[
        { ch:'어제 뭐 했어요?', tip:'What did you do yesterday?' },
        { ch:'지난주에 부산에 갔어요.', tip:'I went to Busan last week. 지난주 takes 에.' },
        { ch:'아까 커피 마셨어요.', tip:'I drank coffee a little while ago. 아까 = earlier.' },
      ]},

      { t:'note', md:'**Time words for the past:**\n- **어제** (yesterday) — takes *no* particle\n- **아까** (earlier today / a little while ago) — takes *no* particle\n- **지난주에** (last week) — takes **에**\n- **작년에** (last year) — takes **에**' },

      { t:'choice', q:'Which sentence has the correct particle pairing for time?',
        options:['지난주에 한국에 왔어요','어제에 영화를 봤어요','아까에 커피를 마셨어요','지금에 밥을 먹었어요'], answer:0,
        why:'지난주 takes **에** (지난주에). 어제, 아까, and 지금 refuse 에.' },

      { t:'cloze', sentence:'지난주에 제주도에 [갔어요].', answer:'갔어요',
        meaning:'I went to Jeju Island last week.',
        options:['갔어요','가요','갈 거예요','가고 싶어요'],
        keys:['갔어요','가요','갈 거예요','가고 싶어요'],
        why:'“지난주에” (last week) demands past tense → **갔어요**.' },

      { t:'cloze', sentence:'아까 카페에서 친구를 [봤어요].', answer:'봤어요',
        meaning:'I saw a friend at the cafe earlier.',
        options:['봤어요','봐요','볼 거예요','보았어요'],
        keys:['봤어요','봐요','볼 거예요','보았어요'],
        why:'아까 indicates an earlier past event. 보다 contracts to **봤어요**.' },

      { t:'order', q:'Build “I watched a movie at home yesterday.”',
        tokens:['어제','집에서','영화를','봤어요'], answer:['어제','집에서','영화를','봤어요'] },

      { t:'correct', wrong:'어제 학교에 가았어요.',
        answers:['어제 학교에 갔어요','어제 학교에 갔어요.'],
        hint:'ㅏ + 았 merges into 았 — 가 + 았어요 contracts into 갔어요.',
        why:'가았어요 is uncontracted; the correct form is **갔어요**.' },

      { t:'translate', q:'Translate into Korean: **“I drank coffee earlier.”**  (earlier = 아까, coffee = 커피)',
        answers:['아까 커피를 마셨어요','아까 커피 마셨어요','아까 커피를 마셨어요.','아까 커피 마셨어요.'],
        hint:'Start with 아까 (no particle), then 커피(를), then past tense of 마시다 (마셨어요).',
        why:'아까 커피를 마셨어요. 마시 + 었어요 contracts to 마셨어요.' },

      { t:'speak', say:'어제 뭐 했어요? 집에서 쉬었어요.', rom:'eo-je mwo haess-eo-yo? jib-e-seo swi-eoss-eo-yo',
        q:'Say both question and answer: “What did you do yesterday? I rested at home.”' },
    ],
  },

  {
    id: "bg-10-03", title: {"ko":"3강. 과거형 모음 줄임과 받침 꼴","en":"Lesson 3. Past Tense Contractions and Stem Patterns"}, minutes: 5,
    blocks: [
      {"t":"text","h":"How Past Tense Merges with Verb Stems","md":"To form the past tense in polite speech, attach **-았어요** or **-었어요**:\n\n- **ㅏ or ㅗ without 받침:** contracts into one syllable (가다 → **갔어요**, 보다 → **봤어요**, 오다 → **왔어요**).\n- **Other vowels without 받침:** contracts (배우다 → **배웠어요**, 마시다 → **마셨어요**, 쓰다 → **썼어요**).\n- **With 받침:** keep the stem intact! (먹다 → **먹었어요**, 앉다 → **앉았어요**).\n- **-하다 verbs:** always become **했어요**."},
      {"t":"table","head":["Verb","Stem Vowel","Batchim?","Past Form","Meaning"],"rows":[["보다","ㅗ","No","봤어요","saw / watched"],["마시다","ㅣ","No","마셨어요","drank"],["먹다","ㅓ","Yes (ㄱ)","먹었어요","ate"],["앉다","ㅏ","Yes (ㄵ)","앉았어요","sat"],["운동하다","하다","No","운동했어요","exercised"]]},
      {"t":"note","md":"Watch out for **쓰다** (to write / to use)! The ㅡ vowel drops out completely, taking -었어요 to become **썼어요** (not 쓰었어요)."},
      {"t":"chars","wide":true,"items":[{"ch":"어제 친구에게 편지를 썼어요.","tip":"I wrote a letter to a friend yesterday. (쓰다 → 썼어요)"},{"ch":"점심에 비빔밥을 먹었어요.","tip":"I ate bibimbap for lunch. (먹다 → 먹었어요)"},{"ch":"저녁에 공원에서 운동했어요.","tip":"I exercised in the park in the evening. (운동하다 → 운동했어요)"}]},
      {"t":"choice","q":"Which is the correct past tense of ‘배우다’ (to learn)?","options":["배웠어요","배우았어요","배았어요"],"answer":0,"why":"배우 ends in ㅜ. With -었어요, ㅜ + ㅓ merges into 워, making **배웠어요**. 배우았어요 uses the wrong vowel harmony, and 배았어요 drops the stem."},
      {"t":"pair","q":"Match each verb with its correct past tense form.","pairs":[["오다 (to come)","왔어요"],["마시다 (to drink)","마셨어요"],["읽다 (to read)","읽었어요"],["청소하다 (to clean)","청소했어요"]]},
      {"t":"cloze","sentence":"의자에 조용히 [앉았어요].","answer":"앉았어요","meaning":"I sat quietly on the chair.","options":["앉았어요","앉었어요","안잤어요","앉맀어요"],"keys":["앉았어요","앉었어요","안잤어요","앉맀어요"],"why":"The stem 앉 has vowel ㅏ, so it takes -았어요 → **앉았어요**. 앉었어요 has wrong vowel harmony, and 안잤어요 is a spelling error."},
      {"t":"type","q":"Conjugate 쓰다 (to write) into polite past tense: 「한국어로 일기를 ___ .」","answer":"썼어요","keys":["썼어요","쓰았어요","쓰었어요"],"why":"The vowel ㅡ drops before vowels, so 쓰 + 었어요 contracts to **썼어요**. 쓰았어요 and 쓰었어요 are uncontracted and incorrect."},
      {"t":"order","q":"Arrange the words to say: “I met my friend yesterday.”","tokens":["어제","친구를","만났어요"],"answer":["어제","친구를","만났어요"]},
      {"t":"speak","say":"어제 도서관에서 책을 읽고 공부했어요.","rom":"eo-je do-seo-gwan-e-seo chaeg-eul ilg-go gong-bu-haess-eo-yo","q":"Read out loud smoothly: “Yesterday I read a book and studied at the library.”"},
    ],
  },
  {
    id: "bg-10-04", title: {"ko":"4강. 과거형의 헷갈리는 짝과 불규칙","en":"Lesson 4. Confusing Past Pairs and Irregular Verbs"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Past Tense with Irregular Verbs","md":"Irregular verbs follow their special stem changes before **-았어요 / -었어요**:\n\n1. **ㄷ-irregular verbs (듣다, 걷다):** ㄷ changes to ㄹ → **들었어요**, **걸었어요**.\n2. **ㅂ-irregular verbs (춥다, 돕다):** ㅂ changes to 우/오 → **추웠어요**, **도왔어요**.\n3. **르-irregular verbs (빠르다, 모르다):** add an extra ㄹ → **빨랐어요**, **몰랐어요**."},
      {"t":"table","head":["Verb","Stem Change","Past Ending","Final Past Form","Meaning"],"rows":[["듣다","듣 → 들","-었어요","들었어요","listened / heard"],["걷다","걷 → 걸","-었어요","걸었어요","walked"],["춥다","춥 → 추우","-었어요","추웠어요","was cold"],["돕다","돕 → 도오","-았어요","도왔어요","helped"],["모르다","모르 → 몰ㄹ","-았어요","몰랐어요","didn’t know"]]},
      {"t":"note","md":"Regular verbs keep their consonant! For example, **닫다** (to close) is regular: **닫았어요** (not 달았어요). **입다** (to wear) is regular: **입었어요** (not 이웠어요)."},
      {"t":"chars","wide":true,"items":[{"ch":"어제 좋은 음악을 들었어요.","tip":"I listened to good music yesterday. (듣다 → 들었어요)"},{"ch":"지난주에는 날씨가 많이 추웠어요.","tip":"The weather was very cold last week. (춥다 → 추웠어요)"},{"ch":"그 사실을 전혀 몰랐어요.","tip":"I didn’t know that fact at all. (모르다 → 몰랐어요)"}]},
      {"t":"choice","q":"Which sentence correctly conjugates ‘듣다’ (to listen) in the past tense?","options":["라디오를 들었어요.","라디오를 듣었어요.","라디오를 들았어요."],"answer":0,"why":"듣다 changes ㄷ to ㄹ before vowel endings and takes -었어요, making **들었어요**. 듣었어요 fails to change ㄷ, and 들았어요 has wrong vowel harmony."},
      {"t":"choice","q":"Which sentence correctly conjugates ‘춥다’ (to be cold) in the past tense?","options":["어제 너무 추웠어요.","어제 너무 춥었어요.","어제 너무 추왔어요."],"answer":0,"why":"춥다 changes ㅂ to 우 before vowel endings, and 우 + 었 merges into **추웠어요**."},
      {"t":"pair","q":"Match each irregular verb with its correct past tense form.","pairs":[["듣다 (to listen)","들었어요"],["걷다 (to walk)","걸었어요"],["춥다 (to be cold)","추웠어요"],["모르다 (to not know)","몰랐어요"]]},
      {"t":"cloze","sentence":"어제 공원을 30분 동안 [걸었어요].","answer":"걸었어요","meaning":"Yesterday I walked in the park for 30 minutes.","options":["걸었어요","걷었어요","걸았어요","걷았어요"],"keys":["걸었어요","걷었어요","걸았어요","걷았어요"],"why":"걷다 is a ㄷ-irregular verb: ㄷ changes to ㄹ, and the stem vowel ㅓ takes -었어요 → **걸었어요**."},
      {"t":"type","q":"Conjugate 돕다 (to help) into polite past tense: 「친구를 ___ .」","answer":"도왔어요","keys":["도왔어요","돕았어요","도웠어요"],"why":"돕다 is an exception where ㅂ changes to 오 before -았/었-, merging with -았어요 into **도왔어요**."},
      {"t":"speak","say":"어제는 날씨가 추웠지만 공원을 걸었어요.","rom":"eo-je-neun nal-ssi-ga chu-woss-ji-man gong-won-eul geol-eoss-eo-yo","q":"Read out loud: “Yesterday the weather was cold, but I walked in the park.”"},
    ],
  },
  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-11 — 진행 -고 있다
   모음 조화도 받침 규칙도 없다. 어간에 -고 있어요를 붙이면 끝.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-11',
  emoji: '⏳',
  title: { ko:'진행형: -고 있다', en:'In Progress: -고 있다' },
  tagline: { ko:'지금 이 순간 하고 있는 일 — 받침·모음 불문', en:'What you are doing right this second — no stem changes.' },
  blurb: { ko:'모음 조화도 받침 규칙도 없습니다. 어간에 -고 있어요만 붙이면 “지금 ~하는 중”이 됩니다.',
           en:'No vowel harmony and no consonant rules. Just attach -고 있어요 to say you are in the middle of doing something right now.' },
  level: 'Beginner',
  needs: 'bg-d-02',
  lessons: [

  {
    id: 'bg-11-01',
    title: { ko:'1강. 지금 뭐 하고 있어요?', en:'Lesson 1. What are you doing right now?' },
    minutes: 5,
    blocks: [
      { t:'text', md:'To describe an action **in progress right now**, take the verb stem and attach **-고 있어요**.\n\n먹다 → 먹 + **고 있어요** → 먹고 있어요 (I am eating)\n하다 → 하 + **고 있어요** → 하고 있어요 (I am doing)\n\nThere are no vowel harmony changes and no 받침 exceptions. The stem never changes shape.' },

      { t:'chars', wide:true, items:[
        { ch:'지금 밥을 먹고 있어요.', tip:'I am eating a meal right now.' },
        { ch:'한국어를 공부하고 있어요.', tip:'I am studying Korean.' },
        { ch:'음악을 듣고 있어요.', tip:'I am listening to music.' },
      ]},

      { t:'note', md:'**-아요/-어요 vs. -고 있어요**\n\n- 커피 마셔요: “I drink coffee” (general habit or right now)\n- 커피 마시고 있어요: “I am drinking coffee right this second” (cup in hand)\n\n**Past continuous:** attach -고 있었어요 → 자고 있었어요 (I was sleeping).' },

      { t:'choice', q:'Which sentence means you are literally in the middle of reading a book right now?',
        options:['지금 책을 읽고 있어요','지금 책을 읽었어요','지금 책을 읽을 거예요','지금 책을 읽고 싶어요'], answer:0,
        why:'**-고 있어요** marks action currently underway. 읽었어요 is past, 읽을 거예요 is future, and 읽고 싶어요 is a wish.' },

      { t:'cloze', sentence:'지금 버스 정류장에서 친구를 [기다리고 있어요].', answer:'기다리고 있어요',
        meaning:'I am waiting for a friend at the bus stop right now.',
        options:['기다리고 있어요','기다렸어요','기다릴 거예요','기다리고 싶어요'],
        keys:['기다리고 있어요','기다렸어요','기다릴 거예요','기다리고 싶어요'],
        why:'“지금” (right now) shows the action is underway → **기다리고 있어요**.' },

      { t:'cloze', sentence:'아까 전화했을 때 [자고 있었어요].', answer:'자고 있었어요',
        meaning:'When you called earlier, I was sleeping.',
        options:['자고 있었어요','자고 있어요','잤어요','자고 싶었어요'],
        keys:['자고 있었어요','자고 있어요','잤어요','자고 싶었어요'],
        why:'“아까” sets the past frame; an action in progress in the past uses **-고 있었어요**.' },

      { t:'correct', wrong:'지금 밥을 먹고 이에요.',
        answers:['지금 밥을 먹고 있어요','지금 밥을 먹고 있어요.'],
        hint:'In-progress action is -고 있어요, using the verb 있다 (to exist/be).',
        why:'The ending is **-고 있어요**, not -고 이에요.' },

      { t:'translate', q:'Translate into Korean: **“I am studying right now.”**  (right now = 지금, to study = 공부하다)',
        answers:['지금 공부하고 있어요','저는 지금 공부하고 있어요','전 지금 공부하고 있어요','지금 공부하고 있어요.','저는 지금 공부하고 있어요.'],
        hint:'Start with 지금, then attach -고 있어요 to the stem of 공부하다.',
        why:'지금 공부하고 있어요. The stem is 공부하.' },

      { t:'speak', say:'지금 뭐 하고 있어요? 밥 먹고 있어요.', rom:'ji-geum mwo ha-go iss-eo-yo? bap meog-go iss-eo-yo',
        q:'Say it out loud: “What are you doing right now? I am eating.”' },
    ],
  },

  {
    id: "bg-11-02", title: {"ko":"2강. 어간에 그대로 붙는 -고 있다","en":"Lesson 2. Attaching -고 있다 to Any Verb Stem"}, minutes: 5,
    blocks: [
      {"t":"text","h":"No Stem Changes Needed!","md":"**-고 있다** is one of the easiest grammatical patterns in Korean because **the verb stem never changes**.\n\nWhether the stem ends in a vowel or a consonant, has 받침 or irregular letters (like ㄷ or ㅂ), you simply drop **-다** and attach **-고 있어요** directly!"},
      {"t":"table","head":["Verb","Stem Ending","Attaching -고 있어요","Full Form","Meaning"],"rows":[["가다 (to go)","Vowel (ㅏ)","가 + 고 있어요","가고 있어요","am going"],["먹다 (to eat)","Consonant (ㄱ)","먹 + 고 있어요","먹고 있어요","am eating"],["듣다 (to listen)","ㄷ irregular","듣 + 고 있어요","듣고 있어요","am listening"],["만들다 (to make)","ㄹ batchim","만들 + 고 있어요","만들고 있어요","am making"],["일하다 (to work)","-하다 verb","일하 + 고 있어요","일하고 있어요","am working"]]},
      {"t":"note","md":"Look at **듣다**! In -아요/-어요, 듣 becomes 들어요 (irregular change). But with -고 있다, the consonant doesn't meet a vowel, so it stays **듣고 있어요** (never 들고 있어요)."},
      {"t":"chars","wide":true,"items":[{"ch":"지금 음악을 듣고 있어요.","tip":"I am listening to music right now. (듣다 keeps ㄷ → 듣고 있어요)"},{"ch":"부엌에서 요리하고 있어요.","tip":"I am cooking in the kitchen. (요리하다 → 요리하고 있어요)"},{"ch":"친구에게 보낼 선물을 만들고 있어요.","tip":"I am making a gift to send to my friend. (만들다 → 만들고 있어요)"}]},
      {"t":"choice","q":"How do you conjugate ‘듣다’ (to listen) with -고 있어요?","options":["듣고 있어요","들고 있어요","듣고 이에요"],"answer":0,"why":"-고 attaches directly to the stem without triggering the ㄷ→ㄹ change, so it is **듣고 있어요**. 들고 있어요 means 'holding'."},
      {"t":"pair","q":"Match each verb to its continuous -고 있어요 form.","pairs":[["마시다 (to drink)","마시고 있어요"],["읽다 (to read)","읽고 있어요"],["만들다 (to make)","만들고 있어요"],["쉬다 (to rest)","쉬고 있어요"]]},
      {"t":"cloze","sentence":"지금 부엌에서 커피를 [만들고 있어요].","answer":"만들고 있어요","meaning":"I am making coffee in the kitchen right now.","options":["만들고 있어요","만들고 에요","만드고 있어요","만들고 있어요?"],"keys":["만들고 있어요","만들고 에요","만드고 있어요","만들고 있어요?"],"why":"Attach -고 있어요 directly to the stem 만들 → **만들고 있어요**."},
      {"t":"type","q":"Attach -고 있어요 to 쉬다 (to rest): 「지금 집에서 ___ .」","answer":"쉬고 있어요","keys":["쉬고 있어요","쉬고 에요","쉬이고 있어요"],"why":"Attach -고 있어요 directly to stem 쉬 → **쉬고 있어요**."},
      {"t":"order","q":"Arrange the words to say: “I am watching television now.”","tokens":["지금","텔레비전을","보고 있어요"],"answer":["지금","텔레비전을","보고 있어요"]},
      {"t":"speak","say":"방에서 책을 읽고 음악을 듣고 있어요.","rom":"bang-e-seo chaeg-eul ilg-go eum-ag-eul deud-go iss-eo-yo","q":"Read out loud: “I am reading a book and listening to music in my room.”"},
    ],
  },
  {
    id: "bg-11-03", title: {"ko":"3강. 단순 현재와의 차이와 쓸 수 없는 말","en":"Lesson 3. Progressive vs. Simple Present & Restrictions"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Progressive vs. Simple Present and Adjectives","md":"How is **-고 있어요** different from the simple polite ending **-아요/-어요**?\n\n- **-아요/-어요:** General habits, states, or actions (e.g., 매일 커피를 마셔요 = I drink coffee every day).\n- **-고 있어요:** The action is unfolding right at this exact moment (e.g., 지금 커피를 마시고 있어요 = I am drinking coffee right now).\n\n**CRITICAL RULE:** Adjectives (descriptive words like 크다, 예쁘다, 바쁘다) **CANNOT** use -고 있다! You can never say *예쁘고 있어요 or *바쁘고 있어요."},
      {"t":"table","head":["Korean Sentence","Form","Meaning","Context"],"rows":[["한국어를 배워요.","Simple present (-어요)","I learn Korean.","General fact / habit"],["한국어를 배우고 있어요.","Progressive (-고 있어요)","I am studying Korean right now.","In progress this second"],["방이 커요.","Adjective (-어요)","The room is big.","Correct state description"],["방이 크고 있어요 (X)","Adjective + -고 있다","Incorrect!","Adjectives cannot take -고 있다"]]},
      {"t":"note","md":"Clothing verbs like **입다** (to wear) and **신다** (to wear shoes) with -고 있다 mean the state of currently wearing them: **모자를 쓰고 있어요** (I am wearing a hat)."},
      {"t":"chars","wide":true,"items":[{"ch":"지금 안경을 쓰고 있어요.","tip":"I am wearing glasses. (Clothing state)"},{"ch":"친구는 청바지를 입고 있어요.","tip":"My friend is wearing jeans."},{"ch":"지금 회사에서 일하고 있어요.","tip":"I am working at the office right now."}]},
      {"t":"choice","q":"Why is the sentence “날씨가 춥고 있어요” wrong?","options":["춥다 is an adjective and cannot take -고 있다","춥다 needs an irregular ㅂ change before -고","The word 날씨 cannot take the subject particle"],"answer":0,"why":"Adjectives describe conditions and states, not active physical actions. Only action verbs take -고 있다. The correct sentence is **날씨가 추워요**."},
      {"t":"choice","q":"Which sentence naturally means “I am wearing sneakers right now”?","options":["운동화를 신고 있어요.","운동화를 신이고 있어요.","운동화를 신아요 있어요."],"answer":0,"why":"신다 (to wear on feet) takes -고 있어요 to mean currently wearing: **신고 있어요**."},
      {"t":"pair","q":"Match each sentence with its correct nuance.","pairs":[["매일 아침에 운동해요.","습관 (Daily habit)"],["지금 공원에서 운동하고 있어요.","진행 (In progress right now)"],["코트를 입고 있어요.","착용 상태 (Wearing a coat)"],["방이 깨끗해요.","상태 묘사 (Describing a clean room)"]]},
      {"t":"cloze","sentence":"지민은 노란색 셔츠를 [입고 있어요].","answer":"입고 있어요","meaning":"Jimin is wearing a yellow shirt.","options":["입고 있어요","입고 에요","입고 하요","입고 있어요?"],"keys":["입고 있어요","입고 에요","입고 하요","입고 있어요?"],"why":"입다 (to wear) + -고 있어요 expresses wearing clothes → **입고 있어요**."},
      {"t":"type","q":"Complete the sentence to say Jimin is wearing a hat: 「지민은 모자를 ___ .」","answer":"쓰고 있어요","keys":["쓰고 있어요","쓰고 에요","쓰고 하요"],"why":"쓰다 (to wear on head) takes -고 있어요 → **쓰고 있어요**."},
      {"t":"speak","say":"저는 지금 안경을 쓰고 한국어 책을 읽고 있어요.","rom":"jeo-neun ji-geum an-gyeong-eul sseu-go han-gug-eo chaeg-eul ilg-go iss-eo-yo","q":"Read out loud: “I am wearing glasses and reading a Korean book right now.”"},
    ],
  },
  {
    id: "bg-11-04", title: {"ko":"4강. 실전 대화: 전화와 약속 상황","en":"Lesson 4. Real-Life Dialogues: Calls and Appointments"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Answering “What are you doing right now?”","md":"In daily phone calls and text messages, **“지금 뭐 하고 있어요?”** (What are you doing right now?) is one of the most common questions.\n\nUse **-고 있어요** to state your immediate activity, such as being on the move, having a meal, or waiting!"},
      {"t":"table","head":["Situation","Question","Answer with -고 있어요","Meaning"],"rows":[["On the way","지금 어디예요?","지하철 타고 가고 있어요.","I'm going on the subway."],["At a cafe","지금 뭐 해요?","친구를 기다리고 있어요.","I'm waiting for a friend."],["During lunch","바빠요?","점심 먹고 있어요.","I'm eating lunch."],["Studying","통화 가능해요?","도서관에서 공부하고 있어요.","I'm studying at the library."]]},
      {"t":"note","md":"To say you are NOT doing an action right now, say **안 -고 있어요** (e.g., 지금 일 안 하고 있어요 = I'm not working right now)."},
      {"t":"chars","wide":true,"items":[{"ch":"A: 지금 통화할 수 있어요? B: 네, 집에서 쉬고 있어요.","tip":"A: Can you talk now? B: Yes, I'm resting at home."},{"ch":"A: 어디 가요? B: 지하철역으로 걸어가고 있어요.","tip":"A: Where are you going? B: I'm walking to the subway station."},{"ch":"A: 지우 씨 있어요? B: 지금 회의하고 있어요.","tip":"A: Is Jiu there? B: She is in a meeting right now."}]},
      {"t":"choice","q":"A friend calls and asks: “지금 뭐 하고 있어요?” You are in the middle of preparing lunch. What do you say?","options":["점심 준비하고 있어요.","점심 준비하고 에요.","점심 준비하요."],"answer":0,"why":"점심 준비하다 + -고 있어요 becomes **점심 준비하고 있어요**."},
      {"t":"choice","q":"You are on the bus heading to meet someone. How do you tell them?","options":["버스타고 가고 있어요.","버스타고 가고 에요.","버스타고 가고 하요."],"answer":0,"why":"가다 + -고 있어요 becomes **가고 있어요**."},
      {"t":"pair","q":"Match each question with its natural continuous response.","pairs":[["지금 바빠요?","네, 보고서를 쓰고 있어요."],["어디에 있어요?","정류장에서 버스를 기다리고 있어요."],["통화 괜찮아요?","미안해요, 지금 운전하고 있어요."],["주말에 보통 뭐 해요?","집에서 영화를 봐요."]]},
      {"t":"cloze","sentence":"A: 지금 어디예요? B: 약속 장소로 [가고 있어요].","answer":"가고 있어요","meaning":"A: Where are you now? B: I am on my way to the meeting place.","options":["가고 있어요","가고 에요","가고 하요","가고 있어요?"],"keys":["가고 있어요","가고 에요","가고 하요","가고 있어요?"],"why":"가다 + -고 있어요 → **가고 있어요** (statement form with period)."},
      {"t":"type","q":"Reply that you are waiting for a friend: 「카페에서 친구를 ___ .」","answer":"기다리고 있어요","keys":["기다리고 있어요","기다리고 에요","기다리고 하요"],"why":"기다리다 + -고 있어요 becomes **기다리고 있어요**."},
      {"t":"speak","say":"미안해요, 지금 지하철을 타고 가고 있어서 나중에 전화할게요.","rom":"mi-an-hae-yo, ji-geum ji-ha-cheol-eul ta-go ga-go iss-eo-seo na-jung-e jeon-hwa-hal-ge-yo","q":"Read out loud: “Sorry, I am taking the subway right now so I will call you later.”"},
    ],
  },
  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-12 — 시간을 말하는 자리
   설계 원칙 ③: 덩어리로 먼저, 분해는 나중에.
   -기 전에, -(으)ㄴ 후에, -(으)ㄹ 때, -(으)ㄴ 지
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-12',
  emoji: '⏰',
  title: { ko:'시간을 말하는 자리: 전·후·때·기간', en:'Time Phrases: Before, After, When & Duration' },
  tagline: { ko:'-기 전에, -(으)ㄴ 후에, -(으)ㄹ 때, -(으)ㄴ 지를 덩어리로 익히기', en:'Chunked time expressions you use every single day.' },
  blurb: { ko:'복잡한 문법 규칙을 분해하지 않고 덩어리로 먼저 말합니다. 일의 앞뒤와 걸린 시간을 자유롭게 표현하는 3강 코스입니다.',
           en:'Master time sequences as ready-made chunks before breaking down the grammar mechanics. Express before, after, when, and elapsed time.' },
  level: 'Beginner',
  needs: 'bg-11',
  lessons: [

  {
    id: 'bg-12-01',
    title: { ko:'1강. -기 전에 & -(으)ㄴ 후에', en:'Lesson 1. Before and After: -기 전에 & -(으)ㄴ 후에' },
    minutes: 6,
    blocks: [
      { t:'text', md:'Two essential time chunks for sequencing events:\n\n1. **[Verb Stem] + -기 전에** = Before doing...\n2. **[Verb Stem-(으)ㄴ] + 후에** = After doing...\n\n밥 먹**기 전에** 손을 씻어요.  — Before eating, I wash my hands.\n밥 먹**은 후에** 커피를 마셔요.  — After eating, I drink coffee.' },

      { t:'table', head:['Verb','-기 전에 (Before)','-(으)ㄴ 후에 (After)'], rows:[
        ['먹다 (to eat)','먹**기 전에**','먹**은 후에** (받침 ㅇ)'],
        ['가다 (to go)','가**기 전에**','가**ㄴ 후에** (받침 없음)'],
        ['자다 (to sleep)','자**기 전에**','자**ㄴ 후에** (받침 없음)'],
        ['운동하다 (to exercise)','운동하**기 전에**','운동하**ㄴ 후에**'],
      ]},

      { t:'chars', wide:true, items:[
        { ch:'밥 먹기 전에 손을 씻어요.', tip:'Wash your hands before eating.' },
        { ch:'밥 먹은 후에 커피를 마셔요.', tip:'Drink coffee after eating.' },
        { ch:'수업이 끝난 후에 만나요.', tip:'Let’s meet after class finishes.' },
      ]},

      { t:'choice', q:'“밥 먹___ 전에 손을 씻어요.” Which ending fits “before”?',
        options:['먹기','먹은','먹을','먹고'], answer:0,
        why:'“Before doing” is always **-기 전에** → 먹기 전에. 먹은 후에 is “after doing”.' },

      { t:'cloze', sentence:'영화가 끝[난 후에] 밥 먹어요.', answer:'난 후에',
        meaning:'Let’s eat after the movie ends.',
        options:['난 후에','나기 전에','나고 싶어요','났어요'],
        keys:['난 후에','나기 전에','나고 싶어요','났어요'],
        why:'끝나다 has no final 받침 on 나, so it takes -ㄴ 후에 → **끝난 후에**.' },

      { t:'cloze', sentence:'한국에 오[기 전에] 한국어를 배웠어요.', answer:'기 전에',
        meaning:'Before coming to Korea, I learned Korean.',
        options:['기 전에','온 후에','올 때','오고 싶어서'],
        keys:['기 전에','온 후에','올 때','오고 싶어서'],
        why:'“Before doing” uses **-기 전에** → 오기 전에.' },

      { t:'correct', wrong:'밥을 먹은 전에 손을 씻어요.',
        answers:['밥을 먹기 전에 손을 씻어요','밥을 먹기 전에 손을 씻어요.','밥 먹기 전에 손을 씻어요','밥 먹기 전에 손을 씻어요.'],
        hint:'Before doing is always -기 전에, not -(으)ㄴ 전에.',
        why:'The before pattern is **-기 전에**.' },

      { t:'build', q:'Write it yourself: **“Let’s meet after class finishes.”**  (class = 수업, to finish = 끝나다)',
        answers:['수업이 끝난 후에 만나요','수업 끝난 후에 만나요'],
        bank:['수업이','수업','끝난 후에','끝나기 전에','만나요'],
        must:['끝난 후에'],
        hint:'Use 끝난 후에 for “after it finishes”, and 만나요 for “let’s meet”.',
        why:'수업이 끝난 후에 만나요.' },

      { t:'speak', say:'밥 먹은 후에 커피를 마셔요.', rom:'bap meog-eun hu-e keo-pi-reul ma-syeo-yo',
        q:'Say it out loud: “After eating, I drink coffee.”' },
    ],
  },

  {
    id: 'bg-12-02',
    title: { ko:'2강. -(으)ㄹ 때 — 어떤 순간에', en:'Lesson 2. When / While: -(으)ㄹ 때' },
    minutes: 5,
    blocks: [
      { t:'text', md:'**-(으)ㄹ 때** means **when** or **at the time that**.\n\n- No 받침 → **-ㄹ 때**: 가다 → **갈 때** (when going)\n- Has 받침 → **-을 때**: 먹다 → **먹을 때** (when eating)\n- Stem ends in ㄹ: 살다 → **살 때** (when living)\n\n시간 **있을 때** 뭐 해요?  — What do you do when you have time?' },

      { t:'chars', wide:true, items:[
        { ch:'한국에 갈 때 선물 샀어요.', tip:'I bought a gift when I went to Korea.' },
        { ch:'시간 있을 때 뭐 해요?', tip:'What do you do when you have time?' },
        { ch:'심심할 때 음악을 들어요.', tip:'When I’m bored, I listen to music.' },
      ]},

      { t:'choice', q:'“시간이 있___ 때 전화하세요.” Which one attaches to 있다?',
        options:['있을','있는','있고','있은'], answer:0,
        why:'있다 has a 받침 (ㅆ), so it takes **-을 때** → 있을 때.' },

      { t:'cloze', sentence:'피곤[할 때] 따뜻한 차를 마셔요.', answer:'할 때',
        meaning:'When I am tired, I drink warm tea.',
        options:['할 때','한 후에','하기 전에','해요'],
        keys:['할 때','한 후에','하기 전에','해요'],
        why:'피곤하다 ends in vowel 하, so it takes -ㄹ 때 → **피곤할 때**.' },

      { t:'cloze', sentence:'어렸[을 때] 한국에서 살았어요.', answer:'을 때',
        meaning:'When I was young, I lived in Korea.',
        options:['을 때','ㄹ 때','고 싶을 때','은 후에'],
        keys:['을 때','ㄹ 때','고 싶을 때','은 후에'],
        why:'어렸 has a 받침 (ㅆ), so it takes -을 때 → **어렸을 때** (when I was young).' },

      { t:'translate', q:'Translate into Korean: **“What do you do when you have time?”**  (time = 시간, to have = 있다, what = 뭐, to do = 하다)',
        answers:['시간 있을 때 뭐 해요','시간이 있을 때 뭐 해요','시간 있을 때 뭐 해요?','시간이 있을 때 뭐 해요?'],
        hint:'Combine 시간(이) with 있다 + -(으)ㄹ 때, followed by 뭐 해요?',
        why:'시간(이) 있을 때 뭐 해요? 있다 takes -을 때.' },

      { t:'speak', say:'시간 있을 때 음악을 들어요.', rom:'si-gan iss-eul ttae eum-ag-eul deul-eo-yo',
        q:'Say it out loud: “When I have time, I listen to music.”' },
    ],
  },

  {
    id: 'bg-12-03',
    title: { ko:'3강. -(으)ㄴ 지 [시간] 됐어요', en:'Lesson 3. Elapsed time: -(으)ㄴ 지 [time] 됐어요' },
    minutes: 5,
    blocks: [
      { t:'text', md:'To say **“It has been [duration] since I did [action]”**, use:\n\n**[Verb-(으)ㄴ] 지 + [Time] + 됐어요**\n\n한국에 **온 지** 일 년 **됐어요**.  — It’s been a year since I came to Korea.\n한국어를 **배운 지** 세 달 **됐어요**.  — It’s been three months since I started learning Korean.' },

      { t:'chars', wide:true, items:[
        { ch:'한국에 온 지 일 년 됐어요.', tip:'It’s been a year since I came to Korea.' },
        { ch:'한국어를 배운 지 세 달 됐어요.', tip:'It’s been three months since I learned Korean.' },
        { ch:'친구를 못 본 지 오래됐어요.', tip:'It’s been a long time since I saw my friend.' },
      ]},

      { t:'choice', q:'“한국에 온 ___ 일 년 됐어요.” Which particle completes “since doing”?',
        options:['지','때','후','전'], answer:0,
        why:'The elapsed time pattern is **-(으)ㄴ 지 [time] 됐어요**.' },

      { t:'cloze', sentence:'밥을 먹[은 지] 세 시간 됐어요.', answer:'은 지',
        meaning:'It has been three hours since I ate.',
        options:['은 지','는 지','을 때','기 전에'],
        keys:['은 지','는 지','을 때','기 전에'],
        why:'먹다 has a consonant 받침 (ㄱ), so it takes -은 지 → **먹은 지**.' },

      { t:'cloze', sentence:'친구를 못 만[난 지] 오래됐어요.', answer:'난 지',
        meaning:'It has been a long time since I met my friend.',
        options:['난 지','나는 지','날 때','나기 전에'],
        keys:['난 지','나는 지','날 때','나기 전에'],
        why:'만나다 ends in vowel ㅏ, so it takes -ㄴ 지 → **만난 지**.' },

      { t:'correct', wrong:'한국어를 배우는 지 삼 개월 됐어요.',
        answers:['한국어를 배운 지 삼 개월 됐어요','한국어를 배운 지 3개월 됐어요','한국어를 배운 지 삼 개월 됐어요.','한국어를 배운 지 3개월 됐어요.'],
        hint:'The elapsed time pattern takes -(으)ㄴ 지, so 배우다 becomes 배운 지.',
        why:'Elapsed time requires **-(으)ㄴ 지** → 배운 지.' },

      { t:'build', q:'Write it yourself: **“It has been one year since I came to Korea.”**  (one year = 일 년, to come = 오다)',
        answers:['한국에 온 지 일 년 됐어요','한국에 온 지 1년 됐어요'],
        bank:['한국에','온 지','오는 지','일 년','됐어요'],
        must:['온 지'],
        hint:'Use 오다 + -ㄴ 지 (온 지), followed by 일 년 됐어요.',
        why:'한국에 온 지 일 년 됐어요.' },

      { t:'speak', say:'한국어를 배운 지 세 달 됐어요.', rom:'han-gug-eo-reul bae-un ji se dal dwaess-eo-yo',
        q:'Say it out loud: “It has been three months since I started learning Korean.”' },
    ],
  },

  {
    id: "bg-12-04", title: {"ko":"4강. 시간 표현 네 가지의 꼴 만들기","en":"Lesson 4. Shaping the Four Time Expressions"}, minutes: 5,
    blocks: [
      {"t":"text","h":"Batchim Rules Across the 4 Time Patterns","md":"Let’s look at how the 4 time connectors attach to verb stems:\n\n1. **-기 전에 (Before):** Stems never change! Attach directly: 먹기 전에, 가기 전에.\n2. **-(으)ㄴ 후에 (After):** 받침 있음 → **-은 후에**, 받침 없음 → **-ㄴ 후에**.\n3. **-(으)ㄹ 때 (When):** 받침 있음 → **-을 때**, 받침 없음 → **-ㄹ 때**.\n4. **-(으)ㄴ 지 (Elapsed time):** 받침 있음 → **-은 지**, 받침 없음 → **-ㄴ 지**."},
      {"t":"table","head":["Verb","-기 전에","-(으)ㄴ 후에","-(으)ㄹ 때","-(으)ㄴ 지"],"rows":[["가다 (no 받침)","가기 전에","간 후에","갈 때","간 지"],["먹다 (받침 ㄱ)","먹기 전에","먹은 후에","먹을 때","먹은 지"],["읽다 (받침 ㄺ)","읽기 전에","읽은 후에","읽을 때","읽은 지"],["만들다 (받침 ㄹ)","만들기 전에","만든 후에","만들 때","만든 지"]]},
      {"t":"note","md":"Look at **만들다** (ㄹ stem)! Before ㄴ, the ㄹ drops out: **만든 후에**, **만든 지**. But with -(으)ㄹ 때, the existing ㄹ merges directly: **만들 때** (not 만들을 때)!"},
      {"t":"chars","wide":true,"items":[{"ch":"밥을 먹기 전에 손을 씻어요.","tip":"I wash hands before eating. (먹다 + 기 전에)"},{"ch":"수업이 끝난 후에 만나요.","tip":"Let’s meet after class ends. (끝나다 + ㄴ 후에)"},{"ch":"시간이 있을 때 운동해요.","tip":"When I have time, I exercise. (있다 + 을 때)"}]},
      {"t":"choice","q":"Which form correctly attaches -(으)ㄹ 때 to ‘만나다’ (to meet)?","options":["만날 때","만나을 때","만난 때"],"answer":0,"why":"만나다 has no final consonant (받침), so it attaches -ㄹ 때 to become **만날 때**."},
      {"t":"choice","q":"How does ‘만들다’ (to make) attach to -(으)ㄴ 후에?","options":["만든 후에","만들은 후에","만들ㄴ 후에"],"answer":0,"why":"Verbs ending in ㄹ drop the ㄹ before ㄴ, resulting in **만든 후에**."},
      {"t":"pair","q":"Match each verb and connector to its correct form.","pairs":[["자다 + -기 전에","자기 전에"],["도착하다 + -(으)ㄴ 후에","도착한 후에"],["공부하다 + -(으)ㄹ 때","공부할 때"],["졸업하다 + -(으)ㄴ 지","졸업한 지"]]},
      {"t":"cloze","sentence":"외출하[기 전에] 날씨를 확인해요.","answer":"기 전에","meaning":"Before going out, I check the weather.","options":["기 전에","기 때에","기 지에","기 후에에"],"keys":["기 전에","기 때에","기 지에","기 후에에"],"why":"The pattern for 'before doing' is **-기 전에**."},
      {"t":"type","q":"Attach -(으)ㄴ 후에 to 먹다 (to eat): 「밥을 ___ 커피를 마셔요.」","answer":"먹은 후에","keys":["먹은 후에","먹는 후에","먹을 후에"],"why":"먹다 has a final consonant (ㄱ), so it attaches -은 후에 → **먹은 후에**."},
      {"t":"speak","say":"밥을 먹은 후에 이를 닦고, 자기 전에 책을 읽어요.","rom":"bab-eul meog-eun hu-e i-reul dakk-go, ja-gi jeon-e chaeg-eul ilg-eo-yo","q":"Read out loud connecting the two time patterns naturally."},
    ],
  },
  ],
},

/* ═══════════════════════════════════════════════════════════════
   bg-irr-02 — 불규칙 ②: ㄷ 불규칙과 르 불규칙
   - ㄷ: 듣다·걷다 → 모음 앞에서 ㄹ로 변함
   - 르: 모르다·빠르다 → 모음 앞에서 ㄹㄹ로 합쳐짐
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'bg-irr-02',
  emoji: '🔄',
  title: { ko:'모양이 바뀌는 동사 ②: ㄷ과 르', en:'Verbs That Change Shape ②: ㄷ and 르' },
  tagline: { ko:'듣다·걷다, 그리고 가장 많이 쓰는 “몰라요”', en:'ㄷ changes to ㄹ, and 르 doubles: the verbs behind “몰라요”.' },
  blurb: { ko:'음악을 듣고 길을 걷는 일상 동사 ㄷ 불규칙과, 초급 최다 발화인 “모르겠어요/몰라요”의 르 불규칙을 2강으로 정리합니다.',
           en:'Meet ㄷ (듣다·걷다) which shifts to ㄹ before vowels, and 르 (모르다·빠르다) which powers everyday phrases like 몰라요.' },
  level: 'Beginner',
  needs: 'bg-12',
  lessons: [

  {
    id: 'bg-irr-02-01',
    title: { ko:'1강. ㄷ이 ㄹ로 바뀐다 — 듣다 · 걷다', en:'Lesson 1. ㄷ shifts to ㄹ: 듣다 & 걷다' },
    minutes: 6,
    blocks: [
      { t:'text', md:'When certain verbs ending in 받침 **ㄷ** meet an ending starting with a **vowel**, the ㄷ transforms into **ㄹ**.\n\n듣다 (to listen) → 들 + **어요** → **들어요**\n걷다 (to walk) → 걸 + **어요** → **걸어요**\n\nIn the past tense, the same thing happens: 들 + **었어요** → **들었어요**.' },

      { t:'note', md:'**Not every ㄷ verb changes.** Common regular ones keep their ㄷ:\n- **받다** (to receive) → 받아요 / 받았어요 (regular)\n- **닫다** (to close) → 닫아요 / 닫았어요 (regular)\n- **믿다** (to believe) → 믿어요 / 믿었어요 (regular)' },

      { t:'chars', wide:true, items:[
        { ch:'매일 음악을 들어요.', tip:'I listen to music every day. 듣다 → 들어요' },
        { ch:'공원에서 자주 걸어요.', tip:'I often walk in the park. 걷다 → 걸어요' },
        { ch:'어제 좋은 노래를 들었어요.', tip:'I listened to a good song yesterday. 듣다 → 들었어요' },
      ]},

      { t:'choice', q:'How do you conjugate 듣다 (to listen) into the present 해요 form?',
        options:['들어요','듣어요','듣아요','들아요'], answer:0,
        why:'ㄷ turns into ㄹ before a vowel, and the vowel ㅡ takes 어요 → **들어요**.' },

      { t:'cloze', sentence:'어제 라디오에서 그 노래를 [들었어요].', answer:'들었어요',
        meaning:'I heard that song on the radio yesterday.',
        options:['들었어요','듣었어요','들았어요','듣았어요'],
        keys:['들었어요','듣었어요','들았어요','듣았어요'],
        why:'듣다 changes ㄷ to ㄹ before vowels → **들었어요**.' },

      { t:'cloze', sentence:'날씨가 좋아서 한강에서 [걸었어요].', answer:'걸었어요',
        meaning:'The weather was nice, so I walked along the Han River.',
        options:['걸었어요','걷었어요','걸았어요','걷았어요'],
        keys:['걸었어요','걷었어요','걸았어요','걷았어요'],
        why:'걷다 changes ㄷ to ㄹ before vowels → **걸었어요**.' },

      { t:'choice', q:'Which of these verbs does **NOT** change its ㄷ?',
        options:['받다','듣다','걷다'], answer:0,
        why:'**받다** is regular: 받아요 / 받았어요. 듣다 and 걷다 become 들어요 and 걸어요.' },

      { t:'correct', wrong:'어제 음악을 듣었어요.',
        answers:['어제 음악을 들었어요','어제 음악을 들었어요.'],
        hint:'Before a vowel, the ㄷ in 듣다 changes to ㄹ.',
        why:'듣다 shifts ㄷ to ㄹ before vowels → **들었어요**.' },

      { t:'translate', q:'Translate into Korean: **“I listen to music every day.”**  (every day = 매일, music = 음악, to listen = 듣다)',
        answers:['매일 음악을 들어요','저는 매일 음악을 들어요','전 매일 음악을 들어요','매일 음악을 들어요.','저는 매일 음악을 들어요.'],
        hint:'Start with 매일, then 음악을, and conjugate 듣다 into 들어요.',
        why:'매일 음악을 들어요. 듣다 becomes 들어요.' },

      { t:'speak', say:'매일 공원에서 걸어요.', rom:'mae-il gong-won-e-seo geol-eo-yo',
        q:'Say it out loud: “I walk in the park every day.”' },
    ],
  },

  {
    id: 'bg-irr-02-02',
    title: { ko:'2강. 르가 ㄹㄹ로 합쳐진다 — 모르다 · 빠르다', en:'Lesson 2. 르 doubles to ㄹㄹ: 모르다 & 빠르다' },
    minutes: 6,
    blocks: [
      { t:'text', md:'When a verb stem ends in **르**, two things happen before -아/어:\n1. The vowel **ㅡ drops out**.\n2. An extra **ㄹ attaches underneath** the preceding syllable!\n\n모르다 → 모 + ㄹ + 라요 → **몰라요** (I don’t know)\n빠르다 → 빠 + ㄹ + 라요 → **빨라요** (It’s fast)\n다르다 → 다 + ㄹ + 라요 → **달라요** (It’s different)' },

      { t:'note', md:'**“잘 몰라요” is one of your primary survival tools in Korea.**\n\nWhen someone speaks too fast or asks directions: “죄송해요, 저 한국어 잘 몰라요” (Sorry, I don’t know Korean well). Everyone understands immediately.' },

      { t:'chars', wide:true, items:[
        { ch:'저는 한국어를 잘 몰라요.', tip:'I don’t know Korean well. 모르다 → 몰라요' },
        { ch:'지하철이 정말 빨라요.', tip:'The subway is really fast. 빠르다 → 빨라요' },
        { ch:'이거랑 저거는 달라요.', tip:'This and that are different. 다르다 → 달라요' },
      ]},

      { t:'choice', q:'How do you conjugate 모르다 (to not know) into the 해요 form?',
        options:['몰라요','모라요','모르요','몰러요'], answer:0,
        why:'르 loses its ㅡ and adds a ㄹ beneath 모 → **몰라요**.' },

      { t:'cloze', sentence:'그 사람 이름을 잘 [몰라요].', answer:'몰라요',
        meaning:'I don’t really know that person’s name.',
        options:['몰라요','모라요','모르아요','몰러요'],
        keys:['몰라요','모라요','모르아요','몰러요'],
        why:'모르다 becomes **몰라요**.' },

      { t:'cloze', sentence:'지하철이 버스보다 훨씬 [빨라요].', answer:'빨라요',
        meaning:'The subway is much faster than the bus.',
        options:['빨라요','빠라요','빠르아요','빨러요'],
        keys:['빨라요','빠라요','빠르아요','빨러요'],
        why:'빠르다 doubles the ㄹ to become **빨라요**.' },

      { t:'pair', q:'Match each dictionary verb with its 해요 form.',
        pairs:[['모르다','몰라요'],['빠르다','빨라요'],['다르다','달라요'],['고르다','골라요']] },

      { t:'translate', q:'Translate into Korean: **“I don’t know that person well.”**  (that person = 그 사람, well = 잘, to not know = 모르다)',
        answers:['그 사람 잘 몰라요','그 사람을 잘 몰라요','저는 그 사람 잘 몰라요','저는 그 사람을 잘 몰라요','그 사람 잘 몰라요.','그 사람을 잘 몰라요.'],
        hint:'Use 그 사람(을), the adverb 잘, and conjugate 모르다 into 몰라요.',
        why:'그 사람(을) 잘 몰라요. 모르다 conjugates into 몰라요.' },

      { t:'speak', say:'저는 한국어를 잘 몰라요.', rom:'jeo-neun han-gug-eo-reul jal mol-la-yo',
        q:'Say it out loud: “I don’t know Korean well.”' },
    ],
  },

  ],
},

];
