// Inches throughout. A plan-fit screen, not a verified stair section.
export const STAIR_ASSUMPTIONS={heightMode:'ceiling',ceilingHeight:108,rise:124,assembly:16,width:42,going:10.5,maxRiser:7.5,length:132,depth:97.25,openingLength:132,openingDepth:97.25,headroomTarget:80};
export const STAIR_LIMITS={rise:[72,180],ceilingHeight:[60,168],assembly:[1,36],width:[36,60],going:[10,14],maxRiser:[6,7.75],length:[60,300],depth:[48,240],openingLength:[24,300],openingDepth:[24,240],headroomTarget:[80,100]};
export function stairStudy(input={}){
 const a={...STAIR_ASSUMPTIONS,...input};a.heightMode=input.heightMode??(Object.hasOwn(input,'rise')?'rise':'ceiling');a.openingLength=input.openingLength??a.length;a.openingDepth=input.openingDepth??a.depth;
 if(!['ceiling','rise'].includes(a.heightMode))throw Error('Choose a height measurement method.');
 for(const [key,[min,max]] of Object.entries(STAIR_LIMITS)){if((key==='rise'&&a.heightMode==='ceiling')||(key==='ceilingHeight'&&a.heightMode==='rise'))continue;if(!Number.isFinite(a[key])||a[key]<min||a[key]>max)throw Error('Enter a valid '+key+' measurement between '+min+' and '+max+' inches.');}
 a.rise=a.heightMode==='ceiling'?a.ceilingHeight+a.assembly:a.rise;
 const risers=Math.ceil(a.rise/a.maxRiser),riser=a.rise/risers,lower=Math.max(2,Math.min(risers-2,Math.floor((a.depth-a.width)/a.going)+1)),upper=risers-lower,firstRun=(upper-1)*a.going,secondRun=(lower-1)*a.going,requiredLength=firstRun+a.width,requiredDepth=secondRun+a.width,extraLength=Math.max(0,requiredLength-a.length),extraDepth=Math.max(0,requiredDepth-a.depth),headroomRisers=Math.ceil((a.headroomTarget+a.assembly)/riser),clearBelow=a.rise-a.assembly;
 // Opening and stair envelopes share the front/right (south/east) datum.
 // Full-flight coverage is conservative; a smaller opening may work only after
 // a tread-by-tread section checks headroom below remaining floor and headers.
 const openingShortLength=Math.max(0,requiredLength-a.openingLength),openingShortDepth=Math.max(0,requiredDepth-a.openingDepth),openingCoversFlights=openingShortLength<.001&&openingShortDepth<.001;
 return {...a,risers,riser,upper,lower,firstRun,secondRun,requiredLength,requiredDepth,extraLength,extraDepth,planFits:extraLength<.001&&extraDepth<.001,headroomRisers,clearBelow,openingShortLength,openingShortDepth,openingCoversFlights,needsFramingReview:true};
}
export function stairExcelInputs(a){return [a.heightMode==='rise'?2:1,a.ceilingHeight,a.assembly,a.rise,a.length,a.depth,a.openingLength,a.openingDepth,a.width,a.going,a.maxRiser,a.headroomTarget];}
