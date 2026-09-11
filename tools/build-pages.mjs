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
import { TOPIK_READING, TOPIK_BLUEPRINT } from '../topik.js';
import { TOPIK2_READING, TOPIK2_BLUEPRINT } from '../topik2.js';
import { TOPIKL_BY_EXAM } from '../topik-listening.js';
import { GLOSSARY } from '../glossary.js';
import { SENSES } from '../glossary-senses.js';
import { EXAMPLES } from '../glossary-examples.js';
import { readFileSync as readEn } from 'node:fs';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://everykoreans.com';
const OUT = join(ROOT, 'sentence');
const OUT_COURSE = join(ROOT, 'course');
const OUT_LESSON = join(ROOT, 'lesson');
const OUT_BLOG = join(ROOT, 'blog');
const OUT_TW = join(ROOT, 'topik-writing');
const OUT_CMP = join(ROOT, 'compare');
const OUT_TR = join(ROOT, 'topik-reading');
const OUT_TL = join(ROOT, 'topik-listening');
const OUT_DICT = join(ROOT, 'dictionary');

/* 표현 290개의 영어 설명. app.module.js 는 이걸 grammar-en.js 로 읽어 화면에
   쓰는데, **검색에 걸리는 정적 쪽에는 여태 한 줄도 안 실렸다.** 그래서
   「neuni korean grammar」나 「nikka vs aseo」로 찾는 사람에게 우리 쪽은
   영어가 한 글자도 없는 한국어 쪽이었다 — 뜻풀이를 290개 다 옮겨 놓고도.
   여기서 붙인다. 없으면 한국어만 나가고 굽는 일은 그대로 된다. */
let EN_BY_ID = new Map();
try {
  const arr = JSON.parse(readEn(join(ROOT, 'docs/grammar-en.json'), 'utf8'));
  EN_BY_ID = new Map(arr.filter((x) => x?.id).map((x) => [x.id, x]));
} catch { /* 없으면 한국어로 물러선다 */ }

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
/* 한국어 뜻풀이 아래 붙는 영어. 한국어가 먼저 읽히도록 한 단계 죽인다. */
.desc.en{font-size:15.5px;color:var(--dim);margin:-18px 0 26px}
.fact i{display:block;font-style:normal;font-size:13.5px;color:var(--dim);margin-top:3px}
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
/* TOPIK 읽기·듣기 문항 — 보기 넷과 정답. */
.opts{list-style:none;padding:0;margin:14px 0;display:flex;flex-direction:column;gap:8px}
.opts li{border:1px solid var(--line);border-radius:12px;padding:11px 15px;background:var(--card);
  display:flex;gap:10px;align-items:baseline;font-size:15.5px}
.opts li.right{border-color:var(--brand);background:var(--soft);font-weight:700}
.opts .onum{flex:none;color:var(--dim);font-weight:700}
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

