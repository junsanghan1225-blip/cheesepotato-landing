/* 고운돋움에서 영어(라틴 글자 · 숫자 · 기본 부호)를 빼는 거름 — 운영자 2026-11-21 「영어만 Pretendard 동의해」.
   @font-face 의 unicode-range 에서 U+0000~024F(기본 라틴 · 확장) · U+0300~036F(덧붙는 부호) · U+1D00~1EFF(베트남어 등 라틴 확장)를 지운다.
   그 글자는 고운돋움에 없는 셈이 되어 브라우저가 글꼴 목록의 다음(Pretendard)으로 그린다. 한글 · 「」 · — 같은 문장 부호는 고운돋움 그대로.
   tools/vendor.mjs(고운돋움을 다시 받을 때)와 한 번 손으로 고칠 때가 같은 함수를 쓴다. */
const CUT = [[0x0000, 0x024f], [0x0300, 0x036f], [0x1d00, 0x1eff]];
const hex = (n) => n.toString(16).toUpperCase();
const clipRange = (a, b) => {
  let parts = [[a, b]];
  for (const [ca, cb] of CUT) parts = parts.flatMap(([x, y]) => (y < ca || x > cb) ? [[x, y]] : [x < ca ? [x, ca - 1] : null, y > cb ? [cb + 1, y] : null].filter(Boolean));
  return parts;
};
export function stripLatin(css) {
  /* 이름표 주석(「latin」 같은 것)은 그 블록과 같이 지우거나 남긴다. 맨 위 저작권 주석은 뒤에 @font-face 가 바로 붙어도 지우지 않는다(블록이 남으므로) */
  return css.replace(/(\/\*[^*]*\*\/\s*)?@font-face\s*\{[^}]*\}\s*/g, (block, label = '') => {
    const m = block.match(/unicode-range:\s*([^;]+);/);
    if (!m) return block;
    const kept = m[1].split(',').map((x) => x.trim()).flatMap((r) => {
      const [a, b] = r.replace(/^U\+/i, '').split('-').map((h) => parseInt(h, 16));
      return clipRange(a, b === undefined || Number.isNaN(b) ? a : b);
    }).map(([a, b]) => a === b ? `U+${hex(a)}` : `U+${hex(a)}-${hex(b)}`);
    if (kept.length) return block.replace(m[0], `unicode-range: ${kept.join(', ')};`);
    return /Copyright|License/i.test(label) ? label : '';
  });
}
