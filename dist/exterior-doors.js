import * as THREE from 'three';

// Owner selection: black exterior doors. Profiles and hardware remain studies.
// The door finish is independent of the interior trim package.
export function buildExteriorDoor(parent,o){
 const g=new THREE.Group();g.position.set(o.x,0,o.z);g.rotation.y=o.axis==='z'?Math.PI/2:0;g.userData.entityId='door-'+o.id;parent.add(g);
 const paint=new THREE.MeshPhysicalMaterial({color:'#141719',roughness:.44,clearcoat:.12,clearcoatRoughness:.5});paint.userData.exteriorDoorFinish='black';
 const metal=new THREE.MeshStandardMaterial({color:'#555a5c',metalness:.85,roughness:.28});
 const seal=new THREE.MeshStandardMaterial({color:'#181b1c',roughness:.65});
 const glass=new THREE.MeshPhysicalMaterial({color:'#f4f8fa',transparent:true,opacity:.16,roughness:.05,metalness:.1,depthWrite:false});
 const add=(w,h,d,x,y,z,mat,part)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=mat!==glass;m.receiveShadow=true;m.userData={entityId:g.userData.entityId,opening:o.id,doorPart:part};g.add(m);return m;};
 const handle=(x,y,direction=-1)=>{for(const sign of[-1,1]){add(.13,.23,.035,x,y,sign*.115,metal,'escutcheon');add(.035,.035,.14,x,y,sign*.18,metal,'handle stem');add(.3,.045,.045,x+direction*.12,y,sign*.25,metal,'lever');}};
 const w=o.w-.1,h=o.h-.06;
 add(w,.065,.38,0,.0325,0,metal,'threshold');
 if(o.id==='9'){
  g.userData.doorType='French double door';const leaf=(w-.025)/2,stile=4.25/12,top=4.25/12,bottom=8/12;
  for(const sign of[-1,1]){const cx=sign*(leaf+.025)/2;
   for(const edge of[-1,1])add(stile,h,.145,cx+edge*(leaf-stile)/2,h/2,0,paint,'leaf stile');
   add(leaf-2*stile,top,.145,cx,h-top/2,0,paint,'top rail');add(leaf-2*stile,bottom,.145,cx,bottom/2,0,paint,'bottom rail');
   const gw=leaf-2*stile,gh=h-top-bottom,gy=bottom+gh/2;
   add(gw,gh,.035,cx,gy,0,glass,'French door glass');
   for(const e of[-1,1])add(.025,gh,.08,cx+e*gw/2,gy,0,seal,'glazing gasket');
   for(const y of[bottom,h-top])add(gw,.025,.08,cx,y,0,seal,'glazing gasket');
   handle(sign*(stile/2+.02),3.05,sign);
   for(const y of[.7,h/2,h-.7])add(.08,.2,.12,cx+sign*leaf/2,y,.08,metal,'hinge');
  }
 }else{
  g.userData.doorType='Offset vertical-lite entry';
  // North-side lite: its handedness can be reversed once the selected door is supplied.
  const lw=8/12,lh=65/12,lx=w/2-5/12-lw/2,ly=h/2+.15,left=lx-lw/2,right=lx+lw/2,lo=ly-lh/2,hi=ly+lh/2;
  add(left+w/2,h,.145,(-w/2+left)/2,h/2,0,paint,'solid door');add(w/2-right,h,.145,(right+w/2)/2,h/2,0,paint,'solid door');
  add(lw,lo,.145,lx,lo/2,0,paint,'solid door');add(lw,h-hi,.145,lx,(hi+h)/2,0,paint,'solid door');
  add(lw,lh,.035,lx,ly,0,glass,'offset vertical glass');
  for(const x of[left,right])add(.045,lh+.05,.17,x,ly,0,seal,'lite frame');for(const y of[lo,hi])add(lw,.045,.17,lx,y,0,seal,'lite frame');
  handle(-w/2+.3,3.05);add(.15,.15,.18,-w/2+.3,3.5,0,metal,'deadbolt');
  for(const y of[.7,h/2,h-.7])add(.08,.2,.12,w/2,y,-.08,metal,'hinge');
 }
 return g;
}
