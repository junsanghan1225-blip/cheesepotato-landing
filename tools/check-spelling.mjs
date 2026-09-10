#!/usr/bin/env node
/* 맞춤법 검사기 — node tools/check-spelling.mjs
 *
 * 여기 실린 글은 한국어를 배우는 사람이 **보고 외우는 글이다.** 틀린 뜻이
 * 빈 칸보다 나쁜 것과 같은 까닭으로, 틀린 맞춤법은 안 가르치느니만 못하다.
 * 학습자는 그것이 틀렸다는 것을 알 길이 없다.
 *
 * 그런데 맞춤법 검사기를 만들 때 진짜 어려운 것은 잘못을 찾는 쪽이 아니다.
 * **없는 잘못을 안 지어내는 쪽이다.** 한국어는 조사와 어미가 같은 글자를
 * 쓴다.
 *
 *     사과      「사」+「과」로 갈라 「사와」라고 고치려 든다
 *     먹는      받침이 있으니 「먹은」이라고 고치려 든다 (「먹는」이 맞다)
 *     먹어      「-아/-어」를 조사로 보아 「먹아」라고 고치려 든다
 *     살며      「살」+「며」를 「살이며」로 고치려 든다
 *
 * 이런 것을 한 번이라도 내놓으면 사람이 목록을 안 보게 되고, 그러면 진짜
 * 잘못도 같이 묻힌다. 그래서 이 검사기는 **잴 수 있는 것만 잰다.**
 *
 *   1) 셈이 정하는 것 — 받침이 「을/를」을 정한다. 여기에는 문맥이 없다
 *   2) 언제나 틀린 꼴 — 「몇일」·「되요」·「웬지」는 문맥과 무관하게 틀렸다
 *   3) 우리 글끼리 견주기 — 딴 데서 쉰 번 「학교를」인데 여기서만 「학교을」
 *
 * 뜻을 알아야 갈리는 것(되/돼의 여러 꼴, 로서/로써, 던/든, 대/데)은
 * **여기서 안 다룬다.** 기계가 뜻을 모르는 채로 찍으면 반은 틀린다.
 *
 *   node tools/check-spelling.mjs            넘어가기로 적어 둔 것은 빼고
 *   node tools/check-spelling.mjs --all      전부
 *   node tools/check-spelling.mjs --accept   지금 나온 것을 넘어가기로 (눈으로 본 뒤에)
 *   node tools/check-spelling.mjs --limit=200
 */
import { loadCorpus } from './lib/corpus.mjs';
import { isKnown, isNoun, tally, bigDictLoaded } from './lib/dict.mjs';
import { Lint } from './lib/lint.mjs';
import { pickJosa, pickIeyo, pickYul, pickYeol, hasBatchim } from './lib/hangul.mjs';

const lint = new Lint('맞춤법');
const corpus = await loadCorpus();
const seen = tally(corpus);

/* ── 1. 언제나 틀린 꼴 ────────────────────────────────────────────────
 *
 * 여기 한 줄을 더할 때 스스로에게 물을 것: **이 꼴이 맞는 문장을 하나라도
 * 지어낼 수 있는가?** 하나라도 있으면 여기 두면 안 된다.
 *
 * 처음에는 「이예요」와 「읍니다」를 여기 넣었다가 도로 뺐다.
 *
 *     쌍둥이예요   맞다 — 「쌍둥이」+「예요」다
 *     모읍니다     맞다 — 「모으」+「-ㅂ니다」다
 *
 * 통째로 틀린 것처럼 보이는 꼴도 낱말 한가운데서는 멀쩡하다. 그래서 앞뒤를
 * 함께 적어 둔다. 앞뒤를 안 적으면 「물건들이」가 「건들이」로 걸린다.
 */
