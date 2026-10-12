(()=>{
'use strict';
document.addEventListener('pointerup',e=>{
  const btn=e.target.closest?.('#assessmentBody [data-practice]');
  if(!btn||typeof btn.onclick!=='function')return;
  e.preventDefault();
  e.stopPropagation();
  btn.onclick.call(btn,e);
},true);
})();
