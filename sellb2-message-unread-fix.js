/* SELLB2 MESSAGE UNREAD INDICATOR v1
   Shows a green unread dot for conversations with unseen incoming messages.
   Opening a conversation marks incoming messages as read, which removes the dot.
*/
(function(){
  'use strict';

  var timer=null;
  var channel=null;
  var busy=false;

  function user(){return window.st&&window.st.user?window.st.user:null;}
  function db(){return window.db||null;}

  function ensureStyle(){
    if(document.getElementById('sellb2-unread-style'))return;
    var style=document.createElement('style');
    style.id='sellb2-unread-style';
    style.textContent='\
      .sellb2-unread-dot{display:inline-block;width:9px;height:9px;min-width:9px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 2px rgba(34,197,94,.14);margin-left:7px;vertical-align:middle;}\
      .conversation .sellb2-unread-dot{margin-left:auto;margin-right:4px;}\
      .bottomnav button{position:relative;}\
      .bottomnav .sellb2-nav-unread{position:absolute;top:6px;right:calc(50% - 18px);width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 2px var(--bg,#fff);pointer-events:none;}\
    ';
    document.head.appendChild(style);
  }

  function getConversationIds(){
    var s=window.st;
    if(!s||!Array.isArray(s.convs))return [];
    return s.convs.map(function(c){return c&&c.id?String(c.id):''}).filter(Boolean);
  }

  function clearDots(){
    document.querySelectorAll('.sellb2-unread-dot,.sellb2-nav-unread').forEach(function(n){n.remove()});
  }

  function conversationRow(id){
    var rows=document.querySelectorAll('.conversation');
    for(var i=0;i<rows.length;i++){
      var oc=rows[i].getAttribute('onclick')||'';
      if(id&&oc.indexOf(String(id))!==-1)return rows[i];
    }
    return null;
  }

  function addRowDot(row){
    if(!row||row.querySelector('.sellb2-unread-dot'))return;
    var dot=document.createElement('span');
    dot.className='sellb2-unread-dot';
    dot.title='Unread message';
    dot.setAttribute('aria-label','Unread message');
    row.appendChild(dot);
  }

  function addNavDot(){
    var buttons=document.querySelectorAll('.bottomnav button');
    for(var i=0;i<buttons.length;i++){
      var oc=buttons[i].getAttribute('onclick')||'';
      var text=(buttons[i].textContent||'').trim();
      if(oc.indexOf("'/messages'")!==-1 || text.indexOf('Messages')!==-1){
        if(!buttons[i].querySelector('.sellb2-nav-unread')){
          var dot=document.createElement('span');
          dot.className='sellb2-nav-unread';
          dot.title='Unread messages';
          dot.setAttribute('aria-label','Unread messages');
          buttons[i].appendChild(dot);
        }
        break;
      }
    }
  }

  async function getUnreadIds(){
    var d=db(),u=user(),ids=getConversationIds();
    if(!d||!u||!ids.length)return [];
    var r=await d.from('messages')
      .select('conversation_id')
      .in('conversation_id',ids)
      .neq('sender_id',u.id)
      .is('read_at',null);
    if(r.error){console.error('SELLB2 unread query:',r.error);return []}
    var seen=Object.create(null),out=[];
    (r.data||[]).forEach(function(x){if(x&&x.conversation_id&&!seen[x.conversation_id]){seen[x.conversation_id]=true;out.push(String(x.conversation_id))}});
    return out;
  }

  async function refresh(){
    if(busy)return;
    var u=user();
    if(!u){clearDots();return;}
    busy=true;
    try{
      ensureStyle();
      var unread=await getUnreadIds();
      clearDots();
      if(!unread.length)return;
      var onMessages=location.pathname==='/messages';
      unread.forEach(function(id){if(onMessages)addRowDot(conversationRow(id));});
      addNavDot();
    }catch(e){console.error('SELLB2 unread indicator:',e)}
    finally{busy=false;}
  }

  async function markRead(id){
    var d=db(),u=user();
    if(!d||!u||!id)return;
    try{
      var r=await d.from('messages')
        .update({read_at:new Date().toISOString()})
        .eq('conversation_id',id)
        .neq('sender_id',u.id)
        .is('read_at',null);
      if(r.error)console.error('SELLB2 mark read:',r.error);
    }catch(e){console.error('SELLB2 mark read:',e)}
  }

  function watchRoute(){
    var p=location.pathname||'/';
    if(p.indexOf('/messages/')===0){
      var id=p.split('/')[2];
      if(id){
        markRead(id).then(function(){setTimeout(refresh,80)});
      }
    }else if(p==='/messages'){
      setTimeout(refresh,80);
    }else{
      clearDots();
    }
  }

  function subscribe(){
    var d=db(),u=user();
    if(!d||!u||channel)return;
    channel=d.channel('sellb2-unread-indicator-'+Math.random().toString(36).slice(2))
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},function(payload){
        var m=payload&&payload.new;
        if(!m||m.sender_id===u.id)return;
        refresh();
      })
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'messages'},function(payload){
        var m=payload&&payload.new;
        if(m&&m.read_at)refresh();
      })
      .subscribe(function(status,err){if((status==='CHANNEL_ERROR'||status==='TIMED_OUT')&&err)console.error('SELLB2 unread realtime:',status,err)});
  }

  function boot(){
    if(!window.db||!window.st){setTimeout(boot,100);return;}
    if(window.__sellb2UnreadIndicatorInstalled)return;
    window.__sellb2UnreadIndicatorInstalled=true;
    ensureStyle();
    subscribe();
    var original=window.setPath;
    if(typeof original==='function'){
      window.setPath=function(p){
        var result=original.apply(this,arguments);
        setTimeout(watchRoute,80);
        return result;
      };
    }
    window.addEventListener('popstate',function(){setTimeout(watchRoute,80)});
    timer=setInterval(function(){
      if(user())refresh();
    },3000);
    watchRoute();
  }
  boot();
})();
