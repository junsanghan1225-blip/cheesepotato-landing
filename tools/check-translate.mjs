#!/usr/bin/env node
/* CI 검사 — docs/translate.json 모양 + translate.js 가 원본과 같은지 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [path.join(ROOT, 'tools/build-translate.mjs'), '--check'], { stdio: 'inherit' });
