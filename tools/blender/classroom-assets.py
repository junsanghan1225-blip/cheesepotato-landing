# 3D 시험장 교실 소품 — Blender 에서 한 번 돌리면 책상 · 의자 · 사물함 · 교실 문 네 개를 만들고
# 바로 .glb 하나로 내보낸다(운영자 2026-11-09 「방법 1로 해줘」 — 스크립트는 Claude, 실행은 운영자).
#
# 쓰는 법
#   1. Blender 를 열고 위쪽 탭에서 Scripting 을 누른다.
#   2. 가운데 글 칸에서 + New → 이 파일 내용을 통째로 붙여 넣는다.
#   3. ▶(Run Script) 를 누른다. 장면의 물체가 지워지고 소품 네 개가 나란히 생긴다.
#   4. 홈 폴더에 everykoreans_classroom.glb 가 저장된다(아래 줄에 경로가 나온다).
#      그 파일을 Claude 대화에 올리면 된다. 모양을 손보고 싶으면 손본 뒤
#      File → Export → glTF 2.0 (.glb) 로 같은 이름으로 다시 저장해도 된다.
#
# 약속(시험장 코드와 맞추는 것 — 바꾸면 Claude 에게 알려 준다)
#   - 단위는 미터, 물체마다 원점은 바닥 한가운데.
#   - 학생이 보는 쪽(칠판 쪽)은 Blender 의 +Y. (glTF 로 나가면 three.js 의 -Z 가 된다.)
#   - 이름: desk · chair · locker · door. 시험장은 이 이름으로 찾는다.
#   - 폰에서도 가볍게 — 모서리 둥글림은 2단만, 다리는 8각.
#
# 2026-11-09 고침: Blender 5.2 창에서 「'Context' object has no attribute」 오류 — 장면을 새로 여는 명령과
#   bpy.ops 로 상자를 만드는 방식이 창의 상태(context)에 기대서 났다. 이제 bmesh 로 직접 만든다(창 상태와 상관없음).

import bpy, bmesh, os, math
from mathutils import Matrix, Vector

# ── 장면 비우기(물체만 — 창 설정은 그대로) ──
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
for m in list(bpy.data.meshes):
    if m.users == 0: bpy.data.meshes.remove(m)

def srgb(h):  # '#d9c49a' → 선형 RGB
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)

