(()=>{
  'use strict';

  const list=document.querySelector('.odds-v2-list');
  if(!list)return;
  const cards=[...list.querySelectorAll('.odds-v2')];
  if(cards.length<5)return;

  const money=n=>Number.isFinite(n)?`TWD ${Number(n).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—';

  const configs=[
    {
      index:3,
      modeId:'idMode',
      amount:'#idStake',
      odds:'#idOdds',
      out1:'#idProfit',
      out2:'#idTotal',
      defaultStake:1000,
      required:(target,odds)=>odds>0?target/odds:odds<0?target*Math.abs(odds):NaN
    },
    {
      index:4,
      modeId:'usMode',
      amount:'#usStake',
      odds:'#usOdds',
      out1:'#usProfit',
      out2:'#usTotal',
      defaultStake:105,
      required:(target,odds)=>odds>0?target*100/odds:odds<0?target*Math.abs(odds)/100:NaN
    }
  ];

  function setResultClass(el,value){
    if(!el)return;
    el.classList.toggle('result-negative',value<0);
    el.classList.toggle('result-positive',value>0);
  }

  function sync(cfg){
    const card=cards[cfg.index];
    const mode=document.querySelector(`#${cfg.modeId}`);
    const amount=document.querySelector(cfg.amount);
    const oddsEl=document.querySelector(cfg.odds);
    const out1=document.querySelector(cfg.out1);
    const out2=document.querySelector(cfg.out2);
    if(!card||!mode||!amount||!oddsEl||!out1||!out2)return;

    const amountLabel=amount.closest('.calc-field')?.querySelector('label');
    const result=card.querySelector('.odds-v2-result');
    const spans=result?.querySelectorAll('span')||[];
    const settleSelect=card.querySelector('.settlement-select');

    if(mode.value==='target'){
      if(amountLabel)amountLabel.textContent='目標淨利（TWD）';
      if(spans[0])spans[0].textContent='所需下注';
      if(spans[1])spans[1].textContent='中獎總返還';
      if(settleSelect){settleSelect.value='win';settleSelect.disabled=true;}

      const target=Number(amount.value),odds=Number(oddsEl.value);
      const required=(target>0)?cfg.required(target,odds):NaN;
      const total=Number.isFinite(required)?required+target:NaN;
      out1.textContent=money(required);
      out2.textContent=money(total);
      setResultClass(out1,required);
      setResultClass(out2,total);
    }else{
      if(amountLabel)amountLabel.textContent='下注本金（TWD）';
      if(spans[0])spans[0].textContent='淨結果';
      if(spans[1])spans[1].textContent='總返還';
      if(settleSelect){
        settleSelect.disabled=false;
        settleSelect.dispatchEvent(new Event('change',{bubbles:true}));
      }
    }
  }

  configs.forEach(cfg=>{
    const card=cards[cfg.index];
    const firstRow=card?.querySelector('.calc-row');
    if(!card||!firstRow||document.querySelector(`#${cfg.modeId}`))return;

    const modeField=document.createElement('div');
    modeField.className='calc-field odds-mode';
    modeField.innerHTML=`<label>計算模式</label><select id="${cfg.modeId}"><option value="stake">我有多少下注本金</option><option value="target">我想淨贏多少</option></select>`;
    firstRow.before(modeField);

    const mode=modeField.querySelector('select');
    mode.addEventListener('change',()=>{
      const amount=document.querySelector(cfg.amount);
      if(amount)amount.value=mode.value==='target'?100:cfg.defaultStake;
      setTimeout(()=>sync(cfg),0);
    });

    document.querySelector(cfg.amount)?.addEventListener('input',()=>{
      if(mode.value==='target')setTimeout(()=>sync(cfg),0);
    });
    document.querySelector(cfg.odds)?.addEventListener('input',()=>{
      if(mode.value==='target')setTimeout(()=>sync(cfg),0);
    });

    sync(cfg);
  });
})();