function page({ url, title, desc, body, kind = 'article', jsonld, extraCss = '', extraHead = '' }) {
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
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">${extraHead}${[].concat(jsonld ?? []).map(ld).join('')}
<style>${CSS}${extraCss}</style>
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
  /* 검색 결과에 뜨는 줄은 **영어를 앞에 둔다.** 제목에 표현 이름이 그대로
     들어 있어 한국어 검색어는 제목이 받는다. 이 줄까지 한국어면 영어로
     찾은 사람은 결과에서 읽을 것이 하나도 없다. 영어가 없으면 한국어로. */
  const en = EN_BY_ID.get(p.id);
  const desc = clip(en?.desc ? `${p.name} · ${cat.en} — ${en.desc}` : `${p.name} · ${cat.en} — ${p.desc}`);

  /* **한국어 칸에 영어가 이미 섞여 있는 것이 290개 중 112개다.**
     README 는 「영어는 sentences.js 에 섞지 않고 docs/grammar-en.json 에
     따로 둔다」고 하는데, 「주의할 점」에는 옛날에 옮긴 영어가 한국어 뒤에
     그대로 붙어 있다. 그 자리에 영어를 또 붙이면 같은 말이 두 번 나온다.
     자료를 고치는 것이 옳지만 섞인 글을 갈라내는 일은 따로 할 일이라,
     여기서는 **이미 영어가 있으면 더 붙이지 않는다.** */
  const hasEn = (v) => /[A-Za-z]{4,}/.test(String(v ?? ''));
  const addEn = (koVal, enVal) => (enVal && !hasEn(koVal) ? enVal : null);

  /* 칸마다 한국어 아래 영어를 붙인다. lang 을 적어 둬야 기계가 두 말이
     섞인 쪽인 줄 안다 — 쪽 전체는 lang="ko" 다. */
  const facts = [
    ['형태 / Form', more[0], addEn(more[0], en?.form)],
    ['자주 함께 쓰는 말 / Often paired with', more[1], null],
    ['주의할 점 / Watch out', more[2], addEn(more[2], en?.care)],
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
    addEn(p.desc, en?.desc) ? `<p class="desc en" lang="en">${esc(en.desc)}</p>` : '',
    facts.length ? '<div class="facts">' + facts.map(([k, v, e]) =>
      `<div class="fact"><b>${esc(k)}</b><span>${esc(v)}` +
      (e ? `<i lang="en">${esc(e)}</i>` : '') + '</span></div>').join('') + '</div>' : '',
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
      /* description 은 하나만 받는다. 한국어를 두고, 영어는 별칭 자리에
         함께 적어 둔다 — 두 말로 찾는 쪽이라는 것을 기계에 알린다. */
      description: p.desc,
      inLanguage: en?.desc ? ['ko', 'en'] : 'ko',
      termCode: p.id,
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        '@id': `${SITE}/sentence/`,
        name: '한국어 문법 표현 · Korean grammar points',
      },
      ...(more[0] ? { alternateName: more[0] } : {}),
      ...(en?.desc ? { disambiguatingDescription: en.desc } : {}),
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
    /* 51·52번(빈칸형)은 model 대신 blanks 배열로 답을 담는다 — 빈칸마다
       정답이 하나가 아니라 2~3개 표현이 모두 맞으므로, 화면(twReveal)과
       똑같이 빈칸별 모범답안 목록 + 채점 포인트로 보여 준다. 이게 빠져
       있으면 meta description 의 "모범답안이 함께 있습니다"가 51·52번
       쪽에서는 거짓말이 된다(실제로 겪은 문제 — ChatGPT가 26쪽을 다
       열어 보고 이 간극을 짚어냈다). */
    it.blanks ? it.blanks.map((b) =>
      `<h2>${esc(b.mark)} 모범답안 · Model answers</h2><ul class="pts">` +
      b.answers.map((a) => `<li>${esc(a)}</li>`).join('') + '</ul>' +
      `<p class="sub">${esc(b.point)}</p>`).join('\n') : '',
    it.points ? '<h2>무엇을 보는가 · What is scored</h2><div class="facts">' +
      [['내용 및 과제 수행', it.points.content], ['글의 전개 구조', it.points.structure],
       ['언어 사용', it.points.language]].map(([k, v]) =>
        `<div class="fact"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('') + '</div>' : '',
    '<h2>흔한 감점 요인 · Common deductions</h2><ul class="pts">' +
      it.deduct.map((d) => `<li>${esc(d)}</li>`).join('') + '</ul>',
    /* 문항 번호까지 붙여 보낸다(#learn/writing/51-1) — 목록으로 떨어지면
       방금 읽은 이 문항을 다시 찾아야 한다. app.module.js 의 openLearnSub
       가 이 번호를 받아 목록 대신 이 문항을 바로 연다. */
    `<a class="cta" href="/#learn/writing/${esc(it.id)}">직접 써 보기<span>Write it yourself — length and register checked as you type</span></a>`,
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

/* ── TOPIK 읽기 ─────────────────────────────────────────────── */
/* 문항마다(409개) 제 주소를 가진 쪽을 낸다 — topik-writing/ 과 같은
   생각이다. 지문·보기·정답·해설이 이미 쪽 안에 다 있어서, AI 답변
   엔진이 클릭 한 번 없이도 이 쪽 하나로 완결된 답을 인용할 수 있다.
   "직접 풀어보기" 는 문항 번호까지 들고 가서(#learn/topik/<시험>/
   reading/<id>) 앱이 목록이 아니라 그 문제를 바로 열게 한다
   (tqOpenOne, app.module.js) — topik-writing 을 고칠 때 알게 된 것과
   같은 실수(목록으로 떨어뜨리기)를 처음부터 안 하려는 것이다. */
const trTypeMap = (bp) => Object.fromEntries(bp.map((b) => [b.type, { ko: b.ko, en: b.en }]));
const TR_TYPES = { I: trTypeMap(TOPIK_BLUEPRINT), II: trTypeMap(TOPIK2_BLUEPRINT) };
const TR_ORDER = { I: [...new Set(TOPIK_BLUEPRINT.map((b) => b.type))],
                   II: [...new Set(TOPIK2_BLUEPRINT.map((b) => b.type))] };
/* II 는 우리가 매긴 난이도 구간이다(3~6급이 총점으로 갈리는 실제 시험과
   달리 문항마다 급을 못 박을 수 없다) — app.module.js 의 TQ_EXAMS 와
   같은 문구를 쓴다. */
const trGradeTx = (exam, g) => (exam === 'I'
  ? { ko: `${g}급`, en: `Level ${g}` }
  : { ko: `${g}급 수준`, en: `Level ${g}` });

function trPage(it) {
  const tx = TR_TYPES[it.exam][it.type] || { ko: it.type, en: it.type };
  const grade = trGradeTx(it.exam, it.grade);
  const examName = `TOPIK ${it.exam}`;
  const title = `TOPIK ${it.exam} 읽기 ${it.slot}번 연습 — ${it.topic} | 치즈감자`;
  const desc = clip(`TOPIK ${it.exam} 읽기 ${it.slot}번 유형 연습 문항. ${tx.ko} — ${it.topic}. ` +
    '기출이 아닌 창작 문항이고 정답과 해설이 함께 있습니다.');

  const body = [
    `<nav class="crumb"><a href="/">치즈감자</a> › <a href="/topik-reading/">TOPIK 읽기</a> › ${esc(examName)}</nav>`,
    `<span class="badge">${esc(grade.ko)} · ${esc(tx.ko)}</span>`,
    `<h1>${esc(it.topic)}</h1>`,
    `<p class="sub">${esc(examName)} ${it.slot}번 · ${esc(tx.ko)} · ${esc(tx.en)}</p>`,
    `<div class="ex">${esc(it.passage)}</div>`,
    `<p class="desc">${esc(it.question)}</p>`,
    '<ul class="opts">' + it.options.map((o, i) =>
      `<li${i === it.answer ? ' class="right"' : ''}><span class="onum">${i + 1}</span>${esc(o)}</li>`).join('') + '</ul>',
    '<h2>해설 · Explanation</h2>',
    `<div class="ex">${esc(it.why)}</div>`,
    `<a class="cta" href="/#learn/topik/${esc(it.exam)}/reading/${esc(it.id)}">이 문제 직접 풀어보기` +
      `<span>Try it yourself — the same question, in the app</span></a>`,
  ].join('\n');

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      '@id': `${SITE}/topik-reading/${it.id}.html`,
      name: `TOPIK ${it.exam} 읽기 ${it.slot}번 — ${it.topic}`,
      description: it.question,
      inLanguage: 'ko',
      learningResourceType: 'exercise',
      educationalLevel: grade.en,
      teaches: `TOPIK ${it.exam} reading`,
      isAccessibleForFree: true,
    },
    crumbLd([['치즈감자', '/'], ['TOPIK 읽기', '/topik-reading/'], [it.topic, null]]),
  ];
  return page({ url: `/topik-reading/${it.id}.html`, title, desc, body, jsonld });
}

function trHub() {
  const groups = [['I', TOPIK_READING], ['II', TOPIK2_READING]];
  const total = TOPIK_READING.length + TOPIK2_READING.length;
  const sections = groups.map(([exam, items]) => {
    const byType = {};
    items.forEach((it) => (byType[it.type] = byType[it.type] || []).push(it));
    const typeSections = TR_ORDER[exam].filter((k) => byType[k]).map((k) => {
      const tx = TR_TYPES[exam][k];
      const list = byType[k].slice().sort((a, b) => a.slot - b.slot);
      return `<div class="cat"><h3>${esc(tx?.ko || k)}</h3><p>${esc(tx?.en || '')}</p><ul class="pts">` +
        list.map((it) => `<li><a href="/topik-reading/${esc(it.id)}.html">${it.slot}번 · ${esc(it.topic)}</a></li>`).join('') +
        '</ul></div>';
    }).join('\n');
    return `<h2>TOPIK ${exam} — ${items.length}문항</h2>${typeSections}`;
  }).join('\n');

  const body = [
    '<nav class="crumb"><a href="/">치즈감자</a> › TOPIK 읽기</nav>',
    `<h1>TOPIK 읽기 연습 문항 ${total}개</h1>`,
    '<p class="lead">TOPIK I·II 읽기 유형별 연습 문항입니다. 문항마다 정답과 해설이 함께 있습니다.<br>' +
      '<b>기출문제가 아니라 같은 유형으로 새로 쓴 창작 문항입니다.</b><br>' +
      `${total} original TOPIK I/II reading practice questions, each with the answer explained.</p>`,
    '<a class="cta" href="/#learn/topik/I/reading">TOPIK 읽기 열기<span>Open the reading practice</span></a>',
    sections,
  ].join('\n');

  return page({
    url: '/topik-reading/', kind: 'website',
    title: `TOPIK 읽기 연습 문항 ${total}개 | 치즈감자`,
    desc: clip(`TOPIK I·II 읽기 유형별 연습 문항 ${total}개. 정답과 해설까지. 기출이 아닌 창작 문항입니다.`),
    body,
    jsonld: [crumbLd([['치즈감자', '/'], ['TOPIK 읽기', '/topik-reading/']])],
  });
}

/* ── TOPIK 듣기 ─────────────────────────────────────────────── */
/* 대본을 그대로 글로 보여준다 — 실제 연습(app.module.js)은 대본을
   답을 고른 뒤에야 펼치지만, 여기는 듣기 문제가 아니라 그 문제를 소개하는
   읽는 쪽이다. 정적 쪽에 소리 파일이 없어서(mp3 대신 브라우저
   음성합성을 쓴다) 대본이 이 쪽에서 유일하게 보여줄 수 있는 것이기도
   하다. */
const TL_WHO = { m: { ko: '남자', en: 'Man' }, w: { ko: '여자', en: 'Woman' }, n: { ko: '안내', en: 'Announcer' } };

function tlPage(it) {
  const bp = TOPIKL_BY_EXAM[it.exam].blueprint;
  const tx = trTypeMap(bp)[it.type] || { ko: it.type, en: it.type };
  const grade = trGradeTx(it.exam, it.grade);
  const examName = `TOPIK ${it.exam}`;
  const gist = it.script[0]?.text || it.q;
  const title = `TOPIK ${it.exam} 듣기 ${it.slot}번 연습 — ${tx.ko} | 치즈감자`;
  const desc = clip(`TOPIK ${it.exam} 듣기 ${it.slot}번 유형 연습 문항. ${tx.ko}. 대본과 정답, 해설이 함께 있습니다.`);

  const script = it.script.map((l) => {
    return `<div class="line${l.who === 'w' ? ' b' : ''}">` +
      `<span class="who" aria-hidden="true">${l.who === 'w' ? '👩' : l.who === 'm' ? '👨' : '📢'}</span>` +
      `<span class="bub">${esc(l.text)}</span></div>`;
  }).join('\n  ');

  const body = [
    `<nav class="crumb"><a href="/">치즈감자</a> › <a href="/topik-listening/">TOPIK 듣기</a> › ${esc(examName)}</nav>`,
    `<span class="badge">${esc(grade.ko)} · ${esc(tx.ko)}</span>`,
    `<h1>${esc(gist.length > 40 ? gist.slice(0, 40) + '…' : gist)}</h1>`,
    `<p class="sub">${esc(examName)} ${it.slot}번 · ${esc(tx.ko)} · ${esc(tx.en)} · 대본 · Script</p>`,
    `<div class="dlg">\n  ${script}\n</div>`,
    `<p class="desc" style="margin-top:20px">${esc(it.q)}</p>`,
    '<ul class="opts">' + it.options.map((o, i) =>
      `<li${i === it.answer ? ' class="right"' : ''}><span class="onum">${i + 1}</span>${esc(o)}</li>`).join('') + '</ul>',
    '<h2>해설 · Explanation</h2>',
    `<div class="ex">${esc(it.why)}</div>`,
    `<a class="cta" href="/#learn/topik/${esc(it.exam)}/listening/${esc(it.id)}">이 문제 직접 풀어보기` +
      `<span>Try it yourself — hear the audio and answer in the app</span></a>`,
  ].join('\n');

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      '@id': `${SITE}/topik-listening/${it.id}.html`,
      name: `TOPIK ${it.exam} 듣기 ${it.slot}번 — ${tx.ko}`,
      description: it.q,
      inLanguage: 'ko',
      learningResourceType: 'exercise',
      educationalLevel: grade.en,
      teaches: `TOPIK ${it.exam} listening`,
      isAccessibleForFree: true,
    },
    crumbLd([['치즈감자', '/'], ['TOPIK 듣기', '/topik-listening/'], [`${it.slot}번`, null]]),
  ];
  return page({ url: `/topik-listening/${it.id}.html`, title, desc, body, jsonld });
}

function tlHub() {
  const groups = [['I', TOPIKL_BY_EXAM.I], ['II', TOPIKL_BY_EXAM.II]];
  const total = TOPIKL_BY_EXAM.I.items.length + TOPIKL_BY_EXAM.II.items.length;
  const sections = groups.map(([exam, ex]) => {
    const types = trTypeMap(ex.blueprint);
    const order = [...new Set(ex.blueprint.map((b) => b.type))];
    const byType = {};
    ex.items.forEach((it) => (byType[it.type] = byType[it.type] || []).push(it));
    const typeSections = order.filter((k) => byType[k]).map((k) => {
      const list = byType[k].slice().sort((a, b) => a.slot - b.slot);
      return `<div class="cat"><h3>${esc(types[k]?.ko || k)}</h3><p>${esc(types[k]?.en || '')}</p><ul class="pts">` +
        list.map((it) => `<li><a href="/topik-listening/${esc(it.id)}.html">${it.slot}번</a></li>`).join('') +
        '</ul></div>';
    }).join('\n');
    return `<h2>TOPIK ${exam} — ${ex.items.length}문항</h2>${typeSections}`;
  }).join('\n');

  const body = [
    '<nav class="crumb"><a href="/">치즈감자</a> › TOPIK 듣기</nav>',
    `<h1>TOPIK 듣기 연습 문항 ${total}개</h1>`,
    '<p class="lead">TOPIK I·II 듣기 유형별 연습 문항입니다. 대본과 정답, 해설이 함께 있습니다.<br>' +
      '<b>기출문제가 아니라 같은 유형으로 새로 쓴 창작 문항입니다.</b><br>' +
      `${total} original TOPIK I/II listening practice questions with transcripts and answers explained.</p>`,
    '<a class="cta" href="/#learn/topik/I/listening">TOPIK 듣기 열기<span>Open the listening practice</span></a>',
    sections,
  ].join('\n');

  return page({
    url: '/topik-listening/', kind: 'website',
    title: `TOPIK 듣기 연습 문항 ${total}개 | 치즈감자`,
    desc: clip(`TOPIK I·II 듣기 유형별 연습 문항 ${total}개. 대본과 정답, 해설까지. 기출이 아닌 창작 문항입니다.`),
    body,
    jsonld: [crumbLd([['치즈감자', '/'], ['TOPIK 듣기', '/topik-listening/']])],
  });
}

/* ── 사전 ───────────────────────────────────────────────────── */
/* topik-writing 을 고치며 배운 것을 그대로 적용한다 — 표제어마다 제 주소를
   가진 쪽 하나. 지금은 낱말 5,346개(정확히는 GLOSSARY 를 head 로 묶은
   4,209개 — 「5,346」은 활용형까지 센 찾기용 꼴 수다, docs/glossary.json
   참고)가 오직 #dictionary 화면 하나로만 있어서 크롤러에게는 안 보인다.
   문법 표현·TOPIK 문항은 진작 다 정적 쪽을 얻었는데 낱말만 빠져 있었다.

   내용은 GLOSSARY(표제어·품사·영어 뜻) + SENSES(뜻풀이가 여럿인 말만,
   2,391개) + EXAMPLES(예문 하나, 4,207개)를 그대로 쓴다 — 앱의 사전
   화면(dictDrawMore)이 보여주는 것과 똑같다. */
const DICT_HEADS = [...new Map(
  Object.values(GLOSSARY).map((v) => [v.head, v])
).values()].sort((a, b) => a.head.localeCompare(b.head, 'ko'));

/* 한글 초성 — 사전 목록을 가나다순으로 나눌 자리표다. */
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function choOf(head) {
  const code = head.codePointAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return head[0] || '#';   // 한글이 아니면(드묾) 그 글자 그대로
  return CHO[Math.floor(code / (21 * 28))];
}

function wordPage(entry, prev, next) {
  const { head, pos, en } = entry;
  const firstEn = (en || '').split(';')[0].trim();
  /* 「hello in Korean」처럼 거꾸로(영어→한국어) 찾는 사람이 실제로 많다.
     제목 앞자리를 그 검색에 맞춘다 — 한국어 표제어는 어차피 본문 h1 과
     제목 뒷자리에 그대로 있어 한국어 쪽 검색도 놓치지 않는다. */
  const title = firstEn
    ? `${head} — "${esc(firstEn)}" in Korean | 치즈감자`
    : `${head} 뜻 — 한국어 낱말 사전 | 치즈감자`;
  const senses = SENSES[head];
  const example = EXAMPLES[head];
  const headTag = pos ? `${head}(${pos})` : head;   // 품사가 없는 표제어(감탄사류)엔 빈 괄호를 안 붙인다
  const desc = clip(senses?.length
    ? `${headTag} — ${senses[0][0]}${senses[0][1] ? ` (${senses[0][1]})` : ''}`
    : `${headTag} — ${en || '한국어 낱말'}`);

  const body = [
    `<nav class="crumb"><a href="/">치즈감자</a> › <a href="/dictionary/">사전</a> › ${esc(head)}</nav>`,
    pos ? `<span class="badge">${esc(pos)}</span>` : '',
    `<h1>${esc(head)}</h1>`,
    firstEn ? `<p class="sub" lang="en">${esc(firstEn)}</p>` : '',
    '<h2>뜻풀이 · Meaning</h2>',
    senses?.length
      ? '<div class="facts">' + senses.map(([ko, enS], i) =>
          `<div class="fact"><b>${i + 1}</b><span>${esc(ko)}${enS ? `<i lang="en">${esc(enS)}</i>` : ''}</span></div>`
        ).join('') + '</div>'
      : `<p class="desc">${esc(en || t2(pos))}</p>`,
    example ? '<h2>예문 · Example</h2>' +
      `<div class="ex">${esc(example.ex)}<i lang="en">${esc(example.en)}</i></div>` : '',
    `<a class="cta" href="/#dictionary/${encodeURIComponent(head)}">사전에서 발음 듣고 단어장에 담기` +
      `<span>Hear it pronounced and save "${esc(head)}" to your wordbook</span></a>`,
    (prev || next) ? '<div class="near">' +
      (prev ? `<a href="/dictionary/${encodeURIComponent(prev.head)}.html"><b>← 이전</b>${esc(prev.head)}</a>` : '') +
      (next ? `<a href="/dictionary/${encodeURIComponent(next.head)}.html"><b>다음 →</b>${esc(next.head)}</a>` : '') +
      '</div>' : '',
  ].filter(Boolean).join('\n');

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'DefinedTerm',
      '@id': `${SITE}/dictionary/${encodeURIComponent(head)}.html`,
      name: head,
      description: senses?.length ? senses[0][0] : (en || undefined),
      inDefinedTermSet: `${SITE}/dictionary/`,
      inLanguage: 'ko',
    },
    crumbLd([['치즈감자', '/'], ['사전', '/dictionary/'], [head, null]]),
  ];
  return page({
    url: `/dictionary/${encodeURIComponent(head)}.html`,
    title, desc, body, jsonld,
    extraCss: '.ex i{display:block;color:var(--dim);font-size:14px;font-style:normal;margin-top:4px}',
  });
}
/* 뜻풀이도 예문도 없는 극소수(품사만 있는 표제어) 를 위한 마지막 버팀목.
   빈 쪽을 내느니 품사라도 적힌 문장 하나를 낸다. */
function t2(pos) { return pos ? `${pos}.` : '한국어 낱말입니다.'; }

function wordHub(heads) {
  const groups = new Map();
  heads.forEach((h) => {
    const c = choOf(h.head);
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c).push(h);
  });
  const sections = [...groups.entries()].map(([cho, list]) =>
    `<div class="cat"><h3>${esc(cho)}</h3><ul class="pts">` +
    list.map((h) => `<li><a href="/dictionary/${encodeURIComponent(h.head)}.html">${esc(h.head)}</a></li>`).join('') +
    '</ul></div>'
  ).join('\n');
  const n = heads.length.toLocaleString('ko-KR');

  const body = [
    '<nav class="crumb"><a href="/">치즈감자</a> › 사전</nav>',
    `<h1>한국어 낱말 사전 — ${n}개</h1>`,
    '<p class="lead">국립국어원 한국어기초사전 뜻풀이를 담은 낱말입니다. 표제어마다 뜻풀이와 예문이 있고, 앱 사전에서 발음을 듣고 단어장에 담을 수 있습니다.<br>' +
      `${n} Korean words with meanings and example sentences, from the National Institute of Korean Language's basic dictionary.</p>`,
    '<a class="cta" href="/#dictionary">사전 열기<span>Search the full dictionary in the app</span></a>',
    sections,
  ].join('\n');

  return page({
    url: '/dictionary/', kind: 'website',
    title: `한국어 낱말 사전 ${n}개 — 뜻풀이·예문 | 치즈감자`,
    desc: clip(`한국어 낱말 ${n}개의 뜻풀이와 예문. 국립국어원 한국어기초사전 CC BY-SA 2.0 KR.`),
    body,
    jsonld: [crumbLd([['치즈감자', '/'], ['사전', '/dictionary/']])],
  });
}

