import assert from 'node:assert/strict';
import fs from 'node:fs';
import {suiteObjects,suiteOpenings,removedOpeningCenters,retainedInterior,expandedRooms,suiteMetrics,upgradeSuite} from '../dist/suite-config.js';
import {createDesignStates,importDesignStates,forkExport} from '../dist/suite-state.js';
import {suiteFitWarnings} from '../dist/suite-study.js';
import {comparisonSVG,fixtureCSV} from '../dist/suite-plan.js';
import {defaultKitchen} from '../dist/kitchen-engine.js';

const model=JSON.parse(fs.readFileSync(new URL('../dist/expanded-suite-model.json',import.meta.url)));
assert.deepEqual(suiteFitWarnings(suiteObjects,model),[],'Starting fixture envelopes must fit the room and avoid walls / each other');
const obstructed=structuredClone(suiteObjects);obstructed.find(o=>o.id==='suite-east-wardrobe').z=27.167;
assert.ok(suiteFitWarnings(obstructed,model).some(w=>w.includes('window')),'Moving tall storage across glazing must be flagged');
const m=suiteMetrics();assert.ok(m.closetArea>152&&m.closetArea<153);assert.ok(m.galleryWidth===0);assert.ok(m.bathArea>172&&m.bathArea<174);
assert.equal(removedOpeningCenters.filter(([x,z])=>retainedInterior({x,z})).length,0);
assert.equal(suiteOpenings.length,3);
const rooms=Array.from({length:15},(_,i)=>['Room '+i,i,i]);assert.equal(expandedRooms(rooms)[6][0],'Walk-in closet');assert.equal(rooms[6][0],'Room 6');
const main={schema:1,objects:[{id:'bed2',x:69,z:40},{id:'dining',x:33,z:5},{id:'custom-bath',x:70,z:30}],lights:[],kitchen:defaultKitchen()};
main.kitchen.designName='Imported kitchen choice';
const basement={schema:1,objects:[{id:'basement-edit'}],lights:[]};
const designs=createDesignStates(main,basement);
assert.ok(designs.original.main.objects.some(o=>o.id==='bed2'));assert.ok(!designs.expanded.main.objects.some(o=>['bed2','custom-bath'].includes(o.id)));
assert.deepEqual(designs.expanded.main.kitchen,main.kitchen);assert.deepEqual(designs.expanded.basement,basement);
designs.expanded.main.kitchen.designName='Alternate only';assert.equal(designs.original.main.kitchen.designName,'Imported kitchen choice');
const validate=s=>s?.schema===1&&Array.isArray(s.objects)&&Array.isArray(s.lights);
const imported=importDesignStates({schema:2,levels:{main,basement}},validate,basement);
assert.equal(imported.design,'expanded');assert.equal(imported.designs.expanded.main.kitchen.designName,'Imported kitchen choice');
const roundtrip=importDesignStates(forkExport('original',designs),validate,basement);assert.equal(roundtrip.design,'original');assert.deepEqual(roundtrip.designs,designs);
assert.throws(()=>importDesignStates({schema:3,design:'expanded',designs:{expanded:{main,basement}}},validate,basement));
const originalModel=JSON.parse(fs.readFileSync(new URL('../dist/model.json',import.meta.url)));
assert.match(comparisonSVG(originalModel,model),/EXPANDED SUITE/);assert.equal(fixtureCSV(suiteObjects).split('\r\n').length,15);
console.log('Suite room sizes, fixture conflicts, removed doors, independent versions and both import formats passed.');

const legacy=structuredClone(designs.expanded.main);delete legacy.suiteRevision;legacy.kitchen.designName='Preserve kitchen';legacy.objects.find(o=>o.id==='suite-vanity').z=20.08;const migrated=upgradeSuite(legacy);assert.equal(migrated.suiteRevision,'slide-b3');assert.equal(migrated.kitchen.designName,'Preserve kitchen');assert.equal(migrated.objects.find(o=>o.id==='suite-vanity').z,32.0419);assert.deepEqual(upgradeSuite(migrated),migrated);

const oldB=structuredClone(designs.expanded.main);oldB.suiteRevision='slide-b';oldB.kitchen.designName='User kitchen';Object.assign(oldB.objects.find(o=>o.id==='suite-tub'),{z:36.8});Object.assign(oldB.objects.find(o=>o.id==='suite-shower'),{x:70.8333,w:5});const b2=upgradeSuite(oldB);assert.equal(b2.objects.find(o=>o.id==='suite-tub').z,38.3);assert.equal(b2.objects.find(o=>o.id==='suite-shower').w,7.208306);assert.equal(b2.objects.find(o=>o.id==='suite-vanity').x,66.541718);assert.equal(b2.kitchen.designName,'User kitchen');
oldB.objects.find(o=>o.id==='suite-tub').z=37.2;assert.equal(upgradeSuite(oldB).objects.find(o=>o.id==='suite-tub').z,37.2,'Custom tub placement must survive migration');

const priorB2=structuredClone(designs.expanded.main);priorB2.suiteRevision='slide-b2';priorB2.objects=priorB2.objects.filter(o=>!o.id.startsWith('suite-powder-'));priorB2.objects.find(o=>o.id==='suite-tub').z=37.8;const b3=upgradeSuite(priorB2);assert.equal(b3.objects.filter(o=>o.id.startsWith('suite-powder-')).length,3);assert.equal(b3.objects.find(o=>o.id==='suite-tub').z,37.8);assert.equal(b3.objects.find(o=>o.id==='suite-shower').leftWall,true);assert.deepEqual(upgradeSuite(b3),b3);
