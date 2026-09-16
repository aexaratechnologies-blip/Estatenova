/* SELLB2 — complete category navigation inside the menu drawer */
(function(){
  'use strict';
  const CATS=[
    ['cars','Cars','🚗'],['bikes','Bikes','🏍️'],['electronics','Electronics','📱'],['jobs','Jobs','💼'],['furniture','Furniture','🪑'],
    ['fashion','Fashion','👕'],['books','Books','📚'],['commercial','Commercial','🚚'],['realestate','Real Estate','🏠'],['business','Business','🏢']
  ];
  function go(id){
    if(typeof window.sellb2OpenCategory==='function'){window.sellb2OpenCategory(id);return;}
    const fallback={realestate:'/properties',business:'/businesses',cars:'/vehicles',bikes:'/vehicles',commercial:'/vehicles'};
    if(fallback[id]&&typeof window.setPath==='function')window.setPath(fallback[id]);
  }
  function install(){
    const menu=document.querySelector('.profilemenu');
    if(!menu)return;
    let box=menu.querySelector('[data-sellb2-menu-categories]');
    if(box)return;
    const old=[...menu.querySelectorAll('button')].filter(b=>/^(Properties|Vehicles|Businesses)$/i.test((b.textContent||'').trim()));
    if(old.length)old.forEach(b=>b.remove());
    box=document.createElement('section');
    box.setAttribute('data-sellb2-menu-categories','true');
    box.className='sellb2-menu-categories';
    box.innerHTML='<div class="sellb2-menu-cat-title">CATEGORIES</div>'+CATS.map(x=>'<button type="button" class="sellb2-menu-cat" data-cat="'+x[0]+'"><span class="sellb2-menu-cat-icon">'+x[2]+'</span><span>'+x[1]+'</span><b>›</b></button>').join('');
    const saved=[...menu.querySelectorAll('button')].find(b=>/saved listings/i.test(b.textContent||''));
    if(saved)menu.insertBefore(box,saved);else menu.appendChild(box);
    box.addEventListener('click',function(e){const b=e.target.closest('[data-cat]');if(!b)return;e.preventDefault();e.stopPropagation();go(b.dataset.cat);});
  }
  function css(){
    if(document.getElementById('sellb2-menu-category-style'))return;
    const s=document.createElement('style');s.id='sellb2-menu-category-style';
    s.textContent='.sellb2-menu-categories{margin:0 0 4px;border-top:1px solid var(--line,#e2e6ee);border-bottom:1px solid var(--line,#e2e6ee);padding:2px 0 8px}.sellb2-menu-cat-title{padding:12px 8px 7px;font-size:11px;letter-spacing:1.5px;font-weight:800;color:var(--muted,#778396)}.sellb2-menu-cat{width:100%!important;display:flex!important;align-items:center!important;gap:12px!important;padding:11px 8px!important;border:0!important;border-bottom:1px solid var(--line,#e2e6ee)!important;background:transparent!important;color:var(--text,#17243b)!important;text-align:left!important;font-size:15px!important;font-weight:650!important}.sellb2-menu-cat:last-child{border-bottom:0!important}.sellb2-menu-cat-icon{width:30px;height:30px;display:grid;place-items:center;font-size:22px;flex:0 0 30px}.sellb2-menu-cat b{margin-left:auto;font-size:21px;font-weight:500}.sellb2-menu-cat:active{background:rgba(23,59,128,.06)!important}@media(max-width:520px){.sellb2-menu-cat{padding:10px 8px!important;font-size:15px!important}}';
    document.head.appendChild(s);
  }
  function apply(){css();install();}
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
  apply();setInterval(apply,700);
})();
