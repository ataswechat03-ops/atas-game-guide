(()=>{
  'use strict';

  const CFG=[
    {index:2,stake:'#mlAmount',odds:'#mlOdds',kind:'asian'},
    {index:3,stake:'#idStake',odds:'#idOdds',kind:'asian'},
    {index:4,stake:'#usStake',odds:'#usOdds',kind:'american'}
  ];
  const money=n=>Number.isFinite(n)?`TWD ${Number(n).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—';

  function ensureHint(card){
    let box=card.querySelector('.negative-odds-hint');
    if(box)return box;
    box=document.createElement('div');
    box.className='negative-odds-hint';
    box.style.cssText='margin-top:8px;padding:9px 10px;border:1px solid #29445f;border-radius:10px;background:#0a1728;color:#91a5bc;font-size:10px;line-height:1.55';
    const result=card.querySelector('.odds-v2-result');
    if(result)result.after(box); else card.appendChild(box);
    return box;
  }

  function update(){
    const list=document.querySelector('.odds-v2-list');
    if(!list)return;
    const cards=[...list.querySelectorAll('.odds-v2')];
    CFG.forEach(c=>{
      const card=cards[c.index]; if(!card)return;
      const stake=Number(document.querySelector(c.stake)?.value);
      const odds=Number(document.querySelector(c.odds)?.value);
      const box=ensureHint(card);
      const mode=card.querySelector('select[id$="Mode"]')?.value || (c.index===2?document.querySelector('#mlMode')?.value:'stake');
      if(mode==='target'){box.style.display='none';return;}
      if(!(stake>=0)||!Number.isFinite(odds)||odds>=0){box.style.display='none';return;}
      box.style.display='block';
      const ratio=c.kind==='american'?Math.abs(odds)/100:Math.abs(odds);
      const fullLoss=stake*ratio;
      const halfLoss=fullLoss/2;
      const shown=c.kind==='american'?`${Math.abs(odds)}%`:`${Math.abs(odds)}`;
      box.innerHTML=`<b style="color:#dceaff">負數盤已套用：</b> 全贏只看本金，所以修改負數賠率時「全贏」金額不會變。<br>目前 ${shown}：全輸會扣 <b style="color:#ffbf69">${money(fullLoss)}</b>，輸半會扣 <b style="color:#ffbf69">${money(halfLoss)}</b>。`;
    });
  }

  const run=()=>setTimeout(update,40);
  document.addEventListener('input',e=>{if(e.target.matches('#mlAmount,#mlOdds,#idStake,#idOdds,#usStake,#usOdds'))run();});
  document.addEventListener('change',e=>{if(e.target.matches('#mlMode,#idMode,#usMode,.settlement-select'))run();});
  setTimeout(update,220);
})();
