// Only package known public source trees. Never include Git, credentials or a prior ZIP.
import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {zipFiles} from '../dist/kitchen-specs.js';

const files={};
const privateFile=p=>p.split('/').some(s=>s.startsWith('.')||['node_modules','tmp','downloads','public-release'].includes(s))||/\.pdf$|(?:^|\/)(?:saguaro-reference\.jpg|(?:main-|basement-)?plan(?:-rev1)?\.png)$/.test(p);
async function collect(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=dir+'/'+entry.name;if(privateFile(path))continue;
    if(entry.isDirectory())await collect(path);
    else if(entry.isFile())files[path]=await readFile(path);
  }
}
for(const dir of ['dist','scripts','tests'])await collect(dir);
for(const name of ['README.md','AGENTS.md','LICENSE','THIRD-PARTY-NOTICES.md','package.json','vercel.json'])files[name]=await readFile(name);
files['.gitignore']=await readFile('.gitignore');
files['.vercelignore']=await readFile('.vercelignore');
const hashes=Object.fromEntries(Object.keys(files).sort().map(p=>[p,createHash('sha256').update(files[p]).digest('hex')]));
files['SOURCE-MANIFEST.json']=new TextEncoder().encode(JSON.stringify({format:'house3d-source/v1',files:hashes},null,2)+'\n');
const zip=zipFiles(Object.fromEntries(Object.keys(files).sort().map(p=>['house3d/'+p,files[p]])));
await mkdir('dist/downloads',{recursive:true});
await writeFile('dist/downloads/house3d-source.zip',zip);
console.log(`Packaged ${Object.keys(files).length} files (${(zip.length/1024/1024).toFixed(1)} MiB): dist/downloads/house3d-source.zip`);
