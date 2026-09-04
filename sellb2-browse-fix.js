(function(){
  'use strict';
  function goBrowse(){
    if(!window.st)return;
    window.st.cat='all';
    window.st.type='all';
    var go=window.__sellb2Navigate||window.setPath;
    if(typeof go!=='function')return;
    go('/properties');
    setTimeout(function(){if(typeof window.load==='function')window.load()},0);
  }
  document.addEventListener('click',function(e){
    var el=e.target&&e.target.closest?e.target.closest('button,a'):null;
    if(!el)return;
    var text=(el.textContent||'').trim().toLowerCase().replace(/\s+/g,' ');
    if(text==='browse listing'||text==='browse listings'||text==='browse listing ›'||text==='browse listings ›'){
      e.preventDefault();
      e.stopImmediatePropagation();
      goBrowse();
    }
  },true);
})();
