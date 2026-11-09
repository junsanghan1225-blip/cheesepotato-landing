# .glb(Blender 에서 만든 교실 소품) → 시험장이 바로 읽는 가벼운 JSON(assets/3d/classroom.json).
#
#   python3 tools/blender/glb-to-json.py <입력.glb> assets/3d/classroom.json      (bpy 가 깔린 파이썬)
#
# 왜 .glb 를 그대로 안 쓰나: 브라우저에서 .glb 를 읽으려면 three.js 의 GLTFLoader(4천 줄)를 따로 들여와야 하는데,
# 이 사이트는 CSP 때문에 import map 을 못 쓰고, 로더가 three 를 다른 주소로 한 번 더 불러오면 깨진다.
# 그래서 물체 이름(desk · chair · locker · door)마다 재질별로 삼각형만 뽑아 three 좌표(+Y 위, 앞쪽 -Z)로 바꿔 둔다.
# 시험장(exam-room.js)은 이것을 BufferGeometry 로 만들어 자리마다 InstancedMesh 로 놓는다.
import bpy, json, sys, os

src, out = sys.argv[-2], sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)

OUTDIR = os.path.dirname(os.path.abspath(sys.argv[-1]))
saved = {}
def diffuse_map(m):
    """재질의 Base Color 에 그림(Poly Haven 나무결 등)이 이어져 있으면 512px JPG 로 assets/3d/ 에 저장하고 파일 이름을 돌려준다."""
    if not m or not m.use_nodes: return None
    b = m.node_tree.nodes.get('Principled BSDF')
    if not b or not b.inputs['Base Color'].is_linked: return None
    n = b.inputs['Base Color'].links[0].from_node
    if n.type != 'TEX_IMAGE' or not n.image: return None
    im = n.image; name = ''.join(ch for ch in im.name if ch.isalnum() or ch in '_-') + '.jpg'
    if name not in saved:
        cp = im.copy(); cp.scale(512, 512)   # 폰에 가볍게 — 1K → 512
        cp.filepath_raw = os.path.join(OUTDIR, name); cp.file_format = 'JPEG'
        st = bpy.context.scene.render.image_settings; st.file_format = 'JPEG'; st.quality = 80
        cp.save_render(os.path.join(OUTDIR, name)); saved[name] = True
    return name

def col(m):
    if not m: return [0.7, 0.7, 0.7], 0.6, 0.0
    b = m.node_tree.nodes.get('Principled BSDF') if m.use_nodes and m.node_tree else None
    if b:
        c = b.inputs['Base Color'].default_value
        return [round(c[0], 4), round(c[1], 4), round(c[2], 4)], round(b.inputs['Roughness'].default_value, 3), round(b.inputs['Metallic'].default_value, 3)
    c = m.diffuse_color; return [c[0], c[1], c[2]], 0.6, 0.0

res = {}
for o in bpy.context.scene.objects:
    if o.type != 'MESH' or o.name.split('.')[0] not in ('desk', 'chair', 'locker', 'door'): continue
    name = o.name.split('.')[0]
    me = o.data; me.calc_loop_triangles()
    cn = me.corner_normals if hasattr(me, 'corner_normals') else None   # 모서리마다의 법선(각진 곳은 각지게, 둥근 다리는 둥글게)
    uvl = me.uv_layers.active
    parts = {}
    for tri in me.loop_triangles:
        p = parts.setdefault(tri.material_index, {'pos': [], 'nrm': [], 'uv': []})
        for li in tri.loops:
            v = me.vertices[me.loops[li].vertex_index].co
            n = cn[li].vector if cn else me.loops[li].normal
            p['pos'] += [round(v.x, 4), round(v.z, 4), round(-v.y, 4)]   # Blender(Z 위) → three(Y 위, 앞 -Z)
            p['nrm'] += [round(n.x, 3), round(n.z, 3), round(-n.y, 3)]
            if uvl: u = uvl.data[li].uv; p['uv'] += [round(u.x, 4), round(u.y, 4)]
    out_parts = []
    for mi, p in sorted(parts.items()):
        m = o.data.materials[mi] if mi < len(o.data.materials) else None
        rgb, rough, metal = col(m)
        mp = diffuse_map(m)
        e = {'mat': m.name if m else '', 'rgb': [1, 1, 1] if mp else rgb, 'rough': rough, 'metal': metal, 'pos': p['pos'], 'nrm': p['nrm']}
        if mp and p['uv']: e['map'] = mp; e['uv'] = p['uv']
        out_parts.append(e)
    res[name] = out_parts
    print(name, sum(len(p['pos']) // 9 for p in out_parts), '삼각형')

json.dump(res, open(out, 'w'), separators=(',', ':'))
print('→', out)
