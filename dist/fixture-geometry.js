import * as THREE from 'three';

export function fixtureMetal(finish,part){
 const m=new THREE.MeshPhysicalMaterial({color:{steel:'#c8cbcc',brass:'#c2a36d',dark:'#292c2d'}[finish]||'#c8cbcc',metalness:finish==='dark'?.45:1,roughness:finish==='dark'?.36:finish==='brass'?.3:.25});
 m.userData.fixturePart=part;return m;
}
function mesh(parent,geometry,mat,pos){const m=new THREE.Mesh(geometry,mat);if(pos)m.position.set(...pos);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
function rod(parent,a,b,r,mat){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),delta=vb.clone().sub(va);const m=mesh(parent,new THREE.CylinderGeometry(r,r,delta.length(),20),mat,va.add(vb).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}
export function buildPull(g,{x,y,z,length,style='bar',vertical=false},mat){
 const p=new THREE.Group();p.position.set(x,y,z);if(vertical)p.rotation.z=Math.PI/2;g.add(p);
 if(style==='knob'){rod(p,[0,0,0],[0,0,-.07],.027,mat);const cap=mesh(p,new THREE.SphereGeometry(.055,24,12),mat,[0,0,-.08]);cap.scale.z=.5;return;}
 for(const sign of[-1,1])rod(p,[sign*length/2,0,0],[sign*length/2,0,-.09],.025,mat);
 rod(p,[-length/2-.045,0,-.09],[length/2+.045,0,-.09],.025,mat);
}
export function buildFaucet(g,{x=0,y=0,z=0,style='arc'},mat){
 const p=new THREE.Group();p.position.set(x,y,z);g.add(p);
 mesh(p,new THREE.CylinderGeometry(.08,.09,.035,32),mat,[0,.0175,0]);rod(p,[0,.03,0],[0,.62,0],.052,mat);
 const points=style==='square'?[[0,.55,0],[0,1.16,0],[0,1.22,-.06],[0,1.22,-.58],[0,1.16,-.64],[0,.91,-.64]]:[[0,.55,0],[0,.95,-.01],[0,1.24,-.18],[0,1.27,-.42],[0,1.08,-.64],[0,.91,-.64]];
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');mesh(p,new THREE.TubeGeometry(curve,48,.037,16,false),mat);
 rod(p,[0,.9,-.64],[0,.77,-.64],.047,mat);
 const dark=new THREE.MeshStandardMaterial({color:'#25282a',roughness:.55});dark.userData.fixturePart='faucet';mesh(p,new THREE.CylinderGeometry(.038,.038,.006,24),dark,[0,.767,-.64]);
 rod(p,[0,.24,0],[.13,.24,0],.055,mat);rod(p,[.13,.24,0],[.13,.53,-.045],.018,mat);
 return p;
}
export function buildSinkBowl(g,{x=0,y=0,z=0,width,depth,bowlDepth},mat){
 // Sloped walls, rounded lower corners and a real drain opening; no filled top.
 const rings=[{w:width,d:depth,y:0,r:.025},{w:width-.08,d:depth-.08,y:-bowlDepth+.06,r:.12},{w:width-.2,d:depth-.2,y:-bowlDepth,r:.14}],verts=[],uv=[],indices=[],n=40;
 const loop=({w,d,r})=>{r=Math.min(r,w/4,d/4);const out=[];for(let c=0;c<4;c++)for(let j=0;j<10;j++){const a=c*Math.PI/2+j/9*Math.PI/2;out.push([(c===0||c===3?1:-1)*(w/2-r)+Math.cos(a)*r,(c<2?1:-1)*(d/2-r)+Math.sin(a)*r]);}return out;};
 for(const r of rings)for(const [px,pz] of loop(r)){verts.push(x+px,y+r.y,z+pz);uv.push(px,pz);}
 for(let r=0;r<rings.length-1;r++)for(let i=0;i<n;i++){const a=r*n+i,b=r*n+(i+1)%n,c=a+n,d=b+n;indices.push(a,c,b,b,c,d);}
 const floor=loop(rings[2]),drainZ=depth*.15,drainR=.13,start=verts.length/3;
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2;verts.push(x+Math.cos(a)*drainR,y-bowlDepth-.015,z+drainZ+Math.sin(a)*drainR);uv.push(0,0);}
 for(let i=0;i<n;i++){const a=2*n+i,b=2*n+(i+1)%n,c=start+i,d=start+(i+1)%n;indices.push(a,b,c,b,d,c);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();mat.side=THREE.DoubleSide;mesh(g,geo,mat);
 const drain=fixtureMetal('steel','sink'),ring=mesh(g,new THREE.TorusGeometry(drainR,.012,8,40),drain,[x,y-bowlDepth-.008,z+drainZ]);ring.rotation.x=Math.PI/2;
 const dark=new THREE.MeshStandardMaterial({color:'#25272a',roughness:.7});dark.userData.fixturePart='sink';mesh(g,new THREE.CylinderGeometry(.12,.12,.012,32),dark,[x,y-bowlDepth-.03,z+drainZ]);
 for(const a of[0,Math.PI/3,Math.PI*2/3])rod(g,[x-.105*Math.cos(a),y-bowlDepth-.018,z+drainZ-.105*Math.sin(a)],[x+.105*Math.cos(a),y-bowlDepth-.018,z+drainZ+.105*Math.sin(a)],.006,drain);
}
