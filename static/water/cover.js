(() => {
  const nav=document.querySelector('.landscape'),ground=nav.querySelector('.ground');
  const links=[...nav.querySelectorAll('a[data-scene]')];
  // A small photographic glimpse inside the landmark footprint, never another menu.
  const photos={bridge:'../../exhibit/arch.jpg',garden:'../../exhibit/garden.jpg',stage:'../../exhibit/opera.jpg'};
  for(const a of links){const peek=document.createElement('img');peek.className='scene-peek';peek.alt='';peek.hidden=true;a.prepend(peek);
    const show=()=>{if(!peek.getAttribute('src'))peek.src=photos[a.dataset.scene];peek.hidden=false};
    peek.onerror=()=>{peek.hidden=true};a.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')show()});a.addEventListener('pointerleave',()=>{peek.hidden=true});
    a.addEventListener('focus',()=>{if(a.matches(':focus-visible')&&!a.hasAttribute('aria-current'))show()});a.addEventListener('blur',()=>{peek.hidden=true});
  }
  function restore(){for(const a of links){const chosen=location.hash==='#'+a.dataset.scene;
    if(chosen){a.setAttribute('aria-current','location');a.focus({preventScroll:true});}else a.removeAttribute('aria-current');}}
  links.forEach(a=>a.addEventListener('click',e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey)history.replaceState(null,'','#'+a.dataset.scene);}));
  addEventListener('pageshow',restore);restore();
  fetch('../data/pingjiang-modern.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{
    const xy=id=>d.points.find(p=>p.id===id).xy;
    const a=xy('H02'),b=xy('H03'),points=[[(a[0]+b[0])/2,(a[1]+b[1])/2],xy('U03'),xy('C01')];
    for(const p of d.points.filter(p=>/^H0[1-8]$/.test(p.id)&&p.bridge_path)){
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',p.bridge_path);ground.querySelector('svg').append(path);}
    const clamp=(n,l,h)=>Math.max(l,Math.min(n,h));
    function frame(){const w=nav.clientWidth,h=nav.clientHeight;
      const size=Math.min((w-links[0].offsetWidth-42)/(points[1][0]-points[0][0]),(h-135)/(points[2][1]-points[0][1]));
      const s=Math.max(.18,size);
      function offset(dim,mapDim,mid){
        const start=(dim-mapDim*s)/2;return mapDim*s<dim?start:clamp(dim/2-mid*s,dim-mapDim*s,0);}
      const x=offset(w,d.width,(points[0][0]+points[1][0])/2),y=offset(h,d.height,(points[0][1]+points[2][1])/2-14);
      Object.assign(ground.style,{left:x+'px',top:y+'px',width:d.width*s+'px',height:d.height*s+'px'});
      links.forEach((link,i)=>{link.style.left=(x+s*points[i][0])+'px';link.style.top=(y+s*points[i][1])+'px';});
    }
    frame();new ResizeObserver(frame).observe(nav);
  }).catch(()=>{ground.hidden=true;/* The three chapter links still work without map data. */});
})();
