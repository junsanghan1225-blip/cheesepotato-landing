/* TOPIK 쓰기 53·54번 AI 채점 (연습용).

   화면에서 부르기: POST /functions/v1/grade-writing  { id: 'w54-1', text: '…' }
   머리: Authorization: Bearer <로그인 토큰> — **로그인한 사람만** 쓴다(하루 횟수를 사람마다 센다).

   배포(대시보드): Edge Functions → Deploy a new function → 이름 grade-writing → 이 파일을 붙여 넣기.
                   Verify JWT 는 **켜 둔다**(paddle-webhook 과 반대). 
   비밀: GEMINI_API_KEY (다른 AI 함수가 이미 쓰고 있으면 그대로), 선택 GEMINI_MODEL.
   표: db/add_ai_usage.sql 을 먼저 돌린다. 구독자 판별은 db/add_subscriptions.sql 의 is_pro().

   **채점 기준은 브라우저가 보내는 것을 믿지 않는다.** 문항(지문 · 과제 · 채점 포인트 · 모범답안 ·
   예시 답안)은 사이트의 topik-writing/items.json(빌드가 topik-writing.js 에서 뽑음)을 서버가 직접 받아 온다 — 누가 기준을 바꿔 보내
   만점을 받아 가지 못하게. 배점은 실제 TOPIK 과 같다:
     53번 30점 = 내용 및 과제 수행 7 · 글의 전개 구조 7 · 언어 사용 16
     54번 50점 = 내용 및 과제 수행 12 · 글의 전개 구조 12 · 언어 사용 26 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const admin = createClient(SB_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const KEY = Deno.env.get('GEMINI_API_KEY') ?? Deno.env.get('GOOGLE_API_KEY') ?? '';
const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
const SITE = 'https://everykoreans.com';
const LIMIT = { free: 2, pro: 30 };
const MAX = { 53: [7, 7, 16], 54: [12, 12, 26] } as Record<number, number[]>;

const CORS = {
  'Access-Control-Allow-Origin': SITE,
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

let items: Record<string, any> | null = null;
async function item(id: string) {
  if (!items) {
    // tools/build-pages.mjs 가 만드는 파일. 한 시간마다 새로 받는다(문항이 늘면 따라온다).
    const r = await fetch(`${SITE}/topik-writing/items.json?t=${Math.floor(Date.now() / 36e5)}`);
    items = Object.fromEntries((await r.json()).map((x: any) => [x.id, x]));
  }
  return items![id];
}
const count = (s: string) => s.replace(/[\r\n]/g, '').length;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return json({ error: 'login' }, 401);

  const { id, text } = await req.json().catch(() => ({}));
  const it = typeof id === 'string' ? await item(id) : null;
  if (!it || !MAX[it.q]) return json({ error: 'item' }, 400);
  const answer = String(text ?? '').slice(0, 1200);
  const n = count(answer);
  if (n < 50) return json({ error: 'short' }, 400);

  const { data: pro } = await admin.rpc('is_pro', { uid: user.id });
  const limit = pro ? LIMIT.pro : LIMIT.free;
  const { data: used, error: ue } = await admin.rpc('ai_usage_bump', { uid: user.id, k: 'grade-writing' });
  if (ue) { console.error(ue); return json({ error: 'server' }, 500); }
  if (used > limit) return json({ error: 'daily_limit', limit, pro: !!pro }, 429);

  const [cMax, sMax, lMax] = MAX[it.q];
  const total = cMax + sMax + lMax;
  const samples = (it.samples ?? []).map((s: any) => `[${s.level} · ${s.total}점] ${s.text}\n→ ${s.why}`).join('\n\n');
  const prompt = `당신은 TOPIK II 쓰기 채점 위원이다. 아래 학습자 답안을 실제 TOPIK 채점 기준으로 채점한다.

[문항 ${it.q}번] ${it.title}
${it.passage}
${(it.data ?? []).join('\n')}
${(it.tasks ?? []).map((x: string, i: number) => `${i + 1}. ${x}`).join('\n')}
조건: ${it.cond} (분량 ${it.min}~${it.max}자, 문체: ${it.register === 'formal' ? '-습니다체' : '-(느)ㄴ다체'})

[채점 포인트]
- 내용 및 과제 수행 (${cMax}점): ${it.points?.content ?? ''}
- 글의 전개 구조 (${sMax}점): ${it.points?.structure ?? ''}
- 언어 사용 (${lMax}점): ${it.points?.language ?? ''}
흔한 감점: ${(it.deduct ?? []).join(' / ')}

[모범답안]
${it.model ?? ''}

[점수를 매긴 예시 답안 — 이 눈높이에 맞춘다]
${samples}

[학습자 답안] (${n}자)
${answer}

규칙:
- 분량이 ${it.min}자 미만이면 내용 점수를 깎고, 그 사실을 comment 에 적는다.
- 요구 문체와 다른 문장(예: -습니다·-아요가 섞임)은 언어 사용에서 깎는다.
- fixes 는 학습자 답안에서 **실제로 있는 문장 조각**을 from 에 그대로 옮기고, to 에 고친 표현, why 에 짧은 이유. 최대 6개, 가장 점수에 영향이 큰 것부터.
- 칭찬도 비판도 구체적으로. 한국어로 쓰되 초급~중급 학습자가 읽을 수 있게 짧게.
- 점수는 정수. 너그럽게도 박하게도 말고 예시 답안의 눈높이 그대로.`;

  const schema = {
    type: 'object',
    properties: {
      content: { type: 'object', properties: { score: { type: 'integer' }, comment: { type: 'string' } }, required: ['score', 'comment'] },
      structure: { type: 'object', properties: { score: { type: 'integer' }, comment: { type: 'string' } }, required: ['score', 'comment'] },
      language: { type: 'object', properties: { score: { type: 'integer' }, comment: { type: 'string' } }, required: ['score', 'comment'] },
      strengths: { type: 'array', items: { type: 'string' } },
      fixes: { type: 'array', items: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, why: { type: 'string' } }, required: ['from', 'to', 'why'] } },
      next: { type: 'string' },
    },
    required: ['content', 'structure', 'language', 'strengths', 'fixes', 'next'],
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json', responseSchema: schema },
      }),
      signal: ctrl.signal,
    });
    const body = await r.json();
    const out = JSON.parse(body?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'null');
    if (!out) throw new Error('empty');
    const clamp = (v: number, m: number) => Math.max(0, Math.min(m, Math.round(Number(v) || 0)));
    out.content.score = clamp(out.content.score, cMax);
    out.structure.score = clamp(out.structure.score, sMax);
    out.language.score = clamp(out.language.score, lMax);
    out.fixes = (out.fixes ?? []).filter((f: any) => f.from && answer.includes(f.from)).slice(0, 6);
    return json({
      ...out, max: { content: cMax, structure: sMax, language: lMax, total },
      total: out.content.score + out.structure.score + out.language.score,
      chars: n, left: Math.max(0, limit - used), pro: !!pro,
    });
  } catch (e) {
    console.error(e);
    // AI 쪽 실패는 학생 탓이 아니다 — 센 횟수를 되돌린다
    await admin.from('ai_usage').update({ n: used - 1 }).eq('user_id', user.id).eq('kind', 'grade-writing')
      .eq('day', new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10));
    return json({ error: 'ai' }, 502);
  } finally { clearTimeout(timer); }
});
