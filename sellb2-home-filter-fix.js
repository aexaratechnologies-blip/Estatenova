/* SELLB2 FILTER-ONLY REPAIR v15
   The app state is intentionally kept in a lexical const, not window.st.
   Therefore navigation must call the app's global setPath(), which closes over the real state. */
(function(){
  'use strict';

  let busy=false;
  let lastHandledAt=0;

  function openFilters(){
    const now=Date.now();
    if(busy || now-lastHandledAt<500)return;
    lastHandledAt=now;
    const go=window.setPath;
    if(typeof go!=='function'){
      console.error('SELLB2: setPath is not available yet');
      return;
    }
    busy=true;
    try{
      go('/filters');
    }catch(err){
      console.error('SELLB2: filter navigation failed',err);
    }
    setTimeout(function(){busy=false;},250);
  }

  function isFilterButton(target){
    if(!target || !target.closest)return false;
    const exact=target.closest('button[onclick*="/filters"]');
    if(exact)return true;
    const sb=target.closest('.searchbar button');
    return !!(sb && String(sb.textContent||'').trim()==='☷');
  }

  function handle(ev){
    if(!isFilterButton(ev.target))return;
    ev.preventDefault();
    ev.stopPropagation();
    openFilters();
  }

  function install(){
    if(window.__sellb2FilterOnlyRepairV15)return;
    window.__sellb2FilterOnlyRepairV15=true;
    window.__sellb2OpenFilters=openFilters;
    document.addEventListener('click',handle,true);
    document.addEventListener('pointerup',handle,true);
    const style=document.createElement('style');
    style.textContent='.homehero .searchbar button,.searchbar.compact button{position:relative!important;z-index:30!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important}';
    document.head.appendChild(style);
    console.info('SELLB2 filter-only repair v15 installed');
  }

  function wait(){
    if(typeof window.setPath==='function')install();
    else setTimeout(wait,50);
  }
  wait();
})();
