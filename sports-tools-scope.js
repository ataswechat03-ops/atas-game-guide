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

function addScoped(set,el){
  if(!el)return;
  const workspace=el.closest('.workspace-section');
  set.add(workspace||el);
}

function collectSportsOnly(){
  const set=new Set();

  // 明確屬於體育／足球的全域工具、案例與工具中心。
  ['#oddsConverter','#betCases','#parlayTool','#std-top-wrap','#toolCenter'].forEach(sel=>{
    const el=$(sel);
    if(!el)return;
    if(sel==='#std-top-wrap'){
      const p=el.closest('.training-panel,.learn-panel');
      addScoped(set,p||el);
    }else addScoped(set,el);
  });

  // 既有足球／賠率工具面板。
  $$('.training-panel,.learn-panel').forEach(p=>{
    if(p.querySelector('#routeList')) return;
    const t=(p.textContent||'').replace(/\s+/g,' ');
    if(/FB\s*SPORT|五種盤口|足球快速判斷|足球賠率計算|盤口轉換器|串關計算器|實際投注單案例/i.test(t)) addScoped(set,p);
  });

  // 「新人常見錯誤」整區是足球盤口教材，也只應在體育情境出現。
  $$('.home-upgrade,.workspace-section').forEach(el=>{
    const t=(el.textContent||'').replace(/\s+/g,' ');
    if(/新人常見錯誤|COMMON\s*MISTAKES|基準贏額|負數盤直接套正數乘法|贏半當成全贏|Cash\s*Out|讓球方向看反|0\.25\s*\/\s*0\.75/i.test(t)) addScoped(set,el);
  });

  // 首頁／工作區導覽中的足球工具入口，非體育分類也一併隱藏。
  $$('#workspaceNav button,.product-section-nav button').forEach(btn=>{
    const t=(btn.textContent||'').trim();
    if(/工具中心|案例庫|實際案例|足球工具/i.test(t)) set.add(btn);
  });

  // 未來新增工具時，只要標記 data-sports-only 就會自動套用範圍限制。
  $$('[data-sports-only]').forEach(el=>addScoped(set,el));

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
    if(e.target.closest('#categoryNav,.side-btn,[data-open],#closeDetail,.overlay,.top-product-nav,.frontend-mobile-nav,#workspaceNav')){
      setTimeout(apply,20);
      setTimeout(apply,120);
    }
  });
  window.addEventListener('hashchange',()=>setTimeout(apply,20));
  window.addEventListener('atas:content-updated',()=>setTimeout(apply,80));

  const watchTargets=[$('#categoryNav'),$('#detail'),$('#sectionTitle')].filter(Boolean);
  watchTargets.forEach(t=>new MutationObserver(()=>setTimeout(apply,25)).observe(t,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']}));

  // platform-upgrades / layout-v2 會延遲掛載工具中心與常見錯誤區塊。
  [120,350,800,1400,2200].forEach(ms=>setTimeout(apply,ms));
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();
