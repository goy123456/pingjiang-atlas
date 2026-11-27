// Render only tiles intersecting the viewport. The preview always remains underneath.
(()=>{
 const base=document.querySelector('#old-image[data-tiles]');if(!base)return;
 const stage=base.parentElement,view=document.querySelector('#old-viewport');
 const [W,H,T,...levels]=base.dataset.pyramid.split(',').map(Number);
 const layer=document.createElement('div');layer.setAttribute('aria-hidden','true');
 layer.style.cssText='position:absolute;inset:0;overflow:hidden;pointer-events:none';
 base.after(layer);
 const tiles=new Map();let frame=0;
 function update(){
   frame=0;const s=stage.getBoundingClientRect(),v=view.getBoundingClientRect();
   if(!s.width||!s.height||!v.width||!base.naturalWidth)return;
   const scale=s.width/W*(window.devicePixelRatio||1);
   const needed=new Set();
   if(scale>base.naturalWidth/W){
     const d=levels.filter(n=>scale*n<=1).at(-1)||1,span=T*d;
     const col=x=>Math.floor((x-s.left)/s.width*W/span),row=y=>Math.floor((y-s.top)/s.height*H/span);
     for(let y=Math.max(0,row(v.top));y<=Math.min(Math.ceil(H/span)-1,row(v.bottom));y++){
       for(let x=Math.max(0,col(v.left));x<=Math.min(Math.ceil(W/span)-1,col(v.right));x++){
         const key=d+'/'+x+'-'+y;needed.add(key);
         let tile=tiles.get(key);
         if(!tile){
           tile=new Image();tile.alt='';tile.draggable=false;tile.decoding='async';
           tile.style.cssText='position:absolute;max-width:none;max-height:none;margin:0;pointer-events:none;visibility:hidden';
           Object.assign(tile.style,{left:100*x*span/W+'%',top:100*y*span/H+'%',
             width:100*Math.min(span,W-x*span)/W+'%',height:100*Math.min(span,H-y*span)/H+'%'});
           tile.onload=()=>{tile.style.visibility='visible'};
           tile.src=base.dataset.tiles+key+'.jpg';tiles.set(key,tile);layer.append(tile);
         }
         tile.style.filter=base.style.filter;
       }
     }
   }
   for(const [key,tile] of tiles){if(!needed.has(key)){tile.remove();tiles.delete(key)}}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 new ResizeObserver(schedule).observe(stage);new ResizeObserver(schedule).observe(view);
 new MutationObserver(schedule).observe(base,{attributes:true,attributeFilter:['style']});
 view.addEventListener('scroll',schedule,{passive:true});base.addEventListener('load',schedule);
 window.addEventListener('resize',schedule);schedule();
})();
