#!/usr/bin/env node
/* 책마다 따로 만드는 학습 쪽 — /book/<책 id>/index.html + data.json (운영자 2026-11-18 「책에 있는 문제도 풀고 정답도 체크하고 그 책에 관련된 건 전부(단어 학습부터) · 책을 산 사람만 · 첫걸음부터 전부 · 일주일에 한 권씩」).
   · 책을 산 사람만: 책의 Reader bonus 쪽에 인쇄된 독자 코드(docs/books/<책 id>.json 의 code)를 넣어야 연다. 쪽에는 코드의 지문(sha256)만 두고, 단원 자료(data.json)는 연 뒤에 받는다.
     (단원 내용 자체는 사이트 학습지로도 공개된 것이라 이것은 「독자 전용 공부 쪽」의 문이지 내용을 숨기는 자물쇠가 아니다.)
   · 단원 · 연습 · 정답은 책과 같은 원본에서: 책 틀(docs/books/<책 id>.json — parts · inline)과 학습지(docs/worksheets/<단원>.json). 책 순서 · 단원 번호도 책과 같다.
   · 쪽 안 움직임 · 채점은 /book-landing.js.
   node tools/build-book-landing.mjs            모든 책(docs/book-landing.json 에 있는 것)
   node tools/build-book-landing.mjs --check    생성물이 원본과 같은지만 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const CFG = read('docs/book-landing.json').books;
const SHOP = read('docs/shop.json');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const normCode = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
const HANGUL = /[가-힣ㄱ-ㅎㅏ-ㅣ]/, LATIN = /[A-Za-z]/;

/* 책 쪽의 칸 → 화면 칸. 화면에서 다루지 않는 칸(계획표 · 습관 · 얼굴 · 쓰기 순서 그림 등)은 「책에서」 한 줄로 남긴다 */
const SUPPORTED = new Set(['text', 'table', 'practice', 'cards', 'keyexp', 'matchlines', 'dialog', 'dlgfill']);
function section(s) {
  const t = s.title || { en: '', ko: '' };
  if (!SUPPORTED.has(s.type)) return { type: 'book', title: t };
  const o = { type: s.type, title: t };
  for (const k of ['hint', 'text', 'cols', 'rows', 'note', 'items', 'pairs', 'lines', 'tip']) if (s[k] !== undefined) o[k] = s[k];
  return o;
}
/* 단원 낱말 덱: 표의 줄에서 「한글 낱말 · 영어 뜻」 짝 + 글자 카드 + 핵심 표현 */
function deck(secs) {
  const out = [], seen = new Set();
  const add = (ko, en) => { ko = String(ko || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim(); en = String(en || '').trim(); if (!ko || !en || ko.length > 24 || seen.has(ko)) return; seen.add(ko); out.push({ ko, en }); };
  for (const s of secs) {
    if (s.type === 'table') for (const r of s.rows || []) {
      const cells = r.map((c) => String(c ?? ''));
      const k = cells.findIndex((c) => HANGUL.test(c) && !/[.?!]$/.test(c.trim())), e = cells.findIndex((c, i) => i !== k && LATIN.test(c) && !HANGUL.test(c));
      if (k >= 0 && e >= 0) add(cells[k], cells[e]);
      for (const [ci, cell] of cells.entries()) { if (/name|romaniz|발음/i.test(String(s.cols?.[ci] || ''))) continue; const m = /^([가-힣][가-힣 ]*)\s*\(([A-Za-z][^)]*)\)$/.exec(cell.trim()); if (m) add(m[1], m[2]); }   // 「가방 (bag)」 처럼 한 칸에 낱말 · 뜻
    }
    if (s.type === 'cards') for (const c of s.items || []) if (c.ex) add(c.ex[0], c.ex[1]);
    if (s.type === 'keyexp') for (const it of s.items || []) add(it[0], it[2]);
  }
  return out;
}

function build(id, c) {
  const k = SHOP.books.find((b) => b.id === id); if (!k) throw new Error(`shop.json 에 ${id} 없음`);
  const B = read(`docs/books/${id}.json`);
  const code = B.bonus?.code || B.code || (JSON.stringify(B).match(/"code":\s*"(CP-[A-Z0-9-]+)"/) || [])[1];
  if (!code) throw new Error(`${id}: 독자 코드(code)가 책 틀에 없다`);
  const sheet = (u) => B.inline?.[u] || (fs.existsSync(path.join(ROOT, `docs/worksheets/${u}.json`)) ? read(`docs/worksheets/${u}.json`) : null);
  let no = 0;
  const parts = B.parts.map((p, pi) => ({ title: p.title, units: p.units.map((u) => {
    const w = sheet(u); if (!w) throw new Error(`${id}: 단원 ${u} 원본 없음`);
    const secs = (w.sections || []).map(section);
    return { id: u, no: ++no, title: w.title, secs, deck: deck(w.sections || []) };
  }) }));
  const data = { book: id, title: k.title, parts };
  const INK = B.coverLevel?.bg || k.color || '#1F1B16', INK2 = B.coverLevel?.bg2 || INK;
  const lock = crypto.createHash('sha256').update(normCode(code)).digest('hex');
  const units = parts.reduce((a, p) => a + p.units.length, 0), prac = parts.reduce((a, p) => a + p.units.reduce((b, u) => b + u.secs.filter((s) => s.type === 'practice').reduce((x, s) => x + (s.items || []).length, 0), 0), 0), words = parts.reduce((a, p) => a + p.units.reduce((b, u) => b + u.deck.length, 0), 0);
  const url = `/book/${id}/`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(k.title.en)} — reader study room | CheesePotato</title>
