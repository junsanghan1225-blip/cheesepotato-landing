/* 문법 학습지(운영자 2026-10-12 「학습지 대량으로 — 우리 자료로 문법을 깊이 공부하게」 · 「초급 약 100개」).
   초급 문법 표현 한 개마다 인쇄용 학습지 한 벌(A4 3쪽: 설명 · 연습 · 정답) → worksheet/<문법 id>.html + 목록 worksheet/index.html.
   자료는 전부 우리 것: sentences.js(이름 · 뜻 · 예문 · 대화 · more) · grammar-en.js · grammar-usage.js(연습 문장 GRAMMAR_PRACTICE) ·
   grammar-drill.js(바꾸기 표) · grammar-pairs.js(비교) · grammar-mark.js(문장 속 그 문법 자리 찾기 — 빈칸을 만든다).
   모든 문제는 창작 자료로 만든 것 — 기출 아님. build-pages.mjs 가 끝에 부른다. 생성물은 손으로 고치지 않는다. */
import { siteHeaderBlock, activeOf } from './lib/site-header.mjs';   // 공통 메뉴줄(docs/plans/web-frame.md)
import { siteFooterBlock } from './lib/site-footer.mjs';   // 공통 꼬리말(기본 틀 6번)
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SB_CATS } from '../sentences.js';
import { GRAMMAR_EN } from '../grammar-en.js';
import { GRAMMAR_PRACTICE } from '../grammar-usage.js';
import { GRAMMAR_DRILL } from '../grammar-drill.js';
import { GRAMMAR_PAIRS } from '../grammar-pairs.js';
import { grammarMarkRe } from '../grammar-mark.js';
import { GRAMMAR_WORDS } from '../grammar-words.js';   // 같이 알면 좋은 단어(낱말 · 예문 · 뜻)
import { GRAMMAR_TOPIK } from '../grammar-topik.js';   // TOPIK 에서는 이렇게(TOPIK 스타일 예문 — 문제 아님, 기출 아님)
import { hubBooks, HUB_BOOKS_CSS } from './lib/hub-books.mjs';   // 목록 쪽 → 책 한 줄(문법과 가까운 판매 중 책: 조사 · 첫걸음)

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'worksheet');
mkdirSync(OUT, { recursive: true });
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LV = { beginner: ['초급', 'Beginner'], intermediate: ['중급', 'Intermediate'], advanced: ['고급', 'Advanced'] };
export const WS_LEVELS = ['beginner', 'intermediate', 'advanced'];   // 초급 112 · 중급 93 · 고급 85(운영자 2026-10-29 「grammar 학습지 초급 중급 고급으로 나눠서」). 묶음 PDF 는 tools/build-ws-bundle.mjs

