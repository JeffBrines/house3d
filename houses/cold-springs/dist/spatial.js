export function inside(x,z,points){let v=false;for(let i=0,j=points.length-1;i<points.length;j=i++) {const [a,b]=points[i],[c,d]=points[j];if(((b>z)!==(d>z))&&(x<(c-a)*(z-b)/(d-b)+a))v=!v;}return v;}
export function distanceToSegment(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;const t=l?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l)):0;return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
export function hitsPolygon(x,z,p,r=.25){if(inside(x,z,p))return true;return p.some((v,i)=>distanceToSegment(x,z,v,p[(i+1)%p.length])<r);}
export function openingRect(o,pad=0){const {x,z,w,t}=o;return o.axis==='x'?[[x-w/2-pad,z-t/2],[x+w/2+pad,z-t/2],[x+w/2+pad,z+t/2],[x-w/2-pad,z+t/2]]:[[x-t/2,z-w/2-pad],[x+t/2,z-w/2-pad],[x+t/2,z+w/2+pad],[x-t/2,z+w/2+pad]];}
export function groundHeight(x,z){
 if(x>18.35&&x<21.15&&z>43.8&&z<47)return -Math.min(1.5,Math.max(0,Math.ceil((z-44.0)/.85)*.5));
 if(x<33.85&&z>=44.167)return -1.5;
 if(x>46.5&&x<58.34&&z>36.53&&z<45.2)return -.54;
 if(x>32.9&&x<60.9&&z<0&&z>-17.1)return -.54;
 if(x>35.5&&x<58.34&&z<9.5&&z>=0)return -.54;
 return 0;
}
export function ceilingHeight(x,z){const base=9.09375;if(x>=21.5&&x<=56.9&&z>=0&&z<=29.35){const ridge=19.413;return base+Math.max(0,Math.min(z*2.5/12,(29.12-z)*5/12));}return base;}
export function makeCollision(model,objects=[]){
 const poly=model.walls.map(p=>({p,b:[Math.min(...p.map(v=>v[0])),Math.min(...p.map(v=>v[1])),Math.max(...p.map(v=>v[0])),Math.max(...p.map(v=>v[1]))]}));
 const barriers=model.openings.filter(o=>o.kind==='window'||o.kind==='garage').map(o=>openingRect(o));
 return (x,z)=>{
  if(x<-.7||x>76.4||z<-17.1||z>75.5)return true;
  const onFloor=inside(x,z,model.hull)||(x>35.5&&x<58.34&&z>=0&&z<9.5)||(x>32.9&&x<60.9&&z>-17&&z<0)||(x>46.5&&x<58.34&&z>36.4&&z<45.2);
  if(!onFloor)return true;
  if(poly.some(({p,b})=>x>b[0]-.25&&x<b[2]+.25&&z>b[1]-.25&&z<b[3]+.25&&hitsPolygon(x,z,p)))return true;
  if(barriers.some(p=>hitsPolygon(x,z,p)))return true;
  if(objects.some(o=>{if(['sink','shower'].includes(o.type))return false;const a=-(o.rot||0)*Math.PI/180,dx=x-o.x,dz=z-o.z;const u=dx*Math.cos(a)+dz*Math.sin(a),v=-dx*Math.sin(a)+dz*Math.cos(a);return Math.abs(u)<o.w/2+.2&&Math.abs(v)<o.d/2+.2;}))return true;
  // Fireplace chase, shown on the floor plan.
  return x>54.75&&x<56.9&&z>15.4&&z<23.5;
 };
}
