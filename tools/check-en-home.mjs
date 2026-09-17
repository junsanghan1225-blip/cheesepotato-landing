/* en/index.html 을 검사한다 — node tools/check-en-home.mjs
 *
 * check-geo.mjs 가 한국어 쪽(FAQ==JSON-LD, 제목·설명 길이, 숫자)을 보는
 * 것과 같은 종류의 검사를 영어 쪽에도 건다. 다만 en/index.html 은
 * 생성물이라(node tools/build-en-home.mjs) 여기서는 **그 결과물이
 * 여전히 맞는지**와, 생성기가 못 잡는 것 — 두 쪽 사이의 hreflang 짝 —
 * 만 본다. 숫자·FAQ 정합은 build-en-home.mjs 가 만들 때부터 맞춰
 * 넣으므로 여기서 또 틀릴 일은 없지만, 손으로 en/index.html 을 고치는
 * 사고를 막기 위해 다시 잰다. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bad = [];
const err = (m) => bad.push(m);
const strip = (h) => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const enPath = path.join(ROOT, 'en', 'index.html');
if (!fs.existsSync(enPath)) {
  console.log('고쳐야 할 것 1개\n  ✗ en/index.html 이 없다 — node tools/build-en-home.mjs 를 먼저 돌릴 것');
  process.exit(1);
}
const en = fs.readFileSync(enPath, 'utf8');
const ko = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* ── lang 속성 ─────────────────────────────────────────────── */
if (!en.includes('<html lang="en">')) err('en/index.html 의 <html> 에 lang="en" 이 없다');
if (!ko.includes('<html lang="ko">')) err('index.html 의 <html> 에 lang="ko" 가 없다');

/* ── hreflang 짝 — 양쪽이 서로를, 그리고 자기 자신을 가리켜야 한다 ── */
const hreflangsOf = (html) => [...html.matchAll(
  /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)]
  .reduce((m, x) => (m[x[1]] = x[2], m), {});
const koLd = hreflangsOf(ko);
const enLd = hreflangsOf(en);
for (const [src, ld] of [['index.html', koLd], ['en/index.html', enLd]]) {
  if (ld.ko !== 'https://everykoreans.com/') err(`${src}: hreflang="ko" 가 https://everykoreans.com/ 를 안 가리킨다 (${ld.ko || '없음'})`);
  if (ld.en !== 'https://everykoreans.com/en/') err(`${src}: hreflang="en" 이 https://everykoreans.com/en/ 를 안 가리킨다 (${ld.en || '없음'})`);
  if (ld['x-default'] !== 'https://everykoreans.com/en/') err(`${src}: hreflang="x-default" 가 en 쪽을 안 가리킨다 (${ld['x-default'] || '없음'})`);
}

/* ── canonical ─────────────────────────────────────────────── */
if (!en.includes('<link rel="canonical" href="https://everykoreans.com/en/">'))
  err('en/index.html 의 canonical 이 https://everykoreans.com/en/ 이 아니다');

/* ── 제목·설명 ─────────────────────────────────────────────── */
const title = (en.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
const desc = (en.match(/<meta name="description" content="([\s\S]*?)">/) || [])[1] || '';
if (!title.trim()) err('en/index.html 의 <title> 이 비었다');
if (title.replace(/&amp;/g, '&').length > 70) err(`en <title> 이 ${title.length}자다 (60자 안팎이 좋다)`);
if (!desc.trim()) err('en/index.html 의 meta description 이 비었다');
if (desc.length > 180) err(`en meta description 이 ${desc.length}자다 (160자 안팎으로)`);

/* ── FAQ: 화면과 JSON-LD 가 같은 말인가 ──────────────────────── */
const faqBox = en.match(/<div class="faq-list">([\s\S]*?)<\/details>\s*<\/div>/);
const faqDom = faqBox
  ? [...faqBox[1].matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>/g)]
      .map((m) => ({ q: strip(m[1]), a: strip(m[2]) }))
  : [];
if (!faqDom.length) err('en/index.html 에서 FAQ 를 못 찾았다');

const faqLd = [];
for (const m of en.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  let d;
  try { d = JSON.parse(m[1]); } catch (e) { err(`en/index.html 의 JSON-LD 가 깨졌다: ${e.message}`); continue; }
  const graph = Array.isArray(d) ? d : (d['@graph'] || [d]);
  for (const b of graph) if (b['@type'] === 'FAQPage') [].concat(b.mainEntity || []).forEach((q) => faqLd.push(q));
}
if (faqDom.length !== faqLd.length) err(`en FAQ 개수가 다르다 — 화면 ${faqDom.length}개, JSON-LD ${faqLd.length}개`);
faqDom.forEach((d, i) => {
  const l = faqLd[i];
  if (!l) return;
  if (strip(String(l.name || '')) !== d.q) err(`en FAQ ${i + 1} 물음이 다르다\n      화면: ${d.q}\n      LD  : ${l.name}`);
  const la = strip(String(l.acceptedAnswer?.text || ''));
  if (la !== d.a) err(`en FAQ ${i + 1} 답이 다르다\n      화면: ${d.a.slice(0, 70)}…\n      LD  : ${la.slice(0, 70)}…`);
});

/* ── 한국어가 원문으로 남은 자리가 너무 많지 않은가 ───────────────
   data-en 이 없는 곳은 한국어가 남는 게 정상이지만(화면의 영어 모드도
   같다), 통째로 잘못 구워지면 거의 전부가 한국어로 남는다 — 그런
   심한 사고만 여기서 잡는다. 기준은 느슨하게: 본문 글자 수 기준
   한글이 30%를 넘으면 의심한다. */
const bodyText = strip(en.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, ''));
const hangul = (bodyText.match(/[가-힣]/g) || []).length;
const ratio = bodyText.length ? hangul / bodyText.length : 0;
if (ratio > 0.3) err(`en/index.html 본문의 한글 비율이 ${(ratio * 100).toFixed(0)}% 다 — data-en 스왑이 제대로 안 된 것 같다`);

console.log(`en/index.html: 제목 ${title.length}자 · 설명 ${desc.length}자 · FAQ ${faqDom.length}개 · 한글 비율 ${(ratio * 100).toFixed(1)}%`);
if (bad.length) {
  console.log(`\n고쳐야 할 것 ${bad.length}개`);
  bad.forEach((b) => console.log('  ✗ ' + b));
  process.exit(1);
}
console.log('문제 없음');
