(()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);

  const CASES=[
    {
      id:'malay-half-loss-098',
      title:'馬來盤｜-0.98｜輸半案例',
      tag:'已結算',
      match:'Fulham vs Everton',
      market:'讓球｜Everton -0/0.5 @ -0.98',
      result:'1–1',
      base:100,
      risk:98,
      pnl:-49,
      settlement:'輸半',
      explain:'FB SPORT 負數馬來盤以基準贏額換算實際押注。基準額 100 × 0.98 = 實際押注 98；本場打和，而 Everton -0/0.5（-0.25）屬輸半，因此虧損 98 ÷ 2 = 49。',
      formula:'100 × 0.98 = 98；輸半：98 ÷ 2 = 49'
    },
    {
      id:'indo-early-114',
      title:'印尼盤｜-1.14｜提前結算案例',
      tag:'提前結算',
      match:'Notts County vs Oxford United',
      market:'大小｜小 3 @ -1.14',
      result:'提前結算',
      base:100,
      risk:114,
      pnl:-6.30,
      settlement:'提前結算',
      explain:'畫面顯示提前結算本金 100、提前結算返還 107.70，最終損益 -6.30。這類結果屬平台提前結算／Cash Out，不等同一般全贏、贏半、走水、輸半或全輸，不能拿一般賠率公式反推。',
      formula:'平台提前結算：以當下 Cash Out 報價為準'
    },
    {
      id:'indo-entry-123',
      title:'印尼盤｜-1.23｜下注介面案例',
      tag:'下注中',
      match:'Fulham vs Man Utd',
      market:'大小｜大 3 @ -1.23',
      result:'未結算',
      base:38000,
      risk:46740,
      pnl:null,
      settlement:'未結算',
      explain:'下注介面顯示印尼盤 -1.23。依目前 FB SPORT 負數盤邏輯，若 38,000 為基準贏額，實際押注會是 38,000 × 1.23 = 46,740。此張僅作下注介面示例，沒有最終結算結果。',
      formula:'38,000 × 1.23 = 46,740'
    }
  ];

  function money(n){return Number.isFinite(n)?`TWD ${n.toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—'}

  function styles(){
    if($('#bet-case-style'))return;
    const s=document.createElement('style');s.id='bet-case-style';s.textContent=`
      .bet-cases{margin:18px 0 24px}.bet-cases-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:10px}.bet-cases-head h2{margin:2px 0 0;font-size:20px}.bet-cases-head p{margin:0;color:#71879f;font-size:10px}.bet-case-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.bet-case{border:1px solid #213c58;background:linear-gradient(180deg,#0d1c2f,#091521);border-radius:14px;padding:13px;min-width:0}.bet-case-top{display:flex;justify-content:space-between;gap:8px;align-items:start}.bet-case h3{margin:0;font-size:14px;line-height:1.35}.bet-case-tag{flex:none;border:1px solid #2c5377;background:#102b46;color:#8dc8ff;border-radius:999px;padding:4px 7px;font-size:9px;font-weight:800}.bet-case-meta{display:grid;gap:5px;margin-top:10px}.bet-case-row{display:flex;justify-content:space-between;gap:10px;font-size:10px}.bet-case-row span{color:#738aa2}.bet-case-row b{color:#dbe9f7;text-align:right}.bet-case-kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}.bet-case-kpi>div{background:#102843;border-radius:9px;padding:8px}.bet-case-kpi span{display:block;color:#728ca6;font-size:8px}.bet-case-kpi b{display:block;margin-top:2px;font-size:12px;color:#5fe0a2}.bet-case-kpi b.loss{color:#ff8d98}.bet-case-detail{display:none;margin-top:9px;border-top:1px solid #20384f;padding-top:9px;color:#8fa6bd;font-size:10px;line-height:1.6}.bet-case.open .bet-case-detail{display:block}.bet-case-detail strong{color:#d7e8f8}.bet-case-btn{margin-top:9px;width:100%;border:1px solid #2a4967;background:#0b1a2b;color:#a9bfd5;border-radius:8px;padding:7px 9px;font-size:10px;font-weight:800;cursor:pointer}.bet-case-btn:hover{border-color:#2f8fff;color:#fff}.bet-case-note{margin-top:8px;color:#60758c;font-size:9px}
      @media(max-width:980px){.bet-case-grid{grid-template-columns:1fr 1fr}}@media(max-width:640px){.bet-case-grid{grid-template-columns:1fr}.bet-cases-head{align-items:start;flex-direction:column}}
    `;document.head.appendChild(s);
  }

  function card(c){
    const pnlClass=Number.isFinite(c.pnl)&&c.pnl<0?'loss':'';
    return `<article class="bet-case" data-case="${c.id}">
      <div class="bet-case-top"><h3>${c.title}</h3><span class="bet-case-tag">${c.tag}</span></div>
      <div class="bet-case-meta"><div class="bet-case-row"><span>賽事</span><b>${c.match}</b></div><div class="bet-case-row"><span>投注</span><b>${c.market}</b></div><div class="bet-case-row"><span>結果</span><b>${c.result}</b></div></div>
      <div class="bet-case-kpi"><div><span>基準額</span><b>${money(c.base)}</b></div><div><span>實際押注</span><b>${money(c.risk)}</b></div><div><span>損益</span><b class="${pnlClass}">${money(c.pnl)}</b></div></div>
      <button class="bet-case-btn" type="button">查看計算說明</button>
      <div class="bet-case-detail"><strong>${c.settlement}</strong><br>${c.explain}<br><br><strong>計算：</strong>${c.formula}</div>
    </article>`;
  }

  function mount(){
    if($('#betCases'))return;
    const toolbar=$('.toolbar');
    if(!toolbar)return;
    const sec=document.createElement('section');sec.id='betCases';sec.className='bet-cases';
    sec.innerHTML=`<div class="bet-cases-head"><div><div class="subhead">FB SPORT REAL CASES</div><h2>實際投注單案例</h2></div><p>已隱去帳號、訂單編號等敏感資訊，只保留教學需要的盤口與結算資料。</p></div><div class="bet-case-grid">${CASES.map(card).join('')}</div>`;
    toolbar.insertAdjacentElement('afterend',sec);
    sec.querySelectorAll('.bet-case-btn').forEach(btn=>btn.onclick=()=>btn.closest('.bet-case').classList.toggle('open'));
  }

  styles();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();