const POINTS = SB_CATS.flatMap((c) => c.points.map((p) => ({ ...p, cat: c }))).filter((p) => WS_LEVELS.includes(p.lv));
export const WS_IDS = POINTS.map((p) => p.id);
/* 공개(무료) 표본 5개. 나머지는 Pro(연습 · 정답) — 운영자 2026-10-12 「일부만 공개하고 무료로, 나머지는 Pro」 */
const FREE = new Set(['26-1', '28-1', '30-1', '35-1', '38-1', '48-1', '49-3', '1-1', '4-5']);   // 뒤 넷은 중급(-아/어 보이다 · -(으)ㄴ/는데도) · 고급(-느니 · -는 이상) 표본(2026-10-29) —   // 운영자 2026-10-12 「일단 5개 정도만 공개」 — 빈칸 연습이 있는 대표 초급 5개(N이/가 · 전에 · -(으)세요 · -(으)ㄹ까요? · -(으)러 가다)
export const WS_FREE = [...FREE];

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
  /* 순서대로 써요(2026-11-24 운영자 「학습에 도움되는 요소들 넣고 채워서」) — 아직 안 쓴 연습 문장 둘을 띄어쓰기 덩어리로 섞는다.
     섞는 차례는 고정(빌드마다 같다) — 뒤집고 한 칸 돌려서, 원래 차례와 같아지면 뺀다. 3~7 덩어리인 문장만 */
  const used = new Set([...blanks.map((b) => b.sp.join('')), ...writes.map((w) => w.ko), ...copyList.map((c) => c.ko)]);
  const scr = pr.map(([ko, enS]) => ({ ko, en: enS, t: ko.replace(/[.?!]$/, '').split(/\s+/) })).filter((x) => !used.has(x.ko) && x.t.length >= 3 && x.t.length <= 7)
    .map((x) => { const r = [...x.t].reverse(); const m = [...r.slice(1), r[0]]; return { ...x, mix: m, end: (x.ko.match(/[.?!]$/) || ['.'])[0] }; })
    .filter((x) => x.mix.join(' ') !== x.t.join(' ')).slice(0, Math.max(0, Math.min(2, 6 - blanks.length - copyList.length - writes.length)));   // 2쪽이 한 장을 넘지 않게 — 연습 문항 합 6개까지
  const words = (GRAMMAR_WORDS[p.id] || []).slice(0, 4);
  const tpk = (GRAMMAR_TOPIK[p.id] || [])[0];
  const rows = (dr?.x || []).slice(0, 4);
  const pair = GRAMMAR_PAIRS.find((x) => x.a === p.id || x.b === p.id);
  const collo = more[1] && !/^\s*$/.test(more[1]) ? more[1] : '';
  const CIRC = ['①', '②', '③', '④', '⑤', '⑥'];
  const secs = [rows.length && 'drill', blanks.length && 'blank', copyList.length && 'copy', scr.length && 'order', writes.length && 'write', 'own'].filter(Boolean);
  const SN = { drill: '바꿔 써요 · Change the word', blank: '빈칸 · Fill in the blank', copy: '따라 쓰기 · Copy', write: '한국어로 써요 · Write it in Korean', order: '순서대로 써요 · Put in order', own: '내 문장 · My own sentences' };   // 정답지 소제목(2026-11-24 — 전에는 번호만 있었다)
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
  ${tpk ? `<h2>TOPIK 에서는 · In TOPIK-style sentences</h2><p class="ws-tpk">${hi(p, tpk[0])}</p>${tpk[1] ? `<p class="ws-en" lang="en">${esc(tpk[1])}</p>` : ''}` : ''}
  ${pair ? `<h2>헷갈리는 문법 · Often confused</h2><p><b>${esc(pair.title.ko)}</b> — ${esc(pair.gist.ko)}</p><p class="ws-en" lang="en">${esc(pair.gist.en)}</p>` : ''}
</section>`;
  const sheet2 = `<section class="ws-p">
  <div class="ws-top"><span>${esc(p.name)} — 연습 Practice</span><span>이름 Name: ____________</span></div>
  ${rows.length ? `<h2>${N('drill')} 바꿔 써요 · Change the word — <b>${esc(dr.t)}</b></h2>
  <table class="ws-t"><tbody>${rows.map(([b]) => `<tr><td>${esc(b)}</td><td>→</td><td class="ws-line"></td></tr>`).join('')}</tbody></table>` : ''}
  ${blanks.length ? `<h2>${N('blank')} 빈칸에 알맞은 말을 써요 · Fill in the blank (${esc(p.name)})</h2>
  <ol class="ws-q">${blanks.map((b) => `<li>${esc(b.sp[0])}<span class="ws-blank"></span>${esc(b.sp[2])}<small lang="en">${esc(b.en)}</small></li>`).join('')}</ol>` : ''}
  ${copyList.length ? `<h2>${N('copy')} 소리 내어 읽고 따라 써요 · Read aloud, then copy</h2>
  <ol class="ws-q">${copyList.map((c) => `<li>${hi(p, c.ko)}<small lang="en">${esc(c.en)}</small><div class="ws-wl"></div></li>`).join('')}</ol>` : ''}
  ${scr.length ? `<h2>${N('order')} 순서대로 써요 · Put the words in order</h2>
  <ol class="ws-q">${scr.map((x) => `<li><span class="ws-chips">${x.mix.map((c) => `<span>${esc(c)}</span>`).join(' / ')}</span><small lang="en">${esc(x.en)}</small><div class="ws-wl"></div></li>`).join('')}</ol>` : ''}
  ${writes.length ? `<h2>${N('write')} 한국어로 써요 · Write it in Korean (use ${esc(p.name)})</h2>
  <ol class="ws-q">${writes.map((w) => `<li lang="en">${esc(w.en)}<div class="ws-wl"></div></li>`).join('')}</ol>` : ''}
  <h2>${N('own')} 내 문장 · My own sentences</h2>
  <div class="ws-wl"></div><div class="ws-wl"></div>
