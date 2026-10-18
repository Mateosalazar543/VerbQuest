'use strict';
// VerbQuest multijugador: toda respuesta, reloj y puntuación se validan en el servidor.
const crypto = require('node:crypto');
const VERBS = require('./verbs.json');
const MAX_ROOMS = 100;
// Minimum number of registered participants needed to start a match.
// Room capacity (10–50) is a maximum, never an attendance requirement.
const MIN_PLAYERS = 1;
const MIN_CAPACITY = 10;
const LEVELS = ['Starter', 'Explorer', 'Practitioner', 'Advanced', 'Expert'];
const CODES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const sentences = {
  begin: ['The class ___ yesterday.','The class has already ___.'],
  break: ['He ___ the glass yesterday.','He has ___ the glass.'],
  bring: ['She ___ her notes yesterday.','She has ___ her notes.'],
  choose: ['I ___ the blue shirt yesterday.','I have ___ the blue shirt.'],
  do: ['They ___ the work yesterday.','They have ___ the work.'],
  drive: ['We ___ to school yesterday.','We have ___ to school.'],
  eat: ['He ___ breakfast yesterday.','He has ___ breakfast.'],
  fall: ['She ___ down yesterday.','She has ___ down.'],
  forget: ['I ___ my keys yesterday.','I have ___ my keys.'],
  give: ['They ___ a gift yesterday.','They have ___ a gift.'],
  go: ['She ___ to class yesterday.','She has ___ to class.'],
  know: ['He ___ the answer yesterday.','He has ___ the answer.'],
  ride: ['We ___ our bikes yesterday.','We have ___ our bikes.'],
  see: ['They ___ the movie yesterday.','They have ___ the movie.'],
  speak: ['I ___ with her yesterday.','I have ___ with her.'],
  swim: ['He ___ yesterday.','He has ___ before.'],
  take: ['We ___ a photo yesterday.','We have ___ a photo.'],
  wear: ['She ___ a coat yesterday.','She has ___ a coat.'],
  write: ['I ___ a letter yesterday.','I have ___ a letter.']
};
const shuffle = a => {
  const result = [...a];
  for (let i = result.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
const variants = s => String(s).toLowerCase().split(' / ').map(x => x.trim());
const accepted = (candidate, correct) => variants(candidate).every(v => variants(correct).includes(v));
const fakeRegular = base => /[^aeiou]y$/.test(base) ? base.slice(0, -1) + 'ied' : base.endsWith('e') ? base + 'd' : base + 'ed';
function editDistance(a, b) {
  const line = Array.from({length:b.length + 1},(_,i)=>i);
  for (let i=1;i<=a.length;i++) {
    let prev=line[0]; line[0]=i;
    for(let j=1;j<=b.length;j++) {
      const old=line[j];
      line[j]=Math.min(old+1,line[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));
      prev=old;
    }
  }
  return line[b.length];
}
const sim = (a,b) => Math.max(...variants(a).flatMap(x=>variants(b).map(y=>1-editDistance(x,y)/Math.max(x.length,y.length,1))));
// Las preguntas multijugador se validan y generan en el servidor.
// En Advanced/Expert se combinan otras formas del verbo, errores morfológicos
// y distractores próximos del banco de 80 verbos.
function distractors(correct, key, verb, level) {
  const pool=new Set(VERBS.filter(v=>v!==verb).map(v=>v[key]));
  if(level>=3) for(const v of VERBS) if(v!==verb) {
    pool.add(v.base);pool.add(v.past);pool.add(v.pp);
  }
  const internal=['base','past','pp'].filter(k=>k!==key)
    .map(k=>verb[k]).filter(x=>!accepted(x,correct));
  const fakes=[fakeRegular(verb.base)];
  if(key!=='base') {
    if(verb.pp.endsWith('en')) fakes.push(verb.pp.slice(0,-1));
    if(/(.)\1/.test(verb.pp)) fakes.push(verb.pp.replace(/(.)\1/g,'$1'));
  }
  if(level>=2) internal.forEach(x=>pool.add(x));
  if(level>=3) fakes.forEach(x=>pool.add(x));
  const eligible=x=>x && x!==correct && !accepted(x,correct);
  const ordered=shuffle([...pool].filter(eligible)).sort((a,b)=>sim(b,correct)-sim(a,correct));
  const chosen=[];
  const add=x=>{if(eligible(x)&&!chosen.includes(x))chosen.push(x);};
  if(level>=4){
    internal.sort((a,b)=>sim(b,correct)-sim(a,correct));
    add(internal[0]);
    if(key!=='base')add(fakes.filter(eligible).sort((a,b)=>sim(b,correct)-sim(a,correct))[0]);
  }else if(level===3)add(internal[0]);
  const positions=[[.72,.85,.96],[.19,.45,.70],[.04,.18,.36],[.01,.06,.18],[0,.015,.035]][level-1];
  for(const frac of positions){
    if(chosen.length>=3)break;
    const position=Math.floor((ordered.length-1)*frac);
    for(let offset=0;offset<ordered.length;offset++){
      const value=ordered[Math.min(ordered.length-1,position+offset)];
      if(value&&!chosen.includes(value)){add(value);break;}
    }
  }
  ordered.forEach(x=>{if(chosen.length<3)add(x);});
  if(chosen.length!==3||new Set(chosen).size!==3)throw new Error(`Bad distractors for ${verb.base}`);
  return chosen;
}
function pairOptions(verb){
  const answer=`${verb.past} → ${verb.pp}`;
  const raw=[
    `${verb.pp} → ${verb.past}`,`${verb.base} → ${verb.pp}`,
    `${verb.past} → ${verb.base}`,`${fakeRegular(verb.base)} → ${verb.pp}`,
    `${verb.past} → ${fakeRegular(verb.base)}`,
    ...distractors(verb.past,'past',verb,5).map(x=>`${x} → ${verb.pp}`),
    ...distractors(verb.pp,'pp',verb,5).map(x=>`${verb.past} → ${x}`)
  ];
  const valid=x=>{
    const [past,pp]=x.split(' → ');
    return accepted(past,verb.past)&&accepted(pp,verb.pp);
  };
  const wrong=shuffle([...new Set(raw)]).filter(x=>x!==answer&&!valid(x))
    .sort((a,b)=>sim(b,answer)-sim(a,answer)).slice(0,3);
  if(wrong.length!==3)throw new Error(`Insufficient pair options for ${verb.base}`);
  return {answer,options:shuffle([answer,...wrong])};
}
function tripleOptions(verb){
  const answer=`${verb.base} → ${verb.past} → ${verb.pp}`;
  const raw=[
    `${verb.base} → ${verb.pp} → ${verb.past}`,
    `${verb.base} → ${verb.base} → ${verb.pp}`,
    `${verb.base} → ${verb.past} → ${verb.base}`,
    `${verb.base} → ${fakeRegular(verb.base)} → ${verb.pp}`,
    `${verb.base} → ${verb.past} → ${fakeRegular(verb.base)}`,
    ...distractors(verb.past,'past',verb,5).map(x=>`${verb.base} → ${x} → ${verb.pp}`),
    ...distractors(verb.pp,'pp',verb,5).map(x=>`${verb.base} → ${verb.past} → ${x}`)
  ];
  const valid=x=>{
    const [base,past,pp]=x.split(' → ');
    return accepted(base,verb.base)&&accepted(past,verb.past)&&accepted(pp,verb.pp);
  };
  const wrong=shuffle([...new Set(raw)]).filter(x=>x!==answer&&!valid(x))
    .sort((a,b)=>sim(b,answer)-sim(a,answer)).slice(0,3);
  if(wrong.length!==3)throw new Error(`Insufficient triple options for ${verb.base}`);
  return {answer,options:shuffle([answer,...wrong])};
}
function buildQuestion(verb,level,configuredMode){
  const modes=['past','participle','base'];
  const mode=configuredMode==='mixed'?modes[crypto.randomInt(3)]:configuredMode;
  let type,title,word,subtitle,answer,options,context=false;
  const roll=crypto.randomInt(100);
  const hard=level>=4 && configuredMode==='mixed' && !verb.modal;
  const doubleContext=hard && sentences[verb.base] && roll<(level===5?40:35);
  const triple=hard && level===5 && !doubleContext && roll<82;
  const pair=hard && !doubleContext && !triple && (level===5 || roll<66);
  if(doubleContext){
    type=level===5?'Expert · Two gaps':'Advanced · Two gaps';
    title='Complete BOTH sentences: simple past → past participle.';
    word=sentences[verb.base].join('\n');
    subtitle='Choose the pair that fits the two gaps in order.';
    ({answer,options}=pairOptions(verb));context=true;
  }else if(triple){
    type='Expert · Triple trap';title='Which complete sequence is 100% correct?';
    word=verb.base;subtitle='Base form → Simple past → Past participle';
    ({answer,options}=tripleOptions(verb));
  }else if(pair){
    type=level===5?'Expert · Double trap':'Two-form challenge';
    title='Select the only correct past → participle pair.';
    word=verb.base;subtitle='Simple past → Past participle';
    ({answer,options}=pairOptions(verb));
  }else{
    const key=mode==='participle'?'pp':mode;
    type=mode==='past'?'Simple past':mode==='participle'?'Past participle':'Base form';
    title=mode==='base'?'What is the base form?':`What is the ${type.toLowerCase()}?`;
    word=mode==='base'?(verb.modal?'could':crypto.randomInt(2)===0?verb.past:verb.pp):verb.base;
    subtitle=level<=3?`Verb meaning: ${verb.es}`:'Choose carefully: only one option is correct.';
    answer=verb[key];
    if(verb.modal&&mode==='participle'){
      type='Equivalent expression';title='Which expression expresses this ability in perfect tenses?';
    }
    if(level>=3 && sentences[verb.base] && ['past','participle'].includes(mode)
      && crypto.randomInt(100)<(level===3?35:level===4?70:85)){
      context=true;type=level===5?'Expert · Context':'Grammar in context';
      title='Choose the form that completes this sentence.';
      word=sentences[verb.base][mode==='past'?0:1];
      subtitle=level===3?`Verb: ${verb.base} · ${verb.es}`:`Verb: ${verb.base}`;
    }
    options=shuffle([answer,...distractors(answer,key,verb,level)]);
  }
  if(options.length!==4||new Set(options).size!==4||options.filter(v=>v===answer).length!==1)
    throw new Error(`Invalid question options: ${verb.base}`);
  return {type,title,word,subtitle,options,correctIndex:options.indexOf(answer),answer,verb,context};
}
class GameService {
  constructor({now=()=>Date.now()}={}) {this.now=now;this.rooms=new Map();this.broadcast=()=>{};}
  room(code){const room=this.rooms.get(String(code||'').toUpperCase());if(!room) throw new Error('Sala no encontrada o expirada.');return room;}
  auth(code,token){const room=this.room(code);if(room.admin.token===token)return {room,person:room.admin};const person=room.players.find(p=>p.token===token);if(!person)throw new Error('Credenciales de sala incorrectas.');return {room,person};}
  uniqueCode(){let code;do{code=Array.from({length:6},()=>CODES[crypto.randomInt(CODES.length)]).join('');}while(this.rooms.has(code));return code;}
  validateName(name){const value=String(name||'').trim().replace(/\s+/g,' ');if(value.length<2||value.length>22||/[<>\x00-\x1f]/.test(value))throw new Error('Introduce un nombre de 2 a 22 caracteres.');return value;}
  create({name,capacity=10,duration=3,mode='mixed'}){
    this.cleanup();
    if(this.rooms.size>=MAX_ROOMS)throw new Error('El servidor alcanzó el límite de salas.');
    name=this.validateName(name);capacity=Number(capacity);duration=Number(duration);
    if(!Number.isInteger(capacity)||capacity<MIN_CAPACITY||capacity>50)throw new Error('La capacidad debe ser de 10 a 50 jugadores.');
    if(![1,2,3,5,10,15].includes(duration))throw new Error('Elige un tiempo entre 1 y 15 minutos.');
    if(!['mixed','past','participle','base'].includes(mode))throw new Error('Modo no válido.');
    const code=this.uniqueCode(),token=crypto.randomBytes(24).toString('hex');
    const admin={token,name,id:'admin',role:'admin',connected:false,connections:0};
    const room={code,admin,players:[],capacity,duration,mode,phase:'lobby',createdAt:this.now(),startedAt:null,endsAt:null,finishedAt:null,sequence:shuffle(VERBS),winners:[]};
    this.rooms.set(code,room);
    return {code,token,role:'admin'};
  }
  join({code,name}){
    const room=this.room(code);name=this.validateName(name);
    if(room.phase!=='lobby')throw new Error('La partida ya comenzó. No se admiten jugadores nuevos.');
    if(room.players.length>=room.capacity)throw new Error('La sala está completa.');
    if(room.players.some(p=>p.name.toLocaleLowerCase()===name.toLocaleLowerCase()))throw new Error('Ese nombre ya está ocupado en la sala.');
    const player={id:crypto.randomUUID(),token:crypto.randomBytes(24).toString('hex'),name,role:'player',connections:0,connected:false,forfeited:false,
      score:0,correct:0,wrong:0,streak:0,bestStreak:0,level:1,levelProgress:0,index:0,answered:false,
      question:null,feedback:null,issuedAt:null,reactionMs:0,finishedAt:null};
    room.players.push(player);this.broadcast(room);
    return {code:room.code,token:player.token,role:'player'};
  }
  start(code,token){
    const {room,person}=this.auth(code,token);
    if(person.role!=='admin')throw new Error('Solo el administrador puede iniciar la partida.');
    if(room.phase!=='lobby')throw new Error('La sala ya inició.');
    if(room.players.length<MIN_PLAYERS)throw new Error('Espera a que entre al menos un jugador antes de iniciar la partida.');
    room.phase='playing';room.startedAt=this.now()+3000;room.endsAt=room.startedAt+room.duration*60000;
    for(const player of room.players) this.giveQuestion(room,player);
    this.broadcast(room);
  }
  giveQuestion(room,player){
    if(player.index>=room.sequence.length){player.question=null;player.finishedAt=this.now();return;}
    player.question=buildQuestion(room.sequence[player.index],player.level,room.mode);
    player.answered=false;player.feedback=null;
    player.issuedAt=Math.max(this.now(),room.startedAt);
  }
  answer(code,token,option){
    const {room,person:p}=this.auth(code,token);
    if(p.role!=='player'||p.forfeited)throw new Error('Solo los participantes activos pueden responder.');
    if(room.phase!=='playing'||this.now()<room.startedAt||this.now()>=room.endsAt){this.tick();throw new Error('La partida no está abierta para responder.');}
    if(p.answered||!p.question)throw new Error('Ya respondiste esta pregunta.');
    if(!Number.isInteger(option)||option<0||option>3)throw new Error('Respuesta inválida.');
    const q=p.question,correct=q.correctIndex===option;
    if(correct){
      p.correct++;p.streak++;p.bestStreak=Math.max(p.bestStreak,p.streak);
      p.score+=10+2*(p.level-1)+(p.streak>=3?2:0);
      p.reactionMs+=Math.max(0,this.now()-p.issuedAt);
      if(p.level<5 && ++p.levelProgress>=2){p.level++;p.levelProgress=0;}
    } else {p.wrong++;p.streak=0;p.level=Math.max(1,p.level-1);p.levelProgress=0;}
    p.answered=true;
    const tip=p.level>=4 ? q.type.includes('Triple trap')
      ? 'Review the base → past → participle order.'
      : (q.type.includes('trap')||q.type.includes('Two gaps')||q.type.includes('challenge'))
        ? 'Yesterday takes simple past; have/has takes the participle.'
        : 'Compare the verb forms: similar-looking options may be different tenses.' : '';
    p.feedback={correct,chosenIndex:option,correctIndex:q.correctIndex,forms:`${q.verb.base} → ${q.verb.past} → ${q.verb.pp}`,meaning:q.verb.es,note:[q.verb.note,tip].filter(Boolean).join(' '),points:p.score};
    this.broadcast(room);
    return {correct};
  }
  next(code,token){
    const {room,person:p}=this.auth(code,token);
    if(room.phase!=='playing'||p.role!=='player'||p.forfeited||!p.answered||!p.question)throw new Error('No puedes avanzar todavía.');
    if(this.now()>=room.endsAt){this.finish(room);return;}
    p.index++;this.giveQuestion(room,p);
    if(room.players.filter(x=>!x.forfeited).every(x=>x.finishedAt!==null))this.finish(room);
    else this.broadcast(room);
  }
  leave(code,token){
    const {room,person}=this.auth(code,token);
    if(person.role==='admin' && room.phase==='lobby'){
      this.rooms.delete(room.code);this.broadcast(room,'closed','El administrador ha cerrado la sala.');return;
    }
    if(person.role==='player'){
      if(room.phase==='lobby')room.players=room.players.filter(p=>p!==person);
      else if(room.phase==='playing')person.forfeited=true;
    }
    // El administrador puede salir mientras se juega; el servidor mantiene el torneo.
    if(room.phase==='playing'&&!room.players.some(p=>!p.forfeited))this.finish(room);
    this.broadcast(room);
  }
  leaderboard(room){
    const sorted=[...room.players].sort((a,b)=>b.score-a.score||b.correct-a.correct||a.wrong-b.wrong||a.reactionMs-b.reactionMs||a.name.localeCompare(b.name));
    return sorted.map((p,i)=>({id:p.id,name:p.name,score:p.score,correct:p.correct,wrong:p.wrong,level:p.level,online:p.connections>0,forfeited:p.forfeited,
      finished:p.finishedAt!==null,rank:1+sorted.slice(0,i).filter(x=>!x.forfeited).length}));
  }
  finish(room){
    if(room.phase==='results')return;
    room.phase='results';room.finishedAt=this.now();
    const eligible=this.leaderboard(room).filter(p=>!p.forfeited);
    if(eligible.length && eligible[0].score>0){
      const first=eligible[0];
      room.winners=eligible.filter(p=>{
        const real=room.players.find(x=>x.id===p.id),ref=room.players.find(x=>x.id===first.id);
        return p.score===first.score&&p.correct===first.correct&&p.wrong===first.wrong&&real.reactionMs===ref.reactionMs;
      }).map(x=>x.name);
    }
    this.broadcast(room);
  }
  // El cliente ya calcula la cuenta regresiva con endsAt y serverNow.
  // Enviar un ranking completo cada segundo a cada usuario consumía
  // ancho de banda sin necesidad. Las mutaciones ya emiten broadcast().
  // El temporizador sigue revisando cada segundo para cerrar la partida.
  tick(){
    for(const room of this.rooms.values()){
      if(room.phase==='playing'&&this.now()>=room.endsAt)this.finish(room);
    }
    this.cleanup();
  }
  cleanup(){const now=this.now();for(const [code,room] of this.rooms){
    if(room.phase==='results'&&now-room.finishedAt>30*60000||room.phase==='lobby'&&now-room.createdAt>90*60000)this.rooms.delete(code);
  }}
  publicState(code,token){
    const {room,person:p}=this.auth(code,token);
    const active=room.phase==='playing'&&this.now()>=room.endsAt;
    if(active)this.finish(room);
    const isAdmin=p.role==='admin';
    const question=room.phase==='playing'&&!isAdmin&&!p.forfeited&&p.question ? {
      index:p.index+1,total:room.sequence.length,level:p.level,type:p.question.type,title:p.question.title,
      word:p.question.word,subtitle:p.question.subtitle,options:p.question.options,context:p.question.context
    } : null;
    return {code:room.code,phase:room.phase,role:p.role,self:{name:p.name,id:p.id,score:p.score||0,correct:p.correct||0,wrong:p.wrong||0,
        streak:p.streak||0,level:p.level||1,answered:!!p.answered,forfeited:!!p.forfeited},
      capacity:room.capacity,required:MIN_PLAYERS,mode:room.mode,duration:room.duration,
      joined:room.players.length,startedAt:room.startedAt,endsAt:room.endsAt,serverNow:this.now(),
      players:room.players.map(x=>({id:x.id,name:x.name,online:x.connections>0})),
      ranking:this.leaderboard(room),question,feedback:room.phase==='playing'&&!isAdmin?p.feedback:null,winners:room.winners};
  }
}
module.exports={GameService,VERBS,LEVELS,MIN_PLAYERS,buildQuestion,accepted};
