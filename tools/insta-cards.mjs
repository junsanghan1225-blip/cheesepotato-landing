#!/usr/bin/env node
/* 인스타그램 카드 — 하루 세 게시물(주제별 단어 5개 1개 · 문법 소개 2개)을 우리 자료에서 뽑아 이미지와 캡션으로 만든다.
   운영자 결정(2026-10-01): 「주제별 단어 5가지랑 문법 소개 2가지」, 카드 안의 홍보 단추는 빼고, 글꼴은 사이트와 같은 프리텐다드.

     node tools/insta-cards.mjs                 # 오늘(한국 시간) 하루치
     node tools/insta-cards.mjs 2026-10-02 7    # 그날부터 7일치

   결과: insta/out/<날짜>/{1-word-1.png, …, caption.txt} — 1080×1350(인스타 세로).
   insta/out 은 저장소에 넣지 않는다(.gitignore) — 자료에서 언제든 다시 뽑힌다.
   날마다 고르는 것은 날짜로 정해진다(같은 날을 다시 돌려도 같은 카드). 첫날(2026-10-02)부터 안 겹치게 차례로 간다.
   지어낸 말 없음 — 낱말 · 예문 · 문법 · 문항은 사이트에 실린 그대로. 모양은 사이트 색(베이지 · 짙은 갈색 · 치즈색). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { romanize } from './ko-conj.mjs';
import { grammarMarkRe } from '../grammar-mark.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const { VOCAB, VOCAB_TOPICS } = await imp('vocab-topik1.js');
const { SB_CATS, SB_MORE } = await imp('sentences.js');
const { GRAMMAR_EN } = await imp('grammar-en.js');
const { GRAMMAR_WORDS } = await imp('grammar-words.js');

const START = Date.UTC(2026, 9, 2);   // 첫 게시일 — 이날이 0번째
const todayKst = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const [dateArg = todayKst(), daysArg = '1'] = process.argv.slice(2);

/* 고정된 씨앗으로 섞은 차례 — 날짜 n 이면 n 번째를 쓴다(다 돌면 처음으로) */
function shuffled(list, seed) {
  const a = list.slice(); let h = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/* 주제 — 낱말 사전의 작은 주제 가운데 그 주제가 첫째인 낱말이 10개 넘는 것. 뜻이 추상적인 갈래(기본 동사 · 정도 · 의견 …)는 뺀다 */
const SKIP_TOPIC = /^(function\/|concepts\/(degree|change)|talk\/opinions|feelings\/attitude)/;
const TOPICS = shuffled(VOCAB_TOPICS.flatMap((g) => g.subs.map((t) => ({ ...t, key: `${g.id}/${t.id}` })))
  .filter((t) => !SKIP_TOPIC.test(t.key))
  .map((t) => ({ ...t, words: shuffled(VOCAB.filter((w) => w.t[0] === t.key && w.x?.length && !/\s/.test(w.h)), 11) }))
  .filter((t) => t.words.length >= 10), 11);
const POINTS = SB_CATS.flatMap((c) => c.points.map((p) => ({ ...p, cat: c })));
const GRAMS = [...shuffled(POINTS.filter((p) => p.lv === 'beginner' && GRAMMAR_WORDS[p.id]?.length && GRAMMAR_EN[p.id]), 22),
  ...shuffled(POINTS.filter((p) => p.lv === 'intermediate' && GRAMMAR_WORDS[p.id]?.length && GRAMMAR_EN[p.id]), 23)];
const POS_EN = { 명사: 'noun', 동사: 'verb', 형용사: 'adjective', 부사: 'adverb', 대명사: 'pronoun', 수사: 'number', 관형사: 'determiner', 감탄사: 'interjection' };

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function mark(p, text) {
  const re = grammarMarkRe(p.name), s = String(text || '');
  if (!re) return esc(s);
  let out = '', at = 0;
  for (const m of s.matchAll(re)) { if (!m[0]) continue; out += esc(s.slice(at, m.index)) + `<mark>${esc(m[0])}</mark>`; at = m.index + m[0].length; }
  return out + esc(s.slice(at));
}

/* 글꼴 시안을 비교할 때만: INSTA_CSS=파일 — 그 CSS 를 덧붙인다(평소엔 비움) */
const EXTRA_CSS = process.env.INSTA_CSS ? fs.readFileSync(process.env.INSTA_CSS, 'utf8') : '';
const FONT = pathToFileURL(path.join(ROOT, 'vendor/pretendard.css')).href;
const LOGO = pathToFileURL(path.join(ROOT, 'logo-clear.png')).href;
const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;background:#F2EEE4;font-family:"Pretendard Variable",Pretendard,"Noto Sans KR",sans-serif;color:#1B1512;
  -webkit-font-smoothing:antialiased;overflow:hidden}
