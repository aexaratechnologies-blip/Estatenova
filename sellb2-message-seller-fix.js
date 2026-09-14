/* SELLB2: direct listing-to-seller messaging. */
(function(){
  'use strict';
  const SUPABASE_URL='https://bttujypzchanhvdmqutv.supabase.co';
  const SUPABASE_KEY='sb_publishable_j4O7PGss7-wWXkY5YnwyOw_i3X1p1l0';
  let client=null;
  let busy=false;

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

  async function messageSeller(listingId){
    if(busy)return;
    if(!listingId){notify('Could not identify this listing');return;}
    busy=true;
    try{
      const db=getClient();
      if(!db){notify('Messaging is not available right now');return;}

      const session=await db.auth.getSession();
      if(session.error){
        notify('Please sign in to message the seller');
        return;
      }
      if(!session.data?.session){
        if(typeof window.setPath==='function')window.setPath('/auth');
        else location.assign('/auth');
        return;
      }

      const r=await db.rpc('start_conversation',{p_listing_id:listingId,p_message:null});
      if(r.error){
        console.error('SELLB2 start_conversation:',r.error);
        notify(r.error.message||'Could not open seller chat');
        return;
      }

      let cid=r.data;
      if(typeof cid!=='string')cid=cid?.id||cid?.[0]?.id;
      if(!cid){notify('Could not open seller chat');return;}

      if(typeof window.setPath==='function')window.setPath('/messages/'+cid);
      else location.assign('/messages/'+cid);
    }catch(err){
      console.error('SELLB2 message seller:',err);
      notify(err?.message||'Could not open seller chat');
    }finally{
      busy=false;
    }
  }

  window.__sellb2MessageSeller=messageSeller;
  window.chatStart=messageSeller;

  function getListingId(button){
    const raw=button.getAttribute('onclick')||'';
    const match=raw.match(/(?:chatStart|messageSeller)\s*\(\s*['\"]([^'\"]+)['\"]\s*\)/i);
    if(match)return match[1];
    const href=button.getAttribute('data-listing-id');
    return href||null;
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
