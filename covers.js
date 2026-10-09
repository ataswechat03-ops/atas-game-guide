(()=>{
  'use strict';

  // 印尼盤、美國盤沿用已修正的獨立圖片；其餘 10 張改成各自專屬的 SVG 封面，避免裁切與模糊。
  const IMAGE_COVERS={
    'football-indo':'images/covers/indonesia-new.webp',
    'football-american':'images/covers/american-new.webp'
  };

  const THEMES={
    slots:{title:'老虎機基本計算知識',sub:'LINE · WAYS · CLUSTER · WILD',a:'#2a1100',b:'#a64800',accent:'#ffd66b',kind:'slots'},
    baccarat:{title:'百家樂',sub:'莊 · 閒 · 和 · 側牌',a:'#0f0a05',b:'#5f2d0f',accent:'#f7d783',kind:'baccarat'},
    sicbo:{title:'骰寶',sub:'大小 · 單雙 · 圍骰 · 組合',a:'#280700',b:'#941d13',accent:'#ffd36a',kind:'sicbo'},
    roulette:{title:'輪盤',sub:'直注 · 分注 · 街注 · 角注',a:'#07150d',b:'#173f2d',accent:'#e8c66d',kind:'roulette'},
    sedie:{title:'色碟',sub:'紅白 · 單雙 · 指定組合',a:'#240506',b:'#771514',accent:'#ffd678',kind:'sedie'},
    fantan:{title:'番攤',sub:'番 · 念 · 角 · 餘數',a:'#1a0805',b:'#5b2415',accent:'#efc56d',kind:'fantan'},
    football:{title:'足球基本知識',sub:'規則 · 玩法 · 賽事 · 術語',a:'#031c35',b:'#075f8a',accent:'#f3d98b',kind:'football'},
    'football-europe':{title:'歐洲盤',sub:'1X2 · 小數賠率 · 總返還',a:'#061a3d',b:'#0e5ba6',accent:'#e7f2ff',kind:'europe'},
    'football-hongkong':{title:'香港盤',sub:'淨利賠率 · 快速計算',a:'#071d17',b:'#08755a',accent:'#f5ce72',kind:'hongkong'},
    'football-malay':{title:'馬來盤',sub:'正負賠率 · 快速看懂',a:'#082414',b:'#16843c',accent:'#ffd86d',kind:'malay'}
  };

  const escXml=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]));

  function art(kind,accent){
    if(kind==='slots')return `<g transform="translate(760 75)"><rect width="350" height="250" rx="28" fill="#120c08" stroke="${accent}" stroke-width="5"/><rect x="22" y="28" width="92" height="160" rx="16" fill="#4e0b05"/><rect x="129" y="28" width="92" height="160" rx="16" fill="#4e0b05"/><rect x="236" y="28" width="92" height="160" rx="16" fill="#4e0b05"/><text x="68" y="142" text-anchor="middle" font-size="94" font-weight="900" fill="#ffdf72">7</text><text x="175" y="142" text-anchor="middle" font-size="94" font-weight="900" fill="#ffdf72">7</text><text x="282" y="142" text-anchor="middle" font-size="94" font-weight="900" fill="#ffdf72">7</text><text x="175" y="225" text-anchor="middle" font-size="34" font-weight="800" fill="#fff1bd">WILD</text></g>`;
    if(kind==='baccarat')return `<g transform="translate(770 78)"><rect x="0" y="18" width="145" height="205" rx="18" fill="#fff" transform="rotate(-8 72 120)"/><text x="24" y="78" font-size="46" font-weight="900" fill="#111">A♠</text><rect x="170" y="8" width="145" height="205" rx="18" fill="#fff" transform="rotate(8 242 110)"/><text x="194" y="72" font-size="46" font-weight="900" fill="#a00">K♥</text><text x="156" y="260" text-anchor="middle" font-size="34" fill="${accent}">PLAYER   VS   BANKER</text></g>`;
    if(kind==='sicbo')return `<g transform="translate(775 100)" fill="#fff" stroke="${accent}" stroke-width="5"><rect width="130" height="130" rx="24"/><rect x="155" y="20" width="130" height="130" rx="24"/><rect x="305" y="-5" width="130" height="130" rx="24"/><g fill="#b31e13" stroke="none"><circle cx="36" cy="36" r="12"/><circle cx="94" cy="94" r="12"/><circle cx="220" cy="85" r="12"/><circle cx="350" cy="35" r="12"/><circle cx="370" cy="60" r="12"/><circle cx="390" cy="85" r="12"/></g></g>`;
    if(kind==='roulette')return `<g transform="translate(850 200)"><circle r="150" fill="#2a160c" stroke="${accent}" stroke-width="12"/><circle r="112" fill="#7a1010" stroke="#111" stroke-width="24"/><circle r="58" fill="#111" stroke="${accent}" stroke-width="6"/><g stroke="${accent}" stroke-width="5">${Array.from({length:12},(_,i)=>`<line x1="0" y1="-112" x2="0" y2="-145" transform="rotate(${i*30})"/>`).join('')}</g><circle r="14" fill="#fff" transform="translate(0 -122)"/></g>`;
    if(kind==='sedie')return `<g transform="translate(785 105)"><ellipse cx="170" cy="130" rx="215" ry="105" fill="#140b0b" stroke="${accent}" stroke-width="6"/><circle cx="85" cy="110" r="58" fill="#cf2424"/><circle cx="195" cy="95" r="58" fill="#fff"/><circle cx="135" cy="170" r="58" fill="#fff"/><circle cx="245" cy="165" r="58" fill="#cf2424"/></g>`;
    if(kind==='fantan')return `<g transform="translate(760 80)"><rect width="390" height="240" rx="24" fill="#5d130d" stroke="${accent}" stroke-width="5"/><g fill="#f3ede0">${[[65,65],[120,95],[190,62],[255,104],[310,70],[95,155],[165,165],[245,160],[325,155]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="27" ry="20"/>`).join('')}</g><text x="195" y="218" text-anchor="middle" font-size="31" font-weight="800" fill="${accent}">4 · 3 · 2 · 1</text></g>`;
    if(kind==='football')return `<g transform="translate(815 90)"><circle cx="150" cy="110" r="105" fill="#f5f5f5" stroke="#0b2940" stroke-width="10"/><polygon points="150,48 190,78 174,126 126,126 110,78" fill="#13283a"/><path d="M110 78 L64 60 M190 78 L236 60 M126 126 L92 174 M174 126 L208 174" stroke="#13283a" stroke-width="12" fill="none"/><path d="M30 255 C150 190 270 315 390 225" stroke="${accent}" stroke-width="8" fill="none" stroke-dasharray="16 12"/></g>`;
    const odds=kind==='europe'?[['1','1.90'],['X','3.40'],['2','2.50']]:kind==='hongkong'?[['主隊 -0.5','0.90'],['客隊 +0.5','0.90']]:[['主隊 -1','-0.90'],['客隊 +1','0.90']];
    return `<g transform="translate(730 80)"><rect width="420" height="245" rx="24" fill="#071526" stroke="${accent}" stroke-width="5"/>${odds.map((r,i)=>`<rect x="24" y="${28+i*68}" width="372" height="56" rx="12" fill="${i%2?'#102742':'#0b1d34'}"/><text x="48" y="${67+i*68}" font-size="28" font-weight="800" fill="#e9f4ff">${r[0]}</text><text x="365" y="${67+i*68}" text-anchor="end" font-size="34" font-weight="900" fill="${accent}">${r[1]}</text>`).join('')}</g>`;
  }

  function svgData(id){
    const t=THEMES[id];
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
      <defs>
        <linearGradient id="g" x1="0" x2="1"><stop stop-color="${t.a}"/><stop offset="1" stop-color="${t.b}"/></linearGradient>
        <radialGradient id="r"><stop stop-color="${t.accent}" stop-opacity=".26"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="1200" height="400" rx="28" fill="url(#g)"/>
      <circle cx="190" cy="95" r="260" fill="url(#r)"/>
      <g opacity=".12" stroke="${t.accent}">${Array.from({length:16},(_,i)=>`<line x1="${i*85}" y1="0" x2="${i*85-180}" y2="400"/>`).join('')}</g>
      <rect x="42" y="34" width="255" height="54" rx="27" fill="#06101dcc" stroke="${t.accent}" stroke-width="2"/>
      <text x="170" y="70" text-anchor="middle" font-size="25" font-weight="800" fill="${t.accent}">ATAS 遊戲教學</text>
      <text x="55" y="205" font-family="Arial,'Microsoft JhengHei',sans-serif" font-size="68" font-weight="900" fill="${t.accent}" filter="url(#glow)">${escXml(t.title)}</text>
      <line x1="58" y1="238" x2="650" y2="238" stroke="${t.accent}" stroke-width="3" opacity=".8"/>
      <text x="60" y="294" font-family="Arial,'Microsoft JhengHei',sans-serif" font-size="29" font-weight="700" fill="#fff4d2">${escXml(t.sub)}</text>
      ${art(t.kind,t.accent)}
      <rect x="0" y="356" width="1200" height="44" fill="#02081266"/>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }

  const style=document.createElement('style');
  style.textContent=`.guide-card .cover{height:auto!important;aspect-ratio:3/1;overflow:hidden;background:#0c1a2c}.guide-card .cover>img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}.guide-card .cover .emoji{width:100%;height:100%;display:grid;place-items:center;font-size:58px;background:linear-gradient(135deg,#142943,#0c1727)}`;
  document.head.appendChild(style);

  function coverHtml(g){
    if(THEMES[g.id]) return `<img loading="lazy" decoding="async" src="${svgData(g.id)}" alt="${esc(g.title)}">`;
    const file=IMAGE_COVERS[g.id];
    if(file) return `<img loading="lazy" decoding="async" src="${imageUrl(file)}?v=4" alt="${esc(g.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="emoji" style="display:none">${g.emoji}</span>`;
    return `<span class="emoji">${g.emoji}</span>`;
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