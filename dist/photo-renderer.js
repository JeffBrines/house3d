import * as THREE from 'three';
import {EffectComposer} from './assets/three-addons/postprocessing/EffectComposer.js';
import {RenderPass} from './assets/three-addons/postprocessing/RenderPass.js';
import {SSAOPass} from './assets/three-addons/postprocessing/SSAOPass.js';
import {OutputPass} from './assets/three-addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from './assets/three-addons/environments/RoomEnvironment.js';

// Real-time raster rendering: no accumulated samples, convergence delay, or resolution ramp.
export class PhotoRenderer {
 constructor(renderer,scene,camera,status){
  this.renderer=renderer;this.scene=scene;this.camera=camera;this.status=status;this.enabled=false;this.glass=new Map();this.dirty=true;this.quality='balanced';this.daylight='day';
  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});target.samples=4;
  this.composer=new EffectComposer(renderer,target);this.beauty=new RenderPass(scene,camera);this.ao=new SSAOPass(scene,camera,1,1,24);this.ao.kernelRadius=.3;this.ao.minDistance=.0005;this.ao.maxDistance=.008;
  this.composer.addPass(this.beauty);this.composer.addPass(this.ao);this.composer.addPass(new OutputPass());
  this.pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();this.studio=this.pmrem.fromScene(room,.04);room.dispose();
  this.cubeTarget=new THREE.WebGLCubeRenderTarget(128,{type:THREE.HalfFloatType});this.probe=new THREE.CubeCamera(.1,160,this.cubeTarget);this.reflections=null;
 }
 activate(camera){this.enabled=true;this.camera=camera;this.savedRatio=this.renderer.getPixelRatio();this.renderer.shadowMap.autoUpdate=false;this.setQuality(this.quality);this.scene.environment=this.studio.texture;this.dirty=true;this.status('Real-time · Continuous walkthrough');}
 deactivate(){this.enabled=false;this.scene.environment=null;this.scene.traverse(o=>{for(const m of(o.material?(Array.isArray(o.material)?o.material:[o.material]):[]))if(m.envMap===this.reflections?.texture){m.envMap=null;m.needsUpdate=true;}});this.renderer.toneMappingExposure=1.05;this.renderer.shadowMap.autoUpdate=true;if(this.savedRatio)this.renderer.setPixelRatio(this.savedRatio);for(const [m,v] of this.glass){Object.assign(m,v);m.needsUpdate=true;}this.glass.clear();}
 setQuality(value){this.quality=value;this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,value==='high'?2:1.5));this.ao.enabled=value!=='performance';this.size='';}
 invalidate(kind='scene'){if(['scene','materials','lights'].includes(kind))this.dirty=true;this.renderer.shadowMap.needsUpdate=true;}
 setDaylight(value){if(this.daylight!==value)this.dirty=true;this.daylight=value;this.scene.environmentIntensity=value==='night'?.22:value==='evening'?.45:.9;}
 render(camera){
  if(!this.enabled)return false;
  this.camera=camera;this.beauty.camera=camera;this.ao.camera=camera;
  const size=this.renderer.getSize(new THREE.Vector2()),ratio=this.renderer.getPixelRatio(),key=[size.x,size.y,ratio].join(':');
  if(key!==this.size){this.composer.setPixelRatio(ratio);this.composer.setSize(size.x,size.y);this.size=key;}
  if(this.dirty){
   const live=new Set();this.scene.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))live.add(m);});for(const m of this.glass.keys())if(!live.has(m))this.glass.delete(m);
   this.scene.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m.transmission>0&&!this.glass.has(m)){this.glass.set(m,{transmission:m.transmission,transparent:m.transparent,opacity:m.opacity,depthWrite:m.depthWrite});m.transmission=0;m.transparent=true;m.opacity=.22;m.depthWrite=false;m.needsUpdate=true;}});
   // A room-color probe is useful for metal reflections, but is not diffuse GI.
   // Applying it to every surface falsely bathes white paint in the oak's color.
   for(const m of live)if(m.envMap===this.reflections?.texture){m.envMap=null;m.needsUpdate=true;}
   this.scene.environment=this.studio.texture;this.probe.position.copy(camera.position);this.scene.updateMatrixWorld(true);this.probe.update(this.renderer,this.scene);
   const old=this.reflections;this.reflections=this.pmrem.fromCubemap(this.cubeTarget.texture);
   for(const m of live)if(m.metalness>.5){m.envMap=this.reflections.texture;m.envMapIntensity=1;m.needsUpdate=true;}
   old?.dispose();this.dirty=false;
  }
  this.composer.render();this.status(`Real-time · ${this.quality==='high'?'High detail':this.quality==='performance'?'Performance':'Balanced'} · No refinement wait`);return true;
 }
}
