(()=>{
'use strict';
const DEFAULT_API='https://atas-game-guide-api-production.up.railway.app/api';
const $=s=>document.querySelector(s);
const api=()=>($('#apiBase')?.value.trim()||localStorage.getItem('atas-admin-api')||DEFAULT_API).replace(/\/$/,'');
const token=()=>sessionStorage.getItem('atas-admin-token')||'';
let historyBusy=false;

async function req(path,opts={}){
  const r=await fetch(api()+path,{...opts,headers:{'Content-Type':'application/json',...(token()?{Authorization:`Bearer ${token()}`}:{}) ,...(opts.headers||{})}});
  if(r.status===204)return null;
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||`HTTP ${r.status}`);
  return j;
}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function setMsg(t,bad=false){const x=$('#proMsg');if(x){x.textContent=t;x.style.color=bad?'#ff9ca6':'#72e2ac'}}
function fmtTime(s){try{return new Date(s).toLocaleString('zh-TW',{hour12:false})}catch{return s}}

function inject(){
  if($('#proToolsBtn'))return;
  const style=document.createElement('style');style.textContent=`
    .pro-tools-btn{border:1px solid #315577!important;background:#10263e!important;color:#d9ecff!important}
    .pro-modal{position:fixed;inset:0;background:#000a;z-index:160;display:grid;place-items:center;padding:20px}.pro-modal[hidden]{display:none}.pro-card{width:min(1050px,100%);max-height:90vh;overflow:auto;background:#091725;border:1px solid #294b68;border-radius:18px;padding:16px}.pro-head{display:flex;justify-content:space-between;align-items:center}.pro-head h2{margin:0}.pro-head button{border:0;background:transparent;color:#fff;font-size:25px;cursor:pointer}.pro-tabs{display:flex;gap:8px;margin:14px 0}.pro-tabs button{border:1px solid #294963;background:#0d1d2d;color:#a9bed0;border-radius:9px;padding:8px 12px;cursor:pointer}.pro-tabs button.active{background:#176dcc;color:#fff}.pro-pane{display:none}.pro-pane.active{display:block}.pro-actions{display:flex;gap:9px;flex-wrap:wrap;margin:10px 0}.pro-actions button,.image-card button,.history-row button{border:1px solid #31516c;background:#0d2236;color:#d1e4f5;border-radius:8px;padding:8px 10px;cursor:pointer}.pro-actions .danger,.image-card .danger{border-color:#613542;color:#ffadb7}.pro-note{font-size:10px;color:#8097ac;line-height:1.65}.pro-msg{min-height:18px;margin:8px 0;font-size:10px}.image-grid-pro{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px}.image-card{border:1px solid #203c56;background:#0b1b2b;border-radius:12px;padding:9px}.image-card img{width:100%;height:120px;object-fit:cover;border-radius:8px;background:#07111e}.image-card b{display:block;font-size:10px;margin:7px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.image-card .buttons{display:flex;gap:5px;flex-wrap:wrap}.history-list{display:grid;gap:8px}.history-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;border:1px solid #203b54;background:#0b1b2a;border-radius:11px;padding:10px}.history-row b{display:block;font-size:11px}.history-row small{display:block;color:#7e95aa;font-size:9px;margin-top:3px}.drop-zone{border:1px dashed #355b79;border-radius:12px;padding:18px;text-align:center;color:#89a2b8;margin-top:9px}.drop-zone input{display:none}@media(max-width:700px){.history-row{grid-template-columns:1fr}.pro-tabs{overflow:auto}.pro-card{padding:12px}}
  `;document.head.appendChild(style);
  const toolbar=$('.toolbar');if(toolbar){const b=document.createElement('button');b.id='proToolsBtn';b.className='pro-tools-btn';b.textContent='備份・圖片・紀錄';toolbar.appendChild(b)}
  const m=document.createElement('div');m.id='proModal';m.className='pro-modal';m.hidden=true;m.innerHTML=`
    <div class="pro-card"><div class="pro-head"><div><small style="color:#4f8fd0">ADMIN TOOLS</small><h2>管理工具</h2></div><button id="proClose">×</button></div>
      <div class="pro-tabs"><button data-tab="backup" class="active">備份 / 還原</button><button data-tab="images">圖片庫</button><button data-tab="history">版本紀錄</button></div>
      <div id="proMsg" class="pro-msg"></div>
      <section class="pro-pane active" data-pane="backup"><h3>完整內容備份</h3><p class="pro-note">備份包含教學、案例、測驗與後台設定。建議每次大量修改前先下載一份。</p><div class="pro-actions"><button id="exportBackup">下載 JSON 備份</button><button id="makeSnapshot">建立雲端快照</button><button id="pickRestore" class="danger">從 JSON 還原</button><input id="restoreFile" type="file" accept="application/json,.json" hidden></div><div class="drop-zone">還原會以備份內容覆蓋目前教學資料；執行前會自動建立一份「還原前」快照。</div></section>
      <section class="pro-pane" data-pane="images"><div class="pro-actions"><button id="refreshImages">重新整理圖片庫</button></div><p class="pro-note">這裡會整理目前教學已使用的封面與章節圖片。點「複製網址」可重複使用，不必再次上傳。</p><div id="imageLibrary" class="image-grid-pro"></div></section>
      <section class="pro-pane" data-pane="history"><div class="pro-actions"><button id="refreshHistory">重新整理紀錄</button><button id="snapshotNow">立即建立快照</button></div><p class="pro-note">修改、刪除、同步與拖曳排序前會自動留下 Railway 雲端快照，保留最近 15 份。</p><div id="historyList" class="history-list"></div></section>
    </div>`;document.body.appendChild(m);
  $('#proToolsBtn').onclick=()=>{m.hidden=false;openTab('backup')};$('#proClose').onclick=()=>m.hidden=true;m.addEventListener('click',e=>{if(e.target===m)m.hidden=true});
  m.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>openTab(b.dataset.tab));
  $('#exportBackup').onclick=exportBackup;$('#makeSnapshot').onclick=()=>snapshot('手動備份');$('#snapshotNow').onclick=()=>snapshot('手動快照');
  $('#pickRestore').onclick=()=>$('#restoreFile').click();$('#restoreFile').onchange=restoreFile;$('#refreshImages').onclick=renderImages;$('#refreshHistory').onclick=renderHistory;
}
function openTab(name){document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===name));document.querySelectorAll('[data-pane]').forEach(x=>x.classList.toggle('active',x.dataset.pane===name));if(name==='images')renderImages();if(name==='history')renderHistory()}

