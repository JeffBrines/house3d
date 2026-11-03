export const CORNER_OPTIONS=[['piecut','36-inch accessible corner cabinet'],['closed','Compare closed corner']];
export function cornerInfo(k){
 const accessible=k.cornerStyle==='piecut';
 return {accessible,span:k.corner,depth:k.baseDepth,door:Math.max(0,k.corner-k.baseDepth),name:accessible?'L-shaped corner cabinet with bifold doors':'Closed corner with supported countertop',note:accessible?'Usable corner storage with an L-shaped shelf and folding doors. The neighboring drawer bases are sized to keep both runs fitted. Select the hinge before finalizing door sizes.':'This comparison closes off the corner. The inaccessible space is counted as framing, not a cabinet.'};
}
// Upgrade the former closed-corner proposal without replacing customized runs.
export function upgradeCorner(k){
 if((k.designRevision||0)>=4)return k;
 if(k.cornerStyle!=='piecut'){
  const old=k.corner;k.corner=Math.max(old,36,k.baseDepth+12);k.cornerStyle='piecut';
  const delta=Math.max(0,k.corner-old);
  for(const run of ['west','south']){
   let remaining=delta;
   const first=k.south[0];
   if(run==='south'&&first?.id==='S01'&&first.type==='pullout'&&first.width===9&&remaining>0){const take=Math.min(remaining,6);first.type='filler';first.width-=take;first.use='Corner door and range clearance';remaining-=take;}
   const candidates=k[run].filter(u=>['drawers','doors'].includes(u.type));if(run==='west')candidates.reverse();
   for(const u of candidates){if(remaining<=0)break;const take=Math.min(remaining,Math.max(0,u.width-12));u.width-=take;remaining-=take;}
   // Any unresolved overrun remains visible in the existing fit warnings.
  }
 }
 k.designRevision=4;return k;
}
export function applyCornerOption(k,style){
 if(!CORNER_OPTIONS.some(v=>v[0]===style))throw Error('Unknown corner option');
 k.cornerStyle=style;k.corner=style==='piecut'?36:28.5;
 const unit=(id,type,width,use)=>({id,type,width,use});
 k.west=[unit('W01','panel',.75),unit('W02','filler',2.25),unit('W03','drawers',33,'Cutlery and everyday dishes'),unit('W04','dishwasher',24),unit('W05','sink',36),unit('W06','trash',18),unit('W07','drawers',style==='piecut'?19.5:27,'Bowls and food storage')];
 k.south=[unit('S01',style==='piecut'?'filler':'pullout',style==='piecut'?3:9,'Spices, oils and upright trays'),unit('S02','range',36),unit('S03','drawers',style==='piecut'?16.5:18,'Cooking utensils'),unit('S04','fridge',37.5),unit('S05','filler',3)];
 k.rangeModel='wolf36';k.rangeDepth=29.5;
 return k;
}
