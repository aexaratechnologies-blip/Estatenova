(function(){
  'use strict';
  function fix(){
    if(location.pathname.indexOf('/messages/')!==0)return;
    var page=document.querySelector('.chatpage');
    var composer=document.querySelector('.chatpage .composer');
    var body=document.querySelector('.chatpage .chatbody');
    if(!page||!composer)return;
    page.style.height='100dvh';
    page.style.minHeight='100dvh';
    page.style.paddingBottom='0';
    page.style.overflow='hidden';
    composer.style.position='fixed';
    composer.style.left='50%';
    composer.style.bottom='0';
    composer.style.transform='translateX(-50%)';
    composer.style.width='min(720px, 100%)';
    composer.style.zIndex='60';
    composer.style.boxSizing='border-box';
    composer.style.paddingBottom='calc(10px + env(safe-area-inset-bottom))';
    composer.style.display='flex';
    composer.style.visibility='visible';
    composer.style.opacity='1';
    if(body){
      body.style.paddingBottom='calc(82px + env(safe-area-inset-bottom))';
      body.style.minHeight='0';
    }
  }
  function boot(){fix();setTimeout(fix,100);setTimeout(fix,500);}
  boot();
  window.addEventListener('resize',fix);
  window.addEventListener('orientationchange',function(){setTimeout(fix,150)});
  window.addEventListener('popstate',function(){setTimeout(fix,150)});
  setInterval(fix,1000);
})();
