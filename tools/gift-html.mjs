// 선물 · 소개 요청 메시지 복사판(운영자 2026-10-29 「문안 만들어줘」). 코드는 안 넣는다 — 칸의 {링크} 자리에 받는 사람표(gift-codes.mjs 의 CSV)에서 한 줄씩 붙인다.
//   node tools/gift-html.mjs <나가는 파일.html>     (copy-hub.mjs 에도 탭으로 들어 있다)
import fs from 'node:fs';
import { esc as e, copyPage } from './lib/copy-page.mjs';

const out = process.argv[2];
if (!out) { console.error('쓰는 법: node tools/gift-html.mjs <파일.html>'); process.exit(1); }
const block = (label, text) => { const n = [...text].length; return `<div class="f"><div class="fh"><b>${e(label)}</b><span>${n}자</span><button type="button" data-c>복사</button></div><pre>${e(text)}</pre></div>`; };
const S = [
  ['1. 지금 아는 학생 · 지인에게 (한국어)', '한 명씩 보내세요. {이름} · {링크} 만 바꿔서.', [
    ['카톡 · DM', `{이름}님, 안녕하세요! 에브리코리안즈예요 :)
요즘 한국어 공부 사이트(치즈감자)랑 교재를 만들고 있어요. 먼저 써 보시고 솔직한 의견을 듣고 싶어서 Pro 90일 이용권을 선물로 드려요.

아래 링크로 들어가서 무료 가입하면 자동으로 열려요(결제 정보는 필요 없어요):
{링크}

마음에 드시면 주변 한국어 공부하는 분께 알려 주시면 정말 큰 힘이 돼요. 부담은 전혀 갖지 마시고, 불편한 점이 있으면 편하게 말씀해 주세요!
교재 PDF도 한 권 필요하시면 말씀해 주세요. 보내 드릴게요.`],
  ]],
  ['2. 지금 아는 학생 (영어)', 'For current or former students. Replace {name} and {link}.', [
    ['DM · email', `Hi {name}! It's Everykoreans (your Korean teacher). I've been building a Korean study site (CheesePotato) and workbooks, and I'd love your honest opinion before I tell more people.

Here is a free 90-day Pro pass for you. Open the link and sign up (free, no payment details needed) and Pro turns on automatically:
{link}

If you like it, telling a friend who is learning Korean would mean a lot — but no pressure at all. And if something is confusing or broken, please tell me! If you'd like one of my workbook PDFs, just reply and I'll send it.`],
  ]],
  ['3. 처음 연락하는 한국어 학습 계정에게 (영어)', '{handle} · {what} 는 그 계정에서 본 구체적인 것으로 바꾸세요(예: 「your TOPIK vocab reels」). 같은 글을 여러 곳에 복사해 보내지 않습니다.', [
    ['DM 첫 메시지', `Hi {handle}! I'm a Korean teacher and I make free Korean study tools and workbooks (CheesePotato / Everykoreans). I really liked {what}.

I'd like to give you a free 90-day Pro pass and any of my workbook PDFs, no strings attached — I'd just love your honest feedback. If you find it useful and want to mention it to your followers, that would be wonderful (and if you do, please note that it was a gift, as your platform asks).

Your Pro link (sign up free, it turns on automatically): {link}

Happy to answer any question. Thank you for the great content!`],
    ['한 번만 하는 후속(7일 뒤, 답이 없을 때)', `Hi {handle}, just a quick follow-up in case my message got buried — the Pro pass is yours whenever you'd like it: {link}. No worries at all if it's not a fit. Thanks again for your content!`],
  ]],
  ['4. 처음 연락하는 한국어 학습 계정에게 (한국어)', '한국어로 활동하는 계정용.', [
    ['DM 첫 메시지', `안녕하세요 {handle}님! 한국어 선생님이고, 무료 학습 도구와 교재(치즈감자 · 에브리코리안즈)를 만들고 있어요. {what} 잘 보고 있어요.

Pro 90일 이용권과 교재 PDF 한 권을 아무 조건 없이 선물로 드리고 싶어요. 솔직한 의견만 들려주셔도 큰 도움이 돼요. 써 보시고 마음에 드셔서 소개해 주신다면 정말 감사하고요, 그럴 땐 「선물 받음」이라고 밝혀 주세요(플랫폼 규정에 맞게).

아래 링크로 무료 가입하면 자동으로 열려요: {링크}

궁금한 점은 편하게 물어봐 주세요. 감사합니다!`],
  ]],
  ['5. 받은 뒤에 (고마움 · 소개 부탁)', '써 본 뒤 3~5일 지나서, 한 번만.', [
    ['한국어', `{이름}님, 써 보셨나요? 어떠셨는지 한 줄만 들려 주시면 큰 도움이 돼요(좋은 점도, 불편한 점도요). 마음에 드셨다면 주변 한국어 공부하는 분께 이 링크로 소개해 주세요: https://everykoreans.com/?utm_source=friend
선물로 받으신 건 소개하실 때 한 마디만 밝혀 주세요. 감사합니다!`],
    ['English', `Hi {name}, have you had a chance to try it? A line or two of honest feedback (good or bad) would help a lot. If you'd like to share it with a friend who is learning Korean, here's the link: https://everykoreans.com/?utm_source=friend
If you mention it publicly, please say it was a gift. Thank you!`],
  ]],
  ['6. 소개 글을 올릴 때 붙일 문구 (받는 사람에게 알려 주기)', '강요하지 말고, 「이렇게 쓰면 좋아요」로만.', [
    ['영어', `Gifted: I was given a free Pro pass by Everykoreans to try. Opinions are my own.`],
    ['한국어', `선물 받음: 에브리코리안즈에서 Pro 이용권을 선물로 받아 써 봤어요. 의견은 제 솔직한 생각이에요.`],
  ]],
];
const body = `<h1>선물 · 소개 요청 메시지</h1>
<div class="top"><b>쓰는 법</b>: ① <code>node tools/gift-codes.mjs</code> 로 만든 SQL 을 Supabase 에서 돌리고(코드 열림) ② 받는 사람표(CSV)에서 한 줄을 골라 <b>{링크}</b> 에 붙이고 ③ 한 명씩 보냅니다. <b>대량 복사 · 한꺼번에 발송은 하지 마세요</b> — 받는 사람마다 한 통씩. ④ 보낸 날 · 답장을 표에 적어 둡니다. 좋은 평가를 강요하지 않습니다 · 선물 받았다는 말을 밝히도록 안내합니다 · 돈 거래는 없습니다.</div>
${S.map(([h, note, items]) => `<section><h2>${e(h)}</h2><p class="note">${e(note)}</p>${items.map(([l, t]) => block(l, t)).join('')}</section>`).join('\n')}`;
fs.writeFileSync(out, copyPage({ title: '선물 · 소개 요청 메시지', width: 860, h2: [30, 12], css: 'pre{margin:6px 0 0;white-space:pre-wrap;font:inherit}.note{color:#6b5844;font-size:13px;margin:0 0 6px}code{background:#f1ead9;padding:1px 5px;border-radius:4px}', body }));
console.log(`선물 · 소개 요청 메시지 ${S.reduce((a, s) => a + s[2].length, 0)}개 → ${out}`);
