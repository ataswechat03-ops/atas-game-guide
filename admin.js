(()=>{
'use strict';
const $=s=>document.querySelector(s);
const DEFAULT_API='https://atas-game-guide-api-production.up.railway.app/api';
let api=localStorage.getItem('atas-admin-api')||DEFAULT_API;
let token=sessionStorage.getItem('atas-admin-token')||'';
let rows=[],editing=null,syncing=false;
const state=$('#apiState'),loginPanel=$('#loginPanel'),appPanel=$('#appPanel'),msg=$('#loginMsg'),editor=$('#editorModal');
$('#apiBase').value=api;

function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null}
function setState(t,ok=false){state.textContent=t;state.style.color=ok?'#72e2ac':'#9eb4c8'}
async function req(path,opts={}){
  const r=await fetch(api.replace(/\/$/,'')+path,{...opts,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...(opts.headers||{})}});
  if(r.status===204)return null;
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||`HTTP ${r.status}`);
  return j;
}

async function login(){
  api=$('#apiBase').value.trim();
  if(!api)return msg.textContent='請先填 API 網址';
  msg.textContent='連線中…';
  try{
    const h=await fetch(api.replace(/\/$/,'')+'/health').then(r=>r.json());
    if(!h.ok)throw new Error('API 無回應');
    const r=await req('/login',{method:'POST',body:JSON.stringify({username:$('#adminUser').value.trim(),password:$('#adminPass').value})});
    token=r.token;
    localStorage.setItem('atas-admin-api',api);localStorage.setItem('atas-api-base',api);sessionStorage.setItem('atas-admin-token',token);
    msg.textContent='';await load();
  }catch(e){msg.textContent=e.message;setState('連線失敗')}
}

function localGuides(){
  const base=(typeof GUIDES!=='undefined'&&Array.isArray(GUIDES)?GUIDES:[]).map(x=>JSON.parse(JSON.stringify(x)));
  const extra=(window.ATAS_FOOTBALL_ODDS_GUIDES||[]).map(x=>JSON.parse(JSON.stringify(x)));
  const map=new Map();[...base,...extra].forEach(g=>g?.id&&map.set(g.id,g));
  return [...map.values()];
}
function localCases(){return (window.ATAS_BET_CASES||[]).map(c=>JSON.parse(JSON.stringify(c)))}
function importItems(){
  const guides=localGuides().map((g,i)=>({type:'guide',slug:g.id,title:g.title,category:g.category||'',body:g,sort_order:i,published:true}));
  const cases=localCases().map((c,i)=>({type:'case',slug:c.id,title:c.title,category:'FB SPORT',body:c,sort_order:i,published:true}));
  return {guides,cases,items:[...guides,...cases]};
}
async function ensureCoreGuides(){
  if(syncing)return;
  const must=['football-europe','football-hongkong','football-malay','football-indo','football-american'];
  const have=new Set(rows.filter(r=>r.type==='guide').map(r=>r.slug));
  if(rows.length&&must.every(x=>have.has(x)))return;
  syncing=true;
  const box=$('#importMsg');
  box.textContent=rows.length?'正在補齊足球盤口教學…':'首次建立內容，正在同步目前前台資料…';
  try{
    const {items}=importItems();
    if(items.length){await req('/content/bulk',{method:'POST',body:JSON.stringify({items})});rows=await req('/content');render();box.textContent=`同步完成，共 ${rows.length} 筆內容。`}
  }catch(e){box.textContent='自動同步失敗：'+e.message}
  syncing=false;
}
async function load(){
  try{
    rows=await req('/content');loginPanel.hidden=true;appPanel.hidden=false;setState('後台已連線',true);render();await ensureCoreGuides();
  }catch(e){loginPanel.hidden=false;appPanel.hidden=true;setState('需要登入');if(token){sessionStorage.removeItem('atas-admin-token');token=''}}
}

function render(){
  const q=$('#searchAdmin').value.trim().toLowerCase(),t=$('#typeFilter').value;
  const f=rows.filter(r=>(!t||r.type===t)&&(!q||`${r.title} ${r.slug} ${r.category}`.toLowerCase().includes(q)));
  const counts={all:rows.length,guide:rows.filter(x=>x.type==='guide').length,case:rows.filter(x=>x.type==='case').length,quiz:rows.filter(x=>x.type==='quiz').length};
  $('#stats').innerHTML=`<div><span>全部內容</span><b>${counts.all}</b></div><div><span>教學</span><b>${counts.guide}</b></div><div><span>案例</span><b>${counts.case}</b></div><div><span>測驗</span><b>${counts.quiz}</b></div>`;
  $('#contentRows').innerHTML=f.map(r=>`<tr><td><span class="badge">${r.type}</span></td><td>${esc(r.title)}</td><td>${esc(r.category||'—')}</td><td><span class="badge ${r.published?'pub':'draft'}">${r.published?'已發布':'草稿'}</span></td><td>${r.sort_order}</td><td><button data-edit="${r.id}">編輯</button></td></tr>`).join('')||'<tr><td colspan="6">目前沒有內容</td></tr>';
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEditor(Number(b.dataset.edit)));
}

