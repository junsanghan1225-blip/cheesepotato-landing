#!/usr/bin/env node
/* brand/*.svg 만들기 — 출판사 로고 파일(운영자 2026-10-23). 원본은 tools/brand-logo.mjs. */
import fs from 'node:fs';
import { logoSvg, BRAND } from './brand-logo.mjs';
fs.mkdirSync('brand', { recursive: true });
const W = '#ffffff';
const out = {
  'everykoreans-stack.svg': logoSvg({}), 'everykoreans-stack-white.svg': logoSvg({ fg: W }),
  'everykoreans-oneline.svg': logoSvg({ one: true }), 'everykoreans-oneline-white.svg': logoSvg({ one: true, fg: W }),
  'everykoreans-mono-navy.svg': logoSvg({ mono: true }), 'everykoreans-mono-white.svg': logoSvg({ mono: true, fg: W }),
};
for (const [f, s] of Object.entries(out)) fs.writeFileSync(`brand/${f}`, s + '\n');
console.log(`brand/ ${Object.keys(out).length}개`, BRAND.navy);
