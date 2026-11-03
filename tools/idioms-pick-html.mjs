#!/usr/bin/env node
/* 「필수 관용 표현」 단원마다 중요 표현을 운영자가 고르는 체크 화면 만들기(운영자 2026-11-03 「3~5개는 내가 판단 · 판단할 리스트만 보내 주면 고르는 것만」).
   node tools/idioms-pick-html.mjs <나가는 파일.html> [docs/idioms/freq-hint.json]   → 단원 30개 × 표현 15개 체크표. 「선택 복사」를 누르면 {"ex-01":["표현", …], …} 글이 복사된다(Claude 에게 붙여 준다).
   freq-hint.json(안티가 빈출도를 매긴 뒤: [{head, freq, why}])이 있으면 빈출도 칸이 같이 나온다. 생성물은 운영자에게 보내는 용도 — 저장소에 올리지 않는다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [out, hintFile] = process.argv.slice(2);
if (!out) { console.error('쓰는 법: node tools/idioms-pick-html.mjs <파일.html> [freq-hint.json]'); process.exit(1); }
const book = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/books/korean-idioms.json'), 'utf8'));
const hint = {}; if (hintFile && fs.existsSync(hintFile)) for (const h of JSON.parse(fs.readFileSync(hintFile, 'utf8'))) hint[h.head] = h;
const parts = book.parts.map((p) => ({ name: p.title.ko.replace(/\s*\(.*\)/, ''), units: p.units }));
const data = [];
for (const P of parts) for (const id of P.units) {
  const u = book.inline[id]; const v = u.sections.find((s) => s.type === 'vocab'); const c = u.sections.find((s) => s.type === 'checkup');
  const test = new Set(c?.match?.words || []);
  data.push({ id, part: P.name, title: u.title.ko, items: v.entries.map((e) => ({ ko: e.ko, hanja: e.hanja || '', km: e.km, en: e.en, lv: e.lv, test: test.has(e.ko), freq: hint[e.ko]?.freq || 0, why: hint[e.ko]?.why || '' })) });
}
const hasFreq = Object.keys(hint).length > 0;
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>관용 표현 중요 표현 고르기</title><style>
:root{--ink:#1b1512;--acc:#c4551c;--line:#d9d2c3;--bg:#faf6ef}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,'Noto Sans KR',sans-serif}
header{position:sticky;top:0;background:#fff;border-bottom:2px solid var(--ink);padding:10px 16px;z-index:5;display:flex;gap:12px;align-items:center;flex-wrap:wrap}header b{font-size:16px}header span{color:#6a5f55;font-size:13px}
button{font:inherit;border:1px solid var(--acc);background:var(--acc);color:#fff;border-radius:6px;padding:7px 14px;cursor:pointer}button.g{background:#fff;color:var(--acc)}
main{max-width:980px;margin:0 auto;padding:16px}h2{margin:26px 0 4px;font-size:17px;display:flex;gap:10px;align-items:baseline;border-bottom:1px solid var(--ink);padding-bottom:4px}h2 small{color:#6a5f55;font-weight:400}h2 .cnt{margin-left:auto;font-size:13px;font-weight:700}
.ok{color:#0a7a4f}.bad{color:#c0392b}table{width:100%;border-collapse:collapse;background:#fff;margin-bottom:6px}th,td{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top;font-size:14px}th{background:#f1ece2;font-size:12px}
td.c{width:36px;text-align:center}td.k{font-weight:700;white-space:nowrap}td small{display:block;color:#6a5f55;font-size:12px}.t{display:inline-block;background:#fdf0e6;color:var(--acc);border-radius:4px;padding:0 5px;font-size:11px;margin-left:4px}.f{font-weight:700}
input[type=checkbox]{width:20px;height:20px;accent-color:#c4551c}tr.sel{background:#fff6ec}.toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#1b1512;color:#fff;padding:8px 16px;border-radius:6px;display:none}
td.l{white-space:nowrap}@media(max-width:640px){td.m{display:none}th.m{display:none}td.k{white-space:normal}main{padding:10px}th,td{padding:5px 6px}h2{flex-wrap:wrap}}</style></head><body>
<header><b>중요 표현 고르기</b><span>단원마다 <b>3~5개</b> 고르세요 · 「미니 테스트」 표시는 그 단원 점검 문제에 이미 나오는 표현</span><span id="tot"></span><button id="copy">선택 복사</button><button class="g" id="clr">모두 지우기</button></header>
<main>${data.map((u) => `<section data-u="${u.id}"><h2>${u.part} · ${u.title} <small>${u.id}</small><span class="cnt" id="c-${u.id}">0 / 3~5</span></h2>
<table><tr><th class="c"></th><th>표현</th><th class="m">뜻</th><th class="m">English</th><th>급</th>${hasFreq ? '<th>빈출도</th>' : ''}</tr>${u.items.map((e, i) => `<tr data-k="${e.ko.replace(/"/g, '&quot;')}"><td class="c"><input type="checkbox" data-u="${u.id}" data-k="${e.ko.replace(/"/g, '&quot;')}"></td><td class="k">${e.ko}${e.hanja ? `<small>${e.hanja}</small>` : ''}${e.test ? '<span class="t">미니 테스트</span>' : ''}</td><td class="m">${e.km || ''}</td><td class="m">${e.en}</td><td class="l">${e.lv}급</td>${hasFreq ? `<td class="f">${e.freq ? '★'.repeat(e.freq) : ''}<small>${e.why}</small></td>` : ''}</tr>`).join('')}</table></section>`).join('')}</main>
<div class="toast" id="toast">복사했어요</div>
<script>
var KEY='idioms-pick-v1',S={};try{S=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function upd(){var tot=0,bad=0;document.querySelectorAll('section').forEach(function(sec){var id=sec.getAttribute('data-u'),n=(S[id]||[]).length;tot+=n;var el=document.getElementById('c-'+id);el.textContent=n+' / 3~5';var ok=n>=3&&n<=5;el.className='cnt '+(ok?'ok':(n?'bad':''));if(!ok)bad++;sec.querySelectorAll('tr[data-k]').forEach(function(tr){var on=(S[id]||[]).indexOf(tr.getAttribute('data-k'))>=0;tr.className=on?'sel':''})});document.getElementById('tot').textContent='선택 '+tot+'개 · 3~5개가 아닌 단원 '+bad+'개'}
document.querySelectorAll('input[type=checkbox]').forEach(function(cb){var id=cb.getAttribute('data-u'),k=cb.getAttribute('data-k');cb.checked=(S[id]||[]).indexOf(k)>=0;cb.addEventListener('change',function(){var a=S[id]||[];var i=a.indexOf(k);if(cb.checked&&i<0)a.push(k);if(!cb.checked&&i>=0)a.splice(i,1);S[id]=a;if(!a.length)delete S[id];save();upd()})});
document.getElementById('copy').addEventListener('click',function(){var t=JSON.stringify(S,null,1);function done(){var el=document.getElementById('toast');el.style.display='block';setTimeout(function(){el.style.display='none'},1500)}
if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(done,fb)}else fb();function fb(){var a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(x){}document.body.removeChild(a);done()}});
document.getElementById('clr').addEventListener('click',function(){if(confirm('선택을 모두 지울까요?')){S={};save();document.querySelectorAll('input[type=checkbox]').forEach(function(c){c.checked=false});upd()}});
upd();
</script></body></html>`;
fs.writeFileSync(out, html);
console.log(`중요 표현 고르기 화면: 단원 ${data.length} · 표현 ${data.reduce((n, u) => n + u.items.length, 0)}개 → ${out} (${(fs.statSync(out).size / 1024).toFixed(0)}KB)`);
