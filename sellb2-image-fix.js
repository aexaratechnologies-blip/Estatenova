(function(){
'use strict';
function getState(){try{return eval('st')}catch(e){return window.st||null}}
function esc(v){return String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
const css=document.createElement('style');css.textContent=`
.s2-gallery{position:relative;width:100%;height:100%;overflow:hidden;background:#eef2f7}
.s2-gallery img{width:100%;height:100%;display:block;object-fit:cover}
.s2-gallery-btn{position:absolute;top:50%;transform:translateY(-50%);z-index:5;width:34px;height:34px;border:0;border-radius:50%;background:rgba(15,23,42,.65);color:#fff;font-size:20px;display:grid;place-items:center;cursor:pointer}
.s2-gallery-prev{left:9px}.s2-gallery-next{right:9px}
.s2-gallery-count{position:absolute;right:9px;bottom:9px;z-index:5;background:rgba(15,23,42,.72);color:#fff;border-radius:999px;padding:4px 9px;font-size:11px;font-weight:800}
.s2-gallery-dots{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);display:flex;gap:4px;z-index:5}.s2-gallery-dots i{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.55)}.s2-gallery-dots i.on{background:#fff;transform:scale(1.25)}
.detailimage .s2-gallery{min-height:100%}.detailimage .s2-gallery img{min-height:260px}
`;
document.head.appendChild(css);
function state(){return getState()}
function itemForArticle(a){const m=(a.getAttribute('onclick')||'').match(/['\"]([^'\"]+)['\"]\)/);const id=m&&m[1];return id?(state()?.items||[]).find(x=>String(x.id)===String(id)):null}
function urls(p){if(!p)return [];const all=[];if(p.cover_image_url)all.push(p.cover_image_url);if(Array.isArray(p.image_urls))all.push(...p.image_urls);return [...new Set(all.filter(Boolean))]}
async function enrichImages(){const st=state();if(!st?.items?.length||!window.db)return;const ids=st.items.map(x=>x.id).filter(Boolean);try{const r=await window.db.from('listing_images').select('listing_id,public_url,sort_order').in('listing_id',ids).order('sort_order',{ascending:true});if(r.error)return;const map={};(r.data||[]).forEach(x=>(map[x.listing_id]??=[]).push(x.public_url));st.items.forEach(p=>{const rel=map[p.id]||[];if(rel.length){p.image_urls=[...new Set([...(p.image_urls||[]),...rel])];p.cover_image_url=p.cover_image_url||rel[0]}});decorate();decorateDetail()}catch(e){console.warn('SELLB2 image enrichment failed',e)}}
function buildGallery(container,arr,detail){if(!arr.length)return;container.innerHTML='';const g=document.createElement('div');g.className='s2-gallery';let idx=0;const img=document.createElement('img');img.alt=detail?'Listing image':'Listing image';g.appendChild(img);const prev=document.createElement('button');prev.className='s2-gallery-btn s2-gallery-prev';prev.type='button';prev.textContent='‹';const next=document.createElement('button');next.className='s2-gallery-btn s2-gallery-next';next.type='button';next.textContent='›';g.append(prev,next);const count=document.createElement('span');count.className='s2-gallery-count';g.appendChild(count);const dotsWrap=document.createElement('div');dotsWrap.className='s2-gallery-dots';const dots=arr.slice(0,8).map((_,i)=>{const d=document.createElement('i');d.onclick=e=>{e.stopPropagation();idx=i;update()};dotsWrap.appendChild(d);return d});g.appendChild(dotsWrap);function update(){img.src=arr[idx];count.textContent=(idx+1)+' / '+arr.length;dots.forEach((d,i)=>d.classList.toggle('on',i===idx));prev.style.display=arr.length>1?'grid':'none';next.style.display=arr.length>1?'grid':'none'}prev.onclick=e=>{e.stopPropagation();idx=(idx-1+arr.length)%arr.length;update()};next.onclick=e=>{e.stopPropagation();idx=(idx+1)%arr.length;update()};container.appendChild(g);update()}
function decorate(){document.querySelectorAll('.property-card .pc-image').forEach(el=>{if(el.dataset.s2Gallery==='1')return;const article=el.closest('.property-card'),p=itemForArticle(article),arr=urls(p);if(arr.length>1){el.dataset.s2Gallery='1';buildGallery(el,arr,false)}else if(arr.length===1){const im=el.querySelector('img');if(im)im.src=arr[0]}})}
function decorateDetail(){const box=document.querySelector('.detailpage .detailimage');if(!box||box.dataset.s2Gallery==='1')return;const id=(location.pathname.match(/^\/listing\/([^/]+)/)||[])[1];const p=(state()?.items||[]).find(x=>String(x.id)===String(id));const arr=urls(p);if(arr.length>1){const keep=[...box.querySelectorAll('.back,.detailtools')];box.dataset.s2Gallery='1';buildGallery(box,arr,true);keep.forEach(x=>box.appendChild(x))}else if(arr.length===1){const im=box.querySelector('img');if(im)im.src=arr[0]}}
function removeProfileBox(){document.querySelectorAll('.s2-profile-note').forEach(x=>x.remove())}
function decorateAll(){decorate();decorateDetail();removeProfileBox()}
const mo=new MutationObserver(()=>{clearTimeout(mo._t);mo._t=setTimeout(decorateAll,40)});mo.observe(document.body,{childList:true,subtree:true});
const started=Date.now();const timer=setInterval(()=>{if(Date.now()-started>12000)clearInterval(timer);if(state()?.items?.length){clearInterval(timer);enrichImages()}decorateAll()},150);
setTimeout(enrichImages,1800);
})();
