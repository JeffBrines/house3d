import {distribution} from './distribution-config.js';
import {wheelWalkDistance,moveOnFloor} from './walk-navigation.js';
import {buildExteriorDoor} from './exterior-doors.js?v=black-1';
import {mountAreaMarkup} from './area-markup.js?v=3';
import {createAreaPicker} from './area-targets.js?v=dining-1';
import {validSurfaces,ensureSurfaces} from './finish-config.js?v=details-5';
import {loadSurfaceTextures,surfaceMaterial,applySurfaceMaterials,setSurfaceUV} from './surface-materials.js?v=public-1';
import {mountFinishUI} from './finish-ui.js?v=public-1';
import {upgradeHouseReview,removeDryBar,furnishingObstacles,roomFurnitureObstacles} from './house-layout.js?v=discovery-ii-1';
import {buildHouseObject} from './house-furniture.js?v=dining-2';
import {REVISED_STAIRS,stairOpening,buildRevisedStairs} from './stair-layout.js';
import {REVISION,REVISION_ID,REVISION_BOUNDS,revisionSuiteObjects,revisedMainState,revisedBasementState,revisedRooms,revisionBasementRooms,revisionSuiteOpenings,revisionBasementOpenings,reviseInteriorOpenings} from './revision-config.js';
import {SUITE_BOUNDS,SUITE_STATE_REVISION,suiteOpenings,retainedInterior,expandedRooms,expandedState,upgradeSuite,suiteObstacleRects} from './suite-config.js';
import {buildSuiteObject} from './suite-geometry.js';
import {tongueAndGrooveMaterial,setCeilingBoardUV} from './ceiling-finish.js';
import {DESIGN_NAMES,createDesignStates,importDesignStates,forkExport} from './suite-state.js';
import {mountMobileUI} from './mobile-ui.js';
import {mountSuiteStudy} from './suite-study.js';
import {STAIR_LANDINGS,REVISION_STAIR_LANDINGS,nearStairs,entersStairs,otherFloor} from './stair-navigation.js';
import {buildPendant} from './lighting-fixtures.js';
import {syncKitchenPendants} from './lighting-layout.js';
import {defaultKitchen,validKitchen,kitchenLayout,upgradeKitchen,kitchenUppers} from './kitchen-engine.js';
import {buildKitchen} from './kitchen-geometry.js?v=details-5';
import {mountKitchenUI} from './kitchen-ui.js';
import {mountBathroomUI,buildVanity,vanitySchedule,isVanity,validVanitySpec,restoreBathroomLayout} from './bathroom-cabinets.js?v=details-3';
import {mountStairStudy} from './stair-study.js';
import * as THREE from 'three';
import {OrbitControls} from './assets/OrbitControls.js';
import {basementRooms,basementHull,basementObjects,basementLights,basementOpenings} from './basement-config.js';
import {RoundedBoxGeometry} from './assets/RoundedBoxGeometry.js';
const $=id=>document.getElementById(id), clone=v=>JSON.parse(JSON.stringify(v));
const originalMainRooms=[['Entire house',43,29],['Great room',49,10],['Kitchen',34,20],['Dining',34,6],['Primary bedroom',66,12],['Primary bathroom',70,29],['Bedroom 2',67,40],['Shared bathroom',64,49],['Bedroom 3',51,50],['Office',34,49],['Laundry',33,41],['Mudroom',35,33],['Pantry',37,29],['Garage',14,37],['Entry / hall',44,48]];
const baseObjects=[
{id:'island',name:'Kitchen island',type:'island',x:36.5,z:15,w:4,d:8,h:3,rotation:0},
{id:'west-counter',name:'Kitchen west counter',type:'cabinet',x:29.5,z:18,w:2,d:14,h:3,rotation:0},
{id:'range-run',name:'Kitchen range run',type:'cabinet',x:34,z:24,w:9,d:2,h:3,rotation:0},
{id:'sink',name:'Kitchen sink',type:'sink',x:29.5,z:17.6,w:1.6,d:2.4,h:.18,y:3,rotation:0},
{id:'range',name:'Range',type:'range',x:32.7,z:24,w:3,d:2,h:3.1,rotation:0},
{id:'fridge',name:'Refrigerator',type:'fridge',x:38.2,z:24,w:3,d:2.6,h:6.9,rotation:0},
{id:'dining',name:'Dining table',type:'table',x:33.5,z:5.5,w:5.8,d:3.3,h:2.5,rotation:0},
{id:'sofa',name:'Great room sofa',type:'sofa',x:48,z:17,w:8,d:3.4,h:2.7,rotation:0},
{id:'coffee',name:'Coffee table',type:'table',x:48,z:12.6,w:4,d:2.3,h:1.25,rotation:0},
{id:'primary-bed',name:'Primary bed',type:'bed',x:69.9,z:11.6,w:6.33,d:6.67,h:2,rotation:90},
{id:'bed2',name:'Bedroom 2 bed',type:'bed',x:69.4,z:40.1,w:5,d:6.67,h:2,rotation:90},
{id:'bed3',name:'Bedroom 3 bed',type:'bed',x:49.3,z:50.1,w:5,d:6.67,h:2,rotation:-90},
{id:'primary-vanity',name:'Primary double vanity',type:'vanity',x:67.4,z:30,w:2,d:6,h:2.9,rotation:0},
{id:'primary-tub',name:'Primary soaking tub',type:'tub',x:73.9,z:27.5,w:2.6,d:5.4,h:2,rotation:0},
{id:'primary-shower',name:'Primary shower',type:'shower',x:73.8,z:32.15,w:3.8,d:3.8,h:7,rotation:0},
{id:'primary-toilet',name:'Primary toilet',type:'toilet',x:63.9,z:28.8,w:1.5,d:2.5,h:2.4,rotation:0},
{id:'shared-vanity',name:'Shared bath vanity',type:'vanity',x:61.9,z:47.5,w:5.5,d:2,h:2.9,rotation:0},
{id:'shared-tub',name:'Shared bath tub',type:'tub',x:72.5,z:49.2,w:2.5,d:5,h:1.7,rotation:0},
{id:'shared-toilet',name:'Shared bath toilet',type:'toilet',x:69.3,z:48.4,w:1.5,d:2.5,h:2.4,rotation:0},
{id:'powder-vanity',name:'Powder vanity',type:'vanity',x:38.3,z:38.5,w:2.8,d:1.7,h:2.8,rotation:0},
{id:'powder-toilet',name:'Powder toilet',type:'toilet',x:38.3,z:44,w:1.5,d:2.5,h:2.4,rotation:180},
{id:'washer',name:'Washer',type:'appliance',x:32,z:43.6,w:2.3,d:2.5,h:3.1,rotation:0},
{id:'dryer',name:'Dryer',type:'appliance',x:29.5,z:43.6,w:2.3,d:2.5,h:3.1,rotation:0}
];
const defaultLights=[];let lightIndex=0;
function seedLight(name,x,z,type='recessed',y=0){defaultLights.push({id:'light-'+(++lightIndex),name,type,x,z,y,kelvin:3000,power:800,on:true});}
[[33,7],[33,19],[43,6],[51,6],[43,15],[51,15],[44,25],[53,25]].forEach(([x,z],i)=>seedLight('Living / kitchen '+(i+1),x,z));
[13,17].forEach((z,i)=>seedLight('Island pendant '+(i+1),36.5,z,'pendant',6.6));seedLight('Dining pendant',33.5,5.5,'pendant',6.4);
[[66,10],[69,27],[69,32],[66,40],[62,49],[51,49],[34,49],[33,41],[35,33],[37,29],[44,38],[44,49],[8,31],[20,31],[8,44],[20,44]].forEach(([x,z],i)=>seedLight('Room light '+(i+1),x,z));
const defaults={schema:1,objects:baseObjects,lights:defaultLights,finishes:{cabinet:'#986b43',counter:'#efede7',wall:'#ffffff',floor:'#b99160'},daylight:'day'};
const basementDefaults={...clone(defaults),objects:basementObjects,lights:basementLights};
let currentDesign='revised';try{const choice=localStorage.getItem('brines-suite-design');if(localStorage.getItem('brines-october-revision-seen')&&Object.hasOwn(DESIGN_NAMES,choice))currentDesign=choice;}catch{}
const roomsForDesign=()=>currentDesign==='revised'?revisedRooms(originalMainRooms):currentDesign==='expanded'?expandedRooms(originalMainRooms):originalMainRooms;
let mainRooms=roomsForDesign();
let currentFloor='main',rooms=mainRooms,models={},modelSets={};
const legacyKitchenIds=new Set(['island','west-counter','range-run','sink','range','fridge']);
function ensureKitchen(s){if(!s.kitchen){s.kitchen=defaultKitchen();s.legacyKitchenObjects=clone(s.objects.filter(o=>legacyKitchenIds.has(o.id)));s.objects=s.objects.filter(o=>!legacyKitchenIds.has(o.id));}upgradeKitchen(s.kitchen);return s;}
let designStates=createDesignStates(ensureKitchen(clone(defaults)),basementDefaults);
for(const design of Object.keys(DESIGN_NAMES))for(const floor of ['main','basement']){try{const saved=JSON.parse(localStorage.getItem('brines-suite-'+design+'-'+floor+'-v1'));if(validState(saved))designStates[design][floor]=floor==='main'?ensureKitchen(saved):saved;}catch{}}
if(designStates.expanded.main.suiteRevision!==SUITE_STATE_REVISION){try{localStorage.setItem('brines-suite-before-slide-b3',JSON.stringify(designStates.expanded.main));}catch{}designStates.expanded.main=upgradeSuite(designStates.expanded.main);}
// Seed the new version from existing choices; keep previous local states intact.
try{for(const floor of ['main','basement'])if(!localStorage.getItem('brines-suite-revised-'+floor+'-v1'))designStates.revised[floor]=floor==='main'?revisedMainState(designStates.expanded.main):revisedBasementState(designStates.expanded.basement);}catch{}
// Apply this review once, including existing browser layouts. Keep a recoverable snapshot.
try{if(!localStorage.getItem('brines-before-whole-house-review'))localStorage.setItem('brines-before-whole-house-review',JSON.stringify(designStates));}catch{}
for(const levels of Object.values(designStates))removeDryBar(levels.basement);
for(const floor of ['main','basement'])designStates.revised[floor]=upgradeHouseReview(designStates.revised[floor],floor);
// Owner's white-wall direction applies once to both revised floors. Later paint studies persist.
for(const layout of Object.values(designStates.revised))if(layout.wallPaintRevision!=='neutral-white-2026-11-01'){
 layout.finishes.wall='#ffffff';layout.wallPaintRevision='neutral-white-2026-11-01';
}
let floorStates=designStates[currentDesign],state=floorStates.main,suiteStudy;
const isRevised=()=>currentDesign==='revised';
const isExpanded=()=>currentDesign!=='original'&&currentFloor==='main';
let kitchenUI,bathroomUI,mobileUI,finishUI,markupUI;
function kitchenChanged(){buildObjects();rebuildLights();save();}
function focusKitchen(side='seating'){mobileUI?.closePanel();if(currentFloor!=='main')switchFloor('main');roomIndex=2;setMode('walk');goRoom(2);const l=kitchenLayout(state.kitchen);camera.position.set(side==='working'?l.island.x-l.island.w/2-l.clearance.west/24:l.island.x+6,walkHeight,l.island.z+3);yaw=side==='working'?-Math.PI/2:Math.PI/2;pitch=-.12;look();refreshLighting();setTab('kitchen');}
function validState(s){return s?.schema===1&&validSurfaces(s.surfaces)&&(!s.kitchen||validKitchen(s.kitchen))&&Array.isArray(s.objects)&&s.objects.length<200&&Array.isArray(s.lights)&&s.lights.length<150&&s.finishes&&['cabinet','counter','wall','floor'].every(k=>/^#[0-9a-f]{6}$/i.test(s.finishes[k]))&&s.objects.every(o=>typeof o.id==='string'&&typeof o.name==='string'&&Math.abs(o.x)<200&&Math.abs(o.z)<200&&['x','z','w','d','h','rotation'].every(k=>Number.isFinite(o[k]))&&o.w>.01&&o.d>.01&&o.h>0&&o.w<100&&o.d<100&&o.h<40&&validVanitySpec(o))&&s.lights.every(o=>typeof o.id==='string'&&typeof o.name==='string'&&Math.abs(o.x)<200&&Math.abs(o.z)<200&&o.y>=0&&o.y<40&&o.power>=0&&o.power<=3000&&o.kelvin>=2200&&o.kelvin<=5000&&['x','z','y','kelvin','power'].every(k=>Number.isFinite(o[k])));}
let photoView=null,photoActive=false,photoLoading=false,pendingFloor=null,pendingDesign=null,stairCooldown=0;
function invalidatePhoto(kind='scene'){photoView?.invalidate(kind);}
let scene,renderer,camera,perspective,orthographic,orbit,model,wallGroup,ceilingGroup,objectGroup,lightGroup,measureGroup,labelGroup;
let mode='orbit',roomIndex=0,selected='k-W05',selectedLight=state.lights[0]?.id,tab='layout',ceilings=false,cutaway=true,measuring=false,measurement=[],yaw=Math.PI,pitch=0,drag=null,needsSave;
let meshes=[],colliders=[],keys={},lightMeshes=[],pointLights=[],hemi,sun,floorMaterial,wallMaterial,cabinetMaterial,counterMaterial,selectionBox,clock=new THREE.Clock();
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),clipPlane=new THREE.Plane(new THREE.Vector3(0,-1,0),4.3),floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0),walkHeight=5.6;
function feet(n){let v=Math.round(Math.abs(n)*192)/16,f=Math.floor(v/12),i=Math.round((v-f*12)*16)/16;return `${n<0?'−':''}${f}′ ${Number(i.toFixed(3))}″`;}
function toast(msg){$('toast').textContent=msg;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,4200);}
function save(){clearTimeout(needsSave);needsSave=setTimeout(()=>{try{floorStates[currentFloor]=state;for(const [design,levels] of Object.entries(designStates))for(const [floor,layout] of Object.entries(levels))localStorage.setItem('brines-suite-'+design+'-'+floor+'-v1',JSON.stringify(layout));localStorage.setItem('brines-suite-design',currentDesign);localStorage.setItem('brines-october-revision-seen','1');$('saveStatus').textContent='All three designs saved in this browser. Export to keep a copy.';}catch{$('saveStatus').textContent='Browser storage unavailable. Export your layout.';}},200);}
function material(color,extra={}){return new THREE.MeshPhysicalMaterial({color,roughness:.68,clearcoat:.06,clearcoatRoughness:.4,...extra});}
function box(w,h,d,x,y,z,mat,parent=scene){const rounded=parent?.userData?.entityId&&Math.min(w,h,d)>.09;const geo=rounded?new RoundedBoxGeometry(w,h,d,2,Math.min(.045,Math.min(w,h,d)/5)):new THREE.BoxGeometry(w,h,d);const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cyl(r1,r2,h,x,y,z,mat,parent=scene){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,24),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const mainHull=[[28,0],[58,0],[58,4],[74,4],[74,18.5],[76,18.5],[76,34.5],[74,34.5],[74,52],[58,52],[58,56],[28,56],[28,52],[0,52],[0,22],[28,22]];
let floorHull=mainHull;
function shape(points,holes=[]){const s=new THREE.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();for(const hole of holes)s.holes.push(shape(hole));return s;}
function flatPolygon(points,y,mat,parent=scene,holes=[]){const g=new THREE.ShapeGeometry(shape(points,holes));g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,mat);m.position.y=y;m.receiveShadow=true;parent.add(m);return m;}
function height(kind,x,z){if(kind==='shared')return Math.max(height('great',x,z),height('primary',x,z));if(kind==='great')return 12+Math.max(0,Math.min(x-28.5,57.5-x))*2/3;if(kind==='primary')return 9.09375+Math.max(0,73.5-x)/3;if(kind==='garage')return 9+Math.max(0,Math.min(x-.5,27.958-x))/6;return 9;}
function ceilingHeight(x,z){if(currentFloor==='basement')return 9;if(x<28&&z>=22&&z<=52)return height('garage',x,z);if(x>=58&&x<=74&&z>=4&&z<18.5)return height('primary',x,z);if(x>=28&&x<=58&&z<27.5&&!(x<40&&z>25.15))return height('great',x,z);return 9;}
function wallPolygon(points,kind='flat',base=0){
 const ridge=kind==='great'||kind==='shared'?43:kind==='garage'?14.229:null;
 if(ridge!==null&&Math.min(...points.map(p=>p[0]))<ridge-1e-7&&Math.max(...points.map(p=>p[0]))>ridge+1e-7){
  const clip=sign=>{const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ina=sign*(a[0]-ridge)>=-1e-8,inb=sign*(b[0]-ridge)>=-1e-8;if(ina)out.push(a);if(ina!==inb){const t=(ridge-a[0])/(b[0]-a[0]);out.push([ridge,a[1]+t*(b[1]-a[1])]);}}return out;};
  for(const sign of [-1,1]){const part=clip(sign);if(part.length>=3)wallPolygon(part,kind,base);}return;
 }
 const g=new THREE.ExtrudeGeometry(shape(points),{depth:1,bevelEnabled:false,steps:1});g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,base+p.getY(i)*(Math.max(base+.01,height(kind,p.getX(i),p.getZ(i)))-base));g.computeVertexNormals();const m=new THREE.Mesh(g,wallMaterial);m.castShadow=true;m.receiveShadow=true;wallGroup.add(m);return m;}
