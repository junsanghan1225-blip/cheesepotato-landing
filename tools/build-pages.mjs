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
import { COURSES } from '../courses.js';
import { TW_ITEMS, TW_QS } from '../topik-writing.js';
import { BLOG_POSTS } from '../blog.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://everykoreans.com';
const OUT = join(ROOT, 'sentence');
const OUT_COURSE = join(ROOT, 'course');
const OUT_LESSON = join(ROOT, 'lesson');
const OUT_BLOG = join(ROOT, 'blog');
const OUT_TW = join(ROOT, 'topik-writing');
const OUT_CMP = join(ROOT, 'compare');

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
/* schema.org 자료. 사람에게는 안 보이고 기계가 읽는다.
   AI 답변 엔진과 검색이 「이 쪽이 무엇에 대한 것인가」를 가장 곧바로 아는
   길이라, 글을 아무리 잘 써 두어도 이게 없으면 문단을 짐작해서 읽는다.
   없는 말을 지어 넣지 않는다 — 틀린 표시는 없느니만 못하다. */
const ld = (obj) => obj
  ? `\n<script type="application/ld+json">${JSON.stringify(obj)
      .replaceAll('<', '\\u003c')}</script>`
  : '';

/* 빵부스러기. 쪽 하나가 사이트 어디에 붙어 있는지 알려 준다.

   **마지막을 뺀 모든 자리에는 주소가 있어야 한다.** 구글은 마지막 자리
   (지금 보고 있는 쪽)에만 item 을 빼도 된다고 하고, 가운데가 비면
   Search Console 이 Missing field "item" 으로 잡는다. 실제로 그렇게
   290쪽이 잡혔다 — 갈래 이름을 넣어 두고 주소를 안 준 탓이다.

   눈으로는 안 보이는 실수라(사람에게는 아무 일도 안 일어난다) 여기서
   멈춘다. 조용히 넘어가면 몇 달 뒤에 메일로 알게 된다. */
const crumbLd = (parts) => {
  parts.forEach(([name, loc], i) => {
    if (!loc && i < parts.length - 1) {
      throw new Error(
        `빵부스러기가 잘못됐다: 「${name}」(${i + 1}번째/${parts.length})에 주소가 없다.\n` +
        '  마지막 자리만 주소를 뺄 수 있다. 갈 곳이 없는 자리라면 아예 넣지 마라.');
    }
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: parts.map(([name, loc], i) => ({
      '@type': 'ListItem', position: i + 1, name,
      ...(loc ? { item: SITE + loc } : {}),
    })),
  };
};

function page({ url, title, desc, body, kind = 'article', jsonld }) {
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
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">${[].concat(jsonld ?? []).map(ld).join('')}
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
${body}
<div class="foot">
  <a href="/">치즈감자</a> · <a href="/sentence/">문법 표현 전체</a> · <a href="/blog/">블로그</a> · <a href="/privacy.html">개인정보</a><br>
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
    `<div class="near"><a href="/compare/${esc(cat.id)}.html"><b>같은 갈래 견주어 보기</b>` +
      `${esc(cat.ko)} 표현 ${cat.points.length}가지</a></div>`,
    (prev || next) ? '<div class="near">' +
      (prev ? `<a href="/sentence/${esc(prev.id)}.html"><b>← 앞 표현</b>${esc(prev.name)}</a>` : '') +
      (next ? `<a href="/sentence/${esc(next.id)}.html"><b>다음 표현 →</b>${esc(next.name)}</a>` : '') +
      '</div>' : '',
  ].filter(Boolean).join('\n');

  /* 문법 표현은 낱말이 아니라 **뜻이 정해진 용어**다. DefinedTerm 이
     그 자리에 가장 정확하다 — Article 로 두면 기계가 이것을 글 한 편으로
     보고 무엇을 설명하는 쪽인지는 못 읽는다. */
  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'DefinedTerm',
      '@id': `${SITE}/sentence/${p.id}.html`,
      name: p.name,
      description: p.desc,
      inLanguage: 'ko',
      termCode: p.id,
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        '@id': `${SITE}/sentence/`,
        name: '한국어 문법 표현 · Korean grammar points',
      },
      ...(more[0] ? { alternateName: more[0] } : {}),
    },
    /* 갈래 쪽은 /compare/ 에 있다. 다만 표현이 하나뿐인 갈래는 견줄 것이
       없어 안 만드므로(아래 생성 고리의 조건과 같아야 한다), 그럴 때는
       갈래 자리를 아예 뺀다. 없는 주소를 적어 두면 크롤러가 404 를 받고,
       주소 없이 이름만 두면 구글이 Missing field "item" 으로 잡는다. */
    crumbLd([['치즈감자', '/'], ['문법 표현', '/sentence/'],
             ...(cat.points.length >= 2 ? [[cat.ko, `/compare/${cat.id}.html`]] : []),
             [p.name, null]]),
  ];
  return page({ url: `/sentence/${p.id}.html`, title, desc, body, jsonld });
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

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'DefinedTermSet',
      '@id': `${SITE}/sentence/`,
      name: `한국어 문법 표현 ${total}개`,
      inLanguage: 'ko',
      hasDefinedTerm: cats.flatMap((c) => c.points).map((p) => ({
        '@type': 'DefinedTerm', name: p.name, url: `${SITE}/sentence/${p.id}.html`,
      })),
    },
    crumbLd([['치즈감자', '/'], ['문법 표현', '/sentence/']]),
  ];
  return page({
    url: '/sentence/',
    kind: 'website',
    jsonld,
    title: `한국어 문법 표현 ${total}개 — 초급·중급·고급 | 치즈감자`,
    desc: clip(`한국어 문법 표현 ${total}개를 초급·중급·고급으로 정리했습니다. ` +
      '표현마다 뜻풀이와 형태, 주의할 점, 예문과 대화문이 있습니다. ' +
      `${total} Korean grammar points with meanings, examples and dialogues.`),
    body,
  });
}



