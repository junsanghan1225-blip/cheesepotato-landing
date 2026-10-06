/* 가격 · 이용약관 · 환불 규정 쪽을 만든다 — pricing.html · terms.html · refund.html
     node tools/build-legal.mjs
   결제 판매 대행사(지금 Polar — 2026-10-03 Paddle 에서 옮김)의 심사가 이 세 쪽을 본다(가격이 보이는 쪽, 약관, 환불 규정).
   모양은 privacy.html 을 그대로 따른다 — 머리(<style>)를 거기서 떼어 온다.
   가격을 바꾸면 billing.js 의 BILLING.show 와 여기 PRICE 를 같이 고친다.

   ※ 사업자 정보(SELLER)는 사업자등록을 마치면 채운다. 한국에서 파는 쪽은
     전자상거래법상 상호·대표자·사업자등록번호·통신판매업 신고번호·주소를
     보여야 한다. 비어 있는 칸은 쪽에 안 나온다. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PRICE = { monthly: '$4.99', yearly: '$39', pass: '$15', passMonths: 3, trialDays: 7 };   // 시험 패스 · 7일 체험(2026-10-04) — billing.js BILLING 과 같이 고친다
const EMAIL = 'junsanghan1225@gmail.com';
const UPDATED = '2026-10-04';
const SELLER = {
  name: '에브리코리안즈 (everykoreans · 치즈감자)',
  owner: '',        // 대표자
  bizNo: '202-43-01897',   // 사업자등록번호
  mailOrder: '',    // 통신판매업 신고번호
  address: '',
};

const priv = fs.readFileSync(path.join(ROOT, 'privacy.html'), 'utf8');
const style = priv.slice(priv.indexOf('<style>'), priv.indexOf('</style>') + 8);

/* 가격 쪽에만 GA(운영자 결정 2026-10-06 — 「가격을 보고 → 결제」 흐름을 재려고). 약관 · 환불 쪽은 스크립트 없이 그대로.
   허용 주소는 index.html 의 CSP 와 같은 것(analytics.js 가 GTM · Clarity 를 부른다). */
const CSP_PLAIN = "default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'none'; object-src 'none'; frame-src 'none'";
const CSP_GA = "default-src 'self'; script-src 'self' https://www.clarity.ms https://*.clarity.ms https://www.googletagmanager.com https://*.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com; " +
  "style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https://*.clarity.ms https://c.bing.com https://*.google-analytics.com https://*.googletagmanager.com https://googleads.g.doubleclick.net https://www.google.com https://www.google.co.kr; " +
  "connect-src 'self' https://*.clarity.ms https://c.bing.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.googletagmanager.com https://googleads.g.doubleclick.net https://www.google.com https://pagead2.googlesyndication.com; " +
  "frame-src https://www.googletagmanager.com https://td.doubleclick.net; base-uri 'self'; form-action 'none'; object-src 'none'";
