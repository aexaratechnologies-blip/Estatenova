/* EstateNova Seller Photo Queue v2
   Keeps the existing seller uploader/storage logic, but makes the picker
   work on phones that only return one file per picker interaction. */
let enSellerPhotoQueue=[];

function enSellerPhotoKey(file){return [file.name,file.size,file.lastModified,file.type].join('::');}

function enSellerPhotoSyncInput(input){
  try{
    const dt=new DataTransfer();
    enSellerPhotoQueue.slice(0,12).forEach(file=>dt.items.add(file));
    input.files=dt.files;
  }catch(_){/* Some older WebViews do not allow programmatic FileList assignment. */}
}

function enSellerPhotoRender(input){
  let wrap=document.getElementById('seller-photo-queue');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='seller-photo-queue';
    wrap.innerHTML='<div id="seller-photo-count" class="sellernote"></div><div id="seller-photo-grid" class="seller-photo-grid"></div><div class="sellernote">Select photos normally. If your phone only lets you choose one at a time, open the picker again to add the next photo. Up to 12 total.</div>';
    input.parentNode.appendChild(wrap);
  }
  const count=document.getElementById('seller-photo-count');
  const grid=document.getElementById('seller-photo-grid');
  if(count)count.textContent=`${enSellerPhotoQueue.length} / 12 images selected`;
  if(!grid)return;
  grid.innerHTML='';
  enSellerPhotoQueue.forEach((file,index)=>{
    const item=document.createElement('div');item.className='seller-photo-thumb';
    const img=document.createElement('img');img.alt=`Property photo ${index+1}`;img.src=URL.createObjectURL(file);item.appendChild(img);
    const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove photo');remove.onclick=()=>{enSellerPhotoQueue.splice(index,1);enSellerPhotoSyncInput(input);enSellerPhotoRender(input)};item.appendChild(remove);
    if(index===0){const cover=document.createElement('small');cover.textContent='Cover';item.appendChild(cover)}
    grid.appendChild(item);
  });
}

window.enInstallSellerPhotoQueue=function(){
  const input=document.getElementById('lfiles');
  if(!input||input.dataset.photoQueueInstalled==='1')return;
  input.dataset.photoQueueInstalled='1';
  enSellerPhotoQueue=[];
  input.addEventListener('change',function(){
    const incoming=[...input.files];
    for(const file of incoming){
      if(enSellerPhotoQueue.length>=12)break;
      if(!enSellerPhotoQueue.some(x=>enSellerPhotoKey(x)===enSellerPhotoKey(file)))enSellerPhotoQueue.push(file);
    }
    enSellerPhotoSyncInput(input);
    enSellerPhotoRender(input);
  });
  enSellerPhotoRender(input);
};

try{const style=document.createElement('style');style.textContent=`.seller-photo-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:8px}.seller-photo-thumb{position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;background:#eef1f7;border:1px solid rgba(120,140,180,.22)}.seller-photo-thumb img{width:100%;height:100%;object-fit:cover}.seller-photo-thumb button{position:absolute;right:4px;top:4px;width:26px;height:26px;border:0;border-radius:50%;background:rgba(0,0,0,.72);color:#fff;font-size:18px;line-height:24px;padding:0}.seller-photo-thumb small{position:absolute;left:4px;bottom:4px;padding:2px 6px;border-radius:6px;background:rgba(0,0,0,.72);color:#fff;font-size:10px}@media(max-width:420px){.seller-photo-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}`;document.head.appendChild(style)}catch(_){ }
