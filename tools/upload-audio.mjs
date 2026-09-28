#!/usr/bin/env node
/* 녹음 파일(assets/audio/)을 Supabase Storage 의 공개 버킷 `audio` 로 올린다.
 *
 *   node tools/upload-audio.mjs --dry     무엇을 몇 개 올릴지만 본다 (열쇠 없이도 된다)
 *   node tools/upload-audio.mjs           올린다 — 이미 올라가 있는 것은 건너뛴다
 *   node tools/upload-audio.mjs --force   이미 있는 것도 다시 올린다 (다시 녹음한 파일을 바꿀 때)
 *
 * **운영자 컴퓨터에서 돌린다.** 올리려면 service_role 열쇠가 필요하다 — 대화 · 코드 · 커밋에 적지 않고,
 * 그 창에서만 환경 변수로 넣는다(PowerShell):
 *   $env:SUPABASE_SERVICE_KEY = "…"      ← Supabase → Project Settings → API → service_role
 *   node tools/upload-audio.mjs
 * 창을 닫으면 사라진다.
 *
 * 파일 이름은 audio-key.js 의 규칙으로 바꿔서 올린다 — Supabase 는 한글 이름을 안 받는다.
 * 사이트도 같은 파일(audio-key.js)로 주소를 만들므로 규칙이 어긋날 일이 없다.
 * 중간에 끊겨도 다시 돌리면 이어서 올린다(있는 것은 건너뛴다). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { audioKey } = await import(pathToFileURL(path.join(ROOT, 'audio-key.js')).href);

const SB = 'https://tjgoevtvobvmlyefgxel.supabase.co';
const BUCKET = 'audio';
const SRC = path.join(ROOT, 'assets', 'audio');
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const FORCE = args.includes('--force');
const KEY = process.env.SUPABASE_SERVICE_KEY || '';
const TYPE = { '.mp3': 'audio/mpeg', '.webm': 'audio/webm', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };

/* 올릴 파일: 소리 파일만. recorded/ 의 목록(txt)과 README 는 사이트가 쓰지 않는다. */
const files = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { if (name !== 'recorded') walk(full); continue; }
    if (TYPE[path.extname(name).toLowerCase()]) files.push(full);
  }
})(SRC);

const rel = (f) => path.relative(SRC, f).split(path.sep).join('/');
const pub = (k) => `${SB}/storage/v1/object/public/${BUCKET}/${k}`;
const mb = (n) => (n / 1048576).toFixed(1) + 'MB';
const total = files.reduce((a, f) => a + fs.statSync(f).size, 0);

console.log(`올릴 후보 ${files.length}개 · ${mb(total)} → 버킷 「${BUCKET}」`);
console.log(`예: ${rel(files[0])}  →  ${audioKey(rel(files[0]))}`);
if (DRY) { console.log('\n--dry: 올리지 않았다.'); process.exit(0); }
if (!KEY) {
  console.error('\nSUPABASE_SERVICE_KEY 가 없다. PowerShell 에서 먼저:\n  $env:SUPABASE_SERVICE_KEY = "…service_role 열쇠…"');
  process.exit(1);
}

let up = 0, skip = 0;
const fails = [];
let i = 0;
async function worker() {
  while (i < files.length) {
    const f = files[i++];
    const key = audioKey(rel(f));
    try {
      if (!FORCE) {
        const h = await fetch(pub(key), { method: 'HEAD' });
        if (h.ok) { skip++; continue; }
      }
      const res = await fetch(`${SB}/storage/v1/object/${BUCKET}/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KEY}`, apikey: KEY,
          'Content-Type': TYPE[path.extname(f).toLowerCase()],
          'x-upsert': 'true',
          'cache-control': 'max-age=86400',   // 하루. 다시 녹음해 바꾸면 늦어도 다음 날엔 새 소리가 나온다
        },
        body: fs.readFileSync(f),
      });
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 120)}`);
      up++;
    } catch (e) {
      fails.push(`${rel(f)} — ${e.message}`);
    }
    const n = up + skip + fails.length;
    if (n % 200 === 0) console.log(`  … ${n} / ${files.length}  (올림 ${up} · 건너뜀 ${skip} · 실패 ${fails.length})`);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));

console.log(`\n끝 — 올림 ${up} · 이미 있어 건너뜀 ${skip} · 실패 ${fails.length}`);
if (fails.length) {
  console.log('실패한 것(다시 돌리면 이것만 다시 올린다):');
  fails.slice(0, 20).forEach((x) => console.log('  · ' + x));
  process.exit(1);
}
console.log(`\n확인: 이 주소를 브라우저로 열어 소리가 나면 된다\n  ${pub(audioKey(rel(files[0])))}`);
