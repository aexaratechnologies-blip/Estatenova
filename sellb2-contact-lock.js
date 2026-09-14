/* SELLB2 premium contact gate
 * Public listing pages never expose seller phone/email.
 * Contact details are revealed only through the server-side get_seller_contact RPC
 * after an active contact_view entitlement is verified.
 */
(function(){
  'use strict';
  const emailRe=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;
  const phoneRe=/(?:\+?91[\s.-]?)?[6-9]\d(?:[\s.-]?\d){8}/g;
  let busy=false;

  const listingId=()=>{
    const m=location.pathname.match(/^\/listing\/([0-9a-f-]{36})\/?$/i);
    return m?m[1]:null;
  };
  const cleanContact=(root)=>{
    if(!root||busy)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      const p=n.parentElement;
      if(!p||p.closest('script,style,noscript'))return;
      const t=n.nodeValue||'';
      if(emailRe.test(t)||phoneRe.test(t)){
        emailRe.lastIndex=0; phoneRe.lastIndex=0;
        n.nodeValue=t.replace(emailRe,'Seller email hidden').replace(phoneRe,'Seller phone hidden');
      }
      emailRe.lastIndex=0; phoneRe.lastIndex=0;
    });
    root.querySelectorAll('a[href^="mailto:"],a[href^="tel:"]').forEach(a=>{
      a.removeAttribute('href');
      a.setAttribute('aria-disabled','true');
      a.classList.add('sellb2-contact-locked');
      a.textContent='Seller contact hidden';
    });
  };
  const style=()=>{
    if(document.getElementById('sellb2-contact-lock-style'))return;
    const s=document.createElement('style');s.id='sellb2-contact-lock-style';
    s.textContent='.sellb2-contact-gate{margin:16px 0;padding:18px;border:1px solid #dfe5ea;border-radius:16px;background:#fff;color:#111827;box-shadow:0 8px 24px rgba(0,0,0,.05)}.sellb2-contact-gate h3{margin:0 0 6px;color:#111827!important;font-weight:800}.sellb2-contact-gate p{margin:0 0 12px;color:#475467!important;line-height:1.45}.sellb2-contact-gate button{width:100%;border:0;border-radius:12px;padding:13px 16px;font-weight:700;cursor:pointer;background:#111;color:#fff}.sellb2-contact-gate .result{color:#111827!important;line-height:1.5}.sellb2-contact-gate .result b{color:#111827!important}.sellb2-contact-gate .result span{color:#475467!important}.sellb2-contact-gate .result.ok{margin-top:10px;padding:12px;border-radius:10px;background:#f3faf5;color:#111827!important}.sellb2-contact-locked{pointer-events:none;opacity:.7}.sellb2-contact-gate .result button{color:#fff!important}';
    document.head.appendChild(s);
  };
  const gate=()=>{
    const id=listingId();
    if(!id||document.querySelector('[data-sellb2-contact-gate]'))return;
    const main=document.querySelector('main.screen');
    if(!main)return;
    style();
    const box=document.createElement('section');box.className='sellb2-contact-gate';box.setAttribute('data-sellb2-contact-gate','true');
    box.innerHTML='<h3>Seller contact is premium</h3><p>Seller phone number and email are hidden for public viewers. ₹49 gives 30 days of contact viewing.</p><button type="button">View seller number & email</button><div class="result" hidden></div>';
    main.appendChild(box);
    const btn=box.querySelector('button'),result=box.querySelector('.result');
    btn.onclick=async()=>{
      btn.disabled=true;btn.textContent='Checking access…';
      try{
        const db=window.db;
        if(!db){throw new Error('Database client unavailable');}
        const u=await db.auth.getUser();
        if(!u.data?.user){location.assign('/auth');return;}
        const r=await db.rpc('get_seller_contact',{p_listing_id:id});
        if(r.error)throw r.error;
        const c=r.data?.[0];
        if(!c){
          result.hidden=false;result.innerHTML='<b>Premium contact access required.</b><br><span>Upgrade for ₹49 to view this seller\'s phone and email for 30 days.</span><br><button type="button" style="margin-top:10px" id="sellb2-upgrade-now">Upgrade / Top-up</button>';
          const up=result.querySelector('#sellb2-upgrade-now');if(up)up.onclick=()=>location.assign('/upgrade/');
          btn.disabled=false;btn.textContent='View seller number & email';return;
        }
        result.hidden=false;result.className='result ok';
        result.innerHTML='<b>Seller contact</b><br>'+ (c.phone?('Phone: '+String(c.phone).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x])))+'<br>':'') + (c.email?('Email: '+String(c.email).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))):'');
        btn.remove();
      }catch(e){
        result.hidden=false;result.innerHTML='Contact access could not be verified right now. Please try again.';
        btn.disabled=false;btn.textContent='View seller number & email';
      }
    };
  };
  const run=()=>{
    if(!listingId())return;
    const main=document.querySelector('main.screen');
    if(main)cleanContact(main);
    gate();
  };
  const obs=new MutationObserver(()=>{if(!busy)run()});
  function start(){obs.observe(document.documentElement,{childList:true,subtree:true});run();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.addEventListener('popstate',()=>setTimeout(run,0));
})();
