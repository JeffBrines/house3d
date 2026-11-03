// Alternate study in feet at the existing house datum. Written drawing sizes
// govern; proposed partitions and fixture envelopes require design approval.
export const SUITE_REVISION='Expanded suite B.3 · Full-width shower / seated powder vanity';
export const SUITE_STATE_REVISION='slide-b3';
export const SUITE_BOUNDS={west:62.416718,north:19.000278,closetNorth:19.000278,closetSouth:30.625292,closetEast:75.500024,bathWest:62.416718,bathNorth:31.000278,bathSouth:46.042026,bathEast:73.500024,projectionEast:75.500024,projectionSouth:34.000275};
export const suiteOpenings=[
 {id:'suite-closet',x:68.959,z:18.812785,w:38.5/12,h:7,axis:'x',door:true,label:'Bedroom directly into walk-in closet; cased opening'},
 {id:'suite-bath',x:72.479191,z:30.812785,w:38.5/12,h:7,axis:'x',door:true,label:'36 inch nominal window-side bath doorway; moved 2¼ inches toward hall to clear powder top; pocket west'},
 {id:'suite-wc',x:64.166718,z:40.35439,w:32.5/12,h:7,axis:'x',door:true,label:'30 inch nominal WC door; opens into bath'}
];
export const removedOpeningCenters=[[68.959,18.813],[67.021,22.438],[70.896,22.438],[66.105,26.02],[64.25,34.355],[62.229,36.271],[65.9,46.313]];
export const retainedInterior=o=>!removedOpeningCenters.some(([x,z])=>Math.abs(o.x-x)<.03&&Math.abs(o.z-z)<.03);
const item=(id,name,type,x,z,w,d,h,extra={})=>({id:'suite-'+id,name,type,x,z,w,d,h,rotation:0,...extra});
export const suiteObjects=[
 item('vanity','Primary vanity · 96 × 24 in · hall side','vanity',66.541718,32.0419,8,2,2.92,{rotation:180}),
 item('tub','Freestanding tub · 66 × 32 in · provisional','tub',71.98,38.3,32/12,5.5,2),
 item('shower','Shower · 86½ × 54 in · to WC wall','suiteShower',69.895871,43.792026,7.208306,4.5,7.33,{leftWall:true,entryWidth:3}),
 item('toilet','Enclosed primary WC','toilet',64.1667,44.67,1.5,2.5,2.4),
 item('west-wardrobe','Closet west · double hanging','wardrobe',63.4584,24.75,7,2,8,{rotation:-90,fitout:'double'}),
 item('north-wardrobe','Closet north · long hanging','wardrobe',65,20.0837,4.5,2,8,{rotation:180,fitout:'long'}),
 item('east-wardrobe','Closet east · double hanging','wardrobe',74.4583,22.08,5,2,8,{rotation:90,fitout:'double'}),
 item('south-wardrobe','Closet south · shelves and shoes','wardrobe',65.25,29.5837,5,2,8,{fitout:'shelves'}),
 item('window-drawers','Below closet window · drawers','drawerCab',74.7083,27.167,5,1.5,2.5,{rotation:90}),
 item('mirror-1','Vanity mirror · west','suiteMirror',64.621718,31.075,2.5,.06,3.1,{y:3.8}),
 item('mirror-2','Vanity mirror · east','suiteMirror',68.461718,31.075,2.5,.06,3.1,{y:3.8}),
 item('powder-vanity','Seated powder vanity · 32 × 16 × 30 in','powderVanity',74.770857,32.5,32/12,16/12,30/12,{rotation:90,fitout:'Open knee space; no sink'}),
 item('powder-stool','Powder stool · 16 in diameter × 18 in high','powderStool',74.770857,32.5,16/12,16/12,18/12,{fitout:'Tucked under top; pull out to sit'}),
 item('powder-mirror','Powder mirror · 24 × 30 in','suiteMirror',75.4375,32.5,2,.06,2.5,{rotation:-90,y:34/12})
];
export function expandedRooms(original){const rooms=original.map(r=>[...r]);rooms[5]=['Expanded primary bath',68.5,38.5];rooms[6]=['Walk-in closet',68.9,25.5];return rooms;}
export function upgradeSuite(state){
 if(state.suiteRevision===SUITE_STATE_REVISION)return state;
 if(state.suiteRevision==='slide-b2'){
  const next=structuredClone(state);
  next.objects=next.objects.filter(o=>!['suite-shower','suite-powder-vanity','suite-powder-stool','suite-powder-mirror'].includes(o.id));
  next.objects.push(...structuredClone(suiteObjects.filter(o=>['suite-shower','suite-powder-vanity','suite-powder-stool','suite-powder-mirror'].includes(o.id))));
  next.suiteRevision=SUITE_STATE_REVISION;return next;
 }
 if(state.suiteRevision!=='slide-b')return expandedState(state);
 const next=structuredClone(state),replace=new Set(['suite-vanity','suite-south-wardrobe','suite-mirror-1','suite-mirror-2']);
 const tub=next.objects.find(o=>o.id==='suite-tub');
 if(tub&&Math.abs(tub.x-71.98)<.001&&Math.abs(tub.z-36.8)<.001&&Math.abs(tub.w-32/12)<.001&&Math.abs(tub.d-5.5)<.001&&tub.rotation===0)replace.add('suite-tub');
 // The current request explicitly replaces the shower footprint.
 if(next.objects.some(o=>o.id==='suite-shower'))replace.add('suite-shower');
 next.objects=next.objects.map(o=>replace.has(o.id)?structuredClone(suiteObjects.find(b=>b.id===o.id)):o);
 for(const o of suiteObjects.filter(o=>o.id.startsWith('suite-powder-')))if(!next.objects.some(p=>p.id===o.id))next.objects.push(structuredClone(o));
 for(const [id,x] of [['suite-light-3',64.621718],['suite-light-4',68.461718]]){const l=next.lights.find(o=>o.id===id);if(l)l.x=x;}
 next.suiteRevision=SUITE_STATE_REVISION;return next;
}
export function expandedState(original){const state=structuredClone(original),remove=new Set(['bed2','primary-vanity','primary-tub','primary-shower','primary-toilet']);state.objects=state.objects.filter(o=>!remove.has(o.id)&&!o.id.startsWith('suite-')&&!(o.x>=62.04&&o.x<76&&o.z>18.625&&o.z<46.042));state.objects.push(...structuredClone(suiteObjects));state.lights=state.lights.filter(l=>!(l.x>62&&l.z>18.6&&l.z<46.04));
 state.suiteRevision=SUITE_STATE_REVISION;
 const points=[['Closet north',68.9,21.5],['Closet center',68.9,25],['Closet south',69.5,28.5],['Bath vanity west',64.621718,34],['Bath vanity east',68.461718,34],['Bath center',68,38.5],['Shower',70.5,43.5],['WC',64.16,42.4]];
 points.forEach(([name,x,z],i)=>state.lights.push({id:'suite-light-'+i,name,type:'recessed',x,z,y:0,kelvin:3000,power:700,on:true}));return state;}
