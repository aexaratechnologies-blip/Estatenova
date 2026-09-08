/* SELLB2 filter navigation: use the actual SPA router, never reload the document. */
(function(){
  'use strict';
  let navigating=false;
  function openFilters(e){
    if(e){e.preventDefault();e.stopImmediatePropagation();}
    if(navigating)return false;
    navigating=true;
    try{
      if(typeof window.setPath==='function') window.setPath('/filters');
      else if(window.st&&typeof window.render==='function'){
        history.pushState({},'', '/filters');
        window.st.route='/filters';
        window.render();
      }else{
        history.pushState({},'', '/filters');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }finally{setTimeout(function(){navigating=false},500)}
    return false;
  }
  window.__sellb2OpenFilters=openFilters;
  document.addEventListener('pointerup',function(e){
    const b=e.target&&e.target.closest&&e.target.closest('.homehero .searchbar button, .searchbar.compact button');
    if(b)openFilters(e);
  },true);
  document.addEventListener('click',function(e){
    const b=e.target&&e.target.closest&&e.target.closest('.homehero .searchbar button, .searchbar.compact button');
    if(b)openFilters(e);
  },true);
})();
