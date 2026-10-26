#!/usr/bin/env python3
"""ISBN 신청서 글(docs/ops/isbn-forms.md)을 칸마다 「복사」 단추가 있는 HTML 한 장으로 만든다.
   python3 tools/isbn-html.py <나가는 파일.html> ["이름;이메일;전화"]
   신청자 줄(전화 · 이메일)은 저장소에 두지 않으려고 인자로만 받는다. 생성물은 운영자에게 보내는 용도 — 저장소에 올리지 않는다. """
import re, sys, html
src = open('docs/ops/isbn-forms.md', encoding='utf8').read()
out_path = sys.argv[1]
applicant = sys.argv[2] if len(sys.argv) > 2 else ''
e = html.escape

def rows(block):
    return [(a.strip(), b.strip()) for a, b in re.findall(r'^\|\s*([^|]+?)\s*\|\s*(.+?)\s*\|\s*$', block, re.M) if a not in ('칸',) and not set(a) <= set('-')]

def field(label, text, big=False):
    return (f'<div class="f"><div class="fh"><b>{e(label)}</b><button type="button">복사</button></div>'
            f'<pre class="v{" big" if big else ""}">{e(text)}</pre></div>')

common = src.split('## 올리는 값')[1].split('\n---')[0]
common_rows = rows(common)
secs = re.split(r'\n## (?=\d\d\. )', src)[1:]

body = []
nav = []
if applicant:
    body.append('<section><h2>신청자 (여섯 권 · 일곱 권 공통, 한 줄)</h2>' + field('이름;이메일;전화', applicant) + '</section>')
body.append('<section><h2>공통으로 고르는 값</h2><p class="n">모든 책이 같습니다. 화면에서 해당 칸에 고르거나 붙이세요.</p>' + ''.join(field(a, re.sub(r'\*\*', '', b)) for a, b in common_rows) + '</section>')

for sec in secs:
    no, title = re.match(r'(\d\d)\. (.+)', sec).groups()
    nav.append(f'<a href="#b{no}">{no} {e(title)}</a>')
    info = rows(sec.split('### 추가정보')[0])
    extra = sec.split('### 추가정보')[1] if '### 추가정보' in sec else ''
    h = [f'<section id="b{no}"><h2>{no}. {e(title)}</h2><h3>1단계 · 출판예정도서 정보</h3>']
    h += [field(a, b) for a, b in info]
    h.append('<h3>2단계 · 추가정보 (5칸)</h3>')
    for name in ('책소개', '목차', '저자소개', '요약/본문일부', '서평'):
        m = re.search(r'\*\*' + re.escape(name) + r'\*\*\n```\n(.*?)\n```', extra, re.S)
        if m: h.append(field(name, m.group(1), True))
    cov = re.search(r'첨부: `([^`]+)`', extra)
    h.append('<h3>3단계 · 표지 / 판권지</h3>')
    if cov: h.append(field('표지 파일 이름(첨부)', cov.group(1)))
    m = re.search(r'\*\*판권지\*\*[^\n]*\n```\n(.*?)\n```', extra, re.S)
    if m: h.append(field('판권지 (책 안 판권면에 찍힌 글)', m.group(1), True))
    h.append('</section>')
    body.append(''.join(h))

page = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ISBN 복사판</title>
<style>
:root{{--bg:#fafaf7;--fg:#222;--card:#fff;--line:#d9d6cc;--acc:#12704F}}
@media(prefers-color-scheme:dark){{:root{{--bg:#1b1d1c;--fg:#e8e8e3;--card:#252827;--line:#3c403e;--acc:#6fcf9f}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Malgun Gothic","Apple SD Gothic Neo",sans-serif}}
header{{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 16px;z-index:5}}
header b{{color:var(--acc)}} nav{{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:6px;font-size:13px}} nav a{{color:var(--acc);text-decoration:none}}
main{{max-width:860px;margin:0 auto;padding:8px 16px 80px}}
section{{margin:26px 0}} h2{{font-size:20px;border-bottom:2px solid var(--acc);padding-bottom:4px}} h3{{font-size:14px;color:var(--acc);margin:18px 0 6px}}
.n{{font-size:13px;opacity:.75}}
.f{{background:var(--card);border:1px solid var(--line);border-radius:8px;margin:8px 0}}
.fh{{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid var(--line)}}
button{{background:var(--acc);color:#fff;border:0;border-radius:6px;padding:5px 14px;font-size:13px;cursor:pointer}} button.ok{{background:#888}}
pre.v{{margin:0;padding:8px 10px;white-space:pre-wrap;word-break:break-word;font:inherit}} pre.big{{max-height:260px;overflow:auto}}
</style></head><body>
<header><b>ISBN 복사판</b> · 칸마다 「복사」를 누르고 신청 화면에 붙여 넣으세요.<nav>{''.join(nav)}</nav></header>
<main>{''.join(body)}</main>
<script>
document.addEventListener('click',function(ev){{var b=ev.target.closest('button');if(!b)return;
var t=b.closest('.f').querySelector('pre').textContent;
function done(){{b.textContent='복사됨 ✓';b.className='ok';setTimeout(function(){{b.textContent='복사';b.className='';}},1500);}}
if(navigator.clipboard&&window.isSecureContext){{navigator.clipboard.writeText(t).then(done,fallback);}}else fallback();
function fallback(){{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{{document.execCommand('copy');done();}}catch(x){{}}document.body.removeChild(a);}}
}});
</script></body></html>'''
open(out_path, 'w', encoding='utf8').write(page)
print(out_path, len(secs), '권')
