import {KITCHEN_DATUM as D,kitchenLayout,kitchenUppers} from './kitchen-engine.js';
import {cabinetSpecifications,designIdentifier} from './kitchen-specs.js';
import {makerSettings} from './kitchen-settings.js?v=details-5';
export const escapeMarkup=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const inch=n=>Number(Number(n).toFixed(4))+' in';
const e=escapeMarkup;
const text=(x,y,t,size=14,anchor='middle')=>`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="#223e48">${e(t)}</text>`;
const rect=(x,y,w,h,fill='#ddd0ba')=>`<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${Math.max(0,h)}" fill="${fill}" stroke="#51636b" stroke-width="1"/>`;
const line=(a,b,c,d)=>`<path d="M${a} ${b}L${c} ${d}" fill="none" stroke="#6b858e"/>`;
export function dimH(x1,x2,y,label){return line(x1,y,x2,y)+line(x1,y-5,x1,y+5)+line(x2,y-5,x2,y+5)+text((x1+x2)/2,y-8,label,13);}
export function dimV(x,y1,y2,label){return line(x,y1,x,y2)+line(x-5,y1,x+5,y1)+line(x-5,y2,x+5,y2)+`<text transform="translate(${x-8} ${(y1+y2)/2}) rotate(-90)" text-anchor="middle" font-size="13" fill="#223e48">${e(label)}</text>`;}
const begin=(title,id,height=650)=>`<svg class="makerDrawing" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${height}" role="img" aria-label="${e(title)}"><rect width="1000" height="${height}" fill="#fbfcfa"/><g font-family="Arial,sans-serif">${text(35,32,title,22,'start')}${text(35,56,id+' | Written inches govern | Design review / quote',13,'start')}`;
const end='</g></svg>';
export function caseSheetSVG(c,fronts=[],design=''){
 const w=c.assembly_width_in,h=c.case_height_in,d=c.case_depth_in,bottom=c.case_bottom_aff_in||0,scale=Math.min(6.2,390/w,305/(h+bottom)),x=100,y=410,Y=v=>y-v*scale;
 const sheetHeight=Math.max(760,650+fronts.length*24);let s=begin(c.cabinet_id+' | '+c.function,design,sheetHeight);
 s+=text(x+w*scale/2,90,'FRONT ELEVATION',14)+rect(x,Y(bottom+h),w*scale,h*scale);
 if(c.toe_height_in>0)s+=rect(x+4,Y(bottom),w*scale-8,bottom*scale,'#9eaba5');
 for(const f of fronts){s+=rect(x+(w/2+f.x-f.width/2)*scale,Y(f.y+f.height/2),f.width*scale,f.height*scale,'#e9dfce');if(f.pulls)s+=line(x+(w/2+f.x)*scale-12,Y(f.pull_center_aff_in??f.pullY??f.y),x+(w/2+f.x)*scale+12,Y(f.pull_center_aff_in??f.pullY??f.y));}
 s+=dimH(x,x+w*scale,445,inch(w)+' case width')+dimV(x-25,Y(bottom+h),Y(bottom),inch(h)+' case')+dimV(x-55,Y(bottom+h),y,inch(bottom+h)+' top AFF');
 const sx=635,ss=Math.min(5.5,260/d,305/(h+bottom));s+=text(sx+d*ss/2,90,'CASE SIDE',14)+rect(sx,y-(bottom+h)*ss,d*ss,h*ss,'#e5e8e2');
 if(c.toe_height_in>0)s+=rect(sx+(c.toe_recess_in||3)*ss,y-bottom*ss,(d-(c.toe_recess_in||3))*ss,bottom*ss,'#9eaba5');
 s+=dimH(sx,sx+d*ss,445,inch(d)+' case depth')+text(35,490,'Case '+inch(w)+' W x '+inch(h)+' H x '+inch(d)+' D. Bottom '+inch(bottom)+' AFF.',15,'start');
 s+=text(35,515,'Front '+inch(c.front_thickness_in??.75)+' | Side '+inch(c.case_side_thickness_in??.75)+' | Back '+inch(c.back_thickness_in??.5)+' | Reveal '+inch(c.front_reveal_in??.125),14,'start');
 s+=text(35,550,'FINISHED FRONTS | width x height x thickness | hinge | bottom AFF',14,'start');
 fronts.forEach((f,i)=>{s+=text(35,580+i*24,f.id+' | '+[f.width,f.height,f.thickness].map(v=>Number(v.toFixed(4))).join(' x ')+' in | '+(f.hinge||'n/a')+' | '+inch(f.y-f.height/2),14,'start');});
 s+=text(35,sheetHeight-55,'Depth excludes fronts and pulls. AFF = above finished floor. Top and support are separate.',13,'start');
 s+=text(35,sheetHeight-25,'Field dimensions, selected hardware, joinery and shop drawings must be approved before cutting.',13,'start');return s+end;
}
export function cabinetDetailSheets(k){const spec=cabinetSpecifications(k),id=designIdentifier(k);return '<section class="cabinetSheet">'+cornerSheetSVG(k)+'</section>'+spec.cabinets.filter(c=>c.run!=='corner').map(c=>`<section class="cabinetSheet">${caseSheetSVG(c,spec.fronts.filter(f=>f.cabinet===c.cabinet_id),id)}<table><thead><tr><th>Front ID</th><th>Function</th><th>Finished W x H x T (in)</th><th>Hinge</th></tr></thead><tbody>${spec.fronts.filter(f=>f.cabinet===c.cabinet_id).map(f=>`<tr><td>${e(f.id)}</td><td>${e(f.kind)}</td><td>${[f.width,f.height,f.thickness].map(v=>Number(v.toFixed(4))).join(' x ')}</td><td>${e(f.hinge||'n/a')}</td></tr>`).join('')}</tbody></table></section>`).join('');}
export function dimensionedKitchenPlan(k){
 const l=kitchenLayout(k),id=designIdentifier(k),minZ=Math.min(D.north,l.island.z-l.island.d/2),scale=Math.min(2.8,430/((Math.max(D.east,l.island.x+l.island.w/2)-D.west)*12),500/((D.south-minZ)*12)),X=x=>145+(x-D.west)*12*scale,Y=z=>110+(z-minZ)*12*scale;
 const rz=(x,z,w,d,fill)=>rect(X(x-w/2),Y(z-d/2),w*12*scale,d*12*scale,fill);
 let s=begin('KITCHEN | Cabinet plan and setting-out',id,870);
 s+=`<path d="M${X(D.west)} ${Y(D.windowCenter-2)}V${Y(D.windowCenter+2)}" stroke="#60a5b7" stroke-width="6"/>`;
 s+=line(X(D.west),Y(D.north),X(D.west),Y(D.south))+line(X(D.west),Y(D.south),X(D.east),Y(D.south));
 s+=rz(l.island.x,l.island.z,l.island.w,l.island.d,'#f2ebdd');
 for(const u of l.units){const a=u.run!=='south';s+=`<g data-cabinet="${e(u.id.slice(2))}" tabindex="0" role="button" aria-label="${e(u.name)} ${inch(u.width)}">${rz(u.x,u.z,a?u.d:u.w,a?u.w:u.d,['range','fridge','dishwasher'].includes(u.unitType)?'#d5e4e9':'#ded0b8')}${u.width>=8?text(X(u.x),Y(u.z)-5,u.id.slice(2),13)+text(X(u.x),Y(u.z)+14,inch(u.width),12):''}</g>`;}
 s+=rz(D.west+k.baseDepth/24,D.south-k.corner/24,k.baseDepth/12,k.corner/12,'#b9c6c3');
 if(k.corner>k.baseDepth)s+=rz(D.west+(k.corner+k.baseDepth)/24,D.south-k.baseDepth/24,(k.corner-k.baseDepth)/12,k.baseDepth/12,'#b9c6c3');
 s+=text(X(D.west+k.baseDepth/24),Y(D.south-k.corner/24),'C01',14);
 s+=dimH(X(D.west),X(D.east),Y(D.south)+40,inch((D.east-D.west)*12)+' wall run');
 s+=dimV(75,Y(D.north),Y(D.south),inch((D.south-D.north)*12)+' wall run');
 s+=dimH(X(l.island.x-l.island.w/2),X(l.island.x+l.island.w/2),85,inch(k.islandWidth)+' island top');
 s+=dimV(X(l.island.x+l.island.w/2)+35,Y(l.island.z-l.island.d/2),Y(l.island.z+l.island.d/2),inch(k.islandLength)+' top');
 s+=dimH(X(D.west+k.counterDepth/12),X(l.island.x-l.island.w/2),Y(l.island.z),inch(l.clearance.west));
 s+=dimV(X(l.island.x),Y(l.island.z+l.island.d/2),Y(D.south-k.counterDepth/12),inch(l.clearance.south));
 s+=text(650,170,'C01 CORNER',16,'start')+text(650,195,inch(k.corner)+' x '+inch(k.corner)+' envelope',14,'start')+text(650,218,k.cornerStyle==='piecut'?'Accessible L-shaped case':'Closed support / no cabinet',14,'start')+text(650,242,inch(k.baseDepth)+' deep return arms',14,'start');
 s+=text(650,292,'DEPTHS',16,'start')+text(650,317,'Base case: '+inch(k.baseDepth),14,'start')+text(650,340,'Perimeter top: '+inch(k.counterDepth),14,'start')+text(650,363,'Upper cases: 12 in',14,'start')+text(650,386,'Seating overhang: '+inch(k.seatingOverhang),14,'start');
 s+=text(650,445,'STARTING DATUM',16,'start')+text(650,470,'Window wall X = 28.5 ft',14,'start')+text(650,493,'Range wall Y = 25.125 ft',14,'start')+text(650,516,'Window run begins Y = 11 ft',14,'start');
 let row=Y(D.south)+83;for(const run of ['west','south','island']){s+=text(45,row,run.toUpperCase()+': '+k[run].map(u=>u.id+' '+Number(u.width.toFixed(4))+'"').join(' | '),13,'start');row+=26;}
 s+=text(45,830,'Each ID has a measured elevation, case schedule and finished-front schedule. Widths include fillers separately.',13,'start');return s+end;
}
export function dimensionedElevation(k,run){
 const l=kitchenLayout(k),spec=cabinetSpecifications(k),m=makerSettings(k),units=l.units.filter(u=>u.run===run),length=run==='west'?l.westAvailable:run==='south'?l.southAvailable:l.islandAvailable,scale=Math.min(5.1,775/length),vs=Math.min(3.65,330/Math.max(k.upperBottom+k.upperHeight,...units.map(u=>u.h*12))),x=105,y=465,Y=v=>y-v*vs,S=(a,w)=>run==='island'?a:length-a-w;
 let s=begin(({west:'WINDOW WALL / W',south:'RANGE WALL / S',island:'ISLAND / I'}[run])+' | Front elevation | '+(run==='west'?'Front to back':run==='south'?'North to south':'Back to front'),designIdentifier(k),690);
 s+=line(55,y,930,y)+dimH(x,x+length*scale,95,inch(length)+' run allocation');
 for(const u of units){s+=rect(x+S(u.start,u.width)*scale,Y(u.h*12),u.width*scale,u.h*12*vs,['fridge','range','dishwasher'].includes(u.unitType)?'#d5e4e9':'#d0c2ac');if(u.width>=6){s+=text(x+(S(u.start,u.width)+u.width/2)*scale,491,u.id.slice(2),13)+dimH(x+S(u.start,u.width)*scale,x+(S(u.start,u.width)+u.width)*scale,525,inch(u.width));}}
 if(run==='west'){const wx=x+S((D.windowCenter-D.north)*12-24,48)*scale;s+=rect(wx,Y(96),48*scale,54*vs,'#e5f0f1')+text(wx+24*scale,Y(96)+18,'48 in source window',12);}
 if(run==='south')for(const u of units.filter(u=>u.unitType==='range')){s+=rect(x+S(u.start,u.width)*scale,Y(84),u.width*scale,12*vs,'#bcc8c7')+text(x+(S(u.start,u.width)+u.width/2)*scale,Y(84)-8,'Hood, mounting TBD',12);}
 for(const c of spec.cabinets.filter(c=>c.run===run||c.run===run+' upper')){
  const u=units.find(u=>u.id.slice(2)===c.cabinet_id||u.id.slice(2)+'-BR'===c.cabinet_id),start=u?u.start+(c.cabinet_id.endsWith('-BR')?.75:0):run==='west'?(c.center_y_ft-D.north)*12-c.assembly_width_in/2:(c.center_x_ft-D.west)*12-c.assembly_width_in/2-k.corner;
  const drawnStart=S(start,c.assembly_width_in);s+=rect(x+drawnStart*scale,Y(c.case_top_aff_in),c.assembly_width_in*scale,c.case_height_in*vs);
  for(const f of spec.fronts.filter(f=>f.cabinet===c.cabinet_id))s+=rect(x+(drawnStart+c.assembly_width_in/2+f.x-f.width/2)*scale,Y(f.y+f.height/2),f.width*scale,f.height*vs,'#ece1ce');
  if(c.run.endsWith('upper'))s+=text(x+(drawnStart+c.assembly_width_in/2)*scale,Y(c.case_top_aff_in)-7,c.cabinet_id+' '+inch(c.assembly_width_in),12);
 }
 s+=dimV(60,Y(k.baseHeight),y,inch(k.baseHeight)+' base assembly');
 if(run!=='island')s+=dimV(930,Y(k.upperBottom+k.upperHeight),Y(k.upperBottom),inch(k.upperHeight)+' upper');
 s+=text(45,566,'Case depth '+inch(k.baseDepth)+' | Case height '+inch(k.baseHeight-m.toeHeight)+' | Toe '+inch(m.toeHeight)+' | Top AFF '+inch(l.top),14,'start');
 s+=text(45,595,run==='island'?'Cabinets open toward the working aisle. The seating side is a finished panel.':'Upper bottom '+inch(k.upperBottom)+' AFF | Upper case depth 12 in | Front thickness '+inch(m.frontThickness),14,'start');
 s+=text(45,624,'Small panels / fillers: '+(units.filter(u=>u.width<6).map(u=>u.id.slice(2)+' = '+inch(u.width)).join(' | ')||'none'),13,'start');
 s+=text(45,658,'Front and case detail sheets supply individual heights, depths, reveals and door / drawer sizes.',13,'start');return s+end;
}

