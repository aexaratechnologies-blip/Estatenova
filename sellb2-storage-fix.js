(function(){'use strict';
const realCreate=window.supabase&&window.supabase.createClient;
if(realCreate){
  window.supabase.createClient=function(){
    const client=realCreate.apply(this,arguments);
    if(client&&client.storage&&typeof client.storage.from==='function'){
      const realFrom=client.storage.from.bind(client.storage);
      client.storage.from=function(bucket){
        const api=realFrom(bucket);
        if(!api||typeof api.upload!=='function'||api.__sellb2UploadFixed)return api;
        const realUpload=api.upload.bind(api);
        api.upload=async function(path,file,options){
          let lastError=null;
          for(let attempt=1;attempt<=3;attempt++){
            try{const result=await realUpload(path,file,options);if(!result||!result.error)return result;lastError=result.error;const status=String(result.error.statusCode||'');if(status&&!['408','429','500','502','503','504'].includes(status))return result}catch(error){lastError=error}
            if(attempt<3)await new Promise(r=>setTimeout(r,700*attempt));
          }
          throw lastError||new Error('Image upload failed');
        };
        api.__sellb2UploadFixed=true;return api;
      };
    }
    return client;
  };
}
function loadExtra(){
  if(!document.body){setTimeout(loadExtra,100);return}
  if(document.querySelector('script[data-sellb2-extra]'))return;
  const a=document.createElement('script');a.src='/sellb2-enhancements.js?v=sellb2-23';a.dataset.sellb2Extra='1';document.body.appendChild(a);
  const b=document.createElement('script');b.src='/sellb2-category-fix.js?v=sellb2-23';b.dataset.sellb2Extra='1';document.body.appendChild(b);
}
setTimeout(loadExtra,900);
})();
