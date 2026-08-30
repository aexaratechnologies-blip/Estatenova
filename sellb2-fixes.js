'use strict';
(function(){
  const originalSetPath=window.setPath;
  if(typeof originalSetPath==='function' && !window.__sellb2PathPatched){
    window.__sellb2PathPatched=true;
    window.setPath=function(p){
      originalSetPath(p);
      if(['/properties','/vehicles','/businesses'].includes(p) && typeof window.load==='function')setTimeout(()=>window.load(),0);
    };
  }
  window.fixSellB2Ready=true;
})();
