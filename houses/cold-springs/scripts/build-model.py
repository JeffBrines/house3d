"""Trace A-1 wall outlines. Coordinates are feet, +X sheet right, +Z sheet down.

Source PDFs stay outside dist and outside the hosted source repository.
Run from House3D: .venv/bin/python cold-springs/scripts/build-model.py
Requires PyMuPDF, Shapely. The supplied sheet is rotated 270 degrees.
"""
from pathlib import Path
import json, math, argparse
import fitz
from shapely.geometry import Polygon, LineString, box
from shapely.ops import unary_union, polygonize

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=ROOT/'source-plans/3 Cold Springs Rev1 10-28-26.pdf')
SOURCE = parser.parse_args().source
ORIGIN = (499.32, 232.56)
SCALE = 18
doc = fitz.open(SOURCE)
page = doc[2]
lines = []
for path in page.get_drawings():
    if path['width'] < .47: continue
    r = path['rect'] * page.rotation_matrix
    if r.x0 < 498 or r.x1 > 1863 or r.y0 < 231 or r.y1 > 1580: continue
    for item in path['items']:
        if item[0] != 'l': continue
        a, b = (p * page.rotation_matrix for p in item[1:3])
        if math.dist(a,b) < .1: continue
        if abs(a.x-b.x) > .05 and abs(a.y-b.y) > .05: continue
        lines.append(LineString([(round(p.x/.12)*.12, round(p.y/.12)*.12) for p in [a,b]]))

raw = [p for p in polygonize(unary_union(lines)) if p.area > 30 and 1.9 < p.area/p.length < 5]
assert len(raw) == 92, 'Source changed: review polygon classification before regenerating.'
# CAD window/door leaves, stone ledges, appliance outlines and symbol rectangles
# can also form narrow polygons. Exclude these reviewed non-wall shapes.
exclude = {0,1,3,4,5,8,9,13,14,16,17,18,19,20,21,22,23,27,30,32,35,
           39,40,41,42,43,44,50,51,52,53,54,58,62,63,65,66,72,74,
           78,79,80,81,82,83,84,88,89,90,91}
exclude -= {16,20,23,30}  # Actual framing, previously mistaken for symbols.
parts = [Polygon([((x-ORIGIN[0])/SCALE,(z-ORIGIN[1])/SCALE) for x,z in p.exterior.coords]) for i,p in enumerate(raw) if i not in exclude]
# Complete only interrupted CAD framing outlines. Values below are source-vector
# face coordinates, snapped to the nearest 1/8 inch after tracing (PDF precision).
parts += [box(33.333,29.12,33.627,43.707),
          box(33.333,43.707,35.717,44.167),box(41.217,43.707,42.58,44.167),
          box(72.147,0,74.667,.46),box(74.207,.46,74.667,1.413),
          box(56.847,13.62,57.14,28.453),
          box(56.847,23.873,57.433,24.167),
          box(57.14,28.16,61.08,28.453),
          box(58.333,28.453,58.627,36.06),box(58.167,36.06,58.627,38.5),
          box(60.787,28.453,61.08,30.187),box(60.787,36.307,61.08,38.04),
          box(58.167,38.04,63.167,38.5),box(69.667,38.04,70.793,38.5),
          box(47.113,29.12,57.14,29.413),box(48.1,36.04,57.14,36.5),box(57.14,36.04,58.333,36.5),
          box(13.793,43.46,14.08,43.707),
          box(10.187,72.953,11.46,73.413),box(11,73.413,11.46,74.413),
          box(11.46,73.953,14,74.413)]

openings=[]
def opening(id,kind,axis,x,z,w,h=6+8/12,sill=0,t=3.5/12,name=None,rough=None,tag=None,upper=False):
    openings.append(dict(id=id,kind=kind,axis=axis,x=x,z=z,w=w,h=h,sill=sill,t=t,
        roughWidth=rough or w,name=name or id,tag=tag,upper=upper,
        dimensionBasis='A-1 nominal tag; aperture position from CAD framing faces',
        verticalBasis='Nominal tag height; sill/head provisional unless explicitly dimensioned'))
