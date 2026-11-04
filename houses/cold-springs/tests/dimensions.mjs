import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditModel} from '../scripts/audit-dimensions.mjs';
import {furniture} from '../dist/project.js';
import {dimensions,finishedCeiling} from '../dist/dimensions.js';
import {groundHeight,makeCollision} from '../dist/spatial.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const model=read('../dist/model.json'),basis=read('../scripts/plan-dimensions.json'),r=auditModel(model,basis);
assert(r.pass,JSON.stringify([...r.spans,...r.openings,...r.footprint].filter(p=>!p.pass),null,2));
// This must read geometry, not pass when a model is stretched or an opening lost.
const stretched=structuredClone(model);stretched.walls=stretched.walls.map(p=>p.map(([x,z])=>[x*1.01,z]));assert(!auditModel(stretched,basis).pass);
const missing=structuredClone(model);missing.openings=missing.openings.filter(o=>o.id!=='patio-transom');assert(!auditModel(missing,basis).pass);
const tol=.125/12,close=(a,b,msg)=>assert(Math.abs(a-b)<tol,msg);
close(finishedCeiling,8+11.75/12,'Finish and ceiling lining must be deducted from plate above subfloor');
const island=furniture.find(o=>o.type==='island');close(island.w,5);close(island.d,9.5);
const shower=furniture.find(o=>o.name==='Primary shower');close(shower.w,5+6.5/12);close(shower.d,5.5);
const tub=furniture.find(o=>o.type==='hottub'),fire=furniture.find(o=>o.type==='firepit');close(tub.w,7);close(tub.d,7);close(fire.w,3.5);close(fire.d,3.5);
close(dimensions.fireplace.z1-dimensions.fireplace.z0,7+7/12);
close(groundHeight(52,36.51),-6.5/12);close(groundHeight(52,45.51)-groundHeight(52,36.51),-9*.02);
const collision=makeCollision(model);assert(!collision(46.8,9.73),'Upper transom must not block the open patio doors.');
// Corrected room doors must be on the drawn wall, not a spurious hole nearby.
for(const [id,axis,x,z] of [['pantry','x',23.4375,31.7292],['powder','z',13.9375,33.1667],['laundry','z',13.9375,42.0625],['hall-linen-2','z',60.7708,16.3542],['hall-linen-3','z',60.7708,21.3958],['garage-2','z',32.2708,65.7917]]){const o=model.openings.find(o=>o.id===id);assert.equal(o.axis,axis);close(o.x,x,id);close(o.z,z,id);}
console.log(`${r.spans.length} measured framing spans, ${r.openings.length} opening tags, footprint, level datums and explicit fixture dimensions passed.`);
