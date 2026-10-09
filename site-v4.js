(()=>{
  'use strict';

  // ===== 搜尋：可找到章節、公式、範例、備註 =====
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

  // ===== 共用樣式 =====
  const style=document.createElement('style');
  style.textContent=`
    .guide-jump-box{cursor:pointer;transition:.18s}.guide-jump-box:hover{border-color:#3584ce;background:#132a45;transform:translateY(-1px)}.guide-jump-box:after{content:'點擊進入 →';display:block;margin-top:8px;color:#75baff;font-size:10px;font-weight:800}
    .odds-tabs-wrap{margin-top:10px}.odds-tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin-bottom:10px}.odds-tab{border:1px solid #29435f;background:#0b192b;color:#9fb0c4;border-radius:10px;padding:9px 6px;font-size:10px;font-weight:850;cursor:pointer;transition:.18s;white-space:nowrap}.odds-tab:hover{border-color:#3b6d9f;color:#fff}.odds-tab.active{background:linear-gradient(135deg,#1687ff,#0d67cb);border-color:#2589ef;color:#fff;box-shadow:0 8px 24px #1687ff28}.odds-v2-list.compact .odds-v2{display:none;margin:0}.odds-v2-list.compact .odds-v2.active{display:block}.odds-quick-note{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid #213a56;background:#0a1728;border-radius:11px;padding:9px 10px;margin-bottom:9px;color:#91a5bc;font-size:9px}.odds-quick-note b{color:#dceaff;font-size:10px}
    .settlement-field{margin:8px 0 7px}.settlement-help{margin:7px 0 0;color:#7188a3;font-size:9px;line-height:1.55}.settlement-help strong{color:#cfe6ff}.result-negative{color:#ff8792!important}.result-positive{color:#78e19d!important}
    .guide-prev-next{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:20px 0 4px;padding-top:15px;border-top:1px solid #20354e}.guide-prev-next button{min-width:0;border:1px solid #29445f;background:#0e1d31;color:#d9eaff;border-radius:11px;padding:11px 12px;cursor:pointer;text-align:left;transition:.18s}.guide-prev-next button:last-child{text-align:right}.guide-prev-next button:hover{border-color:#3986cc;background:#132945}.guide-prev-next small{display:block;color:#71859e;font-size:9px;margin-bottom:4px}.guide-prev-next b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px}.guide-prev-next .disabled{visibility:hidden}
    @media(max-width:720px){
      .training-grid{gap:12px}.training-panel{padding:14px;border-radius:15px}.training-panel h3{font-size:17px}.odds-v2-list{gap:9px}.odds-v2{padding:11px;border-radius:12px}.odds-v2 h4{font-size:15px;margin-bottom:10px}.odds-v2 .mini,.settlement-help{font-size:10px;line-height:1.65}.calc-field label{font-size:10px}.calc-field input,.calc-field select{min-height:44px;padding:10px 11px;font-size:16px}.odds-v2-result{gap:6px}.odds-v2-result>div{padding:9px}.odds-v2-result span{font-size:9px}.odds-v2-result b{font-size:15px;line-height:1.25}.detail-head{padding:17px 15px}.detail-body{padding:15px}.lesson-section{margin-bottom:18px}.lesson-box{padding:13px}.lesson-box h4{font-size:14px}.lesson-box p{font-size:12px}.football-img b{font-size:11px}.guide-card .cover{height:185px}.toolbar{gap:7px}.search{min-height:46px}.search input{font-size:16px}.hero{padding:22px 18px}.hero h2{font-size:30px;line-height:1.2}.hero p{font-size:12px;line-height:1.7}.odds-tabs{display:flex;overflow-x:auto;gap:6px;padding-bottom:3px;scrollbar-width:none}.odds-tabs::-webkit-scrollbar{display:none}.odds-tab{flex:0 0 auto;min-width:78px;padding:9px 12px}.guide-prev-next{grid-template-columns:1fr 1fr;gap:7px}.guide-prev-next button{padding:10px}
    }
  `;
  document.head.appendChild(style);

  // ===== 足球基本知識：五種盤口入口可直接點 =====
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
      box.dataset.guideJump=id;box.classList.add('guide-jump-box');box.setAttribute('role','button');box.setAttribute('tabindex','0');
      const go=()=>typeof openGuide==='function'&&openGuide(id);
      box.addEventListener('click',go);
      box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
    });
  }

  // ===== 五種盤口：分頁 + 贏半 / 輸半 / 走盤 =====
  const list=document.querySelector('.odds-v2-list');
  const money=n=>Number.isFinite(n)?`TWD ${Number(n).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—';
  const n=id=>Number(document.querySelector(id)?.value);
  const set=(id,value)=>{const el=document.querySelector(id);if(el)el.textContent=value;};
  const setResultClass=(id,value)=>{const el=document.querySelector(id);if(!el)return;el.classList.toggle('result-negative',value<0);el.classList.toggle('result-positive',value>0);};
  const SETTLE_OPTIONS=`<option value="win">全贏</option><option value="halfwin">贏半</option><option value="push">走盤</option><option value="halfloss">輸半</option><option value="loss">全輸</option>`;
  const settle=(stake,profit,status)=>{
    if(status==='halfwin')return {net:profit/2,total:stake+profit/2};
    if(status==='push')return {net:0,total:stake};
    if(status==='halfloss')return {net:-stake/2,total:stake/2};
    if(status==='loss')return {net:-stake,total:0};
    return {net:profit,total:stake+profit};
  };

  const calcDefs=[
    {name:'歐洲盤',stake:'#euStake',odds:'#euOdds',out1:'#euProfit',out2:'#euTotal',full:(s,o)=>o>1?s*(o-1):NaN},
    {name:'香港盤',stake:'#hkStake',odds:'#hkOdds',out1:'#hkProfit',out2:'#hkTotal',full:(s,o)=>o>=0?s*o:NaN},
    {name:'馬來盤',stake:'#mlAmount',odds:'#mlOdds',out1:'#mlOut1',out2:'#mlOut2',full:(s,o)=>o>0?s*o:o<0?s/Math.abs(o):NaN,malay:true},
    {name:'印尼盤',stake:'#idStake',odds:'#idOdds',out1:'#idProfit',out2:'#idTotal',full:(s,o)=>o>0?s*o:o<0?s/Math.abs(o):NaN},
    {name:'美國盤',stake:'#usStake',odds:'#usOdds',out1:'#usProfit',out2:'#usTotal',full:(s,o)=>o>0?s*o/100:o<0?s*100/Math.abs(o):NaN}
  ];

  if(list&&!list.dataset.v4Ready){
    list.dataset.v4Ready='1';
    const cards=[...list.querySelectorAll('.odds-v2')];
    cards.forEach((card,i)=>{
      const result=card.querySelector('.odds-v2-result');
      if(!result)return;
      const field=document.createElement('div');
      field.className='calc-field settlement-field';
      field.innerHTML=`<label>結算結果</label><select class="settlement-select" data-settle-index="${i}">${SETTLE_OPTIONS}</select><p class="settlement-help"><strong>贏半</strong>＝一半本金贏、一半退回；<strong>輸半</strong>＝一半本金輸、一半退回。</p>`;
      result.before(field);
      const spans=result.querySelectorAll('span');
      if(i!==2&&spans[0])spans[0].textContent='淨結果';
      if(spans[1])spans[1].textContent='總返還';
    });

    const names=cards.map(card=>card.querySelector('h4')?.textContent.replace('計算器','').trim()||'盤口');
    const wrap=document.createElement('div');
    wrap.className='odds-tabs-wrap';
    wrap.innerHTML=`<div class="odds-quick-note"><span>一次只顯示一種盤口；可選全贏、贏半、走盤、輸半、全輸。</span><b id="oddsActiveLabel"></b></div><div class="odds-tabs" role="tablist">${names.map((name,i)=>`<button class="odds-tab" type="button" data-odds-tab="${i}" role="tab">${name}</button>`).join('')}</div>`;
    list.parentNode.insertBefore(wrap,list);list.classList.add('compact');
    const tabs=[...wrap.querySelectorAll('.odds-tab')],label=wrap.querySelector('#oddsActiveLabel');
    function activate(index){
      cards.forEach((card,i)=>card.classList.toggle('active',i===index));
      tabs.forEach((tab,i)=>{tab.classList.toggle('active',i===index);tab.setAttribute('aria-selected',i===index?'true':'false');});
      if(label)label.textContent=names[index]||'';
    }
    tabs.forEach((tab,i)=>tab.addEventListener('click',()=>activate(i)));
    activate(0); // 預設歐洲盤
  }

  function recalcAll(){
    calcDefs.forEach((d,i)=>{
      const card=list?.querySelectorAll('.odds-v2')?.[i];
      if(!card)return;
      const status=card.querySelector('.settlement-select')?.value||'win';
      const stake=n(d.stake),odds=n(d.odds);

      // 馬來盤「想淨贏多少」是反推模式，不套用半贏半輸。
      if(d.malay&&document.querySelector('#mlMode')?.value==='target'){
        const sel=card.querySelector('.settlement-select');if(sel){sel.value='win';sel.disabled=true;}
        const amount=stake,a=Math.abs(odds),required=odds>0?amount/odds:odds<0?amount*a:NaN;
        const l1=document.querySelector('#mlOut1Label'),l2=document.querySelector('#mlOut2Label');
        if(l1)l1.textContent='所需下注';if(l2)l2.textContent='中獎總返還';
        set(d.out1,money(required));set(d.out2,money(required+amount));setResultClass(d.out1,required);setResultClass(d.out2,required+amount);
        return;
      }
      if(d.malay){
        const sel=card.querySelector('.settlement-select');if(sel)sel.disabled=false;
        const l1=document.querySelector('#mlOut1Label'),l2=document.querySelector('#mlOut2Label');
        if(l1)l1.textContent='淨結果';if(l2)l2.textContent='總返還';
      }
      const profit=(stake>0)?d.full(stake,odds):NaN;
      if(!Number.isFinite(profit)){set(d.out1,'—');set(d.out2,'—');return;}
      const r=settle(stake,profit,status);
      set(d.out1,money(r.net));set(d.out2,money(r.total));setResultClass(d.out1,r.net);setResultClass(d.out2,r.total);
    });
  }
  document.addEventListener('input',e=>{if(e.target.matches('#euStake,#euOdds,#hkStake,#hkOdds,#mlAmount,#mlOdds,#idStake,#idOdds,#usStake,#usOdds'))setTimeout(recalcAll,0);});
  document.addEventListener('change',e=>{if(e.target.matches('#mlMode,.settlement-select'))setTimeout(recalcAll,0);});
  setTimeout(recalcAll,60);

  // ===== 每篇教學：上一篇 / 下一篇 =====
  function currentGuideId(){
    if(!location.hash.startsWith('#guide='))return '';
    try{return decodeURIComponent(location.hash.slice(7));}catch{return '';}
  }
  function injectPrevNext(){
    const body=document.querySelector('#detailBody');
    if(!body||body.querySelector('.guide-prev-next'))return;
    const id=currentGuideId(),idx=GUIDES.findIndex(g=>g.id===id);if(idx<0)return;
    const prev=GUIDES[idx-1],next=GUIDES[idx+1];
    const nav=document.createElement('div');nav.className='guide-prev-next';
    nav.innerHTML=`${prev?`<button type="button" data-next-guide="${esc(prev.id)}"><small>← 上一篇</small><b>${esc(prev.title)}</b></button>`:'<button class="disabled"></button>'}${next?`<button type="button" data-next-guide="${esc(next.id)}"><small>下一篇 →</small><b>${esc(next.title)}</b></button>`:'<button class="disabled"></button>'}`;
    body.appendChild(nav);
    nav.querySelectorAll('[data-next-guide]').forEach(btn=>btn.addEventListener('click',()=>openGuide(btn.dataset.nextGuide)));
  }

  const detailBody=document.querySelector('#detailBody');
  if(detailBody)new MutationObserver(()=>setTimeout(()=>{decorateFootballEntrances();injectPrevNext();},0)).observe(detailBody,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(()=>{decorateFootballEntrances();injectPrevNext();},0));
  setTimeout(()=>{decorateFootballEntrances();injectPrevNext();},100);

  if(typeof renderCards==='function')renderCards();
})();
