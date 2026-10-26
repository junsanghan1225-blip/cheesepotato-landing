#!/usr/bin/env python3
"""쿠팡 Wing 「상품 등록」 화면의 칸 순서대로, 책마다 붙여 넣을 값을 「복사」 단추가 있는 HTML 한 장으로 만든다.
   python3 tools/coupang-html.py <나가는 파일.html> [대표이미지 폴더 이름표(파일 이름에 쓰는 문자열)]
   칸 순서 = 운영자가 붙여 준 화면(2026-10-26): 노출상품명 · 브랜드 · 등록상품명 · 카테고리 · 옵션 · 판매가/재고/상품코드/바코드 · 상품이미지 · 상세설명(HTML 작성) · 검색어(태그) · 상품정보제공고시 · 구비서류 · 배송 · 반품.
   글의 출처: docs/ops/isbn-forms.md(책소개 · 서평 · 저자소개 · 키워드 · 특기사항) + docs/shop.json(제목 · 쪽수 · 대상).
   가격(원) · A/S 전화 · 출고지 주소는 비워 둔다(운영자가 정하거나 입력 — 전화 · 주소는 저장소에 두지 않는다). 생성물은 운영자에게 보내는 용도라 저장소에 올리지 않는다. """
import re, sys, json, html
out = sys.argv[1]
e = html.escape
forms = open('docs/ops/isbn-forms.md', encoding='utf8').read()
shop = {b['id']: b for b in json.load(open('docs/shop.json', encoding='utf8'))['books']}
IDS = [('01', 'first-steps-workbook', 5), ('02', 'particles-workbook', 6), ('03', 'topik2-writing-51-52', 7), ('04', 'topik2-vocab-1000', 1),
       ('05', 'topik2-vocab-2000', 2), ('06', 'topik2-vocab-lv3', 3), ('07', 'topik1-reading-mock', 4), ('08', 'topik2-writing-53-54', 8)]
FILE = {'01': '01_한국어첫걸음워크북', '02': '02_한국어조사워크북', '03': '03_TOPIK쓰기51-52번100제', '04': '04_TOPIK2단어장워크북1', '05': '05_TOPIK2단어장워크북2',
        '06': '06_TOPIK2단어장워크북3', '07': '07_TOPIKI읽기실전모의고사10회', '08': '08_TOPIKII쓰기53-54번100제'}
CODE = {'01': 'EK-FIRSTSTEPS', '02': 'EK-PARTICLES', '03': 'EK-WRITING5152', '04': 'EK-VOCAB2-1', '05': 'EK-VOCAB2-2', '06': 'EK-VOCAB2-3', '07': 'EK-T1READ-MOCK', '08': 'EK-WRITING5354'}
USD = {'01': '9.9', '02': '9.9', '03': '6.9', '04': '6.9', '05': '6.9', '06': '6.9', '07': '9.9', '08': '9.9'}   # ISBN 신청서 정가(달러)
KRW = {'01': '12900', '02': '12900', '03': '8900', '07': '12900', '08': '12900'}   # 운영자 2026-10-26 「원화 가격은 12900원」(9.9달러 책). 단어장(6.9달러) 원화는 아직 안 정해짐
NO_QR = {'topik1-reading-mock'}
secs = {s[:2]: s for s in re.split(r'\n## (?=\d\d\. )', forms)[1:]}
box = lambda sec, name: re.search(r'\*\*' + re.escape(name) + r'\*\*\n```\n(.*?)\n```', sec, re.S).group(1)
cell = lambda sec, k: re.search(r'\|\s*' + k + r'\s*\|\s*(.*?)\s*\|', sec).group(1)
TOPIK_NOTE = 'TOPIK 은 국립국제교육원의 시험 이름입니다. 이 책은 독자적으로 만든 학습서이며 국립국제교육원 · 한국어능력시험센터가 운영 · 제휴 · 인증하지 않았습니다.'
PLAIN_NOTE = '이 책은 독자적으로 만든 학습서입니다. 문장은 모두 새로 만든 것입니다.'

