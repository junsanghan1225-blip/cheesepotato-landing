// 화면 번역 검사 — docs/i18n/<언어>.json 의 번역이 {0} 자리 표시 · HTML 태그를 그대로 지키는지, 모르는 열쇠가 없는지.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'docs/i18n');
const keys = new Set(JSON.parse(fs.readFileSync(path.join(DIR, 'strings.json'), 'utf8')).map((x) => x.en));
const tags = (s) => (s.match(/<\/?[a-z]+/gi) || []).map((x) => x.toLowerCase()).sort().join(',');
const ph = (s) => (s.match(/\{\d\}/g) || []).sort().join(',');
let bad = 0;
for (const f of fs.readdirSync(DIR).filter((x) => /^[a-z]{2}(-[A-Za-z]+)?\.json$/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); let n = 0;
  for (const [en, tr] of Object.entries(d)) {
    n++;
    const say = (m) => { bad++; if (bad <= 40) console.error(`${f}: 「${en.slice(0, 50)}」 — ${m}`); };
    if (!keys.has(en)) say('strings.json 에 없는 열쇠');
    if (typeof tr !== 'string' || !tr.trim()) { say('번역이 비었다'); continue; }
    if (ph(en) !== ph(tr)) say(`자리 표시가 다르다 (${ph(en)} ↔ ${ph(tr)})`);
    if (tags(en) !== tags(tr)) say('HTML 태그가 다르다');
  }
  console.log(`${f}: 번역 ${n} / ${keys.size}`);
}
if (bad) { console.error(`문제 ${bad}곳`); process.exit(1); }
console.log('문제 없음');
