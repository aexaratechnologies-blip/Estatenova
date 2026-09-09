/* SELLB2 home/search/filter control repair v11.
   Filter navigation is handled centrally and never performs a document reload. */
(function(){
  'use strict';
  const started=Date.now();

  function ready(){
    return !!window.st && !!window.db && typeof window.render==='function';
  }

  function wait(){
    if(ready()) install();
    else if(Date.now()-started<20000) setTimeout(wait,50);
  }

  function safeSearchValue(value){
    return String(value||'')
      .trim()
      .replace(/\\/g,' ')
      .replace(/["*%,.():]/g,' ')
      .replace(/\s+/g,' ')
      .slice(0,120);
  }

  function targetPath(){
    const s=window.st||{};
    return s.cat==='vehicle'?'/vehicles':s.cat==='business'?'/businesses':'/properties';
  }

  function filterState(){
    const s=window.st||{};
    return {
      cat:s.cat,type:s.type,state:s.state,district:s.district,city:s.city,
      locality:s.locality,min:s.min,max:s.max,furnishing:s.furnishing,
      parking:s.parking,possession:s.possession,facing:s.facing,
      condition:s.condition,year:s.year,wheels:s.wheels,registered:s.registered
    };
  }

  function saveFilterState(){
    try{ sessionStorage.setItem('sellb2_filter_state',JSON.stringify(filterState())); }
    catch(_){ }
  }

  let requestNo=0;
  let activeRequest=null;

  async function runLoad(){
    const seq=++requestNo;
    const s=window.st;
    if(!s||!window.db) return;

    const signature=JSON.stringify(filterState());
    if(activeRequest&&activeRequest.signature===signature) return activeRequest.promise;

    const run=(async()=>{
      try{
        let q=window.db.from('listings')
          .select('*')
          .eq('status','active')
          .eq('approval_status','approved')
          .order('created_at',{ascending:false})
          .limit(200);

        if(s.cat!=='all') q=q.eq('category',s.cat);
        if(s.type!=='all'){
          if(s.cat==='property') q=q.eq('property_type',s.type);
          else if(s.cat==='vehicle') q=q.contains('details',{vehicle_type:s.type});
          else if(s.cat==='business') q=q.contains('details',{business_type:s.type});
        }
        if(s.state) q=q.eq('state',s.state);
        if(s.district) q=q.eq('district',s.district);
        if(s.city) q=q.eq('city',s.city);
        if(s.min&&Number.isFinite(+s.min)) q=q.gte('price',+s.min);
        if(s.max&&Number.isFinite(+s.max)) q=q.lte('price',+s.max);
        if(s.furnishing) q=q.eq('furnishing',s.furnishing);
        if(s.parking) q=q.eq('parking',s.parking);
        if(s.possession) q=q.eq('possession',s.possession);
        if(s.facing) q=q.eq('facing',s.facing);
        if(s.condition) q=q.contains('details',{condition:s.condition});
        if(s.year&&s.cat==='vehicle'&&Number.isFinite(+s.year)) q=q.contains('details',{model_year:+s.year});
        if(s.year&&s.cat==='business'&&Number.isFinite(+s.year)) q=q.contains('details',{established_year:+s.year});
        if(s.wheels&&Number.isFinite(+s.wheels)) q=q.contains('details',{wheels:+s.wheels});
        if(s.registered) q=q.contains('details',{registered:s.registered});

        const text=safeSearchValue(s.locality);
        if(text){
          const pattern=`*${text}*`;
          q=q.or(`title.ilike.${pattern},locality.ilike.${pattern},city.ilike.${pattern},district.ilike.${pattern},state.ilike.${pattern}`);
        }

        const timeout=new Promise(resolve=>setTimeout(()=>resolve({__timeout:true}),10000));
        const result=await Promise.race([q,timeout]);
        if(result&&result.__timeout){
          if(seq===requestNo) window.toast?.('Search is taking too long. Please try again.');
          return;
        }
        if(result.error) throw result.error;
        if(seq!==requestNo) return;

        s.items=result.data||[];
        if(typeof window.render==='function') await Promise.resolve(window.render());
      }catch(err){
        console.error('SELLB2 search/filter query failed:',err);
        if(seq===requestNo) window.toast?.('Search/filter could not be completed. Please try again.');
      }
    })();

    activeRequest={signature,promise:run};
    try{return await run}
    finally{if(activeRequest&&activeRequest.promise===run) activeRequest=null;}
  }

  function navigate(path){
    path=String(path||'/');
    if(typeof window.__sellb2Navigate==='function') return window.__sellb2Navigate(path);
    if(typeof window.setPath==='function') return window.setPath(path);

    const s=window.st;
    if(!s) throw new Error('SELLB2 application state is not ready');
    history.pushState({},'',path);
    s.route=path;
    return Promise.resolve(window.render());
  }

  function openFilters(){
    const s=window.st;
    if(!s||typeof window.render!=='function'){
      console.error('SELLB2 filter navigation attempted before app was ready');
      window.toast?.('Filters are still loading. Please try again.');
      return;
    }

    saveFilterState();

    try{
      /* Prefer the application's own SPA router. This is important: it updates the
         route and renders /filters without restarting index.html or the splash screen. */
      return navigate('/filters');
    }catch(err){
      console.error('SELLB2 filter navigation failed:',err);
      window.toast?.('Filters could not be opened. Please try again.');
    }
  }

  function runSearch(){
    const s=window.st;
    if(!s) return;
    const input=document.querySelector('.homehero .searchbar input');
    if(input) s.locality=input.value||'';
    s.cat='all';
    s.type='all';
    return Promise.resolve(navigate('/properties')).then(()=>runLoad());
  }

  function sell(){ return navigate('/post'); }

  function install(){
    if(window.__sellb2SearchFilterRepairInstalledV11) return;
    window.__sellb2SearchFilterRepairInstalledV11=true;

    /* Keep the public functions used by the existing filter page. */
    window.load=runLoad;
    window.__sellb2RunSearch=runSearch;
    window.__sellb2OpenFilters=openFilters;
    window.__sellb2Sell=sell;

    window.applyFilters=async function(){
      const s=window.st;
      if(!s) return;
      if(s.min&&s.max&&Number(s.min)>Number(s.max)){
        window.toast?.('Minimum budget cannot be greater than maximum budget.');
        return;
      }
      s.type=s.type||'all';
      await Promise.resolve(navigate(targetPath()));
      return runLoad();
    };

    window.resetFilters=function(){
      const s=window.st;
      if(!s) return;
      Object.assign(s,{
        cat:'all',type:'all',state:'',district:'',city:'',locality:'',min:'',max:'',
        furnishing:'',parking:'',possession:'',facing:'',condition:'',year:'',wheels:'',registered:''
      });
      saveFilterState();
      return Promise.resolve(window.render());
    };

    /* One delegated capture handler is intentionally used instead of attaching click
       + pointerup to every home button. It survives SPA re-renders and prevents the
       old inline onclick from firing a second navigation. */
    document.addEventListener('click',function(ev){
      const el=ev.target&&ev.target.closest?ev.target.closest('button'):null;
      if(!el) return;

      if(el.matches('.homehero .searchbar button,.searchbar.compact button')){
        ev.preventDefault();
        ev.stopImmediatePropagation();
        openFilters();
        return;
      }

      if(el.matches('.homehero .heroactions .btn.primary')){
        ev.preventDefault();
        ev.stopImmediatePropagation();
        runSearch();
        return;
      }

      if(el.matches('.homehero .heroactions .btn.ghost')){
        ev.preventDefault();
        ev.stopImmediatePropagation();
        sell();
      }
    },true);

    /* Remove stale inline handlers from the current DOM. The delegated handler above
       remains the source of truth after every render. */
    function cleanCurrentHome(){
      document.querySelectorAll('.homehero .searchbar button,.searchbar.compact button').forEach(el=>el.removeAttribute('onclick'));
      document.querySelectorAll('.homehero .heroactions .btn.primary,.homehero .heroactions .btn.ghost').forEach(el=>el.removeAttribute('onclick'));
    }
    cleanCurrentHome();

    const observer=new MutationObserver(cleanCurrentHome);
    observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});

    const style=document.createElement('style');
    style.textContent=`
      .homehero .searchbar,.homehero .heroactions{position:relative;z-index:20;pointer-events:auto!important}
      .homehero .searchbar input,.homehero .searchbar button,.homehero .heroactions button{position:relative;z-index:21;pointer-events:auto!important;touch-action:manipulation}
      .searchbar.compact button{position:relative;z-index:21;pointer-events:auto!important;touch-action:manipulation}
    `;
    document.head.appendChild(style);

    console.info('SELLB2 search/filter repair v11 installed');
  }

  wait();
})();
