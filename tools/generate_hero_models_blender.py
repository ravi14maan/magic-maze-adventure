#!/usr/bin/env python3
"""Create polished original Blender-built hero models and transparent portrait renders.

Run with: blender --background --python tools/generate_hero_models_blender.py
Creates one GLB and one PNG preview for each of the 12 art-ready heroes.
"""
import bpy
import math
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path.cwd()
OUT = ROOT / "public/assets/characters3d"
PREVIEWS = OUT / "previews"
OUT.mkdir(parents=True, exist_ok=True)
PREVIEWS.mkdir(parents=True, exist_ok=True)

HEROES = [
    ("normal-girl", "Mira the Explorer", "#F0B58F", "#6A382D", "#E85D9B", "#FFD4E8", "girl"),
    ("normal-boy", "Leo the Maze Master", "#D99F78", "#493027", "#347CC7", "#FFD66E", "boy"),
    ("unicorn", "Starlight Unicorn", "#FFF0F8", "#D77BC1", "#A77BE8", "#F9D66B", "unicorn"),
    ("witch", "Willow the Spellkeeper", "#E9B18F", "#39264D", "#594080", "#A8E5E8", "witch"),
    ("princess", "Princess Rosalia", "#F0B58F", "#81452F", "#E77EAE", "#F7D36C", "princess"),
    ("mermaid", "Coral the Mermaid", "#E4AD88", "#174E59", "#25AFA8", "#F3A4C8", "mermaid"),
    ("fairy", "Luna the Fairy", "#EFB99C", "#81518F", "#72CDB5", "#F7E59A", "fairy"),
    ("dragon-rider", "Ember the Dragon Rider", "#D9A17D", "#653C2D", "#278E7B", "#F2A65C", "dragon"),
    ("star-explorer", "Nova the Star Explorer", "#DCA987", "#392F48", "#315DAD", "#70D8F2", "space"),
    ("crystal-knight", "Crystal Knight", "#E6B393", "#56445E", "#7789BC", "#B9EAF5", "knight"),
    ("prince", "Prince Adrian", "#EDB58F", "#70422D", "#466CB5", "#F2CE68", "prince"),
    ("ice-mage", "Aurora the Ice Mage", "#EEC4AE", "#9BCBE0", "#65A9D7", "#E8FAFF", "ice"),
]

def rgba(hexv):
    h = hexv.lstrip("#")
    return tuple(int(h[i:i+2], 16)/255 for i in (0,2,4)) + (1,)

