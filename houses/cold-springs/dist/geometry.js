import * as THREE from 'three';
import {RoundedBoxGeometry} from './assets/RoundedBoxGeometry.js';
import {groundHeight,ceilingHeight} from './spatial.js';
import {roofEnvelope,roofForms} from './roof-envelope.js';
import {dimensions,finishedCeiling,garageSlabHeight,porchHeight,patioHeight} from './dimensions.js';

export function buildHouse(scene,model,settings,objects){
 const house=new THREE.Group(),furnishings=new THREE.Group(),ceilings=new THREE.Group(),roof=new THREE.Group(),shell=new THREE.Group();
 scene.add(house);house.add(shell,furnishings,ceilings,roof);
 const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extra});
 const m={wall:material(settings.wall),floor:material(settings.floor),cabinet:material(settings.cabinet),trim:material('#f2f0e9'),stone:material('#c8c4b9'),counter:material('#e7e4da'),wood:material('#a1937f'),fabric:material('#ddd9cf'),dark:material('#343a3a'),metal:material('#9c9f9b',{metalness:.6,roughness:.3}),glass:material('#c0d7da',{transparent:true,opacity:.16,depthWrite:false,roughness:.15}),tile:material('#dad8cf'),roof:material('#555b5a'),siding:material('#a4aaa1'),concrete:material('#c0c0b7'),rug:material('#c9c4b7'),white:material('#f6f5ef')};
 const cutMaterials=Object.values(m);
 // Unbranded floor texture in world feet. All colors remain client-specific settings.
 const cv=document.createElement('canvas');cv.width=512;cv.height=512;const ctx=cv.getContext('2d');
 ctx.fillStyle='#e5e2da';ctx.fillRect(0,0,512,512);let seed=51;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 for(let row=0;row<8;row++){ctx.fillStyle=`rgba(110,100,80,${.015+rand()*.035})`;ctx.fillRect(0,row*64,512,64);ctx.fillStyle='rgba(90,80,60,.16)';ctx.fillRect(0,row*64,512,1);for(let k=0;k<28;k++){ctx.strokeStyle=`rgba(110,100,80,${.015+rand()*.04})`;ctx.beginPath();const yy=row*64+rand()*64;ctx.moveTo(0,yy);ctx.bezierCurveTo(130,yy-3,350,yy+4,512,yy);ctx.stroke();}const shift=(row%3)*170;ctx.fillRect(shift,row*64,1,64);}
 const texture=new THREE.CanvasTexture(cv);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;m.floor.map=texture;
 function box(w,h,d,x,y,z,mat=m.wall,parent=shell){const rounded=parent.parent===furnishings&&Math.min(w,h,d)>.1;const geo=rounded?new RoundedBoxGeometry(w,h,d,2,Math.min(.07,Math.min(w,h,d)/4)):new THREE.BoxGeometry(w,h,d);const q=new THREE.Mesh(geo,mat);q.position.set(x,y,z);q.castShadow=true;q.receiveShadow=true;parent.add(q);return q;}
 function cyl(r,h,x,y,z,mat=m.dark,parent=shell){const q=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),mat);q.position.set(x,y,z);q.castShadow=true;q.receiveShadow=true;parent.add(q);return q;}
 function shape(points){const s=new THREE.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();return s;}
 function floor(points,y,mat=m.floor,parent=shell){const geo=new THREE.ShapeGeometry(shape(points));geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/8,pos.getZ(i)/5.33);const mesh=new THREE.Mesh(geo,mat);mesh.position.y=y;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function slab(x0,z0,x1,z1,y,mat=m.floor,parent=shell){return floor([[x0,z0],[x1,z0],[x1,z1],[x0,z1]],y,mat,parent);}
 // Surfaces and walking use the same level functions and exact plan extents.
 function gradedFloor(points,height,mat){const mesh=floor(points,0,mat);const p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,height(p.getX(i),p.getZ(i)));mesh.geometry.computeVertexNormals();return mesh;}
 const mainHull=model.hull.filter(p=>p[1]<=44.17);mainHull.splice(mainHull.findIndex(p=>p[0]===33.5&&Math.abs(p[1]-44.1667)<.01)+1,0,[1,44+2/12]);
 floor(mainHull,0).name='main-floor';
 gradedFloor([[1,44+2/12],[33.5,44+2/12],[33.5,73+5/12],[23.5,73+5/12],[23.5,74+5/12],[11,74+5/12],[11,73+5/12],[1,73+5/12]],x=>garageSlabHeight(x),m.concrete).name='garage-floor';
 const {porch:por,patio:pat,extension:ext,steps:st}=dimensions;
 gradedFloor([[pat.x0,pat.z0],[pat.x1,pat.z0],[pat.x1,pat.z1],[pat.x0,pat.z1]],(_,z)=>patioHeight(z),m.stone);
 gradedFloor([[ext.x0,ext.z0],[ext.x1,ext.z0],[ext.x1,ext.z1],[ext.x0,ext.z1]],(_,z)=>patioHeight(z),m.stone);
 gradedFloor([[por.x0,por.z0],[por.x1,por.z0],[por.x1,por.z1],[por.x0,por.z1]],(_,z)=>porchHeight(z),m.stone);
 for(let i=0;i<2;i++)box(por.x1-por.x0,7/12,1,(por.x0+por.x1)/2,porchHeight(por.z1)-(i+1.5)*7/12,por.z1+i+.5,m.stone);
 // Three risers require two intermediate treads before the garage slab.
 for(let i=0;i<2;i++){const z=st.startZ+(i+.5)*st.run,top=groundHeight((st.x0+st.x1)/2,z),bottom=garageSlabHeight((st.x0+st.x1)/2);box(st.x1-st.x0,top-bottom,st.run,(st.x0+st.x1)/2,(top+bottom)/2,z,m.concrete);}
 const bathZones=[[0.458333,18.96,11.7333,33.54],[12.3267,25.46,17.62,30.9533],[7.7467,31.2467,13.7933,37],[63.1,13.9,75.2,18.4],[63.1,18.9,75.2,24.4],[2.13,36.85,14,43.7]];
 for(const p of bathZones){slab(...p,.005,m.tile);for(let x=p[0];x<p[2];x+=2)box(.016,.008,p[3]-p[1],x,.015,(p[1]+p[3])/2,m.stone);for(let z=p[1];z<p[3];z+=2)box(p[2]-p[0],.008,.016,(p[0]+p[2])/2,.015,z,m.stone);}
 // Walls are real closed vector footprints, with original door/window gaps.
 for(const points of model.walls){
  const dense=[];points.forEach((p,i)=>{const b=points[(i+1)%points.length],n=Math.max(1,Math.ceil(Math.hypot(b[0]-p[0],b[1]-p[1])/1));for(let j=0;j<n;j++)dense.push([p[0]+(b[0]-p[0])*j/n,p[1]+(b[1]-p[1])*j/n]);});
  const geo=new THREE.ExtrudeGeometry(shape(dense),{depth:1,bevelEnabled:false,curveSegments:1});geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,pos.getY(i)>.5?ceilingHeight(x,z):groundHeight(x,z));}geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,m.wall);mesh.castShadow=true;mesh.receiveShadow=true;shell.add(mesh);
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.4)continue;const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;const q=box(len,.32,.065,x,groundHeight(x,z)+.16,z,m.trim);q.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);}
 }
 // Fill structural apertures around all glazing in a vertical stack. Upper
 // windows must not overwrite lower windows with a full-height sill box.
 const lower=model.openings.filter(o=>!o.upper),doors=[];
 for(const o of lower){
  const group=model.openings.filter(v=>v.axis===o.axis&&Math.abs(v.x-o.x)<.02&&Math.abs(v.z-o.z)<.02);
  const g=new THREE.Group();g.position.set(o.x,groundHeight(o.x,o.z),o.z);if(o.axis==='z')g.rotation.y=Math.PI/2;shell.add(g);
  const width=o.roughWidth||o.w,top=ceilingHeight(o.x,o.z)-g.position.y;
  const xs=[-width/2,width/2,...group.flatMap(v=>[-v.w/2,v.w/2])].filter(x=>x>=-width/2&&x<=width/2).sort((a,b)=>a-b);
  const ys=[0,top,...group.flatMap(v=>[v.sill,v.sill+v.h])].filter(y=>y>=0&&y<=top).sort((a,b)=>a-b);
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){
   const w=xs[i+1]-xs[i],h=ys[j+1]-ys[j],x=(xs[i]+xs[i+1])/2,y=(ys[j]+ys[j+1])/2;
   if(w<.001||h<.001||group.some(v=>Math.abs(x)<v.w/2+.0001&&y>v.sill&&y<v.sill+v.h))continue;
   box(w,h,o.t,x,y,0,m.wall,g);
  }
 }
 for(const o of model.openings){
  const g=new THREE.Group();g.position.set(o.x,groundHeight(o.x,o.z),o.z);if(o.axis==='z')g.rotation.y=Math.PI/2;(o.upper&&o.id!=='patio-transom'?roof:shell).add(g);
  if(o.kind==='window'){
   box(o.w+.2,.1,o.t+.12,0,o.sill,0,m.trim,g);
   box(o.w,.08,.16,0,o.sill+.04,0,m.dark,g);box(o.w,.08,.16,0,o.sill+o.h-.04,0,m.dark,g);
   for(const xx of [-o.w/2+.04,o.w/2-.04])box(.08,o.h,.16,xx,o.sill+o.h/2,0,m.dark,g);
   const n=o.w>8?3:o.w>4?2:1;for(let i=1;i<n;i++)box(.07,o.h,.14,-o.w/2+o.w*i/n,o.sill+o.h/2,0,m.dark,g);
   box(o.w-.12,o.h-.12,.025,0,o.sill+o.h/2,0,m.glass,g);
  }else{
   for(const xx of [-o.w/2-.06,o.w/2+.06])box(.12,o.h+.12,o.t+.14,xx,(o.h+.12)/2,0,m.trim,g);
   box(o.w+.24,.12,o.t+.14,0,o.h+.06,0,m.trim,g);
   if(o.kind==='garage'){
    box(o.w,o.h,.18,0,o.h/2,0,m.trim,g);for(let row=1;row<4;row++)box(o.w,.035,.04,0,row*2,-.12,m.stone,g);
    for(let col=0;col<4;col++){box(1.8,1,.05,-3.25+col*2.16,6.65,-.13,m.dark,g);box(1.64,.84,.06,-3.25+col*2.16,6.65,-.17,m.glass,g);}
   }else if(o.kind==='slider'){
    for(const side of [-1,1]){const xx=side*(o.w/2-2);box(3.9,o.h-.1,.1,xx,o.h/2,0,m.glass,g);for(const dx of [-1.96,1.96])box(.09,o.h,.15,xx+dx,o.h/2,0,m.dark,g);box(4,.09,.15,xx,.045,0,m.dark,g);box(4,.09,.15,xx,o.h-.045,0,m.dark,g);}
   }else if(o.kind==='entry'){
    // A-1: 2'6 sidelight + 3'0 door + 2'6 sidelight, all 7'0 high.
    for(const side of [-1,1]){box(2.5,7,.1,side*2.75,3.5,0,m.glass,g);box(.1,7,.3,side*1.5,3.5,0,m.dark,g);}
   }
   doors.push(g);
  }
 }
 const fp=dimensions.fireplace,fw=fp.x1-fp.x0,fd=fp.z1-fp.z0,fx=(fp.x0+fp.x1)/2,fz=(fp.z0+fp.z1)/2,fh=ceilingHeight(fx,fz);
 box(fw,fh,fd,fx,fh/2,fz,m.stone);
 box(.035,1.8,5,fp.x0-.02,2.1,fz,m.dark);box(.05,.06,4.7,fp.x0-.05,1.3,fz,material('#c58e58',{emissive:'#b96f30',emissiveIntensity:.35}));box(.07,2.8,5.1,fp.x0-.05,5.3,fz,m.dark);
 // Neutral furnishings establish scale. They can be hidden with one toggle.
 for(const o of objects){
  const g=new THREE.Group();g.position.set(o.x,groundHeight(o.x,o.z)+(o.y||0),o.z);g.name=o.name;g.rotation.y=(o.rot||0)*Math.PI/180;furnishings.add(g);const {w,d,h,type}=o;
  const B=(ww,hh,dd,x,y,z,mat)=>box(ww,hh,dd,x,y,z,mat,g);const C=(r,hh,x,y,z,mat)=>cyl(r,hh,x,y,z,mat,g);
  if(['counter','island','vanity'].includes(type)){
   B(w-.12,h-.22,d-.12,0,h/2,0,m.cabinet);B(w+.08,.14,d+.08,0,h,0,m.counter);B(w-.18,.18,d-.18,0,.09,0,m.dark);
   const count=Math.max(1,Math.round(w/2));for(let i=0;i<count;i++){B(.026,h-.4,.02,-w/2+(i+1)*w/count,h/2,d/2,m.stone);B(.46,.04,.06,-w/2+(i+.5)*w/count,h-.3,d/2+.03,m.dark);}
   if(type==='vanity'){const n=w>4?2:1;for(let i=0;i<n;i++){const x=w>4?(i-.5)*w*.5:0;B(1.35,.04,1.05,x,h+.09,0,m.white);B(1.1,.025,.8,x,h+.11,0,m.stone);C(.045,.5,x,h+.32,-d*.32,m.metal);}}
  }else if(type==='sink'){
   B(w,.06,d,0,.02,0,m.metal);B(w-.16,.03,d-.16,0,.055,0,m.dark);C(.045,.75,-w*.48,.4,0,m.metal);B(.45,.06,.06,-w*.32,.75,0,m.metal);
  }else if(type==='bed'){
   B(w,1.15,d,0,.65,0,m.wood);B(w+.1,.7,d+.1,0,1.5,0,m.white);B(w+.15,.14,d*.68,0,1.92,d*.15,m.fabric);B(w+.3,3.6,.22,0,1.8,-d/2,m.fabric);
   for(const x of [-w*.25,w*.25]){B(w*.42,.25,1.3,x,2,-d*.32,m.white);B(1.4,1.5,1.4,x<0?-w/2-1:w/2+1,.75,-d/2+.6,m.wood);}
  }else if(type==='sofa'){
   B(w,1.3,d,0,.65,0,m.fabric);B(.5,2.65,d,-w/2+.2,1.325,0,m.fabric);for(const z of [-d/2+.2,d/2-.2])B(w,1.9,.45,0,.95,z,m.fabric);for(let i=0;i<3;i++)B(w-.5,.25,d/3-.08,.2,1.4,-d/3+i*d/3,m.white);
  }else if(type==='chair'){
   B(w,.35,d,0,1.3,0,m.fabric);B(w,1.25,.28,0,1.8,d/2-.1,m.fabric);for(const x of [-w*.35,w*.35])for(const z of [-d*.35,d*.35])B(.09,1.15,.09,x,.57,z,m.dark);
  }else if(['table','coffee','desk','bench'].includes(type)){
   B(w,.15,d,0,h,0,type==='coffee'?m.stone:m.wood);for(const x of [-w*.38,w*.38])for(const z of [-d*.35,d*.35])B(.12,h,.12,x,h/2,z,m.dark);
   if(o.chairs)for(const side of [-1,1])for(const xx of [-1.5,1.5]){B(1.5,.25,1.5,xx,1.5,side*(d/2+1),m.fabric);B(1.5,1.2,.15,xx,2.1,side*(d/2+1.65),m.wood);for(const dx of [-.55,.55])B(.08,1.4,.08,xx+dx,.7,side*(d/2+1),m.dark);}
  }else if(type==='fridge'||type==='oven'||type==='washer'||type==='range'){
   B(w,h,d,0,h/2,0,type==='washer'?m.white:m.metal);
   if(type==='fridge'){B(.04,h-.4,.05,0,h/2,d/2+.02,m.dark);B(.06,1.8,.08,.15,4.5,d/2+.08,m.dark);}
   if(type==='oven'){B(w-.3,1.8,.06,0,4.7,d/2+.04,m.dark);B(w-.3,1.7,.06,0,2.3,d/2+.04,m.dark);}
   if(type==='washer'){const disk=new THREE.Mesh(new THREE.CylinderGeometry(.73,.73,.08,28),m.dark);disk.rotation.x=Math.PI/2;disk.position.set(0,1.5,d/2+.04);g.add(disk);B(w-.2,.3,.06,0,2.8,d/2+.04,m.concrete);}
   if(type==='range'){B(w,.05,d,0,h+.03,0,m.dark);for(const x of [-w*.25,w*.25])for(const z of [-d*.25,d*.25])C(.3,.035,x,h+.07,z,m.metal);B(w+.3,.5,d+.2,0,6.2,0,m.metal);B(w*.6,2,d*.5,0,7.2,-d*.2,m.metal);}
  }else if(type==='shower'){
   B(w,.1,d,0,.05,0,m.white);B(w-.1,6.8,.025,0,3.4,d/2,m.glass);B(.025,6.8,d, -w/2,3.4,0,m.glass);B(.045,6.8,.045,-w/2,3.4,d/2,m.metal);C(.12,.04,0,.12,0,m.metal);B(.25,.25,.06,0,4.2,-d/2+.03,m.metal);B(.4,.08,.5,0,6.6,-d/2+.2,m.metal);
  }else if(type==='tub'){
   const tg=new THREE.CapsuleGeometry(.5,1,8,24);tg.rotateZ(Math.PI/2);tg.scale(w/2,h,d);const tub=new THREE.Mesh(tg,m.white);tub.position.y=h/2;g.add(tub);const ig=new THREE.CapsuleGeometry(.5,1,8,24);ig.rotateZ(Math.PI/2);ig.scale((w-.3)/2,.08,d-.3);const inner=new THREE.Mesh(ig,m.stone);inner.position.y=h*.95;g.add(inner);
  }else if(type==='toilet'){
   B(w*.8,1.1,.65,0,1.65,-d*.32,m.white);const q=new THREE.Mesh(new THREE.SphereGeometry(.65,20,12),m.white);q.scale.set(1,.55,1.35);q.position.set(0,1.15,.2);g.add(q);C(.35,1,0,.5,.15,m.white);
  }else if(type==='hottub'){
   B(w,h,d,0,h/2,0,m.dark);B(w+.1,.12,d+.1,0,h,0,m.white);B(w-.65,.04,d-.65,0,h+.08,0,material('#879f9b',{roughness:.12,metalness:.2}));
  }else if(type==='firepit'){
   B(w,h,d,0,h/2,0,m.stone);B(w-.6,.04,d-.6,0,h+.03,0,m.dark);
  }else if(type==='shelves'){
   for(let y=.25;y<h;y+=1.25)B(w,.09,d,0,y,0,m.wood);for(const z of [-d/2,d/2])B(w,h,.08,0,h/2,z,m.cabinet);
  }
 }
 // Floor rugs are only provisional scale cues.
 slab(44.9,12.7,53.5,27.3,.03,m.rug,furnishings);slab(8.8,5.5,16.2,13,.025,m.rug,furnishings);
 // Ceiling meshes track the vault used for the wall heads. Keep the garage separate.
 function ceilingPatch(x0,z0,x1,z1){const g=new THREE.PlaneGeometry(x1-x0,z1-z0,Math.ceil(x1-x0),Math.ceil(z1-z0));g.rotateX(Math.PI/2);g.translate((x0+x1)/2,0,(z0+z1)/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,ceilingHeight(p.getX(i),p.getZ(i)));g.computeVertexNormals();const mesh=new THREE.Mesh(g,m.wall);mesh.receiveShadow=true;ceilings.add(mesh);}
 for(const r of [[7,0,35.5,9.5],[1,9.5,21.54,18.67],[0,18.67,21.54,33.8],[1.67,33.8,33.5,43.707],[21.54,9.5,56.85,29.12],[21.54,29.12,46.5,44.167],[46.5,29.12,58.33,36.53],[56.85,9.5,75.67,29],[58.1667,0,74.6667,9.5],[58.1667,29,74.6667,38.5],[1,44.1667,33.5,73.4167],[11,73.4167,23.5,74.4167]])ceilingPatch(...r);
 // Small neutral downlights, representative only (not an electrical layout).
 const lightLocations=[[40,14],[48,14],[40,24],[50,25],[25,6],[32,6],[25,12],[32,23],[13,8],[17,16],[6,24],[7,29],[28,34],[26,40],[9,40],[38,35],[42,41],[52,33],[65,6],[70,11],[65,28],[70,35],[66,16],[66,22],[58.7,20],[13,55],[26,55],[13,67],[26,67]];
 const lightMat=material('#fff9de',{emissive:'#fff2cc',emissiveIntensity:.7});cutMaterials.push(lightMat);
 for(const [x,z] of lightLocations){const y=ceilingHeight(x,z)-.03;cyl(.17,.035,x,y,z,lightMat,ceilings);}
 // Roof pitches and framing extents from A-1b. Intersections, hips and
 // dormer joinery remain envelope approximations pending the missing section.
 const roofFaces=roofEnvelope(roofForms,dimensions.plateAboveSubfloor-dimensions.floorFinish,finishedCeiling,model.openings.filter(o=>o.upper).map(o=>({...o,baseY:groundHeight(o.x,o.z)})));
 for(const face of roofFaces){const vertices=[];for(let i=1;i<face.points.length-1;i++)vertices.push(...face.points[0],...face.points[i],...face.points[i+1]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,face.kind==='roof'?m.roof:m.siding);mesh.material.side=THREE.DoubleSide;mesh.castShadow=mesh.receiveShadow=true;roof.add(mesh);}
 // Roof chimney follows structural envelope; architectural detail remains a handoff note.
 box(4,7.5,8,52.8,18.5,19.4,m.stone,roof);box(4.4,.28,8.4,52.8,22.4,19.4,m.dark,roof);
 // A-1b: shed dormer plate 5'3 above the garage/house plate, 3:12 roof.
 const dormerFront=32.2708333,dormerBack=dormerFront-7.5,dormerZ0=52.58,dormerZ1=67.08,plate=dimensions.plateAboveSubfloor-dimensions.floorFinish,dormerTop=plate+5.25;
 const dw=model.openings.filter(o=>o.id.startsWith('garage-dormer-')).map(o=>({...o,y:groundHeight(o.x,o.z)+o.sill}));
 const dzs=[dormerZ0,dormerZ1,...dw.flatMap(o=>[o.z-o.w/2,o.z+o.w/2])].sort((a,b)=>a-b),dys=[plate,dormerTop,...dw.flatMap(o=>[o.y,o.y+o.h])].sort((a,b)=>a-b);
 for(let i=0;i<dzs.length-1;i++)for(let j=0;j<dys.length-1;j++){const z=(dzs[i]+dzs[i+1])/2,y=(dys[j]+dys[j+1])/2;if(dw.some(o=>Math.abs(z-o.z)<o.w/2&&y>o.y&&y<o.y+o.h))continue;box(.3,dys[j+1]-dys[j],dzs[i+1]-dzs[i],dormerFront,y,z,m.siding,roof);}
 const dormer=box(9.5,.2,dormerZ1-dormerZ0+2,(dormerFront+dormerBack)/2,dormerTop+7.5*.125,(dormerZ0+dormerZ1)/2,m.roof,roof);dormer.rotation.z=-Math.atan(3/12);
 for(const z of [dormerZ0,dormerZ1]){const verts=[[dormerFront,plate,z],[dormerFront,dormerTop,z],[dormerBack,dormerTop+7.5*.25,z],[dormerBack,plate+(33.5-dormerBack)*7/12,z]];const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([0,1,2,0,2,3].flatMap(i=>verts[i]),3));geo.computeVertexNormals();const side=new THREE.Mesh(geo,m.siding);side.material.side=THREE.DoubleSide;side.castShadow=true;roof.add(side);}
 // Covered porch / rear patio timber posts and open trusses.
 function beam(a,b,width=.35,parent=roof){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),q=box(width,va.distanceTo(vb),width,...va.clone().add(vb).multiplyScalar(.5).toArray(),m.wood,parent);q.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vb.sub(va).normalize());}
 for(const [x0,x1,z,base] of [[35.7,58.15,-.2,10.2],[47,58.05,44.4,8.5]]){for(const x of [x0,x1]){box(.65,base+.54,.65,x,(base-.54)/2,z,m.wood);box(.9,.5,.9,x,-.29,z,m.stone);}const mid=(x0+x1)/2,apex=base+(x1-x0)/2*.65;beam([x0,base,z],[x1,base,z],.45);beam([x0,base,z],[mid,apex,z],.4);beam([mid,apex,z],[x1,base,z],.4);beam([mid,base,z],[mid,apex,z],.3);}
 return {house,shell,furnishings,ceilings,roof,materials:m,cutMaterials};
}
