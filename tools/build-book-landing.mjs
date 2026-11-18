#!/usr/bin/env node
/* 책마다 따로 만드는 체험 랜딩 쪽 — /book/<책 id>/index.html (운영자 2026-11-18 「책마다 따로 랜딩페이지 · 전문적인 수준 · 학습에 효과적인 툴만 골라 인터랙티브하게 · 일주일에 한 권씩」).
   원본: docs/book-landing.json(책마다 다른 글 · 어느 자료를 쓸지) + docs/shop.json(제목 · 표지 · 가격 · 결제 링크 · page.detail 그림) + docs/bonus/<책 id>.json(이미 검토한 QR 보너스 자료 — 체험 문제).
   쪽 구성: 첫 화면(입체 책 · 한 줄) → 숫자 넷 → 책 속 넘겨 보기(스크롤하면 쪽이 바뀜) → 연습실(빈칸 쓰기 · 고르기 · 표현 카드) → 책에서 온라인까지 → 사기.
   움직임 · 채점은 /book-landing.js(쪽 안 JSON 을 읽는다). 스크립트 없이도 글 · 그림은 다 읽힌다. 생성물은 손으로 고치지 않는다.
   node tools/build-book-landing.mjs            모든 책(book-landing.json 에 있는 것)
   node tools/build-book-landing.mjs --check    생성물이 원본과 같은지만 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const CFG = read('docs/book-landing.json').books;
const SHOP = read('docs/shop.json');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const bi = (o, tag = 'span') => `<${tag} class="en">${esc(o.en)}</${tag}><${tag} class="ko">${esc(o.ko)}</${tag}>`;

function page(id, c) {
  const k = SHOP.books.find((b) => b.id === id); if (!k) throw new Error(`shop.json 에 ${id} 없음`);
  const frame = read(`docs/books/${id}.json`);
  const INK = frame.coverLevel?.bg || k.color || '#1F1B16', INK2 = frame.coverLevel?.bg2 || INK;
  const det = Object.fromEntries((k.page?.detail || []).flatMap((d) => (d.images || []).map(([n, cap]) => [n, cap])));
  const bonus = read(`docs/bonus/${id}.json`).units[c.try.unit];
  if (!bonus) throw new Error(`docs/bonus/${id}.json 에 단원 ${c.try.unit} 없음`);
  const data = { book: id, fill: bonus.fill.slice(0, c.try.fill), quiz: bonus.quiz.slice(0, c.try.quiz), cards: bonus.cards.slice(0, c.try.cards) };
  const on = k.status === 'on' && k.polar;
  const buy = (from, label) => on ? `<a class="bl-btn main" href="${esc(k.polar)}" rel="nofollow noopener" data-sale data-ev="책구매클릭" data-ev-from="${esc(id)}-landing-${from}">${label} · <span data-px="${esc(k.price)}">$${esc(k.price)}</span></a>` : '';
  const sample = k.sample ? `<a class="bl-btn" href="/assets/books/${esc(id)}/sample.pdf" download data-ev="샘플받기" data-ev-from="${esc(id)}-landing">Free sample · ${k.sample.pages} pages <small>무료 샘플</small></a>` : '';
  const story = c.story.filter(([n]) => det[n] !== undefined || fs.existsSync(path.join(ROOT, `assets/books/${id}/detail/${n}.jpg`)));
  const url = `/book/${id}/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(k.title.en)} — try it | CheesePotato</title>
<meta name="description" content="${esc(c.lead.en)}">
<link rel="canonical" href="https://everykoreans.com${url}">
<!-- 생성물 — 손으로 고치지 말 것. docs/book-landing.json · docs/shop.json · docs/bonus/${esc(id)}.json 을 고치고 node tools/build-book-landing.mjs -->
<script src="/gtm.js" async></script>
<script src="/analytics.js" defer></script>
<meta property="og:title" content="${esc(k.title.en)}">
<meta property="og:description" content="${esc(c.lead.en)}">
<meta property="og:url" content="https://everykoreans.com${url}">
<meta property="og:image" content="https://everykoreans.com${esc(k.coverImg)}">
<link rel="stylesheet" href="/vendor/pretendard.css">
<style>
:root{--paper:#F7F3EA;--card:#FFFDF8;--ink:#1F1B16;--ink2:#4A4237;--ink3:#7A705F;--line:#DDD5C4;--acc:${INK};--acc2:${INK2};--ok:#1F7A4D;--no:#B3261E}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#1B1916;--card:#24211D;--ink:#F1ECE2;--ink2:#CFC6B6;--ink3:#A39885;--line:#3B362F}}
:root[data-theme="dark"]{--paper:#1B1916;--card:#24211D;--ink:#F1ECE2;--ink2:#CFC6B6;--ink3:#A39885;--line:#3B362F}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.65 'Pretendard Variable',Pretendard,system-ui,sans-serif;word-break:keep-all}
a{color:inherit}.in{max-width:1080px;margin:0 auto;padding:0 20px}
.ko{display:block;color:var(--ink2);font-size:.92em}.en{display:block}
.bl-hd{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--paper) 92%,transparent);backdrop-filter:blur(6px);border-bottom:1px solid var(--line)}
.bl-hd .in{display:flex;align-items:center;justify-content:space-between;height:56px}.bl-hd a{display:flex;gap:8px;align-items:center;text-decoration:none;font-weight:700}
.bl-hd nav a{font-weight:600;font-size:14px;color:var(--ink2)}
.bl-prog{position:absolute;left:0;bottom:-1px;height:2px;background:var(--acc);width:0}
.bl-hero{padding:56px 0 40px}.bl-hero .in{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center}
.kick{font:700 13px/1 inherit;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3)}
.bl-hero h1{font-size:clamp(34px,5.4vw,58px);line-height:1.12;letter-spacing:-.03em;margin:14px 0 8px;font-weight:850}
.bl-hero h1 .ko{font-size:.5em;letter-spacing:-.01em;margin-top:10px;font-weight:700;color:var(--acc)}
.bl-hero p{font-size:18px;color:var(--ink2);max-width:34em}
.bl-cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.bl-btn{display:inline-flex;align-items:center;gap:6px;min-height:46px;padding:10px 18px;border:1.5px solid var(--ink);border-radius:8px;background:var(--card);color:var(--ink);font-weight:700;text-decoration:none;cursor:pointer;font-size:15px}
.bl-btn small{font-weight:500;color:var(--ink3)}.bl-btn.main{background:var(--ink);color:var(--paper)}.bl-btn.main .sale-was{opacity:.6}
.bl-btn:focus-visible,.bl-lab button:focus-visible,.bl-lab input:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
/* 입체 책 — 표지 · 책등 · 쪽 두께. 마우스 · 기울기 따라 조금 돈다 */
.book3d{perspective:1400px;display:flex;justify-content:center}
.book3d .bk{position:relative;width:min(300px,70vw);aspect-ratio:600/852;transform-style:preserve-3d;transform:rotateY(-24deg) rotateX(6deg);transition:transform .25s ease-out}
.book3d .f{position:absolute;inset:0;border-radius:2px 6px 6px 2px;overflow:hidden;transform:translateZ(14px);border:1px solid rgba(0,0,0,.15)}
.book3d .f img{width:100%;height:100%;object-fit:cover;display:block}
.book3d .s{position:absolute;top:0;left:0;width:28px;height:100%;background:var(--acc2);transform:rotateY(-90deg) translateZ(0) translateX(-14px);transform-origin:left}
.book3d .p{position:absolute;top:3px;right:0;width:26px;height:calc(100% - 6px);background:repeating-linear-gradient(90deg,#f4efe4 0 2px,#e2dccd 2px 3px);transform:rotateY(90deg) translateZ(-13px);transform-origin:right}
.book3d .b{position:absolute;inset:0;background:var(--acc2);transform:translateZ(-14px);border-radius:2px 6px 6px 2px}
.bl-stats{border-top:1.5px solid var(--ink);border-bottom:1px solid var(--line)}.bl-stats .in{display:grid;grid-template-columns:repeat(4,1fr)}
.bl-stats div{padding:20px 12px;border-left:1px solid var(--line)}.bl-stats div:first-child{border-left:0}
.bl-stats b{display:block;font-size:40px;line-height:1.1;font-weight:850;letter-spacing:-.02em}.bl-stats span{font-size:14px;color:var(--ink2)}
.sec{padding:72px 0}.sec h2{font-size:clamp(26px,3.4vw,38px);line-height:1.2;letter-spacing:-.02em;margin:10px 0 6px}.sec h2 .ko{font-size:.62em;margin-top:6px}
.sec .sub{color:var(--ink2);max-width:40em}
/* 책 속 넘겨 보기 — 왼쪽 글이 지나가면 오른쪽 쪽 그림이 바뀐다 */
.story{display:grid;grid-template-columns:1fr 1.05fr;gap:48px;margin-top:28px}
.story ol{list-style:none;margin:0;padding:0}.story li{min-height:62vh;display:flex;flex-direction:column;justify-content:center;border-top:1px solid var(--line);padding:24px 0;opacity:.35;transition:opacity .3s}
.story li.on{opacity:1}.story li i{font-style:normal;font:800 13px/1 inherit;color:var(--acc);letter-spacing:.08em}.story li h3{font-size:24px;margin:8px 0 6px;line-height:1.3}
.story .stage{position:sticky;top:90px;height:min(78vh,720px);border:1px solid var(--line);border-radius:10px;background:#fff;overflow:hidden}
.story .stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:top;opacity:0;transform:translateY(12px) scale(.985);transition:opacity .45s,transform .45s}
.story .stage img.on{opacity:1;transform:none}
.story .li-img{display:none}
/* 연습실 */
.bl-lab{margin-top:26px;border:1.5px solid var(--ink);border-radius:12px;background:var(--card);overflow:hidden}
.bl-tabs{display:flex;border-bottom:1px solid var(--line)}.bl-tabs button{flex:1;padding:14px 10px;background:none;border:0;border-right:1px solid var(--line);font:700 15px/1.3 inherit;color:var(--ink3);cursor:pointer;text-align:left}
.bl-tabs button:last-child{border-right:0}.bl-tabs button[aria-selected="true"]{color:var(--ink);box-shadow:inset 0 -3px 0 var(--acc)}.bl-tabs small{display:block;font-weight:500;font-size:12px}
.bl-pane{padding:26px}.bl-pane[hidden]{display:none}
.bl-meter{display:flex;justify-content:space-between;align-items:center;font-size:14px;color:var(--ink3);margin-bottom:14px}.bl-meter b{color:var(--ink)}
.bl-q{font-size:21px;font-weight:700;line-height:1.55;margin:0 0 4px}.bl-q mark{background:none;border-bottom:2px solid var(--acc);color:var(--acc);padding:0 4px}
.bl-en{color:var(--ink3);font-size:14px;margin:0 0 14px}
.bl-row{display:flex;gap:8px}.bl-row input{flex:1;min-width:0;font:600 18px/1.4 inherit;padding:11px 14px;border:1.5px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink)}
.bl-fb{margin-top:14px;padding:14px 16px;border-radius:8px;border:1px solid var(--line);display:none}.bl-fb.show{display:block}
.bl-fb.ok{border-color:var(--ok)}.bl-fb.no{border-color:var(--no)}.bl-fb b{display:block;margin-bottom:2px}.bl-fb.ok b{color:var(--ok)}.bl-fb.no b{color:var(--no)}
.bl-opts{display:grid;gap:8px;margin-top:10px}.bl-opts button{text-align:left;padding:12px 14px;border:1.5px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink);font:600 17px/1.4 inherit;cursor:pointer}
.bl-opts button.ok{border-color:var(--ok);background:color-mix(in srgb,var(--ok) 10%,var(--paper))}.bl-opts button.no{border-color:var(--no)}
.bl-card{perspective:1000px;height:200px;margin:4px 0 14px;cursor:pointer}.bl-card>div{position:relative;height:100%;transform-style:preserve-3d;transition:transform .5s}.bl-card.flip>div{transform:rotateY(180deg)}
.bl-card .fa,.bl-card .ba{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px;text-align:center;border:1.5px solid var(--line);border-radius:10px;background:var(--paper);backface-visibility:hidden}
.bl-card .fa b{font-size:26px}.bl-card .ba{transform:rotateY(180deg);font-size:17px}.bl-card small{color:var(--ink3);margin-top:8px}
.bl-done{text-align:left}.bl-done h3{font-size:24px;margin:0 0 6px}
.bl-path{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:26px;border-top:1.5px solid var(--ink)}
.bl-path div{padding:20px 18px 20px 0;border-bottom:1px solid var(--line)}.bl-path i{font-style:normal;font:800 13px/1 inherit;color:var(--acc)}.bl-path b{display:block;font-size:19px;margin:8px 0 4px}
.bl-end{border-top:1.5px solid var(--ink);padding:56px 0 80px}.bl-end .in{display:grid;grid-template-columns:auto 1fr;gap:32px;align-items:center}.bl-end img{width:150px;border:1px solid var(--line);border-radius:4px}
.bl-foot{border-top:1px solid var(--line);padding:22px 0 90px;font-size:13px;color:var(--ink3)}
.rv{opacity:0;transform:translateY(18px);transition:opacity .6s,transform .6s}.rv.on{opacity:1;transform:none}
@media (max-width:860px){.bl-hero .in,.story,.bl-end .in{grid-template-columns:1fr}.book3d{order:-1}.book3d .bk{width:190px}.bl-hero{padding:28px 0 32px}.bl-stats .in{grid-template-columns:repeat(2,1fr)}.bl-stats div:nth-child(3){border-left:0}.bl-stats div:nth-child(n+3){border-top:1px solid var(--line)}
 .story .stage{display:none}.story li{min-height:0;opacity:1}.story .li-img{display:block;width:100%;border:1px solid var(--line);border-radius:8px;margin-top:12px;background:#fff}
 .bl-path{grid-template-columns:1fr}.bl-tabs button{font-size:14px;padding:12px 8px}.bl-pane{padding:18px}.bl-q{font-size:19px}.bl-end img{width:120px}.sec{padding:56px 0}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}html{scroll-behavior:auto}.rv{opacity:1;transform:none}}
