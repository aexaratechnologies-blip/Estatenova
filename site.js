/* SELLB2 site helpers */
(function(){
  'use strict';
  const KEY='sellb2_theme';
  function apply(t){
    document.documentElement.dataset.theme=t;
    localStorage.setItem(KEY,t);
    const b=document.querySelector('.sellb2-theme');
    if(b){b.textContent=t==='light'?'Dark mode':'Light mode';b.setAttribute('aria-label',t==='light'?'Enable dark mode':'Enable light mode')}
  }
  function init(){
    const saved=localStorage.getItem(KEY);
    const t=saved||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');
    apply(t);
    const old=document.querySelector('.en-theme');
    if(old)old.remove();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
