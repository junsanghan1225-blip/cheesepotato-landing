/* 반 수업 일정 — 구글 캘린더(iCal 비공개 주소)를 읽어 「다음 수업들」을 돌려준다(운영자 요청 2026-10-07).

   화면에서 부르기: POST /functions/v1/class-schedule  { class_id: 12 }
   머리: Authorization: Bearer <로그인 토큰> — 그 반의 학생이나 선생님만 받는다.
   돌려주는 것: { list: [{ start, end, title }] (지금부터 120일, 최대 40개), more: boolean }

   배포(대시보드): Edge Functions → Deploy a new function → 이름 class-schedule → 이 파일을 붙여 넣기.
                   Verify JWT 는 **켜 둔다**. 따로 넣을 비밀 값은 없다(SUPABASE_URL · SERVICE_ROLE 은 기본으로 있다).
   표: db/add_class_calendar.sql 을 먼저 돌린다.

   비공개 주소는 브라우저로 보내지 않는다 — 서버만 읽고, 학생에게는 수업 시간 · 제목만 건넨다.
   반복 일정(매주 목 7시 …) · 빠진 날(EXDATE) · 옮긴 날(RECURRENCE-ID) · 취소된 날은 ical.js 가 풀어 준다. */
import { createClient } from 'npm:@supabase/supabase-js@2';
import ICAL from 'npm:ical.js@2';

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const admin = createClient(SB_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const SITE = 'https://everykoreans.com';
const DAYS = 120, MAX = 40;

const CORS = {
  'Access-Control-Allow-Origin': SITE,
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

/* 같은 캘린더를 학생마다 새로 받지 않게 10분 동안 기억한다(함수가 살아 있는 동안만) */
const cache = new Map<string, { at: number; text: string }>();
async function icsText(url: string) {
  const c = cache.get(url);
  if (c && Date.now() - c.at < 10 * 60e3) return c.text;
  const r = await fetch(url);
  if (!r.ok) throw new Error('fetch ' + r.status);
  const text = await r.text();
  cache.set(url, { at: Date.now(), text });
  return text;
}

function upcoming(text: string, keyword: string) {
  const comp = new ICAL.Component(ICAL.parse(text));
  for (const tz of comp.getAllSubcomponents('vtimezone')) ICAL.TimezoneService.register(tz);
  const now = ICAL.Time.now(), until = now.clone();
  until.addDuration(new ICAL.Duration({ days: DAYS }));
  const kw = keyword.trim().toLowerCase();
  const pass = (title: string) => !kw || title.toLowerCase().includes(kw);
  /* 옮긴 날 · 취소한 날(RECURRENCE-ID 가 있는 일정)은 본 일정에 붙인다 */
  const mains = new Map<string, any>(), ex: any[] = [];
  for (const v of comp.getAllSubcomponents('vevent')) {
    const e = new ICAL.Event(v);
    if (v.hasProperty('recurrence-id')) ex.push(e); else mains.set(e.uid, e);
  }
  for (const e of ex) mains.get(e.uid)?.relateException(e);
  const out: { start: string; end: string; title: string }[] = [];
  const cancelled = (c: any) => String(c?.getFirstPropertyValue?.('status') || '').toUpperCase() === 'CANCELLED';
  for (const e of mains.values()) {
    if (cancelled(e.component)) continue;
    if (!e.isRecurring()) {
      if (e.endDate.compare(now) > 0 && e.startDate.compare(until) < 0 && pass(e.summary || '')) out.push({ start: e.startDate.toJSDate().toISOString(), end: e.endDate.toJSDate().toISOString(), title: e.summary || '' });
      continue;
    }
    const it = e.iterator();
    let next: any, guard = 0;
    while ((next = it.next()) && guard++ < 3000) {
      if (next.compare(until) > 0) break;
      const d = e.getOccurrenceDetails(next);
      if (d.endDate.compare(now) <= 0) continue;
      if (cancelled(d.item.component)) continue;
      const title = d.item.summary || '';
      if (pass(title)) out.push({ start: d.startDate.toJSDate().toISOString(), end: d.endDate.toJSDate().toISOString(), title });
    }
  }
  out.sort((a, b) => a.start.localeCompare(b.start));
  return { list: out.slice(0, MAX).map((x) => ({ ...x, title: x.title.slice(0, 80) })), more: out.length > MAX };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return json({ error: 'login' }, 401);

  const { class_id } = await req.json().catch(() => ({}));
  const cid = Number(class_id);
  if (!Number.isFinite(cid)) return json({ error: 'class' }, 400);

  // 그 반의 학생이거나 주인(선생님)만
  const [{ data: cl }, { data: mem }] = await Promise.all([
    admin.from('classes').select('owner, archived').eq('id', cid).maybeSingle(),
    admin.from('class_members').select('user_id').eq('class_id', cid).eq('user_id', user.id).maybeSingle(),
  ]);
  if (!cl || cl.archived || (cl.owner !== user.id && !mem)) return json({ error: 'forbidden' }, 403);

  const { data: cal } = await admin.from('class_calendar').select('ical, keyword').eq('class_id', cid).maybeSingle();
  if (!cal) return json({ list: [], none: true });
  try {
    return json(upcoming(await icsText(cal.ical), cal.keyword || ''));
  } catch (e) {
    return json({ error: 'calendar' }, 502);
  }
});
