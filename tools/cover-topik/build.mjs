// TOPIK 책 새 앞표지 — 쓰기 51~52 최종(v2.8, 운영자 2026-11-11 「이걸로 최종」)의 틀에 책마다 글 · 색만 바꿔 넣는다.
//   node tools/cover-topik/build.mjs            → tools/cover-topik/<책 id>.html 전부
//   node tools/cover-topik/render.mjs <책 id>   → 182×257mm 300dpi PNG
// 색: 바탕은 책 틀(docs/books/<id>.json)의 coverLevel.bg(겹침 검사를 이미 통과한 색), 큰 글자 테두리는 그 색을 밝힌 것,
// 입체 그림자는 어둡힌 것. 글은 상점 · 책 뒤표지에 이미 적힌 사실만(없는 숫자 · 「1위」 같은 말은 넣지 않는다).
import fs from 'fs';
import path from 'path';
import { cheeseLevel } from '../../levels.js';
// 운영자 2026-11-11 「쓰기 · 읽기는 5~8% 작게」 — 받침 글자라 같은 크기면 더 커 보인다(140 → 131px).
const DIR = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(DIR, '../..');
const master = fs.readFileSync(path.join(DIR, '_base.html')   /* 운영자가 확정한 쓰기 51~52 v2.8 그대로 — 모든 표지의 틀(손으로만 고친다) */, 'utf8');
const CSS = master.slice(master.indexOf('<style>') + 7, master.indexOf('</style>')).replace('.cv.e .hero{font-size:131px;top:67px}', '');
const LOGO = master.match(/<div class="pub">(<svg[\s\S]*?<\/svg>)<\/div>/)[1];
const CUBE = master.match(/<div class="mas one1">(<svg[\s\S]*?<\/svg>)<\/div>/)[1];   // 4급 블록 치즈(얼굴 하나)

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (h, t, w) => '#' + hex(h).map((c, i) => Math.round(c + (t[i] - c) * w).toString(16).padStart(2, '0')).join('');
const light = (h, w) => mix(h, [255, 255, 255], w), dark = (h, w) => mix(h, [0, 0, 0], w);
const warm = (h) => { const [r, g, b] = hex(h); return r > 170 && r > g + 40 && r > b + 40; };   // 주황 · 빨강 바탕이면 주황 스티커가 묻힌다

const B = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/books', id + '.json'), 'utf8'));
// 책마다: 큰 글자 · 영어 · 시리즈 칸 · 라벨 · 노란 띠 · 띠 아래 · 무늬 · STEP 세 칸([제목, 설명]) — 사실은 책 틀 · 상점 소개 그대로
const BOOKS = [
  { id: 'topik2-writing-51-52', hero: '쓰기', en: 'WRITING', ser: '쓰기 01', k: '연습문항', n: '51~52 · 100제', s: '실용문 · 설명문 빈칸에 알맞은 한 문장', pat: 'grid',
    st: [['유형 익히기', '읽는 법 ·<br>주요 표현'], ['한 문장 쓰기', '빈칸마다<br>자연스럽게'], ['답 비교하기', '가능한 답 ·<br>채점 포인트']] },
  { id: 'topik2-writing-53-54', hero: '쓰기', en: 'WRITING', ser: '쓰기 02', k: '연습문항', n: '53~54 · 100제', s: '자료 설명 · 논술 쓰기와 채점 기준', pat: 'grid',
    st: [['자료 읽기', '그래프 · 표<br>보는 법'], ['원고지 쓰기', '개요부터<br>글자 수까지'], ['답안 비교하기', '상 · 중 · 하 답안 ·<br>채점 기준']] },
  { id: 'topik2-writing-eve', hero: '쓰기', en: 'WRITING', ser: '쓰기 03', k: '시험 전날', n: '핵심 요약', s: '쓰기 시험 전날에 보는 핵심 정리', pat: 'grid', code: '3~6급',
    st: [['볼 것', '유형마다<br>한 쪽'], ['넘길 것', '전날엔<br>덜어 내기'], ['당일 준비', '시간 · 연필 ·<br>답안지']] },
  ...[['1', '1~15', '384', '01'], ['2', '16~24', '381', '02'], ['3', '25~45', '455', '03'], ['4', '46~50', '379', '04']].map(([v, r, q, ser]) => (
    { id: `topik2-reading-${v}`, hero: '읽기', en: 'READING', ser: `읽기 ${ser}`, k: '연습문항', n: `${r}번 · ${q}제`, s: '시험 번호 순서대로 푸는 연습문항', pat: 'lines',
      st: [['유형 익히기', '번호마다<br>묻는 것'], ['번호대로 풀기', '시험 순서<br>그대로'], ['풀이 확인', '모든 문항에<br>짧은 풀이']] })),
  { id: 'topik1-reading-mock', hero: '실전', en: 'MOCK TESTS', ser: '모의 01', k: '읽기 실전 연습', n: '10회 · 400문항', s: 'TOPIK I 읽기 31~70번, 실제 시험 형식', pat: 'grid',
    st: [['유형 익히기', '8유형 풀이 방법 ·<br>필요한 단어'], ['한 회 풀기', '40문항 ·<br>답안지'], ['채점 · 풀이', '정답과<br>짧은 풀이']] },
  { id: 'topik1-vocab', hero: '단어', en: 'VOCABULARY', ser: '단어 초급', k: '초급 필수 단어장', n: '1,931단어', s: 'TOPIK I 낱말 1급 · 2급 전부', pat: 'dots',
    st: [['낱말 보기', '품사 · 뜻 ·<br>예문'], ['가리고 쓰기', '뜻 보고<br>한국어로'], ['확인하기', '치즈 급수 ·<br>감자 빈출도']] },
  ...[['topik2-vocab-1000', '중급 1', '3~4급'], ['topik2-vocab-2000', '중급 2', '5급'], ['topik2-vocab-lv3', '중급 3', '6급']].map(([id, ser, g]) => (
    { id, hero: '단어', en: 'VOCABULARY', ser: `단어 ${ser}`, k: `중급 단어장 워크북 ${ser.slice(-1)}`, n: '1,000단어', s: `${g}에서 자주 나오는 낱말 1,000개`, pat: 'dots',
      st: [['낱말 보기', '뜻 · 예문 ·<br>치즈 급수'], ['쓰기 연습', '단원마다<br>낱말 20개'], ['단원 점검', '헷갈리는<br>낱말까지']] })),
];