</section>`;
  const sheet3 = `<section class="ws-p ws-key">
  <div class="ws-top"><span>${esc(p.name)} — 정답 Answer key</span><span>선생님 · 스스로 확인 Check yourself</span></div>
  ${rows.length ? `<h2>${N('drill')} ${SN.drill}</h2><p>${rows.map(([b, a]) => `${esc(b)} → <b>${esc(a)}</b>`).join(' · ')}</p>` : ''}
  ${blanks.length ? `<h2>${N('blank')} ${SN.blank}</h2><ol class="ws-q">${blanks.map((b) => `<li>${esc(b.sp[0])}<mark>${esc(b.sp[1])}</mark>${esc(b.sp[2])}</li>`).join('')}</ol>` : ''}
  ${copyList.length ? `<h2>${N('copy')} ${SN.copy}</h2><p>읽은 문장 그대로 · Exactly as printed.</p>` : ''}
  ${scr.length ? `<h2>${N('order')} ${SN.order}</h2><ol class="ws-q">${scr.map((x) => `<li>${hi(p, x.ko)}</li>`).join('')}</ol>` : ''}
  ${writes.length ? `<h2>${N('write')} 예시 답 · Model answers</h2><ol class="ws-q">${writes.map((w) => `<li>${hi(p, w.ko)}</li>`).join('')}</ol>` : ''}
  <h2>${N('own')} ${SN.own}</h2><p>자유 답이에요. 문법 모양과 뜻이 맞으면 좋아요. · Free answers — check the form and the meaning.</p>
  ${words.length ? `<h2>같이 알면 좋은 단어 · Useful words</h2><table class="ws-w"><tbody>${words.map(([w, ex, we]) => `<tr><td><b>${esc(w)}</b></td><td lang="en">${esc(we)}</td><td>${hi(p, ex)}</td></tr>`).join('')}</tbody></table>` : ''}
  <h2>스스로 점검 · Can I do it?</h2><ul class="ws-can"><li>□ ${esc(p.name)} 의 뜻을 내 말로 설명할 수 있어요 · I can explain what it means</li><li>□ 낱말에 바르게 붙여 쓸 수 있어요 · I can attach it to words correctly</li><li>□ 이 문법으로 내 이야기를 두 문장 말할 수 있어요 · I can say two sentences about myself with it</li></ul>
  <p class="ws-foot">모든 문제는 치즈감자가 만든 창작 문항이에요(기출 아님). Original practice written for CheesePotato — not past exam questions.</p>
