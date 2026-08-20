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
}

src = Image.open('logo.png').convert('RGBA')
for name, n in SIZES.items():
    src.resize((n, n), Image.LANCZOS).save(name, optimize=True)
    print(f'{name} — {n}×{n}')
