"""탭 아이콘을 logo.png 에서 줄여 만든다 — 생성물, 손으로 고치지 말 것.

    python3 tools/build-icons.py

logo.png 는 600×600 254KB 다. 그대로 탭 아이콘으로 걸면 쪽마다 254KB 를
아이콘 하나에 쓴다. 검색에서 처음 들어온 사람에게 그 값을 물릴 까닭이 없다.

다른 도구는 다 .mjs 인데 이것만 파이썬인 이유는, PNG 를 줄이는 일을
Node 로 하려면 바깥 꾸러미를 하나 더 들여와야 해서다. Pillow 는 이 환경에
이미 있다. 로고를 바꿀 때만 돌리면 되는 도구라 그 값을 치를 일이 아니다.
"""
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

src = Image.open('logo.png').convert('RGBA')
for name, n in SIZES.items():
    im = src.resize((n, n), Image.LANCZOS)
    # 색을 256가지로 줄인다. 원본은 42,000가지를 쓰는데 그건 사진 이야기고,
    # 로고는 몇 가지 색과 테두리뿐이다. 256px 짜리가 76KB → 14KB 로 준다.
    # 실제로 보이는 크기(28~112px)에서 재 보면 색 차이가 평균 1/255 이라
    # 눈으로는 구분이 안 된다. 이 로고에는 투명한 자리가 아예 없어서
    # (알파가 전부 255) 팔레트로 바꿔도 잃을 것이 없다.
    im.quantize(colors=256, method=Image.FASTOCTREE).save(name, optimize=True)
    print(f'{name} — {n}×{n}')
