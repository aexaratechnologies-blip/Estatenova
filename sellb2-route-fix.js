(function(){
  'use strict';
  function install(){
    if(typeof window.render!=='function'||typeof window.load!=='function')return setTimeout(install,50);
    if(window.__sellb2RouteFixInstalled)return;
    window.__sellb2RouteFixInstalled=true;

    function normalize(p){
      const s=String(p||'/');
      if(/^\/property\/[^/]+$/.test(s)) return '/listing/'+s.split('/')[2];
      return s||'/';
    }
    function syncActive(){
      const p=location.pathname.replace(/\/$/,'')||'/';
      document.querySelectorAll('.bottomnav button').forEach(b=>b.classList.remove('on'));
      const target=p==='/vehicles'?'/vehicles':p==='/businesses'?'/businesses':p==='/saved'?'/saved':p==='/messages'||p.startsWith('/messages/')?'/messages':p==='/profile'||p==='/profile-edit'||p==='/post'?'/profile':p==='/properties'||p.startsWith('/listing/')?'/properties':'/';
      document.querySelectorAll('.bottomnav button').forEach(b=>{
        const text=b.querySelector('span')?.textContent?.trim().toLowerCase();
        if((target==='/vehicles'&&text==='vehicles')||(target==='/businesses'&&text==='businesses')||(target==='/saved'&&text==='saved')||(target==='/messages'&&text==='messages')||(target==='/profile'&&text==='profile')||(target==='/properties'&&text==='properties')||(target==='/'&&text==='home'))b.classList.add('on');
      });
    }
    async function go(p){
      const next=normalize(p);
      history.pushState({},'',next);
      st.route=location.pathname;
      await Promise.resolve(window.render());
      syncActive();
      if(next==='/properties'||next==='/vehicles'||next==='/businesses')window.load();
    }
    window.setPath=go;
    window.__sellb2OriginalSetPath=go;
    window.addEventListener('popstate',function(){
      st.route=location.pathname;
      window.render();
      syncActive();
      if(st.route==='/properties'||st.route==='/vehicles'||st.route==='/businesses')window.load();
    });
    const observer=new MutationObserver(function(){clearTimeout(observer._t);observer._t=setTimeout(syncActive,20)});
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(syncActive,100);
  }
  install();
})();
