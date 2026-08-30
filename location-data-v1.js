/* EstateNova India location data v1 */
'use strict';

const EN_LOCATION_DISTRICTS_URL='https://raw.githubusercontent.com/KTBsomen/Indian-state-district-json/main/india-states-districts-latest.json';
const EN_LOCATION_CITIES_URL='https://raw.githubusercontent.com/nshntarora/Indian-Cities-JSON/master/cities.json';
const EN_LOCATION_FALLBACK_STATES=['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];

function enLocationWithTimeout(url,ms=7000){
  return Promise.race([
    fetch(url,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}),
    new Promise((_,reject)=>setTimeout(()=>reject(new Error('Location data timeout')),ms))
  ]);
}

window.estatenovaLocationReady=(async function(){
  let districtRows=[],cityRows=[];
  try{districtRows=await enLocationWithTimeout(EN_LOCATION_DISTRICTS_URL)}catch(e){console.warn('EstateNova district data unavailable',e)}
  try{cityRows=await enLocationWithTimeout(EN_LOCATION_CITIES_URL)}catch(e){console.warn('EstateNova city data unavailable',e)}

  const districtsByState={};
  (Array.isArray(districtRows)?districtRows:[]).forEach(row=>{
    const state=String(row?.state||'').trim();
    if(state)districtsByState[state]=[...new Set((row.districts||[]).map(x=>String(x).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'}));
  });
  const citiesByState={};
  (Array.isArray(cityRows)?cityRows:[]).forEach(row=>{
    const state=String(row?.state||'').trim(),city=String(row?.name||'').trim();
    if(state&&city)(citiesByState[state]??=[]).push(city);
  });
  Object.keys(citiesByState).forEach(s=>citiesByState[s]=[...new Set(citiesByState[s])].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'})));

  const states=[...new Set([...EN_LOCATION_FALLBACK_STATES,...Object.keys(districtsByState),...Object.keys(citiesByState)])].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'}));
  window.EN_LOCATION={states,districtsByState,citiesByState};
  return window.EN_LOCATION;
})();
