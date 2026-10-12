const APP_MODE=window.APP_MODE||'customer';

const LOGO='data:image/jpeg;base64,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';
const CUR='$',CATS=['Red','White','Rosé','Sparkling','Spirits','Other'],STAT=['New','Confirmed','Shipped','Delivered','Cancelled'];
const EM={Red:'🍷',White:'🥂',Rosé:'🌸',Sparkling:'🍾',Spirits:'🥃',Other:'🍇'};
let db=null,uid=null,isAdmin=false,asCust=false,tab='shop',cat='All',aged=true,modal=null,detail=null,dq=1,resetSc=false,topNext=false,brandF=null,popC=null,catsOpen=false,ord=null,peek=null,held=false,srch='',prof={name:'',phone:'',region:'',address:''},msg='',regionF='All';
const S={products:[],combos:[],promos:[],ads:[],categories:[],contact:{},theme:{},orders:[],mine:[]},cart={};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const m=n=>'UGX '+Math.round(n).toLocaleString('en-US');
const psave=(x,price)=>x.kind==='amt'?Math.min(+x.pct||0,price):price*(+x.pct||0)/100;
const dsave=p=>Math.max(0,...S.promos.filter(x=>x.active&&pmatch(x,p)).map(x=>psave(x,p.price)));
const pct=p=>{const s=dsave(p);return s>0&&p.price>0?Math.max(1,Math.round(s/p.price*100)):0};
const fin=p=>p.price-dsave(p);
const P=id=>S.products.find(p=>p.id===id);
const admin=()=>isAdmin&&!asCust;

function cartLines(){return Object.entries(cart).map(([k,q])=>{const [t,id]=k.split(':');
 if(t==='p'){const p=P(id);return p&&{k,n:p.name,q,p:fin(p)}}
 const c=S.combos.find(x=>x.id===id);return c&&{k,n:'Combo: '+c.name,q,p:cfin(c),it:(c.items||[]).map(i=>({n:(P(i.id)||{}).name||'Item',q:i.q}))}}).filter(Boolean)}
const total=()=>cartLines().reduce((s,l)=>s+l.p*l.q,0);

function prodCard(p){const d=pct(p),out=p.inStock===false,q=cart['p:'+p.id]||0;return `<div class="prow" data-a="detail" data-id="${p.id}"><div class="pi"><b>${esc(p.name)}</b><div class="mute">${esc(p.desc||'')}</div><div class="mute">${esc(p.category)}${p.origin?' · '+esc(p.origin):''}</div><div class="price">${m(fin(p))} ${d?`<span class="old">${m(p.price)}</span> <span class="badge">-${d}%</span>`:''}</div></div><div class="pimg">${p.img?`<img src="${p.img}" alt="">`:(EM[p.category]||'🍷')}${out?'<i class="soldout">Sold out</i>':`<button class="plus ${q?'on':''}" data-a="add" data-k="p:${p.id}">${q||'+'}</button>`}</div></div>`}
function prodCardOld(p){const d=pct(p);return `<div class="card"><div class="em">${EM[p.category]||'🍷'}</div>
<b>${esc(p.name)}</b><div class="mute">${esc(p.category)} · ${esc(p.origin||'')}</div>
<div class="mute">${esc(p.desc||'')}</div>
<div class="price">${m(fin(p))} ${d?`<span class="old">${m(p.price)}</span> <span class="badge">-${d}%</span>`:''}</div>
${p.inStock===false?'<div class="mute">Out of stock</div>':`<button class="btn" data-a="add" data-k="p:${p.id}">Add to cart</button>`}</div>`}

function shop(){
 const act=S.promos.filter(x=>x.active);
 const list=S.products.filter(p=>(cat==='All'||p.category===cat)&&(!brandF||p.brand===brandF));
 return `${festive()}<div class="hero">${act.map(x=>`<div class="promo"><span class="badge">PROMO</span><b>${esc(x.title)}</b><span>${esc(pdisc(x))} ${esc(pdesc(x))}</span></div>`).join('')||'<div class="promo"><b>Drinks delivered nationwide</b><span>Order today, enjoy tonight</span></div>'}</div>
 <div class="cats">${catsHtml()}</div>
 <div class="eta">🛵 Delivery: ${esc(S.contact.delivery||'1–3 days')} · All regions</div>
 ${homeCombos()}<h2>${brandF?esc(brandF):(cat==='All'?'Popular':cat)} ${(brandF||cat!=='All')?'<button class="btn sm ghost" data-a="clrb">Show all</button>':''}</h2>
 ${list.length?`<div class="plist">${list.map(prodCard).join('')}</div>`:'<p class="mute">No products yet. Check back soon!</p>'}`}
function shopOld(){
 const act=S.promos.filter(x=>x.active);
 const list=S.products.filter(p=>cat==='All'||p.category===cat);
 return `${act.map(x=>`<div class="banner"><b>${esc(x.title)}</b><div>${x.pct}% off ${x.scope==='All'?'everything':esc(x.scope)+' wines'}</div></div>`).join('')}
 <div class="tabs" style="padding:0 0 8px">${['All',...CATS].map(c=>`<button class="tab ${c===cat?'on':''}" data-a="cat" data-v="${c}">${c}</button>`).join('')}</div>
 ${list.length?`<div class="grid">${list.map(prodCard).join('')}</div>`:'<p class="mute">No products yet. Check back soon!</p>'}`}

function combos(){const a=S.combos.filter(c=>c.active);
 return a.length?a.map(c=>{const items=(c.items||[]).map(i=>(P(i.id)?i.q+'× '+esc(P(i.id).name):'')).filter(Boolean).join(', ');
 const was=(c.items||[]).reduce((s,i)=>s+(P(i.id)?fin(P(i.id))*i.q:0),0);
 return `<div class="card list"><b>🎁 ${esc(c.name)}</b><div class="mute">${items}</div>
 <div class="price">${m(cfin(c))} ${was>cfin(c)?`<span class="old">${m(Math.max(was,c.price))}</span> <span class="badge">Save ${m(Math.max(was,c.price)-cfin(c))}</span>`:''}</div>
 <button class="btn" data-a="add" data-k="c:${c.id}">Add combo</button></div>`}).join(''):'<p class="mute">No combo deals right now.</p>'}

function cartView(){const L=cartLines();
 if(!L.length&&!S.mine.length)return '<div style="text-align:center;padding:40px 0"><div class="em">🧾</div><b>No orders yet</b><div class="mute">Items you add will appear here.</div></div>';
 let h=L.length?`<h2 style="margin-top:4px">Your cart</h2><div class="card">${L.map(l=>`<div class="row"><span>${esc(l.n)}</span><span>${l.q} × ${m(l.p)} <button class="btn sm ghost" data-a="rm" data-k="${l.k}">−</button></span></div>`).join('')}
 <hr><div class="row"><b>Total</b><b>${m(total())}</b></div></div>
 <h2>Delivery details</h2><p class="mute">🛵 Delivery: ${esc(S.contact.delivery||'1–3 days')}</p><label>Full name</label><input id="cn" value="${esc(prof.name)}"><label>Phone</label><input id="cp" type="tel" value="${esc(prof.phone)}">
 <label>State / Region</label><input id="cr" value="${esc(prof.region)}"><label>Address</label><textarea id="ca" rows="2">${esc(prof.address)}</textarea>
 <button class="btn" data-a="order">Place order</button>`:'';
 if(S.mine.length)h+=`<h2>My orders</h2>`+[...S.mine].reverse().map(o=>`<div class="card" style="margin-bottom:8px"><div class="row"><b>${m(o.total)}</b><span class="st">${o.status}</span></div><div class="mute">${new Date(o.ts).toLocaleDateString()} · ${o.lines.map(l=>l.q+'× '+esc(l.n)).join(', ')}</div>${wa()?`<a href="${wa('Hello D&K Beverages, I need help with my order #'+o.id.slice(-6))}" target="_blank" rel="noopener" style="font-size:13px;font-weight:600;color:#128c7e">💬 Need help with this order?</a>`:''}</div>`).join('');
 return h}

/* ADMIN */
function aOrders(){
 const all=[...S.orders].sort((a,b)=>b.ts-a.ts);
 const regs=['All',...new Set(all.map(o=>o.region))];
 const L=all.filter(o=>regionF==='All'||o.region===regionF);
 return `<div class="stats"><div class="card"><b>${all.filter(o=>o.status==='New').length}</b><span class="mute">New</span></div>
 <div class="card"><b>${all.length}</b><span class="mute">Orders</span></div>
 <div class="card"><b>${m(all.filter(o=>o.status!=='Cancelled').reduce((s,o)=>s+o.total,0))}</b><span class="mute">Revenue</span></div></div>
 <label>Filter by region</label><select data-a="region">${regs.map(r=>`<option ${r===regionF?'selected':''}>${esc(r)}</option>`).join('')}</select>
 <div class="list">${L.map(o=>`<div class="card" data-a="openord" data-u="${o.uid}" data-o="${o.id}" style="cursor:pointer"><div class="row"><b>${esc(o.name)}</b><b>${m(o.total)}</b></div><div style="color:var(--wine);font-weight:600;font-size:13px">Tap to open order ›</div>
 <div class="mute">${esc(o.region)} · ${esc(o.phone)}<br>${esc(o.address)}</div>
 <div class="mute">${o.lines.map(l=>l.q+'× '+esc(l.n)).join(', ')}</div>
 <select data-a="status" data-u="${o.uid}" data-o="${o.id}">${STAT.map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}</select></div>`).join('')||'<p class="mute">No orders yet.</p>'}</div>`}

