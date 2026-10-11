import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const app=express();
const PORT=Number(process.env.PORT||3000);
const IS_PROD=process.env.NODE_ENV==='production';
const JWT_SECRET=process.env.JWT_SECRET||(!IS_PROD?'dev-only-change-me':'');
const ADMIN_USER=process.env.ADMIN_USER||(!IS_PROD?'admin':'');
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||(!IS_PROD?'change-me':'');
const CORS_ORIGIN=process.env.CORS_ORIGIN||(!IS_PROD?'*':'https://ataswechat03-ops.github.io');
const DB_PATH=process.env.DB_PATH||path.resolve(process.cwd(),'atas-guide.db');
const UPLOAD_DIR=process.env.UPLOAD_DIR||path.join(path.dirname(DB_PATH),'uploads');

if(!JWT_SECRET||!ADMIN_USER||!ADMIN_PASSWORD){
  console.error('Missing required production environment variables: JWT_SECRET, ADMIN_USER, ADMIN_PASSWORD');
  process.exit(1);
}

fs.mkdirSync(path.dirname(DB_PATH),{recursive:true});
fs.mkdirSync(UPLOAD_DIR,{recursive:true});
app.disable('x-powered-by');
app.use(cors({origin:CORS_ORIGIN==='*'?true:CORS_ORIGIN.split(',').map(s=>s.trim())}));
app.use('/uploads',express.static(UPLOAD_DIR,{maxAge:'7d',immutable:false}));
app.use(express.json({limit:'4mb'}));

const db=new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
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

function seedMissingFootballGuides(){
  const seedFile=path.resolve(process.cwd(),'seed-football-guides.json');
  if(!fs.existsSync(seedFile))return;
  try{
    const items=JSON.parse(fs.readFileSync(seedFile,'utf8'));
    const insert=db.prepare('INSERT OR IGNORE INTO content(type,slug,title,category,body,sort_order,published,updated_at) VALUES(?,?,?,?,?,?,?,CURRENT_TIMESTAMP)');
    const tx=db.transaction(list=>{let count=0;for(const x of list){const r=insert.run(x.type,x.slug,x.title,x.category||'',JSON.stringify(x.body||{}),Number(x.sort_order)||0,x.published===false?0:1);count+=r.changes}return count});
    const count=tx(Array.isArray(items)?items:[]);
    if(count)console.log(`Seeded ${count} missing football guide(s)`);
  }catch(e){console.error('Football guide seed failed:',e.message)}
}
seedMissingFootballGuides();

const adminHash=bcrypt.hashSync(ADMIN_PASSWORD,12);
function auth(req,res,next){const h=req.headers.authorization||'';const token=h.startsWith('Bearer ')?h.slice(7):'';try{req.user=jwt.verify(token,JWT_SECRET);next()}catch{res.status(401).json({error:'未授權'})}}
function safeParse(s){try{return JSON.parse(s)}catch{return {}}}
function rowToJson(r){return {...r,body:safeParse(r.body),published:!!r.published}}

app.get('/api/health',(req,res)=>res.json({ok:true,service:'ATAS Guide API',database:path.basename(DB_PATH)}));
app.post('/api/login',(req,res)=>{const {username,password}=req.body||{};if(username!==ADMIN_USER||!bcrypt.compareSync(String(password||''),adminHash))return res.status(401).json({error:'帳號或密碼錯誤'});const token=jwt.sign({sub:ADMIN_USER,role:'admin'},JWT_SECRET,{expiresIn:'8h'});res.json({token,user:ADMIN_USER})});