.s{position:relative;width:1080px;height:1350px;padding:84px 84px 0;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center}
.tag{display:inline-flex;align-items:center;gap:12px;font-size:30px;font-weight:800;letter-spacing:.02em;padding:14px 26px;border-radius:999px;background:#1B1512;color:#F2EEE4}
.tag i{font-style:normal;color:#F0C24B}
.page{font-size:28px;font-weight:700;color:#8C7A66}
.card{margin-top:44px;background:#fff;border-radius:44px;padding:64px 64px;flex:1;margin-bottom:40px;display:flex;flex-direction:column;
  box-shadow:0 2px 0 rgba(27,21,18,.06)}
.big{font-size:176px;font-weight:900;letter-spacing:-.05em;line-height:1.05}
.rom{font-size:40px;color:#8C7A66;font-style:italic;margin-top:14px}
.en{font-size:58px;font-weight:800;margin-top:44px;line-height:1.25}
.pos{display:inline-block;margin-top:28px;font-size:30px;font-weight:700;color:#4E3E31;background:#FDF0E2;border-radius:999px;padding:10px 24px;align-self:flex-start}
.lv{font-size:30px;font-weight:700;color:#E1682B}
.ex{border-left:10px solid #F0C24B;padding:6px 0 6px 34px;margin-top:40px}
.ex p{font-size:46px;font-weight:700;line-height:1.45;word-break:keep-all}
.ex small{display:block;font-size:31px;color:#8C7A66;margin-top:10px;line-height:1.4}
.h2{font-size:34px;font-weight:800;color:#8C7A66;letter-spacing:.04em}
.gname{font-size:118px;font-weight:900;letter-spacing:-.04em;line-height:1.1;margin-top:18px;word-break:keep-all}
.gdesc{font-size:46px;font-weight:700;margin-top:40px;line-height:1.4;word-break:keep-all}
.gdesc small{display:block;font-size:34px;font-weight:500;color:#8C7A66;margin-top:16px}
.form{margin-top:48px;background:#FBF8F1;border-radius:28px;padding:34px 40px;font-size:38px;line-height:1.5;color:#4E3E31}
mark{background:linear-gradient(transparent 52%,rgba(240,194,75,.75) 52%);color:inherit;padding:0 4px}
.wrow{display:flex;flex-direction:column;gap:30px;margin-top:40px}
.w{background:#FBF8F1;border-radius:28px;padding:30px 38px}
.w b{font-size:40px}.w span{font-size:28px;color:#8C7A66;margin-left:14px}
.w p{font-size:38px;margin-top:10px;line-height:1.4}
.passage{background:#FBF8F1;border-radius:28px;padding:40px 44px;font-size:46px;font-weight:600;line-height:1.55;margin-top:30px;word-break:keep-all}
.q{font-size:40px;font-weight:800;margin-top:44px;line-height:1.4;word-break:keep-all}
.opts{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:40px}
.opts div{border:3px solid rgba(27,21,18,.12);border-radius:24px;padding:26px 30px;font-size:42px;font-weight:700}
.opts div.ok{border-color:#2f8a5b;background:rgba(47,138,91,.1)}
.opts div em{font-style:normal;color:#8C7A66;margin-right:12px}
.why{margin-top:40px;font-size:36px;line-height:1.55;color:#4E3E31;word-break:keep-all}
.hint{margin-top:auto;font-size:34px;font-weight:700;color:#E1682B}
.cta{margin-top:auto;background:#1B1512;color:#fff;border-radius:28px;padding:40px 44px;font-size:42px;font-weight:800;line-height:1.35}
.cta small{display:block;font-size:30px;font-weight:500;color:#F0C24B;margin-top:10px}
.foot{height:118px;display:flex;align-items:center;justify-content:space-between;border-top:2px solid rgba(27,21,18,.1);margin:0 -84px;padding:0 84px}
.brand{display:flex;align-items:center;gap:18px;font-size:36px;font-weight:900;letter-spacing:-.03em}
.brand img{height:62px}
.url{font-size:30px;font-weight:700;color:#8C7A66}
.topic{font-size:120px;font-weight:900;letter-spacing:-.04em;line-height:1.1;margin-top:18px;word-break:keep-all}
.topic small{display:block;font-size:52px;font-weight:700;letter-spacing:0;color:#8C7A66;margin-top:10px}
.list{margin-top:40px;margin-bottom:30px;display:flex;flex-direction:column;gap:14px}
.list div{display:flex;align-items:baseline;gap:22px;background:#FBF8F1;border-radius:22px;padding:22px 32px}
.list b{font-size:46px;font-weight:800}.list span{font-size:32px;color:#8C7A66}
.list em{font-style:normal;font-size:30px;font-weight:800;color:#E1682B;width:40px}`;

const slide = (tag, page, inner) => `<div class="s"><div class="top"><span class="tag">${tag}</span><span class="page">${page}</span></div>` +
  `<div class="card">${inner}</div><div class="foot"><span class="brand"><img src="${LOGO}">치즈감자</span><span class="url">everykoreans.com</span></div></div>`;

/* 주제별 단어 — 표지(주제 + 다섯 낱말) 한 장, 낱말마다 한 장(뜻 · 짧은 예문) */
function wordsPost(t, ws) {
  const tag = '<i>●</i> 주제별 단어 · Words by topic', all = ws.length + 1;
  const ex = (w) => w.x.slice().sort((a, b) => a[0].length - b[0].length)[0];
  const en = (w) => w.s || w.e.split(';')[0];
  return {
    slides: [
      slide(tag, `1 / ${all}`, `<div class="lv">TOPIK I</div><div class="topic">${esc(t.ko)}<small>${esc(t.en)}</small></div>` +
        `<div class="list">${ws.map((w, i) => `<div><em>${i + 1}</em><b>${esc(w.h)}</b><span>${esc(en(w))}</span></div>`).join('')}</div>` +
        '<div class="hint">하나씩 보기 → · Swipe</div>'),
      ...ws.map((w, i) => slide(tag, `${i + 2} / ${all}`, `<div class="lv">${esc(t.ko)} · ${esc(t.en)}</div><div class="big">${esc(w.h)}</div>` +
        `<div class="rom">${esc(romanize(w.h) || '')}</div><div class="en">${esc(en(w))}</div><span class="pos">${esc(w.p)} · ${esc(POS_EN[w.p] || '')}</span>` +
        `<div class="ex" style="margin-top:auto"><p>${esc(ex(w)[0])}</p><small>${esc(ex(w)[1])}</small></div>`)),
    ],
    caption: `주제별 단어 · ${t.ko} (${t.en})\n\n` + ws.map((w, i) => `${i + 1}. ${w.h} (${romanize(w.h) || ''}) — ${en(w)}\n   ${ex(w)[0]}\n   ${ex(w)[1]}`).join('\n') +
      `\n\n💾 저장해 두고 외워 보세요 · Save this post!\n더 많은 단어 · 발음 → 프로필 링크 · More words — link in bio.\n\n` +
      '#한국어 #한국어공부 #learnkorean #koreanwords #koreanvocabulary #topik #studykorean #korean #치즈감자',
  };
}

function grammarPost(p) {
  const en = GRAMMAR_EN[p.id] || {}, more = SB_MORE[p.id] || [], words = GRAMMAR_WORDS[p.id] || [];
  const tag = '<i>●</i> 오늘의 문법 · Grammar';
  const lv = { beginner: '초급 · Beginner', intermediate: '중급 · Intermediate', advanced: '고급 · Advanced' }[p.lv] || '';
  return {
    slides: [
      slide(tag, '1 / 3', `<div class="lv">${lv}</div><div class="gname">${esc(p.name)}</div>` +
        `<div class="gdesc">${esc(p.desc)}<small>${esc(en.desc || '')}</small></div>` +
        `<div class="form">${esc(more[0] || en.form || '')}</div><div class="hint">예문 보기 → · Swipe</div>`),
      slide(tag, '2 / 3', `<div class="h2">예문 · EXAMPLES</div>` +
        [p.ex, more[3]].filter(Boolean).slice(0, 2).map((ex) => `<div class="ex"><p>${mark(p, ex)}</p></div>`).join('') +
        (en.care ? `<div class="form" style="margin-top:auto">⚠️ ${esc(en.care)}</div>` : '')),
      slide(tag, '3 / 3', `<div class="h2">같이 쓰는 말 · WORDS THAT GO WITH IT</div><div class="wrow">` +
        words.slice(0, 3).map(([w, ex, wen]) => `<div class="w"><b>${esc(w)}</b><span>${esc(wen)}</span><p>${mark(p, ex)}</p></div>`).join('') +
        '</div>'),
    ],
    caption: `오늘의 문법 · ${p.name}\n${p.desc}\n${en.desc || ''}\n\n` + [p.ex, more[3]].filter(Boolean).slice(0, 2).map((x) => `• ${x}`).join('\n') +
      `\n\n같이 쓰는 말: ${words.slice(0, 3).map((x) => x[0]).join(' · ')}\n\n` +
      `✍️ 더 많은 예문 · 연습 → 프로필 링크 · More examples — link in bio.\n\n` +
      '#한국어문법 #한국어공부 #koreangrammar #learnkorean #topik #studykorean #korean #치즈감자',
  };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
const [y, m, d] = dateArg.split('-').map(Number);
for (let k = 0; k < Number(daysArg); k++) {
  const t = Date.UTC(y, m - 1, d + k), day = new Date(t).toISOString().slice(0, 10);
  const n = Math.max(0, Math.round((t - START) / 86400e3));
  /* 주제는 날마다 하나씩, 한 바퀴 돌면 그 주제의 다음 다섯 낱말 */
  const tp = TOPICS[n % TOPICS.length], r = Math.floor(n / TOPICS.length) * 5;
  const ws = Array.from({ length: 5 }, (_, i) => tp.words[(r + i) % tp.words.length]);
  const posts = [['1-words', wordsPost(tp, ws)], ['2-grammar', grammarPost(GRAMS[(2 * n) % GRAMS.length])], ['3-grammar', grammarPost(GRAMS[(2 * n + 1) % GRAMS.length])]];
  const dir = path.join(ROOT, 'insta/out', day);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, '.slide.html');
  let caps = `치즈감자 인스타 — ${day}\n프로필 링크: https://everykoreans.com/?utm_source=instagram&utm_medium=social&utm_campaign=daily\n`;
  for (const [name, post] of posts) {
    for (let i = 0; i < post.slides.length; i++) {
      /* setContent 는 about:blank 라 file:// 의 로고 · 글꼴을 못 부른다 — 파일로 써서 연다 */
      fs.writeFileSync(tmp, `<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="${FONT}"><style>${CSS}${EXTRA_CSS}</style></head><body>${post.slides[i]}</body></html>`);
      await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(dir, `${name}-${i + 1}.png`) });
    }
    fs.rmSync(tmp, { force: true });
    caps += `\n━━━━━━━━ ${name} (${post.slides.length}장) ━━━━━━━━\n${post.caption}\n`;
  }
  fs.writeFileSync(path.join(dir, 'caption.txt'), caps);
  console.log(`${day} — 단어(${tp.ko}) ${posts[0][1].slides.length}장 · 문법 ${posts[1][1].slides.length}장 · 문법 ${posts[2][1].slides.length}장 → insta/out/${day}/`);
}
await browser.close();