/* ══ 갈래 비교 쪽 ═══════════════════════════════════════════════
   낱쪽 290개는 「-느니 뜻」에는 걸려도 「-느니와 -(으)ㄹ 바에야 차이」에는
   안 걸린다. 사람도 AI 답변 엔진도 **견주는 말**로 묻는데, 표현 하나만
   있는 쪽은 그 물음에 답할 거리가 없다.

   갈래는 이미 뜻이 비슷한 것끼리 묶여 있으니 그대로 비교 쪽이 된다.
   표를 하나 놓고, 표현마다 「언제 쓰나」를 묻고 답한다.

   물음과 답을 **화면에 실제로 보이게** 쓴다. FAQPage 표시는 눈에 보이는
   물음·답이 있을 때만 맞는 말이라, 표시만 붙이고 본문이 없으면 거짓이다.
   ═══════════════════════════════════════════════════════════════ */
/* 은/는 을 받침으로 고른다. 한국어를 가르치는 쪽에서 조사가 틀리면
   그 쪽에 적힌 다른 말도 못 믿는다.

   이름이 「숫자 (한자어 · 순우리말)」처럼 한글이 아닌 글자로 끝나기도 해서
   뒤에서부터 마지막 한글 음절을 찾아 그것의 받침을 본다. 한글이 아예 없으면
   「는」으로 둔다 — 그런 이름은 지금 없지만 나중에 생기면 조용히 틀리는
   것보다 한쪽으로 정해 두는 편이 낫다. */
function eunNeun(name) {
  const m = String(name).match(/[가-힣](?=[^가-힣]*$)/);
  if (!m) return '는';
  return (m[0].charCodeAt(0) - 0xAC00) % 28 ? '은' : '는';
}

