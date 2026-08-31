export default async function handler(req,res){
  const fs=require('fs');
  const path=require('path');
  try{
    const file=path.join(process.cwd(),'sellb2.js');
    let code=fs.readFileSync(file,'utf8');

    // Avoid the global `top` browser API collision in the legacy client script.
    code=code.replace(/\bfunction\s+top\s*\(/g,'function appTop(');
    code=code.replace(/\btop\(\)/g,'appTop()');

    // The primary marketplace routes must perform a real document navigation.
    // This bypasses the old SPA route wrappers that were intermittently swallowing clicks.
    code=code.replace(
      "function setPath(p){history.pushState({},'',p);st.route=p;render();}",
      "function setPath(p){if(p==='/'||p==='/properties'||p==='/vehicles'||p==='/businesses'){location.assign(p);return;}history.pushState({},'',p);st.route=p;render();}"
    );

    // Make the authenticated user's email reliably available to the listing form.
    code=code.replace(
      "st.user=p||{id:u.id,email:u.email};",
      "st.user=Object.assign(p||{id:u.id},{email:(p&&p.email)||u.email||''});"
    );

    // Every seller must explicitly provide buyer-facing phone + email for each listing.
    const contactFields='<div class="seller-contact-box"><h3>Contact details for buyers</h3><p class="formnote">Both contact details are required. Buyers will see these details on the listing.</p><div class="grid2"><label>Seller phone number<input id="lphone" class="field" type="tel" inputmode="tel" autocomplete="tel" required value="${esc(st.user?.phone||'')}"></label><label>Seller email address<input id="lemail" class="field" type="email" autocomplete="email" required value="${esc(st.user?.email||'')}"></label></div></div>';
    code=code.replace(
      '<label>Photos <span class="uploadhint">Up to 12 images · max 8 MB each · first image is cover</span>',
      contactFields+'<label>Photos <span class="uploadhint">Up to 12 images · max 8 MB each · first image is cover</span>'
    );

    // Validate and persist contact details immediately before the listing insert.
    code=code.replace(
      "let ins=await db.from('listings').insert(row).select().single();",
      "let contactPhone=document.getElementById('lphone')?.value.trim()||'',contactEmail=document.getElementById('lemail')?.value.trim()||'';if(!contactPhone||!contactEmail)throw Error('Seller phone number and email address are required before publishing.');if(!/^[0-9+()\\-\\s]{7,20}$/.test(contactPhone))throw Error('Enter a valid seller phone number.');if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(contactEmail))throw Error('Enter a valid seller email address.');row.details=row.details||{};row.details.seller_contact_phone=contactPhone;row.details.seller_contact_email=contactEmail;let ins=await db.from('listings').insert(row).select().single();"
    );

    // Show buyer-facing contact details prominently on every listing detail page.
    code=code.replace(
      '<div class="detailactions"><button class="btn ghost" onclick="enquiry(\'${p.id}\')">Send enquiry</button>',
      '<div class="buyer-contact"><h3>Contact seller</h3><div class="buyer-contact-grid"><a href="tel:${esc(d.seller_contact_phone||'')}"><small>Phone</small><b>${esc(d.seller_contact_phone||'Not provided')}</b></a><a href="mailto:${esc(d.seller_contact_email||'')}"><small>Email</small><b>${esc(d.seller_contact_email||'Not provided')}</b></a></div></div><div class="detailactions"><button class="btn ghost" onclick="enquiry(\'${p.id}\')">Send enquiry</button>'
    );

    res.statusCode=200;
    res.setHeader('Content-Type','application/javascript; charset=utf-8');
    res.setHeader('Cache-Control','no-store');
    res.end(code);
  }catch(e){
    res.statusCode=500;
    res.setHeader('Content-Type','application/javascript; charset=utf-8');
    res.end(`throw new Error(${JSON.stringify('SELLB2 script proxy failed: '+e.message)})`);
  }
}
