"""복사판 정리용 — 이미 끝낸 책은 접어서 맨 아래로, 해야 할 책을 먼저 보여 준다(운영자 2026-11-02 「복사판 난잡 · 깔끔하게」).
끝난 책 번호는 docs/ops/copy-status.json 의 {"isbn":{"done":["01",…]},"yes24":{"done":[…]}} 에서 읽는다. 파일이 없으면 모두 해야 할 책으로 본다. """
import json, re

def split(nav, body, key):
    try:
        done = set(json.load(open('docs/ops/copy-status.json', encoding='utf8')).get(key, {}).get('done', []))
    except Exception:
        done = set()
    no_nav = lambda s: (re.search(r'#b(\d\d)', s) or [None, None])[1]
    no_body = lambda s: (re.search(r'^<section id="b(\d\d)"', s) or [None, None])[1]
    pn = [n for n in nav if no_nav(n) not in done]; dn = [n for n in nav if no_nav(n) in done]
    pb = [b for b in body if no_body(b) not in done]; db = [b for b in body if no_body(b) in done]
    nav_html = ''.join(pn)
    if dn:
        nav_html += f'<span style="color:#9a9087;flex-basis:100%;font-size:12px">이미 끝낸 책 {len(dn)}권은 맨 아래에 접어 두었습니다.</span>'
    body_html = ''.join(pb)
    if not pb:
        body_html += '<p style="padding:24px 0;font-weight:700">지금 해야 할 책이 없습니다.</p>'
    if db:
        body_html += f'<details style="margin-top:28px"><summary style="cursor:pointer;font-weight:700;padding:10px 0">끝난 책 {len(db)}권 다시 보기</summary>' + ''.join(db) + '</details>'
    return nav_html, body_html
