import {upgradeHouseReview} from './house-layout.js';
import {expandedState,suiteObjects,expandedRooms} from './suite-config.js';
import {basementRooms,basementOpenings} from './basement-config.js';
import {REVISION_STAIR_LANDINGS} from './stair-layout.js';

export const REVISION='Rev 1 · October 6, 2026';
export const REVISION_ID='rev1-2026-10-06';
export const REVISION_BOUNDS={west:62.416718,closetNorth:19.000278,closetSouth:30.16689,closetEast:75.500024,bathNorth:30.708642,bathSouth:46.042026,bathEast:73.500024,projectionSouth:34.000275};
const overrides={
 'suite-vanity':{name:'Primary vanity · 96 × 20 in · Rev 1 plan',x:66.416718,z:31.541975,w:8,d:20/12},
 'suite-tub':{name:'Primary tub · 66 × 32 in · Rev 1 plan envelope',x:71.91335,z:38.1693},
 'suite-shower':{name:'Primary shower · 66 × 54 in · Rev 1 plan envelope',x:70.75,z:43.792026,w:5.5,d:4.5,leftWall:false,entryWidth:3},
 'suite-toilet':{name:'Primary WC · Rev 1',x:63.91675,z:44.7},
 'suite-west-wardrobe':{x:63.4584,z:24.625,w:7},
 'suite-south-wardrobe':{x:65.25,z:29.125223,w:5},
 'suite-mirror-1':{x:64.496718,z:30.782,y:3.8},
 'suite-mirror-2':{x:68.336718,z:30.782,y:3.8},
};
export const revisionSuiteObjects=suiteObjects.filter(o=>!o.id.startsWith('suite-powder-')).map(o=>({...structuredClone(o),...overrides[o.id]}));
export function revisedMainState(source){
 const next=expandedState(source);
 next.objects=next.objects.filter(o=>!o.id.startsWith('suite-'));
 next.objects.push(...structuredClone(revisionSuiteObjects));
 const bed=next.objects.find(o=>o.id==='bed3');if(bed)bed.name='Bedroom 2 bed';
 next.planRevision=REVISION_ID;
 if(next.kitchen)next.kitchen.planSource='A-102, Revision 1, October 6, 2026';
 return upgradeHouseReview(next,'main');
}
export function revisedBasementState(source){
 const next=structuredClone(source);
 for(const o of next.objects){o.name=o.name?.replace('Bedroom 4','Bedroom 3').replace('Bedroom 5','Bedroom 4');}
 next.planRevision=REVISION_ID;
 return upgradeHouseReview(next,'basement');
}
export function revisedRooms(original){const rooms=expandedRooms(original);rooms[1]=['Family room · north-wall TV',44,20];rooms[3]=['Dining · southwest',39.4,6.3];rooms[5]=['Primary bath · Rev 1',68.5,38];rooms[8]=['Bedroom 2',55,50];rooms[7]=['Shared bathroom',62.5,50];rooms.push(['Stair top · front / east',REVISION_STAIR_LANDINGS.main.x,REVISION_STAIR_LANDINGS.main.z]);return rooms;}
export const revisionBasementRooms=basementRooms.map(([name,x,z])=>[name.replace('Bedroom 4','Bedroom 3').replace('Bedroom 5','Bedroom 4'),x,z]);
revisionBasementRooms[7]=['Stair bottom · back / west',REVISION_STAIR_LANDINGS.basement.x,REVISION_STAIR_LANDINGS.basement.z];
revisionBasementRooms[9]=['Bedroom 3 closet',69,35];
revisionBasementRooms[10]=['Under-stair storage',45,38.25];
revisionBasementRooms.push(['Enlarged storage room',36,36.5]);
export const revisionSuiteOpenings=[
 {id:'5',x:68.9585,z:18.812785,w:34.5/12,h:20/3,axis:'x',door:true},
 {id:'suite-bath',x:72.4495,z:30.437766,w:43/12,h:20/3,axis:'x',door:true},
 {id:'3',x:64.3545,z:40.35439,w:30.5/12,h:20/3,axis:'x',door:true}
];
// Basement storage doors follow the redline; stair direction is owner-confirmed.
export const revisionBasementOpenings=[
 ...basementOpenings.filter(o=>!o.door||![32.896,39.354,32.98].some(z=>Math.abs(o.z-z)<.001)),
 {id:'4',x:36.1041665,z:32.895833,w:32.5/12,h:20/3,axis:'x',door:true,thickness:.375},
 {id:'mech-opening',x:35.756412,z:41.52126,w:3,h:20/3,axis:'x',door:true,thickness:.541667},
 {id:'under-stair',x:43.000858,z:39.368761,w:2.5,h:20/3,axis:'z',door:true,thickness:.37778}
];

export function reviseInteriorOpenings(openings){
 return openings.filter(o=>![[68.959,18.813],[67.021,22.438],[70.896,22.438],[66.105,26.02],[64.25,34.355],[62.229,36.271],[65.9,46.313]].some(([x,z])=>Math.abs(o.x-x)<.03&&Math.abs(o.z-z)<.03)).map(o=>{
  if(Math.abs(o.x-39.688)<.01){
   if(Math.abs(o.z-41.368)<.01)return {...o,z:41.037};
   if(Math.abs(o.z-47.493)<.01)return {...o,z:47.3965};
  }
  if(Math.abs(o.x-37.229)<.01)return {...o,z:52.8125};
  return o;
 });
}
