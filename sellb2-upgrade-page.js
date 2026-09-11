(function(){
  'use strict';
  if(window.__sellb2UpgradePageV1)return;
  window.__sellb2UpgradePageV1=true;

  const plans=[
    {id:'free',name:'Free',price:'₹0',period:'forever',tag:'For everyone',features:['5 listings total','Search properties, vehicles & businesses','Basic filters & listing details','Chat and direct enquiries','Save listings','Basic profile','Standard listing visibility'],action:'Current plan',muted:true},
    {id:'owner',name:'Owner Plus',price:'₹149',period:'/month',tag:'For individual owners',features:['Unlimited listings after the free 5','More photos & richer listing details','Listing views & basic analytics','Priority listing visibility','Listing refresh tools','Direct buyer enquiries','Owner profile'],action:'Upgrade to ₹149'},
    {id:'pro',name:'Pro Broker',price:'₹499',period:'/month',tag:'For brokers & agents',popular:true,features:['Everything in Owner Plus','Up to 25 active listings','Lead management dashboard','Advanced listing analytics','Priority ranking','Boost credits','Professional agent profile','Faster support'],action:'Choose Pro'},
    {id:'business',name:'Business',price:'₹999',period:'/month',tag:'For property businesses',features:['Everything in Pro Broker','Up to 100 active listings','Team members & lead assignment','Business profile','Lead pipeline / CRM tools','Advanced performance reports','More monthly boost credits','Priority support'],action:'Choose Business'},
    {id:'builder',name:'Builder',price:'₹2,499',period:'/month',tag:'For builders & developers',features:['Everything in Business','Up to 250 active listings / inventory','Project & development profiles','Multiple team accounts','Project-level analytics','Featured project placement credits','High-volume lead management','Dedicated support'],action:'Choose Builder'}
  ];

  const boosts=[
    {name:'Quick Boost',price:'₹49',detail:'24 hours of priority visibility'},
    {name:'48-Hour Boost',price:'₹99',detail:'2 days of priority visibility'},
    {name:'Weekly Boost',price:'₹199',detail:'7 days of priority visibility'},
    {name:'Featured Listing',price:'₹299',detail:'7 days as a featured listing'}
  ];

  function esc(v){return String(v??'').replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
  function upgradePage(){
    return '<main class="screen sellb2-upgrade-page">'+
      '<header class="appbar"><button class="brand" id="upgradeHomeBtn"><span class="brandmark">SELL<span>B2</span></span></button><div class="topactions"><button class="themeMini" id="upgradeThemeBtn">◐</button><button class="signin" id="upgradeProfileBtn">Profile</button></div></header>'+
      '<div class="pagehead"><button class="back" id="upgradeBackBtn">‹</button><h1>Upgrade SELLB2</h1><button class="more" id="upgradeMenuBtn">☰</button></div>'+
      '<section class="upgrade-hero"><span class="upgrade-kicker">SELLB2 MEMBERSHIP</span><h2>Grow your listings.<br><em>Get more buyers.</em></h2><p>Start free with 5 listings. Upgrade whenever you need more listings, better visibility or business tools.</p><div class="upgrade-note"><b>Simple pricing.</b><span>No subscription is required to browse or make your first 5 listings.</span></div></section>'+
      '<section class="upgrade-section"><div class="upgrade-section-head"><div><small>CHOOSE YOUR PLAN</small><h2>Plans for every seller</h2></div><span class="gst-note">Prices shown before applicable taxes</span></div><div class="upgrade-plans">'+plans.map(function(p){return '<article class="upgrade-plan '+(p.popular?'popular ':'')+(p.muted?'free-plan':'')+'">'+(p.popular?'<div class="popular-badge">MOST POPULAR</div>':'')+'<div class="plan-top"><div><h3>'+esc(p.name)+'</h3><p>'+esc(p.tag)+'</p></div><div class="plan-price"><strong>'+esc(p.price)+'</strong><span>'+esc(p.period)+'</span></div></div><div class="plan-divider"></div><ul>'+p.features.map(function(f){return '<li><b>✓</b>'+esc(f)+'</li>'}).join('')+'</ul><button class="btn '+(p.id==='free'?'ghost':'primary')+' full upgrade-plan-btn" data-plan="'+p.id+'" '+(p.muted?'disabled':'')+'>'+esc(p.action)+'</button></article>'}).join('')+'</div></section>'+
      '<section class="upgrade-section boost-section"><div class="upgrade-section-head"><div><small>OPTIONAL ADD-ONS</small><h2>Boost a listing</h2></div><span class="gst-note">Buy only when you need extra visibility</span></div><p class="section-copy">No subscription? No problem. You can purchase a one-time boost for an individual listing.</p><div class="boost-grid">'+boosts.map(function(b){return '<article class="boost-card"><div class="boost-icon">↗</div><div><h3>'+esc(b.name)+'</h3><p>'+esc(b.detail)+'</p></div><strong>'+esc(b.price)+'</strong><button class="boost-btn" data-boost="'+esc(b.name)+'">Buy</button></article>'}).join('')+'</div></section>'+
      '<section class="upgrade-section compare-section"><div class="upgrade-section-head"><div><small>AT A GLANCE</small><h2>What do you get?</h2></div></div><div class="compare-wrap"><table><thead><tr><th>Feature</th><th>Free</th><th>₹149</th><th>₹499</th><th>₹999</th><th>₹2,499</th></tr></thead><tbody>'+[
        ['Listings','5 total','Unlimited','25 active','100 active','250 active'],
        ['Basic search & filters','✓','✓','✓','✓','✓'],
        ['Chat & enquiries','✓','✓','✓','✓','✓'],
        ['Listing analytics','—','✓','✓','✓','✓'],
        ['Priority visibility','—','✓','✓','✓','✓'],
        ['Lead management','—','Basic','Advanced','Advanced','Advanced'],
        ['Team / CRM','—','—','—','✓','✓'],
        ['Project tools','—','—','—','—','✓'],
        ['Boost credits','—','Optional','✓','More','Highest']
      ].map(function(r){return '<tr>'+r.map(function(c,i){return '<td class="'+(i===0?'feature-cell':'')+'">'+esc(c)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div></section>'+
      '<section class="upgrade-faq"><h2>Before you upgrade</h2><div class="faq-grid"><div><b>Can I stay free?</b><p>Yes. You can browse SELLB2 and publish up to 5 listings without a subscription.</p></div><div><b>What happens after 5 listings?</b><p>You can still use your account, but publishing additional listings requires an upgrade.</p></div><div><b>Can I buy a boost without a plan?</b><p>Yes. Boosts are separate one-time add-ons for sellers who want extra visibility.</p></div><div><b>Can I change plans later?</b><p>Yes. The plan and billing flow can be changed from your account once payments are enabled.</p></div></div></section>'+
      '</main>';
  }

  function toast(msg){let x=document.createElement('div');x.className='toast';x.textContent=msg;document.body.appendChild(x);setTimeout(function(){x.remove()},2600)}
  function wire(){
    const go=window.setPath;
    document.getElementById('upgradeHomeBtn')?.addEventListener('click',function(){if(typeof go==='function')go('/')});
    document.getElementById('upgradeBackBtn')?.addEventListener('click',function(){history.back()});
    document.getElementById('upgradeProfileBtn')?.addEventListener('click',function(){if(typeof go==='function')go(window.st&&window.st.user?'/profile':'/auth')});
    document.getElementById('upgradeThemeBtn')?.addEventListener('click',function(){if(typeof window.toggleTheme==='function')window.toggleTheme()});
    document.querySelectorAll('.upgrade-plan-btn:not([disabled])').forEach(function(btn){btn.addEventListener('click',function(){toast('Payment setup will be connected next. '+btn.textContent.trim()+' selected.')})});
    document.querySelectorAll('.boost-btn').forEach(function(btn){btn.addEventListener('click',function(){toast('Boost purchase flow will be connected next. '+btn.dataset.boost+' selected.')})});
  }
  function renderUpgrade(){
    const root=document.getElementById('app');
    if(!root)return;
    root.innerHTML=upgradePage();
    document.documentElement.classList.add('sellb2-upgrade-active');
    wire();
    window.scrollTo(0,0);
  }
  function install(){
    if(typeof window.setPath!=='function'){setTimeout(install,50);return}
    if(window.__sellb2UpgradeInstalled)return;
    window.__sellb2UpgradeInstalled=true;
    const original=window.setPath;
    window.setPath=function(path){
      if(path==='/upgrade'){history.pushState({},'',path);if(window.st)window.st.route=path;renderUpgrade();return;}
      document.documentElement.classList.remove('sellb2-upgrade-active');
      return original(path);
    };
    window.addEventListener('popstate',function(){if(location.pathname==='/upgrade')renderUpgrade();else document.documentElement.classList.remove('sellb2-upgrade-active')});
    if(location.pathname==='/upgrade')renderUpgrade();
    console.info('SELLB2 upgrade page installed');
  }
  install();
})();
