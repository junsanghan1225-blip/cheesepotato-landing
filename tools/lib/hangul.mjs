/* 한글 낱자 계산 — 검사기들이 함께 쓴다.
 *
 * 맞춤법의 상당 부분은 **의견이 아니라 계산이다.** 받침이 있으면 「을」이고
 * 없으면 「를」이다. 받침이 있으면 「이에요」고 없으면 「예요」다. 여기에는
 * 예외도 문맥도 없다. 그런 것은 사람이 눈으로 볼 것이 아니라 기계가 잡아야
 * 한다.
 *
 * 반대로 「되/돼」나 「로서/로써」는 계산이 아니라 뜻이다. 그런 것은 여기
 * 두지 않는다 — check-spelling.mjs 가 확실한 꼴만 골라 잡는다.
 *
 * 이 파일의 규칙: **모르면 null 을 준다.** 지어내지 않는다.
 * gloss-find.js 맨 위의 「틀린 뜻을 내주느니 빈 칸을 내준다」와 같은 말이다.
 */

const BASE = 0xac00;          // 가
const LAST = 0xd7a3;          // 힣

/* 유니코드가 한글 음절을 담아 둔 차례 그대로다.
   (초성 19) × (중성 21) × (종성 28) = 11,172 자 */
export const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
export const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
export const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

export const isSyllable = (ch) => {
  if (!ch) return false;
  const c = ch.codePointAt(0);
  return c >= BASE && c <= LAST;
};

/* 음절 하나를 초·중·종성으로 가른다. 한글 음절이 아니면 null. */
export function decompose(ch) {
  if (!isSyllable(ch)) return null;
  const n = ch.codePointAt(0) - BASE;
  return {
    cho: CHO[Math.floor(n / 588)],
    jung: JUNG[Math.floor((n % 588) / 28)],
    jong: JONG[n % 28],
  };
}

/* 낱자를 도로 음절로 맞춘다. 활용형을 지어 볼 때 쓴다. */
export function compose(cho, jung, jong = '') {
  const i = CHO.indexOf(cho), j = JUNG.indexOf(jung), k = JONG.indexOf(jong);
  if (i < 0 || j < 0 || k < 0) return null;
  return String.fromCodePoint(BASE + (i * 21 + j) * 28 + k);
}

/* 숫자·로마자로 끝나는 말의 받침은 **읽는 소리**가 정한다.
   「TOPIK을」이 맞고 「TOPIK를」이 틀린 것은 K 를 「케이」가 아니라 받침
   ㄱ 으로 읽기 때문이 아니라, 「토픽」으로 읽기 때문이다. 이 표가 없으면
   숫자가 섞인 문장에서 조사 검사가 통째로 헛돈다. */
const DIGIT_JONG = { '0': 'ㅇ', '1': 'ㄹ', '2': '', '3': 'ㅁ', '4': '', '5': '', '6': 'ㄱ', '7': 'ㄹ', '8': 'ㄹ', '9': '' };
/* 로마자로 끝나는 말은 **읽어 봐야 안다.** 「TOPIK」은 「토픽」이라 받침이
   ㄱ 이지만, 낱글자 K 는 「케이」라 받침이 없다. 글자만 보고는 어느 쪽인지
   알 수 없다. 그래서 이 사이트에서 실제로 쓰는 말만 적어 두고, 나머지는
   모른다고 물러난다 — 지어낸 받침 하나가 없는 잘못을 수십 개 만든다. */
const ROMAN_TERM = {
  topik: 'ㄱ',      // 토픽
  eps: '',          // 이피에스
  ai: '',           // 에이아이
};

/* 말의 끝 받침. 모르면 null — 「없다(''）」와 「모른다(null)」는 다르다. */
export function finalJong(word) {
  if (!word) return null;
  const ch = word[word.length - 1];
  const d = decompose(ch);
  if (d) return d.jong;
  if (/[0-9]/.test(ch)) return DIGIT_JONG[ch];
  const tail = (word.match(/[A-Za-z]+$/) || [''])[0].toLowerCase();
  if (Object.prototype.hasOwnProperty.call(ROMAN_TERM, tail)) return ROMAN_TERM[tail];
  return null;
}

