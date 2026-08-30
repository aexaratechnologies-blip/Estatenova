'use strict';
(function(){
  const originalSetPath=window.setPath;
  window.setPath=function(p){originalSetPath(p);if(['/properties','/vehicles','/businesses'].includes(p))setTimeout(()=>window.load&&window.load(),0)};
  window.setPath=window.setPath;
  const oldProfileEdit=window.profileEdit;
  window.profileEdit=oldProfileEdit;
  window.fixSellB2Ready=true;
})();
