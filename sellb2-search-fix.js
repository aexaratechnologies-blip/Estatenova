/* SELLB2 home search fix: make the home Search action deterministic after runtime-injected rendering. */
(function(){
  'use strict';
  function apply(){
    if(location.pathname!=='/' && location.pathname!=='/index.html')return;
    const app=document.getElementById('app');
    if(!app || !window.st)return;
    const input=app.querySelector('.homehero .searchbar input');
    const button=Array.from(app.querySelectorAll('.homehero .heroactions button')).find(function(b){
      return String(b.textContent||'').trim().toLowerCase()==='search';
    });
    if(input && !input.dataset.sellb2SearchBound){
      input.dataset.sellb2SearchBound='1';
      input.addEventListener('keydown',function(e){
        if(e.key!=='Enter')return;
        e.preventDefault();
        e.stopPropagation();
        run(input);
      },true);
    }
    if(button && !button.dataset.sellb2SearchBound){
      button.dataset.sellb2SearchBound='1';
      button.removeAttribute('onclick');
      button.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        run(input);
      },true);
    }
  }
  function run(input){
    try{
      if(window.st){
        window.st.locality=String(input?.value||'').trim();
        window.st.cat='all';
        window.st.type='all';
      }
      if(typeof window.setPath==='function')window.setPath('/properties');
      if(typeof window.load==='function'){
        const result=window.load();
        if(result && typeof result.catch==='function')result.catch(function(err){console.error('SELLB2 search:',err);});
      }
    }catch(err){console.error('SELLB2 home search:',err)}
  }
  const observer=new MutationObserver(apply);
  function boot(){
    apply();
    const app=document.getElementById('app');
    if(app)observer.observe(app,{childList:true,subtree:true});
    window.addEventListener('popstate',function(){setTimeout(apply,0)});
    setInterval(apply,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,500)},{once:true});
  else setTimeout(boot,500);
})();
