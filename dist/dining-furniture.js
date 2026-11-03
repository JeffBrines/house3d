import * as THREE from 'three';
import {RoundedBoxGeometry} from './assets/RoundedBoxGeometry.js';

let stoneTexture,clothTexture;
function textures(){
 if(stoneTexture)return;
 const stone=document.createElement('canvas');stone.width=stone.height=256;const ctx=stone.getContext('2d');
 ctx.fillStyle='#f4f3ef';ctx.fillRect(0,0,256,256);
 // Quiet mineral flecks, without a wood grain or exaggerated marble veins.
 let seed=17;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 for(let i=0;i<7000;i++){ctx.fillStyle=i%6?'rgba(106,103,92,.045)':'rgba(255,255,255,.18)';ctx.fillRect(random()*256,random()*256,.4+random(),.4+random());}
 stoneTexture=new THREE.CanvasTexture(stone);stoneTexture.colorSpace=THREE.SRGBColorSpace;stoneTexture.wrapS=stoneTexture.wrapT=THREE.RepeatWrapping;stoneTexture.repeat.set(.4,.4);
 const cloth=document.createElement('canvas');cloth.width=cloth.height=128;const c=cloth.getContext('2d');c.fillStyle='#eeeeee';c.fillRect(0,0,128,128);
 for(let i=0;i<128;i+=2){c.fillStyle=i%4?'#dedede':'#fafafa';c.fillRect(i,0,1,128);c.fillStyle='#60606015';c.fillRect(0,i,128,1);}
 clothTexture=new THREE.CanvasTexture(cloth);clothTexture.colorSpace=THREE.SRGBColorSpace;clothTexture.wrapS=clothTexture.wrapT=THREE.RepeatWrapping;clothTexture.repeat.set(5,5);
}

export function buildDiningSet(parent,o){
 textures();const {w,d,h}=o;
 const stone=new THREE.MeshPhysicalMaterial({color:'#d8d5cb',map:stoneTexture,roughness:.74,clearcoat:0});stone.userData.furniturePart='Stone-look tabletop';
 const bronze=new THREE.MeshPhysicalMaterial({color:'#393a36',metalness:.55,roughness:.48});bronze.userData.furniturePart='Dark bronze base';
 const fabric=new THREE.MeshPhysicalMaterial({color:'#78826c',map:clothTexture,bumpMap:clothTexture,bumpScale:.002,roughness:.95,sheen:.35,sheenRoughness:.85});fabric.userData.furniturePart='Olive chair upholstery';
 const frame=new THREE.MeshPhysicalMaterial({color:'#30332e',metalness:.45,roughness:.5});frame.userData.furniturePart='Chair frame';
 const add=(g,geometry,material,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;};
 const round=(g,w,h,d,x,y,z,material,r=.07)=>add(g,new RoundedBoxGeometry(w,h,d,4,Math.min(r,w/3,h/3,d/3)),material,x,y,z);
 const rod=(g,a,b,r,material)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start),m=add(g,new THREE.CylinderGeometry(r*.8,r,delta.length(),16),material);m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());};

 // An oval 84 × 42 in study by default; all dimensions follow the editable table.
 const edge=.025,thickness=.12,outline=new THREE.Shape();outline.absellipse(0,0,w/2-edge,d/2-edge,0,Math.PI*2,false);
 const top=new THREE.ExtrudeGeometry(outline,{depth:thickness-2*edge,bevelEnabled:true,bevelThickness:edge,bevelSize:edge,bevelSegments:3,steps:1,curveSegments:64});top.rotateX(-Math.PI/2);
 add(parent,top,stone,0,h-thickness+edge,0);
 for(const sign of[-1,1]){
  const base=add(parent,new THREE.CylinderGeometry(.43,.61,h-thickness-.02,48),bronze,sign*w*.24,(h-thickness)/2+.01,0);base.scale.set(1.22,1,.65);
  const foot=add(parent,new THREE.CylinderGeometry(.62,.64,.045,48),bronze,sign*w*.24,.0225,0);foot.scale.set(1.22,1,.65);
 }
 for(const x of[-w*.31,0,w*.31])for(const sign of[-1,1]){
  const chair=new THREE.Group();chair.position.set(x,0,sign*(d/2+.85));chair.rotation.y=sign===1?0:Math.PI;parent.add(chair);
  round(chair,1.3,.09,1.25,0,1.3,0,frame);
  round(chair,1.55,.2,1.5,0,1.45,0,fabric,.1);
  const back=new THREE.Shape();
  for(let i=0;i<=24;i++){const t=i/12-1,px=t*.73,z=.62-.27*t*t+.055;i?back.lineTo(px,-z):back.moveTo(px,-z);}
  for(let i=24;i>=0;i--){const t=i/12-1;back.lineTo(t*.73,-(.62-.27*t*t-.055));}back.closePath();
  const shell=new THREE.ExtrudeGeometry(back,{depth:1.05,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:3,steps:1});shell.rotateX(-Math.PI/2);add(chair,shell,fabric,0,1.57,0);
  for(const sx of[-1,1])for(const sz of[-1,1])rod(chair,[sx*.63,.045,sz*.59],[sx*.52,1.35,sz*.49],.035,frame);
 }
 const ceramic=new THREE.MeshPhysicalMaterial({color:'#525e50',roughness:.83});ceramic.userData.furniturePart='Ceramic centerpiece';
 const profile=[new THREE.Vector2(0,0),new THREE.Vector2(.22,0),new THREE.Vector2(.44,.06),new THREE.Vector2(.52,.17),new THREE.Vector2(.5,.185),new THREE.Vector2(.42,.09),new THREE.Vector2(.2,.035),new THREE.Vector2(0,.035)];
 add(parent,new THREE.LatheGeometry(profile,48),ceramic,0,h+.006,0);
 return true;
}
