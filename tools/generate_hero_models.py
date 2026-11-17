#!/usr/bin/env python3
"""Procedurally generate the original Magic Maze Adventure 3D hero set.
Requires trimesh and numpy. Static meshes; skeletal rigging is a later milestone.
"""
from pathlib import Path
import json
import numpy as np
import trimesh

OUT = Path("public/assets/characters3d")
OUT.mkdir(parents=True, exist_ok=True)
HEROES = [
 ("normal-girl","Everyday Explorer Girl","#F2C5A5","#5B342B","#E86FA5","#F8CDE0","girl"),
 ("normal-boy","Curious Maze Boy","#DFAF88","#4A3027","#4389D6","#F4D36A","boy"),
 ("unicorn","Starlight Unicorn","#FFF0F7","#D98BCB","#B78AE8","#F9D66B","unicorn"),
 ("witch","Kind Spellkeeper","#E8B99B","#342747","#57407F","#A8E2E7","witch"),
 ("princess","Courageous Princess","#F2C5A5","#8B4B36","#E88DB7","#F7D66C","princess"),
 ("mermaid","Coral Mermaid","#E8B78F","#164E59","#26AFA9","#F2A5C6","mermaid"),
 ("fairy","Moonlit Fairy","#F1C5A8","#8A5A9C","#8ADBCB","#F8E7A1","fairy"),
 ("dragon-rider","Little Dragon Rider","#DCA77F","#633B2D","#2C9B82","#F2A85A","dragon"),
 ("star-explorer","Star Explorer","#DDAF91","#342C43","#385C9A","#70D5F2","space"),
 ("crystal-knight","Crystal Knight","#E7B99B","#55405C","#7787B9","#B8E9F5","knight"),
 ("prince","Brave Prince","#F0C19D","#70432D","#4C70B8","#F4D06D","prince"),
 ("ice-mage","Aurora Ice Mage","#EFC8B3","#A7D5E8","#75B7DF","#E8FAFF","ice"),
]

def material(color, metal=0):
    c = color.lstrip("#")
    rgba = tuple(int(c[i:i+2],16)/255 for i in (0,2,4)) + (1,)
    return trimesh.visual.material.PBRMaterial(baseColorFactor=rgba, metallicFactor=metal, roughnessFactor=.72)

def add(scene, name, mesh, color, metal=0):
    mesh.visual.material = material(color, metal)
    scene.add_geometry(mesh, node_name=name, geom_name=name)

def ball(s,n,p,scale,c,metal=0):
    m=trimesh.creation.icosphere(subdivisions=2,radius=1)
    m.apply_scale(scale); m.apply_translation(p); add(s,n,m,c,metal)

def rod(s,n,a,b,r,c,metal=0):
    a=np.array(a,float); b=np.array(b,float); d=b-a
    m=trimesh.creation.cylinder(radius=r,height=np.linalg.norm(d),sections=12)
    m.apply_transform(trimesh.geometry.align_vectors([0,0,1],d))
    m.apply_translation((a+b)/2); add(s,n,m,c,metal)

def cone(s,n,p,h,r,c,metal=0):
    m=trimesh.creation.cone(radius=r,height=h,sections=16)
    m.apply_translation([p[0],p[1],p[2]+h/2]); add(s,n,m,c,metal)

def box(s,n,p,size,c,metal=0):
    m=trimesh.creation.box(extents=size); m.apply_translation(p); add(s,n,m,c,metal)

def torus(s,n,p,major,minor,c,axis=(0,0,1)):
    try: m=trimesh.creation.torus(major_radius=major,minor_radius=minor,major_sections=24,minor_sections=8)
    except Exception: return
    m.apply_transform(trimesh.geometry.align_vectors([0,0,1],axis)); m.apply_translation(p); add(s,n,m,c)

