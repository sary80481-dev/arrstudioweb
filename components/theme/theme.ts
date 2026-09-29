export type Theme = "dark" | "light";

export const THEME_KEY = "theme";

/** Inline script untuk <head>: pakai pilihan tersimpan, fallback ke preferensi sistem. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="dark"&&t!=="light"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  // warna memudar pelan saat ganti tema, lalu kelasnya dilepas agar hover tetap responsif
  root.classList.add("theme-fade");
  window.setTimeout(() => root.classList.remove("theme-fade"), 450);
  root.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}
