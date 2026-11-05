#!/usr/bin/env node
/* 쪽 점수 검사(Lighthouse) — 대표 쪽 몇 개를 폰 기준으로 재서 성능 · 접근성 · 모범 사례 · 검색 점수와 느린 까닭(LCP · CLS · TBT)을 표로 낸다.
   운영자 2026-11-05 「Lighthouse 만들어」. 점수가 기준 밑이면 「주의」만 표시하고 실패시키지 않는다(알려 주는 용도).
   쓰는 법: node tools/lighthouse-check.mjs [http://localhost:8080]   (그 주소에 사이트가 떠 있어야 한다 — 워크플로가 띄운다)
   필요: npm i lighthouse chrome-launcher(워크플로가 설치). 크롬 위치는 환경변수 CHROME_PATH. 결과 표는 GITHUB_STEP_SUMMARY 에도 적는다. */
import fs from 'node:fs';
const base = (process.argv[2] || 'http://localhost:8080').replace(/\/$/, '');
const PAGES = ['/index.html', '/dictionary/참기름.html', '/topik-writing/', '/sentence/', '/shop/particles-workbook/'];
const MIN = { performance: 70, accessibility: 90, 'best-practices': 85, seo: 90 };   // 기준(주의 표시용)
const { default: lighthouse } = await import('lighthouse');
const chromeLauncher = await import('chrome-launcher');
const chrome = await chromeLauncher.launch({ chromePath: process.env.CHROME_PATH || undefined, chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
const rows = []; const warn = [];
for (const p of PAGES) {
  try {
    const r = await lighthouse(base + encodeURI(p), { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: Object.keys(MIN) });
    const c = r.lhr.categories, a = r.lhr.audits;
    const s = Object.fromEntries(Object.keys(MIN).map((k) => [k, Math.round((c[k]?.score ?? 0) * 100)]));
    const low = Object.keys(MIN).filter((k) => s[k] < MIN[k]);
    if (low.length) warn.push(`${p}: ${low.map((k) => `${k} ${s[k]}(<${MIN[k]})`).join(', ')}`);
    rows.push(`| ${p} | ${s.performance} | ${s.accessibility} | ${s['best-practices']} | ${s.seo} | ${a['largest-contentful-paint'].displayValue} | ${a['cumulative-layout-shift'].displayValue} | ${a['total-blocking-time'].displayValue} |`);
  } catch (e) { rows.push(`| ${p} | 오류: ${String(e.message).slice(0, 60)} | | | | | | |`); }
}
await chrome.kill();
const md = `## 쪽 점수(폰 기준 · Lighthouse)\n\n| 쪽 | 성능 | 접근성 | 모범 사례 | 검색 | LCP | CLS | TBT |\n|---|---|---|---|---|---|---|---|\n${rows.join('\n')}\n\n${warn.length ? '**주의(기준 미만)**\n' + warn.map((w) => '- ' + w).join('\n') : '모두 기준 이상입니다.'}\n\n> 기준: 성능 ${MIN.performance} · 접근성 ${MIN.accessibility} · 모범 사례 ${MIN['best-practices']} · 검색 ${MIN.seo}. 알려 주는 용도라 점수가 낮아도 실패하지 않습니다.\n`;
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