const ALWAYS = [
  // 되/돼 — 「되어」로 풀어 보면 갈린다. 풀어서 말이 되면 「돼」다
  [/되요/g, '돼요'], [/되서(?![술])/g, '돼서'], [/됬/g, '됐'],
  [/돼다/g, '되다'], [/돼는/g, '되는'], [/돼고/g, '되고'], [/돼면/g, '되면'],
  [/돼지만/g, '되지만'], [/않\s*되/g, '안 되'], [/않\s*돼/g, '안 돼'],
  // 소리가 같아 헷갈리는 것
  [/몇일/g, '며칠'], [/오랫만/g, '오랜만'], [/어떻해/g, '어떡해'],
  [/설레임/g, '설렘'], [/되물림/g, '대물림'], [/역활/g, '역할'],
  [/통털어/g, '통틀어'], [/서슴치/g, '서슴지'], [/희안하/g, '희한하'],
  [/어의없/g, '어이없'], [/닥달/g, '닦달'], [/댓가/g, '대가'],
  [/빈털털이/g, '빈털터리'], [/재털이/g, '재떨이'],
  /* 「건들이」는 뒤에 어미가 와야 잘못이다. 「물건들이 팔린다」는 멀쩡하다 */
  [/건들이(?=[다어었지고면는])/g, '건드리'],
  /* 「찌게」도 마찬가지다. 「찌게 하다」(사동)는 맞는 말이라 앞을 묶는다 */
  [/(김치|된장|부대|순두부|청국장|고추장)찌게/g, '$1찌개'],
  // 사이시옷 — 한자어끼리는 곳간·셋방·숫자·찻간·툇간·횟수 여섯뿐이다
  [/갯수/g, '개수'], [/촛점/g, '초점'], [/싯가/g, '시가'],
  // 옛 표기 — 1988년에 바뀌었는데 아직 돌아다닌다
  [/십시요/g, '십시오'],
  // 어미 — 「-려고」에 ㄹ 을 덧붙이는 꼴
  [/([가-힣])ㄹ려고/g, '$1려고'], [/할려고/g, '하려고'], [/갈려고/g, '가려고'],
  [/할려면/g, '하려면'], [/([가-힣])을려고/g, '$1으려고'],
];

for (const r of corpus) {
  for (const [re, want] of ALWAYS) {
    const m = r.text.match(re);
    if (!m) continue;
    lint.add('언제나 틀린 꼴', 'bad', r, {
      found: m[0], want: want.includes('$1') ? want.replace('$1', m[0][0]) : want,
      why: '문맥과 상관없이 이 꼴은 맞는 자리가 없다',
    });
  }
}

/* 「-읍니다」는 1988년에 「-습니다」로 바뀌었다. 다만 「모읍니다」(모으+ㅂ니다)
   처럼 어간 끝소리가 읍이 되는 것은 멀쩡하다. 앞 글자에 **받침이 있을 때만**
   잘못이다 — 받침 있는 어간은 언제나 「-습니다」를 쓴다. */
for (const r of corpus) {
  for (const m of r.text.matchAll(/([가-힣])읍니다/g)) {
    if (hasBatchim(m[1]) !== true) continue;
    lint.add('옛 표기', 'bad', r, { found: m[0], want: m[1] + '습니다', why: '받침 있는 어간에는 「-습니다」— 「-읍니다」는 1988년에 없어졌다' });
  }
}

/* ── 2. 왠 / 웬 ──────────────────────────────────────────────────────
   「왠」은 「왠지」 하나에만 쓴다. 나머지는 전부 「웬」이다. */
for (const r of corpus) {
  for (const m of r.text.matchAll(/왠(?!지)/g))
    lint.add('왠/웬', 'bad', r, { found: '왠', want: '웬', why: '「왠」은 「왠지」에만 쓴다 — 나머지는 「웬」' });
  for (const m of r.text.matchAll(/웬지/g))
    lint.add('왠/웬', 'bad', r, { found: '웬지', want: '왠지', why: '「왠」은 「왠지」에만 쓴다 — 나머지는 「웬」' });
}