function comparePage(cat) {
  const pts = cat.points;
  const names = pts.map((p) => p.name);
  const lv = tier(pts[0]);

  /* 제목이 곧 사람들이 치는 말이 되게 한다. 둘셋이면 이름을 그대로 붙여
     「A와 B 차이」로, 많으면 이름을 다 넣을 수 없으니 갈래 이름으로 간다. */
  const title = pts.length <= 3
    ? `${names.join('와 ')} 차이 — ${cat.ko} | 치즈감자`
    : `${cat.ko} 표현 ${pts.length}가지 — ${names.slice(0, 2).join(' · ')} 외 | 치즈감자`;
  const desc = clip(`${cat.ko}(${cat.en})에 쓰는 표현 ${pts.length}가지를 한자리에서 견줍니다. ` +
    `${names.slice(0, 4).join(' · ')}${names.length > 4 ? ' 외' : ''} — 뜻과 형태, 주의할 점을 나란히 놓았습니다.`);

  const rows = pts.map((p) => {
    const more = SB_MORE[p.id] || ['', '', '', ''];
    return `<div class="fact"><b><a href="/sentence/${esc(p.id)}.html">${esc(p.name)}</a></b>` +
      `<span>${esc(p.desc)}${more[0] ? `<br><small>형태 · ${esc(more[0])}</small>` : ''}` +
      `${more[2] ? `<br><small>주의 · ${esc(more[2])}</small>` : ''}</span></div>`;
  }).join('');

  /* 표현마다 하나씩. 이게 FAQPage 표시가 가리키는 실제 본문이다. */
  const qas = pts.map((p) => {
    const more = SB_MORE[p.id] || ['', '', '', ''];
    const q = `「${p.name}」${eunNeun(p.name)} 언제 쓰나요?`;
    /* 화면에 그리는 글과 **똑같은 조각**으로 답을 만든다. 여기서 말이
       갈리면 FAQPage 표시가 화면에 없는 글을 가리키게 된다 — 표시만
       붙이고 본문이 다르면 그건 거짓말이다. */
    const warn = more[2] ? `주의할 점 — ${more[2]}` : '';
    const eg = `예: ${p.ex}`;
    const a = [p.desc, warn, eg].filter(Boolean).join(' ');
    return { q, a,
      html: `<h2>${esc(q)}</h2><p class="desc">${esc(p.desc)}</p>` +
        (warn ? `<div class="ex">${esc(warn)}</div>` : '') +
        `<div class="ex">${esc(eg)}</div>` +
        `<p class="sub"><a href="/sentence/${esc(p.id)}.html">${esc(p.name)} 자세히 보기 →</a></p>` };
  });

  const body = [
    `<nav class="crumb"><a href="/">치즈감자</a> › <a href="/compare/">갈래별 비교</a> › ${esc(cat.ko)}</nav>`,
    `<span class="badge">${LV_KO[lv]} · ${LV_EN[lv]}</span>`,
    `<h1>${esc(cat.emoji ? cat.emoji + ' ' : '')}${esc(cat.ko)} — 표현 ${pts.length}가지</h1>`,
    `<p class="sub">${esc(cat.en)}</p>`,
    `<p class="lead">뜻이 비슷해 보이지만 쓰는 자리가 다릅니다. 아래 표에서 뜻과 형태, 주의할 점을 나란히 놓고 견주세요.<br>` +
    `${pts.length} Korean expressions for ${esc(cat.en.toLowerCase())} — compared side by side.</p>`,
    `<div class="facts">${rows}</div>`,
    qas.map((x) => x.html).join('\n'),
    `<a class="cta" href="/#learn/sentence">이 갈래로 문장 만들어 보기<span>Practice these expressions in the app</span></a>`,
  ].join('\n');

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${SITE}/compare/${cat.id}.html`,
      inLanguage: 'ko',
      mainEntity: qas.map((x) => ({
        '@type': 'Question', name: x.q,
        acceptedAnswer: { '@type': 'Answer', text: x.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${cat.ko} — ${cat.en}`,
      numberOfItems: pts.length,
      itemListElement: pts.map((p, i) => ({
        '@type': 'ListItem', position: i + 1, name: p.name,
        url: `${SITE}/sentence/${p.id}.html`,
      })),
    },
    crumbLd([['치즈감자', '/'], ['갈래별 비교', '/compare/'], [cat.ko, null]]),
  ];
  return page({ url: `/compare/${cat.id}.html`, title, desc, body, jsonld });
}

