/* SELLB2 filter navigation: keep SPA navigation and bypass conflicting handlers. */
(function(){
  'use strict';
  let navigating = false;

  function isFilterButton(target){
    return !!(target && target.closest && target.closest('.homehero .searchbar button, .searchbar.compact button'));
  }

  function openFilters(){
    if(navigating) return;
    navigating = true;
    if(typeof window.setPath === 'function'){
      window.setPath('/filters');
    }else{
      history.pushState({},'', '/filters');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setTimeout(function(){ navigating = false; }, 500);
  }

  document.addEventListener('pointerdown', function(e){
    if(!isFilterButton(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openFilters();
  }, true);

  document.addEventListener('click', function(e){
    if(!isFilterButton(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
})();
