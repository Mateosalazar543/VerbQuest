    "use strict";

    /* ===== 1. BANCO DE VERBOS =====
       base: infinitivo sin "to" | past: pasado simple | pp: participio pasado
       es: significado en español | variantes con / cuando son aceptadas.
       No se almacena pronunciación. */
    const VERBS = [
      {base:"be",past:"was / were",pp:"been",es:"to exist, to be somewhere"},
      {base:"become",past:"became",pp:"become",es:"to turn into"},
      {base:"begin",past:"began",pp:"begun",es:"to start"},
      {base:"bet",past:"bet",pp:"bet",es:"to gamble on an outcome"},
      {base:"bite",past:"bit",pp:"bitten",es:"to cut with the teeth"},
      {base:"bleed",past:"bled",pp:"bled",es:"to lose blood"},
      {base:"blow",past:"blew",pp:"blown",es:"to push air out"},
      {base:"break",past:"broke",pp:"broken",es:"to split into pieces"},
      {base:"bring",past:"brought",pp:"brought",es:"to carry here"},
      {base:"build",past:"built",pp:"built",es:"to construct"},
      {base:"buy",past:"bought",pp:"bought",es:"to purchase"},
      // CAN es modal: "been able to" es una expresión equivalente, NO su participio.
      {base:"can",past:"could",pp:"been able to",es:"to be able to",modal:true,
       note:"“Can” is a modal verb and has no past participle. “Been able to” is an equivalent expression used in perfect tenses."},
      {base:"catch",past:"caught",pp:"caught",es:"to grab, to capture"},
      {base:"choose",past:"chose",pp:"chosen",es:"to pick"},
      {base:"come",past:"came",pp:"come",es:"to arrive, to move toward"},
      {base:"cost",past:"cost",pp:"cost",es:"to have a price"},
      {base:"cut",past:"cut",pp:"cut",es:"to slice"},
      {base:"deal",past:"dealt",pp:"dealt",es:"to handle, to trade"},
      {base:"do",past:"did",pp:"done",es:"to perform, to carry out"},
      {base:"draw",past:"drew",pp:"drawn",es:"to sketch"},
      {base:"dream",past:"dreamt / dreamed",pp:"dreamt / dreamed",es:"to imagine while asleep"},
      {base:"drive",past:"drove",pp:"driven",es:"to operate a vehicle"},
      {base:"eat",past:"ate",pp:"eaten",es:"to consume food"},
      {base:"fall",past:"fell",pp:"fallen",es:"to drop down"},
      {base:"feed",past:"fed",pp:"fed",es:"to give food"},
      {base:"feel",past:"felt",pp:"felt",es:"to sense, to experience"},
      {base:"fight",past:"fought",pp:"fought",es:"to battle"},
      {base:"find",past:"found",pp:"found",es:"to discover"},
      {base:"fly",past:"flew",pp:"flown",es:"to travel through the air"},
      {base:"forbid",past:"forbade",pp:"forbidden",es:"to ban"},
      {base:"forget",past:"forgot",pp:"forgotten",es:"to fail to remember"},
      {base:"forgive",past:"forgave",pp:"forgiven",es:"to pardon"},
      {base:"get",past:"got",pp:"gotten / got",es:"to obtain, to receive",
       note:"“Gotten” is common in American English; “got” also works as a participle, especially in British English."},
      {base:"give",past:"gave",pp:"given",es:"to hand over"},
      {base:"go",past:"went",pp:"gone",es:"to travel, to move"},
      {base:"grow",past:"grew",pp:"grown",es:"to get bigger, to cultivate"},
      {base:"have",past:"had",pp:"had",es:"to own, to possess"},
      {base:"hear",past:"heard",pp:"heard",es:"to perceive sound"},
      {base:"hurt",past:"hurt",pp:"hurt",es:"to cause pain"},
      {base:"keep",past:"kept",pp:"kept",es:"to hold on to"},
      {base:"know",past:"knew",pp:"known",es:"to be aware of"},
      {base:"lead",past:"led",pp:"led",es:"to guide"},
      {base:"learn",past:"learnt / learned",pp:"learnt / learned",es:"to gain knowledge"},
      {base:"leave",past:"left",pp:"left",es:"to depart"},
      {base:"lend",past:"lent",pp:"lent",es:"to loan"},
      {base:"let",past:"let",pp:"let",es:"to allow"},
      {base:"lose",past:"lost",pp:"lost",es:"to misplace, to be defeated"},
      {base:"make",past:"made",pp:"made",es:"to create, to produce"},
      {base:"mean",past:"meant",pp:"meant",es:"to signify"},
      {base:"meet",past:"met",pp:"met",es:"to encounter"},
      {base:"mistake",past:"mistook",pp:"mistaken",es:"to confuse with something else"},
      {base:"pay",past:"paid",pp:"paid",es:"to give money for something"},
      {base:"put",past:"put",pp:"put",es:"to place"},
      {base:"read",past:"read",pp:"read",es:"to look at words and understand them"},
      {base:"ride",past:"rode",pp:"ridden",es:"to travel on a bike or horse"},
      {base:"run",past:"ran",pp:"run",es:"to move fast on foot"},
      {base:"say",past:"said",pp:"said",es:"to speak words"},
      {base:"see",past:"saw",pp:"seen",es:"to view with the eyes"},
      {base:"sell",past:"sold",pp:"sold",es:"to exchange for money"},
      {base:"send",past:"sent",pp:"sent",es:"to dispatch"},
      {base:"shut",past:"shut",pp:"shut",es:"to close"},
      {base:"sit",past:"sat",pp:"sat",es:"to rest on a seat"},
      {base:"sleep",past:"slept",pp:"slept",es:"to rest with eyes closed"},
      {base:"smell",past:"smelt / smelled",pp:"smelt / smelled",es:"to detect an odor"},
      {base:"speak",past:"spoke",pp:"spoken",es:"to talk"},
      {base:"spend",past:"spent",pp:"spent",es:"to use money or time"},
      {base:"stand",past:"stood",pp:"stood",es:"to be upright"},
      {base:"steal",past:"stole",pp:"stolen",es:"to take without permission"},
      {base:"swim",past:"swam",pp:"swum",es:"to move through water"},
      {base:"take",past:"took",pp:"taken",es:"to grab, to carry away"},
      {base:"teach",past:"taught",pp:"taught",es:"to instruct"},
      {base:"tell",past:"told",pp:"told",es:"to inform, to narrate"},
      {base:"think",past:"thought",pp:"thought",es:"to use the mind, to believe"},
      {base:"throw",past:"threw",pp:"thrown",es:"to hurl"},
      {base:"understand",past:"understood",pp:"understood",es:"to grasp the meaning"},
      {base:"wake",past:"woke",pp:"woken",es:"to stop sleeping"},
      {base:"wear",past:"wore",pp:"worn",es:"to have clothes on"},
      {base:"win",past:"won",pp:"won",es:"to come first"},
      {base:"write",past:"wrote",pp:"written",es:"to put words on paper"},
      {base:"tread",past:"trod",pp:"trodden",es:"to step on, to walk on",
       note:"“Trod” is the usual simple past of “tread”. “Trode” is a historical or rare form."}
    ];

    /* ===== 2. ESTADO, DATOS LOCALES Y UTILIDADES ===== */
    const $ = id => document.getElementById(id);
    const screens = [$('startScreen'), $('gameScreen'), $('resultScreen'), $('onlineSetupScreen'), $('onlineLobbyScreen'), $('onlineGameScreen'), $('onlineResultsScreen')];
    const MODES = ['past', 'participle', 'base'];
    const LEVELS = ['Starter', 'Explorer', 'Practitioner', 'Advanced', 'Expert'];
    const STORE_KEY = 'verbquest_mastery_v1';
    let progress = loadProgress();
    const state = {
      questions: [], index: 0, correct: 0, points: 0, streak: 0, bestStreak: 0,
      answered: false, timeLimit: 0, timerId: null, deadline: 0,
      difficulty: 1, highestDifficulty: 1, correctTowardLevel: 0,
      practiceMode: 'mixed', isReview: false, reviewStartCount: 0,
      mistakes: new Map(), expandedMistakes: false, runLength: 20
    };

    // Cargamos y guardamos solo estadísticas; las respuestas del banco siguen en el archivo.
    function loadProgress() {
      try {
        const value = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
      } catch (_) { return {}; } // Permite usar el juego aunque localStorage esté bloqueado.
    }
    function saveProgress() {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); }
      catch (_) { $('storageNote').hidden = false; }
    }
    function statsFor(verb, mode) {
      const raw = progress[verb.base]?.[mode];
      return raw && typeof raw === 'object' ? raw : {attempts: 0, correct: 0, errors: 0, score: 0, streak: 0};
    }
    function numeric(value) { return Number.isFinite(value) ? value : 0; }
    function scoreFor(verb, mode) { return Math.min(100, Math.max(0, numeric(statsFor(verb, mode).score))); }
    function attemptFor(verb, mode) { return numeric(statsFor(verb, mode).attempts); }
    function modesOf(mode) { return mode === 'both' ? ['past', 'participle'] : [mode]; }
    function registerAnswer(verb, mode, correct, level) {
      if (!progress[verb.base] || typeof progress[verb.base] !== 'object') progress[verb.base] = {};
      modesOf(mode).forEach(key => {
        const prior = statsFor(verb, key);
        const streak = correct ? numeric(prior.streak) + 1 : 0;
        progress[verb.base][key] = {
          attempts: numeric(prior.attempts) + 1,
          correct: numeric(prior.correct) + (correct ? 1 : 0),
          errors: numeric(prior.errors) + (correct ? 0 : 1),
          streak,
          // El dominio exige varias respuestas correctas; equivocarse penaliza más.
          score: Math.max(0, Math.min(100, scoreFor(verb, key) + (correct ? 16 + 2 * level : -25)))
        };
      });
      saveProgress();
    }
    function overallSummary() {
      let formsPracticed = 0, formsMastered = 0, verbsPracticed = 0;
      VERBS.forEach(verb => {
        const practiced = MODES.filter(mode => attemptFor(verb, mode) > 0);
        if (practiced.length) verbsPracticed++;
        formsPracticed += practiced.length;
        formsMastered += practiced.filter(mode => scoreFor(verb, mode) >= 75 && attemptFor(verb, mode) >= 4).length;
      });
      return {formsPracticed, formsMastered, verbsPracticed};
    }
    function refreshMasteryBanner() {
      const sum = overallSummary();
      $('masteryMini').textContent = `${sum.formsMastered} mastered · ${sum.formsPracticed}/${VERBS.length * 3} forms practiced`;
      $('masteryMiniFill').style.width = `${sum.formsMastered / (VERBS.length * 3) * 100}%`;
      $('masteryCaption').textContent = `${sum.verbsPracticed} verbs studied. Weak forms get more practice in future games. Progress is saved in this browser.`;
    }
    const showScreen = screen => {
      screens.forEach(item => { item.hidden = item !== screen; });
      window.scrollTo({top: 0, behavior: 'auto'});
    };
    const shuffle = input => {
      const array = [...input];
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    const nice = text => text.replace(/\b[a-z]/g, character => character.toUpperCase());
    const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
    function confetti() {
      const box = document.createElement('div');
      box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
      const colors = ['#6c4cff', '#19c39c', '#ffb020', '#ff5d78', '#4cc9f0'];
      for (let i = 0; i < 42; i++) {
        const piece = document.createElement('i');
        piece.style.cssText = `left:${Math.random()*100}%;background:${colors[i%colors.length]};--dx:${(Math.random()-.5)*160}px;--r:${Math.random()*720}deg;animation-delay:${Math.random()*.5}s;animation-duration:${1.8+Math.random()*1.4}s`;
        box.append(piece);
      }
      document.body.append(box); setTimeout(() => box.remove(), 4200);
    }

    /* ===== 3. SELECCIÓN ADAPTATIVA =====
       Muestreo ponderado sin reemplazo: formas débiles y errores frecuentes
       aparecen más, pero todos los verbos mantienen posibilidad de salir. */
    function verbWeight(verb, practiceMode) {
      const modes = practiceMode === 'mixed' ? MODES : [practiceMode];
      const avg = modes.reduce((a, key) => a + scoreFor(verb, key), 0) / modes.length;
      const errors = modes.reduce((a, key) => a + numeric(statsFor(verb, key).errors), 0);
      return 1 + (100 - avg) / 23 + Math.min(5, errors * 0.85);
    }
    function weightedPick(items, getWeight) {
      const sum = items.reduce((acc, item) => acc + getWeight(item), 0);
      let target = Math.random() * sum;
      for (const item of items) { target -= getWeight(item); if (target <= 0) return item; }
      return items[items.length - 1];
    }
    function selectVerbs(amount, practiceMode) {
      const remaining = [...VERBS], selected = [];
      while (selected.length < amount && remaining.length) {
        const chosen = weightedPick(remaining, verb => verbWeight(verb, practiceMode));
        selected.push(chosen);
        remaining.splice(remaining.indexOf(chosen), 1);
      }
      return selected;
    }
    function chooseMode(verb, selectedMode) {
      if (selectedMode !== 'mixed') return selectedMode;
      return weightedPick(MODES, mode => 2 + (100 - scoreFor(verb, mode)) / 25
        + Math.min(4, numeric(statsFor(verb, mode).errors)));
    }
    /* Cada tamaño de sesión tiene su propia curva de aprendizaje.
       En 10 preguntas: L1→L2 y L2→L3 con 1 acierto; L3→L4 y L4→L5 con 2.
       En 20: 2 aciertos por nivel; en 40/80: 3 por nivel. */
    function answersToLevelUp(level = state.difficulty) {
      if (state.isReview) return 2;
      if (state.runLength === 10) return level <= 2 ? 1 : 2;
      return state.runLength >= 40 ? 3 : 2;
    }
    function startingDifficulty() {
      if (state.runLength !== 10) return 1;
      // El dominio consolidado en partidas anteriores evita obligar al alumno
      // experimentado a comenzar siempre desde Starter.
      let consolidated = 0;
      VERBS.forEach(verb => MODES.forEach(mode => {
        if (attemptFor(verb, mode) >= 3 && scoreFor(verb, mode) >= 70) consolidated++;
      }));
      return consolidated >= 35 ? 3 : consolidated >= 12 ? 2 : 1;
    }
    function updateDifficultyBadge() {
      const badge = $('difficultyLabel');
      badge.dataset.level = String(state.difficulty);
      badge.textContent = `L${state.difficulty} · ${LEVELS[state.difficulty - 1]}`;
      badge.title = state.difficulty === 5 ? 'Expert challenge: context, triple forms and deceptive options'
        : `${state.correctTowardLevel}/${answersToLevelUp()} correct answers toward the next level`;
    }
    function adjustDifficulty(correct) {
      const before = state.difficulty;
      if (correct) {
        if (state.difficulty < 5 && ++state.correctTowardLevel >= answersToLevelUp()) {
          state.difficulty++;
          state.correctTowardLevel = 0;
        }
      } else {
        state.difficulty = Math.max(1, state.difficulty - 1);
        state.correctTowardLevel = 0;
      }
      state.highestDifficulty = Math.max(state.highestDifficulty, state.difficulty);
      updateDifficultyBadge();
      const display = $('difficultyFeedback'); display.hidden = false;
      display.classList.toggle('down', state.difficulty < before);
      if (state.difficulty > before) {
        display.textContent = `Level up! L${state.difficulty} · ${LEVELS[state.difficulty - 1]}. A tougher challenge is coming.`;
        replay($('difficultyLabel'), 'bump');
      } else if (state.difficulty < before) {
        display.textContent = `↘ Adjusted to L${state.difficulty} · ${LEVELS[state.difficulty - 1]}. Review and build confidence.`;
      } else if (!correct) {
        display.textContent = 'Take another look at these forms and try again.';
      } else if (state.difficulty === 5) {
        display.textContent = 'Expert level! Can you outsmart the traps?';
      } else {
        display.textContent = `${answersToLevelUp() - state.correctTowardLevel} more correct answer(s) to level up.`;
      }
    }

    /* ===== 4. DISTRACTORES CON TRAMPAS MORFOLÓGICAS ===== */
    function variants(value) { return value.toLowerCase().split(' / ').map(v => v.trim()); }
    function isAccepted(candidate, expected) {
      const valid = variants(expected);
      return variants(candidate).every(v => valid.includes(v));
    }
    function editDistance(a, b) {
      const row = Array.from({length: b.length + 1}, (_, i) => i);
      for (let i = 1; i <= a.length; i++) {
        let diagonal = row[0]; row[0] = i;
        for (let j = 1; j <= b.length; j++) {
          const old = row[j];
          row[j] = Math.min(old + 1, row[j - 1] + 1, diagonal + (a[i-1] === b[j-1] ? 0 : 1));
          diagonal = old;
        }
      }
      return row[b.length];
    }
    function similarity(a, b) {
      return Math.max(...variants(a).flatMap(x => variants(b).map(y =>
        1 - editDistance(x, y) / Math.max(x.length, y.length, 1)
        + (x[0] === y[0] ? .07 : 0) + (x.slice(-2) === y.slice(-2) ? .07 : 0))));
    }
    function regularTrap(base) {
      if (base.endsWith('e')) return `${base}d`;
      if (/[^aeiou]y$/.test(base)) return `${base.slice(0, -1)}ied`;
      return `${base}ed`;
    }
    function chooseDistractors(correct, key, verb, level) {
      const candidates = new Set();
      // Palabras reales del banco, incluyendo las de otras columnas solo desde L3.
      VERBS.forEach(v => { if (v !== verb) candidates.add(v[key]); });
      if (level >= 3) VERBS.forEach(v => {
        if (v !== verb) { candidates.add(v.past); candidates.add(v.pp); candidates.add(v.base); }
      });
      const internal = ['base', 'past', 'pp'].filter(k => k !== key)
        .map(k => verb[k]).filter(v => !isAccepted(v, correct));
      const fakeForms = [regularTrap(verb.base)];
      // Errores verosímiles: regularización, terminación incorrecta o confusión de tiempos.
      if (key !== 'base') {
        // Una terminación confundible (p. ej., written → writte) y
        // una regularización simple son trampas más útiles que "wroteed".
        if (verb.pp.endsWith('en')) fakeForms.push(verb.pp.slice(0, -1));
        if (/(.)\1/.test(verb.pp)) fakeForms.push(verb.pp.replace(/(.)\1/g, '$1'));
      }
      if (level >= 2) internal.forEach(v => candidates.add(v));
      if (level >= 3) fakeForms.forEach(v => candidates.add(v));
      const eligible = value => value !== correct && !isAccepted(value, correct) && value.trim().length > 0;
      const sorted = shuffle([...candidates].filter(eligible))
        .sort((a, b) => similarity(b, correct) - similarity(a, correct));
      const chosen = [];
      const add = value => { if (value && eligible(value) && !chosen.includes(value)) chosen.push(value); };
      // L4/L5 combinan deliberadamente trampas de la misma conjugación,
      // irregularidades inventadas y palabras visualmente muy semejantes.
      if (level >= 4) {
        add(internal.sort((a,b) => similarity(b,correct)-similarity(a,correct))[0]);
        const fake = fakeForms.filter(eligible).sort((a,b) => similarity(b,correct)-similarity(a,correct))[0];
        if (key !== 'base') add(fake);
      } else if (level === 3) {
        add(internal[0]);
      }
      const fractions = [ [.72,.85,.96], [.19,.45,.70], [.04,.18,.36], [.01,.06,.18], [0,.015,.035] ][level-1];
      for (const f of fractions) {
        if (chosen.length >= 3) break;
        const pos = Math.min(sorted.length-1, Math.floor((sorted.length-1)*f));
        for (let offset=0; offset<sorted.length; offset++) {
          const candidate = sorted[Math.min(sorted.length-1, pos+offset)];
          if (candidate && !chosen.includes(candidate)) { add(candidate); break; }
        }
      }
      sorted.forEach(value => { if (chosen.length < 3) add(value); });
      if (chosen.length !== 3 || new Set(chosen).size !== 3)
        throw new Error(`Not enough unique distractors for ${verb.base}`);
      return chosen;
    }

    // Oraciones redactadas específicamente para evitar usos gramaticales ambiguos.
    const SENTENCES = {
      begin: ['The class ___ at nine yesterday.', 'The class has already ___.'],
      break: ['He ___ the glass yesterday.', 'He has ___ the glass.'],
      bring: ['She ___ her notes yesterday.', 'She has ___ her notes.'],
      build: ['They ___ a house last year.', 'They have ___ a house.'],
      buy: ['I ___ a book yesterday.', 'I have ___ that book.'],
      catch: ['He ___ the ball yesterday.', 'He has ___ the ball.'],
      choose: ['We ___ the blue one yesterday.', 'We have ___ the blue one.'],
      come: ['She ___ home late yesterday.', 'She has ___ home.'],
      do: ['He ___ his homework yesterday.', 'He has ___ his homework.'],
      draw: ['She ___ a picture yesterday.', 'She has ___ a picture.'],
      drive: ['They ___ to town yesterday.', 'They have ___ to town before.'],
      eat: ['We ___ breakfast an hour ago.', 'We have already ___.'],
      fall: ['He ___ off his bike yesterday.', 'He has ___ off his bike.'],
      feel: ['I ___ tired yesterday.', 'I have ___ tired all day.'],
      find: ['She ___ her keys yesterday.', 'She has ___ her keys.'],
      fly: ['The birds ___ south last week.', 'The birds have ___ south.'],
      forget: ['He ___ his bag yesterday.', 'He has ___ his bag.'],
      forgive: ['She ___ him yesterday.', 'She has ___ him.'],
      give: ['They ___ us a gift yesterday.', 'They have ___ us a gift.'],
      go: ['We ___ to school yesterday.', 'We have ___ home already.'],
      grow: ['The plant ___ quickly last year.', 'The plant has ___ quickly.'],
      hear: ['I ___ a strange noise last night.', 'I have ___ that sound before.'],
      keep: ['She ___ the ticket yesterday.', 'She has ___ the ticket.'],
      know: ['He ___ the truth yesterday.', 'He has ___ the truth for years.'],
      leave: ['They ___ the party early yesterday.', 'They have ___ the party.'],
      lend: ['She ___ me a pencil yesterday.', 'She has ___ me a pencil.'],
      lose: ['He ___ his keys yesterday.', 'He has ___ his keys.'],
      make: ['I ___ dinner last night.', 'I have ___ dinner already.'],
      meet: ['We ___ the teacher yesterday.', 'We have ___ the teacher before.'],
      pay: ['She ___ the bill yesterday.', 'She has ___ the bill.'],
      read: ['I ___ the letter yesterday.', 'I have ___ the letter.'],
      ride: ['He ___ a horse last summer.', 'He has ___ a horse before.'],
      run: ['She ___ five kilometers yesterday.', 'She has ___ five kilometers today.'],
      say: ['She ___ hello yesterday.', 'She has ___ hello already.'],
      see: ['They ___ the movie last week.', 'They have ___ that movie.'],
      sell: ['He ___ his bike yesterday.', 'He has ___ his bike.'],
      send: ['We ___ the email yesterday.', 'We have ___ the email.'],
      sit: ['He ___ beside me yesterday.', 'He has ___ beside me before.'],
      sleep: ['She ___ well last night.', 'She has ___ well this week.'],
      speak: ['I ___ to him yesterday.', 'I have ___ to him already.'],
      spend: ['We ___ too much yesterday.', 'We have ___ too much.'],
      stand: ['He ___ by the door yesterday.', 'He has ___ there for hours.'],
      steal: ['Someone ___ my wallet yesterday.', 'Someone has ___ my wallet.'],
      swim: ['We ___ in the lake yesterday.', 'We have ___ in that lake.'],
      take: ['She ___ the train yesterday.', 'She has ___ that train before.'],
      teach: ['He ___ English last year.', 'He has ___ English for years.'],
      tell: ['She ___ me the story yesterday.', 'She has ___ me that story.'],
      think: ['I ___ about it yesterday.', 'I have ___ about it all day.'],
      throw: ['He ___ the ball yesterday.', 'He has ___ the ball.'],
      understand: ['She ___ the lesson yesterday.', 'She has ___ the lesson.'],
      wake: ['He ___ early yesterday.', 'He has ___ early all week.'],
      wear: ['She ___ a blue shirt yesterday.', 'She has ___ that shirt before.'],
      win: ['Our team ___ yesterday.', 'Our team has ___ again.'],
      write: ['I ___ a letter yesterday.', 'I have ___ a letter.']
    };

    function makeStandardQuestion(verb, mode, level) {
      let type, title, word, subtitle, key;
      if (mode === 'past') {
        type = 'Simple past'; title = 'What is the simple past of this verb?';
        word = verb.base; subtitle = `Base form · ${verb.es}`; key = 'past';
      } else if (mode === 'participle') {
        type = verb.modal ? 'Equivalent expression' : 'Past participle';
        title = verb.modal ? 'Which expression is used in perfect tenses?'
          : 'What is the past participle of this verb?';
        word = verb.base; subtitle = `Base form · ${verb.es}`; key = 'pp';
      } else {
        type = 'Base form'; title = 'What is the base form of this verb?';
        const from = verb.modal || Math.random() < .5 ? 'past' : 'pp';
        word = verb[from]; subtitle = `${from === 'past' ? 'Simple past' : 'Past participle'} · ${verb.es}`;
        key = 'base';
      }
      const correctAnswer = verb[key];
      return {verb, mode, level, type, title, word, subtitle, correctAnswer,
        options: shuffle([correctAnswer, ...chooseDistractors(correctAnswer, key, verb, level)]),
        context: false};
    }
    function makeContextQuestion(verb, mode, level) {
      const index = mode === 'past' ? 0 : 1;
      const correctAnswer = verb[mode === 'past' ? 'past' : 'pp'];
      const word = SENTENCES[verb.base][index];
      return {verb, mode, level, type: 'Fill the gap · ' + (index ? 'Past participle' : 'Simple past'),
        title: 'Choose the form that completes the sentence.', word,
        subtitle: `Verb: ${nice(verb.base)}${level < 4 ? ` · ${verb.es}` : ''}`,
        correctAnswer,
        options: shuffle([correctAnswer, ...chooseDistractors(correctAnswer, index ? 'pp' : 'past', verb, level)]),
        context: true};
    }
    function makePairOptions(verb) {
      const correct = `${verb.past} → ${verb.pp}`;
      const raw = [
        `${verb.pp} → ${verb.past}`, `${verb.base} → ${verb.pp}`,
        `${verb.past} → ${verb.base}`, `${regularTrap(verb.base)} → ${verb.pp}`,
        `${verb.past} → ${regularTrap(verb.base)}`
      ];
      const nearPast = chooseDistractors(verb.past, 'past', verb, 5);
      const nearPP = chooseDistractors(verb.pp, 'pp', verb, 5);
      nearPast.forEach(v => raw.push(`${v} → ${verb.pp}`));
      nearPP.forEach(v => raw.push(`${verb.past} → ${v}`));
      const valid = text => {
        const [past, pp] = text.split(' → ');
        return isAccepted(past,verb.past) && isAccepted(pp,verb.pp);
      };
      const wrong = shuffle([...new Set(raw)]).filter(v => v !== correct && !valid(v))
        .sort((a,b) => similarity(b,correct)-similarity(a,correct)).slice(0,3);
      if (wrong.length !== 3) throw new Error('Pair options are insufficient');
      return {correctAnswer:correct,options:shuffle([correct,...wrong])};
    }
    function makePairQuestion(verb, level) {
      return {
        verb, mode:'both', level, type:level === 5 ? 'Expert · Double trap' : 'Two-form challenge',
        title:level === 5 ? 'Only ONE pair is correct. Spot the traps!' : 'Choose the correct past → participle pair.',
        word:verb.base, subtitle:level < 4 ? `Simple past → Past participle · ${verb.es}` : 'Simple past → Past participle',
        ...makePairOptions(verb), context:false
      };
    }
    function makeDoubleContextQuestion(verb, level) {
      return {
        verb, mode:'both', level, type:level === 5 ? 'Expert · Two gaps' : 'Advanced · Two gaps',
        title:'Complete BOTH sentences: simple past → past participle.',
        word:SENTENCES[verb.base].join('\n'),
        subtitle:'Choose the pair that fits the two gaps in order.',
        ...makePairOptions(verb), context:true
      };
    }
    function makeTripleQuestion(verb, level) {
      const correctAnswer = `${verb.base} → ${verb.past} → ${verb.pp}`;
      const raw = [
        `${verb.base} → ${verb.pp} → ${verb.past}`,
        `${verb.base} → ${verb.base} → ${verb.pp}`,
        `${verb.base} → ${verb.past} → ${verb.base}`,
        `${verb.base} → ${regularTrap(verb.base)} → ${verb.pp}`,
        `${verb.base} → ${verb.past} → ${regularTrap(verb.base)}`
      ];
      chooseDistractors(verb.past, 'past', verb, 5).forEach(v => raw.push(`${verb.base} → ${v} → ${verb.pp}`));
      chooseDistractors(verb.pp, 'pp', verb, 5).forEach(v => raw.push(`${verb.base} → ${verb.past} → ${v}`));
      const isTrue = value => {
        const [base,past,pp] = value.split(' → ');
        return isAccepted(base,verb.base) && isAccepted(past,verb.past) && isAccepted(pp,verb.pp);
      };
      const wrong = shuffle([...new Set(raw)]).filter(value => value !== correctAnswer && !isTrue(value))
        .sort((a,b) => similarity(b,correctAnswer)-similarity(a,correctAnswer)).slice(0,3);
      if (wrong.length !== 3) throw new Error(`Triple options insufficient for ${verb.base}`);
      return {verb,mode:'both',level,type:'Expert · Triple trap',
        title:'Which complete sequence is 100% correct?',word:verb.base,
        subtitle:'Base form → Simple past → Past participle',
        correctAnswer,options:shuffle([correctAnswer,...wrong]),context:false};
    }
    function makeQuestion(item) {
      const {verb} = item, level = state.difficulty;
      if (item.mode === 'both' && !verb.modal) return makePairQuestion(verb,level);
      if (state.practiceMode === 'mixed' && !state.isReview && !verb.modal && level >= 4) {
        const random = Math.random();
        if (level === 5) {
          if (SENTENCES[verb.base] && random < .42) return makeDoubleContextQuestion(verb,level);
          if (random < .82) return makeTripleQuestion(verb,level);
          return makePairQuestion(verb,level);
        }
        if (SENTENCES[verb.base] && random < .35) return makeDoubleContextQuestion(verb,level);
        if (random < .66) return makePairQuestion(verb,level);
      }
      const mode = item.mode;
      if (level >= 3 && (mode === 'past' || mode === 'participle') && SENTENCES[verb.base]
          && Math.random() < (level === 3 ? .35 : level === 4 ? .70 : .85)) {
        return makeContextQuestion(verb,mode,level);
      }
      const question = makeStandardQuestion(verb,mode,level);
      if (level >= 4) question.subtitle = question.subtitle.split(' · ')[0];
      return question;
    }

    /* ===== 5. PARTIDAS NORMALES Y REPASO DE ERRORES ===== */
    function beginRun(items, review = false) {
      stopTimer();
      state.questions = items;
      state.index = 0; state.correct = 0; state.points = 0;
      state.streak = 0; state.bestStreak = 0; state.answered = false;
      state.runLength = items.length;
      state.difficulty = review ? 2 : startingDifficulty();
      state.highestDifficulty = state.difficulty;
      state.correctTowardLevel = 0;
      state.isReview = review;
      state.timeLimit = Number($('timerSelect').value);
      updateDifficultyBadge();
      $('gameTitle').textContent = review ? 'Error review' : 'You can do it!';
      showScreen($('gameScreen'));
      renderQuestion();
    }
    function startGame() {
      const requested = $('countSelect').value;
      const amount = requested === 'all' ? VERBS.length : Number(requested);
      state.practiceMode = $('modeSelect').value;
      state.mistakes = new Map();
      const items = selectVerbs(amount, state.practiceMode)
        .map(verb => ({verb, mode: chooseMode(verb, state.practiceMode)}));
      beginRun(items, false);
    }
    function startReview() {
      if (!state.mistakes.size) return;
      state.reviewStartCount = state.mistakes.size;
      const items = shuffle([...state.mistakes.values()].map(m => ({verb: m.verb, mode: m.mode})));
      beginRun(items, true);
    }
    function renderQuestion() {
      stopTimer(); state.answered = false;
      window.scrollTo({top: 0, behavior: 'auto'});
      const item = state.questions[state.index];
      item.question = makeQuestion(item);
      const question = item.question;
      const completed = state.index / state.questions.length * 100;
      $('questionCounter').textContent = `${state.isReview ? 'Review' : 'Question'} ${state.index + 1} of ${state.questions.length}`;
      $('progressLabel').textContent = `${Math.round(completed)}% complete`;
      $('progressFill').style.width = `${completed}%`;
      $('progressTrack').setAttribute('aria-valuenow', Math.round(completed));
      $('pointsLabel').textContent = `${state.points} pts`;
      $('streakLabel').textContent = `${state.streak} streak`;
      $('questionType').textContent = question.type;
      $('questionTitle').textContent = question.title;
      $('questionWord').textContent = question.context ? question.word : nice(question.word);
      $('questionWord').classList.toggle('context-word', question.context);
      $('questionSubtitle').textContent = question.subtitle;
      $('feedback').hidden = true;
      $('difficultyFeedback').hidden = true;
      replay($('questionArea'), 'swap');
      $('nextButton').hidden = true;
      $('answers').replaceChildren();
      question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'answer';
        button.style.setProperty('--i', index);
        button.dataset.answer = option;
        const letter = document.createElement('span');
        letter.className = 'letter';
        letter.textContent = String.fromCharCode(65 + index);
        const label = document.createElement('span');
        label.className = 'answer-label'; label.textContent = nice(option);
        button.append(letter, label);
        button.addEventListener('click', () => submitAnswer(option));
        $('answers').append(button);
      });
      $('timerRow').hidden = state.timeLimit === 0;
      if (state.timeLimit > 0) startTimer();
    }
    function submitAnswer(selected) {
      if (state.answered) return;
      state.answered = true; stopTimer();
      const q = state.questions[state.index].question;
      const isCorrect = selected === q.correctAnswer;
      const ranOut = selected === null;
      const mistakeKey = `${q.verb.base}:${q.mode}`;
      if (isCorrect) {
        state.correct++; state.streak++;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        state.points += 10 + Math.max(0, q.level - 1) * 2 + (state.streak >= 3 ? 2 : 0);
        if (state.isReview) state.mistakes.delete(mistakeKey);
      } else {
        state.streak = 0;
        state.mistakes.set(mistakeKey, {
          verb: q.verb, mode: q.mode, selected: selected ?? 'Time expired',
          correct: q.correctAnswer, title: q.title
        });
      }
      registerAnswer(q.verb, q.mode, isCorrect, q.level);
      [...$('answers').children].forEach(button => {
        button.disabled = true;
        if (button.dataset.answer === q.correctAnswer) {
          button.classList.add('correct');
          const mark = document.createElement('span'); mark.className = 'answer-symbol';
          mark.setAttribute('aria-hidden', 'true'); mark.textContent = '✓'; button.append(mark);
        } else if (button.dataset.answer === selected) {
          button.classList.add('incorrect');
          const mark = document.createElement('span'); mark.className = 'answer-symbol';
          mark.setAttribute('aria-hidden', 'true'); mark.textContent = '✕'; button.append(mark);
        }
      });
      $('pointsLabel').textContent = `${state.points} pts`;
      $('streakLabel').textContent = `${state.streak} streak`;
      $('feedback').classList.toggle('bad', !isCorrect);
      if (isCorrect) {
        replay($('pointsLabel'), 'bump');
        if (state.streak > 1) replay($('streakLabel'), 'bump');
      }
      $('feedbackTitle').textContent = isCorrect ? 'Correct! Nice work.'
        : ranOut ? 'Time is up' : 'Almost! Review this one.';
      $('feedbackText').textContent = `${nice(q.verb.base)} → ${nice(q.verb.past)} → ${nice(q.verb.pp)}  ·  ${q.verb.es}`;
      const learningTip = q.level >= 4
        ? q.type.includes('Triple trap')
          ? 'Expert tip: check all three positions; a correct past does not guarantee a correct participle.'
          : q.mode === 'both'
            ? 'Grammar tip: yesterday / last week → simple past; have / has / had → past participle.'
            : 'Watch out: some choices are other forms of the same verb or tempting regularizations.'
        : '';
      $('feedbackNote').textContent = [q.verb.note, learningTip].filter(Boolean).join(' ');
      $('feedbackNote').hidden = !$('feedbackNote').textContent;
      adjustDifficulty(isCorrect);
      $('feedback').hidden = false;
      $('nextButton').textContent = state.index + 1 === state.questions.length
        ? 'See my results →' : 'Next question →';
      $('nextButton').hidden = false;
      if (window.matchMedia('(max-width: 720px)').matches) {
        requestAnimationFrame(() => $('feedback').scrollIntoView({block: 'nearest', behavior: 'smooth'}));
      }
    }
    function nextQuestion() {
      if (!state.answered) return;
      if (state.index + 1 >= state.questions.length) showResults();
      else { state.index++; renderQuestion(); }
    }
    function startTimer() {
      state.deadline = performance.now() + state.timeLimit * 1000;
      $('timerFill').style.width = '100%';
      $('timerRow').classList.remove('urgent');
      $('timerLabel').textContent = `${state.timeLimit} s`;
      state.timerId = window.setInterval(() => {
        if (state.answered) return;
        const remaining = Math.max(0, state.deadline - performance.now());
        const seconds = Math.ceil(remaining / 1000);
        $('timerLabel').textContent = `${seconds} s`;
        $('timerFill').style.width = `${remaining / (state.timeLimit * 1000) * 100}%`;
        $('timerRow').classList.toggle('urgent', seconds <= 5);
        if (remaining <= 0) submitAnswer(null);
      }, 100);
    }
    function stopTimer() {
      if (state.timerId !== null) window.clearInterval(state.timerId);
      state.timerId = null;
    }

    /* ===== 6. RESULTADOS, DOMINIO Y REPASO ===== */
    function renderMistakes() {
      const errors = [...state.mistakes.values()];
      $('mistakesSection').hidden = errors.length === 0;
      $('noMistakes').hidden = errors.length !== 0;
      $('reviewButton').hidden = errors.length === 0;
      $('reviewButton').textContent = `Review ${errors.length} missed ${errors.length === 1 ? 'item' : 'items'}`;
      $('mistakesCount').textContent = `${errors.length} to review`;
      $('mistakesList').replaceChildren();
      const visible = state.expandedMistakes ? errors : errors.slice(0, 5);
      visible.forEach(item => {
        const card = document.createElement('article'); card.className = 'mistake-item';
        const head = document.createElement('div'); head.className = 'mistake-head';
        const name = document.createElement('strong'); name.textContent = nice(item.verb.base);
        const tag = document.createElement('span'); tag.className = 'mistake-tag';
        tag.textContent = item.mode === 'both' ? 'Past + participle' : item.mode === 'participle' ? 'Past participle' : item.mode === 'base' ? 'Base form' : 'Simple past';
        head.append(name, tag);
        const forms = document.createElement('p'); forms.className = 'mistake-forms';
        forms.textContent = `${nice(item.verb.base)} → ${nice(item.verb.past)} → ${nice(item.verb.pp)}`;
        const detail = document.createElement('p'); detail.className = 'mistake-detail';
        detail.textContent = `Your answer: ${nice(item.selected)}  ·  Correct: ${nice(item.correct)}`;
        const skill = modesOf(item.mode).map(mode => `${scoreFor(item.verb, mode)}% ${mode === 'pp' ? 'participle' : mode}`).join(' · ');
        const level = document.createElement('small'); level.textContent = `Mastery: ${skill}`;
        card.append(head, forms, detail, level); $('mistakesList').append(card);
      });
      $('showAllMistakes').hidden = errors.length <= 5;
      $('showAllMistakes').textContent = state.expandedMistakes ? 'Show fewer ↑' : `Show all ${errors.length} ↓`;
    }
    function renderWeakVerbs() {
      const studied = VERBS.filter(verb => MODES.some(mode => attemptFor(verb, mode) > 0));
      studied.sort((a, b) => {
        const avg = verb => MODES.filter(mode => attemptFor(verb, mode) > 0)
          .reduce((sum, mode, _, modes) => sum + scoreFor(verb, mode) / modes.length, 0);
        return avg(a) - avg(b);
      });
      $('weakList').replaceChildren();
      studied.slice(0, 5).forEach(verb => {
        const studiedModes = MODES.filter(mode => attemptFor(verb, mode) > 0);
        const average = Math.round(studiedModes.reduce((sum, mode) => sum + scoreFor(verb, mode), 0) / studiedModes.length);
        const row = document.createElement('div'); row.className = 'weak-item';
        const heading = document.createElement('div'); heading.className = 'weak-heading';
        const name = document.createElement('strong'); name.textContent = nice(verb.base);
        const pct = document.createElement('span'); pct.textContent = `${average}% mastery`;
        heading.append(name, pct);
        const track = document.createElement('div'); track.className = 'mini-progress';
        const fill = document.createElement('div'); fill.style.width = `${average}%`; track.append(fill);
        row.append(heading, track); $('weakList').append(row);
      });
      $('masteryOverview').hidden = studied.length === 0;
      const sum = overallSummary();
      $('totalMastery').textContent = `${sum.formsMastered} mastered forms · ${sum.formsPracticed} practiced · ${sum.verbsPracticed} verbs studied`;
    }
    function showResults() {
      stopTimer(); state.expandedMistakes = false;
      const total = state.questions.length;
      const accuracy = Math.round(state.correct / total * 100);
      let emoji, heading, message;
      if (state.isReview) {
        const cleared = state.reviewStartCount - state.mistakes.size;
        emoji = state.mistakes.size === 0 ? '' : '';
        heading = state.mistakes.size === 0 ? 'All errors reviewed!' : 'Your review is complete!';
        message = `${cleared} of ${state.reviewStartCount} missed items cleared in this review. ${state.mistakes.size ? 'Keep practicing the remaining ones!' : 'Awesome — take on a new challenge!'}`;
      } else if (accuracy >= 90) {
        emoji = ''; heading = 'You are a star!'; message = 'Great accuracy! Can you reach the Expert level next time?';
      } else if (accuracy >= 70) {
        emoji = ''; heading = 'Great job!'; message = 'You are progressing. Review any mistakes to strengthen your memory.';
      } else if (accuracy >= 50) {
        emoji = ''; heading = 'Good progress!'; message = 'Every correction makes the next attempt easier. Review your missed forms.';
      } else {
        emoji = ''; heading = 'Every attempt counts!'; message = 'Work through the mistakes below and try again.';
      }
      $('progressFill').style.width = '100%';
      $('progressTrack').setAttribute('aria-valuenow', '100');
      $('resultEmoji').textContent = emoji;
      $('resultTitle').textContent = heading;
      $('resultMessage').textContent = message;
      $('resultPercent').textContent = `${accuracy}%`;
      $('scoreRing').style.setProperty('--percentage', '0%');
      setTimeout(() => $('scoreRing').style.setProperty('--percentage', `${accuracy}%`), 350);
      if (accuracy >= 70) setTimeout(confetti, 500);
      $('scoreRing').setAttribute('aria-label', `${accuracy}% correct answers`);
      $('resultCorrect').textContent = `${state.correct}/${total}`;
      $('resultPoints').textContent = state.points;
      $('resultStreak').textContent = state.bestStreak;
      $('difficultySummary').textContent = `Highest difficulty: L${state.highestDifficulty} · ${LEVELS[state.highestDifficulty - 1]} / 5`;
      renderMistakes(); renderWeakVerbs(); refreshMasteryBanner();
      showScreen($('resultScreen'));
    }

    /* ===== 7. EVENTOS ===== */
    $('bankCount').textContent = `${VERBS.length} verbs included`;
    refreshMasteryBanner();
    $('exitSoloButton').addEventListener('click', () => {
      if (!window.confirm('Leave this challenge and return to the main menu?')) return;
      stopTimer(); state.answered = true; state.questions = [];
      state.mistakes = new Map(); // El progreso guardado no se borra.
      refreshMasteryBanner(); showScreen($('startScreen'));
    });
    $('startButton').addEventListener('click', startGame);
    $('nextButton').addEventListener('click', nextQuestion);
    $('replayButton').addEventListener('click', startGame);
    $('reviewButton').addEventListener('click', startReview);
    $('settingsButton').addEventListener('click', () => {
      stopTimer(); refreshMasteryBanner(); showScreen($('startScreen'));
    });
    $('showAllMistakes').addEventListener('click', () => {
      state.expandedMistakes = !state.expandedMistakes; renderMistakes();
    });
    document.addEventListener('keydown', event => {
      if ($('gameScreen').hidden || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (!state.answered && /^[1-4]$/.test(event.key)) {
        const button = $('answers').children[Number(event.key) - 1];
        if (button) { event.preventDefault(); button.click(); }
      } else if (state.answered && event.key === 'Enter') {
        event.preventDefault(); nextQuestion();
      }
    });

    /* 4.3.1: las variantes breves ("Dreamt / Dreamed", "Learnt / Learned")
       siguen en 2×2. Solo las opciones que contienen varias formas u oraciones
       necesitan tarjetas de ancho completo, en ambos modos de juego. */
    const applyMobileAnswerLayout = container => {
      const labels = [...container.querySelectorAll('.answer-label')]
        .map(el => el.textContent.trim());
      const hasMultiPartChallenge = labels.some(label =>
        label.includes('→') || label.includes('\n') ||
        label.length > 32 || label.split(/\s+/).length > 5);
      container.classList.toggle('answers-detailed', hasMultiPartChallenge);
    };
    for (const answerId of ['answers', 'onlineAnswers']) {
      const container = $(answerId);
      new MutationObserver(() => applyMobileAnswerLayout(container))
        .observe(container, {childList: true});
    }

