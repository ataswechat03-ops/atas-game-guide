(()=>{
  'use strict';

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const fmt=n=>Number.isFinite(n)?Number(n).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:4}):'—';
  const money=n=>Number.isFinite(n)?`TWD ${Number(n).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—';

  const FORMATS={
    europe:{name:'歐洲盤',placeholder:'1.90',valid:o=>o>1,toDecimal:o=>o},
    hk:{name:'香港盤',placeholder:'0.90',valid:o=>o>=0,toDecimal:o=>1+o},
    malay:{name:'馬來盤',placeholder:'-0.80',valid:o=>o!==0&&Math.abs(o)<=1,toDecimal:o=>o>0?1+o:1+1/Math.abs(o)},
    indo:{name:'印尼盤',placeholder:'-1.14',valid:o=>o!==0&&Math.abs(o)>=1,toDecimal:o=>o>0?1+o:1+1/Math.abs(o)},
    american:{name:'美國盤',placeholder:'-114',valid:o=>o!==0&&Math.abs(o)>=100,toDecimal:o=>o>0?1+o/100:1+100/Math.abs(o)}
  };
  const SETTLES={win:'全贏',halfwin:'贏半',push:'走水',halfloss:'輸半',loss:'全輸'};

  function effectiveMultiplier(decimal,status){
    if(status==='win')return decimal;
    if(status==='halfwin')return (decimal+1)/2;
    if(status==='push')return 1;
    if(status==='halfloss')return 0.5;
    return 0;
  }

  function addStyle(){
    if($('#parlay-tool-style'))return;
    const s=document.createElement('style');s.id='parlay-tool-style';s.textContent=`
      .parlay-wrap{margin:18px 0 24px;border:1px solid #274763;border-radius:18px;background:linear-gradient(180deg,#0b1b2d,#081522);padding:16px}
      .parlay-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.parlay-head h3{margin:3px 0 4px;font-size:20px}.parlay-head p{margin:0;color:#7f94aa;font-size:11px;line-height:1.6}.parlay-badge{font-size:9px;border:1px solid #315276;color:#9fc8f5;border-radius:999px;padding:5px 8px;white-space:nowrap}
      .parlay-stake{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end;margin-bottom:10px}.parlay-field label{display:block;color:#8399b1;font-size:9px;margin-bottom:5px}.parlay-field input,.parlay-field select{width:100%;box-sizing:border-box;background:#071423;color:#fff;border:1px solid #294766;border-radius:9px;padding:9px 10px;font-size:13px}.parlay-add{border:1px solid #2e8df2;background:#177eea;color:#fff;border-radius:9px;padding:9px 13px;font-size:11px;font-weight:800;cursor:pointer;height:36px}
      .parlay-list{display:grid;gap:8px}.parlay-leg{display:grid;grid-template-columns:32px 1.2fr 1fr 1fr 36px;gap:7px;align-items:end;background:#0d233a;border:1px solid #213d59;border-radius:11px;padding:9px}.parlay-no{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#153454;color:#7ec2ff;font-weight:900;font-size:11px;margin-bottom:3px}.parlay-remove{height:34px;border:1px solid #553244;background:#241823;color:#ff9aa8;border-radius:8px;cursor:pointer;font-size:15px}
      .parlay-results{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:11px}.parlay-result{background:#102b47;border-radius:11px;padding:10px}.parlay-result span{display:block;color:#8099b4;font-size:9px}.parlay-result b{display:block;margin-top:4px;color:#63e6aa;font-size:16px}.parlay-result b.warn{color:#ffbd66}.parlay-note{margin:9px 0 0;color:#7f93a9;font-size:9px;line-height:1.6}.parlay-actions{display:flex;gap:7px;margin-top:9px}.parlay-mini{border:1px solid #2c4966;background:#0a1929;color:#a9bdd2;border-radius:8px;padding:7px 9px;font-size:10px;font-weight:800;cursor:pointer}
      @media(max-width:760px){.parlay-leg{grid-template-columns:28px 1fr 1fr}.parlay-leg .parlay-settle{grid-column:2/3}.parlay-remove{grid-column:3/4;grid-row:2}.parlay-results{grid-template-columns:1fr 1fr}.parlay-head{display:block}.parlay-badge{display:inline-block;margin-top:7px}}
    `;document.head.appendChild(s);
  }

  function legHtml(i,format='europe',odds='',status='win'){
    return `<div class="parlay-leg" data-parlay-leg>
      <div class="parlay-no">${i}</div>
      <div class="parlay-field"><label>盤口格式</label><select data-format>${Object.entries(FORMATS).map(([k,v])=>`<option value="${k}" ${k===format?'selected':''}>${v.name}</option>`).join('')}</select></div>
      <div class="parlay-field"><label>賠率</label><input data-odds type="number" step="any" value="${odds}" placeholder="${FORMATS[format].placeholder}"></div>
      <div class="parlay-field parlay-settle"><label>結算</label><select data-settle>${Object.entries(SETTLES).map(([k,v])=>`<option value="${k}" ${k===status?'selected':''}>${v}</option>`).join('')}</select></div>
      <button type="button" class="parlay-remove" data-remove title="刪除">×</button>
    </div>`;
  }

  function recalc(root){
    const stakeEl=$('[data-parlay-stake]',root),stake=Number(stakeEl.value),legs=$$('[data-parlay-leg]',root);
    let combined=1,validCount=0,hasInvalid=false,detail=[];
    legs.forEach((leg,idx)=>{
      const kind=$('[data-format]',leg).value,c=FORMATS[kind],oddsEl=$('[data-odds]',leg),raw=oddsEl.value.trim(),status=$('[data-settle]',leg).value;
      oddsEl.placeholder=c.placeholder;
      if(raw==='')return;
      const o=Number(raw);
      if(!Number.isFinite(o)||!c.valid(o)){hasInvalid=true;detail.push(`第 ${idx+1} 關賠率格式有誤`);return;}
      const d=c.toDecimal(o),eff=effectiveMultiplier(d,status);
      combined*=eff;validCount++;
      detail.push(`第 ${idx+1} 關：${c.name} ${o} → 歐洲盤 ${fmt(d)}；${SETTLES[status]}後倍率 ${fmt(eff)}`);
    });

    const combinedEl=$('[data-parlay-combined]',root),returnEl=$('[data-parlay-return]',root),profitEl=$('[data-parlay-profit]',root),countEl=$('[data-parlay-count]',root),note=$('[data-parlay-note]',root);
    countEl.textContent=`${validCount} 關`;
    if(hasInvalid){combinedEl.textContent='請檢查';returnEl.textContent=profitEl.textContent='—';combinedEl.classList.add('warn');note.textContent=detail.join(' ｜ ');return;}
    combinedEl.classList.remove('warn');
    if(!validCount){combinedEl.textContent=returnEl.textContent=profitEl.textContent='—';note.textContent='輸入每一關賠率後自動計算。';return;}
    combinedEl.textContent=fmt(combined);
    if(stake>0){const total=stake*combined,profit=total-stake;returnEl.textContent=money(total);profitEl.textContent=money(profit);}else{returnEl.textContent=profitEl.textContent='—';}
    note.textContent=detail.join(' ｜ ');
  }

  function bind(root){
    const list=$('[data-parlay-list]',root);
    const renumber=()=>$$('[data-parlay-leg]',list).forEach((leg,i)=>{$('.parlay-no',leg).textContent=i+1;});
    const add=(format='europe',odds='',status='win')=>{const d=document.createElement('div');d.innerHTML=legHtml($$('[data-parlay-leg]',list).length+1,format,odds,status);list.appendChild(d.firstElementChild);renumber();recalc(root);};
    root.addEventListener('input',()=>recalc(root));root.addEventListener('change',()=>recalc(root));
    root.addEventListener('click',e=>{
      if(e.target.matches('[data-remove]')){const legs=$$('[data-parlay-leg]',list);if(legs.length<=2)return;e.target.closest('[data-parlay-leg]').remove();renumber();recalc(root);}
      if(e.target.matches('[data-add-leg]')){if($$('[data-parlay-leg]',list).length<10)add();}
      if(e.target.matches('[data-parlay-example]')){list.innerHTML='';add('europe','1.80','win');add('europe','1.95','win');add('europe','2.10','win');$('[data-parlay-stake]',root).value='100';recalc(root);}
      if(e.target.matches('[data-parlay-clear]')){list.innerHTML='';add();add();$('[data-parlay-stake]',root).value='';recalc(root);}
    });
    add();add();recalc(root);
  }

  function mount(){
    addStyle();
    if($('#parlayTool'))return;
    const anchor=$('.section-title');if(!anchor)return;
    const wrap=document.createElement('section');wrap.id='parlayTool';wrap.className='parlay-wrap';wrap.innerHTML=`
      <div class="parlay-head"><div><span class="parlay-badge">快速工具</span><h3>串關計算器</h3><p>支援 2–10 關、五種賠率格式，以及全贏／贏半／走水／輸半／全輸的串關倍率試算。</p></div><span class="parlay-badge">標準等值賠率換算</span></div>
      <div class="parlay-stake"><div class="parlay-field"><label>下注本金（TWD）</label><input data-parlay-stake type="number" min="0" step="any" value="" placeholder="例如 100"></div><button type="button" class="parlay-add" data-add-leg>＋ 新增一關</button></div>
      <div class="parlay-list" data-parlay-list></div>
      <div class="parlay-results"><div class="parlay-result"><span>有效關數</span><b data-parlay-count>0 關</b></div><div class="parlay-result"><span>串關總倍率</span><b data-parlay-combined>—</b></div><div class="parlay-result"><span>預估總返還</span><b data-parlay-return>—</b></div><div class="parlay-result"><span>預估淨利</span><b data-parlay-profit>—</b></div></div>
      <div class="parlay-actions"><button class="parlay-mini" data-parlay-example>套用 3 關範例</button><button class="parlay-mini" data-parlay-clear>清空</button></div>
      <p class="parlay-note" data-parlay-note>輸入每一關賠率後自動計算。</p>
      <p class="parlay-note">注意：馬來／印尼／美國盤在這裡先轉成等值歐洲盤後做串關試算；FB SPORT 實際投注、限額、提前結算與特殊結算仍以遊戲方最終顯示為準。</p>`;
    anchor.parentNode.insertBefore(wrap,anchor);
    bind(wrap);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();