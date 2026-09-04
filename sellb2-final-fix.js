(function(){
  'use strict';
  const start=Date.now();
  function ready(){return !!window.db&&!!window.st&&typeof window.render==='function'&&typeof window.load==='function'}
  function wait(){if(ready())install();else if(Date.now()-start<20000)setTimeout(wait,50)}
  function go(path){
    path=String(path||'/');
    if(location.pathname===path){window.st.route=path;Promise.resolve(window.render()).then(()=>{if(/^\/(properties|vehicles|businesses)$/.test(path))window.load()});return}
    history.pushState({},'',path);window.st.route=path;
    Promise.resolve(window.render()).then(()=>{if(/^\/(properties|vehicles|businesses)$/.test(path))window.load()});
  }
  function back(){if(history.length>1){history.back();return}go('/')}
  function pathFromText(text){const t=String(text||'').toLowerCase();if(t.includes('home'))return '/';if(t.includes('propert'))return '/properties';if(t.includes('vehicle'))return '/vehicles';if(t.includes('business'))return '/businesses';if(t.includes('saved'))return '/saved';if(t.includes('message')||t.includes('chat'))return '/messages';if(t.includes('profile')||t.includes('account'))return '/profile';return null}
  function toast(message){if(typeof window.toast==='function')window.toast(message);else alert(message)}
  function legalPage(kind){
    const privacy=kind==='privacy';
    const title=privacy?'Privacy Policy':'Terms & Conditions';
    const body=privacy?`
      <section class="legalbox"><p><b>Last updated: 4 September 2026</b></p><p>SELLB2 is a marketplace operated by <b>Aexara Technologies</b>. This Privacy Policy explains how we collect, use and protect information when you use SELLB2.</p><h3>1. Information we collect</h3><p>We may collect account information such as your name, email address and phone number, profile information, listing information, images and messages you choose to provide.</p><h3>2. How we use information</h3><p>We use information to create and secure accounts, operate the marketplace, publish and manage listings, enable buyer-seller communication, provide support and improve SELLB2.</p><h3>3. Public marketplace information</h3><p>Information you include in a listing may be visible to other users. Do not publish passwords, payment credentials, government identification numbers or other sensitive information in a listing or message.</p><h3>4. Storage and security</h3><p>SELLB2 uses third-party infrastructure providers, including Supabase, to store and process application data. We apply access controls intended to protect account and marketplace data, but no internet service can guarantee absolute security.</p><h3>5. Communications</h3><p>We do not send promotional messages unless a feature explicitly requires them or you request them. Transactional or account-related communications may be sent where necessary to provide a requested service.</p><h3>6. Your choices</h3><p>You may update profile information through your account. You can contact Aexara Technologies regarding privacy questions or requests concerning your information.</p><h3>7. Children</h3><p>SELLB2 is not intended for children who are not legally permitted to use online marketplace services in their jurisdiction.</p><h3>8. Changes</h3><p>We may update this policy when the service or applicable requirements change. The latest version will be available inside SELLB2.</p></section>`:`
      <section class="legalbox"><p><b>Last updated: 4 September 2026</b></p><p>These Terms & Conditions govern your use of SELLB2, a marketplace operated by <b>Aexara Technologies</b>.</p><h3>1. Marketplace role</h3><p>SELLB2 provides a platform for users to discover and publish listings for properties, vehicles and businesses. SELLB2 is not automatically a party to transactions between buyers and sellers.</p><h3>2. User accounts</h3><p>You are responsible for maintaining the security of your account and for the accuracy of information you submit. Do not create accounts using another person's identity or provide misleading information.</p><h3>3. Listings</h3><p>You must have the right to advertise anything you list. Listings must be accurate, lawful and not misleading. You must not upload illegal, fraudulent, infringing, abusive or deceptive content.</p><h3>4. Transactions</h3><p>Users are responsible for independently verifying ownership, condition, documentation, pricing and other transaction details. Never transfer money solely because a listing appears on SELLB2.</p><h3>5. Prohibited conduct</h3><p>You must not attempt to compromise the service, scrape it abusively, impersonate others, upload malware, manipulate listings, harass users or use SELLB2 for unlawful activity.</p><h3>6. Content and removal</h3><p>You retain responsibility for content you submit. Aexara Technologies may restrict or remove content or accounts that violate these terms, applicable law or platform safety requirements.</p><h3>7. Availability</h3><p>SELLB2 is provided on an ongoing basis, but availability and features may change. No guarantee is made that every listing, message or service will always be available or error-free.</p><h3>8. Limitation</h3><p>To the extent permitted by applicable law, Aexara Technologies is not responsible for losses arising from transactions or representations made by individual marketplace users.</p><h3>9. Changes</h3><p>These terms may be updated as SELLB2 evolves. Continued use after an update means you accept the updated terms to the extent permitted by law.</p></section>`;
    return `<main class="screen">${head(title,'/profile')}<div class="legalcontent">${body}<button class="btn primary full" onclick="setPath('/profile')">Back to Profile</button><p class="powered">Powered by <b>Aexara Technologies</b></p></div>${nav('/profile')}</main>`;
  }
  function installLegal(){
    if(window.__sellb2LegalInstalled)return;
    window.__sellb2LegalInstalled=true;
    const style=document.createElement('style');
    style.textContent=`.legalcontent{padding:0 18px 28px}.legalbox{padding:20px;border:1px solid var(--line);background:var(--surface);border-radius:22px;box-shadow:var(--shadow);font-size:14px;line-height:1.65}.legalbox h3{font-size:16px;margin:20px 0 6px}.legalbox p{color:var(--muted);margin:8px 0}.legalbox b{color:var(--text)}.powered{text-align:center;color:var(--muted);font-size:12px;padding:18px 0 8px}.profilelegal{margin:18px;border:1px solid var(--line);border-radius:20px;overflow:hidden;background:var(--surface)}.profilelegal button{width:100%;padding:16px 17px;border:0;border-bottom:1px solid var(--line);background:none;text-align:left;display:flex;justify-content:space-between;font-weight:750}.profilelegal button:last-child{border-bottom:0}.profilelegal small{display:block;padding:12px 17px;color:var(--muted);border-bottom:1px solid var(--line);font-size:11px}.profilepowered{text-align:center;color:var(--muted);font-size:11px;padding:2px 18px 22px}.profilepowered b{color:var(--text)}`;
    document.head.appendChild(style);
    const originalRender=window.render;
    if(typeof originalRender==='function'){
      window.render=async function(){
        const r=await originalRender.apply(this,arguments);
        if(location.pathname==='/privacy-policy')return document.getElementById('app').innerHTML=legalPage('privacy');
        if(location.pathname==='/terms-and-conditions')return document.getElementById('app').innerHTML=legalPage('terms');
        if(location.pathname==='/profile')setTimeout(addProfileLegal,0);
        return r;
      };
    }
    function addProfileLegal(){
      if(location.pathname!=='/profile')return;
      const menu=document.querySelector('.profilemenu');
      if(!menu)return;
      document.querySelectorAll('.profile-legal-marker').forEach(el=>el.remove());
      document.querySelectorAll('.profilepowered').forEach(el=>el.remove());
      const box=document.createElement('section');box.className='profilelegal profile-legal-marker';
      box.innerHTML='<small>LEGAL &amp; INFORMATION</small><button type="button" data-legal="privacy">Privacy Policy <b>›</b></button><button type="button" data-legal="terms">Terms &amp; Conditions <b>›</b></button>';
      menu.parentNode.insertBefore(box,menu.nextSibling);
      const p=document.createElement('p');p.className='profilepowered';p.innerHTML='Powered by <b>Aexara Technologies</b>';
      box.parentNode.insertBefore(p,box.nextSibling);
      box.addEventListener('click',e=>{const b=e.target.closest('[data-legal]');if(!b)return;go(b.dataset.legal==='privacy'?'/privacy-policy':'/terms-and-conditions')});
    }
  }
  function applySearchFilters(){
    const s=window.st;
    const path=s.cat==='vehicle'?'/vehicles':s.cat==='business'?'/businesses':'/properties';
    s.type=s.type||'all';
    s.route=path;
    history.pushState({},'',path);
    Promise.resolve(window.render()).then(()=>window.load());
  }
  function install(){
    if(window.__sellb2FinalFixInstalled)return;
    window.__sellb2FinalFixInstalled=true;
    installLegal();
    window.setPath=go;window.__sellb2Navigate=go;
    document.addEventListener('click',function(ev){
      const el=ev.target;if(!el?.closest)return;
      const filterBtn=el.closest('.filterbox button.btn.primary.full');
      if(filterBtn){ev.preventDefault();ev.stopImmediatePropagation();applySearchFilters();return}
      const backEl=el.closest('.pagehead .back,.back,[data-back],button[aria-label*="back" i],button[title*="back" i]');
      if(backEl){ev.preventDefault();ev.stopImmediatePropagation();back();return}
      const nav=el.closest('.bottomnav button,.bottomnav a,.bottom-nav button,.bottom-nav a');
      if(nav){const p=pathFromText(nav.textContent||'');if(p){ev.preventDefault();ev.stopImmediatePropagation();go(p);return}}
      const cat=el.closest('.categories.large button,.categories.large a');
      if(cat){const p=pathFromText(cat.textContent||'');if(p){ev.preventDefault();ev.stopImmediatePropagation();window.st.cat=p==='/'?'all':p==='/vehicles'?'vehicle':p==='/businesses'?'business':'property';window.st.type='all';go(p);return}}
      const tab=el.closest('.cat-tabs button,.cat-tabs a');
      if(tab){const label=(tab.textContent||'').trim().toLowerCase();if(label==='everything'){ev.preventDefault();ev.stopImmediatePropagation();window.st.cat='all';window.st.type='all';go('/properties');return}const p=pathFromText(label);if(p){ev.preventDefault();ev.stopImmediatePropagation();window.st.cat=p==='/vehicles'?'vehicle':p==='/businesses'?'business':'property';window.st.type='all';go(p);return}}
      const brand=el.closest('.appbar .brand');if(brand){ev.preventDefault();ev.stopImmediatePropagation();go('/');return}
      const sign=el.closest('.appbar .signin');if(sign){ev.preventDefault();ev.stopImmediatePropagation();go(window.st.user?'/profile':'/auth');return}
      const detail=el.closest('.detailactions .btn');
      if(detail&&/^\/listing\//.test(location.pathname)){const id=decodeURIComponent(location.pathname.split('/')[2]);const t=(detail.textContent||'').toLowerCase();if(t.includes('contact seller')){ev.preventDefault();ev.stopImmediatePropagation();window.chatStart(id);return}if(t.includes('enquiry')){ev.preventDefault();ev.stopImmediatePropagation();window.enquiry(id);return}}
    },true);
    window.chatStart=async function(id){
      if(!window.st.user){go('/auth');return}
      try{const text=prompt('Write your first message:');if(!text?.trim())return;const r=await window.db.rpc('start_conversation',{p_listing_id:id,p_message:text.trim()});if(r.error)throw r.error;let cid=r.data;if(cid&&typeof cid==='object')cid=cid.id||cid[0]?.id;if(!cid)throw Error('Conversation could not be created.');go('/messages/'+encodeURIComponent(cid));}
      catch(e){toast(e?.message||'Could not contact seller.')}
    };
    window.sendMsg=async function(e,id){
      if(e)e.preventDefault();if(!window.st.user){go('/auth');return}
      const input=document.getElementById('msg'),body=input?.value?.trim()||'';if(!body)return;
      try{
        const r=await window.db.rpc('send_message',{p_conversation_id:id,p_body:body});
        if(r.error)throw r.error;
        if(input)input.value='';
        const bodyEl=document.getElementById('chatbody');
        if(bodyEl){const bubble=document.createElement('div');bubble.className='bubble mine';bubble.textContent=body;bodyEl.appendChild(bubble);bodyEl.scrollTop=bodyEl.scrollHeight}
      }catch(e2){toast(e2?.message||'Message could not be sent.')}
    };
    window.addEventListener('popstate',function(){window.st.route=location.pathname;Promise.resolve(window.render()).then(()=>{if(/^\/(properties|vehicles|businesses)$/.test(location.pathname))window.load()})});
  }
  wait();
})();