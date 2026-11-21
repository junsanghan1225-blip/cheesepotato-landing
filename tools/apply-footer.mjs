/* 손으로 쓴 쪽 · 첫 화면에 공통 꼬리말(tools/lib/site-footer.mjs)을 넣는다 — 기본 틀 6번(운영자 2026-11-21 「A로 하고 폰은 접기, 첫 화면도 같이」).
   <!-- site-footer:start --> ~ <!-- site-footer:end --> 사이를 바꾼다. 표시가 없으면: 첫 화면은 예전 <div class="footer"> 를 바꿔 끼우고, 다른 쪽은 </main> 뒤(없으면 </body> 앞)에 넣는다.
   node tools/apply-footer.mjs          ← 넣기 · 고치기
   node tools/apply-footer.mjs --check  ← 꼬리말이 site-footer.mjs 와 같은지만(CI · preflight) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteFooter, SITE_FOOTER_CSS } from './lib/site-footer.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
/* 손으로 쓴 쪽(도구가 만들지 않는 쪽). 운영자 전용 쪽(funnel · stats · connect …)은 뺀다 */
export const HAND = ['index.html', 'about.html', 'privacy.html', 'teacher.html', 'for-teachers.html', 'notices.html',
  'korean-age/index.html', 'korean-birthday/index.html', 'korean-name/index.html', 'korean-proverb/index.html', 'korean-word-today/index.html',
  'korean-zodiac/index.html', 'my-korean-name/index.html', 'my/eps-topik/index.html', 'hangul-worksheet/index.html', 'numbers-worksheet/index.html'];
const S0 = '<!-- site-footer:start — tools/apply-footer.mjs 가 넣는다. 손으로 고치지 말 것(tools/lib/site-footer.mjs 를 고친다) -->', S1 = '<!-- site-footer:end -->';
const RE = /<!-- site-footer:start[^>]*-->[\s\S]*?<!-- site-footer:end -->/g;

/* <div class="footer"> 하나를 짝 맞는 </div> 까지 찾는다(안에 div 가 겹쳐 있다) */
function oldFooter(src, from = 0) {
  const i = src.indexOf('<div class="footer">', from); if (i < 0) return null;
  let d = 0; const re = /<\/?div\b[^>]*>/g; re.lastIndex = i;
  for (let m; (m = re.exec(src));) { d += m[0][1] === '/' ? -1 : 1; if (d === 0) return [i, re.lastIndex]; }
  throw new Error('짝이 안 맞는 footer div');
}

let bad = 0, done = 0;
for (const f of HAND) {
  const p = path.join(ROOT, f); const src = fs.readFileSync(p, 'utf8');
  const lang = (src.match(/<html[^>]*\blang="([a-z]+)/) || [])[1] || 'ko';
  const mode = f === 'index.html' ? 'data-en' : lang === 'ko' ? 'ko' : 'en';
  let k = 0;
  const block = () => `${S0}\n${k++ === 0 ? `<style>${SITE_FOOTER_CSS}</style>\n` : ''}${siteFooter({ mode })}\n${S1}`;
  let out = src;
  if (RE.test(src)) { RE.lastIndex = 0; out = src.replace(RE, () => block()); }
  else if (f === 'index.html') { for (let r; (r = oldFooter(out));) out = out.slice(0, r[0]) + block() + out.slice(r[1]); }
  else if (out.includes('</main>')) out = out.replace(/<\/main>(?![\s\S]*<\/main>)/, `</main>\n${block()}`);
  else out = out.replace('</body>', `${block()}\n</body>`);
  if (k === 0) { console.error(`${f}: 꼬리말 자리를 못 찾았다`); bad++; continue; }
  if (out !== src) { if (CHECK) { console.error(`${f}: 꼬리말이 site-footer.mjs 와 다르다 — node tools/apply-footer.mjs`); bad++; } else { fs.writeFileSync(p, out); done++; } }
}
if (bad) process.exit(1);
console.log(CHECK ? `꼬리말 맞다 — 손 쪽 ${HAND.length}곳` : `꼬리말 넣음 · 고침 ${done}곳 / ${HAND.length}`);
