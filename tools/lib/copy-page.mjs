// 복사판 HTML 의 공통 틀 — 칸(.f) · 「복사」 단추 · 글자 모양(threads-html · kdp-html 이 같이 쓴다. 운영자 2026-10-27 「코드 정리」).
// 단추는 칸 안의 pre(없으면 .v) 글을 복사한다. 쪽마다 다른 모양은 css 로 덧붙인다.
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const COPY_JS = "document.addEventListener('click',function(ev){var b=ev.target.closest('[data-c]');if(!b)return;var f=b.closest('.f');var t=(f.querySelector('pre')||f.querySelector('.v')).innerText;navigator.clipboard.writeText(t).then(function(){b.textContent='복사됨';b.classList.add('ok');setTimeout(function(){b.textContent='복사';b.classList.remove('ok')},1500)})});";
/* width: 본문 너비(px) · h2: h2 의 위 여백 · 안 간격(px) · css: 그 쪽만의 모양 */
export function copyPage({ title, body, width = 880, h2 = [32, 13], css = '' }) {
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>
body{font:15px/1.5 system-ui,'Noto Sans KR',sans-serif;max-width:${width}px;margin:0 auto;padding:18px;background:#faf6ef;color:#1b1512}h1{font-size:22px}h2{font-size:18px;margin:${h2[0]}px 0 8px;border-top:2px solid #1b1512;padding-top:${h2[1]}px}
.f{margin:8px 0;padding:8px 10px;background:#fff;border:1px solid #e6dccb;border-radius:8px}.fh{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px;color:#6b5844}.fh button{padding:3px 10px;border:1px solid #c4551c;background:#fff;color:#c4551c;border-radius:6px;font-weight:700;cursor:pointer}.fh button.ok{background:#c4551c;color:#fff}.top{background:#fff;border:1px solid #e6dccb;border-radius:10px;padding:10px 14px;font-size:13.5px}${css}</style>
${body}
<script>${COPY_JS}</script>`;
}
