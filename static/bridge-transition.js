(()=>{'use strict';
let catalog,photos,sequence=0,active=null,lastId='',lastAt=0;
let displayDocument=document,displayWindow=window;
// This is a same-origin application integration, not an iframe-sized overlay.
try{if(window.parent!==window&&window.parent.location.origin===location.origin){displayDocument=window.parent.document;displayWindow=window.parent;}}catch{}
if(displayDocument!==document&&!displayDocument.querySelector('[data-bridge-transition-style]')){
 const style=displayDocument.createElement('link');style.rel='stylesheet';style.href='/pingjiang-atlas/static/bridge-transition.css?v=2';style.dataset.bridgeTransitionStyle='';displayDocument.head.append(style);
}
const ready=Promise.all([
 fetch('/pingjiang-atlas/static/data/pingjiang-bridge-matches.json').then(r=>{if(!r.ok)throw Error();return r.json();}),
 fetch('/pingjiang-atlas/static/data/pingjiang-official-photos.json').then(r=>{if(!r.ok)throw Error();return r.json();})
]).then(([a,b])=>{catalog=a;photos=b.photos;}).catch(()=>{});
function close(){sequence++;active?.remove();active=null;}
function finish(overlay,id){
 if(active!==overlay)return;overlay.remove();active=null;
 const marker=document.getElementById('old-marker');
 if(marker&&!marker.hidden&&marker.dataset.bridge===id&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  marker.animate([{outline:'0px solid rgba(175,95,43,0)'},{outline:'8px solid rgba(175,95,43,.6)'},{outline:'0px solid rgba(175,95,43,0)'}],{duration:1600,iterations:2});
 }
}
function loaded(img){return new Promise((resolve,reject)=>{
 if(img.complete&&img.naturalWidth){resolve();return;}
 const finish=ok=>{clearTimeout(timer);img.removeEventListener('load',yes);img.removeEventListener('error',no);ok?resolve():reject(Error('image'));};
 const yes=()=>finish(true),no=()=>finish(false),timer=setTimeout(no,10000);
 img.addEventListener('load',yes,{once:true});img.addEventListener('error',no,{once:true});
});}
async function play(id){
 const now=Date.now();if(id===lastId&&now-lastAt<300)return;lastId=id;lastAt=now;
 close();const token=sequence;await ready;if(token!==sequence)return;
 const bridge=catalog?.bridges.find(b=>b.id===id),photo=photos?.find(p=>p.ids.includes(id));
 if(!bridge?.ancient_position||!photo)return;
 const modern=new Image();modern.alt=bridge.name+'实景资料照片';modern.referrerPolicy='no-referrer';modern.src=photo.url;
 const old=document.getElementById('old-image');if(!old)return;
 try{await Promise.all([loaded(modern),loaded(old)]);}catch{return;}if(token!==sequence)return;
 const overlay=document.createElement('aside');overlay.className='bridge-time-transition';overlay.setAttribute('aria-label',bridge.name+'：实景渐变至古图');
 const card=document.createElement('div');card.className='bridge-time-card';
 const title=document.createElement('h2');title.textContent=bridge.name+' · 循桥入宋';
 const skip=document.createElement('button');skip.className='bridge-time-close';skip.textContent='跳过 ×';skip.onclick=()=>finish(overlay,id);
 const scene=document.createElement('div');scene.className='bridge-time-scene';
 const ancient=document.createElement('canvas');ancient.width=1000;ancient.height=640;ancient.setAttribute('role','img');ancient.setAttribute('aria-label','古平江图中'+bridge.ancient_name+'附近');
 const space=catalog.ancient_coordinate_space,p=bridge.ancient_position,scale=old.naturalWidth/space.width;
 const sw=1300*scale,sh=832*scale,sx=Math.max(0,Math.min(old.naturalWidth-sw,p.x*scale-sw/2)),sy=Math.max(0,Math.min(old.naturalHeight-sh,p.y/space.height*old.naturalHeight-sh/2));
 ancient.getContext('2d').drawImage(old,sx,sy,sw,sh,0,0,1000,640);
 modern.className='bridge-time-modern';ancient.className='bridge-time-ancient';scene.append(modern,ancient);
 const labels=document.createElement('div');labels.className='bridge-time-labels';
 const present=document.createElement('span');present.className='time-present';present.textContent='今 · 实景资料照片';
 const past=document.createElement('span');past.className='time-past';past.textContent='古 · 平江图 · '+bridge.ancient_name;labels.append(present,past);
 card.append(title,skip,scene,labels);overlay.append(card);displayDocument.body.append(overlay);active=overlay;
 // The overlay is transient and never steals keyboard focus from the selected bridge.
 overlay.addEventListener('animationend',e=>{if(e.target===overlay)finish(overlay,id);});
 setTimeout(()=>finish(overlay,id),7000);
}
document.getElementById('bridge-list')?.addEventListener('click',e=>{const b=e.target.closest('[data-bridge]');if(b)play(b.dataset.bridge);});
window.addEventListener('message',e=>{const frame=document.querySelector('.modern-panel iframe');if(e.origin===location.origin&&e.source===frame?.contentWindow&&e.data?.type==='atlas-point-selected')play(e.data.id);});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
if(displayDocument!==document)displayDocument.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
displayWindow.addEventListener('hashchange',close);
displayDocument.querySelector('header nav')?.addEventListener('click',close);
window.addEventListener('pagehide',close);
})();
