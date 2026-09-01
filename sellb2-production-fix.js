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
    if(t==='home'||t.includes('home'))return '/';
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
  async function hardNavigate(p){
    p=p||'/';
    if(location.pathname===p){await Promise.resolve(window.render());if(/^\/(properties|vehicles|businesses)$/.test(p))await Promise.resolve(window.load());return;}
    location.assign(p);
  }
  function goBack(){
    if(history.length>1){history.back();return;}
    hardNavigate('/');
  }
  function listingId(){const m=location.pathname.match(/^\/listing\/([^/]+)/);return m?decodeURIComponent(m[1]):null;}
  function toastMsg(text){try{const t=eval('toast');if(typeof t==='function')return t(text)}catch(e){}alert(text)}
  function elementText(el){return String(el?.getAttribute?.('aria-label')||el?.getAttribute?.('title')||el?.textContent||'').trim().toLowerCase();}
  function isBackElement(el){
    if(!el||!el.closest)return false;
    const hit=el.closest('[data-back], [data-action="back"], .back, .backbtn, .back-btn, .backbutton, .back-button, .pageback, .page-back, .nav-back, .app-back, .go-back, button[aria-label*="back" i], a[aria-label*="back" i], button[title*="back" i], a[title*="back" i]');
    if(hit)return true;
    const t=elementText(el);
    return t==='back'||t==='go back'||t==='‹'||t==='‹ back'||t==='←'||t==='← back';
  }
  function bottomNavElement(el){
    if(!el||!el.closest)return null;
    return el.closest('.bottomnav, .bottom-nav, nav.bottomnav, [data-bottom-nav], footer nav');
  }
  function bottomPath(el){
    const nav=bottomNavElement(el);if(!nav)return null;
    const item=el.closest('button,a,[role="button"],div');
    const text=elementText(item)||elementText(el);
    if(text.includes('home'))return '/';
    if(text.includes('propert'))return '/properties';
    if(text.includes('vehicle'))return '/vehicles';
    if(text.includes('business'))return '/businesses';
    if(text.includes('saved')||text.includes('heart'))return '/saved';
    if(text.includes('message')||text.includes('chat'))return '/messages';
    if(text.includes('profile')||text.includes('account'))return '/profile';
    const href=item?.getAttribute?.('href');
    if(href&&/^\/(properties|vehicles|businesses|saved|messages|profile)?$/.test(href))return href||'/';
    return null;
  }

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

    // Capture navigation before the original app handlers. This deliberately supports
    // both buttons and anchors because the mobile bottom navigation has changed markup.
    document.addEventListener('click',function(ev){
      const target=ev.target;if(!target?.closest)return;

      // Top/page back arrow: use browser history so it returns to the actual previous page.
      if(isBackElement(target)){
        ev.preventDefault();ev.stopImmediatePropagation();goBack();return;
      }

      // Mobile bottom navigation: Home and Properties (and the other existing tabs).
      const bp=bottomPath(target);
      if(bp){
        ev.preventDefault();ev.stopImmediatePropagation();hardNavigate(bp);return;
      }

      const nav=target.closest('.bottomnav button, .bottomnav a, .bottom-nav button, .bottom-nav a');
      if(nav){
        const p=pathForText(elementText(nav));
        if(p){ev.preventDefault();ev.stopImmediatePropagation();hardNavigate(p);return;}
      }

      const cat=target.closest('.categories.large button, .categories.large a');
      if(cat){const p=pathForText(elementText(cat));if(p){ev.preventDefault();ev.stopImmediatePropagation();ST.cat=p==='/vehicles'?'vehicle':p==='/businesses'?'business':'property';ST.type='all';hardNavigate(p);return;}}
      const tab=target.closest('.cat-tabs button, .cat-tabs a');
      if(tab){const label=elementText(tab);if(label==='everything'){ev.preventDefault();ev.stopImmediatePropagation();ST.cat='all';ST.type='all';hardNavigate('/properties');return}const p=pathForText(label);if(p){ev.preventDefault();ev.stopImmediatePropagation();ST.cat=p==='/vehicles'?'vehicle':p==='/businesses'?'business':'property';ST.type='all';hardNavigate(p);return}}
      const sectionBtn=target.closest('.sectionhead button, .sectionhead a');
      if(sectionBtn){const t=elementText(sectionBtn);if(t==='view all'){ev.preventDefault();ev.stopImmediatePropagation();hardNavigate('/properties');return}if(t==='see all'&&typeof window.drawer==='function'){ev.preventDefault();ev.stopImmediatePropagation();window.drawer();return}}
      const detailContact=target.closest('.detailactions .btn');
      if(detailContact){const id=listingId();if(id){const t=elementText(detailContact);if(t.includes('contact seller')){ev.preventDefault();ev.stopImmediatePropagation();window.chatStart(id);return}if(t.includes('enquiry')){ev.preventDefault();ev.stopImmediatePropagation();window.enquiry(id);return}}}
      const profile=target.closest('.appbar .signin');
      if(profile){ev.preventDefault();ev.stopImmediatePropagation();hardNavigate(ST.user?'/profile':'/auth');return}
      const brand=target.closest('.appbar .brand');
      if(brand){ev.preventDefault();ev.stopImmediatePropagation();hardNavigate('/');return}
      const more=target.closest('.pagehead .more');
      if(more&&typeof window.drawer==='function'){ev.preventDefault();ev.stopImmediatePropagation();window.drawer();return}
    },true);

    document.addEventListener('submit',function(ev){const form=ev.target;if(form?.matches?.('.composer')){const id=location.pathname.split('/')[2];if(id){ev.preventDefault();ev.stopImmediatePropagation();window.sendMsg(ev,id);}}},true);
    window.addEventListener('popstate',function(){ST.route=location.pathname;Promise.resolve(window.render()).then(function(){if(/^\/(properties|vehicles|businesses)$/.test(location.pathname))window.load();});});
  }
  wait();
})();
