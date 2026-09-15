#!/usr/bin/env node
/* 낱말 사전 정적 페이지(dictionary/*.html)를 검증한다.
 *
 *   node tools/check-dictionary.mjs
 *
 * build-pages.mjs 가 구운 4,209개 낱말 쪽과 목록(index.html)이 검색엔진과
 * 학습자에게 올바르게 나갈 수 있는 상태인지 전수 검사한다.
 *
 * 「고쳐야 할 것」(bad)이 있으면 종료 코드 1 이다.
 * 「짚어 둘 것」(note)은 사람이 보고 판단할 자리라 종료 코드를 올리지 않는다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DICT_DIR = path.join(ROOT, 'dictionary');

const bad = [];
const note = [];

if (!fs.existsSync(DICT_DIR)) {
  console.error('dictionary/ 디렉터리가 없습니다. 먼저 node tools/build-pages.mjs 를 실행하세요.');
  process.exit(1);
}

const files = fs.readdirSync(DICT_DIR);
const htmlFiles = files.filter((f) => f.endsWith('.html'));

if (!files.includes('index.html')) {
  bad.push('dictionary/index.html 허브 페이지가 없습니다');
}

const wordPages = htmlFiles.filter((f) => f !== 'index.html');
if (wordPages.length < 4000) {
  bad.push(`낱말 쪽 개수가 너무 적습니다 (${wordPages.length}개)`);
}

let checked = 0;
let emptyDescCount = 0;
let shortContentCount = 0;

for (const file of wordPages) {
  const filePath = path.join(DICT_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const word = decodeURIComponent(file.replace(/\.html$/, ''));

  // 1. 필수 태그 검증
  if (!content.includes('<title>')) bad.push(`${word} — <title> 누락`);
  if (!content.includes('rel="canonical"')) bad.push(`${word} — canonical 태그 누락`);
  if (!content.includes('<h1>')) bad.push(`${word} — <h1> 누락`);
  if (!content.includes('뜻풀이 · Meaning')) bad.push(`${word} — 뜻풀이 섹션 누락`);
  if (!content.includes('application/ld+json')) bad.push(`${word} — JSON-LD 구조화 데이터 누락`);

  // 2. 비정상 문자열 검증
  if (content.includes('undefined') || content.includes('NaN')) {
    bad.push(`${word} — 본문에 undefined 또는 NaN 이 포함됨`);
  }

  // 3. 본문 품질 검증
  // HTML 태그와 공백을 제외한 순수 텍스트 길이 측정
  const pureText = content.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
  if (pureText.length < 150) {
    shortContentCount++;
    if (shortContentCount <= 5) {
      note.push(`${word} — 본문 내용이 다소 얕음 (${pureText.length}자)`);
    }
  }

  checked++;
}

if (shortContentCount > 5) {
  note.push(`...외 ${shortContentCount - 5}개 낱말의 본문 길이가 150자 미만입니다 (Google Search Console 색인 품질 모니터링 권장)`);
}

console.log(`사전 ${wordPages.length}쪽 + 목록 1쪽 검사 완료\n`);

if (note.length) {
  console.log(`짚어 둘 것 ${note.length}건:`);
  for (const n of note) console.log(`  - ${n}`);
  console.log();
} else {
  console.log('짚어 둘 것 0건');
}

if (bad.length) {
  console.log(`고쳐야 할 것 ${bad.length}건:`);
  for (const b of bad) console.log(`  - ${b}`);
  console.log();
  process.exit(1);
} else {
  console.log('고쳐야 할 것 0건\n\n이상 없음');
}