</style>
</head>
<body>
<header class="bl-hd"><div class="in"><a href="/"><img src="/logo-256.png" alt="" width="26" height="26"><span>치즈감자 CheesePotato</span></a><nav><a href="/shop/${esc(id)}/">Book details · 책 정보</a></nav></div><div class="bl-prog" aria-hidden="true"></div></header>
<main>
<section class="bl-hero"><div class="in">
 <div class="rv on">
  <div class="kick">${esc(c.kicker.en)} · ${esc(c.kicker.ko)}</div>
  <h1>${esc(c.hook.en)}<span class="ko">${esc(c.hook.ko)}</span></h1>
  <p>${esc(c.lead.en)}</p><p class="ko" style="font-size:16px">${esc(c.lead.ko)}</p>
  <div class="bl-cta"><a class="bl-btn main" href="#lab" data-ev="랜딩체험" data-ev-from="${esc(id)}-hero">Try it now · 지금 풀어 보기 →</a>${sample}</div>
 </div>
 <div class="book3d" aria-hidden="true"><div class="bk" id="bk3d"><div class="b"></div><div class="p"></div><div class="s"></div><div class="f"><img src="${esc(k.coverImg)}" alt="" width="600" height="852"></div></div></div>
</div></section>
<section class="bl-stats" aria-label="This book in numbers"><div class="in">${c.stats.map(([n, l]) => `<div class="rv"><b data-count="${esc(n)}">${esc(n)}</b><span>${esc(l.en)} · ${esc(l.ko)}</span></div>`).join('')}</div></section>
<section class="sec" id="inside"><div class="in">
 <div class="kick">Inside the book · 책 속 넘겨 보기</div>
 <h2>Real pages, in the order you study them<span class="ko">공부하는 순서대로, 책 속 실제 쪽</span></h2>
 <div class="story"><ol>${story.map(([n, h, t], i) => `<li data-i="${i}"><i>${String(i + 1).padStart(2, '0')}</i><h3>${esc(h.en)}<span class="ko">${esc(h.ko)}</span></h3><p>${esc(t.en)}</p><p class="ko">${esc(t.ko)}</p><img class="li-img" src="/assets/books/${esc(id)}/detail/${esc(n)}.jpg" alt="${esc(h.en)}" loading="lazy" width="820" height="856"></li>`).join('')}</ol>
 <div class="stage" aria-hidden="true">${story.map(([n], i) => `<img src="/assets/books/${esc(id)}/detail/${esc(n)}.jpg" alt=""${i === 0 ? ' class="on"' : ' loading="lazy"'} width="820" height="856" data-i="${i}">`).join('')}</div></div>