/* ── 3. 셈이 정하는 것 ───────────────────────────────────────────────

   -율/-률 (한글 맞춤법 제11항 붙임 1) — 받침이 없거나 ㄴ 받침이면 율.

   「-열/-렬」은 안 본다. 「태양열」의 열은 熱 이라 이 규칙과 아무 상관이
   없는데 글자만 같다. 규칙이 닿지 않는 자리까지 재면 그 규칙은 못 믿을
   것이 된다. */
for (const r of corpus) {
  for (const tok of r.text.match(/[가-힣]+/g) || []) {
    const m = tok.match(/^(.+?)([가-힣])(율|률)$/);
    if (!m) continue;
    if (isKnown(tok)) continue;              // 사전에 있으면 우리가 따질 것이 아니다
    const want = pickYul(m[2]);
    if (!want || want === m[3]) continue;
    lint.add('-율/-률', 'bad', r, {
      found: tok, want: tok.slice(0, -1) + want,
      why: '받침이 없거나 ㄴ 받침 뒤에는 「율」, 그 밖에는 「률」',
    });
  }
}

/* 이에요 / 예요 — 받침이 있으면 이에요, 없으면 예요.
   「이에요」 앞 글자가 곧 앞말의 끝 글자다. 「이」를 앞말로 잘못 잡으면
   멀쩡한 「이에요」를 「이예요」로 고치라고 한다. 한 번 그랬다. */
for (const r of corpus) {
  for (const m of r.text.matchAll(/([가-힣])(이에요|예요)(?![가-힣])/g)) {
    const want = pickIeyo(m[1]);
    if (!want || want === m[2]) continue;
    lint.add('이에요/예요', 'bad', r, {
      found: m[1] + m[2], want: m[1] + want,
      why: '받침이 있으면 「이에요」, 없으면 「예요」',
    });
  }
}

/* ── 4. 조사 받침 ────────────────────────────────────────────────────
 *
 * 오탐이 나기 가장 쉬운 자리다. 문을 넷 건다.
 *
 *   ① 낱말이 통째로 사전에 있으면 안 건드린다 — 「사과」를 「사+과」로
 *      가르지 않게 하는 것이 이 한 줄이다
 *   ② **하나라도 맞게 읽히는 갈래가 있으면 안 건드린다.** 「사이나」는
 *      「사+이나」로 읽으면 틀리지만 「사이+나」로 읽으면 맞다. 맞게 읽히는
 *      길이 있는데 틀렸다고 하면 안 된다
 *   ③ 앞말이 두 글자는 돼야 본다 — 한 글자 앞말은 거의 다 용언 어간이다
 *      (「이을」의 「이」, 「짚는」의 「짚」)
 *   ④ 앞말이 **사전에 있는 명사**이고 **용언 어간이 아닐 때만** 잘못이라
 *      한다. 「짚」은 명사(볏짚)이면서 「짚다」의 어간이기도 하다
 */
/* 조사마다 믿음이 다르다.
 *
 * 「-을/-를」과 「-은/-는」은 뒷가지로 쓰이는 일이 없다. 「사람를」이면
 * 그냥 틀린 것이다.
 *
 * 나머지는 같은 글자가 **낱말을 만드는 뒷가지로도 쓰인다.**
 *
 *     예술가   -가(家)   조사 「가」가 아니다
 *     등산로   -로(路)   조사 「로」가 아니다
 *     국어과   -과(科)   조사 「과」가 아니다
 *
 * 사전에 그 합성어가 실려 있으면 걸러지지만, 우리 뜻풀이 사전은 표제어가
 * 5,358개뿐이라 다 막지 못한다. 그래서 이쪽은 **못 박지 않고 짚어만 둔다.**
 * data/korean-words.json 을 넣으면 이 구분이 필요 없어진다. */
