import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import * as THREE from 'three';
import {defaultKitchen,kitchenLayout,validKitchen} from '../dist/kitchen-engine.js';
import {applyCornerOption} from '../dist/kitchen-corner.js';
import {cabinetSpecifications} from '../dist/kitchen-specs.js';
import {makeKitchenHandoff} from '../dist/kitchen-ui.js';
import {isVanity,vanitySettings,vanitySchedule,validVanitySpec,buildVanity,bathroomExports,restoreBathroomLayout} from '../dist/bathroom-cabinets.js';
import {expandedState} from '../dist/suite-config.js';
import {basementObjects} from '../dist/basement-config.js';
import {stairStudy,stairSVG} from '../dist/stair-study.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`),out=process.env.MAKER_QA_DIR;
if(out)fs.mkdirSync(out,{recursive:true});
for(const style of ['closed','piecut']){
 const k=applyCornerOption(defaultKitchen(),style),l=kitchenLayout(k),spec=cabinetSpecifications(k),pack=makeKitchenHandoff(k);assert.equal(validKitchen(k),true);for(const n of Object.values(l.remaining))near(n,0);near(l.sink.z,17.5);
 assert.equal(spec.cabinets.some(c=>c.cabinet_id==='C01'),style==='piecut');assert.equal(spec.panels.some(p=>p.panel_id==='C01'),style==='closed');
 if(style==='closed'){assert.ok(spec.hardware.some(h=>h.cabinet_id==='S01'));assert.equal(spec.fronts.find(f=>f.cabinet==='S01').kind,'pull-out');}
 if(style==='piecut'){assert.equal(spec.fronts.filter(f=>f.cabinet==='C01').length,2);near(spec.fronts.find(f=>f.cabinet==='C01').width,11.75);}
 for(const [name,data] of Object.entries(pack.files)){assert.ok(!/NaN|undefined/.test(data),name);if(out&&name.endsWith('.svg')){const file=path.join(out,style,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,data);}}
 assert.ok(pack.files['AI-revision-brief.txt']);
}
const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8'),objects=vm.runInNewContext('('+app.match(/const baseObjects=(\[[\s\S]*?\n\]);/)[1]+')');
const expanded=expandedState({schema:1,objects:structuredClone(objects),lights:[]}),levels={main:expanded,basement:{schema:1,objects:structuredClone(basementObjects),lights:[]}},entries=Object.entries(levels).flatMap(([floor,level])=>level.objects.filter(isVanity).map(object=>({floor,object})));
const context={box(w,h,d,x,y,z,m,g){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);g.add(mesh);return mesh;},cyl(a,b,h,x,y,z,m,g){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(a,b,h),m);mesh.position.set(x,y,z);g.add(mesh);return mesh;},material:color=>new THREE.MeshStandardMaterial({color}),cabinet:new THREE.MeshStandardMaterial(),metal:new THREE.MeshStandardMaterial(),counter:new THREE.MeshStandardMaterial()};
for(const {floor,object:o} of entries){const q=vanitySchedule(o,floor);assert.deepEqual(q.warnings,[]);assert.equal(validVanitySpec(o),true);near(q.remaining,0);near(q.top.gross_sqft,q.v.width*q.v.depth/144);
 for(const c of q.cabinets){const f=q.fronts.filter(f=>f.cabinet===c.cabinet_id);for(const face of f){assert.ok(face.width>0&&face.height>0);assert.ok(face.y-face.height/2>=c.case_bottom_aff_in);assert.ok(face.y+face.height/2<=c.case_top_aff_in+.00001);}assert.ok(c.start_from_left_in+c.assembly_width_in<=q.v.width+.0001);}
 const root=new THREE.Group();assert.ok(buildVanity(root,o,context));root.updateMatrixWorld(true);root.traverse(m=>{if(m.isMesh)assert.ok(m.geometry.attributes.position.array.every(Number.isFinite));});// Handles project past the front; only the cabinet/top envelope must fit the scheduled depth.
 const bounds=new THREE.Box3();root.traverse(m=>{if(m.isMesh&&!m.material.userData.fixturePart)bounds.expandByObject(m);});const size=bounds.getSize(new THREE.Vector3());near(size.x,o.w);assert.ok(size.z<o.d+.01,'Fronts must stay under top depth');
}
const primary=entries.find(e=>e.object.id==='suite-vanity').object;primary.vanitySpec=vanitySettings(primary);primary.vanitySpec.units=[{id:'L',type:'sink',width:33},{id:'D',type:'drawers',width:29,drawerLayout:'four'},{id:'R',type:'sink',width:33}];let q=vanitySchedule(primary);near(q.remaining,0);assert.equal(q.top.sinks,2);assert.equal(q.fronts.filter(f=>f.kind==='drawer').length,4);primary.vanitySpec.units[1].width=30;assert.ok(vanitySchedule(primary).warnings.some(w=>w.includes('over the available')));primary.vanitySpec.units[1].width=29;
const pack=bathroomExports(entries);assert.equal(Object.keys(pack.files).filter(n=>n.endsWith('.csv')).length,7);for(const [name,data] of Object.entries(pack.files)){assert.ok(!/NaN|undefined/.test(data),name);if(out&&name.endsWith('.svg')){const f=path.join(out,'bathrooms',name);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,data);}}
const valid=level=>level.objects.every(o=>['x','z','w','d','h','rotation'].every(key=>Number.isFinite(o[key]))&&o.w>0&&o.d>0&&o.h>0&&validVanitySpec(o));const data=JSON.parse(pack.files['layout.json']);data.vanities[0].object.w+=.1;restoreBathroomLayout(data,levels,'expanded',valid);near(levels.main.objects.find(o=>o.id===data.vanities[0].object.id).w,data.vanities[0].object.w);const prior=JSON.stringify(levels),bad=structuredClone(data);bad.vanities.at(-1).object.w=-10;assert.throws(()=>restoreBathroomLayout(bad,levels,'expanded',valid));assert.equal(JSON.stringify(levels),prior,'Failed imports must be atomic');assert.throws(()=>restoreBathroomLayout(data,levels,'original',valid));
const comfortable=stairStudy(),compact=stairStudy({going:10,maxRiser:7.75});assert.equal(comfortable.risers,17);near(comfortable.requiredLength,147);near(comfortable.requiredDepth,94.5);assert.equal(comfortable.planFits,false);assert.equal(compact.risers,16);near(compact.riser,7.75);near(compact.requiredLength,132);near(compact.requiredDepth,92);assert.equal(compact.planFits,true);assert.equal(compact.headroomRisers,13);assert.equal(stairStudy({rise:125,going:10,maxRiser:7.75}).planFits,false);assert.throws(()=>stairStudy({rise:NaN}));
const measured=stairStudy({heightMode:'ceiling',ceilingHeight:112,assembly:16});near(measured.rise,128);assert.equal(measured.risers,18);
const opening=stairStudy({openingLength:150,openingDepth:100});assert.equal(opening.openingCoversFlights,true);assert.equal(opening.planFits,false,'Opening coverage must not imply footprint fit');
assert.throws(()=>stairStudy({openingLength:NaN}));assert.throws(()=>stairStudy({ceilingHeight:0}));assert.equal(stairStudy({heightMode:'rise',rise:124,ceilingHeight:null}).rise,124);
if(out){fs.writeFileSync(path.join(out,'stair-comfortable.svg'),stairSVG());fs.writeFileSync(path.join(out,'stair-compact.svg'),stairSVG({going:10,maxRiser:7.75}));}
console.log('Cabinet planning passed: both corner fits, measured exports, bathroom cases/fronts and mesh envelopes, atomic AI import, and L-stair calculations.');
