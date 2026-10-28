// KDP 책 2 이야기(docs/kdp-orig/short-stories-2.json) 모양 검사. 안티가 올린 것을 받기 전에 돌린다.
import fs from 'node:fs';
const F = 'docs/kdp-orig/short-stories-2.json';
if (!fs.existsSync(F)) { console.log('아직 파일 없음(첫 묶음 전) — 정상'); process.exit(0); }
const B = JSON.parse(fs.readFileSync(F, 'utf8')), S = B.stories || [];
const err = [], H = /[가-힣]/, E = (m) => err.push(m);
S.forEach((s, i) => {
  const n = s.no;
  if (n !== i + 1) E(`${i + 1}번째 칸 번호가 ${n}`);
  if (s.level !== (n <= 20 ? 'A2' : 'B1')) E(`${n}번 level ${s.level}`);
  if (!s.title?.ko || !s.title?.en) E(`${n}번 제목 빔`);
  if (!(s.lines?.length >= 14 && s.lines.length <= 20)) E(`${n}번 줄 ${s.lines?.length}개(14~20)`);
  (s.lines || []).forEach((l, k) => { if (!H.test(l.ko || '') || !l.en?.trim() || H.test(l.en)) E(`${n}번 ${k + 1}줄 ko/en 이상`); });
  if (!(s.vocab?.length >= 7 && s.vocab.length <= 10)) E(`${n}번 낱말 ${s.vocab?.length}개(7~10)`);
  (s.vocab || []).forEach((v) => { if (!v.ko || !v.en || H.test(v.en)) E(`${n}번 낱말 이상 ${v.ko}`); });
  if (s.check?.length !== 3) E(`${n}번 문제 ${s.check?.length}개(3)`);
  (s.check || []).forEach((c) => { if (!c.q || !c.a || H.test(c.q + c.a)) E(`${n}번 문제 이상`); });
  const ko = (s.lines || []).map((l) => l.ko).join('').replace(/\s/g, '').length;
  if (ko < 250 || ko > 600) E(`${n}번 한국어 ${ko}자(350~450 권장)`);
});
if (err.length) { console.log(err.slice(0, 40).join('\n')); console.log(`✗ ${err.length}건`); process.exit(1); }
console.log(`✓ 이야기 ${S.length}편 / 40편 모양 이상 없음`);
