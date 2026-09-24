/**
 * True when the wizard is running inside the linemaster.com page (the
 * WordPress shortcode renders #lm-wizard-root), as opposed to the standalone
 * GitHub Pages site. The live site loads the regular GitHub Pages build, so
 * this is detected from the DOM at runtime rather than from the
 * __LM_EMBED_MODE__ build flag. The host page already supplies the page
 * title, branding and light theme, so embedded mode drops the app's own.
 */
export const ON_SITE =
  typeof document !== 'undefined' && !!document.getElementById('lm-wizard-root');
