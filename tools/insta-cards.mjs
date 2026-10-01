#!/usr/bin/env node
/* 인스타그램 카드 — 하루 세 게시물(단어 · 문법 · TOPIK 퀴즈)을 우리 자료에서 뽑아 이미지와 캡션으로 만든다.
   운영자 요청(2026-10-01): 「하루에 세 개씩, 단어 / 문법 / 우리 자료로 정형화된 느낌」.

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
const { VOCAB } = await imp('vocab-topik1.js');
const { SB_CATS, SB_MORE } = await imp('sentences.js');
const { GRAMMAR_EN } = await imp('grammar-en.js');
const { GRAMMAR_WORDS } = await imp('grammar-words.js');
const { TOPIK_READING } = await imp('topik.js');

const START = Date.UTC(2026, 9, 2);   // 첫 게시일 — 이날이 0번째
const todayKst = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const [dateArg = todayKst(), daysArg = '1'] = process.argv.slice(2);

/* 고정된 씨앗으로 섞은 차례 — 날짜 n 이면 n 번째를 쓴다(다 돌면 처음으로) */
function shuffled(list, seed) {
  const a = list.slice(); let h = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/* 고를 것 — 초급이 먼저 오게(인스타 보는 사람 대부분이 입문 · 초급) */
const WORDS = shuffled(VOCAB.filter((w) => w.l <= 2 && w.x?.length >= 2 && !/\s/.test(w.h)), 11);
const POINTS = SB_CATS.flatMap((c) => c.points.map((p) => ({ ...p, cat: c })));
const GRAMS = [...shuffled(POINTS.filter((p) => p.lv === 'beginner' && GRAMMAR_WORDS[p.id]?.length && GRAMMAR_EN[p.id]), 22),
  ...shuffled(POINTS.filter((p) => p.lv === 'intermediate' && GRAMMAR_WORDS[p.id]?.length && GRAMMAR_EN[p.id]), 23)];
const QUIZ = shuffled(TOPIK_READING.filter((q) => q.exam === 'I' && ['theme', 'blank'].includes(q.type) && q.passage.length <= 60), 33);
const POS_EN = { 명사: 'noun', 동사: 'verb', 형용사: 'adjective', 부사: 'adverb', 대명사: 'pronoun', 수사: 'number', 관형사: 'determiner', 감탄사: 'interjection' };

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function mark(p, text) {
  const re = grammarMarkRe(p.name), s = String(text || '');
  if (!re) return esc(s);
  let out = '', at = 0;
  for (const m of s.matchAll(re)) { if (!m[0]) continue; out += esc(s.slice(at, m.index)) + `<mark>${esc(m[0])}</mark>`; at = m.index + m[0].length; }
  return out + esc(s.slice(at));
}

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
.url{font-size:30px;font-weight:700;color:#8C7A66}`;

const slide = (tag, page, inner) => `<div class="s"><div class="top"><span class="tag">${tag}</span><span class="page">${page}</span></div>` +
  `<div class="card">${inner}</div><div class="foot"><span class="brand"><img src="${LOGO}">치즈감자</span><span class="url">everykoreans.com</span></div></div>`;

function wordPost(w) {
  const rom = romanize(w.h) || '';
  const tag = '<i>●</i> 오늘의 단어 · Word of the day';
  return {
    slides: [
      slide(tag, '1 / 2', `<div class="lv">TOPIK I · ${w.l}급</div><div class="big">${esc(w.h)}</div><div class="rom">${esc(rom)}</div>` +
        `<div class="en">${esc(w.s || w.e.split(';')[0])}</div><span class="pos">${esc(w.p)} · ${esc(POS_EN[w.p] || '')}</span>` +
        '<div class="hint">예문 보기 → · Swipe for examples</div>'),
      slide(tag, '2 / 2', `<div class="h2">예문 · EXAMPLES</div>` +
        w.x.slice(0, 2).map(([ko, en]) => `<div class="ex"><p>${esc(ko)}</p><small>${esc(en)}</small></div>`).join('') +
        `<div class="cta">🔊 발음 듣고 단어장에 담기<small>Hear it & save it — free at everykoreans.com</small></div>`),
    ],
    caption: `오늘의 단어 · ${w.h} (${rom})\n= ${w.e}\n\n` + w.x.slice(0, 2).map(([ko, en]) => `• ${ko}\n  ${en}`).join('\n') +
      `\n\n🔊 발음 듣기 · 단어장에 담기 · 2분 레벨 테스트 → 프로필 링크\nHear it, save it, and test your level — link in bio.\n\n` +
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
        `</div><div class="cta">블록 맞추기 · 바꿔 쓰기 · 맞춤법 검사<small>Practice ${esc(p.name)} free at everykoreans.com</small></div>`),
    ],
    caption: `오늘의 문법 · ${p.name}\n${p.desc}\n${en.desc || ''}\n\n` + [p.ex, more[3]].filter(Boolean).slice(0, 2).map((x) => `• ${x}`).join('\n') +
      `\n\n같이 쓰는 말: ${words.slice(0, 3).map((x) => x[0]).join(' · ')}\n\n` +
      `✍️ 직접 연습하기 → 프로필 링크 · Practice it free — link in bio.\n\n` +
      '#한국어문법 #한국어공부 #koreangrammar #learnkorean #topik #studykorean #korean #치즈감자',
  };
}

