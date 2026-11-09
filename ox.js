/* OX 퀴즈 (/ox/) — 이름은 그냥 「OX 퀴즈」(운영자 2026-11-09), 캐릭터만 햄스터 — 운영자 2026-11-09 「메타버스처럼 OX 퀴즈 · 모여서 O 가 정답이면 X 에 있으면 죽는 느낌 · 캐릭터는 햄스터」 1단계.
   1단계는 서버 없이 이 기기에서만 돈다: 함께 뛰는 햄스터는 컴퓨터가 움직인다(2단계에서 실제 접속자와 함께).
   문항은 ox-questions.js(우리 TOPIK I 낱말 자료에서 만든 생성물). 3D 는 three.js(vendor, MIT). */
import * as THREE from './vendor/three.module.min.js?v=3a9aa85c';
import { OX } from './ox-questions.js?v=3a9aa85c';
import { leaveNudge } from './leave-nudge.js?v=3a9aa85c';
leaveNudge('ox');

const $ = (id) => document.getElementById(id);
const dl = (ev, extra) => { try { (window.dataLayer = window.dataLayer || []).push({ event: ev, ...extra }); } catch (e) { /* 기록만 빠진다 */ } };
const N_Q = 15, ASK = 12, REVEAL = 3.4, BOTS = 11;   // 문제마다 12초(운영자 2026-11-09 「12초로 늘려 줘」)
const FIELD = { x: 7.2, z: 4.6 };   // 운동장 반 폭 · 반 깊이(가운데 줄 x = 0, 왼쪽 O · 오른쪽 X)

/* ── 소리(시작 단추를 누른 뒤에만) ── */
let ac = null;
const audio = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } } return ac; };
function tone(f, dur, type = 'sine', vol = 0.12, slide = 0) {
  if (!ac || !soundOn) return;
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
}
const sTick = () => tone(880, 0.08, 'square', 0.05);
const sOk = () => { tone(660, 0.14, 'triangle'); setTimeout(() => tone(990, 0.22, 'triangle'), 120); };
const sNg = () => tone(220, 0.45, 'sawtooth', 0.08, -120);
const sFall = () => tone(500, 0.8, 'sine', 0.07, -420);
let soundOn = true, noiseBuf = null;
const noise = () => { if (!ac) return null; if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return noiseBuf; };
function burst(freq, q, dur, vol, type = 'bandpass') {
  if (!ac || !soundOn || !noise()) return;
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
  s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.08, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(ac.destination); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}
const sRoll = () => burst(180 + Math.random() * 60, 1.2, 0.06, 0.12, 'lowpass');            // 북 두드리는 소리
const sClunk = () => { tone(90, 0.25, 'square', 0.12, -40); burst(400, 0.8, 0.2, 0.15, 'lowpass'); };   // 문 열리는 쿵
const sSplash = () => burst(1400, 0.6, 0.45, 0.12);                                          // 첨벙
const sCheer = () => burst(2200, 0.4, 1.6, 0.06);                                            // 와아(관중)
/* 배경 음악: 가볍게 도는 네 마디(시작 단추를 누른 뒤, 소리 끄기 단추로 끔) */
let musicAt = 0, musicStep = 0;
const MELODY = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1047, 988, 784, 659, 587];
function musicTick() {
  if (!ac || !soundOn || phase === 'intro' || phase === 'end') return;
  if (ac.currentTime < musicAt) return;
  const t0 = Math.max(ac.currentTime, musicAt);
  const f = MELODY[musicStep % MELODY.length], o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle'; o.frequency.value = f / 2; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.025, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.24);
  o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + 0.3);
  musicStep++; musicAt = t0 + 0.26;
}

/* ── 3D ── */
let renderer = null;
try { renderer = new THREE.WebGLRenderer({ canvas: $('scene'), antialias: true }); } catch (e) { renderer = null; }
if (!renderer) $('noGl').classList.add('on');
const fine = matchMedia('(pointer:fine)').matches;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3f5);
scene.fog = new THREE.Fog(0xbfe3f5, 30, 70);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  if (fine) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
}
scene.add(new THREE.HemisphereLight(0xffffff, 0x7a8a6a, 1.05));
const sun = new THREE.DirectionalLight(0xfff2d8, 1.1); sun.position.set(-6, 12, 8);
if (fine) { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); }
scene.add(sun);
const mat = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
const cast = (o) => { if (fine) { o.castShadow = true; o.receiveShadow = true; } return o; };
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

/* 풀밭 · 울타리 · 나무 */
{ // 풀밭에는 운동장 크기만큼 구멍을 낸다 — 바닥 문이 열리면 아래 물웅덩이가 보이게
  const sh = new THREE.Shape([new THREE.Vector2(-60, -60), new THREE.Vector2(60, -60), new THREE.Vector2(60, 60), new THREE.Vector2(-60, 60)]);
  const W = FIELD.x + 0.25, D = FIELD.z + 0.25; sh.holes.push(new THREE.Path([new THREE.Vector2(-W, -D), new THREE.Vector2(-W, D), new THREE.Vector2(W, D), new THREE.Vector2(W, -D)]));
  const g = new THREE.Mesh(new THREE.ShapeGeometry(sh), mat(0x86c06c)); g.rotation.x = -Math.PI / 2; g.position.y = -0.02; if (fine) g.receiveShadow = true; scene.add(g);
}
const fenceM = mat(0xf4efe3);
for (let i = -11; i <= 11; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.12), fenceM); p.position.set(i, 0.35, -9.5); scene.add(p); }
{ const r = new THREE.Mesh(new THREE.BoxGeometry(22, 0.1, 0.08), fenceM); r.position.set(0, 0.55, -9.5); scene.add(r); }
const treeM = [0x4f8c55, 0x5aa05f, 0x47804c].map((c) => mat(c)), trunkM = mat(0x7a5634);
for (const [x, z, s] of [[-12, -11, 1.4], [-8, -13, 1.1], [-3, -14, 1.5], [3, -13.5, 1.2], [8, -12.5, 1.4], [12.5, -10, 1.2], [-13, -4, 1.1], [13.5, -3, 1.3], [-13, 3, 1.2], [13, 4, 1]]) {
  const t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s);
  const tr = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.8, 8), trunkM)); tr.position.y = 0.9; t.add(tr);
  [[0, 2.4, 0, 1.3], [-0.7, 1.9, 0.3, 0.9], [0.8, 2.0, -0.2, 1]].forEach(([dx, dy, dz, r], i) => { const l = cast(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), treeM[i % 3])); l.position.set(dx, dy, dz); t.add(l); });
  scene.add(t);
}

