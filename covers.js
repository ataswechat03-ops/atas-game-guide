(()=>{
  'use strict';
  const COVER_FILES={
    sedie:'色碟玩法一看就懂.webp',
    fantan:'番攤一看就懂_開獎下注教學.png',
    football:'足球讓分一看就懂攻略.png',
    'football-europe':'歐洲盤賠率入門資訊圖表.png',
    'football-hongkong':'香港盤賠率計算入門圖解.png',
    'football-malay':'馬來盤新手速懂足球賠率圖解.png',
    'football-indo':'images/covers/indonesia-new.webp',
    'football-american':'images/covers/american-new.webp'
  };
  const style=document.createElement('style');
  style.textContent=`.guide-card .cover{height:auto!important;aspect-ratio:3/1;overflow:hidden;background:#0c1a2c}.guide-card .cover>img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}.guide-card .cover .emoji{width:100%;height:100%;display:grid;place-items:center;font-size:58px;background:radial-gradient(circle at 65% 20%,#1687ff33,transparent 32%),linear-gradient(135deg,#142943,#0c1727)}`;
  document.head.appendChild(style);
  function coverHtml(g){
    const file=COVER_FILES[g.id];
    if(file)return `<img loading="lazy" decoding="async" src="${imageUrl(file)}?v=3" alt="${esc(g.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="emoji" style="display:none">${g.emoji}</span>`;
    const drive=DRIVE_IMAGES[g.id];
    if(drive?.[0]&&ZIP_URLS[drive[0][1]])return `<img loading="lazy" decoding="async" src="${imageUrl(drive[0][1])}" alt="${esc(g.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="emoji" style="display:none">${g.emoji}</span>`;
    return `<span class="emoji">${g.emoji}</span>`;
  }
  renderCards=function(){
    const list=visibleGuides();$('#count').textContent=`共 ${list.length} 篇`;$('#sectionTitle').textContent=activeCategory==='全部'?'全部教學':activeCategory;$('#empty').style.display=list.length?'none':'block';
    $('#guideGrid').innerHTML=list.map(g=>`<article class="guide-card" data-open="${g.id}"><div class="cover">${coverHtml(g)}<span class="badge">${esc(g.category)}</span></div><div class="card-body"><div class="card-meta">${(g.tags||[]).slice(0,4).map(esc).join(' ・ ')}</div><h3>${esc(g.title)}</h3><p>${esc(g.intro)}</p></div><div class="card-footer"><span>${g.sections.length} 個章節</span><b>查看完整教學 →</b></div></article>`).join('');document.querySelectorAll('[data-open]').forEach(c=>c.onclick=()=>openGuide(c.dataset.open));
  };
  renderCards();loadDriveImagesFromZip().then(ok=>{if(ok)renderCards();});
})();