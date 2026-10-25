/* VerbQuest - Jumpscare para nombres ofensivos */
(() => {
  'use strict';

  let overlay = null;
  let audio = null;
  let timer = null;
  let previousFocus = null;

  function close() {
    if (!overlay || overlay.hidden) return;

    window.clearTimeout(timer);
    overlay.hidden = true;

    // Reiniciar el GIF para la siguiente aparicion.
    const image = overlay.querySelector('img');
    image.removeAttribute('src');

    audio.pause();

    try {
      audio.currentTime = 0;
    } catch (_) {}

    previousFocus?.focus?.();
  }

  function ensure() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.id = 'vqJumpscare';
    overlay.className = 'vq-jumpscare';
    overlay.hidden = true;

    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Nombre no permitido');

    overlay.innerHTML = `
      <button
        class="vq-jumpscare__close"
        type="button"
        aria-label="Cerrar susto">
        Cerrar ✕
      </button>

      <div class="vq-jumpscare__content">
        <img
          alt="Freddy Fazbear aparece en pantalla"
          width="200"
          height="113">

        <p>
          Nombre no permitido.
          Respeta las normas de VerbQuest.
        </p>
      </div>
    `;

    document.body.append(overlay);

    overlay.querySelector('button')
      .addEventListener('click', close);

    audio = new Audio('./assets/freddy-jumpscare.mp3');
    audio.preload = 'auto';

    // Volumen moderado para evitar picos excesivos.
    audio.volume = 0.30;
  }

  function show() {
    // Respetar la preferencia de accesibilidad.
    if (
      window.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      ).matches
    ) {
      return;
    }

    ensure();

    if (!overlay.hidden) return;

    previousFocus = document.activeElement;

    overlay.querySelector('img').src =
      './assets/freddy-jumpscare.gif';

    overlay.hidden = false;

    overlay.querySelector('button').focus();

    // Intentar reproducir el sonido desde la accion del usuario.
    // Algunos navegadores pueden impedir la reproduccion.
    try {
      const playback = audio.play();

      if (playback?.catch) {
        playback.catch(() => {});
      }
    } catch (_) {}

    // Cierre automatico.
    timer = window.setTimeout(close, 2300);
  }

  // Permitir cerrar mediante Escape.
  document.addEventListener('keydown', event => {
    if (
      event.key === 'Escape' &&
      overlay &&
      !overlay.hidden
    ) {
      event.preventDefault();
      close();
    }
  });

  // Capturamos el submit ANTES del controlador multijugador.
  // Esto protege Create room (admin) y Join room (jugador).
  document.addEventListener('submit', event => {
    if (event.target?.id !== 'onlineForm') return;

    const policy = window.VerbQuestNamePolicy;

    if (!policy) return;

    const nameInput = document.getElementById('onlineName');
    const outcome = policy.validateName(nameInput.value);

    if (outcome.ok) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const error = document.getElementById('onlineSetupError');

    if (error) {
      error.textContent = outcome.error;
      error.hidden = false;
    }

    if (outcome.code === 'NAME_BLOCKED') {
      show();
    } else {
      nameInput.focus();
    }
  }, true);
})();