function aProducts(){return `<div class="row"><h2>Products</h2><button class="btn sm" data-a="editP">+ Add</button></div>
 ${!S.products.length?'<button class="btn ghost" data-a="seed">Load sample wines</button>':''}
 <div class="list">${S.products.map(p=>`<div class="card row"><div style="display:flex;gap:10px;align-items:center">${p.img?`<img src="${p.img}" style="width:44px;height:44px;object-fit:cover;border-radius:8px">`:''}<div><b>${esc(p.name)}</b><div class="mute">${esc(p.category)} · ${m(p.price)} ${p.inStock===false?'· OUT':''}</div></div></div><button class="btn sm ghost" data-a="editP" data-id="${p.id}">Edit</button></div>`).join('')}</div>`}
function aCombos(){return `<div class="row"><h2>Combos</h2><button class="btn sm" data-a="editC">+ Add</button></div><div class="list">${S.combos.map(c=>`<div class="card row"><div><b>${esc(c.name)}</b><div class="mute">${m(c.price)} · ${c.active?'Live':'Hidden'}</div></div><button class="btn sm ghost" data-a="editC" data-id="${c.id}">Edit</button></div>`).join('')||'<p class="mute">No combos yet.</p>'}</div>`}
function aPromos(){return `<div class="row"><h2>Promotions</h2><button class="btn sm" data-a="editR">+ Add</button></div><div class="list">${S.promos.map(c=>`<div class="card row"><div><b>${esc(c.title)}</b><div class="mute">${esc(pdisc(c))} ${esc(pdesc(c))} · ${c.active?'Live':'Hidden'}</div></div><button class="btn sm ghost" data-a="editR" data-id="${c.id}">Edit</button></div>`).join('')||'<p class="mute">No promotions yet.</p>'}</div>`}

function detailView(){const p=P(detail);if(!p)return '';const d=pct(p),fp=fin(p),out=p.inStock===false;
 const pr=S.promos.filter(x=>x.active&&pmatch(x,p));
 const cb=S.combos.filter(c=>c.active&&(c.items||[]).some(i=>i.id===p.id));
 const rel=S.products.filter(x=>x.id!==p.id&&x.inStock!==false).sort((a,b)=>(b.category===p.category)-(a.category===p.category)).slice(0,8);
 const na='<span class="mute">Not specified</span>';
 const specs=[['Brand',p.brand],['Bottle size',p.volume],['Category',p.category],['Origin',p.origin],['Grape / type',p.grape],['Vintage',p.vintage],['Alcohol',p.abv?p.abv+'% ABV':'']];
 return `<div class="full">${promoBar()}<div class="dimg2">${p.img?`<img class="bgb" src="${p.img}" alt=""><img src="${p.img}" alt="">`:`<span>${EM[p.category]||'🍷'}</span>`}<button class="xb" data-a="closeD">✕</button></div>
 <div class="dbody">${d?`<span class="badge red">-${d}%</span>`:''}
 <div class="dtitle">${esc(p.name)}${p.volume?' '+esc(p.volume):''}</div>
 <div class="dprice">${m(fp)} ${d?`<span class="old" style="font-size:16px">${m(p.price)}</span>`:''}</div>
 <div class="mute">${esc(p.brand?p.brand+' · ':'')}Piece</div>
 ${out?'<p style="text-align:center" class="st">Out of stock</p>':`<div class="pill"><button data-a="dqm">−</button><b>${dq}</b><button data-a="dqp">+</button></div>`}
 ${d?`<div class="pbox"><div>You save <b>${m(p.price-fp)}</b> on each bottle</div>${pr.map(x=>`<span class="badge" style="margin:6px 4px 0 0">🏷 ${esc(x.title)} · ${esc(pdisc(x))}</span>`).join('')}</div>`:''}
 ${p.desc?`<p>${esc(p.desc)}</p>`:''}${p.notes?`<h3>Tasting notes</h3><p class="mute">${esc(p.notes)}</p>`:''}
 <h3>Product details</h3>${specs.map(s=>`<div class="row spec"><span class="mute">${s[0]}</span>${s[1]?`<b>${esc(s[1])}</b>`:na}</div>`).join('')}
 ${cb.length?`<h3>Available in combo deals</h3>`+cb.map(c=>`<div class="row spec"><span>🎁 ${esc(c.name)}</span><b>${m(cfin(c))}</b></div>`).join(''):''}
 ${adsView()}${rel.length?`<h2>You might also like</h2><div class="rel">${rel.map(x=>{const q=cart['p:'+x.id]||0;return `<div class="rc" data-a="detail" data-id="${x.id}"><div class="rimg">${x.img?`<img src="${x.img}" alt="">`:(EM[x.category]||'🍷')}<button class="plus ${q?'on':''}" data-a="add" data-k="p:${x.id}">${q||'+'}</button></div><b>${esc(x.name)}</b><span class="mute">${m(fin(x))}</span></div>`}).join('')}</div>`:''}${exploreView(p)}
 </div></div>
 <div class="addbar">${out?'':`<button class="btn" data-a="addn" data-id="${p.id}">Add ${dq} for ${m(fp*dq)}</button>`}</div>`}
function detailViewOld2(){const p=P(detail);if(!p)return '';const d=pct(p),fp=fin(p),out0=0;
 const pr=S.promos.filter(x=>x.active&&(x.scope==='All'||x.scope===p.category));
 const cb=S.combos.filter(c=>c.active&&(c.items||[]).some(i=>i.id===p.id));
 const na='<span class="mute">Not specified</span>';
 const specs=[['Brand',p.brand],['Bottle size',p.volume],['Category',p.category],['Origin',p.origin],['Grape / type',p.grape],['Vintage',p.vintage],['Alcohol',p.abv?p.abv+'% ABV':'']];
 return `<div class="modal"><div class="sheet" style="padding:0"><div class="dimg">${p.img?`<img src="${p.img}" alt="">`:`<span>${EM[p.category]||'🍷'}</span>`}<button class="x" data-a="closeD">✕</button></div>
 <div style="padding:16px"><div class="mute">${esc(p.brand||'')}</div><h2 style="margin:0">${esc(p.name)}</h2><div class="mute">${esc(p.volume||'')}</div>
 <div class="pbox"><div class="row"><span class="price" style="font-size:22px">${m(fp)}</span>${p.inStock===false?'<span class="st">Out of stock</span>':'<span class="st" style="background:#00a08233;color:var(--wine)">In stock</span>'}</div>
 ${d?`<div class="mute">Regular price <span class="old">${m(p.price)}</span> · You save ${m(p.price-fp)} (${d}%)</div>`:'<div class="mute">No discount applies right now</div>'}
 ${pr.map(x=>`<span class="badge" style="margin:6px 4px 0 0">🏷 ${esc(x.title)} · ${esc(pdisc(x))}</span>`).join('')}</div>
 ${p.desc?`<p>${esc(p.desc)}</p>`:''}${p.notes?`<h3>Tasting notes</h3><p class="mute">${esc(p.notes)}</p>`:''}
 <h3>Product details</h3>${specs.map(s=>`<div class="row spec"><span class="mute">${s[0]}</span>${s[1]?`<b>${esc(s[1])}</b>`:na}</div>`).join('')}
 ${cb.length?`<h3>Available in combo deals</h3>`+cb.map(c=>`<div class="row spec"><span>🎁 ${esc(c.name)}</span><b>${m(c.price)}</b></div>`).join(''):''}
 ${p.inStock===false?'':`<div class="row" style="margin-top:16px"><div class="step"><button data-a="rm" data-k="p:${p.id}">−</button><b>${q}</b><button data-a="add" data-k="p:${p.id}">+</button></div>${q?`<button class="btn" style="margin:0;flex:1" data-a="goCart">View cart · ${m(total())}</button>`:`<button class="btn" style="margin:0;flex:1" data-a="add" data-k="p:${p.id}">Add to cart · ${m(fp)}</button>`}</div>`}
 <button class="btn ghost" data-a="closeD">Close</button></div></div></div>`}
function detailViewOld(){const p=P(detail);if(!p)return '';const d=pct(p),q=cart['p:'+p.id]||0;
 const specs=[['Category',p.category],['Origin',p.origin],['Grape / type',p.grape],['Vintage',p.vintage],['Volume',p.volume],['Alcohol',p.abv?p.abv+'% ABV':''],['Availability',p.inStock===false?'Out of stock':'In stock']].filter(x=>x[1]);
 return `<div class="modal"><div class="sheet" style="padding:0"><div class="dimg">${p.img?`<img src="${p.img}" alt="">`:`<span>${EM[p.category]||'🍷'}</span>`}<button class="x" data-a="closeD">✕</button></div>
 <div style="padding:16px"><h2 style="margin:0">${esc(p.name)}</h2>
 <div class="price" style="font-size:18px;margin:4px 0">${m(fin(p))} ${d?`<span class="old">${m(p.price)}</span> <span class="badge">-${d}%</span>`:''}</div>
 <p>${esc(p.desc||'')}</p>${p.notes?`<h3>Tasting notes</h3><p class="mute">${esc(p.notes)}</p>`:''}
 <h3>Specifications</h3>${specs.map(s=>`<div class="row spec"><span class="mute">${s[0]}</span><b>${esc(s[1])}</b></div>`).join('')}
 ${p.inStock===false?'':`<button class="btn" data-a="add" data-k="p:${p.id}">Add to cart · ${m(fin(p))}${q?` (${q} in cart)`:''}</button>`}
 <button class="btn ghost" data-a="closeD">Close</button></div></div></div>`}

