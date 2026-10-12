(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

function isSportsContext(){
  const detail=$('#detail');
  if(detail?.classList.contains('show')){
    const cat=($('#detailCategory')?.textContent||'').trim();
    if(/體育|足球/i.test(cat)) return true;
    const hash=decodeURIComponent(location.hash||'');
    if(/football|sport/i.test(hash)) return true;
    return false;
  }
  const active=$('#categoryNav .side-btn.active');
  const activeText=(active?.textContent||'').trim();
  const section=($('#sectionTitle')?.textContent||'').trim();
  return /體育|足球/i.test(activeText)||/體育|足球/i.test(section);
}

function collectSportsOnly(){
  const set=new Set();

  // 明確屬於體育／足球的全域工具與案例。
  ['#oddsConverter','#betCases','#parlayTool','#std-top-wrap'].forEach(sel=>{
    const el=$(sel);
    if(!el)return;
    if(sel==='#std-top-wrap'){
      const p=el.closest('.training-panel,.learn-panel');
      if(p)set.add(p);
    }else set.add(el);
  });

  // 既有足球／賠率工具面板。
  $$('.training-panel,.learn-panel').forEach(p=>{
    if(p.querySelector('#routeList')) return;
    const t=(p.textContent||'').replace(/\s+/g,' ');
    if(/FB\s*SPORT|五種盤口|足球快速判斷|足球賠率計算|盤口轉換器|串關計算器|實際投注單案例/i.test(t)) set.add(p);
  });

  // 未來新增工具時，只要標記 data-sports-only 就會自動套用範圍限制。
  $$('[data-sports-only]').forEach(el=>set.add(el));

  return [...set];
}

function apply(){
  const show=isSportsContext();
  collectSportsOnly().forEach(el=>{
    el.hidden=!show;
    el.dataset.sportsScoped='1';
    el.setAttribute('aria-hidden',show?'false':'true');
  });
}

function boot(){
  apply();
  document.addEventListener('click',e=>{
    if(e.target.closest('#categoryNav,.side-btn,[data-open],#closeDetail,.overlay,.top-product-nav,.frontend-mobile-nav')){
      setTimeout(apply,20);
      setTimeout(apply,120);
    }
  });
  window.addEventListener('hashchange',()=>setTimeout(apply,20));
  window.addEventListener('atas:content-updated',()=>setTimeout(apply,80));

  // 只監看會影響分類／詳情狀態的區域，避免觀察整個 body 造成不必要負擔。
  const watchTargets=[$('#categoryNav'),$('#detail'),$('#sectionTitle')].filter(Boolean);
  watchTargets.forEach(t=>new MutationObserver(()=>setTimeout(apply,25)).observe(t,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']}));

  // 部分工具由其他腳本稍後掛載，做幾次延遲補套用。
  [120,350,800,1400].forEach(ms=>setTimeout(apply,ms));
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();
