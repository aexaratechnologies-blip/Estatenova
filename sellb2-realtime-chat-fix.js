(function(){
  'use strict';
  var activeChannel=null;
  var activeConversation=null;
  var listChannel=null;
  var originalSetPath=null;

  function removeChannel(ch){if(ch&&window.db){try{window.db.removeChannel(ch)}catch(e){}}}
  function cleanup(){removeChannel(activeChannel);activeChannel=null;activeConversation=null;removeChannel(listChannel);listChannel=null;}

  function tagExisting(){
    var box=document.getElementById('chatbody');
    var arr=window.st&&Array.isArray(window.st.messages)?window.st.messages:[];
    if(!box||!arr.length)return;
    var nodes=box.querySelectorAll('.bubble');
    for(var i=0;i<nodes.length&&i<arr.length;i++)nodes[i].dataset.messageId=String(arr[i].id||'');
  }

  function hasMessage(id){
    var box=document.getElementById('chatbody');
    if(!box)return false;
    var nodes=box.querySelectorAll('.bubble');
    for(var i=0;i<nodes.length;i++)if(nodes[i].dataset.messageId===String(id))return true;
    return false;
  }

  function appendMessage(m){
    var box=document.getElementById('chatbody');
    if(!box||!m||!m.id||hasMessage(m.id))return;
    var mine=window.st&&window.st.user&&m.sender_id===window.st.user.id;
    var el=document.createElement('div');
    el.className='bubble '+(mine?'mine':'theirs');
    el.dataset.messageId=String(m.id);
    el.textContent=m.body||'';
    box.appendChild(el);
    box.scrollTop=box.scrollHeight;
  }

  function refreshConversationList(payload){
    if(location.pathname!=='/messages'||!window.st||!window.st.user)return;
    var id=payload&&payload.new&&payload.new.conversation_id;
    var found=false;
    var rows=document.querySelectorAll('.conversation');
    for(var i=0;i<rows.length;i++){
      var oc=rows[i].getAttribute('onclick')||'';
      if(id&&oc.indexOf(String(id))!==-1){
        found=true;
        var small=rows[i].querySelector('small');
        var time=rows[i].querySelector('time');
        if(small)small.textContent=(payload.new.body||'Conversation');
        if(time){var t=payload.new.created_at||'';time.textContent=t.slice(11,16);}
        break;
      }
    }
    if(!found&&typeof originalSetPath==='function'){
      setTimeout(function(){if(location.pathname==='/messages')originalSetPath('/messages')},60);
    }
  }

  function subscribeChat(id){
    if(!window.db||!id||activeConversation===id)return;
    removeChannel(activeChannel);activeChannel=null;
    activeConversation=id;
    activeChannel=window.db.channel('sellb2-chat-'+id+'-'+Math.random().toString(36).slice(2))
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'conversation_id=eq.'+id},function(payload){
        if(location.pathname==='/messages/'+id)appendMessage(payload.new);
      })
      .subscribe(function(status,err){
        if((status==='CHANNEL_ERROR'||status==='TIMED_OUT')&&err)console.error('SELLB2 chat realtime:',status,err);
      });
  }

  function subscribeList(){
    if(!window.db||listChannel)return;
    listChannel=window.db.channel('sellb2-message-list-'+Math.random().toString(36).slice(2))
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},refreshConversationList)
      .subscribe(function(status,err){
        if((status==='CHANNEL_ERROR'||status==='TIMED_OUT')&&err)console.error('SELLB2 message-list realtime:',status,err);
      });
  }

  function sync(){
    if(!window.db||!window.st)return;
    if(!window.st.user){cleanup();return;}
    var p=location.pathname||'/';
    if(p.indexOf('/messages/')===0){
      tagExisting();
      subscribeChat(p.split('/')[2]);
      removeChannel(listChannel);listChannel=null;
    }else if(p==='/messages'){
      removeChannel(activeChannel);activeChannel=null;activeConversation=null;
      subscribeList();
    }else{
      removeChannel(activeChannel);activeChannel=null;activeConversation=null;
      removeChannel(listChannel);listChannel=null;
    }
  }

  function boot(){
    if(!window.db||!window.st){setTimeout(boot,100);return;}
    if(window.__sellb2RealtimeChatInstalled)return;
    window.__sellb2RealtimeChatInstalled=true;
    originalSetPath=window.setPath;
    if(typeof originalSetPath==='function')window.setPath=function(p){originalSetPath.apply(this,arguments);setTimeout(sync,150);};
    window.addEventListener('popstate',function(){setTimeout(sync,150)});
    window.addEventListener('beforeunload',cleanup);
    setInterval(sync,1000);
    sync();
  }
  boot();
})();
