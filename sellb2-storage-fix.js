(function(){'use strict';
const realCreate=window.supabase&&window.supabase.createClient;
if(!realCreate)return;
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
          try{
            const result=await realUpload(path,file,options);
            if(!result||!result.error)return result;
            lastError=result.error;
            const status=String(result.error.statusCode||'');
            if(status&&!['408','429','500','502','503','504'].includes(status))return result;
          }catch(error){
            lastError=error;
          }
          if(attempt<3)await new Promise(r=>setTimeout(r,700*attempt));
        }
        throw lastError||new Error('Image upload failed');
      };
      api.__sellb2UploadFixed=true;
      return api;
    };
  }
  return client;
};
})();
