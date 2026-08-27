/* ElevenLabs 로 소리를 굽는다.
 *
 *   node tools/tts-manifest.mjs > /tmp/tts.jsonl
 *   node tools/tts-build.mjs --in /tmp/tts.jsonl --dry      # 얼마나 드는지만
 *   node tools/tts-build.mjs --in /tmp/tts.jsonl            # 실제로 굽기
 *
 * 필요한 환경 변수 (셸에 넣어 두면 된다)
 *   ELEVEN_API_KEY   ElevenLabs 열쇠
 *   ELEVEN_VOICE_M   남자 목소리 id (선생님 목소리)
 *   ELEVEN_VOICE_W   여자 목소리 id (대화 상대)
 *
 * ── 반드시 지킨 것 ────────────────────────────────────────
 *
 * **이미 있는 파일은 건너뛴다.** 중간에 끊겨도 다시 돌리면 이어서 굽고,
 * 두 번 돌려도 돈이 두 번 나가지 않는다. 문항을 열 개 더했을 때 열 개만
 * 구워진다. 다시 굽고 싶으면 그 파일을 지우면 된다.
 *
 * **굽기 전에 얼마인지 보여 주고 물어본다.** 크레딧은 한 번 쓰면 안
 * 돌아온다. 실수로 전체를 두 번 돌리는 것이 이 도구에서 가장 비싼 사고다.
 *
 * ── 왜 이렇게 굽는가 ──────────────────────────────────────
 *
 * previous_text · next_text — 대화를 한 줄씩 따로 구우면 줄마다 문장이
 * 처음인 것처럼 읽혀서 억양이 뚝뚝 끊긴다. 앞뒤 줄을 같이 넘기면
 * ElevenLabs 가 이어지는 말투로 읽는다. 붙여 놓았을 때 차이가 크다.
 *
 * seed — 같은 씨앗을 주면 같은 소리가 난다. 문항 하나를 고쳐 다시 구웠을
 * 때 그 문항만 목소리 톤이 달라지는 것을 막는다. 파일 이름에서 씨앗을
 * 만들므로 같은 문항은 늘 같은 씨앗을 받는다.
 *
 * 이어 붙이기 — 조각을 ffmpeg 로 잇는다. 화자가 바뀌는 자리에 0.35초를
 * 넣는다. 붙여만 놓으면 두 사람이 말을 자르고 들어오는 것처럼 들린다.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import readline from 'readline';

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const has = (k) => args.includes(k);

const IN      = arg('--in', '/tmp/tts.jsonl');
const OUTDIR  = arg('--out', 'assets/audio');
const DRY     = has('--dry');
const YES     = has('--yes');
const LIMIT   = parseInt(arg('--limit', '0'), 10) || 0;
const MODEL   = arg('--model', 'eleven_multilingual_v2');
const TMP     = arg('--tmp', '/tmp/tts-parts');
/* 말 속도. ElevenLabs 가 받는 값은 0.7(느림)~1.2(빠름), 기본 1 이다.
   처음 구운 소리가 너무 빠르다는 말이 나와서 넣었다 — 이미 구운 파일은
   건너뛰므로(스킵) 다시 구우려면 그 mp3 를 지우고 다시 돌려야 한다. */
const SPEED   = Math.min(1.2, Math.max(0.7, parseFloat(arg('--speed', '1')) || 1));

const KEY = process.env.ELEVEN_API_KEY;
const VOICE = { m: process.env.ELEVEN_VOICE_M, w: process.env.ELEVEN_VOICE_W };

/* --voices : 내 목소리 목록과 id 를 보여 준다.
   ElevenLabs 화면에는 이름만 보이고 id 는 메뉴 안에 숨어 있다. 목소리를
   만들어 놓고도 id 를 몰라서 못 굽는 일이 실제로 생긴다. 열쇠가 맞는지도
   여기서 같이 확인된다 — 글자를 하나도 안 쓰고. */
