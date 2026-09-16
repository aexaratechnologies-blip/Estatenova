/* SELLB2 — full-color category icons for marketplace category pages */
(function(){
'use strict';
function apply(){
  if(!window.SELLB2_CATEGORY_ICONS)return;
  document.querySelectorAll('.sellb2-ref-category-strip .sellb2-ref-cat').forEach(function(btn){
    var label=(btn.textContent||'').trim().toLowerCase();
    var key={'cars':'cars','bikes':'bikes','electronics':'electronics','jobs':'jobs','furniture':'furniture','fashion':'fashion','books':'books','commercial':'commercial','real estate':'realestate','business':'business'}[label];
    if(!key||!window.SELLB2_CATEGORY_ICONS[key])return;
    var slot=btn.querySelector('.ico');
    if(slot&&slot.dataset.sellb2PageIcon!==key){slot.innerHTML=window.SELLB2_CATEGORY_ICONS[key];slot.dataset.sellb2PageIcon=key;}
  });
  var style=document.getElementById('sellb2-category-page-icon-style');
  if(!style){style=document.createElement('style');style.id='sellb2-category-page-icon-style';style.textContent='.sellb2-ref-category-strip .sellb2-ref-cat .ico{color:initial!important}.sellb2-ref-category-strip .sellb2-ref-cat .ico svg{width:42px!important;height:42px!important;display:block!important}.sellb2-ref-category-strip .sellb2-ref-cat .ico svg path,.sellb2-ref-category-strip .sellb2-ref-cat .ico svg rect,.sellb2-ref-category-strip .sellb2-ref-cat .ico svg circle{vector-effect:non-scaling-stroke}@media(max-width:520px){.sellb2-ref-category-strip .sellb2-ref-cat .ico svg{width:39px!important;height:39px!important}}';document.head.appendChild(style)}
}
new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});apply();setInterval(apply,500);
})();
