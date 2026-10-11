/* 소리 나는 대로 — 낱말 하나의 표준 발음(표준 발음법) 규칙 엔진(운영자 2026-10-11 「3번」).
   pron(head, pos) → null(바뀌는 게 없거나 확실하지 않음) | { s: '가치', rules: ['palatal', …] }

   ⚠ 「확실한 것만」 말한다. 아래는 일부러 null(= 화면에 아무것도 안 보여 줌)로 두는 경우:
   · ㄴ 첨가가 될 수도 안 될 수도 있는 말(받침 뒤 이 · 야 · 여 · 요 · 유 — 꽃잎 [꼰닙] / 먹이 [머기])
   · 한자어 ㄹ 뒤 경음화(발달 [발딸] / 물고기 [물고기]) · 3글자 이상의 ㄴㄹ 만남(생산량 [생산냥] / 신라 [실라])
   · 받침 뒤 모음 ㅢ(협의 [혀븨/혀비]), 합성어 경계가 의심되는 말(맛있다 · 멋있다 · 젊은이 …)
   틀린 발음을 가르치느니 빈칸이 낫다(gloss-find.js 와 같은 원칙).
   한 낱말 안에서만 본다 — 띄어 쓴 구절 · 낱말 사이 연음은 다루지 않는다. */

const L = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const V = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const T = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const TENSE = { ㄱ: 'ㄲ', ㄷ: 'ㄸ', ㅂ: 'ㅃ', ㅅ: 'ㅆ', ㅈ: 'ㅉ' };
const ASP = { ㄱ: 'ㅋ', ㄷ: 'ㅌ', ㅈ: 'ㅊ' };
const SPLIT = { ㄳ: ['ㄱ', 'ㅅ'], ㄵ: ['ㄴ', 'ㅈ'], ㄶ: ['ㄴ', 'ㅎ'], ㄺ: ['ㄹ', 'ㄱ'], ㄻ: ['ㄹ', 'ㅁ'], ㄼ: ['ㄹ', 'ㅂ'], ㄽ: ['ㄹ', 'ㅅ'], ㄾ: ['ㄹ', 'ㅌ'], ㄿ: ['ㄹ', 'ㅍ'], ㅀ: ['ㄹ', 'ㅎ'], ㅄ: ['ㅂ', 'ㅅ'] };
// 겹받침이 받침 자리에서 나는 소리(자음 앞 · 끝) — 표준 발음법 제10 · 11항
const DOUBLE_REP = { ㄳ: 'ㄱ', ㄵ: 'ㄴ', ㄶ: 'ㄴ', ㄺ: 'ㄱ', ㄻ: 'ㅁ', ㄼ: 'ㄹ', ㄽ: 'ㄹ', ㄾ: 'ㄹ', ㄿ: 'ㅂ', ㅀ: 'ㄹ', ㅄ: 'ㅂ' };
const SINGLE_REP = { ㄲ: 'ㄱ', ㅋ: 'ㄱ', ㅅ: 'ㄷ', ㅆ: 'ㄷ', ㅈ: 'ㄷ', ㅊ: 'ㄷ', ㅌ: 'ㄷ', ㅍ: 'ㅂ', ㅎ: 'ㄷ' };
const OBS = new Set(['ㄱ', 'ㄷ', 'ㅂ']);
const Y_VOWEL = new Set(['ㅣ', 'ㅑ', 'ㅕ', 'ㅛ', 'ㅠ']);
const NASAL = { ㄱ: 'ㅇ', ㄷ: 'ㄴ', ㅂ: 'ㅁ' };

// 합성어 경계가 의심돼 일부러 말하지 않는 낱말
const SKIP = new Set(['맛있다', '멋있다', '맛없다', '멋없다', '젊은이', '늙은이', '꽃잎', '깻잎', '솜이불', '색연필']);

const split = (ch) => {
  const c = ch.charCodeAt(0) - 0xac00;
  if (c < 0 || c > 11171) return null;
  return { l: L[Math.floor(c / 588)], v: V[Math.floor((c % 588) / 28)], t: T[c % 28] };
};
const join = (s) => {
  const li = L.indexOf(s.l), vi = V.indexOf(s.v), ti = T.indexOf(s.t);
  if (li < 0 || vi < 0 || ti < 0) return null;
  return String.fromCharCode(0xac00 + li * 588 + vi * 28 + ti);
};

