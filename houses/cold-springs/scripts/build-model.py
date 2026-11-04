"""Trace A-1 wall outlines. Coordinates are feet, +X sheet right, +Z sheet down.

Source PDFs stay outside dist and outside the hosted source repository.
Run from House3D: .venv/bin/python cold-springs/scripts/build-model.py
Requires PyMuPDF, Shapely. The supplied sheet is rotated 270 degrees.
"""
from pathlib import Path
import json, math
import fitz
from shapely.geometry import Polygon, LineString, box
from shapely.ops import unary_union, polygonize

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'source-plans/3 Cold Springs Rev1 10-28-26.pdf'
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
parts = [Polygon([((x-ORIGIN[0])/SCALE,(z-ORIGIN[1])/SCALE) for x,z in p.exterior.coords]) for i,p in enumerate(raw) if i not in exclude]
# Continuations whose CAD outlines are interrupted by window and framing symbols.
parts += [box(33.333,29.12,33.627,43.707),box(42.58,43.707,46.5,44.167),
          box(33.333,43.707,37.1,44.167),box(39.833,43.707,42.58,44.167),
          box(72.147,0,74.667,.46),box(74.207,.46,74.667,2.58),
          box(74.207,4.913,74.667,5.893),box(1,49.04,1.46,51.04),
          box(1,66.033,1.46,68.04),box(32.5,44.167,33.5,46.773),
          box(32.5,48.747,33.5,49.373),box(32.5,58.373,33.5,60.667),
          box(32.5,69.667,33.5,73.747),box(1.667,34.0,2.127,36.853),
          box(11.733,19.127,12.04,23.913),box(56.553,13.62,56.847,28.453),
          box(58.333,28.453,58.793,38.5),box(58.333,28.453,60.52,28.747),
          box(60.227,28.747,60.52,38.04),box(58.333,38.04,69.667,38.5),
          box(46.5,36.0,58.333,36.533)]

openings=[]
def opening(id,kind,axis,x,z,w,h=6+8/12,sill=0,t=.6,name=None):
    openings.append(dict(id=id,kind=kind,axis=axis,x=x,z=z,w=w,h=h,sill=sill,t=t,name=name or id))
# Door openings are deliberately shown open in walkthrough mode. Sizes follow A-1 tags.
opening('entry','entry','x',52.58,36.267,8+4/12,7,t=.7,name='Front entry and sidelights')
opening('patio-slider','slider','x',46.83,9.73,16,7,t=.7,name='Great room patio doors')
opening('patio-side','door','x',56.03,9.73,3,t=.7)
opening('garage-house','door','x',19.75,43.93,2+8/12)
opening('garage-side','door','z',1.23,58.54,3)
opening('garage-1','garage','z',33,53.873,9,8,t=1)
opening('garage-2','garage','z',33,65.167,9,8,t=1)
opening('primary-bedroom','door','x',13.8,18.81,2+6/12)
opening('primary-closet','door','x',19.45,18.81,2+8/12)
opening('primary-bath','door','x',6.8,18.81,2+8/12)
opening('primary-wc','door','x',10.1,23.77,2+6/12)
opening('primary-dressing','door','x',16.45,18.81,2+8/12)
opening('primary-rear-closet','door','x',5.42,15.15,2+8/12)
opening('kitchen-hall','door','z',21.68,27.29,3)
opening('pantry','door','z',21.68,30.25,2+8/12)
opening('office','door','x',38.75,29.28,5)
opening('office-closet','door','z',45.48,30.8,2+6/12)
opening('entry-closet','door','z',46.45,34.7,2+6/12)
opening('bedroom-2','door','z',60.43,11.55,2+8/12)
opening('bedroom-2-closet','door','z',60.43,4.9,6)
opening('bedroom-3-closet','door','z',60.43,33.4,6)
opening('bath-2','door','x',64.5,13.57,2+6/12)
opening('bath-3','door','x',64.5,24.0,2+6/12)
opening('hall-linen-2','door','x',58.85,13.57,2+8/12)
opening('hall-linen-3','door','x',58.85,24.0,2+8/12)
opening('powder','door','x',15.85,34.4,2+8/12)
opening('laundry-closet','door','z',14.5,37.0,4)
opening('laundry','door','x',12.0,41.3,2+8/12)
opening('mechanical','door','x',4.5,47.4,3)
opening('storage','door','x',13.2,47.4,6)

