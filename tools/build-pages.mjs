/* 검색에 걸리는 페이지를 만든다 — 생성물, 손으로 고치지 말 것.
 *
 *   node tools/build-pages.mjs
 *
 * 왜 필요한가. 이 사이트는 화면 전환을 전부 해시(#learn/sentence/23-1)로
 * 한다. 사람에게는 페이지가 여럿이지만 **크롤러에게는 index.html 한 쪽뿐**
 * 이다. 표현 290개, TOPIK 259문항, 코스 110항목을 쌓아 두고도 검색에는 한
 * 글자도 안 걸리고 있었다. 해시 뒤는 서버로 가지도 않으니 구글이 볼 방법이
 * 없다.
 *
 * 그래서 표현마다 진짜 주소를 가진 정적 쪽을 하나씩 뽑는다. 그 쪽으로 들어온
 * 사람을 앱 화면(#learn/sentence/…)으로 보낸다. 검색은 정적 쪽이 받고,
 * 연습은 앱이 맡는 구조다.
 *
 * **CSS 를 쪽마다 박아 넣는다.** 따로 빼면 요청이 하나 더 늘고, 무엇보다
 * tools/stamp.mjs 의 자국 대상이 290개로 불어난다. 쪽 하나가 2KB 남짓이라
 * 박아 넣는 편이 싸고, 검색에서 들어온 첫 화면이 한 번에 그려진다.
 *
 * 글꼴도 vendor/pretendard 를 안 부른다. 검색에서 처음 들어온 사람에게
 * 웹폰트 수백 KB를 물리는 것보다, 기기 글꼴로 즉시 읽히는 편이 낫다.
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SB_CATS, SB_MORE } from '../sentences.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://everykoreans.com';
const OUT = join(ROOT, 'sentence');

const esc = (s) => String(s ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

/* 검색 결과에 나오는 줄. 너무 길면 구글이 중간을 잘라 말이 끊긴다. */
function clip(s, n = 155) {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : t.slice(0, n - 1).replace(/[ ,.·]+$/, '') + '…';
}

const LV_KO = { beginner: '초급', intermediate: '중급', advanced: '고급' };
const LV_EN = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const tier = (p) => (LV_KO[p.lv] ? p.lv : 'intermediate');   // lv 를 빠뜨렸으면 중급

/* 쪽마다 같은 CSS. 화면 안 본문과 비슷하되, 혼자 서는 쪽이라 훨씬 짧다. */
const CSS = `
:root{--bg:#fffdf7;--ink:#2b2117;--dim:#6f6152;--line:#ece2d2;--card:#fff;--brand:#f5b301;--soft:#fff7e3}
@media(prefers-color-scheme:dark){:root{--bg:#171310;--ink:#f3ece1;--dim:#a99c8c;--line:#332a22;--card:#201a15;--soft:#2a2118}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);line-height:1.7;
  font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;
  -webkit-text-size-adjust:100%}
.wrap{max-width:720px;margin:0 auto;padding:24px 20px 64px}
a{color:inherit}
.crumb{font-size:13px;color:var(--dim);margin-bottom:18px}
.crumb a{text-decoration:none}.crumb a:hover{text-decoration:underline}
.badge{display:inline-block;font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;
  background:var(--soft);border:1px solid var(--line);color:var(--dim)}
h1{font-size:30px;line-height:1.3;margin:12px 0 6px;letter-spacing:-.02em}
.sub{color:var(--dim);font-size:14px;margin:0 0 18px}
.desc{font-size:17px;margin:0 0 26px}
h2{font-size:15px;margin:32px 0 10px;color:var(--dim);letter-spacing:.02em}
.facts{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--card)}
/* 이름표를 두 말로 겹쳐 쓰니(「자주 함께 쓰는 말 / Often paired with」)
   좁은 칸에서는 세 줄로 접힌다. 폭이 날 때만 좌우로 세운다. */
.fact{padding:12px 16px;border-top:1px solid var(--line);font-size:15px}
.fact:first-child{border-top:0}
.fact b{display:block;font-weight:600;color:var(--dim);font-size:12.5px;margin-bottom:3px}
@media(min-width:560px){
  .fact{display:grid;grid-template-columns:190px 1fr;gap:14px;align-items:baseline}
  .fact b{margin-bottom:0}
}
.ex{background:var(--soft);border:1px solid var(--line);border-radius:12px;padding:13px 16px;margin:8px 0;font-size:16px}
.dlg{border:1px solid var(--line);border-radius:14px;padding:14px 16px;background:var(--card)}
.line{display:flex;gap:10px;align-items:flex-start;margin:10px 0}
.line.b{flex-direction:row-reverse}
.who{font-size:22px;line-height:1.3;flex:none}
.bub{background:var(--soft);border:1px solid var(--line);border-radius:14px;padding:9px 13px;font-size:15px}
.line.b .bub{background:var(--brand);border-color:var(--brand);color:#2b2117}
.cta{display:block;margin:34px 0 8px;padding:16px 20px;border-radius:14px;background:var(--brand);color:#2b2117;
  text-decoration:none;font-weight:700;text-align:center;font-size:16px}
.cta span{display:block;font-weight:500;font-size:13px;opacity:.75;margin-top:3px;text-decoration:none}
.near{display:flex;gap:10px;margin-top:22px;font-size:14px;flex-wrap:wrap}
.near a{flex:1 1 200px;border:1px solid var(--line);border-radius:12px;padding:11px 14px;text-decoration:none;background:var(--card)}
.near b{display:block;font-size:12px;color:var(--dim);font-weight:600}
.foot{margin-top:44px;padding-top:18px;border-top:1px solid var(--line);font-size:13px;color:var(--dim)}
.foot a{color:inherit}
.cat{margin:30px 0 0}
.cat h3{font-size:17px;margin:0 0 4px}
.cat p{margin:0 0 10px;font-size:13px;color:var(--dim)}
.pts{display:flex;flex-wrap:wrap;gap:8px;padding:0;margin:0;list-style:none}
.pts a{display:inline-block;border:1px solid var(--line);background:var(--card);border-radius:999px;
  padding:6px 13px;font-size:14px;text-decoration:none}
.pts a:hover{border-color:var(--brand)}
.lead{font-size:16px;color:var(--dim);margin:0 0 26px}
`.trim();

