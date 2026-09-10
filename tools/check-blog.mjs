#!/usr/bin/env node
/* 블로그 글을 한자리에서 본다.

   쓰기: node tools/check-blog.mjs

   굽는 자리(build-pages.mjs)는 **쪽이 깨지는 것**에서 멈춘다. 여기서는
   깨지지는 않지만 나가면 안 되는 것을 본다 — 죽은 링크, 없는 사진,
   alt 안 적은 사진, 갈래가 갈려 서로를 못 찾는 글 같은 것.

   「고쳐야 할 것」이 있으면 종료 코드 1 이다. 「짚어 둘 것」은 사람이
   보고 판단할 자리라 종료 코드를 올리지 않는다. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const { BLOG_POSTS } = await load('blog.js');
const { SB_CATS } = await load('sentences.js');

const IDS = new Set();
for (const c of SB_CATS) for (const p of c.points) IDS.add(p.id);

const bad = [];   // 고쳐야 할 것
const note = [];  // 짚어 둘 것
const seen = new Set();

/* 사이트 안 주소가 실제로 굽히는 파일인지 본다. build-pages.mjs 가 굽는
   쪽이라 저장소에 파일이 있다 — 없으면 404 가 된다. */
const exists = (href) => {
  let q = href.replace(/^\//, '').split('#')[0];
  if (!q) q = 'index.html';
  if (q.endsWith('/')) q += 'index.html';
  return fs.existsSync(path.join(ROOT, q));
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

for (const p of BLOG_POSTS) {
  const at = p?.id ?? '(id 없음)';

  if (!p?.id || !/^[a-z0-9][a-z0-9-]*$/.test(p.id)) bad.push(`${at} — id 는 소문자·숫자·하이픈만`);
  if (seen.has(p.id)) bad.push(`${at} — id 가 겹친다`);
  seen.add(p.id);

  if (!ISO.test(p.date || '')) bad.push(`${at} — date 가 YYYY-MM-DD 가 아니다`);
  if (p.updated && !ISO.test(p.updated)) bad.push(`${at} — updated 가 YYYY-MM-DD 가 아니다`);
  if (ISO.test(p.date || '') && ISO.test(p.updated || '') && p.updated < p.date) {
    bad.push(`${at} — 고친 날(${p.updated})이 낸 날(${p.date})보다 앞이다`);
  }

  if (!p.title) bad.push(`${at} — title 이 없다`);
  else if (p.title.length > 45) note.push(`${at} — 제목이 ${p.title.length}자다. 목록에서 두 줄로 접힌다`);

  if (!p.excerpt) bad.push(`${at} — excerpt 가 없다`);
  else if (p.excerpt.length > 160) note.push(`${at} — 요약이 ${p.excerpt.length}자다. 검색 결과에서 잘린다`);
  else if (p.excerpt.length < 40) note.push(`${at} — 요약이 ${p.excerpt.length}자로 짧다`);

  if (!Array.isArray(p.tags) || !p.tags.length) bad.push(`${at} — tags 가 없다. 「같은 갈래의 글」이 안 걸린다`);

  if (!Array.isArray(p.blocks) && !p.body) bad.push(`${at} — blocks 도 body 도 없다`);
  if (!Array.isArray(p.blocks)) continue;      // 손으로 쓴 예전 글

  let grams = 0;
  for (const [i, b] of p.blocks.entries()) {
    const where = `${at} 의 ${i + 1}번째 블록`;

    /* 날 HTML 이 섞였는지. 모델이 <p> 나 <br> 을 그대로 적어 보내면
       글자로 나가 「<b>」가 화면에 보인다. */
    for (const [k, v] of Object.entries(b)) {
      const vals = Array.isArray(v) ? v : [v];
      for (const one of vals) {
        if (typeof one === 'string' && /<[a-z/!][^>]*>/i.test(one)) {
          bad.push(`${where} — ${k} 에 HTML 태그가 들었다. 굵게는 **이렇게** 로만`);
        }
      }
    }

    if (b.t === 'gram') {
      grams++;
      if (!IDS.has(b.id)) bad.push(`${where} — 문법 표현 ${b.id} 이 sentences.js 에 없다`);
      /* note 에 뜻풀이를 쓰면 우리 자료와 두 번 적히고, 둘이 어긋난다. */
      if (b.note && /(뜻|의미)입니다|을 나타내는 표현|를 나타내는 표현/.test(b.note)) {
        note.push(`${where} — note 가 뜻풀이처럼 보인다. 뜻은 자료에서 붙으니 「왜 보라는지」만`);
      }
    }

    if (b.t === 'link') {
      if (!b.href?.startsWith('/')) bad.push(`${where} — href 는 / 로 시작하는 사이트 안 주소여야 한다`);
      else if (!exists(b.href)) bad.push(`${where} — ${b.href} 가 저장소에 없다. 404 가 된다`);
    }

    if (b.t === 'img') {
      if (!b.alt) bad.push(`${where} — alt 가 없다`);
      else if (/^(사진|이미지|그림|image|photo)$/i.test(b.alt.trim())) {
        bad.push(`${where} — alt 가 「${b.alt}」다. 무엇이 찍혀 있는지 적어야 한다`);
      }
      if (!b.src?.startsWith('/assets/')) bad.push(`${where} — 사진은 /assets/ 밑에 둔다`);
      else {
        const f = path.join(ROOT, b.src.replace(/^\//, ''));
        if (!fs.existsSync(f)) bad.push(`${where} — ${b.src} 파일이 없다`);
        else {
          const kb = Math.round(fs.statSync(f).size / 1024);
          if (kb > 300) note.push(`${where} — ${b.src} 가 ${kb}KB 다. 300KB 아래로 줄이는 것이 좋다`);
        }
      }
    }

    if (b.t === 'dlg') {
      for (const line of b.lines ?? []) {
        if (!/^[AB]:\s*\S/.test(line)) bad.push(`${where} — 대화문 줄은 "A: …" 나 "B: …" 여야 한다 — "${line}"`);
      }
    }
  }

  if (!grams) note.push(`${at} — 문법 카드가 하나도 없다. 글에서 표현 쪽으로 들어갈 데가 없다`);
}

/* 갈래가 갈리면 「같은 갈래의 글」이 서로를 못 찾는다. 한 번만 쓰인 갈래를
   짚어 준다 — 「문법」과 「문법정리」로 갈렸을 때 여기서 보인다. */
const tally = new Map();
for (const p of BLOG_POSTS) for (const t of (p.tags || [])) tally.set(t, (tally.get(t) || 0) + 1);
const lone = [...tally.entries()].filter(([, n]) => n === 1).map(([t]) => t);
if (lone.length) note.push(`한 편에만 쓰인 갈래: ${lone.join(' · ')} — 다른 글과 갈린 것은 아닌지`);

console.log(`글 ${BLOG_POSTS.length}편 · 갈래 ${tally.size}가지`);
if (note.length) { console.log(`\n짚어 둘 것 ${note.length}건`); for (const n of note) console.log('  ·', n); }
if (bad.length)  { console.log(`\n고쳐야 할 것 ${bad.length}건`); for (const b of bad) console.log('  ·', b); }
if (!note.length && !bad.length) console.log('\n이상 없음');
process.exit(bad.length ? 1 : 0);
