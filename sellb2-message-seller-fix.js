/* SELLB2: Message seller -> first message -> immediate exact seller chat. v9 */
(function(){
  'use strict';
  let busy=false;
  let activeConversationId=null;
  let pendingFirstMessage='';
  let pendingListingId=null;

  function db(){return window.db||null;}
  function toast(message){if(typeof window.toast==='function')window.toast(message);else console.warn('SELLB2:',message);}
  function withTimeout(promise,ms,message){return Promise.race([promise,new Promise(function(_,reject){setTimeout(function(){reject(new Error(message||'Request timed out'))},ms)})]);}
  function getListingId(button){
    const raw=button.getAttribute('onclick')||'';
    const match=raw.match(/(?:chatStart|messageSeller)\s*\(\s*['\"]([^'\"]+)['\"]\s*\)/i);
    return match?match[1]:(button.getAttribute('data-listing-id')||null);
  }
  function removePremiumGate(){
    document.querySelectorAll('[data-sellb2-contact-premium],[data-sellb2-premium],[data-sellb2-contact-gate]').forEach(function(el){el.remove();});
  }
  function closeComposer(){const modal=document.getElementById('sellb2MessageComposerModal');if(modal)modal.remove();}
  function setStatus(text){const x=document.getElementById('sellb2ChatStatus');if(x)x.textContent=text;}

  function showInstantChat(listingId){
    const app=document.getElementById('app');if(!app)return;
    removePremiumGate();
    app.innerHTML='<main class="screen chatpage" style="min-height:100vh;display:flex;flex-direction:column;background:var(--bg,#070b15);color:var(--text,#fff)">'+
      '<header class="chathead" style="display:flex;align-items:center;gap:14px;padding:18px;border-bottom:1px solid rgba(255,255,255,.08)">'+
      '<button type="button" id="sellb2ChatBack" style="width:52px;height:52px;border-radius:16px;font-size:34px">‹</button><div style="min-width:0"><b id="sellb2ChatSeller" style="font-size:21px">Seller</b><small id="sellb2ChatListing" style="display:block;opacity:.65;font-size:14px">Opening this listing chat…</small></div></header>'+
      '<div class="chatbody" id="sellb2InstantBody" style="flex:1;overflow:auto;padding:20px"><div id="sellb2ChatStatus" style="opacity:.65">Opening seller chat…</div></div>'+
      '<form class="composer" id="sellb2InstantComposer" style="display:flex;gap:10px;padding:14px 18px;border-top:1px solid rgba(255,255,255,.08)"><input id="sellb2InstantInput" autocomplete="off" placeholder="Write a message…" style="flex:1"><button type="submit" style="width:62px">➤</button></form></main>';
    document.getElementById('sellb2ChatBack').onclick=function(){activeConversationId=null;pendingFirstMessage='';pendingListingId=null;if(typeof window.setPath==='function')window.setPath('/messages');else location.assign('/messages');};
    document.getElementById('sellb2InstantComposer').onsubmit=function(e){e.preventDefault();sendChatMessage();};
    if(pendingFirstMessage){
      const input=document.getElementById('sellb2InstantInput');
      if(input)input.value='';
      addBubble(pendingFirstMessage,true);
    }
  }

  function addBubble(body,mine){
    const box=document.getElementById('sellb2InstantBody');if(!box)return;
    const status=document.getElementById('sellb2ChatStatus');if(status)status.remove();
    const b=document.createElement('div');b.textContent=body;b.style.cssText='max-width:78%;width:max-content;margin:8px 0;padding:11px 14px;border-radius:16px;'+(mine?'margin-left:auto;background:#5578ff;color:#fff':'background:rgba(255,255,255,.10)');box.appendChild(b);box.scrollTop=box.scrollHeight;
  }

  async function sendChatMessage(){
    const input=document.getElementById('sellb2InstantInput');const body=input&&input.value.trim();if(!body)return;
    if(!activeConversationId){toast('Seller chat is still opening. Please wait a moment.');return;}
    input.value='';
    const client=db();if(!client)return;
    try{
      const userResult=await withTimeout(client.auth.getUser(),5000,'Could not verify sign-in.');
      const uid=userResult.data?.user?.id;if(!uid)throw new Error('Please sign in to message the seller.');
      const r=await withTimeout(client.from('messages').insert({conversation_id:activeConversationId,sender_id:uid,body}),7000,'Could not send message.');
      if(r.error)throw r.error;
      addBubble(body,true);
    }catch(e){console.error('SELLB2 chat send:',e);toast(e?.message||'Could not send message.');if(input)input.value=body;}
  }

  async function connectSellerChat(listingId,firstMessage){
    try{
      const client=db();if(!client)throw new Error('Database client unavailable.');
      const userResult=await withTimeout(client.auth.getUser(),5000,'Could not verify sign-in.');
      const user=userResult.data?.user;
      if(!user)throw new Error('Please sign in to message the seller.');
      setStatus('Connecting to seller…');

      let r=await withTimeout(client.rpc('start_conversation',{p_listing_id:listingId,p_message:firstMessage}),8000,'Could not open the seller chat.');
      if(r.error){
        const fallback=await withTimeout(client.rpc('start_conversation',{p_listing_id:listingId,p_message:null}),8000,'Could not create the seller chat.');
        if(fallback.error)throw r.error;
        activeConversationId=typeof fallback.data==='string'?fallback.data:(fallback.data?.id||fallback.data?.[0]?.id);
        if(!activeConversationId)throw new Error('Seller chat could not be created.');
        const ins=await withTimeout(client.from('messages').insert({conversation_id:activeConversationId,sender_id:user.id,body:firstMessage}),7000,'Could not send your first message.');
        if(ins.error)throw ins.error;
      }else{
        activeConversationId=typeof r.data==='string'?r.data:(r.data?.id||r.data?.[0]?.id);
        if(!activeConversationId)throw new Error('Seller chat could not be created.');
      }

      history.replaceState({},'', '/messages/'+activeConversationId);
      pendingFirstMessage='';pendingListingId=null;
      await loadChat(client,user.id);
    }catch(e){
      console.error('SELLB2 seller chat connect:',e);
      setStatus(e?.message||'Could not open the seller chat.');
    }finally{busy=false;}
  }

  async function loadChat(client,uid){
    try{
      const conv=await withTimeout(client.from('conversations').select('seller_id,listing_id').eq('id',activeConversationId).maybeSingle(),5000,'');
      if(conv.data?.seller_id){
        const p=await withTimeout(client.from('profiles').select('full_name').eq('id',conv.data.seller_id).maybeSingle(),5000,'');
        const name=document.getElementById('sellb2ChatSeller');if(name)name.textContent=p.data?.full_name||'Seller';
      }
      if(conv.data?.listing_id){
        const l=await withTimeout(client.from('listings').select('title').eq('id',conv.data.listing_id).maybeSingle(),5000,'');
        const title=document.getElementById('sellb2ChatListing');if(title)title.textContent=l.data?.title||'Seller chat';
      }
      const msgs=await withTimeout(client.from('messages').select('*').eq('conversation_id',activeConversationId).order('created_at'),7000,'');
      const body=document.getElementById('sellb2InstantBody');if(!body)return;
      body.innerHTML='';
      if(!msgs.error)(msgs.data||[]).forEach(function(m){addBubble(m.body,m.sender_id===uid);});
      if(msgs.error||!msgs.data?.length)setStatus('Start the conversation with the seller.');
    }catch(e){console.error('SELLB2 chat load:',e);}
  }

  function submitFirstMessage(listingId){
    const input=document.getElementById('sellb2FirstMessage');
    const send=document.getElementById('sellb2MessageSend');
    const body=input&&input.value.trim();
    if(!body){if(input){input.focus();input.style.borderColor='#ef4444';}return;}
    if(busy)return;
    busy=true;
    pendingFirstMessage=body;
    pendingListingId=listingId;
    if(send){send.disabled=true;send.textContent='Opening…';}
    closeComposer();
    showInstantChat(listingId);
    history.replaceState({},'', '/messages/seller/'+listingId);
    connectSellerChat(listingId,body);
  }

  function openComposer(listingId){
    if(document.getElementById('sellb2MessageComposerModal'))return;
    removePremiumGate();
    const modal=document.createElement('div');modal.id='sellb2MessageComposerModal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
    modal.innerHTML='<div style="position:fixed;inset:0;z-index:2147483646;background:rgba(0,0,0,.58);display:flex;align-items:center;justify-content:center;padding:22px;box-sizing:border-box">'+
      '<div style="width:min(92vw,430px);background:var(--card,#111827);color:var(--text,#fff);border:1px solid rgba(255,255,255,.10);border-radius:22px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.45);box-sizing:border-box">'+
      '<div style="font-size:20px;font-weight:800;margin-bottom:6px">Message seller</div><div style="font-size:13px;opacity:.68;margin-bottom:14px">Write your first message to the seller.</div>'+
      '<textarea id="sellb2FirstMessage" rows="4" maxlength="1000" placeholder="Hi, I am interested in this listing…" style="display:block;width:100%;box-sizing:border-box;resize:vertical;min-height:110px;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:inherit;font:inherit;outline:none"></textarea>'+
      '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px"><button type="button" id="sellb2MessageCancel" style="min-width:92px;padding:11px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:transparent;color:inherit;font-weight:700">Cancel</button><button type="button" id="sellb2MessageSend" style="min-width:120px;padding:11px 16px;border:0;border-radius:12px;background:#5578ff;color:#fff;font-weight:800">Send message</button></div></div></div>';
    document.body.appendChild(modal);
    const input=document.getElementById('sellb2FirstMessage');
    const send=document.getElementById('sellb2MessageSend');
    document.getElementById('sellb2MessageCancel').onclick=closeComposer;
    modal.firstElementChild.addEventListener('click',function(e){if(e.target===modal.firstElementChild)closeComposer();});
    send.onclick=function(e){e.preventDefault();e.stopPropagation();submitFirstMessage(listingId);};
    send.addEventListener('touchend',function(e){e.preventDefault();e.stopPropagation();submitFirstMessage(listingId);},{passive:false});
    setTimeout(function(){if(input)input.focus();},100);
  }

  function openSellerChat(listingId){if(busy||!listingId)return;busy=true;openComposer(listingId);setTimeout(function(){busy=false;},0);}
  window.__sellb2MessageSeller=openSellerChat;window.chatStart=openSellerChat;window.messageSeller=openSellerChat;

  function wireButton(button){
    if(!button||button.dataset.sellb2MessageWired==='9')return;
    const text=(button.textContent||'').trim();if(!/^(?:Contact seller|Message seller)$/i.test(text))return;
    const listingId=getListingId(button);if(!listingId)return;
    button.textContent='Message seller';button.setAttribute('aria-label','Message seller');button.dataset.sellb2MessageWired='9';button.removeAttribute('onclick');
    button.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openSellerChat(listingId);},true);
  }
  function scan(root){(root||document).querySelectorAll('button').forEach(wireButton);}
  function start(){scan(document);new MutationObserver(function(){scan(document)}).observe(document.documentElement,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
