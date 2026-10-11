/* 문법 학습지(운영자 2026-10-12 「학습지 대량으로 — 우리 자료로 문법을 깊이 공부하게」 · 「초급 약 100개」).
   초급 문법 표현 한 개마다 인쇄용 학습지 한 벌(A4 3쪽: 설명 · 연습 · 정답) → worksheet/<문법 id>.html + 목록 worksheet/index.html.
   자료는 전부 우리 것: sentences.js(이름 · 뜻 · 예문 · 대화 · more) · grammar-en.js · grammar-usage.js(연습 문장 GRAMMAR_PRACTICE) ·
   grammar-drill.js(바꾸기 표) · grammar-pairs.js(비교) · grammar-mark.js(문장 속 그 문법 자리 찾기 — 빈칸을 만든다).
   모든 문제는 창작 자료로 만든 것 — 기출 아님. build-pages.mjs 가 끝에 부른다. 생성물은 손으로 고치지 않는다. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SB_CATS } from '../sentences.js';
import { GRAMMAR_EN } from '../grammar-en.js';
import { GRAMMAR_PRACTICE } from '../grammar-usage.js';
import { GRAMMAR_DRILL } from '../grammar-drill.js';
import { GRAMMAR_PAIRS } from '../grammar-pairs.js';
import { grammarMarkRe } from '../grammar-mark.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'worksheet');
mkdirSync(OUT, { recursive: true });
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LV = { beginner: ['초급', 'Beginner'], intermediate: ['중급', 'Intermediate'], advanced: ['고급', 'Advanced'] };
export const WS_LEVELS = ['beginner'];   // 지금은 초급만(112개). 형식을 확인한 뒤 중급 · 고급을 더한다.

const POINTS = SB_CATS.flatMap((c) => c.points.map((p) => ({ ...p, cat: c }))).filter((p) => WS_LEVELS.includes(p.lv));
export const WS_IDS = POINTS.map((p) => p.id);

/* 문장 속 그 문법 자리를 찾아 [앞, 맞은 글자, 뒤] 로 — 못 찾으면 null */
function splitAt(point, sentence) {
  let re = null;
  try { re = grammarMarkRe(point.name); } catch (e) { re = null; }
  if (!re) return null;
  const m = new RegExp(re.source, re.flags.replace('g', '')).exec(sentence);
  if (!m || !m[0] || m[0].length < 1 || m[0].length > 12) return null;
  return [sentence.slice(0, m.index), m[0], sentence.slice(m.index + m[0].length)];
}
const hi = (point, s) => { const sp = splitAt(point, s); return sp ? `${esc(sp[0])}<mark>${esc(sp[1])}</mark>${esc(sp[2])}` : esc(s); };
/* more[2] 는 「한국어 설명. English …」 — 한국어 끝에서 영어 시작을 찾는다 */
const koPart = (s) => { const m = /\s(?=[A-Z][a-z]+\s)/.exec(String(s || '')); return m ? s.slice(0, m.index).trim() : String(s || '').trim(); };

