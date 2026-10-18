#!/usr/bin/env node
/* 「이야기 만들기」 자료 — docs/weave.json(접속사 카드 · 이야기, 안티 · Claude 검토) → weave.js 를 만든다(생성물, 손으로 고치지 말 것).
   node tools/build-weave.mjs     검사는 node tools/check-weave.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
import { buildPred } from './weave-pred.mjs';
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/weave.json'), 'utf8'));
const PRED = buildPred();
const js = `/* 「이야기 만들기」 자료 — 생성물. 손으로 고치지 말 것.
 *   원본 docs/weave.json → node tools/build-weave.mjs. 접속사 카드 ${D.connectors.length}개 · 이야기 ${D.stories.length}편 · 긴 문장 장면 ${(D.grow || []).length}개 · 낱말 표 ${Object.keys(PRED).length}개. */
export const WEAVE_ROLES = ${JSON.stringify(D.roles)};
export const WEAVE_CONNECTORS = ${JSON.stringify(D.connectors)};
export const WEAVE_STORIES = ${JSON.stringify(D.stories)};
export const WEAVE_GROW = ${JSON.stringify(D.grow || [])};
export const WEAVE_PRED = ${JSON.stringify(PRED)};
`;
fs.writeFileSync(path.join(ROOT, 'weave.js'), js);
console.log(`이야기 만들기 — 접속사 ${D.connectors.length}개 · 이야기 ${D.stories.length}편 · 긴 문장 장면 ${(D.grow || []).length}개 · 낱말 표 ${Object.keys(PRED).length}개 → weave.js`);
