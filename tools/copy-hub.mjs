// 운영자에게 보내는 「복사판」 HTML 을 한 장으로 모은다(운영자 2026-10-27 「html 판이 너무 많아 하나에 모아줘」).
//   node tools/copy-hub.mjs <나가는 파일.html> [그림 폴더(홍보 그림, tools/social-cards.mjs 가 만든 곳)]
// 탭: 쓰레드 글 · 교사 글 · KDP · 쿠팡 · ISBN 신청 · 선물 · 소개 요청 · 예스24 개별등록 · 판매처 글(예스24 등). 탭마다 기존 생성 도구를 그대로 불러 그 결과를 안에 넣는다 —
// 칸 · 복사 단추는 각 도구가 만든 그대로. 생성물은 운영자에게 보내는 용도라 저장소에 올리지 않는다.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [out, imgDir] = process.argv.slice(2);
if (!out) { console.error('쓰는 법: node tools/copy-hub.mjs <파일.html> [그림 폴더]'); process.exit(1); }
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hub-'));
const img = imgDir ? [imgDir] : [];
const run = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
const tabs = [
  ['쓰레드 글', () => run('node', ['tools/threads-html.mjs', path.join(tmp, 'a.html'), ...img]), 'a'],
  ['교사 글', () => run('node', ['tools/threads-html.mjs', path.join(tmp, 'b.html'), ...img, '--json', 'docs/ops/teacher-posts.json', '--title', '한국어 선생님께 홍보 글']), 'b'],
  ['KDP', () => run('node', ['tools/kdp-html.mjs', path.join(tmp, 'c.html')]), 'c'],
  ['쿠팡', () => run('python3', ['tools/coupang-html.py', path.join(tmp, 'd.html')]), 'd'],
  ['ISBN 신청', () => run('python3', ['tools/isbn-html.py', path.join(tmp, 'e.html')]), 'e'],
  ['선물 · 소개 요청', () => run('node', ['tools/gift-html.mjs', path.join(tmp, 'g.html')]), 'g'],
  ['예스24 개별등록', () => run('python3', ['tools/yes24-html.py', path.join(tmp, 'h.html')]), 'h'],
  ['판매처 글(예스24 등)', () => run('python3', ['tools/listing-html.py', path.join(tmp, 'f.html'), '예스24']), 'f'],
];
/* 안쪽 쪽은 클립보드를 직접 못 쓰는 브라우저가 있어(파일로 연 쪽) 「복사」 글을 바깥 쪽에 넘겨 거기서 복사한다 */
const SHIM = `<script>try{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:function(t){parent.postMessage({copy:t},'*');return Promise.resolve()}}})}catch(e){}</script>`;
const docs = tabs.map(([name, make, k]) => { make(); return [name, SHIM + fs.readFileSync(path.join(tmp, `${k}.html`), 'utf8')]; });
fs.rmSync(tmp, { recursive: true, force: true });
const data = JSON.stringify(docs).replace(/</g, '\\u003c');
fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>복사판 모음</title><style>
html,body{height:100%;margin:0}body{display:flex;flex-direction:column;font:15px system-ui,'Noto Sans KR',sans-serif;background:#faf6ef;color:#1b1512}
nav{display:flex;gap:6px;flex-wrap:wrap;padding:10px 14px;background:#fff;border-bottom:2px solid #1b1512;align-items:center}nav b{margin-right:8px}nav button{padding:8px 14px;border:1px solid #c4551c;background:#fff;color:#c4551c;border-radius:99px;font-weight:700;cursor:pointer}nav button.on{background:#c4551c;color:#fff}
iframe{flex:1;border:0;width:100%;background:#faf6ef}</style>
<nav><b>복사판 모음</b>${docs.map(([n], i) => `<button type="button" data-i="${i}">${n}</button>`).join('')}</nav>
<iframe id="f" allow="clipboard-write" title="복사판"></iframe>
<script type="application/json" id="d">${data}</script>
<script>var D=JSON.parse(document.getElementById('d').textContent),F=document.getElementById('f'),B=document.querySelectorAll('nav button');
function show(i){F.srcdoc=D[i][1];B.forEach(function(b,k){b.className=k==i?'on':''});try{location.hash='t'+i}catch(e){}}
window.addEventListener('message',function(e){var t=e.data&&e.data.copy;if(typeof t!=='string')return;
function fb(){var a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(x){}document.body.removeChild(a)}
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).catch(fb)}else{fb()}});
B.forEach(function(b){b.addEventListener('click',function(){show(+b.getAttribute('data-i'))})});
var h=+(location.hash||'#t0').slice(2)||0;show(h<D.length?h:0);</script>`);
console.log(`복사판 모음: 탭 ${docs.length}개 → ${out} (${(fs.statSync(out).size / 1048576).toFixed(1)}MB)`);
