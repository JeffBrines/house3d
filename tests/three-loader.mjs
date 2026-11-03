const aliases={'three':'three.module.js','three-mesh-bvh':'mesh-bvh.module.js','three/examples/jsm/postprocessing/Pass.js':'Pass.js'};
export async function resolve(specifier,context,next){if(aliases[specifier])return {url:new URL('../dist/assets/'+aliases[specifier],import.meta.url).href,shortCircuit:true};return next(specifier,context);}
