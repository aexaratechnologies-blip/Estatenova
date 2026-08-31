(function(){'use strict';
  function getDB(){try{return eval('db')}catch(e){return null}}
  function getState(){try{return eval('st')}catch(e){return null}}
  function esc(v){return String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
  function route(){return location.pathname}
  function safePath(p){if(typeof window.setPath==='function'){window.setPath(p)}else{history.pushState({},'',p);window.dispatchEvent(new PopStateEvent('popstate'))}}
  function categoryForListing(p){return p?.category==='vehicle'?'/vehicles':p?.category==='business'?'/businesses':'/properties'}

  const style=document.createElement('style');style.textContent=`
    .s2-my-listings-btn{display:flex;align-items:center;justify-content:center;width:100%;margin:12px 0;padding:14px 16px;border:1px solid #d9e2f2;border-radius:14px;background:#fff;color:#162f69;font-weight:850;font-size:15px;box-shadow:0 5px 18px rgba(15,23,42,.06)}
    .s2-my-listings{padding:18px 18px 110px}.s2-my-listings-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}.s2-my-listings-head h2{margin:0;font-size:22px}.s2-my-listings-head button{border:0;border-radius:12px;background:#eef2f7;padding:10px 14px;font-weight:800;color:#17233b}
    .s2-own-card{display:flex;gap:12px;padding:12px;margin-bottom:12px;background:#fff;border:1px solid #e2e7ef;border-radius:18px;box-shadow:0 7px 22px rgba(15,23,42,.06)}.s2-own-img{width:92px;height:92px;border-radius:13px;overflow:hidden;background:#edf1f7;flex:0 0 92px;display:grid;place-items:center}.s2-own-img img{width:100%;height:100%;object-fit:cover}.s2-own-body{min-width:0;flex:1}.s2-own-body h3{margin:2px 0 5px;font-size:16px}.s2-own-body strong{font-size:16px}.s2-own-body p{margin:4px 0;color:#687386;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.s2-own-actions{display:flex;gap:8px;margin-top:8px}.s2-own-actions button{border:0;border-radius:10px;padding:8px 10px;font-weight:800;font-size:12px}.s2-own-view{background:#162f69;color:#fff}.s2-own-delete{background:#fee2e2;color:#b91c1c}
  `;document.head.appendChild(style);

  async function currentUser(db){const r=await db.auth.getUser();return r.data?.user||null}
  async function getListing(id){const db=getDB();if(!db)return null;const r=await db.from('listings').select('*').eq('id',id).maybeSingle();return r.data||null}

  async function showMyListings(){
    const db=getDB();if(!db){alert('Marketplace is still starting. Please try again.');return}
    const user=await currentUser(db);if(!user){safePath('/auth');return}
    const q=await db.from('listings').select('*').eq('owner_id',user.id).order('created_at',{ascending:false});
    if(q.error){alert('Could not load your listings: '+q.error.message);return}
    const items=q.data||[];
    history.pushState({sellb2MyListings:true},'', '/my-listings');
    const root=document.getElementById('app');
    const money=n=>!n?'Price on request':'₹'+(n>=1e7?(n/1e7).toFixed(2)+' Cr':n>=1e5?(n/1e5).toFixed(2)+' L':Number(n).toLocaleString('en-IN'));
    root.innerHTML=`<main class="screen"><header class="appbar"><button class="brand" data-s2-home>${esc('SELLB2')}</button><div class="topactions"><button class="signin" data-s2-profile>Profile</button></div></header><div class="pagehead"><button class="back" data-s2-my-back>‹</button><h1>My Listings</h1><button class="more" data-s2-more>☰</button></div><section class="s2-my-listings"><div class="s2-my-listings-head"><div><h2>Your listings</h2><div style="color:#687386;font-size:13px">${items.length} listing${items.length===1?'':'s'} across properties, vehicles and businesses.</div></div><button data-s2-post>+ Sell</button></div>${items.length?items.map(p=>{const img=p.cover_image_url||p.image_urls?.[0];const cat=p.category||'property';return `<article class="s2-own-card"><div class="s2-own-img">${img?`<img src="${esc(img)}" alt="">`:'<span style="font-size:28px">'+(cat==='vehicle'?'▰':cat==='business'?'▣':'⌂')+'</span>'}</div><div class="s2-own-body"><h3>${esc(p.title||'Untitled listing')}</h3><strong>${money(p.price)}</strong><p>${esc([p.locality,p.city,p.district,p.state].filter(Boolean).slice(0,3).join(', ')||'Location not specified')}</p><p style="font-size:12px;text-transform:capitalize">${esc(cat)} · ${esc(p.status||'active')}</p><div class="s2-own-actions"><button class="s2-own-view" data-s2-view="${esc(p.id)}">View listing</button><button class="s2-own-delete" data-s2-delete-own="${esc(p.id)}">Delete</button></div></div></article>`}).join(''):`<div style="text-align:center;padding:48px 18px;color:#687386"><div style="font-size:42px;margin-bottom:12px">⌂</div><h3 style="color:#17233b;margin:0 0 6px">No listings yet</h3><p style="margin:0 0 18px">List your first property, vehicle or business.</p><button class="btn primary" data-s2-post>Sell something</button></div>`}</section></main>`;
  }

  async function deleteOwn(id){
    const db=getDB();const user=await currentUser(db);if(!user)return safePath('/auth');
    const p=await getListing(id);if(!p||p.owner_id!==user.id){alert('You can only delete your own listing.');return}
    if(!confirm('Delete this listing permanently? This cannot be undone.'))return;
    const r=await db.from('listings').delete().eq('id',id).eq('owner_id',user.id);if(r.error){alert('Could not delete listing: '+r.error.message);return}
    await showMyListings();
  }

  function injectProfileButton(){
    if(route()!=='/profile'||document.querySelector('[data-s2-my-listings]'))return;
    const root=document.querySelector('.content')||document.querySelector('.screen');if(!root)return;
    const btn=document.createElement('button');btn.className='s2-my-listings-btn';btn.dataset.s2MyListings='1';btn.innerHTML='▦&nbsp;&nbsp;View my listings';
    const note=root.querySelector('.s2-profile-note');if(note)note.after(btn);else root.insertBefore(btn,root.firstChild);
  }

  function install(){
    document.addEventListener('click',async function(e){
      const my=e.target.closest('[data-s2-my-listings]');if(my){e.preventDefault();e.stopImmediatePropagation();showMyListings();return}
      const home=e.target.closest('[data-s2-home]');if(home){e.preventDefault();e.stopImmediatePropagation();safePath('/');return}
      const profile=e.target.closest('[data-s2-profile]');if(profile){e.preventDefault();e.stopImmediatePropagation();safePath('/profile');return}
      const post=e.target.closest('[data-s2-post]');if(post){e.preventDefault();e.stopImmediatePropagation();safePath('/post');return}
      const view=e.target.closest('[data-s2-view]');if(view){e.preventDefault();e.stopImmediatePropagation();safePath('/listing/'+encodeURIComponent(view.dataset.s2View));return}
      const del=e.target.closest('[data-s2-delete-own]');if(del){e.preventDefault();e.stopImmediatePropagation();deleteOwn(del.dataset.s2DeleteOwn);return}
      if(e.target.closest('[data-s2-my-back]')){e.preventDefault();e.stopImmediatePropagation();safePath('/profile');return}
      const back=e.target.closest('.pagehead .back');
      if(back && /^\/listing\//.test(route())){
        e.preventDefault();e.stopImmediatePropagation();
        const id=route().split('/')[2];const p=await getListing(id);safePath(categoryForListing(p));return;
      }
      if(e.target.closest('[data-s2-more]')){e.preventDefault();e.stopImmediatePropagation();if(typeof window.drawer==='function')window.drawer();else alert('Menu');return}
      if(e.target.closest('.appbar .brand')&&!e.target.closest('[data-s2-home]')){e.preventDefault();e.stopImmediatePropagation();safePath('/');return}
      const nav=e.target.closest('.bottomnav button');if(nav){const text=(nav.textContent||'').trim().toLowerCase();let p=text.includes('home')?'/':text.includes('properties')?'/properties':text.includes('saved')?'/saved':text.includes('messages')?'/messages':text.includes('profile')?'/profile':null;if(p){e.preventDefault();e.stopImmediatePropagation();safePath(p)}return}
    },true);
    const obs=new MutationObserver(()=>{clearTimeout(obs._t);obs._t=setTimeout(()=>{if(route()==='/my-listings'){if(!document.querySelector('.s2-my-listings'))showMyListings()}else injectProfileButton()},100)});obs.observe(document.body,{childList:true,subtree:true});
    setTimeout(injectProfileButton,500);setTimeout(injectProfileButton,1500);
    window.addEventListener('popstate',()=>{setTimeout(()=>{if(route()==='/my-listings')showMyListings();else injectProfileButton()},80)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
