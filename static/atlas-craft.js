/* Original decorative line icons; preserve text, accessibility and event handlers. */
(()=>{'use strict';
const drawings={map:'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2V5zm6-2v16m6-14v16',home:'M4 10a8 8 0 1 1 1 9M4 4v6h6M9 16h6m-3-3v6',link:'M9 15l6-6M8 16H6a4 4 0 0 1 0-8h3m6 0h3a4 4 0 0 1 0 8h-3',screen:'M3 4h18v13H3V4zm5 17h8m-4-4v4',full:'M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6',photo:'M3 4h18v16H3V4zm0 12 6-6 5 5 3-3 4 4M16 8h.01',pen:'M5 17 16 4l4 4L9 20H4l1-3zm8-10 4 4M4 23h16'};
function assign(){for(const b of document.querySelectorAll('button')){if(b.matches('.pin,.bridge-callout,[data-bridge]'))continue;const t=b.textContent.trim();let key=b.id==='sketch-toggle'?'pen':/全域|八桥全览|回到起点|回到地图|^八桥$|^全图$/.test(t)?'home':/双图联动/.test(t)?'link':/大屏/.test(t)?'screen':/全屏/.test(t)?'full':/影像/.test(t)?'photo':/辅助线/.test(t)?'map':null;if(!key||b.dataset.atlasIcon===key)continue;b.dataset.atlasIcon=key;const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 26" fill="none" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="'+drawings[key]+'"/></svg>';b.style.setProperty('--atlas-icon','url("data:image/svg+xml,'+encodeURIComponent(svg)+'")');}}
let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;assign();});};
function start(){assign();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
