// Owner direction: two island pendants, one fixture over the dining table.
const REVISION='two-island-one-table-2026-11-01';
const islandLight=l=>l.type==='pendant'&&(l.zone==='island'||l.name.startsWith('Island pendant'));
const diningLight=l=>l.type==='pendant'&&(l.zone==='dining'||l.name==='Dining pendant');
export function syncKitchenPendants(state,layout){
 const k=state.kitchen,table=state.objects.find(o=>o.id==='dining');
 if(state.pendantLayoutRevision!==REVISION){
  const previous=state.lights.filter(islandLight),pair=previous.length>2?[previous[0],previous.at(-1)]:previous;
  const dining=state.lights.find(diningLight);
  state.lights=state.lights.filter(l=>!islandLight(l)&&!diningLight(l));
  const make=(id,name,y)=>({id,name,type:'pendant',x:0,z:0,y,kelvin:3000,power:800,on:true});
  for(let i=0;i<2;i++){
   const light=pair[i]??make('k-island-pendant-'+(i+1),'Island pendant '+(i+1),6.6);
   light.name='Island pendant '+(i+1);light.x=light.anchorX=layout.island.x;light.z=light.anchorZ=layout.island.z+(i-.5)*layout.island.d*.5;state.lights.push(light);
  }
  if(table||dining){const light=dining??make('k-dining-pendant','Dining pendant',6.4);if(table){light.x=light.anchorX=table.x;light.z=light.anchorZ=table.z;}state.lights.push(light);}
  if(!['opal','glass','dome'].includes(k.islandLighting))k.islandLighting='opal';
  if(!k.diningLighting||k.diningLighting==='none')k.diningLighting='drum';
  state.pendantLayoutRevision=REVISION;
 }
 const island=state.lights.filter(islandLight);
 island.forEach((light,i)=>{const x=layout.island.x,z=layout.island.z+(i-(island.length-1)/2)*layout.island.d*.5;light.zone='island';light.style=k.islandLighting;light.styleIndex=i;light.x+=x-light.anchorX;light.z+=z-light.anchorZ;light.anchorX=x;light.anchorZ=z;});
 for(const light of state.lights.filter(diningLight)){light.zone='dining';light.style=k.diningLighting;if(table){light.x+=table.x-light.anchorX;light.z+=table.z-light.anchorZ;light.anchorX=table.x;light.anchorZ=table.z;}}
}
