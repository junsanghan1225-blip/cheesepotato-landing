# 3D 시험장 교실 소품 — Blender 에서 한 번 돌리면 책상 · 의자 · 사물함 · 교실 문 네 개를 만들고
# 바로 .glb 하나로 내보낸다(운영자 2026-11-09 「방법 1로 해줘」 — 스크립트는 Claude, 실행은 운영자).
#
# 쓰는 법
#   1. Blender 를 열고 위쪽 탭에서 Scripting 을 누른다.
#   2. 가운데 글 칸에서 New → 이 파일 내용을 통째로 붙여 넣는다.
#   3. ▶(Run Script) 를 누른다. 지금 장면이 지워지고 소품 네 개가 나란히 생긴다.
#   4. 홈 폴더에 everykoreans_classroom.glb 가 저장된다(맨 아래 Info 창에 경로가 나온다).
#      그 파일을 Claude 대화에 올리면 된다. 모양을 손보고 싶으면 손본 뒤
#      File → Export → glTF 2.0 (.glb) 로 같은 이름으로 다시 저장해도 된다.
#
# 약속(시험장 코드와 맞추는 것 — 바꾸면 Claude 에게 알려 준다)
#   - 단위는 미터, 물체마다 원점은 바닥 한가운데.
#   - 학생이 보는 쪽(칠판 쪽)은 Blender 의 +Y. (glTF 로 나가면 three.js 의 -Z 가 된다.)
#   - 이름: desk · chair · locker · door. 시험장은 이 이름으로 찾는다.
#   - 폰에서도 가볍게 — 모서리 둥글림은 2단만, 다리는 8각.

import bpy, bmesh, os, math

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'

def material(name, rgb, rough=0.6, metal=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    return m

def srgb(h):  # '#d9c49a' → 선형 RGB
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)

LAM   = material('laminate', srgb('#d8c39a'), 0.55)        # 책상 윗판(밝은 무늬목)
EDGE  = material('edge',     srgb('#8f765a'), 0.5)
WOOD  = material('wood',     srgb('#b07a45'), 0.6)         # 의자 · 문
STEEL = material('steel',    srgb('#5d6268'), 0.35, 0.8)   # 다리
LOCK  = material('locker',   srgb('#7f8f9a'), 0.45, 0.3)
DARK  = material('dark',     srgb('#2a2523'), 0.5)
GLASS = material('glass',    srgb('#cfe3ea'), 0.1)
BRASS = material('brass',    srgb('#c9b07a'), 0.3, 0.9)

parts = []
def box(name, size, loc, mat, bevel=0.006, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        md = o.modifiers.new('bevel', 'BEVEL'); md.width = bevel; md.segments = 2; md.limit_method = 'ANGLE'
    o.data.materials.append(mat); parts.append(o); return o

def rod(name, r, h, loc, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=r, depth=h, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.data.materials.append(mat)
    bpy.ops.object.shade_smooth(); parts.append(o); return o

def join(name, x_offset):
    """만든 조각을 하나로 합치고 원점을 바닥 가운데로, 보기 좋게 옆으로 늘어놓는다."""
    global parts
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        for md in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=md.name)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    o = bpy.context.object; o.name = name; o.data.name = name
    scene.cursor.location = (0, 0, 0); bpy.ops.object.origin_set(type='ORIGIN_CURSOR')   # 원점 = 바닥 가운데
    o.location.x += x_offset
    parts = []
    return o

# ── 책상(윗판 72 × 50cm, 높이 74cm, 아래 책 넣는 칸) ──
box('top', (0.72, 0.50, 0.035), (0, 0, 0.74), LAM, 0.008)
box('edge', (0.73, 0.51, 0.012), (0, 0, 0.7225), EDGE, 0.003)
for dx in (-0.3, 0.3):
    for dy in (-0.19, 0.19):
        rod('leg', 0.014, 0.72, (dx, dy, 0.36), STEEL)
    box('rail', (0.025, 0.44, 0.025), (dx, 0, 0.70), STEEL, 0.004)
for dy in (-0.19, 0.19):
    box('bar', (0.60, 0.02, 0.02), (0, dy, 0.25), STEEL, 0.003)
box('tray', (0.58, 0.40, 0.012), (0, 0, 0.62), DARK, 0.003)
box('trayBack', (0.58, 0.012, 0.09), (0, -0.19, 0.665), DARK, 0.002)
for dx in (-0.29, 0.29):
    box('traySide', (0.012, 0.40, 0.09), (dx, 0, 0.665), DARK, 0.002)
join('desk', -1.6)

# ── 의자(앉는 판 높이 45cm, 등받이 살짝 뒤로) ──
box('seat', (0.42, 0.40, 0.03), (0, 0, 0.45), WOOD, 0.01, rot=(math.radians(-2.3), 0, 0))
box('back', (0.40, 0.022, 0.17), (0, -0.20, 0.70), WOOD, 0.008, rot=(math.radians(-8), 0, 0))
for dx in (-0.17, 0.17):
    box('post', (0.022, 0.022, 0.36), (dx, -0.20, 0.62), STEEL, 0.004, rot=(math.radians(-8), 0, 0))
for dx in (-0.18, 0.18):
    for dy in (-0.17, 0.17):
        rod('leg', 0.013, 0.45, (dx, dy, 0.225), STEEL)
    box('rail', (0.02, 0.34, 0.02), (dx, 0, 0.20), STEEL, 0.003)
box('bar', (0.36, 0.02, 0.02), (0, 0.17, 0.20), STEEL, 0.003)
join('chair', -0.6)

# ── 사물함(폭 1.1m · 깊이 0.5m · 높이 1.3m, 칸 문 4개) ──
box('body', (1.1, 0.5, 1.3), (0, 0, 0.65), LOCK, 0.01)
for i, x in enumerate((-0.4, -0.133, 0.133, 0.4)):
    box('door', (0.25, 0.012, 1.18), (x, 0.252, 0.65), LOCK, 0.004)
    for z in (1.05, 0.95):
        box('vent', (0.14, 0.006, 0.012), (x, 0.26, z), DARK, 0)
    box('handle', (0.012, 0.02, 0.08), (x + 0.09, 0.265, 0.65), STEEL, 0.002)
join('locker', 0.6)

# ── 교실 문(1.08 × 2.14m, 유리창 · 손잡이) — 문틀은 시험장이 따로 그린다 ──
box('panel', (1.08, 0.05, 2.14), (0, 0, 1.07), WOOD, 0.006)
box('glass', (0.36, 0.056, 0.5), (0, 0, 1.55), GLASS, 0)
box('kick', (1.0, 0.056, 0.12), (0, 0, 0.12), DARK, 0.003)
for y in (0.03, -0.03):
    box('knob', (0.16, 0.03, 0.05), (-0.36, y, 1.05), BRASS, 0.006)
join('door', 1.9)

out = os.path.join(os.path.expanduser('~'), 'everykoreans_classroom.glb')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False, export_apply=True, export_yup=True)
print('저장했어요 →', out)
