/* 안티 그래비티 브랜치가 main 보다 새 것을 가졌는지 한눈에 — 「안티가 올렸어」를 받으면 맨 먼저 돌린다(2026-10-10).
   docs/antigravity/STATUS.md 「하는 중」 표의 브랜치마다: 마지막 커밋(날짜 · 제목)과,
   그 브랜치가 바꾼 자료 파일이 지금 main 과 **내용이 다른지**를 본다.
   squash 머지 때문에 브랜치가 늘 main 보다 「앞서」 보이므로 커밋 수가 아니라 파일 내용으로 견준다.
   자국 · 생성물(*.js · *.html · sitemap)은 빼고 원본 자료만 본다.

   실행: node tools/ag-status.mjs          (먼저 git fetch 를 한다)
         node tools/ag-status.mjs 브랜치 …   (그 브랜치만) */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
try { git('fetch', '-q', 'origin'); } catch { console.log('(fetch 실패 — 마지막으로 받은 것으로 본다)'); }

const table = readFileSync(new URL('../docs/antigravity/STATUS.md', import.meta.url), 'utf8').split('## 끝난 것')[0];
const fromTable = [...table.matchAll(/^\|[^|]+\|[^|]+\|\s*`([^`]+)`/gm)].map((m) => m[1]);
const branches = process.argv.slice(2).length ? process.argv.slice(2) : fromTable;
/* 자료(json)는 줄이 아니라 낱개로 견준다 — 넣은 뒤 몇 줄 고쳐도(오역 등) 「넣음」으로 보이게.
   브랜치 마지막 커밋이 더하거나 바꾼 낱개(배열이면 id, 객체면 열쇠)가 main 에 90% 이상 있으면 넣은 것.
   배열 낱개는 브랜치 쪽의 칸(예: tr)을 main 쪽도 다 가졌을 때만 「있다」 — 새 칸을 더하는 묶음을 놓치지 않게. */
function jsonInMain(b, f) {
  const load = (ref) => { try { return JSON.parse(execFileSync('git', ['show', `${ref}:${f}`], { encoding: 'utf8', maxBuffer: 256 << 20, stdio: ['ignore', 'pipe', 'ignore'] })); } catch { return null; } };
  const before = load(`origin/${b}~1`), after = load(`origin/${b}`), main = load('origin/main');
  if (!after || !main) return null;
  const list = (x) => Array.isArray(x) ? x : Array.isArray(x?.words) ? x.words : null;
  const A = list(after), B = list(before) || [], M = list(main);
  let changed = [], has;
  if (A && M) {
    const prev = new Map(B.map((e) => [e?.id ?? JSON.stringify(e), JSON.stringify(e)]));
    const mm = new Map(M.map((e) => [e?.id ?? JSON.stringify(e), e]));
    changed = A.filter((e) => prev.get(e?.id ?? JSON.stringify(e)) !== JSON.stringify(e));
    has = (e) => { const m = mm.get(e?.id ?? JSON.stringify(e)); return !!m && Object.keys(e || {}).every((k) => k in m); };
  } else if (after && typeof after === 'object' && !A) {
    changed = Object.keys(after).filter((k) => JSON.stringify(after[k]) !== JSON.stringify(before?.[k]));
    has = (k) => k in main && main[k] !== '' && main[k] != null;
  } else return null;
  if (!changed.length) return true;
  return changed.filter(has).length / changed.length >= 0.9;
}
function inMain(b, f) {
  if (f.endsWith('.json')) { const r = jsonInMain(b, f); if (r !== null) return r; }
  const patch = execFileSync('git', ['diff', `origin/${b}~1`, `origin/${b}`, '--', f], { encoding: 'utf8', maxBuffer: 256 << 20 });
  if (!patch.trim()) return true; // 마지막 커밋이 이 파일을 안 건드림 — 앞 묶음은 이미 넣은 것
  const d = mkdtempSync(join(tmpdir(), 'ag-'));
  try {
    mkdirSync(join(d, dirname(f)), { recursive: true });
    writeFileSync(join(d, f), execFileSync('git', ['show', `origin/main:${f}`], { maxBuffer: 256 << 20 }));
    writeFileSync(join(d, 'p.diff'), patch);
    execFileSync('git', ['apply', '--check', '-R', 'p.diff'], { cwd: d, stdio: 'ignore' });
    return true;
  } catch { return false; } finally { rmSync(d, { recursive: true, force: true }); }
}
const SKIP = /(\.js|\.html|\.xml|\.txt)$|^(vi|ja|dictionary|sentence|course|lesson|topik-|eps-|blog|compare|korean-word-for|topik[12]-words)\//;

for (const b of branches) {
  let last;
  try { last = git('log', '-1', '--format=%cs %s', `origin/${b}`); } catch { console.log(`· ${b}: 브랜치 없음`); continue; }
  const files = git('diff', '--name-only', `origin/main...origin/${b}`).split('\n').filter((f) => f && !SKIP.test(f));
  const differ = files.filter((f) => {
    try { execFileSync('git', ['diff', '--quiet', 'origin/main', `origin/${b}`, '--', f]); return false; } catch { return true; }
  });
  // 넣은 뒤 main 에서 더 고친 파일(오역 · 실제 회사 이름 고침 등)은 내용이 달라도 이미 넣은 것이다.
  // 그래서 브랜치 「마지막 커밋」이 바꾼 것을 main 의 그 파일에 거꾸로 되돌려 볼 수 있으면 → 그 변경은 main 에 있다.
  // 되돌릴 수 없으면 → main 에 없는 새 것(날짜로 견주면 main 이 다른 일로 고쳐진 날 틀린다).
  const fresh = differ.filter((f) => !inMain(b, f));
  const mark = fresh.length ? '🆕 새 것 있음' : differ.length ? '✓ 넣음(뒤에 main 에서 더 고침)' : '✓ main 과 같음';
  console.log(`${mark}  ${b}  — ${last}${fresh.length ? `\n      새 파일: ${fresh.join(' · ')}` : ''}`);
}