const page = (file, title, desc, body, ga = false) => `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — 치즈감자</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="https://everykoreans.com/${file}">
<!-- tools/build-legal.mjs 가 만든다. 손으로 고치지 말 것. ${ga ? '스크립트는 방문 세기(gtm.js · analytics.js)뿐.' : '스크립트가 한 줄도 없다.'} -->
<meta http-equiv="Content-Security-Policy" content="${ga ? CSP_GA : CSP_PLAIN}">${ga ? '\n<script src="/gtm.js" async></script>\n<script src="/analytics.js" defer></script>' : ''}
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="stylesheet" href="vendor/pretendard.css">
${style}
<style>
.plans { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; margin:22px 0; }
.plan { background:var(--surface); border:1px solid var(--line); border-radius:18px; padding:22px; }
.plan b { display:block; font-size:30px; color:var(--ink); letter-spacing:-.03em; margin:4px 0; }
.plan { position:relative; line-height:1.6; }
.plan small { color:var(--ink-3); font-size:12.5px; }
.plan.best { border:2px solid #C4551C; }
.plan .tag { position:absolute; top:-11px; left:18px; background:#C4551C; color:#fff; font-size:12px; font-weight:700; padding:2px 10px; border-radius:99px; }
.buy { margin:6px 0 10px; }
.promise { font-size:14px; color:#1D7A55; margin:12px 0 0; line-height:1.7; }
.promise span { color:var(--ink-3); font-size:13px; }
.cmp { width:100%; border-collapse:collapse; margin:14px 0 8px; font-size:14.5px; background:var(--surface); border-radius:14px; overflow:hidden; border:1px solid var(--line); }
.cmp th, .cmp td { padding:11px 12px; border-bottom:1px solid var(--line-2); text-align:left; vertical-align:top; word-break:keep-all; }
.cmp thead th { font-size:13px; color:var(--ink-3); font-weight:700; background:var(--tint); }
.cmp tbody th { font-weight:600; color:var(--ink); width:48%; }
.cmp td { color:var(--ink-2); width:26%; }
.cmp .pro { color:var(--ink); }
.cmp thead .pro { color:#C4551C; }
.cmp tr:last-child th, .cmp tr:last-child td { border-bottom:0; }
@media (max-width:520px) { .cmp { font-size:13.5px; } .cmp th, .cmp td { padding:9px 8px; } .cmp tbody th { width:44%; } }
.cta { display:inline-block; margin-top:8px; padding:13px 22px; border-radius:12px; background:#C4551C; color:#fff !important; font-weight:700; text-decoration:none; }
.seller { font-size:13px; color:var(--ink-3); border-top:1px solid var(--line); margin-top:48px; padding-top:18px; line-height:1.8; }
</style>
</head>
<body>
<header class="hd"><div class="hd-in">
  <a href="/"><img src="logo.png" alt=""><span>치즈감자</span></a>
</div></header>
<main>
${body}
<div class="seller">
${[['판매자 · Seller', SELLER.name], ['대표자', SELLER.owner], ['사업자등록번호', SELLER.bizNo],
   ['통신판매업 신고번호', SELLER.mailOrder], ['주소', SELLER.address], ['문의 · Contact', EMAIL]]
  .filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('<br>')}<br>
결제·세금 처리 · Merchant of Record: Polar (polar.sh)
</div>
<p class="seller" style="border:0;margin-top:8px;padding-top:0"><a href="/pricing.html">가격 · Pricing</a> · <a href="/terms.html">이용약관 · Terms</a> · <a href="/refund.html">환불 규정 · Refunds</a> · <a href="/privacy.html">개인정보처리방침 · Privacy</a></p>
<a class="back" href="/">← 홈으로</a>
</main>
</body>
</html>
`;

/* 가격 쪽. 사는 사람이 가장 먼저 묻는 것 — 「무료로 뭐가 되고, 돈을 내면 뭐가 더 되나」 —
   를 표 하나로 답한다. 환불 약속은 구독 단추 바로 옆에 둔다(약속이 있어도 안 보이면 없는 것과 같다).
   표의 줄은 실제로 되는 것만 적는다. 숫자를 바꾸면 app.module.js 의 PRO_FEATURES 와
   supabase/functions/grade-writing 의 LIMIT 도 같이 바꾼다. */
const ROWS = [
  ['코스 97개 · 레슨 401개 · 문법 표현 290개 · 사전', 'Courses, lessons, grammar points, dictionary', '✓', '✓'],
  ['레벨테스트 · 내 코스', 'Level test · My course', '✓', '✓'],
  ['TOPIK 유형별 연습 문제 917개', 'TOPIK practice questions by type (917)', '✓', '✓'],
  ['EPS-TOPIK 연습 · 모의고사', 'EPS-TOPIK practice and mock tests', '✓', '✓'],
  ['TOPIK 모의고사', 'TOPIK mock tests', '1회차', '<b>전 회차 + 회차별 성적 추이</b>'],
  ['TOPIK 쓰기 53·54번 AI 채점', 'AI scoring for TOPIK writing Q53–54', '하루 2번 (로그인)', '<b>하루 30번</b>'],
  ['AI 발음 진단 · 한국어 도우미', 'AI pronunciation feedback · Korean helper', '하루 20번 (로그인)', '<b>하루 100번</b>'],
  ['TOPIK 약점 리포트 · 합격 계획표', 'TOPIK weak-spot report · exam plan', '가장 약한 유형 하나', '<b>전체 리포트 + 계획표</b>'],
  ['TOPIK 모의고사 인쇄본(PDF · 문제지 · 답안지 · 정답)', 'Printable TOPIK mock exams (PDF · paper, answer sheet, key)', '제1 · 2회', '<b>전 회차</b>'],
  ['앞으로 나올 Pro 기능', 'Every Pro feature we add next', '—', '✓'],
];
const EN_CELL = { '1회차': 'Round 1', '하루 2번 (로그인)': '2 a day (signed in)', '하루 20번 (로그인)': '20 a day (signed in)', '가장 약한 유형 하나': 'Your weakest type', '<b>전체 리포트 + 계획표</b>': '<b>Full report + plan</b>', '<b>하루 100번</b>': '<b>100 a day</b>',
  '<b>전 회차 + 회차별 성적 추이</b>': '<b>Every round + score history</b>', '<b>하루 30번</b>': '<b>30 a day</b>',
  '<b>하루 더 많이</b>': '<b>More each day</b>', '제1 · 2회': 'Rounds 1–2', '<b>전 회차</b>': '<b>Every round</b>' };