MATS = []
def material(name, hexcolor, rough=0.6, metal=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    if b:
        b.inputs['Base Color'].default_value = (*srgb(hexcolor), 1)
        b.inputs['Roughness'].default_value = rough
        b.inputs['Metallic'].default_value = metal
    m.diffuse_color = (*srgb(hexcolor), 1)
    MATS.append(m)
    return len(MATS) - 1   # 재질 번호

LAM   = material('laminate', '#d8c39a', 0.55)        # 책상 윗판(밝은 무늬목)
EDGE  = material('edge',     '#8f765a', 0.5)
WOOD  = material('wood',     '#b07a45', 0.6)         # 의자 · 문
STEEL = material('steel',    '#5d6268', 0.35, 0.8)   # 다리
LOCK  = material('locker',   '#7f8f9a', 0.45, 0.3)
DARK  = material('dark',     '#2a2523', 0.5)
GLASS = material('glass',    '#cfe3ea', 0.1)
BRASS = material('brass',    '#c9b07a', 0.3, 0.9)

class Asset:
    """조각을 bmesh 하나에 모은다. 조각마다 따로 만들어(둥글리기 · 재질) 붙인다."""
    def __init__(self): self.bm = bmesh.new()
    def _place(self, part, loc, rot, mi, smooth):
        if rot != (0, 0, 0):
            R = Matrix.Rotation(rot[2], 4, 'Z') @ Matrix.Rotation(rot[1], 4, 'Y') @ Matrix.Rotation(rot[0], 4, 'X')
            bmesh.ops.transform(part, matrix=R, verts=part.verts)
        bmesh.ops.translate(part, vec=Vector(loc), verts=part.verts)
        for f in part.faces: f.material_index = mi; f.smooth = smooth
        tmp = bpy.data.meshes.new('_tmp'); part.to_mesh(tmp); part.free()
        self.bm.from_mesh(tmp); bpy.data.meshes.remove(tmp)
    def box(self, size, loc, mi, bevel=0.006, rot=(0, 0, 0)):
        p = bmesh.new(); bmesh.ops.create_cube(p, size=1.0)
        bmesh.ops.scale(p, vec=Vector(size), verts=p.verts)
        if bevel:
            bmesh.ops.bevel(p, geom=list(p.edges), offset=min(bevel, min(size) * 0.45), segments=2, profile=0.5, affect='EDGES')
        self._place(p, loc, rot, mi, False)
    def rod(self, r, h, loc, mi, rot=(0, 0, 0)):
        p = bmesh.new(); bmesh.ops.create_cone(p, cap_ends=True, segments=8, radius1=r, radius2=r, depth=h)
        self._place(p, loc, rot, mi, True)
    def finish(self, name, x_offset):
        me = bpy.data.meshes.new(name); self.bm.to_mesh(me); self.bm.free()
        for m in MATS: me.materials.append(m)
        o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
        o.location.x = x_offset   # 보기 좋게 옆으로 늘어놓기(원점은 그대로 바닥 가운데)
        return o

rad = math.radians

# ── 책상(윗판 72 × 50cm, 높이 74cm, 아래 책 넣는 칸) ──
a = Asset()
a.box((0.72, 0.50, 0.035), (0, 0, 0.74), LAM, 0.008)
a.box((0.73, 0.51, 0.012), (0, 0, 0.7225), EDGE, 0.003)
for dx in (-0.3, 0.3):
    for dy in (-0.19, 0.19):
        a.rod(0.014, 0.72, (dx, dy, 0.36), STEEL)
    a.box((0.025, 0.44, 0.025), (dx, 0, 0.70), STEEL, 0.004)
for dy in (-0.19, 0.19):
    a.box((0.60, 0.02, 0.02), (0, dy, 0.25), STEEL, 0.003)
a.box((0.58, 0.40, 0.012), (0, 0, 0.62), DARK, 0.003)
a.box((0.58, 0.012, 0.09), (0, -0.19, 0.665), DARK, 0.002)
for dx in (-0.29, 0.29):
    a.box((0.012, 0.40, 0.09), (dx, 0, 0.665), DARK, 0.002)
a.finish('desk', -1.6)

# ── 의자(앉는 판 높이 45cm, 등받이 살짝 뒤로) ──
a = Asset()
a.box((0.42, 0.40, 0.03), (0, 0, 0.45), WOOD, 0.01, rot=(rad(-2.3), 0, 0))
a.box((0.40, 0.022, 0.17), (0, -0.20, 0.70), WOOD, 0.008, rot=(rad(-8), 0, 0))
for dx in (-0.17, 0.17):
    a.box((0.022, 0.022, 0.36), (dx, -0.20, 0.62), STEEL, 0.004, rot=(rad(-8), 0, 0))
for dx in (-0.18, 0.18):
    for dy in (-0.17, 0.17):
        a.rod(0.013, 0.45, (dx, dy, 0.225), STEEL)
    a.box((0.02, 0.34, 0.02), (dx, 0, 0.20), STEEL, 0.003)
a.box((0.36, 0.02, 0.02), (0, 0.17, 0.20), STEEL, 0.003)
a.finish('chair', -0.6)

# ── 사물함(폭 1.1m · 깊이 0.5m · 높이 1.3m, 칸 문 4개) ──
a = Asset()
a.box((1.1, 0.5, 1.3), (0, 0, 0.65), LOCK, 0.01)
for x in (-0.4, -0.133, 0.133, 0.4):
    a.box((0.25, 0.012, 1.18), (x, 0.252, 0.65), LOCK, 0.004)
    for z in (1.05, 0.95):
        a.box((0.14, 0.006, 0.012), (x, 0.26, z), DARK, 0)
    a.box((0.012, 0.02, 0.08), (x + 0.09, 0.265, 0.65), STEEL, 0.002)
a.finish('locker', 0.6)

# ── 교실 문(1.08 × 2.14m, 유리창 · 손잡이) — 문틀은 시험장이 따로 그린다 ──
a = Asset()
a.box((1.08, 0.05, 2.14), (0, 0, 1.07), WOOD, 0.006)
a.box((0.36, 0.056, 0.5), (0, 0, 1.55), GLASS, 0)
a.box((1.0, 0.056, 0.12), (0, 0, 0.12), DARK, 0.003)
for y in (0.03, -0.03):
    a.box((0.16, 0.03, 0.05), (-0.36, y, 1.05), BRASS, 0.006)
a.finish('door', 1.9)

out = os.path.join(os.path.expanduser('~'), 'everykoreans_classroom.glb')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False, export_apply=True, export_yup=True)
print('저장했어요 →', out)
try:
    bpy.context.window_manager.popup_menu(lambda self, ctx: self.layout.label(text=out), title='저장했어요 · Saved', icon='CHECKMARK')
except Exception:
    pass
