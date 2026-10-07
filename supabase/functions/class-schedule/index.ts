/* 반 수업 일정 — 구글 캘린더(iCal 비공개 주소)를 읽어 「다음 수업들」을 돌려준다(운영자 요청 2026-10-07).

   화면에서 부르기: POST /functions/v1/class-schedule  { class_id: 12, user_id?: '<학생>' }
   머리: Authorization: Bearer <로그인 토큰> — 그 반의 학생이나 선생님만 받는다.
   **1:1 수업(per_student, 기본)**: 학생은 자기 일정만 받는다 — 일정에 손님으로 초대된 메일이 그 학생 로그인 메일과 같거나,
   선생님이 그 학생에게 정해 둔 말(class_member_cal.keyword)이 제목에 들어 있을 때만. 둘 다 아니면 빈칸(다른 학생 일정은 절대 안 간다).
   선생님은 user_id 없이 부르면 반 전체(자기 캘린더), user_id 를 주면 그 학생이 보는 그대로.
   **수업이 끝난 학생은 저절로 반에서 나간다**(운영자 2026-10-07 「수업을 더 안 들으면 자동으로 — 학생에게 부담 없게」):
   1:1 반에서 그 학생의 수업이 캘린더에 한 번이라도 있었는데, 마지막 수업이 QUIT_DAYS(21일)보다 오래됐고 앞으로 잡힌 수업도 없으면
   class_members 에서 뺀다(반 학생 Pro 도 같이 끝난다). 한 번도 안 맞은 학생(찾는 말을 아직 안 정한 학생)은 건드리지 않는다.
   숙제 기록(class_done)은 지우지 않는다 — 다시 QR 로 들어오면 그대로.
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
const DAYS = 120, MAX = 40, BACK = 90, QUIT_DAYS = 21;

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

function upcoming(text: string, pass: (title: string, comp: any) => boolean) {
  const comp = new ICAL.Component(ICAL.parse(text));
  for (const tz of comp.getAllSubcomponents('vtimezone')) ICAL.TimezoneService.register(tz);
  const now = ICAL.Time.now(), until = now.clone(), since = now.clone();
  until.addDuration(new ICAL.Duration({ days: DAYS }));
  since.addDuration(new ICAL.Duration({ days: -BACK }));
  let last = '';   // 지난 BACK 일 안의 마지막 수업(학생 자동 나가기에 쓴다)
  const past = (start: any, title: string, c: any) => { if (start.compare(since) >= 0 && start.compare(now) < 0 && pass(title, c)) { const v = start.toJSDate().toISOString(); if (v > last) last = v; } };
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
      past(e.startDate, e.summary || '', e.component);
      if (e.endDate.compare(now) > 0 && e.startDate.compare(until) < 0 && pass(e.summary || '', e.component)) out.push({ start: e.startDate.toJSDate().toISOString(), end: e.endDate.toJSDate().toISOString(), title: e.summary || '' });
      continue;
    }
    const it = e.iterator();
    let next: any, guard = 0;
    while ((next = it.next()) && guard++ < 3000) {
      if (next.compare(until) > 0) break;
      const d = e.getOccurrenceDetails(next);
      if (cancelled(d.item.component)) continue;
      if (d.endDate.compare(now) <= 0) { past(d.startDate, d.item.summary || '', d.item.component); continue; }
      const title = d.item.summary || '';
      if (pass(title, d.item.component)) out.push({ start: d.startDate.toJSDate().toISOString(), end: d.endDate.toJSDate().toISOString(), title });
    }
  }
  out.sort((a, b) => a.start.localeCompare(b.start));
  return { list: out.slice(0, MAX).map((x) => ({ ...x, title: x.title.slice(0, 80) })), more: out.length > MAX, last };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return json({ error: 'login' }, 401);

  const { class_id, user_id } = await req.json().catch(() => ({}));
  const cid = Number(class_id);
  if (!Number.isFinite(cid)) return json({ error: 'class' }, 400);

  // 그 반의 학생이거나 주인(선생님)만
  const [{ data: cl }, { data: mem }] = await Promise.all([
    admin.from('classes').select('owner, archived').eq('id', cid).maybeSingle(),
    admin.from('class_members').select('user_id').eq('class_id', cid).eq('user_id', user.id).maybeSingle(),
  ]);
  if (!cl || cl.archived || (cl.owner !== user.id && !mem)) return json({ error: 'forbidden' }, 403);

  const { data: cal } = await admin.from('class_calendar').select('ical, keyword, per_student').eq('class_id', cid).maybeSingle();
  if (!cal) return json({ list: [], none: true });
  const has = (s: string, k: string) => !k.trim() || s.toLowerCase().includes(k.trim().toLowerCase());
  let pass = (title: string) => has(title, cal.keyword || '');
  /* 누구의 일정을 볼지 — 학생은 언제나 자기, 선생님은 user_id 를 주면 그 학생(그 반 학생일 때만) */
  const isOwner = cl.owner === user.id;
  let who: string | null = isOwner ? null : user.id;
  if (isOwner && typeof user_id === 'string') {
    const { data: m2 } = await admin.from('class_members').select('user_id').eq('class_id', cid).eq('user_id', user_id).maybeSingle();
    if (!m2) return json({ error: 'member' }, 400);
    who = user_id;
  }
  if (who && cal.per_student !== false) {
    const { data: mk } = await admin.from('class_member_cal').select('keyword').eq('class_id', cid).eq('user_id', who).maybeSingle();
    const email = who === user.id ? (user.email || '') : ((await admin.auth.admin.getUserById(who)).data.user?.email || '');
    const kw = (mk?.keyword || '').trim().toLowerCase(), em = email.toLowerCase();
    if (!kw && !em) return json({ list: [], unset: true });
    pass = (title: string, comp: any) => {
      const guests = (comp?.getAllProperties?.('attendee') || []).map((p: any) => String(p.getFirstValue() || '').replace(/^mailto:/i, '').toLowerCase());
      /* 반 전체의 거르는 말(예: Preply)도 지킨다 — 1:1 이어도 그 말이 든 일정만, 그중 이 학생 것만 */
      return has(title, cal.keyword || '') && ((!!em && guests.includes(em)) || (!!kw && title.toLowerCase().includes(kw)));
    };
  }
  try {
    const r = upcoming(await icsText(cal.ical), pass);
    if (!(who && cal.per_student !== false)) return json({ list: r.list, more: r.more });
    /* 수업이 끝난 학생 — 마지막 수업이 3주보다 오래됐고 앞으로 없다 → 반에서 뺀다 */
    if (!r.list.length && r.last && Date.now() - Date.parse(r.last) > QUIT_DAYS * 864e5) {
      await admin.from('class_members').delete().eq('class_id', cid).eq('user_id', who);
      return json({ list: [], left: true, last: r.last });
    }
    return json({ list: r.list, more: r.more, mine: true, last: r.last });
  } catch (e) {
    return json({ error: 'calendar' }, 502);
  }
});
