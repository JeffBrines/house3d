import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createAreaPicker,areaSamples,insideArea} from '../dist/area-targets.js';
import {requestPNG,requestText} from '../dist/markup-export.js';
import {zipFiles} from '../dist/kitchen-specs.js';

const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,1,.1,100);
camera.position.set(0,0,5);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
const material=new THREE.MeshBasicMaterial({color:'#eeeeee'});material.userData={surfaceRole:'counter'};
function box(id,x,mat=material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(1.8,2,.2),mat);mesh.userData.entityId=id;mesh.position.x=x;scene.add(mesh);return mesh;}
const island=box('k-island-top',-1),perimeter=box('k-stone-west',1);
const args={scene,camera,rooms:[['House',0,0],['Kitchen',0,0]],objects:[],floor:'main'};
const left=[[.2,.35],[.46,.35],[.46,.65],[.2,.65]],right=left.map(([x,y])=>[x+.34,y]);
let pick=createAreaPicker(args);
assert.equal(pick(left)[0].entityId,'k-island-top');assert.equal(pick(right)[0].entityId,'k-stone-west');
assert.equal(pick(left)[0].surfaceRole,'counter');
// An opaque object occludes the finish; hidden geometry and clipped faces do not.
const obstruction=box('opaque-object',-1,new THREE.MeshBasicMaterial());obstruction.position.z=1;
pick=createAreaPicker(args);assert.equal(pick(left)[0].entityId,'opaque-object');
obstruction.visible=false;assert.equal(pick(left)[0].entityId,'k-island-top');obstruction.visible=true;
obstruction.material.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,0,-1),.5)];
assert.equal(pick(left)[0].entityId,'k-island-top');
obstruction.material.clippingPlanes=[];obstruction.material.transparent=true;obstruction.material.opacity=.15;
assert.equal(pick(left)[0].entityId,'k-island-top');
// Room-specific tile survives picking through glass and differs across floors.
island.material=new THREE.MeshPhysicalMaterial();island.material.userData={surfaceRole:'tile',surfaceZone:'shower'};
assert.equal(pick(left)[0].label,'Primary shower walls');
assert.notEqual(pick(left)[0].key,createAreaPicker({...args,floor:'basement'})(left)[0].key);
const polygon=[[.1,.1],[.9,.1],[.5,.9]];assert.ok(areaSamples(polygon).every(p=>insideArea(p,polygon)));
assert.equal(areaSamples([[.2,.2],[.2,.2],[.2,.2]]).length,0);
// Captured camera stays fixed after navigation changes the live camera.
camera.position.set(90,90,90);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
assert.equal(pick(left)[0].surfaceZone,'shower');

const original=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jT1sAAAAASUVORK5CYII=','base64');
const request={id:'AREA-test',context:{designName:'Rev 1',floorLabel:'Main floor'},location:'Kitchen',note:'Try crème tile — 8″ × 8″',scope:'circled-only',areas:[{id:'area-1',selectedTarget:{label:'Island countertop',entityId:'k-island-top'}}]};
const png=requestPNG(original,request);let parsed=null,newChunks=[];
function chunks(bytes){const result=[];for(let p=8;p<bytes.length;){const v=new DataView(bytes.buffer,bytes.byteOffset+p),length=v.getUint32(0),type=Buffer.from(bytes.subarray(p+4,p+8)).toString(),data=new Uint8Array(bytes.subarray(p+8,p+8+length));result.push({type,data});p+=length+12;}return result;}
for(const c of chunks(png)){if(c.type==='iTXt'){assert.ok(Buffer.from(c.data).toString().startsWith('house3d-request\0\0\0\0\0'));parsed=JSON.parse(Buffer.from(c.data).toString().slice(20));}else newChunks.push(c);}
assert.deepEqual(parsed,request);assert.deepEqual(newChunks,chunks(original));
assert.ok(requestText(request).includes('Only the circled area(s).'));
const zipped=zipFiles({'marked-view.png':png,'request.json':JSON.stringify(request)});
const view=new DataView(zipped.buffer),nameLength=view.getUint16(26,true),length=view.getUint32(18,true);
assert.deepEqual(zipped.subarray(30+nameLength,30+nameLength+length),png);
assert.throws(()=>requestPNG(new Uint8Array(20),request));
console.log('Area requests: distinct counters, occlusion/clipping/glass, tile zones, captured camera, PNG Unicode metadata and binary ZIP passed.');
