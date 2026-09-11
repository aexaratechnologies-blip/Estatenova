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
function preview(input,q){
  let box=input.parentElement&&input.parentElement.querySelector('.sellb2-photo-selection-preview');
  if(!box){box=document.createElement('div');box.className='sellb2-photo-selection-preview';input.parentNode.appendChild(box)}
  box.innerHTML='';
  if(!q.length){box.remove();return}
  const note=document.createElement('div');note.className='sellb2-photo-selection-count';note.textContent=q.length+' photo'+(q.length===1?'':'s')+' selected';box.appendChild(note);
  const grid=document.createElement('div');grid.className='sellb2-photo-selection-grid';box.appendChild(grid);
  q.forEach((file,i)=>{
    const item=document.createElement('div');item.className='sellb2-photo-selection-item';
    const img=document.createElement('img');img.alt='Selected photo '+(i+1);img.src=URL.createObjectURL(file);item.appendChild(img);
    const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove photo');
    remove.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();q.splice(i,1);sync(input,q);preview(input,q)});
    item.appendChild(remove);grid.appendChild(item);
  });
}
function install(input){
  if(!input||input.dataset.sellb2PhotoFix==='1')return;
  input.dataset.sellb2PhotoFix='1';
  if(!input.accept)input.accept='image/*';
  const q=getQueue(input);
  input.addEventListener('change',function(){
    const incoming=Array.from(input.files||[]).filter(valid);
    incoming.forEach(f=>{if(q.length<MAX&&!q.some(x=>key(x)===key(f)))q.push(f)});
    sync(input,q);preview(input,q);
    input.dispatchEvent(new CustomEvent('sellb2:photos-selected',{bubbles:true,detail:{files:q.slice()}}));
  });
  input.addEventListener('cancel',function(){});
}
function scan(){document.querySelectorAll('input[type=file]').forEach(install)}
const style=document.createElement('style');style.textContent='.sellb2-photo-selection-preview{margin-top:10px}.sellb2-photo-selection-count{font-size:12px;font-weight:700;margin:0 0 7px;color:var(--muted,#64748b)}.sellb2-photo-selection-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.sellb2-photo-selection-item{position:relative;aspect-ratio:1;overflow:hidden;border-radius:10px;background:#eef2f7;border:1px solid rgba(100,116,139,.2)}.sellb2-photo-selection-item img{width:100%;height:100%;object-fit:cover;display:block}.sellb2-photo-selection-item button{position:absolute;right:4px;top:4px;width:25px;height:25px;border:0;border-radius:50%;background:rgba(0,0,0,.72);color:#fff;font-size:18px;line-height:24px;padding:0}.sellb2-photo-selection-preview input{pointer-events:auto}@media(max-width:420px){.sellb2-photo-selection-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}';document.head.appendChild(style);
scan();
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
window.__sellb2PhotoPickerFix={getFiles:function(input){return input?(queues.get(input)||Array.from(input.files||[])).slice(0,MAX):[]},clear:function(input){if(!input)return;queues.set(input,[]);try{input.value=''}catch(e){}const p=input.parentElement&&input.parentElement.querySelector('.sellb2-photo-selection-preview');if(p)p.remove()}};
})();