export function pron(head, pos = '') {
  const w = String(head || '').trim();
  if (!w || SKIP.has(w) || ![...w].every((c) => split(c))) return null;   // 한글 음절만(띄어쓰기 · 기호 · 영어가 끼면 말하지 않는다)
  const ss = [...w].map(split), orig = ss.map((x) => ({ ...x }));
  const isVerb = pos === '동사' || pos === '형용사';
  const rules = new Set();
  const note = (r) => rules.add(r);
  if (w === '밟다') return { s: '밥따', rules: ['rep', 'tense'] };   // 밟 — 예외(ㄼ → [ㅂ])
  const n = ss.length;
  if (ss.some((x, i) => i > 0 && x.l === 'ㅇ' && x.v === 'ㅢ')) return null;   // 가운데 · 끝의 의 — [의/이] 둘 다 표준(협의 [혀븨/혀비])

  for (let i = 0; i < n - 1; i++) {
    const a = ss[i], b = ss[i + 1];
    if (!a.t) continue;
    const t0 = a.t;

    // ── ㅎ 받침 ─────────────────────────────────────────
    if (t0 === 'ㅎ' || t0 === 'ㄶ' || t0 === 'ㅀ') {
      const keep = t0 === 'ㅎ' ? '' : SPLIT[t0][0];
      if (b.l === 'ㅇ') { a.t = keep; note('hdrop'); if (keep) { b.l = keep; a.t = ''; note('liaison'); } continue; }
      if (ASP[b.l]) { a.t = keep; b.l = ASP[b.l]; note('aspir'); continue; }
      if (keep === 'ㄹ' && b.l === 'ㄴ') { if (n > 2) return null; a.t = 'ㄹ'; b.l = 'ㄹ'; note('lateral'); continue; }   // 싫네 [실레]
      if (b.l === 'ㄴ' || b.l === 'ㅁ') { a.t = keep || 'ㄴ'; if (!keep) note('nasal'); else note('rep'); continue; }
      if (b.l === 'ㅅ') return null;   // 낳소 · 않소 — 쓰임이 드물고 헷갈린다
      a.t = keep || 'ㄷ'; note('rep');
      // 아래 규칙(경음화 등)은 바뀐 받침으로 이어서 본다
    }

    const cur = a.t;
    if (!cur) continue;

    // ── 모음으로 시작하는 다음 글자(ㅇ) — 연음 ─────────────
    if (b.l === 'ㅇ') {
      if (cur === 'ㅇ') continue;   // ㅇ 받침은 그대로
      if (Y_VOWEL.has(b.v) && !(b.v === 'ㅣ' && !SPLIT[cur] && (cur === 'ㄷ' || cur === 'ㅌ'))) {
        // 받침 + 이·야·여·요·유: ㄴ 첨가(꽃잎 [꼰닙]) 인지 그냥 연음(먹이 [머기])인지 낱말 안에서는 알 수 없다
        return null;
      }
      if (SPLIT[cur]) {
        const [x, y] = SPLIT[cur];
        a.t = x; b.l = (cur === 'ㄳ' || cur === 'ㅄ' || cur === 'ㄽ') ? 'ㅆ' : y;   // 몫이 [목씨] · 값이 [갑씨] · 곬이 [골씨]
        note('liaison'); note('double');
      } else {
        // ㄷ · ㅌ + 이 → 구개음화(굳이 [구지] · 같이 [가치])
        if (b.v === 'ㅣ' && (cur === 'ㄷ' || cur === 'ㅌ')) { b.l = cur === 'ㄷ' ? 'ㅈ' : 'ㅊ'; note('palatal'); }
        else b.l = cur;
        a.t = ''; note('liaison');
      }
      continue;
    }

    // ── 받침 뒤 자음 ───────────────────────────────────
    // ㄱ · ㄷ · ㅂ 받침 + ㅎ → 격음화(입학 [이팍] · 먹히다 [머키다] · 닫히다 [다치다])
    if (b.l === 'ㅎ' && (OBS.has(cur) || SINGLE_REP[cur] === 'ㄷ' || cur === 'ㄲ' || cur === 'ㅋ' || cur === 'ㅍ')) {
      const rep = SINGLE_REP[cur] || cur;
      const asp = { ㄱ: 'ㅋ', ㄷ: 'ㅌ', ㅂ: 'ㅍ' }[rep];
      if (asp) {
        a.t = ''; b.l = asp; note('aspir');
        if (asp === 'ㅌ' && b.v === 'ㅣ') { b.l = 'ㅊ'; note('palatal'); }
        continue;
      }
    }
    if (b.l === 'ㅎ' && DOUBLE_REP[cur]) return null;   // 읽히다 같은 겹받침 + ㅎ — 말하지 않는다

    let rep = DOUBLE_REP[cur] || SINGLE_REP[cur] || cur;
    if (DOUBLE_REP[cur]) {
      if (cur === 'ㄺ' && b.l === 'ㄱ') rep = 'ㄹ';   // 읽고 [일꼬] — 제11항 다만
      if (cur === 'ㄼ' && /^넓[죽둥]/.test(w.slice(i))) return null;
      note('double');
    } else if (SINGLE_REP[cur] || cur === 'ㄲ') note('rep');
    a.t = rep;

    // 비음화 · ㄹ의 비음화
    if (NASAL[rep] && (b.l === 'ㄴ' || b.l === 'ㅁ')) { a.t = NASAL[rep]; note('nasal'); continue; }
    if (b.l === 'ㄹ') {
      if (rep === 'ㅁ' || rep === 'ㅇ') { b.l = 'ㄴ'; note('nasal'); continue; }
      if (NASAL[rep]) { b.l = 'ㄴ'; a.t = NASAL[rep]; note('nasal'); continue; }
      if (rep === 'ㄴ') { if (n > 2) return null; a.t = 'ㄹ'; b.l = 'ㄹ'; note('lateral'); continue; }   // 신라 [실라] — 3글자 이상은 예외가 많다
    }
    if (rep === 'ㄹ' && b.l === 'ㄴ') { if (n > 2) return null; b.l = 'ㄹ'; note('lateral'); continue; }   // 칼날 [칼랄]

    // 경음화 — ㄱ · ㄷ · ㅂ 받침 뒤 ㄱㄷㅂㅅㅈ
    if (OBS.has(rep) && TENSE[b.l]) { b.l = TENSE[b.l]; note('tense'); continue; }
    // 동사 · 형용사 어간 ㄴ · ㅁ(ㄵ · ㄻ 포함) + 다 → 앉다 [안따] · 감다 [감따]
    if ((rep === 'ㄴ' || rep === 'ㅁ') && isVerb && i === n - 2 && b.l === 'ㄷ' && b.v === 'ㅏ' && !b.t && (cur === 'ㄴ' || cur === 'ㅁ' || cur === 'ㄵ' || cur === 'ㄻ')) { b.l = 'ㄸ'; note('tense'); continue; }
    // ㄼ · ㄾ 어간 + ㄱㄷㅅㅈ → 넓다 [널따] · 핥다 [할따]
    if ((cur === 'ㄼ' || cur === 'ㄾ' || cur === 'ㄽ') && TENSE[b.l] && b.l !== 'ㅂ' && isVerb) { b.l = TENSE[b.l]; note('tense'); continue; }
    // 한자어 ㄹ 뒤 경음화(발달 [발딸]) · 고유어(물고기)는 낱말 안에서 구별할 수 없다
    if (rep === 'ㄹ' && !DOUBLE_REP[cur] && (b.l === 'ㄷ' || b.l === 'ㅅ' || b.l === 'ㅈ') && !(isVerb && i === n - 2 && b.l === 'ㄷ')) return null;
  }

  // 마지막 글자 받침
  const last = ss[n - 1];
  if (last.t) {
    if (DOUBLE_REP[last.t]) { last.t = DOUBLE_REP[last.t]; note('double'); }
    else if (SINGLE_REP[last.t] || last.t === 'ㄲ') { last.t = SINGLE_REP[last.t] || 'ㄱ'; note('rep'); }
  }

  // 모음 — ㅈ · ㅉ · ㅊ + ㅕ → [ㅓ], 희 → [히], 자음 + ㅢ → [ㅣ]
  for (let i = 0; i < n; i++) {
    const x = ss[i];
    if ((x.l === 'ㅈ' || x.l === 'ㅉ' || x.l === 'ㅊ') && x.v === 'ㅕ') { x.v = 'ㅓ'; note('vowel'); }
    if (x.v === 'ㅢ') {
      if (x.l === 'ㅇ') { if (i > 0) return null; }   // 첫 글자 의 — 그대로. 가운데 · 끝의 의는 [의/이] 둘 다 허용
      else { x.v = 'ㅣ'; note('vowel'); }
    }
  }

  const out = ss.map(join);
  if (out.some((c) => !c)) return null;
  const s = out.join('');
  if (s === w) return null;
  // 말할 규칙이 하나도 안 잡혔는데 글자만 바뀌었다면 무언가 놓친 것 — 말하지 않는다
  if (!rules.size) return null;
  return { s, rules: [...rules] };
}

