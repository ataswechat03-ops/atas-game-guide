(()=>{
'use strict';
const RESULT='atas-category-exams-v1',MARK='atas-exam-sync-marker-v1';
function json(k,d={}){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}}
async function sync(){if(typeof window.ATAS_TRAINING_SYNC_EXAM!=='function')return;const results=json(RESULT,{}),marks=json(MARK,{});let changed=false;for(const [cat,r] of Object.entries(results)){if(!r||!Number.isFinite(Number(r.score))||!r.date)continue;const key=`${r.date}:${r.score}`;if(marks[cat]===key)continue;try{await window.ATAS_TRAINING_SYNC_EXAM(cat,Number(r.score));marks[cat]=key;changed=true}catch{}}if(changed)localStorage.setItem(MARK,JSON.stringify(marks))}
setInterval(sync,1800);window.addEventListener('focus',sync);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});setTimeout(sync,600);
})();