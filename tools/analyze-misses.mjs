import { TOPIK_READING } from '../topik.js';
import { TOPIK2_READING } from '../topik2.js';
import { GLOSSARY } from '../glossary.js';
import { glossFind } from '../gloss-find.js';
import fs from 'node:fs';

const inDict = (k) => Object.prototype.hasOwnProperty.call(GLOSSARY, k);
const reach = (w) => !!glossFind(inDict, w);

const tally = new Map();
for (const q of [...TOPIK_READING, ...TOPIK2_READING]) {
  const text = [q.passage, q.sentence, ...(q.options || [])].filter(Boolean).join(' ');
  text.split(/\s+/).forEach((w) => {
    if (/^([(（[［〔<〈【{][0-9A-Za-z가-힣][)）\]］〕>〉】}][-–—→,\s]*)+$/.test(w)) return;
    const k = w.replace(/[^가-힣]/g, '');
    if (!k) return;
    tally.set(k, (tally.get(k) ?? 0) + 1);
  });
}

const miss = [...tally.entries()].filter(([w]) => !reach(w)).sort((a, b) => b[1] - a[1]);
console.log('Total miss types:', miss.length);
const totalMissOccurrences = miss.reduce((a, b) => a + b[1], 0);
console.log('Total miss occurrences:', totalMissOccurrences);
console.log('Top 50 misses:', miss.slice(0, 50).map(([w, n]) => `${w}(${n})`).join(' '));

fs.writeFileSync('tools/actual-misses.json', JSON.stringify(miss, null, 2), 'utf8');