/* 쪽 하나를 조립한다. head 는 어느 쪽이나 같은 모양이라 여기 모아 둔다. */
function page({ url, title, desc, body, kind = 'article' }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${url}">
<meta property="og:type" content="${kind}">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:site_name" content="치즈감자">
<meta property="og:locale" content="ko_KR">
<meta property="og:locale:alternate" content="en_US">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/logo.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/logo.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
${body}
<div class="foot">
  <a href="/">치즈감자</a> · <a href="/sentence/">문법 표현 전체</a> · <a href="/privacy.html">개인정보</a><br>
  한국어를 배우는 사람을 위한 단어장과 연습 · Learn Korean with CheesePotato<br>
  낱말 뜻풀이 출처: <a href="https://krdict.korean.go.kr">국립국어원 한국어기초사전</a>
  · <a href="https://creativecommons.org/licenses/by-sa/2.0/kr/">CC BY-SA 2.0 KR</a>
</div>
</div>
</body>
</html>
`;
}

/* ── 표현 한 쪽 ─────────────────────────────────────────────── */
function pointPage(cat, p, prev, next) {
  const more = SB_MORE[p.id] || ['', '', '', ''];
  const lv = tier(p);
  /* 제목을 두 말로 쓴다. 이 사이트를 찾는 사람은 「-느니 뜻」으로도 찾고
     「neuni korean grammar」로도 찾는다. 표현 이름은 어느 쪽에도 그대로
     걸리므로 앞에 두고, 뒤에 무엇을 다루는 쪽인지 영어로 붙인다. */
  const title = `${p.name} — Korean grammar: meaning & examples | 치즈감자`;
  const desc = clip(`${p.name} · ${cat.en} — ${p.desc}`);

  const facts = [
    ['형태 / Form', more[0]],
    ['자주 함께 쓰는 말 / Often paired with', more[1]],
    ['주의할 점 / Watch out', more[2]],
  ].filter(([, v]) => v);

  const dlg = (p.dlg || []).map((line) => {
    /* 자료에는 A/B 지만 화면에는 치즈와 감자가 선다. 앱 화면과 같은 규칙이다. */
    const m = /^([AB]):\s*(.+)$/.exec(line);
    const who = m ? m[1] : 'A';
    const txt = m ? m[2] : line;
    return `<div class="line ${who === 'A' ? 'a' : 'b'}">` +
      `<span class="who" aria-hidden="true">${who === 'A' ? '🧀' : '🥔'}</span>` +
      `<span class="bub">${esc(txt)}</span></div>`;
  }).join('\n  ');

  const body = [
    `<nav class="crumb"><a href="/">치즈감자</a> › <a href="/sentence/">문법 표현</a> › ${esc(cat.ko)}</nav>`,
    `<span class="badge">${LV_KO[lv]} · ${LV_EN[lv]}</span>`,
    `<h1>${esc(p.name)}</h1>`,
    `<p class="sub">${esc(cat.emoji ? cat.emoji + ' ' : '')}${esc(cat.ko)} · ${esc(cat.en)}</p>`,
    `<p class="desc">${esc(p.desc)}</p>`,
    facts.length ? '<div class="facts">' + facts.map(([k, v]) =>
      `<div class="fact"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('') + '</div>' : '',
    '<h2>예문 · Examples</h2>',
    `<div class="ex">${esc(p.ex)}</div>`,
    more[3] ? `<div class="ex">${esc(more[3])}</div>` : '',
    dlg ? `<h2>대화로 보기 · In conversation</h2>\n<div class="dlg">\n  ${dlg}\n</div>` : '',
    /* 검색에서 들어온 사람을 앱 화면으로 보낸다. 이 쪽은 읽는 곳이고,
       직접 문장을 써 보는 곳은 앱이다. */
    `<a class="cta" href="/#learn/sentence/${esc(p.id)}">이 표현으로 문장 만들어 보기` +
      `<span>Practice writing your own sentence with ${esc(p.name)}</span></a>`,
    (prev || next) ? '<div class="near">' +
      (prev ? `<a href="/sentence/${esc(prev.id)}.html"><b>← 앞 표현</b>${esc(prev.name)}</a>` : '') +
      (next ? `<a href="/sentence/${esc(next.id)}.html"><b>다음 표현 →</b>${esc(next.name)}</a>` : '') +
      '</div>' : '',
  ].filter(Boolean).join('\n');

  return page({ url: `/sentence/${p.id}.html`, title, desc, body });
}

