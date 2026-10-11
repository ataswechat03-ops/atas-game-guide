(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
function style(){if($('#layout-v2-style'))return;const s=document.createElement('style');s.id='layout-v2-style';s.textContent=`
:root{--atas-card:#0c1b2c;--atas-border:#213c58;--atas-muted:#7890a8;--atas-accent:#4da3ff}
body{scroll-behavior:smooth}
.workspace-nav{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 18px;position:sticky;top:8px;z-index:40;background:rgba(8,17,31,.9);backdrop-filter:blur(12px);padding:8px;border:1px solid #1d3650;border-radius:14px}
.workspace-nav button{border:1px solid #29445f;background:#0c1a2b;color:#a9bfd6;border-radius:10px;padding:9px 12px;font-size:11px;font-weight:800;cursor:pointer}.workspace-nav button:hover{border-color:#4c98df;color:#fff}
.workspace-section{margin:18px 0;border:1px solid var(--atas-border);border-radius:16px;background:linear-gradient(180deg,#0c1b2c,#091522);overflow:hidden}.workspace-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 15px;cursor:pointer}.workspace-head h2{margin:0;font-size:16px}.workspace-head p{margin:2px 0 0;color:var(--atas-muted);font-size:9px}.workspace-toggle{border:1px solid #2b4967;background:#0b1929;color:#9fb8cf;border-radius:8px;padding:6px 9px}.workspace-body{padding:0 15px 15px}.workspace-section.collapsed .workspace-body{display:none}.workspace-section.collapsed .workspace-toggle{transform:rotate(-90deg)}
.hero{padding:24px!important}.hero h2{font-size:clamp(26px,4vw,42px)!important}.hero p{max-width:760px!important}.toolbar{position:relative}
.guide-grid{gap:14px!important}.guide-card{transition:transform .18s ease,border-color .18s ease}.guide-card:hover{transform:translateY(-2px)}
@media(max-width:720px){main{padding-bottom:78px}.workspace-nav{top:4px;overflow:auto;flex-wrap:nowrap}.workspace-nav button{flex:none}.hero{padding:18px!important}.hero p{font-size:12px}.workspace-section{border-radius:13px}.workspace-head{padding:12px}.workspace-body{padding:0 10px 12px}}
`;document.head.appendChild(s)}
function mountNav(){if($('#workspaceNav'))return;const hero=$('.hero');if(!hero)return;const nav=document.createElement('div');nav.id='workspaceNav';nav.className='workspace-nav';nav.innerHTML=`<button data-jump="tools">工具中心</button><button data-jump="cases">案例庫</button><button data-jump="progress">學習進度</button><button data-jump="library">教學庫</button>`;hero.insertAdjacentElement('afterend',nav);nav.onclick=e=>{const b=e.target.closest('button');if(!b)return;const key=b.dataset.jump;const map={tools:'#toolCenter,#std-top-wrap,#oddsConverter,#parlayTool',cases:'#betCases',progress:'#learningProgress',library:'#guideGrid'};const sel=map[key];if(!sel)return;const el=sel.split(',').map(x=>$(x)).find(Boolean);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}}
function wrapSections(){const specs=[
['toolCenter','常用工具','盤口計算、轉換、讓球大小與串關工具'],
['betCases','實際案例','FB SPORT 真實投注與結算案例'],
['learningProgress','學習進度','查看教學完成度與測驗狀態']
];specs.forEach(([id,title,desc])=>{const el=$('#'+id);if(!el||el.closest('.workspace-section'))return;const box=document.createElement('section');box.className='workspace-section';box.innerHTML=`<div class="workspace-head"><div><h2>${title}</h2><p>${desc}</p></div><button class="workspace-toggle" type="button">⌄</button></div><div class="workspace-body"></div>`;el.parentNode.insertBefore(box,el);$('.workspace-body',box).appendChild(el);$('.workspace-head',box).onclick=()=>box.classList.toggle('collapsed')})}
function libraryAnchor(){const grid=$('#guideGrid');if(grid&&!grid.dataset.workspaceAnchor)grid.dataset.workspaceAnchor='1'}
function run(){style();mountNav();wrapSections();libraryAnchor()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{run();setTimeout(run,700);setTimeout(run,1800)});else{run();setTimeout(run,700)}
new MutationObserver(()=>run()).observe(document.documentElement,{childList:true,subtree:true});
})();