(()=>{
  'use strict';

  const football=GUIDES.find(g=>g.id==='football');
  if(!football||football.__oddsV2)return;
  football.__oddsV2=true;

  // 足球基本知識只保留導覽與共同玩法；五種賠率各自成為獨立教學。
  const half=football.sections.find(s=>/贏半/.test(s.title));
  const common=football.sections.find(s=>/基本常見投注/.test(s.title));
  const images=football.sections.find(s=>/足球盤口圖解/.test(s.title));
  football.intro='足球共同基礎、讓分與大小盤；五種賠率請從各自的獨立教學進入。';
  football.tags=['足球','讓分','大小盤','1X2','串關','賠率入口'];
  football.sections=[
    {
      title:'01｜賠率盤口入口',
      boxes:[
        ['歐洲盤','獨立教學：看包含本金的總回報倍率。'],
        ['香港盤','獨立教學：看不含本金的淨利倍率。'],
        ['馬來盤','獨立教學：正負小數賠率，另有真實 -0.944 投注單。'],
        ['印尼盤','獨立教學：正負小數賠率，可大於 1。'],
        ['美國盤','獨立教學：正負整數賠率，另有真實 -105 投注單。']
      ],
      note:'五種賠率已完全分開。請回到「體育」分類，直接點選對應盤口教學，不在這一頁混著背公式。'
    },
    half ? {...half,title:'02｜贏半 / 輸半概念'} : null,
    common ? {...common,title:'03｜基本常見投注'} : null,
    images ? {...images,title:'04｜足球盤口圖解'} : null
  ].filter(Boolean);

  const oddsGuides=[
    {
      id:'football-europe',title:'歐洲盤',category:'體育',emoji:'⚽',
      intro:'只看歐洲盤：賠率包含本金，本金 × 賠率＝總返還。',
      tags:['歐洲盤','Decimal','總返還','本金'],
      sections:[
        {title:'01｜歐洲盤怎麼看',boxes:[['只有正數','常見例如 1.50、1.90、2.20。'],['包含本金','歐洲盤顯示的是「總回報倍率」，不是單純淨利倍率。']]},
        {title:'02｜計算公式',boxes:[['總返還','本金 × 歐洲盤賠率'],['淨利','本金 ×（賠率 - 1）'],['範例','賠率 1.90，下注 TWD 1,000 → 總返還 TWD 1,900；淨利 TWD 900。']]},
        {title:'03｜圖解',images:[['歐洲盤｜一看就懂','歐洲盤賠率入門資訊圖表.png']]}
      ]
    },
    {
      id:'football-hongkong',title:'香港盤',category:'體育',emoji:'⚽',
      intro:'只看香港盤：賠率代表淨利倍率，中獎後再加回本金。',
      tags:['香港盤','HK Odds','淨利','本金'],
      sections:[
        {title:'01｜香港盤怎麼看',boxes:[['顯示淨利倍率','例如 0.90 代表每下注 TWD 100，淨贏 TWD 90。'],['本金另外退回','中獎時總返還＝本金＋淨利。']]},
        {title:'02｜計算公式',boxes:[['淨利','本金 × 香港盤賠率'],['總返還','本金＋淨利'],['範例','0.90，下注 TWD 1,000 → 淨利 TWD 900；總返還 TWD 1,900。']]},
        {title:'03｜圖解',images:[['香港盤｜一看就懂','香港盤賠率計算入門圖解.png']]}
      ]
    },
    {
      id:'football-malay',title:'馬來盤',category:'體育',emoji:'⚽',
      intro:'只看馬來盤：正數乘、負數除，並搭配 -0.944 真實投注單。',
      tags:['馬來盤','Malay Odds','-0.944','正數','負數'],
      sections:[
        {title:'01｜馬來盤正數',boxes:[['公式','淨利＝本金 × 賠率'],['範例 +0.90','下注 TWD 100 → 淨贏 TWD 90；中獎後本金再退回。']]},
        {title:'02｜馬來盤負數',boxes:[['公式','以實際下注金額為本金時：淨利＝本金 ÷ |賠率|。'],['範例 -0.944','下注 TWD 94.40 → 淨贏 TWD 100。'],['目標淨利反推','想淨贏 TWD 100 → 所需下注＝100 × 0.944＝TWD 94.40。']],note:'負號是賠率顯示方式，不代表這一注一定會輸。'},
        {title:'03｜真實投注單',images:[['馬來盤 -0.944｜真實投注單','馬來盤負數真實投注單.png'],['馬來盤｜一看就懂','馬來盤新手速懂足球賠率圖解.png']],note:'真實畫面：水晶宮 +0.75，馬來盤 -0.944；總注金 TWD 94.40，目標淨利 TWD 100。'}
      ]
    },
    {
      id:'football-indo',title:'印尼盤',category:'體育',emoji:'⚽',
      intro:'只看印尼盤：正負小數賠率，正數乘、負數除。',
      tags:['印尼盤','Indonesian Odds','正數','負數'],
      sections:[
        {title:'01｜印尼盤正數',boxes:[['公式','淨利＝本金 × 賠率'],['範例 +1.20','下注 TWD 1,000 → 淨贏 TWD 1,200；總返還 TWD 2,200。']]},
        {title:'02｜印尼盤負數',boxes:[['公式','淨利＝本金 ÷ |賠率|'],['範例 -1.25','下注 TWD 1,000 → 淨贏 TWD 800；總返還 TWD 1,800。']],note:'正負號是賠率格式；判斷輸贏仍然看投注結果。'},
        {title:'03｜圖解',images:[['印尼盤｜一看就懂','印尼盤快速計算足球資訊圖.png']]}
      ]
    },
    {
      id:'football-american',title:'美國盤',category:'體育',emoji:'⚽',
      intro:'只看美國盤：正數看下 100 可贏多少；負數看要下多少才贏 100。',
      tags:['美國盤','American Odds','-105','正數','負數'],
      sections:[
        {title:'01｜美國盤正數',boxes:[['怎麼看','例如 +120：下注 TWD 100，淨贏 TWD 120。'],['公式','淨利＝本金 × 賠率 ÷ 100']]},
        {title:'02｜美國盤負數',boxes:[['怎麼看','例如 -105：要下注 TWD 105，才能淨贏 TWD 100。'],['公式','淨利＝本金 × 100 ÷ |賠率|'],['範例 -105','下注 TWD 105 → 淨贏 TWD 100；中獎總回收 TWD 205。']]},
        {title:'03｜真實投注單',images:[['美國盤 -105｜真實投注單','美國盤負數真實投注單.png'],['美國盤｜一看就懂','美國盤投注教學資訊圖表.png']],note:'真實畫面：諾定咸森林 0.0，美國盤 -105；風險 TWD 105.00，獲勝 TWD 100.00。'}
      ]
    }
  ];

  const existing=new Set(GUIDES.map(g=>g.id));
  oddsGuides.forEach(g=>{if(!existing.has(g.id))GUIDES.push(g);});

  // 為五個獨立教學設定首頁封面。
  CUSTOM_IMAGES['football-europe']=[['歐洲盤','歐洲盤賠率入門資訊圖表.png']];
  CUSTOM_IMAGES['football-hongkong']=[['香港盤','香港盤賠率計算入門圖解.png']];
  CUSTOM_IMAGES['football-malay']=[['馬來盤','馬來盤新手速懂足球賠率圖解.png']];
  CUSTOM_IMAGES['football-indo']=[['印尼盤','印尼盤快速計算足球資訊圖.png']];
  CUSTOM_IMAGES['football-american']=[['美國盤','美國盤投注教學資訊圖表.png']];

  // 把原本混合式計算器改成三個完全獨立的計算器。
  const oldSelect=document.querySelector('#oddsType');
  const panel=oldSelect?.closest('.training-panel');
  if(panel){
    const style=document.createElement('style');
    style.textContent=`
      .odds-v2-list{display:grid;gap:10px;margin-top:12px}.odds-v2{border:1px solid #263f5c;background:#0b192b;border-radius:13px;padding:12px}.odds-v2 h4{margin:0 0 9px;font-size:13px}.odds-v2 .mini{color:#7f91a7;font-size:9px;line-height:1.55;margin:7px 0 0}.odds-v2-result{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.odds-v2-result>div{background:#10243b;border-radius:9px;padding:8px}.odds-v2-result span{display:block;color:#7890aa;font-size:8px}.odds-v2-result b{display:block;font-size:14px;margin-top:2px}.odds-v2 .calc-row{margin-bottom:7px}.odds-mode{margin-bottom:8px}
    `;
    document.head.appendChild(style);
    panel.innerHTML=`
      <span class="tool-tag">快速工具</span>
      <h3>三種盤口｜獨立計算</h3>
      <p class="hint">馬來盤、印尼盤、美國盤完全分開輸入與計算，避免新人混淆。</p>
      <div class="odds-v2-list">
        <div class="odds-v2">
          <h4>馬來盤計算器</h4>
          <div class="calc-field odds-mode"><label>計算模式</label><select id="mlMode"><option value="stake">我有多少下注本金</option><option value="target">我想淨贏多少</option></select></div>
          <div class="calc-row"><div class="calc-field"><label id="mlAmountLabel">下注本金（TWD）</label><input id="mlAmount" type="number" step="any" value="94.4"></div><div class="calc-field"><label>馬來盤賠率</label><input id="mlOdds" type="number" step="any" value="-0.944"></div></div>
          <div class="odds-v2-result"><div><span id="mlOut1Label">淨利</span><b id="mlOut1">—</b></div><div><span id="mlOut2Label">總回收</span><b id="mlOut2">—</b></div></div>
          <p class="mini">負數範例：-0.944，下注 94.40 → 淨贏 100。</p>
        </div>
        <div class="odds-v2">
          <h4>印尼盤計算器</h4>
          <div class="calc-row"><div class="calc-field"><label>下注本金（TWD）</label><input id="idStake" type="number" step="any" value="1000"></div><div class="calc-field"><label>印尼盤賠率</label><input id="idOdds" type="number" step="any" value="-1.25"></div></div>
          <div class="odds-v2-result"><div><span>淨利</span><b id="idProfit">—</b></div><div><span>總返還</span><b id="idTotal">—</b></div></div>
          <p class="mini">正數：本金 × 賠率；負數：本金 ÷ |賠率|。</p>
        </div>
        <div class="odds-v2">
          <h4>美國盤計算器</h4>
          <div class="calc-row"><div class="calc-field"><label>下注本金（TWD）</label><input id="usStake" type="number" step="any" value="105"></div><div class="calc-field"><label>美國盤賠率</label><input id="usOdds" type="number" step="any" value="-105"></div></div>
          <div class="odds-v2-result"><div><span>淨利</span><b id="usProfit">—</b></div><div><span>總返還</span><b id="usTotal">—</b></div></div>
          <p class="mini">負數 -105：下注 105 → 淨贏 100。</p>
        </div>
      </div>`;

    const fmt=n=>Number.isFinite(n)?`TWD ${Number(n).toLocaleString('zh-TW',{maximumFractionDigits:2})}`:'—';
    const val=id=>Number(document.querySelector(id)?.value);
    function calcMalay(){
      const mode=document.querySelector('#mlMode').value,amount=val('#mlAmount'),odds=val('#mlOdds');
      const a=Math.abs(odds);
      if(!(amount>0)||!a){document.querySelector('#mlOut1').textContent='—';document.querySelector('#mlOut2').textContent='—';return;}
      if(mode==='stake'){
        const profit=odds>0?amount*odds:amount/a;
        document.querySelector('#mlAmountLabel').textContent='下注本金（TWD）';
        document.querySelector('#mlOut1Label').textContent='淨利';
        document.querySelector('#mlOut2Label').textContent='總回收';
        document.querySelector('#mlOut1').textContent=fmt(profit);
        document.querySelector('#mlOut2').textContent=fmt(amount+profit);
      }else{
        const stake=odds>0?amount/odds:amount*a;
        document.querySelector('#mlAmountLabel').textContent='目標淨利（TWD）';
        document.querySelector('#mlOut1Label').textContent='所需下注';
        document.querySelector('#mlOut2Label').textContent='中獎總回收';
        document.querySelector('#mlOut1').textContent=fmt(stake);
        document.querySelector('#mlOut2').textContent=fmt(stake+amount);
      }
    }
    function calcIndo(){
      const stake=val('#idStake'),odds=val('#idOdds'),a=Math.abs(odds);
      if(!(stake>0)||!a){document.querySelector('#idProfit').textContent='—';document.querySelector('#idTotal').textContent='—';return;}
      const profit=odds>0?stake*odds:stake/a;
      document.querySelector('#idProfit').textContent=fmt(profit);document.querySelector('#idTotal').textContent=fmt(stake+profit);
    }
    function calcUS(){
      const stake=val('#usStake'),odds=val('#usOdds'),a=Math.abs(odds);
      if(!(stake>0)||!a){document.querySelector('#usProfit').textContent='—';document.querySelector('#usTotal').textContent='—';return;}
      const profit=odds>0?stake*odds/100:stake*100/a;
      document.querySelector('#usProfit').textContent=fmt(profit);document.querySelector('#usTotal').textContent=fmt(stake+profit);
    }
    ['#mlAmount','#mlOdds'].forEach(s=>document.querySelector(s).addEventListener('input',calcMalay));
    document.querySelector('#mlMode').addEventListener('change',()=>{document.querySelector('#mlAmount').value=document.querySelector('#mlMode').value==='target'?100:94.4;calcMalay();});
    ['#idStake','#idOdds'].forEach(s=>document.querySelector(s).addEventListener('input',calcIndo));
    ['#usStake','#usOdds'].forEach(s=>document.querySelector(s).addEventListener('input',calcUS));
    calcMalay();calcIndo();calcUS();
  }

  if(typeof renderAll==='function')renderAll();
})();