/* 한국어 활용 · 로마자 — 낱말 쪽(build-pages.mjs)의 「활용」 표와 로마자에 쓴다(docs/vocab-plan.md 5층).
 *
 * **틀린 활용을 보여 주느니 안 보여 준다.** 불규칙은 글자 모양만 보고는 못 가린다(입다 → 입어요, 춥다 → 추워요).
 * 그래서 불규칙 낱말은 아래 목록으로 적어 두고, 목록 밖에서 헷갈리는 꼴(목록에 없는 ㅂ · ㄷ · ㅅ 받침 동사 등)은
 * 규칙으로 보되 check-conj.mjs 의 정답표로 지킨다. 활용이 애매한 낱말(이다 · 아니다 · 띄어 쓴 말)은 null 을 돌려
 * 쪽에서 표를 빼게 한다.
 *
 * 보여 주는 꼴(초급 교재의 첫 다섯): 현재(-아요/어요) · 과거(-았어요/었어요) · 미래(-(으)ㄹ 거예요) ·
 * -고 · 꾸미는 꼴(동사 -는 · 형용사 -(으)ㄴ). */

const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const split = (ch) => {
  const c = ch.charCodeAt(0) - 0xac00;
  if (c < 0 || c > 11171) return null;
  return [Math.floor(c / 588), Math.floor((c % 588) / 28), c % 28];
};
const join = (i, v, f = 0) => String.fromCharCode(0xac00 + i * 588 + v * 28 + f);
const V = (s) => JUNG.indexOf(s);
const F = (s) => JONG.indexOf(s);
const setF = (ch, f) => { const [i, v] = split(ch); return join(i, v, F(f)); };
const dropF = (ch) => { const [i, v] = split(ch); return join(i, v, 0); };

/* 불규칙 목록 — TOPIK I · 초급에 나오는 것. 늘릴 때는 check-conj.mjs 에 정답도 적는다. */
const B_VERB = new Set(['눕다', '줍다', '굽다', '돕다', '여쭙다']);              // ㅂ 불규칙 동사(나머지 ㅂ 동사는 규칙: 입다 · 잡다)
const B_ADJ_REG = new Set(['좁다']);                                  // ㅂ 받침 형용사 중 규칙인 것
const B_WA = new Set(['돕다', '곱다']);                               // ㅂ → 와(도와요)
const D_IRR = new Set(['듣다', '걷다', '묻다', '싣다', '깨닫다']);     // ㄷ → ㄹ
const S_IRR = new Set(['낫다', '짓다', '붓다', '잇다', '젓다']);       // ㅅ 탈락
const REU_REG = new Set(['따르다', '치르다', '들르다']);              // 르 인데 으 탈락만(따라요)
const HON_SI = new Set(['계시다', '드시다', '주무시다', '잡수시다', '편찮으시다']);   // 높임 -시다: 계세요
const SKIP = new Set(['이다', '아니다']);

const bright = (ch) => { const s = split(ch); return s && (s[1] === V('ㅏ') || s[1] === V('ㅗ') || s[1] === V('ㅑ')); };

