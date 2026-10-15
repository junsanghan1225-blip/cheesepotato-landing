#!/usr/bin/env node
/* CI 검사 — docs/drill-blocks/*.json 모양 + drill-extra.json 이 원본과 같은지 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [path.join(ROOT, 'tools/build-drill-blocks.mjs'), '--check'], { stdio: 'inherit' });
