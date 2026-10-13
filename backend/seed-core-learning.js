import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const DB_PATH=process.env.DB_PATH||path.resolve(process.cwd(),'atas-guide.db');
const files=[
  'seed-electronic-guides.json',
  'seed-live-guides.json',
  'seed-sports-guides.json',
  'seed-electronic-advanced.json',
  'seed-live-advanced.json',
  'seed-sports-advanced.json'
];

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
`);

const insert=db.prepare('INSERT OR IGNORE INTO content(type,slug,title,category,body,sort_order,published,updated_at) VALUES(?,?,?,?,?,?,?,CURRENT_TIMESTAMP)');
const seed=db.transaction(items=>{let count=0;for(const x of items){if(x?.type!=='guide'||!x.slug||!x.title)continue;const r=insert.run(x.type,x.slug,x.title,x.category||'',JSON.stringify(x.body||{}),Number(x.sort_order)||0,x.published===false?0:1);count+=r.changes}return count});
let total=0;
for(const file of files){
  const p=path.resolve(process.cwd(),file);
  if(!fs.existsSync(p))continue;
  try{const items=JSON.parse(fs.readFileSync(p,'utf8'));const count=seed(Array.isArray(items)?items:[]);total+=count;if(count)console.log(`Seeded ${count} guide(s) from ${file}`)}catch(e){console.error(`Seed failed for ${file}:`,e.message)}
}
console.log(`Core learning seed complete: ${total} new guide(s)`);
db.close();
