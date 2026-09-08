/* SELLB2 stable home search controls. Avoid MutationObserver feedback loops. */
(function(){
  'use strict';
  let timer=0;
  function runSearch(input){
    try{
      const value=String(input&&input.value||'').trim();
      if(window.st){window.st.locality=value;window.st.cat='all';window.st.type='all';}
      if(typeof window.setPath==='function') window.setPath('/properties');
      if(typeof window.load==='function') window.load().catch(function(e){console.error('SELLB2 search load:',e);});
    }catch(e){console.error('SELLB2 home search:',e);}
  }
  function bind(){
    if(location.pathname!=='/'&&location.pathname!=='/index.html') return;
    const app=document.getElementById('app'); if(!app) return;
    const input=app.querySelector('.homehero .searchbar input');
    const filter=app.querySelector('.homehero .searchbar button');
    const search=Array.from(app.querySelectorAll('.homehero .heroactions button')).find(function(b){return String(b.textContent||'').trim().toLowerCase()==='search';});
    if(input&&!input.dataset.homeSearchStable){input.dataset.homeSearchStable='1';input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();runSearch(input);}},false);}
    if(search&&!search.dataset.homeSearchStable){search.dataset.homeSearchStable='1';search.removeAttribute('onclick');search.addEventListener('click',function(e){e.preventDefault();runSearch(input);},false);}
    if(filter&&!filter.dataset.homeFilterStable){filter.dataset.homeFilterStable='1';filter.removeAttribute('onclick');filter.addEventListener('click',function(e){e.preventDefault();if(typeof window.setPath==='function')window.setPath('/filters');},false);}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(bind,0);}
  function boot(){bind();const app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});window.addEventListener('popstate',schedule);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,700)},{once:true});else setTimeout(boot,700);
})();
