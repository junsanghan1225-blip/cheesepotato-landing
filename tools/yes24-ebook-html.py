#!/usr/bin/env python3
"""예스24 판매자 「상품등록(eBook)」 화면 칸 순서대로 조사 워크북 한 권의 값을 「복사」 단추 달린 HTML 한 장으로(운영자 2026-11-13 「복사판 만들어줘」).
   python3 tools/yes24-ebook-html.py <나가는 파일.html> [발매일 YYYYMMDD]
   칸 순서 = 운영자가 붙여 준 화면(2026-11-13): 상품명 · 부제 · 완결여부 · 카테고리 · 태그 · 연령 · 언어 · 읽기방향 · 합본/체험판 · ISBN · 발매일 · B2B · 서비스시작일 ·
   출판사 · 저자 · 정가/판매가 · 대여 · 상품설명(HTML) · 저자소개 · 목차 · 출판사서평 · 카드뉴스 · 표지 · 전자책 파일 · 미리보기 · 상세이미지.
   목차 · 쪽수 · 구성 숫자는 docs/books/particles-workbook.json 과 장부(book-ledger.json)에서 읽는다. 가격 · 카테고리 · 발매일은 운영자가 정한다(아래 표시)."""
import sys, json, html, re
out = sys.argv[1]; day = sys.argv[2] if len(sys.argv) > 2 else '20261110'
e = html.escape
B = json.load(open('docs/books/particles-workbook.json', encoding='utf8'))
L = json.load(open('docs/ops/book-ledger.json', encoding='utf8'))['books']['particles-workbook']
forms = open('docs/ops/isbn-forms.md', encoding='utf8').read()
sec = re.split(r'\n## (?=\d\d\. )', forms)
sec = [s for s in sec if s.startswith('02.')][0]
box = lambda name: re.search(r'\*\*' + re.escape(name) + r'\*\*\n```\n(.*?)\n```', sec, re.S).group(1)
isbn = B['isbn'].replace('-', ''); pages = L['pages']; price = str(L.get('krw', '13,900')).replace(',', '')
I = B['inline']
toc = []
for i, p in enumerate(B['parts'], 1):
    toc.append(f"{i}부 {p['title']['ko']}")
    for u in p['units']: toc.append('  - ' + I[u]['title']['ko'])
toc.append('  (정답 · 찾아보기)')
TOC = '\n'.join(toc)
author_bio = box('저자소개')
SUB = '조사 20개 · 블록으로 쪼개고 색으로 구분하기'
desc_html = f'''<div style="font-size:16px;line-height:1.8">
<p><b>조사 20개, 한 권으로 정리!</b><br>은/는과 이/가, 에와 에서가 매번 헷갈리나요? 한글은 읽을 수 있는데 조사만 나오면 멈추는 학습자를 위해, 조사를 한 단원에 하나씩 눈으로 보고 손으로 확인하며 익히는 워크북입니다.</p>
<p><b>이 책의 특징</b></p>
<ul>
<li><b>블록으로 쪼개 보기</b> — 문장을 블록으로 나눠 조사가 어디에 붙는지 한눈에 봅니다.</li>
<li><b>조사마다 정해진 색</b> — 같은 조사는 책 어디서나 같은 색입니다.</li>
<li><b>시험지 모양 미니 테스트 5회 + 최종 시험 30문항</b> — 조사 5개마다 종합 연습과 미니 테스트가 이어집니다.</li>
<li><b>한 문장, 조사만 바꿔 비교</b> — 은/는 vs 이/가, 에 vs 에서처럼 헷갈리는 짝을 나란히 놓습니다.</li>
<li><b>정답 쪽 + 단원마다 QR</b> — 책 끝 정답 쪽으로 혼자서도 공부하고, QR로 everykoreans.com 의 무료 연습에 이어집니다.</li>
<li><b>영어 · 한국어 두 언어 설명</b> — 영어권 학습자도, 한국어 선생님도 쓸 수 있습니다.</li>
</ul>
<p><b>이런 분께</b><br>한글을 읽을 수 있는 A1~A2 학습자 · 조사를 따로 다시 다지고 싶은 중급 학습자 · 조사 문제 자료가 필요한 한국어 선생님</p>
<p style="font-size:13px;color:#777">이 책은 독자적으로 만든 학습서입니다. 문장은 모두 새로 만든 것입니다.</p>
</div>'''
desc_text = re.sub(r'<br>|</p>|</li>', '\n', desc_html)
desc_text = re.sub(r'<[^>]+>', '', desc_text); desc_text = html.unescape(re.sub(r'\n{3,}', '\n\n', desc_text)).strip()
review = '''조사는 한국어를 배우는 분들이 가장 오래 헷갈리는 부분입니다. 이 책은 조사를 하나씩 뜻 · 모양 · 예문 · 블록 쪼개기 · 연습의 같은 순서로 보여 주어, 한 번 익히면 다음 조사도 같은 방식으로 따라갈 수 있게 했습니다.

문장을 블록으로 쪼개고 조사마다 정해진 색을 붙여서, 조사가 어디에 붙는지 눈으로 먼저 확인합니다. 은/는과 이/가, 에와 에서처럼 짝으로 헷갈리는 조사는 한 문장에서 조사만 바꿔 나란히 비교합니다.

조사 5개마다 종합 연습과 시험지 모양 미니 테스트로 바로 확인하고, 마지막에는 20개 조사를 모두 섞은 최종 시험 30문항으로 마무리합니다. 책 끝 정답 쪽이 있어 혼자서도 공부할 수 있고, 단원마다 QR로 무료 온라인 연습에 이어집니다.

한글을 읽을 수 있는 초급 학습자, 조사만 따로 다시 다지고 싶은 학습자, 조사 문제가 필요한 한국어 선생님께 맞습니다.

이 책은 독자적으로 만든 학습서입니다. 문장은 모두 새로 만든 것입니다.'''
DET = [('한국어 조사 워크북 · 조사 20개, 한 권으로 정리', 92), ('조사 20개 · 미니 테스트 5회 · 정답 쪽과 QR', 54), ('조사마다 정해진 색과 블록으로 쪼개 보기', 113), ('한 문장에서 조사만 바꿔 비교하기', 91), ('시험지 모양 미니 테스트와 최종 시험 30문항', 84), ('이렇게 공부하세요 · 공부 계획표', 84), ('4묶음 + 최종 연습 구성', 64), ('혼자서도 끝까지 · 지은이 소개', 57), ('책 정보', 28), ('에브리코리안즈 한국어 학습서 라인업', 224)]
tags = '한국어 조사, 은는 이가, 에 에서, 한국어 문법, 조사 문제집, 한국어 워크북, 한국어 학습, 외국인 한국어, TOPIK 문법, Korean particles'
def field(label, text, hint='', big=False, star=False):
    return f'<div class="f"><div class="fh"><b>{"*" if star else ""}{e(label)}</b>{f"<small>{e(hint)}</small>" if hint else ""}<button type="button">복사</button></div><pre class="v{" big" if big else ""}">{e(text)}</pre></div>'