function sheet(p) {
  const en = GRAMMAR_EN[p.id] || {}, more = p.more || [], pr = GRAMMAR_PRACTICE[p.id] || [], dr = GRAMMAR_DRILL[p.id];
  const [lvKo, lvEn] = LV[p.lv];
  // ── 연습 재료 ──
  const blanks = [], writes = [], copies = [];
  for (const [ko, enS] of pr) {
    const sp = splitAt(p, ko);
    if (sp && blanks.length < 3) blanks.push({ sp, en: enS }); else if (writes.length < 2) writes.push({ ko, en: enS }); else copies.push({ ko, en: enS });
  }
  // 빈칸이 세 개가 안 되는 문법(조사 · 어미 꼴이 복잡한 것)은 따라 쓰기로 채운다 — 빈 연습을 내지 않고, 초급에는 소리 내어 따라 쓰는 연습도 맞다
  const copyList = copies.slice(0, Math.max(0, 3 - blanks.length));
  const rows = (dr?.x || []).slice(0, 4);
  const pair = GRAMMAR_PAIRS.find((x) => x.a === p.id || x.b === p.id);
  const collo = more[1] && !/^\s*$/.test(more[1]) ? more[1] : '';
  const CIRC = ['①', '②', '③', '④', '⑤', '⑥'];
  const secs = [rows.length && 'drill', blanks.length && 'blank', copyList.length && 'copy', writes.length && 'write', 'own'].filter(Boolean);
  const N = (k) => CIRC[secs.indexOf(k)];
  const sheet1 = `<section class="ws-p">
  <div class="ws-top"><span>이름 Name: ______________________</span><span>날짜 Date: ____________</span></div>
  <p class="ws-kicker">문법 학습지 · Grammar worksheet — ${lvKo} ${lvEn} · ${esc(p.cat.ko)}</p>
  <h1>${esc(p.name)}</h1>
  <h2>뜻 · Meaning</h2>
  <p>${esc(p.desc)}</p>${en.desc ? `<p class="ws-en" lang="en">${esc(en.desc)}</p>` : ''}
  <h2>형태 · Form</h2>
  <p class="ws-form">${esc(en.form || more[0] || '')}${en.form && more[0] && en.form !== more[0] ? `<br><span class="ws-ko">${esc(more[0])}</span>` : ''}</p>
  ${collo ? `<h2>함께 쓰는 말 · Often used with</h2><p>${esc(collo)}</p>` : ''}
  <h2>주의할 점 · Watch out</h2>
  <p>${esc(koPart(more[2]) || '')}</p>${en.care ? `<p class="ws-en" lang="en">${esc(en.care)}</p>` : ''}
  <h2>예문 · Examples</h2>
  <ul class="ws-ex"><li>${hi(p, p.ex)}</li>${more[3] ? `<li>${hi(p, more[3])}</li>` : ''}</ul>
  ${p.dlg?.length ? `<div class="ws-dlg">${p.dlg.map((l) => `<p>${hi(p, l)}</p>`).join('')}</div>` : ''}
</section>`;
  const sheet2 = `<section class="ws-p">
  <div class="ws-top"><span>${esc(p.name)} — 연습 Practice</span><span>이름 Name: ____________</span></div>
  ${rows.length ? `<h2>${N('drill')} 바꿔 써요 · Change the word — <b>${esc(dr.t)}</b></h2>
  <table class="ws-t"><tbody>${rows.map(([b]) => `<tr><td>${esc(b)}</td><td>→</td><td class="ws-line"></td></tr>`).join('')}</tbody></table>` : ''}
  ${blanks.length ? `<h2>${N('blank')} 빈칸에 알맞은 말을 써요 · Fill in the blank (${esc(p.name)})</h2>
  <ol class="ws-q">${blanks.map((b) => `<li>${esc(b.sp[0])}<span class="ws-blank"></span>${esc(b.sp[2])}<small lang="en">${esc(b.en)}</small></li>`).join('')}</ol>` : ''}
  ${copyList.length ? `<h2>${N('copy')} 소리 내어 읽고 따라 써요 · Read aloud, then copy</h2>
  <ol class="ws-q">${copyList.map((c) => `<li>${hi(p, c.ko)}<small lang="en">${esc(c.en)}</small><div class="ws-wl"></div></li>`).join('')}</ol>` : ''}
  ${writes.length ? `<h2>${N('write')} 한국어로 써요 · Write it in Korean (use ${esc(p.name)})</h2>
  <ol class="ws-q">${writes.map((w) => `<li lang="en">${esc(w.en)}<div class="ws-wl"></div></li>`).join('')}</ol>` : ''}
  <h2>${N('own')} 내 문장 · My own sentences</h2>
  <div class="ws-wl"></div><div class="ws-wl"></div>
  ${pair ? `<p class="ws-pair" lang="en"><b>Often confused:</b> ${esc(pair.title.en)} — ${esc(pair.gist.en)}</p>` : ''}
</section>`;
  const sheet3 = `<section class="ws-p ws-key">
  <div class="ws-top"><span>${esc(p.name)} — 정답 Answer key</span><span>선생님 · 스스로 확인 Check yourself</span></div>
  ${rows.length ? `<h2>${N('drill')}</h2><p>${rows.map(([b, a]) => `${esc(b)} → <b>${esc(a)}</b>`).join(' · ')}</p>` : ''}
  ${blanks.length ? `<h2>${N('blank')}</h2><ol class="ws-q">${blanks.map((b) => `<li>${esc(b.sp[0])}<mark>${esc(b.sp[1])}</mark>${esc(b.sp[2])}</li>`).join('')}</ol>` : ''}
  ${copyList.length ? `<h2>${N('copy')}</h2><p>읽은 문장 그대로 · Exactly as printed.</p>` : ''}
  ${writes.length ? `<h2>${N('write')} 예시 답 · Model answers</h2><ol class="ws-q">${writes.map((w) => `<li>${hi(p, w.ko)}</li>`).join('')}</ol>` : ''}
  <h2>${N('own')}</h2><p>자유 답이에요. 문법 모양과 뜻이 맞으면 좋아요. · Free answers — check the form and the meaning.</p>
  <p class="ws-foot">모든 문제는 치즈감자가 만든 창작 문항이에요(기출 아님). Original practice written for CheesePotato — not past exam questions.</p>
</section>`;
  return { sheet1, sheet2, sheet3, has: { rows: rows.length, blanks: blanks.length, writes: writes.length, copies: copyList.length } };
}

