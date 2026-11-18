#!/usr/bin/env node
/* 책 체험 랜딩 쪽(/book/<책 id>/)이 원본(docs/book-landing.json · docs/shop.json · docs/bonus)과 같은지 — CI · preflight 에서 돈다. */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const r = spawnSync(process.execPath, ['tools/build-book-landing.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' });
process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
if (r.status === 0) console.log('check-book-landing: 통과');
process.exit(r.status ?? 1);
