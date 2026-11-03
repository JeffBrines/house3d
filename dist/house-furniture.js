import {buildDiningSet} from './dining-furniture.js?v=2';
import * as THREE from 'three';
import {RoundedBoxGeometry} from './assets/RoundedBoxGeometry.js';
import {buildDiscoveryStove} from './discovery-stove.js?v=2';
let weave,screenArt;
function fabricMap(){
 if(weave)return weave;
 const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#ded8cd';ctx.fillRect(0,0,128,128);
 for(let i=0;i<128;i+=2){ctx.fillStyle=i%4?'#d4cdbf':'#eee8de';ctx.fillRect(i,0,1,128);ctx.fillStyle='#b8ad9a22';ctx.fillRect(0,i,128,1);}
 weave=new THREE.CanvasTexture(c);weave.wrapS=weave.wrapT=THREE.RepeatWrapping;weave.repeat.set(8,8);weave.colorSpace=THREE.SRGBColorSpace;return weave;
}
function televisionArt(){
 if(screenArt)return screenArt;
 const c=document.createElement('canvas');c.width=768;c.height=432;const ctx=c.getContext('2d');ctx.fillStyle='#c5bfae';ctx.fillRect(0,0,768,432);
 for(const [y,col,peaks] of [[190,'#8e9a92',[0,40,130,20,200,75,280,-30,390,50,520,-20,640,60,768,20]],[270,'#596d68',[0,0,90,20,180,-50,310,35,480,-25,600,30,768,-50]],[355,'#304944',[0,-5,200,-35,400,30,600,-20,768,10]]]){ctx.beginPath();ctx.moveTo(0,432);for(let i=0;i<peaks.length;i+=2)ctx.lineTo(peaks[i],y+peaks[i+1]);ctx.lineTo(768,432);ctx.closePath();ctx.fillStyle=col;ctx.fill();}
 screenArt=new THREE.CanvasTexture(c);screenArt.colorSpace=THREE.SRGBColorSpace;return screenArt;
}
export function buildHouseObject(g,o,{box,cyl,material,cabinet,metal,addBasin,ceilingHeight}){
 const {w,d,h}=o;const supported=['coffeeTable','diningTable','rug','mediaConsole','television','armchair','sideTable','floorLamp','plant','stove','utilitySink','desk','mudBench','pantryShelves'];
 if(!(o.type==='sofa'&&o.houseStyle)&&!supported.includes(o.type))return false;
 const oak=cabinet.clone();oak.userData.surfaceRole='furniture';oak.userData.surfaceVariant='oak';
 const dark=material('#232b29',{roughness:.57}),cloth=material('#eee8dc',{map:fabricMap(),bumpMap:fabricMap(),bumpScale:.003,roughness:1,sheen:.45,sheenRoughness:.9}),leather=material('#a77b51',{roughness:.62});
 const B=(w,h,d,x,y,z,m=oak)=>{if((m===cloth||m===leather)&&Math.min(w,h,d)>.2){const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,4,Math.min(.14,Math.min(w,h,d)*.3)),m);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);return mesh;}return box(w,h,d,x,y,z,m,g);},C=(r1,r2,h,x,y,z,m=oak)=>cyl(r1,r2,h,x,y,z,m,g);
 const legs=(w,d,h,m=oak)=>{for(const x of [-w*.39,w*.39])for(const z of [-d*.36,d*.36])B(.11,h,.11,x,h/2,z,m);};
 if(o.type==='sofa'||o.type==='armchair'){
  const isSofa=o.type==='sofa',n=isSofa?3:1,fabric=isSofa?cloth:leather;
  B(w-.3,.35,d-.2,0,.52,0,dark);legs(w,d,.45,dark);
  B(w-.1,.55,d,0,.9,0,fabric);B(w-.2,h-1,.37,0,(h+1)/2,d/2-.23,fabric);
  for(const x of [-1,1])B(.32,h-.75,d-.05,x*(w/2-.16),.75+(h-.75)/2,0,fabric);
  for(let i=0;i<n;i++){const cw=(w-.75)/n,x=(i-(n-1)/2)*cw;B(cw-.055,.38,d-.65,x,1.34,-.16,fabric);const back=B(cw-.07,h-1.5,.34,x,1.55+(h-1.5)/2,d/2-.5,fabric);back.rotation.x=-.12;}
  if(isSofa){for(const [x,color,a] of [[-w*.34,'#687264',-.13],[w*.34,'#a7795f',.16]]){const pillow=B(1.25,1.15,.28,x,1.95,.75,material(color,{map:fabricMap(),roughness:1}));pillow.rotation.z=a;pillow.rotation.x=-.15;}}
 }else if(o.type==='rug'){
  const mat=material('#c8bca6',{map:fabricMap(),roughness:1});B(w,h,d,0,h/2+.025,0,mat);
  const border=material('#817b6a',{roughness:1});for(const sign of [-1,1]){B(w-.25,.008,.045,0,h+.03,sign*(d/2-.2),border);B(.045,.008,d-.35,sign*(w/2-.2),h+.03,0,border);}
 }else if(o.type==='diningTable'){
  buildDiningSet(g,o);
 }else if(o.type==='coffeeTable'){
  B(w,.16,d,0,h-.08,0);for(const x of [-w*.32,w*.32])C(.25,.32,h-.16,x,(h-.16)/2,0);
  B(1,.09,.75,-.65,h+.045,0,material('#53675e'));B(.85,.07,.65,-.6,h+.125,.03,material('#dad2bd'));C(.34,.25,.18,.8,h+.09,0,material('#51493b'));
 }else if(o.type==='mediaConsole'){
  B(w-.25,.15,d-.15,0,.15,0,dark);B(w,h-.3,d,0,(h+.3)/2,0);
  for(let i=0;i<4;i++)B(w/4-.05,h-.42,.04,(i-1.5)*w/4,(h+.3)/2,-d/2-.025,oak);
  C(.24,.18,.44,w*.33,h+.22,0,material('#c9bba2'));B(.9,.06,.6,-w*.35,h+.03,0,material('#9f9b8b'));
 }else if(o.type==='television'){
  B(w,h,d,0,h/2,0,dark);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w-.09,h-.09),new THREE.MeshBasicMaterial({map:televisionArt(),toneMapped:true}));mesh.position.set(0,h/2,-d/2-.008);mesh.rotation.y=Math.PI;g.add(mesh);
 }else if(o.type==='sideTable'){
  C(w/2,w/2,.13,0,h-.065,0);C(.16,.23,h-.13,0,(h-.13)/2,0,dark);C(w*.34,w*.34,.08,0,.04,0,dark);
 }else if(o.type==='floorLamp'){
  C(.55,.55,.07,0,.035,0,dark);C(.035,.035,h-.6,0,(h-.6)/2,0,dark);C(.48,.65,.85,0,h-.425,0,cloth);C(.45,.45,.025,0,h-.86,0,material('#f4ddb3',{emissive:'#d4a85c',emissiveIntensity:.25}));
 }else if(o.type==='plant'){
  C(.55,.4,1.15,0,.575,0,material('#b6aa96'));C(.025,.04,h-1,0,1+(h-1)/2,0,oak);
  const leaf=material('#4b624b',{roughness:1});for(let i=0;i<14;i++){const a=i*2.4,y=1.6+i*.18,r=.35+(i%3)*.1,m=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),leaf);m.scale.set(.55,1.4,1);m.position.set(Math.cos(a)*r,y,Math.sin(a)*r);m.rotation.z=Math.cos(a)*.7;g.add(m);}
 }else if(o.type==='stove'){
  if(o.stoveModel==='quadra-fire-discovery-ii')return buildDiscoveryStove(g,o,{material,ceilingHeight});
  B(3.2,.08,3.2,0,.04,0,material('#646964',{roughness:.95}));legs(w,d,.45,dark);B(w,h-.45,d,0,(h+.45)/2,0,dark);B(w*.72,h*.59,.055,0,h*.53,-d/2-.035,material('#141b1c',{roughness:.17,clearcoat:.6}));B(.05,.55,.12,w*.42,h*.53,-d/2-.1,metal);C(.28,.28,o.flueHeight-h,0,h+(o.flueHeight-h)/2,0,dark);
 }else if(o.type==='utilitySink'){
  B(w-.08,h-.15,d-.1,0,(h-.15)/2,0,oak);B(w,.13,d,0,h-.065,0,material('#ecebe5'));addBasin(g,0,h+.03,0,w*.72,d*.74);
 }else if(o.type==='desk'){
  B(w,.14,d,0,h-.07,0);legs(w,d,h-.14,dark);B(1.45,.09,1.1,0,h+.05,-.2,dark);B(1.45,1,.05,0,h+.58,.32,dark);B(.7,.045,.5,w*.3,h+.025,0,cloth);
 }else if(o.type==='mudBench'){
  B(w,3.5,.08,0,3.65,d/2-.06,oak);B(w,.18,d,0,1.55,0);for(const x of [-w*.46,0,w*.46])B(.12,1.5,d,x,.75,0);B(w,.12,d,0,.13,0);for(let i=0;i<5;i++){const x=(i-2)*w/5;B(.04,.18,.15,x,4.5,d/2-.16,dark);}
 }else if(o.type==='pantryShelves'){
  for(let i=0;i<5;i++){const y=.5+i*(h-.7)/4;B(w,.09,d,0,y,0);for(let j=0;j<3;j++)B(.65,.45,d*.65,(j-1)*w*.28,y+.27,0,material(j%2?'#c6bda7':'#a5977d'));}for(const x of [-w/2+.05,w/2-.05])B(.08,h,d,x,h/2,0);
 }
 return true;
}
