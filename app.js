const STORAGE_KEY='almoallem-price-list-v2';
const defaults={shopName:'المعلم',subtitle:'قائمة أسعار السجائر',phone:'01XXXXXXXXX',note:'الأسعار قابلة للتغيير حسب تحديثات السوق',products:[
  {id:'1',name:'بوكس',category:'محلي',price:480,details:''},
  {id:'2',name:'كليوباترا',category:'محلي',price:480,details:''},
  {id:'3',name:'بوكس راوند',category:'محلي',price:'-',details:''},
  {id:'4',name:'سوبر',category:'محلي',price:510,details:''},
  {id:'5',name:'ال ام أحمر',category:'محلي',price:815,details:''},
  {id:'6',name:'ال ام أزرق',category:'محلي',price:815,details:''},
  {id:'7',name:'ال ام أبيض',category:'محلي',price:810,details:''},
  {id:'8',name:'ال ام توت',category:'محلي',price:810,details:''},
  {id:'9',name:'مالبورو أحمر',category:'محلي',price:1015,details:''},
  {id:'10',name:'مالبورو أبيض',category:'محلي',price:1015,details:''},
  {id:'11',name:'مالبورو كرافتد',category:'محلي',price:800,details:''},
  {id:'12',name:'ميريت',category:'محلي',price:1115,details:''},
  {id:'13',name:'ونيستون أحمر',category:'محلي',price:705,details:''},
  {id:'14',name:'ونيستون أزرق',category:'محلي',price:705,details:''},
  {id:'15',name:'ونيستون أبيض',category:'محلي',price:705,details:''},
  {id:'16',name:'تارجت أحمر',category:'محلي',price:470,details:''},
  {id:'17',name:'تارجت أزرق',category:'محلي',price:470,details:''},
  {id:'18',name:'جولد كوست',category:'محلي',price:480,details:''},
  {id:'19',name:'كابتن بلاك أحمر قديم',category:'مستورد',price:420,details:''},
  {id:'20',name:'كابتن بلاك أحمر جديد',category:'مستورد',price:'-',details:''},
  {id:'21',name:'كابتن بلاك أزرق جديد',category:'مستورد',price:320,details:''},
  {id:'22',name:'كابتن بلاك أزرق قديم',category:'مستورد',price:470,details:''},
  {id:'23',name:'اتش بي',category:'مستورد',price:290,details:''},
  {id:'24',name:'اي بي',category:'مستورد',price:325,details:''},
  {id:'25',name:'اي بي سوبر',category:'مستورد',price:340,details:''},
  {id:'26',name:'اتش بي سوبر',category:'مستورد',price:'-',details:''},
  {id:'27',name:'ار جي',category:'مستورد',price:240,details:''},
  {id:'28',name:'شملان أحمر',category:'مستورد',price:420,details:''},
  {id:'29',name:'شملان أزرق',category:'مستورد',price:'-',details:''},
  {id:'30',name:'كاريلا أحمر',category:'مستورد',price:'-',details:''},
  {id:'31',name:'كاريلا أزرق',category:'مستورد',price:'-',details:''}
]};
let state=load();
const $=s=>document.querySelector(s); const list=$('#productList'),canvas=$('#priceCanvas'),ctx=canvas.getContext('2d');
const fields=['shopName','subtitle','phone','note'];

function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}catch{return structuredClone(defaults)}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderCanvas();sync.dirty=true;saveSyncMeta();scheduleSync()}
function applyFields(){fields.forEach(id=>{$('#'+id).value=state[id]||''})}

