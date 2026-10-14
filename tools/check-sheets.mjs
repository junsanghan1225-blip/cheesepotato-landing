#!/usr/bin/env node
/* CI 검사 — docs/worksheets/*.json 모양 + 학습지 쪽이 자료와 같은지(손으로 고쳤거나 다시 안 만들었으면 실패) */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [path.join(ROOT, 'tools/build-sheets.mjs'), '--check'], { stdio: 'inherit' });
