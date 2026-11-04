/* DEV / DEMO ONLY. An in-memory stand-in for Supabase so the planner can be tried without a backend.
 * Never ship this file to production. It emulates: auth + OTP, row visibility (like RLS), RPCs, storage, realtime,
 * plus four demo friends who really use the same end-to-end encryption as real users. */
(function(){
'use strict';
const C=window.PPCrypto;window.DK_DEMO=true;
window.DK_DEMO_CONTACTS=[['Sarah Nakato','0772 100 200'],['Moses Okello','0701 300 400'],['Grace Auma','0753 500 600'],['Daniel Kato','0782 700 800'],['Peter Mugisha','0755 111 222'],['Aisha Namukasa','0772 345 678'],['Brian Ssemakula','0701 999 000'],['Mum','0782 555 123']].map(([name,phone])=>({name,phone}));
const shop=window.supabase.createClient();   /* the shop's own mock (catalogue, promos) loaded before this file */
const uuid=()=>crypto.randomUUID(),iso=t=>new Date(t||Date.now()).toISOString(),dg=p=>String(p||'').replace(/\D/g,'');
const names=['pp_profiles','pp_conversations','pp_members','pp_member_keys','pp_messages','pp_items','pp_plan_options','pp_votes','pp_activity','pp_invites','pp_key_backups'],T={};names.forEach(n=>T[n]=[]);
const AU=[];let CUR=null,PEND=null,subs=[];
const me=()=>CUR&&!CUR.is_anonymous?CUR.id:null;
const myConvs=()=>new Set(T.pp_members.filter(m=>m.user_id===me()).map(m=>m.conversation_id));
const isAdm=cid=>T.pp_members.some(m=>m.conversation_id===cid&&m.user_id===me()&&m.role!=='member');
const shares=u=>{const mc=myConvs();return T.pp_members.some(m=>m.user_id===u&&mc.has(m.conversation_id))};
function visible(t,r){const u=me();if(!u)return false;const mc=myConvs();
 switch(t){case'pp_members':case'pp_messages':case'pp_items':case'pp_plan_options':case'pp_votes':case'pp_activity':return mc.has(r.conversation_id);
  case'pp_conversations':return mc.has(r.id);case'pp_member_keys':return r.user_id===u||isAdm(r.conversation_id);case'pp_profiles':return r.id===u||shares(r.id);
  case'pp_invites':return isAdm(r.conversation_id);case'pp_key_backups':return r.user_id===u}return false}
function notify(t,type,nw,old){subs.forEach(s=>{if(s.table===t&&visible(t,nw||old))setTimeout(()=>s.cb({eventType:type,new:nw||{},old:old||{},table:t}),0)})}
const PK={pp_votes:['target_type','target_id','user_id'],pp_member_keys:['conversation_id','user_id','version'],pp_key_backups:['user_id'],pp_members:['conversation_id','user_id']};
const pub=u=>u&&{id:u.id,is_anonymous:!!u.is_anonymous,phone:u.phone,email:u.email};
const err=m=>({data:null,error:{message:m}});
/* ---------- demo friends (real keys, real encryption) ---------- */
const bots=[['sarah','Sarah Nakato','256772100200'],['moses','Moses Okello','256701300400'],['grace','Grace Auma','256753500600'],['daniel','Daniel Kato','256782700800']].map(([un,name,phone])=>({id:'bot-'+un,un,name,phone,keys:{}}));
const ready=(async()=>{for(const b of bots){const k=await C.generate();b.priv=await C.importPriv(k.priv);b.pubkey=k.pub;
 T.pp_profiles.push({id:b.id,username:b.un,name:b.name,phone:b.phone,phone_hash:await C.sha256hex('dk-pp-v1:'+b.phone),phone_verified:true,email:null,avatar_path:null,pubkey:k.pub,created_at:iso()})}})();
const bot=u=>bots.find(b=>b.id===u),botsIn=cid=>bots.filter(b=>T.pp_members.some(m=>m.conversation_id===cid&&m.user_id===b.id));
async function botKey(b,cid,ver){if(b.keys[cid]&&b.keys[cid][ver])return b.keys[cid][ver];const r=T.pp_member_keys.find(k=>k.conversation_id===cid&&k.user_id===b.id&&k.version===ver);if(!r)return null;
 const w=T.pp_profiles.find(p=>p.id===r.wrapped_by);try{const k=await C.unwrap(r.wrapped_key,b.priv,w.pubkey);(b.keys[cid]=b.keys[cid]||{})[ver]=k;return k}catch(e){return null}}
function botSay(b,cid,text,delay){setTimeout(async()=>{const cv=T.pp_conversations.find(c=>c.id===cid);if(!cv)return;const k=await botKey(b,cid,cv.key_version);if(!k)return;
 const e=await C.enc(k,{t:text},cid+':'+b.id),row={id:uuid(),conversation_id:cid,sender_id:b.id,kind:'text',ciphertext:e.ciphertext,iv:e.iv,key_version:cv.key_version,payload:{},reactions:{},deleted_at:null,created_at:iso()};T.pp_messages.push(row);notify('pp_messages','INSERT',row)},delay)}
function botVote(b,cid,type,id,delay){setTimeout(()=>{const row={conversation_id:cid,target_type:type,target_id:id,user_id:b.id,value:1};T.pp_votes.push(row);notify('pp_votes','INSERT',row)},delay)}
const greeted=new Set(),SEEDED=new Set(),SEEDEDU=new Set();window.__DK_DEBUG_DB=T;
function after(t,row){const u=me();
 if(t==='pp_messages'&&row.kind==='text'&&row.sender_id===u){const cv=T.pp_conversations.find(c=>c.id===row.conversation_id),bs=botsIn(row.conversation_id);if(!cv||!bs.length)return;
  if(cv.type==='dm'){botSay(bs[0],cv.id,['Okay','Sounds good!','Let me check and get back to you','Haha yes!','Perfect, thanks'][Math.floor(Math.random()*5)],1400)}
  else bs.forEach(async b=>{const k=await C.dec(await botKey(b,cv.id,row.key_version),row.ciphertext,row.iv,cv.id+':'+u).catch(()=>null);if(k&&k.t&&k.t.toLowerCase().includes('@'+b.un))botSay(b,cv.id,'Seen, thanks',1200)})}
 if(t==='pp_items'&&row.created_by===u){const bs=botsIn(row.conversation_id);if(bs[0]){botVote(bs[0],row.conversation_id,'item',row.id,1500);botSay(bs[0],row.conversation_id,'Good pick',1700)}}
 if(t==='pp_plan_options'&&row.proposed_by===u){const bs=botsIn(row.conversation_id);if(bs[0])botVote(bs[0],row.conversation_id,'option',row.id,1500)}
 if(t==='pp_member_keys'&&bot(row.user_id)&&!SEEDED.has(row.conversation_id)&&!greeted.has(row.conversation_id+row.user_id)){greeted.add(row.conversation_id+row.user_id);botSay(bot(row.user_id),row.conversation_id,'Hi everyone, thanks for adding me',1300)}}
async function seedFor(user){await ready;const now=Date.now(),H=36e5,B=Object.fromEntries(bots.map(b=>[b.un,b])),fp=await C.fingerprint(user.pubkey);
 const f=r=>(S.products.find(p=>r.test(p.name))||S.products[0]);
 async function mk(o){const id=uuid();SEEDED.add(id);T.pp_conversations.push({id,type:o.type,name:o.name||null,category:o.cat||null,guests:o.guests||30,budget:o.budget||0,avatar_path:null,admin_only:false,key_version:1,created_by:o.members[0][0],created_at:iso(o.created)});
  o.members.forEach(([u,r])=>T.pp_members.push({conversation_id:id,user_id:u,role:r,muted:false,last_read_at:iso(o.read||o.created),joined_at:iso(o.created)}));
  const key=await C.newConvKey();bots.forEach(b=>{if(o.members.some(m=>m[0]===b.id))(b.keys[id]=b.keys[id]||{})[1]=key});
  T.pp_member_keys.push({conversation_id:id,user_id:user.id,version:1,wrapped_key:await C.wrap(key,o.keyBot.priv,user.pubkey),wrapped_by:o.keyBot.id,recipient_fp:fp,created_at:iso(o.created)});
  const say=async(who,text,ts)=>{const e=await C.enc(key,{t:text},id+':'+who);T.pp_messages.push({id:uuid(),conversation_id:id,sender_id:who,kind:'text',ciphertext:e.ciphertext,iv:e.iv,key_version:1,payload:{},reactions:{},deleted_at:null,created_at:iso(ts)})};
  const sysm=async(a,ob,ts)=>{const e=await C.enc(key,Object.assign({a},ob),id+':'+a);T.pp_messages.push({id:uuid(),conversation_id:id,sender_id:a,kind:'sys',ciphertext:e.ciphertext,iv:e.iv,key_version:1,payload:{},reactions:{},deleted_at:null,created_at:iso(ts)})};
  const plain=(who,kind,payload,ts)=>T.pp_messages.push({id:uuid(),conversation_id:id,sender_id:who,kind,ciphertext:null,iv:null,key_version:null,payload,reactions:{},deleted_at:null,created_at:iso(ts)});
  return {id,say,sysm,plain}}
 const u=user.id,e1=await mk({type:'group',name:"Kevin's 30th Birthday",cat:'Birthday party',guests:40,budget:1500000,created:now-72*H,read:now-8*H,keyBot:B.sarah,members:[[u,'organiser'],['bot-sarah','admin'],['bot-moses','member'],['bot-grace','member'],['bot-daniel','member']]});
 const opt=(cid,field,value,by,locked,votes)=>{const id=uuid();T.pp_plan_options.push({id,conversation_id:cid,field,value,proposed_by:by,locked,created_at:iso(now-5*H)});votes.forEach(v=>T.pp_votes.push({conversation_id:cid,target_type:'option',target_id:id,user_id:v,value:1}));return id};
 const item=(cid,p,qty,by,st,votes,ts)=>{const id=uuid();T.pp_items.push({id,conversation_id:cid,product_id:p.id,name:p.name,category:p.category,qty,price_at:fin(p),status:st,suggested_by:[by],created_by:by,created_at:iso(ts)});Object.entries(votes).forEach(([v,val])=>T.pp_votes.push({conversation_id:cid,target_type:'item',target_id:id,user_id:v,value:val}));return id};
 await e1.sysm(u,{k:'created'},now-72*H);await e1.say('bot-sarah',"Hey team! Kevin turns 30 soon. Let's sort the date, venue and drinks here.",now-6*H);
 const d1=opt(e1.id,'date','2026-12-19','bot-sarah',false,['bot-moses']),d2=opt(e1.id,'date','2026-12-20',u,true,['bot-sarah','bot-grace',u]);e1.plain('bot-sarah','poll',{pk:'date',oid:d1},now-5.8*H);e1.plain(u,'poll',{pk:'date',oid:d2},now-5.5*H);
 const v1=opt(e1.id,'venue','Kololo Gardens','bot-moses',false,['bot-sarah','bot-grace']),v2=opt(e1.id,'venue','Serena Lawns','bot-grace',false,['bot-moses']);
 await e1.say('bot-moses','What about Kololo Gardens? Lots of parking.',now-5*H);e1.plain('bot-moses','poll',{pk:'venue',oid:v1},now-4.9*H);e1.plain('bot-grace','poll',{pk:'venue',oid:v2},now-4.7*H);
 await e1.say('bot-grace','Serena is nicer but pricier. Not sure about the time either, evening?',now-4.6*H);
 const i1=item(e1.id,f(/Heineken/),5,'bot-moses','Approved',{'bot-sarah':1,[u]:1,'bot-grace':1},now-4*H);e1.plain('bot-moses','prod',{item:i1},now-4*H);await e1.say('bot-moses','We should get five packs of beer for the party.',now-3.9*H);
 const i2=item(e1.id,f(/Smirnoff/),4,'bot-grace','Suggested',{'bot-sarah':1,'bot-moses':-1},now-2*H);e1.plain('bot-grace','prod',{item:i2},now-2*H);await e1.say('bot-grace','How about this for cocktails? @moses what do you think? @daniel can you check delivery?',now-2*H+6e4);
 [['bot-moses','Moses suggested '+f(/Heineken/).name+' ×5',i1,4],[u,'Approved '+f(/Heineken/).name,i1,3]].forEach(([a,t,it,h])=>T.pp_activity.push({id:T.pp_activity.length+1,conversation_id:e1.id,actor:a,text:t,item_id:it,created_at:iso(now-h*H)}));
 const e2=await mk({type:'group',name:'Office End-of-Year Party',cat:'Corporate event',guests:60,budget:3000000,created:now-216*H,read:now-30*H,keyBot:B.daniel,members:[['bot-daniel','organiser'],[u,'member'],['bot-grace','member']]});
 await e2.say('bot-daniel','Hi all, planning our year-end party. Please propose dates and venues in the event planner.',now-20*H);await e2.say('bot-grace','On it',now-19*H);
 const d1m=await mk({type:'dm',created:now-100*H,read:now-1*H,keyBot:B.sarah,members:[['bot-sarah','admin'],[u,'admin']]});
 await d1m.say(u,"Hi Sarah, are you coming to Kevin's party?",now-8*H);await d1m.say('bot-sarah',"Yes! I'll bring the cake.",now-7.9*H);await d1m.say('bot-sarah','Did you see the vodka I liked in the group?',now-.5*H);
 const d2m=await mk({type:'dm',created:now-120*H,read:now-29*H,keyBot:B.moses,members:[['bot-moses','admin'],[u,'admin']]});
 await d2m.say('bot-moses','Can you pick up the ice on Friday?',now-30*H);await d2m.say(u,'Sure, no problem',now-29.5*H)}
/* ---------- query builder ---------- */
function qb(table){const st={op:'select',f:[],ord:null,lim:null,single:null,pl:null,ret:false};
 const run=async()=>{const u=me();if(!u)return err('Not signed in');const rows=T[table];
  const flt=r=>st.f.every(fn=>fn(r));
  if(st.op==='select'){let r=rows.filter(x=>visible(table,x)&&flt(x));if(st.ord)r.sort((a,b)=>(a[st.ord[0]]<b[st.ord[0]]?-1:1)*(st.ord[1]?1:-1));if(st.lim)r=r.slice(0,st.lim);
   if(st.single)return r[0]?{data:r[0],error:null}:(st.single==='maybe'?{data:null,error:null}:err('No rows'));return {data:r,error:null}}
  if(st.op==='insert'||st.op==='upsert'){const out=[];for(const raw of [].concat(st.pl)){const row=Object.assign({},raw);
    if(!row.id&&!(table in PK)&&table!=='pp_activity')row.id=uuid();if(!row.created_at&&table!=='pp_key_backups')row.created_at=iso();
    if(table==='pp_activity')row.id=T.pp_activity.length+1000;
    if(table==='pp_profiles'&&window.__DK_FAIL_PROFILE){window.__DK_FAIL_PROFILE=0;return err('new row for relation "pp_profiles" violates check constraint "pp_profiles_phone_check"')}
    if(table==='pp_profiles'){if(row.id!==u)return err('RLS: not your profile');if(rows.some(r=>r.username===String(row.username).toLowerCase()))return err('duplicate key value violates unique constraint');row.username=row.username.toLowerCase();
     const au=AU.find(a=>a.id===u);row.phone_verified=!!(au&&au.phone_ok&&dg(au.phone)===row.phone);row.phone_hash=row.phone?await C.sha256hex('dk-pp-v1:'+row.phone):null;row.avatar_path=null}
    if(table==='pp_messages'){if(row.sender_id!==u||!T.pp_members.some(m=>m.conversation_id===row.conversation_id&&m.user_id===u))return err('RLS: cannot post here');const cv=T.pp_conversations.find(c=>c.id===row.conversation_id);if(cv.admin_only&&!isAdm(cv.id))return err('Only admins can send messages');Object.assign(row,{reactions:{},deleted_at:null,payload:row.payload||{}})}
    if(table==='pp_members'){if(!isAdm(row.conversation_id)||row.role!=='member')return err('RLS: only admins can add members');Object.assign(row,{muted:false,last_read_at:iso(),joined_at:iso()})}
    if(table==='pp_member_keys'&&(!isAdm(row.conversation_id)||row.wrapped_by!==u))return err('RLS: only admins can share keys');
    if(['pp_items','pp_plan_options','pp_activity','pp_votes'].includes(table)&&!T.pp_members.some(m=>m.conversation_id===row.conversation_id&&m.user_id===u))return err('RLS: not a member');
    if(table==='pp_items')Object.assign(row,{status:'Suggested'});if(table==='pp_plan_options')row.locked=false;
    if(table==='pp_invites'){if(!isAdm(row.conversation_id))return err('RLS: admins only');Object.assign(row,{used_by:null,expires_at:iso(Date.now()+7*864e5)})}
    const k=PK[table];const ex=k&&rows.find(r=>k.every(c=>r[c]===row[c]));
    if(ex){if(st.op==='insert')return err('duplicate key');Object.assign(ex,row);out.push(ex);notify(table,'UPDATE',ex);continue}
    rows.push(row);out.push(row);notify(table,'INSERT',row);after(table,row)}
   return {data:st.single?out[0]:out,error:null}}
  if(st.op==='update'){const t=rows.filter(x=>visible(table,x)&&flt(x));
   for(const r of t){if(table==='pp_conversations'&&!isAdm(r.id))return err('RLS: admins only');if(table==='pp_plan_options'&&!isAdm(r.conversation_id))return err('RLS: admins only');
    if(table==='pp_items'&&st.pl.status&&st.pl.status!==r.status&&!isAdm(r.conversation_id))return err('Only admins can change item status');
    if(table==='pp_members'&&r.user_id!==u)return err('RLS');Object.assign(r,st.pl);notify(table,'UPDATE',r);if(table==='pp_profiles'&&st.pl.pubkey){if(SEEDEDU.has(r.id))await reshare(r.id);else{SEEDEDU.add(r.id);await seedFor(r)}}}return {data:t,error:null}}
  if(st.op==='delete'){const t=rows.filter(x=>visible(table,x)&&flt(x));for(const r of t){if(table==='pp_members'&&(!isAdm(r.conversation_id)||r.role==='organiser'))return err('RLS: not allowed');if(table==='pp_votes'&&r.user_id!==u)return err('RLS');rows.splice(rows.indexOf(r),1);notify(table,'DELETE',null,r)}return {data:t,error:null}}};
 const b={select(){if(st.op!=='select')st.ret=true;return b},eq(k,v){st.f.push(r=>r[k]===v);return b},in(k,a){st.f.push(r=>a.includes(r[k]));return b},neq(k,v){st.f.push(r=>r[k]!==v);return b},
  order(k,o){st.ord=[k,!(o&&o.ascending===false)];return b},limit(n){st.lim=n;return b},single(){st.single='one';return b},maybeSingle(){st.single='maybe';return b},
  insert(p){st.op='insert';st.pl=p;return b},upsert(p){st.op='upsert';st.pl=p;return b},update(p){st.op='update';st.pl=p;return b},delete(){st.op='delete';return b},then(a,c){return run().then(a,c)}};return b}
/* ---------- RPCs (mirror supabase-planner.sql) ---------- */
const RPC={
 async pp_username_available({p_username}){return {data:!T.pp_profiles.some(p=>p.username===String(p_username).toLowerCase()),error:null}},
 async pp_match_contacts({p_hashes}){if(!me())return err('not allowed');return {data:T.pp_profiles.filter(p=>p.phone_verified&&p_hashes.includes(p.phone_hash)&&p.id!==me()).map(p=>({id:p.id,username:p.username,name:p.name,avatar_path:p.avatar_path,phone_hash:p.phone_hash})),error:null}},
 async pp_lookup({p_username,p_phone_hash}){if(!me())return err('not allowed');return {data:T.pp_profiles.filter(p=>p.id!==me()&&((p_username&&p.username===String(p_username).toLowerCase())||(p_phone_hash&&p.phone_verified&&p.phone_hash===p_phone_hash))).map(p=>({id:p.id,username:p.username,name:p.name,avatar_path:p.avatar_path})),error:null}},
 async pp_create_conversation(a){if(!me())return err('not allowed');const id=uuid();T.pp_conversations.push({id,type:'group',name:String(a.p_name).slice(0,80),category:a.p_category,guests:Math.max(1,a.p_guests||30),budget:Math.max(0,a.p_budget||0),avatar_path:null,admin_only:false,key_version:1,created_by:me(),created_at:iso()});
  T.pp_members.push({conversation_id:id,user_id:me(),role:'organiser',muted:false,last_read_at:iso(),joined_at:iso()});(a.p_members||[]).forEach(u=>{if(u!==me()&&T.pp_profiles.some(p=>p.id===u))T.pp_members.push({conversation_id:id,user_id:u,role:'member',muted:false,last_read_at:iso(),joined_at:iso()})});return {data:id,error:null}},
 async pp_open_dm({p_other}){if(!me()||!T.pp_profiles.some(p=>p.id===p_other))return err('not allowed');const mc=myConvs();let cv=T.pp_conversations.find(c=>c.type==='dm'&&mc.has(c.id)&&T.pp_members.some(m=>m.conversation_id===c.id&&m.user_id===p_other));
  if(!cv){cv={id:uuid(),type:'dm',name:null,category:null,guests:30,budget:0,avatar_path:null,admin_only:false,key_version:1,created_by:me(),created_at:iso()};T.pp_conversations.push(cv);[me(),p_other].forEach(u=>T.pp_members.push({conversation_id:cv.id,user_id:u,role:'admin',muted:false,last_read_at:iso(),joined_at:iso()}))}return {data:cv.id,error:null}},
 async pp_set_role({p_cid,p_user,p_role}){if(!isAdm(p_cid))return err('not allowed');const m=T.pp_members.find(x=>x.conversation_id===p_cid&&x.user_id===p_user&&x.role!=='organiser');if(m){m.role=p_role;notify('pp_members','UPDATE',m)}return {data:null,error:null}},
 async pp_leave({p_cid}){const ms=T.pp_members.filter(m=>m.conversation_id===p_cid),mine=ms.find(m=>m.user_id===me());if(!mine)return err('not allowed');if(mine.role==='organiser'){const n=ms.find(m=>m!==mine);if(n)n.role='organiser'}
  T.pp_members.splice(T.pp_members.indexOf(mine),1);if(!T.pp_members.some(m=>m.conversation_id===p_cid))T.pp_conversations.splice(T.pp_conversations.findIndex(c=>c.id===p_cid),1);return {data:null,error:null}},
 async pp_react({p_mid,p_emoji}){const m=T.pp_messages.find(x=>x.id===p_mid);if(!m||!visible('pp_messages',m))return err('not allowed');m.reactions=Object.assign({},m.reactions);if(m.reactions[me()]===p_emoji)delete m.reactions[me()];else m.reactions[me()]=p_emoji;notify('pp_messages','UPDATE',m);return {data:null,error:null}},
 async pp_delete_message({p_mid}){const m=T.pp_messages.find(x=>x.id===p_mid&&x.sender_id===me());if(m){m.deleted_at=iso();m.ciphertext=null;m.iv=null;m.payload={};notify('pp_messages','UPDATE',m)}return {data:null,error:null}},
 async pp_accept_invite({p_token}){const h=await C.sha256hex(p_token),inv=T.pp_invites.find(i=>i.token_hash===h&&!i.used_by&&Date.parse(i.expires_at)>Date.now());if(!inv)return err('This invitation link is invalid or has expired');
  if(!T.pp_members.some(m=>m.conversation_id===inv.conversation_id&&m.user_id===me())){const row={conversation_id:inv.conversation_id,user_id:me(),role:'member',muted:false,last_read_at:iso(),joined_at:iso()};T.pp_members.push(row);notify('pp_members','INSERT',row)}inv.used_by=me();return {data:inv.conversation_id,error:null}}};
/* ---------- auth + OTP ---------- */
const otp=()=>String(Math.floor(1e5+Math.random()*9e5));
const auth={
 async getSession(){return {data:{session:CUR?{user:pub(CUR)}:null}}},async getUser(){return {data:{user:pub(CUR)}}},
 async signInAnonymously(){CUR={id:uuid(),is_anonymous:true};AU.push(CUR);return {data:{session:{user:pub(CUR)}},error:null}},
 async updateUser(a){if(!CUR)return err('no session');if(a.password){CUR.password=a.password;return {data:{user:pub(CUR)},error:null}}
  const dest=a.phone||a.email;PEND={user:CUR,kind:a.phone?'phone_change':'email_change',target:dest,code:otp()};window.__DK_OTP=()=>({dest,code:PEND&&PEND.code});return {data:{user:pub(CUR)},error:null}},
 async signUp(a){const dest=a.phone||a.email;if(AU.some(u=>(a.phone&&u.phone===a.phone&&u.phone_ok)||(a.email&&u.email===a.email&&u.email_ok)))return err('User already registered');
  const u={id:uuid(),is_anonymous:false,password:a.password};AU.push(u);PEND={user:u,kind:a.phone?'sms':'signup',target:dest,code:otp()};window.__DK_OTP=()=>({dest,code:PEND&&PEND.code});return {data:{user:pub(u)},error:null}},
 async resend(a){if(!PEND)return err('nothing pending');PEND.code=otp();return {data:{},error:null}},
 async verifyOtp(a){if(!PEND||String(a.token)!==PEND.code||PEND.kind!==a.type)return err('Invalid or expired code');const u=PEND.user;
  if(a.phone){u.phone=PEND.target;u.phone_ok=true}else{u.email=PEND.target;u.email_ok=true}u.is_anonymous=false;CUR=u;PEND=null;window.__DK_OTP=null;return {data:{user:pub(u),session:{user:pub(u)}},error:null}},
 async signInWithPassword(a){const u=AU.find(x=>!x.is_anonymous&&x.password===a.password&&((a.email&&x.email===a.email)||(a.phone&&x.phone===a.phone)));if(!u)return err('Invalid login credentials');CUR=u;return {data:{user:pub(u),session:{user:pub(u)}},error:null}},
 async signOut(){CUR=null;return {error:null}},
 async resetPasswordForEmail(email){const u=AU.find(x=>x.email===email&&x.email_ok);if(u){PEND={user:u,kind:'recovery',target:email,code:otp()};window.__DK_OTP=()=>({dest:email,code:PEND&&PEND.code})}return {data:{},error:null}},
 async setSession(){CUR=LAST;return {data:{session:{user:pub(CUR)}},error:null}}};
let LAST=null;
const userByName=un=>{const p=T.pp_profiles.find(x=>x.username===String(un).toLowerCase());return p&&AU.find(a=>a.id===p.id)};
const functions={async invoke(n,{body}){const b=body||{},u=userByName(b.username),E=mm=>({data:null,error:{message:mm,context:{json:async()=>({error:mm})}}});
 if(b.action==='login'){if(!u||u.password!==b.password)return E('Wrong username or password');LAST=u;return {data:{access_token:'m',refresh_token:'m'},error:null}}
 if(b.action==='recover'){if(u&&u.email){PEND={user:u,kind:'recovery',target:u.email,code:otp()};window.__DK_OTP=()=>({dest:u.email,code:PEND&&PEND.code})}return {data:{ok:true},error:null}}
 if(b.action==='reset'){if(!u||!PEND||PEND.user!==u||String(b.token)!==PEND.code)return E('Invalid or expired code');u.password=b.password;PEND=null;LAST=u;return {data:{access_token:'m',refresh_token:'m'},error:null}}
 return E('Unknown action')}};
async function reshare(uid){const pr=T.pp_profiles.find(p=>p.id===uid);for(const mm of T.pp_members.filter(x=>x.user_id===uid)){const cv=T.pp_conversations.find(c=>c.id===mm.conversation_id),b=cv&&botsIn(cv.id)[0];if(!b)continue;const k=await botKey(b,cv.id,cv.key_version);if(!k)continue;
 const row={conversation_id:cv.id,user_id:uid,version:cv.key_version,wrapped_key:await C.wrap(k,b.priv,pr.pubkey),wrapped_by:b.id,recipient_fp:await C.fingerprint(pr.pubkey),created_at:iso()};
 const i=T.pp_member_keys.findIndex(x=>x.conversation_id===cv.id&&x.user_id===uid&&x.version===cv.key_version);if(i>=0)T.pp_member_keys[i]=row;else T.pp_member_keys.push(row);notify('pp_member_keys','INSERT',row)}}
/* ---------- storage (avatars) ---------- */
const FILES={};
const storage={from(){return {
 async upload(path,blob){if(!me())return err('not signed in');const url=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(blob)});FILES[path]=url;return {data:{path},error:null}},
 async createSignedUrl(path){return FILES[path]?{data:{signedUrl:FILES[path]},error:null}:err('not found')},
 async remove(paths){paths.forEach(p=>delete FILES[p]);return {data:null,error:null}}}}};
const sb={functions,from:t=>/^pp_/.test(t)?qb(t):shop.from(t),rpc:async(n,a)=>RPC[n]?RPC[n](a||{}):err('unknown rpc'),storage,auth,
 channel(n){const s=shop.channel(n),mine=[];const ch={on(a,o,cb){if(o&&/^pp_/.test(o.table||''))mine.push({table:o.table,cb});else s.on(a,o,cb);return ch},subscribe(){s.subscribe();mine.forEach(x=>subs.push(x));return ch},_s:s,_m:mine};return ch},
 removeChannel(ch){try{shop.removeChannel(ch._s)}catch(e){}subs=subs.filter(x=>!ch._m.includes(x))}};
window.supabase={createClient:()=>sb};
})();