export function suiteObstacleRects(objects){const rects=[];for(const o of objects.filter(o=>o.id.startsWith('suite-'))){if(o.type==='suiteMirror')continue;const a=o.rotation*Math.PI/180,w=Math.abs(Math.cos(a))*o.w+Math.abs(Math.sin(a))*o.d,d=Math.abs(Math.sin(a))*o.w+Math.abs(Math.cos(a))*o.d;
 if(o.type==='suiteShower'){const left=o.leftWall?[-o.w/2,-o.d/2,-o.w/2+.045,o.d/2]:[-o.w/2-.02,-o.d/2,-o.w/2+.02,o.d/2],entry=Math.min(o.entryWidth??o.w*.6,o.w-.1);for(const [x0,z0,x1,z1] of [left,[-o.w/2+entry,-o.d/2-.02,o.w/2,-o.d/2+.02]]){const p=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(([x,z])=>[o.x+x*Math.cos(a)+z*Math.sin(a),o.z-x*Math.sin(a)+z*Math.cos(a)]);rects.push([Math.min(...p.map(v=>v[0])),Math.min(...p.map(v=>v[1])),Math.max(...p.map(v=>v[0])),Math.max(...p.map(v=>v[1]))]);}}
 else rects.push([o.x-w/2,o.z-d/2,o.x+w/2,o.z+d/2]);}return rects;}
export function suiteMetrics(){const b=SUITE_BOUNDS;return {closetWidth:b.closetEast-b.west,closetDepth:b.closetSouth-b.closetNorth,closetArea:(b.closetEast-b.west)*(b.closetSouth-b.closetNorth),bathWidth:b.bathEast-b.bathWest,bathDepth:b.bathSouth-b.bathNorth,bathArea:(b.bathEast-b.bathWest)*(b.bathSouth-b.bathNorth)+(b.projectionEast-b.bathEast)*(b.projectionSouth-b.bathNorth),galleryWidth:0,galleryArea:0,closetAisle:9,vanityWidth:8,showerWidth:7.208306,showerDepth:4.5,wcWidth:3.5,wcDepth:5.5,mainFloorBedroomsBefore:3,mainFloorBedroomsAfter:2};}
