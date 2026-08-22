/* Google Cloud Text-to-Speech API로 1,026개 MP3 생성
   사용: node tools/google-tts-batch.mjs --key ~/google-cloud-key.json */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const args = process.argv.slice(2);
const keyIdx = args.indexOf('--key');
const keyFile = keyIdx >= 0 ? args[keyIdx + 1] : null;
const outDir = 'assets/audio';

if (!keyFile || !fs.existsSync(keyFile)) {
  console.error('사용법: node tools/google-tts-batch.mjs --key ~/google-cloud-key.json');
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 추출 후 JSONL 파싱
const corpus = [];
const proc = spawn('node', ['tools/extract-tts-corpus.mjs'], { stdio: ['ignore', 'pipe', 'inherit'] });
proc.stdout.on('data', (d) => {
  String(d).split('\n').forEach(line => {
    if (line.trim() && line.startsWith('{')) {
      try { corpus.push(JSON.parse(line)); } catch (e) {}
    }
  });
});
proc.on('close', () => batch());

async function batch() {
  console.log(`${corpus.length} 항목을 생성합니다. (비용: $${(corpus.length * 10 / 1000000).toFixed(2)})`);
  
  // gcloud CLI로 생성
  for (let i = 0; i < corpus.length; i += 100) {
    const batch = corpus.slice(i, i + 100);
    for (const item of batch) {
      const slug = audioSlug(item.text);
      const outFile = path.join(outDir, slug + '.mp3');
      
      if (fs.existsSync(outFile)) {
        console.log(`[${item.id}/${corpus.length}] ✓ ${slug} (기존)`);
        continue;
      }
      
      // gcloud text-to-speech synthesize
      const cmd = `gcloud text-to-speech synthesize '${item.text.replace(/'/g, "'\\''")}' --output-file='${outFile}' --language-code=ko-KR --voice-name=ko-KR-Neural2-A --key-file='${keyFile}'`;
      
      try {
        require('child_process').execSync(cmd, { stdio: 'ignore' });
        console.log(`[${item.id}/${corpus.length}] ✓ ${slug}`);
      } catch (e) {
        console.error(`[${item.id}/${corpus.length}] ✗ ${slug} — ${e.message}`);
      }
      
      if (i % 100 === 0) await sleep(1000); // 레이트 리밋
    }
  }
  
  console.log(`\n완료! ${outDir}에 MP3 파일들이 저장되었습니다.`);
}

function audioSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 100);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
