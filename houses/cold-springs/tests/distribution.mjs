import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
async function paths(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())out.push(...await paths(p));else out.push(p);}return out;}
const privateFile=p=>/\.(pdf|png|jpe?g|webp)$/i.test(p)||/(?:^|\/)(?:source-plans|\.openai|\.vercel|\.env)(?:\/|$)/.test(p);
assert(!(await paths(resolve(root,'dist'))).some(privateFile),'Public assets cannot contain original drawing images, PDFs or hosting identity.');
execFileSync(process.execPath,['scripts/package.mjs'],{cwd:root,stdio:'pipe'});
function unzip(bytes){const entries=new Map();let offset=0;while(bytes.readUInt32LE(offset)===0x04034b50){assert.equal(bytes.readUInt16LE(offset+8),0,'Handoff uses uncompressed ZIP records');const size=bytes.readUInt32LE(offset+18),nameLength=bytes.readUInt16LE(offset+26),extraLength=bytes.readUInt16LE(offset+28),name=bytes.subarray(offset+30,offset+30+nameLength).toString();assert(!name.includes('..')&&!name.startsWith('/'));const start=offset+30+nameLength+extraLength;entries.set(name,bytes.subarray(start,start+size));offset=start+size;}assert.equal(bytes.readUInt32LE(offset),0x02014b50);return entries;}
const entries=unzip(await readFile(resolve(root,'dist/downloads/cold-springs-source.zip')));
assert([...entries.keys()].every(p=>!privateFile(p)&&!p.includes('/downloads/')));
for(const p of ['dist/index.html','dist/model.json','dist/assets/model-plan.svg','dist/assets/LICENSE','scripts/package.mjs','README.md','AGENTS.md','vercel.json'])assert(entries.has('cold-springs/'+p),p+' must be handed off');
const manifest=JSON.parse(entries.get('cold-springs/SOURCE-MANIFEST.json'));
for(const [p,hash] of Object.entries(manifest.files))assert.equal(createHash('sha256').update(entries.get('cold-springs/'+p)).digest('hex'),hash,p+' must match the manifest');
const temp=await mkdtemp(resolve(tmpdir(),'cold-springs-handoff-'));
try{
 for(const [p,data]of entries){const target=resolve(temp,p);await mkdir(dirname(target),{recursive:true});await writeFile(target,data);}
 const standalone=resolve(temp,'cold-springs');
 for(const test of ['tests/dimensions.mjs','tests/model.mjs'])execFileSync(process.execPath,[test],{cwd:standalone,stdio:'pipe'});
 // A received handoff still builds without access to the parent repository or Python.
 await writeFile(resolve(standalone,'dist/private.pdf'),'private drawing sentinel');
 await writeFile(resolve(standalone,'dist/.env'),'private credential sentinel');
 execFileSync(process.execPath,['scripts/package.mjs'],{cwd:standalone,stdio:'pipe'});
 const repacked=unzip(await readFile(resolve(standalone,'dist/downloads/cold-springs-source.zip')));
 assert(!repacked.has('cold-springs/dist/private.pdf'));assert(!repacked.has('cold-springs/dist/.env'));
}finally{await rm(temp,{recursive:true,force:true});}
for(const p of (await paths(resolve(root,'dist'))).filter(p=>p.endsWith('.js'))){const src=await readFile(p,'utf8');for(const m of src.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g))await readFile(resolve(dirname(p),m[1].split('?')[0]));}
console.log('Public asset exclusions, ZIP integrity, asset imports and independent handoff build passed.');
