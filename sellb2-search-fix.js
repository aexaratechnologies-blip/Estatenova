/* SELLB2 home search controls - isolated event wiring, no observers, no render loops. */
(function(){
  'use strict';
  let wiredRoot=null;
  let lastInputValue='';

  function go(path){
    if(typeof window.setPath==='function'){
      window.setPath(path);
    }else{
      history.pushState({},'',path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  function search(){
    try{
      const input=document.querySelector('.homehero .searchbar input');
      const value=String(input?.value||'').trim();
      if(window.st){
        window.st.locality=value;
        window.st.cat='all';
        window.st.type='all';
      }
      go('/properties');
      if(typeof window.load==='function'){
        const p=window.load();
        if(p&&typeof p.catch==='function')p.catch(function(e){console.error('SELLB2 search load:',e);});
      }
    }catch(e){console.error('SELLB2 search control:',e);}
  }

  function filters(){
    try{
      go('/filters');
    }catch(e){console.error('SELLB2 filter control:',e);}
  }

  function wire(){
    if(location.pathname!=='/' && location.pathname!=='/index.html'){
      wiredRoot=null;
      return;
    }
    const root=document.getElementById('app');
    if(!root || !window.st || root===wiredRoot)return;

    const input=root.querySelector('.homehero .searchbar input');
    const searchButton=Array.from(root.querySelectorAll('.homehero .heroactions button')).find(function(b){
      return String(b.textContent||'').trim().toLowerCase()==='search';
    });
    const filterButton=root.querySelector('.homehero .searchbar button');

    if(!input||!searchButton||!filterButton)return;

    input.onkeydown=function(e){
      if(e.key==='Enter'){
        e.preventDefault();
        search();
      }
    };
    searchButton.onclick=function(e){
      e.preventDefault();
      search();
    };
    filterButton.onclick=function(e){
      e.preventDefault();
      filters();
    };

    wiredRoot=root;
  }

  function start(){
    wire();
    setTimeout(wire,300);
    setTimeout(wire,1000);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }

  window.addEventListener('popstate',function(){setTimeout(wire,50);});
})();
