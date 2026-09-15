/* SELLB2: Message seller -> first-message box -> exact seller chat. v8 */
(function(){
  'use strict';
  const SUPABASE_URL='https://bttujypzchanhvdmqutv.supabase.co';
  const SUPABASE_KEY='sb_publishable_j4O7PGss7-wWXkY5YnwyOw_i3X1p1l0';
  let busy=false,activeConversationId=null;

  function client(){
    if(window.__sellb2MessageClient)return window.__sellb2MessageClient;
    if(!window.supabase||typeof window.supabase.createClient!=='function')return null;
    window.__sellb2MessageClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    return window.__sellb2MessageClient;
  }
  function safe(s){return String(s||'').replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]});}
  function getListingId(btn){
    const raw=btn.getAttribute('onclick')||'';
    const m=raw.match(/(?:chatStart|messageSeller)\s*\(\s*['\"]([^'\"]+)['\"]\s*\)/i);
    return m?m[1]:(btn.getAttribute('data-listing-id')||null);
  }
  function gateRemove(){
    document.querySelectorAll('[data-sellb2-contact-gate],[data-sellb2-contact-premium],[data-sellb2-premium]').forEach(x=>x.remove());
    document.querySelectorAll('body *').forEach(x=>{if((x.textContent||'').trim()==='Seller contact is premium'){let p=x;for(let i=0;i<5&&p.parentElement;i++)p=p.parentElement;p.remove();}});
  }
  function closeModal(){const m=document.getElementById('sellb2MessageComposerModal');if(m)m.remove();document.activeElement?.blur();}
  function setStatus(text){const x=document.getElementById('sellb2ChatStatus');if(x)x.textContent=text;}
  function chatShell(){
    const app=document.getElementById('app');if(!app)return;
    gateRemove();
    app.innerHTML='<main class="screen chatpage" style="min-height:100vh;display:flex;flex-direction:column;background:var(--bg,#070b15);color:var(--text,#fff)">'+
      '<header class="chathead" style="display:flex;align-items:center;gap:14px;padding:24px 18px;border-bottom:1px solid rgba(255,255,255,.08)">'+
      '<button type="button" id="sellb2ChatBack" style="width:56px;height:56px;border-radius:18px;font-size:34px">‹</button><div><b id="sellb2ChatSeller" style="font-size:22px">Seller</b><small id="sellb2ChatListing" style="display:block;opacity:.65;font-size:15px">Opening seller chat…</small></div></header>'+
      '<div class="chatbody" id="sellb2InstantBody" style="flex:1;overflow:auto;padding:20px"><div id="sellb2ChatStatus" style="opacity:.65">Opening seller chat…</div></div>'+
      '<form class="composer" id="sellb2InstantComposer" style="display:flex;gap:12px;padding:14px 18px;border-top:1px solid rgba(255,255,255,.08)"><input id="sellb2InstantInput" autocomplete="off" placeholder="Write a message…" style="flex:1"><button type="submit" style="width:62px">➤</button></form></main>';
    document.getElementById('sellb2ChatBack').onclick=()=>{if(window.setPath)window.setPath('/messages');else location.assign('/messages');};
    document.getElementById('sellb2InstantComposer').onsubmit=e=>{e.preventDefault();sendChatMessage();};
  }
  function bubble(text,mine){
    const box=document.getElementById('sellb2InstantBody');if(!box)return;
    const s=document.getElementById('sellb2ChatStatus');if(s)s.remove();
    const b=document.createElement('div');b.textContent=text;b.style.cssText='max-width:78%;width:max-content;margin:8px 0;padding:11px 14px;border-radius:16px;'+(mine?'margin-left:auto;background:#5578ff;color:#fff':'background:rgba(255,255,255,.10)');box.appendChild(b);box.scrollTop=box.scrollHeight;
  }
  async function loadChat(c,uid){
    const conv=await c.from('conversations').select('seller_id,listing_id').eq('id',activeConversationId).maybeSingle();
    if(conv.data?.seller_id){const p=await c.from('profiles').select('full_name').eq('id',conv.data.seller_id).maybeSingle();const n=document.getElementById('sellb2ChatSeller');if(n)n.textContent=p.data?.full_name||'Seller';}
    const t=document.getElementById('sellb2ChatListing');if(t)t.textContent='Seller chat';
    const msgs=await c.from('messages').select('*').eq('conversation_id',activeConversationId).order('created_at');
    const box=document.getElementById('sellb2InstantBody');if(!box)return;box.innerHTML='';
    if(msgs.error){setStatus('Could not load messages. Please retry.');return;}
    (msgs.data||[]).forEach(m=>bubble(m.body,m.sender_id===uid));
    if(!msgs.data?.length)setStatus('Start the conversation with the seller.');
  }
  async function connect(listingId,firstMessage){
    const c=client();if(!c)throw new Error('Database client unavailable.');
    const u=await c.auth.getUser();
    if(u.error)throw u.error;
    if(!u.data?.user)throw new Error('Please sign in to message the seller.');
    setStatus('Connecting to seller…');
    let r=await c.rpc('start_conversation',{p_listing_id:listingId,p_message:firstMessage});
    if(r.error){
      const fallback=await c.rpc('start_conversation',{p_listing_id:listingId,p_message:null});
      if(fallback.error)throw r.error;
      activeConversationId=typeof fallback.data==='string'?fallback.data:(fallback.data?.id||fallback.data?.[0]?.id);
      if(!activeConversationId)throw new Error('Seller chat could not be created.');
      const ins=await c.from('messages').insert({conversation_id:activeConversationId,sender_id:u.data.user.id,body:firstMessage});
      if(ins.error)throw ins.error;
    }else{
      activeConversationId=typeof r.data==='string'?r.data:(r.data?.id||r.data?.[0]?.id);
      if(!activeConversationId)throw new Error('Seller chat could not be created.');
    }
    history.replaceState({},'', '/messages/'+activeConversationId);
    await loadChat(c,u.data.user.id);
  }
  async function submit(listingId){
    const input=document.getElementById('sellb2FirstMessage');const send=document.getElementById('sellb2MessageSend');
    const body=input?.value.trim();if(!body){input?.focus();return;}
    if(send){send.disabled=true;send.textContent='Opening…';}
    closeModal();chatShell();
    try{await connect(listingId,body);}catch(e){console.error('SELLB2 first-message flow:',e);setStatus(e?.message||'Could not open seller chat.');}
  }
  function openModal(listingId){
    if(document.getElementById('sellb2MessageComposerModal'))return;
    gateRemove();
    const m=document.createElement('div');m.id='sellb2MessageComposerModal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
    m.innerHTML='<div id="sellb2ComposerBackdrop" style="position:fixed;inset:0;z-index:2147483646;background:rgba(0,0,0,.58);display:flex;align-items:center;justify-content:center;padding:22px;box-sizing:border-box">'+
      '<form id="sellb2ComposerForm" style="width:min(92vw,430px);background:var(--card,#111827);color:var(--text,#fff);border:1px solid rgba(255,255,255,.10);border-radius:22px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.45);box-sizing:border-box">'+
      '<div style="font-size:20px;font-weight:800;margin-bottom:6px">Message seller</div><div style="font-size:13px;opacity:.68;margin-bottom:14px">Write your first message to the seller.</div>'+
      '<textarea id="sellb2FirstMessage" rows="4" maxlength="1000" placeholder="Hi, I am interested in this listing…" style="display:block;width:100%;box-sizing:border-box;resize:vertical;min-height:110px;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:inherit;font:inherit;outline:none"></textarea>'+
      '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px"><button type="button" id="sellb2MessageCancel" style="min-width:92px;padding:11px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:transparent;color:inherit;font-weight:700">Cancel</button><button type="submit" id="sellb2MessageSend" style="min-width:120px;padding:11px 16px;border:0;border-radius:12px;background:#5578ff;color:#fff;font-weight:800">Send message</button></div></form></div>';
    document.body.appendChild(m);
    document.getElementById('sellb2ComposerForm').onsubmit=e=>{e.preventDefault();submit(listingId);};
    document.getElementById('sellb2MessageCancel').onclick=closeModal;
    document.getElementById('sellb2ComposerBackdrop').onclick=e=>{if(e.target.id==='sellb2ComposerBackdrop')closeModal();};
    setTimeout(()=>document.getElementById('sellb2FirstMessage')?.focus(),50);
  }
  function open(listingId){if(busy||!listingId)return;busy=true;openModal(listingId);setTimeout(()=>busy=false,0);}
  window.__sellb2MessageSeller=open;window.chatStart=open;window.messageSeller=open;
  function wire(btn){
    if(!btn||btn.dataset.sellb2MessageWired==='8')return;
    const text=(btn.textContent||'').trim();if(!/^(?:Contact seller|Message seller)$/i.test(text))return;
    const id=getListingId(btn);if(!id)return;
    btn.textContent='Message seller';btn.setAttribute('aria-label','Message seller');btn.dataset.sellb2MessageWired='8';btn.removeAttribute('onclick');
    btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open(id);},true);
  }
  function start(){document.querySelectorAll('button').forEach(wire);new MutationObserver(()=>document.querySelectorAll('button').forEach(wire)).observe(document.documentElement,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
