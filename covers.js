(()=>{
  'use strict';

  const SPRITE_PARTS=[
    'images/covers/cinematic-parts/part00.txt',
    'images/covers/cinematic-parts/part01.txt',
    'images/covers/cinematic-parts/part02.txt',
    'images/covers/cinematic-parts/part04.txt',
    'images/covers/cinematic-parts/part05.txt',
    'images/covers/cinematic-parts/part06_07.txt',
    'images/covers/cinematic-parts/part08.txt',
    'images/covers/cinematic-parts/part09.txt'
  ];

  const SPRITE_POS={
    slots:[0,5.5],
    baccarat:[33.333,5.5],
    sicbo:[66.667,5.5],
    roulette:[100,5.5],
    sedie:[0,50],
    fantan:[33.333,50],
    football:[66.667,50],
    'football-europe':[100,50],
    'football-hongkong':[0,94.5],
    'football-malay':[33.333,94.5],
    'football-indo':[66.667,94.5],
    'football-american':[100,94.5]
  };

  let spriteUrl='';

  const style=document.createElement('style');
  style.textContent=`
    .guide-card .cover{height:auto!important;aspect-ratio:3/1;overflow:hidden;background:#0c1a2c}
    .cinematic-sprite{width:100%;height:100%;background-repeat:no-repeat;background-size:400% auto;background-color:#0c1a2c}
    .cover-loading{width:100%;height:100%;background:linear-gradient(110deg,#101d30 25%,#1b2d46 40%,#101d30 55%);background-size:220% 100%;animation:coverShimmer 1.2s linear infinite}
    @keyframes coverShimmer{to{background-position-x:-220%}}
  `;
  document.head.appendChild(style);

  function coverHtml(g){
    const pos=SPRITE_POS[g.id];
    if(pos&&spriteUrl){
      return `<div class="cinematic-sprite" role="img" aria-label="${esc(g.title)}" style="background-image:url('${spriteUrl}');background-position:${pos[0]}% ${pos[1]}%"></div>`;
    }
    if(pos)return '<div class="cover-loading"></div>';
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
      const parts=await Promise.all(SPRITE_PARTS.map(async path=>{
        const r=await fetch(path+'?v=cinematic2',{cache:'force-cache'});
        if(!r.ok)throw new Error(`${path}: HTTP ${r.status}`);
        return (await r.text()).trim();
      }));
      const b64=parts.join('').replace(/\s+/g,'');
      const bin=atob(b64);
      const bytes=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
      spriteUrl=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
      renderCards();
    }catch(err){
      console.error('電影感封面載入失敗',err);
    }
  }

  renderCards();
  loadSprite();
})();