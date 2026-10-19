#!/usr/bin/env node
// 블로그 「오늘의 문법 4개」 초안 — 우리 사이트의 문법 자료(sentences · grammar-en · grammar-usage)를 소개하는 글 한 편(운영자 2026-10-19 「하루에 4개씩 · 우리 자료로 소개하는 느낌」).
//
//   node tools/blog-grammar.mjs [--date 2026-10-20] [--count 4]
//
// 한 편에 문법 4개(하루 1편). 이미 올린 「grammar-daily-」 글 수 × 4 번째부터 차례로 잡는다(290개를 한 바퀴 — 날짜가 비어도 순서가 어긋나지 않는다).
// blog.js 맨 앞에 초안을 넣고 끝난다 — 워크플로(.github/workflows/blog-grammar.yml)가 build-pages · stamp 를 돌려 PR 로 올리고,
// 운영자가 「운영자 한마디」를 알려 주면 Claude 가 채워 머지한다(비어 있으면 check-blog 가 막는다 — blog-weekly 와 같은 약속).
// 지어낸 말 없음 — 뜻 · 예문 · 대화 · 영어 설명은 사이트 자료 그대로.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const todayKst = () => new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const has = (rel) => fs.existsSync(path.join(ROOT, rel));
const OP_NOTE = '<!-- 운영자 한마디 -->';

const date = arg('date') || todayKst();
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { console.error('날짜는 2026-10-20 꼴로'); process.exit(1); }
const COUNT = Math.max(1, Math.min(6, Number(arg('count', 4)) || 4));
const id = `grammar-daily-${date}`;
const md = (day) => { const [, m, dd] = day.split('-').map(Number); return `${m}월 ${dd}일`; };

const [S, GE, GU] = await Promise.all(['sentences.js', 'grammar-en.js', 'grammar-usage.js'].map(imp));
const blogSrc = fs.readFileSync(path.join(ROOT, 'blog.js'), 'utf8');
if (blogSrc.includes(`id: '${id}'`) || blogSrc.includes(`"id": "${id}"`)) { console.log(`이미 있는 글 — ${id}`); process.exit(0); }

const all = [];
for (const c of S.SB_CATS) for (const p of c.points) if (p.id && p.name && p.desc) all.push({ ...p, cat: c.ko });
const done = (blogSrc.match(/["']?id["']?: ["']grammar-daily-/g) || []).length;   // 이미 올린 글 수
const picked = Array.from({ length: COUNT }, (_, i) => all[(done * COUNT + i) % all.length]);

const LV = { beginner: '초급', intermediate: '중급', advanced: '고급' };
const mark = (g) => (has(`sentence/${g.id}.html`) ? `<a href="/sentence/${g.id}.html">${esc(g.name)}</a>` : esc(g.name));
const section = (g) => {
  const en = GE.GRAMMAR_EN[g.id] || {};
  const more = Array.isArray(g.more) ? g.more : [];
  const exs = [g.ex, typeof more[3] === 'string' ? more[3] : ''].filter(Boolean);
  const use = (GU.GRAMMAR_USAGE?.[g.id] || []).filter((r) => r[0]).slice(0, 2);
  const out = [`<h2>${mark(g)} <small>(${esc(LV[g.lv] || '')} · ${esc(g.cat)})</small></h2>`, `<p>${esc(g.desc)}</p>`];
  if (en.desc) out.push(`<p><b>In English</b> — ${esc(en.desc)}</p>`);
  if (en.form || more[0]) out.push(`<p><b>모양 · Form</b> — ${esc(en.form || more[0])}</p>`);
  if (exs.length || use.length) {
    out.push('<h3>예문</h3><ul>' + exs.map((e) => `<li>${esc(e)}</li>`).join('') +
      use.map((r) => `<li>${esc(r[0])} <small>(${esc(r[2] || '연습 문장')})</small></li>`).join('') + '</ul>');
  }
  if (Array.isArray(g.dlg) && g.dlg.length) out.push('<h3>이렇게 말해요</h3><p>' + g.dlg.map(esc).join('<br>') + '</p>');
  if (en.care) out.push(`<p><b>주의 · Careful</b> — ${esc(en.care)}</p>`);
  if (has(`sentence/${g.id}.html`)) out.push(`<p><a href="/sentence/${g.id}.html">${esc(g.name)} — 예문 · 연습 더 보기 →</a></p>`);
  return out.join('');
};

const names = picked.map((g) => g.name);
const body = [
  `<p>치즈감자 사이트에 있는 문법 자료로 오늘의 문법 ${COUNT}개를 소개합니다. 뜻 · 모양 · 예문 · 대화를 한곳에 모았고, 문법마다 사이트의 그 문법 쪽으로 이어집니다.</p>`,
  OP_NOTE,
  ...picked.map(section),
  '<p>더 많은 문법과 연습은 <a href="/#learn">배우기</a>에서 무료로 할 수 있어요.</p>',
].join('');

const post = {
  id,
  title: `오늘의 문법 ${COUNT}개 — ${names.join(' · ')} (${md(date)})`,
  date, updated: date,
  tags: ['문법', ...new Set(picked.map((g) => LV[g.lv]).filter(Boolean))],
  excerpt: `${md(date)}의 한국어 문법 ${COUNT}개 — ${names.join(', ')}. 뜻 · 모양 · 예문 · 대화를 치즈감자 문법 자료로 소개합니다.`,
  body,
};
const at = blogSrc.indexOf('export const BLOG_POSTS = [');
if (at < 0) { console.error('blog.js 에서 BLOG_POSTS 를 못 찾았어요'); process.exit(1); }
const cut = at + 'export const BLOG_POSTS = ['.length;
const js = `\n  /* 오늘의 문법 — tools/blog-grammar.mjs 가 만든 초안. 운영자 한마디(${OP_NOTE})를 채운 뒤 머지한다 */\n  ${JSON.stringify(post, null, 2).replace(/\n/g, '\n  ')},`;
fs.writeFileSync(path.join(ROOT, 'blog.js'), blogSrc.slice(0, cut) + js + blogSrc.slice(cut));
console.log(`✓ 초안 — ${post.title}`);
