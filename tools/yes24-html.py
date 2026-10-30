#!/usr/bin/env python3
"""예스24 판매자 화면 「도서등록(개별)」 칸 순서대로 책마다 붙여 넣을 글을 칸마다 「복사」 단추가 있는 HTML 한 장으로(운영자 2026-10-30 「이 양식에 맞춰」).
   python3 tools/yes24-html.py <나가는 파일.html> [발매일 YYYYMMDD]
   칸: 도서명 · 부제 · 저자 · 발매일 · ISBN · 정가/판매가 · 상품소개 · 저자소개 · 목차 · 출판사서평 + 올릴 파일 이름. 글의 출처는 listing-html.py 와 같다(docs/ops/isbn-forms.md · docs/shop.json).
   정가는 원 단위가 아닌 10원 단위, 할인은 최대 10%(양식 안내). 생성물은 저장소에 올리지 않는다. """
import re, sys, json, html
out = sys.argv[1]; day = sys.argv[2] if len(sys.argv) > 2 else '20261110'
e = html.escape
forms = open('docs/ops/isbn-forms.md', encoding='utf8').read()
shop = {b['id']: b for b in json.load(open('docs/shop.json', encoding='utf8'))['books']}
IDS = [('01','first-steps-workbook'),('02','particles-workbook'),('03','topik2-writing-51-52'),('04','topik2-vocab-1000'),('05','topik2-vocab-2000'),('06','topik2-vocab-lv3'),('07','topik1-reading-mock'),('08','topik2-writing-53-54'),('09','topik1-vocab'),('10','korean-idioms')]
PRICE = {'topik2-writing-51-52': 9900, 'topik2-vocab-1000': 9900, 'topik2-vocab-2000': 9900, 'topik2-vocab-lv3': 9900}   # 나머지는 13,900(운영자 2026-10-30)
NO_QR = {'topik1-reading-mock'}
secs = {s[:2]: s for s in re.split(r'\n## (?=\d\d\. )', forms)[1:]}
def box(sec, name):
    m = re.search(r'\*\*' + re.escape(name) + r'\*\*\n```\n(.*?)\n```', sec, re.S); return m.group(1) if m else ''
cell = lambda sec, k: re.search(r'\|\s*' + k + r'\s*\|\s*(.*?)\s*\|', sec).group(1)
TOPIK_NOTE = 'TOPIK 은 국립국제교육원의 시험 이름입니다. 이 책은 독자적으로 만든 학습서이며 국립국제교육원 · 한국어능력시험센터가 운영 · 제휴 · 인증하지 않았습니다. 문항은 모두 새로 만든 것으로 기출이 아닙니다.'
PLAIN_NOTE = '이 책은 독자적으로 만든 학습서입니다. 문장은 모두 새로 만든 것입니다.'
def field(label, text, hint='', big=False):
    return f'<div class="f"><div class="fh"><b>{e(label)}</b>{f"<small>{e(hint)}</small>" if hint else ""}<button type="button">복사</button></div><pre class="v{" big" if big else ""}">{e(text)}</pre></div>'
