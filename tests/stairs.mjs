import assert from 'node:assert/strict';
import {STAIR_LANDINGS,nearStairs,entersStairs,otherFloor} from '../dist/stair-navigation.js';
import {HOUSE_ORIENTATION,REVISED_STAIRS,REVISION_STAIR_LANDINGS,stairParts} from '../dist/stair-layout.js';
for(const floor of ['main','basement']){
 const landing=STAIR_LANDINGS[floor];assert.equal(entersStairs(floor,landing.x,landing.z),false,'Arrival must not immediately trigger a return');assert.equal(nearStairs(floor,landing.x,landing.z),true);assert.notEqual(otherFloor(floor),floor);
}
assert.equal(entersStairs('main',46,35),true);assert.equal(entersStairs('basement',49,39),true);
assert.equal(entersStairs('main',46,40),false,'Side of stair rail is not the entrance');
assert.equal(entersStairs('basement',46,35),false,'Under-stair storage is not the stair entrance');
assert.equal(nearStairs('main',34,20),false);
// Anchor the stair orientation to the actual front/back doors, not sheet X.
const toFront={x:HOUSE_ORIENTATION.front.x-HOUSE_ORIENTATION.back.x,z:HOUSE_ORIENTATION.front.z-HOUSE_ORIENTATION.back.z};
const bottomToTop={x:REVISED_STAIRS.top.x-REVISED_STAIRS.bottom.x,z:REVISED_STAIRS.top.z-REVISED_STAIRS.bottom.z};
assert.ok(toFront.x*bottomToTop.x+toFront.z*bottomToTop.z>0,'Top must be closer to front/east than bottom');
const main=stairParts('main'),basement=stairParts('basement');
assert.equal(main.length,basement.length);
for(let i=0;i<main.length;i++){
 assert.equal(main[i].x,basement[i].x);assert.equal(main[i].z,basement[i].z);
 assert.equal(basement[i].top-main[i].top,REVISED_STAIRS.rise,'Same stair must align between floors');
 assert.ok(main[i].x-main[i].w/2>=REVISED_STAIRS.x0-1e-6);
 assert.ok(main[i].x+main[i].w/2<=REVISED_STAIRS.x1+1e-6);
}
const high=basement.filter(p=>p.kind==='upper-tread').sort((a,b)=>b.top-a.top)[0];
const low=basement.filter(p=>p.kind==='lower-tread').sort((a,b)=>a.top-b.top)[0];
assert.ok(high.z>low.z,'Visible upper flight must be toward front/east');
for(const floor of ['main','basement']){
 const p=REVISION_STAIR_LANDINGS[floor];
 assert.equal(nearStairs(floor,p.x,p.z,'revised'),true);
 assert.equal(entersStairs(floor,p.x,p.z,'revised'),false,'Arriving must not bounce back');
}
assert.equal(entersStairs('main',46,39.3,'revised'),true);
assert.equal(entersStairs('basement',46,35.03,'revised'),true);
assert.equal(entersStairs('main',58,35,'revised'),false,'Sheet-right wall is not east');
assert.equal(entersStairs('basement',46,39.3,'revised'),false,'Under the upper flight is storage, not the bottom approach');
console.log('Stair entrance and safe arrival checks passed.');
