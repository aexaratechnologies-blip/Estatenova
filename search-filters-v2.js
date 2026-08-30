/* EstateNova Search & Filters v2 */
state.filters=state.filters||{propertyType:'All',listingType:'',state:'',district:'',city:'',locality:'',minPrice:'',maxPrice:'',minArea:'',maxArea:'',bedrooms:'',bathrooms:'',furnishing:'',parking:'',possession:'',facing:'',amenities:'',verified:false,featured:false};
state.filterOptions=state.filterOptions||{rows:[],loading:false,loaded:false};

function filterRows(){return state.filterOptions.rows||[]}
function uniqValues(key,rows=filterRows()){return [...new Set(rows.map(r=>String(r?.[key]??'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'}))}
function filterOptionList(key,value=''){return uniqValues(key).map(v=>`<option value="${esc(v)}" ${value===v?'selected':''}>${esc(v)}</option>`).join('')}
function filteredDistrictOptions(){return uniqValues('district',filterRows().filter(r=>!state.filters.state||String(r.state||'').trim()===state.filters.state))}
function filteredCityOptions(){return uniqValues('city',filterRows().filter(r=>(!state.filters.state||String(r.state||'').trim()===state.filters.state)&&(!state.filters.district||String(r.district||'').trim()===state.filters.district)))}
function filterSelect(id,label,value,options,extra=''){return `<label class="filterfield"><span>${label}</span><select id="${id}" class="field" ${extra}><option value="">Any</option>${options}</select></label>`}
function filterInput(id,label,value,placeholder,type='text'){return `<label class="filterfield"><span>${label}</span><input id="${id}" class="field" type="${type}" value="${esc(value||'')}" placeholder="${esc(placeholder||'')}"></label>`}

async function loadFilterOptions(){if(state.filterOptions.loading)return;if(state.filterOptions.loaded)return;state.filterOptions.loading=true;try{const {data,error}=await db.from('listings').select('state,district,city,locality,property_type,listing_type,furnishing,parking,bedrooms,bathrooms,possession,facing').eq('approval_status','approved').eq('status','active');if(error)throw error;state.filterOptions.rows=data||[];state.filterOptions.loaded=true}catch(e){console.error('filter options',e);toast('Could not load filter options')}finally{state.filterOptions.loading=false;if(state.route==='filters')render()}}
window.loadFilterOptions=loadFilterOptions;

function setFilter(id,value){if(id==='state'&&state.filters.state!==value){state.filters.state=value;state.filters.district='';state.filters.city=''}else if(id==='district'&&state.filters.district!==value){state.filters.district=value;state.filters.city=''}else state.filters[id]=value;render()}
window.setFilter=setFilter;
window.resetFilters=()=>{state.filters={propertyType:'All',listingType:'',state:'',district:'',city:'',locality:'',minPrice:'',maxPrice:'',minArea:'',maxArea:'',bedrooms:'',bathrooms:'',furnishing:'',parking:'',possession:'',facing:'',amenities:'',verified:false,featured:false};state.q='';state.filter='All';render()};
window.applyFilters=async()=>{const f=state.filters;state.filter=f.propertyType||'All';state.q=f.locality||'';await go('properties')};

async function loadListings(){state.loading=true;try{let q=db.from('listings').select('*').eq('approval_status','approved').eq('status','active').order('created_at',{ascending:false});const f=state.filters||{};if((f.propertyType||state.filter||'All')!=='All')q=q.eq('property_type',f.propertyType||state.filter);if(f.listingType)q=q.eq('listing_type',f.listingType);if(f.state)q=q.eq('state',f.state);if(f.district)q=q.eq('district',f.district);if(f.city)q=q.eq('city',f.city);if(f.locality)q=q.ilike('locality',`%${f.locality}%`);if(f.minPrice)q=q.gte('price',Number(f.minPrice));if(f.maxPrice)q=q.lte('price',Number(f.maxPrice));if(f.minArea)q=q.gte('area',Number(f.minArea));if(f.maxArea)q=q.lte('area',Number(f.maxArea));if(f.bedrooms)q=q.gte('bedrooms',Number(String(f.bedrooms).replace('+','')));if(f.bathrooms)q=q.gte('bathrooms',Number(String(f.bathrooms).replace('+','')));if(f.furnishing)q=q.eq('furnishing',f.furnishing);if(f.parking)q=q.ilike('parking',`%${f.parking}%`);if(f.possession)q=q.ilike('possession',`%${f.possession}%`);if(f.facing)q=q.eq('facing',f.facing);if(f.verified)q=q.eq('verified',true);if(f.featured)q=q.eq('featured',true);if(f.amenities){const tags=f.amenities.split(',').map(x=>x.trim()).filter(Boolean);if(tags.length)q=q.contains('amenities',tags)}const term=(state.q||'').trim();if(term){const safe=term.replace(/[,()]/g,' ');q=q.or(`title.ilike.%${safe}%,locality.ilike.%${safe}%,city.ilike.%${safe}%,district.ilike.%${safe}%,state.ilike.%${safe}%,address.ilike.%${safe}%`)}const {data,error}=await q;if(error)throw error;state.listings=data||[]}catch(e){console.error(e);toast('Properties could not be loaded')}finally{state.loading=false;if(['home','properties'].includes(state.route))render()}}
window.loadListings=loadListings;

function filters(){
 if(!state.filterOptions.loaded&&!state.filterOptions.loading)loadFilterOptions();
 const f=state.filters;
 const states=filterOptionList('state',f.state);
 const districts=filteredDistrictOptions().map(v=>`<option value="${esc(v)}" ${f.district===v?'selected':''}>${esc(v)}</option>`).join('');
 const cities=filteredCityOptions().map(v=>`<option value="${esc(v)}" ${f.city===v?'selected':''}>${esc(v)}</option>`).join('');
 const furnishing=filterOptionList('furnishing',f.furnishing);
 const parking=filterOptionList('parking',f.parking);
 const possession=filterOptionList('possession',f.possession);
 const facing=filterOptionList('facing',f.facing);
 const disabled=state.filterOptions.loading?'disabled':'';
 return `<main class="screen filterpage">${page('Search & Filters','properties')}<section class="filterbox">
 <div class="filtertop"><div><small>Find exactly what you want</small><h2>Property Search</h2></div><button class="filterreset" onclick="resetFilters()">Reset</button></div>
 <label>Property type</label><div class="chips wrap">${['All','Apartment','Villa','House','Land','Office'].map(x=>`<button class="${f.propertyType===x?'on':''}" onclick="setFilter('propertyType','${x}')">${x}</button>`).join('')}</div>
 <label>Listing type</label><div class="chips wrap">${[['','Any'],['sale','Buy'],['rent','Rent'],['lease','Lease']].map(x=>`<button class="${f.listingType===x[0]?'on':''}" onclick="setFilter('listingType','${x[0]}')">${x[1]}</button>`).join('')}</div>
 <div class="filtergrid">
 ${filterSelect('filterState','State',f.state,states,`onchange="setFilter('state',this.value)" ${disabled}`)}
 ${filterSelect('filterDistrict','District',f.district,districts,`onchange="setFilter('district',this.value)" ${disabled}`)}
 ${filterSelect('filterCity','City',f.city,cities,`onchange="setFilter('city',this.value)" ${disabled}`)}
 ${filterInput('filterLocality','Locality / Area',f.locality,'e.g. Kanke, Morabadi')}
 </div>
 <label>Budget</label><div class="budgetquick">${[[0,1000000,'Under ₹10 L'],[0,2500000,'Under ₹25 L'],[0,5000000,'Under ₹50 L'],[0,10000000,'Under ₹1 Cr'],[0,20000000,'Under ₹2 Cr']].map(x=>`<button onclick="state.filters.minPrice='';state.filters.maxPrice='${x[1]}';render()">${x[2]}</button>`).join('')}</div>
 <div class="filtergrid">${filterInput('filterMinPrice','Min budget',f.minPrice,'₹ 5,00,000','number')}${filterInput('filterMaxPrice','Max budget',f.maxPrice,'₹ 1,00,00,000','number')}</div>
 <div class="filtergrid">${filterInput('filterMinArea','Min area',f.minArea,'e.g. 500','number')}${filterInput('filterMaxArea','Max area',f.maxArea,'e.g. 5000','number')}</div>
 <div class="filtergrid">
 ${filterSelect('filterBedrooms','Bedrooms',f.bedrooms,['1','2','3','4','5','6+'].map(v=>`<option value="${v}" ${f.bedrooms===v?'selected':''}>${v}</option>`).join(''))}
 ${filterSelect('filterBathrooms','Bathrooms',f.bathrooms,['1','2','3','4','5+'].map(v=>`<option value="${v}" ${f.bathrooms===v?'selected':''}>${v}</option>`).join(''))}
 ${filterSelect('filterFurnishing','Furnishing',f.furnishing,furnishing)}
 ${filterSelect('filterParking','Parking',f.parking,parking)}
 ${filterSelect('filterPossession','Possession',f.possession,possession)}
 ${filterSelect('filterFacing','Facing',f.facing,facing)}
 </div>
 ${filterInput('filterAmenities','Amenities',f.amenities,'e.g. Lift, Gym, Swimming Pool')}
 <div class="togglegrid"><label class="toggleline"><input id="filterVerified" type="checkbox" ${f.verified?'checked':''}><span>Verified properties only</span></label><label class="toggleline"><input id="filterFeatured" type="checkbox" ${f.featured?'checked':''}><span>Featured properties only</span></label></div>
 ${state.filterOptions.loading?'<div class="filterloading">Loading available filter options…</div>':''}
 <button class="btn primary full" onclick="applyFilterForm()">Show Results</button>
 </section></main>`
}
window.applyFilterForm=async()=>{const f=state.filters;f.state=document.getElementById('filterState')?.value||'';f.district=document.getElementById('filterDistrict')?.value||'';f.city=document.getElementById('filterCity')?.value||'';f.locality=document.getElementById('filterLocality')?.value.trim()||'';f.minPrice=document.getElementById('filterMinPrice')?.value||'';f.maxPrice=document.getElementById('filterMaxPrice')?.value||'';f.minArea=document.getElementById('filterMinArea')?.value||'';f.maxArea=document.getElementById('filterMaxArea')?.value||'';f.bedrooms=document.getElementById('filterBedrooms')?.value||'';f.bathrooms=document.getElementById('filterBathrooms')?.value||'';f.furnishing=document.getElementById('filterFurnishing')?.value||'';f.parking=document.getElementById('filterParking')?.value||'';f.possession=document.getElementById('filterPossession')?.value||'';f.facing=document.getElementById('filterFacing')?.value||'';f.amenities=document.getElementById('filterAmenities')?.value.trim()||'';f.verified=!!document.getElementById('filterVerified')?.checked;f.featured=!!document.getElementById('filterFeatured')?.checked;state.q=f.locality||'';state.filter=f.propertyType||'All';await go('properties')};

try{const style=document.createElement('style');style.textContent=`
.filterpage .filterbox{max-width:720px;margin:0 auto 110px}.filtertop{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.filtertop h2{margin:4px 0 0;font-size:22px}.filtertop small{opacity:.7}.filterreset{border:1px solid rgba(120,140,180,.35);background:transparent;border-radius:12px;padding:9px 14px;font-weight:700}.filtergrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.filterfield{display:block}.filterfield>span{display:block;font-size:13px;font-weight:700;margin:0 0 7px}.budgetquick{display:flex;gap:8px;overflow:auto;padding:2px 0 10px}.budgetquick button{white-space:nowrap;border:1px solid rgba(120,140,180,.35);background:transparent;border-radius:999px;padding:9px 12px;font-weight:700}.togglegrid{display:grid;gap:10px;margin:14px 0}.toggleline{display:flex!important;align-items:center;gap:10px;padding:12px 14px;border:1px solid rgba(120,140,180,.22);border-radius:14px}.toggleline input{width:18px;height:18px}.filterloading{font-size:13px;opacity:.7;padding:8px 0}.filterbox .field:disabled{opacity:.55}@media(max-width:520px){.filtergrid{grid-template-columns:1fr}.filtertop h2{font-size:20px}}
`;document.head.appendChild(style)}catch(_){ }
