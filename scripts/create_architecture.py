"""Original BAUPLANINVEST concept. Run: blender -b -t 5 -P scripts/create_architecture.py"""
import bpy, math, random
from mathutils import Vector
from pathlib import Path
random.seed(193875217)
ROOT = Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=192
scene.cycles.use_adaptive_sampling=True
scene.cycles.adaptive_threshold=.035
scene.cycles.sample_clamp_indirect=2.0
scene.cycles.use_denoising=False
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.world.color=(.13,.16,.21)
world=scene.world; world.use_nodes=True
world.node_tree.nodes['Background'].inputs['Color'].default_value=(.17,.23,.32,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value=.42
scene.view_settings.view_transform='AgX'

def mat(name, color, rough=.5, metal=0, emission=None):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
 if emission:
  p.inputs['Emission Color'].default_value=(*color,1); p.inputs['Emission Strength'].default_value=emission
 return m
stone=mat('Limestone | original procedural',(.44,.43,.39),.68)
# Fine stone grain, without external textures.
nt=stone.node_tree; n=nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value=90
b=nt.nodes.new('ShaderNodeBump'); b.inputs['Strength'].default_value=.16; b.inputs['Distance'].default_value=.04
nt.links.new(n.outputs['Fac'],b.inputs['Height']); nt.links.new(b.outputs['Normal'],nt.nodes['Principled BSDF'].inputs['Normal'])
metal=mat('Champagne anodized metal',(.25,.23,.19),.28,.75)
slate=mat('Basalt',(.045,.065,.075),.75)
glass=mat('Reflective blue glazing',(.12,.22,.29),.16,.58)
warmglass=mat('Warm interior glazing',(.32,.33,.31),.12,.12)
for m in [glass,warmglass]:
 pbr=m.node_tree.nodes['Principled BSDF'];pbr.inputs['Transmission Weight'].default_value=.72;pbr.inputs['Metallic'].default_value=.12;pbr.inputs['IOR'].default_value=1.45
interior=mat('Interior ivory',(.65,.58,.45),.7)
lightmat=mat('Warm architectural lighting',(1,.64,.29),.3,0,4)
soil=mat('Planting soil',(.027,.036,.025),.98)
leaf=mat('Olive foliage',(.10,.15,.10),.9)
trunk=mat('Tree bark',(.12,.085,.055),.95)
ground=mat('Blue-grey setting',(.065,.095,.12),.82)
paving=mat('Paving',(.24,.28,.29),.72)
water=mat('Reflecting pool',(.055,.12,.15),.07,.65)
groups={k:[] for k in ['site','floors','structure','facade','details','landscape']}
def cube(name,loc,scale,ma,group='details',bevel=0):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.name=name; o.dimensions=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.data.materials.append(ma)
 if bevel:
  mod=o.modifiers.new('Machined edges','BEVEL'); mod.width=bevel; mod.segments=2
  bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=mod.name)
 groups[group].append(o); return o
# Site and generous paved forecourt.
cube('Infinite context',(0,0,-.55),(230,230,.5),ground,'site')
cube('Raised plinth',(0,0,-.16),(40,25,.35),slate,'site',.12)
cube('Forecourt',(0,-9,.02),(37,7,.12),paving,'site',.03)
for x in range(-18,19,3): cube('Paving joint',(x,-9,.087),(.017,7,.009),slate,'site')
for y in [-6,-9,-12]: cube('Paving joint',(0,y,.087),(37,.017,.009),slate,'site')
cube('Reflecting pool',(7,-11,.11),(11,2.1,.07),water,'landscape')
# Limestone bands, floor plates and recessed top level.
for floor in range(4):
 z=.35+floor*3.65; width=29 if floor<3 else 27.5; depth=15 if floor<3 else 13.6
 cube('Floating floor band',(0,0,z),(width,depth,.36),stone,'floors',.06)
 cube('Shadow reveal',(0,0,z+.21),(width-.12,depth-.12,.085),metal,'floors')
 if floor<3:
  cube('Interior floor',(0,0,z+.25),(27,12,.12),interior,'floors')
  # Visible ceilings and partitions give the glazed volume depth.
  cube('Ceiling',(0,0,z+3.32),(26.5,12,.08),interior,'details')
  for x in [-9,-3,4,10]:
   cube('Interior partition',(x,1,z+1.8),(.13,7,3.0),interior,'details')
   cube('Linear pendant',(x,-2,z+3.05),(3,.10,.06),lightmat,'details')
  for x in [-11,-7,-2,3,8,12]:
   cube('Office desk',(x,-3,z+1.0),(1.7,.8,.09),interior,'details')
   cube('Desk pedestal',(x,-3,z+.6),(.35,.5,.75),metal,'details')
  # Front glazing is segmented with mullions and darker spandrels.
  for idx in range(20):
   x=-13.3+idx*1.4
   ma=warmglass if (idx+floor*3)%7 in [0,1,2] else glass
   cube('Glazing module',(x,-6.55,z+1.85),(1.33,.07,3.1),ma,'facade')
   cube('Vertical mullion',(x-.69,-6.65,z+1.85),(.055,.17,3.2),metal,'facade')
   cube('Glazing transom',(x,-6.67,z+2.72),(1.4,.13,.045),metal,'facade')
  for side in [-1,1]:
   for idx in range(9):
    y=-5.8+idx*1.4
    cube('Side glazing',(side*13.9,y,z+1.85),(.07,1.33,3.1),warmglass if idx%4==0 else glass,'facade')
    cube('Side mullion',(side*14,y-.69,z+1.85),(.17,.055,3.2),metal,'facade')
  # Structural rhythm in front of the recessed curtain wall.
  for x in [-14,-7,0,7,14]:
   cube('Limestone column',(x,-7.1,z+1.9),(.34,.45,3.5),stone,'structure',.035)
  for x in [-13,13]: cube('Rear pier',(x,6,z+1.9),(.7,.9,3.5),stone,'structure',.03)
  cube('Rear limestone spine',(0,6.35,z+1.85),(26,.3,3.2),stone,'structure')
