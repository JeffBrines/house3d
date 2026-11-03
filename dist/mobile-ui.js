const QUERY='(max-width: 900px), (pointer: coarse) and (max-width: 1100px)';
export function mountMobileUI({resize,stopMovement}){
 const $=id=>document.getElementById(id),media=matchMedia(QUERY),panel=$('sidebar'),viewport=$('viewport');
 const dock=document.createElement('div');dock.id='mobileDock';dock.innerHTML='<button id="mobilePanel" aria-controls="sidebar" aria-expanded="false">Rooms &amp; edit</button><button id="mobileTools" aria-controls="sceneTools" aria-expanded="false">Tools</button><button id="mobileMap" aria-controls="minimap" aria-expanded="false">Map</button>';
 document.body.append(dock);
 const shade=document.createElement('button');shade.id='mobileShade';shade.type='button';shade.tabIndex=-1;shade.setAttribute('aria-label','Close editing panel');document.body.append(shade);
 const head=document.createElement('div');head.id='mobilePanelHead';head.innerHTML='<strong>Rooms &amp; configuration</strong><button id="mobileClose" aria-label="Close editing panel">Done</button>';panel.prepend(head);
 const audit=document.createElement('button');audit.id='mobileAudit';audit.textContent='Dimension review';panel.append(audit);
 const hint=document.createElement('div');hint.id='touchHint';viewport.append(hint);
 const viewLabels=new Map([...document.querySelectorAll('#views [data-view]')].map(b=>[b,b.textContent]));
 let opened=false;
 function close(returnFocus=true){opened=false;stopMovement();document.body.classList.remove('panel-open');$('mobilePanel').setAttribute('aria-expanded','false');panel.inert=media.matches;viewport.inert=false;panel.removeAttribute('role');panel.removeAttribute('aria-modal');if(returnFocus&&media.matches)$('mobilePanel').focus();}
 function open(){opened=true;stopMovement();panel.inert=false;viewport.inert=true;document.body.classList.add('panel-open');$('mobilePanel').setAttribute('aria-expanded','true');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Rooms and configuration');$('mobileClose').focus();}
 $('mobilePanel').onclick=()=>opened?close():open();$('mobileClose').onclick=()=>close();shade.onclick=()=>close();
 for(const [id,cls] of [['mobileTools','tools-open'],['mobileMap','map-open']])$(id).onclick=()=>{const on=document.body.classList.toggle(cls);$(id).setAttribute('aria-expanded',String(on));};
 audit.onclick=()=>{close(false);$('auditButton').click();};
 panel.addEventListener('keydown',e=>{if(!media.matches||!opened)return;if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Tab'){const focusable=[...panel.querySelectorAll('button,input,select,textarea,summary,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
 panel.addEventListener('click',e=>{if(media.matches&&e.target.closest('#suiteBath,#suiteCloset,#suiteEntry,#suitePlan,#suiteReview,[data-close-mobile]'))close(false);});
 for(const id of ['floorSelect','roomSelect'])$(id).addEventListener('change',()=>{if(media.matches)close(false);});
 // Display one comparison panel at a time on phones. Downloads remain the complete drawing.
 const planControls=document.createElement('div');planControls.id='mobilePlanControls';planControls.innerHTML='<label>Plan view <select id="mobilePlanChoice"><option value="expanded">Expanded suite</option><option value="original">Original plan</option><option value="both">Both plans</option></select></label><button id="mobilePlanZoom" aria-pressed="false">Zoom drawing</button>';$('suiteComparison').before(planControls);
 let zoom=false;
 function framePlan(){const svg=$('suiteComparison').querySelector('svg');if(!svg)return;const choice=media.matches?$('mobilePlanChoice').value:'both',box=choice==='expanded'?[630,110,520,810]:choice==='original'?[40,110,520,810]:[0,0,1180,1030];svg.setAttribute('viewBox',box.join(' '));svg.setAttribute('width',box[2]);svg.setAttribute('height',box[3]);svg.style.width=media.matches&&zoom?'180%':'100%';svg.style.minWidth=media.matches?'0':'';}
 $('mobilePlanChoice').onchange=framePlan;$('mobilePlanZoom').onclick=()=>{zoom=!zoom;$('mobilePlanZoom').setAttribute('aria-pressed',String(zoom));$('mobilePlanZoom').textContent=zoom?'Fit drawing':'Zoom drawing';framePlan();};
 new MutationObserver(framePlan).observe($('suiteComparison'),{childList:true});
 const adapt=()=>{for(const [button,label] of viewLabels){button.setAttribute('aria-label',label);button.textContent=media.matches?({orbit:'3D',walk:'Walk',plan:'Plan'}[button.dataset.view]||label):label;}for(const id of ['exposureControl','qualityControl']){const parent=media.matches?$('sceneTools'):viewport;if($(id).parentElement!==parent)parent.append($(id));}if(!media.matches){close(false);panel.inert=false;}else if(!opened)panel.inert=true;framePlan();resize();};media.addEventListener('change',adapt);window.visualViewport?.addEventListener('resize',resize);new ResizeObserver(resize).observe(viewport);adapt();
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMovement();});
 return {closePanel(){if(media.matches)close();},refresh(mode){hint.textContent=mode==='walk'?'Drag to look · Hold arrows to walk':mode==='plan'?'Pinch to zoom · Drag selected fixtures':'Drag to orbit · Pinch to zoom';}};
}