// Shared price list: prices.json in the GitHub repo is the single source of truth.
// Anyone can read it; saving needs a fine-grained token (Contents read/write on this repo only) kept in this browser.
const REPO='georgehanna57/elmalam-price',DATA_PATH='prices.json',BRANCH='main',TOKEN_KEY='elmalam-gh-token',SYNC_KEY='elmalam-sync-meta';
const API_URL=`https://api.github.com/repos/${REPO}/contents/${DATA_PATH}`;
function readJSON(key){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
let sync={sha:null,dirty:false,...readJSON(SYNC_KEY)},syncTimer=null,syncing=false;
function saveSyncMeta(){localStorage.setItem(SYNC_KEY,JSON.stringify({sha:sync.sha,dirty:sync.dirty}))}
function getToken(){return localStorage.getItem(TOKEN_KEY)||''}
function ghHeaders(token=getToken()){const h={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};if(token)h.Authorization=`Bearer ${token}`;return h}
function encodeData(obj){const bytes=new TextEncoder().encode(JSON.stringify(obj,null,2)+'\n');let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin)}
function decodeData(b64){const bin=atob(b64.replace(/\s/g,''));return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0))))}
function payload(){const {shopName,subtitle,phone,note,products}=state;return {shopName,subtitle,phone,note,products}}
const SYNC_LABELS={synced:'متزامن مع GitHub',pending:'تعديلات لسه ماترفعتش',syncing:'جاري الرفع…',loading:'جاري تحميل الأسعار…',local:'محفوظ على الجهاز بس — اربط GitHub',offline:'مفيش نت — هيترفع لما يرجع',error:'فشل الرفع — دوس هنا'};
function setSyncState(kind){const el=$('#saveState');el.dataset.state=kind;el.innerHTML=`<span></span> ${SYNC_LABELS[kind]}`}
function scheduleSync(delay=2500){clearTimeout(syncTimer);if(!sync.dirty)return;if(!getToken()){setSyncState('local');return}setSyncState('pending');syncTimer=setTimeout(pushRemote,delay)}
function applyRemote(data,sha){if(!data||!Array.isArray(data.products))throw new Error('ملف الأسعار مش سليم');state={...structuredClone(defaults),...data};sync.sha=sha;sync.dirty=false;localStorage.setItem(STORAGE_KEY,JSON.stringify(state));saveSyncMeta();applyFields();renderList()}
async function fetchRemote(){const res=await fetch(`${API_URL}?ref=${BRANCH}`,{headers:ghHeaders(),cache:'no-store'});if(res.status===404)return null;if(!res.ok)throw Object.assign(new Error('fetch failed'),{status:res.status});const json=await res.json();return {data:decodeData(json.content),sha:json.sha}}
async function pullRemote(){if(syncing)return;if(!navigator.onLine){setSyncState(sync.dirty?'offline':'synced');return}try{const remote=await fetchRemote();
    // No shared file yet: this device's list becomes the first version once GitHub is linked
    if(!remote){sync.sha=null;if(getToken())sync.dirty=true;saveSyncMeta();if(sync.dirty)scheduleSync(0);else setSyncState('local');return}
    // Local edits not uploaded yet: keep them; pushRemote detects if the remote moved on meanwhile
    if(sync.dirty){scheduleSync(0);return}
    if(remote.sha!==sync.sha){applyRemote(remote.data,remote.sha);toast('تم تحميل آخر أسعار')}setSyncState('synced')}
  catch(err){
    // API rate limit or outage: fall back to the copy GitHub Pages serves (read-only, may lag a minute)
    if(!sync.dirty){try{const res=await fetch(`./${DATA_PATH}?t=${Date.now()}`,{cache:'no-store'});if(res.ok)applyRemote(await res.json(),sync.sha)}catch{}}
    setSyncState(sync.dirty?'pending':'synced')}}
