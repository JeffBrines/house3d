import {KITCHEN_DATUM as D,kitchenLayout,kitchenUppers} from './kitchen-engine.js';
import {stoneSettings} from './kitchen-settings.js?v=details-5';
const round=n=>Math.round(n*1e6)/1e6;
const contains=(r,x,z)=>x>r.x1-1e-7&&x<r.x2+1e-7&&z>r.z1-1e-7&&z<r.z2+1e-7;
const rect=(x,z,w,d)=>({x1:round((x-D.west)*12-w/2),x2:round((x-D.west)*12+w/2),z1:round((z-D.north)*12-d/2),z2:round((z-D.north)*12+d/2)});
const pointKey=p=>p.map(round).join(',');

// Exact union of axis-aligned rectangles. Internal module joints never become
// countertop seams or billable finished edges. Coordinates are inches from the
// finished west face / north start datum, east and south positive.
export function unionRectangles(rectangles){
 if(!rectangles.length)return [];
 const xs=[...new Set(rectangles.flatMap(r=>[r.x1,r.x2]))].sort((a,b)=>a-b),zs=[...new Set(rectangles.flatMap(r=>[r.z1,r.z2]))].sort((a,b)=>a-b),cells=new Map();
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++)if(rectangles.some(r=>contains(r,(xs[i]+xs[i+1])/2,(zs[j]+zs[j+1])/2)))cells.set(i+','+j,{i,j});
 const groups=[];
 while(cells.size){const start=cells.keys().next().value,queue=[cells.get(start)],group=[];cells.delete(start);
  for(let q=0;q<queue.length;q++){const c=queue[q];group.push(c);for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const key=(c.i+di)+','+(c.j+dj);if(cells.has(key)){queue.push(cells.get(key));cells.delete(key);}}}
  const occupied=new Set(group.map(c=>c.i+','+c.j)),edges=[];let area=0;
  for(const {i,j} of group){const x1=xs[i],x2=xs[i+1],z1=zs[j],z2=zs[j+1];area+=(x2-x1)*(z2-z1);
   if(!occupied.has(i+','+(j-1)))edges.push({a:[x1,z1],b:[x2,z1],normal:[0,-1]});
   if(!occupied.has((i+1)+','+j))edges.push({a:[x2,z1],b:[x2,z2],normal:[1,0]});
   if(!occupied.has(i+','+(j+1)))edges.push({a:[x2,z2],b:[x1,z2],normal:[0,1]});
   if(!occupied.has((i-1)+','+j))edges.push({a:[x1,z2],b:[x1,z1],normal:[-1,0]});
  }
  const byStart=new Map(edges.map(e=>[pointKey(e.a),e])),loops=[];
  while(byStart.size){const first=byStart.values().next().value,loop=[];let e=first;
   do{loop.push(e.a);byStart.delete(pointKey(e.a));e=byStart.get(pointKey(e.b));}while(e&&e!==first);
   // Keep only corners. Collinear grid subdivisions are implementation detail.
   loops.push(loop.filter((p,i)=>{const a=loop[(i+loop.length-1)%loop.length],b=loop[(i+1)%loop.length];return Math.abs((p[0]-a[0])*(b[1]-p[1])-(p[1]-a[1])*(b[0]-p[0]))>1e-6;}));
  }
  groups.push({area:round(area),loops,edges});
 }
 return groups;
}
function mergeEdges(edges){const groups=new Map();for(const e of edges){const horizontal=e.a[1]===e.b[1],axis=horizontal?0:1,fixed=e.a[1-axis],a=Math.min(e.a[axis],e.b[axis]),b=Math.max(e.a[axis],e.b[axis]);const key=[horizontal,fixed,e.kind,e.treatment,e.normal.join('/')].join('|');if(!groups.has(key))groups.set(key,{horizontal,fixed,kind:e.kind,treatment:e.treatment,normal:e.normal,spans:[]});groups.get(key).spans.push([a,b]);}
 const result=[];for(const g of groups.values()){const spans=g.spans.sort((a,b)=>a[0]-b[0]),merged=[];for(const span of spans){const last=merged.at(-1);if(last&&Math.abs(last[1]-span[0])<1e-5)last[1]=span[1];else merged.push([...span]);}for(const [a,b] of merged)result.push({kind:g.kind,treatment:g.treatment,normal:g.normal,a:g.horizontal?[a,g.fixed]:[g.fixed,a],b:g.horizontal?[b,g.fixed]:[g.fixed,b],length:round(b-a)});}
 return result;
}
export function stoneLayout(k){
 const l=kitchenLayout(k),s=stoneSettings(k),rects=[],appliances=[],southZ=(D.south-D.north)*12;
 for(const u of l.units){if(['range','fridge'].includes(u.unitType)||u.tallFill){appliances.push({...rect(u.x,u.z,u.run==='south'?u.width:u.d*12,u.run==='south'?u.d*12:u.width),id:u.id});continue;}if(u.run==='island')continue;
  const r=u.run==='west'?rect(D.west+k.counterDepth/24,u.z,k.counterDepth,u.width):rect(u.x,D.south-k.counterDepth/24,u.width,k.counterDepth);rects.push(r);
 }
 // The closed corner reserves run length, but follows the L-shaped counter depth.
 rects.push({x1:0,x2:k.counterDepth,z1:southZ-k.corner,z2:southZ});if(k.corner>k.counterDepth)rects.push({x1:k.counterDepth,x2:k.corner,z1:southZ-k.counterDepth,z2:southZ});
 const islandRect=rect(l.island.x,l.island.z,k.islandWidth,k.islandLength);rects.push(islandRect);
 const sink=l.sink,cutouts=[];
 if(sink){const isWest=sink.run==='west',isIsland=sink.run==='island',cx=isIsland?sink.x-(k.counterDepth-k.baseDepth)/24:isWest?D.west+k.counterDepth/24:sink.x,cz=isWest?sink.z:isIsland?sink.z:D.south-k.counterDepth/24;
  cutouts.push({id:'CO-SINK',kind:'Undermount sink placeholder',...rect(cx,cz,isWest||isIsland?s.sinkDepth:s.sinkWidth,isWest||isIsland?s.sinkWidth:s.sinkDepth),width:s.sinkWidth,depth:s.sinkDepth,notes:s.cutoutNote});
 }
 const zones=unionRectangles(rects).map((zone,index)=>{
  const points=zone.loops.flat(),xs=points.map(p=>p[0]),zs=points.map(p=>p[1]),bounds={x1:Math.min(...xs),x2:Math.max(...xs),z1:Math.min(...zs),z2:Math.max(...zs)},island=contains(islandRect,(bounds.x1+bounds.x2)/2,(bounds.z1+bounds.z2)/2)&&zone.area===round(k.islandWidth*k.islandLength),id=island?'CT-I':'CT-P'+(index+1);
  const holes=cutouts.filter(h=>contains(bounds,h.x1,h.z1)&&contains(bounds,h.x2,h.z2)&&[h.x1,h.x2].every(x=>[h.z1,h.z2].every(z=>rects.some(r=>contains(r,x,z)))));
  const edges=mergeEdges(zone.edges.map(e=>{const mid=[(e.a[0]+e.b[0])/2,(e.a[1]+e.b[1])/2],wall=!island&&(Math.abs(mid[0])<1e-6||Math.abs(mid[1]-southZ)<1e-6),appliance=appliances.some(r=>contains(r,mid[0]+e.normal[0]*.01,mid[1]+e.normal[1]*.01)),waterfall=island&&(s.waterfall!=='none'&&Math.abs(mid[1]-islandRect.z1)<1e-6||s.waterfall==='both'&&Math.abs(mid[1]-islandRect.z2)<1e-6);
   return {...e,kind:wall?'wall':waterfall?'waterfall joint':appliance?'appliance interface':'exposed',treatment:wall?'Template / scribe, seal to wall':waterfall?'Miter to waterfall, shop seam detail':appliance?'Polished square; confirm appliance fit':s.edge};
  })).map((e,i)=>({...e,id:id+'-E'+(i+1),zone:id}));
  return {id,island,...zone,bounds,width:bounds.x2-bounds.x1,length:bounds.z2-bounds.z1,holes,edges,netArea:zone.area-holes.reduce((a,h)=>a+h.width*h.depth,0),seam:'Fabricator to propose slab nesting, seam locations and vein match. Zone is not a fabrication blank.'};
 });
 const splashes=[];const addSplash=(run,a,b,bottom,top,label)=>{if(b-a<=.001||top-bottom<=.001)return;const width=b-a,windowA=(D.windowCenter-2-D.north)*12,windowB=windowA+48;
  if(run==='west'&&a<windowB&&b>windowA&&top>D.windowSill){if(a<windowA)addSplash(run,a,windowA,bottom,top,label);addSplash(run,Math.max(a,windowA),Math.min(b,windowB),bottom,Math.min(top,D.windowSill),'Below window');if(b>windowB)addSplash(run,windowB,b,bottom,top,label);return;}
  const thickness=s.splashMaterial==='match'?s.slabMm/25.4:s.splashThickness;
  splashes.push({id:'BS'+(splashes.length+1),run,start:a,end:b,width,height:top-bottom,bottom,top,thickness,material:s.splashMaterial,label,area:width*(top-bottom),cutouts:'Outlet / switch locations and exact window returns require field template.'});
 };
 if(s.backsplash!=='none'){
  const top=s.backsplash==='low'?l.top+s.splashHeight:k.upperBottom;
  // Return at the inside corner starts after west finish thickness, avoiding a double-counted corner.
  addSplash('west',0,southZ,l.top,top,'West counter wall');
  const wallRects=rects.filter(r=>Math.abs(r.z2-southZ)<1e-5&&r.x2>0),spans=wallRects.map(r=>[Math.max(r.x1,s.splashMaterial==='match'?s.slabMm/25.4:s.splashThickness),r.x2]);
  if(l.range?.run==='south')spans.push([(l.range.x-D.west)*12-l.range.width/2,(l.range.x-D.west)*12+l.range.width/2]);
  const breaks=[...new Set(spans.flat())].sort((a,b)=>a-b),segments=[];
  for(let i=0;i<breaks.length-1;i++){const a=breaks[i],b=breaks[i+1],mid=(a+b)/2;if(!spans.some(v=>mid>=v[0]&&mid<=v[1]))continue;const range=l.range?.run==='south'&&Math.abs(mid-(l.range.x-D.west)*12)<l.range.width/2;const h=range&&s.rangeSplash?s.hoodBottom:top,last=segments.at(-1);if(last&&last.top===h&&Math.abs(last.end-a)<1e-6)last.end=b;else segments.push({start:a,end:b,top:h,range});}
  segments.forEach(v=>addSplash('south',v.start,v.end,l.top,v.top,v.range?'Behind range':'South counter wall'));
 }
 const waterfalls=[];if(s.waterfall!=='none')for(const end of(s.waterfall==='both'?['north','south']:['north']))waterfalls.push({id:'WF-'+end.toUpperCase(),end,width:k.islandWidth,height:l.top-s.slabMm/25.4,thickness:s.slabMm/25.4,area:k.islandWidth*(l.top-s.slabMm/25.4),z:end==='north'?islandRect.z1+s.slabMm/50.8:islandRect.z2-s.slabMm/50.8,x:(islandRect.x1+islandRect.x2)/2,notes:'Within the top footprint. 45 degree upper seam; finished floor/template and cabinet end setback must be approved.'});
 const splashEdges=[];
 for(const run of ['west','south']){const panels=splashes.filter(b=>b.run===run),uppers=kitchenUppers(k).filter(u=>u.run===run),upperBreaks=uppers.flatMap(u=>{const center=run==='west'?(u.z-D.north)*12:(u.x-D.west)*12;return [center-u.width/2,center+u.width/2];});const pieces=unionRectangles(panels.flatMap(b=>{const cuts=[b.start,...upperBreaks.filter(x=>x>b.start&&x<b.end),b.end].sort((a,b)=>a-b);return cuts.slice(0,-1).map((x,i)=>({x1:x,x2:cuts[i+1],z1:b.bottom,z2:b.top}));}));
  for(const zone of pieces){const es=zone.edges.map(e=>{const mid=[(e.a[0]+e.b[0])/2,(e.a[1]+e.b[1])/2],horizontal=e.a[1]===e.b[1],atUpper=horizontal&&uppers.some(u=>{const center=run==='west'?(u.z-D.north)*12:(u.x-D.west)*12;return Math.abs(mid[1]-u.bottom)<.001&&mid[0]>=center-u.width/2&&mid[0]<=center+u.width/2;}),atWindow=run==='west'&&(horizontal&&Math.abs(mid[1]-D.windowSill)<.001&&mid[0]>54&&mid[0]<102||!horizontal&&(Math.abs(mid[0]-54)<.001||Math.abs(mid[0]-102)<.001)&&mid[1]>=D.windowSill),atHood=run==='south'&&horizontal&&l.range&&Math.abs(mid[1]-s.hoodBottom)<.001&&Math.abs(mid[0]-(l.range.x-D.west)*12)<l.range.width/2,atCorner=!horizontal&&(run==='west'?Math.abs(mid[0]-southZ)<.001:Math.abs(mid[0]-(panels[0]?.start||0))<.001),atFridge=!horizontal&&run==='south'&&l.fridge&&Math.abs(mid[0]-((l.fridge.x-D.west)*12-l.fridge.width/2))<.001;
   const kind=horizontal&&Math.abs(mid[1]-l.top)<.001?'counter / range joint':atWindow?'window joint':atHood?'hood joint':atUpper||atFridge?'cabinet joint':atCorner?'inside corner':'exposed';return {...e,kind,treatment:kind==='exposed'?(s.splashMaterial==='match'?'Polished eased edge; radius by fabricator':'Finished tile edge / selected trim profile'):'Template and flexible compatible sealant / termination detail'};
  });splashEdges.push(...mergeEdges(es).map((e,i)=>({...e,id:'BS-'+run+'-E'+(splashEdges.length+i+1),zone:'Backsplash '+run})));}
 }
 const sum=(a,key)=>a.reduce((n,r)=>n+r[key],0),edges=zones.flatMap(z=>z.edges),counterArea=sum(zones,'area')/144,splashArea=sum(splashes,'area')/144,waterfallArea=sum(waterfalls,'area')/144;
 return {zones,edges,cutouts,splashes,splashEdges,waterfalls,islandRect,slabThickness:s.slabMm/25.4,buildUp:k.counterThickness-s.slabMm/25.4,summary:{counterArea,netCounterArea:sum(zones,'netArea')/144,splashArea,waterfallArea,stoneArea:counterArea+waterfallArea+(s.splashMaterial==='match'?splashArea:0),tileArea:s.splashMaterial==='match'?0:splashArea,tileAllowance:s.splashMaterial==='match'?0:splashArea*(1+s.wastePercent/100),profileFeet:sum(edges.filter(e=>e.kind==='exposed'),'length')/12,applianceFeet:sum(edges.filter(e=>e.kind==='appliance interface'),'length')/12,wallFeet:sum(edges.filter(e=>e.kind==='wall'),'length')/12,waterfallJointFeet:sum(edges.filter(e=>e.kind==='waterfall joint'),'length')/12,splashExposedFeet:sum(splashEdges.filter(e=>e.kind==='exposed'),'length')/12,splashJointFeet:(sum(splashEdges.filter(e=>!['exposed','inside corner'].includes(e.kind)),'length')+Math.max(...['west','south'].map(run=>sum(splashEdges.filter(e=>e.kind==='inside corner'&&e.zone==='Backsplash '+run),'length'))))/12,waterfallExposedFeet:sum(waterfalls,'height')*2/12}};
}
