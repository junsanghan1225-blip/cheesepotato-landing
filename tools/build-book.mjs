#!/usr/bin/env node
/* 책 틀 — 우리 학습지 자료로 인쇄용 책 PDF 를 찍는다(운영자 2026-10-17 「정말 책처럼 — 표지 디자인부터 속지 · 목차까지」, 계획 docs/plans/books.md).
   node tools/build-book.mjs <책 id> [--out 폴더] [--review]   docs/books/<id>.json + docs/worksheets/*.json → <out>/<id>/interior.pdf · cover-spread.pdf · front-cover.png
   - interior.pdf : 속표지 · 판권면 · 머리말 · 쓰는 법 · 목차 · 단원 · 정답 · 찾아보기 · 메모(총 쪽수가 짝수가 되게). B5 182×257mm, 안쪽 여백이 넓은 좌우 쪽.
   - cover-spread.pdf : 뒤표지 + 책등 + 앞표지 한 장(재단 여유 3mm). 책등 너비는 쪽수 × 종이 두께로 계산(인쇄소가 정해 주는 값으로 다시 계산할 것).
   - --theme classic : 「수학의 정석」풍 판(운영자 2026-10-17 「수학의 정석처럼 깔끔하게」) — 남색 한 가지 · 핵심 정리 / 참고 / 연습 이름표 · 단원은 쪽 맨 위에서 바로 시작(빈 표지 쪽 없음). 결과는 <out>/<id>-classic/.
   - --digital : 파는 PDF 판 — 판권면의 출판사 신고번호 · ISBN · 발행일 자리표시를 빼고 「디지털판」으로 적는다. 앞표지를 첫 쪽으로 붙이는 것은 scratch 병합(pdf-lib) 단계.
   - --review : 검수본(interior-review.pdf) + 같은 내용의 글 판 review-text.md(다른 AI · 사람이 읽고 검사하기 쉽게 — 출처 · 블록 종류 · 정답 포함) — 쪽 위에 「REVIEW COPY」, 칸마다 빨간 출처 표시(학습지 id · §번호 — 「고칠 곳」을 말하면 바로 원본을 찾는다) + 맨 끝 검수 체크표. 운영자 2026-10-17 「검수는 내가 다 한다」.
   - 목차의 쪽 번호는 블록(속표지 · 각 단원 …)을 따로 찍어 쪽수를 세어 더한 값이다(PDF 안의 /Type /Page 수).
   만든 PDF 는 파는 파일이라 저장소에 두지 않는다(out 기본값 books-out/ 은 .gitignore). 문장은 전부 우리 학습지(창작) — 기출 아님.
   브라우저는 smoke.mjs 처럼 PLAYWRIGHT_PATH · CHROMIUM_PATH 로 바꿀 수 있다. */
import { parseTwData, twChartSvg } from './lib/tw-chart.mjs';
import fs from 'node:fs';
import os from 'node:os';
import { logoSvg } from './brand-logo.mjs';
import { createRequire } from 'node:module';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const args = process.argv.slice(2);
const bookId = args.find((a) => !a.startsWith('--'));
const REVIEW = args.includes('--review');
/* --digital : 파는 PDF(전자책) — 종이책 자리표시(출판사 신고번호 · ISBN · 발행일 · 바코드)를 빼고 「디지털판」으로 적는다(운영자 2026-10-18 「책 PDF 최종」). */
/* --yes24 --krw 9,900 : 예스24 용 파일(운영자 2026-10-30 「원화로 바꾸자」) — 정가를 원화로 판권쪽 · 뒷표지에 찍는다(달러 정가는 Polar · KDP 판). 예스24 가 DRM 을 직접 씌우므로 이 파일에는 보호(protect-pdf)를 걸지 않는다. */
const YES24 = args.includes('--yes24');
const KRW = YES24 && args.includes('--krw') ? args[args.indexOf('--krw') + 1] : '';
if (YES24 && !/^\d{1,3}(,\d{3})*$/.test(KRW)) { console.error('쓰는 법: --yes24 --krw 9,900'); process.exit(1); }
const DIGITAL = args.includes('--digital') || args.includes('--kdp') || YES24;
/* --epub : 같은 내용으로 ePub 3(글자가 화면에 맞게 흐르는 판)도 한 부 — 예스24 · 아마존 같은 전자책 판매처용. 찾아보기 · 메모(쪽 번호 · 인쇄 줄)는 빼고 구매자 혜택 쪽은 넣는다. */
/* --kdp : 아마존 KDP 전용 ePub(2026-10-28 KDP 거절 「책이 Kindle 앱 밖의 도구(브라우저 · 종이)가 필요한 상호작용형」). 책 틀의 kdp 칸으로 제목 · 머리말 · 쓰는 법을 바꾸고,
   QR · 웹 안내 · 독자 혜택 · 쓰기 줄을 빼고, 연습은 문제 옆에 정답을 바로 보여 준다 — Kindle 안에서 읽기만으로 끝나는 책. */
