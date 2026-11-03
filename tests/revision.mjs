import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {revisionSuiteObjects,revisedMainState,revisedBasementState} from '../dist/revision-config.js';
import {createDesignStates,importDesignStates,forkExport} from '../dist/suite-state.js';
import {suiteFitWarnings} from '../dist/suite-study.js';
import {entersStairs,REVISION_STAIR_LANDINGS} from '../dist/stair-navigation.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const read=name=>JSON.parse(fs.readFileSync(path.join(dist,name)));
const main=read('revision-main-model.json'),basement=read('revision-basement-model.json');
assert.equal(main.date,'2026-10-06');assert.equal(main.sourcePage,2);assert.equal(basement.sourcePage,1);
assert.ok(main.audit.every(a=>a.errorInches<.005));
assert.deepEqual(suiteFitWarnings(revisionSuiteObjects,main),[]);
assert.equal(revisionSuiteObjects.find(o=>o.id==='suite-vanity').d*12,20);
assert.equal(revisionSuiteObjects.find(o=>o.id==='suite-shower').w*12,66);
assert.equal(revisionSuiteObjects.some(o=>o.id.startsWith('suite-powder-')),false);
assert.equal(entersStairs('main',58,35,'revised'),false);
assert.equal(entersStairs('main',46,39.3,'revised'),true);
assert.equal(entersStairs('basement',46,35,'revised'),true);
assert.equal(entersStairs('main',46,35,'revised'),false);
assert.ok(REVISION_STAIR_LANDINGS.main.z>REVISION_STAIR_LANDINGS.basement.z);

const seed={schema:1,objects:[],lights:[],kitchen:{test:'User kitchen choice'}};
const levels=createDesignStates(seed,{schema:1,objects:[{name:'Bedroom 5 bed'}],lights:[]});
const preserved=JSON.stringify(levels.expanded);
assert.equal(levels.revised.basement.objects[0].name,'Bedroom 4 bed');
assert.equal(JSON.stringify(levels.expanded),preserved);
const validate=s=>s?.schema===1&&Array.isArray(s.objects)&&Array.isArray(s.lights);
const imported=importDesignStates({schema:3,design:'expanded',designs:{original:levels.original,expanded:levels.expanded}},validate,{});
assert.equal(imported.designs.revised.main.kitchen.test,'User kitchen choice');
assert.equal(JSON.stringify(imported.designs.expanded),preserved);
assert.deepEqual(importDesignStates(forkExport('revised',levels),validate,{}).designs,levels);
assert.throws(()=>importDesignStates({schema:4,design:'revised',designs:{original:levels.original,expanded:levels.expanded}},validate,{}));

