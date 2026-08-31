'use strict';
(async function(){
  const loadScript=(src,timeout=9000)=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    let done=false;
    const finish=(fn,arg)=>{if(done)return;done=true;clearTimeout(t);fn(arg)};
    const t=setTimeout(()=>finish(reject,new Error('Timed out loading '+src)),timeout);
    s.src=src;s.async=false;s.onload=()=>finish(resolve);s.onerror=()=>finish(reject,new Error('Failed to load '+src));
    document.head.appendChild(s);
  });
  async function loadSupabase(){
    const urls=[
      'https://unpkg.com/@supabase/supabase-js@2.112.4/dist/umd/supabase.js',
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4/dist/umd/supabase.min.js'
    ];
    let last;
    for(const u of urls){try{await loadScript(u);if(window.supabase&&typeof window.supabase.createClient==='function')return}catch(e){last=e}}
    throw last||new Error('Supabase client failed to initialize');
  }
  try{
    await loadSupabase();
    const response=await fetch('/sellb2.js?v=sellb2-11',{cache:'no-store'});
    if(!response.ok)throw new Error('Failed to load SELLB2 application ('+response.status+')');
    const source=await response.text();
    const expose='\nwindow.st=st;window.setPath=setPath;window.render=render;window.load=load;window.loadListings=load;window.toggleTheme=toggleTheme;window.drawer=drawer;window.save=save;';
    new Function(source+expose)();
    if(window.render&&document.getElementById('app')&&!document.getElementById('app').innerHTML.trim())await window.render();
    loadScript('/location-data-v1.js?v=sellb2-11',6000).then(async()=>{if(window.estatenovaLocationReady)await window.estatenovaLocationReady;if(window.EN_LOCATION&&window.render)await window.render()}).catch(e=>console.warn('Optional location data failed:',e));
  }catch(e){window.dispatchEvent(new CustomEvent('sellb2booterror',{detail:e}));}
})();