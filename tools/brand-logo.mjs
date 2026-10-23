/* 출판사 로고(에브리코리안즈 · every koreans) — 픽셀 글자 로고를 SVG 문자열로 만든다(운영자 2026-10-23 「1번 픽셀 글자로 하자」).
   책 표지 · 책등 · 속표지(tools/build-book.mjs) 와 brand/*.svg(node tools/build-brand.mjs)가 같이 쓴다. 글꼴 파일 없이 칸(rect)으로만 그려 어디서나 같게 나온다. */
const G0 = {
  e: ['.###.', '#...#', '#####', '#....', '.####'], v: ['#...#', '#...#', '#...#', '.#.#.', '..#..'],
  r: ['#.##.', '##..#', '#....', '#....', '#....'], y: ['#...#', '#...#', '#...#', '.####', '....#', '....#', '####.'],
  k: ['#....', '#....', '#..#.', '#.#..', '##...', '#.#..', '#..#.'], o: ['.###.', '#...#', '#...#', '#...#', '.###.'],
  a: ['.###.', '....#', '.####', '#...#', '.####'], n: ['#.##.', '##..#', '#...#', '#...#', '#...#'],
  s: ['.####', '#....', '.###.', '....#', '####.'],
};
const bold = (rows) => rows.map((r) => { r = r.padEnd(5, '.'); let n = ''; for (let i = 0; i < 6; i++) n += (i < 5 && r[i] === '#') || (i > 0 && r[i - 1] === '#') ? '#' : '.'; return n; });
const G = Object.fromEntries(Object.entries(G0).map(([k, v]) => [k, bold(v)]));
const O2 = ['.NNNN.', 'NYYPPN', 'NYPPPN', 'NPPPPN', '.NNNN.'];
export const BRAND = { navy: '#14264A', cheese: '#F6C443', potato: '#D49B5A', orange: '#F07A2A' };
/* cells: [x, y, 색] 목록 → 같은 줄 · 같은 색은 이어 붙여 path 로 */
function cellsOf(words) {
  const cells = [];
  for (const [s, y0] of words) {
    let x = 0;
    for (const ch of s) {
      if (ch === 'o') O2.forEach((row, r) => [...row].forEach((c, i) => { if (c !== '.') cells.push([x + i, y0 + 2 + r, c]); }));
      else G[ch].forEach((row, r) => [...row].forEach((c, i) => { if (c === '#') cells.push([x + i, y0 + (ch === 'k' ? 0 : 2) + r, 'F']); }));
      x += 7;
    }
  }
  return cells;
}
/* opts: fg(글자색), one(한 줄), mono(o 도 한 색), rotate(세로 — 책등), width/height(CSS 길이 하나만), bg */
export function logoSvg({ fg = BRAND.navy, one = false, mono = false, rotate = false, width, height, bg } = {}) {
  const cells = cellsOf(one ? [['everykoreans', 0]] : [['every', 0], ['koreans', 10]]);
  const W = one ? 83 : 48, H = one ? 9 : 17, pad = 0;
  const col = { F: fg, N: fg, Y: mono ? fg : BRAND.cheese, P: mono ? fg : BRAND.potato };
  const byColor = {};
  for (const [x, y, c] of cells) (byColor[c] ||= []).push([x, y]);
  let body = '';
  for (const [c, pts] of Object.entries(byColor)) {
    pts.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    let d = '';
    for (let i = 0; i < pts.length; ) { let j = i; while (j + 1 < pts.length && pts[j + 1][1] === pts[i][1] && pts[j + 1][0] === pts[j][0] + 1) j++; d += `M${pts[i][0]} ${pts[i][1]}h${j - i + 1}v1h-${j - i + 1}z`; i = j + 1; }
    body += `<path d="${d}" fill="${col[c]}"/>`;
  }
  const vw = rotate ? H : W, vh = rotate ? W : H;
  const g = rotate ? `<g transform="translate(${H} 0) rotate(90)">${body}</g>` : body;
  const size = width ? `width="${width}"` : height ? `height="${height}"` : '';
  const back = bg ? `<rect width="${vw}" height="${vh}" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" ${size} shape-rendering="crispEdges" role="img" aria-label="every koreans">${back}${g}</svg>`;
}
