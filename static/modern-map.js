(()=>{'use strict';
const ugcMode=new URLSearchParams(location.search).get('ugc')==='1';
const visitor=document.body.dataset.audience==='visitor';
const $=id=>document.getElementById(id),v=$('viewport'),stage=$('stage');let profiles=[],data,zoom=1,selected=null,drag=null,pending=null;
const NS='http://www.w3.org/2000/svg',overlay=document.createElementNS(NS,'svg');overlay.id='relations-overlay';overlay.setAttribute('aria-hidden','true');stage.insertBefore(overlay,$('markers'));
const relation=document.createElement('div');relation.id='relationship';$('detail').after(relation);
const labels=document.createElement('div');labels.id='relation-labels';stage.append(labels);
function drawLabels(){
 labels.replaceChildren();document.querySelectorAll('.pin.pair-replaced').forEach(b=>b.classList.remove('pair-replaced'));
 if(!selected?.relationship||!selected.xy||zoom<2)return;
 const pair=data.points.find(q=>q.id===selected.relationship.pair),members=pair?[selected,pair]:[selected];
 const main=members.find(q=>!['H03','H05'].includes(q.id))||selected;
 const scale=stage.offsetWidth/data.width,cx=main.xy[0]*scale,cy=main.xy[1]*scale;
 const offset=Math.min(88,Math.max(62,v.clientWidth/2-86));
 const lines=document.createElementNS(NS,'svg');lines.setAttribute('width',stage.offsetWidth);lines.setAttribute('height',stage.offsetHeight);labels.append(lines);
 for(const q of members){
  const side=q===main?-1:1,x=q.xy[0]*scale,y=q.xy[1]*scale;
  const tx=x+side*offset,ty=y+(side<0?-36:34);
  const line=document.createElementNS(NS,'path');line.setAttribute('d',`M${x} ${y} L${tx} ${ty}`);lines.append(line);
  const dot=document.createElementNS(NS,'circle');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r',4);lines.append(dot);
  const button=document.createElement('button');button.className='bridge-callout';button.textContent=q.name;button.setAttribute('aria-label','定位'+q.name);button.setAttribute('aria-pressed',String(q===selected));button.style.left=tx+'px';button.style.top=ty+'px';button.onclick=()=>select(q.id);labels.append(button);
  document.querySelector(`#markers [data-point="${q.id}"]`)?.classList.add('pair-replaced');
 }
 const context=[['平江河','water',-offset,-105],['平江路','street',offset,-105],
 [main.relationship.streets.split('、')[0],'street',-offset,92]];
 if(pair)context.push([['H02','H03'].includes(selected.id)?'胡厢使河':'柳枝河','water',offset,142]);
 for(const [name,kind,dx,dy] of context){const label=document.createElement('span');label.className='context-label '+kind;label.textContent=name;label.style.left=(cx+dx)+'px';label.style.top=(cy+dy)+'px';labels.append(label);}
}
let waterShapes=[];
fetch('/pingjiang-atlas/static/media/pingjiang-modern.svg').then(r=>r.text()).then(text=>{
 const doc=new DOMParser().parseFromString(text,'image/svg+xml');
 waterShapes=[...doc.querySelectorAll('g[fill="#b4d2d5"] path')].map(p=>({d:p.getAttribute('d'),line:p.classList.contains('waterline')}));
 if(selected)showRelationship(selected);
}).catch(()=>{});
function showRelationship(p){
 drawLabels();
 overlay.replaceChildren();relation.replaceChildren();if(!p.relationship)return;
 overlay.setAttribute('viewBox',`0 0 ${data.width} ${data.height}`);
 const defs=document.createElementNS(NS,'defs'),clip=document.createElementNS(NS,'clipPath'),circle=document.createElementNS(NS,'circle');clip.id='local-context';circle.setAttribute('cx',p.xy[0]);circle.setAttribute('cy',p.xy[1]);circle.setAttribute('r',110);clip.append(circle);defs.append(clip);overlay.append(defs);
 const group=document.createElementNS(NS,'g');group.setAttribute('clip-path','url(#local-context)');overlay.append(group);
 const pair=data.points.find(q=>q.id===p.relationship.pair),paired=!!pair,members=paired?[p,pair]:[p];
 for(const shape of waterShapes){const path=document.createElementNS(NS,'path');path.setAttribute('d',shape.d);path.setAttribute('class',shape.line?'context-water':'context-water-area');group.append(path);}
 for(const cls of ['context-street','context-bridge'])for(const d of new Set(members.flatMap(q=>cls==='context-street'?q.street_paths||[]:[q.bridge_path]).filter(Boolean))){const path=document.createElementNS(NS,'path');path.setAttribute('d',d);path.setAttribute('class',cls);group.append(path);}
 const heading=document.createElement('h3'),intro=document.createElement('p');heading.textContent=paired?'一桥入巷，一桥续街':'过一座桥，连起河与巷';intro.textContent=['H02','H03'].includes(p.id)?'胡厢使桥横跨平江河，通向曹胡徐巷；唐家桥跨过胡厢使河，接续南北向的平江路。':['H04','H05'].includes(p.id)?'通利桥横跨平江河，西接菉葭巷；朱马交桥跨柳枝河，接续平江路。两桥在河口转角相接。':p.name+'跨'+p.relationship.river+'，连接'+p.relationship.streets+'。';relation.append(heading,intro);
 const r=p.relationship;for(const [label,value] of [['跨河',r.river],['街巷',r.streets],['古今对应',r.ancient_name+' → '+p.name],['可以确认',r.continuity],['名称与变化',r.change]]){const line=document.createElement('p'),strong=document.createElement('strong');if(visitor&&['可以确认','名称与变化'].includes(label))continue;strong.textContent=label+'：';line.append(strong,document.createTextNode(value));relation.append(line);}
 const legend=document.createElement('p');legend.className='relation-legend';legend.textContent='蓝：河　绿：街　红：桥';relation.prepend(legend);
 if(r.pair){const pair=data.points.find(q=>q.id===r.pair);const button=document.createElement('button');button.textContent='看另一座桥：'+pair.name;button.onclick=()=>select(pair.id);relation.append(button);}
 const note=document.createElement('small');note.textContent=r.map_note;if(!visitor)relation.append(note);const source=document.createElement('a');source.href=r.source;source.target='_blank';source.rel='noopener';source.textContent='地方志依据 · '+r.locator+' ↗';if(!visitor)relation.append(source);
}
function center(p){if(!p.xy)return;v.scrollLeft=p.xy[0]/data.width*stage.offsetWidth-v.clientWidth/2;v.scrollTop=p.xy[1]/data.height*stage.offsetHeight-v.clientHeight/2;}
function alignMap(){
 if(!data||!visitor||ugcMode)return;
 const north=data.points.find(p=>p.id==='H01'),south=data.points.find(p=>p.id==='H08');if(!north?.xy||!south?.xy)return;
 const angle=Math.atan2(south.xy[0]-north.xy[0],south.xy[1]-north.xy[1])*180/Math.PI;
 const pivot=zoom>1&&selected?.xy?selected.xy:[data.width/2,data.height/2];
 stage.style.transformOrigin=`${pivot[0]/data.width*100}% ${pivot[1]/data.height*100}%`;
 const radians=angle*Math.PI/180,fit=Math.min(data.width/(data.width*Math.cos(radians)+data.height*Math.sin(radians)),data.height/(data.height*Math.cos(radians)+data.width*Math.sin(radians)));
 stage.style.transform=`rotate(${angle}deg) scale(${zoom===1?fit:1})`;
 stage.style.setProperty('--map-counter-angle',`${-angle}deg`);
}
function render(){if(!data)return;const comparison=document.body.classList.contains('comparison-map'),base=comparison?v.clientWidth:Math.max(v.clientWidth,400);if(comparison)v.style.setProperty('--modern-fit-height',(base*data.height/data.width)+'px');stage.style.width=base*zoom+'px';stage.style.height=base*zoom*data.height/data.width+'px';$('scale').textContent=Math.round(zoom*100)+'%';$('minus').disabled=zoom<=1;$('plus').disabled=zoom>=4;drawLabels();alignMap();}
function select(id){if(!data){pending=id;return;}const p=data.points.find(p=>p.id===id);if(!p)return;selected=p;if(p.xy){zoom=3;render();center(p);}showRelationship(p);document.querySelectorAll('[data-point]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.point===id)));$('name').textContent=p.name;$('detail').textContent=p.location_status==='pending'?'位置待核 · 暂不落图':visitor?'':p.evidence;if(p.ugc){$('detail').textContent=p.xy?'游记提及地点 · OSM地图记录':p.lonlat?'地点在当前底图范围外':'暂无可确认位置';relation.append(document.createTextNode('提及来源：'+p.mentions.join('、')));}
const profile=profiles.find(x=>x.id===p.id);if(profile){const intro=document.createElement('p');intro.textContent=profile.history[0]?.text||'';relation.append(intro);const more=document.createElement('details'),summary=document.createElement('summary');summary.textContent='建筑档案';more.append(summary);for(const field of ['identity','architecture','culture'])for(const fact of profile[field]){const line=document.createElement('p');line.textContent=fact.text;more.append(line);}relation.append(more);}const a=$('source');a.href='https://www.openstreetmap.org/'+p.osm_type+'/'+p.osm_id;a.hidden=!p.osm_id;if(window.parent!==window)window.parent.postMessage({type:ugcMode?'ugc-point-selected':'atlas-point-selected',id:p.id,name:p.name},location.origin);}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===window.parent&&['select-bridge','select-ugc'].includes(e.data?.type))select(e.data.id);});
$('plus').onclick=()=>{zoom=Math.min(4,zoom+.5);render();if(selected)center(selected);};$('minus').onclick=()=>{zoom=Math.max(1,zoom-.5);render();if(selected)center(selected);};$('reset').onclick=()=>{zoom=1;render();v.scrollTo(0,0);};
v.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,y:e.clientY,l:v.scrollLeft,t:v.scrollTop};v.setPointerCapture(e.pointerId);e.preventDefault();});v.addEventListener('pointermove',e=>{if(drag){v.scrollLeft=drag.l+drag.x-e.clientX;v.scrollTop=drag.t+drag.y-e.clientY;}});for(const event of ['pointerup','pointercancel','lostpointercapture'])v.addEventListener(event,()=>drag=null);
new ResizeObserver(()=>{render();if(selected&&zoom>1)center(selected);}).observe(v);
Promise.all(['/pingjiang-atlas/static/data/pingjiang-modern.json','/pingjiang-atlas/static/data/'+(visitor?'pingjiang-visitor-profiles.json':'pingjiang-building-profiles.json'),...(ugcMode?['/pingjiang-atlas/static/data/pingjiang-ugc-places.json']:[])].map(url=>fetch(url).then(r=>{if(!r.ok)throw Error();return r.json();}))).then(([d,archive,catalog])=>{profiles=archive.profiles;data=d;if(ugcMode){const originals=d.points;const [w,s,e,n]=d.bounds;const merc=lat=>Math.log(Math.tan(Math.PI/4+lat*Math.PI/360)),factor=d.width/((e-w)*Math.PI/180);d.points=catalog.places.map(p=>{const ll=p.location?.lonlat,inside=ll&&ll[0]>=w&&ll[0]<=e&&ll[1]>=s&&ll[1]<=n;return {...(originals.find(o=>o.id===p.atlas_id)||{}),id:p.id,name:p.name,symbol_id:p.atlas_id||(/园$|狮子林/.test(p.name)?'U02':/博物馆/.test(p.name)?'U01':/桥$/.test(p.name)?'H01':null),ugc:true,mentions:p.mentions,kind:'building',xy:inside?[(ll[0]-w)*Math.PI/180*factor,(merc(n)-merc(ll[1]))*factor]:null,lonlat:ll||null,osm_type:p.location?.osm_type,osm_id:p.location?.osm_id,relationship:null};});}for(const p of d.points){for(const container of ['markers','points']){if(container==='markers'&&!p.xy)continue;const b=document.createElement('button');b.dataset.kind=p.kind||'bridge';b.dataset.point=p.id;b.dataset.name=p.name;b.setAttribute('aria-label',p.name);b.setAttribute('aria-pressed','false');b.onclick=()=>select(p.id);if(container==='markers'){b.className='pin';PlaceIcons.decorate(b,p.symbol_id||p.id,p.name);b.style.left=p.xy[0]/d.width*100+'%';b.style.top=p.xy[1]/d.height*100+'%';}else b.textContent=p.name+(p.xy?'':' · 待定位');$(container).append(b);}}$('limits').textContent=d.source+'。'+d.limits;$('detail').textContent=ugcMode?'选择游记地点':'8座桥 · 15处档案（6处已定位）';if(ugcMode){$('points').style.display='none';parent.postMessage({type:'ugc-map-ready'},location.origin);}render();if(pending)select(pending);if(!ugcMode&&window.installMapSketch)window.installMapSketch(d,select);}).catch(()=>{$('detail').textContent='数据未加载，请刷新重试。';});
})();
