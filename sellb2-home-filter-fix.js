/* SELLB2 home search/filter repair v9 — filter opens as a clean route load so it cannot lock the current SPA. */
(function(){
  'use strict';
  const started=Date.now();
  function ready(){return !!window.st&&!!window.db&&typeof window.render==='function';}
  function wait(){if(ready())install();else if(Date.now()-started<20000)setTimeout(wait,50);}
  function safeSearchValue(value){return String(value||'').trim().replace(/\\/g,' ').replace(/["*%,.():]/g,' ').replace(/\s+/g,' ').slice(0,120);}
  function targetPath(){return window.st.cat==='vehicle'?'/vehicles':window.st.cat==='business'?'/businesses':'/properties';}
  let requestNo=0,activeRequest=null;

  function install(){
    if(window.__sellb2SearchFilterRepairInstalled)return;
    window.__sellb2SearchFilterRepairInstalled=true;

    window.load=async function(){
      const seq=++requestNo,s=window.st;
      if(!s||!window.db)return;
      const signature=JSON.stringify({cat:s.cat,type:s.type,state:s.state,district:s.district,city:s.city,locality:s.locality,min:s.min,max:s.max,furnishing:s.furnishing,parking:s.parking,possession:s.possession,facing:s.facing,condition:s.condition,year:s.year,wheels:s.wheels,registered:s.registered});
      if(activeRequest&&activeRequest.signature===signature)return activeRequest.promise;
      const run=(async()=>{
        try{
          let q=window.db.from('listings').select('*').eq('status','active').eq('approval_status','approved').order('created_at',{ascending:false}).limit(200);
          if(s.cat!=='all')q=q.eq('category',s.cat);
          if(s.type!=='all'){if(s.cat==='property')q=q.eq('property_type',s.type);else if(s.cat==='vehicle')q=q.contains('details',{vehicle_type:s.type});else if(s.cat==='business')q=q.contains('details',{business_type:s.type});}
          if(s.state)q=q.eq('state',s.state);if(s.district)q=q.eq('district',s.district);if(s.city)q=q.eq('city',s.city);
          if(s.min&&Number.isFinite(+s.min))q=q.gte('price',+s.min);if(s.max&&Number.isFinite(+s.max))q=q.lte('price',+s.max);
          if(s.furnishing)q=q.eq('furnishing',s.furnishing);if(s.parking)q=q.eq('parking',s.parking);if(s.possession)q=q.eq('possession',s.possession);if(s.facing)q=q.eq('facing',s.facing);
          if(s.condition)q=q.contains('details',{condition:s.condition});
          if(s.year&&s.cat==='vehicle'&&Number.isFinite(+s.year))q=q.contains('details',{model_year:+s.year});
          if(s.year&&s.cat==='business'&&Number.isFinite(+s.year))q=q.contains('details',{established_year:+s.year});
          if(s.wheels&&Number.isFinite(+s.wheels))q=q.contains('details',{wheels:+s.wheels});
          if(s.registered)q=q.contains('details',{registered:s.registered});
          const text=safeSearchValue(s.locality);
          if(text){const pattern=`*${text}*`;q=q.or(`title.ilike.${pattern},locality.ilike.${pattern},city.ilike.${pattern},district.ilike.${pattern},state.ilike.${pattern}`);}
          const timeout=new Promise(resolve=>setTimeout(()=>resolve({timeout:true}),10000));
          const result=await Promise.race([q,timeout]);
          if(result&&result.timeout){if(seq===requestNo)window.toast?.('Search is taking too long. Please try again.');return;}
          if(result.error)throw result.error;
          if(seq!==requestNo)return;
          s.items=result.data||[];
          await Promise.resolve(window.render());
        }catch(err){
          console.error('SELLB2 search/filter query failed:',err);
          if(seq===requestNo)window.toast?.('Search/filter could not be completed. Please try again.');
        }
      })();
      activeRequest={signature,promise:run};
      try{return await run}finally{if(activeRequest?.promise===run)activeRequest=null;}
    };

    function navigate(path){
      path=String(path||'/');
      if(typeof window.__sellb2Navigate==='function')return window.__sellb2Navigate(path);
      if(typeof window.setPath==='function')return window.setPath(path);
      history.pushState({},'',path);window.st.route=path;Promise.resolve(window.render()).catch(e=>console.error(e));
    }

    window.__sellb2RunSearch=async function(){
      const input=document.querySelector('.homehero .searchbar input');
      if(input)window.st.locality=input.value||'';
      window.st.cat='all';window.st.type='all';
      navigate('/properties');
      return window.load();
    };

    /* Filter is intentionally a full route navigation. The filter screen itself is already
       rendered by SELLB2 at /filters; reloading the route isolates it from any stale home-DOM
       event state and prevents the home screen from becoming unresponsive. */
    window.__sellb2OpenFilters=function(){
      try{
        const s=window.st;
        if(s){
          try{sessionStorage.setItem('sellb2_filter_state',JSON.stringify({cat:s.cat,type:s.type,state:s.state,district:s.district,city:s.city,locality:s.locality,min:s.min,max:s.max,furnishing:s.furnishing,parking:s.parking,possession:s.possession,facing:s.facing,condition:s.condition,year:s.year,wheels:s.wheels,registered:s.registered}));}catch(_){ }
        }
        window.location.assign('/filters');
      }catch(err){
        console.error('SELLB2 filter navigation failed:',err);
        try{window.location.href='/filters';}catch(_){window.toast?.('Filters could not be opened. Please try again.');}
      }
    };
    window.__sellb2Sell=function(){navigate('/post');};

    window.applyFilters=async function(){
      const s=window.st;
      if(s.min&&s.max&&Number(s.min)>Number(s.max)){window.toast?.('Minimum budget cannot be greater than maximum budget.');return;}
      s.type=s.type||'all';
      navigate(targetPath());
      await window.load();
    };
    window.resetFilters=function(){
      Object.assign(window.st,{cat:'all',type:'all',state:'',district:'',city:'',locality:'',min:'',max:'',furnishing:'',parking:'',possession:'',facing:'',condition:'',year:'',wheels:'',registered:''});
      Promise.resolve(window.render()).catch(e=>console.error(e));
    };

    function bindHomeControls(){
      const home=document.querySelector('.homehero');
      if(!home)return;
      const searchInput=home.querySelector('.searchbar input');
      const filterButton=home.querySelector('.searchbar button');
      const searchButton=home.querySelector('.heroactions .btn.primary');
      const sellButton=home.querySelector('.heroactions .btn.ghost');

      [filterButton,searchButton,sellButton].forEach(el=>{if(el)el.removeAttribute('onclick');});
      if(searchInput){
        searchInput.removeAttribute('oninput');
        searchInput.removeAttribute('onkeydown');
        if(searchInput.dataset.sellb2Bound!=='1'){
          searchInput.addEventListener('input',function(){window.st.locality=this.value||'';});
          searchInput.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();window.__sellb2RunSearch();}});
          searchInput.dataset.sellb2Bound='1';
        }
      }

      function bind(el,fn){
        if(!el||el.dataset.sellb2Bound==='1')return;
        const invoke=function(ev){
          ev.preventDefault();ev.stopPropagation();
          const now=Date.now();
          if(el.dataset.sellb2Last && now-Number(el.dataset.sellb2Last)<500)return;
          el.dataset.sellb2Last=String(now);
          Promise.resolve(fn()).catch(e=>{console.error('SELLB2 control failed:',e);window.toast?.('Please try again.');});
        };
        el.addEventListener('click',invoke,false);
        if(window.PointerEvent)el.addEventListener('pointerup',invoke,false);
        el.dataset.sellb2Bound='1';
      }
      bind(filterButton,window.__sellb2OpenFilters);
      bind(searchButton,window.__sellb2RunSearch);
      bind(sellButton,window.__sellb2Sell);
    }

    bindHomeControls();
    const observer=new MutationObserver(function(){bindHomeControls();});
    observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});

    const style=document.createElement('style');
    style.textContent=`
      .homehero .searchbar,.homehero .heroactions{position:relative;z-index:20;pointer-events:auto!important}
      .homehero .searchbar input,.homehero .searchbar button,.homehero .heroactions button{position:relative;z-index:21;pointer-events:auto!important;touch-action:manipulation}
    `;
    document.head.appendChild(style);
    console.info('SELLB2 search/filter repair v9 installed');
  }
  wait();
})();
