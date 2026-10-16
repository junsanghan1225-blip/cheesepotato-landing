#!/usr/bin/env node
/* 화면 번역에서 아직 빠진 글 세기 — 새 화면 · 기능이 들어오면 strings.json 이 늘고, 언어 사전(docs/i18n/<언어>.json)엔 없는 글이 생긴다.
   그 글은 화면에서 영어로 보인다(운영자 2026-10-17 「포르투갈어 했는데 번역 안 돼 있어」).
   node tools/i18n-missing.mjs            → 언어마다 빠진 수
   node tools/i18n-missing.mjs pt          → 그 언어의 빠진 글(영어 원문) 목록 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const S = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/i18n/strings.json'), 'utf8'));
const langs = fs.readdirSync(path.join(ROOT, 'docs/i18n')).filter((f) => /^[a-z]{2}\.json$/.test(f)).map((f) => f.slice(0, 2));
const miss = (l) => { const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/i18n', l + '.json'), 'utf8')); return S.filter((x) => !d[x.en]); };
const want = process.argv[2];
if (want) {
  if (!langs.includes(want)) { console.error(`모르는 언어: ${want} (있는 것: ${langs.join(' ')})`); process.exit(1); }
  for (const x of miss(want)) console.log(x.en);
} else {
  console.log(`화면 글 ${S.length}개 중 빠진 수 — ` + langs.map((l) => `${l} ${miss(l).length}`).join(' · '));
}