const PAT = {
  grid: `.pat{background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px),linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px)!important;background-size:22px 26px,22px 26px,22px 13px!important}`,
  lines: `.pat{background-image:repeating-linear-gradient(#fff 0 1px,transparent 1px 15px)!important;background-size:auto!important;background-position:0 6px!important}`,
  dots: `.pat{background-image:radial-gradient(#fff 1.4px,transparent 1.6px)!important;background-size:16px 16px!important}`,
};
const icon = (n) => n === 4 ? CUBE : cheeseLevel(n).icon.replace('class="lvl-ic"', '');

// 배지(운영자 2026-11-11 「배지는 통일 · 1~2 / 3~4 / 5 / 6 정도 · 색도 정해서 각각 다르게」): 급수 네 칸만 쓴다.
// 책이 어느 칸인지는 책 틀의 치즈 단계(coverLevel.mascot — 이미 책마다 정해 둔 급수)로: 1 · 2 → 1~2급, 3 · 4 → 3~4급, 5 → 5급, 6 → 6급.
const BAND = (g) => g <= 2 ? ['1~2급', '#2F6FD6'] : g <= 4 ? ['3~4급', '#E8742C'] : g === 5 ? ['5급', '#D6336C'] : ['6급', '#23305E'];
// 큰 글자 입체 그림자(운영자 2026-11-11 「배경이 옅은 색이면 그림자 크기를 줄여서 — 너무 진해」): 바탕 밝기(상대 휘도)에 따라
// 밝은 바탕(0.2 이상)은 짧고 덜 어둡게, 중간(0.1~0.2)은 조금 짧게, 어두운 바탕은 확정본(쓰기 51~52) 그대로.
const lum = (h) => { const c = hex(h).map((v) => v / 255).map((v) => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const shadowCss = (bg, deep, tint) => {
  const L = lum(bg); if (L < .1) return '';
  const [n, d] = L >= .2 ? [8, dark(bg, .36)] : [14, dark(bg, .46)];
  const a = [.5, 1, 1.5, 2, 2.5, 3].map((x) => `${x}px ${x}px 0 ${tint}`), b = Array.from({ length: n }, (_, i) => `${(i + 7) / 2}px ${(i + 7) / 2}px 0 ${d}`);
  return `.cv.e .hero{text-shadow:${[...a, ...b].join(',')}!important}`;
};
const page = (c) => {
  const b = B(c.id), L = b.coverLevel, bg = L.bg;
  const [band, badge] = BAND(L.mascot[1]);
  const deep = bg === '#4B2A85' ? '#2a1552' : dark(bg, .55), tint = bg === '#4B2A85' ? '#B9A4F0' : light(bg, .55), box1 = light(bg, .88);
  const code = c.code || L.code, name = L.name;
  const vars = `--bg:${bg};--deep:${deep};--tint:${tint};--acc:#FFD23F`;
  const extra = `.cv.e{${vars};background:${bg}!important}.cv.e .st div{background:${box1};border-color:${light(bg, .7)}}.cv.e .st div:nth-child(even){background:#fbe9c9;border-color:rgba(200,140,40,.28)}
.cv.e .lv{background:${badge}}.cv.e .st div:nth-child(even):before{background:#e8742c}${PAT[c.pat]}${shadowCss(bg, deep, tint)}
${/^(쓰기|읽기)$/.test(c.hero) ? '.cv.e .hero{font-size:131px;top:67px}' : ''}.cv.e .tag .n{white-space:nowrap}.cv.e .mas.one1 svg{width:100%;height:100%}`;
  const st = c.st.map(([t, d], i) => `<div data-n="STEP ${i + 1}"><b>${t}</b><span>${d}</span></div>`).join('');
  return `<!doctype html><html><head><meta charset=utf-8><link rel=stylesheet href=/vendor/pretendard.css><style>${CSS}${extra}</style></head><body class="one"><div class="cv e"><div class="pat"></div><div class="bar"><span>한국어능력시험 대비</span><em><small>SERIES</small>${c.ser}</em></div><div class="hero">${c.hero}</div><div class="en">${c.en}</div>
<div class="mas one1">${icon(L.mascot[1])}</div><div class="lv"><b>${band}</b><i>${name}</i></div>
<div class="tag"><div class="k">${c.k}</div><br><div class="n">${c.n}</div><div class="s">${c.s}</div></div><div class="paper">
<div class="st">${st}</div><div class="foot"><div class="au"><span class="by"><span><b>저자</b>준상(Junsang)</span></span></div><div class="pub">${LOGO}</div></div></div></div></body></html>`;
};
for (const c of BOOKS) {
  if (c.hero === '단어') continue;   // 단어장 4권은 build-vocab.mjs(큰 글자 겹줄 방식)
  const f = path.join(DIR, (c.id === 'topik2-writing-51-52' ? 'writing-51-52' : c.id) + '.html');
  fs.writeFileSync(f, page(c));
}
console.log(BOOKS.length, '권 →', DIR);
