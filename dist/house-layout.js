import {DISCOVERY_II,upgradeDiscoveryStove} from './stove-config.js';
// Owner-directed furnishing study, separate from the traced architectural shell.
// With east at the front (+Z), north is sheet-right (+X).
export const HOUSE_REVIEW_REVISION='whole-house-2026-11-01-v3';
export const BASEMENT_POSTS=[[43,21.208333],[43,33.000278],[43,41.500278]];
const item=(id,name,type,x,z,w,d,h,extra={})=>({id,name,type,x,z,w,d,h,rotation:0,...extra});
export const familyRoomObjects=[
 item('sofa','Family sofa · faces north TV','sofa',47.4,12.6,10,3.6,2.8,{rotation:-90,finish:'oatmeal',houseStyle:true}),
 item('coffee','Rounded oak coffee table','coffeeTable',52,12.6,4.7,2.5,1.3,{rotation:-90}),
 item('dining','Southwest dining · six seats','diningTable',34.5,5.7,7,3.5,2.5),
 item('family-rug','Family room · woven wool rug','rug',51.2,12.6,13,10,.04,{rotation:-90}),
 item('family-console','North wall · low oak media console','mediaConsole',56.65,12.6,9,1.6,1.65,{rotation:90}),
 item('family-tv','North wall TV · 75 inch study','television',57.34,12.6,5.45,.12,3.066,{rotation:90,y:2.55}),
 item('family-chair','Reading chair · saddle leather','armchair',51.8,21,2.8,3,2.8,{rotation:-35}),
 item('family-side-table','Round side table','sideTable',46.9,19.1,1.6,1.6,1.65),
 item('family-lamp','Reading floor lamp','floorLamp',48.4,21.7,1.4,1.4,5.4),
 item('family-plant','Plant beside north wall','plant',56.3,21.5,1.6,1.6,4.5),
 item('great-stove',DISCOVERY_II.name,'stove',55,3,DISCOVERY_II.width/12,DISCOVERY_II.depth/12,DISCOVERY_II.bodyHeight/12,{rotation:135,flueHeight:12.5,stoveModel:DISCOVERY_II.id}),
];
const mainAdditions=[
 item('laundry-sink','Laundry utility sink · plan location','utilitySink',34.825,43.7,2.5,2.4,3),
 item('office-desk','Main office · oak desk','desk',30.1,49.6,5.2,2.5,2.5,{rotation:-90}),
 item('office-chair','Office chair','armchair',32.6,49.6,2,2.1,2.9,{rotation:90}),
 item('mud-bench','Mudroom bench and hooks','mudBench',29.4,33.8,5.2,1.7,5.7,{rotation:-90}),
 item('pantry-shelves','Pantry shelving','pantryShelves',37,30.65,4.3,1,6.8),
 item('bed2-closet','Bedroom 2 · closet shelving','pantryShelves',49.9,42.2,6.2,1,6.8,{rotation:180}),
];
export function removeDryBar(state){state.objects=state.objects.filter(o=>o.id!=='b-drybar'&&!/dry\s*bar/i.test(o.name||''));return state;}
export function upgradeHouseReview(source,floor){
 const next=structuredClone(source);
 if(floor==='basement')removeDryBar(next);
 if(next.houseReviewRevision===HOUSE_REVIEW_REVISION)return floor==='main'?upgradeDiscoveryStove(next):next;
 if(floor==='main'){
  const replacements=[...familyRoomObjects,...mainAdditions],ids=new Set(replacements.map(o=>o.id));
  next.objects=next.objects.filter(o=>!ids.has(o.id));next.objects.push(...structuredClone(replacements));
  for(const o of next.objects){
   if(['powder-vanity','shared-vanity'].includes(o.id))o.rotation=180;
   if(o.id==='powder-toilet'){o.rotation=0;o.z=43.65;}
   if(o.id==='powder-vanity')o.x=38;
   if(o.id==='shared-vanity')o.z=47.65;
   if(o.id==='shared-tub'){o.x=72.23;o.z=49.04;o.d=4.9;o.name='Shared tub · plan envelope';}
   if(o.id==='bed3')o.x=50;
   if(o.id==='dryer'){o.x=29.8;o.z=43.65;}
   if(o.id==='washer'){o.x=32.25;o.z=43.65;}
  }
  const names={'suite-west-wardrobe':'Closet south wall · double hanging','suite-north-wardrobe':'Closet west wall · long hanging','suite-east-wardrobe':'Closet north wall · double hanging','suite-south-wardrobe':'Closet east wall · shelves and shoes','suite-mirror-1':'Vanity mirror · south','suite-mirror-2':'Vanity mirror · north'};
  for(const o of next.objects)if(names[o.id])o.name=names[o.id];
  const pendant=next.lights.find(l=>l.name==='Dining pendant');if(pendant){pendant.x=34.5;pendant.z=5.7;pendant.anchorX=34.5;pendant.anchorZ=5.7;}
 }else{
  // The existing glass enclosure closed the only approach; the revised room
  // has its opening along the shower's south (sheet-left) edge.
  const wardrobe=next.objects.find(o=>o.id==='b-closet5');if(wardrobe)wardrobe.z=23.65;
  const lowerWardrobe=next.objects.find(o=>o.id==='b-closet4');if(lowerWardrobe){lowerWardrobe.z=32.35;lowerWardrobe.rotation=180;}
  const coffee=next.objects.find(o=>o.id==='b-media-table');if(coffee)coffee.z=7.75;
  const shower=next.objects.find(o=>o.id==='b-shower');if(shower){shower.type='suiteShower';shower.x=73.5;shower.z=28.083585;shower.rotation=90;shower.w=6;shower.d=3;shower.leftWall=false;shower.entryWidth=3;}
 }
 next.houseReviewRevision=HOUSE_REVIEW_REVISION;return floor==='main'?upgradeDiscoveryStove(next):next;
}
export function furnitureBounds(o){const a=o.rotation*Math.PI/180,w=Math.abs(Math.cos(a))*o.w+Math.abs(Math.sin(a))*o.d,d=Math.abs(Math.sin(a))*o.w+Math.abs(Math.cos(a))*o.d;return [o.x-w/2,o.z-d/2,o.x+w/2,o.z+d/2];}
export function furnishingObstacles(objects){return objects.filter(o=>familyRoomObjects.some(p=>p.id===o.id)&&!['rug','television','floorLamp'].includes(o.type)).map(o=>{const b=furnitureBounds(o);if(o.type==='diningTable'){b[1]-=1.6;b[3]+=1.6;}if(o.type==='stove')return [o.x-2.27,o.z-2.27,o.x+2.27,o.z+2.27];return b;});}
// Solid furniture is walkable around, while rugs and wall-mounted art stay out
// of the collision map. Suite/shower glazing is handled as separate thin faces.
export function roomFurnitureObstacles(objects){return objects.filter(o=>!o.id.startsWith('suite-')&&!familyRoomObjects.some(p=>p.id===o.id)&&!['suiteShower','shower','sink','screen','suiteMirror'].includes(o.type)).map(furnitureBounds);}