// 화면에 쓰는 규칙 이름(영어 먼저, 한국어 병기)
export const PRON_RULES = {
  liaison: ['연음', 'Liaison', 'A final consonant moves over to the next syllable when that one starts with ㅇ.'],
  rep: ['받침 소리', 'Final-consonant sound', 'A final consonant is said as one of seven sounds (ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅇ).'],
  double: ['겹받침', 'Double final consonant', 'Only one of the two final consonants is said (닭 → [닥]).'],
  nasal: ['비음화', 'Nasalization', 'ㄱ ㄷ ㅂ before ㄴ ㅁ turn into ㅇ ㄴ ㅁ (and ㄹ after ㅁ ㅇ ㄱ ㅂ becomes ㄴ).'],
  tense: ['경음화', 'Tensing', 'ㄱ ㄷ ㅂ ㅅ ㅈ after a ㄱ ㄷ ㅂ sound become tense (ㄲ ㄸ ㅃ ㅆ ㅉ).'],
  lateral: ['유음화', 'Lateralization', 'ㄴ next to ㄹ becomes ㄹ.'],
  aspir: ['격음화', 'Aspiration', 'ㅎ next to ㄱ ㄷ ㅂ ㅈ makes the harder sound ㅋ ㅌ ㅍ ㅊ.'],
  hdrop: ['ㅎ 탈락', 'Silent ㅎ', 'A final ㅎ is not said before a vowel.'],
  palatal: ['구개음화', 'Palatalization', 'ㄷ ㅌ before 이 sound like ㅈ ㅊ.'],
  vowel: ['모음 소리', 'Vowel sound', 'ㅈ ㅊ + ㅕ is said ㅓ; ㅢ after a consonant is said ㅣ.'],
};
