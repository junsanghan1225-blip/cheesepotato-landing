/* Gemini 가 준 문장을 SB_SEED 에 붙인다.
   node tools/seed-merge.mjs <문장.json>

   문장만 받고 **이름·좋아요·시간은 여기서 붙인다.** 그걸 같이 시키면
   이름이 한둘로 몰리고 좋아요가 죄다 3이 되고 시간이 겹친다. 표현 id 로
   해시를 만들어 정하므로 몇 번을 다시 돌려도 같은 값이 나온다. */
import fs from 'fs';
import { SB_CATS } from '../sentences.js';

const CAST = ['하루', '사쿠라', 'Minh', 'Tuan', '리한', '샤오위', 'Emma', 'Daniel', 'Aziz', 'Nisha'];
/* 좋아요는 낮은 쪽으로 기운다. 다 5씩이면 눌린 적이 없는 게시판으로 보인다. */
const LIKES = [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5, 6, 7];
const WHEN = ['3시간 전', '7시간 전', '11시간 전', '1일 전', '2일 전', '3일 전', '4일 전', '6일 전', '1주 전', '2주 전'];

const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

const src = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const known = new Set();
SB_CATS.forEach((c) => c.points.forEach((p) => known.add(p.id)));

const out = [];
let posts = 0;
for (const [id, texts] of Object.entries(src)) {
  if (!known.has(id)) { console.error(`모르는 표현 id: ${id}`); process.exit(1); }
  const rows = texts.map((t, i) => {
    const h = hash(`${id}~${i}`);
    return [CAST[h % CAST.length], t, LIKES[(h >> 8) % LIKES.length], WHEN[(h >> 16) % WHEN.length]];
  });
  /* 한 표현에 같은 사람이 두 번 나오면 대화가 아니라 혼잣말로 보인다. */
  for (let i = 1; i < rows.length; i++) {
    let step = 1;
    while (rows.slice(0, i).some((r) => r[0] === rows[i][0])) {
      rows[i][0] = CAST[(CAST.indexOf(rows[i][0]) + step++) % CAST.length];
    }
  }
  posts += rows.length;
  /* 이 파일은 쌍따옴표를 쓴다. 한 파일 안에서 따옴표가 갈리면 다음 사람이
     어느 쪽이 규칙인지 못 고른다. */
  const q = (t) => '"' + String(t).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  out.push(`  ${q(id)}: [\n` + rows.map((r) =>
    `    [${q(r[0])}, ${q(r[1])}, ${r[2]}, ${q(r[3])}],`).join('\n') + '\n  ],');
}

const p = new URL('../sentences.js', import.meta.url).pathname;
const file = fs.readFileSync(p, 'utf8');
const key = 'export const SB_SEED = {';
const i = file.indexOf(key);
if (i < 0) throw new Error('SB_SEED 를 못 찾았다');
const at = i + key.length;
fs.writeFileSync(p, file.slice(0, at) + '\n' + out.join('\n') + file.slice(at));
console.log(`표현 ${out.length}개 · 글 ${posts}개 붙임`);
