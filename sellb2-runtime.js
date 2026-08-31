(async function(){
  'use strict';
  const m=document.getElementById('bootmsg');
  try {
    const r=await fetch('/sellb2.js?v=sellb2-runtime-5',{cache:'no-store'});
    if(!r.ok) throw new Error('Marketplace client script HTTP '+r.status);
    let code=await r.text();

    // Run the marketplace as a real global script, but avoid colliding with
    // Window.top. Keep the transformation deliberately small and syntax-safe.
    code=code.replace(/\bfunction\s+top\s*\(/g,'function appTop(');
    code=code.replace(/\btop\(\)/g,'appTop()');

    const script=document.createElement('script');
    script.type='text/javascript';
    script.text=code;
    script.dataset.sellb2Runtime='5';
    document.body.appendChild(script);
  } catch(e) {
    console.error('SELLB2 runtime loader:',e);
    if(m) m.innerHTML='SELLB2 application failed to start: '+String(e.message||e).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]});
  }
})();
