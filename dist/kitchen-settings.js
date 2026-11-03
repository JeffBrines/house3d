export const FIXTURE_DEFAULTS={faucetFinish:'steel',sinkFinish:'steel',pullStyle:'bar',faucetStyle:'arc'};
export const fixtureSettings=k=>({...FIXTURE_DEFAULTS,...k.fixtures});
// Explicit design intent. These settings do not imply manufacturer approval.
export const MAKER_DEFAULTS={caseMaterial:'maple-ply',caseThickness:.75,backThickness:.5,shelfThickness:.75,frontThickness:.75,toeHeight:4.5,toeRecess:3,reveal:.125,stileWidth:2.25,topDrawer:6,drawerSide:.625,drawerBottom:.375,runnerLength:21,finish:'rift-oak',interior:'Clear finished maple',finishNote:'Approve physical stain and sheen sample before finishing.',joinery:'Maker to submit case joinery, drawer joinery and fixing details.',pullCenters:5,fridgePanelDepth:24,fridgeClearHeight:72,projectName:'Brines Residence',revision:'Kitchen review 01'};
export const STONE_DEFAULTS={material:'quartz',product:'TBD: manufacturer, color, slab lot and finish',slabMm:30,edge:'eased',edgeDrop:2,finish:'honed',backsplash:'full',splashMaterial:'match',splashHeight:18,splashThickness:.375,rangeSplash:true,hoodBottom:72,waterfall:'none',sinkWidth:30,sinkDepth:18,sinkBowlDepth:9,faucetHoles:1,faucetHoleDiameter:1.375,cutoutNote:'Placeholder only. Obtain sink DXF/template, reveal, corner radii and faucet/shop-hole locations.',vein:'length',wastePercent:15};
export const STONE_EDGES=[['eased','Eased edge'],['bevel','Small bevel'],['half-bullnose','Half bullnose'],['miter','Mitered thick edge']];
export const SPLASH_STYLES=[['none','No backsplash'],['low','Low upstand'],['full','To underside of uppers']];
export const SPLASH_MATERIALS=[['match','Matching slab'],['tile-stack','Stacked warm-white tile'],['tile-offset','Offset warm-white tile']];
export const FINISHES=[['rift-oak','Rift white oak / matte clear'],['walnut','Walnut / matte clear'],['paint','Painted warm white']];
export const makerSettings=k=>({...MAKER_DEFAULTS,...k.maker});
export const stoneSettings=k=>({...STONE_DEFAULTS,...k.stone});
export function islandInsets(k){const s=stoneSettings(k),overhang=Math.max(.75,s.slabMm/25.4);return {north:.75+(s.waterfall==='none'?.75:overhang),south:.75+(s.waterfall==='both'?overhang:.75)};}
export function setKitchenValue(k,path,value){const old=islandInsets(k),[section,key]=path.split('.');if(key){k[section]??={};k[section][key]=value;}else k[section]=value;if(['stone.waterfall','stone.slabMm'].includes(path)){const next=islandInsets(k);for(const [end,index] of [['north',0],['south',k.island.length-1]]){const u=k.island[index],delta=next[end]-old[end];if(u&&['drawers','doors'].includes(u.type)&&u.width-delta>=6)u.width-=delta;}}return k;}
const numeric=(o,key,min,max)=>o[key]===undefined||(typeof o[key]==='number'&&Number.isFinite(o[key])&&o[key]>=min&&o[key]<=max);
const choice=(o,key,values)=>o[key]===undefined||values.includes(o[key]);
const strings=(o,keys)=>keys.every(key=>o[key]===undefined||(typeof o[key]==='string'&&o[key].length<=1000));
export function validSpecifications(k){
 const m=k.maker||{},s=k.stone||{},f=k.fixtures||{};
 if(typeof f!=='object'||Array.isArray(f)||!choice(f,'faucetFinish',['steel','dark','brass'])||!choice(f,'sinkFinish',['steel','white','dark'])||!choice(f,'pullStyle',['bar','knob'])||!choice(f,'faucetStyle',['arc','square']))return false;
 if(typeof m!=='object'||Array.isArray(m)||typeof s!=='object'||Array.isArray(s))return false;
 return [['caseThickness',.5,1],['backThickness',.25,.75],['shelfThickness',.5,1],['frontThickness',.5,1.25],['toeHeight',3,6],['toeRecess',2,5],['reveal',.0625,.25],['stileWidth',1,3.5],['topDrawer',4,10],['drawerSide',.5,.75],['drawerBottom',.25,.75],['runnerLength',12,27],['pullCenters',3,12],['fridgePanelDepth',20,30],['fridgeClearHeight',66,84]].every(a=>numeric(m,...a))&&choice(m,'caseMaterial',['maple-ply','birch-ply'])&&choice(m,'finish',FINISHES.map(x=>x[0]))&&strings(m,['interior','finishNote','joinery','projectName','revision'])&&[['slabMm',12,40],['edgeDrop',1.5,4],['splashHeight',2,36],['splashThickness',.25,1.5],['hoodBottom',60,90],['sinkWidth',18,42],['sinkDepth',12,24],['sinkBowlDepth',6,12],['faucetHoles',0,5],['faucetHoleDiameter',.5,2],['wastePercent',0,40]].every(a=>numeric(s,...a))&&choice(s,'edge',STONE_EDGES.map(x=>x[0]))&&choice(s,'backsplash',SPLASH_STYLES.map(x=>x[0]))&&choice(s,'splashMaterial',SPLASH_MATERIALS.map(x=>x[0]))&&choice(s,'material',['quartz','quartzite','granite','porcelain'])&&choice(s,'finish',['honed','polished'])&&choice(s,'waterfall',['none','north','both'])&&choice(s,'vein',['length','width'])&&strings(s,['product','cutoutNote'])&&(s.rangeSplash===undefined||typeof s.rangeSplash==='boolean')&&['west','south','island'].every(run=>Array.isArray(k[run])&&k[run].every(u=>u&&typeof u==='object'&&choice(u,'drawerLayout',['two','three','four'])&&choice(u,'hinge',['auto','left','right'])&&strings(u,['use','notes'])));
}

