import {icon} from './navigation-ui.js?v=1';
const QUERY='(max-width: 900px), (pointer: coarse) and (max-width: 1100px)';
export function mountMobileUI({resize,stopMovement,navigation}){
 const $=id=>document.getElementById(id),media=matchMedia(QUERY),panel=$('sidebar'),viewport=$('viewport'),header=document.querySelector('header');
 const dock=document.createElement('nav');dock.id='mobileDock';dock.setAttribute('aria-label','House studio');dock.innerHTML=[['explore','Explore'],['finishes','Finishes'],['edit','Edit'],['project','Project']].map(([id,label])=>`<button data-mobile-section="${id}" aria-controls="sidebar" aria-expanded="false">${icon(id)}<span>${label}</span></button>`).join('');document.body.append(dock);
 const shade=document.createElement('button');shade.id='mobileShade';shade.type='button';shade.tabIndex=-1;shade.setAttribute('aria-label','Close studio');document.body.append(shade);
 const head=document.createElement('div');head.id='mobilePanelHead';head.innerHTML='<strong>House studio</strong><button id="mobileClose" aria-label="Close studio">Back to house ×</button>';panel.prepend(head);
 let opened=false,lastTrigger=dock.querySelector('[data-mobile-section="finishes"]');
 function syncDock(){for(const b of dock.querySelectorAll('button'))b.setAttribute('aria-expanded',String(opened&&b.dataset.mobileSection===navigation.section));}
 function close(returnFocus=true){opened=false;stopMovement();document.body.classList.remove('panel-open');panel.inert=media.matches;viewport.inert=false;header.inert=false;dock.inert=false;panel.removeAttribute('role');panel.removeAttribute('aria-modal');syncDock();if(returnFocus&&media.matches)lastTrigger.focus();}
 function open(section,trigger){stopMovement();$('viewOptions').open=false;navigation.choose(section);opened=true;lastTrigger=trigger||lastTrigger;panel.inert=false;viewport.inert=true;header.inert=true;dock.inert=true;document.body.classList.add('panel-open');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','House studio');syncDock();$('mobileClose').focus();}
 for(const button of dock.querySelectorAll('button'))button.onclick=()=>open(button.dataset.mobileSection,button);
 $('mobileClose').onclick=()=>close();shade.onclick=()=>close();
 panel.addEventListener('keydown',e=>{if(!media.matches||!opened||document.querySelector('dialog[open]'))return;if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Tab'){const focusable=[...panel.querySelectorAll('button,input,select,textarea,summary,a[href]')].filter(el=>!el.disabled&&el.tabIndex!==-1&&el.getClientRects().length),first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
 panel.addEventListener('click',e=>{if(media.matches&&e.target.closest('[data-close-mobile]'))close(false);});
 for(const id of ['floorSelect','roomSelect'])$(id).addEventListener('change',()=>{if(media.matches)close(false);});
 new MutationObserver(syncDock).observe(panel,{attributes:true,attributeFilter:['data-section']});
 const planControls=document.createElement('div');planControls.id='mobilePlanControls';planControls.innerHTML='<label>Plan view <select id="mobilePlanChoice"><option value="expanded">Expanded suite</option><option value="original">Original plan</option><option value="both">Both plans</option></select></label><button id="mobilePlanZoom" aria-pressed="false">Zoom drawing</button>';$('suiteComparison').before(planControls);
 let zoom=false;
 function framePlan(){const svg=$('suiteComparison').querySelector('svg');if(!svg)return;const choice=media.matches?$('mobilePlanChoice').value:'both',box=choice==='expanded'?[630,110,520,810]:choice==='original'?[40,110,520,810]:[0,0,1180,1030];svg.setAttribute('viewBox',box.join(' '));svg.setAttribute('width',box[2]);svg.setAttribute('height',box[3]);svg.style.width=media.matches&&zoom?'180%':'100%';svg.style.minWidth=media.matches?'0':'';}
 $('mobilePlanChoice').onchange=framePlan;$('mobilePlanZoom').onclick=()=>{zoom=!zoom;$('mobilePlanZoom').setAttribute('aria-pressed',String(zoom));$('mobilePlanZoom').textContent=zoom?'Fit drawing':'Zoom drawing';framePlan();};
 new MutationObserver(framePlan).observe($('suiteComparison'),{childList:true});
 const adapt=()=>{close(false);if(!media.matches)panel.inert=false;framePlan();resize();};media.addEventListener('change',adapt);window.visualViewport?.addEventListener('resize',resize);new ResizeObserver(resize).observe(viewport);adapt();
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMovement();});
 return {closePanel(){if(media.matches)close(false);},refresh(){}};
}
