/* 올리기 전 검사 한 번에 — CI(.github/workflows/check.yml)와 같은 것을 같은 차례로 돌린다(2026-10-10, 운영자 「작업 효율」).
   예전에는 매번 긴 for 줄을 손으로 쳤다. 검사 목록은 check.yml 에서 읽으므로 CI 에 검사를 더하면 여기도 저절로 따라온다.
   자국은 다시 찍고(--fix 없이도) 확인까지 한다. 실패한 검사는 마지막 몇 줄을 보여 준다.

   실행: node tools/preflight.mjs        → 모두 통과면 「통과」, 아니면 실패 목록과 함께 끝값 1 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const run = (args) => spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8' });

const yml = readFileSync(join(ROOT, '.github/workflows/check.yml'), 'utf8');
const checks = [...new Set(yml.match(/check-[a-z0-9-]+/g))].filter((c) => c !== 'check-topik2');
const extra = [...yml.matchAll(/node (tools\/check-[a-z0-9-]+\.mjs) (\S+)/g)].map((m) => [m[1], m[2]]);
const syntax = (yml.match(/node --check [^\n]+/) || [''])[0].match(/[\w.-]+\.js/g) || [];

const steps = [
  ['자국 찍기', ['tools/stamp.mjs']],
  ['자국 확인', ['tools/stamp.mjs', '--check']],
  ...syntax.map((f) => [`문법 ${f}`, ['--check', f]]),
  ...checks.map((c) => [c, [`tools/${c}.mjs`]]),
  ...extra.map(([f, a]) => [f.replace(/^tools\/|\.mjs$/g, ''), [f, a]]),
];

const fails = [];
for (const [name, args] of steps) {
  const r = run(args);
  if (r.status !== 0) fails.push([name, ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(-6).join('\n')]);
}
if (!fails.length) {
  console.log(`통과 — ${steps.length}가지 (자국 · 문법 ${syntax.length} · 검사 ${checks.length + extra.length})`);
} else {
  for (const [n, out] of fails) console.log(`✗ ${n}\n${out.replace(/^/gm, '    ')}`);
  console.log(`\n실패 ${fails.length} / ${steps.length}`);
  process.exit(1);
}