/* 하늘(위는 진한 파랑 → 아래는 밝게) · 줄 깃발 · 조명탑 — 야외 퀴즈 대회장처럼 */
scene.background = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6fb6ea'); gr.addColorStop(0.6, '#bfe3f5'); gr.addColorStop(1, '#e8f4ea'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
{
  const cols = [0xe4631f, 0x2f6fd6, 0xf2c744, 0xd6452f, 0x4e9a5c, 0xffffff];
  const tri = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.22, 0, 0), new THREE.Vector3(0.22, 0, 0), new THREE.Vector3(0, -0.42, 0)]); tri.computeVertexNormals();
  for (const zz of [-5.4, 5.6]) for (let i = 0; i <= 26; i++) {
    const x = -10 + i * (20 / 26), y = 3.6 - Math.sin((i / 26) * Math.PI) * 0.9;
    const f = new THREE.Mesh(tri, new THREE.MeshLambertMaterial({ color: cols[i % cols.length], side: THREE.DoubleSide })); f.position.set(x, y, zz); scene.add(f);
  }
  const cord = new THREE.LineBasicMaterial({ color: 0x4a4038 });
  for (const zz of [-5.4, 5.6]) { const pts = []; for (let i = 0; i <= 26; i++) pts.push(new THREE.Vector3(-10 + i * (20 / 26), 3.6 - Math.sin((i / 26) * Math.PI) * 0.9, zz)); scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), cord)); }
  const pole = mat(0x6b6f75), lamp = new THREE.MeshBasicMaterial({ color: 0xfff6d8 });
  for (const x of [-10.2, 10.2]) for (const zz of [-5.4, 5.6]) {
    const p = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4.4, 10), pole)); p.position.set(x, 2.2, zz); scene.add(p);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.3), lamp); l.position.set(x, 4.5, zz); l.lookAt(0, 0, 0); scene.add(l);
  }
}

/* 전광판(관중석 뒤) — 남은 초 · 정답 · 판 점수를 크게 */
const board = (() => {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 320; const g = c.getContext('2d');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const frameM = mat(0x2a2623);
  const fr = cast(new THREE.Mesh(new THREE.BoxGeometry(8.4, 2.9, 0.3), frameM)); fr.position.set(0, 2.7, -9.3); scene.add(fr);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.5), new THREE.MeshBasicMaterial({ map: t })); scr.position.set(0, 2.7, -9.14); scene.add(scr);
  for (const x of [-3.4, 3.4]) { const leg = cast(new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.2, 0.25), frameM)); leg.position.set(x, 0.8, -9.3); scene.add(leg); }
  let lastKey = '';
  return (key, draw) => { if (key === lastKey) return; lastKey = key; g.fillStyle = '#121418'; g.fillRect(0, 0, 1024, 320); g.fillStyle = 'rgba(255,255,255,.04)'; for (let y = 0; y < 320; y += 6) g.fillRect(0, y, 1024, 2); draw(g); t.needsUpdate = true; };
})();
const boardFont = (wt, px) => `${wt} ${px}px "Pretendard Variable",Pretendard,sans-serif`;
function boardIdle() { board('idle', (g) => { g.textAlign = 'center'; g.fillStyle = '#f2c744'; g.font = boardFont(900, 92); g.fillText('O X 퀴즈', 512, 150); g.fillStyle = '#fff'; g.font = boardFont(700, 40); g.fillText('맞으면 O · 틀리면 X 쪽에 서요', 512, 236); }); }
function boardCount(n, no, total) { board(`c${n}-${no}`, (g) => { g.textAlign = 'center'; g.fillStyle = '#9aa3ad'; g.font = boardFont(700, 38); g.fillText(`${no} / ${total}`, 512, 62); g.fillStyle = n <= 3 ? '#ff6b4a' : '#ffffff'; g.font = boardFont(900, 200); g.fillText(String(n), 512, 270); }); }
function boardAnswer(a) { board(`a${a}`, (g) => { g.textAlign = 'center'; g.fillStyle = '#9aa3ad'; g.font = boardFont(700, 40); g.fillText('정답', 512, 64); g.fillStyle = a ? '#4f8df0' : '#ff5a43'; g.font = boardFont(900, 210); g.fillText(a ? 'O' : 'X', 512, 282); }); }
function boardText(key, big, small) { board(key, (g) => { g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = boardFont(900, 86); g.fillText(big, 512, 160); g.fillStyle = '#9aa3ad'; g.font = boardFont(700, 38); g.fillText(small, 512, 236); }); }
boardIdle();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { boardIdle(); });

