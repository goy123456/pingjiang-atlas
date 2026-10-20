(()=>{'use strict';if(new URLSearchParams(location.search).get('hub')!=='1')return;
const style=document.createElement('style');style.textContent='body>header{display:none!important}';document.head.append(style);
if(document.getElementById('map-stage')){
 document.body.classList.add('hub-atlas');
 const layout=document.createElement('style');layout.textContent=`
 body.hub-atlas main{max-width:1900px;padding:0 2vw 24px}
 body.hub-atlas .intro{padding:18px 0}body.hub-atlas .intro h1{font-size:30px}
 body.hub-atlas .atlas-layout{grid-template-columns:minmax(0,1fr) 300px;gap:16px}
 body.hub-atlas .viewport{height:auto!important;max-height:none!important;min-height:0;overflow-x:auto;overflow-y:hidden;overscroll-behavior:auto}
 body.hub-atlas #point-list{max-height:none;overflow:visible}
 @media(max-width:850px){body.hub-atlas .atlas-layout{grid-template-columns:1fr}body.hub-atlas aside{grid-template-columns:1fr}body.hub-atlas .intro h1{font-size:25px}}
 `;document.head.append(layout);
 let last=0,queued=false;
 const report=()=>{queued=false;const height=Math.ceil(document.body.getBoundingClientRect().height);if(height>0&&height!==last){last=height;window.parent.postMessage({type:'hub-atlas-height',height},location.origin);}};
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(report);}};
 new ResizeObserver(schedule).observe(document.body);window.addEventListener('load',schedule);schedule();
 document.addEventListener('click',event=>{if(event.target.closest('[data-filter="H"]')){event.preventDefault();event.stopImmediatePropagation();window.parent.postMessage({type:'hub-open-compare'},location.origin);}},true);
}
})();
