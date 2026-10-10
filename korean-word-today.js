/* 오늘의 한국어 단어 카드(운영자 2026-10-10 「E」). 손으로 쓴 쪽 korean-word-today/ 의 손잡이.
   TOPIK I 낱말(vocab-topik1.js — 뜻 · 예문은 우리 자료) 중 1 · 2급에서 날마다 하나(모두에게 같은 낱말 — 날짜로 고름),
   「다른 단어」로 더 보기. 오늘의 단어(wotd.js)는 옛 사전 뜻이 섞여 있어 쓰지 않는다. */
import { VOCAB } from '/vocab-topik1.js';

const K = window.cpCard;
const $ = (id) => document.getElementById(id);
const POOL = VOCAB.filter((w) => w.l <= 2 && w.e && w.x && w.x.length);
const POS = { 명사: 'noun', 동사: 'verb', 형용사: 'adjective', 부사: 'adverb', 대명사: 'pronoun', 수사: 'number', 관형사: 'determiner', 감탄사: 'interjection', 의존명사: 'bound noun', 조사: 'particle' };
// 날짜 → 차례: 하루에 하나씩, 같은 날은 누구나 같은 낱말(섞은 차례로 — 가나다 순으로 나오지 않게)
const dayNo = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
const todayIdx = (dayNo * 7919) % POOL.length;
let cur = null, url = null;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function show(w, isToday) {
  cur = w;
  $('wdH').textContent = w.h;
  $('wdR').textContent = `${K.roman(w.h)}${POS[w.p] ? ` · ${POS[w.p]}` : ''}`;
  $('wdE').textContent = w.e;
  $('wdX').innerHTML = `${esc(w.x[0][0])}<small>${esc(w.x[0][1])}</small>`;
  $('wdTag').textContent = isToday ? 'Today’s word' : 'Another word';
  $('wdAfter').hidden = true;
  draw();
}
async function card(w) {
  try { await document.fonts.ready; } catch (e) {}
  const c = K.canvas(), g = c.getContext('2d'), W = 1080;
  g.fillStyle = '#F6EFE2'; g.fillRect(0, 0, W, 1920);
  g.textAlign = 'center';
  g.fillStyle = '#1B1512'; g.font = `700 54px ${K.FONT}`; g.fillText('Korean word of the day', W / 2, 270);
  const d = new Date(); g.fillStyle = '#8C7A66'; g.font = `600 40px ${K.FONT}`; g.fillText(`오늘의 단어 · ${d.getMonth() + 1}월 ${d.getDate()}일`, W / 2, 335);
  // 단어 카드 — 흰 종이, 위에 주황 띠
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect ? g.roundRect(100, 430, W - 200, 1000, 44) : g.rect(100, 430, W - 200, 1000); g.fill();
  g.fillStyle = '#FF914D'; g.beginPath(); g.roundRect ? g.roundRect(100, 430, W - 200, 26, [44, 44, 0, 0]) : g.rect(100, 430, W - 200, 26); g.fill();
  let fs = 210; g.font = `800 ${fs}px ${K.FONT}`; while (g.measureText(w.h).width > W - 300 && fs > 90) { fs -= 10; g.font = `800 ${fs}px ${K.FONT}`; }
  g.fillStyle = '#1B1512'; g.fillText(w.h, W / 2, 700);
  g.fillStyle = '#8C7A66'; g.font = `600 44px ${K.FONT}`; g.fillText(`${K.roman(w.h)}${POS[w.p] ? ` · ${POS[w.p]}` : ''}`, W / 2, 790);
  g.fillStyle = '#C8102E'; g.font = `800 64px ${K.FONT}`; let y = K.para(g, w.e, W / 2, 910, W - 300, 78);
  g.fillStyle = '#E2D4BF'; g.fillRect(W / 2 - 60, y + 10, 120, 4);
  // 예문 — 길면 줄이기
  let es = 46, el; for (;;) { g.font = `700 ${es}px ${K.FONT}`; el = K.lines(g, w.x[0][0], W - 300); if (el.length <= 3 || es <= 34) break; es -= 4; }
  y += 100; g.fillStyle = '#1B1512'; for (const s of el) { g.fillText(s, W / 2, y); y += es * 1.35; }
  g.fillStyle = '#8C7A66'; g.font = `500 34px ${K.FONT}`; K.para(g, w.x[0][1], W / 2, y + 10, W - 300, 46);
  g.fillStyle = '#8C7A66'; g.font = `600 38px ${K.FONT}`; g.fillText('One word a day 🥔🧀', W / 2, 1640);
  g.fillStyle = '#C4551C'; g.font = `800 44px ${K.FONT}`; g.fillText('everykoreans.com/korean-word-today', W / 2, 1710);
  return K.blob(c);
}
async function draw() { const me = cur, b = await card(me); if (cur !== me || !b) return; if (url) URL.revokeObjectURL(url); $('wdImg').src = url = URL.createObjectURL(b); }
$('wdMore').addEventListener('click', () => show(POOL[Math.floor(Math.random() * POOL.length)], false));
$('wdToday').addEventListener('click', () => show(POOL[todayIdx], true));
$('wdSave').addEventListener('click', async () => { if (cur) K.save(await card(cur), 'korean-word-of-the-day', `Korean word of the day: ${cur.h} — ${cur.e} · everykoreans.com/korean-word-today`, 'wdAfter'); });
show(POOL[todayIdx], true);
