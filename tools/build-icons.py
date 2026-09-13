"""탭 아이콘을 logo.png 에서 줄여 만든다 — 생성물, 손으로 고치지 말 것.

    python3 tools/build-icons.py

logo.png 는 600×600 254KB 다. 그대로 탭 아이콘으로 걸면 쪽마다 254KB 를
아이콘 하나에 쓴다. 검색에서 처음 들어온 사람에게 그 값을 물릴 까닭이 없다.

다른 도구는 다 .mjs 인데 이것만 파이썬인 이유는, PNG 를 줄이는 일을
Node 로 하려면 바깥 꾸러미를 하나 더 들여와야 해서다. Pillow 는 이 환경에
이미 있다. 로고를 바꿀 때만 돌리면 되는 도구라 그 값을 치를 일이 아니다.
"""
import os

from PIL import Image

SIZES = {
    'favicon-32.png': 32,    # 탭 아이콘. 쪽마다 불린다 — 작을수록 좋다.
    'icon-180.png': 180,     # iOS 홈 화면. 담을 때만 불린다.
    # 화면에 보이는 로고 셋(머리띠 28px · 첫 화면 56px · 내려받기 54px)이
    # 쓴다. 가장 큰 것이 2배 화면에서 112px 이므로 256 이면 3배 화면까지
    # 넉넉하다. 여태 셋 다 600×600 원본을 받고 있었다 — 첫 화면 무게의
    # 248KB 가 28px 짜리 그림 몫이었다.
    'logo-256.png': 256,
    # manifest.json 이 홈 화면에 담을 때 쓰는 두 크기. PWA 설치 배지·
    # 스플래시 화면에 쓰이므로 규격(192·512)이 정해져 있다.
    'icon-192.png': 192,
    'icon-512.png': 512,
}

# og:image 와 JSON-LD 의 Organization.logo 는 logo.png(600×600) 그대로 둔다.
# 카카오톡·트위터가 링크 미리보기에 쓰는 그림이라 작으면 흐려지고, 구글은
# Organization 로고를 112px 이상으로 요구한다. 그 둘은 사람이 우리 쪽을
# 열 때 받는 것이 아니라 그쪽 서버가 따로 받아 가므로 첫 화면과 무관하다.

# 크롬 익스텐션이 쓰는 네 크기. 크롬이 정한 규격이다 — 16 은 주소창 옆,
# 32 는 윈도, 48 은 익스텐션 관리 쪽, 128 은 웹 스토어다. 없는 크기는
# 크롬이 있는 것에서 줄여 쓰는데, 16px 로 줄이는 일을 크롬에 맡기면
# 로고의 가는 테두리가 뭉개진다. 네 크기를 다 넣는 편이 낫다.
EXT_SIZES = {f'extension/icons/icon-{n}.png': n for n in (16, 32, 48, 128)}

# 웹 스토어에 따로 올리는 아이콘. 크기는 같은 128인데 **그림이 96이어야
# 한다** — 크롬의 아이콘 지침이 128칸 안에 96을 두고 둘레 16을 비우라고
# 한다. 목록에서 남의 아이콘과 나란히 놓였을 때 우리 것만 커 보이지 않게
# 하려는 것이다. 익스텐션 안에 들어가는 icon-128.png 는 이 여백이 없어야
# 맞으므로(크롬이 제 자리에서 알아서 띄운다) 둘을 따로 굽는다.
STORE_ICON = 'extension/store/assets/icon-128.png'
STORE_CANVAS, STORE_ART = 128, 96

src = Image.open('logo.png').convert('RGBA')
for name, n in {**SIZES, **EXT_SIZES}.items():
    im = src.resize((n, n), Image.LANCZOS)
    # 색을 256가지로 줄인다. 원본은 42,000가지를 쓰는데 그건 사진 이야기고,
    # 로고는 몇 가지 색과 테두리뿐이다. 256px 짜리가 76KB → 14KB 로 준다.
    # 실제로 보이는 크기(28~112px)에서 재 보면 색 차이가 평균 1/255 이라
    # 눈으로는 구분이 안 된다. 이 로고에는 투명한 자리가 아예 없어서
    # (알파가 전부 255) 팔레트로 바꿔도 잃을 것이 없다.
    # 익스텐션 아이콘은 팔레트로 안 줄인다. 크롬이 주소창 옆에 그릴 때
    # 배경 위에 알파로 섞어 그리는데, 팔레트로 바꾸면 그 가장자리가
    # 계단처럼 남는다. 어차피 쪽마다 받는 그림이 아니라 한 번 설치되는
    # 것이라 크기를 아낄 자리가 아니다.
    (im if name.startswith('extension/') else
     im.quantize(colors=256, method=Image.FASTOCTREE)).save(name, optimize=True)
    print(f'{name} — {n}×{n}')

# 스토어 아이콘. 둘레는 투명하게 둔다 — 스토어가 밝은 바탕에도 어두운
# 바탕에도 올려 놓으므로, 여백을 흰색으로 칠하면 어두운 쪽에서 흰 네모가
# 된다. (알파를 받지 않는 것은 스크린샷과 프로모 타일이고 아이콘은 아니다.)
os.makedirs(os.path.dirname(STORE_ICON), exist_ok=True)
canvas = Image.new('RGBA', (STORE_CANVAS, STORE_CANVAS), (0, 0, 0, 0))
art = src.resize((STORE_ART, STORE_ART), Image.LANCZOS)
pad = (STORE_CANVAS - STORE_ART) // 2
canvas.paste(art, (pad, pad), art)
canvas.save(STORE_ICON, optimize=True)
print(f'{STORE_ICON} — {STORE_CANVAS}×{STORE_CANVAS} (그림 {STORE_ART}, 둘레 {pad})')
