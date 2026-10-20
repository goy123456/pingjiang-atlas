(()=>{'use strict';
const keys=['water','street','bridge'],state={water:true,street:true,bridge:true};
const legend=document.querySelector('.map-legend');
function apply(){
 for(const key of keys){document.body.classList.toggle('hide-layer-'+key,!state[key]);document.querySelector('[data-layer="'+key+'"]')?.setAttribute('aria-pressed',String(state[key]));}
}
function send(){const frame=document.querySelector('.modern-panel iframe');frame?.contentWindow?.postMessage({type:'map-layers',layers:{...state}},location.origin);}
if(legend){
 for(const key of keys){const swatch=legend.querySelector('.legend-'+key),item=swatch.parentElement,button=document.createElement('button');button.type='button';button.dataset.layer=key;button.setAttribute('aria-pressed','true');button.title='显示或隐藏'+item.textContent;button.append(...item.childNodes);item.replaceWith(button);button.onclick=()=>{state[key]=!state[key];apply();send();};}
 const all=document.createElement('button');all.type='button';all.textContent='全部显示';all.onclick=()=>{keys.forEach(k=>state[k]=true);apply();send();};legend.append(all);
 const hint=document.createElement('small');hint.textContent='点击切换高亮与标注，底图保留';legend.append(hint);
 document.querySelector('.modern-panel iframe')?.addEventListener('load',send);
 window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===document.querySelector('.modern-panel iframe')?.contentWindow&&e.data?.type==='map-layers-ready')send();});
}else{
 window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='map-layers')return;const incoming=e.data.layers;if(!incoming||!keys.every(k=>typeof incoming[k]==='boolean'))return;keys.forEach(k=>state[k]=incoming[k]);apply();});
 if(parent!==window)parent.postMessage({type:'map-layers-ready'},location.origin);
}
apply();
})();
