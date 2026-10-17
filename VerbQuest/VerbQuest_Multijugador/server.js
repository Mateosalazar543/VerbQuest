'use strict';
// Servidor HTTP + Server-Sent Events, sin dependencias externas de npm.
// El frontend estático se sirve desde /public; SSE distribuye la clasificación.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {GameService}=require('./engine');
const ROOT=path.join(__dirname,'public');
const port=Number(process.env.PORT||3000);
const service=new GameService();
const subscriptions=new Map(); // code -> Set<{res, token}>
function json(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj));}
function push(res,event,data){try{res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);}catch{}}
function publish(room,kind='state',message=''){
  const clients=subscriptions.get(room.code);if(!clients)return;
  for(const client of clients){
    if(kind==='closed'){push(client.res,'closed',{message});client.res.end();continue;}
    try {push(client.res,'state',service.publicState(room.code,client.token));}catch{push(client.res,'closed',{message:'La sala ya no existe.'});client.res.end();}
  }
  if(kind==='closed')subscriptions.delete(room.code);
}
service.broadcast=publish;
function parseBody(req){return new Promise((resolve,reject)=>{let body='';req.on('data',chunk=>{body+=chunk;if(body.length>10000){reject(Error('Solicitud demasiado grande.'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(body||'{}'));}catch{reject(Error('JSON inválido.'));}});req.on('error',reject);});}
function apiError(res,err){json(res,400,{error:err.message||'Error inesperado.'});}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
function serveStatic(req,res,url){
  const pathname=url.pathname==='/'?'/index.html':url.pathname;
  if(!['/index.html','/multiplayer.js','/favicon.ico'].includes(pathname)){res.writeHead(404);res.end('Not found');return;}
  const file=path.join(ROOT,pathname.slice(1));
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
      'Content-Security-Policy':"frame-ancestors 'none'"});res.end(data);
  });
}
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&url.pathname==='/healthz')return json(res,200,{ok:true,rooms:service.rooms.size});
  if(req.method==='GET'&&url.pathname==='/api/state'){
    try{return json(res,200,service.publicState(url.searchParams.get('code'),url.searchParams.get('token')));}catch(e){return apiError(res,e);}
  }
  if(req.method==='GET'&&url.pathname==='/api/events'){
    try{
      const code=(url.searchParams.get('code')||'').toUpperCase(),token=url.searchParams.get('token');
      const {room,person}=service.auth(code,token);
      res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
      res.write(': connected\n\n');
      const client={res,token};
      if(!subscriptions.has(code))subscriptions.set(code,new Set());
      subscriptions.get(code).add(client);person.connections++;
      publish(room);
      const heartbeat=setInterval(()=>{try{res.write(': heartbeat\n\n');}catch{}},20000);
      req.on('close',()=>{clearInterval(heartbeat);subscriptions.get(code)?.delete(client);person.connections=Math.max(0,person.connections-1);
        if(service.rooms.has(code))publish(room);
      });
    }catch(e){apiError(res,e);}return;
  }
  if(req.method==='POST'&&url.pathname.startsWith('/api/')){
    try{
      const body=await parseBody(req),action=url.pathname.slice(5);
      let value={ok:true};
      if(action==='create')value=service.create(body);
      else if(action==='join')value=service.join(body);
      else if(action==='start')service.start(body.code,body.token);
      else if(action==='answer')value=service.answer(body.code,body.token,body.option);
      else if(action==='next')service.next(body.code,body.token);
      else if(action==='leave')service.leave(body.code,body.token);
      else return json(res,404,{error:'Acción no encontrada.'});
      return json(res,200,value);
    }catch(e){return apiError(res,e);}
  }
  if(req.method==='GET')return serveStatic(req,res,url);
  res.writeHead(405);res.end('Method not allowed');
});
const timer=setInterval(()=>service.tick(),1000);timer.unref();
if(require.main===module)server.listen(port,'0.0.0.0',()=>console.log(`VerbQuest listo en http://localhost:${port}`));
module.exports={server,service};