# Side sculptural fins, roof crown and glazed parapet.
for y in [-5,-3,-1,1,3,5]: cube('Stone fin',(14.5,y,5.85),(.45,.24,10.8),stone,'structure',.025)
cube('Roof service pavilion',(-5,3.5,12.0),(8,3,1.2),slate,'details',.06)
for x in range(-9,0): cube('Rooftop screen',(x,1.9,12.0),(.06,.15,1.5),metal,'details')
cube('Roof glass balustrade',(0,5.7,11.9),(27,.06,1.15),glass,'details')
for x in range(-13,14): cube('Roof screen',(x,5.7,12.0),(.07,.14,1.4),metal,'details')
for x in [-9,9]: cube('Entrance canopy',(x,-7.8,3.35),(5,2.9,.15),metal,'details',.025)
for x in [-9,9]:
 cube('Entrance light',(x,-8.3,3.22),(4,.05,.03),lightmat,'details')
 for a in [-.8,.8]: cube('Door handle',(x+a,-6.74,1.65),(.035,.09,.65),metal,'details')
# Ordered garden planters, benches and trees.
for x,y in [(-16,-5),(-16,3),(16,3),(-12,10),(0,10),(12,10),(-17,-11)]:
 cube('Planter',(x,y,.35),(2.6,2.6,.6),stone,'landscape',.09)
 cube('Planter soil',(x,y,.67),(2.4,2.4,.07),soil,'landscape')
 bpy.ops.mesh.primitive_cylinder_add(vertices=10,radius=.1,depth=3.1,location=(x,y,2.1)); o=bpy.context.object; o.data.materials.append(trunk); groups['landscape'].append(o)
 for j in range(7):
  bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3,radius=1,location=(x+random.uniform(-.7,.7),y+random.uniform(-.7,.7),3.8+random.uniform(-.4,.7)))
  o=bpy.context.object; o.scale=(.9,.9,.75);
  for polygon in o.data.polygons:polygon.use_smooth=True
  o.data.materials.append(leaf); groups['landscape'].append(o)
for x in [-13,-4,14]:
 cube('Bench',(x,-9.0,.62),(2.6,.65,.14),stone,'landscape',.05)
 for a in [-1,1]: cube('Bench leg',(x+a,-9,.3),(.12,.5,.55),metal,'landscape')
for x in [-17,-7,3,16]:
 cube('Bollard',(x,-12.2,.48),(.12,.12,.8),metal,'landscape')
 cube('Bollard light',(x,-12.2,.89),(.14,.14,.05),lightmat,'landscape')
# Lighting with soft believable pools.
def area(name,loc,power,color,size,target):
 bpy.ops.object.light_add(type='AREA',location=loc); o=bpy.context.object; o.name=name; o.data.energy=power; o.data.color=color; o.data.shape='DISK'; o.data.size=size
 o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('Blue hour key',(5,-15,26),4400,(.6,.75,1),22,(0,0,0))
area('Warm side wash',(-18,-8,8),2200,(1,.68,.39),12,(0,0,4))
area('Sky rim',(12,16,20),6500,(.56,.7,1),18,(0,0,5))
for z in [2.9,6.55,10.2]:
 for x in [-9,0,9]: area('Interior warm', (x,-2,z),180,(1,.65,.33),2,(x,-5,z-2))
# Consolidate each construction phase to keep runtime draw calls bounded.
for name,objs in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objs:o.select_set(True)
 bpy.context.view_layer.objects.active=objs[0]; bpy.ops.object.join(); o=bpy.context.object; o.name=name
 # Centre pivots at world origin for consistent phase animation.
 scene.cursor.location=(0,0,0); bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
# Export only phase geometry; glTF converts Blender Z-up into Y-up.
bpy.ops.object.select_all(action='DESELECT')
for name in groups:bpy.data.objects[name].select_set(True)
(ROOT/'public/models').mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models/architecture.glb'),use_selection=True,export_format='GLB',export_lights=False,export_cameras=False)
bpy.ops.object.camera_add(location=(35,-46,18)); camera=bpy.context.object; scene.camera=camera
camera.rotation_euler=(Vector((0,0,4))-camera.location).to_track_quat('-Z','Y').to_euler(); camera.data.type='PERSP'; camera.data.lens=46
scene.render.resolution_x=1920; scene.render.resolution_y=1200
scene.render.filepath=str(ROOT/'public/images/architecture-desktop.png')
(ROOT/'assets').mkdir(exist_ok=True); bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/architecture.blend'))
bpy.ops.render.render(write_still=True)
camera.location=(37,-48,24); camera.rotation_euler=(Vector((0,0,4))-camera.location).to_track_quat('-Z','Y').to_euler(); camera.data.lens=40
scene.render.resolution_x=1000; scene.render.resolution_y=1200
scene.render.filepath=str(ROOT/'public/images/architecture-mobile.png'); bpy.ops.render.render(write_still=True)
print('BAUPLANINVEST original architecture export complete')
