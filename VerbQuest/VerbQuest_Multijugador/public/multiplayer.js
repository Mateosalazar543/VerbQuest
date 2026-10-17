'use strict';
/* VerbQuest v4 — Cliente multijugador.
   El servidor controla respuestas, reloj, puntos, dificultad y clasificación.
   Este archivo se ejecuta después del script del modo individual. */
(() => {
  const $m = id => document.getElementById(id);
  const SESSION_KEY = 'verbquest_online_session_v1';
  let setupMode = 'create', session = null, stream = null, view = null;
  let clockOffset = 0, busy = false, questionSignature = '', pendingAnswer = false;
  const safeSave = value => { try { if(value)sessionStorage.setItem(SESSION_KEY,JSON.stringify(value)); else sessionStorage.removeItem(SESSION_KEY); } catch {} };
  const safeLoad = () => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null'); }catch{return null;} };
  function errorAt(id,message){const el=$m(id);el.textContent=message;el.hidden=!message;}
  const caps = s => String(s||'').replace(/\b[a-z]/g,c=>c.toUpperCase());
  async function api(action,data={}){
    let response;
    try{response=await fetch(`/api/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});}
    catch{throw Error('No se pudo conectar. Ejecuta npm start y abre la dirección del servidor, no el HTML directamente.');}
    const result=await response.json();
    if(!response.ok)throw Error(result.error||'Error de conexión.');
    return result;
  }
  async function readState(){
    const url=`/api/state?code=${encodeURIComponent(session.code)}&token=${encodeURIComponent(session.token)}`;
    const response=await fetch(url);
    const result=await response.json();
    if(!response.ok)throw Error(result.error||'La sala no está disponible.');
    return result;
  }
  function showSetup(mode){
    setupMode=mode;
    $m('onlineSetupTitle').textContent=mode==='create'?'Create a room':'Join a room';
    $m('adminControls').hidden=mode!=='create';
    $m('joinCodeWrap').hidden=mode!=='join';
    $m('joinCode').required=mode==='join';
    $m('tabCreate').classList.toggle('active',mode==='create');
    $m('tabJoin').classList.toggle('active',mode==='join');
    $m('submitRoomButton').textContent=mode==='create'?'Create room →':'Join challenge →';
    errorAt('onlineSetupError','');
    showScreen($m('onlineSetupScreen'));
    $m('onlineName').focus();
  }
  function disconnect(clear=true){
    if(stream){stream.close();stream=null;}
    questionSignature='';view=null;pendingAnswer=false;
    if(clear){session=null;safeSave(null);}
  }
  function openRoom(details){
    disconnect(false);
    session=details;safeSave(details);
    window.__vqWon=false;
    clockOffset=0;
    const url=`/api/events?code=${encodeURIComponent(session.code)}&token=${encodeURIComponent(session.token)}`;
    stream=new EventSource(url);
    stream.addEventListener('state',event=>{
      try{const next=JSON.parse(event.data);render(next);}catch(e){console.error('Invalid room state',e);}
    });
    stream.addEventListener('closed',event=>{
      const message=JSON.parse(event.data).message||'La sala se ha cerrado.';
      disconnect();showScreen($m('startScreen'));window.alert(message);
    });
    stream.onerror=()=>{
      if(!session)return;
      if(view?.phase==='lobby')$m('lobbyNote').textContent='⚠️ Reconectando con el servidor…';
      if(view?.phase==='playing')$m('onlineGameEyebrow').textContent='⚠️ Reconectando…';
    };
    readState().then(render).catch(e=>{
      disconnect();showScreen($m('startScreen'));window.alert(e.message);
    });
  }
  function roomInvite(){
    const url=new URL(window.location.href);
    url.search='';url.hash='';url.searchParams.set('room',session.code);
    return `${url.toString()}\nRoom code: ${session.code}`;
  }
  async function copyInvitation(){
    const data=roomInvite();
    try{await navigator.clipboard.writeText(data);$m('copyRoomButton').textContent='✓ Copied';setTimeout(()=>{$m('copyRoomButton').textContent='Copy invitation';},2000);}
    catch{window.prompt('Copy this invitation:',data);}
  }
  function render(data){
    if(!session||data.code!==session.code)return;
    view=data;clockOffset=data.serverNow-Date.now();
    if(data.phase==='lobby')renderLobby(data);
    else if(data.phase==='playing')renderGame(data);
    else renderResults(data);
  }
  function renderLobby(data){
    if($m('onlineLobbyScreen').hidden)showScreen($m('onlineLobbyScreen'));
    $m('lobbyTitle').textContent=data.role==='admin'?'You are the room administrator 👑':'You are in! 🎉';
    $m('lobbyCode').textContent=data.code;
    $m('lobbyStatus').textContent=`${data.joined}/${data.capacity} players`;
    $m('lobbyDetails').textContent=`${data.joined} registered / ${data.capacity} maximum · ${data.required} required to start · ${data.duration} min total · ${data.mode} mode`;
    const host=data.role==='admin';
    $m('startOnlineButton').hidden=!host;
    $m('startOnlineButton').disabled=data.joined<data.required;
    $m('startOnlineButton').textContent=data.joined<data.required?`Need ${data.required-data.joined} more player(s)`:'🚀 Start challenge';
    $m('lobbyNote').textContent=host?(data.joined>=10?'✅ Enough players! You can start the competition.':'Invite at least 10 players before starting.'):'Waiting for the administrator to start. Keep this page open.';
    const list=$m('lobbyPlayers');list.replaceChildren();
    data.players.forEach((p,i)=>{
      const item=document.createElement('div');item.className=`player-chip${p.online?'':' offline'}`;
      item.textContent=`${i+1}. ${p.name} ${p.online?'🟢':'⚪'}`;list.append(item);
    });
  }
  function countdown(data){
    const now=Date.now()+clockOffset;
    if(data.startedAt&&now<data.startedAt)return {before:true,ms:data.startedAt-now};
    return {before:false,ms:Math.max(0,(data.endsAt||now)-now)};
  }
  function refreshClock(){
    if(!view||view.phase!=='playing')return;
    const {before,ms}=countdown(view);
    const seconds=Math.ceil(ms/1000);
    $m('onlineClock').textContent=before?`Start in ${seconds}s`:`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    $m('onlineClock').classList.toggle('urgent',!before&&seconds<=20);
    const isHost=view.role==='admin';
    $m('onlineStandby').hidden=!(isHost||before||!view.question);
    $m('onlineQuestionContainer').hidden=isHost||before||!view.question;
    if(before)$m('onlineStandby').textContent=`Get ready! Starting in ${seconds}…`;
    else if(isHost)$m('onlineStandby').textContent='👑 The students are playing. Watch the live leaderboard below.';
    else if(!view.question)$m('onlineStandby').textContent='🎯 You finished all 80 verbs. Wait for the clock to end!';
    const blocked=before || view.self.answered || pendingAnswer;
    for(const button of $m('onlineAnswers').children)button.disabled=blocked;
  }
  function ranking(elId,data,limit=Infinity){
    const container=$m(elId);container.replaceChildren();
    const filtered=data.ranking.filter(p=>!p.forfeited).slice(0,limit);
    if(!filtered.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='Waiting for results...';container.append(empty);return;}
    filtered.forEach((player,i)=>{
      const item=document.createElement('div');item.className=`rank-row${player.id===data.self.id?' my-rank':''}`;
      const medal=document.createElement('strong');medal.textContent=i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`;
      const name=document.createElement('span');name.textContent=`${player.name}${player.id===data.self.id?' (you)':''}`;
      const score=document.createElement('strong');score.textContent=`${player.score} pts`;
      item.append(medal,name,score);container.append(item);
    });
  }
  function renderGame(data){
    if($m('onlineGameScreen').hidden)showScreen($m('onlineGameScreen'));
    $m('onlineGameEyebrow').textContent=data.role==='admin'?'👑 Administrator · Live scores':`🌍 Room ${data.code} · Live match`;
    $m('onlineScore').textContent=`⭐ ${data.self.score} pts`;
    $m('onlineLevel').textContent=`⚡ L${data.self.level} · ${['Starter','Explorer','Practitioner','Advanced','Expert'][data.self.level-1]}`;
    $m('onlineLevel').dataset.level=String(data.self.level);
    $m('onlineStreak').textContent=`🔥 ${data.self.streak} streak`;
    ranking('onlineLiveRanks',data,10);
    const q=data.question;
    if(q){
      $m('onlineCounter').textContent=`Question ${q.index} of ${q.total}`;
      $m('onlineProgress').style.width=`${(q.index-1)/q.total*100}%`;
      $m('onlineType').textContent=q.type;
      $m('onlineQuestionTitle').textContent=q.title;
      $m('onlineWord').textContent=caps(q.word);
      $m('onlineWord').classList.toggle('context-word',!!q.context);
      $m('onlineSubtitle').textContent=q.subtitle;
      const signature=`${q.index}:${q.options.join('|')}`;
      if(questionSignature!==signature){
        questionSignature=signature;pendingAnswer=false;
        const container=$m('onlineAnswers');container.replaceChildren();
        q.options.forEach((option,i)=>{
          const button=document.createElement('button');button.className='answer';button.type='button';button.style.setProperty('--i',i);
          const letter=document.createElement('span');letter.className='letter';letter.textContent=String.fromCharCode(65+i);
          const label=document.createElement('span');label.className='answer-label';label.textContent=caps(option);
          button.append(letter,label);
          button.addEventListener('click',()=>onlineAnswer(i));container.append(button);
        });
      }
      if(data.feedback){
        const feedback=data.feedback;
        for(const [i,button] of [...$m('onlineAnswers').children].entries()){
          button.disabled=true;
          button.classList.toggle('correct',i===feedback.correctIndex);
          button.classList.toggle('incorrect',i===feedback.chosenIndex&&!feedback.correct);
        }
        $m('onlineFeedback').hidden=false;
        $m('onlineFeedback').classList.toggle('bad',!feedback.correct);
        $m('onlineFeedbackTitle').textContent=feedback.correct?'✅ Correct answer!':'💪 Keep going!';
        $m('onlineFeedbackText').textContent=`${caps(feedback.forms)} · ${feedback.meaning}${feedback.note?' · '+feedback.note:''}`;
        $m('onlineNextButton').hidden=false;
      }else{
        $m('onlineFeedback').hidden=true;$m('onlineNextButton').hidden=true;
      }
      $m('onlineRankLabel').textContent=`${data.ranking.findIndex(p=>p.id===data.self.id)+1 || '—'} place`;
    }
    refreshClock();
  }
  async function onlineAnswer(index){
    if(!view||view.phase!=='playing'||view.self.answered||pendingAnswer||countdown(view).before)return;
    pendingAnswer=true;refreshClock();
    try{await api('answer',{...session,option:index});}
    catch(e){pendingAnswer=false;refreshClock();window.alert(e.message);}
  }
  function renderResults(data){
    if($m('onlineResultsScreen').hidden)showScreen($m('onlineResultsScreen'));
    const winners=data.winners||[];
    $m('winnerName').textContent=winners.length===0?'No winner':winners.join(' & ');
    $m('winnerDetail').textContent=winners.length>1?'A tie! Both players earned the top result.':'Highest score wins; ties are broken by correct answers, errors and response time.';
    ranking('onlineFinalRanks',data,50);
    if(data.role==='player'){
      const rank=data.ranking.filter(x=>!x.forfeited).findIndex(x=>x.id===data.self.id)+1;
      $m('myFinalSummary').textContent=data.self.forfeited?'You left the competition.':`Your result: ${rank?`#${rank}`:'—'} · ${data.self.score} points · ${data.self.correct} correct · ${data.self.wrong} incorrect.`;
    }else $m('myFinalSummary').textContent=`${data.joined} participants · ${data.duration} minutes configured.`;
    if(winners.length>0 && data.winners.includes(data.self.name) && data.role==='player' && !window.__vqWon){
      window.__vqWon=true;if(typeof confetti==='function')confetti();
    }
  }
  async function exitRoom(){
    if(!session)return;
    const role=view?.role||session.role;
    let prompt='Leave this room and return to the main menu?';
    if(view?.phase==='playing'&&role==='player')prompt='Leave the competition? This counts as withdrawal and removes you from the winner ranking.';
    if(view?.phase==='lobby'&&role==='admin')prompt='Close the room for everybody and return home?';
    if(!window.confirm(prompt))return;
    const old=session;disconnect();showScreen($m('startScreen'));
    try{await api('leave',old);}catch{}
  }
  async function submitRoom(e){
    e.preventDefault();if(busy)return;
    errorAt('onlineSetupError','');busy=true;$m('submitRoomButton').disabled=true;
    try{
      const name=$m('onlineName').value;
      const details=setupMode==='create'
        ?await api('create',{name,capacity:Number($m('maxPlayers').value),duration:Number($m('roomMinutes').value),mode:$m('roomMode').value})
        :await api('join',{name,code:$m('joinCode').value.trim().toUpperCase()});
      openRoom(details);
    }catch(e){errorAt('onlineSetupError',e.message);}
    finally{busy=false;$m('submitRoomButton').disabled=false;}
  }
  $m('createRoomButton').addEventListener('click',()=>showSetup('create'));
  $m('joinRoomButton').addEventListener('click',()=>showSetup('join'));
  $m('tabCreate').addEventListener('click',()=>showSetup('create'));
  $m('tabJoin').addEventListener('click',()=>showSetup('join'));
  $m('backFromSetup').addEventListener('click',()=>showScreen($m('startScreen')));
  $m('onlineForm').addEventListener('submit',submitRoom);
  $m('copyRoomButton').addEventListener('click',copyInvitation);
  $m('startOnlineButton').addEventListener('click',async()=>{
    errorAt('lobbyError','');$m('startOnlineButton').disabled=true;
    try{await api('start',session);}catch(e){errorAt('lobbyError',e.message);}
    finally{$m('startOnlineButton').disabled=false;}
  });
  $m('leaveLobbyButton').addEventListener('click',exitRoom);
  $m('leaveOnlineButton').addEventListener('click',exitRoom);
  $m('onlineResultsHome').addEventListener('click',()=>{disconnect();showScreen($m('startScreen'));});
  $m('onlineNextButton').addEventListener('click',async()=>{
    if(!session||busy)return;busy=true;$m('onlineNextButton').disabled=true;
    try{await api('next',session);}catch(e){window.alert(e.message);}
    finally{busy=false;$m('onlineNextButton').disabled=false;}
  });
  setInterval(refreshClock,200);
  document.addEventListener('keydown',e=>{
    if($m('onlineGameScreen').hidden||e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    if(!view?.self.answered && /^[1-4]$/.test(e.key)){
      e.preventDefault();$m('onlineAnswers').children[Number(e.key)-1]?.click();
    } else if(view?.self.answered && e.key==='Enter'){
      e.preventDefault();$m('onlineNextButton').click();
    }
  });
  const inviteCode=new URLSearchParams(location.search).get('room');
  const stored=safeLoad();
  if(stored?.code&&stored?.token){
    openRoom(stored);
  }else if(inviteCode&&/^[A-Z2-9]{6}$/i.test(inviteCode)){
    showSetup('join');$m('joinCode').value=inviteCode.toUpperCase();
  }
})();