export function cornerSheetSVG(k){
 const spec=cabinetSpecifications(k),m=makerSettings(k),accessible=k.cornerStyle==='piecut',c=k.corner,d=k.baseDepth,scale=Math.min(9,400/c),x=95,y=120,X=v=>x+v*scale,Y=v=>y+v*scale,fs=spec.fronts.filter(f=>f.cabinet==='C01');
 let s=begin('C01 | '+(accessible?'Accessible L-shaped corner':'Closed support corner'),designIdentifier(k),760);
 s+=`<path d="M${X(0)} ${Y(0)}H${X(d)}V${Y(c-d)}H${X(c)}V${Y(c)}H${X(0)}Z" fill="#d1ddcf" stroke="#47636b" stroke-width="2"/>`;
 s+=dimH(X(0),X(c),Y(c)+38,inch(c)+' envelope')+dimV(65,Y(0),Y(c),inch(c))+dimH(X(0),X(d),95,inch(d)+' return depth');
 s+=dimH(X(d),X(c),Y(c-d)-22,inch(c-d)+' notch')+dimV(X(c)+30,Y(0),Y(c-d),inch(c-d)+' notch');
 if(accessible)s+=`<path d="M${X(d)} ${Y(0)}V${Y(c-d)}H${X(c)}" fill="none" stroke="#9a6d36" stroke-width="5"/>`;
 s+=text(600,142,'PLAN GEOMETRY',17,'start')+text(600,173,'Two '+inch(d)+' deep arms',14,'start')+text(600,200,'Case top '+inch(k.baseHeight)+' AFF',14,'start')+text(600,227,'Toe '+inch(m.toeHeight)+' high',14,'start')+text(600,254,accessible?'L-shaped case, not a square box':'Closed area, no usable storage',14,'start');
 s+=text(35,535,accessible?'PROVISIONAL FINISHED DOOR FACES':'COUNTER SUPPORT / CLOSED FRONTS',16,'start');
 if(accessible)fs.forEach((f,i)=>{s+=text(35,568+i*28,f.id+' | '+inch(f.width)+' W x '+inch(f.height)+' H x '+inch(f.thickness)+' T',15,'start');});
 else s+=text(35,568,'Carry C01 as a framing / support allowance. No cabinet or door hardware quantity is included.',14,'start');
 s+=text(35,645,accessible?'One L-shaped adjustable shelf. Select bifold hinges; resolve door overlap, reveal and swing.':'Adjacent drawers remain accessible. Maker to detail the closed fascia and stone bearing.',14,'start');
 s+=text(35,677,'Adjacent end fillers and appliance clearances are shown on the run elevations and schedules.',13,'start')+text(35,714,'Design review / quote. Corner fronts are not final cutting sizes until the mechanism is selected.',13,'start');return s+end;
}
