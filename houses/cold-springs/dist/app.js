import * as THREE from 'three';
import {OrbitControls} from './assets/OrbitControls.js';
import {RoomEnvironment} from './assets/three-addons/environments/RoomEnvironment.js';
import {EffectComposer} from './assets/three-addons/postprocessing/EffectComposer.js';
import {RenderPass} from './assets/three-addons/postprocessing/RenderPass.js';
import {SSAOPass} from './assets/three-addons/postprocessing/SSAOPass.js';
import {OutputPass} from './assets/three-addons/postprocessing/OutputPass.js';
import {buildHouse} from './geometry.js';
import {rooms,furniture,defaults,STORAGE_KEY,validSettings,PROJECT_ID} from './project.js';
import {makeCollision,groundHeight} from './spatial.js';
import {wheelWalkDistance,moveOnFloor} from './walk-navigation.js';

const $=id=>document.getElementById(id),wrap=$('canvasWrap');
let settings={...defaults};try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(validSettings(saved))settings=saved;}catch{}
let renderer,scene,camera,controls,house,model,blocked,mode='orbit',exterior=false,cutaway=true,yaw=0,pitch=0,drag=null,wheelVelocity=0,activeRoom='',moveKeys=new Set(),roomButtons=[];
let lights=[],sun,hemi,environment,pmrem,composer,ao;
const compact=()=>matchMedia('(max-width:760px), (pointer:coarse)').matches;
function helpSeen(){try{return sessionStorage.getItem('cold-springs-walk-help')==='seen';}catch{return false;}}
function toast(msg){$('toast').textContent=msg;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,3800);}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(settings));$('saveStatus').textContent='Saved in this browser. Export to keep a copy.';}catch{$('saveStatus').textContent='Storage unavailable. Export to keep your choices.';}}
function download(name,data,type){const blob=new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function look(){camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);}
function aim(x,z){yaw=Math.atan2(camera.position.x-x,camera.position.z-z);pitch=-.045;look();}
function clearInput(){moveKeys.clear();wheelVelocity=0;drag=null;}
function applySettings(){
 house.materials.wall.color.set(settings.wall);house.materials.floor.color.set(settings.floor);house.materials.cabinet.color.set(settings.cabinet);house.furnishings.visible=settings.furniture;
 blocked=makeCollision(model,settings.furniture?furniture:[]);
 const evening=settings.daylight==='evening';sun.intensity=evening?.3:1.7;sun.color.set(evening?'#ffd1a0':'#fff9ec');hemi.intensity=evening?.4:.6;scene.environmentIntensity=evening?.25:.35;renderer.toneMappingExposure=evening?1.05:.95;
 for(const l of lights){l.intensity=evening?65:24;l.color.set(evening?'#ffdfb4':'#ffefd9');}
 for(const k of ['wall','floor','cabinet'])$(k+'Color').value=settings[k];$('furnitureToggle').checked=settings.furniture;$('eveningToggle').checked=evening;
 renderer.shadowMap.needsUpdate=true;
}
function displayMode(){
 controls.enabled=mode!=='walk';controls.enableRotate=mode==='orbit';controls.maxPolarAngle=Math.PI*.49;
 house.roof.visible=exterior;house.ceilings.visible=mode==='walk'||exterior;
 const clipped=mode==='plan'||(mode==='orbit'&&cutaway&&!exterior);
 const plane=new THREE.Plane(new THREE.Vector3(0,-1,0),4.6);
 for(const mat of house.cutMaterials){mat.clippingPlanes=clipped?[plane]:[];mat.clipShadows=true;mat.needsUpdate=true;}
 $('cutawayToggle').checked=cutaway;$('cutawayToggle').disabled=mode!=='orbit'||exterior;
 document.querySelectorAll('[data-mode]').forEach(b=>{const active=b.dataset.mode===mode&&!exterior;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 $('exteriorButton').classList.toggle('active',exterior);$('exteriorButton').setAttribute('aria-pressed',String(exterior));
 $('touchControls').hidden=!(mode==='walk'&&compact());
 $('walkHelp').hidden=mode!=='walk'||helpSeen()||compact();
 $('viewDescription').textContent=mode==='walk'?(compact()?'Drag to look · Hold the arrows to move':'Drag to look · W A S D or arrows to move'):mode==='plan'?'Scroll to zoom · Click the map to enter a room':'Drag to orbit · Scroll to zoom';
 if(exterior)$('viewDescription').textContent='Drag to orbit · Scroll to zoom';
 renderer.shadowMap.needsUpdate=true;drawMap();
}
function resetOrbit(plan=false){
 camera.fov=44;camera.updateProjectionMatrix();controls.target.set(36,0,34);
 const factor=Math.max(1,.95/(wrap.clientWidth/wrap.clientHeight));
 if(plan){camera.position.set(36,118*factor,34.01);camera.up.set(0,0,-1);}else{camera.up.set(0,1,0);camera.position.copy(controls.target).add(new THREE.Vector3(77,104,97).multiplyScalar(factor));}
 camera.lookAt(controls.target);controls.update();
}
function setMode(next){
 clearInput();exterior=false;mode=next;camera.up.set(0,1,0);
 if(next==='walk'){if(!activeRoom)goRoom('entry');else goRoom(activeRoom);return;}
 activeRoom='';roomButtons.forEach(b=>b.classList.remove('active'));resetOrbit(next==='plan');$('viewTitle').textContent=next==='plan'?'Everything in its place.':'A new perspective.';
 document.querySelector('.view-label .eyebrow').textContent=next==='plan'?'THE PLAN / REVISION 1':'THE WHOLE PICTURE';displayMode();
}
function safePosition(x,z){if(!blocked(x,z))return [x,z];for(let r=.3;r<3;r+=.25)for(let a=0;a<Math.PI*2;a+=Math.PI/8){const xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;if(!blocked(xx,zz))return [xx,zz];}return null;}
function goRoom(id){const r=rooms.find(v=>v.id===id);if(!r)return;const p=safePosition(r.x,r.z);if(!p){toast('This destination is obstructed. Try the floor map.');return;}clearInput();mode='walk';exterior=false;activeRoom=id;camera.up.set(0,1,0);camera.fov=compact()?82:65;camera.updateProjectionMatrix();camera.position.set(p[0],groundHeight(...p)+5.5,p[1]);aim(...r.look);$('viewTitle').textContent=r.name;document.querySelector('.view-label .eyebrow').textContent='STEP INSIDE / '+r.group.toUpperCase();roomButtons.forEach(b=>{b.classList.toggle('active',b.dataset.room===id);if(b.dataset.room===id)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});$('sidebar').classList.remove('open');$('roomsButton').setAttribute('aria-expanded','false');displayMode();}
function buildRoomList(query=''){
 const host=$('rooms');host.replaceChildren();let last='',count=0;roomButtons=[];
 for(const r of rooms.filter(r=>r.name.toLowerCase().includes(query.toLowerCase()))){if(r.group!==last){const g=document.createElement('p');g.className='room-group';g.textContent=r.group;host.append(g);last=r.group;}const b=document.createElement('button');b.className='room-link';b.dataset.room=r.id;b.innerHTML=`<span><span class="room-icon" aria-hidden="true">${r.group==='Bedrooms'?'▫':r.id==='patio'?'⌁':'▱'}</span>${r.name}</span><span aria-hidden="true">↗</span>`;b.addEventListener('click',()=>goRoom(r.id));host.append(b);roomButtons.push(b);count++;}
 $('roomCount').textContent=count+' spaces';if(!count){const p=document.createElement('p');p.className='intro';p.textContent='No rooms match this search.';host.append(p);}
}
function drawMap(){if(!model)return;const canvas=$('minimap'),ctx=canvas.getContext('2d'),s=2.12,ox=29,oz=44;ctx.clearRect(0,0,220,220);ctx.lineJoin='round';
 const path=p=>{ctx.beginPath();p.forEach(([x,z],i)=>i?ctx.lineTo(ox+x*s,oz+z*s):ctx.moveTo(ox+x*s,oz+z*s));ctx.closePath();};path([[32.9,-17],[60.9,-17],[60.9,0],[58.33,0],[58.33,9.5],[35.5,9.5],[35.5,0],[32.9,0]]);ctx.fillStyle='#e9ecdf';ctx.fill();path(model.hull);ctx.fillStyle='#e3e7d9';ctx.fill();ctx.strokeStyle='#9da98f';ctx.lineWidth=.6;ctx.stroke();ctx.fillStyle='#74856c';for(const p of model.walls){path(p);ctx.fill();}
 ctx.font='8px system-ui';ctx.textAlign='center';ctx.fillStyle='#9ba78e';ctx.fillText('GARAGE',ox+17*s,oz+62*s);ctx.fillText('LIVING',ox+44*s,oz+20*s);
 if(mode==='walk'){const x=ox+camera.position.x*s,z=oz+camera.position.z*s;ctx.fillStyle='#b6cba2aa';ctx.beginPath();ctx.moveTo(x,z);for(let a=-.5;a<=.5;a+=.05)ctx.lineTo(x-Math.sin(yaw+a)*23,z-Math.cos(yaw+a)*23);ctx.closePath();ctx.fill();ctx.fillStyle='#39573c';ctx.beginPath();ctx.arc(x,z,3.8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.6;ctx.stroke();}
}
function bind(){
 document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
 $('startWalk').onclick=()=>goRoom('entry');$('roomSearch').addEventListener('input',e=>buildRoomList(e.target.value));
 $('exteriorButton').onclick=()=>{clearInput();mode='orbit';exterior=true;resetOrbit();const factor=Math.max(1,.95/(wrap.clientWidth/wrap.clientHeight));camera.position.copy(controls.target).add(new THREE.Vector3(92,72,124).multiplyScalar(factor));controls.update();$('viewTitle').textContent='The house, from outside.';document.querySelector('.view-label .eyebrow').textContent='ROOFLINES & FORM';displayMode();};
 $('resetViewButton').onclick=()=>mode==='walk'?goRoom(activeRoom||'entry'):setMode(mode);
 $('settingsButton').onclick=()=>{const visible=$('settingsPanel').hidden;$('settingsPanel').hidden=!visible;$('settingsButton').setAttribute('aria-expanded',String(visible));clearInput();};
 $('roomsButton').onclick=()=>{const open=$('sidebar').classList.toggle('open');$('roomsButton').setAttribute('aria-expanded',String(open));clearInput();};
 $('closeRooms').onclick=()=>{$('sidebar').classList.remove('open');$('roomsButton').setAttribute('aria-expanded','false');$('roomsButton').focus();};
 $('furnitureToggle').onchange=e=>{settings.furniture=e.target.checked;applySettings();save();if(mode==='walk'&&blocked(camera.position.x,camera.position.z)){const p=safePosition(camera.position.x,camera.position.z);if(p)camera.position.set(p[0],groundHeight(...p)+5.5,p[1]);}};
 $('cutawayToggle').onchange=e=>{cutaway=e.target.checked;displayMode();};$('eveningToggle').onchange=e=>{settings.daylight=e.target.checked?'evening':'day';applySettings();save();};
 for(const k of ['wall','floor','cabinet'])$(k+'Color').oninput=e=>{settings[k]=e.target.value;applySettings();save();};
 $('resetSettings').onclick=()=>{settings={...defaults};applySettings();save();toast('Starting materials restored.');};
 $('dismissHelp').onclick=()=>{$('walkHelp').hidden=true;try{sessionStorage.setItem('cold-springs-walk-help','seen');}catch{}};
 const showDialog=id=>{clearInput();$(id).showModal();};$('planReferenceButton').onclick=()=>showDialog('referenceDialog');$('projectButton').onclick=()=>showDialog('projectDialog');
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',clearInput);d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
 $('exportButton').onclick=()=>download('cold-springs-choices.json',JSON.stringify(settings,null,2),'application/json');
 $('importFile').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>20000)throw Error('file too large');const v=JSON.parse(await file.text());if(!validSettings(v))throw Error('wrong project');settings={project:PROJECT_ID,version:1,floor:v.floor,wall:v.wall,cabinet:v.cabinet,furniture:v.furniture,daylight:v.daylight};applySettings();save();toast('Cold Springs choices imported.');}catch{toast('Choose a valid Cold Springs choices file.');}finally{e.target.value='';}};
 $('captureButton').onclick=()=>{composer.render();renderer.domElement.toBlob(blob=>{if(!blob){toast('Unable to save this view.');return;}const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download='cold-springs-'+(activeRoom||'overview')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);toast('View saved.');},'image/png');};
 $('mapToggle').onclick=()=>{const hidden=$('minimap').hidden=!$('minimap').hidden;$('mapToggle').textContent=hidden?'+':'−';$('mapToggle').setAttribute('aria-label',hidden?'Show map':'Hide map');};
 $('minimap').onclick=e=>{const r=e.currentTarget.getBoundingClientRect(),x=((e.clientX-r.left)*220/r.width-29)/2.12,z=((e.clientY-r.top)*220/r.height-44)/2.12;if(blocked(x,z)){toast('Pick a clear floor area on the map.');return;}mode='walk';exterior=false;camera.up.set(0,1,0);camera.fov=compact()?82:65;camera.updateProjectionMatrix();camera.position.set(x,groundHeight(x,z)+5.5,z);const nearest=rooms.reduce((a,b)=>Math.hypot(a.x-x,a.z-z)<Math.hypot(b.x-x,b.z-z)?a:b);activeRoom=nearest.id;aim(...nearest.look);$('viewTitle').textContent=nearest.name;displayMode();clearInput();};
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','3D house. Drag to look. Use W A S D or arrow keys to walk.');
 canvas.addEventListener('pointerdown',e=>{if(mode!=='walk'||e.button!==0)return;canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;yaw-=dx*.004;pitch=Math.max(-1.25,Math.min(1.25,pitch-dy*.0035));drag.x=e.clientX;drag.y=e.clientY;look();});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drag=null);
 canvas.addEventListener('wheel',e=>{if(mode!=='walk')return;e.preventDefault();wheelVelocity=Math.max(-3,Math.min(3,wheelVelocity+wheelWalkDistance(e,wrap.clientHeight)));},{passive:false});
 const movementKeys=new Set(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright','shift']);
 addEventListener('keydown',e=>{if(e.key==='Escape'){clearInput();$('settingsPanel').hidden=true;$('settingsButton').setAttribute('aria-expanded','false');$('sidebar').classList.remove('open');$('roomsButton').setAttribute('aria-expanded','false');}const k=e.key.toLowerCase();if(mode!=='walk'||document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||!movementKeys.has(k))return;e.preventDefault();moveKeys.add(k);});
 addEventListener('keyup',e=>moveKeys.delete(e.key.toLowerCase()));addEventListener('blur',clearInput);document.addEventListener('visibilitychange',clearInput);
 for(const b of document.querySelectorAll('[data-move]')){const map={forward:'w',back:'s',left:'a',right:'d'};b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);moveKeys.add(map[b.dataset.move]);});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>moveKeys.delete(map[b.dataset.move]));}
}
function resize(){if(!renderer)return;const w=wrap.clientWidth,h=wrap.clientHeight;renderer.setSize(w,h,false);composer?.setSize(w,h);camera.aspect=w/h;if(mode==='walk')camera.fov=compact()?82:65;camera.updateProjectionMatrix();$('touchControls').hidden=!(mode==='walk'&&compact());}
async function init(){
 const res=await fetch('./model.json');if(!res.ok)throw Error('The house model could not be loaded.');model=await res.json();
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.localClippingEnabled=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;wrap.append(renderer.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color('#e1e6dc');scene.fog=new THREE.Fog('#e1e6dc',180,420);
 camera=new THREE.PerspectiveCamera(44,1,.08,600);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=14;controls.maxDistance=200;controls.target.set(36,0,34);controls.addEventListener('change',drawMap);
 hemi=new THREE.HemisphereLight('#fffdf5','#c5ccbc',1.8);scene.add(hemi);sun=new THREE.DirectionalLight('#fff9ec',2.6);sun.position.set(-30,85,-40);sun.target.position.set(35,0,30);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-80,right:80,top:80,bottom:-80,near:1,far:240});sun.shadow.bias=-.00012;sun.shadow.normalBias=.035;scene.add(sun,sun.target);
 pmrem=new THREE.PMREMGenerator(renderer);const env=new RoomEnvironment();environment=pmrem.fromScene(env,.03);scene.environment=environment.texture;env.dispose();
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.MeshStandardMaterial({color:'#cdd5c3',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.set(35,-1.9,30);ground.receiveShadow=true;scene.add(ground);
 const apron=new THREE.Mesh(new THREE.BoxGeometry(30,.12,35),new THREE.MeshStandardMaterial({color:'#bdbfb4',roughness:.95}));apron.position.set(49,-1.8,60);apron.receiveShadow=true;scene.add(apron);
 house=buildHouse(scene,model,settings,furniture);
 // Broad low-intensity room fill supports readable interiors with full ceilings.
 for(const [x,z] of [[44,19],[27,18],[15,9],[6,26],[27,39],[39,38],[52,32],[67,7],[67,31],[66,16],[66,22],[17,59]]){const l=new THREE.PointLight('#fff2dc',35,25,2);l.position.set(x,7.7,z);lights.push(l);scene.add(l);}
 const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});target.samples=4;composer=new EffectComposer(renderer,target);composer.addPass(new RenderPass(scene,camera));ao=new SSAOPass(scene,camera,1,1,16);ao.kernelRadius=.32;ao.minDistance=.0005;ao.maxDistance=.006;composer.addPass(ao);composer.addPass(new OutputPass());
 applySettings();resetOrbit();displayMode();bind();buildRoomList();resize();new ResizeObserver(resize).observe(wrap);
 for(const s of model.assumptions){const li=document.createElement('li');li.textContent=s;$('assumptions').append(li);}
 $('loading').hidden=true;
 let last=performance.now(),frames=0;
 function tick(now){requestAnimationFrame(tick);const dt=Math.min(.05,(now-last)/1000);last=now;
  if(mode==='walk'&&!document.querySelector('dialog[open]')&&!document.hidden){
   let forward=(moveKeys.has('w')||moveKeys.has('arrowup')?1:0)-(moveKeys.has('s')||moveKeys.has('arrowdown')?1:0),side=(moveKeys.has('d')||moveKeys.has('arrowright')?1:0)-(moveKeys.has('a')||moveKeys.has('arrowleft')?1:0);const norm=Math.hypot(forward,side)||1;forward/=norm;side/=norm;
   const speed=moveKeys.has('shift')?9:4.6;let travel=forward*speed*dt;const wheel=wheelVelocity*(1-Math.exp(-11*dt));wheelVelocity-=wheel;travel+=wheel;
   const dx=-Math.sin(yaw)*travel+Math.cos(yaw)*side*speed*dt,dz=-Math.cos(yaw)*travel-Math.sin(yaw)*side*speed*dt;
   moveOnFloor(camera.position,dx,dz,blocked);const eye=groundHeight(camera.position.x,camera.position.z)+5.5;camera.position.y+=(eye-camera.position.y)*Math.min(1,dt*12);if(frames%3===0)drawMap();
  }else if(mode!=='walk')controls.update();
  composer.render();frames++;
 }
 requestAnimationFrame(tick);
 // Read-only diagnostics for source handoff and browser verification.
 window.coldSprings={get state(){return {project:PROJECT_ID,mode,exterior,room:activeRoom,position:camera.position.toArray(),yaw,pitch,settings:{...settings},drawCalls:renderer.info.render.calls};},goRoom,setMode,blocked};
}
init().catch(e=>{console.error(e);$('loading').replaceChildren();const h=document.createElement('h2');h.textContent='The house could not open.';const p=document.createElement('p');p.textContent=e.message.includes('WebGL')?'This browser could not start 3D rendering. Try a browser with WebGL enabled.':e.message;const b=document.createElement('button');b.textContent='Try again';b.onclick=()=>location.reload();$('loading').append(h,p,b);});
