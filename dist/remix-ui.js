import {distribution} from './distribution-config.js';

const dialog=document.getElementById('remixDialog');
document.getElementById('remixOpen').addEventListener('click',()=>dialog.showModal());
document.getElementById('remixClose').addEventListener('click',()=>dialog.close());
document.getElementById('remixSource').href=distribution.sourceDownload;
document.getElementById('remixRepository').href=distribution.repository;
document.getElementById('remixLayout').addEventListener('click',()=>document.getElementById('export').click());
if(distribution.publicRelease){
  document.getElementById('saveStatus').textContent='Your edits stay in this browser. Export a layout to keep or move them.';
}
if(!distribution.sourceDrawings){
  document.getElementById('sourceToggle').hidden=true;
  document.querySelectorAll('#auditDialog a[href$=".pdf"]').forEach(a=>a.remove());
}
