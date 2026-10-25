/* VerbQuest: selector claro/oscuro con persistencia */

(() => {
  "use strict";

  const STORAGE_KEY = "verbquest-theme";
  const root = document.documentElement;

  let toggle = null;

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Permitir el cambio aunque el almacenamiento no funcione
    }
  }

  function systemTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  let currentTheme = getSavedTheme();

  if (currentTheme !== "dark" && currentTheme !== "light") {
    currentTheme = systemTheme();
  }

  function renderTheme() {
    root.setAttribute("data-theme", currentTheme);

    if (!toggle) return;

    const isDark = currentTheme === "dark";

    toggle.textContent = isDark
      ? "☀️ Modo claro"
      : "🌙 Modo oscuro";

    toggle.setAttribute(
      "aria-label",
      isDark ? "Activar modo claro" : "Activar modo oscuro"
    );

    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.title = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  }

  function changeTheme() {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    saveTheme(currentTheme);
    renderTheme();
  }

  function initializeToggle() {
    if (document.getElementById("themeToggle")) return;

    const topbar = document.querySelector(".topbar");

    if (!topbar) {
      console.warn("VerbQuest: no se encontro .topbar");
      return;
    }

    let actions = topbar.querySelector(".theme-actions");

    if (!actions) {
      actions = document.createElement("div");
      actions.className = "theme-actions";

      const tag = topbar.querySelector(".top-tag");

      if (tag) {
        tag.before(actions);
        actions.appendChild(tag);
      } else {
        topbar.appendChild(actions);
      }
    }

    toggle = document.createElement("button");
    toggle.id = "themeToggle";
    toggle.type = "button";
    toggle.className = "theme-toggle";

    toggle.addEventListener("click", changeTheme);

    actions.appendChild(toggle);

    renderTheme();
  }

  // Aplicar preferencia cuanto antes
  renderTheme();

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeToggle,
      { once: true }
    );
  } else {
    initializeToggle();
  }
})();
