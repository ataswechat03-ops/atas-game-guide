(()=>{
'use strict';
const DEFAULT_API='https://atas-game-guide-api-production.up.railway.app/api';
const BASE=(localStorage.getItem('atas-api-base')||DEFAULT_API).replace(/\/$/,'');
async function request(path,opts={}){
  const res=await fetch(BASE+path,{...opts,headers:{Accept:'application/json',...(opts.headers||{})}});
  const data=await res.json().catch(()=>null);
  if(!res.ok)throw new Error(data?.error||`HTTP ${res.status}`);
  return data;
}
function normalizeGuide(r){
  const b=r&&r.body&&typeof r.body==='object'?r.body:{};
  return {
    id:b.id||r.slug,
    title:b.title||r.title||'未命名教學',
    category:b.category||r.category||'未分類',
    provider:b.provider||'',
    emoji:b.emoji||'📘',
    intro:b.intro||'',
    tags:Array.isArray(b.tags)?b.tags:[],
    cover:b.cover||'',
    sections:Array.isArray(b.sections)?b.sections:[],
    steps:Array.isArray(b.steps)?b.steps:[],
    updatedAt:r.updated_at||r.created_at||''
  };
}
async function loadGuides(){
  const rows=await request('/public/content');
  if(!Array.isArray(rows))throw new Error('教學資料格式錯誤');
  return rows.filter(r=>r.type==='guide').map(normalizeGuide).filter(g=>g.id&&g.title);
}
window.ATAS_V2_API={BASE,request,loadGuides};
})();