function compareHub(cats) {
  const order = ['beginner', 'intermediate', 'advanced'];
  const sections = order.map((lv) => {
    const inLv = cats.filter((c) => tier(c.points[0]) === lv);
    if (!inLv.length) return '';
    return `<h2 id="${lv}">${LV_KO[lv]} · ${LV_EN[lv]} — ${inLv.length}갈래</h2>` +
      inLv.map((c) =>
        `<div class="cat"><h3><a href="/compare/${esc(c.id)}.html">` +
        `${esc(c.emoji ? c.emoji + ' ' : '')}${esc(c.ko)}</a></h3>` +
        `<p>${esc(c.points.map((p) => p.name).join(' · '))}</p></div>`).join('\n');
  }).filter(Boolean).join('\n');

  const body = [
    '<nav class="crumb"><a href="/">치즈감자</a> › 갈래별 비교</nav>',
    `<h1>비슷한 한국어 표현 견주어 보기 — ${cats.length}갈래</h1>`,
    '<p class="lead">뜻이 비슷한 표현끼리 묶어 뜻·형태·주의할 점을 나란히 놓았습니다. ' +
    '「-아/어서와 -(으)니까는 어떻게 다른가」 같은 물음이 여기서 풀립니다.<br>' +
    `${cats.length} sets of similar Korean expressions, compared side by side.</p>`,
    `<a class="cta" href="/sentence/">문법 표현 전체 보기<span>All grammar points</span></a>`,
    sections,
  ].join('\n');

  return page({
    url: '/compare/', kind: 'website',
    title: `비슷한 한국어 표현 비교 ${cats.length}갈래 — 뜻·형태·주의할 점 | 치즈감자`,
    desc: clip(`뜻이 비슷한 한국어 표현을 갈래별로 견줍니다. ${cats.length}갈래, 표현 ${cats.reduce((a, c) => a + c.points.length, 0)}개. ` +
      'Similar Korean grammar expressions compared side by side.'),
    body,
    jsonld: [crumbLd([['치즈감자', '/'], ['갈래별 비교', '/compare/']])],
  });
}

/* ══ 코스 · 레슨 · TOPIK 쓰기 ═══════════════════════════════════
   표현 290쪽만 있고 코스 18개·레슨 71강·TOPIK 쓰기 16문항은 앱 안에만
   있었다. 해시 주소라 크롤러에게는 없는 것과 같다.

   레슨 쪽에는 **읽는 블록만** 싣는다. 문제와 답은 안 싣는다 —
   답이 검색에 걸리면 앱에서 풀 것이 없어지고, 애초에 사람들이 찾는 것은
   "-아/어요 가 뭔가" 지 "3번 문제 답" 이 아니다.
   ═══════════════════════════════════════════════════════════════ */

/* main 은 제목을 문자열로도 {ko,en} 으로도 쓴다. 옮기는 중이라 둘 다 온다. */
const tx = (v) => (v && typeof v === 'object') ? (v.ko ?? v.en ?? '') : (v ?? '');

/* 아주 작은 마크다운. 자료에 **굵게** 와 `코드` 만 쓰인다. */
const mdLite = (t) => esc(t)
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\n/g, '<br>');

const LV_OF = (c) => {
  const lv = String(c.level || '').toLowerCase();
  return LV_KO[lv] ? lv : 'beginner';
};

