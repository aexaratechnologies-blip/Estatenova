/* SELLB2 Upgrade entry point */
(function(){'use strict';
  function add(){
    if(location.pathname!=='/profile') return;
    const menu=document.querySelector('.profilemenu'); if(!menu||menu.querySelector('[data-sellb2-upgrade]')) return;
    const b=document.createElement('button'); b.type='button'; b.setAttribute('data-sellb2-upgrade','true');
    b.innerHTML='<span>Upgrade / Top-up</span><b>›</b>';
    b.onclick=function(){location.assign('/upgrade/')};
    const legal=[...menu.querySelectorAll('button')].find(x=>/privacy policy/i.test(x.textContent));
    if(legal) menu.insertBefore(b,legal); else menu.appendChild(b);
  }
  const o=new MutationObserver(add); o.observe(document.documentElement,{childList:true,subtree:true}); add();
})();
