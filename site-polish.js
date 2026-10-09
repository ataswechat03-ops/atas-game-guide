(()=>{
  // 1) 搜尋升級：除了標題／標籤，也搜尋章節、公式、範例、表格與備註。
  const textOfSection=s=>{
    const parts=[s.title,s.note];
    (s.boxes||[]).forEach(x=>parts.push(...x));
    (s.list||[]).forEach(x=>parts.push(x));
    if(s.table){parts.push(...(s.table.headers||[]));(s.table.rows||[]).forEach(r=>parts.push(...r));}
    (s.images||[]).forEach(x=>parts.push(x[0]));
    return parts.filter(Boolean).join(' ');
  };
  if(typeof visibleGuides==='function'){
    visibleGuides=function(){
      const q=(query||'').trim().toLowerCase();
      return GUIDES.filter(g=>{
        if(activeCategory!=='全部'&&g.category!==activeCategory)return false;
        if(!q)return true;
        const hay=[g.title,g.category,g.intro,...(g.tags||[]),...(g.sections||[]).map(textOfSection)].join(' ').toLowerCase();
        return hay.includes(q);
      });
    };
  }
  const search=document.querySelector('#q');
  if(search)search.placeholder='搜尋：-105、-0.944、贏半、香港盤、WILD、補牌…';

  // 2) 五種盤口計算結果統一：全部顯示到小數點後 2 位。
  const money=n=>Number.isFinite(n)?`TWD ${Number(n).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—';
  const num=id=>Number(document.querySelector(id)?.value);
  const set=(id,v)=>{const el=document.querySelector(id);if(el)el.textContent=v;};
  function refreshOdds(){
    const euStake=num('#euStake'),euOdds=num('#euOdds');
    if(euStake>0&&euOdds>1){const total=euStake*euOdds;set('#euProfit',money(total-euStake));set('#euTotal',money(total));}
    else if(document.querySelector('#euProfit')){set('#euProfit','—');set('#euTotal','—');}

    const hkStake=num('#hkStake'),hkOdds=num('#hkOdds');
    if(hkStake>0&&hkOdds>=0){const profit=hkStake*hkOdds;set('#hkProfit',money(profit));set('#hkTotal',money(hkStake+profit));}
    else if(document.querySelector('#hkProfit')){set('#hkProfit','—');set('#hkTotal','—');}

    const mlAmount=num('#mlAmount'),mlOdds=num('#mlOdds'),mlMode=document.querySelector('#mlMode')?.value,a=Math.abs(mlOdds);
    if(document.querySelector('#mlOut1')){
      if(mlAmount>0&&a>0){
        if(mlMode==='target'){
          const stake=mlOdds>0?mlAmount/mlOdds:mlAmount*a;
          set('#mlOut1',money(stake));set('#mlOut2',money(stake+mlAmount));
        }else{
          const profit=mlOdds>0?mlAmount*mlOdds:mlAmount/a;
          set('#mlOut1',money(profit));set('#mlOut2',money(mlAmount+profit));
        }
      }else{set('#mlOut1','—');set('#mlOut2','—');}
    }

    const idStake=num('#idStake'),idOdds=num('#idOdds'),ia=Math.abs(idOdds);
    if(document.querySelector('#idProfit')){
      if(idStake>0&&ia>0){const profit=idOdds>0?idStake*idOdds:idStake/ia;set('#idProfit',money(profit));set('#idTotal',money(idStake+profit));}
      else{set('#idProfit','—');set('#idTotal','—');}
    }

    const usStake=num('#usStake'),usOdds=num('#usOdds'),ua=Math.abs(usOdds);
    if(document.querySelector('#usProfit')){
      if(usStake>0&&ua>0){const profit=usOdds>0?usStake*usOdds/100:usStake*100/ua;set('#usProfit',money(profit));set('#usTotal',money(usStake+profit));}
      else{set('#usProfit','—');set('#usTotal','—');}
    }
  }
  document.addEventListener('input',e=>{if(e.target.matches('#euStake,#euOdds,#hkStake,#hkOdds,#mlAmount,#mlOdds,#idStake,#idOdds,#usStake,#usOdds'))setTimeout(refreshOdds,0);});
  document.addEventListener('change',e=>{if(e.target.matches('#mlMode'))setTimeout(refreshOdds,0);});
  setTimeout(refreshOdds,50);

  // 3) 足球基本知識的五種盤口入口可直接點入對應獨立教學。
  const oddsTargets={
    '歐洲盤':'football-europe','香港盤':'football-hongkong','馬來盤':'football-malay','印尼盤':'football-indo','美國盤':'football-american'
  };
  function decorateFootballEntrances(){
    if(!location.hash.includes('guide=football')||location.hash.includes('football-'))return;
    const first=document.querySelector('#detailBody .lesson-section');
    if(!first)return;
    first.querySelectorAll('.lesson-box').forEach(box=>{
      const name=box.querySelector('h4')?.textContent.trim();
      const id=oddsTargets[name];
      if(!id||box.dataset.guideJump)return;
      box.dataset.guideJump=id;
      box.classList.add('guide-jump-box');
      box.setAttribute('role','button');
      box.setAttribute('tabindex','0');
      const go=()=>typeof openGuide==='function'&&openGuide(id);
      box.addEventListener('click',go);
      box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
    });
  }
  const detailBody=document.querySelector('#detailBody');
  if(detailBody)new MutationObserver(()=>setTimeout(decorateFootballEntrances,0)).observe(detailBody,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(decorateFootballEntrances,0));

  // 4) 手機版細節打磨。
  const style=document.createElement('style');
  style.textContent=`
    .guide-jump-box{cursor:pointer;transition:.18s}.guide-jump-box:hover{border-color:#3584ce;background:#132a45;transform:translateY(-1px)}.guide-jump-box:after{content:'點擊進入 →';display:block;margin-top:8px;color:#75baff;font-size:10px;font-weight:800}
    @media(max-width:720px){
      .training-grid{gap:12px}.training-panel{padding:14px;border-radius:15px}.training-panel h3{font-size:17px}.odds-v2-list{gap:9px}.odds-v2{padding:13px;border-radius:12px}.odds-v2 h4{font-size:15px;margin-bottom:10px}.odds-v2 .mini{font-size:10px;line-height:1.65}.calc-field label{font-size:10px}.calc-field input,.calc-field select{min-height:44px;padding:10px 11px;font-size:16px}.odds-v2-result{gap:6px}.odds-v2-result>div{padding:9px}.odds-v2-result span{font-size:9px}.odds-v2-result b{font-size:15px;line-height:1.25}.detail-head{padding:17px 15px}.detail-body{padding:15px}.lesson-section{margin-bottom:18px}.lesson-box{padding:13px}.lesson-box h4{font-size:14px}.lesson-box p{font-size:12px}.football-img b{font-size:11px}.guide-card .cover{height:185px}.toolbar{gap:7px}.search{min-height:46px}.search input{font-size:16px}.hero{padding:22px 18px}.hero h2{font-size:30px;line-height:1.2}.hero p{font-size:12px;line-height:1.7}
    }
  `;
  document.head.appendChild(style);

  if(typeof renderCards==='function')renderCards();
})();