const CSS = `.ws-doc{max-width:820px;margin:0 auto}.ws-p{background:#fff;border:1px solid var(--line);border-radius:12px;padding:24px;margin:18px 0}
.ws-top{display:flex;justify-content:space-between;gap:12px;font-size:12.5px;color:var(--ink-3);border-bottom:1px solid var(--line);padding-bottom:8px}
.ws-kicker{margin:14px 0 0;font-size:12.5px;font-weight:800;color:var(--orange-deep);letter-spacing:.02em}
.ws-p h1{font-size:30px;line-height:1.25;margin:4px 0 6px}.ws-p h2{font-size:14.5px;margin:18px 0 6px;color:var(--ink)}.ws-p p{margin:0 0 6px;font-size:15px}
.ws-en{color:var(--ink-3);font-size:13.5px!important}.ws-form{font-weight:700;color:var(--ink)}.ws-ko{font-weight:500;color:var(--ink-3)}
.ws-ex{margin:0;padding-left:20px}.ws-ex li{margin:2px 0}mark{background:#FFE08A;color:inherit;padding:0 2px;border-radius:3px}
.ws-dlg{margin-top:8px;padding:10px 12px;background:#FBF6EC;border-radius:10px}.ws-dlg p{margin:2px 0!important}
.ws-t{border-collapse:collapse}.ws-t td{padding:6px 8px;font-size:16px}.ws-line{min-width:180px;border-bottom:1.5px solid #999}
.ws-q{margin:0;padding-left:22px}.ws-q li{margin:0 0 12px;font-size:16px}.ws-q small{display:block;color:var(--ink-3);font-size:12.5px}
.ws-blank{display:inline-block;min-width:90px;border-bottom:1.5px solid #666;margin:0 4px}.ws-wl{height:30px;border-bottom:1.5px solid #bbb;margin-top:6px}
.ws-pair{margin-top:14px!important;padding:8px 12px;background:#FBF6EC;border-radius:10px;font-size:13px!important}.ws-foot{margin-top:16px!important;font-size:12px!important;color:var(--ink-3)}
.ws-acts{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}
@media print{@page{size:A4;margin:12mm}body{background:#fff}.hd,.ws-acts,.ws-nav,.ft,.ws-intro{display:none!important}main{padding:0!important;max-width:none}.ws-p{border:0;border-radius:0;padding:0;margin:0;break-after:page}.ws-p:last-child{break-after:auto}.ws-p h1{font-size:26px}.ws-p p,.ws-q li{font-size:13.5px}.ws-wl{height:26px}mark{-webkit-print-color-adjust:exact;print-color-adjust:exact}}`;

