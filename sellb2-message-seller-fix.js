/* SELLB2: Message seller opens the seller chat UI immediately. */
(function(){
  'use strict';
  let busy=false;

  function db(){return window.db||null;}
  function toast(message){if(typeof window.toast==='function')window.toast(message);else console.warn('SELLB2:',message);}
  function withTimeout(promise,ms,message){return Promise.race([promise,new Promise(function(_,reject){setTimeout(function(){reject(new Error(message||'Request timed out'))},ms)})]);}
  function getListingId(button){
    const raw=button.getAttribute('onclick')||'';
    const match=raw.match(/(?:chatStart|messageSeller)\s*\(\s*['\"]([^'\"]+)['\"]\s*\)/i);
    return match?match[1]:(button.getAttribute('data-listing-id')||null);
  }

  function showInstantChat(listingId){
    const app=document.getElementById('app'); if(!app)return;
    app.innerHTML='<main class="screen chatpage" style="min-height:100vh;display:flex;flex-direction:column;background:var(--bg,#070b15)">'+
      '<header class="chathead" style="display:flex;align-items:center;gap:14px;padding:24px 18px;border-bottom:1px solid rgba(255,255,255,.08)">'+
      '<button type="button" id="sellb2ChatBack" style="width:56px;height:56px;border-radius:18px;font-size:34px">‹</button><div><b id="sellb2ChatSeller" style="font-size:22px">Seller</b><small id="sellb2ChatListing" style="display:block;opacity:.65;font-size:15px">Seller chat</small></div></header>'+
      '<div class="chatbody" id="sellb2InstantBody" style="flex:1;overflow:auto;padding:20px"><div id="sellb2ChatStatus" style="opacity:.65">Loading messages…</div></div>'+
      '<form class="composer" id="sellb2InstantComposer" style="display:flex;gap:12px;padding:14px 18px;border-top:1px solid rgba(255,255,255,.08)"><input id="sellb2InstantInput" autocomplete="off" placeholder="Write a message…" style="flex:1"><button type="submit" style="width:62px">➤</button></form></main>';
    document.getElementById('sellb2ChatBack').onclick=function(){if(typeof window.setPath==='function')window.setPath('/messages');else location.assign('/messages')};
    document.getElementById('sellb2InstantComposer').onsubmit=function(e){e.preventDefault();sendMessage();};
    return document.getElementById('sellb2InstantBody');
  }

  function addBubble(body,mine){
    const bodyEl=document.getElementById('sellb2InstantBody');if(!bodyEl)return;
    const status=document.getElementById('sellb2ChatStatus');if(status)status.remove();
    const b=document.createElement('div');b.textContent=body;b.style.cssText='max-width:78%;width:max-content;margin:8px 0;padding:11px 14px;border-radius:16px;'+(mine?'margin-left:auto;background:#5578ff;color:#fff':'background:rgba(255,255,255,.10)');bodyEl.appendChild(b);bodyEl.scrollTop=bodyEl.scrollHeight;
  }

  let activeConversationId=null,pending=[];
  async function sendMessage(){
    const input=document.getElementById('sellb2InstantInput');const body=input&&input.value.trim();if(!body)return;
    input.value='';
    if(!activeConversationId){pending.push(body);addBubble(body,true);return;}
    const client=db();const session=await client.auth.getSession();const uid=session.data?.session?.user?.id;if(!uid)return;
    const r=await client.from('messages').insert({conversation_id:activeConversationId,sender_id:uid,body});
    if(r.error)toast(r.error.message||'Could not send message.');else addBubble(body,true);
  }

  async function finishChat(listingId){
    try{
      const client=db();if(!client){toast('Database client unavailable');return;}
      const session=await withTimeout(client.auth.getSession(),2000,'Could not verify sign-in.');
      const user=session.data?.session?.user;
      if(!user){if(typeof window.setPath==='function')window.setPath('/auth');else location.assign('/auth');return;}

      /* One secure RPC resolves the exact seller and creates/reuses the exact listing conversation. */
      const r=await withTimeout(client.rpc('start_conversation',{p_listing_id:listingId,p_message:null}),5000,'Could not open the seller chat.');
      if(r.error){toast(r.error.message||'Could not open the seller chat.');return;}
      activeConversationId=typeof r.data==='string'?r.data:(r.data?.id||r.data?.[0]?.id);
      if(!activeConversationId){toast('Could not open the seller chat.');return;}

      history.replaceState({},'', '/messages/'+activeConversationId);
      const conv=await client.from('conversations').select('seller_id,listing_id').eq('id',activeConversationId).maybeSingle();
      if(conv.data?.seller_id){
        const p=await client.from('profiles').select('full_name').eq('id',conv.data.seller_id).maybeSingle();
        const name=document.getElementById('sellb2ChatSeller');if(name)name.textContent=p.data?.full_name||'Seller';
      }
      const title=document.getElementById('sellb2ChatListing');if(title)title.textContent='Seller chat';
      const msgs=await client.from('messages').select('*').eq('conversation_id',activeConversationId).order('created_at');
      if(!msgs.error){const body=document.getElementById('sellb2InstantBody');if(body){body.innerHTML='';const uid=user.id;(msgs.data||[]).forEach(m=>addBubble(m.body,m.sender_id===uid));if(!msgs.data?.length)body.innerHTML='<div id="sellb2ChatStatus" style="opacity:.65">Start the conversation with the seller.</div>';}}
      }
      const queued=pending.splice(0);for(const text of queued){document.getElementById('sellb2InstantInput').value=text;await sendMessage();}
    }catch(e){console.error('SELLB2 seller chat:',e);toast(e?.message||'Could not open the seller chat.');}
  }

  function openSellerChat(listingId){
    if(busy||!listingId)return;busy=true;
    showInstantChat(listingId);
    /* Network/database work starts only after the screen is painted. */
    setTimeout(function(){finishChat(listingId).finally(function(){busy=false;});},0);
  }

  window.__sellb2MessageSeller=openSellerChat;window.chatStart=openSellerChat;window.messageSeller=openSellerChat;
  function wireButton(button){
    if(!button||button.dataset.sellb2MessageWired==='1')return;
    const text=(button.textContent||'').trim();if(!/^(?:Contact seller|Message seller)$/i.test(text))return;
    const listingId=getListingId(button);if(!listingId)return;
    button.textContent='Message seller';button.setAttribute('aria-label','Message seller');button.dataset.sellb2MessageWired='1';button.removeAttribute('onclick');
    button.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openSellerChat(listingId);},true);
  }
  function scan(root){(root||document).querySelectorAll('button').forEach(wireButton)}
  function start(){scan(document);new MutationObserver(function(){scan(document)}).observe(document.documentElement,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
