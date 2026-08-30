/* EstateNova Seller Photo Upload v1
   Mobile-safe photo queue: supports multi-select when available and repeated
   single-file picker selections when the device/browser only exposes one file. */
const EN_SELLER_MAX_PHOTOS=12;
let enSellerPhotoQueue=[];

function enSellerPhotoKey(file){
  return [file.name,file.size,file.lastModified,file.type].join('::');
}

function enSellerPhotoRender(){
  const box=document.getElementById('seller-photo-preview');
  const count=document.getElementById('seller-photo-count');
  if(count) count.textContent=`${enSellerPhotoQueue.length} / ${EN_SELLER_MAX_PHOTOS} images selected`;
  if(!box)return;
  box.innerHTML=enSellerPhotoQueue.map((file,i)=>{
    const url=URL.createObjectURL(file);
    return `<div class="seller-photo-item"><img src="${sellerEsc(url)}" alt="Property photo ${i+1}"><button type="button" onclick="removeSellerPhoto(${i})" aria-label="Remove photo ${i+1}">×</button><small>${i===0?'Cover':''}</small></div>`;
  }).join('');
}

window.removeSellerPhoto=function(index){
  enSellerPhotoQueue.splice(index,1);
  enSellerPhotoRender();
};

window.addSellerPhotos=function(input){
  const incoming=[...(input?.files||[])];
  for(const file of incoming){
    if(enSellerPhotoQueue.length>=EN_SELLER_MAX_PHOTOS)break;
    const duplicate=enSellerPhotoQueue.some(x=>enSellerPhotoKey(x)===enSellerPhotoKey(file));
    if(!duplicate)enSellerPhotoQueue.push(file);
  }
  if(input)input.value='';
  enSellerPhotoRender();
};

function post(){
  if(!state.user)return `<main class="screen">${page('Sell / Post','profile')}${empty('Sign in required','Only signed-in members can submit a property.','auth','Sign in')}</main>`;
  enSellerPhotoQueue=[];
  return `<main class="screen sellerpage">${page('Sell / Post','profile')}<form class="editform sellerform" onsubmit="createListing(event)">
    <div class="sellerintro"><small>SELLER LISTING</small><h2>Submit your property</h2><p>These fields use the same structured values as buyer Search &amp; Filters, so approved listings match correctly.</p></div>
    <div class="sellersection"><h3>Basic details</h3></div>
    ${sellerInput('lt','Property title','','e.g. 3 BHK Apartment in Morabadi','text','required')}
    ${sellerSelect('ltype','Property type','Apartment',EN_SELLER_TYPES.map(x=>[x,x]))}
    ${sellerSelect('lkind','Listing type','sale',[['sale','For sale'],['rent','For rent'],['lease','For lease']])}
    ${sellerInput('lp','Price / Budget','','Amount in INR','number','min="0" required')}
    ${sellerInput('la','Area','','e.g. 1200','number','min="0"')}
    ${sellerSelect('lau','Area unit','sq ft',[['sq ft','sq ft'],['sq yd','sq yd'],['sq m','sq m'],['acre','acre'],['decimal','decimal'],['cent','cent']])}
    ${sellerInput('lb','Bedrooms','','e.g. 3','number','min="0")}
    ${sellerInput('lba','Bathrooms','','e.g. 2','number','min="0")}
    ${sellerInput('lbal','Balconies','','e.g. 2','number','min="0")}
    ${sellerInput('lfloor','Floor','','e.g. 5','number','min="0")}
    ${sellerInput('ltf','Total floors','','e.g. 10','number','min="0")}
    ${sellerSelect('lfurn','Furnishing','',EN_SELLER_FURNISHING)}
    ${sellerInput('lcy','Construction year','','e.g. 2024','number','min="1800" max="2100")}
    ${sellerSelect('lpos','Possession','',EN_SELLER_POSSESSION)}
    ${sellerSelect('lfacing','Facing','',EN_SELLER_FACING)}
    ${sellerSelect('lparking','Parking','',EN_SELLER_PARKING)}
    <div class="sellersection"><h3>Location</h3><p>Choose State → District → City. District and city stay locked until their parent location is selected.</p></div>
    ${sellerSelect('lstate','State / UT','',[['','Select state / UT'],...EN_STATES_FALLBACK.map(x=>[x,x])],'onchange="sellerLocationStateChanged()"')}
    ${sellerSelect('ldistrict','District','',[],'disabled onchange="sellerLocationDistrictChanged()"')}
    ${sellerSelect('lcity','City','',[],'disabled')}
    ${sellerInput('llocality','Locality / Area','','e.g. Morabadi, Kanke')}
    ${sellerInput('lpincode','Pincode','','6-digit pincode','text','inputmode="numeric" maxlength="6"')}
    ${sellerInput('laddress','Full address','','House / building / street address','text')}
    ${sellerInput('lam','Amenities','','e.g. Lift, CCTV, Garden, Gym, Swimming Pool','text')}
    <label class="sellerfield full"><span>Description</span><textarea id="ldesc" class="field" rows="6" maxlength="5000" placeholder="Detailed property description"></textarea></label>
    <label class="sellerfield full"><span>Property photos</span><input id="lfiles" class="field" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple required onchange="addSellerPhotos(this)"><small id="seller-photo-count" class="sellernote">0 / 12 images selected</small><div id="seller-photo-preview" class="seller-photo-preview"></div><small class="sellernote">Up to 12 images · maximum 8 MB each · first image becomes the cover. If your phone only allows one image per picker, tap the same field again to add more.</small></label>
    <div id="lm" class="error"></div><button class="btn primary full" type="submit">Submit for admin approval</button><p class="sellernote full">Your listing will remain hidden from buyers while pending. Admin approval is required before it becomes publicly searchable.</p>
  </form><script>setTimeout(function(){var s=document.getElementById('lstate');if(s)s.innerHTML='<option value="">Select state / UT</option>'+sellerLocationStates();},0)</script></main>`;
}

