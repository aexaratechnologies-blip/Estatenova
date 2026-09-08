/* SELLB2 Notifications: user notification center + admin broadcast composer */
(function(){
  'use strict';
  let channel=null;

  async function getDb(){ return window.db || (window.st&&window.st.db) || null; }
  async function getUser(){
    const db=await getDb(); if(!db) return null;
    try{ const {data}=await db.auth.getUser(); return data?.user||null; }catch(e){ return null; }
  }
  async function isAdmin(user){
    const db=await getDb(); if(!db||!user)return false;
    try{
      const {data}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();
      return String(data?.role||'').toLowerCase()==='admin';
    }catch(e){ return false; }
  }
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

  function go(path){
    history.pushState({},'',path);
    if(window.st) window.st.route=path;
  }
  function openNotifications(){
    go('/notifications');
    notificationPage();
  }
  function openAdminNotifications(){
    go('/admin/notifications');
    adminPage();
  }
  function backHome(){
    go('/');
    if(typeof window.render==='function') window.render();
    else location.reload();
  }
  window.sellb2OpenNotifications=openNotifications;
  window.sellb2OpenAdminNotifications=openAdminNotifications;
  window.sellb2NotificationBack=backHome;

  function iconButton(){
    if(location.pathname!=='/' && location.pathname!=='/index.html') return;
    if(document.querySelector('[data-sellb2-notification-icon]')) return;
    const host=document.querySelector('.appbar .topactions');
    if(!host)return;
    const b=document.createElement('button');
    b.type='button';
    b.className='notificationMini';
    b.setAttribute('data-sellb2-notification-icon','1');
    b.setAttribute('aria-label','Notifications');
    b.innerHTML='<span class="notificationBell" aria-hidden="true">♧</span><span class="notificationDot" hidden></span>';
    b.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); openNotifications(); });
    host.insertBefore(b,host.firstChild);
    refreshBadge(b);
  }
  async function refreshBadge(btn){
    const db=await getDb(),user=await getUser(); if(!db||!user)return;
    try{
      const {data:notes}=await db.from('notifications').select('id').eq('is_active',true).order('created_at',{ascending:false}).limit(100);
      const {data:reads}=await db.from('notification_reads').select('notification_id').eq('user_id',user.id);
      const read=new Set((reads||[]).map(x=>x.notification_id));
      const unread=(notes||[]).some(x=>!read.has(x.id));
      const dot=btn?.querySelector('.notificationDot'); if(dot)dot.hidden=!unread;
    }catch(e){}
  }
  function styles(){
    if(document.getElementById('sellb2-notification-style'))return;
    const s=document.createElement('style');s.id='sellb2-notification-style';s.textContent=`
      .notificationMini{position:relative;border:0;background:transparent;color:inherit;font-size:22px;width:42px;height:42px;border-radius:12px;cursor:pointer;display:inline-grid;place-items:center}
      .notificationBell{display:block;font-size:23px;line-height:1;transform:rotate(180deg)}
      .notificationDot{position:absolute;right:7px;top:7px;width:8px;height:8px;border-radius:50%;background:#e53935;box-shadow:0 0 0 2px var(--surface,#fff)}
      .notification-page{min-height:100dvh;padding-bottom:90px;background:var(--bg,#f6f8fc)}
      .notification-head{display:flex;align-items:center;gap:12px;padding:18px 16px 12px;position:sticky;top:0;z-index:5;background:var(--surface,#fff);border-bottom:1px solid var(--border,#e4e7ee)}
      .notification-head h1{font-size:22px;margin:0;flex:1}.notification-back{border:0;background:transparent;font-size:28px;cursor:pointer}.notification-admin{border:0;border-radius:10px;padding:9px 11px;font-weight:800;background:#102e68;color:#fff;cursor:pointer}
      .notification-list{max-width:760px;margin:0 auto;padding:14px 14px 30px}.notification-card{background:var(--surface,#fff);border:1px solid var(--border,#e4e7ee);border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 4px 14px rgba(16,46,104,.06)}
      .notification-card.unread{border-left:4px solid #102e68}.notification-card h3{margin:0 0 6px;font-size:17px}.notification-card p{margin:0 0 10px;line-height:1.5;white-space:pre-wrap}.notification-meta{font-size:12px;opacity:.62}.notification-empty{text-align:center;padding:70px 20px;opacity:.7}
      .notification-form{max-width:760px;margin:18px auto;padding:16px}.notification-form .field{width:100%;box-sizing:border-box;margin:6px 0 14px}.notification-form textarea{min-height:150px;resize:vertical}.notification-form .btn{width:100%;margin-top:8px}
    `;document.head.appendChild(s);
  }
  function pageShell(title,body,admin){
    return `<main class="notification-page"><header class="notification-head"><button class="notification-back" onclick="window.sellb2NotificationBack()" aria-label="Back">‹</button><h1>${esc(title)}</h1>${admin?'<button class="notification-admin" onclick="window.sellb2OpenAdminNotifications()">Send</button>':''}</header>${body}</main>`;
  }
  async function notificationPage(){
    styles();
    const app=document.getElementById('app'); if(!app)return;
    const db=await getDb(),user=await getUser();
    if(!db||!user){app.innerHTML=pageShell('Notifications','<div class="notification-empty">Please sign in to view notifications.</div>',false);return;}
    const admin=await isAdmin(user);
    const {data:notes,error}=await db.from('notifications').select('id,title,message,type,created_at').eq('is_active',true).order('created_at',{ascending:false});
    const {data:reads}=await db.from('notification_reads').select('notification_id').eq('user_id',user.id);
    const read=new Set((reads||[]).map(x=>x.notification_id));
    if(error){app.innerHTML=pageShell('Notifications','<div class="notification-empty">Could not load notifications.</div>',admin);return;}
    const body=(notes||[]).length?`<section class="notification-list">${notes.map(n=>`<article class="notification-card ${read.has(n.id)?'':'unread'}" data-notification-id="${esc(n.id)}" onclick="window.sellb2MarkNotification('${esc(n.id)}')"><h3>${esc(n.title)}</h3><p>${esc(n.message)}</p><div class="notification-meta">${new Date(n.created_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true})}</div></article>`).join('')}</section>`:'<div class="notification-empty">No notifications yet.</div>';
    app.innerHTML=pageShell('Notifications',body,admin);
    if(channel)try{await db.removeChannel(channel)}catch(e){}
    channel=db.channel('sellb2-notifications').on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications'},()=>notificationPage()).subscribe();
  }
  async function markNotification(id){
    const db=await getDb(),user=await getUser(); if(!db||!user)return;
    await db.from('notification_reads').upsert({notification_id:id,user_id:user.id,read_at:new Date().toISOString()},{onConflict:'notification_id,user_id'});
    const el=document.querySelector(`[data-notification-id="${CSS.escape(id)}"]`); if(el)el.classList.remove('unread');
    if(location.pathname==='/'||location.pathname==='/index.html')refreshBadge(document.querySelector('[data-sellb2-notification-icon]'));
  }
  window.sellb2MarkNotification=markNotification;

  async function adminPage(){
    styles(); const app=document.getElementById('app'); if(!app)return;
    const db=await getDb(),user=await getUser();
    if(!db||!user||!(await isAdmin(user))){app.innerHTML=pageShell('Notifications','<div class="notification-empty">Admin access required.</div>',false);return;}
    const {data:notes}=await db.from('notifications').select('id,title,message,type,created_at,is_active').order('created_at',{ascending:false}).limit(30);
    const body=`<form class="notification-form" onsubmit="return window.sellb2SendNotification(event)"><label>Notification title<input id="notificationTitle" class="field" maxlength="120" required placeholder="e.g. New marketplace update"></label><label>Message<textarea id="notificationMessage" class="field" maxlength="2000" required placeholder="Write the notification for all users..."></textarea></label><label>Type<select id="notificationType" class="field"><option value="general">General</option><option value="update">Update</option><option value="announcement">Announcement</option><option value="maintenance">Maintenance</option></select></label><button class="btn primary" type="submit">Send to all users</button><button class="btn ghost" type="button" onclick="window.sellb2OpenNotifications()">Cancel</button></form><section class="notification-list"><h2>Recent notifications</h2>${(notes||[]).map(n=>`<article class="notification-card"><h3>${esc(n.title)}</h3><p>${esc(n.message)}</p><div class="notification-meta">${new Date(n.created_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</div></article>`).join('')}</section>`;
    app.innerHTML=pageShell('Send Notification',body,false);
  }
  window.sellb2SendNotification=async function(e){
    e.preventDefault(); const db=await getDb(),user=await getUser(); if(!db||!user||!(await isAdmin(user)))return false;
    const title=document.getElementById('notificationTitle')?.value.trim(),message=document.getElementById('notificationMessage')?.value.trim(),type=document.getElementById('notificationType')?.value||'general';
    if(!title||!message)return false;
    const btn=e.submitter; if(btn)btn.disabled=true;
    const {error}=await db.from('notifications').insert({title,message,type,created_by:user.id,is_active:true});
    if(error){alert(error.message);if(btn)btn.disabled=false;return false;}
    openNotifications(); return false;
  };

  function route(){
    const p=location.pathname.replace(/\/+$/,'')||'/';
    if(p==='/notifications')notificationPage();
    else if(p==='/admin/notifications')adminPage();
  }
  function boot(){
    styles();
    // Do NOT wrap the marketplace setPath(): it renders the home screen for unknown routes,
    // which made the notification icon disappear before the notification page could render.
    const observer=new MutationObserver(()=>{if(location.pathname==='/'||location.pathname==='/index.html')iconButton();});
    observer.observe(document.body,{childList:true,subtree:true});
    iconButton();
    window.addEventListener('popstate',()=>setTimeout(route,0));
    route();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,300),{once:true});else setTimeout(boot,300);
})();
