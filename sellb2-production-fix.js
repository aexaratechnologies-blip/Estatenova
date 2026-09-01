(function(){
  'use strict';
  const started=Date.now();
  let DB=null,ST=null;
  function resolveGlobals(){
    try{DB=eval('db');ST=eval('st');window.db=DB;window.st=ST;return !!DB&&!!ST}catch(e){return false}
  }
  function ready(){return resolveGlobals()&&typeof window.render==='function'&&typeof window.load==='function';}
  function wait(){if(ready())install();else if(Date.now()-started<20000)setTimeout(wait,100);}
  function pathForText(text){
    const t=String(text||'').trim().toLowerCase();
    if(t==='home')return '/';
    if(t==='properties'||t.includes('property'))return '/properties';
    if(t==='vehicles'||t.includes('vehicle'))return '/vehicles';
    if(t==='businesses'||t.includes('business'))return '/businesses';
    if(t.includes('saved'))return '/saved';
    if(t.includes('messages')||t.includes('message'))return '/messages';
    if(t.includes('profile'))return '/profile';
    return null;
  }
  async function navigate(p){
    p=p||'/';
    if(ST.route===p&&document.getElementById('app')?.innerHTML?.trim())return;
    history.pushState({},'',p);ST.route=location.pathname;
    await Promise.resolve(window.render());
    if(p==='/properties'||p==='/vehicles'||p==='/businesses')await Promise.resolve(window.load());
  }
  function listingId(){const m=location.pathname.match(/^\/listing\/([^/]+)/);return m?decodeURIComponent(m[1]):null;}
  function toastMsg(text){try{const t=eval('toast');if(typeof t==='function')return t(text)}catch(e){}alert(text)}

  function install(){
    if(window.__sellb2ProductionFixInstalled)return;
    window.__sellb2ProductionFixInstalled=true;
    window.__sellb2Navigate=navigate;window.setPath=navigate;

    window.enquiry=async function(id){
      if(!ST.user)return navigate('/auth');
      try{
        let p=ST.items.find(x=>String(x.id)===String(id));
        if(!p){const r=await DB.from('listings').select('id,owner_id').eq('id',id).eq('status','active').eq('approval_status','approved').maybeSingle();if(r.error)throw r.error;p=r.data;}
        if(!p)throw Error('Listing is not available.');
        const text=prompt('Write your enquiry:');if(!text?.trim())return;
        const r=await DB.from('inquiries').insert({listing_id:id,buyer_id:ST.user.id,seller_id:p.owner_id,message:text.trim(),buyer_phone:ST.user.phone||null,buyer_email:ST.user.email||null});
        if(r.error)throw r.error;toastMsg('Enquiry sent successfully.');
      }catch(e){toastMsg(e?.message||'Could not send enquiry.');}
    };

    window.chatStart=async function(id){
      if(!ST.user)return navigate('/auth');
      try{
        const text=prompt('Write your first message:');if(!text?.trim())return;
        const r=await DB.rpc('start_conversation',{p_listing_id:id,p_message:text.trim()});if(r.error)throw r.error;
        let cid=r.data;if(cid&&typeof cid==='object')cid=cid.id||cid[0]?.id;if(!cid)throw Error('Conversation could not be created.');
        await navigate('/messages/'+encodeURIComponent(cid));
      }catch(e){toastMsg(e?.message||'Could not contact seller.');}
    };

    window.sendMsg=async function(e,id){
      if(e)e.preventDefault();const input=document.getElementById('msg'),body=input?.value?.trim()||'';if(!body)return;
      try{const r=await DB.rpc('send_message',{p_conversation_id:id,p_body:body});if(r.error)throw r.error;if(input)input.value='';await Promise.resolve(window.render());}
      catch(x){toastMsg(x?.message||'Message could not be sent.');}
    };

    document.addEventListener('click',function(ev){
      const target=ev.target;if(!target?.closest)return;
      const nav=target.closest('.bottomnav button');
      if(nav){const p=pathForText(nav.textContent);if(p){ev.preventDefault();ev.stopImmediatePropagation();navigate(p);return;}}
      const cat=target.closest('.categories.large button');
      if(cat){const p=pathForText(cat.textContent);if(p){ev.preventDefault();ev.stopImmediatePropagation();ST.cat=p==='/vehicles'?'vehicle':p==='/businesses'?'business':'property';ST.type='all';navigate(p);return;}}
      const tab=target.closest('.cat-tabs button');
      if(tab){const label=tab.textContent.trim().toLowerCase();if(label==='everything'){ev.preventDefault();ev.stopImmediatePropagation();ST.cat='all';ST.type='all';navigate('/properties');return}const p=pathForText(label);if(p){ev.preventDefault();ev.stopImmediatePropagation();ST.cat=p==='/vehicles'?'vehicle':p==='/businesses'?'business':'property';ST.type='all';navigate(p);return}}
      const sectionBtn=target.closest('.sectionhead button');
      if(sectionBtn){const t=sectionBtn.textContent.trim().toLowerCase();if(t==='view all'){ev.preventDefault();ev.stopImmediatePropagation();navigate('/properties');return}if(t==='see all'&&typeof window.drawer==='function'){ev.preventDefault();ev.stopImmediatePropagation();window.drawer();return}}
      const detailContact=target.closest('.detailactions .btn');
      if(detailContact){const id=listingId();if(id){const t=detailContact.textContent.trim().toLowerCase();if(t.includes('contact seller')){ev.preventDefault();ev.stopImmediatePropagation();window.chatStart(id);return}if(t.includes('enquiry')){ev.preventDefault();ev.stopImmediatePropagation();window.enquiry(id);return}}}
      const profile=target.closest('.appbar .signin');
      if(profile){ev.preventDefault();ev.stopImmediatePropagation();navigate(ST.user?'/profile':'/auth');return}
      const brand=target.closest('.appbar .brand');
      if(brand){ev.preventDefault();ev.stopImmediatePropagation();navigate('/');return}
      const more=target.closest('.pagehead .more');
      if(more&&typeof window.drawer==='function'){ev.preventDefault();ev.stopImmediatePropagation();window.drawer();return}
    },true);

    document.addEventListener('submit',function(ev){const form=ev.target;if(form?.matches?.('.composer')){const id=location.pathname.split('/')[2];if(id){ev.preventDefault();ev.stopImmediatePropagation();window.sendMsg(ev,id);}}},true);
    window.addEventListener('popstate',function(){ST.route=location.pathname;Promise.resolve(window.render()).then(function(){if(/^\/(properties|vehicles|businesses)$/.test(location.pathname))window.load();});});
  }
  wait();
})();