// Finished front sizes, including the chosen outer and inter-front reveals.
// This same function supplies 3D fronts, elevations and the CSV.
export function cabinetFronts(k,{id,width,height,type,bottom=0,drawerLayout='three',hinge='auto'}){
 const m=makerSettings(k),r=m.reveal,w=width-2*r,h=height-2*r,fronts=[];
 const add=(suffix,kind,ww,hh,x,y,hand='')=>fronts.push({id:id+'-'+suffix,cabinet:id,kind,width:ww,height:hh,thickness:m.frontThickness,x,y:bottom+y,hinge:hand,pulls:kind==='false-front'?0:1,pullY:kind==='pull-out'?bottom+height-r-m.topDrawer/2:kind==='door'?bottom+y+(type==='upper'||type==='bridge'?-hh/2+2.64:hh/2-2.64):bottom+y});
 if(type==='drawers'){
  const count=drawerLayout==='two'?2:drawerLayout==='four'?4:3;
  const heights=count===2?[h/2-r/2,h/2-r/2]:[m.topDrawer,...Array(count-1).fill((h-m.topDrawer-(count-1)*r)/(count-1))];
  let top=height-r;heights.forEach((hh,i)=>{add('D'+(i+1),'drawer',w,hh,0,top-hh/2);top-=hh+r;});
 }else if((type==='trash'||type==='pullout'))add('P1','pull-out',w,h,0,height/2);
 else{
  let doorH=h,doorBottom=r;
  if(type==='sink'){add('FF','false-front',w,m.topDrawer,0,height-r-m.topDrawer/2);doorH=h-m.topDrawer-r;}
  const count=width>24?2:1,dw=(w-(count-1)*r)/count;
  for(let i=0;i<count;i++)add('F'+(i+1),'door',dw,doorH,-w/2+dw/2+i*(dw+r),doorBottom+doorH/2,count===2?(i===0?'left':'right'):hinge==='right'?'right':'left');
 }
 return fronts;
}
