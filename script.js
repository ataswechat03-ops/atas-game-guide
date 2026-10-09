const RAW='https://raw.githubusercontent.com/ataswechat03-ops/atas-game-guide/main/';
const ZIP_FILE='ATAS_GoogleDrive_教學圖片_22張.zip';
const ZIP_URLS={};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const imageUrl=f=>ZIP_URLS[f]||RAW+encodeURIComponent(f);

// 從 Google Drive《遊戲教學》內嵌圖片整理出的網站圖片。
const DRIVE_IMAGES={
  slots:[
    ['賠付線圖解','drive-image4.webp'],
    ['WILD 倍率畫面','drive-image3.webp'],
    ['Q 圖案倍率','drive-image5.webp'],
    ['K 圖案倍率','drive-image1.webp'],
    ['J 圖案倍率','drive-image18.webp'],
    ['WIN 結算範例','drive-image6.webp'],
    ['圖案倍率範例','drive-image2.webp'],
    ['Cluster 遊戲畫面','drive-image20.webp'],
    ['特殊圖案倍率','drive-image19.webp'],
    ['Cluster 遊戲畫面 2','drive-image21.webp']
  ],
  baccarat:[
    ['百家樂基本玩法','drive-image12.webp'],
    ['補牌與龍寶','drive-image17.webp'],
    ['百家樂下注圖解','drive-image10.webp'],
    ['免傭模式與幸運 6','drive-image15.webp'],
    ['百家樂玩法圖解','drive-image11.webp'],
    ['百家樂牌規','drive-image16.webp']
  ],
  sicbo:[['骰寶玩法圖解','drive-image14.webp']],
  roulette:[
    ['輪盤下注教學（上）','drive-image7.webp'],
    ['輪盤下注教學（中）','drive-image9.webp'],
    ['輪盤下注教學（下）','drive-image8.webp']
  ],
  sedie:[
    ['色碟玩法圖解','drive-image13.webp'],
    ['色碟基本玩法','drive-image22.webp']
  ]
};

const CUSTOM_IMAGES={
  sedie:[['色碟｜一看就懂','色碟玩法一看就懂.webp']],
  fantan:[['番攤｜一看就懂','番攤一看就懂_開獎下注教學.png']]
};

let activeCategory='全部';
let query='';
let driveZipLoaded=false;
let driveZipPromise=null;

