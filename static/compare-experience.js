(()=>{'use strict';const panel=document.createElement('section');panel.id='bridge-experience';panel.innerHTML='<button id="guide-toggle" aria-pressed="false">古图辅助线</button>';document.querySelector('.comparison').before(panel);
const NS='http://www.w3.org/2000/svg',guide=document.createElementNS(NS,'svg');guide.id='ancient-guide';guide.setAttribute('viewBox','0 0 12540 18448');guide.setAttribute('aria-hidden','true');guide.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:none';
// Distinct visual encodings explain relationships, not surveyed feature edges.
const anchors={
 H01:[9695,6370],H02:[9710,6998],H03:[9792,7087],H04:[9704,7198],
 H05:[9802,7308],H06:[9705,7398],H07:[9716,7730],H08:[9722,7995]
};
const pairs={H02:'H03',H03:'H02',H04:'H05',H05:'H04'};
const selectedMarker=document.getElementById('old-marker');
document.getElementById('old-stage').append(guide);
function drawGuide(){
 guide.replaceChildren();
 const id=selectedMarker.dataset.bridge,point=anchors[id];
 const on=!selectedMarker.hidden&&!!point;
 guide.style.display=on?'block':'none';
 document.getElementById('guide-toggle').setAttribute('aria-pressed',String(on));
 if(!on)return;
 const ids=pairs[id]?[id,pairs[id]]:[id];
 const mainId=id==='H03'?'H02':id==='H05'?'H04':id;
 const [x,y]=anchors[mainId];
 const lines=[
 ['M'+x+' '+(y-180)+' L'+x+' '+(y+220),'#23749c'],
 ['M'+(x-280)+' '+(y+30)+' L'+(x-65)+' '+(y+30)+' M'+(x+125)+' '+(y-180)+' L'+(x+125)+' '+(y+220),'#518360']
 ];
 if(pairs[id]){
  const branch=anchors[mainId==='H02'?'H03':'H05'];
  lines.push(['M'+x+' '+branch[1]+' L'+(branch[0]+270)+' '+branch[1],'#23749c']);
 }
 for(const bridge of ids){
  const [bx,by]=anchors[bridge],vertical=bridge==='H03'||bridge==='H05';
  lines.push([vertical?'M'+bx+' '+(by-60)+' L'+bx+' '+(by+60):'M'+(bx-80)+' '+by+' L'+(bx+75)+' '+by,'#b74229']);
 }
 for(const [d,color] of lines){
  const path=document.createElementNS(NS,'path');
  path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke',color);
  const water=color==='#23749c',bridge=color==='#b74229';
  path.setAttribute('stroke-width',water?'30':bridge?'22':'10');
  path.setAttribute('stroke-linecap',bridge?'butt':'round');
  path.setAttribute('opacity',water?'.38':'.9');guide.append(path);
  if(bridge){
   const rail=path.cloneNode();rail.classList.add('ancient-bridge-rail');rail.setAttribute('stroke','#fff6dc');rail.setAttribute('stroke-width','5');rail.setAttribute('stroke-dasharray','3 13');guide.append(rail);
  }
 }
}
new MutationObserver(drawGuide).observe(selectedMarker,{attributes:true,attributeFilter:['data-bridge','hidden']});
drawGuide();

panel.replaceChildren(document.getElementById('guide-toggle'));
document.getElementById('guide-toggle').onclick=()=>{
 const b=document.getElementById('guide-toggle');
 const on=b.getAttribute('aria-pressed')!=='true';
 b.setAttribute('aria-pressed',String(on));guide.style.display=on?'block':'none';
};
})();