async function pushRemote(){if(syncing){scheduleSync();return}if(!sync.dirty)return;const token=getToken();if(!token){setSyncState('local');return}if(!navigator.onLine){setSyncState('offline');return}
  syncing=true;setSyncState('syncing');
  try{const body={message:`تحديث الأسعار — ${new Date().toLocaleString('ar-EG')}`,content:encodeData(payload()),branch:BRANCH};if(sync.sha)body.sha=sync.sha;
    const res=await fetch(API_URL,{method:'PUT',headers:{...ghHeaders(token),'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(res.ok){const json=await res.json();sync.sha=json.content.sha;sync.dirty=false;saveSyncMeta();setSyncState('synced');return}
    if(res.status===401||res.status===403){setSyncState('error');toast('التوكن مش شغال أو ملوش صلاحية — اربطه تاني');openTokenDialog();return}
    if(res.status===409||res.status===422){await resolveConflict();return}
    throw new Error(`GitHub ${res.status}`)}
  catch(err){setSyncState(navigator.onLine?'error':'offline')}
  finally{syncing=false}}
// Another device saved since this one last synced: let the user pick which version wins
async function resolveConflict(){const remote=await fetchRemote();if(!remote){sync.sha=null;syncing=false;return pushRemote()}
  if(confirm('في أسعار اتعدلت من جهاز تاني بعد آخر مزامنة هنا.\n\nموافق = ارفع تعديلاتي أنا فوقها\nإلغاء = سيب تعديلاتي وحمّل النسخة الأحدث')){sync.sha=remote.sha;saveSyncMeta();syncing=false;return pushRemote()}
  applyRemote(remote.data,remote.sha);setSyncState('synced');toast('تم تحميل النسخة الأحدث')}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function money(v){return String(v).trim()==='-'?'—':new Intl.NumberFormat('ar-EG',{maximumFractionDigits:2}).format(Number(v)||0)}
function priceLabel(v){const value=money(v);return value==='—'?'—':`${value} ج.م`}
function initFields(){applyFields();fields.forEach(id=>{const el=$('#'+id);el.addEventListener('input',()=>{state[id]=el.value;save()})})}
function renderList(){list.innerHTML=state.products.map((p,i)=>`<article class="product-row" data-id="${p.id}"><div class="order-buttons"><button data-act="up" ${i===0?'disabled':''} aria-label="تحريك لأعلى">▲</button><button data-act="down" ${i===state.products.length-1?'disabled':''} aria-label="تحريك لأسفل">▼</button></div><div class="product-info"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml([p.category,p.details].filter(Boolean).join(' · ')||'بدون وصف')}</small></div><div class="product-price"><input class="price-input" value="${escapeHtml(p.price)}" inputmode="decimal" enterkeyhint="next" aria-label="سعر ${escapeHtml(p.name)}"><span>ج.م</span></div><div class="row-actions"><button class="icon-btn" data-act="edit" aria-label="تعديل">✎</button><button class="icon-btn delete" data-act="delete" aria-label="حذف">⌫</button></div></article>`).join('');$('#emptyState').hidden=state.products.length>0;renderBulkCategories();renderCanvas()}
function openDialog(product){$('#productId').value=product?.id||'';$('#productName').value=product?.name||'';$('#productCategory').value=product?.category||'';$('#productPrice').value=product?.price??'';$('#productDetails').value=product?.details||'';$('#dialogEyebrow').textContent=product?'تعديل الصنف':'صنف جديد';$('#dialogTitle').textContent=product?'تعديل البيانات':'إضافة صنف';$('#productDialog').showModal();setTimeout(()=>$('#productName').focus(),50)}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2200)}

list.addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn)return;const row=btn.closest('.product-row');const index=state.products.findIndex(p=>p.id===row.dataset.id);const act=btn.dataset.act;if(act==='edit')openDialog(state.products[index]);if(act==='delete'){state.products.splice(index,1);save();renderList();toast('تم حذف الصنف')}if(act==='up'&&index>0){[state.products[index-1],state.products[index]]=[state.products[index],state.products[index-1]];save();renderList()}if(act==='down'&&index<state.products.length-1){[state.products[index+1],state.products[index]]=[state.products[index],state.products[index+1]];save();renderList()}});
// Inline price editing: saves as you type, Enter jumps to the next product's price
function parsePrice(raw){const v=String(raw).trim().replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace('٫','.');if(v==='-')return '-';if(v==='')return null;const n=Number(v);return Number.isFinite(n)&&n>=0?n:null}
list.addEventListener('input',e=>{const input=e.target.closest('.price-input');if(!input)return;const product=state.products.find(p=>p.id===input.closest('.product-row').dataset.id);const price=parsePrice(input.value);input.classList.toggle('invalid',price===null);if(price===null)return;product.price=price;input.classList.add('changed');save()});
list.addEventListener('focusin',e=>{if(e.target.matches('.price-input'))e.target.select()});
list.addEventListener('focusout',e=>{const input=e.target.closest('.price-input');if(!input)return;const product=state.products.find(p=>p.id===input.closest('.product-row').dataset.id);if(product){input.value=product.price;input.classList.remove('invalid')}});
list.addEventListener('keydown',e=>{if(e.key!=='Enter'||!e.target.matches('.price-input'))return;e.preventDefault();const inputs=[...list.querySelectorAll('.price-input')];const next=inputs[inputs.indexOf(e.target)+1];if(next)next.focus();else e.target.blur()});