function roofPatch(points,kind,holes=[]){const g=new THREE.ShapeGeometry(shape(points,holes));g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,height(kind,p.getX(i),p.getZ(i)));g.computeVertexNormals();const wood=kind==='primary';if(wood)setCeilingBoardUV(g,kind);const finish=wood?tongueAndGrooveMaterial(renderer.capabilities.getMaxAnisotropy()):Object.assign(surfaceMaterial('ceiling',state),{side:THREE.DoubleSide});const m=new THREE.Mesh(g,finish);m.userData.ceilingZone=kind;m.castShadow=true;m.receiveShadow=true;ceilingGroup.add(m);}

function ceilingTransition(x0,x1,z,kind,bottom){
 const xs=kind==='great'?[x0,43,x1]:[x0,x1];
 for(let i=0;i<xs.length-1;i++){
  const a=xs[i],b=xs[i+1],ha=height(kind,a,z),hb=height(kind,b,z);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([a,bottom,z,b,bottom,z,b,hb,z,a,bottom,z,b,hb,z,a,ha,z],3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,Object.assign(surfaceMaterial('wall',state),{side:THREE.DoubleSide}));m.castShadow=true;m.receiveShadow=true;ceilingGroup.add(m);
 }
}
function addOpening(o){const {x,z,w,h,sill=0,axis='x',kind='flat',upper,thickness=.57}=o;let spans=[[sill,sill+h]];if(upper)spans.push([upper.sill,upper.sill+upper.h]);const half=thickness/2;const footprint=axis==='x'?[[x-w/2,z-half],[x+w/2,z-half],[x+w/2,z+half],[x-w/2,z+half]]:[[x-half,z-w/2],[x+half,z-w/2],[x+half,z+w/2],[x-half,z+w/2]];let bottom=0;
 for(const [lo,hi] of spans){if(lo>bottom)box(axis==='x'?w:thickness,lo-bottom,axis==='z'?w:thickness,x,(lo+bottom)/2,z,wallMaterial,wallGroup);bottom=hi;}
 wallPolygon(footprint,kind,bottom);
 if(o.door){if(o.id==='11'){const m=box(axis==='x'?w:.13,h,axis==='z'?w:.13,x,h/2,z,material('#d3d8d6'),wallGroup);m.userData.fixed=true;for(let y=1.4;y<h;y+=1.4)box(w,.025,.025,x,y,z-.09,material('#8e9b9f'),wallGroup);}else{
  const exterior=o.id==='9'||o.id==='8',trim=exterior?material('#101315',{roughness:.42}):surfaceMaterial('trim',state);
  const casing=exterior?.1:2.5/12;for(const a of[-1,1])box(axis==='x'?casing:.68,h,axis==='z'?casing:.68,x+(axis==='x'?a*(w+casing)/2:0),h/2,z+(axis==='z'?a*(w+casing)/2:0),trim,wallGroup);
  box(axis==='x'?w+2*casing:.7,casing,axis==='z'?w+2*casing:.7,x,h+casing/2,z,trim,wallGroup);
  if(exterior)buildExteriorDoor(wallGroup,o);
 }}
 else windowUnit(x,z,w,h,sill,axis);
 if(upper)windowUnit(x,z,w,upper.h,upper.sill,axis);
}
function windowUnit(x,z,w,h,sill,axis){const trim=material('#101315',{roughness:.42});const glass=material('#f4fbfc',{transmission:.96,thickness:.025,ior:1.5,roughness:.03,side:THREE.DoubleSide});box(axis==='x'?w:.05,h,axis==='z'?w:.05,x,sill+h/2,z,glass,wallGroup);for(const a of [-1,1])box(axis==='x'?.09:.24,h,axis==='z'?.09:.24,x+(axis==='x'?a*(w-.09)/2:0),sill+h/2,z+(axis==='z'?a*(w-.09)/2:0),trim,wallGroup);for(const y of [sill+.05,sill+h-.05])box(axis==='x'?w:.24,.1,axis==='z'?w:.24,x,y,z,trim,wallGroup);box(axis==='x'?w+.2:.65,.06,axis==='z'?w+.2:.65,x,sill-.03,z,trim,wallGroup);
 const casing=surfaceMaterial('trim',state),c=2.5/12,inside=axis==='x'?(z<25?1:-1):(x<40?1:-1),face=.32*inside;
 for(const sign of [-1,1])box(axis==='x'?c:.055,h+2*c,axis==='z'?c:.055,x+(axis==='x'?sign*(w+c)/2:face),sill+h/2,z+(axis==='z'?sign*(w+c)/2:face),casing,wallGroup);
 for(const y of [sill-c/2,sill+h+c/2])box(axis==='x'?w:.055,c,axis==='z'?w:.055,x+(axis==='z'?face:0),y,z+(axis==='x'?face:0),casing,wallGroup);
}
function buildArchitecture(){if(currentFloor==='basement')return buildBasementArchitecture();wallGroup=new THREE.Group();ceilingGroup=new THREE.Group();scene.add(wallGroup,ceilingGroup);floorMaterial=surfaceMaterial('floor',state);const stairHoles=isRevised()?[stairOpening()]:[];flatPolygon(floorHull,0,floorMaterial,scene,stairHoles);const slabGeo=new THREE.ExtrudeGeometry(shape(floorHull,stairHoles),{depth:.45,bevelEnabled:false});slabGeo.rotateX(-Math.PI/2);const slab=new THREE.Mesh(slabGeo,material('#889b95'));slab.position.y=-.5;scene.add(slab);flatPolygon([[0,22],[28,22],[28,52],[0,52]],.018,material('#aeb5b1'));flatPolygon([[28,-10],[58,-10],[58,0],[28,0]],-.1,material('#c2c9c2'));(isExpanded()?[[SUITE_BOUNDS.bathWest,(isRevised()?REVISION_BOUNDS.bathNorth:SUITE_BOUNDS.bathNorth),75.5,34.000275],[SUITE_BOUNDS.bathWest,34.000275,73.5,SUITE_BOUNDS.bathSouth],[58,46.5,74,52],[28.5,37.3,40,45.3]]:[[62,24.2,76,34.5],[58,46.5,74,52],[28.5,37.3,40,45.3]]).forEach(([a,b,c,d],i,areas)=>flatPolygon([[a,b],[c,b],[c,d],[a,d]],.024,surfaceMaterial('tile',state,i<areas.length-2?'primary':i===areas.length-2?'shared':'laundry')));
 wallMaterial=surfaceMaterial('wall',state);for(const w of model.wallParts)wallPolygon(w.points,w.ceiling);
 const win=(id,x,z,w,h,head,axis,kind='flat',upper)=>({id,x,z,w,h,sill:head-h,axis,kind,upper});
 const openings=[win('J',34.5,.229,6,6,8,'x','great',{sill:9.5,h:3}),win('J',51.5,.229,6,6,8,'x','great',{sill:9.5,h:3}),{id:'9',x:43,z:.229,w:6.167,h:8,axis:'x',kind:'great',door:true,upper:{sill:9.5,h:6}},win('J',28.229,5.4166,6,6,8,'z','great'),win('E',28.229,17.5,4,4.5,8,'z','great'),win('H',65.75,4.229,5,5,8,'x','primary'),win('B',73.771,6.625,2.5,5,8,'z','primary'),win('B',73.771,16.5833,2.5,5,8,'z','primary'),win('G',75.771,27.167,5,4.5,8,'z'),win('B',73.771,36.167,2.5,5,8,'z'),win('B',73.771,44.417,2.5,5,8,'z'),win('A',62.75,51.771,2,3,8,'x'),win('A',69.25,51.771,2,3,8,'x'),win('F',53.7917,55.771,4,6,8,'x'),win('F',32.2083,55.771,4,6,8,'x'),{id:'8',x:43,z:55.771,w:3.167,h:8,axis:'x',door:true},...[30,37,44].map(z=>win('C',.229,z,3,2.5,6.667,'z','garage')),{id:'11',x:7.5,z:51.771,w:9.292,h:9,axis:'x',kind:'garage',door:true},{id:'11',x:19,z:51.771,w:9.292,h:9,axis:'x',kind:'garage',door:true},{id:'10',x:4,z:22.229,w:6.167,h:6.667,axis:'x',kind:'garage',door:true}];
 const interior=[['7',28.229,27.92,3.208,'z'],['3',39.688,27.264,2.792,'z'],['5',39.688,34.764,3.125,'z'],['3',39.688,41.368,2.792,'z'],['5',39.688,47.493,3.125,'z'],['6',37.229,52.257,4.125,'z'],['5',34.19,37.354,3.125,'x'],['3',50.55,43.813,2.792,'x'],['3',57.771,43.167,3.167,'z'],['2',57.771,49.854,2.625,'z'],['2',65.9,46.313,3.04,'x'],['2',67.563,49.854,2.625,'z'],['3',62.229,36.271,2.792,'z'],['3',64.25,34.355,2.792,'x'],['5',59.92,23.188,3.125,'x'],['4',68.959,18.813,2.958,'x'],['1',67.021,22.438,2.458,'z'],['1',70.896,22.438,2.458,'z'],['2',66.105,26.02,2.625,'z']];
 const interiorObjects=interior.map(([id,x,z,w,axis])=>({id,x,z,w,h:6.667,axis,door:true}));for(const o of (isRevised()?reviseInteriorOpenings(interiorObjects):interiorObjects)){if(!isExpanded()||retainedInterior(o))openings.push(o);}if(isExpanded())openings.push(...(isRevised()?revisionSuiteOpenings:suiteOpenings).map(o=>({...o,thickness:isRevised()&&o.id==='suite-bath'?.5417:.375})));if(isRevised())openings.push({id:'hall-great',x:57.771,z:29.3335,w:43/12,h:8,axis:'z',door:true,thickness:.5417});for(const o of openings)addOpening(o);if(isExpanded()&&!isRevised()){const door=material('#d8d2c5',{roughness:.55});box(.12,7,2.5,62.91,3.5,38.917,door,wallGroup);box(.05,.12,.14,63,3,37.867,material('#283b3e',{metalness:.6}),wallGroup);}
 // Ceiling surfaces are separate so the model can be cut away without losing the floor plan.
 roofPatch([[28.5,.5],[43,.5],[43,27.5],[28.5,27.5]],'great');roofPatch([[43,.5],[57.5,.5],[57.5,27.5],[43,27.5]],'great');roofPatch([[58.5,4.5],[73.5,4.5],[73.5,18.5],[58.5,18.5]],'primary');
 roofPatch([[.5,22.5],[14.229,22.5],[14.229,51.5],[.5,51.5]],'garage');roofPatch([[14.229,22.5],[27.958,22.5],[27.958,51.5],[14.229,51.5]],'garage');
 [[[28.5,27.5],[57.5,27.5],[57.5,55.5],[28.5,55.5]],[[58,18.5],[75.5,18.5],[75.5,34.5],[73.5,34.5],[73.5,51.5],[58,51.5]],[[28.5,25.167],[40,25.167],[40,27.5],[28.5,27.5]]].forEach(p=>roofPatch(p,'flat'));
 // Close the great-room end of the vault as one continuous plane. Internal pantry walls remain 9'.
 ceilingTransition(28.5,57.5,27.5,'great',9);
 ceilingTransition(58.5,73.5,18.5,'primary',9);
 // Both levels share the same physical stair, with a translated floor datum.
 if(isRevised()){buildRevisedStairs(scene,'main',{box,material});flatPolygon(stairOpening(),-REVISED_STAIRS.rise,floorMaterial);}else{
 box(10.9,.04,8.2,52.05,.03,37.1,material('#394b52'));
 for(let i=0;i<10;i++)box(.83,.11,4,47.2+i*.83,.07,35.1,material('#a3947b'));
 const railMat=material('#33484c');for(let i=0;i<=10;i++)box(.05,3.1,.05,46.55+i*1.09,1.55,33.18,railMat);box(11,.11,.11,52,3.15,33.18,railMat);for(let i=0;i<5;i++)box(.05,3.1,.05,46.5,1.55,37.3+i*.85,railMat);box(.11,.11,4.3,46.5,3.15,39,railMat);}
 if(isRevised()){
  // Garage landing plan envelope; the two-sheet revision does not establish its rise.
  const landing=material('#a3947b');box(2,.08,4.8,27,.04,27.917,landing);for(let i=0;i<2;i++)box(.75,.04,4.8,25.625-i*.75,.045-i*.015,27.917,landing);
 }
 // Door and window openings remain passable in this walkthrough; no animated door leaf clearance is assumed.
 colliders=model.walls;
 const grid=new THREE.GridHelper(130,65,0xa7b7b0,0xc1ccc4);grid.position.set(38,-.6,27);grid.visible=!isRevised();scene.add(grid);
 buildBaseboards();applySurfaceMaterials(scene,state);buildLabels();
 updateArchitecture();
}

