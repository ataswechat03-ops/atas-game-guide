(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const API=()=>($('#apiBase')?.value.trim()||localStorage.getItem('atas-admin-api')||'https://atas-game-guide-api-production.up.railway.app/api').replace(/\/$/,'');
const TOKEN=()=>sessionStorage.getItem('atas-admin-token')||'';
async function req(path,opts={}){const r=await fetch(API()+path,{...opts,headers:{'Content-Type':'application/json',...(TOKEN()?{Authorization:`Bearer ${TOKEN()}`}:{}) ,...(opts.headers||{})}});if(r.status===204)return null;const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||`HTTP ${r.status}`);return j}
function collectSteps(){return $$('#stepList .step-card').map(x=>({title:x.querySelector('[data-step-title]')?.value.trim()||'',text:x.querySelector('[data-step-text]')?.value.trim()||'',image:x.querySelector('[data-step-image]')?.value.trim()||'',video:x.querySelector('[data-step-video]')?.value.trim()||'',note:x.querySelector('[data-step-note]')?.value.trim()||''})).filter(x=>x.title||x.text||x.image||x.video||x.note)}
function snapshot(){return {type:$('#edType')?.value||'',slug:$('#edSlug')?.value.trim()||'',provider:$('#edProvider')?.value.trim()||'',steps:collectSteps()}}
async function persist(data){if(data.type!=='guide'||!data.slug)return;for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,i?250:500));let rows;try{rows=await req('/content')}catch{return}const item=rows.find(x=>x.type==='guide'&&x.slug===data.slug);if(!item)continue;const body={...(item.body||{}),provider:data.provider,steps:data.steps};try{await req('/content/'+item.id,{method:'PUT',body:JSON.stringify({body})});const m=$('#importMsg');if(m){m.textContent='教學已儲存，步驟與館別已同步。';m.style.color='#72e2ac'}localStorage.removeItem(`atas-admin-draft:guide:${data.slug}`)}catch(e){console.warn('phase2 persist',e)}return}}
function boot(){const save=$('#saveBtn');if(!save||save.dataset.phase2Persist)return;save.dataset.phase2Persist='1';save.addEventListener('click',()=>{const data=snapshot();persist(data)},true)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();