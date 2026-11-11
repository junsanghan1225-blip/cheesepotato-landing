#!/usr/bin/env python3
"""예스24 SCM 「e북 대량등록(엑셀 업로드)」 양식에 책 정보를 채워 엑셀 한 장으로 만든다(운영자 2026-11-11 「대량 등록 앞으로 이렇게 하자」).
   python3 tools/yes24-bulk.py <나가는 파일.xlsx> [--ids 01,02,07,10 | --all] [--day YYYY-MM-DD] [--cat 카테고리코드]
   틀 = docs/ops/templates/yes24-ebook-bulk-template.xlsx (예스24 가 내려 주는 틀 그대로 — 셀 · 칸을 더하거나 빼지 않는다. 데이터는 37행부터).
   글(상품설명 · 저자소개 · 목차 · 서평)은 개별 등록 복사판(tools/yes24-html.py)과 같은 글 — docs/ops/isbn-forms.md 와 책 틀.
   기본 책 = 아직 예스24 에 안 올린 4권(01 첫걸음 · 02 조사 · 07 읽기 실전 · 10 관용 표현). 생성물(엑셀)은 저장소에 올리지 않는다.
   운영자가 정해야 하는 칸: 카테고리 코드(--cat · SCM 카테고리 창에서 확인) · 상품태그 코드(선택). 이 도구는 지어내지 않고 비워 둔다. """
import re, sys, json, os, shutil
try:
    import openpyxl
except ImportError:   # python3 가 openpyxl 이 없는 쪽이면 시스템 파이썬으로 다시 돌린다
    if os.path.exists('/usr/bin/python3') and sys.executable != '/usr/bin/python3': os.execv('/usr/bin/python3', ['/usr/bin/python3'] + sys.argv)
    raise
args = sys.argv[1:]
out = next((a for a in args if a.endswith('.xlsx')), None)
if not out: sys.exit('쓰는 법: python3 tools/yes24-bulk.py <나가는 파일.xlsx> [--ids 01,02 | --all] [--day YYYY-MM-DD] [--cat 코드]')
opt = lambda k, d='': args[args.index(k) + 1] if k in args else d
import datetime
day = opt('--day', datetime.date.today().isoformat()); cat = opt('--cat', '')
IDS = [('01','first-steps-workbook'),('02','particles-workbook'),('03','topik2-writing-51-52'),('04','topik2-vocab-1000'),('05','topik2-vocab-2000'),('06','topik2-vocab-lv3'),('07','topik1-reading-mock'),('08','topik2-writing-53-54'),('09','topik1-vocab'),('10','korean-idioms')]
want = None if '--all' in args else set(opt('--ids', '01,02,07,10').split(','))
PRICE = {'topik2-writing-51-52': 9900, 'topik2-vocab-1000': 9900, 'topik2-vocab-2000': 9900, 'topik2-vocab-lv3': 9900}   # 나머지는 13,900(운영자 2026-10)
NO_QR = {'topik1-reading-mock'}
forms = open('docs/ops/isbn-forms.md', encoding='utf8').read()
secs = {s[:2]: s for s in re.split(r'\n## (?=\d\d\. )', forms)[1:]}
def box(sec, name):
    m = re.search(r'\*\*' + re.escape(name) + r'\*\*\n```\n(.*?)\n```', sec, re.S); return m.group(1) if m else ''
