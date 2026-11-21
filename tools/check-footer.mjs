/* 꼬리말 검사 — 손으로 쓴 쪽 · 첫 화면의 꼬리말이 tools/lib/site-footer.mjs 와 같은지(기본 틀 6번). 다르면 node tools/apply-footer.mjs */
process.argv.push('--check');
await import('./apply-footer.mjs');
