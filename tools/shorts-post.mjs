// 쇼츠 공장 — 대기열(Supabase shorts_queue)에서 영상 하나를 꺼내 유튜브 · 인스타 릴스 · 틱톡에 올린다(운영자 요청 2026-10-05).
// .github/workflows/shorts-post.yml 이 부른다. 순서 · 열쇠 넣는 법은 docs/shorts-auto.md.
//
//   node tools/shorts-post.mjs post [--dry]          가장 오래된 「ready」 하나를 올린다(--dry 면 받아서 바꾸기까지만)
//   node tools/shorts-post.mjs connect yt|tt <code>   connect.html 에서 받은 일회용 코드 → 오래 쓰는 열쇠(refresh token)로 바꿔 shorts_kv 에 적는다
//
// 곳마다 따로 한다 — 한 곳이 실패해도 다른 곳은 올린다. 실패한 곳은 다음 실행에 다시(세 번까지, 그 뒤엔 건너뜀).
// 켜고 끄기: GitHub Variables SHORTS_YT · SHORTS_IG · SHORTS_TT = on.
// 열쇠는 환경 변수로만 받고, 로그 · 파일 · 표의 결과 칸에 찍지 않는다.
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { statSync } from 'node:fs';
import { join } from 'node:path';

const SB = 'https://tjgoevtvobvmlyefgxel.supabase.co';
const GRAPH = 'https://graph.instagram.com/v23.0';
const TT = 'https://open.tiktokapis.com/v2';
const SITE_CB = 'https://everykoreans.com/connect.html';   // 연결 쪽 — 구글 · 틱톡 앱에 이 주소를 「리디렉션 URI」로 넣는다
const env = process.env;
const on = (k) => String(env[k] || '').toLowerCase().startsWith('on');
const die = (m) => { console.error(`\n✗ ${m}\n`); process.exit(1); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const KEY = env.SUPABASE_SERVICE_KEY;
if (!KEY) die('SUPABASE_SERVICE_KEY 가 없어요 — GitHub Secrets 에 넣어 주세요(docs/shorts-auto.md 0-2).');

/* ── Supabase(REST · 저장 칸) — service key 라 RLS 를 안 탄다 ── */
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
async function rest(method, path, body, extra = {}) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { method, headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=representation', ...extra }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); if (!r.ok) throw new Error(`Supabase ${r.status}: ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : null;
}
const kvGet = async (k) => (await rest('GET', `shorts_kv?k=eq.${k}&select=v`))[0]?.v || null;
const kvSet = (k, v) => rest('POST', 'shorts_kv', { k, v, updated_at: new Date().toISOString() }, { Prefer: 'resolution=merge-duplicates,return=minimal' });
const publicUrl = (p) => `${SB}/storage/v1/object/public/shorts/${p.split('/').map(encodeURIComponent).join('/')}`;
async function storagePut(p, buf, type) {
  const r = await fetch(`${SB}/storage/v1/object/shorts/${p}`, { method: 'POST', headers: { ...H, 'Content-Type': type, 'x-upsert': 'true' }, body: buf });
  if (!r.ok) throw new Error(`저장 칸 올리기 ${r.status}: ${(await r.text()).slice(0, 200)}`);
}
async function storageDel(paths) {
  await fetch(`${SB}/storage/v1/object/shorts`, { method: 'DELETE', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: paths }) });
}