cell = lambda sec, k: re.search(r'\|\s*' + k + r'\s*\|\s*(.*?)\s*\|', sec).group(1)
TOPIK_NOTE = 'TOPIK 은 국립국제교육원의 시험 이름입니다. 이 책은 독자적으로 만든 학습서이며 국립국제교육원 · 한국어능력시험과 관계없습니다. 문항은 모두 새로 만든 것이며 실제 기출문제가 아닙니다.'
src = open('tools/yes24-html.py', encoding='utf8').read()
m = re.search(r"TOPIK_NOTE = '(.*?)'\nPLAIN_NOTE = '(.*?)'", src); TOPIK_NOTE, PLAIN_NOTE = (m.group(1), m.group(2)) if m else (TOPIK_NOTE, '이 책은 독자적으로 만든 학습서입니다. 문장은 모두 새로 만든 것입니다.')   # 개별 등록 복사판과 같은 문구를 쓴다
tpl = 'docs/ops/templates/yes24-ebook-bulk-template.xlsx'
shutil.copy(tpl, out)
wb = openpyxl.load_workbook(out); ws = wb.active
HDR = 36; FIRST = 37
col = {str(ws.cell(HDR, c).value).replace('\n', ' ').strip(): c for c in range(2, ws.max_column + 1) if ws.cell(HDR, c).value}   # 머리글 그대로(줄바꿈만 공백으로) — 「상품설명」과 「상품설명 TEXT/HTML 구분」이 섞이지 않게
need = ['상품명', '부제', '완결여부', '카테고리 코드', '연령제한', '언어설정', '읽기 방향', '합본/체험판', '전자책 ISBN', '컨텐츠 관리 ID', '발매일', '저자 및 역자', '정가', '판매가', '상품설명', '저자소개', '목차(구성)', '출판사서평', '표지파일 명', '전자책 파일 명']
miss = [n for n in need if n not in col]
if miss: sys.exit('틀의 칸 이름이 바뀌었다(예스24 가 틀을 새로 냈나?): ' + ', '.join(miss))
shop = {b['id']: b for b in json.load(open('docs/shop.json', encoding='utf8'))['books']}
row = FIRST; done = []
for no, bid in IDS:
    if want is not None and no not in want: continue
    sec = secs[no]; fr = json.load(open(f'docs/books/{bid}.json', encoding='utf8')); isbn = fr['isbn'].replace('-', '')
    title = cell(sec, '책제목'); price = PRICE.get(bid, 13900)
    feats = ['책 끝에 정답 쪽이 있어 혼자 공부할 수 있습니다.']
    if bid.startswith('topik2-vocab'): feats.append('꼭 외워야 할 낱말은 박스로 묶고, 가장 자주 나오는 낱말에는 「최다 빈출」 표시를 붙였습니다.')
    if bid not in NO_QR: feats.append('단원마다 QR 코드로 everykoreans.com 의 무료 연습 쪽으로 이어집니다.')
    feats.append('영어와 한국어 두 언어로 설명해 영어권 학습자도, 한국어 교사도 쓸 수 있습니다.')
    intro = box(sec, '책소개') + '\n\n이 책의 특징\n' + '\n'.join('- ' + f for f in feats)
    review = box(sec, '서평') + '\n\n' + (TOPIK_NOTE if 'TOPIK' in title else PLAIN_NOTE)
    vals = {'상품명': title, '부제': cell(sec, '부제목'), '완결여부': 'Y', '카테고리 코드': (int(cat) if cat.isdigit() else None), '연령제한': '전체', '언어설정': '한국어', '읽기 방향': '좌우', '합본/체험판': '일반',
            '전자책 ISBN': isbn, '컨텐츠 관리 ID': f'EK-EB-{no}-{bid}', '발매일': day, '저자 및 역자': cell(sec, '저자명'), '정가': price, '판매가': price,
            '상품설명': intro, '저자소개': box(sec, '저자소개'), '목차(구성)': box(sec, '목차'), '출판사서평': review,
            '표지파일 명': f'{isbn}_cover.jpg', '전자책 파일 명': f'{isbn}.pdf'}
    for k, v in vals.items():
        if v is not None and k in col: ws.cell(row, col[k], v)
    # 「TEXT/HTML 구분」 칸 4개는 머리글이 같은 줄 이름(상품설명 TEXT/HTML 구분)이라 따로 찾는다
    for c in range(2, ws.max_column + 1):
        h = str(ws.cell(HDR, c).value or '')
        if 'TEXT/HTML' in h: ws.cell(row, c, 'TEXT')
    done.append((row, no, bid, title, price)); row += 1
wb.save(out)
print(out, len(done), '권')
for r, no, bid, t, p in done: print(f'  행 {r}  {no}  {bid}  「{t}」  정가 {p:,}원')
if not cat: print('⚠ 카테고리 코드(필수 칸)를 비워 뒀다 — SCM 카테고리 창에서 코드를 확인해 --cat 로 넣거나 엑셀 E열에 직접 적는다.')
print('⚠ 확인: 전자책 파일 명은 ' + '「<ISBN>.pdf」, 표지파일 명은 「<ISBN>_cover.jpg」로 적었다 — 예스24 가 올리는 파일(zip 묶음?) 이름 규칙과 맞는지 SCM 에서 확인.')