/* ── 블로그 ─────────────────────────────────────────────────── */
/* 목록 쪽은 글이 없어도 항상 굽는다("곧 올릴게요" 안내가 뜬다) — 그래야
   나중에 글을 하나만 추가해도 바로 목록에 걸린다.

   생김새는 **게시판(레딧) 꼴**을 따른다. 앞서 카드를 큼직하게 늘어놓던
   모양은 글이 하나일 때는 멀쩡했지만 다섯 편이 되자 훑기가 나빴다 —
   한 화면에 두 편밖에 안 들어오고, 어느 글이 무엇에 대한 것인지 알려면
   요약을 다 읽어야 했다. 게시판 꼴은 줄을 촘촘히 쌓고, 왼쪽에 분량,
   아래에 갈래표를 붙여 **눈으로 고르게** 한다.

   다만 색과 말씨는 그대로 치즈감자다. 레딧의 회색 크롬을 흉내 내지 않고
   기존 CSS 변수(--bg/--card/--brand/--soft)를 그대로 쓰되, 모서리를
   16px 에서 10px 로 줄이고 여백을 좁혀 「읽는 쪽」이 아니라 「고르는 쪽」
   처럼 보이게만 한다.

   골격(CSS 변수·.crumb·.foot)은 다른 정적 쪽과 그대로 나눠 쓴다.
   page() 의 extraCss 로만 들어가므로 표현·코스 쪽 무게는 안 변한다. */
