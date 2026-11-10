#!/usr/bin/env node
/* 데드클릭 찾기(운영자 2026-11-10 「데드클릭 잡으면 바로 수정 · 1%까지」) — Clarity 는 「몇 번」만 주고 「어느 요소」는 안 준다.
   그래서 폰 폭(390)으로 주요 화면을 열어 「눌릴 것처럼 생겼는데 눌러도 아무 일 없는 것」을 찾는다.
     node tools/dead-click-audit.mjs [기본주소=http://localhost:8765]
   찾는 것 세 가지:
     A. 손가락 커서(cursor:pointer)인데 눌러도 화면 · 주소가 안 바뀌는 것(가장 확실한 데드클릭)
     B. 단추 · 카드처럼 생겼는데(테두리/바탕 + 둥근 모서리, 짧은 글) 링크 · 단추가 아닌 것
     C. 링크 밖에 있는 큰 그림(사람들이 그림을 누른다) · 「→」가 붙었는데 링크가 아닌 글
   결과는 화면마다 표로 찍는다 — B · C 는 사람이 보고 고를 후보다. */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765';
const PAGES = [
  ['첫 화면', '/'], ['쓰기 첫 쪽', '/topik-writing/'], ['쓰기 문항 쪽', '/topik-writing/w53-1.html'], ['쓰기(앱)', '/#learn/topik/II/writing'],
  ['TOPIK 준비', '/#learn/topik'], ['배우기', '/#learn'], ['단어', '/#words'], ['구독', '/#pro'], ['레벨 테스트', '/?lt=1'],
  ['상점', '/shop/'], ['책 쪽', '/shop/topik2-writing-51-52/'], ['요금', '/pricing.html'], ['소개', '/about.html'],
  ['블로그 글', '/blog/go-vs-aseo.html'], ['문법 쪽', '/sentence/63-1.html'], ['사전 쪽', '/dictionary/%EA%B0%80%EB%8A%A5.html'], ['학습지', '/worksheets/'],
];
const b = await chromium.launch();
let total = 0;
for (const [name, path] of PAGES) {
  const ctx = await b.newContext({ ...devices['Pixel 7'], locale: 'ko-KR' });
  const p = await ctx.newPage();
  await p.route(/googletagmanager|clarity\.ms|google-analytics/, (r) => r.abort());
  try { await p.goto(BASE + path, { waitUntil: 'load', timeout: 30000 }); } catch (e) { console.log(`\n## ${name} ${path} — 못 엶`); await ctx.close(); continue; }
  await p.waitForTimeout(2200);
  const found = await p.evaluate(async () => {
    const INTER = 'a[href],button,input,select,textarea,label,summary,[role="button"],[role="tab"],[role="link"],[onclick],[tabindex]:not([tabindex="-1"]),[contenteditable]';
    const vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 8 && r.height > 8 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && e.offsetParent !== null; };
    const txt = (e) => (e.innerText || e.alt || '').trim().replace(/\s+/g, ' ').slice(0, 46);
    const sel = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
    const A = [], B = [], C = [];
    const all = [...document.querySelectorAll('body *')].filter(vis);
    // A: cursor:pointer 인데 인터랙티브가 아닌 가장 바깥 요소 → 실제로 눌러 본다
    const ptr = all.filter((e) => getComputedStyle(e).cursor === 'pointer' && !e.closest(INTER) && !e.querySelector(INTER));
    const outer = ptr.filter((e) => !ptr.includes(e.parentElement));
    for (const e of outer.slice(0, 40)) {
      let changed = false; const mo = new MutationObserver(() => { changed = true; });
      mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
      const h0 = location.href, y0 = scrollY;
      e.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 350)); mo.disconnect();
      if (!changed && location.href === h0 && Math.abs(scrollY - y0) < 2) A.push(sel(e) + ' 「' + txt(e) + '」');
      if (location.href !== h0) { history.back(); await new Promise((r) => setTimeout(r, 300)); }
    }
    // B: 단추 · 카드처럼 생긴 비인터랙티브
    for (const e of all) {
      if (e.closest(INTER) || e.querySelector(INTER)) continue;
      const s = getComputedStyle(e), r = e.getBoundingClientRect();
      const boxed = (parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none' && parseFloat(s.borderBottomWidth) > 0) || (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== getComputedStyle(e.parentElement).backgroundColor);
      const t = txt(e);
      if (boxed && parseFloat(s.borderTopLeftRadius) >= 4 && r.width >= 56 && r.width <= 400 && r.height >= 26 && r.height <= 130 && t && t.length <= 40 && e.children.length <= 4 && !e.closest('table,pre,code')) B.push(sel(e) + ' 「' + t + '」 ' + Math.round(r.width) + '×' + Math.round(r.height));
    }
    // C: 링크 밖 큰 그림 · 화살표 글
    for (const e of all) {
      if (e.closest(INTER)) continue;
      if (e.tagName === 'IMG') { const r = e.getBoundingClientRect(); if (r.width >= 90 && r.height >= 70) C.push('그림 ' + sel(e) + ' 「' + (e.alt || e.src.split('/').pop()).slice(0, 40) + '」 ' + Math.round(r.width) + '×' + Math.round(r.height)); }
      else if (!e.children.length && /(→|›|»|>$)/.test(e.textContent.trim()) && e.textContent.trim().length < 60 && !e.querySelector(INTER)) C.push('화살표 글 ' + sel(e) + ' 「' + txt(e) + '」');
    }
    const uniq = (a) => [...new Set(a)];
    return { A: uniq(A), B: uniq(B).slice(0, 25), C: uniq(C).slice(0, 15) };
  });
  const n = found.A.length + found.B.length + found.C.length; total += found.A.length;
  console.log(`\n## ${name} ${path} — A ${found.A.length} · B ${found.B.length} · C ${found.C.length}`);
  for (const k of ['A', 'B', 'C']) for (const x of found[k]) console.log(`  ${k} ${x}`);
  await ctx.close();
}
await b.close();
console.log(`\n확실한 데드클릭(A) ${total}개`);
