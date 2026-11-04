// Feet. Vertical datum is finished house floor, elevation 6256.24 ft (A-1).
// Horizontal geometry follows A-1 framing faces; finish build-ups are not known.
export const dimensions=Object.freeze({
 plateAboveSubfloor:9+1.125/12, floorFinish:.75/12, ceilingLining:.625/12,
 garage:{leftX:1+5.5/12,rightX:32+3.25/12,leftLevel:6255-6256.24,rightLevel:6254.5-6256.24,backZ:44+2/12,frontZ:74+5/12},
 steps:{x0:18+4.25/12,x1:21+1.75/12,startZ:44+2/12,run:1,risers:3},
 porch:{x0:46.5,x1:58+2/12,z0:36.5,z1:46+2/12,drop:6.5/12,slope:.02},
 patio:{x0:35.5,x1:58+2/12,z0:-.5,z1:9.5,drop:6.5/12,slope:.02},
 extension:{x0:32.9,x1:60.9,z0:-17.5,z1:-.5},
 fireplace:{x0:54+11.125/12,x1:56+10.125/12,z0:15.75,z1:23+4/12},
});
export const finishedCeiling=dimensions.plateAboveSubfloor-dimensions.floorFinish-dimensions.ceilingLining;
export function garageSlabHeight(x){const g=dimensions.garage;return g.leftLevel+(g.rightLevel-g.leftLevel)*Math.max(0,Math.min(1,(x-g.leftX)/(g.rightX-g.leftX)));}
export function porchHeight(z){const p=dimensions.porch;return -p.drop-Math.max(0,z-p.z0)*p.slope;}
export function patioHeight(z){const p=dimensions.patio;return -p.drop-Math.max(0,p.z1-z)*p.slope;}
