(()=>{'use strict';
const v=document.getElementById('old-viewport'),stage=document.getElementById('old-stage'),img=document.getElementById('old-image'),status=document.getElementById('old-status');
const visitor=document.body.dataset.audience==='visitor';
// Reset the whole comparison document, including its embedded modern map and
// temporary conversation, instead of resetting only one map's zoom.
const resetComparison=document.createElement('button');
resetComparison.type='button';resetComparison.id='compare-reset-all';
resetComparison.textContent='↶ 返回初始视图';
resetComparison.title='重置两张地图、桥梁选择及本轮临时对话';
resetComparison.style.cssText='margin:0 0 16px;padding:10px 18px;border-radius:24px;';
document.getElementById('bridge-list').parentElement.before(resetComparison);
resetComparison.onclick=()=>{if(visitor)document.getElementById('bridge-start')?.click();else location.reload();window.scrollTo(0,0);};
if(visitor)resetComparison.hidden=true;
let zoom=1,drag=null,reading='original',focusedBridge=null,autoFocus=false;
const MAX_ZOOM=32;
let matches=null,pendingSelection=null;
let corridorOverview=visitor;
const marker=document.createElement('div');marker.id='old-marker';marker.hidden=true;stage.append(marker);
function centerAncient(bridge){
 if(!v.clientWidth||!v.clientHeight)return false;
 const point=bridge?.ancient_position,space=matches?.ancient_coordinate_space;
 if(!img.naturalWidth||!space||!point||!Number.isFinite(point.x)||!Number.isFinite(point.y)||point.x<0||point.y<0||point.x>space.width||point.y>space.height)return false;
 focusedBridge=bridge;autoFocus=true;
 corridorOverview=false;
 render();
 // Fit a local area around the bridge, independent of screen width. Keeping
 // this source-space context avoids a tiny bridge on wide/full-height maps.
 const base=stage.offsetWidth/zoom/space.width;
 zoom=Math.min(MAX_ZOOM,Math.max(1,Math.min(v.clientWidth/(1000*base),v.clientHeight/(1100*base))));render();
 marker.dataset.bridge=bridge.id;marker.style.left=(point.x/space.width*100)+'%';marker.style.top=(point.y/space.height*100)+'%';
 marker.textContent=bridge.ancient_name;marker.dataset.label=bridge.ancient_name;marker.hidden=false;
 sizeMarker();
 v.scrollLeft=point.x/space.width*stage.offsetWidth-v.clientWidth/2;
 v.scrollTop=point.y/space.height*stage.offsetHeight-v.clientHeight/2;
 return true;
}
function syncSelection(selection){
 document.getElementById('bridge-start')?.setAttribute('aria-pressed','false');
 pendingSelection=selection;
 if(!matches||!img.naturalWidth)return;
 const bridge=matches.bridges.find(b=>b.id===selection.id);
 const linked=centerAncient(bridge);
 window.dispatchEvent(new CustomEvent('comparison-context',{detail:{bridge,linked}}));
 if(!linked){marker.hidden=true;focusedBridge=null;autoFocus=false;delete marker.dataset.bridge;}
 document.getElementById('sync-status').textContent=['H02','H03','H04','H05'].includes(selection.id)?'一桥入巷，一桥续街':linked?'已定位：'+bridge.ancient_name+' → '+bridge.name:'已选：'+selection.name+' · 仅定位今图。';
 document.querySelectorAll('#bridge-list [data-bridge]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bridge===selection.id)));
 if(bridge){const evidence=document.getElementById('bridge-evidence');evidence.replaceChildren(document.createTextNode('宋图：'+bridge.ancient_name+' → 今：'+bridge.name+(visitor?'':'。'+bridge.status+'。 ')));const a=document.createElement('a');a.textContent='官方出处 · '+bridge.locator+' ↗';a.href=matches.source.url;a.target='_blank';a.rel='noopener noreferrer';if(!visitor)evidence.append(a);}
}
const contrast=document.getElementById('old-contrast'),grid=document.getElementById('old-grid'),region=document.getElementById('old-region');
for(let row=0;row<4;row++)for(let col=0;col<4;col++){
 const name=String.fromCharCode(65+col)+(row+1);
 const cell=document.createElement('span');cell.textContent=name;grid.append(cell);
 const option=document.createElement('option');option.value=col+','+row;option.textContent=name;region.append(option);
}
function setReading(){
 const amount=Number(contrast.value)/100;
 img.style.filter=reading==='original'?'none':reading==='paper'?'grayscale(1) contrast('+amount+') brightness(1.05) sepia(.18)':'grayscale(1) invert(1) contrast('+amount+')';
 contrast.disabled=reading==='original';
 document.getElementById('contrast-value').textContent=reading==='original'?'未处理':contrast.value+'%';
 document.getElementById('reading-description').textContent=reading==='original'?'原貌 · 北朝上。':reading==='paper'?'仅调明暗，非修复图。':'增强对比，保留残损。';
 v.dataset.reading=reading;
 document.querySelectorAll('[data-reading]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.reading===reading)));
}
document.querySelectorAll('[data-reading]').forEach(b=>b.onclick=()=>{reading=b.dataset.reading;setReading()});
contrast.oninput=setReading;setReading();
document.getElementById('grid-toggle').onclick=e=>{grid.hidden=!grid.hidden;e.currentTarget.setAttribute('aria-pressed',String(!grid.hidden))};
document.getElementById('region-focus').onclick=()=>{
 if(!region.value){region.focus();return;}
 const [col,row]=region.value.split(',').map(Number);zoom=4;render();
 v.scrollLeft=stage.offsetWidth*(col+.5)/4-v.clientWidth/2;
 v.scrollTop=stage.offsetHeight*(row+.5)/4-v.clientHeight/2;
 grid.hidden=false;document.getElementById('grid-toggle').setAttribute('aria-pressed','true');
 status.textContent='图面分区 '+region.selectedOptions[0].textContent+' · 非地理定位';
};
function sizeMarker(){
 if(!focusedBridge||!matches)return;
 const scale=stage.offsetWidth/matches.ancient_coordinate_space.width;
 // The frame marks the manually read bridge symbol, without covering it.
 marker.style.width=Math.max(24,180*scale)+'px';
 marker.style.height=Math.max(20,140*scale)+'px';
}
function render(reset=false){
 // Hidden tabs/iframes temporarily have zero dimensions. Never calculate 0/0.
 if(!img.naturalWidth||!v.clientWidth||!v.clientHeight)return;
 if(!Number.isFinite(zoom)||zoom<=0)zoom=1;
 // The viewport follows the unzoomed map ratio, never the zoomed stage height.
 if(visitor){v.style.height=(v.clientWidth*1.55)+'px';v.style.setProperty('--ancient-fit-height',(v.clientWidth*1.55)+'px');}
 else if(document.body.classList.contains('full-map-page'))v.style.setProperty('--ancient-fit-height',(v.clientWidth*img.naturalHeight/img.naturalWidth)+'px');
 const base=Math.min(v.clientWidth/img.naturalWidth,v.clientHeight/img.naturalHeight);
 // Crop the original scan in-place; preserve the coordinates of every overlay.
 if(corridorOverview&&matches){
 const points=matches.bridges.map(b=>b.ancient_position),space=matches.ancient_coordinate_space;
 const sx=img.naturalWidth/space.width,sy=img.naturalHeight/space.height;
 const spanX=(Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x))+400)*sx;
 const spanY=(Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y))+500)*sy;
 zoom=Math.max(1,Math.min(MAX_ZOOM,Math.min(v.clientWidth/spanX,v.clientHeight/spanY)/base));
 }
 const width=img.naturalWidth*base*zoom,height=img.naturalHeight*base*zoom;
 const rect=stage.getBoundingClientRect(),vr=v.getBoundingClientRect();
 const rx=Math.min(1,Math.max(0,(vr.left+v.clientWidth/2-rect.left)/(stage.offsetWidth||1))),ry=Math.min(1,Math.max(0,(vr.top+v.clientHeight/2-rect.top)/(stage.offsetHeight||1)));
 stage.style.width=width+'px';stage.style.height=height+'px';
 img.style.width=width+'px';img.style.height=height+'px';img.style.transform='none';
 stage.style.margin=zoom===1?'0 auto':'0';
 document.getElementById('old-scale').textContent=Math.round(zoom*100)+'%';
 document.getElementById('old-minus').disabled=zoom<=1;document.getElementById('old-plus').disabled=zoom>=MAX_ZOOM;
 v.scrollLeft=reset?0:rx*width-v.clientWidth/2;v.scrollTop=reset?0:ry*height-v.clientHeight/2;
 sizeMarker();
 if(corridorOverview&&matches){
 const points=matches.bridges.map(b=>b.ancient_position);
 const x=(Math.min(...points.map(p=>p.x))+Math.max(...points.map(p=>p.x)))/2;
 const y=(Math.min(...points.map(p=>p.y))+Math.max(...points.map(p=>p.y)))/2;
 v.scrollLeft=x/matches.ancient_coordinate_space.width*width-v.clientWidth/2;v.scrollTop=y/matches.ancient_coordinate_space.height*height-v.clientHeight/2;
 }
}
img.onload=()=>{status.textContent='平江图 · '+img.naturalWidth+' × '+img.naturalHeight+' px';render(true);if(pendingSelection)syncSelection(pendingSelection)};
img.onerror=()=>{status.textContent='古图加载失败，请刷新；来源链接仍可查看。'};
if(img.complete&&img.naturalWidth)img.onload();
v.addEventListener('atlas-manual-pan',()=>{corridorOverview=false;autoFocus=false;});
v.addEventListener('atlas-pinch',e=>{const factor=e.detail?.factor;if(!Number.isFinite(factor)||factor<=0)return;corridorOverview=false;autoFocus=false;zoom=Math.max(1,Math.min(MAX_ZOOM,zoom*factor));render();});
document.getElementById('old-plus').onclick=()=>{corridorOverview=false;autoFocus=false;zoom=Math.min(MAX_ZOOM,zoom*1.5);render()};
document.getElementById('old-minus').onclick=()=>{corridorOverview=false;autoFocus=false;zoom=Math.max(1,zoom/1.5);render()};
document.getElementById('old-reset').onclick=()=>{if(visitor){document.getElementById('bridge-start')?.click();return;}corridorOverview=false;autoFocus=false;focusedBridge=null;marker.hidden=true;zoom=1;render(true)};
if(visitor)document.getElementById('old-reset').textContent='八桥';
v.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,y:e.clientY,l:v.scrollLeft,t:v.scrollTop};v.setPointerCapture(e.pointerId);v.classList.add('dragging');e.preventDefault()});
v.addEventListener('pointermove',e=>{if(drag){v.scrollLeft=drag.l+drag.x-e.clientX;v.scrollTop=drag.t+drag.y-e.clientY}});
for(const event of ['pointerup','pointercancel','lostpointercapture'])v.addEventListener(event,()=>{drag=null;v.classList.remove('dragging')});
new ResizeObserver(()=>{
 if(autoFocus&&focusedBridge){centerAncient(focusedBridge);return;}
 render();
 // A viewport resize must not let browser scroll anchoring displace the selected bridge.
 if(!marker.hidden){v.scrollLeft=parseFloat(marker.style.left)/100*stage.offsetWidth-v.clientWidth/2;v.scrollTop=parseFloat(marker.style.top)/100*stage.offsetHeight-v.clientHeight/2;}
}).observe(v);
window.addEventListener('message',e=>{
 const frame=document.querySelector('iframe');
 if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='atlas-point-selected')return;
 if(typeof e.data.id!=='string'||!/^([CBUFH])\d{2}$/.test(e.data.id)||typeof e.data.name!=='string'||e.data.name.length>100)return;
 syncSelection({id:e.data.id,name:e.data.name});
});
fetch('/pingjiang-atlas/static/data/pingjiang-bridge-matches.json?v=20261018').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
 matches=data;
 if(corridorOverview)render(true);
 const list=document.getElementById('bridge-list'),evidence=document.getElementById('bridge-evidence');
 for(const bridge of data.bridges){const b=document.createElement('button');b.dataset.bridge=bridge.id;b.textContent=bridge.name;b.setAttribute('aria-pressed','false');b.onclick=()=>{
 syncSelection({id:bridge.id,name:bridge.name});
 list.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 if(!visitor){evidence.replaceChildren(document.createTextNode('宋图：'+bridge.ancient_name+' → 今：'+bridge.name+'。'+bridge.status+'。 '));
 const a=document.createElement('a');a.textContent='官方出处 · '+bridge.locator+' ↗';a.href=data.source.url;a.target='_blank';a.rel='noopener noreferrer';evidence.append(a);}
 document.querySelector('iframe').contentWindow.postMessage({type:'select-bridge',id:bridge.id},location.origin);
 };list.append(b);}
 const start=document.createElement('button');start.id='bridge-start';start.type='button';start.textContent='回到起点';start.setAttribute('aria-pressed','false');
 start.onclick=()=>{
  pendingSelection=null;focusedBridge=null;autoFocus=false;corridorOverview=visitor;zoom=1;
  marker.hidden=true;delete marker.dataset.bridge;render(true);
  window.dispatchEvent(new CustomEvent('comparison-context',{detail:{bridge:null,linked:false}}));
  list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===start)));
  evidence.textContent='';document.getElementById('sync-status').textContent='八桥全览 · 点选桥名，古今同游';
  document.querySelector('iframe').contentWindow.postMessage({type:'reset-bridge-overview'},location.origin);
 };list.append(start);
 evidence.textContent=visitor?'':'桥位按新底图人工定位，非测绘配准。';
 if(pendingSelection)syncSelection(pendingSelection);
}).catch(()=>{document.getElementById('bridge-evidence').textContent='对照清单暂未加载，请刷新重试。'});
})();
