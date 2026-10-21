import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const DB_PATH=process.env.DB_PATH||path.resolve(process.cwd(),'atas-guide.db');
const guideSeedFiles=[
  'seed-electronic-guides.json',
  'seed-live-guides.json',
  'seed-sports-guides.json',
  'seed-electronic-advanced.json',
  'seed-live-advanced.json',
  'seed-sports-advanced.json',
  'seed-provider-games-batch1.json'
];
const legacyFootballSlugs=['football-europe','football-hongkong','football-malay','football-indo','football-american'];
const GUIDE_CLEANUP_KEY='system_seeded_guides_removed_v1';
const QUESTION_MIGRATION_KEY='question_bank_migrated_v1';
const questionSeedFile='seed-question-bank.json';

fs.mkdirSync(path.dirname(DB_PATH),{recursive:true});
const db=new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('guide','case','quiz')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT '',
  body TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(type,slug)
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);

function seededGuideSlugs(){
  const slugs=new Set(legacyFootballSlugs);
  for(const file of guideSeedFiles){
    const p=path.resolve(process.cwd(),file);
    if(!fs.existsSync(p))continue;
    try{
      const items=JSON.parse(fs.readFileSync(p,'utf8'));
      for(const x of (Array.isArray(items)?items:[]))if(x?.type==='guide'&&x.slug)slugs.add(String(x.slug));
    }catch(e){console.error(`Guide cleanup list failed for ${file}:`,e.message)}
  }
  return [...slugs];
}

function removeSystemGuidesOnce(){
  const existing=db.prepare('SELECT value FROM settings WHERE key=?').get(GUIDE_CLEANUP_KEY);
  if(existing)return;
  const slugs=seededGuideSlugs();
  const tx=db.transaction(list=>{
    let removed=0;
    const del=db.prepare('DELETE FROM content WHERE type=\'guide\' AND slug=?');
    for(const slug of list)removed+=del.run(slug).changes;
    db.prepare('INSERT INTO settings(key,value) VALUES(?,?)').run(GUIDE_CLEANUP_KEY,JSON.stringify({done:true,at:new Date().toISOString(),removed,slugs:list.length}));
    return removed;
  });
  const removed=tx(slugs);
  console.log(`System guide cleanup complete: ${removed} guide(s) removed; automatic guide seeding is disabled`);
}
removeSystemGuidesOnce();

const insert=db.prepare('INSERT OR IGNORE INTO content(type,slug,title,category,body,sort_order,published,updated_at) VALUES(?,?,?,?,?,?,?,CURRENT_TIMESTAMP)');
function migrateQuestionBankOnce(){
  const existing=db.prepare('SELECT value FROM settings WHERE key=?').get(QUESTION_MIGRATION_KEY);
  if(existing)return;
  const p=path.resolve(process.cwd(),questionSeedFile);
  if(!fs.existsSync(p)){console.error(`Question bank migration skipped: ${questionSeedFile} not found`);return}
  try{
    const items=JSON.parse(fs.readFileSync(p,'utf8'));
    const tx=db.transaction(list=>{
      let count=0;
      for(const x of (Array.isArray(list)?list:[])){
        if(x?.type!=='quiz'||!x.slug||!x.title)continue;
        const r=insert.run('quiz',x.slug,x.title,x.category||'',JSON.stringify(x.body||{}),Number(x.sort_order)||0,x.published===false?0:1);
        count+=r.changes;
      }
      db.prepare('INSERT INTO settings(key,value) VALUES(?,?)').run(QUESTION_MIGRATION_KEY,JSON.stringify({done:true,at:new Date().toISOString(),inserted:count}));
      return count;
    });
    const count=tx(items);
    console.log(`Question bank migration complete: ${count} managed question(s) inserted`);
  }catch(e){
    console.error('Question bank migration failed:',e.message);
  }
}
migrateQuestionBankOnce();

db.close();