/* O · X 판(꺼지는 바닥). 판 아래는 깊은 구덩이 */
const pit = new THREE.Mesh(new THREE.BoxGeometry(FIELD.x * 2 + 0.4, 0.1, FIELD.z * 2 + 0.4), mat(0x1f5f86)); pit.position.set(0, -4, 0); scene.add(pit);
{ // 구덩이 벽(바닥이 꺼지면 보인다)
  const wm = mat(0x4a3a2c);
  for (const [w, d, x, z] of [[FIELD.x * 2 + 0.4, 0.2, 0, -FIELD.z - 0.1], [FIELD.x * 2 + 0.4, 0.2, 0, FIELD.z + 0.1], [0.2, FIELD.z * 2 + 0.4, -FIELD.x - 0.1, 0], [0.2, FIELD.z * 2 + 0.4, FIELD.x + 0.1, 0]]) {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, 4, d), wm); o.position.set(x, -2, z); scene.add(o);
  }
}
const panelTex = (letter, bg, fg) => canvasTex(512, 384, (g, w, h) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 6; for (let i = 0; i < 6; i++) { g.strokeRect(10 + i * 0, 10, w - 20, h - 20); }
  g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 8; i++) g.fillRect(i * 64, 0, 32, h);
  g.strokeStyle = fg; g.lineWidth = 46; g.lineCap = 'round';
  if (letter === 'O') { g.beginPath(); g.arc(w / 2, h / 2, 120, 0, Math.PI * 2); g.stroke(); }
  else { g.beginPath(); g.moveTo(w / 2 - 110, h / 2 - 110); g.lineTo(w / 2 + 110, h / 2 + 110); g.moveTo(w / 2 + 110, h / 2 - 110); g.lineTo(w / 2 - 110, h / 2 + 110); g.stroke(); }
});
/* 한쪽 판 = 경첩이 바깥쪽에 달린 문 두 짝. 정답이 아니면 두 짝이 아래로 활짝 열린다 */
const DOOR_W = FIELD.x - 0.15, DOOR_D = FIELD.z * 2;
function mkSide(letter, bg, fg, cx) {
  const tex = panelTex(letter, bg, fg), side = { leaves: [], mats: [], open: 0 };
  for (const half of [0, 1]) {
    const t = tex.clone(); t.needsUpdate = true; t.repeat.set(0.5, 1); t.offset.set(half * 0.5, 0);
    const top = new THREE.MeshLambertMaterial({ map: t, emissive: 0xffffff, emissiveIntensity: 0 }); side.mats.push(top);
    const edge = mat(bg);
    const leaf = cast(new THREE.Mesh(new THREE.BoxGeometry(DOOR_W / 2, 0.3, DOOR_D), [edge, edge, top, edge, edge, edge]));
    const piv = new THREE.Group(), hx = cx + (half ? DOOR_W / 2 : -DOOR_W / 2);   // 경첩: 왼짝은 왼쪽 끝 · 오른짝은 오른쪽 끝
    piv.position.set(hx, -0.15, 0); leaf.position.x = half ? -DOOR_W / 4 : DOOR_W / 4; piv.add(leaf); scene.add(piv);
    side.leaves.push({ piv, dir: half ? 1 : -1 });
  }
  return side;
}
const sideO = mkSide('O', '#2f6fd6', '#ffffff', -FIELD.x / 2 - 0.075), sideX = mkSide('X', '#d6452f', '#ffffff', FIELD.x / 2 + 0.075);
const setOpen = (side, k) => { side.open = k; for (const l of side.leaves) l.piv.rotation.z = l.dir * k * 1.45; };
/* 구덩이 바닥은 물(떨어지면 첨벙) */
const WATER_Y = -3.1;
{ const w = new THREE.Mesh(new THREE.PlaneGeometry(FIELD.x * 2 + 0.3, FIELD.z * 2 + 0.3), new THREE.MeshLambertMaterial({ color: 0x3aa0d8, transparent: true, opacity: 0.88 })); w.rotation.x = -Math.PI / 2; w.position.y = WATER_Y; scene.add(w); }
{ const line = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, FIELD.z * 2), mat(0xf6f1e7)); line.position.set(0, -0.14, 0); scene.add(line); }
/* 관중석(떨어진 햄스터가 앉아서 끝까지 본다) */
const stands = new THREE.Group(); scene.add(stands);
for (let r = 0; r < 2; r++) { const s = cast(new THREE.Mesh(new THREE.BoxGeometry(16, 0.4 + r * 0.4, 1.2), mat(r ? 0xc9b48f : 0xd9c7a2))); s.position.set(0, 0.2 + r * 0.2, -6.6 - r * 1.2); stands.add(s); }
/* 떨어지면 벤치에서 기다린다(운영자 2026-11-09 「떨어지면 옆에 벤치에 대기」) — 운동장 바로 앞(카메라 쪽)에 긴 벤치. 폰 세로 화면에서도 보이는 자리. 16자리. */
const BENCH_Z = FIELD.z + 1.25;
{
  const seat = cast(new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.12, 0.9), mat(0x9a6b3e))); seat.position.set(0, 0.36, BENCH_Z); scene.add(seat);
  const back = cast(new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.6, 0.12), mat(0x8a5e34))); back.position.set(0, 0.7, BENCH_Z + 0.42); scene.add(back);
  for (const x of [-7.4, -3.7, 0, 3.7, 7.4]) for (const dz of [-0.32, 0.32]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36, 0.08), mat(0x3d342b)); leg.position.set(x, 0.18, BENCH_Z + dz); scene.add(leg); }
}
const standSpot = (k) => { k = ((k % 16) + 16) % 16; return { x: -6.95 + k * 0.927, y: 0.42, z: BENCH_Z }; };
const onBench = (x, z) => z == null ? false : Math.abs(z - BENCH_Z) < 0.5;

/* ── 햄스터 ── 공처럼 둥근 몸 + 앞쪽 얼굴(+z 를 본다) · 귀 · 볼주머니 · 흰 배 · 분홍 발 */
const sph = new THREE.SphereGeometry(1, 20, 14);
const part = (parent, m, x, y, z, sx, sy, sz) => { const o = cast(new THREE.Mesh(sph, m)); o.position.set(x, y, z); o.scale.set(sx, sy, sz); parent.add(o); return o; };
const LOOK = {
  cheese: { fur: 0xe8a552, belly: 0xfff4e2, ear: 0xf0b7ae, tip: 0x8a7468 },   // 사진 속 치즈: 노란 털 · 귀 끝 회갈색
  gamja: { fur: 0xa3a19c, belly: 0xf7f5f0, ear: 0xd8b8b2, stripe: 0x55524e, tip: 0x8f8c87 },   // 감자: 회색 · 등 줄 · 흰 배
  snow: { fur: 0xf6f3ec, belly: 0xffffff, ear: 0xf1c1c1 },
  cocoa: { fur: 0x8a5a3a, belly: 0xf1e4d2, ear: 0xc99a90 },
  cream: { fur: 0xf2d7a8, belly: 0xfffaf0, ear: 0xe8b8b0 },
  panda: { fur: 0x2e2b2a, belly: 0xf6f3ec, ear: 0x6a5a58, patch: 1 },
};
/* 귀엽게(운영자 2026-11-09 「우리 햄스터들처럼 엄청 귀엽게」 — 치즈: 노란 골든 · 귀 끝이 진함 · 흰 주둥이, 감자: 회색 · 등 줄무늬 · 흰 배)
   머리가 몸만큼 크고(아기 비율), 큰 눈에 반짝이 두 개, 볼 발그레, ω 입, 앞발을 가슴 앞에 모은다. 눈을 깜빡이고 코를 씰룩인다. */