# Nominal door leaves and measured framing apertures are distinct dimensions.
opening('entry','entry','x',52.5833,36.27,8,7,t=5.5/12,rough=9.0417,tag='2670SL-3070DR-2670SL')
opening('patio-slider','slider','x',46.8333,9.7292,16,7,t=5.5/12,tag='16070DR')
opening('great-hall','door','z',56.993,12.0367,3,rough=3.1667,tag='3068')
opening('entry-great','door','x',52.4792,29.2667,8+8/12,rough=8.75,tag='8868')
opening('garage-house','door','x',19.75,43.9375,2+8/12,t=5.5/12,rough=2.7917,tag='2868')
opening('garage-side','door','z',1.2292,58.537,3,t=5.5/12,rough=3.125,tag='3068DR')
opening('garage-1','garage','z',32.2708,53.8733,9,8,t=5.5/12,rough=9.125,tag='9080 OH')
opening('garage-2','garage','z',32.2708,65.79,9,8,t=5.5/12,rough=9.125,tag='9080 OH')
opening('primary-bedroom','door','x',19.77,18.8125,2+8/12,rough=2.7917,tag='2868')
opening('primary-dressing','door','x',14.1067,18.8125,2.5,rough=2.625,tag='2668')
opening('primary-bath','door','x',6.91,18.8125,2+8/12,rough=2.7917,tag='2868')
opening('primary-wc','door','x',10.4333,23.77,2.5,rough=2.625,tag='2668')
opening('primary-linen','door','z',3.77,17.0833,2.5,rough=2.625,tag='2668')
opening('primary-rear-closet','door','x',5.52,15.3542,2+8/12,rough=2.7917,tag='2868')
opening('kitchen-hall','door','z',21.6875,27.35,3,rough=3.125,tag='3068')
opening('pantry','door','x',23.437,31.7292,2+8/12,rough=2.7917,tag='2868 POCKET')
opening('office','door','x',38.6875,29.2708,5,rough=5.125,tag='5068')
opening('office-closet','door','z',43.8958,30.9767,2.5,rough=2.625,tag='2668')
opening('entry-closet','door','z',46.3542,34.4133,2.5,rough=2.625,tag='2668')
opening('bedroom-2','door','z',60.9375,11.6667,2+8/12,rough=2.7917,tag='2868')
opening('bedroom-2-closet','door','z',60.9375,5,6,rough=6.125,tag='6068')
opening('bedroom-3','door','x',58.83,24.0208,2+8/12,rough=2.7917,tag='2868')
opening('bedroom-3-closet','door','z',60.9375,33.2467,6,rough=6.125,tag='6068')
opening('bath-2','door','x',64.8958,13.2708,2.5,rough=2.625,tag='2668')
opening('bath-3','door','x',64.8958,24.0208,2.5,rough=2.625,tag='2668')
opening('hall-linen-2','door','z',60.7708,16.35,4,rough=4.125,tag='4068')
opening('hall-linen-3','door','z',60.7708,21.39,4,rough=4.125,tag='4068')
opening('powder','door','z',13.9375,33.1633,2+8/12,rough=2.7917,tag='2868')
opening('laundry-closet','door','z',16.3958,37.49,4,rough=4.125,tag='4068')
opening('laundry','door','z',13.9375,42.0633,2+8/12,rough=2.7917,tag='2868')
opening('mechanical','door','x',4.625,47.3958,3,rough=3.125,tag='3068')
opening('storage','door','x',13.0792,47.3958,6,rough=6.125,tag='6068')

for id,x,z,w,h,sill,tag in [
 ('primary-window',14.5,.2292,9,5+4/12,2,'9054TC'),
 ('breakfast-window',28.46,.2292,9,5+4/12,2,'9054TC'),
 ('bed2-rear',67.6467,.2292,9,5+4/12,2,'9054TC'),
 ('office-front',38.4667,43.9375,5.5,4+8/12,2+8/12,'5648DC'),
 ('bed3-front',66.4167,38.2708,6.5,5,2+4/12,'6650DC'),
 ('garage-front',17.25,74.1875,6.5,5,2+2/12,'6650DC')]:
    opening(id,'window','x',x,z,w,h,sill,t=5.5/12,tag=tag)
for id,x,z,w,h,sill,tag in [
 ('breakfast-side',35.2708,4.7467,6,5+4/12,2,'6054DC'),
 ('bed2-side',74.4375,3.7467,2+4/12,3,4+4/12,'2430SC'),
 ('bath2-side',75.4375,15.7467,2,2.5,4+10/12,'2026SC'),
 ('bath3-side',75.4375,21.54,2,2.5,4+10/12,'2026SC'),
 ('bed3-side',75.4375,26.1,2+4/12,3+4/12,4,'2434SC'),
 ('primary-bath-window',.2292,30.3467,5,2+8/12,5,'5028AW'),
 ('laundry-window',1.8958,38.8533,4,4+8/12,3,'4048DC'),
 ('garage-side-1',1.2292,51.04,4,2,4+10/12,'4020AW'),
 ('garage-side-2',1.2292,66.0333,4,2,4+10/12,'4020AW')]:
    opening(id,'window','z',x,z,w,h,sill,t=5.5/12,tag=tag)
