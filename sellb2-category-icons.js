/* SELLB2 category icon refinement — property, business and truck icons */
(function(){
  'use strict';
  const ICONS={
    property:'<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M7 22.5 24 8l17 14.5V41H7Z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M18 41V27h12v14M20 18h8" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/></svg>',
    vehicle:'<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M5 15h23v17H5zM28 21h7l7 7v4H28z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M12 32a5 5 0 1 0 10 0M34 32a5 5 0 1 0 10 0M28 26h8" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M8 20h12" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>',
    business:'<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M7 19h34v22H7zM5 19l4-11h30l4 11" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/><path d="M5 19c0 3 2.2 5 5 5s5-2 5-5c0 3 2.2 5 5 5s5-2 5-5c0 3 2.2 5 5 5s5-2 5-5c0 3 2.2 5 5 5s5-2 5-5M18 41V30h12v11" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/></svg>'
  };
  function addStyle(){
    if(document.getElementById('sellb2-category-icon-style'))return;
    const s=document.createElement('style');s.id='sellb2-category-icon-style';
    s.textContent='.categories.large>button>i{display:grid;place-items:center}.categories.large>button>i svg{width:48px;height:48px;display:block;overflow:visible}';
    document.head.appendChild(s);
  }
  function apply(){
    addStyle();
    document.querySelectorAll('.categories.large > button').forEach(function(btn){
      const text=(btn.querySelector('span')?.textContent||'').trim().toLowerCase();
      const key=text==='properties'?'property':text==='vehicles'?'vehicle':text==='businesses'?'business':null;
      if(!key)return;
      const slot=btn.querySelector('i');
      if(slot && slot.dataset.sellb2Icon!==key){
        slot.innerHTML=ICONS[key];
        slot.dataset.sellb2Icon=key;
        slot.setAttribute('aria-label',text);
      }
    });
  }
  const observer=new MutationObserver(apply);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  apply();
})();
