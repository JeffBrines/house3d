// Dependency-free development server. Bind locally; only serve files inside dist.
import {createServer} from 'node:http';
import {readFile,realpath,stat} from 'node:fs/promises';
import {resolve,relative,extname,sep} from 'node:path';
const root=await realpath(resolve('dist'));
const port=Number(process.env.PORT||8080);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.zip':'application/zip','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
    let file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if((await stat(file)).isDirectory())file=resolve(file,'index.html');
    file=await realpath(file);
    const rel=relative(root,file);
    if(rel==='..'||rel.startsWith('..'+sep)||rel.split(sep).some(p=>p.startsWith('.'))){res.writeHead(403);return res.end();}
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`House3D: http://127.0.0.1:${port}/`));
