/* ══════════════════════════════════════════════════════════════
   커리큘럼
   ──────────────────────────────────────────────────────────────
   내용만 여기 둔다. 화면을 그리는 일은 index.html 의 레슨 엔진이 한다.
   섞어 두면 글을 고치려다 화면을 깨고, 화면을 고치려다 글을 잃는다.

   ── 블록 종류 ───────────────────────────────────────────────
   읽는 것
     { t:'text',  h?:'소제목', md:'본문' }         · **굵게** `코드` 지원
     { t:'note',  md:'…' }                        · 눈에 띄는 상자
     { t:'chars', items:[{ch,rom,tip?}] }         · 글자 카드 (눌러 들음)
     { t:'table', head:[…], rows:[[…]] }

   푸는 것 — 맞혀야 다음으로 넘어간다
     { t:'choice', q, options:[…], answer:index, why? }
     { t:'listen', say:'가', q?, options:[…], answer:index }   · 소리를 듣고 고름
     { t:'type',   q, answer:'…', keys?:[…], why? }            · 한글 자판 없이도 되게 keys 제공
     { t:'order',  q, tokens:[…], answer:[…] }                 · 어순 배열
     { t:'pair',   q?, pairs:[[좌,우],…] }                     · 짝 맞추기
     { t:'speak',  say:'안녕하세요', rom?, q? }                 · 소리 내어 읽기(발음 채점 재사용)

   ── 손대기 전에 ────────────────────────────────────────────
   lesson.id 는 진도(lesson_progress)의 열쇠다. **바꾸면 그 레슨을
   끝낸 사람의 기록이 사라진다.** 순서를 바꾸는 건 괜찮고, id 는 두어라.
   ══════════════════════════════════════════════════════════════ */

/* 문법은 courses-grammar.js 에 있다. 여기 목록 끝에 이어 붙인다.
   파일을 나눈 이유는 문법이 계속 늘어날 예정이라 한 파일에 두면
   고칠 곳을 찾기 어려워지기 때문이다.
   + 세분화된 뉘앙스 차이 문법 (초·중·고급 세부 코스)은 courses-grammar-detailed.js 에서 불러온다. */
import { GRAMMAR_COURSES } from './courses-grammar.js?v=975b754e';
import { DETAILED_GRAMMAR_COURSES } from './courses-grammar-detailed.js?v=975b754e';
import { BEGINNER_GRAMMAR_COURSES } from './courses-grammar-beginner.js?v=975b754e';
// 초급 1단계 — 설계는 docs/curriculum-beginner.md
import { BEGINNER_STAGE1_COURSES } from './courses-beginner-stage1.js?v=975b754e';