/* ── 열쇠: 표(shorts_kv)에 적힌 것이 먼저, 없으면 Secrets ── */
async function googleToken() {
  const refresh = (await kvGet('yt_refresh')) || env.YT_REFRESH_TOKEN;
  if (!env.YT_CLIENT_ID || !env.YT_CLIENT_SECRET || !refresh) throw new Error('유튜브 열쇠가 없어요(YT_CLIENT_ID · YT_CLIENT_SECRET · 연결) — docs/shorts-auto.md 2번');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: env.YT_CLIENT_ID, client_secret: env.YT_CLIENT_SECRET, refresh_token: refresh, grant_type: 'refresh_token' }) });
  const j = await r.json(); if (!j.access_token) throw new Error(`구글 열쇠 새로 받기 실패: ${j.error || r.status} ${j.error_description || ''} — 연결을 다시 해 주세요(docs/shorts-auto.md 2-6)`);
  return j.access_token;
}
async function tiktokToken() {
  const refresh = (await kvGet('tt_refresh')) || env.TT_REFRESH_TOKEN;
  if (!env.TT_CLIENT_KEY || !env.TT_CLIENT_SECRET || !refresh) throw new Error('틱톡 열쇠가 없어요(TT_CLIENT_KEY · TT_CLIENT_SECRET · 연결) — docs/shorts-auto.md 3번');
  const r = await fetch(`${TT}/oauth/token/`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_key: env.TT_CLIENT_KEY, client_secret: env.TT_CLIENT_SECRET, grant_type: 'refresh_token', refresh_token: refresh }) });
  const j = await r.json(); if (!j.access_token) throw new Error(`틱톡 열쇠 새로 받기 실패: ${j.error || r.status} ${j.error_description || ''} — 연결을 다시 해 주세요(docs/shorts-auto.md 3-5)`);
  /* 틱톡은 새 refresh token 을 줄 수 있다 — 바뀌었으면 적어 둔다(안 그러면 1년 뒤 끊긴다) */
  if (j.refresh_token && j.refresh_token !== refresh) await kvSet('tt_refresh', j.refresh_token);
  return j.access_token;
}

/* ── 곳마다 올리기 ── */
async function toYouTube(row, file, cover) {
  const token = await googleToken();
  const size = statSync(file).size;
  const meta = { snippet: { title: row.title, description: row.description, tags: row.tags || [], categoryId: '27', defaultLanguage: 'ko' },
    status: { privacyStatus: env.YT_PRIVACY || 'private', selfDeclaredMadeForKids: false } };
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': String(size) }, body: JSON.stringify(meta) });
  if (!init.ok) throw new Error(`유튜브 시작 ${init.status}: ${(await init.text()).slice(0, 300)}`);
  const put = await fetch(init.headers.get('location'), { method: 'PUT', headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(size) }, body: await readFile(file) });
  const v = await put.json().catch(() => ({})); if (!put.ok || !v.id) throw new Error(`유튜브 올리기 ${put.status}: ${JSON.stringify(v).slice(0, 300)}`);
  /* 표지 — 채널 인증(전화번호)이 안 됐으면 실패한다. 그래도 영상은 올라갔으니 넘어간다 */
  let thumb = false;
  if (cover) {
    const t = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${v.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/jpeg' }, body: await readFile(cover) });
    thumb = t.ok; if (!t.ok) console.log(`  (유튜브 표지는 못 넣었어요 ${t.status} — 채널 인증이 필요할 수 있어요)`);
  }
  /* 재생목록 — 제목 맨 앞 [시리즈 이름 · …] 의 이름(촬영소가 붙인다). 실패해도 영상은 올라갔으니 넘어간다 */
  let playlist = null;
  const name = playlistOf(row);
  if (name) {
    try { playlist = await addToPlaylist(token, name, v.id); console.log(`  재생목록 「${name}」에 넣음`); }
    catch (e) { console.log(`  (재생목록에는 못 넣었어요: ${e.message} — 연결을 다시 하면 권한이 생겨요 · docs/shorts-auto.md 2-6)`); }
  }
  return { ok: true, id: v.id, url: `https://youtube.com/shorts/${v.id}`, privacy: meta.status.privacyStatus, thumb, playlist };
}