const brands=()=>[...new Set(S.products.map(p=>p.brand).filter(Boolean))];
function tileHtml(x){const q=cart['p:'+x.id]||0;return `<div class="rc" data-a="detail" data-id="${x.id}"><div class="rimg">${x.img?`<img src="${x.img}" alt="">`:(EM[x.category]||'🍷')}<button class="plus ${q?'on':''}" data-a="add" data-k="p:${x.id}">${q||'+'}</button></div><b>${esc(x.name)}</b><span class="mute">${m(fin(x))}</span></div>`}
function adsView(){const L=S.ads.filter(a=>a.active&&a.img);if(!L.length)return '';
 return `<div class="ads"><div class="adwrap"><div class="adtrack">${L.map(a=>`<div class="ad" data-a="adgo" data-id="${a.id}"><img src="${a.img}" alt="${esc(a.title)}"></div>`).join('')}</div>${L.length>1?`<button class="adnext" data-a="adnext">›</button>`:''}</div>${L.length>1?`<div class="adots">${L.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</div>`:''}</div>`}
function exploreView(p){
 const cs=CATS.filter(c=>c!==p.category&&S.products.some(x=>x.category===c));
 const bs=brands().filter(b=>b!==p.brand);
 const same=p.brand?S.products.filter(x=>x.brand===p.brand&&x.id!==p.id&&x.inStock!==false):[];
 return `${same.length?`<h2>More from ${esc(p.brand)}</h2><div class="rel">${same.map(tileHtml).join('')}</div>`:''}
 ${cs.length?`<h2>Explore other categories</h2><div class="chips">${cs.map(c=>`<button class="chip" data-a="gocat" data-v="${c}">${EM[c]} ${c}</button>`).join('')}</div>`:''}
 ${bs.length?`<h2>Shop other brands</h2><div class="chips">${bs.map(b=>`<button class="chip" data-a="gobrand" data-v="${esc(b)}">${esc(b)}</button>`).join('')}</div>`:''}`}
function aAds(){return `<div class="row"><h2>Ads</h2><button class="btn sm" data-a="editA">+ Add</button></div><p class="mute">Live ads rotate automatically below the product information.</p><div class="list">${S.ads.map(a=>`<div class="card"><div class="row"><div><b>${esc(a.title)}</b><div class="mute">${a.active?'Live':'Hidden'} · ${esc(a.target||'None')}</div></div><button class="btn sm ghost" data-a="editA" data-id="${a.id}">Edit</button></div>${a.img?`<img src="${a.img}" style="width:100%;border-radius:10px;margin-top:8px;aspect-ratio:2.4/1;object-fit:cover">`:''}</div>`).join('')||'<p class="mute">No ads yet.</p>'}</div>`}
function goTarget(t){if(!t||t==='None')return;const [k,...r]=t.split(': '),v=r.join(': ');
 if(k==='Product'){const p=S.products.find(x=>x.name===v);if(p){detail=p.id;dq=1;resetSc=true}}
 else if(k==='Category'){cat=v;brandF=null;detail=null;tab='shop';topNext=true}
 else if(k==='Brand'){brandF=v;cat='All';detail=null;tab='shop';topNext=true}}
function advAd(){const t=$('.adtrack');if(!t||t.children.length<2)return;const w=t.clientWidth;let i=Math.round(t.scrollLeft/w);i=(i+1)%t.children.length;t.scrollTo({left:i*w,behavior:'smooth'})}
setInterval(advAd,4000);
document.addEventListener('scroll',e=>{const t=e.target;if(t.classList&&t.classList.contains('adtrack')){const i=Math.round(t.scrollLeft/t.clientWidth);t.parentNode.parentNode.querySelectorAll('.adots i').forEach((d,n)=>d.classList.toggle('on',n===i))}},true);

const ICO={shop:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',discover:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',cart:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 016 0v2"/>',profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'};
function navHtml(){const n=Object.values(cart).reduce((a,b)=>a+b,0);
 const it=[['shop','Home'],['discover','Discover'],['cart','Orders'],['profile','Profile']];
 return `<nav class="nav">${it.map(t=>`<button class="${(tab===t[0]||(t[0]==='discover'&&tab==='combos'))?'on':''}" data-a="tab" data-v="${t[0]}"><b class="ic"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICO[t[0]]}</svg>${t[0]==='cart'&&n?`<i>${n}</i>`:''}</b><em class="nl">${t[1]}</em></button>`).join('')}</nav>`}
function navHtmlOld(){const n=Object.values(cart).reduce((a,b)=>a+b,0);
 const it=[['shop','🏠','Home'],['discover','🧭','Discover'],['cart','🧾','Orders'],['profile','👤','Profile']];
 return `<nav class="nav">${it.map(t=>`<button class="${(tab===t[0]||(t[0]==='discover'&&tab==='combos'))?'on':''}" data-a="tab" data-v="${t[0]}"><span>${t[1]}${t[0]==='cart'&&n?`<i>${n}</i>`:''}</span>${t[2]}</button>`).join('')}</nav>`}
function discBody(){const s=srch.trim().toLowerCase();
 if(s){const r=S.products.filter(p=>[p.name,p.brand,p.category,p.origin,p.grape].join(' ').toLowerCase().includes(s));return r.length?`<div class="plist">${r.map(prodCard).join('')}</div>`:'<p class="mute">Nothing found. Try another name or brand.</p>'}
 const hot=S.products.filter(p=>pct(p)>0&&p.inStock!==false);
 return `${adsView()}${catItems().some(c=>S.products.some(p=>p.category===c.name))?'<h2>Browse by category</h2>':''}${catItems().map(catSection).join('')}
 ${brands().length?`<h2>Shop by brand</h2>${brands().map(brandSection).join('')}`:''}
 ${S.combos.some(c=>c.active)?`<h2>Combo deals</h2>${combos()}`:''}
 <h2>On promotion</h2>${hot.length?`<div class="plist">${hot.map(prodCard).join('')}</div>`:'<p class="mute">No promotions right now.</p>'}`}
function discover(){return `<input id="srch" placeholder="🔍 Search drinks, brands, categories" value="${esc(srch)}"><div id="sres">${discBody()}</div>`}
function profile(){const n=S.mine.length;
 return `<h2 style="margin-top:4px">My profile</h2><p class="mute">Saved details make checkout faster. ${n} order${n===1?'':'s'} so far.</p>
 <label>Full name</label><input id="pn" value="${esc(prof.name)}"><label>Phone</label><input id="pp" type="tel" value="${esc(prof.phone)}">
 <label>State / Region</label><input id="pr" value="${esc(prof.region)}"><label>Delivery address</label><textarea id="pa" rows="2">${esc(prof.address)}</textarea>
 <button class="btn" data-a="saveprof">Save details</button>
 <div class="card" style="margin-top:14px"><b>Need help?</b><div class="mute">A question, a problem with an order, or a delivery issue? Talk to us directly.</div>${S.contact.hours?`<div class="mute">🕒 ${esc(S.contact.hours)}</div>`:''}${wa()?`<a class="btn" style="display:block;text-align:center;text-decoration:none;background:#25d366" href="${wa()}" target="_blank" rel="noopener">💬 Chat on WhatsApp</a>`:''}${tel()?`<a class="btn ghost" style="display:block;text-align:center;text-decoration:none" href="${tel()}">📞 Call ${esc(S.contact.phone)}</a>`:''}${!wa()&&!tel()?'<div class="mute">Contact details coming soon.</div>':''}</div>
 <div class="card" style="margin-top:14px"><b>D&amp;K Beverages</b><div class="mute">Spirits, wines, mixers and more delivered nationwide. You must be of legal drinking age to order.</div></div>`}
document.addEventListener('input',e=>{if(e.target.id==='srch'){srch=e.target.value;$('#sres').innerHTML=discBody()}});

const CC={All:['#00a082','#00d4a8'],Red:['#b3203f','#ff5d7e'],White:['#f5c842','#fff0a8'],'Rosé':['#ff7aa8','#ffc2d9'],Sparkling:['#ff9f1c','#ffe08a'],Spirits:['#8a5a2b','#d9a066'],Other:['#6c5ce7','#b5a9ff']};
const CP={Red:['🍷','🍇'],White:['🥂','🍋'],'Rosé':['🌸','🍷'],Sparkling:['🍾','✨'],Spirits:['🥃','🧊'],Other:['🍹','🍇']};
function catsHtml(){const ph=(Date.now()%2600)/1000,L=catItems(),lim=8,show=catsOpen||L.length<=lim?L:L.slice(0,lim-1);
 const tile=(c,i)=>`<button class="cat2 ${c.name===cat&&!brandF?'on':''} ${c.name===popC?'pop':''}" data-a="cat" data-v="${esc(c.name)}"><span class="bw"><span class="halo"></span><span class="blob"><i class="cem" style="animation-delay:${(i*0.25-ph).toFixed(2)}s">${c.emoji||'🍹'}${c.emoji2?`<u>${c.emoji2}</u>`:''}</i></span></span><em>${esc(c.name)}</em></button>`;
 return `<div class="cpanel"><div class="cgrid">${show.map(tile).join('')}${L.length>lim?`<button class="cat2" data-a="catsmore"><span class="bw"><span class="blob"><i class="cem" style="font-size:26px">${catsOpen?'▲':'▼'}</i></span></span><em>${catsOpen?'Less':'More'}</em></button>`:''}</div><div class="hint">Hold a category to peek inside</div></div>`}
function catsHtmlOld2(){const ph=(Date.now()%2600)/1000;
 return `<div class="cpanel"><div class="cgrid">${CATS.map((c,i)=>`<button class="cat2 ${c===cat&&!brandF?'on':''} ${c===popC?'pop':''}" data-a="cat" data-v="${c}"><span class="bw"><span class="halo"></span><span class="blob"><i class="cem" style="animation-delay:${(i*0.25-ph).toFixed(2)}s">${CP[c][0]}<u>${CP[c][1]}</u></i></span></span><em>${c}</em></button>`).join('')}</div><div class="hint">Hold a category to peek inside</div></div>`}
function peekView(){const L=S.products.filter(p=>p.category===peek),shown=L.filter(p=>p.inStock!==false).slice(0,6);
 return `<div class="modal"><div class="bd" data-a="closepeek"></div><div class="sheet pk"><div class="row"><h2 style="margin:0">${EM[peek]||''} ${esc(peek)}</h2><span class="mute">${L.length} product${L.length===1?'':'s'}</span></div>
 ${shown.length?`<div class="rel" style="margin-top:12px">${shown.map(tileHtml).join('')}</div>`:'<p class="mute">Nothing here yet. Check back soon!</p>'}
 <button class="btn" data-a="seecat" data-v="${esc(peek)}">See all ${esc(peek)}</button><button class="btn ghost" data-a="closepeek">Close</button></div></div>`}
let pt=null;
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.cat2');if(!b||!b.dataset.v)return;clearTimeout(pt);pt=setTimeout(()=>{held=true;peek=b.dataset.v;try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}render()},420)});
const relH=()=>{clearTimeout(pt);setTimeout(()=>{held=false},350)};
document.addEventListener('pointerup',relH);document.addEventListener('pointercancel',relH);
document.addEventListener('scroll',()=>clearTimeout(pt),true);
document.addEventListener('contextmenu',e=>{if(e.target.closest('.cat2'))e.preventDefault()});
function catsHtmlOld(){const ph=(Date.now()%2600)/1000;return ['All',...CATS].map((c,i)=>`<button class="cat ${c===cat&&!brandF?'on':''} ${c===popC?'pop':''}" data-a="cat" data-v="${c}"><b class="cico" style="background:linear-gradient(145deg,${CC[c][0]},${CC[c][1]})"><i class="cem" style="animation-delay:${(i*0.22-ph).toFixed(2)}s">${c==='All'?'🛒':EM[c]}</i></b><em>${c}</em></button>`).join('')}

function orderView(){const o=S.orders.find(x=>x.id===ord.o),d=o&&{id:o.uid};if(!o)return '';
 const n=o.lines.reduce((s,l)=>s+l.q,0);
 return `<div class="full"><div class="ohead"><button class="xb2" data-a="closeord">✕</button><b>Order #${esc(o.id.slice(-6))}</b><span class="st">${o.status}</span></div>
 <div class="dbody"><div class="pbox"><b style="font-size:18px">${esc(o.name)}</b><div class="mute">${new Date(o.ts).toLocaleString()}</div>
 <div style="margin-top:8px">📞 <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></div><div>📍 ${esc(o.region)}</div><div class="mute">${esc(o.address)}</div></div>
 <h3>Items to pack (${n})</h3>
 ${o.lines.map(l=>`<div class="row spec"><span><b>${l.q}×</b> ${esc(l.n)}<span class="mute"> @ ${m(l.p)}</span></span><b>${m(l.p*l.q)}</b></div>${l.it?`<div class="mute" style="margin:4px 0 6px 20px">Includes: ${l.it.map(i=>(i.q*l.q)+'× '+esc(i.n)).join(', ')}</div>`:''}`).join('')}
 <div class="row" style="margin-top:14px"><b>Total</b><b style="font-size:20px">${m(o.total)}</b></div>
 <h3>Order status</h3><select data-a="status" data-u="${d.id}" data-o="${o.id}">${STAT.map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}</select>
 <button class="btn ghost" data-a="closeord">Back to orders</button></div></div>`}

const wa=t=>{const n=(S.contact.whatsapp||'').replace(/\D/g,'');return n?'https://wa.me/'+n+'?text='+encodeURIComponent(t||S.contact.msg||'Hello D&K Beverages, I need help'):''};
const tel=()=>{const n=(S.contact.phone||'').replace(/[^\d+]/g,'');return n?'tel:'+n:''};
function aSettings(){const c=S.contact;return `${themePicker()}${catManager()}<h2 style="margin-top:4px">Contact details</h2><p class="mute">Customers see these in the app and can reach you in one tap. Include the country code, for example +256 7XX XXX XXX.</p>
 <label>Phone number for calls</label><input id="sp" type="tel" value="${esc(c.phone||'')}" placeholder="+256 ...">
 <label>WhatsApp number</label><input id="sw" type="tel" value="${esc(c.whatsapp||'')}" placeholder="+256 ...">
 <label>Message customers start the WhatsApp chat with</label><textarea id="sm" rows="2">${esc(c.msg||'Hello D&K Beverages, I need help with...')}</textarea>
 <label>Opening hours (optional)</label><input id="sh" value="${esc(c.hours||'')}" placeholder="Mon–Sat, 9am–10pm">
 <label>Delivery time (shown to customers)</label><input id="sd" value="${esc(c.delivery||'')}" placeholder="e.g. 1–3 days, or Within 24 hours">
 <button class="btn" data-a="savecontact">Save contact details</button>`}

const THEMES=[
{id:'classic',emoji:'🥃',name:'D&K Classic',when:'Everyday',msg:'',deco:[],v:{wine:'#9a6a12',wine2:'#c4922a',hd:'#111111',hdi:'#e8c368',pn:'#1c1c1c',bl:'#c9a24a',pm1:'#1c1c1c',pm2:'#4a3a14',pmi:'#f3d58a',pni:'#ffffffb0'}},
{id:'fresh',emoji:'🍃',name:'Fresh Green',when:'Everyday',msg:'',deco:[],v:{wine:'#00a082',wine2:'#00c29b',hd:'#ffc244',hdi:'#191919',pn:'#f4c35a',bl:'#dca03a',pm1:'#ffc244',pm2:'#ffd97a',pmi:'#191919',pni:'#191919b0'}},
{id:'valentine',emoji:'💘',name:"Valentine's Day",when:'February',msg:"Valentine's treats for the one you love",deco:['💖','🌹','💕'],v:{wine:'#d6336c',wine2:'#f06595',hd:'#c2185b',hdi:'#ffffff',pn:'#ffb3c8',bl:'#e0457b',pm1:'#ff5c8a',pm2:'#ff9eb8',pmi:'#ffffff',pni:'#5a1230b0'}},
{id:'girlfriends',emoji:'💅',name:"Girlfriends' Day",when:'August',msg:'Treat your girls today',deco:['💅','👭','💖'],v:{wine:'#b5179e',wine2:'#e056c8',hd:'#b5179e',hdi:'#ffffff',pn:'#f5b8ec',bl:'#b5179e',pm1:'#b5179e',pm2:'#f15bb5',pmi:'#ffffff',pni:'#4a0d44b0'}},
{id:'mothers',emoji:'💐',name:"Mother's Day",when:'May',msg:'Celebrate Mum with something special',deco:['💐','🌷','💝'],v:{wine:'#c2185b',wine2:'#ec407a',hd:'#fce4ec',hdi:'#880e4f',pn:'#f8bbd0',bl:'#ad1457',pm1:'#ec407a',pm2:'#f48fb1',pmi:'#ffffff',pni:'#5d1033b0'}},
{id:'heroes',emoji:'🎖️',name:'Heroes Day',when:'June',msg:'Honouring our heroes. Happy Heroes Day!',deco:['🎖️','🇺🇬','⭐'],v:{wine:'#2b6a2f',wine2:'#3d8b40',hd:'#1b3a1d',hdi:'#ffd43b',pn:'#2e5d32',bl:'#ffd43b',pm1:'#1b3a1d',pm2:'#3d8b40',pmi:'#ffe066',pni:'#ffffffcc'}},
{id:'independence',emoji:'🇺🇬',name:'Uganda Independence',when:'October',msg:'Happy Independence Day, Uganda! Cheers to 9th October',deco:['🇺🇬','🎉','🥁'],v:{wine:'#c8102e',wine2:'#e03a4f',hd:'#000000',hdi:'#fcdc04',pn:'#fcdc04',bl:'#000000',pm1:'#000000',pm2:'#c8102e',pmi:'#fcdc04',pni:'#000000b0'}},
{id:'halloween',emoji:'🎃',name:'Halloween',when:'October',msg:'Spooky season specials',deco:['🎃','🦇','👻'],v:{wine:'#e8590c',wine2:'#ff922b',hd:'#1a1025',hdi:'#ff922b',pn:'#3b1d5a',bl:'#ff922b',pm1:'#3b1d5a',pm2:'#6a2c91',pmi:'#ffd8a8',pni:'#ffffffcc'}},
{id:'blackfriday',emoji:'🏷️',name:'Black Friday',when:'November',msg:'Black Friday. Our biggest discounts of the year',deco:['🏷️','🔥','💥'],v:{wine:'#e03131',wine2:'#ff6b6b',hd:'#000000',hdi:'#ffffff',pn:'#111111',bl:'#e03131',pm1:'#e03131',pm2:'#ff6b6b',pmi:'#ffffff',pni:'#ffffffcc'}},
{id:'christmas',emoji:'🎄',name:'Christmas',when:'December',msg:'Merry Christmas! Festive deals inside',deco:['❄️','🎄','⭐'],v:{wine:'#1b7f3b',wine2:'#2fa653',hd:'#b3202a',hdi:'#ffffff',pn:'#1f6b3a',bl:'#e8c34a',pm1:'#b3202a',pm2:'#e4474f',pmi:'#ffffff',pni:'#ffffffcc'}},
{id:'newyear',emoji:'🎆',name:'New Year',when:'January',msg:'Happy New Year! Cheers to a great year',deco:['🎆','✨','🥂'],v:{wine:'#6741d9',wine2:'#9775fa',hd:'#0b1026',hdi:'#ffd43b',pn:'#1c2559',bl:'#ffd43b',pm1:'#1c2559',pm2:'#4c3a9e',pmi:'#ffe066',pni:'#ffffffcc'}},
{id:'easter',emoji:'🐣',name:'Easter',when:'Spring',msg:'Happy Easter from D&K Beverages',deco:['🐣','🌷','🥚'],v:{wine:'#7048e8',wine2:'#9775fa',hd:'#fff3bf',hdi:'#5f3dc4',pn:'#d0bfff',bl:'#7048e8',pm1:'#7048e8',pm2:'#b197fc',pmi:'#ffffff',pni:'#2b1a66b0'}}
];
const EXTRA={christmas:{deco:['❄️','❄️','❅','❄️','🎁'],n:28,att:'xmas'},independence:{deco:['🇺🇬','🎉','🇺🇬','🎊'],att:'flag'},heroes:{deco:['🎖️','⭐','🇺🇬'],att:'flag'},halloween:{deco:['🎃','👻','🦇'],att:'halloween'},valentine:{deco:['💖','❤️','💕','💗'],rise:true,att:'garland',gi:['💖','💗','❤️']},girlfriends:{deco:['💖','✨','💅','👭'],rise:true,att:'garland',gi:['🎀','💅','💖']},mothers:{deco:['🌸','🌷','💐','🌺'],att:'garland',gi:['🌷','🌸','💐']},newyear:{deco:['🎊','✨','🎉','🥂'],att:'fireworks'},easter:{deco:['🥚','🐣','🌷'],att:'garland',gi:['🥚','🐰','🌷']},blackfriday:{deco:['🏷️','🔥','💸'],att:'ticker'}};
THEMES.forEach(t=>Object.assign(t,EXTRA[t.id]||{}));
const curTheme=()=>THEMES.find(t=>t.id===S.theme.id)||THEMES[0];
let fxKey='';
function applyTheme(){const t=curTheme(),de=document.documentElement,r=de.style,v=t.v;
 for(const k of ['wine','wine2','hd','hdi','pn','bl','pm1','pm2','pmi','pni'])r.setProperty('--'+k,v[k]);
 r.setProperty('--gold',v.bl);r.setProperty('--tint',v.pn+'55');de.dataset.th=t.id;
 const on=S.theme.fx!==false&&t.deco.length>0,n=t.n||14,key=t.id+on,f=$('#fx');
 if(f){if(key!==fxKey){fxKey=key;f.className='fx'+(t.rise?' rise':'');f.innerHTML=on?Array.from({length:n},(_,i)=>`<span style="left:${(i*(97/n)+2)%97}%;animation-duration:${8+(i*1.7)%8}s;animation-delay:-${(i*2.3)%14}s;font-size:${t.id==='christmas'?12+(i%4)*4:16+(i%3)*6}px">${t.deco[i%t.deco.length]}</span>`).join(''):''}f.style.display=admin()?'none':'block'}}
function applyThemeOld(){const t=curTheme(),r=document.documentElement.style,v=t.v;
 for(const k of ['wine','wine2','hd','hdi','pn','bl','pm1','pm2','pmi','pni'])r.setProperty('--'+k,v[k]);
 r.setProperty('--gold',v.bl);r.setProperty('--tint',v.pn+'55');
 const on=S.theme.fx!==false&&t.deco.length>0,key=t.id+on,f=$('#fx');
 if(f){if(key!==fxKey){fxKey=key;f.innerHTML=on?Array.from({length:14},(_,i)=>`<span style="left:${(i*7.3+3)%96}%;animation-duration:${9+(i*1.7)%7}s;animation-delay:-${(i*2.3)%12}s;font-size:${16+(i%3)*6}px">${t.deco[i%t.deco.length]}</span>`).join(''):''}f.style.display=admin()?'none':'block'}}
function festive(){const t=curTheme(),txt=S.theme.text||t.msg;if(!txt)return '';return `<div class="festive"><span style="font-size:26px">${t.emoji}</span><span>${esc(txt)}</span></div>`}
function themePicker(){const cur=curTheme().id;
 return `<h2 style="margin-top:4px">Theme &amp; season</h2><p class="mute">Pick a look for the customer app. It changes straight away for every customer.</p>
 <div class="themes">${THEMES.map(t=>`<button class="tcard ${t.id===cur?'on':''}" data-a="theme" data-v="${t.id}"><div class="tp" style="background:${t.v.hd};color:${t.v.hdi}"><span>${t.emoji}</span><span style="display:flex;gap:4px"><i style="width:14px;height:14px;border-radius:50%;background:${t.v.wine};display:block"></i><i style="width:14px;height:14px;border-radius:50%;background:${t.v.pn};display:block"></i></span></div><div class="tn">${esc(t.name)}<small>${t.when}</small></div></button>`).join('')}</div>
 <label class="chk" style="margin-top:12px"><input type="checkbox" data-c="fx" ${S.theme.fx!==false?'checked':''}> Festive animation (falling emojis)</label>
 <label>Greeting on the home screen (optional)</label><input id="tt" value="${esc(S.theme.text||'')}" placeholder="${esc(curTheme().msg||'e.g. Free delivery this weekend')}">
 <button class="btn" data-a="savetext">Save greeting</button><hr style="border:0;border-top:1px solid var(--line);margin:18px 0">`}

const pmatch=(x,p)=>x.all||x.scope==='All'||x.scope===p.category||(x.cats||[]).includes(p.category)||(x.prods||[]).includes(p.id);
const csave=c=>Math.max(0,...S.promos.filter(x=>x.active&&(x.combos||[]).includes(c.id)).map(x=>psave(x,c.price)));
const cfin=c=>c.price-csave(c);
function pdesc(x){if(x.all||x.scope==='All')return 'everything';const a=[],cs=x.cats||(x.scope&&x.scope!=='Custom'?[x.scope]:[]);if(cs.length)a.push(cs.join(', '));const n=(x.prods||[]).length;if(n)a.push(n+' product'+(n>1?'s':''));const k=(x.combos||[]).length;if(k)a.push(k+' combo'+(k>1?'s':''));return a.join(' + ')||'nothing selected'}
function promoPicker(v){const all=v.all||v.scope==='All',cs=v.cats||(v.scope&&v.scope!=='All'&&v.scope!=='Custom'?[v.scope]:[]);
 const ck=(a,val,on,l)=>`<label class="chk"><input type="checkbox" ${a}="${esc(val)}" ${on?'checked':''}> ${l}</label>`;
 return `<h3>This promotion applies to</h3>${ck('data-pall','1',all,'<b>Everything</b> (all products)')}
 <label>Categories</label>${CATS.map(c=>ck('data-pcat',c,cs.includes(c),EM[c]+' '+c)).join('')}
 <label>Specific products</label>${S.products.map(p=>ck('data-pprod',p.id,(v.prods||[]).includes(p.id),esc(p.name))).join('')||'<div class="mute">No products yet</div>'}
 <label>Combo deals</label>${S.combos.map(c=>ck('data-pcmb',c.id,(v.combos||[]).includes(c.id),'🎁 '+esc(c.name))).join('')||'<div class="mute">No combos yet</div>'}`}
const attOn=()=>!admin()&&!!curTheme().att;
function attHtml(){if(!attOn())return '';const t=curTheme(),a=t.att,sp=(arr,n)=>Array.from({length:n},(_,i)=>`<i class="g" style="animation-delay:${(i%5)*.25}s">${arr[i%arr.length]}</i>`).join('');
 if(a==='xmas')return `<div class="att"><div class="snowcap"></div><div class="lights">${Array.from({length:14},(_,i)=>`<i style="left:${(i+.5)*100/14}%;background:${['#ff4d4d','#ffd43b','#51cf66','#4dabf7','#f783ac'][i%5]};animation-delay:${(i%5)*.3}s"></i>`).join('')}</div></div>`;
 if(a==='flag')return `<div class="att"><div class="bunting">${Array.from({length:11},(_,i)=>`<i style="border-top-color:${['#000','#fcdc04','#d90000'][i%3]};animation-delay:${(i%4)*.25}s"></i>`).join('')}</div><div class="flagwrap"><div class="pole"></div><div class="flag"><b></b><b></b><b></b><b></b><b></b><b></b><span class="disc"></span></div></div></div>`;
 if(a==='halloween')return `<div class="att"><span class="web">🕸️</span><span class="spider"><u></u>🕷️</span><span class="bat b1">🦇</span><span class="bat b2">🦇</span></div>`;
 if(a==='garland')return `<div class="att"><div class="garland">${sp(t.gi,9)}</div></div>`;
 if(a==='fireworks')return `<div class="att"><div class="garland">${sp(['✨','🎊','✨','🎉'],9)}</div><span class="fw f1">🎆</span><span class="fw f2">🎇</span><span class="fw f3">🎆</span></div>`;
 if(a==='ticker')return `<div class="att"><div class="ticker"><span>🏷️ BLACK FRIDAY · BIGGEST DISCOUNTS OF THE YEAR · 🔥 SHOP NOW · 🏷️ BLACK FRIDAY · BIGGEST DISCOUNTS OF THE YEAR · 🔥 SHOP NOW</span></div></div>`;
 return ''}

const DEFCATS=[{name:'Whiskey',emoji:'🥃',emoji2:'🧊'},{name:'Wine',emoji:'🍷',emoji2:'🍇'},{name:'Champagne',emoji:'🍾',emoji2:'✨'},{name:'Sparkling Wine',emoji:'🥂',emoji2:'🍋'},{name:'Gin',emoji:'🍸',emoji2:'🌿'},{name:'Vodka',emoji:'🍶',emoji2:'❄️'},{name:'Rum',emoji:'🥥',emoji2:'🥃'},{name:'Tequila',emoji:'🌵',emoji2:'🍋'},{name:'Brandy & Cognac',emoji:'🥃',emoji2:'🍇'},{name:'Liqueurs',emoji:'🍹',emoji2:'🍒'},{name:'Beer & Cider',emoji:'🍺',emoji2:'🍻'},{name:'Mixers & Soft Drinks',emoji:'🥤',emoji2:'🍋'},{name:'Water & Juice',emoji:'🧃',emoji2:'💧'},{name:'Other',emoji:'🛒',emoji2:''}];
const LEG={Red:'Wine',White:'Wine','Rosé':'Wine',Sparkling:'Sparkling Wine',Spirits:'Whiskey'};
const normCat=c=>CATS.includes(c)?c:(CATS.includes(LEG[c])?LEG[c]:c);
const catItems=()=>S.categories.length?[...S.categories].sort((a,b)=>(a.order||0)-(b.order||0)):DEFCATS;
function syncCats(){const L=catItems();CATS.splice(0,CATS.length,...L.map(c=>c.name));for(const k in EM)delete EM[k];L.forEach(c=>{EM[c.name]=c.emoji||'🍹'})}
syncCats();
function homeCombos(){if(cat!=='All'||brandF)return '';const L=S.combos.filter(c=>c.active);if(!L.length)return '';
 return `<h2>Combo deals</h2><div class="crow">${L.map(c=>{const items=(c.items||[]).map(i=>P(i.id)?i.q+'× '+esc(P(i.id).name):'').filter(Boolean).join(', '),was=(c.items||[]).reduce((s,i)=>s+(P(i.id)?fin(P(i.id))*i.q:0),0),pr=cfin(c),q=cart['c:'+c.id]||0;
 return `<div class="cc"><div class="cct">🎁 ${esc(c.name)}</div><div class="mute ccs">${items}</div><div class="price">${m(pr)} ${was>pr?`<span class="old">${m(was)}</span>`:''}</div>${was>pr?`<span class="badge">Save ${m(was-pr)}</span>`:''}<button class="btn sm" data-a="add" data-k="c:${c.id}">${q?'In cart ('+q+') · add more':'Add combo'}</button></div>`}).join('')}</div>`}
function catManager(){const L=catItems();return `<h2 style="margin-top:4px">Categories</h2><p class="mute">The drink categories customers see on the home screen. Add any type of drink. Renaming a category does not rename it on products already saved.</p>
 ${S.categories.length?`<div class="list">${[...S.categories].sort((a,b)=>(a.order||0)-(b.order||0)).map(c=>`<div class="card row"><b>${c.emoji||''} ${esc(c.name)}</b><button class="btn sm ghost" data-a="editK" data-id="${c.id}">Edit</button></div>`).join('')}</div>`:`<div class="mute">Using the default list: ${L.map(c=>esc(c.name)).join(', ')}.</div><button class="btn ghost" data-a="seedcats">Copy the default list so I can edit it</button>`}
 <button class="btn" data-a="editK">+ Add category</button><hr style="border:0;border-top:1px solid var(--line);margin:18px 0">`}

function pdisc(x){return x.kind==='amt'?'UGX '+Math.round(+x.pct||0).toLocaleString('en-US')+' off':(+x.pct||0)+'% off'}
function promoBar(){if(admin())return '';const L=S.promos.filter(x=>x.active);if(!L.length)return '';
 const t=L.map(x=>'🏷️ '+esc(x.title)+' · '+esc(pdisc(x))+' '+esc(pdesc(x))).join('\u2003•\u2003');
 const dur=Math.max(16,Math.round(t.length*.3));
 return `<div class="pbar"><span style="animation-duration:${dur}s;animation-delay:-${((Date.now()/1000)%dur).toFixed(2)}s">${t}</span></div>`}
function catSection(c){const L=S.products.filter(p=>p.category===c.name&&p.inStock!==false);if(!L.length)return '';
 return `<div class="lsec"><div class="lhead" data-a="gocat" data-v="${esc(c.name)}"><span class="lt"><i>${c.emoji||'🍹'}</i><b>${esc(c.name)}</b><em>${L.length} item${L.length>1?'s':''}</em></span><span class="lgo">See all ›</span></div><div class="rel">${L.slice(0,10).map(tileHtml).join('')}</div></div>`}
function brandSection(b){const L=S.products.filter(p=>p.brand===b&&p.inStock!==false);if(!L.length)return '';
 return `<div class="lsec"><div class="lhead" data-a="gobrand" data-v="${esc(b)}"><span class="lt"><i>🏷️</i><b>${esc(b)}</b><em>${L.length} item${L.length>1?'s':''}</em></span><span class="lgo">See all ›</span></div><div class="rel">${L.slice(0,10).map(tileHtml).join('')}</div></div>`}

/* MODAL */
function field(f,v){const val=v[f.k]??f.d??'';
 if(f.t==='select')return `<label>${f.l}</label><select data-f="${f.k}">${f.o.map(o=>`<option ${o===val?'selected':''}>${o}</option>`).join('')}</select>`;
 if(f.t==='check')return `<label class="chk"><input type="checkbox" data-f="${f.k}" ${val!==false&&val!==''?'checked':''}> ${f.l}</label>`;
 if(f.t==='text')return `<label>${f.l}</label><textarea rows="2" data-f="${f.k}">${esc(val)}</textarea>`;
 return `<label>${f.l}</label><input data-f="${f.k}" type="${f.t||'text'}" step="any" value="${esc(val)}">`}
function openForm(col,title,fields,v,extra){modal={col,title,fields,v,extra}}
function modalView(){if(!modal)return '';const {title,fields,v,extra}=modal;
 return `<div class="modal"><div class="sheet"><h2 style="margin-top:0">${title}</h2>${fields.map(f=>field(f,v)).join('')}${extra?extra():''}
 <button class="btn" data-a="save">Save</button>${v.id?`<button class="btn red" data-a="del">Delete</button>`:''}<button class="btn ghost" data-a="close">Cancel</button></div></div>`}

function render(){
 applyTheme();
 S.products.forEach(p=>{p.category=normCat(p.category)});
 const A=admin();
 const tabs=A?[['orders','Orders'],['products','Products'],['combos','Combos'],['promos','Promotions'],['ads','Ads'],['settings','Settings']]:[['shop','Home'],['discover','Discover'],['combos','Combos'],['profile','Profile'],['cart','Orders'+(Object.keys(cart).length?` (${Object.values(cart).reduce((a,b)=>a+b,0)})`:'')]];
 if(!tabs.some(t=>t[0]===tab))tab=tabs[0][0];
 let body='';
 if(!aged&&!A)body=`<div class="modal" style="align-items:center"><div class="sheet" style="border-radius:16px;text-align:center"><img src="${LOGO}" alt="D&amp;K Beverages" style="width:120px;height:120px;border-radius:50%;margin-bottom:8px"><h2>Are you of legal drinking age?</h2><p class="mute">This shop sells alcohol. You must be of legal drinking age in your country.</p><button class="btn" data-a="age">Yes, enter</button></div></div>`;
 else if(!db)body='<main><p class="mute">'+esc(window.CONNECT_ERR||'Connecting to the shop…')+'</p></main>';
 else body=`<div class="tabs ${A?'':'cust'}">${tabs.map(t=>`<button class="tab ${t[0]===tab?'on':''}" data-a="tab" data-v="${t[0]}">${t[1]}</button>`).join('')}</div><main class="${attOn()?'hasatt':''}">${msg?`<div class="banner">${esc(msg)}</div>`:''}
 ${A?{orders:aOrders,products:aProducts,combos:aCombos,promos:aPromos,ads:aAds,settings:aSettings}[tab]():{shop,combos,discover,profile,cart:cartView}[tab]()}</main>`;
 const keep=['cn','cp','cr','ca','sp','sw','sm','sh','sd','pn','pp','pr','pa'].map(i=>$('#'+i)?.value);const sc=$('.full')?.scrollTop||0;const wy=window.scrollY,hs=['.cats','.hero','.rel','.tabs','.adtrack','.crow'].map(s=>[...document.querySelectorAll(s)].map(e=>e.scrollLeft));
 $('#app').innerHTML=`${isAdmin?`<div class="admin-bar"><span>${asCust?'Previewing as customer':'Admin mode'}</span><span style="display:flex;gap:6px"><button data-a="toggle">${asCust?'Back to admin':'View as customer'}</button><button data-a="signout">Sign out</button></span></div>`:''}
 <div class="stick">${promoBar()}<header><div style="display:flex;align-items:center;gap:10px"><img class="hlogo" src="${LOGO}" alt="" style="width:38px;height:38px;border-radius:50%"><h1>D&amp;K Beverages</h1></div><span class="mute">Wines, spirits, mixers &amp; more, nationwide</span>${attHtml()}</header></div>${body}${modalView()}${detail?detailView():''}${peek&&!detail?peekView():''}${ord&&admin()?orderView():''}`;
 ['cn','cp','cr','ca','sp','sw','sm','sh','sd','pn','pp','pr','pa'].forEach((i,n)=>{if($('#'+i)&&keep[n])$('#'+i).value=keep[n]});if($('.full')){$('.full').scrollTop=resetSc?0:sc;resetSc=false}window.scrollTo(0,topNext?0:wy);topNext=false;['.cats','.hero','.rel','.tabs','.adtrack','.crow'].forEach((s,i)=>{document.querySelectorAll(s).forEach((e,j)=>{e.scrollLeft=hs[i][j]||0})});
 popC=null;if(!A&&db&&aged)$('#app').insertAdjacentHTML('beforeend',navHtml());
 if(!A&&db&&aged&&wa())$('#app').insertAdjacentHTML('beforeend',`<a class="fab ${tab==='shop'&&Object.keys(cart).length?'up':''}" href="${wa()}" target="_blank" rel="noopener">💬 Chat with us</a>`);
 if(!A&&tab==='shop'&&Object.keys(cart).length)$('#app').insertAdjacentHTML('beforeend',`<div class="cartbar"><button class="btn" data-a="tab" data-v="cart">View cart · ${m(total())}</button></div>`);
}

/* ACTIONS */
const num=v=>parseFloat(v)||0;
function readForm(){const o={};document.querySelectorAll('.sheet [data-f]').forEach(e=>{const k=e.dataset.f;o[k]=e.type==='checkbox'?e.checked:e.type==='number'?num(e.value):e.value});return o}
async function guard(fn){try{await fn()}catch(e){msg='Could not save: '+(e.message||e.code||'error')+'. Please check your connection and try again.';render()}}

document.addEventListener('click',async ev=>{
 const b=ev.target.closest('[data-a]');if(held)return;if(!b||b.tagName==='SELECT')return;const a=b.dataset.a,d=b.dataset;
 if(a==='age'){aged=true}
 else if(a==='tab'){tab=d.v;msg='';topNext=true}
 else if(a==='cat'){cat=(cat===d.v&&!brandF?'All':d.v);brandF=null;popC=d.v;peek=null}
 else if(a==='seecat'){cat=d.v;brandF=null;popC=d.v;peek=null}
 else if(a==='closepeek'){peek=null}
 else if(a==='toggle'){asCust=!asCust;tab=asCust?'shop':'orders'}
 else if(a==='add'){cart[d.k]=(cart[d.k]||0)+1}
 else if(a==='rm'){cart[d.k]--;if(cart[d.k]<=0)delete cart[d.k]}
 else if(a==='close'){modal=null}
 else if(a==='detail'){detail=d.id;dq=1;resetSc=true;peek=null}
 else if(a==='dqm'){dq=Math.max(1,dq-1)}
 else if(a==='dqp'){dq++}
 else if(a==='addn'){cart['p:'+d.id]=(cart['p:'+d.id]||0)+dq;detail=null;dq=1}
 else if(a==='closeD'){detail=null}
 else if(a==='goCart'){detail=null;tab='cart'}
 else if(a==='adnext'){advAd();return}
 else if(a==='adgo'){goTarget((S.ads.find(x=>x.id===d.id)||{}).target)}
 else if(a==='gocat'){cat=d.v;brandF=null;detail=null;tab='shop';topNext=true}
 else if(a==='gobrand'){brandF=d.v;cat='All';detail=null;tab='shop';topNext=true}
 else if(a==='clrb'){brandF=null;cat='All'}
 else if(a==='openord'){ord={u:d.u,o:d.o}}
 else if(a==='theme'){await guard(async()=>{await db.collection('settings').doc('theme').set({...S.theme,id:d.v})})}
 else if(a==='savetext'){await guard(async()=>{await db.collection('settings').doc('theme').set({...S.theme,text:$('#tt').value.trim()});msg='Greeting saved'})}
 else if(a==='savecontact'){const c={phone:$('#sp').value.trim(),whatsapp:$('#sw').value.trim(),msg:$('#sm').value.trim(),hours:$('#sh').value.trim(),delivery:$('#sd').value.trim()};await guard(async()=>{await db.collection('settings').doc('contact').set(c);msg='Contact details saved'})}
 else if(a==='closeord'){ord=null}
 else if(a==='signout'){await window._sb.auth.signOut();location.reload()}
 else if(a==='catsmore'){catsOpen=!catsOpen}
 else if(a==='seedcats'){await guard(async()=>{for(let i=0;i<DEFCATS.length;i++){const c=DEFCATS[i];await db.collection('categories').add({name:c.name,emoji:c.emoji,emoji2:c.emoji2||'',order:i+1})}})}
 else if(a==='editK'){const v=d.id?{...S.categories.find(x=>x.id===d.id)}:{order:S.categories.length+1};openForm('categories',d.id?'Edit category':'New category',[{k:'name',l:'Category name (e.g. Gin)'},{k:'emoji',l:'Main emoji'},{k:'emoji2',l:'Small accent emoji (optional)'},{k:'order',l:'Position (1 = first)',t:'number'}],v)}
 else if(a==='saveprof'){prof={name:$('#pn').value.trim(),phone:$('#pp').value.trim(),region:$('#pr').value.trim(),address:$('#pa').value.trim()};await guard(async()=>{await db.collection('profiles').doc(uid).set(prof);msg='Details saved'})}
 else if(a==='editA'){const v=d.id?{...S.ads.find(x=>x.id===d.id)}:{};const T=['None',...CATS.map(c=>'Category: '+c),...brands().map(b=>'Brand: '+b),...S.products.map(p=>'Product: '+p.name)];
  openForm('ads',d.id?'Edit ad':'New ad',[{k:'title',l:'Ad name (only you see this)'},{k:'target',l:'When a customer taps the ad, show',t:'select',o:T},{k:'active',l:'Live now',t:'check'}],v,()=>`<label>Ad banner (wide image works best)</label><div id="imgprev">${v.img?`<img src="${v.img}" style="width:100%;border-radius:10px">`:''}</div><input type="file" accept="image/*" id="imgf" data-max="900">`)}
 else if(a==='order'){
  const o={name:$('#cn').value.trim(),phone:$('#cp').value.trim(),region:$('#cr').value.trim(),address:$('#ca').value.trim()};
  if(Object.values(o).some(x=>!x)){msg='Please fill in all delivery details.';render();return}
  const lines=cartLines().map(l=>l.it?{n:l.n,q:l.q,p:l.p,it:l.it}:{n:l.n,q:l.q,p:l.p});
  await guard(async()=>{await db.collection('orders').add({uid,ts:Date.now(),...o,lines,total:total(),status:'New'});for(const k in cart)delete cart[k];msg='Order placed! The shop will contact you shortly.'});
 }
 else if(a==='editP'){const v=d.id?{...P(d.id)}:{};openForm('products',d.id?'Edit product':'New product',[{k:'name',l:'Name'},{k:'brand',l:'Brand'},{k:'category',l:'Category',t:'select',o:CATS},{k:'price',l:'Price',t:'number'},{k:'origin',l:'Origin / region'},{k:'grape',l:'Grape / type'},{k:'vintage',l:'Vintage (year)'},{k:'volume',l:'Bottle size (e.g. 750ml)'},{k:'abv',l:'Alcohol %',t:'number'},{k:'desc',l:'Short description',t:'text'},{k:'notes',l:'Tasting notes',t:'text'},{k:'inStock',l:'In stock',t:'check'}],v,()=>`<label>Product photo</label><div id="imgprev">${v.img?`<img src="${v.img}" style="width:100%;max-height:160px;object-fit:contain;border-radius:10px">`:''}</div><input type="file" accept="image/*" id="imgf">`)}
 else if(a==='editR'){const v=d.id?{...S.promos.find(x=>x.id===d.id)}:{};v.kind=v.kind==='amt'?'Amount off (UGX)':'Percent off (%)';openForm('promos',d.id?'Edit promotion':'New promotion',[{k:'title',l:'Banner title'},{k:'kind',l:'Discount type',t:'select',o:['Percent off (%)','Amount off (UGX)']},{k:'pct',l:'Discount value (a percentage, or an amount in UGX)',t:'number'},{k:'active',l:'Live now',t:'check'}],v,()=>promoPicker(v))}
 else if(a==='editC'){const v=d.id?{...S.combos.find(x=>x.id===d.id)}:{};const cur=v.items||[];
  openForm('combos',d.id?'Edit combo':'New combo',[{k:'name',l:'Combo name'},{k:'price',l:'Combo price',t:'number'},{k:'active',l:'Live now',t:'check'}],v,()=>`<label>Included products</label>${S.products.map(p=>{const i=cur.find(x=>x.id===p.id);return `<div class="chk"><input type="checkbox" data-ci="${p.id}" ${i?'checked':''}><span style="flex:1">${esc(p.name)}</span><input type="number" min="1" value="${i?i.q:1}" data-cq="${p.id}"></div>`}).join('')}`)}
 else if(a==='save'){const o=readForm(),{col,v}=modal;
  if((col==='products'||col==='ads')&&v.img)o.img=v.img;
  if(col==='promos'){o.kind=String(o.kind).startsWith('Amount')?'amt':'pct';o.all=!!document.querySelector('[data-pall]:checked');o.cats=[...document.querySelectorAll('[data-pcat]:checked')].map(e=>e.dataset.pcat);o.prods=[...document.querySelectorAll('[data-pprod]:checked')].map(e=>e.dataset.pprod);o.combos=[...document.querySelectorAll('[data-pcmb]:checked')].map(e=>e.dataset.pcmb);o.scope=o.all?'All':'Custom'}
  if(col==='combos')o.items=[...document.querySelectorAll('[data-ci]:checked')].map(e=>({id:e.dataset.ci,q:Math.max(1,num(document.querySelector(`[data-cq="${e.dataset.ci}"]`).value))}));
  await guard(async()=>{v.id?await db.collection(col).doc(v.id).set(o):await db.collection(col).add(o);modal=null})}
 else if(a==='del'){if(b.dataset.sure){await guard(async()=>{await db.collection(modal.col).doc(modal.v.id).delete();modal=null})}else{b.dataset.sure=1;b.textContent='Tap again to delete';return}}
 else if(a==='seed'){await guard(async()=>{const w=[['Reserva Malbec','Red',18.5,'Mendoza','Bold, plum and spice'],['Sauvignon Blanc','White',14,'Marlborough','Crisp and citrusy'],['Provence Rosé','Rosé',16,'Provence','Light and floral'],['Brut Cava','Sparkling',20,'Penedès','Dry with fine bubbles']];
   for(const x of w)await db.collection('products').add({name:x[0],category:x[1],price:x[2],origin:x[3],desc:x[4],inStock:true});
   await db.collection('promos').add({title:'Welcome offer',pct:10,scope:'All',active:true})})}
 render();
});
document.addEventListener('change',async ev=>{const e=ev.target;
 if(e.id==='imgf'&&e.files[0]){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,(+e.dataset.max||480)/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);modal.v.img=c.toDataURL('image/jpeg',.78);$('#imgprev').innerHTML=`<img src="${modal.v.img}" style="width:100%;max-height:160px;object-fit:contain;border-radius:10px">`};im.src=r.result};r.readAsDataURL(e.files[0]);return}
 if(e.dataset.a==='region'){regionF=e.value;render()}
 if(e.dataset.c==='fx'){await guard(async()=>{await db.collection('settings').doc('theme').set({...S.theme,fx:e.checked})})}
 if(e.dataset.a==='status'){await guard(async()=>{await db.collection('orders').doc(e.dataset.o).update({status:e.value})})}
});

