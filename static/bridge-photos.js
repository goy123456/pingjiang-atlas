(()=>{'use strict';
const host=document.querySelector('.comparison');if(!host)return;
const panel=document.createElement('section');panel.className='bridge-photos';panel.hidden=true;panel.setAttribute('aria-label','桥梁影像对照');host.after(panel);
let records=null,selected=null,ancientSpace=null;
const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
function photoCard(photo,label){
 const card=el('figure');card.append(el('h3',label));
 const box=el('div');box.className='bridge-photo-image';card.append(box);
 if(!photo){box.classList.add('missing');box.append(el('p','暂无可确认的旧照'));return card;}
 const image=el('img');image.alt=photo.caption;image.referrerPolicy='no-referrer';image.decoding='async';image.src=photo.url;
 const status=el('p','照片加载中…');status.className='photo-load';box.append(image,status);
 image.onload=()=>status.remove();image.onerror=()=>{image.hidden=true;status.textContent='照片暂未加载';const retry=el('button','重试');retry.onclick=()=>{retry.remove();image.hidden=false;status.textContent='照片加载中…';image.src=photo.url;};status.append(retry);};
 const cap=el('figcaption',photo.caption);cap.append(el('small',photo.capture_date?photo.capture_date+'年拍摄 · '+photo.credit:'资料发布于 '+photo.published_at+' · 拍摄日期未注明'));card.append(cap);return card;
}
function ancientCard(record){
 const card=el('figure');card.append(el('h3','古图 · 桥位局部'));
 const box=el('div');box.className='bridge-photo-image';card.append(box);
 const old=document.getElementById('old-image'),p=record.ancient_position;
 if(!old||!p||!ancientSpace){box.append(el('p','古图位置暂未加载'));return card;}
 const canvas=el('canvas');canvas.width=1000;canvas.height=640;canvas.style.cssText='display:block;width:100%;height:100%;object-fit:contain';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',record.name+'在古平江图中的位置');box.append(canvas);
 const draw=()=>{if(!old.naturalWidth)return;const sw=Math.min(old.naturalWidth,1300*old.naturalWidth/ancientSpace.width),sh=Math.min(old.naturalHeight,sw*.64),sx=Math.max(0,Math.min(old.naturalWidth-sw,p.x/ancientSpace.width*old.naturalWidth-sw/2)),sy=Math.max(0,Math.min(old.naturalHeight-sh,p.y/ancientSpace.height*old.naturalHeight-sh/2));canvas.getContext('2d').drawImage(old,sx,sy,sw,sh,0,0,1000,640);};
 if(old.complete&&old.naturalWidth)draw();else old.addEventListener('load',draw,{once:true});
 card.append(el('figcaption','古平江图局部 · 地图资料，并非历史照片'));return card;
}
function render(){
 if(!records||!selected)return;const record=records.find(r=>r.id===selected);panel.hidden=!record;if(!record)return;
 panel.dataset.bridge=selected;panel.replaceChildren(el('h2',record.name+' · 桥边影像'));
 const grid=el('div');grid.className='bridge-photo-pair';grid.append(record.historical?photoCard(record.historical,'往日 · '+record.historical.capture_date):ancientCard(record),photoCard(record.modern,'实景 · 资料照片'));panel.append(grid);
 if(record.historical)panel.append(el('p','不同时期、不同视角的记录；并非同机位复拍。'));
}
function select(id){selected=id;render();const drawer=panel.closest('details');if(drawer)drawer.open=true;}
document.getElementById('bridge-list')?.addEventListener('click',e=>{const b=e.target.closest('[data-bridge]');if(b)select(b.dataset.bridge);});
window.addEventListener('message',e=>{const frame=document.querySelector('.modern-panel iframe');if(e.origin===location.origin&&e.source===frame?.contentWindow&&e.data?.type==='atlas-point-selected')select(e.data.id);});
Promise.all([fetch('/pingjiang-atlas/static/data/pingjiang-official-photos.json?v=20261028local').then(r=>{if(!r.ok)throw Error();return r.json();}),fetch('/pingjiang-atlas/static/data/pingjiang-bridge-matches.json').then(r=>{if(!r.ok)throw Error();return r.json();}),fetch('/pingjiang-atlas/static/data/pingjiang-bridge-photo-history.json').then(r=>{if(!r.ok)throw Error();return r.json();})]).then(([photos,matches,history])=>{
 ancientSpace=matches.ancient_coordinate_space;
 records=matches.bridges.map(b=>({id:b.id,name:b.name,ancient_position:b.ancient_position,modern:photos.photos.find(p=>p.ids.includes(b.id)),historical:history.photos.find(p=>p.ids.includes(b.id)&&p.status==='verified')}));
 selected=selected||document.querySelector('#bridge-list [aria-pressed="true"]')?.dataset.bridge||'H02';render();
}).catch(()=>{panel.hidden=false;panel.replaceChildren(el('p','影像资料暂未加载，请刷新重试。'));});
})();