def chk(item):
    d = [int(c) for c in '97911222407' + str(item)]
    return (10 - sum(x * (1 if i % 2 == 0 else 3) for i, x in enumerate(d)) % 10) % 10

def field(label, text, big=False, note=''):
    n = f'<div class="nt">{e(note)}</div>' if note else ''
    return (f'<div class="f"><div class="fh"><b>{e(label)}</b><button type="button">복사</button></div>{n}'
            f'<pre class="v{" big" if big else ""}">{e(text)}</pre></div>')

def detail_html(title, sub, intro, long_ko, target, spec, note):
    li = lambda xs: ''.join(f'<li>{e(x)}</li>' for x in xs)
    paras = lambda t: ''.join(f'<p>{e(p)}</p>' for p in t.split('\n\n') if p.strip())
    return (f'<h2>{e(title)}</h2><p><b>{e(sub)}</b></p><h3>책 소개</h3>{paras(intro)}'
            f'<h3>이 책의 특징</h3><ul>{li(long_ko["feats"])}</ul><h3>이런 분께</h3><ul>{li(target)}</ul>'
            f'<h3>책 정보</h3><p>{e(spec)}</p><h3>지은이 소개</h3>{paras(long_ko["author"])}<p>{e(note)}</p>')

body, nav = [], []
for no, bid, item in IDS:
    sec, b = secs[no], shop[bid]
    title = cell(sec, '책제목'); sub = cell(sec, '부제목'); topik = 'TOPIK' in title
    isbn = f'979-11-222407-{item}-{chk(item)}'
    pages = b['pages'].replace(' (PDF · 속지 기준)', '')
    feats = ['책 끝에 정답 쪽이 있어 혼자 공부할 수 있습니다.']
    if bid not in NO_QR: feats.append('단원마다 QR 코드로 everykoreans.com 의 무료 연습 쪽으로 이어집니다.')
    feats.append('영어와 한국어 두 언어로 설명해 영어권 학습자도, 한국어 교사도 쓸 수 있습니다.')
    spec = f"B5 (182 × 257 mm) · {pages} · 디지털판(PDF) · 한국어 · English · 에브리코리안즈 · ISBN {isbn}(신청 번호)"
    target = b['for']['ko']
    dh = detail_html(title, sub, box(sec, '책소개'), {'feats': feats, 'author': box(sec, '저자소개')}, target, spec, TOPIK_NOTE if topik else PLAIN_NOTE)
    name = f'{title} : {sub}'
    cat = ('도서>국내도서>국어 외국어 사전>국어>외국인을 위한 한국어' if no in ('01', '02') else
           '도서>국내도서>국어 외국어 사전>국어>외국인을 위한 한국어')
    cat_note = ('쿠팡 화면이 「한국어 첫걸음 워크북」에 대해 보여 준 카테고리(수수료 10.8%, VAT 별도). 그대로 선택.' if no == '01' else
                '첫걸음 책에 화면이 보여 준 카테고리가 이 책에도 맞는지 화면에서 확인(TOPIK 시험 준비 쪽 카테고리가 따로 있는지는 확인 못 함 — 카테고리 검색칸에 「TOPIK」 을 넣어 보고 고르세요).')
    tags = ', '.join(x.strip() for x in cell(sec, '키워드').split(','))
    nav.append(f'<a href="#b{no}">{no} {e(title)}</a>')
    body.append(f'<section id="b{no}"><h2>{no}. {e(title)}</h2>'
        + '<h3>① 노출상품명 · 브랜드 · 등록상품명</h3>'
        + field('노출상품명 (100자 안쪽)', name[:100], note=f'{len(name[:100])}자. 짧게 하려면 「{title}」 만 써도 됩니다.')
        + field('브랜드', '「브랜드 없음(또는 자체제작)」 선택', note='등록한 상표가 없으면 이것. 상표를 등록했다면 그 이름.')
        + field('등록상품명 (판매자관리용)', f'{title} ({CODE[no]})', note='고객에게 안 보이는 내 관리용 이름.')
        + '<h3>② 카테고리 · 옵션</h3>'
        + field('카테고리', cat, note=cat_note)
        + field('옵션', '「설정 안 함」', note='책마다 따로 등록(권 · 시리즈를 옵션으로 묶지 않음)이 가장 단순합니다. 묶고 싶으면 시리즈(파트) 칸에 「1권」, 출판사 칸에 「에브리코리안즈」.')
        + '<h3>③ 가격 · 재고 · 코드 · 바코드</h3>'
        + field('판매자상품코드', CODE[no], note='내가 정하는 관리 코드(아무거나 가능 — 이 값을 추천).')
        + field('상품 바코드 (ISBN)', isbn.replace('-', ''), note='⚠ 국립중앙도서관 승인 뒤에만 입력(지금은 신청 번호). 승인 전이면 비워 두거나 「바코드 없음」.')
        + field('정상가 · 판매가 (원)', (KRW[no] + '\n(정상가와 판매가 같게)') if no in KRW else '(운영자가 정함)', note=(f'운영자가 정한 원화 가격 {int(KRW[no]):,}원(정가 {USD[no]}달러 책). 쿠팡 수수료 10.8%(VAT 별도)는 판매가에서 빠집니다.' if no in KRW else f'정가 {USD[no]}달러 책의 원화 가격은 아직 안 정해졌습니다. 쿠팡 수수료 10.8%(VAT 별도)를 감안해 정하세요.'))
        + field('재고수량', '(운영자가 정함)', note='전자 파일이면 쿠팡이 허용하는 수량 · 방식을 화면 안내에서 확인(확인 못 함).')
        + '<h3>④ 상품이미지</h3>'
        + field('대표이미지 (1000×1000 JPG)', f'에브리코리안즈_쿠팡대표이미지_{FILE[no]}_v1.0_20261026.jpg', note='같이 보낸 이미지 파일. 흰 바탕 가운데에 표지. 추가이미지(최대 9장, 5장 이상이면 전환율↑)는 책 속지 몇 쪽을 캡처해 올리세요.')
        + '<h3>⑤ 상세설명 — 「HTML 작성」 탭에 붙여 넣기</h3>'
        + field('상세설명 HTML', dh, True, note='「HTML 작성」 탭 선택 → 전체 붙여 넣기. 미리보기가 어색하면 「에디터 작성」 탭에 글만 붙여도 됩니다.')
        + '<h3>⑥ 검색어 · 태그</h3>'
        + field('태그 (쉼표로 구분, 최대 20개)', tags, note='상품과 관계없는 말은 지워질 수 있어 이 책 키워드만 넣었습니다.')
        + '<h3>⑦ 상품정보제공고시</h3>'
        + field('방법', '「전체 상품 상세페이지 참조」 체크', note='화면에 이 체크가 있으면 가장 쉬운 방법(칸마다 「상품 상세페이지 참조」). 체크를 못 하면 아래 값을 칸에 붙이세요.')
        + field('품명 및 모델명', f'{title} (디지털판 PDF)')
        + field('KC 인증정보', '해당없음')
        + field('크기', 'B5 (182 × 257 mm) 기준 PDF 파일')
        + field('중량', '해당없음 (전자 파일)')
        + field('색상 · 재질', '컬러 · 해당없음 (전자 파일)')
        + field('사용연령 또는 권장사용연령', '해당없음 (한국어 학습자 대상)')
        + field('동일모델의 출시년월', '2026년 11월')
        + field('제조자(수입자) · 제조국', '에브리코리안즈 · 대한민국')
        + field('취급방법 및 주의사항 · 안전표시', '해당없음')
        + field('품질보증기준', '제품 이상 시 공정거래위원회 고시 소비자분쟁해결기준에 의거 보상합니다.')
        + field('A/S 책임자와 전화번호', '(운영자가 입력 — 전화번호는 저장소에 두지 않음)')
        + field('(도서 고시 칸이 보이면) 도서명 · 저자 · 출판사 · 쪽수 · 발행일', f'{title} · 준상(Junsang) · 에브리코리안즈 · {pages} · 2026-11-10')
        + '<h3>⑧ 구비서류 · 배송 · 반품</h3>'
        + field('구비서류', '없음 (건너뜀)')
        + field('배송 · 반품', '출고지 · 반품/교환지를 먼저 등록해야 합니다', note='「출고지 추가」 「반품/교환지 추가」 에서 운영자 주소를 입력(저장소에 두지 않음).') + '</section>')

