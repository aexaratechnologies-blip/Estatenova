/* SELLB2 — remove the Send Enquiry action from listing UI */
(function(){
  'use strict';
  const TARGET=/^send\s+enquir(?:y|ies)$/i;
  function clean(root){
    if(!root||!root.querySelectorAll)return;
    root.querySelectorAll('button,a,[role="button"]').forEach(function(el){
      const text=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(TARGET.test(text)) el.remove();
    });
  }
  function run(){clean(document.body)}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  new MutationObserver(function(mutations){
    mutations.forEach(function(m){
      m.addedNodes&&m.addedNodes.forEach(function(node){
        if(node.nodeType===1){
          clean(node);
          const text=(node.textContent||'').replace(/\s+/g,' ').trim();
          if(TARGET.test(text)&&/^(BUTTON|A)$/.test(node.tagName)) node.remove();
        }
      });
    });
  }).observe(document.body,{childList:true,subtree:true});
})();
