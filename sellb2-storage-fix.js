(function(){'use strict';
const realCreate=window.supabase&&window.supabase.createClient;
if(realCreate){
  window.supabase.createClient=function(){
    const client=realCreate.apply(this,arguments);
    if(client&&client.storage&&typeof client.storage.from==='function'){
      const realFrom=client.storage.from.bind(client.storage);
      client.storage.from=function(bucket){
        const api=realFrom(bucket);
        if(!api||typeof api.upload!=='function'||api.__sellb2UploadFixed)return api;
        const realUpload=api.upload.bind(api);
        api.upload=async function(path,file,options){
          let lastError=null;
          for(let attempt=1;attempt<=3;attempt++){
            try{
              const result=await realUpload(path,file,options);
              if(!result||!result.error)return result;
              lastError=result.error;
              const status=String(result.error.statusCode||'');
              if(status&&!['408','429','500','502','503','504'].includes(status))return result;
            }catch(error){lastError=error;}
            if(attempt<3)await new Promise(r=>setTimeout(r,700*attempt));
          }
          throw lastError||new Error('Image upload failed');
        };
        api.__sellb2UploadFixed=true;
        return api;
      };
    }
    return client;
  };
}

function initEnhancements(){
  let db,st;
  try{db=eval('db');st=eval('st');}catch(e){setTimeout(initEnhancements,250);return;}
  if(window.__sellb2EnhancementsReady)return;
  window.__sellb2EnhancementsReady=true;
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const route=()=>location.pathname;
  const listingId=()=>{const m=route().match(/^\/listing\/([^/]+)/);return m?m[1]:null};

  const originalSetPath=window.setPath;
  window.setPath=function(p){
    if(p==='/properties'){st.cat='property';st.type='all'}
    else if(p==='/vehicles'){st.cat='vehicle';st.type='all'}
    else if(p==='/businesses'){st.cat='business';st.type='all'}
    else if(p==='/'){st.cat='all';st.type='all'}
    originalSetPath(p);
    if(p==='/properties'||p==='/vehicles'||p==='/businesses')Promise.resolve().then(()=>window.load&&window.load());
  };

  const css=document.createElement('style');css.textContent=`
  .heart{color:#e53935!important;border-color:rgba(229,57,53,.35)!important;background:rgba(229,57,53,.10)!important;font-weight:900!important;text-shadow:0 1px 2px rgba(0,0,0,.08)}
  .heart:hover{background:rgba(229,57,53,.18)!important;transform:scale(1.04)}
  .s2-manage-card{margin:18px 0;padding:18px;border:1px solid #e5e7eb;border-radius:20px;background:#fff;box-shadow:0 8px 25px rgba(15,23,42,.06)}
  .s2-manage-card h3{margin:0 0 6px;font-size:18px}.s2-manage-card p{margin:0 0 14px;color:#6b7280;font-size:14px}.s2-danger{width:100%;padding:13px 16px;border:0;border-radius:13px;background:#dc2626;color:#fff;font-weight:800;font-size:15px}
  .s2-contact{width:100%;padding:14px 16px;border:0;border-radius:14px;background:linear-gradient(135deg,#2858df,#7250df);color:#fff;font-weight:800;font-size:16px;margin:12px 0}
  .s2-contact-summary{margin:14px 0;padding:15px 16px;border-radius:16px;background:#f3f6fb;border:1px solid #e3e8f2;color:#17233b}.s2-contact-summary b{font-size:18px}.s2-contact-summary span{color:#667085;font-size:13px}
  .s2-modal-backdrop{position:fixed;inset:0;z-index:100000;background:rgba(7,15,31,.62);display:flex;align-items:flex-end;justify-content:center;padding:14px}.s2-modal{width:min(560px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:26px 26px 18px 18px;box-shadow:0 25px 80px rgba(0,0,0,.28);padding:20px}.s2-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.s2-modal-head h2{margin:0;font-size:21px}.s2-modal-head p{margin:5px 0 0;color:#667085;font-size:13px}.s2-x{border:0;background:#f1f3f6;border-radius:50%;width:38px;height:38px;font-size:22px}
  .s2-contact-row{margin-top:16px;padding:15px;border:1px solid #e5e7eb;border-radius:17px}.s2-contact-row label{display:block;font-size:12px;font-weight:800;color:#667085;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px}.s2-contact-value{font-size:16px;font-weight:700;word-break:break-word}.s2-reveal{border:0;border-radius:10px;background:#eef2ff;color:#2749b8;padding:9px 12px;font-weight:800}.s2-chat{margin-top:18px;border-top:1px solid #edf0f4;padding-top:17px}.s2-chat textarea{width:100%;min-height:90px;resize:vertical;border:1px solid #dfe4ec;border-radius:14px;padding:13px;font:inherit;box-sizing:border-box}.s2-send{margin-top:10px;width:100%;border:0;border-radius:14px;padding:13px;background:#162f69;color:#fff;font-weight:800}
  .s2-profile-note{margin:18px 0;padding:17px 18px;border-radius:18px;background:#eef4ff;border:1px solid #d9e4ff}.s2-profile-note h3{margin:0 0 6px}.s2-profile-note p{margin:0;color:#5c677a;line-height:1.5;font-size:14px}body.s2-modal-open{overflow:hidden}`;document.head.appendChild(css);

  const currentUser=()=>db.auth.getUser().then(r=>r.data.user);
  async function getListing(id){const r=await db.from('listings').select('*').eq('id',id).maybeSingle();if(r.error)throw r.error;return r.data}
  function storagePath(url){if(!url)return null;const marker='/storage/v1/object/public/property-images/';const i=String(url).indexOf(marker);return i>=0?decodeURIComponent(String(url).slice(i+marker.length)):null}

  async function deleteListing(id){
    const user=await currentUser();if(!user){window.setPath('/auth');return}
    const p=await getListing(id);if(!p||p.owner_id!==user.id){alert('You can only delete your own listing.');return}
    if(!confirm('Delete this listing permanently? This cannot be undone.'))return
    const urls=[p.cover_image_url,...(p.image_urls||[])].filter(Boolean)
    const r=await db.from('listings').delete().eq('id',id).eq('owner_id',user.id)
    if(r.error){alert('Could not delete listing: '+r.error.message);return}
    const paths=[...new Set(urls.map(storagePath).filter(Boolean))];if(paths.length)await db.storage.from('property-images').remove(paths)
    alert('Listing deleted successfully.');window.setPath('/profile');setTimeout(()=>window.render&&window.render(),100)
  }

  async function sellerContact(id){const r=await db.rpc('get_seller_contact',{p_listing_id:id});if(r.error)throw r.error;return r.data&&r.data[0]}
  async function recordView(id,seller,type){const user=await currentUser();if(!user)return;await db.from('contact_views').upsert({buyer_id:user.id,seller_id:seller,listing_id:id,contact_type:type},{onConflict:'buyer_id,seller_id,listing_id,contact_type',ignoreDuplicates:true})}

  async function openContact(id){
    const user=await currentUser();if(!user){window.setPath('/auth');return}
    const data=await sellerContact(id).catch(()=>{alert('Seller contact details could not be loaded.');return null});if(!data)return
    const modal=document.createElement('div');modal.className='s2-modal-backdrop';modal.innerHTML=`<div class="s2-modal" role="dialog" aria-modal="true"><div class="s2-modal-head"><div><h2>Contact seller</h2><p>${esc(data.full_name||'Seller')} · ${esc(data.listing_title||'Listing')}</p></div><button class="s2-x" data-s2-close>×</button></div><div class="s2-contact-row"><label>Phone number</label><div class="s2-contact-value" id="s2-phone-value"><button class="s2-reveal" data-s2-reveal="phone">View phone number</button></div></div><div class="s2-contact-row"><label>Email address</label><div class="s2-contact-value" id="s2-email-value"><button class="s2-reveal" data-s2-reveal="email">View email address</button></div></div><div class="s2-chat"><strong>Message seller</strong><p style="color:#667085;font-size:13px;margin:5px 0 10px">Send a message here, or use the phone/email above to contact the seller directly.</p><textarea id="s2-message" placeholder="Hi, I am interested in this listing..."></textarea><button class="s2-send" data-s2-send>Send message</button></div></div>`;
    document.body.appendChild(modal);document.body.classList.add('s2-modal-open');const close=()=>{modal.remove();document.body.classList.remove('s2-modal-open')}
    modal.addEventListener('click',async e=>{
      if(e.target===modal||e.target.closest('[data-s2-close]')){close();return}
      const reveal=e.target.closest('[data-s2-reveal]');if(reveal){const type=reveal.dataset.s2Reveal;const value=type==='phone'?data.phone:data.email;const out=modal.querySelector('#s2-'+type+'-value');out.textContent=value||('Seller has not added a '+type+' yet.');if(value)await recordView(id,data.seller_id,type);return}
      const send=e.target.closest('[data-s2-send]');if(send){const body=modal.querySelector('#s2-message').value.trim();if(!body){alert('Write a message first.');return}send.disabled=true;try{let q=await db.from('conversations').select('id').eq('listing_id',id).eq('buyer_id',user.id).eq('seller_id',data.seller_id).limit(1).maybeSingle();let cid=q.data&&q.data.id;if(!cid){const c=await db.from('conversations').insert({listing_id:id,buyer_id:user.id,seller_id:data.seller_id,last_message:body,last_message_at:new Date().toISOString()}).select('id').single();if(c.error)throw c.error;cid=c.data.id}else await db.from('conversations').update({last_message:body,last_message_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',cid);const m=await db.from('messages').insert({conversation_id:cid,sender_id:user.id,body});if(m.error)throw m.error;modal.querySelector('#s2-message').value='';alert('Message sent.')}catch(err){alert('Message could not be sent: '+(err.message||err))}finally{send.disabled=false}}
    });
  }

  function injectListingActions(){
    const id=listingId();if(!id)return;currentUser().then(async user=>{const p=await getListing(id).catch(()=>null);if(!p)return;const root=document.querySelector('.content')||document.querySelector('.screen');if(!root)return;if(!root.querySelector('.s2-contact')){const btn=document.createElement('button');btn.className='s2-contact';btn.textContent='Contact seller';btn.dataset.s2Contact=id;root.appendChild(btn)}if(user&&p.owner_id===user.id&&!root.querySelector('.s2-manage-card')){const box=document.createElement('section');box.className='s2-manage-card';box.innerHTML='<h3>Manage this listing</h3><p>You are the seller. You can remove your listing whenever you want.</p><button class="s2-danger" data-s2-delete="'+esc(id)+'">Delete listing</button>';root.appendChild(box)}}).catch(()=>{})
  }

  async function injectMessagesSummary(){
    if(route()!=='/messages'||document.querySelector('.s2-contact-summary'))return;const user=await currentUser().catch(()=>null);if(!user)return;const r=await db.from('contact_views').select('contact_type').eq('buyer_id',user.id);if(r.error)return;const phone=(r.data||[]).filter(x=>x.contact_type==='phone').length;const email=(r.data||[]).filter(x=>x.contact_type==='email').length;const root=document.querySelector('.content')||document.querySelector('.screen');if(!root)return;const box=document.createElement('section');box.className='s2-contact-summary';box.innerHTML='<b>Seller contact views</b><br><span>'+phone+' phone number'+(phone===1?'':'s')+' · '+email+' email'+(email===1?'':'s')+' viewed by you</span>';root.insertBefore(box,root.firstChild)
  }
  function injectProfileNote(){if(route()!=='/profile'||document.querySelector('.s2-profile-note'))return;const root=document.querySelector('.content')||document.querySelector('.screen');if(!root)return;const box=document.createElement('section');box.className='s2-profile-note';box.innerHTML='<h3>Add your phone & email</h3><p>Adding your phone number and email lets interested buyers contact you directly from your listings. Buyers only see these details after they choose <b>Contact seller</b> and request the contact information.</p>';root.insertBefore(box,root.firstChild)}
  function sync(){const r=route();if(r==='/messages')injectMessagesSummary();if(r==='/profile')injectProfileNote();if(r.startsWith('/listing/'))injectListingActions();document.querySelectorAll('.heart').forEach(x=>x.style.setProperty('color','#e53935','important'))}

  document.addEventListener('click',e=>{const del=e.target.closest('[data-s2-delete]');if(del){e.preventDefault();e.stopImmediatePropagation();deleteListing(del.dataset.s2Delete);return}const contact=e.target.closest('[data-s2-contact],button,a');if(contact&&/contact\s*seller/i.test(contact.textContent||'')){const id=contact.dataset.s2Contact||listingId();if(id){e.preventDefault();e.stopImmediatePropagation();openContact(id)}}},true);
  const observer=new MutationObserver(()=>{clearTimeout(observer._t);observer._t=setTimeout(sync,80)});observer.observe(document.body,{childList:true,subtree:true});setTimeout(sync,300);setTimeout(sync,1200)
}
setTimeout(initEnhancements,0);
})();
