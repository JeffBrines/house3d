import {distribution} from './distribution-config.js';
import * as THREE from 'three';
import {ensureSurfaces} from './finish-config.js?v=details-5';

const sources={}, textureMaps=new Map();let anisotropy=4;
export async function loadSurfaceTextures(maxAnisotropy=4){
 anisotropy=Math.min(8,maxAnisotropy);const loader=new THREE.TextureLoader();
 const files=['wood_floor_diff','wood_floor_nor_gl','wood_floor_rough','oak_veneer_01_diff','oak_veneer_01_nor_gl','oak_veneer_01_rough','marble_01_diff','beige_wall_001_nor_gl',...(distribution.manufacturerSwatch?['saguaro-reference']:[])];
 const loaded=await Promise.allSettled(files.map(async name=>{const t=await loader.loadAsync('./assets/materials/'+name+'.jpg');t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=anisotropy;if(name.endsWith('_diff')||name==='saguaro-reference')t.colorSpace=THREE.SRGBColorSpace;sources[name]=t;}));
 return loaded.filter(r=>r.status==='rejected').length;
}
function scanned(name,repeat,rotation=0){if(!sources[name])return null;const key=[name,repeat,rotation].join(':');if(!textureMaps.has(key)){const t=sources[name].clone();t.repeat.set(1/repeat,1/repeat);t.rotation=rotation;t.needsUpdate=true;textureMaps.set(key,t);}return textureMaps.get(key);}
function tag(m,role,zone,variant){m.userData={surfaceRole:role,surfaceZone:zone,surfaceVariant:variant};return m;}
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
export function saguaroLayout(){
 const boards=[];for(let column=0;column<8;column++){const lengths=column%4===3?[30,45,75]:[75,75],offset=(column*41+17)%150;let at=offset-150;
  for(let cycle=0;cycle<3;cycle++)for(const length of lengths){boards.push({column,start:at,length,sample:(column+cycle+boards.length)%4});at+=length;}}
 return boards;
}
function saguaroMaps(direction){
 const key='saguaro:'+direction;if(textureMaps.has(key))return textureMaps.get(key);
 const c=document.createElement('canvas');c.width=1024;c.height=2048;const ctx=c.getContext('2d'),image=sources['saguaro-reference']?.image||sources.wood_floor_diff?.image;
 ctx.fillStyle='#ad956d';ctx.fillRect(0,0,c.width,c.height);
 // Samples from inside the manufacturer's photographed boards, excluding its seams.
 const samples=sources['saguaro-reference']?[[3,4,89,450],[102,136,87,320],[204,4,85,450],[306,4,80,320]]:[0,2,4,6].map(i=>[image?.width*(i+.08)/9,0,image?.width*.84/9,image?.height]),joints=[];
 for(const b of saguaroLayout()){const x=b.column*128,y=b.start/150*c.height,h=b.length/150*c.height;if(y+h<0||y>c.height)continue;
  if(image)ctx.drawImage(image,...samples[b.sample],x,y,128,h);ctx.fillStyle='rgba(58,42,24,.28)';ctx.fillRect(x,y,1,h);ctx.fillRect(x,y,128,1);joints.push([x,y,h]);}
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
 const relief=document.createElement('canvas');relief.width=c.width;relief.height=c.height;const r=relief.getContext('2d');r.fillStyle='#dedede';r.fillRect(0,0,c.width,c.height);for(const [x,y,h] of joints){r.fillStyle='#797979';r.fillRect(x,y,1,h);r.fillRect(x,y,128,1);}
 const bumpMap=new THREE.CanvasTexture(relief);for(const t of [map,bumpMap]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(12/64,12/150);t.rotation=direction*Math.PI/180;t.anisotropy=anisotropy;}
 const out={map,bumpMap};textureMaps.set(key,out);return out;
}
// Four courses of real-size tile; sampled stone variation and a shallow grout joint.
// Generated as render textures so changing format never stretches a baked grout grid.
function tileMaps(t,counter=false){
 const key=JSON.stringify([t,counter]);if(textureMaps.has(key))return textureMaps.get(key);
 const size=512,c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');
 if(sources.marble_01_diff){ctx.drawImage(sources.marble_01_diff.image,38,245,580,185,0,0,size,size);}else{ctx.fillStyle='#c7c1b5';ctx.fillRect(0,0,size,size);}
 const stone=ctx.getImageData?.(0,0,size,size)?.data;
 const albedo=ctx.createImageData(size,size),bump=ctx.createImageData(size,size),base=rgb(t.color),grout=rgb(t.grout);
 const columns=2,rows=counter?2:4,gx=t.joint/t.width/2,gy=t.joint/t.height/2;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const row=Math.floor(y/size*rows),u=x/size*columns+(t.pattern==='offset'&&row%2?.5:0),v=y/size*rows,fx=u-Math.floor(u),fy=v-row;
  const edge=counter?1:Math.min(fx/gx,(1-fx)/gx,fy/gy,(1-fy)/gy),joint=Math.max(0,Math.min(1,(edge-.55)/.45));
  const sx=(x+row*127)%size,sy=(y+Math.floor(u)*83)%size,p=(sy*size+sx)*4,lum=stone?(stone[p]*.21+stone[p+1]*.72+stone[p+2]*.07)/190:1;
  const variation=1+Math.max(-.12,Math.min(.1,(lum-1)*.35))+.014*Math.sin(row*32+Math.floor(u)*17),i=(y*size+x)*4;
  for(let n=0;n<3;n++){albedo.data[i+n]=grout[n]*(1-joint)+base[n]*variation*joint;bump.data[i+n]=180+joint*65;}
  albedo.data[i+3]=bump.data[i+3]=255;
 }
 ctx.putImageData(albedo,0,0);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
 const b=document.createElement('canvas');b.width=b.height=size;b.getContext('2d').putImageData(bump,0,0);const bumpMap=new THREE.CanvasTexture(b);
 for(const texture of [map,bumpMap]){texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(12/(t.width*columns),12/(t.height*rows));texture.anisotropy=anisotropy;}
 const out={map,bumpMap};textureMaps.set(key,out);return out;
}
export function surfaceMaterial(role,state,zone,variant){
 const s=ensureSurfaces(state),m=new THREE.MeshPhysicalMaterial({roughness:.65,clearcoat:0});
 if(role==='floor'){
  if(s.floorProduct==='saguaro'){Object.assign(m,saguaroMaps(s.direction));m.bumpScale=.008;m.roughness=.86;return tag(m,role,zone,variant);}
  const repeat=s.boardWidth*9/12,rotation=s.direction*Math.PI/180;
  m.map=scanned('wood_floor_diff',repeat,rotation);m.normalMap=scanned('wood_floor_nor_gl',repeat,rotation);m.roughnessMap=scanned('wood_floor_rough',repeat,rotation);m.normalScale.set(.35,.35);
  const color=state.finishes.floor;m.color.setRGB(...(color==='#d4bd95'?[1.8,1.8,1.65]:color==='#907354'?[.65,.64,.62]:[1.3,1.26,1.16]));m.roughness=s.floorSheen==='satin'?.55:.88;
 }else if(role==='cabinet'||role==='furniture'){
  const color=state.finishes.cabinet,paint=variant==='paint'||variant==='white'||(!variant&&['#e9e7e0','#263335'].includes(color)),walnut=variant==='walnut'||(!variant&&color==='#64422d');
  m.color.set(paint?(color==='#263335'?color:'#e9e7e0'):walnut?'#826248':'#ffffff');
  if(!paint){m.map=scanned('oak_veneer_01_diff',1.8/.3048);m.normalMap=scanned('oak_veneer_01_nor_gl',1.8/.3048);m.roughnessMap=scanned('oak_veneer_01_rough',1.8/.3048);m.normalScale.set(.2,.2);}
  m.roughness=role==='furniture'?.7:s.cabinetSheen==='satin'?.48:.8;
 }else if(role==='trim'){
  m.color.set({white:'#ffffff',oak:'#ffffff',smoked:'#988878',walnut:'#72543c'}[s.trim]);m.roughness=.55;
  if(s.trim!=='white'){m.map=scanned('oak_veneer_01_diff',1.8/.3048);m.normalMap=scanned('oak_veneer_01_nor_gl',1.8/.3048);m.normalScale.set(.15,.15);}
 }else if(role==='ceiling'){
  m.color.set('#ffffff');m.normalMap=scanned('beige_wall_001_nor_gl',3/.3048);m.normalScale.set(.08,.08);m.roughness=.95;
 }else if(role==='wall'){
  m.color.set(state.finishes.wall);m.normalMap=scanned('beige_wall_001_nor_gl',3/.3048);m.normalScale.set(.12,.12);m.roughness={matte:.95,eggshell:.72,satin:.48}[s.paintSheen];
 }else if(role==='counter'){
  Object.assign(m,tileMaps({color:state.finishes.counter,grout:state.finishes.counter,width:24,height:24,joint:.125,pattern:'stack'},true));m.bumpScale=.002;m.roughness=(variant??s.counterSheen)==='polished'?.18:.5;m.clearcoat=(variant??s.counterSheen)==='polished'?.25:.04;
 }else if(role==='tile'){
  const t=s.tiles[zone]??s.tiles.primary;Object.assign(m,tileMaps(t));m.bumpScale=.012;m.roughness=t.sheen==='satin'?.32:.7;
 }
 return tag(m,role,zone,variant);
}
// Local feet, projected by face normal. Never stretch grain to fit a cabinet door.
export function setSurfaceUV(mesh){
 const g=mesh.geometry;if(!g?.attributes.position||g.userData.physicalUV)return;
 const p=g.attributes.position,n=g.attributes.normal,uv=new Float32Array(p.count*2);
 const pos=new THREE.Vector3(),normal=new THREE.Vector3(),normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
 if(mesh.material.userData.surfaceRole==='trim'){
  g.computeBoundingBox();const size=g.boundingBox.getSize(new THREE.Vector3()),axis=size.y>=size.x&&size.y>=size.z?'Y':size.x>=size.z?'X':'Z';
  for(let i=0;i<p.count;i++){uv[i*2]=axis==='Y'?(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i)):p.getY(i);uv[i*2+1]=p['get'+axis](i);}
  g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.userData.physicalUV=true;return;
 }
 for(let i=0;i<p.count;i++){pos.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);normal.fromBufferAttribute(n,i).applyMatrix3(normalMatrix);const x=Math.abs(normal.x),y=Math.abs(normal.y),z=Math.abs(normal.z);uv[i*2]=y>x&&y>z?pos.x:x>z?pos.z:pos.x;uv[i*2+1]=y>x&&y>z?pos.z:pos.y;}
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.userData.physicalUV=true;
}
export function applySurfaceMaterials(root,state){
 root.updateWorldMatrix(true,true);const replacements=new Map(),old=new Set();root.traverse(o=>{if(!o.isMesh||Array.isArray(o.material)||!o.material.userData.surfaceRole)return;const d=o.material.userData,key=JSON.stringify([d,o.material.side,Boolean(o.material.clippingPlanes?.length)]);if(!replacements.has(key)){const m=surfaceMaterial(d.surfaceRole,state,d.surfaceZone,d.surfaceVariant);m.clippingPlanes=o.material.clippingPlanes;m.side=o.material.side;replacements.set(key,m);}old.add(o.material);o.material=replacements.get(key);setSurfaceUV(o);});old.forEach(m=>m.dispose());
 // Evict unused generated swatches when the entire scene is being refreshed.
 if(root.isScene){const used=new Set();root.traverse(o=>{if(o.material){used.add(o.material.map);used.add(o.material.bumpMap);}});for(const [key,value] of textureMaps){if(value.map&&!used.has(value.map)){value.map.dispose();value.bumpMap.dispose();textureMaps.delete(key);}}}
}