function buildBaseboards(){
 const trim=surfaceMaterial('trim',state);
 // Follow the actual finished wall faces, stopping at the plan's door apertures.
 for(const wall of model.wallParts)for(let i=0;i<wall.points.length;i++){
  const a=wall.points[i],b=wall.points[(i+1)%wall.points.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<.8)continue;
  let nx=-dz/length,nz=dx/length;const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
  if(pointInside(x+nx*.01,z+nz*.01,wall.points)){nx=-nx;nz=-nz;}
  if(!pointInside(x+nx*.08,z+nz*.08,floorHull)||(currentFloor==='main'&&x<28))continue;
  const board=box(length,5/12,.042,x+nx*.021,5/24,z+nz*.021,trim,wallGroup);board.rotation.y=-Math.atan2(dz,dx);board.userData.baseboard=true;
 }
}
function buildLabels(){ labelGroup=new THREE.Group();scene.add(labelGroup);rooms.slice(1).forEach(([n,x,z])=>{const c=document.createElement('canvas');c.width=512;c.height=80;const ctx=c.getContext('2d');ctx.fillStyle='#233b44';ctx.font='500 30px Arial';ctx.textAlign='center';ctx.fillText(n.toUpperCase(),256,48);const texture=new THREE.CanvasTexture(c);const mat=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide});const m=new THREE.Mesh(new THREE.PlaneGeometry(9,1.4),mat);m.rotation.x=-Math.PI/2;m.position.set(x,.06,z);labelGroup.add(m);});}
function buildBasementArchitecture(){
 wallGroup=new THREE.Group();ceilingGroup=new THREE.Group();scene.add(wallGroup,ceilingGroup);
 floorMaterial=surfaceMaterial('floor',state);
 flatPolygon(floorHull,0,floorMaterial);
 const slabGeo=new THREE.ExtrudeGeometry(shape(floorHull),{depth:.45,bevelEnabled:false});slabGeo.rotateX(-Math.PI/2);const slab=new THREE.Mesh(slabGeo,material('#889b95'));slab.position.y=-.5;scene.add(slab);
 flatPolygon([[62.42,25.08],[75,25.08],[75,31.08],[62.42,31.08]],.024,surfaceMaterial('tile',state,'basement'));
 flatPolygon([[29,41.8],[57,41.8],[57,55],[29,55]],.018,material('#aeb5b1'));
 wallMaterial=surfaceMaterial('wall',state);for(const w of model.wallParts)wallPolygon(w.points,'flat');
 (isRevised()?revisionBasementOpenings:basementOpenings).forEach(addOpening);roofPatch(floorHull,'flat',isRevised()?[stairOpening()]:[]);
 // Tread geometry is schematic until the floor-to-floor rise is confirmed.
 if(isRevised())buildRevisedStairs(scene,'basement',{box,material});else{const tread=material('#a3947b');for(let i=0;i<9;i++)box(.9,.16,3.4,49.75+i*.9,.16+i*.48,39.45,tread);
 for(let i=0;i<9;i++)box(.9,.16,3.4,57-i*.9,4.5+i*.48,35.05,tread);}
 colliders=model.walls;buildBaseboards();applySurfaceMaterials(scene,state);buildLabels();updateArchitecture();
}
function refreshFloorUI(){finishUI?.render();$('viewFamily').hidden=!isRevised();$('livingOverview').hidden=!isRevised();
 const b=currentFloor==='basement';$('floorSelect').value=currentFloor;
 $('drawingDate').textContent=isRevised()?(b?'A-101':'A-102')+' · REV 1 · OCT 6, 2026':b?'BASEMENT · AUG 24, 2026':currentDesign==='expanded'?'EARLIER SUITE STUDY · B.3':'ORIGINAL PLAN · JUN 1, 2026';$('designSelect').value=currentDesign;suiteStudy?.refresh();
 $('floorBadge').textContent=b?'Basement · '+DESIGN_NAMES[currentDesign]:DESIGN_NAMES[currentDesign];$('stairsButton').textContent=b?'Go upstairs':'Go downstairs';
 $('kitchenReadout').hidden=b;$('sourceTitle').textContent=b?'Basement · A-101 · August 24, 2026':'Main floor · A-102';
 if(distribution.sourceDrawings)$('sourceImage').src=model.sourceImage|| (b?'./assets/basement-plan.png':'./assets/plan.png');
 $('sourceImage').alt=b?'Revised basement source plan':'Main-floor source plan';
 if(distribution.sourceDrawings)$('sourceLink').href=model.sourcePdf?model.sourcePdf+'#page='+model.sourcePage:b?'./assets/basement-plans.pdf':'./assets/source-plans.pdf#page=6';
 if(isRevised())$('sourceTitle').textContent=model.sheet+' · Revision 1 · October 6, 2026';
 $('revisionNotice').hidden=!isRevised();$('legacyAudit').hidden=isRevised();$('revisionAudit').hidden=!isRevised();
 $('floorSelect').options[1].textContent=isRevised()?'Basement · October 6 revision':'Basement · August 24 plan';
 const auditTarget=$(isRevised()?'auditTableRevision':'auditTable');auditTarget.replaceChildren();for(const a of model.audit){const tr=document.createElement('tr');[a.name,feet(a.declared),(a.errorInches??Math.abs(a.declared-a.extracted)*12).toFixed(4)+'″'].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});auditTarget.append(tr);}
}
function switchFloor(next,viaStairs=false,force=false){
 if(!models[next]){toast('That floor is not available yet.');return;}if(photoLoading){pendingFloor={next,viaStairs,force};toast('Finishing the view change, then switching floors…');return;}if(next===currentFloor&&!force)return;
 const resumePhoto=photoActive,previousMode=mode;stopPhoto();floorStates[currentFloor]=state;
 for(const l of pointLights)l.dispose();pointLights=[];
 scene.remove(hemi,sun,sun.target);disposeGroup(scene);selectionBox=null;
 currentFloor=next;model=models[next];state=floorStates[next];rooms=next==='basement'?(isRevised()?revisionBasementRooms:basementRooms):mainRooms;floorHull=next==='basement'?basementHull:mainHull;
 selected=state.objects[0]?.id;selectedLight=state.lights[0]?.id;roomIndex=viaStairs?(next==='basement'?7:isRevised()?15:14):0;
 drag=null;keys={};measurement=[];scene.add(hemi,sun,sun.target);
 objectGroup=new THREE.Group();lightGroup=new THREE.Group();measureGroup=new THREE.Group();scene.add(objectGroup,lightGroup,measureGroup);
 buildArchitecture();buildObjects();buildLights();populateLists();editor();refreshFloorUI();kitchenUI?.render();bathroomUI?.render();
 if(viaStairs){roomIndex=next==='basement'?7:isRevised()?15:14;setMode('walk');const landing=(isRevised()?REVISION_STAIR_LANDINGS:STAIR_LANDINGS)[next];camera.position.set(landing.x,walkHeight,landing.z);yaw=Math.PI/2;pitch=0;look();$('currentRoom').textContent=isRevised()?(next==='basement'?'Stair bottom · back / west':'Stair top · front / east'):next==='basement'?'Basement stair landing':'Main-floor stair landing';stairCooldown=performance.now()+1200;}
 else{setMode(previousMode);goRoom(previousMode==='walk'?1:0);}
 if(next==='basement'&&tab==='kitchen')setTab('layout');$('stairPrompt').hidden=true;invalidatePhoto();if(resumePhoto)startPhoto();toast((next==='basement'?'Basement':'Main floor')+(isRevised()?' · October 6 revision':''));
}

