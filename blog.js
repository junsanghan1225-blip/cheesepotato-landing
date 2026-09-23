/* ══════════════════════════════════════════════════════════════
   블로그 — 글 자료. 여기가 원본이고, blog/ 밑의 쪽은 생성물이다.
   ──────────────────────────────────────────────────────────────
   tools/build-pages.mjs 가 이 배열을 읽어 blog/ 밑에 정적 쪽을 굽는다
   (sentence/·course/·lesson/ 과 같은 방식 — 해시 라우팅 화면은 크롤러가
   못 읽으니, 글마다 진짜 주소를 가진 쪽을 따로 낸다).

   글 하나를 더하려면 아래 모양대로 객체를 이 배열에 넣고
     node tools/build-pages.mjs && node tools/stamp.mjs
   를 돌리면 blog/<id>.html 과 blog/index.html, blog/rss.xml 이 다시 구워진다.

   { id:      'how-to-start-korean'   URL 에 쓰일 짧은 영문 slug.
              소문자·숫자·하이픈만. **한 번 올리면 바꾸지 않는다** —
              바꾸면 그 글을 즐겨찾기한 사람과 검색 결과가 다 끊긴다.
     title:   '글 제목',
     date:    '2026-01-15'   처음 올린 날. 나중에 고쳐도 이 값은 그대로
              둔다 — 바꾸면 검색 결과의 날짜가 거짓이 된다.
     updated: '2026-02-01'   내용을 고친 날. 처음 올릴 땐 date 와 같게.
     tags:    ['문법', '초급']   갈래. 「같은 갈래의 글」을 고르는 기준이면서,
              누르면 /blog/tag/<slug>.html 로 그 갈래 글만 걸러 볼 수 있는
              이름표이기도 하다. 새 갈래를 쓰면 build-pages.mjs 의 TAG_SLUGS
              에도 주소 조각을 하나 추가해야 한다 — 안 그러면 굽다가 멈춘다.
              쓰던 말을 그대로 쓴다 — 「문법」과 「문법정리」로 갈리면 두
              글이 서로를 못 찾는다.
     excerpt: '목록·검색 결과·SNS 미리보기·RSS 에 쓰일 두세 줄 요약',
     body:    '<p>...</p>'   문단마다 이미 <p> 를 두른 HTML 문자열.
              build-pages.mjs 의 esc() 를 거치지 않고 그대로 박히므로
              직접 쓸 때 태그를 안 닫으면 쪽 전체가 깨진다 — 조심할 것 }

   순서 = 화면에 뜨는 순서(최신이 위로 오게 앞에 놓는다). 앞뒤 글 이동도
   이 순서를 따른다 — 「이전 글」이 한 칸 뒤, 「다음 글」이 한 칸 앞이다.

   글 안에서 사이트 안쪽을 걸 때는 **실재하는 주소만** 건다. /sentence/26-2.html
   처럼 build-pages.mjs 가 굽는 쪽은 괜찮고, 없는 쪽을 적으면 404 가 는다. */
