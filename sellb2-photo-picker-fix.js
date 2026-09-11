(function(){
'use strict';
const MAX=12;
const queues=new WeakMap();
function key(f){return [f.name,f.size,f.lastModified,f.type].join('::')}
function valid(f){return f&&String(f.type||'').toLowerCase().startsWith('image/')}
function getQueue(input){let q=queues.get(input);if(!q){q=[];queues.set(input,q)}return q}
function sync(input,q){
  try{
    const dt=new DataTransfer();q.slice(0,MAX).forEach(f=>dt.items.add(f));input.files=dt.files;return true
  }catch(e){return false}
}
function install(input){
  if(!input||input.dataset.sellb2PhotoFix==='1')return;
  input.dataset.sellb2PhotoFix='1';
  if(!input.accept)input.accept='image/*';
  const q=getQueue(input);
  input.addEventListener('change',function(){
    const incoming=Array.from(input.files||[]).filter(valid);
    incoming.forEach(f=>{if(q.length<MAX&&!q.some(x=>key(x)===key(f)))q.push(f)});
    sync(input,q);
    input.dispatchEvent(new CustomEvent('sellb2:photos-selected',{bubbles:true,detail:{files:q.slice()}}));
  });
  input.addEventListener('cancel',function(){});
}
function scan(){document.querySelectorAll('input[type=file]').forEach(install)}
scan();
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
window.__sellb2PhotoPickerFix={getFiles:function(input){return input?(queues.get(input)||Array.from(input.files||[])).slice(0,MAX):[]},clear:function(input){if(!input)return;queues.set(input,[]);try{input.value=''}catch(e){}}};
})();
