// Manufacturer drawing: Discovery-II-C installation manual 8033-352A, March 2026, p. 8.
export const DISCOVERY_II={
 id:'quadra-fire-discovery-ii',name:'Quadra-Fire Discovery II',
 width:25.5,depth:26.625,bodyHeight:38.5,collarHeight:40.375,flueDiameter:6,
 source:'https://forgenflame.com/products/quadra-fire-discovery-ii-wood-stove',
 manual:'https://downloads.hearthnhome.com/installManuals/8033-352_Discovery-II-C_Install.pdf'
};
export function upgradeDiscoveryStove(state){
 const o=state.objects.find(o=>o.id==='great-stove'&&o.type==='stove');
 if(o&&o.stoveProductRevision!=='discovery-ii-2026-11-01'){
  Object.assign(o,{name:DISCOVERY_II.name,stoveModel:DISCOVERY_II.id,w:DISCOVERY_II.width/12,d:DISCOVERY_II.depth/12,h:DISCOVERY_II.bodyHeight/12,stoveSideFinish:'#292b2b',stoveProductRevision:'discovery-ii-2026-11-01'});
 }
 return state;
}
