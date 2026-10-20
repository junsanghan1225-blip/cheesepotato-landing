/* TOPIK 낱말 목록 내려받기(운영자 2026-10-11 「B」) — vocab/data/topik1·2.json → downloads/*.csv · *.txt(Anki) + topik-vocabulary-list/index.html
   build-pages.mjs 가 끝에 부른다. 급수 출처: 국립국어원 「국제 통용 한국어 표준 교육과정」(공공누리 1유형) — 화면에 적는다. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rd = (f) => JSON.parse(readFileSync(join(ROOT, 'vocab/data', f), 'utf8'));
const ALL = [...rd('topik1.json'), ...rd('topik2.json')];
const BAND = [
  { id: 'topik-level-1', name: 'TOPIK I · Level 1', lv: [1] },
  { id: 'topik-level-2', name: 'TOPIK I · Level 2', lv: [2] },
  { id: 'topik-level-3', name: 'TOPIK II · Level 3', lv: [3] },
  { id: 'topik-level-4', name: 'TOPIK II · Level 4', lv: [4] },
  { id: 'topik-level-5', name: 'TOPIK II · Level 5', lv: [5] },
  { id: 'topik-level-6', name: 'TOPIK II · Level 6', lv: [6] },
  { id: 'topik-1-all', name: 'TOPIK I · all (Levels 1–2)', lv: [1, 2] },
  { id: 'topik-2-all', name: 'TOPIK II · all (Levels 3–6)', lv: [3, 4, 5, 6] },
  { id: 'topik-all', name: 'All levels (1–6)', lv: [1, 2, 3, 4, 5, 6] },
];
/* 문법 290개 — 급수는 TOPIK 이 아니라 우리 단계(초급 · 중급 · 고급)다. TOPIK 급수를 지어 붙이지 않는다 */
const { SB_CATS } = await import('../sentences.js');
const { GRAMMAR_EN } = await import('../grammar-en.js');
const LVN = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const GR = SB_CATS.flatMap((c) => c.points.map((p) => ({ p, cat: c }))).filter(({ p }) => GRAMMAR_EN[p.id]);
/* 낱말 · 문법 내려받기 — 1 · 2급 파일만 로그인 없이(맛보기). 나머지는 /download/ 문(로그인한 사람만 받는다, 운영자 2026-10-19 「너무 무료로 다 풀면 안 돼 · A」).
   ⚠ 진짜 문이다(B) — 로그인해야 받는 파일은 사이트(downloads/)에 두지 않고 private-downloads/ 로 구워(저장소에 안 둔다) 액션 downloads-sync 가 Supabase 비공개 저장 칸에 올린다.
   로그인한 사람만 /download/ 에서 임시 주소를 받는다(db/add_downloads.sql). 낱말 원자료 자체(vocab/data)는 사이트 학습 화면이 쓰므로 공개 — 막는 것은 내려받기용 묶음 파일이다. */
const FREE = new Set(['topik-vocabulary-basic']);   // 국립국어원 자료만 담은 기본 목록 — 누구나. 우리가 쓴 뜻 · 예문이 든 풍부한 목록은 전부 로그인(운영자 2026-10-19 「나누기」)
const dl = (name, label) => (FREE.has(name) ? `<a href="/downloads/${name}${name.endsWith('-anki') ? '.txt' : '.csv'}" download>${label}</a>`
  : `<a href="/download/?f=/downloads/${name}${name.endsWith('-anki') ? '.txt' : '.csv'}" rel="nofollow">${label} <small>🔒 free account</small></a>`);