// Bulk adjust: raise/lower all prices (or one category) by a fixed amount or percent, with one-step undo
let bulkUndo=null;
function renderBulkCategories(){const sel=$('#bulkCategory');const current=sel.value;const cats=[...new Set(state.products.map(p=>p.category).filter(Boolean))];sel.innerHTML=`<option value="">كل الأصناف</option>`+cats.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');sel.value=cats.includes(current)?current:''}
document.querySelectorAll('[data-bulk]').forEach(btn=>btn.addEventListener('click',()=>{const amount=parsePrice($('#bulkAmount').value);if(amount===null||amount==='-'||amount===0){toast('اكتب المبلغ الأول');$('#bulkAmount').focus();return}const sign=Number(btn.dataset.bulk);const cat=$('#bulkCategory').value;const pct=$('#bulkUnit').value==='pct';const targets=state.products.filter(p=>p.price!=='-'&&(!cat||p.category===cat));if(!targets.length){toast('مفيش أصناف بأسعار في الاختيار ده');return}bulkUndo=state.products.map(p=>({id:p.id,price:p.price}));targets.forEach(p=>{const delta=pct?p.price*amount/100:amount;p.price=Math.max(0,Math.round(p.price+sign*delta))});save();renderList();$('#undoBulkBtn').hidden=false;toast(`تم ${sign>0?'زيادة':'تخفيض'} ${targets.length} صنف`)}));
$('#undoBulkBtn').addEventListener('click',()=>{if(!bulkUndo)return;bulkUndo.forEach(({id,price})=>{const p=state.products.find(x=>x.id===id);if(p)p.price=price});bulkUndo=null;$('#undoBulkBtn').hidden=true;save();renderList();toast('تم التراجع عن آخر تعديل جماعي')});

$('#addBtn').addEventListener('click',()=>openDialog());document.querySelectorAll('.close-dialog').forEach(b=>b.addEventListener('click',()=>$('#productDialog').close()));
$('#productForm').addEventListener('submit',e=>{e.preventDefault();const id=$('#productId').value;const rawPrice=$('#productPrice').value.trim();const price=rawPrice==='-'?'-':Number(rawPrice);const item={id:id||String(Date.now()),name:$('#productName').value.trim(),category:$('#productCategory').value.trim(),price,details:$('#productDetails').value.trim()};if(!item.name||(price!=='-'&&!Number.isFinite(price)))return;const i=state.products.findIndex(p=>p.id===id);if(i>=0)state.products[i]=item;else state.products.push(item);save();renderList();$('#productDialog').close();toast(id?'تم تحديث الصنف':'تمت إضافة الصنف')});
$('#resetBtn').addEventListener('click',()=>{if(!confirm('هل تريد استرجاع البيانات التجريبية؟'))return;state=structuredClone(defaults);applyFields();save();renderList();toast('تم استرجاع المثال')});

// GitHub link: the token never leaves this browser except in requests to api.github.com
function openTokenDialog(){$('#tokenInput').value='';$('#unlinkBtn').hidden=!getToken();$('#tokenDialog').showModal()}
$('#saveState').addEventListener('click',()=>{if(!getToken())return openTokenDialog();if(sync.dirty)return pushRemote();pullRemote()});
$('#tokenForm').addEventListener('submit',async e=>{e.preventDefault();const token=$('#tokenInput').value.trim();if(!token)return;const btn=$('#tokenSaveBtn');btn.disabled=true;
  try{const res=await fetch(`https://api.github.com/repos/${REPO}`,{headers:ghHeaders(token),cache:'no-store'});const repo=res.ok?await res.json():null;
    if(!repo?.permissions?.push){toast('التوكن ده مايقدرش يعدّل الـ repo — راجع الصلاحيات');return}
    localStorage.setItem(TOKEN_KEY,token);$('#tokenDialog').close();toast('تم الربط مع GitHub');await pullRemote();scheduleSync(0)}
  catch{toast('تعذر الاتصال بـ GitHub')}finally{btn.disabled=false}});
$('#unlinkBtn').addEventListener('click',()=>{localStorage.removeItem(TOKEN_KEY);$('#tokenDialog').close();setSyncState(sync.dirty?'local':'synced');toast('تم فصل الربط من الجهاز ده')});
document.querySelectorAll('.close-token').forEach(b=>b.addEventListener('click',()=>$('#tokenDialog').close()));
// Pick up edits made on other devices when coming back to the tab, and retry uploads when the connection returns
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pullRemote()});
window.addEventListener('online',()=>sync.dirty?scheduleSync(0):pullRemote());