const BLOG_CSS = `
/* 게시판 쪽에서만 쓰는 색. 바탕과 카드 사이의 한 겹 — 레딧으로 치면
   글 목록이 얹히는 그 회색 자리다. 크림색 바탕에 회색을 섞으면 탁해지니
   기존 --soft 를 옅게 깐다. */
:root{--rb-deck:#f6efe0;--rb-rail:#8a7c6a;--rb-hair:#e3d7c2}
@media(prefers-color-scheme:dark){:root{--rb-deck:#141110;--rb-rail:#9b8e7d;--rb-hair:#3a3027}}

.rb-banner{display:flex;align-items:center;gap:14px;flex-wrap:wrap;
  border:1px solid var(--line);border-radius:12px;background:var(--card);padding:16px 18px;margin:0 0 16px}
.rb-avatar{flex:none;width:52px;height:52px;border-radius:50%;background:var(--brand);
  display:grid;place-items:center;font-size:26px;line-height:1}
.rb-id{flex:1 1 220px;min-width:0}
.rb-id h1{font-size:22px;margin:0;letter-spacing:-.02em;line-height:1.25}
.rb-id p{margin:3px 0 0;font-size:13px;color:var(--dim);line-height:1.5}
.rb-join{flex:none;background:var(--brand);color:#2b2117;text-decoration:none;font-weight:700;
  font-size:14px;padding:9px 18px;border-radius:999px;white-space:nowrap}
.rb-join:hover{filter:brightness(.95)}

.rb-cols{display:grid;gap:16px;grid-template-columns:1fr;align-items:start}
@media(min-width:880px){.rb-cols{grid-template-columns:minmax(0,1fr) 288px}}

/* ── 글 줄 ── */
.rb-feed{display:flex;flex-direction:column;gap:8px;padding:0;margin:0;list-style:none}
.rb-post{position:relative;display:flex;gap:0;border:1px solid var(--line);border-radius:10px;
  background:var(--card);overflow:hidden;transition:border-color .12s}
.rb-post:hover{border-color:var(--brand)}
/* 왼쪽 기둥. 레딧은 여기에 추천 화살표가 서는데, 우리에겐 셀 표가 없다.
   없는 숫자를 지어 넣는 대신 **읽는 데 걸리는 시간**을 세운다 — 목록에서
   고를 때 실제로 쓰는 정보이기도 하다. */
.rb-rail{flex:none;width:56px;background:var(--rb-deck);border-right:1px solid var(--rb-hair);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:14px 0;color:var(--rb-rail)}
.rb-rail b{font-size:17px;font-weight:800;line-height:1;color:var(--ink)}
.rb-rail span{font-size:11px;font-weight:600;letter-spacing:.02em}
.rb-body{flex:1 1 auto;min-width:0;padding:12px 16px 13px}
.rb-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px;color:var(--dim);font-weight:600}
.rb-meta .dot{opacity:.5;font-weight:400}
.rb-meta .rb-who{font-weight:700;color:var(--ink)}
.rb-post h2{font-size:17.5px;line-height:1.4;margin:5px 0 0;letter-spacing:-.01em;color:var(--ink)}
.rb-post h2 a{text-decoration:none}
/* 줄 전체를 누를 수 있게 제목 링크를 카드 위로 펼친다. 링크를 여러 개
   두면 스크린리더가 같은 글을 세 번 읽는다 — 진짜 링크는 하나만 둔다. */
.rb-post h2 a::after{content:'';position:absolute;inset:0}
.rb-ex{margin:6px 0 0;font-size:14px;line-height:1.62;color:var(--dim);
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rb-tail{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:10px 0 0}

/* 갈래표. 글이 열여섯 편으로 늘면서 갈래마다 쪽을 두는 값이 생겼다 —
   /blog/tag/<slug>.html 로 걸러 볼 수 있다(build-pages.mjs 의 blogTagPage).
   li 에 두던 배경·테두리·둥근 모서리는 그대로 두고, 안의 a 가 그 자리를
   꽉 채워 눌리게 한다. */
.rb-flair{display:flex;flex-wrap:wrap;gap:6px;padding:0;margin:0;list-style:none}
.rb-flair li{background:var(--soft);border:1px solid var(--rb-hair);border-radius:999px;
  font-size:11.5px;font-weight:700;letter-spacing:.01em;overflow:hidden}
.rb-flair a{display:block;padding:2px 10px;color:var(--dim);text-decoration:none}
.rb-flair a:hover{color:var(--ink);background:var(--rb-deck)}
.rb-flair li.on{background:var(--ink);border-color:var(--ink)}
.rb-flair li.on a{color:var(--bg)}
.rb-flair li.on a:hover{background:transparent}

/* ── 오른쪽 기둥 ── */
.rb-side{display:flex;flex-direction:column;gap:12px;min-width:0}
.rb-box{border:1px solid var(--line);border-radius:10px;background:var(--card);overflow:hidden}
.rb-box h2{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;
  margin:0;padding:10px 14px;background:var(--rb-deck);border-bottom:1px solid var(--rb-hair);color:var(--dim)}
.rb-box .in{padding:13px 14px;font-size:13.5px;line-height:1.62}
.rb-box p{margin:0 0 10px}
.rb-box p:last-child{margin-bottom:0}
.rb-stats{display:flex;gap:18px;padding:12px 14px;border-bottom:1px solid var(--rb-hair)}
.rb-stats div{min-width:0}
.rb-stats b{display:block;font-size:17px;font-weight:800;line-height:1.2}
.rb-stats span{font-size:11.5px;color:var(--dim);font-weight:600}
.rb-rules{margin:0;padding:4px 14px 13px 0;list-style:none;counter-reset:r;font-size:13.5px;line-height:1.6}
.rb-rules li{counter-increment:r;display:flex;gap:10px;padding:9px 0 0 14px;border-top:1px solid var(--rb-hair)}
.rb-rules li:first-child{border-top:0;padding-top:4px}
.rb-rules li::before{content:counter(r);flex:none;color:var(--rb-rail);font-weight:800;font-size:12.5px;padding-top:1px}
.rb-links{margin:0;padding:0;list-style:none;font-size:13.5px}
.rb-links li{border-top:1px solid var(--rb-hair)}
.rb-links li:first-child{border-top:0}
.rb-links a{display:block;padding:10px 14px;text-decoration:none}
.rb-links a:hover{background:var(--rb-deck)}
.rb-empty{border:1px dashed var(--line);border-radius:10px;padding:44px 24px;text-align:center;color:var(--dim)}
.rb-empty .emoji{font-size:34px;display:block;margin-bottom:10px}

/* ── 글 한 편 ── */
.rb-card{border:1px solid var(--line);border-radius:10px;background:var(--card);padding:22px 26px 26px}
.rb-card h1{font-size:27px;line-height:1.32;margin:8px 0 0;letter-spacing:-.02em}
.rb-card .rb-flair{margin-top:11px}
.blog-back{display:inline-flex;align-items:center;gap:5px;font-size:13.5px;color:var(--dim);
  text-decoration:none;margin-bottom:14px}
.blog-back:hover{color:var(--ink)}
.blog-article{font-size:17px;line-height:1.85;margin-top:22px}
.blog-article p{margin:0 0 22px}
.blog-article h2{font-size:21px;color:var(--ink);margin:36px 0 12px;letter-spacing:-.01em}
.blog-article h3{font-size:18px;color:var(--ink);margin:28px 0 10px}
.blog-article blockquote{margin:24px 0;padding:2px 20px;border-left:3px solid var(--brand);
  color:var(--dim);font-style:italic}
.blog-article ul,.blog-article ol{padding-left:22px;margin:0 0 22px}
.blog-article li{margin:6px 0}
.blog-article code{background:var(--soft);padding:2px 6px;border-radius:6px;font-size:.9em}
.blog-article img{max-width:100%;border-radius:10px;margin:6px 0}
.blog-article>*:first-child{margin-top:0}

/* ── 글 속 블록 ── */
/* 예문 한 칸. 한국어를 크게, 뜻을 아래에 흐리게. */
.bex{background:var(--soft);border:1px solid var(--rb-hair);border-left:3px solid var(--brand);
  border-radius:10px;padding:13px 16px;margin:0 0 22px}
.bex>b{display:block;font-size:17px;font-weight:600;line-height:1.6}
.bex span{display:block;margin-top:4px;font-size:14px;color:var(--dim);line-height:1.55}

/* 문법 카드 — 글에서 표현 쪽으로 들어가는 문. 링크 하나로 통째로 눌린다. */
.gcard{position:relative;display:block;text-decoration:none;border:1px solid var(--line);
  border-radius:12px;background:var(--card);padding:15px 18px;margin:0 0 22px;
  transition:border-color .12s,transform .12s}
.gcard:hover{border-color:var(--brand);transform:translateY(-1px)}
.gcard a{text-decoration:none}
.gcat{display:block;font-size:11.5px;font-weight:700;letter-spacing:.03em;color:var(--dim)}
.gcard>b{display:block;font-size:19px;margin:3px 0 0;letter-spacing:-.01em}
.gdesc{display:block;margin-top:6px;font-size:15px;line-height:1.62;color:var(--ink)}
.gnote{display:block;margin-top:8px;font-size:14px;line-height:1.6;color:var(--dim)}
.gacts{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:13px}
/* 앞의 것이 카드 전체를 덮는다 — 어디를 눌러도 예문 만들기로 간다. */
.ggo{font-size:13.5px;font-weight:800;color:#2b2117;background:var(--brand);
  border-radius:999px;padding:8px 15px;line-height:1.2}
.ggo::after{content:'';position:absolute;inset:0;border-radius:12px}
/* 여기에 filter 나 transform 을 걸지 마라. 둘 다 이 알약을 제 ::after 의
   컨테이닝 블록으로 만들어, 덮개가 카드 전체가 아니라 알약 크기로
   쪼그라든다 — 커서를 올린 순간 덮개가 커서 밑에서 사라지고 클릭이
   카드로 빠진다. 화면으로는 멀쩡해 보여서 눌러 보기 전에는 모른다.
   안쪽 그림자는 컨테이닝 블록을 만들지 않으므로 안전하다. */
.gcard:hover .ggo{box-shadow:inset 0 0 0 999px rgba(0,0,0,.07)}
/* 뒤의 것은 덮개 위로 띄운다. 안 그러면 눌리지 않는다. */
.gsub{position:relative;z-index:1;font-size:13px;font-weight:600;color:var(--dim);
  border-bottom:1px solid var(--rb-hair);padding-bottom:1px}
.gsub:hover{color:var(--ink);border-color:var(--brand)}
.glinkgo{display:block;margin-top:11px;font-size:13px;font-weight:700;color:var(--dim)}
a.gcard:hover .glinkgo{color:var(--ink)}

/* 사진. 폭을 넘기지 않게만 잡고 비율은 파일에 맡긴다. */
.bimg{margin:0 0 24px}
.bimg img{display:block;width:100%;height:auto;border-radius:12px;border:1px solid var(--line)}
.bimg figcaption{margin-top:8px;font-size:13px;line-height:1.55;color:var(--dim)}

/* 짚어 둘 것 — 본문에서 한 발 뺀 이야기. */
.bnote{display:block;border:1px solid var(--rb-hair);background:var(--rb-deck);border-radius:10px;
  padding:14px 17px;margin:0 0 22px;font-size:15px;line-height:1.68}
.bnote>.bnt{display:block;font-size:12.5px;font-weight:800;letter-spacing:.04em;color:var(--dim);margin-bottom:5px}

/* 대화문은 표현 쪽(.dlg/.line/.who/.bub)을 그대로 나눠 쓴다 — 글 안에서는
   위아래 여백만 더 준다. */
.blog-article .dlg{margin:0 0 24px}
.rb-next{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;
  color:var(--dim);margin:30px 0 10px}
@media(max-width:520px){.rb-card{padding:18px 17px 22px}.rb-card h1{font-size:23px}}

/* ── 에디토리얼/모던 톤 ──────────────────────────────────────
   스티커북(굵은 테두리·밀린 그림자·통통한 글꼴) 방향을 "촌스럽다"는
   말을 듣고 전면 폐기, 절제된 세리프 제목 + Pretendard 본문의 편집
   느낌으로 다시 짠다. 목록을 태그만 남기고 정리한 것(.rb-ex 숨김 등)은
   구조 개선이라 그대로 둔다. 아래도 여전히 값만 덮어쓰는 방식이다 —
   .gcard 의 클릭 덮개 트릭 때문에 .ggo 에는 filter·transform 을
   걸지 않는다. */
/* Noto Serif KR 도 무겁다는 말을 들었다. 시안 넷을 만들어 보였고
   Gowun Batang(더 가볍고 따뜻한 모던 세리프)으로 정했다. */
@import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap');

:root{--bg:#FBF8F3;--ink:#26211B;--dim:#7A7168;--line:#E5DED2;--card:#FFFFFF;--brand:#B8763E;--soft:#F4EFE6;
  --rb-deck:#F4EFE6;--rb-rail:#9C9184;--rb-hair:#E5DED2}
@media(prefers-color-scheme:dark){:root{--bg:#17140F;--ink:#EDE8DF;--dim:#A79C8C;--line:#332C22;--card:#211D17;--brand:#D99A5C;--soft:#241F18;
  --rb-deck:#241F18;--rb-rail:#8A8073;--rb-hair:#332C22}}

body{font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}
h1,.rb-id h1,.rb-card h1,.rb-post h2,.blog-article h2{font-family:'Gowun Batang',serif;font-weight:700;letter-spacing:-.01em}
.rb-id h1{font-size:26px}
.rb-card h1{font-size:34px;line-height:1.45}

.rb-banner{border:1px solid var(--line);border-radius:14px;box-shadow:none}
.rb-avatar{border:none}
.rb-join{border:none;box-shadow:none;background:var(--ink);color:var(--bg);transition:opacity .15s}
.rb-join:hover{opacity:.82;transform:none;filter:none}

/* 피드 한 줄 — 소제목·요약·태그가 다 들어차서 지저분해 보였다. 요약은
   지우고 제목을 키워 태그만 남긴다. 카드 대신 밑줄로 가르는 목록꼴이라
   더 정돈되어 보인다. */
.rb-feed{gap:0}
.rb-post{border:0;border-bottom:1px solid var(--line);border-radius:0;box-shadow:none}
.rb-post:hover{transform:none;background:var(--soft)}
.rb-post .rb-body{padding:26px 22px}
.rb-post h2{font-size:23px;margin-top:8px;font-weight:600}
.rb-post .rb-ex{display:none}
.rb-post .rb-tail{margin-top:12px}
.rb-rail{background:transparent;border-right:none}

.rb-box{border:1px solid var(--line);border-radius:10px;box-shadow:none}
.rb-box h2{border-bottom:1px solid var(--rb-hair);font-weight:700}

.rb-flair li{border:1px solid var(--line);background:transparent;font-weight:500}

.rb-empty{border:1px solid var(--line);border-radius:10px;background:var(--soft)}

.rb-card{border:1px solid var(--line);border-radius:10px;box-shadow:none;padding:36px 40px 40px}

/* 문법 카드가 기능성 박스처럼 붕 떠 보인다는 말을 들었다. 흰 카드 +
   테두리 대신 .bex 처럼 옅게 물든 바탕 + 왼쪽 포인트 선으로 바꿔
   본문 흐름 속 한 문단처럼 보이게 한다. 안의 두 링크(.ggo 덮개 트릭)는
   손대지 않는다. */
.gcard{border:none;border-left:3px solid var(--brand);border-radius:0 10px 10px 0;
  background:var(--soft);box-shadow:none}
.gcard:hover{border-color:var(--brand)}

.bex{border:1px solid var(--line);border-left:3px solid var(--brand);border-radius:8px}
.bnote{border:1px solid var(--line);border-radius:8px}

/* 인용구 — 왼쪽 테두리 하나짜리 각주였는데, 눈에 띄어야 할 문장이라
   큰 세리프로 화면 가운데 끌어내 필그리 이듈처럼 키운다. */
.blog-article blockquote{border:none;margin:36px auto;padding:0 8px;max-width:480px;
  font-family:'Gowun Batang',serif;font-size:24px;line-height:1.6;font-style:normal;
  color:var(--ink);text-align:center}

/* 글 머리 — 작성자가 안 보이면 문서처럼 읽힌다. 아바타·이름·역할·날짜를
   한 줄로 묶고, 제목 위아래로 여백을 넉넉히 줘 분위기를 만든다. */
.rb-card{padding-top:44px}
.rb-byline{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.rb-avatar-sm{flex:none;width:44px;height:44px;border-radius:50%;background:var(--soft);
  display:grid;place-items:center;font-size:22px;line-height:1}
.rb-byline-name{font-size:15px;font-weight:700}
.rb-byline-role{font-size:13px;color:var(--dim);margin-top:2px}
.rb-card h1{margin-top:0}
.rb-card .rb-flair{margin:14px 0 28px;padding-bottom:28px;border-bottom:1px solid var(--line)}

.cta{border:none;border-radius:10px;box-shadow:none;background:var(--ink);color:var(--bg);
  font-weight:600;transition:opacity .15s}
.cta:hover{transform:none;opacity:.85}
.cta span{opacity:.7}

.blog-article img{border:1px solid var(--line)}
.bimg img{border:1px solid var(--line)}

/* 나가는 버튼(← 블로그)이 흐린 글자라 눈에 안 띈다는 말을 들었다.
   알약 배경 + 진한 글자로 눌러야 할 자리처럼 보이게 한다. */
.blog-back{color:var(--ink);font-weight:700;background:var(--soft);
  border:1px solid var(--line);border-radius:999px;padding:7px 14px 7px 12px}
.blog-back:hover{background:var(--card);border-color:var(--rb-rail)}

/* 오른쪽 기둥 — 정보·규칙·링크 상자가 세로로 길게 늘어져 무거워 보였다.
   숫자로 두르는 원 대신 옅은 점으로, 칸마다 있던 가로줄은 지워 한
   문단처럼 붙여 읽히게 줄인다. */
.rb-stats{gap:22px;padding:13px 14px 12px}
.rb-box .in{padding-top:11px}
.rb-rules{padding:2px 14px 12px 0}
.rb-rules li{gap:9px;padding:7px 0 0 0;border-top:0}
.rb-rules li::before{content:'';width:5px;height:5px;border-radius:50%;
  background:var(--rb-rail);margin-top:8px;padding:0}
.rb-links a{padding:8px 14px}

/* 글 공유 버튼 — byline 아래, 본문 위에 둔다. */
.rb-share{display:flex;align-items:center;gap:8px;margin-top:18px;flex-wrap:wrap}
.share-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);
  border-radius:999px;padding:7px 14px;font-size:13.5px;font-weight:600;color:var(--ink);
  background:var(--card);cursor:pointer;transition:background .15s,border-color .15s;
  font-family:inherit}
.share-btn:hover{background:var(--soft);border-color:var(--rb-rail)}
.share-btn svg{flex:none}
.share-toast{font-size:12.5px;color:var(--dim);opacity:0;transition:opacity .2s}
.share-toast.on{opacity:1}
`.trim();