/* ── 전체 목록 한 쪽 ────────────────────────────────────────────
   낱쪽 290개만 두면 서로 이어지지 않아 크롤러가 몇 쪽 보다 만다. 전부를
   한 번에 거는 쪽이 하나 있어야 290쪽이 다 발견된다. */
function hubPage(cats, total) {
  const order = ['beginner', 'intermediate', 'advanced'];
  const sections = order.map((lv) => {
    const inLv = cats
      .map((c) => ({ cat: c, points: c.points.filter((p) => tier(p) === lv) }))
      .filter((x) => x.points.length);
    if (!inLv.length) return '';
    const n = inLv.reduce((a, x) => a + x.points.length, 0);
    return `<h2 id="${lv}">${LV_KO[lv]} · ${LV_EN[lv]} — ${n}개</h2>` +
      inLv.map(({ cat, points }) =>
        `<div class="cat"><h3>${esc(cat.emoji ? cat.emoji + ' ' : '')}${esc(cat.ko)}</h3>` +
        `<p>${esc(cat.en)}</p><ul class="pts">` +
        points.map((p) => `<li><a href="/sentence/${esc(p.id)}.html">${esc(p.name)}</a></li>`).join('') +
        '</ul></div>').join('\n');
  }).filter(Boolean).join('\n');

  const body = [
    '<nav class="crumb"><a href="/">치즈감자</a> › 문법 표현</nav>',
    `<h1>한국어 문법 표현 ${total}개</h1>`,
    '<p class="lead">초급부터 고급까지, 표현마다 뜻풀이 · 형태 · 주의할 점 · 예문과 대화문을 붙였습니다.<br>' +
    `${total} Korean grammar points from beginner to advanced — each with meaning, form, examples and a short dialogue.</p>`,
    `<a class="cta" href="/#learn/sentence">예문 만들기 열기<span>Open the sentence builder</span></a>`,
    sections,
  ].join('\n');

  return page({
    url: '/sentence/',
    kind: 'website',
    title: `한국어 문법 표현 ${total}개 — 초급·중급·고급 | 치즈감자`,
    desc: clip(`한국어 문법 표현 ${total}개를 초급·중급·고급으로 정리했습니다. ` +
      '표현마다 뜻풀이와 형태, 주의할 점, 예문과 대화문이 있습니다. ' +
      `${total} Korean grammar points with meanings, examples and dialogues.`),
    body,
  });
}

/* ── sitemap ────────────────────────────────────────────────── */
function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- 생성물이다. node tools/build-pages.mjs 가 다시 쓴다.

     화면 전환은 해시(#learn 등)로 하므로 크롤러에게 index.html 은 한 쪽이다.
     그래서 표현마다 진짜 주소를 가진 정적 쪽을 뽑아 여기 건다. 없는 주소를
     적어 두면 404 만 늘어나므로, 여기 있는 것은 전부 저장소에 실재한다. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc, freq, pri }) =>
  `  <url>\n    <loc>${SITE}${loc}</loc>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`,
).join('\n')}
</urlset>
`;
}

/* ── 돌린다 ─────────────────────────────────────────────────── */
/* 통째로 지우고 다시 쓴다. 표현을 지웠을 때 예전 쪽이 남아 검색에 걸리면
   앱에 없는 것을 보여 주게 된다. */
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const urls = [
  { loc: '/', freq: 'weekly', pri: '1.0' },
  { loc: '/sentence/', freq: 'weekly', pri: '0.9' },
];
let n = 0;

for (const cat of SB_CATS) {
  cat.points.forEach((p, i) => {
    /* 앞뒤는 같은 갈래 안에서만 잇는다. 갈래를 넘겨 이으면 「선택을 나타낼
       때」 다음에 뜬금없이 「추측」이 와서 읽는 흐름이 끊긴다. */
    const html = pointPage(cat, p, cat.points[i - 1], cat.points[i + 1]);
    writeFileSync(join(OUT, `${p.id}.html`), html);
    urls.push({ loc: `/sentence/${p.id}.html`, freq: 'monthly', pri: '0.7' });
    n++;
  });
}

writeFileSync(join(OUT, 'index.html'), hubPage(SB_CATS, n));
urls.push({ loc: '/privacy.html', freq: 'yearly', pri: '0.3' });
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap(urls));

console.log(`표현 쪽 ${n}개 + 목록 1쪽 을 sentence/ 에 썼다.`);
console.log(`sitemap.xml 에 주소 ${urls.length}개.`);