def mat(name, color, metallic=0.0, rough=0.42, subsurface=0.0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = rgba(color)
    m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value = rgba(color)
    bs.inputs["Metallic"].default_value = metallic
    bs.inputs["Roughness"].default_value = rough
    if "Subsurface Weight" in bs.inputs:
        bs.inputs["Subsurface Weight"].default_value = subsurface
    return m

def assign(obj, material):
    obj.data.materials.append(material)
    if obj.type == "MESH":
        for p in obj.data.polygons:
            p.use_smooth = True
    return obj

def uv(name, loc, scale, material, segments=32, rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return assign(o, material)

def rounded_box(name, loc, scale, material, bevel=0.08):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mod = o.modifiers.new("Soft rounded edges", "BEVEL")
    mod.width = bevel
    mod.segments = 4
    o.modifiers.new("Weighted corner normals", "WEIGHTED_NORMAL")
    return assign(o, material)

def cone(name, loc, radius, depth, material, vertices=32, rotation=None):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=0.0, depth=depth, location=loc)
    o = bpy.context.object
    o.name = name
    if rotation: o.rotation_euler = rotation
    bevel = o.modifiers.new("Polished edge", "BEVEL")
    bevel.width = 0.025
    bevel.segments = 3
    o.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
    return assign(o, material)

def curve(name, points, bevel, material, cyclic=False):
    c = bpy.data.curves.new(name, "CURVE")
    c.dimensions = "3D"
    c.resolution_u = 16
    c.bevel_depth = bevel
    c.bevel_resolution = 4
    s = c.splines.new("BEZIER")
    s.bezier_points.add(len(points)-1)
    for bp, p in zip(s.bezier_points, points):
        bp.co = p
        bp.handle_left_type = "AUTO"
        bp.handle_right_type = "AUTO"
    s.use_cyclic_u = cyclic
    o = bpy.data.objects.new(name, c)
    bpy.context.collection.objects.link(o)
    return assign(o, material)

def torus(name, loc, major, minor, material, rotation=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=48, minor_segments=12, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    return assign(o, material)

def make_hero(hero):
    ident, display, skin_hex, hair_hex, cloth_hex, accent_hex, style = hero
    skin = mat("Skin | " + ident, skin_hex, rough=.52, subsurface=.07)
    hair = mat("Hair | " + ident, hair_hex, rough=.3)
    cloth = mat("Costume | " + ident, cloth_hex, rough=.38)
    accent = mat("Signature accent | " + ident, accent_hex, metallic=.22, rough=.27)
    dark = mat("Eye and boot detail | " + ident, "#35283B", rough=.25)
    white = mat("Eye whites | " + ident, "#FFFDFB", rough=.2)
    iris = mat("Iris | " + ident, "#4C79B8", rough=.22)
    blush = mat("Rosy cheeks | " + ident, "#F28FA0", rough=.55)
    gold = mat("Warm gold | " + ident, "#F5C85F", metallic=.72, rough=.24)
    silver = mat("Silver | " + ident, "#C9D9EA", metallic=.8, rough=.22)
    sole = mat("Boot soles | " + ident, "#49384B", rough=.6)

    # Silhouette and layered costume
    if style == "mermaid":
        uv("Tail | pearlescent body", (0,0,.60), (.245,.23,.48), cloth)
        uv("Tail fin left", (-.16,-.005,.20), (.23,.08,.14), accent)
        uv("Tail fin right", (.16,-.005,.20), (.23,.08,.14), accent)
        cone("Tail fin tip", (0,0,.12), .20, .34, accent)
    else:
        for x, side in [(-.17,"left"),(.17,"right")]:
            uv(side+" boot", (x,-.025,.12), (.16,.24,.14), accent if style in ("knight","space") else cloth)
            uv(side+" boot sole", (x,-.04,.045), (.16,.22,.045), sole)
            uv(side+" leg", (x,.015,.38), (.105,.12,.28), skin)
            uv(side+" knee pad", (x,-.085,.48), (.115,.055,.10), accent)
    uv("Body | tailored torso", (0,0,.91), (.315,.225,.38), cloth)
    uv("Waist sash", (0,-.012,.70), (.325,.235,.105), accent)
    uv("Collar", (0,-.015,1.205), (.19,.22,.095), accent)
    # Fine costume seams and decorative buttons
    curve("Gold piping", [(-.23,-.205,1.08),(0,-.238,.99),(.23,-.205,1.08)], .012, gold)
    for z in (.86,.96,1.06):
        uv("Costume jewel", (0,-.231,z), (.035,.018,.035), gold, 20, 12)
    # Arms with rounded sleeves, cuffs and hands
    for x, side in [(-1,"left"),(1,"right")]:
        uv(side+" upper sleeve", (x*.29,-.005,1.04), (.125,.145,.22), cloth)
        uv(side+" cuff", (x*.405,-.025,.82), (.105,.12,.075), accent)
        uv(side+" hand", (x*.43,-.035,.73), (.09,.085,.10), skin)
        curve(side+" arm seam", [(x*.25,-.14,1.10),(x*.34,-.15,.98),(x*.42,-.12,.84)], .009, gold)
    uv("Neck", (0,-.005,1.285), (.12,.13,.14), skin)
    uv("Head | soft sculpt", (0,-.015,1.64), (.355,.305,.385), skin, 48, 32)
    # Ears
    for x in (-.345,.345):
        uv("Ear", (x,-.005,1.65), (.09,.075,.13), skin)
        uv("Ear inner", (x*1.06,-.069,1.65), (.045,.025,.075), blush, 20, 12)
    # Eyes, iris, catchlights, brows and smile are oriented to the front (-Y).
    for x in (-.135,.135):
        uv("Eye white", (x,-.295,1.70), (.074,.036,.091), white, 32, 20)
        uv("Iris", (x,-.328,1.697), (.044,.022,.059), iris, 28, 18)
        uv("Pupil", (x,-.347,1.696), (.022,.012,.035), dark, 24, 16)
        uv("Eye sparkle", (x-.012,-.359,1.723), (.012,.008,.016), white, 16, 12)
        curve("Expressive eyebrow", [(x-.06,-.306,1.82),(x,-.323,1.84),(x+.06,-.306,1.82)], .012, hair)
        uv("Cheek blush", (x*1.85,-.289,1.565), (.061,.018,.032), blush, 20, 12)
    uv("Nose", (0,-.324,1.605), (.032,.026,.036), skin, 20, 12)
    curve("Warm smile", [(-.075,-.311,1.535),(0,-.326,1.515),(.075,-.311,1.535)], .012, dark)
    # Hair cap, sculpted fringe and flowing locks
    uv("Hair cap", (0,.045,1.91), (.37,.30,.225), hair, 40, 28)
    uv("Swept fringe", (-.10,-.253,1.84), (.23,.09,.12), hair)
    uv("Fringe curl", (.105,-.267,1.82), (.13,.075,.10), hair)
    if style in ("girl","princess","fairy","mermaid","witch","ice","dragon"):
        for x in (-.30,.30):
            uv("Long flowing hair", (x,.015,1.61), (.125,.17,.31), hair)
            for j in range(3):
                curve("Hair strand", [(x*.95,-.13,1.80-j*.035),(x*1.05,-.145,1.62-j*.045),(x*.98,-.11,1.43-j*.055)], .012, accent if j==0 else hair)
    # Hero-specific costume silhouettes and unmistakable accessories
    if style == "girl":
        uv("Hair bow", (-.27,-.13,1.98), (.12,.055,.10), accent)
        uv("Bow knot", (-.27,-.19,1.98), (.035,.025,.04), gold)
        uv("Backpack", (0,.23,.97), (.23,.12,.25), accent)
        rounded_box("Backpack clasp", (0,-.241,.93), (.10,.025,.09), gold)
    elif style == "boy":
        rounded_box("Explorer vest", (0,-.218,.96), (.40,.055,.36), accent, .10)
        curve("Vest piping", [(-.17,-.255,1.11),(0,-.26,.97),(.17,-.255,1.11)], .012, gold)
        uv("Explorer compass", (.12,-.275,.89), (.055,.025,.055), gold)
        rounded_box("Mini backpack", (0,.22,.97), (.35,.12,.36), hair)
    elif style == "unicorn":
        uv("Muzzle", (0,-.29,1.55), (.22,.12,.14), white)
        cone("Golden horn", (0,-.005,2.15), .10, .38, gold)
        for x in (-.24,.24):
            cone("Unicorn ear", (x,0,2.02), .09, .24, white, rotation=(0,0,x*-.35))
            uv("Inner ear", (x,-.075,2.04), (.045,.02,.09), blush)
        for i in range(5):
            uv("Rainbow mane lock", ((i-2)*.105,.18,1.95-(i%2)*.08), (.10,.12,.20), [accent,cloth,gold,hair,white][i])
        torus("Golden neck collar", (0,-.21,1.28), .18,.025,gold, (math.pi/2,0,0))
    elif style == "witch":
        torus("Hat brim", (0,0,2.00), .34,.055,hair)
        cone("Pointed witch hat", (0,.015,2.23), .27,.55,hair)
        uv("Hat jewel", (0,-.278,2.02), (.07,.025,.07), accent)
        curve("Wand shaft", [(.47,-.06,.72),(.50,-.06,1.28)], .025, hair)
        uv("Wand crystal", (.50,-.06,1.33), (.095,.075,.095), accent)
        for k in range(4):
            uv("Wand sparkle", (.50+(k-1.5)*.07,-.07,1.34+(k%2)*.10), (.025,.02,.025), gold, 16, 10)
    elif style == "princess":
        uv("Royal overskirt", (0,.01,.61), (.42,.30,.28), cloth)
        cone("Dress skirt", (0,0,.56), .43,.60, cloth)
        torus("Dress hem", (0,0,.29), .32,.025,accent)
        torus("Tiara band", (0,0,2.00), .20,.035,gold)
        for x in (-.16,0,.16):
            cone("Tiara point", (x,-.01,2.12), .07,.22,gold)
        uv("Tiara gemstone", (0,-.20,2.04), (.055,.025,.07), accent)
        uv("Shoulder puff", (-.28,0,1.16), (.13,.15,.13), accent)
        uv("Shoulder puff", (.28,0,1.16), (.13,.15,.13), accent)
    elif style == "mermaid":
        torus("Shell belt", (0,-.20,1.22), .20,.035,gold, (math.pi/2,0,0))
        for x in (-.12,.12):
            uv("Shell top", (x,-.22,1.13), (.12,.07,.11), accent)
            curve("Shell detail", [(x-.06,-.28,1.10),(x,-.30,1.17),(x+.06,-.28,1.10)], .009, white)
        for i in range(5):
            uv("Pearl hair bead", ((i-2)*.09,-.19,1.97), (.035,.03,.035), gold, 16, 10)
    elif style == "fairy":
        for x in (-1,1):
            uv("Upper fairy wing", (x*.47,.12,1.28), (.25,.075,.34), accent)
            uv("Lower fairy wing", (x*.45,.13,.96), (.20,.065,.25), white)
            curve("Wing vein", [(x*.30,.045,1.02),(x*.47,.035,1.25),(x*.60,.045,1.48)], .012, gold)
        curve("Fairy wand", [(.48,-.05,.72),(.55,-.05,1.28)], .02, gold)
        uv("Fairy wand star", (.55,-.05,1.33), (.10,.04,.10), accent)
        torus("Flower crown", (0,0,2.00), .22,.025,gold)
    elif style == "dragon":
        uv("Rider satchel", (-.29,.18,.96), (.16,.14,.25), accent)
        # A tiny friendly dragon companion perched beside the rider
        uv("Dragon body", (.49,.06,1.28), (.22,.17,.19), mat("Dragon jade", "#54B88F"))
        uv("Dragon head", (.56,-.04,1.48), (.17,.14,.16), mat("Dragon mint", "#72D7A7"))
        for x in (.49,.63):
            uv("Dragon eye", (x,-.171,1.50), (.025,.014,.03), dark, 16, 12)
        cone("Dragon horn", (.52,.02,1.63), .07,.16,gold)
        uv("Dragon wing", (.38,.18,1.43), (.16,.055,.20), mat("Dragon coral", "#E88A70"))
        curve("Dragon tail", [(.60,.12,1.20),(.78,.12,1.10),(.77,.10,.99)], .035, mat("Dragon jade tail", "#54B88F"))
    elif style == "space":
        uv("Space helmet shell", (0,.05,1.72), (.43,.36,.43), silver)
        uv("Helmet glass", (0,-.265,1.69), (.29,.07,.25), mat("Visor glass", "#83DDF0", metallic=.2, rough=.14))
        rounded_box("Life support pack", (0,.27,.98), (.42,.20,.48), accent)
        uv("Chest star", (0,-.267,.99), (.10,.03,.10), gold)
        for x in (-.13,.13):
            rounded_box("Jet pack thruster", (x,.27,.68), (.09,.13,.18), silver)
            uv("Thruster glow", (x,.27,.57), (.045,.05,.05), accent)
        torus("Helmet halo", (0,.03,1.72), .43,.025,gold, (math.pi/2,0,0))
    elif style == "knight":
        uv("Crystal helmet", (0,.04,1.89), (.40,.34,.30), silver)
        rounded_box("Helmet visor", (0,-.276,1.77), (.40,.06,.10), dark)
        uv("Helmet crest", (0,-.01,2.17), (.11,.10,.15), accent)
        rounded_box("Shield", (-.52,-.10,.99), (.30,.13,.46), accent)
        uv("Shield jewel", (-.52,-.18,1.02), (.09,.035,.12), gold)
        curve("Shield filigree", [(-.62,-.18,1.15),(-.52,-.19,.86),(-.42,-.18,1.15)], .012, silver)
        curve("Sword", [(.48,-.07,.69),(.48,-.07,1.35)], .035, silver)
        rounded_box("Sword guard", (.48,-.07,.86), (.23,.07,.045), gold)
    elif style == "prince":
        uv("Royal cape", (0,.24,.98), (.34,.10,.48), mat("Cape velvet", "#A94E76"))
        torus("Crown band", (0,0,2.00), .20,.035,gold)
        for x in (-.15,0,.15): cone("Crown tip", (x,0,2.12), .07,.20,gold)
        uv("Cape clasp", (0,-.25,1.18), (.07,.035,.07), accent)
        curve("Royal sash", [(-.12,-.24,1.13),(0,-.255,.98),(.12,-.24,.83)], .025, gold)
        curve("Ceremonial sword", [(.48,-.05,.70),(.48,-.05,1.30)], .027, silver)
    elif style == "ice":
        uv("Ice mage hood", (0,.08,1.79), (.43,.36,.44), mat("Frost hood", "#8EC9E5"))
        uv("Hood trim", (0,-.265,1.69), (.34,.07,.34), white)
        uv("Ice medallion", (0,-.265,1.00), (.13,.035,.13), accent)
        curve("Ice staff", [(.50,-.05,.63),(.50,-.05,1.62)], .035, silver)
        cone("Staff crystal", (.50,-.05,1.66), .12,.34, white)
        uv("Floating ice gem", (.65,.02,1.80), (.09,.08,.12), accent)
        for x in (-.28,.28): uv("Snowflake shoulder", (x,-.13,1.16), (.09,.04,.09), white)

    # Studio render-only soft shadow disc
    shadow_mat = mat("Soft shadow", "#A7A0BA", rough=1)
    shadow_mat.diffuse_color = (.45,.42,.55,.18)
    shadow_bs = shadow_mat.node_tree.nodes.get("Principled BSDF")
    shadow_bs.inputs["Alpha"].default_value = .18
    if hasattr(shadow_mat, "surface_render_method"):
        shadow_mat.surface_render_method = "DITHERED"
    uv("Ground shadow", (0,.03,.018), (.58,.32,.018), shadow_mat)
    return display

def setup_camera_and_lights():
    bpy.ops.object.camera_add(location=(3.3,-8.8,2.75))
    cam = bpy.context.object
    cam.name = "Portrait camera"
    target = Vector((0,0,1.12))
    direction = target - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z","Y").to_euler()
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 2.85
    bpy.context.scene.camera = cam
    def area(name, loc, power, size, color, target=(0,0,1.0)):
        bpy.ops.object.light_add(type="AREA", location=loc)
        light = bpy.context.object
        light.name = name
        light.data.energy = power
        light.data.shape = "DISK"
        light.data.size = size
        light.data.color = color
        light.rotation_euler = (Vector(target)-light.location).to_track_quat("-Z","Y").to_euler()
    area("Large soft key", ( -3.5,-4.5,6.0), 520, 4.2, (1.0,.82,.76))
    area("Cool fill", (4.0,-3.0,3.8), 340, 3.5, (.70,.84,1.0))
    area("Warm rim", (1.5,3.0,4.8), 620, 3.0, (1.0,.78,.48))

def build_one(hero):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    display = make_hero(hero)
    setup_camera_and_lights()
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.eevee.taa_render_samples = 96
    scene.render.resolution_x = 640
    scene.render.resolution_y = 768
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.view_settings.view_transform = "AgX"
    scene.render.image_settings.color_depth = "8"
    scene.camera.data.lens = 55
    ident = hero[0]
    scene.render.filepath = str(PREVIEWS / (ident + ".png"))
    bpy.ops.render.render(write_still=True)
    # Export only character geometry; camera and lights are intentionally excluded.
    bpy.ops.object.select_all(action="DESELECT")
    for obj in bpy.context.scene.objects:
        if obj.type in {"MESH","CURVE"} and obj.name != "Ground shadow":
            obj.select_set(True)
    bpy.context.view_layer.objects.active = next((o for o in bpy.context.selected_objects if o.type=="MESH"), None)
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.select_all(action="DESELECT")
    for obj in bpy.context.scene.objects:
        if obj.type == "MESH" and obj.name != "Ground shadow":
            obj.select_set(True)
    bpy.context.view_layer.objects.active = next((o for o in bpy.context.selected_objects if o.type=="MESH"), None)
    # GLB exporter uses the selected character mesh collection.
    bpy.ops.export_scene.gltf(filepath=str(OUT/(ident+".glb")), export_format="GLB", use_selection=True, export_apply=True)
    return {"id":ident,"name":display,"model":ident+".glb","preview":"previews/"+ident+".png",
            "model_bytes":(OUT/(ident+".glb")).stat().st_size,
            "preview_bytes":(PREVIEWS/(ident+".png")).stat().st_size,
            "rigged":False}

manifest={"schema_version":2,"generator":"Blender procedural character studio","art_direction":"Premium storybook 3D toy characters with sculpted rounded forms, layered costumes, expressive faces, detailed accessories, PBR materials and soft studio lighting.","coordinate_system":"Z-up GLB; face toward -Y; origin at floor.","models":[]}
for hero in HEROES:
    print("Building",hero[0],flush=True)
    manifest["models"].append(build_one(hero))
(OUT/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
print("Generated",len(HEROES),"detailed GLB hero models and transparent PNG renders.",flush=True)