function switchDesign(next){
 if(!Object.hasOwn(DESIGN_NAMES,next)||next===currentDesign)return;
 if(photoLoading){pendingDesign=next;toast('Finishing this view, then loading the selected design.');return;}
 const previousRoom=roomIndex,previousFloor=currentFloor,resumePhoto=photoActive;stopPhoto();floorStates[currentFloor]=state;
 currentDesign=next;floorStates=designStates[next];state=floorStates[currentFloor];models=modelSets[next];mainRooms=roomsForDesign();
 switchFloor(currentFloor,false,true);
 if(previousFloor==='main')focusSuite(previousRoom===6?'closet':previousRoom===4?'entry':'bath');if(resumePhoto)startPhoto();
 save();toast(DESIGN_NAMES[next]+' loaded. Each version keeps its own edits.');
}
function focusSuite(zone='bath'){
 if(photoLoading){toast('Wait a moment for the current view to finish.');return;}
 const keepPhoto=photoActive;stopPhoto();if(currentFloor!=='main')switchFloor('main');
 roomIndex=zone==='closet'?6:zone==='entry'?4:5;setMode('walk');goRoom(roomIndex);
 const views=isRevised()?{bath:[68.1,37.8,0,-.08],closet:[68.959,23,Math.PI,-.08],entry:[68.959,16.1,Math.PI,-.05]}:isExpanded()?{bath:[68.1,38.1,0,-.08],closet:[68.959,22.8,Math.PI,-.08],entry:[68.959,16.1,Math.PI,-.05]}:{bath:[70.15,29.2,0,-.05],closet:[65.2,40,-Math.PI/2,-.05],entry:[68.959,16.1,Math.PI,-.05]};
 const [x,z,a,p]=views[zone];camera.position.set(x,walkHeight,z);yaw=a;pitch=p;look();refreshLighting();selected=zone==='entry'?'primary-bed':zone==='closet'?(isExpanded()?'suite-west-wardrobe':'bed2'):(isExpanded()?'suite-vanity':'primary-vanity');$('objectSelect').value=selected;editor();setTab('layout');
 if(keepPhoto&&!photoActive)startPhoto();
}
function livingOverview(){if(currentFloor!=='main')switchFloor('main');roomIndex=1;setMode('orbit');camera.position.set(27,31,34);orbit.target.set(43,1,12);orbit.update();$('currentRoom').textContent='Living + dining · furnished layout';$('roomSelect').value=1;refreshLighting();}
function viewFamily(){if(currentFloor!=='main')switchFloor('main');roomIndex=1;setMode('walk');camera.position.set(42.4,5.6,22.9);yaw=-.85;pitch=-.14;look();$('roomSelect').value=1;$('currentRoom').textContent='Family room · north-wall TV / southwest dining';refreshLighting();}
function viewDining(){
 if(currentFloor!=='main')switchFloor('main');const o=state.objects.find(o=>o.id==='dining');if(!o)return;
 roomIndex=3;setMode('walk');perspective.fov=Math.min(80,Math.max(52,2*Math.atan(Math.tan(26*Math.PI/180)*1.15/perspective.aspect)*180/Math.PI));perspective.updateProjectionMatrix();camera.position.set(o.x+8,5.6,o.z+5.3);
 const target=new THREE.Vector3(o.x,3.1,o.z),delta=camera.position.clone().sub(target);yaw=Math.atan2(delta.x,delta.z);pitch=-Math.atan2(delta.y,Math.hypot(delta.x,delta.z));look();
 $('roomSelect').value=roomIndex;$('currentRoom').textContent='Dining · pale stone, dark bronze & olive';refreshLighting();
}
function viewStove(){
 if(currentFloor!=='main')switchFloor('main');
 const o=state.objects.find(o=>o.id==='great-stove');if(!o)return;
 roomIndex=1;setMode('walk');const a=o.rotation*Math.PI/180;
 camera.position.set(o.x-Math.sin(a)*5.8,4.6,o.z-Math.cos(a)*5.8);yaw=Math.atan2(camera.position.x-o.x,camera.position.z-o.z);pitch=-.34;look();
 $('roomSelect').value=1;$('currentRoom').textContent='Quadra-Fire Discovery II';refreshLighting();
}
function viewDetail(view){
 if(currentFloor!=='main')switchFloor('main');setMode('walk');let target;
 if(view==='vanity'){
  const o=state.objects.find(o=>o.id==='suite-vanity')||state.objects.find(o=>o.type==='vanity'),a=o.rotation*Math.PI/180-(o.d>o.w?Math.PI/2:0);roomIndex=5;
  const q=vanitySchedule(o),c=q.cabinets.find(c=>c.sink_center_from_left_in!==''),offset=c?(q.v.width/2-c.start_from_left_in-c.assembly_width_in/2)/12:0,cx=o.x+Math.cos(a)*offset,cz=o.z-Math.sin(a)*offset;
  camera.position.set(cx-Math.sin(a)*3.4,5.2,cz-Math.cos(a)*3.4);target=new THREE.Vector3(cx,o.h+.15,cz);
 }else if(view==='front'||view==='back'){
  const back=view==='back';camera.position.set(back?44.5:42.8,5.3,back?12.6:45.2);target=new THREE.Vector3(43,4.2,back?.229:55.771);roomIndex=back?1:0;
 }else{
  const l=kitchenLayout(state.kitchen);roomIndex=2;
  if(view==='sink'){const u=l.units.find(u=>u.unitType==='sink'),a=u.rotation*Math.PI/180;camera.position.set(u.x-Math.sin(a)*3.6+Math.cos(a)*1.2,4.9,u.z-Math.cos(a)*3.6-Math.sin(a)*1.2);target=new THREE.Vector3(u.x,l.top/12+.55,u.z);}
  else{const u=l.units.find(u=>u.run==='island'&&u.unitType==='drawers'),a=u.rotation*Math.PI/180;camera.position.set(u.x-Math.sin(a)*3.3,3.65,u.z-Math.cos(a)*3.3);target=new THREE.Vector3(u.x,2.25,u.z);}
 }
 const delta=camera.position.clone().sub(target);yaw=Math.atan2(delta.x,delta.z);pitch=-Math.atan2(delta.y,Math.hypot(delta.x,delta.z));perspective.fov=45;perspective.updateProjectionMatrix();look();
 $('currentRoom').textContent={vanity:'Primary bath · basin, faucet & countertop',sink:'Kitchen · sink, faucet & stone',hardware:'Kitchen · handles, fronts & counter edge',front:'Front / east · offset vertical-lite door',back:'Back / west · French doors'}[view];$('roomSelect').value=roomIndex;refreshLighting();
}
async function reviewFinishes(view){
 if(photoLoading)return;
 perspective.fov=52;perspective.updateProjectionMatrix();mobileUI?.closePanel();
 if(currentFloor==='basement'){setMode('walk');roomIndex=rooms.findIndex(r=>/bath/i.test(r[0]));goRoom(Math.max(1,roomIndex));}
 else if(['sink','hardware','front','back','vanity'].includes(view)){viewDetail(view);}
 else if(view==='dining'){viewDining();}
 else if(view==='stove'){viewStove();}
 else if(view==='bath'){focusSuite('bath');if(isRevised()){camera.position.set(66.8,walkHeight,34.8);yaw=-2.66;pitch=-.24;look();refreshLighting();}}
 else if(view==='kitchen'){focusKitchen();const l=kitchenLayout(state.kitchen);camera.position.set(l.island.x+6.7,walkHeight,l.island.z-3.7);yaw=2.0;pitch=-.22;look();refreshLighting();}else viewFamily();
 setTab('finishes');if(!photoActive)await startPhoto();
}
function captureMarkedView(){
 if(photoLoading){toast('Wait for the realistic view to finish loading, then mark an area.');return null;}
 keys={};drag=null;orbit.enabled=false;
 if(photoActive)photoView.render(camera);else renderer.render(scene,camera);
 const image=document.createElement('canvas'),source=renderer.domElement,scale=Math.min(1,1920/source.width,1600/source.height);
 image.width=Math.round(source.width*scale);image.height=Math.round(source.height*scale);image.getContext('2d').drawImage(source,0,0,image.width,image.height);
 scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 return {image,pick:createAreaPicker({scene,camera,rooms,objects:state.objects,kitchenUnits:currentFloor==='main'&&state.kitchen?kitchenLayout(state.kitchen).units:[],floor:currentFloor}),context:{design:currentDesign,designName:DESIGN_NAMES[currentDesign],revision:state.planRevision||model.date,floor:currentFloor,floorLabel:currentFloor==='main'?'Main floor':'Basement',viewRoom:rooms[roomIndex]?.[0]||'House',mode,realistic:photoActive,ceilings,cutaway,exposure:renderer.toneMappingExposure,worldUnits:'feet',worldAxes:{east:'+Z',west:'-Z',north:'+X',south:'-X',up:'+Y'},imageSize:{width:image.width,height:image.height},camera:{type:camera.type,position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),zoom:camera.zoom,matrixWorld:camera.matrixWorld.toArray(),projectionMatrix:camera.projectionMatrix.toArray()},layout:clone(state)}};
}
function captureRoom(){
 if(photoLoading)return;
 if(photoActive)photoView.render(camera);else renderer.render(scene,camera);
 renderer.domElement.toBlob(blob=>{if(!blob){toast('The room image could not be saved.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='brines-'+currentFloor+'-'+(rooms[roomIndex]?.[0]||'room').replace(/[^a-z0-9]/gi,'-').toLowerCase()+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Room image saved.');},'image/png');
}
function viewStairs(){
 setMode('orbit');roomIndex=currentFloor==='main'?(isRevised()?15:14):7;$('roomSelect').value=roomIndex;$('currentRoom').textContent=isRevised()?'Stairs · front / east top → back / west bottom':'Earlier stair layout';
 camera.position.set(42,23,28);orbit.target.set(51.5,currentFloor==='main'?-2:3,37.2);orbit.update();selected=null;updateSelection();editor();
}
function suitePlan(){if(currentFloor!=='main')switchFloor('main');setMode('plan');roomIndex=5;$('roomSelect').value=5;$('currentRoom').textContent='Primary suite · '+DESIGN_NAMES[currentDesign];const centerZ=isRevised()?32.5:28;camera.position.set(66.9,90,centerZ);orbit.target.set(66.9,0,centerZ);camera.zoom=isRevised()?1.9:2.25;camera.updateProjectionMatrix();orbit.update();}

function updateArchitecture(){if(!wallGroup)return;clipPlane.constant=cutaway&&mode!=='walk'?4.3:100;wallGroup.traverse(o=>{if(o.material)o.material.clippingPlanes=[clipPlane];});ceilingGroup.visible=ceilings&&mode!=='plan';labelGroup.visible=mode==='plan';invalidatePhoto();}
function disposeGroup(g){if(!g)return;const materials=new Set();g.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of (Array.isArray(o.material)?o.material:[o.material]))materials.add(m);}});materials.forEach(m=>m.dispose());g.clear();}
function addBasin(g,x,y,z,w,d){const white=material('#f7f7ee'),inner=material('#bdc7c7');box(w,.13,d,x,y,z,white,g);box(w*.72,.04,d*.65,x,y+.072,z,inner,g);cyl(.04,.04,.45,x,y+.27,z-d*.38,material('#59696b',{metalness:.8,roughness:.3}),g);}
function buildObjects(){disposeGroup(objectGroup);meshes=[];cabinetMaterial=surfaceMaterial('cabinet',state);counterMaterial=surfaceMaterial('counter',state);const steel=material('#a6b0af',{metalness:.6,roughness:.4}),white=material('#f1f0e8'),dark=material('#293b42');
 for(const o of state.objects){const g=new THREE.Group();g.position.set(o.x,o.y||0,o.z);objectGroup.add(g);g.userData.entityId=o.id;const w=o.w,d=o.d,h=o.h;
 if(buildVanity(g,o,{box,cyl,material,cabinet:cabinetMaterial,metal:steel,counter:counterMaterial})){}
 else if(buildHouseObject(g,o,{box,cyl,material,cabinet:cabinetMaterial,metal:steel,addBasin,ceilingHeight})){}
 else if(buildSuiteObject(g,o,{box,cyl,material,cabinet:cabinetMaterial,metal:steel,counter:counterMaterial,tile:surfaceMaterial('tile',state,currentFloor==='basement'?'basement':'shower'),showerFloor:surfaceMaterial('tile',state,currentFloor==='basement'?'basement':'showerFloor')})){}
 else if(['cabinet','island','vanity'].includes(o.type)){box(w-.12,h-.22,d-.12,0,(h-.22)/2+.12,0,cabinetMaterial,g);box(w,.13,d,0,h-.065,0,counterMaterial,g);box(w-.25,.12,d-.25,0,.06,0,dark,g);const alongZ=d>w*1.3,run=alongZ?d:w,n=Math.max(1,Math.round(run/2)),faceSign=o.type==='island'?-1:1;for(let i=0;i<n;i++){const t=-run/2+(i+.5)*run/n;if(alongZ){box(.035,h-.55,d/n-.08,faceSign*(w/2+.01),h/2,t,cabinetMaterial,g);box(.04,.035,.5,faceSign*(w/2+.05),h-.55,t,steel,g);}else{box(w/n-.08,h-.55,.035,t,h/2,-d/2-.01,cabinetMaterial,g);box(.5,.035,.04,t,h-.55,-d/2-.05,steel,g);}}if(o.type==='vanity'){const longX=w>=d;for(const t of [-.24,.24])addBasin(g,longX?w*t:0,h+.03,longX?0:d*t,Math.min(w*.36,1.5),Math.min(d*.36,1.2));}if(o.type==='island'){for(const z of [-d/3,0,d/3]){cyl(.55,.55,.12,w/2+.9,2.05,z,material('#ccbaa0'),g);for(const x of [-.3,.3])for(const zz of [-.3,.3])box(.055,2,.055,w/2+.9+x,1,z+zz,dark,g);}}}
 else if(o.type==='sink'){addBasin(g,0,h/2,0,w,d);}
 else if(o.type==='range'){box(w,h-.12,d,0,(h-.12)/2,0,steel,g);box(w,.09,d,0,h-.045,0,dark,g);for(const x of [-w*.25,w*.25])for(const z of [-d*.25,d*.25])cyl(.28,.28,.025,x,h+.012,z,steel,g);box(w*.8,h*.43,.04,0,h*.4,-d/2-.025,dark,g);}
 else if(o.type==='fridge'){box(w,h,d,0,h/2,0,steel,g);box(.03,h,.04,0,h/2,-d/2-.01,dark,g);for(const x of [-.15,.15])box(.035,1.5,.1,x,h*.6,-d/2-.06,dark,g);}
 else if(o.type==='appliance'){box(w,h,d,0,h/2,0,white,g);const ring=cyl(.75,.75,.1,0,h*.43,-d/2-.03,dark,g);ring.rotation.x=Math.PI/2;}
 else if(o.type==='table'){box(w,.14,d,0,h-.07,0,cabinetMaterial,g);for(const x of [-w*.38,w*.38])for(const z of [-d*.32,d*.32])box(.1,h-.14,.1,x,(h-.14)/2,z,dark,g);if(o.id==='dining'){for(const x of [-w*.3,0,w*.3])for(const sign of [-1,1]){box(1.2,.16,1.2,x,1.45,sign*(d/2+1),cabinetMaterial,g);box(1.2,1,.09,x,2,sign*(d/2+1.5),cabinetMaterial,g);}}}
 else if(o.type==='sofa'){const fabric=material('#d1d5cc');box(w,.8,d,0,.8,0,fabric,g);box(w,h-1,.45,0,1.3+(h-1)/2,d/2-.23,fabric,g);for(const x of [-1,1])box(.45,h-.4,d,x*(w/2-.225),(h-.4)/2+.4,0,fabric,g);for(let i=0;i<3;i++)box((w-.95)/3-.045,.3,d-.6,-(w-.95)/3+i*(w-.95)/3,1.35,-.1,material('#dfe1d7'),g);}
 else if(o.type==='bed'){box(w,.7,d,0,.5,0,cabinetMaterial,g);box(w-.15,h-.75,d-.1,0,.8+(h-.75)/2,0,white,g);box(w+.1,3.3,.17,0,1.65,d/2,cabinetMaterial,g);box(w-.12,.08,d*.6,0,h+.04,-d*.18,material('#879e9f'),g);for(const x of [-w*.23,w*.23])box(w*.42,.3,1.3,x,h+.15,d*.32,white,g);}
 else if(o.type==='tub'){const profile=[[0,.1],[.66,.1],[.84,.18],[.96,h*.72],[1,h-.08],[1,h],[.87,h],[.82,h*.7],[.65,.32],[0,.32]].map(([x,y])=>new THREE.Vector2(x,y));const shell=new THREE.Mesh(new THREE.LatheGeometry(profile,48),material('#f4f3ec',{roughness:.19,clearcoat:.4,side:THREE.DoubleSide}));shell.scale.set(w/2,1,d/2);shell.castShadow=true;shell.receiveShadow=true;g.add(shell);cyl(.065,.065,.018,0,.325,0,steel,g);cyl(.04,.04,h+.45,w*.42,(h+.45)/2,-d*.12,steel,g);box(.36,.045,.055,w*.34,h+.4,-d*.12,steel,g);}
 else if(o.type==='shower'){box(w,.14,d,0,.07,0,material('#b6b9b1'),g);const glass=material('#f4fbfc',{transmission:.96,thickness:.03,ior:1.5,roughness:.035,side:THREE.DoubleSide});box(w,h,.045,0,h/2,-d/2,glass,g);box(.045,h,d,-w/2,h/2,0,glass,g);box(w,.04,.04,0,h,-d/2,steel,g);cyl(.05,.05,2,w/2-.15,h-.8,0,steel,g);box(.7,.04,.7,w/2-.4,h+.1,0,steel,g);}
 else if(o.type==='toilet'){box(w*.75,h*.8,.55,0,h*.4,d*.36,white,g);const bowl=cyl(w*.45,w*.28,h*.55,0,h*.28,-d*.15,white,g);bowl.scale.z=1.3;const seat=cyl(w*.39,w*.39,.07,0,h*.58,-d*.15,material('#d4e1dc'),g);seat.scale.z=1.3;}
 else if(o.type==='screen'){box(w,h,d,0,h/2,0,dark,g);box(w-.1,h-.1,.015,0,h/2,d/2+.01,material('#25343b',{roughness:.17,clearcoat:.65}),g);}
 else if(o.type==='gameTable'){box(w,.35,d,0,h-.175,0,cabinetMaterial,g);box(w-.5,.025,d-.5,0,h+.015,0,material('#315d58',{roughness:.95}),g);for(const x of [-w*.34,w*.34])for(const z of [-d*.36,d*.36])box(.28,h-.35,.28,x,(h-.35)/2,z,dark,g);}
 else if(o.type==='shelves'){for(const x of [-w/2+.05,w/2-.05])for(const z of [-d/2+.05,d/2-.05])box(.1,h,.1,x,h/2,z,steel,g);for(let i=0;i<5;i++)box(w,.09,d,0,.2+i*(h-.3)/4,0,cabinetMaterial,g);}
 else box(w,h,d,0,h/2,0,cabinetMaterial,g);
 // Dimensions are world-axis extents. Rotation changes visual orientation for free furniture only.
 g.rotation.y=o.rotation*Math.PI/180;
 g.traverse(m=>{if(m.isMesh){m.userData.entityId=o.id;meshes.push(m);}});
 }
 if(currentFloor==='main'&&state.kitchen){const group=new THREE.Group();objectGroup.add(group);buildKitchen(group,state.kitchen,{cabinet:cabinetMaterial,counter:counterMaterial,box:material('#cbb392'),metal:material('#35494c',{metalness:.6,roughness:.35}),fabric:material('#d3c9b5')});group.traverse(m=>{if(m.isMesh&&m.userData.entityId)meshes.push(m);});}
 applySurfaceMaterials(objectGroup,state);updateSelection();updateClearances();suiteStudy?.refresh();invalidatePhoto();
}
function lightColor(k){return new THREE.Color(k<=2700?'#ffbe7d':k<=3000?'#ffd1a0':k<=3500?'#ffdfbb':k<=4000?'#ffe9d1':'#f3f6ff');}
function syncKitchenFixtures(){if(currentFloor!=='main'||!state.kitchen)return;const k=state.kitchen,l=kitchenLayout(k);syncKitchenPendants(state,l);const previous=new Map(state.lights.filter(x=>x.id.startsWith('k-task-')).map(l=>[l.id,l]));state.lights=state.lights.filter(x=>!x.id.startsWith('k-task-'));for(const u of kitchenUppers(k)){const id='k-task-'+u.id,old=previous.get(id);state.lights.push({...old,id,name:'Under-cabinet '+u.id,type:'strip',x:u.x,z:u.z,y:u.bottom/12-.06,width:u.width/12,rotation:u.rotation,kelvin:old?.kelvin??3000,power:old?.power??250,on:old?.on??true});}}
function buildLights(){syncKitchenFixtures();disposeGroup(lightGroup);lightMeshes=[];pointLights=[];
 for(const l of state.lights){const y=l.y||ceilingHeight(l.x,l.z)-.13;const c=lightColor(l.kelvin);const mat=material(l.on?c:'#777b76',{emissive:l.on?c:'#000000',emissiveIntensity:l.on?1.3:0});const g=new THREE.Group();g.position.set(l.x,y,l.z);g.userData.lightId=l.id;lightGroup.add(g);
 if(l.type==='strip'){const strip=box(l.width,.025,.045,0,0,0,mat,g);g.rotation.y=l.rotation*Math.PI/180;}else if(l.type==='pendant'){buildPendant(g,l,ceilingHeight(l.x,l.z));}else{const disc=cyl(.26,.26,.045,0,0,0,mat,g);disc.rotation.z=Math.atan((ceilingHeight(l.x+.01,l.z)-ceilingHeight(l.x-.01,l.z))/.02);}
 g.traverse(m=>{if(m.isMesh){m.userData.lightId=l.id;lightMeshes.push(m);}});
 // Keep a bounded number of true lights for reliable browser performance.
 }
 for(let i=0;i<(photoActive?Math.min(state.lights.length,12):8);i++){const light=new THREE.SpotLight(0xffddb7,0,40,Math.PI*.42,.65,2);light.radius=.2;light.castShadow=photoActive&&i<3;light.shadow.mapSize.set(1024,1024);light.shadow.bias=-.00015;light.shadow.normalBias=.02;light.shadow.camera.near=.1;light.shadow.camera.far=40;scene.add(light,light.target);pointLights.push(light);}refreshLighting();
}
function rebuildLights(){for(const p of pointLights){scene.remove(p,p.target);p.dispose();}buildLights();invalidatePhoto();}
function refreshLighting(){if(!hemi)return;const night=state.daylight==='night',evening=state.daylight==='evening';hemi.color.set(night?'#d4e2f2':evening?'#f4e6d5':'#ffffff');hemi.groundColor.set(night?'#7d838a':evening?'#b5a18c':'#e7e7e7');sun.color.set(evening?'#ffd4a3':'#ffffff');hemi.intensity=night?.16:evening?.5:1.65;sun.intensity=night?0:evening?1.2:2.8;scene.background.set(night?'#263941':evening?'#a7b4b4':'#d9dfdc');let target=mode==='walk'?perspective.position:new THREE.Vector3(rooms[roomIndex][1],0,rooms[roomIndex][2]);const active=state.lights.filter(l=>l.on&&l.style!=='none').sort((a,b)=>Math.hypot(a.x-target.x,a.z-target.z)-Math.hypot(b.x-target.x,b.z-target.z)).slice(0,pointLights.length);pointLights.forEach((p,i)=>{const l=active[i];if(!l){p.intensity=0;return;}p.position.set(l.x,(l.y||ceilingHeight(l.x,l.z))-.5,l.z);p.target.position.set(l.x,0,l.z);p.target.updateMatrixWorld();p.updateMatrixWorld();p.color.copy(lightColor(l.kelvin));p.intensity=(photoActive?l.power/7:l.power/9)*(night?1:evening?.7:.03);});if(photoView){photoView.setDaylight(state.daylight);invalidatePhoto('lights');}}
function updateSelection(){if(selectionBox){scene.remove(selectionBox);selectionBox.geometry.dispose();}let g;objectGroup.traverse(o=>{if(o.isGroup&&o.userData.entityId===selected)g=o;});if(g&&['layout','kitchen'].includes(tab)&&!photoActive){selectionBox=new THREE.BoxHelper(g,0x268ab5);scene.add(selectionBox);}else selectionBox=null;}
function extent(o,axis){const a=o.rotation*Math.PI/180;return axis==='x'?(Math.abs(Math.cos(a))*o.w+Math.abs(Math.sin(a))*o.d)/2:(Math.abs(Math.sin(a))*o.w+Math.abs(Math.cos(a))*o.d)/2;}
function updateClearances(){if(currentFloor==='main'&&state.kitchen){const l=kitchenLayout(state.kitchen);$('aisleWest').textContent=feet(l.clearance.west/12);$('aisleSouth').textContent=feet(l.clearance.south/12);return;}const island=state.objects.find(o=>o.id==='island'),west=state.objects.find(o=>o.id==='west-counter'),range=state.objects.find(o=>o.id==='range-run');$('aisleWest').textContent=island&&west?feet(island.x-extent(island,'x')-west.x-extent(west,'x')):'—';$('aisleSouth').textContent=island&&range?feet(range.z-extent(range,'z')-island.z-extent(island,'z')):'—';}
function populateLists(){for(const [id,key] of [['cabinetFinish','cabinet'],['counterFinish','counter'],['wallColor','wall'],['floorFinish','floor']])$(id).value=state.finishes[key];$('daylight').value=state.daylight;const fill=(el,items,value)=>{el.replaceChildren();items.forEach(([id,label])=>{let op=document.createElement('option');op.value=id;op.textContent=label;el.append(op);});el.value=value;};fill($('roomSelect'),rooms.map((r,i)=>[i,r[0]]),roomIndex);fill($('objectSelect'),state.objects.map(o=>[o.id,o.name]),selected);fill($('lightSelect'),state.lights.map(o=>[o.id,o.name]),selectedLight);}
function inputField(label,value,min,max,step,fn){const lab=document.createElement('label');lab.textContent=label;const input=document.createElement('input');input.type='number';input.value=Number(value.toFixed(3));input.min=min;input.max=max;input.step=step;input.onchange=()=>{const n=Number(input.value);if(!Number.isFinite(n)){input.value=value;return;}fn(Math.min(max,Math.max(min,n)));};lab.append(input);return lab;}
function editor(){const e=$('objectEditor');e.replaceChildren();const o=state.objects.find(o=>o.id===selected);if(o){const title=document.createElement('h3');title.className='editorTitle';title.textContent=o.name;e.append(title);const grid=document.createElement('div');grid.className='grid2';[['Width (in)','w',1,600],['Depth (in)','d',1,600],['Height (in)','h',1,240],['Rotate (°)','rotation',-180,180],['Plan X (ft)','x',-5,81],['From back (ft)','z',-10,60]].forEach(([label,key,min,max])=>grid.append(inputField(label,o[key]*( ['w','d','h'].includes(key)?12:1),min,max,key==='rotation'?90:.5,n=>{o[key]=n/(['w','d','h'].includes(key)?12:1);buildObjects();save();editor();})));e.append(grid);const hint=document.createElement('p');hint.className='hint';hint.textContent='Position uses the drawing axes. Front / east is toward increasing Y; back / west is toward decreasing Y. Width and depth are object dimensions before rotation. In floor plan, drag the selected object to move it.';e.append(hint);const del=document.createElement('button');del.className='delete';del.textContent='Remove object';del.onclick=()=>{state.objects=state.objects.filter(x=>x.id!==selected);selected=state.objects[0]?.id;buildObjects();populateLists();editor();save();};e.append(del);}
 const le=$('lightEditor');le.replaceChildren();const l=state.lights.find(l=>l.id===selectedLight);if(l){const title=document.createElement('h3');title.className='editorTitle';title.textContent=l.name;le.append(title);const grid=document.createElement('div');grid.className='grid2';[['Plan X (ft)','x',-5,81,.5],['From back (ft)','z',-10,60,.5],['Height (ft), 0 = ceiling','y',0,25,.1],['Color temperature (K)','kelvin',2200,5000,100],['Output (lumens)','power',0,3000,50]].forEach(([label,key,min,max,step])=>grid.append(inputField(label,l[key],min,max,step,n=>{l[key]=n;rebuildLights();save();})));le.append(grid);const label=document.createElement('label');label.className='toggleLabel';const check=document.createElement('input');check.type='checkbox';check.checked=l.on;check.onchange=()=>{l.on=check.checked;rebuildLights();save();};label.append(check,document.createTextNode('Light on'));le.append(label);const del=document.createElement('button');del.className='delete';del.textContent='Remove light';del.onclick=()=>{state.lights=state.lights.filter(x=>x.id!==selectedLight);selectedLight=state.lights[0]?.id;rebuildLights();populateLists();editor();save();};le.append(del);}}
