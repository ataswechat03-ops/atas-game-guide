const RAW='https://raw.githubusercontent.com/ataswechat03-ops/atas-game-guide/main/';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const imageUrl=f=>RAW+encodeURIComponent(f);
let activeCategory='全部';
let query='';

function categories(){return ['全部','電子遊戲','真人遊戲','體育'];}
function visibleGuides(){
  const q=query.trim().toLowerCase();
  return GUIDES.filter(g=>(activeCategory==='全部'||g.category===activeCategory) && (!q||[g.title,g.category,g.intro,...g.tags].join(' ').toLowerCase().includes(q)));
}
function renderNav(){
  $('#categoryNav').innerHTML=categories().map(c=>`<button class="side-btn ${c===activeCategory?'active':''}" data-cat="${esc(c)}">${esc(c)}<span class="n">${c==='全部'?GUIDES.length:GUIDES.filter(g=>g.category===c).length}</span></button>`).join('');
  document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;renderAll();closeSidebar();});
  $('#guideNav').innerHTML=GUIDES.map(g=>`<button class="side-btn" data-guide="${g.id}">${g.emoji} ${esc(g.title)}</button>`).join('');
  document.querySelectorAll('[data-guide]').forEach(b=>b.onclick=()=>{openGuide(b.dataset.guide);closeSidebar();});
}
function renderCards(){
  const list=visibleGuides();
  $('#count').textContent=`共 ${list.length} 篇`;
  $('#sectionTitle').textContent=activeCategory==='全部'?'全部教學':activeCategory;
  $('#empty').style.display=list.length?'none':'block';
  $('#guideGrid').innerHTML=list.map(g=>{
    const cover=g.id==='football'?`<img src="${imageUrl(FOOTBALL_IMAGES[1][1])}" alt="足球基本知識">`:`<span class="emoji">${g.emoji}</span>`;
    return `<article class="guide-card" data-open="${g.id}"><div class="cover">${cover}<span class="badge">${esc(g.category)}</span></div><div class="card-body"><div class="card-meta">${g.tags.slice(0,4).map(esc).join(' ・ ')}</div><h3>${esc(g.title)}</h3><p>${esc(g.intro)}</p></div><div class="card-footer"><span>${g.sections.length} 個章節</span><b>查看完整教學 →</b></div></article>`;
  }).join('');
  document.querySelectorAll('[data-open]').forEach(c=>c.onclick=()=>openGuide(c.dataset.open));
}
function renderStats(){
  const sectionCount=GUIDES.reduce((n,g)=>n+g.sections.length,0);
  $('#heroStats').innerHTML=`<div class="stat"><b>${GUIDES.length}</b><span>教學主題</span></div><div class="stat"><b>${sectionCount}</b><span>教學章節</span></div><div class="stat"><b>3</b><span>主要分類</span></div><div class="stat"><b>7</b><span>足球圖解</span></div>`;
}
function renderAll(){renderNav();renderCards();renderStats();}
function renderSection(s){
  let body='';
  if(s.boxes){body+=`<div class="lesson-grid">${s.boxes.map(([h,p])=>`<div class="lesson-box"><h4>${esc(h)}</h4><p>${esc(p)}</p></div>`).join('')}</div>`;}
  if(s.list){body+=`<div class="lesson-box"><p>${s.list.map((x,i)=>`${i+1}. ${esc(x)}`).join('\n\n')}</p></div>`;}
  if(s.table){body+=`<div class="table-wrap"><table class="simple-table"><thead><tr>${s.table.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
  if(s.footballImages){body+=`<div class="football-grid">${FOOTBALL_IMAGES.map(([name,file])=>`<div class="football-img" data-img="${esc(file)}" data-name="${esc(name)}"><img src="${imageUrl(file)}" alt="${esc(name)}"><b>${esc(name)}｜點擊看大圖</b></div>`).join('')}</div>`;}
  if(s.note){body+=`<div class="lesson-note">${esc(s.note)}</div>`;}
  return `<section class="lesson-section"><h3>${esc(s.title)}</h3>${body}</section>`;
}
function openGuide(id){
  const g=GUIDES.find(x=>x.id===id);if(!g)return;
  $('#detailCategory').textContent=g.category;
  $('#detailTitle').textContent=`${g.emoji} ${g.title}`;
  $('#detailIntro').textContent=g.intro;
  $('#detailBody').innerHTML=g.sections.map(renderSection).join('')+`<div class="lesson-note warn">提醒：遊戲館別、桌型、特殊邊注、派彩與有效投注規則可能不同；實際操作與客服回覆時，仍以玩家當下遊戲畫面／桌面規則為準。</div>`;
  $('#overlay').classList.add('show');$('#detail').classList.add('show');document.body.style.overflow='hidden';
  document.querySelectorAll('[data-img]').forEach(el=>el.onclick=()=>openZoom(el.dataset.img,el.dataset.name));
  location.hash=`guide=${encodeURIComponent(id)}`;
}
function closeDetail(){
  $('#overlay').classList.remove('show');$('#detail').classList.remove('show');document.body.style.overflow='';
  if(location.hash.startsWith('#guide=')) history.replaceState(null,'',location.pathname+location.search);
}
function openZoom(file,name){
  let z=$('#zoomModal');if(!z){z=document.createElement('section');z.id='zoomModal';z.className='zoom-modal';z.innerHTML='<div class="zoom-head"><b id="zoomTitle"></b><button class="close" id="zoomClose">×</button></div><img id="zoomImage" alt="">';document.body.appendChild(z);$('#zoomClose').onclick=()=>z.classList.remove('show');}
  $('#zoomTitle').textContent=name;$('#zoomImage').src=imageUrl(file);$('#zoomImage').alt=name;z.classList.add('show');
}
function openSidebar(){$('#sidebar').classList.add('open');$('#overlay').classList.add('show');}
function closeSidebar(){$('#sidebar').classList.remove('open');if(!$('#detail').classList.contains('show'))$('#overlay').classList.remove('show');}
$('#q').oninput=e=>{query=e.target.value;renderCards();};
$('#closeDetail').onclick=closeDetail;
$('#overlay').onclick=()=>{$('#sidebar').classList.contains('open')?closeSidebar():closeDetail();};
$('#menuBtn').onclick=openSidebar;$('#mobileClose').onclick=closeSidebar;
renderAll();
if(location.hash.startsWith('#guide=')){const id=decodeURIComponent(location.hash.slice(7));setTimeout(()=>openGuide(id),0);}
