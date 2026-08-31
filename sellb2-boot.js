'use strict';
(async function(){
  const loadScript=(src,timeout=12000)=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    let settled=false;
    const finish=(fn,arg)=>{if(settled)return;settled=true;clearTimeout(timer);fn(arg)};
    const timer=setTimeout(()=>finish(reject,new Error('Timed out loading '+src)),timeout);
    s.src=src;
    s.async=false;
    s.crossOrigin='anonymous';
    s.onload=()=>finish(resolve);
    s.onerror=()=>finish(reject,new Error('Failed to load '+src));
    document.head.appendChild(s);
  });
  try{
    // Use the explicit UMD build. The package root is not guaranteed to expose
    // the browser global when inserted as a classic script.
    await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js');
    if(!window.supabase||typeof window.supabase.createClient!=='function')throw new Error('Supabase browser SDK did not expose window.supabase');
    await loadScript('/sellb2.js?v=sellb2-13');
    if(!document.getElementById('app').innerHTML.trim())throw new Error('SELLB2 application loaded but rendered no screen');
    loadScript('/location-data-v1.js?v=sellb2-13',6000).then(async()=>{
      if(window.estatenovaLocationReady)await window.estatenovaLocationReady;
      if(window.EN_LOCATION&&typeof window.render==='function')await window.render();
    }).catch(e=>console.warn('Optional location data failed:',e));
  }catch(e){
    console.error('SELLB2 boot failed',e);
    window.dispatchEvent(new CustomEvent('sellb2booterror',{detail:e}));
  }
})();
