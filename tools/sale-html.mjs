// 책 반값 한 주(WEEK50) 알림 글 복사판(운영자 2026-11-20 「반값 알리기 글 ㄱㄱ」) — 쓰레드 · 이메일 소식지 · 학생 메시지.
//   node tools/sale-html.mjs <나가는 파일.html>     (copy-hub.mjs 에도 탭으로 들어 있다)
// 행사 값(코드 · 기간 · 할인)은 sale.js 의 SALE 과 같아야 한다 — 다음 행사 때는 아래 SALE 과 글만 바꾼다.
import fs from 'node:fs';
import { esc as e, copyPage } from './lib/copy-page.mjs';

const out = process.argv[2];
if (!out) { console.error('쓰는 법: node tools/sale-html.mjs <파일.html>'); process.exit(1); }
const SALE = { code: 'WEEK50', endKo: '11월 23일(일)', endEn: 'Sunday, Nov 23 (Korea time)', campaign: 'week50' };
const link = (src, medium) => `https://everykoreans.com/shop/?utm_source=${src}&utm_medium=${medium}&utm_campaign=${SALE.campaign}`;
const block = (label, text) => { const n = [...text].length; return `<div class="f"><div class="fh"><b>${e(label)}</b><span>${n}자</span><button type="button" data-c>복사</button></div><pre>${e(text)}</pre></div>`; };

const S = [
  ['1. 쓰레드 (하루 하나, 21~23일)', '본문을 올리고, 올린 뒤 답글에 링크 글을 붙입니다(본문에 링크를 넣으면 덜 보여요). 영어 · 한국어 중 하나만 올려도 됩니다.', [
    ['① 21일(금) · 영어 본문', `All my Korean workbook PDFs are 50% off this week.

$9.90 books are now $4.95. $6.90 books are $3.45.
First Steps, Particles, TOPIK vocabulary, TOPIK writing 51-54, reading mock tests, idioms.

Until ${SALE.endEn}. The code ${SALE.code} goes in by itself at checkout.`],
    ['① 21일(금) · 한국어 본문', `이번 주만 한국어 워크북 PDF 전부 반값이에요.

9.90달러 책은 4.95달러, 6.90달러 책은 3.45달러.
첫걸음 · 조사 · TOPIK 단어장 · TOPIK 쓰기 51~54 · 읽기 모의고사 · 관용 표현.

${SALE.endKo}까지예요. 결제 화면에 코드 ${SALE.code} 가 자동으로 들어가요.`],
    ['① 답글(링크)', `All books, half price: ${link('threads', 'social')}`],
    ['② 22일(토) · 영어 본문 (쓰기)', `TOPIK II writing is where most people lose points.

51-52: fill the blank with the right ending.
53: describe a graph in 200-300 characters.
54: a 600-700 character essay.

My two writing workbooks walk through each one with model answers and checklists. Half price until ${SALE.endEn}.`],
    ['② 22일(토) · 한국어 본문 (쓰기)', `TOPIK II 에서 점수가 가장 많이 빠지는 곳은 쓰기예요.

51~52번: 알맞은 어미로 빈칸 채우기.
53번: 그래프를 200~300자로 설명하기.
54번: 600~700자 글쓰기.

쓰기 워크북 두 권이 번호마다 모범 답안과 점검표로 하나씩 짚어요. ${SALE.endKo}까지 반값이에요.`],
    ['② 답글(링크)', `Writing 51-52 and 53-54, half price: ${link('threads', 'social')}`],
    ['③ 23일(일) · 영어 본문 (마지막 날)', `Last day: Korean workbook PDFs are 50% off until midnight Korea time.

If you have been meaning to start with First Steps, or to get the TOPIK vocabulary set, today is the day.`],
    ['③ 23일(일) · 한국어 본문 (마지막 날)', `오늘이 마지막 날이에요. 한국어 워크북 PDF 반값은 오늘 밤 12시(한국 시간)까지예요.

첫걸음으로 시작하려고 했거나 TOPIK 단어장을 사려고 했다면 오늘이 좋아요.`],
    ['③ 답글(링크)', `Half price ends tonight: ${link('threads', 'social')}`],
  ]],
  ['2. 이메일 소식지 (한 번, 21일 추천)', '이메일을 남긴 사람에게 한 번만 보냅니다. 제목과 본문을 따로 복사하세요.', [
    ['제목', `Korean workbooks 50% off until Nov 23`],
    ['본문 (영어)', `Hi,

This week only, every Korean workbook PDF on Everykoreans is half price.

$9.90 books are now $4.95
$6.90 books are now $3.45

Korean First Steps Workbook, Korean Particles Workbook, TOPIK I vocabulary, TOPIK II vocabulary 1 to 3, TOPIK II writing 51-52 and 53-54, TOPIK I reading mock tests, and Essential Korean Idioms.

The code ${SALE.code} is added at checkout. If you don't see it, type it under "Add discount code".

See all books: ${link('newsletter', 'email')}

The sale ends ${SALE.endEn}.

Thank you for learning with us,
Junsang, Everykoreans`],
  ]],
  ['3. 학생 · 지인에게 (한 명씩)', '아는 학생에게만, 한 명씩 보냅니다. 같은 글을 단체방에 뿌리지 않아요.', [
    ['한국어 (카톡 · DM)', `안녕하세요! 에브리코리안즈예요 :)
이번 주(${SALE.endKo}까지)만 제 한국어 워크북 PDF 를 전부 반값으로 열었어요. 9.90달러 책은 4.95달러예요.
필요한 책이 있으면 이 기회에 보세요: ${link('dm', 'message')}
결제 화면에 할인 코드(${SALE.code})가 자동으로 들어가요. 혹시 안 보이면 말씀해 주세요!`],
    ['English (DM · email)', `Hi! Quick note from Everykoreans: this week only (until ${SALE.endEn}) all my Korean workbook PDFs are half price, so $9.90 books are $4.95.
If one of them would help you, now is a good time: ${link('dm', 'message')}
The code ${SALE.code} is added at checkout automatically. If it isn't, just tell me and I'll help.`],
  ]],
];
const body = `<h1>책 반값 한 주 알림 글 (${SALE.code})</h1>
<div class="top"><b>쓰는 법</b>: ① 쓰레드는 날짜에 맞춰 하루 하나 ② 이메일은 한 번 ③ 학생 메시지는 한 명씩. 링크마다 꼬리표(utm)가 달려 있어 어디서 몇 명이 왔는지 숫자 판에 따로 찍혀요. 행사는 <b>${e(SALE.endKo)} 밤 12시(한국 시간)</b>에 끝나요.</div>
${S.map(([h, note, items]) => `<section><h2>${e(h)}</h2><p class="note">${e(note)}</p>${items.map(([l, t]) => block(l, t)).join('')}</section>`).join('\n')}`;
fs.writeFileSync(out, copyPage({ title: `책 반값 알림 글 (${SALE.code})`, width: 860, h2: [30, 12], css: 'pre{margin:6px 0 0;white-space:pre-wrap;font:inherit}.note{color:#6b5844;font-size:13px;margin:0 0 6px}', body }));
console.log(`반값 알림 글 ${S.reduce((a, s) => a + s[2].length, 0)}개 → ${out}`);
