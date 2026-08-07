/** localStorage key holding the reader's explicit colour-scheme choice. */
export const storageKey = 'docs-kit:color-scheme';

/**
 * Inline script for `app.html`.
 *
 * It runs before first paint and applies the stored choice, so switching schemes never
 * flashes the wrong colours. Without a stored choice the CSS media query decides.
 */
export const themeScript = `(function(){try{var v=localStorage.getItem('${storageKey}');if(v==='light'||v==='dark'){document.documentElement.setAttribute('data-theme',v)}}catch(e){}})()`;
