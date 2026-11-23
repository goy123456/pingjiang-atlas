(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const config = window.SCENE_CONFIG || {};
  const key = config.key || 'pingjiang-bridge-scene-v1';
  const clues = config.clues || {
    name: {title:'先看桥名', art:'胡 相 思 桥', text:'“相思”让人想到一个故事。但好听的联想，并不等于名字的来历。', extra:'先保留你的猜想，再找一条能核对的记录。', note:'桥名可以引发联想，但联想不是史实。'},
    map: {title:'旧称藏在图里', art:'胡 厢 使 桥', text:'据地方志文章，宋《平江图》记载的旧称是“胡厢使桥”。', extra:'从“厢使”到“相思”，具体何时改名，文章说尚无法确定。配图仅为旧图主题插画，并非《平江图》原件，不能据图辨认真实桥位。', note:'宋《平江图》中的旧称为“胡厢使桥”。'},
    stone: {title:'题刻能告诉我们什么？', art:'乾隆九年 · 重建', text:'文章记载，桥上题刻提到乾隆九年（1744）的重建。', extra:'重建的年份，不一定就是改名的年份。题刻提供一条线索，但不能回答所有问题；此处不是拓片。', note:'1744是文献记载的重建年份，不能据此确定改名时间。'}
  };
  let seen = [], active = 'name';
  try { const saved = JSON.parse(localStorage.getItem(key) || '{}'); if(Array.isArray(saved.seen)) seen = [...new Set(saved.seen.filter(x => Object.hasOwn(clues,x)))]; } catch { $('storage').textContent = '手记暂时无法读取，仍可继续探索。'; }
  function render() {
    $('count').textContent = `${seen.length}/3`;
    document.querySelectorAll('[data-clue]').forEach(b => {const done=seen.includes(b.dataset.clue); b.classList.toggle('seen',done); b.querySelector('i').textContent=done?'✓':'＋';});
  }
  function save() {try {localStorage.setItem(key,JSON.stringify({seen}));} catch {$('storage').textContent='浏览器未能保存手记，本次仍可导出。';} render();}
  document.querySelectorAll('[data-clue]').forEach(b => b.onclick = () => {
    active=b.dataset.clue; const c=clues[active];
    $('clue-tag').textContent=(config.label || '桥畔线索')+' · '+({name:'01',map:'02',stone:'03'}[active]);
    $('clue-title').textContent=c.title; $('clue-art').textContent=c.art; $('clue-text').textContent=c.text; $('extra').textContent=c.extra;
    $('extra').hidden=true; $('more').textContent='再看一点'; $('collect').textContent=seen.includes(active)?'已记下 · 返回':'记下线索'; $('clue-panel').showModal();$('clue-panel').scrollTop=0;
  });
  $('more').onclick=()=>{ $('extra').hidden=!$('extra').hidden; $('more').textContent=$('extra').hidden?'再看一点':'收起'; };
  $('collect').onclick=()=>{if(!seen.includes(active))seen.push(active);save();$('clue-panel').close();};
  [['close-clue','clue-panel'],['close-notes','notes'],['close-about','sources']].forEach(([b,d])=>$(b).onclick=()=>$(d).close());
  $('about').onclick=()=>$('sources').showModal();
  $('notebook').onclick=()=>{
    $('note-list').replaceChildren();
    seen.forEach(id=>{const a=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=clues[id].title;p.textContent=clues[id].note;a.append(h,p);$('note-list').append(a);});
    $('conclusion').textContent=seen.length===3?(config.conclusion || '旧称有记载，改名时间仍待考。'):seen.length?'还有一些地方值得看看。':'点击场景，留下一点发现。';$('notes').showModal();
  };
  $('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({scene:config.title || '胡相思桥',notes:seen.map(id=>clues[id].note)},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=config.download || 'pingjiang-bridge-notes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  render();
})();