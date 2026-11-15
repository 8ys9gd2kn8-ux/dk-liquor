/* D&K poster maker: QR code generator (byte mode, versions 1-40, error-correction L/M/Q/H).
 * Runs entirely in the browser: no data leaves the admin page. Algorithm follows the QR Code Model 2 standard (ISO/IEC 18004). */
(function(){
'use strict';
const ECC=[[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
 [-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],
 [-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
 [-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]];
const BLK=[[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
 [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],
 [-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],
 [-1,1,1,2,4,4,6,5,8,8,11,11,16,16,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81,85,89]];
const LV={L:0,M:1,Q:2,H:3},FMT={L:1,M:0,Q:3,H:2};
const bit=(x,i)=>((x>>>i)&1)!==0;
function rawModules(v){let r=(16*v+128)*v+64;if(v>=2){const n=Math.floor(v/7)+2;r-=(25*n-10)*n-55;if(v>=7)r-=36}return r}
function dataCodewords(v,l){return Math.floor(rawModules(v)/8)-ECC[l][v]*BLK[l][v]}
function gfMul(x,y){let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z&255}
function rsGen(d){const r=new Array(d).fill(0);r[d-1]=1;let root=1;for(let i=0;i<d;i++){for(let j=0;j<r.length;j++){r[j]=gfMul(r[j],root);if(j+1<r.length)r[j]^=r[j+1]}root=gfMul(root,2)}return r}
function rsRem(data,gen){const r=gen.map(()=>0);for(const b of data){const f=b^r.shift();r.push(0);gen.forEach((c,i)=>r[i]^=gfMul(c,f))}return r}
function utf8(s){return Array.from(new TextEncoder().encode(s))}
function encode(text,level){
 level=level||'M';const l=LV[level],bytes=utf8(text);let v=1,usedBits;
 for(;;v++){if(v>40)throw new Error('Text too long for a QR code');const cap=dataCodewords(v,l)*8,cc=v<10?8:16;usedBits=4+cc+bytes.length*8;if(usedBits<=cap&&bytes.length<(1<<cc))break}
 const bits=[];const put=(val,n)=>{for(let i=n-1;i>=0;i--)bits.push((val>>>i)&1)};
 put(4,4);put(bytes.length,v<10?8:16);bytes.forEach(b=>put(b,8));
 const cap=dataCodewords(v,l)*8;put(0,Math.min(4,cap-bits.length));put(0,(8-bits.length%8)%8);
 for(let pad=0xEC;bits.length<cap;pad^=0xEC^0x11)put(pad,8);
 const data=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|bits[i+j];data.push(b)}
 /* error correction + interleave */
 const nb=BLK[l][v],eccLen=ECC[l][v],raw=Math.floor(rawModules(v)/8),nShort=nb-raw%nb,shortLen=Math.floor(raw/nb),gen=rsGen(eccLen),blocks=[];
 for(let i=0,k=0;i<nb;i++){const dl=shortLen-eccLen+(i<nShort?0:1),d=data.slice(k,k+dl);k+=dl;const e=rsRem(d,gen);if(i<nShort)d.push(0);blocks.push(d.concat(e))}
 const out=[];for(let i=0;i<blocks[0].length;i++)blocks.forEach((b,j)=>{if(i!==shortLen-eccLen||j>=nShort)out.push(b[i])});
 /* matrix */
 const size=v*4+17,M=Array.from({length:size},()=>new Array(size).fill(false)),F=Array.from({length:size},()=>new Array(size).fill(false));
 const setF=(x,y,d)=>{M[y][x]=d;F[y][x]=true};
 for(let i=0;i<size;i++){setF(6,i,i%2===0);setF(i,6,i%2===0)}
 const finder=(cx,cy)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy)),x=cx+dx,y=cy+dy;if(x>=0&&x<size&&y>=0&&y<size)setF(x,y,d!==2&&d!==4)}};
 finder(3,3);finder(size-4,3);finder(3,size-4);
 const n=v===1?0:Math.floor(v/7)+2,step=v===32?26:v===1?0:Math.ceil((v*4+4)/(n*2-2))*2,pos=[];if(v>1){pos.push(6);for(let p=size-7;pos.length<n;p-=step)pos.splice(1,0,p)}
 for(let i=0;i<pos.length;i++)for(let j=0;j<pos.length;j++){if((i===0&&j===0)||(i===0&&j===pos.length-1)||(i===pos.length-1&&j===0))continue;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)setF(pos[i]+dx,pos[j]+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}
 const drawFmt=mask=>{const d=FMT[level]<<3|mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=(d<<10|r)^0x5412;
  for(let i=0;i<=5;i++)setF(8,i,bit(b,i));setF(8,7,bit(b,6));setF(8,8,bit(b,7));setF(7,8,bit(b,8));for(let i=9;i<15;i++)setF(14-i,8,bit(b,i));
  for(let i=0;i<8;i++)setF(size-1-i,8,bit(b,i));for(let i=8;i<15;i++)setF(8,size-15+i,bit(b,i));setF(8,size-8,true)};
 drawFmt(0);
 if(v>=7){let r=v;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=v<<12|r;for(let i=0;i<18;i++){const a=size-11+i%3,c=Math.floor(i/3);setF(a,c,bit(b,i));setF(c,a,bit(b,i))}}
 /* place data */
 let k=0;for(let right=size-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<size;vert++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?size-1-vert:vert;if(!F[y][x]&&k<out.length*8){M[y][x]=bit(out[k>>>3],7-(k&7));k++}}}
 const MASK=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
 const applyMask=m=>{for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!F[y][x]&&MASK[m](x,y))M[y][x]=!M[y][x]};
 const penalty=()=>{let p=0;
  for(let pass=0;pass<2;pass++){for(let a=0;a<size;a++){let run=1,prev=null;const hist=[];for(let b=0;b<size;b++){const c=pass?M[b][a]:M[a][b];if(c===prev){run++;if(run===5)p+=3;else if(run>5)p++}else{run=1;prev=c}hist.push(c)}
    for(let b=0;b+10<size;b++){const s=hist.slice(b,b+11).map(x=>x?1:0).join('');if(s==='10111010000'||s==='00001011101')p+=40}}}
  for(let y=0;y<size-1;y++)for(let x=0;x<size-1;x++){const c=M[y][x];if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1])p+=3}
  let dark=0;M.forEach(r=>r.forEach(c=>{if(c)dark++}));const tot=size*size;p+=Math.floor(Math.abs(dark*20-tot*10)/tot)*10;return p};
 let best=0,bp=Infinity;for(let m=0;m<8;m++){applyMask(m);drawFmt(m);const pn=penalty();if(pn<bp){bp=pn;best=m}applyMask(m)}
 applyMask(best);drawFmt(best);
 return {size,version:v,modules:M}}
/* draw onto a canvas context at (x,y) with the given pixel size, plus a quiet zone of 'quiet' modules */
function draw(ctx,text,x,y,px,opts){opts=opts||{};const q=encode(text,opts.level||'M'),quiet=opts.quiet==null?2:opts.quiet,cells=q.size+quiet*2,cs=px/cells;
 if(opts.bg){ctx.fillStyle=opts.bg;ctx.fillRect(x,y,px,px)}
 ctx.fillStyle=opts.fg||'#000';for(let r=0;r<q.size;r++)for(let c=0;c<q.size;c++)if(q.modules[r][c])ctx.fillRect(Math.floor(x+(c+quiet)*cs),Math.floor(y+(r+quiet)*cs),Math.ceil(cs),Math.ceil(cs));
 return q}
const api={encode,draw};if(typeof module!=='undefined')module.exports=api;else window.DKQR=api;
})();
