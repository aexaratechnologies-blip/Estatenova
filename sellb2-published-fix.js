(function(){
  'use strict';
  function ready(fn){
    if(window.st&&window.db&&typeof window.render==='function'&&typeof window.publish==='function') return fn();
    setTimeout(function(){ready(fn)},100);
  }
  ready(function(){
    if(window.__sellb2PublishedFix)return;
    window.__sellb2PublishedFix=true;
    var originalPublish=window.publish;
    window.publish=async function(e){
      var before=window.st.route;
      await originalPublish(e);
      if(before==='/post' && window.st.route!=='/post'){
        window.st.lastPublishedId=window.st.route;
        window.setPath('/my-listings');
      }
    };

    window.myListingsPage=async function(){
      if(!window.st.user){
        return `<main class="screen">${window.head('My Listings')}${window.empty('Sign in required','Please sign in to view your listings.','/auth','Sign in')}</main>`;
      }
      var r=await window.db.from('listings').select('*').eq('owner_id',window.st.user.id).order('created_at',{ascending:false});
      if(r.error){
        console.error('SELLB2 my listings:',r.error);
        return `<main class="screen">${window.head('My Listings')}${window.empty('Could not load listings','Please try again in a moment.','/profile','Back to profile')}${window.nav('/profile')}</main>`;
      }
      var rows=r.data||[];
      var body=rows.length?`<div class="my-listings">${rows.map(function(p){
        var published=p.status==='active'&&p.approval_status==='approved';
        var pending=p.status==='active'&&p.approval_status!=='approved';
        var status=published?'Published':pending?'Pending approval':(p.status||'Draft');
        var image=p.cover_image_url||(p.image_urls&&p.image_urls[0]);
        return `<article class="my-listing-card">
          <div class="my-listing-media">${image?`<img src="${window.esc(image)}" alt="">`:'<div class="noimage"><span>⌂</span></div>'}</div>
          <div class="my-listing-info"><span class="my-listing-status ${published?'published':''}">${status}</span><h3>${window.esc(p.title||'Untitled listing')}</h3><strong>${window.money(p.price)}</strong><p>${window.esc([p.locality,p.city,p.district,p.state].filter(Boolean).slice(0,3).join(', '))}</p><div class="my-listing-actions"><button class="btn ghost" onclick="setPath('/listing/${p.id}')">View listing</button><button class="btn ${published?'published-btn':'ghost'}" ${published?'disabled':''}>${published?'Published':status}</button></div></div>
        </article>`;
      }).join('')}</div>`:window.empty('No listings yet','Your published listings will appear here.','/post','Publish a listing');
      return `<main class="screen">${window.head('My Listings','/profile')}<div class="content">${body}</div>${window.nav('/profile')}</main>`;
    };

    var originalRender=window.render;
    window.render=async function(){
      if(window.st.route==='/my-listings'){
        document.documentElement.dataset.theme=window.st.theme;
        document.getElementById('app').innerHTML=await window.myListingsPage();
        return;
      }
      return originalRender();
    };

    var style=document.createElement('style');
    style.textContent=`
      .my-listings{display:grid;gap:14px;padding:14px 0 28px}
      .my-listing-card{display:grid;grid-template-columns:112px 1fr;gap:14px;padding:12px;border:1px solid rgba(16,46,104,.10);border-radius:18px;background:var(--card,#fff);box-shadow:0 6px 20px rgba(16,46,104,.06)}
      .my-listing-media{width:112px;height:112px;border-radius:14px;overflow:hidden;background:#eef2f7}
      .my-listing-media img{width:100%;height:100%;object-fit:cover}
      .my-listing-info{min-width:0}
      .my-listing-info h3{margin:6px 0 4px;font-size:16px;line-height:1.25}
      .my-listing-info strong{display:block;font-size:15px}
      .my-listing-info p{margin:5px 0;color:#687386;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .my-listing-status{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;background:#eef1f5;color:#647084}
      .my-listing-status.published{background:#e8f7ed;color:#18733a}
      .my-listing-actions{display:flex;gap:7px;margin-top:9px}
      .my-listing-actions .btn{font-size:11px;padding:8px 10px;min-height:34px}
      .my-listing-actions .published-btn{background:#e8f7ed;color:#18733a;border:1px solid #bfe7cb;opacity:1;cursor:default}
      @media(max-width:420px){.my-listing-card{grid-template-columns:92px 1fr}.my-listing-media{width:92px;height:92px}}
    `;
    document.head.appendChild(style);

    function addProfileButton(){
      var menu=document.querySelector('.profilemenu');
      if(!menu||menu.querySelector('[data-my-listings]'))return;
      var b=document.createElement('button');
      b.setAttribute('data-my-listings','1');
      b.innerHTML='My Listings <b>›</b>';
      b.onclick=function(){window.setPath('/my-listings')};
      var sell=[...menu.querySelectorAll('button')].find(function(x){return /Sell \/ List/i.test(x.textContent)});
      if(sell)menu.insertBefore(b,sell);else menu.appendChild(b);
    }
    new MutationObserver(addProfileButton).observe(document.getElementById('app'),{childList:true,subtree:true});
    addProfileButton();
  });
})();
