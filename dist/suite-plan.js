import {SUITE_BOUNDS,suiteObjects,suiteOpenings,suiteMetrics} from './suite-config.js';

export const escapeXML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const n=v=>Number(v.toFixed(3));
export function inchesLabel(ft){const total=Math.round(ft*24)/2,feet=Math.floor(total/12),inch=total-feet*12;return `${feet}′${inch?` ${Number.isInteger(inch)?inch:Math.floor(inch)+'½'}″`:''}`;}
export function objectBounds(o){const a=o.rotation*Math.PI/180,w=Math.abs(Math.cos(a))*o.w+Math.abs(Math.sin(a))*o.d,d=Math.abs(Math.sin(a))*o.w+Math.abs(Math.cos(a))*o.d;return [o.x-w/2,o.z-d/2,o.x+w/2,o.z+d/2];}
export function bathClearances(objects=suiteObjects){
 const find=id=>objects.find(o=>o.id==='suite-'+id),v=find('vanity'),t=find('tub'),s=find('shower');
 if(!v||!t||!s)return null;
 const a=objectBounds(v),b=objectBounds(t),c=objectBounds(s);
 const dx=Math.max(0,a[0]-b[2],b[0]-a[2]),dz=Math.max(0,a[1]-b[3],b[1]-a[3]);
 const standard=Math.abs(v.rotation-180)<.01&&Math.abs(t.rotation%180)<.01;
 return {vanity:a,tub:b,shower:c,standard,cornerGapIn:Math.hypot(dx,dz)*12,tubShowerGapIn:(c[1]-b[3])*12,
  standingClear:b[0]>=a[2]||b[2]<=a[0]||b[1]>=a[3]+3||b[3]<=a[3]};
}