const table = (en) => `<table class="cmp"><thead><tr><th></th><th>${en ? 'Free' : '무료'}</th><th class="pro">Pro</th></tr></thead><tbody>` +
  ROWS.map(([ko, e, f, p]) => `<tr><th>${en ? e : ko}</th><td>${en ? (EN_CELL[f] || f) : f}</td><td class="pro">${en ? (EN_CELL[p] || p) : p}</td></tr>`).join('') +
  '</tbody></table>';

const pricing = page('pricing.html', '가격 · Pricing', '치즈감자 Pro 구독 가격 — 무료와 Pro 비교. Pricing for CheesePotato Pro: free vs Pro.', `
<h1>가격 · Pricing</h1>
<p>치즈감자는 <strong>대부분 무료</strong>입니다. 시험 준비를 끝까지 하고 싶을 때 <strong>치즈감자 Pro</strong> 를 더하세요.</p>
<div class="plans">
  <div class="plan best"><span class="tag">추천 · Best value</span>1년 · Yearly<b>${PRICE.yearly}</b>한 달 $3.25꼴 · 35% 싸요<br><small>매년 자동 갱신 · billed yearly</small></div>
  <div class="plan">한 달 · Monthly<b>${PRICE.monthly}</b>부담 없이 한 달부터<br><small>매달 자동 갱신 · billed monthly</small></div>
  <div class="plan">시험 패스 · Exam Pass<b>${PRICE.pass}</b>${PRICE.passMonths}개월 동안 Pro · 한 번 결제<br><small>자동 갱신 없음 · one-time, no renewal</small></div>
</div>
<p class="promise">✓ 한 달 · 1년 구독은 <strong>${PRICE.trialDays}일 무료 체험</strong>으로 시작해요 — 체험이 끝나기 전에 해지하면 돈이 나가지 않습니다.<br>
<span>Monthly and yearly plans start with a ${PRICE.trialDays}-day free trial — cancel before it ends and you pay nothing.</span></p>
<div class="buy">
  <a class="cta" href="/?pro=1">Pro 구독하기 · Subscribe</a>
  <p class="promise">✓ 처음 결제한 뒤 <strong>14일 안에는 이유를 묻지 않고 전액 환불</strong> · ✓ 언제든 해지, 낸 기간 끝까지 사용<br>
  <span>Full refund within 14 days, no questions asked · Cancel anytime</span></p>
</div>

<h2>무료와 Pro · Free vs Pro</h2>
${table(false)}

<h2>자주 묻는 것</h2>
<h3>해지는 어떻게 하나요?</h3>
<p>내 계정 → 구독 정보 → 「구독 관리 · 해지」에서 바로 할 수 있습니다. 해지해도 이미 낸 기간이 끝날 때까지 Pro 를 씁니다.</p>
<h3>환불은요?</h3>
<p>처음 결제한 뒤 14일 안이면 이유를 묻지 않고 전액 돌려 드립니다(시험 패스도 같습니다). 연 구독이 자동 갱신된 뒤 14일 안에 알려 주셔도 갱신분을 전액 환불합니다(<a href="/refund.html">환불 규정</a>).</p>
<h3>시험 패스는 무엇이 다른가요?</h3>
<p>한 번만 결제하고 ${PRICE.passMonths}개월 동안 Pro 를 그대로 씁니다. 자동 갱신이 없어서 기간이 끝나면 저절로 무료로 돌아가고, 카드에서 다시 빠져나가지 않습니다. 기간 안에 한 번 더 사면 남은 기간에 이어 붙습니다.</p>
<h3>어떻게 결제하나요?</h3>
<p>결제 · 세금 · 영수증은 판매 대행사 Polar 가 처리합니다. 카드로 낼 수 있고, 나라에 따라 다른 결제 수단이 함께 보일 수 있습니다. 표시 가격은 미국 달러 기준이며 나라에 따라 부가세가 더해질 수 있습니다.</p>
<h3>무료 기능이 줄어들 수도 있나요?</h3>
<p>아니요. 위 표에서 무료로 적힌 것은 Pro 가 생겨도 그대로 무료입니다.</p>

<hr>
<h2>English</h2>
<p>Most of CheesePotato is <strong>free</strong>. Add <strong>CheesePotato Pro</strong> when you want to prepare all the way to the exam:
<strong>${PRICE.yearly} / year</strong> (about $3.25 a month, save 35%) or <strong>${PRICE.monthly} / month</strong>, renewing automatically, each starting with a ${PRICE.trialDays}-day free trial — or the <strong>Exam Pass</strong>: ${PRICE.pass} once for ${PRICE.passMonths} months, no renewal.</p>
${table(true)}
<p>Cancel anytime from your account and keep Pro until the end of the period you paid for. <strong>Full refund within 14 days of your first payment, no questions asked</strong> (<a href="/refund.html">refund policy</a>). Payments, tax and receipts are handled by our reseller Polar; prices are in US dollars and VAT or sales tax may be added depending on your country. Everything marked free above stays free.</p>
<a class="cta" href="/?pro=1">Subscribe to Pro</a>
<p class="seller" style="border:0;margin-top:18px;padding-top:0">최종 수정 · Last updated: ${UPDATED}</p>
`, true);   // 가격 쪽만 GA