/* ── 레슨 한 쪽 ─────────────────────────────────────────────── */
function lessonPage(course, lesson, prev, next) {
  const lv = LV_OF(course);
  const read = (lesson.blocks || []).filter((b) => ['text', 'note', 'chars', 'table'].includes(b.t));
  const nQ = (lesson.blocks || []).length - read.length;

  const blocks = read.map((b) => {
    if (b.t === 'text') return (b.h ? `<h2>${esc(b.h)}</h2>` : '') + `<p class="desc">${mdLite(b.md)}</p>`;
    if (b.t === 'note') return `<div class="ex">${mdLite(b.md)}</div>`;
    if (b.t === 'chars') return '<div class="facts">' + b.items.map((it) =>
      `<div class="fact"><b>${esc(it.ch)}${it.rom ? ' · ' + esc(it.rom) : ''}</b>` +
      `<span>${it.tip ? mdLite(it.tip) : ''}</span></div>`).join('') + '</div>';
    if (b.t === 'table') return '<div class="facts">' + (b.rows || []).map((r) =>
      `<div class="fact"><b>${mdLite(r[0])}</b><span>${r.slice(1).map(mdLite).join(' · ')}</span></div>`).join('') + '</div>';
    return '';
  }).filter(Boolean).join('\n');

  const title = `${tx(lesson.title)} — ${tx(course.title)} | 치즈감자`;
  const desc = clip(`${tx(course.title)} · ${tx(lesson.title)} — ` +
    (read.find((b) => b.t === 'text')?.md || tx(course.tagline) || '').replace(/[*`#]/g, ''));

  const body = [
    `<nav class="crumb"><a href="/">치즈감자</a> › <a href="/course/">코스</a> › ` +
      `<a href="/course/${esc(course.id)}.html">${esc(tx(course.title))}</a></nav>`,
    `<span class="badge">${LV_KO[lv]} · ${LV_EN[lv]}</span>`,
    `<h1>${esc(tx(lesson.title))}</h1>`,
    `<p class="sub">${esc(tx(course.title))}${lesson.minutes ? ` · ${lesson.minutes}분` : ''}</p>`,
    blocks,
    nQ ? `<h2>연습 · Practice</h2><p class="lead">이 레슨에는 풀어 보는 문제가 ${nQ}개 있습니다. ` +
      `앱에서 하나씩 맞히며 넘어갑니다.<br>${nQ} exercises come with this lesson — open it to work through them.</p>` : '',
    `<a class="cta" href="/#learn/courses">이 레슨 열기<span>Open this lesson in the app</span></a>`,
    (prev || next) ? '<div class="near">' +
      (prev ? `<a href="/lesson/${esc(prev.id)}.html"><b>← 앞 레슨</b>${esc(tx(prev.title))}</a>` : '') +
      (next ? `<a href="/lesson/${esc(next.id)}.html"><b>다음 레슨 →</b>${esc(tx(next.title))}</a>` : '') +
      '</div>' : '',
  ].filter(Boolean).join('\n');

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      '@id': `${SITE}/lesson/${lesson.id}.html`,
      name: tx(lesson.title),
      inLanguage: 'ko',
      teaches: tx(course.title),
      educationalLevel: LV_EN[lv],
      learningResourceType: 'lesson',
      isPartOf: { '@type': 'Course', '@id': `${SITE}/course/${course.id}.html`, name: tx(course.title) },
      ...(lesson.minutes ? { timeRequired: `PT${lesson.minutes}M` } : {}),
    },
    crumbLd([['치즈감자', '/'], ['코스', '/course/'],
             [tx(course.title), `/course/${course.id}.html`], [tx(lesson.title), null]]),
  ];
  return page({ url: `/lesson/${lesson.id}.html`, title, desc, body, jsonld });
}

/* ── 코스 한 쪽 ─────────────────────────────────────────────── */
function coursePage(course) {
  const lv = LV_OF(course);
  const title = `${tx(course.title)} — ${LV_KO[lv]} 한국어 코스 | 치즈감자`;
  const desc = clip(`${tx(course.title)} · ${tx(course.tagline)} — ${tx(course.blurb)}`);
  const body = [
    `<nav class="crumb"><a href="/">치즈감자</a> › <a href="/course/">코스</a></nav>`,
    `<span class="badge">${LV_KO[lv]} · ${LV_EN[lv]}</span>`,
    `<h1>${esc(course.emoji ? course.emoji + ' ' : '')}${esc(tx(course.title))}</h1>`,
    `<p class="sub">${esc(tx(course.tagline))}</p>`,
    `<p class="desc">${esc(tx(course.blurb))}</p>`,
    `<h2>레슨 ${course.lessons.length}강 · Lessons</h2>`,
    '<ul class="pts">' + course.lessons.map((l) =>
      `<li><a href="/lesson/${esc(l.id)}.html">${esc(tx(l.title))}</a></li>`).join('') + '</ul>',
    `<a class="cta" href="/#learn/courses">코스 열기<span>Open this course in the app</span></a>`,
  ].join('\n');

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      '@id': `${SITE}/course/${course.id}.html`,
      name: tx(course.title),
      description: tx(course.blurb),
      inLanguage: 'ko',
      educationalLevel: LV_EN[lv],
      teaches: tx(course.tagline),
      isAccessibleForFree: true,
      provider: { '@type': 'Organization', name: '치즈감자', url: SITE },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: `PT${course.lessons.reduce((a, l) => a + (l.minutes || 5), 0)}M`,
      },
      hasPart: course.lessons.map((l) => ({
        '@type': 'LearningResource', name: tx(l.title), url: `${SITE}/lesson/${l.id}.html`,
      })),
    },
    crumbLd([['치즈감자', '/'], ['코스', '/course/'], [tx(course.title), null]]),
  ];
  return page({ url: `/course/${course.id}.html`, title, desc, body, jsonld });
}

/* ── 코스 목록 ─────────────────────────────────────────────── */
function courseHub(courses) {
  const order = ['beginner', 'intermediate', 'advanced'];
  const sections = order.map((lv) => {
    const inLv = courses.filter((c) => LV_OF(c) === lv);
    if (!inLv.length) return '';
    const nL = inLv.reduce((a, c) => a + c.lessons.length, 0);
    return `<h2 id="${lv}">${LV_KO[lv]} · ${LV_EN[lv]} — 코스 ${inLv.length}개 · ${nL}강</h2>` +
      inLv.map((c) =>
        `<div class="cat"><h3><a href="/course/${esc(c.id)}.html">` +
        `${esc(c.emoji ? c.emoji + ' ' : '')}${esc(tx(c.title))}</a></h3>` +
        `<p>${esc(tx(c.tagline))}</p><ul class="pts">` +
        c.lessons.map((l) => `<li><a href="/lesson/${esc(l.id)}.html">${esc(tx(l.title))}</a></li>`).join('') +
        '</ul></div>').join('\n');
  }).filter(Boolean).join('\n');

  const nC = courses.length, nL = courses.reduce((a, c) => a + c.lessons.length, 0);
  const body = [
    '<nav class="crumb"><a href="/">치즈감자</a> › 코스</nav>',
    `<h1>한국어 코스 ${nC}개 · ${nL}강</h1>`,
    '<p class="lead">한글 읽기부터 문장 만들기까지 순서대로 이어집니다. 레슨마다 읽는 설명과 푸는 문제가 함께 있습니다.<br>' +
    `${nC} Korean courses (${nL} lessons) from reading Hangul to building your own sentences.</p>`,
    `<a class="cta" href="/#learn/courses">코스로 배우기 열기<span>Open the course track</span></a>`,
    sections,
  ].join('\n');

  return page({
    url: '/course/', kind: 'website',
    title: `한국어 코스 ${nC}개 · ${nL}강 — 초급·중급·고급 | 치즈감자`,
    desc: clip(`한글 읽기부터 문장 만들기까지 한국어 코스 ${nC}개 ${nL}강. ` +
      `${nC} Korean courses with ${nL} lessons, from Hangul to sentence building.`),
    body,
    jsonld: [crumbLd([['치즈감자', '/'], ['코스', '/course/']])],
  });
}

/* ── TOPIK 쓰기 한 쪽 ──────────────────────────────────────── */
function twPage(it) {
  const q = TW_QS.find((x) => x.q === it.q);
  const lvKo = LV_KO[it.lv] || '중급';
  const title = `TOPIK ${it.q}번 연습 — ${it.title} | 치즈감자`;
  const desc = clip(`TOPIK II 쓰기 ${it.q}번 유형 연습 문항. ${it.title} — ${it.cond}. ` +
    '기출이 아닌 창작 문항이고 모범답안과 채점 포인트가 함께 있습니다.');

  const body = [
    `<nav class="crumb"><a href="/">치즈감자</a> › <a href="/topik-writing/">TOPIK 쓰기</a> › ${esc(q ? q.ko : it.q + '번')}</nav>`,
    `<span class="badge">${lvKo} · ${esc(q ? q.ko : '')} · ${q ? q.pt : ''}점</span>`,
    `<h1>${esc(it.title)}</h1>`,
    `<p class="sub">${esc(it.cond)}</p>`,
    '<h2>문항 · Task</h2>',
    `<p class="desc">${esc(it.passage)}</p>`,
    it.data ? '<div class="facts">' + it.data.map((d) =>
      `<div class="fact"><span>${esc(d)}</span></div>`).join('') + '</div>' : '',
    it.tasks ? '<h2>다뤄야 할 것 · Must cover</h2><ul class="pts">' +
      it.tasks.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>' : '',
    it.model ? `<h2>모범답안 · Model answer</h2><div class="ex">${esc(it.model).replace(/\n/g, '<br>')}</div>` : '',
    it.points ? '<h2>무엇을 보는가 · What is scored</h2><div class="facts">' +
      [['내용 및 과제 수행', it.points.content], ['글의 전개 구조', it.points.structure],
       ['언어 사용', it.points.language]].map(([k, v]) =>
        `<div class="fact"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('') + '</div>' : '',
    '<h2>흔한 감점 요인 · Common deductions</h2><ul class="pts">' +
      it.deduct.map((d) => `<li>${esc(d)}</li>`).join('') + '</ul>',
    `<a class="cta" href="/#learn/writing">직접 써 보기<span>Write it yourself — length and register checked as you type</span></a>`,
  ].filter(Boolean).join('\n');

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      '@id': `${SITE}/topik-writing/${it.id}.html`,
      name: `TOPIK ${it.q}번 — ${it.title}`,
      description: it.cond,
      inLanguage: 'ko',
      learningResourceType: 'exercise',
      educationalLevel: LV_EN[it.lv] || 'Intermediate',
      teaches: 'TOPIK II writing',
      isAccessibleForFree: true,
    },
    crumbLd([['치즈감자', '/'], ['TOPIK 쓰기', '/topik-writing/'], [it.title, null]]),
  ];
  return page({ url: `/topik-writing/${it.id}.html`, title, desc, body, jsonld });
}

