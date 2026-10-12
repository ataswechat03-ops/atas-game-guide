(()=>{
'use strict';
const API_KEY='atas-api-base';
const DEFAULT_API='https://atas-game-guide-api-production.up.railway.app/api';
const adminApi=localStorage.getItem('atas-admin-api')||'';
const api=(localStorage.getItem(API_KEY)||adminApi||DEFAULT_API).replace(/\/$/,'');
window.ATAS_CONTENT_MODE='static';
window.ATAS_API_BASE=api;

function normalizeGuide(r){
  const b=r&&r.body&&typeof r.body==='object'?r.body:{};
  return {
    id:b.id||r.slug,
    title:b.title||r.title,
    category:b.category||r.category||'',
    provider:b.provider||'',
    emoji:b.emoji||'📘',
    intro:b.intro||'',
    tags:Array.isArray(b.tags)?b.tags:[],
    cover:b.cover||'',
    sections:Array.isArray(b.sections)?b.sections:[],
    steps:Array.isArray(b.steps)?b.steps:[],
    sort_order:Number(r.sort_order)||0
  };
}

function applyGuides(rows){
  if(typeof GUIDES==='undefined'||!Array.isArray(GUIDES))return false;
  const apiGuides=rows.filter(r=>r.type==='guide').map(normalizeGuide).filter(g=>g.id&&g.title);
  if(!apiGuides.length)return false;
  const apiIds=new Set(apiGuides.map(g=>g.id));
  const localOnly=GUIDES.filter(g=>g?.id&&!apiIds.has(g.id));
  GUIDES.splice(0,GUIDES.length,...apiGuides,...localOnly);
  try{typeof renderCards==='function'&&renderCards();}catch{}
  try{typeof renderNav==='function'&&renderNav();}catch{}
  try{typeof renderStats==='function'&&renderStats();}catch{}
  window.dispatchEvent(new CustomEvent('atas:content-updated',{detail:{guides:apiGuides.length,total:GUIDES.length}}));
  return true;
}

function applyCases(rows){
  const cases=rows.filter(r=>r.type==='case').map(r=>({...(r.body||{}),id:(r.body||{}).id||r.slug,title:(r.body||{}).title||r.title}));
  window.ATAS_API_CASES=cases;
  if(cases.length)window.dispatchEvent(new CustomEvent('atas:cases-updated',{detail:{cases}}));
}

async function load(){
  if(!api)return;
  try{
    const res=await fetch(api+'/public/content',{headers:{Accept:'application/json'}});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const rows=await res.json();
    if(!Array.isArray(rows))throw new Error('invalid payload');
    const changed=applyGuides(rows);
    applyCases(rows);
    window.ATAS_CONTENT_MODE=changed||rows.length?'api':'static';
    window.dispatchEvent(new CustomEvent('atas:content-source',{detail:{mode:window.ATAS_CONTENT_MODE,count:rows.length}}));
  }catch(e){
    console.warn('ATAS API unavailable, using static content.',e);
    window.ATAS_CONTENT_MODE='static';
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();