/* 목록 쪽만 넓게 쓴다. 글 읽는 쪽은 한 줄이 길어지면 눈이 되돌아올 자리를
   잃으므로 좁은 채로 둔다 — 같은 BLOG_CSS 를 쓰되 폭만 여기서 가른다. */
const BLOG_HUB_CSS = '\n@media(min-width:880px){.wrap{max-width:1060px}}';

/* ── 글 속 블록 ─────────────────────────────────────────────
   글 본문을 날 HTML 문자열로 두면 두 가지가 깨진다.

   하나, **모델이 쓴 HTML 은 믿을 수 없다.** 블로그 글을 Gemini 에게
   받는데(tools/blog-prompt.mjs), 태그 하나만 안 닫혀도 쪽 전체가 무너진다.
   실제로 자료를 받아 보면 </p> 를 빠뜨리거나 <br/> 과 <br> 을 섞는다.

   둘, **모델이 문법 설명을 지어낸다.** 「-는 바람에는 …라는 뜻입니다」를
   그럴듯하게 써 놓는데, 우리에겐 이미 손으로 다듬은 뜻풀이가 290개 있다.
   지어낸 설명을 실을 까닭이 없다.

   그래서 본문을 **블록 배열**로 받는다. 글자는 전부 esc() 를 지나고,
   허용하는 꾸밈은 **굵게** 하나뿐이다. 그리고 문법 카드(t:'gram')는
   **id 만** 받아서 뜻풀이는 우리 sentences.js 에서 꺼내 붙인다 — 모델은
   「어느 표현을 걸지」와 「왜 보라는지」만 정하고, 표현이 무슨 뜻인지는
   우리 자료가 말한다.

   손으로 쓴 예전 글은 body(HTML 문자열)를 그대로 쓴다. 둘 다 받는다. */
const SB_BY_ID = new Map();
for (const cat of SB_CATS) for (const p of cat.points) SB_BY_ID.set(p.id, { p, cat });

/* 글자 안에서 허용하는 꾸밈은 **굵게** 하나뿐이다. esc() 를 먼저 지나므로
   모델이 <script> 를 적어 보내도 글자로만 남는다. */
const inline = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

function renderBlock(b, where) {
  const bad = (why) => { throw new Error(`블로그 블록이 잘못됐다 (${where}): ${why}\n  ${JSON.stringify(b).slice(0, 160)}`); };
  switch (b?.t) {
    case 'p':
      if (!b.text) bad('t:"p" 에 text 가 없다');
      return `<p>${inline(b.text)}</p>`;

    case 'h':
      if (!b.text) bad('t:"h" 에 text 가 없다');
      return `<h2>${inline(b.text)}</h2>`;

    case 'quote':
      if (!Array.isArray(b.lines) || !b.lines.length) bad('t:"quote" 에 lines 배열이 없다');
      return `<blockquote>${b.lines.map(inline).join('<br>')}</blockquote>`;

    case 'list':
      if (!Array.isArray(b.items) || !b.items.length) bad('t:"list" 에 items 배열이 없다');
      return `<${b.ordered ? 'ol' : 'ul'}>` + b.items.map((i) => `<li>${inline(i)}</li>`).join('') +
        `</${b.ordered ? 'ol' : 'ul'}>`;

    /* 예문 한 칸. 한국어를 크게, 영어 뜻을 아래에 흐리게 — 표현 쪽(.ex)과
       같은 결이되 뜻을 함께 보여 준다. */
    case 'ex':
      if (!b.ko) bad('t:"ex" 에 ko 가 없다');
      return `<div class="bex"><b>${inline(b.ko)}</b>${b.en ? `<span>${inline(b.en)}</span>` : ''}</div>`;

    /* 대화문. 표현 쪽과 같은 규칙 — A 는 치즈, B 는 감자. */
    case 'dlg': {
      if (!Array.isArray(b.lines) || !b.lines.length) bad('t:"dlg" 에 lines 배열이 없다');
      const rows = b.lines.map((line) => {
        const m = /^([AB]):\s*(.+)$/.exec(line);
        if (!m) bad(`대화문 줄은 "A: …" 나 "B: …" 여야 한다 — "${line}"`);
        const who = m[1];
        return `<div class="line ${who === 'A' ? 'a' : 'b'}">` +
          `<span class="who" aria-hidden="true">${who === 'A' ? '🧀' : '🥔'}</span>` +
          `<span class="bub">${inline(m[2])}</span></div>`;
      }).join('');
      return `<div class="dlg">${rows}</div>`;
    }

    /* 문법 카드 — 「문법마다 들어가서 볼 수 있게」 하는 자리다.
       뜻풀이는 sentences.js 에서 꺼낸다. 없는 id 면 여기서 멈춘다 —
       조용히 넘기면 글에 죽은 링크가 실린다.

       **누르면 예문 만들기로 곧장 들어간다**(#learn/sentence/<id>).
       읽다가 「아 이거 써 봐야겠다」 싶은 순간이 제일 짧은데, 거기서
       표현 설명 쪽을 한 번 더 거치게 하면 그 순간이 식는다. 설명이 먼저
       필요한 사람을 위해 아래에 표현 쪽으로 가는 줄을 따로 남긴다.

       링크가 둘이라 카드 전체를 덮는 것은 앞의 것(예문 만들기)이고,
       뒤의 것은 z-index 로 그 위에 띄운다 — 안 그러면 덮개에 가려
       눌리지 않는다. */
    case 'gram': {
      if (!b.id) bad('t:"gram" 에 id 가 없다');
      const hit = SB_BY_ID.get(b.id);
      if (!hit) bad(`문법 표현 ${b.id} 이 sentences.js 에 없다`);
      return `<div class="gcard">` +
        `<span class="gcat">${esc(hit.cat.ko)}</span>` +
        `<b>${esc(hit.p.name)}</b>` +
        `<span class="gdesc">${esc(hit.p.desc)}</span>` +
        (b.note ? `<span class="gnote">${inline(b.note)}</span>` : '') +
        `<span class="gacts">` +
          `<a class="ggo" href="/#learn/sentence/${esc(b.id)}">` +
            `이 표현으로 문장 만들어 보기 →</a>` +
          `<a class="gsub" href="/sentence/${esc(b.id)}.html">` +
            `형태·주의할 점·예문 먼저 보기</a>` +
        `</span>` +
      `</div>`;
    }

    /* 사이트 안 다른 쪽으로 보내는 카드. 문법 표현이 아닌 것(코스·목록
       쪽)을 걸 때 쓴다. 주소가 실재하는지는 tools/check-blog.mjs 가 본다. */
    case 'link':
      if (!b.href || !b.title) bad('t:"link" 에 href 나 title 이 없다');
      if (!b.href.startsWith('/')) bad('t:"link" 의 href 는 사이트 안 주소(/ 로 시작)여야 한다');
      return `<a class="gcard" href="${esc(b.href)}">` +
        `<b>${esc(b.title)}</b>` +
        (b.note ? `<span class="gnote">${inline(b.note)}</span>` : '') +
        `<span class="glinkgo">보러 가기 →</span>` +
      `</a>`;

    /* 사진. 파일이 실재하는지는 tools/check-blog.mjs 가 본다 — 여기서
       파일을 읽지는 않는다(굽는 일이 느려진다). alt 는 반드시 받는다. */
    case 'img':
      if (!b.src) bad('t:"img" 에 src 가 없다');
      if (!b.alt) bad('t:"img" 에 alt 가 없다 — 눈으로 못 보는 사람에게 사진은 alt 가 전부다');
      return `<figure class="bimg"><img src="${esc(b.src)}" alt="${esc(b.alt)}" loading="lazy"` +
        (b.w && b.h ? ` width="${esc(String(b.w))}" height="${esc(String(b.h))}"` : '') + '>' +
        (b.cap ? `<figcaption>${inline(b.cap)}</figcaption>` : '') + '</figure>';

    /* 짚어 둘 것. 본문 흐름에서 한 발 뺀 이야기 — 「이건 시험에서는 다르다」
       같은 것. */
    case 'note':
      if (!b.text) bad('t:"note" 에 text 가 없다');
      return `<aside class="bnote">${b.title ? `<b class="bnt">${inline(b.title)}</b>` : ''}${inline(b.text)}</aside>`;

    default:
      bad(`모르는 블록 종류 t:${JSON.stringify(b?.t)}`);
  }
}

