'use strict';

/* Biblioteca de desafíos inspirada en la navegación de consolas.
   No modifica la lógica del juego: sincroniza los tres selects ya usados por app.js. */
(() => {
  const rail = document.getElementById('vqGameRail');
  if (!rail) return;

  const modes = [...rail.querySelectorAll('[data-mode]')];
  const nativeMode = document.getElementById('modeSelect');
  const prev = document.getElementById('vqModePrev');
  const next = document.getElementById('vqModeNext');
  const modeTitle = document.getElementById('vqSelectedMode');
  const modeDescription = document.getElementById('vqModeDescription');
  const summary = document.getElementById('vqSelectionSummary');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const details = {
    mixed: {
      title: 'Mixed Challenge',
      description: 'A balanced mix of base, past and participle forms that adapts as you play.'
    },
    past: {
      title: 'Simple Past',
      description: 'Travel back in time: pick the correct simple past form of every verb.'
    },
    participle: {
      title: 'Past Participle',
      description: 'Master the third form and recognize tricky past participles.'
    },
    base: {
      title: 'Base Form',
      description: 'Work backwards from conjugated verbs to their original base form.'
    }
  };

  const countText = {10: '10 questions', 20: '20 questions', 40: '40 questions', all: 'All verbs'};
  const timerText = {0: 'No time limit', 10: '10 seconds', 15: '15 seconds', 20: '20 seconds'};
  const countSelect = document.getElementById('countSelect');
  const timerSelect = document.getElementById('timerSelect');
  let scrollSelectionSuppressed = false;
  let scrollReleaseTimer;
  let swipeTimer;

  function updateSummary() {
    summary.textContent = `${details[nativeMode.value].title} · ${countText[countSelect.value]} · ${timerText[timerSelect.value]}`;
  }

  function centerTile(tile, behavior = 'smooth') {
    const left = tile.offsetLeft - rail.offsetLeft - (rail.clientWidth - tile.offsetWidth) / 2;
    scrollSelectionSuppressed = true;
    clearTimeout(scrollReleaseTimer);
    rail.scrollTo({left: Math.max(0, left), behavior: prefersReducedMotion.matches ? 'instant' : behavior});
    scrollReleaseTimer = setTimeout(() => { scrollSelectionSuppressed = false; }, 650);
  }

  function selectMode(value, {move = true, focus = false} = {}) {
    const index = modes.findIndex(button => button.dataset.mode === value);
    if (index < 0) return;

    nativeMode.value = value;
    modes.forEach((button, i) => {
      const selected = i === index;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', `${details[button.dataset.mode].title} challenge${selected ? ', selected' : ''}`);
    });
    modeTitle.textContent = details[value].title;
    modeDescription.textContent = details[value].description;
    prev.disabled = index === 0;
    next.disabled = index === modes.length - 1;
    updateSummary();
    nativeMode.dispatchEvent(new Event('change', {bubbles: true}));
    if (move) centerTile(modes[index]);
    if (focus) modes[index].focus({preventScroll: true});
  }

  modes.forEach((button, index) => {
    button.addEventListener('click', () => selectMode(button.dataset.mode));
    button.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const selectedIndex = modes.findIndex(item => item.dataset.mode === nativeMode.value);
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? modes.length - 1
        : Math.min(modes.length - 1, Math.max(0, (selectedIndex < 0 ? index : selectedIndex) + (event.key === 'ArrowRight' ? 1 : -1)));
      selectMode(modes[target].dataset.mode, {focus: true});
    });
  });

  prev.addEventListener('click', () => {
    const index = modes.findIndex(button => button.dataset.mode === nativeMode.value);
    selectMode(modes[Math.max(0, index - 1)].dataset.mode, {focus: true});
  });
  next.addEventListener('click', () => {
    const index = modes.findIndex(button => button.dataset.mode === nativeMode.value);
    selectMode(modes[Math.min(modes.length - 1, index + 1)].dataset.mode, {focus: true});
  });

  // Al deslizar la biblioteca en un celular, la tarjeta más cercana al centro queda elegida.
  rail.addEventListener('scroll', () => {
    if (scrollSelectionSuppressed) return;
    clearTimeout(swipeTimer);
    swipeTimer = setTimeout(() => {
      const center = rail.getBoundingClientRect().left + rail.clientWidth / 2;
      const nearest = modes.reduce((best, button) => {
        const rect = button.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - center);
        return distance < best.distance ? {button, distance} : best;
      }, {button: modes[0], distance: Infinity}).button;
      if (nearest.dataset.mode !== nativeMode.value) selectMode(nearest.dataset.mode, {move: false});
    }, 170);
  }, {passive: true});

  for (const group of document.querySelectorAll('.vq-pick-group[data-select]')) {
    const nativeSelect = document.getElementById(group.dataset.select);
    const choices = [...group.querySelectorAll('[data-value]')];
    function selectChoice(value, focus = false) {
      if (!choices.some(button => button.dataset.value === value)) return;
      nativeSelect.value = value;
      choices.forEach(button => {
        const selected = button.dataset.value === value;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      nativeSelect.dispatchEvent(new Event('change', {bubbles: true}));
      updateSummary();
      if (focus) choices.find(button => button.dataset.value === value).focus();
    }
    choices.forEach((button, i) => {
      button.addEventListener('click', () => selectChoice(button.dataset.value));
      button.addEventListener('keydown', event => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const destination = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1
          : Math.max(0, Math.min(choices.length - 1, i + (event.key === 'ArrowRight' ? 1 : -1)));
        selectChoice(choices[destination].dataset.value, true);
      });
    });
    nativeSelect.addEventListener('change', () => {
      choices.forEach(button => {
        const selected = button.dataset.value === nativeSelect.value;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      updateSummary();
    });
    selectChoice(nativeSelect.value);
  }

  selectMode(nativeMode.value, {move: false});
  nativeMode.addEventListener('change', () => {
    if (modeTitle.textContent !== details[nativeMode.value]?.title) selectMode(nativeMode.value, {move: false});
  });
})();
