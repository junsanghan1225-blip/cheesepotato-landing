#!/usr/bin/env python3
"""ISBN 일괄등록 엑셀(.xls)을 docs/ops/isbn-forms.md 와 책 틀에서 만들고, 올리기 전에 규칙을 검사한다.
사용: python3 tools/isbn-xls.py <견본.xls> <나갈.xls> [책번호 04 05 06 …]
견본 = 국립중앙도서관이 주는 isbn_request_sample.xls(머리줄 · 코드값 시트를 그대로 쓴다).
지난 반려 사유를 막는다: 부가기호 두 번째 자리 5(전자책) · 접두부 979-11 · 체크기호 · 발행제본형태/상세 코드값 · 신청서 글과 같은 부제목 · 저자명 · 발행일 · 판권지.
"""
import sys, re, json
import xlrd, xlwt
SAMPLE, OUT = sys.argv[1], sys.argv[2]
NUMS = sys.argv[3:] or ['04', '05', '06']
ITEM = {'04': 1, '05': 2, '06': 3, '07': 4, '08': 8, '09': 0, '10': 9}  # 서명식별번호(5·6·7 은 첫걸음 · 조사 · 쓰기 51~52 가 썼다. 07 모의고사 = 4(2026-10-26 엑셀로 신청), 08 은 8, 09 TOPIK I 필수 단어장 = 0, 10 필수 관용 표현 = 9. 번호 10개를 다 씀)
PRICE = {'03': '6.9', '04': '6.9', '05': '6.9', '06': '6.9', '07': '9.9', '08': '9.9', '09': '9.9', '10': '9.9'}
BID = {'04': 'topik2-vocab-1000', '05': 'topik2-vocab-2000', '06': 'topik2-vocab-lv3', '07': 'topik1-reading-mock', '08': 'topik2-writing-53-54', '09': 'topik1-vocab', '10': 'korean-idioms'}
def chk(item):
    d = [int(c) for c in '97911222407' + str(item)]
    return (10 - sum(x * (1 if i % 2 == 0 else 3) for i, x in enumerate(d)) % 10) % 10
doc = open('docs/ops/isbn-forms.md', encoding='utf8').read()
sec = lambda n: doc.split('\n## %s. ' % n)[1].split('\n## ')[0]
cell = lambda s, k: re.search(r'\|\s*%s\s*\|\s*(.*?)\s*\|' % k, s).group(1)
wb = xlrd.open_workbook(SAMPLE); sh0 = wb.sheet_by_index(0); codes = wb.sheet_by_index(1)
hdr = [sh0.cell_value(0, c) for c in range(sh0.ncols)]
rows = []
for n in NUMS:
    s = sec(n); item = ITEM[n]
    pan = re.search(r'\*\*판권지\*\*.*?```\n(.*?)\n```', s, re.S).group(1)
    rows.append({'접두부': '979', '국가번호': '11', '발행자번호': '222407', '서명식별번호': str(item), '체크기호': str(chk(item)), '*부가기호': '15710',
                 '*책제목': cell(s, '책제목'), '책부제': cell(s, '부제목'), '*저자명': cell(s, '저자명'), '본문언어': '한국어',
                 '키워드': '; '.join(x.strip() for x in cell(s, '키워드').split(',')), '발행제본형태': '전자책', '발행제본상세': 'PDF',
                 '*가격': PRICE[n], '화폐단위': '달러', '*발행(예정)': re.search(r'\| 발행일 \| (\d{4})-(\d\d)-(\d\d)', doc).expand(r'\1\2\3'),
                 '특기사항': cell(s, '특기사항'), '서비스형태': '온라인서비스기타', '판권지': pan})
out = xlwt.Workbook(encoding='utf-8'); a = out.add_sheet('Sheet1')
for c, h in enumerate(hdr): a.write(0, c, h)
for i, r in enumerate(rows, 1):
    for c, h in enumerate(hdr):
        if r.get(h, '') != '': a.write(i, c, str(r[h]))
b = out.add_sheet('코드값')
for rr in range(codes.nrows):
    for c in range(codes.ncols):
        if codes.cell_value(rr, c) != '': b.write(rr, c, codes.cell_value(rr, c))
out.save(OUT)
# ── 검사: 만든 파일을 다시 읽어서 ──
vals = {str(codes.cell_value(r, 0)).strip() for r in range(codes.nrows)}
pairs, cur = set(), None
for r in range(34, 64):
    x, y = codes.cell_value(r, 0), codes.cell_value(r, 1)
    if x and x != '발행제본형태': cur = x
    if cur and y and x != '발행제본형태': pairs.add((cur, y))
t = xlrd.open_workbook(OUT).sheet_by_index(0); bad = []; seen = set()
for r in range(1, t.nrows):
    row = {hdr[c]: str(t.cell_value(r, c)).strip() for c in range(t.ncols)}; tag = row['*책제목']
    isbn = row['접두부'] + row['국가번호'] + row['발행자번호'] + row['서명식별번호'] + row['체크기호']
    if len(isbn) != 13 or int(row['체크기호']) != chk(row['서명식별번호']): bad.append(f'{tag}: ISBN 체크기호')
    if isbn in seen or row['서명식별번호'] in ('5', '6', '7'): bad.append(f'{tag}: ISBN 중복 · 이미 쓴 번호')
    seen.add(isbn)
    if row['*부가기호'][1:2] != '5' or len(row['*부가기호']) != 5: bad.append(f'{tag}: 부가기호 두 번째 자리 5 아님')
    if (row['발행제본형태'], row['발행제본상세']) not in pairs: bad.append(f'{tag}: 발행제본형태/상세 코드값 없음')
    for k in ('화폐단위', '서비스형태', '본문언어'):
        if row[k] not in vals: bad.append(f'{tag}: {k} 코드값 없음')
    if not re.fullmatch(r'\d{8}', row['*발행(예정)']) or '발행  %s.%s.%s' % (row['*발행(예정)'][:4], row['*발행(예정)'][4:6], row['*발행(예정)'][6:]) not in row['판권지']: bad.append(f'{tag}: 발행일 ≠ 판권지')
    print('✓', tag, f"{row['접두부']}-{row['국가번호']}-{row['발행자번호']}-{row['서명식별번호']}-{row['체크기호']}", row['*부가기호'], row['*가격'], row['화폐단위'])
if bad: sys.exit('✗ ' + '\n✗ '.join(bad))
print('통과 —', OUT)
