(async function(){
  'use strict';
  const m=document.getElementById('bootmsg');
  try {
    const r=await fetch('/sellb2.js?v=sellb2-runtime-4',{cache:'no-store'});
    if(!r.ok) throw new Error('Marketplace client script HTTP '+r.status);
    let code=await r.text();
    // The browser exposes window.top as a protected global. The original
    // marketplace function named `top` can therefore fail before rendering.
    code=code.replace(/\bfunction\s+top\s*\(/g,'function appTop(');
    code=code.replace(/\btop\(\)/g,'appTop()');
    // listing_type is NOT NULL in the database; vehicle/business forms also need a value.
    code=code.replace("category:c,price:+lp.value||0,","category:c,listing_type:'sale',price:+lp.value||0,");
    // Business established-year filter was rendered but never applied to the query.
    code=code.replace("if(st.wheels)q=q.contains('details',{wheels:+st.wheels});if(st.registered)","if(st.wheels)q=q.contains('details',{wheels:+st.wheels});if(st.year&&st.cat==='business')q=q.contains('details',{established_year:+st.year});if(st.registered)");
    // Enquiries must also work when a listing is opened directly and is not in st.items yet.
    code=code.replace("window.enquiry=async id=>{if(!st.user)return setPath('/auth');let p=st.items.find(x=>x.id===id);let msg=prompt('Write your enquiry:');if(!msg?.trim()||!p)return;let r=await db.from('inquiries').insert({listing_id:id,buyer_id:st.user.id,seller_id:p.owner_id,message:msg.trim(),buyer_phone:st.user.phone||null,buyer_email:st.user.email||null});toast(r.error?'Could not send enquiry':'Enquiry sent')};","window.enquiry=async id=>{if(!st.user)return setPath('/auth');let p=st.items.find(x=>x.id===id);if(!p){let rr=await db.from('listings').select('id,owner_id').eq('id',id).eq('status','active').eq('approval_status','approved').maybeSingle();p=rr.data}let msg=prompt('Write your enquiry:');if(!msg?.trim()||!p)return;let r=await db.from('inquiries').insert({listing_id:id,buyer_id:st.user.id,seller_id:p.owner_id,message:msg.trim(),buyer_phone:st.user.phone||null,buyer_email:st.user.email||null});toast(r.error?'Could not send enquiry':'Enquiry sent')};");
    code=code.replace("function setPath(p){history.pushState({},'',p);st.route=p;render();}","function setPath(p){if(p==='/'||p==='/properties'||p==='/vehicles'||p==='/businesses'){location.assign(p);return;}history.pushState({},'',p);st.route=p;render();}");
    code=code.replace("st.user=p||{id:u.id,email:u.email};","st.user=Object.assign(p||{id:u.id},{email:(p&&p.email)||u.email||''});");
    const contactFields='<div class="seller-contact-box"><h3>Contact details for buyers</h3><p class="formnote">Both contact details are required. Buyers will see these details on the listing.</p><div class="grid2"><label>Seller phone number<input id="lphone" class="field" type="tel" inputmode="tel" autocomplete="tel" required value="${esc(st.user?.phone||'')}"></label><label>Seller email address<input id="lemail" class="field" type="email" autocomplete="email" required value="${esc(st.user?.email||'')}"></label></div></div>';
    code=code.replace('<label>Photos <span class="uploadhint">Up to 12 images · max 8 MB each · first image is cover</span>',contactFields+'<label>Photos <span class="uploadhint">Up to 12 images · max 8 MB each · first image is cover</span>');
    code=code.replace("let ins=await db.from('listings').insert(row).select().single();","let contactPhone=document.getElementById('lphone')?.value.trim()||'',contactEmail=document.getElementById('lemail')?.value.trim()||'';if(!contactPhone||!contactEmail)throw Error('Seller phone number and email address are required before publishing.');if(!/^[0-9+()\\-\\s]{7,20}$/.test(contactPhone))throw Error('Enter a valid seller phone number.');if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(contactEmail))throw Error('Enter a valid seller email address.');row.details=row.details||{};row.details.seller_contact_phone=contactPhone;row.details.seller_contact_email=contactEmail;let ins=await db.from('listings').insert(row).select().single();");
    code=code.replace('<div class="detailactions"><button class="btn ghost" onclick="enquiry(\\'${p.id}\\')">Send enquiry</button>','<div class="buyer-contact"><h3>Contact seller</h3><div class="buyer-contact-grid"><a href="tel:${esc(d.seller_contact_phone||'')}"><small>Phone</small><b>${esc(d.seller_contact_phone||'Not provided')}</b></a><a href="mailto:${esc(d.seller_contact_email||'')}"><small>Email</small><b>${esc(d.seller_contact_email||'Not provided')}</b></a></div></div><div class="detailactions"><button class="btn ghost" onclick="enquiry(\\'${p.id}\\')">Send enquiry</button>');
    const script=document.createElement('script');
    script.type='text/javascript';
    script.text=code;
    script.dataset.sellb2Runtime='4';
    document.body.appendChild(script);
  } catch(e) {
    console.error('SELLB2 runtime loader:',e);
    if(m) m.innerHTML='SELLB2 application failed to start: '+String(e.message||e).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]});
  }
})();
