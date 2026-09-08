/* SELLB2 home filter button: minimal delegated handler, no observer/interval. */
(function(){
  'use strict';
  function go(e){
    const b=e.target&&e.target.closest&&e.target.closest('.homehero .searchbar button');
    if(!b)return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof window.setPath==='function') window.setPath('/filters');
    else { history.pushState({},'', '/filters'); window.dispatchEvent(new PopStateEvent('popstate')); }
  }
  document.addEventListener('click',go,true);
})();