async function loadDriveImagesFromZip(){
  if(driveZipLoaded)return true;
  if(driveZipPromise)return driveZipPromise;
  if(typeof JSZip==='undefined')return false;
  driveZipPromise=(async()=>{
    try{
      const res=await fetch(encodeURI(ZIP_FILE),{cache:'force-cache'});
      if(!res.ok)throw new Error(`ZIP HTTP ${res.status}`);
      const zip=await JSZip.loadAsync(await res.arrayBuffer());
      const files=[...new Set(Object.values(DRIVE_IMAGES).flat().map(x=>x[1]))];
      await Promise.all(files.map(async file=>{
        const entry=zip.file(file);if(!entry)return;
        const blob=await entry.async('blob');
        ZIP_URLS[file]=URL.createObjectURL(blob);
      }));
      driveZipLoaded=true;
      return true;
    }catch(err){
      console.warn('Google Drive 教學圖片 ZIP 載入失敗：',err);
      return false;
    }finally{
      driveZipPromise=null;
    }
  })();
  return driveZipPromise;
}

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
    const custom=CUSTOM_IMAGES[g.id];
    const drive=DRIVE_IMAGES[g.id];
    const customPrimary=custom?.[0];
    const drivePrimary=drive?.[0]&&ZIP_URLS[drive[0][1]]?drive[0]:null;
    const primary=customPrimary||drivePrimary;
    const cover=primary
      ? `<img loading="lazy" decoding="async" src="${imageUrl(primary[1])}" alt="${esc(g.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="emoji" style="display:none">${g.emoji}</span>`
      : g.id==='football'
        ? `<img loading="lazy" decoding="async" src="${imageUrl(FOOTBALL_IMAGES[1][1])}" alt="足球基本知識">`
        : `<span class="emoji">${g.emoji}</span>`;
    return `<article class="guide-card" data-open="${g.id}"><div class="cover">${cover}<span class="badge">${esc(g.category)}</span></div><div class="card-body"><div class="card-meta">${g.tags.slice(0,4).map(esc).join(' ・ ')}</div><h3>${esc(g.title)}</h3><p>${esc(g.intro)}</p></div><div class="card-footer"><span>${g.sections.length} 個章節</span><b>查看完整教學 →</b></div></article>`;
  }).join('');
  document.querySelectorAll('[data-open]').forEach(c=>c.onclick=()=>openGuide(c.dataset.open));
}
function renderStats(){
  const sectionCount=GUIDES.reduce((n,g)=>n+g.sections.length,0);
  const driveCount=Object.values(DRIVE_IMAGES).reduce((n,arr)=>n+arr.length,0);
  const customCount=Object.values(CUSTOM_IMAGES).reduce((n,arr)=>n+arr.length,0);
  $('#heroStats').innerHTML=`<div class="stat"><b>${GUIDES.length}</b><span>教學主題</span></div><div class="stat"><b>${sectionCount}</b><span>教學章節</span></div><div class="stat"><b>${driveCount+customCount+7}</b><span>教學圖片</span></div><div class="stat"><b>3</b><span>主要分類</span></div>`;
}
function renderAll(){renderNav();renderCards();renderStats();}
function imageGrid(imgs){
  return `<div class="football-grid">${imgs.map(([name,file])=>`<div class="football-img" data-img="${esc(file)}" data-name="${esc(name)}"><img loading="lazy" decoding="async" src="${imageUrl(file)}" alt="${esc(name)}" onerror="this.closest('.football-img').style.display='none'"><b>${esc(name)}｜點擊看大圖</b></div>`).join('')}</div>`;
}
function renderSection(s){
  let body='';
  if(s.boxes){body+=`<div class="lesson-grid">${s.boxes.map(([h,p])=>`<div class="lesson-box"><h4>${esc(h)}</h4><p>${esc(p)}</p></div>`).join('')}</div>`;}
  if(s.list){body+=`<div class="lesson-box"><p>${s.list.map((x,i)=>`${i+1}. ${esc(x)}`).join('\n\n')}</p></div>`;}
  if(s.table){body+=`<div class="table-wrap"><table class="simple-table"><thead><tr>${s.table.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
  if(s.footballImages){body+=imageGrid(FOOTBALL_IMAGES);}
  if(s.images?.length){body+=imageGrid(s.images);}
  if(s.note){body+=`<div class="lesson-note">${esc(s.note)}</div>`;}
  return `<section class="lesson-section"><h3>${esc(s.title)}</h3>${body}</section>`;
}
function renderImageGallery(id){
  const guide=GUIDES.find(g=>g.id===id);
  const sectionFiles=new Set((guide?.sections||[]).flatMap(s=>(s.images||[]).map(x=>x[1])));
  const custom=(CUSTOM_IMAGES[id]||[]).filter(x=>!sectionFiles.has(x[1]));
  const drive=(DRIVE_IMAGES[id]||[]).filter(x=>ZIP_URLS[x[1]]);
  const imgs=[...custom,...drive];
  const loading=(DRIVE_IMAGES[id]?.length&&!driveZipLoaded)?`<div class="lesson-note" data-drive-loading>教學圖片載入中…</div>`:'';
  if(!imgs.length&&!loading)return '';
  return `<section class="lesson-section"><h3>教學圖片</h3>${imgs.length?imageGrid(imgs):''}${loading}</section>`;
}
function bindImageZoom(){
  document.querySelectorAll('[data-img]').forEach(el=>el.onclick=()=>openZoom(el.dataset.img,el.dataset.name));
}
function openGuide(id,skipLazyLoad=false){
  const g=GUIDES.find(x=>x.id===id);if(!g)return;
  $('#detailCategory').textContent=g.category;
  $('#detailTitle').textContent=`${g.emoji} ${g.title}`;
  $('#detailIntro').textContent=g.intro;
  $('#detailBody').innerHTML=g.sections.map(renderSection).join('')+renderImageGallery(id)+`<div class="lesson-note warn">提醒：遊戲館別、桌型、特殊邊注、派彩與有效投注規則可能不同；實際操作與客服回覆時，仍以玩家當下遊戲畫面／桌面規則為準。</div>`;
  $('#overlay').classList.add('show');$('#detail').classList.add('show');document.body.style.overflow='hidden';
  bindImageZoom();
  if(location.hash!==`#guide=${encodeURIComponent(id)}`)location.hash=`guide=${encodeURIComponent(id)}`;

  // 只有真的打開需要 Drive 圖片的教學時，才下載 4.7MB 圖片壓縮包。
  if(!skipLazyLoad&&DRIVE_IMAGES[id]?.length&&!driveZipLoaded){
    loadDriveImagesFromZip().then(ok=>{
      if(!ok)return;
      renderCards();
      const current=location.hash.startsWith('#guide=')?decodeURIComponent(location.hash.slice(7)):'';
      if(current===id&&$('#detail').classList.contains('show'))openGuide(id,true);
    });
  }
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

function boot(){
  // 首頁先立即顯示，不再等待 4.7MB 圖片 ZIP 下載完成。
  renderAll();
  if(location.hash.startsWith('#guide=')){
    const id=decodeURIComponent(location.hash.slice(7));
    setTimeout(()=>openGuide(id),0);
  }
}
boot();
