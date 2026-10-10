(()=>{
  'use strict';

  const money=n=>Number.isFinite(n)?`TWD ${Number(n).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—';
  const fmt=n=>Number.isFinite(n)?Number(n).toLocaleString('zh-TW',{maximumFractionDigits:6}):'—';

  const MARKETS={
    europe:{name:'歐洲盤',label:'歐洲盤賠率',def:1.90,placeholder:'例如 1.90',valid:o=>o>1,
      profit:(s,o)=>s*(o-1),formula:'淨利＝本金 ×（賠率 − 1）',note:'歐洲盤賠率包含本金。1.90 代表下注 100，全贏總返還 190，淨利 90。'},
    hk:{name:'香港盤',label:'香港盤賠率',def:0.90,placeholder:'例如 0.90',valid:o=>o>=0,
      profit:(s,o)=>s*o,formula:'淨利＝本金 × 賠率',note:'香港盤顯示淨利倍率。0.90 代表下注 100，全贏淨利 90。'},
    malay:{name:'馬來盤',label:'馬來盤賠率',def:-0.944,placeholder:'例如 +0.90 或 -0.944',valid:o=>o!==0&&Math.abs(o)<=1,
      profit:(s,o)=>o>0?s*o:s/Math.abs(o),formula:'正數：本金 × 賠率；負數：本金 ÷ |賠率|',note:'標準馬來盤的絕對值不超過 1。例：-0.944，下注 94.40，全贏淨利 100。'},
    indo:{name:'印尼盤',label:'印尼盤賠率',def:-1.25,placeholder:'例如 +1.20 或 -1.25',valid:o=>o!==0&&Math.abs(o)>=1,
      profit:(s,o)=>o>0?s*o:s/Math.abs(o),formula:'正數：本金 × 賠率；負數：本金 ÷ |賠率|',note:'標準印尼盤通常絕對值不小於 1。例：-1.25，下注 100，全贏淨利 80。'},
    american:{name:'美國盤',label:'美國盤賠率',def:-105,placeholder:'例如 +120 或 -105',valid:o=>o!==0&&Math.abs(o)>=100,
      profit:(s,o)=>o>0?s*(o/100):s*(100/Math.abs(o)),formula:'正數：本金 × 賠率 ÷ 100；負數：本金 × 100 ÷ |賠率|',note:'美國盤 +120：下注 100 淨贏 120；-105：下注 105 淨贏 100。'}
  };

  const ORDER=['europe','hk','malay','indo','american'];
  const GUIDE_MAP={'football-europe':'europe','football-hongkong':'hk','football-malay':'malay','football-indo':'indo','football-american':'american'};
  const SETTLES=[['win','全贏'],['halfwin','贏半'],['push','走水'],['halfloss','輸半'],['loss','全輸']];

  function settlement(stake,fullProfit,status){
    if(status==='halfwin')return {net:fullProfit/2,total:stake+fullProfit/2,desc:'一半本金全贏＋一半本金退回'};
    if(status==='push')return {net:0,total:stake,desc:'本金全數退回'};
    if(status==='halfloss')return {net:-stake/2,total:stake/2,desc:'一半本金輸掉＋一半本金退回'};
    if(status==='loss')return {net:-stake,total:0,desc:'本金全輸'};
    return {net:fullProfit,total:stake+fullProfit,desc:'整筆本金按賠率全贏'};
  }

  function calc(kind,stake,odds,status){
    const c=MARKETS[kind];
    if(!(stake>=0)||!Number.isFinite(stake)||!Number.isFinite(odds)||!c.valid(odds))return {error:true};
    const fullProfit=c.profit(stake,odds);
    const r=settlement(stake,fullProfit,status);
    return {...r,fullProfit};
  }

  function styleOnce(){
    if(document.querySelector('#odds-standard-style'))return;
    const s=document.createElement('style');s.id='odds-standard-style';s.textContent=`
      .std-odds{border:1px solid #294866;background:linear-gradient(180deg,#0c1d31,#091727);border-radius:16px;padding:14px;margin-top:10px}
      .std-odds-tabs{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-bottom:12px}.std-odds-tab{border:1px solid #284663;background:#0a192a;color:#a9bad0;border-radius:10px;padding:9px 6px;font-weight:800;cursor:pointer}.std-odds-tab.active{background:#177eea;border-color:#2d93ff;color:#fff}
      .std-odds h4{margin:0 0 10px;font-size:17px}.std-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.std-field label,.std-settle-label{display:block;color:#8fa6bf;font-size:10px;margin-bottom:6px}.std-field input{width:100%;box-sizing:border-box;background:#081526;color:#fff;border:1px solid #284663;border-radius:10px;padding:11px 12px;font-size:16px}
      .std-settles{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:10px}.std-settle{border:1px solid #284663;background:#0a192a;color:#a9bad0;border-radius:9px;padding:9px 6px;font-size:12px;font-weight:800;cursor:pointer}.std-settle.active{background:#177eea;border-color:#2d93ff;color:#fff}
      .std-results{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:10px}.std-result{background:#102945;border-radius:11px;padding:10px}.std-result span{display:block;color:#7f9ab5;font-size:9px}.std-result b{display:block;margin-top:3px;font-size:17px;color:#56e39f}.std-result b.neg{color:#ff8792}
      .std-note{margin:10px 0 0;color:#8da0b6;font-size:10px;line-height:1.65}.std-note strong{color:#dceaff}.std-error{color:#ff9b9b!important}
      @media(max-width:720px){.std-odds-tabs{display:flex;overflow-x:auto}.std-odds-tab{flex:0 0 auto;min-width:78px}.std-grid{grid-template-columns:1fr}.std-settles{grid-template-columns:repeat(3,1fr)}}
    `;document.head.appendChild(s);
  }

  function shell(kind,showTabs){
    const c=MARKETS[kind];
    return `<div class="std-odds" data-std-odds="${kind}">
      ${showTabs?`<div class="std-odds-tabs">${ORDER.map(k=>`<button type="button" class="std-odds-tab ${k===kind?'active':''}" data-kind="${k}">${MARKETS[k].name}</button>`).join('')}</div>`:''}
      <h4>${c.name}計算器</h4>
      <div class="std-grid"><div class="std-field"><label>下注本金（TWD）</label><input data-role="stake" type="number" step="any" value="${kind==='malay'?94.4:100}"></div><div class="std-field"><label>${c.label}</label><input data-role="odds" type="number" step="any" value="${c.def}" placeholder="${c.placeholder}"></div></div>
      <div style="margin-top:10px"><span class="std-settle-label">結算結果</span><div class="std-settles">${SETTLES.map(([v,t],i)=>`<button type="button" class="std-settle ${i?'':'active'}" data-settle="${v}">${t}</button>`).join('')}</div></div>
      <div class="std-results"><div class="std-result"><span>淨利／虧損</span><b data-role="net">—</b></div><div class="std-result"><span>總返還</span><b data-role="total">—</b></div></div>
      <p class="std-note" data-role="note"></p>
    </div>`;
  }

  function bind(box,onKindChange){
    let kind=box.dataset.stdOdds;let status='win';
    const stake=box.querySelector('[data-role=stake]'),odds=box.querySelector('[data-role=odds]'),net=box.querySelector('[data-role=net]'),total=box.querySelector('[data-role=total]'),note=box.querySelector('[data-role=note]');
    const update=()=>{
      const c=MARKETS[kind],s=Number(stake.value),o=Number(odds.value),r=calc(kind,s,o,status);
      if(r.error){net.textContent='請檢查輸入';total.textContent='—';net.classList.add('std-error');note.innerHTML=`<strong>${c.name}有效範圍：</strong>${kind==='europe'?'賠率需大於 1':kind==='hk'?'賠率需為 0 或正數':kind==='malay'?'賠率介於 -1 到 +1，且不可為 0':kind==='indo'?'賠率絕對值需 ≥ 1':'賠率絕對值需 ≥ 100'}。`;return;}
      net.classList.remove('std-error','neg');total.classList.remove('neg');if(r.net<0)net.classList.add('neg');
      net.textContent=money(r.net);total.textContent=money(r.total);
      note.innerHTML=`<strong>${r.desc}</strong><br>${c.formula}。全贏淨利：${money(r.fullProfit)}。${c.note}`;
    };
    box.querySelectorAll('[data-settle]').forEach(b=>b.onclick=()=>{status=b.dataset.settle;box.querySelectorAll('[data-settle]').forEach(x=>x.classList.toggle('active',x===b));update();});
    box.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{const next=b.dataset.kind;if(next===kind)return;onKindChange?.(next);});
    [stake,odds].forEach(x=>{x.oninput=update;x.onchange=update});update();
  }

  function rebuildTop(){
    const old=document.querySelector('.odds-v2-list');
    if(!old||document.querySelector('#std-top-wrap'))return;
    const panel=old.closest('.training-panel')||old.parentElement;if(!panel)return;
    panel.innerHTML=`<span class="tool-tag">快速工具</span><h3>五種盤口｜標準計算</h3><p class="hint">重新製作：只保留「下注本金＋賠率＋結算結果」，全部依各盤口標準公式計算。</p><div id="std-top-wrap"></div>`;
    const wrap=panel.querySelector('#std-top-wrap');
    const render=kind=>{wrap.innerHTML=shell(kind,true);bind(wrap.firstElementChild,render);};
    render('europe');
  }

  function injectStandalone(){
    const id=location.hash.startsWith('#guide=')?decodeURIComponent(location.hash.slice(7)):'';
    const kind=GUIDE_MAP[id];if(!kind)return;
    const body=document.querySelector('#detailBody');if(!body||body.querySelector('.std-standalone'))return;
    const holder=document.createElement('div');holder.className='std-standalone';holder.innerHTML=shell(kind,false);body.prepend(holder);bind(holder.firstElementChild);
  }

  styleOnce();
  setTimeout(()=>{rebuildTop();injectStandalone();},120);
  const body=document.querySelector('#detailBody');if(body)new MutationObserver(()=>setTimeout(injectStandalone,0)).observe(body,{childList:true,subtree:false});
})();