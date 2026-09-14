/* SELLB2: direct listing-to-seller messaging. */
(function(){
  'use strict';
  const SUPABASE_URL='https://bttujypzchanhvdmqutv.supabase.co';
  const SUPABASE_KEY='sb_publishable_j4O7PGss7-wWXkY5YnwyOw_i3X1p1l0';
  let client=null;
  let busy=false;
  let activeListingId=null;
  let activeConversationId=null;
  let pendingMessages=[];

  function getClient(){
    if(client)return client;
    if(!window.supabase||typeof window.supabase.createClient!=='function')return null;
    client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    return client;
  }

  function notify(message){
    if(typeof window.toast==='function')window.toast(message);
    else console.warn('SELLB2:',message);
  }

  function shell(listingId){
    activeListingId=listingId;
    activeConversationId=null;
    pendingMessages=[];
    const app=document.getElementById('app');
    if(!app)return;
    app.innerHTML='<main class="screen chatpage"><header class="chathead"><button type="button" id="sellb2ChatBack">‹</button><div><b id="sellb2ChatSeller">Seller</b><small id="sellb2ChatListing">Opening this listing chat…</small></div></header><div class="chatbody" id="sellb2InstantBody"><div class="muted" id="sellb2ChatStatus">Opening seller chat…</div></div><form class="composer" id="sellb2InstantComposer"><input id="sellb2InstantInput" autocomplete="off" placeholder="Write a message…"><button type="submit">➤</button></form></main>';
    document.getElementById('sellb2ChatBack').onclick=function(){if(typeof window.setPath==='function')window.setPath('/messages');else location.assign('/messages')};
    document.getElementById('sellb2InstantComposer').onsubmit=function(e){e.preventDefault();queueOrSendMessage()};
  }

  function addBubble(body,mine){
    const bodyEl=document.getElementById('sellb2InstantBody');
    if(!bodyEl)return;
    const status=document.getElementById('sellb2ChatStatus');
    if(status)status.remove();
    const b=document.createElement('div');
    b.className='bubble '+(mine?'mine':'theirs');
    b.textContent=body;
    bodyEl.appendChild(b);
    bodyEl.scrollTop=bodyEl.scrollHeight;
  }

  async function sendToConversation(body){
    const db=getClient();
    if(!db||!activeConversationId)return false;
    const session=await db.auth.getSession();
    const uid=session.data?.session?.user?.id;
    if(!uid)return false;
    const r=await db.from('messages').insert({conversation_id:activeConversationId,sender_id:uid,body});
    if(r.error){notify(r.error.message||'Could not send message');return false}
    addBubble(body,true);
    return true;
  }

  async function loadConversationMessages(){
    if(!activeConversationId)return;
    const db=getClient();
    if(!db)return;
    const r=await db.from('messages').select('*').eq('conversation_id',activeConversationId).order('created_at');
    if(r.error)return;
    const body=document.getElementById('sellb2InstantBody');
    if(!body)return;
    body.innerHTML='';
    const session=await db.auth.getSession();
    const uid=session.data?.session?.user?.id;
    (r.data||[]).forEach(m=>addBubble(m.body,m.sender_id===uid));
    if(!(r.data||[]).length){
      body.innerHTML='<div class="muted" id="sellb2ChatStatus">Start the conversation with the seller.</div>';
    }
  }

  async function hydrateSellerChat(listingId){
    try{
      const db=getClient();
      if(!db)return;
      const session=await db.auth.getSession();
      if(session.error||!session.data?.session){
        if(typeof window.setPath==='function')window.setPath('/auth');else location.assign('/auth');
        return;
      }
      const listingPromise=db.from('listings').select('id,title,owner_id').eq('id',listingId).eq('status','active').eq('approval_status','approved').maybeSingle();
      const conversationPromise=db.rpc('start_conversation',{p_listing_id:listingId,p_message:null});
      const listing=await listingPromise;
      if(listing.data){
        const title=document.getElementById('sellb2ChatListing');
        if(title)title.textContent=listing.data.title||'Seller listing';
        if(listing.data.owner_id){
          const profile=await db.from('profiles').select('full_name').eq('id',listing.data.owner_id).maybeSingle();
          const seller=document.getElementById('sellb2ChatSeller');
          if(seller)seller.textContent=profile.data?.full_name||'Seller';
        }
      }
      const r=await conversationPromise;
      if(r.error){
        console.error('SELLB2 start_conversation:',r.error);
        notify(r.error.message||'Could not open seller chat');
        return;
      }
      let cid=r.data;
      if(typeof cid!=='string')cid=cid?.id||cid?.[0]?.id;
      if(!cid){notify('Could not open seller chat');return;}
      activeConversationId=cid;
      history.replaceState({},'', '/messages/'+cid);
      await loadConversationMessages();
      const queued=pendingMessages.splice(0);
      for(const body of queued)await sendToConversation(body);
    }catch(err){
      console.error('SELLB2 message seller:',err);
      notify(err?.message||'Could not open seller chat');
    }finally{
      busy=false;
    }
  }

  function queueOrSendMessage(){
    const input=document.getElementById('sellb2InstantInput');
    const body=input?.value.trim();
    if(!body)return;
    input.value='';
    if(activeConversationId){sendToConversation(body);return}
    pendingMessages.push(body);
    addBubble(body,true);
    const status=document.getElementById('sellb2ChatStatus');
    if(status)status.textContent='Sending…';
  }

  function messageSeller(listingId){
    if(busy||!listingId)return;
    busy=true;
    shell(listingId);
    hydrateSellerChat(listingId);
  }

  window.__sellb2MessageSeller=messageSeller;
  window.chatStart=messageSeller;

  function getListingId(button){
    const raw=button.getAttribute('onclick')||'';
    const match=raw.match(/(?:chatStart|messageSeller)\s*\(\s*['\"]([^'\"]+)['\"]\s*\)/i);
    if(match)return match[1];
    return button.getAttribute('data-listing-id')||null;
  }

  function wireButton(button){
    if(!button)return;
    const text=(button.textContent||'').trim();
    if(!/^(?:Contact seller|Message seller)$/i.test(text))return;
    if(button.dataset.sellb2MessageWired==='1')return;
    const listingId=getListingId(button);
    if(!listingId)return;
    button.textContent='Message seller';
    button.setAttribute('aria-label','Message seller');
    button.dataset.sellb2MessageWired='1';
    button.removeAttribute('onclick');
    button.addEventListener('click',function(event){
      event.preventDefault();
      event.stopPropagation();
      messageSeller(listingId);
    },true);
  }

  function scan(root){
    (root||document).querySelectorAll('button').forEach(wireButton);
  }

  function start(){
    scan(document);
    const observer=new MutationObserver(function(){scan(document)});
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
