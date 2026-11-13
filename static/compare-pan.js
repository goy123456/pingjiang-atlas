/* Approximate bridge-anchored navigation, not a georeferenced map overlay. */
(function(){'use strict';
function similarity(pairs){
 const n=pairs.length;if(n<2)throw Error('Two anchors required');
 const mean=side=>[0,1].map(k=>pairs.reduce((s,p)=>s+p[side][k],0)/n);
 const u=mean(0),v=mean(1);let den=0,a=0,b=0;
 for(const [p,q] of pairs){const x=p[0]-u[0],y=p[1]-u[1],X=q[0]-v[0],Y=q[1]-v[1];den+=x*x+y*y;a+=x*X+y*Y;b+=x*Y-y*X;}
 if(den<1e-12)throw Error('Degenerate anchors');a/=den;b/=den;
 const d=a*a+b*b;if(d<1e-12)throw Error('Degenerate transform');
 return {forward:p=>[v[0]+a*(p[0]-u[0])-b*(p[1]-u[1]),v[1]+b*(p[0]-u[0])+a*(p[1]-u[1])],
 inverse:p=>[u[0]+(a*(p[0]-v[0])+b*(p[1]-v[1]))/d,u[1]+(-b*(p[0]-v[0])+a*(p[1]-v[1]))/d]};
}
function safeCenter(p,w,h,vw,vh,m){
 const det=m.a*m.d-m.b*m.c;
 const hx=(Math.abs(m.d)*vw+Math.abs(m.c)*vh)/(2*Math.abs(det))+2;
 const hy=(Math.abs(m.b)*vw+Math.abs(m.a)*vh)/(2*Math.abs(det))+2;
 const clamp=(x,half,size)=>half*2>=size?size/2:Math.max(half,Math.min(size-half,x));
 return [clamp(p[0],hx,w),clamp(p[1],hy,h)];
}
function touchMetrics(points){
 const p=[...points];if(!p.length)return null;
 if(p.length===1)return {x:p[0].x,y:p[0].y,distance:0};
 return {x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2,distance:Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)};
}
function linkedZoomFactor(factor,states){
 if(!Number.isFinite(factor)||factor<=0||!states.length||states.some(s=>![s.zoom,s.min,s.max].every(Number.isFinite)||s.zoom<=0||s.min<=0||s.max<s.min))return 1;
 const low=Math.max(...states.map(s=>s.min/s.zoom)),high=Math.min(...states.map(s=>s.max/s.zoom));
 return Math.max(low,Math.min(high,factor));
}
if(typeof module==='object'&&module.exports){module.exports={similarity,safeCenter,touchMetrics,linkedZoomFactor};return;}
const base=new URL('.',document.currentScript.src);
function start(){
 const frame=document.querySelector('.modern-panel iframe'),oldV=document.getElementById('old-viewport'),oldS=document.getElementById('old-stage');
 if(!frame||!oldV)return;
 let mapping,modernSize,oldSize,modern,source=null,raf=0,linked=true;
 const old={v:oldV,s:oldS};
 window.addEventListener('comparison-context',()=>{source=null;});
 const hint=document.createElement('p');hint.className='pan-link-hint';hint.textContent='双图拖拽联动 · 按八桥位置近似对应 · 到边界自动停住';hint.style.cssText='font-size:12px;color:#68766b;margin:8px 0';frame.closest('.comparison').before(hint);
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('compare-touch.css?v=20261111touch',base);document.head.append(css);
 const controls=document.createElement('div');controls.className='compare-controls';controls.setAttribute('aria-label','地图操作');hint.before(controls);
 function button(text,action){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=action;controls.append(b);return b;}
 const link=button('双图联动：开',()=>{linked=!linked;link.textContent='双图联动：'+(linked?'开':'关');link.setAttribute('aria-pressed',String(linked));});link.setAttribute('aria-pressed','true');
 button('回到起点',()=>document.getElementById('bridge-start')?.click());
 const large=button('大屏模式',()=>{const on=document.body.classList.toggle('touch-display');large.setAttribute('aria-pressed',String(on));large.textContent=on?'退出大屏模式':'大屏模式';window.dispatchEvent(new Event('resize'));});large.setAttribute('aria-pressed','false');
 const full=button('进入全屏',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{hint.textContent='浏览器未允许全屏，可用浏览器全屏功能，或直接打开当前古今对照页。';}});
 document.addEventListener('fullscreenchange',()=>{full.textContent=document.fullscreenElement?'退出全屏':'进入全屏';});
 const help=document.createElement('span');help.textContent='单指拖动 · 双指缩放 · 在地图外滑动页面';controls.append(help);
 Promise.all(['pingjiang-bridge-matches.json','pingjiang-modern.json'].map(name=>fetch(new URL('data/'+name,base)).then(r=>{if(!r.ok)throw Error('Map data unavailable');return r.json();}))).then(([a,b])=>{
  oldSize=[a.ancient_coordinate_space.width,a.ancient_coordinate_space.height];modernSize=[b.width,b.height];
  const pairs=a.bridges.flatMap(p=>{const q=b.points.find(q=>q.id===p.id);return p.ancient_position&&q?.xy?[[[p.ancient_position.x,p.ancient_position.y],q.xy]]:[];});
  mapping=similarity(pairs);schedule();
 }).catch(()=>{hint.textContent='联动资料暂未加载，可刷新重试；两图仍可独立查看。';});
 function geometry(view){
  const {v,s}=view,w=s.offsetWidth,h=s.offsetHeight;if(!w||!h||!v.clientWidth||!v.clientHeight)return null;
  const transform=s.ownerDocument.defaultView.getComputedStyle(s).transform;
  const m=new DOMMatrix(transform==='none'?undefined:transform),r=s.getBoundingClientRect(),vr=v.getBoundingClientRect();
  const minX=Math.min(0,m.a*w,m.c*h,m.a*w+m.c*h),minY=Math.min(0,m.b*w,m.d*h,m.b*w+m.d*h);
  const x=vr.left+v.clientLeft+v.clientWidth/2-(r.left-minX),y=vr.top+v.clientTop+v.clientHeight/2-(r.top-minY),det=m.a*m.d-m.b*m.c;
  return {w,h,m,p:[(m.d*x-m.c*y)/det,(-m.b*x+m.a*y)/det]};
 }
 function move(view,p,limit=true){
  const g=geometry(view);if(!g)return;
  if(limit)p=safeCenter(p,g.w,g.h,view.v.clientWidth,view.v.clientHeight,g.m);
  const dx=p[0]-g.p[0],dy=p[1]-g.p[1];
  if(Math.abs(dx)+Math.abs(dy)<0.5)return;
  view.v.scrollLeft+=g.m.a*dx+g.m.c*dy;view.v.scrollTop+=g.m.b*dx+g.m.d*dy;
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(update);}
 function update(){
  raf=0;if(!modern)return;
  const g=geometry(modern);if(!g)return;
  move(modern,g.p); // Inverse-rotated viewport corners stay inside the real map.
  if(!mapping||!source||!linked){source=null;return;}
  const from=source,to=from===old?modern:old,fg=geometry(from),tg=geometry(to);if(!fg||!tg)return;
  const fs=from===old?oldSize:modernSize,ts=from===old?modernSize:oldSize;
  const point=[fg.p[0]/fg.w*fs[0],fg.p[1]/fg.h*fs[1]];
  const mapped=from===old?mapping.forward(point):mapping.inverse(point);
  move(to,[mapped[0]/ts[0]*tg.w,mapped[1]/ts[1]*tg.h]);
  // When the receiving map hits an edge, stop the driving map there too.
  const actual=geometry(to),actualPoint=[actual.p[0]/actual.w*ts[0],actual.p[1]/actual.h*ts[1]];
  const back=from===old?mapping.inverse(actualPoint):mapping.forward(actualPoint);
  move(from,[back[0]/fs[0]*fg.w,back[1]/fs[1]*fg.h]);
  source=null;
 }
 function bind(view){
  const v=view.v;v.style.touchAction='none';v.style.overscrollBehavior='contain';
  v.addEventListener('atlas-zoom-request',e=>{
   if(!linked||!modern||!mapping)return;e.preventDefault();
   const views=[old,modern],states=views.map(x=>({zoom:Number(x.v.dataset.zoom),min:Number(x.v.dataset.minZoom),max:Number(x.v.dataset.maxZoom)}));
   const factor=linkedZoomFactor(e.detail.factor,states);
   for(const target of views)target.v.dispatchEvent(new CustomEvent('atlas-pinch',{detail:{factor,sync:true}}));
   source=view;schedule();
  });
  v.addEventListener('wheel',()=>{v.dispatchEvent(new CustomEvent('atlas-manual-pan'));source=view;schedule();},{passive:true});
  const pointers=new Map();let previous=null;
  v.addEventListener('pointerdown',e=>{
   if(e.target.closest('button')||(e.pointerType==='mouse'&&e.button!==0))return;
   e.stopImmediatePropagation();e.preventDefault();v.setPointerCapture(e.pointerId);
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});previous=touchMetrics(pointers.values());
   v.dispatchEvent(new CustomEvent('atlas-manual-pan'));
  },true);
  v.addEventListener('pointermove',e=>{
   if(!pointers.has(e.pointerId))return;e.stopImmediatePropagation();e.preventDefault();
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const next=touchMetrics(pointers.values());
   if(previous&&next){
    const before=geometry(view),rect=v.getBoundingClientRect();
    const ox=previous.x-rect.left-v.clientLeft-v.clientWidth/2,oy=previous.y-rect.top-v.clientTop-v.clientHeight/2;
    const inverse=(m,x,y)=>{const d=m.a*m.d-m.b*m.c;return [(m.d*x-m.c*y)/d,(-m.b*x+m.a*y)/d];};
    if(before){
     const delta=inverse(before.m,ox,oy),anchor=[(before.p[0]+delta[0])/before.w,(before.p[1]+delta[1])/before.h];
     if(previous.distance>4&&next.distance>4)v.dispatchEvent(new CustomEvent('atlas-pinch',{detail:{factor:Math.max(.5,Math.min(2,next.distance/previous.distance))}}));
     const after=geometry(view),dx=next.x-rect.left-v.clientLeft-v.clientWidth/2,dy=next.y-rect.top-v.clientTop-v.clientHeight/2,offset=inverse(after.m,dx,dy);
     move(view,[anchor[0]*after.w-offset[0],anchor[1]*after.h-offset[1]],view!==old||after.w>=v.clientWidth);
    }
   }
   previous=next;source=view;schedule();
  },true);
  for(const type of ['pointerup','pointercancel','lostpointercapture'])v.addEventListener(type,e=>{pointers.delete(e.pointerId);previous=touchMetrics(pointers.values());});
  v.addEventListener('keydown',e=>{const directions={ArrowLeft:[-45,0],ArrowRight:[45,0],ArrowUp:[0,-45],ArrowDown:[0,45]};const d=directions[e.key];if(!d)return;e.preventDefault();v.scrollLeft+=d[0];v.scrollTop+=d[1];source=view;schedule();});
  v.addEventListener('scroll',schedule,{passive:true});
  new MutationObserver(schedule).observe(view.s,{attributes:true,attributeFilter:['style']});
  new ResizeObserver(schedule).observe(v);
 }
 bind(old);
 function attach(){try{const doc=frame.contentDocument,v=doc?.getElementById('viewport'),s=doc?.getElementById('stage');if(!v||!s||modern?.v===v)return;modern={v,s};v.tabIndex=0;bind(modern);const style=doc.createElement('style');style.textContent='header{min-height:54px;padding:4px 8px!important}header:before{display:none!important}header button{min-width:44px;min-height:44px;font-size:14px}body.comparison-map #viewport{height:calc(100dvh - 62px)!important;min-height:120px}.pin{min-width:40px;min-height:40px}';doc.head.append(style);doc.getElementById('map-image')?.addEventListener('load',schedule);schedule();}catch{}}
 frame.addEventListener('load',attach);attach();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
