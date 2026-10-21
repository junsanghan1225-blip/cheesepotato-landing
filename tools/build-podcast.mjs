#!/usr/bin/env node
// 팟캐스트 대본(docs/podcast/ep*.md) → podcast-episodes.json — 팟캐스트 올리기 쪽(/podcast.html)이 에피소드 목록 · 제목 · 설명 · 표현을 여기서 읽는다.
// 원본은 대본 파일이다. 대본을 고치면 이 도구를 다시 돌린다(손으로 podcast-episodes.json 을 고치지 않는다).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(ROOT, 'docs/podcast');
const eps = [];
for (const f of fs.readdirSync(dir).filter((n) => /^ep\d+.*\.md$/.test(n)).sort()) {
  const s = fs.readFileSync(path.join(dir, f), 'utf8');
  const ep = f.match(/^ep(\d+)/)[1];
  const head = s.match(/^# 에피소드 \d+ — (.+)$/m)?.[1] || '';
  const title0 = s.match(/\*\*유튜브 · 스포티파이 제목:\*\*\s*(.+)/)?.[1]?.trim();
  const description0 = s.match(/\*\*설명:\*\*\s*(.+)/)?.[1]?.trim();
  if (!title0 || !description0) throw new Error(`${f}: 제목 · 설명 줄이 없어요`);
  /* 제목 · 설명에서 줄표(—)를 뺀다(운영자 2026-10-21 「설명을 고쳐야 해」). 설명은 대본의 뜻 · 예문 · 대화를 그대로 담아 한 장으로 — 유튜브 설명란에서 바로 읽히게 */
  const title = title0.replace(/\s—\s/g, ' · ');
  const mean = (s.match(/- 뜻: \*\*(.+?)\*\*/)?.[1] || '').replace(/\.$/, '');
  const ex = [...s.matchAll(/- 예문 \d+[^:]*: "(.+?)"\n\s+→ (.+)/g)].map((m) => `${m[1]}\n${m[2]}`);
  const dia = s.match(/- 대화:\n\s+- A: (.+)\n\s+- B: (.+)/);
  const description = [
    `Learn the Korean idiom ${head}: ${mean}.`,
    '',
    ...(ex.length ? ['Example sentences', ...ex.flatMap((e, i) => (i ? ['', e] : [e])), ''] : []),
    ...(dia ? ['Short dialogue', `A: ${dia[1]}`, `B: ${dia[2]}`, ''] : []),
    'More expressions with meanings, examples and a quiz: https://everykoreans.com (Words > Expressions)',
    '',
    '#Korean #LearnKorean #KoreanIdioms',
  ].join('\n');
  const exprs = [...s.matchAll(/^## [①②③④⑤⑥⑦⑧] (.+?)(?: \(.*\))?$/gm)].map((m) => m[1].trim());
  eps.push({ ep, head, title, description, exprs, tags: ['Korean', 'learn Korean', 'Korean expressions', 'Korean idioms', '한국어', 'TOPIK'] });
}
fs.writeFileSync(path.join(ROOT, 'podcast-episodes.json'), JSON.stringify(eps, null, 1) + '\n');
console.log(`팟캐스트 — 에피소드 ${eps.length}편 → podcast-episodes.json`);
