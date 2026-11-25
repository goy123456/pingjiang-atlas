/* Static Pages edition: compose the existing controls, not a new map controller. */
(()=>{'use strict';
const run=()=>{
 const q=s=>document.querySelector(s),map=q('.comparison');if(!map)return;
 const el=(tag,txt)=>Object.assign(document.createElement(tag),txt?{textContent:txt}:{});
 const cmd=el('div');cmd.className='water-command';map.before(cmd);
 function menu(label,nodes){const d=el('details'),s=el('summary',label),box=el('div');d.append(s,box);nodes.filter(Boolean).forEach(n=>box.append(n));cmd.append(d);return d}
 const picker=menu('八桥',[q('.bridge-matches')]);
 const controls=q('.compare-controls');if(controls){cmd.append(controls);controls.querySelector('span')?.setAttribute('hidden','')}
 menu('工具',[q('.map-legend'),q('#bridge-experience'),q('#sync-status')]);
 const old=q('#old-viewport');
 old.addEventListener('wheel',ev=>{ev.preventDefault();old.dispatchEvent(new CustomEvent('atlas-pinch',{detail:{factor:Math.exp(-Math.sign(ev.deltaY)*.16)}}));},{passive:false});
 const rail=q('.editorial-drawer');if(rail&&rail.querySelector('.bridge-photos')){rail.classList.add('water-rail');map.append(rail);rail.open=true}
 q('.editorial-actions')?.setAttribute('hidden','');
 const title=el('strong','八桥全览');title.className='water-selected';cmd.append(title);
 window.addEventListener('comparison-context',e=>{picker.open=false;picker.firstChild.textContent=e.detail?.bridge?.name||'八桥';title.textContent=e.detail?.bridge?.name||'八桥全览'});
 const main=q('header .brand');if(main){main.textContent='← 平江总图';main.href='water/cover.html#bridge'}
 const nav=q('header nav');if(nav){nav.replaceChildren();for(const [label,path] of [['八桥水巷','visitor-compare.html'],['耦园','../exhibit/garden-scene.html'],['昆曲','../exhibit/stage-scene.html'],['自由浏览','water/browse.html']]){const a=el('a',label);a.href=path;nav.append(a)}}
 // Keep a licensed district view available if the external documentary server refuses a request.
 const images=q('.bridge-photos');if(images){const fallback=()=>{
   images.querySelectorAll('.bridge-photo-image img[hidden]').forEach(img=>{const figure=img.closest('figure');if(figure.dataset.fallback)return;figure.dataset.fallback='1';
    const photo=el('img');photo.src='../exhibit/arch.jpg';photo.alt='平江路水巷环境参考，并非所选桥的具名照片';img.parentNode.replaceChildren(photo);
    figure.querySelector('h3').textContent='水巷环境';figure.querySelector('figcaption').textContent='平江路街区参考图，非所选桥实录。Kevin A. McGill · CC BY-SA 2.0';});
 };new MutationObserver(fallback).observe(images,{attributes:true,attributeFilter:['hidden'],subtree:true,childList:true});fallback()}
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
