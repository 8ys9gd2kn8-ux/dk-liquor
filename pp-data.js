/* D&K Party Planner: data layer (Supabase transport + key management). No UI code here.
 * All reads/writes go through Supabase with Row Level Security (see supabase-planner.sql).
 * Message text is encrypted/decrypted here with PPCrypto, so the server only sees ciphertext. */
(function(){
'use strict';
const C=window.PPCrypto,te=new TextEncoder();
const D={sb:null,ident:null,keys:{},users:{}};
const ok=r=>{if(r&&r.error)throw r.error;return r?r.data:null};
const digits=p=>String(p||'').replace(/\D/g,'');
const jpub=j=>({kty:'EC',crv:'P-256',x:j.x,y:j.y});
D.init=sb=>{D.sb=sb};
/* ---- phone helpers (default country: Uganda +256) ---- */
D.e164=p=>{let d=digits(p);if(d.startsWith('00'))d=d.slice(2);if(d.startsWith('0'))d='256'+d.slice(1);else if(d.length===9)d='256'+d;return d};
D.hashPhone=p=>C.sha256hex('dk-pp-v1:'+D.e164(p));
/* ---- auth ---- */
D.session=async()=>{const {data}=await D.sb.auth.getSession();return data&&data.session||null};
D.realUser=async()=>{const s=await D.session();return s&&s.user&&!s.user.is_anonymous?s.user:null};
D.available=async u=>ok(await D.sb.rpc('pp_username_available',{p_username:u}))===true;
D.begin=async f=>{const s=await D.session(),anon=!!(s&&s.user&&s.user.is_anonymous),sms=f.channel==='sms',id=sms?{phone:'+'+D.e164(f.phone)}:{email:f.email};
 /* an existing anonymous shop session is UPGRADED in place, so the customer keeps their orders and profile */
 const r=anon?await D.sb.auth.updateUser(id):await D.sb.auth.signUp(Object.assign({password:f.password},id));if(r.error)throw r.error;return {anon}};
D.resend=async(f,anon)=>{const sms=f.channel==='sms',id=sms?{phone:'+'+D.e164(f.phone)}:{email:f.email};
 const r=await D.sb.auth.resend(Object.assign({type:anon?(sms?'phone_change':'email_change'):(sms?'sms':'signup')},id));if(r.error)throw r.error};
D.verify=async(f,code,anon)=>{const sms=f.channel==='sms',type=anon?(sms?'phone_change':'email_change'):(sms?'sms':'signup'),id=sms?{phone:'+'+D.e164(f.phone)}:{email:f.email};
 const r=await D.sb.auth.verifyOtp(Object.assign({token:code,type},id));if(r.error)throw r.error;
 if(anon){const u=await D.sb.auth.updateUser({password:f.password});if(u.error)throw u.error}
 return (await D.realUser())};
D.signIn=async({id,password})=>{const r=await D.sb.auth.signInWithPassword(id.includes('@')?{email:id,password}:{phone:'+'+D.e164(id),password});if(r.error)throw r.error;return r.data.user};
D.signOut=async uid=>{try{if(uid)await C.wipe(uid)}catch(e){}D.ident=null;D.keys={};D.users={};if(D.ch)try{D.sb.removeChannel(D.ch)}catch(e){}await D.sb.auth.signOut()};
D.profile=async uid=>ok(await D.sb.from('pp_profiles').select('*').eq('id',uid).maybeSingle());
D.createProfile=async p=>ok(await D.sb.from('pp_profiles').insert(p).select().single());
/* ---- identity keys ---- */
D.getBackup=async uid=>ok(await D.sb.from('pp_key_backups').select('*').eq('user_id',uid).maybeSingle());
/* returns 'ok' | 'locked' (backup exists, key not on this device) | 'nokeys' (first time: no keys yet). Passphrase is asked inside the Planner, never on the Profile page. */
D.initKeys=async(uid,pass,profile)=>{
 const loc=await C.load(uid);if(loc){D.ident={priv:loc.priv,pub:loc.pub};return 'ok'}
 const bk=await D.getBackup(uid);
 if(!pass)return bk?'locked':'nokeys';
 if(bk){const j=await C.restore(bk,pass),priv=await C.importPriv(j),pub=jpub(j);await C.save(uid,priv,pub);D.ident={priv,pub};
  if(profile&&(!profile.pubkey||profile.pubkey.x!==pub.x))ok(await D.sb.from('pp_profiles').update({pubkey:pub}).eq('id',uid));return 'ok'}
 const g=await C.generate(),priv=await C.importPriv(g.priv);await C.save(uid,priv,g.pub);D.ident={priv,pub:g.pub};
 ok(await D.sb.from('pp_key_backups').upsert(Object.assign({user_id:uid},await C.backup(g.priv,pass))));
 if(profile)ok(await D.sb.from('pp_profiles').update({pubkey:g.pub}).eq('id',uid));
 return 'ok'};
D.fingerprint=C.fingerprint;
/* ---- conversation keys ---- */
D.convKey=(cid,v)=>(D.keys[cid]||{})[v];
D.latest=cid=>{const k=D.keys[cid]||{},vs=Object.keys(k).map(Number);return vs.length?Math.max(...vs):0};
D.loadKeys=async(uid,users)=>{const rows=ok(await D.sb.from('pp_member_keys').select('*').eq('user_id',uid))||[];
 for(const r of rows){if(D.convKey(r.conversation_id,r.version))continue;const w=users[r.wrapped_by];if(!w||!w.pubkey)continue;
  try{(D.keys[r.conversation_id]=D.keys[r.conversation_id]||{})[r.version]=await C.unwrap(r.wrapped_key,D.ident.priv,w.pubkey)}catch(e){}}};
const wrapRow=async(cid,ver,key,uid,user,me)=>({conversation_id:cid,user_id:uid,version:ver,wrapped_key:await C.wrap(key,D.ident.priv,user.pubkey),wrapped_by:me,recipient_fp:await C.fingerprint(user.pubkey)});
D.newConvKeys=async(cid,ids,users,me)=>{const k=await C.newConvKey();(D.keys[cid]=D.keys[cid]||{})[1]=k;
 const rows=[];for(const id of ids){const u=users[id];if(u&&u.pubkey)rows.push(await wrapRow(cid,1,k,id,u,me))}
 if(rows.length)ok(await D.sb.from('pp_member_keys').insert(rows))};
/* admin: give the current key to any member who lacks it (new joiners, or members whose device key changed) */
D.ensureKeys=async(cid,ver,ids,users,me)=>{const k=D.convKey(cid,ver),res={added:[],changed:[]};if(!k)return res;
 const have=ok(await D.sb.from('pp_member_keys').select('user_id,version,recipient_fp').eq('conversation_id',cid))||[],rows=[];
 for(const id of ids){const u=users[id];if(!u||!u.pubkey)continue;const fp=await C.fingerprint(u.pubkey),r=have.find(x=>x.user_id===id&&x.version===ver);
  if(!r){res.added.push(id);rows.push(await wrapRow(cid,ver,k,id,u,me))}else if(r.recipient_fp!==fp){res.changed.push(id);rows.push(await wrapRow(cid,ver,k,id,u,me))}}
 if(rows.length)ok(await D.sb.from('pp_member_keys').upsert(rows));return res};
/* admin: rotate the key (used after removing a member so they cannot read NEW messages) */
D.rotate=async(cid,ver,ids,users,me)=>{const k=await C.newConvKey();(D.keys[cid]=D.keys[cid]||{})[ver]=k;const rows=[];
 for(const id of ids){const u=users[id];if(u&&u.pubkey)rows.push(await wrapRow(cid,ver,k,id,u,me))}
 ok(await D.sb.from('pp_member_keys').insert(rows));ok(await D.sb.from('pp_conversations').update({key_version:ver}).eq('id',cid))};
D.encrypt=async(cid,sender,obj)=>{const v=D.latest(cid),k=D.convKey(cid,v);if(!k)throw new Error('No encryption key for this chat yet');const e=await C.enc(k,obj,cid+':'+sender);return {ciphertext:e.ciphertext,iv:e.iv,key_version:v}};
D.decrypt=async row=>{const k=D.convKey(row.conversation_id,row.key_version);if(!k||!row.ciphertext)return null;try{return await C.dec(k,row.ciphertext,row.iv,row.conversation_id+':'+row.sender_id)}catch(e){return null}};
/* ---- loading ---- */
const sel=(t,f)=>{let q=D.sb.from(t).select('*');return f?f(q):q};
const rows=async(t,f)=>ok(await sel(t,f))||[];
D.loadAll=async me=>{
 const [members,convs]=await Promise.all([rows('pp_members'),rows('pp_conversations')]),ids=convs.map(c=>c.id),uids=[...new Set(members.map(m=>m.user_id).concat([me]))];
 const [profiles,msgs,items,opts,votes,acts,invs]=ids.length?await Promise.all([rows('pp_profiles',q=>q.in('id',uids)),rows('pp_messages',q=>q.in('conversation_id',ids).order('created_at',{ascending:false}).limit(1500)),
  rows('pp_items',q=>q.in('conversation_id',ids)),rows('pp_plan_options',q=>q.in('conversation_id',ids)),rows('pp_votes',q=>q.in('conversation_id',ids)),
  rows('pp_activity',q=>q.in('conversation_id',ids).order('created_at',{ascending:false}).limit(600)),rows('pp_invites',q=>q.in('conversation_id',ids))]):[await rows('pp_profiles',q=>q.eq('id',me)),[],[],[],[],[],[]];
 profiles.forEach(p=>D.users[p.id]=p);return {members,convs,profiles,msgs:msgs.reverse(),items,opts,votes,acts,invs}};
D.loadProfiles=async ids=>{const need=ids.filter(i=>!D.users[i]||!D.users[i].pubkey);if(!need.length)return;(await rows('pp_profiles',q=>q.in('id',need))).forEach(p=>D.users[p.id]=p)};
/* ---- writes ---- */
const w=(t,x)=>D.sb.from(t).insert(x).then(ok);
D.send=row=>w('pp_messages',row);
D.react=(mid,e)=>D.sb.rpc('pp_react',{p_mid:mid,p_emoji:e}).then(ok);
D.delMsg=mid=>D.sb.rpc('pp_delete_message',{p_mid:mid}).then(ok);
D.createGroup=a=>D.sb.rpc('pp_create_conversation',{p_type:'group',p_name:a.name,p_category:a.cat,p_guests:a.guests,p_budget:a.budget,p_members:a.members}).then(ok);
D.openDM=u=>D.sb.rpc('pp_open_dm',{p_other:u}).then(ok);
D.addMember=(cid,uid)=>w('pp_members',{conversation_id:cid,user_id:uid,role:'member'});
D.removeMember=(cid,uid)=>D.sb.from('pp_members').delete().eq('conversation_id',cid).eq('user_id',uid).then(ok);
D.setRole=(cid,uid,r)=>D.sb.rpc('pp_set_role',{p_cid:cid,p_user:uid,p_role:r}).then(ok);
D.leave=cid=>D.sb.rpc('pp_leave',{p_cid:cid}).then(ok);
D.updConv=(cid,p)=>D.sb.from('pp_conversations').update(p).eq('id',cid).then(ok);
D.updMember=(cid,uid,p)=>D.sb.from('pp_members').update(p).eq('conversation_id',cid).eq('user_id',uid).then(ok);
D.addItem=r=>D.sb.from('pp_items').insert(r).select().single().then(ok);
D.updItem=(id,p)=>D.sb.from('pp_items').update(p).eq('id',id).then(ok);
D.addOpt=r=>D.sb.from('pp_plan_options').insert(r).select().single().then(ok);
D.setLock=async(cid,field,id,lock)=>{if(lock)ok(await D.sb.from('pp_plan_options').update({locked:false}).eq('conversation_id',cid).eq('field',field));ok(await D.sb.from('pp_plan_options').update({locked:lock}).eq('id',id))};
D.vote=(cid,type,tid,uid,val)=>val?D.sb.from('pp_votes').upsert({conversation_id:cid,target_type:type,target_id:tid,user_id:uid,value:val}).then(ok):D.sb.from('pp_votes').delete().eq('target_type',type).eq('target_id',tid).eq('user_id',uid).then(ok);
D.activity=(cid,actor,text,item)=>w('pp_activity',{conversation_id:cid,actor,text:String(text).slice(0,300),item_id:item||null});
/* ---- invitations (secret token is only in the link; the database stores its SHA-256 hash) ---- */
D.createInvite=async(cid,label,me)=>{const t=C.b64(crypto.getRandomValues(new Uint8Array(24))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 await w('pp_invites',{conversation_id:cid,token_hash:await C.sha256hex(t),label:String(label).slice(0,80),created_by:me});
 return location.origin+location.pathname+'#join='+t};
D.accept=t=>D.sb.rpc('pp_accept_invite',{p_token:t}).then(ok);
D.joinToken=()=>{const m=/[#&]join=([\w-]{20,64})/.exec(location.hash);if(m){try{sessionStorage.setItem('dk-join',m[1])}catch(e){}history.replaceState(null,'',location.pathname+location.search)}try{return sessionStorage.getItem('dk-join')}catch(e){return null}};
D.clearJoin=()=>{try{sessionStorage.removeItem('dk-join')}catch(e){}};
/* ---- contacts: only salted hashes of phone numbers are sent; the server returns matches only ---- */
D.matchContacts=async list=>{const map={},hs=[];for(const c of list){const h=await D.hashPhone(c.phone);map[h]=c;hs.push(h)}
 const out=[];for(let i=0;i<hs.length;i+=500){const r=ok(await D.sb.rpc('pp_match_contacts',{p_hashes:hs.slice(i,i+500)}))||[];r.forEach(p=>{D.users[p.id]=Object.assign(D.users[p.id]||{},p);out.push({contact:map[p.phone_hash],user:p})})}return out};
D.lookup=async q=>{q=q.trim().replace(/^@/,'');const isPh=digits(q).length>=9;return ok(await D.sb.rpc('pp_lookup',{p_username:isPh?null:q,p_phone_hash:isPh?await D.hashPhone(q):null}))||[]};
/* ---- profile pictures: re-encoded to a 256px JPEG in the browser (strips EXIF/GPS), private bucket, signed URLs ---- */
D.imageToAvatar=async file=>{if(!file||!/^image\/(jpeg|png|webp)$/.test(file.type))throw new Error('Choose a JPG, PNG or WebP photo');if(file.size>8*1024*1024)throw new Error('Photo is too large (max 8 MB)');
 const bmp=await createImageBitmap(file),s=Math.min(bmp.width,bmp.height),cv=document.createElement('canvas');cv.width=cv.height=256;
 cv.getContext('2d').drawImage(bmp,(bmp.width-s)/2,(bmp.height-s)/2,s,s,0,0,256,256);
 return new Promise((res,rej)=>cv.toBlob(b=>b?res(b):rej(new Error('Could not process photo')),'image/jpeg',0.85))};
D.uploadAvatar=async(kind,id,blob,oldPath)=>{const path=kind+'s/'+id+'/'+crypto.randomUUID()+'.jpg',st=D.sb.storage.from('pp-avatars');
 const r=await st.upload(path,blob,{contentType:'image/jpeg',upsert:false});if(r.error)throw r.error;
 if(kind==='user')ok(await D.sb.from('pp_profiles').update({avatar_path:path}).eq('id',id));else ok(await D.sb.from('pp_conversations').update({avatar_path:path}).eq('id',id));
 if(oldPath)try{await st.remove([oldPath])}catch(e){}return path};
D.removeAvatar=async(kind,id,oldPath)=>{if(kind==='user')ok(await D.sb.from('pp_profiles').update({avatar_path:null}).eq('id',id));else ok(await D.sb.from('pp_conversations').update({avatar_path:null}).eq('id',id));
 if(oldPath)try{await D.sb.storage.from('pp-avatars').remove([oldPath])}catch(e){}};
const AV={};D.avatarUrl=async path=>{const c=AV[path];if(c&&c.exp>Date.now())return c.url;const r=await D.sb.storage.from('pp-avatars').createSignedUrl(path,3600);if(r.error||!r.data)return null;AV[path]={url:r.data.signedUrl,exp:Date.now()+50*6e4};return r.data.signedUrl};
/* ---- realtime (RLS filters what each user receives) ---- */
D.subscribe=cb=>{const ch=D.sb.channel('pp-'+Math.random().toString(36).slice(2));
 ['pp_messages','pp_items','pp_plan_options','pp_votes','pp_members','pp_member_keys','pp_conversations','pp_activity','pp_profiles'].forEach(t=>ch.on('postgres_changes',{event:'*',schema:'public',table:t},p=>cb(t,p)));
 ch.subscribe();D.ch=ch};
/* ---- account recovery ---- */
D.resetEmail=async email=>{const r=await D.sb.auth.resetPasswordForEmail(email);if(r.error)throw r.error};
D.recoverVerify=async(email,token)=>{const r=await D.sb.auth.verifyOtp({email,token,type:'recovery'});if(r.error)throw new Error('That code is wrong or has expired')};
D.setPassword=async pw=>{const r=await D.sb.auth.updateUser({password:pw});if(r.error)throw r.error};
D.fn=async body=>{const r=await D.sb.functions.invoke('pp-account',{body});if(r.error){let m='This feature is not available yet';try{const j=await r.error.context.json();m=j.error||m}catch(e){}throw new Error(m)}return r.data};
D.setSession=async t=>{const r=await D.sb.auth.setSession({access_token:t.access_token,refresh_token:t.refresh_token});if(r.error)throw r.error};
/* forgot passphrase: a NEW key pair replaces the old one. Old chats become readable again once another member's device shares the chat key. */
D.resetIdentity=async(uid,pass)=>{await C.wipe(uid);const g=await C.generate(),priv=await C.importPriv(g.priv);await C.save(uid,priv,g.pub);D.ident={priv,pub:g.pub};D.keys={};
 ok(await D.sb.from('pp_key_backups').upsert(Object.assign({user_id:uid},await C.backup(g.priv,pass))));ok(await D.sb.from('pp_profiles').update({pubkey:g.pub}).eq('id',uid))};
/* ---- background push subscriptions (device -> user). Ownership moves to whoever is signed in on that device. ---- */
D.savePush=(sub,ua)=>D.sb.rpc('pp_save_push',{p_endpoint:sub.endpoint,p_p256dh:sub.keys.p256dh,p_auth:sub.keys.auth,p_ua:ua||''}).then(ok);
D.dropPush=endpoint=>D.sb.rpc('pp_drop_push',{p_endpoint:endpoint}).then(ok);
window.PPData=D;
})();
