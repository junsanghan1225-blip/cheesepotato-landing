/* 검사 결과를 모으고, 넘어가기로 한 것을 걸러 낸다.
 *
 * 글이 83만 자 쌓인 뒤에 맞춤법 검사기를 처음 들이대면 수백 건이 쏟아진다.
 * 그중에는 **일부러 틀리게 적어 둔 것**이 섞여 있다 — 「「안 알아요」는
 * 쓰지 않습니다」처럼 못 쓸 말을 보여 주는 자리가 이 사이트에는 많다.
 * 그것까지 매번 빨갛게 나오면 목록을 아무도 안 보게 되고, 그 순간 진짜
 * 잘못도 같이 묻힌다.
 *
 * 그래서 **한 번 보고 「이건 일부러 그렇다」고 정한 것은 적어 둔다.**
 *
 *   node tools/check-spelling.mjs              넘어가기로 한 것은 빼고 본다
 *   node tools/check-spelling.mjs --all        넘어가기 목록을 무시하고 전부
 *   node tools/check-spelling.mjs --accept     지금 나온 것을 전부 넘어가기로
 *
 * --accept 는 **사람이 목록을 눈으로 본 뒤에** 쓰는 것이다. 처음부터 그냥
 * 누르면 진짜 잘못까지 통째로 묻는다.
 *
 * 넘어가기 열쇠는 자리가 아니라 **글**에서 뽑는다. 예문 차례를 바꿨다고
 * 넘어가기가 풀리면, 자료를 손볼 때마다 목록이 되살아난다.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './corpus.mjs';

const FILE = 'docs/lint-ignore.json';
const PATH = join(ROOT, FILE);

const keyOf = (f) =>
  `${f.rule}\t${f.found}\t${createHash('sha1').update(f.text || '').digest('hex').slice(0, 8)}`;

export function loadIgnore() {
  if (!existsSync(PATH)) return new Map();
  try {
    const raw = JSON.parse(readFileSync(PATH, 'utf8'));
    return new Map((raw.entries || []).map((e) => [e.key, e]));
  } catch (e) {
    console.error(`! ${FILE} 을 못 읽었다 (${e.message}) — 넘어가기 없이 본다.`);
    return new Map();
  }
}

export function saveIgnore(entries) {
  const body = {
    note: '검사기가 짚었지만 사람이 보고 「이건 일부러 그렇다」고 정한 것. tools/lib/lint.mjs 참고.',
    updated: new Date().toISOString().slice(0, 10),
    entries: entries
      .map((e) => ({ key: e.key, rule: e.rule, found: e.found, where: e.where, why: e.why }))
      .sort((a, b) => a.key.localeCompare(b.key)),
  };
  writeFileSync(PATH, JSON.stringify(body, null, 1) + '\n');
  return FILE;
}

/* 검사기 한 대. 규칙을 걸고, 결과를 모으고, 사람이 읽을 꼴로 찍는다. */
export class Lint {
  constructor(name) {
    this.name = name;
    this.found = [];
    this.argv = process.argv.slice(2);
    this.all = this.argv.includes('--all');
    this.accept = this.argv.includes('--accept');
    this.quiet = this.argv.includes('--quiet');
    this.limit = Number((this.argv.find((a) => a.startsWith('--limit=')) || '').split('=')[1]) || 40;
    this.ignore = loadIgnore();
  }

  /* rule  규칙 이름 (넘어가기 열쇠의 일부다 — 함부로 바꾸지 말 것)
     level 'bad' 고쳐야 할 것 · 'warn' 짚어 둘 것 (사람이 봐야 안다)  */
  add(rule, level, record, { found, want, why }) {
    /* 일부러 틀리게 둔 객관식 오답 보기에서 나온 것은 못 박지 않는다.
       「저는 학생예요」가 오답 보기라면 그것은 잘못이 아니라 문제다. */
    if (record.distractor && level === 'bad') { level = 'warn'; why = why + ' (오답 보기라 일부러 그런 것일 수 있다)'; }
    const f = {
      rule, level, found, want, why,
      file: record.file, path: record.path, id: record.id,
      text: record.text, where: `${record.file} ${record.path}${record.id ? ` (${record.id})` : ''}`,
    };
    f.key = keyOf(f);
    /* 같은 자리에서 같은 잘못이 두 번 나오면 한 번만 센다 */
    if (this.found.some((g) => g.rule === rule && g.file === f.file && g.path === f.path && g.found === found)) return;
    this.found.push(f);
  }

  /* 걸러 낸 결과. --all 이면 안 거른다. */
  live() {
    return this.all ? this.found : this.found.filter((f) => !this.ignore.has(f.key));
  }

  report(summary = '') {
    const live = this.live();
    const bad = live.filter((f) => f.level === 'bad');
    const warn = live.filter((f) => f.level === 'warn');
    const hidden = this.found.length - live.length;

    if (this.accept) {
      const merged = [...this.ignore.values()];
      const have = new Set(merged.map((e) => e.key));
      let added = 0;
      for (const f of live) if (!have.has(f.key)) { merged.push(f); have.add(f.key); added++; }
      const file = saveIgnore(merged);
      console.log(`${this.name}: ${added}건을 ${file} 에 넘어가기로 적었다 (모두 ${merged.length}건).`);
      console.log('※ 목록을 눈으로 본 뒤에 쓰라고 만든 것이다. 그냥 눌렀다면 git diff 로 되돌릴 것.');
      return 0;
    }

    if (summary) console.log(summary);
    const show = (list, mark, title) => {
      if (!list.length) return;
      console.log(`\n${title} ${list.length}건`);
      const byRule = new Map();
      for (const f of list) { if (!byRule.has(f.rule)) byRule.set(f.rule, []); byRule.get(f.rule).push(f); }
      for (const [rule, fs] of [...byRule].sort((a, b) => b[1].length - a[1].length)) {
        console.log(`\n  [${rule}] ${fs.length}건 — ${fs[0].why}`);
        for (const f of fs.slice(0, this.limit)) {
          console.log(`    ${mark} ${f.found}${f.want ? ` → ${f.want}` : ''}`);
          console.log(`       ${trim(f.text)}`);
          console.log(`       ${f.where}`);
        }
        if (fs.length > this.limit) console.log(`    … ${fs.length - this.limit}건 더 (--limit=200)`);
      }
    };
    show(warn, '·', '짚어 둘 것');
    show(bad, '✗', '고쳐야 할 것');

    console.log('');
    if (hidden) console.log(`(넘어가기로 적어 둔 ${hidden}건은 뺐다 — 전부 보려면 --all)`);
    if (!bad.length && !warn.length) console.log(`${this.name}: 이상 없음`);
    else console.log(`${this.name}: 고쳐야 할 것 ${bad.length}건 · 짚어 둘 것 ${warn.length}건`);
    if (live.length) console.log('일부러 그런 것이면 --accept 로 넘어가기에 적어 둘 것.');
    return bad.length ? 1 : 0;
  }
}

/* 긴 글은 잘라서 보여 준다 — 한 건에 열 줄이 나오면 목록을 못 읽는다. */
export function trim(s, n = 90) {
  const one = s.replace(/\s+/g, ' ').trim();
  return one.length <= n ? one : one.slice(0, n) + '…';
}