# Upper glazing is catalogued separately. A-2 head/section details are absent;
# the nominal units are known, their elevations remain scaled from A-3/A-4.
for id,axis,x,z,w,h,sill,tag in [
 ('patio-transom','x',46.8333,9.7292,16,3,7.25,'16030T'),
 ('bed2-upper','x',67.6467,.2292,2,2.5,10.75,'2026SC'),
 ('bed3-upper','x',66.4167,38.2708,6,2+4/12,9.75,'6024AW'),
 ('office-upper','x',39.9167,43.9375,2,2.5,12.25,'2026SC'),
 ('bath-upper','z',75.4375,19.25,2,2.5,10,'2026SC'),
 ('garage-front-upper','x',17.25,74.1875,6,2+4/12,12.25,'6024AW'),
 ('garage-dormer-1','z',32.2708,53.8733,6,2+4/12,12.25,'6024AW'),
 ('garage-dormer-2','z',32.2708,65.79,6,2+4/12,12.25,'6024AW')]:
    opening(id,'window',axis,x,z,w,h,sill,t=5.5/12,tag=tag,upper=True)

# Elevation-derived window heads, in feet above finished house floor. These
# improve visual placement but are still scaled evidence, not the missing A-2
# schedule. A-3 D is drawn 4'0 high while A-1 tags 4'8: retain the nominal tag.
head_groups={7+9.75/12:['primary-window','breakfast-window','bed2-rear','breakfast-side','office-front','bed3-front'],6+9.75/12:['bed2-side','bed3-side','bath2-side','bath3-side','primary-bath-window','laundry-window']}
for head,ids in head_groups.items():
    for o in openings:
        if o['id'] in ids:o['sill']=head-o['h'];o['verticalBasis']='Head scaled from A-3/A-4; A-2 schedule still required'
def garage_level(x):return 6255-6256.24-.5*max(0,min(1,(x-(1+5.5/12))/((32+3.25/12)-(1+5.5/12))))
for o in openings:
    if o['id'] in ['garage-side-1','garage-side-2']:o['sill']=4+10.5/12;o['verticalBasis']='A-3: opening head 6 ft 10 1/2 in above foundation; nominal height from A-1'
    if o['id']=='garage-front':o['sill']=(6255+8-6256.24)-o['h']-garage_level(o['x']);o['verticalBasis']='A-3: opening head 8 ft above foundation; depends on disputed slab level'
    upper_levels={'bed2-upper':10+9.375/12,'bed3-upper':10+.375/12,'office-upper':12+10.375/12,'bath-upper':9+10.375/12,'garage-front-upper':11+10.375/12,'garage-dormer-1':10+11.375/12,'garage-dormer-2':10+11.375/12}
    if o['id'] in upper_levels:o['sill']=upper_levels[o['id']]-(garage_level(o['x']) if o['id'].startswith('garage') else 0)
    if o['id']=='garage-dormer-1':o['z']=56.4
    if o['id']=='garage-dormer-2':o['z']=63
    if o['id']=='garage-front-upper':o['z']=73.1875

snap = lambda v: round(v*96)/96  # 1/8-inch source-coordinate precision
# Resolve CAD-coordinate rounding against printed dimension chains. The WC /
# dressing partition is half an inch off in the vectors: 3'3 + 3.5in + 5'3
# controls its position. The other corrections are 1/8-inch PDF quantization.
x_constraints={8.82291667:8+10/12,12.04166667:12+1/12,12.32291667:12+4.5/12,63.38541667:63+4.5/12,63.09375:63+1/12}
z_constraints={37.32291667:37+4/12,24.15625:24+2/12,73.94791667:73+11.5/12,72.94791667:72+11.5/12}
def constrained(v, rules):
    v=snap(v)
    return next((target for source,target in rules.items() if abs(v-source)<.00001),v)
parts = [Polygon([(constrained(x,x_constraints),constrained(z,z_constraints)) for x,z in p.exterior.coords]) for p in parts]
walls = unary_union(parts)
for o in openings:
    o['x'],o['z']=snap(o['x']),snap(o['z'])
    if o['upper']: continue
    x,z,w,t=o['x'],o['z'],o['roughWidth'],o['t']+.04
    cut=box(x-w/2,z-t/2,x+w/2,z+t/2) if o['axis']=='x' else box(x-t/2,z-w/2,x+t/2,z+w/2)
    walls=walls.difference(cut)