if (has('--voices')) {
  if (!KEY) { console.error('ELEVEN_API_KEY 가 없다.'); process.exit(1); }
  /* v2 를 먼저 보고 안 되면 v1 로 물러난다. **이게 처음 부르는 명령이다** —
     여기서 막히면 그다음이 전부 막히는데 곁에 물어볼 사람이 없다.
     길이 하나뿐이면 ElevenLabs 가 판을 바꿨을 때 그대로 멈춘다. */
  let res = null, used = '';
  for (const url of ['https://api.elevenlabs.io/v2/voices?page_size=100',
                     'https://api.elevenlabs.io/v1/voices']) {
    try { res = await fetch(url, { headers: { 'xi-api-key': KEY } }); }
    catch (e) {
      console.error(`못 닿았다: ${e.message}`);
      console.error('인터넷이 되는지, 회사망이 막고 있지 않은지 보라.');
      process.exit(1);
    }
    used = url;
    if (res.ok) break;
    /* 401·429 는 길을 바꿔도 똑같다. 열쇠와 크레딧 문제이니 바로 알린다. */
    if (res.status === 401 || res.status === 429) break;
  }
  if (!res.ok) {
    console.error(`목록을 못 받았다: ${res.status} (${used})`);
    console.error((await res.text()).slice(0, 300));
    if (res.status === 401) console.error('\n열쇠가 틀렸다. ELEVEN_API_KEY 를 다시 봐라 — sk_ 로 시작한다.');
    if (res.status === 429) console.error('\n크레딧이 떨어졌거나 너무 빨리 불렀다.');
    process.exit(1);
  }
  const { voices = [] } = await res.json();
  if (!voices.length) {
    console.error('목소리가 하나도 없다. ElevenLabs 에서 목소리를 먼저 만들어라.');
    process.exit(1);
  }
  console.log(`목소리 ${voices.length}개\n`);
  for (const v of voices) {
    const mine = v.category === 'cloned' || v.category === 'generated' || v.category === 'professional';
    console.log(`  ${mine ? '★' : ' '} ${String(v.name).padEnd(24)} ${v.voice_id}`);
    console.log(`    ${v.category || ''}${v.labels?.gender ? ' · ' + v.labels.gender : ''}${v.labels?.language ? ' · ' + v.labels.language : ''}`);
  }
  console.log('\n★ 은 직접 만든 목소리다. 그 id 를 ELEVEN_VOICE_M 에 넣어라.');
  console.log('여자 목소리는 아무 한국어 목소리나 골라 ELEVEN_VOICE_W 에 넣으면 된다.');
  process.exit(0);
}

if (!fs.existsSync(IN)) {
  console.error(`목록이 없다: ${IN}\n먼저: node tools/tts-manifest.mjs > ${IN}`);
  process.exit(1);
}

const rows = fs.readFileSync(IN, 'utf8').split('\n')
  .filter((l) => l.trim().startsWith('{')).map((l) => JSON.parse(l));

/* 이미 구운 것은 뺀다. 이 한 줄이 이 도구에서 제일 중요하다. */
const todo = rows.filter((r) => !fs.existsSync(path.join(OUTDIR, r.out)));
const done = rows.length - todo.length;
const pick = LIMIT ? todo.slice(0, LIMIT) : todo;

const chars = pick.reduce((a, r) => a + r.parts.reduce((b, p) => b + p.text.length, 0), 0);
const parts = pick.reduce((a, r) => a + r.parts.length, 0);
const joins = pick.filter((r) => r.parts.length > 1).length;

console.log(`목록 ${rows.length}개 · 이미 구운 것 ${done}개 · 구울 것 ${pick.length}개`);
console.log(`  API 부름 ${parts}번 · 글자 ${chars.toLocaleString()}자 · 이어 붙일 것 ${joins}개`);
console.log(`  모델 ${MODEL}`);
if (MODEL.includes('flash') || MODEL.includes('turbo'))
  console.log('  (flash·turbo 는 글자당 크레딧이 절반이다. 낱말처럼 짧고 많은 것에 쓴다.)');

if (DRY) { console.log('\n--dry 라 굽지 않았다.'); process.exit(0); }
if (!pick.length) { console.log('\n구울 것이 없다.'); process.exit(0); }

if (!KEY) { console.error('\nELEVEN_API_KEY 가 없다.'); process.exit(1); }
const needW = pick.some((r) => r.parts.some((p) => p.voice === 'w'));
if (!VOICE.m) { console.error('ELEVEN_VOICE_M 이 없다.'); process.exit(1); }
if (needW && !VOICE.w) {
  console.error('ELEVEN_VOICE_W 가 없다. 대화가 있어 여자 목소리가 필요하다 —');
  console.error('한 목소리로 둘을 다 읽으면 「여자는 무엇을 합니까」가 성립하지 않는다.');
  process.exit(1);
}

