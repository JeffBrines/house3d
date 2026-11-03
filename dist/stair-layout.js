// Drawing coordinates are not compass directions. The front door is at +Z
// (east), and the back/patio door is at -Z (west), as confirmed by the owner.
export const HOUSE_ORIENTATION={front:{x:43,z:55.771,direction:'east'},back:{x:43,z:.229,direction:'west'}};
export const REVISED_STAIRS={
 x0:46.5,x1:57.5,z0:33.083333,z1:41.25,
 turnX:53.5,flightWidth:3.9,risersPerFlight:9,
 // Retain a nine-foot illustrative rise; field floor-to-floor rise is unknown.
 rise:9,
 top:{x:46.5,z:39.3},bottom:{x:46.5,z:35.033333},
};
export const REVISION_STAIR_LANDINGS={main:{x:44.5,z:39.3},basement:{x:44.5,z:35.033333}};
export function stairOpening(){const s=REVISED_STAIRS;return [[s.x0,s.z0],[s.x1,s.z0],[s.x1,s.z1],[s.x0,s.z1]];}
export function stairParts(floor){
 const s=REVISED_STAIRS,offset=floor==='main'?-s.rise:0,half=s.rise/2,rise=half/s.risersPerFlight,going=(s.turnX-s.x0)/(s.risersPerFlight-1),parts=[];
 const add=(kind,w,d,x,z,top,h=.14)=>parts.push({kind,w,d,h,x,z,y:top+offset-h/2,top:top+offset});
 // Descend from the front/east lane toward the turn, then return along the
 // back/west lane. Both floors render the same stair translated by the rise.
 for(let i=0;i<s.risersPerFlight-1;i++){
  const x=s.x0+(i+.5)*going;
  add('upper-tread',going,s.flightWidth,x,s.top.z,s.rise-(i+1)*rise);
  add('lower-tread',going,s.flightWidth,x,s.bottom.z,(i+1)*rise);
 }
 add('turn-landing',s.x1-s.turnX,s.z1-s.z0,(s.x1+s.turnX)/2,(s.z0+s.z1)/2,half,.2);
 return parts;
}
export function buildRevisedStairs(parent,floor,{box,material}){
 const s=REVISED_STAIRS,tread=material('#a3947b'),rail=material('#33484c');
 for(const p of stairParts(floor)){const mesh=box(p.w,p.h,p.d,p.x,p.y,p.z,tread,parent);mesh.userData.stairPart=p.kind;}
 if(floor==='main'){
  // Back lane and the unused part of the hall edge are guarded; front/east
  // entry is open. The opposite side is the retained full-height plan wall.
  for(let i=0;i<=11;i++)box(.05,3.1,.05,s.x0+i*(s.x1-s.x0)/11,1.55,s.z0,rail,parent);
  box(s.x1-s.x0,.11,.11,(s.x0+s.x1)/2,3.15,s.z0,rail,parent);
  const end=s.top.z-s.flightWidth/2;
  for(let i=0;i<=4;i++)box(.05,3.1,.05,s.x0,1.55,s.z0+i*(end-s.z0)/4,rail,parent);
  box(.11,.11,end-s.z0,s.x0,3.15,(s.z0+end)/2,rail,parent);
 }
}