const JOSA_CHECK = [
  ['은', '는', 'bad'], ['을', '를', 'bad'],
  ['이', '가', 'warn'], ['과', '와', 'warn'],
  ['으로', '로', 'warn'], ['이나', '나', 'warn'], ['이랑', '랑', 'warn'],
];
/* 어미와 부딪치는 것은 아예 안 본다 — 「-아/-어」「-(이)며」「-(이)라」.
   그것들은 받침이 아니라 모음조화와 품사가 정한다. */

for (const r of corpus) {
  if (r.word) continue;
  for (const tok of new Set(r.text.match(/[가-힣]+/g) || [])) {
    if (isKnown(tok)) continue;                                   // ①
    /* 용언일 수 있으면 안 본다 — 「기억나」는 「기억+나」가 아니라
       「기억나다」의 어간이다 */
    if (isKnown(tok + '다')) continue;
    /* 우리 글이 이 꼴을 세 번 넘게 썼으면 오타가 아니라 우리가 쓰는
       말이다. 「기어이」가 그랬다 */
    if ((seen.get(tok) || 0) >= 3) continue;
    const splits = [];
    for (const [withB, withoutB, level] of JOSA_CHECK) {
      for (const tail of [withB, withoutB]) {
        if (!tok.endsWith(tail) || tok.length - tail.length < 2) continue;   // ③
        const stem = tok.slice(0, -tail.length);
        const want = pickJosa(stem, withB, withoutB);
        if (want) splits.push({ stem, tail, want, level });
      }
    }
    if (!splits.length || splits.some((s) => s.want === s.tail)) continue;   // ②
    let solid = splits.find((s) => isNoun(s.stem) === true && !isKnown(s.stem + '다'));  // ④
    /* 짚어만 두는 조사는 한 번 더 거른다. 오타는 대개 한 번 나오고 만다 —
       우리가 여러 번 쓴 꼴이면 뒷가지가 붙은 낱말(예술가·등산로)이지
       조사를 잘못 쓴 것이 아니다. 그리고 고쳐 놓은 꼴이 우리 글 어디에도
       없다면, 고치라고 할 근거도 없다. */
    if (solid && solid.level === 'warn') {
      const mine = seen.get(tok) || 0, right = seen.get(solid.stem + solid.want) || 0;
      if (mine > 2 || right < 2) solid = null;
    }
    if (solid) {
      lint.add('조사 받침', solid.level, r, {
        found: tok, want: solid.stem + solid.want,
        why: '받침이 조사를 정한다 (「-(으)로」만 ㄹ 받침을 받침 없는 것처럼 친다)',
      });
      continue;
    }
    /* 사전에 없는 말이면 우리 글끼리 견준다 — 딴 데서 바른 꼴을 여러 번
       썼는데 여기만 다르면 오타일 가능성이 높다 */
    for (const s of splits) {
      if (isKnown(s.stem)) continue;
      const right = seen.get(s.stem + s.want) || 0;
      if (right >= 3 && (seen.get(tok) || 0) <= 1) {
        lint.add('조사 받침 (우리 글과 다름)', 'warn', r, {
          found: tok, want: s.stem + s.want,
          why: `딴 데서는 「${s.stem + s.want}」를 ${right}번 썼는데 여기만 다르다`,
        });
        break;
      }
    }
  }
}

/* ── 끝 ──────────────────────────────────────────────────────────── */
const chars = corpus.reduce((a, r) => a + r.text.length, 0);
const rc = lint.report(`글 조각 ${corpus.length.toLocaleString()}개 · ${chars.toLocaleString()}자를 봤다.`);
if (!bigDictLoaded() && !lint.accept) {
  console.log('\n※ data/korean-words.json (국립국어원 표제어 목록) 을 넣으면');
  console.log('   「사전에 아예 없는 말」까지 잡는다. 지금은 우리 뜻풀이 사전만 쓴다.');
}
process.exit(rc);