const terms = page('terms.html', '이용약관 · Terms of Service', '치즈감자 이용약관입니다. Terms of Service for CheesePotato.', `
<h1>이용약관 · Terms of Service</h1>
<p>최종 수정일: ${UPDATED}</p>
<h2>1. 서비스</h2>
<p>치즈감자(everykoreans.com, 이하 「서비스」)는 한국어 학습 웹사이트입니다. 대부분의 기능은 무료이며, 일부 기능은 유료 구독 「치즈감자 Pro」로 제공합니다.</p>
<h2>2. 계정</h2>
<p>일부 기능은 로그인이 필요합니다. 계정 정보는 본인이 관리하며, 다른 사람과 계정을 나눠 쓰지 않습니다. 만 14세 미만은 보호자 동의 없이 가입할 수 없습니다.</p>
<h2>3. 유료 구독</h2>
<ul>
<li>가격은 <a href="/pricing.html">가격 쪽</a>에 적힌 대로이며, 월 또는 연 구독은 자동 갱신됩니다. 월 · 연 구독은 ${PRICE.trialDays}일 무료 체험으로 시작하며, 체험이 끝나기 전에 해지하면 요금이 청구되지 않습니다.</li>
<li>「시험 패스」는 한 번 결제로 ${PRICE.passMonths}개월 동안 Pro 기능을 쓰는 상품이며 자동 갱신되지 않습니다.</li>
<li>결제 · 세금 처리 · 영수증 발급은 판매 대행사 <strong>Polar</strong>(polar.sh)가 합니다. 결제에는 Polar 의 구매자 약관도 함께 적용됩니다.</li>
<li>언제든 해지할 수 있습니다. 해지하면 다음 갱신이 멈추고, 이미 낸 기간이 끝날 때까지 Pro 기능을 쓸 수 있습니다.</li>
<li>환불은 <a href="/refund.html">환불 규정</a>을 따릅니다.</li>
<li>가격을 바꿀 때는 적어도 30일 전에 알리며, 이미 구독 중인 기간에는 적용하지 않습니다.</li>
</ul>
<h2>4. 이용 규칙</h2>
<p>서비스를 자동화 도구로 긁어 가거나, 다른 이용자를 방해하거나, 법에 어긋나는 자료를 자료마당에 올려서는 안 됩니다. 어기면 계정 이용을 멈출 수 있습니다.</p>
<h2>5. 콘텐츠</h2>
<p>서비스의 학습 자료에 대한 권리는 운영자에게 있습니다. 개인 학습을 위해서는 자유롭게 쓸 수 있습니다. 이용자가 자료마당에 올린 자료의 권리는 올린 사람에게 있습니다.</p>
<h2>6. 책임의 한계</h2>
<p>학습 자료와 AI 기능의 답은 정확하도록 애쓰지만 틀릴 수 있습니다. 시험 합격이나 특정 결과를 보장하지 않습니다. 서비스는 점검 등으로 잠시 멈출 수 있습니다.</p>
<h2>7. 변경</h2>
<p>약관을 바꾸면 이 쪽에 알립니다. 중요한 변경은 적용 7일 전에 알립니다.</p>
<h2>8. 문의</h2>
<p><code>${EMAIL}</code></p>
<hr>
<h1>English</h1>
<h2>1. Service</h2>
<p>CheesePotato (everykoreans.com, "the Service") is a Korean-learning website. Most features are free; some are offered through a paid subscription, "CheesePotato Pro".</p>
<h2>2. Accounts</h2>
<p>Some features require an account. You are responsible for your account and must not share it. Users under 14 need parental consent.</p>
<h2>3. Subscriptions</h2>
<ul>
<li>Prices are as shown on the <a href="/pricing.html">pricing page</a>. Monthly and yearly plans renew automatically and start with a ${PRICE.trialDays}-day free trial; cancel before it ends and you are not charged.</li>
<li>The "Exam Pass" is a one-time purchase that gives Pro features for ${PRICE.passMonths} months and does not renew.</li>
<li>Our order process is conducted by our online reseller <strong>Polar</strong> (polar.sh). Polar is the Merchant of Record for all our orders and handles payment, taxes, invoices and billing inquiries. Polar's buyer terms also apply to your purchase.</li>
<li>You can cancel anytime. Cancelling stops the next renewal; you keep Pro until the end of the period you paid for.</li>
<li>Refunds follow our <a href="/refund.html">refund policy</a>.</li>
<li>We will give at least 30 days' notice before changing prices, and changes never apply to a period you have already paid for.</li>
</ul>
<h2>4. Acceptable use</h2>
<p>Do not scrape the Service with automated tools, disrupt other users, or upload unlawful material to the Library. We may suspend accounts that do.</p>
<h2>5. Content</h2>
<p>Learning materials on the Service belong to us; you may use them freely for personal study. Material you upload to the Library remains yours.</p>
<h2>6. Limitation of liability</h2>
<p>We work to keep our materials and AI answers accurate, but they may contain errors. We do not guarantee exam results. The Service may be interrupted for maintenance.</p>
<h2>7. Changes</h2>
<p>We will post changes to these terms on this page, with 7 days' notice for material changes.</p>
<h2>8. Contact</h2>
<p><code>${EMAIL}</code></p>
`);

