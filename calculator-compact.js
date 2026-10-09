(()=>{
  'use strict';
  const list=document.querySelector('.odds-v2-list');
  if(!list||list.dataset.compactReady)return;
  list.dataset.compactReady='1';

  const cards=[...list.querySelectorAll('.odds-v2')];
  if(cards.length<2)return;

  const style=document.createElement('style');
  style.textContent=`
    .odds-tabs-wrap{margin-top:10px}
    .odds-tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin-bottom:10px}
    .odds-tab{border:1px solid #29435f;background:#0b192b;color:#9fb0c4;border-radius:10px;padding:9px 6px;font-size:10px;font-weight:850;cursor:pointer;transition:.18s;white-space:nowrap}
    .odds-tab:hover{border-color:#3b6d9f;color:#fff}
    .odds-tab.active{background:linear-gradient(135deg,#1687ff,#0d67cb);border-color:#2589ef;color:#fff;box-shadow:0 8px 24px #1687ff28}
    .odds-v2-list.compact .odds-v2{display:none;margin:0}
    .odds-v2-list.compact .odds-v2.active{display:block}
    .odds-quick-note{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid #213a56;background:#0a1728;border-radius:11px;padding:9px 10px;margin-bottom:9px;color:#91a5bc;font-size:9px}
    .odds-quick-note b{color:#dceaff;font-size:10px}
    @media(max-width:720px){
      .odds-tabs{display:flex;overflow-x:auto;gap:6px;padding-bottom:3px;scrollbar-width:none}.odds-tabs::-webkit-scrollbar{display:none}
      .odds-tab{flex:0 0 auto;min-width:78px;padding:9px 12px}
      .odds-v2{padding:11px}.odds-v2-result b{font-size:15px}
    }
  `;
  document.head.appendChild(style);

  const names=cards.map(card=>card.querySelector('h4')?.textContent.replace('計算器','').trim()||'盤口');
  const wrap=document.createElement('div');
  wrap.className='odds-tabs-wrap';
  wrap.innerHTML=`<div class="odds-quick-note"><span>一次只顯示一種盤口，點上方切換。</span><b id="oddsActiveLabel"></b></div><div class="odds-tabs" role="tablist">${names.map((name,i)=>`<button class="odds-tab" type="button" data-odds-tab="${i}" role="tab">${name}</button>`).join('')}</div>`;
  list.parentNode.insertBefore(wrap,list);
  list.classList.add('compact');

  const tabs=[...wrap.querySelectorAll('.odds-tab')];
  const label=wrap.querySelector('#oddsActiveLabel');
  function activate(index){
    cards.forEach((card,i)=>card.classList.toggle('active',i===index));
    tabs.forEach((tab,i)=>{tab.classList.toggle('active',i===index);tab.setAttribute('aria-selected',i===index?'true':'false');});
    if(label)label.textContent=names[index]||'';
    try{localStorage.setItem('atas_odds_calc_tab',String(index));}catch{}
  }
  tabs.forEach((tab,i)=>tab.addEventListener('click',()=>activate(i)));
  let initial=2;
  try{
    const saved=Number(localStorage.getItem('atas_odds_calc_tab'));
    if(Number.isInteger(saved)&&saved>=0&&saved<cards.length)initial=saved;
  }catch{}
  activate(initial);
})();
