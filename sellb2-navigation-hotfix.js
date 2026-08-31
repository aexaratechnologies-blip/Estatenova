(function(){'use strict';
if(window.__sellb2NavHotfix)return;window.__sellb2NavHotfix=true;
function state(){try{return eval('st')}catch(e){return null}}
function go(path,cat){const s=state();if(s){s.cat=cat||'all';s.type='all';s.locality='';}history.pushState({sellb2Nav:true},'',path);if(typeof window.render==='function')window.render();if(cat&&cat!=='all'&&typeof window.load==='function')Promise.resolve(window.load()).catch(console.error)}
function click(e){const el=e.target.closest('button');if(!el)return;
  if(el.closest('.bottomnav')){const t=(el.textContent||'').toLowerCase();if(t.includes('home')){e.preventDefault();e.stopImmediatePropagation();go('/','all');return}if(t.includes('properties')){e.preventDefault();e.stopImmediatePropagation();go('/properties','property');return}if(t.includes('saved')){e.preventDefault();e.stopImmediatePropagation();go('/saved','all');return}if(t.includes('messages')){e.preventDefault();e.stopImmediatePropagation();go('/messages','all');return}if(t.includes('profile')){e.preventDefault();e.stopImmediatePropagation();go('/profile','all');return}}
  const tabs=el.closest('.cat-tabs');if(tabs){const t=(el.textContent||'').trim().toLowerCase();if(t==='everything'){e.preventDefault();e.stopImmediatePropagation();go('/properties','all');return}if(t==='properties'){e.preventDefault();e.stopImmediatePropagation();go('/properties','property');return}if(t==='vehicles'){e.preventDefault();e.stopImmediatePropagation();go('/vehicles','vehicle');return}if(t.startsWith('busi')){e.preventDefault();e.stopImmediatePropagation();go('/businesses','business');return}}
  const cardCat=el.closest('.categories.large');if(cardCat){const t=(el.textContent||'').toLowerCase();if(t.includes('properties')){e.preventDefault();e.stopImmediatePropagation();go('/properties','property');return}if(t.includes('vehicles')){e.preventDefault();e.stopImmediatePropagation();go('/vehicles','vehicle');return}if(t.includes('businesses')){e.preventDefault();e.stopImmediatePropagation();go('/businesses','business');return}}
}
document.addEventListener('click',click,true);
window.addEventListener('popstate',()=>setTimeout(()=>{if(typeof window.render==='function')window.render();},0));
})();
