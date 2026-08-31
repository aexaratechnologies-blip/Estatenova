(function(){'use strict';
  function install(){
    if(typeof window.setPath!=='function'||typeof window.render!=='function'||typeof window.load!=='function'||!window.st)return setTimeout(install,50);
    if(window.__sellb2RouteFixInstalled)return;
    window.__sellb2RouteFixInstalled=true;
    const originalSetPath=window.setPath;
    window.setPath=function(p){
      if(p==='/vehicles') window.st.cat='vehicle';
      else if(p==='/businesses') window.st.cat='business';
      else if(p==='/properties') window.st.cat='property';
      originalSetPath(p);
      if(p==='/'||p==='/properties'||p==='/vehicles'||p==='/businesses') window.load();
    };
    window.__sellb2OriginalSetPath=originalSetPath;
  }
  install();
})();
