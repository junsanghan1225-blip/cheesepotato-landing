/* 문서 경로가 살아 있는가 — 저장소 글 어디에든 적힌 `docs/…` 파일이 실제로 있는지 본다(2026-10-10).
   문서를 폴더로 나눈 뒤(antigravity · ops · plans · archive) 옛 경로가 남으면 Claude · 안티 · 운영자가 엉뚱한 곳을 찾는다.
   CI 도 돈다. 다른 저장소(앱)의 문서를 가리키는 줄은 ELSEWHERE 에 적어 둔다. */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ELSEWHERE = new Set(['docs/privacy-policy.md', 'docs/data-safety.md', 'docs/ota-updates.md', 'docs/post-launch-risks.md']); // 앱 저장소(cheesepotatoapp)
const files = execFileSync('git', ['ls-files', '*.md', '*.mjs', '*.js', '*.ts', '*.yml', '*.sql', '*.html', '*.json', '*.css'], { encoding: 'utf8', maxBuffer: 256 << 20 }).split('\n')
  .filter((f) => f && /\.(md|mjs|js|ts|yml|sql|html|json|css)$/.test(f) && !/^(dictionary|sentence|course|lesson|blog|vi|ja|compare|korean-word-for|topik[12]-words|topik-refs|vocab-topik2-ex)\//.test(f));
const bad = [];
for (const f of files) {
  if (!existsSync(f) || statSync(f).size > 3e6) continue;
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/(?<![\w/.-])docs\/[\w~./-]+?\.md\b/g)) {
    const p = m[0];
    if (p.includes('*') || ELSEWHERE.has(p) || existsSync(p)) continue;
    bad.push(`${f}: ${p}`);
  }
}
if (bad.length) { console.log('없는 문서를 가리킴:\n  ' + [...new Set(bad)].join('\n  ')); process.exit(1); }
console.log('문서 경로 이상 없음');
