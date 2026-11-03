import * as THREE from 'three';
export const ISLAND_STYLES=[['opal','Opal globes + brass'],['glass','Clear glass globes'],['dome','Black metal domes']];
export const DINING_STYLES=[['ring','Brass ring chandelier'],['branch','Branching opal chandelier'],['drum','Linen drum pendant'],['dome','Wide black dome'],['none','No dining pendant']];
export function buildPendant(g,l,ceiling){
 const style=l.style||'dome';if(style==='none'||(style==='linear'&&l.styleIndex!==1))return;
 const brass=new THREE.MeshPhysicalMaterial({color:'#af8748',metalness:.82,roughness:.3}),black=new THREE.MeshStandardMaterial({color:'#202c30',roughness:.48}),white=new THREE.MeshStandardMaterial({color:'#f7ecd8',emissive:'#ffdfaa',emissiveIntensity:l.on?1.1:0,roughness:.35});
 const length=Math.max(.15,ceiling-g.position.y),isDining=l.zone==='dining';
 const cylinder=(r1,r2,h,x,y,z,mat=brass)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,24),mat);m.position.set(x,y,z);g.add(m);return m;};
 const sphere=(r,x,y,z,mat=white)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),mat);m.position.set(x,y,z);g.add(m);return m;};
 const rod=(a,b,r=.025,mat=brass)=>{const delta=new THREE.Vector3().subVectors(b,a),m=cylinder(r,r,delta.length(),...(new THREE.Vector3().addVectors(a,b).multiplyScalar(.5).toArray()),mat);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;};
 cylinder(.018,.018,length,0,length/2,0,style==='dome'?black:brass);cylinder(.19,.19,.045,0,length,0);
 if(style==='opal'||style==='glass'){
  if(style==='glass'){const glass=new THREE.MeshPhysicalMaterial({color:'#e9f2f3',transparent:true,opacity:.16,roughness:.08,metalness:.1,depthWrite:false});sphere(.55,0,-.1,0,glass);sphere(.14,0,-.1,0,white);}else sphere(.5,0,-.1,0);
  cylinder(.11,.11,.16,0,.43,0);
 }else if(style==='dome'){
  const radius=isDining?1.45:.65,height=isDining?.7:.45;const points=[[.07,height],[.18,height*.95],[radius*.6,height*.7],[radius,.04],[radius,0],[radius-.04,.02],[radius*.57,height*.65],[.07,height-.04]].map(([r,y])=>new THREE.Vector2(r,y));const shell=new THREE.Mesh(new THREE.LatheGeometry(points,36),black);g.add(shell);cylinder(radius*.8,radius*.8,.025,0,.025,0,white);
 }else if(style==='linear'){
  const bar=new THREE.Mesh(new THREE.BoxGeometry(.14,.14,6.3),brass);g.add(bar);const diffuser=new THREE.Mesh(new THREE.BoxGeometry(.1,.022,6),white);diffuser.position.y=-.09;g.add(diffuser);for(const z of [-2.5,2.5])rod(new THREE.Vector3(0,.05,z),new THREE.Vector3(0,length,z),.012,black);
 }else if(style==='ring'){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.7,.045,10,64),brass);ring.rotation.x=Math.PI/2;g.add(ring);for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a)*1.7,z=Math.sin(a)*1.7;sphere(.23,x,-.16,z);if(i%2===0)rod(new THREE.Vector3(x,0,z),new THREE.Vector3(0,1,0),.016);}
 }else if(style==='branch'){
  for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a)*(i%2?1.9:1.4),z=Math.sin(a)*(i%2?1.9:1.4),y=i%2?.25:-.3;rod(new THREE.Vector3(0,.1,0),new THREE.Vector3(x,y,z));sphere(.3,x,y,z);}
 }else if(style==='drum'){
  const cloth=new THREE.MeshStandardMaterial({color:'#d5c5a6',roughness:1,side:THREE.DoubleSide});const shade=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.3,.85,48,1,true),cloth);g.add(shade);cylinder(1.25,1.25,.02,0,-.43,0,white);
 }
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
}
