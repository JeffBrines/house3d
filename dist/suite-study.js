import {suiteObjects,suiteMetrics,SUITE_REVISION,SUITE_BOUNDS} from './suite-config.js';
import {comparisonSVG,fixtureCSV,inchesLabel,escapeXML,objectBounds,bathClearances} from './suite-plan.js';
import {revisionSuiteObjects} from './revision-config.js';
import {revisionRoomTable,revisionNotes,revisionComparisonSVG,revisionReviewHTML} from './revision-review.js';

const $=id=>document.getElementById(id);
const download=(name,body,type)=>{const url=URL.createObjectURL(new Blob([body],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);};
function clippedArea(poly,[x0,z0,x1,z1]){
 let p=poly;for(const [axis,value,sign] of [[0,x0,1],[0,x1,-1],[1,z0,1],[1,z1,-1]]){
  const q=[];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],ina=sign*(a[axis]-value)>=0,inb=sign*(b[axis]-value)>=0;if(ina)q.push(a);if(ina!==inb){const t=(value-a[axis])/(b[axis]-a[axis]);q.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}}p=q;
 }return Math.abs(p.reduce((a,v,i)=>a+v[0]*p[(i+1)%p.length][1]-p[(i+1)%p.length][0]*v[1],0))/2;
}
function stoolUnderTop(a,b){
 const table=a.type==='powderVanity'?a:b.type==='powderVanity'?b:null,stool=a.type==='powderStool'?a:b.type==='powderStool'?b:null;
 if(!table||!stool)return false;
 const angle=table.rotation*Math.PI/180,dx=stool.x-table.x,dz=stool.z-table.z;
 const lx=dx*Math.cos(angle)-dz*Math.sin(angle),lz=dx*Math.sin(angle)+dz*Math.cos(angle);
 return Math.abs(lx)+Math.max(stool.w,stool.d)/2<=table.w/2-.0625+.001&&lz+Math.max(stool.w,stool.d)/2<=table.d/2+.001&&stool.h<=table.h-1.25/12;
}
export function suiteFitWarnings(objects,model){
 const selected=objects.filter(o=>o.id.startsWith('suite-')&&o.type!=='suiteMirror'),warnings=[];
 for(const o of selected){
  const r=objectBounds(o);
  if(model.walls.some(p=>clippedArea(p,r)>.025))warnings.push(o.name+': footprint overlaps a wall.');
  if(!model.suiteBounds&&Math.max(0,Math.min(r[2],62.97)-Math.max(r[0],62.85))*Math.max(0,Math.min(r[3],40.167)-Math.max(r[1],37.667))>.01)warnings.push(o.name+': overlaps the open WC door.');
  const closet=o.id.includes('wardrobe')||o.type==='drawerCab'||o.type==='bench';
  const b=model.suiteBounds?.[closet?'closet':'bath']||(closet?[62.4167,19,75.5,30.6253]:[62.4167,31.0003,75.5,46.042]);
  if(r[0]<b[0]-.015||r[1]<b[1]-.015||r[2]>b[2]+.015||r[3]>b[3]+.015)warnings.push(o.name+': extends beyond the assigned room.');
  if(o.type==='wardrobe'&&o.h>3.5&&r[2]>75.45)for(const z of [27.167])if(r[1]<z+2.5&&r[3]>z-2.5)warnings.push(o.name+': tall storage crosses an existing closet window.');
 }
 for(let i=0;i<selected.length;i++)for(let j=i+1;j<selected.length;j++){
  if(stoolUnderTop(selected[i],selected[j]))continue;
  const a=objectBounds(selected[i]),b=objectBounds(selected[j]);if(Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]))>.025)warnings.push(selected[i].name+' overlaps '+selected[j].name+'.');
 }
 return [...new Set(warnings)];
}
export function studyNotes(){return `<h3>Revision B.3: wider shower and seated powder vanity</h3><p>The shower now runs from the toilet-room wall to the exterior wall: about 86½ × 54 inches at the modeled room faces, before final tile and glass detailing. The face against the toilet room is tiled. A 36-inch front entry target is shown.</p><p>The entrance nook holds a 32 × 16-inch makeup top at 30 inches high, with open knee space, a 16-inch round stool and a 24 × 30-inch mirror. There is no sink at this station. The stool tucks under the top. The bathroom doorway moves 2¼ inches toward the hall to clear the top while retaining its nominal 36-inch door size.</p><p>With the stool tucked, there is about 42¾ inches between the powder top and the end of the double vanity. A 15-inch stool pull-out leaves about 28 inches beside the double vanity at the stool footprint, so the seated position shares the entrance space. The original tub study still leaves an approximately 30-inch turn beyond the double vanity; the tub-to-shower end gap is now about 6 inches. Chalk the seated and walking positions together.</p><p>The west-sliding pocket and double-vanity plumbing still need a coordinated wall detail. Standing zones and fixture envelopes are planning aids, not code or accessibility certification.</p><h3>Bedroom → closet → bathroom</h3><p>The two small closets and the northern portion of the old bath become one large walk-in closet. The bath slides south into Bedroom 2 and part of the old bath area. There is no separate private hallway: you walk through the closet to reach the bathroom.</p><h3>Where the space goes</h3><p>The closet is about 152 square feet, with hanging storage on the north, west and east walls, south-wall shelves and low drawers beneath the retained window. The bathroom is about 173 square feet including its WC compartment and the existing east projection. It contains an 8-foot double vanity, a tub, an approximately 86½ × 54-inch shower and a seated powder vanity and an enclosed toilet.</p><h3>The tradeoff</h3><p>This uses the former hallway area as part of the two rooms. Bathroom access now passes through the closet, so anyone using the bath also passes the clothing storage. Bedroom 2 is removed from the main-floor bedroom count. The shared bathroom keeps its public-hall entrance.</p><h3>Builder and product review</h3><p>Confirm the changed partitions and openings against the actual framing. The bath moves farther from the original plumbing, so drain and vent routes need review. The existing bedroom windows become bathroom windows: the south window is in the proposed shower and needs a specific waterproofing, privacy and product-suitability solution. Provide bathroom ventilation that exhausts outside and separates moisture from the closet. Door pockets, WC swing, fixture clearances and finished dimensions remain design-review items, not construction authorization.</p>`;}
export function roomTable(){const m=suiteMetrics();return `<table><thead><tr><th>Space / feature</th><th>Proposed starting size</th><th>Measurement basis</th></tr></thead><tbody>${[
 ['Walk-in closet',`${inchesLabel(m.closetWidth)} × ${inchesLabel(m.closetDepth)} · ${m.closetArea.toFixed(0)} sq ft`,'Clear room before cabinetry'],
 ['Primary bath',`${inchesLabel(m.bathWidth)} × ${inchesLabel(m.bathDepth)} · ${m.bathArea.toFixed(0)} sq ft`,'Main rectangle plus the existing 2 ft east projection; includes WC enclosure'],
 ['Room sequence','Bedroom → closet → bathroom','No separate private hallway'],
 ['Main closet aisle','108″','Between west and east hanging units; open center'],
 ['Vanity','96″ × 24″','Two sinks; proposed envelope'],
 ['Shower',`${Number((m.showerWidth*12).toFixed(1))}″ × ${m.showerDepth*12}″`,'Wall-to-wall envelope before final tile / glass detailing'],
 ['Powder vanity','32″ × 16″ top; 30″ high','Open knee space; no sink'],
 ['Powder stool / mirror','16″ diameter × 18″ seat; 24″ × 30″ mirror','Stool shown tucked; mirror base 34″ above floor'],
 ['Tub','66″ × 32″','Representative freestanding model; exact product not selected'],
 ['Toilet room','42″ × 66″','Clear inside faces'],
 ['Doors','36″ nominal window-side bath doorway; 30″ nominal WC door','Bath pocket direction reverses; coordinate vanity plumbing. Framed gaps include a provisional jamb allowance']
 ].map(row=>'<tr>'+row.map(x=>'<td>'+escapeXML(x)+'</td>').join('')+'</tr>').join('')}</tbody></table>`;}

