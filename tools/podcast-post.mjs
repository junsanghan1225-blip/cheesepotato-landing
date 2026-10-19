// 팟캐스트 — 대기열(Supabase podcast_queue)에서 「ready」 줄을 꺼내 유튜브에 올리고, 스포티파이가 읽는 방송 목록(feed.xml)을 다시 쓴다(운영자 요청 2026-10-19).
// .github/workflows/podcast-post.yml 이 30분마다 부른다. 순서 · 열쇠 넣는 법은 docs/ops/podcast-auto.md.
//
//   node tools/podcast-post.mjs post [--dry]   ready 줄(한 번에 2개까지)을 소리 + 표지로 영상을 만들어 유튜브에 올린다(--dry 면 영상 만들기까지만). 끝에 feed.xml 도 쓴다.
//   node tools/podcast-post.mjs feed           feed.xml 만 다시 쓴다
//
// 유튜브 열쇠는 쇼츠 공장과 같은 것(표 shorts_kv 의 yt_refresh · Secrets 의 YT_CLIENT_ID · YT_CLIENT_SECRET) — 따로 연결하지 않는다.
// 자막: 기본은 유튜브가 만드는 자동 자막. 변수 PODCAST_SRT=on 이면 Whisper(faster-whisper)로 직접 자막을 만들어 올린다(아직 시험 전 — docs/ops/podcast-auto.md).
// 열쇠는 환경 변수로만 받고 로그 · 파일 · 표에 찍지 않는다.
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { statSync } from 'node:fs';
import { join } from 'node:path';

const SB = 'https://tjgoevtvobvmlyefgxel.supabase.co';
const SITE = 'https://everykoreans.com';
const env = process.env;
const on = (k) => String(env[k] || '').toLowerCase().startsWith('on');
const die = (m) => { console.error(`\n✗ ${m}\n`); process.exit(1); };
const KEY = env.SUPABASE_SERVICE_KEY;
if (!KEY) die('SUPABASE_SERVICE_KEY 가 없어요 — GitHub Secrets 에 넣어 주세요(docs/ops/shorts-auto.md 0-2).');

const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
async function rest(method, path, body, extra = {}) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { method, headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=representation', ...extra }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); if (!r.ok) throw new Error(`Supabase ${r.status}: ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : null;
}
const kvGet = async (k) => (await rest('GET', `shorts_kv?k=eq.${k}&select=v`))[0]?.v || null;
const publicUrl = (p) => `${SB}/storage/v1/object/public/podcast/${p.split('/').map(encodeURIComponent).join('/')}`;
async function storagePut(p, buf, type) {
  const r = await fetch(`${SB}/storage/v1/object/podcast/${p}`, { method: 'POST', headers: { ...H, 'Content-Type': type, 'x-upsert': 'true' }, body: buf });
  if (!r.ok) throw new Error(`저장 칸 올리기 ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

async function googleToken() {
  const refresh = (await kvGet('yt_refresh')) || env.YT_REFRESH_TOKEN;
  if (!env.YT_CLIENT_ID || !env.YT_CLIENT_SECRET || !refresh) throw new Error('유튜브 열쇠가 없어요(쇼츠 공장과 같은 YT_CLIENT_ID · YT_CLIENT_SECRET · 연결) — docs/ops/shorts-auto.md 2번');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: env.YT_CLIENT_ID, client_secret: env.YT_CLIENT_SECRET, refresh_token: refresh, grant_type: 'refresh_token' }) });
  const j = await r.json(); if (!j.access_token) throw new Error(`구글 열쇠 새로 받기 실패: ${j.error || r.status} ${j.error_description || ''} — 연결을 다시 해 주세요(docs/ops/shorts-auto.md 2-6)`);
  return j.access_token;
}

/* 소리 + 표지 그림 → 영상(정지 그림 · H.264 · AAC). 유튜브는 소리만 올릴 수 없어서 */
function makeVideo(audio, cover, out) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-framerate', '2', '-i', cover, '-i', audio,
    '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p',
    '-c:v', 'libx264', '-tune', 'stillimage', '-preset', 'veryfast', '-crf', '28', '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
}

async function toYouTube(row, file, cover) {
  const token = await googleToken();
  const size = statSync(file).size;
  const meta = { snippet: { title: row.title, description: `${row.description}\n\n🎧 https://everykoreans.com`, tags: row.tags || [], categoryId: '27', defaultLanguage: 'en' },
    status: { privacyStatus: env.YT_PRIVACY || 'private', selfDeclaredMadeForKids: false } };
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': String(size) }, body: JSON.stringify(meta) });
  if (!init.ok) throw new Error(`유튜브 시작 ${init.status}: ${(await init.text()).slice(0, 300)}`);
  const put = await fetch(init.headers.get('location'), { method: 'PUT', headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(size) }, body: await readFile(file) });
  const v = await put.json().catch(() => ({})); if (!put.ok || !v.id) throw new Error(`유튜브 올리기 ${put.status}: ${JSON.stringify(v).slice(0, 300)}`);
  let thumb = false;
  if (cover) {
    const t = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${v.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/jpeg' }, body: await readFile(cover) });
    thumb = t.ok; if (!t.ok) console.log(`  (유튜브 표지는 못 넣었어요 ${t.status} — 채널 인증이 필요할 수 있어요)`);
  }
  let captions = null;
  if (on('PODCAST_SRT')) {
    try { captions = await addCaptions(token, v.id, file); }
    catch (e) { console.log(`  (자막은 못 붙였어요: ${e.message} — 유튜브 자동 자막이 대신 달려요)`); }
  }
  return { ok: true, id: v.id, url: `https://youtu.be/${v.id}`, privacy: meta.status.privacyStatus, thumb, captions };
}

