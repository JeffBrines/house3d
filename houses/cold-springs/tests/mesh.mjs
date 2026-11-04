import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {buildHouse} from '../dist/geometry.js';
import {defaults,furniture} from '../dist/project.js';
import {groundHeight} from '../dist/spatial.js';
// Geometry-only DOM shim: texture painting is not part of this numerical test.
const noop=()=>{};globalThis.document={createElement:()=>({getContext:()=>({fillRect:noop,beginPath:noop,moveTo:noop,bezierCurveTo:noop,stroke:noop})})};
const model=JSON.parse(readFileSync(new URL('../dist/model.json',import.meta.url))),scene=new THREE.Scene(),built=buildHouse(scene,model,defaults,furniture);
scene.updateMatrixWorld(true);let meshes=0;
scene.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;assert(p?.count>0);for(const x of p.array)assert(Number.isFinite(x),'No invalid vertices');o.geometry.computeBoundingBox();assert(!o.geometry.boundingBox.isEmpty());});
assert(meshes>100,'The actual scene must be constructed.');
const floor=scene.getObjectByName('garage-floor');assert(floor,'Garage slab is present');
const p=floor.geometry.attributes.position;let min=Infinity,max=-Infinity;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i);min=Math.min(min,y);max=Math.max(max,y);if(z>48)assert(Math.abs(y-groundHeight(x,z))<1e-5,'Rendered garage slab and walking level agree');}
assert(max-min>.49,'Garage must render the slope, not just lower the camera.');
const tub=scene.getObjectByName('Primary tub');const size=new THREE.Box3().setFromObject(tub).getSize(new THREE.Vector3());assert(Math.abs(size.x-5.5)<.01);assert(Math.abs(size.z-2.7)<.01);
// Upper window inventory must not seal a traversable ground-level opening.
const glass=[...built.shell.children].filter(o=>o.isGroup&&Math.abs(o.position.x-46.8333)<.02&&Math.abs(o.position.z-9.7292)<.02);assert(glass.length>=2,'Patio door and transom render as separate glazing units.');
console.log(`Actual Three.js scene: ${meshes} finite meshes, consistent floor levels, dimensioned tub and stacked glazing passed.`);