</div></section>
<section class="sec" id="lab" style="padding-top:24px"><div class="in">
 <div class="kick">Practice lab · 연습실</div>
 <h2>${esc(c.tryTitle.en)}<span class="ko">${esc(c.tryTitle.ko)}</span></h2>
 <p class="sub">Three ways the book trains you, taken from Unit 1. Your answers stay on this device. · 책의 첫 단원에서 가져온 세 가지 연습이에요. 답은 이 기기에만 남아요.</p>
 <div class="bl-lab" data-book="${esc(id)}">
  <div class="bl-tabs" role="tablist">
   <button role="tab" aria-selected="true" aria-controls="p-fill" id="t-fill">1 · Write the blank<small>빈칸 쓰기 · 바로 확인</small></button>
   <button role="tab" aria-selected="false" aria-controls="p-quiz" id="t-quiz">2 · Choose the ending<small>알맞은 문체 고르기</small></button>
   <button role="tab" aria-selected="false" aria-controls="p-cards" id="t-cards">3 · Key expressions<small>표현 카드 · 알아요 / 다시</small></button>
  </div>
  <div class="bl-pane" id="p-fill" role="tabpanel" aria-labelledby="t-fill"><noscript>${data.fill.map((f) => `<p>${esc(f.q)} — ${esc(f.a[0])}</p>`).join('')}</noscript></div>
  <div class="bl-pane" id="p-quiz" role="tabpanel" aria-labelledby="t-quiz" hidden></div>
  <div class="bl-pane" id="p-cards" role="tabpanel" aria-labelledby="t-cards" hidden></div>
 </div>
