#!/usr/bin/env node
// 쓰레드 책 홍보 글 자동 올리기(운영자 2026-10-27 「쓰레드 API 받아 둔 걸로 자동화」). 원본 docs/ops/threads-posts.json, 그림 assets/promo/<card>.png.
// 열쇠는 환경 변수 THREADS_TOKEN(GitHub Secrets — 인스타 자동 올리기와 같은 것). 이 파일 · 로그 어디에도 찍지 않는다.
//   node tools/threads-promo.mjs --due   [--state <폴더>] [--dry]   날짜가 된 글 중 아직 안 올린 첫 글 하나(하루 한 개)
//   --set teachers   선생님 홍보 글(docs/ops/teacher-posts.json) — 「쓰레드」가 적힌 글 중 영어 본문이 있는 것만, 그림이 없으면 글만. 기록은 <state> 폴더 그대로 쓰되 번호 앞에 t 를 붙인다
//   node tools/threads-promo.mjs --post 3 [--state <폴더>] [--dry]   그 번호 글을 지금(이미 올렸으면 건너뜀)
// 올린 글은 <state>/<번호>.json 으로 남긴다(워크플로가 insta-media 가지에 쌓는다). --dry 는 올리지 않고 글 · 그림 주소만 보여 준다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const DRY = argv.includes('--dry');
const STATE = opt('--state', path.join(ROOT, '.promo-state'));
const SITE = 'https://everykoreans.com';
const GRAPH = 'https://graph.threads.net/v1.0';   // 판이 낡으면 이 숫자만 올린다
const TEACH = opt('--set', '') === 'teachers';
const J = JSON.parse(fs.readFileSync(path.join(ROOT, TEACH ? 'docs/ops/teacher-posts.json' : 'docs/ops/threads-posts.json'), 'utf8'));
if (TEACH) { J.posts = J.posts.filter((p) => /쓰레드/.test(p.where || '') && (p.en || '').trim()).map((p) => ({ ...p, n: `t${p.n}`, num: Number(p.n) })); }
const die = (m) => { console.error(`\n✗ ${m}\n`); process.exit(1); };
const todayKst = () => new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
const dayOf = (p) => { const m = /(\d+)\/(\d+)/.exec(p.when); return `2026-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`; };
const full = (u) => { const [pa, h] = u.split('#'); return `${SITE}${pa}${J.utm}${h ? '#' + h : ''}`; };
const done = (n) => fs.existsSync(path.join(STATE, `${n}.json`));

let post;
if (argv.includes('--due')) {
  const today = todayKst();
  if (J.posts.some((p) => done(p.n) && JSON.parse(fs.readFileSync(path.join(STATE, `${p.n}.json`), 'utf8')).day === today)) { console.log('오늘 몫은 이미 올렸어요'); process.exit(0); }
  post = J.posts.find((p) => dayOf(p) <= today && !done(p.n));
  if (!post) { console.log('올릴 글이 없어요(날짜가 안 됐거나 다 올림)'); process.exit(0); }
} else {
  const n = TEACH ? `t${opt('--post', 0)}` : Number(opt('--post', 0));
  post = J.posts.find((p) => p.n === n);
  if (!post) die('쓰는 법: --due 또는 --post <번호 1~' + J.posts.length + '>');
  if (done(n)) { console.log(`${n}번 글은 이미 올렸어요`); process.exit(0); }
}
const link = full(post.link), link2 = post.link2 ? full(post.link2) : '';
const text = post.en.replace('{link}', link).trim();
const reply = post.reply.replace('{link}', link).replace('{link2}', link2).trim();
const img = post.card ? `${SITE}/assets/promo/${post.card}.png` : '';
if ([...text].length > 500 || [...reply].length > 500) die(`${post.n}번 글이 500자를 넘어요`);
console.log(`${post.n}번 (${post.when}) · 그림 ${img || '없음(글만)'}\n--- 본문\n${text}\n--- 답글\n${reply}`);
if (DRY) { console.log('\n(시험 — 올리지 않았어요)'); process.exit(0); }

const token = process.env.THREADS_TOKEN;
if (!token) die('THREADS_TOKEN 이 없어요 — docs/ops/insta-auto.md 「스레드 켜기」');
const call = async (method, p, params = {}) => {
  const url = new URL(`${GRAPH}${p}`), all = { ...params, access_token: token };
  let body;
  if (method === 'GET') Object.entries(all).forEach(([k, v]) => url.searchParams.set(k, v)); else body = new URLSearchParams(all);
  const res = await fetch(url, { method, body });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.error) {
    const e = j.error || {};
    if (e.code === 190) die('스레드 열쇠(토큰)가 끝났거나 틀렸어요 — docs/ops/insta-auto.md 「스레드 켜기」 4~5번으로 새로 넣어 주세요.');
    throw new Error(`스레드 API 오류 ${res.status} (${method} ${p} · 보낸 칸: ${Object.keys(params).join(',')}): ${e.message || ''} ${e.error_user_msg || ''} [code ${e.code ?? '-'}]`);
  }
  return j;
};
const retry = async (fn) => { for (let i = 0; ; i++) { try { return await fn(); } catch (e) { if (i >= 2 || !/code 2\]|500/.test(String(e.message))) throw e; await new Promise((r) => setTimeout(r, 8000)); } } };
const ready = async (id) => { for (let i = 0; i < 30; i++) { const s = (await call('GET', `/${id}`, { fields: 'status' })).status; if (s === 'FINISHED') return; if (s === 'ERROR' || s === 'EXPIRED') throw new Error(`스레드가 그림을 못 받았어요(${s})`); await new Promise((r) => setTimeout(r, 4000)); } };

try {
  const me = await call('GET', '/me', { fields: 'id,username' });
  console.log(`스레드 계정 @${me.username}`);
  const publish = async (params) => { const c = (await retry(() => call('POST', `/${me.id}/threads`, params))).id; await ready(c); return (await retry(() => call('POST', `/${me.id}/threads_publish`, { creation_id: c }))).id; };
  const id = await publish(img ? { media_type: 'IMAGE', image_url: img, text } : { media_type: 'TEXT', text });
  /* 링크는 답글에 — 본문에 링크가 있으면 도달이 줄어든다는 쪽이 많아 원래 계획대로 */
  let replyId = null;
  try { replyId = await publish({ media_type: 'TEXT', text: reply, reply_to_id: id }); } catch (e) { console.log(`답글 실패(본문은 올라감): ${e.message}`); }
  fs.mkdirSync(STATE, { recursive: true });
  fs.writeFileSync(path.join(STATE, `${post.n}.json`), JSON.stringify({ n: post.n, day: todayKst(), id, replyId, at: new Date().toISOString() }, null, 1));
  console.log(`✓ 올렸어요 — ${post.n}번${replyId ? ' + 답글' : ' (답글은 직접 붙여 주세요)'}`);
} catch (e) { die(e.message); }
