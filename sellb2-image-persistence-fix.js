(function(){
'use strict';
function getClient(){return window.db||null}
function getState(){return window.st||null}
function wait(){if(getClient()&&getState()&&typeof window.publish==='function')install();else setTimeout(wait,100)}
async function getUser(client){
  var s=getState();
  if(s&&s.user&&s.user.id)return s.user;
  try{var r=await client.auth.getUser();if(r.data&&r.data.user)return r.data.user}catch(e){}
  return null;
}
async function findFreshListing(client,userId,startedAt){
  var r=await client.from('listings').select('id,created_at,owner_id').eq('owner_id',userId).gte('created_at',startedAt).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(r.error)throw r.error;
  return r.data||null;
}
async function repairAfterPublish(files,startedAt){
  if(!files.length)return;
  var client=getClient();if(!client)return;
  var user=await getUser(client);if(!user||!user.id)return;
  var listing=await findFreshListing(client,user.id,startedAt);if(!listing)throw Error('New listing record was not found after publish');
  var bucket=client.storage.from('property-images'),urls=[],rows=[];
  for(var i=0;i<files.length;i++){
    var f=files[i];
    if(!f||!String(f.type||'').startsWith('image/'))continue;
    var ext=(f.name&&f.name.includes('.')?f.name.split('.').pop():'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
    var path=user.id+'/'+listing.id+'/'+Date.now()+'-'+i+'-'+Math.random().toString(36).slice(2)+'.'+ext;
    var up=await bucket.upload(path,f,{cacheControl:'31536000',upsert:false,contentType:f.type||'image/jpeg'});
    if(up.error)throw up.error;
    var pub=bucket.getPublicUrl(path),url=pub&&pub.data&&pub.data.publicUrl;
    if(!url)throw Error('Could not create public image URL');
    urls.push(url);rows.push({listing_id:listing.id,storage_path:path,public_url:url,sort_order:i});
  }
  if(!urls.length)return;
  var del=await client.from('listing_images').delete().eq('listing_id',listing.id);if(del.error)throw del.error;
  var ins=await client.from('listing_images').insert(rows);if(ins.error)throw ins.error;
  var upd=await client.from('listings').update({cover_image_url:urls[0],image_urls:urls}).eq('id',listing.id).eq('owner_id',user.id);if(upd.error)throw upd.error;
  var s=getState(),p=(s&&s.items||[]).find(function(x){return String(x.id)===String(listing.id)});if(p){p.cover_image_url=urls[0];p.image_urls=urls}
  if(typeof window.toast==='function')window.toast(files.length+' photos attached successfully');
}
function install(){
  if(window.__sellb2ImagePersistenceFix)return;window.__sellb2ImagePersistenceFix=true;
  var original=window.publish;
  window.publish=async function(e){
    var input=document.querySelector('input[type=file][multiple]')||document.querySelector('input[type=file]');
    var files=input&&input.files?Array.from(input.files):[];
    var startedAt=new Date().toISOString();
    var result=await original(e);
    if(files.length){
      try{await repairAfterPublish(files,startedAt)}
      catch(err){console.error('SELLB2 image persistence repair:',err);if(typeof window.toast==='function')window.toast('Listing published, but photos could not be attached. Please edit/retry.');}
    }
    return result;
  };
}
wait();
})();
