(function(){
  'use strict';
  const boot=Date.now();

  function locationData(){
    const x=window.EN_LOCATION;
    return x&&Array.isArray(x.states)&&x.districtsByState&&x.citiesByState?x:null;
  }

  function aliases(state){
    const a={
      'Orissa':'Odisha',
      'Uttaranchal':'Uttarakhand',
      'Pondicherry':'Puducherry',
      'NCT of Delhi':'Delhi',
      'Jammu & Kashmir':'Jammu and Kashmir',
      'Andaman & Nicobar Islands':'Andaman and Nicobar Islands',
      'Dadra and Nagar Haveli':'Dadra and Nagar Haveli and Daman and Diu'
    };
    return a[state]||state;
  }

  function selects(){
    const box=document.querySelector('.filterbox');
    if(!box)return null;
    const grid=box.querySelector('.grid2');
    if(!grid)return null;
    const s=grid.querySelectorAll('select');
    return {state:s[0]||null,district:s[1]||null,city:s[2]||null};
  }

  function option(select,value,label,selected){
    const o=document.createElement('option');
    o.value=value;o.textContent=label;
    if(selected)o.selected=true;
    select.appendChild(o);
  }

  function populate(){
    if(location.pathname!=='/filters')return;
    const data=locationData();
    const el=selects();
    if(!data||!el)return;
    const state=String(window.st?.state||el.state?.value||'').trim();
    if(el.state && el.state.dataset.locationFix!=='1'){
      el.state.dataset.locationFix='1';
      el.state.addEventListener('change',function(e){
        e.preventDefault();e.stopImmediatePropagation();
        const value=this.value;
        if(window.st){window.st.state=value;window.st.district='';window.st.city='';}
        fillChildren(value);
      },true);
    }
    fillChildren(state);
  }

  function fillChildren(state){
    const data=locationData(),el=selects();
    if(!data||!el)return;
    const key=aliases(String(state||'').trim());
    const districts=data.districtsByState[key]||data.districtsByState[state]||[];
    const cities=data.citiesByState[key]||data.citiesByState[state]||[];
    const selectedDistrict=window.st?.district||'';
    const selectedCity=window.st?.city||'';
    if(el.district){
      el.district.innerHTML='';
      option(el.district,'','Any district',!selectedDistrict);
      districts.forEach(x=>option(el.district,x,x,x===selectedDistrict));
      el.district.disabled=!state||districts.length===0;
      el.district.onchange=function(){if(window.st){window.st.district=this.value;window.st.city='';}fillCities(key||state);};
    }
    if(el.city){
      el.city.innerHTML='';
      option(el.city,'','Any city',!selectedCity);
      cities.forEach(x=>option(el.city,x,x,x===selectedCity));
      el.city.disabled=!state||cities.length===0;
      el.city.onchange=function(){if(window.st)window.st.city=this.value;};
    }
  }

  function install(){
    if(window.__sellb2LocationFixInstalled)return;
    window.__sellb2LocationFixInstalled=true;
    const originalRender=window.render;
    if(typeof originalRender==='function'){
      window.render=async function(){
        const r=await originalRender.apply(this,arguments);
        setTimeout(populate,0);
        return r;
      };
    }
    document.addEventListener('change',function(e){
      const t=e.target;
      if(t&&t.matches&&t.matches('.filterbox .grid2 select:first-child')){
        setTimeout(populate,0);
      }
    },true);
    const mo=new MutationObserver(function(){populate()});
    mo.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
    populate();
  }

  (function wait(){
    if(typeof window.render==='function'&&window.st)install();
    else if(Date.now()-boot<20000)setTimeout(wait,50);
  })();
})();
