// 화면 글자 뽑기(운영자 결정 2026-10-07 — 화면 언어 늘리기: 중국어 → 베트남어 · 일본어 · 미얀마어 · 우즈베크어).
// 코드의 t('한국어', 'English') · t(`…${x}…`, `…${y}…`) 와 index.html 의 data-en · data-en-aria 를 모아
// docs/i18n/strings.json 에 [{ en, ko, n }] 로 쓴다. 열쇠는 영어 — 번역은 docs/i18n/<언어>.json { 영어: 번역 }.
// 템플릿의 ${…} 는 {0} {1} … 로 바꾼다(번역에서도 그대로 둔다). 학습 자료(문항 · 낱말 · 예문)는 뽑지 않는다.
// node tools/i18n-extract.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['app.module.js', 'app.js', 'words.js', 'word-blocks.js', 'billing.js', 'levels.js'];
const out = new Map();
const add = (en, ko, where) => {
  en = String(en).trim(); if (!en || !/[A-Za-z]/.test(en)) return;
  const x = out.get(en) || { en, ko: String(ko || '').trim(), n: 0, at: where }; x.n++; out.set(en, x);
};
/* 문자열 하나 읽기 — '…' "…" `…${…}…`. 템플릿은 ${…} 를 {i} 로 */
function lit(s, i) {
  const q = s[i]; if (!`'"\``.includes(q)) return null;
  let j = i + 1, v = '', k = 0;
  while (j < s.length) {
    const c = s[j];
    if (c === '\\') { v += s[j + 1] === 'n' ? '\n' : s[j + 1]; j += 2; continue; }
    if (c === q) return { v, end: j + 1 };
    if (q === '`' && c === '$' && s[j + 1] === '{') {
      let d = 1; j += 2;
      while (j < s.length && d) { if (s[j] === '{') d++; else if (s[j] === '}') d--; else if (`'"\``.includes(s[j])) { const r = lit(s, j); if (r) { j = r.end; continue; } } j++; }
      v += `{${k++}}`; continue;
    }
    v += c; j++;
  }
  return null;
}
for (const f of FILES) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const re = /(^|[^\w$.])t\(\s*/g; let m;
  while ((m = re.exec(s))) {
    let i = m.index + m[0].length;
    const a = lit(s, i); if (!a) continue;
    i = a.end; while (/\s/.test(s[i])) i++;
    if (s[i] !== ',') continue; i++; while (/\s/.test(s[i])) i++;
    const b = lit(s, i); if (!b) continue;
    add(b.v, a.v, f);
  }
}
/* 자료 객체 안의 화면 글자 — { ko: '…', en: '…' } · { subKo, subEn } · { dKo, dEn } 처럼 이름이 짝인 것(메뉴 설명 · 갈래 이름 · 길 설명).
   t() 로 안 감싸고 isEn() ? o.en : o.ko 로 고르는 곳이 있어 위 반복이 못 본다 — 그 자리는 cpTr 을 거친다. 학습 자료(문항 · 예문)는 .js 자료 파일에 있어 여기 안 걸린다. */
for (const f of FILES) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of s.matchAll(/(\b\w*?)[kK]o:\s*'((?:[^'\\]|\\.)*)'\s*,\s*\1[eE]n:\s*'((?:[^'\\]|\\.)*)'/g)) add(m[3].replace(/\\(.)/g, '$1'), m[2].replace(/\\(.)/g, '$1'), f);
}
const dec = (x) => x.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const m of html.matchAll(/data-en(?:-aria)?="([^"]*)"/g)) add(dec(m[1]), '', 'index.html');
/* 첫 화면 히어로처럼 원문이 영어인 칸(data-ko) — 열쇠는 브라우저가 돌려주는 innerHTML 모양(& → &amp;) */
for (const m of html.matchAll(/<(\w+)[^>]*?data-ko="[^"]*"[^>]*>([\s\S]*?)<\/\1>/g)) add(m[2].trim().replace(/&(?![a-z#0-9]+;)/gi, '&amp;'), '', 'index.html');
const list = [...out.values()].sort((a, b) => b.n - a.n || a.en.localeCompare(b.en));
fs.mkdirSync(path.join(ROOT, 'docs/i18n'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs/i18n/strings.json'), JSON.stringify(list.map(({ en, ko, n }) => ({ en, ko, n })), null, 0).replace(/\},\{/g, '},\n{') + '\n');
console.log(`화면 글자 ${list.length}개 (자리 표시 있는 것 ${list.filter((x) => /\{\d\}/.test(x.en)).length}개) → docs/i18n/strings.json`);
