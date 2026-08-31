(async function(){
  'use strict';
  try {
    const r=await fetch('/sellb2.js?v=sellb2-runtime-1',{cache:'no-store'});
    if(!r.ok) throw new Error('Marketplace client script HTTP '+r.status);
    let code=await r.text();
    code=code.replace(/\bfunction\s+top\s*\(/g,'function appTop(');
    code=code.replace(/\btop\(\)/g,'appTop()');
    code=code.replace("function setPath(p){history.pushState({},'',p);st.route=p;render();}","function setPath(p){if(p==='/'||p==='/properties'||p==='/vehicles'||p==='/businesses'){location.assign(p);return;}history.pushState({},'',p);st.route=p;render();}");
    (0,eval)(code);
  } catch(e) {
    console.error('SELLB2 runtime loader:',e);
    const m=document.getElementById('bootmsg');
    if(m) m.textContent='SELLB2 application failed to start: '+(e.message||e);
  }
})();
