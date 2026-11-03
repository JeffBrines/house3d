import assert from 'node:assert/strict';
import {defaultKitchen,validKitchen,kitchenLayout,kitchenSchedule,upgradeKitchen} from '../dist/kitchen-engine.js';
import {applyCornerOption} from '../dist/kitchen-corner.js';
import {cabinetSpecifications} from '../dist/kitchen-specs.js';
const k=defaultKitchen(),l=kitchenLayout(k);
assert.equal(validKitchen(k),true);assert.deepEqual(l.remaining,{west:0,south:0,island:0});assert.deepEqual(l.warnings,[]);
assert.equal(l.sink.z,17.5);assert.equal(l.clearance.west,48);assert.equal(l.clearance.south,48);assert.equal(l.clearance.appliance,43.5);
assert.equal(kitchenSchedule(k).find(u=>u.code==='S02').height,36.5);
assert.equal(k.cornerStyle,'piecut');assert.equal(k.corner,36);
const corner=cabinetSpecifications(k).cabinets.find(c=>c.cabinet_id==='C01');assert.equal(corner.adjustable_shelf_quantity,1);assert.equal(corner.door_count,2);
// Existing saved closed-corner layouts receive storage, keeping custom choices.
const saved=applyCornerOption(defaultKitchen(),'closed');saved.designRevision=3;saved.maker={finish:'walnut'};saved.island[0].notes='Keep this custom note';saved.west[2].width=32;saved.west[6].width=28;
upgradeKitchen(saved);assert.equal(saved.cornerStyle,'piecut');assert.equal(saved.west[2].width,32);assert.equal(saved.west[6].width,20.5);assert.equal(saved.island[0].notes,'Keep this custom note');assert.equal(saved.maker.finish,'walnut');assert.deepEqual(kitchenLayout(saved).remaining,{west:0,south:0,island:0});
const once=JSON.stringify(saved);upgradeKitchen(saved);assert.equal(JSON.stringify(saved),once);
applyCornerOption(saved,'closed');upgradeKitchen(saved);assert.equal(saved.cornerStyle,'closed','A new deliberate comparison must not be remigrated');
// Oversize appliances must produce both a run error and a reduced physical aisle.
const deep=structuredClone(k);deep.fridgeDepth=36;deep.south[3].width+=6;const bad=kitchenLayout(deep);assert.equal(bad.remaining.south,-6);assert.equal(bad.clearance.appliance,37.5);assert.ok(bad.warnings.some(w=>w.includes('over capacity')));assert.ok(bad.warnings.some(w=>w.includes('42″')));
// Changing island dimensions must preserve the requested working aisles.
const large=structuredClone(k);large.islandLength=108;large.islandWidth=54;const result=kitchenLayout(large);assert.equal(result.clearance.west,48);assert.equal(result.clearance.south,48);assert.equal(result.remaining.island,12);
// Centering warning follows the sink when run widths change.
const shifted=structuredClone(k);shifted.west[2].width+=6;assert.ok(kitchenLayout(shifted).warnings.some(w=>w.includes('window center')));
const malformed=structuredClone(k);malformed.west[0].width=NaN;assert.equal(validKitchen(malformed),false);
const duplicate=structuredClone(k);duplicate.south[0].id=duplicate.west[0].id;assert.equal(validKitchen(duplicate),false);
console.log('Kitchen checks passed: default fit, source window alignment, appliance overrun, island constraints, schedule and import validation.');