export function comparisonSVG(original,expanded,objects=suiteObjects,originalObjects=[]){
 const scale=24,top=150,feetX=58,feetZ=17,m=suiteMetrics(),out=[];
 const fixture=id=>objects.find(o=>o.id==='suite-'+id),size=v=>Number((v*12).toFixed(1))+'″';
 out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1180" height="1030" viewBox="0 0 1180 1030" role="img" aria-labelledby="title desc"><title id="title">Brines residence: original and expanded primary suite</title><desc id="desc">Revision B.3 extends the shower to the toilet-room wall and adds a seated powder vanity beside the window-side entry. The tub position is provisional. Existing exterior walls and windows remain.</desc><defs><pattern id="newWall" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#e7ba74"/><path d="M-2 7L7-2M5 9L9 5" stroke="#aa7841" stroke-width="1"/></pattern></defs><rect width="1180" height="1030" fill="#faf9f5"/><g font-family="Arial, sans-serif" fill="#233b40"><text x="40" y="43" font-size="27" font-weight="700">A wider shower. A seated powder vanity.</text><text x="40" y="73" font-size="15" fill="#596c6d">BRINES RESIDENCE · EXPANDED SUITE B.3 · SEPTEMBER 16, 2026 · CONCEPT STUDY</text><text x="40" y="104" font-size="13" fill="#596c6d">Dashed green boxes: 30 × 36-inch standing-space studies. Tub and entry clearances remain provisional.</text>`);
 for(const [idx,model] of [original,expanded].entries()){
  const left=idx?650:65,X=x=>n(left+(x-feetX)*scale),Y=z=>n(top+(z-feetZ)*scale);
  const text=(x,z,lines,size=13,color='#233b40',anchor='middle')=>{out.push(`<text x="${X(x)}" y="${Y(z)}" text-anchor="${anchor}" font-size="${size}" fill="${color}">${lines.map((l,i)=>`<tspan x="${X(x)}" dy="${i?size*1.3:0}">${escapeXML(l)}</tspan>`).join('')}</text>`);};
  const rect=(a,b,c,d,fill,stroke='none',extra='')=>out.push(`<rect x="${X(a)}" y="${Y(b)}" width="${n((c-a)*scale)}" height="${n((d-b)*scale)}" fill="${fill}" stroke="${stroke}" ${extra}/>`);
  const line=(a,b,c,d,color='#496d73',extra='')=>out.push(`<path d="M${X(a)} ${Y(b)}L${X(c)} ${Y(d)}" stroke="${color}" fill="none" ${extra}/>`);
  const poly=(points,fill)=>out.push(`<polygon points="${points.map(([x,z])=>X(x)+','+Y(z)).join(' ')}" fill="${fill}"/>`);
  out.push(`<text x="${left}" y="137" font-size="17" font-weight="700">${idx?'02 / EXPANDED SUITE':'01 / ORIGINAL PLAN'}</text><clipPath id="clip-${idx}"><rect x="${left}" y="${top}" width="490" height="756"/></clipPath><g clip-path="url(#clip-${idx})">`);
  rect(58,17,76.5,48.5,'#f0eee7');
  if(idx){rect(62.4167,19,75.5,30.6253,'#ece0c9');rect(62.4167,31.0003,75.5,34.0003,'#dce9ea');rect(62.4167,34.0003,73.5,46.042,'#dce9ea');}
  else {rect(62.4167,19,75.5,24.0,'#ece0c9');rect(66.2917,24.375,75.5,34.167,'#dce9ea');rect(62.4167,24.375,65.9167,30.167,'#dce9ea');rect(62.4167,34.542,73.5,46.042,'#e9e9e4');}
  for(const p of model.walls)poly(p,'#637471');
  if(idx)for(const p of model.suiteStudy.new_walls)poly(p,'url(#newWall)');
  // The same three existing windows are shown in both versions.
  for(const [x,z,w] of [[75.771,27.167,5],[73.771,36.167,2.5],[73.771,44.417,2.5]]){
   line(x,z-w/2,x,z+w/2,'#111d22','stroke-width="4"');for(const k of [-1,1])line(x-.28,z+k*w/2,x+.28,z+k*w/2,'#111d22','stroke-width="2"');
  }
  const fixtures=idx?objects.filter(o=>o.id.startsWith('suite-')):originalObjects.filter(o=>o.id==='bed2'||o.id.startsWith('primary-')&&o.id!=='primary-bed');
  for(const o of fixtures){
   if(o.type==='suiteMirror'){if(o.id==='suite-powder-mirror')line(o.x,o.z-o.w/2,o.x,o.z+o.w/2,'#648f9b','stroke-width="3"');continue;}const [x0,z0,x1,z1]=[o.x-o.w/2,o.z-o.d/2,o.x+o.w/2,o.z+o.d/2];
   out.push(`<g transform="rotate(${-o.rotation} ${X(o.x)} ${Y(o.z)})">`);
   if(o.type==='tub')out.push(`<ellipse cx="${X(o.x)}" cy="${Y(o.z)}" rx="${n((x1-x0)*scale/2)}" ry="${n((z1-z0)*scale/2)}" fill="#fdfcf8" stroke="#6a8086" stroke-width="2"/><ellipse cx="${X(o.x)}" cy="${Y(o.z)}" rx="${n(Math.max(.3,(x1-x0)*scale/2-6))}" ry="${n(Math.max(.3,(z1-z0)*scale/2-6))}" fill="#e6eeee" stroke="#c4d3d4"/>`);
   else if(o.type==='toilet'){rect(x0,z1-.5,x1,z1,'#fff','#869998','rx="2"');out.push(`<ellipse cx="${X(o.x)}" cy="${Y(o.z-.2)}" rx="${n(o.w*scale*.43)}" ry="${n(o.d*scale*.32)}" fill="#fff" stroke="#869998"/>`);}
   else if(['suiteShower','shower'].includes(o.type)){
    rect(x0,z0,x1,z1,'#d0e0e1','#8aa4a7');for(let x=x0+.75;x<x1;x+=.75)line(x,z0,x,z1,'#b3cacc');for(let z=z0+.75;z<z1;z+=.75)line(x0,z,x1,z,'#b3cacc');
    line(x0,z0,x0,z1,o.leftWall?'#9f998c':'#548995','stroke-width="3"');line(x0+(o.entryWidth??o.w*.6),z0,x1,z0,'#548995','stroke-width="3"');
   }else if(o.type==='vanity'){
    rect(x0,z0,x1,z1,'#f9f8f1','#8c8f80');const longX=x1-x0>z1-z0;for(const t of [-.24,.24]){const x=o.x+(longX?(x1-x0)*t:0),z=o.z+(longX?0:(z1-z0)*t),hw=longX?.55:.4,hd=longX?.36:.55;rect(x-hw,z-hd,x+hw,z+hd,'#d2dfdf','#91a4a4','rx="5"');}
   }else if(o.type==='powderVanity'){
    rect(x0,z0,x1,z1,'#e1ccb0','#8c7b64');line(x0+.0625,z0,x0+.0625,z1,'#8c7b64');line(x1-.0625,z0,x1-.0625,z1,'#8c7b64');
   }else if(o.type==='powderStool'){
    out.push(`<ellipse cx="${X(o.x)}" cy="${Y(o.z)}" rx="${n(o.w*scale/2)}" ry="${n(o.d*scale/2)}" fill="#f2e8d8" fill-opacity=".65" stroke="#8c7b64" stroke-dasharray="3 2"/>`);
   }else{
    rect(x0,z0,x1,z1,o.type==='wardrobe'?'#bd9d74':o.type==='drawerCab'?'#cfb491':o.type==='bench'?'#e3d2b8':'#fff','#9c8d73','stroke-width="1.2"');
    if(o.type==='wardrobe'){
     if((z1-z0)>(x1-x0)){for(let z=z0+.2;z<z1;z+=.3)line(x0+.28,z,x1-.28,z,'#e3d2b8');}
     else for(let x=x0+.2;x<x1;x+=.3)line(x,z0+.25,x,z1-.25,'#e3d2b8');
    }
   }
   out.push('</g>');
  }
  text(67,18,['PRIMARY BEDROOM · RETAINED'],13);
  text(60,41,['HALL'],12,'#7e8c88');text(68.4,47.8,['SHARED BATH · HALL ACCESS RETAINED'],11);
  if(idx){
   const v=fixture('vanity');if(v&&v.rotation===180){for(const t of [-.24,.24])rect(v.x+v.w*t-1.25,v.z+v.d/2,v.x+v.w*t+1.25,v.z+v.d/2+3,'#c4e4ce','#548363','fill-opacity=".4" stroke-dasharray="5 3"');}
   for(const o of suiteOpenings){const r=o.w/2;if(o.axis==='x')line(o.x-r,o.z,o.x+r,o.z,'#b58446','stroke-width="2" stroke-dasharray="4 3"');else line(o.x,o.z-r,o.x,o.z+r,'#b58446','stroke-width="2" stroke-dasharray="4 3"');}
   line(62.91,37.667,62.91,40.167,'#9d753f','stroke-width="3"');
   out.push(`<path d="M${X(62.91)} ${Y(37.667)}A60 60 0 0 1 ${X(65.41)} ${Y(40.167)}" fill="none" stroke="#9d753f" stroke-dasharray="4 3"/>`);
   const vanity=fixture('vanity'),shower=fixture('shower'),tub=fixture('tub');
   if(vanity)text(vanity.x,vanity.z+.15,[size(vanity.w)+' VANITY'],11);
   if(shower)text(shower.x,shower.z-.55,['SHOWER',size(shower.w)+' × '+size(shower.d)],12);
   if(tub)text(tub.x,tub.z-.4,['TUB',size(Math.max(tub.w,tub.d))+' × '+size(Math.min(tub.w,tub.d))],10);
   text(69.2,24.7,['WALK-IN CLOSET','≈ '+Math.round(m.closetArea)+' sq ft'],15);
   text(69.2,27.1,[inchesLabel(m.closetWidth)+' × '+inchesLabel(m.closetDepth)],12,'#705a3f');
   text(67.9,36.1,['PRIMARY BATH','≈ '+Math.round(m.bathArea)+' sq ft'],14);
   text(64.2,41.8,['WC','42″ × 66″'],11);
   line(68.959,18.5,68.959,23,'#48836d','stroke-width="2" stroke-dasharray="6 4"');
   line(69,27.8,72.479191,29.8,'#48836d','stroke-width="2" stroke-dasharray="6 4"');
   line(72.479191,29.8,72,33.7,'#48836d','stroke-width="2" stroke-dasharray="6 4"');
   text(69,30.2,['ENTRY →'],10,'#45666d');
   const cl=bathClearances(objects);if(cl&&cl.standard)text(67.7,39.4,[Math.round(cl.cornerGapIn)+'″ ENTRY TURN*',Math.round(cl.tubShowerGapIn)+'″ TUB END GAP*'],10,'#9b562d');
   line(76.7,31.0003,76.7,46.042,'#5a7880');for(const z of [31.0003,46.042])line(76.3,z,77.1,z,'#5a7880');
   out.push(`<text transform="translate(${X(77.35)} ${Y(39)}) rotate(-90)" text-anchor="middle" font-size="11" fill="#45666d">${escapeXML(inchesLabel(m.bathDepth)+' BATH DEPTH')}</text>`);
  }else{
   text(64.65,20.35,['CLOSET','4′5″ × 5′'],12);text(73.25,20.35,['CLOSET','4′5″ × 5′'],12);
   text(69,23,['PASSAGE'],10);text(70.65,26.1,['PRIMARY BATH'],12);
   text(64.2,27,['WC'],12);text(64.2,32.2,['BEDROOM','CLOSET'],11);
   text(67.5,38.2,['BEDROOM 2','11′1″ × 11′6″'],15);
   text(67.2,44.6,['The bathroom moves into this room.'],12,'#7c6651');
  }
  out.push('</g>');
 }
 out.push(`<path d="M40 929H1140" stroke="#d2d9d3"/><rect x="40" y="952" width="16" height="16" fill="#637471"/><text x="64" y="965" font-size="12">Retained wall</text><rect x="202" y="952" width="16" height="16" fill="url(#newWall)"/><text x="226" y="965" font-size="12">Proposed / infilled wall</text><path d="M410 960H444" stroke="#48836d" stroke-width="2" stroke-dasharray="6 4"/><text x="453" y="965" font-size="12">Private route</text><path d="M636 960H660" stroke="#111d22" stroke-width="4"/><text x="670" y="965" font-size="12">Existing black window</text><path d="M961 957H1081M961 951V963M1021 951V963M1081 951V963" stroke="#233b40"/><text x="961" y="981" font-size="11">0</text><text x="1070" y="981" font-size="11">5 ft</text><text x="40" y="1008" font-size="12" fill="#596c6d">* Gaps measured at fixture envelopes. Tub provisional. Confirm framing, plumbing and finished dimensions.</text></g></svg>`);
 return out.join('');
}

export function fixtureCSV(objects){
 const rows=[['revision','status','id','description','type','width_in','depth_in','height_in','center_x_ft','center_z_ft','rotation_deg','fitout','dimension_basis']];
 for(const o of objects.filter(o=>o.id.startsWith('suite-')))rows.push(['Expanded suite B.3','Concept envelope; field verify',o.id,o.name,o.type,n(o.w*12),n(o.d*12),n(o.h*12),n(o.x),n(o.z),o.rotation,o.fitout||'','Local dimensions before rotation; floor-plan west/rear datum']);
 return rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
}
