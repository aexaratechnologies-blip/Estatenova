/* SELLB2 MESSAGE UNREAD INDICATOR v3
   Green notification dot for unseen incoming messages.
   Uses the protected mark_message_read RPC so opening a chat clears unread state safely.
*/
(function(){
  'use strict';
  var channel=null,busy=false;
  function user(){return window.st&&window.st.user?window.st.user:null;}
  function db(){return window.db||null;}
  function ensureStyle(){
    if(document.getElementById('sellb2-unread-style'))return;
    var style=document.createElement('style');style.id='sellb2-unread-style';
    style.textContent='\
      .sellb2-unread-dot{display:inline-block;width:9px;height:9px;min-width:9px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 2px rgba(34,197,94,.14);margin-left:7px;vertical-align:middle;}\
      .conversation .sellb2-unread-dot{margin-left:auto;margin-right:4px;}\
      .bottomnav button{position:relative;}\
      .bottomnav .sellb2-nav-unread{position:absolute;top:6px;right:calc(50% - 18px);width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 2px var(--bg,#fff);pointer-events:none;}\
    ';document.head.appendChild(style);
  }
  function clearDots(){document.querySelectorAll('.sellb2-unread-dot,.sellb2-nav-unread').forEach(function(n){n.remove()});}
  function conversationRow(id){var rows=document.querySelectorAll('.conversation');for(var i=0;i<rows.length;i++){var oc=rows[i].getAttribute('onclick')||'';if(id&&oc.indexOf(String(id))!==-1)return rows[i];}return null;}
  function addRowDot(row){if(!row||row.querySelector('.sellb2-unread-dot'))return;var dot=document.createElement('span');dot.className='sellb2-unread-dot';dot.title='Unread message';dot.setAttribute('aria-label','Unread message');row.appendChild(dot);}
  function addNavDot(){var buttons=document.querySelectorAll('.bottomnav button');for(var i=0;i<buttons.length;i++){var oc=buttons[i].getAttribute('onclick')||'',text=(buttons[i].textContent||'').trim();if(oc.indexOf("'/messages'")!==-1||text.indexOf('Messages')!==-1){if(!buttons[i].querySelector('.sellb2-nav-unread')){var dot=document.createElement('span');dot.className='sellb2-nav-unread';dot.title='Unread messages';dot.setAttribute('aria-label','Unread messages');buttons[i].appendChild(dot);}break;}}}
  async function getConversationIds(){var d=db(),u=user();if(!d||!u)return [];var r=await d.from('conversations').select('id').or('buyer_id.eq.'+u.id+',seller_id.eq.'+u.id);if(r.error){console.error('SELLB2 conversation query:',r.error);return [];}return (r.data||[]).map(function(x){return x&&x.id?String(x.id):''}).filter(Boolean);}
  async function getUnreadIds(){var d=db(),u=user();if(!d||!u)return [];var ids=await getConversationIds();if(!ids.length)return [];var r=await d.from('messages').select('conversation_id').in('conversation_id',ids).neq('sender_id',u.id).is('read_at',null);if(r.error){console.error('SELLB2 unread query:',r.error);return [];}var seen=Object.create(null),out=[];(r.data||[]).forEach(function(x){if(x&&x.conversation_id&&!seen[x.conversation_id]){seen[x.conversation_id]=true;out.push(String(x.conversation_id));}});return out;}
  async function markRead(id){var d=db(),u=user();if(!d||!u||!id)return;try{var r=await d.rpc('mark_message_read',{p_conversation_id:id});if(r.error)console.error('SELLB2 mark read:',r.error);}catch(e){console.error('SELLB2 mark read:',e);}}
  async function refresh(){if(busy)return;var u=user();if(!u){clearDots();return;}busy=true;try{ensureStyle();var unread=await getUnreadIds();var p=location.pathname||'',active=p.indexOf('/messages/')===0?String(p.split('/')[2]||''):'';if(active&&unread.indexOf(active)!==-1){await markRead(active);unread=unread.filter(function(id){return id!==active;});}clearDots();if(!unread.length)return;if(p==='/messages')unread.forEach(function(id){addRowDot(conversationRow(id));});addNavDot();}catch(e){console.error('SELLB2 unread indicator:',e);}finally{busy=false;}}
  function watchRoute(){var p=location.pathname||'/';if(p.indexOf('/messages/')===0){var id=p.split('/')[2];if(id)markRead(id).then(function(){setTimeout(refresh,80);});}else setTimeout(refresh,80);}
  function subscribe(){var d=db(),u=user();if(!d||!u||channel)return;channel=d.channel('sellb2-unread-indicator-'+Math.random().toString(36).slice(2)).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},function(payload){var m=payload&&payload.new;if(!m||m.sender_id===u.id)return;var active=(location.pathname||'').split('/')[2]||'';if((location.pathname||'').indexOf('/messages/')===0&&active===String(m.conversation_id))markRead(String(m.conversation_id)).then(refresh);else refresh();}).on('postgres_changes',{event:'UPDATE',schema:'public',table:'messages'},function(payload){if(payload&&payload.new&&payload.new.read_at)refresh();}).subscribe(function(status,err){if((status==='CHANNEL_ERROR'||status==='TIMED_OUT')&&err)console.error('SELLB2 unread realtime:',status,err);});}
  function boot(){if(!window.db||!window.st){setTimeout(boot,100);return;}if(window.__sellb2UnreadIndicatorInstalled)return;window.__sellb2UnreadIndicatorInstalled=true;ensureStyle();subscribe();var original=window.setPath;if(typeof original==='function'){window.setPath=function(p){var result=original.apply(this,arguments);setTimeout(watchRoute,80);return result;};}window.addEventListener('popstate',function(){setTimeout(watchRoute,80);});setInterval(function(){if(user())refresh();},3000);watchRoute();}
  boot();
})();
