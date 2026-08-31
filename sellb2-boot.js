'use strict';

// Execute SELLB2 inside a private function scope so legacy/global names
// (notably `top`) can never collide with browser or previously loaded scripts.
(async function(){
  const loadScript = src => new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=resolve;
    s.onerror=()=>reject(new Error('Failed to load '+src));
    document.head.appendChild(s);
  });

  async function loadSupabase(){
    try{ await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'); }
    catch(_){ await loadScript('https://unpkg.com/@supabase/supabase-js@2'); }
  }

  try{
    await loadSupabase();
    if(!window.supabase || typeof window.supabase.createClient!=='function'){
      throw new Error('Supabase client failed to initialize');
    }

    // Load the existing application as text and execute it in an isolated
    // function scope. This prevents duplicate top-level lexical declarations.
    const response=await fetch('/sellb2.js?v=sellb2-7',{cache:'no-store'});
    if(!response.ok) throw new Error('Failed to load SELLB2 application ('+response.status+')');
    const source=await response.text();
    const expose='\nwindow.setPath=setPath;\nwindow.render=render;\nwindow.loadListings=load;\n';
    new Function(source+expose)();

    // Location data is optional for startup and can populate filters later.
    try{
      await loadScript('/location-data-v1.js?v=sellb2-7');
      if(window.estatenovaLocationReady) await window.estatenovaLocationReady;
      if(window.EN_LOCATION && typeof window.render==='function') await window.render();
    }catch(e){ console.warn('Optional location data failed:',e); }
  }catch(e){
    window.dispatchEvent(new CustomEvent('sellb2booterror',{detail:e}));
  }
})();
