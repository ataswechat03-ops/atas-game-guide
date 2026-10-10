(()=>{
  'use strict';

  const CFG={
    'football-europe':{title:'歐洲盤獨立計算器',label:'歐洲盤賠率',def:'1.90',hint:'總返還＝本金 × 賠率；淨利＝總返還－本金。',unit:(o)=>o>1?o-1:NaN,validate:(o)=>o>1},
    'football-hongkong':{title:'香港盤獨立計算器',label:'香港盤賠率',def:'0.90',hint:'淨利＝本金 × 賠率；總返還＝本金＋淨利。',unit:(o)=>o>=0?o:NaN,validate:(o)=>o>=0},
    'football-malay':{title:'馬來盤獨立計算器',label:'馬來盤賠率',def:'-0.944',hint:'正數：淨利＝本金 × 賠率；負數：淨利＝本金 ÷ |賠率|。',unit:(o)=>o>0?o:o<0?1/Math.abs(o):NaN,validate:(o)=>o!==0},
    'football-indo':{title:'印尼盤獨立計算器',label:'印尼盤賠率',def:'-1.25',hint:'正數：淨利＝本金 × 賠率；負數：淨利＝本金 ÷ |賠率|。',unit:(o)=>o>0?o:o<0?1/Math.abs(o):NaN,validate:(o)=>o!==0},
    'football-american':{title:'美國盤獨立計算器',label:'美國盤賠率',def:'-105',hint:'正數：淨利＝本金 × 賠率 ÷ 100；負數：淨利＝本金 × 100 ÷ |賠率|。',unit:(o)=>o>0?o/100:o<0?100/Math.abs(o):NaN,validate:(o)=>o!==0}
  };

  const OUTCOMES=[
    ['win','全贏'],['halfwin','贏半'],['push','走水'],['halfloss','輸半'],['loss','全輸']
  ];

  const style=document.createElement('style');
  style.textContent=`
    .ind-calc{margin:0 0 18px;border:1px solid #294866;background:linear-gradient(180deg,#0c1d31,#091727);border-radius:16px;padding:16px;box-shadow:0 10px 30px #0002}
    .ind-calc-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
    .ind-calc-head h3{margin:0;font-size:18px}.ind-calc-tag{font-size:10px;color:#8ec8ff;border:1px solid #2d6ba5;border-radius:999px;padding:4px 8px}
    .ind-calc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ind-calc-field label{display:block;color:#8fa6bf;font-size:10px;margin:0 0 5px}.ind-calc-field input,.ind-calc-field select{width:100%;box-sizing:border-box;background:#081526;color:#fff;border:1px solid #284663;border-radius:10px;padding:11px 12px;font-size:14px;outline:none}.ind-calc-field input:focus,.ind-calc-field select:focus{border-color:#2389ff}
    .ind-outcome-wrap{grid-column:1/-1}.ind-outcome-label{display:block;color:#8fa6bf;font-size:10px;margin:0 0 6px}.ind-outcomes{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}.ind-outcome-btn{appearance:none;border:1px solid #284663;background:#0a192a;color:#a9bad0;border-radius:9px;padding:9px 6px;font-size:12px;font-weight:700;cursor:pointer}.ind-outcome-btn:hover{border-color:#2e79bd}.ind-outcome-btn.active{background:#177eea;border-color:#2d93ff;color:white;box-shadow:0 0 0 1px #2d93ff33 inset}
    .ind-calc-results{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:10px}.ind-calc-result{background:#102945;border-radius:11px;padding:10px}.ind-calc-result span{display:block;color:#7f9ab5;font-size:9px}.ind-calc-result b{display:block;margin-top:3px;font-size:16px;color:#56e39f}.ind-calc-note{margin:9px 0 0;color:#7f91a7;font-size:10px;line-height:1.55}.ind-calc-error{color:#ff9b9b!important}.ind-calc-full{grid-column:1/-1}
    @media(max-width:720px){.ind-calc{padding:13px}.ind-calc-grid{grid-template-columns:1fr}.ind-calc-results{grid-template-columns:1fr 1fr}.ind-calc-head h3{font-size:16px}.ind-outcomes{grid-template-columns:repeat(3,1fr)}.ind-outcome-btn{font-size:11px;padding:9px 4px}}
  `;
  document.head.appendChild(style);

  const money=n=>Number.isFinite(n)?`TWD ${n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—';

  function calculatorHtml(id,cfg){
    return `<section class="ind-calc" data-ind-calc="${id}">
      <div class="ind-calc-head"><h3>${cfg.title}</h3><span class="ind-calc-tag">獨立工具</span></div>
      <div class="ind-calc-grid">
        <div class="ind-calc-field ind-calc-full"><label>計算模式</label><select data-role="mode"><option value="stake">我有多少下注本金</option><option value="target">我想淨贏多少</option></select></div>
        <div class="ind-outcome-wrap">
          <span class="ind-outcome-label">結算結果</span>
          <div class="ind-outcomes" data-role="outcomes">${OUTCOMES.map(([v,t],i)=>`<button type="button" class="ind-outcome-btn ${i===0?'active':''}" data-outcome="${v}">${t}</button>`).join('')}</div>
        </div>
        <div class="ind-calc-field"><label data-role="amountLabel">下注本金（TWD）</label><input data-role="amount" type="number" step="any" value="1000"></div>
        <div class="ind-calc-field"><label>${cfg.label}</label><input data-role="odds" type="number" step="any" value="${cfg.def}"></div>
      </div>
      <div class="ind-calc-results">
        <div class="ind-calc-result"><span data-role="result1Label">淨利／虧損</span><b data-role="result1">—</b></div>
        <div class="ind-calc-result"><span data-role="result2Label">總返還</span><b data-role="result2">—</b></div>
      </div>
      <p class="ind-calc-note" data-role="note">${cfg.hint}</p>
    </section>`;
  }

  function bind(calc,cfg){
    const mode=calc.querySelector('[data-role="mode"]');
    const outcomeBtns=[...calc.querySelectorAll('[data-outcome]')];
    const amount=calc.querySelector('[data-role="amount"]');
    const odds=calc.querySelector('[data-role="odds"]');
    const amountLabel=calc.querySelector('[data-role="amountLabel"]');
    const r1=calc.querySelector('[data-role="result1"]');
    const r2=calc.querySelector('[data-role="result2"]');
    const r1l=calc.querySelector('[data-role="result1Label"]');
    const r2l=calc.querySelector('[data-role="result2Label"]');
    const note=calc.querySelector('[data-role="note"]');
    let outcome='win';

    const update=()=>{
      const a=Number(amount.value),o=Number(odds.value),u=cfg.unit(o);
      amountLabel.textContent=mode.value==='target'?'目標淨利（TWD）':'下注本金（TWD）';
      r1.classList.remove('ind-calc-error');r2.classList.remove('ind-calc-error');

      if(!(a>=0)||!cfg.validate(o)||!Number.isFinite(u)){
        r1.textContent='請檢查輸入';r2.textContent='—';r1.classList.add('ind-calc-error');note.textContent=`輸入格式不正確。${cfg.hint}`;return;
      }

      if(mode.value==='target'){
        r1l.textContent='所需下注';r2l.textContent='中獎總返還';
        if(!['win','halfwin'].includes(outcome)||u<=0){
          r1.textContent='無法反推';r2.textContent='—';r1.classList.add('ind-calc-error');note.textContent='「我想淨贏多少」只適用全贏或贏半；走水、輸半、全輸沒有正淨利可反推。';return;
        }
        const factor=outcome==='halfwin'?0.5:1;
        const stake=a/(u*factor);const profit=a;const total=stake+profit;
        r1.textContent=money(stake);r2.textContent=money(total);
        note.textContent=`${outcome==='halfwin'?'贏半：一半本金獲利、另一半本金退回。':'全贏：全部本金按賠率獲利。'} ${cfg.hint}`;
      }else{
        r1l.textContent='淨利／虧損';r2l.textContent='總返還';
        const fullProfit=a*u;
        let net,total,text;
        if(outcome==='win'){net=fullProfit;total=a+fullProfit;text='全贏：全部本金按賠率獲利。';}
        else if(outcome==='halfwin'){net=fullProfit/2;total=a+net;text='贏半：一半本金按賠率獲利，另一半本金退回。';}
        else if(outcome==='push'){net=0;total=a;text='走水：不輸不贏，本金全額退回。';}
        else if(outcome==='halfloss'){net=-a/2;total=a/2;text='輸半：一半本金輸掉，另一半本金退回。';}
        else {net=-a;total=0;text='全輸：本金全部損失。';}
        r1.textContent=money(net);r2.textContent=money(total);
        if(net<0)r1.classList.add('ind-calc-error');
        note.textContent=`${text} ${cfg.hint}`;
      }
    };

    outcomeBtns.forEach(btn=>btn.addEventListener('click',()=>{
      outcome=btn.dataset.outcome;
      outcomeBtns.forEach(b=>b.classList.toggle('active',b===btn));
      update();
    }));
    [mode,amount,odds].forEach(el=>el.addEventListener('input',update));
    mode.addEventListener('change',update);
    update();
  }

  const originalOpenGuide=openGuide;
  openGuide=function(id){
    originalOpenGuide(id);
    const cfg=CFG[id];
    if(!cfg)return;
    const body=document.querySelector('#detailBody');
    if(!body||body.querySelector('[data-ind-calc]'))return;
    body.insertAdjacentHTML('afterbegin',calculatorHtml(id,cfg));
    bind(body.querySelector('[data-ind-calc]'),cfg);
  };

  if(location.hash.startsWith('#guide=')){
    const id=decodeURIComponent(location.hash.slice(7));
    if(CFG[id])setTimeout(()=>openGuide(id),80);
  }
})();