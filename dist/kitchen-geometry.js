import {fixtureMetal,buildPull,buildFaucet,buildSinkBowl} from './fixture-geometry.js?v=1';
import * as THREE from 'three';
import {KITCHEN_DATUM,kitchenLayout,kitchenUppers} from './kitchen-engine.js';
import {makerSettings,stoneSettings,cabinetFronts,islandInsets,fixtureSettings} from './kitchen-settings.js?v=details-5';
import {buildStone} from './kitchen-stone-geometry.js';
import {RoundedBoxGeometry} from './assets/RoundedBoxGeometry.js';
import {mergeGeometries} from './assets/three-addons/utils/BufferGeometryUtils.js';
export function buildKitchen(parent,k,palette){
 const layout=kitchenLayout(k),settings=makerSettings(k),fixtures=fixtureSettings(k),stone=stoneSettings(k),ends=islandInsets(k),{counter,box:boxMat,metal,fabric}=palette;
 const cabinet=palette.cabinet.clone();cabinet.color.set(settings.finish==='walnut'?'#75513a':settings.finish==='paint'?'#e9e5d9':'#baa078');if(settings.finish==='paint')cabinet.map=null;cabinet.userData.surfaceVariant=settings.finish;
 const black=new THREE.MeshPhysicalMaterial({color:'#1b2225',roughness:.25}),steel=new THREE.MeshPhysicalMaterial({color:'#b9c1c2',metalness:.85,roughness:.27}),ceramic=new THREE.MeshPhysicalMaterial({color:'#e5e7df',roughness:.18});
 const pull=fixtureMetal(k.hardware,'hardware');
 function box(g,w,h,d,x,y,z,m){if(Math.min(w,h,d)<=0)return;const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.004,w/8,h/8,d/8)),m);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);return mesh;}
 function front(g,w,h,x,y,z,draw=false,glass=false,hasPull=true,upperDoor=false,pullY=null,pullSide=0){const t=settings.frontThickness/12,stile=settings.stileWidth/12;
 if((k.front==='shaker'||glass)&&w>.4&&h>.4){
  const panel=glass?new THREE.MeshPhysicalMaterial({color:'#b2c4be',roughness:.1,transparent:true,opacity:.35,metalness:.2,depthWrite:false}):cabinet;
  box(g,w-2*stile,h-2*stile,.025,x,y,z+.008,panel);
  for(const sx of [-1,1])box(g,stile,h,t,x+sx*(w-stile)/2,y,z,cabinet);
  for(const sy of [-1,1])box(g,w-2*stile,stile,t,x,y+sy*(h-stile)/2,z,cabinet);
 }else box(g,w,h,t,x,y,z,cabinet);
 if(hasPull){const vertical=!draw&&pullSide!==0,length=Math.min(settings.pullCenters/12,vertical?h-.3:w-.25),py=pullY??(draw?y:upperDoor?y-h/2+(vertical?length/2+.18:.22):y+h/2-(vertical?length/2+.18:.22)),px=vertical?x+pullSide*(w/2-.18):x;buildPull(g,{x:px,y:py,z:z-settings.frontThickness/24,length,style:fixtures.pullStyle,vertical},pull);}}
 function carcass(g,w,h,d){const t=settings.caseThickness/12,kick=settings.toeHeight/12,back=settings.backThickness/12;
 box(g,w-2*t,kick,d-settings.toeRecess/12,0,kick/2,settings.toeRecess/24,black);
 for(const sign of [-1,1])box(g,t,h-kick,d,sign*(w-t)/2,(h+kick)/2,0,cabinet);
 box(g,w-2*t,t,d-back,0,kick+t/2,-back/2,boxMat);box(g,w-2*t,h-kick,back,0,(h+kick)/2,d/2-back/2,boxMat);
 for(const sign of [-1,1])box(g,w-2*t,t,.25,0,h-t/2,sign*(d/2-.125),boxMat);
 }
 function base(g,u){const {w,h,d,unitType:type}=u,kick=settings.toeHeight/12;
 if(type==='panel'||type==='filler'){box(g,w,h,d,0,h/2,0,cabinet);return;}
 carcass(g,w,h,d);const fs=cabinetFronts(k,{id:u.id.slice(2),width:u.width,height:k.baseHeight-settings.toeHeight,type,bottom:settings.toeHeight,drawerLayout:u.drawerLayout,hinge:u.hinge});
 for(const f of fs){const ww=f.width/12,hh=f.height/12,x=-f.x/12,y=f.y/12,z=-d/2-settings.frontThickness/24;
  if(f.kind==='door'){const edge=f.hinge==='right'?-1:1,hinge=new THREE.Group();hinge.position.set(x+edge*ww/2,y,z);g.add(hinge);front(hinge,ww,hh,-edge*ww/2,0,0,false,false,true,false,null,-edge);if(k.showOpen)hinge.rotation.y=-edge*1.2;}
  else {const open=k.showOpen&&(f.kind==='pull-out'||f.id.endsWith('D1'))?18/12:0;front(g,ww,hh,x,y,z-open,true,false,f.pulls>0,false,f.pullY/12);if(open){const dw=w-2*settings.caseThickness/12-.08,dd=Math.min(settings.runnerLength/12,d-.1),dh=Math.max(.15,hh-.2),dt=settings.drawerSide/12;box(g,dw,settings.drawerBottom/12,dd,0,y-dh/2,z-open+dd/2,boxMat);for(const sign of [-1,1]){box(g,dt,dh,dd,sign*(dw-dt)/2,y,z-open+dd/2,boxMat);box(g,dw,dh,dt,0,y,z-open+(sign===1?dd-dt/2:dt/2),boxMat);}}}
 }
 if(type==='doors')box(g,w-2*settings.caseThickness/12-.125/12,settings.shelfThickness/12,d-settings.backThickness/12-.75/12,0,(h+kick)/2,-.03,boxMat);
 }
 function sinkFixture(g,u){
 const depth=k.counterDepth/12,y=layout.top/12,cz=-(depth-u.d)/2,sw=stone.sinkWidth/12,sd=stone.sinkDepth/12,bd=stone.sinkBowlDepth/12;
 const sink=fixtures.sinkFinish==='steel'?fixtureMetal('steel','sink'):new THREE.MeshPhysicalMaterial({color:fixtures.sinkFinish==='white'?'#fafafa':'#303235',roughness:fixtures.sinkFinish==='white'?.22:.75});sink.userData.fixturePart='sink';
 buildSinkBowl(g,{y:y-stone.slabMm/25.4/12,z:cz,width:sw,depth:sd,bowlDepth:bd},sink);
 if(stone.faucetHoles)buildFaucet(g,{y,z:cz+sd/2+.12,style:fixtures.faucetStyle},fixtureMetal(fixtures.faucetFinish,'faucet'));
 }

 for(const u of layout.units){const g=new THREE.Group();g.userData.entityId=u.id;g.position.set(u.x,0,u.z);g.rotation.y=u.rotation*Math.PI/180;parent.add(g);const {w,h,d,unitType:type}=u;
 if(type==='fridge'){
  const pd=settings.fridgePanelDepth/12,pc=(d-pd)/2,clear=settings.fridgeClearHeight/12,bridge=h-clear;
  for(const sign of [-1,1])box(g,.75/12,h,pd,sign*(w-.75/12)/2,h/2,pc,cabinet);
  if(bridge>0){box(g,w-.125,bridge,pd,0,clear+bridge/2,pc,boxMat);for(const f of cabinetFronts(k,{id:u.id+'-BR',width:u.width-1.5,height:bridge*12,type:'bridge',bottom:clear*12}))front(g,f.width/12,f.height/12,f.x/12,f.y/12,pc-pd/2-settings.frontThickness/24,false,false,true,true);}
  box(g,w-.16,5.75,d-.5,0,2.875,.25,steel);for(const sign of [-1,1]){const door=new THREE.Group();door.position.set(sign*(w-.16)/2,3.65,-d/2+.35);g.add(door);box(door,(w-.19)/2,4.1,.12,-sign*(w-.19)/4,0,0,steel);box(door,.045,1.3,.1,-sign*((w-.19)/2-.12),-.3,-.1,pull);if(k.showOpen)door.rotation.y=sign*1.2;}
  box(g,w-.18,1.45,.12,0,.76,-d/2+.25,steel);
 }else if(type==='range'){
  const wolf=k.rangeModel==='wolf36',rw=wolf?35.875/12:w-.025,rh=wolf?36.5/12:3;
  box(g,rw,rh-.25,d-.25,0,(rh-.25)/2,.125,steel);box(g,rw,.08,d-.27,0,rh-.1,.125,black);
  box(g,rw-.14,.28,.1,0,rh-.35,-d/2+.2,steel);
  box(g,rw*.83,1.6,.035,0,1.27,-d/2+.21,black);box(g,rw*.68,1.16,.018,0,1.26,-d/2+.18,new THREE.MeshPhysicalMaterial({color:'#13252d',metalness:.35,roughness:.12}));
  box(g,rw*.78,.07,.08,0,2.18,-d/2+.06,steel);
  const red=new THREE.MeshPhysicalMaterial({color:wolf?'#be1e26':'#242e32',roughness:.3,clearcoat:.4});
  for(let i=0;i<(wolf?7:5);i++){const x=-rw*.4+i*rw*.8/((wolf?7:5)-1);const knob=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.085,24),red);knob.rotation.x=Math.PI/2;knob.position.set(x,rh-.35,-d/2+.09);g.add(knob);box(g,.012,.043,.008,x,rh-.31,-d/2+.042,ceramic);}
  for(const x of(wolf?[-rw/3,0,rw/3]:[-rw/4,rw/4]))for(const z of[-d*.16,d*.27]){
   const cap=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.045,24),black);cap.position.set(x,rh-.03,z);g.add(cap);
   for(const sign of[-1,1]){box(g,.035,.055,.76,x+sign*.31,rh+.01,z,black);box(g,.66,.055,.035,x,rh+.01,z+sign*.32,black);}
   box(g,.58,.05,.035,x,rh+.02,z,black);box(g,.035,.05,.65,x,rh+.02,z,black);
  }
  if(wolf){const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle='#aeb7b7';ctx.fillRect(0,0,256,64);ctx.fillStyle='#263035';ctx.font='bold 38px Arial';ctx.textAlign='center';ctx.fillText('WOLF',128,47);const badge=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas)});box(g,.42,.1,.012,0,.33,-d/2+.184,badge);}
  const hood=stone.hoodBottom/12;box(g,rw+.08,.14,2,0,hood+.07,.15,steel);box(g,rw,.7,1.5,0,hood+.49,.4,steel);box(g,1.25,Math.max(.1,9-hood-.84),1,0,(9+hood+.84)/2,d/2-.5,steel);
 }else if(type==='dishwasher'){
  box(g,w-.04,h-.04,d-.05,0,h/2,0,black);const door=new THREE.Group();door.position.set(0,.2,-d/2-.04);g.add(door);box(door,w-.08,h-.2,.09,0,(h-.2)/2,0,steel);box(door,w*.7,.045,.08,0,h-.4,-.075,pull);if(k.showOpen)door.rotation.x=-Math.PI/2;
 }else{base(g,u);if(type==='sink')sinkFixture(g,u);}


 }
 for(const u of kitchenUppers(k)){
  const upper=new THREE.Group();upper.userData.entityId='k-upper-'+u.id;upper.position.set(u.x,u.bottom/12,u.z);upper.rotation.y=u.rotation*Math.PI/180;parent.add(upper);
  const w=u.width/12,h=u.height/12,d=u.depth/12,t=settings.caseThickness/12;
  for(const sign of[-1,1]){box(upper,t,h,d,sign*(w-t)/2,h/2,0,cabinet);box(upper,w-2*t,t,d,0,sign===1?h-t/2:t/2,0,cabinet);}
  box(upper,w-2*t,h,settings.backThickness/12,0,h/2,d/2-settings.backThickness/24,boxMat);for(const y of[h/3,h*2/3])box(upper,w-2*t-.125/12,settings.shelfThickness/12,d-settings.backThickness/12-.75/12,0,y,-.03,boxMat);
  for(const f of cabinetFronts(k,{id:u.id,width:u.width,height:u.height,type:'upper'})){const ww=f.width/12,edge=f.hinge==='right'?-1:1,hinge=new THREE.Group();hinge.position.set(-f.x/12+edge*ww/2,f.y/12,-d/2-settings.frontThickness/24);upper.add(hinge);front(hinge,ww,f.height/12,-edge*ww/2,0,0,false,k.upperFront==='glass',true,true,null,-edge);if(k.showOpen)hinge.rotation.y=-edge*1.1;}
  box(upper,w-.06,.08,.08,0,.01,-.49,cabinet);box(upper,w-.2,.025,.055,0,-.025,-.38,new THREE.MeshStandardMaterial({color:'#fff0da',emissive:'#ffcf8f',emissiveIntensity:2}));
 }
 const c=new THREE.Group();c.userData.entityId='k-corner';c.position.set(KITCHEN_DATUM.west,0,KITCHEN_DATUM.south);parent.add(c);
 const span=k.corner/12,depth=k.baseDepth/12,h=k.baseHeight/12,t=settings.caseThickness/12,kick=settings.toeHeight/12;
 if(k.cornerStyle==='piecut'){
  for(const y of [kick+t/2,h-t/2]){box(c,depth,t,span,depth/2,y,-span/2,boxMat);box(c,span-depth,t,depth,(span+depth)/2,y,-depth/2,boxMat);}
  box(c,t,h-kick,span,t/2,(h+kick)/2,-span/2,cabinet);box(c,span,h-kick,t,span/2,(h+kick)/2,-t/2,cabinet);
  box(c,depth,h-kick,t,depth/2,(h+kick)/2,-span+t/2,cabinet);box(c,t,h-kick,depth,span-t/2,(h+kick)/2,-depth/2,cabinet);
  const shelfY=(h+kick)/2,st=settings.shelfThickness/12;
  box(c,depth-2*t,st,span-2*t,depth/2,shelfY,-span/2,boxMat);
  box(c,span-depth,st,depth-2*t,(span+depth)/2-t,shelfY,-depth/2,boxMat);
  box(c,depth-settings.toeRecess/12,kick,span, (depth-settings.toeRecess/12)/2,kick/2,-span/2,black);
  box(c,span-depth,kick,depth-settings.toeRecess/12,(span+depth)/2,kick/2,-(depth-settings.toeRecess/12)/2,black);
  const dw=(k.corner-k.baseDepth-2*settings.reveal)/12,dh=h-kick-2*settings.reveal/12;
  const hinge=new THREE.Group();hinge.position.set(depth+settings.frontThickness/24,(h+kick)/2,-span+settings.reveal/12);hinge.rotation.y=k.showOpen?0:-Math.PI/2;c.add(hinge);
  front(hinge,dw,dh,dw/2,0,0);
  const fold=new THREE.Group();fold.position.set(dw+settings.reveal/12,0,k.showOpen?-settings.frontThickness/12:0);fold.rotation.y=k.showOpen?Math.PI-.08:Math.PI/2;hinge.add(fold);front(fold,dw,dh,dw/2,0,0,false,false,false);
 }else{box(c,depth,h,span,depth/2,h/2,-span/2,cabinet);if(span>depth)box(c,span-depth,h,depth,(span+depth)/2,h/2,-depth/2,cabinet);}

 const g=new THREE.Group();g.userData.entityId='k-island-cladding';g.position.set(layout.island.x,0,layout.island.z);parent.add(g);const {w,d}=layout.island;
 buildStone(parent,k,{...palette,cabinet});
 const panelX=w/2-k.seatingOverhang/12-.03125;g.userData.seatingFace=true;
 const backLength=(k.islandLength-ends.north-ends.south+1.5)/12,backZ=(ends.north-ends.south)/24;
 box(g,.0625,k.baseHeight/12,backLength,panelX,k.baseHeight/24,backZ,cabinet);
 const endDepth=(k.islandWidth-k.seatingOverhang-1.5)/12;
 for(const end of ['north','south'])box(g,endDepth,k.baseHeight/12,.0625,-w/2+1.5/12+endDepth/2,k.baseHeight/24,end==='north'?-d/2+(ends.north-.375)/12:d/2-(ends.south-.375)/12,cabinet);
 for(const z of [-d/3,0,d/3]){const seat=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.12,24),fabric);seat.position.set(w/2+.6,2,z);g.add(seat);for(const x of [-.3,.3])for(const zz of [-.3,.3])box(g,.05,1.95,.05,w/2+.6+x,.975,z+zz,metal);}
 parent.traverse(m=>{if(m.isMesh){let p=m;while(p&&!p.userData.entityId)p=p.parent;if(p)m.userData.entityId=p.userData.entityId;}});
 parent.updateMatrixWorld(true);const batches=new Map(),inv=new THREE.Matrix4().copy(parent.matrixWorld).invert();
 parent.traverse(m=>{if(!m.isMesh)return;const id=m.userData.entityId||'k-structure',key=id+':'+m.material.uuid;if(!batches.has(key))batches.set(key,{id,mat:m.material,geos:[]});batches.get(key).geos.push((m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld)));m.geometry.dispose();});
 parent.clear();const groups=new Map();for(const batch of batches.values()){const geo=mergeGeometries(batch.geos,false);batch.geos.forEach(g=>g.dispose());if(!geo)throw new Error('Kitchen geometry could not be combined.');let group=groups.get(batch.id);if(!group){group=new THREE.Group();group.userData.entityId=batch.id;groups.set(batch.id,group);parent.add(group);}const m=new THREE.Mesh(geo,batch.mat);m.userData.entityId=batch.id;m.castShadow=m.receiveShadow=true;group.add(m);}
 return layout;
}
