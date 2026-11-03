const icons={
 explore:'M12 3 21 12 12 21 3 12Z M15 9l-2 4-4 2 2-4Z',
 finishes:'M4 4h12v8H4z M16 7h4v8h-8v5',
 edit:'m4 16 12-12 4 4-12 12H4Z M13 7l4 4',
 project:'M3 6h7l2 2h9v12H3Z M3 6V4h7l2 2',
 circle:'M20 12a8 8 0 1 1-8-8 M16 3v6h6',
 measure:'m3 16 13-13 5 5-13 13Z M7 12l2 2 M10 9l2 2 M13 6l2 2',
 options:'M4 7h16 M4 17h16 M9 4v6 M15 14v6',
 map:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z M9 3v16 M15 5v16',
 paint:'M4 4h12v8H4Z M16 8h4v7h-8v5',
 floor:'M3 4h18v16H3Z M3 9h18 M3 15h18 M9 4v5 M15 9v6 M8 15v5',
 tile:'M3 3h7v7H3Z M14 3h7v7h-7Z M3 14h7v7H3Z M14 14h7v7h-7Z',
 cabinet:'M3 4h18v16H3Z M12 4v16 M8 10v4 M16 10v4',
 fixture:'M7 20v-9a5 5 0 0 1 10 0v2 M14 13h6 M4 20h7',
 palette:'M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-4c-2-1-1-3 1-3h3c5 0 3-11-6-11Z M7 9h.01 M10 6h.01 M15 7h.01',
 compare:'M3 4h7v16H3Z M14 4h7v16h-7Z',
 arrow:'M5 12h14 M14 7l5 5-5 5'
};
export const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(icons[name]||icons.options).split(' M').map((p,i)=>`<path d="${i?'M':''}${p}"/>`).join('')}</svg>`;
const $=id=>document.getElementById(id);
const node=(tag,cls,html='')=>{const e=document.createElement(tag);e.className=cls;e.innerHTML=html;return e;};

export function mountNavigationUI({setTab,review,stopMovement}){
 const sidebar=$('sidebar'),header=document.querySelector('header'),content=node('div','studioContent');content.id='studioContent';
 const floorField=$('floorSelect').closest('label');
 const heading=node('div','studioHeading','<div><span class="studioEyebrow">YOUR SPACE</span><strong>House studio</strong></div>');heading.append(floorField);
 const nav=node('nav','studioNav');nav.id='studioNav';nav.setAttribute('aria-label','Studio');nav.setAttribute('role','tablist');
 const sections={};
 for(const [id,label] of [['explore','Explore'],['finishes','Finishes'],['edit','Edit'],['project','Project']]){
  const button=node('button','',icon(id)+`<span>${label}</span>`);button.id='nav-'+id;button.dataset.section=id;button.setAttribute('role','tab');button.setAttribute('aria-controls',id==='finishes'?'finishesPanel':id+'Workspace');nav.append(button);
  const section=id==='finishes'?$('finishesPanel'):node('section','workspace');section.id=id==='finishes'?'finishesPanel':id+'Workspace';section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',button.id);section.tabIndex=0;sections[id]=section;content.append(section);
 }
 sidebar.append(content);
 sections.explore.innerHTML='<div class="workspaceIntro"><h2>Find your room.</h2><p>Jump to a room or choose a closer look.</p></div><div id="roomNavigation"></div><h3 class="sectionLabel">Saved views</h3><div class="roomViews" id="roomViews"></div><details class="studioDisclosure"><summary>Stairs &amp; circulation</summary><div id="stairNavigation" class="actionStack"></div></details><div class="navigationTip">Drag to look around. Use the mouse wheel or arrow keys to move through the house.</div>';
 $('roomNavigation').append($('roomSelect').closest('label'));
 const viewLabels=[['family','Living room','North-wall TV'],['kitchen','Kitchen','Island & cabinetry'],['dining','Dining','Table & seating'],['bath','Primary bath','Vanity & tile']];
 for(const [view,label,detail] of viewLabels){const b=node('button','roomView',`<strong>${label}</strong><span>${detail}</span>${icon('arrow')}`);b.dataset.roomView=view;b.onclick=async()=>{await review(view);show('explore');};$('roomViews').append(b);}
 for(const [room,label,detail] of [[1,'Game room','Media & seating'],[2,'Office','Work area'],[5,'Bathroom','Shower & vanity'],[3,'Bedroom','Guest room']]){const b=node('button','roomView',`<strong>${label}</strong><span>${detail}</span>${icon('arrow')}`);b.dataset.basementRoom=room;b.hidden=true;b.onclick=()=>{$('roomSelect').value=room;$('roomSelect').dispatchEvent(new Event('change',{bubbles:true}));};$('roomViews').append(b);}
 $('stairNavigation').append($('viewStairs'),$('stairsButton'));
 const extraViews=node('details','studioDisclosure','<summary>More views</summary><div class="actionStack"></div>');
 extraViews.lastElementChild.append($('livingOverview'),$('suiteBath'),$('suiteCloset'),$('suiteEntry'),$('suitePlan'));sections.explore.insertBefore(extraViews,sections.explore.lastElementChild);
 // The scene contains one circle action. Keep older launch hooks mounted but hidden.
 const legacy=node('div','');legacy.hidden=true;legacy.append($('finishStudio'),$('markAreaStudio'),$('viewFamily'),$('tabs'));
 sections.edit.innerHTML='<div class="workspaceIntro"><h2>Shape the details.</h2><p>Adjust furniture, cabinetry and lighting.</p></div><label class="field">What would you like to edit?<select id="editCategory"><option value="layout">Furniture &amp; layout</option><option value="kitchen">Kitchen cabinetry</option><option value="bathrooms">Bathroom cabinetry</option><option value="lighting">Light fixtures</option></select></label><div class="editorDivider"></div>';
 for(const id of ['layout','kitchen','bathrooms','lighting'])sections.edit.append($(id+'Panel'));
 const suiteCard=$('suiteSummary').closest('.suiteCard');
 sections.project.innerHTML='<div class="workspaceIntro"><h2>Your project.</h2><p>Save your work, switch plans or review the model.</p></div><section class="projectBlock"><h3>Save &amp; transfer</h3><p class="note">Changes save in this browser. Export a file to back them up or use another device.</p><div id="fileActions" class="fileActions"></div></section><section class="projectBlock" id="versionBlock"><h3>Plan version</h3></section><details class="studioDisclosure"><summary>Drawings &amp; dimension review</summary><div class="actionStack" id="drawingActions"></div></details><details class="studioDisclosure"><summary>Earlier studies &amp; comparisons</summary><div id="projectStudies"></div></details><details class="studioDisclosure resetDisclosure"><summary>Reset this floor</summary><p class="note">Restore this floor’s starting furniture, finishes and lights. Export first to keep a copy.</p><div id="resetAction"></div></details>';
 $('fileActions').append($('export'),$('import'),$('importFile'));$('export').textContent='Export layout';$('import').textContent='Import layout';
 $('versionBlock').append($('designSelect').closest('label'),$('revisionNotice'));
 $('drawingActions').append($('auditButton'),$('sourceToggle'));$('auditButton').textContent='Dimension review';$('auditButton').classList.remove('status');
 $('projectStudies').append(suiteCard,$('stairStudy'));$('resetAction').append($('reset'));$('reset').textContent='Reset current floor';
 const sourceButton=$('remixOpen');sourceButton.textContent='Get your own copy';sourceButton.className='headerRemix';header.append(sourceButton);
 const footer=node('footer','studioFooter','<span class="saveDot" aria-hidden="true"></span>');footer.append($('saveStatus'));
 sidebar.replaceChildren(heading,nav,content,footer,legacy);
 // Small scene toolbar; the full set of view controls is available in one disclosure.
 const tools=$('sceneTools'),options=node('details','viewOptions','<summary id="viewOptionsToggle">'+icon('options')+'<span>View</span></summary><div class="viewOptionsPanel"><h3>View settings</h3><div class="viewArchitecture"></div><div class="viewRendering"></div><div class="viewInstructions"></div></div>');options.id='viewOptions';
 options.querySelector('.viewArchitecture').append($('home'),$('ceiling'),$('cutaway'));
 const photo=$('photoMode');photo.textContent='Realistic lighting';photo.setAttribute('aria-pressed',String(photo.classList.contains('active')));
 options.querySelector('.viewRendering').append(photo,$('qualityControl'),$('exposureControl'));
 options.querySelector('.viewInstructions').append($('help'),$('photoStatus'));
 const map=node('button','mapToggle',icon('map')+'<span>Map</span>');map.id='mapToggle';map.setAttribute('aria-expanded','false');map.setAttribute('aria-controls','minimap');
 map.onclick=()=>{const on=document.body.classList.toggle('map-open');map.setAttribute('aria-expanded',String(on));};
 $('markArea').innerHTML=icon('circle')+'<span>Circle an area</span>';$('measure').innerHTML=icon('measure')+'<span>Measure</span>';
 tools.replaceChildren($('markArea'),$('measure'),options,map);tools.setAttribute('aria-label','House tools');
 document.addEventListener('pointerdown',e=>{if(options.open&&!options.contains(e.target))options.open=false;});
 options.addEventListener('toggle',()=>{if(options.open)stopMovement();});
 options.addEventListener('keydown',e=>{if(e.key==='Escape'){options.open=false;$('viewOptionsToggle').focus();e.stopPropagation();}});
 let section='finishes',activeEdit='layout';
 function show(next){
  section=next;for(const [key,pane] of Object.entries(sections))pane.hidden=key!==next;
  for(const button of nav.querySelectorAll('button')){const on=button.dataset.section===next;button.classList.toggle('active',on);button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;}
  sidebar.dataset.section=next;content.scrollTop=0;
 }
 function choose(next){if(next==='finishes')setTab('finishes');else if(next==='edit')setTab(activeEdit);show(next);stopMovement();}
 for(const b of nav.querySelectorAll('button'))b.onclick=()=>choose(b.dataset.section);
 nav.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const buttons=[...nav.querySelectorAll('button')],at=buttons.indexOf(document.activeElement),i=e.key==='Home'?0:e.key==='End'?buttons.length-1:(at+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[i].click();buttons[i].focus();});
 $('editCategory').onchange=e=>setTab(e.target.value);
 // A room click on mobile should return to the house after moving the camera.
 for(const id of ['viewStairs','stairsButton','livingOverview','suiteBath','suiteCloset','suiteEntry','suitePlan'])$(id).dataset.closeMobile='';
 show('finishes');document.body.classList.add('navigation-ready');
 return {choose,refresh(floor){const basement=floor==='basement';for(const b of $('roomViews').querySelectorAll('[data-room-view]'))b.hidden=basement;for(const b of $('roomViews').querySelectorAll('[data-basement-room]'))b.hidden=!basement;extraViews.hidden=basement;},showTab(tab){if(tab==='finishes')show('finishes');else{activeEdit=tab;$('editCategory').value=tab;show('edit');}},get section(){return section;}};
}

export function organizeFinishNavigation(host){
 const sections=[...host.querySelectorAll(':scope > .finishSection')];
 const [palettes,floor,cabinets,fixtures,trim,paint,tile,compare]=sections;
 const intro=host.querySelector('.finishIntro');intro.innerHTML='<h2>Make it feel like home.</h2><p>Choose a material to start exploring.</p>';
 const buttons=[...host.querySelectorAll('[data-review]')],views=node('div','finishContext','<label class="field">Look closely at<select id="finishView"><option value="">Choose a view…</option></select></label>');
 const select=views.querySelector('select');for(const b of buttons)select.add(new Option(b.textContent,b.dataset.review));
 select.onchange=()=>{buttons.find(b=>b.dataset.review===select.value)?.click();};
 const lighting=host.querySelector('#finishLighting').closest('label');lighting.firstChild.textContent='Lighting';views.append(lighting);intro.after(views);
 const hiddenViews=node('div','');hiddenViews.hidden=true;for(const e of [...host.querySelectorAll('.finishViews')])hiddenViews.append(e);host.append(hiddenViews);
 fixtures.append(host.querySelector('#detailBasis'));
 const groups=[['walls','Walls & trim','Paint, sheen & wood trim','paint',[paint,trim]],['floor','Flooring','Oak, plank size & direction','floor',[floor]],['tile','Tile & grout','Choose an area, then a finish','tile',[tile]],['cabinets','Cabinets & stone','Color, surface & edge','cabinet',[cabinets]],['fixtures','Hardware & fixtures','Handles, faucets & sinks','fixture',[fixtures]],['palettes','Whole-room palettes','Try a coordinated starting point','palette',[palettes]],['compare','Compare & save','A / B options, images & schedule','compare',[compare]]];
 const wrappers=[];
 for(const [id,title,description,symbol,items] of groups){const details=node('details','finishCategory',`<summary>${icon(symbol)}<span><strong>${title}</strong><small>${description}</small></span><span class="disclosureArrow" aria-hidden="true">+</span></summary><div class="finishCategoryBody"></div>`);details.id='finish-category-'+id;details.setAttribute('name','finish-category');
  for(const item of items){item.querySelector('h3')?.remove();details.lastElementChild.append(item);}host.insertBefore(details,hiddenViews);wrappers.push([details,items]);
  details.addEventListener('toggle',()=>{if(details.open){for(const [other] of wrappers)if(other!==details)other.open=false;}});
 }
 const footer=[...host.children].find(e=>e.matches('p.note'));
 if(footer){const about=node('details','materialNotes','<summary>About these materials</summary>');about.append(footer);host.append(about);}
 return ()=>{
  for(const [wrapper,items] of wrappers)wrapper.hidden=items.every(item=>item.hidden);
  for(const option of select.options){const b=buttons.find(b=>b.dataset.review===option.value);if(b)option.hidden=option.disabled=!!(b.hidden||b.closest('.detailViews')?.hidden);}
  if(select.selectedOptions[0]?.disabled)select.value='';
 };
}