/* 글 하나의 본문 HTML. blocks 가 있으면 그것을, 없으면 손으로 쓴 body 를.
   분량 세기·RSS·쪽 굽기가 전부 이 하나를 쓴다 — 따로 계산하면 목록의
   「3분」과 글 쪽의 「3분」이 어긋난다. */
function postHtml(post) {
  if (Array.isArray(post.blocks)) {
    return post.blocks.map((b, i) => renderBlock(b, `${post.id} 의 ${i + 1}번째 블록`)).join('\n');
  }
  return post.body ?? '';
}

/* 한글 기준 대략 분당 500자 읽는다고 잡는다 — 정확할 필요는 없고,
   "훑어볼지 앉아서 읽을지" 감만 잡히면 된다. */
function readMins(html) {
  const chars = String(html ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, '').length;
  return Math.max(1, Math.round(chars / 500));
}
const fmtDateKo = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${+m[1]}년 ${+m[2]}월 ${+m[3]}일` : (iso || '');
};

/* 「4일 전」처럼 흐른 시간으로 적는 것이 게시판 꼴에는 맞다. 그런데 이
   쪽은 **구워 두는 정적 파일**이라, 구울 때 계산해 박으면 다음 날부터
   거짓말이 된다. 그래서 굽는 시점에는 진짜 날짜를 넣고, 보는 사람의
   브라우저에서만 흐른 시간으로 바꾼다. 스크립트가 안 돌면 날짜가 그대로
   남으므로 틀린 값이 뜨는 일은 없다. */
const AGO_JS = `
<script>
(function(){var n=Date.now(),u=[[31536000,'년'],[2592000,'개월'],[604800,'주'],[86400,'일'],[3600,'시간'],[60,'분']];
Array.prototype.forEach.call(document.querySelectorAll('time[datetime]'),function(t){
var d=new Date(t.getAttribute('datetime')+'T09:00:00+09:00');if(isNaN(d))return;
var s=Math.floor((n-d)/1000);if(s<0)return;t.title=t.textContent;
for(var i=0;i<u.length;i++){if(s>=u[i][0]){t.textContent=Math.floor(s/u[i][0])+u[i][1]+' 전';return}}t.textContent='방금'})})();
</script>`.trim();

/* 공유 버튼 두 개. 공유하기는 될 때(모바일 대부분)는 navigator.share 를
   쓰고, 안 되면(대개 데스크톱) 링크 복사로 대신한다 — 그래서 버튼은
   하나만 있어도 되지만, 데스크톱에서 늘 보이는 복사 버튼을 하나 더 둔다. */
const SHARE_JS = `
<script>
(function(){
var wrap=document.querySelector('.rb-share');if(!wrap)return;
var toast=wrap.querySelector('.share-toast');
function flash(m){if(!toast)return;toast.textContent=m;toast.classList.add('on');
  clearTimeout(flash._t);flash._t=setTimeout(function(){toast.classList.remove('on')},1800)}
function copy(){
  var url=location.href;
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(function(){flash('링크를 복사했어요')},function(){flash('복사에 실패했어요')});
  }else{
    var ta=document.createElement('textarea');ta.value=url;ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');flash('링크를 복사했어요')}catch(e){flash('복사에 실패했어요')}
    document.body.removeChild(ta);
  }
}
var shareBtn=wrap.querySelector('[data-share]'),copyBtn=wrap.querySelector('[data-copy]');
if(shareBtn)shareBtn.addEventListener('click',function(){
  if(navigator.share){navigator.share({title:document.title,url:location.href}).catch(function(){})}
  else{copy()}
});
if(copyBtn)copyBtn.addEventListener('click',copy);
})();
</script>`.trim();

/* 글 머리에 두는 공유 줄. 공유하기 버튼은 navigator.share 가 없는
   브라우저에서도 눌리긴 하므로(그때는 복사로 대신함) 늘 둘 다 보인다. */
function shareRow() {
  return '<div class="rb-share">' +
    '<button type="button" class="share-btn" data-share>' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>' +
        '<circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>' +
        '<line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>' +
      '공유하기</button>' +
    '<button type="button" class="share-btn" data-copy>' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/>' +
        '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
      '링크 복사</button>' +
    '<span class="share-toast" aria-live="polite"></span>' +
  '</div>';
}

/* 댓글 — giscus(깃허브 Discussions 기반). 정적 사이트라 우리 서버가
   없으니 댓글은 깃허브 계정으로 로그인해서 남기는 남의 서비스를 쓴다.
   repo-id·category-id는 저장소에서 giscus 앱을 설치하고 Discussions를
   켠 뒤 giscus.app 에서 받은 값이다 — 지어낸 값이 아니다. 글마다
   주소(pathname)로 토론을 찾아 붙이므로 카드마다 따로 손댈 게 없다. */
const GISCUS_SCRIPT = `
<h2 class="rb-next">댓글</h2>
<script src="https://giscus.app/client.js"
  data-repo="junsanghan1225-blip/cheesepotato-landing"
  data-repo-id="R_kgDOS8EVWA"
  data-category-id="DIC_kwDOS8EVWM4DFUN3"
  data-mapping="pathname"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="bottom"
  data-theme="preferred_color_scheme"
  data-lang="ko"
  crossorigin="anonymous"
  async>
</script>`.trim();

/* 갈래 이름 -> 주소에 쓸 영문 조각. /blog/tag/<slug>.html 이 된다.
   없는 갈래를 쓰면 굽다가 멈춘다 — 조용히 로마자로 바꾸면 주소가
   제멋대로 생긴다. 새 갈래를 쓰려면 여기에 먼저 하나 추가한다. */
const TAG_SLUGS = {
  '문법': 'grammar',
  '초급': 'beginner',
  '중급': 'intermediate',
  'TOPIK': 'topik',
  '준비': 'prep',
  '한글': 'hangul',
  '회화': 'conversation',
};
function tagSlug(tag) {
  const slug = TAG_SLUGS[tag];
  if (!slug) throw new Error(`갈래 "${tag}" 의 주소 조각이 TAG_SLUGS 에 없다 — tools/build-pages.mjs 에 추가할 것`);
  return slug;
}

const timeTag = (iso) => `<time datetime="${esc(iso)}">${esc(fmtDateKo(iso))}</time>`;
const flair = (tags) => (tags && tags.length)
  ? '<ul class="rb-flair">' + tags.map((t) =>
      `<li><a href="/blog/tag/${tagSlug(t)}.html">${esc(t)}</a></li>`).join('') + '</ul>'
  : '';

/* 글 머리에 서는 한 줄. 목록과 본문 쪽이 같은 줄을 써야 목록에서 본 것과
   눌러 들어간 쪽이 어긋나지 않는다. */
function postMeta(post) {
  return '<div class="rb-meta"><span class="rb-who">🧀 치즈감자</span>' +
    ` <span class="dot">·</span> ${timeTag(post.date)}` +
    (post.updated && post.updated !== post.date
      ? ` <span class="dot">·</span> 고침 ${timeTag(post.updated)}` : '') +
    '</div>';
}

/* 목록 줄 하나. 목록 쪽과 글 아래 「이어서 읽기」가 같은 모양을 쓴다. */
const postRow = (p) =>
  `<li class="rb-post">` +
    `<div class="rb-rail"><b>${readMins(postHtml(p))}</b><span>분</span></div>` +
    `<div class="rb-body">` +
      postMeta(p) +
      `<h2><a href="/blog/${esc(p.id)}.html">${esc(p.title)}</a></h2>` +
      `<p class="rb-ex">${esc(p.excerpt)}</p>` +
      (p.tags && p.tags.length ? `<div class="rb-tail">${flair(p.tags)}</div>` : '') +
    `</div>` +
  `</li>`;

/* 같은 갈래를 하나라도 나눠 가진 글을 먼저, 그다음 최신 순으로 채운다.
   앞뒤 글(.near)로 이미 걸어 둔 것은 뺀다 — 같은 쪽에 같은 글이 두 번
   뜨면 고르는 게 아니라 헷갈리는 자리가 된다. */
function relatedPosts(post, all, skip, n = 3) {
  const mine = new Set(post.tags || []);
  const out = all.filter((p) => p.id !== post.id && !skip.has(p.id));
  const score = (p) => (p.tags || []).filter((t) => mine.has(t)).length;
  return out
    .map((p, i) => ({ p, i, s: score(p) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, n)
    .map((x) => x.p);
}

/* 글 한 편의 머리 — 목록 줄(postMeta)보다 무게를 준다. 누가 썼는지
   보이지 않으면 문서처럼 읽힌다. 이름·역할·날짜를 한 줄에 모은다. */
function postByline(post) {
  return '<div class="rb-byline">' +
    '<span class="rb-avatar-sm" aria-hidden="true">🧀</span>' +
    '<div class="rb-byline-info">' +
      '<div class="rb-byline-name">치즈감자</div>' +
      '<div class="rb-byline-role">한국어를 가르치는 사람' +
        ` · ${timeTag(post.date)}` +
        (post.updated && post.updated !== post.date ? ` · 고침 ${timeTag(post.updated)}` : '') +
      '</div>' +
    '</div>' +
  '</div>';
}

function blogPage(post, prev, next, related) {
  const title = `${post.title} | 치즈감자 블로그`;
  const desc = clip(post.excerpt);
  const body = [
    `<a class="blog-back" href="/blog/">← 블로그</a>`,
    `<nav class="crumb"><a href="/">치즈감자</a> › <a href="/blog/">블로그</a></nav>`,
    `<article class="rb-card">`,
      postByline(post),
      `<h1>${esc(post.title)}</h1>`,
      flair(post.tags),
      shareRow(),
      `<div class="blog-article">${postHtml(post)}</div>`,
    `</article>`,
    `<a class="cta" href="/#learn">한국어 배우러 가기<span>Free Korean lessons, no sign-up needed</span></a>`,
    /* 앞뒤 글. 배열은 최신이 앞이므로 「이전 글」은 한 칸 뒤(더 오래된 것),
       「다음 글」은 한 칸 앞(더 새것)이다. 표현·레슨 쪽과 같은 .near 를 쓴다. */
    (prev || next) ? '<div class="near">' +
      (prev ? `<a href="/blog/${esc(prev.id)}.html"><b>← 이전 글</b>${esc(prev.title)}</a>` : '') +
      (next ? `<a href="/blog/${esc(next.id)}.html"><b>다음 글 →</b>${esc(next.title)}</a>` : '') +
      '</div>' : '',
    related.length
      ? `<h2 class="rb-next">같은 갈래의 글</h2>` +
        '<ul class="rb-feed">' + related.map(postRow).join('') + '</ul>'
      : '',
    GISCUS_SCRIPT,
    AGO_JS,
    SHARE_JS,
  ].filter(Boolean).join('\n');

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
      publisher: { '@type': 'Organization', name: '치즈감자', url: SITE },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${post.id}.html` },
      ...(post.tags && post.tags.length ? { keywords: post.tags.join(', ') } : {}),
      isAccessibleForFree: true,
    },
    crumbLd([['치즈감자', '/'], ['블로그', '/blog/'], [post.title, null]]),
  ];
  /* og:type 은 page() 가 기본으로 article 을 준다. 글에는 낸 날·고친 날을
     함께 적는다 — 페이스북·카카오 미리보기와 검색이 같은 값을 읽는다. */
  const extraHead =
    `\n<meta property="article:published_time" content="${esc(post.date)}">` +
    `\n<meta property="article:modified_time" content="${esc(post.updated || post.date)}">` +
    (post.tags || []).map((t) => `\n<meta property="article:tag" content="${esc(t)}">`).join('') +
    `\n<link rel="alternate" type="application/rss+xml" title="치즈감자 블로그" href="${SITE}/blog/rss.xml">`;

  return page({ url: `/blog/${post.id}.html`, title, desc, body, jsonld, extraCss: BLOG_CSS, extraHead });
}

