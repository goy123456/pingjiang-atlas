// The fragment is portable; the current history entry also remembers the last stable step.
(()=>{
 const bridge=()=>/^#walk-(H0[1-8])$/.exec(location.hash)?.[1];
 const owned=()=>Boolean(bridge())||location.hash==='#shuangqiao';
 function read(){
   const id=bridge()||(location.hash==='#shuangqiao'?'H02':null),saved=history.state?.atlasWalk;
   return id?{id,step:saved?.id===id?saved.step:null}:null;
 }
 function save(id,step){
   const old=history.state?.atlasWalk;
   if(bridge()===id&&old?.id===id&&old.step===step)return;
   const returnHash=owned()?(old?.returnHash||''):location.hash;
   history.replaceState({...history.state,atlasWalk:{id,step,returnHash}},'','#walk-'+id);
 }
 function leave(){
   if(!owned()||document.querySelector('#tw-walk[open],#sw-walk[open]'))return;
   const {atlasWalk,...rest}=history.state||{};
   history.replaceState(rest,'',location.pathname+location.search+(atlasWalk?.returnHash||''));
 }
 window.atlasWalkUrl={read,save,leave};
})();
