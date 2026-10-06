#!/usr/bin/env node
/* CI 검사 — docs/grammar-pairs.json 모양 + grammar-pairs.js 가 원본과 같은지(손으로 고쳤거나 다시 안 만들었으면 실패) */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [path.join(ROOT, 'tools/build-grammar-pairs.mjs'), '--check'], { stdio: 'inherit' });
const { GRAMMAR_PAIRS } = await import(path.join(ROOT, 'grammar-pairs.js'));
const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/grammar-pairs.json'), 'utf8'));
if (JSON.stringify(GRAMMAR_PAIRS) !== JSON.stringify(src)) { console.error('grammar-pairs.js 가 원본과 달라요 — node tools/build-grammar-pairs.mjs 를 돌려 주세요'); process.exit(1); }