const cell = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
const clean = (s) => String(s ?? '').replace(/[\t\r\n]+/g, ' ').trim();
const ex = (w) => w.examples?.[0] || {};
const dirOf = (name) => (FREE.has(name) ? 'downloads' : 'private-downloads');   // 로그인해야 받는 파일은 사이트에 두지 않는다(B — 운영자 2026-10-19)
mkdirSync(join(ROOT, 'downloads'), { recursive: true });
mkdirSync(join(ROOT, 'private-downloads'), { recursive: true });
const counts = {};
for (const b of BAND) {
  const ws = ALL.filter((w) => b.lv.includes(w.level)).sort((x, y) => x.level - y.level || (y.freq || 0) - (x.freq || 0));
  counts[b.id] = ws.length;
  const head = ['Korean', 'Part of speech', 'English', 'Vietnamese', 'Japanese', 'Example (Korean)', 'Example (English)', 'TOPIK level'];
  const rows = ws.map((w) => [w.head, w.pos, w.en_simple || '', w.tr?.vi, w.tr?.ja, ex(w).ko, ex(w).en, w.level]);   // 영어 뜻 = 우리가 쓴 쉬운 영어(en_simple)
  // 엑셀이 한글을 깨지 않게 BOM
  writeFileSync(join(ROOT, dirOf(b.id), `${b.id}.csv`), '﻿' + [head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n');
  // Anki: 탭으로 나눈 글 — 앞면 = 한국어, 뒷면 = 뜻 · 예문. 가져올 때 「HTML 허용」을 켜면 줄바꿈 <br> 이 보인다
  const anki = ws.map((w) => [w.head, `${clean(w.en_simple)}${w.tr?.vi ? ` · ${clean(w.tr.vi)}` : ''}${w.tr?.ja ? ` · ${clean(w.tr.ja)}` : ''}<br>${clean(ex(w).ko)}<br>${clean(ex(w).en)}`, `${b.id}`].join('\t'));
  writeFileSync(join(ROOT, dirOf(`${b.id}-anki`), `${b.id}-anki.txt`), '#separator:tab\n#html:true\n#tags column:3\n' + anki.join('\n') + '\n');
}
/* 기본 목록(무료) — 한국어 낱말 · 품사 · 급수 · 출처. 국립국어원 자료만. 우리가 쓴 뜻 · 예문은 넣지 않는다 */
const SRC = 'National Institute of Korean Language: International Standard Curriculum (KOGL Type 1); Korean Learners Dictionary (CC BY-SA 2.0 KR)';
writeFileSync(join(ROOT, dirOf('topik-vocabulary-basic'), 'topik-vocabulary-basic.csv'), '\ufeff' + [['Korean', 'Part of speech', 'TOPIK level', 'Source'],
  ...ALL.slice().sort((x, y) => x.level - y.level || (y.freq || 0) - (x.freq || 0)).map((w) => [w.head, w.pos, w.level, SRC])].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n');
writeFileSync(join(ROOT, dirOf('korean-grammar-list'), 'korean-grammar-list.csv'), '\ufeff' + [['Grammar pattern', 'Level', 'Category', 'Meaning (English)', 'Form', 'Watch out', 'Example (Korean)'],
  ...GR.map(({ p, cat }) => [p.name, LVN[p.lv] || p.lv, cat.en, GRAMMAR_EN[p.id].desc, GRAMMAR_EN[p.id].form, GRAMMAR_EN[p.id].care, p.ex])].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n');
writeFileSync(join(ROOT, dirOf('korean-grammar-list-anki'), 'korean-grammar-list-anki.txt'), '#separator:tab\n#html:true\n#tags column:3\n' + GR.map(({ p }) => [p.name, `${clean(GRAMMAR_EN[p.id].desc)}${GRAMMAR_EN[p.id].form ? `<br>${clean(GRAMMAR_EN[p.id].form)}` : ''}<br>${clean(p.ex)}`, `grammar-${p.lv}`].join('\t')).join('\n') + '\n');
const li = (b) => `<tr><td>${b.name}</td><td>${counts[b.id].toLocaleString('en-US')}</td><td>${dl(b.id, 'CSV')}</td><td>${dl(b.id + '-anki', 'Anki')}</td></tr>`;
const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TOPIK Vocabulary List — Free CSV &amp; Anki Download (Levels 1–6) | CheesePotato</title>
<meta name="description" content="Free TOPIK vocabulary list for Levels 1–6: ${ALL.length.toLocaleString('en-US')} Korean words with English, Vietnamese and Japanese meanings and example sentences. Download as CSV or import into Anki.">
<link rel="canonical" href="https://everykoreans.com/topik-vocabulary-list/">
<!-- 생성물: node tools/build-downloads.mjs (build-pages 가 부른다). 손으로 고치지 않는다. -->
<script src="/gtm.js" async></script>
<script src="/analytics.js" defer></script>
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:title" content="TOPIK Vocabulary List — Free CSV & Anki Download">
<meta property="og:description" content="${ALL.length.toLocaleString('en-US')} TOPIK words, Levels 1–6, with meanings and examples. Free.">
<meta property="og:url" content="https://everykoreans.com/topik-vocabulary-list/">
<meta property="og:image" content="https://everykoreans.com/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<link rel="stylesheet" href="/vendor/pretendard.css">
<link rel="stylesheet" href="/page.css">
<style>.dl{width:100%;border-collapse:collapse;margin:14px 0}.dl th,.dl td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);font-size:15px}.dl td:nth-child(2){color:var(--ink-3)}.dl a{font-weight:700}</style>
</head>
<body>
<header class="hd"><div class="hd-in">
  <a href="/"><img src="/logo.png" alt=""><span>치즈감자 CheesePotato</span></a>
</div></header>
<main>
<h1>TOPIK vocabulary list — free download</h1>
<p>${ALL.length.toLocaleString('en-US')} Korean words for TOPIK Levels 1–6, each with a level. The <strong>basic list</strong> (Korean word, part of speech, level) is free to download — no account needed. The <strong>study lists</strong> below add English, Vietnamese and Japanese meanings and example sentences written by CheesePotato, as a spreadsheet (CSV) or an Anki deck; they need a free account (one click to sign up).</p>
<table class="dl"><thead><tr><th>Basic list (all levels)</th><th>Words</th><th>Spreadsheet</th></tr></thead><tbody><tr><td>Korean · part of speech · level</td><td>${ALL.length.toLocaleString('en-US')}</td><td>${dl('topik-vocabulary-basic', 'CSV')}</td></tr></tbody></table>
<h2>Study lists (free account)</h2>
<table class="dl"><thead><tr><th>Level</th><th>Words</th><th>Spreadsheet</th><th>Anki deck</th></tr></thead><tbody>
${BAND.map(li).join('\n')}
</tbody></table>
<h2>Grammar list</h2>
<p>${GR.length} Korean grammar patterns grouped as Beginner, Intermediate and Advanced (our own levels — not an official TOPIK grammar list), each with an English meaning, its form and an example sentence.</p>
<table class="dl"><tbody><tr><td>Korean grammar patterns</td><td>${GR.length}</td><td>${dl('korean-grammar-list', 'CSV')}</td><td>${dl('korean-grammar-list-anki', 'Anki')}</td></tr></tbody></table>
<p>Browse them online: <a href="/topik-grammar-list/">the full grammar list</a> · <a href="/sentence/">all grammar patterns with dialogues</a>.</p>
<h2>How to use</h2>
<ul>
  <li><strong>CSV</strong> opens in Excel, Google Sheets and Numbers (UTF-8, so Korean letters display correctly). Columns: Korean, part of speech, English, Vietnamese, Japanese, example (Korean and English), level.</li>
  <li><strong>Anki</strong>: File → Import → choose the .txt file. Front is the Korean word; back is the meanings and the example. Column 3 becomes a tag (the level). Make sure “Allow HTML in fields” is on if Anki asks.</li>
  <li>Prefer to study online? Browse the same words by topic: <a href="/topik1-words/">TOPIK I words</a> · <a href="/topik2-words/">TOPIK II words</a> · <a href="/dictionary/">dictionary</a>.</li>
</ul>
<h2>About this list</h2>
<p>Levels follow the National Institute of Korean Language’s <em>International Standard Curriculum for Korean Language Education</em> (국립국어원 「국제 통용 한국어 표준 교육과정」, Korea Open Government License Type 1). Korean headwords and parts of speech draw on the National Institute of Korean Language’s Korean Learners’ Dictionary (한국어기초사전, CC BY-SA 2.0 KR). English, Vietnamese and Japanese meanings and example sentences in the study lists were written by CheesePotato. The list is a study aid and is not an official TOPIK word list. Free for personal and classroom use — please keep this credit if you share it.</p>
<div class="next">
  <h3>Learn these words with practice</h3>
  <p>Flashcards, quizzes and example sentences for every word — free.</p>
  <div class="btns">
    <a class="btn main" href="/?utm_source=tool&amp;utm_medium=topik_vocab_list#words">Study words — free →</a>
    <a class="btn sub" href="/en/topik-reading/">Free TOPIK practice</a>
  </div>
</div>
<p class="ft">Made by a Korean teacher · <a href="/about.html">About</a> · <a href="/privacy.html">Privacy</a></p>
</main>
</body>
</html>
`;
mkdirSync(join(ROOT, 'topik-vocabulary-list'), { recursive: true });
writeFileSync(join(ROOT, 'topik-vocabulary-list', 'index.html'), page);
console.log(`TOPIK 낱말 내려받기 — 파일 ${BAND.length * 2}개 → downloads/ · 쪽 1개 → topik-vocabulary-list/ (낱말 ${ALL.length}개)`);

/* TOPIK 문법 목록 쪽(운영자 2026-10-15 「TOPIK 노출 ③」) — 문법 290개를 우리 단계(초급 · 중급 · 고급)별 표로 한 쪽에. 급수는 TOPIK 공식이 아님을 쓴다. */
const GR_BY = ['beginner', 'intermediate', 'advanced'].map((lv) => ({ lv, name: LVN[lv], list: GR.filter(({ p }) => p.lv === lv) })).filter((g) => g.list.length);
const he = (x) => String(x ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const grRow = ({ p }) => `<tr><td><a href="/sentence/${p.id}.html">${he(p.name)}</a></td><td>${he(GRAMMAR_EN[p.id].desc)}</td><td lang="ko">${he(p.ex)}</td></tr>`;
const gpage = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TOPIK Grammar List — ${GR.length} Korean Grammar Patterns, Free CSV &amp; Anki | CheesePotato</title>
<meta name="description" content="${GR.length} Korean grammar patterns for TOPIK preparation, grouped Beginner, Intermediate and Advanced, each with an English meaning and an example sentence. Free CSV and Anki download.">
<link rel="canonical" href="https://everykoreans.com/topik-grammar-list/">
<!-- 생성물: node tools/build-downloads.mjs (build-pages 가 부른다). 손으로 고치지 않는다. -->
<script src="/gtm.js" async></script>
<script src="/analytics.js" defer></script>
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta property="og:title" content="TOPIK Grammar List — ${GR.length} Korean Grammar Patterns">
<meta property="og:description" content="Beginner to advanced Korean grammar with meanings and examples. Free CSV and Anki download.">
<meta property="og:url" content="https://everykoreans.com/topik-grammar-list/">
<meta property="og:image" content="https://everykoreans.com/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<link rel="stylesheet" href="/vendor/pretendard.css">
<link rel="stylesheet" href="/page.css">
<style>.dl{width:100%;min-width:0;border-collapse:collapse;margin:14px 0}.dl th,.dl td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);font-size:15px;vertical-align:top}.dl td:first-child{font-weight:700;white-space:nowrap}.dl td:last-child{color:var(--ink-3)}.dl td{overflow-wrap:anywhere}@media(max-width:640px){.dl{table-layout:fixed}.dl td:last-child,.dl th:last-child{display:none}.dl th:first-child,.dl td:first-child{white-space:normal;width:36%}.dl th:nth-child(2){width:64%}.dl th,.dl td{padding:10px 6px}}</style>
</head>
<body>
<header class="hd"><div class="hd-in">
  <a href="/"><img src="/logo.png" alt=""><span>치즈감자 CheesePotato</span></a>
</div></header>
<main>
<h1>TOPIK grammar list — ${GR.length} patterns, free download</h1>
<p>${GR.length} Korean grammar patterns you meet on the way to TOPIK, grouped as ${GR_BY.map((g) => `${g.name} (${g.list.length})`).join(', ')}. Each has an English meaning and an original example sentence; tap a pattern for its full page with dialogues. The levels are our own teaching levels — this is <strong>not</strong> an official TOPIK grammar list.</p>
<p>${dl('korean-grammar-list', 'Download CSV')} · ${dl('korean-grammar-list-anki', 'Download Anki deck')} · <a href="/topik-vocabulary-list/">TOPIK vocabulary list</a></p>
${GR_BY.map((g) => `<h2>${g.name} — ${g.list.length} patterns</h2>
<table class="dl"><thead><tr><th>Pattern</th><th>Meaning</th><th>Example</th></tr></thead><tbody>
${g.list.map(grRow).join('\n')}
</tbody></table>`).join('\n')}
<div class="next">
  <h3>Practice these patterns</h3>
  <p>Fill-in, sentence building and conjugation drills for every grammar point — free.</p>
  <div class="btns">
    <a class="btn main" href="/?utm_source=tool&amp;utm_medium=topik_grammar_list#learn/sentence">Practice grammar — free →</a>
    <a class="btn sub" href="/en/topik-reading/">Free TOPIK practice</a>
  </div>
</div>
<p class="ft">Made by a Korean teacher · <a href="/about.html">About</a> · <a href="/privacy.html">Privacy</a></p>
</main>
</body>
</html>
`;
mkdirSync(join(ROOT, 'topik-grammar-list'), { recursive: true });
writeFileSync(join(ROOT, 'topik-grammar-list', 'index.html'), gpage);
console.log(`TOPIK 문법 목록 쪽 1개 → topik-grammar-list/ (문법 ${GR.length}개)`);
