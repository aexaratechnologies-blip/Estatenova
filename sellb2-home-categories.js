/* SELLB2 home category grid — marketplace-style 12 category navigation */
(function(){
  'use strict';
  const CATS=[
    {cat:'property',type:'Apartment',label:'Homes & Apartments',sub:'Residential',icon:'<path d="M6 22 24 7l18 15v19H6Z"/><path d="M17 41V27h14v14M20 17h8"/>'},
    {cat:'property',type:'Villa',label:'Villas & Houses',sub:'Residential',icon:'<path d="m5 23 19-16 19 16v18H5Z"/><path d="M17 41V27h14v14M21 18h6"/>'},
    {cat:'property',type:'Land',label:'Land & Plots',sub:'Property',icon:'<path d="M6 37 15 13l12 6 7-9 8 27H6Z"/><path d="M9 37h30M24 22v15"/>'},
    {cat:'property',type:'Commercial Property',label:'Commercial Property',sub:'Shops & Offices',icon:'<path d="M6 18h36v23H6Z"/><path d="M4 18 9 7h30l5 11M6 18c0 3 2 5 5 5s5-2 5-5c0 3 2 5 5 5s5-2 5-5c0 3 2 5 5 5s5-2 5-5M18 41V29h12v12"/>'},
    {cat:'vehicle',type:'Truck',label:'Trucks & Heavy Vehicles',sub:'Commercial Vehicles',icon:'<path d="M4 13h25v20H4Z"/><path d="M29 20h7l7 7v6H29Z"/><circle cx="12" cy="34" r="5"/><circle cx="35" cy="34" r="5"/><path d="M8 18h13"/>'},
    {cat:'vehicle',type:'Car',label:'Cars & Personal Vehicles',sub:'Cars',icon:'<path d="M7 31 11 19h24l6 12v7H7Z"/><path d="m13 19 3-7h16l4 7M12 31h24"/><circle cx="14" cy="38" r="4"/><circle cx="34" cy="38" r="4"/>'},
    {cat:'vehicle',type:'JCB / Excavator',label:'Construction Vehicles',sub:'JCB & Equipment',icon:'<path d="M7 36h24M12 36V20h12v16M24 20l7-8 6 4-8 9M31 37h8"/><circle cx="17" cy="37" r="5"/><circle cx="35" cy="37" r="4"/>'},
    {cat:'vehicle',type:'Other Vehicle',label:'Other Vehicles',sub:'Buses, Vans & More',icon:'<path d="M7 12h29a4 4 0 0 1 4 4v20H7Z"/><path d="M12 18h22M12 25h7M23 25h7"/><circle cx="14" cy="37" r="4"/><circle cx="34" cy="37" r="4"/>'},
    {cat:'business',type:'Company',label:'Companies for Sale',sub:'Businesses',icon:'<path d="M7 16h34v25H7Z"/><path d="M12 16V9h24v7M14 23h5M29 23h5M14 31h5M29 31h5M20 41V34h8v7"/>'},
    {cat:'business',type:'Shop / Retail',label:'Shops & Retail',sub:'Businesses',icon:'<path d="M7 19h34v22H7Z"/><path d="M5 19 9 8h30l4 11M5 19c0 3 2 5 5 5s5-2 5-5c0 3 2 5 5 5s5-2 5-5c0 3 2 5 5 5s5-2 5-5c0 3 2 5 5 5s5-2 5-5M18 41V30h12v11"/>'},
    {cat:'business',type:'Hotel',label:'Hotels & Restaurants',sub:'Hospitality',icon:'<path d="M7 19h34v22H7Z"/><path d="M11 19v-7h10v7M27 19v-7h10v7M12 26h24M18 26v15M30 26v15"/>'},
    {cat:'business',type:'Manufacturing',label:'Industrial & Manufacturing',sub:'Businesses',icon:'<path d="M6 40V22l10 6V18l10 6V13l16 9v18Z"/><path d="M12 34h5M23 34h5M34 34h5"/>'}
  ];
  function svg(body){return '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">'+body+'</g></svg>'}
  function render(){
    const section=[...document.querySelectorAll('.section')].find(s=>/Browse categories/i.test(s.querySelector('h2')?.textContent||''));
    if(!section)return;
    const grid=section.querySelector('.categories.large');
    if(!grid)return;
    if(grid.dataset.sellb2HomeCategories==='12')return;
    grid.innerHTML=CATS.map(x=>`<button type="button" class="sellb2-home-cat" data-cat="${x.cat}" data-type="${x.type.replace(/"/g,'&quot;')}" aria-label="${x.label}"><i>${svg(x.icon)}</i><span>${x.label}</span><small>${x.sub}</small></button>`).join('');
    grid.classList.add('sellb2-home-category-grid');
    grid.dataset.sellb2HomeCategories='12';
    grid.querySelectorAll('.sellb2-home-cat').forEach(btn=>btn.addEventListener('click',function(){
      const cat=this.dataset.cat,type=this.dataset.type;
      const path=cat==='property'?'/properties':cat==='vehicle'?'/vehicles':'/businesses';
      if(typeof window.setPath==='function')window.setPath(path);else location.assign(path);
      setTimeout(function(){
        const chips=[...document.querySelectorAll('.chips button')];
        const match=chips.find(function(b){return b.textContent.trim().toLowerCase()===type.trim().toLowerCase()});
        if(match)match.click();
      },40);
    }));
  }
  function style(){
    if(document.getElementById('sellb2-home-category-style'))return;
    const s=document.createElement('style');s.id='sellb2-home-category-style';s.textContent=`
      .sellb2-home-category-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px 12px;align-items:start}
      .sellb2-home-category-grid .sellb2-home-cat{border:0!important;background:transparent!important;padding:0!important;min-width:0;display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center!important;cursor:pointer!important;color:inherit}
      .sellb2-home-category-grid .sellb2-home-cat i{width:100%;aspect-ratio:1/0.82;max-height:128px;border-radius:22px;display:grid!important;place-items:center!important;background:linear-gradient(145deg,#edf2ff,#dce7ff);box-shadow:0 7px 18px rgba(24,49,99,.10);color:#173b80;font-style:normal;transition:transform .15s ease,box-shadow .15s ease}
      .sellb2-home-category-grid .sellb2-home-cat:active i{transform:scale(.97)}
      .sellb2-home-category-grid .sellb2-home-cat i svg{width:52px;height:52px;display:block}
      .sellb2-home-category-grid .sellb2-home-cat span{font-size:14px!important;font-weight:700!important;line-height:1.22!important;margin-top:9px!important;color:#18243a!important;display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .sellb2-home-category-grid .sellb2-home-cat small{font-size:11px!important;line-height:1.2!important;margin-top:3px!important;color:#7b8799!important;display:block!important}
      @media(max-width:520px){.sellb2-home-category-grid{gap:15px 9px}.sellb2-home-category-grid .sellb2-home-cat i{border-radius:19px}.sellb2-home-category-grid .sellb2-home-cat i svg{width:44px;height:44px}.sellb2-home-category-grid .sellb2-home-cat span{font-size:12.5px!important}.sellb2-home-category-grid .sellb2-home-cat small{font-size:10px!important}}
    `;document.head.appendChild(s);
  }
  style();
  const observer=new MutationObserver(function(){style();render()});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  render();
})();
