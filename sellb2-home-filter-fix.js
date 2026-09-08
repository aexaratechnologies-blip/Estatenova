/* SELLB2 home/search filter navigation — robust SPA routing on touch + mouse. */
(function(){
  'use strict';
  let navigating=false;
  const selector='.homehero .searchbar button, .searchbar.compact button';

  function openFilters(e){
    const target=e && e.target;
    const button=target && target.closest ? target.closest(selector) : null;
    if(!button) return;
    if(e){e.preventDefault();e.stopImmediatePropagation();}
    if(navigating) return false;
    navigating=true;
    try{
      if(typeof window.setPath==='function'){
        window.setPath('/filters');
      }else{
        history.pushState({},'', '/filters');
        if(window.st) window.st.route='/filters';
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }catch(err){
      console.error('SELLB2 filter navigation failed:',err);
      try{history.pushState({},'', '/filters');window.dispatchEvent(new PopStateEvent('popstate'));}catch(_e){}
    }finally{
      setTimeout(function(){navigating=false},500);
    }
    return false;
  }

  window.__sellb2OpenFilters=openFilters;
  ['pointerdown','touchstart','click'].forEach(function(type){
    document.addEventListener(type,openFilters,true);
  });
})();
