export const COLOR_MODE_KEY = "color-mode";

// Runs in <head> before the page paints, so a saved choice never flashes the other mode.
// Without a saved choice the CSS follows the system setting
export const COLOR_MODE_SCRIPT = `try{var m=localStorage.getItem(${JSON.stringify(
  COLOR_MODE_KEY
)});if(m==="light"||m==="dark")document.documentElement.dataset.colorMode=m}catch(e){}`;
