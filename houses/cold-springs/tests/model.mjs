import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rooms,furniture,validSettings,defaults} from '../dist/project.js';
import {makeCollision,groundHeight} from '../dist/spatial.js';
import {moveOnFloor} from '../dist/walk-navigation.js';
const model=JSON.parse(readFileSync(new URL('../dist/model.json',import.meta.url)));
assert.equal(model.project,'cold-springs-pramer');assert.equal(model.pdfPointsPerFoot,18);
assert(model.walls.length>15);assert.equal(model.openings.filter(o=>o.kind==='garage').length,2);
assert(validSettings(defaults));assert(!validSettings({...defaults,project:'brines-house'}));
// Vertical datums read independently from A-3/A-4 (not the renderer's constants).
assert(Math.abs(groundHeight(1.46,60)-(6255-6256.24))<.001);
assert(Math.abs(groundHeight(32.3,60)-(6254.5-6256.24))<.001);
assert.equal(groundHeight(20,43),0);
assert(groundHeight(19.75,45)<0&&groundHeight(19.75,45)>groundHeight(19.75,49));
const wallOnly=makeCollision(model),furnished=makeCollision(model,furniture);
for(const o of model.openings.filter(o=>['door','entry','slider'].includes(o.kind)&&o.id!=='garage-side'))for(const d of [-.65,0,.65])assert(!wallOnly(o.x+(o.axis==='z'?d:0),o.z+(o.axis==='x'?d:0)),o.id+' must be traversable at its actual location');

// Flood-fill the actual collision mesh to confirm room-to-room routes, including
// garage steps and patio. This catches traced wall closures and blocked doorways.
const step=.25,W=312,H=340,originZ=-9,visited=new Uint8Array(W*H),queue=[];
const index=(x,z)=>Math.round(x/step)+Math.round((z-originZ)/step)*W;
const start=index(52.5,33);visited[start]=1;queue.push(start);
for(let n=0;n<queue.length;n++){const i=queue[n],ix=i%W,iz=Math.floor(i/W);for(const [xx,zz] of [[ix-1,iz],[ix+1,iz],[ix,iz-1],[ix,iz+1]]){if(xx<0||xx>=W||zz<0||zz>=H)continue;const ii=xx+zz*W;if(visited[ii])continue;const x=xx*step,z=zz*step+originZ;if(furnished(x,z))continue;visited[ii]=1;queue.push(ii);}}
const unreachable=[],obstructed=[];
for(const r of rooms){if(!visited[index(r.x,r.z)])unreachable.push(r.id);if(furnished(r.x,r.z))obstructed.push(r.id);}
console.log('Reachable floor cells:',queue.length,'Unreachable anchors:',unreachable,'Furnished anchor collisions:',obstructed);
assert.deepEqual(unreachable,[],'Every destination must connect to the entry.');assert.deepEqual(obstructed,[],'Room anchors must be clear with furniture.');
assert(wallOnly(58.48,33),'Bedroom 3 closet must remain separated from the entry.');
// The reused movement algorithm must sweep along travel, preventing wall tunneling.
const p={x:10,z:1};moveOnFloor(p,0,-5,wallOnly);assert(p.z>0,'Walk must not pass through rear wall/window.');
console.log('Cold Springs geometry, dimensions, circulation, state isolation and movement checks passed.');
