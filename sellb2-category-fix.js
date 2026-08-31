(function(){'use strict';
function init(){
  let st;try{st=eval('st')}catch(e){setTimeout(init,250);return}
  if(window.__sellb2CategoryFix)return;window.__sellb2CategoryFix=true;
  const prev=window.setPath;
  window.setPath=function(p){
    const allMode=p==='/properties'&&st.cat==='all';
    prev(p);
    if(allMode){
      st.cat='all';st.type='all';
      Promise.resolve(window.load&&window.load()).then(function(){st.cat='all';st.type='all';fix();});
    }
  };
  function fix(){
    if(location.pathname!=='/properties'||st.cat!=='all')return;
    const tabs=document.querySelectorAll('.cat-tabs button');tabs.forEach((b,i)=>b.classList.toggle('on',i===0));
    document.querySelectorAll('.property-card').forEach(card=>card.style.display='');
  }
  const mo=new MutationObserver(()=>{clearTimeout(mo._t);mo._t=setTimeout(fix,50)});mo.observe(document.body,{childList:true,subtree:true});
  setTimeout(fix,300);setTimeout(fix,1000);
}
setTimeout(init,0);
})();