function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function fitText(text,maxWidth,startSize,minSize=24,weight=700){let size=startSize;do{ctx.font=`${weight} ${size}px Tahoma, Arial`;if(ctx.measureText(text).width<=maxWidth)return size;size-=2}while(size>minSize);return minSize}
function noShadow(){ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0}
function hardShadow(color,offset){ctx.shadowColor=color;ctx.shadowBlur=0;ctx.shadowOffsetX=-offset;ctx.shadowOffsetY=offset}
function drawBurst(cx,cy,outer,inner,points,fill,rot){ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);ctx.beginPath();for(let i=0;i<points*2;i++){const r=i%2?inner:outer,a=i*Math.PI/points;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.restore()}
function drawPack(x,y,rot,scale,color){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(scale,scale);[-26,-4,18].forEach((cx,i)=>{const top=-98+i%2*10;ctx.fillStyle='#f4f1ea';ctx.fillRect(cx,top,18,40);ctx.fillStyle='#d98a2b';ctx.fillRect(cx,top,18,15);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(cx+13,top,5,40)});
  ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=16;ctx.shadowOffsetY=8;roundRect(-45,-65,90,130,7,'#f7f3ea');noShadow();ctx.save();ctx.beginPath();ctx.roundRect(-45,-65,90,130,7);ctx.clip();ctx.fillStyle=color;ctx.fillRect(-45,-65,90,52);ctx.beginPath();ctx.moveTo(-45,18);ctx.lineTo(0,42);ctx.lineTo(45,18);ctx.lineTo(45,36);ctx.lineTo(0,60);ctx.lineTo(-45,36);ctx.closePath();ctx.fill();ctx.fillStyle='#ffd400';ctx.fillRect(-45,-13,90,5);ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(-45,-65,14,130);ctx.restore();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-45,-30);ctx.lineTo(45,-30);ctx.stroke();ctx.restore()}
