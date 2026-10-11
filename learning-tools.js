(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const fmt=n=>Number.isFinite(n)?Number(n).toLocaleString('zh-TW',{maximumFractionDigits:4}):'—';

function styles(){if($('#learning-tools-style'))return;const s=document.createElement('style');s.id='learning-tools-style';s.textContent=`
.learn-panel{margin:18px 0;border:1px solid #294866;background:linear-gradient(180deg,#0c1d31,#091727);border-radius:16px;padding:14px}.learn-tag{display:inline-block;border:1px solid #2c4f72;color:#8ebdf0;background:#0a1b2d;border-radius:999px;padding:4px 8px;font-size:9px;font-weight:800}.learn-panel h3{margin:8px 0 4px;font-size:18px}.learn-panel>p{margin:0 0 12px;color:#8096ae;font-size:10px;line-height:1.6}.conv-grid{display:grid;grid-template-columns:160px 1fr;gap:9px}.conv-grid select,.conv-grid input{width:100%;box-sizing:border-box;background:#081526;color:#fff;border:1px solid #284663;border-radius:10px;padding:10px 11px;font-size:14px}.conv-results{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:10px}.conv-card{background:#102945;border-radius:10px;padding:9px}.conv-card span{display:block;color:#7891aa;font-size:9px}.conv-card b{display:block;margin-top:3px;color:#64e6ad;font-size:15px}.conv-note{margin-top:9px;color:#71879f;font-size:9px;line-height:1.55}.conv-error{color:#ff919b!important}.quiz-box{margin-top:18px;border-top:1px solid #28435f;padding-top:14px}.quiz-head{display:flex;justify-content:space-between;gap:10px;align-items:center}.quiz-head h3{margin:0;font-size:17px}.quiz-score{font-size:10px;color:#7f96ae}.quiz-q{margin-top:10px;background:#0b1a2c;border:1px solid #223d59;border-radius:11px;padding:11px}.quiz-q strong{display:block;font-size:12px;margin-bottom:8px}.quiz-options{display:grid;gap:6px}.quiz-opt{border:1px solid #28445f;background:#091727;color:#afc1d4;border-radius:8px;padding:8px 9px;text-align:left;font-size:10px;cursor:pointer}.quiz-opt.correct{border-color:#35c98a;background:#0e3b31;color:#d8fff0}.quiz-opt.wrong{border-color:#d85a68;background:#3b1720;color:#ffdce1}.quiz-explain{display:none;margin-top:7px;color:#8fa6bd;font-size:9px;line-height:1.55}.quiz-explain.show{display:block}.quiz-reset{margin-top:10px;border:1px solid #2d4c6c;background:#0b1b2e;color:#b5cae0;border-radius:8px;padding:7px 10px;font-size:10px;font-weight:800;cursor:pointer}@media(max-width:720px){.conv-grid{grid-template-columns:1fr}.conv-results{grid-template-columns:1fr 1fr}}
`;document.head.appendChild(s)}

const NAMES={europe:'歐洲盤',hk:'香港盤',malay:'馬來盤',indo:'印尼盤',american:'美國盤'};
function toDecimal(kind,o){if(!Number.isFinite(o))return NaN;if(kind==='europe')return o>1?o:NaN;if(kind==='hk')return o>=0?1+o:NaN;if(kind==='malay'){if(o===0||Math.abs(o)>1)return NaN;return o>0?1+o:1+1/Math.abs(o)}if(kind==='indo'){if(o===0||Math.abs(o)<1)return NaN;return o>0?1+o:1+1/Math.abs(o)}if(kind==='american'){if(o===0||Math.abs(o)<100)return NaN;return o>0?1+o/100:1+100/Math.abs(o)}return NaN}
function fromDecimal(d){const h=d-1;return{europe:d,hk:h,malay:h<=1?h:-1/h,indo:h>=1?h:-1/h,american:h>=1?h*100:-100/h}}
function converterHTML(){return `<section class="learn-panel" id="oddsConverter"><span class="learn-tag">NEW TOOL</span><h3>五種盤口轉換器</h3><p>輸入任一種賠率，自動換算歐洲盤、香港盤、馬來盤、印尼盤與美國盤的等值顯示。</p><div class="conv-grid"><select data-conv-kind>${Object.entries(NAMES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select><input data-conv-value type="number" step="any" placeholder="請輸入賠率，例如 1.90"></div><div class="conv-results">${Object.entries(NAMES).map(([k,v])=>`<div class="conv-card"><span>${v}</span><b data-conv-out="${k}">—</b></div>`).join('')}</div><div class="conv-note" data-conv-note>此工具換算的是等值賠率顯示；FB SPORT 負數盤的「基準贏額／實際押注」仍以本站 FB SPORT 計算器為準。</div></section>`}
function mountConverter(){if($('#oddsConverter'))return;const anchor=$('.training-panel')||$('.hero');if(!anchor)return;const holder=document.createElement('div');holder.innerHTML=converterHTML();const panel=holder.firstElementChild;anchor.insertAdjacentElement('afterend',panel);const kind=$('[data-conv-kind]',panel),input=$('[data-conv-value]',panel),note=$('[data-conv-note]',panel);const run=()=>{const o=Number(input.value);if(input.value.trim()===''){ $$('[data-conv-out]',panel).forEach(x=>x.textContent='—');note.classList.remove('conv-error');return}const d=toDecimal(kind.value,o);if(!Number.isFinite(d)){ $$('[data-conv-out]',panel).forEach(x=>x.textContent='—');note.textContent='賠率格式不符合所選盤口，請檢查數值範圍。';note.classList.add('conv-error');return}const r=fromDecimal(d);Object.entries(r).forEach(([k,v])=>{const el=$(`[data-conv-out="${k}"]`,panel);if(el)el.textContent=(k==='american'&&v>0?'+':'')+fmt(v)});note.textContent=`等值歐洲盤約 ${fmt(d)}。此工具只做賠率格式換算；實際結算請以 FB SPORT 計算器與注單為準。`;note.classList.remove('conv-error')};kind.onchange=run;input.oninput=run}

const QUIZZES={
'football-europe':[
['歐洲盤 1.90、下注 100，全贏的總返還是多少？',['TWD 90','TWD 100','TWD 190'],2,'歐洲盤包含本金：100 × 1.90 = 190。'],
['歐洲盤 2.00 代表下注 100 全贏淨利多少？',['TWD 50','TWD 100','TWD 200'],1,'2.00 的淨利是 100 × (2.00−1)=100。'],
['歐洲盤 1.50 與香港盤等值約多少？',['0.50','1.50','-0.50'],0,'香港盤＝歐洲盤−1，因此 1.50 → 0.50。']],
'football-hongkong':[
['香港盤 0.90、下注 100，全贏淨利是多少？',['TWD 90','TWD 100','TWD 190'],0,'香港盤顯示的是淨利倍率：100 × 0.90=90。'],
['香港盤 1.20 等值歐洲盤約多少？',['1.20','2.20','0.20'],1,'歐洲盤＝香港盤+1，因此 1.20 → 2.20。'],
['香港盤 0.00，全贏時淨利是多少？',['0','100','200'],0,'淨利＝本金×0，因此淨利為 0。']],
'football-malay':[
['FB SPORT 馬來盤 -0.80，基準贏額 100，實際押注是多少？',['TWD 80','TWD 100','TWD 125'],0,'負數盤依本站 FB SPORT 邏輯：100 × 0.80 = 80。'],
['上題若「贏半」，淨利是多少？',['TWD 40','TWD 50','TWD 80'],1,'全贏淨利 100；贏半就是 +50。'],
['馬來盤 -0.80 約等值歐洲盤多少？',['1.80','2.25','2.80'],1,'負馬來盤 -0.80 → 歐洲盤 1 + 1/0.8 = 2.25。']],
'football-indo':[
['FB SPORT 印尼盤 -1.14，基準贏額 100，實際押注是多少？',['TWD 87.72','TWD 100','TWD 114'],2,'負數盤：100 × 1.14 = 114。'],
['上題若「輸半」，虧損是多少？',['TWD 50','TWD 57','TWD 114'],1,'輸半＝實際押注 114 的一半，虧 57。'],
['印尼盤 +1.20，下注 100，全贏淨利是多少？',['TWD 83.33','TWD 100','TWD 120'],2,'正數盤：100 × 1.20 = 120。']],
'football-american':[
['美國盤 -114，基準贏額 100，實際押注是多少？',['TWD 87.72','TWD 114','TWD 214'],1,'-114 表示以 114 的風險對應 100 的基準贏額。'],
['美國盤 +120，下注 100，全贏淨利是多少？',['TWD 100','TWD 120','TWD 220'],1,'正數 +120：100 × 120/100 = 120。'],
['美國盤 -100 約等值歐洲盤多少？',['1.00','2.00','3.00'],1,'-100 對應等值歐洲盤 2.00。']],
'football':[
['讓球 -0.75 會拆成哪兩個盤？',['-0.5 與 -1.0','0 與 -0.5','-0.75 與 -1.0'],0,'四分之一盤會拆成相鄰的兩個半盤：-0.5 / -1.0。'],
['大小 2.75 會拆成哪兩個盤？',['2.0 與 2.5','2.5 與 3.0','2.75 與 3.0'],1,'2.75＝一半 2.5、一半 3.0。'],
['走水代表什麼？',['本金退回','全輸','贏一半'],0,'走水就是該部分投注本金退回。']],
'baccarat':[
['百家樂主要比較哪兩邊點數？',['莊與閒','大與小','紅與黑'],0,'百家樂最基本就是莊家與閒家比點數。'],
['百家樂點數超過 9 時通常怎麼計？',['照原數字','取個位數','直接算 0'],1,'例如 15 點以個位數計為 5 點。'],
['和局通常代表莊與閒怎樣？',['同點','都爆牌','都沒下注'],0,'和局就是雙方最終點數相同。']],
'sicbo':[
['骰寶通常使用幾顆骰子？',['2 顆','3 顆','5 顆'],1,'常見骰寶使用 3 顆骰子。'],
['「大／小」主要看什麼？',['骰子總點數','單顆顏色','下注時間'],0,'大小是依三顆骰子的總點數判斷。'],
['三顆相同點數通常稱為？',['對子','圍骰／豹子','順子'],1,'三顆相同通常稱圍骰或豹子。']],
'roulette':[
['輪盤下注紅／黑屬於哪一類？',['外圍注','單號注','三數注'],0,'紅黑是典型外圍注。'],
['下注單一號碼通常稱為？',['單號','雙列','大／小'],0,'只押一個號碼就是單號注。'],
['輪盤 0 通常屬於紅還是黑？',['紅','黑','都不是'],2,'0 通常使用綠色，既不是紅也不是黑。']],
'fantan':[
['番攤核心是把籌碼反覆按幾個一組移除？',['3','4','5'],1,'傳統番攤以 4 個一組移除，最後看剩餘數。'],
['最後剩 1 顆時，結果是？',['1','3','4'],0,'剩餘數直接對應 1、2、3、4。'],
['如果剛好整除、最後沒有剩餘，通常記為？',['0','4','重開'],1,'整除時通常以 4 表示。']]
};
function quizHTML(id,qs){return `<div class="quiz-box" data-quiz-id="${id}"><div class="quiz-head"><h3>新人快速測驗</h3><span class="quiz-score">0 / ${qs.length}</span></div>${qs.map((q,i)=>`<div class="quiz-q" data-qi="${i}" data-answer="${q[2]}"><strong>${i+1}. ${q[0]}</strong><div class="quiz-options">${q[1].map((o,j)=>`<button type="button" class="quiz-opt" data-opt="${j}">${o}</button>`).join('')}</div><div class="quiz-explain">${q[3]}</div></div>`).join('')}<button type="button" class="quiz-reset">重新作答</button></div>`}
function bindQuiz(box){let score=0,answered=0;const total=$$('.quiz-q',box).length,scoreEl=$('.quiz-score',box);$$('.quiz-q',box).forEach(q=>$$('.quiz-opt',q).forEach(btn=>btn.onclick=()=>{if(q.dataset.done)return;q.dataset.done='1';answered++;const a=Number(q.dataset.answer),picked=Number(btn.dataset.opt);if(picked===a){score++;btn.classList.add('correct')}else{btn.classList.add('wrong');const right=$(`.quiz-opt[data-opt="${a}"]`,q);right?.classList.add('correct')}$('.quiz-explain',q)?.classList.add('show');scoreEl.textContent=`${score} / ${total}${answered===total?' ✓':''}`}));$('.quiz-reset',box).onclick=()=>{score=0;answered=0;scoreEl.textContent=`0 / ${total}`;$$('.quiz-q',box).forEach(q=>{delete q.dataset.done;$$('.quiz-opt',q).forEach(b=>b.classList.remove('correct','wrong'));$('.quiz-explain',q)?.classList.remove('show')})}}
function currentGuide(){return location.hash.startsWith('#guide=')?decodeURIComponent(location.hash.slice(7)):''}
function mountQuiz(){const id=currentGuide(),qs=QUIZZES[id],body=$('#detailBody');if(!body||!qs)return;if($(`.quiz-box[data-quiz-id="${id}"]`,body))return;const h=document.createElement('div');h.innerHTML=quizHTML(id,qs);const box=h.firstElementChild;body.appendChild(box);bindQuiz(box)}

styles();setTimeout(()=>{mountConverter();mountQuiz()},300);const body=$('#detailBody');if(body)new MutationObserver(()=>setTimeout(mountQuiz,80)).observe(body,{childList:true,subtree:false});
})();