function makeHamster(kind, scale = 1) {
  const L = LOOK[kind], fur = mat(L.fur), belly = mat(L.belly), pink = mat(0xf4aaa8), black = mat(0x15110f), white = new THREE.MeshBasicMaterial({ color: 0xffffff }), earIn = mat(L.ear), tip = mat(L.tip || L.fur);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); g.scale.setScalar(scale);
  part(body, fur, 0, 0.36, -0.02, 0.43, 0.36, 0.44);            // 몸(동그란 떡)
  part(body, belly, 0, 0.3, 0.17, 0.32, 0.27, 0.27);            // 흰 배
  if (L.stripe) part(body, mat(L.stripe), 0, 0.71, -0.1, 0.05, 0.035, 0.34);   // 감자 등 줄무늬
  if (L.patch) part(body, belly, 0, 0.55, 0.05, 0.4, 0.22, 0.4);
  const head = new THREE.Group(); head.position.set(0, 0.68, 0.2); body.add(head);
  part(head, fur, 0, 0, 0, 0.38, 0.33, 0.34);                   // 큰 머리
  part(head, belly, 0, -0.1, 0.17, 0.24, 0.17, 0.19);           // 흰 주둥이
  const eyes = [], ears = [];
  for (const sx of [-1, 1]) {
    part(head, belly, sx * 0.22, -0.08, 0.13, 0.15, 0.13, 0.14); // 볼주머니(빵빵)
    const ear = new THREE.Group(); ear.position.set(sx * 0.24, 0.27, -0.05); ear.rotation.z = -sx * 0.35; head.add(ear); ears.push(ear);
    part(ear, tip, 0, 0, 0, 0.11, 0.11, 0.045); part(ear, earIn, 0, -0.01, 0.025, 0.075, 0.075, 0.02);   // 둥근 귀(치즈는 끝이 진함)
    const eye = new THREE.Group(); eye.position.set(sx * 0.15, 0.03, 0.27); head.add(eye); eyes.push(eye);
    part(eye, black, 0, 0, 0, 0.075, 0.085, 0.05);                // 큰 까만 눈
    const h1 = new THREE.Mesh(sph, white); h1.position.set(-0.022, 0.03, 0.045); h1.scale.setScalar(0.024); eye.add(h1);   // 반짝이
    const h2 = new THREE.Mesh(sph, white); h2.position.set(0.02, -0.025, 0.045); h2.scale.setScalar(0.011); eye.add(h2);
    const bl = part(head, mat(0xf59a9a), sx * 0.25, -0.07, 0.21, 0.065, 0.035, 0.02); bl.material.transparent = true; bl.material.opacity = 0.75;   // 볼 발그레
    part(body, pink, sx * 0.09, 0.42, 0.42, 0.055, 0.045, 0.05);   // 가슴 앞에 모은 앞발
    part(body, pink, sx * 0.2, 0.04, 0.12, 0.09, 0.045, 0.12);     // 뒷발
  }
  const nose = part(head, pink, 0, -0.02, 0.355, 0.035, 0.026, 0.022);   // 코
  { const mouthM = new THREE.LineBasicMaterial({ color: 0x5a3a34 }); const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12, x = (u - 0.5) * 0.09; pts.push(new THREE.Vector3(x, -0.07 - Math.abs(Math.sin(u * Math.PI * 2)) * 0.018, 0.352)); } head.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mouthM)); }   // ω 입
  head.add(new THREE.LineSegments(whiskG, whiskM));               // 수염
  part(body, pink, 0, 0.22, -0.44, 0.045, 0.04, 0.045);           // 짧은 꼬리
  const shadow = new THREE.Mesh(blobG, blobM); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.012; g.add(shadow);
  return { g, body, head, shadow, eyes, ears, nose, blink: Math.random() * 4 };
}

/* ── 효과: 물보라 · 꽃가루 ── */
const fx = [];
const dropG = new THREE.SphereGeometry(0.07, 6, 5), dropM = new THREE.MeshBasicMaterial({ color: 0xcfeefe, transparent: true });
function splash(x, z) {
  for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(dropG, dropM.clone()); const a = (i / 14) * Math.PI * 2; m.position.set(x, WATER_Y + 0.05, z); scene.add(m); fx.push({ m, vx: Math.cos(a) * (1.2 + Math.random()), vy: 2.4 + Math.random() * 1.6, vz: Math.sin(a) * (1.2 + Math.random()), life: 0.9 }); }
  sSplash();
}
const confG = new THREE.PlaneGeometry(0.14, 0.09), CONF = [0xe4631f, 0xf2c744, 0x4f8df0, 0xff5a43, 0x5cc27a, 0xffffff];
function confetti(side) {
  const cx = side === 1 ? -FIELD.x / 2 : FIELD.x / 2;
  for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(confG, new THREE.MeshBasicMaterial({ color: CONF[i % CONF.length], side: THREE.DoubleSide, transparent: true })); m.position.set(cx + (Math.random() - 0.5) * DOOR_W, 5 + Math.random() * 2, (Math.random() - 0.5) * DOOR_D); m.rotation.set(Math.random() * 6, Math.random() * 6, 0); scene.add(m); fx.push({ m, vx: (Math.random() - 0.5) * 0.6, vy: -1.4 - Math.random(), vz: (Math.random() - 0.5) * 0.6, life: 2.6, spin: 4 + Math.random() * 6 }); }
}
function fxTick(dt) {
  for (let i = fx.length - 1; i >= 0; i--) {
    const p = fx[i]; p.life -= dt;
    if (p.spin) { p.m.rotation.x += p.spin * dt; p.m.rotation.y += p.spin * 0.7 * dt; p.m.position.x += (p.vx + Math.sin(p.life * 5) * 0.4) * dt; }
    else { p.vy -= 9 * dt; p.m.position.x += p.vx * dt; }
    p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; p.m.material.opacity = Math.min(1, p.life * 2);
    if (p.life <= 0) { scene.remove(p.m); fx.splice(i, 1); }
  }
}
/* 바닥에 드리우는 동그란 그림자(폰처럼 그림자 계산이 꺼진 기기에서도 서 있는 자리가 보이게) */
const blobG = new THREE.CircleGeometry(0.5, 20), blobM = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });
/* 수염 */
const whiskG = (() => { const p = []; for (const sx of [-1, 1]) for (const dy of [-0.02, 0.02, 0.06]) { p.push(new THREE.Vector3(sx * 0.12, -0.05, 0.25), new THREE.Vector3(sx * 0.36, -0.05 + dy * 1.6, 0.22)); } return new THREE.BufferGeometry().setFromPoints(p); })();
const whiskM = new THREE.LineBasicMaterial({ color: 0x5a4a40, transparent: true, opacity: 0.7 });

/* ── 한 판 ── */
const BOT_KINDS = ['snow', 'cocoa', 'cream', 'panda', 'gamja', 'cheese', 'snow', 'cream', 'cocoa', 'gamja', 'panda'];
let me = null, bots = [], round = null, phase = 'intro', meKind = 'cheese', mode = 'solo';
const remotes = new Map();   // 함께 하기: 다른 접속자 햄스터(키 → 햄스터)
const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.72, 32), new THREE.MeshBasicMaterial({ color: 0xff8a3d, side: THREE.DoubleSide }));
ring.rotation.x = -Math.PI / 2; scene.add(ring);
const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 4), new THREE.MeshBasicMaterial({ color: 0xff8a3d })); arrow.rotation.x = Math.PI; scene.add(arrow);