function pairRow(kind,a='',b=''){
  const div=document.createElement('div');div.className='pair-row';div.dataset.kind=kind;
  div.innerHTML=`<input data-a value="${esc(a)}" placeholder="${kind==='box'?'小標題':'圖片名稱'}"><input data-b value="${esc(b)}" placeholder="${kind==='box'?'內容':'檔案名稱 / 路徑'}"><button type="button" data-pair-remove>刪除</button>`;
  div.querySelector('[data-pair-remove]').onclick=()=>div.remove();
  return div;
}
function addPair(container,kind,a='',b=''){container.appendChild(pairRow(kind,a,b))}
function sectionCard(data={}){
  const tpl=$('#sectionTemplate').content.firstElementChild.cloneNode(true);
  tpl.querySelector('[data-sec="title"]').value=data.title||'';
  tpl.querySelector('[data-sec="list"]').value=Array.isArray(data.list)?data.list.join('\n'):'';
  tpl.querySelector('[data-sec="note"]').value=data.note||'';
  tpl.querySelector('[data-sec="footballImages"]').checked=!!data.footballImages;
  const headers=data.table?.headers||[];tpl.querySelector('[data-sec="tableHeaders"]').value=headers.join(' | ');
  tpl.querySelector('[data-sec="tableRows"]').value=(data.table?.rows||[]).map(r=>r.join(' | ')).join('\n');
  const boxes=tpl.querySelector('[data-boxes]');(data.boxes||[]).forEach(x=>addPair(boxes,'box',x[0],x[1]));
  const images=tpl.querySelector('[data-images]');(data.images||[]).forEach(x=>addPair(images,'image',x[0],x[1]));
  tpl.querySelector('[data-add-box]').onclick=()=>addPair(boxes,'box');
  tpl.querySelector('[data-add-image]').onclick=()=>addPair(images,'image');
  tpl.querySelector('[data-remove]').onclick=()=>{if(confirm('刪除這個章節？'))tpl.remove()};
  tpl.querySelector('[data-move="up"]').onclick=()=>{const p=tpl.previousElementSibling;if(p)tpl.parentNode.insertBefore(tpl,p)};
  tpl.querySelector('[data-move="down"]').onclick=()=>{const n=tpl.nextElementSibling;if(n)tpl.parentNode.insertBefore(n,tpl)};
  return tpl;
}
function renderSections(sections=[]){const c=$('#sectionsEditor');c.innerHTML='';sections.forEach(s=>c.appendChild(sectionCard(s)));if(!sections.length)c.appendChild(sectionCard({title:'01｜新章節'}))}
function collectPairs(card,kind){return [...card.querySelectorAll(`.pair-row[data-kind="${kind}"]`)].map(r=>[r.querySelector('[data-a]').value.trim(),r.querySelector('[data-b]').value.trim()]).filter(x=>x[0]||x[1])}
function collectSections(){
  return [...$('#sectionsEditor').querySelectorAll('.section-editor-card')].map(card=>{
    const s={title:card.querySelector('[data-sec="title"]').value.trim()||'未命名章節'};
    const boxes=collectPairs(card,'box');if(boxes.length)s.boxes=boxes;
    const list=card.querySelector('[data-sec="list"]').value.split(/\n/).map(x=>x.trim()).filter(Boolean);if(list.length)s.list=list;
    const hs=card.querySelector('[data-sec="tableHeaders"]').value.split('|').map(x=>x.trim()).filter(Boolean);
    const rs=card.querySelector('[data-sec="tableRows"]').value.split(/\n/).map(x=>x.split('|').map(y=>y.trim())).filter(r=>r.some(Boolean));
    if(hs.length||rs.length)s.table={headers:hs,rows:rs};
    const images=collectPairs(card,'image');if(images.length)s.images=images;
    const note=card.querySelector('[data-sec="note"]').value.trim();if(note)s.note=note;
    if(card.querySelector('[data-sec="footballImages"]').checked)s.footballImages=true;
    return s;
  });
}

