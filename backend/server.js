import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const app=express();
const PORT=Number(process.env.PORT||3000);
const JWT_SECRET=process.env.JWT_SECRET||'dev-only-change-me';
const ADMIN_USER=process.env.ADMIN_USER||'admin';
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'change-me';
const CORS_ORIGIN=process.env.CORS_ORIGIN||'*';

app.use(cors({origin:CORS_ORIGIN==='*'?true:CORS_ORIGIN.split(',').map(s=>s.trim())}));
app.use(express.json({limit:'2mb'}));

const db=new Database('atas-guide.db');
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

const adminHash=bcrypt.hashSync(ADMIN_PASSWORD,10);
function auth(req,res,next){const h=req.headers.authorization||'';const token=h.startsWith('Bearer ')?h.slice(7):'';try{req.user=jwt.verify(token,JWT_SECRET);next()}catch{res.status(401).json({error:'未授權'})}}
function safeParse(s){try{return JSON.parse(s)}catch{return {}}}
function rowToJson(r){return {...r,body:safeParse(r.body),published:!!r.published}}

app.get('/api/health',(req,res)=>res.json({ok:true,service:'ATAS Guide API'}));
app.post('/api/login',(req,res)=>{const {username,password}=req.body||{};if(username!==ADMIN_USER||!bcrypt.compareSync(String(password||''),adminHash))return res.status(401).json({error:'帳號或密碼錯誤'});const token=jwt.sign({sub:ADMIN_USER,role:'admin'},JWT_SECRET,{expiresIn:'8h'});res.json({token,user:ADMIN_USER})});

app.get('/api/public/content',(req,res)=>{const rows=db.prepare('SELECT * FROM content WHERE published=1 ORDER BY type,sort_order,id').all();res.json(rows.map(rowToJson))});
app.get('/api/content',auth,(req,res)=>{const rows=db.prepare('SELECT * FROM content ORDER BY type,sort_order,id').all();res.json(rows.map(rowToJson))});
app.post('/api/content',auth,(req,res)=>{const {type,slug,title,category='',body={},sort_order=0,published=true}=req.body||{};if(!['guide','case','quiz'].includes(type)||!slug||!title)return res.status(400).json({error:'欄位不完整'});try{const info=db.prepare('INSERT INTO content(type,slug,title,category,body,sort_order,published,updated_at) VALUES(?,?,?,?,?,?,?,CURRENT_TIMESTAMP)').run(type,slug,title,category,JSON.stringify(body),Number(sort_order)||0,published?1:0);res.status(201).json(rowToJson(db.prepare('SELECT * FROM content WHERE id=?').get(info.lastInsertRowid)))}catch(e){res.status(409).json({error:'slug 重複或資料格式錯誤'})}});
app.put('/api/content/:id',auth,(req,res)=>{const id=Number(req.params.id);const old=db.prepare('SELECT * FROM content WHERE id=?').get(id);if(!old)return res.status(404).json({error:'找不到資料'});const v={...old,...req.body};db.prepare('UPDATE content SET type=?,slug=?,title=?,category=?,body=?,sort_order=?,published=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(v.type,v.slug,v.title,v.category||'',JSON.stringify(v.body??safeParse(old.body)),Number(v.sort_order)||0,v.published?1:0,id);res.json(rowToJson(db.prepare('SELECT * FROM content WHERE id=?').get(id)))});
app.delete('/api/content/:id',auth,(req,res)=>{db.prepare('DELETE FROM content WHERE id=?').run(Number(req.params.id));res.status(204).end()});
app.get('/api/settings',auth,(req,res)=>{const rows=db.prepare('SELECT key,value FROM settings').all();res.json(Object.fromEntries(rows.map(r=>[r.key,safeParse(r.value)])))});
app.put('/api/settings/:key',auth,(req,res)=>{const value=JSON.stringify(req.body?.value??null);db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(req.params.key,value);res.json({ok:true})});

app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'伺服器錯誤'})});
app.listen(PORT,()=>console.log(`ATAS Guide API running on :${PORT}`));
