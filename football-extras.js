(()=>{
  const football=GUIDES.find(g=>g.id==='football');
  if(!football||football.__separateOddsAdded)return;
  football.__separateOddsAdded=true;

  // 保留三種盤口為獨立教學，不合併顯示。
  if(football.sections[1]) football.sections[1].title='05｜贏半 / 輸半概念';
  if(football.sections[2]) football.sections[2].title='06｜基本常見投注';
  if(football.sections[3]) football.sections[3].title='07｜足球盤口圖解';

  football.sections.splice(1,0,
    {
      title:'02｜馬來盤｜獨立教學',
      boxes:[
        ['正數怎麼算','例如 +0.90：下注 TWD 100，淨贏 TWD 90。\n公式：淨利＝本金 × 0.90。\n中獎時再加回本金。'],
        ['負數怎麼算','例如 -0.944：以「下注金額」計算時，下注 TWD 94.40，淨贏 TWD 100。\n公式：淨利＝本金 ÷ 0.944。'],
        ['真實投注單','水晶宮 +0.75，馬來盤 -0.944。\n畫面顯示：總注金 TWD 94.40；總彩金 TWD 100.00。']
      ],
      images:[['馬來盤 -0.944｜真實投注單','馬來盤負數真實投注單.png']],
      note:'快速記：馬來盤正數用乘法；負數用除法。負號是賠率顯示方式，不代表這一注一定會輸。'
    },
    {
      title:'03｜印尼盤｜獨立教學',
      boxes:[
        ['正數怎麼算','例如 +1.20：下注 TWD 1,000，淨贏 TWD 1,200，總返還 TWD 2,200。\n公式：淨利＝本金 × 1.20。'],
        ['負數怎麼算','例如 -1.25：下注 TWD 1,000，淨贏 TWD 800，總返還 TWD 1,800。\n公式：淨利＝本金 ÷ 1.25。'],
        ['新人怎麼記','正數：看本金能贏多少。\n負數：看需要承擔多少，才能贏固定金額。']
      ],
      images:[['印尼盤｜一看就懂','印尼盤快速計算足球資訊圖.png']],
      note:'印尼盤請獨立看自己的正負數與小數賠率，不和其他盤口混在同一篇教學。'
    },
    {
      title:'04｜美國盤｜獨立教學',
      boxes:[
        ['正數怎麼算','例如 +120：下注 TWD 100，淨贏 TWD 120。\n公式：淨利＝本金 × 120 ÷ 100。'],
        ['負數怎麼算','例如 -105：下注 TWD 105，淨贏 TWD 100。\n公式：淨利＝本金 × 100 ÷ 105。'],
        ['真實投注單','諾定咸森林 0.0，美國盤 -105。\n畫面顯示：風險 TWD 105.00；獲勝 TWD 100.00。']
      ],
      images:[['美國盤 -105｜真實投注單','美國盤負數真實投注單.png']],
      note:'快速記：美國盤正數＝下 100 可以贏多少；負數＝要下多少才能贏 100。'
    }
  );

  const baseRenderSection=renderSection;
  renderSection=function(s){
    let html=baseRenderSection(s);
    if(!s.images?.length)return html;
    const gallery=`<div class="football-grid">${s.images.map(([name,file])=>`<div class="football-img" data-img="${esc(file)}" data-name="${esc(name)}"><img src="${imageUrl(file)}" alt="${esc(name)}"><b>${esc(name)}｜點擊看大圖</b></div>`).join('')}</div>`;
    return html.replace('</section>',gallery+'</section>');
  };

  if(typeof renderAll==='function')renderAll();
})();
