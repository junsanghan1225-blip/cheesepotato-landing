// 매일 공부 알림 메일 — db/add_reminders.sql 의 reminder_prefs 를 보고, 지금이 그 사람의 「정한 시각」이면 메일 한 통.
// 부르는 쪽: GitHub Actions(.github/workflows/daily-reminder.yml)가 매시 5분에 POST(머리글 x-cron-key).
// 수신 거부: 메일 맨 아래 링크(GET ?u=<user_id>&s=<서명>) — 누르면 email_on 을 끈다.
// 운영자가 Supabase Secrets 에 넣는 것: RESEND_API_KEY · REMINDER_FROM(예: Cheesepotato <hello@everykoreans.com>) · CRON_KEY.
// SUPABASE_URL · SUPABASE_SERVICE_ROLE_KEY 는 Supabase 가 함수에 늘 넣어 준다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SITE = 'https://everykoreans.com';
const env = (k: string) => Deno.env.get(k) || '';
const sb = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

async function sign(uid: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env('CRON_KEY')), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(uid));
  return [...new Uint8Array(mac)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* 말 — 학생이 고른 화면 언어로. 없는 언어는 영어. */
const TX: Record<string, (due: number, streakDays: number) => { subj: string; body: string; go: string; off: string }> = {
  ko: (d, s) => ({ subj: d ? `🥔 오늘 돌아온 낱말 ${d}개 — 15분이면 끝나요` : '🥔 오늘 공부할 시간이에요 — 15분이면 돼요',
    body: (s ? `${s}일째 이어 가고 있어요! ` : '') + '복습 → 오늘의 레슨 → 새 낱말 → 말하기, 「오늘 공부」 한 번이면 차례로 이어져요.', go: '오늘 공부 시작', off: '이 메일 그만 받기' }),
  en: (d, s) => ({ subj: d ? `🥔 ${d} Korean words are back for review — 15 minutes today` : '🥔 Time for today’s Korean — just 15 minutes',
    body: (s ? `You’re on a ${s}-day streak! ` : '') + 'Review → today’s lesson → new words → speaking, all in one go with “Today’s study”.', go: 'Start today’s study', off: 'Stop these emails' }),
  vi: (d, s) => ({ subj: d ? `🥔 ${d} từ tiếng Hàn cần ôn hôm nay — chỉ 15 phút` : '🥔 Đến giờ học tiếng Hàn — chỉ 15 phút',
    body: (s ? `Bạn đã học liên tục ${s} ngày! ` : '') + 'Ôn tập → bài học hôm nay → từ mới → luyện nói, tất cả trong một lần.', go: 'Bắt đầu học hôm nay', off: 'Ngừng nhận email này' }),
  ja: (d, s) => ({ subj: d ? `🥔 今日の復習単語 ${d}個 — 15分で終わります` : '🥔 今日の韓国語の時間です — 15分だけ',
    body: (s ? `${s}日連続です！ ` : '') + '復習 → 今日のレッスン → 新しい単語 → スピーキングを一度に。', go: '今日の勉強を始める', off: 'このメールを停止' }),
};

function localNow(tzMin: number) { return new Date(Date.now() + tzMin * 60000); }   // 그 사람 시각을 UTC 칸에 담아 둔다
const dayNum = (d: Date) => Math.floor(d.getTime() / 864e5);
const ymd = (d: Date) => d.toISOString().slice(0, 10);

async function runOnce() {
  const { data: prefs, error } = await sb.from('reminder_prefs').select('*').eq('email_on', true);
  if (error) return { error: error.message };
  let sent = 0, skipped = 0;
  for (const p of prefs || []) {
    const now = localNow(p.tz_min);
    if (now.getUTCHours() !== p.hour || p.last_sent === ymd(now)) { skipped++; continue; }
    // 단어 기록(settings.vocab — words.js 의 모양: w{id:[…, 다음 복습 날 번호]} · days{날 번호: 그날 답한 수}, 날 번호 = 그 사람 시각의 1970 년부터 날 수)
    const { data: st } = await sb.from('settings').select('vocab').eq('user_id', p.user_id).maybeSingle();
    const v = st?.vocab || {}, today = dayNum(now);
    if (v.days && v.days[today]) { skipped++; continue; }   // 오늘 이미 공부했다 — 보내지 않는다
    const due = Object.values(v.w || {}).filter((x: any) => Array.isArray(x) && x[1] <= today).length;
    let streak = 0;
    for (let d = today - 1; v.days && v.days[d]; d--) streak++;
    const { data: u } = await sb.auth.admin.getUserById(p.user_id);
    const to = u?.user?.email;
    if (!to) { skipped++; continue; }
    const tx = (TX[p.lang] || TX.en)(due, streak);
    const off = `${env('SUPABASE_URL')}/functions/v1/daily-reminder?u=${p.user_id}&s=${await sign(p.user_id)}`;
    const html = `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;color:#2B1D12">
      <p style="font-size:28px;margin:0">🥔🧀</p><h2 style="margin:12px 0">${tx.subj}</h2><p style="font-size:16px;line-height:1.6">${tx.body}</p>
      <p><a href="${SITE}/?utm_source=reminder&utm_medium=email" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#FFD23F;color:#4A3300;font-weight:800;text-decoration:none">${tx.go} →</a></p>
      <p style="font-size:12px;color:#8A7A6A;margin-top:28px"><a href="${off}" style="color:#8A7A6A">${tx.off}</a> · Cheesepotato · everykoreans.com</p></div>`;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env('REMINDER_FROM'), to, subject: tx.subj, html, headers: { 'List-Unsubscribe': `<${off}>` } }),
    });
    if (r.ok) { sent++; await sb.from('reminder_prefs').update({ last_sent: ymd(now) }).eq('user_id', p.user_id); }
  }
  return { sent, skipped };
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (req.method === 'GET' && url.searchParams.get('u')) {
    const u = url.searchParams.get('u') || '';
    if (url.searchParams.get('s') !== await sign(u)) return new Response('Bad link', { status: 400 });
    await sb.from('reminder_prefs').update({ email_on: false }).eq('user_id', u);
    return new Response('<p style="font-family:sans-serif;padding:24px">✓ 알림 메일을 껐어요 · Reminder emails turned off. <a href="https://everykoreans.com">everykoreans.com</a></p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  if (req.method !== 'POST' || !env('CRON_KEY') || req.headers.get('x-cron-key') !== env('CRON_KEY')) return new Response('Forbidden', { status: 403 });
  return Response.json(await runOnce());
});
