// Build a self-contained public handoff using only Node's standard library.
import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {zipFiles} from './zip.mjs';
import {buildAudit} from './audit-dimensions.mjs';
import {buildPlan} from './model-plan.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await buildPlan(root);
await buildAudit(root);
const files={};
const privatePath=path=>path.split('/').some(p=>p.startsWith('.')||['node_modules','source-plans','tmp','downloads'].includes(p))||/\.(pdf|png|jpe?g|webp)$/i.test(path);
async function collect(dir){
 for(const e of await readdir(resolve(root,dir),{withFileTypes:true})){
  const p=dir+'/'+e.name;if(privatePath(p))continue;
  if(e.isDirectory())await collect(p);else if(e.isFile())files[p]=await readFile(resolve(root,p));
 }
}
for(const dir of ['dist','scripts','tests'])await collect(dir);
for(const name of ['README.md','AGENTS.md','LICENSE','THIRD-PARTY-NOTICES.md','package.json','vercel.json'])files[name]=await readFile(resolve(root,name));
// Hosting providers can omit their control files; supply portable safe defaults.
const ignored=['.git/','.env','.env.*','.openai/','.vercel/','node_modules/','source-plans/','tmp/','dist/downloads/','**/*.pdf','**/floor-plan.png'].join('\n')+'\n';
for(const name of ['.gitignore','.vercelignore']){try{files[name]=await readFile(resolve(root,name));}catch(e){if(e.code!=='ENOENT')throw e;files[name]=ignored;}}
files['SOURCE-MANIFEST.json']=JSON.stringify({format:'cold-springs-source/v1',files:Object.fromEntries(Object.keys(files).sort().map(p=>[p,createHash('sha256').update(files[p]).digest('hex')]))},null,2)+'\n';
const zip=zipFiles(Object.fromEntries(Object.keys(files).sort().map(p=>['cold-springs/'+p,files[p]])));
await mkdir(resolve(root,'dist/downloads'),{recursive:true});
await writeFile(resolve(root,'dist/downloads/cold-springs-source.zip'),zip);
console.log(`Packaged ${Object.keys(files).length} public files (${(zip.length/1024/1024).toFixed(1)} MiB).`);