function setTab(t){tab=t;document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));['kitchen','bathrooms','layout','lighting','finishes'].forEach(n=>$(n+'Panel').hidden=t!==n);updateSelection();if(t==='kitchen')kitchenUI?.render();if(t==='bathrooms')bathroomUI?.render();if(t==='finishes')finishUI?.render();}
function setMode(m,keepPhoto=false){wheelTravel=0;perspective.fov=52;perspective.updateProjectionMatrix();mobileUI?.refresh(m);if(!keepPhoto)stopPhoto();mode=m;$('planOrientation').hidden=m!=='plan';measuring=false;$('measure').classList.remove('active');measurement=[];clearMeasure();camera=m==='plan'?orthographic:perspective;orbit.object=camera;orbit.enabled=m!=='walk';orbit.enableRotate=m==='orbit';document.querySelectorAll('#views button').forEach(b=>b.classList.toggle('active',b.dataset.view===m));$('walkControls').hidden=m!=='walk';$('crosshair').hidden=m!=='walk';if(m==='walk'){ceilings=true;cutaway=false;const r=rooms[roomIndex||1];perspective.position.set(r[1],walkHeight,r[2]);yaw=0;pitch=0;look();}else if(m==='plan'){ceilings=false;camera.position.set(currentFloor==='basement'?52:38,90,28);camera.up.set(0,0,-1);orbit.target.set(currentFloor==='basement'?52:38,0,28);camera.lookAt(currentFloor==='basement'?52:38,0,28);}else{camera.up.set(0,1,0);ceilings=false;cutaway=true;fitView();}$('ceiling').textContent='Ceilings: '+(ceilings?'on':'off');$('cutaway').textContent='Walls: '+(cutaway?'cutaway':'full');$('help').textContent=m==='walk'?'Wheel ↑ forward / ↓ backward · WASD / arrows to move · Drag to look':m==='plan'?'Drag selected fixture to move · Scroll to zoom · Measure two floor points':'Drag to orbit · Scroll to zoom · Click a fixture to edit';updateArchitecture();resize();refreshLighting();}
function fitView(){if(mode==='walk'){goRoom(roomIndex||1);return;}if(mode==='plan'){orthographic.zoom=1;orthographic.position.set(currentFloor==='basement'?52:38,90,28);orbit.target.set(currentFloor==='basement'?52:38,0,28);orthographic.updateProjectionMatrix();}else{perspective.position.set(104,88,105);orbit.target.set(39,0,28);}orbit.update();}
function goRoom(i){wheelTravel=0;roomIndex=Number(i);const [name,x,z]=rooms[roomIndex];$('currentRoom').textContent=name;$('roomSelect').value=roomIndex;if(mode==='walk'){camera.position.set(x,walkHeight,z);yaw=0;pitch=0;look();}else if(roomIndex===0)fitView();else if(mode==='plan'){orbit.target.set(x,0,z);camera.position.set(x,90,z);camera.zoom=2.6;camera.updateProjectionMatrix();}else{orbit.target.set(x,2,z);camera.position.set(x+21,25,z+26);}orbit.update();refreshLighting();}
function resize(){if(!renderer)return;const w=$('viewport').clientWidth,h=$('viewport').clientHeight;renderer.setSize(w,h);perspective.aspect=w/h;perspective.updateProjectionMatrix();const span=currentFloor==='basement'?70:92;orthographic.left=-span/2;orthographic.right=span/2;orthographic.top=span/(w/h)/2;orthographic.bottom=-span/(w/h)/2;orthographic.updateProjectionMatrix();}
function look(){perspective.rotation.order='YXZ';perspective.rotation.set(pitch,yaw,0);}
function pointInside(x,z,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,zi]=poly[i],[xj,zj]=poly[j];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))yes=!yes;}return yes;}
function blocked(x,z){if(isRevised()){const obstacles=roomFurnitureObstacles(state.objects);if(currentFloor==='basement')obstacles.push(...suiteObstacleRects(state.objects.filter(o=>o.type==='suiteShower').map(o=>({...o,id:'suite-'+o.id}))));for(const [x0,z0,x1,z1] of obstacles)if(x>x0-.2&&x<x1+.2&&z>z0-.2&&z<z1+.2)return true;}if(isRevised()&&currentFloor==='main')for(const [x0,z0,x1,z1] of furnishingObstacles(state.objects))if(x>x0-.2&&x<x1+.2&&z>z0-.2&&z<z1+.2)return true;if(isExpanded()){for(const [x0,z0,x1,z1] of suiteObstacleRects(state.objects))if(x>x0-.28&&x<x1+.28&&z>z0-.28&&z<z1+.28)return true;if(!isRevised()&&x>62.85-.28&&x<62.97+.28&&z>37.667-.28&&z<40.167+.28)return true;}if(!pointInside(x,z,floorHull))return true;if(x>(isRevised()?46.3:currentFloor==='basement'?49.3:46.3)&&x<57.6&&z>33&&z<41.4)return true;for(const p of colliders){for(const [dx,dz] of [[0,0],[.28,0],[-.28,0],[0,.28],[0,-.28]])if(pointInside(x+dx,z+dz,p))return true;}return false;}
function mapPoint(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.ray.intersectPlane(floorPlane,new THREE.Vector3());}
function clearMeasure(){if(measureGroup)disposeGroup(measureGroup);$('measureLabel').hidden=true;}
function measurePoint(p){if(measurement.length===2){measurement=[];clearMeasure();}p.x=Math.round(p.x*12)/12;p.z=Math.round(p.z*12)/12;p.y=.11;measurement.push(p.clone());cyl(.12,.12,.12,p.x,.14,p.z,material('#1575a1'),measureGroup);if(measurement.length===2){const [a,b]=measurement;const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:0x1575a1}));measureGroup.add(line);$('measureLabel').textContent=`${feet(a.distanceTo(b))} · X ${feet(Math.abs(a.x-b.x))} · Y ${feet(Math.abs(a.z-b.z))}`;}else $('measureLabel').textContent='Choose the second point. Snaps to 1″ on the floor.';$('measureLabel').hidden=false;}
function events(){
 renderer.domElement.addEventListener('wheel',e=>{
  if(mode!=='walk'||photoLoading||markupUI?.active||document.querySelector('dialog[open]')||document.body.classList.contains('panel-open'))return;
  const distance=wheelWalkDistance(e,renderer.domElement.clientHeight);if(!distance)return;
  e.preventDefault();
  // Reversing the wheel brakes immediately instead of fighting queued travel.
  if(wheelTravel*distance<0)wheelTravel=0;
  wheelTravel=Math.max(-3,Math.min(3,wheelTravel+distance));
 },{passive:false});
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0||drag)return;const p=mapPoint(e);if(measuring&&p){measurePoint(p);return;}if(mode==='walk'){drag={look:true,pointerId:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);return;}const hits=raycaster.intersectObjects(tab==='lighting'?lightMeshes:meshes);if(hits.length){const hit=hits[0];if(tab==='lighting'){selectedLight=hit.object.userData.lightId;$('lightSelect').value=selectedLight;}else{selected=hit.object.userData.entityId;if(selected?.startsWith('k-')){setTab('kitchen');kitchenUI?.select(selected);updateSelection();return;}$('objectSelect').value=selected;updateSelection();if(tab==='bathrooms')bathroomUI?.select(selected);}editor();if(mode==='plan'&&p){const o=tab==='lighting'?state.lights.find(x=>x.id===selectedLight):state.objects.find(x=>x.id===selected);drag={o,pointerId:e.pointerId,dx:o.x-p.x,dz:o.z-p.z,light:tab==='lighting'};orbit.enabled=false;renderer.domElement.setPointerCapture(e.pointerId);}}});
 renderer.domElement.addEventListener('pointermove',e=>{if(!drag||drag.pointerId!==e.pointerId)return;if(drag.look){yaw-=(e.clientX-drag.x)*.004;pitch=Math.max(-1.35,Math.min(1.35,pitch-(e.clientY-drag.y)*.004));drag.x=e.clientX;drag.y=e.clientY;look();}else{const p=mapPoint(e);if(p){drag.o.x=Math.round((p.x+drag.dx)*12)/12;drag.o.z=Math.round((p.z+drag.dz)*12)/12;if(drag.light)rebuildLights();else buildObjects();}}});
 const end=e=>{if(drag&&drag.pointerId!==e.pointerId)return;if(drag&&!drag.look){save();editor();}drag=null;orbit.enabled=mode!=='walk';};renderer.domElement.addEventListener('pointerup',end);renderer.domElement.addEventListener('pointercancel',end);renderer.domElement.addEventListener('lostpointercapture',end);
 window.addEventListener('keydown',e=>{if(document.body.classList.contains('panel-open'))return;if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)||document.querySelector('dialog[open]'))return;keys[e.code]=true;if(mode==='walk'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='KeyE'&&mode==='walk'&&nearStairs(currentFloor,camera.position.x,camera.position.z,currentDesign)){switchFloor(otherFloor(currentFloor),true);return;}if(e.code==='Escape'){measuring=false;$('measure').classList.remove('active');}});window.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('blur',()=>{keys={};wheelTravel=0;drag=null;});
 document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();keys[b.dataset.key]=true;b.setPointerCapture(e.pointerId);};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys[b.dataset.key]=false;});
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setMode(b.dataset.view));document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));$('photoMode').onclick=startPhoto;$('designSelect').onchange=e=>switchDesign(e.target.value);$('suiteBath').onclick=()=>focusSuite('bath');$('suiteCloset').onclick=()=>focusSuite('closet');$('suiteEntry').onclick=()=>focusSuite('entry');$('suitePlan').onclick=suitePlan;$('floorSelect').onchange=e=>switchFloor(e.target.value);$('viewStairs').onclick=viewStairs;$('viewFamily').onclick=viewFamily;$('livingOverview').onclick=livingOverview;$('stairsButton').onclick=()=>switchFloor(otherFloor(currentFloor),true);$('stairPrompt').onclick=()=>switchFloor(otherFloor(currentFloor),true);$('roomSelect').onchange=e=>goRoom(e.target.value);$('home').onclick=fitView;$('objectSelect').onchange=e=>{selected=e.target.value;updateSelection();editor();};$('lightSelect').onchange=e=>{selectedLight=e.target.value;editor();};$('ceiling').onclick=()=>{if(photoActive)stopPhoto();ceilings=!ceilings;$('ceiling').textContent='Ceilings: '+(ceilings?'on':'off');updateArchitecture();};$('cutaway').onclick=()=>{if(photoActive)stopPhoto();cutaway=!cutaway;$('cutaway').textContent='Walls: '+(cutaway?'cutaway':'full');updateArchitecture();};$('measure').onclick=()=>{if(mode!=='plan')setMode('plan');measuring=!measuring;measurement=[];clearMeasure();$('measure').classList.toggle('active',measuring);if(measuring){$('measureLabel').hidden=false;$('measureLabel').textContent='Click two points on the floor plane. Snaps to 1″.';}};
 $('sourceToggle').onclick=()=>$('sourceDialog').showModal();$('auditButton').onclick=()=>$('auditDialog').showModal();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
 $('addObject').onclick=()=>{const type=$('addType').value;const r=rooms[roomIndex||2];const sizes={island:[4,8,3],cabinet:[3,2,3],vanity:[5,2,3],tub:[3,5.5,2],shower:[4,4,7],toilet:[1.5,2.5,2.4]}[type];const id='object-'+Date.now();state.objects.push({id,name:'New '+type,type,x:r[1],z:r[2],w:sizes[0],d:sizes[1],h:sizes[2],rotation:0});selected=id;buildObjects();populateLists();editor();save();};
 $('addLight').onclick=()=>{const r=rooms[roomIndex||1],type=$('lightType').value;selectedLight='light-'+Date.now();state.lights.push({id:selectedLight,name:'New '+type,type,x:r[1],z:r[2],y:type==='pendant'?6.5:0,kelvin:3000,power:800,on:true});rebuildLights();populateLists();editor();save();toast('Light added in this room. Use floor plan to drag it into position.');};
 $('daylight').value=state.daylight;$('daylight').onchange=e=>{state.daylight=e.target.value;refreshLighting();finishUI?.render();save();};
 $('export').onclick=()=>{floorStates[currentFloor]=state;const url=URL.createObjectURL(new Blob([JSON.stringify(forkExport(currentDesign,designStates),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='brines-house-all-designs.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('import').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(photoLoading)throw Error('Finish the view change before importing.');if(file.size>2000000)throw Error('This file is too large for a house layout.');const next=importDesignStates(JSON.parse(await file.text()),validState,basementDefaults);for(const levels of Object.values(next.designs))ensureKitchen(levels.main);designStates=next.designs;currentDesign=next.design;floorStates=designStates[currentDesign];state=floorStates[currentFloor];mainRooms=roomsForDesign();models=modelSets[currentDesign];switchFloor(currentFloor,false,true);save();toast('Imported. All three designs are available in the selector.');}catch(error){toast(error.message||'This is not a valid Brines layout.');}e.target.value='';};
 $('reset').onclick=()=>{if(!confirm('Reset fixtures, lighting and finishes for this floor of '+DESIGN_NAMES[currentDesign]+'? Export first to keep your changes.'))return;state=clone(currentFloor==='main'?defaults:basementDefaults);if(currentFloor==='main'){ensureKitchen(state);if(currentDesign==='expanded')state=expandedState(state);else if(isRevised())state=revisedMainState(state);}if(isRevised()&&currentFloor==='basement')state=revisedBasementState(state);floorStates[currentFloor]=state;selected=state.objects[0]?.id;selectedLight=state.lights[0].id;ensureSurfaces(state);applySurfaceMaterials(scene,state);buildObjects();finishUI?.render();rebuildLights();populateLists();editor();kitchenUI?.render();bathroomUI?.render();save();};
 $('mapCanvas').onclick=e=>{wheelTravel=0;const c=$('mapCanvas'),rect=c.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width*280/3.3-4,z=(e.clientY-rect.top)/rect.height*225/3.3-5;if(mode==='walk'){if(blocked(x,z)){toast('Choose a clear spot inside the house.');return;}camera.position.set(x,walkHeight,z);}else{orbit.target.set(x,0,z);if(mode==='plan')camera.position.set(x,90,z);else camera.position.set(x+20,25,z+25);}refreshLighting();};
 window.addEventListener('resize',resize);
}
function drawMap(){const c=$('mapCanvas'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.save();ctx.scale(3.3,3.3);ctx.translate(4,5);ctx.fillStyle='#30474c';ctx.beginPath();floorHull.forEach(([x,z],i)=>i?ctx.lineTo(x,z):ctx.moveTo(x,z));ctx.closePath();ctx.fill();ctx.fillStyle='#b8cdc4';for(const p of model.walls){ctx.beginPath();p.forEach(([x,z],i)=>i?ctx.lineTo(x,z):ctx.moveTo(x,z));ctx.closePath();ctx.fill();}if(mode==='walk'){ctx.fillStyle='#eec475';ctx.beginPath();ctx.arc(camera.position.x,camera.position.z,.8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#eec475';ctx.lineWidth=.25;ctx.beginPath();ctx.moveTo(camera.position.x,camera.position.z);ctx.lineTo(camera.position.x-Math.sin(yaw)*3,camera.position.z-Math.cos(yaw)*3);ctx.stroke();}else{ctx.fillStyle='#eec475';ctx.beginPath();ctx.arc(orbit.target.x,orbit.target.z,.65,0,Math.PI*2);ctx.fill();}ctx.restore();}
let frame=0,wheelTravel=0;
function animate(){
 requestAnimationFrame(animate);const dt=Math.min(.05,clock.getDelta());
 if(markupUI?.active){wheelTravel=0;return;}
 if(mode==='walk'&&!document.querySelector('dialog[open]')&&!document.body.classList.contains('panel-open')){
  const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),side=(keys.KeyD?1:0)-(keys.KeyA?1:0);
  if(keys.ArrowLeft)yaw+=dt*1.4;if(keys.ArrowRight)yaw-=dt*1.4;
  const speed=(keys.ShiftLeft?11:5)*dt,len=Math.hypot(forward,side)||1;
  const wheelStep=Math.abs(wheelTravel)<.002?wheelTravel:wheelTravel*(1-Math.exp(-18*dt));wheelTravel-=wheelStep;
  const travel=forward*speed/len+wheelStep,strafe=side*speed/len;
  const moved=moveOnFloor(camera.position,-Math.sin(yaw)*travel+Math.cos(yaw)*strafe,-Math.cos(yaw)*travel-Math.sin(yaw)*strafe,blocked,()=>{
   if(performance.now()>stairCooldown&&entersStairs(currentFloor,camera.position.x,camera.position.z,currentDesign)){switchFloor(otherFloor(currentFloor),true);return true;}return false;
  });
  look();if(moved&&frame%30===0)refreshLighting();
 }else{wheelTravel=0;orbit.update();}
 if(frame++%5===0){drawMap();const near=mode==='walk'&&nearStairs(currentFloor,camera.position.x,camera.position.z,currentDesign);$('stairPrompt').hidden=!near;$('stairPrompt').textContent=currentFloor==='main'?'Go downstairs · E':'Go upstairs · E';}
 try{if(!photoActive||!photoView?.render(camera))renderer.render(scene,camera);}catch(error){stopPhoto();toast('Realistic mode could not render on this device. The standard walk-through is still available.');console.error(error);renderer.render(scene,camera);}
}

function stopPhoto(){const wasActive=photoActive;photoActive=false;photoView?.deactivate();$('photoMode').classList.remove('active');$('photoStatus').hidden=true;$('exposureControl').hidden=true;$('qualityControl').hidden=true;document.body.classList.remove('photo-view');if(objectGroup)updateSelection();if(wasActive)rebuildLights();}
async function startPhoto(){
 if(photoLoading)return;
 if(photoActive){stopPhoto();return;}
 photoLoading=true;$('photoStatus').hidden=false;$('photoStatus').textContent='Starting real-time walkthrough…';$('photoMode').disabled=true;
 try{
  const {PhotoRenderer}=await import('./photo-renderer.js?v=neutral-2');
  if(!photoView)photoView=new PhotoRenderer(renderer,scene,perspective,text=>{$('photoStatus').textContent=text;});
  if(mode!=='walk'){if(!roomIndex)roomIndex=currentFloor==='main'?2:1;setMode('walk',true);goRoom(roomIndex);}else{ceilings=true;cutaway=false;updateArchitecture();}
  photoActive=true;$('exposureControl').hidden=false;$('qualityControl').hidden=false;$('photoStatus').hidden=false;$('photoMode').classList.add('active');document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));document.body.classList.add('photo-view');
  rebuildLights();photoView.activate(perspective);photoView.setQuality($('renderQuality').value);renderer.toneMappingExposure=1.05*Math.pow(2,Number($('exposure').value));photoView.setDaylight(state.daylight);updateSelection();
  $('ceiling').textContent='Ceilings: on';$('cutaway').textContent='Walls: full';$('help').textContent='Wheel ↑ forward / ↓ backward · WASD to move · Drag to look';
 }catch(error){stopPhoto();toast(error.message||'Realistic mode is unavailable on this device.');console.error(error);}
 finally{photoLoading=false;$('photoMode').disabled=false;if(pendingFloor){const pending=pendingFloor;pendingFloor=null;switchFloor(pending.next,pending.viaStairs,pending.force);}if(pendingDesign){const next=pendingDesign;pendingDesign=null;switchDesign(next);}}
}

async function init(){try{const loaded=await Promise.all(['./model.json','./basement-model.json','./expanded-suite-model.json','./revision-main-model.json','./revision-basement-model.json'].map(async url=>{const response=await fetch(url);if(!response.ok)throw Error('The geometry file could not be loaded.');return response.json();}));modelSets={original:{main:loaded[0],basement:loaded[1]},expanded:{main:loaded[2],basement:loaded[1]},revised:{main:loaded[3],basement:loaded[4]}};models=modelSets[currentDesign];model=models.main;scene=new THREE.Scene();scene.background=new THREE.Color('#d9dfdc');renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.localClippingEnabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.05;$('viewport').append(renderer.domElement);perspective=new THREE.PerspectiveCamera(52,1,.06,500);orthographic=new THREE.OrthographicCamera(-46,46,40,-40,.1,500);camera=perspective;orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.dampingFactor=.1;orbit.maxPolarAngle=Math.PI/2-.025;orbit.minDistance=4;orbit.maxDistance=180;orbit.target.set(39,0,28);objectGroup=new THREE.Group();lightGroup=new THREE.Group();measureGroup=new THREE.Group();scene.add(objectGroup,lightGroup,measureGroup);hemi=new THREE.HemisphereLight(0xf4f8ff,0xc3beb1,2);scene.add(hemi);sun=new THREE.DirectionalLight(0xfffaf2,3);sun.position.set(8,70,-40);sun.target.position.set(42,0,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-65;sun.shadow.camera.right=65;sun.shadow.camera.top=65;sun.shadow.camera.bottom=-65;sun.shadow.camera.near=.5;sun.shadow.camera.far=200;sun.shadow.bias=-.00008;sun.shadow.normalBias=.01;scene.add(sun,sun.target);const missingTextures=await loadSurfaceTextures(renderer.capabilities.getMaxAnisotropy());if(missingTextures)toast('Some scanned textures could not load. Reload to try again.');buildArchitecture();buildObjects();buildLights();populateLists();editor();events();kitchenUI=mountKitchenUI($('kitchenPanel'),{get:()=>currentFloor==='main'?state.kitchen:null,change:kitchenChanged,replace:k=>state.kitchen=k,focus:focusKitchen,select:id=>{selected=id;updateSelection();},toast});bathroomUI=mountBathroomUI($('bathroomsPanel'),{objects:()=>state.objects,floor:()=>currentFloor,design:()=>currentDesign,select:id=>{selected=id;updateSelection();editor();},change:()=>{buildObjects();populateLists();editor();save();},all:()=>Object.entries(designStates[currentDesign]).flatMap(([floor,s])=>s.objects.filter(isVanity).map(object=>({floor,object}))),restore:data=>restoreBathroomLayout(data,designStates[currentDesign],currentDesign,validState),toast});finishUI=mountFinishUI($('finishesPanel'),{get:()=>state,floor:()=>currentFloor,change:()=>{applySurfaceMaterials(scene,state);buildObjects();kitchenUI?.render();bathroomUI?.render();invalidatePhoto('materials');save();},review:reviewFinishes,lighting:value=>{state.daylight=value;$('daylight').value=value;refreshLighting();save();},capture:captureRoom,toast});markupUI=mountAreaMarkup({capture:captureMarkedView,release:()=>{keys={};drag=null;orbit.enabled=mode!=='walk';},toast});$('markArea').onclick=$('markAreaStudio').onclick=()=>{mobileUI?.closePanel();markupUI.open();};$('finishStudio').onclick=()=>{setTab('finishes');$('finishesPanel').scrollIntoView({block:'start',behavior:'smooth'});if(!photoActive)startPhoto();};mountStairStudy();$('renderQuality').onchange=e=>photoView?.setQuality(e.target.value);$('exposure').oninput=e=>{renderer.toneMappingExposure=1.05*Math.pow(2,Number(e.target.value));$('exposureValue').textContent=Number(e.target.value).toFixed(1)+' EV';};suiteStudy=mountSuiteStudy({getDesign:()=>currentDesign,getStates:()=>designStates,models:modelSets});mobileUI=mountMobileUI({resize,stopMovement:()=>{keys={};drag=null;orbit.enabled=mode!=='walk';}});setMode('orbit');refreshFloorUI();if(isRevised())viewFamily();else focusSuite('bath');$('loading').hidden=true;setTab('finishes');save();animate();await startPhoto();}catch(e){$('loading').hidden=true;$('error').hidden=false;$('error').textContent='The 3D model could not start. Please use a browser with WebGL enabled and reload. '+e.message;console.error(e);}}
init();
