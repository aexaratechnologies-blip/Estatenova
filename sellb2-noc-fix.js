(function(){
  'use strict';
  function esc(v){return String(v??'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function install(){
    if(window.__sellb2NocFixInstalled||!window.db||!window.st)return;
    window.__sellb2NocFixInstalled=true;
    try{
      var originalFrom=window.db.from.bind(window.db);
      window.db.from=function(table){
        var q=originalFrom(table);
        if(table!=='listings')return q;
        var originalInsert=q.insert.bind(q);
        q.insert=function(values){
          var noc=document.getElementById('vehicle-noc');
          var val=noc&&noc.checked?noc.value:'';
          if(val==='yes'||val==='no'){
            var patch=function(row){
              row=row&&typeof row==='object'?row:{};
              row.details=Object.assign({},row.details||{}, {noc_available:val});
              return row;
            };
            values=Array.isArray(values)?values.map(patch):patch(values);
          }
          return originalInsert(values);
        };
        return q;
      };
    }catch(e){console.warn('SELLB2 NOC db patch:',e)}
    if(typeof window.publish==='function'&&!window.__sellb2NocPublishWrapped){
      window.__sellb2NocPublishWrapped=true;
      var originalPublish=window.publish;
      window.publish=async function(e){
        if(location.pathname==='/post'&&String(window.st.postCat||'property')==='vehicle'){
          var checked=document.querySelector('input[name="vehicle_noc"]:checked');
          if(!checked){if(typeof window.toast==='function')window.toast('Please select whether the vehicle NOC is available.');else alert('Please select whether the vehicle NOC is available.');return false;}
        }
        return originalPublish(e);
      };
    }
    function isVehiclePost(){return location.pathname==='/post'&&String(window.st.postCat||'property')==='vehicle'}
    function addField(){
      if(!isVehiclePost())return;
      var file=document.querySelector('input[type=file]');if(!file)return;
      var host=file.closest('label')||file.parentElement;if(!host||document.getElementById('vehicle-noc'))return;
      var box=document.createElement('div');box.className='vehicle-noc-box';
      box.innerHTML='<div class="vehicle-noc-label"><span><b>NOC Status</b><small>Is the vehicle NOC available?</small></span><span class="vehicle-noc-options"><label><input id="vehicle-noc" type="radio" name="vehicle_noc" value="yes"> Yes — NOC available</label><label><input type="radio" name="vehicle_noc" value="no"> No — NOC not available</label></span></div>';
      host.parentNode.insertBefore(box,host);
    }
    function getNoc(p){var d=p&&p.details||{};return d.noc_available==='yes'?'Available':d.noc_available==='no'?'Not available':''}
    function renderNocBadges(){
      if(!window.st||!Array.isArray(window.st.items))return;
      document.querySelectorAll('.property-card').forEach(function(card){
        var onclick=card.getAttribute('onclick')||'',m=onclick.match(/\/listing\/([^']+)/);if(!m)return;
        var p=window.st.items.find(function(x){return String(x.id)===String(m[1])});if(!p||p.category!=='vehicle')return;
        var noc=getNoc(p),body=card.querySelector('.pc-body');if(!noc||!body||body.querySelector('.vehicle-noc-status'))return;
        var el=document.createElement('div');el.className='vehicle-noc-status '+(noc==='Available'?'yes':'no');el.textContent='NOC: '+noc;body.insertBefore(el,body.querySelector('.stats')||null);
      });
      var detail=document.querySelector('.detailpage');if(detail&&!detail.querySelector('.vehicle-noc-detail')){
        var id=location.pathname.split('/')[2]||'',p=window.st.items.find(function(x){return String(x.id)===String(id)});
        if(p&&p.category==='vehicle'){var noc=getNoc(p),target=detail.querySelector('h1,h2,h3');if(noc&&target){var el=document.createElement('div');el.className='vehicle-noc-detail '+(noc==='Available'?'yes':'no');el.textContent='NOC: '+noc;target.parentNode.insertBefore(el,target.nextSibling)}}
      }
    }
    var style=document.createElement('style');style.textContent='.vehicle-noc-box{margin:14px 0;padding:15px;border:1px solid var(--line,#dbe2ea);border-radius:18px;background:var(--surface,#fff)}.vehicle-noc-label{display:flex;flex-direction:column;gap:10px}.vehicle-noc-label>span:first-child{display:flex;flex-direction:column;gap:3px}.vehicle-noc-label small{font-size:11px;color:var(--muted,#687386)}.vehicle-noc-options{display:flex!important;flex-wrap:wrap;gap:9px}.vehicle-noc-options label{display:flex;align-items:center;gap:6px;padding:9px 11px;border:1px solid var(--line,#dbe2ea);border-radius:12px;font-size:12px;font-weight:700}.vehicle-noc-options input{accent-color:#18733a}.vehicle-noc-status,.vehicle-noc-detail{display:inline-flex;align-items:center;width:max-content;padding:5px 9px;border-radius:999px;font-size:10px;font-weight:850;letter-spacing:.2px;margin-top:7px}.vehicle-noc-status.yes,.vehicle-noc-detail.yes{background:#e8f7ed;color:#18733a}.vehicle-noc-status.no,.vehicle-noc-detail.no{background:#fff0f0;color:#a12a2a}.vehicle-noc-detail{font-size:12px;margin:6px 0 10px}.vehicle-noc-options label:has(input:checked){border-color:#18733a;background:#f2fbf5}';document.head.appendChild(style);
    var observer=new MutationObserver(function(){addField();renderNocBadges()});observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});setInterval(function(){addField();renderNocBadges()},700);
    refresh();function refresh(){addField();renderNocBadges()}
  }
  (function wait(){if(window.db&&window.st&&typeof window.publish==='function')install();else setTimeout(wait,100)})();
})();
