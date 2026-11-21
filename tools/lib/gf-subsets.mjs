/* 구글 글꼴의 한글 나눔 조각(unicode-range)을 전부 받아 vendor/ 에 두는 도구 — tools/vendor.mjs 가 쓰고, 글꼴 하나만 새로 받을 때도 쓴다.
   node tools/lib/gf-subsets.mjs ibm-plex-kr   ← 아래 FONTS 의 이름 하나
   조각 이름은 <dir>/<파일머리>.<가중치>.<번호>.woff2, CSS 는 vendor/<dir>.css. 브라우저는 화면에 나온 글자가 든 조각만 받아 간다. */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripLatin } from './strip-latin.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
export const FONTS = {
  /* 본문 글꼴(운영자 2026-11-21 글꼴 짝 시안 「D」 — 「이걸로 다 바꾸자」). 굵기 둘: 400 · 700(600 은 브라우저가 700 으로 그린다) */
  /* display 'optional': 글꼴이 아주 짧은 사이에 안 오면 그 쪽은 기기 글꼴로 그리고, 받아 둔 글꼴은 다음 쪽부터 쓴다.
     느린 폰(CPU 4배 · 느린 망) 재 보니 swap 이면 큰 글씨가 0.6~1.0초 늦게 떴고, optional 이면 글꼴 바꾸기 전과 거의 같았다(2026-11-21). */
  'ibm-plex-kr': { family: 'IBM Plex Sans KR', wght: '400;700', head: 'IBMPlexSansKR', license: 'fonts.google.com/specimen/IBM+Plex+Sans+KR', latin: true, display: 'optional' },
};
const sh = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

export function fetchFont(key, OUT) {
  const F = FONTS[key];
  const url = `https://fonts.googleapis.com/css2?family=${F.family.replace(/ /g, '+')}${F.wght ? ':wght@' + F.wght : ''}&display=swap`;
  let css = sh('curl', ['-sS', '-A', UA, url]);
  fs.mkdirSync(path.join(OUT, key), { recursive: true });
  const seen = {};
  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) || [];
  if (blocks.length < 20) throw new Error(`${F.family}: 조각이 ${blocks.length}개뿐이다`);
  blocks.forEach((b) => {
    const u = b.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/)?.[1];
    if (!u) throw new Error(`${F.family}: woff2 주소가 없는 블록`);
    const w = b.match(/font-weight:\s*(\d+)/)?.[1] || '400';
    seen[w] = (seen[w] ?? -1) + 1;
    const file = F.wght ? `${F.head}.${w}.${seen[w]}.woff2` : `${F.head}.${seen[w]}.woff2`;
    sh('curl', ['-sS', '-o', path.join(OUT, key, file), u]);
    css = css.replace(u, `./${key}/${file}`);
  });
  if (!F.latin) css = stripLatin(css);
  if (F.display) css = css.replace(/font-display:\s*swap/g, `font-display: ${F.display}`);
  fs.writeFileSync(path.join(OUT, `${key}.css`),
    `/* ${F.family} — SIL Open Font License 1.1\n   ${F.license}\n   tools/vendor.mjs(tools/lib/gf-subsets.mjs) 가 만든다. 손으로 고치지 말 것. */\n` + css.trim() + '\n');
  return blocks.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const key = process.argv[2];
  if (!FONTS[key]) throw new Error('글꼴 이름: ' + Object.keys(FONTS).join(' · '));
  const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'vendor');
  console.log(`${key}.css + 조각 ${fetchFont(key, OUT)}개`);
}
