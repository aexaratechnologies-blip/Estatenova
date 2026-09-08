export default async function handler(req, res) {
  try {
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const host = req.headers.host;
    if (!host) throw new Error('Missing request host');
    const upstreamUrl = `${proto}://${host}/sellb2.js?v=android-safe-1`;
    const upstream = await fetch(upstreamUrl, { headers: { 'user-agent': 'SELLB2-App-Compiler/1.0' }, cache: 'no-store' });
    if (!upstream.ok) throw new Error(`Marketplace source HTTP ${upstream.status}`);
    let code = await upstream.text();

    code = code.replace(/\bconst\s+db\s*=/, 'window.db=');
    code = code.replace(/\bconst\s+st\s*=/, 'window.st=');
    code = code.replace(/\bfunction\s+top\s*\(/g, 'function appTop(');
    code = code.replace(/\btop\(\)/g, 'appTop()');
    code = code.replace("function setPath(p){history.pushState({},'',p);st.route=p;render();}", "function setPath(p){history.pushState({},'',p);st.route=p;render();}window.setPath=setPath;");
    code = code.replace("function listingPage(cat){let types=cat==='property'?P:cat==='vehicle'?V:B;st.cat=cat;return", "function listingPage(cat){let types=cat==='property'?P:cat==='vehicle'?V:B;if(st.cat!=='all')st.cat=cat;return");
    code = code.replace("category:c,price:+lp.value||0,", "category:c,listing_type:'sale',price:+lp.value||0,");
    code = code.replace("if(st.wheels)q=q.contains('details',{wheels:+st.wheels});if(st.registered)", "if(st.wheels)q=q.contains('details',{wheels:+st.wheels});if(st.year&&st.cat==='business')q=q.contains('details',{established_year:+st.year});if(st.registered)");
    code = code.replace("st.user=p||{id:u.id,email:u.email};", "st.user=Object.assign(p||{id:u.id},{email:(p&&p.email)||u.email||''});");
    const contactFields = `<div class="seller-contact-box"><h3>Contact details for buyers</h3><p class="formnote">Both contact details are required. Buyers will see these details on the listing.</p><div class="grid2"><label>Seller phone number<input id="lphone" class="field" type="tel" inputmode="tel" autocomplete="tel" required value="\${esc(st.user?.phone||'')}"></label><label>Seller email address<input id="lemail" class="field" type="email" autocomplete="email" required value="\${esc(st.user?.email||'')}"></label></div></div>`;
    code = code.replace('<label>Photos <span class="uploadhint">Up to 12 images · max 8 MB each · first image is cover</span>', contactFields + '<label>Photos <span class="uploadhint">Up to 12 images · max 8 MB each · first image is cover</span>');
    code = code.replace("let ins=await db.from('listings').insert(row).select().single();", "let contactPhone=document.getElementById('lphone')?.value.trim()||'',contactEmail=document.getElementById('lemail')?.value.trim()||'';if(!contactPhone||!contactEmail)throw Error('Seller phone number and email address are required before publishing.');if(!/^[0-9+()\\-\\s]{7,20}$/.test(contactPhone))throw Error('Enter a valid seller phone number.');if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(contactEmail))throw Error('Enter a valid seller email address.');row.details=row.details||{};row.details.seller_contact_phone=contactPhone;row.details.seller_contact_email=contactEmail;let ins=await db.from('listings').insert(row).select().single();");

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).send(code);
  } catch (err) {
    res.status(502).send(`console.error(${JSON.stringify(`SELLB2 app compiler failed: ${String(err?.message || err)}`)});`);
  }
}