const head = (title, desc, url, jsonld = '') => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="https://everykoreans.com${url}">
<!-- 생성물: node tools/build-worksheets.mjs (build-pages 가 부른다). 손으로 고치지 않는다. -->
<script src="/gtm.js" async></script>
<script src="/analytics.js" defer></script>
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="https://everykoreans.com${url}">
<meta property="og:image" content="https://everykoreans.com/logo-256.png">
${jsonld}<link rel="stylesheet" href="/vendor/pretendard.css">
<link rel="stylesheet" href="/page.css">
<style>${CSS}</style>
</head>
<body>
<header class="hd"><div class="hd-in"><a href="/"><img src="/logo.png" alt=""><span>치즈감자 CheesePotato</span></a></div></header>
<main>`;
const foot = `</main></body></html>\n`;

let n = 0;
const byCat = new Map();
for (const p of POINTS) {
  const s = sheet(p);
  if (!s.has.blanks && !s.has.rows) continue;   // 연습 재료가 하나도 없으면 학습지를 내지 않는다(빈 연습을 내보내지 않는다)
  const title = `Korean Grammar Worksheet: ${p.name} — Free Printable (PDF) | CheesePotato`;
  const desc = `Free printable worksheet for the Korean grammar point ${p.name}: meaning, form, examples, fill-in-the-blank and writing practice with an answer key. For learners and teachers.`;
  const url = `/worksheet/${p.id}.html`;
  const html = head(title, desc, url) + `
<div class="ws-doc">
<nav class="ws-nav"><a href="/worksheet/">← 문법 학습지 목록 · All worksheets</a> · <a href="/sentence/${p.id}.html">이 문법 자세히 · Grammar page</a></nav>
<p class="ws-intro">인쇄하거나 PDF 로 저장해서 쓰세요(브라우저의 인쇄 → PDF 로 저장). 1쪽 설명 · 2쪽 연습 · 3쪽 정답이에요. · Print or save as PDF: page 1 explanation, page 2 practice, page 3 answers.</p>
<div class="ws-acts"><button type="button" class="btn main" onclick="window.print()">🖨️ Print / save as PDF</button><a class="btn sub" href="/?utm_source=worksheet&amp;utm_medium=${p.id}#learn/sentence/${p.id}">Practise this grammar online — free →</a></div>
${s.sheet1}
${s.sheet2}
${s.sheet3}
</div>
<p class="ft">Made by a Korean teacher · <a href="/about.html">About</a> · <a href="/worksheet/">All grammar worksheets</a> · <a href="/privacy.html">Privacy</a></p>
` + foot;
  writeFileSync(join(OUT, `${p.id}.html`), html);
  n++;
  if (!byCat.has(p.cat.id)) byCat.set(p.cat.id, { cat: p.cat, items: [] });
  byCat.get(p.cat.id).items.push(p);
}
export const WS_MADE = n;
const idx = head(`Free Korean Grammar Worksheets (Printable PDF) — ${n} Beginner Grammar Points | CheesePotato`,
  `${n} free printable Korean grammar worksheets for beginners: each one explains the grammar and adds fill-in-the-blank, writing practice and an answer key. Print or save as PDF.`, '/worksheet/') + `
<h1>문법 학습지 · Free grammar worksheets</h1>
<p>${n} beginner Korean grammar points, one printable worksheet each: explanation, examples, practice and an answer key. Print them or save as PDF. All practice is original — not from past exams. 초급 문법 ${n}개, 표현마다 인쇄용 학습지 한 벌이에요(설명 · 연습 · 정답).</p>
${[...byCat.values()].map(({ cat, items }) => `<h2>${esc(cat.ko)} · ${esc(cat.en || '')}</h2><ul class="pts">${items.map((p) => `<li><a href="/worksheet/${p.id}.html">${esc(p.name)}</a></li>`).join('')}</ul>`).join('\n')}
<p class="ft">Made by a Korean teacher · <a href="/about.html">About</a> · <a href="/sentence/">All grammar points</a> · <a href="/topik-vocabulary-list/">Word lists (CSV · Anki)</a> · <a href="/privacy.html">Privacy</a></p>
` + foot;
writeFileSync(join(OUT, 'index.html'), idx);
console.log(`문법 학습지 — 초급 ${n}개 + 목록 → worksheet/ (재료 없는 ${POINTS.length - n}개는 뺌)`);
