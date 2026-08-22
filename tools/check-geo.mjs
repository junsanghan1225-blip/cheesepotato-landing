/* 첫 쪽의 구조화 자료를 검사한다 — node tools/check-geo.mjs
 *
 * 검색 엔진과 대화형 엔진은 화면에 보이는 글과 JSON-LD 를 **둘 다** 읽는다.
 * 둘이 어긋나면 하나는 거짓이 되고, 그걸 검색 엔진이 먼저 알아본다.
 * FAQ 답을 화면에서만 고치고 JSON-LD 를 안 고치는 일이 가장 흔하다 —
 * 눈으로는 멀쩡해 보이고, 어긋난 쪽은 소스에만 있어서 아무도 안 본다.
 *
 * 여기서 잡는 것:
 *   1. JSON-LD 가 문법에 맞는가
 *   2. FAQPage 의 묻고 답한 글이 화면의 <details> 와 글자까지 같은가
 *   3. 숫자를 내세운 문장이 실제 자료의 개수와 맞는가
 *   4. 제목·설명·og 가 비었거나 너무 길지 않은가
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);

const bad = [];
const err = (m) => bad.push(m);
const strip = (h) => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/* ── 1. JSON-LD 가 읽히는가 ────────────────────────────────── */
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
if (!blocks.length) err('첫 쪽에 JSON-LD 가 하나도 없다');

const graphs = [];
blocks.forEach((m, i) => {
  try { graphs.push(JSON.parse(m[1])); }
  catch (e) { err(`${i + 1}번째 JSON-LD 가 깨졌다: ${e.message}`); }
});

const types = new Set();
const walk = (o) => {
  if (Array.isArray(o)) return o.forEach(walk);
  if (!o || typeof o !== 'object') return;
  if (o['@type']) [].concat(o['@type']).forEach((t) => types.add(t));
  Object.values(o).forEach(walk);
};
graphs.forEach(walk);

for (const need of ['WebSite', 'Organization', 'Course', 'FAQPage']) {
  if (!types.has(need)) err(`${need} 가 없다`);
}

/* ── 2. FAQ 가 화면과 같은가 ──────────────────────────────── */
const faqLd = [];
const findFaq = (o) => {
  if (Array.isArray(o)) return o.forEach(findFaq);
  if (!o || typeof o !== 'object') return;
  if (o['@type'] === 'FAQPage') [].concat(o.mainEntity || []).forEach((q) => faqLd.push(q));
  Object.values(o).forEach(findFaq);
};
graphs.forEach(findFaq);

const faqBox = html.match(/<div class="faq-list">([\s\S]*?)<\/details>\s*<\/div>/);
const faqDom = faqBox
  ? [...faqBox[1].matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>/g)]
      .map((m) => ({ q: strip(m[1]), a: strip(m[2]) }))
  : [];

if (!faqDom.length) err('화면에서 FAQ 를 못 찾았다');
if (faqDom.length !== faqLd.length)
  err(`FAQ 개수가 다르다 — 화면 ${faqDom.length}개, JSON-LD ${faqLd.length}개`);

faqDom.forEach((d, i) => {
  const l = faqLd[i];
  if (!l) return;
  if (strip(String(l.name || '')) !== d.q)
    err(`FAQ ${i + 1} 물음이 다르다\n      화면: ${d.q}\n      LD  : ${l.name}`);
  const la = strip(String(l.acceptedAnswer?.text || ''));
  if (la !== d.a)
    err(`FAQ ${i + 1} 답이 다르다\n      화면: ${d.a.slice(0, 70)}…\n      LD  : ${la.slice(0, 70)}…`);
});

/* ── 3. 내세운 숫자가 진짜인가 ────────────────────────────────
   숫자는 이 쪽에서 가장 인용되기 쉬운 부분이다. 자료가 늘었는데 첫 쪽이
   옛 숫자를 붙들고 있으면, 인용된 곳마다 틀린 숫자가 남는다. */
const [c, s1, s2, s3, tk, tk2, tw, tl, rd, gl, gr] = await Promise.all(
  ['courses.js', 'sentences.js', 'sentences-beginner.js', 'sentences-intermediate.js',
   'topik.js', 'topik2.js', 'topik-writing.js', 'topik-listening.js', 'reading.js',
   'glossary.js', 'grammar.js'].map(load));

const lessons = c.COURSES.reduce((a, x) => a + (x.lessons?.length || 0), 0);
let points = 0;
for (const m of [s1, s2, s3]) {
  const arr = Object.values(m).find((v) => Array.isArray(v) && v[0]?.points);
  if (arr) points += arr.reduce((a, x) => a + (x.points?.length || 0), 0);
}
let passages = 0;
for (const a of Object.values(rd.READING)) for (const b of Object.values(a)) passages += b.length;

const topikQ = tk.TOPIK_READING.length + tk2.TOPIK2_READING.length
             + tl.TOPIKL_ITEMS.length + tl.TOPIKL2_ITEMS.length + tw.TW_ITEMS.length;

