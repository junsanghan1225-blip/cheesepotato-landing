#!/usr/bin/env node
/* CI 검사 — docs/lesson-blocks/*.json 모양 + lesson-extra/ 가 원본과 같은지 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [path.join(ROOT, 'tools/build-lesson-blocks.mjs'), '--check'], { stdio: 'inherit' });
