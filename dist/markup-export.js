// PNG iTXt keeps the precise request inside the same image the user brings to chat.
const encoder=new TextEncoder();
const crcTable=Array.from({length:256},(_,i)=>{let c=i;for(let n=0;n<8;n++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export function requestPNG(bytes,request){
 const payload=encoder.encode('house3d-request\0\0\0\0\0'+JSON.stringify(request)),type=encoder.encode('iTXt'),chunk=new Uint8Array(payload.length+12),v=new DataView(chunk.buffer);
 v.setUint32(0,payload.length);chunk.set(type,4);chunk.set(payload,8);v.setUint32(chunk.length-4,crc32(chunk.subarray(4,-4)));
 const result=new Uint8Array(bytes.length+chunk.length),iend=bytes.length-12;
 if(new TextDecoder().decode(bytes.subarray(iend+4,iend+8))!=='IEND')throw Error('Could not read the captured PNG.');
 result.set(bytes.subarray(0,iend));result.set(chunk,iend);result.set(bytes.subarray(iend),iend+chunk.length);return result;
}
export function requestText(request){
 const areas=request.areas.map(a=>`${a.id}: ${a.selectedTarget?.label||'Entire circled area'}${a.selectedTarget?.entityId?' ['+a.selectedTarget.entityId+']':''}`).join('\n');
 return `House finish request ${request.id}\n${request.context.designName} · ${request.context.floorLabel}\nLocation: ${request.location}\n${areas}\n\n${request.note||'Please update the marked area using the attached reference.'}\n${request.reference?'\nProduct photo: '+request.reference.originalName+'\n':''}\nScope: ${request.scope==='matching-surface'?'The selected surface throughout this room.':'Only the circled area(s).'}\nAttach the marked PNG with this request; it contains the camera, 3D hits and current finishes.`;
}