/* 받침이 있는가. 모르면 null. */
export function hasBatchim(word) {
  const j = finalJong(word);
  return j === null ? null : j !== '';
}

/* ㄹ 받침인가 — 「-(으)로」와 「-율/-률」이 이것만 따로 본다. */
export function isRieul(word) {
  return finalJong(word) === 'ㄹ';
}

/* 받침이 정하는 조사 짝. 앞의 것이 받침 있을 때, 뒤의 것이 없을 때. */
export const JOSA = [
  ['은', '는'], ['이', '가'], ['을', '를'], ['과', '와'],
  ['이나', '나'], ['이랑', '랑'], ['이며', '며'], ['이라', '라'],
  ['이라고', '라고'], ['이라는', '라는'], ['이여', '여'], ['아', '야'],
  ['으로', '로'], ['으로서', '로서'], ['으로써', '로써'], ['으로부터', '로부터'],
];

/* 이 말 뒤에 붙어야 할 조사. 모르면 null.
 *
 * 「-(으)로」만 셈이 다르다 — ㄹ 받침은 받침이 없는 것처럼 「로」를 쓴다.
 * 「연필로」가 아니라 「연필로」다. 이 한 줄을 빼먹으면 ㄹ 받침 낱말마다
 * 없는 잘못을 지어낸다. */
export function pickJosa(word, withBatchim, withoutBatchim) {
  const j = finalJong(word);
  if (j === null) return null;
  if (withBatchim.startsWith('으로') || withoutBatchim === '로') {
    return j === '' || j === 'ㄹ' ? withoutBatchim : withBatchim;
  }
  return j === '' ? withoutBatchim : withBatchim;
}

/* 「이에요/예요」 — 받침이 있으면 이에요, 없으면 예요.
   「이예요」는 어느 쪽으로도 맞을 수 없는 꼴이다. */
export function pickIeyo(word) {
  const b = hasBatchim(word);
  return b === null ? null : (b ? '이에요' : '예요');
}

/* 「-율/-률」 — 받침이 없거나 ㄴ 받침이면 율, 그 밖에는 률.
   비율·백분율·출석률·확률. 한글 맞춤법 제11항 붙임 1. */
export function pickYul(word) {
  const j = finalJong(word);
  if (j === null) return null;
  return (j === '' || j === 'ㄴ') ? '율' : '률';
}

/* 「-열/-렬」도 같은 규칙이다. 나열·분열·행렬. */
export function pickYeol(word) {
  const j = finalJong(word);
  if (j === null) return null;
  return (j === '' || j === 'ㄴ') ? '열' : '렬';
}

/* 모음조화 — 어간 끝 모음이 ㅏ·ㅗ 면 「-아」, 그 밖에는 「-어」.
   ㅏㅗ 가 아닌데 「-아」가 붙어 있으면 의심할 만하다. 다만 「하다」와
   불규칙 활용이 수두룩해서, 이것만으로 잘못이라 못 박지 않는다. */
export function harmonyVowel(stem) {
  for (let i = stem.length - 1; i >= 0; i--) {
    const d = decompose(stem[i]);
    if (!d) continue;
    if (d.jung === 'ㅏ' || d.jung === 'ㅗ') return '아';
    return '어';
  }
  return null;
}

/* 한글이 한 글자라도 있는가 — 영어만 있는 줄은 건너뛰려고 쓴다. */
export const hasHangul = (s) => typeof s === 'string' && /[가-힣]/.test(s);

/* 한글 낱말만 남긴다(조사·어미 판정 앞에서 쓴다). */
export const HANGUL_WORD = /[가-힣]+/g;
