// 쓰레드 홍보 글을 칸마다 「복사」 단추가 있는 HTML 한 장으로(운영자 2026-10-27). 원본 docs/ops/threads-posts.json. 생성물은 저장소에 올리지 않는다.
//   node tools/threads-html.mjs <나가는 파일.html> [그림 폴더] [--json 원본.json] [--title 제목]   (그림 폴더가 있으면 글마다 그림을 같이 보여 준다. 기본 원본: docs/ops/threads-posts.json, 선생님용: docs/ops/teacher-posts.json)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc as e, copyPage } from './lib/copy-page.mjs';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const pos = argv.filter((x, i) => !x.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const [out, imgDir] = pos;
if (!out) { console.error('쓰는 법: node tools/threads-html.mjs <파일.html> [그림 폴더]'); process.exit(1); }
const J = JSON.parse(fs.readFileSync(path.join(ROOT, opt('--json', 'docs/ops/threads-posts.json')), 'utf8'));
const TITLE = opt('--title', '쓰레드 홍보 글');
const full = (p, src) => { const [pa, h] = p.split('#'); return `https://everykoreans.com${pa}${J.utm.replace('?', '?utm_source=' + (src || 'threads') + '&')}${h ? '#' + h : ''}`; };
const card = (c) => (imgDir && fs.existsSync(path.join(imgDir, c + '.png'))) ? `<img src="data:image/png;base64,${fs.readFileSync(path.join(imgDir, c + '.png')).toString('base64')}" alt="" style="width:100%;max-width:300px;border-radius:10px;border:1px solid #e6dccb">` : '';
const block = (label, text) => { const n = [...text].length; return `<div class="f"><div class="fh"><b>${e(label)}</b><span>${n}자${n > 500 ? ' ⚠ 500자 넘음' : ''}</span><button type="button" data-c>복사</button></div><pre>${e(text)}</pre></div>`; };
const posts = J.posts.map((p) => {
  const link = full(p.link, p.src); const link2 = p.link2 ? full(p.link2, p.src) : '';
  const reply = p.reply.replace('{link}', link).replace('{link2}', link2);
  const en = p.en.replace('{link}', link), ko = p.ko.replace('{link}', link);
  return `<section><h2>${p.n}. ${e(p.when)}${p.where ? ' · ' + e(p.where) : ''}</h2><div class="g">${card(p.card)}<div>${en ? block('본문 (영어)', en) : ''}${ko ? block('본문 (한국어)', ko) : ''}${block('답글 · 덧붙임', reply)}</div></div></section>`;
}).join('\n');
fs.writeFileSync(out, copyPage({ title: TITLE, width: 900, h2: [30, 12], css: '.g{display:grid;grid-template-columns:300px 1fr;gap:16px}@media(max-width:700px){.g{grid-template-columns:1fr}}pre{margin:6px 0 0;white-space:pre-wrap;font:inherit}', body: `<h1>${TITLE} ${J.posts.length}개 — 복사해서 붙여 넣기</h1>
<div class="top"><b>쓰는 법</b>: ① 그림이 있으면 먼저 올리고 ② 본문을 붙여 넣고 ③ 올린 뒤 <b>답글</b>(또는 덧붙임)에 링크 글을 붙입니다. 한 글에 영어와 한국어가 같이 있으면 올리는 곳 언어에 맞는 쪽 하나만 쓰세요.<br>글 길이는 500자까지. 링크 뒤 <code>utm_source=…</code> 덕분에 분석에서 올린 곳마다 방문을 따로 볼 수 있어요. 올린 뒤 좋아요 · 답글에는 바로 답해 주세요(첫 한 시간이 중요하다고들 합니다 — 확인 못 함).</div>
${posts}` }));
console.log(`${TITLE} ${J.posts.length}개 → ${out}`);
