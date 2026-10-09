(()=>{
  'use strict';

  const ORDER=[
    'slots','baccarat','sicbo','roulette',
    'sedie','fantan','football','football-europe',
    'football-hongkong','football-malay','football-indo','football-american'
  ];

  const SPRITE_PARTS=[
    'part00.txt','part01.txt','part02.txt','part03.txt','part04.txt','part05.txt',
    'part06_07.txt','part08.txt','part09.txt','part10.txt','part11.txt','part12.txt'
  ];

  let spriteUrl='';

  const style=document.createElement('style');
  style.textContent=`
    .guide-card .cover{
      height:auto!important;
      aspect-ratio:2.265/1;
      overflow:hidden;
      background:#0c1a2c;
      position:relative
    }
    .guide-card .cover-art{
      position:absolute;
      inset:0;
      background-repeat:no-repeat;
      background-size:400% 300%;
      background-color:#0c1a2c
    }
    .guide-card .cover .emoji{
      width:100%;height:100%;display:grid;place-items:center;font-size:58px;
      background:linear-gradient(135deg,#142943,#0c1727)
    }
    .guide-card .cover .badge{position:absolute;z-index:2}
    .cover-loading{
      position:absolute;inset:0;
      background:linear-gradient(110deg,#101d30 25%,#1b2d46 40%,#101d30 55%);
      background-size:220% 100%;animation:coverShimmer 1.2s linear infinite
    }
    @keyframes coverShimmer{to{background-position-x:-220%}}
  `;
  document.head.appendChild(style);

  function pos(id){
    const i=ORDER.indexOf(id);
    if(i<0)return null;
    const col=i%4;
    const row=Math.floor(i/4);
    return `${col*100/3}% ${row*50}%`;
  }

  function coverHtml(g){
    const p=pos(g.id);
    if(spriteUrl&&p){
      return `<div class="cover-art" style="background-image:url('${spriteUrl}');background-position:${p}" role="img" aria-label="${esc(g.title)}"></div>`;
    }
    if(p)return '<div class="cover-loading"></div>';
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

  async function loadSprite(){
    try{
      const base='images/covers/cinematic-parts/';
      const parts=await Promise.all(SPRITE_PARTS.map(async file=>{
        const r=await fetch(`${base}${file}?v=cinematic3`,{cache:'no-store'});
        if(!r.ok)throw new Error(`${file}: ${r.status}`);
        return (await r.text()).trim();
      }));
      const b64=parts.join('').replace(/\s+/g,'');
      const bin=atob(b64);
      const bytes=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
      spriteUrl=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
      renderCards();
    }catch(err){
      console.warn('Cinematic covers failed to load:',err);
      renderCards();
    }
  }

  renderCards();
  loadSprite();
})();