/* 「[TOPIK I 모의고사 1회 · 31번 1/40] …」 → 「TOPIK I 모의고사 1회」 */
export const playlistOf = (row) => (String(row.title || '').match(/^\[(.+?) · /) || [])[1] || null;
/* 이름으로 재생목록을 찾고(표 shorts_kv 에 적어 둔 id 먼저) 없으면 만든 뒤 영상을 넣는다.
   재생목록은 공개 — 비공개 영상은 넣어도 남에게는 안 보이고, 공개로 바꾸면 그대로 시리즈가 된다 */
async function addToPlaylist(token, name, videoId) {
  const H2 = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' };
  const key = 'yt_pl:' + name;
  let id = await kvGet(key);
  if (!id) {
    const r = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', { method: 'POST', headers: H2,
      body: JSON.stringify({ snippet: { title: name, description: `${name} — 치즈감자 연습 문제(기출 아님). 무료 TOPIK 연습 → https://everykoreans.com`, defaultLanguage: 'ko' }, status: { privacyStatus: 'public' } }) });
    const j = await r.json(); if (!j.id) throw new Error(`재생목록 만들기 ${r.status}: ${j.error?.message || ''}`);
    id = j.id; await kvSet(key, id);
  }
  const r = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', { method: 'POST', headers: H2,
    body: JSON.stringify({ snippet: { playlistId: id, resourceId: { kind: 'youtube#video', videoId } } }) });
  if (!r.ok) throw new Error(`재생목록에 넣기 ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return { id, name };
}

async function toInstagram(row, videoUrl, coverUrl) {
  const token = env.IG_TOKEN; if (!token) throw new Error('IG_TOKEN 이 없어요(인스타 자동 올리기와 같은 열쇠)');
  const call = async (method, path, params = {}) => {
    const url = new URL(`${GRAPH}${path}`), all = { ...params, access_token: token }; let body;
    if (method === 'GET') Object.entries(all).forEach(([k, v]) => url.searchParams.set(k, v)); else body = new URLSearchParams(all);
    const r = await fetch(url, { method, body }); const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) throw new Error(`인스타 ${r.status}: ${j.error?.message || ''} ${j.error?.error_user_msg || ''} [code ${j.error?.code ?? '-'}]`);
    return j;
  };
  const me = await call('GET', '/me', { fields: 'user_id,username' }); const uid = me.user_id || me.id;
  const c = await call('POST', `/${uid}/media`, { media_type: 'REELS', video_url: videoUrl, caption: row.caption.slice(0, 2200), share_to_feed: 'true', ...(coverUrl ? { cover_url: coverUrl } : {}) });
  for (let i = 0; i < 60; i++) {   // 영상은 처리에 시간이 걸린다 — 10초씩 최대 10분
    const st = await call('GET', `/${c.id}`, { fields: 'status_code,status' });
    if (st.status_code === 'FINISHED') break;
    if (st.status_code === 'ERROR' || st.status_code === 'EXPIRED') throw new Error(`인스타가 영상을 못 받았어요(${st.status_code}: ${st.status || ''})`);
    await sleep(10000);
  }
  const p = await call('POST', `/${uid}/media_publish`, { creation_id: c.id });
  const info = await call('GET', `/${p.id}`, { fields: 'permalink' }).catch(() => ({}));
  return { ok: true, id: p.id, url: info.permalink || null };
}

async function toTikTok(row, file) {
  const token = await tiktokToken();
  const size = statSync(file).size;
  /* 64MB 아래는 한 번에. 넘으면 10MB 씩(마지막 조각이 나머지를 다 가진다 — 틱톡 규칙) */
  const chunk = size <= 64 * 1048576 ? size : 10 * 1048576, count = Math.max(1, Math.floor(size / chunk));
  const direct = env.TT_MODE === 'direct';
  const body = { source_info: { source: 'FILE_UPLOAD', video_size: size, chunk_size: chunk, total_chunk_count: count } };
  if (direct) body.post_info = { title: row.caption.slice(0, 2200), privacy_level: env.TT_PRIVACY || 'SELF_ONLY', disable_comment: false, disable_duet: false, disable_stitch: false, video_cover_timestamp_ms: 300 };
  const init = await fetch(`${TT}/post/publish/${direct ? 'video' : 'inbox/video'}/init/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(body) });
  const j = await init.json().catch(() => ({}));
  if (j.error?.code !== 'ok' || !j.data?.upload_url) throw new Error(`틱톡 시작: ${j.error?.code || init.status} ${j.error?.message || ''}`);
  const buf = await readFile(file);
  for (let i = 0; i < count; i++) {
    const a = i * chunk, z = i === count - 1 ? size : a + chunk;
    const r = await fetch(j.data.upload_url, { method: 'PUT', headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(z - a), 'Content-Range': `bytes ${a}-${z - 1}/${size}` }, body: buf.subarray(a, z) });
    if (!r.ok) throw new Error(`틱톡 조각 ${i + 1}/${count} 올리기 ${r.status}`);
  }
  let status = 'PROCESSING_UPLOAD';
  for (let i = 0; i < 30 && /PROCESSING/.test(status); i++) {
    await sleep(10000);
    const s = await fetch(`${TT}/post/publish/status/fetch/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify({ publish_id: j.data.publish_id }) });
    const sj = await s.json().catch(() => ({})); status = sj.data?.status || status;
    if (status === 'FAILED') throw new Error(`틱톡 처리 실패: ${sj.data?.fail_reason || ''}`);
  }
  return { ok: true, id: j.data.publish_id, mode: direct ? 'direct' : 'inbox', status };
}

/* ── 하루 한 번 — 곳마다 몇 개씩(운영자 결정 2026-10-05) ──
   인스타 릴스 · 틱톡: 하루 1개(대기열 차례대로). 유튜브: 되는 만큼 비공개로 쌓아 둔다(기본 5개 — 구글 하루 한도 안,
   Variables YT_PER_DAY 로 바꿀 수 있다). 공개할 것은 운영자가 유튜브 스튜디오에서 고른다.
   한 줄(영상)은 켜진 곳에 다 올라가면 「done」, 저장 칸 파일을 지운다. */
async function post(dry) {
  const want = { yt: on('SHORTS_YT'), ig: on('SHORTS_IG'), tt: on('SHORTS_TT') };
  if (!dry && !Object.values(want).some(Boolean)) { console.log('켜진 곳이 없어요(SHORTS_YT · SHORTS_IG · SHORTS_TT) — 끝'); return; }
  const quota = { yt: want.yt ? Math.max(0, Number(env.YT_PER_DAY || 5)) : 0, ig: want.ig ? 1 : 0, tt: want.tt ? 1 : 0 };
  const rows = await rest('GET', 'shorts_queue?status=eq.ready&order=id.asc&limit=40&select=*');
  if (!rows.length) { console.log('대기열이 비었어요 — 끝'); return; }
  console.log(`대기열 ${rows.length}개 · 오늘 몫: 유튜브 ${quota.yt} · 인스타 ${quota.ig} · 틱톡 ${quota.tt}`);
  if (dry) { await prepare(rows[0]); console.log('시험(--dry) — 여기까지. 올리지 않았어요.'); return; }
  let failed = false;
  for (const row of rows) {
    const ks = ['yt', 'ig', 'tt'].filter((k) => quota[k] > 0 && !row[k]?.ok && !row[k]?.skip);
    if (!ks.length) continue;
    ks.forEach((k) => quota[k]--);
    failed = (await postRow(row, ks, want)) || failed;
    if (!Object.values(quota).some((n) => n > 0)) break;
  }
  if (failed) process.exitCode = 1;   // 하나라도 실패하면 액션이 빨갛게 — 운영자가 알 수 있게
}

/* 받아서 표준 mp4 로(H.264 · AAC · 30fps · 앞에 색인) — 크롬 녹화 파일은 조각난 mp4/webm 이라 인스타 · 틱톡이 거절할 수 있다 */
async function prepare(row) {
  console.log(`#${row.id} ${row.qid} (${row.seconds ?? '?'}초) — ${row.title}`);
  const dir = 'shorts-tmp'; await mkdir(dir, { recursive: true });
  const src = join(dir, `in-${row.id}` + (row.mime === 'video/webm' ? '.webm' : '.mp4')), out = join(dir, `out-${row.id}.mp4`), cover = join(dir, `cover-${row.id}.jpg`);
  const get = async (p, f) => { const r = await fetch(publicUrl(p)); if (!r.ok) throw new Error(`파일 받기 ${r.status}: ${p}`); await writeFile(f, Buffer.from(await r.arrayBuffer())); };
  await get(row.video_path, src); if (row.cover_path) await get(row.cover_path, cover);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,fps=30',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log(`  표준 mp4 로 바꿈 — ${(statSync(out).size / 1048576).toFixed(1)}MB`);
  return { out, cover: row.cover_path ? cover : null };
}

/* 한 줄을 ks 곳에 올린다. 실패가 있으면 true */
async function postRow(row, ks, want) {
  const { out, cover } = await prepare(row);
  const postPath = row.video_path.replace(/\.\w+$/, '') + '-post.mp4';
  if (ks.includes('ig')) await storagePut(postPath, await readFile(out), 'video/mp4');   // 인스타는 공개 주소에서 가져간다
  const fns = { yt: () => toYouTube(row, out, cover), ig: () => toInstagram(row, publicUrl(postPath), row.cover_path ? publicUrl(row.cover_path) : null), tt: () => toTikTok(row, out) };
  const patch = {}; let failed = false;
  for (const k of ks) {
    try { patch[k] = await fns[k](); console.log(`  ✓ ${k}: ${patch[k].url || patch[k].id}`); }
    catch (e) { failed = true; const n = (row[k]?.tries || 0) + 1; patch[k] = n >= 3 ? { skip: true, err: e.message.slice(0, 300), tries: n } : { err: e.message.slice(0, 300), tries: n }; console.log(`  ✗ ${k} (${n}번째): ${e.message}`); }
  }
  const after = { ...row, ...patch };
  const finished = Object.entries(want).every(([k, w]) => !w || after[k]?.ok || after[k]?.skip);
  if (finished) { patch.status = 'done'; patch.posted_at = new Date().toISOString(); }
  await rest('PATCH', `shorts_queue?id=eq.${row.id}`, patch, { Prefer: 'return=minimal' });
  if (finished) { await storageDel([row.video_path, postPath, ...(row.cover_path ? [row.cover_path] : [])]); console.log('  다 올려서 저장 칸 파일을 지웠어요(표의 줄은 남아요).'); }
  return failed;
}

/* ── 연결: 일회용 코드 → refresh token(표에만 적는다) ── */
async function connect(which, code) {
  if (!code) die('코드가 없어요 — connect.html 에서 받은 코드를 넣어 주세요');
  if (which === 'yt') {
    const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ code, client_id: env.YT_CLIENT_ID || '', client_secret: env.YT_CLIENT_SECRET || '', redirect_uri: SITE_CB, grant_type: 'authorization_code' }) });
    const j = await r.json(); if (!j.refresh_token) die(`구글 연결 실패: ${j.error || r.status} ${j.error_description || ''} (코드는 몇 분 안에 써야 해요 — 다시 연결해 주세요)`);
    await kvSet('yt_refresh', j.refresh_token); console.log('✓ 유튜브 연결 끝 — 열쇠를 표에 적었어요.');
  } else if (which === 'tt') {
    const r = await fetch(`${TT}/oauth/token/`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_key: env.TT_CLIENT_KEY || '', client_secret: env.TT_CLIENT_SECRET || '', code, grant_type: 'authorization_code', redirect_uri: SITE_CB }) });
    const j = await r.json(); if (!j.refresh_token) die(`틱톡 연결 실패: ${j.error || r.status} ${j.error_description || ''} (코드는 몇 분 안에 써야 해요 — 다시 연결해 주세요)`);
    await kvSet('tt_refresh', j.refresh_token); console.log(`✓ 틱톡 연결 끝 — 권한: ${j.scope || '?'}`);
  } else die('connect 뒤에는 yt 또는 tt');
}

const cmd = process.argv[2];
try {
  if (cmd === 'post') await post(process.argv.includes('--dry'));
  else if (cmd === 'connect') await connect(process.argv[3], process.argv[4]);
  else die('쓰는 법: post [--dry] · connect yt|tt <code>');
} catch (e) { die(e.message); }
