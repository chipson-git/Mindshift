// Shared by the server layout (inline script) and the client ThemeToggle.
export const THEME_STORAGE_KEY = "theme";

/** Inline <head> script: applies the saved theme before the page paints (no flash). */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