const real = {
  '코스': c.COURSES.length,
  '레슨': lessons,
  '문법 표현': points,
  'TOPIK 문항': topikQ,
  '읽기 지문': passages,
  '낱말': Object.keys(gl.GLOSSARY).length,
  '문법 항목': Object.keys(gr.GRAMMAR).length,
  'TOPIK I 듣기': tl.TOPIKL_ITEMS.length,
  'TOPIK II 듣기': tl.TOPIKL2_ITEMS.length,
  'TOPIK I 읽기': tk.TOPIK_READING.length,
  'TOPIK II 읽기': tk2.TOPIK2_READING.length,
  'TOPIK 쓰기': tw.TW_ITEMS.length,
};

/* 첫 쪽 · llms.txt 에 적어 둔 숫자가 위와 맞는지 본다. 쉼표를 넣은 표기도
   같이 찾는다 (4,737 과 4737 은 같은 수다). */
/* 주석은 뺀다. 「문법 표현 291쪽에도 넣어 두고」처럼 다른 것을 세는 말이
   주석에 있는데, 그건 화면에 안 나가므로 인용될 일도 없다. */
const claimFiles = { 'index.html': html.replace(/<!--[\s\S]*?-->/g, ' ') };
const llmsPath = path.join(ROOT, 'llms.txt');
if (fs.existsSync(llmsPath)) claimFiles['llms.txt'] = fs.readFileSync(llmsPath, 'utf8');
else err('llms.txt 가 없다');

const comma = (n) => n.toLocaleString('en-US');
for (const [name, n] of Object.entries(real)) {
  for (const [file, text] of Object.entries(claimFiles)) {
    /* 그 이름을 말하면서 다른 수를 적어 놓은 자리를 찾는다.
       수와 이름 사이에 쉼표나 가운뎃점이 끼면 서로 다른 말이다 —
       「읽기 209, TOPIK II 듣기 11」에서 209 는 듣기 수가 아니다.
       그래서 사이에 오는 것은 공백과 세는 말까지만 허용한다. */
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    /* 수는 쉼표로 끝날 수 없다 — 「209,」의 쉼표까지 삼키면 그 뒤의 이름과
       붙어 버려서 209 를 듣기 문항 수로 읽는다. */
    const N = '(\\d[\\d,]*\\d|\\d)';
    const re = new RegExp(`${N}[ ]?(?:개|편|문항|코스|레슨)?[ ]?${esc}|${esc}[ ]?${N}`, 'g');
    for (const m of text.matchAll(re)) {
      const got = (m[1] || m[2] || '').replace(/,/g, '');
      if (!got) continue;
      if (Number(got) !== n)
        err(`${file}: 「${name}」을 ${Number(got).toLocaleString()} 이라 적었는데 실제는 ${comma(n)} 이다`);
    }
  }
}

/* ── 3.5 우리말로 센 수도 맞는가 ──────────────────────────────
   「다섯 갈래」라고 써 놓고 카드를 여섯 장 두는 일이 실제로 있었다.
   숫자가 아니라 글자라서 위의 숫자 검사에 안 걸린다. 갈래를 하나 더할
   때 제목을 같이 고치는 것을 잊기 때문에, 세어서 맞춰 본다. */
const KO_NUM = ['','한','두','세','네','다섯','여섯','일곱','여덟','아홉','열'];
const EN_NUM = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'];
const wayCount = (html.match(/class="way"/g) || []).length;
const titleKo = (html.match(/한국어로 들어가는<br>(\S+?) 갈래/) || [])[1];
const titleEn = (html.match(/data-en="(\w+) ways in,/) || [])[1];
if (wayCount) {
  if (titleKo && titleKo !== KO_NUM[wayCount])
    err(`「${titleKo} 갈래」라고 적었는데 카드는 ${wayCount}장이다 (「${KO_NUM[wayCount]} 갈래」여야 한다)`);
  if (titleEn && titleEn.toLowerCase() !== (EN_NUM[wayCount] || '').toLowerCase())
    err(`영어 제목이 "${titleEn} ways" 인데 카드는 ${wayCount}장이다 ("${EN_NUM[wayCount]} ways")`);
}

/* ── 4. 제목과 설명 ──────────────────────────────────────── */
const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
const desc = (html.match(/<meta name="description" content="([\s\S]*?)">/) || [])[1] || '';
if (!title.trim()) err('<title> 이 비었다');
if (title.length > 70) err(`<title> 이 ${title.length}자다. 검색 결과에서 잘린다 (60자 안팎이 좋다)`);
if (!desc.trim()) err('meta description 이 비었다');
if (desc.length > 180) err(`meta description 이 ${desc.length}자다. 160자 안팎으로 줄여라`);
for (const p of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card'])
  if (!html.includes(`"${p}"`)) err(`${p} 가 없다`);

/* ── 알림 ── */
console.log('구조화 자료');
console.log(`  JSON-LD ${blocks.length}덩이 · 갈래 ${[...types].sort().join(', ')}`);
console.log(`  FAQ ${faqDom.length}개 (화면) · ${faqLd.length}개 (JSON-LD)`);
console.log(`  제목 ${title.length}자 · 설명 ${desc.length}자`);
console.log('\n자료에 실제로 있는 것');
Object.entries(real).forEach(([k, v]) => console.log(`  ${k.padEnd(14)} ${comma(v)}`));

if (bad.length) {
  console.log(`\n고쳐야 할 것 ${bad.length}개`);
  bad.forEach((b) => console.log('  ✗ ' + b));
  process.exit(1);
}
console.log('\n문제 없음');
