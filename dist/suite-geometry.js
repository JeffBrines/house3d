import * as THREE from 'three';

// Local cabinet fronts face -Z. All sizes are feet; rotation is applied by the app.
export function buildSuiteObject(g,o,{box,cyl,material,cabinet,metal,counter,tile:tileFinish,showerFloor}){
 const {w,d,h}=o, panel=.0625;
 if(o.type==='wardrobe'){
  const interior=material('#d5bf99',{roughness:.62});
  box(w,h,.042,0,h/2,d/2-.021,interior,g);
  for(const x of [-w/2+panel/2,w/2-panel/2])box(panel,h,d,x,h/2,0,cabinet,g);
  for(const y of [.2,h-panel/2])box(w,panel,d,0,y,0,cabinet,g);
  const bays=Math.max(1,Math.round(w/2.5)),bw=(w-panel)/bays;
  for(let i=1;i<bays;i++)box(panel,h,d,-w/2+i*bw,h/2,0,cabinet,g);
  for(let i=0;i<bays;i++){
   const cx=-w/2+panel/2+bw*(i+.5),clear=bw-panel;
   if(o.fitout==='shelves'){
    for(let j=1;j<=7;j++){
     const y=.25+j*(h-.6)/8;box(clear,panel,d-.05,cx,y,0,cabinet,g);
     if(j<6)for(const side of [-.24,.24]){
      const shoe=box(.32,.16,.75,cx+side*clear,y+.12,-.32,material(j%2?'#96795d':'#434d4b'),g);shoe.rotation.x=.08;
     }
    }
   }else{
    const levels=o.fitout==='long'?[5.8]:[3.35,6.7];
    for(const y of levels){
     box(clear,panel,d-.05,cx,y+.23,0,cabinet,g);
     const rod=cyl(.036,.036,clear,cx,y,-.12,metal,g);rod.rotation.z=Math.PI/2;
     const n=Math.max(4,Math.floor(clear/.27));
     for(let j=0;j<n;j++){
      const x=cx-clear*.39+j*clear*.78/(n-1),length=o.fitout==='long'?3.9:2.15;
      const fabric=material(['#566568','#b5a085','#e2ded1','#566057','#93846e'][j%5],{roughness:1});
      box(.075,length,1.18,x,y-length/2-.13,-.17,fabric,g);
      const shoulders=new THREE.Mesh(new THREE.ConeGeometry(.62,.28,3),fabric);shoulders.rotation.y=Math.PI/2;shoulders.scale.x=.15;shoulders.position.set(x,y-.16,-.17);g.add(shoulders);
     }
    }
   }
  }
  return true;
 }
 if(o.type==='drawerCab'){
  box(w-.1,h-.18,d-.08,0,(h-.18)/2+.12,0,cabinet,g);
  box(w,.07,d,0,h-.035,0,cabinet,g);
  for(let i=0;i<3;i++){
   const dh=(h-.28)/3,y=.17+dh*(i+.5);
   box(w-.08,dh-.025,.06,0,y,-d/2,cabinet,g);
   box(.5,.028,.055,0,y+.08,-d/2-.065,metal,g);
  }
  return true;
 }
 if(o.type==='bench'){
  for(const x of [-w*.39,w*.39])box(.12,h-.25,d-.12,x,(h-.25)/2,0,cabinet,g);
  box(w,.19,d,0,h-.095,0,material('#d7c9b4',{roughness:1}),g);
  box(w-.25,.065,d-.2,0,.25,0,cabinet,g);
  return true;
 }
 if(o.type==='powderVanity'){
  // A seated dressing table: two side panels and open knee space, without a sink.
  const top=1.25/12;
  box(w,top,d,0,h-top/2,0,counter,g);
  for(const x of [-w/2+panel/2,w/2-panel/2])box(panel,h-top,d-.06,x,(h-top)/2,.03,cabinet,g);
  box(w-panel*2,.25,panel,0,h-top-.125,d/2-panel/2,cabinet,g);
  return true;
 }
 if(o.type==='powderStool'){
  const seat=material('#d7c6ae',{roughness:.9});
  cyl(w/2,w/2,.17,0,h-.085,0,seat,g);
  for(const x of [-w*.29,w*.29])for(const z of [-d*.29,d*.29]){
   const leg=cyl(.038,.05,h-.17,x,(h-.17)/2,z,cabinet,g);leg.rotation.z=-x*.08;
  }
  box(w*.6,.055,.055,0,.42,0,cabinet,g);
  return true;
 }
 if(o.type==='suiteMirror'){
  box(w+.045,h+.045,d,0,h/2,0,metal,g);
  box(w,h,.018,0,h/2,.04,material('#d6e2df',{metalness:1,roughness:.075}),g);
  return true;
 }
 if(o.type==='suiteShower'){
  const tile=tileFinish??material('#d9d3c5',{roughness:.65}),grout=material('#b1ac9f'),glass=material('#eef8f7',{transparent:true,opacity:.16,roughness:.07,metalness:.12,depthWrite:false,side:THREE.DoubleSide});
  box(w,.1,d,0,.05,0,showerFloor??tile,g);
  box(w,h,.045,0,h/2,d/2-.022,tile,g);
  // Keep the retained east window visible inside the proposed shower.
  if(Math.abs(o.rotation)<.01&&Math.abs(o.x+w/2-73.5)<.25){
   const lo=Math.min(d/2,Math.max(-d/2,44.4167-1.25-o.z)),hi=Math.max(-d/2,Math.min(d/2,44.4167+1.25-o.z)),sill=3;
   if(hi<=lo){box(.045,h,d,w/2-.022,h/2,0,tile,g);}else{
   box(.045,Math.min(h,sill),d,w/2-.022,Math.min(h,sill)/2,0,tile,g);
   if(lo>-d/2)box(.045,h,lo+d/2,w/2-.022,h/2,(-d/2+lo)/2,tile,g);
   if(hi<d/2)box(.045,h,d/2-hi,w/2-.022,h/2,(hi+d/2)/2,tile,g);
   if(h>8)box(.045,h-8,Math.max(.01,hi-lo),w/2-.022,8+(h-8)/2,(hi+lo)/2,tile,g);
   }
  }else box(.045,h,d,w/2-.022,h/2,0,tile,g);
  if(!tileFinish)for(let y=1;y<h;y++)box(w,.009,.007,0,y,d/2-.05,grout,g);
  // The wider shower meets the WC partition; that face is tiled rather than glass.
  const entry=Math.min(o.entryWidth??w*.6,w-.1),fixed=w-entry;
  if(o.leftWall)box(.045,h,d,-w/2+.0225,h/2,0,tile,g);
  else {box(.035,h,d,-w/2,h/2,0,glass,g);box(.035,.055,d,-w/2,h,0,metal,g);}
  box(fixed,h,.035,entry/2,h/2,-d/2,glass,g);
  box(fixed,.055,.035,entry/2,h,-d/2,metal,g);
  box(w-.25,.01,.05,0,.105,d/2-.2,metal,g);
  cyl(.035,.035,2.1,w/2-.16,5.65,.3,metal,g);
  box(.68,.035,.68,w/2-.47,6.85,.3,metal,g);
  box(.035,.3,.22,w/2-.08,3.45,.3,metal,g);
  return true;
 }
 return false;
}
