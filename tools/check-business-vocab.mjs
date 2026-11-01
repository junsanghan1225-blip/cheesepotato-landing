#!/usr/bin/env node
/* 비즈니스 한국어 회화 단어장 자료 검사(vocab/data/business.json) — 지시문 docs/antigravity/antigravity-business-vocab-task.md.
   node tools/check-business-vocab.mjs   → 모양 · 중복 · 예문에 표제어 · 분포(lv · register · 상황)를 본다. 파일이 아직 없으면 조용히 통과(안티가 올리기 전). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const f = path.join(ROOT, 'vocab/data/business.json');
if (!fs.existsSync(f)) { console.log('비즈니스 단어장 — 아직 자료 없음(안티가 올리기 전)'); process.exit(0); }
const a = JSON.parse(fs.readFileSync(f, 'utf8'));
const SIT = new Set('greeting phone email meeting report schedule trip dinner interview negotiate apology thanks office finance hr sales service it manufacturing logistics culture'.split(' '));
const POS = new Set(['명사', '동사', '형용사', '부사', '표현']);
const bad = [], seen = new Set(), heads = new Map();
a.forEach((w, i) => {
  const e = (m) => bad.push(`${w.id || '#' + (i + 1)} ${w.head || ''}: ${m}`);
  if (!/^bw-\d{3}$/.test(w.id || '')) e('id 가 bw-000 꼴이 아니다');
  else if (w.id !== `bw-${String(i + 1).padStart(3, '0')}`) e(`id 가 순서와 다르다(기대 bw-${String(i + 1).padStart(3, '0')})`);
  if (seen.has(w.id)) e('id 중복'); seen.add(w.id);
  if (!w.head) e('head 없음'); else if (heads.has(w.head)) e(`표제어 중복(${heads.get(w.head)})`); else heads.set(w.head, w.id);
  if (!POS.has(w.pos)) e(`pos 가 이상하다(${w.pos})`);
  if (!w.en || /[가-힣]/.test(w.en)) e('en 이 없거나 한글이 섞였다');
  if (![1, 2, 3].includes(w.lv)) e('lv 는 1 · 2 · 3');
  if (!['formal', 'neutral', 'casual'].includes(w.register)) e('register 가 이상하다');
  if (!SIT.has(w.situation)) e(`situation 이 목록에 없다(${w.situation})`);
  if (!Number.isInteger(w.unit) || w.unit < 1 || w.unit > 30) e('unit 은 1~30');
  if (!Array.isArray(w.examples) || w.examples.length < 2 || w.examples.some((x) => !Array.isArray(x) || x.length !== 2 || !x[0] || !x[1])) e('examples 는 [한국어, 영어] 둘 이상');
  else {
    const stem = w.head.replace(/다$/, '').replace(/\s.*$/, '');
    if (w.pos !== '표현' && !w.examples.some((x) => x[0].includes(stem.slice(0, Math.max(1, stem.length - (w.pos === '동사' || w.pos === '형용사' ? 0 : 0)))))) e('예문에 표제어(어간)가 안 나온다');
  }
  if (w.dialog && (!Array.isArray(w.dialog) || w.dialog.some((x) => x.length !== 2))) e('dialog 는 [화자, 말] 쌍');
});
const cnt = (k) => a.reduce((m, w) => (m[w[k]] = (m[w[k]] || 0) + 1, m), {});
const perUnit = a.reduce((m, w) => (m[w.unit] = (m[w.unit] || 0) + 1, m), {});
const short = Object.entries(perUnit).filter(([u, n]) => n !== 20 && Number(u) <= Math.floor(a.length / 20)).map(([u, n]) => `${u}단원 ${n}개`);
console.log(`비즈니스 단어장 ${a.length}개 · lv ${JSON.stringify(cnt('lv'))} · register ${JSON.stringify(cnt('register'))} · 상황 ${Object.keys(cnt('situation')).length}종`);
if (short.length) console.log(`⚠ 20개가 아닌 단원: ${short.slice(0, 6).join(', ')}`);
if (bad.length) { console.error(`오류 ${bad.length}개:\n  ` + bad.slice(0, 15).join('\n  ')); process.exit(1); }
console.log('오류 0');
