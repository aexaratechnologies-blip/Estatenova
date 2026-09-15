/* SELLB2: lock seller contact details and show only the upgrade CTA. */
(function(){
  'use strict';
  const emailRe=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;
  const phoneRe=/(?:\+?91[\s.-]?)?[6-9]\d(?:[\s.-]?\d){8}/g;

  function listingId(){
    const m=location.pathname.match(/^\/listing\/([0-9a-f-]{36})\/?$/i);
    return m?m[1]:null;
  }

  function cleanContact(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(function(n){
      const p=n.parentElement;
      if(!p||p.closest('script,style,noscript'))return;
      const t=n.nodeValue||'';
      if(emailRe.test(t)||phoneRe.test(t)){
        emailRe.lastIndex=0;phoneRe.lastIndex=0;
        n.nodeValue=t.replace(emailRe,'Seller email hidden').replace(phoneRe,'Seller phone hidden');
      }
      emailRe.lastIndex=0;phoneRe.lastIndex=0;
    });
    root.querySelectorAll('a[href^="mailto:"],a[href^="tel:"]').forEach(function(a){
      a.removeAttribute('href');
      a.setAttribute('aria-disabled','true');
      a.classList.add('sellb2-contact-locked');
      a.textContent='Seller contact hidden';
    });
  }

  function addStyle(){
    if(document.getElementById('sellb2-contact-lock-style'))return;
    const s=document.createElement('style');
    s.id='sellb2-contact-lock-style';
    s.textContent='.sellb2-contact-gate{margin:16px 0;padding:0;border:0;background:transparent;box-shadow:none}.sellb2-contact-gate button{width:100%;border:0;border-radius:12px;padding:14px 16px;font-weight:800;cursor:pointer;background:#111;color:#fff;font:inherit}.sellb2-contact-locked{pointer-events:none;opacity:.7}';
    document.head.appendChild(s);
  }

  function gate(){
    const id=listingId();
    if(!id||document.querySelector('[data-sellb2-contact-gate]'))return;
    const main=document.querySelector('main.screen');
    if(!main)return;
    addStyle();
    const box=document.createElement('section');
    box.className='sellb2-contact-gate';
    box.setAttribute('data-sellb2-contact-gate','true');
    box.innerHTML='<button type="button" aria-label="Upgrade to view email and number">Upgrade to view email and number</button>';
    box.querySelector('button').onclick=function(){location.assign('/upgrade/');};
    main.appendChild(box);
  }

  function run(){
    if(!listingId())return;
    const main=document.querySelector('main.screen');
    if(main)cleanContact(main);
    gate();
  }

  const obs=new MutationObserver(run);
  function start(){obs.observe(document.documentElement,{childList:true,subtree:true});run();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.addEventListener('popstate',function(){setTimeout(run,0);});
})();
