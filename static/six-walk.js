(()=>{
 const q=s=>document.querySelector(s),d=q('#sw-walk'),entry=q('#sw-entry'),twin=q('#tw-entry');
 if(!d||!entry)return;
 const routes=JSON.parse(q('#sw-routes').textContent),by=new Map(routes.map(r=>[r.id,r]));
 const pick=q('#sw-picker'),map=q('#sw-map'),go=q('#sw-go'),trail=q('#sw-trail'),ink=q('#sw-ink'),actor=q('#sw-person'),art=actor.querySelector('image');
 let r,selected=null,raf=0,phase='ready',beforeOpen;
 const stops=routes.flatMap(a=>a.id==='H01'?[a,{id:'H02',name:'胡厢使桥 → 唐家桥'}]:[a]);
 for(const a of stops)pick.add(new Option(a.name,a.id));
 twin.after(entry);
 function context(id){selected=id;entry.hidden=id==='H02'||id==='H03';twin.hidden=by.has(id);entry.textContent=by.has(id)?'走一遍'+by.get(id).name+' ↱':'走一遍八桥 ↱'}
 window.addEventListener('comparison-context',e=>context(e.detail?.bridge?.id));
 const ns='http://www.w3.org/2000/svg';
 function pin(pt,text,below){
   const group=document.createElementNS(ns,'g'),dot=document.createElementNS(ns,'circle'),lab=document.createElementNS(ns,'text');
   group.setAttribute('transform','translate('+pt.join(' ')+')');dot.setAttribute('r','.27');lab.setAttribute('y',below?'2.1':'-1.4');
   lab.textContent=text;group.append(dot,lab);q('#sw-pins').append(group);
 }
 function draw(t){
   const len=trail.getTotalLength(),dist=t*len,p=trail.getPointAtLength(dist),a=trail.getPointAtLength(Math.max(0,dist-.06)),b=trail.getPointAtLength(Math.min(len,dist+.06));
   const dx=b.x-a.x,dy=b.y-a.y,vertical=Math.abs(dy)>Math.abs(dx);
   const file='media/double-bridge-pixel-'+(vertical&&dy>0?'south':'east')+'.png';
   if(art.getAttribute('href')!==file)art.setAttribute('href',file);
   art.setAttribute('transform',dx<0&&!vertical?'scale(-1 1)':'scale(1)');actor.setAttribute('transform','translate('+p.x+' '+p.y+')');
   ink.setAttribute('stroke-dasharray',t+' '+(1.001-t));ink.style.visibility=t?'visible':'hidden';
 }
 function render(id){
   cancelAnimationFrame(raf);r=by.get(id);phase='ready';d.dataset.walk=id;d.dataset.phase=phase;pick.value=id;
   q('#sw-title').textContent=r.name;q('#sw-step').textContent='起点 · '+r.start;q('#sw-caption').textContent=r.start+' → '+r.name+' → '+r.end;
   q('#sw-source').textContent='苏州市志办《平江河上的老桥》 · 第'+r.locator+'条';q('#sw-walk details').open=false;
   const path=pts=>'M'+pts.map(p=>p.join(',')).join(' L');trail.setAttribute('d',path(r.line));ink.setAttribute('d',path(r.line));q('#sw-deck').setAttribute('d',path(r.deck));
   const start=r.line[0],end=r.line.at(-1),xs=r.line.map(p=>p[0]),ys=r.line.map(p=>p[1]);
   const w=Math.max(43,Math.max(...xs)-Math.min(...xs)+17,(Math.max(...ys)-Math.min(...ys)+12)*1.55),h=w/1.55;
   map.setAttribute('viewBox',[(Math.min(...xs)+Math.max(...xs)-w)/2,(Math.min(...ys)+Math.max(...ys)-h)/2,w,h].join(' '));
   map.setAttribute('aria-label',r.name+'局部今图，'+r.start+'经过桥面至'+r.end);
   q('#sw-pins').replaceChildren();pin(start,r.start,true);pin(end,r.end,true);
   go.disabled=false;go.textContent='出发过桥 →';draw(0);atlasWalkUrl.save(id,'ready')
 }
 function stop(){cancelAnimationFrame(raf);phase='done';d.dataset.phase=phase;draw(1);go.disabled=false;go.textContent='再走一次 ↺';q('#sw-step').textContent='抵达 · '+r.end;q('#sw-caption').textContent=r.note;atlasWalkUrl.save(r.id,'done')}
 function walk(){
   if(phase==='walking')return;phase='walking';atlasWalkUrl.save(r.id,'ready');d.dataset.phase=phase;go.disabled=true;go.textContent='过桥中…';q('#sw-caption').textContent='走过'+r.name+'，桥下是'+r.river+'。';q('#sw-step').textContent='途中 · '+r.start;
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){stop();return}
   const begin=performance.now();function tick(now){const t=Math.min(1,(now-begin)/3500);draw(t);if(t<1)raf=requestAnimationFrame(tick);else stop()}raf=requestAnimationFrame(tick)
 }
 function open(id){beforeOpen=document.activeElement;d.showModal();render(by.has(id)?id:routes[0].id);go.focus({preventScroll:true})}
 function advance(id){
   if(id==='H02'){cancelAnimationFrame(raf);d.close();window.dispatchEvent(new Event('walk-enter-twin'));return}
   render(id);go.focus({preventScroll:true})
 }
 window.addEventListener('walk-leave-twin',()=>open(stops[stops.findIndex(a=>a.id==='H02')+1].id));
 entry.onclick=()=>open(selected);go.onclick=walk;pick.onchange=()=>advance(pick.value);q('#sw-close').onclick=()=>d.close();
 q('#sw-next').onclick=()=>advance(stops[(stops.findIndex(a=>a.id===r.id)+1)%stops.length].id);
 q('#sw-record').onclick=()=>{d.close();q('#bridge-list [data-bridge="'+r.id+'"]')?.click()};
 d.addEventListener('close',()=>{if(d.open)return;cancelAnimationFrame(raf);atlasWalkUrl.leave();if(!document.querySelector('dialog[open]')&&beforeOpen?.isConnected&&!beforeOpen.hidden)beforeOpen.focus({preventScroll:true})});
 function restore(){
   const dest=atlasWalkUrl.read(),tw=q('#tw-walk');
   if(!dest){if(d.open)d.close();if(tw.open)tw.close();return}
   if(by.has(dest.id)){
     if(tw.open)tw.close();if(d.open)render(dest.id);else open(dest.id);if(dest.step==='done')stop();
   }else{
     if(d.open)d.close();window.dispatchEvent(new CustomEvent('walk-enter-twin',{detail:dest}));
   }
 }
 window.addEventListener('hashchange',restore);restore();
})();
