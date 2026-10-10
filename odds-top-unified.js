(()=>{
  'use strict';

  const money=n=>Number.isFinite(n)?`TWD ${Number(n).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—';
  const set=(sel,val)=>{const el=document.querySelector(sel);if(el)el.textContent=val;};
  const setClass=(sel,val)=>{const el=document.querySelector(sel);if(!el)return;el.classList.toggle('result-negative',val<0);el.classList.toggle('result-positive',val>0);};

  const DEF=[
    {name:'歐洲盤',stake:'#euStake',odds:'#euOdds',out1:'#euProfit',out2:'#euTotal',kind:'europe'},
    {name:'香港盤',stake:'#hkStake',odds:'#hkOdds',out1:'#hkProfit',out2:'#hkTotal',kind:'hk'},
    {name:'馬來盤',stake:'#mlAmount',odds:'#mlOdds',out1:'#mlOut1',out2:'#mlOut2',kind:'asian'},
    {name:'印尼盤',stake:'#idStake',odds:'#idOdds',out1:'#idProfit',out2:'#idTotal',kind:'asian'},
    {name:'美國盤',stake:'#usStake',odds:'#usOdds',out1:'#usProfit',out2:'#usTotal',kind:'american'}
  ];

  function positiveProfit(kind,stake,odds){
    if(kind==='europe')return odds>1?stake*(odds-1):NaN;
    if(kind==='hk'||kind==='asian')return odds>=0?stake*odds:NaN;
    if(kind==='american')return odds>0?stake*(odds/100):NaN;
    return NaN;
  }

  function negativeLoss(kind,stake,odds){
    if(kind==='asian')return stake*Math.abs(odds);
    if(kind==='american')return stake*(Math.abs(odds)/100);
    return NaN;
  }

  function settlePositive(stake,profit,status){
    if(status==='halfwin')return {net:profit/2,total:stake+profit/2};
    if(status==='push')return {net:0,total:stake};
    if(status==='halfloss')return {net:-stake/2,total:stake/2};
    if(status==='loss')return {net:-stake,total:0};
    return {net:profit,total:stake+profit};
  }

  function settleNegative(kind,stake,odds,status){
    const loss=negativeLoss(kind,stake,odds);
    if(!Number.isFinite(loss))return null;
    if(status==='halfwin')return {net:stake/2,total:stake+stake/2};
    if(status==='push')return {net:0,total:stake};
    if(status==='halfloss')return {net:-loss/2,total:stake-loss/2};
    if(status==='loss')return {net:-loss,total:stake-loss};
    return {net:stake,total:stake+stake};
  }

  function recalc(){
    const list=document.querySelector('.odds-v2-list');
    if(!list)return;
    const cards=[...list.querySelectorAll('.odds-v2')];
    DEF.forEach((d,i)=>{
      const card=cards[i];
      if(!card)return;
      const stake=Number(document.querySelector(d.stake)?.value);
      const odds=Number(document.querySelector(d.odds)?.value);
      const status=card.querySelector('.settlement-select')?.value||'win';
      if(!(stake>=0)||!Number.isFinite(odds)){set(d.out1,'—');set(d.out2,'—');return;}

      // 馬來盤「我想淨贏多少」保留原反推模式。
      if(d.kind==='asian'&&d.name==='馬來盤'&&document.querySelector('#mlMode')?.value==='target')return;

      let r=null;
      if((d.kind==='asian'||d.kind==='american')&&odds<0){
        r=settleNegative(d.kind,stake,odds,status);
      }else{
        const profit=positiveProfit(d.kind,stake,odds);
        if(!Number.isFinite(profit)){set(d.out1,'—');set(d.out2,'—');return;}
        r=settlePositive(stake,profit,status);
      }
      if(!r)return;
      set(d.out1,money(r.net));set(d.out2,money(r.total));
      setClass(d.out1,r.net);setClass(d.out2,r.total);
    });
  }

  const run=()=>setTimeout(recalc,25);
  document.addEventListener('input',e=>{if(e.target.matches('#euStake,#euOdds,#hkStake,#hkOdds,#mlAmount,#mlOdds,#idStake,#idOdds,#usStake,#usOdds'))run();});
  document.addEventListener('change',e=>{if(e.target.matches('#mlMode,.settlement-select'))run();});
  setTimeout(recalc,160);
})();