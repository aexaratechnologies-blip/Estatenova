/* SELLB2 home filter control: robust pointer/touch navigation. */
(function(){
  'use strict';

  function navigateToFilters(e){
    const target = e && e.target;
    const button = target && target.closest ? target.closest('.homehero .searchbar button') : null;
    if(!button || !document.contains(button)) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    try{
      if(typeof window.setPath === 'function'){
        window.setPath('/filters');
      }else{
        history.pushState({}, '', '/filters');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }catch(err){
      console.error('SELLB2 filter navigation:', err);
      try{
        history.pushState({}, '', '/filters');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }catch(fallbackErr){
        console.error('SELLB2 filter fallback:', fallbackErr);
      }
    }
  }

  function hardenButton(){
    document.querySelectorAll('.homehero .searchbar button').forEach(function(button){
      button.style.pointerEvents = 'auto';
      button.style.position = 'relative';
      button.style.zIndex = '30';
      button.style.touchAction = 'manipulation';
      button.setAttribute('type','button');
      button.setAttribute('aria-label','Open filters');
    });
  }

  document.addEventListener('click', navigateToFilters, true);
  document.addEventListener('pointerup', function(e){
    if(e.pointerType === 'touch') navigateToFilters(e);
  }, true);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', hardenButton, {once:true});
  }else{
    hardenButton();
  }
})();
