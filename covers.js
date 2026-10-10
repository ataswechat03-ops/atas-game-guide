(()=>{
  'use strict';

  const COVER_IMAGES={
    slots:'images/covers/slots.webp',
    baccarat:'images/covers/baccarat.webp',
    sicbo:'images/covers/sicbo.webp',
    roulette:'images/covers/roulette.webp',
    sedie:'images/covers/sedie.webp',
    fantan:'images/covers/fantan.webp',
    football:'images/covers/football.svg',
    'football-europe':'images/covers/europe.svg',
    'football-hongkong':'images/covers/hongkong.svg',
    'football-malay':'images/covers/malay.svg',
    'football-indo':'images/covers/indonesia.webp',
    'football-american':'images/covers/american.webp'
  };

  const style=document.createElement('style');
  style.textContent=`
    .guide-card .cover{
      height:auto!important;
      aspect-ratio:3/1;
      overflow:hidden;
      background:#0c1a2c;
      position:relative
    }
    .guide-card .cover>img{
      display:block;
      width:100%;
      height:100%;
      object-fit:cover;
      object-position:center
    }
    .guide-card .cover .emoji{
      width:100%;height:100%;display:grid;place-items:center;font-size:58px;
      background:linear-gradient(135deg,#142943,#0c1727)
    }
    .guide-card .cover .badge{position:absolute;z-index:2}
  `;
  document.head.appendChild(style);

  const coverUrl=file=>RAW+file.split('/').map(encodeURIComponent).join('/');

  function coverHtml(g){
    const file=COVER_IMAGES[g.id];
    if(!file)return `<span class="emoji">${g.emoji}</span>`;
    return `<img loading="lazy" decoding="async" src="${coverUrl(file)}?v=fix-path-20261010" alt="${esc(g.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="emoji" style="display:none">${g.emoji}</span>`;
  }

  renderCards=function(){
    const list=visibleGuides();
    $('#count').textContent=`共 ${list.length} 篇`;
    $('#sectionTitle').textContent=activeCategory==='全部'?'全部教學':activeCategory;
    $('#empty').style.display=list.length?'none':'block';
    $('#guideGrid').innerHTML=list.map(g=>`<article class="guide-card" data-open="${g.id}"><div class="cover">${coverHtml(g)}<span class="badge">${esc(g.category)}</span></div><div class="card-body"><div class="card-meta">${(g.tags||[]).slice(0,4).map(esc).join(' ・ ')}</div><h3>${esc(g.title)}</h3><p>${esc(g.intro)}</p></div><div class="card-footer"><span>${g.sections.length} 個章節</span><b>查看完整教學 →</b></div></article>`).join('');
    document.querySelectorAll('[data-open]').forEach(c=>c.onclick=()=>openGuide(c.dataset.open));
  };

  renderCards();
})();