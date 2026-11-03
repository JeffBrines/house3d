import {upgradeHouseReview,removeDryBar} from './house-layout.js';
import {expandedState,upgradeSuite} from './suite-config.js';
import {revisedMainState,revisedBasementState} from './revision-config.js';

export const DESIGN_NAMES={revised:'October 6 revised plan',expanded:'Earlier suite study · B.3',original:'Original plan · June 1'};
export function createDesignStates(main,basement){
 basement=removeDryBar(structuredClone(basement));
 return {original:{main:structuredClone(main),basement:structuredClone(basement)},expanded:{main:expandedState(main),basement:structuredClone(basement)},revised:{main:revisedMainState(main),basement:revisedBasementState(basement)}};
}
export function importDesignStates(data,validate,fallbackBasement){
 const validLevels=l=>validate(l?.main)&&validate(l?.basement);
 if(data?.schema===4&&Object.keys(DESIGN_NAMES).every(id=>validLevels(data.designs?.[id]))&&Object.hasOwn(DESIGN_NAMES,data.design)){
  const designs=structuredClone(data.designs);designs.revised.main=upgradeHouseReview(designs.revised.main,'main');designs.revised.basement=upgradeHouseReview(designs.revised.basement,'basement');for(const levels of Object.values(designs))removeDryBar(levels.basement);return {design:data.design,designs};
 }
 if(data?.schema===3&&['original','expanded'].every(id=>validLevels(data.designs?.[id]))&&Object.hasOwn(DESIGN_NAMES,data.design)){
  const designs=structuredClone(data.designs);for(const levels of Object.values(designs))removeDryBar(levels.basement);designs.expanded.main=upgradeSuite(designs.expanded.main);designs.revised={main:revisedMainState(designs.expanded.main),basement:revisedBasementState(designs.expanded.basement)};return {design:data.design,designs};
 }
 if(data?.schema===2&&validLevels(data.levels))return {design:'expanded',designs:createDesignStates(data.levels.main,data.levels.basement)};
 if(validate(data))return {design:'expanded',designs:createDesignStates(data,fallbackBasement)};
 throw Error('Choose a Brines layout export containing the original main floor or both design versions.');
}
export function forkExport(design,designs){
 return {schema:4,design,designs:structuredClone(designs),source:{units:'feet',revision:'A-101 / A-102 Rev 1, 2026-10-06',note:'Independent revised, earlier B.3 and original designs. Wall geometry is supplied by the matching app model. Front door east / back door west; stair top on the front/east flight and bottom on the back/west flight. Tread dimensions schematic.'}};
}