/* Whisper(faster-whisper) → .srt → 유튜브 자막 올리기. 시험 전 기능 — 실패해도 영상은 올라갔으니 넘어간다 */
async function addCaptions(token, videoId, mediaFile) {
  const srt = mediaFile.replace(/\.\w+$/, '.srt');
  execFileSync('python3', ['tools/podcast-whisper.py', mediaFile, srt], { stdio: 'inherit' });
  const lang = env.PODCAST_SRT_LANG || 'en';
  const b = '----podcastcaps';
  const body = Buffer.concat([
    Buffer.from(`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ snippet: { videoId, language: lang, name: 'Auto subtitles', isDraft: false } })}\r\n--${b}\r\nContent-Type: application/octet-stream\r\n\r\n`),
    await readFile(srt), Buffer.from(`\r\n--${b}--`)]);
  const r = await fetch('https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${b}` }, body });
  if (!r.ok) throw new Error(`자막 올리기 ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return { ok: true, lang };
}

/* ── 스포티파이가 읽는 방송 목록 ── */
const xml = (s) => String(s ?? '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const MIME = { 'audio/m4a': 'audio/x-m4a', 'audio/mp4': 'audio/x-m4a' };
async function feed() {
  const rows = await rest('GET', 'podcast_queue?status=neq.cancel&select=id,ep,audio_path,mime,seconds,bytes,title,description,created_at&order=created_at.asc');
  const items = (rows || []).map((r) => `    <item>
      <title>${xml(r.title)}</title>
      <description>${xml(r.description)}</description>
      <enclosure url="${xml(publicUrl(r.audio_path))}" length="${r.bytes || 0}" type="${xml(MIME[r.mime] || r.mime || 'audio/mpeg')}"/>
      <guid isPermaLink="false">cheesepotato-podcast-${r.id}</guid>
      <pubDate>${new Date(r.created_at).toUTCString()}</pubDate>
      <itunes:duration>${r.seconds || 0}</itunes:duration>
      <itunes:episode>${Number(r.ep) || 0}</itunes:episode>
      <itunes:explicit>false</itunes:explicit>
    </item>`).join('\n');
  const out = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CheesePotato — Korean Expressions</title>
    <link>${SITE}</link>
    <language>en</language>
    <description>Short Korean lessons about everyday expressions — meaning, example sentences and short dialogues. Free practice at everykoreans.com.</description>
    <itunes:author>CheesePotato · Everykoreans</itunes:author>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Education"><itunes:category text="Language Learning"/></itunes:category>
    <itunes:image href="${SITE}/podcast-cover.jpg"/>
    <image><url>${SITE}/podcast-cover.jpg</url><title>CheesePotato — Korean Expressions</title><link>${SITE}</link></image>
    <atom:link href="${publicUrl('feed.xml')}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
  await storagePut('feed.xml', Buffer.from(out), 'application/rss+xml');
  console.log(`방송 목록 feed.xml 갱신 — 에피소드 ${(rows || []).length}개 → ${publicUrl('feed.xml')}`);
}

async function post(dry) {
  const rows = await rest('GET', 'podcast_queue?status=eq.ready&order=id.asc&limit=2');
  if (!rows?.length) { console.log('올릴 팟캐스트가 없어요.'); return; }
  const dir = 'podcast-tmp'; await mkdir(dir, { recursive: true });
  let failed = false;
  for (const row of rows) {
    console.log(`#${row.id} EP ${row.ep} — ${row.title}`);
    try {
      const ext = (row.audio_path.match(/\.(\w+)$/) || [])[1] || 'mp3';
      const audio = join(dir, `a-${row.id}.${ext}`), cover = join(dir, `c-${row.id}.jpg`), out = join(dir, `v-${row.id}.mp4`);
      const get = async (p, f) => { const r = await fetch(publicUrl(p)); if (!r.ok) throw new Error(`파일 받기 ${r.status}: ${p}`); await writeFile(f, Buffer.from(await r.arrayBuffer())); };
      await get(row.audio_path, audio); if (row.cover_path) await get(row.cover_path, cover);
      makeVideo(audio, row.cover_path ? cover : `${process.cwd()}/podcast-cover.jpg`, out);
      console.log(`  영상으로 바꿈 — ${(statSync(out).size / 1048576).toFixed(1)}MB`);
      if (dry) continue;
      /* 자막은 영상이 아니라 소리에서 만든다 — 더 빠르다 */
      const yt = await toYouTube(row, out, row.cover_path ? cover : null);
      console.log(`  ✓ 유튜브: ${yt.url}`);
      await rest('PATCH', `podcast_queue?id=eq.${row.id}`, { yt, status: 'done', posted_at: new Date().toISOString() }, { Prefer: 'return=minimal' });
    } catch (e) {
      failed = true; const n = (row.yt?.tries || 0) + 1;
      const yt = n >= 3 ? { skip: true, err: e.message.slice(0, 300), tries: n } : { err: e.message.slice(0, 300), tries: n };
      console.log(`  ✗ 유튜브(${n}번째): ${e.message}`);
      if (!dry) await rest('PATCH', `podcast_queue?id=eq.${row.id}`, n >= 3 ? { yt, status: 'done' } : { yt }, { Prefer: 'return=minimal' });
    }
  }
  if (failed) process.exitCode = 1;
}

const cmd = process.argv[2];
try {
  if (cmd === 'post') { await post(process.argv.includes('--dry')); await feed(); }
  else if (cmd === 'feed') await feed();
  else die('쓰는 법: post [--dry] · feed');
} catch (e) { die(e.message); }
