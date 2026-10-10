(()=>{
  'use strict';

  const money=n=>Number.isFinite(n)?`TWD ${Number(n).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—';

  const TOP=[
    {index:2,mode:'#mlMode',amount:'#mlAmount',odds:'#mlOdds',out1:'#mlOut1',out2:'#mlOut2',kind:'asian'},
    {index:3,mode:'#idMode',amount:'#idStake',odds:'#idOdds',out1:'#idProfit',out2:'#idTotal',kind:'asian'},
    {index:4,mode:'#usMode',amount:'#usStake',odds:'#usOdds',out1:'#usProfit',out2:'#usTotal',kind:'american'}
  ];

  const ratio=(kind,odds)=>kind==='american'?Math.abs(odds)/100:Math.abs(odds);
  const winUnit=(kind,odds)=>{
    if(kind==='american')return odds>0?odds/100:odds<0?Math.abs(odds)/100:NaN;
    return odds>0?odds:odds<0?Math.abs(odds):NaN;
  };
  const lossUnit=(kind,odds)=>odds<0?ratio(kind,odds):1;

  function syncTop(cfg){
    const list=document.querySelector('.odds-v2-list');
    const card=list?.querySelectorAll('.odds-v2')?.[cfg.index];
    const mode=document.querySelector(cfg.mode),amount=document.querySelector(cfg.amount),oddsEl=document.querySelector(cfg.odds),out1=document.querySelector(cfg.out1),out2=document.querySelector(cfg.out2);
    if(!card||!mode||!amount||!oddsEl||!out1||!out2||mode.value!=='target')return;
    const settle=card.querySelector('.settlement-select');if(settle)settle.disabled=false;
    const status=settle?.value||'win';
    const target=Number(amount.value),odds=Number(oddsEl.value);
    const amountLabel=amount.closest('.calc-field')?.querySelector('label');
    const spans=card.querySelector('.odds-v2-result')?.querySelectorAll('span')||[];
    const targetIsLoss=status==='halfloss'||status==='loss';
    if(amountLabel)amountLabel.textContent=targetIsLoss?'目標虧損（TWD）':'目標淨利（TWD）';
    if(spans[0])spans[0].textContent='所需下注';
    if(spans[1])spans[1].textContent=status==='push'?'本金返還':'結算後金額';
    if(!(target>=0)||!Number.isFinite(odds)||odds===0){out1.textContent=out2.textContent='—';return;}
    if(status==='push'){out1.textContent='任意本金';out2.textContent='原本金';const help=card.querySelector('.settlement-help');if(help)help.textContent='走水不輸不贏，沒有固定目標可反推。';return;}
    const half=status==='halfwin'||status==='halfloss';
    const u=targetIsLoss?lossUnit(cfg.kind,odds):winUnit(cfg.kind,odds);
    const stake=target/(u*(half?0.5:1));
    const total=targetIsLoss?stake-target:stake+target;
    out1.textContent=money(stake);out2.textContent=money(total);
    const help=card.querySelector('.settlement-help');if(help)help.textContent=targetIsLoss?'依盤口虧損倍率反推所需本金。':'依盤口獲利倍率反推所需本金。';
  }

  function standaloneKind(id){if(id==='football-american')return 'american';if(id==='football-malay'||id==='football-indo')return 'asian';return null;}
  function patchStandalone(){
    document.querySelectorAll('.ind-calc[data-ind-calc]').forEach(calc=>{
      const kind=standaloneKind(calc.dataset.indCalc);if(!kind)return;
      const mode=calc.querySelector('[data-role="mode"]');if(!mode){return;} mode.disabled=false;
      if(mode.value!=='target')return;
      const amount=calc.querySelector('[data-role="amount"]'),oddsEl=calc.querySelector('[data-role="odds"]');
      const active=calc.querySelector('.ind-outcome-btn.active'),status=active?.dataset.outcome||'win';
      const target=Number(amount?.value),odds=Number(oddsEl?.value);
      const r1=calc.querySelector('[data-role="r1"]'),r2=calc.querySelector('[data-role="r2"]'),r3=calc.querySelector('[data-role="r3"]');
      const r1l=calc.querySelector('[data-role="r1l"]'),r2l=calc.querySelector('[data-role="r2l"]'),note=calc.querySelector('[data-role="note"]'),label=calc.querySelector('[data-role="amountLabel"]');
      if(!r1||!r2||!r3)return;
      const targetIsLoss=status==='halfloss'||status==='loss';
      if(label)label.textContent=targetIsLoss?'目標虧損（TWD）':'目標淨利（TWD）';
      if(r1l)r1l.textContent='所需下注';if(r2l)r2l.textContent='結算後金額';
      if(status==='push'){r1.textContent='任意本金';r2.textContent='原本金';r3.textContent='TWD 0.00';if(note)note.textContent='走水不輸不贏，無法反推固定本金。';return;}
      const half=status==='halfwin'||status==='halfloss';
      const u=targetIsLoss?lossUnit(kind,odds):winUnit(kind,odds);
      const stake=target/(u*(half?0.5:1)),total=targetIsLoss?stake-target:stake+target;
      r1.textContent=money(stake);r2.textContent=money(total);r3.textContent=money(stake*ratio(kind,odds));
      if(note)note.textContent=targetIsLoss?'依盤口虧損倍率反推本金。':'依盤口獲利倍率反推本金。';
    });
  }

  function syncAll(){TOP.forEach(syncTop);patchStandalone();}
  const later=()=>setTimeout(syncAll,60);
  document.addEventListener('change',e=>{if(e.target.matches('#mlMode,#idMode,#usMode,.settlement-select'))later();});
  document.addEventListener('input',e=>{if(e.target.matches('#mlAmount,#mlOdds,#idStake,#idOdds,#usStake,#usOdds'))later();});
  const body=document.querySelector('#detailBody');if(body)new MutationObserver(later).observe(body,{childList:true,subtree:true});
  setTimeout(syncAll,220);
})();