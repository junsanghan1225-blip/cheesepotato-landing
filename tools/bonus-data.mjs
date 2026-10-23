/* 책 QR 보너스 연습 자료(docs/bonus/<책 id>.json)를 읽고 검사한다 — build-bonus.mjs · check-bonus.mjs 가 같이 쓴다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const bonusFiles = () => fs.readdirSync(path.join(ROOT, 'docs/bonus')).filter((f) => f.endsWith('.json')).sort();
export const loadBonus = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/bonus', f), 'utf8'));
const ko = (s) => (String(s).match(/[가-힣]+/g) || []).join('');
export function validateBonus(f) {
  const err = [], d = loadBonus(f), id = f.replace(/\.json$/, '');
  if (d.book !== id) err.push(`${f}: book(${d.book}) 이 파일 이름과 달라요`);
  const bookFile = path.join(ROOT, 'docs/books', `${id}.json`);
  const book = fs.existsSync(bookFile) ? JSON.parse(fs.readFileSync(bookFile, 'utf8')) : null;
  if (!book) err.push(`${f}: docs/books/${id}.json 이 없어요`);
  const bookUnits = new Set((book?.parts || []).flatMap((p) => p.units));
  for (const [u, c] of Object.entries(d.units || {})) {
    const at = `${f} · ${u}`;
    if (book && !bookUnits.has(u)) err.push(`${at}: 책 틀에 없는 단원이에요`);
    const wsf = path.join(ROOT, 'docs/worksheets', `${u}.json`);
    const corpus = ko((fs.existsSync(wsf) ? fs.readFileSync(wsf, 'utf8') : '') + JSON.stringify(book?.inline?.[u] || {}));
    const n = (a) => (Array.isArray(a) ? a.length : 0);
    if (n(c.cards) < 6 || n(c.cards) > 12) err.push(`${at}: 낱말 카드는 6~12개(지금 ${n(c.cards)})`);
    if (n(c.quiz) < 4 || n(c.quiz) > 8) err.push(`${at}: 퀴즈는 4~8개(지금 ${n(c.quiz)})`);
    if (n(c.fill) < 4 || n(c.fill) > 8) err.push(`${at}: 빈칸은 4~8개(지금 ${n(c.fill)})`);
    const seen = new Set();
    const dup = (k, x) => { if (seen.has(k)) err.push(`${at}: 같은 ${x} 가 두 번 나와요 (${k})`); seen.add(k); };
    for (const x of c.cards || []) { if (!x.ko || !x.en) err.push(`${at}: 카드에 ko · en 이 있어야 해요`); dup('c:' + x.ko, '카드'); }
    for (const x of c.quiz || []) {
      if (!x.q || !Array.isArray(x.opts) || x.opts.length < 3 || x.opts.length > 4) err.push(`${at}: 퀴즈 「${x.q}」 보기는 3~4개`);
      else if (!Number.isInteger(x.a) || x.a < 0 || x.a >= x.opts.length) err.push(`${at}: 퀴즈 「${x.q}」 a 가 보기 번호가 아니에요`);
      if (!x.why) err.push(`${at}: 퀴즈 「${x.q}」 why(풀이) 가 없어요`);
      if (new Set(x.opts || []).size !== (x.opts || []).length) err.push(`${at}: 퀴즈 「${x.q}」 보기가 겹쳐요`);
      dup('q:' + x.q, '퀴즈');
    }
    for (const x of c.fill || []) {
      if (!x.q || !/___/.test(x.q)) err.push(`${at}: 빈칸 「${x.q}」 에 ___ 가 없어요`);
      if (!Array.isArray(x.a) || !x.a.length || x.a.some((s) => !String(s).trim())) err.push(`${at}: 빈칸 「${x.q}」 정답 a 는 글 배열이에요`);
      if (!x.en) err.push(`${at}: 빈칸 「${x.q}」 en(영어 뜻) 이 없어요`);
      dup('f:' + x.q, '빈칸');
      const k = ko(x.q.replace(/___/g, ''));
      if (k.length >= 5 && corpus.includes(k)) err.push(`${at}: 빈칸 「${x.q}」 이 책 안의 문장과 같아요(겹침 금지)`);
    }
    for (const t of [JSON.stringify(c)]) if (/—/.test(t)) err.push(`${at}: 줄표(—) 는 쓰지 않아요`);
  }
  return err;
}
