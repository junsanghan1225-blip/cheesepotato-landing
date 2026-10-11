// 치즈감자 도우미 AI — 앞선 대화를 기억하는 판(운영자 2026-10-11 「C」).
//
// ask-korean 과 같은 규칙(근거 있을 때만 · 시험 대신 안 풀어 줌 · 같은 하루 한도 chat_count — 무료 20 · Pro 100)에
// **앞선 질문 · 답 몇 개(history)** 를 더했다. 「그럼 그건?」 「예문 하나 더」 같은 이어 묻기를 알아듣게 하려는 것.
// ask-korean 은 그대로 둔다(단어 한 장 화면 · 앱이 쓴다). 이 함수가 없거나 실패하면 웹이 ask-korean 으로 물러선다.
//
// 배포:  대시보드 → Edge Functions → Deploy a new function → Via Editor → 이름 `ask-helper` → 이 파일을 붙여 넣기.
// 키:    GEMINI_API_KEY 는 ask-korean 과 같은 것(이미 있음). 선행 SQL 없음(ai_usage.chat_count · is_pro 는 이미 있다).
// 근거 조각(cites)에는 낱말 · 문법 표현 · 사이트 안내(kind: 'site')가 온다. 지난 답은 「맥락」일 뿐 근거가 아니다 —
// 근거는 언제나 이번 cites 뿐이다.

import { createClient } from 'npm:@supabase/supabase-js@^2';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const MODEL = 'gemini-3.6-flash';

// 앞선 대화: 최근 4번까지, 칸마다 300자까지(브라우저가 보낸 값이라 여기서 자른다)
const HIST_MAX = 4;
const HIST_FIELD_MAX = 300;

// 채팅은 발음 진단보다 자주, 여러 번 주고받으며 눌릴 수 있다. 처음엔
// 좁게 열고 실제 쓰임을 보고 늘린다(docs/ai-sidebar-plan.md §7).
// 무료 20 · Pro 100(운영자 결정 2026-10-03, 무료는 그대로). Pro 는 웹(everykoreans.com)의 구독 —
// 판별은 웹 저장소 db/add_subscriptions.sql 의 is_pro(), score-pronunciation 과 같은 방식.
const LIMIT = { free: 20, pro: 100 };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SCHEMA = {
  type: 'object',
  properties: {
    grounded: {
      type: 'boolean',
      description:
        '아래 자료(cites)만으로 답할 수 있으면 true. 자료에 없는 것을 ' +
        '묻거나, 시험 문제를 대신 풀어 달라는 요청이면 false.',
    },
    answer: {
      type: 'string',
      description:
        'grounded 가 true 일 때만 채운다. 짧게(세 문장 안쪽). ' +
        'grounded 가 false 면 빈 문자열.',
    },
    used: {
      type: 'array',
      description: '실제로 근거로 삼은 cites 의 id. 안 쓴 것은 넣지 않는다.',
      items: { type: 'string' },
    },
  },
  required: ['grounded', 'answer', 'used'],
};

interface Cite {
  id?: string;
  kind?: 'word' | 'point' | 'site';
  name?: string;
  desc?: string;
  form?: string;
  care?: string;
  ex?: string;
  en?: string;
}

interface Turn {
  q?: string;
  a?: string;
}

interface Body {
  q?: string;
  lang?: string;
  history?: Turn[];
  cites?: Cite[];
}

interface Answer {
  grounded: boolean;
  answer: string;
  used: string[];
}

