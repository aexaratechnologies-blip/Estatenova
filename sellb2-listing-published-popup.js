(function(){
  'use strict';
  function ready(fn){
    if(typeof window.publish==='function' && window.st && typeof window.setPath==='function') return fn();
    setTimeout(function(){ready(fn)},100);
  }
  ready(function(){
    if(window.__sellb2ListingPublishedPopup)return;
    window.__sellb2ListingPublishedPopup=true;

    var originalPublish=window.publish;
    window.publish=async function(e){
      var before=window.st.route;
      await originalPublish(e);

      // A successful publish leaves /post. Failed validation/upload/database
      // errors keep the user on /post, so only show the success popup after
      // the publish flow actually navigated away.
      if(before==='/post' && window.st.route!=='/post'){
        document.querySelectorAll('.toast').forEach(function(x){x.remove()});
        showPublishedPopup();
      }
    };

    function showPublishedPopup(){
      var old=document.getElementById('sellb2-listing-published-popup');
      if(old)old.remove();

      var x=document.createElement('div');
      x.id='sellb2-listing-published-popup';
      x.setAttribute('role','status');
      x.setAttribute('aria-live','polite');
      x.innerHTML='<span class="sellb2-published-check">✓</span><span>Your listing published</span>';
      document.body.appendChild(x);

      requestAnimationFrame(function(){x.classList.add('show')});
      setTimeout(function(){
        x.classList.remove('show');
        setTimeout(function(){if(x.isConnected)x.remove()},250);
      },3500);
    }

    var style=document.createElement('style');
    style.textContent=''
      +'#sellb2-listing-published-popup{position:fixed;top:18px;left:50%;transform:translate(-50%,-18px) scale(.97);opacity:0;z-index:100000;display:flex;align-items:center;gap:10px;padding:13px 18px;border-radius:14px;background:#16a34a;color:#fff;font:700 14px/1.2 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 10px 30px rgba(22,163,74,.28);transition:opacity .2s ease,transform .2s ease;pointer-events:none;white-space:nowrap}'
      +'#sellb2-listing-published-popup.show{opacity:1;transform:translate(-50%,0) scale(1)}'
      +'.sellb2-published-check{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.2);font-size:15px;font-weight:900}'
      +'@media(max-width:420px){#sellb2-listing-published-popup{top:12px;font-size:13px;padding:12px 15px;max-width:calc(100vw - 24px)}}';
    document.head.appendChild(style);
  });
})();