function spawn(nBots = BOTS) {
  for (const h of [me, ...bots]) if (h) scene.remove(h.m.g);
  const mz = mode === 'live' ? -3 + Math.random() * 6 : 2.2;
  me = { m: makeHamster(meKind, 1.05), x: 0, z: mz, tx: 0, tz: mz, y: 0, vy: 0, side: 0, alive: true, isMe: true, hop: 0 };
  bots = BOT_KINDS.slice(0, nBots).map((k, i) => ({ m: makeHamster(k, 0.9 + (i % 3) * 0.06), x: (i % 6 - 2.5) * 0.9, z: -2 + Math.floor(i / 6) * 1.6 + (i % 2) * 0.3, tx: 0, tz: 0, y: 0, vy: 0, side: 0, alive: true, acc: 0.55 + Math.random() * 0.32, decideAt: 0, swapAt: 0, hop: Math.random() * 6, spot: -1 }));
  for (const b of bots) { b.tx = b.x; b.tz = b.z; }
  for (const h of [me, ...bots]) { h.m.g.position.set(h.x, 0, h.z); scene.add(h.m.g); }
}
const sideOf = (x) => (x < -0.4 ? 1 : x > 0.4 ? 2 : 0);   // 1 = O, 2 = X, 0 = 가운데(정하지 않음)
const randIn = (side) => ({ x: (side === 1 ? -1 : 1) * (1.1 + Math.random() * (FIELD.x - 1.8)), z: -FIELD.z + 0.8 + Math.random() * (FIELD.z * 2 - 1.6) });
function goSide(h, side) {
  if (h.side === side) return;
  h.side = side; const p = randIn(side);
  if (h.isMe && mode !== 'live') { p.x = side === 1 ? -FIELD.x / 2 : FIELD.x / 2; p.z = 1.6; }   // 혼자일 때는 늘 같은 자리(찾기 쉽게) · 함께일 때는 겹치지 않게 아무 데나
  h.tx = p.x; h.tz = p.z;
}

/* 한 판에 여러 갈래가 섞이게: 갈래마다 돌아가며 하나씩 뽑는다(낱말 뜻만 계속 나오지 않게). rand 를 주면 그 순서로(함께 하기는 모두 같은 씨앗) */
function buildPool(rand) {
  const sh = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const by = {}; for (const q of OX) (by[q.k] = by[q.k] || []).push(q);
  const kinds = sh(Object.keys(by).sort()), pool = [];
  for (const k of kinds) sh(by[k]);
  for (let i = 0; pool.length < N_Q && i < 300; i++) { const q = by[kinds[i % kinds.length]].pop(); if (q) pool.push(q); }
  return sh(pool);
}
const seeded = (n) => { let x = (n * 2654435761) % 4294967296; return () => { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296; }; };
function startRound() {
  audio();
  mode = 'solo';
  round = { qs: buildPool(Math.random), i: -1, score: 0, outAt: 0, t0: 0 };
  spawn();
  $('panel').hidden = true; $('end').hidden = true; $('qWrap').hidden = false; $('pick').hidden = false;
  dl('ox_start', { cp_who: meKind });
  nextQ();
}
function nextQ() {
  round.i++;
  if (round.i >= round.qs.length) return finish();
  const q = round.qs[round.i];
  phase = 'ask'; round.t0 = performance.now(); round.lastTick = 0; round.fallen = false; setOpen(sideO, 0); setOpen(sideX, 0); for (const m of [...sideO.mats, ...sideX.mats]) m.emissiveIntensity = 0;
  $('qNo').textContent = `${round.i + 1} / ${round.qs.length}`;
  $('qKind').textContent = KIND[q.k] || '';
  $('qText').innerHTML = q.q.split('\n').map((l) => esc(l).replace(/「([^」]+)」/g, '「<em>$1</em>」')).join('<br>');
  $('qEn').textContent = '맞으면 O 쪽, 틀리면 X 쪽에 서요 · Stand on O if true, X if false';
  canMove = true;
  for (const h of [me, ...bots]) { h.side = 0; }
  /* 모두 가운데 줄 근처로 모였다가 다시 고른다 */
  me.tx = me.x; me.tz = me.z;   // 내 햄스터는 서 있던 자리 그대로(직접 걸어 다닌다)
  bots.filter((b) => b.alive).forEach((b, k) => { b.tx = (Math.random() - 0.5) * 1.2; b.tz = -FIELD.z + 1 + (k / Math.max(1, bots.length)) * (FIELD.z * 2 - 2); b.decideAt = 0.8 + Math.random() * 6.5; b.swapAt = Math.random() < 0.25 ? b.decideAt + 1 + Math.random() * 2 : 0; b.choice = Math.random() < b.acc ? (q.a ? 1 : 2) : (q.a ? 2 : 1); });
  me.side = me.benched ? 0 : sideOf(me.x); paintPick(); paintStat();
}
/* 갈래 이름(문제 위 작은 글자) */
const KIND = { meaning: '낱말 뜻 · Word meaning', pos: '품사 · Part of speech', grammar: '문법 · Grammar', expr: '속담 · 관용 표현 · Expressions', hanja: '사자성어 한자 · Hanja', number: '숫자 읽기 · Reading numbers', honor: '높임말 · Honorifics' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function paintPick() { const w = $('where'); if (!w) return; if (me && me.benched) { w.textContent = '벤치에서 다음 판을 기다려요'; w.dataset.side = '0'; return; } w.textContent = me.side === 1 ? 'O 쪽에 있어요' : me.side === 2 ? 'X 쪽에 있어요' : '가운데 — O나 X 쪽으로'; w.dataset.side = String(me.side); }
function paintStat() {
  const everyone = [me, ...bots, ...remotes.values()], alive = everyone.filter((h) => h.alive).length;
  $('sAlive').textContent = `${alive} / ${everyone.length}`;
  $('sLive').textContent = mode === 'live' ? `함께 ${remotes.size + 1}명 · 남은 햄스터` : '남은 햄스터'; $('sScore').textContent = String(round ? round.score : 0);
}
/* 내 햄스터는 조이스틱(폰 · 마우스로 끌기)이나 방향키 · WASD 로 직접 걸어 O 나 X 쪽에 선다(운영자 2026-11-09 「눌러서 넘어가지 말고 조이스틱으로 왔다갔다」).
   정답을 보여 줄 때 서 있는 쪽이 내 답 — 가운데 줄 위에 있으면 고르지 않은 것으로 본다. */
let canMove = false;
const joy = { x: 0, y: 0, id: null }, keys = {};
{
  const base = $('joy'), knob = $('joyKnob'), R = 46;
  const set = (e) => { const r = base.getBoundingClientRect(); let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; } knob.style.transform = `translate(${dx}px, ${dy}px)`; joy.x = dx / R; joy.y = dy / R; };
  base.addEventListener('pointerdown', (e) => { e.preventDefault(); audio(); joy.id = e.pointerId; base.setPointerCapture(e.pointerId); set(e); });
  base.addEventListener('pointermove', (e) => { if (e.pointerId === joy.id) set(e); });
  const end = (e) => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; knob.style.transform = ''; };
  base.addEventListener('pointerup', end); base.addEventListener('pointercancel', end);
}
const KEYMAP = { arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r', arrowup: 'u', w: 'u', arrowdown: 'd', s: 'd' };
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (KEYMAP[k]) { keys[KEYMAP[k]] = true; e.preventDefault(); }
  if ((k === 'enter' || k === ' ') && !$('panel').hidden) $('bGo').click();
});
addEventListener('keyup', (e) => { const k = KEYMAP[e.key.toLowerCase()]; if (k) keys[k] = false; });
function moveMe(dt) {
  if (!me || me.falling || me.benched) { if (me) me.moving = false; return; }   // 벤치에 앉으면 다음 판까지 그대로
  let vx = joy.x, vz = joy.y;
  if (Math.hypot(vx, vz) < 0.15) { vx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0); vz = (keys.d ? 1 : 0) - (keys.u ? 1 : 0); const m = Math.hypot(vx, vz); if (m > 1) { vx /= m; vz /= m; } }
  me.moving = canMove && Math.hypot(vx, vz) > 0.05;
  if (me.moving) {
    const sp = 5.5 * dt;
    me.x = Math.max(-FIELD.x + 0.35, Math.min(FIELD.x - 0.35, me.x + vx * sp)); me.z = Math.max(-FIELD.z + 0.35, Math.min(FIELD.z - 0.35, me.z + vz * sp));
    me.m.g.rotation.y = Math.atan2(vx, vz);
  }
  me.tx = me.x; me.tz = me.z;
  const sd = sideOf(me.x); if (sd !== me.side) { me.side = sd; paintPick(); if (sd) tone(sd === 1 ? 520 : 400, 0.06, 'triangle', 0.05); }
}

