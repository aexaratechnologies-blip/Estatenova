/* SELLB2 FILTER-ONLY REPAIR v14
   Only the actual filter control is intercepted.
   Never replaces load(), search, listings, or the router. */
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

  let navigating=false;
  let lastHandledAt=0;

  function openFilters(){
    const now=Date.now();
    if(navigating || now-lastHandledAt<500)return;
    lastHandledAt=now;
    const s=window.st;
    if(!s){console.error('SELLB2: app state is not ready');return;}
    saveFilterState();
    navigating=true;
    try{
      const go=typeof window.setPath==='function' ? window.setPath : null;
      if(go){
        Promise.resolve(go('/filters')).catch(function(err){
          console.error('SELLB2: filter navigation failed',err);
        }).finally(function(){
          setTimeout(function(){navigating=false;},0);
        });
        return;
      }
      history.pushState({},'', '/filters');
      s.route='/filters';
      if(typeof window.render==='function'){
        Promise.resolve(window.render()).catch(function(err){
          console.error('SELLB2: filter render failed',err);
        }).finally(function(){
          setTimeout(function(){navigating=false;},0);
        });
      }else{
        navigating=false;
      }
    }catch(err){
      navigating=false;
      console.error('SELLB2: filter navigation failed',err);
    }
  }

  function isFilterButton(target){
    if(!target || !target.closest)return false;
    const b=target.closest('button[onclick*="/filters"]');
    if(b)return true;
    const sb=target.closest('.searchbar button');
    return !!(sb && String(sb.textContent||'').trim()==='☷');
  }

  function handle(ev){
    if(!isFilterButton(ev.target))return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    openFilters();
  }

  function install(){
    if(window.__sellb2FilterOnlyRepairV14)return;
    window.__sellb2FilterOnlyRepairV14=true;
    window.__sellb2OpenFilters=openFilters;

    document.addEventListener('pointerup',handle,true);
    document.addEventListener('touchend',handle,true);
    document.addEventListener('click',handle,true);

    const style=document.createElement('style');
    style.textContent='\
      .homehero .searchbar button,.searchbar.compact button{\
        position:relative!important;z-index:30!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;\
      }\
    ';
    document.head.appendChild(style);
    console.info('SELLB2 filter-only repair v14 installed');
  }

  function wait(){
    if(window.st&&typeof window.render==='function')install();
    else setTimeout(wait,50);
  }
  wait();
})();
