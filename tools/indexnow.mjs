// IndexNow — 새로 생기거나 바뀐 쪽을 Bing(과 IndexNow 를 쓰는 검색 엔진)에 바로 알린다(운영자 2026-10-09 「IndexNow 도 해줘」).
// 열쇠는 비밀이 아니다 — 사이트 맨 위의 <열쇠>.txt 로 「이 사이트 주인이 보낸 것」을 증명할 뿐이다(IndexNow 규칙).
// 보내는 주소는 사이트맵에 있는 것만 — 운영 쪽(funnel.html · stats.html …)은 알리지 않는다.
//   node tools/indexnow.mjs --changed   바로 앞 커밋에서 바뀐 .html 만(main 에 머지될 때 액션이 부른다)
//   node tools/indexnow.mjs --all       사이트맵 전체(처음 한 번 · 손으로)
//   --dry                               보내지 않고 목록만 보기
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'everykoreans.com', SITE = `https://${HOST}`;
const KEY = '8d5ef86e607785529ebf569ba80b18f7';
const args = new Set(process.argv.slice(2));

const inSitemap = new Set();
for (const f of fs.readdirSync(ROOT).filter((f) => /^sitemap-.*\.xml$/.test(f)))
  for (const m of fs.readFileSync(path.join(ROOT, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) inSitemap.add(m[1]);

let urls;
if (args.has('--all')) urls = [...inSitemap];
else {
  let changed = '';
  try { changed = execSync('git diff --name-only HEAD~1 HEAD', { cwd: ROOT, encoding: 'utf8' }); } catch { changed = ''; }
  urls = changed.split('\n').filter((f) => f.endsWith('.html'))
    .map((f) => `${SITE}/${f.replace(/(^|\/)index\.html$/, '$1')}`)
    .filter((u) => inSitemap.has(u));
}
console.log(`IndexNow — 알릴 쪽 ${urls.length}개${urls.length ? ` (예: ${urls.slice(0, 3).join(' · ')})` : ''}`);
if (!urls.length || args.has('--dry')) process.exit(0);

// 한 번에 10,000개까지(규칙)
for (let i = 0; i < urls.length; i += 10000) {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls.slice(i, i + 10000) }),
  });
  console.log(`  ${i + 1}~${Math.min(i + 10000, urls.length)}: HTTP ${res.status}`);   // 200 · 202 = 받음
  if (res.status >= 400) process.exitCode = 1;
}
