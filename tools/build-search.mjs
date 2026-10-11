#!/usr/bin/env node
/* 사이트 검색 색인 — 첫 화면의 검색 칸(app.module.js ssSearch)이 읽는 작은 파일 search-index.js 를 만든다.
   운영자 요청(2026-10-02): 「무엇이든 검색하면 배우기 · 단어 · TOPIK 으로 바로」.
   자료 파일을 통째로 받으면 폰에서 수 MB 라, 찾는 데 필요한 글(낱말 · 뜻 · 제목)만 뽑아 둔다.

     node tools/build-search.mjs        (tools/build-pages.mjs 가 끝에 같이 부른다)

   생성물 — 손으로 고치지 않는다. 원본: vocab-topik1/2.js · glossary.js · sentences.js · courses.js · topik-writing.js · blog.js */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const [v1, v2, gl, sb, co, tw, bl] = await Promise.all(['vocab-topik1.js', 'vocab-topik2.js', 'glossary.js', 'sentences.js', 'courses.js',
  'topik-writing.js', 'blog.js'].map(imp));
const tx = (x) => (x && typeof x === 'object' ? [x.ko || '', x.en || ''] : [String(x || ''), '']);
const short = (s, n = 40) => { s = String(s || '').split(/[;/]/)[0].trim().replace(/^to\s+/i, ''); return s.length > n ? s.slice(0, n) : s; };

const words = [], seen = new Set();
for (const w of [...v1.VOCAB, ...v2.VOCAB]) { if (!w.h || seen.has(w.h)) continue; seen.add(w.h);
  const g = short(w.s || w.e), more = String(w.e || '').split(/;/).slice(1).map((x) => x.trim().replace(/^to\s+/i, '')).filter((x) => x && x !== g).join('; ').slice(0, 60);
  words.push(more ? [w.h, g, w.l, more] : [w.h, g, w.l]);   // 4째 칸 = 다른 뜻(영어로 찾을 때 「difficult」가 두 번째 뜻이어도 걸리게 — 도우미 · 첫 화면 검색)
}
const dict = Object.values(gl.GLOSSARY).filter((g) => g.head && !seen.has(g.head)).map((g) => [g.head, short(g.en)]);
const grammar = sb.SB_CATS.flatMap((c) => c.points).map((p) => [p.id, p.name, short(p.desc, 60)]);
const courses = co.COURSES.map((c) => [c.id, ...tx(c.title)]);
const lessons = co.COURSES.flatMap((c) => (c.lessons || []).map((l) => [l.id, ...tx(l.title)]));
const writing = tw.TW_ITEMS.map((x) => [x.id, x.q, x.title || '']);
const blog = bl.BLOG_POSTS.map((p) => [p.id, p.title, p.lang === 'en' ? 'en' : 'ko']);

const out = `/* 사이트 검색 색인 — 생성물(node tools/build-search.mjs). 손으로 고치지 말 것. */\nexport const SEARCH_INDEX = ${JSON.stringify({ words, dict, grammar, courses, lessons, writing, blog })};\n`;
fs.writeFileSync(path.join(ROOT, 'search-index.js'), out);
console.log(`search-index.js — 낱말 ${words.length} · 사전 ${dict.length} · 문법 ${grammar.length} · 코스 ${courses.length} · 레슨 ${lessons.length} · 쓰기 ${writing.length} · 블로그 ${blog.length} (${Math.round(out.length / 1024)}KB)`);
