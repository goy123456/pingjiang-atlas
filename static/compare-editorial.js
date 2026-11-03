(()=>{'use strict';
 function init(){
 const map=document.querySelector('.comparison');if(!map)return;
 const bar=document.createElement('div');bar.className='editorial-actions';
 const hint=document.createElement('small');hint.textContent='先看地图，再展开影像与解释 · 两图并非同一比例尺';
 map.after(bar);bar.append(hint);
 function control(label,target){
  const button=document.createElement('button');button.type='button';button.textContent=label;
  if(!target.id)target.id='editorial-'+bar.children.length;
  button.setAttribute('aria-controls',target.id);
  const sync=()=>button.setAttribute('aria-expanded',String(target.open));sync();target.addEventListener('toggle',sync);
  button.onclick=()=>{target.open=!target.open;if(target.open)target.scrollIntoView({block:'nearest',behavior:'auto'});};bar.insertBefore(button,hint);
 }
 const photos=document.querySelector('.bridge-photos');
 if(photos){const details=document.createElement('details');details.className='editorial-drawer';const title=document.createElement('summary');title.textContent='桥边影像 · 年代与视角';photos.before(details);details.append(title,photos);control('查看桥边影像',details);}
 const qa=document.getElementById('bridge-experience');
 if(qa&&document.getElementById('map-thought')){
  let drawer=qa.closest('details');if(!drawer){drawer=document.createElement('details');drawer.className='visitor-experience';const title=document.createElement('summary');title.textContent='资料与问答';map.after(drawer);drawer.append(title,qa);}
  drawer.open=false;control('资料与问答',drawer);
 }
 // Embedded views already have navigation in their parent shell.
 if(window.parent!==window)document.querySelector('body>header')?.setAttribute('hidden','');
 window.dispatchEvent(new Event('resize'));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();