const KDP = args.includes('--kdp');
const openAns = (a) => /^\(?\s*(your own|answers? vary|내 문장)/i.test(String(a || '')) || !String(a || '').trim();   // 정답이 따로 없는 「내 문장」 문항
const EPUB = args.includes('--epub') || KDP;
/* --fxl : 쪽 그대로 보이는 고정형 ePub(쪽마다 그림 한 장) — PDF 와 같은 디자인이 필요한 전자책 판매처용. 글이 흐르는 ePub 와 달리 글자 크기 · 검색이 안 된다. */
const FXL = args.includes('--fxl');
const EPUBVER = args.includes('--ver') ? args[args.indexOf('--ver') + 1] : '';   // 판권면에 「파일 버전」 한 줄 — 어느 파일을 열었는지 구분하려고
const outDir = path.resolve(ROOT, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'books-out');
if (!bookId) { console.error('사용: node tools/build-book.mjs <책 id> [--out 폴더]   (책 틀: docs/books/<id>.json)'); process.exit(1); }

const B = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/books/${bookId}.json`), 'utf8'));
if (YES24) { B.isbnPrice = `${KRW}원`; if (B.back) B.back.price = `정가 ${KRW}원`; }   // 예스24판 — 정가를 원화로
if (KDP) {
  if (!B.kdp) throw new Error(`${bookId}: 책 틀에 kdp 칸이 없다(제목 · 부제 · 머리말 · 쓰는 법 · 저자의 말 — KDP 판 글)`);
  if (B.kdp.coverLevel) B.coverLevel = { ...B.coverLevel, ...B.kdp.coverLevel };
  for (const k of ['title', 'sub', 'series', 'preface', 'howto', 'authorNote', 'authorBio']) if (B.kdp[k]) B[k] = B.kdp[k];
  delete B.bonus; B.web = ''; B.noQr = true;
  /* 쓰기 · 연필 같은 말을 KDP 판 글로 바꾼다(책 틀 kdp.replace — 원문 그대로를 찾아 바꿈). 하나라도 못 찾으면 틀린 것이라 멈춘다. */
  const pairs = Object.entries(B.kdp.replace || {}), used = new Set();
  const walk = (v) => typeof v === 'string' ? pairs.reduce((t, [a, b]) => (t.includes(a) ? (used.add(a), t.split(a).join(b)) : t), v) : Array.isArray(v) ? v.map(walk) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'kdp' ? x : walk(x)])) : v;
  for (const k of Object.keys(B)) if (k !== 'kdp') B[k] = walk(B[k]);
  const miss = pairs.filter(([a]) => !used.has(a)); if (miss.length) throw new Error(`kdp.replace 에서 못 찾은 글: ${miss.map(([a]) => a.slice(0, 40)).join(' | ')}`);
}
const THEME = args.includes('--theme') ? args[args.indexOf('--theme') + 1] : (B.theme || 'brand');
const CLASSIC = THEME === 'classic';
/* 레벨별 시리즈 색 · 마스코트(표지 · 부 속표지 · 대화 표지가 같이 쓴다) */
const { potatoLevel, cheeseLevel } = await import(path.join(ROOT, 'levels.js'));
const LV = B.coverLevel;
/* 속지 색만 표지와 다르게 하고 싶은 책(운영자 2026-10-26 「표지색만」): 책 틀의 innerLevel {bg, bg2} 가 있으면 속지 강조색은 그 값, 표지 · 책등은 coverLevel */
const LVI = LV && B.innerLevel ? { ...LV, ...B.innerLevel } : LV;
const lvMascot = LV ? (LV.mascot[0] === 'cheese' ? cheeseLevel(LV.mascot[1]) : potatoLevel(LV.mascot[1])).icon : '';
const LVG = ['#EFE6CB', '#D2BC86', '#A8915C'];
/* 문제은행 단원 「w51:2」 = TOPIK II 쓰기 51번의 2번째 10문항(topik-writing.js). 학습지 JSON 대신 이 자리에서 단원 모양으로 만든다. */
const BANKQ = { 51: ['Practical Text Completion', '실용문 완성', 'Fill each blank with one sentence that fits the text and its style.', '각 빈칸에 지문의 문체에 맞는 한 문장을 써요'], 52: ['Explanatory Text Completion', '설명문 완성', 'Fill each blank with one sentence in the -(느)ㄴ다 style.', '각 빈칸에 -(느)ㄴ다체로 한 문장을 써요'], 53: ['Describing Data', '자료 설명하기', 'Write 200–300 characters describing the data.', '자료를 보고 200~300자로 써요'], 54: ['Argumentative Essay', '논술', 'Write 600–700 characters giving your own view.', '자신의 생각을 600~700자로 써요'] };
const TWM = B.needTW || B.parts.some((p) => p.units.some((u) => /^(w\d\d:|g\d\d-)/.test(u))) ? await import(path.join(ROOT, 'topik-writing.js')) : null;
const TW = TWM ? TWM.TW_ITEMS : [];
const bankSheet = (id) => {
  const [, q, n] = id.match(/^w(\d\d):(\d+)$/).map(Number); const L = BANKQ[q]; const chunk = TW.filter((x) => x.q === q).slice((n - 1) * 10, n * 10);
  return { id, title: { en: `Q${q} · ${L[0]} · Set ${n}`, ko: `${q}번 · ${L[1]} · ${n}세트` }, sub: { en: L[2], ko: L[3] },
    sections: chunk.map((x, i) => ({ type: 'writing', raw: x, title: { en: `${(n - 1) * 10 + i + 1}. ${x.title}`, ko: '' }, items: [{ q: x.title, a: x.blanks ? x.blanks.map((b) => `${b.mark} ${b.answers[0]}`).join(' ') : x.model }] })) };
};
/* 유형 묶음 「g51-recruit」 = B.groups 에 적은 문항 id 들(유형별로 나눈 책, 운영자 2026-10-18 「유형별로 나누고 유형마다 안내를」) */
const grpNo = {};   // 유형 묶음 안 문제 번호는 책 순서대로 이어서(51번 1~50) — 계획표 · 정답과 같은 번호
const workedItem = (q) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/writing-book/extras.json'), 'utf8'))[q]?.worked?.item; } catch { return undefined; } };   // EXTRAS 는 아래에서 만들어져서 여기선 직접 읽는다
const groupSheet = (id) => {
  const g = B.groups[id]; grpNo[g.q] = grpNo[g.q] || 0;
  return { id, title: g.title, sub: g.sub, sections: g.items.map((iid, i) => { const x = TW.find((t) => t.id === iid); if (!x) throw new Error('없는 문항 ' + iid);
    return { type: 'writing', raw: iid === workedItem(g.q) ? { ...x, _ref: true } : x, title: { en: `${++grpNo[g.q]}. ${x.title}`, ko: '' }, items: [{ q: x.title, a: x.blanks ? x.blanks.map((b) => `${b.mark} ${b.answers[0]}`).join(' ') : x.model }] }; }).filter((sec) => !sec.raw._ref) };   // 풀이 예시로 푼 문항은 실전 문제에서 뺀다(번호는 그대로 — 계획표의 번호와 맞추려고)
};
const partQ = (p) => { for (const u of p.units) { const m = /^w(\d\d):/.exec(u) || /^g(\d\d)-/.exec(u); if (m) return Number(m[1]); } return NaN; };
const sheetBase = (id) => B.inline?.[id] ? B.inline[id] : /^g\d\d-/.test(id) ? groupSheet(id) : /^w\d\d:\d+$/.test(id) ? bankSheet(id) : JSON.parse(fs.readFileSync(path.join(ROOT, `docs/worksheets/${id}.json`), 'utf8'));
/* 책 전용 「생각해 보는 칸」 — docs/books/<책 id>.think.json = { 단원 id: [practice 칸, …] }. 단원 끝에 이어 붙인다(사이트 학습지는 그대로).
   운영자 2026-10-22 「조사 워크북에 고민할 여지가 있는 요소를 더 추가」. 만드는 법 docs/antigravity/antigravity-particles-think-task.md */
const THINK_FILE = path.join(ROOT, `docs/books/${bookId}.think.json`);
const THINK = fs.existsSync(THINK_FILE) ? JSON.parse(fs.readFileSync(THINK_FILE, 'utf8')) : {};
for (const [uid, secs] of Object.entries(THINK)) {
  if (uid.startsWith('_')) continue;
  if (!B.parts.some((p) => p.units.includes(uid))) throw new Error(`think: 책에 없는 단원 ${uid}`);
  if (!Array.isArray(secs) || !secs.length) throw new Error(`think ${uid}: 칸 배열이 비었다`);
  secs.forEach((x, n) => {
    const w = `think ${uid}[${n}]`;
    if (x.type !== 'practice' || !x.title?.en || !x.title?.ko) throw new Error(`${w}: type practice · title.en/ko`);
    if (!Array.isArray(x.items) || x.items.length < 3 || x.items.length > 8) throw new Error(`${w}: 문제 3~8개`);
    x.items.forEach((q, k) => { if (typeof q.q !== 'string' || typeof q.a !== 'string' || !q.q.trim() || !q.a.trim()) throw new Error(`${w} 문제 ${k + 1}: q · a 문자열`); if (/—/.test(JSON.stringify(q) + JSON.stringify(x.title) + (x.hint || ''))) throw new Error(`${w}: 줄표(—)는 쓰지 않는다`); });
  });
}
/* 「이런 맥락에서 써요」 — docs/books/<책 id>.contexts.json = { 단원 id: [[꼬리표, 이럴 때, 예, 영어], …] }. 예문표 바로 뒤에 따로 한 칸으로 끼운다(운영자 2026-10-23 「별도 섹션 · 여러 맥락에 쓰이는 조사 모두」). */
const CTXF = path.join(ROOT, `docs/books/${bookId}.contexts.json`);
const CTX = fs.existsSync(CTXF) ? JSON.parse(fs.readFileSync(CTXF, 'utf8')) : {};
for (const [uid, rows] of Object.entries(CTX)) {
  if (!B.parts.some((p) => p.units.includes(uid))) throw new Error(`contexts: 책에 없는 단원 ${uid}`);
  rows.forEach((r, i) => { if (!Array.isArray(r) || r.length !== 4 || r.some((c) => typeof c !== 'string' || !c.trim()) || !r[0].startsWith('#') || /—/.test(r.join(''))) throw new Error(`contexts ${uid}[${i}]: [#꼬리표, 이럴 때, 예, 영어] 네 칸 · 줄표 금지`); });
}
const ctxSec = (rows) => ({ noIndex: true, type: 'table', title: { en: 'Where it is used', ko: '이런 맥락에서 써요' }, cols: ['Context · 맥락', 'When · 이럴 때', 'Example · 예', 'English'], rows });
const withCtx = (s0, id) => { const rows = CTX[id]; if (!rows) return s0; const k = s0.sections.findIndex((x) => x.type === 'table' && /^Examples/.test(x.title.en)); const at = k >= 0 ? k + 1 : s0.sections.length; return { ...s0, sections: [...s0.sections.slice(0, at), ctxSec(rows), ...s0.sections.slice(at)] }; };
const sheet = (id) => { const s0 = withCtx(sheetBase(id), id); const t = THINK[id]; return t ? { ...s0, sections: [...s0.sections, ...t.map((x) => ({ ...x, think: true }))] } : s0; };
const esc = (x) => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cssStr = (x) => '"' + String(x).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
const HAN = /[가-힣]/;
const T = B.trim, W = T.w, H = T.h;
/* 정석풍(classic) 속지의 강조색 — 레벨 시리즈 책은 표지 색(coverLevel.bg)을 그대로 쓴다(운영자 2026-10-23 「색이 달라 통일성이 없다」).
   차가운 회청색 보조색(#5a6780 …)은 밝기 · 채도는 두고 색상만 책 색으로 옮긴다. */
const hex2hsl = (h) => { const n = parseInt(h.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; let hh = 0, ss = 0; if (d) { ss = d / (1 - Math.abs(2 * l - 1)); hh = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; } return [hh, ss, l]; };
const hsl2hex = (h, s, l) => { const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2, [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join(''); };
const mixHex = (a, b, t) => { const f = (h) => [16, 8, 0].map((sh) => (parseInt(h.slice(1), 16) >> sh) & 255); const A = f(a), B2 = f(b); return '#' + A.map((v, i) => Math.round(v * (1 - t) + B2[i] * t).toString(16).padStart(2, '0')).join(''); };
const COOL = ['#5a6780', '#2a3550', '#7a8aa6', '#6b7a92', '#8e9ab0', '#44506a', '#9aa7bf', '#cfd6e2', '#d6dce8', '#c5d1e6', '#b9c3d6', '#e8ecf3', '#fafbfd', '#f6f8fc', '#f4f6fa', '#f3f5fa', '#f1f4fa', '#f1f4fa', '#2f5da8'];
const recolor = (str) => {
  if (!CLASSIC || !B.coverLevel) return str;
  const hue = hex2hsl(LVI.bg)[0];
  for (const c of COOL) { const [, ss, ll] = hex2hsl(c); str = str.replace(new RegExp(c, 'gi'), hsl2hex(hue, Math.min(ss, 0.3), ll)); }
  return str.replace(/#1f3a68/gi, LVI.bg).replace(/#14264a/gi, LVI.bg2).replace(/#eef2f8/gi, mixHex(LVI.bg, '#ffffff', 0.93));
};
const ACC = CLASSIC ? (LVI?.bg || '#1F3A68') : B.color, TINT = CLASSIC ? (LVI ? mixHex(LVI.bg, '#ffffff', 0.93) : '#EEF2F8') : B.tint;

/* ── 단원 끝 QR(운영자 2026-10-22 「책과 앱이 연결되게」) ──
   단원마다 그 주제의 사이트 쪽(있으면 <id>-worksheet/, 쓰기 책은 /topik-writing/)으로 가는 QR + PDF 안 눌러지는 링크.
   주소에 utm 을 달아(book / qr / 책 id / 단원 id) 구글 애널리틱스에서 어느 책 · 어느 단원에서 오는지 센다. */
const qrLib = createRequire(import.meta.url)(path.join(ROOT, 'qrcode-lib.js'));
const SITE_URL = 'https://everykoreans.com';
const unitUrl = (u) => {
  const ex = (f) => fs.existsSync(path.join(ROOT, f));
  const gid = u.id.replace(/^i(?=g\d\d-)/, '');   // 유형 안내 단원(ig51-…)은 같은 유형 묶음의 쪽으로
  let page = '/';
  const pg = /^pt-26-(\d+)$/.exec(u.id);
  /* 책 보너스 연습 쪽(docs/bonus → bonus/<책 id>/<단원>/)이 있으면 그리로 — 칸을 직접 채우고 채점하는 쪽. 부 미니 테스트 · 대화는 그 부의 보너스가 있는 첫 단원으로. */
  const bn = (id) => ex(`bonus/${B.id}/${id}/index.html`);
  const pn = /^(?:ft|fd)-(\d)$/.exec(u.id);
  const bu = bn(u.id) ? u.id : pn ? B.parts[+pn[1] - 1]?.units.find(bn) : null;
  if (bu) page = `/bonus/${B.id}/${bu}/`;
  else if (ex(`${u.id}-worksheet/index.html`)) page = `/${u.id}-worksheet/`;
  else if (B.groups?.[gid]) { const f = B.groups[gid].items[0]; page = ex(`topik-writing/${f}.html`) ? `/topik-writing/${f}.html` : '/topik-writing/'; }   // 그 유형의 첫 문항 쪽
  else if (pg && ex(`sentence/26-${pg[1]}.html`)) page = `/sentence/26-${pg[1]}.html`;   // 조사 한 개 = 사이트 문법 쪽(26-N)
  else if (/^ct-/.test(u.id) && ex('compare/26.html')) page = '/compare/26.html';   // 헷갈리는 조사 = 조사 표현 비교 쪽
  else if (/^ft-\d$/.test(u.id) && ex(`${B.parts[+u.id.slice(3) - 1]?.units[0]}-worksheet/index.html`)) page = `/${B.parts[+u.id.slice(3) - 1].units[0]}-worksheet/`;   // 부 미니 테스트 = 그 부 첫 단원의 연습 쪽
  else if (/^(rv-|mt-|pt-guide)/.test(u.id) && ex('korean-particles-worksheet/index.html')) page = '/korean-particles-worksheet/';
  else if (B.front) page = '/topik-writing/';
  return `${SITE_URL}${page}?utm_source=book&utm_medium=qr&utm_campaign=${encodeURIComponent(B.id)}&utm_content=${encodeURIComponent(u.id)}`;
};
const unitQr = (u) => {
  if (KDP || u.id === 'fs-guide' || B.noQr) return '';   // 계획표 쪽은 연습 쪽이 따로 없다
  const url = unitUrl(u), q = qrLib(0, 'M'); q.addData(url); q.make();
  const svg = q.createSvgTag({ cellSize: 3, margin: 0, scalable: true });
  const shown = url.split('?')[0].replace('https://', '');
  return `<div class="qrb uq"><div class="qr">${svg}</div><div><b>Practice this unit online · free</b><small>스마트폰으로 찍으면 이 단원의 온라인 연습 쪽으로 가요. PDF판은 아래 주소를 눌러도 돼요.</small><a href="${esc(url)}">${esc(shown)}</a></div></div>`;
};

/* ── 단원 모으기 ── */
const parts = B.parts.map((p, pi) => ({ ...p, no: pi + 1, sheets: p.units.map((id) => sheet(id)) }));
const units = []; // 책 전체 차례(1부터)
for (const p of parts) for (const s of p.sheets) units.push({ ...s, no: units.length + 1, part: p });
const unitCss = (u) => `u${u.no}`;

/* ── 쪽 틀(CSS) ── */
const CSS = `
@font-face{font-family:'Pretendard Variable';font-weight:45 920;src:local('Pretendard Variable')}
@page{size:${W}mm ${H}mm;margin:22mm 17mm 24mm 22mm}
@page:left{margin:22mm 22mm 24mm 17mm;
  @top-left{content:${cssStr(B.title.en.toUpperCase())};white-space:nowrap;font:600 6.8pt 'Pretendard Variable';letter-spacing:.12em;color:#9a9288;vertical-align:bottom;padding-bottom:5mm}
  @bottom-left{content:counter(page);font:700 8.5pt 'Pretendard Variable';color:${ACC};vertical-align:top;padding-top:6mm}}
@page:right{
  @bottom-right{content:counter(page);font:700 8.5pt 'Pretendard Variable';color:${ACC};vertical-align:top;padding-top:6mm}}
@page plain{@top-left{content:none}@top-right{content:none}@bottom-left{content:none}@bottom-right{content:none}}
@page plain:left{margin:22mm 22mm 24mm 17mm}
@page plain:right{margin:22mm 17mm 24mm 22mm}
@page part{margin:0;@top-left{content:none}@top-right{content:none}@bottom-left{content:none}@bottom-right{content:none}}
${units.map((u) => `@page ${unitCss(u)}:right{@top-right{content:${cssStr(`UNIT ${String(u.no).padStart(2, '0')}  ·  ${u.title.ko}`)};white-space:nowrap;font:600 6.8pt 'Pretendard Variable';letter-spacing:.1em;color:#9a9288;vertical-align:bottom;padding-bottom:5mm}}
@page ${unitCss(u)}:left{@top-left{content:${cssStr(B.title.en.toUpperCase())};white-space:nowrap}}`).join('\n')}
@page unitopen{margin:0;@top-left{content:none}@top-right{content:none}@bottom-left{content:none}@bottom-right{content:none}}
/* ㉠ ㉡ 는 글꼴에 없어 그림 글자(이모지)로 떨어진다 — 동그라미 글자로 직접 그린다 */
.cm{display:inline-block;width:1.2em;height:1.2em;vertical-align:-.2em;margin:0 .12em}
/* 그린(svg) 동그라미 글자는 아래 모의고사 쪽 .cm 의 4.8mm · 테두리 규칙을 받으면 본문보다 커진다 — 글자 크기에 맞춘다 */
svg.cm{width:1.14em!important;height:1.14em!important;border:0!important;border-radius:0!important;vertical-align:-.2em!important;margin:0 .1em!important}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font:400 9.6pt/1.55 'Pretendard Variable',sans-serif;color:#1d1a17;word-break:keep-all}
.blk{break-before:page}.blk:first-child{break-before:auto}
h1,h2,h3,h4{font-weight:800;letter-spacing:-.01em}
.plain{page:plain}
/* 속표지 · 판권 */
.tp{height:${H - 46}mm;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:6mm}
.tp .ser{font-size:8pt;font-weight:800;letter-spacing:.3em;color:${ACC}}
.tp h1{font-size:30pt;line-height:1.2}.tp h2{font-size:14pt;font-weight:600;color:#6d655c}
.tp .rule{width:18mm;height:.8mm;background:${ACC}}.tp .by{font-size:11pt;font-weight:700}.tp .pub{display:block;margin-top:2mm}.tp .pub svg{display:block;margin:0 auto}
.cr{font-size:8pt;line-height:1.7;color:#4a443d;display:flex;flex-direction:column;justify-content:flex-end;height:${H - 46}mm}
.cr h4{font-size:9.5pt;margin-bottom:2mm;color:#1d1a17}.cr p{margin-bottom:2.2mm}.cr dl{display:grid;grid-template-columns:24mm 1fr;gap:.6mm 3mm;margin:3mm 0 4mm}.cr dt{color:#8a8278}.cr .ph{color:#b0a89c}
/* 머리말 · 쓰는 법 */
.pf h2{font-size:20pt;margin-bottom:1mm}.pf .k{font-size:11pt;color:#6d655c;margin-bottom:7mm}
.pf p{margin-bottom:3.4mm;font-size:10pt;line-height:1.7}.pf p.en{color:#1d1a17}.pf p.ko{color:#4a443d;font-size:9.6pt;margin-bottom:5mm}
.pf.nt p{font-size:10.6pt;line-height:1.85;margin-bottom:4mm}.pf.nt p.ko{font-size:10.2pt;margin-bottom:6mm}.pf.nt .au{margin-top:10mm}
.pf .an,.pf .ab p,.pf .au{break-inside:avoid}
.pf .ab p{font-size:9pt;line-height:1.55;margin-bottom:1.8mm}.pf .ab p.ko{font-size:8.8pt;margin-bottom:3.2mm}.pf .ab+.au{margin-top:3mm}
.pf .an{margin-top:7mm;padding:4mm 5mm;background:${TINT};border-radius:2mm}.pf .an h3{font-size:10pt;margin-bottom:2mm;color:${ACC}}.pf .an p{font-size:9.2pt;line-height:1.65;margin-bottom:2mm}.pf .an p.ko{font-size:9pt;margin-bottom:0}
.pf .au{margin-top:8mm;padding-top:4mm;border-top:.3mm solid #d8d0c4;font-size:8.8pt;color:#4a443d}
.how ol{margin-top:6mm;list-style:none;counter-reset:h}.how li{counter-increment:h;display:grid;grid-template-columns:9mm 1fr;gap:3mm;padding:3.4mm 0;border-top:.25mm solid #e6dfd4}
.how li:before{content:counter(h);width:7mm;height:7mm;border-radius:50%;background:${ACC};color:#fff;font-weight:800;font-size:9pt;display:flex;align-items:center;justify-content:center}
.how li b{display:block;font-weight:600}.how li span{display:block;color:#6d655c;font-size:8.8pt}
/* 목차 */
.toc h2{font-size:20pt;margin-bottom:4mm}.toc .pt{margin:3.6mm 0 1mm;font-size:9pt;font-weight:800;color:${ACC};letter-spacing:.06em;display:flex;gap:2mm}
.toc .ln{display:flex;align-items:baseline;gap:2mm;padding:.45mm 0;font-size:9.3pt;line-height:1.35}.toc .ln .n{width:7mm;font-weight:800;color:#9a9288}.toc .ln .t{flex:0 1 auto}.toc .ln .t small{color:#8a8278;margin-left:2mm}
.toc .ln .d{flex:1;border-bottom:.35mm dotted #b9b0a3;transform:translateY(-1mm)}.toc .ln .p{font-weight:700;font-variant-numeric:tabular-nums}
.toc .ex{margin-top:2mm}
/* 부 표지 */
.pd{page:part;height:${H}mm;width:${W}mm;background:${ACC};color:#fff;position:relative;overflow:hidden;padding:60mm 22mm 0}
.pd:before{content:'';position:absolute;right:-40mm;bottom:-40mm;width:150mm;height:150mm;border-radius:50%;background:rgba(255,255,255,.12)}
.pd:after{content:'';position:absolute;right:30mm;bottom:50mm;width:40mm;height:40mm;border-radius:50%;background:rgba(255,255,255,.14)}
.pd .no{font-size:10pt;font-weight:800;letter-spacing:.3em;opacity:.85}.pd .big{font-size:150pt;font-weight:900;line-height:.9;margin:6mm 0 4mm;opacity:.95;letter-spacing:-.04em}
.pd h2{font-size:28pt;line-height:1.25}.pd h3{font-size:14pt;font-weight:500;opacity:.92;margin-top:3mm}
.pd .list{position:relative;z-index:1;margin-top:14mm;font-size:9.4pt;line-height:1.9;opacity:.95}
/* 단원 첫 쪽 */
.dop{page:unitopen;height:${H}mm;width:${W}mm;position:relative;overflow:hidden;background:#fff;break-after:page}
.dop .rb{position:absolute;left:50%;top:34mm;transform:translateX(-50%);width:78mm;height:26mm}.dop .rb svg{display:block;width:100%;height:100%}
.dop .rb b{position:absolute;left:0;right:0;top:3.2mm;text-align:center;color:#fff;font-size:15pt;font-weight:800;letter-spacing:.04em}
.dop .rb i{position:absolute;left:0;right:0;top:11.2mm;text-align:center;color:#fff;font-style:normal;font-size:23pt;font-weight:900}
.dop .dbx{position:absolute;left:30mm;right:30mm;top:96mm;height:62mm}
.dop .dbx:before,.dop .dbx:after,.dop .dbx span:before,.dop .dbx span:after{content:'';position:absolute;width:7mm;height:7mm;border:0 solid ${ACC}}
.dop .dbx:before{left:0;top:0;border-width:1.2mm 0 0 1.2mm}.dop .dbx:after{right:0;top:0;border-width:1.2mm 1.2mm 0 0}.dop .dbx span:before{left:0;bottom:0;border-width:0 0 1.2mm 1.2mm}.dop .dbx span:after{right:0;bottom:0;border-width:0 1.2mm 1.2mm 0}
.dop .tx{position:absolute;left:34mm;right:34mm;top:108mm;text-align:center}
.dop .tx h2{font-size:23pt;line-height:1.35;font-weight:800;color:#1d1a17}.dop .tx p{margin-top:3mm;font-size:12pt;color:#6d655c;line-height:1.5}
.dop .dt{position:absolute;left:50%;top:176mm;width:2.2mm;height:2.2mm;margin-left:-1.1mm;border-radius:50%;background:${ACC}}
.dop .pl{position:absolute;left:0;right:0;top:190mm;text-align:center;font-size:11pt;font-weight:700;color:#5a6780}.dop .pl small{display:block;margin-top:1mm;font-weight:500;font-size:9pt;color:#8a8278}
.uo{page:unitopen;height:${H}mm;width:${W}mm;position:relative;overflow:hidden;background:#fff}
.uo .band{position:absolute;left:0;top:0;width:100%;height:96mm;background:${ACC}}
.uo .band:after{content:'';position:absolute;right:-18mm;top:-18mm;width:70mm;height:70mm;border-radius:50%;background:rgba(255,255,255,.14)}
.uo .no{position:absolute;left:22mm;top:30mm;color:#fff;font-size:66pt;font-weight:900;letter-spacing:-.03em;line-height:1}
.uo .pn{position:absolute;left:22mm;top:15mm;color:#fff;font-size:7.8pt;font-weight:800;letter-spacing:.22em;opacity:.9}
.uo .ttl{position:absolute;left:22mm;right:20mm;top:114mm}
.uo h2{font-size:26pt;line-height:1.25}.uo h3{font-size:13.5pt;font-weight:600;color:#6d655c;margin-top:2mm;line-height:1.4}
.uo .sub{margin-top:6mm;font-size:10pt;color:#4a443d;line-height:1.65}.uo .sub small{display:block;margin-top:1.5mm;color:#8a8278;font-size:9pt}
.uo .in{position:absolute;left:22mm;right:20mm;bottom:30mm;border-top:.4mm solid #1d1a17;padding-top:4mm}
.uo .in b{font-size:7.8pt;letter-spacing:.2em;color:${ACC}}.uo .in ol{margin-top:2mm;list-style:none;font-size:9.4pt;line-height:1.85}.uo .in li small{color:#8a8278;margin-left:2mm}
/* 본문 */
.sec{margin:0 0 6mm}.sec>h3{font-size:12.5pt;display:flex;align-items:baseline;gap:2.5mm;margin-bottom:2.6mm;break-after:avoid}
.sec>h3 small{font-size:9.4pt;font-weight:500;color:#8a8278}
.sec>h3:before{content:'';width:2mm;height:2mm;background:${ACC};border-radius:50%;transform:translateY(-.2mm);flex:none}
.hint{font-size:8.6pt;color:#6d655c;font-style:italic;margin:-1mm 0 2.4mm}
table{width:100%;border-collapse:collapse;font-size:9pt;break-inside:auto}tr{break-inside:avoid}
th{background:${ACC};color:#fff;font-weight:700;font-size:8pt;letter-spacing:.04em;text-align:left;padding:2mm 3mm}
td{padding:2mm 3mm;border-bottom:.25mm solid #e6dfd4;vertical-align:top;line-height:1.4}tbody tr:nth-child(even) td,tr:nth-child(even) td{background:#faf6f0}
td:first-child{font-weight:800;font-size:10.4pt;color:#1d1a17}td.tip{color:#8a8278;font-style:italic;font-size:8.4pt}
.note{margin-top:2.6mm;padding:2.4mm 3.6mm;border-left:1.1mm solid ${ACC};background:${TINT};font-size:8.7pt;line-height:1.55;color:#3d372f}
.note b{color:${ACC}}
.pr{list-style:none;counter-reset:q}.pr li{counter-increment:q;display:flex;align-items:flex-end;gap:2.6mm;padding:1.2mm 0;min-height:8.6mm;break-inside:avoid;font-size:9.8pt}
.pr li:before{content:counter(q);flex:none;width:5.6mm;height:5.6mm;border-radius:50%;border:.3mm solid ${ACC};color:${ACC};font-size:7.8pt;font-weight:800;display:flex;align-items:center;justify-content:center;margin-bottom:1mm}
.pr .q{flex:0 1 auto;font-weight:600;line-height:1.35;padding-bottom:.6mm}.pr .ln{flex:1;min-width:26mm;border-bottom:.3mm solid #9a9288;height:5mm}
.pr .bl{display:inline-block;width:24mm;border-bottom:.3mm solid #9a9288;margin:0 1mm;transform:translateY(.6mm)}
/* 정답 · 찾아보기 · 메모 */
.ak h2,.ix h2{font-size:20pt;margin-bottom:1mm}.ak .k,.ix .k{font-size:10.5pt;color:#6d655c;margin-bottom:6mm}
.ak .u{break-inside:avoid;margin-bottom:4.5mm}.ak .u h4{font-size:9pt;display:flex;gap:2mm;align-items:baseline;padding-bottom:1mm;border-bottom:.35mm solid ${ACC};margin-bottom:1.6mm}.ak .u h4 span{color:${ACC}}.ak .u h4 small{font-weight:500;color:#8a8278}
.ak .a{font-size:7.9pt;line-height:1.5;color:#2c2722}.ak .a b{color:${ACC};margin-right:1mm}.ak .set{margin-bottom:1mm}
.ix .cols{column-count:3;column-gap:6mm;font-size:7.8pt;line-height:1.4}.ix .ini{break-after:avoid;margin:2.4mm 0 1mm;font-size:10pt;font-weight:900;color:${ACC};break-inside:avoid}
.ix .e{break-inside:avoid;padding:.35mm 0;border-bottom:.15mm solid #eee7dc}.ix .e b{font-weight:800}.ix .e span{color:#6d655c}.ix .e i{font-style:normal;float:right;color:${ACC};font-weight:700;font-size:7pt}
.src{break-after:avoid;display:block;font:600 6.4pt 'Pretendard Variable';color:#c0392b;letter-spacing:.04em;margin-bottom:1mm}
.rv h2{font-size:18pt;margin-bottom:1mm}.rv .k{font-size:9.5pt;color:#6d655c;margin-bottom:5mm}.rv table td{padding:1.6mm 2mm;font-weight:500;font-size:8.2pt}.rv th{font-size:7pt;padding:1.6mm 2mm}.rv td.c{width:12mm;text-align:center;color:#bbb}
.memo h2{font-size:14pt;margin-bottom:6mm;color:${ACC}}.memo .rule{height:8mm;border-bottom:.25mm solid #d8d0c4}
`;

/* ── 블록 만들기 ── */
const pair = (o, cls = '') => `<p class="en${cls}">${esc(o.en)}</p>`;
const LAB = { flow: '글의 틀', table: '핵심 정리', plan: '핵심 정리', vocab: '낱말', checkup: '점검', compare: '구분', text: '참고', practice: '연습', writing: '문제', example: '예시', mcq: '문제', omr: '답안지' };
/* 정석풍 블록 — 핵심 정리 · 참고 · 연습 + 팁(TIP) · 주의(WARNING) · 더 알아보기(MORE). 표 끝 설명과 글 칸이 어느 블록인지는 책 틀의 blocks(「단원id:칸번호」)에서 — 없으면 표 설명은 TIP, 글 칸은 참고. */
const BLK = { tip: ['TIP', '팁'], warn: ['WARNING', '주의'], more: ['MORE', '더 알아보기'], pattern: ['PATTERN', '문형'] };
const kindOf = (u, si, s) => (B.blocks || {})[`${u.id}:${si + 1}`] || (s.type === 'table' ? 'tip' : 'ref');
/* 문형 블록 — 갈아 끼우는 자리(점선 상자)와 고정 부분(굵은 글자 + 밑줄)을 한눈에. 책 틀의 patterns(「단원id:칸번호」)에 칸마다 [글자, s(자리) | f(고정)] 로 적는다. */
const BIC = { tip: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>', warn: '<svg viewBox="0 0 24 24"><path d="M12 3 2.5 20h19L12 3z"/><path d="M12 10v4M12 17.2v.1"/></svg>', more: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>', pattern: '<svg viewBox="0 0 24 24"><path d="M8 4H5v16h3M16 4h3v16h-3M10 12h4"/></svg>' };
/* 블록 모양(시안 2 — 이름표가 테두리에 걸친 칸): 아이콘 + 이름 + 한글 이름이 위 테두리에 걸리고, 종류마다 선 색이 다르다(팁 파랑 · 주의 빨강 · 더 알아보기 회청 점선 · 문형 남색) */
const legend = (kind) => `<div class="lg">${BIC[kind]}${BLK[kind][0]}<small>${BLK[kind][1]}</small></div>`;
const underlineHl = (text, hl) => { let h = esc(text); for (const w of hl || []) h = h.replace(esc(w), `<u class="hl">${esc(w)}</u>`); return h; };
const patHtml = (rows) => `<div class="bx pattern">${legend('pattern')}<div class="pp">${rows.map((r) => `<div class="pt1"><div class="fl">${r.p.map(([t, k], i) => `${i ? '<i class="lk">+</i>' : ''}<span class="nd ${k === 's' ? 'sl' : 'fx'}">${esc(t)}</span>`).join('')}<span class="mn">→&nbsp; ${esc(r.en)}</span></div>${r.ex ? `<div class="eg"><b>e.g.</b> ${underlineHl(r.ex, r.hl)}${r.exEn ? ` <span>(${esc(r.exEn)})</span>` : ''}</div>` : ''}</div>`).join('')}</div></div>`;
const blockHtml = (u, si, s, text) => { const k = kindOf(u, si, s); const pat = (B.patterns || {})[`${u.id}:${si + 1}`]; return k === 'pattern' && pat ? patHtml(pat) : boxHtml(k === 'pattern' ? 'tip' : k, text); };
const boxHtml = (kind, text) => `<div class="bx ${kind}">${legend(kind)}<div class="tt">${esc(text)}</div></div>`;
let secNo = '';
/* 치즈(난이도) · 감자(빈출도) 아이콘 — 채운 것 · 빈 것 */
const cheeseIc = (on) => `<svg class="ic" viewBox="0 0 16 16"><path d="M1.5 12.5H14.5V6L1.5 3.5Z" fill="${on ? '#F2B632' : '#fff'}" stroke="${on ? '#B8841B' : '#cfc7b8'}" stroke-width="1" stroke-linejoin="round"/>${on ? '<circle cx="5" cy="9.4" r="1.3" fill="#D99A1E"/><circle cx="10" cy="8.2" r="1" fill="#D99A1E"/><circle cx="12" cy="11" r=".8" fill="#D99A1E"/>' : ''}</svg>`;
const potatoIc = (on) => `<svg class="ic" viewBox="0 0 16 16"><ellipse cx="8" cy="8.6" rx="6.6" ry="5.1" transform="rotate(-12 8 8.6)" fill="${on ? '#C99A5B' : '#fff'}" stroke="${on ? '#8A6330' : '#cfc7b8'}" stroke-width="1"/>${on ? '<circle cx="6" cy="7.6" r=".7" fill="#4a3318"/><circle cx="10" cy="7" r=".7" fill="#4a3318"/><path d="M6.6 10q1.4 1 2.8 0" fill="none" stroke="#4a3318" stroke-width=".7" stroke-linecap="round"/>' : ''}</svg>`;
const secLabel = (s, lab) => `<h3>${CLASSIC ? `<em class="lab">${lab || (s.type === 'writing' && B.front ? '실전 문제' : LAB[s.type])} ${secNo}</em>` : ''}<span>${esc(s.title.en)}</span>${s.title.ko ? `<small>${esc(s.title.ko)}</small>` : ''}</h3>`;
/* 문제 글 끝의 (영어 뜻)은 한국어 줄 밑 작은 글씨 한 줄로 내린다 — 줄 중간에 어중간하게 걸쳐 읽기 힘들던 것(운영자 2026-10-23). */
/* 맥락 꼬리표 — 표 칸이 「#처음 나온 것 #방금 본 것」 처럼 #로 시작하면 알약 모양 꼬리표로(운영자 2026-10-23 「태그로 깔끔하게」) */
const tagHtml = (arr) => arr.map((t) => `<span class="tg">${esc(t.trim())}</span>`).join('');
const tagsOr = (c) => (typeof c === 'string' && c.startsWith('#') ? tagHtml(c.split(/\s*#/).filter(Boolean)) : esc(c));
const EN_TAIL = /^(.*?\S)\s+\(([^()]*[A-Za-z][^()]*)\)\s*$/;
/* 한글이 하나도 없는 문제(영어 지시 · 「한국어로 쓰기」)는 한 줄이 아니라 넓은 줄에 쓰게 한다 */
const isOpen = (q) => !/_{3}/.test(q) && (q.match(/[가-힣]/g) || []).length <= 3 && (q.match(/[A-Za-z]/g) || []).length >= 15;
const isRewrite = (q) => !/_{3}/.test(q) && /→\s*$/.test(q) && !isOpen(q);   // 「문장 → 」고쳐 쓰기 문항: 줄이 오른쪽 구석에 떠 있지 않게 문제 아래 한 줄 전체로(운영자 2026-10-30 「얘는 왜 아직도 이래」)
const qLine = (q) => {
  if (isRewrite(q)) return `<span class="q">${esc(q)}</span><span class="tl"></span>`;
  if (isOpen(q)) return `<span class="q">${esc(q.replace(/\s*→\s*$/, ''))}</span><span class="tl"></span>`;
  const m = EN_TAIL.exec(q), ko = m ? m[1] : q;
  const body = (ko.includes('___') ? esc(ko.replace(/\s*→\s*$/, '')).replace(/_{3,}/g, '<span class="bl"></span>') : esc(ko));
  let [enText, cxText] = m ? m[2].split(' ▸ ') : [];   // 「▸」 뒤는 맥락 꼬리표(은/는 · 이/가처럼 맥락이 정하는 문제)
  /* 책 틀 tagHints: 괄호 안이 문장이 아니라 짧은 힌트((tool) · (person) · (topic / object))면 영어 줄이 아니라 꼬리표로 */
  if (m && B.tagHints && cxText === undefined && !/[.?!]\s*$/.test(enText) && enText.length <= 45) { cxText = enText; enText = ''; }
  const txt = m ? `<span class="ko">${body}</span><span class="en">${enText ? esc(enText) : ''}${cxText ? `<span class="cx">${tagHtml(cxText.split(/,\s*| \/ /))}</span>` : ''}</span>` : body;
  return ko.includes('___')
    ? `<span class="q">${txt}</span><span class="ln" style="visibility:hidden;min-width:0"></span>`
    : `<span class="q">${txt}</span><span class="ln"></span>`;
};
const liCls = (q) => [isOpen(q) || isRewrite(q) ? 'open' : '', /_{3}/.test(q) ? 'fill' : '', EN_TAIL.test(q) ? 'two' : ''].filter(Boolean).join(' ');

function titlePage() {
  return `<div class="blk plain"><div class="tp"><span class="ser">${esc(B.series.en)}</span><h1>${esc(B.title.ko)}</h1><h2>${esc(B.title.en)}</h2><div class="rule"></div><span class="by">${esc(B.author.ko)} · ${esc(B.author.en)}</span><span class="pub">${logoSvg({ fg: '#14264A', one: true, height: '5mm' })}</span></div></div>`;
}
/* 출판사 신고(2026-10-20, 경기도 수원시 영통구청 — 운영자 「출판사 신고확인증」). 주소는 판권면에 적지 않는다(신고 주소가 집 주소라서 공개하지 않는다) */
/* ISBN 이 승인된 책(책 틀 isbn · isbnPrice): 한국서지표준센터가 준 바코드(ISBN · 부가기호 · 값이 들어 있다)를 뒤표지에 넣는다 — assets/books/<책 id>/isbn-barcode.png */
const ISBN_BC = (() => { if (!B.isbn) return ''; const f = path.join(ROOT, `assets/books/${B.id}/isbn-barcode.png`); return fs.existsSync(f) ? `data:image/png;base64,${fs.readFileSync(f).toString('base64')}` : ''; })();
const PUBLISHER_NO = '제 2026-000158 호 (Reg. no. 2026-000158 · Suwon Yeongtong-gu, Gyeonggi-do)';
function copyrightPage() {
  return `<div class="blk plain"><div class="cr">
<h4>${esc(B.title.ko)} · ${esc(B.title.en)}</h4>
<p>${esc(B.sub.en)}<br>${esc(B.sub.ko)}</p>
<dl><dt>Author · 지은이</dt><dd>${esc(B.author.ko)} (${esc(B.author.en)})</dd>
${B.reviewer ? `<dt>Reviewed by · 검수</dt><dd>${esc(B.reviewer.ko)} (${esc(B.reviewer.en)})</dd>\n` : ''}<dt>Publisher · 펴낸곳</dt><dd>${esc(B.publisher.ko)} · ${esc(B.publisher.en)}</dd>
<dt>Publisher reg. no. · 출판사 신고번호</dt><dd>${PUBLISHER_NO}</dd>
${DIGITAL ? `<dt>Format · 형태</dt><dd>Digital edition (PDF) · 디지털판(PDF) · print it at home or at a print shop · 집이나 인쇄소에서 인쇄해 쓰세요</dd>
<dt>Edition · 판</dt><dd>${esc(B.digitalEdition || 'First digital edition · 디지털판 초판')}</dd>
<dt>Published · 발행</dt><dd>${B.published || new Date().toISOString().slice(0, 7).replace('-', '.')}</dd>${B.isbn ? `\n<dt>ISBN</dt><dd>${esc(B.isbn)} (PDF)</dd>\n<dt>Price · 정가</dt><dd>${esc(B.isbnPrice || '')}</dd>` : ''}` : `<dt>ISBN</dt><dd class="ph">발급 후 기재 · to be assigned</dd>
<dt>Edition · 판</dt><dd>${esc(B.edition)}</dd>
<dt>Printed · 발행일</dt><dd class="ph">○○○○년 ○월 ○일</dd>`}
<dt>Web</dt><dd>${esc(B.web)}</dd></dl>
<p>All sentences, tables and exercises in this book were written for it. They are original practice material.<br>이 책의 낱말 · 문장 · 연습은 모두 이 책을 위해 새로 쓴 것입니다.</p>
<p>© ${esc(B.publisher.en)}. All rights reserved. No part of this book may be reproduced without written permission, except for brief quotations in reviews or for classroom use by the purchaser.<br>저작권법에 따라 보호받는 책으로, 무단 복제와 전재를 금합니다.</p>
<p>TOPIK is the name of an exam run by the National Institute for International Education (NIIED). This book is an independent study aid; it is not operated, endorsed or certified by NIIED or the TOPIK Center, and its questions are original, not past exam papers.<br>TOPIK 은 국립국제교육원의 시험 이름입니다. 이 책은 독자적으로 만든 학습서이며 국립국제교육원 · 한국어능력시험센터가 운영 · 제휴 · 인증하지 않았습니다. 문항은 모두 새로 만든 것으로 기출이 아닙니다.</p>
<p>Typeset in Pretendard (SIL Open Font License 1.1).</p>
</div></div>`;
}
function prefacePage() {
  return `<div class="blk plain"><div class="pf"><h2>Preface</h2><div class="k">머리말</div>
${B.preface.en.map((t, i) => `<p class="en">${esc(t)}</p><p class="ko">${esc(B.preface.ko[i])}</p>`).join('')}
${B.authorNote && !B.authorBio ? `<div class="an"><h3>Author's note · 저자의 말</h3><p class="en">${esc(B.authorNote.en)}</p><p class="ko">${esc(B.authorNote.ko)}</p></div>` : ''}${B.authorBio ? '' : `<div class="au"><b>${esc(B.author.en)}</b>: ${esc(B.authorAbout.en)}<br>${esc(B.authorAbout.ko)}</div>`}</div></div>`;
}

/* ── 스스로 하는 공부(운영자 2026-10-22 「학생의 주도적인 학습을 유도」, 책 틀의 selfStudy: true) ──
   근거(요약): 규칙을 내 말로 써 보기(스스로 만들어 내기) · 끄집어내 보기와 간격 두고 다시 보기(1일 · 3일 · 7일) · 자기 점검과 틀린 것 기록(스스로 조절하는 학습).
   조사에 딱 맞춰 검증된 연구는 얇다 — 효과를 단정하지 않고 학습자가 쓰기 쉬운 도구로만 넣는다. */

/* 헷갈리는 조사 알림 — docs/books/<책 id>.json 의 lookalike {단원 id: {to, en, ko}}. 그 조사를 가르는 「헷갈리는 조사 가르기」 단원 번호를 알려 준다(운영자 2026-10-23 「비슷한 문법은 따로 집중」). */
const lookalike = (u) => {
  const la = B.lookalike?.[u.id]; if (!la) return '';
  const t = units.find((x) => x.id === la.to); if (!t) throw new Error(`lookalike ${u.id}: 책에 없는 단원 ${la.to}`);
  return `<div class="la"><b>Look-alike alert · 헷갈리는 조사</b><span>${esc(la.en)}<br>${esc(la.ko)}</span><em>→ Unit ${String(t.no).padStart(2, '0')} · ${esc(t.title.ko)}</em></div>`;
};
const cb = '<i class="cb"></i>';
const isStudyUnit = (u) => B.selfStudy && !/guide|^rv-|^mt-/.test(u.id);
/* 책 ↔ 앱 점검 칸 — 단원 끝에 「책에서 풀기 → 단원 처음 QR 로 앱 점검 → 점수 적기 → 복습 날짜」 흐름을 한눈에(운영자 2026-10-24 「책을 하면서 앱까지 같이」). 보너스 연습이 있는 단원에만 붙는다. */
const appCheck = (u) => KDP || YES24 || !fs.existsSync(path.join(ROOT, `bonus/${B.id}/${u.id}/index.html`)) ? '' : `<div class="sc"><h4>Book + App check · 책 + 앱 점검</h4><div style="font-size:8.2pt;line-height:1.7"><b>1</b> Practice in pencil · 연필로 풀기 &nbsp;→&nbsp; <b>2</b> Scan this unit's QR, app quiz 80%+ · 단원 QR로 앱 점검<br><b>3</b> App score · 앱 점수 ______ / 10 &nbsp;&nbsp; Review · 복습 <span class="cb"></span> 1일 <span class="cb"></span> 3일 <span class="cb"></span> 7일</div></div>`;
const selfCheck = (u) => !isStudyUnit(u) ? '' : `<div class="sc"><h4>My check · 나의 점검</h4>
<div class="r"><b>My rule in my own words · 내 말로 규칙 쓰기</b><span class="tl"></span><span class="tl"></span></div>
<div class="r2"><span><b>How sure am I? · 얼마나 자신 있나요</b> ${cb} Not yet · 아직 ${cb} Almost · 거의 ${cb} Sure · 확실</span><span><b>Come back · 다시 보기</b> ${cb} Day 1 · 1일 ${cb} Day 3 · 3일 ${cb} Day 7 · 7일</span></div></div>`;
const studyMap = () => {
  /* 조사 하나짜리 단원만 부(部)별로 묶어서 한 쪽에 — 가르기 · 테스트 단원은 뺀다 */
  const groups = parts.map((p) => ({ p, us: p.sheets.filter((x) => isStudyUnit(x) && !/^ct-/.test(x.id)).map((x) => units.find((y) => y.id === x.id)) })).filter((g) => g.us.length);
  const th = (en, ko) => `<th class="tk">${en}<small>${ko}</small></th>`;
  return `<div class="blk plain sm"><h2>Which particles do I know? · 내가 아는 조사는?</h2><div class="k">${esc(B.studyIntro?.en || 'Before you start, tick one box per row. After the review tests, tick again in a different colour.')}<br>${esc(B.studyIntro?.ko || '시작하기 전에 줄마다 하나씩 표시하세요. 복습 시험을 마친 뒤 다른 색으로 한 번 더 표시해 보세요.')}</div>
<table class="sm-t"><thead><tr><th class="un">Unit</th><th class="pn">Particle · 조사</th>${th('New', '처음')}${th('Seen it', '본 적 있음')}${th('I use it', '쓸 수 있음')}${th('After the book', '책을 끝낸 뒤')}</tr></thead><tbody>${groups.map((g) => `<tr class="gp"><td colspan="6">${esc(g.p.title.en)} · ${esc(g.p.title.ko)}</td></tr>` + g.us.map((u) => `<tr><td class="un">${String(u.no).padStart(2, '0')}</td><td class="pn">${esc(u.title.ko)}</td><td>${cb}</td><td>${cb}</td><td>${cb}</td><td>${cb}</td></tr>`).join('')).join('')}</tbody></table></div>`;
};
const mistakeLog = (n) => Array.from({ length: n }, (_, i) => `<div class="blk plain ml"><h2>My mistake log · 틀린 문장 기록${n > 1 ? ` ${i + 1}` : ''}</h2><div class="k">${i === 0 ? esc('Copy a sentence you got wrong, fix it, and write WHY in your own words. Check this page again after a week. · 틀린 문장을 옮겨 쓰고, 고친 뒤, 왜 그런지 내 말로 적으세요. 일주일 뒤 이 쪽을 다시 보세요.') : ''}</div>
<table class="ml-t"><thead><tr><th>Date · 날짜</th><th>My sentence · 내 문장</th><th>Fixed · 고친 문장</th><th>Why · 왜?</th></tr></thead><tbody>${'<tr><td></td><td></td><td></td><td></td></tr>'.repeat(11)}</tbody></table></div>`).join('');

/* 독자 전용 코스 쪽(bonus/<책 id>/ — 진행률 · 연속 학습 · 틀린 문제 노트 · 부 챌린지)으로 가는 QR. 보너스 자료가 있는 책만. */
const courseQr = () => {
  if (KDP) return '';
  if (!fs.existsSync(path.join(ROOT, `bonus/${B.id}/index.html`))) return '';
  const url = `${SITE_URL}/bonus/${B.id}/?utm_source=book&utm_medium=qr&utm_campaign=${encodeURIComponent(B.id)}&utm_content=course`;
  const q = qrLib(0, 'M'); q.addData(url); q.make();
  return `<div class="qrb uq"><div class="qr">${q.createSvgTag({ cellSize: 3, margin: 0, scalable: true })}</div><div><b>Your reader course · 독자 전용 코스</b><small>찍으면 이 책의 전용 쪽이 열려요: 단원별 연습, 진행률, 연속 학습, 틀린 문제 노트. 치즈감자 앱에서 열면 기록이 앱에도 쌓여요.</small><a href="${esc(url)}">${esc(url.split('?')[0].replace('https://', ''))}</a></div></div>`;
};
/* 저자의 말 — 한 쪽에 통째로(쪽 사이에서 잘리지 않게 따로 한 쪽). 책 틀 JSON 의 authorNote {ko, en}. */
function notePage() {
  return `<div class="blk plain"><div class="pf nt"><h2>Author's note</h2><div class="k">저자의 말</div>
<p class="en">${esc(B.authorNote.en)}</p><p class="ko">${esc(B.authorNote.ko)}</p>
<div class="au"><b>${esc(B.author.en)}</b> · ${esc(B.author.ko)}</div></div></div>`;
}
/* 저자 소개 — 운영자가 직접 들려준 이야기(2026-10-24)를 1인칭으로 옮긴 글. 책 틀 JSON 의 authorBio {ko:[문단], en:[문단]}. */
function authorPage() {
  return `<div class="blk plain"><div class="pf"><h2>About the author</h2><div class="k">저자 소개</div>
<div class="ab">${B.authorBio.en.map((t, i) => `<p class="en">${esc(t)}</p><p class="ko">${esc(B.authorBio.ko[i])}</p>`).join('')}</div>
<div class="au"><b>${esc(B.author.en)}</b> · ${esc(B.author.ko)}<br>everykoreans.com</div></div></div>`;
}
function howPage() {
  return `<div class="blk plain"><div class="pf how"><h2>How to use this book</h2><div class="k">이 책 쓰는 법</div><ol>${B.howto.en.map((t, i) => `<li><div><b>${esc(t)}</b><span>${esc(B.howto.ko[i])}</span></div></li>`).join('')}</ol>${courseQr()}</div></div>`;
}
const GUIDE = [
  ['table', '핵심 정리 · Key Points', '읽고 소리 내 말하고 따라 쓰는 표. 단원의 뼈대입니다.', 'Tables to read aloud, copy and revisit · the backbone of each unit.'],
  ['ref', '참고 · Note', '규칙이 어떻게 움직이는지 풀어 쓴 설명입니다.', 'A short explanation of how the pattern works.'],
  ['practice', '연습 · Practice', KDP ? '문제 아래 정답을 가리고 풀어 본 뒤 확인합니다.' : '줄 위에 직접 쓰고, 뒤쪽 정답으로 확인합니다.', KDP ? 'Cover the answer below each question, try it, then check.' : 'Write on the line, then check the Answer Key at the back.'],
  ['tip', 'TIP · 팁', '더 자연스럽게 말하는 요령, 알아 두면 편한 규칙.', 'A handy shortcut or a more natural way to say it.'],
  ['warn', 'WARNING · 주의', '자주 하는 실수와 예외. 틀리기 쉬운 곳은 꼭 읽으세요.', 'Common mistakes and exceptions · read these before you practise.'],
  ['pattern', 'PATTERN · 문형', '자주 쓰는 문장 틀. 점선 상자 자리에 내 낱말을 갈아 끼우세요.', 'A sentence frame. Swap your own word into the dashed slot.'],
  ['more', 'MORE · 더 알아보기', '소리 변화, 유래 같은 덧붙임. 지금 몰라도 괜찮고, 궁금할 때 읽으세요.', 'Sound changes, origins and extras. Optional · read when curious.'],
];
function guidePage() {
  const mini = (k) => {
    if (k === 'table') return `<div class="sec"><h3><em class="lab">핵심 정리 1-1</em><span>Key words</span></h3><table><thead><tr><th>Korean</th><th>English</th></tr></thead><tbody><tr><td>안녕하세요</td><td>Hello</td></tr><tr><td>감사합니다</td><td>Thank you</td></tr></tbody></table></div>`;
    if (k === 'ref') return `<div class="sec"><h3><em class="lab">참고 1-3</em><span>How it works</span></h3><div class="note">Explains why the pattern behaves the way it does.</div></div>`;
    if (k === 'practice') return `<div class="sec"><h3><em class="lab">연습 1-4</em><span>Practice A</span></h3><ol class="pr" style="--qw:40%"><li><span class="q">가 + ㄴ →</span><span class="ln"></span></li><li><span class="q">나 + ㅁ →</span><span class="ln"></span></li></ol></div>`;
    if (k === 'pattern') return patHtml([{ p: [['Place', 's'], ['이/가', 'f'], ['어디예요?', 'f']], en: 'Where is [place]?' }]);
    return boxHtml(k, { tip: 'Short, useful, and often what native speakers really say.', warn: 'The mistake learners make most often · and how to avoid it.', more: 'Extra background you can skip on the first read.' }[k]);
  };
  return `<div class="blk plain gd"><h2>How this book is organized</h2><div class="k">이 책의 구성 · 블록 읽는 법</div>${GUIDE.map(([k, t, ko, en]) => `<div class="row"><div class="mini">${mini(k)}</div><div class="d"><b>${t}</b>${en}<small>${ko}</small></div></div>`).join('')}
<p style="margin-top:2.4mm;font-size:8.2pt;color:#2a3550;line-height:1.5"><b>번호 읽는 법 · Numbering</b>: 「핵심 정리 5-2」 = 5단원의 두 번째 칸. “Key Points 5-2” is the second block of Unit 5. 정답과 찾아보기는 책 뒤쪽에 있습니다 · The Answer Key and Index are at the back.</p></div>`;
}
function tocPage(starts) {
  let h = `<div class="blk plain"><div class="toc"><h2>Contents · 목차</h2>`;
  const ln = (n, en, ko, p) => `<div class="ln"><span class="n">${n}</span><span class="t">${esc(en)}<small>${esc(ko)}</small></span><span class="d"></span><span class="p">${p ?? '··'}</span></div>`;
  h += ln('', B.authorBio ? 'Preface · About the author · How to use this book' : 'Preface · How to use this book', B.authorBio ? '머리말 · 저자 소개 · 쓰는 법' : '머리말 · 쓰는 법', starts?.preface);
  if (!B.noGuide) h += ln('', 'How this book is organized', '이 책의 구성 · 블록 읽는 법', starts?.guide);
  if (FRONT_LIST.length) { h += `<div class="pt">BEFORE YOU START · <span style="color:#9a9288;font-weight:500">시작하기 전에</span></div>`; for (const [k, en, ko] of FRONT_LIST) h += ln('', en, ko, starts?.front?.[k]); }
  for (const p of parts) {
    h += `<div class="pt">PART ${p.no} · ${esc(p.title.en.toUpperCase())} <span style="color:#9a9288;font-weight:500">${esc(p.title.ko)}</span></div>`;
    for (const s of p.sheets) { const u = units.find((x) => x.id === s.id); h += ln(String(u.no).padStart(2, '0'), s.title.en, s.title.ko, starts?.unit[u.no]); }
  }
  h += `<div class="pt ex">BACK MATTER · <span style="color:#9a9288;font-weight:500">부록</span></div>`;
  h += ln('', 'Answer Key', '정답', starts?.answers) + (B.noIndex ? '' : ln('', 'Index', '찾아보기', starts?.index)) + ln('', 'Notes', '메모', starts?.memo);
  return h + '</div></div>';
}
/* 문제은행 책 — 번호마다 「풀이 방법」 쪽(topik-writing.js 의 TW_GUIDE): 무엇을 묻는지 · 풀이 순서 · 표현 · 자주 하는 실수 */
function qGuidePage(p) {
  const q = partQ(p); const g = TWM?.TW_GUIDE?.[q]; if (!g) return '';
  const pt = TWM.TW_QS.find((x) => x.q === q)?.pt;
  const both = (o) => `${esc(o.en)} <small>· ${esc(o.ko)}</small>`;
  return `<div class="blk plain gd"><h2>How to solve Question ${q}</h2><div class="k">${q}번 풀이 방법</div>
<div class="chips"><span class="chip"><b>${esc(g.time.ko)}</b>${esc(g.time.en)}</span>${pt ? `<span class="chip"><b>${pt}점</b>${pt} points</span>` : ''}</div>
<div class="bx tip">${legend('tip')}<div class="tt">${esc(g.what.en)}<br><small style="color:#5a6780">${esc(g.what.ko)}</small></div></div>
<h3 class="gh">Steps · 풀이 순서</h3>
<div class="stp">${g.steps.map((x, i) => `<div class="st"><i>${i + 1}</i><div><b>${esc(x.en)}</b><small>${esc(x.ko)}</small></div></div>`).join('')}</div>
<h3 class="gh">Useful expressions · 쓸 수 있는 표현</h3>
<table><thead><tr><th>Use · 쓰임</th><th>Expressions · 표현</th></tr></thead><tbody>${g.phrases.map((x) => `<tr><td>${both(x)}</td><td>${esc(x.ex)}</td></tr>`).join('')}</tbody></table>
<div class="bx warn">${legend('warn')}<ul class="mk">${g.mistakes.map((x) => `<li>${esc(x.en)}<small>${esc(x.ko)}</small></li>`).join('')}</ul></div></div>`;
}
/* 쓰기 책 보강(docs/writing-book/extras.json) — 번호마다 「채점 기준」 쪽 + 「예시 풀이」 쪽. 문항 글 · 모범답안 · 상중하 답안은 topik-writing.js 에서 그대로. */
const EXTRAS = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/writing-book/extras.json'), 'utf8')); } catch { return {}; } })();
const bi = (o) => `${esc(o.en)}<br><small style="color:#5a6780">${esc(o.ko)}</small>`;
function qScorePage(p) {
  const q = partQ(p); const e = EXTRAS[q]; if (!e) return '';
  const pt = TWM.TW_QS.find((x) => x.q === q)?.pt;
  const smp = TWM.TW_ITEMS.find((x) => x.id === e.worked?.item)?.samples || [];
  const AREA = { content: '내용', structure: '구성', language: '언어' };
  const ladder = smp.length ? `<h3 class="gh" style="break-before:page">Sample scores · 예시 답안 점수 <small style="font-weight:500;color:#5a6780">(${esc(e.worked.item)})</small></h3><div class="lad">${smp.map((sm) => `<div class="ls"><div class="rw"><b>${esc(sm.level)}</b><div class="bar"><span style="width:${Math.round(sm.total / pt * 100)}%"></span></div><em>${sm.total}<small>/${pt}</small></em></div><div class="why">${Object.entries(sm.scores || {}).map(([k, v]) => `${AREA[k] || k} ${v}`).join(' · ')} · ${esc(sm.why)}</div>${sm.text ? `<div class="smp ${sm.level === '상' ? 'ok' : 'no'}"><b>${sm.level === '상' ? '이렇게 쓰세요 · Write like this' : '이렇게 쓰면 안 돼요 · Don\'t write like this'}</b>${esc(sm.text)}</div>` : ''}</div>`).join('')}</div>` : '';
  return `<div class="blk plain gd"><h2>How Question ${q} is scored</h2><div class="k">${q}번 채점 기준</div>
<div class="total"><div class="big">${pt}<small>pts · 점</small></div><p>${esc(e.scoring.en)}<small>${esc(e.scoring.ko)}</small></p></div>
<div class="sc3" style="--n:${e.criteria.length}">${e.criteria.map((c) => `<div class="sc"><h4>${esc(c.k.en)}<small>${esc(c.k.ko)}</small></h4><div class="hi"><i>✓</i><div>${bi(c.hi)}</div></div><div class="lo"><i>✗</i><div>${bi(c.lo)}</div></div></div>`).join('')}</div>${ladder}</div>`;
}
function qWorkedPage(p) {
  const q = partQ(p); const e = EXTRAS[q]?.worked; if (!e) return '';
  const x = TWM.TW_ITEMS.find((i) => i.id === e.item); if (!x) throw new Error('없는 문항 ' + e.item);
  const task = x.blanks ? `<div class="wp">${esc(x.passage)}</div>` : `<div class="wp">${esc(x.passage)}</div>${x.data ? `<ul class="wd">${x.data.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}`;
  const ans = x.blanks ? x.blanks.map((b) => `<div class="wl"><b>${esc(b.mark)}</b><span class="wans">${b.answers.slice(0, 2).map(esc).join(' &nbsp;/&nbsp; ')}</span></div>`).join('')
    : `<div class="wp" style="white-space:pre-line">${esc(x.model)}</div>`;
  // 채점 기준은 표로: 점수 | 답 | 이유(운영자 2026-10-30 「표 형태가 더 직관적」). 글이 「점수: “답” / “답”, 이유.」 꼴이 아니면 예전 목록으로
  const anRow = (a) => {
    const [le, re] = [a.en.split(/:\s(.*)/s), a.ko.split(/:\s(.*)/s)];
    const m = /^((?:“[^”]+”(?:\s*\/\s*)?)+),?\s*(.*)$/s.exec(le[1] || ''), k = /^((?:‘[^’]+’(?:\s*\/\s*)?)+),?\s*(.*)$/s.exec(re[1] || '');
    return m && k ? { le: le[0], lk: re[0], ans: m[1].replace(/[“”]/g, ''), why: bi({ en: m[2].replace(/\.$/, ''), ko: k[2].replace(/\.$/, '') }) } : null;
  };
  const rows = (e.analysis || []).map(anRow);
  const anTable = rows.length && rows.every(Boolean)
    ? `<table class="anl"><thead><tr><th>점수 · Score</th><th>답 · Answer</th><th>이유 · Why</th></tr></thead><tbody>${rows.map((r) => `<tr><th>${esc(r.le)}<small>${esc(r.lk)}</small></th><td class="aa">${esc(r.ans)}</td><td>${r.why}</td></tr>`).join('')}</tbody></table>`
    : (e.analysis || []).length && (e.analysis || []).every((a) => /:\s/.test(a.en) && /:\s/.test(a.ko))
      ? `<table class="anl"><thead><tr><th>점수 · Score</th><th>설명 · Why</th></tr></thead><tbody>${e.analysis.map((a) => { const le = a.en.split(/:\s(.*)/s), lk = a.ko.split(/:\s(.*)/s); return `<tr><th>${esc(le[0])}<small>${esc(lk[0])}</small></th><td>${bi({ en: le[1], ko: lk[1] })}</td></tr>`; }).join('')}</tbody></table>` : '';
  const an = anTable || (e.analysis || []).map((a) => `<li>${bi(a)}</li>`).join('')
    || (x.samples || []).map((sm) => `<li><b>${esc(sm.level)} · ${sm.total}점</b>: ${esc(sm.why)}</li>`).join('');
  const h3 = (t) => `<h3 style="font-size:10.4pt;margin:3mm 0 1.4mm;color:#1f3a68">${t}</h3>`;
  const stepsHtml = `${h3('Step by step · 풀이 순서')}<ol class="stp">${e.steps.map((st, i) => `<li><b class="sn">STEP ${i + 1}</b><span class="sb">${bi(st)}</span></li>`).join('')}</ol>`;
  const ansHtml = `${h3('Model answer · 모범답안')}${ans}${an ? `${h3('Answer analysis · 답안 분석')}${anTable ? an : `<ul style="margin:0;padding-left:5mm;font-size:9.2pt;line-height:1.55">${an}</ul>`}` : ''}`;
  const head = `<h2>Worked example · Question ${q}</h2><div class="k">${q}번 예시 풀이: ${esc(x.title)}</div>`;
  /* 53 · 54번: 풀이 순서는 안내 쪽(walkthrough)에 있으니 여기엔 문제 · 모범답안 · 분석만 한 쪽에(운영자 2026-10-30 「2번으로」) */
  return x.blanks ? `<div class="blk plain gd">${head}${task}${stepsHtml}${ansHtml}</div>`
    : `<div class="blk plain gd">${head}${task}<p class="wnote">풀이 순서는 앞의 안내 쪽에서 단계별로 따라가 보세요. · Follow the steps in the guide pages before this one.</p>${ansHtml}</div>`;
}
/* ── 쓰기 책 앞부분(B.front = "5152" | "5354") — 시험 소개 · 계획표 · 원고지 · 말→글 · 자가 점검표 + QR(운영자 2026-10-18 「앞에 넣어줘 · 예쁘게」). 자료 docs/writing-book/front.json · qr.json */
const FRONT = B.front ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/writing-book/front.json'), 'utf8')) : null;
const QRS = B.front ? JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/writing-book/qr.json'), 'utf8'))[B.front] : null;
const bi2 = (o) => `${esc(o.en)}<small>${esc(o.ko)}</small>`;
const qrBox = () => KDP ? '' : `<div class="qrb"><div class="qr">${QRS.svg}</div><div><b>Practice online · free AI scoring</b><small>스마트폰으로 찍으면 무료 쓰기 연습 · AI 채점 쪽으로 갑니다</small><span>everykoreans.com/topik-writing</span></div></div>`;
const fmHead = (en, ko) => `<h2>${esc(en)}</h2><div class="k">${esc(ko)}</div>`;
function fmExam() {
  const f = FRONT.exam; const seg = [['51', 4], ['52', 4], ['53', 12], ['54', 25], ['✓', 5]];
  return `<div class="blk plain gd fm">${fmHead(f.title.en, f.title.ko)}
<p class="lead">${bi2(f.intro)}</p>
<table><thead><tr><th>Q</th><th>Task · 유형</th><th>Points · 배점</th><th>Length · 분량</th><th>Time · 권장(분)</th></tr></thead><tbody>${f.rows.map((r) => `<tr><td><b>${r[0]}</b></td><td>${esc(r[1])}</td><td>${r[2]}</td><td>${esc(r[3])}</td><td>${r[4]}</td></tr>`).join('')}</tbody></table>
<h3 class="gh">50 minutes · 50분 쓰는 순서</h3>
<div class="tbar">${seg.map(([k, m]) => `<span style="flex:${m}"><b>${k}</b>${m}′</span>`).join('')}</div>
<p class="note2">${bi2(f.timeNote)}</p>
<div class="bx tip">${legend('tip')}<div class="tt">${f.areas.map((a) => `${esc(a.en)}<br><small style="color:#5a6780">${esc(a.ko)}</small>`).join('<br>')}</div></div>
${qrBox()}</div>`;
}
/* 계획표 칸 종류: 아이콘 + 영어 한 단어로 한눈에(이모지 대신 선 그림, 운영자 2026-10-30 「글자 밖에 없는 느낌」) */
const PIC = { w: '<path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/>', r: '<path d="M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-7"/><path d="M20 5v12h-7"/>', v: '<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/>', c: '<path d="M5 12.5l4.5 4.5L19 7"/>', t: '<circle cx="12" cy="13" r="7"/><path d="M12 9v4l3 2M9 3h6"/>' };
const planKind = (d) => { const k = /분/.test(d) ? ['t', 'Timed'] : /안내|예시/.test(d) ? ['r', 'Read'] : /점검/.test(d) ? ['c', 'Check'] : /틀린|복습/.test(d) ? ['v', 'Review'] : ['w', 'Write']; return { c: 'pk' + k[0], en: k[1], i: `<svg viewBox="0 0 24 24">${PIC[k[0]]}</svg>` }; };
function fmPlan() {
  /* 계획표는 표 한 장으로(운영자 2026-10-30 「조금 더 organized」): 주 · 초점 · 하루(D1~D5) 칸. 체크 칸은 전자책이라 뺐다 */
  const pl = FRONT.plan[B.front];
  const sp = (o) => { const [a, ...r] = o.en.split(' · '), [b, ...q] = o.ko.split(' · '); return { w: a, wk: b, f: r.join(' · '), fk: q.join(' · ') }; };
  let prev = '';
  const rows = pl.weeks.map((w) => {
    const t = sp(w.t), ph = (t.f.match(/^Q\d\d/) || [''])[0];
    const band = ph && ph !== prev ? `<tr class="ph"><td colspan="7">${esc(ph.replace('Q', 'Question '))}</td></tr>` : '';
    prev = ph || prev;
    return `${band}<tr><th class="w">${esc(t.w)}<small>${esc(t.wk)}</small></th><td class="f"><b>${esc(t.f)}</b><small>${esc(t.fk)}</small></td>${w.d.map((d) => { const k = planKind(d); return `<td class="pk ${k.c}"><span class="pi">${k.i}<em>${k.en}</em></span>${esc(d)}</td>`; }).join('')}</tr>`;
  }).join('');
  return `<div class="blk plain gd fm">${fmHead(pl.title.en, pl.title.ko)}<p class="lead">${bi2(pl.sub)}</p>
<table class="plt"><thead><tr><th>주 · Week</th><th>초점 · Focus</th>${[1, 2, 3, 4, 5].map((n) => `<th>D${n}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table><div class="plg2">${[['w', 'Write'], ['r', 'Read'], ['v', 'Review'], ['c', 'Check'], ['t', 'Timed']].map(([c, n]) => `<span class="pk${c}"><svg viewBox="0 0 24 24">${PIC[c]}</svg>${n}</span>`).join('')}</div></div>`;
}
const goji = (text, cols) => {
  const ch = [...text]; const cells = [];
  for (let i = 0; i < ch.length; i++) { const c = ch[i]; if (/\d/.test(c)) { let d = c; if (/\d/.test(ch[i + 1] || '')) d += ch[++i]; cells.push(d); } else cells.push(c); }
  const flat = ['']; 
  for (const c of cells) {
    if (c === ' ') { if (flat.length % cols === 0) continue; flat.push(''); continue; }
    if ((c === '.' || c === ',') && flat.length % cols === 0) { flat[flat.length - 1] += c; continue; }
    flat.push(c);
  }
  while (flat.length % cols) flat.push('');
  return `<div class="gj" style="--c:${cols}">${flat.map((c) => `<i${/^\d\d$/.test(c) ? ' class="dd"' : ''}>${esc(c)}</i>`).join('')}</div>`;
};
function fmGoji() {
  const f = FRONT.wongoji;
  return `<div class="blk plain gd fm">${fmHead(f.title.en, f.title.ko)}
<ol class="rl">${f.rules.map(([r]) => `<li>${bi2(r)}</li>`).join('')}</ol>
<h3 class="gh">Example · 예시</h3>${goji(f.sample, f.cols)}
<p class="note2">${esc(f.sample)}</p>
<div class="bx more">${legend('more')}<div class="tt">${esc(f.caution.en)}<br><small style="color:#5a6780">${esc(f.caution.ko)}</small></div></div></div>`;
}
function fmWritten() {
  const f = FRONT.written; const tb = (rows, l, r) => `<table><thead><tr><th>${l}</th><th>${r}</th></tr></thead><tbody>${rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td class="to"><b>${esc(b)}</b></td></tr>`).join('')}</tbody></table>`;
  return `<div class="blk plain gd fm">${fmHead(f.title.en, f.title.ko)}<p class="lead">${bi2(f.intro)}</p>
<div class="two"><div><h3 class="gh">Words · 낱말</h3>${tb(f.words, 'Spoken · 말', 'Written · 글')}</div><div><h3 class="gh">Endings · 문장 끝</h3>${tb(f.ends, 'Spoken · 말', 'Written · 글')}</div></div>
<div class="bx tip">${legend('tip')}<div class="tt">${esc(f.note.en)}<br><small style="color:#5a6780">${esc(f.note.ko)}</small></div></div></div>`;
}
function fmCheck() {
  const g = FRONT.check[B.front].groups;
  return `<div class="blk plain gd fm">${fmHead('Self-check · Before you hand in', '자가 점검표 · 내기 전에')}
<div class="ck">${g.map(([k, items]) => `<div class="cg"><h4>${bi2(k)}</h4>${items.map((it) => `<div class="ci"><i></i><span>${esc(it.en)}<small>${esc(it.ko)}</small></span></div>`).join('')}</div>`).join('')}</div>
<h3 class="gh">Score log · 점수 기록</h3>
<table class="lg2"><thead><tr><th>Date · 날짜</th><th>Q · 문제</th><th>Score · 점수</th><th>What to fix · 고칠 것</th></tr></thead><tbody>${Array.from({ length: 6 }, () => '<tr><td></td><td></td><td></td><td></td></tr>').join('')}</tbody></table>
${qrBox()}</div>`;
}
/* 유형별 풀이 방법 + 필요한 단어(TOPIK I 읽기 모의고사). 한 쪽에 두 유형씩 */
function methodsPages() {
  const page = (m, i) => {
    const ex = m.example, tk = (t) => esc(t).replace(/\(\s{2}\)/g, '<u class="mb"></u>');
    return `<div class="blk plain mtp"><div class="mth"><b>TYPE ${i + 1}</b><span>${esc(m.name.ko)}<small>${esc(m.name.en)}</small></span><em>${esc(m.nos)}번 · ${m.count}문항</em></div>
<div class="mta">${esc(m.ask.ko)}<small>${esc(m.ask.en)}</small></div>
<div class="mtl">Solve it step by step · 차례대로 풀기</div>
<ol class="mts">${m.steps.map((x, k) => `<li><i>${k + 1}</i><div>${esc(x.ko)}<small>${esc(x.en)}</small>${x.sub ? `<ul>${x.sub.map((y) => `<li>${esc(y.ko)}<small>${esc(y.en)}</small></li>`).join('')}</ul>` : ''}</div></li>`).join('')}</ol>
<div class="mex"><div class="mexh">Try it · 따라 풀기 <span>모의고사 ${ex.test}회 ${ex.no}번</span></div>${ex.sentence ? `<div class="mbo"><i>&lt;보기&gt;</i> ${cm(esc(ex.sentence))}</div>` : ''}<div class="mp">${cm(tk(ex.passage))}</div><div class="mexo">${ex.options.map((o, k) => `<span>${cn(k)}${cm(esc(o))}</span>`).join('')}</div><div class="mexa"><b>정답 ${cn(ex.answer)}</b> ${cm(esc(ex.why))}</div></div>
<div class="mtw"><b>Words you need · 필요한 단어</b><div>${m.words.map((w) => `<span>${esc(w.ko)}<small>${esc(w.en)}</small></span>`).join('')}</div></div>
<div class="mtr">${esc(m.trap.ko)}<small>${esc(m.trap.en)}</small></div></div>`;
  };
  return B.methods.map(page).join('\n');
}
const FRONT_LIST = B.front ? [['fm1', 'Exam overview', '시험 소개', fmExam], ['fm2', FRONT.plan[B.front].title.en, FRONT.plan[B.front].title.ko, fmPlan], ['fm3', 'Answer grid (원고지)', '원고지 쓰기법', fmGoji], ['fm4', 'Spoken → written', '말 → 글 바꾸기 표', fmWritten], ...(KDP ? [] : [['fm5', 'Self-check', '자가 점검표', fmCheck]])] : B.methods ? [['fm1', 'How to solve each type', '유형별 풀이 방법 · 필요한 단어', methodsPages]] : [];

function partPage(p) {
  const many = p.sheets.length > 10;   // 단어장처럼 단원이 많으면 짧게 쓰고 두 줄로 나눠 부 표지 밖으로 넘치지 않게
  const list = p.sheets.map((s) => { const u = units.find((x) => x.id === s.id); return `Unit ${String(u.no).padStart(2, '0')} &nbsp; ${esc(many ? s.title.en.split(' · ')[0] : s.title.en)}`; }).join('<br>');
  if (LV) return `<div class="blk pd lv"><div class="fr"></div><div class="ptp"><span>${KDP ? 'KOREAN STUDY SERIES' : 'KOREAN WORKBOOK SERIES'}</span><span>${esc(LV.code)} · ${esc(LV.name)}</span></div><div class="no">PART</div><div class="big">${String(p.no).padStart(2, '0')}</div><div class="orn"></div><h2>${esc(p.title.ko)}</h2><h3>${esc(p.title.en)}</h3><div class="list${many ? ' mc' : ''}">${list}</div><div class="ft"><div class="mini">${lvMascot}</div>${logoSvg({ fg: LVG[0], one: true, height: '4mm' })}</div></div>`;
  return `<div class="blk pd"><div class="no">PART ${p.no}</div><div class="big">${String(p.no).padStart(2, '0')}</div><h2>${esc(p.title.ko)}</h2><h3>${esc(p.title.en)}</h3>
<div class="list${many ? ' mc' : ''}">${list}</div></div>`;
}
/* 한 장 요약 · 풀이 쪽의 「예시」 — 우리 창작 문항(topik-writing.js)의 지문 + 모범답안 */
function exampleHtml(s) {
  const x = TWM.TW_ITEMS.find((i) => i.id === s.item); if (!x) throw new Error('없는 문항 ' + s.item);
  if (x.blanks) return `<div class="wp">${esc(x.passage)}</div>${x.blanks.map((b) => `<div class="wl"><b>${esc(b.mark)}</b><span class="wans">${b.answers.slice(0, 2).map(esc).join(' &nbsp;/&nbsp; ')}</span></div>`).join('')}`;
  return `${s.showData && x.data ? `<ul class="wd">${x.data.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}<div class="wp" style="white-space:pre-line">${esc(x.model)}</div>`;
}
/* 53 · 54번 쓰는 칸은 원고지처럼 한 글자씩(운영자 2026-10-30 「원고지 스타일로」). 100자마다 오른쪽에 글자 수 */
const wgrid = (max) => { const per = max > 400 ? 27 : 25, rows = Math.ceil(max / per); return `<div class="gw" style="--n:${per}">${Array.from({ length: rows }, (_, r) => `<div class="gr">${'<span></span>'.repeat(per)}${Math.floor(((r + 1) * per) / 100) > Math.floor((r * per) / 100) ? `<i>${Math.floor(((r + 1) * per) / 100) * 100}</i>` : ''}</div>`).join('')}</div>`; };
const wlines = (n, per = 30) => `<div class="wg">${Array.from({ length: n }, (_, i) => `<div class="wr">${(i + 1) % 5 === 0 ? `<i>${(i + 1) * per}</i>` : ''}</div>`).join('')}</div>`;
/* ── 53 · 54번 풀이 순서(안내 쪽) — 예시 문제 하나를 자료 밑줄 → 덩어리 짜기 → 쓰기 → 점검으로 따라간다(운영자 2026-10-30 「좋아 이 모양으로 다」).
   원본: docs/writing-book/walkthrough.json(유형마다 예시 문항 id · 밑줄 글 · 덩어리 · 해설) + topik-writing.js(문항 글 · 모범답안). 밑줄 글이 모범답안에 없으면 빌드가 멈춘다. */
let WTC; const wtSpec = () => (WTC ||= (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/writing-book/walkthrough.json'), 'utf8')); } catch { return {}; } })());
function walkHtml(uid) {
  const sp = wtSpec()[uid]; if (!sp) return { a: '', b: '' };
  const x = TW.find((t) => t.id === sp.item); if (!x) throw new Error(`walkthrough ${uid}: 없는 문항 ${sp.item}`);
  const k54 = sp.kind === '54';
  for (const arr of Object.values(sp.marks)) for (const str of arr) if (!x.model.includes(str)) throw new Error(`walkthrough ${uid}: 「${str}」가 모범답안에 없다`);
  for (const b of sp.bold || []) if (!x.model.includes(b)) throw new Error(`walkthrough ${uid}: 굵게 「${b}」가 모범답안에 없다`);
  const hl = (text, withMarks) => {
    const iv = [];
    if (withMarks) for (const [k, arr] of Object.entries(sp.marks)) for (const str of arr) { const i = text.indexOf(str); if (i >= 0) iv.push([i, i + str.length, k]); }
    iv.sort((a, b) => a[0] - b[0]);
    const bold = (t) => { let h = esc(t); for (const b of sp.bold || []) h = h.replace(esc(b), `<b>${esc(b)}</b>`); return h; };
    let out = '', pos = 0;
    for (const [a, b, k] of iv) { if (a < pos) continue; out += bold(text.slice(pos, a)) + `<u class="u${k}">${esc(text.slice(a, b))}</u>`; pos = b; }
    return out + bold(text.slice(pos));
  };
  const chip = (k) => `<span class="g${k}">${k}</span>`;
  const U = (k, t) => `<u class="u${k}">${esc(t)}</u>`;
  const st = (n, ko, en) => `<div class="st"><i>${n}</i><h2>${esc(ko)}<small>${esc(en)}</small></h2></div>`;
  const dataRows = k54
    ? x.tasks.map((t, i) => `<div>${chip(sp.rows[i][0])}<em>${esc(sp.rows[i][1])}</em><span>${U(sp.rows[i][0], t)}</span></div>`).join('')
    : x.data.map((line, i) => { const [k, lb] = sp.rows[i]; const vals = line.split(' · ').map((p) => { const c = p.indexOf(': '); return U(k, c < 0 ? p : p.slice(c + 2)); }).join(' · '); return `<div>${chip(k)}<em>${esc(lb)}</em><span>${vals}</span></div>`; }).join('');
  const cards = sp.step2.cards.map((c, i) => `<div class="card"><h3><span>${c.n}</span>${esc(c.t)}</h3><div class="src">${c.src.map(chip).join('')}</div><p>${esc(c.f).replace(/〔[^〕]*〕/g, (m) => `<span class="bk">${m}</span>`).replace(new RegExp((c.b || []).map((b) => esc(b).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') || '$^', 'g'), (m) => `<b>${m}</b>`)}</p></div>`).join('');
  const units2 = k54 ? x.model.split(/\n\s*\n/) : x.model.split(/(?<=\.)\s+/);
  const rowsHtml = sp.groups.map((g, i) => {
    const txt = k54 ? units2[g.p] : g.s.map((j) => units2[j]).join(' ');
    return `<div class="wrw"><b>${'①②③④'[i]}</b><div><span class="t">${hl(txt, true)}</span><span class="w">${esc(g.w)}</span></div></div>`;
  }).join('');
  const n = x.model.replace(/\n/g, '').length, inRange = n >= x.min && n <= x.max;
  const chks = [['글자 수', `${x.min}~${x.max}자${inRange ? ` · ${n}자 ✓` : ` · ${n}자`}`], ...sp.checks].map(([b, t]) => `<div><b>${esc(b)}</b>${esc(t)}</div>`).join('');
  const a = `<div class="wt2 wt2a"><div class="wh">EXAMPLE · 예시 문제 · ${esc(sp.step1.en)} · 풀이 순서</div>
<div class="q"><b>QUESTION · 예시 문제 (${esc(x.id)})</b>${esc(x.passage)}</div>
${st(1, sp.step1.ko, sp.step1.en)}<div class="data">${dataRows}</div><div class="note">${esc(sp.step1.note)}</div>
${st(2, sp.step2.ko, sp.step2.en)}<div class="flow" style="--n:${sp.step2.cards.length}">${cards}</div><div class="note">${esc(sp.step2.note)}</div></div>`;
  const b = `<div class="blk plain gd wt2">${st(3, '쓰기', 'Write · 밑줄 색 = 자료(질문)의 어느 부분인지')}${rowsHtml}<div class="note">모범답안 ${n}자 · Model answer</div>
${st(4, '점검하기', 'Check')}<div class="chk" style="--n:${sp.checks.length + 1}">${chks}</div></div>`;
  return { a, b };
}
/* 문제마다 스스로 점검(운영자 2026-10-30 「문제마다 점검표, 몇 자 썼는지 셀프로 확인」): 글자 수 칸 + 과제 칸 */
const selfCheckBox = (x) => `<div class="sck"><div class="scn"><b>몇 자? · Count</b><span class="scl"></span>자 <small>${x.min}~${x.max}자 (띄어쓰기 포함)</small></div><ul>${[...x.tasks, ...(x.q === 54 ? ['문단을 나누었다'] : []), '-(느)ㄴ다체로 끝까지 썼다', '제목을 쓰지 않았다'].map((t) => `<li><i></i>${esc(t)}</li>`).join('')}</ul></div>`;
function writingHtml(x) {
  /* 풀이 예시로 이미 보여 준 문항은 같은 글을 또 싣지 않는다(운영자 2026-10-30 「같은 페이지 반복 이상해」) — 번호와 정답은 그대로 */
  if (x._ref) return `<div class="wref"><b>풀이 예시 · Worked example</b> 이 문제는 앞의 「풀이 예시」에서 단계별로 풀었어요. · This question was solved step by step in the worked example earlier in the book.</div>`;
  const cond = x.cond ? `<div class="wc">${esc(x.cond)}</div>` : '';
  if (x.q <= 52) return `<div class="wp">${esc(x.passage)}</div>${cond}${x.blanks.map((b) => KDP ? `<div class="wl"><b>${esc(b.mark)}</b><span class="wans">${b.answers.slice(0, 2).map(esc).join(' &nbsp;/&nbsp; ')}</span></div>` : `<div class="wl"><b>${esc(b.mark)}</b><span class="wln"></span></div>`).join('')}`;
  /* 53번 자료는 시험처럼 그래프로(숫자는 줄글에 있는 것만 — tools/lib/tw-chart.mjs, 검사 check-tw-charts). 못 읽으면 예전 목록 */
  const twp = x.data && x.q === 53 ? parseTwData(x.data) : null;
  const data = twp ? `${twChartSvg(twp, { acc: ACC, tint: TINT, variant: Number(String(x.id).split('-')[1]) || 0 })}` : x.data ? `<ul class="wd">${x.data.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '';
  return `<div class="twq" style="break-inside:avoid"><div class="wp">${esc(x.passage)}</div>${data}</div><ol class="wt">${x.tasks.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>${cond}${B.front === '5354' ? wlines(Math.ceil(x.max / 40), 40).replace('class="wg"', 'class="wg wg2"') + selfCheckBox(x) : wgrid(x.max)}`;
}
/* 객관식 모의고사 문항(TOPIK I 읽기 모의고사): 짝 지문은 한 번만 보이고, 보기는 ①~④. 정답 · 풀이는 정답 쪽에 */
const CIRC = ['①', '②', '③', '④'];
/* ㉠㉡㉢㉣ 는 글꼴마다 크기가 달라서 같은 크기의 동그라미 + ㄱㄴㄷㄹ 로 그린다 */
const CMK = { '㉠': 'ㄱ', '㉡': 'ㄴ', '㉢': 'ㄷ', '㉣': 'ㄹ' };
const cn = (i) => `<span class="cm">${i + 1}</span>`;   // 보기 번호 ①~④ 도 같은 동그라미로
const cm = (h) => h.replace(/[㉠㉡㉢㉣]/g, (c) => `<span class="cm">${CMK[c]}</span>`);
const mcqText = (t) => cm(esc(t).replace(/\(\s{2}\)/g, '<u class="mb"></u>'));
function mcqHtml(s) {
  const done = new Set(); const out = [];
  for (const q of s.items) {
    if (done.has(q.no)) continue;
    const grp = q.pair ? s.items.filter((x) => x.pair === q.pair) : [q];
    grp.forEach((x) => done.add(x.no));
    const [a, b] = q.pair ? q.pair.split('-') : [];
    const one = (x) => {
      const short = x.options.every((o) => [...o].length <= 9);
      return `<div class="mq1"><div class="mqh"><b>${x.no}.</b> ${esc(x.question)}</div>${x.sentence ? `<div class="mbo"><i>&lt;보기&gt;</i> ${cm(esc(x.sentence))}</div>` : ''}${q.pair ? '' : `<div class="mp">${mcqText(x.passage)}</div>`}<ol class="mo${short ? ' g' : ''}">${x.options.map((o, i) => `<li>${cn(i)}${cm(esc(o))}</li>`).join('')}</ol></div>`;
    };
    out.push(`<div class="mg${q.pair ? ' pr2' : ''}">${q.pair ? `<div class="mh">※ [${a}~${b}] 다음을 읽고 물음에 답하십시오.</div><div class="mp">${mcqText(q.passage)}</div>` : ''}${grp.map(one).join('')}</div>`);
  }
  return out.join('');
}
const omrHtml = (s) => {
  const bub = (n) => `<span class="ob">${n}</span>`;
  const col = (from, to) => `<div class="oc"><div class="oh"><b>번호</b><span>답 (Answer)</span></div>${Array.from({ length: to - from + 1 }, (_, i) => from + i).map((n) => `<div class="or"><b>${n}</b>${[1, 2, 3, 4].map(bub).join('')}</div>`).join('')}</div>`;
  const mid = Math.floor((s.from + s.to) / 2);
  const idg = Array.from({ length: 8 }, () => `<div class="oi8">${Array.from({ length: 10 }, (_, d) => `<span class="ob s">${d}</span>`).join('')}</div>`).join('');
  return `<div class="osheet"><div class="otop"><div class="ot1"><b>TOPIK I 읽기 연습 답안지</b><small>Reading Practice · Answer Sheet</small></div><div class="ot2">모의고사 <u></u> 회 &nbsp; Test No.</div></div>
<div class="ohead"><div class="onum"><div class="olab">수험번호 <small>Registration No.</small></div><div class="oid">${idg}</div></div>
<div class="oside"><div class="onm"><span>이름 · Name (한국어)</span><u></u></div><div class="onm"><span>이름 · Name (English)</span><u></u></div><div class="onm"><span>날짜 · Date</span><u></u></div>
<div class="omk"><b>표기 방법 · How to mark</b><div class="omk1"><span class="ob f">1</span> 올바른 표기 · right <span class="ob x">2</span><span class="ob y">3</span> 잘못된 표기 · wrong</div><small>연필이나 사인펜으로 번호 안을 진하게 칠하세요. 고친 답은 지우개로 깨끗이 지웁니다.</small></div></div></div>
<div class="om">${col(s.from, mid)}${col(mid + 1, s.to)}</div>
<div class="os"><span>Correct answers · 맞은 개수 <u></u> / ${s.to - s.from + 1}</span><span>Minutes I used · 걸린 시간 <u></u></span></div></div>`;
};
const qw = (items) => { const m = Math.max(...items.filter((x) => !/_{3}/.test(x.q)).map((x) => [...x.q].length), 0); return m <= 12 ? '34%' : m <= 22 ? '48%' : m <= 34 ? '60%' : '72%'; };
function unitBlock(u) {
  /* 풀이 순서 쪽(walkthrough)이 있는 안내 단원은 예전 「글의 틀 · 읽는 법」 두 칸을 대신한다 */
  const secs = wtSpec()[u.id] ? u.sections.filter((s, i) => !(i < 2 && (s.type === 'flow' || s.type === 'text'))) : u.sections;
  const open = `<div class="blk uo ${unitCss(u)}" style="page:unitopen"><div class="band"></div><div class="pn">PART ${u.part.no} · ${esc(u.part.title.en.toUpperCase())}</div><div class="no">UNIT ${String(u.no).padStart(2, '0')}</div>
<div class="ttl"><h2>${esc(u.title.ko)}</h2><h3>${esc(u.title.en)}</h3><p class="sub">${esc(u.sub.en)}<small>${esc(u.sub.ko)}</small></p></div>
<div class="in"><b>IN THIS UNIT · 이 단원에서</b><ol>${secs.map((s) => `<li>${esc(s.title.en)}${s.title.ko ? `<small>${esc(s.title.ko)}</small>` : ''}</li>`).join('')}</ol></div></div>`;
  if (CLASSIC) {
    const head = `<div class="uh"><div class="un">UNIT ${String(u.no).padStart(2, '0')} &nbsp;·&nbsp; PART ${u.part.no} ${esc(u.part.title.en.toUpperCase())}</div><div class="ut"><h2>${esc(u.title.ko)}</h2><h3>${esc(u.title.en)}</h3></div></div><p class="us">${esc(u.sub.en)}<small>${esc(u.sub.ko)}</small></p>`;
    /* 실전 문제 단원은 첫 쪽에 이 단원의 문제 목록을 둔다 — 구역을 나누고 빈 쪽을 줄인다(운영자 2026-10-30 「실전문제 · 예시 문제로 정확히 나누자」) */
    const ws = B.front === '5354' ? u.sections.filter((x) => x.type === 'writing') : [];
    u._head = head + (ws.length ? `<div class="pcl"><div class="pct">PRACTICE · 실전 문제 <small>${ws.length}문제</small></div><ol start="${parseInt(ws[0].title.en, 10) || 1}">${ws.map((x) => `<li>${esc(x.title.en.replace(/^\d+\.\s*/, ''))}</li>`).join('')}</ol><p>원고지에 쓰려면 맨 뒤 정답 끝의 「원고지 양식」을 인쇄해 쓰세요. · For the answer grid, print the form at the very end of the book.</p>${(parseInt(ws[0].title.en, 10) || 1) > 1 ? '<p>1번은 앞의 안내 쪽에서 예시 문제로 풀었어요. · Question 1 was solved as the example in the guide pages.</p>' : ''}</div>` : '');
  }
  const sr = (i) => (REVIEW ? `<span class="src">${esc(u.id)} · §${i + 1} · ${esc(secs[i].type)}</span>` : '');
  const kcount = {};
  const body = secs.map((s, si) => {
    /* 쓰기 책: 번호는 종류마다 따로(연습 1-1 · 연습 1-2, 핵심 정리 1-1 …), 실전 문제는 문제 번호 그대로(운영자 2026-10-30 「번호 정리 제대로」) */
    if (B.front) { const lb = s.type === 'writing' ? '실전 문제' : s.type === 'text' ? (() => { const kk = CLASSIC ? kindOf(u, si, s) : 'ref'; return kk === 'tip' || kk === 'warn' ? '팁 · 주의' : kk === 'ref' ? LAB.text : BLK[kk][1]; })() : LAB[s.type]; kcount[lb] = (kcount[lb] || 0) + 1; secNo = s.type === 'writing' ? String(parseInt(s.title.en, 10) || kcount[lb]) : `${u.no}-${kcount[lb]}`; }
    else secNo = `${u.no}-${si + 1}`;
    if (s.type === 'table') {
      const tipCols = s.cols.map((c) => /reading|tip|sound|pronunc/i.test(c));
      return `<div class="sec"${s.rows.length <= 8 ? ' style="break-inside:avoid"' : ''}>${sr(si)}${secLabel(s)}<table${/^Context/.test(s.cols[s.cols.length - 1]) ? ' class="ctx"' : ''}><thead><tr>${s.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${s.rows.map((r) => `<tr>${r.map((c, i) => `<td${tipCols[i] ? ' class="tip"' : ''}>${tagsOr(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>${s.note ? (CLASSIC ? blockHtml(u, si, s, s.note) : `<div class="note">${esc(s.note)}</div>`) : ''}</div>`;
    }
    if (s.type === 'text') {
      const k = CLASSIC ? kindOf(u, si, s) : 'ref';
      if (k !== 'ref') return `<div class="sec">${sr(si)}${secLabel(s, B.front && (k === 'tip' || k === 'warn') ? '팁 · 주의' : BLK[k][1])}${blockHtml(u, si, s, s.text)}</div>`;
      return `<div class="sec">${sr(si)}${secLabel(s)}<div class="note">${esc(s.text)}</div></div>`;
    }
    /* 낱말 목록(운영자 2026-10-25 「단어장 형식 · 난이도는 치즈로 빈출도는 감자로」): 낱말마다 번호 · 큰 낱말 · 뜻 · 예문 · 치즈(급) · 감자(자주 나오는 정도) */
    if (s.type === 'vocab') {
      const ic = (kind, n, max) => Array.from({ length: max }, (_, i) => (kind === 'c' ? cheeseIc(i < n) : potatoIc(i < n))).join('');
      const bold = (ko, w) => { const h = esc(ko); const stem = w.endsWith('다') ? w.slice(0, -1) : w; const k = ko.includes(w) ? w : stem.length >= 1 && ko.includes(stem) ? stem : ''; return k ? h.replace(esc(k), `<b>${esc(k)}</b>`) : h; };
      const hasFq = s.entries.some((e) => e.fq != null);   // 표현 책(관용구 · 속담 · 사자성어)은 빈출도 감자가 없다
      const legend = `<div class="vlg"><span>${ic('c', 1, 1)} <b>Difficulty · 난이도</b> = TOPIK level: more cheese, harder</span>${hasFq ? `<span>${ic('p', 1, 1)} <b>Frequency · 빈출도</b>: more potato, appears more often (same scale in every book)</span>` : ''}</div>`;
      const exH = (x, w) => `<div class="vx">${bold(x.ko, w)}<small>${esc(x.en)}</small></div>`;
      return `<div class="sec vsec">${sr(si)}${secLabel(s)}${legend}${s.entries.map((e, k) => `<div class="vw"${s.rowH ? ` style="height:${s.rowH}mm"` : ''}><div class="vn">${(s.from || 0) + k + 1}</div><div class="vb"><div class="vh"><b>${esc(e.ko)}</b>${e.hanja ? `<span class="vhj">${esc(e.hanja)}</span>` : ''}<span class="vp">${esc(e.pos)}</span><span class="vi">${ic('c', e.lv - (B.cheeseBase ?? 2), B.cheeseMax ?? 4)}${e.fq != null ? `<em></em>${ic('p', e.fq, 5)}` : ''}</span></div><div class="ve">${esc(e.en)}</div>${e.km ? `<div class="vl vk">뜻 · ${esc(e.km)}</div>` : ''}${e.lit || e.eq ? `<div class="vl">${e.lit ? `<span>Literally · 직역: ${esc(e.lit)}</span>` : ''}${e.eq ? `<span>Like: ${esc(e.eq)}</span>` : ''}</div>` : ''}${exH(e.ex, e.ko)}${e.ex2 ? exH(e.ex2, e.ko) : ''}</div></div>`).join('')}</div>`;
    }
    /* 단원 점검(운영자 2026-10-25 「체크업도 이런 느낌」): 뜻 짝짓기 + 낱말 상자 빈칸. 정답은 뒤쪽 정답 쪽에 */
    if (s.type === 'checkup') {
      const L = 'abcdef';
      const m = s.match, c = s.cloze, n0 = m.words.length;
      if (KDP) return `<div class="sec cku">${sr(si)}${secLabel(s)}<p class="cki">Each word with its meaning. Cover the right side and test yourself. <small>낱말과 뜻입니다. 오른쪽을 가리고 스스로 확인해 보세요.</small></p><ol class="pr kdp">${m.words.map((w, i) => `<li class="kq"><span class="q">${esc(w)}</span><span class="kans">→ ${esc(m.options[L.indexOf(m.answer[i])])}</span></li>`).join('')}</ol><p class="cki">Choose the word that fits each sentence. <small>문장에 맞는 낱말입니다. 정답을 가리고 확인하세요.</small></p><ol class="pr kdp">${c.items.map((x) => `<li class="kq"><span class="q">${esc(x.q).replace('___', '<span class="bl"></span>')}<small>${esc(x.en)}</small></span><span class="kans">→ ${esc(x.a)}</span></li>`).join('')}</ol></div>`;
      return `<div class="sec cku">${sr(si)}${secLabel(s)}<p class="cki">${m.inst ? esc(m.inst.en) : 'Match each word with its meaning. Write the letter on the line.'} <small>${m.inst ? esc(m.inst.ko) : '낱말과 뜻을 짝지어 알맞은 글자를 쓰세요.'}</small></p><div class="ckm"><ol>${m.words.map((w, i) => `<li><b>${String(i + 1).padStart(2, '0')}</b><span>${esc(w)}</span><i class="ckl"></i></li>`).join('')}</ol><ul>${m.options.map((o, i) => `<li><span class="lt">${L[i]}</span>${esc(o)}</li>`).join('')}</ul></div>
<p class="cki">${c.inst ? esc(c.inst.en) : 'Choose the word that fits each sentence.'} <small>${c.inst ? esc(c.inst.ko) : '문장에 맞는 낱말을 상자에서 골라 쓰세요.'}</small></p><ol class="ckc" start="${n0 + 1}">${c.items.map((x, i) => `<li><b>${String(n0 + i + 1).padStart(2, '0')}</b><span>${esc(x.q).replace('___', '<u></u>')}<small>${esc(x.en)}</small></span></li>`).join('')}</ol><div class="ckb" style="--n:${c.cols || c.bank.length}">${c.bank.map((w, i) => `<span><span class="lt">${L[i]}</span>${esc(w)}</span>`).join('')}</div></div>`;
    }
    /* 헷갈리는 낱말(유의어 · 동음이의어 · 반대말) — 표 대신 한 줄씩: 왼쪽 낱말 + 종류 알약, 오른쪽 설명 */
    if (s.type === 'compare') {
      const KD = { homonym: ['동음이의어', 'Same spelling', '#5B3FA0', '#EFEAF8'], synonym: ['비슷한 말', 'Similar', '#2F7D5B', '#E7F4EE'], antonym: ['반대말', 'Opposites', '#C4551C', '#FDEEE2'], contrast: ['헷갈림', 'Mix-up', '#B03A3A', '#FBEAEA'] };
      return `<div class="sec cmp">${sr(si)}${secLabel(s)}${s.items.map((x) => { const k = KD[x.kind] || KD.contrast; const ws = [...new Set(x.words)]; return `<div class="ci"><div class="cw"><b>${ws.map(esc).join('<i> · </i>')}</b><span class="cp" style="color:${k[2]};background:${k[3]}">${k[0]}<small>${k[1]}</small></span></div><p>${esc(x.note)}</p></div>`; }).join('')}</div>`;
    }
    /* 「내 계획」 칸(운영자 2026-10-25 시안 A) — 쓰는 줄 2열 · 요일 동그라미 · 목표 상자. 표 대신 쓴다 */
    if (s.type === 'plan') {
      const lab = (f) => `<div class="plk"><b>${esc(f.en)}</b><small>${esc(f.ko)}</small></div>`;
      const dk = ['월 Mon', '화 Tue', '수 Wed', '목 Thu', '금 Fri', '토 Sat', '일 Sun'].map((d) => { const [ko, en] = d.split(' '); return `<i><b>${ko}</b><small>${en}</small></i>`; }).join('');
      return `<div class="sec" style="break-inside:avoid">${sr(si)}${secLabel(s)}<div class="plan"><div class="plg">${s.fields.map((f) => `<div>${lab(f)}<div class="pll"></div></div>`).join('')}</div><div class="pld">${lab(s.days)}<div class="pldc">${dk}</div></div><div class="plgl">${lab(s.goal)}<div class="pll"></div><div class="pll"></div></div></div></div>`;
    }
    if (s.type === 'flow') return `<div class="sec">${sr(si)}${secLabel(s)}<div class="flow">${s.steps.map((st) => `<div class="fs${st.blank ? ' bl' : ''}"><b>${esc(st.ko)}</b><span>${esc(st.en)}</span></div>`).join('<i class="ar">→</i>')}</div></div>`;
    if (s.type === 'example') return `<div class="sec">${sr(si)}${secLabel(s)}${exampleHtml(s)}</div>`;
    if (s.type === 'mcq') return `<div class="sec mqs">${sr(si)}${secLabel(s)}${mcqHtml(s)}</div>`;
    if (s.type === 'omr') return `<div class="sec omr">${sr(si)}${secLabel(s)}${omrHtml(s)}</div>`;
    if (s.type === 'writing') return `<div class="sec wq${s.raw._ref ? ' wqref' : ''}">${sr(si)}${secLabel(s)}${writingHtml(s.raw)}</div>`;
    return `<div class="sec"${s.items.length <= 8 ? ' style="break-inside:avoid"' : ''}>${sr(si)}${secLabel(s)}${KDP ? `<div class="hint">${s.items.every((x) => openAns(x.a)) ? 'Say your own sentences aloud. · 내 문장을 소리 내어 말해 보세요.' : 'Cover the answer below each question, say it aloud or work it out in your head, then check. · 문제 아래 정답을 가리고 소리 내어 말하거나 머릿속으로 풀어 본 뒤 확인하세요.'}</div>` : s.hint ? `<div class="hint">${esc(s.hint)}${YES24 && !s.think && !s.items.every((x) => openAns(x.a)) ? ' Answers are in the small upside-down box below. · 정답은 아래 작은 거꾸로 상자에 있어요.' : ''}</div>` : ''}${s.think && !KDP ? `<ol class="pr th">${s.items.map((x) => `<li><span class="q">${esc(x.q).replace(/_{3,}/g, '<span class="bl"></span>')}</span><span class="tl"></span><span class="tl"></span></li>`).join('')}</ol>` : `<ol class="pr${KDP ? ' kdp' : ''}" style="--qw:${qw(s.items)}">${s.items.map((x) => KDP ? `<li class="kq"><span class="q">${esc(x.q.replace(/\s*→\s*$/, '').replace(/^Write\b/, 'Say')).replace(/_{3,}/g, '<span class="bl"></span>')}</span>${openAns(x.a) ? '' : `<span class="kans">→ ${esc(x.a)}</span>`}</li>` : `<li${liCls(x.q) ? ` class="${liCls(x.q)}"` : ''}>${qLine(x.q)}</li>`).join('')}</ol>`}${YES24 && !s.think && !s.items.every((x) => openAns(x.a)) ? `<div class="yrev"><span>${s.items.map((x, i) => (openAns(x.a) ? '' : `${i + 1}) ${esc(x.a)}`)).filter(Boolean).join(' &nbsp;·&nbsp; ')}</span></div>` : ''}</div>`;
  }).join('\n');
  if (CLASSIC) return dialogueOpener(u) + `<div class="blk ${unitCss(u)}" style="page:${unitCss(u)}">${u._head}${walkHtml(u.id).a ? '' : unitQr(u)}${appCheck(u)}${walkHtml(u.id).a ? walkHtml(u.id).a + '</div>' + walkHtml(u.id).b.replace(/<\/div>$/, unitQr(u) + '</div>') + `<div class="blk ${unitCss(u)}" style="page:${unitCss(u)}">` : ''}${body}${lookalike(u)}${selfCheck(u)}</div>`;
  return dialogueOpener(u) + open + `<div class="blk ${unitCss(u)}" style="page:${unitCss(u)}">${walkHtml(u.id).a ? walkHtml(u.id).a + '</div>' + walkHtml(u.id).b.replace(/<\/div>$/, unitQr(u) + '</div>') + `<div class="blk ${unitCss(u)}" style="page:${unitCss(u)}">` : ''}${body}${lookalike(u)}${selfCheck(u)}${walkHtml(u.id).a ? '' : unitQr(u)}</div>`;
}
const dialogueOpener = (u) => {
  const o = u.opener; if (!o) return '';
  const rib = `<svg viewBox="0 0 78 26" preserveAspectRatio="none"><path d="M0 4h8v18H0l5 -9z M70 4h8l-5 9 5 9h-8z" fill="${LV ? LVG[1] : ACC}" opacity=".6"/><path d="M6 0h66v22H6z" fill="${LV ? LVG[0] : ACC}"/><path d="M6 22v4l6-4zM72 22v4l-6-4z" fill="#000" opacity=".28"/></svg>`;
  return `<div class="blk dop${LV ? ' lv' : ''}">${LV ? '<div class="fr"></div>' : ''}<div class="rb">${rib}<b>DIALOGUE</b><i>${esc(o.no)}</i></div><div class="dbx"><span></span></div><div class="tx"><h2>${esc(o.ko)}</h2><p>${esc(o.en)}</p></div><div class="dt"></div><div class="pl">${esc(o.place.en)}<small>${esc(o.place.ko)}</small></div>${LV ? `<div class="ft"><div class="mini">${lvMascot}</div>${logoSvg({ fg: LVG[0], one: true, height: '4mm' })}</div>` : ''}</div>`;
};
function answersBlock() {
  let h = `<div class="blk plain ak"><h2>Answer Key</h2><div class="k">정답</div>`;
  for (const u of units) {
    h += `<div class="u"><h4><span>UNIT ${String(u.no).padStart(2, '0')}</span>${esc(u.title.en)}<small>${esc(u.title.ko)}</small></h4>`;
    for (const s of u.sections.filter((x) => x.type === 'writing')) {
      const x = s.raw;
      if (x.q <= 52) h += `<div class="set a wa"><b>${esc(s.title.en)}</b> ${x.blanks.map((b) => `${esc(b.mark)} ${b.answers.map(esc).join(' / ')}`).join(' &nbsp;·&nbsp; ')}<small>${x.blanks.map((b) => esc(b.point)).join(' ')}</small><small class="dd">감점 · ${x.deduct.map(esc).join(' · ')}</small></div>`;
      else {
        /* 53 · 54번 답지: 문제마다 상 · 중 · 하 답안을 그대로, 점수 · 이유 · 감점 포인트와 함께(운영자 2026-10-30 「답지도 상중하로 꼼꼼하게」) */
        const pt = TWM.TW_QS.find((t) => t.q === x.q)?.pt || 0, AR = { content: '내용', structure: '구성', language: '언어' };
        const sm = x.samples || [], tone = { 상: 'hi', 중: 'mid', 하: 'lo' };
        h += `<div class="akq"><h4><b>${esc(s.title.en)}</b><em>${pt}점 만점</em></h4><p class="akc">${Object.entries(x.points).map(([k, v]) => `<span><b>${AR[k] || k}</b> ${esc(v)}</span>`).join('')}</p>${sm.map((m, k) => `<div class="akr ${tone[m.level] || ''}"><div class="akh"><b>${esc(m.level)}</b><span>${k === 0 ? '모범답안 · 이렇게 쓰세요' : '이렇게 쓰면 안 돼요'}</span><em>${m.total}<small>/${pt}</small></em><small>${Object.entries(m.scores || {}).map(([a, v]) => `${AR[a] || a} ${v}`).join(' · ')}</small></div><p class="akt">${esc(k === 0 ? x.model : m.text).replace(/\n+/g, ' ¶ ')}</p><p class="akw">${esc(m.why)}</p></div>`).join('')}<p class="akd"><b>감점 포인트</b> ${(x.deduct || []).map(esc).join(' · ')}</p></div>`;
      }
    }
    for (const s of u.sections.filter((x) => x.type === 'mcq')) {
      const TN = B.methods ? Object.fromEntries(B.methods.flatMap((m) => [[m.type, m.name.ko]])) : {};
      h += `<div class="set a mk"><b>${esc(s.title.en)}</b> ${s.items.map((q) => `${q.no}) ${cn(q.answer)}`).join(' &nbsp; ')}</div><div class="mw">${s.items.map((q) => q.rs && q.rs.length === 4
        ? `<div class="mx"><div class="mxh"><b>${q.no}</b> 정답 ${cn(q.answer)}<small>${esc(TN[q.type] || '')}</small></div><p class="mxe"><em>근거</em> ${cm(esc(q.ev))}</p><ul>${q.options.map((o, k) => `<li class="${k === q.answer ? 'y' : 'n'}"><div class="o">${cn(k)}<span>${cm(esc(o))}</span><b>${k === q.answer ? '○ 정답' : '✕'}</b></div><div class="r">${cm(esc(q.rs[k].replace(/\(정답\)/g, '')))}</div></li>`).join('')}</ul></div>`
        : `<p><b>${q.no}</b> ${cn(q.answer)} ${cm(esc(q.why))}</p>`).join('')}</div>`;
    }
    for (const s of u.sections.filter((x) => x.type === 'checkup')) {
      h += `<div class="set a"><b>Checkup</b> ${s.match.answer.map((a, i) => `${i + 1}) ${a}`).join(' &nbsp;·&nbsp; ')} &nbsp;|&nbsp; ${s.cloze.items.map((x, i) => `${s.match.words.length + i + 1}) ${esc(x.a)}`).join(' &nbsp;·&nbsp; ')}</div>`;
    }
    for (const s of u.sections.filter((x) => x.type === 'practice')) {
      h += `<div class="set a"><b>${esc(s.title.en.split(/\s[—–-]\s/)[0])}</b> ${s.items.map((x, i) => `${i + 1}) ${esc(x.a)}`).join(' &nbsp;·&nbsp; ')}</div>`;
    }
    h += '</div>';
  }
  return h + '</div>' + (B.front === '5354' ? gojiForms() : '');
}
/* 53 · 54번 원고지 연습 양식: 정답 끝에 한 번만(운영자 2026-10-30 「원고지 맨 뒤로」). 필요한 만큼 인쇄해 쓰게 한다. 시험 답안지와 칸 수가 같다는 뜻은 아니다 */
const wform = (per, rows) => `<div class="gw gform" style="--n:${per}">${Array.from({ length: rows }, (_, r) => `<div class="gr">${'<span></span>'.repeat(per)}${Math.floor(((r + 1) * per) / 100) > Math.floor((r * per) / 100) ? `<i>${Math.floor(((r + 1) * per) / 100) * 100}</i>` : ''}</div>`).join('')}</div>`;
const gojiForms = () => [['Question 53 · 53번', 20, 15, '200~300자'], ['Question 54 · 54번', 24, 30, '600~700자']].map(([t, per, rows, n]) => `<div class="blk plain gd"><h2>Answer grid · 원고지 양식</h2><div class="k">${t} · ${n} · 연습용 양식이에요. 필요한 만큼 인쇄해서 쓰세요. · Practice form. Print as many as you need. &nbsp; 이름 · Name ________ &nbsp; 날짜 · Date ________</div>${wform(per, rows)}</div>`).join('');
/* 찾아보기 — 표의 한국어 낱말(첫 낱말 칸)과 뜻을 모아 가나다 순으로. 「읽기 팁」 칸은 뺀다. */
const INI = ['ㄱ', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅂ', 'ㅅ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const ini = (w) => INI[Math.floor((w.charCodeAt(0) - 0xac00) / 588)];
function indexEntries() {
  const map = new Map();
  for (const u of units) for (const s of u.sections.filter((x) => x.type === 'table' && !x.noIndex)) {
    const skip = s.cols.map((c) => /reading|tip|sound|pronunc|example|sentence|usage|situation|collocat|note|expression/i.test(c));
    for (const r of s.rows) r.forEach((cell, i) => {
      const w = String(cell).trim();
      if (skip[i] || !HAN.test(w) || w.length > 12 || /[()·=+→.?!,]/.test(w) || !HAN.test(w[0]) || w.split(/\s+/).length > 2 || /(?:요|니다|까)$/.test(w) && w.includes(' ')) return;
      const nonHan = (c) => c != null && !HAN.test(c) && c.length <= 38 && c !== '—';
      const gloss = nonHan(r[i - 1]) ? r[i - 1] : nonHan(r[i + 1]) ? r[i + 1] : '';
      const e = map.get(w) || { w, gloss: '', units: new Set() };
      if (!e.gloss && gloss) e.gloss = gloss;
      e.units.add(u.no); map.set(w, e);
    });
  }
  for (const u of units) for (const s of u.sections.filter((x) => x.type === 'vocab')) for (const e of s.entries) {
    const x = map.get(e.ko) || { w: e.ko, gloss: '', units: new Set() };
    if (!x.gloss) x.gloss = e.en.length <= 38 ? e.en : e.en.split(';')[0];
    x.units.add(u.no); map.set(e.ko, x);
  }
  return [...map.values()].sort((a, b) => a.w.localeCompare(b.w, 'ko'));
}
function indexBlock(entries) {
  let h = `<div class="blk plain ix"><h2>Index</h2><div class="k">찾아보기: Korean words in this book and the unit they appear in</div><div class="cols">`;
  let cur = '';
  for (const e of entries) {
    const c = ini(e.w);
    if (c !== cur) { cur = c; h += `<div class="ini">${c}</div>`; }
    h += `<div class="e"><i>${[...e.units].sort((a, b) => a - b).join(', ')}</i><b>${esc(e.w)}</b>${e.gloss ? ` <span>${esc(e.gloss)}</span>` : ''}</div>`;
  }
  return h + '</div></div>';
}
const reviewSheet = () => `<div class="blk plain rv"><h2>Review checklist · 검수 체크표</h2><div class="k">한 단원씩 훑고 ○ / ✕ 를 적으세요. 고칠 곳은 빨간 출처(예: greetings-self-introduction · §2)와 번호로 알려 주시면 됩니다.</div><table><thead><tr><th>Unit</th><th>사실 Facts</th><th>오타 Typos</th><th>번역 English</th><th>난이도 Level</th><th>정답 Answers</th><th>메모 Notes</th></tr></thead><tbody>${units.map((u) => `<tr><td>${String(u.no).padStart(2, '0')} ${esc(u.title.en)}</td><td class="c">☐</td><td class="c">☐</td><td class="c">☐</td><td class="c">☐</td><td class="c">☐</td><td></td></tr>`).join('')}</tbody></table></div>`;
/* 책 구매자 혜택 — docs/books/<id>.json 의 bonus {code, days}. 메모 첫 쪽 맨 위에 QR + 코드 + 눌러지는 주소 */
const bonusBox = () => {
  if (KDP || !B.bonus) return '';
  const url = `${SITE_URL}/?bk=${B.bonus.code}&utm_source=book&utm_medium=bonus&utm_campaign=${encodeURIComponent(B.id)}`;
  const q = qrLib(0, 'M'); q.addData(url); q.make();
  return `<div class="qrb uq"><div class="qr">${q.createSvgTag({ cellSize: 3, margin: 0, scalable: true })}</div><div><b>Reader bonus · Pro free for ${B.bonus.days} days</b><small>이 책을 사신 분께 드리는 선물이에요. QR을 찍거나 아래 주소를 열고 로그인하면 Pro ${B.bonus.days}일이 열려요. 코드 ${esc(B.bonus.code)} (한 계정에 한 번)${B.bonus.app ? ' 앱을 쓰신다면 앱의 더보기 · 내 책 코스 · 책 코드 칸에 코드를 넣어도 돼요.' : ''}</small><a href="${esc(url)}">${esc(url.split('&utm')[0].replace('https://', ''))}</a></div></div>`;
};
const memoBlock = (n) => Array.from({ length: n }, (_, i) => `<div class="blk plain memo"><h2>Notes · 메모</h2>${i === 0 ? bonusBox() : ''}${'<div class="rule"></div>'.repeat(i === 0 && B.bonus ? 18 : 22)}</div>`).join('');

/* ── 쪽 찍기 ── */
const reviewTop = REVIEW ? `@page:left{@bottom-center{content:"REVIEW COPY · 검수본";white-space:nowrap;font:800 6.4pt 'Pretendard Variable';letter-spacing:.2em;color:#c0392b;vertical-align:top;padding-top:6mm}}@page:right{@bottom-center{content:"REVIEW COPY · 검수본";white-space:nowrap;font:800 6.4pt 'Pretendard Variable';letter-spacing:.2em;color:#c0392b;vertical-align:top;padding-top:6mm}}` : '';
const CLASSIC_CSS = `
.bx .tt{white-space:pre-line}.wans{flex:1;font-size:9.6pt;color:#1f3a68;padding-bottom:.6mm;border-bottom:.25mm solid #c5cfdf}
.wp{border:.25mm solid #b9c3d6;background:#f6f8fc;padding:3mm 3.6mm;font-size:9.6pt;line-height:1.8;margin:1mm 0 2mm}.wc{font-size:8pt;color:#5a6780;margin:0 0 1.6mm}
.wl{display:flex;align-items:flex-end;gap:2.4mm;margin:2.4mm 0}.wl b{color:${ACC};font-size:11pt}.wln{flex:1;border-bottom:.25mm solid #8e9ab0;height:7mm}
.ls{break-inside:avoid}.akq{margin:0 0 4mm;padding:2.4mm 3mm;border:.25mm solid #c9c2d8;border-radius:1.4mm;background:#fff}.akq h4{break-after:avoid;display:flex;justify-content:space-between;align-items:baseline;font-size:9.4pt;margin-bottom:1mm}.akq h4 em{font-style:normal;font-size:7.6pt;color:#5a6780}.akc{display:flex;gap:3mm;font-size:6.8pt;color:#5a6780;line-height:1.35;margin-bottom:1.6mm}.akc span{flex:1}.akc b{color:#3a2f66}.akr{break-inside:avoid;margin:0 0 1.6mm;padding:1.4mm 2mm;border-left:1.1mm solid #b9b2c9;background:#faf9fc}.akr.hi{border-color:#2a7a6a;background:#f2f9f6}.akr.mid{border-color:#c98a2e;background:#fcf7ee}.akr.lo{border-color:#b0452a;background:#fbf3f0}.akh{display:flex;align-items:baseline;gap:2mm;font-size:7.4pt}.akh>b{font-size:9pt}.akh span{flex:1;font-weight:700;color:#3a2f66}.akh em{font:800 9pt 'Pretendard Variable';font-style:normal}.akh em small{font-size:6.6pt;color:#5a6780}.akh>small{font-size:6.6pt;color:#5a6780}.akt{margin:.8mm 0;font-size:7.8pt;line-height:1.5;color:#1d1a17}.akw{font-size:7pt;line-height:1.4;color:#5a6780}.akd{font-size:6.8pt;line-height:1.4;color:#5a6780}.akd b{color:#a8431f;margin-right:1.2mm}.smp{margin:1mm 0 3.2mm 9mm;padding:1.8mm 2.6mm;border:.25mm solid #c9c2d8;border-radius:1.2mm;font-size:8.4pt;line-height:1.6;color:#2a2622;background:#fff}.smp b{display:block;font-size:7.4pt;margin-bottom:.8mm;color:#3a2f66}.smp.no{border-style:dashed;background:#faf7f4}.smp.no b{color:#a8431f}.pcl{margin:5mm 0 0;padding:3mm 4mm;border:.3mm solid #c9c2d8;border-radius:2mm;background:#faf9fc}.pct{font-weight:800;font-size:10pt;color:#3a2f66;letter-spacing:.04em;margin-bottom:2mm}.pct small{font-weight:500;color:#5a6780;margin-left:2mm}.pcl ol{margin:0;padding-left:5mm;columns:2;column-gap:6mm;font-size:8.6pt;line-height:1.7}.pcl p{margin:2mm 0 0;font-size:7.6pt;color:#5a6780}.wt2a{margin-top:2mm}.wt2a .q{margin-bottom:1.4mm;padding:.8mm 3mm}.wt2a .st{margin:2.8mm 0 1.6mm}.wt2a .data div{padding:1.3mm 3.4mm}.wt2a .card{padding:1.8mm 2.6mm}.wt2a .note{margin-top:1.2mm}.wt2 .wh{font-size:7pt;letter-spacing:.14em;color:#8a7f72;margin-bottom:3mm;text-transform:uppercase}.wt2 .q{border-left:1.2mm solid #3a2f66;padding:1.2mm 3.4mm;background:#f6f4fa;font-size:9pt;margin-bottom:3mm}.wt2 .q b{display:block;font-size:7pt;color:#3a2f66;letter-spacing:.06em}.wt2 .st{display:flex;align-items:center;gap:3mm;margin:4.4mm 0 2.4mm}.wt2 .st i{font:800 14pt/1 'Pretendard Variable';font-style:normal;color:#fff;background:#3a2f66;width:8.6mm;height:8.6mm;border-radius:2mm;display:flex;align-items:center;justify-content:center}.wt2 .st h2{margin:0;font-size:11.4pt;line-height:1.2;border:0;padding:0}.wt2 .st h2 small{display:block;font-size:7.8pt;font-weight:500;color:#5a6780}
.wt2 .data{border:.3mm solid #c9c2d8;border-radius:2mm;overflow:hidden}.wt2 .data div{display:flex;align-items:center;gap:3mm;padding:2.1mm 3.4mm;border-top:.25mm solid #e6e1ef;line-height:1.5;font-size:9.2pt}.wt2 .data div:first-child{border-top:0}.wt2 .data em{font-style:normal;width:20mm;flex:none;color:#5a6780;font-size:8pt}.wt2 .note{font-size:8pt;color:#5a6780;margin-top:1.8mm}
.wt2 .flow{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:4mm}.wt2 .card{border:.3mm solid #c9c2d8;border-radius:2mm;padding:2.4mm 2.8mm;position:relative;background:#fff}.wt2 .card:not(:last-child):after{content:'→';position:absolute;right:-4.2mm;top:50%;transform:translateY(-50%);color:#3a2f66;font-weight:800;font-size:10pt}.wt2 .card h3{margin:0 0 1mm;font-size:9.6pt}.wt2 .card h3 span{color:#3a2f66;margin-right:1mm}.wt2 .card .src{display:flex;gap:1mm;margin-bottom:1.4mm;min-height:5mm}.wt2 .card p{margin:0;font-size:8.2pt;line-height:1.7}.wt2 .card b{color:#3a2f66}.wt2 .bk{color:#8a93a6}
.wt2 .wrw{display:grid;grid-template-columns:8mm 1fr;gap:3mm;align-items:start;margin:0 0 2.6mm;padding:2.6mm 3.2mm;border:.3mm solid #c9c2d8;border-radius:2mm;break-inside:avoid}.wt2 .wrw>b{font:800 13pt/1 'Pretendard Variable';color:#3a2f66}.wt2 .wrw .t{display:block;font-size:9.6pt;line-height:2}.wt2 .wrw .w{display:block;margin-top:1mm;font-size:8pt;color:#5a6780;line-height:1.5}
.wt2 .chk{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:3mm}.wt2 .chk div{border:.3mm solid #c9c2d8;border-radius:2mm;padding:2.2mm 2.8mm;font-size:8.2pt;line-height:1.5}.wt2 .chk b{display:block;font-size:7pt;color:#3a2f66;letter-spacing:.05em}
.wt2 .uA{text-decoration:underline;text-decoration-color:#2f6fb0;text-decoration-thickness:.7mm;text-underline-offset:1.1mm;text-decoration-skip-ink:none}.wt2 .gA{background:#2f6fb0;color:#fff;display:inline-flex;align-items:center;justify-content:center;width:4.8mm;height:4.8mm;border-radius:50%;font:800 7.2pt/1 'Pretendard Variable';flex:none}.wt2 .uB{text-decoration:underline;text-decoration-color:#2a7a6a;text-decoration-thickness:.7mm;text-underline-offset:1.1mm;text-decoration-skip-ink:none}.wt2 .gB{background:#2a7a6a;color:#fff;display:inline-flex;align-items:center;justify-content:center;width:4.8mm;height:4.8mm;border-radius:50%;font:800 7.2pt/1 'Pretendard Variable';flex:none}.wt2 .uC{text-decoration:underline;text-decoration-color:#c2701d;text-decoration-thickness:.7mm;text-underline-offset:1.1mm;text-decoration-skip-ink:none}.wt2 .gC{background:#c2701d;color:#fff;display:inline-flex;align-items:center;justify-content:center;width:4.8mm;height:4.8mm;border-radius:50%;font:800 7.2pt/1 'Pretendard Variable';flex:none}.wt2 .uD{text-decoration:underline;text-decoration-color:#8a4fb0;text-decoration-thickness:.7mm;text-underline-offset:1.1mm;text-decoration-skip-ink:none}.wt2 .gD{background:#8a4fb0;color:#fff;display:inline-flex;align-items:center;justify-content:center;width:4.8mm;height:4.8mm;border-radius:50%;font:800 7.2pt/1 'Pretendard Variable';flex:none}.wt2 .uE{text-decoration:underline;text-decoration-color:#b0452a;text-decoration-thickness:.7mm;text-underline-offset:1.1mm;text-decoration-skip-ink:none}.wt2 .gE{background:#b0452a;color:#fff;display:inline-flex;align-items:center;justify-content:center;width:4.8mm;height:4.8mm;border-radius:50%;font:800 7.2pt/1 'Pretendard Variable';flex:none}.wg2 .wr{height:5.8mm}.sck{margin:1mm 0 0;padding:1.3mm 2.6mm;border:.25mm solid #c9c2d8;border-radius:1.4mm;background:#faf9fc;break-inside:avoid}.scn{display:flex;align-items:baseline;gap:2mm;font-size:8pt;margin-bottom:.7mm}.scn b{color:#3a2f66}.scl{display:inline-block;width:20mm;border-bottom:.3mm solid #8e9ab0;height:4.4mm}.scn small{color:#5a6780;font-size:7.2pt;margin-left:2mm}.sck ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:.3mm 4mm;font-size:7.4pt;line-height:1.25}.sck li{display:flex;gap:1.6mm;align-items:flex-start}.sck li i{flex:none;width:3.2mm;height:3.2mm;border:.3mm solid #3a2f66;border-radius:.6mm;margin-top:.3mm}.sec.wq{break-inside:avoid}.wnote{margin:1mm 0 0;font-size:7.8pt;color:#5a6780}.gw{margin:1mm 0 3mm;padding-right:7mm;break-inside:avoid}.gr{position:relative;display:grid;grid-template-columns:repeat(var(--n),1fr)}.gr span{aspect-ratio:1;border:.2mm solid #8e9ab0;margin:0 -.1mm -.2mm 0}.gr i{position:absolute;left:calc(100% + 1.2mm);bottom:0;font-size:6.4pt;font-style:normal;color:#8a93a6;line-height:1}.wref{margin:0 0 3mm;padding:2.2mm 3mm;border:.25mm dashed #b9b2c9;border-radius:1.2mm;font-size:8.8pt;line-height:1.5;color:#5a5348}.wref b{color:#3a2f66;margin-right:1.5mm}.wd-m{margin:0 0 1.4mm;font-size:8.6pt;color:#5a5348}.twc{break-inside:avoid}.wd{margin:0 0 2mm 5mm;padding:0;font-size:9pt;line-height:1.55;color:#2a3550}.wt{margin:0 0 2mm 6mm;padding:0;font-size:9pt;line-height:1.55}
.wg{margin-top:2mm}.wr{position:relative;border-bottom:.22mm solid #8e9ab0;height:8mm}.wr i{position:absolute;right:0;top:1mm;font-size:6.4pt;color:#8a93a6;font-style:normal}
.wq{break-inside:avoid}.wa{font-size:8.2pt;line-height:1.55;border-top:.2mm solid #d6dce8;padding-top:1.4mm;margin-top:1.4mm}.wa small{display:block;font-size:7.2pt;color:#5a6780}.wa .sm i{font-style:normal;font-weight:800;color:${ACC};margin-right:1.4mm}.wa .mdl{margin:.6mm 0 1mm}.wa .dd{color:#9a6a50}

body{font-size:9.4pt;line-height:1.6;color:#111}
/* 정석풍 — 남색 한 가지 · 면 채우기 없이 선과 글자만(운영자 「더 깔끔하게 수학의 정석처럼」) */
.sec{margin:0 0 5.5mm}
.sec>h3{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:3mm;row-gap:.2mm;align-items:center;border-bottom:.35mm solid ${ACC};padding-bottom:1.1mm;margin-bottom:2.4mm;font-size:11.2pt;line-height:1.3}
.sec>h3:before{display:none}
.lab{grid-row:1;align-self:center;font-style:normal;border:.3mm solid ${ACC};color:${ACC};font-size:7.4pt;font-weight:800;letter-spacing:.04em;padding:.7mm 2.6mm;border-radius:0;line-height:1.5;white-space:nowrap}
.sec>h3 span{grid-column:2;grid-row:1}.sec>h3 small{grid-column:2;grid-row:2;margin:0;font-size:8.2pt;line-height:1.25;color:#5a6780;font-weight:500}.sec>h3:not(:has(.lab)) span{grid-column:1/3}
table{border-top:0;border-bottom:.4mm solid ${ACC};font-size:8.6pt}
th{background:transparent;color:${ACC};border:0;border-bottom:.25mm solid ${ACC};font-size:7.6pt;font-weight:800;letter-spacing:.02em;padding:1mm 3mm 1.2mm;line-height:1.2;vertical-align:bottom}
tbody tr:nth-child(even) td,tr:nth-child(even) td{background:transparent}td{border-bottom:.15mm solid #cfd6e2;padding:1.05mm 3mm;line-height:1.3;font-size:8.6pt}td:first-child{font-size:8.9pt;font-weight:700}tr:last-child td{border-bottom:0}td:first-child{color:${ACC}}td.tip{color:#6b7a92}
.bx{--c:#2F5DA8;position:relative;border:.3mm solid var(--c);border-radius:1.6mm;padding:3.6mm 3.6mm 2.4mm;margin-top:5.2mm;background:#fff;font-size:8.6pt;line-height:1.5;color:#111;break-inside:avoid}
.bx.warn{--c:#B3322D}.bx.more{--c:#5B6B86;border-style:dashed}.bx.pattern{--c:${ACC}}.bx.tip{--c:#2F5DA8}
.bx .lg{position:absolute;left:3mm;top:-2.1mm;background:#fff;padding:0 1.8mm;display:flex;align-items:center;gap:1.2mm;font-size:6.8pt;font-weight:800;letter-spacing:.12em;color:var(--c);line-height:1.2}
.bx .lg svg{width:3.3mm;height:3.3mm;stroke:var(--c);fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.bx .lg small{font-weight:600;letter-spacing:0;color:#6b7a92;font-size:6.8pt}
.pd .list.mc{columns:2;column-gap:6mm;font-size:7.6pt;line-height:1.55;margin-top:9mm}
.vsec{margin-bottom:0}.vlg{display:flex;gap:6mm;flex-wrap:wrap;font-size:7.4pt;color:#5a5348;margin:0 0 1.6mm;padding:1.1mm 2.4mm;background:${TINT};border-radius:1.6mm}.vlg .ic{vertical-align:-1.1mm}.vw{display:grid;grid-template-columns:6.5mm 1fr;gap:1.6mm;padding:1.4mm 0;height:23mm;box-sizing:border-box;align-content:start;border-top:.25mm solid #e1dbe9;break-inside:avoid}.vw:first-of-type{border-top:0}.vn{font-size:7.4pt;font-weight:800;color:${ACC};padding-top:.8mm}.vh{display:flex;align-items:baseline;gap:2.4mm}.vh>b{font-size:12pt;color:#1d1a17}.vp{font-size:7pt;color:#6b6458;border:.25mm solid #cfc7d9;border-radius:1mm;padding:0 1.2mm}.vi{margin-left:auto;white-space:nowrap}.vi em{display:inline-block;width:2.4mm}.ic{width:3.3mm;height:3.3mm;margin-left:.3mm}.ve{font-size:8.4pt;color:${ACC};font-weight:700;margin-top:0}.vx{font-size:8.2pt;line-height:1.38;margin-top:.4mm;color:#2a2620}.vx b{color:${ACC};font-weight:800}.vx small{display:block;font-size:7pt;color:#6b6458}.vhj{font-size:9pt;color:#6b6458;letter-spacing:.08em}.vl{font-size:7.2pt;color:#6b6458;margin-top:.3mm}.vl span+span{margin-left:4mm}.vk{color:#2a2620;font-size:8pt}
.mqs .mg{break-inside:avoid;margin:0 0 4.2mm}.mqs .mh{font-size:8.6pt;font-weight:700;margin:0 0 1.6mm}.mqs .mp{white-space:pre-line;border:.3mm solid #444;border-radius:1mm;padding:2.4mm 3.2mm;font-size:9.4pt;line-height:1.75;margin:0 0 2mm;background:#fff}.cm{display:inline-block;box-sizing:border-box;width:4.8mm;height:4.8mm;border:.3mm solid currentColor;border-radius:50%;font-size:8.6pt;line-height:4.2mm;text-align:center;vertical-align:-1mm;font-weight:600;font-style:normal}.mqs .mb{display:inline-block;width:11mm;border-bottom:.3mm solid #222}.mqs .mq1{margin:0 0 2.6mm}.mqs .mqh{font-size:9.2pt;font-weight:700;margin:0 0 1.4mm}.mqs .mqh b{margin-right:.6mm}.mqs .mbo{border:.3mm dashed #666;padding:1.6mm 3mm;font-size:9pt;margin:0 0 1.6mm}.mqs .mbo i{font-style:normal;font-weight:800;margin-right:1.4mm}.mqs .mo{list-style:none;margin:0;padding:0;font-size:9.2pt;line-height:1.6}.mqs .mo li{margin:.1mm 0}.mqs .mo .cm{margin-right:1.8mm;width:4.2mm;height:4.2mm;font-size:7.4pt;line-height:3.6mm;vertical-align:-.8mm}.mw .cm,.mk .cm{width:3.4mm;height:3.4mm;font-size:6.4pt;line-height:2.9mm;vertical-align:-.6mm}.mqs .mo.g{display:grid;grid-template-columns:1fr 1fr;column-gap:4mm}
.omr{break-before:page;break-inside:avoid}.omr .osheet{border:.5mm solid #222;padding:2.4mm 4mm;margin-top:0}.omr .otop{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:.4mm solid #222;padding-bottom:1.6mm;margin-bottom:2.4mm}.omr .ot1 b{font-size:13pt}.omr .ot1 small{display:block;font-size:7.4pt;color:#555}.omr .ot2{font-size:8.6pt}.omr u{display:inline-block;border-bottom:.3mm solid #222;width:12mm}.omr .ohead{display:grid;grid-template-columns:auto 1fr;gap:5mm;border-bottom:.4mm solid #222;padding-bottom:2.4mm;margin-bottom:2.4mm}.omr .olab{font-size:8.2pt;font-weight:800;margin-bottom:1mm}.omr .olab small{font-weight:500;color:#555}.omr .oid{display:flex;gap:1.1mm}.omr .oi8{display:flex;flex-direction:column;gap:.7mm;border:.25mm solid #888;padding:.8mm;background:#fafafa}.omr .ob{display:inline-flex;align-items:center;justify-content:center;width:3.6mm;height:5mm;border:.3mm solid #444;border-radius:50%;font-size:6.2pt;color:#444;background:#fff;line-height:1}.omr .ob.s{height:3.3mm;width:3.1mm;font-size:5.2pt}.omr .ob.f{background:#222;color:#222}.omr .ob.y{background:linear-gradient(#222 0 0) center/100% 38% no-repeat #fff;color:#fff}.omr .oside{display:flex;flex-direction:column;gap:1.4mm}.omr .onm{display:flex;align-items:flex-end;gap:2mm;font-size:8pt}.omr .onm u{flex:1}.omr .omk{border:.25mm solid #888;padding:1.2mm 2mm;font-size:7.8pt}.omr .omk .omk1{display:flex;align-items:center;gap:1.4mm;margin:1mm 0}.omr .omk small{display:block;font-size:6.8pt;color:#555}.omr .om{display:grid;grid-template-columns:1fr 1fr;column-gap:7mm}.omr .oh{display:flex;gap:3mm;border-bottom:.3mm solid #222;font-size:7pt;padding-bottom:.6mm;margin-bottom:.4mm}.omr .oh b{width:7mm;text-align:right}.omr .or{display:flex;align-items:center;gap:2.2mm;padding:.3mm 0;border-bottom:.15mm solid #ddd;font-size:8.6pt}.omr .or b{width:7mm;text-align:right}.omr .or .ob{width:3.9mm;height:4.7mm;font-size:6.6pt}.omr .os{display:flex;gap:7mm;flex-wrap:wrap;margin-top:2mm;padding-top:1.6mm;border-top:.4mm solid #222;font-size:8.2pt}
.ak .u:has(.mw){break-inside:auto}.mw{columns:2;column-gap:6mm}.mw .mx{break-inside:avoid;margin:0 0 2.6mm;border-top:.2mm solid #d6dce8;padding-top:1mm}.mw .mxh{font-size:8pt}.mw .mxh small{display:inline;margin-left:1.6mm;color:#6b6458;font-size:6.8pt}.mw .mxe{margin:.5mm 0;font-size:7.2pt;line-height:1.45;background:#F4F1E8;padding:.7mm 1.6mm;border-radius:.8mm}.mw .mxe em{font-style:normal;font-weight:800;color:${ACC};margin-right:1.2mm}.mw ul{list-style:none;margin:0;padding:0}.mw li{font-size:7.1pt;line-height:1.4;margin:.5mm 0}.mw li .o{display:flex;gap:1mm;align-items:baseline}.mw li .o span{font-weight:700}.mw li .o b{margin-left:1mm;font-size:6.6pt}.mw li .r{margin:.1mm 0 0 4.4mm;color:#333}.mw li.y b{color:#12704F}.mw li.n b{color:#B03A3A}.ak .mw p{break-inside:avoid}.mk b{margin-right:1.6mm}.mw p{margin:.5mm 0;font-size:7.6pt;line-height:1.5}.mw p b{display:inline-block;min-width:5mm}.mw p i{font-style:normal;font-weight:800;margin-right:1mm}
.mtp .mth{display:flex;align-items:baseline;gap:3mm;border-bottom:.5mm solid ${ACC};padding-bottom:1mm;margin-bottom:1.8mm}.mtp .mth b{font-size:8pt;color:${ACC};letter-spacing:.06em}.mtp .mth span{font-size:15pt;font-weight:800}.mtp small{display:block;font-size:6.9pt;font-weight:500;color:#5a6780}.mtp .mth em{margin-left:auto;font-style:normal;font-size:8.4pt;font-weight:700;color:${ACC}}.mtp .mta{background:${TINT};border-radius:1.4mm;padding:1.1mm 3mm;font-size:9pt;font-weight:700;margin-bottom:1.6mm}.mtp .mtl{font-size:8.4pt;font-weight:800;color:${ACC};margin:0 0 1.4mm}.mtp .mts{list-style:none;margin:0 0 2.2mm;padding:0}.mtp .mts>li{display:flex;gap:2.6mm;align-items:flex-start;font-size:8.7pt;line-height:1.42;margin:.9mm 0;break-inside:avoid}.mtp .mts>li>i{flex:none;width:5.4mm;height:5.4mm;border-radius:50%;background:${ACC};color:#fff;font-style:normal;font-size:7.8pt;font-weight:800;text-align:center;line-height:5.4mm}.mtp .mts ul{list-style:none;margin:.8mm 0 0;padding:.4mm 0 .4mm 2.4mm;border-left:.5mm solid #cfd6e0}.mtp .mts ul li{font-size:8.1pt;margin:.2mm 0}.mtp .mts ul li:before{content:"▸ ";color:${ACC}}.mtp .mex{border:.3mm dashed #888;border-radius:1.6mm;padding:1.6mm 3mm;margin:0 0 2.2mm;font-size:8.3pt}.mtp .mexh{font-weight:800;color:${ACC};margin-bottom:1.2mm}.mtp .mexh span{margin-left:2mm;font-weight:500;color:#6b6458}.mtp .mex .mp{white-space:pre-line;border:.25mm solid #666;border-radius:1mm;padding:1.4mm 2.6mm;margin:0 0 1.2mm;font-size:8.2pt;line-height:1.5;background:#fff}.mtp .mexo{display:flex;flex-wrap:wrap;gap:.6mm 5mm;margin:0 0 1.2mm}.mtp .mexa{background:#F4F1E8;border-radius:1mm;padding:1.2mm 2.4mm;font-size:8.2pt;line-height:1.5}.mtp .mexa b{margin-right:1.6mm}.mtp .mtw b{font-size:8.2pt;color:${ACC}}.mtp .mtw div{display:flex;flex-wrap:wrap;gap:1.4mm 1.6mm;margin-top:1.2mm}.mtp .mtw span{border:.25mm solid #cfd6e0;border-radius:1.4mm;padding:.5mm 2mm;font-size:8.4pt;font-weight:700;background:#fff}.mtp .mtw span small{display:inline;margin-left:1.2mm;font-weight:500}.mtp .mtr{margin-top:1.8mm;border-left:.9mm solid #C4551C;background:#FDEEE2;padding:1.2mm 3mm;font-size:8.4pt}
.cku{break-inside:avoid}.cku .cki{font-size:8.6pt;font-weight:700;color:${ACC};margin:2.2mm 0 1.6mm}.cku .cki small{font-weight:500;color:#6b6458;margin-left:1.6mm}.cku .lt{display:inline-flex;align-items:center;justify-content:center;width:4.4mm;height:4.4mm;border:.3mm solid ${ACC};border-radius:50%;font-size:7pt;font-weight:800;color:${ACC};margin-right:1.8mm}.cku .ckm{display:grid;grid-template-columns:1fr 1fr;gap:0 8mm}.cku ol,.cku ul{list-style:none;margin:0;padding:0}.cku .ckm li{display:flex;align-items:baseline;gap:2.4mm;padding:1.1mm 0;font-size:10pt;height:7.4mm;box-sizing:border-box}.cku .ckm ol li b{font-size:8pt;color:${ACC};width:5mm}.cku .ckm ol li span{min-width:22mm;font-weight:700}.cku .ckl{flex:1;border-bottom:.3mm solid ${ACC}99;height:4.4mm;max-width:14mm}.cku .ckm ul li{font-size:9pt}.cku .ckc li{display:flex;gap:2.4mm;padding:1.2mm 0;min-height:11mm;font-size:9.6pt;line-height:1.5}.cku .ckc li b{font-size:8pt;color:${ACC};width:5mm;padding-top:.6mm}.cku .ckc u{display:inline-block;width:22mm;border-bottom:.3mm solid #1d1a17;text-decoration:none;margin:0 .6mm}.cku .ckc small{display:block;font-size:7.4pt;color:#6b6458}.cku .ckb{margin-top:2mm;border:.35mm solid ${ACC};border-radius:1.6mm;padding:2.4mm 3mm;display:grid;grid-template-columns:repeat(var(--n),1fr);gap:0;font-size:10pt;font-weight:700;background:${TINT}}.cku .ckb>span{display:flex;align-items:center;justify-content:center;padding:0 1mm;border-left:.25mm solid ${ACC}55;white-space:nowrap}.cku .ckb>span:first-child{border-left:0}
.cmp .ci{break-inside:avoid;display:grid;grid-template-columns:30mm 1fr;gap:3mm;padding:1.5mm 0;border-top:.25mm solid #e1dbe9}.cmp .ci:first-of-type{border-top:0}.cmp .cw b{display:block;font-size:11pt;color:#1d1a17;line-height:1.3}.cmp .cw b i{font-style:normal;color:#9a93a6;font-weight:400}.cmp .cp{display:inline-block;margin-top:.8mm;font-size:6.8pt;font-weight:800;padding:.3mm 1.8mm;border-radius:99px}.cmp .cp small{font-weight:500;margin-left:1.2mm;opacity:.85}.cmp .ci p{margin:0;font-size:7.9pt;line-height:1.42;color:#2a2620}
.plan{break-inside:avoid}.plan .plg{display:grid;grid-template-columns:1fr 1fr;gap:3.2mm 7mm;margin-top:1mm}.plan .plk b{font-size:8.6pt;color:${ACC}}.plan .plk small{font-size:7.6pt;color:#6b6458;margin-left:1.6mm}.plan .pll{border-bottom:.3mm solid ${ACC}99;height:7.2mm}.plan .pld{margin-top:3.6mm}.plan .pldc{display:flex;gap:2.2mm;margin-top:1.8mm}.plan .pldc i{width:12.5mm;height:12.5mm;border:.35mm solid ${ACC};border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-style:normal;line-height:1.1}.plan .pldc i b{font-size:9.4pt;color:${ACC}}.plan .pldc i small{font-size:6.2pt;color:#6b6458}.plan .plgl{margin-top:4mm;background:${TINT};border-radius:2mm;padding:2.6mm 3.4mm}
.flow{display:flex;align-items:stretch;gap:1.2mm;margin-top:2mm}.flow .fs{flex:1;border:.3mm solid ${ACC};border-radius:1.6mm;padding:2.4mm 1.8mm;text-align:center;background:#fff;display:flex;flex-direction:column;gap:.8mm;justify-content:center}.flow .fs b{font-size:8.8pt;color:${ACC}}.flow .fs span{font-size:7pt;color:#5a6780;line-height:1.3}.flow .fs.bl{background:${TINT};border-style:dashed}.flow .ar{align-self:center;color:${ACC};font-style:normal;font-weight:800;font-size:10pt}
.gd .chips{display:flex;gap:2mm;margin:1mm 0 3mm}.gd .chip{display:inline-flex;align-items:baseline;gap:1.6mm;border:.3mm solid ${ACC};border-radius:5mm;padding:.9mm 3.2mm;font-size:7.6pt;color:#5a6780}.gd .chip b{font-size:9.4pt;color:${ACC}}
.gd h3.gh{font-size:10.4pt;margin:3.2mm 0 1.2mm;color:${ACC}}
.stp{display:flex;flex-direction:column;gap:1.1mm}.stp .st{display:flex;gap:3mm;align-items:flex-start;border:.25mm solid #d6dce8;border-radius:1.6mm;padding:1.2mm 3mm;background:#fff}.stp .st i{flex:none;width:6mm;height:6mm;border-radius:50%;background:${ACC};color:#fff;font:800 8.4pt/6mm 'Pretendard Variable';text-align:center;font-style:normal}.stp .st b{display:block;font-size:9pt;font-weight:600;line-height:1.4}.stp .st small{display:block;font-size:7.8pt;color:#5a6780;margin-top:.4mm}
.bx .mk{list-style:none;display:flex;flex-direction:column;gap:1.6mm}.bx .mk li{font-size:8.8pt;line-height:1.4;padding-left:4.2mm;position:relative}.bx .mk li:before{content:"✗";position:absolute;left:0;color:#B3322D;font-weight:800}.bx .mk small{display:block;font-size:7.8pt;color:#5a6780}
.gd .total{display:flex;gap:5mm;align-items:center;margin:1mm 0 4mm;padding:3mm 4mm;background:${TINT};border-radius:2mm}.gd .total .big{font:800 26pt/1 'Pretendard Variable';color:${ACC};white-space:nowrap}.gd .total .big small{font-size:8pt;font-weight:600;margin-left:1.2mm;color:#5a6780}.gd .total p{font-size:9pt;line-height:1.45}.gd .total p small{display:block;font-size:7.8pt;color:#5a6780;margin-top:.6mm}
.sc3{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:2.4mm}.sc{border:.3mm solid ${ACC};border-radius:1.8mm;overflow:hidden;background:#fff}.sc h4{background:${ACC};color:#fff;padding:1.8mm 2.4mm;font-size:9pt}.sc h4 small{display:block;font-size:7.4pt;font-weight:500;opacity:.8}.sc .hi,.sc .lo{display:flex;gap:1.8mm;padding:2.2mm 2.4mm;font-size:8.2pt;line-height:1.4}.sc .hi{background:#eef6ef}.sc .lo{background:#fbefee;border-top:.2mm solid #fff}.sc i{flex:none;font-style:normal;font-weight:800}.sc .hi i{color:#2e7d4f}.sc .lo i{color:#B3322D}.sc small{font-size:7.2pt}
.lad .rw{display:flex;align-items:center;gap:2.4mm;margin-top:2.2mm}.lad .rw b{width:7mm;font-size:9.4pt;color:${ACC}}.lad .bar{flex:1;height:3.4mm;background:#e8ecf3;border-radius:2mm;overflow:hidden}.lad .bar span{display:block;height:100%;background:${ACC}}.lad em{font:800 11pt "Pretendard Variable";font-style:normal;width:21mm;white-space:nowrap;text-align:right}.lad em small{font-size:7.4pt;font-weight:500;color:#5a6780}.lad .why{font-size:8pt;color:#44506a;line-height:1.4;margin:.6mm 0 0 9.4mm}
.fm .lead{font-size:9.4pt;line-height:1.5;margin:1mm 0 3mm}.fm .lead small{display:block;font-size:8pt;color:#5a6780}.fm .note2{font-size:8pt;color:#5a6780;margin:1.2mm 0 3mm}.fm .note2 small{display:block}
.tbar{display:flex;gap:.8mm;margin-top:1.6mm}.tbar span{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2mm 0;border-radius:1.4mm;background:${ACC};color:#fff;font-size:8pt;min-width:9mm}.tbar span:nth-child(odd){opacity:.86}.tbar span:last-child{background:#7a8aa6}.tbar b{font-size:10pt}
.uq{margin:0 0 3mm;padding:1.5mm 3mm;gap:3mm;break-inside:avoid}.uq .qr svg{width:14mm;height:14mm}.uq b{font-size:8.5pt}.uq small{font-size:7pt;margin:.3mm 0}.uq a{display:block;margin-top:1mm;font-size:7pt;color:${ACC};text-decoration:none;word-break:break-all}
.qrb{display:flex;gap:4mm;align-items:center;margin-top:5mm;padding:3mm 4mm;border:.3mm solid ${ACC};border-radius:2mm;background:${TINT}}.qrb .qr svg{width:22mm;height:22mm;display:block}.qrb b{display:block;font-size:10pt;color:${ACC}}.qrb small{display:block;font-size:8pt;color:#44506a;margin:.8mm 0}.qrb span{font-size:8pt;font-weight:700;color:${ACC}}
.plt td.pk{position:relative;padding-top:1.2mm}.plt .pi{display:flex;align-items:center;gap:1mm;margin-bottom:.8mm;font-size:6.4pt;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.plt .pi em{font-style:normal}.plt svg,.plg2 svg{width:3.2mm;height:3.2mm;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}.pkw{color:#3a2f66;background:#f4f1fa}.pkr{color:#1F3A68;background:#eef3fa}.pkv{color:#8a5316;background:#fbf3e8}.pkc{color:#1f6a5a;background:#ecf6f2}.pkt{color:#6b2f7a;background:#f6eef8}.plt td.pk{color:#222}.plt td.pkw .pi{color:#3a2f66}.plt td.pkr .pi{color:#1F3A68}.plt td.pkv .pi{color:#8a5316}.plt td.pkc .pi{color:#1f6a5a}.plt td.pkt .pi{color:#6b2f7a}.plg2{display:flex;gap:4mm;margin-top:3mm;font-size:7.4pt;font-weight:700}.plg2 span{display:flex;align-items:center;gap:1.2mm;padding:.8mm 2mm;border-radius:1mm}.plt{width:100%;border-collapse:collapse;table-layout:fixed;min-width:0;margin-top:3mm;font-size:8.2pt;line-height:1.4}.plt th,.plt td{border:.25mm solid #c9c2d8;padding:2mm 1.8mm;vertical-align:top;text-align:left}.plt thead th{background:#efecf6;color:#3a2f66;font-size:7.6pt}.plt thead th:nth-child(1){width:19mm}.plt thead th:nth-child(2){width:31mm}.plt th.w{background:#f7f5fb;color:#3a2f66;font-weight:800}.plt td.f b{display:block}.plt small{display:block;font-size:7pt;font-weight:500;color:#5a6780}.plt tr.ph td{background:#3a2f66;color:#fff;font-weight:800;font-size:7.6pt;letter-spacing:.06em;padding:1.2mm 2mm}.plt tbody tr:not(.ph){height:16mm}.wk{display:grid;grid-template-columns:1fr 1fr;gap:3.2mm;margin-top:2mm}.wc2{border-radius:2mm;overflow:hidden;border:.3mm solid var(--wc,#1F3A68);background:#fff}.wc2 h4{background:var(--wc,#1F3A68);color:#fff;padding:2mm 2.6mm;font-size:8.6pt;line-height:1.3}.wc2 h4 small{display:block;font-size:7.2pt;font-weight:500;opacity:.85}.wc2 .dy{display:flex;align-items:center;gap:1.8mm;padding:1.8mm 2.4mm;border-top:.2mm solid #e3e8f0;font-size:8pt}.wc2 .dy i{flex:none;width:3.6mm;height:3.6mm;border:.35mm solid var(--wc,#1F3A68);border-radius:.8mm}.wc2 .dy b{flex:none;width:6mm;color:var(--wc,#1F3A68);font-size:7.6pt}.wc2.c0{--wc:#1F3A68}.wc2.c1{--wc:#2a7a6a}.wc2.c2{--wc:#a8641e}.wc2.c3{--wc:#7a3d8a}
.rl{padding-left:5mm;display:flex;flex-direction:column;gap:2mm;font-size:9pt;line-height:1.45}.rl li::marker{color:${ACC};font-weight:800}.rl small{display:block;font-size:7.8pt;color:#5a6780}
.gj{display:grid;grid-template-columns:repeat(var(--c),10mm);width:max-content;border-left:.25mm solid #7a8aa6;border-top:.25mm solid #7a8aa6;margin:1.6mm 0}.gj i{width:10mm;height:10mm;border-right:.25mm solid #7a8aa6;border-bottom:.25mm solid #7a8aa6;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:12pt;color:#111}.gj i.dd{font-size:10pt;letter-spacing:-.2mm}
.two{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-bottom:3mm}.two table{font-size:8.2pt}.two td.to b{color:${ACC}}
.ck{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.ck .cg{border:.3mm solid #d0d8e6;border-radius:1.8mm;padding:2.2mm 2.8mm;background:#fff}.ck .cg h4{font-size:9pt;color:${ACC};margin-bottom:1.4mm}.ck h4 small{font-size:7.4pt;color:#5a6780;font-weight:500;margin-left:1mm}.ck .ci{display:flex;gap:2mm;padding:.9mm 0;font-size:8pt;line-height:1.35}.ck .ci i{flex:none;width:3.4mm;height:3.4mm;margin-top:.5mm;border:.35mm solid ${ACC};border-radius:.8mm}.ck .ci small{display:block;font-size:7.2pt;color:#5a6780}
.lg2 td{height:7.2mm}
.bx .pp{display:flex;flex-direction:column;gap:2.2mm}.pt1 .fl{display:flex;align-items:center;flex-wrap:wrap;gap:0}
.nd{display:inline-flex;align-items:center;padding:1.2mm 2.8mm;border-radius:1.3mm;font-weight:800}.nd.sl{border:.3mm dashed ${ACC};background:#F1F4FA;color:${ACC};font-size:8pt}.nd.fx{background:${ACC};color:#fff;font-size:9.6pt}
.lk{font-style:normal;width:4mm;text-align:center;color:#9aa6bb;font-weight:800}.mn{margin-left:3mm;font-size:8.4pt;color:#2a3550}
.eg{margin-top:1.2mm;padding:1.4mm 2.6mm;background:#FAFBFD;border:.2mm solid #E3E8F1;border-radius:1.2mm;font-size:8.4pt;color:#222}.eg b{color:${ACC};font-size:6.8pt;letter-spacing:.1em;margin-right:1.6mm}.eg span{color:#6b7a92}u.hl{text-decoration:none;border-bottom:.45mm dashed ${ACC};font-weight:700}
.gd h2{font-size:19pt;margin-bottom:.6mm}.gd .k{font-size:10pt;color:#5a6780;margin-bottom:3mm}.gd .row{display:grid;grid-template-columns:72mm 1fr;gap:6mm;padding:1.1mm 0 1.4mm;border-top:.2mm solid #cfd6e2;align-items:start;break-inside:avoid}.gd .row:first-of-type{border-top:.4mm solid ${ACC}}.gd .row .d b{display:block;font-size:9.6pt;margin-bottom:.8mm}.gd .row .d{font-size:8.6pt;line-height:1.5;color:#2a3550}.gd .row .d small{display:block;color:#6b7a92;font-size:8pt;margin-top:.6mm}.gd .mini{font-size:7.8pt}.gd .mini .sec>h3{margin-bottom:1.4mm;font-size:9pt}.gd .mini table{font-size:7.6pt}.gd .mini .bx{margin-top:3.4mm;padding:3mm 3mm 1.4mm;font-size:7.4pt;line-height:1.4}.gd .mini .nd{padding:.8mm 2.2mm}.gd .mini .sec{margin:0}.gd .mini .note{margin-top:0;font-size:7.8pt}.gd .mini .nd.fx{font-size:8.6pt}.gd .mini .pr li{min-height:6mm}
.note{break-inside:avoid;border:0;border-left:.9mm solid ${ACC};background:transparent;color:#111;padding:.8mm 0 .8mm 3.2mm;margin-top:2.4mm;line-height:1.5}.note b{color:${ACC}}
.pr li{border-bottom:0;min-height:8.4mm}.pr li:before{content:counter(q) '.';border:0;border-radius:0;background:transparent;color:${ACC};width:6mm;height:auto;font-size:9pt;font-weight:800;justify-content:flex-start;margin:0}
.pr li{display:grid;grid-template-columns:6mm var(--qw,48%) 1fr;column-gap:3mm;align-items:end;padding:1mm 0}.pr li.fill{grid-template-columns:6mm 1fr}.pr li.fill .ln{display:none}
.sc{margin-top:5mm;padding:2.6mm 3.4mm;border:.3mm solid ${ACC};border-radius:2mm;background:${TINT};break-inside:avoid}.sc h4{display:block;background:none;border:0;padding:0;font-size:9pt;color:${ACC};letter-spacing:.04em;margin:0 0 1.5mm;font-weight:800}.sc .r b{display:block;font-size:8.4pt;margin-bottom:.6mm}.sc .tl{display:block;height:6.4mm;border-bottom:.25mm solid #9aa7bf}.sc .r2{margin-top:2mm;font-size:8pt;line-height:1.9}.sc .r2 span{display:block}.sc .r2 b{margin-right:1.5mm}
.cb{display:inline-block;width:3.2mm;height:3.2mm;border:.3mm solid ${ACC};border-radius:.6mm;margin:0 .8mm 0 1.6mm;vertical-align:-.5mm;background:#fff}
.sm h2,.ml h2{font-size:17pt;margin-bottom:1mm}.sm .k,.ml .k{font-size:9pt;color:#44506a;margin-bottom:3mm;line-height:1.55}
.sm-t,.ml-t{width:100%;border-collapse:collapse;font-size:8.6pt}.sm-t th,.ml-t th{background:${TINT};border:.25mm solid #b9c3d6;padding:1.2mm;font-size:7.8pt}.sm-t td,.ml-t td{border:.25mm solid #cfd6e2;padding:.9mm 1.6mm;vertical-align:middle}
.sm-t{table-layout:fixed}.sm-t th.un,.sm-t td.un{width:11mm;text-align:center;font-weight:800;color:${ACC}}.sm-t th.pn{text-align:left}.sm-t td.pn{font-size:9pt}.sm-t th.tk,.sm-t td:nth-child(n+3){width:21mm;text-align:center}.sm-t th.tk small{display:block;font-weight:500;color:#5a6780;font-size:7pt;margin-top:.3mm}.sm-t tr.gp td{background:#f3f5fa;font-weight:800;color:${ACC};font-size:8pt;letter-spacing:.03em;text-align:left;padding:1mm 2mm}.sm-t .cb{margin:0}.ml-t td{height:15.2mm}
.pr li.open{display:block;position:relative;padding:1.4mm 0 1mm 6mm}.pr li.open:before{position:absolute;left:0;top:1.6mm}.pr li.open .q{display:block}.pr li.open .tl{display:block;height:7.2mm;border-bottom:.25mm solid #9aa7bf}
table.ctx{table-layout:fixed}table.ctx th:nth-child(1){width:15%}table.ctx th:nth-child(4){width:27%}table.ctx td:last-child{white-space:nowrap}
.tg{display:inline-block;padding:.2mm 2mm;margin:0 1mm .5mm 0;border-radius:99px;background:${TINT};border:.25mm solid ${ACC};color:${ACC};font-size:7.4pt;font-weight:700;line-height:1.5;white-space:nowrap}
.pr .q .en .cx{display:block;margin-top:.6mm}
.anl{width:100%;border-collapse:collapse;font-size:9pt;line-height:1.45;table-layout:fixed;min-width:0}.anl th,.anl td{border:.25mm solid #c9c2d8;padding:1.3mm 2mm;text-align:left;vertical-align:top}.anl thead th{background:#efecf6;font-size:7.8pt;color:#3a2f66}.anl tbody th{width:27mm;font-weight:800;color:#3a2f66;background:#f7f5fb}.anl small{display:block;font-weight:600;color:#5a6780;font-size:8pt}.anl thead th:first-child{width:27mm}.anl thead th:nth-child(2):not(:last-child){width:38mm}.anl .aa{font-weight:700}
/* 풀이 순서: 단계마다 번호표를 달고 쪽 사이에서 끊기지 않게(운영자 2026-10-30 「풀이 순서도 명확하게」) */
.stp{list-style:none;margin:0 0 2mm;padding:0;font-size:9.4pt;line-height:1.55}.stp li{display:grid;grid-template-columns:15mm 1fr;column-gap:2.5mm;align-items:start;padding:1.2mm 0;border-top:.2mm solid #d9d3e6;break-inside:avoid}.stp li:first-child{border-top:0}.stp .sn{font-size:7.4pt;font-weight:800;letter-spacing:.06em;color:#fff;background:${ACC};border-radius:1mm;padding:.5mm 0;text-align:center;margin-top:.6mm}
/* 전자책 연습의 미니 정답: 문제 바로 아래에 두면 눈에 먼저 들어와서, 쪽 아래에 작게 거꾸로(180도) 둔다(운영자 2026-10-30) */
.yrev{margin-top:3mm;padding:1.2mm 2.4mm;border:.25mm dashed #b9b2c9;border-radius:1mm;font-size:7pt;line-height:1.5;color:#6b6460;transform:rotate(180deg);text-align:left}
.la{display:flex;gap:3mm;align-items:center;margin-top:4mm;padding:2.2mm 3.4mm;border-left:1.2mm solid #d9822b;background:#fff6ea;border-radius:1.2mm;font-size:8.6pt;line-height:1.45;break-inside:avoid}.la b{flex:none;font-size:7.6pt;letter-spacing:.03em;color:#b25f12;max-width:24mm}.la span{flex:1}.la em{flex:none;font-style:normal;font-weight:800;color:${ACC};font-size:8.2pt}
.pr li.fill,.pr li.two{align-items:start}.pr li.two .ln{align-self:end}.pr li.two.fill{grid-template-columns:6mm 1fr}.pr .q .ko{display:block}.pr .q .en{display:block;margin-top:.5mm;font-size:8.2pt;color:#6d655c;line-height:1.35}
.pr.th li{display:block;position:relative;padding:1.4mm 0 1mm 6mm;min-height:0}.pr.th li:before{position:absolute;left:0;top:1.6mm}.pr.th .q{display:block}.pr.th .tl{display:block;height:7.2mm;border-bottom:.25mm solid #9aa7bf}
.pr .q{font-weight:500;line-height:1.45;padding-bottom:.4mm}.pr .ln{flex:none;min-width:0;height:4.8mm;border-bottom:.2mm solid #8e9ab0;margin:0}.pr .bl{border-bottom:.2mm solid #8e9ab0}
.uh{display:block;padding-bottom:3mm;border-bottom:.35mm solid ${ACC};margin-bottom:1.2mm;position:relative}
.uh:after{content:'';position:absolute;left:0;right:0;bottom:-1.6mm;border-bottom:1.1mm solid ${ACC}}
.uh .un{display:block;width:auto;height:auto;background:transparent;color:${ACC};font-size:7.6pt;font-weight:800;letter-spacing:.24em;margin-bottom:1.4mm;line-height:1.2}
.uh .ut small{display:none}.uh .ut h2{font-size:23pt;line-height:1.2;font-weight:800;color:#111}.uh .ut h3{font-size:11pt;font-weight:500;color:#5a6780;margin-top:1mm}
.us{margin:4.6mm 0 5mm;font-size:9.2pt;color:#2a3550;padding:0;border:0}.us small{display:block;margin-top:.8mm;color:#6b7a92;font-size:8.4pt}
.pd{background:#fff !important;color:#111 !important;padding:70mm 24mm 0 !important}.pd:before,.pd:after{display:none !important}
.pd .no{color:${ACC};opacity:1}.pd .big{color:${ACC};opacity:1;font-size:96pt;font-weight:800;margin:4mm 0 5mm}.pd h2{color:#111;font-size:26pt;padding-bottom:4mm;border-bottom:1.1mm solid ${ACC}}.pd h3{color:#5a6780;opacity:1}.pd .list{color:#2a3550;opacity:1;margin-top:8mm}
.toc .pt,.ak .u h4 span,.ix .ini,.memo h2{color:${ACC}}.how li:before{background:${ACC}}
.ak .u h4{border-bottom-color:${ACC}}.tp .rule{background:${ACC}}
`;
/* ㉠ ㉡ ㉢ — 글꼴에 없는 글자라 동그라미 + 자음을 선으로 직접 그린다(글꼴 자음은 칸 안에서 위 · 아래로 쏠려 보였다 — 운영자 2026-10-18 「위치가 이상하다」) */
const CMP = { '㉠': 'M6.6 6.4H13.6V13.6', '㉡': 'M6.6 6.4V13.6H13.6', '㉢': 'M13.6 6.4H6.6V13.6H13.6' };
const CM = Object.fromEntries(Object.entries(CMP).map(([k, d]) => [k, `<svg class="cm" viewBox="0 0 20 20" aria-label="${k}"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="miter"/></svg>`]));
const lvPageCss = LV ? `.pd.lv,.dop.lv{background:radial-gradient(ellipse at 72% 78%,${LVI.bg} 0%,${LVI.bg2} 80%) !important;color:#fff !important;padding:0 !important;overflow:hidden}
.pd.lv:before,.pd.lv:after{display:none !important}
.pd.lv .fr,.dop.lv .fr{position:absolute;left:9mm;top:9mm;right:9mm;bottom:9mm;border:.5mm solid ${LVG[1]}}
.pd.lv .ptp{position:absolute;left:18mm;right:18mm;top:17mm;display:flex;justify-content:space-between;font-size:7.4pt;font-weight:700;letter-spacing:.18em;color:${LVG[0]}}
.pd.lv .no{position:absolute;left:18mm;top:52mm;font-size:11pt;font-weight:800;letter-spacing:.36em;color:${LVG[1]};opacity:1}
.pd.lv .big{position:absolute;left:16mm;top:56mm;margin:0;font-size:132pt;font-weight:900;line-height:.9;letter-spacing:-.04em;color:${LVG[0]};opacity:1}
.pd.lv .orn{position:absolute;left:18mm;top:118mm;width:70mm;height:.5mm;background:${LVG[1]}}.pd.lv .orn:after{content:'';position:absolute;left:72mm;top:-1.1mm;width:2.6mm;height:2.6mm;background:${LVG[1]};transform:rotate(45deg)}
.pd.lv h2{position:absolute;left:18mm;right:18mm;top:127mm;font-size:26pt;line-height:1.25;color:#fff;border:0 !important;padding:0 !important;margin:0}.pd.lv h3{position:absolute;left:18mm;right:18mm;top:147mm;margin:0;font-size:12.5pt;font-weight:500;color:${LVG[0]};opacity:.95}
.pd.lv .list{position:absolute;left:18mm;right:18mm;top:162mm;margin:0;font-size:8.4pt;line-height:1.62;color:#fff;opacity:.92}
.pd.lv .ft,.dop.lv .ft{position:absolute;left:18mm;right:18mm;bottom:17mm;display:flex;align-items:center;justify-content:space-between}
.pd.lv .mini,.dop.lv .mini{position:relative;width:16mm;height:16mm;border-radius:50%;background:radial-gradient(circle at 50% 38%,${LVI.bg},${LVI.bg2});box-shadow:0 0 0 .5mm ${LVG[1]},0 0 0 1.1mm #fff,0 0 0 1.5mm ${LVG[1]}aa}.pd.lv .mini svg,.dop.lv .mini svg{position:absolute;left:1.4mm;top:.9mm;width:13.2mm;height:13.2mm}
.dop.lv .rb b{color:${LVI.bg}}.dop.lv .rb i{color:${LVI.bg}}.dop.lv .tx h2{color:#fff}.dop.lv .tx p{color:${LVG[0]}}.dop.lv .dbx:before,.dop.lv .dbx:after,.dop.lv .dbx span:before,.dop.lv .dbx span:after{border-color:${LVG[1]}}
.dop.lv .dt{background:${LVG[1]}}.dop.lv .pl{color:${LVG[0]}}.dop.lv .pl small{color:${LVG[1]}}` : '';
const shell = (body) => recolor(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(B.title.ko)} · ${esc(B.title.en)}</title><link rel="stylesheet" href="/vendor/pretendard.css"><style>${CSS}${CLASSIC ? CLASSIC_CSS : ''}${LV ? lvPageCss : ''}${reviewTop}</style></head><body>${body.replace(/[㉠㉡㉢]/g, (c) => CM[c])}</body></html>`);
let pages = new Map();
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (u === '/__book.html') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(pages.get('cur')); }
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  const mt = { '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.js': 'text/javascript' }[path.extname(f)] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': mt }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}`;
const { chromium } = await import(PW);
const browser = await chromium.launch({ executablePath: CHROMIUM });
const pg = await browser.newPage();
async function pdf(html, opts = {}) {
  pages.set('cur', shell(html));
  await pg.goto(`${BASE}/__book.html`, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  return pg.pdf({ preferCSSPageSize: true, printBackground: true, ...opts });
}
const countPages = (buf) => (buf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) || []).length;

const entries = indexEntries();
const blocks = B.compact ? parts.flatMap((p) => p.sheets.map((sh) => { const u = units.find((x) => x.id === sh.id); return [`unit${u.no}`, unitBlock(u)]; })) : [
  ['title', titlePage()], ['copyright', copyrightPage()], ['preface', prefacePage()], ...(B.authorNote && B.authorBio ? [['note', notePage()]] : []), ...(B.authorBio ? [['author', authorPage()]] : []), ['how', howPage()], ...(B.selfStudy ? [['studymap', studyMap()]] : []), ...(B.noGuide ? [] : [['guide', guidePage()]]), ['toc', tocPage(null)], ...FRONT_LIST.map(([k, , , fn]) => [k, fn()]),
  ...parts.flatMap((p) => [[`part${p.no}`, partPage(p)], ...(TWM ? [[`qguide${p.no}`, qGuidePage(p)], [`qscore${p.no}`, qScorePage(p)], [`qworked${p.no}`, qWorkedPage(p)]] : []), ...p.sheets.map((s) => { const u = units.find((x) => x.id === s.id); return [`unit${u.no}`, unitBlock(u)]; })]),
  ...(B.selfStudy ? [['mlog', mistakeLog(2)]] : []), ['answers', answersBlock()], ...(B.noIndex ? [] : [['index', indexBlock(entries)]]),
];
const counts = {};
for (const [k, html] of blocks) { counts[k] = countPages(await pdf(html)); if (process.env.BOOK_DEBUG) { console.log("  블록", k, counts[k]); if (k === "unit1") fs.writeFileSync("/tmp/blk-unit1.pdf", await pdf(html)); } }
let total = Object.values(counts).reduce((a, b) => a + b, 0);
const memoPages = (total + 1) % 2 === 0 ? 1 : 2;   // 메모 쪽은 1~2쪽 — 총 쪽수는 짝수(인쇄 · 제본)
if (!B.compact) { blocks.push(['memo', memoBlock(memoPages)]); counts.memo = memoPages; total += memoPages; }
/* 시작 쪽 = 앞 블록 쪽수의 합 + 1 */
let at = 1; const start = {};
for (const [k] of blocks) { start[k] = at; at += counts[k]; }
const starts = { front: Object.fromEntries(FRONT_LIST.map(([k]) => [k, start[k]])), preface: start.preface, guide: start.guide, unit: Object.fromEntries(units.map((u) => [u.no, start[`unit${u.no}`] + 1])), answers: start.answers, index: start.index, memo: start.memo };
// 단원 첫 쪽(표지 쪽)은 목차에 그 단원의 첫 쪽으로 적는다 — unit 블록은 첫 쪽이 단원 표지이므로 start 그대로가 맞다
for (const u of units) starts.unit[u.no] = start[`unit${u.no}`];
let final = blocks.map(([k, html]) => (k === 'toc' ? tocPage(starts) : html)).join('\n') + (REVIEW ? reviewSheet() : '');

const dir = path.join(outDir, bookId + (THEME !== (B.theme || 'brand') ? `-${THEME}` : ''));
fs.mkdirSync(dir, { recursive: true });
let interior = await pdf(final);
let realTotal = countPages(interior) - (REVIEW ? countPages(await pdf(reviewSheet())) : 0);
/* 단원 블록을 따로 찍은 쪽수가 한꺼번에 찍은 쪽수와 다를 때(모의고사 책) 목차 쪽 번호는 한꺼번에 찍은 PDF 글에서 찾아 다시 찍는다 */
if (realTotal !== total && !REVIEW) {
  try {
    const { execFileSync } = await import('node:child_process');
    const tmpPdf = path.join(os.tmpdir(), `toc-${process.pid}.pdf`); fs.writeFileSync(tmpPdf, interior);
    const pages = execFileSync('pdftotext', ['-layout', tmpPdf, '-'], { maxBuffer: 1 << 28 }).toString().split('\f');
    fs.rmSync(tmpPdf, { force: true });
    const at = (re, from = 0) => { const i = pages.findIndex((t, k) => k >= from && re.test(t)); return i < 0 ? null : i + 1; };
    const tocAt = at(/Contents · 목차/) || 1;
    for (const u of units) { const pg = at(new RegExp(`U ?N ?I ?T ?${String(u.no).padStart(2, '0').split('').join(' ?')}(?!\\d)`), tocAt); if (pg) starts.unit[u.no] = pg; }
    starts.answers = at(/Answer Key/, tocAt) || starts.answers;
    if (!B.compact) starts.memo = at(/Notes\s*·\s*메모/, tocAt) || starts.memo;
    for (const [k] of FRONT_LIST) { const pg = at(k === 'fm1' && B.methods ? /TYPE 1/ : /^$/, tocAt); if (pg && k === 'fm1' && B.methods) starts.front[k] = pg; }
    final = blocks.map(([k, html]) => (k === 'toc' ? tocPage(starts) : html)).join('\n');
    interior = await pdf(final);
    realTotal = countPages(interior); total = realTotal;
    console.log('목차 쪽 번호를 한꺼번에 찍은 PDF 에서 다시 찾아 찍었다');
  } catch (e) { console.warn('⚠ 목차 쪽 번호를 PDF 에서 찾지 못했다:', e.message); }
}
fs.writeFileSync(path.join(dir, REVIEW ? 'interior-review.pdf' : 'interior.pdf'), interior);
/* 한 장 요약(compact) — 표지 · 판권면 · 목차 없이 단원 쪽만. 업무 형식 이름(B.file)으로도 한 부 둔다. */
if (B.compact && !REVIEW) { fs.writeFileSync(path.join(dir, `${B.file || bookId}.pdf`), interior); await browser.close(); server.close(); console.log(`요약 ${bookId}: ${countPages(interior)}쪽 → ${path.join(dir, `${B.file || bookId}.pdf`)}`); process.exit(0); }
if (REVIEW) {
  /* 글 판 — 단원 · 칸마다 출처(학습지id · §번호) · 블록 종류 · 표 · 설명 · 연습(정답 포함) */
  const md = [`# ${B.title.en} · ${B.title.ko} — review text`, '', `단원 ${units.length} · 출처 표기 = 「학습지id · §칸번호」`, ''];
  for (const m of B.methods || []) md.push(`## 유형 ${m.type} · ${m.name.ko} / ${m.name.en}  (${m.nos}번, ${m.count}문항)`, `묻는 말: ${m.ask.ko} / ${m.ask.en}`, ...m.steps.flatMap((x, i) => [`${i + 1}. ${x.ko} / ${x.en}`, ...(x.sub || []).map((y) => `     - ${y.ko} / ${y.en}`)]), `필요한 단어: ${m.words.map((w) => `${w.ko}(${w.en})`).join(' · ')}`, `주의: ${m.trap.ko} / ${m.trap.en}`, '');
  for (const u of units) {
    md.push(`## Unit ${String(u.no).padStart(2, '0')} · ${u.title.en} · ${u.title.ko}  [${u.id}]`, `> ${u.sub.en} / ${u.sub.ko}`, '');
    u.sections.forEach((x, i) => {
      const k = CLASSIC && x.type !== 'practice' && x.type !== 'table' ? (kindOf(u, i, x) === 'ref' ? 'note' : kindOf(u, i, x)) : x.type;
      md.push(`### §${i + 1} · ${x.type} · ${x.title.en}${x.title.ko ? ` / ${x.title.ko}` : ''}   (${u.id} · §${i + 1})`);
      if (x.type === 'table') { md.push(`| ${x.cols.join(' | ')} |`, `|${x.cols.map(() => '---').join('|')}|`, ...x.rows.map((r) => `| ${r.join(' | ')} |`)); if (x.note) md.push('', `[${kindOf(u, i, x)}] ${x.note}`); }
      else if (x.type === 'text') md.push(`[${k}] ${x.text}`);
      else if (x.type === 'plan') md.push(x.fields.map((f) => `${f.en} · ${f.ko}`).join(' / '), `${x.days.en} · ${x.days.ko}`, `${x.goal.en} · ${x.goal.ko}`);
      else if (x.type === 'vocab') x.entries.forEach((e, n) => md.push(`${(x.from || 0) + n + 1}. ${e.ko} [${e.pos}] ${e.en}  | 예문: ${e.ex.ko} (${e.ex.en})  | 급 ${e.lv} · 빈출도 ${e.fq}`));
      else if (x.type === 'checkup') { md.push(`(짝짓기) ${x.match.words.map((w, n) => `${n + 1}. ${w}`).join(' · ')}  ↔  ${x.match.options.map((o, n) => `${'abcdef'[n]}. ${o}`).join(' · ')}  →  **${x.match.answer.map((c, n) => `${n + 1}${c}`).join(' ')}**`); x.cloze.items.forEach((q, n) => md.push(`${x.match.words.length + n + 1}. ${q.q}  (${q.en})  →  **${q.a}**`)); md.push(`(낱말 상자) ${x.cloze.bank.join(' · ')}`); }
      else if (x.type === 'compare') x.items.forEach((q, n) => md.push(`${n + 1}. [${q.kind}] ${q.words.join(' · ')}: ${q.note}`));
      else if (x.type === 'writing') { const r = x.raw; md.push(`(지문) ${r.passage || ''}`); if (r.blanks) r.blanks.forEach((b) => md.push(`${b.mark} 모범답안: ${b.answers.join(' / ')}  |  채점 포인트: ${b.point}`)); else if (r.model) md.push(`모범답안: ${r.model}`); }
      else if (x.type === 'mcq') x.items.forEach((q) => md.push(`${q.no}. [${q.type} · ${q.genre} · ${q.grade}급] ${q.pair ? `(짝 ${q.pair}) ` : ''}${q.question}${q.sentence ? `  <보기> ${q.sentence}` : ''}`, `   지문: ${q.passage.replace(/\n+/g, ' ¶ ')}`, `   ${q.options.map((o, i) => `${CIRC[i]} ${o}`).join('  ')}  →  **${CIRC[q.answer]}**`, `   풀이: ${q.why}`, ...(q.rs ? [`   근거: ${q.ev}`, ...q.rs.map((r, k) => `   ${CIRC[k]} ${k === q.answer ? '○' : '✕'} ${r}`)] : [])));
      else if (x.type === 'omr') md.push(`(답안지) ${x.from}~${x.to}번`);
      else if (x.type === 'flow') md.push(x.steps.map((st) => `${st.ko} (${st.en})`).join(' → '));
      else if (x.items) { if (x.hint) md.push(`(hint) ${x.hint}`); x.items.forEach((q, n) => md.push(`${n + 1}. ${q.q}  →  **${q.a}**`)); }
      const pat = (B.patterns || {})[`${u.id}:${i + 1}`];
      if (pat) md.push('', '[pattern] ' + pat.map((r) => r.p.map(([t, kk]) => (kk === 's' ? `[${t}]` : t)).join(' + ') + ` → ${r.en}${r.ex ? ` · e.g. ${r.ex}${r.exEn ? ` (${r.exEn})` : ''}` : ''}`).join(' | '));
      md.push('');
    });
  }
  if (B.front) {   // 앞부분 · 유형 풀이 · 채점 기준 · 예시 풀이도 검수 글에 — 단원에 안 들어 있는 글(Argon 검수용)
    const bl = (o) => (o && o.en ? `${o.en} / ${o.ko}` : String(o));
    const f = FRONT; const pl = f.plan[B.front];
    md.push('## Front matter · 앞부분', '', '### 시험 소개 (front.exam)', bl(f.exam.intro), ...f.exam.rows.map((r) => `- Q${r[0]} · ${r[1]} · ${r[2]}점 · ${r[3]} · 권장 ${r[4]}분`), ...f.exam.areas.map(bl), '',
      `### ${bl(pl.title)} (front.plan)`, bl(pl.sub), ...pl.weeks.map((w) => `- ${bl(w.t)}: ${w.d.join(' | ')}`), '',
      '### 원고지 쓰기법 (front.wongoji)', ...f.wongoji.rules.map(([r], n) => `${n + 1}. ${bl(r)}`), `예시 문장: ${f.wongoji.sample}`, bl(f.wongoji.caution), '',
      '### 말 → 글 바꾸기 표 (front.written)', bl(f.written.intro), '| 말 | 글 |', '|---|---|', ...f.written.words.concat(f.written.ends).map(([a, b]) => `| ${a} | ${b} |`), bl(f.written.note), '',
      '### 자가 점검표 (front.check)', ...f.check[B.front].groups.flatMap(([k, its]) => [`- ${bl(k)}`, ...its.map((it) => `  - ${bl(it)}`)]), '');
    for (const p of parts) {
      const q = partQ(p); const g = TWM.TW_GUIDE[q]; const e = EXTRAS[q];
      md.push(`## Q${q} 풀이 방법 · 채점 기준 · 예시 풀이`, '', `### ${q}번 풀이 방법 (TW_GUIDE)`, `${g.time.ko} · ${bl(g.what)}`, ...g.steps.map((x, n) => `${n + 1}. ${bl(x)}`), '표현:', ...g.phrases.map((x) => `- ${bl(x)}: ${x.ex}`), '자주 하는 실수:', ...g.mistakes.map((x) => `- ${bl(x)}`), '');
      if (e) md.push(`### ${q}번 채점 기준 (extras.${q})`, bl(e.scoring), ...e.criteria.map((c) => `- ${bl(c.k)} · 높은 점수: ${bl(c.hi)} · 감점: ${bl(c.lo)}`), '', `### ${q}번 예시 풀이 (extras.${q}.worked · 문항 ${e.worked.item})`, ...e.worked.steps.map((x, n) => `${n + 1}. ${bl(x)}`), ...(e.worked.analysis || []).map((x) => `- 분석: ${bl(x)}`), '');
    }
  }
  fs.writeFileSync(path.join(dir, 'review-text.md'), md.join('\n'));
}

/* ── 표지(뒤 + 책등 + 앞) ── */
const spine = Math.round((Math.ceil(realTotal / 2) * T.paperMm + 0.6) * 10) / 10;
const CW = 2 * W + spine + 2 * T.bleed, CH = H + 2 * T.bleed;
const coverCss = `@page{size:${CW}mm ${CH}mm;margin:0}*{box-sizing:border-box;margin:0;padding:0}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{width:${CW}mm;height:${CH}mm;font-family:'Pretendard Variable',sans-serif;position:relative;overflow:hidden;word-break:keep-all}
.back{position:absolute;left:0;top:0;width:${W + T.bleed}mm;height:${CH}mm;background:${TINT};padding:${T.bleed + 22}mm 18mm ${T.bleed + 18}mm ${T.bleed + 18}mm;color:#1d1a17}
.spine{position:absolute;left:${W + T.bleed}mm;top:0;width:${spine}mm;height:${CH}mm;background:${ACC};color:#fff;display:flex;align-items:center;justify-content:space-between;flex-direction:column;padding:${T.bleed + 10}mm 0}
.spine .t{writing-mode:vertical-rl;font-weight:800;font-size:${Math.min(13, Math.max(8, spine * 1.15))}pt;letter-spacing:.04em;white-space:nowrap}.spine .t small{font-weight:500;font-size:.62em;opacity:.9;margin-top:4mm}
.spine .p{writing-mode:vertical-rl;font-size:6.5pt;letter-spacing:.25em;font-weight:700;opacity:.9}
.front{position:absolute;left:${W + T.bleed + spine}mm;top:0;width:${W + T.bleed}mm;height:${CH}mm;background:${ACC};color:#fff;overflow:hidden;padding:${T.bleed + 20}mm ${T.bleed + 18}mm ${T.bleed + 16}mm 20mm}
.front .g{position:absolute;right:-8mm;top:34mm;width:130mm;font-size:92pt;font-weight:900;line-height:.98;letter-spacing:.04em;color:rgba(255,255,255,.13);word-break:break-all;text-align:right}
.front .c1{position:absolute;right:-46mm;bottom:-46mm;width:150mm;height:150mm;border-radius:50%;background:rgba(255,255,255,.14)}
.front .c2{position:absolute;right:34mm;bottom:58mm;width:30mm;height:30mm;border-radius:50%;background:rgba(255,255,255,.18)}
.front .z{position:relative;z-index:1;height:100%;display:flex;flex-direction:column}
.front .ser{font-size:8.6pt;font-weight:800;letter-spacing:.3em;opacity:.92}
.front h1{font-size:44pt;line-height:1.14;margin-top:20mm;font-weight:900;letter-spacing:-.02em}
.front h2{font-size:15pt;line-height:1.35;margin-top:7mm;font-weight:600;opacity:.95;max-width:110mm}
.front .rule{width:20mm;height:1mm;background:#fff;margin-top:9mm;opacity:.9}
.front .sub{margin-top:5mm;font-size:10pt;line-height:1.6;opacity:.92;max-width:105mm}
.front .lv{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between}
.front .badge{background:#fff;color:${ACC};font-weight:900;font-size:13pt;padding:2.4mm 6mm;border-radius:99px;letter-spacing:.04em}
.front .by{text-align:right;font-size:9.6pt;line-height:1.5}.front .by b{display:block;font-size:12pt}.front .by span{opacity:.88;letter-spacing:.1em;font-size:7.6pt}
.back .ser{font-size:7.6pt;font-weight:800;letter-spacing:.28em;color:${ACC}}
.back h3{font-size:19pt;line-height:1.3;margin-top:8mm;font-weight:900}.back h4{font-size:10.5pt;font-weight:600;color:#6d655c;margin-top:3mm;line-height:1.45}
.back p{margin-top:7mm;font-size:9.6pt;line-height:1.7;color:#3d372f}
.back ul{margin-top:6mm;list-style:none;font-size:9.4pt;line-height:1.55}.back li{padding:2mm 0 2mm 7mm;position:relative;border-top:.25mm solid #e6d9c8}.back li:before{content:'';position:absolute;left:0;top:3.6mm;width:3mm;height:3mm;border-radius:50%;background:${ACC}}
.back li small{display:block;color:#8a8278;font-size:8.4pt}
.back .pts{margin-top:7mm;font-size:8.8pt;line-height:1.5}.back .pts div{padding:1.4mm 0;border-top:.25mm solid #e6d9c8}.back .pts b{color:${ACC};margin-right:2mm;letter-spacing:.06em;font-size:7.6pt}.back .pts span{color:#8a8278;margin-left:2mm}
.back .for{margin-top:6mm;font-size:8.8pt;color:#6d655c;line-height:1.6}
.back .bar.bc{border:0;padding:0;height:44mm;background:transparent}.back .bar.bc img{width:100%;height:100%;object-fit:contain}   /* 바코드 그림은 막대만 검정이고 바탕은 투명 — 뒤표지 색 위에서 흰 상자가 따로 뜨지 않는다(2026-10-27) */.back .bar{position:absolute;right:${T.bleed + 18}mm;bottom:${T.bleed + 14}mm;width:62mm;height:34mm;background:#fff;border:.3mm dashed #c9bfae;display:flex;align-items:center;justify-content:center;text-align:center;font-size:7.4pt;color:#a49a8a;line-height:1.5}
.back .pr{position:absolute;left:${T.bleed + 18}mm;bottom:${T.bleed + 14}mm;font-size:8.4pt;color:#6d655c;line-height:1.6}.back .pr b{font-size:9.8pt;color:#1d1a17}
`;
const classicCover = CLASSIC ? `.front{background:#1F3A68}.front .c2{display:none}.front .g{display:block;top:auto;bottom:40mm;right:16mm;width:auto;font-size:74pt;font-weight:900;color:rgba(217,179,91,.14);letter-spacing:.02em;line-height:1.08;white-space:pre;text-align:right}.front .c1{display:block;right:-52mm;bottom:-52mm;width:158mm;height:158mm;background:transparent;border:.5mm solid rgba(217,179,91,.42)}.front:after{content:'';position:absolute;left:8mm;top:8mm;right:8mm;bottom:8mm;border:.3mm solid rgba(217,179,91,.38);pointer-events:none}.front h1 .hl{color:#D9B35B}.front .g svg{display:block;width:96mm;height:67mm;overflow:visible}.front .z:before{content:'';position:absolute;left:0;right:0;top:0;height:1px}
.front .ser{color:#D9B35B;letter-spacing:.34em}.front h1{font-weight:800;margin-top:24mm;font-size:50pt;line-height:1.1;letter-spacing:-.02em}.front h2{font-size:17pt}.front h2{color:#C5D1E6;font-weight:500}.front .rule{background:#D9B35B;height:.8mm;width:26mm}.front .sub{color:#C5D1E6}
.front .badge{background:transparent;color:#D9B35B;border:.6mm solid #D9B35B;border-radius:1.5mm;padding:2mm 5mm}.front .mk{position:absolute;right:${T.bleed + 18}mm;top:${T.bleed + 66}mm;display:flex;gap:2mm;opacity:.95}.front .mk i{display:block;width:26mm;height:26mm}.front .mk svg{width:100%;height:100%}
.back{background:#F4F6FA}.mk2{position:absolute;left:${T.bleed + 18}mm;bottom:${T.bleed + 38}mm;display:flex;gap:2mm}.mk2 i{display:block;width:16mm;height:16mm}.mk2 svg{width:100%;height:100%}` : '';
/* 표지 그림 — coverArt: 'steps' = 계단 한 줄(첫걸음). 금색 면 + 맨 위 한 칸에 점 하나 */
const STEPS_SVG = `<svg viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg"><g fill="rgba(217,179,91,.16)" stroke="rgba(217,179,91,.55)" stroke-width=".7"><rect x="0" y="62" width="24" height="22"/><rect x="24" y="48" width="24" height="36"/><rect x="48" y="34" width="24" height="50"/><rect x="72" y="20" width="24" height="64"/><rect x="96" y="6" width="24" height="78"/></g><circle cx="108" cy="-1" r="3.2" fill="#D9B35B"/><path d="M6 56 Q18 40 30 42 T54 28 T78 14 T102 2" fill="none" stroke="#D9B35B" stroke-width=".9" stroke-dasharray="1.6 2.2" opacity=".9"/></svg>`;
const hlTitle = (t) => (B.coverAccent && t.includes(B.coverAccent) ? esc(t).replace(esc(B.coverAccent), `<span class="hl">${esc(B.coverAccent)}</span>`) : esc(t));

/* ── 레벨별 표지(운영자 2026-10-23 「정석풍 + 고급 · 레벨 상자 안에 작은 캐릭터」) ──
   책 틀 JSON 의 coverLevel {code, name, bg, bg2, mascot:[potato|cheese, 레벨], title:[윗줄, 큰 낱말, 아랫줄], sub}. 앞표지는 px(1px = 0.2646mm) 로 그린다 — 앞표지 폭 ≈ 699px.
   --b 는 재단 여유(3mm ≈ 11px): 위 · 아래 · 오른쪽은 여유가 있고 왼쪽(책등 쪽)은 없다. */
const lvCss = LV ? `.front.lvc{padding:0;--b:11px;background:radial-gradient(ellipse at 72% 74%,${LV.bg} 0%,${LV.bg2} 78%);color:#fff}
.lvc .fr{position:absolute;left:34px;top:calc(34px + var(--b));right:calc(34px + var(--b));bottom:calc(34px + var(--b));border:2px solid #fff}
.lvc .top{position:absolute;left:62px;right:calc(62px + var(--b));top:calc(62px + var(--b));display:flex;justify-content:space-between;font-size:13px;font-weight:700;letter-spacing:.18em}
.lvc .r1{position:absolute;left:62px;right:calc(62px + var(--b));top:calc(96px + var(--b));height:2px;background:#fff}
.lvc .tt{position:absolute;left:62px;right:calc(62px + var(--b));top:calc(176px + var(--b))}.lvc .tt .a{font-size:30px;font-weight:600;letter-spacing:.02em;margin-bottom:10px}
.lvc .tt h1{margin:0;font-size:92px;font-weight:900;letter-spacing:-.04em;line-height:1.08;color:#E3D4A6}.lvc .tt .c{font-size:60px;font-weight:800;letter-spacing:-.03em;margin-top:12px}
.lvc .orn{position:absolute;left:62px;top:calc(506px + var(--b));width:120px;height:12px}.lvc .orn:before{content:'';position:absolute;left:0;top:5px;width:120px;height:2px;background:#fff}.lvc .orn:after{content:'';position:absolute;left:128px;top:1px;width:9px;height:9px;background:${LVG[1]};transform:rotate(45deg)}
.lvc .en{position:absolute;left:62px;top:calc(534px + var(--b));font-size:23px;font-weight:500;letter-spacing:.03em}.lvc .sub{position:absolute;left:62px;top:calc(572px + var(--b));font-size:18px;opacity:.85}
.lvc .lvb{position:absolute;left:62px;bottom:calc(128px + var(--b));background:#fff;color:${LV.bg};padding:14px 18px 14px 26px;min-width:250px;display:flex;align-items:center;justify-content:space-between;gap:22px}
.lvc .lvb b{display:block;font-size:56px;font-weight:900;letter-spacing:-.02em;line-height:1}.lvc .lvb span{display:block;margin-top:8px;font-size:19px;font-weight:800;letter-spacing:.2em}
.lvc .mini{flex:none;position:relative;width:70px;height:70px;border-radius:50%;background:radial-gradient(circle at 50% 38%,${LV.bg},${LV.bg2});box-shadow:0 0 0 2px ${LVG[1]},0 0 0 4px #fff,0 0 0 5px ${LVG[1]}aa}.lvc .mini svg{position:absolute;left:6px;top:4px;width:58px;height:58px}
.lvc .r3{position:absolute;left:62px;right:calc(62px + var(--b));bottom:calc(92px + var(--b));height:2px;background:#fff}
.lvc .au{position:absolute;left:62px;right:calc(62px + var(--b));bottom:calc(50px + var(--b));display:flex;justify-content:space-between;font-size:15px;font-weight:700}.lvc .au small{font-size:11px;letter-spacing:.24em;font-weight:500;color:${LVG[0]}}
.front.lvc:after{display:none}.spine{background:${LV.bg} !important}` : '';
const lvFront = LV ? `<div class="front lvc"><div class="fr"></div><div class="top"><span>${KDP ? 'KOREAN STUDY SERIES' : 'KOREAN WORKBOOK SERIES'}</span><span>${KDP ? '한국어 학습 시리즈' : '한국어 워크북 시리즈'}</span></div><div class="r1"></div>
<div class="tt"><div class="a">${esc(LV.title[0])}</div><h1${LV.h1 ? ` style="font-size:${LV.h1}px"` : ''}>${esc(LV.title[1])}</h1>${LV.title[2] ? `<div class="c">${esc(LV.title[2])}</div>` : ''}</div><div class="orn"></div><div class="en">${esc(B.title.en)}</div><div class="sub">${esc(LV.sub || '')}</div>
<div class="lvb"><div><b>${esc(LV.code)}</b><span>${esc(LV.name)}</span></div><div class="mini">${lvMascot}</div></div><div class="r3"></div><div class="au"><span>${esc(B.author.ko)} · ${esc(B.author.en)}</span><small>${logoSvg({ fg: LVG[0], one: true, height: '16px' })}</small></div></div>` : '';
const coverHtml = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/vendor/pretendard.css"><style>${coverCss}${classicCover}${lvCss}</style></head><body>
<div class="back"><div class="ser">${esc(B.series.en)} · ${esc(B.level)}</div>
<h3>${esc(B.sub.ko)}</h3><h4>${esc(B.sub.en)}</h4>
<p>${esc(B.preface.ko[0])}</p>
<ul>${(B.back?.items || [[`${B.unitCount ?? units.length} units · ${B.unitCount ?? units.length}개 단원`, 'Hangul to everyday conversation · 한글부터 생활 표현까지'], ['4 practice sets per unit · 단원마다 연습 4묶음', 'Write in the book · 책에 바로 쓰기'], ['Answer key &amp; index · 정답과 찾아보기', 'Check yourself, look up any word · 스스로 확인하고 낱말 찾기']]).map(([a, b]) => `<li>${a}<small>${b}</small></li>`).join('')}</ul>
<div class="pts">${parts.map((p) => `<div><b>PART ${p.no}</b> ${esc(p.title.ko)} <span>${esc(p.title.en)}</span></div>`).join('')}</div>
<div class="for">${B.back?.for || 'For complete beginners and A1 classes · 완전 초급과 A1 수업에'}<br>${esc(B.web)}</div>
<div class="pr"><b>${B.back?.price || (B.isbn ? `정가 ${B.isbnPrice}` : '정가 ○○,○○○원')}</b>${B.isbn ? '' : ' (예정)'}<br>${esc(B.publisher.ko)}<br>${logoSvg({ fg: '#14264A', one: true, height: '4.4mm' })}</div>
${CLASSIC ? `<div class="mk2"><i>${potatoLevel(3).icon}</i><i>${cheeseLevel(2).icon}</i></div>` : ''}${ISBN_BC ? `<div class="bar bc"><img src="${ISBN_BC}" alt="ISBN ${esc(B.isbn)}"></div>` : `<div class="bar">ISBN barcode<br>발급 후 이 자리에 · 40×25mm 이상</div>`}</div>
<div class="spine"><div class="t">${esc(B.title.ko)} <small>${esc(B.title.en)}</small></div><div class="p">${logoSvg({ fg: '#fff', one: true, rotate: true, width: '3.4mm' })}</div></div>
${LV ? lvFront : `<div class="front"><div class="g"${B.coverGlyphPt ? ` style="font-size:${Number(B.coverGlyphPt)}pt"` : ''}>${B.coverArt === 'steps' ? STEPS_SVG : esc(B.coverGlyph || "ㄱㄴㄷ ㄹㅁㅂ ㅅㅇㅈ ㅊㅋㅌ ㅍㅎ 가나 다라")}</div><div class="c1"></div><div class="c2"></div>
<div class="z"><div class="ser">${esc(B.series.en)}</div><h1>${hlTitle(B.title.ko)}</h1><h2>${esc(B.title.en)}</h2><div class="rule"></div><p class="sub">${esc(B.sub.en)}</p>
<div class="lv"><span class="badge">${esc(B.level)} · ${esc(B.levelTag || "BEGINNER")}</span><div class="by"><b>${esc(B.author.ko)} · ${esc(B.author.en)}</b><span>${logoSvg({ fg: '#fff', one: true, height: '3.6mm' })}</span></div></div></div></div>`}
</body></html>`;
pages.set('cur', coverHtml);
await pg.goto(`${BASE}/__book.html`, { waitUntil: 'networkidle' });
await pg.evaluate(() => document.fonts.ready);
fs.writeFileSync(path.join(dir, 'cover-spread.pdf'), await pg.pdf({ preferCSSPageSize: true, printBackground: true }));
const front = await pg.$('.front');
await pg.setViewportSize({ width: Math.ceil(CW * 3.78), height: Math.ceil(CH * 3.78) });
await front.screenshot({ path: path.join(dir, 'front-cover.png') });
/* 전자책 판매처(아마존 KDP 등)용 큰 앞표지 — 같은 표지를 3배 선명하게 JPEG 로(KDP 는 세로 2560px 이 이상적, 최소 1000px) */
{
  const hp = await browser.newPage({ viewport: { width: Math.ceil(CW * 3.78), height: Math.ceil(CH * 3.78) }, deviceScaleFactor: 3 });
  await hp.goto(`${BASE}/__book.html`, { waitUntil: 'networkidle' });
  await hp.evaluate(() => document.fonts.ready);
  await (await hp.$('.front')).screenshot({ path: path.join(dir, 'front-cover-hires.jpg'), type: 'jpeg', quality: 92 });
  await hp.close();
}
/* ── ePub ── */
if (EPUB) {
  const ex = path.join(dir, 'epub-src'); fs.rmSync(ex, { recursive: true, force: true });
  fs.mkdirSync(path.join(ex, 'META-INF'), { recursive: true }); fs.mkdirSync(path.join(ex, 'OEBPS'), { recursive: true });
  const O = (f) => path.join(ex, 'OEBPS', f);
  const xesc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const chap = [];   // { id, file, title }
  const skip = new Set(['toc', 'index', 'memo', 'title', 'studymap', 'mlog']);
  const list = blocks.filter(([k]) => !skip.has(k));
  if (B.bonus) list.push(['bonus', `<div class="blk plain"><h2>Reader bonus · 구매자 혜택</h2>${bonusBox()}</div>`]);
  /* 인라인 SVG 는 Kindle(KF8)이 제대로 못 그린다 — QR · 아이콘이 쪽 가득한 빈 상자로 나왔다. 그림(PNG)으로 바꿔 넣는다: 같은 모양은 한 번만 찍어 나눠 쓴다. */
  const { createHash } = await import('node:crypto');
  const px = await browser.newPage({ viewport: { width: Math.ceil(CW * 3.78), height: Math.ceil(CH * 3.78) }, deviceScaleFactor: 3 });
  fs.mkdirSync(O('img'), { recursive: true });
  const imgFiles = new Set();
  for (const [k, html] of list) {
    pages.set('cur', shell(html));
    await px.goto(`${BASE}/__book.html`, { waitUntil: 'networkidle' });
    await px.evaluate(() => document.querySelectorAll('.sc, .fr, .ft').forEach((e) => e.remove()));   // 연필로 체크하는 줄 · 장식은 전자책에서 뺀다
    /* 제목 띠 · 부 표지 · 소제목은 글꼴이 입혀진 그림으로 — Kindle 마다 한글이 다르게(가늘게) 보이는 것을 제목에서는 없앤다. 본문은 글로 둔다(글자 크기 조절 · 검색). */
    const title0 = await px.evaluate(() => ((document.querySelector('.ttl h2, h2, h1') || {}).textContent || '').trim());
    const heads = await px.evaluate(() => { const out = []; document.querySelectorAll('.uh, .pd, .sec > h3').forEach((e, i) => { e.setAttribute('data-h', String(i)); const g = (q) => { const x = e.querySelector(q); return x ? x.textContent.replace(/\s+/g, ' ').trim() : ''; }; if (e.matches('.uh')) out.push({ i, kind: 'uh', un: g('.un'), ko: g('h2'), en: g('h3') }); else if (e.matches('.pd')) out.push({ i, kind: 'pd', ptp: [...e.querySelectorAll('.ptp span')].map((x) => x.textContent.trim()).join('   '), no: g('.no'), big: g('.big'), ko: g('h2'), en: g('h3') }); else { const sp = [...e.children].find((c) => c.tagName === 'SPAN'); out.push({ i, kind: 'sec', lab: g('.lab'), en: sp ? sp.textContent.trim() : '', ko: g('small') }); } }); return out; });
    const hesc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const FONT = "font-family:'Pretendard Variable','Pretendard','Noto Sans KR',sans-serif;";
    const bannerHtml = (h) => h.kind === 'uh'
      ? `<div style="${FONT}background:${ACC};color:#fff;padding:16px 18px;border-radius:12px"><div style="font-size:11.5px;letter-spacing:.12em;font-weight:700;opacity:.88">${hesc(h.un)}</div><div style="font-size:26px;font-weight:800;line-height:1.25;margin-top:8px">${hesc(h.ko)}</div><div style="font-size:15px;font-weight:500;opacity:.93;margin-top:4px">${hesc(h.en)}</div></div>`
      : h.kind === 'pd'
        ? `<div style="${FONT}background:${ACC};color:#fff;padding:24px 22px 22px;border-radius:12px"><div style="font-size:12px;letter-spacing:.1em;opacity:.9">${hesc(h.ptp)}</div><div style="font-size:14px;letter-spacing:.3em;font-weight:800;margin-top:26px">${hesc(h.no)}</div><div style="font-size:80px;font-weight:900;line-height:1;letter-spacing:-.03em">${hesc(h.big)}</div><div style="width:54px;height:4px;background:#fff;margin:12px 0 18px"></div><div style="font-size:30px;font-weight:800;line-height:1.25">${hesc(h.ko)}</div><div style="font-size:17px;font-weight:500;opacity:.93;margin-top:6px">${hesc(h.en)}</div></div>`
        : `<div style="${FONT}background:#fff;color:#1d1a17;padding:6px 2px 9px"><div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px"><span style="border:1.5px solid ${ACC};color:${ACC};border-radius:5px;padding:1px 8px;font-size:13px;font-weight:700;white-space:nowrap">${hesc(h.lab)}</span><span style="font-size:19px;font-weight:800;line-height:1.25">${hesc(h.en)}</span></div>${h.ko ? `<div style="font-size:13px;color:#8a8278;margin-top:4px">${hesc(h.ko)}</div>` : ''}</div>`;
    const hplan = [];
    for (const h of heads) {
      const html = bannerHtml(h), f = `img/h_${createHash('md5').update(html).digest('hex').slice(0, 12)}.png`;
      if (!imgFiles.has(f)) {
        await px.evaluate((x) => { const d = document.createElement('div'); d.id = '__bn'; d.style.cssText = 'position:fixed;left:0;top:0;width:420px;z-index:99999;background:#fff'; d.innerHTML = x; document.body.appendChild(d); }, html);
        await px.evaluate(() => document.fonts.ready);
        await px.locator('#__bn').screenshot({ path: O(f) });
        (await import('node:child_process')).execFileSync('convert', [O(f), '-gravity', 'south', '-chop', '0x4', '+repage', '-colors', '64', `PNG8:${O(f)}`]);   // 평평한 색 그림 — 색 수를 줄여 용량을 1/5 로
        await px.evaluate(() => document.getElementById('__bn').remove());
        imgFiles.add(f);
      }
      hplan.push({ i: h.i, f, alt: h.kind === 'pd' ? `Part ${h.big} · ${h.ko} · ${h.en}` : h.kind === 'uh' ? `${h.un} · ${h.ko} · ${h.en}` : `${h.lab} ${h.en} ${h.ko}`.trim() });
    }
    await px.evaluate((plan) => { for (const t of plan) { const e = document.querySelector(`[data-h="${t.i}"]`); if (!e) continue; const im = document.createElement('img'); im.setAttribute('src', t.f); im.setAttribute('alt', t.alt); im.setAttribute('class', 'hd'); e.replaceWith(im); } }, hplan);
    const svgs = await px.evaluate(() => [...document.querySelectorAll('svg')].map((sv, i) => {
      sv.setAttribute('data-i', String(i));
      const cs = getComputedStyle(sv), r = sv.getBoundingClientRect();
      const inQr = !!sv.closest('.qr'), logo = sv.getAttribute('role') === 'img' && !!sv.getAttribute('aria-label');
      return { i, w: r.width, h: r.height, inQr, logo, cls: sv.getAttribute('class') || '', inLg: !!sv.closest('.lg'), key: sv.outerHTML + '|' + cs.color + cs.fill + cs.stroke + cs.strokeWidth + Math.round(r.width) + 'x' + Math.round(r.height) };
    }));
    const plan = [];
    for (const v of svgs) {
      if (v.logo || v.w < 1 || v.h < 1) { plan.push({ i: v.i, drop: true }); continue; }
      const f = `img/s_${createHash('md5').update(v.key).digest('hex').slice(0, 10)}.png`;
      if (!imgFiles.has(f)) { await px.locator(`svg[data-i="${v.i}"]`).screenshot({ path: O(f), omitBackground: true }); imgFiles.add(f); }
      const em = v.inQr ? 6 : /\blvl-ic\b/.test(v.cls) ? 4 : /\bic\b/.test(v.cls) ? 1 : v.inLg ? 1.4 : Math.min(8, Math.max(.8, v.w / 16));
      plan.push({ i: v.i, f, em, alt: v.inQr ? 'QR code' : '' });
    }
    await px.evaluate((plan) => { for (const t of plan) { const sv = document.querySelector(`svg[data-i="${t.i}"]`); if (!sv) continue; if (t.drop) { sv.remove(); continue; } const im = document.createElement('img'); im.setAttribute('src', t.f); im.setAttribute('alt', t.alt); im.setAttribute('style', `width:${t.em}em;height:auto`); sv.replaceWith(im); } document.querySelectorAll('table').forEach((t) => { const trs = [...t.querySelectorAll('tr')]; if (!trs.length) return; const hasHead = !!t.querySelector('thead') || [...trs[0].children].every((c) => c.tagName === 'TH'); const heads = hasHead ? [...trs[0].children].map((c) => c.textContent.split(' · ')[0].trim()) : []; const body = hasHead ? trs.slice(1) : trs; const wrap = document.createElement('div'); wrap.className = 'tl'; body.forEach((tr) => { const cells = [...tr.children]; if (!cells.length) return; const row = document.createElement('div'); row.className = 'tlr'; const lead = document.createElement('div'); lead.className = 'tl1'; lead.innerHTML = cells[0].innerHTML; if (cells[0].textContent.trim().length <= 2) lead.className += ' tlb'; row.appendChild(lead); const rest = cells.slice(1); const short = rest.reduce((n, c) => n + c.textContent.length, 0) <= 55 && rest.length <= 4; const mk = (c, i) => { const h = heads.length > 2 && heads[i + 1] ? `<span class="tlh">${heads[i + 1]} </span>` : ''; return `${h}${c.innerHTML}`; }; if (short) { const d = document.createElement('div'); d.className = 'tlc'; d.innerHTML = rest.map(mk).join(' <span class="tld">·</span> '); row.appendChild(d); } else rest.forEach((c, i) => { const d = document.createElement('div'); d.className = 'tlc'; d.innerHTML = mk(c, i); row.appendChild(d); }); wrap.appendChild(row); }); t.replaceWith(wrap); });   // 표는 Kindle 이 점선 · 확대 아이콘을 붙이고 좁은 열을 글자 단위로 끊는다 — 줄 단위 목록으로
document.querySelectorAll('.pldc').forEach((d) => { const cells = [...d.querySelectorAll('i')].map((i) => `<td>${i.querySelector('b').innerHTML}<br/>${i.querySelector('small').textContent}</td>`).join(''); const t = document.createElement('table'); t.className = 'wk'; t.innerHTML = `<tbody><tr>${cells}</tr></tbody>`; d.replaceWith(t); }); document.querySelectorAll('.ak .set').forEach((set) => { const bd = set.querySelector('b'); if (!bd) return; const txt = [...set.childNodes].filter((n) => n !== bd).map((n) => n.textContent).join(''); [...set.childNodes].filter((n) => n !== bd).forEach((n) => n.remove()); txt.trim().split(/\s+·\s+(?=\d+\)\s)/).forEach((t) => { const sp = document.createElement('span'); sp.className = 'ai'; sp.textContent = t.trim(); set.appendChild(sp); }); }); document.querySelectorAll('.qrb.uq').forEach((b) => { const a = b.querySelector('a'); const im = b.querySelector('.qr img'); if (a && im) { const w = document.createElement('a'); w.setAttribute('href', a.getAttribute('href')); im.replaceWith(w); w.appendChild(im); a.remove(); } }); }, plan);   // 단원 QR 상자: 눈에 보이는 주소 줄은 빼고, QR 그림 자체를 누르면 열리게
    const r = await px.evaluate(() => ({ title: ((document.querySelector('.ttl h2, h2, h1') || {}).textContent || '').trim(), body: [...document.body.childNodes].map((n) => new XMLSerializer().serializeToString(n)).join('') }));
    const file = `c_${k}.xhtml`;
    const body = r.body.replace(/\n?<dt>ISBN<\/dt><dd>[^<]*\(PDF\)<\/dd>\n<dt>Price · 정가<\/dt><dd>[^<]*<\/dd>/, '' /* 한국 ISBN 은 PDF 판에만 붙는다 — ePub(KDP 등)에는 쓰지 않는다 */).replace(/ style="page:[^"]*"/g, '').replace(/ style="break-inside:avoid"/g, '').replace('Digital edition (PDF) · 디지털판(PDF) · print it at home or at a print shop · 집이나 인쇄소에서 인쇄해 쓰세요', 'Digital edition (ePub) · 디지털판(ePub)');   // 글꼴을 책에 넣지 않으므로 「Typeset in Pretendard」 줄도 ePub 에서는 뺀다
    const bodyKo = body.replace('<dt>Web</dt>', EPUBVER ? `<dt>File version · 파일 버전</dt><dd>ePub ${EPUBVER}</dd><dt>Web</dt>` : '<dt>Web</dt>').replace(/PDF판은 아래 주소를 눌러도 돼요\./g, 'QR 그림을 눌러도 열려요.').replace('<p>Typeset in Pretendard (SIL Open Font License 1.1).</p>', '').replace('<dt>Web</dt><dd></dd>', '').replace(KDP ? /<span class="(ln|tl)"><\/span>/g : /$^/, '').replace(/>([^<>]*[가-힣][^<>]*)</g, '><span lang="ko" xml:lang="ko">$1</span><');   // 한글 덩어리에 언어 표시 — 전자책 기기가 한글 글꼴 · 줄 맞춤을 제대로 고르게   // 판권면의 「PDF · 인쇄해 쓰세요」 는 PDF 판 글 — ePub 에서는 맞지 않아 바꾼다
    fs.writeFileSync(O(file), `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><meta charset="utf-8"/><title>${xesc(title0 || r.title || B.title.en)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body>${bodyKo}</body></html>`);
    chap.push({ id: k, file, title: title0 || r.title || k, svg: /<svg[\s>]/.test(body) });
  }
  fs.copyFileSync(path.join(dir, 'front-cover.png'), O('cover.png'));
  fs.writeFileSync(O('cover.xhtml'), `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><meta charset="utf-8"/><title>${xesc(B.title.en)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body class="cv"><img src="cover.png" alt="${xesc(B.title.en)}"/></body></html>`);
  fs.writeFileSync(O('style.css'), `body{line-height:1.65;margin:0 4%;color:#1d1a17}
.cv{margin:0;text-align:center}.cv img{max-width:100%;max-height:100vh}
h1,h2,h3,h4{line-height:1.3;margin:1.2em 0 .4em;page-break-after:avoid}h2{font-size:1.5em;color:${ACC}}h3{font-size:1.15em}small{color:#6d655c;font-size:.85em;display:block}
.blk{margin:0 0 1em}.uo .no,.uo .pn,.pn,.un{letter-spacing:.12em;font-size:.8em;font-weight:700;color:${ACC}}
.sec{margin:1.2em 0}.sec h3{border-bottom:2px solid ${ACC};padding-bottom:.2em}.sec h3 em{font-style:normal;color:${ACC};margin-right:.4em;font-size:.8em}
table{border-collapse:collapse;width:100%;margin:.6em 0;font-size:.95em}th,td{border:1px solid #d8cfc0;padding:.35em .5em;text-align:left;vertical-align:top}th{background:${TINT}}
ol.pr{padding-left:1.6em}ol.pr li{margin:.7em 0;padding-bottom:.5em;border-bottom:1px solid #d8cfc0}
.note,.hint{background:${TINT};border-left:4px solid ${ACC};padding:.5em .8em;margin:.6em 0;border-radius:3px}
.flow{display:block}.flow .fs{display:inline-block;margin:.2em .4em .2em 0;padding:.3em .6em;border:1px solid ${ACC};border-radius:6px}.flow .fs b{display:block}.flow .fs span{font-size:.85em;color:#6d655c}
.wl{margin:.4em 0}.wans{color:${ACC};font-weight:600}.wp{margin:.6em 0;padding:.6em .8em;border:1px solid #d8cfc0;border-radius:4px}
.qrb{display:block;margin:1em 0;padding:.6em .8em;border:1px solid ${ACC};border-radius:6px;background:${TINT}}.qrb .qr svg{width:6em;height:6em}.qrb b{display:block;color:${ACC}}.qrb small{margin:.3em 0}.qrb a{word-break:break-all}
a{color:${ACC}}
.pd{margin:2em 0 1em}.pd .ptp{font-size:.72em;letter-spacing:.08em;color:#6d655c}.pd .ptp span{display:inline-block;margin-right:1em}.pd .no{font-size:.8em;font-weight:700;letter-spacing:.3em;color:${ACC};margin-top:1.4em}.pd .big{font-size:3.6em;font-weight:800;line-height:1.05;color:${ACC}}.pd .orn{height:3px;width:3em;background:${ACC};margin:.5em 0 .9em}.pd h2{margin:.2em 0}.pd h3{font-size:1.05em;font-weight:500;color:#4a443d;margin:.2em 0 1em}.pd .list{font-size:.88em;line-height:1.9;color:#4a443d}.pd .list br{display:block}
.bx{margin:.9em 0;padding:.5em .8em;border-left:4px solid #5B6B86;background:#f4f5f8;border-radius:3px}.bx.tip{border-color:#2F5DA8;background:#f2f6fc}.bx.warn{border-color:#B3322D;background:#fbf1f0}.bx.pattern{border-color:${ACC};background:${TINT}}.bx.more{border-style:dashed}
.bx .lg{font-size:.78em;font-weight:700;letter-spacing:.08em;color:#2F5DA8;margin-bottom:.3em}.bx.warn .lg{color:#B3322D}.bx.pattern .lg{color:${ACC}}.bx.more .lg{color:#5B6B86}.bx .lg small{display:inline;margin-left:.5em;font-weight:400;letter-spacing:0}
.lg svg{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;vertical-align:-.3em;margin-right:.3em}
.dop .rb svg,.dop .rb img,.dop .rb i,.dop .dbx,.dop .dt{display:none}.dop .rb b{font-size:.78em;letter-spacing:.2em;color:${ACC}}.dop{margin:1.2em 0 .4em}.dop .pl{color:#4a443d}
.cr dt{font-weight:700;margin-top:.5em;font-size:.9em}.cr dd{margin:0 0 .2em 1em}
.q .en{display:block;font-size:.85em;color:#6d655c}.bl{display:inline-block;min-width:3.2em;border-bottom:1px solid #1d1a17;margin:0 .2em}
.ak h4{margin:1.2em 0 .3em;font-size:1em}.ak h4 span{display:block;font-size:.72em;letter-spacing:.12em;color:${ACC}}.ak .set{margin:.35em 0}.ak .set b{display:block;font-size:.88em}.ak .k{color:#6d655c;margin:-.3em 0 .8em}
/* 부 표지 · 단원 머리: PDF 처럼 색 띠로 */
.pd{background:${ACC};color:#fff;padding:1.4em 1.2em;border-radius:6px;margin:0 0 1em}.pd .ptp,.pd .no,.pd .big,.pd .list,.pd h2,.pd h3{color:#fff}.pd .orn{background:#fff}.pd .ptp{opacity:.9}
.uh{background:${ACC};color:#fff;padding:.9em 1em;border-radius:6px;margin:0 0 .8em}.uh .un{color:#fff;opacity:.9;margin:0 0 .3em}.uh h2,.uh h3{color:#fff;margin:.15em 0}.uh h3{font-weight:500;font-size:1em}
.sec h3 em.lab{display:inline-block;border:1px solid ${ACC};background:#fff;padding:.05em .5em;border-radius:3px;margin-right:.5em}
table th{color:${ACC}}
h2{page-break-before:auto}
/* 더 깔끔하게(2026-10-25 샘플 검토): 표는 가로줄만, 상자는 옅은 색 + 왼쪽 띠, 한글 소제목은 연한 색 · 간격 통일 */
table{font-size:.92em;margin:.5em 0 .9em}th,td{border:0;border-bottom:1px solid #e4ddd0;padding:.45em .5em}th{background:transparent;border-bottom:2px solid ${ACC};font-weight:700}tr:last-child td{border-bottom:0}
.sec{margin:1.5em 0 .6em}.sec h3{border-bottom:1px solid #d8cfc0;font-size:1.08em}.sec h3 small{color:#8a8278;font-weight:400;font-size:.8em}
.note,.hint,.bx{border-radius:0 4px 4px 0;font-size:.95em}.bx .tt,.note{line-height:1.6}
ol.pr li{border-bottom:1px solid #ece6da}ol.pr.kdp li.kq{display:block}ol.pr.kdp .kans{display:block;margin:.1em 0 .1em 1.2em;color:${ACC};font-weight:700}small{color:#8a8278}
.flow .fs{display:block;margin:.4em 0}.flow .ar{display:none}
.sec h3 em.lab{display:inline;white-space:nowrap;padding:.05em .45em}.pd .ptp span{display:inline;margin-right:.7em}
.plg>div{margin:.3em 0 .5em}.plk b{font-size:.95em}.plk small{display:inline;margin-left:.4em}.pll{border-bottom:1px solid #cfc6b6;height:1.7em;margin:.1em 0 .5em}
.pldc{margin:.3em 0 .8em}.pldc i{display:inline-block;font-style:normal;text-align:center;border:1px solid #cfc6b6;border-radius:4px;padding:.15em .55em;margin:.15em .4em .15em 0}.pldc i b,.pldc i small{display:block;margin:0}
.bx,.note,.hint,.qrb,.flow .fs,table tr{page-break-inside:avoid;break-inside:avoid}.bx .lg,.sec h3,h2,h3{page-break-after:avoid;break-after:avoid}
.ak .ai{display:inline-block;margin:.12em 1em .12em 0}.ak .set b{margin-bottom:.15em}
td:first-child{font-weight:700}ol.nv li.np ol{font-weight:400}.uh,.pd,h2,h3{word-break:keep-all}
.pd .list{display:none}.pd{padding:1.1em 1.1em .9em;margin:.8em 0}.pd .big{font-size:3em}.pd h3{margin-bottom:.2em}
table.wk{table-layout:fixed;width:100%}table.wk td{text-align:center;border:1px solid #cfc6b6;padding:.35em 0;font-size:.9em;line-height:1.3}
.bx.more{border:1px dashed #9aa4b5;border-left:4px dashed #5B6B86}
.tlb{font-size:1.25em;line-height:1.2}.tld{color:#b5ab9b}
.tl{margin:.5em 0 1em;border-top:2px solid ${ACC}}.tlr{border-bottom:1px solid #e4ddd0;padding:.5em 0 .55em}.tl1{font-weight:700;margin-bottom:.1em}.tlc{margin:.05em 0 .05em .9em;font-size:.95em}.tlh{color:#8a8278;font-size:.78em;letter-spacing:.02em;margin-right:.2em}
img.hd{display:block;width:100%;height:auto;margin:.9em 0 .5em}
.vw{margin:.8em 0 1em;padding-bottom:.65em;border-bottom:1px solid #ece6da}.vn{font-size:.72em;color:#8a8278;margin-bottom:.1em}.vh{margin-bottom:.15em}.vh b{font-size:1.2em;margin-right:.5em}.vp{font-size:.78em;color:#6d655c;border:1px solid #d8cfc0;border-radius:3px;padding:0 .4em;margin-right:.55em}.vi{white-space:nowrap}
ol.nv,ol.nv ol{list-style:none;padding-left:0;margin:0}ol.nv ol{padding-left:1.1em}ol.nv li{margin:.35em 0}ol.nv a{text-decoration:none;color:#1d1a17}ol.nv li.np>a{font-weight:700;color:${ACC}}
body,p,td,li,div{text-align:left;letter-spacing:normal;word-spacing:normal}.d b,.gd .d b{display:block}.d{margin:.3em 0 1em}
/* 인라인 SVG 그림은 PDF 에서는 클래스 CSS 로 크기가 정해진다 — ePub 에서는 크기를 안 주면 화면 가득 커지므로 여기서 정한다 */
svg{width:1.2em;height:1.2em;max-width:100%}svg[height]{width:auto}svg.ic{width:1em;height:1em;vertical-align:-.12em}.lg svg{width:1.6em;height:1.6em}svg.lvl-ic{width:4em;height:4em}.qr svg,.qrb .qr svg{width:6em;height:6em}
`);
  /* 차례: 이름이 없는 앞머리 쪽에 영 · 한 이름을 붙이고, 부 아래에 단원을 들여 쓴다(전자책 기기의 「차례 보기」도 이걸 쓴다) */
  const NAV_NAME = { copyright: 'Copyright · 판권', preface: 'Preface · 머리말', note: "Author's note · 저자의 말", author: 'About the author · 저자 소개', how: 'How to use this book · 이 책 쓰는 법', guide: 'How this book is organized · 이 책의 구성', answers: 'Answer Key · 정답', bonus: 'Reader bonus · 구매자 혜택' };
  let navHtml = '', open = false;
  for (const c of chap) {
    const t = xesc(NAV_NAME[c.id] || c.title), a = `<a href="${c.file}" style="text-decoration:none;color:#1d1a17">${t}</a>`;
    if (/^part\d+$/.test(c.id)) { navHtml += `${open ? '</ol></li>' : ''}<li class="np" style="list-style:none;font-weight:700;margin-top:.6em">${a}<ol style="list-style:none;padding-left:1em;margin:0;font-weight:400">`; open = true; }
    else if (/^(answers|bonus)$/.test(c.id) && open) { navHtml += `</ol></li><li>${a}</li>`; open = false; }
    else navHtml += `<li style="list-style:none">${a}</li>`;
  }
  const nav = navHtml + (open ? '</ol></li>' : '');
  fs.writeFileSync(O('nav.xhtml'), `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><meta charset="utf-8"/><title>Contents</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body><nav epub:type="toc" id="toc"><h1>Contents · 목차</h1><ol class="nv" style="list-style:none;padding:0;margin:0">${nav}</ol></nav></body></html>`);
  /* Kindle 은 spine 에 든 차례(nav) 문서의 글꼴 · 링크 모양을 무시하고 파란 밑줄로 그린다 — 눈에 보이는 차례 쪽은 일반 쪽으로 따로 만들고, nav 는 기기의 「차례」 메뉴용으로만 둔다 */
  fs.writeFileSync(O('c_contents.xhtml'), `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><meta charset="utf-8"/><title>Contents</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body><div class="blk plain"><h2>Contents · 목차</h2><ol class="nv">${nav}</ol></div></body></html>`);
  chap.unshift({ id: 'contents', file: 'c_contents.xhtml', title: 'Contents · 목차', svg: false });
  const items = chap.map((c) => `<item id="${c.id}" href="${c.file}" media-type="application/xhtml+xml"${c.svg ? ' properties="svg"' : ''}/>`).join('') + [...imgFiles].map((f, n) => `<item id="img${n}" href="${f}" media-type="image/png"/>`).join('');
  const spine = chap.map((c) => `<itemref idref="${c.id}"/>`).join('');
  const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  fs.writeFileSync(O('content.opf'), `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bid" xml:lang="en"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="bid">urn:everykoreans:${xesc(B.id)}</dc:identifier><dc:title>${xesc(B.title.en)} · ${xesc(B.title.ko)}</dc:title><dc:language>en</dc:language><dc:language>ko</dc:language>
<dc:creator>${xesc(B.author.en)}</dc:creator><dc:publisher>${xesc(B.publisher.en)}</dc:publisher><meta property="dcterms:modified">${modified}</meta><meta name="cover" content="cover-img"/></metadata>
<manifest><item id="cover-img" href="cover.png" media-type="image/png" properties="cover-image"/><item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="style.css" media-type="text/css"/>${items}</manifest>
<spine><itemref idref="cover"/>${spine}</spine></package>`);
  fs.writeFileSync(path.join(ex, 'META-INF', 'container.xml'), `<?xml version="1.0"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  fs.writeFileSync(path.join(ex, 'mimetype'), 'application/epub+zip');
  const out = path.join(dir, `${bookId}.epub`); fs.rmSync(out, { force: true });
  const { execFileSync } = await import('node:child_process');
  execFileSync('zip', ['-X0', out, 'mimetype'], { cwd: ex }); execFileSync('zip', ['-Xr9D', out, 'META-INF', 'OEBPS'], { cwd: ex });
  console.log(`ePub ${bookId}: ${chap.length}개 장 → ${path.relative(ROOT, out)}`);
}
/* ── 고정형 ePub(쪽 그림) ── */
if (FXL) {
  const { execFileSync } = await import('node:child_process');
  const W = 900, H = Math.round(W * 257 / 182);
  const fx = path.join(dir, 'fxl-src'); fs.rmSync(fx, { recursive: true, force: true });
  fs.mkdirSync(path.join(fx, 'META-INF'), { recursive: true }); fs.mkdirSync(path.join(fx, 'OEBPS', 'img'), { recursive: true });
  const FO = (f) => path.join(fx, 'OEBPS', f);
  const tmp = path.join(dir, 'fxl-tmp'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
  execFileSync('pdftoppm', ['-jpeg', '-jpegopt', 'quality=72', '-scale-to-x', String(W), '-scale-to-y', '-1', path.join(dir, 'interior.pdf'), path.join(tmp, 'p')]);
  const shots = fs.readdirSync(tmp).filter((f) => f.endsWith('.jpg')).sort();
  execFileSync('convert', [path.join(dir, 'front-cover-hires.jpg'), '-resize', `${W}x${H}!`, '-quality', '80', FO('img/p0001.jpg')]);
  shots.forEach((f, i) => fs.copyFileSync(path.join(tmp, f), FO(`img/p${String(i + 2).padStart(4, '0')}.jpg`)));
  const nPages = shots.length + 1;
  const xe = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const pid = (n) => `p${String(n).padStart(4, '0')}`;
  for (let n = 1; n <= nPages; n++) {
    fs.writeFileSync(FO(`${pid(n)}.xhtml`), `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><meta charset="utf-8"/><title>Page ${n}</title><meta name="viewport" content="width=${W}, height=${H}"/><style>html,body{margin:0;padding:0;width:${W}px;height:${H}px;background:#fff}img{display:block;width:${W}px;height:${H}px}</style></head><body><img src="img/${pid(n)}.jpg" width="${W}" height="${H}" alt="${n === 1 ? xe(B.title.en) + ' cover' : 'Page ' + (n - 1)}"/></body></html>`);
  }
  /* 차례: 블록 시작 쪽(표지가 1쪽이라 +1) */
  const NAME = { copyright: 'Copyright · 판권', preface: 'Preface · 머리말', note: "Author's note · 저자의 말", author: 'About the author · 저자 소개', how: 'How to use this book · 이 책 쓰는 법', guide: 'How this book is organized · 이 책의 구성', toc: 'Contents · 목차', answers: 'Answer Key · 정답', index: 'Index · 찾아보기', memo: 'Notes · 메모', studymap: 'Study map · 공부 지도' };
  const toc = [{ t: `${B.title.en} · cover`, n: 1, lvl: 0 }];
  for (const [k] of blocks) {
    const n = start[k] + 1; let m;
    if ((m = /^part(\d+)$/.exec(k))) { const pt = parts[+m[1] - 1]; toc.push({ t: `${pt.title.ko} · ${pt.title.en}`, n, lvl: 0 }); }
    else if ((m = /^unit(\d+)$/.exec(k))) { const u = units.find((x) => x.no === +m[1]); toc.push({ t: `${String(u.no).padStart(2, '0')} ${u.title.ko} · ${u.title.en}`, n, lvl: 1 }); }
    else if (NAME[k]) toc.push({ t: NAME[k], n, lvl: 0 });
  }
  let nv = '', depth = 0;
  for (const e of toc) {
    if (e.lvl > depth) { nv += '<ol>'; depth = 1; } else if (e.lvl < depth) { nv += '</li></ol></li>'; depth = 0; } else if (nv) nv += '</li>';
    nv += `<li><a href="${pid(e.n)}.xhtml">${xe(e.t)}</a>`;
  }
  nv += depth ? '</li></ol></li>' : '</li>';
  fs.writeFileSync(FO('nav.xhtml'), `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><meta charset="utf-8"/><title>Contents</title><meta name="viewport" content="width=${W}, height=${H}"/></head><body><nav epub:type="toc" id="toc"><h1>Contents · 목차</h1><ol>${nv}</ol></nav></body></html>`);
  const mani = Array.from({ length: nPages }, (_, i) => i + 1).map((n) => `<item id="${pid(n)}" href="${pid(n)}.xhtml" media-type="application/xhtml+xml"/><item id="i${pid(n)}" href="img/${pid(n)}.jpg" media-type="image/jpeg"${n === 1 ? ' properties="cover-image"' : ''}/>`).join('');
  const spineX = Array.from({ length: nPages }, (_, i) => `<itemref idref="${pid(i + 1)}"/>`).join('');
  fs.writeFileSync(FO('content.opf'), `<?xml version="1.0" encoding="utf-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bid" xml:lang="en"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n<dc:identifier id="bid">urn:everykoreans:${bookId}:fxl</dc:identifier><dc:title>${xe(B.title.en)} · ${xe(B.title.ko)}</dc:title><dc:language>en</dc:language><dc:creator>${xe(B.author.en)}</dc:creator><dc:publisher>${xe(B.publisher.en)}</dc:publisher><meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>\n<meta property="rendition:layout">pre-paginated</meta><meta property="rendition:orientation">portrait</meta><meta property="rendition:spread">none</meta><meta name="fixed-layout" content="true"/><meta name="original-resolution" content="${W}x${H}"/><meta name="orientation-lock" content="portrait"/><meta name="cover" content="i${pid(1)}"/></metadata>\n<manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${mani}</manifest>\n<spine>${spineX}</spine></package>`);
  fs.writeFileSync(path.join(fx, 'META-INF', 'container.xml'), `<?xml version="1.0"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  fs.writeFileSync(path.join(fx, 'mimetype'), 'application/epub+zip');
  const fout = path.join(dir, `${bookId}-fxl.epub`); fs.rmSync(fout, { force: true });
  execFileSync('zip', ['-X0', fout, 'mimetype'], { cwd: fx }); execFileSync('zip', ['-Xr9D', fout, 'META-INF', 'OEBPS'], { cwd: fx });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`고정형 ePub ${bookId}: ${nPages}쪽 ${(fs.statSync(fout).size / 1048576).toFixed(1)}MB → ${path.relative(ROOT, fout)}`);
}
await browser.close(); server.close();

console.log(`책 ${bookId}: 속지 ${realTotal}쪽(계산 ${total}쪽) · 단원 ${units.length} · 찾아보기 ${entries.length}개 · 책등 ${spine}mm(종이 ${T.paperMm}mm/장 가정) → ${path.relative(ROOT, dir)}/`);
if (REVIEW) console.log('검수본: interior-review.pdf(맨 끝에 검수 체크표)');
if (realTotal !== total) console.warn(`⚠ 블록별 쪽수 합(${total})과 한 번에 찍은 쪽수(${realTotal})가 다르다 — 목차 쪽 번호를 확인할 것`);
