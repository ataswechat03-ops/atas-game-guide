(()=>{
'use strict';
const $=s=>document.querySelector(s);
const DEFAULT_API='https://atas-game-guide-api-production.up.railway.app/api';
const apiBase=()=>($('#apiBase')?.value.trim()||localStorage.getItem('atas-admin-api')||DEFAULT_API).replace(/\/$/,'');
const authToken=()=>sessionStorage.getItem('atas-admin-token')||'';
const status=(text,bad=false)=>{const el=$('#editorMsg')||$('#importMsg');if(el){el.textContent=text;el.style.color=bad?'#ff9ca6':'#72e2ac'}};

async function upload(file){
  if(!file)return null;
  if(file.size>12*1024*1024)throw new Error('圖片請控制在 12MB 內');
  status('圖片上傳中…');
  const r=await fetch(apiBase()+'/upload',{method:'POST',headers:{Authorization:`Bearer ${authToken()}`,'Content-Type':file.type},body:file});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||`上傳失敗 HTTP ${r.status}`);
  status('圖片上傳完成');
  return j.url;
}

function refreshCover(){
  const input=$('#edCover'),img=$('#coverPreview'),empty=$('#coverEmpty');
  if(!input||!img||!empty)return;
  const url=input.value.trim();
  if(url){img.src=url;img.style.display='block';empty.style.display='none'}else{img.removeAttribute('src');img.style.display='none';empty.style.display='block'}
}

function setupCover(){
  const btn=$('#uploadCoverBtn'),file=$('#coverFile'),input=$('#edCover');
  if(!btn||!file||!input||btn.dataset.ready)return;
  btn.dataset.ready='1';
  btn.onclick=()=>file.click();
  file.onchange=async()=>{try{const url=await upload(file.files?.[0]);if(url){input.value=url;refreshCover()}}catch(e){status(e.message,true)}finally{file.value=''}};
  input.addEventListener('input',refreshCover);
}

function setupImageRow(row){
  if(!row||row.dataset.uploadReady)return;
  const btn=row.querySelector('[data-upload-image]');if(!btn)return;
  row.dataset.uploadReady='1';
  btn.onclick=()=>{
    const picker=document.createElement('input');picker.type='file';picker.accept='image/png,image/jpeg,image/webp,image/gif,image/avif';
    picker.onchange=async()=>{try{const f=picker.files?.[0],url=await upload(f);if(url){row.querySelector('[data-b]').value=url;const name=row.querySelector('[data-a]');if(name&&!name.value.trim())name.value=(f?.name||'教學圖片').replace(/\.[^.]+$/,'')}}catch(e){status(e.message,true)}};
    picker.click();
  };
}
function setupAllImageRows(){document.querySelectorAll('.pair-row[data-kind="image"]').forEach(setupImageRow)}

let sectionDragged=null;
function setupSectionDrag(){
  const box=$('#sectionsEditor');if(!box||box.dataset.dragReady)return;box.dataset.dragReady='1';
  box.addEventListener('dragstart',e=>{const card=e.target.closest('.section-editor-card');if(!card)return;sectionDragged=card;card.classList.add('dragging');e.dataTransfer.effectAllowed='move'});
  box.addEventListener('dragend',()=>{sectionDragged?.classList.remove('dragging');sectionDragged=null;box.querySelectorAll('.drag-over').forEach(x=>x.classList.remove('drag-over'))});
  box.addEventListener('dragover',e=>{e.preventDefault();const card=e.target.closest('.section-editor-card');if(!card||card===sectionDragged)return;box.querySelectorAll('.drag-over').forEach(x=>x.classList.remove('drag-over'));card.classList.add('drag-over');const r=card.getBoundingClientRect();const after=e.clientY>r.top+r.height/2;box.insertBefore(sectionDragged,after?card.nextSibling:card)});
}

let rowDragged=null;
async function persistRowOrder(type){
  const all=[...document.querySelectorAll(`#contentRows tr[data-row-type="${CSS.escape(type)}"]`)];
  const token=authToken();if(!token)return;
  status('正在儲存排序…');
  try{
    await Promise.all(all.map((tr,i)=>{
      const sort=i*10;const cell=tr.querySelector('[data-sort-cell]');if(cell)cell.textContent=sort;
      return fetch(apiBase()+'/content/'+tr.dataset.rowId,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({sort_order:sort})}).then(async r=>{if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.error||`HTTP ${r.status}`)}})
    }));
    const m=$('#importMsg');if(m){m.textContent='排序已儲存';m.style.color='#72e2ac'}
  }catch(e){const m=$('#importMsg');if(m){m.textContent='排序儲存失敗：'+e.message;m.style.color='#ff9ca6'}}
}
function setupRows(){
  document.querySelectorAll('#contentRows tr[data-row-id]').forEach(tr=>{
    if(tr.dataset.dragReady)return;tr.dataset.dragReady='1';
    tr.addEventListener('dragstart',e=>{if(e.target.closest('button')){e.preventDefault();return}rowDragged=tr;tr.classList.add('dragging');e.dataTransfer.effectAllowed='move'});
    tr.addEventListener('dragend',()=>{rowDragged?.classList.remove('dragging');rowDragged=null;document.querySelectorAll('#contentRows tr.drag-over').forEach(x=>x.classList.remove('drag-over'))});
    tr.addEventListener('dragover',e=>{if(!rowDragged||rowDragged===tr||rowDragged.dataset.rowType!==tr.dataset.rowType)return;e.preventDefault();tr.classList.add('drag-over')});
    tr.addEventListener('dragleave',()=>tr.classList.remove('drag-over'));
    tr.addEventListener('drop',async e=>{if(!rowDragged||rowDragged===tr||rowDragged.dataset.rowType!==tr.dataset.rowType)return;e.preventDefault();tr.classList.remove('drag-over');const body=$('#contentRows'),r=tr.getBoundingClientRect(),after=e.clientY>r.top+r.height/2;body.insertBefore(rowDragged,after?tr.nextSibling:tr);await persistRowOrder(tr.dataset.rowType)});
  });
}

setupCover();setupSectionDrag();setupAllImageRows();setupRows();refreshCover();
window.addEventListener('atas:admin-render',setupRows);
window.addEventListener('atas:admin-sections-render',()=>{setupSectionDrag();setupAllImageRows()});
window.addEventListener('atas:admin-image-row',e=>setupImageRow(e.detail?.row));
window.addEventListener('atas:admin-editor-open',()=>{setupCover();setupSectionDrag();setupAllImageRows();refreshCover()});
})();