for id,x,z,w in [('primary-window',14.5,.23,9),('breakfast-window',28.46,.23,9),('bed2-rear',67.65,.23,9),('office-front',38.47,43.94,5.667),('bed3-front',66.42,38.27,6.5),('garage-front',17.25,74.18,6.5)]:
    opening(id,'window','x',x,z,w,5+4/12 if w==9 else 4+8/12,2+8/12,t=.7)
opening('breakfast-side','window','z',35.27,4.75,6,5+4/12,2+8/12,t=.7)
opening('bed2-side','window','z',74.44,3.747,2+4/12,3+0/12,4+8/12,t=.7)
opening('bath2-side','window','z',75.437,15.747,2,2.5,5.5,t=.7)
opening('bath3-side','window','z',75.437,21.54,2,2.5,5.5,t=.7)
opening('bed3-side','window','z',75.437,26.1,2+4/12,3+4/12,4+8/12,t=.7)
opening('primary-bath-window','window','z',.23,30.35,5,2+8/12,5+4/12,t=.7)
opening('laundry-window','window','z',1.9,39.05,4,4+8/12,3+4/12,t=.7)
opening('garage-side-1','window','z',1.23,51.04,4,2,5.5,t=.7)
opening('garage-side-2','window','z',1.23,66.033,4,2,5.5,t=.7)

walls = unary_union(parts).buffer(.025,join_style=2)
for o in openings:
    x,z,w,t=o['x'],o['z'],o['w'],o['t']+1
    cut=box(x-w/2,z-t/2,x+w/2,z+t/2) if o['axis']=='x' else box(x-t/2,z-w/2,x+t/2,z+w/2)
    walls=walls.difference(cut)

def coords(poly): return [[round(x,5),round(z,5)] for x,z in list(poly.exterior.coords)[:-1]]
wall_polys=[coords(p) for p in walls.geoms if p.area>.015]
hull=[[7,0],[35.5,0],[35.5,9.5],[58.333,9.5],[58.333,0],[74.667,0],[74.667,9.5],[75.667,9.5],[75.667,29],[74.667,29],[74.667,38.5],[58.333,38.5],[58.333,36.53],[46.5,36.53],[46.5,44.167],[33.5,44.167],[33.5,73.747],[23.83,73.747],[23.83,74.747],[10.667,74.747],[10.667,73.747],[1,73.747],[1,43.707],[1.667,43.707],[1.667,33.8],[0,33.8],[0,18.667],[1,18.667],[1,9.5],[7,9.5]]
model=dict(project='cold-springs-pramer',title='Cold Springs',subtitle='Pramer residence',revision='October 28, 2026 · Revision 1',units='feet',originPdfPoints=ORIGIN,pdfPointsPerFoot=SCALE,sourceSheet='A-1',sourcePage=3,wallHeight=9+1.125/12,walls=wall_polys,openings=openings,hull=hull,
           areas={'living':2819,'garage':971},
           assumptions=['A-2 window/door schedule and referenced ceiling detail are absent from the supplied 7-page architectural PDF. Opening tags and elevations are used; heads, trim and ceiling transitions are provisional.',
             'Neutral materials, furniture, cabinetry profiles and lighting are spatial placeholders. No finish or lighting selections are approved.',
             'Garage level is modeled 18 inches below the house with three approach steps; the drawings show a sloping garage slab.',
             'Roof massing follows A-1b and elevations. Intersections and dormer framing are simplified. The structural chimney footprint (4 × 8 ft) differs from the architectural roof note (3 × 6 ft); the structural envelope is used.',
             'Rear patio extension, fire pit and hot tub are shown as schematic because the revision labels their added dimensions N.T.S.'])
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
