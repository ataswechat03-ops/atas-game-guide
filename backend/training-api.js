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

  function learnerAuth(req,res,next){
    const h=req.headers.authorization||'';
    const token=h.startsWith('Bearer ')?h.slice(7):'';
    try{
      const u=jwt.verify(token,JWT_SECRET);
      if(u?.role!=='learner')throw new Error('role');
      const learner=db.prepare('SELECT id,username,display_name,active,created_at,updated_at FROM learners WHERE id=?').get(Number(u.sub));
      if(!learner||!learner.active)return res.status(401).json({error:'學員帳號已停用或不存在'});
      req.learner=learner;next();
    }catch{res.status(401).json({error:'請先登入學員帳號'})}
  }
  const safeScore=v=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));
  const publicLearner=r=>r?{id:r.id,username:r.username,display_name:r.display_name,active:!!r.active,created_at:r.created_at,updated_at:r.updated_at}:null;

  app.post('/api/learner/login',(req,res)=>{
    const username=String(req.body?.username||'').trim();
    const password=String(req.body?.password||'');
    const row=db.prepare('SELECT * FROM learners WHERE username=?').get(username);
    if(!row||!row.active||!bcrypt.compareSync(password,row.password_hash))return res.status(401).json({error:'學員帳號或密碼錯誤'});
    const token=jwt.sign({sub:String(row.id),role:'learner',username:row.username},JWT_SECRET,{expiresIn:'14d'});
    res.json({token,user:publicLearner(row)});
  });

  app.get('/api/learner/me',learnerAuth,(req,res)=>{
    const progress=db.prepare('SELECT guide_slug,category,views,completed,first_seen_at,last_seen_at,completed_at FROM learner_progress WHERE learner_id=? ORDER BY last_seen_at DESC').all(req.learner.id).map(x=>({...x,completed:!!x.completed}));
    const exams=db.prepare('SELECT category,score,passed,taken_at FROM learner_exam_results WHERE learner_id=? ORDER BY taken_at DESC,id DESC').all(req.learner.id).map(x=>({...x,passed:!!x.passed}));
    res.json({user:publicLearner(req.learner),progress,exams});
  });

  app.post('/api/learner/progress',learnerAuth,(req,res)=>{
    const slug=String(req.body?.guide_slug||'').trim();
    const category=String(req.body?.category||'').trim();
    const completed=!!req.body?.completed;
    if(!slug)return res.status(400).json({error:'缺少教學識別碼'});
    db.prepare(`INSERT INTO learner_progress(learner_id,guide_slug,category,views,completed,first_seen_at,last_seen_at,completed_at)
      VALUES(?,?,?,1,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CASE WHEN ?=1 THEN CURRENT_TIMESTAMP ELSE NULL END)
      ON CONFLICT(learner_id,guide_slug) DO UPDATE SET
        category=CASE WHEN excluded.category<>'' THEN excluded.category ELSE learner_progress.category END,
        views=learner_progress.views+1,
        completed=CASE WHEN excluded.completed=1 THEN 1 ELSE learner_progress.completed END,
        last_seen_at=CURRENT_TIMESTAMP,
        completed_at=CASE WHEN excluded.completed=1 AND learner_progress.completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE learner_progress.completed_at END`).run(req.learner.id,slug,category,completed?1:0,completed?1:0);
    const row=db.prepare('SELECT guide_slug,category,views,completed,first_seen_at,last_seen_at,completed_at FROM learner_progress WHERE learner_id=? AND guide_slug=?').get(req.learner.id,slug);
    res.json({...row,completed:!!row.completed});
  });

  app.post('/api/learner/exams',learnerAuth,(req,res)=>{
    const category=String(req.body?.category||'').trim();
    const score=safeScore(req.body?.score);
    if(!category)return res.status(400).json({error:'缺少考試分類'});
    const passed=score>=80?1:0;
    db.prepare('INSERT INTO learner_exam_results(learner_id,category,score,passed,taken_at) VALUES(?,?,?,?,CURRENT_TIMESTAMP)').run(req.learner.id,category,score,passed);
    audit?.('learner_exam','learner',String(req.learner.id),{category,score,passed:!!passed});
    res.status(201).json({ok:true,category,score,passed:!!passed});
  });

  app.get('/api/training/learners',auth,(req,res)=>{
    const learners=db.prepare('SELECT id,username,display_name,active,created_at,updated_at FROM learners ORDER BY active DESC,id DESC').all();
    const progress=db.prepare('SELECT learner_id,guide_slug,category,views,completed,first_seen_at,last_seen_at,completed_at FROM learner_progress ORDER BY last_seen_at DESC').all();
    const exams=db.prepare('SELECT learner_id,category,score,passed,taken_at FROM learner_exam_results ORDER BY taken_at DESC,id DESC').all();
    const out=learners.map(l=>{
      const p=progress.filter(x=>x.learner_id===l.id).map(x=>({...x,completed:!!x.completed}));
      const e=exams.filter(x=>x.learner_id===l.id).map(x=>({...x,passed:!!x.passed}));
      const best={};for(const x of e)best[x.category]=Math.max(best[x.category]??-1,x.score);
      return {...publicLearner(l),progress:p,exams:e,summary:{viewed:p.length,completed:p.filter(x=>x.completed).length,best,last_activity:p[0]?.last_seen_at||e[0]?.taken_at||l.created_at}};
    });
    res.json(out);
  });

  app.post('/api/training/learners',auth,(req,res)=>{
    const username=String(req.body?.username||'').trim();
    const displayName=String(req.body?.display_name||'').trim();
    const password=String(req.body?.password||'');
    if(username.length<3||password.length<6)return res.status(400).json({error:'帳號至少 3 碼，密碼至少 6 碼'});
    try{
      const hash=bcrypt.hashSync(password,12);
      const info=db.prepare('INSERT INTO learners(username,display_name,password_hash,active,created_at,updated_at) VALUES(?,?,?,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)').run(username,displayName||username,hash);
      const row=db.prepare('SELECT id,username,display_name,active,created_at,updated_at FROM learners WHERE id=?').get(info.lastInsertRowid);
      audit?.('create_learner','learner',username,{display_name:row.display_name});
      res.status(201).json(publicLearner(row));
    }catch(e){res.status(409).json({error:'學員帳號已存在'})}
  });

  app.put('/api/training/learners/:id',auth,(req,res)=>{
    const id=Number(req.params.id);const row=db.prepare('SELECT * FROM learners WHERE id=?').get(id);if(!row)return res.status(404).json({error:'找不到學員'});
    const displayName=req.body?.display_name===undefined?row.display_name:String(req.body.display_name||'').trim();
    const active=req.body?.active===undefined?row.active:(req.body.active?1:0);
    const password=String(req.body?.password||'');
    if(password&&password.length<6)return res.status(400).json({error:'新密碼至少 6 碼'});
    if(password){db.prepare('UPDATE learners SET display_name=?,active=?,password_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(displayName,active,bcrypt.hashSync(password,12),id)}
    else{db.prepare('UPDATE learners SET display_name=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(displayName,active,id)}
    audit?.('update_learner','learner',row.username,{active:!!active,password_reset:!!password});
    res.json(publicLearner(db.prepare('SELECT id,username,display_name,active,created_at,updated_at FROM learners WHERE id=?').get(id)));
  });

  app.delete('/api/training/learners/:id',auth,(req,res)=>{
    const id=Number(req.params.id);const row=db.prepare('SELECT username FROM learners WHERE id=?').get(id);if(!row)return res.status(404).json({error:'找不到學員'});
    db.prepare('UPDATE learners SET active=0,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(id);
    audit?.('deactivate_learner','learner',row.username,{});res.json({ok:true});
  });
}