manual = lambda label, text: f'<div class="f man"><div class="fh"><b>{e(label)}</b><small>직접 고르기</small></div><pre class="v">{e(text)}</pre></div>'
files = lambda label, text: f'<div class="f fl"><div class="fh"><b>{e(label)}</b><small>파일 올리기</small></div><pre class="v">{e(text)}</pre></div>'
body = ''.join([
 field('상품명', B['title']['ko'], '', False, True), field('부제', SUB),
 manual('완결여부', '완결'),
 manual('카테고리', '외국어 > 한국어(또는 한국어 문법) 쪽에서 고르세요. 예스24 화면 목록에 따라 달라서 직접 선택'),
 field('상품태그', tags, '쉼표로 구분 · 10개'),
 manual('연령제한 · 언어설정 · 읽기방향 · 합본/체험판', '연령제한: 전체 / 언어설정: 한국어 + 영어 둘 다 체크 / 읽기방향: LTR(좌→우) / 합본·체험판: 일반'),
 field('전자책 ISBN', isbn, '숫자 13자리', False, True), manual('종이책 ISBN · ISSN · UCI · ECN', '비워 둡니다(종이책 없음)'),
 field('컨텐츠 관리 ID', 'EK-EB-02-particles-workbook', '우리가 정한 관리 번호 · 필수 아님'),
 field('발매일', day, '책 판권쪽 발행일(2026.11.10)과 같게 · 서비스시작일은 따로(토 · 일 · 공휴일 선택 불가)', False, True),
 manual('B2B 판매여부 · 서비스시작일', 'B2B: 도서관 등 단체 판매(정산은 계약서대로)를 원하면 「예」, 아니면 「아니오」 / 서비스시작일: 「즉시반영」 또는 평일 날짜'),
 field('출판사', '에브리코리안즈', '', False, True), field('저자 및 역자', '준상(Junsang)', '저자 칸에 입력 후 저장', False, True),
 field('전자책 정가', price, '원 · 10원 단위(운영자가 정함: 장부의 정가 ' + str(L.get('krw')) + '원)', False, True), field('판매가', price, '정가와 같게(할인 최대 10%)', False, True), manual('화폐단위 · 상시대여', '원 / 상시대여: 대여불가'),
 field('상품설명 (HTML 탭에 붙여 넣기)', desc_html, 'HTML', True), field('상품설명 (TEXT 탭에 쓸 때)', desc_text, 'TEXT', True),
 manual('동영상 트레일러', '없음(비워 둠)'),
 field('저자소개', author_bio, 'TEXT', True), field('목차(구성)', TOC, 'TEXT — 부 · 단원 차례(새 구성)', True), field('출판사서평', review, 'TEXT', True),
 files('카드뉴스 이미지', '파일: cardnews_particles.zip (이 zip 하나만 올립니다 — 다른 zip 안에 넣지 마세요)\n안에 폴더 particles_cardnews/ · 파일 particles_cardnews_01.jpg ~ _08.jpg (예스24 샘플 zip 과 같은 모양 · 1080×1080 · 장당 500KB 이하 · JPEG)'),
 files('표지이미지', f'파일: {isbn}_cover.jpg (가로 1500px · 1200px 이상 · 10MB 이하)'),
 files('전자책 파일', f'파일: {isbn}.pdf ({pages}쪽 · 약 11MB · 200MB 이하 · 보호 없음)\n※ PDF 파일 교체 전 유의사항(수험서 카테고리): 이미 올린 파일은 쪽수가 달라(236쪽 → {pages}쪽) 교체가 안 되니 새 상품으로 올리거나 개정판 절차를 예스24에 문의'),
 manual('미리보기 설정', '「미리보기 생성」 · 책 앞부분(시작하기 + 1부 일부) 비율을 정하세요. 쪽수 기준으로는 앞 21쪽 정도가 사이트 무료 샘플과 같습니다'),
 manual('상세이미지 — 먼저 읽기', '예스24 상세이미지는 10칸이고 칸마다 파일 1장(3.0MB 이하 · 가로 940 권장)과 「이미지 설명」을 넣습니다. 긴 상세이미지를 10장으로 나눠 두었습니다. 칸 1부터 차례로 [찾기]로 01.jpg~10.jpg 를 고르고, 아래 설명을 붙여 넣으세요.'),
]) + ''.join(field(f'상세이미지 {i:02d} 설명', d, f'칸 {i} · 파일 {i:02d}.jpg (가로 940px · 약 {k}KB)') for i, (d, k) in enumerate(DET, 1)) + ''.join([
])
page = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>예스24 전자책 등록 복사판 · 조사 워크북</title>
<style>
:root{{--bg:#fafaf7;--fg:#222;--card:#fff;--line:#d9d6cc;--acc:#12704F}}
@media(prefers-color-scheme:dark){{:root{{--bg:#1b1d1c;--fg:#e8e8e3;--card:#252827;--line:#3c403e;--acc:#6fcf9f}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Malgun Gothic","Apple SD Gothic Neo",sans-serif}}
header{{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 16px;z-index:5}}header b{{color:var(--acc)}}
main{{max-width:860px;margin:0 auto;padding:8px 16px 80px}}.f{{background:var(--card);border:1px solid var(--line);border-radius:8px;margin:8px 0}}
.fh{{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid var(--line)}}.fh small{{color:#8a8a80;flex:1;margin-left:10px;font-size:12px}}
button{{background:var(--acc);color:#fff;border:0;border-radius:6px;padding:5px 14px;font-size:13px;cursor:pointer}}button.ok{{background:#888}}
pre.v{{margin:0;padding:8px 10px;white-space:pre-wrap;word-break:break-word;font:inherit}}pre.big{{max-height:300px;overflow:auto}}
.man{{border-style:dashed}}.man button{{display:none}}.fl{{border-color:#9bb8d8}}.fl button{{display:none}}.top{{background:#fff7e0;border:1px solid #e6d9a8;border-radius:8px;padding:10px 12px;margin:12px 0;font-size:14px;color:#222}}
</style></head><body>
<header><b>예스24 전자책 등록 복사판 · 한국어 조사 워크북</b> · 양식 칸 순서대로. 실선 칸은 「복사」→ 붙여 넣기, 점선 칸은 직접 고르기, 파란 칸은 파일 올리기.</header>
<main><div class="top"><b>미리 정해 주세요</b>: ① 전자책 정가(장부 {e(str(L.get('krw')))}원) ② 카테고리 ③ 서비스시작일(평일 · 발매일은 2026.11.10으로 고정) ④ B2B 여부 ⑤ 예스24 기존 상품(236쪽)을 개정판으로 바꿀지, 새 상품으로 올릴지.</div>{body}</main>
<script>
document.addEventListener('click',function(ev){{var b=ev.target.closest('button');if(!b)return;var t=b.closest('.f').querySelector('pre').textContent;
function done(){{b.textContent='복사됨 ✓';b.className='ok';setTimeout(function(){{b.textContent='복사';b.className='';}},1500);}}
function fb(){{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{{document.execCommand('copy');done();}}catch(x){{}}document.body.removeChild(a);}}
if(navigator.clipboard&&window.isSecureContext){{navigator.clipboard.writeText(t).then(done,fb);}}else fb();}});
</script></body></html>'''
open(out, 'w', encoding='utf8').write(page)
print(out, '조사 워크북 1권 · 칸', body.count('class="f'))
