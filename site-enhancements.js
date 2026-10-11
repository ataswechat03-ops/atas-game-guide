(()=>{
  'use strict';

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const STORE={fav:'atas-guide-favorites-v1',recent:'atas-guide-recent-v1'};
  const safeParse=(v,fallback=[])=>{try{const x=JSON.parse(v);return Array.isArray(x)?x:fallback}catch{return fallback}};
  const load=k=>safeParse(localStorage.getItem(k),[]);
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const guideById=id=>(window.GUIDES||[]).find(g=>g.id===id);
  const currentGuideId=()=>location.hash.startsWith('#guide=')?decodeURIComponent(location.hash.slice(7)):'';
  const money=n=>Number.isFinite(n)?`TWD ${Number(n).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—';

  function copyText(text,btn){
    const done=()=>{if(btn){const old=btn.textContent;btn.textContent='已複製 ✓';setTimeout(()=>btn.textContent=old,1200)}};
    if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(done).catch(()=>fallbackCopy(text,done));}
    else fallbackCopy(text,done);
  }
  function fallbackCopy(text,done){const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done?.()}catch{}t.remove();}

  function addStyles(){
    if($('#site-enhance-style'))return;
    const s=document.createElement('style');s.id='site-enhance-style';s.textContent=`
      .detail-actions{display:flex;gap:7px;align-items:center;margin-left:auto;margin-right:8px}.detail-action{border:1px solid #2a4665;background:#0b1a2c;color:#b9cee5;border-radius:9px;padding:7px 10px;font-size:10px;font-weight:800;cursor:pointer}.detail-action:hover,.detail-action.active{border-color:#2f8fff;color:#fff;background:#12335a}
      .personal-box{margin:12px 10px 0;padding-top:11px;border-top:1px solid #1d3046}.personal-title{font-size:10px;color:#61768f;margin:0 0 6px 8px}.personal-links{display:grid;gap:3px}.personal-link{border:0;background:transparent;color:#9eb1c7;text-align:left;padding:7px 9px;border-radius:8px;cursor:pointer;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.personal-link:hover{background:#12263e;color:#fff}.personal-empty{font-size:9px;color:#52677f;padding:5px 9px}
      .std-enhance{margin-top:10px;border-top:1px solid #213b58;padding-top:10px}.std-enhance-actions{display:flex;gap:7px;flex-wrap:wrap}.std-mini-btn{border:1px solid #2b4867;background:#0b1b2d;color:#a9bfd6;border-radius:8px;padding:7px 9px;font-size:10px;font-weight:800;cursor:pointer}.std-mini-btn:hover{border-color:#2f8fff;color:#fff}.std-steps{margin-top:8px;background:#081526;border:1px solid #203b57;border-radius:9px;padding:9px 10px;color:#91a8c0;font-size:10px;line-height:1.65}.std-steps b{color:#dcecff}
      .settle-tools{margin-top:14px;border-top:1px solid #263f5c;padding-top:14px}.settle-tools h4{margin:0 0 5px;font-size:15px}.settle-tools p{margin:0 0 10px;color:#7f93aa;font-size:10px}.settle-tabs{display:flex;gap:7px;margin-bottom:9px}.settle-tab{border:1px solid #29445f;background:#0b192b;color:#9db1c8;border-radius:9px;padding:8px 12px;font-size:10px;font-weight:800;cursor:pointer}.settle-tab.active{background:#177eea;border-color:#2d93ff;color:#fff}.settle-panel{display:none}.settle-panel.active{display:block}.settle-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.settle-field label{display:block;color:#8198b1;font-size:9px;margin-bottom:5px}.settle-field input,.settle-field select{width:100%;box-sizing:border-box;background:#081526;color:#fff;border:1px solid #284663;border-radius:9px;padding:9px 10px;font-size:13px}.settle-answer{margin-top:9px;border-radius:10px;background:#102945;padding:10px 11px}.settle-answer span{display:block;color:#7891aa;font-size:9px}.settle-answer b{display:block;margin-top:3px;font-size:17px;color:#61e7a7}.settle-answer small{display:block;margin-top:5px;color:#91a6bd;line-height:1.5}
      @media(max-width:720px){.detail-head{flex-wrap:wrap}.detail-actions{order:3;width:100%;margin:8px 0 0}.settle-grid{grid-template-columns:1fr}.std-enhance-actions{display:grid;grid-template-columns:1fr 1fr}.personal-box{margin-left:6px;margin-right:6px}}
    `;document.head.appendChild(s);
  }

  function recordRecent(id){
    if(!id||!guideById(id))return;
    const arr=load(STORE.recent).filter(x=>x!==id);arr.unshift(id);save(STORE.recent,arr.slice(0,6));renderPersonal();
  }
  function toggleFavorite(id){
    let arr=load(STORE.fav);arr=arr.includes(id)?arr.filter(x=>x!==id):[id,...arr];save(STORE.fav,arr.slice(0,20));renderPersonal();renderDetailActions();
  }
  function linkList(ids){
    const valid=ids.map(guideById).filter(Boolean);
    if(!valid.length)return '<div class="personal-empty">尚無內容</div>';
    return valid.map(g=>`<button class="personal-link" data-personal-guide="${g.id}">${g.emoji||'•'} ${g.title}</button>`).join('');
  }
  function renderPersonal(){
    const nav=$('#guideNav');if(!nav)return;
    let box=$('#personalGuideBox');
    if(!box){box=document.createElement('div');box.id='personalGuideBox';box.className='personal-box';nav.after(box);}
    box.innerHTML=`<div class="personal-title">我的收藏</div><div class="personal-links">${linkList(load(STORE.fav))}</div><div class="personal-title" style="margin-top:10px">最近查看</div><div class="personal-links">${linkList(load(STORE.recent))}</div>`;
    $$('[data-personal-guide]',box).forEach(b=>b.onclick=()=>typeof openGuide==='function'&&openGuide(b.dataset.personalGuide));
  }

  function renderDetailActions(){
    const head=$('.detail-head');if(!head)return;
    let actions=$('.detail-actions',head);
    if(!actions){actions=document.createElement('div');actions.className='detail-actions';head.insertBefore(actions,$('#closeDetail'));}
    const id=currentGuideId(),fav=load(STORE.fav).includes(id);
    actions.innerHTML=`<button class="detail-action ${fav?'active':''}" data-fav>${fav?'★ 已收藏':'☆ 收藏'}</button><button class="detail-action" data-share>複製教學連結</button>`;
    $('[data-fav]',actions).onclick=()=>toggleFavorite(id);
    $('[data-share]',actions).onclick=e=>copyText(location.href,e.currentTarget);
  }

  const examples={europe:[100,1.90],hk:[100,0.90],malay:[100,-0.8],indo:[100,-1.14],american:[100,-114]};
  function calcSteps(box){
    const kind=box.dataset.stdOdds||'',stake=$('[data-role=stake]',box),odds=$('[data-role=odds]',box),active=$('.std-settle.active',box),steps=$('[data-enh-steps]',box);
    if(!steps||!stake||!odds)return;
    if(stake.value.trim()===''||odds.value.trim()===''){steps.innerHTML='輸入數字後，這裡會顯示逐步計算。';return;}
    const s=Number(stake.value),o=Number(odds.value),status=active?.dataset.settle||'win';
    if(!(s>0)||!Number.isFinite(o)){steps.innerHTML='請先確認本金與賠率格式。';return;}
    let risk=s,profit=NaN,formula='';
    const neg=(kind==='malay'||kind==='indo'||kind==='american')&&o<0;
    if(kind==='europe'){profit=s*(o-1);formula=`${s} × (${o} − 1) = ${profit.toFixed(2)}`;}
    else if(kind==='hk'){profit=s*o;formula=`${s} × ${o} = ${profit.toFixed(2)}`;}
    else if(neg){const r=kind==='american'?Math.abs(o)/100:Math.abs(o);risk=s*r;profit=s;formula=`實際押注：${s} × ${r} = ${risk.toFixed(2)}`;}
    else if(kind==='american'){profit=s*(o/100);formula=`${s} × (${o} ÷ 100) = ${profit.toFixed(2)}`;}
    else {profit=s*o;formula=`${s} × ${o} = ${profit.toFixed(2)}`;}
    let net,total,settleLine='';
    if(status==='halfwin'){net=profit/2;total=risk+net;settleLine=`贏半：${profit.toFixed(2)} ÷ 2 = ${net.toFixed(2)}`;}
    else if(status==='push'){net=0;total=risk;settleLine='走水：實際押注全數退回';}
    else if(status==='halfloss'){net=-risk/2;total=risk/2;settleLine=`輸半：${risk.toFixed(2)} ÷ 2 = ${(risk/2).toFixed(2)} 虧損`;}
    else if(status==='loss'){net=-risk;total=0;settleLine=`全輸：虧損 ${risk.toFixed(2)}`;}
    else {net=profit;total=risk+profit;settleLine=`全贏：淨利 ${profit.toFixed(2)}`;}
    steps.innerHTML=`<b>計算步驟</b><br>${formula}<br>${settleLine}<br>總返還：${money(total)}`;
  }
  function enhanceCalculator(box){
    if(box.dataset.enhanced)return;box.dataset.enhanced='1';
    const x=document.createElement('div');x.className='std-enhance';x.innerHTML=`<div class="std-enhance-actions"><button class="std-mini-btn" data-example>套用範例</button><button class="std-mini-btn" data-copycalc>複製計算結果</button><button class="std-mini-btn" data-clearcalc>清空</button></div><div class="std-steps" data-enh-steps>輸入數字後，這裡會顯示逐步計算。</div>`;box.appendChild(x);
    $('[data-example]',x).onclick=()=>{const [s,o]=examples[box.dataset.stdOdds]||[100,1];$('[data-role=stake]',box).value=s;$('[data-role=odds]',box).value=o;$('[data-role=stake]',box).dispatchEvent(new Event('input',{bubbles:true}));$('[data-role=odds]',box).dispatchEvent(new Event('input',{bubbles:true}));setTimeout(()=>calcSteps(box),20);};
    $('[data-clearcalc]',x).onclick=()=>{['stake','odds'].forEach(r=>{const el=$(`[data-role=${r}]`,box);if(el){el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));}});setTimeout(()=>calcSteps(box),20);};
    $('[data-copycalc]',x).onclick=e=>{const kind=box.dataset.stdOdds,status=$('.std-settle.active',box)?.textContent.trim()||'',$labels=$$('.std-result',box).map(r=>`${$('span',r)?.textContent}: ${$('b',r)?.textContent}`);const txt=[`${({europe:'歐洲盤',hk:'香港盤',malay:'馬來盤',indo:'印尼盤',american:'美國盤'})[kind]}計算`,`本金/基準額：${$('[data-role=stake]',box).value||'—'}`,`賠率：${$('[data-role=odds]',box).value||'—'}`,`結算：${status}`,...$labels].join('\n');copyText(txt,e.currentTarget);};
    box.addEventListener('input',()=>setTimeout(()=>calcSteps(box),20));box.addEventListener('click',e=>{if(e.target.matches('[data-settle]'))setTimeout(()=>calcSteps(box),20);});
    calcSteps(box);
  }

  function judgeSingle(v){return v>1e-9?'W':v<-1e-9?'L':'P';}
  function splitQuarter(line){
    const q=Math.round(line*4)/4,frac=Math.abs(q*4)%2;
    if(frac===1)return [q-0.25,q+0.25];
    return [q,q];
  }
  function combine(a,b){const x=[a,b].sort().join('');if(x==='WW')return '全贏';if(x==='PW')return '贏半';if(x==='PP')return '走水';if(x==='LP')return '輸半';return '全輸';}
  function toolHtml(){return `<div class="settle-tools" id="settleTools"><h4>足球快速判斷器</h4><p>直接判斷讓球盤、大小盤的全贏／贏半／走水／輸半／全輸。</p><div class="settle-tabs"><button class="settle-tab active" data-stab="handicap">讓球盤</button><button class="settle-tab" data-stab="total">大小盤</button></div><div class="settle-panel active" data-spanel="handicap"><div class="settle-grid"><div class="settle-field"><label>你選的球隊進球</label><input type="number" step="1" value="" placeholder="例如 2" data-h-team></div><div class="settle-field"><label>對手進球</label><input type="number" step="1" value="" placeholder="例如 1" data-h-opp></div><div class="settle-field"><label>你的讓球盤</label><input type="number" step="0.25" value="" placeholder="例如 -0.75 / +0.25" data-h-line></div></div><div class="settle-answer"><span>判斷結果</span><b data-h-result>—</b><small data-h-note>輸入比分與讓球後自動判斷。</small></div></div><div class="settle-panel" data-spanel="total"><div class="settle-grid"><div class="settle-field"><label>全場總進球</label><input type="number" step="1" value="" placeholder="例如 3" data-t-goals></div><div class="settle-field"><label>大小盤</label><input type="number" step="0.25" value="" placeholder="例如 2.75" data-t-line></div><div class="settle-field"><label>投注方向</label><select data-t-side><option value="over">大</option><option value="under">小</option></select></div></div><div class="settle-answer"><span>判斷結果</span><b data-t-result>—</b><small data-t-note>輸入總進球與大小盤後自動判斷。</small></div></div></div>`;}
  function bindSettlementTools(root){
    $$('[data-stab]',root).forEach(b=>b.onclick=()=>{$$('[data-stab]',root).forEach(x=>x.classList.toggle('active',x===b));$$('[data-spanel]',root).forEach(p=>p.classList.toggle('active',p.dataset.spanel===b.dataset.stab));});
    const hu=()=>{const a=$('[data-h-team]',root).value,b=$('[data-h-opp]',root).value,l=$('[data-h-line]',root).value,res=$('[data-h-result]',root),note=$('[data-h-note]',root);if(a===''||b===''||l===''){res.textContent='—';note.textContent='輸入比分與讓球後自動判斷。';return;}const team=Number(a),opp=Number(b),line=Number(l),parts=splitQuarter(line),outs=parts.map(x=>judgeSingle(team+x-opp)),ans=combine(outs[0],outs[1]);res.textContent=ans;note.textContent=`${team}:${opp}，讓球 ${line>=0?'+':''}${line} → 拆盤 ${parts.map(x=>(x>=0?'+':'')+x).join(' / ')} → ${outs.join(' / ')}`;};
    const tu=()=>{const g=$('[data-t-goals]',root).value,l=$('[data-t-line]',root).value,side=$('[data-t-side]',root).value,res=$('[data-t-result]',root),note=$('[data-t-note]',root);if(g===''||l===''){res.textContent='—';note.textContent='輸入總進球與大小盤後自動判斷。';return;}const goals=Number(g),line=Number(l),parts=splitQuarter(line),outs=parts.map(x=>judgeSingle(side==='over'?goals-x:x-goals)),ans=combine(outs[0],outs[1]);res.textContent=ans;note.textContent=`總進球 ${goals}，${side==='over'?'大':'小'} ${line} → 拆盤 ${parts.join(' / ')} → ${outs.join(' / ')}`;};
    $$('[data-h-team],[data-h-opp],[data-h-line]',root).forEach(x=>x.addEventListener('input',hu));$$('[data-t-goals],[data-t-line]',root).forEach(x=>x.addEventListener('input',tu));$('[data-t-side]',root).addEventListener('change',tu);
  }
  function ensureSettlementTools(){
    const wrap=$('#std-top-wrap');if(!wrap||$('#settleTools'))return;
    wrap.insertAdjacentHTML('afterend',toolHtml());bindSettlementTools($('#settleTools'));
  }

  function scan(){
    $$('.std-odds').forEach(enhanceCalculator);ensureSettlementTools();renderDetailActions();
    const id=currentGuideId();if(id)recordRecent(id);
  }

  addStyles();renderPersonal();
  setTimeout(scan,350);
  new MutationObserver(()=>setTimeout(scan,40)).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(scan,60));
})();