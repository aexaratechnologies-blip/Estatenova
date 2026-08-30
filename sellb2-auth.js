'use strict';
(function(){
  const API='https://bttujypzchanhvdmqutv.supabase.co';
  const KEY='sb_publishable_j4O7PGss7-wWXkY5YnwyOw_i3X1p1l0';
  const CREATE=API+'/functions/v1/create-estatenova-user';
  window.doAuth=async function(){
    const e=document.getElementById('ae')?.value.trim();
    const p=document.getElementById('ap')?.value||'';
    const m=document.getElementById('am');
    const mode=window.st?.authMode||'login';
    if(!e||!p){if(m)m.textContent='Enter your email and password.';return}
    try{
      if(mode==='signup'){
        const name=document.getElementById('an')?.value.trim()||'';
        const cr=await fetch(CREATE,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email:e,password:p,full_name:name})});
        const cd=await cr.json().catch(()=>({}));
        if(!cr.ok)throw Error(cd.error||'Unable to create account.');
      }
      const {data,error}=await window.supabase.createClient(API,KEY).auth.signInWithPassword({email:e,password:p});
      if(error)throw error;
      if(!data.session)throw Error('Unable to create a session.');
      if(m)m.textContent='';
      if(typeof window.setPath==='function')window.setPath('/');
    }catch(x){if(m)m.textContent=x.message||'Unable to sign in.'}
  };
})();
