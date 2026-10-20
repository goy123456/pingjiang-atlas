/* Category symbols, not reconstructions of the actual buildings. */
(()=>{'use strict';
const types={U01:'museum',U02:'garden',U03:'garden',U05:'garden',U28:'garden',U13:'charity',C01:'theatre',C02:'theatre',C03:'museum',C04:'hall',C05:'home',C06:'home',C07:'home',C08:'home',C09:'stele'};
const labels={garden:'园林',charity:'义庄',home:'故居',museum:'博物馆',theatre:'戏曲场馆',hall:'厅堂',stele:'碑亭',bridge:'桥梁',place:'地点'};
const shapes={
 garden:'<path d="M8 38h34M12 37V25m23 12V25M7 25q12-2 17-13 6 11 17 13Z"/><path d="M21 37V28h7v9M43 38V23"/><path d="M43 9c-12 1-11 16 0 16 12 0 12-15 0-16Z" fill="currentColor" opacity=".22"/><path d="M7 44q10-4 20 0t23 0"/>',
 charity:'<path d="M6 40V23h10v17m24 0V23h10v17M15 40V20h26v20M11 20l17-11 17 11M7 40h42M22 40V29h12v11"/><path d="M21 21h14v5H21Z" fill="currentColor"/><path d="M9 28h4m30 0h4M10 44h36"/>',
 home:'<path d="M8 40V21l20-12 20 12v19M5 22l23-15 23 15M22 40V26h12v14M12 27h5v7h-5Zm27 0h5v7h-5ZM6 41h44"/><circle cx="30" cy="34" r="1" fill="currentColor"/>',
 museum:'<path d="M7 20 28 8l21 12ZM10 23h36M13 25v14m10-14v14m10-14v14m10-14v14M8 40h40M5 45h46"/><path d="M25 14h6" stroke-width="3"/>',
 theatre:'<path d="M5 18q12-1 23-10 11 9 23 10M9 20h38v23H9ZM7 45h42"/><path d="M12 22h12q0 14-12 16Zm32 0H32q0 14 12 16Z" fill="currentColor" opacity=".25"/><path d="M28 26v11m-5-5h10M24 40h8"/>',
 hall:'<path d="M5 22q12-1 23-13 11 12 23 13M10 23h36v18H10M16 25v16m24-16v16M24 41V30h8v11M7 44h42"/><path d="M22 22h12v5H22Z" fill="currentColor"/>',
 stele:'<path d="M7 21 28 9l21 12M11 23v20m34-20v20M7 45h42M21 40V25q7-7 14 0v15ZM25 28h6m-6 5h6"/>',
 bridge:'<path d="M5 34q23-30 46 0M5 39q23-25 46 0M10 29v8m9-15v9m9-12v10m9-7v9m9-2v8M5 45q7-4 14 0t14 0t18 0"/>',
 place:'<path d="M28 45S12 29 12 20a16 16 0 0 1 32 0c0 9-16 25-16 25Z"/><circle cx="28" cy="20" r="5"/>'
};
function type(id){return types[id]||(id.startsWith('H')?'bridge':'place');}
function svg(id){return '<svg viewBox="0 0 56 56" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+shapes[type(id)]+'</svg>';}
function decorate(button,id,name){button.classList.add('place-symbol');button.dataset.symbol=type(id);button.innerHTML=svg(id);button.setAttribute('aria-label',name+' · '+labels[type(id)]+'，查看详情');button.title=name+' · '+labels[type(id)];}
window.PlaceIcons={type,svg,decorate,labels};
})();
