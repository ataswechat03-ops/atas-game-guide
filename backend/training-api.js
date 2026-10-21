import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export function installTrainingApi({app,db,auth,JWT_SECRET,audit}){
  db.exec(`
  CREATE TABLE IF NOT EXISTS learners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    exam_authorized INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS learner_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    learner_id INTEGER NOT NULL,
    guide_slug TEXT NOT NULL,
    category TEXT DEFAULT '',
    views INTEGER NOT NULL DEFAULT 1,
    completed INTEGER NOT NULL DEFAULT 0,
    first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    UNIQUE(learner_id,guide_slug),
    FOREIGN KEY(learner_id) REFERENCES learners(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS learner_exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    learner_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    passed INTEGER NOT NULL DEFAULT 0,
    taken_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(learner_id) REFERENCES learners(id) ON DELETE CASCADE
  );
  `);
  const learnerColumns=db.prepare('PRAGMA table_info(learners)').all().map(x=>x.name);
  if(!learnerColumns.includes('exam_authorized'))db.exec('ALTER TABLE learners ADD COLUMN exam_authorized INTEGER NOT NULL DEFAULT 0');

  function learnerAuth(req,res,next){
    const h=req.headers.authorization||'',token=h.startsWith('Bearer ')?h.slice(7):'';
    try{const u=jwt.verify(token,JWT_SECRET);if(u?.role!=='learner')throw new Error('role');const learner=db.prepare('SELECT id,username,display_name,active,exam_authorized,created_at,updated_at FROM learners WHERE id=?').get(Number(u.sub));if(!learner||!learner.active)return res.status(401).json({error:'學員帳號已停用或不存在'});req.learner=learner;next()}catch{res.status(401).json({error:'請先登入學員帳號'})}
  }
  const score=v=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));
  const safeParse=s=>{try{return JSON.parse(s)}catch{return {}}};
  const quizJson=r=>r?{...r,body:safeParse(r.body),published:!!r.published}:null;
  const pub=r=>r?{id:r.id,username:r.username,display_name:r.display_name,active:!!r.active,exam_authorized:!!r.exam_authorized,created_at:r.created_at,updated_at:r.updated_at}:null;

  app.post('/api/learner/login',(req,res)=>{const username=String(req.body?.username||'').trim(),password=String(req.body?.password||''),row=db.prepare('SELECT * FROM learners WHERE username=?').get(username);if(!row||!row.active||!bcrypt.compareSync(password,row.password_hash))return res.status(401).json({error:'學員帳號或密碼錯誤'});const token=jwt.sign({sub:String(row.id),role:'learner',username:row.username},JWT_SECRET,{expiresIn:'14d'});res.json({token,user:pub(row)})});
  app.get('/api/learner/me',learnerAuth,(req,res)=>{const progress=db.prepare('SELECT guide_slug,category,views,completed,first_seen_at,last_seen_at,completed_at FROM learner_progress WHERE learner_id=? ORDER BY last_seen_at DESC').all(req.learner.id).map(x=>({...x,completed:!!x.completed}));const exams=db.prepare('SELECT category,score,passed,taken_at FROM learner_exam_results WHERE learner_id=? ORDER BY taken_at DESC,id DESC').all(req.learner.id).map(x=>({...x,passed:!!x.passed}));res.json({user:pub(req.learner),progress,exams})});
  app.get('/api/practice/questions',(req,res)=>{const rows=db.prepare("SELECT * FROM content WHERE type='quiz' AND published=1 ORDER BY sort_order,id").all().map(quizJson).filter(x=>x.body?.mode==='practice');res.json(rows)});
  app.get('/api/learner/questions',learnerAuth,(req,res)=>{const rows=db.prepare("SELECT * FROM content WHERE type='quiz' AND published=1 ORDER BY sort_order,id").all().map(quizJson).filter(x=>x.body?.mode==='practice'||!!req.learner.exam_authorized);res.json(rows)});
  app.post('/api/learner/progress',learnerAuth,(req,res)=>{const slug=String(req.body?.guide_slug||'').trim(),category=String(req.body?.category||'').trim(),completed=!!req.body?.completed;if(!slug)return res.status(400).json({error:'缺少教學識別碼'});db.prepare(`INSERT INTO learner_progress(learner_id,guide_slug,category,views,completed,first_seen_at,last_seen_at,completed_at) VALUES(?,?,?,1,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CASE WHEN ?=1 THEN CURRENT_TIMESTAMP ELSE NULL END) ON CONFLICT(learner_id,guide_slug) DO UPDATE SET category=CASE WHEN excluded.category<>'' THEN excluded.category ELSE learner_progress.category END,views=learner_progress.views+1,completed=CASE WHEN excluded.completed=1 THEN 1 ELSE learner_progress.completed END,last_seen_at=CURRENT_TIMESTAMP,completed_at=CASE WHEN excluded.completed=1 AND learner_progress.completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE learner_progress.completed_at END`).run(req.learner.id,slug,category,completed?1:0,completed?1:0);const row=db.prepare('SELECT guide_slug,category,views,completed,first_seen_at,last_seen_at,completed_at FROM learner_progress WHERE learner_id=? AND guide_slug=?').get(req.learner.id,slug);res.json({...row,completed:!!row.completed})});
  app.post('/api/learner/exams',learnerAuth,(req,res)=>{if(!req.learner.exam_authorized)return res.status(403).json({error:'目前尚未取得考試授權'});const category=String(req.body?.category||'').trim(),s=score(req.body?.score);if(!category)return res.status(400).json({error:'缺少考試分類'});const passed=s>=80?1:0;db.prepare('INSERT INTO learner_exam_results(learner_id,category,score,passed,taken_at) VALUES(?,?,?,?,CURRENT_TIMESTAMP)').run(req.learner.id,category,s,passed);audit?.('learner_exam','learner',String(req.learner.id),{category,score:s,passed:!!passed});res.status(201).json({ok:true,category,score:s,passed:!!passed})});

  app.get('/api/training/learners',auth,(req,res)=>{const learners=db.prepare('SELECT id,username,display_name,active,exam_authorized,created_at,updated_at FROM learners ORDER BY active DESC,id DESC').all(),progress=db.prepare('SELECT learner_id,guide_slug,category,views,completed,first_seen_at,last_seen_at,completed_at FROM learner_progress ORDER BY last_seen_at DESC').all(),exams=db.prepare('SELECT learner_id,category,score,passed,taken_at FROM learner_exam_results ORDER BY taken_at DESC,id DESC').all();res.json(learners.map(l=>{const p=progress.filter(x=>x.learner_id===l.id).map(x=>({...x,completed:!!x.completed})),e=exams.filter(x=>x.learner_id===l.id).map(x=>({...x,passed:!!x.passed})),best={};for(const x of e)best[x.category]=Math.max(best[x.category]??-1,x.score);return {...pub(l),progress:p,exams:e,summary:{viewed:p.length,completed:p.filter(x=>x.completed).length,best,last_activity:p[0]?.last_seen_at||e[0]?.taken_at||l.created_at}}}))});
  app.post('/api/training/learners',auth,(req,res)=>{const username=String(req.body?.username||'').trim(),displayName=String(req.body?.display_name||'').trim(),password=String(req.body?.password||'');if(username.length<3||password.length<6)return res.status(400).json({error:'帳號至少 3 碼，密碼至少 6 碼'});try{const info=db.prepare('INSERT INTO learners(username,display_name,password_hash,active,exam_authorized,created_at,updated_at) VALUES(?,?,?,1,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)').run(username,displayName||username,bcrypt.hashSync(password,12));const row=db.prepare('SELECT id,username,display_name,active,exam_authorized,created_at,updated_at FROM learners WHERE id=?').get(info.lastInsertRowid);audit?.('create_learner','learner',username,{display_name:row.display_name});res.status(201).json(pub(row))}catch{res.status(409).json({error:'學員帳號已存在'})}});
  app.put('/api/training/learners/:id',auth,(req,res)=>{const id=Number(req.params.id),row=db.prepare('SELECT * FROM learners WHERE id=?').get(id);if(!row)return res.status(404).json({error:'找不到學員'});const displayName=req.body?.display_name===undefined?row.display_name:String(req.body.display_name||'').trim(),active=req.body?.active===undefined?row.active:(req.body.active?1:0),examAuthorized=req.body?.exam_authorized===undefined?row.exam_authorized:(req.body.exam_authorized?1:0),password=String(req.body?.password||'');if(password&&password.length<6)return res.status(400).json({error:'新密碼至少 6 碼'});if(password)db.prepare('UPDATE learners SET display_name=?,active=?,exam_authorized=?,password_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(displayName,active,examAuthorized,bcrypt.hashSync(password,12),id);else db.prepare('UPDATE learners SET display_name=?,active=?,exam_authorized=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(displayName,active,examAuthorized,id);audit?.('update_learner','learner',row.username,{active:!!active,exam_authorized:!!examAuthorized,password_reset:!!password});res.json(pub(db.prepare('SELECT id,username,display_name,active,exam_authorized,created_at,updated_at FROM learners WHERE id=?').get(id)))});
  app.delete('/api/training/learners/:id',auth,(req,res)=>{const id=Number(req.params.id),row=db.prepare('SELECT username FROM learners WHERE id=?').get(id);if(!row)return res.status(404).json({error:'找不到學員'});db.prepare('UPDATE learners SET active=0,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(id);audit?.('deactivate_learner','learner',row.username,{});res.json({ok:true})});
}
