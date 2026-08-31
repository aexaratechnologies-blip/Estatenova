(async function(){
  'use strict';
  const m=document.getElementById('bootmsg');
  try{
    const r=await fetch('/api/sellb2.js?v=sellb2-runtime-8',{cache:'no-store'});
    if(!r.ok)throw new Error('Marketplace client script HTTP '+r.status);
    const code=await r.text();
    const script=document.createElement('script');
    script.type='text/javascript';
    script.text=code;
    script.dataset.sellb2Runtime='8';
    document.body.appendChild(script);
  }catch(e){
    console.error('SELLB2 runtime loader:',e);
    if(m)m.innerHTML='SELLB2 application failed to start: '+String(e.message||e).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]});
  }
})();
