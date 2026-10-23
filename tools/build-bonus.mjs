#!/usr/bin/env node
/* 책 QR 보너스 연습 쪽 — docs/bonus/<책 id>.json → /bonus/<책 id>/<단원>/index.html (+ /bonus/<책 id>/index.html 목록).
   책의 QR 이 여는 쪽(tools/build-book.mjs 의 unitUrl). 낱말 카드(뒤집기 · 🔊) · 보기 퀴즈 · 빈칸 쓰기를 쪽에서 바로 채우고 채점한다(bonus.js).
   원본은 JSON — 생성물은 손으로 고치지 않는다. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { bonusFiles, loadBonus, validateBonus } from './bonus-data.mjs';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const JS = `/bonus.js?v=${crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, 'bonus.js'))).digest('hex').slice(0, 8)}`;
const NUM = ['①', '②', '③', '④'];
const CSS = `
main{max-width:760px;margin:0 auto;padding:22px 20px 80px}
.bk-badge{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.06em;color:#C4551C;background:#FDF0E2;border-radius:99px;padding:4px 12px}
.bk-h{font-size:19px;font-weight:800;margin:30px 0 4px}.bk-h small{font-weight:500;color:var(--ink-3);font-size:13px;margin-left:6px}
.bk-sub{color:var(--ink-3);font-size:14px;margin:0 0 12px}
.bcards{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.bcard{font:inherit;text-align:center;cursor:pointer;min-height:84px;padding:14px 12px;border:1px solid var(--line);border-radius:14px;background:#fff;color:var(--ink);display:flex;align-items:center;justify-content:center}
.bcard .b{display:none;font-size:14px;color:var(--ink-2);line-height:1.45}.bcard .f{font-size:18px;font-weight:800}
.bcard.flip{background:#FFF7E3;border-color:#F0C24B}.bcard.flip .f{display:none}.bcard.flip .b{display:block}
.bq,.bf{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:10px 0}
.bqq{font-weight:700;margin:0 0 8px;line-height:1.5}.bqq i{font-style:normal;color:var(--ink-3);font-weight:500;margin-right:6px}
.bo{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.bo li{min-height:44px;display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--line);border-radius:10px;cursor:pointer;background:#FBF8F1}
.bo li:hover{border-color:#F0C24B}.bo li.right{background:#E6F4EA;border-color:#3A9A5B}.bo li.wrong{background:#FCE8E6;border-color:#D1493E}
.bw{margin:8px 0 0;font-size:14px;color:var(--ink-2);line-height:1.55}
.bf .fq{font-size:18px;font-weight:700;line-height:1.7;margin:0}.bf .fe{color:var(--ink-3);font-size:13.5px;margin:2px 0 8px}
.bf input{font:inherit;font-size:17px;width:9em;max-width:100%;padding:6px 10px;border:0;border-bottom:2px solid #C4551C;background:#FFF7E3;border-radius:6px 6px 0 0;text-align:center}
.bf button{font:inherit;min-height:44px;margin-left:8px;padding:0 18px;border:0;border-radius:10px;background:#C4551C;color:#fff;font-weight:700;cursor:pointer}
.bf .bm{margin:8px 0 0;font-weight:700}.bf.ok .bm{color:#2E7D4A}.bf.no .bm{color:#B3322D}
.bsc{position:sticky;bottom:0;margin-top:26px;padding:12px 16px;background:#fff;border:1px solid var(--line);border-radius:14px;display:flex;justify-content:space-between;align-items:center;font-weight:800}
.bsc.fin{background:#FFF7E3;border-color:#F0C24B}.bfin,.bbest{margin:10px 0 0;font-size:14px;color:var(--ink-2)}
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
fs.rmSync(path.join(ROOT, 'bonus'), { recursive: true, force: true });
let n = 0;
for (const f of bonusFiles()) {
  const errs = validateBonus(f);
  if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
  const d = loadBonus(f), id = d.book, book = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/books', `${id}.json`), 'utf8'));
  const list = [];
  for (const [u, c] of Object.entries(d.units)) {
    const ws = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/worksheets', `${u}.json`), 'utf8'));
    const tk = typeof ws.title === 'object' ? ws.title : { en: ws.title, ko: ws.titleKo || ws.title };
    const total = c.quiz.length + c.fill.length;
    const url = `/bonus/${id}/${u}/`;
    const cards = c.cards.map((x) => `<button type="button" class="bcard" data-say="${esc(x.ko)}"><span class="f">${esc(x.ko)}</span><span class="b">${esc(x.en)}</span></button>`).join('');
    const quiz = c.quiz.map((x, i) => `<div class="bq" data-ans="${x.a}"><p class="bqq"><i>Q${i + 1}</i>${esc(x.q)}</p><ul class="bo">${x.opts.map((o, k) => `<li tabindex="0" role="button">${NUM[k]} ${esc(o)}</li>`).join('')}</ul><p class="bw" hidden>${esc(x.why)}</p></div>`).join('');
    const fill = c.fill.map((x, i) => `<div class="bf" data-a="${esc(JSON.stringify(x.a))}"><p class="fq">${esc(x.q).replace(/___/g, '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="빈칸 ' + (i + 1) + '">')}<button type="button">확인 · Check</button></p><p class="fe">${esc(x.en)}</p><p class="bm" hidden></p></div>`).join('');
    const title = `${tk.en} 보너스 연습 · Bonus practice — ${book.title.en}`;
    const page = head(title, `${book.title.ko} 단원 보너스 연습: 낱말 카드, 퀴즈, 빈칸 쓰기. 쪽에서 바로 채우고 채점해요.`, url) + `<div data-bonus="${esc(id + '/' + u)}">
<span class="bk-badge">책 보너스 · BOOK BONUS</span>
<h1>${esc(tk.ko || tk.en)}</h1>
<p class="bk-sub">${esc(tk.en)} · ${esc(book.title.ko)} · ${esc(book.title.en)}</p>
<h2 class="bk-h">낱말 카드 <small>Flashcards · 눌러서 뒤집기 · tap to flip</small></h2>
<div class="bcards">${cards}</div>
<h2 class="bk-h">퀴즈 <small>Quiz</small></h2>${quiz}
<h2 class="bk-h">빈칸 쓰기 <small>Fill in the blank</small></h2><p class="bk-sub">한글로 쓰고 [확인]을 누르세요. · Type in Hangul, then press Check.</p>${fill}
<div class="bsc"><span>점수 · Score</span><span class="bscore">0 / ${total}</span></div>
<p class="bfin" hidden>끝! 틀린 곳은 책 정답 쪽과 같이 다시 보세요. · Done! Review your misses with the book's answer key.</p><p class="bbest" hidden></p>
<div class="bcta"><a class="btn main" href="/#learn">앱에서 더 연습하기<span> · Practice more free</span></a><a class="btn sub" href="/${u}-worksheet/">인쇄용 학습지 · Printable sheet</a></div>
</div>
` + foot;
    fs.mkdirSync(path.join(ROOT, 'bonus', id, u), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'bonus', id, u, 'index.html'), page);
    list.push({ u, ko: tk.ko || tk.en, en: tk.en }); n++;
  }
  const idx = head(`${book.title.en} 보너스 연습 · Bonus practice`, `${book.title.ko} 단원별 보너스 연습`, `/bonus/${id}/`) + `<span class="bk-badge">책 보너스 · BOOK BONUS</span><h1>${esc(book.title.ko)}</h1><p class="bk-sub">${esc(book.title.en)} · 단원별 보너스 연습</p><ul>${list.map((x) => `<li style="margin:8px 0"><a href="/bonus/${id}/${x.u}/">${esc(x.ko)} <small>${esc(x.en)}</small></a></li>`).join('')}</ul>` + foot;
  fs.writeFileSync(path.join(ROOT, 'bonus', id, 'index.html'), idx);
}
console.log(`보너스 쪽 ${n}개 → bonus/`);
