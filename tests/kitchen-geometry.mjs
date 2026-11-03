import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildKitchen} from '../dist/kitchen-geometry.js';
import {defaultKitchen,kitchenLayout,KITCHEN_DATUM as D} from '../dist/kitchen-engine.js';
import {stoneLayout} from '../dist/kitchen-stone.js';
import {setKitchenValue} from '../dist/kitchen-settings.js';
const ctx=new Proxy({},{get:()=>()=>{}});globalThis.document={createElement:()=>({getContext:()=>ctx})};
const palette=Object.fromEntries(['cabinet','counter','box','metal','fabric'].map(key=>[key,new THREE.MeshStandardMaterial()]));
for(const edge of ['eased','bevel','half-bullnose','miter'])for(const splash of ['match','tile-stack','tile-offset']){
 const k=defaultKitchen();k.counterThickness=2;setKitchenValue(k,'stone.edge',edge);setKitchenValue(k,'stone.splashMaterial',splash);setKitchenValue(k,'stone.waterfall',edge==='miter'?'both':'none');if(edge==='bevel'){k.showOpen=true;k.west[2].drawerLayout='four';}
 const root=new THREE.Group();buildKitchen(root,k,palette);root.updateMatrixWorld(true);const all=[];root.traverse(m=>{if(!m.isMesh)return;all.push(m);assert.ok(m.geometry.getAttribute('position').array.every(Number.isFinite));assert.ok(m.geometry.getAttribute('normal').array.every(Number.isFinite));});
 if(k.showOpen){const sinkGroup=root.children.find(g=>g.userData.entityId==='k-W05');const openedBounds=new THREE.Box3().setFromObject(sinkGroup);assert.ok(openedBounds.max.x>D.west+k.baseDepth/12+.7,'West sink doors must open outward into the aisle');}
 const st=stoneLayout(k),l=kitchenLayout(k),island=root.children.find(g=>g.userData.entityId==='k-island-top');assert.ok(island);const stones=[];island.traverse(m=>{if(m.isMesh)stones.push(m);});
 const ray=new THREE.Raycaster(new THREE.Vector3(l.island.x,6,l.island.z),new THREE.Vector3(0,-1,0));const hits=ray.intersectObjects(stones,false);assert.ok(hits.length);assert.ok(Math.abs(hits[0].point.y-l.top/12)<1e-5);assert.ok(hits[0].face.normal.y>.9,'Top normals must face up');
 const bounds=new THREE.Box3().setFromObject(island);assert.ok(bounds.min.x>=l.island.x-l.island.w/2-.001);assert.ok(bounds.max.x<=l.island.x+l.island.w/2+.001);
 const hole=st.cutouts[0],sinkRay=new THREE.Raycaster(new THREE.Vector3(D.west+(hole.x1+hole.x2)/24,3.04,D.north+(hole.z1+hole.z2)/24),new THREE.Vector3(0,-1,0));const topOnly=all.filter(m=>m.userData.entityId?.startsWith('k-stone-'));assert.equal(sinkRay.intersectObjects(topOnly,false).length,0,'Sink must remain an actual through opening');
 assert.ok(root.children.some(g=>g.userData.entityId?.startsWith('k-splash-')));if(edge==='miter')assert.ok(root.children.some(g=>g.userData.entityId==='k-waterfall-north'));
 root.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
}
console.log('3D numerical checks passed for 12 edge/backsplash variants: finite geometry, upward top normals, exact island footprint/top height, sink openings and waterfall meshes. No browser/GPU performance claim.');
