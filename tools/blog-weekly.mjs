// 블로그 주간 정리 초안 — 그 주 인스타에 올린 낱말 · 문법 · 오늘의 TOPIK 을 글 한 편으로 묶는다(운영자 결정 2026-10-03).
//
//   node tools/blog-weekly.mjs [--end 2026-10-11]        끝 날(한국 날짜, 비우면 오늘)부터 거꾸로 7일
//
// 매일 자동 글을 찍어 내면 검색에서 「대량 자동 생성」으로 보일 수 있어 **일주일에 한 편, 초안으로만** 만든다.
// blog.js 맨 앞에 글을 넣고 끝난다 — 워크플로(.github/workflows/blog-weekly.yml)가 build-pages · stamp 를 돌려 PR 로 올리고,
// 운영자가 「운영자 한마디」를 채워 달라고 하면 Claude 가 채워 머지한다. 한마디가 비어 있으면 check-blog 가 막는다(OP_NOTE).
// 지어낸 말 없음 — 낱말 · 예문 · 문법 · 문항은 사이트 자료 그대로. TOPIK 문항은 전부 창작(기출 아님).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const todayKst = () => new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
const addDays = (day, n) => { const d = new Date(`${day}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const has = (rel) => fs.existsSync(path.join(ROOT, rel));
export const OP_NOTE = '<!-- 운영자 한마디 -->';

const end = arg('end') || todayKst();
if (!/^\d{4}-\d{2}-\d{2}$/.test(end)) { console.error('날짜는 2026-10-11 꼴로'); process.exit(1); }
const start = addDays(end, -6);
const id = `weekly-korean-${end}`;

const [P, V, S, G, GW, T] = await Promise.all(['insta-pick.js', 'vocab-topik1.js', 'sentences.js', 'grammar-en.js', 'grammar-words.js', 'topik.js'].map(imp));
const pick = P.makePicker({ VOCAB: V.VOCAB, VOCAB_TOPICS: V.VOCAB_TOPICS, SB_CATS: S.SB_CATS, SB_MORE: S.SB_MORE, GRAMMAR_EN: G.GRAMMAR_EN, GRAMMAR_WORDS: GW.GRAMMAR_WORDS, TOPIK_READING: T.TOPIK_READING });
const blogSrc = fs.readFileSync(path.join(ROOT, 'blog.js'), 'utf8');
if (blogSrc.includes(`id: '${id}'`) || blogSrc.includes(`"id": "${id}"`)) { console.log(`이미 있는 글 — ${id}`); process.exit(0); }

const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
const topics = [], grams = [], quiz = [], seen = new Set();
for (const d of days) {
  const x = pick.day(d);
  for (const tp of x.topics) {
    const k = tp.topic.key + tp.words.map((w) => w.h).join();
    if (!seen.has(k)) { seen.add(k); topics.push(tp); }
  }
  if (x.grams[0] && !grams.includes(x.grams[0])) grams.push(x.grams[0]);
  if (x.quiz && !quiz.includes(x.quiz)) quiz.push(x.quiz);
}
const nWords = topics.reduce((n, t) => n + t.words.length, 0);
const md = (day) => { const [, m, dd] = day.split('-').map(Number); return `${m}월 ${dd}일`; };
const C = ['①', '②', '③', '④'];

const wordLink = (h) => (has(`dictionary/${h}.html`) ? `<a href="/dictionary/${encodeURIComponent(h)}.html">${esc(h)}</a>` : esc(h));
const body = [
  `<p>치즈감자 인스타그램(@chesse_p_otato)에 ${md(start)}부터 ${md(end)}까지 올린 낱말 ${nWords}개 · 문법 ${grams.length}개 · TOPIK 연습 ${quiz.length}문제를 한곳에 모았습니다. 한 주를 마무리하며 소리 내어 한 번씩 읽어 보세요.</p>`,
  OP_NOTE,
  '<h2>이번 주 낱말</h2>',
  ...topics.map((tp) => `<h3>${esc(tp.topic.ko)} · ${esc(tp.topic.en)}</h3><ul>` +
    tp.words.map((w) => { const ex = P.wordEx(w); return `<li><b>${wordLink(w.h)}</b> — ${esc(P.wordEn(w))}<br>${esc(ex[0])} <small>(${esc(ex[1])})</small></li>`; }).join('') + '</ul>'),
  '<h2>이번 주 문법</h2>',
  ...grams.map((g) => `<h3>${has(`sentence/${g.id}.html`) ? `<a href="/sentence/${g.id}.html">${esc(g.name)}</a>` : esc(g.name)}</h3>` +
    `<p>${esc(g.desc)}</p>${g.ex ? `<p>예) ${esc(g.ex)}</p>` : ''}`),
  '<h2>이번 주 TOPIK 연습 (기출 아님)</h2>',
  '<p>사이트에서 직접 만든 연습 문제입니다. 실제 시험에 나온 문제가 아닙니다. 정답은 맨 아래에 있어요.</p>',
  ...quiz.map((q, i) => `<h3>문제 ${i + 1}</h3>${q.passage ? `<blockquote>${esc(q.passage)}</blockquote>` : ''}<p><b>${esc(q.question)}</b></p>` +
    `<p>${q.options.map((o, j) => `${C[j]} ${esc(o)}`).join(' · ')}</p>`),
  '<h3>정답</h3><ul>' + quiz.map((q, i) => `<li>문제 ${i + 1}: ${C[q.answer]} ${esc(q.options[q.answer])} — ${esc(q.why)}` +
    (has(`topik-reading/${q.id}.html`) ? ` <a href="/topik-reading/${q.id}.html">풀어 보기 →</a>` : '') + '</li>').join('') + '</ul>',
  '<p>더 많은 낱말 · 문법 · TOPIK 연습은 <a href="/#learn">배우기</a>에서 무료로 할 수 있어요. 매일 새 게시물은 인스타그램 @chesse_p_otato 에 올라옵니다.</p>',
].join('');

const post = {
  id,
  title: `이번 주 한국어 정리 — 낱말 ${nWords}개 · 문법 ${grams.length}개 · TOPIK ${quiz.length}문제 (${md(start)}~${md(end)})`,
  date: end, updated: end,
  tags: ['초급', '문법', 'TOPIK'],
  excerpt: `${md(start)}~${md(end)} 치즈감자 인스타그램에 올린 주제별 낱말 ${nWords}개, 문법 ${grams.length}개, TOPIK 연습 ${quiz.length}문제(기출 아님)를 예문 · 정답과 함께 한 편에 모았습니다.`,
  body,
};
const at = blogSrc.indexOf('export const BLOG_POSTS = [');
if (at < 0) { console.error('blog.js 에서 BLOG_POSTS 를 못 찾았어요'); process.exit(1); }
const cut = at + 'export const BLOG_POSTS = ['.length;
const js = `\n  /* 주간 정리 — tools/blog-weekly.mjs 가 만든 초안. 운영자 한마디(${OP_NOTE})를 채운 뒤 머지한다 */\n  ${JSON.stringify(post, null, 2).replace(/\n/g, '\n  ')},`;
fs.writeFileSync(path.join(ROOT, 'blog.js'), blogSrc.slice(0, cut) + js + blogSrc.slice(cut));
console.log(`✓ 초안 — ${post.title}`);
