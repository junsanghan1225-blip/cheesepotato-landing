// TOPIK 단어장 4권 앞표지 — 큰 글자 「단」(겹줄 무늬) 방식(운영자 2026-11-11 「단어장 표지 다시 · 큰 글자 느낌 · 통일성은 챙기면서」).
// 쓰기 · 읽기 · 실전 표지(build.mjs)와 같은 것: 책 색 바탕 · 급수 배지 네 칸(색 규칙) · 시리즈 번호 · 저자 준상(Junsang) · 출판사 로고.
//   node tools/cover-topik/build-vocab.mjs → tools/cover-topik/<책 id>.html 네 개(render.mjs 로 PNG)
import fs from 'fs';
import path from 'path';
const DIR = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(DIR, '../..');
const LOGO = fs.readFileSync(path.join(DIR, '_base.html'), 'utf8').match(/<div class="pub">(<svg[\s\S]*?<\/svg>)<\/div>/)[1];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (h, t, w) => '#' + hex(h).map((c, i) => Math.round(c + (t[i] - c) * w).toString(16).padStart(2, '0')).join('');
const light = (h, w) => mix(h, [255, 255, 255], w), dark = (h, w) => mix(h, [0, 0, 0], w);
const BAND = (g) => g <= 2 ? ['1~2급', '#2F6FD6', 'TOPIK I'] : g <= 4 ? ['3~4급', '#E8742C', 'TOPIK II'] : g === 5 ? ['5급', '#D6336C', 'TOPIK II'] : ['6급', '#23305E', 'TOPIK II'];
const BOOKS = [
  { id: 'topik1-vocab', ser: '단어 초급', t1: 'TOPIK I · 초급 필수', n: '1,931', small: 'TOPIK I 낱말 1급 · 2급 전부 · 뜻 · 예문 · 쓰기 연습', b2: '+ 가리고 쓰고 확인하기 + 치즈 · 감자 표시' },
  ...[['topik2-vocab-1000', '중급 1', '3~4급'], ['topik2-vocab-2000', '중급 2', '5급'], ['topik2-vocab-lv3', '중급 3', '6급']].map(([id, ser, g]) => (
    { id, ser: `단어 ${ser}`, t1: `TOPIK II · 중급 · 워크북 ${ser.slice(-1)}`, n: '1,000', small: `${g}에서 자주 나오는 낱말 · 뜻 · 예문 · 쓰기 연습`, b2: '+ 단원 점검 + 헷갈리는 낱말' })),
];
// 큰 그림(GLYPH): 글자(가 · 나 …) · 숫자(num) · 펼친 책(book) — 겹줄 무늬로 채운다
const GLYPH = process.env.GLYPH || 'book', OUT = process.env.OUT || DIR;
const BOOKP = 'M190 118C150 92 96 92 52 112L52 282C96 262 150 262 190 288C230 262 284 262 328 282L328 112C284 92 230 92 190 118Z M190 118L190 288';
const stripes = (cols, bg, ch) => {
  const T = (w, st, fl) => ch === 'num'
    ? `<text x="190" y="196" text-anchor="middle" font-size="120" font-weight="900" letter-spacing="-6" font-family="Pretendard Variable" fill="${fl}" stroke="${st}" stroke-width="${w}" stroke-linejoin="round">${NUM}</text>`
    : ch === 'book' ? `<path transform="translate(190 140) scale(.82) translate(-190 -190)" d="${BOOKP}" fill="${fl}" stroke="${st}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`
    : `<text x="190" y="252" text-anchor="middle" font-size="262" font-weight="900" font-family="Pretendard Variable" fill="${fl}" stroke="${st}" stroke-width="${w}" stroke-linejoin="round">${ch}</text>`;
  const ws = ch === 'num' ? [30, 24, 18, 12, 6] : ch === 'book' ? [56, 46, 36, 26, 16, 7] : [46, 40, 34, 28, 22, 16, 10, 4];
  return ws.map((w, i) => T(w, i % 2 ? bg : cols[(i >> 1) % cols.length], 'none')).join('') + T(0, 'none', ch === 'book' ? bg : bg);
};
let NUM = '1,000';
const CSS = `*{box-sizing:border-box;margin:0}body{margin:0;font-family:'Pretendard Variable',sans-serif;background:#fff}
.cv{width:380px;height:537px;position:relative;overflow:hidden;color:#fff}
.bar{position:absolute;left:22px;right:22px;top:20px;border:1px solid rgba(255,255,255,.9);display:grid;grid-template-columns:1fr auto;font-size:10px;font-weight:800}.bar span{padding:6px 0 6px .4em;text-align:center;letter-spacing:.4em}.bar em{font-style:normal;background:#fff;color:var(--deep);padding:6px 10px;display:flex;align-items:center;gap:5px;letter-spacing:.04em}.bar em small{font-size:6.5px;letter-spacing:.14em;color:#8a7fa6;font-weight:800}
.t1{position:absolute;left:28px;top:66px;font-size:12px;font-weight:800;letter-spacing:.18em;opacity:.85}
.t2{position:absolute;left:28px;top:86px;display:flex;align-items:center;gap:12px}.t2 span{font-size:58px;font-weight:900;letter-spacing:-.02em;line-height:1}.t2 em{font-style:normal;color:#fff;font-weight:900;font-size:15px;padding:6px 14px;border-radius:99px;background:var(--deep)}
.rule{position:absolute;left:28px;right:28px;top:152px;border-top:1.5px solid rgba(255,255,255,.55)}.small{position:absolute;left:28px;top:162px;font-size:11px;font-weight:600;opacity:.9}
.big{position:absolute;left:0;top:186px;width:380px;height:330px}
.stk{position:absolute;right:16px;top:276px;width:85px;height:85px;border-radius:50%;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-8deg);border:2.5px solid #fff;box-shadow:3px 3px 0 var(--deep)}.stk:before{content:'';position:absolute;inset:4px;border:1.2px dashed rgba(255,255,255,.75);border-radius:50%}.stk b{font-size:24px;font-weight:900;line-height:1}.stk i{font-style:normal;font-size:9px;font-weight:800;margin-top:3px}
.bot{position:absolute;left:0;right:0;bottom:0;height:78px;background:#f6f0e2;color:#1d1b19;display:flex;align-items:center;justify-content:space-between;padding:0 22px;border-top:3px solid #FFD23F}
.bi b{display:block;font-size:14px;font-weight:900}.bi span{display:block;font-size:10px;color:#6b655c;margin-top:3px;font-weight:600}
.rt{display:flex;flex-direction:column;align-items:flex-end;gap:6px}.au{font-size:7px;font-weight:600;color:#3d3832}.au b{font-weight:800;margin-right:3px;color:var(--bg)}.pubw{line-height:0}.pubw svg{height:11px;width:auto}`;
for (const c of BOOKS) {
  const b = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/books', c.id + '.json'), 'utf8')), bg = b.coverLevel.bg, deep = dark(bg, .5);
  const [band, bc, exam] = BAND(b.coverLevel.mascot[1]);
  const cols = ['#ffffff', light(bg, .62), '#FFE28A'];
  fs.writeFileSync(path.join(OUT, c.id + '.html'), `<!doctype html><html><head><meta charset=utf-8><link rel=stylesheet href=/vendor/pretendard.css><style>${CSS}</style></head><body><div class="cv" style="background:${bg};--bg:${bg};--deep:${deep}">
<div class="bar"><span>한국어능력시험 대비</span><em><small>SERIES</small>${c.ser}</em></div>
<div class="t1">${c.t1}</div><div class="t2"><span>VOCA</span><em>${c.n}</em></div><div class="rule"></div><div class="small">${c.small}</div>
<svg class="big" viewBox="0 0 380 330">${(NUM = c.n, stripes(cols, bg, GLYPH))}</svg>
<div class="stk" style="background:${bc}"><b>${band}</b><i>${exam} 대비</i></div>
<div class="bot"><div class="bi"><b>뜻 · 예문 · 쓰기</b><span>${c.b2}</span></div><div class="rt"><div class="au"><b>저자</b>준상(Junsang)</div><div class="pubw">${LOGO}</div></div></div></div></body></html>`);
}
console.log(BOOKS.length, '권 단어장 →', DIR);
