#!/usr/bin/env python3
"""판매처(쿠팡 · 예스24 · 네이버 …) 상품 등록에 붙여 넣을 글을 칸마다 「복사」 단추가 있는 HTML 한 장으로 만든다.
   python3 tools/listing-html.py <나가는 파일.html> [판매처 이름]
   글의 출처: docs/ops/isbn-forms.md(책소개 · 서평 · 저자소개 · 키워드) + docs/shop.json(제목 · 쪽수 · 대상) + 필수 문구(docs/ops/book-listings.md).
   가격 · ISBN 은 비워 둔다(운영자가 정한 뒤 입력). 생성물은 저장소에 올리지 않는다. """
import re, sys, json, html
out = sys.argv[1]; shop_name = sys.argv[2] if len(sys.argv) > 2 else '쿠팡'
e = html.escape
forms = open('docs/ops/isbn-forms.md', encoding='utf8').read()
shop = {b['id']: b for b in json.load(open('docs/shop.json', encoding='utf8'))['books']}
IDS = [('01', 'first-steps-workbook'), ('02', 'particles-workbook'), ('03', 'topik2-writing-51-52'), ('04', 'topik2-vocab-1000'), ('05', 'topik2-vocab-2000'), ('06', 'topik2-vocab-lv3'), ('07', 'topik1-reading-mock'), ('08', 'topik2-writing-53-54')]
NO_QR = {'topik1-reading-mock'}   # 모의고사 책에는 단원 QR 이 없다
secs = {s[:2]: s for s in re.split(r'\n## (?=\d\d\. )', forms)[1:]}
box = lambda sec, name: re.search(r'\*\*' + re.escape(name) + r'\*\*\n```\n(.*?)\n```', sec, re.S).group(1)
cell = lambda sec, k: re.search(r'\|\s*' + k + r'\s*\|\s*(.*?)\s*\|', sec).group(1)
TOPIK_NOTE = 'TOPIK 은 국립국제교육원의 시험 이름입니다. 이 책은 독자적으로 만든 학습서이며 국립국제교육원 · 한국어능력시험센터가 운영 · 제휴 · 인증하지 않았습니다. 문항은 모두 새로 만든 것으로 기출이 아닙니다.'
PLAIN_NOTE = '이 책은 독자적으로 만든 학습서입니다. 문장은 모두 새로 만든 것입니다.'

def field(label, text, big=False):
    return f'<div class="f"><div class="fh"><b>{e(label)}</b><button type="button">복사</button></div><pre class="v{" big" if big else ""}">{e(text)}</pre></div>'

body, nav = [], []
for no, bid in IDS:
    sec, b = secs[no], shop[bid]
    title = cell(sec, '책제목'); sub = cell(sec, '부제목')
    topik = 'TOPIK' in title
    feats = ['책 끝에 정답 쪽이 있어 혼자 공부할 수 있습니다.']
    if bid not in NO_QR: feats.append('단원마다 QR 코드로 everykoreans.com 의 무료 연습 쪽으로 이어집니다.')
    feats.append('영어와 한국어 두 언어로 설명해 영어권 학습자도, 한국어 교사도 쓸 수 있습니다.')
    long = box(sec, '서평') + '\n\n이 책의 특징\n' + '\n'.join('- ' + f for f in feats) + '\n\n지은이 소개\n' + box(sec, '저자소개') + '\n\n' + (TOPIK_NOTE if topik else PLAIN_NOTE)
    spec = f"B5 (182 × 257 mm) · {b['pages'].replace(' (PDF · 속지 기준)', '')} · 디지털판(PDF) · 한국어 · English"
    target = '\n'.join('- ' + x for x in b['for']['ko'])
    nav.append(f'<a href="#b{no}">{no} {e(title)}</a>')
    body.append(f'<section id="b{no}"><h2>{no}. {e(title)}</h2>'
        + field('상품명', f'{title} : {sub}')
        + field('한 줄 소개', b['sub']['ko'])
        + field('짧은 소개 (200자 안팎)', box(sec, '책소개'), True)
        + field('긴 소개 (상세 설명)', long, True)
        + field('이런 분께', target)
        + field('검색 키워드 · 태그', cell(sec, '키워드'))
        + field('판형 · 쪽수 · 형식', spec)
        + field('가격 · ISBN', '(운영자가 입력: 가격은 정한 뒤, ISBN 은 승인 번호를 받은 뒤)') + '</section>')

page = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(shop_name)} 상품 등록 복사판</title>
<style>
:root{{--bg:#fafaf7;--fg:#222;--card:#fff;--line:#d9d6cc;--acc:#12704F}}
@media(prefers-color-scheme:dark){{:root{{--bg:#1b1d1c;--fg:#e8e8e3;--card:#252827;--line:#3c403e;--acc:#6fcf9f}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Malgun Gothic","Apple SD Gothic Neo",sans-serif}}
header{{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 16px;z-index:5}}
header b{{color:var(--acc)}} nav{{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:6px;font-size:13px}} nav a{{color:var(--acc);text-decoration:none}}
main{{max-width:860px;margin:0 auto;padding:8px 16px 80px}} section{{margin:26px 0}} h2{{font-size:20px;border-bottom:2px solid var(--acc);padding-bottom:4px}}
.f{{background:var(--card);border:1px solid var(--line);border-radius:8px;margin:8px 0}} .fh{{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid var(--line)}}
button{{background:var(--acc);color:#fff;border:0;border-radius:6px;padding:5px 14px;font-size:13px;cursor:pointer}} button.ok{{background:#888}}
pre.v{{margin:0;padding:8px 10px;white-space:pre-wrap;word-break:break-word;font:inherit}} pre.big{{max-height:300px;overflow:auto}}
</style></head><body>
<header><b>{e(shop_name)} 상품 등록 복사판</b> · 칸마다 「복사」를 누르고 등록 화면에 붙여 넣으세요. 화면에 없는 칸은 건너뛰세요.<nav>{''.join(nav)}</nav></header>
<main>{''.join(body)}</main>
<script>
document.addEventListener('click',function(ev){{var b=ev.target.closest('button');if(!b)return;var t=b.closest('.f').querySelector('pre').textContent;
function done(){{b.textContent='복사됨 ✓';b.className='ok';setTimeout(function(){{b.textContent='복사';b.className='';}},1500);}}
function fb(){{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{{document.execCommand('copy');done();}}catch(x){{}}document.body.removeChild(a);}}
if(navigator.clipboard&&window.isSecureContext){{navigator.clipboard.writeText(t).then(done,fb);}}else fb();}});
</script></body></html>'''
open(out, 'w', encoding='utf8').write(page)
print(out, len(IDS), '권')
