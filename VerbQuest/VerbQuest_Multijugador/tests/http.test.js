'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {server}=require('../server');

// Prueba integrada del HTTP server y el canal de eventos (sin navegador ni servicios externos).
test('API: crea sala, une diez jugadores, publica eventos SSE y empieza partida',async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  async function post(endpoint,body){
    const res=await fetch(origin+`/api/${endpoint}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();assert.equal(res.status,200,JSON.stringify(data));return data;
  }
  async function state(identity){
    const res=await fetch(`${origin}/api/state?code=${identity.code}&token=${identity.token}`);
    assert.equal(res.status,200);return res.json();
  }
  const abort=new AbortController();
  try{
    const html=await fetch(origin+'/');assert.equal(html.status,200);
    assert.match(await html.text(),/Create a room/);
    const host=await post('create',{name:'Test teacher',capacity:10,duration:1,mode:'mixed'});
    assert.match(host.code,/^[A-HJ-NP-Z2-9]{6}$/);
    const player=await post('join',{code:host.code,name:'Student 0'});
    const sse=await fetch(`${origin}/api/events?code=${player.code}&token=${player.token}`,{signal:abort.signal});
    assert.equal(sse.status,200);assert.match(sse.headers.get('content-type'),/event-stream/);
    for(let i=1;i<10;i++)await post('join',{code:host.code,name:`Student ${i}`});
    assert.equal((await state(host)).joined,10);
    await post('start',host);
    assert.equal((await state(host)).phase,'playing');
    const question=(await state(player)).question;
    assert.equal(question.options.length,4);
    assert.equal('correctIndex' in question,false,'never leak correct answer before submission');
    assert.equal((await state(host)).question,null,'host cannot answer');
  }finally{
    abort.abort();server.closeAllConnections();
    if(server.listening)await new Promise(resolve=>server.close(resolve));
  }
});
