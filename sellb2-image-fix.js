(function(){
'use strict';
function state(){return window.st||null}
function db(){return window.db||null}

const css=document.createElement('style');
css.textContent=`
.s2-gallery{position:relative;width:100%;height:100%;min-height:260px;overflow:hidden;background:#eef2f7;touch-action:pan-y;user-select:none}
.s2-gallery img{width:100%;height:100%;min-height:260px;display:block;object-fit:cover}
.s2-gallery-btn{position:absolute;top:50%;transform:translateY(-50%);z-index:5;width:38px;height:38px;border:0;border-radius:50%;background:rgba(15,23,42,.72);color:#fff;font-size:24px;line-height:1;display:grid;place-items:center;cursor:pointer}
.s2-gallery-prev{left:10px}.s2-gallery-next{right:10px}
.s2-gallery-count{position:absolute;right:10px;bottom:10px;z-index:5;background:rgba(15,23,42,.78);color:#fff;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:800}
.s2-gallery-dots{position:absolute;left:50%;bottom:11px;transform:translateX(-50%);display:flex;gap:5px;z-index:5}
.s2-gallery-dots i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.65);cursor:pointer}
.s2-gallery-dots i.on{background:#fff;transform:scale(1.25)}
.detailimage .s2-gallery{min-height:320px}.detailimage .s2-gallery img{min-height:320px}
.property-card .pc-image>img{width:100%;height:100%;min-height:260px;display:block;object-fit:cover}
`;
document.head.appendChild(css);

function getUrls(p){
  if(!p)return[];
  let out=[];
  if(p.cover_image_url)out.push(p.cover_image_url);
  if(Array.isArray(p.image_urls))out.push(...p.image_urls);
  else if(typeof p.image_urls==='string'){
    try{const x=JSON.parse(p.image_urls);if(Array.isArray(x))out.push(...x)}catch(e){if(/^https?:\/\//.test(p.image_urls))out.push(p.image_urls)}
  }
  return [...new Set(out.filter(x=>typeof x==='string'&&x.trim()))];
}

function addUrls(p,extra){
  if(!p)return;
  const merged=[...new Set([...getUrls(p),...(extra||[])].filter(Boolean))];
  if(merged.length){p.image_urls=merged;p.cover_image_url=merged[0]}
}

async function listingImageRows(id){
  const client=db();
  if(!client||!id)return[];
  try{
    const r=await client.from('listing_images').select('public_url,sort_order').eq('listing_id',id).order('sort_order',{ascending:true});
    return r.error?[]:(r.data||[]).map(x=>x.public_url).filter(Boolean);
  }catch(e){return[]}
}

async function enrich(){
  const s=state(),client=db();
  if(!s?.items?.length||!client)return;
  try{
    const ids=s.items.map(x=>x.id).filter(Boolean);
    const r=await client.from('listing_images').select('listing_id,public_url,sort_order').in('listing_id',ids).order('sort_order',{ascending:true});
    if(r.error)return;
    const map={};
    (r.data||[]).forEach(x=>{if(x.public_url)(map[x.listing_id]??=[]).push(x.public_url)});
    s.items.forEach(p=>addUrls(p,map[p.id]||[]));
    renderCardGalleries();
  }catch(e){console.warn('SELLB2 image enrichment failed',e)}
}

function clearMedia(box){
  if(!box)return;
  box.querySelectorAll(':scope > img,:scope > .noimage,:scope > .s2-gallery').forEach(x=>x.remove());
}

function gallery(container,arr){
  if(!container||!arr.length)return;
  const old=container.querySelector(':scope > .s2-gallery');
  if(old){
    const oldUrls=(old.dataset.urls||'').split('|').filter(Boolean);
    if(oldUrls.length===arr.length&&oldUrls.every((x,i)=>x===arr[i]))return;
    old.remove();
  }
  const g=document.createElement('div');
  g.className='s2-gallery';
  g.dataset.urls=arr.join('|');
  let idx=0,startX=0,startY=0,drag=false;
  const img=document.createElement('img');
  img.alt='Listing image';img.draggable=false;g.appendChild(img);
  const prev=document.createElement('button');
  prev.type='button';prev.className='s2-gallery-btn s2-gallery-prev';prev.setAttribute('aria-label','Previous image');prev.textContent='‹';g.appendChild(prev);
  const next=document.createElement('button');
  next.type='button';next.className='s2-gallery-btn s2-gallery-next';next.setAttribute('aria-label','Next image');next.textContent='›';g.appendChild(next);
  const count=document.createElement('span');count.className='s2-gallery-count';g.appendChild(count);
  const dots=document.createElement('div');dots.className='s2-gallery-dots';
  arr.forEach((_,i)=>{
    if(i>=12)return;
    const d=document.createElement('i');
    d.setAttribute('aria-label','Image '+(i+1));
    d.onclick=e=>{e.stopPropagation();idx=i;update()};
    dots.appendChild(d);
  });
  g.appendChild(dots);
  function update(){
    img.src=arr[idx];
    count.textContent=(idx+1)+' / '+arr.length;
    [...dots.children].forEach((d,i)=>d.classList.toggle('on',i===idx));
    const multi=arr.length>1;
    prev.style.display=next.style.display=multi?'grid':'none';
    count.style.display=multi?'block':'none';
    dots.style.display=multi?'flex':'none';
  }
  prev.onclick=e=>{e.stopPropagation();idx=(idx-1+arr.length)%arr.length;update()};
  next.onclick=e=>{e.stopPropagation();idx=(idx+1)%arr.length;update()};
  g.addEventListener('touchstart',e=>{if(e.touches[0]){startX=e.touches[0].clientX;startY=e.touches[0].clientY;drag=true}},{passive:true});
  g.addEventListener('touchend',e=>{
    if(!drag||!e.changedTouches[0])return;
    drag=false;
    const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){e.stopPropagation();idx=dx<0?(idx+1)%arr.length:(idx-1+arr.length)%arr.length;update()}
  },{passive:true});
  container.appendChild(g);update();
}

function findListingFromCard(article,index){
  const s=state();
  if(!article||!s)return null;
  const onclick=article.getAttribute('onclick')||'';
  const marker='/listing/';
  const pos=onclick.indexOf(marker);
  if(pos>=0){
    const tail=onclick.slice(pos+marker.length);
    const id=tail.split(/[\'\"\)\s]/)[0];
    const hit=(s.items||[]).find(x=>String(x.id)===String(id));
    if(hit)return hit;
  }
  return (s.items||[])[index]||null;
}

function renderCardGalleries(){
  const cards=[...document.querySelectorAll('.property-card')];
  cards.forEach((article,index)=>{
    const box=article.querySelector('.pc-image'),p=findListingFromCard(article,index);
    if(!box||!p)return;
    const arr=getUrls(p);
    if(!arr.length)return;
    if(arr.length>1){
      const existing=box.querySelector(':scope > .s2-gallery');
      const oldUrls=existing?(existing.dataset.urls||'').split('|').filter(Boolean):[];
      if(existing&&oldUrls.length===arr.length&&oldUrls.every((x,i)=>x===arr[i]))return;
      clearMedia(box);
      gallery(box,arr);
      return;
    }
    const existing=box.querySelector(':scope > img');
    if(existing&&existing.src===arr[0])return;
    clearMedia(box);
    const im=document.createElement('img');
    im.src=arr[0];im.alt='Listing image';im.draggable=false;box.insertBefore(im,box.firstChild);
  });
}

async function renderDetailGallery(){
  const box=document.querySelector('.detailpage .detailimage');
  if(!box)return;
  const parts=location.pathname.split('/').filter(Boolean);
  const id=parts[0]==='listing'?decodeURIComponent(parts[1]||''):'';
  if(!id)return;
  const s=state();
  let p=(s?.items||[]).find(x=>String(x.id)===String(id));
  let arr=getUrls(p);
  const rel=await listingImageRows(id);
  if(rel.length){
    if(!p&&s){p={id:id};s.items.push(p)}
    addUrls(p||{},rel);
    arr=[...new Set([...arr,...rel])];
  }
  if(!arr.length)return;
  const existing=box.querySelector(':scope > .s2-gallery');
  const oldUrls=existing?(existing.dataset.urls||'').split('|').filter(Boolean):[];
  if(existing&&oldUrls.length===arr.length&&oldUrls.every((x,i)=>x===arr[i]))return;
  clearMedia(box);
  gallery(box,arr);
}

async function all(){renderCardGalleries();await renderDetailGallery()}

let timer=0;
new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(all,150)}).observe(document.body,{childList:true,subtree:true});
let started=Date.now();
const poll=setInterval(()=>{
  if(Date.now()-started>30000){clearInterval(poll);return}
  if(state()?.items?.length)enrich();
  all();
},1000);
setTimeout(enrich,1000);setTimeout(all,2000);
})();