const refund = page('refund.html', '환불 규정 · Refund Policy', '치즈감자 Pro 환불 규정입니다. Refund policy for CheesePotato Pro.', `
<h1>환불 규정 · Refund Policy</h1>
<p>최종 수정일: ${UPDATED}</p>
<ul>
<li><strong>처음 결제한 뒤 14일 안에는 이유를 묻지 않고 전액 환불합니다.</strong> 월 구독 · 연 구독 · 시험 패스 모두 같습니다. (무료 체험 기간에는 결제가 없으니 해지만 하면 됩니다.)</li>
<li>14일이 지난 뒤에는 남은 기간을 나눠 돌려 드리지 않습니다. 대신 언제든 해지할 수 있고, 해지해도 이미 낸 기간이 끝날 때까지 Pro 를 쓸 수 있습니다.</li>
<li>서비스 장애로 Pro 기능을 쓰지 못한 경우에는 기간과 관계없이 환불하거나 기간을 늘려 드립니다.</li>
<li>연 구독이 자동 갱신된 뒤 14일 안에 알려 주시면 갱신분을 전액 환불합니다.</li>
</ul>
<h2>환불 요청</h2>
<p>결제 영수증 이메일(Polar 가 보냄)에 답장하거나, <code>${EMAIL}</code> 로 결제에 쓴 이메일 주소를 적어 보내 주세요. 환불은 Polar 가 처리하며, 원래 결제 수단으로 5~10 영업일 안에 들어갑니다.</p>
<hr>
<h1>English</h1>
<ul>
<li><strong>Full refund within 14 days of your first payment, no questions asked</strong> — monthly, yearly and the Exam Pass alike. (Nothing is charged during the free trial — just cancel.)</li>
<li>After 14 days we do not give partial refunds for the remaining period. You can cancel anytime and keep Pro until the end of the period you paid for.</li>
<li>If an outage prevented you from using Pro, we will refund or extend your subscription regardless of timing.</li>
<li>If a yearly plan renews automatically, tell us within 14 days of the renewal for a full refund of that renewal.</li>
</ul>
<h2>How to request a refund</h2>
<p>Reply to your receipt email from Polar, or write to <code>${EMAIL}</code> with the email address you paid with. Refunds are processed by Polar to your original payment method, usually within 5–10 business days.</p>
`);

fs.writeFileSync(path.join(ROOT, 'pricing.html'), pricing);
fs.writeFileSync(path.join(ROOT, 'terms.html'), terms);
fs.writeFileSync(path.join(ROOT, 'refund.html'), refund);
console.log('pricing.html · terms.html · refund.html 을 만들었다.');