let msgT = 0;
function say(text, cls, ms = 1800) { const m = $('msg'); m.className = `on ${cls}`; m.textContent = text; clearTimeout(msgT); msgT = setTimeout(() => { m.className = ''; }, ms); }

function reveal() {
  phase = 'reveal'; round.t0 = performance.now();
  const q = round.qs[round.i], good = q.a ? 1 : 2;
  canMove = false;
  $('qEn').textContent = `정답 ${q.a ? 'O' : 'X'} · ${q.e}`;
  const meRight = !me.benched && me.side === good;
  if (me.benched) { /* 벤치에서 보는 중 — 점수 없음 */ }
  else if (meRight) { round.score++; sOk(); say('정답! 살았어요', 'ok'); }
  else { sNg(); say('앗, 떨어져요!', 'ng'); }
  /* 틀린 쪽 바닥이 꺼진다 */
  round.drop = good === 1 ? sideX : sideO; round.good = good === 1 ? sideO : sideX; round.goodSide = good;
  setTimeout(() => { sClunk(); sFall(); shakeT = 0.45; }, 120); setTimeout(() => { confetti(good); sCheer(); }, 350);
  boardAnswer(q.a);
  for (const h of [me, ...bots, ...remotes.values()]) {
    if (!h.alive || h.side === good) continue;
    h.falling = true; h.vy = 0.5;
    if (h.isMe) { h.alive = false; round.outAt = round.outAt || round.i + 1; }
  }
  paintStat();
}
function afterFall() {
  for (const b of bots) if (b.falling) { b.falling = false; b.alive = false; b.spot = bots.filter((x) => !x.alive && x.spot >= 0).length; const s = standSpot(b.spot); b.x = b.tx = s.x; b.z = b.tz = s.z; b.y = s.y; b.vy = 0; b.m.g.rotation.set(0, 0, 0); }
  for (const r of remotes.values()) if (r.falling) { r.falling = false; r.y = 0; r.vy = 0; r.x = r.tx; r.z = r.tz; r.m.g.rotation.set(0, 0, 0); r.alive = false; }
  if (me.falling) {
    const used = new Set(bots.filter((b) => !b.alive).map((b) => b.spot)); let k = Math.floor(Math.random() * 16); for (let i = 0; i < 16 && used.has(k); i++) k = (k + 1) % 16;
    const s = standSpot(k); me.falling = false; me.benched = true; me.x = me.tx = s.x; me.z = me.tz = s.z; me.y = s.y; me.vy = 0; me.m.g.rotation.set(0, 0, 0); me.m.g.rotation.y = Math.PI;   // 운동장 쪽을 본다
    say('벤치에서 다음 판을 기다려요 · Wait on the bench', 'info', 2600); paintPick();
  }
  sendMe(true);
  paintStat();
}
function ghost(h, on) { h.m.g.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = on; o.material.opacity = on ? 0.45 : 1; } }); }