function renderCanvas(){const W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#e3001b');g.addColorStop(1,'#6d0008');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.save();ctx.globalAlpha=.12;ctx.fillStyle='#000';for(let x=-H;x<W;x+=70){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+35,0);ctx.lineTo(x+35+H,H);ctx.lineTo(x+H,H);ctx.fill()}ctx.restore();ctx.fillStyle='#ffd400';ctx.fillRect(0,0,W,14);ctx.fillRect(0,H-14,W,14);
  drawPack(905,170,.22,1.05,'#111');drawPack(1010,230,-.2,.75,'#2456d6');drawPack(300,215,-.28,.72,'#ffd400');drawBurst(140,140,108,84,18,'#ffd400',.2);ctx.save();ctx.translate(140,140);ctx.rotate(-.25);ctx.textAlign='center';ctx.direction='rtl';ctx.fillStyle='#b00012';ctx.font='900 30px Tahoma, Arial';ctx.fillText('أسعار',0,-4);ctx.fillText('النهارده',0,32);ctx.restore();
  ctx.textAlign='center';ctx.direction='rtl';let size=fitText(state.shopName||'المعلم',560,116,54,900);ctx.font=`900 ${size}px Tahoma, Arial`;hardShadow('#3a0004',8);ctx.fillStyle='#ffd400';ctx.fillText(state.shopName||'المعلم',W/2,200);noShadow();ctx.font='800 32px Tahoma, Arial';ctx.fillStyle='#fff';ctx.fillText(state.subtitle||'قائمة الأسعار',W/2,252);const today=new Intl.DateTimeFormat('ar-EG',{day:'numeric',month:'long',year:'numeric'}).format(new Date());ctx.font='700 18px Tahoma, Arial';ctx.fillStyle='#ffc9cf';ctx.fillText(`تحديث: ${today}`,W/2,282);ctx.fillStyle='#ffd400';ctx.fillRect(130,294,W-260,3);
  const local=state.products.filter(p=>(p.category||'محلي')!=='مستورد');const imported=state.products.filter(p=>p.category==='مستورد');const columns=[{title:'المحلي',items:local,x:560},{title:'المستورد',items:imported,x:50}];const colW=470,rowH=47,startY=350;columns.forEach(column=>{hardShadow('#3a0004',5);roundRect(column.x,startY-42,colW,36,6,'#ffd400');noShadow();ctx.textAlign='center';ctx.font='900 25px Tahoma, Arial';ctx.fillStyle='#7a000c';ctx.fillText(`★ ${column.title} ★`,column.x+colW/2,startY-15);column.items.forEach((p,i)=>{const y=startY+i*rowH;roundRect(column.x,y,colW,rowH-6,6,i%2?'rgba(0,0,0,.22)':'rgba(0,0,0,.34)');const label=priceLabel(p.price),empty=label==='—';ctx.font='900 28px Tahoma, Arial';const pillW=ctx.measureText(label).width+28;roundRect(column.x+6,y+4,pillW,rowH-14,(rowH-14)/2,empty?'rgba(255,255,255,.25)':'#ffd400');ctx.textAlign='center';ctx.fillStyle=empty?'#fff':'#6d0008';ctx.fillText(label,column.x+6+pillW/2,y+31);ctx.textAlign='right';ctx.fillStyle='#fff';const nameSize=fitText(p.name,colW-pillW-40,29,19,800);ctx.font=`800 ${nameSize}px Tahoma, Arial`;ctx.fillText(p.name,column.x+colW-16,y+31)})});
  if(!state.products.length){ctx.textAlign='center';ctx.font='700 30px Tahoma, Arial';ctx.fillStyle='#ffd0d5';ctx.fillText('أضف الأصناف لتظهر هنا',W/2,700)}
  drawPack(105,1275,-.3,.8,'#2456d6');drawPack(215,1290,.18,.68,'#111');drawPack(975,1275,.3,.8,'#111');drawPack(865,1292,-.16,.68,'#ffd400');
  const footerY=1210;ctx.fillStyle='#ffd400';ctx.fillRect(300,footerY,W-600,3);ctx.textAlign='center';ctx.font='900 32px Tahoma, Arial';hardShadow('#3a0004',4);ctx.fillStyle='#ffd400';ctx.fillText(state.phone||'',W/2,1256);noShadow();ctx.font='400 19px Tahoma, Arial';ctx.fillStyle='#ffd0d5';ctx.fillText(state.note||'',W/2,1291);ctx.font='800 17px Tahoma, Arial';ctx.fillStyle='#fff';ctx.fillText('المعلم • الجودة والثقة',W/2,1323)}