</div></section>
<section class="sec" style="padding-top:24px"><div class="in">
 <div class="kick">After the book · 책 다음은</div>
 <h2>From the page to the exam<span class="ko">책에서 시험장까지</span></h2>
 <div class="bl-path">${c.path.map(([h, t], i) => `<div class="rv"><i>STEP ${i + 1}</i><b>${esc(h.en)} · ${esc(h.ko)}</b><span>${esc(t.en)}</span><span class="ko">${esc(t.ko)}</span></div>`).join('')}</div>
</div></section>
<section class="bl-end"><div class="in"><img src="${esc(k.coverImg)}" alt="${esc(k.title.en)}" width="600" height="852" loading="lazy"><div>
 <h2 style="margin:0 0 6px;font-size:28px;line-height:1.25">${esc(k.title.en)}<span class="ko" style="font-size:.7em">${esc(k.title.ko)}</span></h2>
 <p class="sub">PDF · print at home or use on a tablet · answer key included. Free with Pro Yearly. · PDF · 집에서 인쇄하거나 태블릿으로 · 정답 포함 · Pro 연간이면 무료</p>
 <div class="bl-cta">${buy('end', 'Buy the PDF')}${sample}<a class="bl-btn" href="/shop/${esc(id)}/">Contents &amp; details <small>목차 · 책 정보</small></a></div>
</div></div></section>
</main>
<footer class="bl-foot"><div class="in">Everykoreans · 에브리코리안즈 · TOPIK questions are newly written in the official format — not past papers. This is an independent study book, not operated or endorsed by NIIED or the TOPIK Center. · 기출 문제가 아닌 새로 만든 문제입니다.</div></footer>
<script type="application/json" id="bl-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script src="/book-landing.js" defer></script>
<script src="/sale.js" defer></script>
</body>
</html>
`;
}

let bad = 0;
for (const [id, c] of Object.entries(CFG)) {
  const out = path.join(ROOT, 'book', id, 'index.html'); const html = page(id, c);
  if (CHECK) { if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== html) { console.error(`✘ book/${id}/ 가 원본과 다르다 — node tools/build-book-landing.mjs`); bad++; } continue; }
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html); console.log(`book/${id}/index.html`);
}
if (bad) process.exit(1);
