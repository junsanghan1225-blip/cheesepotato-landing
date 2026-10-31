// 월호 학습지 한 호 만들기 — node tools/build-issue.mjs 2027-01 [--out 폴더] [--ver v0.1]
// 틀: docs/issues/<호>.json. 문법 쪽은 worksheet/pro 의 설명 · 연습 · 정답을 모으고, 계획표 · 생활 한국어 · 단어 · 쓰기 · 점검 · 복습 · 달력은 틀의 글로 만든다.
// 듣기 녹음은 운영자가 직접 한다(2026-10-31) — 녹음할 글 목록을 docs/issues/<호>-recording.md 로 같이 만든다.
// 파는 파일이라 PDF 는 저장소에 올리지 않는다(books-out/).
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const ID = args.find((a) => !a.startsWith('--') && a !== opt('--out') && a !== opt('--ver'));
if (!ID) { console.error('쓰는 법: node tools/build-issue.mjs 2027-01 [--out 폴더] [--ver v0.1]'); process.exit(1); }
const I = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/issues/${ID}.json`), 'utf8'));
const outDir = path.resolve(opt('--out', path.join(ROOT, 'books-out')));
const VER = opt('--ver', 'v0.1');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const list = JSON.parse(read('worksheet/list.json'));
const qrLib = createRequire(import.meta.url)(path.join(ROOT, 'qrcode-lib.js'));
const SITE = 'https://everykoreans.com';
const MON = `${I.year}년 ${I.month}월호`;
const qr = (url, px) => { const q = qrLib(0, 'M'); q.addData(url); q.make(); return `<div class="qr" style="width:${px}mm;height:${px}mm">${q.createSvgTag({ cellSize: 3, margin: 0, scalable: true })}</div>`; };
const utm = (page, content) => `${SITE}${page}?utm_source=issue&utm_medium=qr&utm_campaign=${I.id}&utm_content=${encodeURIComponent(content)}`;

/* ── 문법 8개: 설명 · 연습 · 정답 ── */
const CSS0 = /<style>([\s\S]*?)<\/style>/.exec(read(`worksheet/pro/${I.grammar[0]}.html`))[1];
const sections = (h) => [...h.matchAll(/<section class="ws-p[^"]*">[\s\S]*?<\/section>/g)].map((m) => m[0]);
const body = [], keys = [], gl = [];
I.grammar.forEach((id, i) => {
  const x = list.find((k) => k.id === id); if (!x) throw new Error(`${id}: 목록에 없다`);
  const s = sections(read(`worksheet/pro/${id}.html`));
  if (s.length < 3 || /ws-lock/.test(s[1])) throw new Error(`${id}: 전체 쪽이 아니다`);
  const box = `<div class="is-qr">${qr(utm('/', `listen-${id}`), 16)}<div><b>듣고 따라 하기 · Listen &amp; repeat</b><small>QR 을 찍으면 이 문법의 예문 녹음이 나와요. · Scan to hear the examples.</small></div></div>`;
  body.push(s[0].replace(/(<h2>)/, `${box}$1`), s[1]);
  keys.push(s[2]); gl.push(x);
});
const gn = gl.length;

/* ── 쪽 만들기 ── */
const pageHead = (t, sub) => `<h1>${t}${sub ? ` <small>${sub}</small>` : ''}</h1>`;
const cover = `<section class="ws-p bd-cover"><div class="bd-top"><span>CHEESEPOTATO MONTHLY</span><span>EVERYKOREANS</span></div>
<p class="bd-k">${I.lvKo} · ${I.lvEn}</p><h1>치즈감자 월간 학습지<br><small>${MON} · 창간호</small></h1>
<p class="bd-theme">이달의 주제 · ${I.theme.ko}<br><span>${I.theme.en}</span></p>
<p class="bd-s">한 달 15분씩. 문법 ${gn}개 · 단어 ${I.words.length}개 · 생활 한국어 · 쓰기 · 월말 점검. 인쇄해서 쓰는 PDF 학습지예요.<br>A month of 15-minute lessons: ${gn} grammar points, ${I.words.length} words, daily-life Korean, writing, and a month-end check. Print it and write in it.</p>
<p class="bd-by">에브리코리안즈 · Everykoreans</p></section>`;
const how = `<section class="ws-p">${pageHead('이렇게 쓰세요', 'How to use')}
<ul class="ws-ex"><li>A4 로 인쇄해요. 하루 15분, 순서대로 해요. · Print on A4, 15 minutes a day, in order.</li>
<li>문법 쪽 위의 QR 은 듣기용이에요. 소리를 듣고 따라 한 뒤에 연습을 풀어요. · The QR on each grammar page is for listening: hear it, repeat it, then do the practice.</li>
<li>정답은 맨 뒤 「정답 모음」에 있어요. 풀기 전에 보지 않아요. · Answers are at the back. Don't peek before you try.</li>
<li>한 달이 끝나면 「월말 점검」을 풀고 「성적표」를 보세요. · At month end, take the check and read your scorecard.</li>
<li>달력의 도장 칸에 오늘 한 것을 표시해요. 다 채우면 완주 배지가 있어요. · Mark each day on the calendar; fill it for the completion badge.</li></ul>
<h2>문제에 대해 · About the questions</h2>
<p>모든 문제는 치즈감자가 직접 만든 것이고 실제 시험 기출이 아니에요. 이 학습지는 시험 기관과 관계가 없어요. · All questions are original and are not past exam questions. This is an independent study aid.</p>
<h2>이용 안내 · License</h2>
<p>© Everykoreans (에브리코리안즈). 본인 학습용으로 인쇄해 쓰세요. 파일의 재판매 · 공유 · 게시는 하지 말아 주세요. · For your own study only; please do not resell, share or post.</p></section>`;
const planHtml = `<section class="ws-p">${pageHead('이번 달 계획표', 'Monthly plan')}
<table class="is-t"><thead><tr><th>주</th><th>할 일</th><th>문법</th><th>단어</th><th>마무리</th></tr></thead><tbody>${I.plan.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
<h2>차례 · Contents</h2><ol class="is-toc">${gl.map((x) => `<li>${esc(x.n)}</li>`).join('')}</ol>
<p class="is-small">그다음: 생활 한국어 → 단어 ${I.words.length}개 → 쓰기 → 월말 점검 → 성적표 → 기초 복습 → 달력 → 정답 모음<br>Then: daily-life Korean → words → writing → month-end check → scorecard → basics review → calendar → answers.</p></section>`;
const L = I.life;
const lifeHtml = `<section class="ws-p">${pageHead('생활 한국어', 'Daily-life Korean')}
<div class="is-qr">${qr(utm('/', 'listen-life'), 16)}<div><b>듣고 따라 하기 · Listen &amp; repeat</b><small>대화 전체 녹음 · The whole dialogue.</small></div></div>
<div class="ws-dlg">${L.dialog.map(([w, t]) => `<p>${w}: ${esc(t)}</p>`).join('')}</div>
<h2>이 말을 외워요 · Key phrases</h2><table class="is-t">${L.expr.map(([k, e]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(e)}</td></tr>`).join('')}</table>
<h2>내 말로 바꿔 보세요 · Say it your way</h2>${L.say.map((t) => `<p class="is-line">${esc(t)}</p>`).join('')}</section>`;
const W = JSON.parse(read('vocab/data/topik1.json')); const wm = new Map(W.map((w) => [w.head, w]));
const words = I.words.map((h) => { const w = wm.get(h); if (!w) throw new Error(`단어 ${h} 없음`); return w; });
const wordPages = []; for (let i = 0; i < words.length; i += 10) {
  wordPages.push(`<section class="ws-p">${pageHead(`이달의 단어 ${i + 1}–${Math.min(i + 10, words.length)}`, 'Words')}
<table class="is-t is-w"><thead><tr><th>단어</th><th>뜻</th><th>따라 쓰기 ①</th><th>따라 쓰기 ②</th></tr></thead><tbody>${words.slice(i, i + 10).map((w) => `<tr><td><b>${esc(w.head)}</b></td><td>${esc(w.en_simple || w.en)}</td><td></td><td></td></tr>`).join('')}</tbody></table>
<h2>예문 · Example</h2><ul class="ws-ex">${words.slice(i, i + 10).map((w) => `<li>${esc(w.examples?.[0]?.ko || '')}</li>`).join('')}</ul></section>`);
}
const wordsCheck = `<section class="ws-p">${pageHead('단어 확인', 'Word check')}<p>뜻을 가리고 한국어를 말해 보세요. 한 번에 맞히면 ○ 를 그려요. · Cover the meaning and say the Korean. Draw ○ if you got it first time.</p>
<table class="is-t is-c"><tbody>${(() => { const r = []; for (let i = 0; i < words.length; i += 4) r.push(`<tr>${words.slice(i, i + 4).map((w) => `<td>${esc(w.en_simple || w.en)}<span>○</span></td>`).join('')}</tr>`); return r.join(''); })()}</tbody></table></section>`;
const goji = (rows) => `<div class="is-goji">${Array.from({ length: rows }, () => '<div>' + '<i></i>'.repeat(12) + '</div>').join('')}</div>`;
const writeHtml = `<section class="ws-p">${pageHead('쓰기 연습', 'Writing')}
<p><b>제목: 나의 ${I.year}년 계획</b> · My plans for ${I.year}</p>
<p>이번 달 문법 중 세 개 이상을 써서 4~5문장을 써 보세요. · Write 4–5 sentences using at least three of this month's grammar points.</p>
<p class="is-small">힌트 · Hints: 저는 올해 ~(으)ㄹ 거예요. / ~고 싶어요. / ~아/어야 해요. / ~기로 했어요.</p>${goji(10)}
<p class="is-small">점검 · Check: ☐ 문법 3개 이상 ☐ 띄어쓰기 ☐ 마침표(.)</p></section>`;
const mc = (q, i, off = 0) => `<div class="is-q"><p><b>${i + 1}.</b> ${esc(q[0])}</p><p class="is-o">${q[1].map((o, k) => `<span>${'①②③④'[k]} ${esc(o)}</span>`).join('')}</p></div>`;
const testHtml = `<section class="ws-p">${pageHead('월말 점검', 'Month-end check')}<p>10문제 · 15분 · 정답을 보지 않고 풀어요. · 10 questions, 15 minutes, no peeking.</p>${I.test.map((q, i) => mc(q, i)).join('')}<p class="is-small">내 점수 Score: ______ / 10</p></section>`;
const bandHtml = `<section class="ws-p">${pageHead('성적표', 'Scorecard')}<p>맞은 개수에 맞는 줄을 보세요. · Find your row.</p>
<table class="is-t">${I.bands.map(([a, b, t, m]) => `<tr><td><b>${a}–${b}</b></td><td><b>${esc(t)}</b><br>${esc(m)}</td></tr>`).join('')}</table>
<h2>틀린 문제로 돌아가기 · Where to go back</h2><table class="is-t is-w">${I.test.map((q, i) => `<tr><td>${i + 1}번</td><td>${esc(q[3])}</td><td>☐</td></tr>`).join('')}</table></section>`;
const reviewHtml = `<section class="ws-p">${pageHead('기초 복습', 'Basics review')}<p>창간호는 지난 호가 없어서 초급 기초를 복습해요. 2호부터는 지난 호에서 틀리기 쉬운 문제를 다시 내요. · Issue 1 reviews the basics; from issue 2, this page re-asks the tricky ones from earlier issues.</p>${I.review.map((q, i) => mc(q, i)).join('')}</section>`;
/* 달력 */
const first = new Date(Date.UTC(I.year, I.month - 1, 1)).getUTCDay(), dim = new Date(Date.UTC(I.year, I.month, 0)).getUTCDate();
const cells = []; for (let i = 0; i < first; i++) cells.push('<td></td>'); for (let d = 1; d <= dim; d++) cells.push(`<td><b>${d}</b><span>○</span></td>`); while (cells.length % 7) cells.push('<td></td>');
const cal = []; for (let i = 0; i < cells.length; i += 7) cal.push(`<tr>${cells.slice(i, i + 7).join('')}</tr>`);
const badge = `<svg viewBox="0 0 120 120" width="34mm" height="34mm"><circle cx="60" cy="60" r="56" fill="none" stroke="#1B1512" stroke-width="3"/><circle cx="60" cy="60" r="48" fill="#FFF3D6" stroke="#E1682B" stroke-width="2"/><text x="60" y="52" text-anchor="middle" font-size="13" font-weight="800" fill="#1B1512">${I.year}.${String(I.month).padStart(2, '0')}</text><text x="60" y="72" text-anchor="middle" font-size="16" font-weight="800" fill="#E1682B">완주!</text><text x="60" y="90" text-anchor="middle" font-size="9" fill="#1B1512">CheesePotato</text></svg>`;
const calHtml = `<section class="ws-p">${pageHead(`${I.year}년 ${I.month}월 달력`, 'Calendar')}<p>오늘 한 날은 ○ 에 도장을 찍거나 칠해요. · Mark each day you studied.</p>
<table class="is-cal"><thead><tr>${['일', '월', '화', '수', '목', '금', '토'].map((d) => `<th>${d}</th>`).join('')}</tr></thead><tbody>${cal.join('')}</tbody></table>
<div class="is-bd">${badge}<p>20일 이상 채웠으면 이 배지를 색칠하고 사진을 찍어 SNS 에 올려 보세요. #치즈감자 #월간학습지<br>20 days or more? Colour the badge and share it.</p></div></section>`;
const keysHead = `<section class="ws-p">${pageHead('정답 모음', 'Answer keys')}<h2>월말 점검 · Month-end check</h2><p>${I.test.map((q, i) => `${i + 1}. ${'①②③④'[q[2] - 1]}`).join(' &nbsp; ')}</p><h2>기초 복습 · Basics review</h2><p>${I.review.map((q, i) => `${i + 1}. ${'①②③④'[q[2] - 1]}`).join(' &nbsp; ')}</p><p>문법 연습의 정답은 다음 쪽들에 있어요. · Grammar answers follow.</p></section>`;
const EXTRA = `.bd-cover{display:flex;flex-direction:column;min-height:260mm}.bd-top{display:flex;justify-content:space-between;font-size:12px;letter-spacing:.2em;font-weight:700;border-bottom:2px solid #1B1512;padding-bottom:8px}
.bd-k{margin-top:55mm!important;font-size:22px!important;font-weight:800;color:#E1682B}.bd-cover h1{font-size:46px!important;line-height:1.15;margin:6px 0 14px}.bd-cover h1 small{display:block;font-size:30px;font-weight:700;margin-top:12px}
.bd-theme{font-size:22px!important;font-weight:800;border-left:4px solid #E1682B;padding-left:12px;margin:16px 0!important}.bd-theme span{font-size:14px;font-weight:600}
.bd-s{font-size:15px!important;line-height:1.6;max-width:150mm}.bd-by{margin-top:auto!important;border-top:2px solid #1B1512;padding-top:10px;font-size:18px!important;font-weight:700}
body{background:#fff}.ws-p{border:0;border-radius:0;padding:0;margin:0;break-after:page}.hd,.ft{display:none}
h1 small{font-size:.55em;font-weight:600;color:#6b6055;margin-left:6px}
.is-qr{display:flex;gap:10px;align-items:center;border:1px solid #1B1512;border-radius:8px;padding:6px 10px;margin:0 0 10px}.is-qr .qr svg{width:100%;height:100%}.is-qr small{display:block;font-size:11px;color:#6b6055}
.is-t{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0}.is-t th,.is-t td{border:1px solid #1B1512;padding:7px 8px;text-align:left;vertical-align:top}.is-t th{background:#FFF3D6}
.is-w td{height:11mm}.is-c td{height:20mm;width:25%;text-align:center;font-weight:700}.is-c span{display:block;font-size:20px;font-weight:400;color:#ccc}
.is-toc{columns:2;font-size:14px;line-height:1.9}.is-small{font-size:11.5px;color:#6b6055;line-height:1.6}.is-line{border-bottom:1px solid #1B1512;padding:10px 0 4px;font-size:14px}
.is-q{margin:8px 0;break-inside:avoid}.is-q p{margin:2px 0;font-size:14px}.is-o span{display:inline-block;width:24%;font-size:13px}
.is-goji{margin:10px 0}.is-goji div{display:flex}.is-goji i{display:block;width:13.2mm;height:13.2mm;border:1px solid #1B1512;margin:-0.5px 0 0 -0.5px}
.is-cal{width:100%;border-collapse:collapse;table-layout:fixed;margin:10px 0}.is-cal th,.is-cal td{border:1px solid #1B1512;text-align:center}.is-cal th{background:#FFF3D6;padding:5px}.is-cal td{height:24mm;vertical-align:top;font-size:13px;padding:3px}.is-cal td span{display:block;font-size:22px;color:#ccc;margin-top:4mm}
.is-bd{display:flex;gap:14px;align-items:center;margin-top:10px}.is-bd p{font-size:13px}`;
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>치즈감자 월간 학습지 ${MON} 창간호</title><link rel="stylesheet" href="/vendor/pretendard.css"><link rel="stylesheet" href="/page.css"><style>${CSS0}\n${EXTRA}</style></head>
<body><main class="ws-doc" style="max-width:none">${cover}${how}${planHtml}${lifeHtml}${body.join('\n')}${wordPages.join('')}${wordsCheck}${writeHtml}${testHtml}${bandHtml}${reviewHtml}${calHtml}${keysHead}${keys.join('\n')}</main></body></html>`;

/* ── 녹음 목록(운영자가 직접 녹음) ── */
const ex = (id) => [...read(`worksheet/pro/${id}.html`).matchAll(/<ul class="ws-ex">([\s\S]*?)<\/ul>/g)].flatMap((m) => [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((k) => k[1].replace(/<[^>]+>/g, '')));
const rec = [`# ${MON} 녹음 목록`, '', '운영자가 직접 녹음할 글이에요. 파일 이름은 아래 「파일」 칸 그대로(mp3)로 해 주세요. 천천히 또박또박, 한 줄 사이에 한 박자 쉬어요.', '',
  '## 1. 생활 한국어 대화 (파일: listen-life.mp3)', ...L.dialog.map(([w, t]) => `- ${w}: ${t}`), '',
  ...gl.flatMap((x) => [`## 문법 ${x.id} ${x.n} (파일: listen-${x.id}.mp3)`, ...ex(x.id).map((t) => `- ${t}`), '']),
  `## 단어 ${words.length}개 (파일: words-${I.id}.mp3, 한 단어씩 한 박자 쉬고)`, words.map((w) => w.head).join(' · '), ''].join('\n');
fs.writeFileSync(path.join(ROOT, `docs/issues/${ID}-recording.md`), rec);

const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/__issue.html') { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(html); return; }
  const mime = { '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.png': 'image/png' };
  fs.readFile(path.join(ROOT, u), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': mime[path.extname(u)] || 'application/octet-stream' }); r.end(d); });
}).listen(0);
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
const browser = await chromium.launch(); const pg = await browser.newPage();
await pg.goto(`http://localhost:${srv.address().port}/__issue.html`, { waitUntil: 'networkidle' });
await pg.evaluate(() => document.fonts.ready);
fs.mkdirSync(outDir, { recursive: true });
const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const file = path.join(outDir, `에브리코리안즈_월간학습지_${I.no}_${I.year}년${I.month}월호창간호_본문_${VER}_${date}.pdf`);
await pg.pdf({ path: file, format: 'A4', printBackground: true, displayHeaderFooter: true, margin: { top: '12mm', bottom: '16mm', left: '12mm', right: '12mm' }, headerTemplate: '<span></span>',
  footerTemplate: `<div style="width:100%;font-size:8px;color:#8a7f72;padding:0 12mm;display:flex;justify-content:space-between;font-family:sans-serif"><span>© Everykoreans · CheesePotato Monthly ${MON} · For your own study. Do not resell or share.</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>` });
await browser.close(); srv.close();
const pages = (fs.readFileSync(file).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`${MON} — ${pages}쪽 · ${(fs.statSync(file).size / 1048576).toFixed(1)}MB → ${file}`);
