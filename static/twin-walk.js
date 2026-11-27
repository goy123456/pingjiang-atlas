(()=>{
 const q=s=>document.querySelector(s),dlg=q('#tw-walk'),entry=q('#tw-entry');if(!dlg||!entry)return;
 q('.water-command')?.prepend(entry);
 const next=q('#tw-next'),step=q('#tw-step'),caption=q('#tw-caption'),person=q('#tw-person'),map=dlg.querySelector('.tw-map');
 const paths=[q('#tw-east'),q('#tw-south')],picks=[...dlg.querySelectorAll('[data-pick]')];
 const names={H02:'胡厢使桥',H03:'唐家桥'};
 let mode='start',raf=0,selected='H03';
 function say(k,t,action){step.textContent=k;caption.textContent=t;next.hidden=!action;next.textContent=action||''}
 function state(m){mode=m;dlg.dataset.mode=m;
   if(m!=='pair')atlasWalkUrl.save(m==='start'?'H02':'H03',m==='cross'?'choose':m);
   q('#tw-onward').hidden=!['arrived','won','pair'].includes(m);
   const pair=m==='pair',interactive=pair||m==='choose';
   q('#tw-old').hidden=!pair;q('.tw-now figcaption').hidden=!pair;q('.tw-end').hidden=!pair;
   map.setAttribute('viewBox',pair?'385 487 37 25':'378 484 48 32');
   picks.forEach(p=>{p.setAttribute('tabindex',interactive?'0':'-1');p.setAttribute('aria-label',pair?names[p.dataset.pick]:p.dataset.pick==='H02'?'选东西向的桥':'选南北向的桥');
     if(!pair)p.removeAttribute('aria-pressed')});
 }
 function pos(i,t,bob=0){const p=paths[i].getPointAtLength(t*paths[i].getTotalLength());person.setAttribute('transform','translate('+p.x+' '+(p.y-bob)+')')}
 function sprite(i){person.querySelector('image').setAttribute('href','media/double-bridge-pixel-'+(i?'south':'east')+'.png')}
 function reset(){cancelAnimationFrame(raf);state('start');delete dlg.dataset.miss;delete dlg.dataset.bridge;next.disabled=false;dlg.querySelector('details').open=false;
   paths.forEach((p,i)=>p.classList.toggle('active',i===0));sprite(0);pos(0,0);
   say('① 跟着走 · 曹胡徐巷','先从巷口走到河对岸。','向东过河 →');next.focus({preventScroll:true})}
 function walk(i,done){cancelAnimationFrame(raf);sprite(i);next.disabled=true;pos(i,0);
   const finish=()=>{pos(i,1);next.disabled=false;done()};
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
   const begin=performance.now(),duration=i?2300:3100;
   function tick(now){const t=Math.min(1,(now-begin)/duration);pos(i,t,Math.abs(Math.sin(t*Math.PI*14))*.09);
     if(t<1)raf=requestAnimationFrame(tick);else finish()}raf=requestAnimationFrame(tick)}
 function choose(){state('choose');delete dlg.dataset.miss;sprite(1);pos(1,0);
   say('② 自己认桥 · 点桥面','你在平江河东岸。沿平江路向南，该过哪座桥？');
   picks[0].focus({preventScroll:true})}
 function selectPair(id){selected=id;atlasWalkUrl.save(id,'pair');dlg.dataset.bridge=id;picks.forEach(p=>p.setAttribute('aria-pressed',String(p.dataset.pick===id)));
   say('③ 对读古今 · 点右图换桥',id==='H02'?'胡厢使桥：从巷口跨主河，到东岸。':'唐家桥：沿街跨支河，继续向南。','回八桥看资料 →')}
 function pick(id){
   if(mode==='pair'){selectPair(id);return}
   if(mode!=='choose')return;
   if(id==='H02'){dlg.dataset.miss='true';say('② 再看河岸','这座桥通往西岸的曹胡徐巷。要沿东岸向南，再找找。');return}
   delete dlg.dataset.miss;state('cross');say('② 过支河','对了，沿平江路过唐家桥。');
   walk(1,won)
 }
 picks.forEach(p=>{p.onclick=()=>pick(p.dataset.pick);p.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(p.dataset.pick)}}});
 next.onclick=()=>{
   if(mode==='start'){say('① 第一段 · 过主河','沿曹胡徐巷过胡厢使桥。','过河中…');walk(0,turn)}
   else if(mode==='turn'){paths[1].classList.add('active');say('① 第二段 · 沿街','沿平江路过唐家桥。','过桥中…');walk(1,arrived)}
   else if(mode==='arrived')choose();
   else if(mode==='won'){state('pair');selectPair('H03');picks[1].focus({preventScroll:true})}
   else if(mode==='pair'){const dest=q('#bridge-list [data-bridge="'+selected+'"]');dlg.close();dest?.click()}
 };
 function turn(){state('turn');pos(0,1);say('① 转角 · 平江路','过了胡厢使桥，沿平江路向南就是唐家桥。','沿街向南 ↓')}
 function arrived(){state('arrived');say('① 终点 · 唐家桥南','两座桥，一座过主河，一座接续沿河的街。','自己认桥 →')}
 function won(){state('won');say('② 已到南岸','街没有断，桥下换成了胡厢使河。','对照古图 →');next.focus({preventScroll:true})}
 function open(dest){
   if(!dlg.open)dlg.showModal();reset();
   if(dest?.step==='pair'){state('pair');selectPair(dest.id);picks[dest.id==='H02'?0:1].focus({preventScroll:true});return}
   if(dest?.id!=='H03')return;
   turn();
   if(!['arrived','choose','won'].includes(dest.step))return;
   paths[1].classList.add('active');sprite(1);pos(1,1);
   if(dest.step==='choose')choose();else if(dest.step==='won')won();else arrived()
 }
 window.addEventListener('walk-enter-twin',e=>open(e.detail));
 q('#tw-onward').onclick=()=>{dlg.close();window.dispatchEvent(new Event('walk-leave-twin'))};
 entry.onclick=open;q('#tw-close').onclick=()=>dlg.close();q('#tw-replay').onclick=reset;
 dlg.addEventListener('close',()=>{if(dlg.open)return;cancelAnimationFrame(raf);atlasWalkUrl.leave();if(!document.querySelector('dialog[open]')&&!entry.hidden)entry.focus({preventScroll:true})});
})();
