#!/usr/bin/env node
/* docs/bonus/*.json 검사 — 단원이 책 틀에 있는지 · 개수 · 보기 번호 · 풀이 · 책 안 문장과 겹침 · 줄표. */
import { bonusFiles, validateBonus } from './bonus-data.mjs';
let bad = 0, units = 0;
for (const f of bonusFiles()) { const e = validateBonus(f); e.forEach((m) => console.error('✗', m)); bad += e.length; }
console.log(bad ? `보너스 자료 오류 ${bad}` : `보너스 자료 OK (${bonusFiles().length}권)`);
process.exit(bad ? 1 : 0);
