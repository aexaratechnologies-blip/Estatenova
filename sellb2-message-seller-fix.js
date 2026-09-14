/* SELLB2: Message seller -> real seller chat. No prompt, no custom loading screen. */
(function(){
  'use strict';
  let busy=false;

  function db(){return window.db||null;}
  function toast(message){
    if(typeof window.toast==='function')window.toast(message);
    else console.warn('SELLB2:',message);
  }
  function withTimeout(promise,ms,message){
    return Promise.race([
      promise,
      new Promise(function(_,reject){setTimeout(function(){reject(new Error(message||'Request timed out'))},ms)})
    ]);
  }
  function getListingId(button){
    const raw=button.getAttribute('onclick')||'';
    const match=raw.match(/(?:chatStart|messageSeller)\s*\(\s*['\"]([^'\"]+)['\"]\s*\)/i);
    return match?match[1]:(button.getAttribute('data-listing-id')||null);
  }

  async function openSellerChat(listingId){
    if(busy||!listingId)return;
    busy=true;
    try{
      const client=db();
      if(!client){toast('Database client unavailable');return;}

      const userResult=await withTimeout(client.auth.getUser(),5000,'Could not verify your sign-in.');
      const user=userResult.data&&userResult.data.user;
      if(!user){
        if(typeof window.setPath==='function')window.setPath('/auth');else location.assign('/auth');
        return;
      }

      /* Get the exact seller for this exact listing. */
      const listingResult=await withTimeout(
        client.from('listings').select('id,owner_id').eq('id',listingId).eq('status','active').eq('approval_status','approved').maybeSingle(),
        5000,
        'Could not open this listing chat.'
      );
      if(listingResult.error||!listingResult.data||!listingResult.data.owner_id){
        toast(listingResult.error?.message||'This listing is no longer available.');
        return;
      }
      const sellerId=listingResult.data.owner_id;
      if(sellerId===user.id){toast('You cannot message yourself.');return;}

      /* Reuse the existing conversation when one already exists. */
      let conversationResult=await withTimeout(
        client.from('conversations').select('id').eq('listing_id',listingId).eq('buyer_id',user.id).eq('seller_id',sellerId).maybeSingle(),
        5000,
        'Could not open the seller chat.'
      );
      if(conversationResult.error){
        toast(conversationResult.error.message||'Could not open the seller chat.');
        return;
      }

      let conversationId=conversationResult.data?.id;
      if(!conversationId){
        /* Direct insert is protected by the conversations_insert_buyer RLS policy. */
        const created=await withTimeout(
          client.from('conversations').insert({listing_id:listingId,buyer_id:user.id,seller_id:sellerId}).select('id').single(),
          5000,
          'Could not create the seller chat.'
        );
        if(created.error){
          /* A concurrent click/device may have created it; fetch it once more. */
          const retry=await withTimeout(
            client.from('conversations').select('id').eq('listing_id',listingId).eq('buyer_id',user.id).eq('seller_id',sellerId).maybeSingle(),
            3000,
            'Could not open the seller chat.'
          );
          conversationId=retry.data?.id||null;
          if(!conversationId){toast(created.error.message||'Could not create the seller chat.');return;}
        }else{
          conversationId=created.data?.id;
        }
      }
      if(!conversationId){toast('Could not open the seller chat.');return;}

      /* Use SELLB2's real /messages/:conversationId screen. */
      if(typeof window.setPath==='function')window.setPath('/messages/'+conversationId);
      else location.assign('/messages/'+conversationId);
    }catch(error){
      console.error('SELLB2 Message seller:',error);
      toast(error?.message||'Could not open the seller chat.');
    }finally{
      busy=false;
    }
  }

  window.__sellb2MessageSeller=openSellerChat;
  window.chatStart=openSellerChat;
  window.messageSeller=openSellerChat;

  function wireButton(button){
    if(!button||button.dataset.sellb2MessageWired==='1')return;
    const text=(button.textContent||'').trim();
    if(!/^(?:Contact seller|Message seller)$/i.test(text))return;
    const listingId=getListingId(button);
    if(!listingId)return;
    button.textContent='Message seller';
    button.setAttribute('aria-label','Message seller');
    button.dataset.sellb2MessageWired='1';
    button.removeAttribute('onclick');
    button.addEventListener('click',function(event){
      event.preventDefault();
      event.stopPropagation();
      openSellerChat(listingId);
    },true);
  }

  function scan(root){(root||document).querySelectorAll('button').forEach(wireButton)}
  function start(){
    scan(document);
    new MutationObserver(function(){scan(document)}).observe(document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