export const COURSES = [

/* ═══════════════════════════════════════════════════════════════
   1. 한글 읽기
   한국어를 배우려는 사람이 반드시 지나는 관문이고, 여기서 그만두는
   사람이 가장 많다. 그래서 "외우세요" 대신 왜 그 모양인지를 먼저 준다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'hangul',
  emoji: '가',
  title: 'Read Korean',
  tagline: 'The alphabet, from zero to reading real words.',
  blurb: 'Hangul was invented on purpose, in one lifetime, to be learnable in a morning. Most people can read Korean out loud after this course — even without knowing what the words mean yet.',
  level: 'Start here',
  lessons: [

  /* ── 1 ─────────────────────────────────────────────────── */
  {
    id: 'hangul-01',
    title: 'An alphabet someone invented',
    minutes: 6,
    blocks: [
      { t:'text', md:'Most alphabets grew slowly over centuries. **Hangul did not.** It was designed in the 1440s, by a committee, with a written explanation of *why* each letter looks the way it does.' },
      { t:'text', md:'That is the good news for you: the shapes are not random. Once you see the logic, five letters take about two minutes.' },

      { t:'text', h:'The first five consonants', md:'Each one is a picture of **what your mouth does** when you say it.' },
      { t:'chars', items:[
        { ch:'ㄱ', rom:'g / k', tip:'The back of your tongue rising to the roof of your mouth. Say “g” and feel it.' },
        { ch:'ㄴ', rom:'n',     tip:'The tip of your tongue touching just behind your teeth.' },
        { ch:'ㅁ', rom:'m',     tip:'A mouth, closed. Square.' },
        { ch:'ㅅ', rom:'s',     tip:'A tooth. Air hissing past it.' },
        { ch:'ㅇ', rom:'—',     tip:'An open throat. At the start of a syllable it is silent — a placeholder.' },
      ]},

      { t:'note', md:'**ㅇ is the strange one.** Korean syllables must start with a consonant, so when a syllable really starts with a vowel sound, ㅇ sits there holding the space and makes no sound at all.' },

      { t:'choice',
        q:'Which letter is shaped like a closed mouth?',
        options:['ㄴ','ㅁ','ㅅ','ㅇ'], answer:1,
        why:'ㅁ is a square — a mouth closing for “m”.' },

      { t:'choice',
        q:'You see 아 at the start of a word. What sound does ㅇ make here?',
        options:['“ng”','“o”','No sound at all','“a”'], answer:2,
        why:'At the start of a syllable ㅇ is silent. It is only there so the vowel is not alone. (At the *bottom* it does make an “ng” sound — later.)' },

      { t:'type',
        q:'Type the letter for “n”.',
        answer:'ㄴ', keys:['ㄱ','ㄴ','ㅁ','ㅅ','ㅇ'],
        why:'ㄴ — tongue tip behind the teeth.' },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────── */
  {
    id: 'hangul-02',
    title: 'Six vowels, two strokes',
    minutes: 7,
    blocks: [
      { t:'text', md:'Vowels are built from three pieces: a **long line**, and a **short mark** that can sit on either side of it.' },
      { t:'text', md:'A vertical line means the short mark goes left or right. A horizontal line means it goes above or below. That is the whole system.' },

      { t:'chars', items:[
        { ch:'ㅏ', rom:'a',  tip:'as in f**a**ther. Mark on the right.' },
        { ch:'ㅓ', rom:'eo', tip:'as in d**u**ll / b**u**t. Mark on the left.' },
        { ch:'ㅗ', rom:'o',  tip:'as in b**o**at. Mark on top.' },
        { ch:'ㅜ', rom:'u',  tip:'as in b**oo**t. Mark below.' },
        { ch:'ㅡ', rom:'eu', tip:'No English match. Lips flat and wide, like the last sound in “open” said with a straight mouth.' },
        { ch:'ㅣ', rom:'i',  tip:'as in mach**i**ne.' },
      ]},

      { t:'note', md:'**ㅓ trips up English speakers.** It is *not* “eo” as two sounds. It is one vowel, close to the “u” in **but**. Written “eo” only because the Roman alphabet ran out of letters.' },

      { t:'choice',
        q:'Which vowel sounds closest to the “u” in “but”?',
        options:['ㅏ','ㅗ','ㅓ','ㅜ'], answer:2,
        why:'ㅓ. The mark points left; the sound is that flat “uh”.' },

      { t:'choice',
        q:'ㅗ and ㅜ look almost the same. What tells them apart?',
        options:[
          'ㅗ is longer',
          'The short mark is above for ㅗ, below for ㅜ',
          'ㅜ is written twice as thick',
          'Nothing — they sound the same'],
        answer:1,
        why:'Above = ㅗ (o). Below = ㅜ (u). Same idea as left/right on the vertical line.' },

      { t:'type',
        q:'Type the vowel that sounds like the “ee” in “machine”.',
        answer:'ㅣ', keys:['ㅏ','ㅓ','ㅗ','ㅜ','ㅡ','ㅣ'] },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────── */
  {
    id: 'hangul-03',
    title: 'Letters become blocks',
    minutes: 8,
    blocks: [
      { t:'text', md:'Here is the part that makes Korean look hard and is actually the part that makes it easy.' },
      { t:'text', md:'Korean does not write letters in a line. It **stacks each syllable into a square block**. One block = one syllable, always.' },

      { t:'text', h:'The rule for where things go', md:'It depends on the vowel:' },
      { t:'table',
        head:['Vowel shape','Layout','Example'],
        rows:[
          ['Vertical (ㅏ ㅓ ㅣ)','consonant **left**, vowel **right**','ㄱ + ㅏ = 가'],
          ['Horizontal (ㅗ ㅜ ㅡ)','consonant **on top**, vowel **below**','ㄱ + ㅗ = 고'],
        ]},

      { t:'note', md:'That is why 가 and 고 use the same consonant but look so different. The letter did not change — the *shelf* did.' },

      { t:'chars', items:[
        { ch:'가', rom:'ga' }, { ch:'나', rom:'na' }, { ch:'마', rom:'ma' }, { ch:'사', rom:'sa' }, { ch:'아', rom:'a' },
      ]},
      { t:'chars', items:[
        { ch:'고', rom:'go' }, { ch:'노', rom:'no' }, { ch:'모', rom:'mo' }, { ch:'소', rom:'so' }, { ch:'오', rom:'o' },
      ]},

      { t:'listen', say:'나', q:'Listen. Which block did you hear?',
        options:['가','나','마','사'], answer:1 },

      { t:'listen', say:'구', q:'Listen again.',
        options:['고','구','거','기'], answer:1 },

      { t:'choice',
        q:'You want to write “mu”. ㅁ is the consonant, ㅜ is the vowel. Where does ㅁ go?',
        options:['To the left of ㅜ','On top of ㅜ','Below ㅜ','To the right of ㅜ'],
        answer:1,
        why:'ㅜ is a horizontal vowel, so the consonant sits on top: 무.' },

      { t:'pair', q:'Match each block to its sound.',
        pairs:[['가','ga'],['노','no'],['시','si'],['무','mu'],['어','eo']] },
    ],
  },

  /* ── 4 ─────────────────────────────────────────────────── */
  {
    id: 'hangul-04',
    title: 'Five more consonants',
    minutes: 7,
    blocks: [
      { t:'text', md:'You now have enough to read a lot. Five more and you have almost the whole set.' },

      { t:'chars', items:[
        { ch:'ㄷ', rom:'d / t', tip:'ㄴ with a lid. Same tongue position, harder push.' },
        { ch:'ㄹ', rom:'r / l', tip:'Between English r and l. Tap the roof of your mouth once, like the “tt” in American “butter”.' },
        { ch:'ㅂ', rom:'b / p', tip:'ㅁ with the top opened.' },
        { ch:'ㅈ', rom:'j',     tip:'ㅅ with a lid.' },
        { ch:'ㅎ', rom:'h',     tip:'A lid, a line, and an open throat (ㅇ).' },
      ]},

      { t:'note', md:'**Why “g / k”, “d / t”, “b / p”?** Korean does not hear these as two different letters. The same letter sounds softer between vowels and harder at the start. Native speakers do not notice the difference — you will not have to choose.' },

      { t:'text', h:'ㄹ is the one to practise', md:'It is not the English r, and not quite the English l. Say **“butter”** the American way and freeze on that middle tap. That is ㄹ.' },

      { t:'listen', say:'라', q:'Listen.', options:['나','다','라','마'], answer:2 },

      { t:'choice',
        q:'ㄴ and ㄷ are related. How?',
        options:[
          'They sound identical',
          'ㄷ is ㄴ with a line on top — same tongue position, stronger',
          'ㄷ is only used at the end of words',
          'They are unrelated; the shapes are coincidence'],
        answer:1,
        why:'Adding a stroke means “same place in the mouth, more force”. That pattern runs through the whole alphabet.' },

      { t:'type', q:'Type the letter for the “h” sound.',
        answer:'ㅎ', keys:['ㄷ','ㄹ','ㅂ','ㅈ','ㅎ'] },

      { t:'speak', say:'바다', rom:'ba-da  ·  “sea”',
        q:'Read it out loud. Your first real Korean word.' },
    ],
  },

  /* ── 5 ─────────────────────────────────────────────────── */
  {
    id: 'hangul-05',
    title: 'Adding a stroke, adding a y',
    minutes: 6,
    blocks: [
      { t:'text', md:'Remember the short mark on each vowel? **Double the mark and you add a “y” in front.** No new shapes to memorise.' },

      { t:'table',
        head:['Plain','Sound','Doubled','Sound'],
        rows:[
          ['ㅏ','a','ㅑ','ya'],
          ['ㅓ','eo','ㅕ','yeo'],
          ['ㅗ','o','ㅛ','yo'],
          ['ㅜ','u','ㅠ','yu'],
        ]},

      { t:'text', h:'Two more you need constantly', md:'These are not part of the pattern — just learn them.' },
      { t:'chars', items:[
        { ch:'ㅐ', rom:'ae', tip:'as in c**a**t.' },
        { ch:'ㅔ', rom:'e',  tip:'as in b**e**d.' },
      ]},
      { t:'note', md:'**ㅐ and ㅔ sound the same to most Koreans today.** They were different centuries ago. You do not need to hear a difference — you only need to spell them right, and that comes with words, not rules.' },

      { t:'choice',
        q:'You know ㅗ is “o”. What is ㅛ?',
        options:['A longer “o”','“yo”','“wo”','“oe”'], answer:1,
        why:'Doubled mark = y-sound in front.' },

      { t:'listen', say:'여', q:'Listen.', options:['어','여','오','요'], answer:1 },

      { t:'pair', q:'Match.',
        pairs:[['야','ya'],['유','yu'],['예','ye'],['개','gae'],['네','ne']] },
    ],
  },

  /* ── 6 ─────────────────────────────────────────────────── */
  {
    id: 'hangul-06',
    title: 'Harder and tenser',
    minutes: 7,
    blocks: [
      { t:'text', md:'Korean splits consonants three ways where English has two. This is the one place English speakers need real practice.' },

      { t:'table',
        head:['Plain','Aspirated (puff of air)','Tense (tight, no air)'],
        rows:[
          ['ㄱ g','ㅋ k','ㄲ kk'],
          ['ㄷ d','ㅌ t','ㄸ tt'],
          ['ㅂ b','ㅍ p','ㅃ pp'],
          ['ㅈ j','ㅊ ch','ㅉ jj'],
          ['ㅅ s','—','ㅆ ss'],
        ]},

      { t:'text', h:'How to feel the difference',
        md:'Hold a slip of paper in front of your mouth.\n\n**Aspirated (ㅋㅌㅍㅊ)** — the paper jumps. Big puff.\n\n**Tense (ㄲㄸㅃㅆㅉ)** — the paper does not move at all. Throat tight, sound clipped.' },

      { t:'note', md:'Notice the writing follows the sound: **add a stroke** for aspirated, **write it twice** for tense. You are not memorising ten new letters — you are memorising two rules.' },

      { t:'listen', say:'카', q:'Listen. Plain or aspirated?', options:['가','카'], answer:1 },
      { t:'listen', say:'따', q:'Listen.', options:['다','타','따'], answer:2 },

      { t:'choice',
        q:'ㅃ is written as two ㅂ. What does doubling mean?',
        options:['Say it twice','Say it longer','Tense — tight throat, no puff of air','It is the plural form'],
        answer:2 },

      { t:'speak', say:'토끼', rom:'to-kki  ·  “rabbit”',
        q:'Both kinds in one word. Read it out loud.' },
    ],
  },

  /* ── 7 ─────────────────────────────────────────────────── */
  {
    id: 'hangul-07',
    title: 'The letter underneath',
    minutes: 8,
    blocks: [
      { t:'text', md:'So far every block has been consonant + vowel. But a syllable can end in a consonant too, and it goes **underneath**. Korean calls it 받침 (*batchim*) — “the support”.' },

      { t:'chars', items:[
        { ch:'한', rom:'han', tip:'ㅎ + ㅏ + ㄴ. The ㄴ sits under.' },
        { ch:'국', rom:'guk', tip:'ㄱ + ㅜ + ㄱ.' },
        { ch:'말', rom:'mal', tip:'ㅁ + ㅏ + ㄹ.' },
      ]},

      { t:'text', h:'Here is the useful part',
        md:'Any consonant can sit down there — but when it does, it collapses into **only seven sounds**.' },

      { t:'table',
        head:['Written at the bottom','Actually sounds like'],
        rows:[
          ['ㄱ ㅋ ㄲ','ㄱ  (k, unreleased)'],
          ['ㄴ','ㄴ  (n)'],
          ['ㄷ ㅌ ㅅ ㅆ ㅈ ㅊ ㅎ','ㄷ  (t, unreleased)'],
          ['ㄹ','ㄹ  (l)'],
          ['ㅁ','ㅁ  (m)'],
          ['ㅂ ㅍ','ㅂ  (p, unreleased)'],
          ['ㅇ','ㅇ  (ng)'],
        ]},

      { t:'note', md:'**“Unreleased” means you stop the sound and hold it.** English “cat” lets the t out. Korean 갓 does not — the tongue arrives and stays. This one habit makes an accent sound much more natural.' },

      { t:'choice',
        q:'Remember ㅇ was silent at the start of a block. What about at the bottom?',
        options:['Still silent','It becomes “ng” as in “sing”','It becomes “o”','It cannot go at the bottom'],
        answer:1,
        why:'Top or side = silent placeholder. Bottom = “ng”. Same letter, two jobs.' },

      { t:'listen', say:'방', q:'Listen for the ending.', options:['바','반','발','방'], answer:3 },

      { t:'type', q:'Type the block “han” — ㅎ, ㅏ, and ㄴ underneath.',
        answer:'한', keys:['한','항','핟','하'],
        why:'ㅎ on the left, ㅏ on the right, ㄴ underneath.' },
    ],
  },

  /* ── 8 ─────────────────────────────────────────────────── */
  {
    id: 'hangul-08',
    title: 'Sounds that slide',
    minutes: 7,
    blocks: [
      { t:'text', md:'One last thing and you can read anything. When a block ends in a consonant and the **next block starts with ㅇ** (the silent placeholder), that consonant slides over into the empty seat.' },

      { t:'table',
        head:['Written','Said','Meaning'],
        rows:[
          ['한국어','**하 – 구 – 거**','Korean (language)'],
          ['음악','**으 – 막**','music'],
          ['일요일','**이 – 료 – 일**','Sunday'],
        ]},

      { t:'note', md:'Nothing is spelled wrong. Korean **spells the meaning and speaks the flow** — the same way English writes “want to” and says “wanna”.' },

      { t:'choice',
        q:'한국어 is written 한 + 국 + 어. Why is it said “ha-gu-geo”?',
        options:[
          'It is an exception you must memorise',
          'The ㄱ under 국 slides into the empty ㅇ of 어',
          'Koreans drop the ㄴ in fast speech',
          'The spelling is old and the pronunciation changed'],
        answer:1 },

      { t:'listen', say:'음악', q:'Listen. How many syllables do you hear?',
        options:['One','Two','Three'], answer:1,
        // 실제로는 두 덩어리(으-막)로 들린다
      },

      { t:'speak', say:'한국어', rom:'ha-gu-geo  ·  “Korean”',
        q:'Say it the way it sounds, not the way it is spelled.' },
    ],
  },

  /* ── 9 ─────────────────────────────────────────────────── */
  {
    id: 'hangul-09',
    title: 'Read something real',
    minutes: 8,
    blocks: [
      { t:'text', md:'No new letters. Everything below uses only what you already know — and these are words you will actually meet on your first day in Korea.' },

      { t:'chars', items:[
        { ch:'커피', rom:'keo-pi · coffee' },
        { ch:'버스', rom:'beo-seu · bus' },
        { ch:'택시', rom:'taek-si · taxi' },
        { ch:'카페', rom:'ka-pe · café' },
        { ch:'컴퓨터', rom:'keom-pyu-teo · computer' },
      ]},

      { t:'note', md:'Korean borrowed a lot of words. Once you can read, **hundreds of words are free** — you already know what they mean.' },

      { t:'choice', q:'You see 아이스크림 on a menu. What is it?',
        options:['Iced tea','Ice cream','A rice dish','Espresso'], answer:1,
        why:'a-i-seu-keu-rim. Read it slowly and it says itself.' },

      { t:'type', q:'A sign says 화장실. It is somewhere you will need. Type what the first block is.',
        answer:'화', keys:['화','하','호','후'],
        why:'화장실 (hwa-jang-sil) — toilet. ㅎ + ㅘ.' },

      { t:'pair', q:'Match the loanword to its meaning.',
        pairs:[['피자','pizza'],['빵','bread'],['우유','milk'],['치킨','chicken'],['라면','ramen']] },

      { t:'speak', say:'안녕하세요', rom:'an-nyeong-ha-se-yo  ·  “hello”',
        q:'The one everybody knows. You can now read it letter by letter.' },
    ],
  },

  /* ── 10 ────────────────────────────────────────────────── */
  {
    id: 'hangul-10',
    title: 'Proof',
    minutes: 6,
    blocks: [
      { t:'text', md:'A short test with no new material. If you get through this, you can read Korean out loud — and that was supposed to take months.' },

      { t:'listen', say:'감사합니다', q:'Listen, then pick the spelling.',
        options:['감사함니다','감사합니다','갑사합니다','감사합미다'], answer:1 },

      { t:'choice', q:'Which of these ends in an “ng” sound?',
        options:['간','갇','강','갈'], answer:2 },

      { t:'choice', q:'맛있어요 is said “ma-si-sseo-yo”. Why does the ㅅ move?',
        options:[
          'It does not — that is a typo',
          'The batchim slides into the next block’s empty ㅇ',
          'ㅅ is always silent at the end',
          'Because the word is polite'],
        answer:1 },

      { t:'order', q:'Put the letters in the right order to build 밥 (“rice”).',
        tokens:['ㅂ','ㅏ','ㅂ'], answer:['ㅂ','ㅏ','ㅂ'] },

      { t:'pair', q:'Last one. Match.',
        pairs:[['물','water'],['불','fire'],['산','mountain'],['밤','night'],['눈','eye / snow']] },

      { t:'speak', say:'저는 한국어를 읽을 수 있어요',
        rom:'jeo-neun han-gu-geo-reul il-geul su i-sseo-yo',
        q:'“I can read Korean.” Say it — it is true now.' },
    ],
  },

  ],
},

/* ═══════════════════════════════════════════════════════════════
   2. 첫 문장
   한글을 읽을 수 있게 된 사람이 바로 다음에 원하는 것 — 실제로 쓸 말.
   모두 해요체다. 학습자가 처음 배워야 하는 말투이고, 어디서 써도
   실례가 되지 않는다.
   ═══════════════════════════════════════════════════════════════ */
{
  id: 'first-words',
  emoji: '말',
  title: 'First Words',
  tagline: 'Enough Korean to get through a day.',
  blurb: 'Greetings, ordering, prices, directions. Every sentence here is one you will use in your first week — said the polite way that works with anyone, anywhere.',
  level: 'After Hangul',
  needs: 'hangul',
  lessons: [

  {
    id: 'fw-01',
    title: 'Hello, thank you, sorry',
    minutes: 6,
    blocks: [
      { t:'text', md:'Three phrases carry an astonishing amount of weight in Korea. Get these right and people will help you with the rest.' },

      { t:'chars', items:[
        { ch:'안녕하세요', rom:'an-nyeong-ha-se-yo', tip:'Hello. Works morning, noon, night, stranger, boss, anyone.' },
        { ch:'감사합니다', rom:'gam-sa-ham-ni-da', tip:'Thank you. Note: 합니다 is said “ham-ni-da” — the ㅂ turns into ㅁ before ㄴ.' },
        { ch:'죄송합니다', rom:'joe-song-ham-ni-da', tip:'I am sorry. Also used for “excuse me” when squeezing past someone.' },
      ]},

      { t:'note', md:'**안녕하세요 is a question in disguise.** It literally asks “are you at peace?”. That is why it works as both hello and how-are-you, and why nobody expects a real answer.' },

      { t:'choice', q:'Someone holds a door for you. What do you say?',
        options:['안녕하세요','감사합니다','죄송합니다'], answer:1 },

      { t:'choice', q:'You need to get past someone on a crowded subway.',
        options:['안녕하세요','감사합니다','죄송합니다'], answer:2,
        why:'죄송합니다 covers “sorry” and “excuse me”. 잠시만요 (jam-si-man-yo, “just a moment”) also works.' },

      { t:'speak', say:'안녕하세요', rom:'an-nyeong-ha-se-yo', q:'Say it. Warm and slightly rising at the end.' },
      { t:'speak', say:'감사합니다', rom:'gam-sa-ham-ni-da', q:'Remember: “ham”, not “hap”.' },
    ],
  },

  {
    id: 'fw-02',
    title: 'I am —',
    minutes: 7,
    blocks: [
      { t:'text', md:'Korean sentences end with the verb, and the most useful verb is **“to be”**. In polite everyday speech it is 예요 / 이에요.' },

      { t:'table',
        head:['If the word ends in…','Use','Example'],
        rows:[
          ['a vowel','**예요**','저는 마크**예요** — I am Mark'],
          ['a consonant','**이에요**','저는 학생**이에요** — I am a student'],
        ]},

      { t:'note', md:'Why two forms? Purely for the mouth. 마크이에요 is a mouthful; 마크예요 is not. Korean does this a lot — the grammar bends so the sentence stays easy to say.' },

      { t:'text', h:'저는 = “as for me”',
        md:'저 is “I” (humble). 는 marks it as the topic — “speaking of me…”. You will meet 는/은 everywhere.' },

      { t:'choice', q:'Your name is Anna. Which is right?',
        options:['저는 안나이에요','저는 안나예요'], answer:1,
        why:'안나 ends in a vowel (ㅏ), so 예요.' },

      { t:'choice', q:'You want to say “I am a student” (학생).',
        options:['저는 학생예요','저는 학생이에요'], answer:1,
        why:'학생 ends in ㅇ — a consonant — so 이에요.' },

      { t:'order', q:'Build “I am Korean.”  (한국 사람 = Korean person)',
        tokens:['저는','한국 사람','이에요'], answer:['저는','한국 사람','이에요'] },

      { t:'speak', say:'저는 학생이에요', rom:'jeo-neun hak-saeng-i-e-yo', q:'“I am a student.”' },
    ],
  },

  {
    id: 'fw-03',
    title: 'What is this?',
    minutes: 6,
    blocks: [
      { t:'text', md:'The single most useful question when you cannot read a menu.' },

      { t:'chars', items:[
        { ch:'이거', rom:'i-geo', tip:'this thing (near me)' },
        { ch:'그거', rom:'geu-geo', tip:'that thing (near you)' },
        { ch:'저거', rom:'jeo-geo', tip:'that thing over there (near neither of us)' },
        { ch:'뭐예요?', rom:'mwo-ye-yo', tip:'what is it?' },
      ]},

      { t:'note', md:'**Korean splits “that” into two.** 그거 is close to the listener; 저거 is far from both. Point at a dish on your own table → 이거. Point across the restaurant → 저거.' },

      { t:'choice', q:'You point at something on the far wall of the shop. Which word?',
        options:['이거','그거','저거'], answer:2 },

      { t:'order', q:'Build “What is this?”',
        tokens:['이거','뭐예요?'], answer:['이거','뭐예요?'] },

      { t:'text', h:'And the answer', md:'Point, ask, and the reply comes back in the same shape: **이거 김치예요** — “this is kimchi”.' },

      { t:'speak', say:'이거 뭐예요?', rom:'i-geo mwo-ye-yo', q:'Rising at the end, like any question.' },
    ],
  },

  {
    id: 'fw-04',
    title: 'Numbers you can survive on',
    minutes: 8,
    blocks: [
      { t:'text', md:'Korean has **two** number systems. That sounds terrible and is actually fine, because they do different jobs and you can learn one at a time.' },

      { t:'text', h:'Sino-Korean — for money, dates, phone numbers',
        md:'This is the one that matters first, because it is the one prices use.' },
      { t:'table',
        head:['1','2','3','4','5','6','7','8','9','10'],
        rows:[['일','이','삼','사','오','육','칠','팔','구','십']]},

      { t:'note', md:'**Big numbers just stack.** 십 (10) + 이 (2) = 십이 (12). 이 (2) + 십 (10) = 이십 (20). Twenty-three is 이십삼. No new words after ten.' },

      { t:'text', h:'The one you must know', md:'**만 = 10,000.** Korean counts in units of ten thousand, not thousand. A 10,000-won note is 만 원. Coffee at 5,000 is 오천 원.' },

      { t:'choice', q:'How do you say 30?',
        options:['삼십','십삼','삼백'], answer:0,
        why:'삼 (3) then 십 (10) = three tens.' },

      { t:'choice', q:'A price tag says 이만 원. Roughly how much?',
        options:['2,000 won','20,000 won','200,000 won'], answer:1,
        why:'이 (2) × 만 (10,000) = 20,000.' },

      { t:'listen', say:'오천 원', q:'Listen to the price.',
        options:['500 won','5,000 won','50,000 won'], answer:1 },

      { t:'pair', q:'Match.',
        pairs:[['일','1'],['오','5'],['십','10'],['백','100'],['만','10,000']] },
    ],
  },

  {
    id: 'fw-05',
    title: 'How much? — buying things',
    minutes: 7,
    blocks: [
      { t:'text', md:'Two phrases and a number, and you can shop anywhere in the country.' },

      { t:'chars', items:[
        { ch:'얼마예요?', rom:'eol-ma-ye-yo', tip:'How much is it?' },
        { ch:'주세요', rom:'ju-se-yo', tip:'Please give me — the workhorse of ordering.' },
        { ch:'이거 주세요', rom:'i-geo ju-se-yo', tip:'This one, please. Point and say it.' },
      ]},

      { t:'note', md:'**주세요 solves almost everything.** Put any noun in front of it and you have a polite request. 물 주세요 — water, please. 계산서 주세요 — the bill, please.' },

      { t:'order', q:'Build “Please give me coffee.”  (커피 = coffee)',
        tokens:['커피','주세요'], answer:['커피','주세요'] },

      { t:'choice', q:'You are at a market stall and want to know the price.',
        options:['뭐예요?','얼마예요?','주세요'], answer:1 },

      { t:'text', h:'Counting things you buy',
        md:'For small numbers of objects Korean uses the *other* number system with a counter word. You only need three: **하나, 둘, 셋** (1, 2, 3) → 하나 becomes **한**, 둘 becomes **두**, 셋 becomes **세** before a counter.\n\n커피 **두 잔** 주세요 — two cups of coffee, please.' },

      { t:'speak', say:'이거 얼마예요?', rom:'i-geo eol-ma-ye-yo', q:'Point, then ask.' },
      { t:'speak', say:'커피 두 잔 주세요', rom:'keo-pi du jan ju-se-yo', q:'Order for two.' },
    ],
  },

  {
    id: 'fw-06',
    title: 'Where is it?',
    minutes: 7,
    blocks: [
      { t:'text', md:'You will need this before you need almost anything else.' },

      { t:'chars', items:[
        { ch:'어디예요?', rom:'eo-di-ye-yo', tip:'Where is it?' },
        { ch:'화장실', rom:'hwa-jang-sil', tip:'toilet' },
        { ch:'역', rom:'yeok', tip:'station' },
        { ch:'여기', rom:'yeo-gi', tip:'here' },
        { ch:'저기', rom:'jeo-gi', tip:'over there' },
      ]},

      { t:'order', q:'Build “Where is the toilet?”',
        tokens:['화장실','어디예요?'], answer:['화장실','어디예요?'] },

      { t:'note', md:'**Korean asks in one lump.** No “is”, no “the”, no word order gymnastics — noun, then question word, done. 역 어디예요? works exactly the same way.' },

      { t:'choice', q:'Someone answers 저기예요. What did they say?',
        options:['It is here','It is over there','I do not know','It is closed'], answer:1 },

      { t:'text', h:'One more that saves you',
        md:'**여기요!** (yeo-gi-yo) — literally “here!”, used to call a server in a restaurant. Not rude at all; it is what everyone says.' },

      { t:'speak', say:'화장실 어디예요?', rom:'hwa-jang-sil eo-di-ye-yo', q:'Ask.' },
    ],
  },

  {
    id: 'fw-07',
    title: 'Yes, no, and “a little”',
    minutes: 6,
    blocks: [
      { t:'text', md:'Answering is where beginners freeze. These four get you through it.' },

      { t:'chars', items:[
        { ch:'네', rom:'ne', tip:'Yes. Also used as “uh-huh” to show you are listening.' },
        { ch:'아니요', rom:'a-ni-yo', tip:'No.' },
        { ch:'조금', rom:'jo-geum', tip:'a little' },
        { ch:'몰라요', rom:'mol-la-yo', tip:'I do not know.' },
      ]},

      { t:'text', h:'The sentence that buys you patience',
        md:'**한국어 조금 해요** — “I speak a little Korean.”\n\nSay this early in a conversation and people slow down for you. It works far better than apologising.' },

      { t:'note', md:'**네 is not only “yes”.** Koreans say it constantly during a conversation to mean “I am with you”. If someone 네-네-네s while you talk, they are not agreeing to anything — they are listening.' },

      { t:'order', q:'Build “I speak a little Korean.”',
        tokens:['한국어','조금','해요'], answer:['한국어','조금','해요'] },

      { t:'choice', q:'Someone asks you something you did not catch at all.',
        options:['네','조금','몰라요','아니요'], answer:2,
        why:'몰라요 — “I do not know”. Honest and completely normal.' },

      { t:'speak', say:'한국어 조금 해요', rom:'han-gu-geo jo-geum hae-yo', q:'The most useful sentence in this course.' },
    ],
  },

  {
    id: 'fw-08',
    title: 'A whole conversation',
    minutes: 8,
    blocks: [
      { t:'text', md:'Nothing new. Everything below is something you already learned — put together the way it actually happens in a café.' },

      { t:'table',
        head:['','Korean','English'],
        rows:[
          ['You','안녕하세요','Hello'],
          ['Staff','네, 안녕하세요','Hello'],
          ['You','이거 뭐예요?','What is this?'],
          ['Staff','아메리카노예요','It is an americano'],
          ['You','얼마예요?','How much?'],
          ['Staff','사천 원이에요','4,000 won'],
          ['You','이거 두 잔 주세요','Two of these, please'],
          ['Staff','네, 감사합니다','Yes, thank you'],
          ['You','감사합니다','Thank you'],
        ]},

      { t:'choice', q:'사천 원 — how much is that?',
        options:['400 won','4,000 won','40,000 won'], answer:1 },

      { t:'order', q:'Build “Two of these, please.”',
        tokens:['이거','두 잔','주세요'], answer:['이거','두 잔','주세요'] },

      { t:'listen', say:'얼마예요?', q:'What are they asking?',
        options:['What is this?','How much is it?','Where is it?'], answer:1 },

      { t:'speak', say:'이거 두 잔 주세요', rom:'i-geo du jan ju-se-yo', q:'Order it for real.' },

      { t:'cloze', sentence:'나는 [아메리카노]를 두 잔 주세요', answer:'아메리카노',
        audio:'나는_아메리카노를_두_잔_주세요.mp3',
        meaning:'Please give me two americanos.',
        options:['아메리카노','카페라떼','에스프레소','녹차'],
        keys:['아메리카노','카페라떼','에스프레소','녹차'],
        why:'아메리카노(americano) · 카페라떼(café latte) · 에스프레소(espresso) · 녹차(green tea)' },

      { t:'cloze', sentence:'얼마예요? — [사천 원]이에요', answer:'사천 원',
        audio:'얼마예요_사천_원이에요.mp3',
        meaning:'How much is it? — It is 4,000 won.',
        options:['사천 원','이천 원','육천 원','만 원'],
        keys:['사천 원','이천 원','육천 원','만 원'],
        why:'사천=4천 · 이천=2천 · 육천=6천 · 만=10,000' },

      { t:'cloze', sentence:'화장실은 [어디]에 있나요?', answer:'어디',
        audio:'화장실은_어디에_있나요.mp3',
        meaning:'Where is the restroom?',
        options:['어디','언제','누구','무엇'],
        keys:['어디','언제','누구','무엇'],
        why:'어디(where) · 언제(when) · 누구(who) · 무엇(what)' },

      { t:'cloze', sentence:'맛있게 드세요! — [감사합니다]', answer:'감사합니다',
        audio:'맛있게_드세요_감사합니다.mp3',
        meaning:'Enjoy your meal! — Thank you.',
        options:['감사합니다','안녕하세요','미안합니다','안녕히 가세요'],
        keys:['감사합니다','안녕하세요','미안합니다','안녕히 가세요'],
        why:'감사합니다(thank you) · 안녕하세요(hello) · 미안합니다(sorry) · 안녕히 가세요(goodbye)' },

      { t:'text', md:'That is a complete transaction, start to finish, in a language you could not read an hour ago.' },
    ],
  },

  ],
},

// 문법 코스들 — courses-grammar.js
...GRAMMAR_COURSES,

// 세분화 문법 코스들 (뉘앙스 차이 구분) — courses-grammar-detailed.js
...DETAILED_GRAMMAR_COURSES,

/* 초급 1단계 — courses-beginner-stage1.js
   배열 순서가 곧 카드 순서라 가르치는 차례대로 둔다. -아/어요(bg-d-01)가
   먼저 와야 하다 동사와 불규칙이 말이 되므로 세밀 코스 뒤에 붙인다. */
...BEGINNER_STAGE1_COURSES,

/* 이/가 와 은/는 — 초급 **맨 뒤**가 제자리다. 처음부터 대조하면 문장
   하나 만들 때마다 멈춘다 (docs/curriculum-beginner.md §2 원칙 ②). */
...BEGINNER_GRAMMAR_COURSES,

];