function finish() {
  phase = 'end'; $('qWrap').hidden = true; $('pick').hidden = true;
  const n = round.qs.length, alive = bots.filter((b) => b.alive).length;
  $('eT').textContent = me.alive ? '끝까지 살아남았어요!' : '끝!';
  $('eRes').innerHTML = `맞힌 문제 <b>${round.score}</b> / ${n}<br>${me.alive ? `같이 살아남은 햄스터 ${alive}마리` : `${round.outAt}번 문제에서 떨어져 벤치에서 응원했어요`}`;
  $('end').hidden = false; boardText(`end${round.score}`, `맞힌 문제 ${round.score} / ${n}`, me.alive ? '끝까지 살아남았어요!' : '수고했어요!');
  dl('ox_end', { cp_score: round.score, cp_alive: me.alive ? 1 : 0 });
}
$('bGo').addEventListener('click', startRound);
$('bMute').addEventListener('click', (e) => { soundOn = !soundOn; e.currentTarget.setAttribute('aria-pressed', String(!soundOn)); e.currentTarget.textContent = soundOn ? '소리 켬' : '소리 끔'; });
$('bAgain').addEventListener('click', startRound);
document.querySelectorAll('#who button').forEach((b) => b.addEventListener('click', () => {
  meKind = b.dataset.who; document.querySelectorAll('#who button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  if (phase === 'intro') { spawn(); }
}));

/* ── 함께 하기(2단계) — 서버 없이 모두가 같은 시계로 같은 문제를 본다 ──
   16초 한 칸(12초 고르기 + 4초 정답), 16칸이 한 판(15문제 + 쉬는 칸). 판 번호가 씨앗이라 누구나 같은 순서.
   다른 접속자는 Supabase 실시간(presence)으로 — 로그인 없이 누구나, 이름 없이. 새 표 · SQL 은 필요 없다. */
const SLOT = 16000, RLEN = 16;   // 함께 하기: 12초 묻기 + 4초 정답 = 16초 한 칸
const SB_URL = 'https://tjgoevtvobvmlyefgxel.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ29ldnR2b2J2bWx5ZWZneGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDc0MDUsImV4cCI6MjA5NjMyMzQwNX0.G0x83cTqrVrCRaadtQs_4Ywg84QLxB1z6xFzlfM5Nfc';
let chan = null, myKey = '', lastSent = '', lastSendAt = 0;
// (함께 하기는 2026-11-09 부터 로그인 없이 — 로그인 확인은 leave-nudge.js 가 한다)
const botsFor = () => Math.max(0, 6 - remotes.size);   // 사람이 적으면 컴퓨터 햄스터로 채운다(내 화면에만)
function newLiveRound(r) {
  round = { r, qs: buildPool(seeded(r)), i: -1, score: 0, outAt: 0, t0: 0, live: true };
  spawn(botsFor()); phase = 'wait'; paintStat(); sendMe(true);
}
function liveTick() {
  const ms = Date.now(), s = Math.floor(ms / SLOT), r = Math.floor(s / RLEN), i = s % RLEN, el = (ms % SLOT) / 1000;
  if (!round || round.r !== r) newLiveRound(r);
  if (i === RLEN - 1) {   // 쉬는 칸: 이번 판 점수 · 다음 판까지
    if (phase !== 'break') {
      phase = 'break'; $('qKind').textContent = '쉬는 시간 · Break'; $('qNo').textContent = ''; boardText(`b${round.r}`, `맞힌 문제 ${round.score} / ${round.qs.length}`, '곧 다음 판이 시작돼요');
      $('qText').innerHTML = `이번 판 맞힌 문제 <em>${round.score}</em> / ${round.qs.length}`;
      canMove = false; dl('ox_live_end', { cp_score: round.score });
    }
    $('qEn').textContent = `다음 판까지 ${Math.ceil(SLOT / 1000 - el)}초 · Next round soon`; $('qSec').textContent = '';
    return;
  }
  if (round.i !== i) {
    if (el < ASK - 1.5) { round.i = i - 1; nextQ(); round.t0 = performance.now() - el * 1000; }
    else if (round.waitI !== i) {   // 문제 중간에 들어왔다 — 다음 문제부터
      round.waitI = i; phase = 'wait'; $('qKind').textContent = ''; $('qNo').textContent = `${i + 1} / ${N_Q}`;
      $('qText').textContent = '다음 문제부터 같이 풀어요'; $('qEn').textContent = 'Joining from the next question'; canMove = false;
    }
  }
}
const cur = () => ({ k: meKind, s: me ? me.side : 0, x: me ? +me.tx.toFixed(2) : 0, z: me ? +me.tz.toFixed(2) : 0, al: me && me.alive ? 1 : 0 });
function sendMe(force) {
  if (!chan) return;
  const now = performance.now(); if (!force && now - lastSendAt < 300) return;
  const c = cur(), j = JSON.stringify(c); if (j === lastSent) return;
  lastSent = j; lastSendAt = now; try { chan.track(c); } catch (e) { /* 다음에 다시 */ }
}
function onSync() {
  const st = chan.presenceState();
  for (const key of [...remotes.keys()]) if (!st[key]) { scene.remove(remotes.get(key).m.g); remotes.delete(key); }
  for (const key of Object.keys(st)) {
    if (key === myKey) continue;
    const m = st[key][st[key].length - 1]; if (!m) continue;
    let r = remotes.get(key);
    if (!r) { r = { m: makeHamster(LOOK[m.k] ? m.k : 'cheese', 1), x: m.x, z: m.z, tx: m.x, tz: m.z, y: 0, vy: 0, side: m.s, alive: !!m.al, hop: 0, remote: true }; r.m.g.position.set(r.x, 0, r.z); scene.add(r.m.g); remotes.set(key, r); }
    r.tx = m.x; r.tz = m.z; r.side = m.s;
    if (!r.falling && !!m.al !== r.alive) { r.alive = !!m.al; }
    r.y = !r.alive && onBench(m.x, m.z) ? 0.42 : 0;   // 떨어진 사람은 자기 화면에서 벤치로 간다 — 그 자리를 그대로 그린다
  }
  paintStat();
}
async function startLive() {
  audio();
  /* 로그인 없이도 함께(운영자 2026-11-09). 이름 없이 햄스터로만 보이고 저장하는 것은 없다. 나갈 때 한 번 로그인 안내(leave-nudge.js). */
  mode = 'live'; round = null;
  $('panel').hidden = true; $('end').hidden = true; $('qWrap').hidden = false; $('pick').hidden = false;
  dl('ox_live_join', { cp_who: meKind });
  liveTick();
  try {
    const { createClient } = await import('./vendor/supabase-js.js?v=3a9aa85c');
    // 이 화면은 보기만 한다 — 로그인 세션은 건드리지 않는다(갱신 토큰 충돌 방지).
    const sb = createClient(SB_URL, SB_ANON, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    myKey = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)).slice(0, 12);
    chan = sb.channel('ox-live-1', { config: { presence: { key: myKey } } });
    chan.on('presence', { event: 'sync' }, onSync).subscribe((status) => { if (status === 'SUBSCRIBED') sendMe(true); });
  } catch (e) { chan = null; }   // 연결이 안 돼도 같은 시계로 혼자(컴퓨터 햄스터와) 계속된다
}
$('bLive').addEventListener('click', startLive);

