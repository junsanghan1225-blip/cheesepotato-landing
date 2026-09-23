import fs from 'fs';

const cat = process.argv[2] || '15';
const files = fs.readdirSync('sentence').filter(f => f.startsWith(cat + '-') && f.endsWith('.html'));
// Sort by number: 15-1, 15-2, ...
files.sort((a, b) => {
  const na = parseInt(a.replace('.html','').split('-')[1], 10);
  const nb = parseInt(b.replace('.html','').split('-')[1], 10);
  return na - nb;
});

for (const f of files) {
  const content = fs.readFileSync('sentence/' + f, 'utf8');
  const title = content.match(/<h1>(.*?)<\/h1>/)?.[1] || '';
  const desc = content.match(/<p class="desc">(.*?)<\/p>/)?.[1] || '';
  const facts = [...content.matchAll(/<div class="fact"><b>(.*?)<\/b><span>(.*?)<\/span><\/div>/g)]
    .map(m => m[1] + ': ' + m[2].replace(/<[^>]+>/g, ''));
  const exs = [...content.matchAll(/<div class="ex">(.*?)<\/div>/g)].map(m => m[1]);
  const dlgLines = [...content.matchAll(/<div class="line [ab]"><span class="who".*?<\/span><span class="bub">(.*?)<\/span><\/div>/g)].map(m => m[1]);
  console.log(`\n### ${f.replace('.html','')} [${title}]`);
  console.log('설명:', desc);
  if (facts.length) console.log('특징:', facts.join(' | '));
  if (exs.length) console.log('예문:', exs.join(' // '));
  if (dlgLines.length) console.log('대화:', dlgLines.join(' // '));
}