/* 어간 + 아/어 — 「가」 「먹어」 「해」 처럼 요를 붙이기 전 꼴. */
function aeo(head, pos) {
  const st = head.slice(0, -1);
  const last = st.slice(-1), front = st.slice(0, -1);
  const s = split(last);
  if (!s) return null;
  const [i, v, f] = s;
  if (last === '하') return front + '해';
  if (HON_SI.has(head)) return front + '셔';                   // 계셔(요) — 현재는 따로 「세요」
  if (f === 0) {
    if (last === '르' && front && !REU_REG.has(head)) {         // 르 불규칙: 빨라 · 불러
      const p = front.slice(-1);
      return front.slice(0, -1) + setF(p, 'ㄹ') + (bright(p) ? '라' : '러');
    }
    if (v === V('ㅡ')) {                                          // 으 탈락: 바빠 · 써 · 따라
      const p = front.slice(-1);
      const nv = front && bright(p) ? V('ㅏ') : V('ㅓ');
      return front + join(i, nv);
    }
    if (v === V('ㅏ') || v === V('ㅓ') || v === V('ㅐ') || v === V('ㅔ') || v === V('ㅕ') || v === V('ㅒ')) return st;
    if (v === V('ㅗ')) return front + join(i, V('ㅘ'));
    if (v === V('ㅜ')) return front + join(i, V('ㅝ'));
    if (v === V('ㅣ')) return front + join(i, V('ㅕ'));
    if (v === V('ㅚ')) return front + join(i, V('ㅙ'));
    return st + '어';                                             // ㅟ · ㅢ · ㅑ … : 쉬어
  }
  const fin = JONG[f];
  if (fin === 'ㅂ' && (pos === '형용사' ? !B_ADJ_REG.has(head) : B_VERB.has(head)))
    return front + dropF(last) + (B_WA.has(head) ? '와' : '워');
  if (fin === 'ㄷ' && D_IRR.has(head)) return front + setF(last, 'ㄹ') + '어';
  if (fin === 'ㅅ' && S_IRR.has(head)) return front + dropF(last) + (bright(last) ? '아' : '어');
  if (fin === 'ㅎ' && pos === '형용사' && head !== '좋다') {         // 그래 · 빨개 · 하얘
    const ny = v === V('ㅑ') || v === V('ㅕ') ? V('ㅒ') : V('ㅐ');
    return front + join(i, ny);
  }
  return st + (bright(last) ? '아' : '어');
}

/* 어간에 「-(으)」로 시작하는 꼬리를 붙일 앞꼴. withL: -(으)ㄹ 처럼 ㄹ 이 붙는 꼴(ㄹ 받침은 그대로 둔다). */
function euStem(head, pos) {
  const st = head.slice(0, -1);
  const last = st.slice(-1), front = st.slice(0, -1);
  const [, , f] = split(last);
  const fin = JONG[f];
  if (f === 0) return { st, bare: true };
  if (fin === 'ㄹ') return { st, rieul: true };
  if (fin === 'ㅂ' && (pos === '형용사' ? !B_ADJ_REG.has(head) : B_VERB.has(head))) return { st: front + dropF(last) + '우', bare: true };   // 돕다도 도우세요 · 도울 — 「와」는 아/어 앞에서만
  if (fin === 'ㄷ' && D_IRR.has(head)) return { st: front + setF(last, 'ㄹ') + '으', bare: true };
  if (fin === 'ㅅ' && S_IRR.has(head)) return { st: front + dropF(last) + '으', bare: true };
  if (fin === 'ㅎ' && pos === '형용사' && head !== '좋다') return { st: front + dropF(last), bare: true };
  return { st: st + '으', bare: true };
}
const addL = (s) => s.slice(0, -1) + setF(s.slice(-1), 'ㄹ');
const addN = (s) => s.slice(0, -1) + setF(s.slice(-1), 'ㄴ');

export function conjugate(head, pos) {
  if (!/^[가-힣]+다$/.test(head) || head.length < 2 || SKIP.has(head)) return null;
  if (pos !== '동사' && pos !== '형용사') return null;
  const st = head.slice(0, -1);
  const a = aeo(head, pos);
  if (!a) return null;
  const present = HON_SI.has(head) ? st.slice(0, -1) + '세요' : a + '요';
  const past = addSs(a) + '어요';
  const e = euStem(head, pos);
  const future = (e.rieul ? e.st : addL(e.st)) + ' 거예요';
  const and = st + '고';
  const out = [['present', present], ['past', past], ['future', future], ['and', and]];
  const isStay = head === '있다' || head === '없다' || head.endsWith('있다') || head.endsWith('없다');
  /* -(으)세요 는 뺀다 — 「걸리세요」 「좋아지세요」처럼 저절로 되는 동사에서 어색해서, 낱말마다 가리기 전에는 싣지 않는다. */
  if (pos === '동사') {
    out.push(['mod', (e.rieul ? e.st.slice(0, -1) + dropF(e.st.slice(-1)) : st) + '는']);
  } else {
    out.push(['mod', isStay ? st + '는' : e.rieul ? e.st.slice(0, -1) + setF(e.st.slice(-1), 'ㄴ') : addN(e.st)]);
  }
  return out;
}
/* 과거 받침 ㅆ — 「가」 → 「갔」, 「먹어」 → 「먹었」. 끝 글자에 받침이 없어야 하는데 aeo 는 늘 그렇다. */
function addSs(a) { return a.slice(0, -1) + setF(a.slice(-1), 'ㅆ'); }
/* ‘으세요’ 꼴이 받침 없는 어간에서 「으」를 달지 않게 — euStem 이 bare 어간에 「으」를 붙이지 않으므로
   받침 있는 어간(먹 → 먹으)만 「으」가 붙는다. */

