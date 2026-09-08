/* SELLB2 filter navigation: bypass SPA event conflicts with a real browser navigation. */
(function(){
  'use strict';
  let navigating = false;

  function isFilterButton(target){
    return !!(target && target.closest && target.closest('.homehero .searchbar button, .searchbar.compact button'));
  }

  function openFilters(){
    if(navigating) return;
    navigating = true;
    window.location.assign('/filters');
  }

  document.addEventListener('pointerdown', function(e){
    if(!isFilterButton(e.target)) return;
    openFilters();
  }, true);

  document.addEventListener('click', function(e){
    if(!isFilterButton(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openFilters();
  }, true);
})();
