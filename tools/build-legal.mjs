/* 가격 · 이용약관 · 환불 규정 쪽을 만든다 — pricing.html · terms.html · refund.html
     node tools/build-legal.mjs
   Paddle 가입 심사가 이 세 쪽을 본다(가격이 보이는 쪽, 약관, 환불 규정).
   모양은 privacy.html 을 그대로 따른다 — 머리(<style>)를 거기서 떼어 온다.
   가격을 바꾸면 billing.js 의 BILLING.show 와 여기 PRICE 를 같이 고친다.

   ※ 사업자 정보(SELLER)는 사업자등록을 마치면 채운다. 한국에서 파는 쪽은
     전자상거래법상 상호·대표자·사업자등록번호·통신판매업 신고번호·주소를
     보여야 한다. 비어 있는 칸은 쪽에 안 나온다. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PRICE = { monthly: '$4.99', yearly: '$39' };
const EMAIL = 'junsanghan1225@gmail.com';
const UPDATED = '2026-09-25';
const SELLER = {
  name: 'everykoreans (치즈감자)',
  owner: '',        // 대표자
  bizNo: '',        // 사업자등록번호
  mailOrder: '',    // 통신판매업 신고번호
  address: '',
};

const priv = fs.readFileSync(path.join(ROOT, 'privacy.html'), 'utf8');
const style = priv.slice(priv.indexOf('<style>'), priv.indexOf('</style>') + 8);

const page = (file, title, desc, body) => `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — 치즈감자</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="https://everykoreans.com/${file}">
<!-- tools/build-legal.mjs 가 만든다. 손으로 고치지 말 것. 스크립트가 한 줄도 없다. -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'none'; object-src 'none'; frame-src 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="stylesheet" href="vendor/pretendard.css">
${style}
<style>
.plans { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; margin:22px 0; }
.plan { background:var(--surface); border:1px solid var(--line); border-radius:18px; padding:22px; }
.plan b { display:block; font-size:30px; color:var(--ink); letter-spacing:-.03em; margin:4px 0; }
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
결제·세금 처리 · Merchant of Record: Paddle.com Market Ltd.
</div>
<a class="back" href="/">← 홈으로</a>
</main>
</body>
</html>
`;

const pricing = page('pricing.html', '가격 · Pricing', '치즈감자 Pro 구독 가격입니다. Pricing for CheesePotato Pro.', `
<h1>가격 · Pricing</h1>
<p>치즈감자의 코스 · 문법 표현 · 사전 · 레벨테스트 · TOPIK 연습 문제는 <strong>무료</strong>입니다.
<strong>치즈감자 Pro</strong> 를 구독하면 아래가 더 열립니다.</p>
<ul>
<li>TOPIK 모의고사 전 회차와 성적 기록</li>
<li>AI 발음 진단 · 한국어 도우미를 하루에 더 많이</li>
<li>앞으로 나올 Pro 기능 전부</li>
</ul>
<div class="plans">
  <div class="plan">한 달 · Monthly<b>${PRICE.monthly}</b>매달 자동 갱신 · billed monthly</div>
  <div class="plan">1년 · Yearly<b>${PRICE.yearly}</b>매년 자동 갱신 · billed yearly (≈35% off)</div>
</div>
<p>언제든 해지할 수 있고, 해지해도 이미 낸 기간 끝까지 쓸 수 있습니다. 처음 결제한 뒤 14일 안에는 이유를 묻지 않고 전액 환불합니다(<a href="/refund.html">환불 규정</a>).
표시 가격은 미국 달러 기준이며, 나라에 따라 부가세가 더해질 수 있습니다.</p>
<a class="cta" href="/?pro=1">Pro 구독하기 · Subscribe</a>
<hr>
<h2>English</h2>
<p>Courses, grammar, the dictionary, the level test and TOPIK practice questions on CheesePotato are <strong>free</strong>.
<strong>CheesePotato Pro</strong> adds every TOPIK mock round with your score history, more AI pronunciation feedback and Korean-helper questions each day, and every Pro feature we add next.</p>
<p><strong>${PRICE.monthly} / month</strong> or <strong>${PRICE.yearly} / year</strong>, renewing automatically. Cancel anytime and keep access until the end of the period you paid for. Full refund within 14 days of your first payment, no questions asked (<a href="/refund.html">refund policy</a>). Prices are in US dollars; sales tax or VAT may be added depending on your country.</p>
<p class="seller" style="border:0;margin-top:0;padding-top:0">최종 수정 · Last updated: ${UPDATED}</p>
`);

const terms = page('terms.html', '이용약관 · Terms of Service', '치즈감자 이용약관입니다. Terms of Service for CheesePotato.', `
<h1>이용약관 · Terms of Service</h1>
<p>최종 수정일: ${UPDATED}</p>
<h2>1. 서비스</h2>
<p>치즈감자(everykoreans.com, 이하 「서비스」)는 한국어 학습 웹사이트입니다. 대부분의 기능은 무료이며, 일부 기능은 유료 구독 「치즈감자 Pro」로 제공합니다.</p>
<h2>2. 계정</h2>
<p>일부 기능은 로그인이 필요합니다. 계정 정보는 본인이 관리하며, 다른 사람과 계정을 나눠 쓰지 않습니다. 만 14세 미만은 보호자 동의 없이 가입할 수 없습니다.</p>
<h2>3. 유료 구독</h2>
<ul>
<li>가격은 <a href="/pricing.html">가격 쪽</a>에 적힌 대로이며, 월 또는 연 단위로 자동 갱신됩니다.</li>
<li>결제 · 세금 처리 · 영수증 발급은 판매 대행사 <strong>Paddle</strong>(Paddle.com Market Ltd.)이 합니다. 결제에는 Paddle 의 구매자 약관도 함께 적용됩니다.</li>
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
<li>Prices are as shown on the <a href="/pricing.html">pricing page</a> and renew automatically each month or year.</li>
<li>Our order process is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is the Merchant of Record for all our orders and handles payment, taxes, invoices and customer service inquiries about billing. Paddle's buyer terms also apply to your purchase.</li>
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
<li><strong>처음 결제한 뒤 14일 안에는 이유를 묻지 않고 전액 환불합니다.</strong> 월 구독 · 연 구독 모두 같습니다.</li>
<li>14일이 지난 뒤에는 남은 기간을 나눠 돌려 드리지 않습니다. 대신 언제든 해지할 수 있고, 해지해도 이미 낸 기간이 끝날 때까지 Pro 를 쓸 수 있습니다.</li>
<li>서비스 장애로 Pro 기능을 쓰지 못한 경우에는 기간과 관계없이 환불하거나 기간을 늘려 드립니다.</li>
<li>연 구독이 자동 갱신된 뒤 14일 안에 알려 주시면 갱신분을 전액 환불합니다.</li>
</ul>
<h2>환불 요청</h2>
<p>결제 영수증 이메일(Paddle 이 보냄)의 링크로 요청하거나, <code>${EMAIL}</code> 로 결제에 쓴 이메일 주소를 적어 보내 주세요. 환불은 Paddle 이 처리하며, 원래 결제 수단으로 5~10 영업일 안에 들어갑니다.</p>
<hr>
<h1>English</h1>
<ul>
<li><strong>Full refund within 14 days of your first payment, no questions asked</strong> — monthly and yearly plans alike.</li>
<li>After 14 days we do not give partial refunds for the remaining period. You can cancel anytime and keep Pro until the end of the period you paid for.</li>
<li>If an outage prevented you from using Pro, we will refund or extend your subscription regardless of timing.</li>
<li>If a yearly plan renews automatically, tell us within 14 days of the renewal for a full refund of that renewal.</li>
</ul>
<h2>How to request a refund</h2>
<p>Use the link in your receipt email from Paddle, or write to <code>${EMAIL}</code> with the email address you paid with. Refunds are processed by Paddle to your original payment method, usually within 5–10 business days.</p>
`);

fs.writeFileSync(path.join(ROOT, 'pricing.html'), pricing);
fs.writeFileSync(path.join(ROOT, 'terms.html'), terms);
fs.writeFileSync(path.join(ROOT, 'refund.html'), refund);
console.log('pricing.html · terms.html · refund.html 을 만들었다.');
