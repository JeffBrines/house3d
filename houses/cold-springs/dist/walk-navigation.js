// Wheel up moves forward, wheel down moves backward. Normalize mouse notches,
// trackpad pixels and page/line wheel events into feet on the floor plane.
export function wheelWalkDistance(event,viewportHeight){
 if(event.ctrlKey||event.metaKey||!Number.isFinite(event.deltaY))return 0;
 const pixels=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?viewportHeight:1);
 return -Math.max(-1.5,Math.min(1.5,pixels*.008));
}

// Check the entire path, not just its endpoint, so a large wheel event cannot
// jump a thin wall. Separate axes retain the keyboard's wall-sliding behavior.
export function moveOnFloor(position,dx,dz,blocked,onStep=()=>false){
 const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));let moved=false;
 for(let i=0;i<count;i++){
  const x=position.x,z=position.z;
  if(!blocked(position.x+dx/count,position.z))position.x+=dx/count;
  if(!blocked(position.x,position.z+dz/count))position.z+=dz/count;
  if(position.x!==x||position.z!==z){moved=true;if(onStep())break;}
 }
 return moved;
}
