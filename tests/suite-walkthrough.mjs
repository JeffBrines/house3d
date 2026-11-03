// Run the actual application geometry and transition functions without a browser.
// This checks state and mesh behavior, not a substitute for a human walkthrough.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const nodes=new Map(),storage=new Map();
const context=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>k in o?o[k]:(()=>{})});
function node(){return {options:[{},{}],textContent:'',value:'',hidden:false,clientWidth:1200,clientHeight:800,children:[],attributes:{},setAttribute(k,v){this.attributes[k]=String(v);},classList:{add(){},remove(){},toggle(){}},append(...x){this.children.push(...x);},replaceChildren(...x){this.children=x;},getContext:()=>context};}
globalThis.document={createElement:node,createTextNode:t=>({textContent:t}),getElementById:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},querySelectorAll:()=>[],querySelector:()=>null,body:{classList:{add(){},remove(){}}}};
globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'brines-suite-test-'));
let code=fs.readFileSync(path.join(dist,'app.js'),'utf8').replace(/\ninit\(\);\s*$/,'').replace(/from '\.\//g,"from '"+dist+"/");
code+=`
export function testSuiteWalkthrough(original,basement,expanded){
 currentDesign='expanded';floorStates=designStates.expanded;state=floorStates.main;mainRooms=roomsForDesign();rooms=mainRooms;
 modelSets={original:{main:original,basement},expanded:{main:expanded,basement}};models=modelSets[currentDesign];model=models.main;
 scene=new THREE.Scene();scene.background=new THREE.Color();renderer={capabilities:{getMaxAnisotropy:()=>1},setSize(){}};perspective=new THREE.PerspectiveCamera();orthographic=new THREE.OrthographicCamera();camera=perspective;orbit={target:new THREE.Vector3(),update(){}};hemi=new THREE.HemisphereLight();sun=new THREE.DirectionalLight();objectGroup=new THREE.Group();lightGroup=new THREE.Group();measureGroup=new THREE.Group();scene.add(hemi,sun,sun.target,objectGroup,lightGroup,measureGroup);mode='walk';cutaway=false;ceilings=true;
 buildArchitecture();buildObjects();buildLights();
 // Let each design establish its own derived kitchen task lights before comparing saved states.
 switchDesign('original');switchDesign('expanded');
 if(!validState(state)||!validState(floorStates.basement))throw Error('The proposed state cannot reload through validation');
 scene.updateMatrixWorld(true);const showerMeshes=meshes.filter(o=>o.userData.entityId==='suite-shower');const testRay=new THREE.Raycaster(new THREE.Vector3(70,5,44.4167),new THREE.Vector3(1,0,0));if(testRay.intersectObjects(showerMeshes).length)throw Error('Shower tiles hide the retained window');const meshCount=meshes.length;if(meshCount<400)throw Error('Furnishings were not constructed');
 const routes=[];
 function route(name,start,end,bounds=[58,16,76,47]){
  const step=.25,queue=[start],seen=new Set([start.join(',')]);let head=0,found=false;
  if(blocked(...start)||blocked(...end))throw Error(name+': a route endpoint is blocked');
  while(head<queue.length){const [x,z]=queue[head++];if(Math.hypot(x-end[0],z-end[1])<.36){found=true;break;}
   for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=x+dx,nz=z+dz,k=nx+','+nz;if(nx<bounds[0]||nz<bounds[1]||nx>bounds[2]||nz>bounds[3]||seen.has(k))continue;seen.add(k);if(!blocked(nx,nz))queue.push([nx,nz]);}}
  if(!found)throw Error(name+': no walkable route');routes.push(name);
 }
 route('Bedroom directly into closet',[69,17],[69,25.5]);if(blocked(66.1,25))throw Error('Former gallery wall remains');
 route('Bedroom to bath',[69,17],[68,38]);
 if(!blocked(64.416718,30.812785)||blocked(72.666718,30.812785))throw Error('Window-side bath doorway was not moved correctly');
 route('Bath to WC',[68,38],[64.25,42]);
 route('Bath to shower through glass opening',[68,38],[70,43]);
 route('Closet to shared bath through public hall',[69,25.5],[64,49],[42,14,76,53]);
 if(!blocked(62.23,36.25)||!blocked(65.9,46.31))throw Error('A retired bedroom door remains passable');
 for(const zone of ['bath','closet','entry']){focusSuite(zone);if(blocked(camera.position.x,camera.position.z))throw Error(zone+' camera starts inside a fixture or wall');}
 const preserved=JSON.stringify(designStates.original.main);state.objects.find(o=>o.id==='suite-window-drawers').x+=.1;
 switchDesign('original');if(model!==original||rooms[6][0]!=='Bedroom 2')throw Error('Original model switch failed');if(JSON.stringify(state)!==preserved)throw Error('Expanded edit contaminated original');
 for(const zone of ['bath','closet','entry']){focusSuite(zone);if(blocked(camera.position.x,camera.position.z))throw Error('Original '+zone+' camera is blocked');}
 switchDesign('expanded');if(model!==expanded||rooms[6][0]!=='Walk-in closet')throw Error('Alternate model switch failed');if(!state.objects.some(o=>o.id==='suite-window-drawers'&&Math.abs(o.x-74.8083)<.0001))throw Error('Alternate edit lost on comparison');
 switchFloor('basement',true);if(currentFloor!=='basement'||blocked(camera.position.x,camera.position.z))throw Error('Basement landing failed');
 route('Basement landing to game room',[45,39],[45,23],[28,0,76,56]);
 switchFloor('main',true);if(currentFloor!=='main'||model!==expanded||blocked(camera.position.x,camera.position.z))throw Error('Return to alternate main floor failed');
 save();return {meshCount,routes,design:currentDesign};
}`;
try{
 const file=path.join(temporary,'diagnostic.mjs');fs.writeFileSync(file,code);
 const {testSuiteWalkthrough}=await import(pathToFileURL(file).href);
 const read=name=>JSON.parse(fs.readFileSync(path.join(dist,name)));
 const result=testSuiteWalkthrough(read('model.json'),read('basement-model.json'),read('expanded-suite-model.json'));
 await new Promise(resolve=>setTimeout(resolve,260));
 assert.equal(storage.get('brines-suite-design'),'expanded');assert.ok(storage.has('brines-suite-original-main-v1'));assert.ok(storage.has('brines-suite-expanded-main-v1'));
 console.log(JSON.stringify(result,null,2));
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