function setEditorType(type){
  $('#guideEditor').hidden=type!=='guide';$('#caseEditor').hidden=type!=='case';$('#quizEditor').hidden=type!=='quiz';
}
function openEditor(id=null){
  editing=id?rows.find(x=>x.id===id):null;
  const type=editing?.type||'guide',body=editing?.body||{};
  $('#editorTitle').textContent=editing?'編輯內容':'新增內容';$('#editorKicker').textContent=editing?'EDIT CONTENT':'NEW CONTENT';
  $('#edType').value=type;$('#edSlug').value=editing?.slug||'';$('#edTitle').value=editing?.title||'';$('#edCategory').value=editing?.category||'';$('#edSort').value=editing?.sort_order||0;$('#edPublished').checked=editing?.published??true;
  $('#edEmoji').value=body.emoji||'';$('#edTags').value=Array.isArray(body.tags)?body.tags.join(', '):'';$('#edIntro').value=body.intro||'';renderSections(Array.isArray(body.sections)?body.sections:[]);
  $('#caseTag').value=body.tag||'';$('#caseSettlement').value=body.settlement||'';$('#caseMatch').value=body.match||'';$('#caseMarket').value=body.market||'';$('#caseResult').value=body.result||'';$('#caseBase').value=body.base??'';$('#caseRisk').value=body.risk??'';$('#casePnl').value=body.pnl??'';$('#caseExplain').value=body.explain||'';$('#caseFormula').value=body.formula||'';
  $('#quizBody').value=JSON.stringify(body,null,2);$('#edBody').value=JSON.stringify(body,null,2);
  $('#deleteBtn').hidden=!editing;$('#editorMsg').textContent='';setEditorType(type);editor.hidden=false;
}
function buildBody(type){
  if(type==='guide')return {id:$('#edSlug').value.trim(),title:$('#edTitle').value.trim(),category:$('#edCategory').value.trim(),emoji:$('#edEmoji').value.trim()||'📘',intro:$('#edIntro').value.trim(),tags:$('#edTags').value.split(',').map(x=>x.trim()).filter(Boolean),sections:collectSections()};
  if(type==='case'){
    const b={id:$('#edSlug').value.trim(),title:$('#edTitle').value.trim(),tag:$('#caseTag').value.trim(),settlement:$('#caseSettlement').value.trim(),match:$('#caseMatch').value.trim(),market:$('#caseMarket').value.trim(),result:$('#caseResult').value.trim(),explain:$('#caseExplain').value.trim(),formula:$('#caseFormula').value.trim()};
    const base=num($('#caseBase').value),risk=num($('#caseRisk').value),pnl=num($('#casePnl').value);if(base!==null)b.base=base;if(risk!==null)b.risk=risk;b.pnl=pnl;return b;
  }
  try{return JSON.parse($('#quizBody').value||'{}')}catch{throw new Error('測驗 JSON 格式錯誤')}
}
async function save(){
  const type=$('#edType').value,slug=$('#edSlug').value.trim(),title=$('#edTitle').value.trim();
  if(!slug||!title)return $('#editorMsg').textContent='Slug 與標題不能空白';
  let body;try{body=buildBody(type)}catch(e){return $('#editorMsg').textContent=e.message}
  const payload={type,slug,title,category:$('#edCategory').value.trim(),sort_order:Number($('#edSort').value)||0,published:$('#edPublished').checked,body};
  try{if(editing)await req('/content/'+editing.id,{method:'PUT',body:JSON.stringify(payload)});else await req('/content',{method:'POST',body:JSON.stringify(payload)});editor.hidden=true;await load()}catch(e){$('#editorMsg').textContent=e.message}
}
async function del(){if(!editing||!confirm('確定刪除這筆內容？'))return;try{await req('/content/'+editing.id,{method:'DELETE'});editor.hidden=true;await load()}catch(e){$('#editorMsg').textContent=e.message}}
async function importLegacy(silent=false){
  const box=$('#importMsg'),{guides,cases,items}=importItems();
  if(!items.length){box.textContent='找不到可同步的前台資料';return}
  if(!silent&&!confirm(`將同步 ${guides.length} 篇教學與 ${cases.length} 筆案例到後台。同名內容會更新，確定繼續？`))return;
  box.textContent='同步中…';
  try{const r=await req('/content/bulk',{method:'POST',body:JSON.stringify({items})});box.textContent=`完成：已同步 ${r.count} 筆資料。`;rows=await req('/content');render()}catch(e){box.textContent='同步失敗：'+e.message}
}

$('#loginBtn').onclick=login;$('#newBtn').onclick=()=>openEditor();$('#saveBtn').onclick=save;$('#deleteBtn').onclick=del;$('#closeEditor').onclick=()=>editor.hidden=true;$('#typeFilter').onchange=render;$('#searchAdmin').oninput=render;$('#importLegacyBtn').onclick=()=>importLegacy(false);$('#addSectionBtn').onclick=()=>$('#sectionsEditor').appendChild(sectionCard({title:`${String($('#sectionsEditor').children.length+1).padStart(2,'0')}｜新章節`}));$('#edType').onchange=e=>setEditorType(e.target.value);
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-view]').forEach(x=>x.classList.remove('active'));b.classList.add('active');const map={dashboard:'',guides:'guide',cases:'case',quizzes:'quiz'};$('#typeFilter').value=map[b.dataset.view]??'';render()});
if(api&&token)load();else setState('後台尚未連線');
})();