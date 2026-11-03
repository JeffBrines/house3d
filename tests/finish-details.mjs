import assert from 'node:assert/strict';
import * as THREE from 'three';
import {defaultKitchen,kitchenLayout,validKitchen} from '../dist/kitchen-engine.js';
import {buildKitchen} from '../dist/kitchen-geometry.js';
import {buildVanity} from '../dist/bathroom-cabinets.js';
import {buildExteriorDoor} from '../dist/exterior-doors.js';
import {snapshotFinishes,restoreFinishes,defaultSurfaces} from '../dist/finish-config.js';
import {createAreaPicker} from '../dist/area-targets.js';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>new Proxy({},{get:()=>()=>{}})})};
const mat=()=>new THREE.MeshPhysicalMaterial({color:'#ffffff'}),palette={counter:mat(),cabinet:mat(),box:mat(),metal:mat(),fabric:mat()};
const k=defaultKitchen(),root=new THREE.Group();buildKitchen(root,k,palette);root.updateMatrixWorld(true);
const layout=kitchenLayout(k),u=layout.sink,a=u.rotation*Math.PI/180,center=new THREE.Vector3(u.x,0,u.z).add(new THREE.Vector3(0,0,-(k.counterDepth/12-u.d)/2).applyAxisAngle(new THREE.Vector3(0,1,0),a));
// The sink cutout must expose a real bowl below the top, not a filled slab.
let ray=new THREE.Raycaster(new THREE.Vector3(center.x,6,center.z),new THREE.Vector3(0,-1,0));
let hits=ray.intersectObject(root,true),hit=hits[0];assert.equal(hit.object.material.userData.fixturePart,'sink');assert.ok(hit.point.y<layout.top/12-.5);
assert.ok(hits.every(h=>h.object.userData.entityId!=='k-stone-west'));
assert.ok(root.children.flatMap(g=>g.children).some(m=>m.material.userData.fixturePart==='faucet'));
// Bathroom countertop has a proper opening as well.
const vg=new THREE.Group(),o={id:'vanity',name:'Vanity',type:'vanity',w:4,d:20/12,h:3};
const box=(w,h,d,x,y,z,m,g)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);g.add(mesh);return mesh;};
buildVanity(vg,o,{box,cyl(){},material:mat,cabinet:mat(),metal:mat(),counter:mat()});vg.updateMatrixWorld(true);
hit=new THREE.Raycaster(new THREE.Vector3(0,6,0),new THREE.Vector3(0,-1,0)).intersectObject(vg,true)[0];assert.equal(hit.object.material.userData.fixturePart,'sink');assert.ok(hit.point.y<o.h-.4);
// Correct door leaf count and glazing placement in the two existing openings.
const doors=new THREE.Group(),back=buildExteriorDoor(doors,{id:'9',x:43,z:.229,w:6.167,h:8,axis:'x'},mat()),front=buildExteriorDoor(doors,{id:'8',x:43,z:55.771,w:3.167,h:8,axis:'x'},mat());
assert.equal(back.children.filter(m=>m.userData.doorPart==='French door glass').length,2);const lite=front.children.filter(m=>m.userData.doorPart==='offset vertical glass');assert.equal(lite.length,1);assert.ok(lite[0].position.x>.5);assert.ok(lite[0].geometry.parameters.height>lite[0].geometry.parameters.width*5);
// Fixture choices survive A/B and validation; invalid imports are rejected.
const state={finishes:{wall:'#ffffff'},surfaces:defaultSurfaces(),objects:[],kitchen:k};k.fixtures={faucetFinish:'brass',sinkFinish:'dark',faucetStyle:'square',pullStyle:'knob'};k.stone={edge:'bevel'};const saved=snapshotFinishes(state);k.fixtures.faucetFinish='dark';k.hardware='brass';k.stone.edge='miter';restoreFinishes(state,saved);assert.equal(k.fixtures.faucetFinish,'brass');assert.equal(k.hardware,'dark');assert.equal(k.stone.edge,'bevel');assert.ok(validKitchen(k));k.fixtures.faucetFinish='invalid';assert.equal(validKitchen(k),false);
// Marked fixture finishes are distinct from cabinetry in the same cabinet.
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(50,1,.1,100),handle=box(1,1,.1,0,0,0,mat(),scene);handle.userData.entityId='k-W05';handle.material.userData.fixturePart='hardware';camera.position.set(0,0,4);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);const picker=createAreaPicker({scene,camera,rooms:[['House',0,0],['Kitchen',0,0]],objects:[],floor:'main'}),selection=picker([[.4,.4],[.6,.4],[.6,.6],[.4,.6]])[0];assert.equal(selection.surfaceRole,'hardware');assert.match(selection.label,/Cabinet handles/);
for(const r of [root,vg,doors])r.traverse(o=>{if(o.geometry)assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));});
console.log('Finish detail checks passed: kitchen and vanity sink openings, fixture identity, French/offset-lite doors, saved comparisons and import validation.');
