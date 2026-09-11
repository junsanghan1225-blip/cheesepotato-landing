/* 서비스 워커 — 말풍선이 묻는 것에 답한다.
 *
 * ── 왜 찾기를 여기서 하나 ────────────────────────────────────
 * 사전 360KB + 문법 32KB 를 쪽마다 읽어 들이면, 한국어가 한 글자도 없는
 * 쪽을 열 때도 그 값을 문다. 탭이 스무 개면 스무 번이다.
 *
 * 그래서 content script 는 **끌어 놓은 글만 보내고** 찾기는 여기서 한다.
 * 서비스 워커는 브라우저에 하나뿐이고, 놀면 크롬이 재운다. 깨어날 때
 * 사전을 다시 읽지만 그건 십수 밀리초다 — 탭마다 무는 것과는 다르다.
 *
 * 팝업과 새 탭은 여기에 안 묻고 look.js 를 직접 부른다. 저희가 이미
 * 익스텐션 쪽(page)이라 모듈을 그냥 읽을 수 있고, 한 번 더 건너갈 까닭이
 * 없다. */
import { look, scan } from './look.js';
import { settings, due, add } from './store.js';

/* ── 말풍선이 묻는 것 ────────────────────────────────────────── */

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  (async () => {
    try {
      if (msg?.k === 'look') {
        const s = await settings();
        reply(await look(msg.text, {
          lang: s.gloss, context: msg.context, grammar: s.grammar,
        }));
        return;
      }
      if (msg?.k === 'scan') { reply(await scan(msg.text)); return; }
      /* 쪽 전체에 밑줄을 그을 때. 글월이 수백 개라 한 번에 받는다 —
         하나씩 물으면 오가는 시간이 찾는 시간보다 길어진다. */
      if (msg?.k === 'scan-many') {
        const texts = Array.isArray(msg.texts) ? msg.texts.slice(0, 600) : [];
        const out = [];
        for (const t of texts) out.push(await scan(t));
        reply(out);
        return;
      }
      if (msg?.k === 'save') { await add(msg.item); await badge(); reply({ ok: true }); return; }
      if (msg?.k === 'settings') { reply(await settings()); return; }
      reply(null);
    } catch (e) {
      /* 답을 아예 안 보내면 말풍선이 영영 「찾는 중」에 멈춘다.
         빈손이라도 보내야 화면이 「못 찾았다」로 넘어간다. */
      reply({ error: String(e && e.message || e) });
    }
  })();
  return true;  /* 비동기로 답하겠다는 표시. 빼면 reply 가 닫힌 뒤에 간다. */
});

/* ── 아이콘의 숫자 ───────────────────────────────────────────
   복습할 차례가 된 낱말 수. 0 이면 아무것도 안 붙인다 — 할 일이 없는데
   0 이 떠 있으면 그것도 할 일처럼 보인다. */
async function badge() {
  const n = (await due()).length;
  await chrome.action.setBadgeText({ text: n ? String(Math.min(n, 999)) : '' });
  await chrome.action.setBadgeBackgroundColor({ color: '#E1682B' });
}

chrome.runtime.onStartup.addListener(badge);
chrome.storage.onChanged.addListener((c, area) => { if (area === 'local' && c.wordbook) badge(); });

/* ── 오른쪽 단추 ─────────────────────────────────────────────
   끌어 놓기를 꺼 둔 사람이 그래도 한 번 찾아보고 싶을 때의 길이다.
   여기서 팝업을 대신 열지 않고 그 쪽의 말풍선을 띄운다 — 찾은 낱말이
   그 문장 옆에 떠야 문맥이 같이 보인다. */
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: 'cp-look',
    title: '치즈감자에서 «%s» 찾기',
    contexts: ['selection'],
  });
  await badge();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'cp-look' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { k: 'show-selection' }).catch(() => {});
  }
});

/* ── 단축키 ──────────────────────────────────────────────────
   Alt+G — 이 쪽의 아는 문법에 밑줄을 긋거나 지운다. */
chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== 'grammar-underline') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) chrome.tabs.sendMessage(tab.id, { k: 'toggle-underline' }).catch(() => {});
});

badge();
