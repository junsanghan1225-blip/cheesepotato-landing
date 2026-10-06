#!/usr/bin/env node
/* CI 검사 — path-map.js(학습 길의 레슨 → 문법)가 지금 코스 · 문법 · docs/path-map.json 과 같은지 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [path.join(ROOT, 'tools/build-path-map.mjs'), '--check'], { stdio: 'inherit' });