/* 오른쪽 기둥에 세우는 것. 레딧으로 치면 소개·규칙 상자 자리다.
   **셀 수 있는 것만 센다** — 방문자 수처럼 우리가 모르는 숫자는 안 적는다. */
function blogSide(posts, activeTag) {
  const tags = new Map();
  for (const p of posts) for (const t of (p.tags || [])) tags.set(t, (tags.get(t) || 0) + 1);
  const oldest = posts[posts.length - 1];

  /* 규칙 상자. 레딧의 「규칙」 자리인데, 남에게 거는 규칙이 아니라
     이 블로그가 스스로 지키는 것을 적는다. 실제로 글을 쓸 때 지킨 것만
     적는다 — 안 지킬 것을 걸어 두면 그게 제일 나쁘다. */
  const rules = [
    '광고를 쓰지 않는다. 사이트에 실제로 있는 것만 적는다.',
    '연습 문항은 기출이 아니라 창작이라는 것을 그때마다 밝힌다.',
    '자주 바뀌는 제도(접수·비자 기준)는 숫자를 옮겨 적지 않고 공식 안내로 보낸다.',
    '없는 쪽은 걸지 않는다. 글 안의 링크는 전부 실재하는 주소다.',
  ];

  return [
    '<aside class="rb-side">',
    '<section class="rb-box">',
      '<h2>블로그 정보</h2>',
      `<div class="rb-stats">` +
        `<div><b>${posts.length}</b><span>올린 글</span></div>` +
        `<div><b>${tags.size}</b><span>갈래</span></div>` +
        (oldest ? `<div><b>${esc(oldest.date.slice(0, 4))}.${esc(String(+oldest.date.slice(5, 7)))}</b><span>시작</span></div>` : '') +
      `</div>`,
      '<div class="in"><p>한국어를 배우다 막히는 자리에 대해 씁니다. 문법 하나를 ' +
        '가려 쓰는 법, TOPIK 을 어디까지 준비할지 같은 것들입니다.</p></div>',
    '</section>',
    tags.size ? '<section class="rb-box"><h2>갈래</h2><div class="in">' +
      '<ul class="rb-flair">' + [...tags.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))
        .map(([t, n]) => `<li${t === activeTag ? ' class="on"' : ''}>` +
          `<a href="/blog/tag/${tagSlug(t)}.html">${esc(t)} ${n}</a></li>`).join('') +
      '</ul></div></section>' : '',
    '<section class="rb-box"><h2>이 블로그가 지키는 것</h2><ol class="rb-rules">' +
      rules.map((r) => `<li>${esc(r)}</li>`).join('') + '</ol></section>',
    '<section class="rb-box"><h2>둘러보기</h2><ul class="rb-links">' +
      '<li><a href="/course/">코스 21개 · 레슨 82개</a></li>' +
      '<li><a href="/sentence/">문법 표현 290개</a></li>' +
      '<li><a href="/compare/">헷갈리는 표현 견주기 73갈래</a></li>' +
      '<li><a href="/topik-reading/">TOPIK 읽기 연습</a></li>' +
      (posts.length ? '<li><a href="/blog/rss.xml">RSS 로 새 글 받기</a></li>' : '') +
      '</ul></section>',
    '</aside>',
  ].filter(Boolean).join('\n');
}

function blogHub(posts) {
  const feed = posts.length
    ? '<ul class="rb-feed">' + posts.map(postRow).join('') + '</ul>'
    : '<div class="rb-empty"><span class="emoji">🧀</span>아직 올린 글이 없습니다 — 곧 첫 글을 올릴게요.<br>No posts yet — the first one is coming soon.</div>';

  const body = [
    '<nav class="crumb"><a href="/">치즈감자</a> › 블로그</nav>',
    '<header class="rb-banner">',
      '<div class="rb-avatar" aria-hidden="true">🧀</div>',
      '<div class="rb-id"><h1>치즈감자 블로그</h1>' +
        '<p>한국어 공부, 문법, TOPIK 준비에 관한 글 · Notes on learning Korean, grammar, and TOPIK prep</p></div>',
      '<a class="rb-join" href="/#learn">한국어 배우러 가기</a>',
    '</header>',
    '<div class="rb-cols">',
      `<main>${feed}</main>`,
      blogSide(posts),
    '</div>',
    AGO_JS,
  ].join('\n');

  return page({
    url: '/blog/', kind: 'website',
    title: '블로그 | 치즈감자',
    desc: clip('한국어 공부, 문법, TOPIK 준비에 관한 치즈감자 블로그입니다.'),
    body,
    jsonld: [
      crumbLd([['치즈감자', '/'], ['블로그', '/blog/']]),
      ...(posts.length ? [{
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${SITE}/blog/`,
        name: '치즈감자 블로그',
        inLanguage: 'ko',
        publisher: { '@type': 'Organization', name: '치즈감자', url: SITE },
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          '@id': `${SITE}/blog/${p.id}.html`,
          headline: p.title,
          datePublished: p.date,
          dateModified: p.updated || p.date,
          description: p.excerpt,
        })),
      }] : []),
    ],
    extraCss: BLOG_CSS + BLOG_HUB_CSS,
    extraHead: `\n<link rel="alternate" type="application/rss+xml" title="치즈감자 블로그" href="${SITE}/blog/rss.xml">`,
  });
}

/* 갈래 쪽 — /blog/tag/<slug>.html. 목록(blogHub)과 같은 틀을 쓰되 본문
   목록만 그 갈래로 좁힌다. 오른쪽 기둥은 블로그 전체 정보를 그대로
   보여주고(blogSide 는 언제나 전체 글로 통계를 낸다), 지금 보는 갈래만
   .on 으로 강조한다 — 다른 갈래로 바로 옮겨 갈 수 있어야 한다. */
function blogTagPage(tag, posts, allPosts) {
  const slug = tagSlug(tag);
  const feed = '<ul class="rb-feed">' + posts.map(postRow).join('') + '</ul>';

  const body = [
    `<nav class="crumb"><a href="/">치즈감자</a> › <a href="/blog/">블로그</a> › ${esc(tag)}</nav>`,
    '<header class="rb-banner">',
      '<div class="rb-avatar" aria-hidden="true">🧀</div>',
      `<div class="rb-id"><h1>${esc(tag)} 글</h1>` +
        `<p>치즈감자 블로그에서 「${esc(tag)}」로 묶은 글 ${posts.length}편입니다.</p></div>`,
      '<a class="rb-join" href="/blog/">전체 글 보기</a>',
    '</header>',
    '<div class="rb-cols">',
      `<main>${feed}</main>`,
      blogSide(allPosts, tag),
    '</div>',
    AGO_JS,
  ].join('\n');

  return page({
    url: `/blog/tag/${slug}.html`, kind: 'website',
    title: `${tag} 글 | 치즈감자 블로그`,
    desc: clip(`치즈감자 블로그에서 「${tag}」로 묶은 글 ${posts.length}편입니다.`),
    body,
    jsonld: [
      crumbLd([['치즈감자', '/'], ['블로그', '/blog/'], [tag, null]]),
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${SITE}/blog/tag/${slug}.html`,
        name: `치즈감자 블로그 — ${tag}`,
        inLanguage: 'ko',
        publisher: { '@type': 'Organization', name: '치즈감자', url: SITE },
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          '@id': `${SITE}/blog/${p.id}.html`,
          headline: p.title,
          datePublished: p.date,
          dateModified: p.updated || p.date,
          description: p.excerpt,
        })),
      },
    ],
    extraCss: BLOG_CSS + BLOG_HUB_CSS,
    extraHead: `\n<link rel="alternate" type="application/rss+xml" title="치즈감자 블로그" href="${SITE}/blog/rss.xml">`,
  });
}

/* RSS. 정적 사이트라 글이 올라온 것을 알릴 방법이 달리 없다 — 메일 주소를
   받아 두는 것도 아니니, 구독하고 싶은 사람에게 줄 수 있는 것은 이것뿐이다.
   본문을 통째로 싣는다(content:encoded). 요약만 실으면 읽는 이가 결국
   사이트로 와야 하는데, 그러라고 만든 것이 아니다. */
const rssDate = (iso) => {
  /* 09:00 +09:00 으로 잡는다. RSS 는 시각까지 요구하는데 글에는 날짜만
     적어 두므로, 한국 아침으로 고정해 두는 편이 시차로 하루가 밀리는
     것보다 낫다. */
  const d = new Date(`${iso}T09:00:00+09:00`);
  return Number.isNaN(d.getTime()) ? '' : d.toUTCString();
};
const cdata = (s) => `<![CDATA[${String(s ?? '').replaceAll(']]>', ']]&gt;')}]]>`;

