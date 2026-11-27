/* Two visual readers. URL fragments and real buttons work without a remote service. */
(()=>{
 'use strict';
 const garden=document.querySelector('[data-garden-guide]'),opera=document.querySelector('[data-opera-guide]');
 const official='https://ylj.suzhou.gov.cn/szsylj/sjyc/202509/b6e90b58ee1947fe9282ad5d7ecdae08.shtml';
 const stone='<path d="m24 174 33-22 16-31 28 2 35-54 27 8 29-48 16 17-6 29 30-16 21 31-7 26 26 2 19 26 40 19 12 20H24Z" fill="#bf9c68"/><g fill="#8e774f"><path d="m57 152 45-29 34-54-8 42-30 26-9 19Z"/><path d="m148 130 44-101-2 41-22 42-2 18Z"/><path d="m197 136 35-77-9 45-15 27 38-15-23 20Z"/></g><g fill="none" stroke="#e6cc97" stroke-width="3"><path d="m99 137 14-27 18-9m27 5 19-31m42 33 16-20m0 53 15-15"/></g>';
 const rooftop=(x,y,w)=>'<g transform="translate('+x+' '+y+')"><path d="M3 4h'+(w-6)+'v22H3z" fill="#f3ecda" stroke="#869487"/><path d="m0 4 9-14h'+(w-18)+'l9 14z" fill="#687d77"/><path d="M8 -6h'+(w-16)+'" fill="none" stroke="#a1b0a2"/><path d="M'+(w/2-6)+' 26V12h12v14" fill="#b3a58b"/></g>';
 const gardenPlan='<svg viewBox="0 0 600 300" role="img" aria-label="耦园布局：西园、中宅、东园自左至右，北侧走马楼相连。"><defs><pattern id="g-lawn" width="9" height="9" patternUnits="userSpaceOnUse"><circle r=".8" cx="4" cy="5" fill="#98a986"/></pattern></defs><rect width="600" height="300" fill="#edece0"/><g fill="none"><path d="M-15 56Q166 38 377 45T570 26Q557 136 566 273Q326 245 -15 272" stroke="#9bbdb6" stroke-width="24"/><path d="M-15 56Q166 38 377 45T570 26Q557 136 566 273Q326 245 -15 272" stroke="#d5e3d8" stroke-width="2"/></g><path d="m41 81 491-12 9 170-500 1Z" fill="#d4ddc6" stroke="#8b9c88" stroke-width="2"/><path d="m41 81 491-12 9 170-500 1Z" fill="url(#g-lawn)"/><g data-area="west">'+rooftop(64,126,112)+rooftop(99,177,63)+'<g fill="#91a08c"><path d="m62 209 14-30 13 12 15-21 13 32z"/><path d="m130 217 15-19 12 3 7-11 12 23z"/></g></g><g data-area="hall"><path d="M211 87h139v141H211z" fill="#e6d9be"/>'+rooftop(223,110,115)+rooftop(223,159,115)+rooftop(223,204,115)+'</g><g data-area="east"><path d="M384 180q-24-31 11-45t54 7q16 18 42 13t29 21q-8 40-54 31t-82-27" fill="#9dbeb4"/><g transform="translate(363 85) scale(.45)">'+stone+'</g>'+rooftop(458,104,55)+'</g><path class="walkway" d="M80 95 287 88 504 85" fill="none" stroke="#914c39" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 8"/><g font-size="13" fill="#526d63"><text x="26" y="24">北 ↑</text><text x="250" y="290">小新桥巷</text></g></svg>';
 const gardenScenes=[
  {key:'west',short:'西园',title:'织帘老屋',type:'西园 · 2009',text:'树影后，一排木格窗。',file:'woven-house.jpg',alt:'织帘老屋檐下的木格窗，窗前有灌木'},
  {key:'hall',short:'中宅',title:'载酒堂',type:'中宅 · 2009',text:'石阶向上，厅门敞开。',file:'wine-hall.jpg',alt:'载酒堂正面的石阶、红柱与敞开的厅门'},
  {key:'east',short:'东园',title:'山水间',type:'东园 · 2009',text:'廊下石台，紧贴池面。',file:'garden.jpg',alt:'山水间临池的石台和红柱敞廊'}
 ];
 const gardensTogether={key:'pair',short:'东西园',title:'隔宅相望',type:'2009',text:''};
 const gardenViews=[...gardenScenes,gardensTogether];
 function wire(host,attr,items,start,paint){
  const buttons=[...host.querySelectorAll('['+attr+']')];
  const fromHash=()=>items.find(s=>'#'+s.key===location.hash);
  const select=(s,write=false)=>{
   host.dataset.active=s.key;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.getAttribute(attr)===s.key)));paint(s);
   if(write&&location.hash!=='#'+s.key)history.pushState(null,'','#'+s.key);
  };
  buttons.forEach(b=>b.onclick=()=>select(items.find(s=>s.key===b.getAttribute(attr)),true));
  addEventListener('hashchange',()=>select(fromHash()||start));
  select(fromHash()||start);
 }
 if(garden){
  garden.classList.add('field-reader','garden-reader');
  garden.innerHTML='<div class="field-head"><div><small>耦园 / 分区图</small><h1>一宅，两座园。</h1></div><span>小新桥巷</span></div><div class="field-grid"><div class="garden-sheet"><div class="field-plan">'+gardenPlan+gardenScenes.map(s=>'<button class="field-pin pin-'+s.key+'" data-place="'+s.key+'" aria-controls="place-figure">'+s.short+'</button>').join('')+'</div><div class="walk-controls"><button aria-pressed="false">看走马楼</button><span>北侧楼廊连接东西两园与中宅。</span></div></div><figure id="place-figure" class="field-figure"><div class="field-image"></div><figcaption aria-live="polite"><small></small><h2></h2><p></p></figcaption></figure></div><details class="field-sources"><summary>布局与图像出处</summary><p><a href="'+official+'">苏州市园林和绿化管理局 · 耦园</a>。分区和楼廊为关系示意，不标游线或拍摄机位。</p><p>织帘老屋、载酒堂：Lamassu Design（Gurdjieff），2009。<a href="ouyuan-open.html">查看原图与许可</a>。黄石图为本站示意。</p></details>';
  const source=document.createElement('p');
  source.innerHTML='东园山水间：Lamassu Design（Gurdjieff），摄于 2009 年 9 月 19 日。<a href="https://commons.wikimedia.org/wiki/File:Couple_garden_amidst_hill_and_water.jpg">照片原作</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>，本站使用缩小版，保留全幅。<a href="https://czju.suzhou.gov.cn/zfcg/html/project/245cc4d9c06c46ebaea096b34d7ce557.shtml">耦园管理处资料：东花园山水间</a>。';
  garden.querySelector('.field-sources').append(source);
  for(const pin of garden.querySelectorAll('.field-pin')){
   const label=document.createElement('span');label.textContent=pin.textContent;pin.replaceChildren(label);
  }
  const cross=document.createElement('a');cross.className='field-cross';cross.href='stage-scene.html#garden-verse';cross.textContent='从园景到曲词 →';garden.querySelector('figcaption').append(cross);
  const art=document.createElement('img'),plan=garden.querySelector('.field-plan'),walk=garden.querySelector('.walk-controls button');
  art.className='garden-window-print';art.alt='套色版画：从同一排廊窗看西边的湖石、中间的厅堂和东边的池岸。';art.width=1774;art.height=887;plan.prepend(art);
  const mode=document.createElement('button');mode.type='button';walk.before(mode);
  const setDrawing=layout=>{
   garden.classList.toggle('window-view',!layout);mode.textContent=layout?'看窗景':'看布局图';
   if(!layout){garden.classList.remove('show-walk');walk.setAttribute('aria-pressed','false')}
  };
  mode.onclick=()=>setDrawing(garden.classList.contains('window-view'));
  walk.onclick=()=>{const on=walk.getAttribute('aria-pressed')!=='true';if(on)setDrawing(true);walk.setAttribute('aria-pressed',String(on));garden.classList.toggle('show-walk',on)};
  art.onerror=()=>{setDrawing(true);mode.hidden=true};
  setDrawing(false);art.src='garden-window-print-v1.webp';
  const artNote=document.createElement('p');artNote.textContent='窗景版画为本站创作的空间意象。右侧实拍对应所选分区，并非从同一扇窗拍摄。';garden.querySelector('.field-sources').append(artNote);
  const compare=document.createElement('button');compare.type='button';compare.dataset.place='pair';compare.textContent='并看东西园';compare.setAttribute('aria-controls','place-figure');walk.after(compare);
  wire(garden,'data-place',gardenViews,gardenScenes[0],s=>{
   cross.href='stage-scene.html?garden='+s.key+'#garden-verse';
   const slot=garden.querySelector('.field-image');
   const photo=place=>{const img=new Image();img.alt=place.alt||place.title+'，2009 年耦园实拍';img.src=place.file;return img};
   if(s.key==='pair'){
    slot.replaceChildren(...[gardenScenes[0],gardenScenes[2]].map(place=>{
     const panel=document.createElement('div'),label=document.createElement('span');label.textContent=place.short+' · '+place.title;panel.append(photo(place),label);return panel
    }));
   }else slot.replaceChildren(photo(s));
   garden.querySelector('figcaption small').textContent=s.type;garden.querySelector('figcaption h2').textContent=s.title;garden.querySelector('figcaption p').textContent=s.text;
  });
  garden.querySelector('.field-head small').remove();garden.querySelector('.field-head h1').textContent='一窗两景';
 }
 if(opera){
  const origin=gardenViews.find(s=>s.key===new URLSearchParams(location.search).get('garden'));
  const back=document.querySelector('[data-garden-return]');
  if(origin&&back){back.href='garden-scene.html#'+origin.key;back.textContent='返回'+origin.short+' · '+origin.title+' →'}
  const soundtrack=document.getElementById('dizi-audio');
  if(soundtrack){
   window.addEventListener('pagehide',()=>soundtrack.pause());
   document.addEventListener('visibilitychange',()=>{if(document.hidden)soundtrack.pause()});
   const error=document.createElement('p');error.className='sound-error';error.setAttribute('role','status');
   soundtrack.after(error);
   const reportError=()=>{error.textContent='竹笛录音未能加载；仍可继续看剧照。'};
   soundtrack.addEventListener('error',reportError);if(soundtrack.error)reportError();
  }
  const cues=[
   {key:'sleeve-study',short:'全幅',title:'两人之间，一把团扇。',x:0,y:0,w:100,h:100},
   {key:'cuffs',short:'水袖',title:'腕抬起，白袖垂落。',x:5,y:14,w:28,h:38},
   {key:'gaze',short:'眉眼',title:'一人侧目，一人抬眼。',x:36,y:16,w:54,h:16},
   {key:'fan',short:'团扇',title:'花扇斜倚在两人之间。',x:55,y:31,w:24,h:18}
  ];
  opera.classList.add('field-reader','opera-reader');
  opera.innerHTML='<div class="field-head"><div><small>昆曲 / 剧照细读</small><h2>《牡丹亭》</h2></div><span>沈丰英 · 舞台剧照</span></div><div class="opera-spread"><figure class="stage-print"><div class="print-register"><img src="opera.jpg" width="651" height="960" alt="浅色与绿色戏衣的两位演员，白袖和花纹团扇在两人之间"><i class="cue-box" aria-hidden="true"></i></div></figure><div class="score"><div class="cue-keys" role="group" aria-label="选择剧照观察点">'+cues.map(s=>'<button data-cue="'+s.key+'" aria-controls="cue-caption">'+s.short+'</button>').join('')+'</div><div id="cue-caption" aria-live="polite"><small></small><h3></h3><p></p></div></div></div>';
  const keys=opera.querySelector('.cue-keys'),plate=document.createElement('div');
  plate.className='gesture-plate';plate.setAttribute('role','group');plate.setAttribute('aria-label','点选版画，在剧照中查看对应部位');
  const print=document.createElement('img');print.alt='袖、眼、扇三联版画';print.width=2172;print.height=724;plate.append(print);
  const picks=[...keys.querySelectorAll('button')].slice(1);
  for(const pick of picks){const label=document.createElement('span');label.textContent=pick.textContent;pick.replaceChildren(label);plate.append(pick)}
  print.onerror=()=>{plate.replaceWith(...picks);for(const pick of picks)pick.classList.add('cue-fallback')};
  keys.before(plate);
  const reset=document.createElement('figcaption');
  opera.querySelector('.stage-print').append(reset);reset.append(keys);
  print.src='kunqu-gesture-print-v1.webp';
  opera.querySelector('.field-head small').remove();
  const caption=opera.querySelector('#cue-caption');
  caption.replaceChildren();
  const title=document.createElement('p'),ns='http://www.w3.org/2000/svg',detail=document.createElementNS(ns,'svg'),excerpt=document.createElementNS(ns,'image'),original=opera.querySelector('.print-register img');
  detail.classList.add('gesture-detail');detail.setAttribute('aria-hidden','true');excerpt.setAttribute('href',original.getAttribute('src'));excerpt.setAttribute('width',original.getAttribute('width'));excerpt.setAttribute('height',original.getAttribute('height'));detail.append(excerpt);caption.append(detail,title);
  wire(opera,'data-cue',cues,cues[0],s=>{
   const box=opera.querySelector('.cue-box');box.hidden=s===cues[0];Object.assign(box.style,{left:s.x+'%',top:s.y+'%',width:s.w+'%',height:s.h+'%'});
   detail.style.display=s===cues[0]?'none':'block';
   const iw=Number(original.getAttribute('width')),ih=Number(original.getAttribute('height'));
   detail.setAttribute('viewBox',[s.x*iw/100,s.y*ih/100,s.w*iw/100,s.h*ih/100].join(' '));
   detail.style.setProperty('--crop-ratio',(s.w*iw)/(s.h*ih));
   title.textContent=s.title;
  });
  if(cues.slice(1).some(c=>'#'+c.key===location.hash))requestAnimationFrame(()=>opera.scrollIntoView());
  const revealVerse=()=>{if(location.hash!=='#garden-verse')return;const leaf=document.getElementById('garden-verse');leaf.open=true;requestAnimationFrame(()=>leaf.scrollIntoView({block:'start'}))};
  addEventListener('hashchange',revealVerse);revealVerse();
 }
})();
