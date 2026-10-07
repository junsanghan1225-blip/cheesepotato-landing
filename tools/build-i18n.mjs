// 화면 번역 사전 굽기 — docs/i18n/<언어>.json { 영어: 번역 } → i18n-<언어>.js (사이트가 그 언어를 고를 때만 받는다).
// 열쇠에 {0} {1} 이 있으면(템플릿) 정규식으로 바꿔 둔다 — 화면에서는 값이 채워진 문장이 오기 때문.
// node tools/build-i18n.mjs            (docs/i18n/ 의 모든 언어)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'docs/i18n');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const f of fs.readdirSync(DIR).filter((x) => /^[a-z]{2}(-[A-Za-z]+)?\.json$/.test(x))) {
  const code = f.replace('.json', ''), d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const EXACT = {}, PATS = [];
  for (const [en, tr] of Object.entries(d)) {
    if (!tr || typeof tr !== 'string') continue;
    if (/\{\d\}/.test(en)) PATS.push(['^' + esc(en).replace(/\\\{(\d)\\\}/g, '([\\s\\S]*?)') + '$', tr, [...en.matchAll(/\{(\d)\}/g)].map((m) => +m[1])]);
    else EXACT[en] = tr;
  }
  fs.writeFileSync(path.join(ROOT, `i18n-${code}.js`), `/* 만든 것: tools/build-i18n.mjs ← docs/i18n/${f} — 손으로 고치지 않는다 */\nexport const LANG = ${JSON.stringify(code)};\nexport const EXACT = ${JSON.stringify(EXACT)};\nexport const PATS = ${JSON.stringify(PATS)};\n`);
  console.log(`${code}: 그대로 ${Object.keys(EXACT).length} · 자리 표시 ${PATS.length} → i18n-${code}.js`);
}