/* SUPABASE LAYER: gives the app the same db API it used before, stored in Supabase */
function makeDb(sb){
 const T='docs';
 const listen=(name,fn)=>{fn();const ch=sb.channel('rt-'+name+'-'+Math.random().toString(36).slice(2)).on('postgres_changes',{event:'*',schema:'public',table:T,filter:'coll=eq.'+name},()=>fn()).subscribe();return()=>sb.removeChannel(ch)};
 const ref=(name,id)=>({id,
  async get(){const {data,error}=await sb.from(T).select('id,data').eq('coll',name).eq('id',id).maybeSingle();if(error)throw error;return {exists:!!data,id,data:()=>data?data.data:undefined}},
  async set(d){const {error}=await sb.from(T).upsert({coll:name,id,data:d,updated_at:new Date().toISOString()});if(error)throw error},
  async update(d){const s=await this.get();const {error}=await sb.from(T).update({data:{...(s.exists?s.data():{}),...d},updated_at:new Date().toISOString()}).eq('coll',name).eq('id',id);if(error)throw error},
  async delete(){const {error}=await sb.from(T).delete().eq('coll',name).eq('id',id);if(error)throw error},
  onSnapshot(cb,err){return listen(name,async()=>{try{cb(await this.get())}catch(e){err&&err(e)}})}
 });
 return {collection:name=>({
  doc:id=>ref(name,id),
  async add(d){const id=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2);const {error}=await sb.from(T).insert({coll:name,id,data:d});if(error)throw error;return ref(name,id)},
  onSnapshot(cb,err){return listen(name,async()=>{const {data,error}=await sb.from(T).select('id,data').eq('coll',name);if(error){err&&err(error);return}cb({docs:data.map(r=>({id:r.id,data:()=>r.data}))})})}
 })}}

