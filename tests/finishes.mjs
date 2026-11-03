import assert from 'node:assert/strict';
import * as THREE from 'three';
import {defaultSurfaces,ensureSurfaces,validSurfaces,setCabinetFinish,snapshotFinishes,restoreFinishes,applyPalette} from '../dist/finish-config.js';
import {surfaceMaterial,applySurfaceMaterials,saguaroLayout} from '../dist/surface-materials.js';
import {defaultKitchen} from '../dist/kitchen-engine.js';
import {buildKitchen} from '../dist/kitchen-geometry.js';
import {validVanitySpec,buildVanity} from '../dist/bathroom-cabinets.js';
import {createDesignStates,forkExport,importDesignStates} from '../dist/suite-state.js';

// Enough canvas support to exercise real material generation without a GPU.
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},fillText(){},drawImage(){},putImageData(){},createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})})})};
const state={schema:1,objects:[{id:'v',name:'Vanity',type:'vanity',x:10,z:10,w:6,d:2,h:3,rotation:90}],lights:[],finishes:{floor:'#b99160',wall:'#eeeae1',counter:'#efede7',cabinet:'#986b43'},daylight:'day',kitchen:defaultKitchen()};
const surfaces=ensureSurfaces(state);assert.ok(validSurfaces(surfaces));assert.equal(surfaces.tiles.showerFloor.width,2);
assert.equal(surfaces.floorProduct,'saguaro');assert.equal(surfaces.boardWidth,8);assert.equal(surfaces.boardLength,75);assert.equal(surfaces.trim,'white');
const boards=saguaroLayout();assert.ok(boards.every(b=>b.length>0&&b.length<=75));
for(let column=0;column<8;column++){const run=boards.filter(b=>b.column===column);assert.ok(run[0].start<=0);assert.ok(run.at(-1).start+run.at(-1).length>=150);for(let i=1;i<run.length;i++)assert.equal(run[i].start,run[i-1].start+run[i-1].length);}
const saguaro=surfaceMaterial('floor',state);assert.equal(saguaro.map.repeat.x,12/64);assert.equal(saguaro.map.repeat.y,12/150);assert.equal(saguaro.roughness,.86);
state.surfaces.trim='oak';applyPalette(state,'contrast');assert.equal(state.surfaces.trim,'oak');assert.equal(state.surfaces.floorProduct,'saguaro');assert.equal(state.surfaces.boardWidth,8);assert.equal(state.finishes.cabinet,'#263335');state.finishes.wall='#eeeae1';state.surfaces.trim='white';setCabinetFinish(state,'#986b43');state.surfaces.tiles.primary.color='#d8d1c2';
for(const [key,value] of [['boardWidth',Infinity],['direction',45],['paintSheen','invalid']])assert.equal(validSurfaces({...surfaces,[key]:value}),false);
for(const [key,value] of [['width',0],['height',NaN],['joint',2],['color','bad'],['pattern','herringbone']]){const invalid=structuredClone(surfaces);invalid.tiles.primary[key]=value;assert.equal(validSurfaces(invalid),false);}
const original=snapshotFinishes(state),camera=new THREE.PerspectiveCamera();camera.position.set(2,5.6,7);const beforeCamera=camera.matrix.clone();
setCabinetFinish(state,'#263335');assert.ok(validVanitySpec(state.objects[0]));assert.equal(state.kitchen.maker.finish,'paint');assert.equal(state.objects[0].vanitySpec.finish,'white');
state.surfaces.tiles.primary.color='#667766';state.surfaces.tiles.primary.pattern='offset';state.finishes.wall='#a7afa0';
const changed=snapshotFinishes(state);restoreFinishes(state,original);assert.equal(state.finishes.wall,'#eeeae1');assert.equal(state.objects[0].vanitySpec.finish,'oak');assert.equal(state.kitchen.maker.finish,'rift-oak');assert.equal(state.surfaces.tiles.primary.pattern,'stack');assert.deepEqual(camera.matrix,beforeCamera);
restoreFinishes(state,changed);assert.equal(state.surfaces.tiles.primary.color,'#667766');assert.equal(original.surfaces.tiles.primary.color,'#d8d1c2');

const scene=new THREE.Scene(),floor=new THREE.Mesh(new THREE.PlaneGeometry(6,8),surfaceMaterial('tile',state,'primary'));floor.rotation.x=-Math.PI/2;scene.add(floor);
const tileMaterial=floor.material;assert.equal(tileMaterial.map.repeat.x,.25);assert.equal(tileMaterial.map.repeat.y,.25);assert.equal(tileMaterial.bumpMap.colorSpace,THREE.NoColorSpace);assert.equal(tileMaterial.map.colorSpace,THREE.SRGBColorSpace);
const kitchen=new THREE.Group();scene.add(kitchen);const mat=()=>new THREE.MeshPhysicalMaterial();buildKitchen(kitchen,state.kitchen,{cabinet:surfaceMaterial('cabinet',state),counter:surfaceMaterial('counter',state),box:mat(),metal:mat(),fabric:mat()});
const vanity=new THREE.Group();scene.add(vanity);buildVanity(vanity,state.objects[0],{box(w,h,d,x,y,z,m,g){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o;},cyl(a,b,h,x,y,z,m,g){const o=new THREE.Mesh(new THREE.CylinderGeometry(a,b,h),m);o.position.set(x,y,z);g.add(o);return o;},material:color=>new THREE.MeshPhysicalMaterial({color}),cabinet:surfaceMaterial('cabinet',state),counter:surfaceMaterial('counter',state),metal:mat()});
applySurfaceMaterials(scene,state);let cabinets=0;
scene.traverse(o=>{if(o.material?.userData.surfaceRole==='cabinet'){cabinets++;assert.equal(o.material.color.getHexString(),'263335');assert.equal(o.material.map,null);}if(o.geometry?.userData.physicalUV)assert.ok(o.geometry.attributes.uv.array.every(Number.isFinite));});assert.ok(cabinets>20);
const uv=floor.geometry.attributes.uv;assert.equal(Math.max(...Array.from({length:uv.count},(_,i)=>uv.getX(i)))-Math.min(...Array.from({length:uv.count},(_,i)=>uv.getX(i))),6);
const designs=createDesignStates(structuredClone(state),structuredClone(state));designs.revised.main.surfaces.tiles.primary.color='#aaaaaa';assert.notEqual(designs.revised.basement.surfaces.tiles.primary.color,'#aaaaaa');
const imported=importDesignStates(forkExport('revised',designs),s=>s.schema===1&&validSurfaces(s.surfaces),state);assert.equal(imported.designs.revised.main.surfaces.tiles.primary.color,'#aaaaaa');assert.equal(imported.designs.revised.basement.surfaces.tiles.primary.color,'#667766');
console.log('Finish checks passed: validation, independent A/B snapshots, kitchen + vanity paint propagation, physical UV scale, tile map scaling/color spaces, and per-floor export/import.');
