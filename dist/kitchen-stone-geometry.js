import * as THREE from 'three';
import {KITCHEN_DATUM as D,kitchenLayout} from './kitchen-engine.js';
import {stoneSettings} from './kitchen-settings.js?v=details-5';
import {stoneLayout} from './kitchen-stone.js';

// Axis-aligned polygon inset, preserving each corner and the nominal maximum
// footprint. Small edge rounds never expand beyond the dimensioned boundary.
function inset(loop,amount){return loop.map((p,i)=>{const a=loop[(i+loop.length-1)%loop.length],b=loop[(i+1)%loop.length],n1=new THREE.Vector2(-(p[1]-a[1]),p[0]-a[0]).normalize(),n2=new THREE.Vector2(-(b[1]-p[1]),b[0]-p[0]).normalize();return [p[0]+amount*(n1.x+n2.x),p[1]+amount*(n1.y+n2.y)];});}
function slabGeometry(zone,thickness,edge){
 const loop=zone.loops[0],minSegment=Math.min(...loop.map((p,i)=>Math.hypot(p[0]-loop[(i+1)%loop.length][0],p[1]-loop[(i+1)%loop.length][1]))),radius=Math.min(edge==='half-bullnose'?thickness/2:edge==='bevel'?.125:edge==='square'?0:.0625,minSegment/5),rings=[];
 if(edge==='bevel')rings.push([0,radius],[radius,0]);else if(radius>0)for(let i=0;i<=6;i++){const a=i*Math.PI/12;rings.push([radius*(1-Math.cos(a)),radius*(1-Math.sin(a))]);}else rings.push([0,0]);rings.push([thickness,0]);
 const positions=[],uvs=[],indices=[],verts=[];const add=(p,depth)=>{positions.push(p[0]/12,-depth/12,p[1]/12);uvs.push(p[0]/48,p[1]/48);verts.push(p);};
 rings.forEach(([depth,amount])=>inset(loop,amount).forEach(p=>add(p,depth)));const n=loop.length;
 for(let r=0;r<rings.length-1;r++)for(let i=0;i<n;i++){const a=r*n+i,b=r*n+(i+1)%n,c=(r+1)*n+i,d=(r+1)*n+(i+1)%n;indices.push(a,b,c,b,d,c);}
 const holes=zone.holes.map(h=>[[h.x1,h.z1],[h.x2,h.z1],[h.x2,h.z2],[h.x1,h.z2]]);
 const face=(depth,amount,bottom)=>{const outer=inset(loop,amount),start=verts.length,points=[...outer,...holes.flat()];points.forEach(p=>add(p,depth));const faces=THREE.ShapeUtils.triangulateShape(outer.map(p=>new THREE.Vector2(...p)),holes.map(h=>h.map(p=>new THREE.Vector2(...p))));for(const f of faces)indices.push(...(bottom?f:[...f].reverse()).map(i=>start+i));};
 face(0,rings[0][1],false);face(thickness,0,true);
 for(const hole of holes){const start=verts.length;hole.forEach(p=>add(p,0));hole.forEach(p=>add(p,thickness));for(let i=0;i<4;i++){const a=start+i,b=start+(i+1)%4,c=start+4+i,d=start+4+(i+1)%4;indices.push(a,c,b,b,c,d);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function buildStone(parent,k,palette){
 const l=kitchenLayout(k),s=stoneSettings(k),st=stoneLayout(k),stone=palette.counter.clone();stone.side=THREE.DoubleSide;if(stone.map){stone.map=stone.map.clone();stone.map.center.set(.5,.5);stone.map.rotation=s.vein==='width'?Math.PI/2:0;}stone.roughness=s.finish==='polished'?.16:.42;stone.userData.surfaceVariant=s.finish;
 const group=new THREE.Group();group.position.set(D.west,0,D.north);parent.add(group);
 const add=(geometry,material,id,x=0,y=l.top/12,z=0)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;m.userData.entityId=id;group.add(m);return m;};
 const box=(w,h,d,x,y,z,mat,id)=>{if(Math.min(w,h,d)>0)add(new THREE.BoxGeometry(w/12,h/12,d/12),mat,id,x/12,y/12,z/12);};
 for(const zone of st.zones){
  const id=zone.island?'k-island-top':'k-stone-'+zone.id;add(slabGeometry(zone,st.slabThickness,s.edge==='miter'?'eased':s.edge),stone,id);
  if(st.buildUp>.001){const support={...zone,loops:zone.loops.map(loop=>inset(loop,1))};add(slabGeometry(support,st.buildUp,'square'),palette.box,id,0,(l.top-st.slabThickness)/12,0);}
  if(s.edge==='miter'&&s.edgeDrop>st.slabThickness)for(const e of zone.edges.filter(e=>e.kind==='exposed')){const horizontal=e.a[1]===e.b[1],t=st.slabThickness;box(horizontal?e.length:t,s.edgeDrop,t+(horizontal?0:e.length-t),(e.a[0]+e.b[0])/2-e.normal[0]*t/2,l.top-s.edgeDrop/2,(e.a[1]+e.b[1])/2-e.normal[1]*t/2,stone,id);}
 }
 let tileTexture;if(s.splashMaterial!=='match'){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=384;const ctx=canvas.getContext('2d');ctx.fillStyle='#bdb7a9';ctx.fillRect(0,0,512,384);
  for(let row=0;row<4;row++)for(let col=-1;col<3;col++){const offset=s.splashMaterial==='tile-offset'&&row%2?128:0;ctx.fillStyle=['#f0ecdf','#e9e5d7','#f4f0e7'][(row+col+6)%3];ctx.fillRect(col*256+offset+2,row*96+2,252,92);}
  tileTexture=new THREE.CanvasTexture(canvas);tileTexture.colorSpace=THREE.SRGBColorSpace;tileTexture.wrapS=tileTexture.wrapT=THREE.RepeatWrapping;
 }
 for(const b of st.splashes){let mat=stone;if(tileTexture){const map=tileTexture.clone();map.repeat.set(b.width/16,b.height/12);mat=new THREE.MeshStandardMaterial({map,roughness:.3,color:'#ffffff'});}const id='k-splash-'+b.id;
  if(b.run==='west')box(b.thickness,b.height,b.width,b.thickness/2,(b.top+b.bottom)/2,(b.start+b.end)/2,mat,id);
  else box(b.width,b.height,b.thickness,(b.start+b.end)/2,(b.top+b.bottom)/2,(D.south-D.north)*12-b.thickness/2,mat,id);
 }
 for(const w of st.waterfalls)box(w.width,w.height,w.thickness,w.x,w.height/2,w.z,stone,'k-waterfall-'+w.end);
 return st;
}