function loginView(sb,err){
 $('#app').innerHTML=`<div class="login"><img src="${LOGO}" alt="" style="width:96px;height:96px;border-radius:50%"><h2>D&amp;K Beverages Admin</h2><p class="mute">Staff only. Sign in to manage the shop.</p>${err?`<div class="banner" style="background:#b3262e">${esc(err)}</div>`:''}<label>Email</label><input id="le" type="email" autocomplete="username"><label>Password</label><input id="lp" type="password" autocomplete="current-password"><button class="btn" id="lb">Sign in</button></div>`;
 const go=async()=>{const {error}=await sb.auth.signInWithPassword({email:$('#le').value.trim(),password:$('#lp').value});if(error){loginView(sb,'Wrong email or password.');return}location.reload()};
 $('#lb').onclick=go;$('#lp').onkeydown=e=>{if(e.key==='Enter')go()}}

/* BOOT */
(async()=>{
 if(APP_MODE==='admin')aged=true;
 render();
 try{
  if(!window.supabase||!window.SUPABASE_URL||/YOUR-/.test(window.SUPABASE_URL)){window.CONNECT_ERR='This shop is not connected yet. Add your Supabase details in config.js.';render();return}
  const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);window._sb=sb;
  let {data:{session}}=await sb.auth.getSession();
  if(APP_MODE==='admin'){
   if(!session||session.user.is_anonymous){loginView(sb);return}
   const {data:adm}=await sb.from('admins').select('user_id').eq('user_id',session.user.id).maybeSingle();
   if(!adm){await sb.auth.signOut();loginView(sb,'This account is not an administrator.');return}
   isAdmin=true;
  }else if(!session){const r=await sb.auth.signInAnonymously();session=r.data&&r.data.session}
  uid=session?session.user.id:'guest';
  db=makeDb(sb);
  ['products','combos','promos','ads','categories'].forEach(c=>db.collection(c).onSnapshot(s=>{S[c]=s.docs.map(d=>({id:d.id,...d.data()}));if(c==='categories')syncCats();render()},()=>{}));
  db.collection('settings').doc('contact').onSnapshot(s=>{S.contact=s.exists?s.data():{};render()},()=>{});
  db.collection('settings').doc('theme').onSnapshot(s=>{S.theme=s.exists?s.data():{};render()},()=>{});
  db.collection('orders').onSnapshot(s=>{S.orders=s.docs.map(d=>({id:d.id,...d.data()}));S.mine=S.orders.filter(o=>o.uid===uid).sort((a,b)=>a.ts-b.ts);render()},()=>{});
  if(uid!=='guest')db.collection('profiles').doc(uid).onSnapshot(s=>{if(s.exists)prof={...prof,...s.data()};render()},()=>{});
  tab=isAdmin?'orders':'shop';render();
 }catch(e){window.CONNECT_ERR='Could not connect to the shop. Please try again.';render()}
})();
