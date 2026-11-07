/* D&K Party Planner: UI + application logic (runs inside the D&K shop). Needs pp-crypto.js, pp-data.js, pp-css.js.
 * Shop globals used: S (state), P(id), fin(p), m(n), esc(s), cart, tab, msg, render(). */
(function(){
'use strict';
const D=window.PPData,C=window.PPCrypto,uidn=()=>crypto.randomUUID();
const CFG=Object.assign({primaryVerify:'email',smsEnabled:false,accountFunction:false},window.DK_PP||{}),PRIM=CFG.smsEnabled&&CFG.primaryVerify==='sms'?'sms':'email';
let ME=null,MEP=null,AUTH={state:'loading',err:''},CONVS=[],USERS=D.users,CT=null,CTSRC='',CTM=[],started=false,tmr;
const PK={date:['cal','Date'],time:['clock','Time'],venue:['pin','Venue']};
const PP={open:false,view:'chats',cid:null,tab:'plan',itab:'members',sheet:null,q:'',cat:'All',sel:{},cu:null,pk:'date',filt:'all',cq:'',reply:null,mid:null,ng:null,links:[],file:null,focus:false};
/* ---------------- icons (line icons, no emoji in the interface chrome) ---------------- */
const IC={close:'<path d="M6 6l12 12M18 6L6 18"/>',plus:'<path d="M12 5v14M5 12h14"/>',back:'<path d="M15 5l-7 7 7 7"/>',
 phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
 cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
 pin:'<path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
 cart:'<path d="M3 4h2l2 11h10l2-8H7"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
 wallet:'<path d="M4 7h14a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7zM4 7l12-3v3"/><circle cx="16" cy="13.5" r="1.2"/>',
 search:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>',send:'<path d="M4 12l16-8-6 16-3-7-7-1z"/>',
 bottle:'<path d="M10 3h4v4l2 3v10a1 1 0 01-1 1H9a1 1 0 01-1-1V10l2-3V3z"/><path d="M8 13h8"/>',
 lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
 users:'<circle cx="9" cy="9" r="3"/><path d="M3 19a6 6 0 0112 0M16 6a3 3 0 010 6M17 15a5 5 0 014 4"/>',
 bell:'<path d="M6 17v-6a6 6 0 0112 0v6l2 2H4l2-2zM10 21h4"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
 reply:'<path d="M10 7L4 12l6 5v-4c5 0 8 1 10 5-1-6-4-9-10-9V7z"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
 chat:'<path d="M4 5h16v11H9l-5 4V5z"/>',chats:'<path d="M4 5h11v8H9l-3 3v-3H4V5z"/><path d="M17 9h3v8h-2v3l-3-3h-5v-2"/>',check:'<path d="M5 12l5 5 9-10"/>',
 camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4V8z"/><circle cx="12" cy="13" r="3.5"/>',
 up:'<path d="M7 11l4-7c2 0 2 2 2 3l-1 3h6a2 2 0 012 2l-1 6a2 2 0 01-2 2H7V11zM3 11h4v9H3z"/>',
 down:'<g transform="rotate(180 12 12)"><path d="M7 11l4-7c2 0 2 2 2 3l-1 3h6a2 2 0 012 2l-1 6a2 2 0 01-2 2H7V11zM3 11h4v9H3z"/></g>',
 shield:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>',list:'<path d="M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1"/>',
 image:'<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M4 17l5-4 4 3 3-2 4 3"/>',whats:'<path d="M4 20l1.5-4A8 8 0 118 18.5L4 20z"/><path d="M9 9c0 3 3 6 6 6l1-2-2-1-1 1c-1-.5-2-1.500-2.500-2.500l1-1-1-2-2 1z"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0116 0"/>',logout:'<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>',info:'<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8h.01"/>'};
const ic=(n,s)=>`<svg class="ico" width="${s||20}" height="${s||20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
/* ---------------- helpers ---------------- */
const full=u=>(USERS[u]||{}).name||'Unknown user',nm=u=>u===ME?'You':full(u).split(' ')[0],cap=s=>s?s[0].toUpperCase()+s.slice(1):'';
const wa=p=>D.e164(p),uname=u=>(USERS[u]||{}).username||'';
const byUser=un=>Object.values(USERS).find(x=>x.username===un);
const fd=d=>d?new Date(d+'T00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short',year:'numeric'}):'';
const ft=t=>t?new Date('2000-01-01T'+t).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):'';
const fv=(k,v)=>k==='date'?fd(v):k==='time'?ft(v):v;
const hm=ts=>new Date(ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
const conv=id=>CONVS.find(c=>c.id===(id||PP.cid)),isDM=c=>c.type==='dm',peerOf=c=>(c.members.find(x=>x.u!==ME)||{}).u;
const cname=c=>isDM(c)?full(peerOf(c)):(c.name||'Group');
const role=(c,u)=>(c.members.find(x=>x.u===(u||ME))||{}).r,isAd=c=>['organiser','admin'].includes(role(c));
const lastTs=c=>c.msgs.length?c.msgs[c.msgs.length-1].ts:c.created||0,unr=()=>CONVS.reduce((s,c)=>s+(c.unread||0),0);
const hasKey=c=>D.latest(c.id)>0;
const fin2=(c,k)=>{const o=c.plan[k].opts.find(o=>o.id===c.plan[k].final);return o?o.v:''};
const cur=it=>{const p=it.pid&&P(it.pid);return p?fin(p):it.price},live=it=>!['Rejected','Cancelled'].includes(it.status);
const tot=(c,f)=>c.items.filter(f).reduce((s,i)=>s+cur(i)*i.qty,0);
const T=c=>({prop:tot(c,live),appr:tot(c,i=>['Approved','Purchased'].includes(i.status)),buy:tot(c,i=>i.status==='Purchased')});
const thumb=p=>p&&p.img?`<img src="${esc(p.img)}" alt="">`:ic('bottle',44);
const initials=n=>{const p=String(n||'?').trim().split(/\s+/).filter(Boolean);return((p[0]||'?')[0]+(p.length>1?p[p.length-1][0]:'')).toUpperCase()};
const hue=s=>[...String(s)].reduce((a,c)=>(a*31+c.charCodeAt(0))%360,7);
/* ---------------- avatars: photo if set, otherwise initials ---------------- */
const AVU={},AVP={};
function avUrl(path){if(!path)return null;const c=AVU[path];if(c&&c.exp>Date.now())return c.url;if(!AVP[path]){AVP[path]=1;D.avatarUrl(path).then(u=>{AVP[path]=0;if(u){AVU[path]={url:u,exp:Date.now()+45*6e4};draw();drawReg()}}).catch(()=>{AVP[path]=0})}return c?c.url:null}
function av(name,path,s,id){const u=avUrl(path),st=`width:${s}px;height:${s}px;font-size:${Math.round(s*.38)}px`;
 return u?`<div class="av" style="${st}"><img src="${esc(u)}" alt=""></div>`:`<div class="av" style="${st};background:hsl(${hue(id||name)} 30% 33%)" aria-label="${esc(name)}">${esc(initials(name))}</div>`}
const avU=(u,s)=>av(full(u),(USERS[u]||{}).avatar_path,s,u),avC=(c,s)=>isDM(c)?avU(peerOf(c),s):av(c.name,c.avatar,s,c.id);
/* ---------------- building the local view-model from server rows ---------------- */
const DECC=new Map();
async function toMsg(row){const x={id:row.id,who:row.sender_id,type:row.kind,ts:Date.parse(row.created_at),payload:row.payload||{},re:row.reactions||{},del:!!row.deleted_at,ok:true};
 if((row.kind==='text'||row.kind==='sys')&&!x.del){let o=DECC.get(row.id);if(!o){o=await D.decrypt(row);if(o)DECC.set(row.id,o)}
  if(o){if(row.kind==='text'){x.t=o.t;x.reply=o.reply||null}else x.sys=o}else x.ok=false}
 return x}
async function buildConv(r,d,prev,light){
 const mem=d.members.filter(m=>m.conversation_id===r.id),c={id:r.id,type:r.type,name:r.name,cat:r.category,guests:r.guests,budget:+r.budget,avatar:r.avatar_path,adminOnly:r.admin_only,keyVer:r.key_version,created:Date.parse(r.created_at),
  members:mem.map(m=>({u:m.user_id,r:m.role,muted:m.muted,lastRead:Date.parse(m.last_read_at)})),items:[],plan:{date:{opts:[],final:null},time:{opts:[],final:null},venue:{opts:[],final:null}},log:[],pend:[],msgs:[],unread:0};
 const myM=c.members.find(m=>m.u===ME);c.muted=!!(myM&&myM.muted);
 const vts=(type,id)=>{const o={};d.votes.filter(v=>v.target_type===type&&v.target_id===id).forEach(v=>o[v.user_id]=v.value);return o};
 const acts=d.acts.filter(a=>a.conversation_id===r.id);c.log=acts.map(a=>({ts:Date.parse(a.created_at),t:a.text}));
 c.items=d.items.filter(i=>i.conversation_id===r.id).map(i=>({id:i.id,pid:i.product_id,name:i.name,cat:i.category,qty:i.qty,price:+i.price_at,priceAt:+i.price_at,by:i.suggested_by||[],votes:vts('item',i.id),status:i.status,
  hist:acts.filter(a=>a.item_id===i.id).map(a=>({ts:Date.parse(a.created_at),t:a.text})).reverse()}));
 d.opts.filter(o=>o.conversation_id===r.id).forEach(o=>{const f=c.plan[o.field];f.opts.push({id:o.id,v:o.value,by:o.proposed_by,votes:vts('option',o.id)});if(o.locked)f.final=o.id});
 c.items.forEach(it=>{if(it.status==='Suggested'&&Object.keys(it.votes).length)it.status='Under discussion'});
 c.pend=d.invs.filter(i=>i.conversation_id===r.id&&!i.used_by&&Date.parse(i.expires_at)>Date.now()).map(i=>({id:i.id,label:i.label||'Invited person'}));
 const prevMsgs=new Map(((prev&&prev.msgs)||[]).map(x=>[x.id,x]));
 if(light&&prev)c.msgs=prev.msgs;else for(const row of d.msgs.filter(x=>x.conversation_id===r.id)){const old=prevMsgs.get(row.id);c.msgs.push(old&&old.ok&&!row.deleted_at&&old.del===false&&!old.pending?Object.assign(old,{re:row.reactions||{}}):await toMsg(row))}
 if(prev)prev.msgs.filter(x=>x.pending&&!c.msgs.some(y=>y.id===x.id)).forEach(x=>c.msgs.push(x));
 const lr=myM?myM.lastRead:0;c.unread=c.msgs.filter(x=>x.ts>lr&&x.who!==ME&&x.type!=='sys').length;
 if(PP.open&&PP.view==='chat'&&PP.cid===c.id)c.unread=0;
 return c}
let lastSync=Date.now();
async function loadState(light){if(AUTH.state!=='in')return;
 try{const old=new Map(CONVS.map(c=>[c.id,c]));let d=await D.loadAll(ME,{light:!!light});
  if(light&&d.convs.some(r=>!old.has(r.id))){light=false;d=await D.loadAll(ME)}   /* a brand-new chat needs its messages too */
  await D.loadKeys(ME,USERS);MEP=USERS[ME]||MEP;
  CONVS=await Promise.all(d.convs.map(r=>buildConv(r,d,old.get(r.id),light)));lastSync=Date.now();
  CONVS.filter(c=>isAd(c)&&D.latest(c.id)>=c.keyVer).forEach(ensureKeys);draw()}catch(e){console.error(e);toast('Could not refresh. Check your connection.')}}
const ENS={};
async function ensureKeys(c){if(ENS[c.id]&&Date.now()-ENS[c.id]<20000)return;ENS[c.id]=Date.now();try{await D.loadProfiles(c.members.map(m=>m.u));const r=await D.ensureKeys(c.id,c.keyVer,c.members.map(m=>m.u),USERS,ME);for(const id of r.changed||[])sysMsg(c,{k:'keychanged',id})}catch(e){console.warn('key share',e)}}
function schedule(full){clearTimeout(tmr);tmr=setTimeout(()=>loadState(!full),full?350:600)}
async function onRT(table,p){
 if(table==='pp_messages'&&p.eventType==='INSERT'&&p.new){let c=conv(p.new.conversation_id);
  if(!c){await loadState();c=conv(p.new.conversation_id);const nx=c&&c.msgs.find(z=>z.id===p.new.id);if(nx)notifyIncoming(c,nx);return}
  const ex=c.msgs.find(x=>x.id===p.new.id);if(ex){ex.pending=false;return}const x=await toMsg(p.new);c.msgs.push(x);
  const watching=PP.open&&PP.view==='chat'&&PP.cid===c.id&&document.visibilityState==='visible';
  if(watching)markRead(c);else if(x.who!==ME&&x.type!=='sys')c.unread++;
  notifyIncoming(c,x);draw();return}
 if(table==='pp_messages'&&p.eventType==='UPDATE'&&p.new){const c=conv(p.new.conversation_id),x=c&&c.msgs.find(z=>z.id===p.new.id);if(x){x.re=p.new.reactions||{};if(p.new.deleted_at){x.del=true;x.t=''}draw()}return}
 if(table==='pp_members'&&p.eventType==='UPDATE'&&p.new){const c=conv(p.new.conversation_id),mm=c&&c.members.find(z=>z.u===p.new.user_id);   /* read markers and mute flags are applied in place: no reload */
  if(mm&&mm.r===p.new.role){mm.muted=p.new.muted;mm.lastRead=Date.parse(p.new.last_read_at);if(p.new.user_id===ME)c.muted=p.new.muted;return}}
 if(table==='pp_member_keys'){schedule(true);return}
 schedule()}
function markRead(c){c.unread=0;D.updMember(c.id,ME,{last_read_at:new Date().toISOString()}).catch(()=>{})}
/* ---------------- toast + safe remote calls ---------------- */

/* ---------------- notifications ---------------- */
const NK='dk-pp-notif',NS=Object.assign({sound:true,preview:false,sys:false,push:false},(()=>{try{return JSON.parse(localStorage.getItem(NK))||{}}catch(e){return {}}})());
const saveNS=()=>{try{localStorage.setItem(NK,JSON.stringify(NS))}catch(e){}};
const baseTitle=document.title;
function totalBadge(){const n=unr();document.title=n>0?'('+n+') '+baseTitle:baseTitle;document.querySelectorAll('.nav .ppbadge').forEach(b=>{b.textContent=n>99?'99+':String(n);b.style.display=n>0?'flex':'none'})}
let AC;function ding(){if(!NS.sound)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime,o=AC.createOscillator(),gn=AC.createGain();o.type='sine';o.frequency.setValueAtTime(880,t);o.frequency.setValueAtTime(1175,t+.12);gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(.12,t+.02);gn.gain.exponentialRampToValueAtTime(.0001,t+.4);o.connect(gn);gn.connect(AC.destination);o.start(t);o.stop(t+.42)}catch(e){}}
const sysOK=()=>typeof Notification!=='undefined'&&Notification.permission==='granted';
const pushOK=()=>!!(CFG.vapidPublicKey&&'serviceWorker' in navigator&&'PushManager' in window&&(location.protocol==='https:'||location.hostname==='localhost'));
function openChat(cid){const c=conv(cid);if(!c)return;PP.open=true;PP.view='chat';PP.cid=cid;PP.sheet=null;PP.reply=null;markRead(c);draw()}
let bnT;function banner(c,x,title,body){const el=g('ppnote');if(!el)return;clearTimeout(bnT);
 el.innerHTML=`<div class="bn" data-pa="banner" data-id="${c.id}">${isDM(c)?avU(x.who,38):avC(c,38)}<div class="sp"><b class="ell">${esc(title)}</b><small>${esc(body)}</small></div></div>`;bnT=setTimeout(()=>{el.innerHTML=''},5500)}
async function ensureSW(){try{if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))return await navigator.serviceWorker.register('sw.js')}catch(e){}return null}
async function showSys(title,body,cid){const o={body,tag:cid,icon:'dk-icon-192.png',data:{cid}};let reg=null;
 try{if('serviceWorker' in navigator&&await navigator.serviceWorker.getRegistration())reg=await Promise.race([navigator.serviceWorker.ready,new Promise(r=>setTimeout(()=>r(null),1500))])}catch(e){}
 try{if(reg&&reg.showNotification){await reg.showNotification(title,o);return}}catch(e){}
 try{const n=new Notification(title,o);n.onclick=()=>{try{window.focus()}catch(e){}openChat(cid);n.close()}}catch(e){}}
const mentionsMe=x=>!!(x.t&&MEP&&MEP.username&&new RegExp('@'+MEP.username+'\\b','i').test(x.t));
function notifyIncoming(c,x){if(!x||x.who===ME||x.type==='sys'||x.pending)return;
 const vis=document.visibilityState==='visible',foc=vis&&document.hasFocus();
 if(PP.open&&PP.view==='chat'&&PP.cid===c.id&&foc)return;          /* you are looking at this chat */
 const ment=mentionsMe(x);if(c.muted&&!ment)return;                /* muted chats stay quiet unless you are @mentioned */
 const dm=isDM(c),who=first(x.who),act=x.type==='prod'||x.type==='share'?'shared a product':x.type==='poll'?'made a proposal':'';
 let body=!x.ok?'New message':NS.preview?(dm?'':who+': ')+(act||(x.t||'New message').slice(0,90)):(dm?'New message':who+': new message');
 if(!NS.preview&&act)body=dm?'Shared a product':who+' '+act;if(ment)body='Mentioned you · '+body;
 const title=dm?full(x.who):(c.name||'Group');
 ding();if(vis)banner(c,x,title,body);if(NS.sys&&sysOK()&&!foc)showSys(title,body,c.id)}
const b64u=s=>{const r=atob((s+'='.repeat((4-s.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(r,ch=>ch.charCodeAt(0))};
async function enablePush(){if(typeof Notification==='undefined')throw new Error('Not supported in this browser. On iPhone, add D&K to your Home Screen first.');
 const perm=Notification.permission==='granted'?'granted':await Notification.requestPermission();if(perm!=='granted')throw new Error('Notifications are blocked. Allow them in your browser settings.');
 const reg=await navigator.serviceWorker.register('sw.js');await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(CFG.vapidPublicKey)});
 await D.savePush(sub.toJSON(),navigator.userAgent.slice(0,120));NS.push=true;NS.sys=true;saveNS()}
async function disablePush(){try{const reg=await navigator.serviceWorker.getRegistration(),sub=reg&&await reg.pushManager.getSubscription();if(sub){await D.dropPush(sub.endpoint).catch(()=>{});await sub.unsubscribe()}}catch(e){}NS.push=false;saveNS()}
const nrow=(t,on,pa,sub)=>`<div class="ri" data-pa="${pa}"><div class="sp">${t}${sub?`<div class="mu">${sub}</div>`:''}</div><span class="sw ${on?'on':''}"></span></div>`;
const NST={perm:'',sw:'',push:''};
async function notifStatus(){NST.perm=typeof Notification==='undefined'?'not supported':Notification.permission;let sw='not registered';try{const r='serviceWorker' in navigator&&await navigator.serviceWorker.getRegistration();if(r&&r.active)sw='active'}catch(e){sw='unavailable'}NST.sw=sw;
 NST.push=!CFG.vapidPublicKey?'not set up (no key in pp-config.js)':!pushOK()?'unavailable here (needs https)':NS.push?'on':'off'}
function notifHtml(){const sup=typeof Notification!=='undefined';return `<div class="ntf">Notifications</div><div class="cd2">${nrow('Alerts on this device',NS.sys&&sysOK(),'nsys',sup?'Banner and system alerts for new messages':'Not supported in this browser. On iPhone, add D&K to your Home Screen first.')}${nrow('Sound',NS.sound,'nsound')}${nrow('Show message text in alerts',NS.preview,'nprev','Off keeps message text off your lock screen')}${pushOK()?nrow('Alerts when the app is closed',NS.push,'npush','Sends a "new message" alert only. The server never sees your message text.'):''}</div><div class="row" style="margin:8px 0"><button class="gb" data-pa="ntest">Send a test alert</button></div><div class="mu">Status: permission ${esc(NST.perm||'checking')} · service worker ${esc(NST.sw||'checking')} · closed-app alerts ${esc(NST.push||'checking')}</div><div class="mu" style="margin-top:6px">Mute a single chat from its info page. Muted chats stay quiet unless you are @mentioned.</div>`}
function toast(t){setTimeout(()=>{const r=g('pp');if(!r)return;const el=document.createElement('div');el.className='toast';el.textContent=t;r.appendChild(el);setTimeout(()=>el.remove(),2600)},0)}
const fail=e=>{console.warn(e);toast((e&&e.message&&e.message.length<90?e.message:'That did not save. Please try again.'));loadState()};
const act=(local,remote)=>{local();draw();Promise.resolve().then(remote).catch(fail)};
/* ---------------- encrypted messaging ---------------- */
async function sendEnc(c,kind,obj,payload,extra){if(!hasKey(c)){toast('Waiting for the chat encryption key. An admin needs to be online.');return}
 const id=uidn(),x=Object.assign({id,who:ME,type:kind,ts:Date.now(),re:{},ok:true,pending:true,payload:payload||{}},extra||{});c.msgs.push(x);draw();
 try{const e=await D.encrypt(c.id,ME,obj);await D.send(Object.assign({id,conversation_id:c.id,sender_id:ME,kind,payload:payload||{}},e));x.pending=false}
 catch(err){c.msgs=c.msgs.filter(m=>m!==x);fail(err)}draw()}
function sendText(c,t){if(!isDM(c)&&c.adminOnly&&!isAd(c))return;const b={t:t.slice(0,4000)};if(PP.reply){b.reply={who:PP.reply.who,t:String(PP.reply.t||'').slice(0,300)};PP.reply=null}
 sendEnc(c,'text',b,{}, {t:b.t,reply:b.reply||null})}
const sysMsg=(c,o)=>sendEnc(c,'sys',Object.assign({a:ME},o),{},{sys:Object.assign({a:ME},o)});
async function sendPlain(c,kind,payload){const id=uidn(),x={id,who:ME,type:kind,ts:Date.now(),re:{},ok:true,pending:true,payload};c.msgs.push(x);draw();
 try{await D.send({id,conversation_id:c.id,sender_id:ME,kind,payload});x.pending=false}catch(e){c.msgs=c.msgs.filter(m=>m!==x);fail(e)}draw()}
const logA=(c,t,item)=>{c.log.unshift({ts:Date.now(),t});D.activity(c.id,ME,t,item).catch(()=>{})};
function sysText(x){const o=x.sys||{},a=nm(o.a),ids=(o.ids||[]).map(nm).join(', ');
 return {created:a+' created this group',added:a+' added '+ids,removed:a+' removed '+nm(o.id),admin:a+(o.on?' made '+nm(o.id)+' an admin':' dismissed '+nm(o.id)+' as admin'),adminonly:o.on?'Only admins can send messages now':'All members can send messages now',
  keychanged:full(o.id)+"'s security code changed",lock:a+' locked in '+(PK[o.pk]||['','item'])[1].toLowerCase()+': '+fv(o.pk,o.v),unlock:a+' reopened '+(PK[o.pk]||['','item'])[1].toLowerCase()+' for discussion',joined:full(o.a)+' joined using an invitation link'}[o.k]||''}
/* ---------------- Shadow DOM host (shop CSS can never leak in, and vice versa) ---------------- */
document.body.insertAdjacentHTML('beforeend','<div id="pphost"></div>');
const SR=document.getElementById('pphost').attachShadow({mode:'open'});SR.innerHTML='<style>'+window.PP_CSS+'</style><div id="pp"></div><div id="ppnote" role="status" aria-live="polite"></div>';
const g=id=>SR.getElementById(id);
/* ---------------- account card: register / sign in / unlock (lives ONLY on the Profile page) ---------------- */
const REG={mode:'register',step:'form',f:{},err:'',note:'',ch:'sms',sent:0,tries:0,anon:false,needEmail:false,busy:false,invite:false},roots=new Set(),FP={};
const EMRE=/^\S+@\S+\.\S+$/;
function fpOf(u){const p=USERS[u];if(!p||!p.pubkey)return '';if(FP[u])return FP[u];FP[u]='…';D.fingerprint(p.pubkey).then(v=>{FP[u]=v;draw();drawReg()});return FP[u]}
const fld=(l,k,o)=>`<label class="fl2">${l}<input class="fi" data-rf="${k}" ${o&&o.ro?'readonly style="opacity:.75"':''} ${o&&o.type?`type="${o.type}"`:''} ${o&&o.ph?`placeholder="${o.ph}"`:''} ${o&&o.ac?`autocomplete="${o.ac}"`:'autocomplete="off"'} value="${esc(o&&o.ro?(o.def||''):(REG.f[k]!==undefined?REG.f[k]:(o&&o.def)||''))}"></label>`;
const btn=(t,a,c)=>`<button class="${c||'pb'}" style="${c?'':'width:100%'}" data-ra="${a}" ${REG.busy?'disabled':''}>${REG.busy&&!c?'Please wait…':t}</button>`;
function regHtml(ctx){const er=REG.err||AUTH.err?`<div class="warn bad">${esc(REG.err||AUTH.err)}</div>`:'',nt=REG.note?`<div class="warn" style="background:#d6f5e6;color:#0a7a43">${esc(REG.note)}</div>`:'';
 if(AUTH.state==='loading')return '<p class="mu">Loading your account…</p>';
 if((AUTH.state==='locked'||AUTH.state==='nokeys')&&ctx!=='planner'&&REG.step!=='contacts')return `<h4>One more step</h4><p class="mu">Open Chats to ${AUTH.state==='nokeys'?'secure your messages':'unlock your messages'} on this device.</p><div class="row" style="flex-wrap:wrap"><button class="pb" data-ra="openpp">${ic('chats',16)} Open Chats</button><button class="gb" data-ra="signout">Sign out</button></div>`;
 if(AUTH.state==='nokeys'&&ctx==='planner')return `<h4>${ic('lock',18)} Secure your messages</h4><p class="mu">Your chats are end-to-end encrypted. Choose a message passphrase. It protects your private key and is never sent to us, so we cannot reset it. Use something different from your password and write it down somewhere safe.</p>${er}${fld('Message passphrase (min 8)','np',{type:'password',ac:'new-password'})}${fld('Repeat passphrase','np2',{type:'password',ac:'new-password'})}${btn('Secure my messages','mkkeys')}<button class="gb" style="width:100%;margin-top:8px" data-ra="signout">Sign out</button>`;
 if(AUTH.state==='locked'&&ctx==='planner'){if(REG.step==='resetpass')return `<h4>Reset your message passphrase</h4><p class="mu">This creates a new encryption key for this device. We cannot recover the old passphrase. Your chats stay safe on the server, and each chat becomes readable again once another member of it opens the app and shares the key with you. They will see "your security code changed".</p>${er}${fld('New message passphrase (min 8)','np',{type:'password'})}${btn('Reset passphrase','dopass')}<button class="gb" style="width:100%;margin-top:8px" data-ra="passback">Back</button>`;
  return `<h4>${ic('lock',18)} Unlock your messages</h4><p class="mu">Your private messages are end-to-end encrypted. Enter your message passphrase to unlock them on this device.</p>${er}${fld('Message passphrase','upass',{type:'password',ac:'current-password'})}${btn('Unlock','unlock')}<div class="row" style="margin-top:8px;flex-wrap:wrap"><button class="gb" data-ra="gopass">Forgot passphrase?</button><button class="gb" data-ra="signout">Sign out</button></div>`}
 if(AUTH.state==='setup'){const au=AUTH.user||{},hasE=!!au.email,hasP=!!au.phone,ph0=hasP?'0'+D.e164(au.phone).replace(/^256/,''):'';
  return `<h4>Create your D&K account</h4><div class="stp"><i class="on"></i><i class="on"></i><i></i></div><p class="mu">Your ${hasE?'email':'phone number'} is verified. Complete the details below to finish.</p>${er}
 ${fld('Full name','name',{ac:'name'})}${fld('Username (friends tag you with @)','user')}${fld(hasE?'Email (verified)':'Email (optional)','email',{type:'email',ac:'email',ro:hasE,def:au.email||''})}${fld(hasP?'Phone number (verified)':'Phone number (shown to people in your chats)','phone',{type:'tel',ph:'07xx xxx xxx',ac:'tel',ro:hasP,def:ph0})}${fld('Password (min 8)','pw',{type:'password',ac:'new-password'})}${btn('Create account','setup')}<button class="gb" style="width:100%;margin-top:8px" data-ra="signout">Sign out and start over</button>`}
 if(AUTH.state==='in'||(REG.step==='contacts'&&(AUTH.state==='nokeys'||AUTH.state==='locked'))){const me=MEP||{},ct=CT?`${CT.length} contacts read on this device · ${CTM.length} on D&K`:'Not shared';
  if(REG.step==='contacts')return `<h4>Find your friends on D&K</h4><div class="stp"><i class="on"></i><i class="on"></i><i class="on"></i></div><p class="mu">Allow access to your contacts to see which friends are already on D&K when you build a group.</p><div class="cd" style="background:var(--bg)"><div class="mu">${ic('shield',16)} Your contact list stays on your phone. Only scrambled (hashed) phone numbers are sent to find matches; contacts who are not on D&K are never stored.</div></div>${CFG.smsEnabled?'':'<p class="mu">Friends appear in suggestions once they have verified their phone number. SMS phone verification is coming soon.</p>'}${btn('Allow contacts access','allow')}<button class="gb" style="width:100%;margin-top:8px" data-ra="skip">Not now</button>`;
  return `<div class="ph">${av(me.name,me.avatar_path,72,ME)}<div class="sp"><b style="font-size:17px">${esc(me.name||'')}</b><div class="mu">@${esc(me.username||'')} · +${esc(me.phone||'')}${me.phone_verified?' (verified)':' (not verified)'}</div></div></div>
  <div class="row" style="flex-wrap:wrap;margin-bottom:8px"><label class="gb" style="cursor:pointer">${ic('camera',16)} ${me.avatar_path?'Change photo':'Add photo'}<input type="file" accept="image/jpeg,image/png,image/webp" hidden data-file="user"></label>${me.avatar_path?`<button class="gb" data-ra="rmphoto">Remove photo</button>`:''}</div>${nt}${er}
  <div class="mu" style="margin-top:8px">Contacts: ${ct}</div><div class="row" style="margin-top:10px;flex-wrap:wrap"><button class="pb" data-ra="openpp">${ic('chats',16)} Open Chats</button><button class="gb" data-ra="allow">${CT?'Refresh contacts':'Allow contacts'}</button>${CT?'<button class="gb" data-ra="rmct">Remove contacts</button>':''}<button class="gb" data-ra="signout">${ic('logout',16)} Sign out</button></div>`}
 /* signed out */
 if(REG.step==='verify'){const sms=REG.ch==='sms',dm=window.__DK_OTP&&window.__DK_OTP();
  return `<h4>Verify your ${sms?'phone number':'email'}</h4><div class="stp"><i class="on"></i><i class="on"></i><i></i></div><p class="mu">We sent a 6-digit code ${sms?'by SMS to <b>'+esc((REG.f.phone||'').replace(/^(.{3}).*(.{2})$/,'$1•••••$2'))+'</b>':'to <b>'+esc((REG.f.email||'').replace(/^(.).*(@.*)$/,'$1•••$2'))+'</b>'}. It expires soon.</p>${nt}${er}
  ${dm?`<div class="sms"><small>DEMO ONLY: this preview cannot send real ${sms?'SMS':'email'}</small>D&K Beverages: your verification code is <b>${esc(dm.code)}</b>. Never share it.</div>`:''}
  <input class="fi code" data-rf="code" inputmode="numeric" maxlength="6" placeholder="••••••" autocomplete="one-time-code" value="${esc(REG.f.code||'')}">${btn('Verify and create account','verify')}
  <div class="row" style="margin-top:10px"><button class="gb sp" data-ra="resend" data-rt="1">Resend code</button>${CFG.smsEnabled?`<button class="gb sp" data-ra="switch">${sms?'Use email instead':'Use SMS instead'}</button>`:''}</div>
  ${REG.needEmail?`<div style="margin-top:8px">${fld('Your email','email',{type:'email'})}<button class="pb" data-ra="switch">Send code to email</button></div>`:''}<button class="gb" style="margin-top:8px" data-ra="back">Back</button>`}
 if(REG.mode==='forgot'){if(REG.step==='code')return `<h4>Enter your reset code</h4><p class="mu">If an account matches, we sent a 6-digit code to its email address.</p>${nt}${er}${window.__DK_OTP&&window.__DK_OTP()?`<div class="sms"><small>DEMO ONLY: this preview cannot send real email</small>Your reset code is <b>${esc(window.__DK_OTP().code)}</b>.</div>`:''}<input class="fi code" data-rf="rcode" inputmode="numeric" maxlength="6" placeholder="••••••" autocomplete="one-time-code" value="${esc(REG.f.rcode||'')}">${fld('New password (min 8)','rpw',{type:'password',ac:'new-password'})}${btn('Reset password','doreset')}<button class="gb" style="width:100%;margin-top:8px" data-ra="forgotback">Back</button>`;
  return `<h4>Reset your password</h4><p class="mu">${CFG.accountFunction?'Enter the email you signed up with, or your username.':'Enter the email you signed up with.'} We will email you a 6-digit code.</p>${er}${fld(CFG.accountFunction?'Email or username':'Email','rid',{ac:'username'})}${btn('Send reset code','sendreset')}<button class="gb" style="width:100%;margin-top:8px" data-ra="tosignin">Back to sign in</button>`}
 if(REG.mode==='signin')return `<h4>Sign in to D&K</h4>${REG.invite?'<div class="warn">Sign in or register to join the group you were invited to.</div>':''}${nt}${er}${fld(CFG.accountFunction?'Email, phone number or username':'Email or phone number','sid',{ac:'username'})}${fld('Password','spw',{type:'password',ac:'current-password'})}${btn('Sign in','signin')}<div class="row" style="margin-top:8px"><button class="gb sp" data-ra="forgotstart">Forgot password?</button><button class="gb sp" data-ra="mode">Create account</button></div><p class="mu" style="margin-top:8px">Forgot your username? Sign in with your email or phone number instead. Your username is shown on your profile once you are in.</p>`
 return `<h4>Create your D&K account</h4><div class="stp"><i class="on"></i><i></i><i></i></div>${REG.invite?'<div class="warn">Register to join the group you were invited to. It takes a minute.</div>':''}<p class="mu">One account for the shop and the Party Planner. We verify your ${PRIM==='sms'?'phone':'email'} so the account is really yours.</p>${er}
 ${fld('Full name','name',{ac:'name'})}${fld('Username (friends tag you with @)','user')}${PRIM==='email'?fld('Email (we send your verification code here)','email',{type:'email',ac:'email'})+fld('Phone number (shown to people in your chats)','phone',{type:'tel',ph:'07xx xxx xxx',ac:'tel'}):fld('Phone number (we text you a code)','phone',{type:'tel',ph:'07xx xxx xxx',ac:'tel'})+fld('Email (optional, backup if SMS fails)','email',{type:'email',ac:'email'})}${fld('Password (min 8)','pw',{type:'password',ac:'new-password'})}${btn('Send verification code','send')}<button class="gb" style="width:100%;margin-top:8px" data-ra="mode">I already have an account</button>`}
function drawReg(){roots.forEach(r=>{if(!r.host.isConnected){roots.delete(r);return}const el=r.querySelector('[data-rm]');if(el){const f=r.activeElement&&r.activeElement.dataset&&r.activeElement.dataset.rf;el.innerHTML=regHtml();if(f){const i=r.querySelector('[data-rf="'+f+'"]');if(i){i.focus();try{i.setSelectionRange(99,99)}catch(e){}}}}})}
function validateReg(f){const p=D.e164(f.phone);
 if(!f.name||f.name.length>80)return 'Enter your full name.';if(!/^[a-zA-Z0-9_]{3,20}$/.test(f.user||''))return 'Username: 3 to 20 letters, numbers or underscore.';
 if(p.length<9||p.length>15)return 'Enter a valid phone number.';if(PRIM==='email'?!EMRE.test(f.email||''):(f.email&&!EMRE.test(f.email)))return 'Enter a valid email address.';
 if((f.pw||'').length<8)return 'Password needs at least 8 characters.';return ''}
async function askContacts(){CT=null;
 try{if(navigator.contacts&&navigator.contacts.select){const r=await navigator.contacts.select(['name','tel'],{multiple:true});CT=r.filter(c=>c.tel&&c.tel[0]).map(c=>({name:(c.name&&c.name[0])||c.tel[0],phone:c.tel[0]}));CTSRC='phone'}}catch(e){}
 if(!CT&&window.DK_DEMO_CONTACTS){CT=window.DK_DEMO_CONTACTS.map(c=>Object.assign({},c));CTSRC='demo'}
 if(!CT){toast('This browser cannot open your contacts. Search by username or phone instead.');return}
 try{CTM=await D.matchContacts(CT)}catch(e){CTM=[];toast('Could not match contacts')}}
async function afterAuth(){if(AUTH.state!=='in')return;REG.f={};const ch=/[#&]chat=([\w-]{36})/.exec(location.hash);if(ch){history.replaceState(null,'',location.pathname+location.search);openChat(ch[1])}const t=D.joinToken();
 if(t){try{const cid=await D.accept(t);D.clearJoin();await loadState();toast('You joined the group');PP.open=true;PP.view='chat';PP.cid=cid;draw()}catch(e){D.clearJoin();toast(e.message||'Invitation link not valid')}}}
async function boot(){try{const u=await D.realUser();
  if(!u){AUTH.state='out';ME=null;CONVS=[];return}
  ME=u.id;const prof=await D.profile(ME);if(!prof){AUTH.state='setup';AUTH.user=u;return}
  MEP=prof;USERS[ME]=prof;AUTH.err='';
  let ks;try{ks=await D.initKeys(ME,AUTH.pass||null,prof)}catch(e){AUTH.pass=null;AUTH.state='locked';AUTH.err=e.message;return}AUTH.pass=null;
  if(ks==='locked'){AUTH.state='locked';return}
  if(ks==='nokeys'){AUTH.state='nokeys';return}
  AUTH.state='in';await loadState();if(NS.sys)ensureSW();if(!started){started=true;D.subscribe(onRT)}await afterAuth()}
 catch(e){console.error(e);AUTH.state='out';AUTH.err='Could not reach the server. Please try again.'}finally{draw();drawReg()}}
/* The shop reads the signed-in user once when the page loads, so after switching accounts the page must reload. */
async function switchedAccount(){if(window.DK_DEMO){await boot();return}location.reload()}
async function signOutNow(){const id=ME;if(NS.push)await disablePush();await D.signOut(id);if(!window.DK_DEMO){location.reload();return}
 ME=null;MEP=null;CONVS=[];CT=null;CTM=[];DECC.clear();started=false;AUTH.state='out';AUTH.err='';REG.mode='signin';REG.step='form';REG.f={};REG.busy=false;PP.open=false;draw();drawReg()}
async function regAct(x){const a=x.dataset.ra,root=x.getRootNode(),f=REG.f;
 root.querySelectorAll('[data-rf]').forEach(el=>{f[el.dataset.rf]=/^(pw|pass|spw|upass|rpw|np|np2)$/.test(el.dataset.rf)?el.value:el.value.trim()});
 REG.err='';REG.note='';AUTH.err='';
 if(a==='openpp'){openPP();return}
 if(a==='photo')return;
 REG.busy=true;drawReg();
 try{
  if(a==='mode'){REG.mode=REG.mode==='register'?'signin':'register';REG.step='form'}
  else if(a==='send'){const e=validateReg(f);if(e)REG.err=e;else if(!(await D.available(f.user.toLowerCase())))REG.err='That username is taken.';
   else{const r=await D.begin({channel:PRIM,phone:f.phone,email:f.email,password:f.pw});REG.anon=r.anon;REG.ch=PRIM;REG.sent=Date.now();REG.tries=0;REG.step='verify';f.code=''}}
  else if(a==='resend'){if(Date.now()-REG.sent>=30000){await D.resend({channel:REG.ch,phone:f.phone,email:f.email},REG.anon);REG.sent=Date.now();REG.note='A new code was sent.'}}
  else if(a==='switch'){const to=REG.ch==='sms'?'email':'sms';if(to==='email'&&!EMRE.test(f.email||'')){REG.needEmail=true;if(f.email)REG.err='Enter a valid email.'}
   else{await D.begin({channel:to,phone:f.phone,email:f.email,password:f.pw});REG.ch=to;REG.sent=Date.now();REG.tries=0;REG.needEmail=false;REG.note='Code sent by '+(to==='sms'?'SMS':'email')+'.'}}
  else if(a==='back'){REG.step='form'}
  else if(a==='verify'){if(REG.tries>=5)REG.err='Too many wrong attempts. Request a new code.';else{let u;try{u=await D.verify({channel:REG.ch,phone:f.phone,email:f.email,password:f.pw},f.code||'',REG.anon)}catch(e){REG.tries++;REG.err=(e.message||'Wrong code')+' ('+(5-REG.tries)+' attempts left)'}
    if(u){try{await D.createProfile({id:u.id,username:f.user.toLowerCase(),name:f.name,phone:D.e164(f.phone)||null,email:f.email||null,pubkey:null});['pw','pass','code'].forEach(k=>delete f[k]);REG.step='contacts'}catch(e){REG.err='Your code was accepted, but your profile could not be saved: '+((e&&e.message)||'unknown error')+'. Please finish below.';REG.step='form'}await boot()}}}
  else if(a==='forgotstart'){REG.mode='forgot';REG.step='form'}
  else if(a==='tosignin'){REG.mode='signin';REG.step='form'}
  else if(a==='forgotback'){REG.step='form'}
  else if(a==='sendreset'){const id=(f.rid||'').trim();
   if(id.includes('@')){if(!EMRE.test(id))REG.err='Enter a valid email address.';else{await D.resetEmail(id);REG.rkind='email';REG.remail=id;REG.step='code';f.rcode=''}}
   else if(CFG.accountFunction&&/^[a-zA-Z0-9_]{3,20}$/.test(id)){await D.fn({action:'recover',username:id.toLowerCase()});REG.rkind='user';REG.ruser=id.toLowerCase();REG.step='code';f.rcode=''}
   else REG.err=CFG.accountFunction?'Enter your email address or username.':'Enter the email address you signed up with.'}
  else if(a==='doreset'){if((f.rpw||'').length<8)REG.err='Password needs at least 8 characters.';else if(!/^\d{6}$/.test(f.rcode||''))REG.err='Enter the 6-digit code from the email.';
   else{if(REG.rkind==='email'){await D.recoverVerify(REG.remail,f.rcode);await D.setPassword(f.rpw)}else{const t=await D.fn({action:'reset',username:REG.ruser,token:f.rcode,password:f.rpw});await D.setSession(t)}
    delete f.rpw;delete f.rcode;REG.mode='signin';REG.step='done';await switchedAccount()}}
  else if(a==='signin'){const id=(f.sid||'').trim(),isMail=id.includes('@'),isPhone=/^[+\d][\d\s-]{7,}$/.test(id);
   if(!id||!f.spw)REG.err='Enter your sign-in details and password.';
   else if(isMail||isPhone){await D.signIn({id,password:f.spw});delete f.spw;REG.step='done';await switchedAccount()}
   else if(CFG.accountFunction){const t=await D.fn({action:'login',username:id.toLowerCase(),password:f.spw});await D.setSession(t);delete f.spw;REG.step='done';await switchedAccount()}
   else REG.err='Sign in with the email or phone number you registered with.'}
  else if(a==='mkkeys'){if((f.np||'').length<8)REG.err='Passphrase needs at least 8 characters.';else if(f.np!==f.np2)REG.err='The two passphrases do not match.';else{AUTH.pass=f.np;delete f.np;delete f.np2;await boot();toast('Your messages are now end-to-end encrypted')}}
  else if(a==='gopass'){REG.step='resetpass'}
  else if(a==='passback'){REG.step='form'}
  else if(a==='dopass'){if((f.np||'').length<8)REG.err='Passphrase needs at least 8 characters.';else{await D.resetIdentity(ME,f.np);delete f.np;AUTH.pass=null;REG.step='done';await boot();toast('New message key created. Chats unlock as other members come online.')}}
  else if(a==='unlock'){AUTH.pass=f.upass;delete f.upass;await boot()}
  else if(a==='setup'){const u=AUTH.user,ph=D.e164(u.phone||f.phone||''),em=u.email||f.email||'';
   const bad=!f.name||f.name.length>80?'Enter your full name.':!/^[a-zA-Z0-9_]{3,20}$/.test(f.user||'')?'Username: 3 to 20 letters, numbers or underscore.':(ph.length<9||ph.length>15)?'Enter a valid phone number.':(em&&!EMRE.test(em))?'Enter a valid email address.':(f.pw||'').length<8?'Password needs at least 8 characters.':'';
   if(bad)REG.err=bad;else if(!(await D.available(f.user.toLowerCase())))REG.err='That username is taken.';
   else{const r=await D.sb.auth.updateUser({password:f.pw});if(r.error)throw r.error;await D.createProfile({id:u.id,username:f.user.toLowerCase(),name:f.name,phone:ph,email:em||null,pubkey:null});['pw','pass'].forEach(k=>delete f[k]);REG.step='contacts';await boot()}}
  else if(a==='allow'){await askContacts();REG.step='done'}
  else if(a==='skip')REG.step='done';
  else if(a==='rmct'){CT=null;CTM=[];CTSRC=''}
  else if(a==='rmphoto'){await D.removeAvatar('user',ME,MEP.avatar_path);MEP.avatar_path=null;USERS[ME].avatar_path=null}
  else if(a==='signout'){await signOutNow();return}
 }catch(e){REG.err=(e&&e.message)||'Something went wrong. Please try again.'}
 REG.busy=false;drawReg();draw()}
async function setPhoto(kind,id,file){try{const b=await D.imageToAvatar(file),c=kind==='group'?conv(id):null,old=kind==='user'?MEP.avatar_path:c.avatar,p=await D.uploadAvatar(kind,id,b,old);
 if(kind==='user'){MEP.avatar_path=p;USERS[ME].avatar_path=p}else c.avatar=p;toast('Photo updated')}catch(e){toast(e.message||'Could not upload photo')}draw();drawReg()}
function wire(sr){sr.addEventListener('click',e=>{const x=e.target.closest('[data-ra]');if(x)regAct(x)});
 sr.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.rf)REG.f[t.dataset.rf]=t.value});
 sr.addEventListener('change',e=>{const t=e.target;if(t.type==='file'&&t.files&&t.files[0]){const k=t.dataset.file==='user'?['user',ME]:['group',PP.file];setPhoto(k[0],k[1],t.files[0]);t.value=''}});}
wire(SR);
/* ---------------- views ---------------- */
const top2=(t,sub,back)=>`<div class="top h2"><button class="bk" data-pa="${back||'back'}" aria-label="Back">${ic('back',24)}</button><div class="tt"><b>${t}</b>${sub?`<small>${sub}</small>`:''}</div><button class="cb" data-pa="close" aria-label="Close">${ic('close')}</button></div>`;
function noAcct(){const st=AUTH.state,gate=st==='locked'||st==='nokeys';
 return `<div class="top"><button class="cb" data-pa="close" aria-label="Close">${ic('close')}</button></div><h1 class="ttl">Chats</h1><div class="bd"><div class="cd">${gate?`<div data-rm="1">${regHtml('planner')}</div>`:`<h4>${st==='setup'?'Finish your profile':'Create your account in Profile'}</h4><p class="mu">Your D&K account is created once, in the Profile page, to avoid double registration. You verify your email, and can optionally allow contacts to find friends. The first time you open Chats you choose a message passphrase to protect your conversations.</p><button class="pb" data-pa="gotoprof">Go to Profile</button>`}</div></div>`}
function pv(c){const l=c.msgs[c.msgs.length-1];if(!l)return '<span class="mu">No messages yet</span>';let t;
 if(l.type==='sys')t=sysText(l);else if(l.del)t='Message deleted';else if(l.type==='prod')t='Product: '+((c.items.find(i=>i.id===l.payload.item)||{}).name||'');else if(l.type==='share')t='Product: '+((P(l.payload.pid)||{}).name||'');
 else if(l.type==='poll')t=(PK[l.payload.pk]||['','Plan'])[1]+' proposal';else t=l.ok?l.t:'Encrypted message';
 const me=l.who===ME&&l.type!=='sys',pre=!isDM(c)&&l.type!=='sys'&&!me?nm(l.who)+': ':'';return (me?'<span class="tk">✓✓</span> ':'')+esc(pre+t)}
function chatRows(){const q=PP.cq.toLowerCase(),fl=PP.filt,all=CONVS.slice().sort((a,b)=>lastTs(b)-lastTs(a));
 return all.filter(c=>(fl==='all'||(fl==='unread'&&c.unread)||(fl==='groups'&&!isDM(c)))&&(!q||cname(c).toLowerCase().includes(q))).map(c=>{const l=c.msgs[c.msgs.length-1];return `<div class="cl" data-pa="open" data-id="${c.id}">${avC(c,52)}<div class="sp"><div class="row"><b class="sp ell">${esc(cname(c))}</b><span class="tm2 ${c.unread?'ac':''}">${l?hm(l.ts):''}</span></div><div class="row"><span class="mu sp ell">${pv(c)}</span>${c.muted?`<span class="mu">${ic('bell',14)}</span>`:''}${c.unread?`<span class="bg">${c.unread}</span>`:''}</div></div></div>`}).join('')||'<p class="mu" style="text-align:center;margin-top:30px">No chats yet. Tap + to start one.</p>'}
function chatsView(){const nu=CONVS.filter(c=>c.unread).length,ng=CONVS.filter(c=>!isDM(c)).length;
 return `<div class="top"><button class="me-top cb" style="padding:0;background:none" data-pa="me" aria-label="My profile">${av(full(ME),MEP&&MEP.avatar_path,40,ME)}</button><span class="sp"></span><button class="cb gr" data-pa="newchat" aria-label="New chat">${ic('plus',22)}</button><button class="cb" data-pa="close" aria-label="Close">${ic('close')}</button></div><h1 class="ttl">Chats</h1><div class="srch">${ic('search',18)}<input id="ppcs" placeholder="Search" value="${esc(PP.cq)}" autocomplete="off"></div><div class="chips fl">${[['all','All'],['unread','Unread '+nu],['groups','Groups '+ng]].map(([k,l])=>`<button class="${PP.filt===k?'on':''}" data-pa="filt" data-f="${k}">${l}</button>`).join('')}</div><div class="lst"><div id="pplst">${chatRows()}</div><p class="mu" style="text-align:center;margin-top:18px">${ic('lock',13)} Messages are end-to-end encrypted</p></div>`}
const tg=(on,n,pa,dat)=>`<button class="${on?'on':''}" ${dat||''} data-pa="${pa}">${ic('up',15)} ${n}</button>`;
function pollCard(c,x){const k=x.payload.pk,o=(c.plan[k]||{opts:[]}).opts.find(o=>o.id===x.payload.oid);if(!o)return '';const me=x.who===ME,fin=c.plan[k].final===o.id,n=Object.keys(o.votes).length;
 return `<div class="pc ${me?'me':''}"><div class="in" style="padding-top:8px"><span class="mu">${nm(x.who)} proposed a ${PK[k][1].toLowerCase()}</span><b style="font-size:17px;margin:4px 0;display:flex;gap:6px;align-items:center">${ic(PK[k][0],18)} ${esc(fv(k,o.v))}</b><span class="tag t-${fin?'Locked':'Open'}">${fin?'Locked in':'Up for discussion'}</span><div class="acts">${tg(o.votes[ME],n,'ov',`data-k="${k}" data-o="${o.id}"`)}${isAd(c)&&!fin?`<button data-pa="lock" data-k="${k}" data-o="${o.id}">${ic('lock',15)} Lock in</button>`:''}<button data-pa="tab" data-v="plan">Plan</button></div></div></div>`}
function bubble(c,x){
 if(x.type==='sys')return x.ok?`<div class="sys">${esc(sysText(x))}</div>`:'';
 if(x.type==='poll')return pollCard(c,x);
 const me=x.who===ME,dm=isDM(c),rx=Object.values(x.re||{}),rxh=rx.length?`<span class="rx">${[...new Set(rx)].join('')}${rx.length>1?' '+rx.length:''}</span>`:'';
 if(x.type==='prod'){const it=c.items.find(i=>i.id===x.payload.item);if(!it)return '';const p=it.pid&&P(it.pid),up=Object.values(it.votes).filter(v=>v>0).length,dn=Object.values(it.votes).filter(v=>v<0).length;
  const vs=Object.entries(it.votes).map(([k,v])=>`<div class="mt">${nm(k)} voted ${v>0?'for':'against'} this product</div>`).join('');
  return `<div class="pc ${me?'me':''}"><div class="pi">${p?thumb(p):ic('bottle',44)}<span class="ch">${m(cur(it))}</span></div><div class="in"><span class="mu">${nm(x.who)} suggested</span><b>${esc(it.name)}</b><div class="mt">${p&&p.desc?esc(p.desc)+' · ':''}${it.pid?(p&&p.inStock===false?'Out of stock':'In stock · D&K price'):'Estimate (not a D&K price)'}</div><div class="row" style="margin-top:6px"><span class="qt"><button data-pa="q" data-i="${it.id}" data-d="-1" aria-label="Less">−</button><b>${it.qty}</b><button data-pa="q" data-i="${it.id}" data-d="1" aria-label="More">+</button></span><span class="sp"></span><b>${m(cur(it)*it.qty)}</b></div><div class="row" style="margin-top:6px"><span class="tag t-${it.status.split(' ')[0]}">${it.status}</span>${it.by.length>1?`<span class="mt">by ${it.by.map(nm).join(', ')}</span>`:''}</div><div class="acts">${tg(it.votes[ME]>0,up,'v',`data-i="${it.id}" data-d="1"`)}<button class="${it.votes[ME]<0?'on':''}" data-pa="v" data-i="${it.id}" data-d="-1">${ic('down',15)} ${dn}</button><button data-pa="tab" data-v="list">${ic('list',15)} List</button></div>${vs}<span class="tm">${hm(x.ts)}</span></div></div>`}
 if(x.type==='share'){const p=P(x.payload.pid);if(!p)return '';const q=x.payload.qty||1;return `<div class="pc ${me?'me':''}"><div class="pi">${thumb(p)}<span class="ch">${m(fin(p))}</span></div><div class="in"><b>${esc(p.name)}</b><div class="mt">${p.desc?esc(p.desc)+' · ':''}${p.inStock===false?'Out of stock':'In stock · D&K price'}</div><div class="row" style="margin-top:6px"><span class="mt sp">${q} × ${m(fin(p))}</span><b>${m(fin(p)*q)}</b></div><div class="acts"><button data-pa="cart1" data-m="${x.id}">${ic('cart',15)} ${x.added?'In your cart':'Add to cart'}</button></div><span class="tm">${hm(x.ts)}${me?' <span class="tk">✓✓</span>':''}</span></div></div>`}
 const t=!x.ok?`<span class="dec">${ic('lock',13)} Message cannot be read on this device yet</span>`:x.del?`<i class="mu">${me?'You deleted this message':'This message was deleted'}</i>`:esc(x.t||'').replace(/@(\w+)/g,(a,u)=>{const p=byUser(u.toLowerCase());return p?`<span class="mn" data-pa="contact" data-u="${p.id}">@${u}</span>`:a});
 const rep=x.reply&&!x.del?`<div class="rq" style="border-color:hsl(${hue(x.reply.who)} 60% 60%)"><b style="color:hsl(${hue(x.reply.who)} 60% 65%)">${esc(nm(x.reply.who))}</b><div>${esc(x.reply.t)}</div></div>`:'';
 return `<div class="bub ${me?'me':''}" data-pa="bub" data-m="${x.id}">${!me&&!dm?`<span class="w" style="color:hsl(${hue(x.who)} 60% 65%)" data-pa="contact" data-u="${x.who}">${esc(full(x.who))}</span>`:''}${rep}${t}<span class="tm">${hm(x.ts)}${me?(x.pending?'':' <span class="tk">✓✓</span>'):''}</span>${rxh}</div>`}
function chatView(c){const dm=isDM(c),adm=!dm&&c.adminOnly&&!isAd(c);let lastD='';const rest=unr()-(c.unread||0);
 const hd=`<div class="top h2"><button class="bk" data-pa="back" aria-label="Back">${ic('back',24)}<span>${rest>0?rest:''}</span></button><div class="hp" data-pa="info">${avC(c,38)}<div class="tt"><b>${esc(cname(c))}</b><small>${dm?'tap for contact info':esc(c.members.map(x=>nm(x.u)).join(', '))}</small></div></div>${dm?`<a class="cb" href="tel:+${wa((USERS[peerOf(c)]||{}).phone)}" aria-label="Call">${ic('phone')}</a>`:`<button class="cb" data-pa="panel" data-v="plan" aria-label="Event planner">${ic('cal')}</button>`}</div>`;
 const strip=dm?'':`<div class="strip">${['date','time','venue'].map(k=>{const v=fin2(c,k);return `<span data-pa="panel" data-v="plan">${ic(PK[k][0],14)} ${v?esc(fv(k,v)):'<em>to be decided</em>'}</span>`}).join('')}</div>`;
 const rp=PP.reply?`<div class="rb"><div class="sp"><b style="color:#8b6cf0">${esc(nm(PP.reply.who))}</b><div class="ell mu">${esc(PP.reply.t)}</div></div><button data-pa="rcl" aria-label="Cancel reply">${ic('close',16)}</button></div>`:'';
 const cm=adm?`<div class="cmw"><div class="ao">Only <b>admins</b> can send messages</div></div>`:`<div class="cmw"><div id="ppmn"></div>${rp}<div class="cmr"><button class="pl" data-pa="plus" aria-label="Attach">${ic('plus',26)}</button><div class="pill"><input id="ppin" autocomplete="off" aria-label="Message" ${hasKey(c)?'':'disabled placeholder="Waiting for encryption key…"'}></div><button class="go" id="ppgo" data-pa="go" aria-label="Send or add product">${ic('bottle',20)}</button></div></div>`;
 return hd+strip+`<div class="wall"><div class="chat"><div class="lockn">${ic('lock',14)} ${hasKey(c)?'Messages are end-to-end encrypted. Only people in this chat can read them.':'Waiting for the encryption key. An admin needs to be online to share it.'}</div>${c.msgs.map(x=>{const d=new Date(x.ts).toDateString(),h=d!==lastD?`<div class="day">${d===new Date().toDateString()?'Today':d}</div>`:'';lastD=d;return h+bubble(c,x)}).join('')}</div></div>`+cm}
const swr=(i,t,on,pa)=>`<div class="ri" data-pa="${pa}">${ic(i,18)} ${t}<span class="sw ${on?'on':''}"></span></div>`;
function infoView(c){
 if(isDM(c)){const u=peerOf(c),x=USERS[u]||{},gs=CONVS.filter(gg=>!isDM(gg)&&gg.members.some(y=>y.u===u)),n=c.msgs.filter(z=>z.type==='share').length;
  return top2('Contact info','')+`<div class="bd"><div class="ctr">${avU(u,96)}<h2>${esc(x.name||'')}</h2><div class="mu">+${esc(x.phone||'')} · @${esc(x.username||'')}</div></div><div class="act3"><a class="ab" href="tel:+${wa(x.phone)}">${ic('phone')}<span>Voice</span></a><button class="ab" data-pa="back">${ic('chat')}<span>Chat</span></button><a class="ab" target="_blank" rel="noopener" href="https://wa.me/${wa(x.phone)}">${ic('whats')}<span>WhatsApp</span></a></div>
  <div class="cd2"><div class="ri">${ic('image',18)} Products shared <b>${n}</b></div>${swr('bell','Mute notifications',c.muted,'mute')}</div>
  <div class="cd2"><div class="ri">${ic('lock',18)} <div class="sp">Encryption<div class="mu">Compare this fingerprint with ${esc(nm(u))} in person or by call to confirm nobody is intercepting your messages.</div><div class="fpr">${esc(fpOf(u))}</div></div></div></div>
  <h4 class="sub">${gs.length?'Groups in common':'No groups in common'}</h4><div class="cd2">${gs.map(gg=>`<div class="ri" data-pa="open" data-id="${gg.id}">${avC(gg,28)} ${esc(gg.name)}</div>`).join('')}<div class="ri gl" data-pa="mkgrp" data-u="${u}">${ic('plus',18)} Create group with ${esc(nm(u))}</div><div class="ri gl" data-pa="addgrp" data-u="${u}">${ic('users',18)} Add to group</div></div></div>`}
 const ad=isAd(c);let body='';
 if(PP.itab==='members')body=`<div class="mu" style="margin:0 4px 6px">${c.members.length} members</div><div class="cd2">${ad?`<div class="ri gl" data-pa="sheet" data-v="inv">${ic('plus',18)} Add members</div>`:''}${c.members.map(x=>`<div class="ri" data-pa="contact" data-u="${x.u}">${avU(x.u,40)}<div class="sp"><b style="margin:0;color:#f2f2f2;font-weight:600">${esc(full(x.u))}${x.u===ME?' (You)':''}</b><div class="mu">+${esc((USERS[x.u]||{}).phone||'')}</div></div>${x.r!=='member'?`<span class="mu">${cap(x.r)}</span>`:''}</div>`).join('')}${c.pend.map(x=>`<div class="ri"><div class="sp"><b style="margin:0;color:#f2f2f2;font-weight:600">${esc(x.label)}</b><div class="mu">Invitation sent. Joins after registering in Profile.</div></div></div>`).join('')}</div>`;
 if(PP.itab==='media'){const po=['date','time','venue'].reduce((s,k)=>s+c.plan[k].opts.length,0);body=`<div class="cd2"><div class="ri" data-pa="panel" data-v="list">${ic('cart',18)} Products shared <b>${c.items.length}</b></div><div class="ri" data-pa="panel" data-v="plan">${ic('cal',18)} Date, time and venue proposals <b>${po}</b></div></div>${c.items.map(i=>`<div class="cd2"><div class="ri"><div class="sp"><b style="margin:0;color:#f2f2f2;font-weight:600">${esc(i.name)}</b><div class="mu">${i.qty} × ${m(cur(i))} · ${i.status}</div></div></div></div>`).join('')}`}
 if(PP.itab==='settings')body=`<div class="cd2">${swr('bell','Mute notifications',c.muted,'mute')}${ad?swr('lock','Only admins can send messages',c.adminOnly,'onlyadm'):''}<div class="ri">${ic('users',18)} ${esc(c.cat||'Event')} <b>${c.guests} guests · ${m(c.budget)}</b></div><div class="ri">${ic('shield',18)} <div class="sp">End-to-end encrypted<div class="mu">Messages are readable only by members. The server stores ciphertext.</div></div></div></div><div class="cd2"><div class="ri rd" data-pa="sheet" data-v="exit">${ic('logout',18)} Exit group</div></div><p class="mu" style="text-align:center">Created ${new Date(c.created).toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'})}</p>`;
 return top2(esc(c.name),'Group info')+`<div class="bd"><div class="ctr">${avC(c,96)}<h2>${esc(c.name)}</h2><div class="mu">Group · ${c.members.length} members</div>${ad?`<div class="row" style="justify-content:center;margin-top:10px"><label class="gb" style="cursor:pointer" data-pa="gphoto">${ic('camera',16)} ${c.avatar?'Change photo':'Add photo'}</label>${c.avatar?`<button class="gb" data-pa="rmgphoto">Remove</button>`:''}</div>`:''}</div><div class="act3">${[['plan','cal','Plan'],['list','cart','List'],['budget','wallet','Budget']].map(([k,i,l])=>`<button class="ab" data-pa="panel" data-v="${k}">${ic(i)}<span>${l}</span></button>`).join('')}</div><div class="seg">${['members','media','settings'].map(t=>`<button class="${PP.itab===t?'on':''}" data-pa="itab" data-v="${t}">${cap(t)}</button>`).join('')}</div>${body}</div>`}
function planView(c){return `<div class="bd"><p class="mu">Date, time and venue are open for discussion. Anyone can propose, everyone votes, admins lock one in. Locked choices can be reopened.</p>${['date','time','venue'].map(k=>{const P_=c.plan[k];return `<div class="cd"><div class="row"><h4 class="sp" style="display:flex;gap:6px;align-items:center">${ic(PK[k][0],18)} ${PK[k][1]}</h4>${P_.final?`<span class="tag t-Locked">${esc(fv(k,fin2(c,k)))}</span>`:'<span class="tag t-Open">Undecided</span>'}</div>
 ${P_.opts.map(o=>`<div class="opt ${P_.final===o.id?'fin':''}"><div class="sp"><b>${esc(fv(k,o.v))}</b><div class="mu">proposed by ${nm(o.by)}${Object.keys(o.votes).length?' · '+Object.keys(o.votes).map(nm).join(', '):''}</div></div><button class="gb" data-pa="ov" data-k="${k}" data-o="${o.id}" style="${o.votes[ME]?'background:#8b6cf0;color:#fff;border-color:#8b6cf0':''}">${ic('up',15)} ${Object.keys(o.votes).length}</button>${isAd(c)?(P_.final===o.id?`<button class="gb" data-pa="unlock" data-k="${k}">Reopen</button>`:`<button class="gb" data-pa="lock" data-k="${k}" data-o="${o.id}">Lock in</button>`):''}</div>`).join('')||'<div class="mu">No proposals yet.</div>'}
 <button class="pb" style="margin-top:8px" data-pa="prop" data-k="${k}">${ic('plus',16)} Propose ${PK[k][1].toLowerCase()}</button></div>`}).join('')}</div>`}
function listView(c){const t=T(c);return `<div class="bd"><div class="row" style="margin-bottom:8px"><h3 class="sp" style="margin:0">Shopping list</h3><button class="gb" data-pa="sheet" data-v="cust">${ic('plus',16)} Custom item</button></div>
${c.items.map(it=>{const ch=it.pid&&Math.abs(cur(it)-it.priceAt)>0.5;return `<div class="cd"><div class="row"><div class="sp"><b>${esc(it.name)}</b><div class="mu">${esc(it.cat||'Custom')} · by ${it.by.map(nm).join(', ')} · ${it.pid?'D&K confirmed price':'manual estimate'}</div></div><span class="tag t-${it.status.split(' ')[0]}">${it.status}</span></div>
${ch?`<div class="warn">Price changed since suggested: was ${m(it.priceAt)}, now ${m(cur(it))}</div>`:''}
<div class="row" style="margin-top:8px"><span class="qt"><button data-pa="q" data-i="${it.id}" data-d="-1" aria-label="Less">−</button><b>${it.qty}</b><button data-pa="q" data-i="${it.id}" data-d="1" aria-label="More">+</button></span><span class="mu">× ${m(cur(it))}</span><span class="sp"></span><b>${m(cur(it)*it.qty)}</b></div>
<div class="acts"><button data-pa="v" data-i="${it.id}" data-d="1" aria-label="Vote for">${ic('up',15)}</button><button data-pa="v" data-i="${it.id}" data-d="-1" aria-label="Vote against">${ic('down',15)}</button>${['Approved','Rejected','Purchased'].map(s=>`<button data-pa="st" data-i="${it.id}" data-s="${s}">${s==='Approved'?'Approve':s==='Rejected'?'Reject':'Purchased'}</button>`).join('')}</div>
${it.hist.length?`<details class="mu"><summary>History (${it.hist.length})</summary>${it.hist.map(h=>`<div>${new Date(h.ts).toLocaleDateString()} ${hm(h.ts)}: ${esc(h.t)}</div>`).join('')}</details>`:''}</div>`}).join('')||'<p class="mu">No items yet. Add a product from the chat.</p>'}
<div class="cd"><b>Approved total ${m(t.appr)}</b><div class="mu">Approval is not a sale. Stock and sales only change when the order is confirmed at checkout.</div><button class="pb" style="margin-top:8px" data-pa="tocart">Send approved items to cart</button></div>
<h4>Decision history</h4><div class="cd mu">${c.log.slice(0,30).map(l=>`<div>${hm(l.ts)} · ${esc(l.t)}</div>`).join('')||'Nothing yet.'}</div></div>`}
function budgetView(c){const t=T(c),pc=c.budget?Math.min(100,t.prop/c.budget*100):0,over=c.budget&&t.prop>c.budget,by={};c.items.filter(live).forEach(i=>by[i.cat||'Custom']=(by[i.cat||'Custom']||0)+cur(i)*i.qty);
 return `<div class="bd"><div class="cd"><div class="row"><b class="sp">Spending limit</b><b>${pc.toFixed(1)}%</b></div><div class="bar ${over?'over':''}" style="margin:8px 0"><i style="width:${pc}%"></i></div>${over?`<div class="warn bad">Over budget by ${m(t.prop-c.budget)}.</div>`:''}
 ${[['Event budget',m(c.budget)],['Proposed (not rejected)',m(t.prop)],['Approved',m(t.appr)],['Purchased',m(t.buy)],['Remaining vs proposed',m(c.budget-t.prop)],['Est. cost per guest ('+c.guests+')',m(t.prop/c.guests)]].map(r=>`<div class="row"><span class="sp mu">${r[0]}</span><b>${r[1]}</b></div>`).join('')}${isAd(c)?`<button class="gb" style="margin-top:10px" data-pa="bud">Change budget</button>`:''}</div>
 <div class="cd"><b>By category</b>${Object.entries(by).map(([k,v])=>`<div class="row"><span class="sp mu">${esc(k)}</span><b>${m(v)}</b></div>`).join('')||'<div class="mu">Nothing yet.</div>'}</div></div>`}
function panelView(c){return top2(esc(c.name),'Event planner')+`<div class="tb">${[['plan','Plan'],['list','List'],['budget','Budget']].map(([k,l])=>`<button class="${PP.tab===k?'on':''}" data-pa="tab" data-v="${k}">${l}</button>`).join('')}</div>`+({plan:planView,list:listView,budget:budgetView}[PP.tab])(c)}
function listRows(){const q=PP.q.toLowerCase(),c=conv();return S.products.filter(p=>(PP.cat==='All'||p.category===PP.cat)&&(!q||(p.name+(p.brand||'')).toLowerCase().includes(q))).map(p=>`<div class="pr"><div class="th">${thumb(p)}</div><div class="sp"><b>${esc(p.name)}</b><div class="mu">${m(fin(p))}${p.inStock===false?' · out of stock':''}</div></div><span class="qt"><button data-pa="sq" data-p="${p.id}" data-d="-1" aria-label="Less">−</button><b>${PP.sel[p.id]||1}</b><button data-pa="sq" data-p="${p.id}" data-d="1" aria-label="More">+</button></span><button class="pb" data-pa="sug" data-p="${p.id}" ${p.inStock===false?'disabled style="opacity:.4"':''}>${c&&isDM(c)?'Send':'Add'}</button></div>`).join('')||'<p class="mu">No match.</p>'}
/* people picker: contacts already on D&K (matched by hashed phone), exact-match search, and non-members to invite by link */
function ctRows(mode,c){const q=(PP.q||'').toLowerCase().trim(),ng=PP.ng||{sel:[],pend:[]},gm=mode==='group',inG=u=>c&&c.members.some(y=>y.u===u),seen=new Set(),on=[],off=[];let h='';
 if(!CT)h+=`<div class="cd" style="background:#26262a"><b>Suggestions from your contacts</b><div class="mu">Allow contacts access to see which friends are already on D&K. Only hashed phone numbers are sent; contacts not on D&K are never stored.</div><button class="pb" style="margin-top:8px" data-pa="ctallow">Allow contacts access</button></div>`;
 CTM.forEach(({contact,user})=>{seen.add(user.id);if(inG(user.id))return;if(!q||(contact.name+user.username+user.name).toLowerCase().includes(q))on.push({id:user.id,name:contact.name,un:user.username,path:user.avatar_path})});
 (PP.lk||[]).forEach(u=>{if(!seen.has(u.id)&&!inG(u.id)&&u.id!==ME){seen.add(u.id);USERS[u.id]=Object.assign(USERS[u.id]||{},u);on.push({id:u.id,name:u.name,un:u.username,path:u.avatar_path})}});
 (CT||[]).forEach(ct=>{if(!CTM.some(x=>x.contact===ct)&&(!q||(ct.name+ct.phone).toLowerCase().includes(q)))off.push(ct)});
 const rowU=u=>`<div class="pr" data-pa="${gm?'ngp':mode==='add'?'addm':'dm'}" data-u="${u.id}" style="cursor:pointer">${av(u.name,u.path,42,u.id)}<div class="sp"><b>${esc(u.name)}</b><div class="mu">@${esc(u.un)}</div></div>${gm?`<span class="ck ${ng.sel.includes(u.id)?'on':''}">${ng.sel.includes(u.id)?ic('check',14):''}</span>`:''}</div>`;
 if(on.length)h+=`<div class="mu" style="margin:8px 0 2px;font-weight:700">ON D&K</div>`+on.map(rowU).join('');
 if(off.length)h+=`<div class="mu" style="margin:10px 0 2px;font-weight:700">INVITE TO D&K</div>`+off.map(ct=>{const sel=ng.pend.some(p=>p.label===ct.name);return `<div class="pr" data-pa="${gm?'ngo':'invlink'}" data-l="${esc(ct.name)}" style="cursor:pointer">${av(ct.name,null,42,ct.name)}<div class="sp"><b>${esc(ct.name)}</b><div class="mu">Not on D&K yet</div></div>${gm?`<span class="ck ${sel?'on':''}">${sel?ic('check',14):''}</span>`:'<button class="gb">Invite</button>'}</div>`}).join('');
 if(q&&!on.length&&!off.length)h+=`<div class="warn">No registered user found. Search needs an exact @username or full phone number.</div>`;
 if(q&&mode!=='chat')h+=`<button class="gb" style="width:100%;margin-top:8px" data-pa="${gm?'ngo':'invlink'}" data-l="${esc(PP.q.trim())}">Invite “${esc(PP.q.trim())}” by link</button>`;
 return h||'<p class="mu">Search by exact @username or full phone number.</p>'}
function sheet(c){const s=PP.sheet;if(!s)return '';let b='';
 if(s==='me')b=`<div class="ph">${av(full(ME),MEP&&MEP.avatar_path,72,ME)}<div class="sp"><b style="font-size:17px">${esc(full(ME))}</b><div class="mu">@${esc(uname(ME))}</div></div></div><div class="row" style="flex-wrap:wrap"><label class="gb" style="cursor:pointer" data-pa="uphoto">${ic('camera',16)} ${MEP&&MEP.avatar_path?'Change photo':'Add photo'}</label>${MEP&&MEP.avatar_path?`<button class="gb" data-pa="rmuphoto">Remove photo</button>`:''}</div>${notifHtml()}<div class="mu" style="margin-top:10px">${ic('lock',14)} Your key fingerprint</div><div class="fpr">${esc(fpOf(ME))}</div>`;
 if(s==='plus'){const grp=c&&!isDM(c);b=`<div class="cd2"><div class="ri" data-pa="sheet" data-v="cat">${ic('bottle',18)} Product from D&K catalogue</div>${grp?['date','time','venue'].map(k=>`<div class="ri" data-pa="prop" data-k="${k}">${ic(PK[k][0],18)} Propose a ${PK[k][1].toLowerCase()}</div>`).join(''):''}</div>`}
 if(s==='act'){const x=c.msgs.find(z=>z.id===PP.mid);b=x?`<div class="rxr">${['👍','❤️','😂','😮','🙏'].map(e=>`<button data-pa="react" data-e="${e}">${e}</button>`).join('')}</div><div class="cd2"><div class="ri" data-pa="reply">${ic('reply',18)} Reply</div>${x.del||!x.ok?'':`<div class="ri" data-pa="cpmsg">${ic('copy',18)} Copy</div>`}${x.who===ME&&!x.del?`<div class="ri rd" data-pa="delm">${ic('trash',18)} Delete</div>`:''}</div>`:''}
 if(s==='cat')b=`<h3 style="margin:0 0 6px">${isDM(c)?'Send a product':'Add a product to the group'}</h3><input id="ppsq" placeholder="Search D&K catalogue" value="${esc(PP.q)}"><div class="chips">${['All',...new Set(S.products.map(p=>p.category))].map(k=>`<button class="${PP.cat===k?'on':''}" data-pa="fc" data-c="${esc(k)}">${esc(k)}</button>`).join('')}</div><div id="pplist">${listRows()}</div>`;
 if(s==='newchat')b=`<h3 style="margin:0 0 6px">New chat</h3><input id="ppq" placeholder="@username, phone number or contact name" value="${esc(PP.q)}" autocomplete="off"><div class="cd2"><div class="ri" data-pa="newgrp">${ic('users',18)} New group</div></div><div id="pplist">${ctRows('chat')}</div>`;
 if(s==='ng1')b=`<h3 style="margin:0 0 6px">New group: add people</h3><div class="mu">${PP.ng.sel.length+PP.ng.pend.length} selected. Everyone in a group must be a registered user; others get an invitation link and join after they register.</div><input id="ppq" placeholder="Search" value="${esc(PP.q)}" autocomplete="off"><div id="pplist">${ctRows('group')}</div><button class="pb" style="width:100%;margin-top:10px" data-pa="ngnext">Next</button>`;
 if(s==='ng2')b=`<h3 style="margin:0 0 6px">New group: details</h3><div class="mu">${[...PP.ng.sel.map(full),...PP.ng.pend.map(p=>p.label+' (invited)')].map(esc).join(', ')}</div><label class="fl2">Group / event name<input id="n1" class="fi" maxlength="80" placeholder="e.g. Kevin's 30th Birthday"></label><label class="fl2">Category<select id="n2" class="fi">${['Birthday party','Wedding','Introduction ceremony','Graduation','Corporate event','House party','Family gathering','Anniversary','Baby shower','Other'].map(k=>`<option>${k}</option>`).join('')}</select></label><div class="mu">Date, time and venue are optional. Leave blank to let the group decide.</div><label class="fl2">Date<input id="n3" class="fi" type="date"></label><label class="fl2">Time<input id="n7" class="fi" type="time"></label><label class="fl2">Venue<input id="n4" class="fi" maxlength="120" placeholder="Where?"></label><label class="fl2">Expected guests<input id="n5" class="fi" type="number" min="1" value="30"></label><label class="fl2">Budget (UGX)<input id="n6" class="fi" type="number" min="0" value="1000000"></label><button class="pb" style="width:100%" data-pa="mkgrp2">Create group</button>`;
 if(s==='inv')b=`<h3 style="margin:0 0 6px">Add members to ${esc(c.name)}</h3><input id="ppq" placeholder="@username, phone number or contact name" value="${esc(PP.q)}" autocomplete="off"><div id="pplist">${ctRows('add',c)}</div>`;
 if(s==='addgrp'){const gs=CONVS.filter(gg=>!isDM(gg)&&isAd(gg)&&!gg.members.some(y=>y.u===PP.cu));b=`<h3 style="margin:0 0 6px">Add ${esc(nm(PP.cu))} to a group</h3><div class="cd2">${gs.map(gg=>`<div class="ri" data-pa="addto" data-g="${gg.id}">${avC(gg,28)} ${esc(gg.name)}</div>`).join('')||'<div class="ri mu">No groups you administer where they are missing.</div>'}</div>`}
 if(s==='cust')b=`<h3 style="margin:0 0 6px">Custom item</h3><label class="fl2">Item<input id="c1" class="fi" maxlength="120" placeholder="e.g. DJ, cake, ice"></label><label class="fl2">Price estimate (UGX)<input id="c2" class="fi" type="number" min="0" value="0"></label><label class="fl2">Quantity<input id="c3" class="fi" type="number" min="1" value="1"></label><button class="pb" data-pa="docust">Add estimate</button><p class="mu">Custom items are labelled as manual estimates, not D&K prices.</p>`;
 if(s==='bud')b=`<h3 style="margin:0 0 6px">Event budget (UGX)</h3><input id="bv" class="fi" type="number" min="0" value="${c.budget}"><button class="pb" data-pa="dobud">Save budget</button>`;
 if(s==='prop'){const k=PP.pk;b=`<h3 style="margin:0 0 6px">Propose ${PK[k][1].toLowerCase()}</h3><input id="pv" class="fi" maxlength="120" type="${k==='date'?'date':k==='time'?'time':'text'}" placeholder="${k==='venue'?'Venue name or address':''}"><button class="pb" data-pa="doprop">Post proposal to chat</button>`}
 if(s==='links')b=`<h3 style="margin:0 0 6px">Invitation links</h3><p class="mu">Send each link only to the person named. It works once, for 7 days. They register in the app Profile, then join automatically.</p>${PP.links.map((l,i)=>`<div class="cd" style="background:#26262a"><b>${esc(l.label)}</b><div class="mu" style="word-break:break-all;margin:4px 0">${esc(l.url)}</div><div class="row"><button class="pb" data-pa="cplink" data-i="${i}">Copy link</button>${navigator.share?`<button class="gb" data-pa="shlink" data-i="${i}">Share</button>`:''}</div></div>`).join('')}`;
 if(s==='exit')b=`<h3 style="margin:0 0 6px">Exit "${esc(c.name)}"?</h3><p class="mu">You will stop receiving messages from this group.</p><button class="lk" style="color:#ff6b6b" data-pa="doexit">Exit group</button><button class="lk" data-pa="shx">Cancel</button>`;
 if(s==='contact'){const u=USERS[PP.cu]||{},grp=c&&!isDM(c)&&c.members.find(x=>x.u===PP.cu);b=`<div class="row">${avU(PP.cu,52)}<div><b>${esc(u.name||'')}</b><div class="mu">@${esc(u.username||'')}${PP.cu===ME?' (you)':''}</div></div></div><div class="cd" style="margin-top:10px;background:#26262a"><div class="mu">Contact point</div><b>+${esc(u.phone||'')}</b></div>${PP.cu===ME?'':`<button class="pb" style="width:100%" data-pa="dm" data-u="${PP.cu}">${ic('chat',16)} Message</button><a class="lk" href="tel:+${wa(u.phone)}">${ic('phone',16)} Call</a><a class="lk" target="_blank" rel="noopener" href="https://wa.me/${wa(u.phone)}">${ic('whats',16)} WhatsApp</a>`}${grp&&isAd(c)&&PP.cu!==ME&&grp.r!=='organiser'?`<button class="lk" data-pa="mkadm" data-u="${PP.cu}">${grp.r==='admin'?'Dismiss as admin':'Make group admin'}</button><button class="lk" style="color:#ff6b6b" data-pa="rmm" data-u="${PP.cu}">Remove from group</button>`:''}`}
 return `<div class="sh" data-pa="shx"><div>${b}</div></div>`}
function draw(){const root=g('pp');if(!root)return;totalBadge();root.className=PP.open?'on':'';if(!PP.open){root.innerHTML='';return}
 const keep=g('ppin'),val=keep?keep.value:'',foc=keep&&SR.activeElement===keep,cs=g('ppcs'),csf=cs&&SR.activeElement===cs,w0=root.querySelector('.wall'),pr=w0&&{top:w0.scrollTop,bot:w0.scrollHeight-w0.scrollTop-w0.clientHeight<80};
 let h;if(AUTH.state!=='in')h=noAcct();else{let c=PP.cid&&conv();if(PP.view!=='chats'&&!c){PP.view='chats';c=null}h=({chats:chatsView,chat:chatView,info:infoView,panel:panelView}[PP.view])(c)+sheet(c)}
 root.innerHTML=h+'<input type="file" id="ppfile" accept="image/jpeg,image/png,image/webp" hidden>';
 const w=root.querySelector('.wall');if(w)w.scrollTop=(pr&&!pr.bot&&PP.view==='chat')?pr.top:w.scrollHeight;
 const i=g('ppin');if(i){i.value=val;if(foc||PP.focus)i.focus();syncGo()}PP.focus=false;const c2=g('ppcs');if(c2&&csf){c2.focus();c2.setSelectionRange(99,99)}}
function syncGo(){const i=g('ppin'),b=g('ppgo');if(i&&b)b.innerHTML=i.value.trim()?ic('send',20):ic('bottle',20)}
function openPP(){PP.open=true;PP.view='chats';PP.sheet=null;draw();if(AUTH.state==='in')loadState()}
/* ---------------- actions ---------------- */
const first=u=>full(u).split(' ')[0];
const withVotes=it=>{if(it.status==='Suggested'&&Object.keys(it.votes).length)it.status='Under discussion'};
async function startDM(u){PP.sheet=null;try{let c=CONVS.find(x=>isDM(x)&&peerOf(x)===u);if(!c){const cid=await D.openDM(u);await D.loadProfiles([ME,u]);await D.loadKeys(ME,USERS);if(!D.latest(cid))await D.newConvKeys(cid,[ME,u],USERS,ME);await loadState();c=conv(cid)}
  PP.view='chat';PP.cid=c.id;markRead(c);draw()}catch(e){fail(e)}}
async function suggest(c,p,q){let it=c.items.find(i=>i.pid===p.id&&live(i));
 if(it){if(!it.by.includes(ME)){it.by.push(ME);D.updItem(it.id,{suggested_by:it.by}).catch(fail)}logA(c,first(ME)+' also suggested '+p.name+' (merged, no duplicate)',it.id);toast('Already on the list. Your suggestion was merged.')}
 else{const row=await D.addItem({conversation_id:c.id,product_id:p.id,name:p.name,category:p.category,qty:q,price_at:fin(p),suggested_by:[ME],created_by:ME});
  it={id:row.id,pid:p.id,name:p.name,cat:p.category,qty:q,price:fin(p),priceAt:fin(p),by:[ME],votes:{},status:'Suggested',hist:[]};c.items.push(it);logA(c,first(ME)+' suggested '+p.name+' ×'+q,it.id)}
 await sendPlain(c,'prod',{item:it.id})}
function pickFile(target,kind){PP.file=target;const f=g('ppfile');f.dataset.file=kind;f.click()}
SR.addEventListener('click',ev0=>{
 if(ev0.target.closest('[data-ra]'))return;
 const x=ev0.target.closest('[data-pa]');if(!x)return;const a=x.dataset.pa,D_=x.dataset,c=PP.cid&&conv(),F=fn=>fn().catch(fail);
 if(a==='shx'){if(ev0.target!==x)return;PP.sheet=null}
 else if(a==='close'){PP.open=false;PP.sheet=null}
 else if(a==='back'){if(PP.view==='chat'){PP.view='chats';PP.cid=null;PP.reply=null}else PP.view='chat'}
 else if(a==='open'){PP.view='chat';PP.cid=D_.id;PP.reply=null;PP.sheet=null;const cc=conv();markRead(cc);if(isAd(cc))ensureKeys(cc)}
 else if(a==='info'){PP.view='info';PP.itab='members'}
 else if(a==='panel'){PP.view='panel';PP.tab=D_.v||'plan'}
 else if(a==='tab'){PP.tab=D_.v;PP.view='panel'}
 else if(a==='itab')PP.itab=D_.v;
 else if(a==='filt')PP.filt=D_.f;
 else if(a==='me'){PP.sheet='me';notifStatus().then(draw)}
 else if(a==='uphoto'){pickFile(ME,'user');return}
 else if(a==='gphoto'){pickFile(c.id,'group');return}
 else if(a==='rmuphoto'){F(async()=>{await D.removeAvatar('user',ME,MEP.avatar_path);MEP.avatar_path=null;USERS[ME].avatar_path=null;draw()})}
 else if(a==='rmgphoto'){F(async()=>{await D.removeAvatar('group',c.id,c.avatar);c.avatar=null;draw()})}
 else if(a==='newchat'){PP.sheet='newchat';PP.q='';PP.lk=[]}
 else if(a==='newgrp'){PP.ng={sel:[],pend:[]};PP.sheet='ng1';PP.q='';PP.lk=[]}
 else if(a==='ngp'){const s=PP.ng.sel,i=s.indexOf(D_.u);i<0?s.push(D_.u):s.splice(i,1)}
 else if(a==='ngo'){const p=PP.ng.pend,i=p.findIndex(z=>z.label===D_.l);i<0?p.push({label:D_.l}):p.splice(i,1)}
 else if(a==='ngnext'){if(!PP.ng.sel.length&&!PP.ng.pend.length){toast('Pick at least one person');return}PP.sheet='ng2'}
 else if(a==='mkgrp'){PP.ng={sel:[D_.u],pend:[]};PP.sheet='ng2'}
 else if(a==='mkgrp2'){const v=id=>g(id).value,name=v('n1').trim();if(!name){toast('Give the group a name');return}const members=PP.ng.sel.slice(),pend=PP.ng.pend.slice(),fields={date:v('n3'),time:v('n7'),venue:v('n4').trim()},cat=v('n2'),guests=+v('n5')||1,budget=+v('n6')||0;PP.sheet=null;toast('Creating group…');
  F(async()=>{const cid=await D.createGroup({name,cat,guests,budget,members});await D.loadProfiles([ME,...members]);await D.newConvKeys(cid,[ME,...members],USERS,ME);
   for(const k of Object.keys(fields))if(fields[k]){const o=await D.addOpt({conversation_id:cid,field:k,value:fields[k],proposed_by:ME});await D.setLock(cid,k,o.id,true)}
   await loadState();const cc=conv(cid);PP.view='chat';PP.cid=cid;await sysMsg(cc,{k:'created'});if(members.length)await sysMsg(cc,{k:'added',ids:members});
   if(pend.length){const links=[];for(const p of pend)links.push({label:p.label,url:await D.createInvite(cid,p.label,ME)});PP.links=links;PP.sheet='links'}draw()})}
 else if(a==='dm'){startDM(D_.u);return}
 else if(a==='invlink'){const lab=D_.l;F(async()=>{PP.links=[{label:lab,url:c?await D.createInvite(c.id,lab,ME):location.origin+location.pathname}];if(c){c.pend.push({id:uidn(),label:lab});logA(c,first(ME)+' invited '+lab+' by link')}PP.sheet='links';draw()});return}
 else if(a==='cplink'){const l=PP.links[+D_.i];try{navigator.clipboard.writeText(l.url);toast('Link copied')}catch(e){toast('Select the link and copy it')}}
 else if(a==='shlink'){const l=PP.links[+D_.i];navigator.share({title:'Join me on D&K',url:l.url}).catch(()=>{})}
 else if(a==='addgrp'){PP.cu=D_.u;PP.sheet='addgrp'}
 else if(a==='addto'){const gg=conv(D_.g),u=PP.cu;PP.sheet=null;F(async()=>{await D.addMember(gg.id,u);gg.members.push({u,r:'member',muted:false});await D.loadProfiles([u]);await D.ensureKeys(gg.id,gg.keyVer,gg.members.map(m=>m.u),USERS,ME);await sysMsg(gg,{k:'added',ids:[u]});toast(nm(u)+' added to '+gg.name);draw()})}
 else if(a==='addm'){const u=D_.u;PP.sheet=null;F(async()=>{await D.addMember(c.id,u);c.members.push({u,r:'member',muted:false});await D.loadProfiles([u]);await D.ensureKeys(c.id,c.keyVer,c.members.map(m=>m.u),USERS,ME);await sysMsg(c,{k:'added',ids:[u]});logA(c,first(ME)+' added '+first(u));draw()})}
 else if(a==='rmm'){const u=D_.u;PP.sheet=null;F(async()=>{await D.removeMember(c.id,u);c.members=c.members.filter(m=>m.u!==u);const v=c.keyVer+1;await D.rotate(c.id,v,c.members.map(m=>m.u),USERS,ME);c.keyVer=v;await sysMsg(c,{k:'removed',id:u});logA(c,first(ME)+' removed '+full(u));draw()})}
 else if(a==='mkadm'){const mm=c.members.find(k=>k.u===D_.u),on=mm.r!=='admin';PP.sheet=null;act(()=>{mm.r=on?'admin':'member'},async()=>{await D.setRole(c.id,D_.u,on?'admin':'member');await sysMsg(c,{k:'admin',id:D_.u,on})})}
 else if(a==='mute'){act(()=>{c.muted=!c.muted},()=>D.updMember(c.id,ME,{muted:c.muted}))}
 else if(a==='onlyadm'){act(()=>{c.adminOnly=!c.adminOnly},async()=>{await D.updConv(c.id,{admin_only:c.adminOnly});await sysMsg(c,{k:'adminonly',on:c.adminOnly})})}
 else if(a==='doexit'){const id=c.id;PP.sheet=null;F(async()=>{await D.leave(id);CONVS=CONVS.filter(z=>z.id!==id);PP.view='chats';PP.cid=null;draw()})}
 else if(a==='plus')PP.sheet='plus';
 else if(a==='go'){const i=g('ppin'),v=i&&i.value.trim();if(v){i.value='';sendText(c,v)}else{PP.sheet='cat';PP.q='';PP.cat='All'}}
 else if(a==='bub'){PP.mid=D_.m;PP.sheet='act'}
 else if(a==='react'){const z=c.msgs.find(k=>k.id===PP.mid);PP.sheet=null;act(()=>{z.re=Object.assign({},z.re);if(z.re[ME]===D_.e)delete z.re[ME];else z.re[ME]=D_.e},()=>D.react(z.id,D_.e))}
 else if(a==='reply'){const z=c.msgs.find(k=>k.id===PP.mid);PP.reply={who:z.who,t:z.t||''};PP.sheet=null;PP.focus=true}
 else if(a==='rcl')PP.reply=null;
 else if(a==='cpmsg'){const z=c.msgs.find(k=>k.id===PP.mid);try{navigator.clipboard.writeText(z.t)}catch(e){}PP.sheet=null;toast('Copied')}
 else if(a==='delm'){const z=c.msgs.find(k=>k.id===PP.mid);PP.sheet=null;act(()=>{z.del=true;z.t=''},()=>D.delMsg(z.id))}
 else if(a==='cart1'){const z=c.msgs.find(k=>k.id===D_.m),p=P(z.payload.pid);if(p&&p.inStock!==false){cart['p:'+p.id]=(cart['p:'+p.id]||0)+(z.payload.qty||1);z.added=true;toast('Added to your cart')}else toast('Out of stock')}
 else if(a==='contact'){PP.cu=D_.u;PP.sheet='contact'}
 else if(a==='sheet'){PP.sheet=D_.v;PP.q='';PP.cat='All';PP.lk=[]}
 else if(a==='fc'){PP.cat=D_.c;PP.sheet='cat'}
 else if(a==='sq'){PP.sel[D_.p]=Math.max(1,(PP.sel[D_.p]||1)+ +D_.d);g('pplist').innerHTML=listRows();return}
 else if(a==='sug'){const p=P(D_.p),q=PP.sel[p.id]||1;PP.sheet=null;if(isDM(c))sendPlain(c,'share',{pid:p.id,qty:q});else F(()=>suggest(c,p,q))}
 else if(a==='v'){const it=c.items.find(i=>i.id===D_.i),val=+D_.d,nv=it.votes[ME]===val?0:val;act(()=>{if(nv)it.votes[ME]=nv;else delete it.votes[ME];withVotes(it)},async()=>{await D.vote(c.id,'item',it.id,ME,nv);logA(c,first(ME)+(nv>0?' voted for ':nv<0?' voted against ':' removed their vote on ')+it.name,it.id)})}
 else if(a==='q'){const it=c.items.find(i=>i.id===D_.i),n=Math.max(1,it.qty+ +D_.d);if(n!==it.qty){const o=it.qty;act(()=>{it.hist.push({ts:Date.now(),t:'Quantity '+o+' → '+n+' by '+first(ME)});it.qty=n},async()=>{await D.updItem(it.id,{qty:n});logA(c,first(ME)+' changed '+it.name+' quantity '+o+' → '+n,it.id)})}}
 else if(a==='st'){if(!isAd(c)){toast('Only admins can change item status');return}const it=c.items.find(i=>i.id===D_.i),o=it.status;act(()=>{it.status=D_.s;it.hist.push({ts:Date.now(),t:o+' → '+D_.s+' by '+first(ME)})},async()=>{await D.updItem(it.id,{status:D_.s});logA(c,first(ME)+' marked '+it.name+' '+D_.s,it.id)})}
 else if(a==='docust'){const v=id=>g(id).value,n=v('c1').trim();if(!n)return;const q=Math.max(1,+v('c3')||1),pr=Math.max(0,+v('c2')||0);PP.sheet=null;F(async()=>{const row=await D.addItem({conversation_id:c.id,product_id:null,name:n,category:'Custom',qty:q,price_at:pr,suggested_by:[ME],created_by:ME});c.items.push({id:row.id,pid:null,name:n,cat:'Custom',qty:q,price:pr,priceAt:pr,by:[ME],votes:{},status:'Suggested',hist:[]});logA(c,first(ME)+' added custom item '+n,row.id);draw()})}
 else if(a==='bud'){PP.sheet='bud'}
 else if(a==='dobud'){const v=+g('bv').value;PP.sheet=null;if(v>=0){const o=c.budget;act(()=>{c.budget=v},async()=>{await D.updConv(c.id,{budget:v});logA(c,first(ME)+' changed the budget '+m(o)+' → '+m(v))})}}
 else if(a==='prop'){PP.pk=D_.k;PP.sheet='prop'}
 else if(a==='doprop'){const v=g('pv').value.trim(),k=PP.pk;if(!v)return;PP.sheet=null;PP.view='chat';F(async()=>{const row=await D.addOpt({conversation_id:c.id,field:k,value:v,proposed_by:ME});c.plan[k].opts.push({id:row.id,v,by:ME,votes:{}});logA(c,first(ME)+' proposed '+PK[k][1].toLowerCase()+': '+fv(k,v));await sendPlain(c,'poll',{pk:k,oid:row.id})})}
 else if(a==='ov'){const o=c.plan[D_.k].opts.find(z=>z.id===D_.o),nv=o.votes[ME]?0:1;act(()=>{if(nv)o.votes[ME]=1;else delete o.votes[ME]},()=>D.vote(c.id,'option',o.id,ME,nv))}
 else if(a==='lock'){if(!isAd(c))return;const o=c.plan[D_.k].opts.find(z=>z.id===D_.o);act(()=>{c.plan[D_.k].final=o.id},async()=>{await D.setLock(c.id,D_.k,o.id,true);logA(c,first(ME)+' locked in '+PK[D_.k][1].toLowerCase()+': '+fv(D_.k,o.v));await sysMsg(c,{k:'lock',pk:D_.k,v:o.v})})}
 else if(a==='unlock'){const fid=c.plan[D_.k].final,o=c.plan[D_.k].opts.find(z=>z.id===fid);act(()=>{c.plan[D_.k].final=null},async()=>{await D.setLock(c.id,D_.k,fid,false);logA(c,first(ME)+' reopened '+PK[D_.k][1].toLowerCase());await sysMsg(c,{k:'unlock',pk:D_.k,v:o&&o.v})})}
 else if(a==='nsound'){NS.sound=!NS.sound;saveNS();if(NS.sound)ding()}
 else if(a==='nprev'){NS.preview=!NS.preview;saveNS()}
 else if(a==='ntest'){toast('Test alert in 4 seconds. Switch to another app or tab now.');setTimeout(()=>{ding();const foc=document.visibilityState==='visible'&&document.hasFocus();
   if(document.visibilityState==='visible')banner({id:'',type:'dm',members:[{u:ME},{u:ME}]},{who:ME},'D&K test','Alerts are working on this device');if(sysOK()&&!foc)showSys('D&K test','Alerts are working on this device','test')},4000);return}
 else if(a==='nsys'){if(NS.sys){NS.sys=false;saveNS()}else F(async()=>{if(typeof Notification==='undefined'){toast('Not supported in this browser. On iPhone, add D&K to your Home Screen first.');return}
   const pm=Notification.permission==='granted'?'granted':await Notification.requestPermission();if(pm==='granted'){NS.sys=true;saveNS();await ensureSW();toast('Alerts are on')}else toast('Notifications are blocked. Allow them in your browser settings.');draw()})}
 else if(a==='npush'){F(async()=>{if(NS.push){await disablePush();toast('Closed-app alerts are off')}else{await enablePush();toast('Closed-app alerts are on')}draw()})}
 else if(a==='banner'){g('ppnote').innerHTML='';openChat(D_.id);return}
 else if(a==='ctallow'){askContacts().then(()=>{draw();drawReg()});return}
 else if(a==='gotoprof'){PP.open=false;tab='profile';msg='';render()}
 else if(a==='mn'){const i=g('ppin');i.value=i.value.replace(/@\w*$/,'@'+D_.un+' ');g('ppmn').style.display='none';i.focus();syncGo();return}
 else if(a==='tocart'){let n=0,sk=0;c.items.filter(i=>i.status==='Approved').forEach(i=>{const p=i.pid&&P(i.pid);if(p&&p.inStock!==false){cart['p:'+p.id]=(cart['p:'+p.id]||0)+i.qty;n++}else sk++});if(!n){toast('No approved D&K items to send yet');return}PP.open=false;tab='cart';render();if(sk)toast(sk+' item(s) skipped (custom or out of stock)')}
 draw()});
let lkT;
SR.addEventListener('input',e1=>{const t=e1.target;
 if(t.id==='ppsq'){PP.q=t.value;g('pplist').innerHTML=listRows()}
 else if(t.id==='ppq'){PP.q=t.value;const mode=PP.sheet==='ng1'?'group':PP.sheet==='inv'?'add':'chat',cc=PP.cid&&conv();g('pplist').innerHTML=ctRows(mode,cc);clearTimeout(lkT);
  if(t.value.trim().length>=3)lkT=setTimeout(async()=>{try{PP.lk=await D.lookup(t.value)}catch(e){PP.lk=[]}const el=g('pplist');if(el&&PP.q===t.value)el.innerHTML=ctRows(mode,cc)},350);else PP.lk=[]}
 else if(t.id==='ppcs'){PP.cq=t.value;g('pplst').innerHTML=chatRows()}
 else if(t.id==='ppin'){syncGo();const c=conv(),mm=t.value.match(/@(\w*)$/),box=g('ppmn');if(!mm||isDM(c)){box.style.display='none';return}const q=mm[1].toLowerCase(),r=c.members.filter(x=>x.u!==ME&&(uname(x.u)+full(x.u)).toLowerCase().includes(q));box.innerHTML=r.map(x=>`<div data-pa="mn" data-un="${esc(uname(x.u))}"><b>${esc(full(x.u))}</b><small>@${esc(uname(x.u))} · +${esc((USERS[x.u]||{}).phone||'')}</small></div>`).join('');box.style.display=r.length?'block':'none'}});
SR.addEventListener('keydown',k=>{if(k.target.id==='ppin'&&k.key==='Enter'){k.preventDefault();SR.querySelector('[data-pa=go]').click()}});
/* ---------------- shop integration: nav button + Profile page card ---------------- */
document.head.insertAdjacentHTML('beforeend','<style>.nav button.ppnav{color:var(--ink);position:relative}.nav button.ppnav .ppbadge{position:absolute;top:-30px;left:calc(50% + 6px);background:#e5484d;color:#fff;font:700 11px/16px sans-serif;font-style:normal;min-width:20px;height:20px;border-radius:10px;padding:0 5px;align-items:center;justify-content:center;border:2px solid var(--card);z-index:3}.nav button.ppnav .ic{background:#111!important;color:#ffc244;border-radius:50%;width:50px;height:50px;padding:0!important;display:flex;align-items:center;justify-content:center;margin-top:-22px;box-shadow:0 0 0 4px var(--card),0 5px 14px #0006;border:2px solid #ffc244}.nav button.ppnav .ic svg{width:24px;height:24px}.nav button.ppnav.on:before{display:none}.nav button.ppnav em{font-weight:700}</style>');
function inject(){const n=document.querySelector('.nav');
 if(n&&!n.querySelector('.ppnav')){const b=document.createElement('button');b.type='button';b.className='ppnav';b.setAttribute('aria-label','Party Planner');b.innerHTML='<b class="ic">'+ic('chats',24)+'</b><em class="nl">Planner</em><i class="ppbadge" style="display:none"></i>';n.insertBefore(b,n.children[Math.floor(n.children.length/2)])}
 if(typeof tab!=='undefined'&&tab==='profile'){const mn=document.querySelector('#app main');if(mn&&!mn.querySelector('#dkregslot')){const h=document.createElement('div');h.id='dkregslot';const sr=h.attachShadow({mode:'open'});
  sr.innerHTML='<style>'+window.PP_CSS+'</style><div class="cd" data-rm="1" style="background:var(--card);color:var(--ink)"></div>';mn.insertBefore(h,mn.children[2]||null);wire(sr);roots.add(sr);drawReg()}}}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.ppnav'))openPP()});
setInterval(()=>{[...roots,SR].forEach(r=>r.querySelectorAll('[data-rt]').forEach(b=>{const n=Math.max(0,30-Math.floor((Date.now()-REG.sent)/1000));b.textContent=n>0?'Resend in '+n+'s':'Resend code';b.disabled=n>0}))},1000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&AUTH.state==='in'&&Date.now()-lastSync>6000)loadState(false)});
window.addEventListener('online',()=>{if(AUTH.state==='in')loadState(false)});
(function start(){if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.type==='pp-open')openChat(e.data.cid)});const app=document.getElementById('app');if(app)new MutationObserver(inject).observe(app,{childList:true,subtree:true});inject();
 const t=setInterval(()=>{if(!window._sb)return;clearInterval(t);D.init(window._sb);boot().then(()=>{if(D.joinToken()&&AUTH.state!=='in'){REG.invite=true;REG.mode='register';try{tab='profile';render()}catch(e){}}})},150)})();
})();
