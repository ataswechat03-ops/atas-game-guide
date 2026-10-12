(()=>{
'use strict';
function applyPreview(){
  const params=new URLSearchParams(location.search);if(params.get('preview')!=='1')return;
  let g=null;try{g=JSON.parse(localStorage.getItem('atas-preview-guide')||'null')}catch{}
  if(!g||!g.id||!g.title||typeof GUIDES==='undefined'||!Array.isArray(GUIDES))return;
  const clean={id:g.id,title:g.title,category:g.category||'未分類',provider:g.provider||'',emoji:g.emoji||'📘',intro:g.intro||'',tags:Array.isArray(g.tags)?g.tags:[],cover:g.cover||'',sections:Array.isArray(g.sections)?g.sections:[],__preview:true};
  const i=GUIDES.findIndex(x=>x.id===clean.id);if(i>=0)GUIDES.splice(i,1,clean);else GUIDES.unshift(clean);
  try{typeof renderAll==='function'&&renderAll()}catch{}
  const badge=document.getElementById('atasPreviewBadge')||document.createElement('div');badge.id='atasPreviewBadge';badge.textContent='預覽模式｜此內容尚未正式發布';Object.assign(badge.style,{position:'fixed',left:'50%',bottom:'18px',transform:'translateX(-50%)',zIndex:'9999',padding:'9px 14px',borderRadius:'999px',background:'#8a5a00',color:'#fff',fontSize:'12px',fontWeight:'700',boxShadow:'0 8px 30px #0008'});document.body.appendChild(badge);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(applyPreview,250));else setTimeout(applyPreview,250);
window.addEventListener('atas:content-source',()=>setTimeout(applyPreview,0));
})();