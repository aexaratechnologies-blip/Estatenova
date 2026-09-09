/* SELLB2 FILTER-ONLY REPAIR v13
   Filter button only. Never replaces the listings loader or search logic. */
(function(){
  'use strict';

  function saveFilterState(){
    const s=window.st;
    if(!s)return;
    try{
      sessionStorage.setItem('sellb2_filter_state',JSON.stringify({
        cat:s.cat,type:s.type,state:s.state,district:s.district,city:s.city,
        locality:s.locality,min:s.min,max:s.max,furnishing:s.furnishing,
        parking:s.parking,possession:s.possession,facing:s.facing,
        condition:s.condition,year:s.year,wheels:s.wheels,registered:s.registered
      }));
    }catch(_){ }
  }

  function openFilters(){
    const s=window.st;
    if(!s){console.error('SELLB2: app state is not ready');return;}
    saveFilterState();
    try{
      history.pushState({},'', '/filters');
      s.route='/filters';
      if(typeof window.render==='function'){
        const result=window.render();
        if(result&&typeof result.catch==='function')result.catch(function(err){
          console.error('SELLB2: filter render failed',err);
        });
      }
    }catch(err){
      console.error('SELLB2: filter navigation failed',err);
    }
  }

  function install(){
    if(window.__sellb2FilterOnlyRepairV13)return;
    window.__sellb2FilterOnlyRepairV13=true;
    window.__sellb2OpenFilters=openFilters;

    function isFilterButton(target){
      return !!(target&&target.closest&&target.closest('.homehero .searchbar button, .searchbar.compact button'));
    }

    function handle(ev){
      if(!isFilterButton(ev.target))return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      openFilters();
    }

    /* Capture touch/pointer first on Android, then click as a fallback. */
    document.addEventListener('pointerup',handle,true);
    document.addEventListener('touchend',handle,true);
    document.addEventListener('click',handle,true);

    const style=document.createElement('style');
    style.textContent='\
      .homehero .searchbar{position:relative!important;z-index:20!important;pointer-events:auto!important;}\
      .homehero .searchbar button,.searchbar.compact button{position:relative!important;z-index:30!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;}\
    ';
    document.head.appendChild(style);
    console.info('SELLB2 filter-only repair v13 installed');
  }

  function wait(){
    if(window.st&&typeof window.render==='function')install();
    else setTimeout(wait,50);
  }
  wait();
})();
