#!/usr/bin/env node
/* Gemini 에게 받은 블로그 글을 blog.js 맨 앞에 끼워 넣는다.

   쓰기: node tools/blog-merge.mjs 받은것.json
         node tools/blog-merge.mjs 받은것.json --dry   (넣지 않고 보기만)

   BLOG_POSTS 를 통째로 다시 찍지 않고 여는 대괄호 바로 뒤에 끼운다.
   위에 왜 이런 모양인지가 길게 적혀 있는데 다시 찍으면 그게 날아가고,
   손으로 쓴 예전 글의 줄바꿈도 다 뭉개진다.

   여기서는 **막을 것만** 본다 — 모양이 아니라 파일이 깨지는 것들
   (id 겹침, 홑따옴표, 모르는 블록). 나머지 검사는 넣은 뒤에
   tools/check-blog.mjs 가 한자리에서 본다. 두 군데서 같은 것을 보면
   한쪽만 고치게 된다. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'blog.js');
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const SRC = args.find((a) => !a.startsWith('--'));

if (!SRC) {
  console.error('쓰기: node tools/blog-merge.mjs 받은것.json [--dry]');
  process.exit(1);
}

/* 모델은 ```json 울타리를 잘 붙인다. 벗겨 준다. */
const raw = fs.readFileSync(SRC, 'utf8').trim()
  .replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
let got;
try { got = JSON.parse(raw); } catch (e) { console.error('JSON 이 아니다:', e.message); process.exit(1); }

/* 하나만 시켰지만 배열로 싸서 주는 경우가 있다. 둘 다 받는다. */
const posts = Array.isArray(got) ? got : [got];

const { BLOG_POSTS } = await import(pathToFileURL(FILE).href);
const have = new Set(BLOG_POSTS.map((p) => p.id));

const KNOWN = new Set(['p', 'h', 'quote', 'list', 'ex', 'dlg', 'gram', 'link', 'note', 'img']);
const stop = [];

for (const p of posts) {
  const at = p?.id ?? '(id 없음)';
  if (!p?.id || !/^[a-z0-9][a-z0-9-]*$/.test(p.id)) stop.push(`${at} — id 는 소문자·숫자·하이픈만`);
  else if (have.has(p.id)) stop.push(`${at} — 이미 있는 id 다`);
  if (!p?.title) stop.push(`${at} — title 이 없다`);
  if (!Array.isArray(p?.blocks) || !p.blocks.length) stop.push(`${at} — blocks 배열이 없다`);
  for (const [i, b] of (p?.blocks ?? []).entries()) {
    if (!KNOWN.has(b?.t)) stop.push(`${at} — ${i + 1}번째 블록이 모르는 종류다: ${JSON.stringify(b?.t)}`);
  }
  /* 홑따옴표로 감싸 넣으므로 안에 있으면 코드가 깨진다. 역슬래시도 같다. */
  const flat = JSON.stringify(p);
  if (flat.includes("'")) stop.push(`${at} — 홑따옴표가 들었다. 「 」 로 바꿔라`);
  if (flat.includes('\\\\')) stop.push(`${at} — 역슬래시가 들었다`);
}

if (stop.length) {
  console.error('넣지 않았다:');
  for (const s of stop) console.error('  ·', s);
  process.exit(1);
}

/* blog.js 의 여는 대괄호 바로 뒤에 끼운다. 최신이 앞이라 맨 앞이다. */
const OPEN = 'export const BLOG_POSTS = [\n';
const src = fs.readFileSync(FILE, 'utf8');
const at = src.indexOf(OPEN);
if (at < 0) { console.error('blog.js 에서 BLOG_POSTS 를 못 찾았다'); process.exit(1); }

/* 손으로 쓴 글과 같은 모양으로 찍는다. JSON.stringify 의 겹따옴표 대신
   홑따옴표를 쓰는 것이 이 저장소 관례라, 키와 값을 직접 찍는다. */
const q = (s) => `'${String(s)}'`;
const blockLine = (b) => {
  const parts = Object.entries(b).map(([k, v]) => {
    if (Array.isArray(v)) return `${k}: [${v.map(q).join(', ')}]`;
    if (typeof v === 'boolean' || typeof v === 'number') return `${k}: ${v}`;
    return `${k}: ${q(v)}`;
  });
  return `      { ${parts.join(', ')} },`;
};
const render = (p) => [
  '  {',
  `    id: ${q(p.id)},`,
  `    title: ${q(p.title)},`,
  `    date: ${q(p.date)},`,
  `    updated: ${q(p.updated || p.date)},`,
  `    tags: [${(p.tags || []).map(q).join(', ')}],`,
  `    excerpt: ${q(p.excerpt)},`,
  '    blocks: [',
  ...p.blocks.map(blockLine),
  '    ],',
  '  },',
  '',
].join('\n');

const out = posts.map(render).join('');
if (DRY) { console.log(out); process.exit(0); }

fs.writeFileSync(FILE, src.slice(0, at + OPEN.length) + out + src.slice(at + OPEN.length));
console.log(`글 ${posts.length}편을 blog.js 맨 앞에 넣었다 — ${posts.map((p) => p.id).join(', ')}`);
console.log('다음: node tools/check-blog.mjs && node tools/build-pages.mjs && node tools/stamp.mjs');