def coords(poly): return [[round(x,8),round(z,8)] for x,z in list(poly.exterior.coords)[:-1]]
wall_polys=[coords(p) for p in walls.geoms if p.area>.015]
hull=[[7,0],[35.5,0],[35.5,9.5],[58.1667,9.5],[58.1667,0],[74.6667,0],[74.6667,9.5],[75.6667,9.5],[75.6667,29],[74.6667,29],[74.6667,38.5],[58.1667,38.5],[58.1667,36.5],[46.5,36.5],[46.5,44.1667],[33.5,44.1667],[33.5,73.4167],[23.5,73.4167],[23.5,74.4167],[11,74.4167],[11,73.4167],[1,73.4167],[1,43.7067],[1.6667,43.7067],[1.6667,34],[0,34],[0,18.5],[1,18.5],[1,9.5],[7,9.5]]
hull=[[snap(x),snap(z)] for x,z in hull]
model=dict(project='cold-springs-pramer',title='Cold Springs',subtitle='Pramer residence',revision='October 28, 2026 · Revision 1',units='feet',originPdfPoints=ORIGIN,pdfPointsPerFoot=SCALE,sourceSheet='A-1',sourcePage=3,wallHeight=9+1.125/12,dimensionDatum='A-1 framing faces; finish build-ups not added to room dimensions',coordinateToleranceInches=.125,auditRevision='November 4, 2026 dimensional review',walls=wall_polys,openings=openings,hull=hull,
           areas={'living':2819,'garage':971},
           assumptions=['A-2 window/door schedule and referenced ceiling detail are absent from the supplied 7-page architectural PDF. Opening tags and elevations are used; heads, trim and ceiling transitions are provisional.',
             'A-1 tags the laundry window D as 4 ft 0 in by 4 ft 8 in; A-3 depicts an approximately 4 ft high unit. The model follows the A-1 nominal size and a scaled elevation head pending the missing schedule.',
             'Neutral materials, furniture, cabinetry profiles and lighting are spatial placeholders. No finish or lighting selections are approved.',
             'Garage slab: A-3 labels 6255.00 ft and A-4 labels 6254.50 ft at the overhead doors. The model slopes between those levels; exact slope direction and door thresholds need clarification. Garage approach remains three schematic risers, not three exact 6-inch risers.',
             'Wall footprints follow dimensioned framing faces, without an arbitrary buffer. Finish thickness, siding/stone build-ups, jamb clearances and exact sill/head elevations remain unresolved. Top plate 9 ft 1 1/8 in is measured from SUBFLOOR, not finished floor. The 3/4-inch floor finish and 5/8-inch ceiling lining are deducted for the provisional finished ceiling.',
             'Roof massing follows A-1b and elevations. Intersections and dormer framing are simplified. The structural chimney footprint (4 × 8 ft) differs from the architectural roof note (3 × 6 ft); the structural envelope is used.',
             'Rear patio extension is explicitly 28 ft by 17 ft N.T.S. The hot tub is tagged 84 by 84 inches and fire pit 42 by 42 inches; locations and outdoor grade remain schematic. Porch drops 6 1/2 inches at the entry and slopes 2%; two lower risers are approximately 7 inches.'])
(ROOT/'dist/model.json').write_text(json.dumps(model,indent=2))
# The original drawing crop stays local, outside all public distribution.
(ROOT/'tmp/plans').mkdir(parents=True,exist_ok=True)
page.get_pixmap(matrix=fitz.Matrix(1,1),clip=fitz.Rect(460,205,1880,1600)).save(ROOT/'tmp/plans/floor-plan.png')
# Visual verification overlay remains local.
for pp in wall_polys:
    page.draw_polyline([fitz.Point(x*SCALE+ORIGIN[0],z*SCALE+ORIGIN[1])*page.derotation_matrix for x,z in pp],color=(.9,.1,.1),fill=(1,0,0),fill_opacity=.35,width=.2,closePath=True)
(ROOT/'tmp/plans').mkdir(parents=True,exist_ok=True)
page.get_pixmap(matrix=fitz.Matrix(.9,.9),clip=fitz.Rect(480,220,1870,1580)).save(ROOT/'tmp/plans/model-overlay.png')
print(f'Traced {len(wall_polys)} wall components, {len(openings)} openings; scale 18 PDF points/ft.')
