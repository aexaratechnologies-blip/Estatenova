/* SELLB2 PROFILE ID VISIBILITY FIX v1
   Profile IDs remain in the account/database; this only removes the internal
   identifier from the normal user's Profile UI. */
(function(){
  'use strict';
  function hideProfileId(){
    const nodes=document.querySelectorAll('*');
    for(let i=0;i<nodes.length;i++){
      const el=nodes[i];
      if(String(el.textContent||'').trim().toUpperCase()!=='PROFILE ID') continue;
      let card=el.parentElement;
      if(!card) continue;
      const text=String(card.textContent||'');
      // Prefer the nearest compact field/card containing both the label and UUID.
      if(!/PROFILE ID/i.test(text)) continue;
      if(card.children.length===1 && card.parentElement){
        const parent=card.parentElement;
        if(parent.children.length<=3) card=parent;
      }
      card.style.display='none';
      card.setAttribute('data-sellb2-profile-id-hidden','true');
    }
  }
  function init(){
    hideProfileId();
    const observer=new MutationObserver(function(){hideProfileId()});
    observer.observe(document.body,{childList:true,subtree:true});
    window.__sellb2ProfileIdHidden=true;
  }
  if(document.body) init();
  else document.addEventListener('DOMContentLoaded',init,{once:true});
})();