const imageTypes={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/avif':'avif'};
app.post('/api/upload',auth,express.raw({type:'image/*',limit:'12mb'}),(req,res)=>{
  const ext=imageTypes[req.headers['content-type']];
  if(!ext||!Buffer.isBuffer(req.body)||!req.body.length)return res.status(400).json({error:'僅支援 JPG、PNG、WebP、GIF、AVIF 圖片'});
  const name=`${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR,name),req.body);
  const proto=String(req.headers['x-forwarded-proto']||req.protocol||'https').split(',')[0].trim();
  const url=`${proto}://${req.get('host')}/uploads/${name}`;
  res.status(201).json({ok:true,url,name,size:req.body.length});
});

app.get('/api/public/content',(req,res)=>{const rows=db.prepare('SELECT * FROM content WHERE published=1 ORDER BY type,sort_order,id').all();res.json(rows.map(rowToJson))});
app.get('/api/content',auth,(req,res)=>{const rows=db.prepare('SELECT * FROM content ORDER BY type,sort_order,id').all();res.json(rows.map(rowToJson))});
app.post('/api/content',auth,(req,res)=>{const {type,slug,title,category='',body={},sort_order=0,published=true}=req.body||{};if(!['guide','case','quiz'].includes(type)||!slug||!title)return res.status(400).json({error:'欄位不完整'});try{const info=db.prepare('INSERT INTO content(type,slug,title,category,body,sort_order,published,updated_at) VALUES(?,?,?,?,?,?,?,CURRENT_TIMESTAMP)').run(type,slug,title,category,JSON.stringify(body),Number(sort_order)||0,published?1:0);res.status(201).json(rowToJson(db.prepare('SELECT * FROM content WHERE id=?').get(info.lastInsertRowid)))}catch(e){res.status(409).json({error:'slug 重複或資料格式錯誤'})}});
app.post('/api/content/bulk',auth,(req,res)=>{const items=Array.isArray(req.body?.items)?req.body.items:[];if(!items.length)return res.status(400).json({error:'沒有可匯入的資料'});const upsert=db.prepare(`INSERT INTO content(type,slug,title,category,body,sort_order,published,updated_at) VALUES(?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
ON CONFLICT(type,slug) DO UPDATE SET title=excluded.title,category=excluded.category,body=excluded.body,sort_order=excluded.sort_order,published=excluded.published,updated_at=CURRENT_TIMESTAMP`);const tx=db.transaction(list=>{let count=0;for(const x of list){if(!['guide','case','quiz'].includes(x.type)||!x.slug||!x.title)continue;upsert.run(x.type,String(x.slug),String(x.title),String(x.category||''),JSON.stringify(x.body||{}),Number(x.sort_order)||0,x.published===false?0:1);count++}return count});const count=tx(items);res.json({ok:true,count})});
app.put('/api/content/:id',auth,(req,res)=>{const id=Number(req.params.id);const old=db.prepare('SELECT * FROM content WHERE id=?').get(id);if(!old)return res.status(404).json({error:'找不到資料'});const v={...old,...req.body};db.prepare('UPDATE content SET type=?,slug=?,title=?,category=?,body=?,sort_order=?,published=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(v.type,v.slug,v.title,v.category||'',JSON.stringify(v.body??safeParse(old.body)),Number(v.sort_order)||0,v.published?1:0,id);res.json(rowToJson(db.prepare('SELECT * FROM content WHERE id=?').get(id)))});
app.delete('/api/content/:id',auth,(req,res)=>{db.prepare('DELETE FROM content WHERE id=?').run(Number(req.params.id));res.status(204).end()});
app.get('/api/settings',auth,(req,res)=>{const rows=db.prepare('SELECT key,value FROM settings').all();res.json(Object.fromEntries(rows.map(r=>[r.key,safeParse(r.value)])))});
app.put('/api/settings/:key',auth,(req,res)=>{const value=JSON.stringify(req.body?.value??null);db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(req.params.key,value);res.json({ok:true})});

app.use((err,req,res,next)=>{
  console.error(err);
  if(err?.type==='entity.too.large')return res.status(413).json({error:'圖片過大，請控制在 12MB 內'});
  res.status(500).json({error:'伺服器錯誤'});
});
app.listen(PORT,'0.0.0.0',()=>console.log(`ATAS Guide API running on :${PORT} using ${DB_PATH}`));
