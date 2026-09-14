/* SELLB2: replace listing contact action with direct messaging. */
(function(){
  'use strict';
  const SUPABASE_URL='https://bttujypzchanhvdmqutv.supabase.co';
  const SUPABASE_KEY='sb_publishable_j4O7PGss7-wWXkY5YnwyOw_i3X1p1l0';
  let client=null;

  function getClient(){
    if(client)return client;
    if(!window.supabase||typeof window.supabase.createClient!=='function')return null;
    client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    return client;
  }

  async function messageSeller(listingId){
    const db=getClient();
    if(!db){
      if(typeof window.toast==='function')window.toast('Messaging is not available right now');
      return;
    }
    const session=await db.auth.getSession();
    if(session.error){
      if(typeof window.toast==='function')window.toast('Please sign in to message the seller');
      return;
    }
    if(!session.data?.session){
      if(typeof window.setPath==='function')window.setPath('/auth');
      else location.assign('/auth');
      return;
    }
    const r=await db.rpc('start_conversation',{p_listing_id:listingId,p_message:null});
    if(r.error){
      if(typeof window.toast==='function')window.toast(r.error.message||'Could not open seller chat');
      return;
    }
    let cid=r.data;
    if(typeof cid!=='string')cid=cid?.id||cid?.[0]?.id;
    if(!cid){
      if(typeof window.toast==='function')window.toast('Could not open seller chat');
      return;
    }
    if(typeof window.setPath==='function')window.setPath('/messages/'+cid);
    else location.assign('/messages/'+cid);
  }

  window.chatStart=messageSeller;

  function updateButton(root){
    const scope=root||document;
    scope.querySelectorAll('button').forEach(function(b){
      if(/^\s*Contact seller\s*$/i.test(b.textContent||'')){
        b.textContent='Message seller';
        b.setAttribute('aria-label','Message seller');
      }
    });
  }

  const observer=new MutationObserver(function(){updateButton(document)});
  function start(){
    updateButton(document);
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
