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
  function install(){
    if(window.__sellb2FinalFixInstalled)return;
    window.__sellb2FinalFixInstalled=true;
    window.setPath=go;window.__sellb2Navigate=go;
    document.addEventListener('click',function(ev){
      const el=ev.target;if(!el?.closest)return;
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
        // Supabase already has a SECURITY DEFINER send_message RPC which validates
        // conversation membership and updates last_message/last_message_at.
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