// Exercise the application's real meshes, collisions, focus points and switches.
const nodes=new Map(),storage=new Map();
const context=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>k in o?o[k]:(()=>{})});
function node(){return {options:[{},{}],textContent:'',value:'',hidden:false,clientWidth:1200,clientHeight:800,children:[],classList:{add(){},remove(){},toggle(){}},append(...x){this.children.push(...x);},replaceChildren(...x){this.children=x;},getContext:()=>context};}
globalThis.document={createElement:node,createTextNode:t=>({textContent:t}),getElementById:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},querySelectorAll:()=>[],querySelector:()=>null,body:{classList:{add(){},remove(){}}}};
globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'brines-revision-'));
let code=fs.readFileSync(path.join(dist,'app.js'),'utf8').replace(/\ninit\(\);\s*$/,'').replace(/from '\.\//g,"from '"+dist+"/");
code=code.replace('function addOpening(o){','function addOpening(o){openingRecords.push(o);');
code+=`
const openingRecords=[];
export function checkRevision(input){
 modelSets=input;models=modelSets[currentDesign];model=models.main;
 scene=new THREE.Scene();scene.background=new THREE.Color();renderer={capabilities:{getMaxAnisotropy:()=>1},setSize(){}};perspective=new THREE.PerspectiveCamera();orthographic=new THREE.OrthographicCamera();camera=perspective;orbit={target:new THREE.Vector3(),update(){}};hemi=new THREE.HemisphereLight();sun=new THREE.DirectionalLight();objectGroup=new THREE.Group();lightGroup=new THREE.Group();measureGroup=new THREE.Group();scene.add(hemi,sun,sun.target,objectGroup,lightGroup,measureGroup);mode='walk';ceilings=true;cutaway=false;
 buildArchitecture();buildObjects();buildLights();
 if(!ceilingGroup.children.filter(o=>o.userData.ceilingZone==='great').every(o=>o.material.userData.surfaceRole==='ceiling'))throw Error('Main-room ceiling must be drywall, without T&G');
 if(!wallGroup.children.some(o=>o.userData.baseboard&&o.material.userData.surfaceRole==='trim'))throw Error('Finish-controlled baseboards missing');
 function auditOpenings(floor){for(const o of openingRecords.splice(0)){for(const f of [-.43,0,.43]){const x=o.x+(o.axis==='x'?o.w*f:0),z=o.z+(o.axis==='z'?o.w*f:0);if(model.walls.some(p=>pointInside(x,z,p)))throw Error(floor+' opening crosses wall: '+JSON.stringify(o)+' at '+x+','+z);}}}
 auditOpenings('main');
 if(!validState(state))throw Error('Revised defaults cannot be saved and reloaded');
 for(const m of meshes)if(!m.geometry.attributes.position.array.every(Number.isFinite))throw Error('Non-finite geometry');
 const routes=[];
 function route(name,start,end,bounds){
  if(blocked(...start)||blocked(...end))throw Error(name+': blocked endpoint');
  const queue=[start],seen=new Set([start.join(',')]);let head=0,found=false;
  while(head<queue.length){const [x,z]=queue[head++];if(Math.hypot(x-end[0],z-end[1])<.36){found=true;break;}
   for(const [dx,dz] of [[.25,0],[-.25,0],[0,.25],[0,-.25]]){const nx=x+dx,nz=z+dz,k=nx+','+nz;if(nx<bounds[0]||nz<bounds[1]||nx>bounds[2]||nz>bounds[3]||seen.has(k))continue;seen.add(k);if(!blocked(nx,nz))queue.push([nx,nz]);}}
  if(!found)throw Error(name+': no route');routes.push(name);
 }
 route('Bedroom through revised closet into bath',[69,17],[68,38],[58,16,76,47]);
 route('Bath into revised shower',[68,38],[70,43],[62,30,74,46]);
 route('Bath into WC',[68,38],[64.25,42],[62,30,74,46]);
 route('Front hall to patio behind sofa',[43,52],[43,2],[40,0,46,55]);
 route('Kitchen to southwest dining',[41,20],[39,6],[28.5,.5,46,27]);
 for(const [name,end] of [['Office',[34,49]],['Office closet',[38.5,53]],['Bedroom 2',[55,50]],['Bedroom 2 closet',[50.5,43]],['Shared bathroom',[62.5,50]],['Shared bath WC',[68.7,50.3]],['Pantry',[37,29]],['Laundry',[33,41]],['Powder room',[38,41.5]],['Mudroom',[35,33]],['Garage',[20,37]]])route('Main hall to '+name,[43,48],end,[.5,.5,75.5,55.5]);
 route('Front-door hall to front/east upper flight',[43,52],[46,39.3],[42,33,46.3,55]);
 if(!blocked(57.8,35))throw Error('The mistaken opening in the right-hand wall remains');
 scene.updateMatrixWorld(true);
 const step=scene.children.find(m=>m.userData?.stairPart==='upper-tread');
 const down=new THREE.Raycaster(new THREE.Vector3(step.position.x,2,step.position.z),new THREE.Vector3(0,-1,0));
 const first=down.intersectObjects(scene.children,true).filter(h=>h.object.parent!==labelGroup)[0];
 if(first?.object!==step)throw Error('Main floor or slab covers the descending stair: '+JSON.stringify({hit:first?.object?.userData,point:first?.point,geometry:first?.object?.geometry?.type,step:step.position}));
 for(const zone of ['entry','closet','bath']){focusSuite(zone);if(blocked(camera.position.x,camera.position.z))throw Error(zone+' focus is blocked');}
 if(blocked(...rooms[8].slice(1)))throw Error('Bedroom 2 focus lands in obstruction');
 if(!state.objects.some(o=>o.name==='Bedroom 2 bed'))throw Error('Main bedroom renumbering missing');
 switchFloor('basement',true);
 auditOpenings('basement');
 if(blocked(38,36)||!blocked(43,35)||blocked(43,39.25)||blocked(35.75,41.5)||!blocked(32,41.5))throw Error('Basement redline walls/openings are incorrect');
 route('Back/west lower flight directly into game room',[44.5,35],[45,23],[28,0,76,56]);
 for(const [name,end] of [['Office',[35,7]],['Bedroom 4',[66,14]],['Bedroom 4 closet',[69,21.5]],['Bedroom 3',[66,42]],['Bedroom 3 closet',[69,35]],['Bathroom',[69,29]],['Storage',[36,36]],['Mechanical / gear storage',[43,48]],['Under-stair storage',[45,39.2]]])route('Game room to '+name,[45,23],end,[29,1,75,55]);
 if(!blocked(43,21.208333))throw Error('Basement structural post is missing');
 if(state.objects.some(o=>/dry\\s*bar/i.test(o.name)))throw Error('Dry bar remains');
 route('Basement bath door to shower entrance',[63,29.5],[72.25,29.5],[62.5,25.2,75.3,30.9]);
 route('Storage into mechanical room',[36,36],[36,46],[29,32,43,52]);
 if(!rooms.some(r=>r[0]==='Bedroom 3')||!rooms.some(r=>r[0]==='Bedroom 4'))throw Error('Basement numbering missing');
 switchFloor('main',true);
 if(camera.position.z<38||camera.position.x>46.3||blocked(camera.position.x,camera.position.z))throw Error('Front/east top landing is invalid');
 const topLanding={x:camera.position.x,z:camera.position.z};
 const saved=JSON.stringify(designStates.revised);
 switchDesign('original');switchDesign('expanded');switchDesign('revised');
 if(JSON.stringify(designStates.revised)!==saved)throw Error('Design switching changed revised state');
 save();return {routes,topLanding,meshCount:meshes.length,objects:designStates.revised.main.objects,basementObjects:designStates.revised.basement.objects};
}`;
try{
 const file=path.join(temporary,'check.mjs');fs.writeFileSync(file,code);
 const {checkRevision}=await import(pathToFileURL(file));
 const result=checkRevision({original:{main:read('model.json'),basement:read('basement-model.json')},expanded:{main:read('expanded-suite-model.json'),basement:read('basement-model.json')},revised:{main,basement}});
 await new Promise(resolve=>setTimeout(resolve,260));
 for(const design of ['original','expanded','revised'])for(const floor of ['main','basement'])assert.ok(storage.has('brines-suite-'+design+'-'+floor+'-v1'));
 fs.mkdirSync(path.join(root,'tmp'),{recursive:true});fs.writeFileSync(path.join(root,'tmp','house-review-fixtures.json'),JSON.stringify({main:result.objects,basement:result.basementObjects}));delete result.objects;delete result.basementObjects;console.log('October revision checks passed:',JSON.stringify(result));
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