let ffmpeg = true;
try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); }
catch (e) { ffmpeg = false; }
if (joins && !ffmpeg) {
  console.error(`\n이어 붙일 것이 ${joins}개인데 ffmpeg 가 없다. 조각은 구워서 ${TMP} 에 두겠지만`);
  console.error('합쳐지지 않는다. ffmpeg 를 깔고 다시 돌려라 (조각은 다시 안 굽는다).');
}

if (!YES) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const a = await new Promise((r) => rl.question('\n구울까? 크레딧은 되돌릴 수 없다. [y/N] ', r));
  rl.close();
  if (!/^y(es)?$/i.test(a.trim())) { console.log('그만뒀다.'); process.exit(0); }
}

fs.mkdirSync(TMP, { recursive: true });

/* 파일 이름에서 씨앗을 만든다 — 같은 문항은 늘 같은 씨앗을 받아서
   고쳐 다시 구워도 목소리 톤이 안 흔들린다. */
const seedOf = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h) % 2147483647;
};

async function speak(part, ctxPrev, ctxNext, seed, outFile) {
  if (fs.existsSync(outFile)) return 'skip';
  const vid = VOICE[part.voice] || VOICE.m;
  const body = {
    text: part.text,
    model_id: MODEL,
    seed,
    voice_settings: {
      /* 안내 방송·독백은 또박또박, 대화는 조금 자연스럽게. 가르치는 소리라
         「연기」보다 「또렷함」이 먼저다 — 학습자가 듣고 따라 한다. */
      stability: part.narration ? 0.62 : 0.5,
      similarity_boost: 0.85,
      style: 0,
      use_speaker_boost: true,
      speed: SPEED,
    },
  };
  if (ctxPrev) body.previous_text = ctxPrev;
  if (ctxNext) body.next_text = ctxNext;

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${vid}?output_format=mp3_44100_128`,
    { method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body) });

  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
  return 'made';
}

let made = 0, failed = 0, joined = 0;
for (const [i, r] of pick.entries()) {
  const dest = path.join(OUTDIR, r.out);
  const tag = `[${i + 1}/${pick.length}] ${r.out}`;
  try {
    if (r.parts.length === 1) {
      await speak(r.parts[0], '', '', seedOf(r.out), dest);
      made++; console.log(`${tag}  ✓`);
      continue;
    }

    /* 조각을 굽고 잇는다. 조각도 이미 있으면 건너뛰므로, ffmpeg 가 없어
       못 합쳤던 것을 나중에 다시 돌리면 굽지 않고 합치기만 한다. */
    const files = [];
    for (const [j, p] of r.parts.entries()) {
      const f = path.join(TMP, `${r.out.replace(/[\\/]/g, '_')}.${j}.mp3`);
      await speak(p, r.parts[j - 1]?.text || '', r.parts[j + 1]?.text || '',
                  seedOf(r.out + ':' + j), f);
      files.push(f);
    }
    if (!ffmpeg) { console.log(`${tag}  조각 ${files.length}개 (ffmpeg 없어 못 합침)`); continue; }

    /* 화자가 바뀌는 자리에 0.35초. 붙여만 놓으면 말을 자르고 들어오는
       것처럼 들린다. */
    const gap = path.join(TMP, '_gap.mp3');
    if (!fs.existsSync(gap))
      execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono',
                              '-t', '0.35', '-q:a', '9', gap], { stdio: 'ignore' });
    const seq = files.flatMap((f, k) => (k ? [gap, f] : [f]));
    const listFile = path.join(TMP, 'list.txt');
    fs.writeFileSync(listFile, seq.map((f) => `file '${path.resolve(f)}'`).join('\n'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile,
                            '-c', 'copy', dest], { stdio: 'ignore' });
    made++; joined++; console.log(`${tag}  ✓ (${files.length}조각 이어 붙임)`);
  } catch (e) {
    failed++;
    console.error(`${tag}  ✗ ${e.message}`);
    /* 429(한도 초과)는 계속 돌려 봐야 다 실패한다. 크레딧이 남았는지
       보고 다시 돌리는 편이 낫다. */
    if (/\b429\b|quota|credit/i.test(e.message)) {
      console.error('\n크레딧이 떨어졌거나 너무 빨리 부르고 있다. 여기서 멈춘다 —');
      console.error('구운 것은 남아 있으니 다시 돌리면 이어서 굽는다.');
      break;
    }
  }
}

console.log(`\n구움 ${made}개 (이어 붙임 ${joined}) · 실패 ${failed}개`);
if (made) console.log('다음: node tools/stamp.mjs 로 자국을 새로 찍고 올린다.');