const NUM = ['①', '②', '③', '④'];
function quizPost(q) {
  const tag = '<i>●</i> TOPIK 퀴즈 · Quiz';
  const opts = (show) => `<div class="opts">${q.options.map((o, i) => `<div class="${show && i === q.answer ? 'ok' : ''}"><em>${NUM[i]}</em>${esc(o)}</div>`).join('')}</div>`;
  return {
    slides: [
      slide(tag, '1 / 2', `<div class="lv">TOPIK I · ${q.slot}번 유형</div><div class="q">${esc(q.question)}</div>` +
        `<div class="passage">${esc(q.passage)}</div>${opts(false)}<div class="hint">정답은 다음 장 → · Answer on the next slide</div>`),
      slide(tag, '2 / 2', `<div class="h2">정답 · ANSWER</div>${opts(true)}<div class="why">${esc(q.why)}</div>` +
        `<div class="cta">TOPIK 연습 979문제 · 모의고사 무료<small>Free TOPIK practice at everykoreans.com</small></div>`),
    ],
    caption: `TOPIK 퀴즈 🧀 정답은 몇 번일까요? 댓글로 남겨 주세요!\nWhich one is correct? Comment your answer!\n\n${q.question}\n${q.passage}\n` +
      q.options.map((o, i) => `${NUM[i]} ${o}`).join('  ') +
      `\n\n(정답 · 해설은 두 번째 장 · Answer on slide 2)\n※ 치즈감자가 만든 연습 문제예요(기출 아님).\n\n📚 TOPIK 연습 · 모의고사 무료 → 프로필 링크\n\n` +
      '#TOPIK #토픽 #한국어능력시험 #learnkorean #koreanquiz #studykorean #korean #치즈감자',
  };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
const [y, m, d] = dateArg.split('-').map(Number);
for (let k = 0; k < Number(daysArg); k++) {
  const t = Date.UTC(y, m - 1, d + k), day = new Date(t).toISOString().slice(0, 10);
  const n = Math.max(0, Math.round((t - START) / 86400e3));
  const posts = [['1-word', wordPost(WORDS[n % WORDS.length])], ['2-grammar', grammarPost(GRAMS[n % GRAMS.length])], ['3-quiz', quizPost(QUIZ[n % QUIZ.length])]];
  const dir = path.join(ROOT, 'insta/out', day);
  fs.mkdirSync(dir, { recursive: true });
  let caps = `치즈감자 인스타 — ${day}\n프로필 링크: https://everykoreans.com/?utm_source=instagram&utm_medium=social&utm_campaign=daily\n`;
  for (const [name, post] of posts) {
    for (let i = 0; i < post.slides.length; i++) {
      await page.setContent(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="${FONT}"><style>${CSS}</style></head><body>${post.slides[i]}</body></html>`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(dir, `${name}-${i + 1}.png`) });
    }
    caps += `\n━━━━━━━━ ${name} (${post.slides.length}장) ━━━━━━━━\n${post.caption}\n`;
  }
  fs.writeFileSync(path.join(dir, 'caption.txt'), caps);
  console.log(`${day} — 단어 ${posts[0][1].slides.length}장 · 문법 ${posts[1][1].slides.length}장 · 퀴즈 ${posts[2][1].slides.length}장 → insta/out/${day}/`);
}
await browser.close();
