/* D&K Party Planner: end-to-end encryption primitives (Web Crypto API only, no third-party code).
 *
 * Design
 *  - Every user has an ECDH P-256 identity key pair created on their own device.
 *  - The PUBLIC key is published to the server. The PRIVATE key never leaves the device unencrypted:
 *    it lives in IndexedDB as a NON-extractable CryptoKey, plus an encrypted backup (PBKDF2 + AES-GCM,
 *    keyed by a "message passphrase" that is never sent to the server) so a new device can restore it.
 *  - Each conversation has a random AES-256-GCM key. It is wrapped separately for every member
 *    (ECDH -> HKDF -> AES-GCM). The server stores only wrapped keys and ciphertext.
 *  - Message text is AES-256-GCM encrypted; conversation id + sender id are bound in as AAD.
 */
(function(){
'use strict';
const te=new TextEncoder(),td=new TextDecoder(),S=crypto.subtle;
const b64=u=>{let s='';new Uint8Array(u).forEach(c=>s+=String.fromCharCode(c));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
const EC={name:'ECDH',namedCurve:'P-256'};
const mem={};/* fallback if IndexedDB is unavailable (private browsing) */
function idb(fn,mode){return new Promise((res,rej)=>{let o;try{o=indexedDB.open('dk-pp',1)}catch(e){return rej(e)}
 o.onupgradeneeded=()=>o.result.createObjectStore('keys');o.onerror=()=>rej(o.error);
 o.onsuccess=()=>{const t=o.result.transaction('keys',mode||'readonly'),r=fn(t.objectStore('keys'));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error)}})}
async function pwKey(pass,salt){const base=await S.importKey('raw',te.encode(pass.normalize('NFKC')),'PBKDF2',false,['deriveKey']);
 return S.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function kek(priv,pub){const bits=await S.deriveBits({name:'ECDH',public:pub},priv,256),hk=await S.importKey('raw',bits,'HKDF',false,['deriveKey']);
 return S.deriveKey({name:'HKDF',hash:'SHA-256',salt:new Uint8Array(32),info:te.encode('dk-pp-v1-keywrap')},hk,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
const C={b64,unb64,
 async generate(){const kp=await S.generateKey(EC,true,['deriveBits']);return{pub:await S.exportKey('jwk',kp.publicKey),priv:await S.exportKey('jwk',kp.privateKey)}},
 importPriv:j=>S.importKey('jwk',j,EC,false,['deriveBits']),
 importPub:j=>S.importKey('jwk',{kty:j.kty,crv:j.crv,x:j.x,y:j.y,ext:true},EC,true,[]),
 async save(uid,priv,pub){mem[uid]={priv,pub};try{await idb(s=>s.put({priv,pub},uid),'readwrite')}catch(e){}},
 async load(uid){try{const r=await idb(s=>s.get(uid));if(r)return r}catch(e){}return mem[uid]||null},
 async wipe(uid){delete mem[uid];try{await idb(s=>s.delete(uid),'readwrite')}catch(e){}},
 async backup(privJwk,pass){const salt=rnd(16),iv=rnd(12),k=await pwKey(pass,salt),ct=await S.encrypt({name:'AES-GCM',iv},k,te.encode(JSON.stringify(privJwk)));return{salt:b64(salt),iv:b64(iv),blob:b64(ct)}},
 async restore(b,pass){const k=await pwKey(pass,unb64(b.salt));try{return JSON.parse(td.decode(await S.decrypt({name:'AES-GCM',iv:unb64(b.iv)},k,unb64(b.blob))))}catch(e){throw new Error('Wrong message passphrase')}},
 newConvKey:()=>S.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']),
 /* v2: an EPHEMERAL key pair is made for every wrap and its public half is stored with the wrapped key, so unwrapping needs only the recipient's own private key.
    (v1, kept for old data, needed the wrapper's CURRENT public key, which broke whenever that person's key changed.)
    wrap(convKey, theirPub)  or the legacy call  wrap(convKey, ignoredPriv, theirPub) */
 async wrap(convKey,a,b){const theirPubJwk=b||a,raw=await S.exportKey('raw',convKey),eph=await S.generateKey(EC,true,['deriveBits']),ep=await S.exportKey('jwk',eph.publicKey),
  k=await kek(eph.privateKey,await C.importPub(theirPubJwk)),iv=rnd(12);return 'v2.'+ep.x+'.'+ep.y+'.'+b64(iv)+'.'+b64(await S.encrypt({name:'AES-GCM',iv},k,raw))},
 async unwrap(wrapped,myPriv,wrapperPubJwk){let pub,iv,ct;
  if(wrapped.startsWith('v2.')){const p=wrapped.split('.');pub=await C.importPub({kty:'EC',crv:'P-256',x:p[1],y:p[2]});iv=p[3];ct=p[4]}
  else{const p=wrapped.split('.');iv=p[0];ct=p[1];pub=await C.importPub(wrapperPubJwk)}
  const k=await kek(myPriv,pub);return S.importKey('raw',await S.decrypt({name:'AES-GCM',iv:unb64(iv)},k,unb64(ct)),'AES-GCM',true,['encrypt','decrypt'])},
 async enc(key,obj,aad){const iv=rnd(12),ct=await S.encrypt({name:'AES-GCM',iv,additionalData:te.encode(aad)},key,te.encode(JSON.stringify(obj)));return{ciphertext:b64(ct),iv:b64(iv)}},
 async dec(key,ciphertext,iv,aad){return JSON.parse(td.decode(await S.decrypt({name:'AES-GCM',iv:unb64(iv),additionalData:te.encode(aad)},key,unb64(ciphertext))))},
 async sha256hex(s){return [...new Uint8Array(await S.digest('SHA-256',te.encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('')},
 async fingerprint(pubJwk){const h=await C.sha256hex(pubJwk.x+'.'+pubJwk.y);return h.slice(0,40).match(/.{5}/g).join(' ')}};
window.PPCrypto=C;
})();