<meta name="description" content="${esc(c.lead.en)}">
<meta name="robots" content="noindex">
<link rel="canonical" href="https://everykoreans.com${url}">
<!-- 생성물 — 손으로 고치지 말 것. docs/book-landing.json · docs/books/${esc(id)}.json · docs/worksheets 를 고치고 node tools/build-book-landing.mjs -->
<script src="/gtm.js" async></script>
<script src="/analytics.js" defer></script>
<link rel="stylesheet" href="/vendor/pretendard.css">
<link rel="stylesheet" href="/book-landing.css">
<style>:root{--acc:${INK};--acc2:${INK2}}</style>
</head>
<body>
<header class="bl-hd"><div class="in"><a href="/"><img src="/logo-256.png" alt="" width="26" height="26"><span>치즈감자 CheesePotato</span></a><nav><a href="/shop/${esc(id)}/">Book · 책 정보</a></nav></div><div class="bl-prog" aria-hidden="true"></div></header>
<main id="bl" data-book="${esc(id)}" data-lock="${lock}" data-data="${url}data.json">
<section class="bl-hero"><div class="in">
 <div>
  <div class="kick">${esc(c.kicker.en)} · ${esc(c.kicker.ko)} · Reader study room · 독자 전용</div>
  <h1>${esc(k.title.en)}<span class="ko">${esc(k.title.ko)}</span></h1>
  <p>${esc(c.hook.en)}</p><p class="ko">${esc(c.hook.ko)}</p>
  <ul class="bl-nums"><li><b>${units}</b>units · 단원</li><li><b>${prac}</b>exercises · 연습 문항</li><li><b>${words}</b>words &amp; expressions · 낱말 · 표현</li></ul>
 </div>
 <div class="book3d" aria-hidden="true"><div class="bk" id="bk3d"><div class="b"></div><div class="p"></div><div class="s"></div><div class="f"><img src="${esc(k.coverImg)}" alt="" width="600" height="852"></div></div></div>
</div></section>
<section class="in bl-gate" id="gate">
 <h2>Enter your reader code<span class="ko">독자 코드를 넣어 주세요</span></h2>
 <p class="sub">${esc(c.lead.en)}</p><p class="sub ko">${esc(c.lead.ko)}</p>
 <p class="sub">The code is on the <b>Reader bonus</b> page near the end of the book (it looks like <code>CP-XX-XXXXXX</code>). · 코드는 책 뒤쪽 <b>Reader bonus</b> 쪽에 있어요(<code>CP-XX-XXXXXX</code> 모양).</p>
 <form class="bl-row" id="gateForm"><input id="gateIn" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="CP-XX-XXXXXX" aria-label="Reader code · 독자 코드"><button class="bl-btn main" type="submit">Open · 열기</button></form>
 <p class="bl-msg" id="gateMsg" role="status" aria-live="polite"></p>
 <p class="sub">No book yet? · 아직 책이 없나요? <a href="/shop/${esc(id)}/">See the book · 책 보기</a>${k.sample ? ` · <a href="/assets/books/${esc(id)}/sample.pdf" download>Free sample · 무료 샘플</a>` : ''}</p>
</section>
<section class="in" id="app" hidden></section>
</main>
<footer class="bl-foot"><div class="in">Everykoreans · 에브리코리안즈 · Your progress is saved on this device only. · 공부 기록은 이 기기에만 저장돼요.</div></footer>
<script src="/book-landing.js" defer></script>
</body>
</html>
`;
  return { html, data: JSON.stringify(data) + '\n' };
}

let bad = 0;
for (const [id, c] of Object.entries(CFG)) {
  const { html, data } = build(id, c);
  for (const [f, body] of [['index.html', html], ['data.json', data]]) {
    const out = path.join(ROOT, 'book', id, f);
    if (CHECK) { if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== body) { console.error(`✘ book/${id}/${f} 가 원본과 다르다 — node tools/build-book-landing.mjs`); bad++; } continue; }
    fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, body);
  }
  if (!CHECK) console.log(`book/${id}/ (index.html · data.json)`);
}
if (bad) process.exit(1);
