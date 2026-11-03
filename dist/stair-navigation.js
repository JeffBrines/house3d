// The two levels retain their plan-local datum. A stair entrance transfers to the other landing.
import {REVISED_STAIRS} from './stair-layout.js';
export {REVISION_STAIR_LANDINGS} from './stair-layout.js';
export const STAIR_LANDINGS={main:{x:44.5,z:35},basement:{x:45,z:39}};
export function nearStairs(floor,x,z,design='original'){const entry=design==='revised'?REVISED_STAIRS[floor==='main'?'top':'bottom']:floor==='main'?{x:46,z:35}:{x:49,z:39};return Math.hypot(x-entry.x,z-entry.z)<4.5;}
export function entersStairs(floor,x,z,design='original'){
 if(design==='revised'){const entry=REVISED_STAIRS[floor==='main'?'top':'bottom'];return x>=45.9&&x<=46.6&&Math.abs(z-entry.z)<=1.45;}
 return floor==='main'?x>=45.65&&x<=46.4&&z>=33.65&&z<=36.6:x>=48.65&&x<=49.4&&z>=37.7&&z<=40.8;
}
export function otherFloor(floor){return floor==='main'?'basement':'main';}