body, nav = [], []
for no, bid in IDS:
    sec, b = secs[no], shop[bid]
    fr = json.load(open(f'docs/books/{bid}.json', encoding='utf8')); isbn = fr['isbn'].replace('-', '')
    title = cell(sec, '책제목'); sub = cell(sec, '부제목'); author = cell(sec, '저자명'); price = PRICE.get(bid, 13900)
    feats = ['책 끝에 정답 쪽이 있어 혼자 공부할 수 있습니다.']
    if bid not in NO_QR: feats.append('단원마다 QR 코드로 everykoreans.com 의 무료 연습 쪽으로 이어집니다.')
    feats.append('영어와 한국어 두 언어로 설명해 영어권 학습자도, 한국어 교사도 쓸 수 있습니다.')
    intro = box(sec, '책소개') + '\n\n이 책의 특징\n' + '\n'.join('- ' + f for f in feats)
    review = box(sec, '서평') + '\n\n' + (TOPIK_NOTE if 'TOPIK' in title else PLAIN_NOTE)
    nav.append(f'<a href="#b{no}">{no} {e(title)}</a>')
    body.append(f'<section id="b{no}"><h2>{no}. {e(title)}</h2>'
        + field('*도서명', title) + field('부제', sub) + field('*저자', author)
        + field('*발매일', day, '직접 입력 · 책 판권쪽 발행일은 2026.11.10(ISBN 신청 날짜)') + field('*ISBN', isbn, '숫자 13자리')
        + field('*정가', str(price), '*판매가도 같은 숫자 · 10원 단위') + field('*판매가', str(price))
        + field('*상품소개', intro, '', True) + field('저자소개', box(sec, '저자소개'), '', True) + field('목차', box(sec, '목차'), '', True)
        + field('출판사서평', review, '', True)
        + f'<div class="f"><div class="fh"><b>올릴 파일</b></div><pre class="v">*표지이미지: {isbn}_cover.jpg (가로 1500px)\n*전자책파일: {isbn}.pdf (예스24판, 보호 없음)</pre></div></section>')
page = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>예스24 도서등록 복사판</title>
<style>
:root{{--bg:#fafaf7;--fg:#222;--card:#fff;--line:#d9d6cc;--acc:#12704F}}
@media(prefers-color-scheme:dark){{:root{{--bg:#1b1d1c;--fg:#e8e8e3;--card:#252827;--line:#3c403e;--acc:#6fcf9f}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Malgun Gothic","Apple SD Gothic Neo",sans-serif}}
header{{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 16px;z-index:5}}
header b{{color:var(--acc)}} nav{{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:6px;font-size:13px}} nav a{{color:var(--acc);text-decoration:none}}
main{{max-width:860px;margin:0 auto;padding:8px 16px 80px}} section{{margin:26px 0}} h2{{font-size:20px;border-bottom:2px solid var(--acc);padding-bottom:4px}}
.f{{background:var(--card);border:1px solid var(--line);border-radius:8px;margin:8px 0}} .fh{{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid var(--line)}} .fh small{{color:#888;flex:1}}
button{{background:var(--acc);color:#fff;border:0;border-radius:6px;padding:5px 14px;font-size:13px;cursor:pointer}} button.ok{{background:#888}}
pre.v{{margin:0;padding:8px 10px;white-space:pre-wrap;word-break:break-word;font:inherit}} pre.big{{max-height:300px;overflow:auto}}
.top{{background:#fff7e0;border:1px solid #e6d9a8;border-radius:8px;padding:10px 12px;margin:12px 0;font-size:14px}}
</style></head><body>
<header><b>예스24 도서등록 복사판</b> · 양식 칸 순서대로 「복사」→ 붙여 넣기. 별(*)이 있는 칸은 꼭 채웁니다.<nav>{''.join(nav)}</nav></header>
<main><div class="top"><b>직접 고르는 칸(복사판에 없음)</b>: *카테고리(국어 · 외국어 쪽에서 고르기) · *판매개시(검수 후 즉시 / 직접지정) · *B2B 판매여부(Y 면 도서관 등 단체 판매, 정산은 정가의 50% — 계약서) · 연령제한 전체 · 언어 한국어 · 읽기 방향 좌→우 · 합본/체험판 일반 · *대여여부 대여불가 · 화폐단위 원. 종이책 정보 · ISSN · UCI · ECN 은 비워 둡니다.</div>{''.join(body)}</main>
<script>
document.addEventListener('click',function(ev){{var b=ev.target.closest('button');if(!b)return;var t=b.closest('.f').querySelector('pre').textContent;
function done(){{b.textContent='복사됨 ✓';b.className='ok';setTimeout(function(){{b.textContent='복사';b.className='';}},1500);}}
function fb(){{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{{document.execCommand('copy');done();}}catch(x){{}}document.body.removeChild(a);}}
if(navigator.clipboard&&window.isSecureContext){{navigator.clipboard.writeText(t).then(done,fb);}}else fb();}});
</script></body></html>'''
open(out, 'w', encoding='utf8').write(page)
print(out, len(IDS), '권')