function blogRss(posts) {
  const items = posts.map((p) => [
    '  <item>',
    `    <title>${esc(p.title)}</title>`,
    `    <link>${SITE}/blog/${p.id}.html</link>`,
    `    <guid isPermaLink="true">${SITE}/blog/${p.id}.html</guid>`,
    `    <pubDate>${rssDate(p.date)}</pubDate>`,
    ...(p.tags || []).map((t) => `    <category>${esc(t)}</category>`),
    `    <description>${cdata(p.excerpt)}</description>`,
    `    <content:encoded>${cdata(postHtml(p))}</content:encoded>`,
    '  </item>',
  ].join('\n')).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- 생성물 — tools/build-pages.mjs 가 blog.js 에서 굽는다. 손으로 고치지 말 것. -->
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>치즈감자 블로그</title>
  <link>${SITE}/blog/</link>
  <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml"/>
  <description>한국어 공부, 문법, TOPIK 준비에 관한 치즈감자 블로그입니다.</description>
  <language>ko</language>
${posts.length ? `  <lastBuildDate>${rssDate(posts[0].updated || posts[0].date)}</lastBuildDate>\n` : ''}${items}
</channel>
</rss>
`;
}

/* ── sitemap ────────────────────────────────────────────────── */
/* 쪽이 마지막으로 **정말** 바뀐 날.

   구글은 changefreq 와 priority 를 안 읽는다(공식 문서에 그렇게 적혀
   있다). 반대로 lastmod 는 읽는다 — 다시 기어올 자리를 고르는 데 쓴다.
   993줄에 안 읽는 것 둘만 있고 읽는 것은 비어 있었다.

   다만 **정확할 때만 읽는다.** 처음에는 원본 파일의 git 커밋 날을 쓰려
   했는데 그게 안 됐다. tools/stamp.mjs 가 sentences.js 안의 `?v=` 를
   다시 찍으면 그 파일의 커밋 날이 오늘로 뛴다 — 표현 290쪽의 내용은 한
   글자도 안 바뀌었는데 사이트맵은 「오늘 290쪽이 바뀌었다」고 말하게 된다.
   그런 사이트맵은 구글이 lastmod 를 통째로 안 믿는 쪽으로 간다.

   그래서 **구운 쪽 자체의 바이트를 해시해서** 지난번과 다를 때만 날짜를
   올린다. 자국(`?v=`)은 이 쪽들에 안 들어가므로(정적 쪽은 CSS 를 박아
   넣는다) 자국을 다시 찍어도 해시가 안 흔들린다. 재는 것과 말하는 것이
   같아진다.

   docs/page-mod.json 이 그 기록이다. 지우면 전부 오늘로 다시 잡힌다 —
   틀린 날짜가 되는 것은 아니고, 그저 그 전을 모르게 될 뿐이다. */
const MOD_FILE = join(ROOT, 'docs/page-mod.json');
const TODAY = new Date().toISOString().slice(0, 10);
let modWas = {};
try { modWas = JSON.parse(readEn(MOD_FILE, 'utf8')); } catch { /* 처음이면 빈 채로 */ }

/* 주소를 구워 놓은 파일 자리로 되돌린다. sitemap() 이 맨 끝에 도는 덕에
   이때는 993쪽이 이미 다 쓰여 있다. */
function fileOf(loc) {
  let q = loc.replace(/^\//, '');
  if (!q) q = 'index.html';
  if (q.endsWith('/')) q += 'index.html';
  return join(ROOT, q);
}

function modOf(loc) {
  let h;
  try { h = createHash('sha1').update(readEn(fileOf(loc))).digest('hex').slice(0, 12); }
  catch { return ''; }            // 파일이 없으면 그 줄에는 안 적는다
  const was = modWas[loc];
  const day = (was && was.h === h) ? was.d : TODAY;
  modNow[loc] = { h, d: day };
  return day;
}
const modNow = {};

function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- 생성물이다. node tools/build-pages.mjs 가 다시 쓴다.

     화면 전환은 해시(#learn 등)로 하므로 크롤러에게 index.html 은 한 쪽이다.
     그래서 표현마다 진짜 주소를 가진 정적 쪽을 뽑아 여기 건다. 없는 주소를
     적어 두면 404 만 늘어나므로, 여기 있는 것은 전부 저장소에 실재한다.

     lastmod 는 그 쪽을 구운 결과가 지난번과 달라진 날이다(docs/page-mod.json).
     원본 파일의 커밋 날이 아니다 — 자국을 다시 찍기만 해도 커밋 날이
     뛰는데, 그러면 안 바뀐 쪽까지 「오늘 바뀌었다」가 된다. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc, freq, pri }) => {
  const mod = modOf(loc);
  return `  <url>\n    <loc>${SITE}${loc}</loc>\n` +
    (mod ? `    <lastmod>${mod}</lastmod>\n` : '') +
    `    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`;
}).join('\n')}
</urlset>
`;
}

/* ── 돌린다 ─────────────────────────────────────────────────── */
/* 통째로 지우고 다시 쓴다. 표현을 지웠을 때 예전 쪽이 남아 검색에 걸리면
   앱에 없는 것을 보여 주게 된다. */
for (const d of [OUT, OUT_COURSE, OUT_LESSON, OUT_TW, OUT_TR, OUT_TL, OUT_DICT, OUT_CMP, OUT_BLOG]) {
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

/* ── TOPIK 읽기 ─────────────────────────────────────────────── */
let nR = 0;
for (const it of [...TOPIK_READING, ...TOPIK2_READING]) {
  writeFileSync(join(OUT_TR, `${it.id}.html`), trPage(it));
  urls.push({ loc: `/topik-reading/${it.id}.html`, freq: 'monthly', pri: '0.7' });
  nR++;
}
writeFileSync(join(OUT_TR, 'index.html'), trHub());
urls.push({ loc: '/topik-reading/', freq: 'weekly', pri: '0.9' });

/* ── TOPIK 듣기 ─────────────────────────────────────────────── */
let nTL = 0;
for (const it of [...TOPIKL_BY_EXAM.I.items, ...TOPIKL_BY_EXAM.II.items]) {
  writeFileSync(join(OUT_TL, `${it.id}.html`), tlPage(it));
  urls.push({ loc: `/topik-listening/${it.id}.html`, freq: 'monthly', pri: '0.7' });
  nTL++;
}
writeFileSync(join(OUT_TL, 'index.html'), tlHub());
urls.push({ loc: '/topik-listening/', freq: 'weekly', pri: '0.9' });

/* ── 사전 ───────────────────────────────────────────────────── */
let nDict = 0;
DICT_HEADS.forEach((entry, i) => {
  /* 파일 이름은 표제어를 그대로 쓴다(assets/audio/dict/*.mp3 와 같은
     관행) — 한글 파일 이름은 이 저장소에서 이미 잘 돌아간다. 주소(URL)
     쪽만 encodeURIComponent 를 쓴다: 사이트맵 <loc> 은 스펙상 아스키가
     아닌 글자를 퍼센트 인코딩해야 하고, 웹서버는 요청받은 인코딩된
     주소를 풀어 이 파일을 그대로 찾아낸다. */
  writeFileSync(join(OUT_DICT, `${entry.head}.html`),
    wordPage(entry, DICT_HEADS[i - 1], DICT_HEADS[i + 1]));
  urls.push({ loc: `/dictionary/${encodeURIComponent(entry.head)}.html`, freq: 'yearly', pri: '0.5' });
  nDict++;
});
writeFileSync(join(OUT_DICT, 'index.html'), wordHub(DICT_HEADS));
urls.push({ loc: '/dictionary/', freq: 'monthly', pri: '0.8' });

/* ── 블로그 ─────────────────────────────────────────────────── */
/* 글이 하나도 없어도(BLOG_POSTS = []) 목록 쪽은 늘 굽는다 — 안 그러면
   나중에 글을 딱 하나 추가했을 때 목록이 아예 없어서 처음 한 번은
   손으로 더 손대야 한다. */
let nB = 0;
BLOG_POSTS.forEach((post, i) => {
  /* 배열은 최신이 앞이다. 그래서 「이전 글」(더 오래된 것)이 i + 1,
     「다음 글」(더 새것)이 i - 1 이다. 뒤집어 걸면 화살표가 시간을
     거꾸로 가리키는데, 눌러 보기 전에는 아무도 모른다. */
  const next = BLOG_POSTS[i - 1];
  const prev = BLOG_POSTS[i + 1];
  const skip = new Set([prev, next].filter(Boolean).map((p) => p.id));
  const html = blogPage(post, prev, next, relatedPosts(post, BLOG_POSTS, skip));
  writeFileSync(join(OUT_BLOG, `${post.id}.html`), html);
  urls.push({ loc: `/blog/${post.id}.html`, freq: 'yearly', pri: '0.5' });
  nB++;
});
writeFileSync(join(OUT_BLOG, 'index.html'), blogHub(BLOG_POSTS));
urls.push({ loc: '/blog/', freq: 'weekly', pri: '0.6' });

/* 갈래 쪽. BLOG_POSTS 순서(최신이 앞)를 그대로 따라가며 갈래별로 묶으므로
   갈래 쪽 목록도 최신순으로 나온다. */
const TAG_POSTS = new Map();
for (const p of BLOG_POSTS) for (const t of (p.tags || [])) {
  if (!TAG_POSTS.has(t)) TAG_POSTS.set(t, []);
  TAG_POSTS.get(t).push(p);
}
let nBT = 0;
if (TAG_POSTS.size) mkdirSync(join(OUT_BLOG, 'tag'), { recursive: true });
for (const [tag, posts] of TAG_POSTS) {
  const slug = tagSlug(tag);
  writeFileSync(join(OUT_BLOG, 'tag', `${slug}.html`), blogTagPage(tag, posts, BLOG_POSTS));
  urls.push({ loc: `/blog/tag/${slug}.html`, freq: 'weekly', pri: '0.5' });
  nBT++;
}

/* RSS 는 sitemap 에 안 넣는다. 사람이 읽는 쪽이 아니라 구독기가 읽는
   파일이라 검색 결과에 뜰 일이 없고, 넣으면 중복된 내용으로 잡힌다. */
writeFileSync(join(OUT_BLOG, 'rss.xml'), blogRss(BLOG_POSTS));

urls.push({ loc: '/privacy.html', freq: 'yearly', pri: '0.3' });
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap(urls));
/* sitemap() 이 돌면서 쪽마다 해시를 다시 쟀다. 그 기록을 남긴다 —
   다음 번에 이것과 견줘 안 바뀐 쪽은 날짜를 그대로 둔다. */
writeFileSync(MOD_FILE, JSON.stringify(modNow, null, 0) + '\n');

console.log(`표현 ${n}쪽 + 목록 1쪽 → sentence/`);
console.log(`갈래 비교 ${nCmp}쪽 + 목록 1쪽 → compare/`);
console.log(`코스 ${nC}쪽 + 목록 1쪽 → course/`);
console.log(`레슨 ${nL}쪽 → lesson/`);
console.log(`TOPIK 쓰기 ${nW}쪽 + 목록 1쪽 → topik-writing/`);
console.log(`TOPIK 읽기 ${nR}쪽 + 목록 1쪽 → topik-reading/`);
console.log(`TOPIK 듣기 ${nTL}쪽 + 목록 1쪽 → topik-listening/`);
console.log(`사전 ${nDict}쪽 + 목록 1쪽 → dictionary/`);
console.log(`블로그 ${nB}쪽 + 목록 1쪽 + 갈래 ${nBT}쪽 + rss.xml → blog/`);
console.log(`sitemap.xml 에 주소 ${urls.length}개.`);
