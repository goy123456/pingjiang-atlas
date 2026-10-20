/* Full-area vector style. Existing OSM geometry remains the spatial basis. */
(()=>{'use strict';
window.installMapSketch=async function(data,select){
 const stage=document.getElementById('stage'),NS='http://www.w3.org/2000/svg';
 const button=document.createElement('button');button.id='sketch-toggle';button.textContent='手绘地图';button.setAttribute('aria-pressed','false');
 document.querySelector('header>div').prepend(button);
 const note=document.createElement('p');note.className='sketch-note';note.hidden=true;
 note.textContent='河街与建筑轮廓沿用原底图 · 屋瓦、水纹和绿地纹理为艺术表现';document.querySelector('.credit').after(note);
 let layer=null,on=false;
 button.disabled=true;
 try{
  const res=await fetch('/pingjiang-atlas/static/media/pingjiang-modern.svg');if(!res.ok)throw Error();
  const source=new DOMParser().parseFromString(await res.text(),'image/svg+xml').documentElement;
  const make=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);parent?.append(e);return e;};
  layer=make('svg',{id:'sketch-overlay',viewBox:`0 0 ${data.width} ${data.height}`,'aria-hidden':'true'});
  const defs=make('defs',{},layer),clip=make('clipPath',{id:'sketch-region'},defs);
  make('rect',{x:0,y:0,width:data.width,height:data.height},clip);
  const roof=make('pattern',{id:'sketch-roofs',width:3.5,height:3.5,patternUnits:'userSpaceOnUse',patternTransform:'rotate(-12)'},defs);
  make('rect',{width:3.5,height:3.5,fill:'#a4aaa1'},roof);
  make('path',{d:'M0 0V3.5 M1.75 0V3.5',stroke:'#6d7974','stroke-width':'.32',opacity:'.65'},roof);
  const water=make('pattern',{id:'sketch-water',width:14,height:13,patternUnits:'userSpaceOnUse'},defs);
  make('rect',{width:14,height:13,fill:'#a3c6c4'},water);
  make('path',{d:'M2 5Q5 3 8 5M7 10Q10 8 13 10',stroke:'#e2f0df','stroke-width':'.65',fill:'none',opacity:'.75'},water);
  const greens=make('pattern',{id:'sketch-greens',width:18,height:18,patternUnits:'userSpaceOnUse'},defs);
  make('rect',{width:18,height:18,fill:'#bed0aa'},greens);
  make('path',{d:'M3 5q2-3 4 0M11 13q2-3 4 0',stroke:'#8da681','stroke-width':'.6',fill:'none',opacity:'.65'},greens);
  const patch=make('g',{'clip-path':'url(#sketch-region)'},layer);
  make('rect',{x:0,y:0,width:data.width,height:data.height,fill:'#f4edda'},patch);
  for(const original of source.querySelectorAll(':scope > g')){
   const g=original.cloneNode(true);g.querySelectorAll('text').forEach(e=>{e.setAttribute('font-size','12');e.setAttribute('font-family','Microsoft YaHei, sans-serif');e.setAttribute('fill','#536454');e.setAttribute('paint-order','stroke');e.setAttribute('stroke','#f4edda');e.setAttribute('stroke-width','3');});
   const fill=g.getAttribute('fill');
   if(fill==='#e0e7cf'){g.setAttribute('fill','url(#sketch-greens)');g.setAttribute('stroke','#7f9a79');g.setAttribute('stroke-width','.5');}
   if(fill==='#b4d2d5'){
    g.setAttribute('fill','url(#sketch-water)');
    g.querySelectorAll('.waterline').forEach(p=>{p.setAttribute('fill','none');p.setAttribute('stroke','#a3c6c4');p.setAttribute('stroke-width','5');});
   }
   if(fill==='#e5dfd2'){g.setAttribute('fill','url(#sketch-roofs)');g.setAttribute('stroke','#65736c');g.setAttribute('stroke-width','.55');}
   if(g.getAttribute('stroke')==='#fffdf6'){
    g.setAttribute('stroke','#fffaf0');g.querySelectorAll('.major').forEach(p=>p.setAttribute('stroke-width','7'));g.querySelectorAll('.minor').forEach(p=>p.setAttribute('stroke-width','3'));
   }
   patch.append(g);
  }
  const bridges=make('g',{'class':'sketch-bridges'},patch);
  for(const p of data.points){
   if(!p.bridge_path)continue;
   make('path',{d:p.bridge_path,fill:'none',stroke:'#594f40','stroke-width':'5.3','stroke-linecap':'square'},bridges);
   make('path',{d:p.bridge_path,fill:'none',stroke:'#d9c59f','stroke-width':'3.8','stroke-linecap':'square'},bridges);
   make('path',{d:p.bridge_path,fill:'none',stroke:'#8f795a','stroke-width':'.7','stroke-dasharray':'.6 1.2'},bridges);
  }
  stage.insertBefore(layer,document.getElementById('relations-overlay'));layer.hidden=true;
  button.disabled=false;
  button.onclick=()=>{on=!on;layer.style.display=on?'block':'none';layer.hidden=!on;note.hidden=!on;button.setAttribute('aria-pressed',String(on));};
  if(new URLSearchParams(location.search).get('sketch')!=='0')button.click();
 }catch{button.textContent='手绘层暂不可用';}
};
})();
