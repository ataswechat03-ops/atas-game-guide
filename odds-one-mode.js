(()=>{
  'use strict';

  function forceOneMode(){
    // 上方五種盤口：只保留「我有多少下注本金」模式
    ['#mlMode','#idMode','#usMode'].forEach(sel=>{
      const mode=document.querySelector(sel);
      if(!mode)return;
      mode.value='stake';
      mode.disabled=false;
      const field=mode.closest('.calc-field')||mode.parentElement;
      if(field)field.style.display='none';
      mode.dispatchEvent(new Event('change',{bubbles:true}));
    });

    // 獨立盤口頁：只保留一般下注本金計算
    document.querySelectorAll('.ind-calc [data-role="mode"]').forEach(mode=>{
      mode.value='normal';
      mode.disabled=false;
      const field=mode.closest('.ind-calc-field')||mode.parentElement;
      if(field)field.style.display='none';
      mode.dispatchEvent(new Event('change',{bubbles:true}));
    });
  }

  const run=()=>setTimeout(forceOneMode,30);
  document.addEventListener('DOMContentLoaded',run);
  const body=document.querySelector('#detailBody');
  if(body)new MutationObserver(run).observe(body,{childList:true,subtree:true});
  setTimeout(forceOneMode,220);
})();