// Gemini 응답 봉투 모양은 버전에 따라 달라진다. recognize-word ·
// score-pronunciation 과 같은 방식으로, 모양을 가정하지 않고 훑는다.
function extract(value: unknown, depth = 0): Answer | null {
  if (depth > 8 || value == null) return null;

  const shape = (obj: Record<string, unknown>): Answer => ({
    grounded: Boolean(obj.grounded),
    answer: String(obj.answer ?? ''),
    used: Array.isArray(obj.used) ? obj.used.map((x) => String(x)).slice(0, 10) : [],
  });

  if (typeof value === 'string') {
    const text = value.trim();
    if (!text.startsWith('{')) return null;
    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj === 'object' && 'grounded' in obj) return shape(obj);
    } catch {
      // JSON이 아닌 평범한 문자열 — 무시하고 계속 찾는다.
    }
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extract(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('grounded' in obj) return shape(obj);
    for (const item of Object.values(obj)) {
      const found = extract(item, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

// cites 는 브라우저가 보낸 값이라 길이를 여기서 자른다.
//
// 0층이 우리 자료에서 뽑아 보내는 것이 정상이지만, 로그인한 사람이면
// 누구나 이 함수에 아무 cites 나 실어 보낼 수 있다. 자르지 않으면 항목
// 여섯 개에 각각 몇십만 자를 담아 프롬프트를 부풀릴 수 있다 — 하루
// 한도가 있어도 한 번에 나가는 글자가 그만큼 커진다.
// 실제 자료에서 가장 긴 칸이 몇백 자라 400자면 넉넉하다.
const CITE_FIELD_MAX = 400;
const cut = (s: unknown): string => String(s ?? '').slice(0, CITE_FIELD_MAX);

// 항목마다 있는 칸만 적는다 — 없는 칸("")까지 그대로 넣으면 모델이
// "care: " 처럼 빈 줄을 흉내 낸다.
function renderCite(c: Cite, i: number): string {
  const lines = [`[${i}] id=${cut(c.id).slice(0, 40)} (${c.kind === 'word' ? '낱말' : c.kind === 'site' ? '사이트 안내' : '문법 표현'})`];
  if (c.name) lines.push(`이름: ${cut(c.name)}`);
  if (c.desc) lines.push(`뜻: ${cut(c.desc)}`);
  if (c.en) lines.push(`영어 뜻: ${cut(c.en)}`);
  if (c.form) lines.push(`형태: ${cut(c.form)}`);
  if (c.care) lines.push(`주의할 점: ${cut(c.care)}`);
  if (c.ex) lines.push(`예문: ${cut(c.ex)}`);
  return lines.join('\n');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    // ── 호출자 확인 ────────────────────────────────────────────────
    // anon 키도 유효한 JWT라서 verify_jwt 만으로는 부족하다. recognize-word ·
    // score-pronunciation 과 같은 이유로 로그인한 사용자인지 직접 확인한다.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const asUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await asUser.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) return json({ error: 'Unauthorized' }, 401);

    const { q = '', lang = 'ko', cites = [], history = [] }: Body = await req.json();

    if (!q.trim()) return json({ error: 'q 가 필요해요.' }, 400);
    // 사이드바 질문 한 줄이다. 그보다 길게 오면 보내지 않는다 —
    // 지문 전체를 붙여넣고 풀어 달라는 요청을 여기서 먼저 막는다.
    if (q.length > 300) return json({ error: '질문이 너무 길어요.' }, 400);
    if (!Array.isArray(cites) || !Array.isArray(history)) return json({ error: '잘못된 요청이에요.' }, 400);
    if (cites.length > 6) return json({ error: 'cites 가 너무 많아요.' }, 400);

    // ── 하루 사용량 제한 ───────────────────────────────────────────
    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const today = new Date().toISOString().slice(0, 10);

    const { data: usage } = await admin
      .from('ai_usage')
      .select('chat_count')
      .eq('user_id', user.id)
      .eq('day', today)
      .maybeSingle();

    // is_pro 가 없거나 실패하면(구독 표를 아직 안 만든 프로젝트) 무료 한도로 — 막히는 쪽이 아니라 덜 주는 쪽으로 틀린다
    const { data: pro, error: proErr } = await admin.rpc('is_pro', { uid: user.id });
    if (proErr) console.error('is_pro', proErr.message);
    const limit = pro === true ? LIMIT.pro : LIMIT.free;

    const used = usage?.chat_count ?? 0;
    if (used >= limit) {
      return json({ error: 'daily_limit', limit, pro: pro === true }, 429);
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return json({ error: 'GEMINI_API_KEY가 설정되지 않았어요.' }, 500);
    }

    const langName = ({ en: '영어', vi: '베트남어', ja: '일본어', zh: '중국어' } as Record<string, string>)[lang] ?? '한국어';
    const histText = history
      .slice(-HIST_MAX)
      .map((h) => `사용자: ${String(h?.q ?? '').slice(0, HIST_FIELD_MAX)}\n도우미: ${String(h?.a ?? '').slice(0, HIST_FIELD_MAX)}`)
      .join('\n\n');
    const citesText = cites.length
      ? cites.map(renderCite).join('\n\n')
      : '(없음 — 이번 질문과 관련해 미리 찾아 둔 자료가 없다)';

    const prompt =
      `너는 한국어 학습 사이트 「치즈감자」의 한국어 학습 도우미다. 한국어 낱말 · 문법과 이 사이트 사용법만 다룬다.\n\n` +
      `## 반드시 지킬 것\n\n` +
      `1. **아래 [자료]에 있는 내용으로만 답해라.** 자료에 없는 것을 ` +
      `물으면 지어내지 말고 grounded 를 false 로 하고 answer 를 빈 ` +
      `문자열로 둬라. "아마도", "일반적으로" 같은 말로 자료 밖의 ` +
      `지식을 끌어오지 마라.\n` +
      `2. **시험 문제를 대신 풀어 주지 마라.** "정답이 뭐예요", ` +
      `"1번 2번 3번 4번 중에 골라 주세요", 지문을 요약해 달라는 ` +
      `요청이면 grounded 를 false 로 하고 answer 를 빈 문자열로 둬라. ` +
      `대신 관련된 문법이 [자료]에 있으면 그 문법을 설명하는 것은 ` +
      `괜찮다 — 푸는 것과 배우는 것은 다르다.\n` +
      `3. **간결하게.** 세 문장을 넘기지 마라. 사이드바에서 보는 답이다.\n` +
      `4. **${langName}로 답해라.**\n` +
      `5. **[앞선 대화]는 「그건?」 「하나 더」 같은 이어 묻기를 알아듣는 데만 써라.** 근거는 아래 [자료]뿐이다 — 앞선 답에 있던 말이라도 [자료]에 없으면 grounded 를 false 로 해라.\n` +
      `6. used 에는 답에 실제로 쓴 [번호] 의 id 만 넣어라. 자료를 훑기만 ` +
      `하고 안 쓴 것은 넣지 마라.\n\n` +
      (histText ? `## 앞선 대화\n\n${histText}\n\n` : '') +
      `## 자료\n\n${citesText}\n\n` +
      `## 질문\n\n${q}`;

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        input: [{ type: 'text', text: prompt }],
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: SCHEMA,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('gemini error:', res.status, detail);
      return json({ error: `Gemini 오류 (${res.status})` }, 502);
    }

    const parsed = extract(await res.json());
    if (!parsed) {
      return json({ error: '응답 구조를 읽지 못했어요.' }, 502);
    }

    // Gemini 호출이 실제로 성공했을 때만 차감한다. grounded:false 로
    // "모른다"고 답한 것도 정상 호출이라 그대로 센다 — recognize-word 가
    // 인식 실패(note 만 돌아오는 경우)도 세는 것과 같다.
    await admin
      .from('ai_usage')
      .upsert(
        { user_id: user.id, day: today, chat_count: used + 1 },
        { onConflict: 'user_id,day' }
      );

    return json(parsed);
  } catch (e) {
    console.error('ask-helper failed:', e);
    return json({ error: e instanceof Error ? e.message : '알 수 없는 오류' }, 500);
  }
});
