(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function install(){
  const editor=window.ATAS_V2_ADMIN_EDITOR;
  const api=window.ATAS_V2_ADMIN_API;
  if(!editor||!api||editor.__deleteInstalled)return;
  const originalBind=editor.bind;
  editor.bind=function(container,items,onRefresh){
    originalBind(container,items,onRefresh);
    container.querySelectorAll('[data-edit-guide]').forEach(edit=>{
      const id=edit.dataset.editGuide;
      const row=edit.closest('tr');
      const actions=edit.closest('.table-actions');
      if(!row||!actions||actions.querySelector(`[data-delete-guide="${id}"]`))return;
      const x=items.find(v=>String(v.id)===String(id));
      if(!x)return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='table-action';
      btn.dataset.deleteGuide=id;
      btn.textContent='刪除';
      btn.style.cssText='color:#c33;border-color:#f1b9b9;background:#fff5f5';
      btn.onclick=async()=>{
        const ok=confirm(`確定要刪除「${x.title}」嗎？\n\n刪除後會移到垃圾桶，可再還原。`);
        if(!ok)return;
        btn.disabled=true;
        btn.textContent='刪除中…';
        try{
          await api.deleteContent(x.id);
          await onRefresh?.();
        }catch(e){
          alert(e.message||'刪除失敗');
          btn.disabled=false;
          btn.textContent='刪除';
        }
      };
      actions.appendChild(btn);
    });
  };
  editor.__deleteInstalled=true;
}
install();
})();