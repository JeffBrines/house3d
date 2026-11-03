import * as THREE from 'three';

// Visual finish only. Board exposure is an assumed 5.5 inches, not a takeoff.
const BOARD_EXPOSURE=5.5/12, BOARDS=8, REPEAT_LENGTH=12;
let maps;

function woodMaps(){
 if(maps)return maps;
 const width=1024,height=2048,boardPixels=width/BOARDS;
 const color=new Uint8Array(width*height*4),relief=new Uint8Array(width*height*4);
 let seed=271;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const boards=Array.from({length:BOARDS},()=>({tone:(random()-.5)*13,phase:random()*Math.PI*2,joint:.12+random()*.76}));
 const clamp=value=>Math.max(0,Math.min(255,Math.round(value)));
 for(let y=0;y<height;y++){
  const v=y/height,cycle=v*Math.PI*2;
  for(let x=0;x<width;x++){
   const board=Math.floor(x/boardPixels),s=(x%boardPixels)/boardPixels,b=boards[board];
   // Periodic grain and relief join cleanly along each twelve-foot texture repeat.
   const warp=s+.025*Math.sin(cycle+b.phase)+.012*Math.sin(cycle*3+b.phase*2);
   const fine=Math.sin(warp*265+b.phase+Math.sin(cycle*2)*1.5);
   const broad=Math.sin(warp*31+b.phase+Math.sin(cycle)*.9);
   const pore=Math.pow(Math.max(0,Math.sin(warp*490+b.phase)),14);
   const noise=(random()-.5)*2.2;
   const edge=Math.min(s,1-s),groove=Math.max(0,1-edge/.018);
   const joint=Math.max(0,1-Math.abs(v-b.joint)/.00125);
   const seam=Math.max(groove,joint*.75);
   const tone=b.tone+fine*2.4+broad*3.8-pore*3+noise-seam*29;
   const index=(y*width+x)*4;
   color[index]=clamp(109+tone);color[index+1]=clamp(76+tone*.77);color[index+2]=clamp(52+tone*.57);color[index+3]=255;
   const bump=clamp(172+fine*5+broad*2-pore*8-seam*120);
   relief[index]=relief[index+1]=relief[index+2]=bump;relief[index+3]=255;
  }
 }
 const texture=(pixels,srgb=false)=>{
  const map=new THREE.DataTexture(pixels,width,height,THREE.RGBAFormat);
  map.wrapS=map.wrapT=THREE.RepeatWrapping;
  map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;
  map.generateMipmaps=true;if(srgb)map.colorSpace=THREE.SRGBColorSpace;
  map.needsUpdate=true;return map;
 };
 maps={color:texture(color,true),relief:texture(relief)};
 return maps;
}

export function tongueAndGrooveMaterial(anisotropy=1){
 const textures=woodMaps();
 for(const map of Object.values(textures))map.anisotropy=anisotropy;
 const material=new THREE.MeshPhysicalMaterial({
  color:0xffffff,map:textures.color,bumpMap:textures.relief,bumpScale:.012,
  roughness:.66,clearcoat:.08,clearcoatRoughness:.6,side:THREE.DoubleSide
 });
 material.name='Dark brown tongue-and-groove ceiling';
 return material;
}

export function setCeilingBoardUV(geometry,kind){
 const position=geometry.attributes.position,uv=geometry.attributes.uv;
 const slope=kind==='great'?2/3:1/3,across=Math.hypot(1,slope);
 const originX=kind==='great'?43:58.5,originZ=kind==='great'?.5:4.5;
 for(let i=0;i<position.count;i++){
  uv.setXY(i,(position.getX(i)-originX)*across/(BOARD_EXPOSURE*BOARDS),(position.getZ(i)-originZ)/REPEAT_LENGTH);
 }
 uv.needsUpdate=true;
}
