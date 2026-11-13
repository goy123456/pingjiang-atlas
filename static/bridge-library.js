/* Static evidence reader: no AI, no external image requests, no conversation storage. */
(()=>{'use strict';
const host=document.querySelector('.comparison');if(!host)return;
const panel=document.createElement('section');panel.id='bridge-library';panel.className='bridge-library';
panel.setAttribute('aria-label','八桥知识库与影像来源');
panel.innerHTML='<div class="library-heading"><div><p class="library-kicker">读桥 · 查证 · 看图</p><h2>八桥知识库</h2></div><small id="library-version"></small></div><p>选桥后查看河街关系、名称与影像出处；资料检索不调用 AI。</p><form id="library-search"><label for="library-query">查桥名、别称或街巷</label><div><input id="library-query" type="search" maxlength="100" placeholder="例如：青石桥、菉葭巷、悬桥巷"><button type="submit">查资料</button><button type="button" id="library-all">全部八桥</button></div></form><p id="library-status" role="status">知识库加载中…</p><div id="library-results"></div>';
host.after(panel);
const status=panel.querySelector('#library-status'),results=panel.querySelector('#library-results');
const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
function link(url,text){const a=el('a',text);if(/^https:\/\//.test(url)){a.href=url;a.target='_blank';a.rel='noopener noreferrer';}return a;}
let kb,refs=[],selected=null;
function show(ids){
 if(!kb)return;results.replaceChildren();const entities=kb.entities.filter(e=>ids.includes(e.id));
 status.textContent=entities.length?`当前查看 ${entities.length} 座桥 · ${kb.scope}`:'没有匹配资料。试试完整桥名或街巷名；未收录不代表地点不存在。';
 for(const entity of entities){
  const card=el('article');card.className='library-card';card.dataset.entity=entity.id;
  card.append(el('h3',entity.name));if(entity.aliases.length)card.append(el('p','别称／历史名称：'+entity.aliases.join('、')));
  const passages=kb.passages.filter(p=>p.status==='verified'&&p.entity_ids.includes(entity.id));
  const summary=el('p',passages.find(p=>p.topic==='connection')?.text);summary.className='library-relationship';card.append(summary);
  const details=el('details'),heading=el('summary','查看证据摘编与出处（'+passages.length+'）');details.append(heading);
  for(const p of passages){const source=kb.sources.find(s=>s.id===p.source_id);const block=el('div');block.className='library-evidence';block.id='evidence-'+p.id;
   block.append(el('p','['+p.id+'] '+p.text),el('small','已核资料摘编 · '+p.locator+' · 发布 '+source.published_at),link(source.url,'阅读来源原文 ↗'));details.append(block);}
  card.append(details);
  const photos=refs.filter(p=>p.point_ids.includes(entity.id));
  const imageDetails=el('details');imageDetails.append(el('summary','桥街影像参考（'+photos.length+'）'));
  if(!photos.length)imageDetails.append(el('p','本轮暂无新增、地点已核的影像参考。'));
  for(const photo of photos){const item=el('div');item.className='library-image-ref';item.append(el('strong',photo.title),el('p',photo.identity_evidence),el('small',photo.kind+' · 拍摄：'+(photo.capture_date||'未注明')+' · 文章发布：'+photo.published_at),link(photo.source_url,'到来源页看图 ↗'));imageDetails.append(item);}
  imageDetails.append(el('small','原图版权归原作者。授权未明确的图片暂以来源页呈现；示意图与实拍照片分开标注。'));card.append(imageDetails);results.append(card);
 }
}
panel.querySelector('form').onsubmit=event=>{event.preventDefault();if(!kb)return;const q=panel.querySelector('input').value.trim().replaceAll('绿葭巷','菉葭巷');if(!q){show(kb.entities.map(e=>e.id));return;}
 const explicit=kb.entities.filter(e=>[e.name,...e.aliases].some(n=>q.includes(n)));
 const found=explicit.length?explicit:kb.entities.filter(e=>[e.river,...e.streets,...e.nearby].some(n=>q.includes(n)||n.includes(q)));
 show(found.map(e=>e.id));};
panel.querySelector('#library-all').onclick=()=>{panel.querySelector('input').value='';show(kb?.entities.map(e=>e.id)||[]);};
function onSelect(id){selected=id||null;if(kb){panel.querySelector('input').value='';show(selected?[selected]:kb.entities.map(e=>e.id));}}
window.addEventListener('comparison-context',e=>onSelect(e.detail.bridge?.id));
const marker=document.getElementById('old-marker');
if(marker)new MutationObserver(()=>onSelect(marker.hidden?null:marker.dataset.bridge)).observe(marker,{attributes:true,attributeFilter:['hidden','data-bridge']});
async function read(url){const r=await fetch(url);if(!r.ok)throw Error();return r.json();}
Promise.all([read('/pingjiang-atlas/static/data/pingjiang-bridge-kb.json?v=20261111rag1'),read('/pingjiang-atlas/static/data/pingjiang-bridge-image-refs.json?v=20261111rag1')]).then(([data,images])=>{
 kb=data;refs=images.references;panel.querySelector('#library-version').textContent='资料版本 '+kb.version;
 onSelect(marker&&!marker.hidden?marker.dataset.bridge:selected);
}).catch(()=>{status.textContent='知识库暂未加载，请刷新后重试。';});
})();
