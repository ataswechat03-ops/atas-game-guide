(()=>{
  'use strict';

  const ROUTE=[
    ['slots','老虎機基本計算知識','先學 LINE／WAYS／CLUSTER 與倍率'],
    ['baccarat','百家樂','點數、補牌、莊閒和'],
    ['sicbo','骰寶','大小單雙、圍骰與組合'],
    ['roulette','輪盤','0、內圍與外圍下注'],
    ['sedie','色碟','紅白組合、單雙與指定結果'],
    ['fantan','番攤','餘數 1～4、番／念／角'],
    ['football','足球基本知識','五大賠率、讓分與大小盤']
  ];
  const COMPLETE_KEY='atas_game_guide_completed_v1';
  const $=s=>document.querySelector(s);
  const money=n=>Number(n).toLocaleString('zh-TW',{maximumFractionDigits:2});
  const getCompleted=()=>{
    try{return new Set(JSON.parse(localStorage.getItem(COMPLETE_KEY)||'[]'));}
    catch{return new Set();}
  };
  const saveCompleted=set=>localStorage.setItem(COMPLETE_KEY,JSON.stringify([...set]));

  const style=document.createElement('style');
  style.textContent=`
  .training-hub{margin:0 0 24px}.training-head{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-bottom:13px}.training-head h2{font-size:22px;margin:3px 0 0}.training-head p{margin:0;color:#8293aa;font-size:11px}
  .training-grid{display:grid;grid-template-columns:1.15fr .9fr .95fr;gap:14px}.training-panel{border:1px solid var(--line);background:linear-gradient(180deg,#101f34,#0b1727);border-radius:18px;padding:17px;min-width:0}.training-panel h3{margin:0 0 6px;font-size:16px}.training-panel>.hint{color:#8e9db1;font-size:10px;line-height:1.6;margin:0 0 13px}.tool-tag{display:inline-flex;padding:4px 8px;border-radius:99px;border:1px solid #ffffff16;background:#ffffff08;color:#aab9ca;font-size:9px;font-weight:800;margin-bottom:10px}
  .route-progress{display:flex;align-items:center;gap:10px;margin-bottom:12px}.route-bar{height:7px;background:#08111f;border:1px solid var(--line);border-radius:99px;overflow:hidden;flex:1}.route-fill{height:100%;background:linear-gradient(90deg,#1687ff,#20b15a);width:0;transition:.25s}.route-count{font-size:10px;color:#91a1b7;white-space:nowrap}.route-list{display:grid;gap:7px}.route-step{display:grid;grid-template-columns:28px minmax(0,1fr) 20px;gap:9px;align-items:center;width:100%;border:1px solid #21344e;background:#0d1a2c;border-radius:11px;padding:9px 10px;color:#eaf3ff;text-align:left;cursor:pointer}.route-step:hover{border-color:#3f6d9c;background:#10223a}.route-num{width:25px;height:25px;border-radius:8px;display:grid;place-items:center;background:#173458;color:#7ec1ff;font-size:10px;font-weight:900}.route-step.done .route-num{background:#103723;color:#62db8c}.route-copy b{display:block;font-size:11px}.route-copy small{display:block;color:#71839a;font-size:9px;margin-top:2px}.route-check{color:#50647c;font-weight:900}.route-step.done .route-check{color:#57d783}
  .calc-row{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:9px}.calc-field{display:grid;gap:5px}.calc-field label{font-size:9px;color:#8090a7;font-weight:800}.calc-field input,.calc-field select{width:100%;border:1px solid var(--line);background:#091626;color:#fff;border-radius:10px;padding:10px 11px;outline:none}.calc-field input:focus,.calc-field select:focus{border-color:#2b79c7}.tool-btn{border:0;border-radius:10px;padding:10px 12px;background:linear-gradient(135deg,#1687ff,#0d67cb);color:white;font-weight:850;cursor:pointer}.tool-btn.secondary{background:#13263d;border:1px solid #29435f;color:#cfe5ff}.calc-result{margin-top:11px;border:1px solid #25496e;background:#0c2036;border-radius:12px;padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px}.calc-result div{padding:7px 8px;background:#ffffff05;border-radius:9px}.calc-result span{display:block;color:#7890aa;font-size:9px}.calc-result b{display:block;margin-top:3px;font-size:17px}.calc-note{margin-top:9px;color:#71839a;font-size:9px;line-height:1.55}
  .quiz-box{min-height:192px}.quiz-start{text-align:center;padding:22px 6px}.quiz-start .quiz-icon{font-size:38px;margin-bottom:8px}.quiz-qno{font-size:9px;color:#72aef0;font-weight:900;letter-spacing:.1em}.quiz-question{font-size:14px;font-weight:800;line-height:1.6;margin:7px 0 12px}.quiz-options{display:grid;gap:7px}.quiz-option{border:1px solid #29405c;background:#0c192b;color:#dce9f9;padding:9px 10px;border-radius:10px;text-align:left;cursor:pointer}.quiz-option:hover{border-color:#4282c4}.quiz-option.correct{border-color:#2f9f5c;background:#102e20}.quiz-option.wrong{border-color:#a84558;background:#311821}.quiz-feedback{font-size:10px;line-height:1.55;margin:9px 0;color:#a9b9cc}.quiz-actions{display:flex;gap:7px;margin-top:10px}.quiz-score{text-align:center;padding:18px 4px}.quiz-score strong{font-size:38px;display:block;color:#70c5ff}.quiz-score p{font-size:11px;color:#8fa0b5;line-height:1.7}
  .detail-training-actions{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 18px;padding:12px;border:1px solid #27405d;background:#0e1d31;border-radius:12px}.detail-training-actions button{border:1px solid #2b4868;background:#142844;color:#dcecff;border-radius:9px;padding:8px 10px;font-weight:800;font-size:10px;cursor:pointer}.detail-training-actions button.complete{background:#123722;border-color:#286a43;color:#8de4a9}.training-toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,20px);background:#101d30;border:1px solid #31506f;color:#fff;padding:10px 14px;border-radius:10px;font-size:11px;z-index:120;opacity:0;pointer-events:none;transition:.2s}.training-toast.show{opacity:1;transform:translate(-50%,0)}
  @media(max-width:1100px){.training-grid{grid-template-columns:1fr 1fr}.training-panel:first-child{grid-column:1/-1}}
  @media(max-width:720px){.training-head{align-items:start;display:block}.training-head p{margin-top:5px}.training-grid{grid-template-columns:1fr}.training-panel:first-child{grid-column:auto}.calc-row{grid-template-columns:1fr}.route-copy small{display:none}}
  `;
  document.head.appendChild(style);

  const hub=document.createElement('section');
  hub.id='trainingHub';
  hub.className='training-hub';
  hub.innerHTML=`
    <div class="training-head">
      <div><div class="subhead">NEW USER TRAINING</div><h2>新人培訓工具</h2></div>
      <p>照順序學、直接算賠率、最後用小測驗確認是否真的看懂。</p>
    </div>
    <div class="training-grid">
      <article class="training-panel">
        <span class="tool-tag">學習路線</span>
        <h3>7 步完成基礎入門</h3>
        <p class="hint">點任何一項就直接打開該篇教學；看完後可以標記完成，進度會保存在這台裝置。</p>
        <div class="route-progress"><div class="route-bar"><div class="route-fill" id="routeFill"></div></div><span class="route-count" id="routeCount"></span></div>
        <div class="route-list" id="routeList"></div>
      </article>
      <article class="training-panel">
        <span class="tool-tag">快速工具</span>
        <h3>足球賠率計算器</h3>
        <p class="hint">輸入下注本金與畫面賠率，快速算出「中獎時」的淨利與總返還。</p>
        <div class="calc-field" style="margin-bottom:9px"><label>賠率顯示方式</label><select id="oddsType"><option value="europe">歐洲盤</option><option value="hongkong">香港盤</option><option value="malay">馬來盤</option><option value="indo">印尼盤</option><option value="american">美國盤</option></select></div>
        <div class="calc-row"><div class="calc-field"><label>下注本金（TWD）</label><input id="stakeInput" type="number" min="0" step="any" value="1000"></div><div class="calc-field"><label>賠率</label><input id="oddsInput" type="number" step="any" value="1.90"></div></div>
        <button class="tool-btn" id="calcBtn">立即計算</button>
        <div class="calc-result"><div><span>淨利</span><b id="profitOut">TWD 900</b></div><div><span>總返還</span><b id="returnOut">TWD 1,900</b></div></div>
        <div class="calc-note" id="calcNote">歐洲盤的賠率包含本金：本金 × 賠率＝總返還。</div>
      </article>
      <article class="training-panel">
        <span class="tool-tag">自我檢查</span>
        <h3>5 題快速測驗</h3>
        <p class="hint">題目來自目前網站內容，適合新人看完教學後立即確認理解程度。</p>
        <div class="quiz-box" id="quizBox"></div>
      </article>
    </div>`;
  const hero=$('.hero');
  if(hero) hero.insertAdjacentElement('afterend',hub);

  const toast=document.createElement('div');
  toast.className='training-toast';
  document.body.appendChild(toast);
  let toastTimer;
  const showToast=msg=>{toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1600);};

  const side=$('#sidebar');
  if(side){
    const wrap=document.createElement('div');
    wrap.innerHTML='<div class="side-title">培訓工具</div><button class="side-btn" id="trainingJump">🎓 新人培訓工具</button>';
    side.appendChild(wrap);
    wrap.querySelector('#trainingJump').onclick=()=>{hub.scrollIntoView({behavior:'smooth',block:'start'}); if(typeof closeSidebar==='function')closeSidebar();};
  }

  function renderRoute(){
    const done=getCompleted();
    const count=ROUTE.filter(([id])=>done.has(id)).length;
    $('#routeCount').textContent=`${count} / ${ROUTE.length} 完成`;
    $('#routeFill').style.width=`${count/ROUTE.length*100}%`;
    $('#routeList').innerHTML=ROUTE.map(([id,title,desc],i)=>`<button class="route-step ${done.has(id)?'done':''}" data-route="${id}"><span class="route-num">${i+1}</span><span class="route-copy"><b>${title}</b><small>${desc}</small></span><span class="route-check">${done.has(id)?'✓':'›'}</span></button>`).join('');
    document.querySelectorAll('[data-route]').forEach(btn=>btn.onclick=()=>{if(typeof openGuide==='function')openGuide(btn.dataset.route);});
  }
  renderRoute();

  const calcInfo={
    europe:['1.90','歐洲盤的賠率包含本金：本金 × 賠率＝總返還。'],
    hongkong:['0.90','香港盤顯示淨利倍率：本金 × 賠率＝淨利，再加回本金。'],
    malay:['0.90','馬來盤正數直接乘；負數以本金 ÷ 絕對值計算中獎淨利。'],
    indo:['+1.20','印尼盤正數直接乘；負數以本金 ÷ 絕對值計算中獎淨利。'],
    american:['+120','美國盤以 100 為基準：正數看 100 可贏多少；負數看要下多少才贏 100。']
  };
  $('#oddsType').onchange=e=>{
    const [v,note]=calcInfo[e.target.value];
    $('#oddsInput').value=v.replace('+','');
    $('#calcNote').textContent=note;
    calculate();
  };
  function calculate(){
    const stake=Number($('#stakeInput').value),odds=Number($('#oddsInput').value),type=$('#oddsType').value;
    if(!(stake>0)||!Number.isFinite(odds)||odds===0){$('#profitOut').textContent='—';$('#returnOut').textContent='—';return;}
    let profit=0,total=0;
    if(type==='europe'){
      if(odds<=1){$('#calcNote').textContent='歐洲盤一般需大於 1.00，請檢查輸入。';$('#profitOut').textContent='—';$('#returnOut').textContent='—';return;}
      total=stake*odds; profit=total-stake;
    }else if(type==='hongkong'){
      profit=stake*odds; total=stake+profit;
    }else if(type==='malay'||type==='indo'){
      profit=odds>0?stake*odds:stake/Math.abs(odds); total=stake+profit;
    }else if(type==='american'){
      profit=odds>0?stake*odds/100:stake*100/Math.abs(odds); total=stake+profit;
    }
    $('#profitOut').textContent=`TWD ${money(profit)}`;
    $('#returnOut').textContent=`TWD ${money(total)}`;
    $('#calcNote').textContent=calcInfo[type][1];
  }
  $('#calcBtn').onclick=calculate;
  $('#stakeInput').oninput=calculate;
  $('#oddsInput').oninput=calculate;
  calculate();

  const QUIZ=[
    {q:'歐洲盤 1.90，下注 TWD 1,000，中獎時總返還是多少？',opts:['TWD 900','TWD 1,000','TWD 1,900','TWD 2,900'],a:2,exp:'歐洲盤包含本金：1,000 × 1.90＝1,900。'},
    {q:'香港盤 0.90，下注 TWD 1,000，中獎時淨利是多少？',opts:['TWD 90','TWD 900','TWD 1,000','TWD 1,900'],a:1,exp:'香港盤顯示的是淨利倍率：1,000 × 0.90＝900。'},
    {q:'番攤每 4 顆為一組去除，最後剩 3 顆，開獎結果是？',opts:['1','2','3','4'],a:2,exp:'番攤最後剩幾顆就是幾；整除時才算 4。'},
    {q:'色碟開出「3 紅 1 白」，在常見單／雙玩法中屬於？',opts:['單','雙','和','無效'],a:0,exp:'常見定義中 3＋1 屬於「單」。'},
    {q:'輪盤的 0 屬於哪一種？',opts:['紅色','黑色','單數','以上皆不是'],a:3,exp:'0 不屬於紅／黑、單／雙或大小。'}
  ];
  let qi=0,score=0,locked=false;
  const renderQuizStart=()=>{$('#quizBox').innerHTML='<div class="quiz-start"><div class="quiz-icon">🧠</div><b>準備好了嗎？</b><p style="color:#8293aa;font-size:10px;line-height:1.6">共 5 題，每題答完會立即顯示解答。</p><button class="tool-btn" id="quizStartBtn">開始測驗</button></div>';$('#quizStartBtn').onclick=()=>{qi=0;score=0;renderQuestion();};};
  function renderQuestion(){
    locked=false;const item=QUIZ[qi];
    $('#quizBox').innerHTML=`<div class="quiz-qno">QUESTION ${qi+1} / ${QUIZ.length}</div><div class="quiz-question">${item.q}</div><div class="quiz-options">${item.opts.map((x,i)=>`<button class="quiz-option" data-answer="${i}">${x}</button>`).join('')}</div><div class="quiz-feedback" id="quizFeedback"></div><div class="quiz-actions" id="quizActions"></div>`;
    document.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>answerQuiz(Number(btn.dataset.answer)));
  }
  function answerQuiz(idx){
    if(locked)return;locked=true;const item=QUIZ[qi];
    document.querySelectorAll('[data-answer]').forEach((b,i)=>{b.disabled=true;if(i===item.a)b.classList.add('correct');else if(i===idx)b.classList.add('wrong');});
    if(idx===item.a)score++;
    $('#quizFeedback').textContent=(idx===item.a?'答對了！':'這題答錯了。')+' '+item.exp;
    $('#quizActions').innerHTML=`<button class="tool-btn secondary" id="quizNext">${qi===QUIZ.length-1?'查看成績':'下一題'}</button>`;
    $('#quizNext').onclick=()=>{qi++;qi>=QUIZ.length?renderScore():renderQuestion();};
  }
  function renderScore(){
    const msg=score===5?'全部答對，可以直接帶新人了。':score>=4?'掌握得很好，再補一題就更完整。':score>=3?'基礎已懂，建議把錯題對應教學再看一次。':'建議照上面的 7 步學習路線再走一次。';
    $('#quizBox').innerHTML=`<div class="quiz-score"><span>測驗完成</span><strong>${score} / ${QUIZ.length}</strong><p>${msg}</p><button class="tool-btn" id="quizAgain">再測一次</button></div>`;
    $('#quizAgain').onclick=renderQuizStart;
  }
  renderQuizStart();

  function currentGuideId(){
    if(!location.hash.startsWith('#guide='))return '';
    try{return decodeURIComponent(location.hash.slice(7));}catch{return '';}
  }
  function injectDetailActions(){
    const detail=$('#detail');const body=$('#detailBody');const id=currentGuideId();
    if(!detail?.classList.contains('show')||!body||!id)return;
    const g=typeof GUIDES!=='undefined'?GUIDES.find(x=>x.id===id):null;
    if(!g||body.querySelector('.detail-training-actions'))return;
    const done=getCompleted().has(id);
    const box=document.createElement('div');box.className='detail-training-actions';
    box.innerHTML=`<button class="${done?'complete':''}" id="completeGuideBtn">${done?'✓ 已完成':'✓ 標記已完成'}</button><button id="copyGuideLinkBtn">🔗 複製這篇教學連結</button>`;
    body.prepend(box);
    box.querySelector('#completeGuideBtn').onclick=()=>{const set=getCompleted();set.add(id);saveCompleted(set);renderRoute();box.querySelector('#completeGuideBtn').classList.add('complete');box.querySelector('#completeGuideBtn').textContent='✓ 已完成';showToast('已記錄學習進度');};
    box.querySelector('#copyGuideLinkBtn').onclick=async()=>{const link=`${location.origin}${location.pathname}#guide=${encodeURIComponent(id)}`;try{await navigator.clipboard.writeText(link);showToast('教學連結已複製');}catch{prompt('複製這個連結：',link);}};
  }
  const observer=new MutationObserver(()=>setTimeout(injectDetailActions,0));
  if($('#detail'))observer.observe($('#detail'),{attributes:true,attributeFilter:['class']});
  if($('#detailBody'))observer.observe($('#detailBody'),{childList:true});
  window.addEventListener('hashchange',()=>setTimeout(injectDetailActions,0));
  setTimeout(injectDetailActions,200);
})();