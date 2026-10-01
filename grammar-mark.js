/* 문법 이름에서 「예문 속 그 문법 부분」을 찾는 정규식을 만든다.
   화면(app.module.js 색칠)과 쓰임 보기 도구(tools/build-grammar-usage.mjs)가 같이 쓴다 — 둘이 어긋나면
   찾아 온 문장에 칠할 곳이 없거나, 칠한 곳이 다른 문법이 된다.

   조사(「N은/는」)는 낱말 끝의 「은 · 는」. 꼬리(「-(으)면서」)는 받침에 따라 바뀌는 앞머리를 떼고 남는 「면서」.
   떼어 낸 앞머리는 「앞 글자」 조건으로 되살린다 — 엉뚱한 곳을 잡지 않게:
     · 「-(으)ㄴ 후에」 → 앞 글자 받침이 ㄴ(끝난 후에 ○ · 오후에 ✗)
     · 「-(으)ㄹ까요」 → 앞 글자 받침이 ㄹ(먹을까요 ○ · 빠르니까요 ✗)
     · 「-았/었…」 → 앞 글자 받침이 ㅆ(있 · 없 · 겠 빼고)
     · 「-아/어 주세요」 → 앞 글자가 받침 없음(해 주세요 ○ · 한 장 주세요 ✗)
     · 그 밖의 꼬리 → 낱말 가운데(앞에 한글이 붙어 있음)
   남는 꼴이 한 글자뿐이면(「-아/어서」 → 「서」) null(칠하지 않음). */
const escRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const cls = new Map();
/* 받침이 f 인 글자 전부(f = '' 이면 받침 없는 글자) — 정규식 글자 묶음으로 */
function withF(f, skip = '') {
  const k = f + '|' + skip;
  if (!cls.has(k)) {
    const fi = JONG.indexOf(f); let s = '';
    for (let c = 0; c < 11172; c++) if (c % 28 === fi) { const ch = String.fromCharCode(0xac00 + c); if (!skip.includes(ch)) s += ch; }
    cls.set(k, `[${s}]`);
  }
  return cls.get(k);
}
/* 꼴만 같고 뜻이 다른 낱말 — 「는 중」 뒤에 「요」가 오면 「중요하다」 */
const NOUN_END = ['중', '때', '후', '전', '데', '지', '척', '듯', '법', '뻔', '리', '만큼', '대로', '채로', '바', '한', '통에', '길에', '김에', '이상', '셈', '편'];
/* 꼴이 같아 다른 말을 잡는 자리 — 앞(PREV) · 뒤(NEXT)에 이 글자가 오면 그 문법이 아니다.
   「-(으)러 가다」 ↔ 「여러 가지」, 「-고 말다」 ↔ 「-고 말하다」, 「-(으)면서」 ↔ 「-다면서(요)」(들은 말 옮기기) */
const NOT_PREV = { '면서': '다라', '고 해서': '다라', '고 말': '다라' };
const NOT_NEXT = { '러 가': '지', '다면': '서', '기에': '서' };
/* 뒤에 이 글자만 와야 그 문법 — 「-고 말다」는 말았다 · 말겠다 · 말 거예요(말리다 · 말하다를 거른다) */
const YES_NEXT = { '고 말': '았겠아\\s' };

export function grammarMarkRe(name) {
  name = String(name || '');
  if (/^N[(이가-힣]/.test(name) && !/-/.test(name)) {
    const alts = [...new Set(name.split(/[\s,/·]+/).map((x) => x.replace(/^N/, '').replace(/[①②③]|\(.*?\)$/g, ''))
      .flatMap((x) => (/^\(이\)/.test(x) ? ['이' + x.slice(3), x.slice(3)] : [x])).filter((x) => /^[가-힣]+$/.test(x)))]
      .sort((a, b) => b.length - a.length);
    return alts.length ? new RegExp(`(?<=[가-힣])(${alts.map(escRe).join('|')})(?=[\\s.,!?]|$)`, 'g') : null;
  }
  const part = name.split(/,\s*/).find((x) => /(^|[AV/])-/.test(x));
  if (!part) return null;
  let tpl = part.replace(/^(A\/V|A|V)?-/, '').replace(/\s*[①②③]/g, '').replace(/\s*\([가-힣 ·]+\)\s*$/, '');
  let before = '(?<=[가-힣])';
  const lead = /^(\(으\)ㄴ\/는(\/\(으\)ㄹ)?|\(으\)|\(스\)|\(느\)|아\/어|았\/었)/.exec(tpl);
  tpl = tpl.slice(lead ? lead[0].length : 0);
  const kind = lead ? lead[0] : '';
  if (kind === '았/었') before = `(?<=${withF('ㅆ', '있없겠')})`;
  const jam = /^[ㄴㄹㅁㅂ]/.exec(tpl);
  if (jam && !kind.startsWith('(으)ㄴ/는')) { tpl = tpl.slice(1); before = `(?<=${withF(jam[0])}${/^\s/.test(tpl) ? '\\s' : ''})`; tpl = tpl.trim(); }
  else if (kind === '아/어') { before = `(?<=${withF('')}${/^\s/.test(tpl) ? '\\s' : ''})`; }
  tpl = tpl.replace(/([가-힣]+)\/[가-힣]+/g, '$1').replace(/\?$/, '').trim();
  /* 「-(으)ㄴ/는 대로」 — 앞은 꾸미는 꼴(ㄴ 받침 · 는, /(으)ㄹ 이면 ㄹ 받침도). 「차례대로」(토씨)를 거른다 */
  if (kind.startsWith('(으)ㄴ/는')) {
    tpl = tpl.replace(/^ㄴ\/는/, '');
    const sp = /^\s/.test(tpl) ? '\\s' : '';
    before = `(?<=(?:${withF('ㄴ')}|는${kind.includes('ㄹ') ? `|${withF('ㄹ')}` : ''})${sp})`;
  }
  if (/\s/.test(tpl)) tpl = tpl.replace(/다$/, '');
  const n = tpl.replace(/\s/g, '').length;
  if (!/^[가-힣 ]+$/.test(tpl) || n < (kind === '아/어' || kind === '았/었' ? 3 : 2)) return null;
  /* 앞 글자 조건이 받침 없음 · ㅆ 처럼 넓은 것은 꼴이 두 글자 이상이어야 */
  const words = tpl.split(/\s+/), last = words[words.length - 1];
  const after = words.length > 1 && NOUN_END.includes(last) ? '(?=[\\s.,!?에이은을의도만입]|$)' : '';
  /* 「-니까」 앞이 ㅂ 받침이면 「-ㅂ니까」(하십니까) — 다른 문법 */
  const notB = /^니까/.test(tpl) ? `(?<!${withF('ㅂ')})` : '';
  const np = NOT_PREV[tpl] ? `(?<![${NOT_PREV[tpl]}])` : '';
  const nn = (NOT_NEXT[tpl] ? `(?![${NOT_NEXT[tpl]}])` : '') + (YES_NEXT[tpl] ? `(?=[${YES_NEXT[tpl]}])` : '');
  /* 띄어 쓴 자리는 꼭 띄어야 한다 — 「-는 데」(시간이 걸리는 데) 와 「-는데」는 다른 문법 */
  return new RegExp(before + notB + np + escRe(tpl).replace(/ /g, '\\s+') + after + nn, 'g');
}
