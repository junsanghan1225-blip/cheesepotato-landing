/* 메뉴줄 검사 — 쪽마다 박힌 메뉴줄이 tools/lib/site-header.mjs 와 같은지. 다르면 node tools/apply-header.mjs */
process.argv.push('--check');
await import('./apply-header.mjs');
