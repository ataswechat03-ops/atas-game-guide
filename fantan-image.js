(function(){
  function applyFantanImage(){
    if(typeof DRIVE_IMAGES==='undefined'){
      setTimeout(applyFantanImage,50);
      return;
    }
    DRIVE_IMAGES.fantan=[['番攤｜一看就懂','番攤一看就懂_開獎下注教學.png']];
    if(typeof renderAll==='function') renderAll();
  }
  applyFantanImage();
})();
