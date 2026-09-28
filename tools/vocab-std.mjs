#!/usr/bin/env node
/* 국립국어원 「2017년 국제 통용 한국어 표준 교육과정 적용 연구(4단계)」 어휘 등급 목록(엑셀)을
 * 우리가 쓰기 좋은 JSON 으로 옮긴다 — docs/vocab/std-2017.json
 *
 *   node tools/vocab-std.mjs <받은 엑셀 파일>
 *
 * 공공누리 제1유형(출처표시): 출처를 밝히면 상업적 이용 · 변형 가능. 이 목록을 쓰는 화면에는
 * 「어휘 등급: 국립국어원 국제 통용 한국어 표준 교육과정」을 적는다(docs/vocab-plan.md).
 *
 * 엑셀 원본은 저장소에 넣지 않는다(700KB 바이너리). 다시 뽑을 일이 있으면 운영자에게 받는다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2];
if (!src || !fs.existsSync(src)) { console.error('쓰기: node tools/vocab-std.mjs <엑셀 파일>'); process.exit(1); }
const XM = await import(pathToFileURL(path.join(ROOT, 'vendor/xlsx.js')).href);
const X = XM.default || XM;

const wb = X.read(fs.readFileSync(src));
const rows = X.utils.sheet_to_json(wb.Sheets['어휘'], { header: 1, defval: '' }).slice(1).filter((r) => r[3]);

/* 「가격02」의 뒤 번호는 동형어 번호다. 「계속02/계속01」 · 「마흔02∙마흔」처럼 둘이 붙은 줄도 있다 — 앞 것을 쓴다.
   품사는 「부사/명사」 · 「관형사∙명사」처럼 둘이 붙기도 한다 — 앞 것. 「의존명사」는 우리 표기 「의존 명사」로. */
const head = (h) => String(h).split(/[/∙·‧・]/)[0].trim().replace(/[0-9]+$/, '').trim();
const pos = (p) => {
  const one = String(p).trim().split(/[/∙·‧.・]/)[0].trim();
  return one === '의존명사' ? '의존 명사' : one === '줄어든말' ? '' : one;
};
const grade = (g) => Number(String(g).replace(/[^0-9]/g, '')) || 0;

/* 같은 표제어가 여러 번(동형어) 나오면 가장 낮은 급수를 쓰고 길잡이말은 모은다. */
const by = new Map();
for (const r of rows) {
  const h = head(r[3]);
  if (!h) continue;
  const g = grade(r[2]);
  const hint = String(r[5] || '').trim();
  const had = by.get(h);
  if (!had) by.set(h, { h, g, p: pos(r[4]), hint: hint ? [hint] : [] });
  else {
    if (g && (!had.g || g < had.g)) { had.g = g; had.p = pos(r[4]) || had.p; }
    if (hint && !had.hint.includes(hint)) had.hint.push(hint);
  }
}
const list = [...by.values()];
const OUT = path.join(ROOT, 'docs/vocab/std-2017.json');
fs.writeFileSync(OUT, JSON.stringify({
  _source: '국립국어원 「2017년 국제 통용 한국어 표준 교육과정 적용 연구(4단계)」 어휘 등급 목록 — https://www.korean.go.kr/front/reportData/reportDataView.do?mn_id=207&report_seq=932',
  _license: '공공누리 제1유형(출처표시). 쓰는 자리에 출처를 밝힌다.',
  _fields: '[표제어, 급수 1~6, 품사, 길잡이말(여러 개면 「 · 」로)]',
  count: list.length,
  words: list.map((w) => [w.h, w.g, w.p, w.hint.join(' · ')]),
}) + '\n');
const byG = {}; list.forEach((w) => { byG[w.g] = (byG[w.g] || 0) + 1; });
console.log(`${rows.length}줄 → 표제어 ${list.length}개 · 급수별 ${Object.entries(byG).map(([k, v]) => `${k}급 ${v}`).join(' · ')}`);
console.log('→ docs/vocab/std-2017.json');
