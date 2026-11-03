import * as THREE from 'three';
import {DISCOVERY_II} from './stove-config.js';

let woodEndTexture;
function endGrain(){
 if(woodEndTexture)return woodEndTexture;
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#c39e6d';ctx.fillRect(0,0,128,128);
 for(let r=6;r<95;r+=5){ctx.beginPath();ctx.ellipse(57,69,r,r*.9,.15,0,Math.PI*2);ctx.lineWidth=r%3?1:1.8;ctx.strokeStyle=r%3?'#a67d4b99':'#d7b57f';ctx.stroke();}
 for(const [a,r] of [[.5,55],[2.1,40],[4.7,31]]){ctx.beginPath();ctx.moveTo(57+Math.cos(a)*r,69+Math.sin(a)*r);ctx.lineTo(57+Math.cos(a)*92,69+Math.sin(a)*92);ctx.strokeStyle='#796040';ctx.lineWidth=1.6;ctx.stroke();}
 woodEndTexture=new THREE.CanvasTexture(c);woodEndTexture.colorSpace=THREE.SRGBColorSpace;return woodEndTexture;
}
function arch(w,h,rise){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-rise);s.quadraticCurveTo(0,h+rise,-w/2,h-rise);s.closePath();return s;}
export function buildDiscoveryStove(parent,o,{material,ceilingHeight}){
 const body=new THREE.Group();body.name=DISCOVERY_II.name;body.userData.product=DISCOVERY_II.id;
 const sx=o.w/(DISCOVERY_II.width/12),sy=o.h/(DISCOVERY_II.bodyHeight/12),sz=o.d/(DISCOVERY_II.depth/12);
 body.scale.set(sx/12,sy/12,sz/12);body.position.y=.08;parent.add(body);
 const iron=material('#242728',{metalness:.25,roughness:.72}),edge=material('#343839',{metalness:.3,roughness:.58}),panel=material(/^#[0-9a-f]{6}$/i.test(o.stoveSideFinish)?o.stoveSideFinish:'#292b2b',{metalness:.2,roughness:.75}),glass=material('#10191c',{roughness:.12,metalness:.24,clearcoat:.8,clearcoatRoughness:.12});
 function mesh(geometry,mat,x,y,z,part,group=body){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;m.userData.stovePart=part;group.add(m);return m;}
 const box=(w,h,d,x,y,z,mat=iron,part='body')=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,part);
 // Full-height side cases and back leave the front wood bin open.
 box(25.5,1,24.375,0,.7,0,iron,'base');
 for(const x of [-11.5,11.5])box(1.25,36,21.5,x,19,.7);
 box(22,36,.6,0,19,11.3,iron,'back');
 box(22.5,20.85,21.5,0,27.825,.7,iron,'firebox');
 box(25.5,.45,24.375,0,38.275,0,edge,'top');
 box(22,.7,21,0,16.7,.4,iron,'wood-bin-ceiling');
 box(20.5,.35,20,0,1.5,.4,edge,'wood-bin-floor');
 for(const x of [-10.6,10.6])box(1.25,15.2,.65,x,8.9,-10.2,edge,'wood-bin-frame');
 for(const x of [-12.2,12.2]){box(.18,35.25,11.75,x,19.2,.8,panel,'side-panel');for(const z of [-5.3,6.9])box(.28,35.6,.35,x,19.2,z,edge,'panel-frame');}
 // Raised cast door frame, arched ceramic glazing, ash lip and right-hand handle.
 const outer=arch(19.2,17,2.4),inner=arch(15.125,13.25,1.9);outer.holes.push(new THREE.Path(inner.getPoints(32).map(p=>p.add(new THREE.Vector2(0,1.55)))));
 mesh(new THREE.ExtrudeGeometry(outer,{depth:.7,bevelEnabled:true,bevelThickness:.13,bevelSize:.18,bevelSegments:2,steps:1}),edge,0,19.3,-11.8,'door-frame');
 mesh(new THREE.ShapeGeometry(arch(15.125,13.25,1.9)),glass,0,20.85,-11.86,'glass').rotation.y=Math.PI;
 box(22.1,.35,2.4,0,18.3,-11.2,edge,'ash-lip');
 for(const y of [22.3,32.2])mesh(new THREE.CylinderGeometry(.35,.35,1.7,12),edge,10,y,-11.6,'hinge');
 const handle=box(.42,4,.48,-10.1,26.7,-12.8,iron,'handle');handle.rotation.z=.35;
 box(1.3,.3,1.1,-9.8,28.5,-12.35,edge,'handle-pivot');
 // A few split-looking logs make the integral storage cavity legible from the room.
 const bark=material('#544235',{roughness:1}),end=material('#ffffff',{map:endGrain(),roughness:1});
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){
  const r=2.3+(row+col)%2*.25,x=(col-1)*5.5+(row%2?.5:0),y=4+row*4.3,z=.8+(col%2)*.4;
  const log=mesh(new THREE.CylinderGeometry(r*.92,r,16,5+(row+col)%3,1),[bark,end,end],x,y,z,'stored-wood');log.rotation.x=Math.PI/2;log.rotation.y=(col-1)*.04;log.rotateY((row+col)*1.1);
 }
 // Nominal six-inch top flue; its rear offset follows the dimension drawing.
 const flueZ=(24.375/2-6.75)/12*sz,a=o.rotation*Math.PI/180,worldX=o.x+Math.sin(a)*flueZ,worldZ=o.z+Math.cos(a)*flueZ;
 const roof=ceilingHeight?ceilingHeight(worldX,worldZ)-(o.y||0):o.flueHeight||12.5,top=.08+o.h,flueTop=Math.max(top+.5,roof+.07);
 mesh(new THREE.CylinderGeometry(.275,.275,1.875/12*sy,32),iron,0,top+.078125*sy,flueZ,'flue-collar',parent);
 mesh(new THREE.CylinderGeometry(.25,.25,flueTop-top,32),iron,0,(top+flueTop)/2,flueZ,'flue',parent);
 mesh(new THREE.CylinderGeometry(.4,.4,.09,32),iron,0,flueTop-.1,flueZ,'ceiling-trim',parent);
 // Provisional hearth surface for the material study; not an installation layout.
 const hearth=mesh(new THREE.BoxGeometry(39/12,.08,47/12),material('#5c605e',{roughness:.94}),0,.04,-.5,'hearth',parent);hearth.userData.provisional=true;
 return true;
}
