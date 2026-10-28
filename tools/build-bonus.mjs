#!/usr/bin/env node
/* 책 QR 보너스 연습 쪽 — docs/bonus/<책 id>.json → /bonus/<책 id>/<단원>/index.html (+ /bonus/<책 id>/index.html 목록).
   책의 QR 이 여는 쪽(tools/build-book.mjs 의 unitUrl). 낱말 카드(뒤집기 · 🔊) · 보기 퀴즈 · 빈칸 쓰기를 쪽에서 바로 채우고 채점한다(bonus.js).
   원본은 JSON — 생성물은 손으로 고치지 않는다. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { bonusFiles, loadBonus, validateBonus, bonusUnitIds, unitTitle } from './bonus-data.mjs';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const JS = `/bonus.js?v=${crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, 'bonus.js'))).digest('hex').slice(0, 8)}`;
const NUM = ['①', '②', '③', '④'];
const PLAY = 'https://play.google.com/store/apps/details?id=com.cheesepotato.app';
/* 안드로이드 크롬은 intent: 주소로 앱을 열고, 앱이 없으면 Google Play 로 보낸다. 다른 기기에서는 아무 일도 없다(아래 Google Play 링크). */
const APP_INTENT = (book, unit) => `intent://book/${book}/${unit}#Intent;scheme=cheesepotato;package=com.cheesepotato.app;S.browser_fallback_url=${encodeURIComponent(PLAY)};end`;
const CSS = `
main{max-width:760px;margin:0 auto;padding:22px 20px 80px}
.bk-badge{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.06em;color:#C4551C;background:#FDF0E2;border-radius:99px;padding:4px 12px}
.bk-h{font-size:19px;font-weight:800;margin:30px 0 4px}.bk-h small{font-weight:500;color:var(--ink-3);font-size:13px;margin-left:6px}
.bk-sub{color:var(--ink-3);font-size:14px;margin:0 0 12px}
.bcards{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.bgame{border:1px solid var(--line);border-radius:10px;padding:14px;background:#fff}.gtop{display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-weight:800;margin-bottom:10px}.gtop .gtime{font-size:20px;font-variant-numeric:tabular-nums}.gtop .gmiss{color:#C4551C}.gtop button{margin-left:auto;font:inherit;font-weight:800;padding:8px 16px;border-radius:8px;border:0;background:#E8642C;color:#fff;cursor:pointer}.gboard{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px}.gboard button{font:inherit;font-size:16px;font-weight:700;padding:12px 8px;border-radius:8px;border:1.5px solid var(--line);background:#fff;cursor:pointer;min-height:48px}.gboard button.sel{border-color:#E8642C;background:#FFF3EA}.gboard button.done{visibility:hidden}.gboard button.shake{animation:gshake .25s}@keyframes gshake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}.gres{font-weight:800;margin-top:10px}.gnote{font-size:13px;color:var(--ink-3);margin:2px 0 8px}
.bcard{font:inherit;text-align:center;cursor:pointer;min-height:84px;padding:14px 12px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);display:flex;align-items:center;justify-content:center}
.bcard .b{display:none;font-size:14px;color:var(--ink-2);line-height:1.45}.bcard .f{font-size:18px;font-weight:800}
.bcard.flip{background:#FFF7E3;border-color:#F0C24B}.bcard.flip .f{display:none}.bcard.flip .b{display:block}
.bq,.bf{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px 16px;margin:10px 0}
.bqq{font-weight:700;margin:0 0 8px;line-height:1.5}.bqq i{font-style:normal;color:var(--ink-3);font-weight:500;margin-right:6px}
.bo{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.bo li{min-height:44px;display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--line);border-radius:7px;cursor:pointer;background:#FBF8F1}
.bo li:hover{border-color:#F0C24B}.bo li.right{background:#E6F4EA;border-color:#3A9A5B}.bo li.wrong{background:#FCE8E6;border-color:#D1493E}
.bw{margin:8px 0 0;font-size:14px;color:var(--ink-2);line-height:1.55}
.bf .fq{font-size:18px;font-weight:700;line-height:1.7;margin:0}.bf .fe{color:var(--ink-3);font-size:13.5px;margin:2px 0 8px}
.bf input{font:inherit;font-size:17px;width:9em;max-width:100%;padding:6px 10px;border:0;border-bottom:2px solid #C4551C;background:#FFF7E3;border-radius:6px 6px 0 0;text-align:center}
.bf button{font:inherit;min-height:44px;margin-left:8px;padding:0 18px;border:0;border-radius:7px;background:#C4551C;color:#fff;font-weight:700;cursor:pointer}
.bf .bm{margin:8px 0 0;font-weight:700}.bf.ok .bm{color:#2E7D4A}.bf.no .bm{color:#B3322D}
.bsc{position:sticky;bottom:0;margin-top:26px;padding:12px 16px;background:#fff;border:1px solid var(--line);border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-weight:800}
.bsc.fin{background:#FFF7E3;border-color:#F0C24B}.bfin,.bbest{margin:10px 0 0;font-size:14px;color:var(--ink-2)}
.bapp{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:14px 0 0;padding:12px 14px;background:#FFF7E3;border:1px solid #F0C24B;border-radius:14px}.bapp div{flex:1 1 220px}.bapp b{display:block;font-size:14.5px}.bapp small{color:var(--ink-3);font-size:12.5px}
.bk-back{font-size:13px;margin-left:8px}
.hub-top{margin:14px 0 4px;padding:18px;border-radius:10px;color:#fff}.hub-top h1{color:#fff;margin:4px 0 2px}.hub-top small{opacity:.85}
.hprog{height:12px;border-radius:8px;background:rgba(255,255,255,.22);overflow:hidden;margin:14px 0 6px}.hprog i{display:block;height:100%;width:0;background:#F6C443;border-radius:8px;transition:width .5s}
.hrow{display:flex;justify-content:space-between;gap:10px;font-size:14px;font-weight:700;flex-wrap:wrap}
.hnext{display:block;margin-top:14px;text-align:center}
.htools{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:14px 0}
.htool{display:block;background:#fff;border:1px solid var(--line);border-radius:8px;padding:12px 14px;color:var(--ink);text-decoration:none}.htool b{display:block}.htool span{font-size:13px;color:var(--ink-3)}
.hpart{font-size:14px;font-weight:800;color:var(--ink-3);margin:22px 0 6px}
.hunits{list-style:none;margin:0;padding:0;background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.hunits li{display:flex;align-items:center;gap:10px;padding:12px 14px;min-height:52px;border-top:1px solid var(--line2,#eee)}.hunits li:first-child{border-top:0}
.hunits li a{flex:1;color:var(--ink);text-decoration:none;font-weight:700}.hunits li.off{opacity:.45}.hunits li.off a{pointer-events:none}
.hunits .hs{font-size:12.5px;color:var(--ink-3);white-space:nowrap}.hunits li.ok .hs{color:#2E7D4A;font-weight:800}
.bempty{padding:18px;background:#fff;border:1px solid var(--line);border-radius:14px}
.bagain{font:inherit;min-height:44px;margin-top:10px;padding:0 18px;border:0;border-radius:7px;background:#C4551C;color:#fff;font-weight:700;cursor:pointer}
.bcta{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0 0}
@media(max-width:480px){.bcards{grid-template-columns:1fr}.bf button{margin:8px 0 0}}
`;
const head = (title, desc, url) => `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="https://everykoreans.com${url}">
<!-- 생성물 — 손으로 고치지 말 것. docs/bonus/*.json 을 고치고 node tools/build-bonus.mjs -->
<script src="/gtm.js" async></script>
<script src="/analytics.js" defer></script>
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="https://everykoreans.com${url}">
<meta property="og:image" content="https://everykoreans.com/og-image.jpg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="stylesheet" href="/vendor/pretendard.css">
<link rel="stylesheet" href="/page.css">
<script src="${JS}" defer></script>
<style>${CSS}</style>
</head>
<body>
<header class="hd"><div class="hd-in">
  <a href="/"><img src="/logo.png" alt=""><span>치즈감자 CheesePotato</span></a>
</div></header>
<main>
`;
const foot = `<p class="bk-sub" style="margin-top:30px">이 연습은 책에 없는 새로 만든 문항이에요(기출 아님). · New practice made for this site, not from any past exam.</p>
</main>
</body>
</html>
`;
const gamePairs = (c) => c.cards.map((x) => [x.ko, String(x.en).replace(/\s*\([^)]*\)\s*$/, '').split(';')[0].trim()]);
fs.rmSync(path.join(ROOT, 'bonus'), { recursive: true, force: true });
let n = 0;
for (const f of bonusFiles()) {
  const errs = validateBonus(f);
  if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
  const d = loadBonus(f), id = d.book, book = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/books', `${id}.json`), 'utf8'));
  const list = [], bonusSet = new Set(bonusUnitIds(book));
  for (const [u, c] of Object.entries(d.units)) {
    const tk = unitTitle(book, u);
    const total = c.quiz.length + c.fill.length;
    const url = `/bonus/${id}/${u}/`;
    const cards = c.cards.map((x) => `<button type="button" class="bcard" data-say="${esc(x.ko)}"><span class="f">${esc(x.ko)}</span><span class="b">${esc(x.en)}</span></button>`).join('');
    const quiz = c.quiz.map((x, i) => `<div class="bq" data-ans="${x.a}" data-id="${esc(u)}:q${i}"><p class="bqq"><i>Q${i + 1}</i>${esc(x.q)}</p><ul class="bo">${x.opts.map((o, k) => `<li tabindex="0" role="button">${NUM[k]} ${esc(o)}</li>`).join('')}</ul><p class="bw" hidden>${esc(x.why)}</p></div>`).join('');
    const fill = c.fill.map((x, i) => `<div class="bf" data-a="${esc(JSON.stringify(x.a))}" data-id="${esc(u)}:f${i}"><p class="fq">${esc(x.q).replace(/___/g, '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="빈칸 ' + (i + 1) + '">')}<button type="button">확인 · Check</button></p><p class="fe">${esc(x.en)}</p><p class="bm" hidden></p></div>`).join('');
    const title = `${tk.en} 보너스 연습 · Bonus practice — ${book.title.en}`;
    const page = head(title, `${book.title.ko} 단원 보너스 연습: 낱말 카드, 퀴즈, 빈칸 쓰기. 쪽에서 바로 채우고 채점해요.`, url) + `<div data-bonus-mode="unit" data-book="${esc(id)}" data-unit-key="${esc(id + '/' + u)}">
<span class="bk-badge">책 보너스 · BOOK BONUS</span> <a class="bk-back" href="/bonus/${id}/">← 책 코스 전체 · Course</a>
<h1>${esc(tk.ko || tk.en)}</h1>
<div class="bapp"><div><b>앱에서 열면 진행률 · 연속 학습이 기록돼요</b><small>Open in the app to track progress and your streak</small></div><a class="btn main" href="${APP_INTENT(id, u)}">앱에서 열기 · Open app</a><a class="btn sub" href="${PLAY}">Google Play</a></div>
<p class="bk-sub">${esc(tk.en)} · ${esc(book.title.ko)} · ${esc(book.title.en)}</p>
<h2 class="bk-h">낱말 카드 <small>Flashcards · 눌러서 뒤집기 · tap to flip</small></h2>
<div class="bcards">${cards}</div>
${d.game ? `<h2 class="bk-h">🎮 짝 맞추기 게임 <small>Match game</small></h2><div class="bgame" data-pairs="${esc(JSON.stringify(gamePairs(c)))}" data-key="${esc(id + '/' + u)}"><p class="gnote">왼쪽 낱말을 누르고, 오른쪽에서 뜻을 눌러 짝을 맞춰요. 5개씩 4판. · Tap a word, then its meaning. 5 pairs per round.</p><div class="gtop"><span class="gtime">0.0s</span><span class="gmiss">틀림 0 · misses</span><span class="gbest"></span><button type="button" class="gstart">시작 · Start</button></div><div class="gboard"></div><p class="gres" hidden></p></div>` : ''}<h2 class="bk-h">퀴즈 <small>Quiz</small></h2>${quiz}
<h2 class="bk-h">빈칸 쓰기 <small>Fill in the blank</small></h2><p class="bk-sub">한글로 쓰고 [확인]을 누르세요. · Type in Hangul, then press Check.</p>${fill}
<div class="bsc"><span>점수 · Score</span><span class="bscore">0 / ${total}</span></div>
<p class="bfin" hidden>끝! 틀린 곳은 책 정답 쪽과 같이 다시 보세요. · Done! Review your misses with the book's answer key.</p><p class="bbest" hidden></p>
<div class="bcta"><a class="btn main" href="/#learn">앱에서 더 연습하기<span> · Practice more free</span></a>${fs.existsSync(path.join(ROOT, `docs/worksheets/${u}.json`)) ? `<a class="btn sub" href="/${u}-worksheet/">인쇄용 학습지 · Printable sheet</a>` : ''}</div>
</div>
` + foot;
    fs.mkdirSync(path.join(ROOT, 'bonus', id, u), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'bonus', id, u, 'index.html'), page);
    list.push({ u, ko: tk.ko || tk.en, en: tk.en }); n++;
  }
  /* 앱(cheesepotatoapp 의 책 코스 화면)이 받아 가는 자료 — 같은 JSON 을 쪽과 앱이 쓴다. */
  const lvl = book.coverLevel || {};
  const appData = { schema: 1, book: id, title: book.title, level: { code: lvl.code || '', name: lvl.name || '' }, color: { bg: lvl.bg || '#1F3A68', bg2: lvl.bg2 || '#14264A' }, mascot: lvl.mascot || null,
    parts: book.parts.map((pt) => ({ title: pt.title, units: pt.units.filter((x) => bonusSet.has(x)).map((x) => { const t = unitTitle(book, x); return { id: x, title: { ko: t.ko || t.en, en: t.en }, ready: !!d.units[x] }; }) })).filter((pt) => pt.units.length),
    units: d.units };
  fs.writeFileSync(path.join(ROOT, 'bonus', id, 'data.json'), JSON.stringify(appData));
  /* 독자 전용 코스(허브) · 틀린 문제 노트 · 부 챌린지 — 같은 자료로 웹에서도 앱과 같은 흐름을 쓴다. */
  const bankItems = [];
  book.parts.forEach((pt, pi) => pt.units.forEach((x) => { const c = d.units[x]; if (!c) return;
    c.quiz.forEach((q, k) => bankItems.push({ id: `${x}:q${k}`, t: 'q', u: x, p: pi + 1, q: q.q, opts: q.opts, a: q.a, why: q.why }));
    c.fill.forEach((q, k) => bankItems.push({ id: `${x}:f${k}`, t: 'f', u: x, p: pi + 1, q: q.q, en: q.en, a: q.a })); }));
  const bankTag = `<script type="application/json" id="bk-bank">${JSON.stringify(bankItems).replace(/</g, '\\u003c')}</script>`;
  const lv = book.coverLevel || { bg: '#1F3A68', bg2: '#14264A' };
  const appBtn = `<a class="btn sub" href="intent://book/${id}#Intent;scheme=cheesepotato;package=com.cheesepotato.app;S.browser_fallback_url=${encodeURIComponent(PLAY)};end">앱에서 열기 · Open app</a>`;
  const unitsLi = (pt) => pt.units.filter((x) => bonusSet.has(x)).map((x) => { const t = unitTitle(book, x); const c = d.units[x]; const n = c ? c.quiz.length + c.fill.length : 0;
    return `<li data-u="${esc(x)}" data-total="${n}" class="${c ? '' : 'off'}"><a href="/bonus/${id}/${x}/">${esc(t.ko || t.en)} <small style="font-weight:500;color:var(--ink-3)">${esc(t.en)}</small></a><span class="hs">${c ? '' : '준비 중 · soon'}</span></li>`; }).join('');
  const chalParts = book.parts.map((pt, pi) => ({ pt, p: pi + 1, n: bankItems.filter((q) => q.p === pi + 1).length })).filter((x) => x.n >= 5);
  const idx = head(`${book.title.en} 독자 전용 코스 · Reader course`, `${book.title.ko} 독자 전용 코스: 단원별 연습, 진행률, 연속 학습, 틀린 문제 노트, 부 챌린지.`, `/bonus/${id}/`) + `<div data-bonus-mode="hub" data-book="${esc(id)}">
<div class="hub-top" style="background:${lv.bg}"><small>독자 전용 코스 · READER COURSE ${esc(lv.code || '')}</small><h1>${esc(book.title.ko)}</h1><small>${esc(book.title.en)}</small>
<div class="hprog"><i></i></div><div class="hrow"><span class="hpct">0 / 0</span><span class="hstreak"></span></div>
<a class="btn main hnext" href="#" hidden>시작하기 · Start</a></div>
<div class="bcta" style="margin-top:10px">${appBtn}</div>
<div class="htools"><a class="htool" href="/bonus/${id}/notebook/"><b>틀린 문제 노트 · Mistake notebook</b><span class="hmiss"></span></a>${chalParts.map((x) => `<a class="htool" href="/bonus/${id}/part-${x.p}/" data-chal="${x.p}"><b>${x.p}부 챌린지 · Part ${x.p} challenge</b><span>${esc(x.pt.title.ko)} · 섞어서 10문제 <i class="hcb" style="font-style:normal"></i></span></a>`).join('')}</div>
${book.parts.map((pt) => { const li = unitsLi(pt); return li ? `<h2 class="hpart">${esc(pt.title.ko)} <small>${esc(pt.title.en)}</small></h2><ul class="hunits">${li}</ul>` : ''; }).join('')}
${book.bonus ? `<h2 class="hpart">구매자 혜택 · Reader bonus</h2><div class="bq"><p class="bqq">책 맨 끝 「구매자 혜택」 쪽의 코드로 Pro ${book.bonus.days}일이 열려요. 한 계정에 한 번이에요.</p><a class="btn main" href="/?bk=${esc(book.bonus.code)}&utm_source=book&utm_medium=hub&utm_campaign=${esc(id)}">Pro ${book.bonus.days}일 받기 · Get Pro</a></div>` : ''}
</div>
` + foot;
  const sub = (name, title, body, extra = '') => {
    const pg = head(title, `${book.title.ko} ${name}`, `/bonus/${id}/${name}/`) + body + foot;
    fs.mkdirSync(path.join(ROOT, 'bonus', id, name), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'bonus', id, name, 'index.html'), pg);
  };
  sub('notebook', `틀린 문제 노트 · Mistake notebook — ${book.title.en}`, `<div data-bonus-mode="notebook" data-book="${esc(id)}"><span class="bk-badge">책 보너스 · BOOK BONUS</span> <a class="bk-back" href="/bonus/${id}/">← 책 코스 전체 · Course</a>
<h1>틀린 문제 노트 <small style="font-size:16px;color:var(--ink-3)">Mistake notebook</small></h1><p class="bk-sub">이 기기에서 틀린 문제만 모았어요. 맞히면 노트에서 빠져요. · Only the questions you missed on this device. Get one right and it leaves the list.</p>
<div class="bempty" hidden>틀린 문제가 없어요. 잘하고 있어요! · Nothing to redo. Nice work!</div><div class="bqs"></div>
<div class="bsc"><span>점수 · Score</span><span class="bscore">0 / 0</span></div><p class="bfin" hidden>끝! 맞힌 문제는 노트에서 빠졌어요. · Done! The ones you got right left the list.</p></div>${bankTag}`);
  for (const x of chalParts) sub(`part-${x.p}`, `${x.p}부 챌린지 · Part ${x.p} challenge — ${book.title.en}`, `<div data-bonus-mode="challenge" data-book="${esc(id)}" data-part="${x.p}"><span class="bk-badge">책 보너스 · BOOK BONUS</span> <a class="bk-back" href="/bonus/${id}/">← 책 코스 전체 · Course</a>
<h1>${x.p}부 챌린지 <small style="font-size:16px;color:var(--ink-3)">Part ${x.p} challenge</small></h1><p class="bk-sub">${esc(x.pt.title.ko)} · 이 부의 문제를 섞어 10개 · ${esc(x.pt.title.en)}, 10 mixed questions</p>
<div class="bqs"></div><div class="bsc"><span>점수 · Score</span><span class="bscore">0 / 0</span></div><p class="bfin" hidden>끝! 틀린 문제는 틀린 문제 노트에 모였어요. · Done! Your misses are in the notebook.</p><p class="bbest" hidden></p><button type="button" class="bagain">다시 섞어서 풀기 · Shuffle again</button></div>${bankTag}`);
  fs.writeFileSync(path.join(ROOT, 'bonus', id, 'index.html'), idx);
}
console.log(`보너스 쪽 ${n}개 → bonus/`);