def build(h):
    ident,name,skin,hair,cloth,accent,style=h
    s=trimesh.Scene()
    if style=="mermaid":
        ball(s,"tail",(0,0,.62),(.23,.24,.43),cloth)
        cone(s,"tail-fin",(0,0,.03),.34,.30,accent)
        ball(s,"fin-left",(-.18,0,.12),(.18,.09,.10),accent); ball(s,"fin-right",(.18,0,.12),(.18,.09,.10),accent)
    else:
        for x,side in [(-.17,"left"),(.17,"right")]:
            ball(s,side+"-boot",(x,-.01,.13),(.15,.23,.13),accent if style in ("knight","space") else cloth)
            rod(s,side+"-leg",(x,0,.18),(x,0,.60),.09,cloth)
    ball(s,"torso",(0,0,.91),(.34,.25,.39),cloth)
    ball(s,"collar",(0,-.005,1.20),(.20,.22,.10),accent)
    for x,side in [(-1,"left"),(1,"right")]:
        rod(s,side+"-arm",(x*.27,0,1.08),(x*.43,-.01,.77),.085,skin)
        ball(s,side+"-hand",(x*.43,-.01,.75),(.09,.09,.09),skin)
    ball(s,"neck",(0,0,1.28),(.12,.13,.13),skin)
    ball(s,"head",(0,-.005,1.63),(.36,.31,.38),skin)
    for x in (-.13,.13):
        ball(s,"eye-white-"+str(x),(x,-.292,1.68),(.062,.035,.075),"#FFFFFF")
        ball(s,"pupil-"+str(x),(x,-.325,1.68),(.027,.018,.043),"#342B35")
        ball(s,"cheek-"+str(x),(x*1.85,-.285,1.54),(.065,.018,.035),"#F29AA0")
    ball(s,"nose",(0,-.32,1.58),(.035,.035,.035),"#D99B7F")
    ball(s,"hair-cap",(0,.045,1.88),(.37,.30,.22),hair)
    ball(s,"fringe",(0,-.255,1.82),(.25,.10,.13),hair)
    if style in ("girl","princess","fairy","mermaid","witch","ice","dragon"):
        for x in (-.30,.30): ball(s,"long-hair-"+str(x),(x,.02,1.58),(.12,.15,.30),hair)
    if style=="unicorn":
        cone(s,"horn",(0,-.01,1.98),.42,.12,accent); ball(s,"muzzle",(0,-.30,1.53),(.22,.12,.13),"#FFF8FC")
        for x in (-.23,.23): ball(s,"ear-"+str(x),(x,0,1.94),(.10,.09,.15),"#FFF0F7")
        torus(s,"gold-necklace",(0,-.25,1.25),.17,.025,"#F8D66D")
    elif style=="witch":
        rod(s,"hat-brim-left",(-.34,0,1.97),(.34,0,1.97),.07,hair)
        cone(s,"witch-hat",(0,0,1.98),.55,.28,"#392B58")
        ball(s,"hat-buckle",(0,-.275,2.0),(.08,.025,.06),accent,.35)
        rod(s,"wand",(.48,-.04,.72),(.54,-.04,1.34),.025,"#8A5B3B")
        ball(s,"wand-star",(.54,-.04,1.39),(.10,.08,.10),accent,.3)
    elif style=="princess":
        cone(s,"gown-skirt",(0,0,.54),.62,.48,cloth)
        for x in (-.16,0,.16): cone(s,"crown-point-"+str(x),(x,-.02,1.98),.22,.09,accent,.3)
        torus(s,"crown-band",(0,0,1.96),.19,.035,accent)
        ball(s,"crown-gem",(0,-.19,2.02),(.055,.035,.07),"#D94C87",.25)
    elif style=="mermaid":
        torus(s,"shell-belt",(0,-.22,1.23),.19,.035,accent)
        for x in (-.12,.12): ball(s,"shell-"+str(x),(x,-.235,1.12),(.12,.08,.11),"#F6B4C8")
    elif style=="fairy":
        for x in (-1,1):
            ball(s,"upper-wing-"+str(x),(x*.47,.10,1.27),(.22,.07,.34),"#B9F0E7")
            ball(s,"lower-wing-"+str(x),(x*.48,.11,.98),(.18,.06,.25),"#E6D4F8")
        rod(s,"fairy-wand",(.5,-.05,.7),(.57,-.05,1.25),.02,accent)
        ball(s,"wand-gem",(.57,-.05,1.30),(.09,.07,.09),accent,.25)
    elif style=="dragon":
        ball(s,"baby-dragon-body",(.47,.08,1.30),(.22,.16,.19),"#55B98D")
        ball(s,"baby-dragon-head",(.55,-.01,1.49),(.16,.14,.15),"#63C99A")
        cone(s,"dragon-horn",(.52,.02,1.61),.16,.07,"#F3C46C")
        ball(s,"dragon-wing",(.35,.18,1.45),(.16,.05,.20),"#E98B68")
        box(s,"rider-belt",(0,-.255,.91),(.48,.045,.09),accent)
    elif style=="space":
        torus(s,"helmet-rim",(0,0,1.69),.37,.055,accent,(1,0,0))
        ball(s,"helmet-glass",(0,-.285,1.68),(.25,.045,.20),"#8ADCF3",.25)
        box(s,"jetpack",(0,.26,.96),(.42,.20,.48),"#526EAA",.2)
        for x in (-.14,.14): rod(s,"thruster-"+str(x),(x,.26,.68),(x,.26,.54),.07,accent,.2)
        ball(s,"chest-star",(0,-.265,.98),(.10,.035,.10),"#F7D76C",.2)
    elif style=="knight":
        ball(s,"helmet",(0,.02,1.88),(.39,.32,.28),"#A9B9D2",.55)
        box(s,"visor",(0,-.285,1.76),(.38,.055,.09),"#52617C",.55)
        ball(s,"helmet-crystal",(0,-.02,2.12),(.10,.09,.13),accent,.45)
        box(s,"shield",(-.52,-.08,.95),(.28,.12,.42),"#8E82C8",.35)
        ball(s,"shield-gem",(-.52,-.155,.99),(.08,.035,.11),accent,.45)
        rod(s,"training-sword",(.46,-.08,.72),(.46,-.08,1.28),.035,"#DCEAF7",.55)
    elif style=="prince":
        ball(s,"cape",(0,.20,.95),(.34,.10,.47),"#A94F76")
        torus(s,"crown-band",(0,0,1.97),.20,.035,accent)
        for x in (-.15,0,.15): cone(s,"crown-tip-"+str(x),(x,0,1.98),.20,.07,accent,.3)
        box(s,"royal-sash",(0,-.255,.98),(.12,.05,.45),accent)
        rod(s,"toy-sword",(.49,-.03,.75),(.49,-.03,1.22),.028,"#E8EDF5",.4)
    elif style=="ice":
        ball(s,"ice-hood",(0,.08,1.75),(.43,.35,.43),"#8FCBE8")
        ball(s,"hood-face",(0,-.265,1.65),(.31,.07,.31),skin)
        ball(s,"ice-medallion",(0,-.285,1.00),(.13,.05,.13),accent,.25)
        rod(s,"ice-staff",(.50,-.04,.65),(.50,-.04,1.62),.035,"#B9E7F7",.25)
        cone(s,"staff-crystal",(.50,-.04,1.58),.30,.13,"#EAFBFF",.4)
    ball(s,"origin-marker",(0,0,.015),(.05,.05,.015),"#FFFFFF")
    s.metadata.update(hero_id=ident,display_name=name,model_stage="static_stylized_mesh_v1",rigged=False)
    return s

manifest={"schema_version":1,"art_direction":"Original friendly chibi fantasy toy style; rounded forms, consistent proportions and soft PBR materials.","coordinate_system":"Z-up GLB, +Y forward.","models":[]}
for hero in HEROES:
    ident,name,*_=hero
    path=OUT/(ident+".glb")
    path.write_bytes(build(hero).export(file_type="glb"))
    manifest["models"].append({"id":ident,"name":name,"file":path.name,"bytes":path.stat().st_size,"rigged":False})
(OUT/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
print("Generated",len(HEROES),"hero GLBs")
