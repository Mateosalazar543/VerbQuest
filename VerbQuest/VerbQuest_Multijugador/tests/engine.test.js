'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {GameService,VERBS,buildQuestion,accepted}=require('../engine');

const fixture=()=>{
  let now=100000;
  const service=new GameService({now:()=>now});
  const room=service.create({name:'Profe',capacity:15,duration:1,mode:'mixed'});
  const players=Array.from({length:10},(_,i)=>service.join({code:room.code,name:`Alumno ${i+1}`}));
  return {service,room,players,get now(){return now;},set now(value){now=value;}};
};

test('80 verbos; cinco niveles producen cuatro opciones distintas y una única respuesta',()=>{
  assert.equal(VERBS.length,80);
  for (const verb of VERBS) for (const level of [1,2,3,4,5]) for (const mode of ['mixed','base','past','participle']) {
    const q=buildQuestion(verb,level,mode);
    assert.equal(q.options.length,4,verb.base);
    assert.equal(new Set(q.options).size,4,verb.base);
    assert.equal(q.options.filter(x=>x===q.answer).length,1,verb.base);
    assert.equal(q.options.filter(x=>accepted(x,q.answer)).length,1,`other valid variant for ${verb.base}`);
  }
});

test('sala permite 10 o más jugadores pero no inicia con nueve',()=>{
  let now=0;const service=new GameService({now:()=>now});
  assert.throws(()=>service.create({name:'Host',capacity:9,duration:1}),/10 a 50/);
  const host=service.create({name:'Host',capacity:10,duration:1});
  for(let i=0;i<9;i++)service.join({code:host.code,name:`Player ${i}`});
  assert.throws(()=>service.start(host.code,host.token),/al menos 10/);
  service.join({code:host.code,name:'Player 10'});
  service.start(host.code,host.token);
  assert.equal(service.room(host.code).phase,'playing');
  assert.throws(()=>service.join({code:host.code,name:'late player'}),/ya comenzó/);
});

test('no se puede responder antes de empezar, dos veces ni con token ajeno',()=>{
  const f=fixture();f.service.start(f.room.code,f.room.token);
  const p=f.players[0];
  assert.throws(()=>f.service.answer(f.room.code,p.token,0),/no está abierta/);
  f.now+=3000;
  const q=f.service.auth(f.room.code,p.token).person.question;
  f.service.answer(f.room.code,p.token,q.correctIndex);
  assert.throws(()=>f.service.answer(f.room.code,p.token,q.correctIndex),/Ya respondiste/);
  assert.throws(()=>f.service.answer(f.room.code,'BAD_TOKEN',0),/Credenciales/);
  assert.equal(f.service.auth(f.room.code,p.token).person.score,10);
  assert.equal(f.service.auth(f.room.code,p.token).person.correct,1);
  assert.equal(f.service.publicState(f.room.code,p.token).feedback.correct,true);
  assert.equal(f.service.publicState(f.room.code,f.room.token).question,null);
});

test('nivel sube con dos aciertos y baja por un error; el servidor calcula los puntos',()=>{
  const f=fixture();f.service.start(f.room.code,f.room.token);f.now+=3000;
  const p=f.players[0];
  for(let i=0;i<2;i++){
    const q=f.service.auth(f.room.code,p.token).person.question;
    f.service.answer(f.room.code,p.token,q.correctIndex);
    f.service.next(f.room.code,p.token);f.now+=100;
  }
  assert.equal(f.service.auth(f.room.code,p.token).person.level,2);
  const q=f.service.auth(f.room.code,p.token).person.question;
  f.service.answer(f.room.code,p.token,(q.correctIndex+1)%4);
  assert.equal(f.service.auth(f.room.code,p.token).person.level,1);
});

test('al acabar el contrarreloj anuncia ganador y ordena el marcador',()=>{
  const f=fixture();f.service.start(f.room.code,f.room.token);f.now+=3000;
  const champion=f.players[3];const q=f.service.auth(f.room.code,champion.token).person.question;
  f.service.answer(f.room.code,champion.token,q.correctIndex);
  f.now+=60001;f.service.tick();
  const final=f.service.publicState(f.room.code,f.room.token);
  assert.equal(final.phase,'results');
  assert.deepEqual(final.winners,['Alumno 4']);
  assert.equal(final.ranking[0].score,10);
  assert.throws(()=>f.service.answer(f.room.code,champion.token,0),/no está abierta/);
});

test('abandono de jugador en sala de espera libera el cupo; cerrar como admin cancela la sala',()=>{
  const f=fixture();f.service.leave(f.room.code,f.players[0].token);
  assert.equal(f.service.room(f.room.code).players.length,9);
  f.service.leave(f.room.code,f.room.token);
  assert.throws(()=>f.service.room(f.room.code),/no encontrada/);
});
