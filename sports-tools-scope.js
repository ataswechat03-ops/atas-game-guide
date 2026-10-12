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
  }
  const active=$('#categoryNav .side-btn.active');
  const activeText=(active?.textContent||'').trim();
  const section=($('#sectionTitle')?.textContent||'').trim();
  return /體育|足球/i.test(activeText)||/體育|足球/i.test(section);
}

function collectGlobalSportsTools(){
  const set=new Set();
  const converter=$('#oddsConverter');
  if(converter) set.add(converter);
  const std=$('#std-top-wrap');
  if(std){const p=std.closest('.training-panel,.learn-panel');if(p)set.add(p)}
  $$('.training-panel,.learn-panel').forEach(p=>{
    if(p.querySelector('#routeList')) return;
    const t=(p.textContent||'').replace(/\s+/g,' ');
    if(/FB\s*SPORT|五種盤口|足球快速判斷|足球賠率計算|盤口轉換器/i.test(t)) set.add(p);
  });
  return [...set];
}

function apply(){
  const show=isSportsContext();
  collectGlobalSportsTools().forEach(el=>{
    el.hidden=!show;
    el.dataset.sportsScoped='1';
  });
}

function boot(){
  apply();
  document.addEventListener('click',e=>{
    if(e.target.closest('#categoryNav,.side-btn,[data-open],#closeDetail,.overlay')) setTimeout(apply,40);
  });
  window.addEventListener('hashchange',()=>setTimeout(apply,20));
  window.addEventListener('atas:content-updated',()=>setTimeout(apply,80));
  const watchTargets=[document.body,$('#categoryNav'),$('#detail')].filter(Boolean);
  watchTargets.forEach(t=>new MutationObserver(()=>setTimeout(apply,25)).observe(t,{subtree:true,childList:true,attributes:true,attributeFilter:['class']}));
  setTimeout(apply,250);
  setTimeout(apply,800);
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();