note = ('<div class="warn"><b>먼저 확인할 것 (확인 못 한 부분)</b><ol>'
        '<li>쿠팡 「판매자배송」은 택배로 보내는 <b>실물 상품</b>용입니다. 우리 책은 지금 <b>PDF 전자책</b>이라 쿠팡이 받아 주는지, 받아 준다면 어떤 방식(다운로드 · 쿠폰)인지 <b>확인하지 못했습니다</b>. Wing 의 「온라인문의」 에 「전자책(PDF) 도서 등록 가능 여부」 를 먼저 물어보세요.</li>'
        '<li>입점 절차 완료를 위해 상품 1개를 등록해야 한다면, 위 문의 답을 받은 뒤 그 방식대로 한 권만 먼저 올리세요. 종이책(POD)이 나오면 그때 판매자배송으로 올리는 길이 안전합니다.</li>'
        '<li>원화 가격 · A/S 전화 · 출고지 주소는 비워 두었습니다. ISBN 은 승인 전이라 신청 번호입니다.</li></ol></div>')
page = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>쿠팡 상품 등록 복사판</title>
<style>
:root{{--bg:#fafaf7;--fg:#222;--card:#fff;--line:#d9d6cc;--acc:#12704F;--warn:#fff4e5}}
@media(prefers-color-scheme:dark){{:root{{--bg:#1b1d1c;--fg:#e8e8e3;--card:#252827;--line:#3c403e;--acc:#6fcf9f;--warn:#3a2f1f}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,"Malgun Gothic","Apple SD Gothic Neo",sans-serif}}
header{{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 16px;z-index:5}}
header b{{color:var(--acc)}} nav{{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:6px;font-size:13px}} nav a{{color:var(--acc);text-decoration:none}}
main{{max-width:860px;margin:0 auto;padding:8px 16px 80px}} section{{margin:30px 0}} h2{{font-size:20px;border-bottom:2px solid var(--acc);padding-bottom:4px}} h3{{font-size:14px;margin:18px 0 4px;color:var(--acc)}}
.warn{{background:var(--warn);border:1px solid var(--line);border-radius:8px;padding:8px 14px;margin:14px 0}}
.f{{background:var(--card);border:1px solid var(--line);border-radius:8px;margin:8px 0}} .fh{{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid var(--line)}} .nt{{font-size:12.5px;opacity:.75;padding:4px 10px 0}}
button{{background:var(--acc);color:#fff;border:0;border-radius:6px;padding:5px 14px;font-size:13px;cursor:pointer}} button.ok{{background:#888}}
pre.v{{margin:0;padding:8px 10px;white-space:pre-wrap;word-break:break-word;font:inherit}} pre.big{{max-height:300px;overflow:auto}}
</style></head><body>
<header><b>쿠팡 상품 등록 복사판</b> · 칸마다 「복사」를 누르고 Wing 등록 화면에 붙여 넣으세요.<nav>{''.join(nav)}</nav></header>
<main>{note}{''.join(body)}</main>
<script>
document.addEventListener('click',function(ev){{var b=ev.target.closest('button');if(!b)return;var t=b.closest('.f').querySelector('pre').textContent;
function done(){{b.textContent='복사됨 ✓';b.className='ok';setTimeout(function(){{b.textContent='복사';b.className='';}},1500);}}
function fb(){{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{{document.execCommand('copy');done();}}catch(x){{}}document.body.removeChild(a);}}
if(navigator.clipboard&&window.isSecureContext){{navigator.clipboard.writeText(t).then(done,fb);}}else fb();}});
</script></body></html>'''
open(out, 'w', encoding='utf8').write(page)
print(out, len(IDS), '권')
