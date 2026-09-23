#!/usr/bin/env node
/* assets/audio/ 하위 모든 음성 파일을 Supabase Storage 의 'audio' 공개 버킷에 올린다.
   한글 파일명은 URL 인코딩 처리하며, 병렬 업로드로 빠르게 처리한다.

   쓰기:
     node tools/upload-audio-supabase.mjs <SERVICE_ROLE_KEY>
     또는 SUPABASE_KEY=... node tools/upload-audio-supabase.mjs
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = path.join(ROOT, 'assets', 'audio');
const SB_URL = 'https://tjgoevtvobvmlyefgxel.supabase.co';
const BUCKET = 'audio';

const key = process.argv[2] || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) {
  console.error('사용법: node tools/upload-audio-supabase.mjs <SERVICE_ROLE_KEY 또는 ANON_KEY>');
  process.exit(1);
}

// 1. 모든 오디오 파일 목록 수집
function getFiles(dir, base = '') {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    const relPath = base ? `${base}/${item.name}` : item.name;
    if (item.isDirectory()) {
      results = results.concat(getFiles(fullPath, relPath));
    } else {
      if (item.name.endsWith('.mp3') || item.name.endsWith('.webm') || item.name.endsWith('.wav')) {
        results.push({ fullPath, relPath, name: item.name });
      }
    }
  }
  return results;
}

const files = getFiles(AUDIO_DIR);
console.log(`업로드 대상 파일: 총 ${files.length}개 (${(files.reduce((acc, f) => acc + fs.statSync(f.fullPath).size, 0) / 1024 / 1024).toFixed(2)} MB)`);

// 2. 단일 파일 업로드 함수
async function uploadFile(file, retries = 3) {
  const fileData = fs.readFileSync(file.fullPath);
  const ext = path.extname(file.name).toLowerCase();
  const contentType = ext === '.webm' ? 'audio/webm' : 'audio/mpeg';

  // 한글 등 특수문자 경로 인코딩
  const encodedPath = file.relPath.split('/').map(encodeURIComponent).join('/');
  const targetUrl = `${SB_URL}/storage/v1/object/${BUCKET}/${encodedPath}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          apikey: key,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body: fileData,
      });

      if (res.ok) {
        return true;
      }

      // 만약 이미 존재하거나 다른 상태 코드인 경우 처리
      const text = await res.text();
      if (res.status === 400 && text.includes('Duplicate')) {
        return true;
      }
      if (attempt === retries) {
        console.error(`[실패] ${file.relPath} (HTTP ${res.status}): ${text}`);
        return false;
      }
    } catch (err) {
      if (attempt === retries) {
        console.error(`[오류] ${file.relPath}: ${err.message}`);
        return false;
      }
    }
    // 지연 후 재시도
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  return false;
}

// 3. 동시 15개 병렬 업로드 큐
const CONCURRENCY = 15;
let index = 0;
let successCount = 0;
let failCount = 0;
const start = Date.now();

async function worker() {
  while (index < files.length) {
    const curIdx = index++;
    const file = files[curIdx];
    const ok = await uploadFile(file);
    if (ok) successCount++;
    else failCount++;

    if ((curIdx + 1) % 100 === 0 || curIdx + 1 === files.length) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const percent = (((curIdx + 1) / files.length) * 100).toFixed(1);
      console.log(`진행률: [${curIdx + 1}/${files.length}] (${percent}%) - 성공: ${successCount}, 실패: ${failCount}, 소요: ${elapsed}s`);
    }
  }
}

console.log(`동시 작업자 ${CONCURRENCY}개로 업로드를 시작합니다...`);
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

console.log(`\n완료! 총 ${files.length}개 중 성공: ${successCount}개, 실패: ${failCount}개`);
if (failCount === 0) {
  console.log(`샘플 테스트 URL:`);
  console.log(`${SB_URL}/storage/v1/object/public/${BUCKET}/${files[0].relPath.split('/').map(encodeURIComponent).join('/')}`);
}
