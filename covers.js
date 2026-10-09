(()=>{
  'use strict';

  // 首頁卡片專用封面：使用 4×3 Sprite；每格皆為 3:1，避免拉伸變形。
  const SPRITE='images/covers/tutorial-covers.webp?v=5';
  const POS={
    slots:[0,0],
    baccarat:[1,0],
    sicbo:[2,0],
    roulette:[3,0],
    sedie:[0,1],
    fantan:[1,1],
    football:[2,1],
    'football-europe':[3,1],
    'football-hongkong':[0,2],
    'football-malay':[1,2],
    'football-indo':[2,2],
    'football-american':[3,2]
  };
  const XP=[0,33.333333,66.666667,100];
  const YP=[0,50,100];

  const style=document.createElement('style');
  style.textContent=`
    .guide-card .cover{height:auto!important;aspect-ratio:3/1;overflow:hidden}
    .cover-sprite{display:block;width:100%;height:100%;background-image:url('${SPRITE}');background-repeat:no-repeat;background-size:400% 300%;background-color:#0c1a2c}
  `;
  document.head.appendChild(style);

  renderCards=function(){
    const list=visibleGuides();
    $('#count').textContent=`共 ${list.length} 篇`;
    $('#sectionTitle').textContent=activeCategory==='全部'?'全部教學':activeCategory;
    $('#empty').style.display=list.length?'none':'block';

    $('#guideGrid').innerHTML=list.map(g=>{
      const pos=POS[g.id];
      let cover='';
      if(pos){
        cover=`<span class="cover-sprite" role="img" aria-label="${esc(g.title)}" style="background-position:${XP[pos[0]]}% ${YP[pos[1]]}%"></span>`;
      }else{
        const custom=CUSTOM_IMAGES[g.id];
        const drive=DRIVE_IMAGES[g.id];
        const customPrimary=custom?.[0];
        const drivePrimary=drive?.[0]&&ZIP_URLS[drive[0][1]]?drive[0]:null;
        const primary=customPrimary||drivePrimary;
        cover=primary
          ? `<img loading="lazy" decoding="async" src="${imageUrl(primary[1])}" alt="${esc(g.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="emoji" style="display:none">${g.emoji}</span>`
          : `<span class="emoji">${g.emoji}</span>`;
      }
      return `<article class="guide-card" data-open="${g.id}"><div class="cover">${cover}<span class="badge">${esc(g.category)}</span></div><div class="card-body"><div class="card-meta">${(g.tags||[]).slice(0,4).map(esc).join(' ・ ')}</div><h3>${esc(g.title)}</h3><p>${esc(g.intro)}</p></div><div class="card-footer"><span>${g.sections.length} 個章節</span><b>查看完整教學 →</b></div></article>`;
    }).join('');

    document.querySelectorAll('[data-open]').forEach(c=>c.onclick=()=>openGuide(c.dataset.open));
  };

  renderCards();
})();
