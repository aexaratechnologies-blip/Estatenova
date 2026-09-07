(function(){
  'use strict';
  var activeChannel=null;
  var activeConversation=null;
  var listChannel=null;
  var timer=null;

  function cleanup(){
    if(activeChannel && window.db){ try{ window.db.removeChannel(activeChannel); }catch(e){} }
    activeChannel=null;
    activeConversation=null;
    if(listChannel && window.db){ try{ window.db.removeChannel(listChannel); }catch(e){} }
    listChannel=null;
  }

  function appendMessage(m){
    var box=document.getElementById('chatbody');
    if(!box || !m || !m.id) return;
    if(box.querySelector('[data-message-id="'+CSS.escape(String(m.id))+'"]')) return;
    var mine=window.st && window.st.user && m.sender_id===window.st.user.id;
    var el=document.createElement('div');
    el.className='bubble '+(mine?'mine':'theirs');
    el.dataset.messageId=String(m.id);
    el.textContent=m.body||'';
    box.appendChild(el);
    box.scrollTop=box.scrollHeight;
  }

  function subscribeChat(id){
    if(!window.db || !id || activeConversation===id) return;
    if(activeChannel){ try{window.db.removeChannel(activeChannel);}catch(e){} activeChannel=null; }
    activeConversation=id;
    activeChannel=window.db
      .channel('sellb2-chat-'+id+'-'+Math.random().toString(36).slice(2))
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'conversation_id=eq.'+id},function(payload){
        if(location.pathname==='/messages/'+id) appendMessage(payload.new);
      })
      .subscribe(function(status,err){
        if((status==='CHANNEL_ERROR'||status==='TIMED_OUT')&&err) console.error('SELLB2 chat realtime:',status,err);
      });
  }

  function subscribeList(){
    if(!window.db || listChannel) return;
    listChannel=window.db
      .channel('sellb2-message-list-'+Math.random().toString(36).slice(2))
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},function(payload){
        if(location.pathname==='/messages' && window.st && window.st.user){
          setTimeout(function(){ if(typeof window.render==='function') window.render(); },80);
        }
      })
      .subscribe(function(status,err){
        if((status==='CHANNEL_ERROR'||status==='TIMED_OUT')&&err) console.error('SELLB2 message-list realtime:',status,err);
      });
  }

  function sync(){
    if(!window.db || !window.st) return;
    var user=window.st.user;
    if(!user){ cleanup(); return; }
    var p=location.pathname||'/';
    if(p.indexOf('/messages/')===0){
      subscribeChat(p.split('/')[2]);
      if(listChannel){ try{window.db.removeChannel(listChannel);}catch(e){} listChannel=null; }
    }else if(p==='/messages'){
      if(activeChannel){ try{window.db.removeChannel(activeChannel);}catch(e){} activeChannel=null; activeConversation=null; }
      subscribeList();
    }else{
      if(activeChannel){ try{window.db.removeChannel(activeChannel);}catch(e){} activeChannel=null; activeConversation=null; }
      if(listChannel){ try{window.db.removeChannel(listChannel);}catch(e){} listChannel=null; }
    }
  }

  function boot(){
    if(!window.db || !window.st){ setTimeout(boot,100); return; }
    if(window.__sellb2RealtimeChatInstalled) return;
    window.__sellb2RealtimeChatInstalled=true;

    var originalSetPath=window.setPath;
    if(typeof originalSetPath==='function'){
      window.setPath=function(p){
        originalSetPath.apply(this,arguments);
        setTimeout(sync,120);
      };
    }
    window.addEventListener('popstate',function(){setTimeout(sync,120)});
    window.addEventListener('beforeunload',cleanup);
    setInterval(sync,1000);
    sync();
  }
  boot();
})();