function twHub(items) {
  const sections = TW_QS.map((g) => {
    const mine = items.filter((x) => x.q === g.q);
    if (!mine.length) return '';
    return `<div class="cat"><h3>${esc(g.ko)} · ${g.pt}점</h3><p>${esc(g.en)}</p><ul class="pts">` +
      mine.map((x) => `<li><a href="/topik-writing/${esc(x.id)}.html">${esc(x.title)}</a></li>`).join('') +
      '</ul></div>';
  }).filter(Boolean).join('\n');

  const body = [
    '<nav class="crumb"><a href="/">치즈감자</a> › TOPIK 쓰기</nav>',
    `<h1>TOPIK II 쓰기 연습 문항 ${items.length}개</h1>`,
    '<p class="lead">51~54번 유형으로 직접 써 보는 연습 문항입니다. 문항마다 모범답안과 채점 포인트, 흔한 감점 요인이 붙어 있습니다.<br>' +
    '<b>기출문제가 아니라 같은 유형으로 새로 쓴 창작 문항입니다.</b><br>' +
    `${items.length} original TOPIK II writing practice tasks with model answers and scoring notes.</p>`,
    `<a class="cta" href="/#learn/writing">TOPIK 쓰기 열기<span>Open the writing practice</span></a>`,
    sections,
  ].join('\n');

  return page({
    url: '/topik-writing/', kind: 'website',
    title: `TOPIK II 쓰기 연습 문항 ${items.length}개 — 51·52·53·54번 | 치즈감자`,
    desc: clip(`TOPIK II 쓰기 51~54번 유형 연습 문항 ${items.length}개. 모범답안과 채점 기준, 감점 요인까지. 기출이 아닌 창작 문항입니다.`),
    body,
    jsonld: [crumbLd([['치즈감자', '/'], ['TOPIK 쓰기', '/topik-writing/']])],
  });
}