</section>`;
  return { sheet1, sheet2, sheet3, has: { order: scr.length, rows: rows.length, blanks: blanks.length, writes: writes.length, copies: copyList.length } };
}

const CSS = `.ws-doc{max-width:820px;margin:0 auto}.ws-p{background:#fff;border:1px solid var(--line);border-radius:8px;padding:24px;margin:18px 0}
.ws-top{display:flex;justify-content:space-between;gap:12px;font-size:12.5px;color:var(--ink-3);border-bottom:1px solid var(--line);padding-bottom:8px}
.ws-kicker{margin:14px 0 0;font-size:12.5px;font-weight:700;color:var(--ink-3);letter-spacing:.02em}
.ws-p h1{font-size:30px;line-height:1.25;margin:4px 0 6px}.ws-p h2{font-size:15px;margin:22px 0 8px;padding-top:12px;border-top:1px solid var(--line);color:var(--ink)}.ws-p p{margin:0 0 6px;font-size:15px}
.ws-en{color:var(--ink-3);font-size:13.5px!important}.ws-form{font-weight:700;color:var(--ink)}.ws-ko{font-weight:500;color:var(--ink-3)}
.ws-ex{margin:0;padding-left:20px}.ws-ex li{margin:2px 0}mark{background:none;color:inherit;font-weight:800;box-shadow:inset 0 -.45em 0 #FFE08A;padding:0 1px}
.ws-dlg{margin-top:8px;padding:10px 12px;background:#FBF6EC;border-radius:10px}.ws-dlg p{margin:2px 0!important}
.ws-t{border-collapse:collapse}.ws-t td{padding:6px 8px;font-size:16px}.ws-line{min-width:180px;border-bottom:1.5px solid #999}
.ws-q{margin:0;padding-left:22px}.ws-q li{margin:0 0 12px;font-size:16px}.ws-q small{display:block;color:var(--ink-3);font-size:12.5px}
.ws-blank{display:inline-block;min-width:90px;border-bottom:1.5px solid #666;margin:0 4px}.ws-wl{height:30px;border-bottom:1.5px solid #bbb;margin-top:6px}
.ws-pair{margin-top:14px!important;padding:8px 12px;background:#FBF6EC;border-radius:7px;font-size:13px!important}.ws-foot{margin-top:16px!important;font-size:12px!important;color:var(--ink-3)}
.ws-acts{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}
.ws-top+h2{border-top:0!important;padding-top:0!important}.ws-t td{border:0!important;vertical-align:bottom}.ws-t td.ws-line{border-bottom:1.5px solid #999!important;width:60%}.ws-tpk{font-size:15.5px!important}.ws-w{width:100%;border-collapse:collapse;font-size:14px}.ws-w td{padding:5px 8px 5px 0;border-bottom:1px solid var(--line);vertical-align:top}.ws-w td:first-child{width:18%}.ws-w td:nth-child(2){width:22%;color:var(--ink-3)}
.ws-chips span{display:inline-block;padding:1px 8px;border:1px solid #999;border-radius:5px;margin:2px 0}.ws-can{list-style:none;padding:0;margin:0}.ws-can li{margin:4px 0;font-size:14px}
/* 화면 틀(운영자 2026-11-24 「문법 학습지 포맷 · 디자인」): 학습지 종이는 가운데 그대로, PC 는 오른쪽 곁칸(받기 · 같은 갈래 · 연습), 주황은 뺀다 */
.ws-lay{display:grid;grid-template-columns:minmax(0,820px) 280px;gap:40px;justify-content:center;align-items:start}
.ws-side{position:sticky;top:84px}.ws-box{margin:0 0 14px;border:1px solid var(--line);border-radius:10px;background:var(--surface);overflow:hidden;font-size:14.5px}
.ws-box h3{margin:0;padding:11px 16px;font-size:13.5px;font-weight:800;border-bottom:1px solid var(--line)}.ws-box h3 small{display:block;font-weight:500;color:var(--ink-3);font-size:12.5px}
.ws-box .ws-bt{display:grid;gap:8px;padding:14px 16px}.ws-box .ws-bt button,.ws-box .ws-bt a{display:flex;justify-content:center;align-items:center;min-height:40px;border-radius:8px;font:inherit;font-size:14.5px;font-weight:600;cursor:pointer;text-decoration:none;border:1px solid rgba(27,21,18,.14);background:rgba(27,21,18,.06);color:var(--ink)}
.ws-box .ws-bt .ws-pri{background:var(--ink);color:var(--bg,#F2EEE4);border-color:var(--ink);font-weight:700}
.ws-box .ws-note{margin:0;padding:0 16px 12px;font-size:12.5px;color:var(--ink-3)}
.ws-go{list-style:none;margin:0;padding:0}.ws-go li+li{border-top:1px solid var(--line)}.ws-go a{display:flex;justify-content:space-between;gap:8px;padding:8px 16px;color:var(--ink);text-decoration:none;font-size:14px}.ws-go a:hover{background:var(--bg)}.ws-go li.on a{font-weight:800;box-shadow:inset 3px 0 0 var(--ink)}.ws-go small{color:var(--ink-3)}
.ws-nav{font-size:13.5px;color:var(--ink-3)}.ws-nav a{color:var(--ink);text-decoration:none;font-weight:600}.ws-nav a:hover{text-decoration:underline}
.ws-ex li::marker,.ws-q li::marker{color:var(--ink-3)}
.ws-hub-nav{display:flex;gap:24px;border-bottom:1px solid var(--line);margin:22px 0 6px;position:sticky;top:64px;background:var(--bg);z-index:2}.ws-hub-nav a{padding:10px 0;color:var(--ink-3);font-weight:700;text-decoration:none}.ws-hub-nav a:hover{color:var(--ink);box-shadow:inset 0 -2px 0 var(--ink)}
.ws-lv{border:0!important;padding-top:0!important;margin:34px 0 4px;font-size:24px;scroll-margin-top:120px}.ws-lv small{font-size:15px;color:var(--ink-3);font-weight:500}
.ws-cat{margin:22px 0 0;font-size:15px}.ws-cat small{color:var(--ink-3);font-weight:500}
.ws-tb{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:32px;margin:8px 0 0;padding:0;list-style:none;border-top:1px solid var(--ink)}
.ws-tb li{margin:0!important;padding:0!important;border-bottom:1px solid var(--line);line-height:1.35}.ws-tb li::before{display:none!important}.ws-tb a{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1px 12px;padding:8px 0;color:var(--ink);text-decoration:none}.ws-tb a:hover{background:var(--surface)}
.ws-tb b{font-size:15.5px}.ws-tb span{grid-column:1;font-size:13px;color:var(--ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ws-tb em{grid-column:2;grid-row:1 / span 2;align-self:center;font-style:normal;font-size:12px;font-weight:700;color:var(--ink-3);padding:1px 6px;border:1px solid var(--line);border-radius:5px}.ws-tb em.f{color:var(--ink);border-color:var(--ink)}
@media(max-width:900px){.ws-lay{display:block}.ws-side{position:static;margin-top:24px}.ws-tb{grid-template-columns:1fr}}
@media(max-width:600px){.ws-p{padding:16px}.ws-t{table-layout:fixed;width:100%;min-width:0}.ws-t td:first-child{width:36%;overflow-wrap:anywhere}.ws-t td:nth-child(2){width:9%}.ws-line{min-width:0}.ws-top{flex-direction:column;gap:4px}.ws-p h1{font-size:24px;overflow-wrap:anywhere}}
@media print{@page{margin:12mm}.ws-p h2{font-size:13.5px;margin:9px 0 4px;padding-top:6px;break-after:avoid}.ws-q small{font-size:11px}.ws-t td{padding:3px 8px;font-size:14px}.ws-top{padding-bottom:5px}.ws-kicker{margin-top:8px}.ws-dlg{padding:6px 10px}.ws-w td{padding:3px 8px 3px 0}.ws-q li,.ws-t tr,.ws-dlg,.ws-ex li,.ws-w tr{break-inside:avoid}.ws-w{font-size:12.5px}.ws-q li{margin:0 0 6px}body{background:#fff}.hd,.ws-acts,.ws-nav,.ft,.ws-intro,.ws-side{display:none!important}.ws-lay{display:block}main{padding:0!important;max-width:none}.ws-p{border:0;border-radius:0;padding:0;margin:0;break-after:page}.ws-p:last-child{break-after:auto}.ws-p h1{font-size:26px}.ws-p p,.ws-q li{font-size:13.5px}.ws-wl{height:22px}mark{-webkit-print-color-adjust:exact;print-color-adjust:exact}}`;

/* 받을 때 파일 이름(.docx · PDF 저장)의 앞부분 — Cheesepotato_Grammar_<번호(두 자리)>_<이름>. numbers-worksheet.js 가 읽는다 */
const wsFile = (p) => `<meta name="ws-file" content="${esc('Cheesepotato_Grammar_' + p.id.split('-').map((x) => x.padStart(2, '0')).join('-') + '_' + String(p.name).replace(/[^0-9A-Za-z가-힣]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 36))}">\n`;
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
<meta property="og:image" content="https://everykoreans.com/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
${jsonld}<link rel="stylesheet" href="/vendor/pretendard.css">
<link rel="stylesheet" href="/page.css">
<script src="/numbers-worksheet.js" defer></script>
<style>${CSS}</style>
</head>
<body>
${siteHeaderBlock({ lang: 'en', active: activeOf(url) })}
<main class="wide">`;
const foot = `</main>
${siteFooterBlock({ mode: 'en' })}
</body></html>\n`;

const MADE = POINTS.filter((p) => { const h = sheet(p).has; return h.blanks || h.rows; });
let n = 0, nFree = 0;
mkdirSync(join(OUT, 'pro'), { recursive: true });
const byCat = new Map();   // 키: 단계:갈래 id — 단계마다 갈래 목록을 따로 낸다
const nByLv = {};
const LOCK = (p) => `<section class="ws-p ws-lock"><h2>연습 · 정답은 Pro · Practice and answer key are Pro</h2>
<p>이 문법 학습지의 <b>연습(바꿔 쓰기 · 빈칸 · 따라 쓰기 · 한국어로 쓰기)과 정답</b>은 치즈감자 Pro(반 학생은 무료)에서 열려요. 7일 무료 체험으로 먼저 써 볼 수 있어요.</p>
<p lang="en">The practice pages and answer key for <b>${esc(p.name)}</b> are part of CheesePotato Pro (free for class students). Try Pro free for 7 days.</p>
<div class="ws-acts"><a class="btn main" href="/?utm_source=worksheet&amp;utm_medium=pro_lock#pro">Pro 7일 무료로 시작 · Try Pro free</a><a class="btn sub" href="/worksheet/">무료 학습지 보기 · Free worksheets</a></div></section>`;
const NAV = (p, pro) => `<nav class="ws-nav"><a href="/worksheet/${pro ? 'pro/' : ''}">← 문법 학습지 목록 · All worksheets</a> · <a href="/sentence/${p.id}.html">이 문법 자세히 · Grammar page</a></nav>`;
const SIB = (p, pro) => { const g = MADE.filter((x) => x.lv === p.lv && x.cat.id === p.cat.id); return g.length > 1 ? `<section class="ws-box"><h3>같은 갈래 학습지<small>${esc(p.cat.ko)} · ${LV[p.lv][0]} ${g.length}개</small></h3><ul class="ws-go">${g.slice(0, 14).map((x) => `<li${x.id === p.id ? ' class="on" aria-current="page"' : ''}><a href="/worksheet/${pro && !FREE.has(x.id) ? 'pro/' : ''}${x.id}.html">${esc(x.name)}<small>${FREE.has(x.id) ? '무료' : 'Pro'}</small></a></li>`).join('')}</ul></section>` : ''; };
const wrap = (p, body, pro) => `<div class="ws-lay"><div class="ws-doc">${NAV(p, pro)}
${body}
</div>
<aside class="ws-side"><section class="ws-box"><h3>이 학습지 받기<small>Print · PDF · Word</small></h3><div class="ws-bt"><button type="button" class="ws-pri" id="wsPrint">인쇄 · PDF 로 저장</button><button type="button" id="wsDocx">Word (.docx)</button>${pro ? '<button type="button" id="wsAnsDocx">정답지 Word (.docx)</button>' : ''}</div><p class="ws-note">브라우저의 인쇄 → PDF 로 저장 · A4 3쪽(설명 · 연습 · 정답)</p></section>
<section class="ws-box"><h3>화면에서 연습</h3><ul class="ws-go"><li><a href="/?utm_source=worksheet&amp;utm_medium=${p.id}#learn/sentence/${p.id}">이 문법 무료로 연습<small>→</small></a></li><li><a href="/sentence/${p.id}.html">이 문법 설명 쪽<small>→</small></a></li><li><a href="/worksheet/">문법 학습지 전체 ${MADE.length}개<small>→</small></a></li></ul></section>
${SIB(p, pro)}</aside></div>
<p class="ft">Made by a Korean teacher · <a href="/about.html">About</a> · <a href="/worksheet/">All grammar worksheets</a> · <a href="/privacy.html">Privacy</a></p>`;
for (const p of POINTS) {
  const s = sheet(p);
  if (!s.has.blanks && !s.has.rows) continue;   // 연습 재료가 하나도 없으면 학습지를 내지 않는다(빈 연습을 내보내지 않는다)
  const free = FREE.has(p.id);
  const title = `Korean Grammar Worksheet: ${p.name} — ${free ? 'Free Printable (PDF)' : 'Printable'} | CheesePotato`;
  const desc = `Printable worksheet for the Korean grammar point ${p.name}: meaning, form and examples${free ? ', plus practice and an answer key — free' : '; practice and answer key with Pro'}. For learners and teachers.`;
  const url = `/worksheet/${p.id}.html`;
  // 공개 쪽: 무료는 3쪽 전부, Pro 는 설명 1쪽 + 잠금 안내(연습 · 정답은 이 쪽에 들어 있지 않다)
  writeFileSync(join(OUT, `${p.id}.html`), head(title, desc, url, wsFile(p)) + wrap(p, free ? `${s.sheet1}\n${s.sheet2}\n${s.sheet3}` : `${s.sheet1}\n${LOCK(p)}`, false) + foot);
  if (!free) {
    // 전체 쪽은 Pro 가 앱(자료실)에서 들어오는 길 — 검색에 안 잡히게 noindex + robots 에서 막는다. 쪽 주소를 아는 사람은 열 수 있다(앱의 Pro 확인과 같은 수준의 안내)
    const full = head(`${p.name} — worksheet (Pro) | CheesePotato`, desc, `/worksheet/pro/${p.id}.html`, wsFile(p)).replace('<meta name="referrer"', '<meta name="robots" content="noindex,nofollow">\n<meta name="referrer"')
      + wrap(p, `${s.sheet1}\n${s.sheet2}\n${s.sheet3}`, true) + foot;
    writeFileSync(join(OUT, 'pro', `${p.id}.html`), full);
  } else nFree++;
  n++;
  const key = `${p.lv}:${p.cat.id}`;
  if (!byCat.has(key)) byCat.set(key, { cat: p.cat, lv: p.lv, items: [] });
  byCat.get(key).items.push({ p, free });
  nByLv[p.lv] = (nByLv[p.lv] || 0) + 1;
}
export const WS_MADE = n;
const LV_ORDER = ['beginner', 'intermediate', 'advanced'];
const list = (pro) => LV_ORDER.map((lv) => {
  const groups = [...byCat.values()].filter((g) => g.lv === lv);
  if (!groups.length) return '';
  return `<h2 class="ws-lv" id="${lv}">${LV[lv][0]} · ${LV[lv][1]} <small>${nByLv[lv]}개</small></h2>` + groups.map(({ cat, items }) => `<h3 class="ws-cat">${esc(cat.ko)} <small>${esc(cat.en || '')} · ${items.length}</small></h3><ul class="ws-tb">${items.map(({ p, free }) => `<li><a href="/worksheet/${pro && !free ? 'pro/' : ''}${p.id}.html"><b>${esc(p.name)}</b><span>${esc(String(p.desc || '').split(/[.。]/)[0])}</span>${pro ? '' : free ? '<em class="f">무료</em>' : '<em>Pro</em>'}</a></li>`).join('')}</ul>`).join('\n');
}).join('\n');
writeFileSync(join(OUT, 'index.html'), head(`Free Korean Grammar Worksheets (Printable PDF) — Beginner to Advanced | CheesePotato`,
  `${nFree} free printable Korean grammar worksheets, plus ${n - nFree} more with Pro, from beginner to advanced: explanation, examples, fill-in-the-blank, writing practice and an answer key.`, '/worksheet/') + `
<h1>문법 학습지 · Grammar worksheets</h1>
<p>Korean grammar from beginner to advanced, one printable worksheet each: explanation, examples, practice and an answer key. <b>${nFree} are completely free</b>; the other ${n - nFree} show the explanation for free, and the practice and answer key come with <a href="/?utm_source=worksheet&amp;utm_medium=index#pro">Pro</a> (free for class students). All practice is original — not from past exams. 초급 문법 학습지예요. ${nFree}개는 모두 무료, 나머지 ${n - nFree}개는 설명만 무료이고 연습 · 정답은 Pro 에서 열려요.</p>
<style>${HUB_BOOKS_CSS}</style>${hubBooks(['particles-workbook', 'first-steps-workbook'], 'grammar-worksheets-hub', '초급 문법을 책 한 권으로 차례대로 익히고 싶다면: 조사 · 첫걸음 워크북(PDF, 정답 포함). <small>Prefer one book in order? Two beginner workbooks with answer keys.</small>')}
<nav class="ws-hub-nav" aria-label="단계">${LV_ORDER.filter((lv) => nByLv[lv]).map((lv) => `<a href="#${lv}">${LV[lv][0]} ${nByLv[lv]}</a>`).join('')}</nav>
${list(false)}
` + foot);
writeFileSync(join(OUT, 'pro', 'index.html'), head('Grammar worksheets (Pro) | CheesePotato', 'Pro grammar worksheets.', '/worksheet/pro/').replace('<meta name="referrer"', '<meta name="robots" content="noindex,nofollow">\n<meta name="referrer"') + `
<h1>문법 학습지 — Pro 전체 · All worksheets (Pro)</h1>
<p>치즈감자 Pro · 반 학생용 전체 학습지(설명 + 연습 + 정답)예요. <a href="/worksheet/">무료 목록으로</a></p>
${list(true)}
` + foot);
/* 자료실(#library)이 한 번에 펼쳐 보는 목록 — 문법 학습지 전부(분류 · 무료 여부) */
writeFileSync(join(OUT, 'list.json'), JSON.stringify([...byCat.values()].flatMap(({ cat, items }) => items.map(({ p, free }) => ({ id: p.id, n: p.name, c: cat.ko, ce: cat.en || '', f: free ? 1 : 0, l: p.lv })))) + '\n');
console.log(`문법 학습지 — 초급 ${nByLv.beginner || 0} · 중급 ${nByLv.intermediate || 0} · 고급 ${nByLv.advanced || 0} = ${n}개(무료 ${nFree} · Pro ${n - nFree}) + 목록 → worksheet/ · worksheet/pro/ (재료 없는 ${POINTS.length - n}개는 뺌)`);
