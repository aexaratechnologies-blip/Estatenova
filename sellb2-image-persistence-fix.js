(function(){
'use strict';
function wait(){if(window.db&&window.st&&typeof window.publish==='function')install();else setTimeout(wait,100)}
async function repairAfterPublish(files,startedAt){
 if(!files.length||!window.st.user)return;
 var client=window.db,user=window.st.user;
 try{
  var r=await client.from('listings').select('id,created_at').eq('owner_id',user.id).gte('created_at',startedAt).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(r.error||!r.data)return;
  var id=r.data.id,bucket=client.storage.from('property-images'),urls=[],rows=[];
  for(var i=0;i<files.length;i++){
   var f=files[i]; if(!f||!String(f.type||'').startsWith('image/'))continue;
   var ext=(f.name&&f.name.includes('.')?f.name.split('.').pop():'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
   var path=user.id+'/'+id+'/'+Date.now()+'-'+i+'-'+Math.random().toString(36).slice(2)+'.'+ext;
   var up=await bucket.upload(path,f,{cacheControl:'31536000',upsert:false,contentType:f.type||'image/jpeg'});
   if(up.error)throw up.error;
   var pub=bucket.getPublicUrl(path);var url=pub&&pub.data&&pub.data.publicUrl;
   if(!url)throw Error('Could not create public image URL');
   urls.push(url);rows.push({listing_id:id,storage_path:path,public_url:url,sort_order:i});
  }
  if(!urls.length)return;
  await client.from('listing_images').delete().eq('listing_id',id);
  var ins=await client.from('listing_images').insert(rows);if(ins.error)throw ins.error;
  var upd=await client.from('listings').update({cover_image_url:urls[0],image_urls:urls}).eq('id',id).eq('owner_id',user.id);if(upd.error)throw upd.error;
  var p=(window.st.items||[]).find(function(x){return String(x.id)===String(id)});if(p){p.cover_image_url=urls[0];p.image_urls=urls}
 }catch(e){console.error('SELLB2 image persistence repair:',e);if(typeof window.toast==='function')window.toast('Listing saved, but some photos could not be attached. Please edit/retry.')} 
}
function install(){
 if(window.__sellb2ImagePersistenceFix)return;window.__sellb2ImagePersistenceFix=true;
 var original=window.publish;
 window.publish=async function(e){
  var input=document.querySelector('input[type=file]'),files=input&&input.files?Array.from(input.files):[];
  var startedAt=new Date(Date.now()-2000).toISOString();
  var result=await original(e);
  if(files.length)await repairAfterPublish(files,startedAt);
  return result;
 };
}
wait();
})();