export const BLOG_POSTS = [
  {
    id: 'topik-writing-54-structure-english',
    lang: 'en',
    alt: 'topik-writing-54-structure',
    title: 'TOPIK writing Q54: how to structure the essay',
    date: '2026-09-23',
    updated: '2026-09-23',
    tags: ['English', 'TOPIK'],
    excerpt: 'Question 54 awards up to 50 points, yet many test takers lose marks despite flawless grammar because their essay structure is disorganized. Here is the standard outline that scorers expect.',
    blocks: [
      { t: 'p', text: 'Question 54 of the TOPIK II exam asks you to write an argumentative essay of 600 to 700 characters. Worth 50 points, it frequently determines whether a test taker achieves Level 4 or Level 6. Scorers routinely penalise essays that have zero spelling mistakes simply because the underlying paragraph structure lacks logical coherence.' },
      { t: 'h', text: 'Every prompt contains two or three sub-questions' },
      { t: 'p', text: 'Under the main topic description, the test sheet lists two or three bullet points. Treat these bullet points as your paragraph blueprint. Dedicating exactly one body paragraph to each bullet point guarantees you answer every required grading criterion.' },
      { t: 'h', text: 'Introduction: Do not copy the prompt' },
      { t: 'p', text: 'The single most common deduction in the introduction is copying sentences directly from the question sheet. Scorers disregard copied lines when calculating total character count. Open your essay by framing why the issue matters in your own words in two or three sentences.' },
      { t: 'note', title: 'Common mistake', text: 'Paraphrasing only one particle from the prompt still counts as plagiarising the question prompt. Always introduce the topic using fresh vocabulary.' },
      { t: 'h', text: 'Body paragraphs: One claim plus evidence' },
      { t: 'p', text: 'Never list bare opinions without justification. Structure each body paragraph with a clear opening claim followed by concrete reasoning or real-world examples.' },
      { t: 'ex', ko: '현대 사회에서 평생 교육은 필수적이다. 기술이 빠르게 변화하여 새로운 지식을 습득해야 하기 때문이다.', en: 'Lifelong education is essential in modern society, because rapid technological change requires acquiring new knowledge.' },
      { t: 'gram', id: '38-4', note: 'State public goals and personal purposes in formal essay arguments' },
      { t: 'p', text: 'Connect your ideas using written transition words like 「이에 따라」 (accordingly), 「반면에」 (on the other hand), and 「따라서」 (therefore), rather than conversational fillers like 그리고 or 그래서.' },
      { t: 'gram', id: '41-1', note: 'Use relative clauses to construct sophisticated formal noun phrases' },
      { t: 'h', text: 'Conclusion: Synthesise without introducing new arguments' },
      { t: 'p', text: 'Your conclusion should briefly summarise your core arguments and offer a forward-looking recommendation or social call to action. Never introduce an entirely new argument in the final sentence.' },
      { t: 'h', text: 'Use the plain written style (-는다 / -다)' },
      { t: 'p', text: 'Never write Question 54 in conversational polite styles (해요체 or 합니다체). Academic essays must be written in the plain narrative style (해라체), ending in 「-는다/다」, 「-(으)ㄹ 필요가 있다」, or 「-는 것이 바람직하다」.' },
      { t: 'link', href: '/topik-writing/', title: 'TOPIK Writing Practice Sets', note: 'Review full sample essays for Question 53 and Question 54 with scoring breakdowns' },
    ],
  },
  {
    id: 'seyo-family-english',
    lang: 'en',
    alt: 'seyo-family',
    title: '-세요 and its family: requests, prohibitions, and permissions',
    date: '2026-09-23',
    updated: '2026-09-23',
    tags: ['English', 'Grammar'],
    excerpt: 'Almost every Korean learner memorises -세요 first, but asking, forbidding, permitting, and restricting each use distinct grammar patterns. Here is the whole family laid out side by side.',
    blocks: [
      { t: 'p', text: 'Virtually every beginner learns 「-세요」 during their first Korean lesson. But in everyday interactions, knowing how to ask politely is only one piece of the puzzle. You also need to know how to decline an action, ask for permission, and warn someone about rules.' },
      { t: 'p', text: 'Because these patterns share a courteous tone and often occur together in cafes and airports, learners easily confuse their functions. Here is the entire family compared side by side.' },
      { t: 'h', text: '1. Polite requests: -(으)세요' },
      { t: 'p', text: 'Use 「-(으)세요」 to politely ask someone to perform an action or give instructions. Because it incorporates the subject honorific 「-(으)시-」, it is perfectly safe to use with elders, teachers, and store clerks.' },
      { t: 'ex', ko: '여기에 이름을 써 주세요.', en: 'Please write your name here.' },
      { t: 'p', text: 'Note the attachment rule: verb stems ending in a vowel take 「-세요」 (가다 → 가세요), while stems ending in a consonant take 「-으세요」 (앉다 → 앉으세요). Verbs with a ㄹ final consonant drop the ㄹ entirely before attaching 세요 (만들다 → 만드세요, 살다 → 사세요).' },
      { t: 'gram', id: '30-1', note: 'Learn how polite imperative endings attach to consonant and vowel stems' },
      { t: 'h', text: 'The two faces of -(으)세요: request vs honorific statement' },
      { t: 'p', text: 'A frequent point of confusion for beginners is that 「-(으)세요」 serves two distinct grammatical roles depending on intonation and context.' },
      { t: 'p', text: 'First, it acts as a polite imperative or request: 「조용히 하세요」 (Please be quiet). Second, when used with elders or respected subjects, it functions as a regular present-tense honorific statement or question: 「선생님, 지금 어디 가세요?」 means "Teacher, where are you going?", not "Teacher, please go somewhere!".' },
      { t: 'h', text: '2. Polite negative requests: -지 마세요' },
      { t: 'p', text: 'English speakers often try to make negative requests by adding 「안」 in front of -세요 (like 안 가세요, which means "Are you not leaving?"). To tell someone politely not to do something, use 「-지 마세요」.' },
      { t: 'ex', ko: '여기에 주차하지 마세요.', en: 'Please do not park here.' },
      { t: 'ex', ko: '너무 걱정하지 마세요.', en: 'Please do not worry too much.' },
      { t: 'gram', id: '30-2', note: 'Notice how negative requests attach uniformly to verb stems without sound changes' },
      { t: 'h', text: '3. Granting and asking permission: -아/어도 되다' },
      { t: 'p', text: 'While -세요 directs an action, 「-아/어도 되다」 removes an obstacle. It tells the listener that doing something is completely fine.' },
      { t: 'quote', lines: ['여기 앉으세요. (Request: Please take a seat here.)', '여기 앉아도 돼요. (Permission: You may sit here if you like.)', '사진을 찍어도 돼요? (Question: May I take photos?)'] },
      { t: 'p', text: 'In public facilities, museums, and cafes, asking 「-아/어도 돼요?」 is the standard way to verify whether an action is permitted before proceeding.' },
      { t: 'gram', id: '34-1', note: 'Examine how permission questions work in restaurants and museums' },
      { t: 'h', text: '4. Stating rules and boundaries: -(으)면 안 되다' },
      { t: 'p', text: 'When an action violates rules, safety guidelines, or social etiquette, use 「-(으)면 안 되다」. While -지 마세요 is a polite personal plea, -(으)면 안 되다 states that an action is objectively forbidden.' },
      { t: 'ex', ko: '여기서 담배를 피우면 안 돼요.', en: 'You must not smoke here.' },
      { t: 'ex', ko: '시험 중에 휴대전화를 사용하면 안 됩니다.', en: 'You must not use mobile phones during the exam.' },
      { t: 'gram', id: '34-2', note: 'Study how strict prohibitions and societal rules are expressed' },
      { t: 'h', text: 'Polite requests for help: -아/어 주세요 vs -(으)세요' },
      { t: 'p', text: 'Compare 「이 책을 읽으세요」 and 「이 책을 읽어 주세요」. The first is an instruction: "Please read this book (for your own benefit)". The second is a personal favor: "Please read this book (for me / help me out)".' },
      { t: 'p', text: 'Whenever you ask someone to do something that benefits you personally — such as fetching water, translating a phrase, or opening a door — pair the verb with 「-아/어 주다」 before attaching -세요. In restaurants, say 「물 좀 주세요」 (Please give me water) or 「메뉴판 좀 보여 주세요」 (Please show me the menu).' },
      { t: 'h', text: 'Formal announcements: -(으)십시오 vs -(으)세요' },
      { t: 'p', text: 'On public transit announcements, in written safety manuals, and across news broadcasts, you will rarely hear 「-(으)세요」. Instead, official Korean relies on 「-(으)십시오」.' },
      { t: 'quote', lines: ['출입문이 닫힙니다. 안전선 밖으로 물러서 주십시오. (Official subway announcement: Doors closing. Please step behind the safety line.)', '비상구 위치를 확인하십시오. (Flight safety manual: Please check the emergency exit location.)'] },
      { t: 'p', text: 'Use 「-(으)세요」 in spoken conversations with real human beings in front of you. Reserve 「-(으)십시오」 for public addresses, formal speeches, and printed notices.' },
      { t: 'h', text: 'Real-world dialogues in cafes and offices' },
      { t: 'p', text: 'Notice how these four grammar patterns interact dynamically during daily routines:' },
      { t: 'dlg', lines: ['A: 저기요, 여기 노트북 충전기 꽂아도 돼요?', 'B: 네, 저쪽 벽에 있는 콘센트 쓰세요.'] },
      { t: 'p', text: 'The customer asks for permission using 「꽂아도 돼요?」, and the barista grants it while offering a polite direction with 「쓰세요」.' },
      { t: 'dlg', lines: ['A: 회의실 불을 끄고 나갈까요?', 'B: 아직 다른 팀이 회의 중이니까 불 끄지 마세요.'] },
      { t: 'p', text: 'Colleague B prevents an inconvenient action with the gentle negative request 「불 끄지 마세요」.' },
      { t: 'h', text: 'Frequently asked questions' },
      { t: 'p', text: 'Can I use -세요 when asking my boss or professor for a favor?' },
      { t: 'p', text: 'While -세요 is polite, giving a bare imperative to someone of much higher status can sound slightly direct. When asking a superior or professor for assistance, Korean speakers soften the request by adding conditional or question endings: 「확인해 주실 수 있으세요?」 (Could you possibly check this?) or 「검토해 주시겠어요?」 (Would you mind reviewing this?).' },
      { t: 'p', text: 'What is the difference between 하지 마세요 and 하면 안 돼요?' },
      { t: 'p', text: '「하지 마세요」 is an interpersonal request asking someone to refrain from an action ("Please do not do that"). 「하면 안 돼요」 is an objective rule stating that the action is impermissible under company policy, law, or etiquette ("You cannot do that / it is against regulations").' },
      { t: 'p', text: 'Why do some verbs change completely with -세요?' },
      { t: 'p', text: 'Certain common verbs have specialized honorific replacement stems. For example, instead of 먹으세요, native speakers use 「드세요」 (or 「잡수세요」). Instead of 자세요, use 「주무세요」. Instead of 있으세요 when asking someone to stay, use 「계세요」 (as in 안녕히 계세요).' },
      { t: 'h', text: 'Quick self-check quiz' },
      { t: 'p', text: 'Select the most appropriate pattern for each real-life scenario:' },
      { t: 'list', items: ['1. 도서관에서 친구에게 조용히 하라고 부탁할 때: (조용히 하세요 / 조용히 하면 안 돼요)', '2. 미술관에서 플래시 촬영이 금지되어 있음을 안내할 때: (촬영하지 마세요 / 촬영하면 안 됩니다)', '3. 식당에서 빈자리에 앉아도 되는지 물어볼 때: (앉으세요? / 앉아도 돼요?)', '4. 추운 날씨에 감기 걸리지 말라고 당부할 때: (감기 걸리지 마세요 / 감기 걸리면 안 돼요)'], ordered: true },
      { t: 'note', title: 'Quiz answers and explanations', text: '1. 조용히 하세요 — direct polite request to a peer. 2. 촬영하면 안 됩니다 — official rule/prohibition in a museum. 3. 앉아도 돼요? — checking permission before sitting. 4. 감기 걸리지 마세요 — caring personal wish and request.' },
      { t: 'p', text: 'Next time you are at a cafe in Seoul: ask for water with 「-아/어 주세요」, check if you can plug in your laptop with 「-아/어도 돼요?」, and look out for 「-지 마세요」 on signs.' },
      { t: 'link', href: '/course/first-words.html', title: 'First Words Course', note: 'Practice practical polite requests with native audio dialogues' },
      { t: 'link', href: '/compare/', title: 'Grammar Comparison Guides', note: 'Compare closely related Korean honorific and sentence ending patterns' },
    ],
  },
  {
    id: 'an-vs-mot-english',
    lang: 'en',
    alt: 'an-vs-mot',
    title: '안 vs 못: two ways to say "not" in Korean',
    date: '2026-09-23',
    updated: '2026-09-23',
    tags: ['English', 'Grammar'],
    excerpt: 'Translation apps render both as "I do not", but confusing 안 and 못 can make you sound accidentally cold or rude. Here is the distinction between choice and ability.',
    blocks: [
      { t: 'p', text: 'Compare 「저는 매운 음식을 안 먹어요」 and 「저는 매운 음식을 못 먹어요」. English translation tools often render both sentences as "I do not eat spicy food". Yet to a native Korean speaker, they convey fundamentally different attitudes.' },
      { t: 'p', text: 'In Korean, negation divides cleanly along one question: is this your deliberate choice, or an external inability?' },
      { t: 'h', text: '안: Negation of will and choice' },
      { t: 'p', text: '「안」 expresses that you are capable of doing something, but actively choose not to. It indicates intention, decision, or personal preference.' },
      { t: 'ex', ko: '저는 커피를 안 마셔요.', en: 'I do not drink coffee. (by personal choice)' },
      { t: 'ex', ko: '주말에는 일을 안 해요.', en: 'I do not work on weekends. (my decision)' },
      { t: 'gram', id: '25-1', note: 'Examine how short negation and long negation patterns express personal decisions' },
      { t: 'h', text: '못: Negation of ability and circumstance' },
      { t: 'p', text: '「못」 indicates that regardless of your desire, external circumstances, physical limitations, or lack of skill prevent you from doing it.' },
      { t: 'ex', ko: '감기에 걸려서 학교에 못 갔어요.', en: 'I caught a cold, so I could not go to school.' },
      { t: 'ex', ko: '한국어를 아직 잘 못해요.', en: 'I cannot speak Korean well yet.' },
      { t: 'gram', id: '25-2', note: 'Learn how inability and situational obstacles differ from voluntary choices' },
      { t: 'h', text: 'Why confusing them causes social awkwardness' },
      { t: 'p', text: 'Suppose a coworker invites you to dinner tonight. If you reply 「오늘 안 가요」, you are saying "I choose not to go" — which sounds blunt, almost dismissive. If you say 「오늘 선약이 있어서 못 가요」 (I have a prior engagement, so I cannot go), you express that you would attend if you were free.' },
      { t: 'dlg', lines: ['A: 오늘 저녁에 같이 밥 먹을래요?', 'B: 미안해요, 약속이 있어서 오늘은 못 가요.'] },
      { t: 'h', text: 'Adjectives take 안, not 못' },
      { t: 'p', text: 'Because adjectives describe states rather than intentional actions, adjectives almost never take 「못」.' },
      { t: 'quote', lines: ['날씨가 안 좋아요. (Correct: The weather is not good.)', '날씨가 못 좋아요. (Incorrect — weather has no ability or skill.)', '방이 안 넓어요. (Correct: The room is not spacious.)'] },
      { t: 'p', text: 'Adjectives describe inherent qualities, measurements, emotions, or environmental conditions. Since a room cannot exert willpower or possess physical capability, saying 「방이 못 넓어요」 makes no sense in Korean. When negating descriptive verbs, always stick to 「안」 or the long form 「-지 않다」.' },
      { t: 'h', text: 'Word order trap: noun + 하다 compound verbs' },
      { t: 'p', text: 'A frequent error among beginner learners involves placing the negative adverb before compound verbs that end in 「하다」. Verbs like 「공부하다」 (to study), 「운동하다」 (to exercise), and 「요리하다」 (to cook) consist of an independent Sino-Korean noun combined with the verb 「하다」.' },
      { t: 'p', text: 'In short negation with 「안」 and 「못」, the adverb must slip inside the compound, directly before 「하다」.' },
      { t: 'list', items: ['공부 안 해요 (Correct: I do not study) vs 안 공부해요 (Incorrect)', '운동 못해요 (Correct: I cannot exercise) vs 못 운동해요 (Incorrect)', '요리 안 해요 (Correct: I do not cook) vs 안 요리해요 (Incorrect)', '수영 못해요 (Correct: I cannot swim) vs 못 수영해요 (Incorrect)'], ordered: false },
      { t: 'p', text: 'Pure native verbs ending in 하다, such as 「좋아하다」 (to like) and 「싫어하다」 (to dislike), are single unbreakable words. For those verbs, place the adverb right at the front: 「안 좋아해요」 (I do not like it).' },
      { t: 'h', text: 'Short negation vs long negation: 안 vs -지 않다 and 못 vs -지 못하다' },
      { t: 'p', text: 'Korean offers two structural styles of negation: short negation placed directly in front of the verb, and long negation attached as an ending to the verb stem.' },
      { t: 'p', text: 'Short negation with 「안」 and 「못」 belongs primarily to spontaneous spoken conversation, text messages, and casual daily chats. Long negation with 「-지 않다」 and 「-지 못하다」 sounds more deliberate, formal, and objective.' },
      { t: 'ex', ko: '회의에 참석하지 못했습니다.', en: 'I was unable to attend the meeting. (formal written register)' },
      { t: 'ex', ko: '비가 오지 않습니다.', en: 'It is not raining. (official announcement or formal statement)' },
      { t: 'p', text: 'In formal presentations, business reports, news broadcasts, and TOPIK essays, long negation is strongly preferred. In everyday exchanges with friends, shopkeepers, and coworkers, short negation is the natural default.' },
      { t: 'h', text: 'The tricky spelling: 못하다 vs 못 하다' },
      { t: 'p', text: 'Korean orthography distinguishes between the single compound verb 「못하다」 (written without a space) and the adverb phrase 「못 하다」 (written with a space).' },
      { t: 'p', text: 'When you write 「못하다」 as one word, it means to perform poorly or lack proficiency: 「노래를 못해요」 means "I am bad at singing", and 「수학을 못해요」 means "I am poor at maths". When you write 「못 하다」 with a space, it indicates that a circumstance physically prevents you from performing the act: 「시간이 없어서 숙제를 못 했어요」 means "Because I had no time, I could not do the homework".' },
      { t: 'h', text: 'Real-life dialogues: dietary choices and polite refusals' },
      { t: 'p', text: 'Notice how native speakers shift between 「안」 and 「못」 depending on whether they are expressing an ethical preference, a biological limitation, or a polite scheduling conflict.' },
      { t: 'dlg', lines: ['A: 돼지고기 드실 수 있어요?', 'B: 종교적인 이유로 돼지고기는 안 먹어요.'] },
      { t: 'p', text: 'In the exchange above, Person B chooses 「안 먹어요」 because following a religious dietary rule represents a conscious commitment rather than a physical inability. Compare that with an allergy scenario below:' },
      { t: 'dlg', lines: ['A: 땅콩 아이스크림 주문할까요?', 'B: 제가 견과류 알레르기가 있어서 못 먹어요.'] },
      { t: 'p', text: 'Because food allergies cause severe medical reactions, Person B uses 「못 먹어요」. Saying 「안 먹어요」 in an allergy context would fail to communicate the biological danger.' },
      { t: 'h', text: 'Frequently asked questions' },
      { t: 'p', text: 'Is 못 more polite than 안 when turning down an invitation?' },
      { t: 'p', text: 'Yes, in social contexts turning down an invitation with 「못 가요」 sounds significantly softer than 「안 가요」. Using 「안 가요」 implies that you simply do not want to see the person or attend the event. Using 「못 가요」 signals that you would love to join if circumstances permitted.' },
      { t: 'p', text: 'Can I use 못 with verbs of knowing like 알다?' },
      { t: 'p', text: 'No. The verb 「알다」 (to know) does not take 「못」 or 「안」 in modern standard Korean. Instead, Korean uses the dedicated antonym verb 「모르다」 (to not know). You never say 「못 알아요」 or 「안 알아요」; you simply say 「몰라요」.' },
      { t: 'p', text: 'What about 있다 and 없다?' },
      { t: 'p', text: 'Similarly, 「있다」 (to exist, to have) has its own lexical opposite 「없다」 (to not exist, to lack). Native speakers never say 「안 있어요」 or 「못 있어요」 to indicate absence; they say 「없어요」.' },
      { t: 'h', text: 'Quick self-check quiz' },
      { t: 'p', text: 'Test your understanding by choosing between 안 and 못 for each sentence below:' },
      { t: 'list', items: ['1. 다리를 다쳐서 축구를 (안 / 못) 해요.', '2. 저는 건강을 위해서 탄산음료를 (안 / 못) 마셔요.', '3. 이 치마는 허리가 너무 좁아서 (안 / 못) 맞아요.', '4. 오늘 너무 바빠서 점심을 (안 / 못) 먹었어요.'], ordered: true },
      { t: 'note', title: 'Quiz answers and explanations', text: '1. 못 — an injured leg is a physical obstacle. 2. 안 — giving up soda for health is a conscious personal lifestyle choice. 3. 안 — 맞다 in the sense of fitting is descriptive, so it takes 안. 4. 못 — severe busyness prevented eating lunch despite hunger.' },
      { t: 'p', text: 'Remember: use 「안」 for deliberate decisions and descriptive adjectives. Reserve 「못」 when physical limits, skill, or busy schedules hold you back.' },
      { t: 'link', href: '/course/grammar-core.html', title: 'Building Sentences Course', note: 'Practice negative sentences with audio exercises and interactive quizzes' },
      { t: 'link', href: '/compare/', title: 'Grammar Comparisons', note: 'Explore side-by-side breakdowns of confusing Korean grammar pairs' },
    ],
  },
  {
    id: 'why-in-korean-aseo-nikka-english',
    lang: 'en',
    alt: 'why-in-korean-aseo-nikka',
    title: 'Saying "because" in Korean: -아서 vs -니까',
    date: '2026-09-23',
    updated: '2026-09-23',
    tags: ['English', 'Grammar'],
    excerpt: 'Both translate as "because" in English, yet swapping them creates awkward sentences. Here are three practical tests to choose the right cause connector every time.',
    blocks: [
      { t: 'p', text: 'Compare two common phrases: 「늦어서 죄송합니다」 and 「늦었으니까 죄송합니다」. The first is textbook natural Korean. The second sounds defensive, almost like arguing. Yet English dictionaries translate both endings simply as "because".' },
      { t: 'p', text: 'Learners struggle with Korean reason connectors not because the concepts differ, but because each grammar pattern imposes strict constraints on what type of clause can follow.' },
      { t: 'h', text: 'Rule 1: Use -(으)니까 with commands and suggestions' },
      { t: 'p', text: 'This single boundary resolves 80 percent of learner mistakes. Whenever the second half of your sentence is an imperative, suggestion, or request ending in 「-세요」, 「-(으)ㅂ시다」, or 「-(으)ㄹ까요?」, you cannot use 「-아/어서」.' },
      { t: 'quote', lines: ['비가 오니까 우산을 가져가세요. (Correct: It is raining, so take an umbrella.)', '비가 와서 우산을 가져가세요. (Incorrect — native speakers never say this.)'] },
      { t: 'p', text: 'Notice this on subway announcements and road signs: 「위험하니까 조심하세요」 (It is dangerous, so please be careful). In customer service and safety instructions, 「-(으)니까」 is standard.' },
      { t: 'gram', id: '32-2', note: 'Notice how commands and proposals naturally pair with this ending' },
      { t: 'h', text: 'Rule 2: Use -아/어서 for greetings, apologies, and thanks' },
      { t: 'p', text: 'Social formulas require 「-아/어서」. Using 「-(으)니까」 when apologising or thanking someone makes it sound as though you are presenting an intellectual argument rather than expressing sincere emotion.' },
      { t: 'ex', ko: '늦어서 죄송합니다.', en: 'Sorry for being late.' },
      { t: 'ex', ko: '도와주셔서 감사합니다.', en: 'Thank you for helping me.' },
      { t: 'ex', ko: '만나서 반갑습니다.', en: 'Nice to meet you.' },
      { t: 'p', text: 'Saying 「도와줬으니까 감사합니다」 sounds bizarrely transactional. Memorise these everyday courtesy phrases as single chunks.' },
      { t: 'gram', id: '32-1', note: 'Review standard cause-and-effect clauses used in daily conversation' },
      { t: 'h', text: 'Rule 3: Past tense marking differs' },
      { t: 'p', text: 'Never attach past tense markers 「-았/었-」 directly inside 「-아/어서」. The tense is marked only on the final verb at the end of the sentence.' },
      { t: 'quote', lines: ['바빠서 못 갔어요. (Correct: I was busy, so I could not go.)', '바빴어서 못 갔어요. (Incorrect — double past tense is redundant.)', '어제 바빴으니까 오늘은 쉴게요. (Correct — -(으)니까 accepts past tense freely.)'] },
      { t: 'p', text: 'Because 「-아/어서」 establishes a continuous sequential relationship where the first event naturally flows into the second, Korean grammar requires the entire sentence to share the tense of the concluding verb. Marking the past inside 「-아/어서」 is grammatically invalid on formal proficiency tests like TOPIK.' },
      { t: 'h', text: 'Objective cause vs subjective reasoning' },
      { t: 'p', text: 'Beyond grammar rules, a subtle difference in attitude separates these two endings. 「-아/어서」 presents an objective, widely accepted natural consequence. Anyone looking at the situation would agree with the link.' },
      { t: 'ex', ko: '배가 너무 아파서 병원에 다녀왔어요.', en: 'My stomach hurt so much that I went to the hospital.' },
      { t: 'p', text: 'By contrast, 「-(으)니까」 highlights the speaker\'s personal judgment, observation, or deduction. The reason serves as justification for what the speaker believes or proposes.' },
      { t: 'ex', ko: '내가 직접 먹어 보니까 아주 맛있던데요.', en: 'I tasted it myself, and found it delicious.' },
      { t: 'h', text: 'What about 때문에 and -기 때문에?' },
      { t: 'p', text: '「때문에」 connects directly to nouns (비 때문에), or to verbs using 「-기 때문에」 (춥기 때문에). It provides a neutral, objective explanation and is especially common in formal writing and news broadcasts.' },
      { t: 'ex', ko: '폭설 때문에 비행기가 결항되었습니다.', en: 'Due to heavy snowfall, flights were cancelled.' },
      { t: 'ex', ko: '물가가 올랐기 때문에 소비가 줄어들었습니다.', en: 'Because prices rose, consumer spending declined.' },
      { t: 'gram', id: '32-3', note: 'Learn formal noun and verb combinations used in essays and news' },
      { t: 'h', text: 'The busy excuse trap: -느라고 vs -아/어서' },
      { t: 'p', text: 'Intermediate learners often encounter another reason connector: 「-느라고」. While 「-아/어서」 simply links a cause to an effect, 「-느라고」 specifies that focusing your energy on one active task directly caused a negative outcome or prevented you from doing something else.' },
      { t: 'ex', ko: '시험공부를 하느라고 어젯밤에 잠을 못 잤어요.', en: 'Because I was studying for the exam, I could not sleep last night.' },
      { t: 'p', text: 'Notice two strict restrictions: the subject of both clauses must be the identical person, and the second clause must describe an undesirable consequence or sacrifice. You cannot use 「-느라고」 with adjectives or positive results. For simple neutral facts, stick with 「-아/어서」.' },
      { t: 'h', text: 'Side-by-side comparison summary' },
      { t: 'list', items: ['-아/어서: Objective cause, apologies and thanks, strictly NO past tense in clause 1, NO imperatives or suggestions in clause 2', '-(으)니까: Subjective reasoning and discovery, allows past tense (-았/었으니까), MANDATORY for imperatives (-세요) and suggestions (-ㅂ시다)', '-기 때문에: Formal and written cause, objective facts, pairs with nouns directly (N 때문에), common in reports and essays'], ordered: false },
      { t: 'h', text: 'Real-world dialogues: choosing the right connector' },
      { t: 'p', text: 'Listen to how native speakers switch between connectors in common daily interactions:' },
      { t: 'dlg', lines: ['A: 이번 주말에 등산하러 갈까요?', 'B: 날씨가 추우니까 따뜻하게 입고 오세요.'] },
      { t: 'p', text: 'Because Person B provides a piece of advice ending in the imperative 「입고 오세요」, only 「추우니까」 fits. Using 「추워서」 here would sound unnatural.' },
      { t: 'dlg', lines: ['A: 민수 씨, 어제 동창 모임에 왜 안 왔어요?', 'B: 갑자기 회사에 급한 일이 생겨서 못 갔어요.'] },
      { t: 'p', text: 'In reporting an objective sequence of events explaining why one missed a gathering, 「일이 생겨서」 provides the courteous, natural answer.' },
      { t: 'h', text: 'Frequently asked questions' },
      { t: 'p', text: 'Can I use -아/어서 when asking someone out for lunch?' },
      { t: 'p', text: 'No. If you want to invite someone by saying "I am hungry, so shall we eat?", you must use 「-(으)니까」: 「배고프니까 같이 밥 먹을까요?」. Because the sentence ends with a suggestion 「-(으)ㄹ까요?」, 「배고파서 같이 밥 먹을까요?」 is ungrammatical.' },
      { t: 'p', text: 'Why do I hear Koreans say 바빴어서 on TV dramas?' },
      { t: 'p', text: 'In colloquial casual speech, some native speakers slip into double past tense marking like 「피곤했어서」 or 「바빴어서」 to emphasize that the state occurred in the remote past. However, Korean language institutes and TOPIK examiners strictly classify this as colloquial error. In formal writing, interviews, and language exams, stick firmly to 「피곤해서」.' },
      { t: 'p', text: 'How do I choose between (이)라서 and (이)기 때문에 for nouns?' },
      { t: 'p', text: 'With nouns, 「(이)라서」 represents the spoken colloquial form of -아/어서: 「주말이라서 길이 막혀요」 (It is the weekend, so roads are congested). By contrast, 「명사 + 때문에」 or 「명사 + (이)기 때문에」 represents formal and written style: 「주말 때문에」 or 「주말이기 때문에」. Use 「(이)라서」 in daily chat and 「때문에」 in formal reports.' },
      { t: 'h', text: 'Quick self-check quiz' },
      { t: 'p', text: 'Choose the correct ending for each sentence below:' },
      { t: 'list', items: ['1. 길이 많이 (막혀서 / 막히니까) 지하철을 탑시다.', '2. 초대해 주 (셔서 / 시니까) 진심으로 감사드립니다.', '3. 어제 비가 많이 (와서 / 왔어서) 야구 경기가 취소되었어요.', '4. 창밖을 (보니까 / 봐서) 눈이 하얗게 쌓여 있었어요.'], ordered: true },
      { t: 'note', title: 'Quiz answers and explanations', text: '1. 막히니까 — ending in proposal 탑시다 requires -(으)니까. 2. 셔서 — expressions of gratitude require -아/어서. 3. 와서 — standard past causal clause without double past marking. 4. 보니까 — discovering a situation upon looking calls for -(으)니까.' },
      { t: 'link', href: '/course/grammar-core.html', title: 'Building Sentences Course', note: 'Study fundamental verb endings and connecting clauses with audio drills' },
      { t: 'link', href: '/compare/', title: 'Grammar Comparison Guides', note: 'Explore 73 side-by-side comparisons of easily confused Korean grammar points' },
    ],
  },
  {
    id: 'when-to-use-banmal-english',
    lang: 'en',
    alt: 'when-to-use-banmal',
    title: 'When to use banmal: the polite vs casual dilemma',
    date: '2026-09-23',
    updated: '2026-09-23',
    tags: ['English', 'Grammar'],
    excerpt: 'Standard textbooks rarely explain when it is actually safe to drop honorifics. Here is how casual speech differs from respect, and how to navigate Korean social levels.',
    blocks: [
      { t: 'p', text: 'Korean textbooks usually start with polite 「-아요/어요」 and stay there indefinitely. When learners watch Korean dramas or talk with friends, they discover that nobody speaks exclusively in standard polite forms. Deciding when to switch to casual speech (반말) causes endless anxiety for beginners.' },
      { t: 'h', text: 'The safe baseline: 해요체 works almost everywhere' },
      { t: 'p', text: 'As a beginner or intermediate learner, you can use 「해요체」 (-아요/어요) in nearly any daily situation. It is neither stiffly formal nor rude. Native speakers never take offence at a foreign learner speaking standard polite Korean.' },
      { t: 'p', text: 'There are four primary speech levels you will encounter in real life.' },
      { t: 'list', items: ['합쇼체 (-습니다 / -습니까): Formal polite style used in presentations, news broadcasts, business meetings, and customer service.', '해요체 (-아요 / -어요): Informal polite style used for the vast majority of everyday conversations with colleagues and acquaintances.', '해체 (-아 / -어): Casual speech (반말) reserved for close friends, younger siblings, and children.', '해라체 (-(느)ㄴ다): Plain narrative style. This is primarily a written style for newspapers, books, and essays, not spoken rudeness.'], ordered: false },
      { t: 'h', text: 'Speech level and honorifics are two different axes' },
      { t: 'p', text: 'The biggest point of confusion for English speakers is conflating speech level with subject honorifics. Whom you are addressing (the listener) and whom you are talking about (the grammatical subject) are separate choices.' },
      { t: 'quote', lines: ['동생이 집에 가요. (Polite style to listener, younger subject)', '할머니께서 집에 가세요. (Polite style to listener, honored subject with -(으)시-)'] },
      { t: 'p', text: 'In both sentences, the speaker speaks politely to the listener using 「-요」. The honorific infix 「-(으)시-」 is added only because grandmother is the respected subject. You can even use casual speech with a friend while still respecting your grandmother: 「할머니 주무셔」.' },
      { t: 'gram', id: '28-1', note: 'Use this marker to honor the person performing an action regardless of speech style' },
      { t: 'h', text: 'Special honorific vocabulary' },
      { t: 'p', text: 'Certain frequent Korean verbs change completely when referring to an elder or respected subject.' },
      { t: 'list', items: ['먹다 (eat) becomes 「드시다」 or 「잡수시다」', '자다 (sleep) becomes 「주무시다」', '있다 (stay/exist) becomes 「계시다」', '말하다 (speak) becomes 「말씀하시다」', '주다 (give) becomes 「드리다」 when offering something to an elder'], ordered: false },
      { t: 'gram', id: '28-2', note: 'Review verbs that replace everyday roots entirely in polite contexts' },
      { t: 'h', text: 'When is it actually safe to drop honorifics?' },
      { t: 'p', text: 'Do not assume that casual conversation automatically allows banmal. Switching to banmal requires explicit mutual consent, usually initiated by the older person: 「말 편하게 하세요」 (feel free to speak casually).' },
      { t: 'dlg', lines: ['A: 우리 말 편하게 할까요?', 'B: 네, 편하게 말해요.'] },
      { t: 'p', text: 'Remember the golden rule of Korean etiquette: when uncertain, stay polite. Using honorifics by accident merely sounds slightly formal. Dropping honorifics without permission can ruin a relationship.' },
      { t: 'link', href: '/course/grammar-core.html', title: 'Building Sentences Course', note: 'Practice basic honorific verb stems and particle contrasts' },
    ],
  },
  {
    id: 'topik-6-for-free-english',
    lang: 'en',
    alt: 'topik-6-for-free',
    title: 'How to reach TOPIK level 6 for free',
    date: '2026-09-23',
    updated: '2026-09-23',
    tags: ['English', 'TOPIK'],
    excerpt: 'Language academies often charge hundreds of dollars a month for TOPIK prep. Here is a structured roadmap from Hangul to Level 6 using free resources available on this site.',
    blocks: [
      { t: 'p', text: 'Commercial Korean courses often charge hefty monthly subscriptions, and purchasing individual textbooks for every single level quickly adds up. Preparing from complete beginner all the way to TOPIK Level 6 without spending money is entirely possible. This guide is not marketing copy; it details the specific free learning tools available on this platform and how to use them in sequence.' },
      { t: 'h', text: 'Step 1: From Hangul to structured sentences' },
      { t: 'p', text: 'If you cannot read the alphabet yet, begin with the Read Korean course. Hangul was engineered to be learned quickly, and the course walks through vowels, consonants, and syllable construction with native audio.' },
      { t: 'p', text: 'Next, move through introductory courses covering survival greetings, ordering food, asking for directions, and basic sentence mechanics like particles and verb tenses.' },
      { t: 'link', href: '/course/', title: 'Interactive Courses', note: 'Explore 21 structured courses and 82 bite-sized lessons' },
      { t: 'h', text: 'Step 2: Master 290 grammar patterns in context' },
      { t: 'p', text: 'Memorising isolated grammar rules breaks down as you reach intermediate and advanced levels. In real communication, subtle nuances distinguish similar endings.' },
      { t: 'p', text: 'The sentence builder includes 290 essential grammar points across beginner, intermediate, and advanced tiers. Each point includes definitions, natural example sentences, and interactive drills where you write sentences yourself rather than merely skimming.' },
      { t: 'gram', id: '42-3', note: 'Describe how your Korean reading ability gradually improves over time' },
      { t: 'link', href: '/sentence/', title: '290 Korean Grammar Patterns', note: 'Browse points by level with authentic examples and interactive practice' },
      { t: 'h', text: 'Step 3: Train with authentic exam question formats' },
      { t: 'p', text: 'To be completely transparent, the questions on this site are original practice exercises written to match official TOPIK patterns, not leaked past exam papers. Every question comes with line-by-line answer explanations, and essay questions provide model answers with analytical scoring rubrics.' },
      { t: 'list', items: ['TOPIK Reading: Read short announcements, news editorials, and long narrative passages with instant glossary lookup.', 'TOPIK Listening: Listen to realistic dialogues spoken at official test tempo with synchronous scripts.', 'TOPIK Writing: Practice Question 53 graph descriptions and Question 54 argumentative essays.'], ordered: false },
      { t: 'gram', id: '38-2', note: 'Express intention and purpose when training with simulated exam sets' },
      { t: 'link', href: '/topik-writing/', title: 'TOPIK Writing Practice', note: 'Study essay outlines, sample answers, and key scoring criteria' },
      { t: 'h', text: 'Step 4: Consistent spaced repetition' },
      { t: 'p', text: 'Most learners who fall short of Level 6 do not fail because study material is unavailable. They stop studying after two weeks. Steady daily habits matter far more than weekend marathons.' },
      { t: 'gram', id: '41-2', note: 'Turn verbs into nouns to track habits like reading and reviewing daily' },
      { t: 'p', text: 'Build a daily rhythm: solve three reading passages in the morning, review five vocabulary cards during your commute, and draft one short writing outline each evening.' },
    ],
  },
  {
    id: 'which-topik-level-do-you-need-english',
    lang: 'en',
    alt: 'which-topik-level-do-you-need',
    title: 'Which TOPIK level do you actually need?',
    date: '2026-09-23',
    updated: '2026-09-23',
    tags: ['English', 'TOPIK'],
    excerpt: 'You do not register for a specific level. You choose between two exams, and your score determines your level from 1 to 6. Here is how the structure works and where to aim.',
    blocks: [
      { t: 'p', text: 'Setting a goal like "I want to be good at Korean" often leads to burnout because there is no finish line. The Test of Proficiency in Korean (TOPIK) provides clear benchmarks. Even if you never take the test, understanding the level system helps you measure realistic progress.' },
      { t: 'h', text: 'You choose the exam, not the level' },
      { t: 'p', text: 'A common misconception among beginners is that you register for a specific grade, such as Level 3. In reality, there are only two separate exams.' },
      { t: 'list', items: ['TOPIK I: Evaluates beginner ability through 30 listening questions and 40 reading questions. Based on your combined score, you receive either Level 1 or Level 2.', 'TOPIK II: Evaluates intermediate to advanced ability through 50 listening questions, 4 essay/sentence writing questions, and 50 reading questions. Depending on your score, you receive Level 3, 4, 5, or 6.'], ordered: false },
      { t: 'p', text: 'Notice that TOPIK I has no writing section whatsoever. Writing appears only in TOPIK II. Your final score on that day determines the level on your certificate.' },
      { t: 'gram', id: '39-2', note: 'Use this pattern when setting prerequisites for reaching a target score' },
      { t: 'h', text: 'Common benchmarks for real-world goals' },
      { t: 'p', text: 'Requirements vary widely by institution and change over time. Always check the official website of the university or employer you plan to apply to. Here is how levels are commonly used in practice.' },
      { t: 'list', items: ['Undergraduate admissions: Most Korean universities set Level 3 as the minimum requirement, with many programs recommending Level 4.', 'Graduation requirements: Universities often ask international students to advance one level above their entry score before graduating.', 'Graduate school: Level 4 or 5 is standard, depending on the academic field.', 'Employment: Companies hiring for roles requiring Korean communication typically look for Level 4 or higher.', 'Visa and immigration: Points criteria frequently adjust. Check official immigration announcements directly rather than relying on third-party blogs.'], ordered: false },
      { t: 'gram', id: '38-4', note: 'Express the purpose behind preparing for a specific certificate level' },
      { t: 'h', text: 'A practical default target' },
      { t: 'p', text: 'If you do not have a specific deadline from an employer or university, Level 4 is the most practical default target. Level 4 marks the threshold where you can understand news articles, follow structured discussions, and handle everyday professional interactions.' },
      { t: 'p', text: 'Jumping straight from beginner material into TOPIK II can feel overwhelming. Start by establishing strong reading habits with short practice questions.' },
      { t: 'link', href: '/topik-reading/', title: 'TOPIK Reading Practice', note: 'Solve reading passages with line-by-line grammar analysis and vocabulary notes' },
      { t: 'link', href: '/topik-listening/', title: 'TOPIK Listening Practice', note: 'Listen to authentic dialogue audio paired with full transcripts' },
      { t: 'gram', id: '38-5', note: 'Express deciding on a concrete study schedule' },
      { t: 'p', text: 'Choose your target level, verify the current registration dates on the official TOPIK website, and build steady daily practice habits.' },
    ],
  },
  {
    id: 'read-hangul-in-a-morning-english',
    lang: 'en',
    alt: 'read-hangul-in-a-morning',
    title: 'Can you really learn to read Hangul in one morning?',
    date: '2026-09-23',
    updated: '2026-09-23',
    tags: ['English', 'Roadmap'],
    excerpt: 'People often say you can learn Hangul in a single morning. That claim is half true and half misleading. Here is what actually happens in three hours, and what takes several weeks.',
    blocks: [
      { t: 'p', text: 'Search for advice on how to learn Korean, and you will quickly see people claiming that Hangul can be learned in a single morning. Some even say two hours. That claim is neither a total lie nor the whole truth. It helps to separate what genuinely takes one morning from what takes weeks of practice.' },
      { t: 'h', text: 'Why Hangul is fast to learn' },
      { t: 'p', text: 'Most alphabets in the world evolved slowly from pictograms over thousands of years. Letters lost their original shapes through centuries of handwriting, so nobody can explain why the letter A looks like an upside-down ox head. You simply memorise the shapes.' },
      { t: 'p', text: 'Hangul is different. King Sejong and his scholars designed it in 1443 and published it in 1446. The explicit design goal was that ordinary people should be able to learn it in a few days. The shapes of the letters reflect that design directly.' },
      { t: 'list', items: ['The five basic consonants mirror speech organs: 「ㄱ」 shows the tongue root blocking the throat, 「ㄴ」 shows the tongue tip touching the upper gums, 「ㅁ」 outlines the mouth, 「ㅅ」 depicts the teeth, and 「ㅇ」 represents the throat.', 'Adding a stroke strengthens the sound: 「ㄱ」 becomes 「ㅋ」, 「ㄴ」 becomes 「ㄷ」 then 「ㅌ」, 「ㅁ」 becomes 「ㅂ」 then 「ㅍ」, and 「ㅅ」 becomes 「ㅈ」 then 「ㅊ」. You do not memorise unrelated shapes; you add a single line.', 'Doubling a letter creates a tense consonant: 「ㄲ」, 「ㄸ」, 「ㅃ」, 「ㅆ」, 「ㅉ」. The rule is visible at a glance.', 'Vowels are built from three components: a horizontal line, a vertical line, and a short tick. Adding a second tick adds a y sound: 「ㅏ」 becomes 「ㅑ」, and 「ㅓ」 becomes 「ㅕ」.'], ordered: false },
      { t: 'p', text: 'You do not memorise forty random shapes. You learn five base shapes and two simple rules. That is why one morning is genuinely enough to understand the alphabet on paper.' },
      { t: 'h', text: 'Letters sit in syllable blocks' },
      { t: 'p', text: 'Unlike English letters written in a continuous linear row, Korean letters assemble into neat square blocks. Each block corresponds to exactly one spoken syllable. The consonant 「ㅎ」, vowel 「ㅏ」, and final consonant 「ㄴ」 assemble together as 「한」.' },
      { t: 'p', text: 'Beginners sometimes find this arrangement unfamiliar at first, but it actually speeds up reading. Because every block is one rhythmic beat, your eyes can easily see where syllables begin and end.' },
      { t: 'link', href: '/course/hangul.html', title: 'Read Korean — Hangul Reading Course', note: 'Practice every vowel, consonant, and syllable combination with clear audio' },
      { t: 'h', text: 'What does not happen in one morning' },
      { t: 'p', text: 'Here is the honest part that short videos omit. Recognising twenty-four letters is not the same as fluent reading. Real Korean speech involves pronunciation rules where written letters change when they meet adjacent sounds.' },
      { t: 'list', items: ['Final consonants carry over into following vowels: 「한국어」 is written with 「국」 and 「어」, but spoken as [한구거].', 'The consonant 「ㅎ」 softens or disappears between voiced sounds: 「좋아요」 is pronounced [조아요].', 'Certain consonants assimilate to match their neighbours: 「신라」 is pronounced [실라], and 「학년」 is pronounced [항년].'], ordered: false },
      { t: 'p', text: 'These assimilation rules cannot be absorbed in three hours. Expecting to read street signs fluently on day one leads to needless frustration.' },
      { t: 'gram', id: '43-2', note: 'Use this pattern when describing how much time or effort a learning goal requires' },
      { t: 'h', text: 'A realistic timeline for beginners' },
      { t: 'p', text: 'If you plan your first month with realistic expectations, Korean feels far more manageable.' },
      { t: 'list', items: ['Morning 1 (3 hours): Memorise basic consonants, basic vowels, and how to combine them into simple syllables without final consonants.', 'Days 2 to 4: Practice final consonants (받침) and simple batchim combinations.', 'Weeks 2 to 3: Read short words aloud alongside audio recordings to pick up sound changes naturally.', 'Week 4: Read full sentences slowly without relying on romanised spellings.'], ordered: true },
      { t: 'gram', id: '39-1', note: 'Connect study conditions and expected outcomes naturally' },
      { t: 'p', text: 'Never rely on romanisation such as guk or annyeong. Roman letters map poorly onto Korean phonemes and slow down your reading speed. Spend your first morning with the actual alphabet, and leave the sound change rules for the weeks ahead.' },
      { t: 'link', href: '/course/first-words.html', title: 'First Words Course', note: 'Read your first real vocabulary words and greetings with native audio' },
    ],
  },
  {
    id: 'travel-korean-survival-guide-english',
    lang: 'en',
    alt: 'travel-korean-survival-guide',
    title: 'Travel Korean Survival Guide: 43 Essential Phrases in 3 Tiers',
    date: '2026-09-20',
    updated: '2026-09-20',
    tags: ['English', 'Travel'],
    excerpt: 'From airport arrival to subway transit, hotel check-in, ordering food, and handling emergencies — master 43 essential travel phrases split into Easy, Standard, and Accurate tiers with audio, PDF pamphlet, and recording studio.',
    blocks: [
      { t: 'p', text: 'Travelling in Korea without speaking Korean can feel intimidating, but you do not need hundreds of grammar rules to get around comfortably. In fact, most traditional phrasebooks fail because they hand you long, literary sentences that are awkward to say under pressure.' },
      { t: 'p', text: 'Instead, we organized 43 essential phrases into **7 real-life situations** and broke each one into **3 difficulty tiers** so you always have the right phrase ready.' },
      { t: 'h', text: 'The 3-Tier Approach: Speak at your own comfort level' },
      { t: 'list', items: [
        '**Tier 1: Easy (Keywords)** — Single words or ultra-short phrases. If you freeze up, just saying the keyword with a questioning tone gets your point across immediately.',
        '**Tier 2: Standard (Polite 해요체)** — The universal sweet spot. Polite, friendly, and respectful. Use this in 95% of everyday interactions with store clerks, hotel staff, and taxi drivers.',
        '**Tier 3: Accurate (Formal & Polite)** — Complete, idiomatic sentences with proper honorific particles. Perfect when you want to sound polished or when filling out official forms.'
      ], ordered: false },
      { t: 'note', title: 'Why not memorize full textbook sentences?', text: 'When ordering food in a busy Seoul restaurant, saying 「메뉴판 주세요」(Menu, please) is 100 times more effective than stuttering through a complex sentence. Start with what works, then upgrade as you get more confident.' },
      { t: 'h', text: '1. Airport & Arrival (공항 & 입국)' },
      { t: 'p', text: 'Right after landing at Incheon or Gimpo, you need your passport, luggage, a transit card or SIM card, and local currency.' },
      { t: 'ex', ko: '여기 여권이요.', en: 'Here is my passport. (Standard)' },
      { t: 'ex', ko: '환전 어디서 해요?', en: 'Where can I exchange money? (Standard)' },
      { t: 'ex', ko: '유심 카드 있나요?', en: 'Do you have SIM cards? (Standard)' },
      { t: 'dlg', lines: [
        'A: 여권 보여주시겠어요?',
        'B: 네, 여기 여권이요.'
      ] },
      { t: 'h', text: '2. Transit & Directions (교통 & 길 찾기)' },
      { t: 'p', text: 'The Seoul subway and bus system is world-class, but knowing how to ask for an exit or top up your T-money card saves precious vacation time.' },
      { t: 'ex', ko: '교통카드 충전해 주세요.', en: 'Please top up my transit card. (Standard)' },
      { t: 'ex', ko: '홍대입구역 어떻게 가요?', en: 'How do I get to Hongdae station? (Standard)' },
      { t: 'ex', ko: '화장실 어디예요?', en: 'Where is the restroom? (Standard)' },
      { t: 'dlg', lines: [
        'A: 어디로 가세요?',
        'B: 명동역 가주세요. (To Myeongdong station, please.)'
      ] },
      { t: 'h', text: '3. Dining & Cafe (식당 & 카페)' },
      { t: 'p', text: 'Food is the highlight of any trip to Korea. These four phrases cover almost every meal:' },
      { t: 'list', items: [
        '**Calling staff:** 「저기요!」(Excuse me!) — Raise your hand slightly and say this clearly.',
        '**Ordering:** 「이거 하나 주세요」(One of this, please).',
        '**Controlling spice:** 「안 맵게 해주세요」(Please make it not spicy) or 「덜 맵게 해주세요」(Less spicy, please).',
        '**Side dish refill:** 「반찬 더 주세요」(More side dishes, please — standard side dishes in Korea are free to refill!).',
        '**Bill:** 「계산해 주세요」(Bill, please).'
      ], ordered: false },
      { t: 'gram', id: '30-1', note: '-(으)세요 is the foundation of polite requests in restaurants: 「물 주세요」(Water please), 「메뉴판 주세요」(Menu please).' },
      { t: 'h', text: '4. Shopping & Store (쇼핑 & 편의점)' },
      { t: 'p', text: 'From cosmetics shopping in Olive Young to picking up late-night snacks at GS25 or CU:' },
      { t: 'ex', ko: '이거 얼마예요?', en: 'How much is this? (Standard)' },
      { t: 'ex', ko: '입어봐도 돼요?', en: 'Can I try this on? (Standard)' },
      { t: 'ex', ko: '봉투 필요 없어요.', en: 'I do not need a plastic bag. (Standard)' },
      { t: 'ex', ko: '택스프리 돼요?', en: 'Is tax refund available? (Standard)' },
      { t: 'h', text: '5. Emergency & Pharmacy (약국 & 긴급상황)' },
      { t: 'p', text: 'Korean pharmacies (약국) are everywhere and can prescribe over-the-counter medicine for common ailments on the spot.' },
      { t: 'ex', ko: '두통약 주세요.', en: 'Please give me headache medicine. (Standard)' },
      { t: 'ex', ko: '감기약 주세요.', en: 'Please give me cold medicine. (Standard)' },
      { t: 'ex', ko: '지갑을 잃어버렸어요.', en: 'I lost my wallet. (Standard)' },
      { t: 'ex', ko: '도와주세요!', en: 'Please help me! (Standard)' },
      { t: 'h', text: 'Practice Tools: Free in your browser' },
      { t: 'p', text: 'We built three dedicated tools to help you practice and take these phrases on the road:' },
      { t: 'link', href: '/travel-guide.html', title: 'Pocket Travel Guide (Printable A4 / PDF)', note: 'A compact 2-page cheat sheet designed to fold into your pocket or save offline on your phone.' },
      { t: 'link', href: '/record-travel.html', title: 'Travel Recording Studio', note: 'Record your own voice for each phrase, compare with native audio, and export as audio clips.' },
      { t: 'link', href: '/', title: 'Interactive Travel Korean on Cheesepotato', note: 'Switch between Easy, Standard, and Accurate tiers with one click and hear native TTS audio.' },
    ],
  },
  {
    id: 'travel-korean-survival-guide',
    lang: 'ko',
    alt: 'travel-korean-survival-guide-english',
    title: '한국 여행 생존 가이드 — 7대 상황 43개 필수 구문과 3단계 말하기',
    date: '2026-09-20',
    updated: '2026-09-20',
    tags: ['여행', '회화', '초급'],
    excerpt: '공항 입국부터 지하철·버스 환승, 숙소 체크인, 식당 주문, 쇼핑, 관광, 약국/응급까지 — 7대 핵심 상황별 43개 실전 구문을 쉬운 말·보통 말·정확한 말 3단계로 정리했습니다. 포켓 팜플렛 PDF와 녹음 스튜디오도 무료로 제공합니다.',
    blocks: [
      { t: 'p', text: '외국인 친구가 한국을 여행할 때 가장 난감해하는 순간은 "문법은 조금 배웠는데, 식당이나 지하철에서 바로 입이 떨어지지 않을 때"입니다. 교재에 나오는 긴 문장은 막상 현장에서 말하려 하면 머릿속이 하얘지기 십상입니다.' },
      { t: 'p', text: '치즈감자에서는 한국 여행자가 반드시 마주치는 **7대 핵심 상황**(공항, 교통, 숙소, 식당, 쇼핑, 관광, 응급)에서 가장 자주 쓰이는 **43개 필수 구문**을 엄선하고, 학습자의 실력에 맞춰 **3단계(쉬운 말 / 보통 말 / 정확한 말)**로 나누었습니다.' },
      { t: 'h', text: '왜 3단계 난이도로 나누었는가?' },
      { t: 'list', items: [
        '**🟢 쉬운 버전 (단어 키워드)** — 긴 문장이 버거울 땐 핵심 단어에 물음표만 붙여도 통합니다. 예: 「여권이요」, 「환전소?」, 「충전요」',
        '**🟡 보통 버전 (존댓말 해요체)** — 가장 안전하고 자연스러운 일상 한국어입니다. 식당, 편의점, 택시 등 한국 여행의 90% 이상을 이 말투로 해결할 수 있습니다. 예: 「여기 여권이요」, 「환전 어디서 해요?」',
        '**🟣 정확한 버전 (격식체/정중체)** — 서류 작성, 호텔 리셉션, 공적인 자리에서 쓰는 품격 있는 문장입니다. 예: 「여권 여기 있습니다」, 「환전소가 어디에 있습니까?」'
      ], ordered: false },
      { t: 'note', title: '실전 대화 팁: "저기요"와 "주세요"', text: '식당이나 매장에서 직원을 부를 때는 가볍게 손을 들며 「저기요」라고 부르고, 원하는 물건 뒤에 「주세요」만 붙이면 모든 주문이 끝납니다. 「물 주세요」, 「메뉴판 주세요」, 「계산해 주세요」 셋만 외워도 식당 이용이 편안해집니다.' },
      { t: 'h', text: '상황별 꼭 알아야 할 핵심 구문' },
      { t: 'p', text: '여행에서 가장 많이 쓰이는 대표 구문들입니다:' },
      { t: 'ex', ko: '교통카드 충전해 주세요.', en: 'Please top up my transit card.' },
      { t: 'ex', ko: '덜 맵게 해주세요.', en: 'Please make it less spicy.' },
      { t: 'ex', ko: '반찬 더 주세요.', en: 'More side dishes, please. (한국 식당에서는 기본 반찬 리필이 무료입니다!)' },
      { t: 'ex', ko: '입어봐도 돼요?', en: 'Can I try this on?' },
      { t: 'ex', ko: '사진 좀 찍어주시겠어요?', en: 'Could you take a picture for me?' },
      { t: 'gram', id: '30-1', note: '식당과 매장에서 가장 많이 쓰는 정중한 요청 표현 -(으)세요입니다.' },
      { t: 'dlg', lines: [
        'A: 주문하시겠어요?',
        'B: 비빔밥 하나 주세요. 덜 맵게 해주세요.'
      ] },
      { t: 'h', text: '무료로 제공되는 학습 도구 & 자료' },
      { t: 'p', text: '여행 한국어는 웹 브라우저에서 인터랙티브하게 학습할 수 있을 뿐만 아니라, 오프라인 여행 중에도 활용할 수 있도록 두 가지 특별 도구를 함께 제공합니다:' },
      { t: 'link', href: '/travel-guide.html', title: '포켓 여행 가이드 (A4 인쇄 / PDF 다운로드)', note: '지갑이나 여권 사이에 쏙 들어가는 2쪽짜리 포켓 팜플렛. 비행기나 지하철에서 인터넷 없이도 꺼내볼 수 있습니다.' },
      { t: 'link', href: '/record-travel.html', title: '직접 녹음 스튜디오', note: '내 목소리로 43개 문장을 직접 녹음하고 들어보며 발음을 교정할 수 있는 전용 웹 녹음실입니다.' },
      { t: 'link', href: '/', title: '치즈감자 여행 한국어 화면 바로가기', note: '7대 상황별 그리드 카드로 원하는 상황을 골라 3단계 토글과 원어민 음성으로 바로 연습해 보세요.' },
    ],
  },
  {
    id: 'eun-neun-vs-i-ga-english',
    lang: 'en',
    alt: 'eun-neun-vs-i-ga',
    title: '은/는 vs 이/가: one question instead of ten rules',
    date: '2026-09-14',
    updated: '2026-09-14',
    tags: ['English', 'Grammar'],
    excerpt: 'The most asked question in Korean grammar, and the one most explanations get wrong by giving you a list to memorise. Here is the single question to ask instead.',
    blocks: [
      { t: 'p', text: '「저는 학생이에요」 and 「제가 학생이에요」 are both correct sentences that mean different things. This is the question Korean learners ask most, and most answers hand you a list of ten rules. The list does not help when you are actually writing a sentence.' },
      { t: 'p', text: 'One question works better than the list.' },
      { t: 'quote', lines: ['Am I bringing this up for the first time, or have we been talking about it?'] },
      { t: 'h', text: 'New information takes 이/가. Old information takes 은/는' },
      { t: 'p', text: 'The first two sentences of any Korean folk tale show this more clearly than any explanation.' },
      { t: 'quote', lines: ['옛날에 한 할아버지**가** 살았습니다.', '그 할아버지**는** 매일 산에 나무를 하러 갔습니다.'] },
      { t: 'p', text: 'In the first sentence the old man appears for the first time — 이/가. By the second sentence he is someone we both know about — 은/는. Swap them and the first sentence sounds wrong, because it treats a stranger as though you already knew him.' },
      { t: 'p', text: 'This is why introducing yourself is 「저**는** 학생이에요」. You are not new information — you are standing right there. 「제**가** 학생이에요」 is closer to 「**I** am the student」, as an answer to the question of which person is the student. Outside that context it sounds odd.' },
      { t: 'gram', id: '26-1', note: 'Start with this one. The examples are all first-mention sentences, which is the clearest case' },
      { t: 'h', text: 'The question decides the answer' },
      { t: 'p', text: 'Question words make the rule visible.' },
      { t: 'quote', lines: ['누**가** 왔어요? — 제임스**가** 왔어요.', '제임스**는** 왔어요? — 네, 제임스**는** 왔어요.'] },
      { t: 'p', text: '「누가」 asks about something unknown, so it takes 이/가, and the answer fills that same slot, so it takes 이/가 too. 「제임스는 왔어요?」 is what you ask when James is already the topic and you only want to know whether he showed up.' },
      { t: 'h', text: '은/는 is closer to 「as for」' },
      { t: 'p', text: 'If you read 은/는 as 「as for」, contrast falls out on its own.' },
      { t: 'ex', ko: '커피는 좋아하는데 우유는 싫어해요.', en: 'As for coffee I like it, but as for milk I do not.' },
      { t: 'p', text: 'Two things are being weighed against each other, so both take 은/는. Using 이/가 here breaks the comparison.' },
      { t: 'note', title: 'The part that surprises people', text: '은/는 drags in what you did **not** say. 「저는 김치**는** 먹어요」 lands as 「I eat kimchi — *unlike some other thing*」, and the listener will assume there is something you cannot eat. If you did not mean that, say 「김치**를** 먹어요」. This catches learners constantly.' },
      { t: 'gram', id: '26-2', note: 'Worth reading the watch-out section here specifically — the implied contrast is the part that causes real misunderstandings' },
      { t: 'h', text: 'Inside a modifying clause, only 이/가 is possible' },
      { t: 'p', text: 'Everything above is about nuance. This part is a hard rule. The subject of a clause that modifies a noun must take 이/가.' },
      { t: 'quote', lines: ['제**가** 만든 음식 (correct)', '저**는** 만든 음식 (not possible)'] },
      { t: 'p', text: '「제가 좋아하는 노래」, 「비**가** 오는 날」, 「사람**이** 많은 곳」 — all the same slot. Learners hit this constantly once sentences get longer, not because the rule is hard but because the habit of starting sentences with 「저는」 follows them into the clause.' },
      { t: 'gram', id: '41-1', note: 'This is the structure the rule above lives inside. If modifying clauses are still new, read this first' },
      { t: 'h', text: 'The short version' },
      { t: 'list', items: ['First mention · question words and their answers · subject inside a modifying clause → **이/가**', 'Already the topic · contrast · anywhere 「as for」 fits → **은/는**', 'If you do not want to imply something unsaid, avoid 은/는'], ordered: false },
      { t: 'p', text: 'Knowing the rules does not make the right particle come out when you are speaking. This is a case where the gap between recognising and producing is unusually wide, so the fastest way through is to write your own sentences and have them checked.' },
      { t: 'link', href: '/course/bg-04.html', title: 'Telling 이/가 and 은/는 apart — two lessons', note: 'Built around asking 「is this new, or are we already talking about it」 rather than memorising a list' },
      { t: 'link', href: '/compare/26.html', title: 'All 20 Korean particles, compared', note: 'See 이/가 and 은/는 next to 을/를, 도, 만 and the rest, with the form and watch-outs for each' },
    ],
  },
  {
    id: 'how-to-learn-korean',
    lang: 'en',
    title: 'How to Learn Korean: the order that actually works',
    date: '2026-09-14',
    updated: '2026-09-14',
    tags: ['English', 'Roadmap'],
    excerpt: 'A step-by-step path from the Hangul letters to TOPIK level 6, with an honest estimate of how long each stage takes and what usually goes wrong. Everything linked here is free and needs no sign-up.',
    blocks: [
      { t: 'p', text: 'Most people who quit Korean do not quit because they ran out of material. There is more free Korean material online than anyone could work through in a decade. They quit because nobody told them what order to do it in, so every session starts with a decision instead of with studying.' },
      { t: 'p', text: 'This is the order. It is the same order our own lessons are built in, and each step below links straight to the part of this site that covers it. Everything is free and works in the browser with no sign-up.' },
      { t: 'h', text: 'Step 1 — Read Hangul (one morning)' },
      { t: 'p', text: 'Do not skip this and do not use romanization as a crutch. Romanization cannot represent Korean sounds accurately, and every week you spend reading 「annyeonghaseyo」 instead of 「안녕하세요」 is a week you will have to undo later.' },
      { t: 'p', text: 'Hangul is genuinely fast because it was designed to be. It was created in the 1440s with the stated goal of being learnable quickly, and the shapes still show it: five basic consonants drawn after the shape of the mouth and tongue, extra strokes for stronger sounds, doubled letters for tense sounds. You are learning a handful of shapes and two or three rules, not forty separate symbols.' },
      { t: 'note', title: 'What one morning does not buy you', text: 'You will be able to turn letters into sounds. You will **not** yet know what the words mean, and you will not yet handle the places where spelling and pronunciation differ — 「좋아요」 is said [조아요], 「신라」 is said [실라]. Those come with weeks of listening, not with one morning.' },
      { t: 'link', href: '/course/hangul.html', title: 'Read Korean — the alphabet in ten lessons', note: 'Starts from why the letters look the way they do and ends with you reading real signs and menus' },
      { t: 'h', text: 'Step 2 — Your first hundred words, out loud' },
      { t: 'p', text: 'Learn greetings, ordering food, asking where something is, numbers, and the words for the things in front of you. Not because it is easy, but because these are the words you can use the same day, and using a word once is worth more than reading it five times.' },
      { t: 'p', text: 'Say them out loud. Korean has sounds English does not distinguish — the three-way split between ㄱ, ㅋ and ㄲ is the classic one — and you cannot hear a difference you have never tried to produce.' },
      { t: 'link', href: '/course/first-words.html', title: 'First Words — greetings, ordering, directions', note: 'The phrases you use on day one, with audio for every line' },
      { t: 'h', text: 'Step 3 — Build the sentence skeleton' },
      { t: 'p', text: 'This is where Korean stops feeling like a phrasebook. Korean sentences put the verb at the end and mark each word\'s job with a particle, so word order is far freer than in English. Once you can build a sentence yourself, every new word multiplies instead of just adding.' },
      { t: 'p', text: 'Four things carry most of the weight at this stage.' },
      { t: 'gram', id: '23-1', note: 'Start here. Saying what something **is** is the shortest complete sentence you can make' },
      { t: 'gram', id: '24-2', note: 'The polite ending you will use in almost every sentence for the next year' },
      { t: 'gram', id: '26-1', note: 'The subject marker — worth practising before the topic marker below, because the contrast is what makes both click' },
      { t: 'gram', id: '26-2', note: 'The topic marker. This pair confuses people for years; writing your own sentences is the fastest way through' },
      { t: 'note', title: 'The one that takes longest', text: '은/는 versus 이/가 is the single most asked question in Korean and no explanation fixes it on its own. The short version: **이/가** introduces something new, **은/는** marks what you are already talking about, or contrasts it with something else. The long version only sinks in by writing sentences and being corrected.' },
      { t: 'link', href: '/course/grammar-core.html', title: 'Building Sentences — tense, negation, particles', note: 'The skeleton course. Tense, negation and the particles above, in the order they build on each other' },
      { t: 'h', text: 'Step 4 — Politeness, which most textbooks under-teach' },
      { t: 'p', text: 'Textbooks teach 해요체 and stop. In practice you have to choose a speech level for every person you talk to, and getting it wrong is more noticeable than a grammar mistake.' },
      { t: 'p', text: 'The safe answer while you are learning: use 해요체 with everyone. It is neither stiff nor rude. But learn early that **how you speak to someone** and **who you are speaking about** are two separate dials — 「할머니께서 집에 가세요」 adds -(으)시- because the grandmother is the subject, not because of who is listening.' },
      { t: 'gram', id: '30-1', note: 'The polite request form. You will hear this everywhere before you ever need to produce it' },
      { t: 'h', text: 'Step 5 — Join sentences together' },
      { t: 'p', text: 'Beginners produce a string of short sentences. Intermediate speakers connect them. This is the step that makes you sound less like a textbook, and it is mostly a matter of collecting connectors and knowing which one fits.' },
      { t: 'gram', id: '32-1', note: 'The basic 「because」. Learn what can and cannot follow it — that restriction is the whole trick' },
      { t: 'gram', id: '41-1', note: 'Modifiers. This is how 「the book I read yesterday」 becomes one Korean phrase, and it unlocks long sentences' },
      { t: 'link', href: '/compare/', title: 'Confusable expressions, compared side by side', note: '73 sets of expressions that translate the same into English but are not interchangeable' },
      { t: 'h', text: 'Step 6 — TOPIK, if you need a number' },
      { t: 'p', text: 'If you need Korean for a university, a visa or a job, you will eventually need a TOPIK level. Worth knowing before you register: you do not choose a level. You choose a test — TOPIK I or TOPIK II — and the score you get decides your level.' },
      { t: 'p', text: 'Level 4 is the most commonly requested, so it is a sensible default target. Cut-off scores and requirements change, so check the official site rather than any number you read in a blog post, including this one.' },
      { t: 'note', title: 'About our practice questions', text: 'The 512 TOPIK-style questions on this site are **original items written to match the format**, not past papers, and we are not affiliated with the institute that runs the exam. Each one comes with an explanation of why the answer is right; the writing tasks come with a model answer and the points examiners mark down for.' },
      { t: 'link', href: '/topik-reading/', title: 'TOPIK reading practice', note: 'Sorted by question type, with the passage, the four options and the reasoning on the same page' },
      { t: 'h', text: 'How long does this take' },
      { t: 'p', text: 'For a native English speaker, Korean is in the hardest group the US Foreign Service Institute classifies — roughly 2,200 class hours to reach professional working proficiency. That figure is for full-time intensive study with an instructor, so treat it as a shape rather than a schedule: this is a multi-year project, not a summer one.' },
      { t: 'p', text: 'More useful as a guide: reading Hangul takes a morning. Getting to the point where you can order food, ask directions and explain yourself badly but successfully takes a few months of steady work. Getting to TOPIK level 4 takes most people a year or two. Anyone promising much faster is selling something.' },
      { t: 'h', text: 'What actually goes wrong' },
      { t: 'list', items: ['**Collecting instead of studying.** Six apps, four textbooks, a Netflix list, and forty minutes a day spent choosing between them. Pick one path and follow it until it stops working.', '**Reading grammar without producing it.** You can understand an explanation of -는 바람에 completely and still never use it. Recognising and producing are different skills and only one of them is practised by reading.', '**Skipping listening until later.** Korean flattens and blends sounds heavily in speech. If you only ever read, your first real conversation will be a shock.', '**Studying hard for two weeks, then nothing.** Twenty minutes daily beats four hours on Sunday, and it is not close.'], ordered: false },
      { t: 'h', text: 'A free path through this site' },
      { t: 'p', text: 'Read Korean → First Words → Building Sentences → the 290 grammar points, writing your own sentence for each → TOPIK practice if you need a score. Words you do not know are clickable while you study, and go into a wordbook that asks you again before you forget them.' },
      { t: 'p', text: 'There is no install and no sign-up. Signing in only matters if you want your progress to follow you to another device.' },
      { t: 'link', href: '/sentence/', title: 'All 290 grammar points', note: 'Each one has its meaning, form, what to watch out for, examples and a dialogue — and a box to write your own sentence' },
    ],
  },
  {
    id: 'reasons-intermediate',
    title: '이유를 말하는 법, 중급 편 — 거든요, 느라고, 바람에, 탓에',
    date: '2026-09-20',
    updated: '2026-09-20',
    tags: ['문법', '중급'],
    excerpt: '아/어서·으니까·때문에로는 못 담는 이유 표현들입니다. 상대가 모르는 걸 알려줄 때, 그거 하느라 다른 일을 못 했을 때, 뜻밖의 일 탓에 이렇게 됐을 때 쓰는 말을 모았습니다.',
    blocks: [
      { t: 'p', text: '초급에서 이유를 말할 때 아/어서, (으)니까, 때문에를 배웁니다. 그런데 실제 대화를 들어 보면 「느라고」, 「거든요」, 「-는 바람에」 같은 말이 훨씬 자주 들립니다. 셋보다 더 자연스럽고 구체적인 이유 표현들입니다.' },
      { t: 'h', text: '상대가 모르는 이유를 새로 알려줄 때 — 거든요' },
      { t: 'p', text: '듣는 사람이 모르고 있던 사정을 밝혀 줄 때 씁니다. 질문에 답하는 자리보다, 상대가 궁금해할 만한 걸 먼저 짚어 주는 자리에 잘 맞습니다.' },
      { t: 'ex', ko: '저 오늘 좀 피곤해요. 어제 잠을 못 잤거든요.', en: 'I am a bit tired today. I could not sleep last night, you see.' },
      { t: 'gram', id: '51-1', note: '상대가 몰랐던 사정을 알려 주는 자리를 예문으로 확인해 보세요' },
      { t: 'h', text: '그것 하느라 다른 일을 못 했을 때 — 느라고' },
      { t: 'p', text: '무언가를 하는 데 시간과 힘을 쓰느라 다른 일에 못 미쳤다는 뜻입니다. 뒤에는 늘 아쉽거나 안 좋은 결과가 옵니다.' },
      { t: 'ex', ko: '어제 시험공부 하느라고 잠을 못 잤어요.', en: 'I could not sleep because I was studying for the test.' },
      { t: 'gram', id: '51-3', note: '뒤에 반드시 안 좋은 결과가 온다는 점을 예문으로 확인하세요' },
      { t: 'h', text: '예상 밖의 일 탓에 — 는 바람에' },
      { t: 'p', text: '생각지도 못한 일이 갑자기 터져서 그 탓에 이렇게 됐다는 뜻입니다. 「느라고」와 달리 내가 일부러 한 일이 아니어도 씁니다.' },
      { t: 'quote', lines: ['버스를 놓치는 바람에 회의에 늦었어요.', '갑자기 비가 오는 바람에 소풍이 취소됐어요.'] },
      { t: 'gram', id: '51-4', note: '뜻밖의 사건이 원인이 되는 자리를 예문으로 보면 느라고와 갈립니다' },
      { t: 'h', text: '못마땅한 원인을 짚을 때 — 는 탓에' },
      { t: 'p', text: '「는 바람에」와 비슷한데, 원인이 된 것을 나무라는 듯한 말투가 더해집니다. 좋지 않은 일의 책임을 누구, 또는 무엇에 돌릴 때 씁니다.' },
      { t: 'ex', ko: '길이 막힌 탓에 약속 시간에 늦었어요.', en: 'Because of the traffic, I was late for the appointment.' },
      { t: 'gram', id: '51-5', note: '책임을 짚듯 원인을 나무라는 말투를 예문으로 확인해 보세요' },
      { t: 'h', text: '넷을 어떻게 가르나' },
      { t: 'list', ordered: false, items: ['**상대가 모르는 사정**을 알려주면 → 거든요', '**그거 하느라** 다른 일을 못 했으면 → 느라고 (안 좋은 결과만)', '**뜻밖의 일** 탓이면 → 는 바람에', '**나무라듯** 원인을 짚으면 → 는 탓에'] },
      { t: 'p', text: '넷 다 아/어서나 때문에로 옮겨도 뜻은 통하지만, 말맛이 사라집니다. 어느 상황에서 어떤 걸 쓰는지는 예문을 직접 여러 번 만들어 봐야 몸에 붙습니다.' },
      { t: 'link', href: '/sentence/', title: '문법 표현 목록', note: '이유를 나타내는 다른 표현들도 함께 볼 수 있습니다' },
    ],
  },
  {
    id: 'recalling-with-deon',
    title: '예전 기억을 말할 때 — 던, 더라고요, 던데요',
    date: '2026-09-19',
    updated: '2026-09-19',
    tags: ['문법', '중급'],
    excerpt: '직접 보고 겪은 걸 나중에 전할 때 쓰는 표현들입니다. 던 하나가 명사를 꾸미기도, 문장을 끝맺기도, 상대의 반응을 기다리기도 합니다.',
    blocks: [
      { t: 'p', text: '「어제 갔던 식당」, 「진짜 맛있더라고요」, 「사람이 많던데요」. 셋 다 「던」이 들어가는데, 지나간 일을 그냥 말하는 게 아니라 **내가 직접 보고 겪은 것**이라는 표시가 담겨 있습니다.' },
      { t: 'h', text: '예전 그 일을 명사 앞에 붙일 때 — 던' },
      { t: 'p', text: '예전에 하던, 또는 하다가 만 일을 명사 앞에 붙여 꾸밀 때 씁니다. 지금은 끝났거나 잠깐 멈춘 일이라는 느낌이 남습니다.' },
      { t: 'ex', ko: '어릴 때 살던 동네에 다시 가 봤어요.', en: 'I went back to the neighborhood I used to live in as a kid.' },
      { t: 'gram', id: '55-1', note: '예전에 하던, 하다 만 느낌이 어떻게 남는지 예문으로 확인해 보세요' },
      { t: 'h', text: '직접 겪어 보니 그렇더라고 전할 때 — 더라고요' },
      { t: 'p', text: '내가 직접 보거나 겪은 일을 지금 상대에게 새롭게 전할 때 씁니다. 남에게 들은 이야기에는 못 씁니다 — 반드시 내가 직접 겪은 일이어야 합니다.' },
      { t: 'dlg', lines: ['A: 그 식당 어땠어요?', 'B: 생각보다 훨씬 맛있더라고요.'] },
      { t: 'gram', id: '55-2', note: '내가 직접 겪은 일에만 쓸 수 있다는 점을 예문으로 확인해 보세요' },
      { t: 'h', text: '전하면서 반응을 기다릴 때 — 던데요' },
      { t: 'p', text: '직접 본 것을 전하면서, 말끝을 살짝 열어 상대의 반응을 기다리는 말투입니다. 「더라고요」보다 더 대화를 이어 가려는 느낌이 강합니다.' },
      { t: 'ex', ko: '아까 보니까 사람들이 줄을 많이 서 있던데요.', en: 'I saw quite a lot of people lining up earlier.' },
      { t: 'gram', id: '55-3', note: '말끝을 열어 상대의 반응을 기다리는 자리를 예문으로 확인해 보세요' },
      { t: 'h', text: '셋을 가르는 기준' },
      { t: 'p', text: '셋 다 **내가 직접 겪었다**는 전제는 같습니다. 다른 것은 그 겪은 일을 어떻게 처리하느냐입니다.' },
      { t: 'list', ordered: false, items: ['겪은 일로 **명사를 꾸미면** → 던', '겪은 일을 **새롭게 전달**하면 → 더라고요', '겪은 일을 전하며 **반응을 기다리면** → 던데요'] },
      { t: 'note', title: '자주 하는 실수', text: '「더라고요」는 남에게 들은 이야기에는 쓸 수 없습니다. 「친구가 그러던데 거기 맛있대요」처럼 들은 말을 전할 때는 간접 인용을 따로 씁니다.' },
      { t: 'p', text: '이 셋은 문법책보다 대화에서 훨씬 많이 만나는 표현들입니다. 드라마나 예능에서 누가 무언가를 전할 때 어떤 말투를 쓰는지 눈여겨보면 감이 빨리 옵니다.' },
      { t: 'link', href: '/sentence/', title: '문법 표현 목록', note: '직접 겪은 일을 전하는 다른 표현들도 함께 볼 수 있습니다' },
    ],
  },
  {
    id: 'passive-and-causative',
    title: '저절로 됐다 vs 누가 시켰다 — 피동과 사동',
    date: '2026-09-18',
    updated: '2026-09-18',
    tags: ['문법', '중급'],
    excerpt: '문을 닫았다와 문이 닫혔다는 다른 문장입니다. 누가 했는지, 저절로 됐는지, 남에게 시켰는지 — 이 구분이 한국어 문장의 방향을 바꿉니다.',
    blocks: [
      { t: 'p', text: '「문을 닫았어요」와 「문이 닫혔어요」는 뜻이 다릅니다. 앞은 누군가 닫은 것이고, 뒤는 문이 저절로, 또는 누가 닫았는지 밝히지 않고 그냥 그렇게 된 것입니다.' },
      { t: 'p', text: '이렇게 저절로 됨을 나타내는 것이 **피동**, 반대로 남에게 시켜서 하게 만드는 것이 **사동**입니다.' },
      { t: 'h', text: '저절로 그렇게 됐다 — 아/어지다' },
      { t: 'p', text: '누가 했는지 밝히지 않고, 그냥 그런 상태가 되었다고 말할 때 씁니다. 책임을 딱히 묻지 않는 부드러운 말투이기도 합니다.' },
      { t: 'ex', ko: '요즘 날씨가 많이 따뜻해졌어요.', en: 'The weather has gotten a lot warmer these days.' },
      { t: 'gram', id: '56-2', note: '누가 했는지 밝히지 않고 그렇게 되었다는 자리를 예문으로 확인해 보세요' },
      { t: 'h', text: '내 뜻과 상관없이 그리됐다 — 게 되다' },
      { t: 'p', text: '「아/어지다」와 비슷하지만, 상황이나 사정이 그렇게 만들었다는 느낌이 더 강합니다. 내가 정한 것이 아니라 흘러가다 보니 그리됐다는 뜻입니다.' },
      { t: 'ex', ko: '이직을 하게 되면서 지방으로 이사했어요.', en: 'After I ended up changing jobs, I moved to the countryside.' },
      { t: 'gram', id: '56-3', note: '내 뜻과 상관없이 상황이 그렇게 만든 자리를 예문으로 확인해 보세요' },
      { t: 'h', text: '남에게 하도록 시키다 — 게 하다' },
      { t: 'p', text: '피동과 반대 방향입니다. 내가 누군가에게 그 일을 하도록 시키거나, 그렇게 하게끔 둔다는 뜻입니다.' },
      { t: 'ex', ko: '엄마는 저에게 매일 일기를 쓰게 하셨어요.', en: 'My mom had me write in my diary every day.' },
      { t: 'gram', id: '57-2', note: '남에게 시키는 방향을 피동 표현들과 견주어 보세요' },
      { t: 'h', text: '짧게 줄이는 낱말들도 있다' },
      { t: 'p', text: '「아/어지다」, 「게 되다」, 「게 하다」처럼 붙여 만드는 것 말고, 아예 동사 자체가 짧게 바뀌는 낱말들도 있습니다. 피동은 「보다→보이다」, 「듣다→들리다」처럼, 사동은 「먹다→먹이다」, 「입다→입히다」처럼 바뀝니다.' },
      { t: 'list', ordered: false, items: ['피동: 보다→보이다, 듣다→들리다, 닫다→닫히다', '사동: 먹다→먹이다, 입다→입히다, 앉다→앉히다'] },
      { t: 'gram', id: '56-1', note: '짧게 줄여 피동을 만드는 낱말들을 한자리에서 봅니다' },
      { t: 'gram', id: '57-1', note: '짧게 줄여 사동을 만드는 낱말들을 한자리에서 봅니다' },
      { t: 'h', text: '방향을 헷갈리지 않으려면' },
      { t: 'p', text: '문장을 만들기 전에 주어에게 물어보면 됩니다. **주어가 스스로 겪는 건가, 남에게 시키는 건가.** 앞이면 피동, 뒤면 사동입니다.' },
      { t: 'p', text: '짧게 줄이는 낱말은 동사마다 형태가 달라서 통째로 외우는 수밖에 없습니다. 대신 문장에서 자주 쓰는 것부터 하나씩 늘려 가면 됩니다.' },
      { t: 'link', href: '/sentence/', title: '문법 표현 목록', note: '피동·사동 말고도 문장의 방향을 바꾸는 표현들을 볼 수 있습니다' },
    ],
  },
  {
    id: 'confirming-what-you-heard',
    title: '들은 말 되묻기 — 다고요?, 다면서요?, 다니요?',
    date: '2026-09-17',
    updated: '2026-09-17',
    tags: ['문법', '중급'],
    excerpt: '믿기지 않아 되묻는지, 사실인지 확인하는지, 놀라서 되묻는지에 따라 표현이 갈립니다. 모양은 비슷해도 담긴 감정이 다릅니다.',
    blocks: [
      { t: 'p', text: '「내일부터 휴가라고요?」, 「내일부터 휴가라면서요?」, 「내일부터 휴가라니요?」. 셋 다 들은 말을 되묻는 모양인데, 담긴 마음은 다 다릅니다.' },
      { t: 'h', text: '못 믿겠어서 되물을 때 — 다고요?' },
      { t: 'p', text: '들은 말이 뜻밖이거나 믿기지 않아서 다시 한번 확인하듯 물을 때 씁니다. 「진짜예요?」에 가까운 되물음입니다.' },
      { t: 'ex', ko: '이번 주말에 결혼한다고요? 처음 듣는데요.', en: 'You are getting married this weekend? I am hearing this for the first time.' },
      { t: 'gram', id: '52-1', note: '믿기지 않아 되묻는 자리를 예문으로 확인해 보세요' },
      { t: 'h', text: '들은 얘기를 전하며 의견을 물을 때 — 다고 하던데' },
      { t: 'p', text: '남에게 들은 이야기를 상대에게 전하면서, 그에 대한 생각이나 반응을 슬쩍 물어볼 때 씁니다.' },
      { t: 'ex', ko: '이 식당 맛없다고 하던데, 그래도 가 볼까요?', en: 'I heard this restaurant is not good, but should we still go?' },
      { t: 'gram', id: '52-2', note: '들은 말을 전하며 의견을 구하는 자리를 예문으로 확인해 보세요' },
      { t: 'h', text: '맞는지 확인하며 물을 때 — 다면서요?' },
      { t: 'p', text: '이미 들어서 알고 있는 사실이 맞는지 확인하는 물음입니다. 「다고요?」와 달리 못 믿겠다는 느낌보다는 그냥 사실 확인에 가깝습니다.' },
      { t: 'dlg', lines: ['A: 다음 달에 이사한다면서요?', 'B: 네, 맞아요. 회사가 옮겨져서요.'] },
      { t: 'gram', id: '52-3', note: '이미 들어서 아는 사실을 확인하는 자리를 예문으로 확인해 보세요' },
      { t: 'h', text: '뜻밖이라 놀라서 되물을 때 — 다니요?' },
      { t: 'p', text: '넷 중 놀라움이 가장 큽니다. 들은 말이 너무 뜻밖이라 그 자체를 되뇌듯 되묻는 말투입니다.' },
      { t: 'ex', ko: '버스가 끊겼다니요? 아직 열 시밖에 안 됐는데요.', en: 'The last bus is already gone? It is not even ten yet.' },
      { t: 'gram', id: '52-4', note: '뜻밖이라 놀라며 되묻는 자리를 예문으로 확인해 보세요' },
      { t: 'h', text: '넷을 가르는 기준' },
      { t: 'list', ordered: false, items: ['**못 믿겠어서** 되물으면 → 다고요?', '**들은 말을 전하며** 의견을 구하면 → 다고 하던데', '**사실을 확인**하면 → 다면서요?', '**놀라서** 되물으면 → 다니요?'] },
      { t: 'p', text: '넷 다 간접 인용(-다고, -다면)에서 갈라져 나온 표현들이라 모양이 비슷합니다. 어떤 마음이 담겼는지는 억양과 상황이 더 많이 말해 줍니다.' },
      { t: 'link', href: '/sentence/', title: '문법 표현 목록', note: '간접 인용에서 갈라져 나온 다른 표현들도 함께 볼 수 있습니다' },
    ],
  },
  {
    id: 'topik-writing-54-structure',
    alt: 'topik-writing-54-structure-english',
    title: 'TOPIK 쓰기 54번, 짜임부터 잡기',
    date: '2026-09-16',
    updated: '2026-09-16',
    tags: ['TOPIK', '준비'],
    excerpt: '54번은 문법보다 짜임에서 점수가 갈립니다. 질문별로 문단을 나누고, 서론에 문제를 되풀이하지 않고, 결론에 새 주장을 넣지 않는 법을 정리했습니다.',
    blocks: [
      { t: 'p', text: 'TOPIK 쓰기 54번은 600~700자로 자기 생각을 쓰는 문제입니다. 급수를 가르는 문제로 꼽히는데, 문법이 맞아도 점수가 안 나오는 경우가 흔합니다. 글의 짜임이 안 잡혀서입니다.' },
      { t: 'p', text: '54번에서 무엇을 어떻게 짜야 하는지만 정리합니다.' },
      { t: 'h', text: '문제는 질문 두세 개로 나뉜다' },
      { t: 'p', text: '54번 문제지를 보면 큰 주제 아래 작은 질문이 두세 개 딸려 있습니다. 이 질문들이 곧 문단을 나누는 기준입니다 — 질문 하나에 문단 하나로 답한다고 생각하면 짜임이 훨씬 쉬워집니다.' },
      { t: 'h', text: '서론 — 문제를 다시 쓰지 않는다' },
      { t: 'p', text: '서론에서 흔한 실수는 문제 지문을 그대로 옮겨 적는 것입니다. 대신 주제가 왜 중요한지, 또는 그 주제를 어떻게 볼 것인지를 내 말로 짧게 엽니다.' },
      { t: 'note', title: '자주 하는 실수', text: '문제에 나온 문장을 토씨만 바꿔서 서론에 다시 쓰면 그만큼 내 생각을 쓸 자리가 줄어듭니다. 서론은 두세 문장이면 충분합니다.' },
      { t: 'h', text: '본론 — 질문마다 근거를 하나씩' },
      { t: 'p', text: '본론은 주장만 나열하면 감점됩니다. 질문마다 **주장 한 문장 + 근거나 예시 한두 문장**으로 묶어야 합니다.' },
      { t: 'ex', ko: '교육에서 경쟁은 필요하다. 경쟁이 있어야 학생들이 더 노력하기 때문이다.', en: 'Competition is necessary in education, because it motivates students to work harder.' },
      { t: 'p', text: '문단을 연결할 때는 「그리고」, 「그래서」보다 글말에 맞는 접속 표현을 씁니다.' },
      { t: 'gram', id: '38-4', note: '목적을 밝히며 근거를 이어 갈 때 자주 쓰는 자리입니다' },
      { t: 'gram', id: '49-2', note: '찬반이 갈리는 주제에서 두 입장을 나란히 놓을 때 씁니다' },
      { t: 'gram', id: '59-1', note: '근거를 하나 더 보탤 때 본론에서 자주 쓰는 표현입니다' },
      { t: 'h', text: '결론 — 새 주장을 넣지 않는다' },
      { t: 'p', text: '결론에서 갑자기 새로운 근거나 주장을 꺼내면 글이 흔들려 보입니다. 본론에서 이미 한 말을 간추리고, 필요하면 앞으로의 방향을 한 문장으로 덧붙이는 정도로 끝냅니다.' },
      { t: 'h', text: '말투부터 틀리면 다 소용없다' },
      { t: 'p', text: '54번은 반드시 글말투(-ㄴ다체)로 써야 합니다. 「-습니다」나 「-아/어요」로 쓰면 형식에서부터 감점입니다. 시험이라는 걸 의식해서 오히려 더 공손하게 쓰려다 이 실수가 흔히 나옵니다.' },
      { t: 'h', text: '직접 써 봐야 늘어난다' },
      { t: 'p', text: '이 사이트의 쓰기 연습 문항은 TOPIK을 주관하는 국립국제교육원과 관계없이 같은 유형으로 새로 만든 창작 문항입니다. 문항마다 모범답안과 채점 포인트, 흔한 감점 요인을 같이 볼 수 있습니다.' },
      { t: 'p', text: '채점 기준과 글자 수 같은 세부 사항은 회차마다 안내가 나오니, 시험 직전에는 공식 안내에서 그해 기준을 한 번 더 확인하는 편이 안전합니다.' },
      { t: 'link', href: '/topik-writing/', title: '쓰기 연습 문항', note: '51~54번 유형을 모범답안·채점 포인트와 함께 연습할 수 있습니다' },
    ],
  },
  {
    id: 'wanting-in-korean',
    title: '원하는 걸 말하는 법 — 고 싶다와 았으면 좋겠다',
    date: '2026-09-15',
    updated: '2026-09-15',
    tags: ['문법', '초급'],
    excerpt: '둘 다 「원한다」는 뜻이지만 내가 직접 할 수 있는 일인지, 내 힘 밖의 일인지에 따라 갈립니다. 남의 바람을 전할 때 쓰는 법도 다릅니다.',
    blocks: [
      { t: 'p', text: '「저는 한국에 가고 싶어요」와 「한국에 갔으면 좋겠어요」. 둘 다 한국에 가고 싶다는 말인데, 영어로 옮기면 둘 다 그냥 「want to」가 됩니다.' },
      { t: 'p', text: '한국어에서는 이 둘이 꽤 다른 느낌을 줍니다.' },
      { t: 'h', text: '내가 직접 할 수 있으면 고 싶다' },
      { t: 'p', text: '「-고 싶다」는 내가 직접 하는 일에 씁니다. 먹고 싶다, 가고 싶다, 자고 싶다처럼 스스로 움직여서 이룰 수 있는 바람입니다.' },
      { t: 'ex', ko: '저는 이번 방학에 제주도에 가고 싶어요.', en: 'I want to go to Jeju Island this vacation.' },
      { t: 'gram', id: '31-1', note: '가장 먼저 배우는 바람 표현이라 뒤 표현과 나란히 보면 차이가 잘 보입니다' },
      { t: 'h', text: '내 힘 밖의 일이면 았으면 좋겠다' },
      { t: 'p', text: '「-았/었으면 좋겠다」는 내 힘만으로는 안 되는 일, 아직 그렇지 않은 일에 씁니다. 날씨, 시험 결과, 남의 마음처럼 내가 직접 어떻게 할 수 없는 일에 훨씬 자연스럽습니다.' },
      { t: 'ex', ko: '내일 눈이 안 왔으면 좋겠어요.', en: 'I hope it does not snow tomorrow.' },
      { t: 'gram', id: '31-2', note: '내 힘 밖의 일을 바라는 자리를 고 싶다와 견주어 보세요' },
      { t: 'h', text: '같은 일도 어느 쪽을 쓰느냐로 느낌이 갈린다' },
      { t: 'quote', lines: ['취직하고 싶어요. (내가 노력해서 이루려는 바람)', '취직했으면 좋겠어요. (결과가 그렇게 되기를 바라는 마음)'] },
      { t: 'p', text: '「취직하고 싶어요」는 내가 애써서 이루겠다는 의지가 느껴지고, 「취직했으면 좋겠어요」는 결과만 그렇게 되기를 바라는 조금 더 힘이 빠진 말투입니다.' },
      { t: 'h', text: '남의 바람을 전할 때는 고 싶다를 못 쓴다' },
      { t: 'p', text: '「-고 싶다」는 원래 내 마음에만 씁니다. 남의 마음을 그대로 전하려면 「-고 싶어 하다」로 바꿔야 합니다.' },
      { t: 'dlg', lines: ['A: 동생은 뭐 하고 싶대요?', 'B: 동생은 유학 가고 싶어 해요.'] },
      { t: 'p', text: '반면 「-았/었으면 좋겠다」는 남에 대한 바람에도 그대로 씁니다. 「동생이 잘됐으면 좋겠어요」처럼요.' },
      { t: 'h', text: '정리' },
      { t: 'list', ordered: false, items: ['**내가 직접** 할 수 있는 일 → -고 싶다', '**내 힘 밖**의 일, 결과를 바랄 때 → -았/었으면 좋겠다', '**남의 마음**을 전할 때는 -고 싶어 하다'] },
      { t: 'p', text: '바람을 나타내는 말은 문법보다 태도가 드러나는 자리라, 표현을 하나 바꾸는 것만으로도 말투가 꽤 달라집니다.' },
      { t: 'link', href: '/sentence/', title: '문법 표현 목록', note: '고 싶다·았으면 좋겠다 말고도 마음을 나타내는 표현들을 볼 수 있습니다' },
    ],
  },
  {
    id: 'neunde-three-ways',
    title: '-는데 하나로 세 가지를 한다',
    date: '2026-09-14',
    updated: '2026-09-14',
    tags: ['문법', '초급'],
    excerpt: '-는데 하나가 대조하고, 사정을 깔고, 말끝을 여는 세 가지 일을 다 합니다. 형태는 같아도 뒤에 무엇이 오느냐로 갈립니다.',
    blocks: [
      { t: 'p', text: '「-는데」는 한국어 대화에서 정말 자주 나오는데, 정작 뜻을 물으면 설명하기 어렵습니다. 그도 그럴 것이, 이 표현 하나가 세 가지 다른 일을 합니다.' },
      { t: 'h', text: '맞서는 내용을 이을 때' },
      { t: 'p', text: '가장 먼저 배우는 쓰임입니다. 「-지만」과 비슷한데, 「-지만」보다 훨씬 부드럽고 자연스럽게 들립니다.' },
      { t: 'quote', lines: ['값은 비싼데 맛있어요.', '값은 비싸지만 맛있어요.'] },
      { t: 'p', text: '뜻은 같지만 「-는데」 쪽이 대화에서 훨씬 많이 들립니다. 「-지만」은 어딘가 또박또박 설명하는 느낌이 남습니다.' },
      { t: 'gram', id: '27-4', note: '-지만과 나란히 놓고 말맛 차이를 예문으로 보세요' },
      { t: 'h', text: '본론 앞에 사정을 깔 때' },
      { t: 'p', text: '두 번째 쓰임은 맞서는 내용이 전혀 아닙니다. 본론을 꺼내기 전에 상황을 먼저 설명해 주는 것입니다.' },
      { t: 'ex', ko: '내일 시험이 있는데, 혹시 오늘 좀 일찍 끝낼 수 있을까요?', en: 'I have a test tomorrow, so could we finish a bit early today?' },
      { t: 'p', text: '여기서 「내일 시험이 있는데」는 뒤에 나올 부탁의 이유를 미리 깔아 주는 자리입니다. 한국어 대화는 본론으로 바로 들어가지 않고 이렇게 사정을 먼저 까는 경우가 많습니다.' },
      { t: 'gram', id: '37-1', note: '본론 앞에 상황을 까는 자리를 예문으로 보면 대화가 훨씬 자연스러워집니다' },
      { t: 'h', text: '말끝을 열어 둘 때' },
      { t: 'p', text: '세 번째는 문장을 아예 「-는데요」로 끝맺는 것입니다. 다 말하지 않고 여운을 남겨, 상대의 반응을 기다리는 말투입니다.' },
      { t: 'dlg', lines: ['A: 이거 누가 만들었어요?', 'B: 제가 만들었는데요.', 'A: 진짜 잘 만드셨네요.'] },
      { t: 'p', text: 'B의 대답이 「제가 만들었어요」였다면 그냥 사실 전달로 끝났을 것입니다. 「만들었는데요」로 끝맺으면서 상대가 어떻게 반응할지 살짝 기다리는 느낌이 남습니다.' },
      { t: 'gram', id: '45-2', note: '말끝을 열어 두는 이 쓰임을 따로 예문으로 봐 두면 대화체가 훨씬 자연스러워집니다' },
      { t: 'h', text: '그래서 셋을 어떻게 가르나' },
      { t: 'p', text: '문장이 끝나지 않고 뒤에 다른 말이 이어지면 첫 번째나 두 번째이고, 뜻으로 갈립니다. 문장이 「-는데요」로 뚝 끊기면 세 번째입니다.' },
      { t: 'list', ordered: false, items: ['뒤에 **맞서는 내용**이 오면 → 대조', '뒤에 **부탁·질문**이 오면 → 사정 깔기', '문장이 **거기서 끝나면** → 여운 남기기'] },
      { t: 'p', text: '셋 다 형태가 똑같아서 문법책만 봐서는 구분이 잘 안 붙습니다. 실제 대화나 드라마 대사에서 어떤 자리에 나오는지를 눈여겨보는 편이 빠릅니다.' },
      { t: 'link', href: '/compare/', title: '헷갈리는 표현 견주기', note: '비슷하게 생긴 표현들을 나란히 놓고 보는 목록입니다' },
    ],
  },
  {
    id: 'seyo-family',
    alt: 'seyo-family-english',
    title: '시키기, 말리기, 허락하기 — -세요 식구들',
    date: '2026-09-13',
    updated: '2026-09-13',
    tags: ['문법', '초급'],
    excerpt: '정중하게 시키는 말, 말리는 말, 허락하는 말, 막는 말 — 모양은 -세요에서 다 갈라져 나오지만 쓰는 자리는 전혀 다릅니다.',
    blocks: [
      { t: 'p', text: '한국어를 배우면 「-세요」부터 배웁니다. 그런데 정중하게 시키고, 말리고, 허락하고, 막는 말은 전부 다른 표현입니다. 모양이 비슷해서 자주 섞입니다.' },
      { t: 'p', text: '넷을 한자리에 모아 놓고 언제 쓰는지만 짚어 봅니다.' },
      { t: 'h', text: '하라고 할 때 — -세요' },
      { t: 'p', text: '정중하게 시키거나 권할 때 씁니다. 높임의 뜻도 함께 담겨서, 웃어른에게도 편하게 쓸 수 있습니다.' },
      { t: 'ex', ko: '여기에 이름을 써 주세요.', en: 'Please write your name here.' },
      { t: 'gram', id: '30-1', note: '가장 먼저 익히는 표현이지만 아래 셋과 나란히 보면 쓰임이 더 또렷해집니다' },
      { t: 'h', text: '하지 말라고 할 때 — -지 마세요' },
      { t: 'p', text: '「-세요」의 반대말이 「안 -세요」가 아니라 「-지 마세요」라는 점이 낯섭니다. 정중하게 말리는 말입니다.' },
      { t: 'ex', ko: '여기에 주차하지 마세요.', en: 'Please do not park here.' },
      { t: 'gram', id: '30-2', note: '-세요와 짝지어 보면 형태 차이가 바로 보입니다' },
      { t: 'h', text: '해도 괜찮다고 할 때 — -아/어도 되다' },
      { t: 'p', text: '허락하는 말입니다. 「-세요」와 달리 하라고 권하는 것이 아니라, 해도 괜찮다고 자리를 터 주는 것입니다.' },
      { t: 'quote', lines: ['여기 앉으세요. (앉으라고 권함)', '여기 앉아도 돼요. (앉아도 괜찮다고 허락)'] },
      { t: 'gram', id: '30-4', note: '권하는 말과 허락하는 말이 어떻게 다른지 예문으로 갈라 보세요' },
      { t: 'h', text: '그러면 안 된다고 막을 때 — -(으)면 안 되다' },
      { t: 'p', text: '「-지 마세요」보다 조금 더 단호하게, 규칙이나 원칙을 들어 막을 때 씁니다. 안내문이나 표지판에 자주 보입니다.' },
      { t: 'ex', ko: '수업 중에는 휴대폰을 쓰면 안 돼요.', en: 'You cannot use your phone during class.' },
      { t: 'gram', id: '30-5', note: '규칙을 들어 막는 자리를 지 마세요와 견주어 보면 말맛 차이가 보입니다' },
      { t: 'h', text: '표지판에서 만나는 이 네 식구' },
      { t: 'dlg', lines: ['A: 여기서 사진 찍어도 돼요?', 'B: 아니요, 여기서는 찍으면 안 돼요. 저쪽으로 가세요.'] },
      { t: 'p', text: '이 짧은 대화 안에 허락을 묻고(-아/어도 되다), 막고(-(으)면 안 되다), 다시 권하는(-세요) 말까지 다 들어 있습니다.' },
      { t: 'h', text: '정리' },
      { t: 'list', ordered: false, items: ['정중하게 **시키거나 권하면** → -세요', '정중하게 **말리면** → -지 마세요', '**허락하면** → -아/어도 되다', '규칙을 들어 **막으면** → -(으)면 안 되다'] },
      { t: 'link', href: '/course/grammar-core.html', title: 'Building Sentences 코스', note: '시제·부정·조사 같은 문장의 뼈대를 다루는 코스입니다' },
    ],
  },
  {
    id: 'an-vs-mot',
    alt: 'an-vs-mot-english',
    title: '안 하는지 못 하는지 — 부정 표현 구분',
    date: '2026-09-12',
    updated: '2026-09-12',
    tags: ['문법', '초급'],
    excerpt: '「안」은 내가 정해서 안 하는 것, 「못」은 하고 싶어도 안 되는 것입니다. 뜻은 비슷해도 상대가 듣는 느낌은 전혀 다릅니다.',
    blocks: [
      { t: 'p', text: '「저는 매운 걸 안 먹어요」와 「저는 매운 걸 못 먹어요」는 완전히 다른 뜻입니다. 앞은 안 먹기로 정한 것이고, 뒤는 먹고 싶어도 몸이 안 받는 것입니다.' },
      { t: 'p', text: '그런데 번역기는 둘 다 그냥 「I do not eat」으로 옮겨서, 배우는 사람은 이 차이를 스스로 알아채기 어렵습니다.' },
      { t: 'h', text: '안 — 내 뜻으로 안 한다' },
      { t: 'p', text: '「안」은 내가 선택해서 하지 않는다는 뜻입니다. 할 수는 있지만 하지 않기로 한 것입니다.' },
      { t: 'ex', ko: '저는 커피를 안 마셔요.', en: 'I do not drink coffee. (by choice)' },
      { t: 'gram', id: '25-2', note: '내 뜻으로 하지 않는다는 자리를 예문으로 보면 못과 갈립니다' },
      { t: 'h', text: '못 — 하고 싶어도 안 된다' },
      { t: 'p', text: '「못」은 내 뜻과 상관없이 할 수 없다는 뜻입니다. 능력이 없거나, 사정이 있거나, 몸이 안 따라 줄 때 씁니다.' },
      { t: 'ex', ko: '어제 너무 피곤해서 숙제를 못 했어요.', en: 'I could not do my homework because I was too tired.' },
      { t: 'gram', id: '25-3', note: '능력이나 사정 때문에 못 하는 자리를 따로 봐 두면 안과 안 섞입니다' },
      { t: 'h', text: '같은 동사, 다른 이유' },
      { t: 'quote', lines: ['저는 술을 안 마셔요. (마시고 싶지만 안 마시기로 함)', '저는 술을 못 마셔요. (몸이 술을 못 받음)'] },
      { t: 'p', text: '같은 「마시다」인데 안을 쓰면 「내 선택」, 못을 쓰면 「내 사정」으로 들립니다. 술자리에서 이 둘을 바꿔 말하면 상대가 오해하기 딱 좋습니다.' },
      { t: 'h', text: '낱말이 통째로 바뀌는 경우도 있다' },
      { t: 'p', text: '「안」이나 「못」을 그냥 못 붙이고 반대말이 아예 따로 있는 낱말도 있습니다. 「있다」의 반대는 「안 있다」가 아니라 「없다」입니다.' },
      { t: 'list', ordered: false, items: ['있다 ↔ 없다', '알다 ↔ 모르다'] },
      { t: 'gram', id: '25-1', note: '안·못을 못 붙이고 반대말이 따로 있는 낱말을 한자리에서 봅니다' },
      { t: 'h', text: '구분하는 법' },
      { t: 'p', text: '문장을 만들기 전에 스스로 물어보면 됩니다. **할 수 있는데 안 하는 건가, 하고 싶은데 안 되는 건가.** 앞이면 안, 뒤면 못입니다.' },
      { t: 'dlg', lines: ['A: 왜 전화 안 받았어요?', 'B: 회의 중이어서 못 받았어요.'] },
      { t: 'p', text: '이 대화에서 B가 「안 받았어요」라고 했다면 일부러 안 받았다는 뜻이 되어 버립니다. 못을 써야 사정이 있었다는 뜻이 정확히 전해집니다.' },
      { t: 'link', href: '/sentence/', title: '문법 표현 목록', note: '안·못 말고도 부정을 나타내는 표현들을 예문과 함께 볼 수 있습니다' },
    ],
  },
  {
    id: 'guessing-in-korean',
    title: '짐작해서 말하기 — 겠어요, 거예요, 것 같다',
    date: '2026-09-11',
    updated: '2026-09-11',
    tags: ['문법', '초급'],
    excerpt: '「겠어요」·「거예요」·「것 같다」는 모두 짐작을 나타내지만 무엇을 보고 짐작했느냐에 따라 갈립니다. 그 기준을 정리했습니다.',
    blocks: [
      { t: 'p', text: '「아마 오늘 덥겠어요」, 「오늘 더울 거예요」, 「오늘 더운 것 같아요」. 셋 다 한국어를 배우는 사람에게는 그냥 「아마 그럴 것이다」로 뭉뚱그려 외워집니다.' },
      { t: 'p', text: '그런데 한국 사람은 이 셋을 아무 데나 바꿔 쓰지 않습니다. **무엇을 보고 짐작했는지**에 따라 갈립니다.' },
      { t: 'h', text: '지금 보고 바로 말하면 겠어요' },
      { t: 'p', text: '「겠어요」는 눈앞에서 본 것에 바로 반응할 때 씁니다. 냄새를 맡고, 하늘을 보고, 표정을 보고 그 자리에서 짐작하는 말입니다.' },
      { t: 'ex', ko: '우와, 이 냄새 진짜 맛있겠어요.', en: 'Wow, that smells really good.' },
      { t: 'gram', id: '40-1', note: '지금 본 것에 바로 반응하는 자리를 예문으로 보면 감이 옵니다' },
      { t: 'h', text: '그런데 겠어요는 다짐할 때도 쓴다' },
      { t: 'p', text: '같은 「겠어요」가 「제가 하겠습니다」처럼 스스로 하겠다는 다짐으로도 쓰여서 헷갈립니다. 구분법은 하나입니다 — **주어가 나 자신이면 다짐, 남이나 상황이면 짐작**입니다.' },
      { t: 'quote', lines: ['제가 해 보겠습니다. (다짐)', '이 김치 맵겠어요. (짐작)'] },
      { t: 'gram', id: '36-1', note: '다짐으로 쓰는 자리를 짐작 자리와 나란히 보면 헷갈리지 않습니다' },
      { t: 'h', text: '미리 근거를 갖고 헤아리면 거예요' },
      { t: 'p', text: '「(으)ㄹ 거예요」는 지금 눈앞에 없어도 씁니다. 일기예보를 보고, 시간표를 보고, 이미 아는 정보로 미리 헤아릴 때 씁니다.' },
      { t: 'ex', ko: '일기예보 보니까 내일은 비가 올 거예요.', en: 'According to the forecast, it will rain tomorrow.' },
      { t: 'gram', id: '40-2', note: '근거를 두고 미리 헤아리는 자리를 예문으로 확인해 보세요' },
      { t: 'h', text: '확신이 없을 때는 것 같다' },
      { t: 'p', text: '「것 같다」는 셋 중 가장 조심스럽습니다. 확신이 없을 때는 물론이고, 확신이 있어도 부드럽게 말하려고 일부러 씁니다.' },
      { t: 'p', text: '그래서 한국 사람은 자기 감정을 말할 때도 「기쁜 것 같아요」처럼 말할 때가 있습니다. 단정 짓지 않고 한 발 물러서는 말투입니다.' },
      { t: 'dlg', lines: ['A: 이 옷 저한테 어때요?', 'B: 음, 좀 큰 것 같아요.'] },
      { t: 'gram', id: '40-4', note: '가장 조심스러운 말투라 실제 대화에 제일 많이 나옵니다' },
      { t: 'h', text: '정리' },
      { t: 'list', ordered: false, items: ['**지금 보고** 바로 반응하면 → 겠어요', '**근거를 두고** 미리 헤아리면 → (으)ㄹ 거예요', '**확신 없이** 부드럽게 말하면 → 것 같다', '셋 다 헷갈리면 것 같다가 가장 무난합니다'] },
      { t: 'p', text: '셋의 뜻은 사전에 다 「추측」이라고만 나와서 글로는 안 잡힙니다. 표현마다 예문을 몇 개씩 직접 써 보면서 몸에 익히는 편이 빠릅니다.' },
      { t: 'link', href: '/sentence/', title: '문법 표현 목록', note: '표현마다 예문을 직접 써 보고 확인받을 수 있습니다' },
    ],
  },
  {
    id: 'why-in-korean-aseo-nikka',
    alt: 'why-in-korean-aseo-nikka-english',
    title: '이유를 말하는 세 가지 — 아/어서, (으)니까, 때문에',
    date: '2026-09-10',
    updated: '2026-09-10',
    tags: ['문법', '초급'],
    excerpt: '셋 다 「때문에」로 번역되는데 아무 데나 바꿔 쓰면 어색해집니다. 뒤에 무슨 말이 오느냐만 보면 거의 갈립니다.',
    blocks: [
      { t: 'p', text: '「늦어서 죄송합니다」와 「늦었으니까 죄송합니다」. 앞은 자연스럽고 뒤는 어색합니다. 그런데 사전을 찾으면 둘 다 이유를 나타낸다고 나옵니다.' },
      { t: 'p', text: '이유 표현이 헷갈리는 것은 뜻이 비슷해서가 아니라, **뜻은 같은데 뒤에 올 수 있는 말이 다르기** 때문입니다. 그래서 뜻을 아무리 외워도 안 풀립니다.' },
      { t: 'h', text: '뒤에 부탁이나 명령이 오면 (으)니까' },
      { t: 'p', text: '이것 하나가 셋을 가르는 가장 굵은 선입니다. 뒤에 「-세요」, 「-읍시다」, 「-지 마세요」가 오면 -아/어서는 못 씁니다.' },
      { t: 'quote', lines: ['비가 오니까 우산을 가져가세요. (○)', '비가 와서 우산을 가져가세요. (×)'] },
      { t: 'p', text: '그래서 길에서 듣는 말, 가게에서 듣는 말은 거의 (으)니까입니다. 「위험하니까 뒤로 물러나 주세요」처럼요.' },
      { t: 'gram', id: '32-2', note: '부탁·권유·명령 앞에서 쓰는 자리를 예문으로 보면 빨리 붙습니다' },
      { t: 'h', text: '사과하고 감사할 때는 아/어서' },
      { t: 'p', text: '반대로 이 자리에서는 (으)니까가 어색합니다. 사과와 감사는 정해진 말투가 있어서, 여기서 (으)니까를 쓰면 따지는 것처럼 들립니다.' },
      { t: 'ex', ko: '늦어서 죄송합니다.', en: 'Sorry for being late.' },
      { t: 'ex', ko: '도와주셔서 감사합니다.', en: 'Thank you for helping me.' },
      { t: 'p', text: '이 두 문장은 통째로 외워 두는 편이 낫습니다. 한국에서 하루에 몇 번씩 쓰는 말인데, 여기서 틀리면 바로 티가 납니다.' },
      { t: 'gram', id: '32-1', note: '가장 먼저 익힐 이유 표현입니다. 예문부터 보세요' },
      { t: 'h', text: '글에서 원인을 짚을 때는 때문에' },
      { t: 'p', text: '때문에는 셋 중 가장 딱딱합니다. 그래서 말할 때보다 글에서 훨씬 자주 보입니다. 뉴스, 보고서, TOPIK 읽기 지문에서 만나는 것이 대부분 이것입니다.' },
      { t: 'quote', lines: ['눈 때문에 길이 막혔습니다.', '값이 올랐기 때문에 사람들이 덜 삽니다.'] },
      { t: 'note', title: '자주 하는 실수', text: '「저 때문에」는 되는데 「저이기 때문에」는 안 됩니다. 명사 뒤에는 **때문에**, 동사·형용사 뒤에는 **-기 때문에**입니다. 「이다」가 낄 자리가 아닙니다.' },
      { t: 'gram', id: '32-3', note: 'TOPIK 읽기에서 자주 나오는 꼴이라 형태를 눈에 익혀 두면 좋습니다' },
      { t: 'h', text: '실제로는 이렇게 섞여 나옵니다' },
      { t: 'dlg', lines: ['A: 오늘 왜 이렇게 늦었어요?', 'B: 길이 너무 막혀서요. 눈 때문에 버스가 안 왔어요.', 'A: 그럼 다음부터는 좀 일찍 나오세요.', 'B: 네, 늦어서 죄송합니다.'] },
      { t: 'p', text: '짧은 대화 하나에 셋이 다 들어 있습니다. 이유를 대는 자리에는 -아/어서, 원인을 짚는 자리에는 때문에, 사과에는 다시 -아/어서입니다.' },
      { t: 'h', text: '정리' },
      { t: 'list', items: ['뒤에 **부탁·권유·명령**이 오면 → (으)니까', '**사과·감사**는 → 아/어서', '**글에서 원인**을 짚으면 → 때문에', '헷갈리면 (으)니까가 가장 덜 어색합니다. 다만 사과에는 쓰지 마세요'], ordered: false },
      { t: 'p', text: '규칙을 알아도 문장이 바로 나오지는 않습니다. 표현마다 자기 문장을 써서 확인받는 칸이 있으니, 위 세 가지로 각각 한 문장씩 써 보는 것이 가장 빠릅니다.' },
      { t: 'link', href: '/compare/32.html', title: '이유와 원인을 나타낼 때 — 세 표현 견주기', note: '셋을 한 쪽에 놓고 형태와 주의할 점을 나란히 봅니다' },
    ],
  },
  {
    id: 'eun-neun-vs-i-ga',
    alt: 'eun-neun-vs-i-ga-english',
    title: '은/는과 이/가 — 규칙 열 개 대신 질문 하나',
    date: '2026-09-10',
    updated: '2026-09-10',
    tags: ['문법', '초급'],
    excerpt: '한국어를 몇 년 한 사람도 끝까지 헷갈리는 자리입니다. 외울 규칙을 늘리는 대신, 문장을 쓸 때마다 스스로에게 던질 질문 하나로 정리했습니다.',
    body:
      '<p>「저는 학생이에요」와 「제가 학생이에요」는 둘 다 맞는 문장인데 뜻이 다릅니다. ' +
      '이걸 설명해 달라는 질문을 가장 많이 받습니다. 그리고 대부분의 설명이 규칙을 열 개쯤 ' +
      '늘어놓고 끝납니다 — 외울 것이 늘어날 뿐, 막상 문장을 쓸 때는 도움이 안 됩니다.</p>' +
      '<p>규칙 대신 질문 하나로 시작하는 편이 낫습니다.</p>' +

      '<blockquote>지금 이 말을 처음 꺼내는 건가, 아니면 아까부터 하던 얘기인가?</blockquote>' +

      '<h2>처음 꺼내면 이/가, 하던 얘기면 은/는</h2>' +
      '<p>옛날이야기의 첫 두 문장이 이 규칙을 가장 깔끔하게 보여 줍니다.</p>' +
      '<blockquote>옛날에 한 할아버지<b>가</b> 살았습니다.<br>' +
      '그 할아버지<b>는</b> 매일 산에 나무를 하러 갔습니다.</blockquote>' +
      '<p>첫 문장에서 할아버지는 처음 등장합니다 — 이/가. 두 번째 문장부터는 이미 아는 사람이 ' +
      '됐습니다 — 은/는. 순서를 바꿔 「옛날에 한 할아버지는 살았습니다」라고 하면 어색한데, ' +
      '듣는 사람이 모르는 할아버지를 이미 아는 것처럼 말하기 때문입니다.</p>' +
      '<p>그래서 자기소개는 「저<b>는</b> 학생이에요」입니다. 「저」는 지금 마주 보고 있는 사람이라 ' +
      '새로 꺼낼 것이 없으니까요. 반대로 「제<b>가</b> 학생이에요」는 「(그 학생이 누구냐면) 저예요」에 ' +
      '가깝습니다. 누가 학생인지 묻는 자리가 아니면 이상하게 들립니다.</p>' +

      '<h2>묻는 말이 답을 정해 준다</h2>' +
      '<p>이 규칙이 눈에 보이는 자리가 의문사입니다.</p>' +
      '<blockquote>누<b>가</b> 왔어요? — 제임스<b>가</b> 왔어요.<br>' +
      '제임스<b>는</b> 왔어요? — 네, 제임스<b>는</b> 왔어요.</blockquote>' +
      '<p>「누가」는 모르는 것을 묻는 자리라 이/가가 붙고, 답도 그 자리를 그대로 채우므로 ' +
      '이/가입니다. 「제임스는 왔어요?」는 이미 제임스 얘기를 하고 있을 때 — 왔는지 안 왔는지만 ' +
      '묻는 것입니다. 「누가 왔어요?」에 「제임스는 왔어요」라고 답하면 묻지도 않은 다른 사람 ' +
      '얘기를 꺼내는 느낌이 됩니다.</p>' +

      '<h2>은/는은 「말하자면」에 가깝다</h2>' +
      '<p>은/는이 붙으면 그 앞말이 「~로 말하자면」으로 바뀐다고 생각하면 대조가 저절로 ' +
      '풀립니다.</p>' +
      '<blockquote>커피<b>는</b> 좋아하는데 우유<b>는</b> 싫어해요.</blockquote>' +
      '<p>「커피로 말하자면 좋아하고, 우유로 말하자면 싫어한다」. 둘을 견주고 있으니 양쪽 다 ' +
      '은/는입니다. 여기에 이/가를 쓰면 비교하던 흐름이 끊깁니다.</p>' +
      '<p>말하지 않은 쪽까지 딸려 오는 것도 은/는입니다. 「저는 김치<b>는</b> 먹어요」라고 하면 ' +
      '듣는 사람은 「그럼 못 먹는 게 따로 있구나」로 알아듣습니다. 그럴 뜻이 아니었다면 ' +
      '「김치<b>를</b> 먹어요」라고 해야 합니다 — 이건 실제로 학습자가 자주 겪는 오해입니다.</p>' +

      '<h2>문장 속의 문장에는 은/는이 못 들어간다</h2>' +
      '<p>여기서부터는 취향이 아니라 규칙입니다. 명사를 꾸미는 자리(관형절) 안의 주어는 ' +
      '반드시 이/가입니다.</p>' +
      '<blockquote>제<b>가</b> 만든 음식 (○)<br>저<b>는</b> 만든 음식 (×)</blockquote>' +
      '<p>「제가 좋아하는 노래」, 「비<b>가</b> 오는 날」, 「사람<b>이</b> 많은 곳」 — 전부 같은 ' +
      '자리입니다. 문장이 길어지기 시작하면 이 규칙이 자주 걸리는데, 규칙이 어려워서가 아니라 ' +
      '「저는」으로 문장을 시작하는 버릇이 관형절 안까지 따라 들어가기 때문입니다.</p>' +

      '<h2>정리하면</h2>' +
      '<ul>' +
      '<li>처음 꺼내는 것 · 의문사 자리와 그 답 · 관형절 안의 주어 → <b>이/가</b></li>' +
      '<li>이미 하던 얘기 · 대조 · 「~로 말하자면」 → <b>은/는</b></li>' +
      '<li>말하지 않은 쪽까지 딸려 오게 하고 싶지 않다면 은/는을 피한다</li>' +
      '</ul>' +
      '<p>그래도 규칙을 다 안다고 문장이 바로 나오지는 않습니다. 이 자리는 읽어서 아는 것과 ' +
      '써서 아는 것의 차이가 유난히 큽니다. 이 사이트에는 ' +
      '<a href="/sentence/26-1.html">N이/가</a>와 <a href="/sentence/26-2.html">N은/는</a> 쪽이 ' +
      '따로 있고, 두 표현을 <a href="/compare/26.html">조사 20가지</a> 안에서 나란히 견줘 볼 수도 ' +
      '있습니다. 문장을 직접 써서 확인받고 싶으면 ' +
      '<a href="/course/bg-04.html">「이/가 와 은/는 가려 쓰기」</a> 코스에 그 연습이 두 레슨 ' +
      '들어 있습니다.</p>',
  },

  {
    id: 'read-hangul-in-a-morning',
    alt: 'read-hangul-in-a-morning-english',
    title: '한글은 정말 한나절이면 읽나',
    date: '2026-09-09',
    updated: '2026-09-09',
    tags: ['한글', '초급'],
    excerpt: '「한글은 하루면 뗀다」는 말은 과장이 아닙니다. 다만 정확히 무엇이 하루 만에 되는지, 무엇은 안 되는지는 나눠서 말해야 합니다.',
    body:
      '<p>한국어를 배우려고 검색하면 「한글은 하루면 뗀다」는 말을 꼭 만납니다. 반은 맞고 반은 ' +
      '오해를 부르는 말입니다. 무엇이 하루 만에 되고 무엇은 안 되는지 나눠서 적어 봅니다.</p>' +

      '<h2>왜 빠른가 — 자연히 생긴 글자가 아니라서</h2>' +
      '<p>세상 글자 대부분은 그림에서 조금씩 닳아 만들어졌습니다. 그래서 왜 이 모양인지 설명할 ' +
      '방법이 없고, 결국 통째로 외웁니다. 한글은 다릅니다. 1443년에 만들어져 1446년에 반포된, ' +
      '만든 사람과 만든 이유가 남아 있는 글자입니다. 그리고 그 이유가 「배우기 쉬울 것」이었습니다.</p>' +
      '<p>그 결과가 글자 모양에 그대로 남아 있습니다.</p>' +
      '<ul>' +
      '<li><b>기본 자음 다섯 개는 소리 내는 몸의 모양</b>입니다. ㄱ은 혀뿌리가 목구멍을 막는 모양, ' +
      'ㄴ은 혀끝이 윗잇몸에 닿는 모양, ㅁ은 입, ㅅ은 이, ㅇ은 목구멍입니다.</li>' +
      '<li><b>획을 하나 더하면 소리가 세집니다.</b> ㄱ→ㅋ, ㄴ→ㄷ→ㅌ, ㅁ→ㅂ→ㅍ, ㅅ→ㅈ→ㅊ. ' +
      '새 글자를 외우는 게 아니라 아는 글자에 줄을 하나 긋는 것입니다.</li>' +
      '<li><b>겹쳐 쓰면 된소리입니다.</b> ㄲ ㄸ ㅃ ㅆ ㅉ — 이건 규칙이랄 것도 없습니다.</li>' +
      '<li><b>모음은 점과 선의 조합</b>입니다. ㅣ와 ㅡ에 점을 어디에 찍느냐로 ㅏ ㅓ ㅗ ㅜ가 갈리고, ' +
      '점을 하나 더 찍으면 y 소리가 붙어 ㅑ ㅕ ㅛ ㅠ가 됩니다.</li>' +
      '</ul>' +
      '<p>그래서 실제로 외우는 것은 마흔 개가 아니라 <b>기본 몇 개와 규칙 두어 개</b>입니다. 한나절이라는 ' +
      '말이 나오는 이유가 이것입니다.</p>' +

      '<h2>네모 한 칸에 모아 쓴다</h2>' +
      '<p>낱자를 알파벳처럼 옆으로 늘어놓지 않고 한 칸에 모읍니다. ㅎ+ㅏ+ㄴ 이 「한」이 되는 ' +
      '식입니다. 자음+모음이면 두 자리, 받침까지 있으면 세 자리로 앉습니다.</p>' +
      '<p>처음에는 이게 어려워 보이는데, 오히려 읽기를 쉽게 만드는 쪽입니다. 글자 한 칸이 소리 한 ' +
      '덩어리라, 어디서 끊어 읽어야 할지 눈으로 바로 보입니다.</p>' +

      '<h2>하루 만에 안 되는 것</h2>' +
      '<p>여기가 정직하게 말해야 할 자리입니다. 글자를 다 익혀도 <b>쓰인 대로 소리 나지 않는 ' +
      '자리</b>가 남습니다.</p>' +
      '<ul>' +
      '<li>받침이 뒤 글자로 넘어갑니다 — 「한국어」는 [한구거]</li>' +
      '<li>ㅎ이 약해지거나 사라집니다 — 「좋아요」는 [조아요]</li>' +
      '<li>옆 소리에 끌려 바뀝니다 — 「신라」는 [실라], 「학년」은 [항년]</li>' +
      '</ul>' +
      '<p>이건 하루에 안 됩니다. 몇 주에 걸쳐 귀로 익는 쪽에 가깝습니다. 다만 <b>글자를 소리로 ' +
      '바꾸는 것 자체</b>는 정말로 한나절이면 됩니다 — 소리 규칙을 아직 몰라도 간판과 메뉴판은 ' +
      '읽힙니다. 읽기 시작하면 그다음부터는 눈에 들어오는 한국어의 양이 달라집니다.</p>' +

      '<h2>그리고 읽는 것과 아는 것은 다르다</h2>' +
      '<p>한글을 뗐다고 한국어를 아는 것은 아닙니다. 「아메리카노」를 읽을 수 있게 된 것과 ' +
      '카페에서 주문할 수 있게 된 것은 다른 일입니다. 이 말을 굳이 적는 이유는, 한글을 하루 만에 ' +
      '떼고 나서 「생각보다 한국어가 안 늘었다」고 실망하는 경우가 흔하기 때문입니다. 실망할 일이 ' +
      '아니라 원래 그 둘이 다른 단계입니다.</p>' +

      '<h2>해 보려면</h2>' +
      '<p>이 사이트의 <a href="/course/hangul.html">Read Korean</a> 코스가 딱 이 한나절을 ' +
      '레슨 열 개로 나눠 놓은 것입니다. 위에 적은 순서 그대로 — 왜 이런 글자인지에서 시작해 ' +
      '모음 여섯, 모아쓰기, 자음 더하기, 획 더하기, 된소리, 받침, 소리 나는 대로 안 읽히는 자리까지 ' +
      '가고, 마지막 두 레슨은 진짜 한국어를 읽어 보는 것입니다. 회원가입도 설치도 없습니다.</p>' +
      '<p>다 읽을 수 있게 되면 <a href="/course/first-words.html">First Words</a>로 넘어가면 ' +
      '됩니다 — 인사말과 주문, 길 묻기처럼 당장 쓰는 말부터 나옵니다.</p>',
  },

  {
    id: 'which-topik-level-do-you-need',
    alt: 'which-topik-level-do-you-need-english',
    title: 'TOPIK, 몇 급이 필요한지부터 정하기',
    date: '2026-09-08',
    updated: '2026-09-08',
    tags: ['TOPIK', '준비'],
    excerpt: '급수를 골라서 시험을 보는 게 아닙니다. 시험 종류를 고르면 점수에 따라 급수가 나옵니다. 이 구조를 알고 목표를 정해야 공부가 끝납니다.',
    body:
      '<p>「한국어를 잘하고 싶다」는 목표는 끝나지 않습니다. 어디까지 가야 끝인지가 없기 ' +
      '때문입니다. TOPIK 급수를 목표로 삼으면 적어도 끝이 생깁니다 — 그래서 시험을 볼 생각이 ' +
      '없더라도 급수 구조는 알아 두는 편이 좋습니다.</p>' +

      '<h2>급수를 고르는 게 아니라 시험을 고른다</h2>' +
      '<p>가장 많이 하는 오해입니다. 원서를 낼 때 「3급 시험」을 신청하는 것이 아닙니다. ' +
      '시험은 두 종류뿐입니다.</p>' +
      '<ul>' +
      '<li><b>TOPIK I</b> — 듣기 30문항 + 읽기 40문항. 여기서 나오는 급수가 1급 또는 2급입니다.</li>' +
      '<li><b>TOPIK II</b> — 듣기 50문항 + 쓰기 4문항 + 읽기 50문항. 3급부터 6급까지 나옵니다.</li>' +
      '</ul>' +
      '<p>즉 <b>점수를 받으면 그 점수에 해당하는 급수가 따라옵니다.</b> TOPIK I 에는 쓰기가 없고, ' +
      '쓰기는 TOPIK II 에만 있습니다. 이 사이트가 TOPIK I 에 쓰기 연습을 안 두는 것도 실제 시험이 ' +
      '그렇기 때문입니다.</p>' +
      '<p>커트라인은 오랫동안 크게 바뀌지 않았지만, 제도와 회차 안내는 바뀔 수 있습니다. ' +
      '접수 전에 <a href="https://www.topik.go.kr">공식 안내</a>에서 그해 기준을 한 번 확인하세요 — ' +
      '이 글을 포함해 남이 정리해 둔 숫자를 그대로 믿을 자리가 아닙니다.</p>' +

      '<h2>어디에 몇 급이 필요한가</h2>' +
      '<p>여기서 딱 잘라 말할 수 있으면 좋겠지만, 정직한 답은 <b>지원하려는 곳의 모집요강이 ' +
      '유일한 기준</b>이라는 것입니다. 학교마다, 전공마다, 회사마다 다릅니다. 대체로 이런 ' +
      '언저리에서 이야기가 오갑니다.</p>' +
      '<ul>' +
      '<li><b>학부 입학</b> — 3급을 최소로 두고 4급을 요구하는 곳이 많습니다.</li>' +
      '<li><b>졸업 요건</b> — 입학보다 한 급 위를 요구하는 경우가 흔합니다. 입학 3급, 졸업 4급 식입니다.</li>' +
      '<li><b>대학원</b> — 4~5급 언저리. 전공에 따라 더 높기도 합니다.</li>' +
      '<li><b>취업</b> — 업무에 한국어를 쓰는 자리라면 대체로 4급 이상을 봅니다.</li>' +
      '<li><b>비자·체류 관련</b> — 점수가 반영되는 제도가 있지만 <b>자주 바뀝니다.</b> 여기서 정리해 ' +
      '드리지 않는 이유가 그것입니다. 반드시 그 시점의 공식 안내로 확인하세요.</li>' +
      '</ul>' +
      '<p>목표가 안 잡히면 <b>4급</b>을 잠정 목표로 두는 것이 무난합니다. 요구 기준으로 가장 자주 ' +
      '등장하는 급수이고, 4급이면 일상과 업무의 기본은 넘어갑니다.</p>' +

      '<h2>급수별로 실제로 뭘 해야 하나</h2>' +
      '<ul>' +
      '<li><b>1~2급</b> — 한글을 읽고, 인사·주문·길 묻기 같은 자리를 넘깁니다. 문법은 시제·부정·조사 ' +
      '같은 뼈대입니다. 한글부터 시작해도 몇 달 안에 닿는 구간입니다.</li>' +
      '<li><b>3~4급</b> — 여기가 대부분의 목표이자 가장 많이 멈추는 구간입니다. 문법 표현을 아는 데서 ' +
      '<b>쓸 수 있는 데</b>로 넘어가야 합니다. 「-는 바람에」를 읽고 알아보는 것과 그 표현으로 문장을 ' +
      '만드는 것은 다릅니다.</li>' +
      '<li><b>5~6급</b> — 어휘의 폭과 글의 논리입니다. 특히 쓰기 53·54번에서 갈립니다. 문법이 맞는 ' +
      '것만으로는 부족하고 주장과 근거가 서야 합니다.</li>' +
      '</ul>' +

      '<h2>이 사이트에 있는 것</h2>' +
      '<p>연습 문항이 512개 있습니다. TOPIK I 은 듣기 26·읽기 209, TOPIK II 는 듣기 19·읽기 200· ' +
      '쓰기 58입니다. <b>기출문제가 아니라 같은 유형으로 새로 만든 창작 문항</b>이고, TOPIK 을 ' +
      '주관하는 국립국제교육원과 아무 관계가 없습니다 — 이건 분명히 밝혀 둡니다.</p>' +
      '<p>대신 문항마다 왜 그 답인지 해설이 붙어 있고, 쓰기는 모범답안과 채점 포인트, 흔한 감점 ' +
      '요인까지 같이 봅니다. 시계와 답안지가 붙은 모의고사 형태로도 풀 수 있습니다.</p>' +
      '<ul>' +
      '<li><a href="/topik-reading/">읽기 연습 문항</a></li>' +
      '<li><a href="/topik-listening/">듣기 연습 문항</a></li>' +
      '<li><a href="/topik-writing/">쓰기 연습 문항</a> — 51~54번 유형</li>' +
      '</ul>' +
      '<p>목표 급수를 정하고 나면 남은 건 유형에 익숙해지는 일입니다. 시험은 한국어 실력만 재는 게 ' +
      '아니라 <b>정해진 시간 안에 정해진 형식을 처리하는 일</b>이기도 해서, 그 부분은 따로 연습하면 ' +
      '확실히 줄어듭니다.</p>',
  },

  {
    id: 'when-to-use-banmal',
    alt: 'when-to-use-banmal-english',
    title: '존댓말과 반말 — 교재가 잘 안 알려 주는 부분',
    date: '2026-09-07',
    updated: '2026-09-07',
    tags: ['문법', '회화'],
    excerpt: '교재는 해요체만 가르치고 끝납니다. 실제로는 상대마다 말투를 갈라 써야 하고, 여기서 나오는 실수는 문법 실수보다 크게 남습니다.',
    body:
      '<p>한국어 교재는 대개 「-아요/어요」로 시작해서 「-아요/어요」로 끝납니다. 그러다 한국 ' +
      '드라마를 보면 아무도 그렇게만 말하지 않고, 실제로 사람을 만나면 언제 말을 놓아야 하는지 ' +
      '알 수가 없습니다. 이 글은 그 사이의 이야기입니다.</p>' +

      '<h2>먼저, 안전한 답</h2>' +
      '<p><b>해요체 하나면 거의 다 됩니다.</b> 과하게 딱딱하지도, 무례하지도 않습니다. 처음 배우는 ' +
      '사람이 굳이 다른 말투를 서둘러 익힐 이유는 없습니다. 아래 이야기는 「그다음」에 대한 ' +
      '것입니다.</p>' +

      '<h2>말투는 크게 넷</h2>' +
      '<ul>' +
      '<li><b>합쇼체</b>(-습니다/-십니까) — 발표, 뉴스, 처음 뵙는 자리, 손님을 맞는 자리</li>' +
      '<li><b>해요체</b>(-아요/어요) — 일상 대부분</li>' +
      '<li><b>해체 = 반말</b>(-아/어) — 친구, 아랫사람, 가족</li>' +
      '<li><b>해라체</b>(-(느)ㄴ다) — 사람에게 말할 때가 아니라 <b>글에 쓰는 말투</b>입니다. 신문, 논문, 책</li>' +
      '</ul>' +
      '<p>마지막 것이 특히 오해를 삽니다. 「-(느)ㄴ다」는 반말이 아니라 <b>글말</b>입니다. 이걸 모르고 ' +
      '읽으면 신문이 독자에게 반말하는 것처럼 보입니다.</p>' +

      '<h2>가장 중요한 것 — 말투와 높임은 다른 축이다</h2>' +
      '<p>여기가 학습자가 가장 오래 헷갈리는 자리입니다. <b>누구에게 말하느냐</b>(말투)와 ' +
      '<b>문장 속 주어가 누구냐</b>(-(으)시-)는 서로 다른 문제입니다.</p>' +
      '<blockquote>동생이 집에 <b>가요</b>. (해요체, 높임 없음)<br>' +
      '할머니께서 집에 <b>가세요</b>. (해요체 + -(으)시-)</blockquote>' +
      '<p>둘 다 듣는 사람에게는 똑같이 해요체로 말하고 있습니다. 달라진 것은 문장 안의 주어가 ' +
      '웃어른이냐 아니냐입니다. 그래서 친구에게 반말로 말하면서도 할머니 얘기를 할 때는 ' +
      '「할머니 주무셔」처럼 -(으)시-가 들어갑니다.</p>' +
      '<p>몇몇 낱말은 아예 통째로 바뀝니다.</p>' +
      '<ul>' +
      '<li>먹다 → 드시다 · 잡수시다</li>' +
      '<li>있다 → 계시다</li>' +
      '<li>자다 → 주무시다</li>' +
      '<li>말하다 → 말씀하시다</li>' +
      '<li>주다 → 드리다 (내가 웃어른에게 줄 때)</li>' +
      '</ul>' +

      '<h2>반말은 언제 쓰나</h2>' +
      '<p>규칙보다 기준 하나를 기억하는 편이 낫습니다. <b>확실하지 않으면 존댓말</b>입니다. ' +
      '존댓말로 실수하면 「좀 딱딱한 사람」에서 끝나지만, 반말로 실수하면 관계가 상합니다. 두 실수의 ' +
      '값이 전혀 다릅니다.</p>' +
      '<p>반말로 넘어가도 되는 자리는 대체로 이렇습니다.</p>' +
      '<ul>' +
      '<li>상대가 먼저 「말 놓으세요」라고 했을 때 — 이게 가장 확실합니다</li>' +
      '<li>확실히 나이나 지위가 아래이면서 이미 친해진 사이</li>' +
      '<li>아이에게</li>' +
      '</ul>' +
      '<p>나이가 같아도 처음 만나면 존댓말로 시작합니다. 한국에서 처음 만난 사람에게 나이를 묻는 ' +
      '것이 무례가 아닌 이유도 여기에 있습니다 — 말투를 정하려면 필요한 정보라서 그렇습니다. ' +
      '그리고 한쪽만 말을 놓는 것은 어색하니, 넘어갈 때는 대개 서로 확인하고 같이 넘어갑니다.</p>' +

      '<h2>시험에서는 또 다르다</h2>' +
      '<p>TOPIK II 쓰기 53·54번은 <b>글말(-(느)ㄴ다)로 써야 합니다.</b> 「-습니다」로 쓰면 감점입니다. ' +
      '말하기에서 안전했던 습관이 시험에서는 그대로 감점 요인이 되는 셈입니다. 실제로 흔한 ' +
      '실수라, 이 사이트의 <a href="/topik-writing/">쓰기 연습 문항</a>에는 문항마다 감점 요인을 ' +
      '따로 적어 두었습니다.</p>' +

      '<h2>연습할 곳</h2>' +
      '<ul>' +
      '<li><a href="/course/bg-d-03.html">존댓말 -(으)시- 사람에 맞게 바꾸기</a> — 같은 문장을 ' +
      '주어만 바꿔 다시 써 보는 레슨 세 개</li>' +
      '<li><a href="/course/ad-02-01.html">격식·비격식 화법 4단계 매칭</a> — 회의·술자리·사설처럼 ' +
      '상황을 주고 말투를 고릅니다</li>' +
      '<li><a href="/compare/50.html">서술체와 반말체</a> — <a href="/sentence/50-1.html">-(느)ㄴ다</a>와 ' +
      '<a href="/sentence/50-2.html">반말체</a>를 나란히 놓고 봅니다</li>' +
      '</ul>' +
      '<p>말투는 문법처럼 맞고 틀리고가 아니라 관계를 드러내는 장치라, 규칙만 외워서는 잘 안 ' +
      '붙습니다. 드라마나 예능을 볼 때 <b>누가 누구에게 어떤 말투를 쓰는지</b>를 한 번씩 짚어 보면 ' +
      '생각보다 빨리 감이 옵니다.</p>',
  },

  {
    id: 'topik-6-for-free',
    alt: 'topik-6-for-free-english',
    title: 'TOPIK 6급까지, 무료로 준비하는 법',
    date: '2026-09-06',
    updated: '2026-09-10',
    tags: ['TOPIK', '준비'],
    excerpt: '학원비도 교재값도 없이 한글부터 TOPIK 6급 수준까지 준비하는 방법을 정리했습니다. 광고가 아니라, 이 사이트에 실제로 있는 것만 순서대로 썼습니다.',
    body:
      '<p>TOPIK 준비 학원 한 달 수강료가 몇십만 원인 경우가 흔합니다. 급수마다 교재도 따로 사야 하고요. ' +
      '그런데 한글부터 TOPIK 6급 수준까지, 돈 한 푼 안 들이고 준비하는 게 실제로 가능합니다. ' +
      '이 글은 광고가 아니라, 저희가 만들고 있는 사이트(치즈감자)에 실제로 있는 것만 순서대로 정리한 안내입니다.</p>' +

      '<h2>1단계 — 한글부터 문장까지</h2>' +
      '<p>한글을 하나도 모른다면 「Read Korean」 코스부터 시작합니다. 한글은 원래 한나절이면 읽을 수 있도록 ' +
      '설계된 글자라, 이 코스도 그 전제로 만들어졌습니다. 이어서 인사말·주문·길찾기 같은 생존 표현을 다루는 ' +
      '「First Words」, 그다음 시제·부정·조사처럼 문장을 실제로 만드는 원리를 다루는 「Building Sentences」로 ' +
      '넘어갑니다.</p>' +
      '<p>지금 초급·중급·고급을 합쳐 코스 21개, 레슨 82개가 있습니다. 꼭 순서대로 풀 필요는 없습니다 — ' +
      '이미 말은 하는데 문법만 정리하러 오는 사람도 있으니까요.</p>' +

      '<h2>2단계 — 문법을 표현으로 익히기</h2>' +
      '<p>단순 암기만으로는 급수가 올라갈수록 한계가 옵니다. 「예문 만들기」에는 문법 표현 290개가 있고, ' +
      '표현마다 뜻풀이·예문·대화문이 붙어 있습니다. 그리고 그 표현으로 직접 문장을 써 보고 확인받는 칸이 있어요 ' +
      '— 읽기만 하고 넘어가지 않게 만든 구조입니다.</p>' +

      '<h2>3단계 — 실전 유형으로 훈련하기</h2>' +
      '<p>TOPIK I·II의 읽기·듣기·쓰기 연습 문항이 512개 있습니다. <b>기출문제가 아니라 같은 유형으로 새로 ' +
      '만든 창작 문항</b>입니다 — 이 부분은 정직하게 밝혀 둡니다. 대신 문항마다 왜 그 답인지 설명이 붙어 있고, ' +
      '쓰기는 모범답안과 채점 포인트까지 같이 봅니다. 시간을 재는 모의고사 형태로도 풀 수 있습니다.</p>' +

      '<h2>4단계 — 단어는 매일 조금씩</h2>' +
      '<p>국립국어원 뜻풀이를 담은 사전에 낱말 5,346개가 있고, 공부하다 모르는 낱말을 누르면 바로 뜻이 ' +
      '나옵니다. 외워야 할 단어는 내 단어장에 담아 두면 간격을 두고 다시 물어보는 복습 알림이 옵니다 — 한 번에 ' +
      '몰아서 외우고 잊어버리는 대신, 잊을 때쯤 다시 보게 하는 방식입니다.</p>' +

      '<h2>제일 어려운 건 꾸준히 하는 것</h2>' +
      '<p>사실 TOPIK 6급까지 가는 데 필요한 자료가 없어서 못 가는 사람은 별로 없습니다. 며칠 하다 마는 게 ' +
      '진짜 이유입니다. 그래서 로그인하면 연속 학습일이 남고, 스트릭이 끊기려 하거나 복습할 단어가 쌓이면 ' +
      '화면 위에 알려 줍니다. 진도는 기기를 바꿔도 그대로 이어집니다.</p>' +

      '<h2>정리</h2>' +
      '<p>한글 → 생존 표현 → 문장 만들기 → 문법 표현 290개 → TOPIK 유형 연습 → 단어 복습, 이 순서면 됩니다. ' +
      '설치도 회원가입도 필요 없고, 로그인은 진도를 여러 기기에서 이어 보고 싶을 때만 하면 됩니다.</p>',
  },
];