/* ── 블로그 ─────────────────────────────────────────────────── */
/* 글은 blog.js 에 아직 하나도 없다 — 자리(구조)만 먼저 낸다. 목록 쪽은
   글이 없어도 항상 굽는다("곧 올릴게요" 안내가 뜬다) — 그래야 나중에
   글을 하나만 추가해도 바로 목록에 걸린다. */
function blogPage(post) {
  const title = `${post.title} | 치즈감자 블로그`;
  const desc = clip(post.excerpt);
  const body = [
    `<nav class="crumb"><a href="/">치즈감자</a> › <a href="/blog/">블로그</a></nav>`,
    `<p class="sub">${esc(post.date)}${post.updated && post.updated !== post.date ? ` · 고침 ${esc(post.updated)}` : ''}</p>`,
    `<h1>${esc(post.title)}</h1>`,
    post.body,
  ].join('\n');

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${SITE}/blog/${post.id}.html`,
      headline: post.title,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      description: post.excerpt,
      inLanguage: 'ko',
      author: { '@type': 'Organization', name: '치즈감자' },
      isAccessibleForFree: true,
    },
    crumbLd([['치즈감자', '/'], ['블로그', '/blog/'], [post.title, null]]),
  ];
  return page({ url: `/blog/${post.id}.html`, title, desc, body, jsonld });
}

function blogHub(posts) {
  const list = posts.length
    ? '<ul class="pts">' + posts.map((p) =>
        `<li><a href="/blog/${esc(p.id)}.html">${esc(p.title)}</a></li>`).join('') + '</ul>'
    : '<p class="desc">아직 올린 글이 없습니다 — 곧 첫 글을 올릴게요.<br>No posts yet — the first one is coming soon.</p>';

  const body = [
    '<nav class="crumb"><a href="/">치즈감자</a> › 블로그</nav>',
    '<h1>블로그</h1>',
    '<p class="lead">한국어 공부, 문법, TOPIK 준비에 관한 글들입니다.<br>' +
      'Notes on learning Korean, grammar, and TOPIK prep.</p>',
    list,
  ].join('\n');

  return page({
    url: '/blog/', kind: 'website',
    title: '블로그 | 치즈감자',
    desc: clip('한국어 공부, 문법, TOPIK 준비에 관한 치즈감자 블로그입니다.'),
    body,
    jsonld: [crumbLd([['치즈감자', '/'], ['블로그', '/blog/']])],
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
for (const d of [OUT, OUT_COURSE, OUT_LESSON, OUT_TW, OUT_CMP, OUT_BLOG]) {
  rmSync(d, { recursive: true, force: true });
  mkdirSync(d, { recursive: true });
}

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

/* ── 갈래 비교 ─────────────────────────────────────────────── */
let nCmp = 0;
for (const cat of SB_CATS) {
  if (cat.points.length < 2) continue;   // 하나짜리는 견줄 것이 없다
  writeFileSync(join(OUT_CMP, `${cat.id}.html`), comparePage(cat));
  urls.push({ loc: `/compare/${cat.id}.html`, freq: 'monthly', pri: '0.8' });
  nCmp++;
}
writeFileSync(join(OUT_CMP, 'index.html'), compareHub(SB_CATS.filter((c) => c.points.length >= 2)));
urls.push({ loc: '/compare/', freq: 'weekly', pri: '0.9' });

/* ── 코스와 레슨 ─────────────────────────────────────────────── */
let nC = 0, nL = 0;
for (const c of COURSES) {
  writeFileSync(join(OUT_COURSE, `${c.id}.html`), coursePage(c));
  urls.push({ loc: `/course/${c.id}.html`, freq: 'monthly', pri: '0.7' });
  nC++;
  c.lessons.forEach((l, i) => {
    /* 앞뒤는 같은 코스 안에서만 잇는다. 코스를 넘겨 이으면 한글 다음에
       고급 문법이 와서 읽는 차례가 무너진다. */
    writeFileSync(join(OUT_LESSON, `${l.id}.html`),
      lessonPage(c, l, c.lessons[i - 1], c.lessons[i + 1]));
    urls.push({ loc: `/lesson/${l.id}.html`, freq: 'monthly', pri: '0.6' });
    nL++;
  });
}
writeFileSync(join(OUT_COURSE, 'index.html'), courseHub(COURSES));
urls.push({ loc: '/course/', freq: 'weekly', pri: '0.9' });

/* ── TOPIK 쓰기 ─────────────────────────────────────────────── */
let nW = 0;
for (const it of TW_ITEMS) {
  writeFileSync(join(OUT_TW, `${it.id}.html`), twPage(it));
  urls.push({ loc: `/topik-writing/${it.id}.html`, freq: 'monthly', pri: '0.7' });
  nW++;
}
writeFileSync(join(OUT_TW, 'index.html'), twHub(TW_ITEMS));
urls.push({ loc: '/topik-writing/', freq: 'weekly', pri: '0.9' });

/* ── 블로그 ─────────────────────────────────────────────────── */
/* 글이 하나도 없어도(BLOG_POSTS = []) 목록 쪽은 늘 굽는다 — 안 그러면
   나중에 글을 딱 하나 추가했을 때 목록이 아예 없어서 처음 한 번은
   손으로 더 손대야 한다. */
let nB = 0;
for (const post of BLOG_POSTS) {
  writeFileSync(join(OUT_BLOG, `${post.id}.html`), blogPage(post));
  urls.push({ loc: `/blog/${post.id}.html`, freq: 'yearly', pri: '0.5' });
  nB++;
}
writeFileSync(join(OUT_BLOG, 'index.html'), blogHub(BLOG_POSTS));
urls.push({ loc: '/blog/', freq: 'weekly', pri: '0.6' });

urls.push({ loc: '/privacy.html', freq: 'yearly', pri: '0.3' });
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap(urls));

console.log(`표현 ${n}쪽 + 목록 1쪽 → sentence/`);
console.log(`갈래 비교 ${nCmp}쪽 + 목록 1쪽 → compare/`);
console.log(`코스 ${nC}쪽 + 목록 1쪽 → course/`);
console.log(`레슨 ${nL}쪽 → lesson/`);
console.log(`TOPIK 쓰기 ${nW}쪽 + 목록 1쪽 → topik-writing/`);
console.log(`블로그 ${nB}쪽 + 목록 1쪽 → blog/`);
console.log(`sitemap.xml 에 주소 ${urls.length}개.`);
