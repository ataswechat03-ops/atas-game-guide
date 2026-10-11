(()=>{
'use strict';
const $=s=>document.querySelector(s);
let extras={};

function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function injectStyle(){
  if(document.getElementById('quizEditorStyle'))return;
  const style=document.createElement('style');style.id='quizEditorStyle';style.textContent=`
    .quiz-question-card{border:1px solid #233e58;background:#0d1d2d;border-radius:14px;padding:12px;margin:10px 0;display:grid;gap:10px}
    .quiz-question-head{display:flex;justify-content:space-between;gap:10px;align-items:center}.quiz-question-head>div{display:flex;gap:6px}.quiz-question-head button,.quiz-option-row button{border:1px solid #2b4a67;background:#0b1b2a;color:#bdd0e1;border-radius:8px;padding:7px 10px;cursor:pointer}.quiz-question-head [data-remove-question],.quiz-option-row [data-remove-option]{color:#ff9ca6;border-color:#57303a}.quiz-option-row{display:grid;grid-template-columns:34px 1fr auto;gap:8px;align-items:center;margin:7px 0}.quiz-option-row input[type=radio]{width:auto;justify-self:center}.quiz-option-row input[type=text]{width:100%;background:#071522;color:#fff;border:1px solid #29445d;border-radius:10px;padding:10px}.quiz-answer-hint{font-size:9px;color:#7b91a7}.quiz-empty{border:1px dashed #29445d;border-radius:12px;padding:18px;text-align:center;color:#71879c;font-size:10px}
    @media(max-width:760px){.quiz-question-head{align-items:flex-start}.quiz-option-row{grid-template-columns:30px 1fr}.quiz-option-row button{grid-column:2}.quiz-question-head>div{flex-wrap:wrap}}
  `;document.head.appendChild(style);
}

function optionRow(card,text='',checked=false){
  const row=document.createElement('div');row.className='quiz-option-row';
  const name='quiz-answer-'+(card.dataset.qid||Date.now()+Math.random());
  row.innerHTML=`<input type="radio" name="${name}" ${checked?'checked':''} title="設為正確答案"><input type="text" value="${esc(text)}" placeholder="輸入選項內容"><button type="button" data-remove-option>刪除</button>`;
  row.querySelector('[data-remove-option]').onclick=()=>{const box=card.querySelector('[data-options]');if(box.children.length<=2)return alert('每題至少需要 2 個選項');const was=row.querySelector('input[type=radio]').checked;row.remove();if(was){const first=box.querySelector('input[type=radio]');if(first)first.checked=true}sync()};
  row.querySelectorAll('input').forEach(x=>x.addEventListener('input',sync));
  return row;
}

function questionCard(data={},index=0){
  const card=document.createElement('article');card.className='quiz-question-card';card.dataset.qid=String(Date.now())+String(Math.random()).slice(2);
  card.innerHTML=`
    <div class="quiz-question-head"><b>題目 <span data-number>${index+1}</span></b><div><button type="button" data-move="up">↑</button><button type="button" data-move="down">↓</button><button type="button" data-remove-question>刪除題目</button></div></div>
    <label>題目內容<textarea data-question rows="3" placeholder="例如：歐洲盤 1.90 代表什麼？">${esc(data.question||data.title||'')}</textarea></label>
    <div><label>選項 <small>點左側圓點設定正確答案</small></label><div data-options></div><button type="button" class="sub-add" data-add-option>＋ 新增選項</button></div>
    <label>答案解說<textarea data-explanation rows="3" placeholder="答題後顯示的說明">${esc(data.explanation||data.explain||'')}</textarea></label>
  `;
  const opts=Array.isArray(data.options)?data.options:(Array.isArray(data.choices)?data.choices:[]);
  const answer=Number.isInteger(data.answer)?data.answer:(Number.isInteger(data.correctIndex)?data.correctIndex:0);
  const box=card.querySelector('[data-options]');(opts.length?opts:['','']).forEach((o,i)=>box.appendChild(optionRow(card,o,i===answer)));
  card.querySelector('[data-add-option]').onclick=()=>{if(box.children.length>=6)return alert('每題最多 6 個選項');box.appendChild(optionRow(card,'',false));sync()};
  card.querySelector('[data-remove-question]').onclick=()=>{if(!confirm('刪除這一題？'))return;card.remove();renumber();sync()};
  card.querySelector('[data-move="up"]').onclick=()=>{const p=card.previousElementSibling;if(p){card.parentNode.insertBefore(card,p);renumber();sync()}};
  card.querySelector('[data-move="down"]').onclick=()=>{const n=card.nextElementSibling;if(n){card.parentNode.insertBefore(n,card);renumber();sync()}};
  card.querySelectorAll('textarea').forEach(x=>x.addEventListener('input',sync));
  return card;
}

function renumber(){[...$('#quizQuestions').children].forEach((c,i)=>{const n=c.querySelector('[data-number]');if(n)n.textContent=i+1})}

function collect(){
  const questions=[...$('#quizQuestions').querySelectorAll('.quiz-question-card')].map(card=>{
    const rows=[...card.querySelectorAll('.quiz-option-row')];
    const options=rows.map(r=>r.querySelector('input[type=text]').value.trim());
    let answer=rows.findIndex(r=>r.querySelector('input[type=radio]').checked);if(answer<0)answer=0;
    return {question:card.querySelector('[data-question]').value.trim(),options,answer,explanation:card.querySelector('[data-explanation]').value.trim()};
  });
  return {...extras,intro:$('#quizIntro').value.trim(),questions};
}

function sync(){const hidden=$('#quizBody');if(hidden)hidden.value=JSON.stringify(collect(),null,2)}

function render(body={}){
  injectStyle();
  const known=new Set(['intro','questions']);extras={};Object.entries(body||{}).forEach(([k,v])=>{if(!known.has(k))extras[k]=v});
  $('#quizIntro').value=body.intro||body.description||'';
  const box=$('#quizQuestions');box.innerHTML='';
  const qs=Array.isArray(body.questions)?body.questions:[];
  (qs.length?qs:[{}]).forEach((q,i)=>box.appendChild(questionCard(q,i)));
  renumber();sync();
}

function init(){
  injectStyle();
  const add=$('#addQuizQuestion');if(add)add.onclick=()=>{const box=$('#quizQuestions');box.appendChild(questionCard({},box.children.length));renumber();sync()};
  const intro=$('#quizIntro');if(intro)intro.addEventListener('input',sync);
  window.addEventListener('atas:admin-editor-open',e=>{if(e.detail?.type==='quiz')render(e.detail.body||{})});
  const type=$('#edType');if(type)type.addEventListener('change',()=>{if(type.value==='quiz'){let body={};try{body=JSON.parse($('#quizBody').value||'{}')}catch{}render(body)}});
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();