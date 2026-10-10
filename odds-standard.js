(()=>{
  'use strict';

  const money=n=>Number.isFinite(n)?`TWD ${Number(n).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—';

  const MARKETS={
    europe:{name:'歐洲盤',label:'歐洲盤賠率',def:1.90,placeholder:'例如 1.90',valid:o=>o>1},
    hk:{name:'香港盤',label:'香港盤賠率',def:0.90,placeholder:'例如 0.90',valid:o=>o>=0},
    malay:{name:'馬來盤',label:'馬來盤賠率',def:-0.944,placeholder:'例如 +0.90 或 -0.944',valid:o=>o!==0&&Math.abs(o)<=1},
    indo:{name:'印尼盤',label:'印尼盤賠率',def:-1.14,placeholder:'例如 +1.20 或 -1.14',valid:o=>o!==0&&Math.abs(o)>=1},
    american:{name:'美國盤',label:'美國盤賠率',def:-114,placeholder:'例如 +120 或 -114',valid:o=>o!==0&&Math.abs(o)>=100}
  };

  const ORDER=['europe','hk','malay','indo','american'];
  const GUIDE_MAP={'football-europe':'europe','football-hongkong':'hk','football-malay':'malay','football-indo':'indo','football-american':'american'};
  const SETTLES=[['win','全贏'],['halfwin','贏半'],['push','走水'],['halfloss','輸半'],['loss','全輸']];

  const negativeRatio=(kind,o)=>kind==='american'?Math.abs(o)/100:Math.abs(o);
  const isFbNegative=(kind,o)=>(kind==='malay'||kind==='indo'||kind==='american')&&o<0;

  function calc(kind,base,odds,status){
    const c=MARKETS[kind];
    if(!(base>=0)||!Number.isFinite(base)||!Number.isFinite(odds)||!c.valid(odds))return {error:true};

    let risk=base,fullProfit=0,formula='',mode='stake';
    if(kind==='europe'){
      fullProfit=base*(odds-1);
      formula='淨利＝下注本金 ×（賠率 − 1）';
    }else if(kind==='hk'){
      fullProfit=base*odds;
      formula='淨利＝下注本金 × 賠率';
    }else if(isFbNegative(kind,odds)){
      const r=negativeRatio(kind,odds);
      risk=base*r;
      fullProfit=base;
      mode='fb-negative';
      formula=kind==='american'?`實際押注＝基準額 × ${Math.abs(odds)}%`:'實際押注＝基準額 × |負數賠率|';
    }else if(kind==='american'){
      fullProfit=base*(odds/100);
      formula='淨利＝下注本金 × 賠率 ÷ 100';
    }else{
      fullProfit=base*odds;
      formula='淨利＝下注本金 × 賠率';
    }

    let net,total,desc;
    if(status==='halfwin'){
      net=fullProfit/2; total=risk+net; desc='贏半：一半贏、一半走水';
    }else if(status==='push'){
      net=0; total=risk; desc='走水：實際押注全數退回';
    }else if(status==='halfloss'){
      net=-risk/2; total=risk/2; desc='輸半：一半輸、一半走水';
    }else if(status==='loss'){
      net=-risk; total=0; desc='全輸：實際押注全數損失';
    }else{
      net=fullProfit; total=risk+fullProfit; desc='全贏';
    }

    return {net,total,risk,fullProfit,formula,mode,desc};
  }

  function styleOnce(){
    if(document.querySelector('#odds-standard-style'))return;
    const s=document.createElement('style');s.id='odds-standard-style';s.textContent=`
      .std-odds{border:1px solid #294866;background:linear-gradient(180deg,#0c1d31,#091727);border-radius:16px;padding:14px;margin-top:10px}
      .std-odds-tabs{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-bottom:12px}.std-odds-tab{border:1px solid #284663;background:#0a192a;color:#a9bad0;border-radius:10px;padding:9px 6px;font-weight:800;cursor:pointer}.std-odds-tab.active{background:#177eea;border-color:#2d93ff;color:#fff}
      .std-odds h4{margin:0 0 10px;font-size:17px}.std-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.std-field label,.std-settle-label{display:block;color:#8fa6bf;font-size:10px;margin-bottom:6px}.std-field input{width:100%;box-sizing:border-box;background:#081526;color:#fff;border:1px solid #284663;border-radius:10px;padding:11px 12px;font-size:16px}
      .std-settles{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:10px}.std-settle{border:1px solid #284663;background:#0a192a;color:#a9bad0;border-radius:9px;padding:9px 6px;font-size:12px;font-weight:800;cursor:pointer}.std-settle.active{background:#177eea;border-color:#2d93ff;color:#fff}
      .std-results{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:10px}.std-result{background:#102945;border-radius:11px;padding:10px}.std-result span{display:block;color:#7f9ab5;font-size:9px}.std-result b{display:block;margin-top:3px;font-size:17px;color:#56e39f}.std-result b.neg{color:#ff8792}.std-result b.risk{color:#ffbf69}
      .std-note{margin:10px 0 0;color:#8da0b6;font-size:10px;line-height:1.65}.std-note strong{color:#dceaff}.std-error{color:#ff9b9b!important}
      @media(max-width:720px){.std-odds-tabs{display:flex;overflow-x:auto}.std-odds-tab{flex:0 0 auto;min-width:78px}.std-grid{grid-template-columns:1fr}.std-settles{grid-template-columns:repeat(3,1fr)}.std-results{grid-template-columns:1fr 1fr}}
    `;document.head.appendChild(s);
  }

  function shell(kind,showTabs){
    const c=MARKETS[kind];
    return `<div class="std-odds" data-std-odds="${kind}">
      ${showTabs?`<div class="std-odds-tabs">${ORDER.map(k=>`<button type="button" class="std-odds-tab ${k===kind?'active':''}" data-kind="${k}">${MARKETS[k].name}</button>`).join('')}</div>`:''}
      <h4>${c.name}計算器</h4>
      <div class="std-grid"><div class="std-field"><label data-role="amount-label">下注本金（TWD）</label><input data-role="stake" type="number" step="any" value="100"></div><div class="std-field"><label>${c.label}</label><input data-role="odds" type="number" step="any" value="${c.def}" placeholder="${c.placeholder}"></div></div>
      <div style="margin-top:10px"><span class="std-settle-label">結算結果</span><div class="std-settles">${SETTLES.map(([v,t],i)=>`<button type="button" class="std-settle ${i?'':'active'}" data-settle="${v}">${t}</button>`).join('')}</div></div>
      <div class="std-results"><div class="std-result"><span>淨利／虧損</span><b data-role="net">—</b></div><div class="std-result"><span>總返還</span><b data-role="total">—</b></div><div class="std-result"><span>實際押注</span><b class="risk" data-role="risk">—</b></div></div>
      <p class="std-note" data-role="note"></p>
    </div>`;
  }

  function bind(box,onKindChange){
    let kind=box.dataset.stdOdds,status='win';
    const stake=box.querySelector('[data-role=stake]'),odds=box.querySelector('[data-role=odds]'),net=box.querySelector('[data-role=net]'),total=box.querySelector('[data-role=total]'),riskEl=box.querySelector('[data-role=risk]'),note=box.querySelector('[data-role=note]'),amountLabel=box.querySelector('[data-role=amount-label]');
    const update=()=>{
      const c=MARKETS[kind],s=Number(stake.value),o=Number(odds.value),r=calc(kind,s,o,status);
      if(r.error){net.textContent='請檢查輸入';total.textContent=riskEl.textContent='—';net.classList.add('std-error');note.textContent='請確認本金與賠率格式。';return;}
      net.classList.remove('std-error','neg');if(r.net<0)net.classList.add('neg');
      amountLabel.textContent=r.mode==='fb-negative'?'基準贏額（TWD）':'下注本金（TWD）';
      net.textContent=money(r.net);total.textContent=money(r.total);riskEl.textContent=money(r.risk);
      if(r.mode==='fb-negative'){
        const shown=kind==='american'?`${Math.abs(o)}%`:`${Math.abs(o)}`;
        note.innerHTML=`<strong>FB SPORT 負數盤：</strong>${r.formula}。本例基準額 ${money(s)}，${shown} → 實際押注 ${money(r.risk)}。<br><strong>${r.desc}</strong>；全贏淨利 ${money(r.fullProfit)}。`;
      }else{
        note.innerHTML=`<strong>${r.desc}</strong><br>${r.formula}。全贏淨利 ${money(r.fullProfit)}。`;
      }
    };
    box.querySelectorAll('[data-settle]').forEach(b=>b.onclick=()=>{status=b.dataset.settle;box.querySelectorAll('[data-settle]').forEach(x=>x.classList.toggle('active',x===b));update();});
    box.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{const next=b.dataset.kind;if(next!==kind)onKindChange?.(next);});
    [stake,odds].forEach(x=>{x.oninput=update;x.onchange=update});update();
  }

  function rebuildTop(){
    const old=document.querySelector('.odds-v2-list');
    if(!old||document.querySelector('#std-top-wrap'))return;
    const panel=old.closest('.training-panel')||old.parentElement;if(!panel)return;
    panel.innerHTML=`<span class="tool-tag">快速工具</span><h3>五種盤口｜FB SPORT 計算</h3><p class="hint">負數馬來／印尼／美國盤以「基準贏額 → 實際押注」計算；正數盤直接以本金計算。</p><div id="std-top-wrap"></div>`;
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