window.createListing=async e=>{
  e.preventDefault();
  if(!state.user)return go('auth');
  const m=document.getElementById('lm'),btn=e.submitter;
  btn.disabled=true;m.textContent='';
  try{
    const files=enSellerPhotoQueue.slice(0,EN_SELLER_MAX_PHOTOS);
    if(!files.length)throw new Error('Add at least one property photo.');
    if(files.some(f=>f.size>8*1024*1024))throw new Error('Each property photo must be 8 MB or smaller.');
    if(files.some(f=>!/^image\/(jpeg|png|webp|gif)$/.test(f.type)))throw new Error('Only JPG, PNG, WEBP or GIF images are allowed.');
    const pincode=document.getElementById('lpincode').value.trim();
    if(pincode&&!/^\d{6}$/.test(pincode))throw new Error('Pincode must be exactly 6 digits.');
    const row={owner_id:state.user.id,title:document.getElementById('lt').value.trim(),property_type:document.getElementById('ltype').value,listing_type:document.getElementById('lkind').value,price:Number(document.getElementById('lp').value),area:document.getElementById('la').value?Number(document.getElementById('la').value):null,area_unit:document.getElementById('lau').value||'sq ft',bedrooms:document.getElementById('lb').value?Number(document.getElementById('lb').value):null,bathrooms:document.getElementById('lba').value?Number(document.getElementById('lba').value):null,balconies:document.getElementById('lbal').value?Number(document.getElementById('lbal').value):null,floor:document.getElementById('lfloor').value?Number(document.getElementById('lfloor').value):null,total_floors:document.getElementById('ltf').value?Number(document.getElementById('ltf').value):null,furnishing:document.getElementById('lfurn').value||null,construction_year:document.getElementById('lcy').value?Number(document.getElementById('lcy').value):null,possession:document.getElementById('lpos').value||null,facing:document.getElementById('lfacing').value||null,parking:document.getElementById('lparking').value||null,state:document.getElementById('lstate').value,district:document.getElementById('ldistrict').value.trim(),city:document.getElementById('lcity').value.trim(),locality:document.getElementById('llocality').value.trim()||null,pincode:pincode||null,address:document.getElementById('laddress').value.trim()||null,description:document.getElementById('ldesc').value.trim()||null,amenities:document.getElementById('lam').value.split(',').map(x=>x.trim()).filter(Boolean),status:'active',approval_status:'pending',cover_image_url:null,image_urls:[]};
    if(!row.title||!row.price||!row.state||!row.district||!row.city)throw new Error('Title, price, state, district and city are required.');
    const ins=await db.from('listings').insert(row).select().single();if(ins.error)throw ins.error;
    const urls=[];
    for(let i=0;i<files.length;i++){
      const f=files[i];m.textContent=`Uploading photo ${i+1} of ${files.length}…`;
      const ext=(f.name.split('.').pop()||'jpg').toLowerCase();
      const path=state.user.id+'/'+ins.data.id+'/'+crypto.randomUUID()+'.'+ext;
      const up=await db.storage.from('property-images').upload(path,f,{upsert:false,contentType:f.type});if(up.error)throw up.error;
      const url=db.storage.from('property-images').getPublicUrl(path).data.publicUrl;urls.push(url);
      const li=await db.from('listing_images').insert({listing_id:ins.data.id,storage_path:path,public_url:url,sort_order:i});if(li.error)throw li.error;
    }
    const upd=await db.from('listings').update({cover_image_url:urls[0]||null,image_urls:urls}).eq('id',ins.data.id);if(upd.error)throw upd.error;
    m.className='success';m.textContent=`Submitted successfully with ${urls.length} photo${urls.length===1?'':'s'}. Waiting for admin approval; it is not public yet.`;
    setTimeout(()=>go('profile'),1000);
  }catch(err){m.textContent=err.message||'Could not submit listing'}finally{btn.disabled=false}
};
try{const style=document.createElement('style');style.textContent=`.seller-photo-preview{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}.seller-photo-item{position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;background:#e9edf5;border:1px solid rgba(120,140,180,.2)}.seller-photo-item img{width:100%;height:100%;object-fit:cover}.seller-photo-item button{position:absolute;right:5px;top:5px;width:26px;height:26px;border:0;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;font-size:18px;line-height:26px;padding:0}.seller-photo-item small{position:absolute;left:5px;bottom:5px;padding:2px 6px;border-radius:6px;background:rgba(0,0,0,.65);color:#fff;font-size:10px}@media(max-width:420px){.seller-photo-preview{grid-template-columns:repeat(3,minmax(0,1fr))}}`;document.head.appendChild(style)}catch(_){ }
