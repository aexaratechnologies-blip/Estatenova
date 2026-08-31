export default async function handler(req,res){
  try{
    const proto=req.headers['x-forwarded-proto']||'https';
    const host=req.headers.host;
    const r=await fetch(`${proto}://${host}/api/sellb2.js?v=sellb2-runtime-8`,{cache:'no-store'});
    if(!r.ok)throw new Error('api/sellb2.js HTTP '+r.status);
    const code=await r.text();
    new Function(code);
    const checks={hasTopCollision:/function\s+top\s*\(/.test(code),hasAppTop:/function\s+appTop\s*\(/.test(code),hasListingType:code.includes("listing_type:'sale'"),hasBusinessYear:code.includes("st.year&&st.cat==='business'"),hasDirectEnquiryLookup:code.includes("eq('approval_status','approved')"),hasContactFields:code.includes('seller-contact-box'),hasContactValidation:code.includes('seller_contact_phone')&&code.includes('seller_contact_email')};
    res.status(200).json({ok:true,bytes:code.length,checks});
  }catch(e){res.status(500).json({ok:false,error:String(e&&e.stack||e)});}
}
