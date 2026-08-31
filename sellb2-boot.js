'use strict';
(async function(){
  const loadScript=(src,timeout=10000)=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    let settled=false;
    const finish=(fn,arg)=>{if(settled)return;settled=true;clearTimeout(timer);s.remove();fn(arg)};
    const timer=setTimeout(()=>finish(reject,new Error('Timed out loading '+src)),timeout);
    s.src=src;
    s.async=false;
    s.onload=()=>finish(resolve);
    s.onerror=()=>finish(reject,new Error('Failed to load '+src));
    document.head.appendChild(s);
  });
  try{
    // Load Supabase from the same Vercel origin. This avoids mobile/browser
    // CDN blocking and guarantees the app is not dependent on a third-party
    // script host during its critical startup path.
    await loadScript('/api/supabase.js?v=sellb2-15',12000);
    if(!window.supabase||typeof window.supabase.createClient!=='function'){
      throw new Error('Supabase browser SDK did not initialize');
    }

    await loadScript('/sellb2.js?v=sellb2-15',12000);

    // IMPORTANT: sellb2.js performs an async Supabase auth/session check before
    // its own startup render. Never let that network/auth operation keep the
    // splash screen visible. Render the route immediately after the app script
    // has been evaluated; auth state can finish in the background.
    if(typeof window.render!=='function'){
      throw new Error('SELLB2 render function was not initialized');
    }
    await window.render();

    const app=document.getElementById('app');
    if(!app||!app.innerHTML.trim()){
      throw new Error('SELLB2 application did not render a screen');
    }

    loadScript('/location-data-v1.js?v=sellb2-15',6000).then(async()=>{
      if(window.estatenovaLocationReady)await window.estatenovaLocationReady;
      if(window.EN_LOCATION&&typeof window.render==='function')await window.render();
    }).catch(e=>console.warn('Optional location data failed:',e));
  }catch(e){
    console.error('SELLB2 boot failed',e);
    window.dispatchEvent(new CustomEvent('sellb2booterror',{detail:e}));
  }
})();
