(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api=()=>window.ATAS_V2_ADMIN_API;
async function render(){
  const host=$('#trashView');
  if(!host)return;
  host.innerHTML='<div class="panel"><h2>垃圾桶</h2><p>讀取中…</p></div>';
  try{
    const items=await api().req('/trash');
    host.innerHTML=`<div class="content-toolbar-head"><div><h2>垃圾桶</h2><small>誤刪的教學可在這裡還原；永久刪除後無法復原。</small></div></div><div class="table-wrap"><table><thead><tr><th>名稱</th><th>類型</th><th>分類</th><th>刪除時間</th><th>操作</th></tr></thead><tbody>${items.map(x=>`<tr><td><b>${esc(x.title)}</b><small>${esc(x.slug)}</small></td><td>${x.type==='guide'?'教學':x.type==='quiz'?'題目':esc(x.type||'—')}</td><td>${esc(x.category||'—')}</td><td>${esc(x.deleted_at||'—')}</td><td><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="table-action" data-restore-trash="${x.id}">還原</button><button class="table-action" data-delete-trash="${x.id}" style="color:#c62828">永久刪除</button></div></td></tr>`).join('')||'<tr><td colspan="5" class="empty-cell">垃圾桶目前是空的</td></tr>'}</tbody></table></div>`;
    $$('[data-restore-trash]',host).forEach(btn=>btn.onclick=async()=>{
      const item=items.find(x=>String(x.id)===btn.dataset.restoreTrash);
      if(!item)return;
      if(!confirm(`確定要還原「${item.title}」嗎？`))return;
      btn.disabled=true;
      try{
        await api().req(`/trash/${item.id}/restore`,{method:'POST'});
        alert(`已還原「${item.title}」`);
        await render();
      }catch(e){alert(e.message)}finally{btn.disabled=false}
    });
    $$('[data-delete-trash]',host).forEach(btn=>btn.onclick=async()=>{
      const item=items.find(x=>String(x.id)===btn.dataset.deleteTrash);
      if(!item)return;
      if(!confirm(`確定要永久刪除「${item.title}」嗎？\n\n此操作完成後將無法還原。`))return;
      btn.disabled=true;
      try{
        await api().req(`/trash/${item.id}`,{method:'DELETE'});
        alert(`已永久刪除「${item.title}」`);
        await render();
      }catch(e){alert(e.message)}finally{btn.disabled=false}
    });
  }catch(e){host.innerHTML=`<div class="panel"><h2>垃圾桶</h2><p>${esc(e.message)}</p></div>`}
}
function init(){
  const btn=$('[data-view="trash"]');
  if(!btn)return;
  btn.addEventListener('click',()=>{
    setTimeout(()=>{
      $('#viewEyebrow').textContent='TRASH';
      $('#viewTitle').textContent='垃圾桶';
    },0);
    render();
  });
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
window.ATAS_V2_ADMIN_TRASH={render};
})();