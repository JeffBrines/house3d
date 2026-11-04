// Polygon clipping for a union of convex gable envelopes. It removes internal
// roof/end-wall faces at intersections; it does not specify structural joinery.
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
function half(poly,n,c,inside){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=dot(n,a)-c,db=dot(n,b)-c,aa=inside?da<=1e-8:da>=-1e-8,bb=inside?db<=1e-8:db>=-1e-8;if(aa)out.push(a);if(aa!==bb){const t=da/(da-db);out.push(a.map((v,j)=>v+(b[j]-v)*t));}}return out;}
function subtract(poly,planes){let remainder=poly;const out=[];for(const [n,c] of planes){if(remainder.length<3)break;const outside=half(remainder,n,c,false);if(outside.length>=3)out.push(outside);remainder=half(remainder,n,c,true);}return out;}
export function roofEnvelope(configs,base,wallBase,windows=[]){
 const solids=configs.map(([x0,z0,x1,z1,axis,p,oh=2])=>{
  const alongZ=axis==='z',a0=alongZ?x0:z0,a1=alongZ?x1:z1,b0=alongZ?z0:x0,b1=alongZ?z1:x1,mid=(a0+a1)/2,peak=base+(a1-a0)*p/2;
  const v=(a,y,b)=>alongZ?[a,y,b]:[b,y,a];
  const normal=(a,y,b)=>alongZ?[a,y,b]:[b,y,a];
  const planes=[[normal(-p,1,0),base-p*a0],[normal(p,1,0),base+p*a1],[normal(0,0,-1),-b0+oh],[normal(0,0,1),b1+oh],[[0,-1,0],0]];
  const lo=a0-oh,hi=a1+oh,y=base-oh*p;
  const faces=[{kind:'roof',points:[v(lo,y,b0-oh),v(mid,peak,b0-oh),v(mid,peak,b1+oh),v(lo,y,b1+oh)]},{kind:'roof',points:[v(mid,peak,b0-oh),v(hi,y,b0-oh),v(hi,y,b1+oh),v(mid,peak,b1+oh)]},...[b0,b1].map(end=>({kind:'wall',points:[v(a0,wallBase,end),v(a1,wallBase,end),v(a1,base,end),v(mid,peak,end),v(a0,base,end)]}))];
  return {planes,faces};
 });
 const holes=windows.map(o=>{const x=o.x,z=o.z,wide=o.w/2+.04,thin=o.t/2+.05,dx=o.axis==='x'?wide:thin,dz=o.axis==='z'?wide:thin;return [[[1,0,0],x+dx],[[-1,0,0],-x+dx],[[0,0,1],z+dz],[[0,0,-1],-z+dz],[[0,1,0],o.baseY+o.sill+o.h+.04],[[0,-1,0],-(o.baseY+o.sill)+.04]];});
 const faces=[];
 solids.forEach((s,i)=>s.faces.forEach(face=>{let parts=[face.points];solids.forEach((other,j)=>{if(i!==j)parts=parts.flatMap(p=>subtract(p,other.planes));});if(face.kind==='wall')for(const hole of holes)parts=parts.flatMap(p=>subtract(p,hole));for(const points of parts)if(points.length>=3)faces.push({...face,points});}));
 return faces;
}
export const roofForms=[
 [1,43.7067,33.5,73.4167,'z',7/12], [7,0,74.6667,38.5,'x',5/12],
 [35.5,0,58.1667,29.125,'z',10/12,2.25], [7,0,21.8333,18.5,'z',10/12],
 [58.1667,0,74.6667,19.25,'z',1], [58.1667,19.25,74.6667,38.5,'z',1],
 [33.5,29.125,46.5,44.1667,'z',1], [0,18.5,21.54,34,'x',5/12],
 [46.5,36.5,58.1667,46.1667,'z',10/12], [56.8467,9.5,75.6667,29,'x',8/12],
 [11,73.4167,23.5,74.4167,'z',7/12,1],
];
