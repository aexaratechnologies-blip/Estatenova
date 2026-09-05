(function(){
  'use strict';
  function esc(v){return String(v??'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function install(){
    if(window.__sellb2NocFixInstalled||!window.db||!window.st)return;
    window.__sellb2NocFixInstalled=true;

    // Inject NOC status into listing rows at the database boundary so the value
    // survives even though the original marketplace form does not know this field.
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

    function isVehiclePost(){
      return location.pathname==='/post' && String(window.st.postCat||'property')==='vehicle';
    }
    function addField(){
      if(!isVehiclePost())return;
      var file=document.querySelector('input[type=file]');
      if(!file)return;
      var host=file.closest('label')||file.parentElement;
      if(!host||document.getElementById('vehicle-noc'))return;
      var box=document.createElement('div');
      box.className='vehicle-noc-box';
      box.innerHTML='<label class="vehicle-noc-label"><span><b>NOC Status</b><small>Is the vehicle NOC available?</small></span><span class="vehicle-noc-options"><label><input id="vehicle-noc" type="radio" name="vehicle_noc" value="yes"> Yes — NOC available</label><label><input type="radio" name="vehicle_noc" value="no"> No — NOC not available</label></span></label>';
      host.parentNode.insertBefore(box,host);
    }
    function refresh(){
      addField();
      renderNocBadges();
    }
    function getNoc(p){
      var d=p&&p.details||{};
      return d.noc_available==='yes'?'Available':d.noc_available==='no'?'Not available':'';
    }
    function renderNocBadges(){
      if(!window.st||!Array.isArray(window.st.items))return;
      document.querySelectorAll('.property-card[data-noc-ready]').forEach(function(el){el.removeAttribute('data-noc-ready')});
      document.querySelectorAll('.property-card').forEach(function(card){
        var onclick=card.getAttribute('onclick')||'';
        var m=onclick.match(/\/listing\/([^']+)/);if(!m)return;
        var id=m[1];var p=window.st.items.find(function(x){return String(x.id)===String(id)});if(!p||p.category!=='vehicle')return;
        var noc=getNoc(p);if(!noc)return;
        var body=card.querySelector('.pc-body');if(!body||body.querySelector('.vehicle-noc-status'))return;
        var el=document.createElement('div');el.className='vehicle-noc-status '+(noc==='Available'?'yes':'no');el.textContent='NOC: '+noc;body.insertBefore(el,body.querySelector('.stats')||null);
      });
      var detail=document.querySelector('.detailpage');
      if(detail&&!detail.querySelector('.vehicle-noc-detail')){
        var id=(location.pathname.split('/')[2]||'');var p=window.st.items.find(function(x){return String(x.id)===String(id)});
        if(p&&p.category==='vehicle'){
          var noc=getNoc(p), target=detail.querySelector('h1,h2,h3');
          if(noc&&target){var el=document.createElement('div');el.className='vehicle-noc-detail '+(noc==='Available'?'yes':'no');el.textContent='NOC: '+noc;target.parentNode.insertBefore(el,target.nextSibling)}
        }
      }
    }
    var style=document.createElement('style');
    style.textContent='.vehicle-noc-box{margin:14px 0;padding:15px;border:1px solid var(--line,#dbe2ea);border-radius:18px;background:var(--surface,#fff)}.vehicle-noc-label{display:flex;flex-direction:column;gap:10px;cursor:default}.vehicle-noc-label>span:first-child{display:flex;flex-direction:column;gap:3px}.vehicle-noc-label small{font-size:11px;color:var(--muted,#687386)}.vehicle-noc-options{display:flex!important;flex-wrap:wrap;gap:9px}.vehicle-noc-options label{display:flex;align-items:center;gap:6px;padding:9px 11px;border:1px solid var(--line,#dbe2ea);border-radius:12px;font-size:12px;font-weight:700}.vehicle-noc-options input{accent-color:#18733a}.vehicle-noc-status,.vehicle-noc-detail{display:inline-flex;align-items:center;width:max-content;padding:5px 9px;border-radius:999px;font-size:10px;font-weight:850;letter-spacing:.2px;margin-top:7px}.vehicle-noc-status.yes,.vehicle-noc-detail.yes{background:#e8f7ed;color:#18733a}.vehicle-noc-status.no,.vehicle-noc-detail.no{background:#fff0f0;color:#a12a2a}.vehicle-noc-detail{font-size:12px;margin:6px 0 10px}.vehicle-noc-options label:has(input:checked){border-color:#18733a;background:#f2fbf5}' ;
    document.head.appendChild(style);
    var observer=new MutationObserver(function(){refresh()});
    observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
    document.addEventListener('change',function(e){if(e.target&&e.target.name==='vehicle_noc')e.target.closest('.vehicle-noc-options').querySelectorAll('label').forEach(function(x){x.style.fontWeight=x.querySelector('input').checked?'850':'700'})},true);
    setInterval(refresh,700);
    refresh();
  }
  (function wait(){if(window.db&&window.st)install();else setTimeout(wait,100)})();
})();
