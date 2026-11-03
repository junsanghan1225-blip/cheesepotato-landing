#!/usr/bin/env node
/* 「필수 관용 표현」 중요 표현 그림 목록 만들기(운영자 2026-11-03 「삽화는 gemini 한테」).
   node tools/idioms-art-prompts.mjs <picks.json> [나가는 파일.md] [--limit N]
   picks.json = {"ex-01":["숨을 쉬다", …], …}(운영자가 고른 것). 표현마다 파일 이름 · 직역 · 뜻 · 그리는 법을 한 줄씩 적은 표를 만든다 — 공통 지시는 docs/antigravity/gemini-idioms-art-task.md. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--') && !/^\d+$/.test(a));
const lim = process.argv.includes('--limit') ? Number(process.argv[process.argv.indexOf('--limit') + 1]) : Infinity;
const [picksFile, out] = args;
if (!picksFile) { console.error('쓰는 법: node tools/idioms-art-prompts.mjs <picks.json> [out.md] [--limit N]'); process.exit(1); }
const picks = JSON.parse(fs.readFileSync(picksFile, 'utf8'));
const X = JSON.parse(fs.readFileSync(path.join(ROOT, 'vocab/data/expressions.json'), 'utf8'));
const byHead = new Map(X.map((x) => [x.head, x]));
const HOW = { idiom: '말 그대로의 장면(직역)을 한 컷으로, 조금 웃기게. 직역만으로 뜻이 안 보이면 뜻을 알려 주는 작은 단서(표정 · 땀방울 · 하트)를 더한다.', proverb: '속담이 말하는 작은 이야기 한 컷(원인과 결과가 한눈에).', idiom4: '뜻이 드러나는 현대의 상황 한 컷(한자 · 옛이야기 배경은 그리지 않는다).' };
const KIND = { idiom: '관용구', proverb: '속담', idiom4: '사자성어' };
const rows = []; let n = 0, miss = [];
for (const [unit, heads] of Object.entries(picks)) {
  heads.forEach((h, i) => {
    const x = byHead.get(h); if (!x) { miss.push(`${unit} ${h}`); return; }
    if (n++ >= lim) return;
    rows.push({ file: `idm-${unit.replace('-', '')}-${String(i + 1).padStart(2, '0')}.png`, unit, head: h, kind: KIND[x.type], literal: x.literal, en: x.en_equiv || x.en, meaning: x.en, how: HOW[x.type] });
  });
}
const md = `# 그림 목록 — 필수 관용 표현(${rows.length}장)\n\n> 공통 지시(스타일 · 팔레트 · 글자 금지)는 \`docs/antigravity/gemini-idioms-art-task.md\` 맨 위 「공통 지시」 블록을 먼저 붙인다. 아래 표는 그림마다 **파일 이름 · 직역 · 뜻 · 그리는 법**이다. 한국어 표현 이름은 그림 요청에는 적어도 되지만 **그림 안에는 넣지 않는다.**\n\n` + rows.map((r, i) => `### ${i + 1}. ${r.file}  (${r.kind} · ${r.unit})\n- 표현: ${r.head}\n- 직역(literal): ${r.literal}\n- 뜻(meaning): ${r.meaning}${r.en && r.en !== r.meaning ? `\n- 영어에서 비슷한 말: ${r.en}` : ''}\n- 그리는 법: ${r.how}\n`).join('\n');
if (out) fs.writeFileSync(out, md); else process.stdout.write(md);
console.error(`그림 목록 ${rows.length}장${miss.length ? ` · 자료에 없는 표현 ${miss.length}개: ${miss.slice(0, 5).join(', ')}` : ''}${out ? ` → ${out}` : ''}`);