function canvasBlob(){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('تعذر تجهيز الصورة')),'image/png',1))}
function downloadFile(file){const url=URL.createObjectURL(file);const a=document.createElement('a');a.download=file.name;a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('#downloadBtn').addEventListener('click',async()=>{renderCanvas();const button=$('#downloadBtn');const oldText=button.innerHTML;button.disabled=true;button.innerHTML='<span>…</span> جاري تجهيز الصورة';try{const blob=await canvasBlob();const name=`${(state.shopName||'المعلم').replace(/\s+/g,'-')}-قائمة-الأسعار.png`;const file=new File([blob],name,{type:'image/png'});const shareData={files:[file],title:`قائمة أسعار ${state.shopName||'المعلم'}`,text:`قائمة أسعار ${state.shopName||'المعلم'}`};if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share(shareData);toast('تم فتح المشاركة — اختر واتساب بيزنس')}else{downloadFile(file);window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text)}`,'_blank','noopener');toast('تم تنزيل الصورة وفتح واتساب')}}catch(err){if(err?.name!=='AbortError')toast('تعذر فتح المشاركة — جرّب مرة أخرى')}finally{button.disabled=false;button.innerHTML=oldText}});

// MicroPOS imports products from an Excel 97-2003 (.xls) file; it reads it from MicroPOS/MPOSMPO/mpo.xls
const POS_COLUMNS=['كود الصنف','اسم الصنف','السعر','الفئة','الوصف'];
$('#exportPosBtn').addEventListener('click',()=>{if(!window.XLSX){toast('تعذر تحميل مكتبة الإكسل — تأكد من الإنترنت');return}const priced=state.products.filter(p=>String(p.price).trim()!=='-');if(!priced.length){toast('لا توجد أصناف بأسعار للتصدير');return}const rows=priced.map(p=>[p.id,p.name,Number(p.price),p.category||'',p.details||'']);const sheet=XLSX.utils.aoa_to_sheet([POS_COLUMNS,...rows]);sheet['!cols']=[{wch:14},{wch:28},{wch:10},{wch:12},{wch:20}];const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,sheet,'products');XLSX.writeFile(book,'mpo.xls',{bookType:'biff8'});const skipped=state.products.length-priced.length;toast(`تم تصدير ${priced.length} صنف${skipped?` — تم تخطي ${skipped} بدون سعر`:''}`)});

function registerWebMCP(){const mc=document.modelContext;if(!mc?.registerTool)return;const safe=fn=>input=>{try{return fn(input||{})}catch(err){throw new Error(err.message)}};mc.registerTool({name:'add_price_item',title:'إضافة صنف',description:'يضيف صنفًا جديدًا إلى قائمة الأسعار الظاهرة.',inputSchema:{type:'object',properties:{name:{type:'string'},price:{type:'number'},category:{type:'string'},details:{type:'string'}},required:['name','price'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:safe(({name,price,category='',details=''})=>{if(!String(name).trim()||!Number.isFinite(price)||price<0)throw new Error('بيانات الصنف غير صحيحة');const item={id:String(Date.now()),name:String(name).trim(),price,category:String(category),details:String(details)};state.products.push(item);save();renderList();return {added:true,id:item.id,count:state.products.length}})});mc.registerTool({name:'update_price_item',title:'تعديل سعر صنف',description:'يعدّل بيانات صنف موجود بالاسم.',inputSchema:{type:'object',properties:{currentName:{type:'string'},name:{type:'string'},price:{type:'number'},category:{type:'string'},details:{type:'string'}},required:['currentName'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:safe(input=>{const item=state.products.find(p=>p.name===input.currentName);if(!item)throw new Error('الصنف غير موجود');['name','price','category','details'].forEach(k=>{if(input[k]!==undefined)item[k]=input[k]});save();renderList();return {updated:true,item}})})}
initFields();renderList();setSyncState('loading');pullRemote();registerWebMCP();