export function reviewHTML(svg,objects,warnings=[]){
 return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Brines expanded suite study</title><style>body{max-width:1120px;margin:36px auto;padding:0 24px;font:15px/1.6 Arial;color:#233b40}h1,h2,h3{line-height:1.3}h1{font-family:Georgia,serif;font-size:32px;font-weight:400}svg{display:block;width:100%;height:auto}table{width:100%;border-collapse:collapse;font-size:13px}td,th{border-bottom:1px solid #cbd4cf;text-align:left;padding:9px;vertical-align:top}.note{color:#667871;font-size:13px}button{padding:10px 16px;background:#244b43;color:white;border:0;border-radius:5px}.warn{background:#fff1dc;padding:15px}@media print{body{margin:0;padding:0;font-size:11px}button{display:none}svg{break-after:page;max-height:9.1in}table{font-size:10px}tr{break-inside:avoid}h3{break-after:avoid}@page{size:letter portrait;margin:.5in}</style><button onclick="window.print()">Print / save as PDF</button><h1>Expanded primary suite · Concept B.3</h1><p>${escapeXML(SUITE_REVISION)}. A separate alternative to the June 1 A-102 main-floor plan.</p>${svg}<h2>Room schedule</h2>${roomTable()}<p class="note">Room dimensions describe the fixed proposed walls. The plan and fixture schedule below reflect this export's fixture positions. Moving a fixture does not move its room walls.</p>${warnings.length?'<div class="warn"><strong>Layout conflicts to resolve</strong><ul>'+warnings.map(w=>'<li>'+escapeXML(w)+'</li>').join('')+'</ul></div>':''}${studyNotes()}<h2>Fixture envelopes</h2><table><thead><tr><th>ID</th><th>Description</th><th>W × D × H (in)</th><th>Center X / Z (ft)</th><th>Rotation</th></tr></thead><tbody>${objects.filter(o=>o.id.startsWith('suite-')).map(o=>`<tr><td>${escapeXML(o.id)}</td><td>${escapeXML(o.name)}</td><td>${[o.w,o.d,o.h].map(n=>(n*12).toFixed(1)).join(' × ')}</td><td>${o.x.toFixed(3)} / ${o.z.toFixed(3)}</td><td>${o.rotation}°</td></tr>`).join('')}</tbody></table><p class="note">Fixture sizes are local dimensions before rotation. Centers use the same west/rear plan datum as the walkthrough. This schedule is a space-planning handoff; it is not a cabinet cut list or fixture order.</p></html>`;
}

export function mountSuiteStudy({getDesign,getStates,models}){
 const revised=()=>getDesign()==='revised';
 const states=()=>getStates(),objects=()=>states()[revised()?'revised':'expanded'].main.objects;
 const svg=()=>revised()?revisionComparisonSVG(models.original.main,models.revised.main,objects(),states().original.main.objects):comparisonSVG(models.original.main,models.expanded.main,objects(),states().original.main.objects);
 const warnings=()=>suiteFitWarnings(objects(),models[revised()?'revised':'expanded'].main);
 const render=()=>{
  $('suiteReviewTitle').textContent=revised()?'Original plan / October 6 revision':'Original plan / Earlier suite study B.3';
  $('suiteComparison').innerHTML=svg();$('suiteRoomTable').innerHTML=revised()?revisionRoomTable():roomTable();$('suiteNotes').innerHTML=revised()?revisionNotes():studyNotes();
  $('suiteReviewConflicts').replaceChildren();for(const w of warnings()){const li=document.createElement('li');li.textContent=w;$('suiteReviewConflicts').append(li);}
  $('suiteConflictSection').hidden=!warnings().length;
 };
 $('suiteReview').onclick=()=>{render();$('suiteDialog').showModal();};
 $('suiteSVG').onclick=()=>download(revised()?'brines-rev1-comparison.svg':'brines-suite-comparison.svg',svg(),'image/svg+xml');
 $('suiteCSV').onclick=()=>download(revised()?'brines-rev1-fixtures.csv':'brines-suite-fixture-envelopes.csv','\ufeff'+fixtureCSV(objects()),'text/csv;charset=utf-8');
 $('suitePrint').onclick=()=>download(revised()?'brines-rev1-review.html':'brines-suite-review.html',revised()?revisionReviewHTML(svg(),revisionRoomTable(),revisionNotes(),objects()):reviewHTML(svg(),objects(),warnings()),'text/html');
 const refresh=()=>{
  const expanded=getDesign()!=='original';$('suiteCloset').textContent=expanded?'Walk the closet':'Walk Bedroom 2';$('suiteSummary').textContent=revised()?'October 6 plan: bedroom → walk-in closet → primary bath. Updated partitions and fixture footprints.':expanded?'Earlier B.3 study: wider shower and seated powder vanity.':'Original arrangement: Bedroom 2 and the two smaller primary closets.';
  const w=warnings(),cl=bathClearances(objects());$('suiteFitStatus').textContent=w.length?w.length+' fixture conflict'+(w.length===1?'':'s')+' to review':cl?'Vanity / tub gap: '+Math.round(cl.cornerGapIn)+'″ · check circulation':'Tub layout needs review';$('suiteFitStatus').classList.toggle('conflict',!!w.length);
  const defaults=revised()?revisionSuiteObjects:suiteObjects;
  const changed=objects().filter(o=>o.id.startsWith('suite-')).some(o=>{const base=defaults.find(b=>b.id===o.id);return !base||['x','z','w','d','h','rotation'].some(k=>o[k]!==base[k]);})||objects().filter(o=>o.id.startsWith('suite-')).length!==defaults.length;
  $('suiteEdited').hidden=!changed;$('suiteEdited').textContent='Fixtures edited. Open the comparison to review current positions; room dimensions stay fixed.';
 };
 refresh();return {refresh};
}
