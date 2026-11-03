import {applyCornerOption} from "../dist/kitchen-corner.js";
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {defaultKitchen,validKitchen,kitchenLayout} from '../dist/kitchen-engine.js';
import {makerSettings,setKitchenValue} from '../dist/kitchen-settings.js';
import {stoneLayout,unionRectangles} from '../dist/kitchen-stone.js';
import {cabinetSpecifications,kitchenExports,designIdentifier,reviewDecisions,csvText,zipFiles} from '../dist/kitchen-specs.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`),k=applyCornerOption(defaultKitchen(),'closed'),m=makerSettings(k),c=cabinetSpecifications(k),stone=stoneLayout(k);
assert.deepEqual(c.counts,{cabinets:16,fronts:32,drawers:15,doors:14,pulls:31});
const base=c.cabinets.find(c=>c.cabinet_id==='W03');assert.equal(base.case_height_in,30);assert.equal(base.case_bottom_aff_in,4.5);assert.equal(base.case_depth_in,24);assert.equal(base.closed_depth_in,24.75);
const faces=c.fronts.filter(f=>f.cabinet==='W03');near(faces.reduce((sum,f)=>sum+f.height,0)+(faces.length+1)*m.reveal,base.case_height_in);assert.deepEqual(faces.map(f=>f.height),[6,11.75,11.75]);
for(const cab of c.cabinets){const fs=c.fronts.filter(f=>f.cabinet===cab.cabinet_id);for(const f of fs){assert.ok(f.width>0&&f.height>0);assert.ok(f.y-f.height/2>=cab.case_bottom_aff_in);assert.ok(f.y+f.height/2<=cab.case_top_aff_in);}const doors=fs.filter(f=>f.kind==='door');if(doors.length)near(doors.reduce((sum,f)=>sum+f.width,0)+(doors.length+1)*m.reveal,cab.assembly_width_in);}
const bridge=c.cabinets.find(c=>c.cabinet_id==='S04-BR');assert.equal(bridge.case_depth_in,24);assert.equal(bridge.case_height_in,18);assert.equal(bridge.case_bottom_aff_in,72);assert.equal(c.panels.find(p=>p.panel_id==='S05').finished_height_in,90);
// Independently measured union: west 141*25.5, closed corner L = 28.5² - 3²,
// south 3*25.5 + 24*25.5, island 48*96. Sink is not procurement waste.
near(stone.summary.counterArea,(141*25.5+28.5**2-3**2+27*25.5+48*96)/144);near(stone.summary.netCounterArea,stone.summary.counterArea-30*18/144);near(stone.summary.profileFeet,40.625);assert.equal(stone.zones.length,3);
const underWindow=stone.splashes.find(b=>b.label==='Below window');assert.equal(underWindow.width,48);assert.equal(underWindow.height,6);near(stone.summary.splashArea,((54+67.5)*18+48*6+(31.5-30/25.4)*18+36*36+24*18)/144);
const union=unionRectangles([{x1:0,x2:10,z1:0,z2:10},{x1:5,x2:15,z1:0,z2:10},{x1:0,x2:10,z1:0,z2:10}]);assert.equal(union.length,1);assert.equal(union[0].area,150);assert.equal(union[0].loops[0].length,4);
// Split/merge of neighboring base cabinets must not invent stone seams/edges.
const split=structuredClone(k);split.west.splice(2,1,{id:'W03a',type:'drawers',width:15},{id:'W03b',type:'drawers',width:18});const ss=stoneLayout(split);near(ss.summary.counterArea,stone.summary.counterArea);near(ss.summary.profileFeet,stone.summary.profileFeet);assert.equal(ss.zones.length,3);
const variant=structuredClone(k);setKitchenValue(variant,'stone.waterfall','both');near(kitchenLayout(variant).remaining.island,0);near(variant.island[0].width,30-(30/25.4-.75));assert.equal(stoneLayout(variant).waterfalls.length,2);near(kitchenLayout(variant).clearance.south,48);near(stoneLayout(variant).summary.profileFeet,32.625);setKitchenValue(variant,'stone.slabMm',20);near(kitchenLayout(variant).remaining.island,0);setKitchenValue(variant,'stone.waterfall','none');near(variant.island[0].width,30);near(variant.island[2].width,30);
setKitchenValue(variant,'stone.backsplash','none');assert.equal(stoneLayout(variant).summary.splashArea,0);assert.equal(stoneLayout(variant).splashEdges.length,0);setKitchenValue(variant,'stone.backsplash','low');setKitchenValue(variant,'stone.splashHeight',4);assert.ok(stoneLayout(variant).splashes.filter(s=>s.run==='west').every(s=>s.height===4));
setKitchenValue(variant,'stone.splashMaterial','tile-stack');const ts=stoneLayout(variant);near(ts.summary.stoneArea,ts.summary.counterArea);near(ts.summary.tileAllowance,ts.summary.tileArea*1.15);
setKitchenValue(variant,'counterThickness',2);assert.ok(!reviewDecisions(variant).some(d=>d.id==='HEIGHT'));setKitchenValue(variant,'stone.edge','miter');setKitchenValue(variant,'stone.edgeDrop',3);assert.ok(reviewDecisions(variant).some(d=>d.id==='MITER'));
const drawer=structuredClone(k);drawer.island[0].drawerLayout='four';assert.equal(cabinetSpecifications(drawer).counts.drawers,16);assert.notEqual(designIdentifier(drawer),designIdentifier(k));const originalId=designIdentifier(k);drawer.island[0].drawerLayout='three';const changedView=structuredClone(k);changedView.showOpen=true;changedView.diningLighting='none';assert.equal(designIdentifier(changedView),originalId);
for(const bad of [{...k,west:[null]},{...k,maker:{reveal:'0.125'}},{...k,stone:{slabMm:NaN}},{...k,west:{}},{...k,island:[{id:'x',type:'drawers',width:30,drawerLayout:'bogus'}]}])assert.equal(validKitchen(bad),false);
const quoted=csvText([{note:'=SUM(1,2)',line:'First line\nSecond, "quoted"',number:-2}]);assert.ok(quoted.includes("'=SUM(1,2)"));assert.ok(quoted.includes('Second, ""quoted""'));assert.ok(quoted.includes('"-2"'));
const pack=kitchenExports(k);assert.equal(Object.keys(pack.files).filter(n=>n.endsWith('.csv')).length,12);for(const [name,data] of Object.entries(pack.files).filter(([n])=>n.endsWith('.csv'))){assert.ok(data.includes(originalId),name);assert.ok(!data.includes('NaN'),name);assert.ok(!data.includes('undefined'),name);}
if(process.env.KITCHEN_ZIP_CHECK)fs.writeFileSync(process.env.KITCHEN_ZIP_CHECK,zipFiles(pack.files));
console.log('Specification checks passed: front closure, case vs assembly, panel heights, union/edge quantities, window subtraction, waterfall fits, finish variants, drawer edits, import validation, CSV escaping and revision identity.');
