(function(){'use strict';
  function install(){
    if(typeof window.setPath!=='function'||typeof window.render!=='function'||typeof window.load!=='function')return setTimeout(install,50);
    if(window.__sellb2RouteFixInstalled)return;
    window.__sellb2RouteFixInstalled=true;
    const originalSetPath=window.setPath;
    window.setPath=function(p){
      if(p==='/'){
        location.href='/';
        return;
      }
      originalSetPath(p);
      if(p==='/properties'||p==='/vehicles'||p==='/businesses')window.load();
    };
    window.__sellb2OriginalSetPath=originalSetPath;
  }
  install();
})();
