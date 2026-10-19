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
  const title = s.match(/\*\*유튜브 · 스포티파이 제목:\*\*\s*(.+)/)?.[1]?.trim();
  const description = s.match(/\*\*설명:\*\*\s*(.+)/)?.[1]?.trim();
  if (!title || !description) throw new Error(`${f}: 제목 · 설명 줄이 없어요`);
  const exprs = [...s.matchAll(/^## [①②③④⑤⑥⑦⑧] (.+?)(?: \(.*\))?$/gm)].map((m) => m[1].trim());
  eps.push({ ep, head, title, description, exprs, tags: ['Korean', 'learn Korean', 'Korean expressions', 'Korean idioms', '한국어', 'TOPIK'] });
}
fs.writeFileSync(path.join(ROOT, 'podcast-episodes.json'), JSON.stringify(eps, null, 1) + '\n');
console.log(`팟캐스트 — 에피소드 ${eps.length}편 → podcast-episodes.json`);
