(()=>{
'use strict';
const DEFAULT_API='https://atas-game-guide-api-production.up.railway.app/api';
const BASE=(localStorage.getItem('atas-api-base')||DEFAULT_API).replace(/\/$/,'');
const TOKEN_KEY='atas-v2-learner-token';
function token(){return localStorage.getItem(TOKEN_KEY)||''}
function setToken(v){v?localStorage.setItem(TOKEN_KEY,v):localStorage.removeItem(TOKEN_KEY)}
async function request(path,opts={}){
  const headers={Accept:'application/json',...(opts.body?{'Content-Type':'application/json'}:{}),...(opts.headers||{})};
  const res=await fetch(BASE+path,{...opts,headers});
  const data=await res.json().catch(()=>null);
  if(!res.ok)throw new Error(data?.error||`HTTP ${res.status}`);
  return data;
}
async function learnerRequest(path,opts={}){
  const t=token();
  if(!t)throw new Error('請先登入學員帳號');
  return request(path,{...opts,headers:{Authorization:`Bearer ${t}`,...(opts.headers||{})}});
}
function normalizeGuide(r){
  const b=r&&r.body&&typeof r.body==='object'?r.body:{};
  return {id:b.id||r.slug,title:b.title||r.title||'未命名教學',category:b.category||r.category||'未分類',provider:b.provider||'',emoji:b.emoji||'📘',intro:b.intro||'',tags:Array.isArray(b.tags)?b.tags:[],cover:b.cover||'',sections:Array.isArray(b.sections)?b.sections:[],steps:Array.isArray(b.steps)?b.steps:[],updatedAt:r.updated_at||r.created_at||''};
}
async function loadGuides(){const rows=await request('/public/content');if(!Array.isArray(rows))throw new Error('教學資料格式錯誤');return rows.filter(r=>r.type==='guide').map(normalizeGuide).filter(g=>g.id&&g.title)}
async function learnerLogin(username,password){const r=await request('/learner/login',{method:'POST',body:JSON.stringify({username,password})});setToken(r.token);return r}
async function learnerMe(){return learnerRequest('/learner/me')}
async function saveProgress(guide_slug,category,completed=false){return learnerRequest('/learner/progress',{method:'POST',body:JSON.stringify({guide_slug,category,completed})})}
async function saveExam(category,score){return learnerRequest('/learner/exams',{method:'POST',body:JSON.stringify({category,score})})}
function learnerLogout(){setToken('')}
window.ATAS_V2_API={BASE,request,loadGuides,token,setToken,learnerLogin,learnerMe,saveProgress,saveExam,learnerLogout};
})();