/* ── 그리기 ── */
function resize() {
  if (!renderer) return;
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
  const narrow = w / h < 0.8; camera.fov = narrow ? 62 : 48;
  camera.position.set(0, narrow ? 22 : 9.2, narrow ? 15 : 10.2); camera.lookAt(0, 0, narrow ? 0.6 : -0.8);   // 폰(세로)은 운동장 양 끝이 다 보이게 더 멀리서
  camera.updateProjectionMatrix(); camPos.copy(camera.position);
}
let shakeT = 0; const camPos = new THREE.Vector3();
addEventListener('resize', resize); resize();

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
  if (mode === 'live') liveTick();
  if (round && phase === 'ask') {
    const el = (now - round.t0) / 1000, left = Math.max(0, ASK - el);
    $('qSec').textContent = `${Math.ceil(left)}초`; $('qBar').style.transform = `scaleX(${left / ASK})`;
    if (left <= 3 && Math.ceil(left) !== round.lastTick && left > 0) { round.lastTick = Math.ceil(left); sTick(); }
    boardCount(Math.max(1, Math.ceil(left)), round.i + 1, round.qs.length);
    if (left <= 3 && left > 0 && now > (round.rollAt || 0)) { round.rollAt = now + 70; sRoll(); }
    for (const b of bots) { if (!b.alive) continue; if (!b.side && el > b.decideAt) goSide(b, b.choice); if (b.swapAt && el > b.swapAt) { b.swapAt = 0; goSide(b, b.side === 1 ? 2 : 1); b.choice = b.side; } }
    if (left <= 0) reveal();
  } else if (round && phase === 'reveal') {
    const el = (now - round.t0) / 1000;
    const k = Math.min(1, Math.max(0, (el - 0.12) / 0.35));
    if (el < 2.3) setOpen(round.drop, 1 - (1 - k) * (1 - k)); else setOpen(round.drop, Math.max(0, round.drop.open - dt * 2.2));   // 탁 열렸다가 천천히 닫힘
    for (const m of round.good.mats) m.emissiveIntensity = Math.max(0, Math.sin(el * 9)) * 0.28 * Math.max(0, 1 - el / 2.5);   // 정답 쪽 바닥 반짝
    if (el > 1.9 && !round.fallen) { round.fallen = true; afterFall(); }
    if (mode === 'solo' && el > REVEAL) nextQ();
  }
  /* 햄스터 움직임: 목표로 종종걸음(통통 튀며) · 떨어지면 빙글 */
  moveMe(dt);
  const all = me ? [me, ...bots, ...remotes.values()] : [];
  for (const h of all) {
    const g = h.m.g;
    if (h.falling) {
      if (!h.wet) { h.vy -= 18 * dt; h.y += h.vy * dt; g.rotation.x += dt * 5; g.rotation.z += dt * 3; if (h.y < WATER_Y + 0.1) { h.wet = true; h.y = WATER_Y - 0.15; splash(h.x, h.z); } }
      else { g.rotation.x *= 0.9; g.rotation.z *= 0.9; h.y = WATER_Y - 0.2 + Math.sin(t * 6 + h.hop) * 0.05; }   // 물에 둥둥
      g.position.set(h.x, h.y, h.z); h.m.shadow.visible = false; continue;
    }
    h.wet = false; h.m.shadow.visible = true;
    const dx = h.tx - h.x, dz = h.tz - h.z, dist = h.isMe ? (h.moving ? 1 : 0) : Math.hypot(dx, dz), sp = 4.6 * dt;
    if (h.isMe && h.moving) { h.hop += dt * 14; }
    else if (dist > 0.03) { const s = Math.min(1, sp / dist); h.x += dx * s; h.z += dz * s; h.hop += dt * 14; g.rotation.y = Math.atan2(dx, dz); }
    else { h.hop += dt * 2; g.rotation.y += (0 - g.rotation.y) * Math.min(1, dt * 4); }   // 멈추면 앞(화면 쪽)을 본다
    let bounce = dist > 0.03 ? Math.abs(Math.sin(h.hop)) * 0.18 : Math.abs(Math.sin(h.hop)) * 0.02;
    if (round && phase === 'reveal' && h.alive && h.side === round.goodSide) { const e = (now - round.t0) / 1000; if (e > 0.4 && e < 2.2) bounce = Math.abs(Math.sin(e * 9 + h.hop)) * 0.55; }   // 살았다! 깡충
    if (round && phase === 'ask' && h.alive && !h.side) { const e = (now - round.t0) / 1000; if (e > ASK - 3) h.m.head.rotation.y = Math.sin(t * 22) * 0.25; }   // 시간 다 됐는데 가운데 — 두리번
    h.m.shadow.position.y = 0.012 - bounce; h.m.shadow.scale.setScalar(1 - bounce * 0.8);
    g.position.set(h.x, (h.y || 0) + bounce, h.z);
    h.m.body.scale.set(1 + bounce * 0.3, 1 - bounce * 0.5, 1 + bounce * 0.3);   // 착지할 때 찌그러짐
    h.m.head.rotation.x = Math.sin(t * 2 + h.hop) * 0.05; h.m.head.rotation.z = Math.sin(t * 0.9 + h.hop) * 0.06;   // 갸웃
    h.m.blink -= dt; const shut = h.m.blink < 0.12 && h.m.blink > 0; if (h.m.blink <= 0) h.m.blink = 2 + Math.random() * 3.5;
    for (const e of h.m.eyes) e.scale.y = shut ? 0.12 : 1;                                          // 깜빡
    h.m.nose.scale.y = 0.026 * (1 + Math.max(0, Math.sin(t * 14 + h.hop)) * 0.35);                  // 코 씰룩
    h.m.ears.forEach((e, i) => { e.rotation.x = Math.max(0, Math.sin(t * 1.3 + h.hop + i)) > 0.97 ? -0.4 : 0; });   // 귀 쫑긋
  }
  if (me) { sendMe(false); ring.position.set(me.x, 0.02 + (me.falling ? me.y : 0), me.z); ring.visible = !me.falling; arrow.position.set(me.x, 1.6 + Math.sin(t * 4) * 0.08 + (me.falling ? me.y : 0), me.z); }
  fxTick(dt);
  if (shakeT > 0) { shakeT -= dt; camera.position.x = camPos.x + (Math.random() - 0.5) * 0.25 * shakeT; camera.position.y = camPos.y + (Math.random() - 0.5) * 0.25 * shakeT; } else { camera.position.copy(camPos); }
  musicTick();
  if (renderer) renderer.render(scene, camera);
}
spawn();
requestAnimationFrame(frame);
