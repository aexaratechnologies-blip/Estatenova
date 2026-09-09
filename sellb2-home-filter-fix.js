/* SELLB2 FILTER-ONLY REPAIR v12
   IMPORTANT: this file NEVER replaces the application's listings loader.
   It only owns the home filter button and routes to the existing /filters screen. */
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
      if(typeof window.setPath==='function'){
        window.setPath('/filters');
        return;
      }
      if(typeof window.__sellb2Navigate==='function'){
        window.__sellb2Navigate('/filters');
        return;
      }
      history.pushState({},'', '/filters');
      s.route='/filters';
      if(typeof window.render==='function')window.render();
    }catch(err){
      console.error('SELLB2: filter navigation failed',err);
    }
  }

  function install(){
    if(window.__sellb2FilterOnlyRepairV12)return;
    window.__sellb2FilterOnlyRepairV12=true;
    window.__sellb2OpenFilters=openFilters;

    /* Capture only the filter button. Search, listings, load(), applyFilters(),
       resetFilters(), and every other application function remain untouched. */
    document.addEventListener('click',function(ev){
      const target=ev.target;
      const button=target&&target.closest?target.closest('.homehero .searchbar button, .searchbar.compact button'):null;
      if(!button)return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      openFilters();
    },true);

    const style=document.createElement('style');
    style.textContent='\
      .homehero .searchbar{position:relative!important;z-index:20!important;pointer-events:auto!important;}\
      .homehero .searchbar button,.searchbar.compact button{position:relative!important;z-index:30!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;}\
    ';
    document.head.appendChild(style);
    console.info('SELLB2 filter-only repair v12 installed');
  }

  function wait(){
    if(window.st&&typeof window.render==='function')install();
    else setTimeout(wait,50);
  }
  wait();
})();