/* ── 로마자(국어의 로마자 표기법) ────────────────────────────────
   **소리 나는 대로** 적는다(먹다 → meokda, 좋아요 → joayo, 학교 → hakgyo). 받침 → 다음 첫소리 넘어가기(연음)와
   흔한 소리 바뀜 몇 가지(ㄴㄹ · 비음화 · ㅎ 탈락)만 다룬다 — 전부 다루려면 표준 발음 사전이 필요하다. */
const R_I = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const R_V = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
/* 받침의 대표음(다음이 자음일 때). */
const REP = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
/* 다음 글자가 ㅇ 일 때(연음): [남는 소리, 넘어가는 첫소리 번호]. null = 넘어가지 않음. 겹받침은 뒤쪽이 넘어간다.
   ㅎ · ㄶ · ㅀ 의 ㅎ 은 모음 앞에서 소리 나지 않는다(좋아요 → joayo, 괜찮아요 → gwaenchanayo). */
const MOVE = [null, ['', 0], ['', 1], ['k', 9], ['', 2], ['n', 12], ['', 2], ['', 3], ['', 5], ['l', 0], ['l', 6], ['l', 7],
  ['l', 9], ['l', 16], ['l', 17], ['', 5], ['', 6], ['', 7], ['p', 9], ['', 9], ['', 10], null, ['', 12], ['', 14], ['', 15],
  ['', 16], ['', 17], ['', -1]];
export function romanize(word) {
  const pred = /다$/.test(word);   // 풀이씨(동사 · 형용사)는 ㄱㄷㅂ + ㅎ 를 거센소리로 적는다(급하다 geupada) — 이름씨는 안 한다(입학 iphak)
  const sy = [...word].map((c) => split(c));
  if (!sy.length || sy.some((x) => !x)) return null;
  let out = '', prevL = false;
  for (let k = 0; k < sy.length; k++) {
    const [i, v, f] = sy[k];
    const nx = sy[k + 1];
    out += i === 5 && prevL ? 'l' : R_I[i];
    out += R_V[v];
    prevL = false;
    if (!f) continue;
    if (nx && nx[0] === 11) {                                     // 연음
      const m = MOVE[f];
      if (!m) { out += 'ng'; continue; }                          // ㅇ 받침은 그대로
      out += m[0];
      if (m[1] >= 0) sy[k + 1] = [m[1], nx[1], nx[2]];
      continue;
    }
    if (nx && (f === 27 || f === 6 || f === 15)) {                // ㅎ(ㄶ · ㅀ) + ㄱㄷㅈ → 거센소리: 좋다 jota · 많다 manta
      const asp = { 0: 15, 3: 16, 12: 14 }[nx[0]];
      if (asp != null) { out += f === 6 ? 'n' : f === 15 ? 'l' : ''; sy[k + 1] = [asp, nx[1], nx[2]]; continue; }
    }
    if (pred && nx && nx[0] === 18 && [1, 7, 17, 19, 22].includes(f)) {   // ㄱ ㄷ ㅂ ㅅ ㅈ + ㅎ
      sy[k + 1] = [{ 1: 15, 7: 16, 17: 17, 19: 16, 22: 14 }[f], nx[1], nx[2]];
      continue;
    }
    let r = REP[f];
    if (nx && (nx[0] === 2 || nx[0] === 6)) r = { k: 'ng', t: 'n', p: 'm' }[r] || r;   // 비음화: 학년 hangnyeon · 국물 gungmul
    if (nx && nx[0] === 5 && r === 'n') r = 'l';                  // 신라 silla
    if (nx && nx[0] === 2 && r === 'l') sy[k + 1] = [5, nx[1], nx[2]];   // 설날 seollal
    out += r;
    prevL = r === 'l';
  }
  return out;
}
