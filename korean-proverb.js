/* 오늘의 한국어 포춘쿠키(운영자 2026-10-10 「귀엽고 한국적인 디지털 콘텐츠」 3번). 손으로 쓴 쪽 korean-proverb/ 의 손잡이.
   쿠키를 누르면 우리 속담 150개(expressions.js — 안티 · Claude 검토 자료) 중 하나 + 뜻 · 비슷한 영어 말 · 예문, 그리고 스토리 카드.
   하루에 하나가 기본(뽑은 것을 그날 날짜로 기억 — 다시 와도 같은 쿠키), 「하나 더」로 새로 뽑을 수 있다. */
import { EXPR } from '/expressions.js';

const K = window.cpCard;
const $ = (id) => document.getElementById(id);
const PV = EXPR.filter((x) => x.ty === 'proverb');
const day = (() => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; })();
const KEY = 'cp_fortune';
let cur = null, url = null;

function remember(id) { try { localStorage.setItem(KEY, JSON.stringify({ day, id })); } catch (e) {} }
function today() { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && v.day === day) return PV.find((x) => x.id === v.id) || null; } catch (e) {} return null; }
const pick = () => PV[Math.floor(Math.random() * PV.length)];

function show(p) {
  cur = p;
  $('pvH').textContent = p.h;
  $('pvR').textContent = K.roman(p.h).replace(/\s+/g, ' ');
  $('pvM').innerHTML = `<b>${esc(cap(p.en))}</b>${p.eq && p.eq !== p.en ? ` <span class="note">≈ “${esc(p.eq)}”</span>` : ''}`;
  $('pvLit').textContent = p.lit ? `Word for word: ${p.lit}` : '';
  const ex = p.ex && p.ex[0];
  $('pvEx').innerHTML = ex ? `${esc(ex[0])}<small>${esc(ex[1])}</small>` : '';
  $('pvEx').hidden = !ex;
  $('pvOut').hidden = false; $('pvAfter').hidden = true;
  $('pvTip').textContent = 'Your cookie for today 🥠 — come back tomorrow for a new one.';
  draw(p);
}
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);

async function card(p) {
  try { await document.fonts.ready; } catch (e) {}
  const c = K.canvas(), g = c.getContext('2d'), W = 1080;
  g.fillStyle = '#FBE9D0'; g.fillRect(0, 0, W, 1920);
  // 쪽지 — 흰 종이에 빨간 테두리 두 줄(옛 부적 · 복주머니 느낌)
  g.fillStyle = '#FFFDF8'; g.beginPath(); g.roundRect ? g.roundRect(90, 520, W - 180, 940, 28) : g.rect(90, 520, W - 180, 940); g.fill();
  g.strokeStyle = '#C8102E'; g.lineWidth = 8; g.strokeRect(118, 548, W - 236, 884);
  g.lineWidth = 3; g.strokeRect(136, 566, W - 272, 848);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#1B1512'; g.font = `700 54px ${K.FONT}`; g.fillText('My Korean fortune today', W / 2, 235);
  g.fillStyle = '#8C7A66'; g.font = `600 40px ${K.FONT}`; g.fillText('오늘의 한국어 포춘쿠키', W / 2, 300);
  g.textBaseline = 'middle'; g.font = `120px ${K.EMOJI}`; g.fillText('🥠', W / 2, 410); g.textBaseline = 'alphabetic';
  // 속담 — 쪽지 안(위 600 ~ 아래 1380)에 위에서부터 쌓는다. 길면 속담 글자부터 줄이고, 그래도 넘치면 영어 글자를 줄인다
  const fit = (fs, es) => {
    g.font = `800 ${fs}px ${K.FONT}`; const ls = K.lines(g, p.h, W - 340);
    g.font = `600 30px ${K.FONT}`; const rs = K.lines(g, K.roman(p.h), W - 340);
    g.font = `700 ${es}px ${K.FONT}`; const es1 = K.lines(g, cap(p.en), W - 340);
    g.font = `500 36px ${K.FONT}`; const eq = p.eq && p.eq !== p.en ? K.lines(g, `≈ “${p.eq}”`, W - 340) : [];
    const h = ls.length * fs * 1.25 + rs.length * 40 + 70 + es1.length * es * 1.3 + eq.length * 48 + 20;
    return { ls, rs, es1, eq, h };
  };
  let fs = 88, es = 46, L = fit(fs, es);
  while (L.h > 760 && fs > 52) { fs -= 6; L = fit(fs, es); }
  while (L.h > 760 && es > 32) { es -= 4; L = fit(fs, es); }
  let y = 610 + (780 - L.h) / 2 + fs;   // 남는 자리는 위아래로 나눠 가운데에
  g.fillStyle = '#C8102E'; g.font = `800 ${fs}px ${K.FONT}`; for (const l of L.ls) { g.fillText(l, W / 2, y); y += fs * 1.25; }
  g.fillStyle = '#8C7A66'; g.font = `600 30px ${K.FONT}`; y -= fs * 0.25; for (const l of L.rs) { g.fillText(l, W / 2, y); y += 40; }
  g.fillStyle = '#E2D4BF'; g.fillRect(W / 2 - 60, y, 120, 4); y += 70;
  g.fillStyle = '#1B1512'; g.font = `700 ${es}px ${K.FONT}`; for (const l of L.es1) { g.fillText(l, W / 2, y); y += es * 1.3; }
  g.fillStyle = '#4E3E31'; g.font = `500 36px ${K.FONT}`; y += 10; for (const l of L.eq) { g.fillText(l, W / 2, y); y += 48; }
  g.fillStyle = '#8C7A66'; g.font = `600 38px ${K.FONT}`; g.fillText("Crack yours 🥔🧀", W / 2, 1640);
  g.fillStyle = '#C4551C'; g.font = `800 44px ${K.FONT}`; g.fillText('everykoreans.com/korean-proverb', W / 2, 1710);
  return K.blob(c);
}
async function draw(p) {
  const b = await card(p); if (cur !== p || !b) return;
  if (url) URL.revokeObjectURL(url);
  $('pvImg').src = url = URL.createObjectURL(b);
}

function open(fresh) {
  const ck = $('pvCookie'); ck.classList.remove('crack'); void ck.offsetWidth; ck.classList.add('crack');
  const p = (!fresh && today()) || pick();
  remember(p.id);
  setTimeout(() => show(p), 350);
}
$('pvCookie').addEventListener('click', () => open(false));
$('pvMore').addEventListener('click', () => open(true));
$('pvSave').addEventListener('click', async () => { if (cur) K.save(await card(cur), 'my-korean-fortune', `My Korean fortune today: ${cur.h} — everykoreans.com/korean-proverb`, 'pvAfter'); });
const t0 = today(); if (t0) show(t0);
