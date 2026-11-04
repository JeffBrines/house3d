import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {rooms,furniture} from '../dist/project.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export async function buildPlan(root){
 const m=JSON.parse(await readFile(resolve(root,'dist/model.json'),'utf8'));
 const pts=p=>p.map(([x,z])=>`${(50+x*10).toFixed(2)},${(220+z*10).toFixed(2)}`).join(' ');
 const labels={entry:[52.5,33.8],great:[42.5,19.4],kitchen:[29,27],breakfast:[28,7],office:[39,37],primary:[15,14],'primary-bath':[6.5,27],dressing:[15.1,22.6],bed2:[66.8,4.1],bath2:[67,15.3],bed3:[66.8,27],bath3:[67,22.5],mudroom:[26.8,40.6],pantry:[28,34.3],laundry:[8.5,39.6],powder:[12,32.5],garage:[17,59],patio:[43,4]};
 const body=[`<polygon points="${pts([[32.9,-17.5],[60.9,-17.5],[60.9,-.5],[58.1667,-.5],[58.1667,9.5],[35.5,9.5],[35.5,-.5],[32.9,-.5]])}" fill="#eceee5"/>`,`<polygon points="${pts(m.hull)}" fill="#f8f7f0" stroke="#b4bca9"/>`];
 for(const o of furniture){const x=50+o.x*10,z=220+o.z*10;body.push(`<rect x="${x-o.w*5}" y="${z-o.d*5}" width="${o.w*10}" height="${o.d*10}" rx="2" fill="#e4dfd2" stroke="#cec7b5" transform="rotate(${-(o.rot||0)} ${x} ${z})"/>`);}
 for(const p of m.walls)body.push(`<polygon points="${pts(p)}" fill="#53634e"/>`);
 for(const o of m.openings){if(o.kind!=='window'||o.upper)continue;const x=50+o.x*10,z=220+o.z*10;body.push(`<path d="M ${o.axis==='x'?x-o.w*5:x} ${o.axis==='x'?z:z-o.w*5} L ${o.axis==='x'?x+o.w*5:x} ${o.axis==='x'?z:z+o.w*5}" stroke="#7299a6" stroke-width="2"/>`);}
 for(const r of rooms){const [x,z]=labels[r.id];body.push(`<text x="${50+x*10}" y="${220+z*10}" text-anchor="middle" font-size="8" fill="#344633" paint-order="stroke" stroke="#f8f7f0" stroke-width="3" stroke-linejoin="round">${esc(r.name)}</text>`);}
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 870 1060" role="img" aria-labelledby="title desc"><title id="title">Cold Springs model plan</title><desc id="desc">Top view generated from the walkable model. This is not the original architectural drawing.</desc><rect width="870" height="1060" fill="#fff"/><g font-family="Arial,sans-serif">${body.join('')}<text x="50" y="1020" font-size="16" fill="#344633">COLD SPRINGS / MODEL PLAN</text><text x="50" y="1040" font-size="10" fill="#7b8871">Revision 1 basis · October 28, 2026 · Model geometry; verify against issued plans</text><path d="M 610 1015 v-7 7 h200 v-7 M 710 1015 v-7" fill="none" stroke="#344633" stroke-width="2"/><text x="610" y="1032" font-size="10">0</text><text x="703" y="1032" font-size="10">10</text><text x="794" y="1032" font-size="10">20 ft</text></g></svg>`;
 await writeFile(resolve(root,'dist/assets/model-plan.svg'),svg+'\n');
}
