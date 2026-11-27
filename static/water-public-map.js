/* Keep the native sketch switch, bridge anchors, routes and pointer handlers. */
(()=>{if(new URLSearchParams(location.search).get('view')!=='bridges')return;
 if(window.frameElement?.closest('.water-compare'))document.body.classList.add('shared-overview');
 const stage=document.getElementById('stage'),ns='http://www.w3.org/2000/svg';
 const mount=()=>{const root=stage.querySelector('#sketch-overlay');if(!root)return false;
  const paper=root.querySelector('g[clip-path]'),base=paper?.querySelector('rect');if(!base)return false;
  const plate=(file,x,y,w,h)=>{const n=document.createElementNS(ns,'image');Object.entries({href:'media/'+file,x,y,width:w,height:h,preserveAspectRatio:'none'}).forEach(([k,v])=>n.setAttribute(k,v));n.style.pointerEvents='none';return n};
  const ink=document.createElementNS(ns,'g');ink.setAttribute('aria-hidden','true');const {width,height}=root.viewBox.baseVal;
  ink.append(plate('water-district.webp',0,0,width,height),plate('water-eight.webp',328,330,196,552),plate('district-pixel-labels.svg',0,0,width,height));
  paper.insertBefore(ink,paper.querySelector('.sketch-bridges'));return true};
 if(!mount()){const obs=new MutationObserver(()=>{if(mount())obs.disconnect()});obs.observe(stage,{childList:true,subtree:true})}
})();
