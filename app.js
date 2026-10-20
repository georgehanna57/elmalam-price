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
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderCanvas(); const el=$('#saveState');el.innerHTML='<span></span> محفوظ تلقائيًا'}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function money(v){return String(v).trim()==='-'?'—':new Intl.NumberFormat('ar-EG',{maximumFractionDigits:2}).format(Number(v)||0)}
function priceLabel(v){const value=money(v);return value==='—'?'—':`${value} ج.م`}
function initFields(){fields.forEach(id=>{const el=$('#'+id);el.value=state[id]||'';el.addEventListener('input',()=>{state[id]=el.value;save()})})}
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
$('#resetBtn').addEventListener('click',()=>{if(!confirm('هل تريد استرجاع البيانات التجريبية؟'))return;state=structuredClone(defaults);initFields();save();renderList();toast('تم استرجاع المثال')});

function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function fitText(text,maxWidth,startSize,minSize=24,weight=700){let size=startSize;do{ctx.font=`${weight} ${size}px Tahoma, Arial`;if(ctx.measureText(text).width<=maxWidth)return size;size-=2}while(size>minSize);return minSize}
function drawCrown(cx,y){ctx.save();ctx.translate(cx,y);ctx.beginPath();ctx.moveTo(-45,30);ctx.lineTo(-35,-20);ctx.lineTo(0,12);ctx.lineTo(35,-20);ctx.lineTo(45,30);ctx.closePath();ctx.fillStyle='#d6a83a';ctx.fill();ctx.strokeStyle='#f7df8a';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#f7df8a';[-35,35].forEach(x=>{ctx.beginPath();ctx.arc(x,-20,5,0,Math.PI*2);ctx.fill()});ctx.beginPath();ctx.arc(0,12,5,0,Math.PI*2);ctx.fill();ctx.restore()}
function renderCanvas(){const W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#161512');g.addColorStop(.52,'#0d0d0c');g.addColorStop(1,'#211906');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(213,169,59,.16)';ctx.lineWidth=1;for(let x=-300;x<W+300;x+=90){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-300,H);ctx.stroke()}
  drawCrown(W/2,70);ctx.textAlign='center';ctx.direction='rtl';let size=fitText(state.shopName||'المعلم',760,92,54,900);ctx.font=`900 ${size}px Tahoma, Arial`;ctx.fillStyle='#f5e9c5';ctx.fillText(state.shopName||'المعلم',W/2,208);ctx.font='700 30px Tahoma, Arial';ctx.fillStyle='#d6a83a';ctx.fillText(state.subtitle||'قائمة الأسعار',W/2,262);const today=new Intl.DateTimeFormat('ar-EG',{day:'numeric',month:'long',year:'numeric'}).format(new Date());ctx.font='700 18px Tahoma, Arial';ctx.fillStyle='#bcb7a9';ctx.fillText(`تحديث: ${today}`,W/2,290);ctx.fillStyle='rgba(213,169,59,.7)';ctx.fillRect(130,302,W-260,2);
  const local=state.products.filter(p=>(p.category||'محلي')!=='مستورد');const imported=state.products.filter(p=>p.category==='مستورد');const columns=[{title:'المحلي',items:local,x:570},{title:'المستورد',items:imported,x:60}];const colW=450,rowH=46,startY=360;columns.forEach(column=>{ctx.textAlign='center';ctx.font='800 24px Tahoma, Arial';ctx.fillStyle='#17130a';roundRect(column.x,startY-42,colW,36,18,'#d6a83a');ctx.fillText(`— ${column.title} —`,column.x+colW/2,startY-16);column.items.forEach((p,i)=>{const y=startY+i*rowH;roundRect(column.x,y,colW,rowH-5,10,i%2?'rgba(255,255,255,.035)':'rgba(213,169,59,.055)','rgba(213,169,59,.16)');ctx.textAlign='right';ctx.fillStyle='#f8f5ed';const nameSize=fitText(p.name,285,23,17,700);ctx.font=`700 ${nameSize}px Tahoma, Arial`;ctx.fillText(p.name,column.x+colW-18,y+30);ctx.textAlign='left';ctx.fillStyle='#efd16d';ctx.font='900 24px Tahoma, Arial';ctx.fillText(priceLabel(p.price),column.x+18,y+30)})});
  if(!state.products.length){ctx.textAlign='center';ctx.font='700 30px Tahoma, Arial';ctx.fillStyle='#827f76';ctx.fillText('أضف الأصناف لتظهر هنا',W/2,700)}
  const footerY=1210;ctx.fillStyle='rgba(213,169,59,.7)';ctx.fillRect(130,footerY,W-260,2);ctx.textAlign='center';ctx.font='700 24px Tahoma, Arial';ctx.fillStyle='#f1eee6';ctx.fillText(state.phone||'',W/2,1252);ctx.font='400 19px Tahoma, Arial';ctx.fillStyle='#aaa69b';ctx.fillText(state.note||'',W/2,1287);ctx.font='700 16px Tahoma, Arial';ctx.fillStyle='#d6a83a';ctx.fillText('المعلم • الجودة والثقة',W/2,1322)}
function canvasBlob(){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('تعذر تجهيز الصورة')),'image/png',1))}
function downloadFile(file){const url=URL.createObjectURL(file);const a=document.createElement('a');a.download=file.name;a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('#downloadBtn').addEventListener('click',async()=>{renderCanvas();const button=$('#downloadBtn');const oldText=button.innerHTML;button.disabled=true;button.innerHTML='<span>…</span> جاري تجهيز الصورة';try{const blob=await canvasBlob();const name=`${(state.shopName||'المعلم').replace(/\s+/g,'-')}-قائمة-الأسعار.png`;const file=new File([blob],name,{type:'image/png'});const shareData={files:[file],title:`قائمة أسعار ${state.shopName||'المعلم'}`,text:`قائمة أسعار ${state.shopName||'المعلم'}`};if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share(shareData);toast('تم فتح المشاركة — اختر واتساب بيزنس')}else{downloadFile(file);window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text)}`,'_blank','noopener');toast('تم تنزيل الصورة وفتح واتساب')}}catch(err){if(err?.name!=='AbortError')toast('تعذر فتح المشاركة — جرّب مرة أخرى')}finally{button.disabled=false;button.innerHTML=oldText}});

// MicroPOS imports products from an Excel 97-2003 (.xls) file; it reads it from MicroPOS/MPOSMPO/mpo.xls
const POS_COLUMNS=['كود الصنف','اسم الصنف','السعر','الفئة','الوصف'];
$('#exportPosBtn').addEventListener('click',()=>{if(!window.XLSX){toast('تعذر تحميل مكتبة الإكسل — تأكد من الإنترنت');return}const priced=state.products.filter(p=>String(p.price).trim()!=='-');if(!priced.length){toast('لا توجد أصناف بأسعار للتصدير');return}const rows=priced.map(p=>[p.id,p.name,Number(p.price),p.category||'',p.details||'']);const sheet=XLSX.utils.aoa_to_sheet([POS_COLUMNS,...rows]);sheet['!cols']=[{wch:14},{wch:28},{wch:10},{wch:12},{wch:20}];const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,sheet,'products');XLSX.writeFile(book,'mpo.xls',{bookType:'biff8'});const skipped=state.products.length-priced.length;toast(`تم تصدير ${priced.length} صنف${skipped?` — تم تخطي ${skipped} بدون سعر`:''}`)});

function registerWebMCP(){const mc=document.modelContext;if(!mc?.registerTool)return;const safe=fn=>input=>{try{return fn(input||{})}catch(err){throw new Error(err.message)}};mc.registerTool({name:'add_price_item',title:'إضافة صنف',description:'يضيف صنفًا جديدًا إلى قائمة الأسعار الظاهرة.',inputSchema:{type:'object',properties:{name:{type:'string'},price:{type:'number'},category:{type:'string'},details:{type:'string'}},required:['name','price'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:safe(({name,price,category='',details=''})=>{if(!String(name).trim()||!Number.isFinite(price)||price<0)throw new Error('بيانات الصنف غير صحيحة');const item={id:String(Date.now()),name:String(name).trim(),price,category:String(category),details:String(details)};state.products.push(item);save();renderList();return {added:true,id:item.id,count:state.products.length}})});mc.registerTool({name:'update_price_item',title:'تعديل سعر صنف',description:'يعدّل بيانات صنف موجود بالاسم.',inputSchema:{type:'object',properties:{currentName:{type:'string'},name:{type:'string'},price:{type:'number'},category:{type:'string'},details:{type:'string'}},required:['currentName'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:safe(input=>{const item=state.products.find(p=>p.name===input.currentName);if(!item)throw new Error('الصنف غير موجود');['name','price','category','details'].forEach(k=>{if(input[k]!==undefined)item[k]=input[k]});save();renderList();return {updated:true,item}})})}
initFields();renderList();save();registerWebMCP();