async function currentBundle(){const [content,settings]=await Promise.all([req('/content'),req('/settings').catch(()=>({}))]);return {version:1,exported_at:new Date().toISOString(),content,settings}}
async function exportBackup(){try{setMsg('正在建立備份…');const data=await currentBundle();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`ATAS教學備份_${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);setMsg(`備份完成，共 ${data.content.length} 筆內容`)}catch(e){setMsg('備份失敗：'+e.message,true)}}

async function getHistory(){const s=await req('/settings').catch(()=>({}));return Array.isArray(s.admin_history)?s.admin_history:[]}
async function putHistory(list){await req('/settings/admin_history',{method:'PUT',body:JSON.stringify({value:list.slice(0,15)})})}
async function snapshot(label='自動快照'){
  if(historyBusy||!token())return;historyBusy=true;
  try{const content=await req('/content');const list=await getHistory();const snap={id:Date.now(),label,created_at:new Date().toISOString(),content};await putHistory([snap,...list.filter(x=>x.id!==snap.id)]);setMsg(`已建立快照：${label}`);return snap}catch(e){console.warn('snapshot failed',e);setMsg('建立快照失敗：'+e.message,true)}finally{historyBusy=false}
}
async function replaceContent(content){
  if(!Array.isArray(content))throw new Error('備份內容格式不正確');
  const old=await req('/content');for(const r of old)await req('/content/'+r.id,{method:'DELETE'});
  if(content.length){const items=content.map(x=>({type:x.type,slug:x.slug,title:x.title,category:x.category||'',body:x.body||{},sort_order:Number(x.sort_order)||0,published:x.published!==false}));await req('/content/bulk',{method:'POST',body:JSON.stringify({items})})}
}
async function restoreBundle(data,label='備份檔'){
  if(!data||!Array.isArray(data.content))throw new Error('不是有效的 ATAS 備份檔');
  if(!confirm(`確定從「${label}」還原？目前內容會被覆蓋。`))return;
  await snapshot('整站還原前');setMsg('正在還原，請勿關閉頁面…');await replaceContent(data.content);
  if(data.settings&&typeof data.settings==='object'){for(const [k,v] of Object.entries(data.settings)){if(k==='admin_history')continue;await req('/settings/'+encodeURIComponent(k),{method:'PUT',body:JSON.stringify({value:v})})}}
  setMsg(`還原完成，共 ${data.content.length} 筆內容。請重新整理前台確認。`);setTimeout(()=>location.reload(),800)
}
async function restoreFile(){const f=$('#restoreFile').files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());await restoreBundle(data,f.name)}catch(e){setMsg('還原失敗：'+e.message,true)}finally{$('#restoreFile').value=''}}

function findImages(obj,out=[]){
  if(!obj)return out;
  if(typeof obj==='string'){if(/^https?:\/\//i.test(obj)&&/\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(obj))out.push(obj);return out}
  if(Array.isArray(obj)){obj.forEach(x=>findImages(x,out));return out}
  if(typeof obj==='object')Object.values(obj).forEach(x=>findImages(x,out));return out
}
async function renderImages(){const box=$('#imageLibrary');box.innerHTML='讀取中…';try{const content=await req('/content'),urls=[...new Set(content.flatMap(r=>findImages(r.body,[])))];if(!urls.length){box.innerHTML='<div class="pro-note">目前後台內容還沒有已使用的上傳圖片。</div>';return}box.innerHTML=urls.map((u,i)=>`<div class="image-card"><img src="${esc(u)}" loading="lazy"><b title="${esc(u)}">圖片 ${i+1}</b><div class="buttons"><button data-copy="${esc(u)}">複製網址</button><button data-cover="${esc(u)}">設為目前封面</button></div></div>`).join('');box.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(b.dataset.copy);setMsg('圖片網址已複製')});box.querySelectorAll('[data-cover]').forEach(b=>b.onclick=()=>{const c=$('#edCover');if(!c){setMsg('請先開啟一篇教學的編輯視窗',true);return}c.value=b.dataset.cover;c.dispatchEvent(new Event('input'));$('#proModal').hidden=true;setMsg('已套用為封面，記得按儲存')})}catch(e){box.innerHTML=`<div class="pro-note">讀取失敗：${esc(e.message)}</div>`}}

async function renderHistory(){const box=$('#historyList');box.innerHTML='讀取中…';try{const list=await getHistory();if(!list.length){box.innerHTML='<div class="pro-note">目前還沒有版本紀錄。下一次修改或排序前會自動建立。</div>';return}box.innerHTML=list.map((h,i)=>`<div class="history-row"><div><b>${esc(h.label||'快照')}</b><small>${fmtTime(h.created_at)} ・ ${h.content?.length||0} 筆內容</small></div><button data-restore-history="${h.id}">還原此版本</button></div>`).join('');box.querySelectorAll('[data-restore-history]').forEach(b=>b.onclick=async()=>{const h=list.find(x=>String(x.id)===String(b.dataset.restoreHistory));if(!h)return;try{await restoreBundle({content:h.content},h.label||'歷史版本')}catch(e){setMsg('還原失敗：'+e.message,true)}})}catch(e){box.innerHTML=`<div class="pro-note">讀取失敗：${esc(e.message)}</div>`}}

function setupAutoSnapshots(){
  const bind=(sel,label)=>{const el=$(sel);if(el&&!el.dataset.snapshotBound){el.dataset.snapshotBound='1';el.addEventListener('click',()=>snapshot(label),true)}};
  bind('#saveBtn','儲存修改前');bind('#deleteBtn','刪除內容前');bind('#importLegacyBtn','同步前台資料前');
  document.addEventListener('dragstart',e=>{if(e.target.closest('#contentRows tr[data-row-id]'))snapshot('拖曳排序前')},true);
}

inject();setupAutoSnapshots();
window.addEventListener('atas:admin-render',setupAutoSnapshots);
})();