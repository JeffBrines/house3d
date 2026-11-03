import * as THREE from 'three';

const roles={floor:'Wood flooring',tile:'Tile',counter:'Countertop',cabinet:'Cabinetry',wall:'Wall paint',ceiling:'Ceiling',trim:'Trim',door:'Door',sink:'Sink basin',faucet:'Faucet',hardware:'Cabinet handles',furniture:'Furniture'};
const zones={primary:'Primary bath floor',shared:'Shared bath floor',laundry:'Laundry / powder floor',basement:'Basement bath floor',shower:'Primary shower walls',showerFloor:'Primary shower floor'};
const rounded=v=>Math.round(v*10000)/10000;
export function insideArea([x,y],points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [a,b]=points[i],[c,d]=points[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;}return inside;}
export function areaSamples(points){
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),w=Math.max(...xs)-x0,h=Math.max(...ys)-y0;
 const samples=[];for(let row=0;row<9;row++)for(let col=0;col<9;col++){const p=[x0+w*(col+.5)/9,y0+h*(row+.5)/9];if(insideArea(p,points))samples.push(p);}return samples;
}
export function visibleHit(hit){
 for(let o=hit.object;o;o=o.parent)if(!o.visible||o.userData.markupIgnore)return false;
 if(!hit.object.isMesh)return false;
 const m=Array.isArray(hit.object.material)?hit.object.material[hit.face?.materialIndex||0]:hit.object.material;
 if(!m||!m.visible||m.transparent&&m.opacity<.5||m.transmission>.5)return false;
 const clipped=(m.clippingPlanes||[]).map(p=>p.distanceToPoint(hit.point)<0);
 return !(clipped.length&&(m.clipIntersection?clipped.every(Boolean):clipped.some(Boolean)));
}
export function createAreaPicker({scene,camera,rooms,objects,kitchenUnits=[],floor}){
 const ray=new THREE.Raycaster(),view=camera.clone();view.updateMatrixWorld(true);scene.updateMatrixWorld(true);
 const names=new Map([...objects,...kitchenUnits].map(o=>[o.id,o.name||o.label||o.id]));
 function describe(hit){
  const mesh=hit.object,m=Array.isArray(mesh.material)?mesh.material[hit.face?.materialIndex||0]:mesh.material;
  let parent=mesh;while(parent&&!parent.userData.entityId)parent=parent.parent;
  const entityId=parent?.userData.entityId||null;
  let {surfaceRole:role='object',surfaceZone:zone=null,surfaceVariant:variant=null}=m.userData;
  if(m.userData.fixturePart)role=m.userData.fixturePart;
  if(mesh.userData.opening)role='door';
  if(role==='object'&&entityId?.startsWith('k-splash-'))role='tile';
  if(role==='object'&&mesh.userData.ceilingZone)role='ceiling';
  const room=rooms.slice(1).reduce((best,r)=>Math.hypot(r[1]-hit.point.x,r[2]-hit.point.z)<Math.hypot(best[1]-hit.point.x,best[2]-hit.point.z)?r:best,rooms[1]||rooms[0]);
  let entityName=names.get(entityId);if(entityId==='door-9')entityName='Back / west French doors';if(entityId==='door-8')entityName='Front / east entry door';
  if(entityId?.startsWith('k-'))entityName=entityName||({'k-island-top':'Island','k-island-cladding':'Island panels','k-corner':'Kitchen corner cabinet'}[entityId])||(entityId.startsWith('k-splash-')?'Kitchen backsplash':entityId.startsWith('k-waterfall-')?'Island waterfall':entityId.startsWith('k-stone-')?'Kitchen perimeter':entityId.startsWith('k-upper-')?'Upper cabinet '+entityId.slice(8):entityId.replaceAll('-',' '));
  const roomName=zone&&zones[zone]?zones[zone]:entityId?.startsWith('k-')?'Kitchen':room[0];
  const furniturePart=m.userData.furniturePart||null;
  const label=furniturePart?[entityName||roomName,furniturePart].join(' · '):role==='tile'&&zone?zones[zone]||zone:[entityName||roomName,roles[role]||'Object'].join(' · ');
  const normal=hit.face?.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)).normalize().toArray().map(rounded)||null;
  // Room + face distinguish continuous walls/floors; entity IDs distinguish counters.
  const key=JSON.stringify([floor,entityId,role,zone,roomName,furniturePart,role==='wall'?normal?.map(v=>Math.round(v)):null]);
  return {key,label,furniturePart,room:roomName,roomIsApproximate:!zone&&!entityId?.startsWith('k-'),entityId,entityName:entityName||null,surfaceRole:role,surfaceZone:zone,surfaceVariant:variant,materialColor:m.color?'#'+m.color.getHexString():null,worldPoint:hit.point.toArray().map(rounded),faceNormal:normal};
 }
 return points=>{
  const samples=areaSamples(points),groups=new Map();
  for(const p of samples){ray.setFromCamera(new THREE.Vector2(p[0]*2-1,1-p[1]*2),view);const hit=ray.intersectObjects(scene.children,true).find(visibleHit);if(!hit)continue;const info=describe(hit);let group=groups.get(info.key);if(!group){group={...info,samples:[]};groups.set(info.key,group);}group.samples.push({screen:p,point:info.worldPoint,normal:info.faceNormal});}
  return [...groups.values()].map(g=>({...g,coverage:rounded(g.samples.length/Math.max(1,samples.length)),worldBounds:{min:[0,1,2].map(i=>Math.min(...g.samples.map(s=>s.point[i]))),max:[0,1,2].map(i=>Math.max(...g.samples.map(s=>s.point[i])))}})).sort((a,b)=>b.coverage-a.coverage).slice(0,12);
 };
}
