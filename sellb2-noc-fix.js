(function(){
'use strict';
function install(){
 if(window.__sellb2NocFixInstalled||!window.db||!window.st)return;
 window.__sellb2NocFixInstalled=true;
 function vehicle(){return location.pathname==='/post'&&String(window.st.postCat||'property')==='vehicle'}
 function add(){
  if(!vehicle()||document.getElementById('vehicle-noc'))return;
  var file=document.querySelector('input[type=file]'); if(!file)return;
  var host=file.closest('label')||file.parentElement; if(!host)return;
  var box=document.createElement('section'); box.className='vehicle-noc-box';
  box.innerHTML='<div class="vehicle-noc-title"><b>NOC Status</b><small>Is the vehicle NOC available?</small></div><div class="vehicle-noc-options"><label><input id="vehicle-noc" type="radio" name="vehicle_noc" value="yes"> Yes — NOC available</label><label><input type="radio" name="vehicle_noc" value="no"> No — NOC not available</label></div>';
  host.parentNode.insertBefore(box,host);
 }
 function get(p){var d=p&&p.details||{};return d.noc_available==='yes'?'Available':d.noc_available==='no'?'Not available':''}
 function badges(){
  if(!window.st||!Array.isArray(window.st.items))return;
  document.querySelectorAll('.property-card').forEach(function(card){
   var m=(card.getAttribute('onclick')||'').match(/\/listing\/([^']+)/); if(!m)return;
   var p=window.st.items.find(function(x){return String(x.id)===String(m[1])}); if(!p||p.category!=='vehicle')return;
   var n=get(p),body=card.querySelector('.pc-body'); if(!n||!body||body.querySelector('.vehicle-noc-status'))return;
   var e=document.createElement('div');e.className='vehicle-noc-status '+(n==='Available'?'yes':'no');e.textContent='NOC: '+n;body.insertBefore(e,body.querySelector('.stats'));
  });
  var detail=document.querySelector('.detailpage');if(detail&&!detail.querySelector('.vehicle-noc-detail')){
   var id=location.pathname.split('/')[2]||'',p=window.st.items.find(function(x){return String(x.id)===String(id)}),n=get(p),target=detail.querySelector('h1,h2,h3');
   if(p&&p.category==='vehicle'&&n&&target){var e=document.createElement('div');e.className='vehicle-noc-detail '+(n==='Available'?'yes':'no');e.textContent='NOC: '+n;target.parentNode.insertBefore(e,target.nextSibling)}
  }
 }
 function patchInsert(){
  try{
   var from=window.db.from.bind(window.db);window.db.from=function(table){var q=from(table);if(table!=='listings')return q;var ins=q.insert.bind(q);q.insert=function(values){
    var checked=document.querySelector('input[name="vehicle_noc"]:checked');var val=checked?checked.value:'';
    if(vehicle()&&(!val||!['yes','no'].includes(val))){if(typeof window.toast==='function')window.toast('Please select NOC status before publishing.');throw Error('Please select NOC status before publishing.')}
    if(vehicle()){var patch=function(row){row=Object.assign({},row);row.details=Object.assign({},row.details||{},{noc_available:val});return row};values=Array.isArray(values)?values.map(patch):patch(values)}
    return ins(values)
   };return q}
  }catch(e){console.warn('NOC insert patch',e)}
 }
 var style=document.createElement('style');style.textContent='.vehicle-noc-box{margin:14px 0;padding:15px;border:1px solid var(--line,#dbe2ea);border-radius:18px;background:var(--surface,#fff)}.vehicle-noc-title{display:flex;flex-direction:column;gap:3px}.vehicle-noc-title small{font-size:11px;color:var(--muted,#687386)}.vehicle-noc-options{display:flex;flex-wrap:wrap;gap:9px;margin-top:10px}.vehicle-noc-options label{display:flex;align-items:center;gap:6px;padding:10px 12px;border:1px solid var(--line,#dbe2ea);border-radius:12px;font-size:12px;font-weight:700}.vehicle-noc-options input{accent-color:#18733a}.vehicle-noc-status,.vehicle-noc-detail{display:inline-flex;padding:5px 9px;border-radius:999px;font-size:10px;font-weight:850;margin-top:7px}.vehicle-noc-status.yes,.vehicle-noc-detail.yes{background:#e8f7ed;color:#18733a}.vehicle-noc-status.no,.vehicle-noc-detail.no{background:#fff0f0;color:#a12a2a}.vehicle-noc-detail{font-size:12px;margin:6px 0 10px}';document.head.appendChild(style);
 patchInsert();var obs=new MutationObserver(function(){add();badges()});obs.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});add();badges();
}
(function wait(){if(window.db&&window.st)install();else setTimeout(wait,100)})();
})();
